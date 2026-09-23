/**
 * Formats byte values into human-readable units (Bytes, KB, MB, GB, TB).
 * Examples:
 * - 705536 bytes -> '689 KB' (or '688.5 KB')
 * - 5368709120 bytes -> '5 GB'
 */
export const formatBytes = (bytes, precision = 2) => {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '0 Bytes';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = precision < 0 ? 0 : precision;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(Math.max(0, i), sizes.length - 1);
  const val = bytes / Math.pow(k, idx);
  
  // Format clean integer if whole number, otherwise use precision
  const formatted = (val % 1 === 0 || idx === 0) ? Math.round(val).toString() : val.toFixed(dm);
  return `${formatted} ${sizes[idx]}`;
};

export const formatStorageGB = (mbValue, precision = 2) => {
  if (mbValue === undefined || mbValue === null || isNaN(mbValue)) return '0.00';
  return (mbValue / 1024).toFixed(precision);
};

export const formatStorageValue = (mbValue, precision = 2) => {
  if (mbValue === undefined || mbValue === null || isNaN(mbValue)) return '0 MB';
  if (mbValue >= 1024) {
    return `${(mbValue / 1024).toFixed(precision)} GB`;
  }
  return `${mbValue.toFixed(precision)} MB`;
};
