import {
  HiOutlineCalendar,
  HiOutlineSearch,
  HiOutlineRefresh,
} from "react-icons/hi";
import Button from "@/components/ui/Button/Button";
import styles from "./PersonalFilters.module.scss";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { useState } from "react";
import { LIMITS } from "@/constants/general.constant";

const PersonalFilters = () => {
  const { query, updateQuery } = useUpdateQuery();

  const [startDate, setStartDate] = useState<string>(query?.startDate || "");
  const [endDate, setEndDate] = useState<string>(query?.endDate || "");

  const isAnyValuePresent = !!(query?.startDate || query?.endDate);

  const handleApplyFilters = () => {
    updateQuery({
      page: 1,
      limit: LIMITS.DEFAULT_EXPENSE,
      startDate,
      endDate,
    });
  };

  const handleClearFilters = () => {
    updateQuery({
      page: 1,
      limit: LIMITS.DEFAULT_EXPENSE,
      startDate: "",
      endDate: "",
    });
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>
        <div className={styles.inputWrapper}>
          <label>FROM</label>
          <div className={styles.dateInput}>
            <span className={styles.leftIcon}>
              <HiOutlineCalendar />
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.inputWrapper}>
          <label>TO</label>
          <div className={styles.dateInput}>
            <span className={styles.leftIcon}>
              <HiOutlineCalendar />
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterActions}>
          <Button
            size="sm"
            onClick={handleApplyFilters}
            className={styles.actionBtn}
          >
            <div className={styles.btnContent}>
              <span className={styles.btnIcon}>
                <HiOutlineSearch />
              </span>
              <span>Search</span>
            </div>
          </Button>
          {isAnyValuePresent && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearFilters}
              className={styles.actionBtn}
            >
              <div className={styles.btnContent}>
                <span className={styles.btnIcon}>
                  <HiOutlineRefresh />
                </span>
                <span>Reset</span>
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalFilters;
