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
import PortraitPhoto from './PortraitPhoto.jsx';
const anchors = ['projects', 'results', 'skills', 'faq', 'contact'];

export default function App({ initialLang = 'en', page = 'home' }) {
  useEffect(() => {
    let cleanup;
    let cancelled = false;
    import('./motion.js').then(({ installMotion }) => { if (!cancelled) cleanup = installMotion(); });
    return () => { cancelled = true; cleanup?.(); };
  }, []);
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
    <span id="top" className="top-origin" aria-hidden="true" />
    <header className="topbar" onKeyDown={event => { if (event.key === 'Escape') setMenu(false); }}>
      <div className="wrap nav">
        <a className="logo" href={page === 'home' ? '#top' : '/en/'} aria-label={'MWZ — ' + t.contact.name}>
          {config.logo ? <img src={config.logo} width="60" height="48" alt="MWZ" /> : <>MWZ<span>.</span></>}
        </a>
        <nav aria-label={t.menu} id="mobile-menu" className={menu ? 'navigation open' : 'navigation'}>
          <span className="nav-indicator" aria-hidden="true" />
          {anchors.map((id, index) => <a key={id} href={(page === 'home' ? '' : '/en/') + '#' + id} onClick={() => setMenu(false)}>{t.nav[index]}</a>)}
        </nav>
        <div className="nav-actions">
          <a className="language" href={lang === 'en' ? '/ar/' + (page === 'home' ? '' : '#projects') : '/en/'} aria-label={t.language + ' — ' + t.languageLabel} lang={lang === 'en' ? 'ar' : 'en'}>{t.language}</a>
          <a className="button compact" href={'mailto:' + config.email}>{t.email}<span aria-hidden="true">↗</span></a>
          <button className="menu-button" aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu ? t.close : t.menu} onClick={() => setMenu(!menu)}>{menu ? '×' : '☰'}</button>
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
            <a className="button" href="#projects">{t.hero.projects}<span aria-hidden="true">↗</span></a>
            {config.cvFile && <a className="button secondary" href={config.cvFile} download={config.cvDownloadName}>{t.cv}<span aria-hidden="true">↓</span></a>}
          </div>
          <p className="identity-stack"><bdi>{t.hero.stack}</bdi></p>
          <p className="availability"><span aria-hidden="true" />{t.hero.availability}</p>
        </div>
        {config.portrait && <figure className="portrait identity-portrait">
          <PortraitPhoto label={t.portraitInteraction} src={config.portrait} srcSet={config.portraitSet || undefined} sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 1000px) 42vw, 440px" width="700" height="875" alt={t.hero.photo} fetchPriority="high" />
          <figcaption>{t.hero.photoCaption}</figcaption>
        </figure>}
        <div className="proof">{t.hero.proof.map(proof => <div className="proof-item" key={proof.value}>
          <strong dir="ltr"><span className="sr-only">{proof.value}</span><span aria-hidden="true" data-proof-count={parseInt(proof.value, 10)} data-proof-suffix={proof.value.includes('%') ? '%' : ''}>{proof.value}</span></strong><div><p>{proof.text}</p><small>{proof.note}</small></div>
        </div>)}</div>
      </section>
      <Projects t={t} /><Results t={t} /><Skills t={t} /><Faq t={t} /></> : page === '404' ? <section className="case-study wrap"><h1>{t.caseStudy.notFound}</h1><a className="text-link" href="/en/">{t.caseStudy.returnHome}</a></section> : <CaseStudy id={page} t={t} />}
      <Contact t={t} />
    </main>
  </>;
}
