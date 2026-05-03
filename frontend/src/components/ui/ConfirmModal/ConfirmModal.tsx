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
  const [localLoading, setLocalLoading] = React.useState(false);
  const isCurrentlyLoading = isLoading || localLoading;

  const handleConfirmClick = async () => {
    let isPromise = false;
    try {
      const result = onConfirm();
      if (result instanceof Promise) {
        isPromise = true;
        setLocalLoading(true);
        await result;
      }
      onClose();
    } catch (error) {
      // Parent should handle error display, we just stop loading
    } finally {
      if (isPromise) {
        setLocalLoading(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      disableClose={isCurrentlyLoading}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isCurrentlyLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirmClick}
            isLoading={isCurrentlyLoading}
            disabled={confirmDisabled || isCurrentlyLoading}
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
