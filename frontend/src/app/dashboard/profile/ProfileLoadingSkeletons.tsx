import React from "react";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./profile.module.scss";

/** ── Header Skeleton ── */
const HeaderSkeleton = () => (
  <header className={styles.header}>
    <div className={styles.titleArea}>
      <Skeleton width={140} height={11} borderRadius="4px" />
      <Skeleton
        width={180}
        height={10}
        borderRadius="4px"
        style={{ marginTop: "8px" }}
      />
      <div className={styles.titleWrapper} style={{ marginTop: "4px" }}>
        <Skeleton width={48} height={48} borderRadius="12px" flexShrink={0} />
        <Skeleton width={200} height={38} borderRadius="8px" />
      </div>
      <Skeleton
        width="100%"
        maxWidth={460}
        height={14}
        borderRadius="4px"
        style={{ marginTop: "8px" }}
      />
    </div>
  </header>
);

/** ── Profile Hero (Avatar + Info) Skeleton ── */
const ProfileHeroSkeleton = () => (
  <div className={styles.profileHero}>
    <div className={styles.avatarSection}>
      <Skeleton width={120} height={120} borderRadius="50%" />
    </div>
    <div className={styles.infoSection}>
      <Skeleton width={180} height={22} borderRadius="6px" />
      <Skeleton
        width={220}
        height={14}
        borderRadius="4px"
        style={{ marginTop: "4px" }}
      />
      <Skeleton
        width={160}
        height={12}
        borderRadius="4px"
        style={{ marginTop: "12px" }}
      />
    </div>
  </div>
);

/** ── User Details Card Skeleton ── */
const UserDetailsCardSkeleton = () => (
  <div className={styles.card}>
    <ProfileHeroSkeleton />

    <div className={styles.sectionHeader}>
      <Skeleton width={180} height={18} borderRadius="6px" />
      <Skeleton width={36} height={36} borderRadius="10px" />
    </div>

    <div className={styles.detailsGrid}>
      {["Full Name", "Email Address", "Phone Number"].map((label) => (
        <div key={label} className={styles.detailItem}>
          <span className={styles.detailLabel}>{label}</span>
          <Skeleton
            width="100%"
            maxWidth={200}
            height={16}
            borderRadius="4px"
            style={{ marginTop: "4px" }}
          />
        </div>
      ))}
    </div>
  </div>
);

/** ── Account Security Card Skeleton ── */
const SecurityCardSkeleton = () => (
  <div className={styles.card}>
    <div className={styles.sectionHeader}>
      <Skeleton width={180} height={18} borderRadius="6px" />
    </div>
    <div className={styles.detailsGrid}>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Password</span>
        <Skeleton width={120} height={16} borderRadius="4px" />
      </div>
      <Skeleton width={140} height={34} borderRadius="8px" />
    </div>

    <div className={styles.sessionRow}>
      <div className={styles.sessionCopy}>
        <Skeleton width={60} height={12} borderRadius="4px" />
        <Skeleton
          width="100%"
          maxWidth={360}
          height={14}
          borderRadius="4px"
          style={{ marginTop: "4px" }}
        />
      </div>
      <Skeleton width={100} height={34} borderRadius="8px" />
    </div>
  </div>
);

/** ── Payment Methods Skeleton ── */
const PaymentMethodsSkeleton = () => (
  <section className={styles.paymentSection}>
    <div className={styles.paymentHeader}>
      <Skeleton width={180} height={18} borderRadius="6px" />
      <Skeleton width={100} height={34} borderRadius="8px" />
    </div>

    <div className={styles.paymentGrid}>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className={styles.pmCard}>
          <div className={styles.pmCardTop}>
            <Skeleton
              width={44}
              height={44}
              borderRadius="10px"
              flexShrink={0}
            />
            <div className={styles.pmInfo}>
              <Skeleton width={120} height={16} borderRadius="4px" />
              <Skeleton
                width={160}
                height={14}
                borderRadius="4px"
                style={{ marginTop: "4px" }}
              />
            </div>
            <Skeleton width={60} height={20} borderRadius="12px" />
          </div>
          <div className={styles.pmActions}>
            <Skeleton width={50} height={24} borderRadius="4px" />
            <Skeleton width={50} height={24} borderRadius="4px" />
            <Skeleton width={50} height={24} borderRadius="4px" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

/** ── Full Profile Page Skeleton ── */
export const FullProfileSkeleton = () => (
  <div className={styles.page}>
    <HeaderSkeleton />

    <div className={styles.profileLayout}>
      <div className={styles.leftColumn} style={{ animation: "none", opacity: 1 }}>
        <UserDetailsCardSkeleton />
        <SecurityCardSkeleton />
      </div>

      <div className={styles.rightColumn} style={{ animation: "none", opacity: 1 }}>
        <PaymentMethodsSkeleton />
      </div>
    </div>
  </div>
);
