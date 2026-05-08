import Link from "next/link";
import {
  HiOutlineChevronLeft,
  HiOutlineLockClosed,
  HiOutlineServer,
} from "react-icons/hi";
import styles from "../privacy/legal.module.scss";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Security",
  description: "Explore the SyncSplit Security Protocol, including encryption, secure infrastructure, and settlement verification.",
  alternates: {
    canonical: "/security",
  },
};

export default function SecurityPage() {
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
              <HiOutlineLockClosed />
            </div>
            <span>Protocol Security</span>
          </div>
          <h1>Data Security</h1>
          <p>The SyncSplit Security Protocol</p>
        </header>

        <section className={styles.content}>
          <div className={styles.intro}>
            <p>
              Security is not an afterthought for us; it is integrated into
              every layer of the SyncSplit protocol. We use industry-standard
              encryption and security practices to keep your financial data
              safe.
            </p>
          </div>

          <div className={styles.section}>
            <h2>1. Encryption in Transit</h2>
            <p>
              All data transmitted between your browser and our servers is
              encrypted using TLS 1.3 encryption. This ensures that your
              financial records and settlement proofs cannot be intercepted
              during transmission.
            </p>
          </div>

          <div className={styles.section}>
            <h2>2. Secure Cloud Infrastructure</h2>
            <p>
              Our databases and application servers are hosted in secure, tier-4
              data centers with 24/7 monitoring. We use strict firewall rules
              and VPC isolation to prevent unauthorized access.
            </p>
          </div>

          <div className={styles.section}>
            <h2>3. JWT Authentication</h2>
            <p>
              We use industry-standard JSON Web Tokens (JWT) for secure
              authentication. Your credentials are hashed using salt-based
              hashing algorithms before being stored, ensuring that even in the
              unlikely event of a breach, your password remains protected.
            </p>
          </div>

          <div className={styles.section}>
            <h2>4. Settlement Verification</h2>
            <p>
              To prevent fraudulent marking of settlements, we implement an
              &ldquo;Image Proof&rdquo; protocol where creditors can require debtors to
              upload transaction receipts for verification before a debt is
              cleared from the ledger.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
