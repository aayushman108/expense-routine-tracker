import { Router } from "express";
import { validateRequest } from "../middlewares";
import { updateSettlementStatusSchema } from "@expense-tracker/shared/validationSchema";
import { settlementController } from "../controllers";

const router = Router();

router.patch(
  "/:id/status",
  validateRequest(updateSettlementStatusSchema),
  settlementController.updateStatus,
);

export { router as settlementRouter };
