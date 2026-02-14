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
    desc: "Split expenses with custom ratios. No more equal splits when fairness matters.",
  },
  {
    icon: <HiOutlineUserGroup />,
    title: "Group Management",
    desc: "Create groups for trips, roommates, or projects. Track who owes whom effortlessly.",
  },
  {
    icon: <HiOutlineChartBar />,
    title: "Visual Analytics",
    desc: "Beautiful charts showing spending patterns, category breakdowns, and trends.",
  },
  {
    icon: <HiOutlineShieldCheck />,
    title: "Secure Payments",
    desc: "Integrated with Khalti, eSewa, and bank transfers for seamless settlements.",
  },
  {
    icon: <HiOutlineLightningBolt />,
    title: "Instant Settlements",
    desc: "Monthly auto-calculated settlements. Know exactly who pays whom and how much.",
  },
  {
    icon: <HiOutlineGlobe />,
    title: "Multi-Currency",
    desc: "Support for NPR and multiple currencies. Perfect for international groups.",
  },
];

const steps = [
  {
    num: "1",
    title: "Create a Group",
    desc: "Set up a group and invite friends, roommates, or colleagues.",
  },
  {
    num: "2",
    title: "Add Expenses",
    desc: "Log expenses and split them fairly with custom ratios.",
  },
  {
    num: "3",
    title: "Settle Up",
    desc: "View monthly settlements and pay with your preferred method.",
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Small delay to ensure DOM is fully ready and measured
      const timer = setTimeout(() => {
        // Hero animations
        gsap.from(`.${styles.badge}`, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: 0.2,
        });
        gsap.from(`.${styles.heroTitle}`, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: 0.4,
        });
        gsap.from(`.${styles.heroSubtitle}`, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: 0.6,
        });
        gsap.from(`.${styles.heroCTA}`, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: 0.8,
        });
        gsap.from(`.${styles.heroVisual}`, {
          opacity: 0,
          y: 60,
          scale: 0.95,
          duration: 1,
          delay: 1,
          ease: "power3.out",
        });

        // Floating orbs animation
        gsap.to(`.${styles.orb}`, {
          y: "random(-30, 30)",
          x: "random(-20, 20)",
          duration: "random(3, 5)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.5,
        });

        // Feature cards - use clear fromTo to ensure visibility
        gsap.fromTo(
          `.${styles.featureCard}`,
          {
            opacity: 0,
            y: 40,
          },
          {
            scrollTrigger: {
              trigger: `.${styles.featureGrid}`,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: "power2.out",
            clearProps: "all",
          },
        );

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
          scale: 0.95,
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

      {/* Hero */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.floatingOrbs}>
          <div className={styles.orb} />
          <div className={styles.orb} />
          <div className={styles.orb} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badge}>✨ Smart Expense Tracking</div>

          <h1 className={styles.heroTitle}>
            Split expenses <span className={styles.gradient}>effortlessly</span>{" "}
            with your group
          </h1>

          <p className={styles.heroSubtitle}>
            Track personal and group expenses, settle debts monthly, and never
            lose track of who owes whom. Built for roommates, trips, and teams.
          </p>

          <div className={styles.heroCTA}>
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Start for Free <FiArrowRight />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" size="lg">
                See Features
              </Button>
            </a>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.mockup}>
              <div className={styles.mockupGrid}>
                <div className={styles.mockupCard}>
                  <span className={styles.mockupLabel}>Total Spent</span>
                  <span className={styles.mockupValue}>रू 42,580</span>
                  <div className={styles.mockupBar} />
                </div>
                <div className={styles.mockupCard}>
                  <span className={styles.mockupLabel}>You Owe</span>
                  <span className={styles.mockupValue}>रू 8,200</span>
                  <div className={styles.mockupBar} />
                </div>
                <div className={styles.mockupCard}>
                  <span className={styles.mockupLabel}>Owed to You</span>
                  <span className={styles.mockupValue}>रू 15,400</span>
                  <div className={styles.mockupBar} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} id="features" className={styles.features}>
        <SectionHeader
          label="Features"
          title="Everything you need to manage expenses"
          subtitle="From personal tracking to group settlements, we've got you covered."
        />

        <div className={styles.featureGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section ref={stepsRef} id="how-it-works" className={styles.howItWorks}>
        <SectionHeader
          label="How It Works"
          title="Get started in 3 simple steps"
          subtitle="No complicated setup. Just create, track, and settle."
        />

        <div className={styles.stepsGrid}>
          {steps.map((s, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNumber}>{s.num}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className={styles.cta}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to simplify your expenses?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of users who split expenses stress-free every day.
          </p>
          <Link href="/signup">
            <Button variant="primary" size="lg">
              Get Started — It&apos;s Free <FiArrowRight />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerCopy}>
            © 2026 SplitWise. All rights reserved.
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
