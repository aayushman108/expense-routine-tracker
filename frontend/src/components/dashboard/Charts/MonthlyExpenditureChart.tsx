"use client";

import React, { useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMonthlyAnalytics } from "@/store/slices/expenseSlice";
import styles from "./MonthlyExpenditureChart.module.scss";

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: {
      month: string;
      personalExpense: number;
      groupExpense: number;
      totalExpense: number;
    };
    value: number;
  }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.label}>{label}</p>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span>Personal</span>
            <p>रू {payload[0].payload.personalExpense.toLocaleString()}</p>
          </div>
          <div className={styles.metric}>
            <span>Group Share</span>
            <p>रू {payload[0].payload.groupExpense.toLocaleString()}</p>
          </div>
          <div className={`${styles.metric} ${styles.total}`}>
            <span>Total Outflow</span>
            <p>रू {payload[0].payload.totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const MonthlyExpenditureChart = () => {
  const dispatch = useAppDispatch();
  const { monthlyAnalytics } = useAppSelector((state) => state.expenses);

  useEffect(() => {
    dispatch(fetchMonthlyAnalytics());
  }, [dispatch]);

  // Format data for the chart (shorten month names)
  const chartData = monthlyAnalytics.map((item) => ({
    ...item,
    displayMonth: item.month.slice(0, 3),
  }));

  const maxExpense = Math.max(...chartData.map(d => d.totalExpense), 1);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h3>Expenditure Analytics</h3>
          <p>Monthly spending patterns across current fiscal year</p>
        </div>
        <div className={styles.legend}>
          <div className={styles.dot}></div>
          <span>Net Outflow</span>
        </div>
      </div>
      
      {/* ── Desktop Chart View ── */}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
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
              tick={{ fill: "var(--text-tertiary)", fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--text-tertiary)", fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-primary)", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="totalExpense"
              stroke="var(--color-primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Mobile Modular Feed ── */}
      <div className={styles.mobileFeed}>
        {chartData.filter((_, index) => index <= new Date().getMonth()).reverse().map((item, index) => (
          <div key={item.month} className={styles.monthRow} style={{ animationDelay: `${index * 0.05}s` }}>
            <div className={styles.rowMetadata}>
               <span className={styles.monthName}>{item.month}</span>
               <span className={styles.amount}>रू {item.totalExpense.toLocaleString()}</span>
            </div>
            <div className={styles.progressContainer}>
               <div 
                 className={styles.progressBar} 
                 style={{ width: `${(item.totalExpense / maxExpense) * 100}%` }}
               />
               <div className={styles.marker} style={{ left: `${(item.totalExpense / maxExpense) * 100}%` }} />
            </div>
            <div className={styles.breakdown}>
               <span>Personal: रू {item.personalExpense.toLocaleString()}</span>
               <span className={styles.divider}>•</span>
               <span>Group: रू {item.groupExpense.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyExpenditureChart;
