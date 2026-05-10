import type { Metadata } from "next";
import "./globals.scss";
import AppProvider from "@/components/providers/AppProvider";
import ToastContainer from "@/components/ui/Toast/Toast";
import ServiceWorkerRegister from "@/components/pwa/serviceWorkerRegister";
import LoadingProvider from "@/components/providers/LoadingProvider";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "SyncSplit | Smart Expense Tracker & Bill Splitter",
    template: "%s | SyncSplit",
  },
  description:
    "SyncSplit is a smart expense tracker designed for individuals and groups. Track personal expenses, split bills with custom ratios, and settle debts monthly. Built for roommates, trips, and teams.",
  keywords: [
    "SyncSplit",
    "expense tracker",
    "split bills",
    "group expenses",
    "debt settlement",
    "personal finance",
    "NPR",
    "Next.js tracker",
    "finance management",
  ],
  authors: [{ name: "Aayushman Sharma" }],
  creator: "Aayushman Sharma",
  metadataBase: new URL("https://syncsplit.netlify.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://syncsplit.netlify.app",
    title: "SyncSplit | Smart Expense Tracker & Bill Splitter",
    description:
      "SyncSplit helps you track and split expenses with ease. Perfect for managing shared living costs, travel budgets, and personal finances.",
    siteName: "SyncSplit",
    images: [
      {
        url: "/landing.png",
        width: 1200,
        height: 630,
        alt: "SyncSplit App Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SyncSplit | Smart Expense Tracker",
    description:
      "Efficiently track and manage your shared and individual expenses.",
    images: ["/landing.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

import FCMInitializer from "@/components/pwa/FCMInitializer";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = saved || (prefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "SyncSplit",
              url: "https://syncsplit.netlify.app",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              description:
                "Smart expense tracker and bill splitter for groups and individuals.",
              author: {
                "@type": "Person",
                name: "Aayushman Sharma",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "NPR",
              },
            }),
          }}
        />
        <ServiceWorkerRegister />
        {/* <Suspense fallback={<PageLoader />}> */}
        <LoadingProvider>
          <AuthProvider>
            <AppProvider>
              <FCMInitializer />
              {children}
              <ToastContainer />
            </AppProvider>
          </AuthProvider>
        </LoadingProvider>
        {/* </Suspense> */}
      </body>
    </html>
  );
}
