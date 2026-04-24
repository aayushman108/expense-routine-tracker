import React from "react";
import {
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
} from "react-icons/hi";
import styles from "./PersonalStats.module.scss";

interface PersonalStatsProps {
  summary: {
    lifetimeSpend: number;
    currentMonthSpend: number;
    currentMonthPersonalSpend: number;
    personalSpend: number;
    groupSpend: number;
    remainingToPay: number;
    remainingToReceive: number;
  } | null;
}

const PersonalStats: React.FC<PersonalStatsProps> = ({ summary }) => {
  const stats = [
    {
      label: "Current Month",
      value: summary?.currentMonthPersonalSpend || 0,
      subText: "This month's personal expenses",
      icon: <HiOutlineCalendar />,
      variant: styles.purple,
    },
    {
      label: "Lifetime Total",
      value: summary?.personalSpend || 0,
      subText: "All-time personal spending",
      icon: <HiOutlineCurrencyDollar />,
      variant: styles.blue,
    },
  ];

  return (
    <div className={styles.summaryCards}>
      {stats.map((stat, idx) => (
        <div key={idx} className={`${styles.statCard} ${stat.variant}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statHeader}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>
                रू {stat.value.toLocaleString()}
              </span>
            </div>
            <div className={styles.iconWrapper}>{stat.icon}</div>
          </div>
          <span className={styles.statSub}>
            {stat.subText}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PersonalStats;
