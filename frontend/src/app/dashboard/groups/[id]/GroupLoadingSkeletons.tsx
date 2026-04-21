import React from "react";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./group-details.module.scss";

export const GroupHeaderSkeleton = () => (
  <header className={styles.header}>
    <div className={styles.titleArea}>
      <Skeleton width={120} height={16} />
      <div className={styles.groupInfo}>
        <Skeleton width={64} height={64} borderRadius="1rem" />
        <div className={styles.textDetails}>
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
      <div key={i} className={styles.expenseCard}>
        <Skeleton height={80} />
        <div style={{ padding: "1.25rem" }}>
          <Skeleton width="90%" height={22} className="mb-2" />
          <div style={{ display: "flex", gap: "8px" }}>
            <Skeleton width={60} height={20} borderRadius="20px" />
            <Skeleton width={80} height={20} borderRadius="20px" />
          </div>
        </div>
        <div
          style={{
            padding: "0.5rem 1.25rem",
            borderTop: "1px solid var(--border-light)",
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
        <div className={styles.party}>
          <Skeleton width={60} height={10} className="mb-1" />
          <Skeleton width={120} height={20} />
        </div>
        <div className={styles.arrow} style={{ border: "none" }}>
          <Skeleton width={24} height={24} borderRadius="50%" />
        </div>
        <div className={styles.party}>
          <Skeleton width={40} height={10} className="mb-1" />
          <Skeleton width={120} height={20} />
        </div>
        <div className={styles.amountWrap}>
          <Skeleton width={80} height={24} className="mb-2" />
          <Skeleton width={100} height={32} borderRadius="8px" />
        </div>
      </div>
    ))}
  </div>
);

export const FullPageSkeleton = () => (
  <div className={styles.page}>
    <GroupHeaderSkeleton />
    <div className={styles.contentGrid}>
      <div className={styles.mainColumn}>
        <div className={styles.tabHeader}>
          <Skeleton width={100} height={32} borderRadius="12px" />
          <Skeleton width={100} height={32} borderRadius="12px" />
        </div>
        <ExpenseListSkeleton count={3} />
      </div>
      <div className={styles.sidebarColumn}>
        <Skeleton height={200} borderRadius="1rem" />
        <Skeleton height={300} borderRadius="1rem" />
      </div>
    </div>
  </div>
);
