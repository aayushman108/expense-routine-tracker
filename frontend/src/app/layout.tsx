import type { Metadata } from "next";
import "./globals.scss";
import AppProvider from "@/components/providers/AppProvider";
import ToastContainer from "@/components/ui/Toast/Toast";
import ServiceWorkerRegister from "@/components/pwa/serviceWorkerRegister";
import LoadingProvider from "@/components/providers/LoadingProvider";

export const metadata: Metadata = {
  title: {
    default: "Expensora | Smart Expense Tracker & Bill Splitter",
    template: "%s | Expensora",
  },
  description:
    "Expensora is a smart expense tracker designed for individuals and groups. Track personal expenses, split bills with custom ratios, and settle debts monthly. Built for roommates, trips, and teams.",
  keywords: [
    "Expensora",
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
  metadataBase: new URL("https://expensora.netlify.app"), // Replace with actual URL if known
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://expensora.netlify.app",
    title: "Expensora | Smart Expense Tracker & Bill Splitter",
    description:
      "Expensora helps you track and split expenses with ease. Perfect for managing shared living costs, travel budgets, and personal finances.",
    siteName: "Expensora",
    images: [
      {
        url: "/landing.png",
        width: 1200,
        height: 630,
        alt: "Expensora App Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Expensora | Smart Expense Tracker",
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
  },
  manifest: "/manifest.json",
};

import FCMInitializer from "@/components/pwa/FCMInitializer";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
              name: "Expensora",
              url: "https://expensora.netlify.app",
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
          <AppProvider>
            <FCMInitializer />
            {children}
            <ToastContainer />
          </AppProvider>
        </LoadingProvider>
        {/* </Suspense> */}
      </body>
    </html>
  );
}
