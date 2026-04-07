"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import Button from "@/components/ui/Button/Button";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/uiSlice";
import { handleThunk } from "@/lib/utils";
import styles from "./Navbar.module.scss";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLoginClick = async () => {
    const accessToken =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    if (accessToken) {
      const success = await handleThunk(
        dispatch(getCurrentUser()),
        () => {
          router.push("/dashboard");
        },
        (error) => {
          dispatch(
            addToast({ type: "error", message: "Session expired. Please login again." }),
          );
          console.info("Session in localStorage is invalid or expired.", error);
        }
      );

      if (success) return;
    }

    router.push("/login");
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
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
        </div>

        <div className={styles.navActions}>
          <ThemeToggle />
          <div className={styles.desktopBtn}>
            <Button variant="ghost" size="sm" onClick={handleLoginClick}>
              Log in
            </Button>
          </div>
          <Link href="/signup" className={styles.desktopBtn}>
            <Button variant="primary" size="sm">
              Get Started
            </Button>
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
          <a href="#features" onClick={() => setMobileOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)}>
            How it works
          </a>
          <a href="#pricing" onClick={() => setMobileOpen(false)}>
            Pricing
          </a>
          <div className={styles.drawerActions}>
            <div
              onClick={() => {
                setMobileOpen(false);
                handleLoginClick();
              }}
            >
              <Button variant="ghost" size="lg">
                Log in
              </Button>
            </div>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
