export function initialLedger() { return { balance: 100000, receipts: {} }; }
// A local debit simulation, not a payment API. Store the original payload with its receipt.
export function debit(ledger, key, amount) {
  if (!key || !Number.isSafeInteger(amount) || amount <= 0) throw new Error('Invalid request');
  if (Object.hasOwn(ledger.receipts, key)) {
    if (ledger.receipts[key].amount !== amount) throw new Error('Request key already used for a different amount');
    return ledger;
  }
  if (amount > ledger.balance) throw new Error('Insufficient balance');
  return { balance: ledger.balance - amount, receipts: { ...ledger.receipts, [key]: { amount } } };
}
