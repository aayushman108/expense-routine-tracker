"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import styles from "./Features.module.scss";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: <HiOutlineCurrencyDollar />,
    title: "Smart Expense Tracking",
    desc: "Capture every transaction instantly — from recurring rent to spontaneous coffee runs. Your financial story, all in one place.",
    wide: false,
    tag: "Core",
  },
  {
    icon: <HiOutlineUserGroup />,
    title: "Custom Bill Splitting",
    desc: "Go beyond equal splits. Use custom ratios, percentages, or fixed amounts for true financial fairness.",
    wide: false,
    tag: "Pro",
  },
  {
    icon: <HiOutlineChartBar />,
    title: "Analytics Dashboard",
    desc: "Visual breakdowns of spending patterns with actionable insights. Know where every rupee goes.",
    wide: false,
    tag: "Stats",
  },
  {
    icon: <HiOutlineShieldCheck />,
    title: "Monthly Settlements",
    desc: "Generate optimized settlement paths that minimize transactions. Verify payments with digital receipts. Every payment, tracked and confirmed.",
    wide: true,
    tag: "Settlements",
  },
  {
    icon: <HiOutlineLightningBolt />,
    title: "Group Management",
    desc: "Create and manage multiple groups with dedicated expense histories, member controls, and role-based permissions.",
    wide: false,
    tag: "Teams",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for card hover glow effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const cards = gridRef.current?.querySelectorAll(`.${styles.card}`);
    cards?.forEach((card) => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
      (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
    });
  }, []);

  useGSAP(
    () => {
      gsap.fromTo(
        `.${styles.card}`,
        { opacity: 0, scale: 0.9, y: 30 },
        {
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="features" className={styles.features}>
      {/* Background puzzle shapes */}
      <div className={styles.shape} />

      <div className={styles.featuresInner}>
        <div className={styles.header}>
          <p className={styles.sectionEyebrow}>Ecosystem</p>
          <h2 className={styles.sectionTitle}>
            Everything you need to <br />
            <span>manage shared finances</span>
          </h2>
          <p className={styles.sectionSub}>
            A precision-engineered platform built for clarity, fairness, and
            zero friction in your financial relationships.
          </p>
        </div>

        <div
          ref={gridRef}
          className={styles.grid}
          onMouseMove={handleMouseMove}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className={`${styles.card} ${f.wide ? styles.cardWide : ""}`}
            >
              <div className={styles.cardGlow} />
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <span>{f.icon}</span>
                </div>
                <span className={styles.cardTag}>{f.tag}</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{f.title}</h3>
                <p className={styles.cardDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
