import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineOfficeBuilding,
  HiOutlineChartBar,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { FiUsers } from "react-icons/fi";
import styles from "./GroupCard.module.scss";
import type { Group } from "@/lib/types";

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link href={`/dashboard/groups/${group.id}`} className={styles.groupCard}>
      <div className={styles.image}>
        {group.image?.url ? (
          <Image
            src={group.image.url}
            alt={group.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <HiOutlineOfficeBuilding />
        )}
      </div>
      <div className={styles.cardDetails}>
        <div className={styles.topRow}>
          <div className={styles.nameAndBadge}>
            <span className={styles.groupName}>{group.name}</span>
            {group.role === "admin" && (
              <span className={styles.roleBadge}>Admin</span>
            )}
          </div>
          {group.pending_verifications && group.pending_verifications > 0 && (
            <div
              className={styles.pendingBadge}
              title="Action required: verify expenses"
            >
              <HiOutlineExclamationCircle />
              {group.pending_verifications}
            </div>
          )}
        </div>
        <p className={styles.description}>
          {group.description || "No description provided."}
        </p>

        <div className={styles.balanceArea}>
          <div className={styles.balanceLabelWrapper}>
            <span className={styles.statIcon}>
              <HiOutlineChartBar />
            </span>
            <span className={styles.statLabel}>Net Balance</span>
          </div>
          <div
            className={`${styles.statValue} ${
              (group.net_balance || 0) < 0
                ? styles.negative
                : (group.net_balance || 0) > 0
                  ? styles.positive
                  : ""
            }`}
          >
            रू {(group.net_balance || 0).toLocaleString()}
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.dateLabel}>
          Since {formatDate(group.created_at)}
        </span>
        <span className={styles.memberInfo}>
          <FiUsers /> {group.member_count || 1}{" "}
          {group.member_count === 1 ? "Member" : "Members"}
        </span>
      </div>
    </Link>
  );
};

export default GroupCard;
