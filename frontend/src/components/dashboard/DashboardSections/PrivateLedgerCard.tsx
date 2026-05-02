import { HiOutlineUser, HiOutlineUsers, HiOutlineScale } from "react-icons/hi";
import styles from "@/app/dashboard/dashboard.module.scss";
import { IMonthlyAnalytics } from "@/lib/types";
import { PrivateLedgerSkeleton } from "@/app/dashboard/DashboardLoadingSkeletons";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";

interface PrivateLedgerCardProps {
  details: IMonthlyAnalytics | null | undefined;
}

export default function PrivateLedgerCard({ details }: PrivateLedgerCardProps) {
  const { monthlyAnalyticsLoading } = useAppSelector(
    (s: RootState) => s.expenses,
  );

  if (monthlyAnalyticsLoading || !details) {
    return <PrivateLedgerSkeleton />;
  }

  const {
    totalExpense = 0,
    personalExpense = 0,
    groupExpense = 0,
    netGroupFlow = 0,
  } = details ?? {};

  const currentMonthName = new Date().toLocaleString("default", {
    month: "long",
  });
  const currentYear = new Date().getFullYear();

  const currentMonthTotal = totalExpense || 0;
  const currentMonthPersonal = personalExpense || 0;
  const currentMonthGroupShare = groupExpense || 0;
  const currentMonthNetFlow = netGroupFlow || 0;

  return (
    <div className={styles.personalCard}>
      <div className={styles.cardGlow}></div>
      <div className={styles.personalContent}>
        <div className={styles.cardHeader}>
          <p>SECURE_PERSONAL_SESSION</p>
          <h2>
            Private Ledger — {currentMonthName} {currentYear}
          </h2>
        </div>

        <div className={styles.mainStats}>
          <div className={styles.mainStat}>
            <span className={styles.mainStatLabel}>Monthly Expenditure</span>
            <div className={styles.mainStatValue}>
              <h3>रू {currentMonthTotal.toLocaleString()}</h3>
              <span className={styles.labelIndicator}>Current Month</span>
            </div>
            <div className={styles.breakdownRow}>
              <div className={styles.subStat}>
                <div className={styles.subIcon}>
                  <HiOutlineUser />
                </div>
                <div className={styles.subInfo}>
                  <span className={styles.subLabel}>Personal Ledger</span>
                  <span className={styles.subValue}>
                    रू {currentMonthPersonal.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className={styles.subStat}>
                <div className={styles.subIcon}>
                  <HiOutlineUsers />
                </div>
                <div className={styles.subInfo}>
                  <span className={styles.subLabel}>Group Shares</span>
                  <span className={styles.subValue}>
                    रू {currentMonthGroupShare.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className={styles.subStat}>
                <div className={styles.subIcon}>
                  <HiOutlineScale />
                </div>
                <div className={styles.subInfo}>
                  <span className={styles.subLabel}>Net Position</span>
                  <span
                    className={`${styles.subValue} ${currentMonthNetFlow >= 0 ? styles.success : styles.danger}`}
                  >
                    {currentMonthNetFlow >= 0 ? "+" : ""}रू{" "}
                    {Math.abs(currentMonthNetFlow).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
