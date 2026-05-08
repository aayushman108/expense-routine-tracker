import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | SyncSplit",
  description: "Securely reset your SyncSplit account password.",
  alternates: {
    canonical: "/reset-password",
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
