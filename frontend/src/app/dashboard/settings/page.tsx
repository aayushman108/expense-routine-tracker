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
  HiOutlineVolumeUp,
  HiOutlineVolumeOff,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useFCM } from "@/hooks/useFCM";
import { addToast } from "@/store/slices/uiSlice";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import styles from "./settings.module.scss";
import {
  setDeviceRegistered,
  updateNotificationStatus,
} from "@/store/slices/authSlice";
import { toggleSound } from "@/store/slices/notificationSlice";
import { playNotificationSound } from "@/lib/audio";
import api from "@/lib/api";
import type { RootState } from "@/store";

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isDeviceRegistered } = useAppSelector((s: RootState) => s.auth);
  const { soundEnabled } = useAppSelector((s: RootState) => s.notifications);
  const { requestPermissionAndGetToken, permission } =
    useFCM();

  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  const handleToggleSound = () => {
    dispatch(toggleSound());
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
              <h3>Notification Settings</h3>
            </div>

            <div className={styles.statusGrid}>
              {/* Device Status */}
              <Card className={styles.statusCard}>
                <div className={styles.statusInfo}>
                  <div className={styles.statusLabel}>Browser Permission</div>
                  <div className={`${styles.statusBadge} ${isGranted ? styles.success : isDenied ? styles.danger : styles.warning}`}>
                    {isGranted ? (
                      <><HiOutlineCheckCircle /> Authorized</>
                    ) : isDenied ? (
                      <><HiOutlineExclamationCircle /> Blocked</>
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

              {/* Global Status */}
              <Card className={styles.statusCard}>
                <div className={styles.statusInfo}>
                  <div className={styles.statusLabel}>Push Status</div>
                  <div className={`${styles.statusBadge} ${isEnabledGlobally ? styles.success : styles.warning}`}>
                    {isEnabledGlobally ? (
                      <><HiOutlineCheckCircle /> Receiving</>
                    ) : (
                      <><HiOutlineExclamationCircle /> Paused</>
                    )}
                  </div>
                </div>
                <p className={styles.statusDesc}>
                  {isEnabledGlobally 
                    ? "Your account is configured to send real-time alerts to all your active devices." 
                    : "Notification delivery is currently paused for your account globally."}
                </p>
              </Card>
            </div>

            {/* Global Control */}
            <Card className={styles.controlsCard} style={{ borderLeftColor: "var(--color-success)" }}>
              <div className={styles.controlRow}>
                <div className={styles.controlText}>
                  <h4>Push Notification Services</h4>
                  <p>
                    Enable or disable real-time push alerts for your account. This affects all browsers and devices linked to your profile.
                  </p>
                </div>
                <div className={styles.controlActions}>
                  <Button 
                    variant={isEnabledGlobally ? "danger" : "primary"} 
                    size="md" 
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        // Use requestPermissionAndGetToken if enabling for the first time/device
                        // but here we just toggle the global flag.
                        // However, user said: "If browser has granted... then only hit push notification registration"
                        if (!isEnabledGlobally && !isGranted) {
                          const result = await requestPermissionAndGetToken();
                          if (result !== "granted") {
                            setIsProcessing(false);
                            return;
                          }
                        }
                        
                        await api.patch("/auth/update-profile", { is_notification_enabled: !isEnabledGlobally });
                        dispatch(updateNotificationStatus(!isEnabledGlobally));
                        dispatch(addToast({ 
                          type: "success", 
                          message: `Global notifications ${!isEnabledGlobally ? "enabled" : "disabled"} successfully!` 
                        }));
                      } catch (error) {
                        dispatch(addToast({ type: "error", message: "Failed to update notification settings." }));
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    isLoading={isProcessing}
                  >
                    {isEnabledGlobally ? "Disable Globally" : "Enable Globally"}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className={styles.controlsCard} style={{ borderLeftColor: "var(--text-tertiary)" }}>
              <div className={styles.controlRow}>
                <div className={styles.controlText}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {soundEnabled ? (
                      <HiOutlineVolumeUp color="var(--color-primary)" />
                    ) : (
                      <HiOutlineVolumeOff color="var(--text-tertiary)" />
                    )}
                    <h4>Notification Sound</h4>
                  </div>
                  <p>
                    Play a sound when a notification arrives while the app is
                    open.
                  </p>
                </div>
                <div
                  className={styles.controlActions}
                  style={{ display: "flex", gap: "0.75rem" }}
                >
                  <Button variant="outline" size="md" onClick={playNotificationSound}>
                    Test Sound
                  </Button>
                  <Button
                    variant={soundEnabled ? "danger" : "primary"}
                    size="md"
                    onClick={handleToggleSound}
                  >
                    {soundEnabled ? "Mute Sound" : "Enable Sound"}
                  </Button>
                </div>
              </div>
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
