"use client";

import { useState } from "react";
import { HiOutlineMail, HiOutlinePaperAirplane } from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { useAppDispatch } from "@/store/hooks";
import { addToast } from "@/store/slices/uiSlice";
import { GroupValidation } from "@expense-tracker/shared/validationSchema";
import { validateData } from "@/lib/validation";
import api from "@/lib/api";
import styles from "./group-member-modals.module.scss";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export default function InviteUserModal({
  isOpen,
  onClose,
  groupId,
  groupName,
}: InviteUserModalProps) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [sent, setSent] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const result = validateData(GroupValidation.inviteMemberSchema, {
      body: { email },
    });
    if (!result.success && result.errors) {
      setValidationErrors(result.errors);
      return;
    }

    setIsSending(true);
    setValidationErrors({});

    try {
      await api.post(`/groups/${groupId}/invite`, { email: email.trim() });
      setSent(true);
      dispatch(
        addToast({
          type: "success",
          message: `Invitation sent to ${email}`,
        }),
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send invitation";
      dispatch(addToast({ type: "error", message: msg }));
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSent(false);
    setIsSending(false);
    setValidationErrors({});
    onClose();
  };

  const handleSendAnother = () => {
    setEmail("");
    setSent(false);
    setValidationErrors({});
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors({});
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite to Group"
      footer={
        !sent ? (
          <>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSend()}
              disabled={isSending}
            >
              {isSending ? (
                "Sending..."
              ) : (
                <>
                  <HiOutlinePaperAirplane /> Send Invite
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={handleClose}>
              Done
            </Button>
            <Button variant="outline" onClick={handleSendAnother}>
              Invite Another
            </Button>
          </>
        )
      }
    >
      {!sent ? (
        <form className={styles.inviteForm} onSubmit={handleSend} noValidate>
          <div className={styles.infoBlock}>
            <div className={styles.infoIcon}>
              <HiOutlineMail />
            </div>
            <div>
              <p className={styles.infoTitle}>
                Invite someone to <strong>{groupName}</strong>
              </p>
              <p className={styles.infoText}>
                They&apos;ll receive an email with a link to register and join
                this group.
              </p>
            </div>
          </div>

          <Input
            label="Email Address"
            name="invite_email"
            type="email"
            placeholder="user@example.com"
            icon={<HiOutlineMail />}
            value={email}
            onChange={handleEmailChange}
            error={validationErrors.email}
            required
          />
        </form>
      ) : (
        <div className={styles.successState}>
          <div className={styles.successIcon}>✉️</div>
          <h3>Invitation Sent!</h3>
          <p>
            An email has been sent to <strong>{email}</strong> with an
            invitation to join <strong>{groupName}</strong>.
          </p>
          <p className={styles.subtleNote}>
            They&apos;ll need to create an account to accept the invitation.
          </p>
        </div>
      )}
    </Modal>
  );
}
