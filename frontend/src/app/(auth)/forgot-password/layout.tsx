import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | SyncSplit",
  description: "Recover your SyncSplit account password to resume managing your shared and personal expenses.",
  alternates: {
    canonical: "/forgot-password",
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
