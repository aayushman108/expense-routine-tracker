"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineChevronLeft,
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineOfficeBuilding,
  HiOutlineChartBar,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { FiUsers } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyGroupsAction } from "@/store/slices/groupSlice";
import Button from "@/components/ui/Button/Button";
import CreateGroupModal from "@/components/dashboard/GroupModals/CreateGroupModal";
import styles from "./groups.module.scss";
import type { RootState } from "@/store";

export default function GroupsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { groups, isLoading } = useAppSelector((s: RootState) => s.groups);
  const { user } = useAppSelector((s: RootState) => s.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyGroupsAction());
  }, [dispatch]);

  const filteredGroups = useMemo(() => {
    const data = groups?.data;
    if (!data) return [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();
    return data.filter(
      (group: any) =>
        group.name.toLowerCase().includes(query) ||
        (group.description && group.description.toLowerCase().includes(query)),
    );
  }, [groups.data, searchQuery]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
          <div className={styles.sessionTag}>GROUP_COLLABORATION_ACTIVE</div>
          <div className={styles.titleWrapper}>
            <div className={styles.icon}>
              <HiOutlineUserGroup />
            </div>
            <h1>Shared Groups</h1>
          </div>
          <p>
            Collaborate and split expenses with your friends, family, and
            colleagues in shared workspaces.
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <HiOutlinePlus /> Create New Group
          </Button>
        </div>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}>
            <HiOutlineSearch />
          </div>
          <input
            type="text"
            placeholder="Search groups by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={styles.groupCard}
              style={{
                background: "var(--bg-tertiary)",
                height: "280px",
                opacity: 0.6,
              }}
            ></div>
          ))}
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className={styles.grid}>
          {filteredGroups.map((group: any) => (
            <Link
              key={group.id}
              href={`/dashboard/groups/${group.id}`}
              className={styles.groupCard}
            >
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
                  {group.pending_verifications > 0 && (
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
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <HiOutlineUserGroup />
          </div>
          <h3>{searchQuery ? "No matching groups found" : "No groups yet"}</h3>
          <p>
            {searchQuery
              ? `We couldn't find any groups matching "${searchQuery}". Try a different search term.`
              : "Create a group to start splitting expenses with friends, family, or colleagues."}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Your First Group
            </Button>
          )}
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      )}

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
