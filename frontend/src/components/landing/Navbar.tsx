"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/uiSlice";
import { handleThunk } from "@/lib/utils";
import { useLoading } from "../providers/LoadingProvider";
import styles from "./Navbar.module.scss";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { setIsLoading } = useLoading();

  const handleLoginClick = async () => {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (accessToken) {
      setIsLoading(true);
      const success = await handleThunk(
        dispatch(getCurrentUser()),
        () => {
          router.push("/dashboard");
          // The loader will be removed by the dashboard layout or we can set a timeout here
          // but usually the next page's layout will handle its own loading.
          // However, for consistency, let's keep it until navigation happens.
        },
        (error) => {
          setIsLoading(false);
          dispatch(
            addToast({
              type: "error",
              message: "Session expired. Please login again.",
            }),
          );
          console.info("Session in localStorage is invalid or expired.", error);
          router.push("/login");
        },
      );

      if (success) return;
    } else {
      setIsLoading(true);
      router.push("/login");
      // For simple pushes, we might want to hide it after a bit if the page doesn't take over
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.navContent}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Expensora</span>
          <FiPieChart />
        </Link>

        <div className={styles.navLinks}>
          <Link href="/#features">Features</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#use-cases">Use Cases</Link>
        </div>

        <div className={styles.navActions}>
          {/* <ThemeToggle /> */}

          <div className={styles.desktopBtn}>
            <button className={styles.loginBtn} onClick={handleLoginClick}>
              Log in
            </button>
          </div>
          <Link
            href="/signup"
            className={`${styles.getStartedBtn} ${styles.desktopBtn}`}
          >
            Get Started
          </Link>
          <button
            className={`${styles.mobileMenuBtn} ${mobileOpen ? styles.hide : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <HiX /> : <HiMenuAlt3 />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`${styles.drawerOverlay} ${mobileOpen ? styles.showOverlay : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={`${styles.mobileDrawer} ${mobileOpen ? styles.showDrawer : ""}`}
      >
        <div className={styles.drawerHeader}>
          <div className={styles.logo}>
            <span className={styles.logoText}>Expensora</span>
            <FiPieChart />
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <HiX />
          </button>
        </div>

        <div className={styles.drawerLinks}>
          <Link href="/#features" onClick={() => setMobileOpen(false)}>
            Features
          </Link>
          <Link href="/#how-it-works" onClick={() => setMobileOpen(false)}>
            How it works
          </Link>
          <Link href="/#use-cases" onClick={() => setMobileOpen(false)}>
            Use Cases
          </Link>
          <div className={styles.drawerActions}>
            <button
              className={styles.drawerLoginBtn}
              onClick={() => {
                setMobileOpen(false);
                handleLoginClick();
              }}
            >
              Log in
            </button>
            <Link
              href="/signup"
              className={styles.drawerGetStartedBtn}
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
