/** Immutable list helpers for the Experiences editor. */

export function replaceAt<T>(list: readonly T[], index: number, item: T): T[] {
  return list.map((current, i) => (i === index ? item : current));
}

export function removeAt<T>(list: readonly T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

/** Moves an item one step; returns the list unchanged if it can't move that way. */
export function move<T>(list: readonly T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return [...list];
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
