/**
 * Convert hex color to comma-separated RGB string.
 * Used in rgba() template literals.
 * @param {string} hex - e.g. '#00FF9C'
 * @returns {string} - e.g. '0,255,156'
 */
export function hexToRgb(hex) {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return res
    ? `${parseInt(res[1], 16)},${parseInt(res[2], 16)},${parseInt(res[3], 16)}`
    : '0,255,156';
}
