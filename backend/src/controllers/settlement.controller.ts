import { Request, Response } from "express";
import { settlementService } from "../services";
import { sendSuccessResponse } from "../utils/successResponseHandler.utils";
import { asyncHandler } from "../utils/asyncHandler";

const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await settlementService.updateStatus(id, req.body);
  return sendSuccessResponse(res, {
    message: "Settlement updated successfully",
    data: result,
  });
});

export const settlementController = {
  updateStatus,
};
