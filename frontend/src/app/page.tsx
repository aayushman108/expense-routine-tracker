"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero/Hero";
import Features from "@/components/landing/Features/Features";
import HowItWorks from "@/components/landing/HowItWorks/HowItWorks";
import UseCases from "@/components/landing/UseCases/UseCases";
import AppPreview from "@/components/landing/AppPreview/AppPreview";
import CTA from "@/components/landing/CTA/CTA";
import Footer from "@/components/landing/Footer/Footer";
import styles from "./page.module.scss";

export default function LandingPage() {
  return (
    <div className={styles.landingWrapper}>
      <div className={styles.contentWrapper}>
        <Navbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <AppPreview />
          <UseCases />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
