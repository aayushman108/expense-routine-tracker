import { groupDao } from "../dao/group.dao";
import { db } from "../database/db";
import { BaseError } from "../utils/baseError.util";
import { HttpStatusCode } from "../enums/statusCode.enum";
import {
  IAddMemberInput,
  ICreateGroupInput,
  IUpdateGroupInput,
} from "@expense-tracker/shared/validationSchema";
import { BadRequestError, ForbiddentError, NotFoundError } from "src/utils";

export interface IAddMember extends IAddMemberInput {
  adminId: string;
  groupId: string;
}

const createGroup = async (userId: string, data: ICreateGroupInput) => {
  const group = await groupDao.createGroup({
    name: data.name,
    description: data.description,
    image: data.image,
    created_by: userId,
  });

  return group;
};

const getMyGroups = async (userId: string) => {
  return await groupDao.findByUserId(userId);
};

const getGroupDetails = async (groupId: string, userId: string) => {
  const isMember = await groupDao.isMember(groupId, userId);
  if (!isMember) {
    throw new BaseError(
      HttpStatusCode.FORBIDDEN,
      "You are not a member of this group",
    );
  }

  const group = await groupDao.getGroupWithMembers(groupId);
  if (!group) {
    throw new BaseError(HttpStatusCode.NOT_FOUND, "Group not found");
  }

  return group;
};

const updateGroup = async (
  groupId: string,
  userId: string,
  updates: IUpdateGroupInput,
) => {
  const role = await groupDao.getMemberRole(groupId, userId);
  if (role !== "admin") {
    throw new ForbiddentError("Only admins can update group details");
  }

  const updatedGroup = await groupDao.updateGroup(groupId, updates);
  if (!updatedGroup) {
    throw new NotFoundError("Group not found");
  }
  return updatedGroup;
};

const addMember = async (data: IAddMember) => {
  const memberRole = await groupDao.getMemberRole(data.groupId, data.adminId);
  if (memberRole !== "admin") {
    throw new ForbiddentError("Only admins can add members");
  }

  const alreadyMember = await groupDao.isMember(data.groupId, data.newMemberId);
  if (alreadyMember) {
    throw new BadRequestError("User is already a member of this group");
  }

  return await groupDao.addMember({
    group_id: data.groupId,
    nickname: data.nickname,
    user_id: data.newMemberId,
    role: data.role || "member",
  });
};

const leaveGroup = async (groupId: string, userId: string) => {
  const isMember = await groupDao.isMember(groupId, userId);
  if (!isMember) {
    throw new BaseError(
      HttpStatusCode.BAD_REQUEST,
      "You are not a member of this group",
    );
  }

  // Check if user is the last admin
  const members = await groupDao.getMembers(groupId);
  const admins = members.filter((m: any) => m.role === "admin");
  const userMember = members.find((m: any) => m.user_id === userId);

  if (userMember?.role === "admin" && admins.length === 1) {
    throw new BaseError(
      HttpStatusCode.BAD_REQUEST,
      "You are the last admin. Please appoint another admin before leaving or delete the group.",
    );
  }

  return await groupDao.removeMember(groupId, userId);
};

export const groupService = {
  createGroup,
  getMyGroups,
  getGroupDetails,
  updateGroup,
  addMember,
  leaveGroup,
};
