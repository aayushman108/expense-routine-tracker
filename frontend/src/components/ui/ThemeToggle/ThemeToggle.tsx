"use client";

import { HiSun, HiMoon } from "react-icons/hi";
import styles from "./ThemeToggle.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/themeSlice";

export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);

  return (
    <button
      className={styles.toggle}
      onClick={() => dispatch(toggleTheme())}
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
    >
      {mode === "dark" ? <HiSun /> : <HiMoon />}
    </button>
  );
}
