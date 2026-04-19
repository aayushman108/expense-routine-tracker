"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import { handleThunk } from "@/lib/utils";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineCog,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { FiPieChart, FiUser, FiLogOut } from "react-icons/fi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { toggleSidebar } from "@/store/slices/uiSlice";
import styles from "./Sidebar.module.scss";

const navItems = [
  { href: "/dashboard", icon: <HiOutlineHome />, label: "Dashboard" },
  { href: "/dashboard/groups", icon: <HiOutlineUserGroup />, label: "Groups" },
  {
    href: "/dashboard/personal",
    icon: <HiOutlineCurrencyDollar />,
    label: "Personal",
  },
  { href: "/dashboard/profile", icon: <FiUser />, label: "Profile" },
  { href: "/dashboard/settings", icon: <HiOutlineCog />, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { sidebarOpen } = useAppSelector((s) => s.ui);
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    handleThunk(dispatch(logoutUser()), () => router.push("/"));
  };

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
      className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ""} ${sidebarOpen ? styles.mobileOpen : ""}`}
    >
      <div className={styles.logo}>
        <Link href="/dashboard">
          <div className={styles.logoIcon}>
            <FiPieChart />
          </div>
          <span>Expensora</span>
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
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          className={`${styles.navItem} ${styles.logoutBtn}`}
          onClick={() => setIsLogoutModalOpen(true)}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </nav>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your Expensora account? You will need to sign back in to access your groups and personal expenses."
        confirmText="Log Out"
        confirmVariant="danger"
      />

      <div className={styles.userSection}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.avatar?.url ? (
              <Image
                src={user.avatar.url}
                alt={user.full_name || "Avatar"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.avatarImg}
              />
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
