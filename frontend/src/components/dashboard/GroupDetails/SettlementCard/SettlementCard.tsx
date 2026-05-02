import React from "react";
import styles from "./SettlementCard.module.scss";
import { HiOutlineArrowRight } from "react-icons/hi";
import { SETTLEMENT_STATUS } from "@expense-tracker/shared";
import Button from "@/components/ui/Button/Button";
import type { User } from "@/lib/types";
import { GroupBalanceWithId } from "../SettlementTable/SettlementTable";

interface SettlementCardProps {
  balance: GroupBalanceWithId;
  user: User | null;
  onAction: (balance: GroupBalanceWithId) => void;
}

const SettlementCard: React.FC<SettlementCardProps> = ({
  balance,
  user,
  onAction,
}) => {
  const currentUserId = user?.id?.toLowerCase();
  const fromUserId = balance.from_user_id?.toLowerCase();
  const toUserId = balance.to_user_id?.toLowerCase();

  const isFromUser = fromUserId === currentUserId;
  const isToUser = toUserId === currentUserId;

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      [SETTLEMENT_STATUS.PENDING]: "Pending",
      [SETTLEMENT_STATUS.PAID]: "Awaiting Conf.",
      [SETTLEMENT_STATUS.CONFIRMED]: "Confirmed",
      [SETTLEMENT_STATUS.REJECTED]: "Rejected",
    };
    return labelMap[status] || status.toLowerCase();
  };

  return (
    <div className={styles.settlementCard}>
      <div className={styles.header}>
        <span className={`${styles.statusBadge} ${styles[balance.status]}`}>
          {getStatusLabel(balance.status)}
        </span>
        <div className={styles.amountWrap}>
          <span className={styles.currency}>रू</span>
          <span className={styles.amount}>
            {Number(balance.total_amount).toLocaleString()}
          </span>
        </div>
      </div>

      <div className={styles.transferSection}>
        <div className={styles.partiesRow}>
          <div className={styles.user}>
            <span className={styles.label}>Payer</span>
            <div className={styles.userNameWrap}>
              <span className={styles.name}>{balance.from_user_name}</span>
              {isFromUser && <span className={styles.youBadge}>You</span>}
            </div>
          </div>
          <div className={styles.arrow}>
            <HiOutlineArrowRight />
          </div>
          <div className={styles.user}>
            <span className={styles.label}>Receiver</span>
            <div className={styles.userNameWrap}>
              <span className={styles.name}>{balance.to_user_name}</span>
              {isToUser && <span className={styles.youBadge}>You</span>}
            </div>
          </div>
        </div>

        <div className={styles.dates}>
          {balance.paid_at && (
            <div className={`${styles.dateBadge} ${styles.paid}`}>
              <span className={styles.label}>Paid</span>
              <span className={styles.value}>
                {formatDate(balance.paid_at)}
              </span>
            </div>
          )}
          {balance.reviewed_at &&
            (balance.status === SETTLEMENT_STATUS.REJECTED ||
              balance.status === SETTLEMENT_STATUS.CONFIRMED) && (
              <div className={`${styles.dateBadge} ${styles.reviewed}`}>
                <span className={styles.label}>
                  {balance.status === SETTLEMENT_STATUS.REJECTED
                    ? "Rejected"
                    : "Confirmed"}
                </span>
                <span className={styles.value}>
                  {formatDate(balance.reviewed_at)}
                </span>
              </div>
            )}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.actions}>
          {balance.status === SETTLEMENT_STATUS.PENDING && (
            <>
              {isFromUser && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAction(balance)}
                >
                  Settle All
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction(balance)}
              >
                View
              </Button>
            </>
          )}

          {balance.status === SETTLEMENT_STATUS.PAID && (
            <>
              {isToUser && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onAction(balance)}
                >
                  Verify
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction(balance)}
              >
                {isFromUser ? "Edit" : "View"}
              </Button>
            </>
          )}

          {balance.status === SETTLEMENT_STATUS.CONFIRMED && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(balance)}
            >
              View
            </Button>
          )}

          {balance.status === SETTLEMENT_STATUS.REJECTED && (
            <>
              {isFromUser && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAction(balance)}
                >
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction(balance)}
              >
                View
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementCard;
