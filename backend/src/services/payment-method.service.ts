import { paymentMethodDao } from "../dao/payment-method.dao";
import { NotFoundError } from "../utils";

const getByUserId = async (userId: string) => {
  return await paymentMethodDao.findByUserId(userId);
};

const create = async (
  userId: string,
  data: {
    provider: string;
    metadata?: Record<string, unknown>;
    isDefault?: boolean;
  },
) => {
  return await paymentMethodDao.create(userId, data);
};

const update = async (
  id: string,
  userId: string,
  data: {
    provider?: string;
    metadata?: Record<string, unknown>;
    isDefault?: boolean;
    isVerified?: boolean;
  },
) => {
  const existing = await paymentMethodDao.findById(id, userId);
  if (!existing) {
    throw new NotFoundError("Payment method not found");
  }
  return await paymentMethodDao.update(id, userId, data);
};

const remove = async (id: string, userId: string) => {
  const existing = await paymentMethodDao.findById(id, userId);
  if (!existing) {
    throw new NotFoundError("Payment method not found");
  }
  return await paymentMethodDao.remove(id, userId);
};

export const paymentMethodService = {
  getByUserId,
  create,
  update,
  remove,
};
