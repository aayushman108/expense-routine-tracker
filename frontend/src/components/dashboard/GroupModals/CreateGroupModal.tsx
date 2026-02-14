"use client";

import { useState } from "react";
import {
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlinePhotograph,
  HiOutlinePlus,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createGroup } from "@/store/slices/groupSlice";
import { addToast } from "@/store/slices/uiSlice";
import Modal from "@/components/ui/Modal/Modal";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import styles from "./GroupModals.module.scss";
import type { RootState } from "@/store";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
}: CreateGroupModalProps) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s: RootState) => s.groups);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) return;

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    if (image) {
      formData.append("image", image);
    }

    const result = await dispatch(createGroup(formData));
    if (createGroup.fulfilled.match(result)) {
      dispatch(
        addToast({ type: "success", message: "Group created successfully!" }),
      );
      onClose();
      // Reset form
      setForm({ name: "", description: "" });
      setImage(null);
      setPreview(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create A Shared Group"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit()}
            isLoading={isLoading}
          >
            <HiOutlinePlus /> Create Group
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.imageUpload}>
          <div className={styles.preview}>
            {preview ? (
              <img src={preview} alt="Preview" />
            ) : (
              <div className={styles.placeholder}>
                <HiOutlinePhotograph />
                <span>Optional Image</span>
              </div>
            )}
            <label className={styles.uploadBtn}>
              <HiOutlinePlus />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </label>
          </div>
        </div>

        <Input
          label="Group Name"
          name="name"
          placeholder="E.g. Roommates, Family, Trip to Pokhara"
          icon={<HiOutlineUserGroup />}
          value={form.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Description"
          name="description"
          placeholder="Briefly describe what this group is for"
          icon={<HiOutlineClipboardList />}
          value={form.description}
          onChange={handleChange}
        />

        <div className="mt-4 p-4 bg-tertiary rounded-lg border border-default text-xs text-secondary leading-relaxed">
          <span className="font-bold text-tertiary uppercase block mb-1">
            Notice
          </span>
          By creating this group, you will be set as the Administrator. You can
          invite other members from the group details page.
        </div>
      </form>
    </Modal>
  );
}
