"use client";

import { useState, useEffect } from "react";
import { HiOutlineBell, HiOutlineExclamationCircle } from "react-icons/hi";
import Button from "@/components/ui/Button/Button";
import styles from "@/app/dashboard/dashboard.module.scss";
import { useFCM } from "@/hooks/useFCM";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";

export default function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [mounted, setMounted] = useState(false);
  const { requestPermissionAndGetToken } = useFCM();
  const { user } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnable = async () => {
    const result = await requestPermissionAndGetToken();
    setPermission(result);
  };

  if (!mounted) return null;

  // Hide banner ONLY if enabled in profile AND granted in this browser
  if (user?.is_notification_enabled && permission === "granted") return null;

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
          <h4>{isDenied ? "Notifications are Blocked" : "Enable Push Notifications"}</h4>
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
