import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | null,
): string {
  const fromName = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n![0])
    .join('')
    .toUpperCase();

  if (fromName) return fromName;

  return (fallback ?? '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
