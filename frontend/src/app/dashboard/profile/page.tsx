"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  HiOutlineUser,
  HiOutlineChevronLeft,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCamera,
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineCreditCard,
  HiOutlineX,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile, uploadAvatar } from "@/store/slices/authSlice";
import { fetchPaymentMethods } from "@/store/slices/paymentMethodSlice";
import { addToast } from "@/store/slices/uiSlice";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Card from "@/components/ui/Card/Card";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./profile.module.scss";
import type { RootState } from "@/store";
import type { User } from "@/lib/types";
import { PAYMENT_METHOD_TYPE } from "@expense-tracker/shared/enum/payment.enum";
import { BankCard } from "@/components/dashboard/BankCard/BankCard";
import { WalletCard } from "@/components/dashboard/WalletCard/WalletCard";
import { PaymentDetailsForm } from "@/components/dashboard/PaymentDetailsForm/PaymentDetailsForm";
import { FORM_MODE } from "@expense-tracker/shared";
import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm/ChangePasswordForm";
import { handleThunk } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import { logoutUser } from "@/store/slices/authSlice";
import { FiLogOut } from "react-icons/fi";

interface MetadataField {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
}

export function getMetadataFields(
  provider: PAYMENT_METHOD_TYPE,
): MetadataField[] {
  const commonFields = [{ key: "qrCode", label: "QR Code", type: "file" }];

  switch (provider) {
    case PAYMENT_METHOD_TYPE.KHALTI:
    case PAYMENT_METHOD_TYPE.ESEWA:
    case PAYMENT_METHOD_TYPE.FONEPAY:
    case PAYMENT_METHOD_TYPE.IMEPAY:
      return [
        {
          key: "phone",
          label: "Phone Number",
          placeholder: "98XXXXXXXX",
          type: "text",
        },
        {
          key: "name",
          label: "Account Name",
          placeholder: "Full name",
          type: "text",
        },
        ...commonFields,
      ];
    case PAYMENT_METHOD_TYPE.BANK:
      return [
        {
          key: "bankName",
          label: "Bank Name",
          placeholder: "e.g. NIC Asia",
          type: "text",
        },
        {
          key: "accountNumber",
          label: "Account Number",
          placeholder: "Account number",
          type: "text",
        },
        {
          key: "accountHolder",
          label: "Account Holder",
          placeholder: "Full name",
          type: "text",
        },
        ...commonFields,
      ];
    case PAYMENT_METHOD_TYPE.CONNECTIPS:
      return [
        {
          key: "bankName",
          label: "Bank Name",
          placeholder: "e.g. NIC Asia",
          type: "text",
        },
        {
          key: "username",
          label: "Username",
          placeholder: "ConnectIPS username",
          type: "text",
        },
        ...commonFields,
      ];
    default:
      return [
        { key: "info", label: "Info", placeholder: "Details", type: "text" },
        ...commonFields,
      ];
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAppSelector(
    (s: RootState) => s.auth,
  );
  const { paymentMethods, isLoading: pmLoading } = useAppSelector(
    (s: RootState) => s.paymentMethods,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        dispatch(
          addToast({
            type: "error",
            message: "Avatar size should be less than 5MB",
          }),
        );
        return;
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const result = await dispatch(uploadAvatar(formData));
      if (uploadAvatar.fulfilled.match(result)) {
        dispatch(
          addToast({
            type: "success",
            message: "Avatar updated successfully!",
          }),
        );
      } else {
        dispatch(
          addToast({ type: "error", message: "Failed to upload avatar." }),
        );
      }
    }
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

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    dispatch(
      addToast({ type: "success", message: `${label} copied to clipboard!` }),
    );
  };

  const handleLogout = () => {
    handleThunk(dispatch(logoutUser()), () => router.push("/"));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <button
            className={styles.backBtn}
            onClick={() => router.push("/dashboard")}
          >
            <HiOutlineChevronLeft /> Back to Dashboard
          </button>
          <div className={styles.sessionTag}>SECURE_PROFILE_SETTINGS</div>
          <div className={styles.titleWrapper}>
            <div className={styles.icon}>
              <HiOutlineUser />
            </div>
            <h1>My Profile</h1>
          </div>
          <p>
            Manage your account settings, personal information, and payment methods.
          </p>
        </div>
        <div className={styles.actions}>
        </div>
      </header>

      <div className={styles.profileLayout}>
        <div className={styles.leftColumn}>
          {/* ── User Details Card ── */}
          <Card className={styles.card}>
            <div className={styles.profileHero}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {user?.avatar?.url ? (
                    <Image
                      src={user.avatar.url}
                      alt={user.full_name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    getInitials(user?.full_name)
                  )}
                </div>
                <label className={styles.editBtn} title="Upload New Avatar">
                  <input
                    type="file"
                    className={styles.hiddenInput}
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                  <HiOutlineCamera />
                </label>
              </div>
              <div className={styles.infoSection}>
                <span className={styles.name}>{user?.full_name}</span>
                <span className={styles.email}>{user?.email}</span>
                <span className={styles.joined}>
                  Member since{" "}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Personal Information</h3>
              {!isEditing && (
                <button
                  className={styles.editIconBtn}
                  onClick={() => setIsEditing(true)}
                  title="Edit profile"
                >
                  <HiOutlinePencil />
                </button>
              )}
            </div>

            {isEditing ? (
              <EditProfileForm
                user={user as User}
                closeEdit={() => setIsEditing(false)}
              />
            ) : (
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    <HiOutlineUser /> Full Name
                  </span>
                  <span className={styles.detailValue}>
                    {user?.full_name || "—"}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    <HiOutlineMail /> Email Address
                  </span>
                  <span className={styles.detailValue}>
                    {user?.email || "—"}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    <HiOutlinePhone /> Phone Number
                  </span>
                  <span className={styles.detailValue}>
                    {user?.phone || "—"}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card className={styles.card}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <HiOutlineShieldCheck /> Account Security
              </h3>
            </div>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Password</span>
                <span className={styles.detailValue}>••••••••••••</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Change Password
              </Button>
            </div>
            <div className={styles.sessionRow}>
              <div className={styles.sessionCopy}>
                <span className={styles.sessionLabel}>Session</span>
                <span className={styles.sessionHint}>
                  Sign out on this device. You can sign in again anytime.
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsLogoutModalOpen(true)}
              >
                <FiLogOut /> Log out
              </Button>
            </div>
          </Card>
        </div>

        <div className={styles.rightColumn}>
          {/* ── Payment Methods Section ── */}
          <section className={styles.paymentSection}>
            <div className={styles.paymentHeader}>
              <h3 className={styles.sectionTitle}>
                <HiOutlineCreditCard /> Payment Methods
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <HiOutlinePlus /> Add New
              </Button>
            </div>

            <div className={styles.paymentGrid}>
              {paymentMethods.length === 0 && !pmLoading && (
                <Card className={styles.emptyCard}>
                  <div className={styles.emptyState}>
                    <HiOutlineCreditCard />
                    <p>No payment methods added yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPaymentModalOpen(true)}
                    >
                      <HiOutlinePlus size={18} /> Add Your First Payment Method
                    </Button>
                  </div>
                </Card>
              )}

              {paymentMethods.map((pm) => {
                const isBank = pm.provider === PAYMENT_METHOD_TYPE.BANK;

                if (isBank) {
                  return (
                    <BankCard
                      key={pm.id}
                      pm={pm}
                      handleCopyToClipboard={handleCopyToClipboard}
                    />
                  );
                }

                return (
                  <WalletCard
                    key={pm.id}
                    pm={pm}
                    user={user as User}
                    handleCopyToClipboard={handleCopyToClipboard}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* ── Add Payment Method Modal ── */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={"Add Payment Method"}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="payment-details-form"
              variant="primary"
              isLoading={pmLoading}
            >
              Add Payment Method
            </Button>
          </>
        }
      >
        <PaymentDetailsForm
          mode={FORM_MODE.ADD}
          closeModal={() => setIsPaymentModalOpen(false)}
        />
      </Modal>

      {/* ── Change Password Modal ── */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your Expensora account? You will need to sign back in to access your groups and personal expenses."
        confirmText="Log Out"
        confirmVariant="danger"
      />

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="change-password-form"
              variant="primary"
              isLoading={authLoading}
            >
              Update Password
            </Button>
          </>
        }
      >
        <ChangePasswordForm closeModal={() => setIsPasswordModalOpen(false)} />
      </Modal>
    </div>
  );
}

interface EditProfileFormProps {
  user: User;
  closeEdit: () => void;
}

export function EditProfileForm({ user, closeEdit }: EditProfileFormProps) {
  const dispatch = useAppDispatch();
  const { isLoading: authLoading } = useAppSelector((s: RootState) => s.auth);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await handleThunk(
      dispatch(updateProfile(form)),
      () => {
        dispatch(
          addToast({
            type: "success",
            message: "Profile updated successfully!",
          }),
        );
        closeEdit();
      },
      () => {
        dispatch(
          addToast({ type: "error", message: "Failed to update profile." }),
        );
      },
    );
  };

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.full_name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <Input
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          icon={<HiOutlineUser />}
          placeholder="Enter full name"
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          icon={<HiOutlinePhone />}
          placeholder="+977 98XXXXXXXX"
        />
      </div>

      <div className={styles.footer}>
        <Button type="button" variant="ghost" onClick={closeEdit}>
          <HiOutlineX /> Cancel
        </Button>
        <Button type="submit" isLoading={authLoading}>
          <HiOutlineCheck /> Save Changes
        </Button>
      </div>
    </form>
  );
}
