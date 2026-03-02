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
  HiOutlineUserCircle,
  HiOutlineChartBar,
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserExpenses, updateExpense } from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import ExpenseDetailsModal from "@/components/dashboard/ExpenseForm/ExpenseDetailsModal";
import styles from "./personal.module.scss";
import type { RootState } from "@/store";
import {
  EXPENSE_TYPE,
  EXPENSE_STATUS,
  SETTLEMENT_STATUS,
} from "@expense-tracker/shared";

const STATUS_PREFIX = "Status -";

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
  const { user } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchUserExpenses());
  }, [dispatch]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await dispatch(
        updateExpense({ id, body: { expenseStatus: status as any } }),
      ).unwrap();
      dispatch(fetchUserExpenses());
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const groupedSummaries = useMemo(() => {
    const groups: Record<
      string,
      {
        id: string;
        name: string;
        totalGroupSpend: number;
        myTotalShare: number;
        iOweOthers: number;
        othersOweMe: number;
        expenses: any[];
      }
    > = {};

    expenses
      .filter(
        (e) =>
          e.expense_type === EXPENSE_TYPE.GROUP &&
          e.expense_status === EXPENSE_STATUS.VERIFIED,
      )
      .forEach((expense) => {
        const gId = expense.group_id as string;
        if (!groups[gId]) {
          groups[gId] = {
            id: gId,
            name: expense.group_name || "Unknown Group",
            totalGroupSpend: 0,
            myTotalShare: 0,
            iOweOthers: 0,
            othersOweMe: 0,
            expenses: [],
          };
        }

        groups[gId].expenses.push(expense);
        groups[gId].totalGroupSpend += Number(expense.total_amount || 0);

        // Find my share in this expense
        const mySplit = expense.splits?.find(
          (s: any) => s.user.id === user?.id || s.user_id === user?.id,
        );
        const myShare = Number(mySplit?.split_amount || 0);
        groups[gId].myTotalShare += myShare;

        const totalPaidByMe = Number(expense.total_paid_by_me || 0);
        const totalReceivedByMe = Number(expense.total_received_by_me || 0);

        if (expense.paid_by === user?.id) {
          // Others owe me = (total_amount - my_share) - total_received_by_me
          const othersOwe =
            Number(expense.total_amount) - myShare - totalReceivedByMe;
          groups[gId].othersOweMe += Math.max(0, othersOwe);
        } else {
          // I owe = my_share - total_paid_by_me
          const iOwe = myShare - totalPaidByMe;
          groups[gId].iOweOthers += Math.max(0, iOwe);
        }
      });

    return Object.values(groups);
  }, [expenses, user]);

  // Calculations depends on groupedSummaries
  const calculations = useMemo(() => {
    const personal = personalExpenses
      .filter((e) => e.expense_status === EXPENSE_STATUS.VERIFIED)
      .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

    const actualGroupSpend = expenses
      .filter(
        (e) =>
          e.expense_type === EXPENSE_TYPE.GROUP &&
          e.expense_status === EXPENSE_STATUS.VERIFIED,
      )
      .reduce((acc, curr) => {
        const mySplit = curr.splits?.find(
          (s: any) => s.user.id === user?.id || s.user_id === user?.id,
        );
        const myShare = Number(mySplit?.split_amount || 0);

        if (curr.paid_by === user?.id) {
          // If I paid, my share is effectively spent cash
          return acc + myShare;
        } else {
          // If somebody else paid, I only count what I've actually settled/paid back
          return acc + Number(curr.total_paid_by_me || 0);
        }
      }, 0);

    const settlementsReceived = expenses.reduce(
      (acc, curr) => acc + Number(curr.total_received_by_me || 0),
      0,
    );
    const settlementsPaid = expenses.reduce(
      (acc, curr) => acc + Number(curr.total_paid_by_me || 0),
      0,
    );

    const totalIOwe = groupedSummaries.reduce(
      (acc, g) => acc + g.iOweOthers,
      0,
    );
    const totalOthersOweMe = groupedSummaries.reduce(
      (acc, g) => acc + g.othersOweMe,
      0,
    );

    return {
      personal,
      groupOnly: actualGroupSpend,
      total: personal + actualGroupSpend,
      settlementsReceived,
      settlementsPaid,
      totalIOwe,
      totalOthersOweMe,
    };
  }, [expenses, personalExpenses, user, groupedSummaries]);

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

  const renderExpenseItem = (expense: any) => {
    const mySplit = expense.splits?.find(
      (s: any) => s.user.id === user?.id || s.user_id === user?.id,
    );
    const amountToShow =
      expense.expense_type === EXPENSE_TYPE.GROUP
        ? mySplit?.split_amount || 0
        : expense.total_amount;

    return (
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
          <div className={styles.tagsRow}>
            <span className={`${styles.tag} ${styles[expense.expense_status]}`}>
              STATUS - {expense.expense_status.toUpperCase()}
            </span>
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
          <span className={styles.meta}>
            {new Date(expense.expense_date).toLocaleDateString()} •{" "}
            {expense.currency}{" "}
            {expense.expense_type === EXPENSE_TYPE.GROUP
              ? `• ${expense.group_name}`
              : "• Personal"}
          </span>
        </div>
        <div className={styles.amount}>
          रू {Number(amountToShow).toLocaleString()}
        </div>
        <Button variant="ghost" iconOnly>
          <HiOutlineDotsVertical />
        </Button>
      </div>
    );
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
            <span className={styles.cardLabel}>Lifetime Spend</span>
            <span className={styles.cardValue}>
              रू {calculations.total.toLocaleString()}
            </span>
            <span className={`${styles.cardSub} ${styles.success}`}>
              Personal + All Group Shares
            </span>
          </div>
        </Card>
        <Card>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Personal Spend</span>
            <span className={styles.cardValue}>
              रू {calculations.personal.toLocaleString()}
            </span>
            <span className={`${styles.cardSub} ${styles.secondary}`}>
              Non-group expenses
            </span>
          </div>
        </Card>
        <Card>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Remaining to Pay</span>
            <span className={styles.cardValue}>
              रू {calculations.totalIOwe.toLocaleString()}
            </span>
            <span
              className={`${styles.cardSub} ${calculations.totalIOwe > 0 ? styles.danger : styles.secondary}`}
            >
              Total outstanding in groups
            </span>
          </div>
        </Card>
        <Card>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>To Receive</span>
            <span className={styles.cardValue}>
              रू {calculations.totalOthersOweMe.toLocaleString()}
            </span>
            <span
              className={`${styles.cardSub} ${calculations.totalOthersOweMe > 0 ? styles.success : styles.secondary}`}
            >
              Others owe you
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

            {activeTab === "all" && (
              <>
                {groupedSummaries.length > 0 && (
                  <div className={styles.groupSection}>
                    <div className={styles.groupHeader}>
                      <h3>Group Summaries</h3>
                    </div>
                    <div
                      className={styles.groupSummaryGrid}
                      style={{ marginTop: "1rem" }}
                    >
                      {groupedSummaries.map((group) => (
                        <div key={group.id} className={styles.groupSummaryCard}>
                          <div className={styles.cardHeader}>
                            <div className={styles.groupInfoContainer}>
                              <span className={styles.groupLabel}>
                                Individual Summary
                              </span>
                              <h4 className={styles.groupName}>{group.name}</h4>
                            </div>
                            <div className={styles.groupIconWrap}>
                              <HiOutlineShoppingBag />
                            </div>
                          </div>
                          <div className={styles.statsContainer}>
                            <div className={styles.statsGrid}>
                              <div className={styles.statItem}>
                                <div className={styles.statLabel}>
                                  <HiOutlineShoppingBag /> Group Spend
                                </div>
                                <div className={styles.statValue}>
                                  रू {group.totalGroupSpend.toLocaleString()}
                                </div>
                              </div>
                              <div className={styles.statItem}>
                                <div className={styles.statLabel}>
                                  <HiOutlineChartBar /> My Share
                                </div>
                                <div
                                  className={`${styles.statValue} ${styles.highlight}`}
                                >
                                  रू {group.myTotalShare.toLocaleString()}
                                </div>
                              </div>
                              <div className={styles.statItem}>
                                <div className={styles.statLabel}>
                                  <HiOutlineArrowNarrowDown /> Remaining to Pay
                                </div>
                                <div
                                  className={`${styles.statValue} ${group.iOweOthers > 0 ? styles.danger : ""}`}
                                >
                                  रू {group.iOweOthers.toLocaleString()}
                                </div>
                              </div>
                              <div className={styles.statItem}>
                                <div className={styles.statLabel}>
                                  <HiOutlineArrowNarrowUp /> Remaining to
                                  Receive
                                </div>
                                <div
                                  className={`${styles.statValue} ${group.othersOweMe > 0 ? styles.success : ""}`}
                                >
                                  रू {group.othersOweMe.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "groups" && (
              <div className={styles.groupSummaryGrid}>
                {groupedSummaries.length > 0 ? (
                  groupedSummaries.map((group) => (
                    <div key={group.id} className={styles.groupSummaryCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.groupInfoContainer}>
                          <span className={styles.groupLabel}>
                            Financial Summary
                          </span>
                          <h4 className={styles.groupName}>{group.name}</h4>
                        </div>
                        <div className={styles.groupIconWrap}>
                          <HiOutlineShoppingBag />
                        </div>
                      </div>
                      <div className={styles.statsContainer}>
                        <div className={styles.statsGrid}>
                          <div className={styles.statItem}>
                            <div className={styles.statLabel}>
                              <HiOutlineShoppingBag /> Group Spend
                            </div>
                            <div className={styles.statValue}>
                              रू {group.totalGroupSpend.toLocaleString()}
                            </div>
                          </div>
                          <div className={styles.statItem}>
                            <div className={styles.statLabel}>
                              <HiOutlineUserCircle /> My Share
                            </div>
                            <div
                              className={`${styles.statValue} ${styles.highlight}`}
                            >
                              रू {group.myTotalShare.toLocaleString()}
                            </div>
                          </div>
                          <div className={styles.statItem}>
                            <div className={styles.statLabel}>
                              <HiOutlineArrowNarrowDown /> Remaining to Pay
                            </div>
                            <div
                              className={`${styles.statValue} ${group.iOweOthers > 0 ? styles.danger : ""}`}
                            >
                              रू {group.iOweOthers.toLocaleString()}
                            </div>
                          </div>
                          <div className={styles.statItem}>
                            <div className={styles.statLabel}>
                              <HiOutlineArrowNarrowUp /> Remaining to Receive
                            </div>
                            <div
                              className={`${styles.statValue} ${group.othersOweMe > 0 ? styles.success : ""}`}
                            >
                              रू {group.othersOweMe.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No group activities found.</p>
                )}
              </div>
            )}

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
        expenseType={EXPENSE_TYPE.PERSONAL}
      />

      <ExpenseDetailsModal
        isOpen={!!selectedExpenseId}
        onClose={() => setSelectedExpenseId(null)}
        expenseId={selectedExpenseId}
      />
    </div>
  );
}
