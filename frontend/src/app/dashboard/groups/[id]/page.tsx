"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiOutlineCurrencyDollar, HiCheck } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";

import {
  fetchGroupExpenses,
  fetchUserGroupSummaries,
  deleteExpense,
} from "@/store/slices/expenseSlice";
import { fetchGroupBalances } from "@/store/slices/settlementSlice";
import Button from "@/components/ui/Button/Button";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import ExpenseDetailsModal from "@/components/dashboard/ExpenseForm/ExpenseDetailsModal";
import BulkSettlementModal from "@/components/dashboard/Settlement/BulkSettlementModal";
import EditGroupModal from "@/components/dashboard/GroupModals/EditGroupModal";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import Pagination from "@/components/ui/Pagination/Pagination";
import {
  FullPageSkeleton,
  ExpenseCardSkeleton,
  TableSkeleton,
} from "./GroupLoadingSkeletons";
import styles from "./group-details.module.scss";
import {
  clearGroupDetails,
  fetchGroupDetailsAction,
} from "@/store/slices/groupSlice";
import api from "@/lib/api";
import { handleThunk } from "@/lib/utils";
import { EXPENSE_TYPE, REPORT_TYPE } from "@expense-tracker/shared";

import type { Expense, GroupBalance } from "@/lib/types";

// New modular components
import GroupHeader from "@/components/dashboard/GroupDetails/GroupHeader/GroupHeader";
import GroupTabs from "@/components/dashboard/GroupDetails/GroupTabs/GroupTabs";
import ExpenseFilters from "@/components/dashboard/GroupDetails/ExpenseFilters/ExpenseFilters";
import ExpenseCard from "@/components/dashboard/GroupDetails/ExpenseCard/ExpenseCard";
import ExpenseTable from "@/components/dashboard/GroupDetails/ExpenseTable/ExpenseTable";
import SettlementCard from "@/components/dashboard/GroupDetails/SettlementCard/SettlementCard";
import SettlementTable from "@/components/dashboard/GroupDetails/SettlementTable/SettlementTable";
import GroupStats from "@/components/dashboard/GroupDetails/GroupStats/GroupStats";
import DownloadStatementModal from "@/components/dashboard/GroupDetails/DownloadStatementModal/DownloadStatementModal";

export default function GroupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { groupDetails } = useAppSelector((s) => s.groups);

  const {
    groupExpenses,
    isLoading: expensesLoading,
    groupSummaries,
    pagination,
  } = useAppSelector((s) => s.expenses);

  const { groupBalances, isLoading: balancesLoading } = useAppSelector(
    (s) => s.settlements,
  );

  const { user } = useAppSelector((s) => s.auth);
  const { updateQuery, searchParams } = useUpdateQuery();

  const [activeTab, setActiveTab] = useState<"expenses" | "settlements">(() => {
    const tab = searchParams.get("tab");
    return tab === "settlements" ? "settlements" : "expenses";
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(
    null,
  );
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  const [selectedBalance, setSelectedBalance] = useState<GroupBalance | null>(
    null,
  );
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Filters state
  const [currentPage, setCurrentPage] = useState(
    () => Number(searchParams.get("page")) || 1,
  );
  const [limit] = useState(6);
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || "",
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [expenseStatus, setExpenseStatus] = useState(
    searchParams.get("expenseStatus") || "",
  );
  const [settlementStatus, setSettlementStatus] = useState(
    searchParams.get("settlementStatus") || "",
  );
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    expenseStatus: searchParams.get("expenseStatus") || "",
    settlementStatus: searchParams.get("settlementStatus") || "",
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Responsive state
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchGroupDetailsAction(id as string));
      dispatch(fetchGroupBalances(id as string));
      dispatch(fetchUserGroupSummaries());
    }
    return () => {
      dispatch(clearGroupDetails());
    };
  }, [id, dispatch]);

  const currentGroupSummary = useMemo(() => {
    return groupSummaries.find((gs) => gs.id === id);
  }, [groupSummaries, id]);

  const fetchExpenses = () => {
    if (id && activeTab === "expenses") {
      dispatch(
        fetchGroupExpenses({
          groupId: id as string,
          filters: {
            page: currentPage,
            limit,
            startDate: appliedFilters.startDate || undefined,
            endDate: appliedFilters.endDate || undefined,
            expenseStatus: appliedFilters.expenseStatus || undefined,
            settlementStatus: appliedFilters.settlementStatus || undefined,
          },
        }),
      );
    }
  };

  useEffect(() => {
    fetchExpenses();
    // Sync with URL query params
    updateQuery({
      tab: activeTab,
      page: currentPage,
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
      expenseStatus: appliedFilters.expenseStatus,
      settlementStatus: appliedFilters.settlementStatus,
    });
  }, [
    id,
    dispatch,
    currentPage,
    limit,
    appliedFilters,
    activeTab,
    updateQuery,
  ]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      startDate,
      endDate,
      expenseStatus,
      settlementStatus,
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setExpenseStatus("");
    setSettlementStatus("");
    setAppliedFilters({
      startDate: "",
      endDate: "",
      expenseStatus: "",
      settlementStatus: "",
    });
    setCurrentPage(1);
  };

  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(
    null,
  );

  const handleDownloadStatement = async (
    format: REPORT_TYPE,
    modalStartDate: string,
    modalEndDate: string,
  ) => {
    setDownloadingFormat(format);
    try {
      const params = new URLSearchParams();
      if (id) params.append("groupId", id as string);
      if (modalStartDate) params.append("startDate", modalStartDate);
      if (modalEndDate) params.append("endDate", modalEndDate);
      params.append("format", format);

      const response = await api.get(
        `/expenses/user/download-statement?${params.toString()}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `group_expense_statement_${Date.now()}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsDownloadModalOpen(false);
    } catch (error) {
      console.error("Failed to download group statement", error);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleOpenBulkModal = (balance: GroupBalance) => {
    setSelectedBalance(balance);
    setIsBulkModalOpen(true);
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDeleteId) return;
    setIsDeleteSubmitting(true);
    await handleThunk(
      dispatch(deleteExpense(expenseToDeleteId)),
      () => {
        setExpenseToDeleteId(null);
        fetchExpenses();
      },
      () => {
        setIsDeleteSubmitting(false);
      },
    );
    setIsDeleteSubmitting(false);
  };

  const members = useMemo(
    () => groupDetails?.data?.members || [],
    [groupDetails],
  );

  const isAdmin = useMemo(() => {
    const me = members.find((m) => m.user_id === user?.id);
    return me?.role === "admin";
  }, [members, user]);

  const totalGroupSpend = useMemo(() => {
    if (pagination?.totalAmount !== undefined) return pagination.totalAmount;
    return groupExpenses.reduce(
      (acc, curr) => acc + Number(curr.total_amount),
      0,
    );
  }, [groupExpenses, pagination]);

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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
    };
  };

  const hasFiltersApplied = !!(
    appliedFilters.startDate ||
    appliedFilters.endDate ||
    appliedFilters.expenseStatus ||
    appliedFilters.settlementStatus
  );

  if (groupDetails?.isLoading || !groupDetails?.data) {
    return <FullPageSkeleton />;
  }

  return (
    <div className={styles.page}>
      <GroupHeader
        groupDetails={groupDetails}
        onBack={() => router.push("/dashboard")}
        onAddExpense={() => setIsExpenseModalOpen(true)}
        onEdit={isAdmin ? () => setIsEditModalOpen(true) : undefined}
        onSettings={() => router.push(`/dashboard/groups/${id}/settings`)}
      />

      <div className={styles.contentGrid}>
        <section className={styles.statsSection}>
          <GroupStats
            groupDetails={groupDetails}
            totalGroupSpend={totalGroupSpend}
            netPosition={netPosition}
            summary={currentGroupSummary}
          />
        </section>

        <main className={styles.mainColumn}>
          <GroupTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isFilterExpanded={isFilterExpanded}
            setIsFilterExpanded={setIsFilterExpanded}
            hasFiltersApplied={hasFiltersApplied}
            onDownloadStatement={() => setIsDownloadModalOpen(true)}
            isLargeScreen={isLargeScreen}
          />

          {activeTab === "expenses" && (isLargeScreen || isFilterExpanded) && (
            <ExpenseFilters
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              expenseStatus={expenseStatus}
              setExpenseStatus={setExpenseStatus}
              settlementStatus={settlementStatus}
              setSettlementStatus={setSettlementStatus}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              hasFiltersApplied={hasFiltersApplied}
              isStatic={isLargeScreen}
            />
          )}

          {activeTab === "expenses" ? (
            <div className={styles.expenseSection}>
              {expensesLoading && groupExpenses.length === 0 ? (
                isLargeScreen ? (
                  <TableSkeleton rows={6} cols={6} />
                ) : (
                  <ExpenseCardSkeleton count={limit} />
                )
              ) : groupExpenses.length > 0 ? (
                isLargeScreen ? (
                  <ExpenseTable
                    expenses={groupExpenses}
                    user={user}
                    onSelect={setSelectedExpenseId}
                    onEdit={setExpenseToEdit}
                    onDelete={setExpenseToDeleteId}
                    isLoading={expensesLoading}
                    onPageChange={(page) => setCurrentPage(page)}
                    pagination={{
                      currentPage,
                      totalPages: pagination?.totalPages || 0,
                      totalResults: pagination?.total || 0,
                      pageSize: limit,
                    }}
                  />
                ) : (
                  <>
                    <div className={styles.expenseList}>
                      {groupExpenses.map((expense: Expense) => (
                        <ExpenseCard
                          key={expense.id}
                          expense={expense}
                          user={user}
                          onSelect={setSelectedExpenseId}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                    {pagination && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                        totalResults={pagination.total}
                        pageSize={limit}
                      />
                    )}
                  </>
                )
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
            <div className={styles.settlementSection}>
              {balancesLoading ||
              (groupDetails.isLoading && groupBalances.length === 0) ? (
                isLargeScreen ? (
                  <TableSkeleton rows={4} cols={4} />
                ) : (
                  <ExpenseCardSkeleton count={3} />
                )
              ) : groupBalances.length > 0 ? (
                isLargeScreen ? (
                  <SettlementTable
                    balances={groupBalances}
                    user={user}
                    onAction={handleOpenBulkModal}
                    isLoading={balancesLoading}
                  />
                ) : (
                  <div className={styles.settlements}>
                    {groupBalances.map(
                      (balance: GroupBalance, index: number) => (
                        <SettlementCard
                          key={`balance-${index}`}
                          balance={balance}
                          user={user}
                          onAction={handleOpenBulkModal}
                        />
                      ),
                    )}
                  </div>
                )
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
      </div>

      <AddExpenseModal
        isOpen={isExpenseModalOpen || !!expenseToEdit}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseType={EXPENSE_TYPE.GROUP}
        expense={expenseToEdit || undefined}
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

      {groupDetails.data && (
        <EditGroupModal
          key={groupDetails.data.id}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          group={groupDetails.data}
        />
      )}

      <DownloadStatementModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownloadStatement}
        isDownloading={downloadingFormat}
      />

      <ConfirmModal
        isOpen={!!expenseToDeleteId}
        onClose={() => setExpenseToDeleteId(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone and will affect all participants' balances."
        confirmText="Delete Expense"
        isLoading={isDeleteSubmitting}
      />
    </div>
  );
}
