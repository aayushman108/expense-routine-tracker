"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiZap,
  FiTarget,
  FiBell,
} from "react-icons/fi";
import styles from "./Hero.module.scss";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.set(
        [
          `.${styles.badge}`,
          `.${styles.titleLine}`,
          `.${styles.heroTitleGradient}`,
          `.${styles.heroSub}`,
          `.${styles.btnPrimary}`,
          `.${styles.trustRibbon}`,
          `.${styles.featureItem}`,
        ],
        { opacity: 0 },
      );

      const revealItems = gsap.utils.toArray<HTMLElement>(
        `.${styles.badge}, .${styles.titleLine}, .${styles.heroTitleGradient}, .${styles.heroSub}, .${styles.btnPrimary}, .${styles.trustRibbon}, .${styles.featureItem}`,
      );

      const tl = gsap.timeline({ delay: 0.03, paused: true });

      tl.fromTo(
        revealItems,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.11,
          ease: "power2.out",
        },
      );

      const playWhenReady = () => {
        if (document.documentElement.dataset.pageReady === "true") {
          tl.play(0);
        }
      };

      window.addEventListener("syncsplit:page-ready", playWhenReady);
      playWhenReady();

      return () => {
        window.removeEventListener("syncsplit:page-ready", playWhenReady);
        tl.kill();
      };
    },
    { scope: heroRef },
  );

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.gridOverlay} />

      {/* Side Geometric Puzzle Pieces */}
      {/* <div className={`${styles.puzzleSide} ${styles.left}`}>
        <div className={`${styles.shape} ${styles.circle1}`} />
        <div className={`${styles.shape} ${styles.square1}`} />
        <div className={`${styles.shape} ${styles.dots1}`} />
      </div>

      <div className={`${styles.puzzleSide} ${styles.right}`}>
        <div className={`${styles.shape} ${styles.circle2}`} />
        <div className={`${styles.shape} ${styles.square2}`} />
        <div className={`${styles.shape} ${styles.dots2}`} />
      </div> */}

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
