"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  HiOutlineChevronLeft,
  HiOutlinePlus,
  HiOutlineDotsVertical,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineUserAdd,
} from "react-icons/hi";
import { FiUsers } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchGroupDetails,
  clearCurrentGroup,
} from "@/store/slices/groupSlice";
import { fetchGroupExpenses } from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import styles from "./group-details.module.scss";
import type { RootState } from "@/store";

export default function GroupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    currentGroup,
    members,
    isLoading: groupLoading,
  } = useAppSelector((s) => s.groups);
  const { groupExpenses, isLoading: expensesLoading } = useAppSelector(
    (s) => s.expenses,
  );
  const { user } = useAppSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState<"expenses" | "settlements">(
    "expenses",
  );
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchGroupDetails(id as string));
      dispatch(fetchGroupExpenses(id as string));
    }
    return () => {
      dispatch(clearCurrentGroup());
    };
  }, [id, dispatch]);

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
    };
  };

  if (groupLoading) {
    return <div className="p-10 text-center">Loading group details...</div>;
  }

  if (!currentGroup) {
    return <div className="p-10 text-center">Group not found.</div>;
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
          <h1>{currentGroup.name}</h1>
          <p>{currentGroup.description || "Shared expenses for the group."}</p>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" size="sm">
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
              {groupExpenses.length > 0 ? (
                groupExpenses.map((expense: any) => {
                  const { day, month } = formatDate(expense.expense_date);
                  return (
                    <div key={expense.id} className={styles.expenseCard}>
                      <div className={styles.date}>
                        <span className={styles.day}>{day}</span>
                        <span className={styles.month}>{month}</span>
                      </div>
                      <div className={styles.info}>
                        <div className={styles.desc}>{expense.description}</div>
                        <div className={styles.payer}>
                          Paid by{" "}
                          <span>{expense.payer?.full_name || "Member"}</span>
                        </div>
                      </div>
                      <div className={styles.amount}>
                        <div className={styles.value}>
                          रू {Number(expense.total_amount).toLocaleString()}
                        </div>
                        <div className={styles.status}>
                          Split between {expense.splits?.length || 0}
                        </div>
                      </div>
                      <div className={styles.menu}>
                        <HiOutlineDotsVertical />
                      </div>
                    </div>
                  );
                })
              ) : (
                <Card className="text-center p-10">
                  <span
                    style={{
                      fontSize: "3rem",
                      opacity: 0.2,
                      marginBottom: "1rem",
                      display: "block",
                    }}
                  >
                    <HiOutlineCalendar />
                  </span>
                  <p>No expenses recorded yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsExpenseModalOpen(true)}
                  >
                    Log First Expense
                  </Button>
                </Card>
              )}
            </div>
          ) : (
            <div className={styles.settlements}>
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3 text-tertiary uppercase tracking-wider">
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
                <div className={styles.settlementCard}>
                  <div className={styles.party}>
                    <div className={styles.label}>OWES</div>
                    <div className={styles.name}>
                      Me ({user?.nickname || user?.full_name})
                    </div>
                  </div>
                  <span className={styles.arrow}>
                    <HiOutlineArrowRight />
                  </span>
                  <div className={styles.party}>
                    <div className={styles.label}>TO</div>
                    <div className={styles.name}>Sita Thapa</div>
                  </div>
                  <div className={styles.amountWrap}>
                    <div className={styles.amount}>रू 1,200</div>
                    <span className="text-xs text-secondary italic">
                      Awaiting Payment
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <aside className={styles.sidebarColumn}>
          <section className={styles.sidebarSection}>
            <h3>
              Members
              <span className="cursor-pointer hover:text-primary transition">
                <HiOutlineUserAdd />
              </span>
            </h3>
            <div className={styles.memberList}>
              {members.map((member: any) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberInfo}>
                    <div className={styles.avatar}>
                      {member.user?.avatar?.url ? (
                        <img
                          src={member.user.avatar.url}
                          alt={member.user.full_name}
                        />
                      ) : (
                        getInitials(member.user?.full_name)
                      )}
                    </div>
                    <div className={styles.details}>
                      <div className={styles.name}>
                        {member.user?.full_name}
                      </div>
                      <div className={styles.role}>{member.role}</div>
                    </div>
                  </div>
                  <div className={styles.balance}>
                    <div
                      className={`${styles.value} ${member.id % 2 === 0 ? styles.positive : styles.negative}`}
                    >
                      {member.id % 2 === 0 ? "+" : "-"}रू{" "}
                      {(Math.random() * 5000).toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sidebarSection}>
            <h3>Group Stats</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">
                  Total Group Spend
                </span>
                <span className="font-bold">रू 1,42,800</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">
                  Your Contribution
                </span>
                <span className="font-bold text-success">रू 45,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Last Settlement</span>
                <span className="text-sm">Dec 15, 2025</span>
              </div>
            </div>
            <Button variant="outline" fullWidth className="mt-6">
              View Analytics
            </Button>
          </section>
        </aside>
      </div>

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        groupId={id as string}
      />
    </div>
  );
}
