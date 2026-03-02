"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HiOutlineMail,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import styles from "../auth.module.scss";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setIsLoading(true);
    setError(null);

    try {
      await api.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
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
            <span className={styles.logoText}>SplitWise</span>
          </Link>
          <h1 className={styles.title}>Forgot Password?</h1>
          <p className={styles.subtitle}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {isSubmitted ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <HiOutlineCheckCircle />
            </div>
            <h3>Check your email</h3>
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link href="/login" className={styles.backToLogin}>
              <HiOutlineArrowLeft /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && <div className={styles.error}>{error}</div>}

            <form className={styles.form} onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<HiOutlineMail />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" fullWidth isLoading={isLoading}>
                Send Reset Link
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
