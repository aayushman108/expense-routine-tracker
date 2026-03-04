import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import { HiOutlineLockClosed } from "react-icons/hi";
import styles from "./ChangePasswordForm.module.scss";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast } from "@/store/slices/uiSlice";
import { changePassword } from "@/store/slices/authSlice";
import { RootState } from "@/store";

interface ChangePasswordFormProps {
  closeModal: () => void;
}

export function ChangePasswordForm({ closeModal }: ChangePasswordFormProps) {
  const dispatch = useAppDispatch();
  const { isLoading: authLoading } = useAppSelector((s: RootState) => s.auth);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      dispatch(
        addToast({ type: "error", message: "New passwords do not match." }),
      );
      return;
    }

    const result = await dispatch(changePassword(passwordForm));
    if (changePassword.fulfilled.match(result)) {
      dispatch(
        addToast({
          type: "success",
          message: "Password changed successfully!",
        }),
      );
      closeModal();
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      dispatch(
        addToast({
          type: "error",
          message: (result.payload as string) || "Failed to change password.",
        }),
      );
    }
  };

  return (
    <form onSubmit={handlePasswordSubmit} className={styles.pmForm}>
      <Input
        label="Old Password"
        name="oldPassword"
        type="password"
        value={passwordForm.oldPassword}
        onChange={handlePasswordChange}
        icon={<HiOutlineLockClosed />}
        placeholder="••••••••"
        required
      />
      <Input
        label="New Password"
        name="newPassword"
        type="password"
        value={passwordForm.newPassword}
        onChange={handlePasswordChange}
        icon={<HiOutlineLockClosed />}
        placeholder="••••••••"
        required
      />
      <Input
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        value={passwordForm.confirmPassword}
        onChange={handlePasswordChange}
        icon={<HiOutlineLockClosed />}
        placeholder="••••••••"
        required
      />

      <div className={styles.modalFooter}>
        <Button variant="ghost" type="button" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" isLoading={authLoading}>
          Update Password
        </Button>
      </div>
    </form>
  );
}
