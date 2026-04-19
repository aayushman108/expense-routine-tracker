"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DASHBOARD_NAV_ITEMS,
  isDashboardNavActive,
} from "@/constants/dashboardNav";
import styles from "./MobileBottomNav.module.scss";

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bar} aria-label="Main navigation">
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isDashboardNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.tab} ${active ? styles.active : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className={styles.iconWrap} aria-hidden>
              <Icon />
            </span>
            <span className={styles.label}>{item.tabLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
