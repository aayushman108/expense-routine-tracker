import styles from "@/app/dashboard/dashboard.module.scss";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { FinancialHealthSkeleton } from "@/app/dashboard/DashboardLoadingSkeletons";

export default function FinancialHealthCard() {
  const { summary, isSummaryLoading } = useAppSelector(
    (s: RootState) => s.expenses,
  );

  const owedToYou = summary?.remainingToReceive || 0;
  const youOwe = summary?.remainingToPay || 0;
  const netBalance = youOwe - owedToYou;

  const totalBalance = owedToYou + youOwe;
  const payablePercent = totalBalance > 0 ? (youOwe / totalBalance) * 100 : 0;

  if (isSummaryLoading || !summary) {
    return <FinancialHealthSkeleton />;
  }

  return (
    <div className={styles.healthCard}>
      <div className={styles.healthHeader}>
        <div className={styles.healthTitleContainer}>
          <h3>Financial Health</h3>
          <div className={styles.pulse}></div>
        </div>
        <p>Liquidity position across all settlement channels.</p>
      </div>

      <div className={styles.healthMain}>
        <div className={styles.legendItem}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              className={styles.legendDot}
              style={{ background: "var(--color-danger)" }}
            ></span>
            <span className={styles.legendLabel}>Receivable</span>
          </div>
          <span className={styles.legendValueDanger}>
            रू {owedToYou.toLocaleString()}
          </span>
        </div>

        <div className={styles.pieContainer}>
          <div
            className={styles.pieChart}
            style={{
              background:
                totalBalance === 0
                  ? "var(--bg-tertiary)"
                  : `conic-gradient(var(--color-success) 0% ${payablePercent}%, var(--color-danger) ${payablePercent}% 100%)`,
            }}
          >
            <div className={styles.pieInner}>
              <div
                className={`${styles.netLiquidityPill} ${netBalance >= 0 ? styles.positiveStatus : styles.negativeStatus}`}
              >
                {netBalance >= 0 ? "+" : "-"}रू{" "}
                {Math.abs(netBalance).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.legendItem} ${styles.legendItemRight}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              className={styles.legendDot}
              style={{ background: "var(--color-success)" }}
            ></span>
            <span className={styles.legendLabel}>Payable</span>
          </div>
          <span className={styles.legendValueSuccess}>
            रू {youOwe.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
