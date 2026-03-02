"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCamera,
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineStar,
  HiOutlineCreditCard,
  HiOutlineX,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineDuplicate,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile, changePassword } from "@/store/slices/authSlice";
import {
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "@/store/slices/paymentMethodSlice";
import { fetchUserExpenses } from "@/store/slices/expenseSlice";
import { addToast } from "@/store/slices/uiSlice";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Card from "@/components/ui/Card/Card";
import Select from "@/components/ui/Select/Select";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./profile.module.scss";
import type { RootState } from "@/store";
import type { PaymentMethod } from "@/lib/types";

const PROVIDER_OPTIONS = [
  { value: "khalti", label: "Khalti" },
  { value: "esewa", label: "eSewa" },
  { value: "bank", label: "Bank Transfer" },
  { value: "fonepay", label: "FonePay" },
  { value: "imepay", label: "IME Pay" },
  { value: "connectips", label: "ConnectIPS" },
];

const PROVIDER_COLORS: Record<string, string> = {
  khalti: "#5C2D91",
  esewa: "#60BB46",
  bank: "#1a73e8",
  fonepay: "#E31837",
  imepay: "#00A4E4",
  connectips: "#004B87",
};

function getProviderInitial(provider: string) {
  return (provider[0] || "?").toUpperCase();
}

function getProviderLabel(provider: string) {
  return PROVIDER_OPTIONS.find((p) => p.value === provider)?.label || provider;
}

// ── Metadata fields based on provider ──
function getMetadataFields(provider: string) {
  switch (provider) {
    case "khalti":
    case "esewa":
    case "fonepay":
    case "imepay":
      return [
        { key: "phone", label: "Phone Number", placeholder: "98XXXXXXXX" },
        { key: "name", label: "Account Name", placeholder: "Full name" },
      ];
    case "bank":
      return [
        { key: "bankName", label: "Bank Name", placeholder: "e.g. NIC Asia" },
        {
          key: "accountNumber",
          label: "Account Number",
          placeholder: "Account number",
        },
        {
          key: "accountHolder",
          label: "Account Holder",
          placeholder: "Full name",
        },
      ];
    case "connectips":
      return [
        { key: "bankName", label: "Bank Name", placeholder: "e.g. NIC Asia" },
        {
          key: "username",
          label: "Username",
          placeholder: "ConnectIPS username",
        },
      ];
    default:
      return [{ key: "info", label: "Info", placeholder: "Details" }];
  }
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAppSelector(
    (s: RootState) => s.auth,
  );
  const { paymentMethods, isLoading: pmLoading } = useAppSelector(
    (s: RootState) => s.paymentMethods,
  );
  const { expenses } = useAppSelector((s: RootState) => s.expenses);

  // ── User form ──
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
  });

  // ── Payment method modal ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPM, setEditingPM] = useState<PaymentMethod | null>(null);
  const [pmForm, setPmForm] = useState<{
    provider: string;
    metadata: Record<string, string>;
    isDefault: boolean;
  }>({
    provider: "",
    metadata: {},
    isDefault: false,
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ── Delete confirmation ──
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.full_name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const startEditing = () => {
    if (user) {
      setForm({
        fullName: user.full_name || "",
        phone: user.phone || "",
      });
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (user) {
      setForm({
        fullName: user.full_name || "",
        phone: user.phone || "",
      });
    }
    setIsEditing(false);
  };

  useEffect(() => {
    dispatch(fetchPaymentMethods());
    dispatch(fetchUserExpenses());
  }, [dispatch]);

  // ── User handlers ──
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      dispatch(
        addToast({ type: "success", message: "Profile updated successfully!" }),
      );
      setIsEditing(false);
    } else {
      dispatch(
        addToast({ type: "error", message: "Failed to update profile." }),
      );
    }
  };

  // ── Payment method handlers ──
  const openAddModal = () => {
    setEditingPM(null);
    setPmForm({ provider: "", metadata: {}, isDefault: false });
    setIsModalOpen(true);
  };

  const openEditModal = (pm: PaymentMethod) => {
    setEditingPM(pm);
    setPmForm({
      provider: pm.provider,
      metadata: (pm.metadata as Record<string, string>) || {},
      isDefault: pm.is_default,
    });
    setIsModalOpen(true);
  };

  const handlePmProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPmForm((prev) => ({
      ...prev,
      provider: e.target.value,
      metadata: {},
    }));
  };

  const handlePmMetaChange = (key: string, value: string) => {
    setPmForm((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }));
  };

  const handlePmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPM) {
      const result = await dispatch(
        updatePaymentMethod({
          id: editingPM.id,
          provider: pmForm.provider,
          metadata: pmForm.metadata,
          isDefault: pmForm.isDefault,
        }),
      );
      if (updatePaymentMethod.fulfilled.match(result)) {
        dispatch(
          addToast({
            type: "success",
            message: "Payment method updated!",
          }),
        );
        setIsModalOpen(false);
      } else {
        dispatch(
          addToast({
            type: "error",
            message: "Failed to update payment method.",
          }),
        );
      }
    } else {
      const result = await dispatch(
        createPaymentMethod({
          provider: pmForm.provider,
          metadata: pmForm.metadata,
          isDefault: pmForm.isDefault,
        }),
      );
      if (createPaymentMethod.fulfilled.match(result)) {
        dispatch(
          addToast({
            type: "success",
            message: "Payment method added!",
          }),
        );
        setIsModalOpen(false);
      } else {
        dispatch(
          addToast({
            type: "error",
            message: "Failed to add payment method.",
          }),
        );
      }
    }
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

  const handleSetDefault = async (pm: PaymentMethod) => {
    if (pm.is_default) return;
    const result = await dispatch(
      updatePaymentMethod({ id: pm.id, isDefault: true }),
    );
    if (updatePaymentMethod.fulfilled.match(result)) {
      dispatch(
        addToast({
          type: "success",
          message: `${getProviderLabel(pm.provider)} set as default.`,
        }),
      );
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
      setIsPasswordModalOpen(false);
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

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    dispatch(
      addToast({ type: "success", message: `${label} copied to clipboard!` }),
    );
  };

  const metaFields = getMetadataFields(pmForm.provider);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <p>Manage your account settings and personal information.</p>
      </div>

      <div className={styles.profileLayout}>
        <div className={styles.leftColumn}>
          {/* ── User Details Card ── */}
          <Card className={styles.card}>
            <div className={styles.profileHero}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.full_name} />
                  ) : (
                    getInitials(user?.full_name)
                  )}
                </div>
                <button className={styles.editBtn} title="Upload New Avatar">
                  <HiOutlineCamera />
                </button>
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
                  onClick={startEditing}
                  title="Edit profile"
                >
                  <HiOutlinePencil />
                </button>
              )}
            </div>

            {isEditing ? (
              // ... same form as before ...
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
                  <Button type="button" variant="ghost" onClick={cancelEditing}>
                    <HiOutlineX /> Cancel
                  </Button>
                  <Button type="submit" isLoading={authLoading}>
                    <HiOutlineCheck /> Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <>
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
              </>
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
          </Card>
        </div>

        <div className={styles.rightColumn}>
          {/* ── Payment Methods Section ── */}
          <section className={styles.paymentSection}>
            <div className={styles.paymentHeader}>
              <h3 className={styles.sectionTitle}>
                <HiOutlineCreditCard /> Payment Methods
              </h3>
              <Button variant="outline" size="sm" onClick={openAddModal}>
                <HiOutlinePlus /> Add New
              </Button>
            </div>

            <div className={styles.paymentGrid}>
              {paymentMethods.length === 0 && !pmLoading && (
                <Card className={styles.emptyCard}>
                  <div className={styles.emptyState}>
                    <HiOutlineCreditCard />
                    <p>No payment methods added yet.</p>
                    <Button variant="outline" size="sm" onClick={openAddModal}>
                      <HiOutlinePlus /> Add Your First Payment Method
                    </Button>
                  </div>
                </Card>
              )}

              {paymentMethods.map((pm) => {
                const meta = (pm.metadata || {}) as Record<string, string>;
                const providerColor =
                  PROVIDER_COLORS[pm.provider] || "var(--color-primary)";

                return (
                  <Card key={pm.id} className={styles.pmCard}>
                    <div className={styles.pmCardTop}>
                      <div
                        className={styles.pmIcon}
                        style={{ background: providerColor }}
                      >
                        {getProviderInitial(pm.provider)}
                      </div>
                      <div className={styles.pmInfo}>
                        <span className={styles.pmProvider}>
                          {getProviderLabel(pm.provider)}
                        </span>
                        {meta.bankName && (
                          <div className={styles.pmMetaRow}>
                            <span className={styles.pmMeta}>
                              {meta.bankName}
                            </span>
                            <button
                              className={styles.copyBtn}
                              onClick={() =>
                                handleCopyToClipboard(
                                  meta.bankName,
                                  "Bank Name",
                                )
                              }
                              title="Copy Bank Name"
                            >
                              <HiOutlineDuplicate />
                            </button>
                          </div>
                        )}
                        {meta.accountNumber && (
                          <div className={styles.pmMetaRow}>
                            <span className={styles.pmMeta}>
                              {meta.accountNumber}
                            </span>
                            <button
                              className={styles.copyBtn}
                              onClick={() =>
                                handleCopyToClipboard(
                                  meta.accountNumber,
                                  "Account Number",
                                )
                              }
                              title="Copy Account Number"
                            >
                              <HiOutlineDuplicate />
                            </button>
                          </div>
                        )}
                        {meta.phone && (
                          <div className={styles.pmMetaRow}>
                            <span className={styles.pmMeta}>{meta.phone}</span>
                            <button
                              className={styles.copyBtn}
                              onClick={() =>
                                handleCopyToClipboard(
                                  meta.phone,
                                  "Phone Number",
                                )
                              }
                              title="Copy Phone Number"
                            >
                              <HiOutlineDuplicate />
                            </button>
                          </div>
                        )}
                        {meta.username && (
                          <div className={styles.pmMetaRow}>
                            <span className={styles.pmMeta}>
                              {meta.username}
                            </span>
                            <button
                              className={styles.copyBtn}
                              onClick={() =>
                                handleCopyToClipboard(meta.username, "Username")
                              }
                              title="Copy Username"
                            >
                              <HiOutlineDuplicate />
                            </button>
                          </div>
                        )}
                        {meta.accountHolder && (
                          <div className={styles.pmMetaRow}>
                            <span className={styles.pmMeta}>
                              {meta.accountHolder}
                            </span>
                            <button
                              className={styles.copyBtn}
                              onClick={() =>
                                handleCopyToClipboard(
                                  meta.accountHolder,
                                  "Account Holder",
                                )
                              }
                              title="Copy Account Holder"
                            >
                              <HiOutlineDuplicate />
                            </button>
                          </div>
                        )}
                        {meta.name && (
                          <div className={styles.pmMetaRow}>
                            <span className={styles.pmMeta}>{meta.name}</span>
                            <button
                              className={styles.copyBtn}
                              onClick={() =>
                                handleCopyToClipboard(meta.name, "Account Name")
                              }
                              title="Copy Account Name"
                            >
                              <HiOutlineDuplicate />
                            </button>
                          </div>
                        )}
                        {meta.info && (
                          <div className={styles.pmMetaRow}>
                            <span className={styles.pmMeta}>{meta.info}</span>
                            <button
                              className={styles.copyBtn}
                              onClick={() =>
                                handleCopyToClipboard(meta.info, "Details")
                              }
                              title="Copy Details"
                            >
                              <HiOutlineDuplicate />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className={styles.pmBadges}>
                        {pm.is_verified && (
                          <span className={styles.verifiedBadge}>Verified</span>
                        )}
                        {pm.is_default && (
                          <span className={styles.defaultBadge}>Default</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.pmActions}>
                      {!pm.is_default && (
                        <button
                          className={styles.pmActionBtn}
                          onClick={() => handleSetDefault(pm)}
                          title="Set as default"
                        >
                          <HiOutlineStar /> Default
                        </button>
                      )}
                      <button
                        className={styles.pmActionBtn}
                        onClick={() => openEditModal(pm)}
                        title="Edit"
                      >
                        <HiOutlinePencil /> Edit
                      </button>
                      <button
                        className={`${styles.pmActionBtn} ${styles.danger}`}
                        onClick={() => setDeleteId(pm.id)}
                        title="Delete"
                      >
                        <HiOutlineTrash /> Remove
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* ── Add / Edit Payment Method Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPM ? "Edit Payment Method" : "Add Payment Method"}
        size="sm"
      >
        <form onSubmit={handlePmSubmit} className={styles.pmForm}>
          <Select
            label="Provider"
            name="provider"
            value={pmForm.provider}
            onChange={handlePmProviderChange}
            options={PROVIDER_OPTIONS}
            placeholder="Select a provider"
            required
          />

          {pmForm.provider &&
            metaFields.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                name={field.key}
                value={pmForm.metadata[field.key] || ""}
                onChange={(e) => handlePmMetaChange(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            ))}

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={pmForm.isDefault}
              onChange={(e) =>
                setPmForm((prev) => ({ ...prev, isDefault: e.target.checked }))
              }
            />
            Set as default payment method
          </label>

          <div className={styles.modalFooter}>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={pmLoading}
              disabled={!pmForm.provider}
            >
              {editingPM ? "Update" : "Add"} Payment Method
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
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

      {/* ── Change Password Modal ── */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        size="sm"
      >
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
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={authLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
