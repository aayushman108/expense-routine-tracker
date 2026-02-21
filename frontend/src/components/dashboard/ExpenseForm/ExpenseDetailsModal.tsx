"use client";

import { useEffect, useState } from "react";
import {
  HiOutlineCash,
  HiOutlineCalendar,
  HiOutlineUserCircle,
  HiCheckCircle,
  HiOutlineReceiptTax,
  HiOutlineShoppingBag,
  HiOutlineLightBulb,
  HiOutlineTruck,
  HiOutlineCreditCard,
} from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchExpenseById } from "@/store/slices/expenseSlice";
import type { Expense, ExpenseSplit } from "@/lib/types";
import styles from "./ExpenseDetailsModal.module.scss";

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
  const { user } = useAppSelector((state) => state.auth);

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
            <div className={styles.categoryIcon}>
              {getCategoryIcon(details.description || "")}
            </div>
            <h2 className={styles.title}>{details.description}</h2>
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
                className={`${styles.badge} ${styles.paid}`}
                style={{
                  background: "var(--color-success-light)",
                  color: "var(--color-success)",
                }}
              >
                Fully Paid
              </span>
            </div>
            <div className={styles.payerCard}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {details.payer?.avatar?.url ? (
                    <img
                      src={details.payer.avatar.url}
                      alt={details.payer.full_name}
                    />
                  ) : (
                    getInitials(details.payer?.full_name || details.payer_name)
                  )}
                </div>
                <div className={styles.details}>
                  <span className={styles.name}>
                    {details.paid_by === user?.id
                      ? "You (Original Payer)"
                      : details.payer?.full_name || details.payer_name}
                  </span>
                  <span className={styles.sub}>
                    Primary transaction account
                  </span>
                </div>
              </div>
              <div className={styles.checkIcon}>
                <HiCheckCircle />
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
              {details.splits?.map((split: ExpenseSplit) => {
                const isCurrentUser = split.user?.id === user?.id;
                const isPayer = split.user?.id === details.paid_by;
                const status = isPayer
                  ? "payer"
                  : split.settlement?.status || "pending";

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
                      <span className={styles.name}>
                        {isCurrentUser ? "You" : split.user?.full_name}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div className={styles.right}>
                        <span className={styles.amount}>
                          {details.currency}{" "}
                          {Number(split.split_amount).toLocaleString(
                            undefined,
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                        <span className={styles.percentage}>
                          Allocation: {split.split_percentage}%
                        </span>
                      </div>

                      <div className={styles.statusArea}>
                        <span
                          className={`${styles.statusBadge} ${styles[status]}`}
                        >
                          {status === "payer" ? "Payer" : status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className={styles.footer}>
            <Button variant="outline" onClick={onClose}>
              Dismiss
            </Button>
            {details.settlement_status === "pending" &&
              details.paid_by !== user?.id && (
                <Button variant="primary">Settle Balance</Button>
              )}
          </div>
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
