"use client";

import { useEffect, useRef, useCallback } from "react";
import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import api from "@/lib/api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { RootState } from "@/store";
import { showToast } from "@/lib/toast";
import { ToastType } from "@/enums/general.enum";
import {
  fetchUnreadCount,
  setFCMEvent,
} from "@/store/slices/notificationSlice";

// Your VAPID key from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

export function useFCM() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s: RootState) => s.auth);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const tokenSentRef = useRef(false);

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
        // Send the token to the backend
        await api.post("/notifications/register-token", { token });
        tokenSentRef.current = true;
        console.log("FCM token registered successfully");
      }
      return permission;
    } catch (err) {
      console.error("Error getting FCM token:", err);
      return Notification.permission;
    }
  }, [user, registerServiceWorker]);

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
    });

    unsubscribeRef.current = unsubscribe;
  }, [dispatch]);

  /**
   * Initialize FCM: request permission, get token, and set up listener.
   */
  useEffect(() => {
    if (!user) return;

    // requestPermissionAndGetToken(); // Removed to rely on custom UI prompt
    setupForegroundListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user, requestPermissionAndGetToken, setupForegroundListener]);

  return { requestPermissionAndGetToken };
}
