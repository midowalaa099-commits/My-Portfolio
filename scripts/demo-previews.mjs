import fs from 'node:fs/promises';
import { build } from 'esbuild';

// Produce single-file HTML copies for local review or static hosting.
const bundled = await build({ entryPoints:['public/demos/shared/app.js'], bundle:true, write:false, format:'esm', minify:true, target:'es2022' });
let css=await fs.readFile('public/demos/shared/demo.css','utf8');
for(const font of ['dm-sans-content','noto-sans-arabic']) {
  const data=(await fs.readFile(`public/fonts/${font}.woff2`)).toString('base64');
  css=css.replace(`../../fonts/${font}.woff2`,`data:font/woff2;base64,${data}`);
}
await fs.mkdir('demo-previews',{recursive:true});
for(const slug of ['masr-security','mvp-bank','order-app','batman-cave-ideas']) {
  let html=await fs.readFile(`public/demos/${slug}/index.html`,'utf8');
  html=html.replace('<link rel="stylesheet" href="../shared/demo.css">',`<style>${css}</style>`)
    .replace('<script type="module" src="../shared/app.js"></script>',()=>`<script type="module">${bundled.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`)
    .replace('<link rel="icon" href="../../favicon.svg" type="image/svg+xml">','');
  // Standalone files have no shared directory layout, so portfolio links are absolute.
  html=html.replaceAll('href="../../en/#projects"','href="https://midowalaa099-commits.github.io/My-Portfolio/en/#projects"')
    .replaceAll('href="../../${','href="https://midowalaa099-commits.github.io/My-Portfolio/${');
  await fs.writeFile(`demo-previews/${slug}.html`,html);
}
console.log('Created four standalone HTML demos in demo-previews/.');
