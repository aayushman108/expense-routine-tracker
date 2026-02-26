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
import { FiArrowRight, FiStar } from "react-icons/fi";
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
    title: "Log anything",
    desc: "Track daily coffee, monthly rent, or shared trips in one clean interface.",
  },
  {
    num: "02",
    title: "Split with ease",
    desc: "Create groups for shared costs and let us handle the complex math.",
  },
  {
    num: "03",
    title: "Settle monthly",
    desc: "We calculate the simplest way to settle. Pay with your preferred method.",
  },
];

const testimonials = [
  {
    quote:
      "Finally, an expense tracker that actually understands how groups split bills. The settlement process is seamless.",
    name: "Alex Thompson",
    role: "Travel Enthusiast",
  },
  {
    quote:
      "The monthly settlement feature saved our friend group from so many awkward conversations.",
    name: "Priya Adhikari",
    role: "Travel Group Leader",
  },
  {
    quote:
      "Simple, clean, and does exactly what it promises. I use it for every trip now.",
    name: "Rohan Thapa",
    role: "Freelancer",
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
            <span className={styles.gradient}>split expenses</span>
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
          title="Everything you need, nothing you don't"
          subtitle="A thoughtful set of tools designed to make shared finances simple."
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
            <span className={styles.demoLabel}>See it in action</span>
            <h2 className={styles.demoTitle}>
              Fair splitting,
              <br />
              <span className={styles.gradient}>visualized</span>
            </h2>
            <p className={styles.demoSub}>
              Add an expense, choose how to split, and everyone sees their share
              in real time. Settling up is just one tap away.
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
              <span className={styles.demoExpName}>Weekend Trip — Beach</span>
              <span className={styles.demoExpTotal}>$450.00</span>
            </div>
            <div className={styles.demoDivider}>
              <span>Split 3 ways</span>
            </div>
            <div className={styles.demoSplits}>
              <div className={styles.splitRow}>
                <div className={styles.avatar}>A</div>
                <div className={styles.splitInfo}>
                  <span className={styles.splitName}>Aayushman</span>
                  <span className={styles.splitTag}>Paid $450.00</span>
                </div>
                <span className={styles.splitVal} data-type="positive">
                  +$300.00
                </span>
              </div>
              <div className={styles.splitRow}>
                <div className={`${styles.avatar} ${styles.avatarGreen}`}>
                  S
                </div>
                <div className={styles.splitInfo}>
                  <span className={styles.splitName}>Shravan</span>
                  <span className={styles.splitMeta}>Owes</span>
                </div>
                <span className={styles.splitVal} data-type="negative">
                  -$150.00
                </span>
              </div>
              <div className={styles.splitRow}>
                <div className={`${styles.avatar} ${styles.avatarAmber}`}>
                  N
                </div>
                <div className={styles.splitInfo}>
                  <span className={styles.splitName}>Nikita</span>
                  <span className={styles.splitMeta}>Owes</span>
                </div>
                <span className={styles.splitVal} data-type="negative">
                  -$150.00
                </span>
              </div>
            </div>
            <button className={styles.demoBtn}>
              Settle Up <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* ━━━ How It Works ━━━ */}
      <section id="how-it-works" className={styles.howItWorks}>
        <SectionHeader
          label="How It Works"
          title="Up and running in minutes"
          subtitle="No complicated setup. Three steps to financial clarity."
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
            &ldquo;We track your group expenses &mdash;
            <br />
            so you stay friends forever.&rdquo;
          </h2>
          <p className={styles.ctaSub}>
            Simplify your personal budget and shared finances. Keep your
            friendships stress-free with expert splitting and instant
            settlements.
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
            © 2026 SplitWise. Developed by Aayushman.
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
