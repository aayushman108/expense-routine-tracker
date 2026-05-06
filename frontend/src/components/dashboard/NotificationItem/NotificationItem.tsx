"use client";

import { forwardRef } from "react";
import {
  HiOutlineBell,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";
import { Notification } from "@/store/slices/notificationSlice";
import { formatTimeAgo } from "@/lib/utils";
import styles from "./NotificationItem.module.scss";

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ notification, onClick }, ref) => {
    const getIcon = () => {
      const type = notification.type?.toUpperCase();

      switch (type) {
        case "GROUP_INVITE":
        case "MEMBER_ADDED":
          return (
            <span className={styles.iconGroup}>
              <HiOutlineUserGroup />
            </span>
          );
        case "EXPENSE_CREATED":
        case "EXPENSE_UPDATED":
          return (
            <span className={styles.iconExpense}>
              <HiOutlineCurrencyDollar />
            </span>
          );
        case "EXPENSE_DELETED":
          return (
            <span className={styles.iconDanger}>
              <HiOutlineTrash />
            </span>
          );
        case "EXPENSE_VERIFIED":
        case "SETTLEMENT_CONFIRMED":
          return (
            <span className={styles.iconSuccess}>
              <HiOutlineCheckCircle />
            </span>
          );
        case "SETTLEMENT_PAID":
          return (
            <span className={styles.iconExpense}>
              <HiOutlineCurrencyDollar />
            </span>
          );
        default:
          return (
            <span className={styles.iconDefault}>
              <HiOutlineBell />
            </span>
          );
      }
    };

    return (
      <div
        ref={ref}
        className={`${styles.item} ${!notification.is_read ? styles.unread : ""}`}
        onClick={onClick}
      >
        <div className={styles.iconWrapper}>{getIcon()}</div>
        <div className={styles.content}>
          <h4 className={styles.title}>{notification.title}</h4>
          {notification.body && (
            <p className={styles.body}>{notification.body}</p>
          )}
          <span className={styles.time}>
            {formatTimeAgo(notification.created_at)}
          </span>
        </div>
        {!notification.is_read && <div className={styles.unreadDot} />}
      </div>
    );
  },
);

NotificationItem.displayName = "NotificationItem";

export default NotificationItem;
