"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineChevronLeft,
  HiOutlinePlus,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineChartBar,
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
  HiPencil,
  HiTrash,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineX,
  HiOutlineSearch,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteExpense,
  fetchUserSummary,
  fetchPersonalExpenses,
  fetchUserGroupSummaries,
} from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import Pagination from "@/components/ui/Pagination/Pagination";
import styles from "./personal.module.scss";
import { handleThunk } from "@/lib/utils";
import type { RootState } from "@/store";
import { EXPENSE_TYPE } from "@expense-tracker/shared";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { personalExpenses, summary, groupSummaries, isLoading, pagination } =
    useAppSelector((s: RootState) => s.expenses);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const handleApplyFilters = () => {
    setAppliedFilters({
      startDate,
      endDate,
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setAppliedFilters({
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  const { user } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    handleThunk(dispatch(fetchUserGroupSummaries()));
    handleThunk(dispatch(fetchUserSummary()));
  }, [dispatch]);

  const fetchExpenses = useCallback(() => {
    handleThunk(
      dispatch(
        fetchPersonalExpenses({
          limit,
          page: currentPage,
          expenseType: "personal",
          startDate: appliedFilters.startDate || undefined,
          endDate: appliedFilters.endDate || undefined,
        }),
      ),
    );
  }, [dispatch, currentPage, limit, appliedFilters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setSubmittingAction(`${expenseToDelete}-delete`);
    await handleThunk(
      dispatch(deleteExpense(expenseToDelete)),
      () => {
        setExpenseToDelete(null);
        setSubmittingAction(null);
        fetchExpenses();
        handleThunk(dispatch(fetchUserSummary()));
      },
      () => {
        setExpenseToDelete(null);
        setSubmittingAction(null);
      },
    );
  };

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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
    };
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
    const { day, month } = formatDate(expense.expense_date);

    return (
      <div key={expense.id} className={styles.expenseCard}>
        <div className={styles.cardHeader}>
          <div className={styles.amountSection}>
            <span className={styles.currency}>{expense.currency || "NPR"}</span>
            <span className={styles.amountValue}>
              {Number(amountToShow).toLocaleString()}
            </span>
          </div>
          <div className={styles.date}>
            <span className={styles.day}>{day}</span>
            <span className={styles.month}>{month}</span>
          </div>
        </div>

        <div className={styles.cardBody}>
          <span className={styles.titleText}>
            {expense.description || "Unnamed Expense"}
          </span>
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.dateBadge}>
            {new Date(expense.expense_date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          {!isGroup ? (
            <div className={styles.actionButtons}>
              <button
                className={styles.iconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpenseToEdit(expense);
                }}
                title="Edit Expense"
              >
                <HiPencil />
              </button>
              <button
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpenseToDelete(expense.id);
                }}
                title="Delete Expense"
              >
                <HiTrash />
              </button>
            </div>
          ) : (
            <span className={styles.payer}>
              {expense.paid_by === user?.id ? (
                <span className={styles.payerHighlight}>You</span>
              ) : (
                <span>
                  {expense.payer?.full_name || expense.payer_name || "Member"}
                </span>
              )}{" "}
              paid
            </span>
          )}
        </div>
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
          <div className={styles.sessionTag}>SECURE_PERSONAL_SESSION</div>
          <div className={styles.titleWrapper}>
            <div className={styles.icon}>
              <HiOutlineCurrencyDollar />
            </div>
            <h1>Personal Ledger</h1>
          </div>
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
        <div className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statHeader}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Lifetime Spend</span>
              <span className={styles.statValue}>
                रू {calculations.total.toLocaleString()}
              </span>
            </div>
            <div className={styles.iconWrapper}>
              <HiOutlineCurrencyDollar />
            </div>
          </div>
          <span className={`${styles.statSub} ${styles.success}`}>
            Personal + All Group Shares
          </span>
        </div>

        <div className={`${styles.statCard} ${styles.purple}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statHeader}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Current Month Spend</span>
              <span className={styles.statValue}>
                रू {calculations.currentMonthTotal.toLocaleString()}
              </span>
            </div>
            <div className={styles.iconWrapper}>
              <HiOutlineCalendar />
            </div>
          </div>
          <span className={`${styles.statSub} ${styles.success}`}>
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className={`${styles.statCard} ${styles.green}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statHeader}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Personal Spend</span>
              <span className={styles.statValue}>
                रू {calculations.personal.toLocaleString()}
              </span>
            </div>
            <div className={styles.iconWrapper}>
              <HiOutlineChartBar />
            </div>
          </div>
          <span className={`${styles.statSub} ${styles.secondary}`}>
            Non-group expenses
          </span>
        </div>

        <div className={`${styles.statCard} ${styles.yellow}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statHeader}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Group Spend</span>
              <span className={styles.statValue}>
                रू {calculations.groupOnly.toLocaleString()}
              </span>
            </div>
            <div className={styles.iconWrapper}>
              <HiOutlineShoppingBag />
            </div>
          </div>
          <span className={`${styles.statSub} ${styles.secondary}`}>
            Your verified group shares
          </span>
        </div>

        <div className={`${styles.statCard} ${styles.red}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statHeader}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Remaining to Pay</span>
              <span className={styles.statValue}>
                रू {calculations.totalIOwe.toLocaleString()}
              </span>
            </div>
            <div className={styles.iconWrapper}>
              <HiOutlineArrowNarrowDown />
            </div>
          </div>
          <span
            className={`${styles.statSub} ${calculations.totalIOwe > 0 ? styles.danger : styles.secondary}`}
          >
            Total outstanding in groups
          </span>
        </div>

        <div className={`${styles.statCard} ${styles.green}`}>
          <div className={styles.statGlow}></div>
          <div className={styles.statHeader}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>To Receive</span>
              <span className={styles.statValue}>
                रू {calculations.totalOthersOweMe.toLocaleString()}
              </span>
            </div>
            <div className={styles.iconWrapper}>
              <HiOutlineArrowNarrowUp />
            </div>
          </div>
          <span
            className={`${styles.statSub} ${calculations.totalOthersOweMe > 0 ? styles.success : styles.secondary}`}
          >
            Others owe you
          </span>
        </div>
      </div>

      <section className={styles.expenseSection}>
        {isLoading ? (
          <div className="py-12 text-center text-secondary opacity-50">
            Loading ledger...
          </div>
        ) : (
          <>
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <h3>Personal Expenses</h3>
                  <span className={styles.groupTotal}>
                    रू{" "}
                    {(
                      pagination?.totalAmount ?? calculations.personal
                    ).toLocaleString()}
                  </span>
                </div>
                <div className={styles.filterActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={styles.filterToggleBtn}
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  >
                    <HiOutlineFilter />
                    {isFilterExpanded ? "Hide Filters" : "Filters"}
                    {(startDate || endDate) && (
                      <span className={styles.filterDot} />
                    )}
                  </Button>
                </div>
              </div>

              {isFilterExpanded && (
                <div className={styles.filterBar}>
                  <div className={styles.filterGroup}>
                    <div className={styles.inputWrapper}>
                      <label>From</label>
                      <div className={styles.dateInput}>
                        <HiOutlineCalendar />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.inputWrapper}>
                      <label>To</label>
                      <div className={styles.dateInput}>
                        <HiOutlineCalendar />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.filterActions}>
                      <Button size="sm" onClick={handleApplyFilters}>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <HiOutlineSearch />
                          Search
                        </span>
                      </Button>
                      {(startDate || endDate) && (
                        <button
                          className={styles.clearFilters}
                          onClick={handleClearFilters}
                        >
                          <HiOutlineX />
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className={styles.groupList}>
                {personalExpenses.length > 0 ? (
                  personalExpenses.map(renderExpenseItem)
                ) : (
                  <p className={styles.noData}>No personal expenses found.</p>
                )}
              </div>
              {pagination && pagination.totalPages > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  totalResults={pagination.total}
                  pageSize={limit}
                />
              )}
            </div>

            {groupSummaries.length > 0 && (
              <div className={styles.groupSection}>
                <div className={styles.groupHeader}>
                  <h3>Group Summaries</h3>
                </div>
                <div
                  className={styles.groupSummaryGrid}
                  style={{ marginTop: "1rem" }}
                >
                  {groupSummaries.map((group: any) => (
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
                  ))}
                </div>
              </div>
            )}

            {personalExpenses?.length === 0 && !isLoading && (
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
        isOpen={isExpenseModalOpen || !!expenseToEdit}
        onClose={() => {
          fetchExpenses();
          handleThunk(dispatch(fetchUserSummary()));
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseType={EXPENSE_TYPE.PERSONAL}
        expense={expenseToEdit}
      />

      <ConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        isLoading={submittingAction === `${expenseToDelete}-delete`}
      />
    </div>
  );
}
