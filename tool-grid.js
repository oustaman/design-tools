/* The grid behind the Blueprint, Plan and Decision makers: columns across, lanes down, one note per
   line typed into a cell. The slide is drawn from that. Text is never cut: the size comes down until
   everything fits, and the tool says so when it gets too small to read on a call.
   GridTool({key, tag, name, what, kicker, colWord, laneWord, titleHint, blank(), example(), help, tidy(s), notes(r, c, S, typed)}).
   A column can have w (its share of the width), tone (over the lane's), and choice (words to pick from);
   a lane can have scale (words from best to worst, drawn as a line across the columns). */
window.GridTool = function (cfg) {
  const { FONT, INK, MUTE, LINE, TONES, esc, $, wrap, tspans } = window.Slide;
  const W = 1920, H = 1080, M = 56, LAB = 200, READABLE = 18, BIG = 26, SMALL = 14;
  let uid = 1; const nid = p => p + (uid++) + '-' + Date.now().toString(36);

  function tidy(s) {
    if (!s || !Array.isArray(s.cols) || !Array.isArray(s.rows)) return null;
    s.title = s.title || ''; s.cells = s.cells || {}; s.view = s.view || 'both';
    if (cfg.tidy) cfg.tidy(s);
    return s;
  }
  let S = tidy(window.Slide.load(cfg.key)) || cfg.blank();
  const save = () => window.Slide.store(cfg.key, S);
  const hist = window.Slide.history(() => S, v => { S = tidy(v); });
  const cellKey = (r, c) => r + '|' + c;
  const notesIn = t => String(t || '').split('\n').map(x => x.trim()).filter(Boolean);
  const notesOf = (r, c) => { const typed = notesIn(S.cells[cellKey(r.id, c.id)]); return cfg.notes ? cfg.notes(r, c, S, typed) : typed; };
  const scaleTone = (r, i) => { const at = i / Math.max(1, r.scale.length - 1); return TONES[at < 0.4 ? 'green' : at <= 0.6 ? 'amber' : 'red']; };

  document.body.insertAdjacentHTML('afterbegin', `
  <header class="tb-bar">
    <a class="tb-back" href="index.html">← All tools</a>
    <h1 class="tb-name">${esc(cfg.name)}</h1>
    <span class="seg" role="group" aria-label="View"><button type="button" data-act="view" data-v="both">Both</button><button type="button" data-act="view" data-v="edit">Edit</button><button type="button" data-act="view" data-v="slide">Slide</button></span>
    <span class="gt-msg" id="msg" role="status"></span>
    <span class="tb-sp"></span>
    <button type="button" class="tbtn" data-act="undo" id="undo" title="Undo (Ctrl or ⌘ Z)">Undo</button>
    <button type="button" class="tbtn" data-act="redo" id="redo" title="Redo (Ctrl or ⌘ Shift Z)">Redo</button>
    <button type="button" class="tbtn" data-act="savebox" aria-haspopup="dialog">Save</button>
    <button type="button" class="tbtn pri" data-act="png">Copy the slide</button>
    <details class="menu"><summary class="tbtn">More</summary><div class="menu-in">
      <button type="button" data-act="dl">Download the slide as a PNG</button>
      <button type="button" data-act="table">Copy as a table</button>
      <button type="button" data-act="example">See the example</button>
      <button type="button" data-act="clear">Start again</button>
    </div></details>
    <button type="button" class="tbtn" data-act="help" aria-haspopup="dialog">Help</button>
  </header>
  <div class="gt-main" id="main">
    <section class="gt-edit" aria-label="Edit">
      <div class="gt-top"><label for="title">What is this for?</label><input id="title" type="text" placeholder="${esc(cfg.titleHint)}"></div>
      <div id="grid"></div>
      <div class="gt-add"><button type="button" class="tbtn xs" data-act="addcol">+ Add a ${esc(cfg.colWord)}</button><button type="button" class="tbtn xs" data-act="addrow">+ Add a ${esc(cfg.laneWord)}</button></div>
    </section>
    <section class="gt-prev" aria-label="The slide"><p class="gt-note" id="fit" role="status"></p><div id="slide"></div></section>
  </div>
  ${window.Slide.saveDialog(cfg.tag, cfg.what)}
  <dialog class="dlg" id="helpdlg" aria-labelledby="helpdlg-h"><form method="dialog"><h2 id="helpdlg-h">How it works</h2>${cfg.help}
    <p>Your work stays in this browser: press <b>Save</b> to keep it as text and carry on anywhere.</p>
    <div class="dlg-acts"><button class="tbtn pri" value="close">Got it</button></div></form></dialog>`);

  /* ---------- the slide ---------- */
  function laneRows() { return S.rows.filter(r => !r.hidden); }
  function layout(fs) {
    const rows = laneRows(), n = Math.max(1, S.cols.length), lh = fs * 1.24, padX = Math.round(fs * 0.5), padY = Math.round(fs * 0.38), gap = Math.round(fs * 0.34);
    const room = W - 2 * M - LAB - 8 * n, shares = S.cols.reduce((a, c) => a + (c.w || 1), 0) || 1, widths = S.cols.map(c => room * (c.w || 1) / shares), xs = widths.map((_, i) => M + LAB + widths.slice(0, i).reduce((a, b) => a + b + 8, 0));
    const titleLines = wrap(S.title, W - 2 * M, 42, 700);
    let y = M + 30 + titleLines.length * 50 + 14;
    const headFs = Math.max(fs, 18), heads = S.cols.map((c, i) => wrap(c.name, widths[i] - 16, headFs, 700)), headH = Math.max(1, ...heads.map(h => h.length)) * headFs * 1.2 + 16;
    const top = y; y += headH + 8;
    const laid = rows.map(r => {
      const label = wrap(r.name, LAB - 24, Math.max(fs, 18), 700), labH = label.length * Math.max(fs, 18) * 1.2 + 12;
      const cols = r.scale ? S.cols.map(() => []) : S.cols.map((c, i) => notesOf(r, c).map(t => { const lines = wrap(t, widths[i] - 2 * padX - 8, fs); return { lines, h: lines.length * lh + 2 * padY }; }));
      const step = fs * 1.5, tall = r.scale ? Math.max(labH, (r.scale.length - 1) * step + fs * 2) : Math.max(labH, fs * 2, ...cols.map(ns => ns.reduce((a, b) => a + b.h, 0) + Math.max(0, ns.length - 1) * gap));
      const out = { r, label, cols, y, h: tall + 8 };
      y += out.h + 6 + (r.line ? 30 : 0);
      return out;
    });
    return { fs, lh, padX, padY, gap, widths, xs, titleLines, top, headFs, heads, headH, laid, bottom: y + 10 };
  }
  function pick() {
    for (let fs = BIG; fs >= SMALL; fs--) { const l = layout(fs); if (l.bottom <= H - M + 20) return { l, h: H }; }
    const l = layout(SMALL); return { l, h: Math.ceil(l.bottom + M) };
  }
  function draw() {
    const { l, h } = pick(), right = W - M;
    let g = `<text x="${M}" y="${M + 18}" font-size="20" font-weight="700" fill="${MUTE}" letter-spacing="2">${esc(cfg.kicker)}</text>`;
    g += `<text font-size="42" font-weight="700" fill="${INK}">${tspans(l.titleLines, M, M + 68, 50)}</text>`;
    S.cols.forEach((c, i) => {
      const x = l.xs[i];
      g += `<rect x="${x}" y="${l.top}" width="${l.widths[i]}" height="${l.headH}" rx="6" fill="#1A1618"/>`;
      g += `<text font-size="${l.headFs}" font-weight="700" fill="#fff">${tspans(l.heads[i], x + 10, l.top + l.headFs + 3, l.headFs * 1.2)}</text>`;
    });
    l.laid.forEach(row => {
      const lfs = Math.max(l.fs, 18);
      g += `<rect x="${M}" y="${row.y}" width="${right - M}" height="${row.h}" rx="6" fill="#F5F4F2"/>`;
      g += `<text font-size="${lfs}" font-weight="700" fill="${INK}">${tspans(row.label, M + 10, row.y + lfs + 2, lfs * 1.2)}</text>`;
      /* a scale: the line across the columns, with its word at every point so it reads in black and white */
      if (row.r.scale) {
        const step = l.fs * 1.5, spots = S.cols.map((c, i) => ({ i, at: row.r.scale.indexOf(S.cells[cellKey(row.r.id, c.id)]) })).filter(p => p.at >= 0).map(p => ({ ...p, x: l.xs[p.i] + l.widths[p.i] / 2, y: row.y + l.fs * 1.5 + p.at * step }));
        if (spots.length > 1) g += `<polyline points="${spots.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" stroke="${INK}" stroke-width="3"/>`;
        spots.forEach(p => { const tone = scaleTone(row.r, p.at);
          g += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(l.fs * 0.36).toFixed(1)}" fill="${tone[0]}" stroke="${tone[1]}" stroke-width="3"/><text x="${p.x.toFixed(1)}" y="${(p.y - l.fs * 0.55).toFixed(1)}" font-size="${l.fs}" font-weight="600" fill="${INK}" stroke="#F5F4F2" stroke-width="5" paint-order="stroke" text-anchor="middle">${esc(row.r.scale[p.at])}</text>`; });
      }
      row.cols.forEach((notes, i) => {
        let y = row.y + 4; const x = l.xs[i], tone = TONES[S.cols[i].tone || row.r.tone] || TONES.white;
        notes.forEach(n => {
          g += `<rect x="${x + 4}" y="${y.toFixed(1)}" width="${l.widths[i] - 8}" height="${n.h.toFixed(1)}" rx="5" fill="${tone[0]}" stroke="${tone[1]}" stroke-width="1.5"/>`;
          g += `<text font-size="${l.fs}" fill="${INK}">${tspans(n.lines, x + 4 + l.padX, y + l.padY + l.fs * 0.92, l.lh)}</text>`;
          y += n.h + l.gap;
        });
      });
      if (row.r.line) {
        const ly = row.y + row.h + 18;
        g += `<line x1="${M}" y1="${ly}" x2="${right}" y2="${ly}" stroke="${LINE}" stroke-width="2.5" stroke-dasharray="10 7"/>`;
        const tw = window.Slide.width(row.r.line, 17, 700) + 20;
        g += `<rect x="${right - tw}" y="${ly - 13}" width="${tw}" height="26" fill="#fff"/><text x="${right - 10}" y="${ly + 6}" font-size="17" font-weight="700" fill="${MUTE}" text-anchor="end">${esc(row.r.line)}</text>`;
      }
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" font-family='${FONT}' class="gt-slide" role="img" aria-label="${esc(S.title || cfg.name)}"><rect width="${W}" height="${h}" fill="#fff"/>${g}</svg>`;
    $('slide').innerHTML = svg;
    const note = $('fit');
    note.classList.toggle('warn', l.fs < READABLE || h > H);
    note.textContent = h > H ? `Taller than a slide even at the smallest text (${l.fs}). Hide a ${cfg.laneWord}, drop a ${cfg.colWord} or cut words.`
      : l.fs < READABLE ? `Text is down to ${l.fs}, which is hard to read on a call. Hide a ${cfg.laneWord}, drop a ${cfg.colWord} or cut words.`
      : `All your words fit, at text size ${l.fs}.`;
    current = { svg, h };
  }
  let current = { svg: '', h: H };

  /* ---------- the editor ---------- */
  function renderGrid() {
    const n = S.cols.length, m = S.rows.length;
    const head = S.cols.map((c, i) => `<th scope="col"><input type="text" data-f="col" data-id="${c.id}" value="${esc(c.name)}" aria-label="${esc(cfg.colWord)} ${i + 1} name"><div class="gt-ctl">
      <button type="button" data-act="coll" data-id="${c.id}" aria-label="Move ${esc(c.name)} earlier" ${i ? '' : 'disabled'}>←</button><button type="button" data-act="colr" data-id="${c.id}" aria-label="Move ${esc(c.name)} later" ${i < n - 1 ? '' : 'disabled'}>→</button><button type="button" data-act="coldel" data-id="${c.id}" aria-label="Remove ${esc(c.name)}" ${n > 1 ? '' : 'disabled'}>×</button></div></th>`).join('');
    const body = S.rows.map((r, j) => `<tr class="${r.hidden ? 'off' : ''}"><th scope="row"><input type="text" data-f="row" data-id="${r.id}" value="${esc(r.name)}" aria-label="${esc(cfg.laneWord)} ${j + 1} name"><div class="gt-ctl">
        <label><input type="checkbox" data-f="show" data-id="${r.id}" ${r.hidden ? '' : 'checked'}> On slide</label>
        <button type="button" data-act="rowu" data-id="${r.id}" aria-label="Move ${esc(r.name)} up" ${j ? '' : 'disabled'}>↑</button><button type="button" data-act="rowd" data-id="${r.id}" aria-label="Move ${esc(r.name)} down" ${j < m - 1 ? '' : 'disabled'}>↓</button><button type="button" data-act="rowdel" data-id="${r.id}" aria-label="Remove ${esc(r.name)}" ${m > 1 ? '' : 'disabled'}>×</button></div></th>
      ${S.cols.map(c => { const v = S.cells[cellKey(r.id, c.id)] || '', words = r.scale || c.choice, tag = `data-f="cell" data-r="${r.id}" data-c="${c.id}" aria-label="${esc(r.name)}, ${esc(c.name)}"`;
        return `<td>${words ? `<select ${tag}><option value="">Not set</option>${words.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>` : `<textarea ${tag} rows="2" style="background:${(TONES[c.tone || r.tone] || TONES.white)[0]}">${esc(v)}</textarea>`}</td>`; }).join('')}</tr>`).join('');
    $('grid').innerHTML = `<table class="gt-grid"><thead><tr><th>One note per line</th>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }
  function renderAll() {
    armed = true; $('title').value = S.title; renderGrid(); chrome(); draw(); save();
  }
  function chrome() {
    $('main').className = 'gt-main ' + S.view;
    document.querySelectorAll('[data-act="view"]').forEach(b => { const on = b.dataset.v === S.view; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    const [u, r] = hist.can(); $('undo').disabled = !u; $('redo').disabled = !r;
  }
  const say = t => { $('msg').textContent = t; clearTimeout(say.t); say.t = setTimeout(() => { $('msg').textContent = ''; }, 3500); };
  const move = (list, id, d) => { const i = list.findIndex(x => x.id === id), j = i + d; if (i < 0 || j < 0 || j >= list.length) return; [list[i], list[j]] = [list[j], list[i]]; };

  /* one undo step per field: the first keystroke after arriving in it */
  let armed = true;
  document.addEventListener('focusin', e => { if (e.target.matches('input,textarea,select')) armed = true; });
  document.addEventListener('input', e => {
    const t = e.target, f = t.dataset.f || (t.id === 'title' ? 'title' : null); if (!f) return;
    if (armed) { hist.snap(); armed = false; }
    if (f === 'title') S.title = t.value;
    if (f === 'col') S.cols.find(c => c.id === t.dataset.id).name = t.value;
    if (f === 'row') S.rows.find(r => r.id === t.dataset.id).name = t.value;
    if (f === 'cell') S.cells[cellKey(t.dataset.r, t.dataset.c)] = t.value;
    if (f === 'show') return;
    chrome(); draw(); save();
  });
  document.addEventListener('change', e => { const t = e.target; if (t.dataset.f !== 'show') return; hist.snap(); S.rows.find(r => r.id === t.dataset.id).hidden = !t.checked; renderAll(); });

  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b) return; const act = b.dataset.act, id = b.dataset.id;
    const change = fn => { hist.snap(); fn(); renderAll(); };
    if (act === 'view') { S.view = b.dataset.v; chrome(); draw(); save(); return; }
    if (act === 'undo') { if (hist.undo()) renderAll(); return; }
    if (act === 'redo') { if (hist.redo()) renderAll(); return; }
    if (act === 'addcol') return change(() => S.cols.push({ id: nid('c'), name: cfg.colName(S.cols.length + 1) }));
    if (act === 'addrow') return change(() => S.rows.push({ id: nid('r'), name: 'New ' + cfg.laneWord, tone: 'white' }));
    if (act === 'coll') return change(() => move(S.cols, id, -1));
    if (act === 'colr') return change(() => move(S.cols, id, 1));
    if (act === 'rowu') return change(() => move(S.rows, id, -1));
    if (act === 'rowd') return change(() => move(S.rows, id, 1));
    if (act === 'coldel' || act === 'rowdel') {
      const used = act === 'coldel' ? S.rows.some(r => S.cells[cellKey(r.id, id)]) : S.cols.some(c => S.cells[cellKey(id, c.id)]);
      return change(() => {
        if (act === 'coldel') S.cols = S.cols.filter(c => c.id !== id); else S.rows = S.rows.filter(r => r.id !== id);
        if (used) say('Removed. Undo brings it back.');
      });
    }
    if (act === 'png') return window.Slide.copyPicture(window.Slide.pngOf(current.svg, W, current.h), cfg.tag.toLowerCase() + '.png', say);
    if (act === 'dl') { b.closest('details').open = false; try { window.Slide.download(await window.Slide.pngOf(current.svg, W, current.h), cfg.tag.toLowerCase() + '.png'); } catch (x) { say('That did not work in this browser.'); } return; }
    if (act === 'table') { b.closest('details').open = false; const rows = laneRows(), hd = ['', ...S.cols.map(c => c.name)];
      const body = rows.map(r => [r.name, ...S.cols.map(c => r.scale ? (S.cells[cellKey(r.id, c.id)] || '') : notesOf(r, c).join('; '))]);
      const html = `<table border="1"><tr>${hd.map(x => `<th>${esc(x)}</th>`).join('')}</tr>${body.map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table>`;
      return window.Slide.copyTable(html, [hd, ...body].map(r => r.join('\t')).join('\n'), say); }
    if (act === 'example') { b.closest('details').open = false; return change(() => { S = cfg.example(); say('The example is in. Undo brings your work back.'); }); }
    if (act === 'clear') { b.closest('details').open = false; return change(() => { S = cfg.blank(); say('Cleared. Undo brings it back.'); }); }
    if (act === 'help') return $('helpdlg').showModal();
    if (act === 'savebox') { $('savecode').value = window.Slide.encode(cfg.tag, S); $('savemsg').textContent = ''; return $('savedlg').showModal(); }
    if (act === 'savecopy') return window.Slide.copyText($('savecode').value, t => { $('savemsg').textContent = t; });
    if (act === 'loadcode') { const got = tidy(window.Slide.decode(cfg.tag, $('loadcode').value)); if (!got) { $('savemsg').textContent = `That text didn’t open. It starts with ${cfg.tag}, and part of it may have been cut off.`; return; } hist.snap(); S = got; renderAll(); $('savedlg').close(); say('Your work is back.'); }
  });
  addEventListener('keydown', e => {
    if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z' || e.altKey) return;
    e.preventDefault(); if (e.shiftKey ? hist.redo() : hist.undo()) renderAll();
  });

  renderAll();
};
