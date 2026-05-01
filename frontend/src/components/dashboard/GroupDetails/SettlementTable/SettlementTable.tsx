import React from "react";
import styles from "./SettlementTable.module.scss";
import { SETTLEMENT_STATUS } from "@expense-tracker/shared";
import type { GroupBalance, User } from "@/lib/types";
import Table, { Column } from "@/components/ui/Table/Table";
import Button from "@/components/ui/Button/Button";
import { HiOutlineArrowRight } from "react-icons/hi";

interface SettlementTableProps {
  balances: GroupBalance[];
  user: User | null;
  onAction: (balance: GroupBalance) => void;
  isLoading?: boolean;
}

const SettlementTable: React.FC<SettlementTableProps> = ({
  balances,
  user,
  onAction,
  isLoading,
}) => {
  const currentUserId = user?.id?.toLowerCase();

  const columns: Column<GroupBalance & { id: string }>[] = [
    {
      header: "From",
      key: "from_user_name",
      render: (balance) => {
        const isFromUser = balance.from_user_id?.toLowerCase() === currentUserId;
        return (
          <div className={styles.userName}>
            {isFromUser ? <span className={styles.youBadge}>You</span> : balance.from_user_name}
          </div>
        );
      },
    },
    {
      header: "",
      key: "arrow",
      width: "40px",
      render: () => (
        <div className={styles.arrowIcon}>
          <HiOutlineArrowRight />
        </div>
      ),
    },
    {
      header: "To",
      key: "to_user_name",
      render: (balance) => {
        const isToUser = balance.to_user_id?.toLowerCase() === currentUserId;
        return (
          <div className={styles.userName}>
            {isToUser ? <span className={styles.youBadge}>You</span> : balance.to_user_name}
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
      render: (balance) => (
        <span className={`${styles.statusBadge} ${styles[balance.status]}`}>
          {balance.status === SETTLEMENT_STATUS.PAID ? "Awaiting Conf." : balance.status.toLowerCase()}
        </span>
      ),
    },
  ];

  // Map balances to include a synthetic ID for the Table component
  const tableData = balances.map((b) => ({
    ...b,
    id: `${b.from_user_id}-${b.to_user_id}`,
  }));

  return (
    <Table<GroupBalance & { id: string }>
      data={tableData}
      columns={columns}
      loading={isLoading}
      actions={(balance) => {
        const isFromUser = balance.from_user_id?.toLowerCase() === currentUserId;
        const isToUser = balance.to_user_id?.toLowerCase() === currentUserId;

        if (balance.status === SETTLEMENT_STATUS.PAID) {
          if (isToUser) {
            return (
              <Button variant="primary" size="sm" onClick={() => onAction(balance)}>
                Verify
              </Button>
            );
          }
          return null;
        }

        if (isFromUser) {
          return (
            <Button variant="primary" size="sm" onClick={() => onAction(balance)}>
              Settle All
            </Button>
          );
        }

        if (isToUser) {
          return (
            <Button variant="outline" size="sm" onClick={() => onAction(balance)}>
              Received
            </Button>
          );
        }

        return null;
      }}
    />
  );
};

export default SettlementTable;
