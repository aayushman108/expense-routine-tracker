"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./AppPreview.module.scss";

gsap.registerPlugin(ScrollTrigger);

export default function AppPreview() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Window Entrance
      gsap.fromTo(
        `.${styles.mockWindow}`,
        { opacity: 0, y: 100, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.2,
          ease: "expo.out",
        }
      );

      // Bar and list item Entrance
      gsap.fromTo(
        [`.${styles.expenseItem}`, `.${styles.barFill}`],
        { opacity: 0, x: -20 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
          opacity: 1,
          x: 0,
          stagger: 0.05,
          duration: 1,
          ease: "power2.out",
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="app-preview" className={styles.appPreview}>
      <div className={styles.appPreviewInner}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>Built for clarity</h2>
        </div>

        <div className={styles.mockContainer}>
          <div className={styles.glow} />
          <div className={styles.mockWindow}>
            <div className={styles.windowHeader}>
              <div className={`${styles.dot} ${styles.red}`} />
              <div className={`${styles.dot} ${styles.yellow}`} />
              <div className={`${styles.dot} ${styles.green}`} />
            </div>

            <div className={styles.mockContent}>
              <aside className={styles.sidebar}>
                <div className={styles.fakeNav}>
                  <div className={`${styles.navItem} ${styles.active}`} />
                  <div className={styles.navItem} />
                  <div className={styles.navItem} />
                  <div className={styles.navItem} />
                </div>
              </aside>

              <main className={styles.mainArea}>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Spent</span>
                    <span className={styles.statValue}>$2,450</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Monthly Avg</span>
                    <span className={styles.statValue}>$840</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Settled</span>
                    <span className={styles.statValue}>98%</span>
                  </div>
                </div>

                <div className={styles.barChart}>
                  {[70, 40, 90, 60, 80, 50, 85].map((h, i) => (
                    <div key={i} className={styles.bar}>
                      <div 
                        className={styles.barFill} 
                        style={{ height: `${h}%` }} 
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.listArea}>
                  <h4 className={styles.listHeader}>Recent Activity</h4>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={styles.expenseItem}>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemIcon} />
                        <div className={styles.itemText} />
                      </div>
                      <div className={styles.itemAmount} />
                    </div>
                  ))}
                </div>

                <div className={styles.distributionArea}>
                  <h4 className={styles.listHeader}>Split Distribution</h4>
                  <div className={styles.distTable}>
                    {["Aayushman", "Ritesh", "Shravan", "Rajesh"].map((name, i) => (
                      <div key={i} className={styles.distRow}>
                        <span className={styles.distName}>{name}</span>
                        <span className={styles.distValue}>{75 - i * 10}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
