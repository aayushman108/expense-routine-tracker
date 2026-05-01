import React from "react";
import styles from "./ExpenseCard.module.scss";
import { EXPENSE_STATUS } from "@expense-tracker/shared";
import type { Expense, User } from "@/lib/types";

interface ExpenseCardProps {
  expense: Expense;
  user: User | null;
  onSelect: (id: string) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  user,
  onSelect,
}) => {
  const isPayer = expense.paid_by === user?.id;
  const mySplit = expense.splits?.find((s) => s.user?.id === user?.id);
  const myStatus = mySplit?.split_status;

  return (
    <div
      className={styles.expenseCard}
      onClick={() => onSelect(expense.id)}
    >
      <div className={styles.cardHeader}>
        <span className={styles.description}>"{expense.description}"</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.amountSection}>
          <span className={styles.currency}>{expense.currency}</span>
          <span className={styles.amountValue}>
            {Number(expense.total_amount).toLocaleString()}
          </span>
        </div>
        <div className={styles.tagsRow}>
          <span className={`${styles.tag} ${styles[expense.expense_status]}`}>
            EXPENSE.{expense.expense_status.toUpperCase()}
          </span>
          {expense.expense_status === EXPENSE_STATUS.SUBMITTED && myStatus && (
            <span className={`${styles.tag} ${styles[myStatus]}`}>
              MY SPLIT.{myStatus.toUpperCase()}
            </span>
          )}
          {expense.expense_status === EXPENSE_STATUS.VERIFIED &&
            expense.settlement_status && (
              <span
                className={`${styles.tag} ${styles[expense.settlement_status]}`}
              >
                SETTLEMENT.{expense.settlement_status.toUpperCase()}
              </span>
            )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.dateBadge}>
          {new Date(expense.expense_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <div className={styles.footerInfo}>
          <span className={styles.compactStatus}>
            {isPayer
              ? "You"
              : (expense.payer?.full_name || expense.payer_name || "Member")
                  .split(" ")[0]}{" "}
            paid
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
