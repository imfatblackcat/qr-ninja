import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges CSS class names using clsx and tailwind-merge
 * This utility helps keep your Tailwind classes organized and manageable
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
