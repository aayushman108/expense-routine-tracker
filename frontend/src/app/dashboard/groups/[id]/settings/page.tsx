"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiOutlineChevronLeft, HiOutlineUserAdd, HiOutlineLogout, HiOutlineTrash, HiOutlineShieldCheck } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGroupDetailsAction, leaveGroupAction, removeMemberAction, updateMemberRoleAction, clearGroupDetails } from "@/store/slices/groupSlice";
import { handleThunk } from "@/lib/utils";
import Button from "@/components/ui/Button/Button";
import InviteUserModal from "@/components/dashboard/GroupMembers/InviteUserModal";
import AddMemberModal from "@/components/dashboard/GroupMembers/AddMemberModal";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import MemberItem from "@/components/dashboard/GroupDetails/MemberItem/MemberItem";
import { showToast } from "@/lib/toast";
import { ToastType } from "@/enums/general.enum";
import styles from "./settings.module.scss";
import { GroupSettingsSkeleton } from "../GroupLoadingSkeletons";

export default function GroupSettingsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { groupDetails } = useAppSelector((s) => s.groups);
  const { user } = useAppSelector((s) => s.auth);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [memberToPromote, setMemberToPromote] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchGroupDetailsAction(id as string));
    }
    return () => {
      dispatch(clearGroupDetails());
    };
  }, [id, dispatch]);

  const members = useMemo(() => groupDetails?.data?.members || [], [groupDetails]);

  const isAdmin = useMemo(() => {
    const me = members.find((m) => m.user_id === user?.id);
    return me?.role === "admin";
  }, [members, user]);

  const isLastAdmin = useMemo(() => {
    if (!isAdmin) return false;
    const otherAdmins = members.filter((m) => m.role === "admin" && m.user_id !== user?.id);
    return otherAdmins.length === 0 && members.length > 1;
  }, [isAdmin, members, user]);

  const handleLeaveGroup = async () => {
    await handleThunk(
      dispatch(leaveGroupAction(id as string)),
      () => router.push("/dashboard"),
      (error: string) => showToast(ToastType.ERROR, error)
    );
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    await handleThunk(
      dispatch(removeMemberAction({ groupId: id as string, userId: memberToRemove })),
      () => setMemberToRemove(null),
      (error: string) => showToast(ToastType.ERROR, error)
    );
  };

  const handlePromoteMember = async () => {
    if (!memberToPromote) return;
    await handleThunk(
      dispatch(updateMemberRoleAction({ groupId: id as string, userId: memberToPromote, role: "admin" })),
      () => setMemberToPromote(null)
    );
  };

  if (groupDetails?.isLoading || !groupDetails?.data) {
    return <GroupSettingsSkeleton />;
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push(`/dashboard/groups/${id}`)}>
          <HiOutlineChevronLeft /> Back to Group
        </button>
        <h1>Group Settings</h1>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Members</h2>
              <p>Manage who has access to this group</p>
            </div>
            <div className={styles.headerActions}>
              <Button variant="outline" size="sm" onClick={() => setIsInviteModalOpen(true)}>
                <HiOutlineUserAdd /> Invite via Email
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsAddMemberModalOpen(true)}>
                <HiOutlineUserAdd /> Add Member
              </Button>
            </div>
          </div>

          <div className={styles.memberList}>
            {members.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                currentUser={user}
                isAdmin={isAdmin}
                onRemove={(userId) => {
                  setMemberToRemove(userId);
                  setIsRemoveModalOpen(true);
                }}
                onPromote={(userId) => {
                  setMemberToPromote(userId);
                  setIsPromoteModalOpen(true);
                }}
              />
            ))}
          </div>
        </section>

        <section className={styles.dangerSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.dangerTitle}>Danger Zone</h2>
              <p>Critical actions for your group participation</p>
            </div>
          </div>
          <div className={styles.dangerActions}>
            <div className={styles.dangerCard}>
              <div className={styles.dangerInfo}>
                <h3>Leave Group</h3>
                <p>Once you leave, you will no longer be able to see expenses or settle balances.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsLeaveModalOpen(true)} className={styles.leaveBtn}>
                <HiOutlineLogout /> Leave Group
              </Button>
            </div>
          </div>
        </section>
      </div>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        groupId={id as string}
        groupName={groupDetails?.data?.name || ""}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        groupId={id as string}
        existingMemberIds={members.map((m) => m.user_id)}
      />

      <ConfirmModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeaveGroup}
        title="Leave Group"
        message={isLastAdmin ? "You are the last admin. Promote someone else first." : "Are you sure you want to leave?"}
        confirmText="Leave"
        confirmVariant="danger"
        confirmDisabled={isLastAdmin}
      />

      <ConfirmModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message="Are you sure you want to remove this member?"
        confirmText="Remove"
        confirmVariant="danger"
      />

      <ConfirmModal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        onConfirm={handlePromoteMember}
        title="Promote to Admin"
        message="Are you sure you want to promote this member?"
        confirmText="Promote"
        confirmVariant="primary"
      />
    </div>
  );
}
