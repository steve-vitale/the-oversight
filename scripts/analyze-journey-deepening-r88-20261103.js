// analyze-journey-deepening-r88-20261103.js -- R88 M4-LOOP + M5 analyzer
// (tooling only, zero game code). Reads per-seed JSONs and transcript files
// written by scripts/journey-deepening-r88-20261103.js and reports the
// pre-registered M4-LOOP verdict plus descriptive M5.
//
// M4-LOOP (binding): PASS iff 0 transcripts contain the same NPC line 3+
// times in one sitting AND 0 sittings offer dlg:commit after a REFUSED
// commit. A refused commit is a dlg:commit press after which the want did
// NOT resolve as promised/engaged: post-fix it resolves as 'stated'
// (stage 3), pre-fix it stays live (stage < 3). A later offered
// dlg:commit in the same sitting is flagged for the run note to adjudicate
// (a genuinely new want surfacing mid-sitting would also re-offer -- the
// flag names the file; the note decides, it is not auto-excused).
//
// Transcript format (driver-written): per-turn "(offered=...)" lines,
// "YOU: [<id>] ..." picks, "THEM: ..." NPC lines, and "(want=<id>
// stage=<n>)" state lines, plus a "want final: ... resolution=..." footer.
// The scan reads the FILE lines (the human-readable transcript), not the
// engine transcript object -- the file is what the people check reads.
//
// Usage: node scripts/analyze-journey-deepening-r88-20261103.js [evidir]
//   EVIDIR env overrides the default goal hidden_files evidence dir.
// When required as a module it exports scanTranscript.
'use strict';
const fs = require('fs');
const path = require('path');
const DEFAULT_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-03');

function scanTranscript(text) {
  const lines = String(text || '').split('\n');
  const themLines = [];
  for (const l of lines) {
    const m = /^THEM: (.*)$/.exec(l);
    if (m) themLines.push(m[1]);
  }
  const counts = {};
  for (const l of themLines) counts[l] = (counts[l] || 0) + 1;
  let maxRepeat = 0, maxLine = null;
  for (const [l, n] of Object.entries(counts)) {
    if (n > maxRepeat) { maxRepeat = n; maxLine = l; }
  }
  // Turn walk: track refused-commit state and later re-offers. A press
  // counts as a refusal only when the want was LIVE before the press
  // (stage < 3, or unknown when no prior want line exists): a press on an
  // already-resolved want is a decided-want press, not a second refusal.
  let commitPresses = 0, refusedCommits = 0, reofferAfterRefusal = false;
  let pendingCommit = false; // a dlg:commit was just pressed, awaiting its want line
  let pendingPreStage = null; // want stage just before that press (null = unknown)
  let refusedPending = false; // a refused commit happened earlier in this sitting
  let lastStage = null;
  const isSuccess = (stage, res) =>
    stage === 3 && ['promised', 'engaged', 'comforted', 'heeded', 'repaid'].indexOf(res) !== -1;
  for (const l of lines) {
    const off = /^\(offered=(.*)\)$/.exec(l);
    if (off) {
      const ids = off[1] ? off[1].split(',') : [];
      if (refusedPending && ids.indexOf('dlg:commit') !== -1) reofferAfterRefusal = true;
      continue;
    }
    const you = /^YOU: \[([^\]]+)\]/.exec(l);
    if (you) {
      if (you[1] === 'dlg:commit') { commitPresses++; pendingCommit = true; pendingPreStage = lastStage; }
      continue;
    }
    const want = /^\(want=(\S+) stage=(\d+)(?: resolution=(\S+))?\)/.exec(l);
    if (want) {
      const stage = parseInt(want[2], 10);
      const res = want[3] || null;
      if (pendingCommit) {
        pendingCommit = false;
        // Successful: stage 3 + promised/engaged-family resolution. Anything
        // else after a commit press on a live want is a refusal (stated,
        // deflected, or still live pre-fix).
        if ((pendingPreStage === null || pendingPreStage < 3) && !isSuccess(stage, res)) {
          refusedCommits++; refusedPending = true;
        }
      }
      lastStage = stage;
      continue;
    }
    const fin = /^want final: id=(\S+) stage=(\d+) resolution=(\S+)/.exec(l);
    if (fin && pendingCommit) {
      // Sitting ended on the commit press with no further want line: judge
      // from the footer the same way.
      pendingCommit = false;
      const stage = parseInt(fin[2], 10);
      const res = fin[3];
      if ((pendingPreStage === null || pendingPreStage < 3) && !isSuccess(stage, res)) {
        refusedCommits++; refusedPending = true;
      }
    }
  }
  return {
    themLines: themLines.length, maxRepeat, maxLine,
    loop: maxRepeat >= 3,
    commitPresses, refusedCommits, reofferAfterRefusal,
  };
}

if (require.main === module) {
  const dir = process.argv[2] || process.env.R88_EVIDIR || DEFAULT_EVIDIR;
  let tfiles = [], sfiles = [];
  try {
    tfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r88-transcript-\d+-day\d+\.txt$/.test(f)).sort();
    sfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r88-seed\d+\.json$/.test(f)).sort();
  } catch (e) { console.log('EVIDIR read failed: ' + e.message); process.exit(1); }
  if (!tfiles.length) { console.log('No r88 transcripts in ' + dir); process.exit(1); }
  let loopFiles = [], reofferFiles = [], totalPresses = 0, totalRefused = 0;
  console.log('=== R88 M4-LOOP PANEL SCAN ===');
  for (const f of tfiles) {
    const s = scanTranscript(fs.readFileSync(path.join(dir, f), 'utf8'));
    totalPresses += s.commitPresses; totalRefused += s.refusedCommits;
    if (s.loop) loopFiles.push({ file: f, maxRepeat: s.maxRepeat, line: (s.maxLine || '').slice(0, 120) });
    if (s.reofferAfterRefusal) reofferFiles.push(f);
    console.log(`${f}: them=${s.themLines} maxRepeat=${s.maxRepeat} commitPresses=${s.commitPresses} refused=${s.refusedCommits} reofferAfterRefusal=${s.reofferAfterRefusal}`);
  }
  let villagesAlive = 0, seedsN = 0, mislabels = 0;
  for (const f of sfiles) {
    try {
      const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      seedsN++;
      const alive = (s.census || []).filter(c => c.alive).length;
      if (alive > 0) villagesAlive++;
      mislabels += ((s.deathHonesty || {}).mislabels || []).length;
      console.log(`${f}: end=${s.endReason || null} maxDay=${s.maxGameDay || null} wave=${s.finalWave || null} alive=${alive}/${(s.census || []).length} mislabels=${((s.deathHonesty || {}).mislabels || []).length}`);
    } catch (e) { console.log(`${f}: JSON read failed: ${e.message}`); }
  }
  console.log('--- verdicts ---');
  console.log(`transcripts=${tfiles.length} loopFiles=${loopFiles.length} reofferFiles=${reofferFiles.length} commitPresses=${totalPresses} refused=${totalRefused}`);
  if (loopFiles.length) console.log('LOOP FILES: ' + JSON.stringify(loopFiles));
  if (reofferFiles.length) console.log('REOFFER FILES: ' + JSON.stringify(reofferFiles));
  console.log('M4-LOOP: ' + ((loopFiles.length === 0 && reofferFiles.length === 0) ? 'PASS' : 'NO-GO'));
  console.log(`M5 winnable (descriptive): villagesAlive=${villagesAlive}/${seedsN} mislabels=${mislabels}`);
}
module.exports = { scanTranscript };
