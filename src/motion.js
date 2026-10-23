const easing = 'cubic-bezier(.22,.7,.25,1)';
export function installMotion(root = document) {
  document.documentElement.dataset.motionReady = 'true';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const rail = root.querySelector('.request-rail');
  const resize = new ResizeObserver(() => {
    if (rail) rail.style.setProperty('--rail-distance', Math.max(0, rail.clientWidth - 150) + 'px');
  });
  if (rail) resize.observe(rail);
  const animations = new Set();
  const animate = (element, frames, options) => {
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  };
  const direction = document.documentElement.dir === 'rtl' ? -1 : 1;
  // One short sequence per text group. Nothing is pre-hidden in CSS or HTML.
  const revealGroups = new Map();
  function registerGroup(selector, childSelector) {
    root.querySelectorAll(selector).forEach(group => {
      const children = [...group.querySelectorAll(childSelector)];
      if (children.length) revealGroups.set(group, children);
    });
  }
  registerGroup('.hero-content', 'h1 > span, .identity-role, .identity-intro, .identity-stack, .availability');
  registerGroup('.profile-intro > div', '.eyebrow, h2, p:not(.eyebrow)');
  registerGroup('.section-heading', '.eyebrow, h2, .intro');
  registerGroup('.project-content', '.project-kind, h3, .project-description, .tags');
  registerGroup('.working-method article, .skill', 'h4, p, li');
  registerGroup('.education > div', 'h3, p');
  registerGroup('.faq-layout > div:first-child', '.eyebrow, h2');
  registerGroup('.demo-explanation', '.eyebrow, h3, p');
  registerGroup('.footer', 'p');
  registerGroup('.contact', '.eyebrow, h2, p:not(.eyebrow)');
  root.querySelectorAll('.identity-portrait, .profile-intro figure').forEach(photo => revealGroups.set(photo, [photo.querySelector('img')]));
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveals.unobserve(entry.target);
      if (reduce.matches || document.hidden) return;
      const photo = entry.target.matches('.identity-portrait, .profile-intro figure');
      const horizontal = (entry.target.matches('.identity-portrait') ? 30 : -30) * direction;
      const children = revealGroups.get(entry.target) || [];
      children.forEach((element, index) => {
        if (!element || element.matches(':focus-within')) return;
        animate(element,
          [{ transform: photo ? `translateX(${horizontal}px)` : 'translateY(16px)', opacity: photo ? .65 : .38 }, { transform: 'translate(0,0)', opacity: 1 }],
          { duration: photo ? 600 : 440, delay: photo ? 0 : Math.min(index * 65, 325), easing, fill: 'backwards' });
      });
    });
  }, { threshold: .12 });
  revealGroups.forEach((_, group) => reveals.observe(group));
  function portraitClick(event) {
    const button = event.target.closest('.portrait-touch');
    if (!button || reduce.matches) return;
    const image = button.querySelector('img');
    if (!image) return;
    const existing = image.getAnimations?.() || [];
    existing.forEach(animation => animation.cancel());
    animate(image, [{ transform: 'scale(1)' }, { transform: 'scale(1.045)', offset: .45 }, { transform: 'scale(1)' }], { duration: 540, easing });
  }
  function settleFocused(event) {
    // Never keep a keyboard target moving as focus enters its group.
    for (const animation of animations) {
      const target = animation.effect?.target;
      if (target?.contains(event.target)) animation.finish();
    }
  }
  root.addEventListener('click', portraitClick);
  root.addEventListener('focusin', settleFocused);
  const counterStops = new Set();
  const results = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      results.unobserve(entry.target);
      if (reduce.matches || document.hidden) return;
      entry.target.querySelectorAll('.bar').forEach((bar, index) => animate(bar,
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: 700, delay: index * 80, easing, fill: 'backwards' }));
      entry.target.querySelectorAll('[data-count]').forEach(number => {
        const final = number.dataset.count;
        number.textContent = '0.000';
        let frame, start;
        const stop = () => { cancelAnimationFrame(frame); number.textContent = final; counterStops.delete(stop); };
        counterStops.add(stop);
        function tick(now) {
          start ??= now;
          const progress = Math.min(1, (now - start) / 700);
          number.textContent = (Number(final) * (1 - (1 - progress) ** 3)).toFixed(3);
          if (progress < 1) frame = requestAnimationFrame(tick); else stop();
        }
        frame = requestAnimationFrame(tick);
      });
    });
  }, { threshold: .4 });
  root.querySelectorAll('.result-chart').forEach(chart => results.observe(chart));
  const proof = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      proof.unobserve(entry.target);
      if (reduce.matches || document.hidden) return;
      entry.target.querySelectorAll('[data-proof-count]').forEach(number => {
        const final = Number(number.dataset.proofCount);
        const suffix = number.dataset.proofSuffix;
        let frame, start;
        number.textContent = '0' + suffix;
        const stop = () => { cancelAnimationFrame(frame); number.textContent = final + suffix; counterStops.delete(stop); };
        counterStops.add(stop);
        function tick(now) {
          start ??= now;
          const progress = Math.min(1, (now - start) / 850);
          number.textContent = Math.round(final * (1 - (1 - progress) ** 3)) + suffix;
          if (progress < 1) frame = requestAnimationFrame(tick); else stop();
        }
        frame = requestAnimationFrame(tick);
      });
    });
  }, { threshold: .35 });
  root.querySelectorAll('.proof').forEach(group => proof.observe(group));
  const flows = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      flows.unobserve(entry.target);
      if (reduce.matches || document.hidden) return;
      entry.target.classList.add('flow-playing');
      entry.target.querySelectorAll('.step-dot').forEach((dot, index) => animate(dot,
        [{ opacity: .3, transform: 'scale(.65)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 220, delay: index * 220, easing, fill: 'backwards' }));
      entry.target.querySelectorAll('li').forEach((item, index) => animate(item,
        [{ opacity: .6 }, { opacity: 1 }], { duration: 220, delay: index * 220, easing }));
    });
  }, { threshold: .65 });
  root.querySelectorAll('.order-flow').forEach(flow => flows.observe(flow));
  function detailClick(event) {
    const summary = event.target.closest('.project-details > summary');
    if (!summary || reduce.matches) return;
    const detail = summary.parentElement;
    const body = detail.querySelector('.details-body');
    if (!detail.open) return;
    event.preventDefault();
    if (detail.dataset.closing) return;
    detail.dataset.closing = 'true';
    const animation = body.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 180, easing });
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => {
      animations.delete(animation);
      if (body.contains(document.activeElement)) summary.focus();
      detail.open = false;
      delete detail.dataset.closing;
    });
  }
  function detailToggle(event) {
    const detail = event.target;
    if (!detail.matches('.project-details') || !detail.open || reduce.matches) return;
    animate(detail.querySelector('.details-body'), [{ opacity: .65, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 250, easing });
  }
  root.addEventListener('click', detailClick);
  root.addEventListener('toggle', detailToggle, true);
  const nav = root.querySelector('.navigation');
  const indicator = root.querySelector('.nav-indicator');
  const navLinks = [...root.querySelectorAll('.navigation a')];
  let active;
  function placeIndicator() {
    if (!active || !nav || !indicator) return;
    const bounds = active.getBoundingClientRect();
    const parent = nav.getBoundingClientRect();
    indicator.style.inlineSize = bounds.width + 'px';
    indicator.style.transform = `translateX(${bounds.left - parent.left}px)`;
  }
  function markActive(link) {
    active = link;
    navLinks.forEach(item => { if (item === link) item.setAttribute('aria-current', 'location'); else item.removeAttribute('aria-current'); });
    placeIndicator();
  }
  const sections = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const link = navLinks.find(item => item.hash === '#' + entry.target.id);
      if (link) markActive(link);
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  navLinks.forEach(link => { const section = root.querySelector(link.hash); if (section) sections.observe(section); });
  function navClick(event) { const link = event.target.closest('.navigation a'); if (link) markActive(link); }
  root.addEventListener('click', navClick);
  const navResize = new ResizeObserver(placeIndicator);
  if (nav) navResize.observe(nav);
  const portrait = root.querySelector('.identity-portrait');
  let portraitVisible = false;
  function syncAmbient() {
    if (portrait) portrait.classList.toggle('ambient-running', portraitVisible && !document.hidden && !reduce.matches);
  }
  const ambient = new IntersectionObserver(entries => { portraitVisible = entries[0]?.isIntersecting; syncAmbient(); }, { threshold: .05 });
  if (portrait) ambient.observe(portrait);
  document.addEventListener('visibilitychange', syncAmbient);
  reduce.addEventListener('change', syncAmbient);
  const finishMotion = () => { for (const animation of animations) animation.finish(); for (const stop of [...counterStops]) stop(); };
  const visibility = () => { if (document.hidden) finishMotion(); };
  document.addEventListener('visibilitychange', visibility);
  reduce.addEventListener('change', finishMotion);
  return () => { proof.disconnect(); root.removeEventListener('click', portraitClick); root.removeEventListener('focusin', settleFocused); root.removeEventListener('click', detailClick); root.removeEventListener('toggle', detailToggle, true); resize.disconnect(); reveals.disconnect(); results.disconnect(); flows.disconnect(); ambient.disconnect(); document.removeEventListener('visibilitychange', syncAmbient); reduce.removeEventListener('change', syncAmbient); portrait?.classList.remove('ambient-running'); sections.disconnect(); navResize.disconnect(); root.removeEventListener('click', navClick); delete document.documentElement.dataset.motionReady; finishMotion(); document.removeEventListener('visibilitychange', visibility); reduce.removeEventListener('change', finishMotion); };
}
