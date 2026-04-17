"use client";

import React from "react";
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
import styles from "./MonthlyExpenditureChart.module.scss";

const data = [
  { month: "Jan", amount: 4200 },
  { month: "Feb", amount: 3800 },
  { month: "Mar", amount: 2400 },
  { month: "Apr", amount: 2100 },
  { month: "May", amount: 3500 },
  { month: "Jun", amount: 4800 },
  { month: "Jul", amount: 5200 },
  { month: "Aug", amount: 3900 },
  { month: "Sep", amount: 2800 },
  { month: "Oct", amount: 4100 },
  { month: "Nov", amount: 3200 },
  { month: "Dec", amount: 4500 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>
          रू {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const MonthlyExpenditureChart = () => {
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
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="var(--border-light)" 
              opacity={0.5}
            />
            <XAxis 
              dataKey="month" 
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
              dataKey="amount" 
              radius={[6, 6, 0, 0]} 
              barSize={28}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 6 ? "var(--color-primary)" : "var(--color-primary-50)"} 
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
