#!/usr/bin/env node
// test-sim-heraldkill-a.js — proof test for the Herald-kill arm (DIAG ONLY).
//   node scripts/test-sim-heraldkill-a.js
//     (synthetic only: builds a tiny fixture corpus in /tmp, runs the
//     analyzer on it, asserts K / replacement / frozen derivation.)
//   node scripts/test-sim-heraldkill-a.js <judgedDir> <analysisJson> [probeDir]
//     (synthetic + corpus legs: recomputes every analysis per-seed value
//     from the raw judged JSONs; when a probe dir is passed, checks the
//     probe legs for each kill seed: early snapshot matches the corpus
//     (Herald absent, omen = frozen stage), full probe slain=false and
//     call/commit returns recorded.)
// Exits non-zero on any failure. Prints "N passed, 0 failed" on green.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { passed++; }
  else { failed++; failures.push(name + (detail ? ' :: ' + JSON.stringify(detail) : '')); }
}
function runAnalyzer(dir, out) {
  execSync('node ' + path.join(__dirname, 'sim-heraldkill-a-analyze.js') + ' ' + dir + ' ' + out,
    { stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(fs.readFileSync(out, 'utf8'));
}
function fixtureSeed(seed, o) {
  return Object.assign({
    seed, anchorCommit: 'test', captureErrs: 0,
    contacts: [], lairs: [], removals: [], dawns: [], sayLines: [],
    endHerald: { present: false, tile: null, omenStage: 2 },
    days: 181, gameDays: 181, endReason: 'survived', endScaleRank: 'regional',
    maxWave: 4, national: 0, table: 0, won: 0,
  }, o);
}

// ---- Synthetic: fixture corpus in /tmp (never in the repo) ----
(function synthetic() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'heraldkill-test-'));
  const kill = fixtureSeed(1, {
    contacts: [{ day: 100, channel: 'villager', outcome: 'vKill', vid: 'v1', heraldTile: null }],
    lairs: [{ day: 50, tx: 7, ty: 4 }],
    removals: [{ day: 100, tx: 4, ty: 4 }],
    dawns: [
      { day: 99, omenStage: 2, heraldTile: { x: 4, y: 4 } },
      { day: 101, omenStage: 2, heraldTile: null },
      { day: 102, omenStage: 2, heraldTile: null },
    ],
  });
  const nokill = fixtureSeed(2, {
    contacts: [{ day: 90, channel: 'scholar', outcome: 'refused', heraldTile: { x: 4, y: 4 } }],
    lairs: [{ day: 50, tx: 7, ty: 4 }],
    dawns: [{ day: 99, omenStage: 2, heraldTile: { x: 4, y: 4 } }],
    endHerald: { present: true, tile: { x: 4, y: 4 }, omenStage: 2 },
  });
  const replaced = fixtureSeed(3, {
    contacts: [{ day: 100, channel: 'villager', outcome: 'vKill', vid: 'v9', heraldTile: null }],
    lairs: [{ day: 50, tx: 7, ty: 4 }, { day: 120, tx: 8, ty: 4 }],
    removals: [{ day: 100, tx: 4, ty: 4 }],
    dawns: [
      { day: 99, omenStage: 2, heraldTile: { x: 4, y: 4 } },
      { day: 101, omenStage: 2, heraldTile: null },
      { day: 121, omenStage: 2, heraldTile: { x: 8, y: 4 } },
    ],
  });
  fs.writeFileSync(path.join(tmp, 's1.json'), JSON.stringify(kill));
  fs.writeFileSync(path.join(tmp, 's2.json'), JSON.stringify(nokill));
  fs.writeFileSync(path.join(tmp, 's3.json'), JSON.stringify(replaced));
  const a = runAnalyzer(tmp, path.join(tmp, 'out.json'));
  check('synth-K', a.K === 2, { K: a.K });
  const p1 = a.perSeed.find(p => p.seed === 1), p3 = a.perSeed.find(p => p.seed === 3);
  check('synth-kill-no-replacement', p1.replacement === false, p1);
  check('synth-kill-frozen', p1.omenFrozen === true, p1);
  check('synth-kill-day', p1.killDay === 100 && p1.killerVid === 'v1', p1);
  check('synth-replaced-detected', p3.replacement === true, p3);
  check('synth-nokill-excluded', a.perSeed.find(p => p.seed === 2).kills === 0, {});
  check('synth-summary', a.summary.allReplacementZero === false, a.summary);
})();

// ---- Corpus legs (only when a judged dir + analysis are passed) ----
const judgedDir = process.argv[2];
const analysisPath = process.argv[3];
const probeDir = process.argv[4];
if (judgedDir && analysisPath) {
  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  const files = fs.readdirSync(judgedDir).filter(f => f.endsWith('.json')).sort();
  check('corpus-count-matches', analysis.seeds === files.length, { analysis: analysis.seeds, files: files.length });
  for (const f of files) {
    const s = JSON.parse(fs.readFileSync(path.join(judgedDir, f), 'utf8'));
    check('corpus-' + s.seed + '-capture-clean', s.captureErrs === 0, { seed: s.seed, errs: s.captureErrors });
    check('corpus-' + s.seed + '-has-end-fields', s.endReason != null && s.gameDays != null && s.endScaleRank != null, { seed: s.seed });
    check('corpus-' + s.seed + '-instrument', s.instrument === 'heraldarr2-a-v1', { seed: s.seed });
    const p = (analysis.perSeed || []).find(x => x.seed === s.seed);
    check('corpus-' + s.seed + '-in-analysis', !!p, { seed: s.seed });
    if (!p) continue;
    const kills = (s.contacts || []).filter(c => c.outcome === 'vKill');
    check('corpus-' + s.seed + '-kill-count-agrees', p.kills === kills.length, { seed: s.seed, analysis: p.kills, corpus: kills.length });
    if (kills.length) {
      const kd = kills[0].day;
      const postDawns = (s.dawns || []).filter(d => d.day > kd);
      const postPresent = postDawns.filter(d => !!d.heraldTile).length;
      const postLairs = (s.lairs || []).filter(l => l.day > kd).length;
      check('corpus-' + s.seed + '-replacement-agrees', p.replacement === (postLairs > 0 || postPresent > 0),
        { seed: s.seed, analysis: p.replacement, postLairs, postPresent });
      const killDawn = (s.dawns || []).filter(d => d.day <= kd).slice(-1)[0];
      const frozen = postDawns.every(d => d.omenStage === (killDawn ? killDawn.omenStage : null));
      check('corpus-' + s.seed + '-frozen-agrees', p.omenFrozen === frozen, { seed: s.seed, analysis: p.omenFrozen, recomputed: frozen });
      check('corpus-' + s.seed + '-kill-day-agrees', p.killDay === kd, { seed: s.seed });
      check('corpus-' + s.seed + '-end-fields-agree',
        p.gameDays === s.gameDays && p.endScaleRank === s.endScaleRank && p.maxWave === s.maxWave,
        { seed: s.seed });
      if (probeDir) {
        const earlyF = path.join(probeDir, 's' + s.seed + '-probe-early.json');
        const fullF = path.join(probeDir, 's' + s.seed + '-probe-full.json');
        check('probe-' + s.seed + '-early-present', fs.existsSync(earlyF), { seed: s.seed });
        check('probe-' + s.seed + '-full-present', fs.existsSync(fullF), { seed: s.seed });
        if (fs.existsSync(earlyF)) {
          const e = JSON.parse(fs.readFileSync(earlyF, 'utf8'));
          check('probe-' + s.seed + '-early-herald-absent', e.snapBeforeCall.heraldPresent === false, e.snapBeforeCall);
          check('probe-' + s.seed + '-early-omen-matches', e.snapBeforeCall.omenStage === p.omenAtKillDawn,
            { seed: s.seed, probe: e.snapBeforeCall.omenStage, corpus: p.omenAtKillDawn });
          check('probe-' + s.seed + '-early-slain-false', e.snapBeforeCall.slainHerald === false, e.snapBeforeCall);
        }
        if (fs.existsSync(fullF)) {
          const fl = JSON.parse(fs.readFileSync(fullF, 'utf8'));
          check('probe-' + s.seed + '-full-slain-false', fl.snapBeforeCall.slainHerald === false, fl.snapBeforeCall);
          check('probe-' + s.seed + '-full-call-recorded', !!(fl.callProbe && fl.callProbe.callReturn), { seed: s.seed });
          check('probe-' + s.seed + '-full-commit-recorded', !!(fl.callProbe && fl.callProbe.commitTap1 && fl.callProbe.commitTap2), { seed: s.seed });
        }
      }
    }
  }
  check('verdict-K-agrees', analysis.K === analysis.perSeed.filter(p => p.kills > 0).length, { K: analysis.K });
}

if (failed > 0) {
  console.error(failures.slice(0, 40).join('\n'));
  console.error(passed + ' passed, ' + failed + ' failed');
  process.exit(1);
}
console.log(passed + ' passed, 0 failed');
