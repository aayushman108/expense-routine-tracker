"use client";

import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { HiX } from "react-icons/hi";
import styles from "./Modal.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  fullHeight?: boolean;
  disableClose?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size,
  fullHeight,
  disableClose = false,
}: ModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableClose) onClose();
    },
    [onClose, disableClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (!disableClose) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${styles[size || "md"]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <h2>{title}</h2>
            {!disableClose && (
              <button
                className={styles.closeBtn}
                onClick={(e) => {
                  if (!disableClose) onClose();
                }}
                aria-label="Close modal"
              >
                <HiX />
              </button>
            )}
          </div>
        )}
        <div
          className={`${styles.body} ${fullHeight ? styles.fullHeight : ""}`}
        >
          {children}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
