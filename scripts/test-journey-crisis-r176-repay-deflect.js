'use strict';
// test-journey-crisis-r176-repay-deflect.js -- R176 F2 proof.
// "DEBTS UNPAID" AFTER A SETTLED DEBT (journey crisis r168 filed #1,
// recurrent: r156 #5 + r168 1 sighting): 14201 d50 Amara — the favor is
// thanked/settled ("You came through on the sickness I'm fighting") and
// the closer says "that sickness help, settled", yet dlg:cant served the
// repay deflectBeat's unpaid pool ("Debts unpaid just sit there").
// Root cause: the repay want's deflectBeat had no state branch — it served
// the unpaid pool whenever the want was still live (stage < 3), even
// though the favor itself was settled. Fix: the deflectBeat reads the
// favor (c.want.favor || convoGetFavor) and serves a settled pool when
// the state is fulfilled / thanked / acknowledged / moot / broken.
// Cases (engine, real Game; one process, K.newRun per case):
// (1) settled 'fulfilled', full path: plant favor, startConvo selects
//     repay, dlg:cant -> no 'unpaid' text, settled-pool line.
// (2) settled 'thanked' (the d50 state), direct def call: the want does
//     not select for 'thanked', so the def is reached via the 'fulfilled'
//     sitting and the state flipped to 'thanked' -> no 'unpaid' text.
// (3) control 'promised': open favor + open obligation -> dlg:cant still
//     serves the unpaid pool.
// (4) 'broken': full path -> settled pool (the broken opener frames it as
//     done: "It's done now. Forget it.").
// RED/FAILURE MODE: on the unfixed code (1)/(2)/(4) serve an 'unpaid'
// line; (3) serves a settled line (impossible — the pool has no settled
// line) or no 'unpaid' line.
const K = require('./godpath/lib');
const T = K.reporter('R176 repay deflect settled-state branch (engine)');

const UNPAID = /unpaid/i;
const SETTLED_POOL = [
  "that one's settled",
  "It's done now",
  'settled, and counted',
];
const UNPAID_POOL = [
  'Debts unpaid just sit there',
  'The debt stays on their face',
  'unpaid, and counted',
];

(async () => {
  const G = await K.load({ seed: 43407 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };

  function setup() {
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    s.languages = { english: 2 };
    s.langExposure = {};
    s.day = 10; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
    v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
  }
  function freshVillager() {
    const v = G.state.village;
    const vid = v.roster.find(id => id !== G.villagerId && !G.getPerson(id).dead);
    if (!vid) throw Error('setup: no living roster villager');
    v.trust = v.trust || {}; v.trust[vid] = 50;
    return vid;
  }
  function plantFavor(vid, state) {
    G.convoStoreFavor({ vid, id: 'fav-r176-' + state, kind: 'sick_help', short: 'the sickness help', state, askedDay: 5 });
    if (state === 'promised') {
      const v = G.state.village;
      v.promises = v.promises || {};
      v.promises[vid] = { favorId: 'fav-r176-promised', kept: false };
    }
    return G.convoGetFavor(vid);
  }
  function cantLine(vid) {
    const choices = G.convoChoices(vid) || [];
    if (!choices.some(x => x.id === 'dlg:cant')) return { offered: false, line: null };
    const res = G.convoTurn(vid, 'dlg:cant');
    return { offered: true, line: (res && res.line) || null };
  }

  // (1) settled 'fulfilled', full path.
  setup();
  const vid1 = freshVillager();
  plantFavor(vid1, 'fulfilled');
  const s1 = G.startConvo(vid1);
  T.ok('setup (1): convo opens', !!s1 && !s1.refused, 'startConvo refused/ended');
  T.ok('setup (1): want is repay', G.convoGet(vid1).want && G.convoGet(vid1).want.id === 'repay', 'want=' + JSON.stringify(G.convoGet(vid1).want && G.convoGet(vid1).want.id));
  const c1 = cantLine(vid1);
  T.ok('(1) dlg:cant offered', c1.offered, 'dlg:cant not in choices');
  T.ok('(1) settled favor deflects without unpaid text', !!c1.line && !UNPAID.test(c1.line), 'line=' + JSON.stringify(c1.line));
  T.ok('(1) settled favor deflect serves the settled pool', !!c1.line && SETTLED_POOL.some(p => c1.line.includes(p)), 'line=' + JSON.stringify(c1.line));
  try { G.endConvo(vid1, 'left'); } catch (e) {}

  // (2) settled 'thanked' (the d50 state), direct def call.
  setup();
  const vid2 = freshVillager();
  plantFavor(vid2, 'fulfilled');
  const s2 = G.startConvo(vid2);
  T.ok('setup (2): convo opens', !!s2 && !s2.refused, 'startConvo refused/ended');
  const w2 = G.convoGet(vid2).want;
  T.ok('setup (2): want is repay', w2 && w2.id === 'repay', 'want=' + JSON.stringify(w2 && w2.id));
  // The favor is thanked now (d50: thanked at the table, closer settled).
  const fav2 = G.convoGetFavor(vid2);
  fav2.state = 'thanked';
  G.convoGet(vid2).want.favor = fav2;
  const line2 = w2.def.deflectBeat.call(G, vid2);
  T.ok('(2) thanked favor deflects without unpaid text', !!line2 && !UNPAID.test(line2), 'line=' + JSON.stringify(line2));
  T.ok('(2) thanked favor deflect serves the settled pool', !!line2 && SETTLED_POOL.some(p => line2.includes(p)), 'line=' + JSON.stringify(line2));
  try { G.endConvo(vid2, 'left'); } catch (e) {}

  // (3) control 'promised': unpaid pool still serves.
  setup();
  const vid3 = freshVillager();
  plantFavor(vid3, 'promised');
  const s3 = G.startConvo(vid3);
  T.ok('setup (3): convo opens', !!s3 && !s3.refused, 'startConvo refused/ended');
  T.ok('setup (3): want is repay', G.convoGet(vid3).want && G.convoGet(vid3).want.id === 'repay', 'want=' + JSON.stringify(G.convoGet(vid3).want && G.convoGet(vid3).want.id));
  const c3 = cantLine(vid3);
  T.ok('(3) dlg:cant offered', c3.offered, 'dlg:cant not in choices');
  T.ok('(3) promised favor deflect still serves the unpaid pool', !!c3.line && UNPAID_POOL.some(p => c3.line.includes(p)), 'line=' + JSON.stringify(c3.line));
  try { G.endConvo(vid3, 'left'); } catch (e) {}

  // (4) 'broken': full path -> settled pool.
  setup();
  const vid4 = freshVillager();
  plantFavor(vid4, 'broken');
  const s4 = G.startConvo(vid4);
  T.ok('setup (4): convo opens', !!s4 && !s4.refused, 'startConvo refused/ended');
  T.ok('setup (4): want is repay', G.convoGet(vid4).want && G.convoGet(vid4).want.id === 'repay', 'want=' + JSON.stringify(G.convoGet(vid4).want && G.convoGet(vid4).want.id));
  const c4 = cantLine(vid4);
  T.ok('(4) dlg:cant offered', c4.offered, 'dlg:cant not in choices');
  T.ok('(4) broken favor deflects without unpaid text', !!c4.line && !UNPAID.test(c4.line), 'line=' + JSON.stringify(c4.line));
  T.ok('(4) broken favor deflect serves the settled pool', !!c4.line && SETTLED_POOL.some(p => c4.line.includes(p)), 'line=' + JSON.stringify(c4.line));
  try { G.endConvo(vid4, 'left'); } catch (e) {}

  T.done();
})().catch(e => { console.error('R176 repay-deflect proof CRASH:', e && e.stack || e); process.exit(1); });
