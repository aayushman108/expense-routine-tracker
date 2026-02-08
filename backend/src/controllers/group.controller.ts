import { Request, Response } from "express";
import { groupService } from "../services/group.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccessResponse } from "../utils/successResponseHandler.utils";

const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await groupService.createGroup(req.userId!, req.body);
  return sendSuccessResponse(res, {
    data: group,
    message: "Group created successfully",
    statusCode: 201,
  });
});

const getMyGroups = asyncHandler(async (req: Request, res: Response) => {
  const groups = await groupService.getMyGroups(req.userId!);
  return sendSuccessResponse(res, {
    data: groups,
    message: "Groups fetched successfully",
  });
});

const getGroupDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const group = await groupService.getGroupDetails(id, req.userId!);
  return sendSuccessResponse(res, {
    data: group,
    message: "Group details fetched successfully",
  });
});

const updateGroup = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const group = await groupService.updateGroup(id, req.userId!, req.body);
  return sendSuccessResponse(res, {
    data: group,
    message: "Group updated successfully",
  });
});

const addMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newMemberId, role } = req.body;
  const payload = {
    newMemberId,
    role,
    groupId: id,
    adminId: req.userId!,
  };
  const member = await groupService.addMember(payload);
  return sendSuccessResponse(res, {
    data: member,
    message: "Member added successfully",
    statusCode: 201,
  });
});

const leaveGroup = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await groupService.leaveGroup(id, req.userId!);
  return sendSuccessResponse(res, {
    message: "Left group successfully",
  });
});

export const groupController = {
  createGroup,
  getMyGroups,
  getGroupDetails,
  updateGroup,
  addMember,
  leaveGroup,
};
