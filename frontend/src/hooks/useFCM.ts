"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import api from "@/lib/api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { RootState } from "@/store";
import { showToast } from "@/lib/toast";
import { ToastType } from "@/enums/general.enum";
import { playNotificationSound } from "@/lib/audio";
import {
  setUser,
  updateNotificationStatus,
  setDeviceRegistered,
} from "@/store/slices/authSlice";
import {
  fetchUnreadCount,
  setFCMEvent,
  unregisterFCMToken,
} from "@/store/slices/notificationSlice";

// Your VAPID key from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

export function useFCM() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s: RootState) => s.auth);
  const { soundEnabled } = useAppSelector((s: RootState) => s.notifications);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const tokenSentRef = useRef(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default",
  );

  /**
   * Register the Firebase Messaging service worker explicitly,
   * so both foreground and background messaging use the same SW.
   */
  const registerServiceWorker =
    useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator))
        return null;

      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          { scope: "/" },
        );
        // Wait for the SW to be ready
        await navigator.serviceWorker.ready;
        return registration;
      } catch (err) {
        console.error("FCM SW registration failed:", err);
        return null;
      }
    }, []);

  /**
   * Request notification permission + get the FCM token.
   * Sends the token to the backend for storage.
   */
  const requestPermissionAndGetToken = useCallback(async () => {
    if (!user) return "default";

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      if (permission !== "granted") {
        console.log("Notification permission denied");
        return permission;
      }

      // If already sent in this session, just return granted
      if (tokenSentRef.current) return permission;

      const messaging = await getFirebaseMessaging();
      if (!messaging) return permission;

      const swRegistration = await registerServiceWorker();
      if (!swRegistration) return permission;

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (token) {
        // 1. Register the device-specific FCM token
        await api.post("/notifications/register-token", { token });
        
        // 2. Enable push notifications globally for the user
        await api.patch("/auth/update-profile", { is_notification_enabled: true });

        tokenSentRef.current = true;
        dispatch(setDeviceRegistered(true));
        dispatch(updateNotificationStatus(true));
        console.log("FCM token and global status registered successfully");
      }
      return permission;
    } catch (err) {
      console.error("Error getting FCM token:", err);
      return Notification.permission;
    }
  }, [user, registerServiceWorker, dispatch]);

  /**
   * Explicitly unregister the current device token from the backend.
   */
  const disableNotifications = useCallback(async () => {
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      const swRegistration = await registerServiceWorker();
      if (!swRegistration) return;

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (token) {
        await dispatch(unregisterFCMToken({ token })).unwrap();
        tokenSentRef.current = false;
        dispatch(setDeviceRegistered(false));
      }
    } catch (err) {
      console.error("Error disabling notifications:", err);
      throw err;
    }
  }, [dispatch, registerServiceWorker]);

  /**
   * Listen for foreground messages.
   * - Always updates the unread badge count.
   * - Stores the full payload in Redux so page-level hooks can react
   *   with targeted data fetches (no full page reload).
   * - Shows an in-app toast so the user is aware of the notification.
   */
  const setupForegroundListener = useCallback(async () => {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    // Clean up old listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      // 🔔 Always update badge count
      dispatch(fetchUnreadCount());

      // 🧠 Store full payload for page-level handling
      dispatch(setFCMEvent(payload));

      // 🎵 Play sound if enabled
      if (soundEnabled) {
        playNotificationSound();
      }
    });

    unsubscribeRef.current = unsubscribe;
  }, [dispatch, soundEnabled]);

  /**
   * Initialize FCM: request permission, get token, and set up listener.
   */
  useEffect(() => {
    if (!user) return;

    // 1. Initial Sync of registration status
    if (typeof window !== "undefined") {
      const actualRegistered = Notification.permission === "granted";
      setPermission(Notification.permission);
      dispatch(setDeviceRegistered(actualRegistered));

      // 2. Listen for permission changes (browser UI)
      if ("permissions" in navigator) {
        navigator.permissions
          .query({ name: "notifications" })
          .then((status) => {
            const handleStatusChange = () => {
              const currentPermission = Notification.permission;
              setPermission(currentPermission);
              dispatch(setDeviceRegistered(currentPermission === "granted"));
            };
            status.addEventListener("change", handleStatusChange);
            return () =>
              status.removeEventListener("change", handleStatusChange);
          });
      }
    }

    setupForegroundListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user, setupForegroundListener, dispatch]);

  return { requestPermissionAndGetToken, disableNotifications, permission };
}
