"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUserSummary,
  fetchMonthlyAnalytics,
} from "@/store/slices/expenseSlice";
import MonthlyExpenditureChart from "@/components/dashboard/Charts/MonthlyExpenditureChart";
import {
  NotificationBanner,
  InfrastructureStats,
  PrivateLedgerCard,
  FinancialHealthCard,
} from "@/components/dashboard/DashboardSections";
import styles from "./dashboard.module.scss";
import type { RootState } from "@/store";

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const { monthlyAnalytics } = useAppSelector((s: RootState) => s.expenses);

  useEffect(() => {
    dispatch(fetchUserSummary());
    dispatch(fetchMonthlyAnalytics());
  }, [dispatch]);

  const currentMonthNum = new Date().getMonth() + 1;

  const currentMonthData = monthlyAnalytics?.[currentMonthNum - 1];

  return (
    <div className={styles.dashboard}>
      {/* ── Infrastructure Stats ── */}
      <InfrastructureStats />

      {/* ── Primary Assets ── */}
      <section className={styles.personalOverview}>
        <PrivateLedgerCard details={currentMonthData} />
        <FinancialHealthCard />
      </section>

      {/* ── Transaction Intelligence ── */}
      <section className={styles.chartSection}>
        <MonthlyExpenditureChart />
      </section>
    </div>
  );
}
