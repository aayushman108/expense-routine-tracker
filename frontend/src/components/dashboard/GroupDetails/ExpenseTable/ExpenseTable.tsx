import React from "react";
import styles from "./ExpenseTable.module.scss";
import { EXPENSE_STATUS } from "@expense-tracker/shared";
import type { Expense, User } from "@/lib/types";
import { 
  HiOutlineEye, 
  HiOutlinePencil, 
  HiOutlineTrash 
} from "react-icons/hi";
import Table, { Column } from "@/components/ui/Table/Table";

interface ExpenseTableProps {
  expenses: Expense[];
  user: User | null;
  onSelect: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
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
  onPageChange,
  pagination,
}) => {
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
          {expense.category && (
            <span className={styles.category}>{expense.category}</span>
          )}
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
        <span className={`${styles.statusBadge} ${styles[expense.expense_status]}`}>
          {expense.expense_status.toLowerCase()}
        </span>
      ),
    },
    {
      header: "Settlement Status",
      key: "settlement_status",
      render: (expense) => (
        expense.expense_status === EXPENSE_STATUS.VERIFIED && expense.settlement_status ? (
          <span className={`${styles.statusBadge} ${styles[expense.settlement_status]}`}>
            {expense.settlement_status.toLowerCase()}
          </span>
        ) : (
          <span className={styles.notApplicable}>-</span>
        )
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

  return (
    <Table<Expense>
      data={expenses}
      columns={columns}
      loading={isLoading}
      onRowClick={(expense) => onSelect(expense.id)}
      pagination={pagination}
      onPageChange={onPageChange}
      actions={(expense) => (
        <>
          <button 
            className={styles.actionBtn} 
            onClick={() => onSelect(expense.id)}
            title="View Details"
          >
            <HiOutlineEye />
          </button>
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
        </>
      )}
    />
  );
};

export default ExpenseTable;
