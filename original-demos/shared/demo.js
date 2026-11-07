// Transport used ONLY by the public static copies. No request reaches a real API.
export class DemoError extends Error {
  constructor(message, status = 422) { super(message); this.status = status; }
}
export const reject = (message, status) => { throw new DemoError(message, status); };
export const uuid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export function cents(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) reject('Enter a positive amount with at most two decimal places.');
  const [whole, fraction = ''] = String(value).split('.');
  const result = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  if (result <= 0n || result > 9223372036854775807n) reject('The amount is outside the supported range.');
  return result;
}
export function money(value) { return `${value / 100n}.${String(value % 100n).padStart(2, '0')}`; }
export function installDemo({ key, seed, roles, session, handler, hint = '' }) {
  let state;
  try { state = JSON.parse(localStorage.getItem(key)) || seed(); } catch { state = seed(); }
  let role = localStorage.getItem(`${key}.role`);
  if (!roles.includes(role)) role = roles[0];
  session(role);
  const save = () => localStorage.setItem(key, JSON.stringify(state));
  // Fail closed: even an unimplemented endpoint stays inside this fictional demo.
  window.fetch = async (input, options = {}) => {
    try {
      const url = new URL(typeof input === 'string' ? input : input.url, location.href);
      const prefix = url.pathname.indexOf('/api/v1');
      if (prefix < 0) reject('This public demo does not contact external APIs.', 404);
      const path = url.pathname.slice(prefix + 7) || '/';
      const method = (options.method || 'GET').toUpperCase();
      if (/\/(?:auth\/)?logout$/.test(path)) { location.reload(); return new Promise(() => {}); }
      const body = options.body ? JSON.parse(options.body) : {};
      const result = handler({ state, role, path, method, body, query: url.searchParams, headers: new Headers(options.headers), save });
      return new Response(JSON.stringify(result ?? { data: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
      return new Response(JSON.stringify({ message: error.message || 'Demo operation failed.' }), { status: error.status || 422, headers: { 'Content-Type': 'application/json', 'X-Bank-Rejection': '1' } });
    }
  };
  const showControls = () => {
    const host = document.createElement('aside');
    host.setAttribute('aria-label', 'Public demo controls');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>:host{position:fixed;right:12px;bottom:12px;z-index:2147483647;font:12px/1.5 system-ui;color:#fff}details{background:#172c37;border:1px solid #697b83;border-radius:12px;padding:9px 12px;box-shadow:0 4px 18px #0004;max-width:min(340px,85vw)}summary{cursor:pointer;font-weight:600}p{margin:8px 0}select,button,a{font:inherit}select,button{background:#fff;color:#172c37;border:0;border-radius:5px;padding:5px;margin:4px 3px 0 0}a{color:#d3ee89}code{overflow-wrap:anywhere}</style><details><summary>Demo · Fictional data · No account required</summary><p>The original interface, running with data stored only in this browser.</p><label>View as <select aria-label="Demo role"></select></label><button type="button">Reset demo</button><p>${hint}</p><a href="https://midowalaa099-commits.github.io/My-Portfolio/en/#projects">Back to portfolio</a></details>`;
    const select = root.querySelector('select');
    for (const value of roles) select.add(new Option(value === 'owner' ? 'Restaurant owner' : value[0].toUpperCase() + value.slice(1), value));
    select.value = role;
    select.onchange = () => { localStorage.setItem(`${key}.role`, select.value); location.hash = ''; location.reload(); };
    root.querySelector('button').onclick = () => { localStorage.removeItem(key); location.reload(); };
    document.body.append(host);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showControls, { once: true }); else showControls();
}
