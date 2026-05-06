/**
 * Handles the execution of a Redux Toolkit async thunk action.
 * Automatically unwraps the result and manages success/error callbacks.
 *
 * @param action - The result of dispatch(thunk(...))
 * @param onSuccess - Optional callback to execute on successful resolution
 * @param onError - Optional callback to execute on rejection
 * @returns The resolved data or undefined if an error occurred
 */
export const handleThunk = async <T>(
  action: { unwrap: () => Promise<T> },
  onSuccess?: (data: T) => void,
  onError?: (error: any) => void,
): Promise<T | undefined> => {
  try {
    const data = await action.unwrap();
    if (onSuccess) onSuccess(data);
    return data;
  } catch (error) {
    if (onError) onError(error);
    return undefined;
  }
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const formatTimeAgo = (date: Date | string) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return new Date(date).toLocaleDateString();
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
};
