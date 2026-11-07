import fs from 'node:fs/promises';

// Each demo already contains its original UI bundle and styles.
await fs.mkdir('demo-previews', { recursive: true });
for (const slug of ['masr-security', 'mvp-bank', 'order-app', 'batman-cave-ideas']) {
  await fs.copyFile(`public/demos/${slug}/index.html`, `demo-previews/${slug}.html`);
}
console.log('Copied the four original project interfaces into demo-previews/.');
