import React from "react";
import styles from "./GroupTabs.module.scss";
import { HiOutlineCurrencyDollar, HiCheck, HiOutlineFilter, HiOutlineDownload } from "react-icons/hi";
import Button from "@/components/ui/Button/Button";

interface GroupTabsProps {
  activeTab: "expenses" | "settlements";
  setActiveTab: (tab: "expenses" | "settlements") => void;
  onDownloadStatement: () => void;
}

const GroupTabs: React.FC<GroupTabsProps> = ({
  activeTab,
  setActiveTab,
  onDownloadStatement,
}) => {
  return (
    <div className={styles.tabHeader}>
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
        <div className={styles.tabActions}>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadStatement}
            className={styles.downloadBtn}
          >
            <HiOutlineDownload />
            Statement
          </Button>
        </div>
      )}
    </div>
  );
};

export default GroupTabs;
