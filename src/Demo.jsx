import React, { useEffect, useState } from 'react';
import { debit, initialLedger } from './retry.js';
import { useCount } from './useCount.js';
const key = 'mwz-demo-001';
const money = value => (value / 100).toLocaleString('en-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export default function Demo({ t }) {
  const [ledger, setLedger] = useState(initialLedger);
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  useEffect(() => {
    if (!sending) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => setSending(false);
    const visibility = () => { if (document.hidden) finish(); };
    const timer = setTimeout(finish, 1000);
    reduce.addEventListener('change', finish);
    document.addEventListener('visibilitychange', visibility);
    return () => { clearTimeout(timer); reduce.removeEventListener('change', finish); document.removeEventListener('visibilitychange', visibility); };
  }, [sending]);
  const d = t.demo;
  const display = useCount(ledger.balance, 100000, 420, 480);
  function send() { if (step !== 0) return; setLedger(current => debit(current, key, 10000)); setStep(1); setSending(!matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden); }
  function retry() { if (step !== 1 || sending) return; setLedger(current => debit(current, key, 10000)); setStep(2); }
  return <section className="demo" id="demo" aria-labelledby="demo-title">
    <div className="demo-explanation"><p className="eyebrow">{d.eyebrow}</p><h3 id="demo-title">{d.title}</h3><p>{d.intro}</p><span className="demo-badge">{d.badge}</span><p>{d.explanation}</p>
      <div className="request-visual" data-step={step} aria-hidden="true">
        <div className="request-endpoints"><span><i>◷</i>{d.client}</span><span><i>▤</i>{d.server}</span></div>
        <div className="request-rail"><span className="request-token" key={step}><span>↗</span><bdi>{key}</bdi></span></div>
        <div className={'receipt' + (step ? ' issued' : '')} key={'receipt-' + step}><span className="receipt-icon">{step === 2 ? '↺' : step === 1 ? '✓' : '—'}</span><div><strong>{step === 2 ? d.sameReceipt : step === 1 ? d.receipt : d.awaiting}</strong><p>{step ? d.receiptAmount : d.noRequest}</p></div></div>
      </div>
    </div>
    <div className="demo-console" data-step={step}>
      <span className="balance-label">{d.balance}</span>
      <strong className="balance-number"><span className="sr-only">{d.balance}: {money(ledger.balance)} {d.amount}</span><bdi aria-hidden="true">{money(display)}</bdi> <small aria-hidden="true">{d.amount}</small></strong>
      <div className="storage"><span>{d.stored}</span><code><span aria-hidden="true">{display}</span><span className="sr-only" data-testid="stored-balance">{ledger.balance}</span></code></div>
      <div className="storage"><span>{d.key}</span><code>{key}</code></div>
      <noscript><p>{d.withoutJs}</p></noscript><div className="demo-controls"><button className="button" aria-disabled={step !== 0} onClick={send}>{d.send}</button><button className="button secondary" aria-disabled={step !== 1 || sending} onClick={retry}>{d.retry}</button></div>
      <p className="status" role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true">{step === 2 ? '↺ ' : step === 1 ? '✓ ' : ''}</span>{step === 0 ? d.ready : step === 1 ? (sending ? d.sending : d.sent) : d.replayed}</p>
      <button className="reset" onClick={() => { setLedger(initialLedger()); setStep(0); setSending(false); }}>{d.reset} <span aria-hidden="true">↺</span></button>
    </div>
  </section>;
}
