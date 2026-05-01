import React from "react";
import styles from "./ExpenseFilters.module.scss";
import { HiOutlineCalendar, HiOutlineSearch, HiOutlineRefresh } from "react-icons/hi";
import Button from "@/components/ui/Button/Button";
import Select from "@/components/ui/Select/Select";

interface ExpenseFiltersProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  expenseStatus: string;
  setExpenseStatus: (status: string) => void;
  settlementStatus: string;
  setSettlementStatus: (status: string) => void;
  onApply: () => void;
  onClear: () => void;
  hasFiltersApplied: boolean;
  isStatic?: boolean;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  expenseStatus,
  setExpenseStatus,
  settlementStatus,
  setSettlementStatus,
  onApply,
  onClear,
  hasFiltersApplied,
  isStatic = false,
}) => {
  const isAnyValuePresent = !!(startDate || endDate || expenseStatus || settlementStatus);

  return (
    <div className={`${styles.filterBar} ${isStatic ? styles.isStatic : ""}`}>
      <div className={styles.filterGroup}>
        <div className={styles.inputWrapper}>
          <label>From</label>
          <div className={styles.dateInput}>
            <HiOutlineCalendar />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.inputWrapper}>
          <label>To</label>
          <div className={styles.dateInput}>
            <HiOutlineCalendar />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <Select
          label="Expense Status"
          className={styles.filterSelectWrapper}
          placeholder="All Statuses"
          options={[
            { value: "draft", label: "Draft" },
            { value: "submitted", label: "Submitted" },
            { value: "verified", label: "Verified" },
            { value: "rejected", label: "Rejected" },
          ]}
          value={expenseStatus}
          onChange={(e) => setExpenseStatus(e.target.value)}
        />

        <Select
          label="Settlement"
          className={styles.filterSelectWrapper}
          placeholder="Overall Status"
          options={[
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
            { value: "confirmed", label: "Confirmed" },
          ]}
          value={settlementStatus}
          onChange={(e) => setSettlementStatus(e.target.value)}
        />

        <div className={styles.filterActions}>
          <Button size="sm" onClick={onApply}>
            <span className={styles.btnContent}>
              <HiOutlineSearch />
              Search
            </span>
          </Button>

          {isAnyValuePresent && (
            <Button size="sm" variant="outline" onClick={onClear}>
              <span className={styles.btnContent}>
                <HiOutlineRefresh />
                Clear
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
