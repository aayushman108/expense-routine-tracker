"use client";

import { useEffect, useRef } from "react";
import { HiOutlineBellSlash, HiOutlineCheckCircle } from "react-icons/hi2";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchNotifications, markAsRead, markAllAsRead, resetPagination } from "@/store/slices/notificationSlice";
import NotificationItem from "@/components/dashboard/NotificationItem/NotificationItem";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./page.module.scss";

export default function NotificationPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { notifications, isLoading, isFetchingMore, unreadCount, page, hasMore } = useAppSelector((s) => s.notifications);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(resetPagination());
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore) {
          dispatch(fetchNotifications({ page: page + 1, limit: 10 }));
        }
      },
      { threshold: 1.0 }
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
    <div className={styles.container}>
      <SectionHeader 
        title="Notifications" 
        subtitle="Stay updated with your group and personal expenses"
      >
        {notifications.length > 0 && unreadCount > 0 && (
          <button 
            className={styles.markAllBtn}
            onClick={() => dispatch(markAllAsRead())}
          >
            <HiOutlineCheckCircle />
            Mark all as read
          </button>
        )}
      </SectionHeader>

      <div className={styles.content}>
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
                onClick={() => handleNotificationClick(notif.id, notif.data?.url)}
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
