/* Organisms: the units a screen is built from (atomic design: not a button, but "a question
   with its answers", "a search box with its filters"). Read by the print sheets and by the
   snap tool, so the two cannot disagree.

   The rules that make them interchangeable:
   - every organism is the full screen width, 375 px (90 mm in print);
   - every organism is a whole number of rows tall, a row being 56 px (13.4 mm in print);
   - a phone screen below its status bar is 784 px: exactly 14 rows.
   So any organism stacks flush under any other, and a screen is full at 14 rows.

   ARCHETYPES lists each kind of screen as the organisms it is usually built from, in order:
   the cheatsheet, the "where is this used" view and the tool's starting templates all come
   from that one list. Names follow "There Are Only Seventeen Screens" (M01–M17) and the
   module's own cases (J1–J3). Needs paper-kit.js first. */
(function () {
  const { u, C, T, box } = window.PAPER;
  const ROW = 56, ROWS = 14, W = 375;
  /* the box every organism draws into: full width, whole rows, 16 px side margins */
  const body = (inner, rows, cls = '') => `<div class="org-in ${cls}" style="height:${u(rows * ROW)}">${inner}</div>`;
  const stack = (...parts) => `<div class="org-stack">${parts.join('')}</div>`;
  const line = (w = '70%', h = 14) => `<span class="wl" style="flex:none;width:${w};height:${u(h)}"></span>`;
  const head = (t, s = 22) => `<div class="org-h">${T(t, s, 'font-weight:700')}</div>`;
  /* a blank piece: a dashed box to draw in; once named, the name is written in it */
  const blank = (t, n) => `<div class="own">${t ? T(t, 16, 'font-weight:600;color:#7A7372') : T('Your own organism', 14)}${t ? '' : `<span class="own-l">${T('What is it?', 11)}<i></i></span>`}</div>`;
  const opt = (shape) => `<div class="opt" style="height:${u(48)}"><i class="${shape}" style="width:${u(22)};height:${u(22)}"></i>${line('60%', 12)}</div>`;

  const O = [
    // ── top of the screen
    { id: 'appbar', fam: 'Top', name: 'App bar', does: 'Says where you are, with a way back.', rows: 1, edge: 1, draw: () => C.appbar('Title', true, '') },
    { id: 'appbar-search', fam: 'Top', name: 'App bar with search', does: 'Says where you are, with search one tap away.', rows: 2, edge: 1, draw: () => C.appbar('Title', false, '') + `<div class="org-pad">${C.search()}</div>` },
    { id: 'service-header', fam: 'Top', name: 'Service header', does: 'Names the service, with a menu.', rows: 1, edge: 1, draw: () =>
      `<div class="k appbar" style="height:${u(56)}"><i class="ico" style="width:${u(28)};height:${u(28)};border-radius:${u(6)}"></i>${T('Service name', 17, 'font-weight:700;flex:1')}${T('≡', 24)}</div>` },
    { id: 'progress-header', fam: 'Top', name: 'Progress header', does: 'A way back, and how far through a form you are.', rows: 1, edge: 1, draw: () =>
      `<div class="org-pad org-row">${T('‹ Back', 15, 'text-decoration:underline')}<span style="flex:1"></span>${C.progress('Step _ of _').replace('class="k prog"', `class="k prog" style="width:${u(150)}"`)}</div>` },
    { id: 'site-header', fam: 'Top', name: 'Site header with menu', does: 'Names the site, and leads to its main parts. On a big screen it replaces the tab bar.', rows: 1, edge: 1, desk: 1, draw: () =>
      `<div class="k appbar dhead" style="height:${u(56)}"><i class="ico" style="width:${u(28)};height:${u(28)};border-radius:${u(6)}"></i>${T('Service name', 17, 'font-weight:700;flex:1')}${T('Menu item', 15)}${T('Menu item', 15)}${T('Menu item', 15)}${box(110, 38, 'btn sec', T('Sign in', 14, 'font-weight:600'))}</div>` },
    // ── headings
    { id: 'page-title', fam: 'Headings', name: 'Page title', does: 'Says what this screen is, in a few words.', rows: 1, draw: () => head('Page title', 26) },
    { id: 'title-intro', fam: 'Headings', name: 'Title and intro', does: 'Says what this screen is, and the one thing to know first.', rows: 2, draw: () => stack(head('Title', 24), line('95%'), line('70%')) },
    { id: 'question', fam: 'Headings', name: 'Question with hint', does: 'Asks one question, with a hint if it needs one.', rows: 2, draw: () => stack(head('The question?', 24), T('A hint, if it helps', 14)) },
    { id: 'page-tabs', fam: 'Headings', name: 'Tabs in the page', does: 'Switches between two or three views of the same thing.', rows: 1, draw: () =>
      `<div class="k tabs" style="height:${u(44)}">${['Upcoming', 'Past'].map((t, i) => `<span class="${i ? '' : 'on'}">${T(t, 14)}</span>`).join('')}</div>` },
    { id: 'breadcrumb', fam: 'Headings', name: 'Breadcrumbs', does: 'Shows where this page sits, with a way back up.', rows: 1, desk: 1, draw: () =>
      `<div class="crumbs">${T('Home', 14, 'text-decoration:underline')}${T('›', 14)}${T('Section', 14, 'text-decoration:underline')}${T('›', 14)}${T('This page', 14)}</div>` },
    // ── search
    { id: 'search', fam: 'Search', name: 'Search box', does: 'Finds things from a few typed words.', rows: 1, draw: () => C.search() },
    { id: 'search-filters', fam: 'Search', name: 'Search with filters', does: 'Finds things, then narrows the results.', rows: 2, draw: () => stack(C.search(), C.chips(4)) },
    { id: 'results-sort', fam: 'Search', name: 'Results count and sort', does: 'Says how many were found, and lets people reorder them.', rows: 1, draw: () =>
      `<div class="org-row">${T('12 results', 15)}<span style="flex:1"></span>${T('Sort ▾', 15, 'text-decoration:underline')}</div>` },
    // ── answers
    { id: 'text-field', fam: 'Answers', name: 'Text field', does: 'Collects one typed answer: a name, an email, a number.', rows: 2, draw: () => C.field('Label', 'Hint') },
    { id: 'radio-question', fam: 'Answers', name: 'One answer from a few', does: 'Asks a question with one answer from a short list.', rows: 4, draw: () => stack(head('The question?', 20), opt('rad'), opt('rad'), opt('rad')) },
    { id: 'checkbox-group', fam: 'Answers', name: 'Several answers', does: 'Asks a question where several answers can be true.', rows: 4, draw: () => stack(head('Select all that apply', 20), opt('chk'), opt('chk'), opt('chk')) },
    { id: 'yes-no', fam: 'Answers', name: 'Yes or no', does: 'Asks a question with only two answers.', rows: 2, draw: () => stack(head('The question?', 20),
      `<div class="row2">${['Yes', 'No'].map(t => `<div class="opt" style="height:${u(44)};width:${u(163)}"><i class="rad" style="width:${u(20)};height:${u(20)}"></i>${T(t, 15)}</div>`).join('')}</div>`) },
    { id: 'date-picker', fam: 'Answers', name: 'Date picker', does: 'Chooses a day from a month.', rows: 6, draw: () => C.calendar().replace(`style="width:${u(343)}"`, '') },
    { id: 'time-slots', fam: 'Answers', name: 'Time slots', does: 'Chooses a time from the ones still free.', rows: 2, draw: () => C.slots() },
    { id: 'postcode', fam: 'Answers', name: 'Postcode lookup', does: 'Finds an address from a postcode.', rows: 2, draw: () => stack(T('Postcode', 16, 'font-weight:600'),
      `<div class="row2"><div class="box" style="height:${u(48)};width:${u(200)}"></div>${box(127, 48, 'btn sec', T('Find address', 15, 'font-weight:600'))}</div>`) },
    { id: 'upload', fam: 'Answers', name: 'Upload a photo', does: 'Adds a photo or a file.', rows: 3, draw: () => stack(T('Add a photo', 16, 'font-weight:600'),
      `<div class="box upl" style="height:${u(104)}">${T('+', 26)}${T('Choose a photo', 14)}</div>`) },
    { id: 'consent', fam: 'Answers', name: 'Agree to terms', does: 'Asks people to agree before they go on.', rows: 2, draw: () => stack(
      `<div class="opt" style="height:${u(56)};align-items:flex-start;padding-top:${u(12)}"><i class="chk" style="width:${u(22)};height:${u(22)}"></i><span class="lt">${line('95%', 12)}${line('60%', 12)}</span></div>`,
      T('Read the terms', 14, 'text-decoration:underline')) },
    { id: 'payment-card', fam: 'Answers', name: 'Payment card', does: 'Takes card details: number, expiry and security code.', rows: 4, draw: () => stack(
      C.field('Card number'), `<div class="row2">${['Expiry', 'Security code'].map(t => `<div class="k field" style="width:${u(163)}">${T(t, 16, 'font-weight:600')}<div class="box" style="height:${u(48)}"></div></div>`).join('')}</div>`) },
    { id: 'sign-in', fam: 'Answers', name: 'Sign-in options', does: 'Offers the ways in: with an email, or with an account people already have.', rows: 3, draw: () => stack(
      box('full', 44, 'btn pri', T('Continue with email', 15, 'font-weight:600')), box('full', 44, 'btn sec', T('Continue with …', 15, 'font-weight:600')),
      box('full', 44, 'btn sec', T('Continue with …', 15, 'font-weight:600'))) },
    { id: 'rating', fam: 'Answers', name: 'Rating', does: 'Asks how something was, on a scale of one to five.', rows: 2, draw: () => stack(T('How was it?', 16, 'font-weight:600'),
      `<div class="row2" style="justify-content:flex-start">${Array.from({ length: 5 }, () => `<i class="star" style="width:${u(36)};height:${u(36)}"></i>`).join('')}</div>`) },
    // ── content
    { id: 'list', fam: 'Content', name: 'List', does: 'Shows several things of one kind, each leading to more.', rows: 3, draw: () => C.rows(3).replace(/height:calc\(72 \* var\(--u\)\)/g, `height:${u(56)}`) },
    { id: 'card', fam: 'Content', name: 'Card', does: 'Shows one thing with its picture, title and detail.', rows: 4, draw: () => C.card(130) },
    { id: 'two-cards', fam: 'Content', name: 'Two cards', does: 'Shows two things side by side.', rows: 3, draw: () => C.cards2() },
    { id: 'image', fam: 'Content', name: 'Picture', does: 'Shows a picture: a labelled box is enough.', rows: 3, draw: () => C.img(152) },
    { id: 'detail', fam: 'Content', name: 'Detail', does: 'Tells everything important about one thing.', rows: 3, draw: () => stack(head('Name of the thing', 20), T('Price · place · date', 14), line('95%'), line('95%'), line('60%')) },
    { id: 'summary', fam: 'Content', name: 'Summary with Change links', does: 'Shows every answer back, each with a Change link.', rows: 4, draw: () => C.summary(4).replace(/height:calc\(64 \* var\(--u\)\)/g, `height:${u(52)}`) },
    { id: 'price', fam: 'Content', name: 'Price breakdown', does: 'Shows what something costs, and the total.', rows: 3, draw: () => stack(C.keyvals(2),
      `<div class="sr" style="height:${u(44)}">${T('Total', 16, 'font-weight:700;flex:1')}${T('£0.00', 16, 'font-weight:700')}</div>`) },
    { id: 'map', fam: 'Content', name: 'Map', does: 'Shows where things are.', rows: 6, edge: 1, draw: () => C.map(6 * ROW) },
    { id: 'player', fam: 'Content', name: 'Media player', does: 'Plays a video or a sound, with its controls.', rows: 6, draw: () => C.media(200) },
    { id: 'chat', fam: 'Content', name: 'Conversation', does: 'Shows a conversation, newest at the bottom.', rows: 6, draw: () => C.bubbles() },
    { id: 'basket-line', fam: 'Content', name: 'Basket line', does: 'One thing being bought: what it is, how many, and the price.', rows: 2, draw: () =>
      `<div class="lr" style="height:${u(88)};border:0">${box(64, 64, 'img')}<span class="lt"><span class="wl b"></span>
        <span class="qty" style="height:${u(32)}"><i>−</i><b>1</b><i>+</i></span></span>${T('£0.00', 16, 'font-weight:700')}</div>` },
    { id: 'task-list', fam: 'Content', name: 'Task list', does: 'Shows the parts of a long application, and which are done.', rows: 4, draw: () =>
      `<div class="k rows">${['Done', 'Done', 'Not started', 'Cannot start yet'].map(t => `<div class="sr" style="height:${u(48)}"><span class="wl" style="flex:none;width:45%;height:${u(12)}"></span>
        <span class="tag">${T(t, 12)}</span></div>`).join('')}</div>` },
    { id: 'accordion', fam: 'Content', name: 'Expandable sections', does: 'Keeps longer detail folded away until someone asks for it.', rows: 3, draw: () =>
      `<div class="k rows">${[0, 1, 2].map(() => `<div class="sr" style="height:${u(50)}"><span class="wl" style="flex:none;width:60%;height:${u(13)}"></span>${T('+', 22)}</div>`).join('')}</div>` },
    { id: 'side-menu', fam: 'Content', name: 'Side menu', does: 'Lists the parts of a section, beside the content.', rows: 6, desk: 1, span: 3, draw: () =>
      `<div class="sidem">${['Section one', 'Section two', 'Section three', 'Section four', 'Section five'].map((t, i) => `<span class="${i ? '' : 'on'}" style="height:${u(48)}">${T(t, 15)}</span>`).join('')}</div>` },
    { id: 'data-table', fam: 'Content', name: 'Table', does: 'Compares several things across the same few columns.', rows: 4, desk: 1, span: 8, draw: () =>
      `<table class="dtab"><thead><tr>${['Column', 'Column', 'Column', 'Column'].map(t => `<th style="height:${u(44)}">${T(t, 14, 'font-weight:700')}</th>`).join('')}</tr></thead><tbody>${[0, 1, 2].map(() => `<tr>${['Item', 'Value', 'Value', 'Value'].map(t => `<td style="height:${u(48)}">${T(t, 14)}</td>`).join('')}</tr>`).join('')}</tbody></table>` },
    { id: 'three-cards', fam: 'Content', name: 'Three cards', does: 'Shows three things side by side.', rows: 4, desk: 1, span: 12, draw: () =>
      `<div class="row3c">${[0, 1, 2].map(() => `<div class="card">${box('full', 130, 'img')}<div class="cardb"><span class="wl b"></span><span class="wl"></span></div></div>`).join('')}</div>` },
    // ── feedback
    { id: 'error', fam: 'Feedback', name: 'Error summary', does: 'Says what went wrong, and how to fix it.', rows: 2, draw: () => C.error() },
    { id: 'success', fam: 'Feedback', name: 'Success panel', does: 'Says it worked, with a reference to keep.', rows: 3, draw: () => C.success('Done') },
    { id: 'notice', fam: 'Feedback', name: 'Notice', does: 'Gives one piece of information to know before going on.', rows: 2, draw: () => C.info() },
    { id: 'empty', fam: 'Feedback', name: 'Empty state', does: 'Says there is nothing here yet, and how to add something.', rows: 4, draw: () => stack(C.icon(56), head('Nothing here yet', 20), line('80%'), C.button('Add one', 'sec')) },
    { id: 'loading', fam: 'Feedback', name: 'Loading', does: 'Says something is on its way.', rows: 2, draw: () => stack(C.spinner(), `<div style="text-align:center">${T('Loading…', 14)}</div>`) },
    { id: 'status-tracker', fam: 'Feedback', name: 'Status tracker', does: 'Shows how far something has got: sent, being done, ready.', rows: 3, draw: () =>
      `<div class="track">${['done', 'now', ''].map(c => `<div class="tk ${c}" style="height:${u(48)}"><i style="width:${u(18)};height:${u(18)}"></i><span class="wl" style="flex:none;width:55%;height:${u(12)}"></span></div>`).join('')}</div>` },
    // ── actions and the bottom of the screen
    { id: 'button', fam: 'Actions', name: 'Main button', does: 'The one main action on the screen.', rows: 1, draw: () => C.button('Continue') },
    { id: 'button-link', fam: 'Actions', name: 'Button and link', does: 'The main action, and a way out.', rows: 2, draw: () => stack(C.button('Continue'), `<div style="text-align:center">${T('Cancel', 15, 'text-decoration:underline')}</div>`) },
    { id: 'two-buttons', fam: 'Actions', name: 'Two buttons', does: 'Back and next, side by side.', rows: 1, draw: () => C.btnrow('Back', 'Next') },
    { id: 'composer', fam: 'Actions', name: 'Message box', does: 'Writes and sends a message.', rows: 1, edge: 1, draw: () => C.inputbar() },
    { id: 'tabbar', fam: 'Actions', name: 'Tab bar', does: 'Moves between the main parts of an app. Always at the bottom.', rows: 1, edge: 1, bottom: 1, draw: () => C.tabbar(4).replace(`height:calc(64 * var(--u))`, `height:${u(56)}`) },
    { id: 'footer', fam: 'Actions', name: 'Footer', does: 'Closes the page: contact, help and the small print.', rows: 2, edge: 1, bottom: 1, desk: 1, draw: () =>
      `<div class="dfoot">${T('Service name', 15, 'font-weight:700;flex:1')}${T('Help', 14, 'text-decoration:underline')}${T('Contact', 14, 'text-decoration:underline')}${T('Privacy', 14, 'text-decoration:underline')}</div>` },
    // ── your own: a blank piece of each height, for anything the set does not have
    { id: 'own-1', fam: 'Own', name: 'Your own, 1 row', does: 'An organism the set does not have: write what it would be.', rows: 1, own: 1, draw: (t) => blank(t, 1) },
    { id: 'own-2', fam: 'Own', name: 'Your own, 2 rows', does: 'An organism the set does not have: write what it would be.', rows: 2, own: 1, draw: (t) => blank(t, 2) },
    { id: 'own-3', fam: 'Own', name: 'Your own, 3 rows', does: 'An organism the set does not have: write what it would be.', rows: 3, own: 1, draw: (t) => blank(t, 3) },
    { id: 'own-4', fam: 'Own', name: 'Your own, 4 rows', does: 'An organism the set does not have: write what it would be.', rows: 4, own: 1, draw: (t) => blank(t, 4) },
    { id: 'own-5', fam: 'Own', name: 'Your own, 5 rows', does: 'An organism the set does not have: write what it would be.', rows: 5, own: 1, draw: (t) => blank(t, 5) },
    { id: 'own-6', fam: 'Own', name: 'Your own, 6 rows', does: 'An organism the set does not have: write what it would be.', rows: 6, own: 1, draw: (t) => blank(t, 6) },
    // ── overlays: they cover the screen rather than taking rows, one at a time
    { id: 'dialog', fam: 'Overlay', name: 'Dialog', does: 'Stops everything to ask one question, such as “Delete this?”', rows: 4, over: 'middle', scrim: 1, draw: () =>
      `<div style="display:flex;justify-content:center">${C.dialog()}</div>` },
    { id: 'sheet', fam: 'Overlay', name: 'Bottom sheet', does: 'Slides up from the bottom with a few choices, keeping the screen behind it.', rows: 5, over: 'bottom', scrim: 1, edge: 1, draw: () =>
      `<div class="k bsheet" style="height:${u(5 * ROW)}"><i class="grab" style="width:${u(40)};height:${u(5)}"></i>${T('Choose one', 17, 'font-weight:700')}${C.rows(2, false)}${C.button('')}</div>` },
    { id: 'keyboard', fam: 'Overlay', name: 'Keyboard', does: 'Covers the bottom of the screen while someone types.', rows: 4, over: 'bottom', edge: 1, draw: () => C.keyboard().replace(`height:${u(220)}`, `height:${u(4 * ROW)}`) },
    { id: 'toast', fam: 'Overlay', name: 'Toast', does: 'A short message that comes and goes, such as “Saved”, with one action.', rows: 1, over: 'bottom', lift: 1, draw: () => C.toast() },
  ];
  /* The system: a code from the family (three letters, so it never looks like a section number
     such as A3 or C4), numbered in order; and the size in px, always 375 wide. The codes and
     sizes are what the snap tool shows, so a paper mock-up can be rebuilt there piece by piece. */
  const FAM = { Top: 'TOP', Headings: 'HED', Search: 'SRC', Answers: 'ANS', Content: 'CON', Feedback: 'FBK', Actions: 'ACT', Own: 'OWN', Overlay: 'OVL' };
  /* On desktop the same 56 px rows run across a 12-column grid: a column is 69 px, a gutter
     24 px, a side margin 24 px, so a window is 1140 px. Four columns are 348 px, about a phone. */
  const COLS = 12, COLW = 69, GUT = 24, MARGIN = 24, DW = 1140;
  const dw = n => n * COLW + (n - 1) * GUT, dx = c => MARGIN + c * (COLW + GUT);
  const PHONE_ONLY = new Set(['appbar', 'appbar-search', 'tabbar', 'keyboard', 'sheet']);
  const SPAN = { Top: 12, Headings: 8, Search: 8, Answers: 6, Content: 6, Feedback: 6, Actions: 4, Own: 6, Overlay: 4 };
  const WIDE = { footer: 12, map: 8, player: 8, chat: 8, summary: 8, composer: 8, 'task-list': 8, 'date-picker': 6, price: 4, 'two-cards': 6, card: 4 };
  const count = {};
  O.forEach(o => {
    o.phone = PHONE_ONLY.has(o.id); o.dspan = o.span || WIDE[o.id] || SPAN[o.fam];
    count[o.fam] = (count[o.fam] || 0) + 1;
    o.code = `${FAM[o.fam]}-${String(count[o.fam]).padStart(2, '0')}`;
    o.h = o.rows * ROW;
    o.size = `${W} × ${o.h} px`;
  });
  const BY = Object.fromEntries(O.map(o => [o.id, o]));
  /* a piece on a screen is an organism id, or a blank with its name: 'own-3:Camera view' */
  const base = x => String(x).split(':')[0];
  const named = x => String(x).split(':').slice(1).join(':');
  const of = x => BY[base(x)];

  /* one organism, drawn at its real size; label: the small name and size in the corner */
  function organism(id, opts = {}) {
    const o = of(id), t = named(id);
    const size = opts.span ? `${o.edge && opts.span === COLS ? DW : dw(opts.span)} × ${o.h} px` : o.size;
    const tag = opts.label === false ? '' : `<span class="org-tag"><b>${o.code}</b> ${o.name} · ${size}</span>`;
    return `<div class="org${o.edge ? ' edge' : ''}${o.over ? ' ov' : ''}" data-org="${o.id}" style="width:${opts.span ? '100%' : u(o.desk ? dw(o.dspan) : W)};height:${u(o.rows * ROW)}">${body(o.draw(t), o.rows)}${tag}</div>`;
  }
  /* an overlay lies over the rows: in the middle, or at the bottom (a toast just above a tab bar) */
  function overlay(id, recipe = [], extra = '', opts = {}) {
    const o = BY[id]; if (!o || !o.over) return '';
    const lift = o.lift ? recipe.filter(x => of(x) && of(x).bottom).reduce((s, x) => s + of(x).rows * ROW, 0) : 0;
    return `<div class="ovl-layer">${o.scrim ? '<i class="scrim"></i>' : ''}<div class="ovl ${o.over}" style="${o.over === 'bottom' ? `bottom:${u(lift)}` : ''}">${organism(id, opts)}${extra}</div></div>`;
  }

  /* the screen canvas: a phone, its status bar, and 14 numbered row slots */
  function canvas(inner = '', opts = {}) {
    const slots = Array.from({ length: ROWS }, (_, i) => `<i style="height:${u(ROW)}"><b>${i + 1}</b></i>`).join('');
    /* the border sits outside the 375 px, so the inside is exactly as wide as an organism */
    return `<div class="canvas" style="width:calc(${W} * var(--u) + 1.2mm)">
      <div class="k status" style="height:${u(28)}">${T('9:41', 12)}${T('▮▮▮ ▰', 12)}</div>
      <div class="slots" style="height:${u(ROWS * ROW)}">${opts.slots === false ? '' : `<div class="slot-lines">${slots}</div>`}<div class="slot-fill">${inner}</div></div></div>`;
  }

  /* the desktop window: a browser bar, then the same 14 rows across 12 columns */
  function desk(inner = '', opts = {}) {
    const slots = Array.from({ length: ROWS }, (_, i) => `<i style="height:${u(ROW)}"><b>${i + 1}</b></i>`).join('');
    const grid = Array.from({ length: COLS }, (_, i) => `<i style="left:${u(dx(i))};width:${u(COLW)}"></i>`).join('');
    return `<div class="canvas desk" style="width:calc(${DW} * var(--u) + 1.2mm)">
      <div class="dbar2" style="height:${u(36)}"><i></i><i></i><i></i><span></span></div>
      <div class="slots" style="height:${u(ROWS * ROW)}">${opts.slots === false ? '' : `<div class="colgrid">${grid}</div><div class="slot-lines">${slots}</div>`}<div class="slot-fill">${inner}</div></div></div>`;
  }

  /* the kinds of screen, as recipes of organisms, top to bottom (each adds up to 14 rows or fewer) */
  const ARCHETYPES = [
    { id: 'M01', name: 'The Launch', does: 'Shows who the app is while it opens.', recipe: ['loading'] },
    { id: 'M02', name: 'The Gate', does: 'Lets people sign in, or make an account, before going further.', recipe: ['page-title', 'text-field', 'text-field', 'button-link', 'notice'] },
    { id: 'M03', name: 'The Permission Request', does: 'Asks to use location, camera or notifications, and says why.', recipe: ['image', 'title-intro', 'button-link'] },
    { id: 'M04', name: 'The Walkthrough', does: 'Explains the app in three or four panels before it starts.', recipe: ['image', 'title-intro', 'two-buttons'] },
    { id: 'M05', name: 'The Home Tab', does: 'Opens the app every time, and leads to everything else.', recipe: ['appbar-search', 'two-cards', 'list', 'tabbar'] },
    { id: 'M06', name: 'The List / Stream', does: 'Shows many things of one kind, to scroll through.', recipe: ['appbar', 'search-filters', 'list', 'list', 'tabbar'] },
    { id: 'M07', name: 'The Detail', does: 'Shows everything about one thing, and what you can do with it.', recipe: ['appbar', 'image', 'detail', 'price', 'button'] },
    { id: 'M08', name: 'The Player', does: 'Plays something, and keeps the person in control of it.', recipe: ['appbar', 'player', 'detail'] },
    { id: 'M09', name: 'The Map', does: 'Shows where things are, and how to get there.', recipe: ['appbar-search', 'map', 'list'] },
    { id: 'M10', name: 'The Compose / Create', does: 'Makes something new: a message, a post, a report.', recipe: ['appbar', 'text-field', 'text-field', 'image', 'button'] },
    { id: 'M11', name: 'The Form', does: 'Asks questions, best one at a time.', recipe: ['progress-header', 'radio-question', 'button'] },
    { id: 'M12', name: 'The Checkout', does: 'Takes payment, showing exactly what for, before anything is committed.', recipe: ['appbar', 'page-title', 'price', 'payment-card', 'button'] },
    { id: 'M13', name: 'The Chat', does: 'Holds a conversation, newest message at the bottom.', recipe: ['appbar', 'chat', 'composer'] },
    { id: 'M14', name: 'The Search / Discover', does: 'Finds things from a few words.', recipe: ['search-filters', 'results-sort', 'list', 'list', 'tabbar'] },
    { id: 'M15', name: 'The Profile', does: 'Represents one person, place or thing, and what belongs to it.', recipe: ['appbar', 'image', 'detail', 'two-buttons', 'list'] },
    { id: 'M16', name: 'The Settings', does: 'Lets people choose how the app behaves.', recipe: ['appbar', 'page-title', 'checkbox-group', 'list'] },
    { id: 'M17', name: 'The System State', does: 'Says what is happening when there is nothing to show: empty, loading, offline, broken.', recipe: ['appbar', 'empty'] },
    { id: 'J1', name: 'The Start Page', does: 'Says what a service does and who it is for, with one way in.', recipe: ['service-header', 'title-intro', 'notice', 'button'] },
    { id: 'J2', name: 'Check Your Answers', does: 'Shows every answer back, each with a Change link, before anything is sent.', recipe: ['progress-header', 'page-title', 'summary', 'button'] },
    { id: 'J3', name: 'Done', does: 'Confirms it worked: a reference to keep, and what happens next.', recipe: ['service-header', 'success', 'title-intro', 'button-link'] },
  ];
  ARCHETYPES.forEach(a => { a.rows = a.recipe.reduce((s, id) => s + BY[id].rows, 0);
    if (a.rows > ROWS) console.warn(`${a.id} ${a.name}: ${a.rows} rows, more than ${ROWS}`);
    a.recipe.forEach(id => { if (!BY[id]) console.warn(`${a.id}: no organism ${id}`); }); });
  /* where each organism turns up */
  const USED = Object.fromEntries(O.map(o => [o.id, ARCHETYPES.filter(a => a.recipe.includes(o.id)).map(a => a.id)]));

  function screen(recipe, opts = {}) {
    return canvas(recipe.map(id => organism(id, { label: opts.label }).replace('class="org', `class="org${of(id).bottom ? ' bottom' : ''}`)).join('')
      + (opts.over ? overlay(opts.over, recipe, '', { label: opts.label }) : ''), { slots: opts.slots });
  }
  /* On screen, the grey lines become words, and every word can be edited (the paper stays pale,
     to write over in pen). Each piece of text gets a key, its starting words plus which time
     they occur in the organism ("An answer#2"), so what is typed survives a redraw.
     text(org) gives the words already typed for that organism; edit makes them editable. */
  const GENERIC = 'A sentence or two that says what this is for.';
  function wordFor(w, o, i) {
    const tk = w.closest('.tk');
    if (tk) return ['Sent', 'Being dealt with', 'Done'][[...tk.parentElement.children].indexOf(tk)];
    if (o.id === 'consent') return i ? null : 'I agree to the terms and conditions';
    if (w.closest('.cardb')) return i ? 'A line of detail' : 'Card title';
    if (w.closest('.sr') && w.closest('.lt')) return i ? 'Your answer' : 'Question';
    if (w.closest('.lt')) return i ? 'A line of detail' : 'Item name';
    if (w.closest('.opt')) return 'An answer';
    if (w.closest('.sr')) return w.classList.contains('s') ? '£0.00' : { 'task-list': 'Section name', accordion: 'Section heading' }[o.id] || 'Item';
    const m = w.closest('.msg');
    if (m) return i ? null : m.classList.contains('err') ? 'Say what went wrong, and how to fix it.' : m.classList.contains('ok') ? 'Your reference: ABC123' : 'Something to know before you start.';
    if (w.closest('.toast')) return 'Saved';
    if (w.closest('.dialog')) return i ? null : 'Say what will happen, in one sentence.';
    return i ? null : GENERIC;
  }
  const put = (el, t, size = 14) => { el.innerHTML = `<span class="ph wtxt" style="font-size:${u(size)}">${t}</span>`; el.classList.add('has-t'); };
  function words(root, opts = {}) {
    root.querySelectorAll('.org').forEach(org => {
      const o = BY[org.dataset.org]; if (!o) return;
      if (o.own) org.querySelector('.org-in').innerHTML = `<div class="hnote"><span class="ph hand">What would go here? Write what this organism does.</span></div>`;
      /* work out every line's place among its neighbours first, then replace them */
      /* the words for the three cards are the same as for any card */
      const ls = [...org.querySelectorAll('.wl')].map(w => [w, [...w.parentElement.children].filter(x => x.classList.contains('wl')).indexOf(w)]);
      ls.forEach(([w, i]) => {
        const t = wordFor(w, o, i);
        if (t == null) { w.remove(); return; }
        const sp = document.createElement('span'); sp.className = 'ph wtxt' + (w.classList.contains('b') ? ' b' : '');
        sp.textContent = t; w.replaceWith(sp);
      });
      org.querySelectorAll('.chips > i').forEach((c, i) => put(c, o.id === 'time-slots' ? ['9:00', '9:30', '10:00', '11:30', '14:00', '15:30'][i] || '16:00' : 'Filter'));
      org.querySelectorAll('.cg > i').forEach((c, i) => { if (i < 31) put(c, String(i + 1), 13); });
      org.querySelectorAll('.bub > i').forEach(c => put(c, 'Message'));
      org.querySelectorAll('.k.img, .box.img').forEach(c => { if (!c.children.length) put(c, 'Picture', 15); });
      org.querySelectorAll('.inbar .box').forEach(c => put(c, 'Write a message'));
      org.querySelectorAll('.btn').forEach(b => { if (!b.textContent.trim()) put(b, b.classList.contains('pri') ? 'Continue' : 'Cancel', 15); });
      /* keys, typed words, and editing */
      const seen = {}, typed = opts.text ? opts.text(org) || {} : {};
      org.querySelectorAll('.ph').forEach(el => {
        const t = el.textContent.trim(); if (!/[A-Za-z0-9£]/.test(t)) return;
        const k = `${t}#${seen[t] = (seen[t] ?? -1) + 1}`;
        el.dataset.k = k; if (typed[k] != null) el.textContent = typed[k];
        if (opts.edit) { el.contentEditable = 'plaintext-only'; if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true'; el.spellcheck = false;
          el.setAttribute('role', 'textbox'); el.setAttribute('aria-label', `${o.name}: “${t}”`); }
      });
    });
  }
  window.ORG = { ROW, ROWS, W, COLS, COLW, GUT, MARGIN, DW, dw, dx, FAM, O, BY, base, named, of, organism, overlay, canvas, desk, screen, words, ARCHETYPES, USED };
})();
