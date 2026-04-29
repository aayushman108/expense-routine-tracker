import React from "react";
import styles from "./ExpenseFilters.module.scss";
import { HiOutlineCalendar, HiOutlineSearch, HiOutlineX } from "react-icons/hi";
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
}) => {
  return (
    <div className={styles.filterBar}>
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
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <HiOutlineSearch />
              Search
            </span>
          </Button>

          {hasFiltersApplied && (
            <button className={styles.clearFilters} onClick={onClear}>
              <HiOutlineX />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
