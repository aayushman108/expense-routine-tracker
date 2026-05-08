import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | SyncSplit",
  description: "Join SyncSplit today to start tracking personal expenses and splitting bills with roommates, friends, and teams.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
