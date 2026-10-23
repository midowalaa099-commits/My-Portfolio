import test from 'node:test';
import assert from 'node:assert/strict';
import { initialLedger, debit } from './retry.js';
test('same request key twice debits the balance exactly once',()=>{const first=debit(initialLedger(),'request-001',10000); const retried=debit(first,'request-001',10000);assert.equal(first.balance,90000);assert.strictEqual(retried,first);assert.equal(Object.keys(retried.receipts).length,1)});
test('a different request key can debit independently',()=>{assert.equal(debit(debit(initialLedger(),'one',10000),'two',10000).balance,80000)});
test('a reused key cannot change the original amount',()=>{assert.throws(()=>debit(debit(initialLedger(),'one',10000),'one',20000),/different amount/)});
