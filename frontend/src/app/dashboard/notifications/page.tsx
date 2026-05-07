"use client";

import { useEffect, useRef } from "react";
import {
  HiOutlineBell,
  HiOutlineChevronLeft,
  HiOutlineCheckCircle,
  HiOutlineBellSlash,
} from "react-icons/hi2";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  resetPagination,
} from "@/store/slices/notificationSlice";
import NotificationItem from "@/components/dashboard/NotificationItem/NotificationItem";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export default function NotificationPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    notifications,
    isLoading,
    isFetchingMore,
    isMarkingAllRead,
    unreadCount,
    page,
    hasMore,
  } = useAppSelector((s) => s.notifications);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(resetPagination());
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !isFetchingMore
        ) {
          dispatch(fetchNotifications({ page: page + 1, limit: 10 }));
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isFetchingMore, page, dispatch, notifications.length]);

  const handleNotificationClick = (id: string, url?: string) => {
    dispatch(markAsRead(id));
    if (url) {
      router.push(url);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <button
            className={styles.backBtn}
            onClick={() => router.push("/dashboard")}
          >
            <HiOutlineChevronLeft /> Back to Dashboard
          </button>
          <div className={styles.headerContent}>
            <div className={styles.pageIcon}>
              <HiOutlineBell />
            </div>
            <div className={styles.textDetails}>
              <div className={styles.titleRow}>
                <h1>Notifications</h1>
                {unreadCount > 0 && (
                  <div className={styles.unreadBadge}>{unreadCount} UNREAD</div>
                )}
              </div>
              <p>Stay updated with your group and personal expenses.</p>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(markAllAsRead())}
              className={styles.markAllBtn}
              isLoading={isMarkingAllRead}
            >
              <HiOutlineCheckCircle />
              Mark all as read
            </Button>
          )}
        </div>
      </header>

      <div className={styles.contentGrid}>
        {isLoading ? (
          <div className={styles.loading}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className={styles.list}>
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onClick={() =>
                  handleNotificationClick(notif.id, notif.data?.url)
                }
              />
            ))}
            
            {/* Sentinel for infinite scroll */}
            <div ref={observerTarget} className={styles.sentinel} />

            {isFetchingMore && (
              <div className={styles.fetchingMoreLoader}>
                <div className={styles.skeleton} style={{ height: '100px' }} />
              </div>
            )}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <HiOutlineBellSlash />
            </div>
            <h3>All caught up!</h3>
            <p>You don't have any notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
