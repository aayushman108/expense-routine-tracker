"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { HiOutlineBell, HiOutlineExclamationCircle, HiX } from "react-icons/hi";
import Button from "@/components/ui/Button/Button";
import styles from "@/app/dashboard/dashboard.module.scss";
import { useFCM } from "@/hooks/useFCM";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";

export default function NotificationBanner() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { requestPermissionAndGetToken, permission } = useFCM();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEnable = async () => {
    await requestPermissionAndGetToken();
  };

  if (!mounted) return null;

  // Hide on settings page
  if (pathname === "/dashboard/settings") return null;

  // Hide banner if already enabled globally for the account
  if (user?.is_notification_enabled) return null;

  const isDenied = permission === "denied";

  return (
    <div
      className={`${styles.verificationBanner} ${styles.notificationBanner} ${isDenied ? styles.denied : ""}`}
    >
      <div className={styles.bannerContent}>
        <div className={styles.bannerIcon}>
          {isDenied ? <HiOutlineExclamationCircle /> : <HiOutlineBell />}
        </div>
        <div className={styles.bannerText}>
          <h4>
            {isDenied
              ? "Notifications are Blocked"
              : "Enable Push Notifications"}
          </h4>
          <p>
            {isDenied
              ? "You have blocked notifications in your browser. Please enable them in your site settings to receive alerts."
              : "Get real-time alerts for expenses and group activities to stay on top of your finances."}
          </p>
        </div>
      </div>
      {!isDenied && (
        <Button
          variant="primary"
          className={styles.viewBtn}
          onClick={handleEnable}
        >
          Enable Notifications
        </Button>
      )}
    </div>
  );
}
