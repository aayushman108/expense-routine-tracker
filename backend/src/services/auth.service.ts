import jwt, { Secret } from "jsonwebtoken";
import fs from "fs";

import bcrypt from "bcrypt";
import {
  ConflictError,
  NotFoundError,
  sendMail,
  UnAuthorizedError,
} from "../utils";
import { authDao } from "../dao";
import { jwtService } from "./jwt.service";
import { v2 as cloudinary } from "cloudinary";
import {
  ILoginInput,
  ISignupInput,
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
      expiresIn: ENV.EMAIL_VERIFICATION_TOKEN_EXPIRY || "5m",
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

  const info = await sendMail({
    email: user.email,
    subject: "Verify your email",
    template: "emailActivation.ejs",
    data: {
      username: user.fullName,
      activationCode,
    },
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
    return await bcrypt.compare(password, hashedpasswordFromDb);
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

    return jwtService.generateAccessToken(user);
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

    // If the user already has an avatar in Cloudinary, delete it
    if (user?.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    // Upload the new avatar to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: ENV.CLOUD_AVATAR_FOLDER,
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    // Update the database with the new avatar object
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
  const updatedUser = await authDao.updateProfile(userId, payload);
  return updatedUser;
}

export const authService = {
  signup,
  verifyEmailVerificationToken,
  createUser,
  login,
  refreshAccessToken,
  logout,
  uploadAvatar,
  updateProfile,
};
