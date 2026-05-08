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
      {/* Background decoration */}
      <div className={styles.backgroundGlow} />
      <div className={styles.gridOverlay} />
      <div className={styles.watermark}>SYNCSPLIT</div>

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
            <Link href="/#features">Features</Link>
            <div className={styles.dot} />
            <Link href="/#how-it-works">How it works</Link>
            <div className={styles.dot} />
            <Link href="/#use-cases">Use Cases</Link>
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

        <div className={styles.bottom}>
          <div className={styles.legal}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <div className={styles.copyright}>
            <p>© {currentYear} SyncSplit Protocol. All rights reserved.</p>
          </div>
          <div className={styles.status}>
            <div className={styles.statusDot} />
            <span>Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
