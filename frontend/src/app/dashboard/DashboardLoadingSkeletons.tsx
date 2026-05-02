import React from "react";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./dashboard.module.scss";

/** ── Verification Banner Skeleton ── */
export const VerificationBannerSkeleton = () => (
  <div
    className={styles.verificationBanner}
    style={{ animation: "none", opacity: 1 }}
  >
    <div className={styles.bannerContent}>
      <Skeleton width={24} height={24} borderRadius="6px" flexShrink={0} />
      <div className={styles.bannerText}>
        <Skeleton width={240} height={14} />
        <Skeleton width={320} height={12} style={{ marginTop: "4px" }} />
      </div>
    </div>
    <Skeleton width={120} height={34} borderRadius="8px" flexShrink={0} />
  </div>
);

/** ── Infrastructure Stats Row ── */
const statSkeletonData = [
  { label: "Total Asset Flow", color: "blue" },
  { label: "Total Personal Expense", color: "purple" },
  { label: "Operational Groups", color: "green" },
  { label: "Net Assets", color: "green" },
];

export const StatsSkeleton = () => (
  <section className={styles.stats}>
    {statSkeletonData.map((stat, i) => (
      <div
        key={i}
        className={`${styles.statCard} ${styles[stat.color]}`}
        style={{ animation: "none", opacity: 1 }}
      >
        <div className={styles.statGlow} />
        <div className={styles.statHeader}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{stat.label}</span>
            <Skeleton
              width="100%"
              maxWidth={150}
              height={28}
              borderRadius="6px"
              style={{ marginTop: "2px" }}
            />
          </div>
          <div className={styles.iconWrapper}>
            <Skeleton width={20} height={20} borderRadius="4px" />
          </div>
        </div>
      </div>
    ))}
  </section>
);

/** ── Private Ledger Card Skeleton ── */
export const PrivateLedgerSkeleton = () => (
  <div className={styles.personalCard}>
    <div className={styles.personalContent}>
      <div className={styles.cardHeader}>
        <Skeleton width={180} height={10} />
        <Skeleton
          width="100%"
          maxWidth={340}
          height={28}
          style={{ marginTop: "6px" }}
        />
      </div>

      <div className={styles.mainStats}>
        <div className={styles.mainStat}>
          <Skeleton width={130} height={10} />
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            <Skeleton width={180} height={36} />
            <Skeleton width={90} height={20} borderRadius="4px" />
          </div>

          <div className={styles.breakdownRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.subStat}>
                <Skeleton
                  width={36}
                  height={36}
                  borderRadius="8px"
                  flexShrink={0}
                />
                <div className={styles.subInfo}>
                  <Skeleton width={80} height={9} />
                  <Skeleton
                    width={100}
                    height={16}
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/** ── Financial Health Card Skeleton ── */
export const FinancialHealthSkeleton = () => (
  <div className={styles.healthCard}>
    <div className={styles.healthHeader}>
      <div className={styles.healthTitleContainer}>
        <Skeleton width={140} height={20} />
        <Skeleton width={8} height={8} borderRadius="50%" />
      </div>
      <Skeleton
        width="100%"
        maxWidth={260}
        height={12}
        style={{ marginTop: "4px" }}
      />
    </div>

    <div className={styles.healthMain}>
      <div className={styles.legendItem}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Skeleton width={8} height={8} borderRadius="50%" />
          <Skeleton width={60} height={10} />
        </div>
        <Skeleton width={100} height={20} style={{ marginTop: "6px" }} />
      </div>

      <div className={styles.pieContainer}>
        <Skeleton width={140} height={140} borderRadius="50%" />
      </div>

      <div className={`${styles.legendItem} ${styles.legendItemRight}`}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Skeleton width={8} height={8} borderRadius="50%" />
          <Skeleton width={50} height={10} />
        </div>
        <Skeleton width={100} height={20} style={{ marginTop: "6px" }} />
      </div>
    </div>
  </div>
);

/** ── Personal Overview Skeleton (composed) ── */
export const PersonalOverviewSkeleton = () => (
  <section className={styles.personalOverview}>
    <PrivateLedgerSkeleton />
    <FinancialHealthSkeleton />
  </section>
);

/** ── Expenditure Analytics Chart ── */
export const ChartSkeleton = () => (
  <div
    style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-light)",
      borderRadius: "12px",
      padding: "24px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "24px",
      }}
    >
      <div>
        <Skeleton
          width={180}
          height={20}
          style={{ marginBottom: "8px" }}
        />
        <Skeleton width={300} height={12} />
      </div>
      <Skeleton width={90} height={16} />
    </div>
    <Skeleton width="100%" height={240} borderRadius="8px" />
  </div>
);

/** ── Full Dashboard Skeleton ── */
export const FullDashboardSkeleton = () => (
  <div className={styles.dashboard}>
    <StatsSkeleton />
    <PersonalOverviewSkeleton />
    <section className={styles.chartSection}>
      <ChartSkeleton />
    </section>
  </div>
);
