"use client";

import { useState } from "react";
import Image from "next/image";
import {
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlinePhotograph,
  HiOutlineSave,
  HiOutlinePencil,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateGroupAction } from "@/store/slices/groupSlice";
import { addToast } from "@/store/slices/uiSlice";
import Modal from "@/components/ui/Modal/Modal";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import styles from "./GroupModals.module.scss";
import type { RootState } from "@/store";
import { handleThunk } from "@/lib/utils";
import type { Group } from "@/lib/types";

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

export default function EditGroupModal({
  isOpen,
  onClose,
  group,
}: EditGroupModalProps) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s: RootState) => s.groups);

  const [form, setForm] = useState({
    name: group.name,
    description: group.description || "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    group.image?.url || null,
  );

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

    await handleThunk(
      dispatch(updateGroupAction({ groupId: group.id, formData })),
      () => {
        dispatch(
          addToast({ type: "success", message: "Group updated successfully!" }),
        );
        onClose();
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      disableClose={isLoading}
      title="Edit Group Details"
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
            <HiOutlineSave /> Save Changes
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
              <HiOutlinePencil />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </label>
          <span className={styles.hint}>
            Recommended: Square image, max 2MB
          </span>
        </div>

        <Input
          label="Group Name"
          name="name"
          placeholder="E.g. Roommates, Family"
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
      </form>
    </Modal>
  );
}
