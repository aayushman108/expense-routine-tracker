import { Metadata } from "next";
import UseCasesContent from "./UseCasesContent";

export const metadata: Metadata = {
  title: "Use Cases | SyncSplit - Your Ultimate Expense Tracker & Bill Splitter",
  description: "See how SyncSplit handles every social finance scenario. Learn how roommates, travelers, couples, project teams, and event organizers track and split shared costs smoothly.",
  keywords: ["expense tracker use cases", "roommate bill splitting", "couple finance app", "travel expense splitter", "group gift pool", "SyncSplit scenarios"],
  openGraph: {
    title: "SyncSplit Use Cases | Smart Expense Tracker & Bill Splitter",
    description: "Discover all the scenarios SyncSplit solves: roommates, travel trips, couples co-living, coworking projects, and party planners.",
    type: "website",
    url: "https://syncsplit.com/use-cases",
  },
  twitter: {
    card: "summary_large_image",
    title: "SyncSplit Use Cases | Smart Expense Tracker & Bill Splitter",
    description: "Discover how roommates, couples, project teams, travelers, and event organizers manage group costs easily with SyncSplit.",
  },
};

export default function UseCasesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "SyncSplit Use Cases",
    "description": "Discover all the different scenarios SyncSplit solves for roommates, trip planning, couples finance, and professional project collaborations.",
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
      <UseCasesContent />
    </>
  );
}
