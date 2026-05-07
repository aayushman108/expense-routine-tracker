"use client";

import { useState, useEffect } from "react";
import { HiOutlineBell, HiOutlineExclamationCircle, HiX } from "react-icons/hi";
import Button from "@/components/ui/Button/Button";
import styles from "@/app/dashboard/dashboard.module.scss";
import { useFCM } from "@/hooks/useFCM";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";

export default function NotificationBanner() {
  const dispatch = useAppDispatch();
  const { isDeviceRegistered } = useAppSelector(
    (state: RootState) => state.auth,
  );
  const { requestPermissionAndGetToken, permission } = useFCM();
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const dismissed =
        sessionStorage.getItem("fcm_banner_dismissed") === "true";
      setIsDismissed(dismissed);
    }
  }, []);

  const handleEnable = async () => {
    await requestPermissionAndGetToken();
    handleDismiss();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("fcm_banner_dismissed", "true");
  };

  if (!mounted || isDismissed) return null;

  // Hide banner ONLY if enabled on this device (which implies granted + token sent)
  if (isDeviceRegistered && permission === "granted") return null;

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

      <button
        className={styles.dismissBtn}
        onClick={handleDismiss}
        title="Dismiss"
      >
        <HiX />
      </button>
    </div>
  );
}
