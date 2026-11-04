/* Two whole journeys, wireframed: the improved screens of the missed bin case and the bakery case,
   in organisms, with the words from those cases. The Screen maker's example
   is the first one.
   A screen: {name, kind, job, pieces: [[organism id, row, {typed words}], ...]}. Words are keyed as in
   organisms.js: the starting words, and which time they occur in that organism. */
window.JOURNEYS = (function () {
  const BACK = n => ({ '‹ Back#0': '‹ Back', 'Step _ of _#0': `Step ${n} of 4` });
  const bin = [
    { name: 'Start: report a missed bin', kind: 'J1', job: 'Says the one rule, and lets you start.', pieces: [
      ['service-header', 0, { 'Service name#0': 'Liverpool City Council' }],
      ['title-intro', 1, { 'Title#0': 'Report a missed bin', 'A sentence or two that says what this is for.#0': 'Use this if your bin was not emptied on its collection day.' }],
      ['notice', 3, { 'Something to know before you start.#0': 'Report it by 2pm on the next working day and we will come back for it.' }],
      ['button-link', 5, { 'Continue#0': 'Start', 'Cancel#0': 'Bins we cannot collect, and why' }],
    ] },
    { name: 'Your postcode and address', kind: 'M11', job: 'Finds the address, and with it the bins that were due.', pieces: [
      ['progress-header', 0, BACK(1)],
      ['question', 1, { 'The question?#0': 'Where is the bin?', 'A hint, if it helps#0': 'We use it to find the bins that were due' }],
      ['postcode', 3, { 'Postcode#0': 'Postcode' }],
      ['text-field', 5, { 'Label#0': 'Address', 'Hint#0': 'Choose from the list' }],
      ['button', 7],
    ] },
    { name: 'Which bin was not emptied?', kind: 'M11', job: 'Asks which bin, by its colour and its name.', pieces: [
      ['progress-header', 0, BACK(2)],
      ['radio-question', 1, { 'The question?#0': 'Which bin was not emptied?', 'An answer#0': 'Blue bin: recycling, due today', 'An answer#1': 'Food caddy: due today', 'An answer#2': 'Purple bin: next due Tue 27 Oct' }],
      ['button', 5],
    ] },
    { name: 'How should we tell you it’s done?', kind: 'M11', job: 'Offers one way to send an update, or none.', pieces: [
      ['progress-header', 0, BACK(3)],
      ['radio-question', 1, { 'The question?#0': 'How should we tell you it’s done?', 'An answer#0': 'Text message', 'An answer#1': 'Email', 'An answer#2': 'No updates' }],
      ['text-field', 5, { 'Label#0': 'Mobile number', 'Hint#0': 'Only if you chose a text' }],
      ['button', 7],
    ] },
    { name: 'Check your report', kind: 'J2', job: 'Shows every answer back, each with a Change link.', pieces: [
      ['progress-header', 0, BACK(4)],
      ['page-title', 1, { 'Page title#0': 'Check your report' }],
      ['summary', 2, { 'Question#0': 'Address', 'Your answer#0': '11 Dale Street, L2 3SW', 'Question#1': 'Bin', 'Your answer#1': 'Blue bin (recycling)', 'Question#2': 'Due', 'Your answer#2': 'Tue 20 Oct', 'Question#3': 'Updates', 'Your answer#3': 'Text to 07700 900000' }],
      ['button', 7, { 'Continue#0': 'Send report' }],
    ] },
    { name: 'Report sent', kind: 'J3', job: 'Gives a reference, a date, and what to do if it does not happen.', pieces: [
      ['service-header', 0, { 'Service name#0': 'Liverpool City Council' }],
      ['success', 1, { 'Done#0': 'Report sent', 'Your reference: ABC123#0': 'Your reference MB-48213' }],
      ['title-intro', 4, { 'Title#0': 'What happens next', 'A sentence or two that says what this is for.#0': 'We will empty your blue bin by Thursday 22 October. Leave it out at the kerb until then.' }],
      ['notice', 7, { 'Something to know before you start.#0': 'Still full on Friday? Report it again with your reference, and we will escalate it.' }],
    ] },
  ];
  const STEP = n => ({ '‹ Back#0': '‹ Back', 'Step _ of _#0': `Step ${n} of 4` });
  const bakery = [
    { name: 'Order a celebration cake', kind: 'J1', job: 'Gives the price and the notice, before anyone asks.', pieces: [
      ['service-header', 0, { 'Service name#0': 'Vauclerc' }],
      ['title-intro', 1, { 'Title#0': 'Order a celebration cake', 'A sentence or two that says what this is for.#0': 'Three sizes, from £24. Collect from 7 Mallow Street. We need two days’ notice.' }],
      ['notice', 3, { 'Something to know before you start.#0': 'Next free collection: Friday 30 October' }],
      ['button-link', 5, { 'Continue#0': 'Start your order', 'Cancel#0': 'Questions? Call 01632 960 412' }],
    ] },
    { name: 'Which cake?', kind: 'M11', job: 'Chooses a size by how many it feeds, and a flavour.', pieces: [
      ['progress-header', 0, STEP(1)],
      ['page-title', 1, { 'Page title#0': 'Which cake?' }],
      ['list', 2, { 'Item name#0': '6 inch', 'A line of detail#0': 'Serves 8 · £24', 'Item name#1': '8 inch', 'A line of detail#1': 'Serves 12 · £32', 'Item name#2': '10 inch', 'A line of detail#2': 'Serves 20 · £48' }],
      ['radio-question', 5, { 'The question?#0': 'Flavour', 'An answer#0': 'Chocolate: milk, egg, wheat', 'An answer#1': 'Lemon: milk, egg, wheat', 'An answer#2': 'Vanilla: milk, egg, wheat' }],
      ['button', 9],
    ] },
    { name: 'When will you collect it?', kind: 'M11', job: 'Chooses a day and a time that can work.', pieces: [
      ['progress-header', 0, STEP(2)],
      ['page-title', 1, { 'Page title#0': 'When will you collect it?' }],
      ['date-picker', 2, { 'Month#0': 'October' }],
      ['time-slots', 8, { '9:00#0': '8–9', '9:30#0': '9–10', '10:00#0': '10–12', '11:30#0': '12–2', '14:00#0': '2–3', '15:30#0': '3–4' }],
      ['button', 10],
    ] },
    { name: 'What should it say?', kind: 'M11', job: 'Reads the message back, and asks about allergies.', pieces: [
      ['progress-header', 0, STEP(3)],
      ['page-title', 1, { 'Page title#0': 'What should it say?' }],
      ['text-field', 2, { 'Label#0': 'Message on the cake', 'Hint#0': '14 of 30 letters' }],
      ['image', 4, { 'Picture#0': 'Happy 30th Sam' }],
      ['yes-no', 7, { 'The question?#0': 'Does anyone eating it have an allergy?' }],
      ['button', 9],
    ] },
    { name: 'Your details', kind: 'M11', job: 'Takes a name, a mobile, and how to pay.', pieces: [
      ['progress-header', 0, STEP(4)],
      ['page-title', 1, { 'Page title#0': 'Your details' }],
      ['text-field', 2, { 'Label#0': 'Name', 'Hint#0': 'Who is collecting it' }],
      ['text-field', 4, { 'Label#0': 'Mobile, for the confirmation', 'Hint#0': 'We text you, and only about this order' }],
      ['yes-no', 6, { 'The question?#0': 'Deposit', 'Yes#0': 'Pay £10 by card', 'No#0': 'Pay in the shop' }],
      ['button', 8, { 'Continue#0': 'Send order request' }],
    ] },
    { name: 'Request sent', kind: 'J3', job: 'Writes the whole order back, and says what happens next.', pieces: [
      ['service-header', 0, { 'Service name#0': 'Vauclerc' }],
      ['success', 1, { 'Done#0': 'Request sent', 'Your reference: ABC123#0': 'Order VC-1031' }],
      ['summary', 4, { 'Question#0': 'Cake', 'Your answer#0': '8 inch chocolate, serves 12', 'Question#1': 'Says', 'Your answer#1': 'Happy 30th Sam', 'Question#2': 'Collect', 'Your answer#2': 'Fri 30 Oct, 12–2', 'Question#3': 'Paid', 'Your answer#3': '£10 of £32' }],
      ['status-tracker', 8, { 'Sent#0': 'Request sent', 'Being dealt with#0': 'We text you to confirm, within 24 hours', 'Done#0': 'Ready to collect' }],
    ] },
  ];
  return { bin, bakery };
})();
