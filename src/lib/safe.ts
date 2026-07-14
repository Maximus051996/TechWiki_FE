import type { Paginated } from './types';

/**
 * Wraps a promise so a failed API call (e.g. backend offline) degrades to a
 * fallback value instead of crashing the whole server-rendered page.
 */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

/** Strongly-typed empty paginated result for use as a safe() fallback. */
export function emptyPaginated<T>(): Paginated<T> {
  return {
    items: [],
    pagination: { total: 0, page: 1, limit: 0, totalPages: 1, hasNext: false, hasPrev: false },
  };
}
