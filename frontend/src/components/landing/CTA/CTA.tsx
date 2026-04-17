"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FiArrowRight } from "react-icons/fi";
import styles from "./CTA.module.scss";

export default function CTA() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        `.${styles.ctaCard}`,
        { opacity: 0, y: 50 },
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
        }
      );

      // Animate satellites
      gsap.to(`.${styles.satellite}`, {
        y: "random(-20, 20)",
        x: "random(-10, 10)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className={styles.cta}>
      <div className={styles.ctaInner}>
        <div className={styles.ctaCard}>
          {/* 🛰 Satellite Decorations */}
          <div className={`${styles.satellite} ${styles.topRight}`} />
          <div className={`${styles.satellite} ${styles.bottomLeft}`} />
          
          <h2 className={styles.title}>
            Ready to refine <br /> 
            <span>your group finances?</span>
          </h2>
          
          <p className={styles.sub}>
            Join thousands of users who have automated their shared 
            economy with mathematical precision.
          </p>
          
          <Link href="/signup" className={styles.btnPrimary}>
            Start for Free <FiArrowRight />
          </Link>

          <div className={styles.benefits}>
            <span className={styles.benefitItem}>Deployment: Live</span>
            <span className={styles.benefitItem}>Unlimited groups</span>
            <span className={styles.benefitItem}>Lifetime free tier</span>
          </div>
        </div>
      </div>
    </section>
  );
}
