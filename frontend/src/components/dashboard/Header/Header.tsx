"use client";

import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineBell } from "react-icons/hi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleSidebar, toggleNotificationSidebar } from "@/store/slices/uiSlice";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import styles from "./Header.module.scss";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { sidebarOpen } = useAppSelector((s) => s.ui);
  const { unreadCount } = useAppSelector((s) => s.notifications);

  const firstName = user?.full_name?.split(" ")[0] || "there";

  const handleNotificationClick = () => {
    // For devices less than lg (1024px), navigate to notification page
    if (window.innerWidth < 1024) {
      router.push("/dashboard/notifications");
    } else {
      dispatch(toggleNotificationSidebar());
    }
  };

  return (
    <header className={`${styles.header} ${!sidebarOpen ? styles.collapsed : ""}`}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={() => dispatch(toggleSidebar())}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <HiOutlineChevronLeft /> : <HiOutlineChevronRight />}
        </button>
        <h1 className={styles.greeting}>
          Hello, {firstName} <span>👋</span>
        </h1>
      </div>

      <div className={styles.right}>
        <button 
          className={styles.notifBtn} 
          aria-label="Notifications"
          onClick={handleNotificationClick}
        >
          <HiOutlineBell />
          {unreadCount > 0 && (
            <span className={styles.notifBadge}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
