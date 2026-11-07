import { installDemo, reject, cents, money, uuid, now } from '../shared/demo.js';
export const customer = { id: 1, name: 'Demo Customer', email: 'customer@example.test', role: 'customer' };
export const admin = { id: 3, name: 'Demo Admin', email: 'admin@example.test', role: 'admin' };
export const accountRef = 'a1111111-1111-4111-8111-111111111111';
export const recipientRef = 'b2222222-2222-4222-8222-222222222222';
export function seedBank() {
  return { accounts: [
    { reference: accountRef, currency: 'EGP', balance: '125000.00', status: 'active', user_id: 1, created_at: '2026-10-01T10:00:00Z' },
    { reference: recipientRef, currency: 'EGP', balance: '18500.00', status: 'active', user_id: 2, created_at: '2026-10-02T10:00:00Z' },
  ], transactions: [
    { reference: 'e5555555-5555-4555-8555-555555555555', type: 'withdrawal', currency: 'EGP', amount: '700.00', source_account: accountRef, destination_account: null, created_at: '2026-11-02T10:00:00Z' },
    { reference: 'd4444444-4444-4444-8444-444444444444', type: 'deposit', currency: 'EGP', amount: '125700.00', source_account: null, destination_account: accountRef, created_at: '2026-11-01T10:00:00Z' },
  ], history: [], receipts: {} };
}
export function bankApi({ state, role, path, method, body, query, headers, save }) {
  const isAdmin = role === 'admin';
  const owns = (account) => account && (isAdmin || account.user_id === 1);
  const page = (items) => { const current = Math.max(1, Number(query.get('page')) || 1); return { data: items.slice((current - 1) * 10, current * 10), meta: { current_page: current, last_page: Math.max(1, Math.ceil(items.length / 10)), total: items.length } }; };
  const data = (value) => ({ data: value });
  if (path === '/auth/me') return data(isAdmin ? admin : customer);
  if (path === '/accounts' && method === 'GET') return page(state.accounts.filter(owns));
  if (path === '/accounts' && method === 'POST') {
    const account = { reference: uuid(), currency: 'EGP', balance: '0.00', status: 'active', user_id: 1, created_at: now() };
    state.accounts.unshift(account); save(); return data(account);
  }
  const myReferences = state.accounts.filter(owns).map(a => a.reference);
  if (path === '/transactions') return page(state.transactions.filter(t => myReferences.includes(t.source_account) || myReferences.includes(t.destination_account)));
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'admin' && parts[1] === 'accounts') {
    if (!isAdmin) reject('Administrator demo required.', 403);
    const account = state.accounts.find(a => a.reference === parts[2]);
    if (!account) reject('Account not found.', 404);
    if (parts[3] === 'status-changes') return page(state.history.filter(h => h.account === account.reference));
    if (method === 'POST' && ['freeze', 'unfreeze'].includes(parts[3])) {
      if (!String(body.reason || '').trim()) reject('Enter a reason for this change.');
      const status = parts[3] === 'freeze' ? 'frozen' : 'active';
      state.history.unshift({ id: uuid(), account: account.reference, from_status: account.status, to_status: status, reason: body.reason, performed_by: admin, created_at: now() });
      account.status = status; save(); return data(account);
    }
  }
  if (parts[0] === 'accounts' && parts.length === 3) {
    const account = state.accounts.find(a => a.reference === parts[1]);
    if (!owns(account)) reject('Account not found.', 404);
    if (parts[2] === 'transactions') return page(state.transactions.filter(t => t.source_account === account.reference || t.destination_account === account.reference));
    const kind = { deposits: 'deposit', withdrawals: 'withdrawal', transfers: 'transfer' }[parts[2]];
    if (kind && method === 'POST') {
      if (isAdmin) reject('Use the customer demo for money operations.', 403);
      const key = headers.get('Idempotency-Key');
      if (!key) reject('An idempotency key is required.');
      const signature = JSON.stringify({ path, body });
      const old = state.receipts[key];
      if (old) { if (old.signature !== signature) reject('This key belongs to a different operation.', 409); return data(old.receipt); }
      if (account.status !== 'active') reject('This account is frozen.');
      const amount = cents(body.amount);
      const balance = BigInt(account.balance.replace('.', ''));
      if (kind !== 'deposit' && amount > balance) reject('Insufficient funds.');
      const recipient = kind === 'transfer' ? state.accounts.find(a => a.reference === body.destination_account) : null;
      if (kind === 'transfer' && (!recipient || recipient === account || recipient.status !== 'active' || recipient.currency !== account.currency)) reject('Choose another active account in the same currency.');
      const next = kind === 'deposit' ? balance + amount : balance - amount;
      if (next > 9223372036854775807n) reject('The balance would exceed the supported range.');
      if (recipient && BigInt(recipient.balance.replace('.', '')) + amount > 9223372036854775807n) reject('The recipient balance would exceed the supported range.');
      const receipt = { reference: uuid(), type: kind, currency: account.currency, amount: money(amount), source_account: kind === 'deposit' ? null : account.reference, destination_account: kind === 'withdrawal' ? null : recipient?.reference || account.reference, created_at: now() };
      account.balance = money(next);
      if (recipient) recipient.balance = money(BigInt(recipient.balance.replace('.', '')) + amount);
      state.transactions.unshift(receipt); state.receipts[key] = { signature, receipt }; save(); return data(receipt);
    }
  }
  reject('This endpoint is unavailable in the static demo.', 404);
}
if (typeof window !== 'undefined') installDemo({ key: 'original-bank-demo-v1', seed: seedBank, roles: ['customer', 'admin'], handler: bankApi,
  session: role => sessionStorage.setItem('mvp-bank.session', JSON.stringify({ access_token: 'fictional-demo-session', expires_at: '2099-01-01T00:00:00Z', user: role === 'admin' ? admin : customer })),
  hint: `Transfer recipient: <code>${recipientRef}</code>. Sign out restarts the guest demo.` });
