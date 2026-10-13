/**
 * Utility to make admin-configured font sizes responsive across mobile, tablet, and desktop.
 * When the admin increases/decreases font size, mobile scales proportionally while desktop
 * reaches the full admin-chosen size without overflowing on mobile screens.
 */
export const getResponsiveHeadingFontSize = (val) => {
  if (!val) return undefined;
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (!num || isNaN(num)) return undefined;
  const min = Math.max(22, Math.round(num * 0.52));
  const base = Math.max(14, Math.round(num * 0.36));
  return `clamp(${min}px, calc(${base}px + 2.8vw), ${num}px)`;
};

export const getResponsiveDescriptionFontSize = (val) => {
  if (!val) return undefined;
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (!num || isNaN(num)) return undefined;
  const min = Math.max(13, Math.round(num * 0.78));
  return `clamp(${min}px, calc(${min - 2}px + 0.8vw), ${num}px)`;
};

export const getResponsiveEyebrowFontSize = (val) => {
  if (!val) return undefined;
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (!num || isNaN(num)) return undefined;
  const min = Math.max(10, Math.round(num * 0.82));
  return `clamp(${min}px, 2.8vw, ${num}px)`;
};
