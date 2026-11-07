import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { bankApi, seedBank, accountRef, recipientRef } from '../original-demos/mvp-bank/demo.js';
import { config } from '../src/config.js';

function request(handler, state, path, body, role = 'customer', key = 'test-key', method) {
  return handler({ state, role, path, method: method || (body === undefined ? 'GET' : 'POST'), body: body || {}, query: new URLSearchParams(), headers: new Headers({ 'Idempotency-Key': key }), save() {} });
}
test('bank starts with a fictional customer and original UI sources remain unchanged', () => {
  const state = seedBank();
  assert.equal(request(bankApi, state, '/auth/me').data.email, 'customer@example.test');
  assert.equal(request(bankApi, state, '/accounts').data.length, 1);
  assert.equal(request(bankApi, state, '/accounts', undefined, 'admin').data.length, 2);
  const manifest = JSON.parse(fs.readFileSync('original-demos/source-manifest.json'));
  assert(Object.keys(manifest.files).length > 25);
  for (const [name, hash] of Object.entries(manifest.files)) assert.equal(createHash('sha256').update(fs.readFileSync('original-demos/' + name)).digest('hex'), hash, name);
});
test('bank preserves cents and replaying a transfer does not debit it twice', () => {
  const state = seedBank();
  const path = `/accounts/${accountRef}/transfers`;
  const body = { amount: '0.29', destination_account: recipientRef };
  const receipt = request(bankApi, state, path, body).data;
  assert.equal(state.accounts[0].balance, '124999.71');
  assert.equal(state.accounts[1].balance, '18500.29');
  assert.equal(request(bankApi, state, path, body).data.reference, receipt.reference);
  assert.equal(state.accounts[0].balance, '124999.71');
  assert.throws(() => request(bankApi, state, path, { ...body, amount: '0.30' }), /different operation/);
  assert.throws(() => request(bankApi, state, path, { ...body, amount: '200000' }, 'customer', 'overdraft'), /Insufficient/);
  assert.throws(() => request(bankApi, state, path, { ...body, amount: '1.001' }, 'customer', 'precision'), /decimal/);
});
test('bank role checks and freezing apply to the fictional data', () => {
  const state = seedBank();
  assert.throws(() => request(bankApi, state, `/accounts/${recipientRef}/deposits`, { amount: '1' }), /not found/);
  assert.throws(() => request(bankApi, state, `/admin/accounts/${accountRef}/freeze`, { reason: 'Demo review' }), /Administrator/);
  request(bankApi, state, `/admin/accounts/${accountRef}/freeze`, { reason: 'Demo review' }, 'admin');
  assert.equal(state.history[0].reason, 'Demo review');
  assert.throws(() => request(bankApi, state, `/accounts/${accountRef}/withdrawals`, { amount: '1' }), /frozen/);
});
const orderBundle = await build({ entryPoints: ['original-demos/order-app/demo.js'], bundle: true, write: false, format: 'esm', platform: 'node', define: { 'import.meta.env.VITE_API_URL': '"/api/v1"' } });
const { orderApi, seedOrder } = await import('data:text/javascript;base64,' + Buffer.from(orderBundle.outputFiles[0].text).toString('base64'));
test('Order App has original restaurant data, meals, seeded orders and three personas', () => {
  const state = seedOrder();
  assert.equal(request(orderApi, state, '/me').data.role, 'customer');
  assert.equal(request(orderApi, state, '/restaurants').data.length, 6);
  assert.equal(request(orderApi, state, '/restaurants/1/meals').data.length, 3);
  assert.equal(request(orderApi, state, '/orders').data.length, 4);
  assert.equal(request(orderApi, state, '/me', undefined, 'owner').data.role, 'restaurant_owner');
  assert.equal(request(orderApi, state, '/admin/overview', undefined, 'admin').data.stats.restaurants, 6);
});
test('ordering validates restaurant membership and calculates totals from sample prices', () => {
  const state = seedOrder();
  const body = { restaurant_id: 1, address_id: 1, items: [{ meal_id: 1, quantity: 2 }] };
  const order = request(orderApi, state, '/orders', body).data;
  assert.equal(order.total_price, 292.5);
  assert.equal(order.status, 'pending');
  assert.throws(() => request(orderApi, state, '/orders', { ...body, items: [{ meal_id: 4, quantity: 1 }] }), /Review/);
  assert.throws(() => request(orderApi, state, '/orders', { ...body, address_id: 100 }), /address/);
  assert.throws(() => request(orderApi, state, '/admin/overview'), /administrator/);
  assert.throws(() => request(orderApi, state, `/orders/${order.id}`, { status: 'delivered' }, 'customer', 'test', 'PUT'), /transition/);
  request(orderApi, state, `/orders/${order.id}`, { status: 'preparing' }, 'owner', 'test', 'PUT');
  assert.equal(order.status, 'preparing');
});
test('portfolio links resolve to the original storefront or original standalone interfaces', () => {
  for (const project of Object.values(config.projects)) {
    assert.match(project.live, /^\/My-Portfolio\/demos\/[^/]+\/$/);
    const html = fs.readFileSync('public/' + project.live.replace('/My-Portfolio/', '') + 'index.html', 'utf8');
    assert.match(html, /[Nn]o account required/);
    assert(!html.includes('../shared/app.js'));
    assert(!/src="http:\/\/localhost/.test(html));
  }
  assert.match(fs.readFileSync('public/demos/masr-security/index.html', 'utf8'), /url=https:\/\/masr-security.vercel.app\//);
  const ideas = fs.readFileSync('public/demos/batman-cave-ideas/index.html', 'utf8');
  assert(ideas.includes('Built in the Batcave with Laravel'));
  assert(ideas.includes('max-w-5xl px-8 py-12'));
});
