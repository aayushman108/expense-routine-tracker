"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser, clearError } from "@/store/slices/authSlice";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import styles from "../auth.module.scss";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);
  const cardRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.96,
        duration: 0.6,
        ease: "power3.out",
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(form));
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
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to manage your expenses</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            icon={<HiOutlineMail />}
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            icon={<HiOutlineLockClosed />}
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className={styles.footer}>
          Don&apos;t have an account? <Link href="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
