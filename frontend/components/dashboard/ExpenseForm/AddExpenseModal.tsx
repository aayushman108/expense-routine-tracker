"use client";

import { useState, useEffect, useMemo } from "react";
import {
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineCalendar,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createExpense } from "@/store/slices/expenseSlice";
import { addToast } from "@/store/slices/uiSlice";
import Modal from "@/components/ui/Modal/Modal";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import styles from "./ExpenseForm.module.scss";
import type { RootState } from "@/store";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string | null;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  groupId = null,
}: AddExpenseModalProps) {
  const dispatch = useAppDispatch();
  const { members } = useAppSelector((s: RootState) => s.groups);
  const { user } = useAppSelector((s: RootState) => s.auth);

  const [form, setForm] = useState({
    description: "",
    total_amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    group_id: groupId || "",
  });

  const [splits, setSplits] = useState<
    { user_id: string; split_ratio: number }[]
  >([]);

  useEffect(() => {
    if (groupId && members.length > 0) {
      setSplits(
        members.map((m: any) => ({ user_id: m.user_id, split_ratio: 1 })),
      );
    } else if (user) {
      setSplits([{ user_id: user.id, split_ratio: 1 }]);
    }
  }, [members, user, groupId, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSplitChange = (userId: string, ratio: number) => {
    setSplits((prev) =>
      prev.map((s) =>
        s.user_id === userId ? { ...s, split_ratio: ratio } : s,
      ),
    );
  };

  const totalRatios = useMemo(
    () => splits.reduce((acc, curr) => acc + curr.split_ratio, 0),
    [splits],
  );
  const amount = Number(form.total_amount) || 0;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (amount <= 0) return;

    const payload = {
      ...form,
      total_amount: amount,
      group_id: form.group_id || null,
      splits: splits.filter((s) => s.split_ratio > 0),
    };

    const result = await dispatch(createExpense(payload));
    if (createExpense.fulfilled.match(result)) {
      dispatch(addToast({ type: "success", message: "Expense added!" }));
      onClose();
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
            label="Amount (NPR)"
            name="total_amount"
            type="number"
            placeholder="0.00"
            icon={<HiOutlineCurrencyDollar />}
            value={form.total_amount}
            onChange={handleChange}
            required
          />
          <Input
            label="Date"
            name="expense_date"
            type="date"
            icon={<HiOutlineCalendar />}
            value={form.expense_date}
            onChange={handleChange}
            required
          />
        </div>

        {groupId && (
          <div className={styles.splitsSection}>
            <h4>
              <span>Split Between</span>
              <span className="text-tertiary">Ratio Based</span>
            </h4>
            <div className="flex flex-col gap-2">
              {members.map((member: any) => {
                const split = splits.find((s) => s.user_id === member.user_id);
                const ratio = split?.split_ratio || 0;
                const share =
                  totalRatios > 0 ? (amount * ratio) / totalRatios : 0;

                return (
                  <div key={member.user_id} className={styles.splitItem}>
                    <div className={styles.userInfo}>
                      <span className="text-secondary">
                        {member.user?.full_name}
                      </span>
                    </div>
                    <div className={styles.inputWrap}>
                      <input
                        type="number"
                        value={ratio}
                        onChange={(e) =>
                          handleSplitChange(
                            member.user_id,
                            Number(e.target.value),
                          )
                        }
                      />
                      <span className={styles.share}>
                        रू{" "}
                        {share.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.summary}>
          <span className={styles.label}>Total amount to split:</span>
          <span className={styles.total}>रू {amount.toLocaleString()}</span>
        </div>
      </form>
    </Modal>
  );
}
