import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useMemo } from "react";

/**
 * Custom hook to update URL search parameters without a full page reload.
 * Useful for syncing filters, pagination, and tabs with the URL.
 *
 * @example
 * const { query, updateQuery } = useUpdateQuery();
 *
 * // 1. Accessing parameters
 * console.log(query.page); // Access ?page=1 as query.page
 *
 * // 2. Updating parameters
 * updateQuery({ page: 2, status: 'completed' }); // Syncs ?page=2&status=completed to URL
 *
 * // 3. Removing parameters
 * updateQuery({ status: null }); // Removes 'status' from the URL
 */
export const useUpdateQuery = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Returns a plain object containing all current search parameters.
   * This allows accessing parameters via query.key instead of searchParams.get('key').
   */
  const query = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

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
        const urlQuery = search ? `?${search}` : "";
        router.push(`${pathname}${urlQuery}`, { scroll: false });
      }
    },
    [pathname, router], // Removed searchParams dependency to prevent infinite loops
  );

  return { updateQuery, searchParams, query };
};
