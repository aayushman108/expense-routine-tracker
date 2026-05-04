import { ToastType } from "@/enums/general.enum";

export const showToast = (
  type: ToastType,
  message: string,
  duration: number = 5000,
) => {
  // Use dynamic imports to avoid circular dependency issues
  Promise.all([import("@/store"), import("@/store/slices/uiSlice")]).then(
    ([{ store }, { addToast }]) => {
      store.dispatch(addToast({ type, message, duration }));
    },
  );
};
