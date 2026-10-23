import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './src/config.js';
import en from './src/en.json' with { type: 'json' };
const escape = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export default defineConfig({ appType: 'mpa', plugins: [{
  name: 'static-not-found',
  configurePreviewServer(server) {
    return () => server.middlewares.use((req, res, next) => {
      const root = path.resolve('dist');
      let target;
      try { target = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); } catch { target = ''; }
      if (target.startsWith(root + path.sep) && fs.existsSync(target) || target === root) return next();
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(path.join(root, '404.html')));
    });
  }
}, { name: 'portfolio-metadata', transformIndexHtml(html) {
  return html.replace(/<title>.*?<\/title>/, `<title>${escape(en.meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, '$1' + escape(en.meta.description))
    .replace(/(<meta property="og:title" content=")[^"]*/, '$1' + escape(en.meta.title))
    .replace(/(<meta property="og:description" content=")[^"]*/, '$1' + escape(en.meta.description))
    .replace(/(<meta property="og:image" content=")[^"]*/, '$1' + escape(config.siteUrl + config.ogImage));
} }] });
