import React from "react";
import {
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineShoppingBag,
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
} from "react-icons/hi";
import styles from "./PersonalStats.module.scss";

interface PersonalStatsProps {
  summary: {
    lifetimeSpend: number;
    currentMonthSpend: number;
    personalSpend: number;
    groupSpend: number;
    remainingToPay: number;
    remainingToReceive: number;
  } | null;
}

const PersonalStats: React.FC<PersonalStatsProps> = ({ summary }) => {
  const calculations = {
    personal: summary?.personalSpend || 0,
    total: summary?.lifetimeSpend || 0,
    currentMonthTotal: summary?.currentMonthSpend || 0,
    totalIOwe: summary?.remainingToPay || 0,
    totalOthersOweMe: summary?.remainingToReceive || 0,
    groupOnly: summary?.groupSpend || 0,
    netFlow: (summary?.remainingToReceive || 0) - (summary?.remainingToPay || 0),
  };

  const stats = [
    {
      label: "Lifetime Spend",
      value: calculations.total,
      subText: "Personal + All Group Shares",
      icon: <HiOutlineCurrencyDollar />,
      variant: styles.blue,
    },
    {
      label: "Current Month Spend",
      value: calculations.currentMonthTotal,
      subText: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      icon: <HiOutlineCalendar />,
      variant: styles.purple,
    },
    {
      label: "Personal Spend",
      value: calculations.personal,
      subText: "Non-group expenses",
      icon: <HiOutlineChartBar />,
      variant: styles.green,
    },
    {
      label: "Group Spend",
      value: calculations.groupOnly,
      subText: "Your verified group shares",
      icon: <HiOutlineShoppingBag />,
      variant: styles.yellow,
    },
    {
      label: calculations.netFlow >= 0 ? "Net Inflow" : "Net Outflow",
      value: Math.abs(calculations.netFlow),
      subText:
        calculations.netFlow >= 0 ? "Total you are owed" : "Total you owe",
      icon:
        calculations.netFlow >= 0 ? (
          <HiOutlineArrowNarrowUp />
        ) : (
          <HiOutlineArrowNarrowDown />
        ),
      variant: calculations.netFlow >= 0 ? styles.green : styles.red,
      subColor: calculations.netFlow >= 0 ? styles.success : styles.danger,
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
          <span className={`${styles.statSub} ${stat.subColor || styles.secondary}`}>
            {stat.subText}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PersonalStats;
