import { HiOutlineExclamationCircle } from "react-icons/hi";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import styles from "@/app/dashboard/dashboard.module.scss";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { VerificationBannerSkeleton } from "@/app/dashboard/DashboardLoadingSkeletons";

export default function VerificationBanner() {
  const { summary, isSummaryLoading } = useAppSelector(
    (s: RootState) => s.expenses,
  );

  if (isSummaryLoading || !summary) {
    return <VerificationBannerSkeleton />;
  }

  const pendingCount = summary?.pendingVerificationsCount ?? 0;
  if (pendingCount <= 0) return null;

  return (
    <div className={styles.verificationBanner}>
      <div className={styles.bannerContent}>
        <div className={styles.bannerIcon}>
          <HiOutlineExclamationCircle />
        </div>
        <div className={styles.bannerText}>
          <h4>Action Required: Pending Verifications</h4>
          <p>
            You have {pendingCount} expense
            {pendingCount > 1 ? "s" : ""} in your groups awaiting your
            verification.
          </p>
        </div>
      </div>
      <Link href="/dashboard/groups">
        <Button variant="outline" className={styles.viewBtn}>
          Review Expenses
        </Button>
      </Link>
    </div>
  );
}
