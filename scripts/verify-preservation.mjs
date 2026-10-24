import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const baseline = JSON.parse(fs.readFileSync('scripts/preservation-baseline.json','utf8'));
const approved=JSON.parse(fs.readFileSync('scripts/approved-asset-replacements.json','utf8'));
for(const file of Object.keys(approved)) if(!['downloads/cv.pdf','downloads/portfolio.pdf'].includes(file)) throw new Error('Unexpected asset replacement: '+file);
const exclusions = JSON.parse(fs.readFileSync('scripts/approved-asset-exclusions.json','utf8'));
for (const file of Object.keys(exclusions)) if(file !== 'assets/index-DRvv7YpJ.js') throw new Error('Unexpected asset exclusion: '+file);
for (const entry of baseline) {
 if(exclusions[entry.deployedPath]) {
  for(const root of ['public','dist','docs']) if(fs.existsSync(path.join(root,entry.deployedPath))) throw new Error('Excluded legacy asset remains: '+root+'/'+entry.deployedPath);
  continue;
 }
 const file=path.join('dist',entry.deployedPath);
 const replacement=approved[entry.deployedPath];
 if(replacement && replacement.originalV6Sha256!==entry.sha256) throw new Error('Replacement baseline mismatch: '+entry.originalPath);
 if(!fs.existsSync(file)||hash(file)!==(replacement?.sha256||entry.sha256)) throw new Error('Original file changed or missing: '+entry.originalPath);
}
const pages=['work/masr-security/index.html','work/mvp-bank/index.html','work/order-app/index.html','work/batman-cave-ideas/index.html','learning/index.html','404.html','legacy/index.html'];
for(const page of pages){const html=fs.readFileSync(path.join('dist',page),'utf8');if(!html.includes('<h1'))throw new Error('Missing preserved page content: '+page);}
for(const [key,href] of [['cvFile','/downloads/cv.pdf'],['portfolioFile','/downloads/portfolio.pdf']]) {
 const {config}=await import('../src/config.js'); if(config[key]!=='/My-Portfolio'+href)throw new Error(key+' points to the wrong file');
}
console.log(`Preserved ${baseline.length-Object.keys(approved).length-Object.keys(exclusions).length} original public files byte for byte; verified ${Object.keys(approved).length} explicitly approved PDF replacements, 1 explicitly approved legacy bundle exclusion, all 7 legacy HTML pages and PDF paths.`);
