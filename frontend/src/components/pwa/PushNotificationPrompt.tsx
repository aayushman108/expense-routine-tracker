"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useFCM } from "@/hooks/useFCM";
import styles from "./PushNotificationPrompt.module.scss";
import { RootState } from "@/store";

export default function PushNotificationPrompt() {
  const { user, isAuthenticated } = useAppSelector((s: RootState) => s.auth);
  const { requestPermissionAndGetToken } = useFCM();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show if user is logged in, notifications aren't enabled globally,
    // and we haven't asked in this session yet
    const hasAskedInSession = sessionStorage.getItem("push_prompt_asked");
    
    if (isAuthenticated && user && !user.is_notification_enabled && !hasAskedInSession) {
      // Check if permission is already denied - if so, don't bother the user with a prompt they can't easily fix here
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "denied") return;
      }

      const timer = setTimeout(() => {
        setShow(true);
      }, 3000); // Show after 3 seconds of activity
      
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated]);

  const handleEnable = async () => {
    try {
      const permission = await requestPermissionAndGetToken();
      if (permission === "granted") {
        setShow(false);
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
    }
    // We mark as asked anyway to avoid annoying the user if it failed
    sessionStorage.setItem("push_prompt_asked", "true");
  };

  const handleLater = () => {
    setShow(false);
    sessionStorage.setItem("push_prompt_asked", "true");
  };

  if (!show) return null;

  return (
    <div className={styles.prompt}>
      <div className={styles.content}>
        <div className={styles.icon}>🔔</div>
        <div className={styles.text}>
          <h3>Enable Notifications</h3>
          <p>
            Don't miss out on important updates! Get notified when someone adds an expense or settles a debt.
          </p>
        </div>
        <div className={styles.actions}>
          <button onClick={handleLater} className={styles.later}>
            Later
          </button>
          <button onClick={handleEnable} className={styles.enable}>
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
