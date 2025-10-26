/**
 * Utility functions for formatting values for display
 */

/**
 * Format bytes into human-readable file size format
 *
 * @param bytes - The number of bytes to format
 * @returns Formatted string with appropriate unit (B, KB, MB, GB)
 *
 * @example
 * formatFileSize(1024) // "1.0 KB"
 * formatFileSize(1048576) // "1.0 MB"
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
