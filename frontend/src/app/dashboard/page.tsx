"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineScale,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyGroupsAction } from "@/store/slices/groupSlice";
import {
  fetchUserSummary,
  fetchMonthlyAnalytics,
} from "@/store/slices/expenseSlice";
import CreateGroupModal from "@/components/dashboard/GroupModals/CreateGroupModal";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import MonthlyExpenditureChart from "@/components/dashboard/Charts/MonthlyExpenditureChart";
import styles from "./dashboard.module.scss";
import type { RootState } from "@/store";
import { EXPENSE_TYPE } from "@expense-tracker/shared";
import { handleThunk } from "@/lib/utils";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { groups } = useAppSelector((s: RootState) => s.groups);
  const { summary } = useAppSelector((s: RootState) => s.expenses);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyGroupsAction());
    handleThunk(dispatch(fetchUserSummary()));
    dispatch(fetchMonthlyAnalytics());
  }, [dispatch]);

  const currentMonthNum = new Date().getMonth() + 1;
  const { monthlyAnalytics } = useAppSelector((s: RootState) => s.expenses);
  const currentMonthData = monthlyAnalytics?.[currentMonthNum - 1];

  const currentMonthTotal = currentMonthData?.totalExpense || 0;
  const currentMonthPersonal = currentMonthData?.personalExpense || 0;
  const currentMonthGroupShare = currentMonthData?.groupExpense || 0;
  const currentMonthNetFlow = currentMonthData?.netGroupFlow || 0;

  const totalSpent = summary?.lifetimeSpend || 0;
  const owedToYou = summary?.remainingToReceive || 0;
  const youOwe = summary?.remainingToPay || 0;
  const netBalance = owedToYou - youOwe;

  const stats = [
    {
      label: "Total Asset Flow",
      value: `रू ${totalSpent.toLocaleString()}`,
      icon: <HiOutlineCurrencyDollar />,
      color: "blue",
    },
    {
      label: "Total Personal Expense",
      value: `रू ${(summary?.personalSpend || 0).toLocaleString()}`,
      icon: <HiOutlineOfficeBuilding />,
      color: "purple",
    },
    {
      label: "Operational Groups",
      value: groups?.totalGroups || 0,
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

  const currentMonthName = new Date().toLocaleString("default", {
    month: "long",
  });
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.dashboard}>
      {/* ── Infrastructure Stats ── */}
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

      {/* ── Primary Assets ── */}
      <section className={styles.personalOverview}>
        <div className={styles.personalCard}>
          <div className={styles.cardGlow}></div>
          <div className={styles.personalContent}>
            <div className={styles.cardHeader}>
              <p>SECURE_PERSONAL_SESSION</p>
              <h2>
                Private Ledger — {currentMonthName} {currentYear}
              </h2>
            </div>

            <div className={styles.mainStats}>
              <div className={styles.mainStat}>
                <span className={styles.mainStatLabel}>
                  Monthly Expenditure
                </span>
                <div className={styles.mainStatValue}>
                  <h3>रू {currentMonthTotal.toLocaleString()}</h3>
                  <span className={styles.labelIndicator}>Current Month</span>
                </div>
                <div className={styles.breakdownRow}>
                  <div className={styles.subStat}>
                    <div className={styles.subIcon}>
                      <HiOutlineUser />
                    </div>
                    <div className={styles.subInfo}>
                      <span className={styles.subLabel}>Personal Ledger</span>
                      <span className={styles.subValue}>
                        रू {currentMonthPersonal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.subStat}>
                    <div className={styles.subIcon}>
                      <HiOutlineUsers />
                    </div>
                    <div className={styles.subInfo}>
                      <span className={styles.subLabel}>Group Shares</span>
                      <span className={styles.subValue}>
                        रू {currentMonthGroupShare.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.subStat}>
                    <div className={styles.subIcon}>
                      <HiOutlineScale />
                    </div>
                    <div className={styles.subInfo}>
                      <span className={styles.subLabel}>Net Position</span>
                      <span
                        className={`${styles.subValue} ${currentMonthNetFlow >= 0 ? styles.success : styles.danger}`}
                      >
                        {currentMonthNetFlow >= 0 ? "+" : ""}रू{" "}
                        {Math.abs(currentMonthNetFlow).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.healthCard}>
          <div className={styles.healthHeader}>
            <div className={styles.healthTitleContainer}>
              <h3>Financial Health</h3>
              <div className={styles.pulse}></div>
            </div>
            <p>Liquidity position across all settlement channels.</p>
          </div>

          <div className={styles.healthMain}>
            <div className={styles.legendItem}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  className={styles.legendDot}
                  style={{ background: "var(--color-success)" }}
                ></span>
                <span className={styles.legendLabel}>Receivable</span>
              </div>
              <span className={styles.legendValueSuccess}>
                रू {owedToYou.toLocaleString()}
              </span>
            </div>

            <div className={styles.pieContainer}>
              <div
                className={styles.pieChart}
                style={{
                  background:
                    owedToYou === 0 && youOwe === 0
                      ? "var(--bg-tertiary)"
                      : `conic-gradient(var(--color-success) 0% ${(owedToYou / (owedToYou + youOwe)) * 100}%, var(--color-danger) ${(owedToYou / (owedToYou + youOwe)) * 100}% 100%)`,
                }}
              >
                <div className={styles.pieInner}>
                  <div
                    className={`${styles.netLiquidityPill} ${netBalance >= 0 ? styles.positiveStatus : styles.negativeStatus}`}
                  >
                    {netBalance >= 0 ? "+" : "-"}रू{" "}
                    {Math.abs(netBalance).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.legendItem} ${styles.legendItemRight}`}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  className={styles.legendDot}
                  style={{ background: "var(--color-danger)" }}
                ></span>
                <span className={styles.legendLabel}>Payable</span>
              </div>
              <span className={styles.legendValueDanger}>
                रू {youOwe.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Transaction Intelligence ── */}
      <section className={styles.chartSection}>
        <MonthlyExpenditureChart />
      </section>

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseType={EXPENSE_TYPE.PERSONAL}
      />
    </div>
  );
}
