"use client";

import { useState, useEffect, useMemo } from "react";
import {
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineCash,
  HiCheck,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createExpense } from "@/store/slices/expenseSlice";
import { addToast } from "@/store/slices/uiSlice";
import Modal from "@/components/ui/Modal/Modal";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import Select from "@/components/ui/Select/Select";
import styles from "./ExpenseForm.module.scss";
import type { RootState } from "@/store";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string | null;
}

const SUPPORTED_CURRENCIES = ["NPR", "USD", "EUR", "GBP", "INR"];

type SplitMode = "equal" | "percentage" | "amount";

// ── Dummy members for UI testing (remove once backend provides data) ──
const DUMMY_MEMBERS = [
  {
    user_id: "u1",
    user: { id: "u1", fullName: "Aayushman Pradhan", avatar: null },
  },
  { user_id: "u2", user: { id: "u2", fullName: "Ravi Sharma", avatar: null } },
  { user_id: "u3", user: { id: "u3", fullName: "Priya Thapa", avatar: null } },
  { user_id: "u4", user: { id: "u4", fullName: "Suman Gurung", avatar: null } },
  { user_id: "u5", user: { id: "u5", fullName: "Anita Rai", avatar: null } },
];

export default function AddExpenseModal({
  isOpen,
  onClose,
  groupId = null,
}: AddExpenseModalProps) {
  const dispatch = useAppDispatch();
  const { groupDetails } = useAppSelector((s: RootState) => s.groups);
  const { user } = useAppSelector((s: RootState) => s.auth);

  const activeMembers = useMemo(() => {
    if (groupId && groupDetails.data?.id === groupId) {
      const members = groupDetails.data.members || [];
      return members.length > 1 ? members : DUMMY_MEMBERS;
    }
    if (groupId) return DUMMY_MEMBERS;
    return user ? [{ user_id: user.id, user }] : [];
  }, [groupId, groupDetails, user]);

  const [form, setForm] = useState({
    description: "",
    total_amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    group_id: groupId || "",
    paid_by: "",
    currency: "NPR",
  });

  const [splits, setSplits] = useState<
    { user_id: string; split_ratio: number }[]
  >([]);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");

  const amount = Number(form.total_amount) || 0;

  // Initialize splits when members change
  useEffect(() => {
    if (groupId && activeMembers.length > 0) {
      setSplits(
        activeMembers.map((m: any) => ({
          user_id: m.user_id || m.id || m.user?.id,
          split_ratio: 1,
        })),
      );
      if (user && !form.paid_by) {
        setForm((prev) => ({ ...prev, paid_by: user.id }));
      }
    } else if (user) {
      setSplits([{ user_id: user.id, split_ratio: 1 }]);
      setForm((prev) => ({ ...prev, paid_by: prev.paid_by || user.id }));
    }
  }, [activeMembers, user, groupId, isOpen]);

  // When switching modes, reset split values appropriately
  const handleModeChange = (mode: SplitMode) => {
    setSplitMode(mode);
    const selectedIds = new Set(splits.map((s) => s.user_id));

    if (mode === "equal") {
      setSplits((prev) => prev.map((s) => ({ ...s, split_ratio: 1 })));
    } else if (mode === "percentage") {
      // Distribute 100% evenly
      const count = selectedIds.size;
      const pct = count > 0 ? Math.round((100 / count) * 100) / 100 : 0;
      setSplits((prev) => prev.map((s) => ({ ...s, split_ratio: pct })));
    } else if (mode === "amount") {
      // Amount: distribute evenly among selected
      const count = selectedIds.size;
      if (count > 0 && amount > 0) {
        const perPerson = Math.floor((amount / count) * 100) / 100;
        const remainder = Math.round((amount - perPerson * count) * 100) / 100;
        let first = true;
        setSplits((prev) =>
          prev.map((s) => {
            if (first) {
              first = false;
              return { ...s, split_ratio: perPerson + remainder };
            }
            return { ...s, split_ratio: perPerson };
          }),
        );
      } else {
        setSplits((prev) => prev.map((s) => ({ ...s, split_ratio: 0 })));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSplitChange = (userId: string, value: number) => {
    setSplits((prev) =>
      prev.map((s) =>
        s.user_id === userId ? { ...s, split_ratio: value } : s,
      ),
    );
  };

  // Compute share for display
  const computeShare = (split: { user_id: string; split_ratio: number }) => {
    if (splitMode === "equal") {
      const count = splits.length;
      return count > 0 ? amount / count : 0;
    }
    if (splitMode === "amount") {
      return split.split_ratio;
    }
    // Percentage
    return (amount * split.split_ratio) / 100;
  };

  // For amount mode: total assigned vs total amount
  const totalAssigned = useMemo(() => {
    if (splitMode === "amount") {
      return splits.reduce((acc, s) => acc + s.split_ratio, 0);
    }
    return amount;
  }, [splits, splitMode, amount]);

  const amountRemaining = splitMode === "amount" ? amount - totalAssigned : 0;

  // For percentage mode: total percentage
  const totalPercentage = useMemo(() => {
    if (splitMode === "percentage") {
      return splits.reduce((acc, s) => acc + s.split_ratio, 0);
    }
    return 100;
  }, [splits, splitMode]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (amount <= 0) {
      dispatch(
        addToast({ type: "error", message: "Amount must be greater than 0" }),
      );
      return;
    }
    if (!form.paid_by) {
      dispatch(addToast({ type: "error", message: "Please select who paid" }));
      return;
    }

    let submissionSplits = splits.filter((s) => s.split_ratio > 0);

    if (splitMode === "equal") {
      submissionSplits = submissionSplits.map((s) => ({
        ...s,
        split_ratio: 1,
      }));
    } else if (splitMode === "percentage") {
      // Convert percentages to ratio integers (multiply by 100)
      submissionSplits = submissionSplits.map((s) => ({
        ...s,
        split_ratio: Math.round(s.split_ratio * 100),
      }));
    } else if (splitMode === "amount") {
      submissionSplits = submissionSplits.map((s) => ({
        ...s,
        split_ratio: Math.round(s.split_ratio * 100),
      }));
    }

    const payload = {
      ...form,
      total_amount: amount,
      group_id: form.group_id || null,
      splits: submissionSplits,
    };

    const result = await dispatch(createExpense(payload));
    if (createExpense.fulfilled.match(result)) {
      dispatch(addToast({ type: "success", message: "Expense added!" }));
      onClose();
      setForm((prev) => ({
        ...prev,
        description: "",
        total_amount: "",
        expense_date: new Date().toISOString().split("T")[0],
      }));
    }
  };

  const currencyOptions = SUPPORTED_CURRENCIES.map((curr) => ({
    value: curr,
    label: curr,
  }));

  const payerOptions = activeMembers.map((member: any) => ({
    value: member.user?.id || member.id || member.user_id,
    label: member.user?.fullName || member.fullName || "User",
  }));

  const toggleMember = (memberId: string) => {
    const exists = splits.find((s) => s.user_id === memberId);
    if (exists) {
      setSplits((prev) => prev.filter((s) => s.user_id !== memberId));
    } else {
      let defaultValue = 1;
      if (splitMode === "percentage") defaultValue = 0;
      if (splitMode === "amount") defaultValue = 0;
      setSplits((prev) => [
        ...prev,
        { user_id: memberId, split_ratio: defaultValue },
      ]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Expense"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleSubmit()}>
            Add Expense
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Description"
          name="description"
          placeholder="What was this for?"
          icon={<HiOutlineClipboardList />}
          value={form.description}
          onChange={handleChange}
          required
        />

        <div className={styles.row}>
          <Input
            label="Amount"
            name="total_amount"
            type="number"
            placeholder="0.00"
            icon={<HiOutlineCurrencyDollar />}
            value={form.total_amount}
            onChange={handleChange}
            required
            step="0.01"
          />
          <Select
            label="Currency"
            name="currency"
            icon={<HiOutlineCash />}
            value={form.currency}
            onChange={handleChange}
            options={currencyOptions}
            required
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Date"
            name="expense_date"
            type="date"
            icon={<HiOutlineCalendar />}
            value={form.expense_date}
            onChange={handleChange}
            required
          />
          {groupId && (
            <Select
              label="Paid By"
              name="paid_by"
              icon={<HiOutlineUser />}
              value={form.paid_by}
              onChange={handleChange}
              options={payerOptions}
              placeholder="Select Payer"
              required
            />
          )}
        </div>

        {groupId && (
          <div className={styles.splitsSection}>
            <div className={styles.splitsHeader}>
              <h4>Split Between</h4>
              <div className={styles.splitModeToggle}>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${splitMode === "equal" ? styles.modeActive : ""}`}
                  onClick={() => handleModeChange("equal")}
                >
                  Equal
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${splitMode === "percentage" ? styles.modeActive : ""}`}
                  onClick={() => handleModeChange("percentage")}
                >
                  By %
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${splitMode === "amount" ? styles.modeActive : ""}`}
                  onClick={() => handleModeChange("amount")}
                >
                  By Amount
                </button>
              </div>
            </div>

            <div className={styles.splitsActions}>
              <span className={styles.selectedCount}>
                {splits.length} of {activeMembers.length} selected
              </span>
              {splitMode === "equal" && amount > 0 && splits.length > 0 && (
                <span className={styles.perPersonLabel}>
                  {form.currency}{" "}
                  {(amount / splits.length).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  / person
                </span>
              )}
            </div>

            <div className={styles.membersList}>
              {activeMembers.map((member: any) => {
                const memberId = member.user?.id || member.id || member.user_id;
                const split = splits.find((s) => s.user_id === memberId);
                const isSelected = !!split;
                const ratio = split?.split_ratio || 0;
                const share = isSelected ? computeShare(split!) : 0;

                return (
                  <div
                    key={memberId}
                    className={`${styles.splitItem} ${isSelected ? styles.active : ""}`}
                    onClick={() => toggleMember(memberId)}
                  >
                    <div className={styles.userInfo}>
                      <div
                        className={`${styles.checkbox} ${isSelected ? styles.checked : ""}`}
                      >
                        {isSelected && <HiCheck />}
                      </div>
                      <div className={styles.avatar}>
                        {member.user?.avatar?.url ? (
                          <img src={member.user.avatar.url} alt="" />
                        ) : (
                          (
                            member.user?.fullName ||
                            member.fullName ||
                            "?"
                          ).charAt(0)
                        )}
                      </div>
                      <span className={styles.memberName}>
                        {member.user?.fullName || member.fullName || "User"}
                        {user?.id === memberId && " (You)"}
                      </span>
                    </div>

                    {/* Equal mode: show calculated share (no input) */}
                    {isSelected && splitMode === "equal" && amount > 0 && (
                      <span className={styles.equalShare}>
                        {form.currency}{" "}
                        {share.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}

                    {/* Percentage mode: % input + calculated share */}
                    {isSelected && splitMode === "percentage" && (
                      <div
                        className={styles.inputWrap}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.percentInputWrap}>
                          <input
                            type="number"
                            value={ratio || ""}
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0"
                            onChange={(e) =>
                              handleSplitChange(
                                memberId,
                                Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    parseFloat(e.target.value) || 0,
                                  ),
                                ),
                              )
                            }
                          />
                          <span className={styles.percentSuffix}>%</span>
                        </div>
                        <span className={styles.share}>
                          {form.currency}{" "}
                          {share.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Amount mode: direct amount input */}
                    {isSelected && splitMode === "amount" && (
                      <div
                        className={styles.inputWrap}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.amountInputWrap}>
                          <span className={styles.currencyPrefix}>
                            {form.currency}
                          </span>
                          <input
                            type="number"
                            value={ratio || ""}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            onChange={(e) =>
                              handleSplitChange(
                                memberId,
                                Math.max(0, parseFloat(e.target.value) || 0),
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Percentage mode: show total % status */}
            {splitMode === "percentage" && (
              <div className={styles.amountStatus}>
                <div className={styles.statusRow}>
                  <span>Total Percentage</span>
                  <span
                    className={`${styles.statusValue} ${
                      Math.abs(totalPercentage - 100) < 0.01
                        ? styles.statusOk
                        : styles.statusWarn
                    }`}
                  >
                    {totalPercentage.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                    %
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${
                      Math.abs(totalPercentage - 100) < 0.01
                        ? styles.progressOk
                        : ""
                    }`}
                    style={{ width: `${Math.min(100, totalPercentage)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Amount mode: show assigned/remaining status */}
            {splitMode === "amount" && amount > 0 && (
              <div className={styles.amountStatus}>
                <div className={styles.statusRow}>
                  <span>Assigned</span>
                  <span className={styles.statusValue}>
                    {form.currency}{" "}
                    {totalAssigned.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className={styles.statusRow}>
                  <span>Remaining</span>
                  <span
                    className={`${styles.statusValue} ${
                      Math.abs(amountRemaining) < 0.01
                        ? styles.statusOk
                        : styles.statusWarn
                    }`}
                  >
                    {form.currency}{" "}
                    {amountRemaining.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${
                      Math.abs(amountRemaining) < 0.01 ? styles.progressOk : ""
                    }`}
                    style={{
                      width: `${Math.min(100, amount > 0 ? (totalAssigned / amount) * 100 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.summary}>
          <span className={styles.summaryLabel}>Total amount to split:</span>
          <span className={styles.total}>
            {form.currency} {amount.toLocaleString()}
          </span>
        </div>
      </form>
    </Modal>
  );
}
