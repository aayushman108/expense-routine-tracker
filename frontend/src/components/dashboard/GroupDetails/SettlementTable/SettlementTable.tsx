import React, { useCallback } from "react";
import styles from "./SettlementTable.module.scss";
import { SETTLEMENT_STATUS } from "@expense-tracker/shared";
import type { GroupBalance, User } from "@/lib/types";
import Table, { Column } from "@/components/ui/Table/Table";
import { HiOutlineEye, HiOutlinePencil } from "react-icons/hi";

export interface GroupBalanceWithId extends GroupBalance {
  id: string;
}

interface SettlementTableProps {
  balances: GroupBalance[];
  user: User | null;
  onAction: (balance: GroupBalanceWithId) => void;
  isLoading?: boolean;
}

const SettlementTable: React.FC<SettlementTableProps> = ({
  balances,
  user,
  onAction,
  isLoading,
}) => {
  const currentUserId = user?.id?.toLowerCase();

  const columns: Column<GroupBalanceWithId>[] = [
    {
      header: "From",
      key: "from_user_name",
      render: (balance) => {
        const isFromUser =
          balance.from_user_id?.toLowerCase() === currentUserId;
        return (
          <div className={styles.userName}>
            {isFromUser ? (
              <span className={styles.youBadge}>You</span>
            ) : (
              balance.from_user_name
            )}
          </div>
        );
      },
    },

    {
      header: "To",
      key: "to_user_name",
      render: (balance) => {
        const isToUser = balance.to_user_id?.toLowerCase() === currentUserId;
        return (
          <div className={styles.userName}>
            {isToUser ? (
              <span className={styles.youBadge}>You</span>
            ) : (
              balance.to_user_name
            )}
          </div>
        );
      },
    },
    {
      header: "Amount",
      key: "total_amount",
      render: (balance) => (
        <div className={styles.amountCell}>
          <span className={styles.currency}>रू</span>
          <span className={styles.amount}>
            {Number(balance.total_amount).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (balance) => {
        const labelMap: Record<string, string> = {
          [SETTLEMENT_STATUS.PENDING]: "Pending",
          [SETTLEMENT_STATUS.PAID]: "Awaiting Conf.",
          [SETTLEMENT_STATUS.CONFIRMED]: "Confirmed",
          [SETTLEMENT_STATUS.REJECTED]: "Rejected",
        };
        return (
          <span className={`${styles.statusBadge} ${styles[balance.status]}`}>
            {labelMap[balance.status] || balance.status.toLowerCase()}
          </span>
        );
      },
    },
    {
      header: "Paid At",
      key: "paid_at",
      render: (balance) => (
        <span className={styles.dateCell}>
          {balance.paid_at
            ? new Date(balance.paid_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
    {
      header: "Confirmed / Rejected At",
      key: "reviewed_at",
      render: (balance) => (
        <span className={styles.dateCell}>
          {balance.reviewed_at
            ? new Date(balance.reviewed_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
  ];

  // Map balances to include a synthetic ID for the Table component
  const tableData = balances.map((b) => ({
    ...b,
    id: b.settlement_id || `${b.from_user_id}-${b.to_user_id}`,
  }));

  const renderActions = useCallback(
    (balance: GroupBalanceWithId) => {
      const isFromUser = balance.from_user_id?.toLowerCase() === currentUserId;
      const isToUser = balance.to_user_id?.toLowerCase() === currentUserId;

      /**
       * PENDING: isFromUser -> (Settle All, View), isToUser -> View
       * PAID: isFromUser -> (Edit, View), isToUser -> (Confirm, Reject, View)
       * CONFIRMED: View only (no other actions, settlement is final)
       * REJECTED: isFromUser -> (Edit, View), isToUser -> View
       */

      return (
        <div className={styles.actionGroup}>
          {balance.status === SETTLEMENT_STATUS.PENDING && (
            <>
              {isFromUser && (
                <button
                  className={`${styles.actionBtn} ${styles.primary}`}
                  onClick={() => onAction(balance)}
                  title="Settle All"
                >
                  Settle All
                </button>
              )}
              <button
                className={`${styles.actionBtn} ${styles.iconOnly} ${styles.view}`}
                onClick={() => onAction(balance)}
                title="View"
              >
                <HiOutlineEye />
              </button>
            </>
          )}

          {balance.status === SETTLEMENT_STATUS.PAID && (
            <>
              {isToUser && (
                <button
                  className={`${styles.actionBtn} ${styles.success}`}
                  onClick={() => onAction(balance)}
                  title="Verify"
                >
                  Verify
                </button>
              )}
              <button
                className={`${styles.actionBtn} ${styles.iconOnly} ${isFromUser ? styles.edit : styles.view}`}
                onClick={() => onAction(balance)}
                title={isFromUser ? "Edit" : "View"}
              >
                {isFromUser ? <HiOutlinePencil /> : <HiOutlineEye />}
              </button>
            </>
          )}
          {balance.status === SETTLEMENT_STATUS.CONFIRMED && (
            <button
              className={`${styles.actionBtn} ${styles.iconOnly} ${styles.view}`}
              onClick={() => onAction(balance)}
              title="View"
            >
              <HiOutlineEye />
            </button>
          )}

          {balance.status === SETTLEMENT_STATUS.REJECTED && (
            <>
              {isFromUser && (
                <button
                  className={`${styles.actionBtn} ${styles.iconOnly} ${styles.edit}`}
                  onClick={() => onAction(balance)}
                  title="Edit"
                >
                  <HiOutlinePencil />
                </button>
              )}
              <button
                className={`${styles.actionBtn} ${styles.iconOnly} ${styles.view}`}
                onClick={() => onAction(balance)}
                title="View"
              >
                <HiOutlineEye />
              </button>
            </>
          )}
        </div>
      );
    },
    [onAction, currentUserId],
  );

  return (
    <Table<GroupBalance & { id: string }>
      data={tableData}
      columns={columns}
      loading={isLoading}
      actions={renderActions}
    />
  );
};

export default SettlementTable;
