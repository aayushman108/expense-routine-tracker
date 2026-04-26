import React from "react";
import {
  HiOutlineChevronLeft,
  HiOutlineCurrencyDollar,
  HiOutlinePlus,
} from "react-icons/hi";
import Button from "@/components/ui/Button/Button";
import styles from "./PersonalHeader.module.scss";

interface PersonalHeaderProps {
  onBack: () => void;
  onAddExpense: () => void;
}

const PersonalHeader: React.FC<PersonalHeaderProps> = ({
  onBack,
  onAddExpense,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <button className={styles.backBtn} onClick={onBack}>
          <HiOutlineChevronLeft /> Back to Dashboard
        </button>
        <div className={styles.sessionTag}>SECURE_PERSONAL_SESSION</div>
        <div className={styles.titleWrapper}>
          <div className={styles.icon}>
            <HiOutlineCurrencyDollar />
          </div>
          <h1>Personal Ledger</h1>
        </div>
        <p>
          Private workspace for tracking and managing your individual expenses.
        </p>
      </div>
      <div className={styles.actions}>
        <Button variant="primary" size="sm" onClick={onAddExpense}>
          <HiOutlinePlus /> Add Expense
        </Button>
      </div>
    </header>
  );
};

export default PersonalHeader;
