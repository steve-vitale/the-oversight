'use strict';
// test-journey-deepening-r122-postsecret-20261109.js -- R122 Q2 proof.
// The defect (r122 panel, seed 92002 day 60 Ivan + seed 92008 day 80
// Champa): a confession was answered (secret:promise resolves), but the
// sitting then dried out — the next "tell me more" drew the generic dry
// line ("That's... pretty much all of it, honestly.") and the villager
// never returned to what they confided. Panel: median post-answer turns
// 1.5, dry-first 1/2, referencing 0/2 — POST-SECRET-THIN.
// The fix: the secret: handler arms one secret-specific follow-up line
// (keyed to which of the six secrets was confessed); the next continuer
// in the sitting (dlg:more / goon) serves it once, then the flag clears;
// any other pick lets the moment pass (convoDropUnspoken). Deflect arms
// nothing — it closes the door.
// Cases (engine, real Game):
// (1) dlg:more after a promise returns to the secret (literacy: the
//     follow-up names what they can't read, not the dry line);
// (2) goon after a promise returns to the secret (swim: the follow-up
//     names swimming, not the "..." fizzle — queued beats drain first);
// (3) a pivot lets the moment pass (photo: teach/subject first, then
//     dlg:more draws the dry line, no photo follow-up);
// (4) deflect arms no follow-up (candy: dlg:more after a deflect is dry);
// (5) the follow-up fires exactly once (family: first dlg:more returns
//     to the practicing, second dlg:more is dry);
// (6) the classifier maps every secret family to its own line (unit).
// RED/FAILURE MODE: (1), (2), (5a) and (6) fail on the pre-fix engine —
// dlg:more draws the dry line, goon draws "...", and
// convoSecretFollowupLine is not a function. (3) and (4) pass pre-fix
// too (dry is the old behavior) — they guard the moment-passing rule,
// not the fix itself.
const K = require('./godpath/lib');
const T = K.reporter('R122 post-secret follow-up (engine)');
const DRY = /pretty much all of it|wish there was more|whole of it/;

(async () => {
  const G = await K.load({ seed: 12207 });
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
  function nextDay(day) {
    const v = G.state.village, s = G.state.scholar;
    s.day = day; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100;
    v.away = {}; v.engaged = {};
  }
  const endSitting = (vid) => { try { G.endConvo(vid, 'done'); } catch (e) { /* sitting over */ } };

  setup(4);
  // (1) dlg:more after a promise returns to the secret (literacy).
  const sit1 = secretSitting("I can't read, and I'm scared it matters now.");
  T.ok('setup (1): confession opens the sitting', !!sit1.st, 'startConvo null');
  const r1a = G.convoTurn(sit1.vid, 'secret:promise');
  T.ok('Q2 engine (1a) the promise resolves', typeof r1a.line === 'string' && r1a.line.indexOf('needed someone to know') >= 0, 'line=' + JSON.stringify(r1a.line));
  T.ok('Q2 engine (1b) the answer arms the follow-up', !!G.convoGet(sit1.vid).secretFollowup, 'secretFollowup=' + JSON.stringify(G.convoGet(sit1.vid).secretFollowup));
  const r1b = G.convoTurn(sit1.vid, 'dlg:more');
  T.ok("Q2 engine (1c) the next 'tell me more' returns to the secret (can't read)",
    typeof r1b.line === 'string' && r1b.line.indexOf("can't read") >= 0, 'line=' + JSON.stringify(r1b.line));
  T.ok('Q2 engine (1d) the follow-up is NOT the dry line',
    typeof r1b.line === 'string' && !DRY.test(r1b.line), 'line=' + JSON.stringify(r1b.line));
  T.ok('Q2 engine (1e) the follow-up flag is spent',
    !G.convoGet(sit1.vid).secretFollowup, 'secretFollowup=' + JSON.stringify(G.convoGet(sit1.vid).secretFollowup));
  endSitting(sit1.vid);
  // (2) goon after a promise returns to the secret (swim).
  nextDay(5);
  const sit2 = secretSitting("I don't actually know how to swim and I'm terrified someone will find out.");
  T.ok('setup (2): confession opens the sitting', !!sit2.st, 'startConvo null');
  G.convoTurn(sit2.vid, 'secret:promise');
  let swimLine = null;
  for (let i = 0; i < 3; i++) {
    const r = G.convoTurn(sit2.vid, 'goon');
    if (!r || r.ended) break;
    if (typeof r.line === 'string' && r.line.indexOf('swim') >= 0) { swimLine = r.line; break; }
  }
  T.ok("Q2 engine (2a) a 'go on' after the answer returns to the secret (swim)",
    typeof swimLine === 'string', 'line=' + JSON.stringify(swimLine));
  T.ok('Q2 engine (2b) the goon follow-up is NOT the "..." fizzle',
    typeof swimLine === 'string' && swimLine.indexOf('"..."') === -1, 'line=' + JSON.stringify(swimLine));
  endSitting(sit2.vid);
  // (3) a pivot lets the moment pass (photo).
  nextDay(6);
  const sit3 = secretSitting("I'm keeping a photo of someone I left behind. I haven't told anyone.");
  T.ok('setup (3): confession opens the sitting', !!sit3.st, 'startConvo null');
  G.convoTurn(sit3.vid, 'secret:promise');
  G.convoTurn(sit3.vid, 'dlg:subject');
  T.ok('Q2 engine (3a) changing the subject clears the follow-up',
    !G.convoGet(sit3.vid).secretFollowup, 'secretFollowup=' + JSON.stringify(G.convoGet(sit3.vid).secretFollowup));
  const r3 = G.convoTurn(sit3.vid, 'dlg:more');
  T.ok('Q2 engine (3b) the later "tell me more" is dry (the moment passed)',
    typeof r3.line === 'string' && DRY.test(r3.line), 'line=' + JSON.stringify(r3.line));
  T.ok('Q2 engine (3c) the dry line does NOT name the photo',
    typeof r3.line === 'string' && r3.line.indexOf('photo') === -1, 'line=' + JSON.stringify(r3.line));
  endSitting(sit3.vid);
  // (4) deflect arms no follow-up (candy).
  nextDay(7);
  const sit4 = secretSitting("I'm saving a candy bar for when things get better. I haven't told anyone.");
  T.ok('setup (4): confession opens the sitting', !!sit4.st, 'startConvo null');
  const r4a = G.convoTurn(sit4.vid, 'secret:deflect');
  T.ok('Q2 engine (4a) the deflect closes the door',
    typeof r4a.line === 'string' && r4a.line.indexOf('Forget I said anything') >= 0, 'line=' + JSON.stringify(r4a.line));
  T.ok('Q2 engine (4b) the deflect arms no follow-up',
    !G.convoGet(sit4.vid).secretFollowup, 'secretFollowup=' + JSON.stringify(G.convoGet(sit4.vid).secretFollowup));
  const r4b = G.convoTurn(sit4.vid, 'dlg:more');
  T.ok('Q2 engine (4c) the "tell me more" after a deflect is dry',
    typeof r4b.line === 'string' && DRY.test(r4b.line), 'line=' + JSON.stringify(r4b.line));
  endSitting(sit4.vid);
  // (5) the follow-up fires exactly once (family).
  nextDay(8);
  const sit5 = secretSitting("I'm practicing what I would say if I ever saw my family again. I haven't told anyone.");
  T.ok('setup (5): confession opens the sitting', !!sit5.st, 'startConvo null');
  G.convoTurn(sit5.vid, 'secret:promise');
  const r5a = G.convoTurn(sit5.vid, 'dlg:more');
  T.ok("Q2 engine (5a) the first 'tell me more' returns to the secret (practicing)",
    typeof r5a.line === 'string' && r5a.line.indexOf('practicing') >= 0, 'line=' + JSON.stringify(r5a.line));
  const r5b = G.convoTurn(sit5.vid, 'dlg:more');
  T.ok('Q2 engine (5b) the second "tell me more" is dry (one follow-up only)',
    typeof r5b.line === 'string' && DRY.test(r5b.line), 'line=' + JSON.stringify(r5b.line));
  T.ok('Q2 engine (5c) the dry line does NOT repeat the practicing',
    typeof r5b.line === 'string' && r5b.line.indexOf('practicing') === -1, 'line=' + JSON.stringify(r5b.line));
  endSitting(sit5.vid);
  // (6) the classifier maps every secret family to its own line (unit).
  const FAMILIES = [
    ["I've been skimming extra food. I'm ashamed and I can't stop.", 'ashamed'],
    ['Before the scattering, I froze when it mattered. I think about it every day.', 'every day'],
    ["I'm keeping a photo of someone I left behind. I haven't told anyone.", 'photo'],
    ["I'm saving a candy bar for when things get better. I haven't told anyone.", 'candy'],
    ["I'm practicing what I would say if I ever saw my family again. I haven't told anyone.", 'practicing'],
    ["I don't actually know how to swim and I'm terrified someone will find out.", 'swim'],
    ["I have been lying about my age — I'm younger than I look.", 'younger'],
    ["I can't read, and I'm scared it matters now.", "can't read"],
    ['At night I cry quietly so no one hears.', 'nights are still long'],
    ['I stole medicine from the stash once and never confessed.', 'keep it to myself'],
  ];
  for (const [text, marker] of FAMILIES) {
    const line = G.convoSecretFollowupLine(text);
    T.ok('Q2 engine (6) follow-up for ' + JSON.stringify(text.slice(0, 28)) + '... names ' + JSON.stringify(marker),
      typeof line === 'string' && line.indexOf(marker) >= 0, 'line=' + JSON.stringify(line));
  }
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
