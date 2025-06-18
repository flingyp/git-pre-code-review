/**
 * 深度合并多个对象到一个对象。
 * - 嵌套对象会递归合并。
 * - 数组会进行合并并去重（针对基本类型值）。
 * - 非对象值会保留最后一个对象的属性值。
 * @param objects - 要合并的对象
 * @returns 合并后的新对象
 */
export function deepMerge<T extends object[]>(...objects: T): T[number] {
  // Return empty object if no objects provided
  if (objects.length === 0) return {} as T[number];

  // Filter out null/undefined and non-objects
  const validObjects = objects.filter(
    (obj): obj is object => obj != null && typeof obj === 'object' && !Array.isArray(obj),
  );

  // Return empty object if no valid objects
  if (validObjects.length === 0) return {} as T[number];

  // Initialize result
  const result: Record<string, any> = {};

  // Iterate through all objects
  for (const obj of validObjects) {
    for (const [key, value] of Object.entries(obj)) {
      // If key doesn't exist in result or result[key] is not an object, assign value
      if (!(key in result) || typeof result[key] !== 'object' || Array.isArray(result[key])) {
        if (Array.isArray(value)) {
          // For arrays, concatenate and deduplicate if result[key] is also an array
          result[key] = Array.isArray(result[key]) ? [...new Set([...result[key], ...value])] : [...value];
        } else if (value != null && typeof value === 'object') {
          // For objects, recursively merge
          result[key] = deepMerge(result[key] || {}, value);
        } else {
          // For primitive values, assign directly
          result[key] = value;
        }
      } else {
        // For existing objects, recursively merge
        result[key] = deepMerge(result[key], value);
      }
    }
  }

  return result as T[number];
}
