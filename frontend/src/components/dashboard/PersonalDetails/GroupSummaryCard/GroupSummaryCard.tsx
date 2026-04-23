import React from "react";
import {
  HiOutlineShoppingBag,
  HiOutlineChartBar,
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
} from "react-icons/hi";
import styles from "./GroupSummaryCard.module.scss";

interface GroupSummary {
  id: string;
  name: string;
  totalGroupSpend: number;
  totalPaidByMe: number;
  myTotalShare: number;
  iOweOthers: number;
  othersOweMe: number;
}

interface GroupSummaryCardProps {
  group: GroupSummary;
}

const GroupSummaryCard: React.FC<GroupSummaryCardProps> = ({ group }) => {
  const netBalance = group.othersOweMe - group.iOweOthers;

  return (
    <div className={styles.groupSummaryCard}>
      <div className={styles.cardHeader}>
        <div className={styles.groupInfoContainer}>
          <span className={styles.groupLabel}>Individual Summary</span>
          <h4 className={styles.groupName}>{group.name}</h4>
        </div>
        <div className={styles.groupIconWrap}>
          <HiOutlineShoppingBag />
        </div>
      </div>
      <div className={styles.statsContainer}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <HiOutlineShoppingBag /> Group Spend
            </div>
            <div className={styles.statValue}>
              रू {group.totalGroupSpend?.toLocaleString()}
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <HiOutlineChartBar /> My Share
            </div>
            <div className={`${styles.statValue} ${styles.highlight}`}>
              रू {group.myTotalShare?.toLocaleString()}
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <HiOutlineShoppingBag /> Total Paid by Me
            </div>
            <div className={styles.statValue}>
              रू {group.totalPaidByMe?.toLocaleString()}
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <HiOutlineChartBar /> Net Balance
            </div>
            <div
              className={`${styles.statValue} ${netBalance > 0 ? styles.success : netBalance < 0 ? styles.danger : ""}`}
            >
              {netBalance > 0 ? "+" : ""} रू {netBalance?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSummaryCard;
