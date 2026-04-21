import React from "react";
import styles from "./Skeleton.module.scss";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  style?: React.CSSProperties;
  maxWidth?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  flexShrink?: number;
  flexGrow?: number;
  flexBasis?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className = "",
  variant = "rectangular",
  style: customStyle,
  maxWidth,
  minWidth,
  minHeight,
  flexShrink,
  flexGrow,
  flexBasis,
}) => {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius,
    maxWidth: maxWidth || "100%",
    minWidth,
    minHeight,
    flexShrink,
    flexGrow,
    flexBasis,
    ...customStyle,
  };

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
