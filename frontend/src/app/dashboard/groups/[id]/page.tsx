"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  HiOutlineChevronLeft,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineUserAdd,
  HiOutlineCurrencyDollar,
  HiOutlineChartPie,
  HiCheck,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchGroupExpenses, updateExpense } from "@/store/slices/expenseSlice";
import {
  fetchGroupBalances,
  settleBulkAction,
} from "@/store/slices/settlementSlice";
import Button from "@/components/ui/Button/Button";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import ExpenseDetailsModal from "@/components/dashboard/ExpenseForm/ExpenseDetailsModal";
import InviteUserModal from "@/components/dashboard/GroupMembers/InviteUserModal";
import AddMemberModal from "@/components/dashboard/GroupMembers/AddMemberModal";
import BulkSettlementModal from "@/components/dashboard/Settlement/BulkSettlementModal";
import styles from "./group-details.module.scss";
import {
  clearGroupDetails,
  fetchGroupDetailsAction,
} from "@/store/slices/groupSlice";
import { SETTLEMENT_STATUS, EXPENSE_STATUS } from "@expense-tracker/shared";

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

  const { groupBalances, isLoading: balancesLoading } = useAppSelector(
    (s) => s.settlements,
  );

  const { user } = useAppSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState<"expenses" | "settlements">(
    "expenses",
  );
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<any | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchGroupDetailsAction(id as string));
      dispatch(fetchGroupExpenses(id as string));
      dispatch(fetchGroupBalances(id as string));
    }
    return () => {
      dispatch(clearGroupDetails());
    };
  }, [id, dispatch]);

  const handleUpdateStatus = async (expenseId: string, status: string) => {
    try {
      await dispatch(
        updateExpense({
          id: expenseId,
          body: { expense_status: status as any },
        }),
      ).unwrap();
      if (id) dispatch(fetchGroupExpenses(id as string));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleOpenBulkModal = (balance: any) => {
    setSelectedBalance(balance);
    setIsBulkModalOpen(true);
  };

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

  const netPosition = useMemo(() => {
    if (!user) return 0;
    let owedToMe = 0;
    let iOwe = 0;

    groupBalances.forEach((bal) => {
      if (bal.to_user_id === user.id) {
        owedToMe += Number(bal.total_amount);
      }
      if (bal.from_user_id === user.id) {
        iOwe += Number(bal.total_amount);
      }
    });

    return owedToMe - iOwe;
  }, [groupBalances, user]);

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
              Settlements
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
                    <div
                      key={expense.id}
                      className={styles.expenseCard}
                      onClick={() => setSelectedExpenseId(expense.id)}
                    >
                      <div className={styles.date}>
                        <span className={styles.day}>{day}</span>
                        <span className={styles.month}>{month}</span>
                      </div>
                      <div className={styles.info}>
                        <div className={styles.desc}>
                          <span className={styles.titleText}>
                            {expense.description}
                          </span>
                          <div className={styles.tagsRow}>
                            <span
                              className={`${styles.tag} ${styles[expense.expense_status]}`}
                            >
                              STATUS - {expense.expense_status.toUpperCase()}
                            </span>
                            {expense.expense_status === "verified" &&
                              expense.settlement_status && (
                                <span
                                  className={`${styles.tag} ${styles[expense.settlement_status]}`}
                                >
                                  SETTLEMENT -{" "}
                                  {expense.settlement_status === "personal"
                                    ? "PRIVATE"
                                    : expense.settlement_status.toUpperCase()}
                                </span>
                              )}
                            {expense.expense_status === "draft" && (
                              <button
                                className={styles.inlineSubmitBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(expense.id, "submitted");
                                }}
                              >
                                Submit Expense
                              </button>
                            )}
                          </div>
                        </div>
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
                            <span>
                              {expense.payer?.full_name ||
                                expense.payer_name ||
                                "Member"}
                            </span>
                          )}{" "}
                          paid{" "}
                          <span
                            style={{
                              fontWeight: 600,
                              color: "var(--color-primary)",
                            }}
                          >
                            {expense.currency}{" "}
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
              {balancesLoading ? (
                <div className={styles.loaderContainer}>
                  Loading balances...
                </div>
              ) : groupBalances.length > 0 ? (
                groupBalances.map((balance: any, index: number) => {
                  const currentUserId = user?.id?.toLowerCase();
                  const fromUserId = balance.from_user_id?.toLowerCase();
                  const toUserId = balance.to_user_id?.toLowerCase();

                  const isFromUser = fromUserId === currentUserId;
                  const isToUser = toUserId === currentUserId;

                  return (
                    <div
                      key={`balance-${index}`}
                      className={styles.settlementCard}
                    >
                      <div className={styles.party}>
                        <div className={styles.label}>OWES</div>
                        <div className={styles.name}>
                          {isFromUser ? "You" : balance.from_user_name}
                        </div>
                      </div>
                      <span className={styles.arrow}>
                        <HiOutlineArrowRight />
                      </span>
                      <div className={styles.party}>
                        <div className={styles.label}>TO</div>
                        <div className={styles.name}>
                          {isToUser ? "You" : balance.to_user_name}
                        </div>
                      </div>
                      <div className={styles.amountWrap}>
                        {/* DEBUG INFO: Remove later */}
                        {/* <div style={{fontSize: '8px', opacity: 0.5}}>ME: {user?.id.slice(0,8)} | T: {balance.to_user_id.slice(0,8)} | F: {balance.from_user_id.slice(0,8)}</div> */}
                        <div className={styles.amount}>
                          रू {Number(balance.total_amount).toLocaleString()}
                        </div>
                        {balance.status === SETTLEMENT_STATUS.PAID ? (
                          isToUser ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenBulkModal(balance)}
                            >
                              Verify
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              Awaiting Conf.
                            </Button>
                          )
                        ) : (
                          <>
                            {isFromUser ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenBulkModal(balance)}
                              >
                                Settle All
                              </Button>
                            ) : isToUser ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenBulkModal(balance)}
                              >
                                Mark as Received
                              </Button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyStateCard}>
                  <div className={styles.icon}>
                    <HiCheck />
                  </div>
                  <p className={styles.title}>All settled up!</p>
                  <p className={styles.subtext}>
                    No pending settlements for this group at the moment.
                  </p>
                </div>
              )}
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
                <span className={styles.statLabel}>Your Net Balance</span>
                <span
                  className={`${styles.statValue} ${
                    netPosition > 0
                      ? styles.success
                      : netPosition < 0
                        ? styles.danger
                        : ""
                  }`}
                >
                  {netPosition > 0 ? "+" : ""} रू {netPosition.toLocaleString()}
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
                          alt={member.user?.full_name}
                        />
                      ) : (
                        getInitials(member.user?.full_name)
                      )}
                    </div>
                    <div className={styles.details}>
                      <div className={styles.name}>
                        {member.user?.full_name}
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

      <ExpenseDetailsModal
        isOpen={!!selectedExpenseId}
        onClose={() => setSelectedExpenseId(null)}
        expenseId={selectedExpenseId}
      />

      <BulkSettlementModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        groupId={id as string}
        balance={selectedBalance}
      />
    </div>
  );
}
