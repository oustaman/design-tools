/* What the slide tools share (Blueprint maker, Plan maker, 2×2 maker): measuring and wrapping words so
   nothing is ever cut off, turning an SVG slide into a PNG, the clipboard, saving as text, and the
   page furniture every tool repeats. */
window.Slide = (function () {
  const FONT = '-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif';
  const INK = '#1A1618', MUTE = '#514B4A', LINE = '#8E8685';
  const TONES = {
    blue: ['#E4EEF3', '#1A526D'], green: ['#E3EFE7', '#285638'], amber: ['#F4EAD3', '#684604'],
    red: ['#FCEAE8', '#B3261E'], grey: ['#EDEBE8', '#514B4A'], white: ['#FFFFFF', '#8E8685'],
  };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const $ = id => document.getElementById(id);

  const ctx = document.createElement('canvas').getContext('2d');
  const width = (t, fs, w = 400) => { ctx.font = `${w} ${fs}px ${FONT}`; return ctx.measureText(t).width; };
  /* every word kept: a word too long for the line is broken across lines, never dropped */
  function wrap(text, maxW, fs, w = 400) {
    const out = [];
    String(text == null ? '' : text).split('\n').forEach(par => {
      let line = '';
      par.split(/\s+/).filter(Boolean).forEach(word => {
        const tried = line ? line + ' ' + word : word;
        if (width(tried, fs, w) <= maxW) { line = tried; return; }
        if (line) out.push(line);
        line = '';
        while (width(word, fs, w) > maxW && word.length > 1) {
          let n = word.length - 1;
          while (n > 1 && width(word.slice(0, n), fs, w) > maxW) n--;
          out.push(word.slice(0, n)); word = word.slice(n);
        }
        line = word;
      });
      if (line) out.push(line);
    });
    return out;
  }
  const tspans = (lines, x, y, lh) => lines.map((l, i) => `<tspan x="${x}" y="${(y + i * lh).toFixed(1)}">${esc(l)}</tspan>`).join('');

  /* a PNG of the slide, at twice its size so it stays sharp when shared on a call */
  function pngOf(svg, W, H) {
    return new Promise((ok, no) => {
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })), im = new Image();
      im.onload = () => { const c = document.createElement('canvas'), k = 2; c.width = W * k; c.height = H * k; const m = c.getContext('2d'); m.fillStyle = '#fff'; m.fillRect(0, 0, c.width, c.height); m.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); c.toBlob(b => (b ? ok(b) : no(new Error('no picture'))), 'image/png'); };
      im.onerror = () => { URL.revokeObjectURL(url); no(new Error('no picture')); };
      im.src = url;
    });
  }
  function download(blob, name) { const a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 5000); }
  /* the clipboard where the browser allows it, otherwise the file */
  async function copyPicture(blobPromise, name, say) {
    try {
      if (!window.ClipboardItem || !navigator.clipboard || !navigator.clipboard.write) throw new Error('no clipboard');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);
      say('Copied. Paste it into your slide.');
    } catch (e) {
      try { download(await blobPromise, name); say('This browser would not copy it, so it downloaded instead.'); } catch (e2) { say('That did not work in this browser.'); }
    }
  }
  async function copyText(text, say, done = 'Copied.') { try { await navigator.clipboard.writeText(text); say(done); } catch (e) { say('Copy did not work in this browser.'); } }
  async function copyTable(html, text, say) {
    try { await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([text], { type: 'text/plain' }) })]); say('Table copied.'); }
    catch (e) { copyText(text, say, 'Copied as plain text.'); }
  }

  /* saving as text: the whole state in one line, to keep anywhere and paste back */
  const b64 = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = t => new TextDecoder().decode(Uint8Array.from(atob(t.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));
  const encode = (tag, state) => tag + b64(JSON.stringify(state));
  function decode(tag, text) { const m = String(text).replace(/\s+/g, '').match(new RegExp(tag + '([\\w-]+)')); if (!m) return null; try { return JSON.parse(unb64(m[1])); } catch (e) { return null; } }

  const load = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } };
  const store = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} };

  /* undo and redo over whole states, which is plenty at this size */
  function history(get, set) {
    const back = [], fwd = [];
    return {
      snap() { back.push(JSON.stringify(get())); if (back.length > 200) back.shift(); fwd.length = 0; },
      undo() { if (!back.length) return false; fwd.push(JSON.stringify(get())); set(JSON.parse(back.pop())); return true; },
      redo() { if (!fwd.length) return false; back.push(JSON.stringify(get())); set(JSON.parse(fwd.pop())); return true; },
      can: () => [back.length > 0, fwd.length > 0],
    };
  }

  const saveDialog = (tag, what) => `<dialog class="dlg" id="savedlg" aria-labelledby="savedlg-h"><form method="dialog">
    <h2 id="savedlg-h">Save your work as text</h2>
    <p>Your ${what} stays in this browser. Copy this text and keep it anywhere, like a note or an email to yourself.</p>
    <textarea id="savecode" class="dlg-ta" rows="4" readonly aria-label="Your work, as text"></textarea>
    <p><button type="button" class="tbtn xs pri" data-act="savecopy">Copy the text</button></p>
    <p><label for="loadcode"><b>Carrying on?</b> Paste your saved text here.</label></p>
    <textarea id="loadcode" class="dlg-ta" rows="3" spellcheck="false" placeholder="${tag}…"></textarea>
    <p><button type="button" class="tbtn xs" data-act="loadcode">Bring it back</button></p>
    <p id="savemsg" role="status"></p>
    <div class="dlg-acts"><button class="tbtn" value="close">Close</button></div>
  </form></dialog>`;

  /* an invisible target over some words on the slide; it has no effect on the exported picture */
  const hit = (key, x, y, w, h, fs, wt = 400, label = 'these words') => `<rect data-edit="${esc(key)}" data-fs="${fs}" data-wt="${wt}" x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" width="${Math.max(1, w).toFixed(1)}" height="${Math.max(1, h).toFixed(1)}" fill="transparent" tabindex="0" role="button" aria-label="Edit ${esc(label)}"/>`;
  /* Editing on the slide: click anything marked data-edit and type over it. The slide redraws as you
     type and the field stays above it, in anchor, because the redraw replaces what is in host.
     read(key), write(key, text), first() before the first change, after() to redraw; choices(key) gives
     words to pick from, multi(key) says Enter adds a line, enter(key) may return the next key to open,
     clicks(key) false leaves a click to the tool. */
  function editOnSlide({ host, anchor = host.parentElement, read, write, first, after, choices = () => null, multi = () => false, enter = () => null, clicks = () => true }) {
    let cur = null;
    const find = key => host.querySelector(`[data-edit="${key}"]`);
    function place() {
      const t = cur && find(cur.key); if (!t) { close(); return; }
      const f = cur.field, svg = t.ownerSVGElement, r = t.getBoundingClientRect(), a = anchor.getBoundingClientRect(), k = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      const w = Math.min(Math.max(r.width, 220), anchor.clientWidth - 8), left = Math.max(4, Math.min(r.left - a.left + anchor.scrollLeft - anchor.clientLeft, anchor.scrollWidth - w - 4));
      f.style.left = left + 'px'; f.style.top = (r.top - a.top + anchor.scrollTop - anchor.clientTop) + 'px'; f.style.width = w + 'px';
      f.style.fontSize = Math.max(14, (+t.dataset.fs || 20) * k) + 'px'; f.style.fontWeight = t.dataset.wt || 400;
      if (f.tagName === 'TEXTAREA') { f.style.height = 'auto'; f.style.height = Math.max(r.height, f.scrollHeight + 4) + 'px'; }
    }
    function close(refocus) {
      if (!cur) return; const { key, field } = cur; cur = null; field.remove();
      if (refocus) { const t = find(key); if (t) t.focus({ preventScroll: true }); }
    }
    const change = value => { if (!cur.touched) { cur.touched = true; first(); } write(cur.key, value); after(); place(); };
    function next(by) { const all = [...host.querySelectorAll('[data-edit]')], i = all.findIndex(t => t.dataset.edit === cur.key), t = all[i + by]; if (t) open(t.dataset.edit); else close(true); }
    function open(key) {
      close(); const words = choices(key), field = document.createElement(words ? 'select' : 'textarea');
      field.className = 'sl-inl'; field.setAttribute('aria-label', 'Edit the words on the slide');
      if (words) { field.innerHTML = `<option value="">Not set</option>${words.map(w => `<option>${esc(w)}</option>`).join('')}`; } else { field.rows = 1; field.spellcheck = true; }
      field.value = read(key) || '';
      cur = { key, field, touched: false }; anchor.append(field); place(); field.focus({ preventScroll: true });
      if (words) { try { field.showPicker(); } catch (e) {} } else field.setSelectionRange(field.value.length, field.value.length);
      field.addEventListener(words ? 'change' : 'input', () => { if (cur && cur.field === field) change(field.value); });
      field.addEventListener('blur', () => { if (cur && cur.field === field) close(); });
      /* stays in the field, so undo here is the field's own */
      field.addEventListener('keydown', e => { e.stopPropagation();
        if (e.key === 'Escape') { e.preventDefault(); close(true); }
        else if (e.key === 'Tab') { e.preventDefault(); next(e.shiftKey ? -1 : 1); }
        else if (e.key === 'Enter' && !words && (e.metaKey || e.ctrlKey || !multi(key))) { e.preventDefault(); const n = !(e.metaKey || e.ctrlKey) && enter(key); if (n) open(n); else close(true); }
      });
    }
    host.addEventListener('click', e => { const t = e.target.closest('[data-edit]'); if (t && clicks(t.dataset.edit)) open(t.dataset.edit); });
    host.addEventListener('keydown', e => { if (e.key !== 'Enter' && e.key !== ' ') return; const t = e.target.closest('[data-edit]'); if (t) { e.preventDefault(); open(t.dataset.edit); } });
    return { open, close };
  }

  return { hit, editOnSlide, FONT, INK, MUTE, LINE, TONES, esc, $, width, wrap, tspans, pngOf, download, copyPicture, copyText, copyTable, encode, decode, load, store, history, saveDialog };
})();
