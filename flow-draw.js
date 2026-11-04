/* Drawing for flows: shared by the Flow maker (flow.html) and the guide to how flows work
   (flow-guide.html). Pure functions: a list of steps in, SVG out. A step is
   {id, t: text, w: where, k: 'step'|'q'|'wait', bad, note, ifnot, go: 'stuck'|'back', back, from: [ids]}. */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nums = list => { const m = {}; let n = 0; list.forEach(x => { if (x.k !== 'wait' && x.k !== 'end' && !x.off) m[x.id] = ++n; }); return m; };
  const counts = list => {
    return { steps: Object.keys(nums(list)).length, waits: list.filter(x => x.k === 'wait').length,
      stuck: list.filter(x => x.bad || (x.k === 'q' && x.ifnot && x.go === 'stuck') || (x.ans || []).some(a => a.to === '@stuck')).length,
      loops: list.filter(x => x.k === 'q' && x.ifnot && x.go === 'back').length + arrowsOf(list).filter((e, i, all) => closesLoop(e, all, list)).length }; };

  /* what happened to each step now */
  /* What happened to each step now — kept, merged, moved or
     removed (and new, for a screen nothing came from). Renaming a step does not change what it
     is: one step now, one screen after, is kept. */
  function fatesOf(before, after) {
    const an = nums(after), pos = {}; after.forEach((a, i) => { pos[a.id] = i; });
    const out = {}; let maxPos = -1;
    before.forEach(b => {
      const refs = after.filter(a => (a.from || []).includes(b.id));
      if (!refs.length) { out[b.id] = { kind: 'removed', label: 'Removed' }; return; }
      const r = refs[0], to = an[r.id] ? `step ${an[r.id]}` : r.k === 'wait' ? 'a wait' : `“${r.t}”`, moved = pos[r.id] < maxPos;
      maxPos = Math.max(maxPos, pos[r.id]);
      const kind = r.from.length > 1 ? 'merged' : moved ? 'moved' : 'kept';
      const label = (kind === 'merged' ? `Merged into ${to}` : kind === 'moved' ? `Moved → ${to}` : `Kept → ${to}`) + (kind === 'merged' && moved ? ', moved' : '');
      out[b.id] = { kind, label, to: an[r.id], moved, into: r };
    });
    return out;
  }

  const wrap = (s, max) => { const out = []; let line = ''; String(s).split(/\s+/).forEach(w => { if ((line + ' ' + w).trim().length > max) { if (line) out.push(line); line = w; } else line = (line + ' ' + w).trim(); }); if (line) out.push(line); return out.length ? out : ['']; };
  const clip = (lines, n) => lines.length <= n ? lines : [...lines.slice(0, n - 1), lines[n - 1].replace(/[,.;:]?$/, '') + '…'];
  /* the Flow maker's words, measured in the browser's own font: all of them are kept, and a word too long for a line breaks across lines */
  const ruler = document.createElement('canvas').getContext('2d');
  const wide = (s, fs, wt = 400) => { ruler.font = `${wt} ${fs}px ${FONT}`; return ruler.measureText(s).width; };
  function fill(s, maxW, fs, wt = 400) {
    const out = []; let line = '';
    String(s == null ? '' : s).split(/\s+/).filter(Boolean).forEach(word => {
      const tried = line ? line + ' ' + word : word;
      if (wide(tried, fs, wt) <= maxW) { line = tried; return; }
      if (line) out.push(line);
      while (word.length > 1 && wide(word, fs, wt) > maxW) { let n = word.length - 1; while (n > 1 && wide(word.slice(0, n), fs, wt) > maxW) n--; out.push(word.slice(0, n)); word = word.slice(n); }
      line = word; });
    if (line) out.push(line);
    return out.length ? out : [''];
  }
  const T = (lines, x, y, lh, attrs) => `<text ${attrs} text-anchor="middle">${lines.map((l, i) => `<tspan x="${x}" y="${y + i * lh}">${esc(l)}</tspan>`).join('')}</text>`;
  const COL = { ink: '#1A1618', mute: '#5A5352', box: '#FFFFFF', line: '#1A1618', q: '#FFF4D6', qs: '#8A6100', wait: '#F1EFEC', bad: '#B3261E', badf: '#FCEAE8', ok: '#285638', okf: '#E3EFE7', loop: '#1A526D', rm: '#8E8685' };

  function band(list, x0, y0, bw0, bh0, label, sub, F, one) {
    const out = [], N = nums(list), items = list, head = label ? 82 : 0;
    if (label) out.push(`<text x="${x0}" y="${y0 + 26}" font-size="24" font-weight="800" letter-spacing="2" fill="${COL.ink}">${esc(label)}</text>`,
      `<text x="${x0}" y="${y0 + 56}" font-size="19" fill="${COL.mute}">${esc(sub)}</text>`);
    if (!items.length) { out.push(`<text x="${x0}" y="${y0 + 120}" font-size="22" fill="${COL.mute}">Nothing here yet.</text>`); return out.join(''); }
    const hasLoop = items.some(x => x.k === 'q' && x.ifnot && x.go === 'back'), top = y0 + head + (hasLoop ? 40 : 14), h = bh0 - (top - y0);
    const units = x => x.k === 'wait' ? 0.72 : x.k === 'q' ? 1.3 : 1;
    const lim = one ? 11 : 8, per = items.length <= lim ? items.length : items.length <= 2 * lim ? Math.ceil(items.length / 2) : Math.ceil(items.length / 3);
    const rows = []; for (let i = 0; i < items.length; i += per) rows.push(items.slice(i, i + per));
    const gap = per > 8 ? 40 : 54, maxU = Math.max(...rows.map(r => r.reduce((s, x) => s + units(x), 0)));
    const maxN = Math.max(...rows.map(r => r.length));
    const bw = Math.min(250, (bw0 - (maxN - 1) * gap) / maxU);
    const rowH = h / rows.length, bh = Math.min(120, rowH - (rowH < 230 ? 74 : 92)), fs = bw < 150 ? 15 : 17, cpl = Math.max(10, Math.floor((bw - 34) / (fs * 0.52)));
    const P = {}; let prev = null;
    rows.forEach((r, ri) => {
      const rw = r.reduce((s, x) => s + units(x) * bw, 0) + (r.length - 1) * gap;
      let x = x0 + (bw0 - rw) / 2; const y = top + ri * rowH + 6, cy = y + bh / 2;
      r.forEach(it => {
        const w = units(it) * bw, cx = x + w / 2;
        P[it.id] = { x, y, w, cx, cy, top: y, bot: y + bh };
        if (prev) {
          out.push(`<g data-to="${esc(it.id)}">`);
          if (prev.cy === cy) out.push(`<line x1="${prev.x + prev.w + 4}" y1="${cy}" x2="${x - 4}" y2="${cy}" stroke="transparent" stroke-width="24"/><line x1="${prev.x + prev.w + 4}" y1="${cy}" x2="${x - 4}" y2="${cy}" stroke="${COL.line}" stroke-width="2.5" marker-end="url(#ah)"/>`);
          else { const mid = y - 18, d = `M${prev.cx},${prev.bot + 4} V${mid} H${cx} V${y - 4}`;
            out.push(`<path d="${d}" fill="none" stroke="transparent" stroke-width="24"/><path d="${d}" fill="none" stroke="${COL.line}" stroke-width="2.5" marker-end="url(#ah)"/>`); }
          if (prev.q) out.push(`<text x="${prev.cy === cy ? prev.x + prev.w + 8 : prev.cx + 8}" y="${prev.cy === cy ? cy - 10 : prev.bot + 22}" font-size="15" fill="${COL.mute}">yes</text>`);
          out.push('</g>');
        }
        out.push(`<g data-step="${esc(it.id)}">`);
        const f = F && F[it.id];
        if (it.k === 'wait') {
          out.push(`<rect x="${x}" y="${cy - 34}" width="${w}" height="68" rx="34" fill="${COL.wait}" stroke="${COL.mute}" stroke-width="2" stroke-dasharray="7 6"/>`,
            T(clip(wrap('⏱ ' + it.t, Math.floor(w / 8)), 2), cx, cy - 2, 18, `data-f="t" font-size="14" font-style="italic" fill="${COL.mute}"`));
          P[it.id].top = cy - 34; P[it.id].bot = cy + 34;
        } else if (it.k === 'q') {
          out.push(`<polygon points="${cx},${y - 8} ${x + w},${cy} ${cx},${y + bh + 8} ${x},${cy}" fill="${COL.q}" stroke="${COL.qs}" stroke-width="2.5"/>`,
            (() => { const ql = clip(wrap(it.t, Math.max(8, Math.floor(w * 0.62 / ((fs - 1) * 0.52)))), Math.max(2, Math.floor((bh - 10) / 18))); return T(ql, cx, cy - (ql.length - 1) * 9 + 5, 18, `data-f="t" font-size="${fs - 1}" fill="${COL.ink}"`); })(),
            `<text x="${x + 4}" y="${y + 6}" font-size="15" font-weight="800" fill="${COL.qs}">${N[it.id]}</text>`);
          P[it.id].q = true; P[it.id].top = y - 8; P[it.id].bot = y + bh + 8;
        } else {
          const wl = it.w ? wrap(it.w, cpl + 2) : [], fit = Math.max(1, Math.floor((bh - 22 - wl.length * 18) / (fs + 4))), tl = clip(wrap(it.t, cpl), Math.min(fit, 4));
          const th = tl.length * (fs + 4) + (wl.length ? wl.length * 18 + 2 : 0), ty = cy - th / 2 + fs;
          out.push(`<rect x="${x}" y="${y}" width="${w}" height="${bh}" rx="10" fill="${it.bad ? COL.badf : f && f.kind === 'removed' ? '#F4F3F1' : COL.box}" stroke="${it.bad ? COL.bad : f && f.kind === 'removed' ? COL.rm : COL.line}" stroke-width="${it.bad ? 3.5 : 2.5}"${f && f.kind === 'removed' ? ' stroke-dasharray="8 6"' : ''}/>`,
            T(tl, cx, ty, fs + 4, `data-f="t" font-size="${fs}" font-weight="600" fill="${f && f.kind === 'removed' ? COL.rm : COL.ink}"`),
            wl.length ? T(wl, cx, ty + tl.length * (fs + 4) + 2, 18, `data-f="w" font-size="14" fill="${COL.mute}"`) : '',
            `<text x="${x + 10}" y="${y + 22}" font-size="15" font-weight="800" fill="${it.bad ? COL.bad : COL.mute}">${N[it.id]}</text>`);
          if (it.bad) out.push(`<text x="${x + w - 10}" y="${y + bh - 10}" data-f="bad" font-size="19" font-weight="800" fill="${COL.bad}" text-anchor="end">✗</text>`);
        }
        /* below the box: why people get stuck, or where a "no" leads */
        const below = P[it.id].bot + 12;
        if (it.bad && it.note) out.push(T(clip(wrap(it.note, Math.floor((w + 24) / 7.6)), 3), cx, below + 14, 18, `data-f="note" font-size="14.5" fill="${COL.bad}"`));
        if (it.k === 'q' && it.ifnot && it.go === 'stuck') {
          const ll = wrap('no: ' + it.ifnot, Math.floor(w / 8)).slice(0, 2);
          out.push(`<line data-f="ifnot" x1="${cx}" y1="${P[it.id].bot}" x2="${cx}" y2="${below + 4}" stroke="${COL.bad}" stroke-width="2.5"/>`,
            `<rect data-f="ifnot" x="${x + 6}" y="${below + 4}" width="${w - 12}" height="${ll.length * 18 + 26}" rx="6" fill="${COL.badf}" stroke="${COL.bad}" stroke-width="2"/>`,
            T(ll.map((l, i) => i === 0 ? '✗ ' + l : l), cx, below + 24, 18, `data-f="ifnot" font-size="14.5" font-weight="600" fill="${COL.bad}"`));
        }
        if (f) { const tag = f.kind === 'removed' ? 'removed' : `${f.kind} → ${f.to || 'wait'}`;
          const tw = tag.length * 8.6 + 18, c = f.kind === 'removed' ? COL.rm : f.kind === 'merged' || f.kind === 'moved' ? COL.loop : COL.ok;
          const tx = it.k === 'q' ? cx - tw / 2 : x + w - tw + 8, ty = it.k === 'q' ? P[it.id].bot - 4 : P[it.id].top - 15;
          out.push(`<rect data-f="why" x="${tx}" y="${ty}" width="${tw}" height="26" rx="13" fill="#fff" stroke="${c}" stroke-width="2"/>`,
            `<text data-f="why" x="${tx + tw / 2}" y="${ty + 18}" font-size="14" font-weight="700" fill="${c}" text-anchor="middle">${esc(tag)}</text>`); }
        out.push('</g>');
        prev = P[it.id]; x += w + gap;
      });
    });
    /* loops: a "no" that sends people back goes over the top */
    let lane = 0;
    items.forEach(it => { if (it.k !== 'q' || !it.ifnot || it.go !== 'back' || !P[it.back]) return;
      const a = P[it.id], b = P[it.back], ly = Math.min(a.top, b.top) - 30 - lane * 12; lane++;
      const d = `M${a.cx},${a.top} V${ly} H${b.x + 30} V${b.top - 2}`;
      out.push(`<g data-step="${esc(it.id)}"><path data-f="goback" d="${d}" fill="none" stroke="transparent" stroke-width="24"/><path data-f="goback" d="${d}" fill="none" stroke="${COL.loop}" stroke-width="2.5" marker-end="url(#al)"/></g>`,
        `<g data-step="${esc(it.id)}"><text data-f="ifnot" x="${(a.cx + b.cx) / 2}" y="${ly - 8}" font-size="15" font-weight="600" fill="${COL.loop}" text-anchor="middle">no: ${esc(it.ifnot)} — back to ${N[it.back]}</text></g>`); });
    return out.join('');
  }


  /* ---------- the Flow maker's diagram: boxes on a grid, with arrows that can branch and join ----------
     On top of the fields above, a step can have: k 'end' (a start or end pill), off (no number), c (a colour),
     br (a box reached only by an arrow, not the next in the list), to ('' the next step, '@none' it ends, or an id),
     p ({c, r}, where it was dragged to), aside (a side note). A question has ans: [{t, to, say}], where to is
     '' (the first answer: the next step; the others: not decided yet), '@stuck' or an id. */
  const PAL = { blue: ['#E6F0F8', '#1A5F8A'], green: ['#E3F0E8', '#2F7A50'], yellow: ['#FFF4D6', '#8A6100'], pink: ['#FBE6EC', '#A33A58'], purple: ['#EEE9F7', '#5B45A0'], grey: ['#EEECEA', '#6B6463'] };
  /* steps saved before questions could have several answers */
  function migrate(list) {
    (list || []).forEach(x => { if (x.k !== 'q' || x.ans) return;
      x.ans = [{ t: 'yes', to: '' }, x.go === 'back' && x.back && x.ifnot ? { t: 'no: ' + x.ifnot, to: x.back } : { t: 'no', to: x.ifnot ? '@stuck' : '', say: x.ifnot || '' }];
      delete x.ifnot; delete x.go; delete x.back; });
    return list;
  }
  const nextIn = (list, i) => { for (let j = i + 1; j < list.length; j++) if (!list[j].br) return list[j]; return null; };
  function arrowsOf(list) {
    const by = {}, out = []; list.forEach(x => { by[x.id] = x; });
    list.forEach((x, i) => { const nx = x.br ? null : nextIn(list, i);
      if (x.k === 'q') (x.ans || []).forEach((a, j) => { const to = a.to === '' ? (j === 0 ? nx : null) : by[a.to]; if (to) out.push({ from: x, to, j, label: a.t }); });
      else { const to = x.to === '@none' ? null : x.to ? by[x.to] : nx; if (to) out.push({ from: x, to, j: -1, label: '' }); } });
    return out;
  }
  /* an arrow goes back if it lands earlier in the list and, from there, you can already walk to where it left */
  function closesLoop(e, arrows, list) {
    if (list.indexOf(e.to) > list.indexOf(e.from)) return false;
    const seen = new Set(), walk = n => { if (n === e.from) return true; if (seen.has(n)) return false; seen.add(n); return arrows.some(a => a !== e && a.from === n && walk(a.to)); };
    return e.to !== e.from && walk(e.to);
  }
  /* where every box sits: where it was dragged, or along a row that turns back at the end, with
     a branch box under the question that leads to it */
  function cellsOf(list) {
    const P = {}, used = new Set(), key = (c, r) => c + ',' + r, put = (id, c, r) => { P[id] = { c, r }; used.add(key(c, r)); };
    list.forEach(x => { if (x.p) put(x.id, x.p.c, x.p.r); });
    const main = list.filter(x => !x.br), per = main.length <= 8 ? Math.max(1, main.length) : 7, step = list.some(x => x.br) ? 2 : 1;
    let c = -1, r = 0, dir = 1;
    main.forEach(x => {
      if (x.p) { c = x.p.c; r = x.p.r; return; }
      let n = c + dir;
      for (;;) { if (n < 0 || n >= per) { r += step; dir = -dir; n = Math.max(0, Math.min(per - 1, c)); } if (!used.has(key(n, r))) break; n += dir; }
      c = n; put(x.id, c, r);
    });
    const arrows = arrowsOf(list);
    for (let pass = 0; pass < 3; pass++) list.forEach(x => { if (!x.br || P[x.id]) return;
      const a = arrows.find(e => e.to === x && P[e.from.id]); if (!a && pass < 2) return;
      const o = a ? P[a.from.id] : { c: 0, r: Math.max(0, ...Object.values(P).map(q => q.r)) };
      for (const [dc, dr] of [[0, 1], [1, 1], [-1, 1], [0, 2], [1, 2], [-1, 2], [2, 1], [0, 3]]) { const cc = o.c + dc, rr = o.r + dr; if (cc >= 0 && !used.has(key(cc, rr))) { put(x.id, cc, rr); return; } } });
    return P;
  }
  function graph(list, x0, y0, bw0, bh0, o = {}) {
    const out = [], N = nums(list), F = o.F, head = o.label ? 82 : 0;
    if (o.label) out.push(`<text x="${x0}" y="${y0 + 26}" font-size="24" font-weight="800" letter-spacing="2" fill="${COL.ink}">${esc(o.label)}</text>`,
      `<text x="${x0}" y="${y0 + 56}" font-size="19" fill="${COL.mute}">${esc(o.sub || '')}</text>`);
    if (!list.length) { if (o.geo) Object.assign(o.geo, { fs: 0, lowered: false, fits: true }); out.push(`<text x="${x0}" y="${y0 + 120}" font-size="22" fill="${COL.mute}">Nothing here yet.</text>`); return out.join(''); }
    const cells = cellsOf(list), vals = Object.values(cells), C = Math.max(...vals.map(q => q.c)) + 1, R = Math.max(...vals.map(q => q.r)) + 1;
    const allArrows = arrowsOf(list);
    const goesDown = x => allArrows.some(e => e.from === x && cells[e.to.id].c === cells[x.id].c && cells[e.to.id].r > cells[x.id].r);
    const stuckUp = x => x.k === 'q' && goesDown(x) && (x.ans || []).some(a => a.to === '@stuck');
    const first = list.filter(x => cells[x.id].r === 0);
    const cw = Math.min(330, bw0 / C), left = x0 + (bw0 - C * cw) / 2, w = Math.max(cw - 76, cw * 0.68), qw = Math.min(w * 1.06, cw - 44), full = cw >= 260 ? 23 : cw >= 190 ? 18 : 15;
    /* the words in a diamond: the width that lets it be smallest, and a number above them stays clear */
    const inDiamond = (x, fs) => { let best = null; for (let f = 0.45; f < 0.85; f += 0.05) { const lines = fill(x.t, qw * f, fs - 1, 700), tall = lines.length * (fs + 2), h = Math.max(tall / Math.max(0.1, 1.1 - Math.max(...lines.map(l => wide(l, fs - 1, 700))) / qw), N[x.id] ? tall * 2 : 0); if (!best || h < best.h) best = { lines, h }; } return best; };
    /* everything at one text size: the lines of each box and what they need, and whether it all fits */
    const plan = fs => {
      const small = Math.min(14.5, fs - 1), lh = small + 3.5, side = Math.min(15, fs), say = {}, r0 = { side: 0, stuck: 0 };
      list.forEach(x => { const s = say[x.id] = {}, ww = x.k === 'q' ? qw : w;
        if (x.k === 'q') Object.assign(s, inDiamond(x, fs));
        else if (x.k === 'wait' || x.k === 'end') { s.lines = fill((x.k === 'wait' ? '⏱ ' : '') + x.t, ww - 30, x.k === 'wait' ? fs - 2 : fs, x.k === 'end' ? 700 : 400); s.h = s.lines.length * (fs + 2) + 14; }
        else { s.lines = fill(x.t, ww - 22, fs, 700); s.sub = x.w ? fill(x.w, ww - 16, fs - 3) : []; s.th = s.lines.length * (fs + 4) + s.sub.length * (fs + 1); s.h = s.th + 14; }
        s.note = x.bad && x.note ? fill(x.note, cw - 12, small) : [];
        s.stuck = x.k === 'q' ? (x.ans || []).map((a, j) => a.to === '@stuck' ? { j, lines: fill(`✗ ${a.t}${a.say ? ': ' + a.say : ''}`, ww - 24, small, 600) } : null).filter(Boolean) : [];
        s.stuck.forEach(b => { b.h = b.lines.length * lh + 22; });
        s.stack = s.stuck.reduce((n, b) => n + b.h + 6, 0);
        s.aside = x.aside ? fill(x.aside, w + 14, side) : []; s.ah = s.aside.length * (side + 4) + 16;
        const up = stuckUp(x), roof = Math.max(up ? s.stack + 12 : 0, x.aside ? s.ah + 22 + (up ? s.stack + 6 : 0) : 0), last = cells[x.id].r === R - 1 ? 31 : 0;
        s.gap = Math.max(x.k === 'q' ? 10 : 26, s.note.length ? s.note.length * lh + 20 + last : 0, !up && s.stack ? s.stack + 12 + last : 0, cells[x.id].r ? roof : 0);
        if (!cells[x.id].r) { if (x.aside) r0.side = Math.max(r0.side, s.ah + 16); if (up) r0.stuck = Math.max(r0.stuck, s.stack + 22); } });
      const top = y0 + head + (r0.side || 6) + r0.stuck + (allArrows.some(e => closesLoop(e, allArrows, list) && cells[e.from.id].r === 0) ? 34 : 6), vals = Object.values(say), rh = Math.min(Math.max(260, ...vals.map(s => s.h + s.gap)), (bh0 - (top - y0)) / R);
      const gap = Math.max(...vals.map(s => s.gap)), bh = Math.max(40, ...list.filter(x => x.k !== 'q' && x.k !== 'wait' && x.k !== 'end').map(x => say[x.id].h), Math.min(120, rh - 62, rh - gap));
      return { fs, small, lh, side, say, top, rh, bh, fits: vals.every(s => s.h + s.gap <= rh) };
    };
    /* nothing is cut: the words come down in size until they all fit */
    let L = plan(full); while (!L.fits && L.fs > 9) L = plan(L.fs - 1);
    const { fs, small, lh, side, say, top, rh, bh } = L;
    if (o.geo) Object.assign(o.geo, { left, top, cw, rh, C, R, cells, fs, lowered: fs < full, fits: L.fits });
    /* the shape of each box, for the arrows */
    const B = {}; list.forEach(x => { const q = cells[x.id], cx = left + q.c * cw + cw / 2, cy = top + q.r * rh + Math.min(rh, bh + 62) / 2;
      const s = say[x.id], ww = x.k === 'q' ? qw : w, hh = x.k === 'q' ? Math.max(s.h, Math.min(bh * 1.3, rh - s.gap)) : x.k === 'wait' ? Math.max(s.h, Math.min(68, bh)) : x.k === 'end' ? Math.max(s.h, Math.min(76, bh)) : bh;
      B[x.id] = { x, c: q.c, r: q.r, cx, cy, w: ww, h: hh, l: cx - ww / 2, rt: cx + ww / 2, t: cy - hh / 2, b: cy + hh / 2 }; });
    const all = Object.values(B);
    const hits = (pts, a, b) => { for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], lx = Math.min(x1, x2), hx = Math.max(x1, x2), ly = Math.min(y1, y2), hy = Math.max(y1, y2);
      if (all.some(n => n !== a && n !== b && lx < n.rt + 6 && hx > n.l - 6 && ly < n.b + 6 && hy > n.t - 6)) return true; } return false; };
    let lane = 0;
    function route(a, b, back) {
      const tries = [];
      if (a.r === b.r && !back) tries.push(b.c > a.c ? [[a.rt, a.cy], [b.l, b.cy]] : [[a.l, a.cy], [b.rt, b.cy]]);
      if (a.c === b.c) tries.push(b.r > a.r ? [[a.cx, a.b], [b.cx, b.t]] : [[a.cx, a.t], [b.cx, b.b]]);
      if (b.r > a.r) { const g = b.t - 20; tries.push([[a.cx, a.b], [a.cx, g], [b.cx, g], [b.cx, b.t]]); tries.push([[b.cx > a.cx ? a.rt : a.l, a.cy], [b.cx, a.cy], [b.cx, b.t]]); }
      if (b.r < a.r) { const g = b.b + 20; tries.push([[a.cx, a.t], [a.cx, g], [b.cx, g], [b.cx, b.b]]); tries.push([[b.cx > a.cx ? a.rt : a.l, a.cy], [b.cx, a.cy], [b.cx, b.b]]); }
      const over = Math.min(a.t, b.t) - 22 - lane * 13, under = Math.max(a.b, b.b) + 22 + lane * 13;
      tries.push([[a.cx, a.t], [a.cx, over], [b.cx, over], [b.cx, b.t]], [[a.cx, a.b], [a.cx, under], [b.cx, under], [b.cx, b.b]]);
      const p = tries.find(t => !hits(t, a, b)) || tries[tries.length - 2]; if (p.length > 2 && a.r === b.r) lane++;
      return p;
    }
    const index = {}, labels = []; list.forEach((x, i) => { index[x.id] = i; });
    arrowsOf(list).forEach(e => { const a = B[e.from.id], b = B[e.to.id]; if (a === b) return;
      const back = closesLoop(e, allArrows, list), col = back ? COL.loop : COL.line, pts = route(a, b, back), d = 'M' + pts.map(q => q.map(n => +n.toFixed(1)).join(',')).join(' L');
      /* the head stops just short of the box */
      const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], len = Math.hypot(ex - px, ey - py) || 1, end = pts.slice(0, -1).concat([[ex - (ex - px) / len * 4, ey - (ey - py) / len * 4]]), d2 = 'M' + end.map(q => q.map(n => +n.toFixed(1)).join(',')).join(' L');
      out.push(`<g data-edge="${esc(e.from.id)}" data-i="${e.j}"><path d="${d}" fill="none" stroke="transparent" stroke-width="24"/><path d="${d2}" fill="none" stroke="${col}" stroke-width="2.5" marker-end="url(#${back ? 'al' : 'ah'})"/>`);
      out.push('</g>');
      if (e.label) { const run = back && pts.length > 3 ? 1 : 0, [sx, sy] = pts[run], [nx, ny] = pts[run + 1], flat = sy === ny, lx = flat ? (sx + nx) / 2 : sx + 9, ly = flat ? sy - 10 : sy + Math.min(30, Math.abs(ny - sy) / 2 + 5) * (ny > sy ? 1 : -1);
        labels.push(`<g data-edge="${esc(e.from.id)}" data-i="${e.j}"><text data-f="ans:${e.j}" x="${lx}" y="${ly}" font-size="${Math.max(15, fs - 3)}" fill="${back ? COL.loop : COL.mute}" stroke="#fff" stroke-width="5" paint-order="stroke" text-anchor="${flat ? 'middle' : 'start'}">${esc(e.label)}</text></g>`); } });
    list.forEach(x => { const n = B[x.id], { cx, cy, w: ww, h: hh, l, t: ty } = n, f = F && F[x.id], pal = PAL[x.c], rm = f && f.kind === 'removed';
      const fill = x.bad ? COL.badf : rm ? '#F4F3F1' : pal ? pal[0] : x.k === 'q' ? COL.q : x.k === 'wait' ? COL.wait : COL.box, edge = x.bad ? COL.bad : rm ? COL.rm : pal ? pal[1] : x.k === 'q' ? COL.qs : x.k === 'wait' ? COL.mute : COL.line, ink = rm ? COL.rm : COL.ink;
      const s = say[x.id];
      out.push(`<g data-step="${esc(x.id)}">`);
      if (x.k === 'q') { const ql = s.lines;
        out.push(`<polygon points="${cx},${ty} ${n.rt},${cy} ${cx},${n.b} ${l},${cy}" fill="${fill}" stroke="${edge}" stroke-width="2.5"/>`,
          T(ql, cx, cy - (ql.length - 1) * (fs + 2) / 2 + fs * 0.35, fs + 2, `data-f="t" font-size="${fs - 1}" font-weight="700" fill="${ink}"`),
          N[x.id] ? `<text x="${cx}" y="${ty + hh * 0.25}" font-size="${fs - 3}" font-weight="800" fill="${edge}" text-anchor="middle">${N[x.id]}</text>` : '');
      } else if (x.k === 'wait' || x.k === 'end') { const tl = s.lines;
        out.push(`<rect x="${l}" y="${ty}" width="${ww}" height="${hh}" rx="${Math.min(hh / 2, 38)}" fill="${fill}" stroke="${edge}" stroke-width="${x.k === 'end' ? 3 : 2}"${x.k === 'wait' ? ' stroke-dasharray="7 6"' : ''}/>`,
          T(tl, cx, cy - (tl.length - 1) * (fs + 2) / 2 + fs * 0.35, fs + 2, `data-f="t" font-size="${x.k === 'wait' ? fs - 2 : fs}" font-weight="${x.k === 'end' ? 700 : 400}"${x.k === 'wait' ? ' font-style="italic"' : ''} fill="${x.k === 'wait' ? COL.mute : ink}"`));
      } else { const sub = s.sub, tl = s.lines, y1 = cy - s.th / 2 + fs * 0.9;
        out.push(`<rect x="${l}" y="${ty}" width="${ww}" height="${hh}" rx="11" fill="${fill}" stroke="${edge}" stroke-width="${x.bad ? 3.5 : 2.5}"${rm ? ' stroke-dasharray="8 6"' : ''}/>`,
          T(tl, cx, y1, fs + 4, `data-f="t" font-size="${fs}" font-weight="700" fill="${ink}"`),
          sub.length ? T(sub, cx, y1 + tl.length * (fs + 4) + 1, fs + 1, `data-f="w" font-size="${fs - 3}" fill="${COL.mute}"`) : '',
          N[x.id] ? `<text x="${l + 10}" y="${ty + fs + 3}" font-size="${fs - 2}" font-weight="800" fill="${x.bad ? COL.bad : edge === COL.line ? COL.mute : edge}">${N[x.id]}</text>` : '');
        if (x.bad) out.push(`<text x="${n.rt - 10}" y="${n.b - 9}" data-f="bad" font-size="19" font-weight="800" fill="${COL.bad}" text-anchor="end">✗</text>`);
      }
      const below = n.b + 8;
      if (s.note.length) out.push(T(s.note, cx, below + 14, lh, `data-f="note" font-size="${small}" fill="${COL.bad}"`));
      const up = stuckUp(x); let stack = 0;
      s.stuck.forEach(({ j, lines: ll, h: bxh }) => { const by = up ? ty - 12 - stack - bxh : below + 4 + stack;
        out.push(`<line data-f="say:${j}" x1="${cx}" y1="${up ? ty : n.b}" x2="${cx}" y2="${up ? by + bxh : by}" stroke="${COL.bad}" stroke-width="2.5"/>`, `<rect data-f="say:${j}" x="${l + 6}" y="${by}" width="${ww - 12}" height="${bxh}" rx="6" fill="${COL.badf}" stroke="${COL.bad}" stroke-width="2"/>`,
          T(ll, cx, by + 18, lh, `data-f="say:${j}" font-size="${small}" font-weight="600" fill="${COL.bad}"`)); stack += bxh + 6; });
      if (f) { const tag = rm ? 'removed' : `${f.kind} → ${f.to || 'wait'}`, tw = tag.length * 8.6 + 18, c = rm ? COL.rm : f.kind === 'merged' || f.kind === 'moved' ? COL.loop : COL.ok, tx = x.k === 'q' ? cx - tw / 2 : n.rt - tw + 8, py = x.k === 'q' ? n.b - 4 : ty - 15;
        out.push(`<rect data-f="why" x="${tx}" y="${py}" width="${tw}" height="26" rx="13" fill="#fff" stroke="${c}" stroke-width="2"/>`, `<text data-f="why" x="${tx + tw / 2}" y="${py + 18}" font-size="14" font-weight="700" fill="${c}" text-anchor="middle">${esc(tag)}</text>`); }
      out.push('</g>');
      /* a side note, joined by a plain line: it takes no step */
      if (x.aside) { const al = s.aside, ah = s.ah, aw = w + 30, ax = Math.max(left, cx - aw - 6), ay = ty - ah - 22 - (up ? stack + 6 : 0);
        out.push(`<g data-step="${esc(x.id)}"><line data-f="aside" x1="${ax + aw - 14}" y1="${ay + ah}" x2="${cx}" y2="${ty + (x.k === 'q' ? 0 : 1)}" stroke="${COL.mute}" stroke-width="2"/><rect data-f="aside" x="${ax}" y="${ay}" width="${aw}" height="${ah}" rx="8" fill="#fff" stroke="${COL.mute}" stroke-width="2"/>`,
          T(al, ax + aw / 2, ay + 22, side + 4, `data-f="aside" font-size="${side}" fill="${COL.ink}"`), '</g>'); }
    });
    return out.concat(labels).join('');
  }

  /* a diagram on its own, for a slide */
  const sheet = (list, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="${FONT}" role="img">${DEFS}<rect width="100%" height="100%" fill="#fff"/>${graph(list, 16, 8, w - 32, h - 16)}</svg>`;

  const DEFS = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COL.line}"/></marker>
      <marker id="al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COL.loop}"/></marker></defs>`;
  const FONT = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
  /* a small drawing for teaching: one row, sized to what is in it */
  const units = list => list.reduce((s, x) => s + (x.k === 'wait' ? 0.72 : x.k === 'q' ? 1.3 : 1), 0);
  const rowW = list => Math.round(units(list) * 230 + Math.max(0, list.length - 1) * 54);
  const notes = list => list.some(x => (x.bad && x.note) || (x.k === 'q' && x.ifnot && x.go === 'stuck'));
  function mini(list, F) {
    const loop = list.some(x => x.k === 'q' && x.ifnot && x.go === 'back'), bw0 = rowW(list), bh0 = 214 + (loop ? 40 : 14) - (notes(list) ? 0 : 30), P = 20;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bw0 + 2 * P} ${bh0 + P}" font-family="${FONT}" role="img">${DEFS}<rect width="100%" height="100%" fill="#fff"/>${band(list, P, P - 4, bw0, bh0, '', '', F, true)}</svg>`;
  }
  /* now above, your version below, with what happened to every step */
  function pair(before, after) {
    const F = fatesOf(before, after), bw0 = Math.max(rowW(before), rowW(after)), P = 20;
    const hb = 82 + 214 + (before.some(x => x.k === 'q' && x.go === 'back' && x.ifnot) ? 40 : 14) - (notes(before) ? 0 : 30), ha = 82 + 214 + 14 - (notes(after) ? 0 : 30);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bw0 + 2 * P} ${hb + ha + 2 * P}" font-family="${FONT}" role="img">${DEFS}<rect width="100%" height="100%" fill="#fff"/>
      ${band(before, P, P, bw0, hb, 'NOW', '', F, true)}<line x1="${P}" y1="${P + hb}" x2="${bw0 + P}" y2="${P + hb}" stroke="#DFDBD7" stroke-width="2"/>${band(after, P, P + hb + 12, bw0, ha, 'YOUR VERSION', '', null, true)}</svg>`;
  }
  window.FD = { esc, nums, counts, fatesOf, wrap, clip, fill, T, COL, band, DEFS, FONT, mini, pair, rowW, PAL, migrate, arrowsOf, cellsOf, graph, sheet };
})();
