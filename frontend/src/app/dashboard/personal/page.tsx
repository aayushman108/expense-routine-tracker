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
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./personal.module.scss";
import type { RootState } from "@/store";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { personalExpenses, isLoading } = useAppSelector(
    (s: RootState) => s.expenses,
  );
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchUserExpenses());
  }, [dispatch]);

  const totalSpent = useMemo(
    () =>
      personalExpenses.reduce(
        (acc: number, curr: any) => acc + Number(curr.total_amount),
        0,
      ),
    [personalExpenses],
  );

  const getCategoryIcon = (desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes("food") || d.includes("eat") || d.includes("grocer"))
      return <HiOutlineShoppingBag />;
    if (d.includes("bill") || d.includes("rent") || d.includes("electric"))
      return <HiOutlineLightBulb />;
    if (d.includes("travel") || d.includes("uber") || d.includes("petrol"))
      return <HiOutlineTruck />;
    return <HiOutlineCurrencyDollar />;
  };

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
            Private workspace for tracking your individual spending and budget.
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
          <div className="flex flex-col gap-1">
            <span className="text-xs text-secondary opacity-70 uppercase font-bold">
              Total Spent
            </span>
            <span className="text-2xl font-bold">
              रू {totalSpent.toLocaleString()}
            </span>
            <span className="text-xs text-success font-semibold">
              ↑ 12% from last month
            </span>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-tertiary uppercase font-bold">
              Monthly Budget
            </span>
            <span className="text-2xl font-bold">रू 50,000</span>
            <div className="w-full h-1 bg-tertiary rounded-full mt-2">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: "65%" }}
              />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-tertiary uppercase font-bold">
              Projected Savings
            </span>
            <span className="text-2xl font-bold">रू 15,200</span>
            <span className="text-xs text-secondary">
              Based on current trajectory
            </span>
          </div>
        </Card>
      </div>

      <section className={styles.expenseSection}>
        <SectionHeader title="Recent Activities" align="between">
          <Button variant="ghost" size="sm">
            Filter By Date
          </Button>
        </SectionHeader>

        <div className={styles.list}>
          {personalExpenses.length > 0 ? (
            personalExpenses.map((expense: any) => (
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
                    {expense.currency}
                  </span>
                </div>
                <div className={styles.amount}>
                  रू {Number(expense.total_amount).toLocaleString()}
                </div>
                <Button variant="ghost" iconOnly>
                  <HiOutlineDotsVertical />
                </Button>
              </div>
            ))
          ) : (
            <Card className="text-center p-16 border-2 border-dashed border-default bg-transparent">
              <p className="text-secondary opacity-50 mb-4">
                You haven&apos;t added any personal expenses yet.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsExpenseModalOpen(true)}
              >
                Start Tracking Now
              </Button>
            </Card>
          )}
        </div>
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
