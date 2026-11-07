// All amounts are fictional integer piastres. No API or production data is used.
export function minorUnits(value) {
  const text = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new Error('Enter a positive amount with up to two decimal places.');
  const [whole, fraction = ''] = text.split('.');
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 100000000) throw new Error('Amount must be between EGP 0.01 and EGP 1,000,000.');
  return amount;
}
export function bankOperation(state, { kind, amount, recipient = '', key, note = '', date }) {
  if (!['deposit', 'withdraw', 'transfer'].includes(kind) || !Number.isSafeInteger(amount) || amount <= 0 || !key) throw new Error('Invalid transaction.');
  const receipt = state.transactions.find(t => t.key === key);
  if (receipt) {
    if (receipt.kind !== kind || receipt.amount !== amount || receipt.recipient !== recipient) throw new Error('This request key belongs to a different transaction.');
    return { state, receipt, replayed: true };
  }
  if (kind === 'transfer' && !['Nour Ahmed', 'Omar Hassan', 'Mariam Ali'].includes(recipient)) throw new Error('Choose a demo recipient.');
  if (kind !== 'deposit' && amount > state.balance) throw new Error('Insufficient demo balance.');
  const balance = state.balance + (kind === 'deposit' ? amount : -amount);
  if (!Number.isSafeInteger(balance)) throw new Error('Balance limit reached.');
  const transaction = { id: key, key, kind, amount, recipient, note: String(note).slice(0, 120), date: date || new Date().toISOString(), balance };
  return { state: { ...state, balance, transactions: [transaction, ...state.transactions] }, receipt: transaction, replayed: false };
}
export function cartAdd(cart, product, quantity = 1, restaurant = null) {
  if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Quantity must be from 1 to 20.');
  if (restaurant && cart.some(item => item.restaurant !== restaurant)) throw new Error('Your basket contains meals from another restaurant. Clear it first.');
  const previous = cart.find(item => item.id === product.id);
  if ((previous?.quantity || 0) + quantity > 20) throw new Error('Maximum quantity is 20 per item.');
  return previous ? cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...cart, { id: product.id, name: product.name, price: product.price, quantity, restaurant }];
}
export const cartTotal = cart => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const orderStates = ['Pending', 'Preparing', 'On the way', 'Delivered'];
export function transitionOrder(order, action, role) {
  if (action === 'Cancelled') {
    if (order.status !== 'Pending') throw new Error('Only pending orders can be cancelled.');
    if (!['customer', 'owner', 'admin'].includes(role)) throw new Error('Choose a demo role.');
  } else if (!['owner', 'admin'].includes(role) || orderStates.indexOf(action) !== orderStates.indexOf(order.status) + 1 || ['Cancelled', 'Delivered'].includes(order.status)) {
    throw new Error('This order cannot move to that status.');
  }
  return { ...order, status: action };
}
export function createIdea(ideas, { id, description, state }) {
  const text = String(description).trim();
  if (text.length < 5 || text.length > 500) throw new Error('Write an idea between 5 and 500 characters.');
  if (!['New', 'In progress', 'Done'].includes(state)) throw new Error('Choose a valid idea status.');
  return [{ id, description: text, state }, ...ideas.filter(idea => idea.id !== id)];
}
