"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./UseCases.module.scss";

gsap.registerPlugin(ScrollTrigger);

const cases = [
  {
    icon: "👤",
    title: "Individuals",
    desc: "Gain complete visibility into your personal cash flow. Track your daily spending and manage your budgets effortlessly.",
    tag: "Personal",
  },
  {
    icon: "🏠",
    title: "Roommates",
    desc: "Simplify rent, utilities, and grocery runs. No more awkward conversations about who owes what at the end of the month.",
    tag: "Household",
  },
  {
    icon: "✈️",
    title: "Travelers",
    desc: "Track every booking, meal, and activity across multiple currencies. Settle the entire trip with one click when you land.",
    tag: "Adventure",
  },
  // {
  //   icon: "👥",
  //   title: "Project Teams",
  //   desc: "Manage shared subscription costs, software licenses, and collaborative expenses with detailed audit logs.",
  //   tag: "Productivity",
  // },
];

export default function UseCases() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        `.${styles.card}`,
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "back.out(1.2)",
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="use-cases" className={styles.useCases}>
      <div className={styles.gridOverlay} />

      <div className={styles.useCasesInner}>
        <div className={styles.header}>
          <p className={styles.sectionEyebrow}>Scenarios</p>
          <h2 className={styles.sectionTitle}>
            Designed for every way <br />
            you spend and share.
          </h2>
        </div>

        <div className={styles.grid}>
          {cases.map((c, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardIcon}>{c.icon}</div>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardDesc}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
