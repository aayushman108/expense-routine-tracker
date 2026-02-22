import { settlementDao } from "../dao/settlement.dao";
import { IUpdateSettlementStatusSchema } from "@expense-tracker/shared/validationSchema";

async function updateStatus(
  id: string,
  data: IUpdateSettlementStatusSchema["body"],
) {
  return await settlementDao.updateSettlementStatus(
    id,
    data.status,
    data.proofImage,
  );
}

async function getGroupBalances(groupId: string) {
  return await settlementDao.getGroupBalances(groupId);
}

async function settleBulk(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  proofImage?: { url: string; publicId: string } | null,
) {
  return await settlementDao.settleBulk(
    groupId,
    fromUserId,
    toUserId,
    proofImage,
  );
}

async function confirmBulk(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  confirmedBy: string,
) {
  return await settlementDao.confirmBulk(
    groupId,
    fromUserId,
    toUserId,
    confirmedBy,
  );
}

export const settlementService = {
  updateStatus,
  getGroupBalances,
  settleBulk,
  confirmBulk,
};
