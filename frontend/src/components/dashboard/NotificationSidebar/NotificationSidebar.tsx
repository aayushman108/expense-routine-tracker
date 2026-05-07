"use client";

import { useEffect, useRef } from "react";
import { HiOutlineXMark, HiOutlineBellSlash } from "react-icons/hi2";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setNotificationSidebarOpen } from "@/store/slices/uiSlice";
import { fetchNotifications, markAsRead, markAllAsRead, resetPagination } from "@/store/slices/notificationSlice";
import NotificationItem from "../NotificationItem/NotificationItem";
import Button from "@/components/ui/Button/Button";
import styles from "./NotificationSidebar.module.scss";
import { useRouter } from "next/navigation";

export default function NotificationSidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { notificationSidebarOpen } = useAppSelector((s) => s.ui);
  const { notifications, isLoading, isFetchingMore, isMarkingAllRead, unreadCount, page, hasMore } = useAppSelector((s) => s.notifications);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notificationSidebarOpen) {
      dispatch(resetPagination());
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [notificationSidebarOpen, dispatch]);

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

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        dispatch(setNotificationSidebarOpen(false));
      }
    };

    if (notificationSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationSidebarOpen, dispatch]);

  // Lock body scroll
  useEffect(() => {
    if (notificationSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [notificationSidebarOpen]);

  const handleNotificationClick = (id: string, url?: string) => {
    dispatch(markAsRead(id));
    if (url) {
      router.push(url);
      dispatch(setNotificationSidebarOpen(false));
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`${styles.overlay} ${notificationSidebarOpen ? styles.visible : ""}`}
        onClick={() => dispatch(setNotificationSidebarOpen(false))}
      />

      <aside 
        ref={sidebarRef}
        className={`${styles.sidebar} ${notificationSidebarOpen ? styles.open : ""}`}
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>Notifications</h2>
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount} new</span>
            )}
          </div>
          <button 
            className={styles.closeBtn}
            onClick={() => dispatch(setNotificationSidebarOpen(false))}
            aria-label="Close notifications"
          >
            <HiOutlineXMark />
          </button>
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <div className={styles.actions}>
            <Button 
              variant="ghost"
              size="sm"
              className={styles.markAllBtn}
              onClick={() => dispatch(markAllAsRead())}
              isLoading={isMarkingAllRead}
            >
              Mark all as read
            </Button>
          </div>
        )}

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>
              {[...Array(5)].map((_, i) => (
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
                  <div className={styles.skeleton} style={{ height: '60px' }} />
                </div>
              )}
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <HiOutlineBellSlash />
              </div>
              <p>No notifications yet</p>
              <span>We'll let you know when something important happens.</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
