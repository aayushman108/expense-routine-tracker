"use client";

import { HiMenuAlt2, HiOutlineSearch, HiOutlineBell } from "react-icons/hi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSidebarOpen } from "@/store/slices/uiSlice";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import styles from "./Header.module.scss";

export default function DashboardHeader() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={() => dispatch(setSidebarOpen(true))}
          aria-label="Open sidebar"
        >
          <HiMenuAlt2 />
        </button>
        <h1 className={styles.greeting}>
          Hello, {firstName} <span>👋</span>
        </h1>
      </div>

      <div className={styles.right}>
        <button className={styles.searchBtn} aria-label="Search">
          <HiOutlineSearch />
        </button>
        <button className={styles.notifBtn} aria-label="Notifications">
          <HiOutlineBell />
          <span className={styles.notifBadge} />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
