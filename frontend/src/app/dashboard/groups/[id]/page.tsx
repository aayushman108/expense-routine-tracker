"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  HiOutlineUserAdd,
  HiOutlineCurrencyDollar,
  HiCheck,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  fetchGroupExpenses,
  fetchUserGroupSummaries,
} from "@/store/slices/expenseSlice";
import { fetchGroupBalances } from "@/store/slices/settlementSlice";
import Button from "@/components/ui/Button/Button";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import ExpenseDetailsModal from "@/components/dashboard/ExpenseForm/ExpenseDetailsModal";
import InviteUserModal from "@/components/dashboard/GroupMembers/InviteUserModal";
import AddMemberModal from "@/components/dashboard/GroupMembers/AddMemberModal";
import BulkSettlementModal from "@/components/dashboard/Settlement/BulkSettlementModal";
import EditGroupModal from "@/components/dashboard/GroupModals/EditGroupModal";
import Pagination from "@/components/ui/Pagination/Pagination";
import {
  FullPageSkeleton,
  ExpenseListSkeleton,
  BalanceSkeleton,
} from "./GroupLoadingSkeletons";
import styles from "./group-details.module.scss";
import {
  clearGroupDetails,
  fetchGroupDetailsAction,
} from "@/store/slices/groupSlice";
import { EXPENSE_TYPE } from "@expense-tracker/shared";

import type { GroupMember, Expense, GroupBalance } from "@/lib/types";

// New modular components
import GroupHeader from "@/components/dashboard/GroupDetails/GroupHeader/GroupHeader";
import GroupTabs from "@/components/dashboard/GroupDetails/GroupTabs/GroupTabs";
import ExpenseFilters from "@/components/dashboard/GroupDetails/ExpenseFilters/ExpenseFilters";
import ExpenseCard from "@/components/dashboard/GroupDetails/ExpenseCard/ExpenseCard";
import SettlementCard from "@/components/dashboard/GroupDetails/SettlementCard/SettlementCard";
import GroupStats from "@/components/dashboard/GroupDetails/GroupStats/GroupStats";
import MemberItem from "@/components/dashboard/GroupDetails/MemberItem/MemberItem";

export default function GroupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { groupDetails } = useAppSelector((s) => s.groups);

  const {
    groupExpenses,
    isLoading: expensesLoading,
    groupSummaries,
  } = useAppSelector((s) => s.expenses);

  const { groupBalances, isLoading: balancesLoading } = useAppSelector(
    (s) => s.settlements,
  );

  const { user } = useAppSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState<"expenses" | "settlements">(
    "expenses",
  );
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<GroupBalance | null>(
    null,
  );
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filters state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expenseStatus, setExpenseStatus] = useState("");
  const [settlementStatus, setSettlementStatus] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    expenseStatus: "",
    settlementStatus: "",
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { pagination } = useAppSelector((s) => s.expenses);

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

  useEffect(() => {
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
  }, [id, dispatch, currentPage, limit, appliedFilters, activeTab]);

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

  const handleOpenBulkModal = (balance: GroupBalance) => {
    setSelectedBalance(balance);
    setIsBulkModalOpen(true);
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
        onInvite={() => setIsInviteModalOpen(true)}
        onAddExpense={() => setIsExpenseModalOpen(true)}
        onEdit={isAdmin ? () => setIsEditModalOpen(true) : undefined}
      />

      <div className={styles.contentGrid}>
        <main className={styles.mainColumn}>
          <GroupTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isFilterExpanded={isFilterExpanded}
            setIsFilterExpanded={setIsFilterExpanded}
            hasFiltersApplied={hasFiltersApplied}
          />

          {activeTab === "expenses" && isFilterExpanded && (
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
            />
          )}

          {activeTab === "expenses" ? (
            <div className={styles.expenseSection}>
              {expensesLoading ? (
                <ExpenseListSkeleton count={limit} />
              ) : groupExpenses.length > 0 ? (
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

              {pagination && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  totalResults={pagination.total}
                  pageSize={limit}
                />
              )}
            </div>
          ) : (
            <div className={styles.settlements}>
              {balancesLoading ||
              (groupDetails.isLoading && groupBalances.length === 0) ? (
                <BalanceSkeleton />
              ) : groupBalances.length > 0 ? (
                groupBalances.map((balance: GroupBalance, index: number) => (
                  <SettlementCard
                    key={`balance-${index}`}
                    balance={balance}
                    user={user}
                    onAction={handleOpenBulkModal}
                  />
                ))
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

        <aside className={styles.sidebarColumn}>
          <GroupStats
            groupDetails={groupDetails}
            totalGroupSpend={totalGroupSpend}
            netPosition={netPosition}
            summary={currentGroupSummary}
          />

          <section className={styles.sidebarSection}>
            <h3>
              Members{" "}
              <span className={styles.memberCount}>({members.length})</span>
            </h3>
            <div className={styles.memberList}>
              {members.map((member: GroupMember) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  currentUser={user}
                />
              ))}
            </div>
            <div className={styles.sidebarBtnWrapper}>
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <HiOutlineUserAdd /> Add Member
                </div>
              </Button>
            </div>
          </section>
        </aside>
      </div>

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseType={EXPENSE_TYPE.GROUP}
      />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        groupId={id as string}
        groupName={groupDetails?.data?.name || ""}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        groupId={id as string}
        existingMemberIds={members.map((m: GroupMember) => m.user_id)}
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
    </div>
  );
}
