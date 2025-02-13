const formatPurseValue = ({ currentAmount, displayInfo }) =>
  Number(currentAmount.value) / Math.pow(10, displayInfo.decimalPlaces);

export { formatPurseValue };
