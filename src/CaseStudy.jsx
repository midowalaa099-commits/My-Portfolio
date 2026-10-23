import React from 'react';
import { getProjects } from './project-data.js';
import ProjectLinks from './ProjectLinks.jsx';
import Demo from './Demo.jsx';
export default function CaseStudy({ id, t }) {
  const p = getProjects(t).find(project => project.id === id);
  const c = p.caseStudy;
  return <article className="case-study wrap" aria-labelledby="case-title">
    <a className="text-link" href="/My-Portfolio/en/#projects">← {t.caseStudy.back}</a>
    <header><p className="eyebrow">{p.kind}</p><h1 id="case-title">{p.name}</h1><p className="case-lead">{p.description}</p><p>{p.detail}</p><ProjectLinks project={p} t={t} /></header>
    {p.image && <figure className="browser"><img src={p.image} srcSet={p.srcSet} sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 1000px) calc(100vw - 96px), 1000px" width={p.width} height={p.height} alt={p.alt} /><figcaption>{p.imageLabel}</figcaption></figure>}
    <ul>{p.facts.map(fact => <li key={fact}>{fact}</li>)}</ul>
    <section><h2>{t.caseStudy.role}</h2><p>{c.role}</p><div className="tags">{p.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div></section>
    <section><h2>{t.caseStudy.changes}</h2><ul>{c.changes.map(text => <li key={text}>{text}</li>)}</ul></section>
    {p.id === 'bank' && <Demo t={t} />}
    {c.permissions?.length > 0 && <section><h2>{t.caseStudy.permissions}</h2><dl>{c.permissions.map(([role, action]) => <div key={role}><dt>{role}</dt><dd>{action}</dd></div>)}</dl></section>}
    <section><h2>{t.caseStudy.results}</h2><ul>{c.results.map(text => <li key={text}>{text}</li>)}</ul></section>
    {c.evidence?.length > 0 && <section><h2>{t.caseStudy.evidence}</h2>{c.evidence.map(m => <div key={m.id} className="case-evidence"><h3>{m.label}</h3><p>{m.value} · {m.context}</p><p>{m.detail}</p><p>{m.method}</p><p>{m.limits}</p></div>)}</section>}
    {c.decisions.length > 0 && <section><h2>{t.caseStudy.decisions}</h2>{c.decisions.map(d => <div key={d.title}><h3>{d.title}</h3><p>{d.choice}</p><p>{d.tradeoff}</p></div>)}</section>}
    {c.diagram && <figure className="browser"><img src={c.diagram.image} width="1200" height="750" loading="lazy" alt={c.diagram.imageAlt} /><figcaption>{c.diagram.imageCaption}</figcaption></figure>}
    <section><h2>{t.caseStudy.limits}</h2>{c.limitations.map(text => <p key={text}>{text}</p>)}</section>
  </article>;
}
