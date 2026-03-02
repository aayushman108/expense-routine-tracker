import { Request, Response } from "express";
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
  sendSuccessResponse,
} from "../utils";
import { userService } from "../services";
import { HttpStatusCode } from "../enums/statusCode.enum";

const searchUser = asyncHandler(async (req: Request, res: Response) => {
  const { query, limit } = req.query;

  if (!query) {
    throw new BadRequestError("Search query is required");
  }

  const currentUserId = req.userId;

  if (!currentUserId) {
    throw new NotFoundError("User ID not found in request");
  }

  const users = await userService.searchUser(
    query as string,
    currentUserId,
    limit ? Number(limit) : undefined,
  );

  return sendSuccessResponse(res, {
    message: "Users fetched successfully",
    data: { users },
    statusCode: HttpStatusCode.OK,
  });
});

const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.userId;
  if (!currentUserId) {
    throw new NotFoundError("User ID not found in request");
  }

  const { id } = req.params;

  const profile = await userService.getUserProfile(id, currentUserId);

  return sendSuccessResponse(res, {
    message: "User profile fetched successfully",
    data: profile,
    statusCode: HttpStatusCode.OK,
  });
});

export const userController = {
  searchUser,
  getUserProfile,
};
