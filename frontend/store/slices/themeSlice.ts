import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Theme = "light" | "dark";

interface ThemeState {
  mode: Theme;
}

const initialState: ThemeState = {
  mode: "dark",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.mode = action.payload;
      if (typeof window !== "undefined") {
        document.documentElement.setAttribute("data-theme", action.payload);
        localStorage.setItem("theme", action.payload);
      }
    },
    toggleTheme: (state) => {
      const next = state.mode === "light" ? "dark" : "light";
      state.mode = next;
      if (typeof window !== "undefined") {
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      }
    },
    initTheme: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("theme") as Theme | null;
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        const theme = saved || (prefersDark ? "dark" : "light");
        state.mode = theme;
        document.documentElement.setAttribute("data-theme", theme);
      }
    },
  },
});

export const { setTheme, toggleTheme, initTheme } = themeSlice.actions;
export default themeSlice.reducer;
