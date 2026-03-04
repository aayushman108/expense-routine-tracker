import styles from "./WalletCard.module.scss";
import {
  HiOutlineDuplicate,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineQrcode,
} from "react-icons/hi";
import type { PaymentMethod } from "@/lib/types";
import { PROVIDER_OPTIONS } from "@/constants";
import type { User } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deletePaymentMethod } from "@/store/slices/paymentMethodSlice";
import { addToast } from "@/store/slices/uiSlice";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import { RootState } from "@/store";
import { PaymentDetailsForm } from "../PaymentDetailsForm/PaymentDetailsForm";
import { FORM_MODE } from "@expense-tracker/shared";

interface WalletCardProps {
  pm: PaymentMethod;
  user: User;
  handleCopyToClipboard: (text: string, label: string) => void;
}

function getProviderLabel(provider: string) {
  return PROVIDER_OPTIONS.find((p) => p.value === provider)?.label || provider;
}

export function WalletCard({
  pm,
  user,
  handleCopyToClipboard,
}: WalletCardProps) {
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
    const result = await dispatch(deletePaymentMethod(deleteId));
    if (deletePaymentMethod.fulfilled.match(result)) {
      dispatch(
        addToast({ type: "success", message: "Payment method removed." }),
      );
    } else {
      dispatch(
        addToast({
          type: "error",
          message: "Failed to delete payment method.",
        }),
      );
    }
    setDeleteId(null);
  };

  return (
    <>
      <div
        key={pm.id}
        className={`${styles.modernWalletCard} ${styles[pm.provider]}`}
      >
        <div className={styles.infoSide}>
          <div className={styles.cardHeader}>
            <div className={styles.providerLogo}>
              {getProviderLabel(pm.provider)}
            </div>
            {pm.is_default && (
              <span
                className={[styles.defaultBadge, styles[pm.provider]].join(" ")}
              >
                Default
              </span>
            )}
          </div>

          <div className={styles.mainAccount}>
            <span className={styles.label}>Account ID</span>
            <div className={styles.numberRow}>
              <span className={styles.number}>
                {meta.phone || meta.username}
              </span>
              <button
                className={styles.copyBtn}
                onClick={() =>
                  handleCopyToClipboard(
                    meta.phone || meta.username,
                    "Account ID",
                  )
                }
              >
                <HiOutlineDuplicate />
              </button>
            </div>
          </div>

          <div className={styles.auxInfo}>
            <div className={styles.item}>
              <span className={styles.al}>HOLDER</span>
              <span className={styles.av}>{meta.name || user?.full_name}</span>
            </div>
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
      >
        <div className={styles.deleteConfirm}>
          <p>
            Are you sure you want to remove this payment method? This action
            cannot be undone.
          </p>
          <div className={styles.modalFooter}>
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
          </div>
        </div>
      </Modal>
    </>
  );
}
