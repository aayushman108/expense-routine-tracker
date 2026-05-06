"use client";

import { useState, useEffect } from "react";
import { HiOutlineBell, HiOutlineExclamationCircle } from "react-icons/hi";
import Button from "@/components/ui/Button/Button";
import styles from "@/app/dashboard/dashboard.module.scss";
import { useFCM } from "@/hooks/useFCM";

export default function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission>("granted");
  const { requestPermissionAndGetToken } = useFCM();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnable = async () => {
    const result = await requestPermissionAndGetToken();
    setPermission(result);
  };

  if (permission === "granted") return null;

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
