export const formatStorageGB = (mbValue, precision) => {
  return (mbValue / 1024).toFixed(precision);
};

export const formatStorageValue = (mbValue, precision) => {
  if (mbValue >= 1024) {
    return `${(mbValue / 1024).toFixed(precision)} GB`;
  }
  return `${mbValue.toFixed(precision)} MB`;
};
