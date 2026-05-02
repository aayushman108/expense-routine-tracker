import { Request, Response } from "express";
import { settlementService } from "../services";
import { sendSuccessResponse } from "../utils/successResponseHandler.utils";
import { asyncHandler } from "../utils/asyncHandler";
import { BaseError } from "../utils/baseError.util";
import { HttpStatusCode } from "../enums/statusCode.enum";
import { SETTLEMENT_STATUS } from "@expense-tracker/shared";

const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Build proof image from uploaded file if present
  const file = req.file as any;
  const proofImage = file
    ? { url: file.path, publicId: file.filename }
    : req.body.proofImage;

  const payload = {
    status,
    proofImage,
    reviewedBy:
      status === SETTLEMENT_STATUS.CONFIRMED ||
      status === SETTLEMENT_STATUS.REJECTED
        ? (req.userId as string)
        : undefined,
  };

  const result = await settlementService.updateStatus(id, payload);
  return sendSuccessResponse(res, {
    message: "Settlement updated successfully",
    data: result,
  });
});

const getGroupBalances = asyncHandler(async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const result = await settlementService.getGroupBalances(groupId);
  return sendSuccessResponse(res, {
    message: "Group balances fetched successfully",
    data: result,
  });
});

const settleBulk = asyncHandler(async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { fromUserId, toUserId } = req.body;

  if (!req.file) {
    throw new BaseError(
      HttpStatusCode.BAD_REQUEST,
      "Proof of payment image is compulsory for settlement.",
    );
  }

  const file = req.file as any;
  const proofImage = {
    url: file.path,
    publicId: file.filename,
  };

  const result = await settlementService.settleBulk(
    groupId,
    fromUserId,
    toUserId,
    proofImage,
  );
  return sendSuccessResponse(res, {
    message: "Bulk settlement completed successfully",
    data: result,
  });
});

export const settlementController = {
  updateStatus,
  getGroupBalances,
  settleBulk,
};
