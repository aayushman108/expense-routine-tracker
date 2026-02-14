"use client";

import { Provider } from "react-redux";
import { useEffect } from "react";
import { store } from "@/store";
import { initTheme } from "@/store/slices/themeSlice";

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initTheme());
  }, []);

  return <>{children}</>;
}

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <ThemeInitializer>{children}</ThemeInitializer>
    </Provider>
  );
}
