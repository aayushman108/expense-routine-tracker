import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import { HiOutlineLockClosed } from "react-icons/hi";
import styles from "./ChangePasswordForm.module.scss";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast } from "@/store/slices/uiSlice";
import { changePassword } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import { handleThunk } from "@/lib/utils";
import { validateData } from "@/lib/validation";
import { UserValidation } from "@expense-tracker/shared";

interface ChangePasswordFormProps {
  closeModal: () => void;
}

export function ChangePasswordForm({ closeModal }: ChangePasswordFormProps) {
  const dispatch = useAppDispatch();
  const { isLoading: authLoading } = useAppSelector((s: RootState) => s.auth);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateData(UserValidation.changePasswordSchema, {
      body: {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      },
    });

    if (!result.success && result.errors) {
      setValidationErrors(result.errors);
      return;
    }

    await handleThunk(
      dispatch(changePassword(form)),
      () => {
        dispatch(
          addToast({
            type: "success",
            message: "Password changed successfully!",
          }),
        );
        closeModal();
        setForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      },
      (error) => {
        dispatch(
          addToast({
            type: "error",
            message: (error as string) || "Failed to change password.",
          }),
        );
      },
    );
  };

  return (
    <form
      id="change-password-form"
      onSubmit={handlePasswordSubmit}
      className={styles.pmForm}
      noValidate
    >
      <Input
        label="Old Password"
        name="oldPassword"
        type="password"
        value={form.oldPassword}
        onChange={handlePasswordChange}
        icon={<HiOutlineLockClosed />}
        placeholder="••••••••"
        error={validationErrors.oldPassword}
        required
      />
      <Input
        label="New Password"
        name="newPassword"
        type="password"
        value={form.newPassword}
        onChange={handlePasswordChange}
        icon={<HiOutlineLockClosed />}
        placeholder="••••••••"
        error={validationErrors.newPassword}
        required
      />
      <Input
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={handlePasswordChange}
        icon={<HiOutlineLockClosed />}
        placeholder="••••••••"
        error={validationErrors.confirmPassword}
        required
      />
    </form>
  );
}
