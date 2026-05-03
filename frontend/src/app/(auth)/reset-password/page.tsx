"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HiOutlineLockClosed,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import { UserValidation } from "@expense-tracker/shared/validationSchema";
import { validateData } from "@/lib/validation";
import styles from "../auth.module.scss";
import api from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const cardRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useGSAP(
    () => {
      if (cardRef.current) {
        gsap.from(cardRef.current, {
          opacity: 0,
          y: 30,
          scale: 0.96,
          duration: 0.6,
          ease: "power3.out",
        });
      }
    },
    { scope: cardRef },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setValidationErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    const result = validateData(UserValidation.resetPasswordSchema, {
      body: {
        token: token || "",
        password: form.password,
      },
    });

    if (!result.success && result.errors) {
      setValidationErrors(result.errors);
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      await api.post("/auth/reset-password", {
        token,
        password: form.password,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Reset failed. Your token may have expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.themeToggleWrap}>
        <ThemeToggle />
      </div>

      <div className={styles.card} ref={cardRef}>
        <div className={styles.header}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoIcon}>
              <FiPieChart />
            </div>
            <span className={styles.logoText}>Expensora</span>
          </Link>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your new password below</p>
        </div>

        {isSubmitted ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <HiOutlineCheckCircle />
            </div>
            <h3>Password Reset!</h3>
            <p>
              Your password has been successfully reset. You can now login with
              your new password.
            </p>
            <Link href="/login" className={styles.backToLogin}>
              <HiOutlineArrowLeft /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && <div className={styles.error}>{error}</div>}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <Input
                label="New Password"
                type="password"
                name="password"
                placeholder="••••••••"
                icon={<HiOutlineLockClosed />}
                value={form.password}
                onChange={handleChange}
                error={validationErrors.password}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                icon={<HiOutlineLockClosed />}
                value={form.confirmPassword}
                onChange={handleChange}
                error={validationErrors.confirmPassword}
                required
              />
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={!token}
              >
                Reset Password
              </Button>
            </form>

            <div className={styles.footer}>
              <Link href="/login" className={styles.backLink}>
                <HiOutlineArrowLeft /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
