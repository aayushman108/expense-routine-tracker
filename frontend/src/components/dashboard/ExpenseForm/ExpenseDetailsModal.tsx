"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  HiOutlineCalendar,
  HiOutlineUserCircle,
  HiCheck,
  HiPencil,
  HiTrash,
  HiXCircle,
} from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import AddExpenseModal from "./AddExpenseModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchExpenseById,
  updateSplitStatus,
  updateExpense,
  deleteExpense,
  fetchUserGroupSummaries,
} from "@/store/slices/expenseSlice";
import {
  SETTLEMENT_STATUS,
  SPLIT_STATUS,
  EXPENSE_STATUS,
  EXPENSE_TYPE,
} from "@expense-tracker/shared";
import type { Expense, ExpenseSplit } from "@/lib/types";
import { handleThunk } from "@/lib/utils";
import styles from "./ExpenseDetailsModal.module.scss";
import { fetchGroupSettlementBalances } from "@/store/slices/settlementSlice";
import { useParams } from "next/navigation";

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string | null;
  fetchCb?: () => void;
}

export default function ExpenseDetailsModal({
  isOpen,
  onClose,
  expenseId,
  fetchCb,
}: ExpenseDetailsModalProps) {
  const { id: groupId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const {
    currentExpense: details,
    isDetailsLoading,
    isSubmitting,
  } = useAppSelector((state) => state.expenses);

  const fetchExpenseDetails = useCallback(() => {
    if (!isOpen || !expenseId) return;
    handleThunk(dispatch(fetchExpenseById(expenseId)));
  }, [isOpen, expenseId, dispatch]);

  useEffect(() => {
    fetchExpenseDetails();
  }, [fetchExpenseDetails]);

  const handleUpdateSplitStatus = async (
    splitId: string,
    status: SPLIT_STATUS,
  ) => {
    if (!expenseId) return;
    setSubmittingAction(`${splitId}-${status}`);
    await handleThunk(
      dispatch(updateSplitStatus({ expenseId, splitId, status })),
      () => {
        handleThunk(dispatch(fetchExpenseById(expenseId)), (data: Expense) => {
          if (data?.expense_status === EXPENSE_STATUS.VERIFIED) {
            dispatch(fetchGroupSettlementBalances(groupId));
            dispatch(fetchUserGroupSummaries());
          }
        });
        setSubmittingAction(null);
      },
      (error) => {
        console.error("Failed to update split status:", error);
        setSubmittingAction(null);
      },
    );
  };

  const handleUpdateExpenseStatus = async (status: EXPENSE_STATUS) => {
    if (!expenseId) return;
    setSubmittingAction(`${expenseId}-${status}`);
    await handleThunk(
      dispatch(
        updateExpense({ id: expenseId, body: { expenseStatus: status } }),
      ),
      () => {
        fetchCb?.();
        setSubmittingAction(null);
        onClose();
      },
      (error) => {
        setSubmittingAction(null);
        console.error("Failed to update expense status:", error);
      },
    );
  };

  const handleDeleteExpense = async () => {
    if (!expenseId) return;
    setSubmittingAction(`${expenseId}-delete`);
    await handleThunk(
      dispatch(deleteExpense(expenseId)),
      () => {
        setIsDeleteConfirmOpen(false);
        fetchCb?.();
        setSubmittingAction(null);
        onClose();
      },
      (error) => {
        setSubmittingAction(null);
        console.error("Failed to delete expense:", error);
      },
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOwner = details?.paid_by === user?.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Expense Breakdown"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {isOwner && details?.expense_status === EXPENSE_STATUS.DRAFT && (
            <Button
              variant="primary"
              onClick={() =>
                handleUpdateExpenseStatus(EXPENSE_STATUS.SUBMITTED)
              }
              isLoading={
                submittingAction === `${expenseId}-${EXPENSE_STATUS.SUBMITTED}`
              }
              disabled={isSubmitting}
            >
              Submit Expense
            </Button>
          )}
        </>
      }
    >
      {isDetailsLoading ? (
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <span>Fetching transaction details...</span>
        </div>
      ) : details ? (
        <div className={styles.modalContent}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>{details.description}</h2>
              <div className={styles.tagsRow}>
                <span
                  className={`${styles.tag} ${styles[details.expense_status]}`}
                >
                  STATUS - {details.expense_status.toUpperCase()}
                </span>
                {isOwner && (
                  <div className={styles.actionButtons}>
                    {details?.expense_status !== EXPENSE_STATUS.VERIFIED ? (
                      <>
                        <button
                          className={styles.editBtn}
                          onClick={() => setIsEditModalOpen(true)}
                          title="Edit Expense"
                        >
                          <HiPencil />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => setIsDeleteConfirmOpen(true)}
                          title="Delete Expense"
                        >
                          <HiTrash />
                        </button>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.date}>
              <HiOutlineCalendar /> {formatDate(details.expense_date)}
            </div>
          </div>

          <div className={styles.amountDisplay}>
            <span className={styles.label}>Transaction Amount</span>
            <div className={styles.value}>
              <span className={styles.currency}>{details.currency}</span>
              {Number(details.total_amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          <section className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h3>Payment Source</h3>
              <span
                className={`${styles.badge} ${styles[details?.settlement_status || SETTLEMENT_STATUS.PENDING]}`}
              >
                {details?.settlement_status === SETTLEMENT_STATUS.CONFIRMED
                  ? "Settled"
                  : details?.settlement_status === SETTLEMENT_STATUS.PAID
                    ? "Paid"
                    : "Pending"}
              </span>
            </div>
            <div className={styles.payerCard}>
              <div className={styles.mainInfo}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {details.payer?.avatar?.url ? (
                      <Image
                        src={details.payer.avatar.url}
                        alt={details.payer.full_name || "Payer"}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      getInitials(
                        details.payer?.full_name || details.payer_name,
                      )
                    )}
                  </div>
                  <div className={styles.details}>
                    <span className={styles.name}>
                      {details.paid_by === user?.id
                        ? "You (Original Payer)"
                        : details?.payer?.full_name || details.payer_name}
                    </span>
                    {isOwner ? (
                      <span className={styles.sub}>
                        You covered this full expense
                      </span>
                    ) : (
                      <span className={styles.sub}>{details.payer?.email}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h3>Distribution & Status</h3>
              <span
                className={styles.badge}
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-tertiary)",
                }}
              >
                {details.splits?.length} Participants
              </span>
            </div>
            <div className={styles.splitsContainer}>
              {details?.splits?.map((split: ExpenseSplit) => {
                const isCurrentUser = split.user?.id === user?.id;
                const isPayer = split.user?.id === details.paid_by;
                const settlementStatus =
                  split.settlement?.status || SETTLEMENT_STATUS.PENDING;
                const isExpenseVerified =
                  details.expense_status === EXPENSE_STATUS.VERIFIED;

                // Determine badge properties based on split_status
                const splitStatusClass =
                  split.split_status === SPLIT_STATUS.REJECTED
                    ? styles.splitRejected
                    : split.split_status === SPLIT_STATUS.VERIFIED
                      ? styles.splitVerified
                      : styles.splitPending;

                const splitStatusText = `STATUS · ${split.split_status.toUpperCase()}`;
                const settlementStatusText = `SETTLEMENT · ${settlementStatus.toUpperCase()}`;
                const settlementStatusClass =
                  styles[settlementStatus] || styles.pending;

                return (
                  <div key={split.id} className={styles.splitRow}>
                    <div className={styles.left}>
                      <div className={styles.miniAvatar}>
                        {split.user?.avatar?.url ? (
                          <Image
                            src={split.user.avatar.url}
                            alt={split.user.full_name || "User"}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          getInitials(split.user?.full_name)
                        )}
                      </div>
                      <div className={styles.infoCol}>
                        <span className={styles.name}>
                          {isCurrentUser ? "You (Me)" : split.user?.full_name}
                        </span>
                        {isPayer && (
                          <span className={styles.payerLabel}>Payer</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.right}>
                      <span className={styles.amount}>
                        {details.currency}{" "}
                        {Number(split.split_amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span className={styles.percentage}>
                        Allocation: {split.split_percentage}%
                      </span>
                    </div>

                    <div className={styles.statusArea}>
                      {/* Always show Split Status */}
                      <span
                        className={`${styles.statusBadge} ${splitStatusClass}`}
                      >
                        {splitStatusText}
                      </span>

                      {/* Show Settlement status only when all splits are verified and it's not the payer */}
                      {isExpenseVerified && !isPayer && (
                        <span
                          className={`${styles.statusBadge} ${settlementStatusClass}`}
                        >
                          {settlementStatusText}
                        </span>
                      )}

                      {isCurrentUser &&
                        details?.expense_status !== EXPENSE_STATUS.DRAFT &&
                        split?.split_status === SPLIT_STATUS.PENDING && (
                          <div className={styles.splitActions}>
                            <Button
                              size="sm"
                              variant="primary"
                              title="Verify Split"
                              onClick={() =>
                                handleUpdateSplitStatus(
                                  split.id,
                                  SPLIT_STATUS.VERIFIED,
                                )
                              }
                              isLoading={
                                submittingAction ===
                                `${split.id}-${SPLIT_STATUS.VERIFIED}`
                              }
                              disabled={isSubmitting}
                            >
                              <HiCheck />
                              <span>Verify</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              title="Reject Split"
                              onClick={() =>
                                handleUpdateSplitStatus(
                                  split.id,
                                  SPLIT_STATUS.REJECTED,
                                )
                              }
                              isLoading={
                                submittingAction ===
                                `${split.id}-${SPLIT_STATUS.REJECTED}`
                              }
                              disabled={isSubmitting}
                            >
                              <HiXCircle />
                              <span>Reject</span>
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <div className={styles.loader}>
          <span style={{ opacity: 0.3 }}>
            <HiOutlineUserCircle size={48} />
          </span>
          <span>No transaction data found.</span>
        </div>
      )}
      {isEditModalOpen && details && (
        <AddExpenseModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
          }}
          fetchCb={() => {
            fetchExpenseDetails();
            fetchCb?.();
          }}
          expenseType={details.expense_type as EXPENSE_TYPE}
          expense={details}
        />
      )}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        isLoading={submittingAction === `${expenseId}-delete`}
      />
    </Modal>
  );
}
