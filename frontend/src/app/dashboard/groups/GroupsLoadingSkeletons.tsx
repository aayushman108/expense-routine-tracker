import React from "react";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./groups.module.scss";
import cardStyles from "@/components/dashboard/GroupCard/GroupCard.module.scss";

export const GroupCardSkeleton = () => (
  <div className={cardStyles.groupCard}>
    <div className={cardStyles.image}>
      <Skeleton width="100%" height="100%" />
    </div>
    <div className={cardStyles.cardDetails}>
      <div className={cardStyles.topRow}>
        <div className={cardStyles.nameAndBadge}>
          <Skeleton width={140} height={24} borderRadius="4px" />
          <Skeleton width={50} height={18} borderRadius="20px" />
        </div>
      </div>
      <div className={cardStyles.description} style={{ marginTop: "12px" }}>
        <Skeleton width="100%" height={14} style={{ marginBottom: "8px" }} />
        <Skeleton width="60%" height={14} />
      </div>

      <div className={cardStyles.balanceArea}>
        <div className={cardStyles.balanceLabelWrapper}>
          <Skeleton width={16} height={16} borderRadius="4px" style={{ marginRight: '8px' }} />
          <Skeleton width={70} height={10} />
        </div>
        <Skeleton width={90} height={20} borderRadius="4px" />
      </div>
    </div>
    <div className={cardStyles.footer}>
      <Skeleton width={110} height={10} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Skeleton width={14} height={14} borderRadius="50%" />
        <Skeleton width={60} height={10} />
      </div>
    </div>
  </div>
);

export const GroupsGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className={styles.grid}>
    {Array.from({ length: count }).map((_, i) => (
      <GroupCardSkeleton key={i} />
    ))}
  </div>
);

export const GroupsPageSkeleton = () => (
  <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <Skeleton width={120} height={12} style={{ marginBottom: '1.5rem' }} />
        <Skeleton width={200} height={10} style={{ marginBottom: '0.5rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Skeleton width={48} height={48} borderRadius="12px" />
          <Skeleton width={280} height={40} borderRadius="4px" />
        </div>
        <Skeleton width="100%" maxWidth={600} height={14} style={{ marginTop: '1rem' }} />
        <Skeleton width="80%" maxWidth={400} height={14} style={{ marginTop: '0.5rem' }} />
      </div>
      <div className={styles.actions}>
        <Skeleton width={160} height={40} borderRadius="8px" />
      </div>
    </header>

    <div className={styles.controls}>
      <Skeleton width="100%" maxWidth={460} height={44} borderRadius="8px" />
    </div>

    <GroupsGridSkeleton count={6} />
  </div>
);
