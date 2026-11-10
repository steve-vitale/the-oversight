'use strict';
// test-journey-social-r172-confessguard.js -- R172 B1 proof.
// ONE CONFESSION PER SITTING (journey-social r172 2026-11-10): the fresh
// panel showed 3 double-confession sittings (s69 theft+doubt, s139
// doubt+doubt, s167 doubt+doubt — Benoit confessed twice in one sitting,
// the second with the IDENTICAL windup frame). A villager who already
// bared one secret in a sitting does not dispense a second one to the
// same interrogation: a second confess-candidate in the same sitting
// deflects instead of confessing. The guard is sitting-scoped (the flag
// lives on the convo object, startConvo resets it) and shared by both
// confrontation paths — confrontDoubt and confrontTheft — plus the
// volunteered "Can I tell you something?" secret, which is a confession
// itself (r120).
// Cases (engine, real Game; Math.random stubbed to 0.0 around each
// confrontation so the confess roll always wins unless the guard blocks):
// (1) control: the first confession in a sitting still lands, and the
//     flag is set on the convo;
// (2) doubt+doubt: a second live lie pressed in the SAME sitting
//     deflects (outcome 'deflected', stale-confessed refusal line),
//     not a second confession;
// (3) a NEW sitting resets the flag, so a third lie can confess again
//     (the guard is per-sitting, not per-life);
// (4) theft+doubt: a theft confession first, then a lie press in the
//     same sitting deflects — the shared flag covers both paths;
// (5) volunteered secret: the "Can I tell you something?" opener sets
//     the flag, so a confrontation confession later in that sitting
//     deflects.
// RED/FAILURE MODE: (2)/(4)/(5) return 'confessed' while the guard is
// absent (the second secret is dispensed). (1) fails while the guard
// blocks the FIRST confession; (3) fails while the flag leaks across
// sittings (the third lie deflects in a fresh sitting).
const K = require('./godpath/lib');
const T = K.reporter('R172 one-confession-per-sitting guard (engine)');

(async () => {
  const G = await K.load({ seed: 43407 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  const seededRandom = Math.random;
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
  // Fresh roster villager with three planted lies (occupation/origin/goal)
  // and one open doubt per field, evidence naming the cover.
  function plantLiar() {
    const v = G.state.village;
    const vid = v.roster.find(id => id !== G.villagerId && !_used.has(id) && !G.getPerson(id).dead);
    if (!vid) throw Error('setup: no fresh roster villager left');
    _used.add(vid);
    const p = G.getPerson(vid);
    p.languages = { native: 'english' };
    v.away = {};
    v.trust = v.trust || {}; v.trust[vid] = 50;
    // Plant lies directly (fixture): genLies shape {told, truth, motive, field}.
    p.lies = {
      occupation: { told: 'a midwife', truth: 'a Baker', motive: 'shame', field: 'occupation' },
      origin: { told: 'Denver', truth: 'a commune', motive: 'hiding', field: 'origin' },
      goal: { told: 'belong', truth: 'escape', motive: 'hiding', field: 'goal' },
    };
    const doubts = {};
    doubts.occupation = G.addDoubt(vid, 'observation',
      `${G.firstRef(vid)} claims to be a midwife, but the hands say otherwise.`,
      [`claims "a midwife"`, 'observed: flour under the nails'], { field: 'occupation' });
    doubts.origin = G.addDoubt(vid, 'observation',
      `${G.firstRef(vid)} says Denver, but the accent is somewhere else.`,
      [`claims "Denver"`, 'observed: a commune tattoo'], { field: 'origin' });
    doubts.goal = G.addDoubt(vid, 'observation',
      `${G.firstRef(vid)} says they want to belong, but the packed bag says otherwise.`,
      [`claims "belong"`, 'observed: a packed bag by the door'], { field: 'goal' });
    return { vid, doubts };
  }
  function plantTheft(vid) {
    const d = G.addDoubt(vid, 'theft',
      `${G.firstRef(vid)} was seen taking salt from the cache.`,
      ['witnessed taking salt from the cache'], {});
    d.theft = { label: 'salt', place: 'the pantry', day: G.state.scholar.day };
    return d;
  }
  // Confront with the confess roll forced to win (roll 0.0 < confessP).
  function confrontForced(vid, doubtId) {
    Math.random = () => 0.0;
    try { return G.confrontDoubt(vid, doubtId); } finally { Math.random = seededRandom; }
  }
  const REFUSALS = ['We went over this', 'confessed that already', 'I told you the truth', 'say it again'];

  setup(4);
  // (1) control: first confession lands, flag set.
  const L1 = plantLiar();
  T.ok('setup (1): liar planted with three doubts', !!L1.doubts.occupation && !!L1.doubts.origin && !!L1.doubts.goal,
    'doubts=' + JSON.stringify(Object.keys(L1.doubts)));
  const st1 = G.startConvo(L1.vid);
  T.ok('setup (1): sitting opens', !!st1, 'startConvo null');
  T.ok('setup (1): flag clear at sitting open', !G.convoGet(L1.vid).confessedThisSitting,
    'flag=' + JSON.stringify(G.convoGet(L1.vid).confessedThisSitting));
  const r1 = confrontForced(L1.vid, L1.doubts.occupation.id);
  console.log('  first confront line: ' + JSON.stringify(r1 && r1.line));
  T.ok('guard (1a) first confession in the sitting still lands',
    !!r1 && r1.outcome === 'confessed', 'outcome=' + JSON.stringify(r1 && r1.outcome));
  T.ok('guard (1b) the confession sets the sitting flag',
    G.convoGet(L1.vid).confessedThisSitting === true,
    'flag=' + JSON.stringify(G.convoGet(L1.vid).confessedThisSitting));
  // (2) doubt+doubt: second live lie in the same sitting deflects.
  const r2 = confrontForced(L1.vid, L1.doubts.origin.id);
  console.log('  second confront line: ' + JSON.stringify(r2 && r2.line));
  T.ok('guard (2a) second confession in the same sitting deflects',
    !!r2 && r2.outcome === 'deflected', 'outcome=' + JSON.stringify(r2 && r2.outcome));
  T.ok('guard (2b) the deflect speaks like someone who already confessed',
    !!r2 && typeof r2.line === 'string' && REFUSALS.some(p => r2.line.indexOf(p) >= 0),
    'line=' + JSON.stringify(r2 && r2.line));
  T.ok('guard (2c) the second lie stays unconfessed (doubt stays open)',
    !G.getPerson(L1.vid).lies.origin.confessed && !L1.doubts.origin.resolved,
    'originConfessed=' + JSON.stringify(G.getPerson(L1.vid).lies.origin.confessed));
  endSitting(L1.vid);
  // (3) new sitting: flag resets, a third lie can confess again.
  const st3 = G.startConvo(L1.vid);
  T.ok('setup (3): new sitting opens', !!st3, 'startConvo null');
  T.ok('guard (3a) the flag resets on a new sitting',
    !G.convoGet(L1.vid).confessedThisSitting,
    'flag=' + JSON.stringify(G.convoGet(L1.vid).confessedThisSitting));
  const r3 = confrontForced(L1.vid, L1.doubts.goal.id);
  T.ok('guard (3b) a fresh sitting allows one confession again',
    !!r3 && r3.outcome === 'confessed', 'outcome=' + JSON.stringify(r3 && r3.outcome));
  endSitting(L1.vid);
  // (4) theft+doubt: theft confession first, lie press deflects.
  const L2 = plantLiar();
  const dT = plantTheft(L2.vid);
  const st4 = G.startConvo(L2.vid);
  T.ok('setup (4): second sitting opens', !!st4, 'startConvo null');
  const r4a = confrontForced(L2.vid, dT.id);
  console.log('  theft confront line: ' + JSON.stringify(r4a && r4a.line));
  T.ok('guard (4a) the theft confession lands first',
    !!r4a && r4a.outcome === 'confessed', 'outcome=' + JSON.stringify(r4a && r4a.outcome));
  const r4b = confrontForced(L2.vid, L2.doubts.occupation.id);
  T.ok('guard (4b) the lie press after a theft confession deflects',
    !!r4b && r4b.outcome === 'deflected', 'outcome=' + JSON.stringify(r4b && r4b.outcome));
  endSitting(L2.vid);
  // (5) volunteered secret sets the flag.
  function secretSitting(secretText) {
    const v = G.state.village;
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
  const sit5 = secretSitting("I can't read, and I'm scared it matters now.");
  T.ok('setup (5): secret opens the sitting', !!sit5.st, 'startConvo null');
  T.ok('guard (5a) the volunteered secret sets the sitting flag',
    G.convoGet(sit5.vid).confessedThisSitting === true,
    'flag=' + JSON.stringify(G.convoGet(sit5.vid).confessedThisSitting));
  const p5 = G.getPerson(sit5.vid);
  p5.lies = { occupation: { told: 'a midwife', truth: 'a Baker', motive: 'shame', field: 'occupation' } };
  const d5 = G.addDoubt(sit5.vid, 'observation',
    `${G.firstRef(sit5.vid)} claims to be a midwife, but the hands say otherwise.`,
    [`claims "a midwife"`, 'observed: flour under the nails'], { field: 'occupation' });
  const r5 = confrontForced(sit5.vid, d5.id);
  T.ok('guard (5b) the confrontation after a volunteered secret deflects',
    !!r5 && r5.outcome === 'deflected', 'outcome=' + JSON.stringify(r5 && r5.outcome));
  endSitting(sit5.vid);
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
