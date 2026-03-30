import type { Metadata } from "next";
import "./globals.scss";
import AppProvider from "@/components/providers/AppProvider";
import ToastContainer from "@/components/ui/Toast/Toast";

export const metadata: Metadata = {
  title: "Expensora — Smart Expense Tracker",
  description:
    "Track personal and group expenses, split bills with custom ratios, and settle debts monthly. Built for roommates, trips, and teams.",
  keywords: [
    "expense tracker",
    "split bills",
    "group expenses",
    "settlement",
    "NPR",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
