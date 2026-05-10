import { Metadata } from "next";
import HowItWorksContent from "./HowItWorksContent";

export const metadata: Metadata = {
  title: "How It Works | SyncSplit - Your Ultimate Expense Tracker",
  description: "Learn how SyncSplit simplifies shared expenses, bill splitting, and group settlements with a secure verification protocol and debt minimization algorithm.",
  keywords: ["expense tracker", "bill splitting", "group expenses", "shared finances", "budget management", "settlement algorithm", "SyncSplit guide"],
  openGraph: {
    title: "How It Works | SyncSplit",
    description: "Master the SyncSplit protocol to manage your individual and group finances with surgical precision.",
    type: "website",
    url: "https://syncsplit.com/how-it-works",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works | SyncSplit",
    description: "The complete guide to mastering group expense management with SyncSplit.",
  },
};

export default function HowItWorksPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to use SyncSplit for Expense Tracking",
    "description": "A comprehensive guide on setting up your account, tracking individual expenses, and managing group splits and settlements with SyncSplit.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Secure Onboarding",
        "text": "Sign up using email or Google OAuth and install SyncSplit as a PWA for cross-platform access.",
        "url": "https://syncsplit.com/how-it-works#onboarding"
      },
      {
        "@type": "HowToStep",
        "name": "Individual Tracking",
        "text": "Log your daily spends and view monthly analytics to gain insights into your spending habits.",
        "url": "https://syncsplit.com/how-it-works#individual-tracking"
      },
      {
        "@type": "HowToStep",
        "name": "Collaborative Finance",
        "text": "Create groups, invite friends, and use advanced split logic to divide bills fairly.",
        "url": "https://syncsplit.com/how-it-works#collaboration"
      },
      {
        "@type": "HowToStep",
        "name": "Verification Protocol",
        "text": "Verify expenses within your group to ensure accuracy and settlement integrity.",
        "url": "https://syncsplit.com/how-it-works#verification"
      },
      {
        "@type": "HowToStep",
        "name": "Smart Settlements",
        "text": "Use our debt minimization algorithm to settle group debts with the fewest possible payments.",
        "url": "https://syncsplit.com/how-it-works#settlements"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HowItWorksContent />
    </>
  );
}
