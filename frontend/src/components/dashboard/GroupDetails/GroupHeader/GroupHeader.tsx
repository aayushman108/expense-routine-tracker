import React from "react";
import styles from "./GroupHeader.module.scss";
import {
  HiOutlineChevronLeft,
  HiOutlineChartPie,
  HiOutlineUserAdd,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineLogout,
} from "react-icons/hi";
import Image from "next/image";
import Button from "@/components/ui/Button/Button";
import type { GroupDetails } from "@/lib/types";

interface GroupHeaderProps {
  groupDetails: { data: GroupDetails | null };
  onBack: () => void;
  onAddExpense: () => void;
  onSettings: () => void;
  onEdit?: () => void;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  groupDetails,
  onBack,
  onAddExpense,
  onSettings,
  onEdit,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <button className={styles.backBtn} onClick={onBack}>
          <HiOutlineChevronLeft /> Back to Dashboard
        </button>
        <div className={styles.groupInfo}>
          <div className={styles.groupImage}>
            {groupDetails?.data?.image?.url ? (
              <Image
                src={groupDetails?.data?.image?.url}
                alt={groupDetails?.data?.name || "Group"}
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <HiOutlineChartPie />
            )}
          </div>
          <div className={styles.textDetails}>
            <div className={styles.titleWithAction}>
              <h1>{groupDetails?.data?.name}</h1>
              {onEdit && (
                <button
                  className={styles.inlineEditBtn}
                  onClick={onEdit}
                  title="Edit Group Details"
                >
                  <HiOutlinePencil />
                </button>
              )}
            </div>
            <p>
              {groupDetails?.data?.description ||
                "Shared expenses for the group."}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Button variant="outline" size="sm" onClick={onSettings}>
          Manage Group
        </Button>
        <Button variant="primary" size="sm" onClick={onAddExpense}>
          <HiOutlinePlus /> Add Expense
        </Button>
      </div>
    </header>
  );
};

export default GroupHeader;
