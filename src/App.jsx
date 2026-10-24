import brandSvg from './brand-svg.js';
import React, { useEffect, useState } from 'react';
import en from './en.json';
import ar from './ar.json';
import Projects from './Projects.jsx';
import Results from './Results.jsx';
import Skills from './Skills.jsx';
import Faq from './Faq.jsx';
import Contact from './Contact.jsx';
import { config } from './config.js';
import CaseStudy from './CaseStudy.jsx';
const anchors = ['projects', 'results', 'skills', 'faq', 'contact'];

export default function App({ initialLang = 'en', page = 'home' }) {
  const lang = initialLang;
  const [menu, setMenu] = useState(false);
  const t = lang === 'ar' ? ar : en;
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (page === 'home') {
      document.title = t.meta.title;
      document.querySelector('meta[name="description"]').content = t.meta.description;
      document.querySelector('meta[property="og:title"]').content = t.meta.title;
      document.querySelector('meta[property="og:description"]').content = t.meta.description;
      document.querySelector('meta[property="og:image"]').content = config.siteUrl + config.ogImage;
    }
    try { localStorage.setItem('mwz-language', lang); } catch { /* Storage may be unavailable. */ }
  }, [lang, t, page]);
  return <>
    <a className="skip" href="#main">{t.skip}</a>
    <header className="topbar" id="top" onKeyDown={event => { if (event.key === 'Escape') setMenu(false); }}>
      <div className="wrap nav">
        <a className="logo" href={page === 'home' ? '#top' : '/My-Portfolio/en/'} aria-label={'MWZ — ' + t.contact.name}>
          {config.logo ? <span className="inline-brand" aria-hidden="true" dangerouslySetInnerHTML={{__html:brandSvg}} /> : <>MWZ<span>.</span></>}
        </a>
        <nav aria-label={t.menu} id="mobile-menu" className={menu ? 'navigation open' : 'navigation'}>
          {anchors.map((id, index) => <a key={id} href={(page === 'home' ? '' : '/My-Portfolio/en/') + '#' + id} onClick={() => setMenu(false)}>{t.nav[index]}</a>)}
        </nav>
        <div className="nav-actions">
          <a className="language" href={lang === 'en' ? '/My-Portfolio/ar/' + (page === 'home' ? '' : '#projects') : '/My-Portfolio/en/'} aria-label={t.language + ' — ' + t.languageLabel} lang={lang === 'en' ? 'ar' : 'en'}>{t.language}</a>
          <a className="button compact" href={'mailto:' + config.email}>{t.email}</a>
          <button className="menu-button" aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu ? t.close : t.menu} onClick={() => setMenu(!menu)}>{menu ? t.close : t.menu}</button>
        </div>
      </div>
    </header>
    <main id="main">
      {page === 'home' ? <><section className="hero identity-hero wrap" aria-labelledby="hero-title">
        <div className="hero-content">
          <h1 id="hero-title">{t.hero.nameLines.map(line => <span key={line}>{line}</span>)}</h1>
          <p className="identity-role">{t.footer}</p>
          <p className="identity-intro">{t.hero.title}</p>
          <div className="actions">
            <a className="button" href="#projects">{t.hero.projects}</a>
            {config.cvFile && <a className="button secondary" href={config.cvFile} download>{t.cv}</a>}
          </div>
          <p className="identity-stack"><bdi>{t.hero.stack}</bdi></p>
          <p className="availability"><span aria-hidden="true" />{t.hero.availability}</p>
        </div>
        {config.portrait && <figure className="portrait identity-portrait">
          <img src={config.portrait} srcSet={config.portraitSet || undefined} sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 1000px) 42vw, 440px" width="700" height="875" alt={t.hero.photo} fetchPriority="high" />
          <figcaption>{t.hero.photoCaption}</figcaption>
        </figure>}
        <div className="proof">{t.hero.proof.map(proof => <div className="proof-item" key={proof.value}>
          <strong dir="ltr">{proof.value}</strong><div><p>{proof.text}</p><small>{proof.note}</small></div>
        </div>)}</div>
      </section>
      <Projects t={t} /><Results t={t} /><Skills t={t} /><Faq t={t} /></> : page === '404' ? <section className="case-study wrap"><h1>{t.caseStudy.notFound}</h1><a className="text-link" href="/My-Portfolio/en/">{t.caseStudy.returnHome}</a></section> : <CaseStudy id={page} t={t} />}
      <Contact t={t} />
    </main>
  </>;
}
