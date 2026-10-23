import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const baseline = JSON.parse(fs.readFileSync('scripts/preservation-baseline.json','utf8'));
for (const entry of baseline) {
 const file=path.join('dist',entry.deployedPath);
 if(!fs.existsSync(file)||hash(file)!==entry.sha256) throw new Error('Original file changed or missing: '+entry.originalPath);
}
const pages=['work/masr-security/index.html','work/mvp-bank/index.html','work/order-app/index.html','work/batman-cave-ideas/index.html','learning/index.html','404.html','legacy/index.html'];
for(const page of pages){const html=fs.readFileSync(path.join('dist',page),'utf8');if(!html.includes('<h1'))throw new Error('Missing preserved page content: '+page);}
for(const [key,href] of [['cvFile','/downloads/cv.pdf'],['portfolioFile','/downloads/portfolio.pdf']]) {
 const {config}=await import('../src/config.js'); if(config[key]!==href)throw new Error(key+' points to the wrong file');
}
console.log(`Preserved ${baseline.length} original public files byte for byte, plus all 7 legacy HTML pages. Both PDF paths are configured.`);
