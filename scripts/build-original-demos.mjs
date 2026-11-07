import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const root = process.cwd();
const herd = process.env.ORIGINAL_APPS_ROOT || path.resolve(root, '../../Herd');
const manifest = { description: 'Original presentation files copied without UI edits; only the demo transport and build entry are added.', files: {} };
async function walk(dir) {
  return (await Promise.all((await fs.readdir(dir, { withFileTypes: true })).map(async item => {
    const name = path.join(dir, item.name);
    return item.isDirectory() ? walk(name) : [name];
  }))).flat();
}
for (const [slug, original, entry, css, mount] of [
  ['mvp-bank', 'MVP Bank', 'resources/js/app.tsx', 'resources/css/app.css', 'app'],
  ['order-app', 'Order App/frontend', 'src/main.tsx', null, 'root'],
]) {
  const project = path.join(root, 'original-demos', slug);
  let dependencies = path.join(herd, original, 'node_modules');
  if (slug === 'order-app') {
    try { await fs.access(dependencies); } catch { dependencies = process.env.ORDER_DEMO_NODE_MODULES || path.join(herd, 'Design Order App Frontend/node_modules'); }
  }
  const { build } = await import(pathToFileURL(path.join(dependencies, 'vite/dist/node/index.js')));
  const react = (await import(pathToFileURL(path.join(dependencies, '@vitejs/plugin-react/dist/index.js')))).default;
  const tailwind = (await import(pathToFileURL(path.join(dependencies, '@tailwindcss/vite/dist/index.mjs')))).default;
  const temp = path.join(root, 'work', 'original-demos', slug);
  await fs.mkdir(temp, { recursive: true });
  const bundleEntry = path.join(temp, 'entry.tsx');
  await fs.writeFile(bundleEntry, `import ${JSON.stringify(path.join(project, 'demo.js'))};\n${css ? `import ${JSON.stringify(path.join(project, css))};\n` : ''}import ${JSON.stringify(path.join(project, entry))};\n`);
  // Resolve dependencies from the installed original application; no dependency install or .env is needed.
  try { await fs.symlink(dependencies, path.join(project, 'node_modules'), 'dir'); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  await fs.writeFile(path.join(temp, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Original ${slug} interface with fictional demo data. No account required."><title>${slug === 'mvp-bank' ? 'MVP Bank · Your money, in your rhythm.' : 'Order App'}</title></head><body><div id="${mount}"></div><script type="module" src="./entry.tsx"></script></body></html>`);
  const scopedCss = { name: 'scope-original-css', enforce: 'pre', transform(code, id) {
    const stylesheet = path.join(project, css || 'src/index.css');
    if (id === stylesheet) return code.replace(/@import ['"]tailwindcss['"];/, `@import 'tailwindcss' source(none);\n@source ${JSON.stringify(path.join(project, slug === 'mvp-bank' ? 'resources/js' : 'src'))};`);
  } };
  await build({ configFile: false, root: temp, base: './', plugins: [scopedCss, react(), tailwind()], publicDir: false,
    define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/api/v1') },
    resolve: { alias: { react: path.join(dependencies, 'react'), 'react-dom': path.join(dependencies, 'react-dom'), ...(slug === 'order-app' ? { leaflet: path.join(dependencies, 'leaflet') } : {}) } },
    build: { outDir: path.join(temp, 'dist'), assetsInlineLimit: 1000000, cssCodeSplit: false, minify: true, rollupOptions: { output: { inlineDynamicImports: true } } },
  });
  const dist = path.join(temp, 'dist');
  let html = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
  html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/, '<!--DEMO_SCRIPT-->');
  const assets = await fs.readdir(path.join(dist, 'assets'));
  const js = await fs.readFile(path.join(dist, 'assets', assets.find(name => name.endsWith('.js'))), 'utf8');
  let styles = await fs.readFile(path.join(dist, 'assets', assets.find(name => name.endsWith('.css'))), 'utf8');
  if (slug === 'mvp-bank') {
    let fonts = await fs.readFile(path.join(project, 'fonts.css'), 'utf8');
    fonts = fonts.replace(/@font-face\s*\{[^}]*\.woff"[^}]*\}/g, '');
    for (const [name, data] of Object.entries(JSON.parse(await fs.readFile(path.join(project, 'font-data.json'), 'utf8')))) fonts = fonts.replaceAll(`/build/assets/${name}`, `data:font/woff2;base64,${data}`);
    styles = fonts + styles;
  }
  html = html.replace(/<link rel="stylesheet"[^>]*>/g, () => `<style>${styles.replaceAll('</style', '<\\/style')}</style>`)
    .replace('<!--DEMO_SCRIPT-->', () => `<script type="module">${js.replaceAll('</script', '<\\/script')}</script>`);
  await fs.mkdir(path.join(root, 'public/demos', slug), { recursive: true });
  await fs.writeFile(path.join(root, 'public/demos', slug, 'index.html'), html);
  await fs.mkdir(path.join(root, 'demo-previews'), { recursive: true });
  await fs.writeFile(path.join(root, 'demo-previews', `${slug}.html`), html);
  for (const folder of slug === 'mvp-bank' ? ['resources'] : ['src']) for (const name of await walk(path.join(project, folder))) {
    const relative = path.relative(project, name);
    const originalBytes = await fs.readFile(path.join(herd, original, relative));
    const copiedBytes = await fs.readFile(name);
    if (!originalBytes.equals(copiedBytes)) throw new Error(`Original UI changed: ${slug}/${relative}`);
    manifest.files[`${slug}/${relative}`] = createHash('sha256').update(copiedBytes).digest('hex');
  }
  console.log(`${slug}: original UI preserved, ${Buffer.byteLength(html)} byte standalone demo`);
}
await fs.writeFile('original-demos/source-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
