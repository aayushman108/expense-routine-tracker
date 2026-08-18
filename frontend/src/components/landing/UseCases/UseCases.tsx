import { FiUser, FiHome, FiMap } from "react-icons/fi";
import styles from "./UseCases.module.scss";

const cases = [
  {
    icon: FiUser,
    iconColor: "var(--color-primary)",
    iconBg: "var(--color-primary-50)",
    title: "Individuals",
    desc: "Gain complete visibility into your personal cash flow. Track your daily spending and manage your budgets effortlessly.",
    tag: "Personal",
  },
  {
    icon: FiHome,
    iconColor: "var(--color-success)",
    iconBg: "rgba(34, 197, 94, 0.1)",
    title: "Roommates",
    desc: "Simplify rent, utilities, and grocery runs. No more awkward conversations about who owes what at the end of the month.",
    tag: "Household",
  },
  {
    icon: FiMap,
    iconColor: "var(--color-warning)",
    iconBg: "rgba(245, 158, 11, 0.1)",
    title: "Travelers",
    desc: "Track every booking, meal, and activity across multiple currencies. Settle the entire trip with one click when you land.",
    tag: "Adventure",
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className={styles.useCases}>
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
              <div
                className={styles.cardIcon}
                style={{ color: c.iconColor, background: c.iconBg }}
              >
                <c.icon />
              </div>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardDesc}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
