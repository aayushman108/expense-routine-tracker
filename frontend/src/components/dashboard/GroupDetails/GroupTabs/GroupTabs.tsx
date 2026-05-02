import React from "react";
import styles from "./GroupTabs.module.scss";
import {
  HiOutlineCurrencyDollar,
  HiCheck,
  HiOutlineDownload,
} from "react-icons/hi";
import Button from "@/components/ui/Button/Button";
import { GROUP_TAB } from "@/enums/general.enum";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";

interface GroupTabsProps {
  onDownloadStatement: () => void;
}

const GroupTabs: React.FC<GroupTabsProps> = ({ onDownloadStatement }) => {
  const { query, updateQuery } = useUpdateQuery();

  const activeTab =
    query.tab === GROUP_TAB.SETTLEMENTS
      ? GROUP_TAB.SETTLEMENTS
      : GROUP_TAB.EXPENSES;

  return (
    <div className={styles.tabHeader}>
      <div className={styles.tabsWrapper}>
        <div
          className={`${styles.tab} ${activeTab === GROUP_TAB.EXPENSES ? styles.active : ""}`}
          onClick={() => updateQuery({ tab: GROUP_TAB.EXPENSES })}
        >
          <HiOutlineCurrencyDollar /> Expenses
        </div>
        <div
          className={`${styles.tab} ${activeTab === GROUP_TAB.SETTLEMENTS ? styles.active : ""}`}
          onClick={() =>
            updateQuery({
              tab: GROUP_TAB.SETTLEMENTS,
              startDate: null,
              endDate: null,
              settlementStatus: null,
              expenseStatus: null,
            })
          }
        >
          <HiCheck /> Settlements
        </div>
      </div>

      {activeTab === GROUP_TAB.EXPENSES && (
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
