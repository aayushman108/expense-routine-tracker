"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineShoppingBag, HiOutlineDownload } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteExpense,
  fetchUserSummary,
  fetchPersonalExpenses,
} from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import Pagination from "@/components/ui/Pagination/Pagination";
import MonthlyExpenditureChart from "@/components/dashboard/Charts/MonthlyExpenditureChart";
import styles from "./personal.module.scss";
import { handleThunk } from "@/lib/utils";
import type { RootState } from "@/store";
import { EXPENSE_TYPE } from "@expense-tracker/shared";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import PersonalExpenseTable from "@/components/dashboard/PersonalDetails/PersonalExpenseTable/PersonalExpenseTable";
import { useDownloadStatement } from "@/hooks/useDownloadStatement";

// Modular Components
import PersonalHeader from "@/components/dashboard/PersonalDetails/PersonalHeader/PersonalHeader";
import PersonalFilters from "@/components/dashboard/PersonalDetails/PersonalFilters/PersonalFilters";
import PersonalExpenseCard from "@/components/dashboard/PersonalDetails/PersonalExpenseCard/PersonalExpenseCard";
import DownloadStatementModal from "@/components/dashboard/GroupDetails/DownloadStatementModal/DownloadStatementModal";
import {
  FullPersonalSkeleton,
  PersonalExpenseListSkeleton,
  TableSkeleton,
} from "./PersonalLoadingSkeletons";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    personalExpenses,
    summary,
    isSummaryLoading,
    isPersonalExpensesLoading,
    pagination,
  } = useAppSelector((s: RootState) => s.expenses);
  const { user } = useAppSelector((state: RootState) => state.auth);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  const { updateQuery, searchParams } = useUpdateQuery();
  const [currentPage, setCurrentPage] = useState(
    () => Number(searchParams.get("page")) || 1,
  );
  const [limit] = useState(10); // Increased limit for table view

  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || "",
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Responsive state
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsLargeScreen(window.innerWidth > 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

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
  const { handleDownloadStatement, downloadingFormat } = useDownloadStatement({
    expenseType: EXPENSE_TYPE.PERSONAL,
    onSuccess: () => setIsDownloadModalOpen(false),
  });

  useEffect(() => {
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
    // Sync with URL
    updateQuery({
      page: currentPage,
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
    });
  }, [fetchExpenses, currentPage, appliedFilters, updateQuery]);

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

      {/* ── Spending Trends Line Chart ── */}
      <section className={styles.chartSection}>
        <MonthlyExpenditureChart variant="compact" mode="personal" />
      </section>

      <section className={styles.expenseSection}>
        <div className={styles.groupSection}>
          <div className={styles.groupHeader}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <h3>Personal Expenses</h3>
            </div>
            <div className={styles.filterActions}>
              <Button
                variant="outline"
                size="sm"
                className={styles.downloadBtn}
                onClick={() => setIsDownloadModalOpen(true)}
              >
                <HiOutlineDownload />
                Statement
              </Button>
            </div>
          </div>

          <PersonalFilters
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />

          {isPersonalExpensesLoading ? (
            isLargeScreen ? (
              <TableSkeleton rows={8} cols={4} />
            ) : (
              <PersonalExpenseListSkeleton count={limit} />
            )
          ) : (
            <div className={styles.groupList}>
              {personalExpenses.length > 0 ? (
                isLargeScreen ? (
                  <PersonalExpenseTable
                    expenses={personalExpenses}
                    user={user}
                    onEdit={setExpenseToEdit}
                    onDelete={setExpenseToDelete}
                    pagination={{
                      currentPage,
                      totalPages: pagination?.totalPages || 1,
                      totalResults: pagination?.total || 0,
                      pageSize: limit,
                    }}
                    onPageChange={setCurrentPage}
                  />
                ) : (
                  personalExpenses.map((expense) => (
                    <PersonalExpenseCard
                      key={expense.id}
                      expense={expense}
                      onEdit={setExpenseToEdit}
                      onDelete={setExpenseToDelete}
                    />
                  ))
                )
              ) : (
                <div className={styles.emptyStateCard}>
                  <div className={styles.icon}>
                    <HiOutlineShoppingBag />
                  </div>
                  <p className={styles.title}>No personal expenses yet</p>
                  <p className={styles.subtext}>
                    Start tracking your individual spending by logging your
                    first expense.
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

          {!isLargeScreen && pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              totalResults={pagination.total}
              pageSize={limit}
            />
          )}
        </div>
      </section>

      <AddExpenseModal
        isOpen={isExpenseModalOpen || !!expenseToEdit}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        fetchCb={() => {
          fetchExpenses();
          handleThunk(dispatch(fetchUserSummary()));
        }}
        expenseType={EXPENSE_TYPE.PERSONAL}
        expense={expenseToEdit}
      />

      <DownloadStatementModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownloadStatement}
        isDownloading={downloadingFormat}
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
