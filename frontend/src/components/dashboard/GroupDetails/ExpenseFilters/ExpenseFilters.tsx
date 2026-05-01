import React, { useState } from "react";
import styles from "./ExpenseFilters.module.scss";
import {
  HiOutlineCalendar,
  HiOutlineSearch,
  HiOutlineRefresh,
} from "react-icons/hi";
import Button from "@/components/ui/Button/Button";
import Select from "@/components/ui/Select/Select";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { LIMITS } from "@/constants/general.constant";

interface ExpenseFiltersProps {
  isStatic?: boolean;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  isStatic = false,
}) => {
  const { searchParams, updateQuery } = useUpdateQuery();

  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || "",
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [expenseStatus, setExpenseStatus] = useState(
    searchParams.get("expenseStatus") || "",
  );
  const [settlementStatus, setSettlementStatus] = useState(
    searchParams.get("settlementStatus") || "",
  );

  const isAnyValuePresent = !!(
    startDate ||
    endDate ||
    expenseStatus ||
    settlementStatus
  );

  const handleApplyFilters = () => {
    updateQuery({
      page: 1,
      limit: LIMITS.DEFAULT_EXPENSE,
      startDate,
      endDate,
      expenseStatus,
      settlementStatus,
    });
  };

  const handleClearFilters = () => {
    updateQuery({
      page: 1,
      limit: LIMITS.DEFAULT_EXPENSE,
      startDate: "",
      endDate: "",
      expenseStatus: "",
      settlementStatus: "",
    });
  };

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
          <Button size="sm" onClick={handleApplyFilters}>
            <span className={styles.btnContent}>
              <HiOutlineSearch />
              Search
            </span>
          </Button>

          {isAnyValuePresent && (
            <Button size="sm" variant="outline" onClick={handleClearFilters}>
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
