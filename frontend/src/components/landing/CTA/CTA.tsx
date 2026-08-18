import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import styles from "./CTA.module.scss";

export default function CTA() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaInner}>
        <div className={styles.ctaCard}>
          <h2 className={styles.title}>
            Ready to refine <br />
            <span>your finances?</span>
          </h2>

          <p className={styles.sub}>
            Join thousands of users who have automated their personal and shared
            economy with mathematical precision.
          </p>

          <div className={styles.buttonGroup}>
            <Link href="/signup" className={styles.btnPrimary}>
              Start for Free <FiArrowRight />
            </Link>
          </div>

          <div className={styles.benefits}>
            <span className={styles.benefitItem}>Deployment: Live</span>
            <span className={styles.benefitItem}>Unlimited groups</span>
            <span className={styles.benefitItem}>Real-time Alerts</span>
            <span className={styles.benefitItem}>Lifetime free tier</span>
          </div>
        </div>
      </div>
    </section>
  );
}
