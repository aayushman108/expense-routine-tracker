"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppSelector } from "@/store/hooks";
import styles from "./MonthlyExpenditureChart.module.scss";
import { ChartSkeleton } from "@/app/dashboard/DashboardLoadingSkeletons";

interface GroupDetail {
  groupName: string;
  amount: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: {
      month: string;
      personalExpense: number;
      groupExpense: number;
      totalGroupExpenditure: number;
      totalPaidInGroup: number;
      netGroupFlow: number;
      totalExpense: number;
      groupDetails: GroupDetail[];
    };
    value: number;
  }[];
  label?: string;
  mode?: "default" | "personal";
}

const CustomTooltip = ({
  active,
  payload,
  label,
  mode = "default",
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.label}>{label}</p>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span>Personal expenses</span>
            <p>रू {data.personalExpense.toLocaleString()}</p>
          </div>

          {mode === "default" && (
            <>
              <div className={styles.groupAnalyticsSection}>
                <span className={styles.sectionTitle}>Group Analytics</span>
                <div className={styles.metric}>
                  <span>Group Spend</span>
                  <p>रू {data.totalGroupExpenditure.toLocaleString()}</p>
                </div>
                <div className={styles.metric}>
                  <span>My share</span>
                  <p>रू {data.groupExpense.toLocaleString()}</p>
                </div>
                <div className={styles.metric}>
                  <span>Paid by me</span>
                  <p>रू {data.totalPaidInGroup.toLocaleString()}</p>
                </div>

                <div
                  className={`${styles.metric} ${data.netGroupFlow >= 0 ? styles.success : styles.danger}`}
                >
                  <span>Net Balance</span>
                  <p>
                    {data.netGroupFlow >= 0 ? "+" : ""} रू{" "}
                    {data.netGroupFlow.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className={`${styles.metric} ${styles.total}`}>
                <span>Total Outflow</span>
                <p>रू {data.totalExpense.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const AnalyticsCard = ({
  data,
  mode,
}: {
  data: any;
  mode: "default" | "personal";
}) => (
  <div className={styles.analyticsCard}>
    <p className={styles.cardMonth}>{data.month}</p>
    <div className={styles.metrics}>
      <div className={styles.metric}>
        <span>Personal expenses</span>
        <p>रू {data.personalExpense.toLocaleString()}</p>
      </div>

      {mode === "default" && (
        <>
          <div className={styles.groupAnalyticsSection}>
            <span className={styles.sectionTitle}>Group Analytics</span>
            <div className={styles.metric}>
              <span>Group Spend</span>
              <p>रू {data.totalGroupExpenditure.toLocaleString()}</p>
            </div>
            <div className={styles.metric}>
              <span>My share</span>
              <p>रू {data.groupExpense.toLocaleString()}</p>
            </div>
            <div className={styles.metric}>
              <span>Paid by me</span>
              <p>रू {data.totalPaidInGroup.toLocaleString()}</p>
            </div>
            <div
              className={`${styles.metric} ${data.netGroupFlow >= 0 ? styles.success : styles.danger}`}
            >
              <span>Net Balance</span>
              <p>
                {data.netGroupFlow >= 0 ? "+" : ""} रू{" "}
                {data.netGroupFlow.toLocaleString()}
              </p>
            </div>
          </div>

          <div className={`${styles.metric} ${styles.total}`}>
            <span>Total Outflow</span>
            <p>रू {data.totalExpense.toLocaleString()}</p>
          </div>
        </>
      )}
    </div>
  </div>
);

interface MonthlyExpenditureChartProps {
  variant?: "default" | "compact";
  mode?: "default" | "personal";
}

const MonthlyExpenditureChart: React.FC<MonthlyExpenditureChartProps> = ({
  variant = "default",
  mode = "default",
}) => {
  const { monthlyAnalytics, monthlyAnalyticsLoading } = useAppSelector(
    (state) => state.expenses,
  );

  if (monthlyAnalyticsLoading || !monthlyAnalytics?.length) {
    return <ChartSkeleton />;
  }

  // Format data for the chart (shorten month names)
  const chartData = monthlyAnalytics?.map((item) => ({
    ...item,
    displayMonth: item.month.slice(0, 3),
  }));

  const activeMonths = chartData
    .filter((_, index) => index <= new Date().getMonth())
    .reverse();

  const dataKey = mode === "personal" ? "personalExpense" : "totalExpense";
  const chartHeight = variant === "compact" ? 200 : 240;

  return (
    <div
      className={`${styles.chartContainer} ${variant === "compact" ? styles.compact : ""}`}
    >
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h3>
            {variant === "compact"
              ? "Spending Trends"
              : "Expenditure Analytics"}
          </h3>
          <p>
            {mode === "personal"
              ? "Your private spending over the year"
              : "Monthly spending patterns across current fiscal year"}
          </p>
        </div>
        <div className={styles.legend}>
          <div className={styles.dot}></div>
          <span>{mode === "personal" ? "Personal Spend" : "Net Outflow"}</span>
        </div>
      </div>

      {/* ── Desktop Chart View ── */}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-light)"
              opacity={0.5}
            />
            <XAxis
              dataKey="displayMonth"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--text-tertiary)",
                fontSize: 11,
                fontWeight: 600,
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--text-tertiary)",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Tooltip
              content={<CustomTooltip mode={mode} />}
              cursor={{
                stroke: "var(--color-primary)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="var(--color-primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Tablet/Mobile Analytics Feed ── */}
      <div className={styles.analyticsContainer}>
        {activeMonths.map((item) => (
          <AnalyticsCard key={item.month} data={item} mode={mode} />
        ))}
      </div>
    </div>
  );
};

export default MonthlyExpenditureChart;
