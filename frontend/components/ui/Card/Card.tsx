"use client";

import React from "react";
import styles from "./Card.module.scss";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  clickable?: boolean;
  gradient?: boolean;
  glass?: boolean;
  noPadding?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  clickable = false,
  gradient = false,
  glass = false,
  noPadding = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${clickable ? styles.clickable : ""} ${gradient ? styles.gradient : ""} ${glass ? styles.glass : ""} ${noPadding ? styles.noPadding : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
