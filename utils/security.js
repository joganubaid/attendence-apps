/**
 * Security utility functions to protect the application.
 */

/**
 * Validates if a URL is safe to open (HTTP/HTTPS only).
 * @param {string} url - The URL to validate.
 * @param {Object} options - Validation options.
 * @param {boolean} [options.requireHttps=false] - If true, only allows HTTPS.
 * @returns {boolean} - True if the URL is safe.
 */
export const isSafeUrl = (url, options = { requireHttps: false }) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    if (options.requireHttps && u.protocol !== 'https:') return false;
    return ['http:', 'https:'].includes(u.protocol);
  } catch (e) {
    return false;
  }
};

/**
 * Mask sensitive data for logging.
 * @param {string} text - The text to mask.
 * @returns {string} - Masked text.
 */
export const maskSensitive = (text) => {
  if (!text || typeof text !== 'string') return '***';
  if (text.length < 4) return '***';
  return text.substring(0, 2) + '***' + text.substring(text.length - 2);
};
