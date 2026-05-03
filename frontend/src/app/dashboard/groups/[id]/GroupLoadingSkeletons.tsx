import React from "react";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./group-details.module.scss";
import headerStyles from "@/components/dashboard/GroupDetails/GroupHeader/GroupHeader.module.scss";
import statsStyles from "@/components/dashboard/GroupDetails/GroupStats/GroupStats.module.scss";
import filterStyles from "@/components/dashboard/GroupDetails/ExpenseFilters/ExpenseFilters.module.scss";

export const GroupHeaderSkeleton = () => (
  <header className={headerStyles.header}>
    <div className={headerStyles.titleArea}>
      <div className={headerStyles.backBtn}>
        <Skeleton width={80} height={12} />
      </div>
      <div className={headerStyles.groupInfo}>
        <div className={headerStyles.groupImage}>
          <Skeleton width="100%" height="100%" />
        </div>
        <div className={headerStyles.textDetails}>
          <div className={headerStyles.titleWithAction}>
            <Skeleton width={180} height={24} />
          </div>
          <Skeleton width={300} height={14} />
        </div>
      </div>
    </div>
    <div className={headerStyles.actions}>
      <Skeleton width={110} height={36} borderRadius="6px" />
      <Skeleton width={36} height={36} borderRadius="6px" />
    </div>
  </header>
);

export const FilterSkeleton = () => (
  <div className={`${filterStyles.filterBar} ${filterStyles.isStatic}`}>
    <div className={filterStyles.filterGroup}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={filterStyles.inputWrapper}>
          <Skeleton width={60} height={10} style={{ marginBottom: '4px' }} />
          <Skeleton width={160} height={32} borderRadius="4px" />
        </div>
      ))}
      <div className={filterStyles.filterActions}>
        <Skeleton width={80} height={32} borderRadius="4px" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
    <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '1rem' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} width="100%" height={14} style={{ flex: i === 1 ? 2 : 1 }} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ padding: '0.875rem 1rem', display: 'flex', gap: '1rem', borderBottom: i === rows - 1 ? 'none' : '1px solid var(--border-light)' }}>
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} width="100%" height={14} style={{ flex: j === 1 ? 2 : 1 }} />
        ))}
      </div>
    ))}
  </div>
);

export const ExpenseCardSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className={styles.expenseSection}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <Skeleton width={80} height={14} />
          <Skeleton width={60} height={20} borderRadius="4px" />
        </div>
        <Skeleton width="100%" height={18} style={{ marginBottom: '0.5rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Skeleton width={24} height={24} borderRadius="50%" />
            <Skeleton width={80} height={14} />
          </div>
          <Skeleton width={100} height={24} />
        </div>
      </div>
    ))}
  </div>
);

export const GroupStatsSkeleton = () => (
  <div className={statsStyles.statsGrid}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className={statsStyles.statCard}>
        <div className={statsStyles.iconWrapper}>
          <Skeleton width={20} height={20} borderRadius="4px" />
        </div>
        <div className={statsStyles.statInfo}>
          <Skeleton width={60} height={10} style={{ marginBottom: '4px' }} />
          <Skeleton width={100} height={18} />
        </div>
      </div>
    ))}
  </div>
);

export const FullPageSkeleton = () => (
  <div className={styles.page}>
    <GroupHeaderSkeleton />
    <div className={styles.contentGrid}>
      <section className={styles.statsSection}>
        <GroupStatsSkeleton />
      </section>
      <div className={styles.mainColumn}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Skeleton width={90} height={32} borderRadius="4px" />
            <Skeleton width={90} height={32} borderRadius="4px" />
          </div>
          <Skeleton width={120} height={32} borderRadius="4px" />
        </div>
        <FilterSkeleton />
        <TableSkeleton />
      </div>
    </div>
  </div>
);

export const GroupSettingsSkeleton = () => (
  <div className={styles.page} style={{ maxWidth: '800px', margin: '0 auto', padding: '1.25rem 0.5rem', width: '100%', gap: '1.25rem', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Skeleton width={100} height={12} />
      <Skeleton width={180} height={28} style={{ marginTop: '0.25rem' }} />
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <section style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-default)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <Skeleton width={80} height={18} style={{ marginBottom: '0.25rem' }} />
            <Skeleton width={220} height={14} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Skeleton width={120} height={32} borderRadius="4px" />
            <Skeleton width={100} height={32} borderRadius="4px" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: i === 2 ? 'none' : '1px solid var(--border-light)' }}>
              <Skeleton width={40} height={40} borderRadius="50%" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Skeleton width={140} height={16} />
                <Skeleton width={200} height={12} />
                <Skeleton width={60} height={10} style={{ marginTop: '0.25rem' }} />
              </div>
              <Skeleton width={24} height={24} />
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-default)', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--color-danger)' }} />
        <div style={{ marginBottom: '1rem' }}>
          <Skeleton width={100} height={18} style={{ marginBottom: '0.25rem' }} />
          <Skeleton width={260} height={14} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: '6px', flexWrap: 'wrap' }}>
          <div>
            <Skeleton width={90} height={16} style={{ marginBottom: '0.25rem' }} />
            <Skeleton width={320} height={12} />
          </div>
          <Skeleton width={110} height={32} borderRadius="4px" />
        </div>
      </section>
    </div>
  </div>
);
