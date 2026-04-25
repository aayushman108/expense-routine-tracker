import { z } from "zod";
import {
  requiredPreprocessor,
  optionalPreprocessor,
  patchPreprocessor,
} from "../utils/validationSchemaPreprocessor";

const imageSchema = z
  .object({
    url: z.string().url({ message: "Invalid image URL" }),
    publicId: z.string().min(1, { message: "Public ID is required" }),
  })
  .nullable();

export class GroupValidation {
  static createGroupSchema = z.object({
    body: z.object({
      name: z.preprocess(
        requiredPreprocessor,
        z
          .string({ message: "Group name is required" })
          .min(1, { message: "Group name is required" })
          .max(255, { message: "Group name must not exceed 255 characters" }),
      ),
      description: z.preprocess(
        optionalPreprocessor,
        z
          .string()
          .max(1000, { message: "Description must not exceed 1000 characters" })
          .nullable()
          .optional(),
      ),
      image: z.preprocess(optionalPreprocessor, imageSchema).optional(),
    }),
  });

  static updateGroupSchema = z.object({
    body: z.object({
      name: z.preprocess(
        patchPreprocessor,
        z
          .string()
          .min(1, { message: "Group name cannot be empty" })
          .max(255, { message: "Group name must not exceed 255 characters" })
          .nullable()
          .optional(),
      ),
      description: z.preprocess(
        patchPreprocessor,
        z
          .string()
          .max(1000, { message: "Description must not exceed 1000 characters" })
          .nullable()
          .optional(),
      ),
      image: z.preprocess(patchPreprocessor, imageSchema).optional(),
    }),
  });

  static addMemberSchema = z.object({
    body: z.object({
      newMemberId: z.preprocess(
        requiredPreprocessor,
        z
          .string({ message: "User ID is required" })
          .uuid({ message: "Invalid User ID format" }),
      ),
      nickname: z.preprocess(
        optionalPreprocessor,
        z
          .string()
          .max(100, { message: "Nickname must not exceed 100 characters" })
          .nullable(),
      ),
      role: z.preprocess(
        requiredPreprocessor,
        z.enum(["member", "admin"]).default("member"),
      ),
    }),
  });

  static inviteMemberSchema = z.object({
    body: z.object({
      email: z.preprocess(
        requiredPreprocessor,
        z.string().email({ message: "Invalid email address" }),
      ),
    }),
  });
}

export type ICreateGroupInput = z.infer<
  typeof GroupValidation.createGroupSchema.shape.body
>;
export type IUpdateGroupInput = z.infer<
  typeof GroupValidation.updateGroupSchema.shape.body
>;
export type IAddMemberInput = z.infer<
  typeof GroupValidation.addMemberSchema.shape.body
>;
export type IInviteMemberInput = z.infer<
  typeof GroupValidation.inviteMemberSchema.shape.body
>;
