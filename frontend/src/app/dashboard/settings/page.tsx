"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineChevronLeft,
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineDeviceMobile,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineExternalLink,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useFCM } from "@/hooks/useFCM";
import { addToast } from "@/store/slices/uiSlice";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import styles from "./settings.module.scss";
import { setDeviceRegistered } from "@/store/slices/authSlice";
import type { RootState } from "@/store";

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isDeviceRegistered } = useAppSelector((s: RootState) => s.auth);
  const { requestPermissionAndGetToken, disableNotifications, permission } =
    useFCM();

  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEnable = async () => {
    setIsProcessing(true);
    try {
      const result = await requestPermissionAndGetToken();
      if (result === "granted") {
        dispatch(addToast({ type: "success", message: "Notifications enabled successfully!" }));
      } else if (result === "denied") {
        dispatch(addToast({ type: "error", message: "Permission denied. Please enable in browser settings." }));
      }
    } catch (error) {
      dispatch(addToast({ type: "error", message: "Failed to enable notifications." }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisable = async () => {
    setIsProcessing(true);
    try {
      await disableNotifications();
      dispatch(addToast({ type: "success", message: "Notifications disabled for this device." }));
    } catch (error) {
      dispatch(addToast({ type: "error", message: "Failed to disable notifications." }));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  const isDenied = permission === "denied";
  const isGranted = permission === "granted";
  const isEnabledGlobally = user?.is_notification_enabled;

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
              <HiOutlineCog />
            </div>
            <div className={styles.textDetails}>
              <div className={styles.titleRow}>
                <h1>Settings</h1>
                <div className={styles.badge}>SYSTEM_PREFERENCES</div>
              </div>
              <p>
                Configure your notification preferences and device-specific settings.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.column}>
          {/* ── Push Notifications Section ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <HiOutlineBell />
              <h3>Push Notifications</h3>
            </div>

            <div className={styles.statusGrid}>
              {/* Global Status */}
              <Card className={styles.statusCard}>
                <div className={styles.statusInfo}>
                  <div className={styles.statusLabel}>Account Status</div>
                  <div className={`${styles.statusBadge} ${isEnabledGlobally ? styles.success : styles.warning}`}>
                    {isEnabledGlobally ? (
                      <><HiOutlineCheckCircle /> Enabled</>
                    ) : (
                      <><HiOutlineExclamationCircle /> Not Configured</>
                    )}
                  </div>
                </div>
                <p className={styles.statusDesc}>
                  {isEnabledGlobally 
                    ? "Your account is set up to receive push notifications on registered devices." 
                    : "You haven't registered any devices for push notifications yet."}
                </p>
              </Card>

              {/* Device Status */}
              <Card className={styles.statusCard}>
                <div className={styles.statusInfo}>
                  <div className={styles.statusLabel}>Current Device</div>
                  <div className={`${styles.statusBadge} ${isGranted ? styles.success : isDenied ? styles.danger : styles.warning}`}>
                    {isGranted ? (
                      <><HiOutlineCheckCircle /> Permission Granted</>
                    ) : isDenied ? (
                      <><HiOutlineExclamationCircle /> Permission Denied</>
                    ) : (
                      <><HiOutlineDeviceMobile /> Not Set Up</>
                    )}
                  </div>
                </div>
                <p className={styles.statusDesc}>
                  {isGranted 
                    ? "This browser is authorized to receive and show real-time alerts." 
                    : isDenied 
                      ? "Notifications are blocked by your browser. Please allow them in site settings." 
                      : "Permission has not been requested for this browser yet."}
                </p>
              </Card>
            </div>

            <Card className={styles.controlsCard}>
              <div className={styles.controlRow}>
                <div className={styles.controlText}>
                  <h4>Notification Control</h4>
                  <p>
                    Enable or disable real-time alerts for this specific device. 
                    Enabling will link this browser to your account.
                  </p>
                </div>
                <div className={styles.controlActions}>
                  {isDeviceRegistered ? (
                    <Button 
                      variant="danger" 
                      size="md" 
                      onClick={handleDisable}
                      isLoading={isProcessing}
                    >
                      Disable on this Device
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="md" 
                      onClick={handleEnable}
                      isLoading={isProcessing}
                      disabled={isDenied}
                    >
                      {isDenied ? "Action Blocked" : "Enable on this Device"}
                    </Button>
                  )}
                </div>
              </div>

              {isDenied && (
                <div className={styles.alertBox}>
                  <HiOutlineExclamationCircle />
                  <div>
                    <strong>How to fix:</strong> Click the lock icon in your browser's address bar and set Notifications to 'Allow'.
                  </div>
                </div>
              )}
            </Card>
          </section>

          {/* ── Security Section (Placeholder) ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <HiOutlineShieldCheck />
              <h3>Security & Privacy</h3>
            </div>
            <Card className={styles.simpleCard}>
              <div className={styles.row}>
                <span>Manage Passwords & Session</span>
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/profile")}>
                  Go to Profile <HiOutlineExternalLink />
                </Button>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
