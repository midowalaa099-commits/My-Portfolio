import React, { useState } from 'react';
import { debit, initialLedger } from './retry.js';
const key='mwz-demo-001';
export default function Demo({t}){const [ledger,setLedger]=useState(initialLedger);const [step,setStep]=useState(0); const d=t.demo;
 function send(){if(step!==0)return;setLedger(current=>debit(current,key,10000));setStep(1)}
 function retry(){if(step!==1)return;setLedger(current=>debit(current,key,10000));setStep(2)}
 return <section className="demo" id="demo" aria-labelledby="demo-title"><div><p className="eyebrow">{d.eyebrow}</p><h3 id="demo-title">{d.title}</h3><p>{d.intro}</p><span className="demo-badge">{d.badge}</span><p>{d.explanation}</p></div><div className="demo-console"><span className="balance-label">{d.balance}</span><strong className="balance-number"><bdi>{(ledger.balance/100).toLocaleString('en-EG',{minimumFractionDigits:2,maximumFractionDigits:2})}</bdi> <small>{d.amount}</small></strong><div className="storage"><span>{d.stored}</span><code data-testid="stored-balance">{ledger.balance}</code></div><div className="storage"><span>{d.key}</span><code>{key}</code></div><div className="demo-controls"><button className="button" disabled={step!==0} onClick={send}>{d.send}</button><button className="button secondary" disabled={step!==1} onClick={retry}>{d.retry}</button></div><p className="status" role="status" aria-live="polite">{step===0?d.ready:step===1?d.sent:d.replayed}</p><button className="reset" onClick={()=>{setLedger(initialLedger());setStep(0)}}>{d.reset} </button></div></section>
}
