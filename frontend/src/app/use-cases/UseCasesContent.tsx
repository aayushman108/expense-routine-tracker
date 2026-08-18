"use client";

import Link from "next/link";
import { 
  HiOutlineChevronLeft, 
  HiOutlineStar
} from "react-icons/hi2";
import styles from "./use-cases.module.scss";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer/Footer";

export default function UseCasesContent() {
  return (
    <div className={styles.useCasesPage}>
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
                <HiOutlineStar />
              </div>
              <span>Real World Scenarios</span>
            </div>
            <h1>SyncSplit <span>Use Cases</span></h1>
            <p>
              Designed for private budgeting and shared spending workflows where every group settlement needs clear verification, payment proof, and receiver confirmation.
            </p>
          </div>
        </header>

        {/* Use Cases Scenarios */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.scenariosGrid}>
              
              {/* Scenario 1: Roommates */}
              <div className={styles.scenarioBlock}>
                <div className={styles.blockContent}>
                  <span className={styles.categoryBadge}>Co-Living</span>
                  <h2><span>🏠</span>Roommates & Shared Flats</h2>
                  <p>
                    Keep rent, utilities, wifi, cleaning supplies, and groceries in one roommate group. Any member can add a bill, included roommates verify it, and only approved expenses become part of settlement.
                  </p>
                  <div className={styles.featureChips}>
                    <span>🔒 Member Verification</span>
                    <span>📈 Household Summaries</span>
                    <span>💬 Equal or Custom Splits</span>
                  </div>
                </div>
                <div className={styles.blockVisual}>
                  <div className={styles.mockupItem}>
                    <div className={styles.left}>
                      <strong>Wifi Subscription (June)</strong>
                      <span>Added by Alex • Split Equally</span>
                    </div>
                    <div className={styles.right}>Rs. 1500</div>
                  </div>
                  <div className={styles.mockupItem}>
                    <div className={styles.left}>
                      <strong>Organic Eggs & Milk</strong>
                      <span>Added by Emily • Split equally</span>
                    </div>
                    <div className={styles.right}>Rs. 450</div>
                  </div>
                </div>
              </div>

              {/* Scenario 2: Travelers */}
              <div className={styles.scenarioBlock}>
                <div className={styles.blockContent}>
                  <span className={styles.categoryBadge}>Adventure</span>
                  <h2><span>✈️</span>Travelers & Group Trips</h2>
                  <p>
                    Create a trip group for hotels, tickets, meals, fuel, and shared activities. Add registered friends directly, invite new travelers by email, and settle verified trip costs at the end.
                  </p>
                  <div className={styles.featureChips}>
                    <span>📧 Email Invites</span>
                    <span>📁 Trip Groups</span>
                    <span>⚡ Verified Settlement</span>
                  </div>
                </div>
                <div className={styles.blockVisual}>
                  <div className={styles.multiCurrencyGrid}>
                    <div className={styles.currencyCard}>
                      <span className={styles.label}>Hotel Deposit</span>
                      <span className={styles.amount}>Rs. 16,000</span>
                      <span className={styles.converted}>Split across 6 friends</span>
                    </div>
                    <div className={styles.currencyCard}>
                      <span className={styles.label}>Fuel & Snacks</span>
                      <span className={styles.amount}>Rs. 12,200</span>
                      <span className={styles.converted}>Logged in NPR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario 3: Couples */}
              <div className={styles.scenarioBlock}>
                <div className={styles.blockContent}>
                  <span className={styles.categoryBadge}>Relationships</span>
                  <h2><span>💖</span>Couples & Co-Living</h2>
                  <p>
                    Track shared dinners, subscriptions, household furniture, rent contributions, and weekend plans while keeping personal expenses separate. Use custom split ratios when both people do not contribute equally.
                  </p>
                  <div className={styles.featureChips}>
                    <span>📊 Custom Ratios</span>
                    <span>📈 Shared Summaries</span>
                    <span>🛡️ Private Logs</span>
                  </div>
                </div>
                <div className={styles.blockVisual}>
                  <div className={styles.mockupItem}>
                    <div className={styles.left}>
                      <strong>Romantic Dinner Date</strong>
                      <span>Split 60% (You) / 40% (Emily)</span>
                    </div>
                    <div className={styles.right}>Rs. 3200</div>
                  </div>
                  <div className={styles.mockupItem}>
                    <div className={styles.left}>
                      <strong>Streaming Subscription</strong>
                      <span>Split 50% / 50%</span>
                    </div>
                    <div className={styles.right}>Rs. 250</div>
                  </div>
                </div>
              </div>

              {/* Scenario 4: Project Teams */}
              <div className={styles.scenarioBlock}>
                <div className={styles.blockContent}>
                  <span className={styles.categoryBadge}>Productivity</span>
                  <h2><span>💻</span>Project Teams & Coworking</h2>
                  <p>
                    Track shared software, coworking bookings, cloud hosting, team lunches, and project purchases. Group management keeps members, expenses, verification status, and settlements visible to the team.
                  </p>
                  <div className={styles.featureChips}>
                    <span>📁 SaaS Splits</span>
                    <span>🧾 Payment Proof</span>
                    <span>📊 Group Management</span>
                  </div>
                </div>
                <div className={styles.blockVisual}>
                  <div className={styles.mockupItem}>
                    <div className={styles.left}>
                      <strong>Cloud Server Hosting</strong>
                      <span>Shared among 4 developers</span>
                    </div>
                    <div className={styles.right}>Rs. 4800</div>
                  </div>
                  <div className={styles.mockupItem}>
                    <div className={styles.left}>
                      <strong>Premium UX Design Template</strong>
                      <span>Shared among 3 designers</span>
                    </div>
                    <div className={styles.right}>Rs. 2400</div>
                  </div>
                </div>
              </div>

              {/* Scenario 5: Event Organizers */}
              <div className={styles.scenarioBlock}>
                <div className={styles.blockContent}>
                  <span className={styles.categoryBadge}>Events</span>
                  <h2><span>🎉</span>Party & Event Organizers</h2>
                  <p>
                    Manage birthdays, dinners, group gifts, and small events without chasing spreadsheets. Organizers can add costs, participants can verify their shares, and payers can upload proof when settling.
                  </p>
                  <div className={styles.featureChips}>
                    <span>🎁 Gift Pools</span>
                    <span>🎤 Event Budgets</span>
                    <span>💸 Proof Confirmation</span>
                  </div>
                </div>
                <div className={styles.blockVisual}>
                  <div className={styles.mockupItem}>
                    <div className={styles.left}>
                      <strong>Sound Equipment Rental</strong>
                      <span>Added by Jack</span>
                    </div>
                    <div className={styles.right}>Rs. 8000</div>
                  </div>
                  <div className={styles.mockupItem}>
                    <div className={styles.left}>
                      <strong>Catering & Beverage Bar</strong>
                      <span>Added by Emily</span>
                    </div>
                    <div className={styles.right}>Rs. 15000</div>
                  </div>
                </div>
              </div>

              {/* Scenario 6: Personal Budgeting */}
              <div className={styles.scenarioBlock}>
                <div className={styles.blockContent}>
                  <span className={styles.categoryBadge}>Personal Finance</span>
                  <h2><span>📊</span>Individual Expense Tracking</h2>
                  <p>
                    Use SyncSplit as a private expense tracker even when no group is involved. Log personal spends, review dashboard summaries, update profile details, and keep payment information ready for future groups.
                  </p>
                  <div className={styles.featureChips}>
                    <span>🧾 Personal Ledger</span>
                    <span>📈 Spending Dashboard</span>
                    <span>⚙️ Profile & Settings</span>
                  </div>
                </div>
                <div className={styles.blockVisual}>
                  <div className={styles.mockupItem}>
                    <div className={styles.left}>
                      <strong>Monthly Groceries</strong>
                      <span>Personal expense • Not part of any group</span>
                    </div>
                    <div className={styles.right}>Rs. 6200</div>
                  </div>
                  <div className={styles.mockupItem}>
                    <div className={styles.left}>
                      <strong>Notification Preferences</strong>
                      <span>Manage FCM alerts from settings</span>
                    </div>
                    <div className={styles.right}>On</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <div className={styles.ctaWrapper}>
          <section className={styles.ctaSection}>
            <h2>Ready to split smarter?</h2>
            <p>Start with personal tracking, then create groups whenever shared expenses need verification and settlement.</p>
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
