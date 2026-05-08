import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | SyncSplit",
  description: "Sign in to your SyncSplit account to manage your expenses and split bills with your groups.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
