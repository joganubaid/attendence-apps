/**
 * Security utility functions for the application.
 * Centralizes security checks and validations.
 */

/**
 * Validates if a URL is safe to open (only allows http and https protocols).
 * Prevents opening malicious schemes like javascript:, file:, etc.
 *
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is safe, false otherwise
 */
export const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  try {
    const trimmedUrl = url.trim();

    // Check for http/https at the start
    // Using regex to catch cases where there might be whitespace or casing issues
    // although trimming handles whitespace.
    // We want to be strict: must start with http:// or https://
    // Case insensitive check for protocol
    return /^(https?):\/\//i.test(trimmedUrl);
  } catch (e) {
    return false;
  }
};
