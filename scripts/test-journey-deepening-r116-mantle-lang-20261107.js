'use strict';
// test-journey-deepening-r116-mantle-lang-20261107.js -- R116 Q1 fix proof.
// The language arc's payoff died with the bearer: mantleBecome reset
// scholar.languages to the heir's own tongues but left langExposure at
// 25, and the 25-grant only fires on a crossing (before<25), so the
// heir could never re-earn the tongue: comm 'none' forever on 25
// exposure (seed 96401 after-panel, probe-logged: Turkish granted day
// 61 to Ursula Weber, wiped by succession day 63, exposure stayed 25
// to day 100 through 9 successions).
// (1) after a succession, exposure for tongues the heir doesn't know is reset;
// (2) exposure for a tongue the heir DOES know is kept (harmless);
// (3) the heir can re-earn the tongue end to end: 25 gains from the
//     post-mantle state grant it at level 1;
// (4) commLevel flips 'none' -> 'partial' for a native speaker once re-earned.
// RED/FAILURE MODE: (1) and (3) fail on the old code (exposure stays 25;
// the re-earn gains run 25->50 with no crossing, so no grant ever fires).
const K = require('./godpath/lib');
const T = K.reporter('R116 mantle + language exposure (succession keeps the arc alive)');
(async () => {
  const G = await K.load({ seed: 11608 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };
  // ONE newRun: it regenerates the roster and resets the scholar.
  K.newRun(G);
  const v = G.state.village, s = G.state.scholar;
  const heirId = v.roster.find(id => id !== G.villagerId && !G.getPerson(id).dead);
  const spkId = v.roster.find(id => id !== G.villagerId && id !== heirId && !G.getPerson(id).dead);
  if (!heirId || !spkId) throw Error('setup: roster too small for heir + speaker');
  const heir = G.getPerson(heirId);
  heir.languages = { native: 'english', levels: { english: 2, german: 2 } };
  const spk = G.getPerson(spkId);
  spk.languages = { native: 'turkish' };
  // The dead bearer's earned state: Turkish learned via the arc at 25,
  // plus 7 exposure in German (a tongue the heir happens to know).
  s.languages = { english: 2, turkish: 1 };
  s.langExposure = { turkish: 25, german: 7 };
  T.ok('setup: comm is partial for a Turkish-only villager before the succession',
    (G.commLevel(spkId) || {}).level === 'partial', JSON.stringify(G.commLevel(spkId)));
  // The succession.
  const ok = G.mantleBecome(G.villagerId, heirId);
  T.ok('mantle succeeds', ok === true, String(ok));
  T.ok('(1) exposure for the unknown tongue resets on succession',
    ((G.state.scholar.langExposure || {}).turkish | 0) === 0,
    'turkish exposure=' + JSON.stringify((G.state.scholar.langExposure || {}).turkish));
  T.ok('(2) exposure for a tongue the heir knows is kept',
    ((G.state.scholar.langExposure || {}).german | 0) === 7,
    'german exposure=' + JSON.stringify((G.state.scholar.langExposure || {}).german));
  T.ok('(2b) heir languages are the heir\'s own (no Turkish)',
    ((G.state.scholar.languages || {}).turkish | 0) === 0,
    JSON.stringify(G.state.scholar.languages));
  T.ok('setup: comm is none for the heir (no Turkish yet)',
    (G.commLevel(spkId) || {}).level === 'none', JSON.stringify(G.commLevel(spkId)));
  // (3) the heir re-earns it end to end: 25 single gains from the
  // post-mantle state (sittings + wake-ups, as the arc earns them).
  for (let i = 0; i < 25; i++) G.langExposureGain(spkId, 'turkish', 1);
  T.ok('(3) the heir re-earns the tongue at 25 (grant fires)',
    ((G.state.scholar.languages || {}).turkish | 0) === 1,
    'exposure=' + G.langExposure('turkish') + ' langs=' + JSON.stringify(G.state.scholar.languages));
  T.ok("(4) commLevel flips 'none' -> 'partial' once re-earned",
    (G.commLevel(spkId) || {}).level === 'partial', JSON.stringify(G.commLevel(spkId)));
  T.done();
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
