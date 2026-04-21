import React from "react";
import styles from "./GroupTabs.module.scss";
import { HiOutlineCurrencyDollar, HiCheck, HiOutlineFilter } from "react-icons/hi";
import Button from "@/components/ui/Button/Button";

interface GroupTabsProps {
  activeTab: "expenses" | "settlements";
  setActiveTab: (tab: "expenses" | "settlements") => void;
  isFilterExpanded: boolean;
  setIsFilterExpanded: (expanded: boolean) => void;
  hasFiltersApplied: boolean;
}

const GroupTabs: React.FC<GroupTabsProps> = ({
  activeTab,
  setActiveTab,
  isFilterExpanded,
  setIsFilterExpanded,
  hasFiltersApplied,
}) => {
  return (
    <div className={`${styles.tabHeader} ${styles.expenseHeaderActions}`}>
      <div className={styles.tabsWrapper}>
        <div
          className={`${styles.tab} ${activeTab === "expenses" ? styles.active : ""}`}
          onClick={() => setActiveTab("expenses")}
        >
          <HiOutlineCurrencyDollar /> Expenses
        </div>
        <div
          className={`${styles.tab} ${activeTab === "settlements" ? styles.active : ""}`}
          onClick={() => setActiveTab("settlements")}
        >
          <HiCheck /> Settlements
        </div>
      </div>

      {activeTab === "expenses" && (
        <>
          <div className={styles.filterActions}>
            <Button
              variant="outline"
              size="sm"
              className={styles.filterToggleBtn}
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <HiOutlineFilter />
              {isFilterExpanded ? "Hide Filters" : "Filters"}
              {hasFiltersApplied && <span className={styles.filterDot} />}
            </Button>
          </div>
          <div className={styles.filterActionsSm}>
            <button
              className={styles.filterToggleBtn}
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <HiOutlineFilter />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupTabs;
