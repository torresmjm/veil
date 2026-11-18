/** Pure financial calculations. Keep these independent from UI and I/O. */
export function exchangeOutput(
  amount: number,
  fromPrice: number,
  toPrice: number,
  feeRate = 0,
): number {
  if (![amount, fromPrice, toPrice, feeRate].every(Number.isFinite)) return 0;
  if (amount <= 0 || fromPrice <= 0 || toPrice <= 0 || feeRate < 0 || feeRate >= 1) return 0;

  return (amount * fromPrice * (1 - feeRate)) / toPrice;
}
