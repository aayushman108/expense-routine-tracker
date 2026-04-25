import React from "react";
import {
  HiOutlineShoppingBag,
  HiOutlineChartBar,
  HiOutlineCalendar,
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
  groupDetails,
  totalGroupSpend,
  netPosition,
  summary,
}) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
    };
  };

  const createdDate = groupDetails?.data?.created_at
    ? formatDate(groupDetails.data.created_at)
    : null;

  return (
    <section className={styles.sidebarSection}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <span className={styles.topLabel}>Group Analytics</span>
          <h3>Group Overview</h3>
        </div>
        <div className={styles.iconWrap}>
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
              रू {totalGroupSpend.toLocaleString()}
            </div>
          </div>

          {summary && (
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <HiOutlineChartBar /> My Share
              </div>
              <div className={`${styles.statValue} ${styles.highlight}`}>
                रू {summary.myTotalShare.toLocaleString()}
              </div>
            </div>
          )}

          {summary && (
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <HiOutlineCurrencyDollar /> Paid by Me
              </div>
              <div className={styles.statValue}>
                रू {summary.totalPaidByMe.toLocaleString()}
              </div>
            </div>
          )}

          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <HiOutlineChartBar /> Net Balance
            </div>
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

      {createdDate && (
        <div className={styles.createdInfo}>
          <HiOutlineCalendar />
          <span className={styles.label}>Protocol Initiated:</span>
          <span className={styles.value}>
            {createdDate.month} {createdDate.day}, {createdDate.year}
          </span>
        </div>
      )}
    </section>
  );
};

export default GroupStats;
