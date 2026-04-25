import React from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger" | "secondary";
  isLoading?: boolean;
  confirmDisabled?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  isLoading = false,
  confirmDisabled = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            isLoading={isLoading}
            disabled={confirmDisabled}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {message}
      </div>
    </Modal>
  );
}
