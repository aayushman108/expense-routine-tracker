import { NextFunction, Request, Response } from "express";
import {
  asyncHandler,
  BadRequestError,
  sendSuccessResponse,
  UnAuthorizedError,
} from "../utils";
import { authService } from "../services/auth.service";
import { HttpStatusCode } from "../enums/statusCode.enum";
import { jwtService } from "../services/jwt.service";

class AuthController {
  cookieOptions = {
    httpOnly: true,
    // sameSite: "none",
    // secure: true,
  };
  signup = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { username, email, password } = req.body;

    const data = await authService.signup({ username, email, password });

    return sendSuccessResponse(res, {
      message: "Please check your email to register.",
      data,
      statusCode: HttpStatusCode.CREATED,
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { user } = await authService.verifyEmailVerificationToken(req.body);
    const createdUser = await authService.createUser(user);

    const modifiedUser = { ...createdUser, password_hash: undefined };

    return sendSuccessResponse(res, {
      message: "You are registered successfully.",
      data: modifiedUser,
      statusCode: HttpStatusCode.CREATED,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.login(req.body);

    const accessToken = jwtService.generateAccessToken(user);

    const refreshToken = jwtService.generateRefreshToken(user);

    res.cookie("jwt", refreshToken, {
      ...this.cookieOptions,
      maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
    });

    return sendSuccessResponse(res, {
      message: "Successfully logged in",
      data: { ...user, password_hash: undefined, accessToken },
      statusCode: HttpStatusCode.OK,
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      throw new UnAuthorizedError();
    }

    const refreshToken = cookies.jwt;

    const accessToken = await authService.refreshAccessToken(refreshToken);

    return sendSuccessResponse(res, {
      message: "Token refreshed successfully.",
      data: { accessToken },
      statusCode: HttpStatusCode.OK,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      res
        .status(HttpStatusCode.NO_CONTENT)
        .json({ message: "No content available" });
      return;
    }

    const refreshToken = cookies.jwt;

    await authService.logout(refreshToken);

    res.clearCookie("jwt", {
      ...this.cookieOptions,
    });

    return sendSuccessResponse(res, {
      message: "Successfully logged out.",
      statusCode: HttpStatusCode.OK,
    });
  });

  updateProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log(req.file, "image file");

      const userId = req.userId as string;
      const { username, email } = req.body;

      let avatar: { url: string; public_id: string } | undefined;

      if (req.file) {
        if (!req.file.mimetype.startsWith("image/")) {
          throw new BadRequestError("Only image files are allowed!!");
        }

        avatar = await authService.uploadAvatar(userId, req.file?.path);
      }

      // Prepare the fields to update
      const updates: {
        username?: string;
        email?: string;
        avatar?: { url: string; public_id: string };
      } = {};
      if (username) updates.username = username;
      if (email) updates.email = email;
      if (avatar) updates.avatar = avatar;

      // Delegate the update logic to the service
      const updatedUser = await authService.updateProfile(userId, updates);

      return sendSuccessResponse(res, {
        message: "Profile updated successfully.",
        data: updatedUser,
        statusCode: HttpStatusCode.OK,
      });
    }
  );
}

export const authController = new AuthController();
