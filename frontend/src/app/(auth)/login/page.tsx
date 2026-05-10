"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loginUser,
  googleLogin,
  clearError,
  getCurrentUser,
} from "@/store/slices/authSlice";
import { handleThunk } from "@/lib/utils";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import { UserValidation } from "@expense-tracker/shared/validationSchema";
import { validateData } from "@/lib/validation";
import styles from "../auth.module.scss";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);
  const cardRef = useRef<HTMLDivElement>(null);
  const loginAttempted = useRef(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (
      session?.user &&
      !isAuthenticated &&
      !isLoading &&
      !loginAttempted.current
    ) {
      loginAttempted.current = true;
      dispatch(
        googleLogin({
          email: session.user.email!,
          fullName: session.user.name!,
          googleId: (session.user as any).id,
          avatarUrl: session.user.image!,
        }),
      );
    }
  }, [session, isAuthenticated, isLoading, dispatch]);

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

    const result = validateData(UserValidation.loginSchema, { body: form });
    if (!result.success && result.errors) {
      setValidationErrors(result.errors);
      return;
    }

    await handleThunk(dispatch(loginUser(form)), () => {
      dispatch(getCurrentUser());
    });
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
            <span className={styles.logoText}>SyncSplit</span>
          </Link>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to manage your expenses</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign In
          </Button>

          <div className={styles.forgotPassword}>
            <Link href="/forgot-password">Forgot your password?</Link>
          </div>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => {
              setIsGoogleLoading(true);
              signIn("google");
            }}
            isLoading={
              isGoogleLoading || (status === "authenticated" && isLoading)
            }
            disabled={
              isGoogleLoading || (status === "authenticated" && isLoading)
            }
            className={styles.googleBtn}
          >
            <FcGoogle />
            <span>Sign in with Google</span>
          </Button>
        </form>

        <div className={styles.footer}>
          Don&apos;t have an account? <Link href="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
