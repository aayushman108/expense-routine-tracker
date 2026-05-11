"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  HiOutlineChevronLeft, 
  HiOutlineLightBulb, 
  HiOutlineUserGroup, 
  HiOutlineCash, 
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineDeviceMobile,
  HiOutlineBell,
  HiOutlineClipboardCheck,
  HiOutlineDesktopComputer,
  HiOutlineGlobeAlt
} from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import styles from "./how-it-works.module.scss";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HowItWorksContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Header animation
    const headerTimeline = gsap.timeline();
    headerTimeline
      .fromTo(`.${styles.backLink}`, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 })
      .fromTo(`.${styles.badge}`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
      .fromTo(`.${styles.header} h1`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.2")
      .fromTo(`.${styles.header} p`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");

    const sections = gsap.utils.toArray(`.${styles.section}`);
    
    sections.forEach((section: any) => {
      const q = gsap.utils.selector(section);
      
      // Select all potential targets and filter out empty ones
      const targets = [
        section,
        q("h2"),
        q(`.${styles.introText}`),
        q(`.${styles.featureCard}`),
        q(`.${styles.processItem}`)
      ].filter(t => (Array.isArray(t) ? t.length > 0 : !!t));

      if (targets.length > 0) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              once: true
            }
          }
        );
      }
    });

    // CTA animation
    gsap.fromTo(`.${styles.ctaSection}`,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: `.${styles.ctaSection}`,
          start: "top 90%",
          once: true
        }
      }
    );
  }, []);

  return (
    <div className={styles.howItWorksPage} ref={containerRef}>
      <div className={styles.gridOverlay} />
      <div className={`${styles.blob} ${styles.primary}`} />
      <div className={`${styles.blob} ${styles.secondary}`} />

      <Navbar />

      <div className={styles.pageContent}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.backLink}>
              <HiOutlineChevronLeft /> Back to Home
            </Link>

            <div className={styles.badge}>
              <div className={styles.icon}>
                <HiOutlineLightBulb />
              </div>
              <span>Complete Guide</span>
            </div>
            <h1>How Works</h1>
            <p>
              Master the SyncSplit protocol to manage your individual and group finances with surgical precision.
            </p>
          </div>
        </header>

        {/* Step 1: Account Setup */}
        <section className={styles.section} id="onboarding">
          <div className={styles.sectionInner}>
            <h2>
              <span className={styles.stepNum}>01</span> 
              Secure Onboarding
            </h2>
            <p className={styles.introText}>
              SyncSplit uses industry-standard security protocols to keep your financial data private and accessible only to you and your trusted group members.
            </p>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineShieldCheck />
                </div>
                <div className={styles.cardContent}>
                  <h3>Identity Management</h3>
                  <p>Sign up using your email or with one-tap Google OAuth. We use JWT (JSON Web Tokens) to ensure your sessions are always encrypted and secure.</p>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineDeviceMobile />
                </div>
                <div className={styles.cardContent}>
                  <h3>Install as PWA</h3>
                  <p>Add SyncSplit to your home screen. Our Progressive Web App technology provides a native feel, offline access, and fast loading times.</p>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineGlobeAlt />
                </div>
                <div className={styles.cardContent}>
                  <h3>Anywhere Access</h3>
                  <p>Use SyncSplit as a desktop app, mobile app, or directly in your browser. Your data is synced in real-time across all your devices.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Personal Expenses */}
        <section className={styles.section} id="individual-tracking">
          <div className={styles.sectionInner}>
            <h2>
              <span className={styles.stepNum}>02</span> 
              Individual Tracking
            </h2>
            <p className={styles.introText}>
              Before you split, you need to track. SyncSplit serves as a powerful personal ledger to help you understand your spending habits.
            </p>
            <div className={styles.processList}>
              <div className={styles.processItem}>
                <div className={styles.dot} />
                <div className={styles.itemContent}>
                  <h4>Log Daily Spends</h4>
                  <p>Record every transaction with descriptions, amounts, and categories. Categorization helps you see where your money goes at a glance.</p>
                </div>
              </div>
              <div className={styles.processItem}>
                <div className={styles.dot} />
                <div className={styles.itemContent}>
                  <h4>Monthly Analytics</h4>
                  <p>Gain insights with automated monthly reports. Visual charts help identify spending patterns and areas for potential savings.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Groups & Splitting */}
        <section className={styles.section} id="collaboration">
          <div className={styles.sectionInner}>
            <h2>
              <span className={styles.stepNum}>03</span> 
              Collaborative Finance
            </h2>
            <p className={styles.introText}>
              The core of SyncSplit is group management. Whether it's roommates, a weekend trip, or shared project costs, we've got you covered.
            </p>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineUserGroup />
                </div>
                <div className={styles.cardContent}>
                  <h3>Dynamic Groups</h3>
                  <p>Create groups and invite friends. Everyone in the group can add expenses, making the process transparent and fair.</p>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineLightningBolt />
                </div>
                <div className={styles.cardContent}>
                  <h3>Advanced Split Logic</h3>
                  <p>Split bills equally, by exact percentages, or fixed amounts. Our engine handles the math, so you don't have to.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4: Verification Protocol */}
        <section className={styles.section} id="verification">
          <div className={styles.sectionInner}>
            <h2>
              <span className={styles.stepNum}>04</span> 
              The Verification Protocol
            </h2>
            <p className={styles.introText}>
              Accuracy is paramount. Before any expense is factored into a settlement, it must pass through our verification gateway.
            </p>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineClipboardCheck />
                </div>
                <div className={styles.cardContent}>
                  <h3>Mutual Approval</h3>
                  <p>Every participant in a split must review and verify the expense. This ensures that everyone agrees on the amount and the logic before money moves.</p>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineShieldCheck />
                </div>
                <div className={styles.cardContent}>
                  <h3>Settlement Integrity</h3>
                  <p>Our calculation engine only processes expenses that are 100% verified. This prevents disputes and ensures your final settlement figures are always indisputable.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 5: Settlements */}
        <section className={styles.section} id="settlements">
          <div className={styles.sectionInner}>
            <h2>
              <span className={styles.stepNum}>05</span> 
              Smart Settlements
            </h2>
            <p className={styles.introText}>
              Tired of endless back-and-forth transactions? Our "Minimum Path" algorithm simplifies group debts into the fewest possible payments.
            </p>
            <div className={styles.processList}>
              <div className={styles.processItem}>
                <div className={styles.dot} />
                <div className={styles.itemContent}>
                  <h4>Debt Minimization</h4>
                  <p>Our algorithm calculates the most efficient way to settle up. Instead of everyone paying everyone, we find the shortest route to zero balance based on all verified expenses.</p>
                </div>
              </div>
              <div className={styles.processItem}>
                <div className={styles.dot} />
                <div className={styles.itemContent}>
                  <h4>Proof of Payment</h4>
                  <p>Upload receipts or screenshots of transfers. This creates an immutable record within the group, preventing any confusion or disputes.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 6: Notifications */}
        <section className={styles.section} id="notifications">
          <div className={styles.sectionInner}>
            <h2>
              <span className={styles.stepNum}>06</span> 
              Stay Synchronized
            </h2>
            <p className={styles.introText}>
              Never miss an update. SyncSplit keeps everyone in the loop with real-time feedback and reminders.
            </p>
            <div className={styles.featureCard} style={{ maxWidth: '100%' }}>
              <div className={styles.cardIcon}>
                <HiOutlineBell />
              </div>
              <div className={styles.cardContent}>
                <h3>Real-time Alerts</h3>
                <p>Powered by Firebase Cloud Messaging (FCM), you get instant push notifications whenever a new expense is added, a settlement is requested, or a debt is cleared. Stay updated across all your devices.</p>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.ctaWrapper}>
          <section className={styles.ctaSection}>
            <h2>Ready to get started?</h2>
            <p>Join thousands of users who trust SyncSplit for their financial coordination.</p>
            <div className={styles.btnGroup}>
              <Link href="/signup" className={styles.primaryBtn}>
                Create Free Account
              </Link>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
