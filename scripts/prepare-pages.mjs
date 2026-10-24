import fs from 'node:fs/promises';
await fs.rm('docs',{recursive:true,force:true});
await fs.cp('dist','docs',{recursive:true});
await fs.writeFile('docs/.nojekyll','');
console.log('Prepared local docs/ only. No commit, push, or deployment.');
