// Diagnostic only: does loading the game + running a short sim break
// subsequent file writes in the same process? Writes a probe file
// BEFORE the sim, runs 5 days, writes a probe file AFTER the sim,
// and reports both outcomes on stderr (pipe-safe) + stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
function probe(name) {
  try {
    fs.writeFileSync(path.join(REPO, 'evidence', '2026-11-05', name), 'probe\n');
    console.error('PROBE-OK ' + name);
    return true;
  } catch (e) {
    console.error('PROBE-FAIL ' + name + ' ' + (e && e.code));
    return false;
  }
}
(async function () {
  probe('diag-pre-sim.txt');
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const { Game } = await loadGame({ seed: 99117, mode: 'competent-diag', fullTelemetry: false });
  await setupGame(Game);
  await quietLog(async function () { await runDays(Game, competent, { days: 5, manifest: undefined, sampleEvery: 30 }); });
  console.error('SIM-DONE days=' + ((Game.state && Game.state.scholar && Game.state.scholar.day) || '?'));
  try { console.error('UMASK-AFTER=' + process.umask()); } catch (e) { console.error('UMASK-ERR ' + e.code); }
  try { console.error('FD-COUNT-AFTER=' + fs.readdirSync('/proc/self/fd').length); } catch (e) { console.error('FD-ERR ' + e.code); }
  try {
    const fd = fs.openSync(path.join(REPO, 'evidence', '2026-11-05', 'diag-open-write.txt'), 'w');
    console.error('OPEN-OK fd=' + fd);
    try { fs.writeSync(fd, 'hello\n'); console.error('FD-WRITE-OK'); } catch (e) { console.error('FD-WRITE-FAIL ' + (e && e.code)); }
    try { fs.closeSync(fd); } catch (e) {}
  } catch (e) { console.error('OPEN-FAIL ' + (e && e.code)); }
  probe('diag-post-sim.txt');
  probe('diag-post-sim-2.txt');
  try { fs.writeFileSync('/dev/null', 'x'); console.error('DEVNULL-OK'); } catch (e) { console.error('DEVNULL-FAIL ' + (e && e.code)); }
  console.error('DIAG-COMPLETE');
})().catch(function (e) { console.error('DIAG-ERROR ' + (e && e.stack)); process.exitCode = 1; });
