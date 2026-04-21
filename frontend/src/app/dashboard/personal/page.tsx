"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineFilter,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteExpense,
  fetchUserSummary,
  fetchPersonalExpenses,
  fetchUserGroupSummaries,
} from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import Pagination from "@/components/ui/Pagination/Pagination";
import styles from "./personal.module.scss";
import { handleThunk } from "@/lib/utils";
import type { RootState } from "@/store";
import { EXPENSE_TYPE } from "@expense-tracker/shared";

// Modular Components
import PersonalHeader from "@/components/dashboard/PersonalDetails/PersonalHeader/PersonalHeader";
import PersonalStats from "@/components/dashboard/PersonalDetails/PersonalStats/PersonalStats";
import PersonalFilters from "@/components/dashboard/PersonalDetails/PersonalFilters/PersonalFilters";
import PersonalExpenseCard from "@/components/dashboard/PersonalDetails/PersonalExpenseCard/PersonalExpenseCard";
import GroupSummaryCard from "@/components/dashboard/PersonalDetails/GroupSummaryCard/GroupSummaryCard";
import { FullPersonalSkeleton, PersonalExpenseListSkeleton, GroupSummaryListSkeleton } from "./PersonalLoadingSkeletons";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { 
    personalExpenses, 
    summary, 
    groupSummaries, 
    isSummaryLoading,
    isPersonalExpensesLoading,
    isGroupSummariesLoading,
    pagination 
  } = useAppSelector((s: RootState) => s.expenses);
  const { user } = useAppSelector((state: RootState) => state.auth);

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
    setAppliedFilters({ startDate, endDate });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setAppliedFilters({ startDate: "", endDate: "" });
    setCurrentPage(1);
  };

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

  if (isSummaryLoading || !summary) {
    return <FullPersonalSkeleton />;
  }

  return (
    <div className={styles.page}>
      <PersonalHeader 
        onBack={() => router.push("/dashboard")}
        onAddExpense={() => setIsExpenseModalOpen(true)}
      />

      <PersonalStats summary={summary} />

      <section className={styles.expenseSection}>
        <div className={styles.groupSection}>
          <div className={styles.groupHeader}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <h3>Personal Expenses</h3>
              {pagination && (
                <span className={styles.groupTotal}>
                  रू {pagination.totalAmount?.toLocaleString()}
                </span>
              )}
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
                {(startDate || endDate) && <span className={styles.filterDot} />}
              </Button>
            </div>
          </div>

          <PersonalFilters 
            isExpanded={isFilterExpanded}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />

          {isPersonalExpensesLoading ? (
            <PersonalExpenseListSkeleton count={limit} />
          ) : (
            <div className={styles.groupList}>
              {personalExpenses.length > 0 ? (
                personalExpenses.map((expense) => (
                  <PersonalExpenseCard 
                    key={expense.id}
                    expense={expense}
                    user={user}
                    onEdit={setExpenseToEdit}
                    onDelete={setExpenseToDelete}
                  />
                ))
              ) : (
                <div className={styles.emptyStateCard}>
                  <div className={styles.icon}>
                    <HiOutlineShoppingBag />
                  </div>
                  <p className={styles.title}>No personal expenses yet</p>
                  <p className={styles.subtext}>
                    Start tracking your individual spending by logging your first expense.
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
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              totalResults={pagination.total}
              pageSize={limit}
            />
          )}
        </div>

        {isGroupSummariesLoading && groupSummaries.length === 0 ? (
          <div className={styles.groupSection}>
            <div className={styles.groupHeader} style={{ marginBottom: "1.5rem" }}>
              <h3>Group Summaries</h3>
            </div>
            <div className={styles.groupSummaryGrid}>
              <GroupSummaryListSkeleton count={3} />
            </div>
          </div>
        ) : (
          groupSummaries.length > 0 && (
            <div className={styles.groupSection}>
              <div
                className={styles.groupHeader}
                style={{ marginBottom: "1.5rem" }}
              >
                <h3>Group Summaries</h3>
              </div>
              <div className={styles.groupSummaryGrid}>
                {groupSummaries.map((group) => (
                  <GroupSummaryCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )
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
