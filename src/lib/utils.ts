import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a stable key for array items.
 * Since biome flags array indices as keys, we prefix them with the context.
 */
export function stableKey(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}
