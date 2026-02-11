"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiPlus,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { FiUsers } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyGroups } from "@/store/slices/groupSlice";
import { fetchUserExpenses } from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import CreateGroupModal from "@/components/dashboard/GroupModals/CreateGroupModal";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./dashboard.module.scss";
import type { RootState } from "@/store";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { groups, isLoading: groupsLoading } = useAppSelector(
    (s: RootState) => s.groups,
  );
  const { expenses, isLoading: expensesLoading } = useAppSelector(
    (s: RootState) => s.expenses,
  );
  const { user } = useAppSelector((s: RootState) => s.auth);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyGroups());
    dispatch(fetchUserExpenses());
  }, [dispatch]);

  const totalSpent = expenses.reduce(
    (acc: number, curr: any) => acc + Number(curr.total_amount),
    0,
  );
  const totalGroups = groups.length;

  const stats = [
    {
      label: "Total Expenses",
      value: `रू ${totalSpent.toLocaleString()}`,
      icon: <HiOutlineCurrencyDollar />,
      color: "blue",
    },
    {
      label: "Active Groups",
      value: totalGroups,
      icon: <HiOutlineUserGroup />,
      color: "green",
    },
    {
      label: "Owed to You",
      value: "रू 12,450",
      icon: <HiOutlineTrendingUp />,
      color: "orange",
    },
    {
      label: "You Owe",
      value: "रू 3,200",
      icon: <HiOutlineTrendingDown />,
      color: "red",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <section className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles[stat.color]}`}>
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          </div>
        ))}
      </section>

      <section>
        <SectionHeader title="Personal Tracking" align="between">
          <Link href="/dashboard/personal">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </SectionHeader>

        <div className={styles.grid}>
          <Card
            clickable
            onClick={() => setIsExpenseModalOpen(true)}
            className={styles.groupCard}
          >
            <div className={styles.image}>
              <HiOutlineCurrencyDollar />
            </div>
            <div className={styles.details}>
              <div className={styles.top}>
                <span className={styles.name}>Private Ledger</span>
                <span className={styles.badge}>Private</span>
              </div>
              <p className={styles.desc}>
                Track your private expenses, savings, and personal budget.
              </p>
            </div>
            <div className={styles.footer}>
              <span>Last updated: Recently</span>
              <span className={styles.members}>
                <FiUsers /> Only You
              </span>
            </div>
          </Card>
        </div>
      </section>

      <section>
        <SectionHeader title="Shared Groups" align="between">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGroupModalOpen(true)}
          >
            <HiPlus /> Create Group
          </Button>
        </SectionHeader>

        {groupsLoading ? (
          <div className={styles.grid}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={styles.groupCard}
                style={{ background: "var(--bg-tertiary)", height: "280px" }}
              ></div>
            ))}
          </div>
        ) : groups.length > 0 ? (
          <div className={styles.grid}>
            {groups.map((group: any) => (
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
                <div className={styles.details}>
                  <div className={styles.top}>
                    <span className={styles.name}>{group.name}</span>
                    {group.created_by === user?.id && (
                      <span className={styles.badge}>Admin</span>
                    )}
                  </div>
                  <p className={styles.desc}>
                    {group.description || "No description provided."}
                  </p>
                </div>
                <div className={styles.footer}>
                  <span>
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </span>
                  <span className={styles.members}>
                    <FiUsers /> {group.member_count || 1}{" "}
                    {group.member_count === 1 ? "Member" : "Members"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span>
              <HiOutlineUserGroup />
            </span>
            <h3>No groups yet</h3>
            <p>
              Create a group to start splitting expenses with friends, family,
              or colleagues.
            </p>
            <Button variant="primary" onClick={() => setIsGroupModalOpen(true)}>
              Create Your First Group
            </Button>
          </div>
        )}
      </section>

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </div>
  );
}
