"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import Sidebar from "@/components/dashboard/Sidebar/Sidebar";
import Header from "@/components/dashboard/Header/Header";
import { getCurrentUser } from "@/store/slices/authSlice";
import { setSidebarOpen } from "@/store/slices/uiSlice";
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
  
  useEffect(() => {
    // Initial auth check
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    } else if (!isAuthenticated && !isLoading && !authAttempted.current) {
      authAttempted.current = true;
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, isLoading, dispatch, router]);

  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar />

      {/* Mobile overlay */}
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.showOverlay : ""}`}
        onClick={() => dispatch(setSidebarOpen(false))}
      />

      <main
        className={`${styles.main} ${!sidebarOpen ? styles.collapsed : ""}`}
      >
        <Header />
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
