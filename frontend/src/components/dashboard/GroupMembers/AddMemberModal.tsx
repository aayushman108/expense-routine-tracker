"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import {
  HiOutlineSearch,
  HiOutlineUserAdd,
  HiOutlineMail,
  HiCheck,
} from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast } from "@/store/slices/uiSlice";
import {
  addMemberToGroupAction,
  fetchGroupDetailsAction,
} from "@/store/slices/groupSlice";
import {
  searchUsersAction,
  clearSearchResults,
} from "@/store/slices/userSlice";
import type { User } from "@/lib/types";
import { handleThunk } from "@/lib/utils";
import styles from "./group-member-modals.module.scss";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  existingMemberIds: string[];
}

export default function AddMemberModal({
  isOpen,
  onClose,
  groupId,
  existingMemberIds,
}: AddMemberModalProps) {
  const dispatch = useAppDispatch();
  const {
    searchResults: results,
    isSearching,
    searchError,
  } = useAppSelector((state) => state.users);

  const [query, setQuery] = useState("");
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [addedUserIds, setAddedUserIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Search users
  const searchUsers = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        dispatch(clearSearchResults());
        return;
      }

      await handleThunk(dispatch(searchUsersAction(searchQuery.trim())));
    },
    [dispatch],
  );

  // Debounced search
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(val), 350);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      dispatch(clearSearchResults());
      setAddingUserId(null);
      setAddedUserIds(new Set());
    }
  }, [isOpen, dispatch]);

  const handleAddMember = async (user: User) => {
    setAddingUserId(user.id);
    await handleThunk(
      dispatch(addMemberToGroupAction({ groupId, newMemberId: user.id })),
      () => {
        setAddedUserIds((prev) => new Set(prev).add(user.id));
        dispatch(
          addToast({
            type: "success",
            message: `${user.full_name} added to group`,
          }),
        );
        // Refresh group details to reflect updated members list
        dispatch(fetchGroupDetailsAction(groupId));
      },
      (err: any) => {
        const msg = typeof err === "string" ? err : "Failed to add member";
        dispatch(addToast({ type: "error", message: msg }));
      },
    );
    setAddingUserId(null);
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isExistingMember = (userId: string) =>
    existingMemberIds.includes(userId) || addedUserIds.has(userId);

  const noResults =
    !isSearching &&
    query.trim().length >= 2 &&
    results.length === 0 &&
    !searchError;
  const minCharMessage =
    !isSearching &&
    query.trim().length < 2 &&
    results.length === 0 &&
    !searchError;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Member"
      footer={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className={styles.addMemberContent}>
        <Input
          label="Search by name or email"
          name="member_search"
          type="text"
          placeholder="Type a name or email..."
          icon={<HiOutlineSearch />}
          value={query}
          onChange={handleQueryChange}
          autoFocus
          autoComplete="off"
        />

        <div className={styles.searchResults}>
          {isSearching && (
            <div className={styles.searchStatus}>
              <div className={styles.spinner} />
              Searching...
            </div>
          )}

          {noResults && (
            <div className={styles.searchStatus}>
              <span className={styles.noResults}>
                No users found for &quot;{query}&quot;
              </span>
            </div>
          )}

          {searchError && (
            <div className={styles.searchStatus}>
              <span className={styles.error}>{searchError}</span>
            </div>
          )}

          {minCharMessage && (
            <div className={styles.searchStatus}>
              <span className={styles.hint}>Type at least 2 characters...</span>
            </div>
          )}

          {results?.map((user) => {
            const isMember = isExistingMember(user.id);
            const isAdding = addingUserId === user.id;

            return (
              <div
                key={user.id}
                className={`${styles.userResult} ${isMember ? styles.alreadyMember : ""}`}
              >
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {user.avatar?.url ? (
                      <Image
                        src={user.avatar.url}
                        alt={user.full_name || "User"}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      getInitials(user.full_name)
                    )}
                  </div>
                  <div className={styles.userDetails}>
                    <span className={styles.userName}>{user.full_name}</span>
                    <span className={styles.userEmail}>
                      <HiOutlineMail /> {user.email}
                    </span>
                  </div>
                </div>

                {isMember ? (
                  <span className={styles.memberBadge}>
                    <HiCheck /> Member
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddMember(user)}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      "Adding..."
                    ) : (
                      <>
                        <HiOutlineUserAdd /> Add
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
