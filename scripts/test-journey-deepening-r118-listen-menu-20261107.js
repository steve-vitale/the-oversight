'use strict';
// test-journey-deepening-r118-listen-menu-20261107.js -- R118 Q1 proof.
// (A) PICKER (the real driver pickChoice, via child processes — PANEL is
//     a load-time const, so each policy gets its own process). The LISTEN
//     policy is FIXED in r118 (both panels listen; the CODE changes):
//     (1) before-panel presses nv:listen in a nonverbal sitting;
//     (2) after-panel presses nv:listen in a nonverbal sitting;
//     (3) speak_back outranks listen in both panels;
//     (4) goon still outranks listen in both panels (a held beat speaks
//         first, then the scholar listens);
//     (5) verbal menus are unchanged in both panels (ENGAGE wins);
//     (6) the bond branch is unchanged in both panels (bond:accept first).
// (B) ENGINE (the real Game):
//     (7) MENU-FLIP (fix A): a nonverbal sitting never offers
//         dlg:subject — the menu stays nonverbal however long the
//         scholar listens (in the harness the fixed narration repeats
//         at the 2nd listen, so the flip lands at turn 2; in the live
//         game the phrase renders and it lands at the 5th);
//     (8) NARRATION CYCLE (fix B): 3 listens serve 3 distinct narration
//         prefixes, one of them the old line verbatim;
//     (9) AGENCY SUPPRESSION (fix C): a nonverbal sitting never offers
//         agency:* choices even when the villager has an expedition to
//         report;
//     (10) SPEAKBACK PUNCTUATION (fix D): youSaid / the spoken line never
//         carry '..' or '.,' — a phrase that already ends in terminal
//         punctuation takes no added period, and the elder-branch quote
//         takes a comma, not '.,'.
// RED/FAILURE MODE: (7) fails while buildMenu's endtopic branch still
// fires in nonverbal sittings; (8) fails while the listen narration is a
// single fixed string; (9) fails while convoChoices prepends agency
// extras in no-words sittings; (10) fails while speakBack appends '.'
// to a phrase that already ends in one.
const K = require('./godpath/lib');
const { execFileSync } = require('child_process');
const path = require('path');
const T = K.reporter('R118 listen-menu (picker) + menu flip / narration / agency / speakback (engine)');
const DRIVER = path.join(__dirname, 'journey-deepening-r118-20261107.js');

function pickIn(panel, menu) {
  const script = `
    const D = require(${JSON.stringify(DRIVER)});
    D.beginSitting();
    const menu = ${JSON.stringify(menu)};
    const pick = D.pickChoice(menu, 0);
    console.log(pick ? pick.id : 'null');
  `;
  const out = execFileSync(process.execPath, ['-e', script], {
    env: Object.assign({}, process.env, { PANEL: panel }),
    encoding: 'utf8', timeout: 60000,
  });
  return out.trim().split('\n').pop().trim();
}
const NV_MENU = [
  { id: 'nv:nod', label: '(nod slowly)' },
  { id: 'nv:smile', label: '(smile)' },
  { id: 'nv:pointself', label: '(point: you, them, together)' },
  { id: 'nv:listen', label: '(listen hard — catch words)' },
  { id: 'leave', label: '(walk away)' },
];
const NV_MENU_SPEAK = NV_MENU.concat([{ id: 'speak_back', label: '(try your Spanish)' }]);
const NV_MENU_GOON = [{ id: 'goon', label: 'And?' }].concat(NV_MENU);
const VERBAL_MENU = [
  { id: 'dlg:more', label: 'Tell me more.' },
  { id: 'dlg:details', label: 'Details?' },
  { id: 'goon', label: 'And?' },
  { id: 'leave', label: '"I should go."' },
];
const BOND_MENU = [
  { id: 'bond:accept', label: 'Yes. Stick together.' },
  { id: 'bond:decline', label: 'Not like that. Not yet.' },
  { id: 'leave', label: '"I should go."' },
];
// (1) before-panel listens (r118: the policy is fixed, the code changes).
T.ok('Q1 picker (1) before-panel presses nv:listen in a nonverbal sitting',
  pickIn('before', NV_MENU) === 'nv:listen', 'got ' + pickIn('before', NV_MENU));
// (2) after-panel listens.
T.ok('Q1 picker (2) after-panel presses nv:listen in a nonverbal sitting',
  pickIn('after', NV_MENU) === 'nv:listen', 'got ' + pickIn('after', NV_MENU));
// (3) speak_back outranks listen in both panels.
T.ok('Q1 picker (3a) before-panel presses speak_back when offered',
  pickIn('before', NV_MENU_SPEAK) === 'speak_back', 'got ' + pickIn('before', NV_MENU_SPEAK));
T.ok('Q1 picker (3b) after-panel presses speak_back when offered',
  pickIn('after', NV_MENU_SPEAK) === 'speak_back', 'got ' + pickIn('after', NV_MENU_SPEAK));
// (4) goon outranks listen in both panels.
T.ok('Q1 picker (4a) before-panel presses goon before listening (held beat first)',
  pickIn('before', NV_MENU_GOON) === 'goon', 'got ' + pickIn('before', NV_MENU_GOON));
T.ok('Q1 picker (4b) after-panel presses goon before listening (held beat first)',
  pickIn('after', NV_MENU_GOON) === 'goon', 'got ' + pickIn('after', NV_MENU_GOON));
// (5) verbal menus unchanged in both panels.
T.ok('Q1 picker (5a) before-panel verbal menu still picks dlg:more',
  pickIn('before', VERBAL_MENU) === 'dlg:more', 'got ' + pickIn('before', VERBAL_MENU));
T.ok('Q1 picker (5b) after-panel verbal menu still picks dlg:more',
  pickIn('after', VERBAL_MENU) === 'dlg:more', 'got ' + pickIn('after', VERBAL_MENU));
// (6) bond branch unchanged in both panels.
T.ok('Q1 picker (6a) before-panel bond menu still answers bond:accept',
  pickIn('before', BOND_MENU) === 'bond:accept', 'got ' + pickIn('before', BOND_MENU));
T.ok('Q1 picker (6b) after-panel bond menu still answers bond:accept',
  pickIn('after', BOND_MENU) === 'bond:accept', 'got ' + pickIn('after', BOND_MENU));

(async () => {
  const G = await K.load({ seed: 11807 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  // Fresh Spanish-only speaker per sitting (exposure is per LANGUAGE,
  // so any speaker of the tongue teaches it — and a fresh villager per
  // sitting sidesteps any per-villager daily talk cap AND the per-villager
  // said-list, which persists across sittings: a villager sat yesterday
  // already has the listen line on record, so the no-repeat fallback
  // would tag today's first listen endtopic before the test even starts).
  const _used = new Set();
  function spanishSpeaker(day) {
    const v = G.state.village, s = G.state.scholar;
    const vid = v.roster.find(id => id !== G.villagerId && !_used.has(id) && !G.getPerson(id).dead);
    if (!vid) throw Error('setup: no fresh roster villager left');
    _used.add(vid);
    const p = G.getPerson(vid);
    p.languages = { native: 'spanish' };
    v.away = {};
    v.trust = v.trust || {}; v.trust[vid] = 30;
    return vid;
  }
  function setup(day) {
    // ONE newRun for the whole arc: newRun regenerates the roster and
    // resets the scholar (languages + langExposure included), so it must
    // run exactly once — later sittings only advance the day.
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    s.languages = { english: 2 };
    s.langExposure = {};
    s.day = day; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
    v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
  }
  function nextDay(day) {
    // Advance the day WITHOUT touching languages or exposure: the arc
    // accumulates across sittings, and that is the property under test.
    const v = G.state.village, s = G.state.scholar;
    s.day = day; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100;
    v.away = {}; v.engaged = {};
  }
  setup(4);
  // (7) MENU-FLIP: one sitting, press listen while offered. In the
  // harness the foreign phrase never renders (godpath/lib does not load
  // src/data/foreignSpeech.json, so renderForeign returns null and the
  // fallback text stands in) — so the fixed narration repeats verbatim
  // at the 2nd listen and the menu flips at turn 2. In the live game the
  // phrase renders (4 per language) and the flip lands at the 5th listen.
  // Either way the observable is the same: before fix A the menu offers
  // dlg:subject mid-sitting; after fix A it never does.
  const vid7 = spanishSpeaker(4);
  const st7 = G.startConvo(vid7);
  T.ok('setup (7): nonverbal sitting opens', !!st7, 'startConvo null');
  let listens7 = 0, sawDlgSubject7 = false, rr7 = st7;
  while (rr7 && !rr7.ended && listens7 < 8) {
    const ids = (rr7.choices || []).map(x => x && x.id);
    if (ids.indexOf('dlg:subject') >= 0) sawDlgSubject7 = true;
    if (ids.indexOf('nv:listen') < 0) break;
    rr7 = G.convoTurn(vid7, 'nv:listen');
    listens7++;
  }
  try { G.endConvo(vid7, 'done'); } catch (e) {}
  T.ok('Q1 engine (7) the sitting reached the flip window (2+ listens)', listens7 >= 2,
    'listens=' + listens7 + ' sawDlgSubject=' + sawDlgSubject7);
  T.ok('Q1 engine (7) no dlg:subject menu in a nonverbal sitting (fix A)', !sawDlgSubject7,
    'listens=' + listens7 + ' sawDlgSubject=' + sawDlgSubject7);
  // (8) NARRATION CYCLE: call nvRespond('listen') 3 times on one fresh
  // villager and read the returned lines directly. (A sitting-level check
  // would be flaky: sayLine's 48-entry run ledger blocks the listen line
  // for a SECOND villager the moment it repeats the first villager's
  // line — the menu-flip path is already proven by (7); this isolates
  // the narration cycle itself, which lives in nvRespond.)
  const NARR_PREFIXES = [
    'You listen hard, watching their mouth shape the words.',
    'You lean in, catching the rise and fall of it.',
    'You hold still and let the sounds settle.',
  ];
  nextDay(5);
  const vidN = spanishSpeaker(5);
  const stN = G.startConvo(vidN);
  T.ok('setup (8): nonverbal sitting opens', !!stN, 'startConvo null');
  const heard = [];
  for (let i = 0; i < 3; i++) {
    const line = G.nvRespond(vidN, 'listen');
    if (typeof line === 'string') heard.push(line);
  }
  try { G.endConvo(vidN, 'done'); } catch (e) {}
  const prefixes = heard.map(l => NARR_PREFIXES.find(p => String(l).indexOf(p) === 0) || ('<unknown> ' + String(l).slice(0, 60)));
  T.ok('Q1 engine (8) 3 listens served 3 distinct narrations (fix B)',
    new Set(prefixes).size === 3 && heard.length === 3, 'prefixes=' + JSON.stringify(prefixes));
  T.ok('Q1 engine (8) the old line is among the narrations (first entry preserved)',
    prefixes.indexOf(NARR_PREFIXES[0]) >= 0, 'prefixes=' + JSON.stringify(prefixes));
  // (9) AGENCY SUPPRESSION: a nonverbal sitting never offers agency:*
  // choices even when the villager has an expedition to report.
  nextDay(6);
  const vidA = spanishSpeaker(6);
  const v = G.state.village;
  v.explorerNews = v.explorerNews || {};
  v.explorerNews[vidA] = { agency: true };
  const stA = G.startConvo(vidA);
  T.ok('setup (9): nonverbal sitting opens with an expedition to report', !!stA, 'startConvo null');
  const menuA = G.convoChoices(vidA) || [];
  const agencyIds = menuA.map(x => x && x.id).filter(id => typeof id === 'string' && id.indexOf('agency:') === 0);
  T.ok('Q1 engine (9) no agency:* choice in a nonverbal sitting (fix C)',
    agencyIds.length === 0, 'agencyIds=' + JSON.stringify(agencyIds) + ' menu=' + JSON.stringify(menuA.map(x => x && x.id)));
  try { G.endConvo(vidA, 'done'); } catch (e) {}
  // (10) SPEAKBACK PUNCTUATION: across several speakers, youSaid and the
  // spoken line never carry '..' or '.,' — the Spanish agree pool is
  // mostly phrases that already end in '.', so a broken suffix shows
  // within a handful of calls.
  nextDay(7);
  const bad = [];
  for (let i = 0; i < 6; i++) {
    const vidS = spanishSpeaker(7);
    const stS = G.startConvo(vidS);
    if (!stS) { bad.push('sitting ' + i + ': startConvo null'); continue; }
    G.convoTurn(vidS, 'nv:listen'); // exposure 1 (open) + 3 = 4 >= 3: speakBack allowed
    let out = null;
    try { out = G.speakBack(vidS); } catch (e) { bad.push('sitting ' + i + ': speakBack threw ' + e.message); }
    if (out) {
      for (const [k, txt] of [['youSaid', out.youSaid], ['line', out.line]]) {
        if (typeof txt === 'string' && (txt.indexOf('..') >= 0 || txt.indexOf('.,') >= 0)) {
          bad.push('sitting ' + i + ' ' + k + ': ' + JSON.stringify(txt));
        }
      }
    }
    try { G.endConvo(vidS, 'done'); } catch (e) {}
  }
  T.ok('Q1 engine (10) no ".." or ".," in speakBack youSaid/line across 6 speakers (fix D)',
    bad.length === 0, bad.join(' | '));
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
