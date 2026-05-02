"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineChevronLeft,
  HiOutlinePlus,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyGroupsAction } from "@/store/slices/groupSlice";
import Button from "@/components/ui/Button/Button";
import CreateGroupModal from "@/components/dashboard/GroupModals/CreateGroupModal";
import GroupCard from "@/components/dashboard/GroupCard/GroupCard";
import styles from "./groups.module.scss";
import { GroupsGridSkeleton } from "./GroupsLoadingSkeletons";
import type { RootState } from "@/store";
import type { Group } from "@/lib/types";

export default function GroupsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { groups } = useAppSelector((s: RootState) => s.groups);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const groupsData = useMemo(() => groups?.data || [], [groups.data]);

  useEffect(() => {
    dispatch(fetchMyGroupsAction());
  }, [dispatch]);

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

      {groups?.isLoading ? (
        <GroupsGridSkeleton count={4} />
      ) : groupsData.length > 0 ? (
        <div className={styles.grid}>
          {groupsData.map((group: Group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <HiOutlineUserGroup />
          </div>
          <h3>No groups yet</h3>
          <p>
            Create a group to start splitting expenses with friends, family, or
            colleagues.
          </p>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            Create Your First Group
          </Button>
        </div>
      )}

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
