'use strict';
// test-journey-deepening-r120-secret-response-20261108.js -- R120 Q1 proof.
// The defect (r119 Exaucee, seed 96703 day 45): a villager's once-per-life
// high-trust confession ("Can I tell you something? I can't read, and I'm
// scared it matters now.") opened with NO choice that answered it — the menu
// offered teach/theorize pivots, the competent picker taught five plants,
// the favor stayed unestablished, the confession was never answered.
// The fix: a 'secret' menu branch (answers come first) + a secret: handler
// that voices a resolving/planting reply, moves trust, and clears the thread.
// (A) PICKER (the real driver pickChoice, via child processes — the driver
//     is load-time consts, so each policy gets its own process):
//     (1) a secret menu is answered secret:promise on the first sitting
//         (rotation starts at promise), in both panels;
//     (2) secret: outranks teach (the r119 defect: teach won the sitting);
//     (3) a normal verbal menu is unchanged (dlg:more still wins).
// (B) ENGINE (the real Game):
//     (4) MENU: the first menu after a confession offers all four secret:
//         answers + the rude deflect, and does NOT offer teach;
//     (5) PROMISE: "That stays between us." resolves ("needed someone to
//         know"), trust rises, secretAnswered is set, and the next menu
//         has no secret: ids (the thread cleared, menu back to normal);
//     (6) OFFER + literacy secret plants "teach me" (the Exaucee case);
//     (7) OFFER + any other secret gives the generic reply, no teach plant;
//     (8) COMFORT resolves ("Thanks for not looking away"), trust rises;
//     (9) SILENCE sits with them ("That's enough, for now"), trust rises;
//     (10) DEFLECT is rude ("Forget I said anything"), trust FALLS.
//     (11) TRADER SEED: a knowledge trader's confession keeps thread
//         'secret' — the trade-seeding line must not overwrite the thread
//         (r120 debug: Aaron Gordon's confession was hijacked to 'trade',
//         generic menu, once-per-life flag burned).
//     Room-fit note: the rude deflect is SUPPRESSED by default vs a close
//     friend (trust 50 >= 35, finalizeMenu rule 1) — it returns only once
//     the player has escalated in-scene. (4e) asserts the suppression;
//     (4e2) asserts the escalation lift; (10) tests the handler itself.
// RED/FAILURE MODE: (4) fails while buildMenu has no 'secret' branch (the
// r119 code: the first menu after a confession offers teach, no secret:
// ids); (5)-(10) fail while convoTurn has no secret: handler (the choice
// falls through to the generic '"..."' branch, trust unmoved,
// secretAnswered unset, thread uncleared); (11) fails while the trader
// seed still overwrites the secret thread in startConvo.
// NOTE on determinism: the opener is a 20% roll at trust >= 40, so each
// sitting is forced by stubbing Math.random to 0.05 around startConvo and
// retrying fresh villagers until the confession fires (a pending bond/link
// request can pre-empt it — the r120 panel's SECRET-SILENT mechanism).
// Each sitting uses a DISTINCT secret text: the no-repeat ledger would
// block a second identical confession line in one process, and the reply
// lines are diegetic acts (exempt) precisely so a second villager's
// identical promise still speaks.
const K = require('./godpath/lib');
const { execFileSync } = require('child_process');
const path = require('path');
const T = K.reporter('R120 secret response (picker) + menu / handler / trust / return-to-normal (engine)');
const DRIVER = path.join(__dirname, 'journey-deepening-r120-20261108.js');

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
const SECRET_MENU = [
  { id: 'secret:promise', label: '"That stays between us."' },
  { id: 'secret:comfort', label: '"Thank you for trusting me with that."' },
  { id: 'secret:offer', label: '"Is there anything I can do?"' },
  { id: 'secret:silence', label: '(say nothing — just sit with them)' },
  { id: 'secret:deflect', label: '(change the subject)' },
  { id: 'leave', label: '"I should go."' },
];
const SECRET_MENU_TEACH = SECRET_MENU.concat([{ id: 'teach', label: '(teach them about a plant)' }]);
const VERBAL_MENU = [
  { id: 'dlg:more', label: 'Tell me more.' },
  { id: 'dlg:details', label: 'Details?' },
  { id: 'goon', label: 'And?' },
  { id: 'leave', label: '"I should go."' },
];
// (1) first secret sitting answers promise, both panels.
T.ok('Q1 picker (1a) before-panel answers a confession with secret:promise',
  pickIn('before', SECRET_MENU) === 'secret:promise', 'got ' + pickIn('before', SECRET_MENU));
T.ok('Q1 picker (1b) after-panel answers a confession with secret:promise',
  pickIn('after', SECRET_MENU) === 'secret:promise', 'got ' + pickIn('after', SECRET_MENU));
// (2) secret: outranks teach.
T.ok('Q1 picker (2) a confession is answered before any teach pivot',
  pickIn('after', SECRET_MENU_TEACH) === 'secret:promise', 'got ' + pickIn('after', SECRET_MENU_TEACH));
// (3) normal verbal menu unchanged.
T.ok('Q1 picker (3) a normal verbal menu still picks dlg:more',
  pickIn('after', VERBAL_MENU) === 'dlg:more', 'got ' + pickIn('after', VERBAL_MENU));

(async () => {
  const G = await K.load({ seed: 12007 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  const seededRandom = Math.random;
  // Fresh English-speaking villager per sitting: a shared-language sitting
  // (the secret hook never fires in a nonverbal sitting), a fresh convo
  // record per villager (secretShared is per-villager), and a fresh
  // prototype per sitting (the secret text is rigged per test).
  const _used = new Set();
  function secretSitting(secretText) {
    const v = G.state.village, s = G.state.scholar;
    for (let attempt = 0; attempt < 12; attempt++) {
      const vid = v.roster.find(id => id !== G.villagerId && !_used.has(id) && !G.getPerson(id).dead);
      if (!vid) throw Error('setup: no fresh roster villager left');
      _used.add(vid);
      const p = G.getPerson(vid);
      p.languages = { native: 'english' };
      v.away = {};
      v.trust = v.trust || {}; v.trust[vid] = 50;
      const proto = G.synthPrototype(p);
      proto.secret = secretText;
      p.prototype = proto;
      // Force the 20% roll: stub Math.random around startConvo only.
      Math.random = () => 0.05;
      let st = null;
      try { st = G.startConvo(vid); } finally { Math.random = seededRandom; }
      // CONTAINS, not starts-with: voiceLine prepends a discourse lead-in
      // ("I feel like — ", "Mm. ") before the confession, so the phrase
      // sits mid-line. (A starts-with check burns every villager and
      // throws "no fresh roster villager left" — the v1 failure.)
      if (st && typeof st.line === 'string' && st.line.indexOf('Can I tell you something?') >= 0) {
        return { vid, st };
      }
      // Another hook won the opening (pending bond/link request, grief,
      // acute need) — the confession keeps for another villager.
      try { G.endConvo(vid, 'done'); } catch (e) { /* sitting already over */ }
    }
    throw Error('setup: no secret opener in 12 villagers for ' + JSON.stringify(secretText));
  }
  function setup(day) {
    // ONE newRun for the whole arc: newRun regenerates the roster and
    // resets the scholar, so it must run exactly once.
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    s.languages = { english: 2 };
    s.langExposure = {};
    s.day = day; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
    v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
  }
  function nextDay(day) {
    const v = G.state.village, s = G.state.scholar;
    s.day = day; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100;
    v.away = {}; v.engaged = {};
  }
  const idsOf = (choices) => (choices || []).map(x => x && x.id);
  const trustOf = (vid) => (G.state.village.trust || {})[vid];
  function traderSecretSitting(secretText) {
    // A knowledge trader with trade still undiscovered: the seed's 50%
    // roll is forced by the same 0.05 stub, so pre-fix the seed always
    // overwrites the secret thread.
    if (typeof G.isKnowledgeTrader !== 'function') throw Error('setup: isKnowledgeTrader missing');
    const v = G.state.village;
    for (let attempt = 0; attempt < 12; attempt++) {
      const vid = v.roster.find(id => id !== G.villagerId && !_used.has(id) && !G.getPerson(id).dead && G.isKnowledgeTrader(id) && !G.hasDiscovered('trade'));
      if (!vid) throw Error('setup: no fresh knowledge trader left (trade undiscovered)');
      _used.add(vid);
      const p = G.getPerson(vid);
      p.languages = { native: 'english' };
      v.away = {};
      v.trust = v.trust || {}; v.trust[vid] = 50;
      const proto = G.synthPrototype(p);
      proto.secret = secretText;
      p.prototype = proto;
      Math.random = () => 0.05;
      let st = null;
      try { st = G.startConvo(vid); } finally { Math.random = seededRandom; }
      // CONTAINS, not starts-with: voiceLine prepends a discourse lead-in
      // before the confession (see secretSitting).
      if (st && typeof st.line === 'string' && st.line.indexOf('Can I tell you something?') >= 0) {
        return { vid, st };
      }
      try { G.endConvo(vid, 'done'); } catch (e) { /* sitting already over */ }
    }
    throw Error('setup: no secret opener in 12 traders for ' + JSON.stringify(secretText));
  }

  setup(4);
  // (11) TRADER SEED: the confession owns the opening even for a trader.
  const sit11 = traderSecretSitting('I stole medicine once, from a trader who never missed it.');
  T.ok('setup (11): trader confession opens the sitting', !!sit11.st, 'startConvo null');
  T.ok('Q1 engine (11a) the trader confession keeps thread secret (no seed hijack)',
    G.convoGet(sit11.vid).thread === 'secret', 'thread=' + G.convoGet(sit11.vid).thread);
  const menu11 = idsOf(sit11.st.choices);
  T.ok('Q1 engine (11b) the trader confession menu offers secret:promise',
    menu11.indexOf('secret:promise') >= 0, 'menu=' + JSON.stringify(menu11));
  T.ok('Q1 engine (11c) the trader confession menu does NOT offer teach',
    menu11.indexOf('teach') === -1, 'menu=' + JSON.stringify(menu11));
  try { G.endConvo(sit11.vid, 'done'); } catch (e) { /* sitting over */ }
  // (4) MENU: the first menu after a confession answers it, no teach pivot.
  const sit4 = secretSitting("I can't read, and I'm scared it matters now.");
  T.ok('setup (4): confession opens the sitting', !!sit4.st, 'startConvo null');
  const menu4 = idsOf(sit4.st.choices);
  T.ok('Q1 engine (4a) the confession menu offers secret:promise',
    menu4.indexOf('secret:promise') >= 0, 'menu=' + JSON.stringify(menu4));
  T.ok('Q1 engine (4b) the confession menu offers secret:comfort',
    menu4.indexOf('secret:comfort') >= 0, 'menu=' + JSON.stringify(menu4));
  T.ok('Q1 engine (4c) the confession menu offers secret:offer',
    menu4.indexOf('secret:offer') >= 0, 'menu=' + JSON.stringify(menu4));
  T.ok('Q1 engine (4d) the confession menu offers secret:silence',
    menu4.indexOf('secret:silence') >= 0, 'menu=' + JSON.stringify(menu4));
  T.ok('Q1 engine (4e) the rude deflect is suppressed vs a close friend (room-fit rule 1)',
    menu4.indexOf('secret:deflect') === -1, 'menu=' + JSON.stringify(menu4));
  T.ok('Q1 engine (4f) the confession menu does NOT offer teach (r119 defect)',
    menu4.indexOf('teach') === -1, 'menu=' + JSON.stringify(menu4));
  // (4e2) ESCALATION LIFT: once the player has escalated in-scene, the
  // rude option returns (menuKey carries c.escalated, so the menu rebuilds).
  G.convoGet(sit4.vid).escalated = true;
  const menu4e = idsOf(G.convoChoices(sit4.vid));
  T.ok('Q1 engine (4e2) the rude deflect returns once the player escalated',
    menu4e.indexOf('secret:deflect') >= 0, 'menu=' + JSON.stringify(menu4e));
  G.convoGet(sit4.vid).escalated = false;
  // (5) PROMISE: resolves, trust rises, thread clears, menu back to normal.
  const trustBefore5 = trustOf(sit4.vid);
  const r5 = G.convoTurn(sit4.vid, 'secret:promise');
  T.ok('Q1 engine (5a) the promise resolves ("needed someone to know")',
    typeof r5.line === 'string' && r5.line.indexOf('needed someone to know') >= 0, 'line=' + JSON.stringify(r5.line));
  T.ok('Q1 engine (5b) the promise raises trust (real act, past the talk cap)',
    trustOf(sit4.vid) > trustBefore5, 'before=' + trustBefore5 + ' after=' + trustOf(sit4.vid));
  T.ok('Q1 engine (5c) the confession is marked answered',
    G.convoGet(sit4.vid).secretAnswered === true, 'secretAnswered=' + G.convoGet(sit4.vid).secretAnswered);
  const menu5 = idsOf(r5.choices);
  T.ok('Q1 engine (5d) the next menu offers no secret: choices (thread cleared)',
    menu5.filter(id => typeof id === 'string' && id.indexOf('secret:') === 0).length === 0,
    'menu=' + JSON.stringify(menu5) + ' thread=' + G.convoGet(sit4.vid).thread);
  try { G.endConvo(sit4.vid, 'done'); } catch (e) { /* sitting over */ }
  // (6) OFFER + literacy secret plants "teach me" (the Exaucee case).
  nextDay(5);
  const sit6 = secretSitting("I can't read, and I hide it every single day.");
  T.ok('setup (6): confession opens the sitting', !!sit6.st, 'startConvo null');
  const r6 = G.convoTurn(sit6.vid, 'secret:offer');
  T.ok('Q1 engine (6a) the literacy offer plants "teach me"',
    typeof r6.line === 'string' && r6.line.indexOf('teach me') >= 0, 'line=' + JSON.stringify(r6.line));
  T.ok('Q1 engine (6b) the literacy offer raises trust',
    trustOf(sit6.vid) > 50, 'after=' + trustOf(sit6.vid));
  try { G.endConvo(sit6.vid, 'done'); } catch (e) { /* sitting over */ }
  // (7) OFFER + any other secret: generic reply, no teach plant.
  nextDay(6);
  const sit7 = secretSitting('I stole medicine once, from a trader who never missed it.');
  T.ok('setup (7): confession opens the sitting', !!sit7.st, 'startConvo null');
  const r7 = G.convoTurn(sit7.vid, 'secret:offer');
  T.ok('Q1 engine (7a) the non-literacy offer gives the generic reply',
    typeof r7.line === 'string' && r7.line.indexOf('Just knowing someone knows helps') >= 0, 'line=' + JSON.stringify(r7.line));
  T.ok('Q1 engine (7b) the non-literacy offer does NOT plant "teach me"',
    typeof r7.line === 'string' && r7.line.indexOf('teach me') === -1, 'line=' + JSON.stringify(r7.line));
  try { G.endConvo(sit7.vid, 'done'); } catch (e) { /* sitting over */ }
  // (8) COMFORT resolves, trust rises.
  nextDay(7);
  const sit8 = secretSitting('I froze the first time I saw the deer, and I still dream about it.');
  T.ok('setup (8): confession opens the sitting', !!sit8.st, 'startConvo null');
  const trustBefore8 = trustOf(sit8.vid);
  const r8 = G.convoTurn(sit8.vid, 'secret:comfort');
  T.ok('Q1 engine (8a) the comfort resolves ("Thanks for not looking away")',
    typeof r8.line === 'string' && r8.line.indexOf('Thanks for not looking away') >= 0, 'line=' + JSON.stringify(r8.line));
  T.ok('Q1 engine (8b) the comfort raises trust',
    trustOf(sit8.vid) > trustBefore8, 'before=' + trustBefore8 + ' after=' + trustOf(sit8.vid));
  try { G.endConvo(sit8.vid, 'done'); } catch (e) { /* sitting over */ }
  // (9) SILENCE sits with them, trust rises.
  nextDay(8);
  const sit9 = secretSitting('I count the stars when I can\'t sleep, and I pretend each one is a promise.');
  T.ok('setup (9): confession opens the sitting', !!sit9.st, 'startConvo null');
  const trustBefore9 = trustOf(sit9.vid);
  const r9 = G.convoTurn(sit9.vid, 'secret:silence');
  T.ok("Q1 engine (9a) the silence sits with them (\"That's enough, for now\")",
    typeof r9.line === 'string' && r9.line.indexOf("That's enough, for now") >= 0, 'line=' + JSON.stringify(r9.line));
  T.ok('Q1 engine (9b) the silence raises trust',
    trustOf(sit9.vid) > trustBefore9, 'before=' + trustBefore9 + ' after=' + trustOf(sit9.vid));
  try { G.endConvo(sit9.vid, 'done'); } catch (e) { /* sitting over */ }
  // (10) DEFLECT is rude: trust FALLS.
  nextDay(9);
  const sit10 = secretSitting('I kept a photo of my old street, and I never show it to anyone.');
  T.ok('setup (10): confession opens the sitting', !!sit10.st, 'startConvo null');
  const trustBefore10 = trustOf(sit10.vid);
  const r10 = G.convoTurn(sit10.vid, 'secret:deflect');
  T.ok('Q1 engine (10a) the deflect closes the door ("Forget I said anything")',
    typeof r10.line === 'string' && r10.line.indexOf('Forget I said anything') >= 0, 'line=' + JSON.stringify(r10.line));
  T.ok('Q1 engine (10b) the deflect LOWERS trust',
    trustOf(sit10.vid) < trustBefore10, 'before=' + trustBefore10 + ' after=' + trustOf(sit10.vid));
  try { G.endConvo(sit10.vid, 'done'); } catch (e) { /* sitting over */ }
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
