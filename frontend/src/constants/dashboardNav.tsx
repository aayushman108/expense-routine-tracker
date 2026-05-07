import type { IconType } from "react-icons";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineCog,
} from "react-icons/hi";
import { FiUser } from "react-icons/fi";

export type DashboardNavItemDef = {
  href: string;
  label: string;
  /** Short label for bottom tab bar */
  tabLabel: string;
  icon: IconType;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItemDef[] = [
  { href: "/dashboard", label: "Dashboard", tabLabel: "Home", icon: HiOutlineHome },
  { href: "/dashboard/groups", label: "Groups", tabLabel: "Groups", icon: HiOutlineUserGroup },
  {
    href: "/dashboard/personal",
    label: "Personal",
    tabLabel: "Personal",
    icon: HiOutlineCurrencyDollar,
  },
  { href: "/dashboard/profile", label: "Profile", tabLabel: "Profile", icon: FiUser },
  {
    href: "/dashboard/settings",
    label: "Settings",
    tabLabel: "Settings",
    icon: HiOutlineCog,
  },
];

export function isDashboardNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname.startsWith(href);
}
