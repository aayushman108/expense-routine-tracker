import jwt, { Secret } from "jsonwebtoken";
import fs from "fs";

import bcrypt from "bcrypt";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnAuthorizedError,
} from "../utils";
import { appEmitter, EVENTS } from "../utils/emitter.util";
import { authDao, notificationDao } from "../dao";
import { jwtService } from "./jwt.service";
import { v2 as cloudinary } from "cloudinary";
import {
  ILoginInput,
  ISignupInput,
  IForgotPasswordInput,
  IResetPasswordInput,
  IChangePasswordInput,
} from "@expense-tracker/shared/validationSchema";
import { ENV } from "../constants";

interface ITokenVerificationBody {
  token: string;
  activationCode: string;
}

interface ILoginUser extends ILoginInput {}

async function createEmailVerificationCode(user: ISignupInput) {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const token = jwt.sign(
    { user, activationCode },
    ENV.EMAIL_VERIFICATION_SECRET as Secret,
    {
      expiresIn: (ENV.EMAIL_VERIFICATION_TOKEN_EXPIRY ||
        "5m") as jwt.SignOptions["expiresIn"],
    },
  );

  return { token, activationCode };
}

async function signup(user: ISignupInput) {
  const isExistingUser = await authDao.findByEmail(user.email);
  if (!!isExistingUser) {
    throw new ConflictError("User Already Exists!!");
  }

  const { token, activationCode } = await createEmailVerificationCode(user);

  appEmitter.emit(EVENTS.EMAIL.SIGNUP, {
    email: user.email,
    fullName: user.fullName,
    activationCode,
  });

  return { token };
}

async function verifyEmailVerificationToken(data: ITokenVerificationBody) {
  try {
    const decoded = jwt.verify(
      data.token,
      ENV.EMAIL_VERIFICATION_SECRET as Secret,
    ) as { user: ISignupInput; activationCode: string };

    if (!decoded.user || !decoded.activationCode) {
      throw new UnAuthorizedError("Unauthorized: Invalid token");
    }

    if (decoded.activationCode === data.activationCode) {
      return { user: decoded.user };
    } else {
      throw new UnAuthorizedError("Unauthorized: Unmatched activation code");
    }
  } catch (error) {
    throw new UnAuthorizedError("Unauthorized: Invalid token");
  }
}

async function createUser(user: ISignupInput) {
  const { password } = user;
  const salt = await bcrypt.genSalt(10);

  const passwordHash = await bcrypt.hash(password, salt);

  const secureUser = {
    ...user,
    password: passwordHash,
  };

  const newUser = await authDao.createUser(secureUser);
  return newUser;
}

async function comparePassword(password: string, hashedpasswordFromDb: string) {
  try {
    const isPasswordMatched = await bcrypt.compare(
      password,
      hashedpasswordFromDb,
    );
    if (!isPasswordMatched) {
      throw new UnAuthorizedError("Password is unmatched!!");
    }
    return isPasswordMatched;
  } catch (error) {
    throw new UnAuthorizedError("Password is unmatched!!");
  }
}

async function login(user: ILoginUser) {
  const { email, password } = user;

  const userFromDb = await authDao.findByEmail(email);

  if (!userFromDb) {
    throw new NotFoundError(`User with ${email} is not registered!!`);
  }

  await comparePassword(password, userFromDb.password_hash);

  return userFromDb;
}

async function googleLogin(payload: {
  email: string;
  fullName: string;
  googleId: string;
  avatarUrl?: string;
}) {
  const { email, fullName, googleId, avatarUrl } = payload;

  let user = await authDao.findByGoogleId(googleId);

  if (!user) {
    const existingUser = await authDao.findByEmail(email);
    if (existingUser) {
      await authDao.updateProfile(existingUser.id, {
        google_id: googleId,
      } as any);
      user = (await authDao.findById(existingUser.id)) as any;
    } else {
      const avatar = avatarUrl ? { url: avatarUrl, publicId: "" } : null;
      user = (await authDao.createUser({
        email,
        fullName,
        password: "",
        avatar,
        googleId,
      } as any)) as any;
    }
  }

  return user;
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const decoded = jwtService.verifyRefreshToken(refreshToken) as {
      id: string;
    };
    if (!decoded?.id) {
      throw new UnAuthorizedError("Unauthorized: Invalid Refresh Token");
    }

    const user = await authDao.findById(decoded.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const accessToken = jwtService.generateAccessToken(user);
    return { accessToken, user: { ...user, password_hash: undefined } };
  } catch (error) {
    throw new UnAuthorizedError("Invalid or expired refresh token.");
  }
}

async function logout(refreshToken: string) {
  try {
    const decoded = jwtService.verifyRefreshToken(refreshToken) as {
      id: string;
    };

    if (!decoded?.id) {
      throw new UnAuthorizedError("Unauthorized: Invalid Refresh Token");
    }

    const user = await authDao.findById(decoded.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }
  } catch (error) {
    throw new UnAuthorizedError("Error while logging out!!");
  }
}

async function uploadAvatar(userId: string, filePath: string) {
  try {
    const user = await authDao.findById(userId);

    if (user?.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: ENV.CLOUD_AVATAR_FOLDER,
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    const avatar = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    const updatedUser = await authDao.updateProfile(userId, { avatar });

    // Remove the temporary local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return updatedUser;
  } catch (error) {
    // Cleanup on error if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error("Failed to upload avatar to Cloudinary");
  }
}

async function updateProfile(userId: string, payload: Partial<ISignupInput>) {
  const { email, password, ...safePayload } = payload;
  const updatedUser = await authDao.updateProfile(userId, safePayload);
  return updatedUser;
}

async function forgotPassword(payload: IForgotPasswordInput) {
  const user = await authDao.findByEmail(payload.email);
  if (!user) {
    throw new NotFoundError("No user found with this email address.");
  }

  const resetToken = jwtService.generateForgotPasswordToken(user);

  appEmitter.emit(EVENTS.EMAIL.FORGOT_PASSWORD, {
    email: user.email,
    fullName: user.full_name,
    resetToken,
  });

  return { message: "Password reset link sent to your email." };
}

async function resetPassword(payload: IResetPasswordInput) {
  try {
    const { id } = jwt.decode(payload.token) as { id: string };
    const user = await authDao.findById(id);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    jwtService.verifyForgotPasswordToken(payload.token, user);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(payload.password, salt);

    await authDao.updateProfile(user.id, { password: passwordHash });

    return { message: "Password reset successful. You can now login." };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new UnAuthorizedError("Invalid or expired reset token.");
  }
}

async function changePassword(userId: string, payload: IChangePasswordInput) {
  const user = await authDao.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  await comparePassword(payload.oldPassword, user.password_hash);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(payload.newPassword, salt);

  await authDao.updateProfile(userId, { password: passwordHash });

  return { message: "Password changed successfully." };
}

async function getMe(userId: string) {
  const user = await authDao.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  return {
    ...user,
    password_hash: undefined,
  };
}

export const authService = {
  signup,
  verifyEmailVerificationToken,
  createUser,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
  getMe,
  uploadAvatar,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
};
