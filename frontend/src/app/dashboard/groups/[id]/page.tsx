"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiOutlineCurrencyDollar, HiCheck } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";

import {
  fetchGroupExpenses,
  fetchUserGroupSummaries,
  deleteExpense,
} from "@/store/slices/expenseSlice";
import { fetchGroupSettlementBalances } from "@/store/slices/settlementSlice";
import Button from "@/components/ui/Button/Button";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import ExpenseDetailsModal from "@/components/dashboard/ExpenseForm/ExpenseDetailsModal";
import BulkSettlementModal from "@/components/dashboard/Settlement/BulkSettlementModal";
import EditGroupModal from "@/components/dashboard/GroupModals/EditGroupModal";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import Pagination from "@/components/ui/Pagination/Pagination";
import { ExpenseCardSkeleton, TableSkeleton } from "./GroupLoadingSkeletons";
import styles from "./group-details.module.scss";
import {
  clearGroupDetails,
  fetchGroupDetailsAction,
} from "@/store/slices/groupSlice";
import { handleThunk } from "@/lib/utils";
import { EXPENSE_TYPE } from "@expense-tracker/shared";

import type { Expense, GroupBalance } from "@/lib/types";

// New modular components
import GroupHeader from "@/components/dashboard/GroupDetails/GroupHeader/GroupHeader";
import GroupTabs from "@/components/dashboard/GroupDetails/GroupTabs/GroupTabs";
import ExpenseFilters from "@/components/dashboard/GroupDetails/ExpenseFilters/ExpenseFilters";
import ExpenseCard from "@/components/dashboard/GroupDetails/ExpenseCard/ExpenseCard";
import ExpenseTable from "@/components/dashboard/GroupDetails/ExpenseTable/ExpenseTable";
import SettlementCard from "@/components/dashboard/GroupDetails/SettlementCard/SettlementCard";
import SettlementTable, {
  GroupBalanceWithId,
} from "@/components/dashboard/GroupDetails/SettlementTable/SettlementTable";
import GroupStats from "@/components/dashboard/GroupDetails/GroupStats/GroupStats";
import DownloadStatementModal from "@/components/dashboard/GroupDetails/DownloadStatementModal/DownloadStatementModal";
import { GROUP_TAB, ToastType } from "@/enums/general.enum";
import { useDownloadStatement } from "@/hooks/useDownloadStatement";
import { useFCMEventHandler } from "@/hooks/useFCMEventHandler";
import { LIMITS } from "@/constants/general.constant";
import { showToast } from "@/lib/toast";
import NotFound from "@/app/not-found";

export enum GROUP_DETAILS_ACTION_TYPE {
  DELETE = "delete",
}

export default function GroupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { groupDetails } = useAppSelector((s) => s.groups);

  const {
    groupExpenses,
    isLoading: expensesLoading,
    pagination,
    isSubmitting,
  } = useAppSelector((s) => s.expenses);

  const { groupSettlementBalances, isLoading: balancesLoading } =
    useAppSelector((s) => s.settlements);

  const { user } = useAppSelector((s) => s.auth);
  const { updateQuery, query } = useUpdateQuery();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(
    null,
  );

  const [selectedBalance, setSelectedBalance] =
    useState<GroupBalanceWithId | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const activeTab =
    query.tab === GROUP_TAB.SETTLEMENTS
      ? GROUP_TAB.SETTLEMENTS
      : GROUP_TAB.EXPENSES;

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
      dispatch(fetchGroupSettlementBalances(id as string));
      dispatch(fetchUserGroupSummaries());
    }
    return () => {
      dispatch(clearGroupDetails());
    };
  }, [id, dispatch]);

  const fetchExpenses = useCallback(() => {
    if (!id || activeTab !== GROUP_TAB.EXPENSES) return;
    dispatch(
      fetchGroupExpenses({
        groupId: id as string,
        filters: {
          page: Number(query.page) || 1,
          limit: Number(query.limit) || LIMITS.DEFAULT_EXPENSE,
          startDate: query.startDate || undefined,
          endDate: query.endDate || undefined,
          expenseStatus: query.expenseStatus || undefined,
          settlementStatus: query.settlementStatus || undefined,
        },
      }),
    );
  }, [id, dispatch, query, activeTab]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useFCMEventHandler({
    currentGroupId: id as string,
    refetchExpenses: fetchExpenses,
  });

  const { handleDownloadStatement, downloadingFormat } = useDownloadStatement({
    groupId: id as string,
    onSuccess: () => setIsDownloadModalOpen(false),
  });

  const handleOpenBulkModal = (balance: GroupBalanceWithId) => {
    setSelectedBalance(balance);
    setIsBulkModalOpen(true);
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDeleteId) return;
    await handleThunk(
      dispatch(deleteExpense(expenseToDeleteId)),
      () => {
        setExpenseToDeleteId(null);
        fetchExpenses();
      },
      (err: string) => {
        showToast(ToastType.ERROR, err);
      },
    );
  };

  const members = useMemo(
    () => groupDetails?.data?.members || [],
    [groupDetails],
  );

  const isAdmin = useMemo(() => {
    const me = members.find((m) => m.user_id === user?.id);
    return me?.role === "admin";
  }, [members, user]);

  if (groupDetails?.error) {
    return <NotFound />;
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
          <GroupStats />
        </section>

        <main className={styles.mainColumn}>
          <GroupTabs onDownloadStatement={() => setIsDownloadModalOpen(true)} />

          {activeTab === GROUP_TAB.EXPENSES && (
            <ExpenseFilters isStatic={isLargeScreen} />
          )}

          {activeTab === GROUP_TAB.EXPENSES ? (
            <div className={styles.expenseSection}>
              {expensesLoading && groupExpenses?.length === 0 ? (
                isLargeScreen ? (
                  <TableSkeleton rows={6} cols={6} />
                ) : (
                  <ExpenseCardSkeleton count={LIMITS.DEFAULT_EXPENSE} />
                )
              ) : groupExpenses.length > 0 ? (
                isLargeScreen ? (
                  <ExpenseTable
                    expenses={groupExpenses}
                    user={user}
                    onSelect={setSelectedExpenseId}
                    onEdit={setExpenseToEdit}
                    onDelete={(id: string) => {
                      setExpenseToDeleteId(id);
                    }}
                    isLoading={expensesLoading}
                    pagination={{
                      currentPage: Number(query.page) || 1,
                      totalPages: pagination?.totalPages || 0,
                      totalResults: pagination?.total || 0,
                      pageSize: Number(query.limit) || LIMITS.DEFAULT_EXPENSE,
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
                        />
                      ))}
                    </div>
                    {pagination && (
                      <Pagination
                        currentPage={Number(query.page) || 1}
                        totalPages={pagination.totalPages}
                        onPageChange={(page) => updateQuery({ page })}
                        totalResults={pagination.total}
                        pageSize={Number(query.limit) || LIMITS.DEFAULT_EXPENSE}
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
              (groupDetails.isLoading &&
                groupSettlementBalances.length === 0) ? (
                isLargeScreen ? (
                  <TableSkeleton rows={4} cols={4} />
                ) : (
                  <ExpenseCardSkeleton count={3} />
                )
              ) : groupSettlementBalances.length > 0 ? (
                isLargeScreen ? (
                  <SettlementTable
                    balances={groupSettlementBalances}
                    user={user}
                    onAction={handleOpenBulkModal}
                    isLoading={balancesLoading}
                  />
                ) : (
                  <div className={styles.settlements}>
                    {groupSettlementBalances.map((balance: GroupBalance) => {
                      const balanceWithId = {
                        ...balance,
                        id:
                          balance.settlement_id ||
                          `${balance.from_user_id}-${balance.to_user_id}`,
                      };
                      return (
                        <SettlementCard
                          key={`balance-${balanceWithId.id}`}
                          balance={balanceWithId}
                          user={user}
                          onAction={handleOpenBulkModal}
                        />
                      );
                    })}
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
        fetchCb={() => {
          fetchExpenses();
        }}
        expenseType={EXPENSE_TYPE.GROUP}
        expense={expenseToEdit || undefined}
      />

      <ExpenseDetailsModal
        isOpen={!!selectedExpenseId}
        onClose={() => setSelectedExpenseId(null)}
        expenseId={selectedExpenseId}
        fetchCb={fetchExpenses}
      />

      <BulkSettlementModal
        key={selectedBalance?.id}
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
        onClose={() => {
          setExpenseToDeleteId(null);
        }}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone and will affect all participants' balances."
        confirmText="Delete Expense"
        isLoading={isSubmitting && !!expenseToDeleteId}
      />
    </div>
  );
}
