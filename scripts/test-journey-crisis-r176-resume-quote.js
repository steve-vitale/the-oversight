'use strict';
// test-journey-crisis-r176-resume-quote.js -- R176 F4 (Q10 graduation) proof.
// RESUME QUOTES A SILENCE LINE AS THE MEMORY (journey-crisis r176):
// the resume opener quoted the sitting's closing silence as the thread's
// content — "We never finished talking about what's been happening —
// 'You say nothing. Neither do they, for a while — and it's fine.'" —
// 6 sightings this panel (14301 d20, 14302 d87, 14303 d36, 14304 d24,
// 14304 d32, 14304 d76), the FOURTH consecutive panel at >= 1 (r156: 2,
// r164: 1, r168: 1). Root cause: the R19 real-beat gate
// (convoSnippetIsRealBeat) rejected fillers and deflections, but the
// mood-silence lines are stage direction, not content — 13 words, not a
// deflection, so they passed — and the sitting's last beat on a thread is
// usually its closing silence, so the plant carried the silence line and
// the resume quoted it. Same hole for subject-change bridges: 'Look,
// forget it. You wanted something?' (14302 d87) is a floor-hander, not
// the topic's proposition. Fix: the gate also rejects silence-pool lines
// (convoMoodSilenceLines) and bridge lines (convoBridgeLines); the plant
// then walks back to substance (or plants nothing), and the resume-time
// guard drops quotes planted before the fix.
// Cases (engine, real Game; one process, K.newRun per case):
// (1) silence walk-back: substance, then silence -> last snippet is the substance.
// (2) silence-only thread -> last snippet is null.
// (3) bridge walk-back: substance, then a want-bridge -> substance.
// (4) bridge-only thread -> null.
// (5) control: substance as the last beat -> returned verbatim.
// (6) gate units: every silence-pool line and every bridge line fails
//     the real-beat gate; real content lines pass.
// (7) plant ghost: convoThreadOpen with a silence snippet plants
//     nothing; with substance it plants.
// (8) resume guard (pre-fix plant): an open thread carrying a silence
//     snippet resumes WITHOUT the quoted silence line.
// RED/FAILURE MODE: on the unfixed code (1) returns the silence line,
// (2)/(4) return the silence/bridge line instead of null, (6) passes the
// silence/bridge lines as real beats, (7) plants the silence snippet,
// (8) resumes with 'You say nothing...' quoted. (5) passes either way.
const K = require('./godpath/lib');
const T = K.reporter('R176 resume quotes a silence line (engine)');

const SILENCE = 'You say nothing. Neither do they, for a while — and it\'s fine.';
const SILENCE2 = 'A comfortable quiet settles. They smile a little, and let it be.';
const BRIDGE = '"Look, forget it. You wanted something?"';
const SUBSTANCE = 'Four seasons, broadleaf woods. Not my woods though. Autumn, maybe? The light\'s going thin.';
const SUBSTANCE2 = 'Dale always took the burnt piece. Said someone had to. I take it now.';

(async () => {
  const G = await K.load({ seed: 43408 });
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
    G.state.systemArrived = true;
    G.state.scholar.codexUnlocked = true;
    const members = (v.roster || []).filter(id => id !== G.villagerId && ((v.health || {})[id] ?? 100) > 0);
    if (!members.length) throw Error('setup: no living roster member');
    const vid = members[0];
    v.trust = v.trust || {};
    v.trust[vid] = 90;
    return vid;
  }

  // (1) silence walk-back.
  let vid = setup();
  G.convoNoteBeat(vid, 'lately', SUBSTANCE);
  G.convoNoteBeat(vid, 'lately', SILENCE);
  let sn = G.convoLastThreadSnippet(vid, 'lately');
  T.ok('(1) silence walk-back returns the substance', sn === SUBSTANCE, 'snippet=' + JSON.stringify(sn));

  // (2) silence-only thread.
  vid = setup();
  G.convoNoteBeat(vid, 'lately', SILENCE2);
  sn = G.convoLastThreadSnippet(vid, 'lately');
  T.ok('(2) silence-only thread yields null', sn === null, 'snippet=' + JSON.stringify(sn));

  // (3) bridge walk-back.
  vid = setup();
  G.convoNoteBeat(vid, 'want', SUBSTANCE2);
  G.convoNoteBeat(vid, 'want', BRIDGE);
  sn = G.convoLastThreadSnippet(vid, 'want');
  T.ok('(3) bridge walk-back returns the substance', sn === SUBSTANCE2, 'snippet=' + JSON.stringify(sn));

  // (4) bridge-only thread.
  vid = setup();
  G.convoNoteBeat(vid, 'want', BRIDGE);
  sn = G.convoLastThreadSnippet(vid, 'want');
  T.ok('(4) bridge-only thread yields null', sn === null, 'snippet=' + JSON.stringify(sn));

  // (5) control: substance last.
  vid = setup();
  G.convoNoteBeat(vid, 'lately', SUBSTANCE2);
  G.convoNoteBeat(vid, 'lately', SUBSTANCE);
  sn = G.convoLastThreadSnippet(vid, 'lately');
  T.ok('(5) control: substance last is returned verbatim', sn === SUBSTANCE, 'snippet=' + JSON.stringify(sn));

  // (6) gate units over the real pools. The accessors are part of the
  // fix — on unfixed code they are missing, so guard the calls: the
  // cases must FAIL (not crash) there, so the RED run exercises (7)/(8).
  vid = setup();
  const silLines = (typeof G.convoMoodSilenceLines === 'function') ? G.convoMoodSilenceLines() : null;
  T.ok('(6a) silence accessor lists the pools', Array.isArray(silLines) && silLines.length >= 9, 'lines=' + (silLines && silLines.length));
  const silBad = silLines ? silLines.filter(l => G.convoSnippetIsRealBeat(l)) : ['<accessor missing>'];
  T.ok('(6b) every silence line fails the real-beat gate', silBad.length === 0, 'passing=' + JSON.stringify(silBad));
  const brLines = (typeof G.convoBridgeLines === 'function') ? G.convoBridgeLines() : null;
  T.ok('(6c) bridge accessor lists the pools', Array.isArray(brLines) && brLines.length >= 20, 'lines=' + (brLines && brLines.length));
  const brBad = brLines ? brLines.filter(l => G.convoSnippetIsRealBeat(l)) : ['<accessor missing>'];
  T.ok('(6d) every bridge line fails the real-beat gate', brBad.length === 0, 'passing=' + JSON.stringify(brBad));
  T.ok('(6e) real content still passes the gate', G.convoSnippetIsRealBeat(SUBSTANCE) === true && G.convoSnippetIsRealBeat(SUBSTANCE2) === true, 'substance rejected');

  // (7) plant ghost.
  vid = setup();
  G.convoThreadOpen(vid, 'lately', "what's been happening", 'walked away mid-thread', SILENCE);
  let open = G.convoOpenThreads(vid);
  T.ok('(7a) silence snippet plants nothing', open.length === 0, 'open=' + JSON.stringify(open));
  vid = setup();
  G.convoThreadOpen(vid, 'lately', "what's been happening", 'walked away mid-thread', SUBSTANCE);
  open = G.convoOpenThreads(vid);
  T.ok('(7b) substance snippet plants', open.length === 1 && open[0].snippet === SUBSTANCE, 'open=' + JSON.stringify(open));

  // (8) resume guard: a pre-fix plant carrying a silence snippet.
  vid = setup();
  const L = G.convoTopicLedger(vid);
  L.open.push({ tid: 'lately', label: "what's been happening", day: G.state.scholar.day, why: 'walked away mid-thread', snippet: SILENCE });
  let resumed = null;
  for (let i = 0; i < 40 && !resumed; i++) { try { resumed = G.convoResumeOpener(vid); } catch (e) { resumed = null; } }
  T.ok('(8a) resume fires for the planted thread', !!resumed, 'resume never fired in 40 tries');
  if (resumed) {
    const line = String((resumed && resumed.line) || '');
    T.ok('(8b) resume drops the quoted silence line', !line.includes('You say nothing'), 'line=' + JSON.stringify(line));
    T.ok('(8c) resume still names the thread', /never finished talking about/.test(line), 'line=' + JSON.stringify(line));
  }

  T.done();
})().catch(e => { console.error('R176 resume-quote proof CRASH:', e && e.stack || e); process.exit(1); });
