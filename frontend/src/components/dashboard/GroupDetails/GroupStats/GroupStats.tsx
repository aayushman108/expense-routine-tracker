import React from "react";
import {
  HiOutlineShoppingBag,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import styles from "./GroupStats.module.scss";
import type { GroupDetails } from "@/lib/types";

interface GroupSummary {
  id: string;
  name: string;
  totalGroupSpend: number;
  totalPaidByMe: number;
  myTotalShare: number;
  iOweOthers: number;
  othersOweMe: number;
}

interface GroupStatsProps {
  groupDetails: { data: GroupDetails | null };
  totalGroupSpend: number;
  netPosition: number;
  summary?: GroupSummary;
}

const GroupStats: React.FC<GroupStatsProps> = ({
  totalGroupSpend,
  netPosition,
  summary,
}) => {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.iconWrapper}>
          <HiOutlineShoppingBag />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Group Spend</span>
          <div className={styles.statValue}>
            रू {totalGroupSpend.toLocaleString()}
          </div>
        </div>
      </div>

      {summary && (
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <HiOutlineChartBar />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>My Share</span>
            <div className={`${styles.statValue} ${styles.highlight}`}>
              रू {summary.myTotalShare.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {summary && (
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <HiOutlineCurrencyDollar />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Paid by Me</span>
            <div className={styles.statValue}>
              रू {summary.totalPaidByMe.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className={styles.statCard}>
        <div className={styles.iconWrapper}>
          <HiOutlineChartBar />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Net Balance</span>
          <div
            className={`${styles.statValue} ${
              netPosition > 0
                ? styles.success
                : netPosition < 0
                  ? styles.danger
                  : ""
            }`}
          >
            {netPosition > 0 ? "+" : ""} रू {netPosition.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupStats;
