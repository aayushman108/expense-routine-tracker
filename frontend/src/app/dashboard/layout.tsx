"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import Sidebar from "@/components/dashboard/Sidebar/Sidebar";
import Header from "@/components/dashboard/Header/Header";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav/MobileBottomNav";
import { getCurrentUser } from "@/store/slices/authSlice";
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

  const authAttempted = useRef(false);
  // Initialize based on current Redux state
  const [isInitializing, setIsInitializing] = useState(!isAuthenticated);

  // Standard React pattern for syncing state during render to avoid cascading renders
  if (isAuthenticated && isInitializing) {
    setIsInitializing(false);
  }

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
        dispatch(getCurrentUser()).then(() => {
          setIsInitializing(false);
        });
      }
    }
  }, [isAuthenticated, isLoading, dispatch, router]);

  if (isInitializing || (isLoading && !isAuthenticated)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main
        className={`${styles.main} ${!sidebarOpen ? styles.collapsed : ""}`}
      >
        <Header />
        <div className={styles.content}>{children}</div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
