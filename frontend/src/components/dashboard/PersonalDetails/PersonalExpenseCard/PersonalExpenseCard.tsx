import React from "react";
import { HiPencil, HiTrash } from "react-icons/hi";
import { Expense, User } from "../../../../lib/types";
import { EXPENSE_TYPE } from "@expense-tracker/shared";
import styles from "./PersonalExpenseCard.module.scss";

interface PersonalExpenseCardProps {
  expense: Expense;
  user: User | null;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const PersonalExpenseCard: React.FC<PersonalExpenseCardProps> = ({
  expense,
  user,
  onEdit,
  onDelete,
}) => {
  const mySplit = expense.splits?.find(
    (s) => s.user.id === user?.id || s.user_id === user?.id,
  );
  
  const amountToShow =
    expense.expense_type === EXPENSE_TYPE.GROUP
      ? mySplit?.split_amount || 0
      : expense.total_amount;

  const isGroup = expense.expense_type === EXPENSE_TYPE.GROUP;
  
  const formatDateParts = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString("en-US", { month: "short" }),
    };
  };

  const { day, month } = formatDateParts(expense.expense_date);

  return (
    <div className={styles.expenseCard}>
      <div className={styles.cardHeader}>
        <div className={styles.amountSection}>
          <span className={styles.currency}>{expense.currency || "NPR"}</span>
          <span className={styles.amountValue}>
            {Number(amountToShow).toLocaleString()}
          </span>
        </div>
        <div className={styles.date}>
          <span className={styles.day}>{day}</span>
          <span className={styles.month}>{month}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <span className={styles.titleText}>
          {expense.description || "Unnamed Expense"}
        </span>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.dateBadge}>
          {new Date(expense.expense_date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        
        {!isGroup ? (
          <div className={styles.actionButtons}>
            <button
              className={styles.iconBtn}
              onClick={() => onEdit(expense)}
              title="Edit Expense"
            >
              <HiPencil />
            </button>
            <button
              className={`${styles.iconBtn} ${styles.deleteBtn}`}
              onClick={() => onDelete(expense.id)}
              title="Delete Expense"
            >
              <HiTrash />
            </button>
          </div>
        ) : (
          <span className={styles.payer}>
            {expense.paid_by === user?.id ? (
              <span className={styles.payerHighlight}>You</span>
            ) : (
              <span>
                {expense.payer?.full_name || expense.payer_name || "Member"}
              </span>
            )}{" "}
            paid
          </span>
        )}
      </div>
    </div>
  );
};

export default PersonalExpenseCard;
