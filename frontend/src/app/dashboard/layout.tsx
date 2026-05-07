"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import Sidebar from "@/components/dashboard/Sidebar/Sidebar";
import Header from "@/components/dashboard/Header/Header";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav/MobileBottomNav";
import NotificationSidebar from "@/components/dashboard/NotificationSidebar/NotificationSidebar";
import { getCurrentUser } from "@/store/slices/authSlice";
import { fetchUnreadCount } from "@/store/slices/notificationSlice";
import { useLoading } from "@/components/providers/LoadingProvider";
import { NotificationBanner } from "@/components/dashboard/DashboardSections";
import styles from "./layout.module.scss";

import type { RootState } from "@/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector(
    (s: RootState) => s.auth,
  );
  const { sidebarOpen } = useAppSelector((s: RootState) => s.ui);
  const { setIsLoading } = useLoading();

  const authAttempted = useRef(false);
  // Initialize based on current Redux state
  const [isInitializing, setIsInitializing] = useState(!isAuthenticated);

  // Standard React pattern for syncing state during render to avoid cascading renders
  if (isAuthenticated && isInitializing) {
    setIsInitializing(false);
  }

  useEffect(() => {
    if (!isInitializing && !isLoading) {
      setIsLoading(false);
    }
  }, [isInitializing, isLoading, setIsLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      router.push("/login");
      return;
    }

    if (!isAuthenticated) {
      // If we haven't attempted to fetch the user yet, do it now
      if (!isLoading && !authAttempted.current) {
        authAttempted.current = true;
        // isInitializing is already true from useState(!isAuthenticated)
        setIsLoading(true);
        dispatch(getCurrentUser()).then(() => {
          dispatch(fetchUnreadCount());
          setIsLoading(false);
          setIsInitializing(false);
        });
      }
    }
  }, [isAuthenticated, isLoading, dispatch, router, setIsLoading]);

  if (isInitializing || (isLoading && !isAuthenticated)) {
    return null; // The global PageLoader will be shown via setIsLoading
  }

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main
        className={`${styles.main} ${!sidebarOpen ? styles.collapsed : ""}`}
      >
        <Header />
        <div className={styles.content}>
          <NotificationBanner />
          {children}
        </div>
      </main>

      <MobileBottomNav />
      <NotificationSidebar />
    </div>
  );
}
