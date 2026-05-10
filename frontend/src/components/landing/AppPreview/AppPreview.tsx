"use client";

import { useRef } from "react";
import Image from "next/image";
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
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="app-preview" className={styles.appPreview}>
      <div className={styles.appPreviewInner}>
        <div className={styles.header}>
          <p className={styles.sectionEyebrow}>Preview</p>
          <h2 className={styles.sectionTitle}>Built for clarity</h2>
        </div>

        <div className={styles.mockContainer}>
          <div className={styles.glow} />
          <div className={styles.mockWindow}>
            <Image
              src="/dashboard.png"
              alt="SyncSplit Dashboard Preview"
              width={1200}
              height={800}
              className={styles.previewImage}
              quality={100}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
