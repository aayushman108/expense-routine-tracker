"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FiArrowRight, FiCheckCircle, FiZap, FiTarget } from "react-icons/fi";
import styles from "./Hero.module.scss";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0.2 });

      // Animate geometric shapes
      tl.fromTo(
        `.${styles.shape}`,
        { opacity: 0, scale: 0.5, rotate: -10 },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          stagger: 0.1,
          duration: 1.5,
          ease: "expo.out",
        },
      );

      // Animate content items
      tl.fromTo(
        [
          `.${styles.badge}`,
          `.${styles.heroTitle}`,
          `.${styles.heroSub}`,
          `.${styles.ctaGroup}`,
          `.${styles.trustRibbon}`,
          `.${styles.featureHighlights}`,
        ],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=1",
      );

      // Subtle float for shapes
      gsap.to(`.${styles.shape}`, {
        y: "random(-20, 20)",
        duration: "random(4, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: heroRef },
  );

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.gridOverlay} />

      {/* Side Geometric Puzzle Pieces */}
      <div className={`${styles.puzzleSide} ${styles.left}`}>
        <div className={`${styles.shape} ${styles.circle1}`} />
        <div className={`${styles.shape} ${styles.square1}`} />
        <div className={`${styles.shape} ${styles.dots1}`} />
      </div>

      <div className={`${styles.puzzleSide} ${styles.right}`}>
        <div className={`${styles.shape} ${styles.circle2}`} />
        <div className={`${styles.shape} ${styles.square2}`} />
        <div className={`${styles.shape} ${styles.dots2}`} />
      </div>

      <div className={styles.heroInner}>
        <div className={styles.badge}>
          <span className={styles.badgeText}>New</span>
          Smart monthly settlements are now live!
        </div>

        <h1 className={styles.heroTitle}>
          Master your <br />
          <span className={styles.heroTitleGradient}>Shared Finances</span>
        </h1>

        <p className={styles.heroSub}>
          The smarter way to track group expenses, split bills with precision,
          and settle up effortlessly. Perfect for roommates, travelers, and
          anyone sharing costs.
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
