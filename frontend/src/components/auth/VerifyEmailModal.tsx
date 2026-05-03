"use client";

import React, { useState, useRef } from "react";
import Modal from "../ui/Modal/Modal";
import Button from "../ui/Button/Button";
import styles from "./VerifyEmailModal.module.scss";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

// ── OTP Input Component ──
const OtpInput = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;

    const newValue = value.split("");
    newValue[index] = char.slice(-1); // Safety check
    const joined = newValue.join("").slice(0, 6);
    onChange(joined);

    // Move to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pastedData);

    // Focus the next empty input or the last one
    const nextFocusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  return (
    <div className={styles.otpGrid}>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={styles.otpInput}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
};

export default function VerifyEmailModal({
  isOpen,
  onClose,
  onVerify,
  isLoading,
  error,
}: VerifyEmailModalProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      await onVerify(otp);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Verification"
      footer={
        <Button
          type="submit"
          form="verify-email-form"
          fullWidth
          isLoading={isLoading}
          disabled={otp.length !== 6 || isLoading}
        >
          Verify Email
        </Button>
      }
    >
      <div className={styles.container}>
        <p className={styles.description}>
          We've sent a 6-digit code to your email. Please enter it below to
          verify your account.
        </p>

        <form
          id="verify-email-form"
          onSubmit={handleSubmit}
          className={styles.form}
          noValidate
        >
          <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </Modal>
  );
}
