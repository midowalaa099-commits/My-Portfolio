import React from 'react';
export default function ProjectLinks({ project: p, t }) {
  if (!p.live && !p.source) return null;
  return <div className="project-links">
    {p.live && <div><a className="text-link" href={p.live} target="_blank" rel="noreferrer">{t.projects.demo}</a><small className="protected">{t.projects.publicDemo}</small></div>}
    {p.source && <a className="text-link" href={p.source} target="_blank" rel="noreferrer">{t.projects.source}</a>}
  </div>;
}
