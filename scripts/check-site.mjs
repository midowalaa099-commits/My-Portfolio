import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getProjects } from '../src/project-data.js';
import { config } from '../src/config.js';
const en = JSON.parse(fs.readFileSync('src/en.json', 'utf8'));
const esc = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
for (const lang of ['en', 'ar']) {
  const html = fs.readFileSync(`dist/${lang}/index.html`, 'utf8');
  assert(html.includes(`lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"`));
  assert(html.includes('id="hero-title"'), 'Essential content must exist before JavaScript');
  for (const tag of ['canonical', 'hreflang="en"', 'hreflang="ar"', 'twitter:card', 'og:url', 'og:locale']) assert(html.includes(tag), `Missing ${tag}`);
  assert(!html.includes('github.com/midowalaa099-commits/mvp-bank'), 'Unverified bank source must stay hidden');
}
for (const p of getProjects(en)) {
  const html = fs.readFileSync(`dist/work/${p.slug}/index.html`, 'utf8');
  assert(html.includes(esc(p.description)), 'Card description and case study must agree');
  assert(html.includes('noindex, follow'), 'Retain case-study noindex');
  for (const key of ['live', 'source']) if (p[key]) assert(html.includes(`href="${esc(p[key])}"`), `${p.id} ${key} missing`);
  assert(!/withheld|No public source|No public interactive demo/.test(html), 'Stale availability copy');
}
const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
assert(sitemap.startsWith('<?xml'));
assert(sitemap.includes(`${config.siteUrl}/ar/`));
assert(!sitemap.includes('/work/'), 'Noindex pages must not be advertised for indexing');
console.log('Prerendered bilingual content, shared links/copy, noindex, and sitemap checks passed.');
