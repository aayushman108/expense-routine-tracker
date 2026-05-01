import React from "react";
import { HiPencil, HiTrash } from "react-icons/hi";
import { Expense } from "../../../../lib/types";
import styles from "./PersonalExpenseCard.module.scss";

interface PersonalExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const PersonalExpenseCard: React.FC<PersonalExpenseCardProps> = ({
  expense,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.expenseCard}>
      <div className={styles.cardHeader}>
        <span className={styles.description}>
          &quot;{expense.description || "Unnamed Expense"}&quot;
        </span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.amountSection}>
          <span className={styles.currency}>{expense.currency || "NPR"}</span>
          <span className={styles.amountValue}>
            {Number(expense.total_amount).toLocaleString()}
          </span>
        </div>
        <div className={styles.tagsRow}>
          <span className={`${styles.tag} ${styles.personal}`}>
            TYPE.PERSONAL
          </span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.dateBadge}>
          {new Date(expense.expense_date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>

        <div className={styles.actionButtons}>
          <button
            className={styles.iconBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(expense);
            }}
            title="Edit"
          >
            <HiPencil />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.deleteBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(expense.id);
            }}
            title="Delete"
          >
            <HiTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalExpenseCard;
