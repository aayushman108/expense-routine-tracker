"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  HiOutlineCalendar,
  HiOutlineUserCircle,
  HiPencil,
  HiTrash,
} from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import AddExpenseModal from "./AddExpenseModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchExpenseById, deleteExpense } from "@/store/slices/expenseSlice";
import { EXPENSE_TYPE, SETTLEMENT_STATUS } from "@expense-tracker/shared";
import type { Expense } from "@/lib/types";
import { handleThunk } from "@/lib/utils";
// Using the shared styles from ExpenseDetailsModal for identical UI
import styles from "./ExpenseDetailsModal.module.scss";

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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
    await handleThunk(
      dispatch(deleteExpense(expenseId)),
      () => {
        setIsSubmitting(false);
        setIsDeleteConfirmOpen(false);
        onClose();
      },
      () => {
        setIsSubmitting(false);
      }
    );
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

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwner = details?.paid_by === user?.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personal Expense"
      size="lg"
      footer={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
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
                <span className={`${styles.tag} ${styles.verified}`}>
                   PERSONAL EXPENSE
                </span>
                {isOwner && (
                  <div className={styles.actionButtons}>
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
                className={`${styles.badge} ${styles[SETTLEMENT_STATUS.PAID]}`}
              >
                Paid
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
                        ? "You"
                        : details?.payer?.full_name || details.payer_name}
                    </span>
                    <span className={styles.sub}>
                      You paid the full amount
                    </span>
                  </div>
                </div>
              </div>
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
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        isLoading={isSubmitting}
      />
    </Modal>
  );
}
