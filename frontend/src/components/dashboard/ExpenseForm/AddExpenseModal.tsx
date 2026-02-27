"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  EXPENSE_TYPE,
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
  const { groupDetails, groups } = useAppSelector((s: RootState) => s.groups);
  const { user } = useAppSelector((s: RootState) => s.auth);
  const [activeMembers, setActiveMembers] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const currentGroupFromContext = groupDetails.data;
  const groupId = selectedGroupId || currentGroupFromContext?.id;

  const [form, setForm] = useState({
    expenseType: currentGroupFromContext?.id
      ? EXPENSE_TYPE.GROUP
      : (EXPENSE_TYPE.PERSONAL as EXPENSE_TYPE),
    description: "",
    totalAmount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paidBy: user?.id,
    currency: "NPR",
  });

  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        ...prev,
        expenseType: currentGroupFromContext?.id
          ? EXPENSE_TYPE.GROUP
          : EXPENSE_TYPE.PERSONAL,
        paidBy: user?.id,
      }));
      setSelectedGroupId(currentGroupFromContext?.id || null);
    }
  }, [isOpen, currentGroupFromContext, user]);

  const activeGroupDetails = useMemo(() => {
    if (selectedGroupId && selectedGroupId === currentGroupFromContext?.id) {
      return currentGroupFromContext;
    }
    // If not current group, we might need to fetch it or find it in groups list
    // For now, let's assume we can find members in the groups list if we had them,
    // but the groups list usually doesn't have members.
    // So we should probably only allow selecting the 'current' group or none.
    return selectedGroupId === currentGroupFromContext?.id
      ? currentGroupFromContext
      : null;
  }, [selectedGroupId, currentGroupFromContext]);

  const groupMembers = useMemo(() => {
    return activeGroupDetails?.members || [];
  }, [activeGroupDetails]);

  useEffect(() => {
    setActiveMembers(groupMembers.map((m: GroupMember) => m.user_id));
  }, [groupMembers]);

  const [splits, setSplits] = useState<
    { userId: string; splitPercentage: number; splitAmount: number }[]
  >([]);

  const [splitMode, setSplitMode] = useState<SPLIT_MODE>(SPLIT_MODE.EQUAL);

  const totalAmount = Number(form.totalAmount) || 0;

  // Initialize splits when members change
  useEffect(() => {
    if (form.expenseType === EXPENSE_TYPE.GROUP && groupMembers.length > 0) {
      setSplits(
        groupMembers.map((m: GroupMember) => ({
          userId: m.user_id,
          splitPercentage: 100 / groupMembers.length,
          splitAmount: totalAmount / groupMembers.length,
        })),
      );
    } else {
      setSplits([]);
    }
  }, [groupMembers, user, form.expenseType, totalAmount]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
          return prev.map((s) => {
            return {
              ...s,
              splitPercentage: 100 / activeMembers.length,
              splitAmount: totalAmount / activeMembers.length,
            };
          });
        }
      });
    },
    [activeMembers, splitMode, totalAmount],
  );

  const handleSetSplits = useCallback(() => {
    setSplits((prev) => {
      if (splitMode === SPLIT_MODE.EQUAL) {
        return prev.map((s) => {
          if (activeMembers.includes(s.userId)) {
            return {
              ...s,
              splitPercentage: 100 / activeMembers.length,
              splitAmount: totalAmount / activeMembers.length,
            };
          } else {
            return { ...s, splitPercentage: 0, splitAmount: 0 };
          }
        });
      } else {
        return prev.map((s) => {
          return { ...s, splitPercentage: 0, splitAmount: 0 };
        });
      }
    });
  }, [totalAmount, splitMode, activeMembers]);

  useEffect(() => {
    if (form.expenseType === EXPENSE_TYPE.GROUP) {
      handleSetSplits();
    }
  }, [handleSetSplits, form.expenseType]);

  // For amount mode: total assigned vs total amount
  const totalAssigned = useMemo(() => {
    if (splitMode === SPLIT_MODE.AMOUNT) {
      return splits.reduce((acc, s) => acc + s.splitAmount, 0);
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

    const body: any = {
      ...form,
      totalAmount: Number(form.totalAmount) || 0,
    };

    if (form.expenseType === EXPENSE_TYPE.GROUP && groupId) {
      body.splits = splits
        .filter((s) => s.splitPercentage > 0)
        .map((s) => ({
          ...s,
          splitPercentage: Number(s.splitPercentage),
          splitAmount: Number(s.splitAmount),
        }));
    } else {
      delete body.splits;
    }

    const params =
      form.expenseType === EXPENSE_TYPE.GROUP && groupId ? { groupId } : {};

    await handleThunk(dispatch(createExpense({ body, params })), () => {
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

  const groupOptions = useMemo(
    () =>
      groups.data.map((g) => ({
        value: g.id,
        label: g.name,
      })),
    [groups.data],
  );

  const payerOptions = useMemo(() => {
    if (form.expenseType === EXPENSE_TYPE.PERSONAL || !activeGroupDetails) {
      return [{ value: user?.id || "", label: user?.full_name || "You" }];
    }
    return groupMembers.map((member: GroupMember) => ({
      value: member.user_id,
      label: member.user.full_name,
    }));
  }, [groupMembers, form.expenseType, activeGroupDetails, user]);

  const toggleMember = useCallback(
    (memberId: string) => {
      let thisActiveMembers;
      if (activeMembers.includes(memberId)) {
        thisActiveMembers = activeMembers.filter((id) => id !== memberId);
        setActiveMembers(thisActiveMembers);
      } else {
        thisActiveMembers = [...activeMembers, memberId];
        setActiveMembers(thisActiveMembers);
      }

      setSplits((prev) => {
        if (splitMode === SPLIT_MODE.EQUAL) {
          return prev.map((s) => {
            if (thisActiveMembers.includes(s.userId)) {
              return {
                ...s,
                splitPercentage: 100 / thisActiveMembers.length,
                splitAmount: totalAmount / thisActiveMembers.length,
              };
            }
            return { ...s, splitPercentage: 0, splitAmount: 0 };
          });
        } else {
          return prev.map((s) => {
            if (!thisActiveMembers.includes(s.userId)) {
              return { ...s, splitPercentage: 0, splitAmount: 0 };
            }
            return s;
          });
        }
      });
    },
    [activeMembers, splitMode, totalAmount],
  );

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
        <div className={styles.expenseTypeToggle}>
          <button
            type="button"
            className={`${styles.typeBtn} ${form.expenseType === EXPENSE_TYPE.PERSONAL ? styles.active : ""}`}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                expenseType: EXPENSE_TYPE.PERSONAL,
              }))
            }
          >
            Personal
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${form.expenseType === EXPENSE_TYPE.GROUP ? styles.active : ""}`}
            onClick={() =>
              setForm((prev) => ({ ...prev, expenseType: EXPENSE_TYPE.GROUP }))
            }
          >
            Group
          </button>
        </div>

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

        {form.expenseType === EXPENSE_TYPE.GROUP && (
          <>
            {!currentGroupFromContext?.id && (
              <Select
                label="Select Group"
                name="groupId"
                value={selectedGroupId || ""}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                options={groupOptions}
                placeholder="Select a group"
                required
              />
            )}

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
                                    Math.max(
                                      0,
                                      parseFloat(e.target.value) || 0,
                                    ),
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
                          Math.abs(amountRemaining) < 0.01
                            ? styles.progressOk
                            : ""
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
          </>
        )}

        <div className={styles.summary}>
          <span className={styles.summaryLabel}>
            {form.expenseType === EXPENSE_TYPE.PERSONAL
              ? "Total amount:"
              : "Total amount to split:"}
          </span>
          <span className={styles.total}>
            {form.currency} {totalAmount.toLocaleString()}
          </span>
        </div>
      </form>
    </Modal>
  );
}
