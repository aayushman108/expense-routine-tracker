import { Router } from "express";
import { validateRequest } from "../middlewares";
import { updateSettlementStatusSchema } from "@expense-tracker/shared/validationSchema";
import { settlementController } from "../controllers";
import { uploadMiddleware } from "../middlewares";

const router = Router();
const upload = uploadMiddleware("settlements");

router.patch(
  "/:id/status",
  upload.single("proofImage"),
  validateRequest(updateSettlementStatusSchema),
  settlementController.updateStatus,
);

router.get("/group/:groupId/balances", settlementController.getGroupBalances);

router.post(
  "/group/:groupId/settle-bulk",
  upload.single("proofImage"),
  settlementController.settleBulk,
);

export { router as settlementRouter };
