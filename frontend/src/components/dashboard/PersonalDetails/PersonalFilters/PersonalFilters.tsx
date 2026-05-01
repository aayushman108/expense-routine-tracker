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
}

const PersonalFilters: React.FC<PersonalFiltersProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApply,
  onClear,
}) => {
  const isAnyValuePresent = !!(startDate || endDate);

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
          <Button size="sm" onClick={onApply} className={styles.actionBtn}>
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
              onClick={onClear}
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
