"use client";

import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import styles from "./Header.module.scss";

export default function DashboardHeader() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { sidebarOpen } = useAppSelector((s) => s.ui);

  const firstName = user?.full_name?.split(" ")[0] || "there";

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
        {/* Search and Notification temporarily hidden */}
        {/* <button className={styles.searchBtn} aria-label="Search">
          <HiOutlineSearch />
        </button>
        <button className={styles.notifBtn} aria-label="Notifications">
          <HiOutlineBell />
          <span className={styles.notifBadge} />
        </button> */}
        <ThemeToggle />
      </div>
    </header>
  );
}
