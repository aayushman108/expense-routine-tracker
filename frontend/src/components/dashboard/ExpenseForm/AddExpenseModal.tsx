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
import {
  SPLIT_MODE,
  SUPPORTED_CURRENCIES,
} from "@expense-tracker/shared/enum/general.enum";
import { handleThunk } from "@/lib/utils";
import { GroupMember } from "@/lib/types";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
}: AddExpenseModalProps) {
  const dispatch = useAppDispatch();
  const { groupDetails } = useAppSelector((s: RootState) => s.groups);
  const { user } = useAppSelector((s: RootState) => s.auth);

  const groupId = groupDetails.data?.id;

  const activeMembers = useMemo(() => {
    const members = groupDetails.data?.members || [];
    return members;
  }, [groupDetails]);

  const [form, setForm] = useState({
    description: "",
    totalAmount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paidBy: user?.id,
    currency: "NPR",
  });

  const [splits, setSplits] = useState<
    { userId: string; splitPercentage: number; splitAmount: number }[]
  >([]);

  const [splitMode, setSplitMode] = useState<SPLIT_MODE>(SPLIT_MODE.EQUAL);

  const totalAmount = Number(form.totalAmount) || 0;

  // Initialize splits when members change
  useEffect(() => {
    if (groupId && activeMembers.length > 0) {
      setSplits(
        activeMembers.map((m: GroupMember) => ({
          userId: m.user_id,
          splitPercentage: 100 / activeMembers.length,
          splitAmount: totalAmount / activeMembers.length,
        })),
      );
    }
  }, [activeMembers, user, groupId, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSplitChange = (userId: string, value: number) => {
    setSplits((prev) => {
      if (splitMode === SPLIT_MODE.PERCENTAGE) {
        return prev.map((s) =>
          s.userId === userId
            ? {
                ...s,
                splitPercentage: value,
                splitAmount: (value * totalAmount) / 100,
              }
            : s,
        );
      } else if (splitMode === SPLIT_MODE.AMOUNT) {
        return prev.map((s) =>
          s.userId === userId
            ? {
                ...s,
                splitPercentage: (value * 100) / totalAmount,
                splitAmount: value,
              }
            : s,
        );
      } else {
        return prev;
      }
    });
  };

  // Compute share for display
  const computeShare = (split: { userId: string; splitPercentage: number }) => {
    if (splitMode === SPLIT_MODE.EQUAL) {
      const count = splits.length;
      return count > 0 ? totalAmount / count : 0;
    }
    if (splitMode === SPLIT_MODE.AMOUNT) {
      return split.splitPercentage;
    }
    // Percentage
    return (totalAmount * split.splitPercentage) / 100;
  };

  // For amount mode: total assigned vs total amount
  const totalAssigned = useMemo(() => {
    if (splitMode === SPLIT_MODE.AMOUNT) {
      return splits.reduce((acc, s) => acc + s.splitPercentage, 0);
    }
    return totalAmount;
  }, [splits, splitMode, totalAmount]);

  const amountRemaining =
    splitMode === SPLIT_MODE.AMOUNT ? totalAmount - totalAssigned : 0;

  // For percentage mode: total percentage
  const totalPercentage = useMemo(() => {
    if (splitMode === SPLIT_MODE.PERCENTAGE) {
      return splits.reduce((acc, s) => acc + s.splitPercentage, 0);
    }
    return 100;
  }, [splits, splitMode]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    let submissionSplits = splits
      .filter((s) => s.splitPercentage > 0)
      .map((s) => ({
        ...s,
        splitPercentage: Number(s.splitPercentage),
        splitAmount: Number(s.splitAmount),
      }));

    const payload = {
      ...form,
      totalAmount: Number(form.totalAmount) || 0,
      splits: submissionSplits,
    };

    await handleThunk(dispatch(createExpense(payload)), () => {
      dispatch(addToast({ type: "success", message: "Expense added!" }));
      onClose();
      setForm((prev) => ({
        ...prev,
        description: "",
        totalAmount: "",
        expenseDate: new Date().toISOString().split("T")[0],
      }));
    });
  };

  const currencyOptions = Object.values(SUPPORTED_CURRENCIES).map((curr) => ({
    value: curr,
    label: curr,
  }));

  const payerOptions = useMemo(
    () =>
      activeMembers.map((member: GroupMember) => ({
        value: member.user_id,
        label: member.user.full_name,
      })),
    [activeMembers],
  );

  const toggleMember = (memberId: string) => {
    const exists = splits.find((s) => s.userId === memberId);
    if (exists) {
      setSplits((prev) => prev.filter((s) => s.userId !== memberId));
    } else {
      let defaultValue = 1;
      if (splitMode === SPLIT_MODE.PERCENTAGE) defaultValue = 0;
      if (splitMode === SPLIT_MODE.AMOUNT) defaultValue = 0;
      setSplits((prev) => [
        ...prev,
        {
          userId: memberId,
          splitPercentage: defaultValue,
          splitAmount: defaultValue,
        },
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
            name="totalAmount"
            type="number"
            placeholder="0.00"
            icon={<HiOutlineCurrencyDollar />}
            value={form.totalAmount}
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
            name="expenseDate"
            type="date"
            icon={<HiOutlineCalendar />}
            value={form.expenseDate}
            onChange={handleChange}
            required
          />
          {groupId && (
            <Select
              label="Paid By"
              name="paidBy"
              icon={<HiOutlineUser />}
              value={form.paidBy}
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
                  className={`${styles.modeBtn} ${splitMode === SPLIT_MODE.EQUAL ? styles.modeActive : ""}`}
                  onClick={() => setSplitMode(SPLIT_MODE.EQUAL)}
                >
                  Equal
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${splitMode === SPLIT_MODE.PERCENTAGE ? styles.modeActive : ""}`}
                  onClick={() => setSplitMode(SPLIT_MODE.PERCENTAGE)}
                >
                  By %
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${splitMode === SPLIT_MODE.AMOUNT ? styles.modeActive : ""}`}
                  onClick={() => setSplitMode(SPLIT_MODE.AMOUNT)}
                >
                  By Amount
                </button>
              </div>
            </div>

            <div className={styles.splitsActions}>
              <span className={styles.selectedCount}>
                {splits.length} of {activeMembers.length} selected
              </span>
              {splitMode === SPLIT_MODE.EQUAL &&
                totalAmount > 0 &&
                splits.length > 0 && (
                  <span className={styles.perPersonLabel}>
                    {form.currency}{" "}
                    {(totalAmount / splits.length).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    / person
                  </span>
                )}
            </div>

            <div className={styles.membersList}>
              {activeMembers.map((member: GroupMember) => {
                const memberId = member.user_id;
                const split = splits.find((s) => s.userId === memberId);
                const splitPercentage = split?.splitPercentage || 0;
                const splitAmount = split?.splitAmount || 0;

                return (
                  <div
                    key={memberId}
                    className={`${styles.splitItem} ${splitPercentage > 0 ? styles.active : ""}`}
                    onClick={() => toggleMember(memberId)}
                  >
                    <div className={styles.userInfo}>
                      <div
                        className={`${styles.checkbox} ${splitPercentage > 0 ? styles.checked : ""}`}
                      >
                        {splitPercentage > 0 && <HiCheck />}
                      </div>
                      <div className={styles.avatar}>
                        {member.user?.avatar?.url ? (
                          <img src={member.user.avatar.url} alt="" />
                        ) : (
                          (member?.user?.full_name).charAt(0)
                        )}
                      </div>
                      <span className={styles.memberName}>
                        {member.user?.full_name}
                        {user?.id === memberId && " (You)"}
                      </span>
                    </div>

                    {/* Equal mode: show calculated share (no input) */}
                    {splitMode === SPLIT_MODE.EQUAL && totalAmount > 0 && (
                      <span className={styles.equalShare}>
                        {form.currency}{" "}
                        {splitAmount.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}

                    {/* Percentage mode: % input + calculated share */}
                    {splitMode === SPLIT_MODE.PERCENTAGE && (
                      <div
                        className={styles.inputWrap}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.percentInputWrap}>
                          <input
                            type="number"
                            value={splitPercentage || ""}
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
                          {splitAmount.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Amount mode: direct amount input */}
                    {splitMode === SPLIT_MODE.AMOUNT && (
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
                            value={splitAmount || ""}
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
            {splitMode === SPLIT_MODE.PERCENTAGE && (
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
            {splitMode === SPLIT_MODE.AMOUNT && totalAmount > 0 && (
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
                      width: `${Math.min(100, totalAmount > 0 ? (totalAssigned / totalAmount) * 100 : 0)}%`,
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
            {form.currency} {totalAmount.toLocaleString()}
          </span>
        </div>
      </form>
    </Modal>
  );
}
