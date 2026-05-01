import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

/**
 * Custom hook to update URL search parameters without a full page reload.
 * Useful for syncing filters, pagination, and tabs with the URL.
 */
export const useUpdateQuery = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Use a ref to track the last pushed query string to prevent redundant pushes
  const lastPushedQueryRef = useRef(searchParams.toString());

  /**
   * Updates the URL search parameters with the provided key-value pairs.
   * If a value is null, undefined, or an empty string, the key is removed from the URL.
   * 
   * This function is stabilized by using window.location.search to avoid 
   * frequent re-creations when searchParams change.
   */
  const updateQuery = useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      // Get current params from window to avoid searchParams dependency
      const current = new URLSearchParams(window.location.search);

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const search = current.toString();
      
      // Only push if the query has actually changed
      if (search !== lastPushedQueryRef.current) {
        lastPushedQueryRef.current = search;
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`, { scroll: false });
      }
    },
    [pathname, router], // Removed searchParams dependency to prevent infinite loops
  );

  return { updateQuery, searchParams };
};
