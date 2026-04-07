"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiPlus,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { FiUsers } from "react-icons/fi";
import { Expense, Group } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyGroupsAction } from "@/store/slices/groupSlice";
import { fetchUserExpenses } from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import CreateGroupModal from "@/components/dashboard/GroupModals/CreateGroupModal";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./dashboard.module.scss";
import type { RootState } from "@/store";
import {
  EXPENSE_TYPE,
  SETTLEMENT_STATUS,
  EXPENSE_STATUS,
} from "@expense-tracker/shared";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { groups, isLoading: groupsLoading } = useAppSelector(
    (s: RootState) => s.groups,
  );
  const { expenses } = useAppSelector(
    (s: RootState) => s.expenses,
  );
  const { user } = useAppSelector((s: RootState) => s.auth);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyGroupsAction());
    dispatch(fetchUserExpenses());
  }, [dispatch]);

  const totalSpent = expenses
    .filter(
      (e) =>
        e.expense_type === EXPENSE_TYPE.PERSONAL ||
        e.expense_status === EXPENSE_STATUS.VERIFIED,
    )
    .reduce(
      (acc: number, curr: Expense) =>
        acc + Number(curr.user_amount || curr.total_amount),
      0,
    );

  const owedToYou = expenses.reduce((total, exp) => {
    if (
      exp.expense_type !== EXPENSE_TYPE.GROUP ||
      !exp.splits ||
      exp.expense_status !== EXPENSE_STATUS.VERIFIED
    )
      return total;
    // If I'm the payer, others' pending splits are owed to me
    if (exp.paid_by === user?.id) {
      return (
        total +
        exp.splits
          .filter(
            (s) =>
              s.user?.id !== user?.id &&
              s.settlement?.status === SETTLEMENT_STATUS.PENDING,
          )
          .reduce((sum, s) => sum + Number(s.split_amount), 0)
      );
    }
    return total;
  }, 0);

  const youOwe = expenses.reduce((total, exp) => {
    if (
      exp.expense_type !== EXPENSE_TYPE.GROUP ||
      !exp.splits ||
      exp.expense_status !== EXPENSE_STATUS.VERIFIED
    )
      return total;
    // If I'm NOT the payer, my pending split is what I owe
    if (exp.paid_by !== user?.id) {
      return (
        total +
        exp.splits
          .filter(
            (s) =>
              s.user?.id === user?.id &&
              s.settlement?.status === SETTLEMENT_STATUS.PENDING,
          )
          .reduce((sum, s) => sum + Number(s.split_amount), 0)
      );
    }
    return total;
  }, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyPersonalSpend = expenses
    .filter((e) => {
      const d = new Date(e.expense_date);
      return (
        e.expense_type === EXPENSE_TYPE.PERSONAL &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((acc, curr) => acc + Number(curr.total_amount), 0);

  const netBalance = owedToYou - youOwe;

  const stats = [
    {
      label: "Total Expenses",
      value: `रू ${totalSpent.toLocaleString()}`,
      icon: <HiOutlineCurrencyDollar />,
      color: "blue",
    },
    {
      label: "Active Groups",
      value: groups?.totalGroups || 0,
      icon: <HiOutlineUserGroup />,
      color: "green",
    },
    {
      label: "Owed to You",
      value: `रू ${owedToYou.toLocaleString()}`,
      icon: <HiOutlineTrendingUp />,
      color: "orange",
    },
    {
      label: "You Owe",
      value: `रू ${youOwe.toLocaleString()}`,
      icon: <HiOutlineTrendingDown />,
      color: "red",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <section className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} className={`${styles.statCard} ${styles[stat.color]}`}>
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
        <SectionHeader title="Personal Tracking" align="between" fullWidth>
          <Link href="/dashboard/personal">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </SectionHeader>

        <div className={styles.personalTrackerGrid}>
          <Card
            clickable
            onClick={() => setIsExpenseModalOpen(true)}
            className={styles.featuredPersonalCard}
            gradient
            glass
          >
            <div className={styles.banner}>
              <div className={styles.iconGlow}>
                <HiOutlineCurrencyDollar />
              </div>
              <div className={styles.titleInfo}>
                <h3>Private Ledger</h3>
                <span className={styles.typeTag}>Only You</span>
              </div>
            </div>

            <div className={styles.mainStats}>
              <div className={styles.statItem}>
                <label>Monthly Spend</label>
                <div className={styles.amountWrap}>
                  <span className={styles.currency}>रू</span>
                  <span className={styles.val}>
                    {monthlyPersonalSpend.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className={styles.statItem}>
                <label>Lifetime Total</label>
                <div className={styles.amountWrap}>
                  <span className={styles.currency}>रू</span>
                  <span className={styles.val}>
                    {totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.miniFooter}>
              <p className={styles.hint}>
                Track your savings, bills, and individual lifestyle costs with
                end-to-end privacy.
              </p>
              <div className={styles.btnGroup}>
                <Button variant="primary" size="sm" className={styles["btn-quick-add"]}>
                  <HiPlus /> Quick Add
                </Button>
                <Link href="/dashboard/personal" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className={styles["btn-ledger"]}>
                    View Full Ledger
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className={styles.summaryBox}>
             <div className={styles.summaryHeader}>
                <div className={styles.trendIcon}>
                  <HiOutlineTrendingUp />
                </div>
                <h4>Financial Health</h4>
             </div>
             <div className={styles.summaryDesc}>
                You have <strong>रू {owedToYou.toLocaleString()}</strong> to receive from friends and <strong>रू {youOwe.toLocaleString()}</strong> left to pay back.
             </div>

             <div className={styles.netBalanceBox}>
                <label>Net Balance</label>
                <div className={`${styles.netVal} ${netBalance >= 0 ? styles.positive : styles.negative}`}>
                  {netBalance >= 0 ? "+" : "-"} रू {Math.abs(netBalance).toLocaleString()}
                </div>
             </div>

             <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                   <div 
                     className={styles.progress} 
                     style={{ width: `${(owedToYou / (owedToYou + youOwe || 1)) * 100}%` }}
                   />
                </div>
                <div className={styles.progressLabels}>
                   <span>Receivable</span>
                   <span>Payable</span>
                </div>
             </div>
          </Card>
        </div>
      </section>

      <section>
        <SectionHeader title="Shared Groups" align="between" fullWidth>
          <div className={styles.actions}>
            <Link href="/dashboard/groups">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsGroupModalOpen(true)}
            >
              <HiPlus /> Create Group
            </Button>
          </div>
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
        ) : groups?.totalGroups > 0 ? (
          <div className={styles.grid}>
            {groups?.data?.map((group: Group) => (
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
        expenseType={EXPENSE_TYPE.PERSONAL}
      />
    </div>
  );
}
