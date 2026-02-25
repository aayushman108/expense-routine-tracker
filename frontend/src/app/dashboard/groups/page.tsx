"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineChevronLeft,
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineOfficeBuilding,
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
    if (!groups?.data) return [];
    if (!searchQuery.trim()) return groups.data;

    const query = searchQuery.toLowerCase().trim();
    return groups.data.filter(
      (group: any) =>
        group.name.toLowerCase().includes(query) ||
        (group.description && group.description.toLowerCase().includes(query)),
    );
  }, [groups?.data, searchQuery]);

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
          <h1>Shared Groups</h1>
          <p>
            Collaborate and split expenses with your friends, family, and
            colleagues in shared workspaces.
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
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
                  <img src={group.image.url} alt={group.name} />
                ) : (
                  <HiOutlineOfficeBuilding />
                )}
              </div>
              <div className={styles.cardDetails}>
                <div className={styles.topRow}>
                  <span className={styles.groupName}>{group.name}</span>
                  {group.created_by === user?.id && (
                    <span className={styles.roleBadge}>Admin</span>
                  )}
                </div>
                <p className={styles.description}>
                  {group.description || "No description provided."}
                </p>
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
