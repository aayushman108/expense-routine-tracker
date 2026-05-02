import React, { useMemo } from "react";
import {
  HiOutlineShoppingBag,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import styles from "./GroupStats.module.scss";
import { GroupStatsSkeleton } from "@/app/dashboard/groups/[id]/GroupLoadingSkeletons";
import { useAppSelector } from "@/store/hooks";
import { useParams } from "next/navigation";

const GroupStats = () => {
  const { isGroupSummariesLoading, groupSummaries } = useAppSelector(
    (s) => s.expenses,
  );
  const { id } = useParams();

  const currentGroupSummary = useMemo(() => {
    return groupSummaries.find((gs) => gs.id === id);
  }, [groupSummaries, id]);

  console.log(isGroupSummariesLoading, "IS GROUP SUMMARY LOADING");

  if (isGroupSummariesLoading) return <GroupStatsSkeleton />;

  if (!groupSummaries?.length || !currentGroupSummary) return null;

  const { totalGroupSpend, myTotalShare, totalPaidByMe } = currentGroupSummary;

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
