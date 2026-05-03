"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlinePhotograph,
  HiOutlinePlus,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createGroupAction } from "@/store/slices/groupSlice";
import { addToast } from "@/store/slices/uiSlice";
import Modal from "@/components/ui/Modal/Modal";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { GroupValidation } from "@expense-tracker/shared/validationSchema";
import { validateData } from "@/lib/validation";
import styles from "./GroupModals.module.scss";
import type { RootState } from "@/store";
import { handleThunk } from "@/lib/utils";

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

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
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

    const result = validateData(GroupValidation.createGroupSchema, { body: form });
    if (!result.success && result.errors) {
      setValidationErrors(result.errors);
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    if (image) {
      formData.append("image", image);
    }

    await handleThunk(dispatch(createGroupAction(formData)), () => {
      dispatch(
        addToast({ type: "success", message: "Group created successfully!" }),
      );
      onClose();

      // Reset form
      setForm({ name: "", description: "" });
      setImage(null);
      setPreview(null);
      setValidationErrors({});
    });
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
          <label className={styles.previewWrapper}>
            <div className={styles.preview}>
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className={styles.placeholder}>
                  <HiOutlinePhotograph />
                  <span>Group Icon</span>
                </div>
              )}
            </div>
            <div className={styles.overlay}>
              <HiOutlinePhotograph />
              <span>{preview ? "Change" : "Upload"}</span>
            </div>
            <div className={styles.uploadBadge}>
              <HiOutlinePlus />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </label>
          <span className={styles.hint}>Recommended: Square image, max 2MB</span>
        </div>

        <Input
          label="Group Name"
          name="name"
          placeholder="E.g. Roommates, Family, Trip to Pokhara"
          icon={<HiOutlineUserGroup />}
          value={form.name}
          onChange={handleChange}
          error={validationErrors.name}
          required
        />
  
        <Input
          label="Description"
          name="description"
          placeholder="Briefly describe what this group is for"
          icon={<HiOutlineClipboardList />}
          value={form.description}
          onChange={handleChange}
          error={validationErrors.description}
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
