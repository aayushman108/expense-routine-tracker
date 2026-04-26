import Link from "next/link";
import { HiOutlineChevronLeft, HiOutlineDocumentText } from "react-icons/hi";
import styles from "../privacy/legal.module.scss";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer/Footer";

export default function TermsPage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.gridOverlay} />
      <div className={`${styles.blob} ${styles.primary}`} />
      <div className={`${styles.blob} ${styles.secondary}`} />

      <Navbar />

      <main className={styles.container}>
        <Link href="/" className={styles.backLink}>
          <HiOutlineChevronLeft /> Back to Home
        </Link>

        <header className={styles.header}>
          <div className={styles.badge}>
            <div className={styles.icon}>
              <HiOutlineDocumentText />
            </div>
            <span>User Agreement</span>
          </div>
          <h1>Terms of Service</h1>
          <p>Last Updated: April 20, 2026</p>
        </header>

        <section className={styles.content}>
          <div className={styles.intro}>
            <p>
              By using Expensora, you agree to comply with and be bound by the
              following terms and conditions. Please review them carefully
              before using our services.
            </p>
          </div>

          <div className={styles.section}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              Expensora provides a cloud-based expense management platform. By
              creating an account or using the service, you agree to these
              terms. If you do not agree, you may not use the service.
            </p>
          </div>

          <div className={styles.section}>
            <h2>2. User Content & Expenses</h2>
            <p>
              You are solely responsible for the accuracy of the expenses,
              splitting ratios, and settlement proofs you upload. Expensora acts
              as a protocol for tracking and is not responsible for disputes
              between users.
            </p>
          </div>

          <div className={styles.section}>
            <h2>3. Responsible Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>
                <strong>Fraudulent Activity</strong>
                Upload fake settlement proofs or transaction records.
              </li>
              <li>
                <strong>Illegal Use</strong>
                Use the platform for money laundering or unauthorized financial
                activity.
              </li>
              <li>
                <strong>Data Interference</strong>
                Attempt to gain unauthorized access to other users&apos; private
                group data.
              </li>
              <li>
                <strong>Community Standards</strong>
                Spam or harass other members of your groups.
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>4. Termination of Service</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these terms or engage in fraudulent activity that compromises the
              integrity of the Expensora protocol.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
