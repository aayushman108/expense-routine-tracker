import React from "react";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./personal.module.scss";

export const PersonalHeaderSkeleton = () => (
  <header className={styles.header}>
    <div className={styles.titleArea}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <Skeleton width={80} height={10} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Skeleton width={48} height={48} borderRadius="12px" />
        <Skeleton width={250} height={40} />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <Skeleton width="100%" height={16} />
      </div>
    </div>
    <div className={styles.actions}>
      <Skeleton width={120} height={36} borderRadius="6px" />
    </div>
  </header>
);

export const FilterSkeleton = () => (
  <div
    style={{
      padding: "0.625rem",
      background: "var(--bg-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "6px",
      marginBottom: "0.75rem",
      display: "flex",
      gap: "0.75rem",
      flexWrap: "wrap",
    }}
  >
    <div style={{ flex: 1, minWidth: "140px" }}>
      <Skeleton width={40} height={10} style={{ marginBottom: "6px" }} />
      <Skeleton width="100%" height={32} borderRadius="4px" />
    </div>
    <div style={{ flex: 1, minWidth: "140px" }}>
      <Skeleton width={40} height={10} style={{ marginBottom: "6px" }} />
      <Skeleton width="100%" height={32} borderRadius="4px" />
    </div>
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "flex-end",
        flexShrink: 0,
      }}
    >
      <Skeleton width={80} height={32} borderRadius="4px" />
      <Skeleton width={80} height={32} borderRadius="4px" />
    </div>
  </div>
);

export const TrendSkeleton = () => (
  <section
    style={{
      marginBottom: "1.5rem",
      background: "var(--bg-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "12px",
      padding: "1.5rem",
      height: "300px",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Skeleton width={150} height={20} />
      <Skeleton width={100} height={20} />
    </div>
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Skeleton width="100%" height="100%" borderRadius="4px" />
      {/* Optional: Add some subtle line-like shapes if needed */}
    </div>
  </section>
);

export const PersonalExpenseListSkeleton = ({
  count = 6,
}: {
  count?: number;
}) => (
  <div className={styles.groupList}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "8px",
          padding: "1rem",
        }}
      >
        <div style={{ marginBottom: "0.75rem" }}>
          <Skeleton width="80%" height={16} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <Skeleton width="40%" height={20} />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Skeleton width={60} height={18} borderRadius="4px" />
            <Skeleton width={60} height={18} borderRadius="4px" />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-light)",
          }}
        >
          <Skeleton width="30%" height={12} />
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <Skeleton width={24} height={24} borderRadius="4px" />
            <Skeleton width={24} height={24} borderRadius="4px" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({
  rows = 8,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) => (
  <div
    style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "8px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        padding: "0.75rem 1rem",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-light)",
        display: "flex",
        gap: "1rem",
      }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          width="100%"
          height={14}
          style={{ flex: i === 1 ? 3 : 1 }}
        />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        style={{
          padding: "1rem",
          display: "flex",
          gap: "1rem",
          borderBottom: i === rows - 1 ? "none" : "1px solid var(--border-light)",
        }}
      >
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton
            key={j}
            width="100%"
            height={14}
            style={{ flex: j === 1 ? 3 : 1 }}
          />
        ))}
      </div>
    ))}
  </div>
);

export const FullPersonalSkeleton = () => (
  <div className={styles.page}>
    <PersonalHeaderSkeleton />

    <TrendSkeleton />

    <section className={styles.expenseSection}>
      <div className={styles.groupSection}>
        <div className={styles.groupHeader}>
          <Skeleton width={180} height={24} />
          <div className={styles.filterActions}>
            <Skeleton width={100} height={32} borderRadius="4px" />
          </div>
        </div>

        <FilterSkeleton />

        <TableSkeleton />
      </div>
    </section>
  </div>
);
