import { ReactNode } from "react";
import {
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import styles from "@/app/dashboard/dashboard.module.scss";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { StatsSkeleton } from "@/app/dashboard/DashboardLoadingSkeletons";

interface StatItem {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

export default function InfrastructureStats() {
  const { summary, isSummaryLoading } = useAppSelector(
    (s: RootState) => s.expenses,
  );

  const netBalance =
    (summary?.remainingToPay ?? 0) - (summary?.remainingToReceive ?? 0);

  const stats: StatItem[] = [
    {
      label: "Total Asset Flow",
      value: `रू ${(summary?.lifetimeSpend ?? 0).toLocaleString()}`,
      icon: <HiOutlineCurrencyDollar />,
      color: "blue",
    },
    {
      label: "Total Personal Expense",
      value: `रू ${summary?.personalSpend.toLocaleString()}`,
      icon: <HiOutlineOfficeBuilding />,
      color: "purple",
    },
    {
      label: "Operational Groups",
      value: summary?.noOfGroups ?? 0,
      icon: <HiOutlineUserGroup />,
      color: "green",
    },
    {
      label: netBalance >= 0 ? "Net Assets Inflow" : "Net Assets Outflow",
      value: `रू ${Math.abs(netBalance).toLocaleString()}`,
      icon:
        netBalance >= 0 ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />,
      color: netBalance >= 0 ? "green" : "red",
    },
  ];

  if (isSummaryLoading || !summary) {
    return <StatsSkeleton />;
  }

  return (
    <section className={styles.stats}>
      {stats.map((stat, idx) => (
        <div key={idx} className={`${styles.statCard} ${styles[stat.color]}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statHeader}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
            <div className={styles.iconWrapper}>{stat.icon}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
