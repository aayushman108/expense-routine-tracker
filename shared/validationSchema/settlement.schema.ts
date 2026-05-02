import { z } from "zod";
import { SETTLEMENT_STATUS } from "../enum/general.enum";

export const updateSettlementStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid settlement ID"),
  }),
  body: z.object({
    status: z.enum([
      SETTLEMENT_STATUS.PENDING,
      SETTLEMENT_STATUS.PAID,
      SETTLEMENT_STATUS.CONFIRMED,
      SETTLEMENT_STATUS.REJECTED,
    ]),
    proofImage: z
      .object({
        url: z.string().url("Invalid image URL"),
        publicId: z.string().min(1, "Public ID is required"),
      })
      .optional(),
  }),
});

export type IUpdateSettlementStatusSchema = z.infer<
  typeof updateSettlementStatusSchema
>;
