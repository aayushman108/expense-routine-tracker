"use client";

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
  HiOutlineShare
} from "react-icons/hi";
import styles from "./features.module.scss";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer/Footer";

export default function FeaturesContent() {
  return (
    <div className={styles.featuresPage}>
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
              Track personal spending, manage shared expenses, verify group splits, and settle balances with a clear approval trail.
            </p>
          </div>
        </header>

        {/* Section 1: Core Ledgers */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNum}>MODULE 01</span>
              <h2>Personal Expense Tracking</h2>
              <p>Keep private spending separate from group expenses, so your day-to-day budget never gets mixed with shared settlements.</p>
            </div>

            <div className={styles.bentoGrid}>
              <div className={`${styles.bentoCard} ${styles.col8}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineCash />
                  </div>
                  <h3>Independent Personal Expenses</h3>
                  <p>Add personal expenses for meals, transport, subscriptions, rent, or any private spend. These records belong only to your personal ledger and are never included in group splits or settlement calculations.</p>
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
                  <h3>Installable PWA Access</h3>
                  <p>Create an account with email or Google login and use SyncSplit in the browser or as an installable PWA on desktop and mobile. Your data stays tied to your authenticated profile.</p>
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
              <h2>Groups & Shared Expense Management</h2>
              <p>Create dedicated groups for shared finances, add registered members directly, or invite new people by email when they are not on SyncSplit yet.</p>
            </div>

            <div className={styles.bentoGrid}>
              <div className={`${styles.bentoCard} ${styles.col6}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineUserGroup />
                  </div>
                  <h3>Member-Driven Group Expenses</h3>
                  <p>Every group member can add expenses and assign the people involved in that split. Use equal shares, exact amounts, percentages, or custom shares to match the real agreement.</p>
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
                  <h3>Group Management Workspace</h3>
                  <p>Each group has its own management page for members, expenses, settlements, and settings. Keep roommate bills, trips, office costs, and events organized in separate workspaces.</p>
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
              <h2>Verified Settlements & Payment Proof</h2>
              <p>Only expenses verified by all included members can move into settlement. Payments then follow a clear payer proof and receiver confirmation flow.</p>
            </div>

            <div className={styles.bentoGrid}>
              <div className={`${styles.bentoCard} ${styles.col4}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineShieldCheck />
                  </div>
                  <h3>Debt Minimization</h3>
                  <p>The settlement engine calculates the fewest practical payments needed to clear verified group balances. Unverified expenses stay out of the calculation until every included member approves them.</p>
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
                  <p>Every person included in a group expense must verify it before settlement. When someone owes money, they upload payment proof; the receiver confirms the payment to close the settlement cleanly.</p>
                </div>
                <div className={styles.illustration}>
                  <div className={styles.verificationLog}>
                    <div className={styles.logItem}>
                      <span className={styles.icon}><HiOutlineCheckCircle /></span>
                      <span className={styles.text}><span>Alex</span> verified &quot;Grocery shopping&quot; (Rs. 2400)</span>
                    </div>
                    <div className={styles.logItem}>
                      <span className={styles.icon}><HiOutlineCheckCircle /></span>
                      <span className={styles.text}><span>Emily</span> verified &quot;Grocery shopping&quot; (Rs. 2400)</span>
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
              <h2>Dashboard, Profile & Notifications</h2>
              <p>Stay informed with expense summaries, account controls, payment details, and configurable notification preferences.</p>
            </div>

            <div className={styles.bentoGrid}>
              <div className={`${styles.bentoCard} ${styles.col8}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineChartBar />
                  </div>
                  <h3>Expense Summary Dashboard</h3>
                  <p>Review personal and group spending summaries from a focused dashboard. Track totals, category patterns, group activity, and recent financial movement without digging through raw entries.</p>
                </div>
              </div>

              <div className={`${styles.bentoCard} ${styles.col4}`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <HiOutlineBell />
                  </div>
                  <h3>FCM Notifications & Settings</h3>
                  <p>Firebase Cloud Messaging keeps users updated about invitations, expense verification, settlement activity, and payment confirmations. Profile and settings pages let users update basic details, add payment details, and manage notification preferences.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.ctaWrapper}>
          <section className={styles.ctaSection}>
            <h2>Ready to split smarter?</h2>
            <p>Create your account, track personal expenses, and bring shared payments into one verified workflow.</p>
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
