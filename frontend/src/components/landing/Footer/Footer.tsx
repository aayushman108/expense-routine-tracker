"use client";

import Link from "next/link";
import {
  FiGithub,
  FiMail,
  FiPieChart,
  FiTwitter,
  FiGlobe,
} from "react-icons/fi";
import styles from "./Footer.module.scss";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const offset = 80;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.mainContent}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>
                <FiPieChart />
              </span>
              <span className={styles.logoText}>SyncSplit</span>
            </div>
            <p className={styles.brandDesc}>
              The precision-engineered protocol for shared economy and personal
              expense management. Track, split, and settle with mathematical
              clarity.
            </p>
          </div>

          <div className={styles.navLinks}>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("features");
              }}
            >
              Features
            </a>
            <div className={styles.dot} />
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("how-it-works");
              }}
            >
              How it works
            </a>
            <div className={styles.dot} />
            <a
              href="#use-cases"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("use-cases");
              }}
            >
              Use Cases
            </a>
          </div>

          <div className={styles.social}>
            <a
              href="https://github.com/aayushman108"
              aria-label="Github"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiGithub />
            </a>
            <a href="#" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a
              href="mailto:dev.aayushmansharma@gmail.com"
              aria-label="Mail"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiMail />
            </a>
            <a
              href="https://portfolio.aayushmansharma.com.np"
              aria-label="Web"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiGlobe />
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.legal}>
            {/* <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link> */}
          </div>
          <div className={styles.copyright}>
            <p>© {currentYear} SyncSplit Protocol. All rights reserved.</p>
          </div>
          <div className={styles.status}>
            {/* <div className={styles.statusDot} />
            <span>Systems Operational</span> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
