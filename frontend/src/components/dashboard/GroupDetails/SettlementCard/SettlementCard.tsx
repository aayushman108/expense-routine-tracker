import React from "react";
import styles from "./SettlementCard.module.scss";
import { HiOutlineArrowRight } from "react-icons/hi";
import { SETTLEMENT_STATUS } from "@expense-tracker/shared";
import Button from "@/components/ui/Button/Button";
import type { GroupBalance, User } from "@/lib/types";

interface SettlementCardProps {
  balance: GroupBalance;
  user: User | null;
  onAction: (balance: GroupBalance) => void;
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

  return (
    <div className={styles.settlementCard}>
      <div className={styles.party}>
        <div className={styles.label}>OWES</div>
        <div className={styles.name}>
          {isFromUser ? "You" : balance.from_user_name}
        </div>
      </div>
      <span className={styles.arrow}>
        <HiOutlineArrowRight />
      </span>
      <div className={styles.party}>
        <div className={styles.label}>TO</div>
        <div className={styles.name}>
          {isToUser ? "You" : balance.to_user_name}
        </div>
      </div>
      <div className={styles.amountWrap}>
        <div className={styles.amount}>
          रू {Number(balance.total_amount).toLocaleString()}
        </div>
        {balance.status === SETTLEMENT_STATUS.PAID ? (
          isToUser ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAction(balance)}
            >
              Verify
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Awaiting Conf.
            </Button>
          )
        ) : (
          <>
            {isFromUser ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAction(balance)}
              >
                Settle All
              </Button>
            ) : isToUser ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction(balance)}
              >
                Mark as Received
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default SettlementCard;
