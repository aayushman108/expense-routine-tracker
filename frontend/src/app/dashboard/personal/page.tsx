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
  HiOutlineUserCircle,
  HiOutlineChartBar,
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserExpenses, updateExpense, fetchUserSummary } from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import PersonalExpenseDetailsModal from "@/components/dashboard/ExpenseForm/PersonalExpenseDetailsModal";
import styles from "./personal.module.scss";
import { handleThunk } from "@/lib/utils";
import type { RootState } from "@/store";
import {
  EXPENSE_TYPE,
  EXPENSE_STATUS,
} from "@expense-tracker/shared";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { expenses, personalExpenses, summary, isLoading } = useAppSelector(
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
    handleThunk(dispatch(fetchUserExpenses()));
    handleThunk(dispatch(fetchUserSummary()));
  }, [dispatch]);

  const handleUpdateStatus = async (id: string, status: string) => {
    await handleThunk(
      dispatch(updateExpense({ id, body: { expenseStatus: status as any } })),
      () => {
        handleThunk(dispatch(fetchUserExpenses()));
        handleThunk(dispatch(fetchUserSummary()));
      },
    );
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

  // This is still useful for section-specific totals if needed, 
  // but the main cards now come from the API.
  const calculations = useMemo(() => {
    return {
      personal: summary?.personalSpend || 0,
      total: summary?.lifetimeSpend || 0,
      currentMonthTotal: summary?.currentMonthSpend || 0,
      totalIOwe: summary?.remainingToPay || 0,
      totalOthersOweMe: summary?.remainingToReceive || 0,
      groupOnly: summary?.groupSpend || 0,
    };
  }, [summary]);

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

    const isGroup = expense.expense_type === EXPENSE_TYPE.GROUP;

    return (
      <div
        key={expense.id}
        className={`${styles.expenseItem} ${!isGroup ? styles.personalCard : ""}`}
        onClick={() => setSelectedExpenseId(expense.id)}
      >
        {!isGroup ? (
          <>
            <div className={styles.personalBadgeRow}>
              <span className={styles.personalBadge}>
                <span className={styles.dot} /> Personal
              </span>
              <span className={styles.categoryLabel}>{expense.category || "General"}</span>
            </div>
            
            <div className={styles.cardMain}>
              <div className={styles.categoryIconWrap}>
                {getCategoryIcon(expense.description || "")}
              </div>
              <div className={styles.amountWrap}>
                <span className={styles.currency}>रू</span>
                <span className={styles.amountValue}>
                  {Number(amountToShow).toLocaleString()}
                </span>
              </div>
            </div>

            <div className={styles.contentWrap}>
              <h4 className={styles.expenseTitle}>
                {expense.description || "Unnamed Expense"}
              </h4>
              <p className={styles.expenseDate}>
                {new Date(expense.expense_date).toLocaleDateString("en-US", {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className={styles.cardAction}>
              <span>Tap for details</span>
              <div className={styles.arrow}>→</div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.cardHeader}>
              <div className={styles.amountSection}>
                <span className={styles.currency}>रू</span>
                <span className={styles.amountValue}>
                  {Number(amountToShow).toLocaleString()}
                </span>
              </div>
              <span className={`${styles.typeBadge} ${styles.group}`}>
                Group
              </span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.iconWrap}>
                {getCategoryIcon(expense.description || "")}
              </div>
              <span className={styles.title}>
                {expense.description || "Unnamed Expense"}
              </span>
              <div className={styles.tagsRow}>
                <span className={`${styles.tag} ${styles[expense.expense_status]}`}>
                  Expense: {expense.expense_status.toUpperCase()}
                </span>
                {expense.expense_status === "draft" && (
                  <button
                    className={styles.inlineSubmitBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(expense.id, "submitted");
                    }}
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.date}>
                {new Date(expense.expense_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className={styles.groupName}>{expense.group_name}</span>
            </div>
          </>
        )}
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
            <span className={styles.cardLabel}>Current Month Spend</span>
            <span className={styles.cardValue}>
              रू {calculations.currentMonthTotal.toLocaleString()}
            </span>
            <span className={`${styles.cardSub} ${styles.success}`}>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
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
            <span className={styles.cardLabel}>Group Spend</span>
            <span className={styles.cardValue}>
              रू {calculations.groupOnly.toLocaleString()}
            </span>
            <span className={`${styles.cardSub} ${styles.secondary}`}>
              Your verified group shares
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

      <PersonalExpenseDetailsModal
        isOpen={!!selectedExpenseId}
        onClose={() => setSelectedExpenseId(null)}
        expenseId={selectedExpenseId}
      />
    </div>
  );
}
