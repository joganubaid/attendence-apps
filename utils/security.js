/**
 * Security utilities for the application.
 */

/**
 * Validates a URL to ensure it uses a safe protocol (http or https).
 * Prevents usage of javascript:, file:, data:, or other potentially malicious schemes.
 *
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is safe to open (http/https).
 */
export const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  const trimmedUrl = url.trim().toLowerCase();

  // Explicitly check for http:// or https:// at the start
  // This avoids issues with relative paths or other schemes
  return trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
};
