import Image from "next/image";
import styles from "./AppPreview.module.scss";

export default function AppPreview() {
  return (
    <section id="app-preview" className={styles.appPreview}>
      <div className={styles.appPreviewInner}>
        <div className={styles.header}>
          <p className={styles.sectionEyebrow}>Preview</p>
          <h2 className={styles.sectionTitle}>Built for clarity</h2>
        </div>

        <div className={styles.mockContainer}>
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
