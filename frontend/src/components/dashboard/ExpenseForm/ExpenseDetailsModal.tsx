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
} from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchExpenseById,
  updateSplitStatus,
  updateExpense,
} from "@/store/slices/expenseSlice";
import {
  SETTLEMENT_STATUS,
  SPLIT_STATUS,
  EXPENSE_STATUS,
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
        updateExpense({ id: expenseId, body: { expense_status: status } }),
      ).unwrap();
      const data = await dispatch(fetchExpenseById(expenseId)).unwrap();
      setDetails(data);
    } catch (error) {
      console.error("Failed to update expense status:", error);
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

  const dummyPaymentMethods = [
    {
      id: "1",
      provider: "Khalti",
      external_id: "9841234567",
      is_default: true,
      metadata: { qr_label: "Scan for Khalti" },
    },
    {
      id: "2",
      provider: "eSewa",
      external_id: "9841234567",
      is_default: false,
      metadata: { qr_label: "Scan for eSewa" },
    },
    {
      id: "3",
      provider: "Bank Transfer",
      external_id: "0012345678901",
      is_default: false,
      metadata: {
        bank_name: "Nabil Bank Ltd.",
        branch_name: "New Road, Kathmandu",
        account_name:
          details?.payer?.full_name || details?.payer_name || "Account Holder",
        swift_code: "NABILNPKA",
        qr_label: "Bank QR Payment",
      },
    },
  ];

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
                          {dummyPaymentMethods
                            .filter(
                              (pm) =>
                                !pm.provider.toLowerCase().includes("bank"),
                            )
                            .map((pm) => {
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
                                      {pm.provider}
                                    </div>
                                  </div>
                                  <div className={styles.cardBody}>
                                    <div className={styles.infoSide}>
                                      <span className={styles.label}>
                                        Account ID
                                      </span>
                                      <div className={styles.idRow}>
                                        <span className={styles.value}>
                                          {pm.external_id}
                                        </span>
                                        <button
                                          className={styles.copyBtn}
                                          onClick={() =>
                                            copyToClipboard(
                                              pm.external_id,
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
                                        {details.payer?.full_name ||
                                          details.payer_name}
                                      </span>
                                    </div>
                                    <div className={styles.qrSide}>
                                      <div className={styles.qrWrapper}>
                                        <HiOutlineQrcode />
                                        <div className={styles.qrOverlay}>
                                          SCAN
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className={styles.modernBankWrapper}>
                          {dummyPaymentMethods
                            .filter((pm) =>
                              pm.provider.toLowerCase().includes("bank"),
                            )
                            .map((pm) => (
                              <div
                                key={pm.id}
                                className={styles.bankCardModern}
                              >
                                <div className={styles.infoSide}>
                                  <div className={styles.bankHeader}>
                                    <div className={styles.bankChip} />
                                    <span className={styles.bankName}>
                                      {pm.metadata.bank_name}
                                    </span>
                                  </div>

                                  <div className={styles.mainAccount}>
                                    <span className={styles.label}>
                                      Account Number
                                    </span>
                                    <div className={styles.numberRow}>
                                      <span className={styles.number}>
                                        {pm.external_id.replace(
                                          /(.{4})/g,
                                          "$1 ",
                                        )}
                                      </span>
                                      <button
                                        className={styles.copyBtn}
                                        onClick={() =>
                                          copyToClipboard(pm.external_id, pm.id)
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
                                      <span className={styles.al}>HOLDER</span>
                                      <span className={styles.av}>
                                        {pm.metadata.account_name}
                                      </span>
                                    </div>
                                    <div className={styles.item}>
                                      <span className={styles.al}>SWIFT</span>
                                      <span className={styles.av}>
                                        {pm.metadata.swift_code}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className={styles.qrSide}>
                                  <div className={styles.qrWrapper}>
                                    <HiOutlineQrcode />
                                    <div className={styles.qrOverlay}>SCAN</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          <div className={styles.bankAuxInfo}>
                            <div className={styles.auxRow}>
                              <span>Branch</span>
                              <strong>
                                {dummyPaymentMethods[2].metadata.branch_name}
                              </strong>
                            </div>
                          </div>
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
    </Modal>
  );
}
