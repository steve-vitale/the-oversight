#!/usr/bin/env node
// test-residual2b.js — proof for sim-residual2b. DIAG only, zero src/js.
// Proves (phase 1, on the committed residualhunt corpus only):
//   - trace reproduction on both targets (LQ dried -800 step, Muscadine
//     -864) via the vendored trace scripts (subprocess, output parsed);
//   - independent recomputation of the family decompositions;
//   - corpus integrity (8 seeds, per-seed counts match the residualhunt
//     census exactly);
//   - hygiene: zero src/js modified, zero sibling files modified, with
//     the pinned-game.js allowance in BOTH hygiene checks (game.js may
//     differ from HEAD only if its blob equals PINNED_GAMEJS_BLOB);
//   - pinned-base discipline: game.js restored to its HEAD blob, backup
//     exists outside the repo.
// Proves (phase 2, reported separately, never changing the phase-1
// verdict): the phase-2 rerun reproduces both steps and its pantry-diff
// log names _removePantryKcal(800) at both steps (plus the
// villageAgencyDaily stack in corpus2).
// Usage: node scripts/test-residual2b.js
// Env: PINNED_GAMEJS_BLOB=b2ba423afdfbdce8c98751ef544f10805b46cfa6
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const CORPUS = path.join(ROOT, 'evidence', '2026-10-27', 'sim-residualhunt-b-corpus');
const P2 = path.join(ROOT, 'evidence', '2026-10-27', 'sim-residual2b-corpus');
const P2B = path.join(ROOT, 'evidence', '2026-10-27', 'sim-residual2b-corpus2');
const PINNED = process.env.PINNED_GAMEJS_BLOB || 'b2ba423afdfbdce8c98751ef544f10805b46cfa6';
let failures = 0;
function ok(cond, msg) {
  if (cond) console.log('PASS ' + msg);
  else { failures++; console.log('FAIL ' + msg); }
}
function run(cmd, args, opts) {
  return execFileSync(cmd, args, Object.assign({ encoding: 'utf8' }, opts || {}));
}
function git(args) {
  return execSync('git --no-optional-locks ' + args, { encoding: 'utf8', cwd: ROOT });
}
function loadCorpus(dir, seed) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const file = files.find(f => f.indexOf('-s' + seed + '.json') >= 0);
  if (!file) throw new Error('no corpus file for seed ' + seed + ' in ' + dir);
  return JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
}
function famOf(nm) { return String(nm || '').replace(/ \((dried|smoked)\)$/, ''); }
function isDried(nm) { return / \((dried|smoked)\)$/.test(String(nm || '')); }
function channelSeries(ps, channel) {
  const out = {};
  for (const sd of (ps.spoilDays || [])) {
    for (const ch of (sd.channels || [])) {
      if (ch.channel === channel) out[sd.day] = { fresh: ch.freshKcal || 0, spoiled: ch.spoiledKcal || 0, stacks: ch.stacks || 0 };
    }
  }
  return out;
}
// ---- 1. corpus integrity: 8 seeds, counts match the residualhunt census
const census = {
  9820: [640, 23, 163, 1249, 255], 9821: [849, 115, 109, 1390, 197],
  9822: [693, 128, 97, 1330, 227], 9823: [465, 237, 107, 1291, 287],
  9824: [501, 73, 73, 1352, 175], 9825: [398, 97, 139, 1468, 462],
  9826: [827, 9, 98, 1366, 313], 9827: [757, 8, 107, 1339, 280],
}; // [stockdoor, direct, dried, mealDraw, inflows]
for (const [seed, want] of Object.entries(census)) {
  const ps = loadCorpus(CORPUS, parseInt(seed, 10));
  const got = [(ps.stockdoorRecords || []).length, (ps.directRecords || []).length,
    (ps.driedEvents || []).length, (ps.mealDrawRecords || []).length, (ps.inflows || []).length];
  ok(JSON.stringify(got) === JSON.stringify(want), `corpus integrity seed ${seed} counts ${got} == census ${want}`);
}
// ---- 2. trace reproduction via the vendored scripts (subprocess)
const famTrace = run('node', [path.join(ROOT, 'scripts', 'trace-residual2b.js'), CORPUS, '9825', 'Muscadine Grapes']);
ok(/within-horizon cumulative divergence=-864/.test(famTrace), 'family trace Muscadine 9825 cumDiv -864');
ok(/post-horizon net \(flows day > 100\)=0/.test(famTrace), 'family trace Muscadine post-horizon 0');
const driedLQ = run('node', [path.join(ROOT, 'scripts', 'trace-residual2b-dried.js'), CORPUS, '9825', "Lamb's Quarters (dried)"]);
ok(/within-horizon cumulative fresh divergence=-120/.test(driedLQ), 'dried trace LQ 9825 cumDiv -120');
ok(/transition #82 days \(81 -> 82\]: fresh 3,840 -> 3,040/.test(driedLQ), 'dried trace LQ step #82 3840->3040');
ok(/transition #100 days \(99 -> 100\]: fresh 4,600 -> 4,600 \(actual=0\) predicted=-680/.test(driedLQ), 'dried trace LQ day-100 draw +680 unreflected');
const driedMu = run('node', [path.join(ROOT, 'scripts', 'trace-residual2b-dried.js'), CORPUS, '9825', 'Muscadine Grapes (dried)']);
ok(/within-horizon cumulative fresh divergence=-864/.test(driedMu), 'dried trace Muscadine 9825 cumDiv -864');
ok(/transition #76 days \(75 -> 76\]: fresh 9,504 -> 8,640/.test(driedMu), 'dried trace Muscadine step #76 9504->8640');
// ---- 3. independent recomputation of the decompositions
function familySplit(ps, family) {
  const opening = {}, closing = {};
  for (const ch of ((ps.openingStock || {}).channels || [])) opening[ch.channel] = ch.freshKcal || 0;
  for (const ch of ((ps.spoilDays || []).slice(-1)[0].channels || [])) closing[ch.channel] = ch.freshKcal || 0;
  let inB = 0, inD = 0, drB = 0, drD = 0, swB = 0, swD = 0, pre = 0, post = 0;
  for (const r of (ps.inflows || [])) {
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    if (famOf(r.name) !== family) continue;
    if (isDried(r.name)) inD += r.kcal || 0; else inB += r.kcal || 0;
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') continue;
    for (const it of (r.items || [])) {
      if (famOf(it.name) !== family) continue;
      const k = (it.units || 0) * (it.kcalEach || 0);
      if (isDried(it.name)) drD += k; else drB += k;
    }
  }
  for (const r of (ps.directRecords || [])) {
    for (const it of (r.items || [])) {
      if (famOf(it.name) !== family) continue;
      const k = (it.units || 0) * (it.kcalEach || 0);
      if (isDried(it.name)) drD += k; else drB += k;
    }
  }
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    for (const bc of ((sw.removed || {}).pantry || {}).byChannel || []) {
      if (famOf(bc.channel) !== family) continue;
      if (isDried(bc.channel)) swD += bc.kcal || 0; else swB += bc.kcal || 0;
    }
  }
  for (const e of (ps.driedEvents || [])) {
    const nm = (e.before && e.before.channel) || (e.after && e.after.channel) || '?';
    if (famOf(nm) !== family) continue;
    pre += e.preKcal || 0; post += e.postKcal || 0;
  }
  const sum = (map, dried) => Object.entries(map).reduce((t, [k, v]) => t + (famOf(k) === family && isDried(k) === dried ? v : 0), 0);
  const baseRes = (sum(closing, false) - sum(opening, false)) - (inB - drB - swB - pre);
  const driedRes = (sum(closing, true) - sum(opening, true)) - (post + inD - drD - swD);
  return { baseRes, driedRes };
}
const ps25 = loadCorpus(CORPUS, 9825);
const mu = familySplit(ps25, 'Muscadine Grapes');
ok(mu.baseRes === 0 && mu.driedRes === -864, `independent Muscadine split base=${mu.baseRes} dried=${mu.driedRes} (expect 0 / -864)`);
const lq = familySplit(ps25, "Lamb's Quarters");
ok(lq.baseRes === 1250 && lq.driedRes === -120, `independent LQ split base=${lq.baseRes} dried=${lq.driedRes} (expect 1250 / -120)`);
// isolated-step stack/spoiled facts (the step is a partial-stack shrink, not a removal or spoilage)
const lqSeries = channelSeries(ps25, "Lamb's Quarters (dried)");
ok(lqSeries[81].fresh === 3840 && lqSeries[82].fresh === 3040 && lqSeries[81].stacks === 3 && lqSeries[82].stacks === 3 && lqSeries[81].spoiled === 0 && lqSeries[82].spoiled === 0,
  'LQ step #82: 3840->3040, stacks 3->3, spoiled 0->0');
const muSeries = channelSeries(ps25, 'Muscadine Grapes (dried)');
ok(muSeries[75].fresh === 9504 && muSeries[76].fresh === 8640 && muSeries[75].stacks === 3 && muSeries[76].stacks === 3 && muSeries[75].spoiled === 0 && muSeries[76].spoiled === 0,
  'Muscadine step #76: 9504->8640, stacks 3->3, spoiled 0->0');
// ---- 4. phase-2 reproduction + pantry-diff naming (reported separately)
const p2 = loadCorpus(P2, 9825);
const p2mu = channelSeries(p2, 'Muscadine Grapes (dried)');
const p2lq = channelSeries(p2, "Lamb's Quarters (dried)");
ok(p2mu[75].fresh === 9504 && p2mu[76].fresh === 8640, 'phase-2 reproduces Muscadine step 9504->8640');
ok(p2lq[81].fresh === 3840 && p2lq[82].fresh === 3040, 'phase-2 reproduces LQ step 3840->3040');
const raids = (p2.pantrydiffLog || []).filter(e => e.fn === '_removePantryKcal');
ok(raids.length === 2, `phase-2 pantry-diff has exactly 2 _removePantryKcal entries (got ${raids.length})`);
if (raids.length === 2) {
  const byDay = {}; for (const r of raids) byDay[r.day] = r;
  ok(byDay[75] && byDay[75].args[0] === '800' && byDay[75].diffs[0].stack === 'Muscadine Grapes (dried)' && byDay[75].diffs[0].before === 44 && byDay[75].diffs[0].after === 32,
    'phase-2 raid day 75: _removePantryKcal(800), Muscadine dried 44u->32u (=864)');
  ok(byDay[81] && byDay[81].args[0] === '800' && byDay[81].diffs[0].stack === "Lamb's Quarters (dried)" && byDay[81].diffs[0].before === 55 && byDay[81].diffs[0].after === 35,
    'phase-2 raid day 81: _removePantryKcal(800), LQ dried 55u->35u (=800)');
}
const p2b = loadCorpus(P2B, 9825);
const stacks = (p2b.pantrydiffLog || []).filter(e => e.fn === '_removePantryKcal' && e.stack);
ok(stacks.length === 2 && stacks.every(e => /villageAgencyDaily/.test(e.stack || '')),
  'phase-2 stack rerun: both raids called from villageAgencyDaily');
// ---- 5. hygiene, with the pinned-game.js allowance in BOTH checks
const allowedOwn = new Set([
  'evidence/2026-10-27/sim-residual2b-prereg.md',
  'evidence/2026-10-27/sim-residual2b.md',
  'scripts/trace-residual2b.js', 'scripts/trace-residual2b-dried.js',
  'scripts/pantrydiff-residual2b.js', 'scripts/sweep-residual2b.js',
  'scripts/test-residual2b.js',
]);
function isOwn(p) {
  if (allowedOwn.has(p)) return true;
  if (p.startsWith('evidence/2026-10-27/sim-residual2b-corpus')) return true;
  return false;
}
const siblingPat = /sim-ledgerbound-b|sim-finalloss|sim-cdemit|sim-stockdoors|sim-residualhunt|sim-fullpantry|sim-belongcost/;
let srcChanged = [];
try { srcChanged = git('diff --name-only HEAD -- src/').trim().split('\n').filter(Boolean); } catch (e) { failures++; console.log('FAIL git src-diff read failed: ' + e.message); }
let srcBad = [];
for (const p of srcChanged) {
  if (p === 'src/js/game.js') {
    let blob = '';
    try { blob = git('hash-object ' + p).trim(); } catch (e) { /* fall through */ }
    const headBlob = git('rev-parse HEAD:src/js/game.js').trim();
    if (blob !== PINNED && blob !== headBlob) srcBad.push(p + ' (blob ' + blob + ')');
  } else srcBad.push(p);
}
ok(srcBad.length === 0, 'hygiene check 1: zero src/js modified (pinned-game.js allowance applied; changed: ' + JSON.stringify(srcChanged) + ')');
let statusLines = [];
try { statusLines = git('status --porcelain').trim().split('\n').filter(Boolean); } catch (e) { failures++; console.log('FAIL git status read failed: ' + e.message); }
const outside = [];
for (const line of statusLines) {
  const p = line.slice(3).trim();
  if (!isOwn(p)) outside.push(line);
}
ok(outside.length === 0, 'hygiene check 2: zero files outside this run\'s own set (pinned-game.js allowance applied; outside: ' + JSON.stringify(outside) + ')');
ok(!statusLines.some(l => siblingPat.test(l)), 'hygiene: zero sibling files modified');
// pinned-base discipline: game.js restored to HEAD blob
const headBlob = git('rev-parse HEAD:src/js/game.js').trim();
const workBlob = git('hash-object src/js/game.js').trim();
ok(workBlob === headBlob, 'pinned-base discipline: worktree game.js == HEAD blob (restored, pin never committed)');
const backup = path.join(process.env.HOME || '~', 'workspace', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'sim-residual2b-gamejs-backup.js');
ok(fs.existsSync(backup) && run('git', ['hash-object', backup]).trim() === headBlob, 'pinned-base backup exists outside the repo with the HEAD blob');
// ---- verdict summary (phase 1 only; phase 2 is reported separately)
console.log(failures === 0 ? '\nPROOF GREEN' : `\nPROOF FAILURES: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
