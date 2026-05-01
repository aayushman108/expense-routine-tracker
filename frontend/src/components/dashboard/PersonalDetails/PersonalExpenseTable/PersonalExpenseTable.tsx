import React from "react";
import styles from "./PersonalExpenseTable.module.scss";
import type { Expense, User } from "@/lib/types";
import { 
  HiOutlinePencil, 
  HiOutlineTrash 
} from "react-icons/hi";
import Table, { Column } from "@/components/ui/Table/Table";

interface PersonalExpenseTableProps {
  expenses: Expense[];
  user: User | null;
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

const PersonalExpenseTable: React.FC<PersonalExpenseTableProps> = ({
  expenses,
  user,
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
        </div>
      ),
    },
    {
      header: "Category",
      key: "category",
      render: (expense) => (
        <span className={styles.categoryBadge}>
          {expense.category || "General"}
        </span>
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
    <div className={styles.tableWrapper}>
      <Table<Expense>
        data={expenses}
        columns={columns}
        loading={isLoading}
        pagination={pagination}
        onPageChange={onPageChange}
        actions={(expense) => (
          <>
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
    </div>
  );
};

export default PersonalExpenseTable;
