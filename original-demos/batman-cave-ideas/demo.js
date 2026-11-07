import templates from './templates.json';
const key = 'original-idea-cave-v1';
const seed = () => [
  { id: 1, state: 'pending', description: 'Build an order tracking dashboard for local restaurants.' },
  { id: 2, state: 'pending', description: 'Create a portfolio where visitors can try every project without registering.' },
  { id: 3, state: 'pending', description: 'Help small shops keep track of products and low stock.' },
];
let ideas;
try { ideas = JSON.parse(localStorage.getItem(key)) || seed(); } catch { ideas = seed(); }
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const fill = (template, idea = {}) => template.replace(/%(ID|STATE|DESCRIPTION)%/g, (_, field) => escape(idea[field.toLowerCase()]));
const content = document.getElementById('original-ideas-content');
function render() {
  const parts = (location.hash.slice(1) || '/ideas').split('/').filter(Boolean);
  const idea = ideas.find(item => item.id === Number(parts[1]));
  if (parts[1] === 'create') content.innerHTML = templates.create;
  else if (idea) content.innerHTML = fill(parts[2] === 'edit' ? templates.edit : templates.show, idea);
  else content.innerHTML = templates.index.replace('%CARDS%', () => ideas.map(item => fill(templates.card, item)).join('')).replace('%EMPTY%', ideas.length ? '' : templates.empty);
}
window.addEventListener('hashchange', render);
document.addEventListener('submit', event => {
  const form = event.target;
  event.preventDefault();
  if (form.hasAttribute('data-demo-reset')) { location.hash = '/ideas'; render(); return; }
  const id = Number((form.getAttribute('action') || '').split('/').pop());
  const method = new FormData(form).get('_method');
  if (method === 'DELETE') ideas = ideas.filter(idea => idea.id !== id);
  else {
    const description = String(new FormData(form).get('description') || '').trim();
    if (description.length < 5 || description.length > 255) { form.querySelector('[data-error]').textContent = 'The description must be between 5 and 255 characters.'; return; }
    if (method === 'PATCH') ideas = ideas.map(idea => idea.id === id ? { ...idea, description } : idea);
    else ideas.push({ id: Math.max(0, ...ideas.map(idea => idea.id)) + 1, description, state: 'pending' });
  }
  localStorage.setItem(key, JSON.stringify(ideas));
  location.hash = '/ideas'; render();
});
const label = document.createElement('div');
label.className = 'text-center text-xs text-zinc-400 px-4 py-2 border-b border-zinc-800';
label.textContent = 'Demo · Fictional data · No account required · Changes stay in this browser. ';
const reset = document.createElement('button'); reset.textContent = 'Reset demo'; reset.className = 'text-yellow-400 underline'; reset.onclick = () => { localStorage.removeItem(key); location.reload(); };
label.append(reset); document.body.prepend(label);
render();
