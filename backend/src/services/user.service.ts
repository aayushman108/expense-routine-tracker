import { userDao } from "../dao";
import { paymentMethodDao } from "../dao/payment-method.dao";
import { NotFoundError, ForbiddentError } from "../utils";

const searchUser = async (
  query: string,
  currentUserId: string,
  limit: number = 10,
) => {
  return await userDao.findByEmailOrName(query, currentUserId, limit);
};

const getUserProfile = async (targetUserId: string, currentUserId: string) => {
  const targetUser = await userDao.findById(targetUserId);
  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  // If viewing own profile, allow
  if (targetUserId === currentUserId) {
    const paymentMethods = await paymentMethodDao.findByUserId(targetUserId);
    return { user: targetUser, paymentMethods };
  }

  // Otherwise, check if they share a group
  const shared = await userDao.shareGroup(currentUserId, targetUserId);
  if (!shared) {
    throw new ForbiddentError("You can only view profiles of group members");
  }

  const paymentMethods = await paymentMethodDao.findByUserId(targetUserId);
  return { user: targetUser, paymentMethods };
};

export const userService = {
  searchUser,
  getUserProfile,
};
