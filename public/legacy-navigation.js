// Keep legacy React Router navigation from replacing the new homepage in memory.
// Legacy page interactions still use the original application bundle.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
  const destination = new URL(link.href, location.href);
  if (destination.origin !== location.origin || (destination.pathname === location.pathname && destination.hash)) return;
  event.preventDefault(); event.stopPropagation(); location.assign(destination.href);
}, true);
