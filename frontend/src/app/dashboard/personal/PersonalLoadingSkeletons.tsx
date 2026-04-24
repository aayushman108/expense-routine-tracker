import React from "react";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./personal.module.scss";

export const StatsSkeleton = () => (
  <div className={styles.summaryCards}>
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className={styles.statCard} style={{ minHeight: "120px" }}>
        <div className={styles.statHeader}>
          <div className={styles.statInfo}>
            <Skeleton width="100%" maxWidth={80} height={12} style={{ marginBottom: "8px" }} />
            <Skeleton width="100%" maxWidth={120} height={28} />
          </div>
          <Skeleton width={40} height={40} borderRadius="10px" />
        </div>
        <Skeleton width="60%" height={10} style={{ marginTop: "16px" }} />
      </div>
    ))}
  </div>
);

export const PersonalExpenseListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className={styles.groupList}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.expenseCard} style={{ minHeight: "180px", cursor: "default" }}>
        <div className={styles.cardHeader}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <Skeleton width={30} height={12} />
            <Skeleton width={80} height={24} />
          </div>
          <Skeleton width={44} height={48} borderRadius="8px" />
        </div>
        <div className={styles.cardBody}>
          <Skeleton width="90%" height={16} />
          <Skeleton width="40%" height={12} style={{ marginTop: "8px" }} />
        </div>
        <div className={styles.cardFooter}>
          <Skeleton width={80} height={12} />
          <div style={{ display: "flex", gap: "8px" }}>
            <Skeleton width={28} height={28} borderRadius="50%" />
            <Skeleton width={28} height={28} borderRadius="50%" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div style={{ 
    background: "var(--bg-card)", 
    border: "1px solid var(--border-light)", 
    borderRadius: "12px", 
    padding: "24px" 
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
      <div>
        <Skeleton width={160} height={20} style={{ marginBottom: "8px" }} />
        <Skeleton width={260} height={12} />
      </div>
      <Skeleton width={80} height={16} />
    </div>
    <Skeleton width="100%" height={200} borderRadius="8px" />
  </div>
);

export const FullPersonalSkeleton = () => (
  <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <Skeleton width="100%" maxWidth={120} height={14} style={{ marginBottom: "16px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px", width: "100%" }}>
          <Skeleton width={48} height={48} borderRadius="12px" flexShrink={0} />
          <Skeleton width="100%" maxWidth={300} height={40} />
        </div>
        <Skeleton width="100%" maxWidth={500} height={14} style={{ marginTop: "16px" }} />
      </div>
      <div className={styles.actions}>
        <Skeleton width={120} height={36} borderRadius="8px" />
      </div>
    </header>



    <ChartSkeleton />

    <div className={styles.expenseSection}>
      <div className={styles.groupSection}>
        <div className={styles.groupHeader} style={{ marginBottom: "1rem" }}>
          <Skeleton width={200} height={24} />
          <Skeleton width={100} height={32} borderRadius="8px" />
        </div>
        <PersonalExpenseListSkeleton count={3} />
      </div>
    </div>
  </div>
);
