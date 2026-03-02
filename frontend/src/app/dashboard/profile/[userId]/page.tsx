"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCreditCard,
  HiOutlineArrowLeft,
  HiOutlineChartBar,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/api";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import styles from "../profile.module.scss";
import type { RootState } from "@/store";
import type { User, PaymentMethod, Expense } from "@/lib/types";

const PROVIDER_OPTIONS = [
  { value: "khalti", label: "Khalti" },
  { value: "esewa", label: "eSewa" },
  { value: "bank", label: "Bank Transfer" },
  { value: "fonepay", label: "FonePay" },
  { value: "imepay", label: "IME Pay" },
  { value: "connectips", label: "ConnectIPS" },
];

const PROVIDER_COLORS: Record<string, string> = {
  khalti: "#5C2D91",
  esewa: "#60BB46",
  bank: "#1a73e8",
  fonepay: "#E31837",
  imepay: "#00A4E4",
  connectips: "#004B87",
};

function getProviderInitial(provider: string) {
  return (provider[0] || "?").toUpperCase();
}

function getProviderLabel(provider: string) {
  return PROVIDER_OPTIONS.find((p) => p.value === provider)?.label || provider;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const currentUser = useAppSelector((s: RootState) => s.auth.user);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // If viewing own profile, redirect to /dashboard/profile
  useEffect(() => {
    if (currentUser && userId === currentUser.id) {
      router.replace("/dashboard/profile");
    }
  }, [currentUser, userId, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.get(`/users/${userId}/profile`);
        const result = data.data || data;
        setProfileUser(result.user);
        setPaymentMethods(result.paymentMethods || []);
        // Assuming public profile might return some limited activity or just fetch separately if allowed
        // For now, let's assume result.recentExpenses exists or mock it
        setRecentExpenses(result.recentExpenses || []);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(
          error.response?.data?.message || "Failed to load user profile",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && currentUser && userId !== currentUser.id) {
      fetchProfile();
    }
  }, [userId, currentUser]);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Card className={styles.card}>
          <div className={styles.emptyState}>
            <HiOutlineUser />
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <HiOutlineArrowLeft /> Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!profileUser) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className={styles.backBtn}
        >
          <HiOutlineArrowLeft /> Back
        </Button>
        <h1>{profileUser.full_name}&apos;s Profile</h1>
        <p>Viewing member details and payment information.</p>
      </div>

      <div className={styles.profileLayout}>
        <div className={styles.leftColumn}>
          {/* ── User Details Card ── */}
          <Card className={styles.card}>
            <div className={styles.profileHero}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {profileUser.avatar?.url ? (
                    <img
                      src={profileUser.avatar.url}
                      alt={profileUser.full_name}
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

            <h3 className={styles.sectionTitle}>Personal Information</h3>
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
                const meta = (pm.metadata || {}) as Record<string, string>;
                const providerColor =
                  PROVIDER_COLORS[pm.provider] || "var(--color-primary)";

                return (
                  <Card key={pm.id} className={styles.pmCard}>
                    <div className={styles.pmCardTop}>
                      <div
                        className={styles.pmIcon}
                        style={{ background: providerColor }}
                      >
                        {getProviderInitial(pm.provider)}
                      </div>
                      <div className={styles.pmInfo}>
                        <span className={styles.pmProvider}>
                          {getProviderLabel(pm.provider)}
                        </span>
                        {meta.phone && (
                          <span className={styles.pmMeta}>{meta.phone}</span>
                        )}
                        {meta.accountNumber && (
                          <span className={styles.pmMeta}>
                            ••••{meta.accountNumber.slice(-4)}
                          </span>
                        )}
                        {meta.name && (
                          <span className={styles.pmMeta}>{meta.name}</span>
                        )}
                        {meta.bankName && (
                          <span className={styles.pmMeta}>{meta.bankName}</span>
                        )}
                      </div>
                      <div className={styles.pmBadges}>
                        {pm.is_verified && (
                          <span className={styles.verifiedBadge}>Verified</span>
                        )}
                        {pm.is_default && (
                          <span className={styles.defaultBadge}>Default</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
