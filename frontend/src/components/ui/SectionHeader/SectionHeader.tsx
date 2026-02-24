import React from "react";
import styles from "./SectionHeader.module.scss";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "center" | "left" | "between";
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  title,
  subtitle,
  className = "",
  align = "center",
  fullWidth = false,
  children,
}) => {
  const headerClasses = [
    styles.sectionHeader,
    styles[align],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={headerClasses}>
      <div className={styles.content}>
        {label && <span className={styles.sectionLabel}>{label}</span>}
        <h2 className={styles.sectionTitle}>{title}</h2>
        {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
};

export default SectionHeader;
