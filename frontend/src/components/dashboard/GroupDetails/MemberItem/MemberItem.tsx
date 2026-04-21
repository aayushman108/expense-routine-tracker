import React from "react";
import styles from "./MemberItem.module.scss";
import Link from "next/link";
import Image from "next/image";
import type { GroupMember, User } from "@/lib/types";

interface MemberItemProps {
  member: GroupMember;
  currentUser: User | null;
}

const MemberItem: React.FC<MemberItemProps> = ({ member, currentUser }) => {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.memberItem}>
      <Link
        href={`/dashboard/profile/${member.user?.id}`}
        className={styles.memberInfo}
        title={`View ${member.user?.full_name}'s profile`}
      >
        <div className={styles.avatar}>
          {member.user?.avatar?.url ? (
            <Image
              src={member.user.avatar.url}
              alt={member.user?.full_name || "Member"}
              fill
              style={{ objectFit: "cover" }}
            />
          ) : (
            getInitials(member.user?.full_name)
          )}
        </div>
        <div className={styles.details}>
          <div className={styles.name}>
            {member.user?.full_name}
            {currentUser?.id === member.user?.id && (
              <span className={styles.meBadge}>(You)</span>
            )}
          </div>
          <div className={styles.email}>{member.user?.email}</div>
          <div className={styles.role}>{member.role}</div>
        </div>
      </Link>
    </div>
  );
};

export default MemberItem;
