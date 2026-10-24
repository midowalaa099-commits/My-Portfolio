import React from 'react';
export default function ProjectLinks({ project: p, t }) {
  if (!p.live && !p.source) return null;
  return <div className="project-links">
    {p.live && <div><a className="text-link" href={p.live} target="_blank" rel="noreferrer">{p.id === 'masr' ? t.projects.live : t.projects.demo}</a>{p.id === 'bank' && <small className="protected">{t.projects.protected}</small>}</div>}
    {p.source && <a className="text-link" href={p.source} target="_blank" rel="noreferrer">{t.projects.source}</a>}
  </div>;
}
