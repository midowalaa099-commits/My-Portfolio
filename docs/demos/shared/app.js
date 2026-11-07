import { project, t, button, dialog, closeDialog, setLanguage, toast, showError } from './runtime.js';
const modules = { 'mvp-bank': './bank.js', 'masr-security': './shop.js', 'order-app': './order.js', 'batman-cave-ideas': './ideas.js' };
const app = await import(modules[project]);
app.render();
window.addEventListener('hashchange', () => { closeDialog(); app.render(); document.getElementById('main').focus(); window.scrollTo(0, 0); });
document.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target || target.disabled) return;
  const { action, id } = target.dataset;
  try {
    if (action === 'close') return closeDialog();
    if (action === 'language') { closeDialog(); setLanguage(); return app.render(); }
    if (action === 'reset') return dialog(t('Reset this demo?', 'نرجّع التجربة للبداية؟'), `<p>${t('Your simulated changes in this project will be replaced with the original sample data.', 'التغييرات التجريبية في المشروع ده هتتمسح وترجع البيانات الوهمية الأصلية.')}</p><div class="actions">${button(t('Reset demo', 'ابدأ من جديد'), 'confirm-reset', '', 'primary')}${button(t('Keep exploring', 'كمّل التجربة'), 'close')}</div>`);
    if (action === 'confirm-reset') { closeDialog(); app.reset(); app.render(); return toast(t('Sample data restored.', 'رجّعنا البيانات الوهمية.')); }
    app.action(action, id, target);
  } catch (error) { showError(error); }
});
document.addEventListener('submit', event => {
  if (!(event.target instanceof HTMLFormElement) || !event.target.dataset.form) return;
  event.preventDefault();
  try { app.submit(event.target.dataset.form, new FormData(event.target)); } catch (error) { showError(error); }
});
document.addEventListener('input', event => {
  if (event.target.dataset.filter) app.filter(event.target.dataset.filter, event.target.value);
});
document.addEventListener('change', event => {
  if (event.target.dataset.change) app.filter(event.target.dataset.change, event.target.value);
});
