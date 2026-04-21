import React from "react";
import styles from "./Skeleton.module.scss";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: "text" | "rectangular" | "circular";
}

const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className = "",
  variant = "rectangular",
}) => {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius,
  };

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
