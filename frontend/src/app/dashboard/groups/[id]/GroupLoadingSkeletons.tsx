import React from "react";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./group-details.module.scss";

export const GroupHeaderSkeleton = () => (
  <header className={styles.header}>
    <div className={styles.titleArea}>
      <Skeleton width={120} height={16} />
      <div className={styles.groupInfo}>
        <Skeleton width={64} height={64} borderRadius="1rem" />
        <div
          className={styles.textDetails}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <Skeleton width={200} height={32} />
          <Skeleton width={300} height={16} />
        </div>
      </div>
    </div>
    <div className={styles.actions}>
      <Skeleton width={80} height={36} borderRadius="8px" />
      <Skeleton width={120} height={36} borderRadius="8px" />
    </div>
  </header>
);

export const ExpenseListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className={styles.expenseList}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.expenseCard} style={{ width: "100%" }}>
        <Skeleton width="100%" height={80} />
        <div
          style={{
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
          }}
        >
          <Skeleton width="100%" height={22} />
          <div style={{ display: "flex", gap: "8px" }}>
            <Skeleton width={60} height={20} borderRadius="20px" />
            <Skeleton width={80} height={20} borderRadius="20px" />
          </div>
        </div>
        <div
          style={{
            padding: "0.5rem 1.25rem",
            borderTop: "1px solid var(--border-light)",
            width: "100%",
          }}
        >
          <Skeleton width="100%" height={14} />
        </div>
      </div>
    ))}
  </div>
);

export const BalanceSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className={styles.loadingWrapper}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.settlementCard}>
        <div
          className={styles.party}
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        >
          <Skeleton width={60} height={10} />
          <Skeleton width={120} height={20} />
        </div>
        <div className={styles.arrow} style={{ border: "none" }}>
          <Skeleton width={24} height={24} borderRadius="50%" />
        </div>
        <div
          className={styles.party}
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        >
          <Skeleton width={40} height={10} />
          <Skeleton width={120} height={20} />
        </div>
        <div
          className={styles.amountWrap}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "flex-end",
          }}
        >
          <Skeleton width={80} height={24} />
          <Skeleton width={100} height={32} borderRadius="8px" />
        </div>
      </div>
    ))}
  </div>
);

export const GroupStatsSkeleton = () => (
  <section className={styles.sidebarSection}>
    <Skeleton width={100} height={12} style={{ marginBottom: "1.25rem" }} />
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Skeleton height={100} borderRadius="1rem" />
      <Skeleton height={100} borderRadius="1rem" />
    </div>
    <div
      style={{
        marginTop: "1rem",
        paddingTop: "1rem",
        borderTop: "1px solid var(--border-light)",
      }}
    >
      <Skeleton width={150} height={12} />
    </div>
  </section>
);

export const MemberListSkeleton = ({ count = 3 }: { count?: number }) => (
  <section className={styles.sidebarSection}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "1.25rem",
      }}
    >
      <Skeleton width={80} height={12} />
      <Skeleton width={30} height={12} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Skeleton width={40} height={40} borderRadius="50%" />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="80%" height={10} />
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: "1.5rem" }}>
      <Skeleton width="100%" height={36} borderRadius="8px" />
    </div>
  </section>
);

export const FullPageSkeleton = () => (
  <div className={styles.page}>
    <GroupHeaderSkeleton />
    <div className={styles.contentGrid}>
      <div className={styles.mainColumn}>
        <div
          className={styles.tabHeader}
          style={{ display: "flex", gap: "12px", marginBottom: "1rem" }}
        >
          <Skeleton width={100} height={32} borderRadius="12px" />
          <Skeleton width={100} height={32} borderRadius="12px" />
        </div>
        <ExpenseListSkeleton count={3} />
      </div>
      <div className={styles.sidebarColumn} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <GroupStatsSkeleton />
        <MemberListSkeleton />
      </div>
    </div>
  </div>
);
