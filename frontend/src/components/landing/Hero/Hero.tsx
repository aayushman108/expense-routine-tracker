import Link from "next/link";
import {
  FiArrowRight,
  FiCheckCircle,
  FiZap,
  FiTarget,
  FiBell,
} from "react-icons/fi";
import styles from "./Hero.module.scss";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.badge}>
          <span className={styles.badgeText}>Update</span>
          Push Notifications are live! Stay updated on every split 🔔
        </div>

        <h1 className={styles.heroTitle}>
          <span className={styles.titleLine}>Master your</span>
          <span className={styles.heroTitleGradient}>
            Personal & Shared Finances
          </span>
        </h1>

        <p className={styles.heroSub}>
          The smarter way to track your personal spending, group expenses, and
          split bills with precision. Perfect for individuals, roommates,
          travelers, and anyone sharing costs.
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/signup" className={styles.btnPrimary}>
            Get Started for Free <FiArrowRight />
          </Link>

          <div className={styles.trustRibbon}>
            <div className={styles.avatars}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.avatarCircle} />
              ))}
            </div>
            <span className={styles.trustText}>
              Joined by many cost-sharers
            </span>
          </div>
        </div>

        <div className={styles.featureHighlights}>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>
              <FiZap />
            </span>
            <div className={styles.featureText}>
              <strong>Instant Split</strong>
              <span>Equal or custom ratios</span>
            </div>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>
              <FiTarget />
            </span>
            <div className={styles.featureText}>
              <strong>Smart Settle</strong>
              <span>Optimized payment paths</span>
            </div>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>
              <FiBell />
            </span>
            <div className={styles.featureText}>
              <strong>Real-time Alerts</strong>
              <span>Push notifications live</span>
            </div>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>
              <FiCheckCircle />
            </span>
            <div className={styles.featureText}>
              <strong>Verified</strong>
              <span>Proof for every payment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
