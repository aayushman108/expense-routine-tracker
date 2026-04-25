import { groupDao } from "../dao/group.dao";
import { db } from "../database/db";
import { BaseError } from "../utils/baseError.util";
import { HttpStatusCode } from "../enums/statusCode.enum";
import {
  IAddMemberInput,
  ICreateGroupInput,
  IInviteMemberInput,
  IUpdateGroupInput,
} from "@expense-tracker/shared/validationSchema";
import { BadRequestError, ForbiddentError, NotFoundError } from "src/utils";
import { authDao } from "../dao/auth.dao";
import { appEmitter, EVENTS } from "../utils/emitter.util";

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

const checkRemovalConstraints = async (groupId: string, userId: string) => {
  const hasUnverified = await groupDao.hasUnverifiedExpenses(groupId);
  const hasPending = await groupDao.hasPendingSettlements(groupId, userId);

  if (hasUnverified || hasPending) {
    throw new BadRequestError(
      "Action blocked. Members can only leave or be removed once:\n" +
        "1. All group expenses are verified.\n" +
        "2. All settlements involving the member are confirmed.",
    );
  }
};

const leaveGroup = async (groupId: string, userId: string) => {
  const isMember = await groupDao.isMember(groupId, userId);
  if (!isMember) {
    throw new BadRequestError("You are not a member of this group");
  }

  await checkRemovalConstraints(groupId, userId);

  // Check if user is the last admin
  const members = await groupDao.getMembers(groupId);
  const admins = members.filter((m: any) => m.role === "admin");
  const userMember = members.find((m: any) => m.user_id === userId);

  if (userMember?.role === "admin" && admins.length === 1) {
    const otherMembersCount = members.length - 1;
    if (otherMembersCount > 0) {
      throw new BadRequestError(
        "You are the last admin. Please promote another member to admin before leaving.",
      );
    }
  }

  return await groupDao.removeMember(groupId, userId);
};

const removeMemberByAdmin = async (
  groupId: string,
  adminId: string,
  targetUserId: string,
) => {
  const adminRole = await groupDao.getMemberRole(groupId, adminId);
  if (adminRole !== "admin") {
    throw new ForbiddentError("Only admins can remove members");
  }

  const targetRole = await groupDao.getMemberRole(groupId, targetUserId);
  if (!targetRole) {
    throw new BadRequestError("Target user is not a member of this group");
  }

  if (targetRole === "admin") {
    throw new BadRequestError(
      "Admins cannot remove other admins. They must demote themselves or leave voluntarily.",
    );
  }

  await checkRemovalConstraints(groupId, targetUserId);

  return await groupDao.removeMember(groupId, targetUserId);
};

const updateMemberRole = async (
  groupId: string,
  adminId: string,
  targetUserId: string,
  role: "admin" | "member",
) => {
  const adminRole = await groupDao.getMemberRole(groupId, adminId);
  if (adminRole !== "admin") {
    throw new ForbiddentError("Only admins can change member roles");
  }

  const targetRole = await groupDao.getMemberRole(groupId, targetUserId);
  if (!targetRole) {
    throw new BadRequestError("User is not a member of this group");
  }

  return await groupDao.setMemberRole(groupId, targetUserId, role);
};

const inviteMember = async (
  groupId: string,
  adminId: string,
  data: IInviteMemberInput,
) => {
  const group = await groupDao.findById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const admin = await authDao.findById(adminId);
  if (!admin) {
    throw new NotFoundError("Admin not found");
  }

  const adminRole = await groupDao.getMemberRole(groupId, adminId);
  if (adminRole !== "admin") {
    throw new ForbiddentError("Only admins can invite members");
  }

  // Optional: Check if the user is already a member if they exist
  const user = await authDao.findByEmail(data.email);
  if (user) {
    const alreadyMember = await groupDao.isMember(groupId, user.id);
    if (alreadyMember) {
      throw new BadRequestError("User is already a member of this group");
    }
  }

  const inviteLink = `${process.env.FRONTEND_URL}/signup?inviteToGroup=${groupId}`;

  appEmitter.emit(EVENTS.EMAIL.INVITE, {
    email: data.email,
    adminName: admin.full_name,
    adminEmail: admin.email,
    groupName: group.name,
    inviteLink,
  });

  return;
};

export const groupService = {
  createGroup,
  getMyGroups,
  getGroupDetails,
  updateGroup,
  addMember,
  leaveGroup,
  removeMemberByAdmin,
  updateMemberRole,
  inviteMember,
};
