"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  HiOutlineChevronLeft, 
  HiOutlineLightBulb, 
  HiOutlineUserGroup, 
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineDeviceMobile,
  HiOutlineBell,
  HiOutlineClipboardCheck,
  HiOutlineDesktopComputer,
  HiOutlineGlobeAlt
} from "react-icons/hi";
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

    const sections = gsap.utils.toArray<HTMLElement>(`.${styles.section}`);
    
    sections.forEach((section) => {
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
            <h1>How It <span>Works</span></h1>
            <p>
              Move from signup to personal tracking, group collaboration, verified settlements, and payment confirmation in one structured workflow.
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
              Start with a secure account, then complete your profile so expenses, groups, notifications, and payment details are tied to the right person.
            </p>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineShieldCheck />
                </div>
                <div className={styles.cardContent}>
                  <h3>Identity Management</h3>
                  <p>Sign up or log in with email credentials or Google OAuth. Authenticated sessions protect access to your personal ledger, groups, profile, and settings.</p>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineDeviceMobile />
                </div>
                <div className={styles.cardContent}>
                  <h3>Profile & Payment Details</h3>
                  <p>Use the profile page to update basic account details and add payment information, so group members know where to send settlement payments.</p>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineGlobeAlt />
                </div>
                <div className={styles.cardContent}>
                  <h3>Browser & PWA Access</h3>
                  <p>Use SyncSplit from your browser or install it as a PWA on desktop and mobile. Account data stays connected to your login and remains available when you are online.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Personal Expenses */}
        <section className={`${styles.section} ${styles.trackingSection}`} id="individual-tracking">
          <div className={styles.sectionInner}>
            <h2>
              <span className={styles.stepNum}>02</span> 
              Individual Tracking
            </h2>
            <p className={styles.introText}>
              Personal expenses are private records for your own budgeting. They do not affect group expenses, split calculations, or settlement balances.
            </p>
            <div className={styles.processList}>
              <div className={styles.processItem}>
                <div className={styles.itemContent}>
                  <h4>Log Daily Spends</h4>
                  <p>Record non-group transactions with descriptions, amounts, dates, and categories. Use this for your own meals, subscriptions, transport, rent, or personal purchases.</p>
                </div>
              </div>
              <div className={styles.processItem}>
                <div className={styles.itemContent}>
                  <h4>Monthly Analytics</h4>
                  <p>Use summaries and charts to understand spending patterns, review category totals, and monitor monthly changes in your personal budget.</p>
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
              Groups keep shared costs separate from personal spending. Use them for roommates, trips, events, projects, or any recurring shared payment context.
            </p>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineUserGroup />
                </div>
                <div className={styles.cardContent}>
                  <h3>Dynamic Groups</h3>
                  <p>Create a group, add members who already have SyncSplit accounts, or invite unregistered people by email. Invitation emails help new members join the right group.</p>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineLightningBolt />
                </div>
                <div className={styles.cardContent}>
                  <h3>Advanced Split Logic</h3>
                  <p>Any member can add a group expense and define who participated in it. Split equally, by fixed amount, by percentage, or by custom shares.</p>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineDesktopComputer />
                </div>
                <div className={styles.cardContent}>
                  <h3>Group Management Page</h3>
                  <p>Each group has a dedicated management page for members, expenses, settlement history, and group-level actions.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4: Expense Verification */}
        <section className={styles.section} id="verification">
          <div className={styles.sectionInner}>
            <h2>
              <span className={styles.stepNum}>04</span> 
              Expense Verification
            </h2>
            <p className={styles.introText}>
              Group settlements are based only on expenses that every included participant has reviewed and verified.
            </p>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineClipboardCheck />
                </div>
                <div className={styles.cardContent}>
                  <h3>Mutual Approval</h3>
                  <p>Every participant included in a split must verify the expense. This confirms the amount, payer, and split logic before it affects balances.</p>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineShieldCheck />
                </div>
                <div className={styles.cardContent}>
                  <h3>Settlement Integrity</h3>
                  <p>The settlement engine excludes pending or disputed expenses. Only fully verified records are used to calculate who owes whom.</p>
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
              Once expenses are verified, SyncSplit calculates balances and guides each payment through proof upload and receiver confirmation.
            </p>
            <div className={styles.processList}>
              <div className={styles.processItem}>
                <div className={styles.dot} />
                <div className={styles.itemContent}>
                  <h4>Debt Minimization</h4>
                  <p>The algorithm reduces verified balances into the fewest practical payments. The person who owes pays the assigned receiver.</p>
                </div>
              </div>
              <div className={styles.processItem}>
                <div className={styles.dot} />
                <div className={styles.itemContent}>
                  <h4>Proof of Payment</h4>
                  <p>After paying, the payer uploads payment proof. The receiver reviews and confirms the payment, closing that settlement item.</p>
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
              SyncSplit uses notifications and user-controlled settings to keep group activity visible without forcing every alert on every user.
            </p>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineBell />
                </div>
                <div className={styles.cardContent}>
                  <h3>FCM Notifications</h3>
                  <p>Firebase Cloud Messaging can notify users about invitations, expense activity, verification updates, settlement requests, proof uploads, and payment confirmations.</p>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.cardIcon}>
                  <HiOutlineClipboardCheck />
                </div>
                <div className={styles.cardContent}>
                  <h3>Notification Settings</h3>
                  <p>Use the settings page to manage notification preferences and keep alerts aligned with how you want to follow group activity.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.ctaWrapper}>
          <section className={styles.ctaSection}>
            <h2>Ready to get started?</h2>
            <p>Create an account, add your first personal expense, or start a group with a verified settlement flow.</p>
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
