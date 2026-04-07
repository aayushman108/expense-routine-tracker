"use client";

import React from "react";
import { BiErrorCircle, BiRefresh, BiHomeAlt } from "react-icons/bi";
import { useRouter } from "next/navigation";
import Button from "../Button/Button";
import styles from "./ErrorState.module.scss";

interface ErrorStateProps {
  error?: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  reset,
  title = "Something went wrong!",
  message = "An unexpected error occurred. We've been notified and are looking into it.",
  icon,
}) => {
  const router = useRouter();

  return (
    <div className={styles.errorContainer}>
      <div className={styles.iconWrapper}>
        {icon || <BiErrorCircle />}
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>
        {error?.message || message}
      </p>
      
      <div className={styles.actions}>
        {reset && (
          <Button variant="primary" onClick={() => reset()} className={styles.actionButton}>
            <span className={styles.buttonIcon}>
              <BiRefresh size={20} />
            </span>
            Try Again
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className={styles.actionButton}
        >
          <span className={styles.buttonIcon}>
            <BiHomeAlt size={20} />
          </span>
          Go Back Home
        </Button>
      </div>

      {error?.digest && (
        <p style={{ marginTop: "2rem", fontSize: "0.8rem", color: "var(--text-tertiary)", opacity: 0.6 }}>
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
};

export default ErrorState;
