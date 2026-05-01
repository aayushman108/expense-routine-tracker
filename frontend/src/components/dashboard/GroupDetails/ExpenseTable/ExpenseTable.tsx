import React, { useCallback } from "react";
import styles from "./ExpenseTable.module.scss";
import { EXPENSE_STATUS } from "@expense-tracker/shared";
import type { Expense, User } from "@/lib/types";
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import Table, { Column } from "@/components/ui/Table/Table";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";

interface ExpenseTableProps {
  expenses: Expense[];
  user: User | null;
  onSelect: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    pageSize: number;
  };
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  user,
  onSelect,
  onEdit,
  onDelete,
  isLoading,
  pagination,
}) => {
  const { updateQuery } = useUpdateQuery();

  const columns: Column<Expense>[] = [
    {
      header: "Date",
      key: "expense_date",
      render: (expense) => (
        <span className={styles.dateText}>
          {new Date(expense.expense_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Description",
      key: "description",
      render: (expense) => (
        <div className={styles.descriptionCell}>
          <div className={styles.description}>{expense.description}</div>
        </div>
      ),
    },
    {
      header: "Payer",
      key: "paid_by",
      render: (expense) => {
        const isPayer = expense.paid_by === user?.id;
        return (
          <div className={styles.payer}>
            {isPayer ? (
              <span className={styles.youBadge}>You</span>
            ) : (
              expense.payer?.full_name || expense.payer_name || "Member"
            )}
          </div>
        );
      },
    },
    {
      header: "Expense Status",
      key: "expense_status",
      render: (expense) => (
        <span
          className={`${styles.statusBadge} ${styles[expense.expense_status]}`}
        >
          {expense.expense_status.toLowerCase()}
        </span>
      ),
    },
    {
      header: "Settlement Status",
      key: "settlement_status",
      render: (expense) =>
        expense.expense_status === EXPENSE_STATUS.VERIFIED &&
        expense.settlement_status ? (
          <span
            className={`${styles.statusBadge} ${styles[expense.settlement_status]}`}
          >
            {expense.settlement_status.toLowerCase()}
          </span>
        ) : (
          <span className={styles.notApplicable}>-</span>
        ),
    },
    {
      header: "Amount",
      key: "total_amount",
      render: (expense) => (
        <div className={styles.amountCell}>
          <span className={styles.currency}>{expense.currency}</span>
          <span className={styles.amount}>
            {Number(expense.total_amount).toLocaleString()}
          </span>
        </div>
      ),
    },
  ];

  const renderActions = useCallback(
    (expense: Expense) => {
      const isPayer = expense.paid_by === user?.id;
      const canEdit =
        expense.expense_status !== EXPENSE_STATUS.VERIFIED && isPayer;
      const canDelete =
        expense.expense_status !== EXPENSE_STATUS.VERIFIED && isPayer;

      return (
        <>
          <button
            className={styles.actionBtn}
            onClick={() => onSelect(expense.id)}
            title="View Details"
          >
            <HiOutlineEye />
          </button>
          {canEdit && (
            <button
              className={`${styles.actionBtn} ${styles.editBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(expense);
              }}
              title="Update"
            >
              <HiOutlinePencil />
            </button>
          )}
          {canDelete && (
            <button
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(expense.id);
              }}
              title="Delete"
            >
              <HiOutlineTrash />
            </button>
          )}
        </>
      );
    },
    [onSelect, onEdit, onDelete, user],
  );

  const handlePageChange = (page: number) => {
    updateQuery({ page });
  };

  return (
    <Table<Expense>
      data={expenses}
      columns={columns}
      loading={isLoading}
      onRowClick={(expense) => onSelect(expense.id)}
      pagination={pagination}
      onPageChange={handlePageChange}
      actions={renderActions}
    />
  );
};

export default ExpenseTable;
