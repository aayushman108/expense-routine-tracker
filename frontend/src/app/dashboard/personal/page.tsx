"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineChevronLeft,
  HiOutlinePlus,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineLightBulb,
  HiOutlineTruck,
  HiOutlineDotsVertical,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserExpenses } from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import ExpenseDetailsModal from "@/components/dashboard/ExpenseForm/ExpenseDetailsModal";
import styles from "./personal.module.scss";
import type { RootState } from "@/store";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { expenses, personalExpenses, isLoading } = useAppSelector(
    (s: RootState) => s.expenses,
  );
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"all" | "personal" | "groups">(
    "all",
  );

  useEffect(() => {
    dispatch(fetchUserExpenses());
  }, [dispatch]);

  // Calculations
  const calculations = useMemo(() => {
    const personal = personalExpenses.reduce(
      (acc, curr) => acc + Number(curr.user_amount || curr.total_amount),
      0,
    );
    const groupOnly = expenses
      .filter((e) => e.group_id)
      .reduce((acc, curr) => acc + Number(curr.user_amount || 0), 0);

    return {
      personal,
      groupOnly,
      total: personal + groupOnly,
    };
  }, [expenses, personalExpenses]);

  // Grouping group expenses by group_name
  const groupedExpenses = useMemo(() => {
    const groups: Record<
      string,
      { name: string; total: number; expenses: any[] }
    > = {};

    expenses
      .filter((e) => e.group_id)
      .forEach((expense) => {
        const gId = expense.group_id as string;
        if (!groups[gId]) {
          groups[gId] = {
            name: expense.group_name || "Unknown Group",
            total: 0,
            expenses: [],
          };
        }
        groups[gId].expenses.push(expense);
        groups[gId].total += Number(expense.user_amount || 0);
      });

    return Object.values(groups);
  }, [expenses]);

  const getCategoryIcon = (desc: string) => {
    const d = (desc || "").toLowerCase();
    if (d.includes("food") || d.includes("eat") || d.includes("grocer"))
      return <HiOutlineShoppingBag />;
    if (d.includes("bill") || d.includes("rent") || d.includes("electric"))
      return <HiOutlineLightBulb />;
    if (d.includes("travel") || d.includes("uber") || d.includes("petrol"))
      return <HiOutlineTruck />;
    return <HiOutlineCurrencyDollar />;
  };

  const renderExpenseItem = (expense: any) => (
    <div
      key={expense.id}
      className={styles.expenseItem}
      onClick={() => setSelectedExpenseId(expense.id)}
    >
      <div className={styles.iconWrap}>
        {getCategoryIcon(expense.description || "")}
      </div>
      <div className={styles.info}>
        <span className={styles.title}>
          {expense.description || "Unnamed Expense"}
        </span>
        <span className={styles.meta}>
          {new Date(expense.expense_date).toLocaleDateString()} •{" "}
          {expense.currency}{" "}
          {expense.group_id ? `• ${expense.group_name}` : "• Personal"}
        </span>
      </div>
      <div className={styles.amount}>
        रू{" "}
        {Number(expense.user_amount || expense.total_amount).toLocaleString()}
      </div>
      <Button variant="ghost" iconOnly>
        <HiOutlineDotsVertical />
      </Button>
    </div>
  );

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
          <h1>
            <span className={styles.icon}>
              <HiOutlineCurrencyDollar />
            </span>
            Personal Ledger
          </h1>
          <p>
            Private workspace for tracking your individual spending and group
            contributions.
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
          >
            <HiOutlinePlus /> Add Expense
          </Button>
        </div>
      </header>

      <div className={styles.summaryCards}>
        <Card gradient>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Grand Total Spent</span>
            <span className={styles.cardValue}>
              रू {calculations.total.toLocaleString()}
            </span>
            <span className={`${styles.cardSub} ${styles.success}`}>
              All personal and group splits
            </span>
          </div>
        </Card>
        <Card>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Personal Spend</span>
            <span className={styles.cardValue}>
              रू {calculations.personal.toLocaleString()}
            </span>
            <div className={styles.progressContainer}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${(calculations.personal / (calculations.total || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </Card>
        <Card>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Group Spend</span>
            <span className={styles.cardValue}>
              रू {calculations.groupOnly.toLocaleString()}
            </span>
            <span className={`${styles.cardSub} ${styles.secondary}`}>
              Total of your shares in groups
            </span>
          </div>
        </Card>
      </div>

      <div className={styles.tabs}>
        <div
          className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Activities
        </div>
        <div
          className={`${styles.tab} ${activeTab === "personal" ? styles.active : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Only
        </div>
        <div
          className={`${styles.tab} ${activeTab === "groups" ? styles.active : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          By Groups
        </div>
      </div>

      <section className={styles.expenseSection}>
        {isLoading ? (
          <div className="py-12 text-center text-secondary opacity-50">
            Loading ledger...
          </div>
        ) : (
          <>
            {(activeTab === "all" || activeTab === "personal") && (
              <div className={styles.groupSection}>
                <div className={styles.groupHeader}>
                  <h3>Personal Expenses</h3>
                  <span className={styles.groupTotal}>
                    रू {calculations.personal.toLocaleString()}
                  </span>
                </div>
                <div className={styles.groupList}>
                  {personalExpenses.length > 0 ? (
                    personalExpenses.map(renderExpenseItem)
                  ) : (
                    <p className={styles.noData}>No personal expenses found.</p>
                  )}
                </div>
              </div>
            )}

            {(activeTab === "all" || activeTab === "groups") &&
              groupedExpenses.map((group) => (
                <div key={group.name} className={styles.groupSection}>
                  <div className={styles.groupHeader}>
                    <h3>{group.name}</h3>
                    <span className={styles.groupTotal}>
                      रू {group.total.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.groupList}>
                    {group.expenses.map(renderExpenseItem)}
                  </div>
                </div>
              ))}

            {expenses.length === 0 && !isLoading && (
              <Card className={styles.emptyState}>
                <p className={styles.emptyText}>
                  You haven&apos;t added any expenses yet.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsExpenseModalOpen(true)}
                >
                  Start Tracking Now
                </Button>
              </Card>
            )}
          </>
        )}
      </section>

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <ExpenseDetailsModal
        isOpen={!!selectedExpenseId}
        onClose={() => setSelectedExpenseId(null)}
        expenseId={selectedExpenseId}
      />
    </div>
  );
}
