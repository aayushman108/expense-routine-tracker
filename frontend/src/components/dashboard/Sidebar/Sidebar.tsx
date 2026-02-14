"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { FiPieChart, FiUser } from "react-icons/fi";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { logoutUser } from "@/src/store/slices/authSlice";
import { toggleSidebar } from "@/src/store/slices/uiSlice";
import styles from "./Sidebar.module.scss";

const mainNav = [
  { href: "/dashboard", icon: <HiOutlineHome />, label: "Dashboard" },
  { href: "/dashboard/groups", icon: <HiOutlineUserGroup />, label: "Groups" },
  {
    href: "/dashboard/personal",
    icon: <HiOutlineCurrencyDollar />,
    label: "Personal",
  },
];

const settingsNav = [
  { href: "/dashboard/profile", icon: <FiUser />, label: "Profile" },
  { href: "/dashboard/settings", icon: <HiOutlineCog />, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { sidebarOpen } = useAppSelector((s) => s.ui);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ""}`}
    >
      <div className={styles.logo}>
        <Link href="/dashboard">
          <div className={styles.logoIcon}>
            <FiPieChart />
          </div>
          <span>SplitWise</span>
        </Link>
        <button
          className={styles.collapseBtn}
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <HiOutlineChevronLeft /> : <HiOutlineChevronRight />}
        </button>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <div className={styles.navLabel}>Main</div>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className={styles.navSection}>
          <div className={styles.navLabel}>Account</div>
          {settingsNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            className={styles.navItem}
            onClick={() => dispatch(logoutUser())}
          >
            <HiOutlineLogout />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.full_name} />
            ) : (
              getInitials(user?.full_name)
            )}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.full_name || "User"}</div>
            <div className={styles.userEmail}>{user?.email || ""}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
