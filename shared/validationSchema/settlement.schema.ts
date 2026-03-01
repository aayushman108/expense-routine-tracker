import { z } from "zod";
import { SETTLEMENT_STATUS } from "../enum/general.enum";

export const updateSettlementStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid settlement ID"),
  }),
  body: z
    .object({
      status: z.enum([SETTLEMENT_STATUS.PENDING, SETTLEMENT_STATUS.PAID]),
      proofImage: z
        .object({
          url: z.string().url("Invalid image URL"),
          publicId: z.string().min(1, "Public ID is required"),
        })
        .optional(),
    })
    .refine(
      (data) => {
        if (data.status === SETTLEMENT_STATUS.PAID && !data.proofImage) {
          return false;
        }
        return true;
      },
      {
        message: "Payment proof is required when marking as paid",
        path: ["proofImage"],
      },
    ),
});

export type IUpdateSettlementStatusSchema = z.infer<
  typeof updateSettlementStatusSchema
>;
