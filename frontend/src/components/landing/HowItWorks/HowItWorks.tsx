"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FiGitMerge, FiCheckCircle, FiDollarSign } from "react-icons/fi";
import styles from "./HowItWorks.module.scss";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    tag: "Initialization",
    title: "Log your first expense",
    desc: "Simply add what you've spent. Categorize it by lifestyle or group and let the protocol handle the heavy lifting.",
    icon: FiDollarSign,
  },
  {
    tag: "Execution",
    title: "Define the split logic",
    desc: "Choose from equal splits, custom ratios, or fixed amounts. Our engine ensures mathematical accuracy across all participants.",
    icon: FiGitMerge,
  },
  {
    tag: "Verification",
    title: "Settle via Smart Paths",
    desc: "Generate the most efficient settlement routes. Upload proof of payment and get instant confirmation from the group.",
    icon: FiCheckCircle,
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        `.${styles.stepCard}`,
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.9,
          ease: "power3.out",
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="how-it-works" className={styles.howItWorks}>
      <div className={styles.howItWorksInner}>
        <div className={styles.header}>
          <p className={styles.sectionEyebrow}>Process</p>
          <h2 className={styles.sectionTitle}>Engineered for simplicity</h2>
        </div>

        <div className={styles.grid}>
          {steps.map((step, i) => (
            <div key={i} className={styles.stepCard}>
              <div className={styles.stepNumber}>0{i + 1}</div>
              <div className={styles.cardContent}>
                <div className={styles.iconWrapper}>
                  <step.icon />
                </div>
                <span className={styles.stepTag}>{step.tag}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
