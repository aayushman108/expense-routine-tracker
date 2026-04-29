import React from "react";
import styles from "./GroupTabs.module.scss";
import { HiOutlineCurrencyDollar, HiCheck, HiOutlineFilter, HiOutlineDownload } from "react-icons/hi";
import Button from "@/components/ui/Button/Button";

interface GroupTabsProps {
  activeTab: "expenses" | "settlements";
  setActiveTab: (tab: "expenses" | "settlements") => void;
  isFilterExpanded: boolean;
  setIsFilterExpanded: (expanded: boolean) => void;
  hasFiltersApplied: boolean;
  onDownloadStatement: () => void;
}

const GroupTabs: React.FC<GroupTabsProps> = ({
  activeTab,
  setActiveTab,
  isFilterExpanded,
  setIsFilterExpanded,
  hasFiltersApplied,
  onDownloadStatement,
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
              onClick={onDownloadStatement}
              className={styles.downloadBtn}
            >
              <HiOutlineDownload />
              Download Statement
            </Button>
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
              className={styles.downloadBtnSm}
              onClick={onDownloadStatement}
              title="Download Statement"
            >
              <HiOutlineDownload />
            </button>
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

