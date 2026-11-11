'use strict';
// test-journey-deepening-r113-awayline-20261107.js -- R113 Q2 proof.
// The R72 away guard refuses dawn-meet commits to away villagers, and
// convoFavorAction's away block refuses favor actions for them. Both
// read `v.away[vid]` — away from HAVEN — as if it meant absent from the
// scholar. r110 proved the contradiction in transcripts: Ellis + Jessica,
// day 80, away-flagged villagers in LIVE sittings saying "I'm out on the
// road... miles away" to the scholar sitting across from them.
// The fix (convo-wants.js, pre-registered in the r113 prereg):
//   (a) commit site: the R72 refusal STAYS (the dawn meet still cannot be
//       promised while out — removing it reintroduces the R72 promise-rot
//       trust loss). Only the WORDS change: "away from Haven... can't
//       promise a dawn meet while I'm out" — true face-to-face.
//   (b) action site: the away block (and the away term in the adjacency
//       check) is skipped while the villager is in an ACTIVE conversation
//       with the scholar — presence proven by the conv record. The
//       adjacency check itself is the real gate. Outside a sitting
//       (journal path) the away block still fires.
// Cases: (1) away + in-convo commit -> refused, new line, no "miles away";
// (2) away + NOT in-convo commit -> identical refusal (mechanics unchanged
// outside a sitting); (3) not-away + in-convo commit -> proceeds (the guard
// does not over-fire); (4) away + in-convo food_share, adjacent, meal in
// pack -> ready (performable face-to-face); (5) away + NOT in-convo
// food_share, same setup -> the away reason (journal path unchanged);
// (6) away + in-convo food_share, NOT adjacent -> "Move next to them"
// (adjacency is the real gate now).
const K = require('./godpath/lib');
const T = K.reporter('R113 away-line (R72 guard wording + action-site presence)');
(async () => {
  const G = await K.load({ seed: 11307 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  const NEW_LINE = '"Wait — I\'m away from Haven, out on the road. I can\'t promise a dawn meet while I\'m out — find me when I\'m back, and we\'ll set it then."';
  // R129 (journey-deepening r129): the away line and the Haven-door block
  // line now vary (4 variants each, picked by convoFavorHash). The
  // contract is the TRUTH the line carries, not the exact wording — so
  // these assertions check pool membership, not equality with NEW_LINE.
  const AWAY_POOL = [
    '"Wait — I\'m away from Haven, out on the road. I can\'t promise a dawn meet while I\'m out — find me when I\'m back, and we\'ll set it then."',
    '"I\'m out on the road, away from Haven — no dawn meet while I\'m out, I\'m afraid. Catch me when I\'m back and we\'ll set it then."',
    '"Wait — I\'m away from Haven right now, out on the road. I can\'t promise a dawn meet from out here — find me when I\'m back and we\'ll set it then."',
    '"Out on the road, away from Haven. A dawn meet\'s not something I can promise while I\'m out — when I\'m back, find me, and we\'ll set it then."',
  ];
  const BLOCK_POOL = [
    'Move next to them, on the same side of the Haven door, to help.',
    'Stand beside them first — same side of the Haven door — then help.',
    'You need to be right next to them, same side of the Haven door, to help.',
    'Get to their side of the Haven door and stand next to them — then you can help.',
  ];
  function scene() {
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    const vid = v.roster.find(id => id !== G.villagerId && !G.getPerson(id).dead && (() => { try { return (G.npcComm(id) || {}).level !== 'none'; } catch (e) { return true; } })());
    s.day = 4; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
    v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
    G.npcSetNode(vid, v.px, v.py); G.npcSetInside(vid, false); v.positions[vid] = { mx: 4, my: 5 };
    v.health = { ...v.health, [vid]: 100 };
    (s.inventory = s.inventory || []).push({ id: 'test_food', name: 'Test food', kcalEach: 100, units: 3 });
    return { v, s, vid };
  }
  function setAway(sc, vid) {
    sc.v.away[vid] = { nx: sc.v.px + 2, ny: sc.v.py, purpose: 'expedition', sinceDay: 4, sincePart: 0, duration: 12 };
  }
  // (1) away + IN a live sitting (real startConvo path), forage_help commit.
  {
    const sc = scene(); setAway(sc, sc.vid);
    const favor = G.convoBuildFavor(sc.vid, { kind: 'forage_help' }); G.convoStoreFavor(favor);
    const st = G.startConvo(sc.vid);
    if (!st) throw Error('setup: startConvo returned null for a talkable villager');
    T.ok('sitting with an away villager opens (presence, not roster-absence)', !!G.convoGet(sc.vid).active);
    const r = G.convoFavorCommit(sc.vid, favor);
    T.ok('away + in-convo commit is still refused (R72 guard stays)', r && r.ok === false && r.away === true, JSON.stringify(r));
    T.ok('away + in-convo refusal speaks the new true line', r && AWAY_POOL.indexOf(r.line) >= 0, String(r && r.line));
    T.ok('new line claims no present absence', r && !/miles away/.test(r.line || ''));
    G.endConvo(sc.vid, 'left');
  }
  // (2) away + NOT in a conversation: identical refusal.
  {
    const sc = scene(); setAway(sc, sc.vid);
    const favor = G.convoBuildFavor(sc.vid, { kind: 'forage_help' }); G.convoStoreFavor(favor);
    const r = G.convoFavorCommit(sc.vid, favor);
    T.ok('away + no-convo commit is refused the same way', r && r.ok === false && r.away === true && AWAY_POOL.indexOf(r.line) >= 0, JSON.stringify(r));
  }
  // (3) NOT away + in-convo: the away guard does not fire at all.
  {
    const sc = scene();
    const favor = G.convoBuildFavor(sc.vid, { kind: 'forage_help' }); G.convoStoreFavor(favor);
    G.convoGet(sc.vid).active = true; // the sitting state, set directly
    const r = G.convoFavorCommit(sc.vid, favor);
    T.ok('not-away + in-convo commit proceeds (the guard does not over-fire)',
      r && r.ok === true && r.away !== true, JSON.stringify(r));
    G.convoGet(sc.vid).active = false;
  }
  // (4) away + in-convo, adjacent, meal in pack: the action is ready.
  {
    const sc = scene(); setAway(sc, sc.vid);
    const favor = G.convoBuildFavor(sc.vid, { kind: 'food_share' }); G.convoStoreFavor(favor);
    G.convoGet(sc.vid).active = true;
    const a = G.convoFavorAction(sc.vid, favor);
    T.ok('away + in-convo adjacent food_share is ready (performable face-to-face)', a && a.ready === true, JSON.stringify(a));
    G.convoGet(sc.vid).active = false;
  }
  // (5) away + NOT in-convo, same setup: the away reason (journal path).
  {
    const sc = scene(); setAway(sc, sc.vid);
    const favor = G.convoBuildFavor(sc.vid, { kind: 'food_share' }); G.convoStoreFavor(favor);
    const a = G.convoFavorAction(sc.vid, favor);
    T.ok('away + no-convo food_share still returns the away reason', a && a.ready === false && /out on the road/.test(a.reason || ''), JSON.stringify(a));
  }
  // (6) away + in-convo, NOT adjacent: adjacency is the real gate now.
  {
    const sc = scene(); setAway(sc, sc.vid);
    sc.v.positions[sc.vid] = { mx: 0, my: 0 };
    const favor = G.convoBuildFavor(sc.vid, { kind: 'food_share' }); G.convoStoreFavor(favor);
    G.convoGet(sc.vid).active = true;
    const a = G.convoFavorAction(sc.vid, favor);
    T.ok('away + in-convo but far food_share is blocked by adjacency, not by away',
      a && a.ready === false && BLOCK_POOL.indexOf(a.reason) >= 0 && !/out on the road/.test(a.reason || ''), JSON.stringify(a));
    G.convoGet(sc.vid).active = false;
  }
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
