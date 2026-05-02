import React from "react";
import {
  HiOutlineShoppingBag,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import styles from "./GroupStats.module.scss";
import type { GroupSummary } from "@/lib/types";

interface GroupStatsProps {
  details: GroupSummary;
}

const GroupStats: React.FC<GroupStatsProps> = ({ details }) => {
  const { totalGroupSpend, myTotalShare, totalPaidByMe } = details;

  const netPosition =
    myTotalShare > 0 ? myTotalShare - totalPaidByMe : totalPaidByMe;

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

      {details && (
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <HiOutlineChartBar />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>My Share</span>
            <div className={`${styles.statValue} ${styles.highlight}`}>
              रू {myTotalShare.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className={styles.statCard}>
        <div className={styles.iconWrapper}>
          <HiOutlineCurrencyDollar />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Paid by Me</span>
          <div className={styles.statValue}>
            रू {totalPaidByMe.toLocaleString()}
          </div>
        </div>
      </div>

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
