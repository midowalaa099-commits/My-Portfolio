import fs from 'node:fs/promises';
import path from 'node:path';
import { render } from '../.prerender-build/entry-server.js';
import { config } from '../src/config.js';
import { getProjects } from '../src/project-data.js';
const en = JSON.parse(await fs.readFile('src/en.json', 'utf8'));
const ar = JSON.parse(await fs.readFile('src/ar.json', 'utf8'));
const template = await fs.readFile('dist/index.html', 'utf8');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const origin = config.siteUrl;
const languageLinks = `<link rel="alternate" hreflang="en" href="${origin}/en/"/><link rel="alternate" hreflang="ar" href="${origin}/ar/"/><link rel="alternate" hreflang="x-default" href="${origin}/en/"/>`;
async function writePage(file, lang, page = 'home', noindex = false) {
  const t = lang === 'ar' ? ar : en;
  const project = getProjects(en).find(p => p.id === page);
  const title = project ? `${project.name} — ${t.contact.name}` : page === '404' ? t.caseStudy.notFound : t.meta.title;
  const description = project ? project.description : t.meta.description;
  const canonical = project ? new URL(project.caseHref, origin).href : page === '404' ? origin + '/404.html' : origin + `/${lang}/`;
  const markup = render(lang, page);
  const newTags = `<link rel="canonical" href="${canonical}"/>${page === 'home' ? languageLinks : ''}<meta property="og:url" content="${canonical}"/><meta property="og:locale" content="${lang === 'ar' ? 'ar_EG' : 'en_US'}"/><meta property="og:locale:alternate" content="${lang === 'ar' ? 'en_US' : 'ar_EG'}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${esc(title)}"/><meta name="twitter:description" content="${esc(description)}"/><meta name="twitter:image" content="${origin + config.ogImage}"/>${noindex ? '<meta name="robots" content="noindex, follow"/>' : ''}`;
  let html = template.replace('<html lang="en" dir="ltr">', `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">`)
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, '$1' + esc(description))
    .replace(/(<meta property="og:title" content=")[^"]*/, '$1' + esc(title))
    .replace(/(<meta property="og:description" content=")[^"]*/, '$1' + esc(description))
    .replace(/(<meta property="og:image" content=")[^"]*/, '$1' + origin + config.ogImage)
    .replace('<div id="root"></div>', `<div id="root" data-lang="${lang}" data-page="${page}">${markup}</div>`)
    .replace('</head>', newTags + '</head>');
  const target = path.join('dist', file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, html);
}
await writePage('index.html', 'en');
await writePage('en/index.html', 'en');
await writePage('ar/index.html', 'ar');
for (const p of getProjects(en)) await writePage(`work/${p.slug}/index.html`, 'en', p.id, true);
await writePage('learning/index.html', 'en', 'batman', true);
await writePage('legacy/index.html', 'en', 'home', true);
await writePage('404.html', 'en', '404', true);
await fs.writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${['en','ar'].map(lang => `<url><loc>${origin}/${lang}/</loc>${['en','ar'].map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${origin}/${l}/"/>`).join('')}</url>`).join('')}</urlset>`);
await fs.writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log('Prerendered English/Arabic homepages, shared case studies, legacy URLs, custom 404, and sitemap.');
