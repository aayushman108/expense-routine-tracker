"use client";

import { HiOutlineChartPie } from "react-icons/hi";
import styles from "./PageLoader.module.scss";

export default function PageLoader({ isReady = false }: { isReady?: boolean }) {
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
          <p>{isReady ? "Ready" : "Loading"}</p>
        </div>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: isReady ? "100%" : "60%" }}
          />
        </div>
      </div>
    </div>
  );
}
