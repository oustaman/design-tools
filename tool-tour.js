/* A short look round a tool: a ring on one thing at a time and a small card beside it. It blocks nothing,
   shows once on a first visit, and can be started again.
   ToolTour(key for remembering, [{at: selector, side: 'left'|'right'|'below'|'inside', text}]) */
window.ToolTour = function (key, steps) {
  let i = -1, card = null, ring = null, back = null;
  const seen = () => { try { return !!localStorage.getItem(key); } catch (e) { return true; } };
  const remember = () => { try { localStorage.setItem(key, '1'); } catch (e) {} };
  function place() {
    const s = steps[i], t = document.querySelector(s.at); if (!t || !card) return;
    const r = t.getBoundingClientRect(), c = card.getBoundingClientRect(), gap = 12;
    ring.style.cssText = `left:${r.left - 3}px;top:${r.top - 3}px;width:${r.width + 6}px;height:${r.height + 6}px`;
    let x = s.side === 'left' ? r.left - c.width - gap : s.side === 'right' ? r.right + gap : s.side === 'inside' ? r.left + 24 : r.right - c.width, y = s.side === 'below' ? r.bottom + gap : s.side === 'inside' ? r.top + 24 : r.top;
    x = Math.max(8, Math.min(x, innerWidth - c.width - 8)); y = Math.max(8, Math.min(y, innerHeight - c.height - 8));
    card.style.left = x + 'px'; card.style.top = y + 'px';
  }
  function show(n) {
    const there = s => { const t = document.querySelector(s.at); return t && t.getBoundingClientRect().width > 0; };
    while (n < steps.length && !there(steps[n])) n++;
    if (n >= steps.length) { end(); return; }
    i = n; const last = i === steps.length - 1;
    card.innerHTML = `<p>${steps[i].text}</p>${last ? '<p><b>Walkthrough</b>, at the top, runs this again.</p>' : ''}<div class="tt-row"><span>${i + 1} of ${steps.length}</span><button type="button" class="tbtn xs" data-tt="end">${last ? 'Close' : 'Skip'}</button>${last ? '' : '<button type="button" class="tbtn xs pri" data-tt="next">Next</button>'}</div>`;
    place(); (card.querySelector('[data-tt="next"]') || card.querySelector('[data-tt="end"]')).focus({ preventScroll: true });
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); end(); } }
  function end() {
    remember(); removeEventListener('resize', place); removeEventListener('keydown', onKey, true);
    if (card) card.remove(); if (ring) ring.remove(); card = ring = null;
    if (back && back.isConnected && back !== document.body) back.focus({ preventScroll: true });
  }
  function start() {
    if (card) end();
    back = document.activeElement;
    ring = document.createElement('div'); ring.className = 'tt-ring'; ring.setAttribute('aria-hidden', 'true');
    card = document.createElement('div'); card.className = 'tt-card'; card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'A quick look round');
    card.addEventListener('click', e => { const b = e.target.closest('[data-tt]'); if (!b) return; if (b.dataset.tt === 'next') show(i + 1); else end(); });
    document.body.append(ring, card); addEventListener('resize', place); addEventListener('keydown', onKey, true); show(0);
  }
  return { start, first: () => { if (!seen()) start(); } };
};
