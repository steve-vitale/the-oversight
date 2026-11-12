'use strict';
// test-journey-deepening-r183-place-rotation-20261111.js -- R183 Q1 proof.
// The question (r183 prereg Q1): the place-lesson transcript line was ONE
// fixed frame ("<place> — I'll show you on the map sometime. It's real."),
// so a sitting with two place lessons repeated it verbatim with only the
// place swapped (r130: Brooklyn d45, 2x in one sitting). The fix gives the
// place lesson four frames picked by frame-index rotation on the
// villager's convo state (convoTeachPlaceLine, mirroring r125's
// convoTeachPlantLine) — an unused frame is picked at random, the pool
// resets only once all four have been used, on a SEPARATE ledger key
// (teachPlaceFramesUsed) so the plant rotation never interferes.
// Cases (engine, real Game):
// (1) convoTeachPlaceLine returns a pool member (exact frame shape).
// (2) ROTATION GUARANTEE: 4 consecutive calls in one sitting, same place,
//     return 4 DISTINCT frames (no repeat until exhaustion).
// (3) the 5th call differs from the 4th (pool cycles, no immediate repeat).
// (4) every frame names the place passed in.
// (5) fallback without a convo state returns a pool member.
// (6) END-TO-END: 4 agency asks with 4 known places speak 4 DISTINCT
//     place frames, each naming the place actually popped.
// (7) a 5th ask (places exhausted) does not crash and does not speak a
//     place frame.
// (8) LEDGER SEPARATION: the place rotation writes teachPlaceFramesUsed
//     only — the plant ledger (teachFramesUsed) is untouched.
// The expected pool is a literal in this test (the contract); the engine
// implements it. If the engine drifts, the membership cases fail first.
// RED/FAILURE MODE: on the pre-fix engine, (1)-(3) throw
// (convoTeachPlaceLine is not a function), (6) fails (distinct 1 — the
// single fixed frame), (8) fails (no teachPlaceFramesUsed key). Run RED
// on a temp copy with the HEAD (pre-fix) src/js/villager-agency.js.
const K = require('./godpath/lib');
const T = K.reporter('R183 place-lesson rotation (engine)');

// The contract pool (must match villager-agency.js convoTeachPlaceLine
// frame shapes and the analyzer's PLACE_FRAME_PATTERNS).
const PLACE_FRAMES = [
  (p) => `"${p} — trace it with your finger. That's where it is, and it's real."`,
  (p) => `"${p} — I'll mark it on your map when we're back. It's real, I've stood there."`,
  (p) => `"${p} — walk it with me sometime and you'll know the ground. It's real."`,
  (p) => `"${p} — remember the shape of it. It's real, and it's worth knowing."`,
];
function stripQuotes(s) {
  let t = String(s || '').trim();
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1);
  return t;
}
function placeFrameIndex(line) {
  const t = stripQuotes(line);
  if (/^.* — trace it with your finger\. That's where it is, and it's real\.$/.test(t)) return 0;
  if (/^.* — I'll mark it on your map when we're back\. It's real, I've stood there\.$/.test(t)) return 1;
  if (/^.* — walk it with me sometime and you'll know the ground\. It's real\.$/.test(t)) return 2;
  if (/^.* — remember the shape of it\. It's real, and it's worth knowing\.$/.test(t)) return 3;
  return -1;
}
function poolMember(line) {
  return placeFrameIndex(line);
}

(async () => {
  const G = await K.load({ seed: 18307 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  const _used = new Set();
  function setup(day) {
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    s.languages = { english: 2 };
    s.langExposure = {};
    s.day = day; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
    v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
  }
  const endSitting = (vid) => { try { G.endConvo(vid, 'done'); } catch (e) { /* sitting over */ } };

  setup(45);
  const v = G.state.village;
  const vid = v.roster.find(id => id !== G.villagerId && !_used.has(id) && !G.getPerson(id).dead);
  T.ok('setup: a fresh villager for place lessons', !!vid, 'roster=' + JSON.stringify(v.roster));
  const tp = G.getPerson(vid);
  tp.languages = { native: 'english' };
  v.trust = v.trust || {}; v.trust[vid] = 90;
  v.away = {};
  const st = G.startConvo(vid);
  T.ok('setup: place sitting opens', !!st && typeof st.line === 'string', 'startConvo=' + JSON.stringify(st && st.line));

  // (1) pool membership.
  const place = 'a ridge with a view for miles';
  const first = G.convoTeachPlaceLine(vid, place);
  T.ok('Q1 engine (1) convoTeachPlaceLine returns a pool member',
    placeFrameIndex(first) >= 0, 'line=' + JSON.stringify(first));

  // (2) rotation guarantee: 4 consecutive calls, same place, 4 distinct.
  // (The first call above consumed one frame; use a fresh villager sitting
  // for the clean 4-call run so the count is exact.)
  endSitting(vid);
  const vid2 = v.roster.find(id => id !== G.villagerId && !_used.has(id) && id !== vid && !G.getPerson(id).dead);
  T.ok('setup: a second fresh villager for the rotation run', !!vid2, 'vid2=' + String(vid2));
  const tp2 = G.getPerson(vid2);
  tp2.languages = { native: 'english' };
  v.trust[vid2] = 90;
  const st2 = G.startConvo(vid2);
  T.ok('setup: rotation sitting opens', !!st2 && typeof st2.line === 'string', 'startConvo=' + JSON.stringify(st2 && st2.line));
  const rotLines = [];
  for (let i = 0; i < 4; i++) rotLines.push(G.convoTeachPlaceLine(vid2, place));
  const rotFrames = rotLines.map(placeFrameIndex);
  T.ok('Q1 engine (2) four calls in one sitting use 4 distinct frames',
    rotFrames.every(f => f >= 0) && new Set(rotFrames).size === 4,
    'frames=' + JSON.stringify(rotFrames) + ' lines=' + JSON.stringify(rotLines));

  // (3) 5th call differs from the 4th (pool cycles, no immediate repeat).
  const fifth = G.convoTeachPlaceLine(vid2, place);
  T.ok('Q1 engine (3) the 5th call differs from the 4th (pool cycles)',
    placeFrameIndex(fifth) >= 0 && fifth !== rotLines[3],
    'fifth=' + JSON.stringify(fifth) + ' fourth=' + JSON.stringify(rotLines[3]));

  // (4) every frame names the place passed in.
  T.ok('Q1 engine (4) every frame names the place',
    rotLines.every(l => String(l).indexOf(place) >= 0) && String(fifth).indexOf(place) >= 0,
    'place=' + JSON.stringify(place));
  endSitting(vid2);

  // (5) fallback without a convo state returns a pool member. A villager
  // with no sitting has no conv record, so convoGet returns null.
  const vid3 = v.roster.find(id => id !== G.villagerId && !_used.has(id) && id !== vid && id !== vid2 && !G.getPerson(id).dead);
  T.ok('setup: a third fresh villager with no sitting', !!vid3, 'vid3=' + String(vid3));
  const fb = G.convoTeachPlaceLine(vid3, 'an old trapline');
  T.ok('Q1 engine (5) no-convo fallback returns a pool member',
    placeFrameIndex(fb) >= 0 && String(fb).indexOf('an old trapline') >= 0,
    'line=' + JSON.stringify(fb));

  // (6) + (7) + (8): end-to-end agency asks. One villager, four known
  // places, four asks in a row — the Brooklyn shape (2 asks, one frame).
  // A FRESH villager: the direct-call cases above already wrote to vid /
  // vid2's ledgers, and the ledger persists across sittings by design, so
  // reusing one would start the pool part-drained (the 4th ask would cycle
  // early and repeat a frame — correct engine behavior, wrong test).
  const teachVid = v.roster.find(id => id !== G.villagerId && !_used.has(id) && id !== vid && id !== vid2 && id !== vid3 && !G.getPerson(id).dead);
  T.ok('setup: a fresh villager for the end-to-end asks', !!teachVid, 'teachVid=' + String(teachVid));
  const tpT = G.getPerson(teachVid);
  tpT.languages = { native: 'english' };
  v.trust[teachVid] = 90;
  const ag = G.agencyState();
  ag.know = ag.know || {};
  ag.know[teachVid] = { plants: 0, monsters: 0, places: ['a burned farmhouse', 'an old trapline', 'a spring that runs clear', 'a ridge with a view for miles'] };
  ag.teachable = ag.teachable || {};
  ag.teachable[teachVid] = [];
  const st3 = G.startConvo(teachVid);
  T.ok('setup: end-to-end sitting opens', !!st3 && typeof st3.line === 'string', 'startConvo=' + JSON.stringify(st3 && st3.line));
  const askLines = [], askPlaces = [];
  for (let i = 0; i < 4; i++) {
    // Copy the array: the handler pops in place, so a live reference read
    // before the ask IS the after-array by the time we diff it.
    const before = ((G.agencyState().know[teachVid] || {}).places || []).slice();
    const r = G.agencyTurn(teachVid, 'agency:ask_field');
    askLines.push(r && r.line);
    // The popped place is the one that left the pool on this ask.
    const after = ((G.agencyState().know[teachVid] || {}).places || []).slice();
    askPlaces.push(before.filter(p => after.indexOf(p) === -1)[0] || null);
    console.log('  ask[' + i + ']: ' + JSON.stringify(r && r.line) + ' place=' + JSON.stringify(askPlaces[i]));
  }
  const askFrames = askLines.map(placeFrameIndex);
  T.ok('Q1 engine (6) four agency asks use 4 distinct place frames',
    askFrames.every(f => f >= 0) && new Set(askFrames).size === 4,
    'frames=' + JSON.stringify(askFrames) + ' lines=' + JSON.stringify(askLines));
  T.ok('Q1 engine (6b) each ask line names the place actually popped',
    askLines.every((l, i) => askPlaces[i] && String(l).indexOf(askPlaces[i]) >= 0),
    'places=' + JSON.stringify(askPlaces));
  // (7): places exhausted — a fifth ask does not crash and does not speak
  // a place frame.
  let r5 = null, err5 = null;
  try { r5 = G.agencyTurn(teachVid, 'agency:ask_field'); } catch (e) { err5 = e; }
  console.log('  ask[4] (spent): ' + JSON.stringify(r5 && r5.line) + ' err=' + (err5 && err5.message));
  T.ok('Q1 engine (7) a spent place ask does not crash or repeat a place frame',
    !err5 && (!r5 || !r5.line || placeFrameIndex(r5.line) < 0),
    'line=' + JSON.stringify(r5 && r5.line));
  // (8): ledger separation — the place rotation wrote teachPlaceFramesUsed
  // only; the plant ledger is untouched.
  const c = G.convoGet ? G.convoGet(teachVid) : null;
  T.ok('Q1 engine (8) place rotation uses its own ledger key',
    !!c && Array.isArray(c.teachPlaceFramesUsed) && c.teachPlaceFramesUsed.length === 4 &&
    (!c.teachFramesUsed || c.teachFramesUsed.length === 0),
    'teachPlaceFramesUsed=' + JSON.stringify(c && c.teachPlaceFramesUsed) + ' teachFramesUsed=' + JSON.stringify(c && c.teachFramesUsed));
  endSitting(teachVid);
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
