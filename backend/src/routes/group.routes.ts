import { Router, Request, Response, NextFunction } from "express";
import { uploadMiddleware, validateRequest } from "../middlewares";
import { GroupValidation } from "@expense-tracker/shared/validationSchema";
import { groupController } from "../controllers/group.controller";

const router = Router();
const upload = uploadMiddleware("groups");

/**
 * Bridge middleware to map Multer's req.file (Cloudinary)
 * to req.body.image for Zod validation.
 */
const mapFileToBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    req.body.image = {
      url: (req.file as any).path,
      publicId: (req.file as any).filename, // CloudinaryStorage uses filename as public_id
    };
  }
  next();
};

router.post(
  "/",
  upload.single("image"),
  mapFileToBody,
  validateRequest(GroupValidation.createGroupSchema),
  groupController.createGroup,
);

router.get("/", groupController.getMyGroups);

router.get("/:id", groupController.getGroupDetails);

router.put(
  "/:id",
  upload.single("image"),
  mapFileToBody,
  validateRequest(GroupValidation.updateGroupSchema),
  groupController.updateGroup,
);

router.post(
  "/:id/members",
  validateRequest(GroupValidation.addMemberSchema),
  groupController.addMember,
);

router.post(
  "/:id/invite",
  validateRequest(GroupValidation.inviteMemberSchema),
  groupController.inviteMember,
);

router.delete("/:id/leave", groupController.leaveGroup);

export { router as groupRouter };
