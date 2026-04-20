import Link from "next/link";
import {
  FiGithub,
  FiMail,
  FiPieChart,
  FiTwitter,
  FiGlobe,
} from "react-icons/fi";
import styles from "./Footer.module.scss";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>
                <FiPieChart />
              </span>
              <span className={styles.logoText}>Expensora</span>
            </div>
            <p className={styles.brandDesc}>
              The precision-engineered protocol for shared economy and personal
              expense management.
            </p>
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
                href="mailto:aayushmansharma1008@gmail.com"
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

          <div className={styles.linksGrid}>
            <div className={styles.column}>
              <h4>Features</h4>
              <Link href="/#features">Group Splitting</Link>
              <Link href="/#features">Personal Ledger</Link>
              <Link href="/#features">Smart Settlement</Link>
              <Link href="/#features">Verified Proof</Link>
            </div>
            <div className={styles.column}>
              <h4>Resources</h4>
              <Link href="/docs">Documentation</Link>
              <Link href="https://github.com/aayushman108">Github</Link>
              <Link href="mailto:aayushmansharma1008@gmail.com">Feedback</Link>
              <Link href="/blog">Finance Blog</Link>
            </div>
            <div className={styles.column}>
              <h4>Legal</h4>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/security">Data Security</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {currentYear} Expensora Protocol. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <span>Status: Operational</span>
            <div className={styles.dot} />
            <span>Built with precision</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
