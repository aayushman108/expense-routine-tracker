"use client";

import {
  useState,
  useEffect,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";
import PageLoader from "@/components/ui/PageLoader/PageLoader";

interface LoadingContextType {
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export default function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  // Initial mount loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const value = useMemo(
    () => ({
      setIsLoading: setLoading,
      isLoading: loading,
    }),
    [loading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {loading && <PageLoader />}
      {children}
    </LoadingContext.Provider>
  );
}
