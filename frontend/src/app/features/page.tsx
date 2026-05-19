import { Metadata } from "next";
import FeaturesContent from "./FeaturesContent";

export const metadata: Metadata = {
  title: "Features | SyncSplit - Your Ultimate Expense Tracker & Bill Splitter",
  description: "Explore SyncSplit's professional features, including smart expense tracking, custom bill splitting, debt minimization algorithms, mutual verification, and analytical dashboards.",
  keywords: ["expense tracker features", "bill splitting app", "debt minimization algorithm", "group expenses", "shared finances", "budget insights", "SyncSplit features"],
  openGraph: {
    title: "SyncSplit Features | Smart Expense Tracker & Bill Splitter",
    description: "Discover all the professional features SyncSplit offers for tracking personal finance and splitting bills with groups.",
    type: "website",
    url: "https://syncsplit.com/features",
  },
  twitter: {
    card: "summary_large_image",
    title: "SyncSplit Features | Smart Expense Tracker & Bill Splitter",
    description: "Discover how SyncSplit simplifies tracking personal finances and splitting group bills with mathematical clarity.",
  },
};

export default function FeaturesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "SyncSplit Features",
    "description": "Discover all the features SyncSplit offers, from individual expense tracking to automated debt minimization algorithms.",
    "publisher": {
      "@type": "Organization",
      "name": "SyncSplit Protocol",
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
