"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlinePhone,
} from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signupUser, clearError, verifyEmail } from "@/store/slices/authSlice";
import VerifyEmailModal from "@/components/auth/VerifyEmailModal";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import { handleThunk } from "@/lib/utils";
import { UserValidation } from "@expense-tracker/shared/validationSchema/auth.schema";
import { validateData } from "@/lib/validation";
import styles from "../auth.module.scss";

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, verificationToken } = useAppSelector((s) => s.auth);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear validation error when user types
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setValidationErrors({});

    if (form.password !== form.confirmPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    const result = validateData(UserValidation.signupSchema, {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    if (!result.success && result.errors) {
      setValidationErrors(result.errors);
      return;
    }

    await handleThunk(dispatch(signupUser(form)), () => {
      setSuccess(true);
      setShowVerifyModal(true);
    });
  };

  const handleVerify = async (otp: string) => {
    if (verificationToken) {
      await handleThunk(
        dispatch(
          verifyEmail({ token: verificationToken, activationCode: otp }),
        ),
        () => {
          setShowVerifyModal(false);
          router.push("/login?verified=true");
        },
      );
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
          <Input
            label="Full Name"
            name="fullName"
            placeholder="Aayushman"
            icon={<HiOutlineUser />}
            value={form.fullName}
            onChange={handleChange}
            error={validationErrors.fullName}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            icon={<HiOutlineMail />}
            value={form.email}
            onChange={handleChange}
            error={validationErrors.email}
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
            error={validationErrors.phone}
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
          </div>

          <p className={styles.passwordHint}>
            Password must be 8+ characters with uppercase, lowercase, numbers,
            and symbols (@$!%*?&#).
          </p>

          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>

      <VerifyEmailModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerify={handleVerify}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
