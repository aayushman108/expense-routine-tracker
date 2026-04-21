import React from "react";
import styles from "./ExpenseCard.module.scss";
import { EXPENSE_STATUS } from "@expense-tracker/shared";
import type { Expense, User } from "@/lib/types";

interface ExpenseCardProps {
  expense: Expense;
  user: User | null;
  onSelect: (id: string) => void;
  formatDate: (dateStr: string) => { day: number; month: string; year: number };
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  user,
  onSelect,
  formatDate,
}) => {
  const { day, month } = formatDate(expense.expense_date);
  const isPayer = expense.paid_by === user?.id;

  return (
    <div
      className={styles.expenseCard}
      onClick={() => onSelect(expense.id)}
    >
      <div className={styles.cardHeader}>
        <div className={styles.amountSection}>
          <span className={styles.currency}>{expense.currency}</span>
          <span className={styles.amountValue}>
            {Number(expense.total_amount).toLocaleString()}
          </span>
        </div>
        <div className={styles.date}>
          <span className={styles.day}>{day}</span>
          <span className={styles.month}>{month}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <span className={styles.titleText}>{expense.description}</span>
        <div className={styles.tagsRow}>
          <span className={`${styles.tag} ${styles[expense.expense_status]}`}>
            Expense: {expense.expense_status.toUpperCase()}
          </span>
          {expense.expense_status === EXPENSE_STATUS.VERIFIED &&
            expense.settlement_status && (
              <span
                className={`${styles.tag} ${styles[expense.settlement_status]}`}
              >
                Settlement: {expense.settlement_status.toUpperCase()}
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
        <span className={styles.payer}>
          {isPayer ? (
            <span className={styles.payerHighlight}>You</span>
          ) : (
            <span>
              {expense.payer?.full_name || expense.payer_name || "Member"}
            </span>
          )}{" "}
          paid
        </span>
      </div>
    </div>
  );
};

export default ExpenseCard;
