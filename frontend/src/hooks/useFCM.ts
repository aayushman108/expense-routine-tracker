"use client";

import { useEffect, useRef, useCallback } from "react";
import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import api from "@/lib/api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addToast } from "@/store/slices/uiSlice";
import { RootState } from "@/store";
import { showToast } from "@/lib/toast";
import { ToastType } from "@/enums/general.enum";

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
    if (!user || tokenSentRef.current) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission denied");
        return;
      }

      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      const swRegistration = await registerServiceWorker();
      if (!swRegistration) return;

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
    } catch (err) {
      console.error("Error getting FCM token:", err);
    }
  }, [user, registerServiceWorker]);

  /**
   * Listen for foreground messages and show them as in-app toasts.
   */
  const setupForegroundListener = useCallback(async () => {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    // Clean up old listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      const title = payload.notification?.title || "New Notification";
      const body = payload.notification?.body || "";
      const targetUrl = payload.data?.url;

      // Check if user is currently on the route the notification is pointing to
      // We check if current pathname matches or is a parent of targetUrl
      // Usually targetUrl is /dashboard/groups/[id]?tab=...
      const currentPath = window.location.pathname;

      if (targetUrl && (currentPath === targetUrl || targetUrl.startsWith(currentPath + "?"))) {
        showToast(
          ToastType.INFO,
          `${title}${body ? `: ${body}` : ""}. Refresh the page to see the fresh data.`,
          10000,
          {
            label: "Refresh",
            onClick: () => window.location.reload(),
          },
        );
      } else {
        showToast(ToastType.INFO, `${title}${body ? `: ${body}` : ""}`, 7000);
      }
    });

    unsubscribeRef.current = unsubscribe;
  }, []);

  /**
   * Initialize FCM: request permission, get token, and set up listener.
   */
  useEffect(() => {
    if (!user) return;

    requestPermissionAndGetToken();
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
