/* Zoom and pan, for the Flow maker and the Screen maker. A world inside a stage, moved with one CSS
   transform, so everything inside it keeps measuring correctly with getBoundingClientRect.
   Scroll to pan; pinch, or Ctrl/Cmd and scroll, to zoom at the pointer; drag the empty canvas, or
   hold Space and drag anywhere, to pan; − + and Fit in the corner; Ctrl/Cmd + − 0 on the keyboard. */
/* the More menu: closes on Esc, on a click elsewhere, and hands focus back */
addEventListener('click', e => { document.querySelectorAll('details.menu[open]').forEach(m => { if (!m.contains(e.target)) m.open = false; }); });
addEventListener('keydown', e => { if (e.key !== 'Escape') return; const m = document.querySelector('details.menu[open]'); if (m) { m.open = false; m.querySelector('summary').focus(); } });

window.ToolCanvas = function (stage, world, opts = {}) {
  const MIN = 0.1, MAX = 3;
  const v = { x: 0, y: 0, z: 1 };
  const label = opts.label, changed = opts.onChange || (() => {});
  function apply() {
    world.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
    world.style.setProperty('--z', v.z);
    /* the dots belong to the canvas: they move and scale with it, and thin out when zoomed far out */
    let d = 22 * v.z; while (d < 16) d *= 2; while (d > 88) d /= 2;
    stage.style.backgroundSize = `${d}px ${d}px`; stage.style.backgroundPosition = `${v.x - d / 2}px ${v.y - d / 2}px`;
    stage.style.setProperty('--dr', Math.max(0.9, Math.min(3.2, 1.3 * Math.sqrt(v.z))).toFixed(2) + 'px');
    if (label) label.textContent = Math.round(v.z * 100) + '%';
    changed();
  }
  const zoomAt = (z, cx, cy) => { z = Math.max(MIN, Math.min(MAX, z)); const k = z / v.z; v.x = cx - (cx - v.x) * k; v.y = cy - (cy - v.y) * k; v.z = z; apply(); };
  const centre = () => { const r = stage.getBoundingClientRect(); return [r.width / 2, r.height / 2]; };
  const zoomBy = k => zoomAt(v.z * k, ...centre());
  /* a box inside the world, in world units */
  function boxOf(el) { const w = world.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: (r.left - w.left) / v.z, y: (r.top - w.top) / v.z, w: r.width / v.z, h: r.height / v.z }; }
  /* show a box whole; room leaves space for the corner controls */
  function fit(el, pad = 24, cap = 1) {
    const s = stage.getBoundingClientRect(), b = boxOf(el), room = opts.bottom || 48, top = opts.top ? opts.top() : pad;
    const z = Math.max(MIN, Math.min(cap, (s.width - 2 * pad) / b.w, (s.height - top - pad - room) / b.h));
    v.z = z; v.x = (s.width - b.w * z) / 2 - b.x * z; v.y = Math.max(top, (s.height - room - b.h * z) / 2) - b.y * z; apply();
  }
  /* move just enough to bring a box into view */
  function reveal(el, pad = 24) {
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); let dx = 0, dy = 0, room = opts.bottom || 48;
    if (r.left - s.left < pad) dx = pad - (r.left - s.left); else if (r.right - s.left > s.width - pad) dx = Math.max(s.width - pad - (r.right - s.left), pad - (r.left - s.left));
    if (r.top - s.top < pad) dy = pad - (r.top - s.top); else if (r.bottom - s.top > s.height - room) dy = Math.max(s.height - room - (r.bottom - s.top), pad - (r.top - s.top));
    if (dx || dy) { v.x += dx; v.y += dy; apply(); }
  }

  stage.addEventListener('wheel', e => { e.preventDefault(); const r = stage.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) zoomAt(v.z * Math.exp(-Math.max(-25, Math.min(25, e.deltaY)) * 0.01), e.clientX - r.left, e.clientY - r.top);
    else { v.x -= e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX; v.y -= e.shiftKey && !e.deltaX ? 0 : e.deltaY; apply(); } }, { passive: false });

  /* focusing something out of view makes the browser scroll the stage: turn that into a pan */
  stage.addEventListener('scroll', () => { if (!stage.scrollLeft && !stage.scrollTop) return; v.x -= stage.scrollLeft; v.y -= stage.scrollTop; stage.scrollLeft = 0; stage.scrollTop = 0; apply(); });

  let space = false, pan = null;
  const typing = t => t.closest && t.closest('input,select,textarea,[contenteditable]');
  addEventListener('keydown', e => {
    if (e.code === 'Space' && !typing(e.target) && e.target.tagName !== 'BUTTON' && !e.target.closest('summary')) { space = true; stage.classList.add('spacey'); e.preventDefault(); }
    if ((e.metaKey || e.ctrlKey) && !e.altKey) {
      if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomBy(1.25); }
      if (e.key === '-') { e.preventDefault(); zoomBy(0.8); }
      if (e.key === '0') { e.preventDefault(); if (opts.fitAll) opts.fitAll(); }
    }
  });
  addEventListener('keyup', e => { if (e.code === 'Space') { space = false; stage.classList.remove('spacey'); } });
  /* capture: with Space held, panning wins over whatever is under the pointer */
  stage.addEventListener('pointerdown', e => {
    const bg = opts.isBackground ? opts.isBackground(e.target) : e.target === stage || e.target === world;
    if (!(space || e.button === 1 || (e.button === 0 && bg))) return;
    pan = { x: e.clientX, y: e.clientY, moved: false }; stage.classList.add('panning'); e.preventDefault(); if (space || e.button === 1) e.stopPropagation();
  }, true);
  addEventListener('pointermove', e => { if (!pan) return; v.x += e.clientX - pan.x; v.y += e.clientY - pan.y; pan.x = e.clientX; pan.y = e.clientY; pan.moved = true; apply(); });
  addEventListener('pointerup', () => { if (pan) { pan = null; stage.classList.remove('panning'); } });
  addEventListener('resize', changed);
  apply();
  return { v, apply, zoomBy, zoomAt, fit, reveal, boxOf };
};
