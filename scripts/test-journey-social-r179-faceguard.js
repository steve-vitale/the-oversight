'use strict';
// test-journey-social-r179-faceguard.js -- R179 B4 proof.
// ONE FACE LINE PER SITTING (journey-social r179 2026-11-11): the fresh
// panel showed 15 verbatim accuseFace repeats in one sitting on seed
// 43503 (gen_ffww7mv: 'The easy manner evaporates' x3 in a single
// D-talk-request sitting; 52 face lines, 15 dup sittings, all face
// beats, 0 coach repeats). drawTruthLine's per-game no-repeat recycles
// the 6-line accuseFace pool after 6 draws, so a sitting that presses
// doubt 7+ times re-serves the same face. A villager's face does not
// do the same thing twice in one interrogation: if this sitting already
// heard this exact face line, say nothing instead of repeating it —
// the r167 coach-guard pattern, applied to accuseFace.
// Cases (engine, real Game; Math.random stubbed to 0.0 so every draw
// takes the first fresh pool index — deterministic recycle on press 7):
// (1) control: the first windup in a sitting produces a face beat from
//     the accuseFace pool;
// (2) 8 windups in ONE sitting: the 6 face beats are all distinct, and
//     presses 7-8 produce NO face beat (the recycled draw is suppressed);
// (3) a NEW sitting resets the guard, so the first windup there produces
//     a face beat again (the guard is per-sitting, not per-life).
// RED/FAILURE MODE: (2) shows a repeated face text on press 7 or 8
// while the guard is absent (the recycled draw is served verbatim).
// (1) fails while the guard blocks the FIRST face; (3) fails while the
// flag leaks across sittings (the fresh sitting shows no face).
const K = require('./godpath/lib');
const T = K.reporter('R179 one-face-line-per-sitting guard (engine)');
const FACE_POOL = [
  'Something crosses their face',
  'They go very still',
  'A flicker at the corner',
  'Their eyes do the math',
  'The easy manner evaporates',
  'They glance toward the fire',
];

(async () => {
  const G = await K.load({ seed: 43507 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  const seededRandom = Math.random;
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
  function plantLiar() {
    const v = G.state.village;
    const vid = v.roster.find(id => id !== G.villagerId && !G.getPerson(id).dead);
    if (!vid) throw Error('setup: no roster villager left');
    const p = G.getPerson(vid);
    p.languages = { native: 'english' };
    v.away = {};
    v.trust = v.trust || {}; v.trust[vid] = 50;
    p.lies = {
      occupation: { told: 'a midwife', truth: 'a Baker', motive: 'shame', field: 'occupation' },
    };
    const doubt = G.addDoubt(vid, 'observation',
      `${G.firstRef(vid)} claims to be a midwife, but the hands say otherwise.`,
      [`claims "a midwife"`, 'observed: flour under the nails'], { field: 'occupation' });
    return { vid, doubt, lie: p.lies.occupation };
  }
  // One windup press; returns the face beat text or null.
  function pressFace(L) {
    Math.random = () => 0.0;
    let beats = null;
    try { beats = G.confrontWindup(L.vid, L.doubt, L.lie); } finally { Math.random = seededRandom; }
    if (!Array.isArray(beats)) return null;
    const face = beats.find(b => b && b.who === 'narr' && typeof b.text === 'string' && !b.text.startsWith('*'));
    return face ? face.text : null;
  }

  setup(4);
  const L = plantLiar();
  T.ok('setup: liar planted with one doubt', !!L.doubt, 'doubt=' + JSON.stringify(!!L.doubt));
  const st = G.startConvo(L.vid);
  T.ok('setup: sitting opens', !!st, 'startConvo null');
  // (1) control: first windup produces a face beat from the pool.
  const f1 = pressFace(L);
  console.log('  press 1 face: ' + JSON.stringify(f1));
  T.ok('guard (1a) first windup in the sitting shows a face',
    typeof f1 === 'string' && f1.length > 0, 'face=' + JSON.stringify(f1));
  T.ok('guard (1b) the face comes from the accuseFace pool',
    typeof f1 === 'string' && FACE_POOL.some(p => f1.indexOf(p) === 0),
    'face=' + JSON.stringify(f1));
  // (2) 8 windups in one sitting: 6 distinct faces, then silence.
  const faces = [f1];
  for (let i = 2; i <= 8; i++) faces.push(pressFace(L));
  console.log('  faces: ' + JSON.stringify(faces));
  const seen = faces.filter(Boolean);
  T.ok('guard (2a) six distinct faces across the first six presses',
    new Set(seen.slice(0, 6)).size === 6, 'distinct=' + new Set(seen.slice(0, 6)).size + ' faces=' + JSON.stringify(seen.slice(0, 6)));
  T.ok('guard (2b) presses 7-8 produce no face beat (recycled draw suppressed)',
    faces[6] === null && faces[7] === null, 'press7=' + JSON.stringify(faces[6]) + ' press8=' + JSON.stringify(faces[7]));
  T.ok('guard (2c) no face text repeats verbatim in the sitting',
    new Set(seen).size === seen.length, 'seen=' + seen.length + ' distinct=' + new Set(seen).size);
  endSitting(L.vid);
  // (3) new sitting: the guard resets, a face shows again.
  const st3 = G.startConvo(L.vid);
  T.ok('setup (3): new sitting opens', !!st3, 'startConvo null');
  const f3 = pressFace(L);
  T.ok('guard (3) a fresh sitting shows a face again',
    typeof f3 === 'string' && f3.length > 0, 'face=' + JSON.stringify(f3));
  endSitting(L.vid);
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
