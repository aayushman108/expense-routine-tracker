import { Metadata } from "next";
import UseCasesContent from "./UseCasesContent";

export const metadata: Metadata = {
  title: "Use Cases | SyncSplit - Your Ultimate Expense Tracker & Bill Splitter",
  description: "See how SyncSplit supports personal budgeting, roommates, trips, couples, teams, and events with personal expenses, group verification, payment proof, and notification workflows.",
  keywords: ["expense tracker use cases", "roommate bill splitting", "personal expense tracker", "travel expense splitter", "verified settlements", "payment proof", "SyncSplit scenarios"],
  openGraph: {
    title: "SyncSplit Use Cases | Smart Expense Tracker & Bill Splitter",
    description: "Discover how SyncSplit supports personal tracking, roommate bills, trips, couples, teams, and events with verified group settlements.",
    type: "website",
    url: "https://syncsplit.com/use-cases",
  },
  twitter: {
    card: "summary_large_image",
    title: "SyncSplit Use Cases | Smart Expense Tracker & Bill Splitter",
    description: "Discover how individuals, roommates, couples, project teams, travelers, and event organizers manage expenses and verified settlements with SyncSplit.",
  },
};

export default function UseCasesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "SyncSplit Use Cases",
    "description": "Discover the scenarios SyncSplit supports for personal budgeting, roommates, trips, couples, project teams, events, verified settlements, and payment confirmation.",
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
      <UseCasesContent />
    </>
  );
}
