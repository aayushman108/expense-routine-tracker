"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlinePhone,
} from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signupUser, clearError } from "@/store/slices/authSlice";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import styles from "../auth.module.scss";

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const cardRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    full_name: "",
    nickname: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(signupUser(form));
    if (signupUser.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
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
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>
            Start tracking your expenses for free
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.success}>
            Account created! Check your email to verify, then log in.
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <Input
              label="Full Name"
              name="full_name"
              placeholder="Aayushman"
              icon={<HiOutlineUser />}
              value={form.full_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Nickname"
              name="nickname"
              placeholder="Aayush"
              icon={<HiOutlineUser />}
              value={form.nickname}
              onChange={handleChange}
            />
          </div>

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
            label="Phone"
            type="tel"
            name="phone"
            placeholder="+977 98XXXXXXXX"
            icon={<HiOutlinePhone />}
            value={form.phone}
            onChange={handleChange}
          />

          <div className={styles.row}>
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
            <Input
              label="Confirm Password"
              type="password"
              name="confirm_password"
              placeholder="••••••••"
              icon={<HiOutlineLockClosed />}
              value={form.confirm_password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
