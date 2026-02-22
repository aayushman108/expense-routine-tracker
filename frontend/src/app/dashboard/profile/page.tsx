"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCamera,
  HiOutlineCheck,
  HiOutlineIdentification,
} from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/uiSlice";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Card from "@/components/ui/Card/Card";
import styles from "./profile.module.scss";
import type { RootState } from "@/store";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((s: RootState) => s.auth);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

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
    } else {
      dispatch(
        addToast({ type: "error", message: "Failed to update profile." }),
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <p>Manage your account settings and personal information.</p>
      </div>

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

        <form onSubmit={handleSubmit}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>
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
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              icon={<HiOutlineMail />}
              disabled
              title="Email cannot be changed"
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
            <div className="text-xs text-tertiary">
              Keep your profile updated for accurate settlements.
            </div>
            <Button type="submit" isLoading={isLoading}>
              <HiOutlineCheck /> Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <section className="mt-8">
        <h3 className={styles.sectionTitle}>Payment Methods</h3>
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 bg-tertiary rounded-lg border border-default">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-50 text-primary rounded-md flex items-center justify-center font-bold">
                  K
                </div>
                <div>
                  <div className="font-semibold">Khalti</div>
                  <div className="text-xs text-secondary">9841******</div>
                </div>
              </div>
              <span className="text-xs font-bold text-success uppercase">
                Verified • Default
              </span>
            </div>
            <Button variant="outline" fullWidth>
              Add New Payment Method
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
