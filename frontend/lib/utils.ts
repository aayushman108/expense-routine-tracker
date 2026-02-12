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
