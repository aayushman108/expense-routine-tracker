"use client";

import ErrorState from "@/components/ui/ErrorState/ErrorState";
import "./globals.scss";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body suppressHydrationWarning>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <ErrorState error={error} reset={reset} />
        </div>
      </body>
    </html>
  );
}
