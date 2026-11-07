export const project = document.body.dataset.project;
export const languages = ['en', 'ar'];
export const storageKey = `mwz-public-demo-v1:${project}`;
let language = 'en';
try { language = sessionStorage.getItem('mwz-demo-language') || 'en'; } catch {}
if (!languages.includes(language)) language = 'en';
export const t = (en, ar = en) => language === 'ar' ? ar : en;
export const lang = () => language;
export const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
export const money = amount => new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 }).format(amount / 100);
export const date = value => new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Cairo' }).format(new Date(value));
export const uid = () => globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const button = (label, action, id = '', classes = '') => `<button type="button" class="button ${classes}" data-action="${esc(action)}" data-id="${esc(id)}">${label}</button>`;
export const nav = (label, hash, active) => `<a href="#${hash}" ${active ? 'class="active" aria-current="page"' : ''}>${label}</a>`;
export const status = value => t(value, ({ Pending: 'معلّق', Preparing: 'بيتجهّز', 'On the way': 'في الطريق', Delivered: 'اتسلّم', Cancelled: 'ملغي', New: 'جديدة', 'In progress': 'قيد التنفيذ', Done: 'مكتملة', deposit: 'إيداع', withdraw: 'سحب', transfer: 'تحويل' })[value] || value);
export const field = (label, input) => `<label>${label}${input}</label>`;
export const empty = text => `<div class="empty"><h2>${t('Nothing here yet', 'مفيش بيانات هنا لسه')}</h2><p>${text}</p></div>`;
export function loadState(seed, validate) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey));
    if (stored && validate(stored)) return stored;
  } catch {}
  return structuredClone(seed);
}
export function persist(state) {
  try { sessionStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
}
let toastTimer;
export function toast(message) {
  const element = document.getElementById('toast');
  element.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { element.textContent = ''; }, 6000);
}
let dialogOpener;
export function dialog(title, content) {
  const element = document.getElementById('dialog');
  dialogOpener = document.activeElement;
  element.innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${esc(title)}</h2><button type="button" data-action="close" aria-label="${t('Close', 'اقفل')}">×</button></div>${content}<p id="form-error" class="error" role="alert"></p>`;
  element.showModal();
}
export function closeDialog() {
  document.getElementById('dialog').close();
  if (dialogOpener?.isConnected) dialogOpener.focus();
}
export function showError(error) {
  const element = document.getElementById('dialog');
  const message = error instanceof Error ? error.message : t('Please try again.', 'جرّب تاني.');
  if (element.open) document.getElementById('form-error').textContent = message;
  else toast(message);
}
export function setLanguage() {
  language = language === 'en' ? 'ar' : 'en';
  try { sessionStorage.setItem('mwz-demo-language', language); } catch {}
}
export function mount({ name, mark, navigation, content, role = '', subtitle = '' }) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.title = `${name} — ${t('Public interactive demo', 'نسخة عرض عامة')}`;
  const previous = document.activeElement;
  const focusId = previous?.id;
  const start = previous?.selectionStart;
  const end = previous?.selectionEnd;
  document.getElementById('app').innerHTML = `
    <div class="demo-bar"><p><span class="dot"></span>${t('PUBLIC DEMO · Sample data & fictional money · No account needed', 'نسخة تجريبية عامة · بيانات وفلوس وهمية · من غير حساب')}</p><div class="demo-tools"><a href="../../${language}/#projects">${t('← Mohamed’s portfolio', '← بورتفوليو محمد')}</a><button type="button" data-action="language">${t('العربية', 'English')}</button><button type="button" data-action="reset">${t('Reset demo', 'ابدأ من جديد')}</button></div></div>
    <div class="shell"><header class="header"><a class="brand" href="#home"><span class="brand-mark" aria-hidden="true">${mark}</span>${name}</a><nav class="nav" aria-label="${t('Main navigation', 'القائمة الرئيسية')}">${navigation}</nav>${role || `<div class="avatar"><i>MW</i><div>${t('Demo visitor', 'زائر تجريبي')}<br><small>${subtitle || t('Explore freely', 'جرّب براحتك')}</small></div></div>`}</header>
    <main id="main" class="content" tabindex="-1">${content}</main><footer class="footer"><span>${name} · ${t('Interactive HTML showcase by Mohamed Walaa', 'عرض HTML تفاعلي من محمد ولاء')}</span><span>${t('Changes stay in this browser tab. No real payments or orders.', 'التغييرات في التبويب ده بس. مفيش دفع أو طلبات حقيقية.')}</span></footer></div>`;
  if (focusId) {
    const next = document.getElementById(focusId);
    if (next) { next.focus(); if (typeof start === 'number') { try { next.setSelectionRange(start, end); } catch {} } }
  }
}
