import { settlementDao } from "../dao/settlement.dao";
import { userDao } from "../dao/user.dao";
import { IUpdateSettlementStatusSchema } from "@expense-tracker/shared/validationSchema";
import { appEmitter, EVENTS } from "../utils/emitter.util";
import { SETTLEMENT_STATUS } from "@expense-tracker/shared";

async function updateStatus(
  id: string,
  data: IUpdateSettlementStatusSchema["body"] & { reviewedBy?: string },
) {
  return await settlementDao.updateSettlementStatus(id, data.status, {
    proofImage: data.proofImage,
    reviewedBy: data.reviewedBy,
  });
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
  const result = await settlementDao.settleBulk(
    groupId,
    fromUserId,
    toUserId,
    proofImage,
  );

  // If proof is uploaded, notify the receiver
  if (proofImage && result) {
    try {
      const [payer, receiver] = await Promise.all([
        userDao.findById(result.from_user_id),
        userDao.findById(result.to_user_id),
      ]);

      if (payer && receiver) {
        appEmitter.emit(EVENTS.EMAIL.SETTLEMENT_UPLOADED, {
          receiverEmail: receiver.email,
          receiverName: receiver.full_name,
          payerName: payer.full_name,
          amount: result.amount,
          currency: "NPR", // Default currency for now
        });
      }
    } catch (error) {
      console.error("Error emitting settlement uploaded event:", error);
    }
  }

  return result;
}

async function confirmBulk(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  confirmedBy: string,
) {
  const result = await settlementDao.confirmBulk(
    groupId,
    fromUserId,
    toUserId,
    confirmedBy,
  );

  // If confirmed, notify the payer
  if (result && result.status === SETTLEMENT_STATUS.CONFIRMED) {
    try {
      const [payer, receiver] = await Promise.all([
        userDao.findById(result.from_user_id),
        userDao.findById(result.to_user_id),
      ]);

      if (payer && receiver) {
        appEmitter.emit(EVENTS.EMAIL.SETTLEMENT_CONFIRMED, {
          payerEmail: payer.email,
          payerName: payer.full_name,
          receiverName: receiver.full_name,
          amount: result.amount,
          currency: "NPR",
        });
      }
    } catch (error) {
      console.error("Error emitting settlement confirmed event:", error);
    }
  }

  return result;
}

export const settlementService = {
  updateStatus,
  getGroupBalances,
  settleBulk,
  confirmBulk,
};
