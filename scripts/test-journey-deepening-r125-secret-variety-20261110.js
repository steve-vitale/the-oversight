'use strict';
// test-journey-deepening-r125-secret-variety-20261110.js -- R125 Q1 proof.
// The question (r125 prereg Q1 + Amendment A1): the confession's reply
// was ONE fixed sentence per answer kind (panel: the promise core repeats
// 3/3; only voiceLine decoration differed), and the plant-teach transcript
// line was ONE fixed frame (panel: 7x in one sitting, only the plant
// changing). Both bypass convoPick, so the no-repeat ledger never sees
// them. The fix gives each answer kind four variants picked through
// convoPick, and the teach line four frames picked by frame-index
// rotation on the villager's convo state (convoPick dedupes by TEXT,
// which can never see a frame repeat — the plant differs each time).
// Cases (engine, real Game):
// (1) the promise answer is a pool member and keeps the r120 phrase
//     'needed someone to know' (no-regression anchor — passes pre-fix);
// (2) 6 staged promise sittings across villagers -> >= 2 distinct core
//     variants (RED pre-fix: 1 — the single fixed sentence);
// (3) the comfort answer is a pool member + 'Thanks for not looking away';
// (4) the silence answer is a pool member + "That's enough, for now";
// (5) the offer answer is a pool member;
// (6) 4 staged teach asks for one villager -> 4 distinct frames (the
//     rotation guarantees it; RED pre-fix: 1);
// (7) each teach line names the plant actually taught;
// (8) control: teaching with no entries left does not crash and does not
//     speak the plant frame.
// The expected pools are literals in this test (the contract); the engine
// implements them. If the engine drifts, the membership cases fail first.
// RED/FAILURE MODE: on the pre-fix engine, (2) fails (distinct 1) and
// (6) fails (distinct 1); (1)/(3)/(4)/(5) pass (the fixed lines ARE the
// first pool variants). Run RED before the fix lands.
const K = require('./godpath/lib');
const T = K.reporter('R125 secret-line variety (engine)');

// The contract pools (must match conversation.js convoSecretAnswerPool
// and villager-agency.js convoTeachPlantLine frame shapes).
const PROMISE_POOL = [
  'Thank you. ...I needed someone to know, and I needed it to stop there.',
  'I needed someone to know — just one person. Thank you for being that person.',
  'Thank you. I needed someone to know, and now someone does. Please keep it there.',
  'Thank you for hearing it. I needed someone to know — and I needed it to stop with you.',
];
const COMFORT_POOL = [
  'It helps, just saying it out loud. ...Thanks for not looking away.',
  "Saying it out loud — I didn't think it would help. It does. ...Thanks for not looking away.",
  "You're the first person I've told. ...Thanks for not looking away.",
  'I carried that a long time. ...Thanks for not looking away.',
];
const OFFER_POOL = [
  "Just knowing someone knows helps. ...If it ever matters, you'll know first.",
  "It helps. Just knowing someone knows helps, and that's enough for now. If it ever matters, I'll come to you first.",
  "Having someone else hold a corner of it — Just knowing someone knows helps. ...You'll hear it from me first.",
  "Thank you for offering. Just knowing someone knows helps — and you'll know first if it matters.",
];
const SILENCE_POOL = [
  "...Thanks. ...That's enough, for now.",
  "...Yeah. ...That's enough, for now. Thank you for sitting with it.",
  "...I don't need words for it. That's enough, for now.",
  "...Just sit with me a minute. ...That's enough, for now.",
];
// Frame shapes: the plant name is the variable slot; the rest is the frame.
const TEACH_FRAMES = [
  (p) => `This one — ${p}. Leaf, stem, smell. You won't forget it now.`,
  (p) => `${p} — crush the leaf, smell it, taste the stem. That's how you know it.`,
  (p) => `This one is ${p}. Look at the leaf, feel the stem, breathe it in. It'll stick.`,
  (p) => `${p}. Remember the leaf, the stem, the smell — that's the whole of it.`,
];
function stripQuotes(s) {
  let t = String(s || '').trim();
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1);
  return t;
}
function poolMember(line, pool) {
  // Voice decoration can replace the terminal period with an ellipsis
  // ("...stop with you." -> "...stop with you…") and add a prefix/suffix
  // around the pool line, so membership is tested on the pool's inner text
  // with trailing punctuation normalized away — not on the exact quoted
  // string. The r120 phrase assertions (substring phrases) are unaffected.
  const norm = (s) => String(s || '').trim().replace(/[.…!?"”]+$/, '');
  const t = norm(stripQuotes(line));
  return pool.findIndex(p => t.indexOf(norm(stripQuotes(p))) >= 0);
}
function frameIndex(line) {
  // Which frame shape does this rendered teach line use? Match by the
  // frame's fixed wording with the plant slot blanked; -1 if none.
  const t = stripQuotes(line);
  if (/^This one — .*\. Leaf, stem, smell\. You won't forget it now\.$/.test(t)) return 0;
  if (/^.* — crush the leaf, smell it, taste the stem\. That's how you know it\.$/.test(t)) return 1;
  if (/^This one is .*\. Look at the leaf, feel the stem, breathe it in\. It'll stick\.$/.test(t)) return 2;
  if (/^.*\. Remember the leaf, the stem, the smell — that's the whole of it\.$/.test(t)) return 3;
  return -1;
}

(async () => {
  const G = await K.load({ seed: 12507 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  const seededRandom = Math.random;
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
      Math.random = () => 0.05;
      let st = null;
      try { st = G.startConvo(vid); } finally { Math.random = seededRandom; }
      if (st && typeof st.line === 'string' && st.line.indexOf('Can I tell you something?') >= 0) {
        return { vid, st };
      }
      try { G.endConvo(vid, 'done'); } catch (e) { /* sitting already over */ }
    }
    throw Error('setup: no secret opener in 12 villagers for ' + JSON.stringify(secretText));
  }
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

  setup(4);
  // (1) + (2): six promise sittings, different villagers, same secret.
  const promiseLines = [];
  for (let i = 0; i < 6; i++) {
    const sit = secretSitting("I can't read, and I'm scared it matters now.");
    const r = G.convoTurn(sit.vid, 'secret:promise');
    promiseLines.push(r && r.line);
    console.log('  promise[' + i + ']: ' + JSON.stringify(r && r.line));
    endSitting(sit.vid);
  }
  const promiseMembers = promiseLines.map(l => poolMember(l, PROMISE_POOL));
  T.ok('Q1 engine (1) every promise answer is a pool member + keeps the r120 phrase',
    promiseMembers.every(m => m >= 0) && promiseLines.every(l => String(l).indexOf('needed someone to know') >= 0),
    'members=' + JSON.stringify(promiseMembers) + ' lines=' + JSON.stringify(promiseLines));
  const promiseDistinct = new Set(promiseMembers.filter(m => m >= 0)).size;
  T.ok('Q1 engine (2) six promise sittings use >= 2 distinct core variants',
    promiseDistinct >= 2, 'distinct=' + promiseDistinct + ' members=' + JSON.stringify(promiseMembers));
  // (3): comfort. (4): silence. (5): offer. Fresh villagers each.
  const sitC = secretSitting("I don't actually know how to swim and I'm terrified someone will find out.");
  const rC = G.convoTurn(sitC.vid, 'secret:comfort');
  console.log('  comfort: ' + JSON.stringify(rC && rC.line));
  T.ok('Q1 engine (3) the comfort answer is a pool member + keeps its phrase',
    poolMember(rC && rC.line, COMFORT_POOL) >= 0 && String(rC && rC.line).indexOf('Thanks for not looking away') >= 0,
    'line=' + JSON.stringify(rC && rC.line));
  endSitting(sitC.vid);
  const sitS = secretSitting("Before the scattering, I ran when I should have stayed.");
  const rS = G.convoTurn(sitS.vid, 'secret:silence');
  console.log('  silence: ' + JSON.stringify(rS && rS.line));
  T.ok('Q1 engine (4) the silence answer is a pool member + keeps its phrase',
    poolMember(rS && rS.line, SILENCE_POOL) >= 0 && String(rS && rS.line).indexOf("That's enough, for now") >= 0,
    'line=' + JSON.stringify(rS && rS.line));
  endSitting(sitS.vid);
  const sitO = secretSitting("I stole medicine from the stash once and never confessed.");
  const rO = G.convoTurn(sitO.vid, 'secret:offer');
  console.log('  offer: ' + JSON.stringify(rO && rO.line));
  T.ok('Q1 engine (5) the offer answer is a pool member',
    poolMember(rO && rO.line, OFFER_POOL) >= 0, 'line=' + JSON.stringify(rO && rO.line));
  endSitting(sitO.vid);

  // (6) + (7) + (8): teach frames. One villager, four earned entries,
  // four asks in a row — the Desmond shape (7 asks, one frame).
  const v = G.state.village;
  const teachVid = v.roster.find(id => id !== G.villagerId && !_used.has(id) && !G.getPerson(id).dead);
  T.ok('setup: a fresh villager for teaching', !!teachVid, 'roster=' + JSON.stringify(v.roster));
  const tp = G.getPerson(teachVid);
  tp.languages = { native: 'english' };
  v.trust = v.trust || {}; v.trust[teachVid] = 90;
  v.away = {};
  const st = G.startConvo(teachVid);
  T.ok('setup: teaching sitting opens', !!st && typeof st.line === 'string', 'startConvo=' + JSON.stringify(st && st.line));
  const ag = G.agencyState();
  ag.teachable = ag.teachable || {};
  ag.teachable[teachVid] = [{ topic: 'plants', day: 4 }, { topic: 'plants', day: 4 }, { topic: 'plants', day: 4 }, { topic: 'plants', day: 4 }];
  const teachLines = [], teachPlants = [];
  for (let i = 0; i < 4; i++) {
    const r = G.agencyTurn(teachVid, 'agency:ask_field');
    teachLines.push(r && r.line);
    teachPlants.push(G.agencyState().lastTaughtPlantName || null);
    console.log('  teach[' + i + ']: ' + JSON.stringify(r && r.line) + ' plant=' + JSON.stringify(teachPlants[i]));
  }
  const teachFrames = teachLines.map(frameIndex);
  T.ok('Q1 engine (6) four teach asks use 4 distinct frames',
    teachFrames.every(f => f >= 0) && new Set(teachFrames).size === 4,
    'frames=' + JSON.stringify(teachFrames) + ' lines=' + JSON.stringify(teachLines));
  T.ok('Q1 engine (7) each teach line names the plant actually taught',
    teachLines.every((l, i) => teachPlants[i] && String(l).indexOf(teachPlants[i]) >= 0),
    'plants=' + JSON.stringify(teachPlants));
  // (8): entries spent — a fifth ask does not crash and does not speak
  // the plant frame (nothing left to teach from the plant pool).
  let r8 = null, err8 = null;
  try { r8 = G.agencyTurn(teachVid, 'agency:ask_field'); } catch (e) { err8 = e; }
  console.log('  teach[4] (spent): ' + JSON.stringify(r8 && r8.line) + ' err=' + (err8 && err8.message));
  T.ok('Q1 engine (8) a spent teach ask does not crash or repeat the plant frame',
    !err8 && (!r8 || !r8.line || frameIndex(r8.line) < 0),
    'line=' + JSON.stringify(r8 && r8.line));
  endSitting(teachVid);
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
