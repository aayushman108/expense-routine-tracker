"use client";

import { Provider } from "react-redux";
import { store } from "@/src/store";
import { useEffect } from "react";
import { initTheme } from "@/src/store/slices/themeSlice";

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
