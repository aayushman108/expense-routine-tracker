import { expenseDao } from "../dao/expense.dao";
import { IUpdateSettlementStatusSchema } from "@expense-tracker/shared/validationSchema";

async function updateStatus(
  id: string,
  data: IUpdateSettlementStatusSchema["body"],
) {
  return await expenseDao.updateSettlementStatus(
    id,
    data.status,
    data.proofImage,
  );
}

export const settlementService = {
  updateStatus,
};
