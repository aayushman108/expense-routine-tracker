import React from "react";
import { HiOutlineCalendar, HiOutlineSearch, HiOutlineX } from "react-icons/hi";
import Button from "@/components/ui/Button/Button";
import styles from "./PersonalFilters.module.scss";

interface PersonalFiltersProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  onApply: () => void;
  onClear: () => void;
  isExpanded: boolean;
}

const PersonalFilters: React.FC<PersonalFiltersProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApply,
  onClear,
  isExpanded,
}) => {
  if (!isExpanded) return null;

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <div className={styles.inputWrapper}>
            <label>From Date</label>
            <div className={styles.dateInput}>
              <HiOutlineCalendar />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="mm/dd/yyyy"
              />
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <label>To Date</label>
            <div className={styles.dateInput}>
              <HiOutlineCalendar />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="mm/dd/yyyy"
              />
            </div>
          </div>

          <div className={styles.actionRow}>
            <Button size="sm" onClick={onApply}>
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <HiOutlineSearch />
                Search
              </span>
            </Button>
            {(startDate || endDate) && (
              <button className={styles.clearFilters} onClick={onClear}>
                <HiOutlineX />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalFilters;

