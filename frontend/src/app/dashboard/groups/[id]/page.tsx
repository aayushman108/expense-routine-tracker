"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  HiOutlineChevronLeft,
  HiOutlinePlus,
  HiOutlineDotsVertical,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineUserAdd,
  HiOutlineCurrencyDollar,
  HiOutlineChartPie,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchGroupExpenses } from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import InviteUserModal from "@/components/dashboard/GroupMembers/InviteUserModal";
import AddMemberModal from "@/components/dashboard/GroupMembers/AddMemberModal";
import styles from "./group-details.module.scss";
import {
  clearGroupDetails,
  fetchGroupDetailsAction,
} from "@/store/slices/groupSlice";
import type { GroupMember } from "@/lib/types";

export default function GroupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { groupDetails, isLoading: groupLoading } = useAppSelector(
    (s) => s.groups,
  );

  const { groupExpenses, isLoading: expensesLoading } = useAppSelector(
    (s) => s.expenses,
  );
  const { user } = useAppSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState<"expenses" | "settlements">(
    "expenses",
  );
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchGroupDetailsAction(id as string));
      dispatch(fetchGroupExpenses(id as string));
    }
    return () => {
      dispatch(clearGroupDetails());
    };
  }, [id, dispatch]);

  const members = useMemo(
    () => groupDetails?.data?.members || [],
    [groupDetails],
  );

  const totalGroupSpend = useMemo(() => {
    return groupExpenses.reduce(
      (acc, curr) => acc + Number(curr.total_amount),
      0,
    );
  }, [groupExpenses]);

  const myContribution = useMemo(() => {
    if (!user) return 0;
    return groupExpenses
      .filter((e) => e.paid_by === user.id)
      .reduce((acc, curr) => acc + Number(curr.total_amount), 0);
  }, [groupExpenses, user]);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
    };
  };

  if (groupLoading) {
    return (
      <div className={styles.loaderContainer}>Loading group details...</div>
    );
  }

  if (!groupDetails?.data) {
    return (
      <div className={styles.notFoundContainer}>
        <p>Group not found.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

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
          <div className={styles.groupInfo}>
            <div className={styles.groupImage}>
              {groupDetails.data.image?.url ? (
                <img
                  src={groupDetails.data.image.url}
                  alt={groupDetails.data.name}
                />
              ) : (
                <HiOutlineChartPie />
              )}
            </div>
            <div>
              <h1>{groupDetails.data.name}</h1>
              <p>
                {groupDetails.data.description ||
                  "Shared expenses for the group."}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <HiOutlineUserAdd /> Invite
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
          >
            <HiOutlinePlus /> Add Expense
          </Button>
        </div>
      </header>

      <div className={styles.contentGrid}>
        <main className={styles.mainColumn}>
          <div className={styles.tabHeader}>
            <div
              className={`${styles.tab} ${activeTab === "expenses" ? styles.active : ""}`}
              onClick={() => setActiveTab("expenses")}
            >
              Expenses
            </div>
            <div
              className={`${styles.tab} ${activeTab === "settlements" ? styles.active : ""}`}
              onClick={() => setActiveTab("settlements")}
            >
              Monthly Settlements
            </div>
          </div>

          {activeTab === "expenses" ? (
            <div className={styles.expenseList}>
              {expensesLoading ? (
                <div className={styles.loaderContainer}>
                  Loading expenses...
                </div>
              ) : groupExpenses.length > 0 ? (
                groupExpenses.map((expense: any) => {
                  const { day, month } = formatDate(expense.expense_date);
                  const isPayer = expense.paid_by === user?.id;

                  return (
                    <div key={expense.id} className={styles.expenseCard}>
                      <div className={styles.date}>
                        <span className={styles.day}>{day}</span>
                        <span className={styles.month}>{month}</span>
                      </div>
                      <div className={styles.info}>
                        <div className={styles.desc}>{expense.description}</div>
                        <div className={styles.payer}>
                          {isPayer ? (
                            <span
                              style={{
                                color: "var(--color-primary)",
                                fontWeight: 500,
                              }}
                            >
                              You
                            </span>
                          ) : (
                            <span>{expense.payer?.fullName || "Member"}</span>
                          )}{" "}
                          paid{" "}
                          <span
                            style={{
                              fontWeight: 600,
                              color: "var(--color-primary)",
                            }}
                          >
                            {Number(expense.total_amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.amount}>
                        <div className={styles.value}>
                          {expense.currency}{" "}
                          {Number(expense.total_amount).toLocaleString()}
                        </div>
                        <div className={styles.status}>
                          {expense.splits?.length
                            ? `Split by ${expense.splits.length}`
                            : "Unsplit"}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyStateCard}>
                  <div className={styles.icon}>
                    <HiOutlineCurrencyDollar />
                  </div>
                  <p className={styles.title}>No expenses yet</p>
                  <p className={styles.subtext}>
                    Start tracking your group spending.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsExpenseModalOpen(true)}
                  >
                    Log First Expense
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.settlements}>
              {/* Dummy Data for Settlements - to be implemented */}
              <div className="mb-6">
                <h4 className="text-xs font-bold mb-4 text-tertiary uppercase tracking-wider flex items-center gap-2">
                  January 2026
                </h4>
                <div className={styles.settlementCard}>
                  <div className={styles.party}>
                    <div className={styles.label}>OWES</div>
                    <div className={styles.name}>Anil Sharma</div>
                  </div>
                  <span className={styles.arrow}>
                    <HiOutlineArrowRight />
                  </span>
                  <div className={styles.party}>
                    <div className={styles.label}>TO</div>
                    <div className={styles.name}>Aayushman</div>
                  </div>
                  <div className={styles.amountWrap}>
                    <div className={styles.amount}>रू 4,500</div>
                    <Button variant="primary" size="sm">
                      Pay Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <aside className={styles.sidebarColumn}>
          {/* Stats Section */}
          <section className={styles.sidebarSection}>
            <h3>Group Overview</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div className={styles.statsRow}>
                <span className={styles.statLabel}>Total Spending</span>
                <span className={styles.statValue}>
                  रू {totalGroupSpend.toLocaleString()}
                </span>
              </div>
              <div className={styles.statsRow}>
                <span className={styles.statLabel}>Your Share</span>
                <span className={`${styles.statValue} ${styles.success}`}>
                  रू {myContribution.toLocaleString()}
                </span>
              </div>
              <div className={styles.createdInfo}>
                <span className={styles.label}>Created</span>
                <span className={styles.value}>
                  {formatDate(groupDetails.data.created_at).month}{" "}
                  {formatDate(groupDetails.data.created_at).day},{" "}
                  {formatDate(groupDetails.data.created_at).year}
                </span>
              </div>
            </div>
          </section>

          {/* Members Section */}
          <section className={styles.sidebarSection}>
            <h3>
              Members{" "}
              <span className={styles.memberCount}>({members.length})</span>
            </h3>
            <div className={styles.memberList}>
              {members.map((member: GroupMember) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberInfo}>
                    <div className={styles.avatar}>
                      {member.user?.avatar?.url ? (
                        <img
                          src={member.user.avatar.url}
                          alt={member.user?.fullName}
                        />
                      ) : (
                        getInitials(member.user?.fullName)
                      )}
                    </div>
                    <div className={styles.details}>
                      <div className={styles.name}>
                        {member.user?.fullName}
                        {user?.id === member.user?.id && (
                          <span
                            style={{
                              color: "var(--color-primary)",
                              fontSize: "0.75rem",
                              marginLeft: "0.25rem",
                            }}
                          >
                            (You)
                          </span>
                        )}
                      </div>
                      <div className={styles.role}>{member.role}</div>
                    </div>
                  </div>
                  {/* Future: Net Balance for each member */}
                </div>
              ))}
            </div>
            <div className={styles.sidebarBtnWrapper}>
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                <span
                  style={{
                    marginRight: "0.25rem",
                    fontSize: "1.125rem",
                    display: "flex",
                  }}
                >
                  <HiOutlineUserAdd />
                </span>{" "}
                Add Member
              </Button>
            </div>
          </section>
        </aside>
      </div>

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        groupId={id as string}
      />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        groupId={id as string}
        groupName={groupDetails.data.name}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        groupId={id as string}
        existingMemberIds={members.map((m: GroupMember) => m.user_id)}
      />
    </div>
  );
}
