"use client";

import { useEffect } from "react";
import {
  HiCheckCircle,
  HiXCircle,
  HiExclamation,
  HiInformationCircle,
  HiX,
} from "react-icons/hi";
import styles from "./Toast.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeToast } from "@/store/slices/uiSlice";

const icons = {
  success: <HiCheckCircle />,
  error: <HiXCircle />,
  warning: <HiExclamation />,
  info: <HiInformationCircle />,
};

export default function ToastContainer() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  if (!toasts.length) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <span className={styles.icon}>{icons[toast.type]}</span>
          <span className={styles.content}>{toast.message}</span>
          <button
            className={styles.close}
            onClick={() => dispatch(removeToast(toast.id))}
            aria-label="Dismiss"
          >
            <HiX />
          </button>
        </div>
      ))}
    </div>
  );
}
