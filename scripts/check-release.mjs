import fs from 'node:fs';
import assert from 'node:assert/strict';
import {config} from '../src/config.js';
const origin='https://midowalaa099-commits.github.io/My-Portfolio';
assert.equal(config.siteUrl,origin);
const expectedAlternates={en:origin+'/en/',ar:origin+'/ar/','x-default':origin+'/en/'};
for(const lang of ['en','ar']){
 const html=fs.readFileSync(`dist/${lang}/index.html`,'utf8');
 assert(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html));
 const canonical=[...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];assert.equal(canonical.length,1);assert.equal(canonical[0][1],origin+'/'+lang+'/');
 assert(html.includes(`<meta property="og:url" content="${origin}/${lang}/"`));
 for(const [l,url] of Object.entries(expectedAlternates))assert(html.includes(`hreflang="${l}" href="${url}"`));
 for(const tag of ['og:image','twitter:image'])assert(html.includes(`${tag}" content="${origin}/images/og-placeholder.png"`));
 assert(html.includes('og:image:width" content="1200"'));assert(html.includes('og:image:height" content="630"'));
 for(const m of html.matchAll(/(?:href|src|srcset)="(\/(?!\/)[^"]*)"/g))assert(m[1].startsWith('/My-Portfolio/'),'Escaped repository base: '+m[1]);
}
for(const file of ['index.html','legacy/index.html','learning/index.html','404.html',...['masr-security','mvp-bank','order-app','batman-cave-ideas'].map(x=>'work/'+x+'/index.html')]){
 const html=fs.readFileSync('dist/'+file,'utf8');assert.equal(html.includes('noindex, follow'),file!=='index.html');
}
const png=fs.readFileSync('public/images/og-placeholder.png');assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
const robots=fs.readFileSync('dist/robots.txt','utf8');assert(robots.includes('Sitemap: '+origin+'/sitemap.xml'));
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');for(const [l,url] of Object.entries(expectedAlternates))assert.equal([...sitemap.matchAll(new RegExp(`hreflang="${l}" href="${url}"`,'g'))].length,2);
assert(!sitemap.includes('/work/'));assert(!sitemap.includes('chatgpt.site'));
console.log('PASS: public metadata, 1200x630 share image, repository base, canonical/hreflang/x-default/OG/robots/sitemap; legacy noindex preserved.');

const root=fs.readFileSync('dist/index.html','utf8');
assert(root.includes('http-equiv="refresh" content="0;url=/My-Portfolio/en/"'));
assert(root.includes('location.replace("/My-Portfolio/en/"+location.search+location.hash)'));
assert(!root.includes('const q=new URLSearchParams'));
console.log('PASS: root redirects to /My-Portfolio/en/ with HTML and JS fallback.');
