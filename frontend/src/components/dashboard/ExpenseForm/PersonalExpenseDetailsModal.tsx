"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  HiOutlineCalendar,
  HiOutlineUserCircle,
  HiOutlineReceiptTax,
  HiOutlineShoppingBag,
  HiOutlineLightBulb,
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiPencil,
  HiTrash,
} from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import AddExpenseModal from "./AddExpenseModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchExpenseById,
  deleteExpense,
} from "@/store/slices/expenseSlice";
import { EXPENSE_TYPE } from "@expense-tracker/shared";
import type { Expense } from "@/lib/types";
import { handleThunk } from "@/lib/utils";
import styles from "./PersonalExpenseDetailsModal.module.scss";

interface PersonalExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string | null;
}

export default function PersonalExpenseDetailsModal({
  isOpen,
  onClose,
  expenseId,
}: PersonalExpenseDetailsModalProps) {
  const dispatch = useAppDispatch();
  const [details, setDetails] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isOpen || !expenseId) return;

    const fetchDetails = async () => {
      setLoading(true);
      await handleThunk(
        dispatch(fetchExpenseById(expenseId)),
        (data: Expense) => setDetails(data),
      );
      setLoading(false);
    };

    fetchDetails();
  }, [isOpen, expenseId, dispatch]);

  const handleDeleteExpense = async () => {
    if (!expenseId) return;
    if (confirm("Are you sure you want to delete this expense?")) {
      await handleThunk(
        dispatch(deleteExpense(expenseId)),
        () => onClose(),
      );
    }
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

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personal Expense"
      size="md"
    >
      {loading ? (
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <span>Fetching expense details...</span>
        </div>
      ) : details ? (
        <div className={styles.modalContent}>
          {/* Category Icon */}
          <div className={styles.categoryIcon}>
            {getCategoryIcon(details.description || "")}
          </div>

          {/* Title & Date */}
          <div className={styles.header}>
            <h2 className={styles.title}>{details.description}</h2>
            <div className={styles.date}>
              <HiOutlineCalendar /> {formatDate(details.expense_date)}
            </div>
          </div>

          {/* Amount Card */}
          <div className={styles.amountCard}>
            <span className={styles.amountLabel}>Amount</span>
            <div className={styles.amountValue}>
              <span className={styles.currency}>{details.currency}</span>
              {Number(details.total_amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <span className={styles.typeBadge}>Personal Expense</span>
          </div>

          {/* Payer Info */}
          <div className={styles.payerInfo}>
            <div className={styles.avatar}>
              {details.payer?.avatar?.url ? (
                <Image
                  src={details.payer.avatar.url}
                  alt={details.payer.full_name || "User"}
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : (
                getInitials(
                  details.payer?.full_name || details.payer_name,
                )
              )}
            </div>
            <div className={styles.payerDetails}>
              <span className={styles.payerName}>
                {details.paid_by === user?.id
                  ? "You"
                  : details.payer?.full_name || details.payer_name}
              </span>
              <span className={styles.payerSub}>
                Paid the full amount
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {details.paid_by === user?.id && (
            <div className={styles.actions}>
              <button
                className={styles.editBtn}
                onClick={() => setIsEditModalOpen(true)}
              >
                <HiPencil />
                Edit Expense
              </button>
              <button
                className={styles.deleteBtn}
                onClick={handleDeleteExpense}
              >
                <HiTrash />
                Delete
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.loader}>
          <span style={{ opacity: 0.3 }}>
            <HiOutlineUserCircle size={48} />
          </span>
          <span>No expense data found.</span>
        </div>
      )}
      {isEditModalOpen && details && (
        <AddExpenseModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            if (expenseId) {
              handleThunk(
                dispatch(fetchExpenseById(expenseId)),
                (data: Expense) => setDetails(data),
              );
            }
          }}
          expenseType={EXPENSE_TYPE.PERSONAL}
          expense={details}
        />
      )}
    </Modal>
  );
}
