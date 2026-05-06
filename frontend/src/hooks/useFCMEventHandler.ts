import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  clearFCMEvent,
  type FCMEventData,
} from "@/store/slices/notificationSlice";
import { fetchGroupExpenses } from "@/store/slices/expenseSlice";
import { fetchGroupSettlementBalances } from "@/store/slices/settlementSlice";
import {
  fetchGroupDetailsAction,
  fetchMyGroupsAction,
} from "@/store/slices/groupSlice";

// ── Notification type constants (must match backend listener values) ────────

const EXPENSE_TYPES = [
  "EXPENSE_CREATED",
  "EXPENSE_UPDATED",
  "EXPENSE_DELETED",
] as const;

const SETTLEMENT_TYPES = [
  "SETTLEMENT_PAID",
  "SETTLEMENT_CONFIRMED",
] as const;

const EXPENSE_VERIFIED_TYPE = "EXPENSE_VERIFIED";
const MEMBER_ADDED_TYPE = "MEMBER_ADDED";

// ── Hook ────────────────────────────────────────────────────────────────────

interface UseFCMEventHandlerOptions {
  /** The group ID the page is currently showing (from URL params) */
  currentGroupId?: string;
  /** Callback to refetch expenses with current filters (optional) */
  refetchExpenses?: () => void;
}

/**
 * Subscribes to the latest FCM event from Redux and triggers targeted
 * data refetches instead of a full page reload.
 *
 * Drop this hook into any page that displays live data.
 *
 * @example
 * ```tsx
 * // In the group details page:
 * useFCMEventHandler({
 *   currentGroupId: id as string,
 *   refetchExpenses: fetchExpenses, // your memoised callback
 * });
 * ```
 */
export function useFCMEventHandler({
  currentGroupId,
  refetchExpenses,
}: UseFCMEventHandlerOptions = {}) {
  const dispatch = useAppDispatch();
  const lastEvent = useAppSelector((s) => s.notifications.lastEvent);
  const processedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastEvent) return;

    // Guard against processing the same event twice (React strict-mode / re-renders)
    if (processedRef.current === lastEvent.eventId) return;
    processedRef.current = lastEvent.eventId;

    const { type } = lastEvent;
    const { groupId } = lastEvent.data;

    // ── Expense events ────────────────────────────────────────────────
    if (type && (EXPENSE_TYPES as readonly string[]).includes(type)) {
      if (groupId && groupId === currentGroupId) {
        // If the caller supplied a refetch with filters, prefer that
        if (refetchExpenses) {
          refetchExpenses();
        } else {
          dispatch(fetchGroupExpenses({ groupId }));
        }
        // Settlement balances may also change when expenses change
        dispatch(fetchGroupSettlementBalances(groupId));
      }
    }

    // ── Expense verified → affects settlements tab ───────────────────
    if (type === EXPENSE_VERIFIED_TYPE) {
      if (groupId && groupId === currentGroupId) {
        dispatch(fetchGroupSettlementBalances(groupId));
        // Also refresh expenses since verification status changed
        if (refetchExpenses) {
          refetchExpenses();
        } else {
          dispatch(fetchGroupExpenses({ groupId }));
        }
      }
    }

    // ── Settlement events ─────────────────────────────────────────────
    if (type && (SETTLEMENT_TYPES as readonly string[]).includes(type)) {
      if (groupId && groupId === currentGroupId) {
        dispatch(fetchGroupSettlementBalances(groupId));
      }
    }

    // ── Member added → refresh group details / groups list ────────────
    if (type === MEMBER_ADDED_TYPE) {
      if (groupId && groupId === currentGroupId) {
        dispatch(fetchGroupDetailsAction(groupId));
      }
      // Also refresh the groups list (new group may appear)
      dispatch(fetchMyGroupsAction());
    }

    // Clear the event so it isn't processed again on the next render
    dispatch(clearFCMEvent());
  }, [lastEvent, currentGroupId, refetchExpenses, dispatch]);
}
