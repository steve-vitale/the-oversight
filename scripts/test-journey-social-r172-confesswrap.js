'use strict';
// test-journey-social-r172-confesswrap.js -- R172 B1 driver-instrument proof.
// DRIVER WRAP ARTIFACT (journey-social r172 2026-11-10): the driver's
// confront wraps recorded BOTH the outer confrontDoubt call and the inner
// confrontTheft call it routes to, so ONE theft press produced TWO
// 'confessed' events in the same sitting — and the analyzer counted a
// phantom theft+doubt double (panel s69; the confirm re-run's 43402
// "double" was the same single press). The real double count in the
// panel was 2 (s139, s167), not 3. The wrap must record exactly one
// event per press: only the outermost wrapped call records, and the
// event is labeled by the doubt's real path (a theft doubt resolves via
// confrontTheft even when the outer call is confrontDoubt).
// This test runs the driver itself (SEED=43402, DAYCAP=13) into a temp
// dir: seed 43402's first confrontation is the day-9 doubt press in
// sitting 10, and no other confrontation fires before day 13, so the
// output must hold exactly one confrontEvent — the doubt confession,
// once. (The guard proof itself lives in
// test-journey-social-r172-confessguard.js; this test proves the
// instrument that counts doubles does not invent them.)
// RE-PIN (journey-social r180, 2026-11-11): the r172 pin was the
// day-12 theft press in sitting 14. On the reconciled base (Cursor
// dawn scorer landed) the scenario moved: seed 43402's first
// confrontation is now a day-9 doubt confession (sitting 10), and NO
// theft confrontation fires on seeds 43401–43404 within 30 days
// (probed 2026-11-11: 0 confrontTheft events in 4×30d). The theft
// press no longer exists to pin on this base — the theft-label path
// (a theft doubt resolving via confrontTheft) is panel-watched by
// the r180 panel instead. The one-event-per-press property this test
// proves is unchanged; only the pinned scenario moved.
// RED/FAILURE MODE: the unfixed wrap records two events for the one
// press (confrontTheft + confrontDoubt, both 'confessed'), so the
// length assertion fails. If the driver ever stops reaching the day-12
// sitting, the setup assertion fails first (no events at all).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('R172 confront-wrap records one event per press (driver)');

(() => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r172-confesswrap-'));
  try {
    execFileSync(process.execPath, [
      path.join(__dirname, 'journey-social-life-r172-20261110.js'),
    ], {
      env: { ...process.env, SEEDS: '43402', DAYCAP: '13', OUTDIR: tmp },
      stdio: 'pipe', timeout: 120000,
    });
    const outFile = path.join(tmp, 'journey-social-life-r172-43402.json');
    T.ok('setup: the driver wrote the seed JSON', fs.existsSync(outFile), 'tmp=' + tmp);
    const ev = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    const confronts = ev.confrontEvents || [];
    console.log('  confrontEvents: ' + JSON.stringify(confronts));
    T.ok('wrap (1) exactly one event is recorded for the day-9 doubt press',
      confronts.length === 1, 'count=' + confronts.length);
    const e0 = confronts[0] || {};
    T.ok('wrap (2) the single event is the doubt confession, labeled by its real path',
      e0.method === 'confrontDoubt' && e0.outcome === 'confessed',
      'event=' + JSON.stringify(e0));
    const bySitting = {};
    for (const e of confronts) {
      if (e.outcome !== 'confessed') continue;
      (bySitting[e.sitting] = bySitting[e.sitting] || []).push(e);
    }
    const doubles = Object.entries(bySitting).filter(([, list]) => list.length > 1);
    T.ok('wrap (3) no sitting counts a double confession from this press',
      doubles.length === 0, 'doubles=' + JSON.stringify(doubles));
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* temp cleanup best-effort */ }
  }
  T.done();
})();
