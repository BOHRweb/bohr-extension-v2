// TODO: Rename to reflect that this function is used for more cases than BR, and update all uses.
export function formatETHFee(ethFee, currencySymbol = 'BR') {
  return `${ethFee} ${currencySymbol}`;
}
