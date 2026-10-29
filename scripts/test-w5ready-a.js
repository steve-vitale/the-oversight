#!/usr/bin/env node
// scripts/test-w5ready-a.js — DIAG-ONLY audit of wave-5 readiness on the
// sim-fullseat-a corpus (evidence/2026-10-29/perseed-fullseat-a/).
// Measurement only: zero src/js changes, zero default flips, zero
// deed-bar moves. Recomputes every distance from the corpus rows —
// it never copies the worker's summary prose.
//
// Prereg: evidence/2026-10-29/sim-w5ready-a-prereg.md (commit BEFORE
// any judged leg). Classification rules (see prereg):
//   PRIMARY = end-state unlock chain from endSnapFull.unlock:
//     standing-gap (distT5, exact points), readiness short-names
//     (rd5short), w4faced missing, w3rung missing.
//   SECONDARY = max-reach: peak standing gap (200 - diag.max.standing),
//     deed w5 distance (reported separately, downstream of the lock).
//   READINESS COUNTS ARE NOT IN THE CORPUS: rd5short carries names
//     only. Exact numeric deficits are UNMEASURED here; the script
//     reports bounded intervals derived from code demand + shortness
//     (veterans [1,2], armor [1,4], weapons [1,6], tricks [1,3])
//     and NEVER invents counts.
//   A row missing its unlock block or rd5short is UNCLASSIFIED and
//     fails the run (exit non-zero).
// Usage: node scripts/test-w5ready-a.js [--out <path>]
//   Default --out: evidence/2026-10-29/w5ready-a-analysis.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-29', 'perseed-fullseat-a');
const args = process.argv.slice(2);
let outPath = path.join(REPO, 'evidence', '2026-10-29', 'w5ready-a-analysis.json');
for (let i = 0; i < args.length; i++) if (args[i] === '--out') outPath = args[++i];

function fail(msg) { console.error('FAIL: ' + msg); process.exit(1); }

// --- Code-citation proof: demand numbers read from standing.js itself.
const standingSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8');
const demMatch = standingSrc.match(/5:\s*\{\s*armored:\s*(\d+),\s*armorP:\s*(\d+),\s*armed:\s*(\d+),\s*tricks:\s*(\d+),\s*veterans:\s*(\d+)\s*\}/);
if (!demMatch) fail('readyDemand[5] not found in src/js/standing.js — citation broken');
const DEMAND = { armored: +demMatch[1], armorP: +demMatch[2], armed: +demMatch[3], tricks: +demMatch[4], veterans: +demMatch[5] };
if (DEMAND.armored !== 4 || DEMAND.armorP !== 15 || DEMAND.armed !== 6 || DEMAND.tricks !== 3 || DEMAND.veterans !== 2) {
  fail('readyDemand[5] mismatch vs prereg: ' + JSON.stringify(DEMAND));
}
if (!/waveUnlockReady\(w\)/.test(standingSrc) || !/waveCombatReadiness\(w\)/.test(standingSrc)) {
  fail('waveUnlockReady/waveCombatReadiness not found in standing.js');
}
const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
if (!/unlockedWave\(\)/.test(gameSrc) || !/waveEngaged\(wave\)/.test(gameSrc)) {
  fail('unlockedWave/waveEngaged not found in src/js/game.js');
}

// --- Load corpus rows.
const rows = [];
for (const f of fs.readdirSync(DIR).sort()) {
  if (!f.endsWith('.json') || f === 'summary.json') continue;
  rows.push(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
}
rows.sort((a, b) => (a.seed - b.seed) || (a.policy < b.policy ? -1 : 1));
if (rows.length !== 16) fail(`expected 16 corpus rows, found ${rows.length}`);

const BOUND = { veterans: [1, 2], armor: [1, 4], weapons: [1, 6], tricks: [1, 3] };
const classified = [];
const unclassified = [];
for (const r of rows) {
  const u = (r.endSnapFull && r.endSnapFull.unlock) || null;
  const d = r.diag || {};
  if (!u || !Array.isArray(u.rd5short)) { unclassified.push(`${r.seed}-${r.policy}`); continue; }
  const peak = (d.max && d.max.standing != null) ? d.max.standing : null;
  const endDist = (r.endSnapFull && r.endSnapFull.dist) || {};
  const maxDist = d.maxDist || {};
  const blockers = [];
  if ((u.distT5 | 0) > 0) blockers.push('standing');
  for (const b of (u.rd5short || [])) blockers.push('readiness:' + b);
  if (!u.w4faced) blockers.push('w4faced-missing');
  if (!u.w3rung) blockers.push('w3rung-missing');
  classified.push({
    seed: r.seed, policy: r.policy, days: r.days,
    endReason: r.endReason || null, waveReach: r.waveReach,
    gatedStanding: u.standing, distT5: u.distT5, holdKind: u.holdKind,
    raw: u.raw, war: u.war, diplomacy: u.diplomacy, plenty: u.plenty, capped: u.capped,
    rd5ready: u.rd5ready, rd5short: u.rd5short.slice(),
    rd5deficitBound: Object.fromEntries((u.rd5short || []).map(b => [b, BOUND[b] || null])),
    w4faced: !!u.w4faced, w3rung: !!u.w3rung, w2points: u.w2points,
    unlockedWave: u.unlockedWave,
    peakStanding: peak, peakGap: peak == null ? null : Math.max(0, 200 - peak),
    endVsPeakDelta: peak == null ? null : (u.standing - peak),
    pin199End: u.standing === 199 && u.holdKind === 'defer5',
    pin199Peak: peak === 199,
    deedW5EndDist: endDist.w5, deedW5MaxDist: maxDist.w5,
    deedW4EndCount: (r.endSnapFull && r.endSnapFull.w4 != null) ? r.endSnapFull.w4 : null,
    blockers,
  });
}
if (unclassified.length) fail('UNCLASSIFIED rows (missing unlock block/rd5short): ' + unclassified.join(', '));
if (classified.some(c => c.rd5ready !== false)) fail('expected rd5ready=false on every row');
if (classified.some(c => c.unlockedWave >= 5)) fail('expected unlockedWave<5 on every row');
if (classified.some(c => c.deedW5EndDist !== 2 || c.deedW5MaxDist !== 2)) {
  fail('expected deed w5 distance 2 (end and max) on every row');
}

// --- Tallies.
const tally = (fn) => classified.filter(fn).length;
const barCount = {};
for (const b of ['armor', 'weapons', 'tricks', 'veterans']) barCount[b] = tally(c => c.rd5short.includes(b));
const byPolicy = {};
for (const p of ['off', 'on']) {
  const rs = classified.filter(c => c.policy === p);
  byPolicy[p] = {
    n: rs.length,
    veteransShort: rs.filter(c => c.rd5short.includes('veterans')).length,
    armorShort: rs.filter(c => c.rd5short.includes('armor')).length,
    weaponsShort: rs.filter(c => c.rd5short.includes('weapons')).length,
    tricksShort: rs.filter(c => c.rd5short.includes('tricks')).length,
    standingBlocked: rs.filter(c => c.distT5 > 0).length,
    w4facedMissing: rs.filter(c => !c.w4faced).length,
    w3rungMissing: rs.filter(c => !c.w3rung).length,
    defer5: rs.filter(c => c.holdKind === 'defer5').length,
    belowBar: rs.filter(c => c.holdKind === 'below-bar').length,
    medianDistT5: rs.map(c => c.distT5).sort((a, b) => a - b)[Math.floor(rs.length / 2)],
  };
}
// OFF->ON movement per seed.
const movement = [];
for (const seed of [...new Set(classified.map(c => c.seed))].sort((a, b) => a - b)) {
  const off = classified.find(c => c.seed === seed && c.policy === 'off');
  const on = classified.find(c => c.seed === seed && c.policy === 'on');
  if (!off || !on) continue;
  movement.push({
    seed,
    rd5shortOff: off.rd5short, rd5shortOn: on.rd5short,
    shortCountDelta: on.rd5short.length - off.rd5short.length,
    peakDelta: (on.peakStanding - off.peakStanding),
    distT5Delta: (on.distT5 - off.distT5),
    w4facedOff: off.w4faced, w4facedOn: on.w4faced,
  });
}
// Standing dynamics: 76003 membership + end-vs-peak deltas.
const s76003 = classified.filter(c => c.seed === 76003).map(c => ({
  policy: c.policy, peakStanding: c.peakStanding, endGated: c.gatedStanding,
  endRaw: c.raw, war: c.war, diplomacy: c.diplomacy, plenty: c.plenty, capped: c.capped,
  delta: c.endVsPeakDelta,
}));

console.log('PER-ROW (seed arm days end uw gated distT5 hold raw war/dipl/plenty/capped rd5short w4faced w3rung peak peakGap end-peak deedW5)');
for (const c of classified) {
  console.log(`${c.seed} ${c.policy} ${c.days} ${c.endReason} uw${c.unlockedWave} gated=${c.gatedStanding} distT5=${c.distT5} hold=${c.holdKind} raw=${c.raw} war=${c.war} dipl=${c.diplomacy} plenty=${c.plenty} capped=${c.capped} short=[${c.rd5short.join(',')}] w4faced=${c.w4faced} w3rung=${c.w3rung} peak=${c.peakStanding} peakGap=${c.peakGap} delta=${c.endVsPeakDelta} deedW5=${c.deedW5EndDist}/${c.deedW5MaxDist}`);
}
console.log('\nTALLY (n=16): readiness bars blocking rows: ' + JSON.stringify(barCount));
console.log('standing-gap rows: ' + tally(c => c.distT5 > 0) + ' | w4faced-missing: ' + tally(c => !c.w4faced) + ' | w3rung-missing: ' + tally(c => !c.w3rung));
console.log('holdKind: defer5=' + tally(c => c.holdKind === 'defer5') + ' below-bar=' + tally(c => c.holdKind === 'below-bar') + ' other=' + tally(c => c.holdKind !== 'defer5' && c.holdKind !== 'below-bar'));
console.log('end-gated==199 (defer5 pin): ' + tally(c => c.pin199End) + ' | peak==199: ' + tally(c => c.pin199Peak));
console.log('BY-POLICY: ' + JSON.stringify(byPolicy, null, 1));
console.log('OFF->ON MOVEMENT:');
for (const m of movement) console.log(`  s${m.seed}: short ${m.rd5shortOff.join('+') || '-'} -> ${m.rd5shortOn.join('+') || '-'} (delta ${m.shortCountDelta}); peakDelta ${m.peakDelta}; distT5Delta ${m.distT5Delta}; w4faced ${m.w4facedOff}->${m.w4facedOn}`);
console.log('SEED 76003 (standing dynamics check): ' + JSON.stringify(s76003));

const analysis = {
  instrument: 'scripts/test-w5ready-a.js (DIAG only, corpus recompute)',
  corpus: 'evidence/2026-10-29/perseed-fullseat-a', n: classified.length,
  demandW5: DEMAND, demandSource: 'src/js/standing.js standingCfg().readyDemand[5]',
  unclassified, rows: classified, barCount, byPolicy, movement, seed76003: s76003,
  tallies: {
    standingGapRows: tally(c => c.distT5 > 0),
    w4facedMissing: tally(c => !c.w4faced),
    w3rungMissing: tally(c => !c.w3rung),
    defer5: tally(c => c.holdKind === 'defer5'),
    belowBar: tally(c => c.holdKind === 'below-bar'),
    pin199End: tally(c => c.pin199End),
    pin199Peak: tally(c => c.pin199Peak),
    rd5readyAny: tally(c => c.rd5ready === true),
    unlockedWave5Any: tally(c => c.unlockedWave >= 5),
  },
  corpusGap: 'exact readiness counts (armored/armed/tricks/veterans) NOT recorded in corpus; deficits reported as bounded intervals only',
};
fs.writeFileSync(outPath, JSON.stringify(analysis, null, 2) + '\n');
console.log('\nwrote ' + outPath);
console.log('AUDIT STRUCTURAL CHECKS: PASS (16/16 classified, rd5ready false everywhere, uw<5 everywhere, deed w5 dist 2 everywhere)');
