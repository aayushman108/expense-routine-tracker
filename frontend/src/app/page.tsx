import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero/Hero";
import Features from "@/components/landing/Features/Features";
import HowItWorks from "@/components/landing/HowItWorks/HowItWorks";
import UseCases from "@/components/landing/UseCases/UseCases";
import AppPreview from "@/components/landing/AppPreview/AppPreview";
import CTA from "@/components/landing/CTA/CTA";
import Footer from "@/components/landing/Footer/Footer";
import styles from "./page.module.scss";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SyncSplit | Smart Expense Tracker & Bill Splitter",
  description: "Track personal expenses, split bills with friends, and manage your group finances with SyncSplit's precision-engineered protocol.",
};

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <div className={`${styles.landingWrapper} app-transition-wrapper`}>
        <div className={styles.contentWrapper}>
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
    </>
  );
}
