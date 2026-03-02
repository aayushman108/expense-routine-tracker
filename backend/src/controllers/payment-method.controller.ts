import { Request, Response } from "express";
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
  sendSuccessResponse,
} from "../utils";
import { paymentMethodService } from "../services/payment-method.service";
import { HttpStatusCode } from "../enums/statusCode.enum";

const getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new NotFoundError("User ID not found in request");

  const paymentMethods = await paymentMethodService.getByUserId(userId);

  return sendSuccessResponse(res, {
    message: "Payment methods fetched successfully",
    data: { paymentMethods },
    statusCode: HttpStatusCode.OK,
  });
});

const createPaymentMethod = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) throw new NotFoundError("User ID not found in request");

    const { provider, metadata, isDefault } = req.body;

    if (!provider) {
      throw new BadRequestError("Provider is required");
    }

    const paymentMethod = await paymentMethodService.create(userId, {
      provider,
      metadata,
      isDefault,
    });

    return sendSuccessResponse(res, {
      message: "Payment method created successfully",
      data: { paymentMethod },
      statusCode: HttpStatusCode.CREATED,
    });
  },
);

const updatePaymentMethod = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) throw new NotFoundError("User ID not found in request");

    const { id } = req.params;
    const { provider, metadata, isDefault, isVerified } = req.body;

    const paymentMethod = await paymentMethodService.update(id, userId, {
      provider,
      metadata,
      isDefault,
      isVerified,
    });

    return sendSuccessResponse(res, {
      message: "Payment method updated successfully",
      data: { paymentMethod },
      statusCode: HttpStatusCode.OK,
    });
  },
);

const deletePaymentMethod = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) throw new NotFoundError("User ID not found in request");

    const { id } = req.params;

    await paymentMethodService.remove(id, userId);

    return sendSuccessResponse(res, {
      message: "Payment method deleted successfully",
      statusCode: HttpStatusCode.OK,
    });
  },
);

export const paymentMethodController = {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};
