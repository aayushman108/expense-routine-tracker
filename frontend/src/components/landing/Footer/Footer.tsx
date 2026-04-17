import Link from "next/link";
import { FiGithub, FiMail, FiPieChart, FiTwitter, FiGlobe } from "react-icons/fi";
import styles from "./Footer.module.scss";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}><FiPieChart /></span>
              <span className={styles.logoText}>Expensora</span>
            </div>
            <p className={styles.brandDesc}>
              The precision-engineered protocol for shared economy and 
              personal expense management.
            </p>
            <div className={styles.social}>
              <a href="#" aria-label="Github"><FiGithub /></a>
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="Mail"><FiMail /></a>
              <a href="#" aria-label="Web"><FiGlobe /></a>
            </div>
          </div>

          <div className={styles.linksGrid} >
            <div className={styles.column}>
              <h4>Product</h4>
              <Link href="#features">Features</Link>
              <Link href="#integrations">Integrations</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="/changelog">Changelog</Link>
            </div>
            <div className={styles.column}>
              <h4>Company</h4>
              <Link href="/about">About Us</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/careers">Careers</Link>
              <Link href="/contact">Contact</Link>
            </div>
            <div className={styles.column}>
              <h4>Legal</h4>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/security">Security</Link>
              <Link href="/cookies">Cookie Policy</Link>
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
