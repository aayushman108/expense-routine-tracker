/**
 * Converts camelCase to snake_case.
 */
export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Converts keys of an object from camelCase to snake_case.
 */
export const keysToSnakeCase = (
  obj: Record<string, any>,
): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[toSnakeCase(key)] = obj[key];
    }
  }
  return result;
};
