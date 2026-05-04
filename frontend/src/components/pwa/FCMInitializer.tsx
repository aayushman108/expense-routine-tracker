"use client";

import { useFCM } from "@/hooks/useFCM";

/**
 * Silent component that initializes Firebase Cloud Messaging.
 * Place inside AppProvider (or any authenticated context) so it
 * only runs once the user is logged in.
 */
export default function FCMInitializer() {
  useFCM();
  return null;
}
