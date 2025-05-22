import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs); // ← Added the spread operator
}

export { clsx };