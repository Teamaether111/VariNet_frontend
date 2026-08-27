/**
 * Unique ID generator utility to prevent React key collisions and identity duplicate errors.
 */

let globalCounter = 0;

export const generateUniqueId = (prefix = 'id'): string => {
  globalCounter = (globalCounter + 1) % 1000000;
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${globalCounter}-${randomPart}`;
};
