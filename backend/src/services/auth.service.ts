import jwt, { Secret } from "jsonwebtoken";

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

interface IRegisterUser {
  username: string;
  email: string;
  password: string;
}

interface ITokenVerificationBody {
  token: string;
  activationCode: string;
}

interface ILoginUser {
  email: string;
  password: string;
}
class AuthService {
  async createEmailVerificationCode(user: IRegisterUser) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign(
      { user, activationCode },
      process.env.EMAIL_VERIFICATION_SECRET as Secret,
      {
        expiresIn: process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY + "m" || "5m",
      }
    );

    return { token, activationCode };
  }

  async signup(user: { username: string; email: string; password: string }) {
    const isExistingUser = await authDao.findByEmail(user.email);
    if (!!isExistingUser) {
      throw new ConflictError("User Already Exists!!");
    }

    const { token, activationCode } = await this.createEmailVerificationCode(
      user
    );

    const info = await sendMail({
      email: user.email,
      subject: "Verify your email",
      template: "emailActivation.ejs",
      data: {
        username: user.username,
        activationCode,
      },
    });

    return { token };
  }

  async verifyEmailVerificationToken(data: ITokenVerificationBody) {
    try {
      const decoded = jwt.verify(
        data.token,
        process.env.EMAIL_VERIFICATION_SECRET as Secret
      ) as { user: IRegisterUser; activationCode: string };

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

  async createUser(user: IRegisterUser) {
    const { username, email, password } = user;
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(user.password, salt);

    const newUser = await authDao.createUser({
      username,
      email,
      hashedPassword,
    });
    return newUser;
  }

  async comparePassword(password: string, hashedpasswordFromDb: string) {
    try {
      return await bcrypt.compare(password, hashedpasswordFromDb);
    } catch (error) {
      throw new UnAuthorizedError("Password is unmatched!!");
    }
  }

  async login(user: ILoginUser) {
    const { email, password } = user;

    const userFromDb = await authDao.findByEmail(email);

    if (!userFromDb) {
      throw new NotFoundError(`User with ${email} is not registered!!`);
    }

    await this.comparePassword(password, userFromDb.password_hash);

    return userFromDb;
  }

  async refreshAccessToken(refreshToken: string) {
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

  async logout(refreshToken: string) {
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

  async uploadAvatar(userId: string, filePath: string) {
    try {
      const user = await authDao.findById(userId);

      // If the user already has an avatar, delete it from Cloudinary
      if (user?.avatar && user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }

      // Upload the new avatar to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: "user_avatars",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });

      console.log(user);

      return {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    } catch (error) {
      throw new Error("Error occur while uploading avatar to cloudinary!!");
    }
  }

  async updateProfile(
    userId: string,
    payload: {
      username?: string;
      email?: string;
      avatar?: { url: string; public_id: string };
    }
  ) {
    const updatedUser = await authDao.updateProfile(userId, payload);

    return updatedUser;
  }
}

export const authService = new AuthService();
