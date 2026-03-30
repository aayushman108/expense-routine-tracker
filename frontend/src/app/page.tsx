"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineGlobe,
  HiCheckCircle,
} from "react-icons/hi";
import { FiArrowRight } from "react-icons/fi";
import LandingNavbar from "@/components/landing/Navbar";
import Button from "@/components/ui/Button/Button";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./page.module.scss";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: <HiOutlineCurrencyDollar />,
    title: "Smart Splitting",
    desc: "Go beyond equal splits. Use custom ratios, percentages, or fixed amounts for true fairness.",
    large: true,
  },
  {
    icon: <HiOutlineUserGroup />,
    title: "Universal Tracking",
    desc: "Seamlessly switch between personal budgets and group hubs. One app, all your finances.",
    large: false,
  },
  {
    icon: <HiOutlineChartBar />,
    title: "Analytics",
    desc: "Visual breakdowns of your spending.",
    large: false,
  },
  {
    icon: <HiOutlineShieldCheck />,
    title: "Secure Settlements",
    desc: "Settle via credit card, bank transfer, or digital wallets with one tap. Every payment, verified instantly.",
    large: true,
  },
  {
    icon: <HiOutlineLightningBolt />,
    title: "Instant Sync",
    desc: "Real-time updates across all devices.",
    large: false,
  },
  {
    icon: <HiOutlineGlobe />,
    title: "Global Ready",
    desc: "Multi-currency support for all your adventures.",
    large: false,
  },
];

const steps = [
  {
    num: "01",
    title: "Connect & Capture",
    desc: "Record every transaction, from recurring rent to coffee runs, in one unified interface.",
  },
  {
    num: "02",
    title: "Calculate & Compute",
    desc: "Select your split logic—equal, percentage, or itemized—and let our engine handle the rest.",
  },
  {
    num: "03",
    title: "Simplify & Settle",
    desc: "Generate optimized settlement paths and verify payments with digital receipts.",
  },
];



const floatingExpenses = [
  {
    emoji: "🍕",
    name: "Pizza Night",
    amount: "$42.50",
    pos: "left" as const,
  },
  { emoji: "🚕", name: "Uber Ride", amount: "$18.00", pos: "center" as const },
  {
    emoji: "🏠",
    name: "Monthly Rent",
    amount: "$1,200",
    pos: "right" as const,
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const timer = setTimeout(() => {
        // Hero text entrance
        gsap.from(`.${styles.heroInner} > *`, {
          opacity: 0,
          y: 24,
          stagger: 0.12,
          duration: 0.7,
          ease: "power2.out",
        });

        // Floating cards entrance (staggered from different directions)
        gsap.from(`.${styles.floatCard}`, {
          opacity: 0,
          scale: 0.8,
          y: 40,
          stagger: 0.15,
          duration: 0.8,
          delay: 0.8,
          ease: "back.out(1.4)",
        });

        // Floating animation (continuous)
        document.querySelectorAll(`.${styles.floatCard}`).forEach((card, i) => {
          gsap.to(card, {
            y: `random(-12, 12)`,
            x: `random(-8, 8)`,
            rotation: `random(-2, 2)`,
            duration: 3 + i * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.3,
          });
        });

        // Metrics counter
        gsap.from(`.${styles.metricValue}`, {
          scrollTrigger: {
            trigger: `.${styles.metrics}`,
            start: "top 85%",
          },
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.5,
        });

        // Bento grid reveal
        gsap.fromTo(
          `.${styles.bentoItem}`,
          { opacity: 0, y: 30, scale: 0.97 },
          {
            scrollTrigger: {
              trigger: `.${styles.bentoGrid}`,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: "power2.out",
            clearProps: "all",
          },
        );

        // Demo card slide in
        gsap.from(`.${styles.demoCard}`, {
          scrollTrigger: {
            trigger: `.${styles.demo}`,
            start: "top 75%",
          },
          opacity: 0,
          x: 40,
          duration: 0.8,
          ease: "power2.out",
        });

        // Testimonials
        gsap.from(`.${styles.testimonialCard}`, {
          scrollTrigger: {
            trigger: `.${styles.testimonials}`,
            start: "top 80%",
          },
          opacity: 0,
          y: 30,
          stagger: 0.12,
          duration: 0.6,
        });

        // Steps
        gsap.from(`.${styles.step}`, {
          scrollTrigger: {
            trigger: `.${styles.stepsGrid}`,
            start: "top 85%",
          },
          opacity: 0,
          y: 30,
          stagger: 0.2,
          duration: 0.6,
        });

        // CTA
        gsap.from(`.${styles.ctaCard}`, {
          scrollTrigger: {
            trigger: `.${styles.cta}`,
            start: "top 85%",
          },
          opacity: 0,
          scale: 0.96,
          duration: 0.8,
          ease: "power2.out",
        });

        ScrollTrigger.refresh();
      }, 100);

      return () => clearTimeout(timer);
    },
    { scope: containerRef },
  );

  return (
    <main ref={containerRef}>
      <LandingNavbar />

      {/* ━━━ Hero ━━━ */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badge}>✨ Smart Expense Tracking</div>

          <h1 className={styles.heroTitle}>
            The smarter way to
            <br />
            <span className={styles.gradient}>Expensora</span>
          </h1>

          <p className={styles.heroSub}>
            The all-in-one hub for personal budgets and shared costs.
            <br className={styles.brDesktop} />
            Built for roommates, travelers, and teams worldwide.
          </p>

          <div className={styles.heroCTA}>
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Start for Free <FiArrowRight />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" size="lg">
                See How It Works
              </Button>
            </a>
          </div>
        </div>

        {/* Floating expense cards */}
        <div className={styles.heroCards}>
          {floatingExpenses.map((e, i) => (
            <div key={i} className={`${styles.floatCard} ${styles[e.pos]}`}>
              <span className={styles.floatEmoji}>{e.emoji}</span>
              <div className={styles.floatInfo}>
                <span className={styles.floatName}>{e.name}</span>
                <span className={styles.floatAmount}>{e.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━ Features — Bento Grid ━━━ */}
      <section id="features" className={styles.features}>
        <SectionHeader
          label="Features"
          title="Shared finances, decoded and simplified."
          subtitle="Master your group spending with a precision-engineered ecosystem built for clarity, fairness, and zero friction."
        />

        <div className={styles.bentoGrid}>
          {features.map((f, i) => (
            <div
              key={i}
              className={`${styles.bentoItem} ${f.large ? styles.bentoLarge : ""}`}
            >
              <div className={styles.bentoIcon}>{f.icon}</div>
              <h3 className={styles.bentoTitle}>{f.title}</h3>
              <p className={styles.bentoDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━ Live Demo ━━━ */}
      <section className={styles.demo}>
        <div className={styles.demoInner}>
          <div className={styles.demoText}>
            <span className={styles.demoLabel}>Experience Clarity</span>
            <h2 className={styles.demoTitle}>
              Fair splitting,
              <br />
              <span className={styles.gradient}>reimagined.</span>
            </h2>
            <p className={styles.demoSub}>
              From simple dinner splits to complex multi-currency group trips. 
              Expensora handles the math so you can focus on the memories.
            </p>
            <ul className={styles.demoChecks}>
              <li>
                <HiCheckCircle /> Custom split ratios per person
              </li>
              <li>
                <HiCheckCircle /> Automatic net-debt calculation
              </li>
              <li>
                <HiCheckCircle /> One-tap settlement via digital wallets
              </li>
            </ul>
          </div>

          <div className={styles.demoCard}>
            <div className={styles.demoHeader}>
              <span className={styles.demoExpName}>Expensora Flow</span>
              <span className={styles.demoExpTotal}>रू 45,000</span>
            </div>
            <div className={styles.demoFlowWrap}>
              <div className={styles.flowParticipant}>
                <div className={styles.flowAvatar}>A</div>
                <span className={styles.flowName}>Aayushman</span>
                <span className={styles.flowRole}>Debtor</span>
              </div>

              <div className={styles.flowConnector}>
                <div className={styles.flowAmountBadge}>
                  <HiOutlineCurrencyDollar />
                  <span>रू 15,000</span>
                </div>
                <div className={styles.flowArrow} />
              </div>

              <div className={styles.flowParticipant}>
                <div className={`${styles.flowAvatar} ${styles.avatarGreen}`}>
                  S
                </div>
                <span className={styles.flowName}>Shravan</span>
                <span className={styles.flowRole}>Creditor</span>
              </div>
            </div>
            <button className={styles.demoBtn}>
              Settle Balance <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* ━━━ How It Works ━━━ */}
      <section id="how-it-works" className={styles.howItWorks}>
        <SectionHeader
          label="How It Works"
          title="Zero to clarity in three simple steps."
          subtitle="Onboard your entire group in seconds. Expensora handles the mathematical heavy lifting so you never have to."
        />

        <div className={styles.stepsGrid}>
          {steps.map((s, i) => (
            <div key={i} className={styles.step}>
              <span className={styles.stepNum}>{s.num}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>
            &ldquo;We handle the finances —
            <br />
            so you can handle the fun.&rdquo;
          </h2>
          <p className={styles.ctaSub}>
            Join thousands of users simplifying their shared lives with 
            crystal-clear tracking and effortless settlements.
          </p>

          <div className={styles.ctaFeatures}>
            <span className={styles.ctaFeature}>Personal & Group logs.</span>
            <span className={styles.ctaFeature}>Fair splitting, always.</span>
            <span className={styles.ctaFeature}>Instant global settling.</span>
          </div>

          <div className={styles.ctaAction}>
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Get Started &mdash; It&apos;s Free <FiArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ Footer ━━━ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerCopy}>
            © 2026 Expensora. Developed by Aayushman.
          </span>
          <div className={styles.footerLinks}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
