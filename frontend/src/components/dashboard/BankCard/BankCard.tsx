import React, { useState } from "react";
import styles from "./BankCard.module.scss";
import {
  HiOutlineDuplicate,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineQrcode,
} from "react-icons/hi";
import type { PaymentMethod } from "@/lib/types";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Modal from "@/components/ui/Modal/Modal";
import { PaymentDetailsForm } from "../PaymentDetailsForm/PaymentDetailsForm";
import { FORM_MODE } from "@expense-tracker/shared";
import { deletePaymentMethod } from "@/store/slices/paymentMethodSlice";
import { addToast } from "@/store/slices/uiSlice";
import Button from "@/components/ui/Button/Button";
import { RootState } from "@/store";
import { handleThunk } from "@/lib/utils";

interface BankCardProps {
  pm: PaymentMethod;
  handleCopyToClipboard: (text: string, label: string) => void;
  readOnly?: boolean;
}

export function BankCard({ pm, handleCopyToClipboard, readOnly }: BankCardProps) {
  const dispatch = useAppDispatch();
  const { isLoading: pmLoading } = useAppSelector(
    (s: RootState) => s.paymentMethods,
  );

  const meta = (pm.metadata || {}) as Record<string, string>;

  const [editingPM, setEditingPM] = useState<PaymentMethod | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openEditModal = (pm: PaymentMethod) => {
    setEditingPM(pm);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await handleThunk(
      dispatch(deletePaymentMethod(deleteId)),
      () => {
        dispatch(
          addToast({ type: "success", message: "Payment method removed." }),
        );
      },
      () => {
        dispatch(
          addToast({
            type: "error",
            message: "Failed to delete payment method.",
          }),
        );
      },
    );
    setDeleteId(null);
  };

  return (
    <>
      <div key={pm.id} className={styles.bankCardModern}>
        <div className={styles.infoSide}>
          <div className={styles.bankHeader}>
            <div className={styles.bankChip} />
            <span className={styles.bankName}>{meta.bankName}</span>
            {pm.is_default && (
              <span className={styles.defaultBadge}>Default</span>
            )}
          </div>

          <div className={styles.mainAccount}>
            <span className={styles.label}>Account Number</span>
            <div className={styles.numberRow}>
              <span className={styles.number}>
                {meta.accountNumber?.replace(/(.{4})/g, "$1 ")}
              </span>
              <button
                className={styles.copyBtn}
                onClick={() =>
                  handleCopyToClipboard(meta.accountNumber, "Account Number")
                }
              >
                <HiOutlineDuplicate />
              </button>
            </div>
          </div>

          <div className={styles.auxInfo}>
            <div className={styles.item}>
              <span className={styles.al}>HOLDER</span>
              <span className={styles.av}>{meta.accountHolder}</span>
            </div>
            {!readOnly && (
              <div className={styles.pmActionsOverlay}>
                <button onClick={() => openEditModal(pm)}>
                  <HiOutlinePencil />
                </button>
                <button
                  className={styles.danger}
                  onClick={() => setDeleteId(pm.id)}
                >
                  <HiOutlineTrash />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.qrSide}>
          <div className={styles.qrWrapper}>
            {meta.qrCode ? (
              <Image src={meta.qrCode} alt="QR" fill />
            ) : (
              <HiOutlineQrcode />
            )}
            {!meta.qrCode && (
              <div className={`${styles.qrOverlay} ${styles.visible}`}>
                NO QR
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Update Payment Method Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={"Update Payment Method"}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="payment-details-form"
              variant="primary"
              isLoading={pmLoading}
            >
              Update Payment Method
            </Button>
          </>
        }
      >
        <PaymentDetailsForm
          pm={editingPM}
          mode={FORM_MODE.EDIT}
          closeModal={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Remove Payment Method"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={pmLoading}
            >
              <HiOutlineTrash /> Remove
            </Button>
          </>
        }
      >
        <div className={styles.deleteConfirm}>
          <p>
            Are you sure you want to remove this payment method? This action
            cannot be undone.
          </p>
        </div>
      </Modal>
    </>
  );
}
