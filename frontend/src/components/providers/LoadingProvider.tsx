"use client";

import {
  useState,
  useEffect,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const pendingNavigation = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (contentTimer.current) {
      clearTimeout(contentTimer.current);
      contentTimer.current = null;
    }
  }, []);

  const waitForPageReady = useCallback(async () => {
    if (document.readyState !== "complete") {
      await new Promise<void>((resolve) => {
        window.addEventListener("load", () => resolve(), { once: true });
      });
    }

    await document.fonts?.ready.catch(() => undefined);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }, []);

  const finishLoading = useCallback(async () => {
    clearHideTimer();
    document.documentElement.dataset.pageReady = "false";
    await waitForPageReady();
    setReady(true);
    hideTimer.current = setTimeout(() => {
      setLoading(false);
      setReady(false);
      pendingNavigation.current = false;
      contentTimer.current = setTimeout(() => {
        document.documentElement.dataset.pageReady = "true";
        window.dispatchEvent(new Event("syncsplit:page-ready"));
      }, 500);
    }, 280);
  }, [clearHideTimer, waitForPageReady]);

  useEffect(() => {
    finishLoading();
    return clearHideTimer;
  }, [clearHideTimer, finishLoading]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      const download = anchor.hasAttribute("download");
      if (!href || target || download || href.startsWith("#")) return;

      const nextUrl = new URL(href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.origin !== currentUrl.origin) return;
      if (
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search
      ) {
        return;
      }

      pendingNavigation.current = true;
      clearHideTimer();
      document.documentElement.dataset.pageReady = "false";
      setReady(false);
      setLoading(true);
    };

    const handlePopState = () => {
      pendingNavigation.current = true;
      clearHideTimer();
      document.documentElement.dataset.pageReady = "false";
      setReady(false);
      setLoading(true);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [clearHideTimer]);

  useEffect(() => {
    if (pendingNavigation.current) {
      finishLoading();
    }
  }, [finishLoading, pathname]);

  const setIsLoading = useCallback(
    (isLoading: boolean) => {
      clearHideTimer();
      setReady(false);
      setLoading(isLoading);
      document.documentElement.dataset.pageReady = "false";
      if (isLoading) {
        pendingNavigation.current = true;
      }
      if (!isLoading) {
        pendingNavigation.current = false;
        contentTimer.current = setTimeout(() => {
          document.documentElement.dataset.pageReady = "true";
          window.dispatchEvent(new Event("syncsplit:page-ready"));
        }, 500);
      }
    },
    [clearHideTimer],
  );

  const value = useMemo(
    () => ({
      setIsLoading,
      isLoading: loading,
    }),
    [loading, setIsLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {loading && <PageLoader isReady={ready} />}
      {children}
    </LoadingContext.Provider>
  );
}
