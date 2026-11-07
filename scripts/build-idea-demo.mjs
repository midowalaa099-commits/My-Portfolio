import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
const original = path.join(process.env.ORIGINAL_APPS_ROOT || path.resolve('../../Herd'), 'BATMAN CAVE IDEAS/resources/views');
const destination = 'original-demos/batman-cave-ideas/views';
await fs.mkdir(destination, { recursive: true });
for (const folder of ['ideas', 'components']) await fs.cp(path.join(original, folder), path.join(destination, folder), { recursive: true });
const read = name => fs.readFile(path.join(destination, name + '.blade.php'), 'utf8');
function staticTemplate(value) {
  return value.replace(/<\/?x-layout>/g, '').replace(/@csrf/g, '')
    .replace(/@method\('([^']+)'\)/g, '<input type="hidden" name="_method" value="$1">')
    .replace(/<x-forms\.error name="description"\s*\/>/g, '<p data-error role="alert" class="text-red-500 mt-2"></p>')
    .replaceAll('{{ $idea->id }}', '%ID%').replaceAll('{{ $idea->state }}', '%STATE%').replaceAll('{{ $idea->description }}', '%DESCRIPTION%')
    .replaceAll("{{ old('description', $idea->description) }}", '%DESCRIPTION%').replaceAll("{{ old('description') }}", '')
    .replaceAll('href="/ideas', 'href="#/ideas').replaceAll('action="/ideas', 'action="#/ideas');
}
const index = await read('ideas/index');
const card = staticTemplate(index.match(/@foreach\([^\n]+\)([\s\S]*?)@endforeach/)[1]);
const empty = staticTemplate(index.match(/@if\(\$ideas->isEmpty\(\)\)([\s\S]*?)@endif/)[1]);
const templates = { card, empty, index: staticTemplate(index.replace(/@foreach[\s\S]*?@endforeach/, '%CARDS%').replace(/@if[\s\S]*?@endif/, '%EMPTY%')) };
for (const name of ['show', 'create', 'edit']) templates[name] = staticTemplate(await read('ideas/' + name));
await fs.writeFile('original-demos/batman-cave-ideas/templates.json', JSON.stringify(templates));
let nav = await read('components/nav');
nav = nav.replace(/@guest[\s\S]*?@endguest/g, '').replace(/@can\('admin'\)[\s\S]*?@endcan/g, '').replace(/@auth|@endauth/g, '').replaceAll('href="/ideas', 'href="#/ideas').replace('@csrf', '').replace("@method('DELETE')", '').replace('action="/logout"', 'data-demo-reset');
let html = (await read('components/layout')).replace("{{ $title ?? 'Ideas App' }}", 'Ideas App').replace('<x-nav></x-nav>', nav).replace('{{ $slot }}', '<div id="original-ideas-content"></div>');
const bundle = await build({ entryPoints: ['original-demos/batman-cave-ideas/demo.js'], bundle: true, write: false, format: 'esm', minify: true, target: 'es2022' });
html = html.replace('</body>', () => `<script type="module">${bundle.outputFiles[0].text.replaceAll('</script', '<\\/script')}</script></body>`);
await fs.writeFile('public/demos/batman-cave-ideas/index.html', html);
await fs.writeFile('demo-previews/batman-cave-ideas.html', html);
console.log('Idea Cave: original Blade layout, navigation and all four idea views preserved.');
