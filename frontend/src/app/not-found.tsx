import React from "react";
import { BiSearch } from "react-icons/bi";
import ErrorState from "@/components/ui/ErrorState/ErrorState";

export const metadata = {
  title: "404 - Page Not Found | Expensora",
  description: "Oops! We can't seem to find the page you're looking for.",
};

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 200px)",
        padding: "2rem",
      }}
    >
      <ErrorState
        title="Page Not Found"
        message="The page you're looking for doesn't exist, has been moved, or you don't have permission to access it."
        icon={<BiSearch size={64} />}
      />
    </div>
  );
}
