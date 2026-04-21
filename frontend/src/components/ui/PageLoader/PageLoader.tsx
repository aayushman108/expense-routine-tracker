"use client";

import { useEffect, useState } from "react";
import { HiOutlineChartPie } from "react-icons/hi";
import styles from "./PageLoader.module.scss";

export default function PageLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startProgress = () => {
      setTimeout(() => setProgress(30), 100);

      const intervals = [
        { time: 500, val: 55 },
        { time: 1000, val: 78 },
        { time: 1500, val: 92 },
        { time: 2000, val: 100 },
      ];

      intervals.forEach(({ time, val }) => {
        setTimeout(() => setProgress(val), time);
      });
    };

    startProgress();
  }, []);

  return (
    <div className={styles.preloader}>
      <div className={styles.loaderContent}>
        <div className={styles.logoWrapper}>
          <HiOutlineChartPie />
        </div>

        <div className={styles.brand}>
          <h1>
            Expen<span>sora</span>
          </h1>
          <p>Analyzing Finances</p>
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
