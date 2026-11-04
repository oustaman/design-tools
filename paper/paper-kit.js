/* The paper prototyping kit: one library of components, drawn to one scale, used twice —
   inside the printed screen templates (screens.html) and as cut-outs (components.html) —
   so every piece cut out fits every screen printed.

   Scale: one screen pixel = var(--u) on paper (0.24 mm). A phone (375 x 812) prints at 90 x 195 mm,
   about 1.4 times a real phone so there is room to write, two to an A4 page; a desktop window
   (1140 x 660) prints at 274 x 158 mm, one to an A4 landscape page.
   Everything is outline and pale grey: cheap to print, easy to write over in pen. */
(function () {
  const u = n => `calc(${n} * var(--u))`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T = (t, size = 16, extra = '') => `<span class="ph" style="font-size:${u(size)};${extra}">${esc(t)}</span>`;
  const box = (w, h, cls = '', inner = '', extra = '') =>
    `<div class="k ${cls}" style="width:${w === 'full' ? '100%' : u(w)};height:${u(h)};${extra}">${inner}</div>`;

  const C = {
    /* bars */
    status: () => `<div class="k status" style="height:${u(28)}">${T('9:41', 12)}${T('▮▮▮ ▰', 12)}</div>`,
    appbar: (title = 'Title', back = true, action = '') => `<div class="k appbar" style="height:${u(56)}">
      ${back ? T('‹', 30, 'color:#555') : ''}${T(title, 18, 'font-weight:600;flex:1')}${action ? T(action, 15) : ''}</div>`,
    tabbar: (n = 4) => `<div class="k tabbar" style="height:${u(64)}">${Array.from({ length: n }, (_, i) =>
      `<span class="tab"><i style="width:${u(24)};height:${u(24)}"></i>${T('Tab', 11)}</span>`).join('')}</div>`,
    tabs: (n = 3) => `<div class="k tabs" style="height:${u(48)}">${Array.from({ length: n }, (_, i) =>
      `<span class="${i === 0 ? 'on' : ''}">${T('Tab', 14)}</span>`).join('')}</div>`,
    /* words */
    h: (t = 'Heading', s = 26) => `<div class="k hd" style="min-height:${u(s * 1.25)}">${T(t, s, 'font-weight:700')}</div>`,
    cap: (t = 'Caption') => `<div class="k cap" style="height:${u(22)}">${T(t, 14)}</div>`,
    lines: (n = 3) => `<div class="k lines">${Array.from({ length: n }, () => `<i style="height:${u(26)}"></i>`).join('')}</div>`,
    link: (t = 'Link') => `<div class="k link" style="height:${u(28)}">${t ? T(t, 16, 'text-decoration:underline') : `<span class="wl" style="display:block;width:70%;height:${u(20)}"></span>`}</div>`,
    /* inputs */
    field: (label = 'Label', hint = '') => `<div class="k field">${T(label, 16, 'font-weight:600')}${hint ? T(hint, 13) : ''}
      <div class="box" style="height:${u(48)}"></div></div>`,
    area: (rows = 4) => `<div class="k field">${T('Label', 16, 'font-weight:600')}<div class="box lined" style="height:${u(rows * 26 + 12)}"></div></div>`,
    select: (label = 'Label') => `<div class="k field">${T(label, 16, 'font-weight:600')}<div class="box sel" style="height:${u(48)}">${T('▾', 16)}</div></div>`,
    search: () => `<div class="k search" style="height:${u(48)}">${T('⌕', 20)}${T('Search', 15)}</div>`,
    radio: (n = 3) => `<div class="k opts">${Array.from({ length: n }, () =>
      `<div class="opt" style="height:${u(56)}"><i class="rad" style="width:${u(24)};height:${u(24)}"></i><span class="wl"></span></div>`).join('')}</div>`,
    check: (n = 3) => `<div class="k opts">${Array.from({ length: n }, () =>
      `<div class="opt" style="height:${u(56)}"><i class="chk" style="width:${u(24)};height:${u(24)}"></i><span class="wl"></span></div>`).join('')}</div>`,
    toggles: (n = 3) => `<div class="k opts">${Array.from({ length: n }, () =>
      `<div class="opt" style="height:${u(56)}"><span class="wl"></span><i class="tog" style="width:${u(48)};height:${u(28)}"></i></div>`).join('')}</div>`,
    chips: (n = 4) => `<div class="k chips">${Array.from({ length: n }, () => `<i style="height:${u(32)};width:${u(72)}"></i>`).join('')}</div>`,
    /* actions */
    button: (t = 'Button', kind = 'pri', w = 'full') => box(w, 48, 'btn ' + kind, T(t, 17, 'font-weight:600')),
    btnrow: (a = 'Back', b = 'Next') => `<div class="k row2">${box(163, 48, 'btn sec', T(a, 16, 'font-weight:600'))}${box(163, 48, 'btn pri', T(b, 16, 'font-weight:600'))}</div>`,
    /* progress */
    progress: (t = 'Step 2 of 4') => `<div class="k prog">${T(t, 13)}<div class="bar" style="height:${u(6)}"><i style="width:50%"></i></div></div>`,
    dots: (n = 3) => `<div class="k dots" style="height:${u(24)}">${Array.from({ length: n }, (_, i) => `<i class="${i === 0 ? 'on' : ''}" style="width:${u(8)};height:${u(8)}"></i>`).join('')}</div>`,
    spinner: () => `<div class="k center" style="height:${u(64)}"><i class="spin" style="width:${u(40)};height:${u(40)}"></i></div>`,
    /* pictures and content */
    img: (h = 180, w = 'full') => box(w, h, 'img'),
    avatar: (s = 64) => `<div class="k center" style="height:${u(s + 8)}"><i class="ava" style="width:${u(s)};height:${u(s)}"></i></div>`,
    icon: (s = 72) => `<div class="k center" style="height:${u(s + 16)}"><i class="ico" style="width:${u(s)};height:${u(s)}"></i></div>`,
    card: (h = 120) => `<div class="k card">${box('full', h, 'img')}<div class="cardb"><span class="wl b"></span><span class="wl"></span></div></div>`,
    cards2: () => `<div class="k row2">${['', ''].map(() => `<div class="card sm" style="width:${u(163)}">${box('full', 96, 'img')}<div class="cardb"><span class="wl b"></span></div></div>`).join('')}</div>`,
    rows: (n = 3, ava = true) => `<div class="k rows">${Array.from({ length: n }, () => `<div class="lr" style="height:${u(72)}">
      ${ava ? `<i class="ava" style="width:${u(40)};height:${u(40)}"></i>` : ''}<span class="lt"><span class="wl b"></span><span class="wl"></span></span>${T('›', 22)}</div>`).join('')}</div>`,
    summary: (n = 4) => `<div class="k rows">${Array.from({ length: n }, () => `<div class="sr" style="height:${u(64)}">
      <span class="lt"><span class="wl b"></span><span class="wl"></span></span>${T('Change', 14, 'text-decoration:underline')}</div>`).join('')}</div>`,
    keyvals: (n = 3) => `<div class="k rows">${Array.from({ length: n }, () => `<div class="sr" style="height:${u(44)}"><span class="wl"></span><span class="wl s"></span></div>`).join('')}</div>`,
    /* messages */
    error: () => `<div class="k msg err" style="min-height:${u(96)}">${T('There is a problem', 16, 'font-weight:700')}<span class="wl"></span><span class="wl"></span></div>`,
    success: (t = 'Done') => `<div class="k msg ok" style="min-height:${u(120)}">${T('✓', 28)}${T(t, 22, 'font-weight:700')}<span class="wl"></span></div>`,
    info: () => `<div class="k msg info" style="min-height:${u(72)}"><span class="wl"></span><span class="wl"></span></div>`,
    toast: () => `<div class="k toast" style="height:${u(48)}"><span class="wl"></span>${T('Undo', 14, 'font-weight:600')}</div>`,
    /* special canvases */
    map: (h = 420) => box('full', h, 'map', `<i class="pin" style="width:${u(28)};height:${u(28)}"></i>`),
    media: (h = 220) => `<div class="k">${box('full', h, 'media', T('▶', 44))}<div class="scrub" style="height:${u(6)};margin-top:${u(14)}"><i style="width:35%"></i></div>
      <div class="k row3" style="height:${u(56)}">${T('⏮', 24)}${T('⏯', 30)}${T('⏭', 24)}</div></div>`,
    bubbles: () => `<div class="k bub">${['l', 'r', 'l', 'r', 'r', 'l'].map((s, i) => `<i class="${s}" style="height:${u([44, 36, 60, 36, 44, 36][i])};width:${u([220, 160, 240, 120, 200, 140][i])}"></i>`).join('')}</div>`,
    inputbar: () => `<div class="k inbar" style="height:${u(64)}"><div class="box" style="height:${u(44)};flex:1"></div><i class="send" style="width:${u(44)};height:${u(44)}"></i></div>`,
    keyboard: () => `<div class="k kbd" style="height:${u(220)}">${[10, 9, 9, 5].map(n => `<div>${Array.from({ length: n }, () => '<i></i>').join('')}</div>`).join('')}</div>`,
    sheet: (inner) => `<div class="k bsheet">${inner}</div>`,
    gap: (n = 16) => `<div style="height:${u(n)}"></div>`,
    /* only on the cut-out sheets */
    dialog: () => `<div class="k dialog" style="width:${u(300)}">${T('Title', 18, 'font-weight:700')}<span class="wl"></span><span class="wl"></span>
      <div class="row2" style="margin-top:${u(12)}">${box(126, 40, 'btn sec')}${box(126, 40, 'btn pri')}</div></div>`,
    calendar: () => `<div class="k cal" style="width:${u(343)}">${T('Month', 16, 'font-weight:700')}<div class="cg">${Array.from({ length: 35 }, () => `<i style="height:${u(40)}"></i>`).join('')}</div></div>`,
    slots: () => `<div class="k chips">${Array.from({ length: 6 }, () => `<i style="height:${u(40)};width:${u(96)}"></i>`).join('')}</div>`,
  };

  /* A phone screen: the frame, a faint 4-column grid, and the blocks stacked inside its 16 px margins.
     Bars run edge to edge; everything else sits in the grid. */
  const EDGE = new Set(['status', 'appbar', 'tabbar', 'tabs', 'img-edge', 'map', 'keyboard', 'sheet']);
  function phone(blocks, opts = {}) {
    const grid = opts.grid === false ? '' : `<div class="pgrid">${'<i></i>'.repeat(4)}</div>`;
    let top = '', mid = '', bottom = '';
    blocks.forEach(b => {
      const [name, ...args] = Array.isArray(b) ? b : [b];
      const html = C[name](...args);
      if (['status', 'appbar', 'tabs'].includes(name) && !mid) top += html;
      else if (['tabbar', 'inputbar', 'keyboard', 'sheet'].includes(name)) bottom += html;
      else mid += EDGE.has(name) ? `<div class="edge">${html}</div>` : html;
    });
    return `<div class="phone" style="width:${u(375)};height:${u(812)}">${grid}<div class="pin-top">${top}</div>
      <div class="pmid" style="padding:${u(16)} ${u(16)} 0">${mid}</div><div class="pbot">${bottom}</div></div>`;
  }
  function desktop(opts = {}) {
    const grid = opts.grid === false ? '' : `<div class="dgrid" style="width:${u(1092)};left:calc(50% - ${u(546)})">${'<i></i>'.repeat(12)}</div>`;
    return `<div class="desk" style="width:${u(1140)};height:${u(660)}"><div class="dbar" style="height:${u(36)}"><i></i><i></i><i></i><span class="durl"></span></div>${grid}</div>`;
  }
  window.PAPER = { u, C, phone, desktop, T, box };
})();
