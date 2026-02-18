import { userDao } from "../dao";

const searchUser = async (
  query: string,
  currentUserId: string,
  limit: number = 10,
) => {
  return await userDao.findByEmailOrName(query, currentUserId, limit);
};

export const userService = {
  searchUser,
};
