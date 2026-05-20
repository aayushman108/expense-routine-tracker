import { Metadata } from "next";
import HowItWorksContent from "./HowItWorksContent";

export const metadata: Metadata = {
  title: "How It Works | SyncSplit - Your Ultimate Expense Tracker",
  description: "Learn how SyncSplit handles signup, PWA access, personal expenses, group invitations, verified group expenses, settlement payment proof, receiver confirmation, FCM notifications, profiles, and settings.",
  keywords: ["expense tracker", "bill splitting", "group expenses", "shared finances", "verified settlements", "payment proof", "notification settings", "SyncSplit guide"],
  openGraph: {
    title: "How It Works | SyncSplit",
    description: "Learn the SyncSplit workflow for PWA access, personal tracking, group expense verification, settlement proof uploads, receiver confirmation, and notifications.",
    type: "website",
    url: "https://syncsplit.com/how-it-works",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works | SyncSplit",
    description: "The complete guide to personal tracking, group expense verification, settlements, payment proof, and notifications in SyncSplit.",
  },
};

export default function HowItWorksPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to use SyncSplit for Expense Tracking",
    "description": "A guide to setting up your account, using SyncSplit as a desktop or mobile PWA, tracking personal expenses, managing groups, verifying shared expenses, settling balances, confirming payments, and configuring notifications.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Secure Onboarding",
        "text": "Sign up or log in using email credentials or Google OAuth, then use SyncSplit in the browser or install it as a desktop or mobile PWA.",
        "url": "https://syncsplit.com/how-it-works#onboarding"
      },
      {
        "@type": "HowToStep",
        "name": "Individual Tracking",
        "text": "Log personal expenses that stay separate from group expenses, splits, and settlements.",
        "url": "https://syncsplit.com/how-it-works#individual-tracking"
      },
      {
        "@type": "HowToStep",
        "name": "Collaborative Finance",
        "text": "Create groups, add registered members, invite unregistered people by email, and let members add shared expenses.",
        "url": "https://syncsplit.com/how-it-works#collaboration"
      },
      {
        "@type": "HowToStep",
        "name": "Expense Verification",
        "text": "Include only expenses verified by every member involved in that expense when calculating settlements.",
        "url": "https://syncsplit.com/how-it-works#verification"
      },
      {
        "@type": "HowToStep",
        "name": "Smart Settlements",
        "text": "Use verified balances to settle debts, upload payment proof, and let the receiver confirm the payment.",
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
