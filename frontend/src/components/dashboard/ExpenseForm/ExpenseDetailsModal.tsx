"use client";

import { useEffect, useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineUserCircle,
  HiCheckCircle,
  HiOutlineReceiptTax,
  HiOutlineShoppingBag,
  HiOutlineLightBulb,
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineQrcode,
  HiOutlineDuplicate,
  HiCheck,
  HiPencil,
  HiTrash,
} from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import AddExpenseModal from "./AddExpenseModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchExpenseById,
  updateSplitStatus,
  updateExpense,
  deleteExpense,
} from "@/store/slices/expenseSlice";
import {
  SETTLEMENT_STATUS,
  SPLIT_STATUS,
  EXPENSE_STATUS,
  EXPENSE_TYPE,
} from "@expense-tracker/shared";
import type { Expense, ExpenseSplit } from "@/lib/types";
import styles from "./ExpenseDetailsModal.module.scss";
import { HiXCircle } from "react-icons/hi";

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string | null;
}

export default function ExpenseDetailsModal({
  isOpen,
  onClose,
  expenseId,
}: ExpenseDetailsModalProps) {
  const dispatch = useAppDispatch();
  const [details, setDetails] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"wallets" | "bank">("wallets");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (isOpen && expenseId) {
      setLoading(true);
      dispatch(fetchExpenseById(expenseId))
        .unwrap()
        .then((data: Expense) => {
          setDetails(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isOpen, expenseId, dispatch]);

  const handleUpdateSplitStatus = async (
    splitId: string,
    status: SPLIT_STATUS,
  ) => {
    if (!expenseId) return;
    try {
      await dispatch(
        updateSplitStatus({ expenseId, splitId, status }),
      ).unwrap();
      // Refetch to get updated status and potentially updated overall expense status
      const data = await dispatch(fetchExpenseById(expenseId)).unwrap();
      setDetails(data);
    } catch (error) {
      console.error("Failed to update split status:", error);
    }
  };

  const handleUpdateExpenseStatus = async (status: EXPENSE_STATUS) => {
    if (!expenseId) return;
    try {
      await dispatch(
        updateExpense({ id: expenseId, body: { expenseStatus: status } }),
      ).unwrap();
      const data = await dispatch(fetchExpenseById(expenseId)).unwrap();
      setDetails(data);
    } catch (error) {
      console.error("Failed to update expense status:", error);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseId) return;
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await dispatch(deleteExpense(expenseId)).unwrap();
        onClose();
      } catch (error) {
        console.error("Failed to delete expense:", error);
      }
    }
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

  const getCategoryIcon = (desc: string) => {
    const d = desc.toLowerCase();
    if (
      d.includes("food") ||
      d.includes("eat") ||
      d.includes("grocer") ||
      d.includes("dinner") ||
      d.includes("lunch")
    )
      return <HiOutlineShoppingBag />;
    if (
      d.includes("bill") ||
      d.includes("rent") ||
      d.includes("electric") ||
      d.includes("wifi")
    )
      return <HiOutlineLightBulb />;
    if (
      d.includes("travel") ||
      d.includes("uber") ||
      d.includes("petrol") ||
      d.includes("taxi")
    )
      return <HiOutlineTruck />;
    if (d.includes("pay") || d.includes("card") || d.includes("subscription"))
      return <HiOutlineCreditCard />;
    return <HiOutlineReceiptTax />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Expense Breakdown"
      size="lg"
    >
      {loading ? (
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
                {details.paid_by === user?.id &&
                  details.expense_status === EXPENSE_STATUS.DRAFT && (
                    <button
                      className={styles.submitBtn}
                      onClick={() =>
                        handleUpdateExpenseStatus(EXPENSE_STATUS.SUBMITTED)
                      }
                    >
                      Submit Expense
                    </button>
                  )}
                {details.paid_by === user?.id && (
                  <div className={styles.actionButtons}>
                    {/* Only show Edit/Delete for non-verified group expenses */}
                    {details.expense_type === EXPENSE_TYPE.GROUP &&
                    details.expense_status !== EXPENSE_STATUS.VERIFIED
                      ? (details.expense_status === EXPENSE_STATUS.DRAFT ||
                          details.expense_status === EXPENSE_STATUS.SUBMITTED ||
                          details.expense_status ===
                            EXPENSE_STATUS.REJECTED) && (
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
                              onClick={handleDeleteExpense}
                              title="Delete Expense"
                            >
                              <HiTrash />
                            </button>
                          </>
                        )
                      : null}
                    {/* Special case for personal expense: always show */}
                    {details.expense_type === EXPENSE_TYPE.PERSONAL && (
                      <>
                        <button
                          className={styles.editBtn}
                          onClick={() => setIsEditModalOpen(true)}
                          title="Edit Personal Expense"
                        >
                          <HiPencil />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={handleDeleteExpense}
                          title="Delete Personal Expense"
                        >
                          <HiTrash />
                        </button>
                      </>
                    )}
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
                className={`${styles.badge} ${!details.group_id ? styles.personal : styles[details.settlement_status || SETTLEMENT_STATUS.PENDING]}`}
              >
                {!details.group_id
                  ? "Personal"
                  : details.settlement_status === SETTLEMENT_STATUS.CONFIRMED
                    ? "Settled"
                    : details.settlement_status === SETTLEMENT_STATUS.PAID
                      ? "Paid"
                      : "Pending"}
              </span>
            </div>
            <div className={styles.payerCard}>
              <div
                className={styles.mainInfo}
                onClick={() => setIsPaymentOpen(!isPaymentOpen)}
              >
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {details.payer?.avatar?.url ? (
                      <img
                        src={details.payer.avatar.url}
                        alt={details.payer.full_name}
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
                        : details.payer?.full_name || details.payer_name}
                    </span>
                    <span className={styles.sub}>
                      {details.paid_by === user?.id
                        ? "You covered this full expense"
                        : isPaymentOpen
                          ? "Click to hide settlement details"
                          : "View settlement & payment info"}
                    </span>
                  </div>
                </div>
                <div className={styles.rightSide}>
                  {details.paid_by !== user?.id && (
                    <div className={styles.paymentBadge}>
                      <HiOutlineQrcode />
                      <span>
                        {isPaymentOpen ? "Hide Details" : "Payment Details"}
                      </span>
                    </div>
                  )}
                  <div className={styles.checkIcon}>
                    <HiCheckCircle />
                  </div>
                </div>
              </div>

              {details.paid_by !== user?.id && (
                <div
                  className={`${styles.paymentCollapse} ${
                    isPaymentOpen ? styles.open : ""
                  }`}
                >
                  <div className={styles.collapseInner}>
                    <div className={styles.tabs}>
                      <div
                        className={`${styles.tab} ${
                          activeTab === "wallets" ? styles.active : ""
                        }`}
                        onClick={() => setActiveTab("wallets")}
                      >
                        Wallets
                      </div>
                      <div
                        className={`${styles.tab} ${
                          activeTab === "bank" ? styles.active : ""
                        }`}
                        onClick={() => setActiveTab("bank")}
                      >
                        Bank Account
                      </div>
                    </div>

                    <div className={styles.tabContent}>
                      {activeTab === "wallets" ? (
                        <div className={styles.modernWallets}>
                          {details.payer_payment_methods
                            ?.filter(
                              (pm) =>
                                !pm.provider.toLowerCase().includes("bank"),
                            )
                            .map((pm) => {
                              const meta = (pm.metadata || {}) as Record<
                                string,
                                string
                              >;
                              const isKhalti = pm.provider
                                .toLowerCase()
                                .includes("khalti");
                              return (
                                <div
                                  key={pm.id}
                                  className={`${styles.modernWalletCard} ${
                                    isKhalti ? styles.khalti : styles.esewa
                                  }`}
                                >
                                  <div className={styles.cardHeader}>
                                    <div className={styles.providerLogo}>
                                      {pm.provider.toUpperCase()}
                                    </div>
                                  </div>
                                  <div className={styles.cardBody}>
                                    <div className={styles.infoSide}>
                                      <span className={styles.label}>
                                        Account ID
                                      </span>
                                      <div className={styles.idRow}>
                                        <span className={styles.value}>
                                          {meta.phone || meta.username || "—"}
                                        </span>
                                        <button
                                          className={styles.copyBtn}
                                          onClick={() =>
                                            copyToClipboard(
                                              meta.phone || meta.username || "",
                                              pm.id,
                                            )
                                          }
                                        >
                                          {copiedId === pm.id ? (
                                            <HiCheck />
                                          ) : (
                                            <HiOutlineDuplicate />
                                          )}
                                        </button>
                                      </div>
                                      <span className={styles.name}>
                                        {meta.name ||
                                          details.payer?.full_name ||
                                          details.payer_name}
                                      </span>
                                    </div>
                                    <div className={styles.qrSide}>
                                      <div className={styles.qrWrapper}>
                                        {meta.qrCode ? (
                                          <img src={meta.qrCode} alt="QR" />
                                        ) : (
                                          <HiOutlineQrcode />
                                        )}
                                        <div className={styles.qrOverlay}>
                                          SCAN
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          {(details.payer_payment_methods?.filter(
                            (pm) => !pm.provider.toLowerCase().includes("bank"),
                          ).length ?? 0) === 0 && (
                            <div className={styles.noPm}>
                              No wallet payment methods available.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={styles.modernBankWrapper}>
                          {details.payer_payment_methods
                            ?.filter((pm) =>
                              pm.provider.toLowerCase().includes("bank"),
                            )
                            .map((pm) => {
                              const meta = (pm.metadata || {}) as Record<
                                string,
                                string
                              >;
                              return (
                                <div
                                  key={pm.id}
                                  className={styles.bankCardModern}
                                >
                                  <div className={styles.infoSide}>
                                    <div className={styles.bankHeader}>
                                      <div className={styles.bankChip} />
                                      <span className={styles.bankName}>
                                        {meta.bankName}
                                      </span>
                                    </div>

                                    <div className={styles.mainAccount}>
                                      <span className={styles.label}>
                                        Account Number
                                      </span>
                                      <div className={styles.numberRow}>
                                        <span className={styles.number}>
                                          {meta.accountNumber?.replace(
                                            /(.{4})/g,
                                            "$1 ",
                                          )}
                                        </span>
                                        <button
                                          className={styles.copyBtn}
                                          onClick={() =>
                                            copyToClipboard(
                                              meta.accountNumber || "",
                                              pm.id,
                                            )
                                          }
                                        >
                                          {copiedId === pm.id ? (
                                            <HiCheck />
                                          ) : (
                                            <HiOutlineDuplicate />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    <div className={styles.auxInfo}>
                                      <div className={styles.item}>
                                        <span className={styles.al}>
                                          HOLDER
                                        </span>
                                        <span className={styles.av}>
                                          {meta.accountHolder}
                                        </span>
                                      </div>
                                      {meta.info && (
                                        <div className={styles.item}>
                                          <span className={styles.al}>
                                            INFO
                                          </span>
                                          <span className={styles.av}>
                                            {meta.info}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className={styles.qrSide}>
                                    <div className={styles.qrWrapper}>
                                      {meta.qrCode ? (
                                        <img src={meta.qrCode} alt="QR" />
                                      ) : (
                                        <HiOutlineQrcode />
                                      )}
                                      <div className={styles.qrOverlay}>
                                        SCAN
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          {(details.payer_payment_methods?.filter((pm) =>
                            pm.provider.toLowerCase().includes("bank"),
                          ).length ?? 0) === 0 && (
                            <div className={styles.noPm}>
                              No bank payment methods available.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
              {details.splits?.map((split: ExpenseSplit) => {
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
                          <img
                            src={split.user.avatar.url}
                            alt={split.user.full_name}
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
                        details.expense_status !== EXPENSE_STATUS.DRAFT &&
                        split.split_status === SPLIT_STATUS.PENDING && (
                          <div className={styles.splitActions}>
                            <button
                              className={`${styles.actionBtn} ${styles.verify}`}
                              title="Verify Split"
                              onClick={() =>
                                handleUpdateSplitStatus(
                                  split.id,
                                  SPLIT_STATUS.VERIFIED,
                                )
                              }
                            >
                              <HiCheck />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.reject}`}
                              title="Reject Split"
                              onClick={() =>
                                handleUpdateSplitStatus(
                                  split.id,
                                  SPLIT_STATUS.REJECTED,
                                )
                              }
                            >
                              <HiXCircle />
                            </button>
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
            // Refetch details after edit
            if (expenseId) {
              dispatch(fetchExpenseById(expenseId))
                .unwrap()
                .then((data: Expense) => setDetails(data));
            }
          }}
          expenseType={details.expense_type as EXPENSE_TYPE}
          expense={details}
        />
      )}
    </Modal>
  );
}
