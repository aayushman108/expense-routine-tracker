import { Metadata } from "next";
import FeaturesContent from "./FeaturesContent";

export const metadata: Metadata = {
  title: "Features | SyncSplit - Your Ultimate Expense Tracker & Bill Splitter",
  description: "Explore SyncSplit features for signup, PWA access, personal expense tracking, group expense management, verified settlements, payment proof, FCM notifications, dashboards, profiles, and settings.",
  keywords: ["expense tracker features", "bill splitting app", "verified settlements", "group expenses", "shared finances", "budget insights", "payment proof", "SyncSplit features"],
  openGraph: {
    title: "SyncSplit Features | Smart Expense Tracker & Bill Splitter",
    description: "Discover SyncSplit features for PWA access, personal expenses, group splits, member invitations, verified settlements, notifications, dashboards, profiles, and settings.",
    type: "website",
    url: "https://syncsplit.com/features",
  },
  twitter: {
    card: "summary_large_image",
    title: "SyncSplit Features | Smart Expense Tracker & Bill Splitter",
    description: "Discover how SyncSplit handles PWA access, personal expenses, verified group splits, payment proof, receiver confirmation, dashboards, and notification settings.",
  },
};

export default function FeaturesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "SyncSplit Features",
    "description": "Discover SyncSplit features for installable PWA access, personal expense tracking, group expense management, verified settlement workflows, payment proof, notifications, dashboards, profiles, and settings.",
    "publisher": {
      "@type": "Organization",
      "name": "SyncSplit",
      "logo": "https://syncsplit.com/favicon.ico"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FeaturesContent />
    </>
  );
}
