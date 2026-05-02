"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineCash,
  HiCheck,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createExpense, updateExpense } from "@/store/slices/expenseSlice";
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
  EXPENSE_TYPE,
  EXPENSE_STATUS,
} from "@expense-tracker/shared";
import { handleThunk } from "@/lib/utils";
import { GroupMember, Expense, CreateExpensePayload } from "@/lib/types";

interface FormProps {
  onClose: () => void;
  expense?: Expense | null;
  fetchCb?: () => void;
}

const AddPersonalExpenseForm = ({ onClose, fetchCb, expense }: FormProps) => {
  const dispatch = useAppDispatch();
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const { isSubmitting } = useAppSelector((state: RootState) => state.expenses);

  const [form, setForm] = useState({
    expenseType: EXPENSE_TYPE.PERSONAL,
    description: expense?.description || "",
    totalAmount: expense?.total_amount?.toString() || "",
    expenseDate: expense?.expense_date
      ? new Date(expense.expense_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    currency: expense?.currency || "NPR",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    status: EXPENSE_STATUS = EXPENSE_STATUS.SUBMITTED,
    e?: React.FormEvent,
  ) => {
    e?.preventDefault();
    setSubmittingAction(status);

    const body: any = {
      ...form,
      expenseStatus: status,
      totalAmount: Number(form.totalAmount) || 0,
    };

    if (expense?.id) {
      await handleThunk(
        dispatch(updateExpense({ id: expense.id, body })),
        () => {
          setSubmittingAction(null);
          dispatch(
            addToast({ type: "success", message: "Personal expense updated!" }),
          );
          fetchCb?.();
          onClose();
        },
        () => setSubmittingAction(null),
      );
    } else {
      await handleThunk(
        dispatch(createExpense({ body, params: {} })),
        () => {
          setSubmittingAction(null);
          dispatch(
            addToast({ type: "success", message: "Personal expense added!" }),
          );
          fetchCb?.();
          onClose();
          setForm((prev) => ({
            ...prev,
            description: "",
            totalAmount: "",
            expenseDate: new Date().toISOString().split("T")[0],
          }));
        },
        () => setSubmittingAction(null),
      );
    }
  };

  const currencyOptions = Object.values(SUPPORTED_CURRENCIES).map((curr) => ({
    value: curr,
    label: curr,
  }));

  return (
    <form
      className={`${styles.form} ${styles.formFull}`}
      onSubmit={(e) => handleSubmit(EXPENSE_STATUS.SUBMITTED, e)}
    >
      <div className={styles.scrollableContent}>
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
            disabled
          />
        </div>

        <Input
          label="Date"
          name="expenseDate"
          type="date"
          icon={<HiOutlineCalendar />}
          value={form.expenseDate}
          onChange={handleChange}
          required
        />

        <div className={styles.summary}>
          <span className={styles.summaryLabel}>Total amount:</span>
          <span className={styles.total}>
            {form.currency} {(Number(form.totalAmount) || 0).toLocaleString()}
          </span>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <Button
          variant="ghost"
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="primary"
            type="submit"
            isLoading={submittingAction === EXPENSE_STATUS.SUBMITTED}
            disabled={isSubmitting}
          >
            {expense ? "Update Expense" : "Add Expense"}
          </Button>
        </div>
      </div>
    </form>
  );
};

const AddGroupExpenseForm = ({ onClose, fetchCb, expense }: FormProps) => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const groupIdFromParams = params?.id as string;

  const { groupDetails } = useAppSelector((s: RootState) => s.groups);
  const { user } = useAppSelector((s: RootState) => s.auth);
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const { isSubmitting } = useAppSelector((s: RootState) => s.expenses);

  const currentGroupFromContext = groupDetails.data;

  const initialActiveMembers = useMemo(() => {
    if (expense?.splits && expense.splits.length > 0) {
      return expense.splits
        .map((s: any) => s.user?.id || s.user_id)
        .filter(Boolean);
    }
    return (currentGroupFromContext?.members || []).map((m: any) => m.user_id);
  }, [expense, currentGroupFromContext]);

  const [activeMembers, setActiveMembers] =
    useState<string[]>(initialActiveMembers);

  const groupId =
    groupIdFromParams || currentGroupFromContext?.id || expense?.group_id;

  const [form, setForm] = useState({
    expenseType: EXPENSE_TYPE.GROUP,
    description: expense?.description || "",
    totalAmount: expense?.total_amount?.toString() || "",
    expenseDate: expense?.expense_date
      ? new Date(expense.expense_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    paidBy: expense?.paid_by || user?.id,
    currency: expense?.currency || "NPR",
  });

  const activeGroupDetails = currentGroupFromContext;

  const groupMembers = useMemo(() => {
    return activeGroupDetails?.members || [];
  }, [activeGroupDetails]);

  // If editing, we might need to fetch group members if they aren't in context.
  // Assuming they are usually there if we are in a group page or just opened details.

  const [splits, setSplits] = useState<
    { userId: string; splitPercentage: number; splitAmount: number }[]
  >([]);

  const [splitMode, setSplitMode] = useState<SPLIT_MODE>(
    expense ? SPLIT_MODE.AMOUNT : SPLIT_MODE.EQUAL,
  );

  const totalAmount = Number(form.totalAmount) || 0;

  const [hasInitializedSplits, setHasInitializedSplits] = useState(false);

  // Initialize splits on first render or when groupMembers are loaded
  if (!hasInitializedSplits && groupMembers.length > 0) {
    if (expense?.splits && expense.splits.length > 0) {
      setHasInitializedSplits(true);

      const existingSplits = expense.splits.map((s: any) => ({
        userId: s.user?.id || s.user_id,
        splitPercentage: Number(Number(s.split_percentage).toFixed(2)),
        splitAmount: Number(Number(s.split_amount).toFixed(2)),
      }));

      const existingSplitUserIds = new Set(
        existingSplits.map((s: any) => s.userId),
      );

      const missingSplits = groupMembers
        .filter((m: GroupMember) => !existingSplitUserIds.has(m.user_id))
        .map((m: GroupMember) => ({
          userId: m.user_id,
          splitPercentage: 0,
          splitAmount: 0,
        }));

      setSplits([...existingSplits, ...missingSplits]);
    } else {
      const initialAmount = Number(form.totalAmount) || 0;
      setHasInitializedSplits(true);
      setSplits(
        groupMembers.map((m: GroupMember) => ({
          userId: m.user_id,
          splitPercentage: Number(Number(100 / groupMembers.length).toFixed(2)),
          splitAmount: Number(
            Number(initialAmount / groupMembers.length).toFixed(2),
          ),
        })),
      );
    }
  }

  const recalculateEqualSplits = useCallback(
    (members: string[], amount: number) => {
      setSplits((prev) =>
        prev.map((s) => ({
          ...s,
          splitPercentage: members.includes(s.userId)
            ? members.length
              ? Number(Number(100 / members.length).toFixed(2))
              : 0
            : 0,
          splitAmount: members.includes(s.userId)
            ? members.length
              ? Number(Number(amount / members.length).toFixed(2))
              : 0
            : 0,
        })),
      );
    },
    [],
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "totalAmount") {
      const newAmount = Number(value) || 0;
      if (splitMode === SPLIT_MODE.EQUAL) {
        recalculateEqualSplits(activeMembers, newAmount);
      } else if (splitMode === SPLIT_MODE.PERCENTAGE) {
        setSplits((prev) =>
          prev.map((s) => ({
            ...s,
            splitAmount: Number(
              Number((s.splitPercentage * newAmount) / 100).toFixed(2),
            ),
          })),
        );
      }
    }
  };

  const handleSplitChange = useCallback(
    (userId: string, value: number) => {
      if (!activeMembers.includes(userId)) return;
      setSplits((prev) => {
        if (splitMode === SPLIT_MODE.PERCENTAGE) {
          return prev.map((s) =>
            s.userId === userId
              ? {
                  ...s,
                  splitPercentage: value,
                  splitAmount: Number(
                    Number((value * totalAmount) / 100).toFixed(2),
                  ),
                }
              : s,
          );
        } else if (splitMode === SPLIT_MODE.AMOUNT) {
          return prev.map((s) =>
            s.userId === userId
              ? {
                  ...s,
                  splitPercentage: totalAmount
                    ? Number(Number((value * 100) / totalAmount).toFixed(2))
                    : 0,
                  splitAmount: value,
                }
              : s,
          );
        } else {
          return prev;
        }
      });
    },
    [activeMembers, splitMode, totalAmount],
  );

  const handleSplitModeChange = useCallback(
    (mode: SPLIT_MODE) => {
      setSplitMode(mode);
      if (mode === SPLIT_MODE.EQUAL) {
        recalculateEqualSplits(activeMembers, totalAmount);
      }
    },
    [activeMembers, totalAmount, recalculateEqualSplits],
  );

  const totalAssigned = useMemo(() => {
    if (splitMode === SPLIT_MODE.AMOUNT) {
      return splits.reduce((acc, s) => acc + s.splitAmount, 0);
    }
    return totalAmount;
  }, [splits, splitMode, totalAmount]);

  const amountRemaining =
    splitMode === SPLIT_MODE.AMOUNT ? totalAmount - totalAssigned : 0;

  const totalPercentage = useMemo(() => {
    if (splitMode === SPLIT_MODE.PERCENTAGE) {
      return splits.reduce((acc, s) => acc + s.splitPercentage, 0);
    }
    return 100;
  }, [splits, splitMode]);

  const handleSubmit = async (
    status: EXPENSE_STATUS = EXPENSE_STATUS.SUBMITTED,
    e?: React.FormEvent,
  ) => {
    e?.preventDefault();
    setSubmittingAction(status);

    const body: CreateExpensePayload["body"] = {
      ...form,
      expenseStatus: status,
      totalAmount: Number(form.totalAmount) || 0,
    };

    if (groupId || expense?.group_id) {
      body.splits = splits
        .filter((s) => activeMembers.includes(s.userId))
        .map((s) => ({
          ...s,
          splitPercentage: Number(Number(s.splitPercentage).toFixed(2)),
          splitAmount: Number(Number(s.splitAmount).toFixed(2)),
        }));
    }

    const currentGroupId = groupId || expense?.group_id;
    const params = currentGroupId ? { groupId: currentGroupId } : {};

    if (expense?.id) {
      await handleThunk(
        dispatch(updateExpense({ id: expense.id, body })),
        () => {
          setSubmittingAction(null);
          dispatch(
            addToast({ type: "success", message: "Group expense updated!" }),
          );
          fetchCb?.();
          onClose();
        },
        () => setSubmittingAction(null),
      );
    } else {
      await handleThunk(
        dispatch(createExpense({ body, params })),
        () => {
          setSubmittingAction(null);
          dispatch(
            addToast({ type: "success", message: "Group expense added!" }),
          );
          fetchCb?.();
          onClose();
          setForm((prev) => ({
            ...prev,
            description: "",
            totalAmount: "",
            expenseDate: new Date().toISOString().split("T")[0],
          }));
        },
        () => setSubmittingAction(null),
      );
    }
  };

  const currencyOptions = Object.values(SUPPORTED_CURRENCIES).map((curr) => ({
    value: curr,
    label: curr,
  }));

  const payerOptions = useMemo(() => {
    if (!activeGroupDetails) {
      return [{ value: user?.id || "", label: user?.full_name || "You" }];
    }
    return groupMembers.map((member: GroupMember) => ({
      value: member.user_id,
      label: member.user.full_name,
    }));
  }, [groupMembers, activeGroupDetails, user]);

  const toggleMember = useCallback(
    (memberId: string) => {
      let thisActiveMembers;
      if (activeMembers.includes(memberId)) {
        thisActiveMembers = activeMembers.filter((id) => id !== memberId);
        setActiveMembers(thisActiveMembers);

        if (splitMode !== SPLIT_MODE.EQUAL) {
          setSplits((prev) =>
            prev.map((s) =>
              s.userId === memberId
                ? { ...s, splitPercentage: 0, splitAmount: 0 }
                : s,
            ),
          );
        }
      } else {
        thisActiveMembers = [...activeMembers, memberId];
        setActiveMembers(thisActiveMembers);
      }

      if (splitMode === SPLIT_MODE.EQUAL) {
        recalculateEqualSplits(thisActiveMembers, totalAmount);
      }
    },
    [activeMembers, splitMode, totalAmount, recalculateEqualSplits],
  );

  return (
    <form
      className={`${styles.form} ${styles.formFull}`}
      onSubmit={(e) => handleSubmit(EXPENSE_STATUS.SUBMITTED, e)}
    >
      <div className={styles.scrollableContent}>
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
            disabled
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
        </div>

        {(groupId || expense?.group_id) && (
          <div className={styles.splitsSection}>
            <div className={styles.splitsHeader}>
              <h4>Split Between</h4>
              <div className={styles.splitModeToggle}>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${splitMode === SPLIT_MODE.EQUAL ? styles.modeActive : ""}`}
                  onClick={() => handleSplitModeChange(SPLIT_MODE.EQUAL)}
                >
                  Equal
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${splitMode === SPLIT_MODE.PERCENTAGE ? styles.modeActive : ""}`}
                  onClick={() => handleSplitModeChange(SPLIT_MODE.PERCENTAGE)}
                >
                  By %
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${splitMode === SPLIT_MODE.AMOUNT ? styles.modeActive : ""}`}
                  onClick={() => handleSplitModeChange(SPLIT_MODE.AMOUNT)}
                >
                  By Amount
                </button>
              </div>
            </div>

            <div className={styles.splitsActions}>
              <span className={styles.selectedCount}>
                {activeMembers.length} of {groupMembers.length} selected
              </span>
              {splitMode === SPLIT_MODE.EQUAL &&
                totalAmount > 0 &&
                splits.length > 0 && (
                  <span className={styles.perPersonLabel}>
                    {form.currency}{" "}
                    {(totalAmount / activeMembers.length).toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits: 2,
                      },
                    )}{" "}
                    / person
                  </span>
                )}
            </div>

            <div className={styles.membersList}>
              {groupMembers.map((member: GroupMember) => {
                const memberId = member.user_id;
                const split = splits.find((s) => s.userId === memberId);
                const splitPercentage = split?.splitPercentage || 0;
                const splitAmount = split?.splitAmount || 0;
                const isActiveMember = activeMembers.includes(memberId);

                return (
                  <div
                    key={memberId}
                    className={`${styles.splitItem} ${isActiveMember ? styles.active : ""}`}
                    onClick={() => toggleMember(memberId)}
                  >
                    <div className={styles.userInfo}>
                      <div
                        className={`${styles.checkbox} ${isActiveMember ? styles.checked : ""}`}
                      >
                        {isActiveMember && <HiCheck />}
                      </div>
                      <div className={styles.avatar}>
                        {member.user?.avatar?.url ? (
                          <Image
                            src={member.user.avatar.url}
                            alt={member.user.full_name || "User"}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          (member?.user?.full_name).charAt(0)
                        )}
                      </div>
                      <span className={styles.memberName}>
                        {member.user?.full_name}
                        {user?.id === memberId && " (You)"}
                      </span>
                    </div>

                    {splitMode === SPLIT_MODE.EQUAL && totalAmount > 0 && (
                      <span className={styles.equalShare}>
                        {form.currency}{" "}
                        {splitAmount.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}

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
                            disabled={!activeMembers.includes(memberId)}
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
                            disabled={!activeMembers.includes(memberId)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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
      </div>

      <div className={styles.modalFooter}>
        <Button
          variant="ghost"
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="outline"
            onClick={() => handleSubmit(EXPENSE_STATUS.DRAFT)}
            type="button"
            isLoading={submittingAction === EXPENSE_STATUS.DRAFT}
            disabled={isSubmitting}
          >
            {expense ? "Update as Draft" : "Save as Draft"}
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={submittingAction === EXPENSE_STATUS.SUBMITTED}
            disabled={isSubmitting}
          >
            {expense ? "Update Expense" : "Add Expense"}
          </Button>
        </div>
      </div>
    </form>
  );
};

// --- Main Component ---

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchCb?: () => void;
  expenseType: EXPENSE_TYPE;
  expense?: Expense | null;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  fetchCb,
  expenseType,
  expense,
}: AddExpenseModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        expense
          ? expenseType === EXPENSE_TYPE.PERSONAL
            ? "Edit Personal Expense"
            : "Edit Group Expense"
          : expenseType === EXPENSE_TYPE.PERSONAL
            ? "Add Personal Expense"
            : "Add Group Expense"
      }
      size="xl"
      fullHeight
    >
      {expenseType === EXPENSE_TYPE.PERSONAL ? (
        <AddPersonalExpenseForm
          onClose={onClose}
          fetchCb={fetchCb}
          expense={expense}
        />
      ) : (
        <AddGroupExpenseForm
          onClose={onClose}
          fetchCb={fetchCb}
          expense={expense}
        />
      )}
    </Modal>
  );
}
