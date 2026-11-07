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
  assert.equal(request(bankApi, state, '/accounts').data.length, 2);
  assert.equal(request(bankApi, state, '/accounts', undefined, 'admin').data.length, 3);
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
  assert.equal(order.total_price, 290);
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
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { minorUnits, bankOperation, cartAdd, cartTotal, transitionOrder, createIdea } from '../public/demos/shared/model.js';
import { config } from '../src/config.js';

test('money parsing preserves exact piastres and rejects unsafe inputs', () => {
  assert.equal(minorUnits('0.29'), 29);
  assert.equal(minorUnits('125000.1'), 12500010);
  for (const value of ['-1', '0', '1.001', '1e6', 'NaN', '', '1000000.01']) assert.throws(() => minorUnits(value));
});
test('repeating a transfer returns its original receipt without a second debit', () => {
  const request = { kind:'transfer', amount:12345, recipient:'Nour Ahmed', key:'req-a' };
  const first = bankOperation({balance:100000,transactions:[]},request);
  const retry = bankOperation(first.state,request);
  assert.equal(retry.state.balance,87655);
  assert.equal(retry.state.transactions.length,1);
  assert.equal(retry.receipt,first.receipt);
  assert.equal(retry.replayed,true);
  assert.throws(() => bankOperation(first.state,{...request,amount:100}));
  assert.throws(() => bankOperation(first.state,{...request,recipient:'Omar Hassan'}));
});
test('bank rejects overdrafts, non-integers, and recipients outside the fictional list', () => {
  const state = {balance:10000,transactions:[]};
  assert.throws(() => bankOperation(state,{kind:'withdraw',amount:10001,key:'a'}));
  assert.throws(() => bankOperation(state,{kind:'deposit',amount:1.2,key:'a'}));
  assert.throws(() => bankOperation(state,{kind:'transfer',amount:100,key:'a',recipient:'Unknown'}));
  assert.deepEqual(state,{balance:10000,transactions:[]});
  const deposit=bankOperation(state,{kind:'deposit',amount:2000,key:'a'});
  const withdrawal=bankOperation(deposit.state,{kind:'withdraw',amount:1000,key:'b'});
  assert.equal(withdrawal.state.balance,11000);
});
test('basket totals remain exact and do not mix meals from different restaurants', () => {
  const meal = {id:'m1',name:'Sample meal',price:1999};
  const cart=cartAdd([],meal,2,'r1');
  const added=cartAdd(cart,meal,1,'r1');
  assert.equal(cartTotal(added),5997);
  assert.equal(cart[0].quantity,2);
  assert.throws(()=>cartAdd(added,{id:'m2',name:'Other',price:1000},1,'r2'));
  assert.throws(()=>cartAdd(added,meal,20,'r1'));
  assert.throws(()=>cartAdd([],meal,0,'r1'));
});
test('customer cancellation ends at pending; owner delivery steps cannot be skipped', () => {
  const pending={id:'o1',status:'Pending'};
  assert.equal(transitionOrder(pending,'Cancelled','customer').status,'Cancelled');
  assert.throws(()=>transitionOrder(pending,'Preparing','customer'));
  assert.throws(()=>transitionOrder(pending,'Delivered','owner'));
  const preparing=transitionOrder(pending,'Preparing','owner');
  assert.throws(()=>transitionOrder(preparing,'Cancelled','customer'));
  const travelling=transitionOrder(preparing,'On the way','admin');
  const delivered=transitionOrder(travelling,'Delivered','owner');
  assert.throws(()=>transitionOrder(delivered,'Preparing','owner'));
  assert.throws(()=>transitionOrder({status:'Cancelled'},'Pending','owner'));
});
test('idea updates retain one record and validate descriptions and statuses', () => {
  const initial=createIdea([],{id:'a',description:'Build a useful app',state:'New'});
  const edited=createIdea(initial,{id:'a',description:'Finish this useful app',state:'Done'});
  assert.equal(edited.length,1);
  assert.equal(edited[0].state,'Done');
  assert.equal(initial[0].description,'Build a useful app');
  assert.throws(()=>createIdea([],{id:'a',description:'  ',state:'New'}));
  assert.throws(()=>createIdea([],{id:'a',description:'A useful idea',state:'Published'}));
});
test('all four portfolio destinations are public local HTML pages with resolvable asset graphs', () => {
  for (const [id, project] of Object.entries(config.projects)) {
    assert.match(project.live,/^\/My-Portfolio\/demos\/[^/]+\/$/);
    const file=path.join('public',project.live.replace('/My-Portfolio/',''),'index.html');
    const html=fs.readFileSync(file,'utf8');
    assert(html.includes('No account required') || html.includes('no account required'));
    assert(!/<form[^>]+action="https?:/i.test(html));
    for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
      const target=path.resolve(path.dirname(file),match[1]);
      if(match[1].includes('#projects'))continue;
      assert(fs.existsSync(target),`${id}: missing ${match[1]}`);
    }
  }
  for (const file of fs.readdirSync('public/demos/shared').filter(x=>x.endsWith('.js'))) {
    const code=fs.readFileSync('public/demos/shared/'+file,'utf8');
    assert(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|https?:\/\//.test(code),`${file} must not contact real services`);
    for(const match of code.matchAll(/from ['"](.+?)['"]/g))assert(fs.existsSync(path.resolve('public/demos/shared',match[1])));
  }
});
