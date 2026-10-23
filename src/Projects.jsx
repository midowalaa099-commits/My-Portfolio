import React from 'react';
import Demo from './Demo.jsx';
import { getProjects } from './project-data.js';
import ProjectLinks from './ProjectLinks.jsx';

export default function Projects({ t }) {
  return <section className="section wrap" id="projects" aria-labelledby="projects-title">
    <span id="work" className="anchor-alias" aria-hidden="true" />
    <div className="section-heading"><div><p className="eyebrow">{t.projects.eyebrow}</p><h2 id="projects-title">{t.projects.title}</h2></div><p className="intro">{t.projects.intro}</p></div>
    <div className="project-grid">{getProjects(t).map(p => <article key={p.id} className={'project' + (p.id === 'batman' ? ' archive' : '')} aria-labelledby={p.id + '-title'}>
      {p.image && <figure className="browser"><div className="browser-top" aria-hidden="true"><i /><i /><i /><span>{p.name}</span></div><img src={p.image} srcSet={p.srcSet} sizes={p.sizes} width={p.width} height={p.height} loading="lazy" alt={p.alt} /><figcaption>{p.imageLabel}</figcaption></figure>}
      <div className="project-content"><p className="project-kind">{p.kind}</p><h3 id={p.id + '-title'}>{p.name}</h3><p className="project-description">{p.description}</p>
        {p.id === 'order' && <div className="order-flow"><ol>{t.projects.flow.map(state => <li key={state}><span className="step-dot" aria-hidden="true" />{state}</li>)}</ol><p className="cancel-branch"><span aria-hidden="true">↳ </span>{t.projects.cancel}</p></div>}
        <div className="tags">{p.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
        <ProjectLinks project={p} t={t} />
        <details className="project-details" id={p.id + '-details'}><summary>{t.projects.details}<span className="sr-only"> — {p.name}</span></summary><div className="details-body"><p>{p.detail}</p><ul>{p.facts.map(f => <li key={f}>{f}</li>)}</ul><a className="text-link" href={p.caseHref} lang="en">{t.projects.fullCaseStudy}</a></div></details>
      </div>
    </article>)}</div><Demo t={t} />
  </section>;
}
