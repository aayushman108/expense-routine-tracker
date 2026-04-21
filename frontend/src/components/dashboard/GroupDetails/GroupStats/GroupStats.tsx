import React from "react";
import styles from "./GroupStats.module.scss";
import type { GroupDetails } from "@/lib/types";

interface GroupStatsProps {
  groupDetails: { data: GroupDetails | null };
  totalGroupSpend: number;
  netPosition: number;
}

const GroupStats: React.FC<GroupStatsProps> = ({
  groupDetails,
  totalGroupSpend,
  netPosition,
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
      <h3>Group Overview</h3>
      <div className={styles.statsContainer}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Spending</span>
          <span className={styles.statValue}>
            रू {totalGroupSpend.toLocaleString()}
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Your Net Balance</span>
          <span
            className={`${styles.statValue} ${
              netPosition > 0
                ? styles.success
                : netPosition < 0
                  ? styles.danger
                  : ""
            }`}
          >
            {netPosition > 0 ? "+" : ""} रू {netPosition.toLocaleString()}
          </span>
        </div>
      </div>
      {createdDate && (
        <div className={styles.createdInfo}>
          <span className={styles.label}>Created:</span>
          <span className={styles.value}>
            {createdDate.month} {createdDate.day}, {createdDate.year}
          </span>
        </div>
      )}
    </section>
  );
};

export default GroupStats;
