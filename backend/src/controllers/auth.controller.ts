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
import { ILoginInput, ISignupInput } from "../schema/auth.schema";
import { keysToSnakeCase } from "../utils/caseConverter";

const cookieOptions = {
  httpOnly: true,
  // sameSite: "none",
  // secure: true,
};

const signup = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const data = await authService.signup(req.body as ISignupInput);

    return sendSuccessResponse(res, {
      message: "Please check your email to register.",
      data,
      statusCode: HttpStatusCode.CREATED,
    });
  },
);

const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { user } = await authService.verifyEmailVerificationToken(req.body);
  const createdUser = await authService.createUser(user);

  const modifiedUser = { ...createdUser, password_hash: undefined };

  return sendSuccessResponse(res, {
    message: "You are registered successfully.",
    data: modifiedUser,
    statusCode: HttpStatusCode.CREATED,
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as ILoginInput;

  const user = await authService.login({ email, password });

  const accessToken = jwtService.generateAccessToken(user);

  const refreshToken = jwtService.generateRefreshToken(user);

  res.cookie("jwt", refreshToken, {
    ...cookieOptions,
    maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
  });

  return sendSuccessResponse(res, {
    message: "Successfully logged in",
    data: { ...user, password_hash: undefined, accessToken },
    statusCode: HttpStatusCode.OK,
  });
});

const refresh = asyncHandler(async (req: Request, res: Response) => {
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

const logout = asyncHandler(async (req: Request, res: Response) => {
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
    ...cookieOptions,
  });

  return sendSuccessResponse(res, {
    message: "Successfully logged out.",
    statusCode: HttpStatusCode.OK,
  });
});

const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId as string;

    // Delegate the update logic to the service
    const updatedUser = await authService.updateProfile(
      userId,
      req.body as Partial<ISignupInput>,
    );

    return sendSuccessResponse(res, {
      message: "Profile updated successfully.",
      data: updatedUser,
      statusCode: HttpStatusCode.OK,
    });
  },
);

export const authController = {
  signup,
  verifyEmail,
  login,
  refresh,
  logout,
  updateProfile,
};
