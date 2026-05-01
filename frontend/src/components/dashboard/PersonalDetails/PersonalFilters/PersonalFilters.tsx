import { HiOutlineCalendar, HiOutlineSearch, HiOutlineRefresh } from "react-icons/hi";
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
  isStatic?: boolean;
}

const PersonalFilters: React.FC<PersonalFiltersProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApply,
  onClear,
  isExpanded,
  isStatic = false,
}) => {
  if (!isExpanded && !isStatic) return null;

  const isAnyValuePresent = !!(startDate || endDate);

  return (
    <div className={`${styles.filterBar} ${isStatic ? styles.isStatic : ""}`}>
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

        <div className={styles.filterActions}>
          <Button size="sm" onClick={onApply}>
            <div className={styles.btnContent}>
              <HiOutlineSearch />
              Search
            </div>
          </Button>
          {isAnyValuePresent && (
            <Button size="sm" variant="outline" onClick={onClear}>
              <div className={styles.btnContent}>
                <HiOutlineRefresh />
                Clear
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalFilters;
