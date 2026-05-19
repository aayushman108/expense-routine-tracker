"use client";

import { useEffect, useState } from "react";
import { HiOutlineChartPie } from "react-icons/hi";
import styles from "./PageLoader.module.scss";

export default function PageLoader({ isReady = false }: { isReady?: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isReady) {
      setProgress(100);
      return;
    }

    let frame: number;
    let active = true;

    const tick = () => {
      setProgress((current) => {
        if (current < 28) return current + 8;
        if (current < 62) return current + 3;
        if (current < 88) return current + 1;
        return current;
      });

      if (active) {
        frame = window.setTimeout(tick, 180);
      }
    };

    tick();

    return () => {
      active = false;
      window.clearTimeout(frame);
    };
  }, [isReady]);

  return (
    <div className={`${styles.preloader} ${isReady ? styles.ready : ""}`}>
      <div className={styles.loaderContent}>
        <div className={styles.logoWrapper}>
          <HiOutlineChartPie />
        </div>

        <div className={styles.brand}>
          <h1>
            Sync<span>Split</span>
          </h1>
          <p>{isReady ? "Page Ready" : "Loading Page"}</p>
        </div>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
