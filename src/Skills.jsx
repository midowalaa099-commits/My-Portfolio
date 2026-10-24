import React from 'react';
import { config } from './config.js';
export default function Skills({ t }) {
  const skills = t.skills;
  return <section className="section wrap" id="skills" aria-labelledby="skills-title">
    <span id="about" className="anchor-alias" aria-hidden="true" />
    <div className="profile-intro">
      {config.aboutPortrait && <figure><img src={config.aboutPortrait} srcSet={config.aboutPortraitSet} sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 1336px) 39vw, 490px" width="700" height="875" loading="lazy" alt={skills.aboutAlt} /></figure>}
      <div><p className="eyebrow">{skills.eyebrow}</p><h2 id="skills-title">{skills.title}</h2><p>{skills.bio}</p><p>{skills.opportunities}</p><p className="profile-location">{skills.location}</p></div>
    </div>
    <div className="working-method"><h3>{skills.howTitle}</h3><div>{skills.how.map((step, index) => <article key={step.title}><span aria-hidden="true">0{index + 1}</span><h4>{step.title}</h4><p>{step.text}</p></article>)}</div></div>
    <h3 className="capabilities-title">{skills.capabilities}</h3>
    <div className="skill-grid">{skills.groups.map((group, index) => <div className="skill" key={group.title}><span aria-hidden="true">0{index + 1}</span><h4>{group.title}</h4><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div>
    <div className="education"><div><h3>{skills.education}</h3><p>{skills.degree}<br />{skills.university}</p></div><div><h3>{skills.study}</h3>{config.learningSource && <p className="courses"><a href={config.learningSource} target="_blank" rel="noreferrer"><bdi>{skills.learningSource}</bdi></a></p>}</div></div>
  </section>;
}
