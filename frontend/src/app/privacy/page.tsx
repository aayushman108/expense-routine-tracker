import Link from "next/link";
import {
  HiOutlineChevronLeft,
  HiOutlineShieldCheck,
  HiOutlineEye,
} from "react-icons/hi";
import styles from "./legal.module.scss";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer/Footer";

export default function PrivacyPage() {
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
              <HiOutlineEye />
            </div>
            <span>Trust & Safety</span>
          </div>
          <h1>Privacy Policy</h1>
          <p>Last Updated: April 20, 2026</p>
        </header>

        <section className={styles.content}>
          <div className={styles.intro}>
            <p>
              At Expensora, we prioritize your privacy and the security of your
              financial data. This Privacy Policy outlines how we collect, use,
              and protect your information when you use our platform.
            </p>
          </div>

          <div className={styles.section}>
            <h2>1. Information We Collect</h2>
            <p>
              To provide our expense tracking services, we collect various types
              of information:
            </p>
            <ul>
              <li>
                <strong>Account Information</strong>
                Email address, name, and profile details when you sign up.
              </li>
              <li>
                <strong>Financial Data</strong>
                Expense amounts, descriptions, group names, and settlement
                records.
              </li>
              <li>
                <strong>Payment Proofs</strong>
                Images or documents you upload as proof of settlement.
              </li>
              <li>
                <strong>Usage Data</strong>
                Information about how you interact with our application.
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>2. How We Use Your Information</h2>
            <p>
              We use your information solely to provide and improve the
              Expensora protocol:
            </p>
            <ul>
              <li>To facilitate expense splitting and group management.</li>
              <li>To notify you of pending settlements or new expenses.</li>
              <li>To verify settlements through uploaded proof images.</li>
              <li>
                To provide technical support and ensure platform security.
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>3. Data Sharing</h2>
            <p>
              We do not sell your personal or financial data. Information is
              shared only with members of the specific groups you join within
              the application. We may use third-party infrastructure providers
              (like database and hosting services) to operate the platform
              securely.
            </p>
          </div>

          <div className={styles.section}>
            <h2>4. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your information
              at any time. If you wish to delete your account and all associated
              expense history, you can do so from your profile settings.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
