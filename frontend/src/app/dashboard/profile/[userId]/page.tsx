"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCreditCard,
  HiOutlineChevronLeft,
} from "react-icons/hi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import Card from "@/components/ui/Card/Card";
import styles from "../profile.module.scss";
import type { RootState } from "@/store";
import { PAYMENT_METHOD_TYPE } from "@expense-tracker/shared/enum/payment.enum";
import { BankCard } from "@/components/dashboard/BankCard/BankCard";
import { WalletCard } from "@/components/dashboard/WalletCard/WalletCard";
import { showToast } from "@/lib/toast";
import { FullProfileSkeleton } from "../ProfileLoadingSkeletons";

import { handleThunk } from "@/lib/utils";
import {
  fetchUserProfileAction,
  clearUserProfile,
} from "@/store/slices/userSlice";
import { ToastType } from "@/enums/general.enum";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userId = params.userId as string;

  const currentUser = useAppSelector((s: RootState) => s.auth.user);

  const { data: userProfileData, isLoading } = useAppSelector(
    (s: RootState) => s.users.userProfile,
  );

  const profileUser = userProfileData?.user;
  const paymentMethods = userProfileData?.paymentMethods || [];

  // If viewing own profile, redirect to /dashboard/profile
  useEffect(() => {
    if (currentUser && userId === currentUser.id) {
      router.replace("/dashboard/profile");
    }
  }, [currentUser, userId, router]);

  useEffect(() => {
    if (userId && currentUser && userId !== currentUser.id) {
      handleThunk(dispatch(fetchUserProfileAction(userId)));
    }

    return () => {
      dispatch(clearUserProfile());
    };
  }, [userId, currentUser, dispatch]);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(ToastType.SUCCESS, `${label} copied to clipboard`);
  };

  if (isLoading || !profileUser) {
    return <FullProfileSkeleton />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <button
            className={styles.backBtn}
            onClick={() => router.push("/dashboard")}
          >
            <HiOutlineChevronLeft /> Back to Dashboard
          </button>
          <div className={styles.headerContent}>
            <div className={styles.pageIcon}>
              <HiOutlineUser />
            </div>
            <div className={styles.textDetails}>
              <div className={styles.titleRow}>
                <h1>{profileUser.full_name}&apos;s Profile</h1>
                <div className={styles.badge}>VIEWING_MEMBER</div>
              </div>
              <p>
                Viewing member details, personal information, and payment methods.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          {/* ── User Details Card ── */}
          <Card className={styles.card}>
            <div className={styles.profileHero}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {profileUser.avatar?.url ? (
                    <Image
                      src={profileUser.avatar.url}
                      alt={profileUser.full_name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    getInitials(profileUser.full_name)
                  )}
                </div>
              </div>
              <div className={styles.infoSection}>
                <span className={styles.name}>{profileUser.full_name}</span>
                <span className={styles.email}>{profileUser.email}</span>
                <span className={styles.joined}>
                  Member since{" "}
                  {profileUser.created_at
                    ? new Date(profileUser.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Personal Information</h3>
            </div>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  <HiOutlineUser /> Full Name
                </span>
                <span className={styles.detailValue}>
                  {profileUser.full_name || "—"}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  <HiOutlineMail /> Email Address
                </span>
                <span className={styles.detailValue}>
                  {profileUser.email || "—"}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  <HiOutlinePhone /> Phone Number
                </span>
                <span className={styles.detailValue}>
                  {profileUser.phone || "—"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.rightColumn}>
          {/* ── Payment Methods (Read-Only) ── */}
          <section className={styles.paymentSection}>
            <div className={styles.paymentHeader}>
              <h3 className={styles.sectionTitle}>
                <HiOutlineCreditCard /> Payment Methods
              </h3>
            </div>

            <div className={styles.paymentGrid}>
              {paymentMethods.length === 0 && (
                <Card className={styles.emptyCard}>
                  <div className={styles.emptyState}>
                    <HiOutlineCreditCard />
                    <p>No payment methods available.</p>
                  </div>
                </Card>
              )}

              {paymentMethods.map((pm) => {
                const isBank = pm.provider === PAYMENT_METHOD_TYPE.BANK;

                if (isBank) {
                  return (
                    <BankCard
                      key={pm.id}
                      pm={pm}
                      handleCopyToClipboard={handleCopyToClipboard}
                      readOnly={true}
                    />
                  );
                }

                return (
                  <WalletCard
                    key={pm.id}
                    pm={pm}
                    user={profileUser as any}
                    handleCopyToClipboard={handleCopyToClipboard}
                    readOnly={true}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
