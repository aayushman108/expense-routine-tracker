"use client";

import React, { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

  const currentMonthIndex = new Date().getMonth();

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
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-hover)", radius: 8 }} />
            <Bar 
              dataKey="totalExpense" 
              radius={[6, 6, 0, 0]} 
              barSize={28}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === currentMonthIndex ? "var(--color-primary)" : "var(--color-primary-50)"} 
                  style={{ transition: 'fill 0.3s ease' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyExpenditureChart;
