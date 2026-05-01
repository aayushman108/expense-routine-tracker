import React from "react";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./personal.module.scss";

export const PersonalHeaderSkeleton = () => (
  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton width={120} height={12} />
      <Skeleton width={200} height={24} />
    </div>
    <Skeleton width={100} height={36} borderRadius="6px" />
  </header>
);

export const PersonalExpenseListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Skeleton width="40%" height={18} />
          <Skeleton width="20%" height={24} borderRadius="4px" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton width="30%" height={14} />
          <Skeleton width="25%" height={14} />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) => (
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

export const FullPersonalSkeleton = () => (
  <div className={styles.page}>
    <PersonalHeaderSkeleton />
    
    <section style={{ marginBottom: '1.5rem' }}>
      <Skeleton width="100%" height={250} borderRadius="8px" />
    </section>

    <section className={styles.expenseSection}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <Skeleton width={150} height={20} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Skeleton width={140} height={32} borderRadius="4px" />
          <Skeleton width={80} height={32} borderRadius="4px" />
        </div>
      </div>
      <TableSkeleton rows={8} />
    </section>
  </div>
);
