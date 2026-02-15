"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  HiOutlineSearch,
  HiOutlineUserAdd,
  HiOutlineMail,
  HiCheck,
} from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { useAppDispatch } from "@/store/hooks";
import { addToast } from "@/store/slices/uiSlice";
import {
  addMemberToGroupAction,
  fetchGroupDetailsAction,
} from "@/store/slices/groupSlice";
import api from "@/lib/api";
import type { User } from "@/lib/types";
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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [addedUserIds, setAddedUserIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Search users
  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await api.get(`/users/search`, {
        params: { q: searchQuery.trim() },
      });
      setResults(data.data || []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

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
      setResults([]);
      setAddingUserId(null);
      setAddedUserIds(new Set());
    }
  }, [isOpen]);

  const handleAddMember = async (user: User) => {
    setAddingUserId(user.id);
    try {
      await dispatch(
        addMemberToGroupAction({ groupId, email: user.email }),
      ).unwrap();
      setAddedUserIds((prev) => new Set(prev).add(user.id));
      dispatch(
        addToast({
          type: "success",
          message: `${user.fullName} added to group`,
        }),
      );
      // Refresh group details to reflect updated members list
      dispatch(fetchGroupDetailsAction(groupId));
    } catch (err: any) {
      const msg = typeof err === "string" ? err : "Failed to add member";
      dispatch(addToast({ type: "error", message: msg }));
    } finally {
      setAddingUserId(null);
    }
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
        />

        <div className={styles.searchResults}>
          {isSearching && (
            <div className={styles.searchStatus}>
              <div className={styles.spinner} />
              Searching...
            </div>
          )}

          {!isSearching && query.trim().length >= 2 && results.length === 0 && (
            <div className={styles.searchStatus}>
              <span className={styles.noResults}>
                No users found for &quot;{query}&quot;
              </span>
            </div>
          )}

          {!isSearching &&
            query.trim().length > 0 &&
            query.trim().length < 2 && (
              <div className={styles.searchStatus}>
                <span className={styles.hint}>
                  Type at least 2 characters...
                </span>
              </div>
            )}

          {results.map((user) => {
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
                      <img src={user.avatar.url} alt="" />
                    ) : (
                      getInitials(user.fullName)
                    )}
                  </div>
                  <div className={styles.userDetails}>
                    <span className={styles.userName}>{user.fullName}</span>
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
