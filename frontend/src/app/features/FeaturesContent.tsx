"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  HiOutlineChevronLeft, 
  HiOutlineCash, 
  HiOutlineUserGroup, 
  HiOutlineChartBar, 
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineBell,
  HiOutlineGlobeAlt,
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineShare,
  HiOutlineArrowDown,
  HiOutlineUserAdd
} from "react-icons/hi";
import { FiPieChart } from "react-icons/fi";
import styles from "./features.module.scss";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FeaturesContent() {
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
      
      const targets = [
        q(`.${styles.sectionHeader}`),
        q(`.${styles.bentoCard}`)
      ].filter(t => (Array.isArray(t) ? t.length > 0 : !!t));

      if (targets.length > 0) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
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
    <div className={styles.featuresPage} ref={containerRef}>
      <div className={styles.gridOverlay} />
      <div className={`${styles.blob} ${styles.primary}`} />
      <div className={`${styles.blob} ${styles.secondary}`} />
      <div className={`${styles.blob} ${styles.tertiary}`} />

      <Navbar />

      <div className={styles.pageContent}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.backLink}>
              <HiOutlineChevronLeft /> Back to Home
            </Link>

            <div className={styles.badge}>
              <div className={styles.icon}>
                <HiOutlineSparkles />
              </div>
              <span>Platform Tour</span>
            </div>
            <h1>SyncSplit <span>Features</span></h1>
            <p>
              Explore our comprehensive financial suite engineered to split bills, track daily spends, and optimize group debts with surgical precision.
            </p>
          </div>
        </header>

        {/* Section 1: Core Ledgers */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNum}>MODULE 01</span>
              <h2>Individual Ledgers & Expense Control</h2>
              <p>Before splitting shared bills, you need a crystal-clear understanding of your own cashflow. SyncSplit serves as your secure personal ledger.</p>
            </div>

            <div className={styles.bentoGrid}>
              <div className={`${styles.bentoCard} ${styles.col8}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineCash />
                  </div>
                  <h3>Smart Expense Tracking</h3>
                  <p>Log transactions instantly with absolute ease. Capture the time, date, description, tags, and category for every single transaction. Whether it's your daily flat white coffee, monthly SaaS subscriptions, or recurring house rent, SyncSplit keeps everything beautifully structured.</p>
                </div>
                <div className={styles.illustration}>
                  <div className={styles.categoryPills}>
                    <span>☕ Food & Drinks</span>
                    <span>🏠 Rent & Utilities</span>
                    <span>💻 Subscriptions</span>
                    <span>🚗 Transport</span>
                    <span>🍿 Entertainment</span>
                  </div>
                </div>
              </div>

              <div className={`${styles.bentoCard} ${styles.col4}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineGlobeAlt />
                  </div>
                  <h3>Cross-Device PWA Sync</h3>
                  <p>Save SyncSplit straight to your mobile home screen or desktop application list. Our Progressive Web App technology guarantees zero delay, reliable offline logs, and blazing fast data synchronizations.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Splitting Engine */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNum}>MODULE 02</span>
              <h2>Collaborative Bill Splitting</h2>
              <p>Tear up the napkins and calculators. SyncSplit handles every split scenario imaginable with precision-engineered math.</p>
            </div>

            <div className={styles.bentoGrid}>
              <div className={`${styles.bentoCard} ${styles.col6}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineUserGroup />
                  </div>
                  <h3>Custom Split Engine</h3>
                  <p>Go far beyond simple 50/50 splits. Set specific percentages, exact cash amounts, or custom shares to split the cost fairly based on what everyone actually consumed.</p>
                </div>
                <div className={styles.illustration}>
                  <div className={styles.splitMatrix}>
                    <div className={styles.matrixRow}>
                      <span>You (Paid Rs. 1500)</span>
                      <span>Owner</span>
                    </div>
                    <div className={styles.matrixRow}>
                      <span>Alex (40% Share)</span>
                      <span>Rs. 600</span>
                    </div>
                    <div className={styles.matrixRow}>
                      <span>Emily (30% Share)</span>
                      <span>Rs. 450</span>
                    </div>
                    <div className={styles.matrixRow}>
                      <span>Jack (30% Share)</span>
                      <span>Rs. 450</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${styles.bentoCard} ${styles.col6}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineLightningBolt />
                  </div>
                  <h3>Multi-Group Architecture</h3>
                  <p>Keep your financial spaces completely organized. Set up dedicated rooms for your roommates, special weekend road trips, collaborative office projects, or a dinner night. Each group enjoys separate analytics, audit logs, and member permissions.</p>
                </div>
                <div className={styles.illustration}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'var(--bg-primary)', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--border-default)' }}>
                      <strong>🏡 Room 402 Roommates</strong>
                      <span>3 Active Members</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'var(--bg-primary)', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--border-default)' }}>
                      <strong>✈️ Pokhara Roadtrip 2026</strong>
                      <span>6 Active Members</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Verification & Settlement */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNum}>MODULE 03</span>
              <h2>Algorithmic Debt Settlements & Security</h2>
              <p>Resolve multiple overlapping payments into a singular optimized network. True convenience, backed by digital verification.</p>
            </div>

            <div className={styles.bentoGrid}>
              <div className={`${styles.bentoCard} ${styles.col4}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineShieldCheck />
                  </div>
                  <h3>Debt Minimization</h3>
                  <p>Our optimization engine calculates the shortest possible routing path between group members. Instead of everyone initiating transfer loops, it simplifies debts to a bare minimum number of transactions.</p>
                </div>
                <div className={styles.illustration}>
                  <div className={styles.settlementPath}>
                    <div className={styles.node}>
                      <span className={styles.user}>Emily</span>
                      <span className={`${styles.amount} ${styles.negative}`}>Owes Rs. 1000</span>
                    </div>
                    <div className={styles.arrow}><HiOutlineShare /></div>
                    <div className={styles.node}>
                      <span className={styles.user}>Jack</span>
                      <span className={styles.amount}>Gets Rs. 1000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${styles.bentoCard} ${styles.col8}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineClipboardCheck />
                  </div>
                  <h3>Verification Gateway</h3>
                  <p>Every group expense must undergo mutual verification before being factored into your final monthly settlement calculation. Upload secure receipts or proof of payments to maintain absolute transparency, avoiding disputes.</p>
                </div>
                <div className={styles.illustration}>
                  <div className={styles.verificationLog}>
                    <div className={styles.logItem}>
                      <span className={styles.icon}><HiOutlineCheckCircle /></span>
                      <span className={styles.text}><span>Alex</span> verified "Grocery shopping" (Rs. 2400)</span>
                    </div>
                    <div className={styles.logItem}>
                      <span className={styles.icon}><HiOutlineCheckCircle /></span>
                      <span className={styles.text}><span>Emily</span> verified "Grocery shopping" (Rs. 2400)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Analytics */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNum}>MODULE 04</span>
              <h2>Real-time Alerts & Analytics</h2>
              <p>Stay informed about your balance sheets, pending invoices, and active groups immediately.</p>
            </div>

            <div className={styles.bentoGrid}>
              <div className={`${styles.bentoCard} ${styles.col8}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineChartBar />
                  </div>
                  <h3>Actionable Financial Insights</h3>
                  <p>Gain control over your budget with automated breakdowns. Monitor monthly trends, category divisions, and historical summaries. Discover exactly where your money goes to optimize your saving rate effortlessly.</p>
                </div>
              </div>

              <div className={`${styles.bentoCard} ${styles.col4}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineBell />
                  </div>
                  <h3>Instant Notifications</h3>
                  <p>Powered by Firebase Cloud Messaging (FCM), receive direct push alerts whenever a peer invites you to a group, adds a shared expense, approves/rejects split amounts, or requests a settlement.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.ctaWrapper}>
          <section className={styles.ctaSection}>
            <h2>Ready to split smarter?</h2>
            <p>Join thousands of users who trust SyncSplit for their household and personal financial coordination.</p>
            <div className={styles.btnGroup}>
              <Link href="/signup" className={styles.primaryBtn}>
                Get Started Free
              </Link>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
