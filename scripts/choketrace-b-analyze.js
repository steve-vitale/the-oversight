// choketrace-b-analyze.js — verdict for the sim-choketrace-b census.
// Reads evidence/2026-11-10/perseed-choketrace-b/choketrace-b-s<seed>.json
// (PERSEED_DIR) and prints: per-path call counts, every re-fire burst
// (dedupe-key group of size >= 2) with its caller path(s), invocation
// shape, monster-instance verdict, and ledger double-score; the ledger
// verdict; the scale-wall numbers; and the DIAG-GO verdict (zero
// UNATTRIBUTED bursts). With VETCOUNT_AFTER set to the vetcount after-leg
// directory, cross-checks trajectories against that corpus (neutrality:
// same seeds, policy, days, fixed engine — days/endReason/maxWave/
// waveKills must match).
// Pure read; writes nothing.
// Usage:
//   PERSEED_DIR=evidence/2026-11-10/perseed-choketrace-b node scripts/choketrace-b-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.env.PERSEED_DIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-choketrace-b');
const vetDir = process.env.VETCOUNT_AFTER || path.join(REPO, 'evidence', '2026-11-10', 'perseed-vetcount-reconcile-b', 'after');

function loadDir(d, re) {
  const files = fs.readdirSync(d).filter(function (f) { return re.test(f); }).sort();
  if (!files.length) { console.error('CHOKETRACE-B ANALYZE STOP: no per-seed files in ' + d); process.exit(2); }
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); });
}
function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = s.length / 2;
  return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2;
}
function keyOf(c) {
  return [c.day, c.mid, c.by, c.via, c.trick].join('|');
}
function nameOf(o, vid) {
  try {
    const ks = o.killers || [];
    const k = ks.find(function (x) { return x.vid === vid; });
    if (k && k.name) return k.name;
  } catch (e) {}
  return vid;
}

const seeds = loadDir(dir, /^choketrace-b-s\d+\.json$/);

// --- bursts: group recordWaveKill calls by dedupe key, size >= 2 ---
function burstsOf(o) {
  const groups = {};
  for (const c of (o.killCalls || [])) {
    if (c.method !== 'recordWaveKill') continue;
    const k = keyOf(c);
    (groups[k] = groups[k] || []).push(c);
  }
  return Object.keys(groups).filter(function (k) { return groups[k].length >= 2; }).map(function (k) { return groups[k]; });
}

// shapeVerdict(burst): what the attribution says about WHY one key fired N times.
function shapeVerdict(burst) {
  const paths = Array.from(new Set(burst.map(function (c) { return c.path; })));
  const invKeys = Array.from(new Set(burst.map(function (c) { return c._invKey; })));
  const fightIds = Array.from(new Set(burst.map(function (c) { return c.fightId; }).filter(function (x) { return x != null; })));
  const objIds = Array.from(new Set(burst.map(function (c) { return c.monsterObjId; }).filter(function (x) { return x != null; })));
  const ords = Array.from(new Set(burst.map(function (c) { return c.ordInInv; })));
  const n = burst.length;
  if (paths.length > 1) {
    return 'CROSS-PATH re-fire: ' + paths.join(' + ') + ' reported the same key (' + invKeys.length + ' invocation(s))';
  }
  const p = paths[0];
  if (invKeys.length === 1) {
    if (p === 'tb-end') {
      const dead = burst[0].deadByType || {};
      const d = dead[burst[0].mid] || 0;
      if (d >= n) return 'one TB fight, ' + d + ' dead ' + burst[0].mid + ' (GENUINE multi-body — belltoad-chorus/pack style, dedupe-key collapse)';
      if (d === 1) return 'one TB fight, 1 dead ' + burst[0].mid + ' — RE-FIRE: one body reported ' + n + 'x';
      return 'one TB fight, dead-fighter census ' + d + ' for ' + burst[0].mid + ' — UNRESOLVED (census < burst)';
    }
    if (p === 'contest-blood') {
      return 'one contest, kills on invocation ordinals ' + ords.join(',') + ' (GENUINE repeats across gauntlet waves)';
    }
    return 'one ' + p + ' settlement reported the same key ' + n + 'x — RE-FIRE within one settlement';
  }
  // several invocations, one path
  if (objIds.length > 1) return invKeys.length + ' ' + p + ' settlements, ' + objIds.length + ' distinct monster objects (GENUINE repeats — different beasts)';
  if (objIds.length === 1) return invKeys.length + ' ' + p + ' settlements, SAME monster object #' + objIds[0] + ' fought ' + n + 'x — RE-FIRE of one instance';
  if (p === 'tb-end') {
    // Group by invocation and check each fight's dead-fighter census:
    // a fight with K dead of the type genuinely killed K bodies.
    const byInv = {};
    for (const c of burst) (byInv[c._invKey] = byInv[c._invKey] || []).push(c);
    const groups = Object.keys(byInv).map(function (k) {
      const g = byInv[k];
      return { inv: k, size: g.length, dead: ((g[0].deadByType || {})[g[0].mid] | 0) };
    });
    const allGenuine = groups.every(function (g) { return g.dead >= g.size; });
    if (fightIds.length > 1 && allGenuine) {
      return groups.length + ' TB fights, ' + groups.map(function (g) { return g.dead + ' dead'; }).join(' + ') + ' ' + burst[0].mid
        + ' (GENUINE multi-body — chorus/pack, dedupe-key collapse: ' + n + ' bodies, 1 log entry)';
    }
    if (fightIds.length > 1) {
      return groups.length + ' TB fights, per-fight (calls/dead): ' + groups.map(function (g) { return g.size + '/' + g.dead; }).join(', ')
        + ' — MIXED: some fights report more calls than dead bodies (RE-FIRE inside those fights)';
    }
    if (fightIds.length === 1) return invKeys.length + ' tbEnd settlements, ONE fight id — RE-FIRE (same fight settled ' + n + 'x; f.over guard says impossible — FLAG)';
    return invKeys.length + ' tbEnd settlements, fight id missing — UNRESOLVED';
  }
  if (p === 'contest-blood') return invKeys.length + ' contests, separate gauntlets (GENUINE repeats — separate contests same day)';
  if (p === 'agency') return invKeys.length + ' agency encounters (GENUINE repeats — each encounter picks a fresh beast by construction)';
  return invKeys.length + ' ' + p + ' settlements, monster instance UNRESOLVED (no object id stamped on this path)';
}

console.log('=== choketrace-b: kill choke-point trace ===');
console.log('seeds: ' + seeds.map(function (o) { return o.seed; }).join(', ') + ' | policy competent | 150d death-aware | recorded=' + seeds.map(function (o) { return !!o.recorded; }).join(','));
let totalCalls = 0, totalDup = 0, totalUnattr = 0, totalPyrrhic = 0;
const pathCounts = {};
const pathDupCounts = {};
for (const o of seeds) {
  for (const c of (o.killCalls || [])) {
    totalCalls++;
    pathCounts[c.path] = (pathCounts[c.path] || 0) + 1;
    if (c.dup) { totalDup++; pathDupCounts[c.path] = (pathDupCounts[c.path] || 0) + 1; }
    if (c.path === 'UNATTRIBUTED') totalUnattr++;
    if (c.method === 'recordPyrrhicKill') totalPyrrhic++;
  }
}
console.log('recordWaveKill+Pyrrhic calls total: ' + totalCalls + ' | dup calls: ' + totalDup + ' | UNATTRIBUTED calls: ' + totalUnattr + ' | pyrrhic calls: ' + totalPyrrhic);
console.log('per-path call counts (all calls / dup calls):');
Object.keys(pathCounts).sort().forEach(function (p) {
  console.log('  ' + p.padEnd(20) + String(pathCounts[p]).padEnd(6) + (pathDupCounts[p] || 0));
});
console.log('recorder errors total: ' + seeds.reduce(function (t, o) { return t + ((o.recorderErrors || []).length); }, 0));
for (const o of seeds) {
  for (const e of (o.recorderErrors || [])) console.log('  seed ' + o.seed + ' recorder error: ' + e);
}
console.log('reconciliation (log == counter, fixed engine): ' + seeds.filter(function (o) { return (o.reconciliation || {}).allAgree; }).length + '/' + seeds.length + ' agree');

console.log('');
console.log('=== re-fire bursts (dedupe-key groups, size >= 2) ===');
let burstN = 0, reFireN = 0, unattrBurstN = 0, unresolvedN = 0;
let ledgerDouble = 0, ledgerCapped = 0, ledgerBarCross = 0;
const shapeTally = {};
for (const o of seeds) {
  const bs = burstsOf(o);
  for (const b of bs) {
    burstN++;
    reFireN += b.length - 1;
    const verdict = shapeVerdict(b);
    const shapeKey = verdict.split(':')[0].split(' — ')[0];
    shapeTally[shapeKey] = (shapeTally[shapeKey] || 0) + 1;
    if (b.some(function (c) { return c.path === 'UNATTRIBUTED'; })) unattrBurstN++;
    if (/UNRESOLVED/.test(verdict)) unresolvedN++;
    const first = b[0];
    const deadByInv = {};
    for (const c of b) { const k = c._invKey; if (!(k in deadByInv)) deadByInv[k] = ((c.deadByType || {})[c.mid] | 0); }
    console.log('seed ' + o.seed + ' d' + first.day + ' ' + first.mid + ' x' + b.length + ' by ' + nameOf(o, first.by) + ' (' + first.by + ') via ' + first.via
      + ' trick=' + JSON.stringify(first.trick) + ' path=' + Array.from(new Set(b.map(function (c) { return c.path; }))).join('+')
      + ' inv=' + Array.from(new Set(b.map(function (c) { return c._invKey; }))).join(',')
      + ' fightIds=' + JSON.stringify(Array.from(new Set(b.map(function (c) { return c.fightId; }).filter(function (x) { return x != null; }))))
      + ' objIds=' + JSON.stringify(Array.from(new Set(b.map(function (c) { return c.monsterObjId; }).filter(function (x) { return x != null; }))))
      + ' ords=' + JSON.stringify(Array.from(new Set(b.map(function (c) { return c.ordInInv; }))))
      + ' deadByInv=' + JSON.stringify(deadByInv));
    console.log('    -> ' + verdict);
    for (let i = 1; i < b.length; i++) {
      const c = b[i];
      const add = (c.ledger && c.ledger.add) | 0;
      if (add > 0) ledgerDouble++; else ledgerCapped++;
      if (c.ledger && c.ledger.crossedBar) ledgerBarCross++;
      console.log('    re-fire #' + i + ' seq=' + c.seq + ' ledger add=' + add + ' (perType ' + c.ledger.perTypeBefore + '->' + c.ledger.perTypeAfter + ' cap ' + c.ledger.cap + ', roomBefore ' + c.ledger.roomBefore + ', counterKnown=' + c.ledger.counterKnown + ', points ' + c.ledger.pointsBefore + '->' + c.ledger.pointsAfter + ', bar ' + c.ledger.bar + (c.ledger.crossedBar ? ' — CROSSED BAR' : '') + ')');
    }
  }
}
console.log('bursts: ' + burstN + ' | re-fire calls: ' + reFireN + ' | UNATTRIBUTED bursts: ' + unattrBurstN + ' | UNRESOLVED-instance bursts: ' + unresolvedN);
console.log('shape tally: ' + JSON.stringify(shapeTally));
console.log('');
console.log('=== ledger double-score verdict ===');
console.log('re-fire calls that scored twice (add > 0): ' + ledgerDouble + ' | already capped (add = 0, no effect): ' + ledgerCapped);
console.log('re-fires that crossed a wave bar: ' + ledgerBarCross);
console.log('');
console.log('=== scale wall ===');
console.log('national: ' + seeds.filter(function (o) { return o.summary.peakScaleRank === 'national' || o.summary.peakScaleRank === 'global'; }).length + '/' + seeds.length
  + ' | table (won): ' + seeds.filter(function (o) { return o.won; }).length + '/' + seeds.length
  + ' | wins: ' + seeds.filter(function (o) { return o.won; }).length + '/' + seeds.length);
console.log('wave 4 unlocked: ' + seeds.filter(function (o) { return o.maxWaveUnlocked >= 4; }).length + '/' + seeds.length
  + ' | wave 5 unlocked: ' + seeds.filter(function (o) { return o.maxWaveUnlocked >= 5; }).length + '/' + seeds.length);
console.log('median survival (result days): ' + median(seeds.map(function (o) { return o.resultDays; })) + ' (days: ' + JSON.stringify(seeds.map(function (o) { return o.resultDays; }).sort(function (a, b) { return a - b; })) + ')');
console.log('military_tribute ever-ready: ' + seeds.filter(function (o) { return o.summary.everReady.military_tribute; }).length + '/' + seeds.length);
console.log('peak living veterans: ' + JSON.stringify(seeds.map(function (o) { return o.summary.peakLivingVeterans; }).sort()));
console.log('');
console.log('=== DIAG verdict (prereg: DIAG-GO iff every re-fire burst attributed, none UNATTRIBUTED) ===');
console.log('bursts attributed: ' + (burstN - unattrBurstN) + '/' + burstN + ' | UNATTRIBUTED bursts: ' + unattrBurstN);
console.log('DIAG-' + (unattrBurstN === 0 ? 'GO' : 'NO-GO') + (unattrBurstN === 0 ? ' — every re-fire burst on the band is attributed to a named caller path.' : ' — ' + unattrBurstN + ' burst(s) unattributed.'));

// --- neutrality cross-check vs vetcount after-leg ---
if (fs.existsSync(vetDir)) {
  console.log('');
  console.log('=== neutrality cross-check vs vetcount after-leg ===');
  const vet = loadDir(vetDir, /^vetcount-b-s\d+\.json$/);
  const bySeed = {};
  for (const v of vet) bySeed[v.seed] = v;
  let match = 0, mismatch = 0;
  for (const o of seeds) {
    const v = bySeed[o.seed];
    if (!v) { console.log('seed ' + o.seed + ': no vetcount row'); continue; }
    const fields = [
      ['resultDays', o.resultDays, v.resultDays],
      ['endReason', o.endReason, v.endReason],
      ['maxWaveUnlocked', o.maxWaveUnlocked, v.maxWaveUnlocked],
      ['waveKills', JSON.stringify(o.waveKills), JSON.stringify(v.waveKills)],
      ['killCalls', o.summary.killCalls, v.summary.killCalls],
      ['killCallsDup', o.summary.killCallsDup, v.summary.killCallsDup],
    ];
    const bad = fields.filter(function (f) { return String(f[1]) !== String(f[2]); });
    if (!bad.length) { match++; console.log('seed ' + o.seed + ': MATCH (days ' + o.resultDays + ', ' + o.endReason + ', maxWave ' + o.maxWaveUnlocked + ', calls ' + o.summary.killCalls + ', dup ' + o.summary.killCallsDup + ')'); }
    else { mismatch++; console.log('seed ' + o.seed + ': MISMATCH: ' + bad.map(function (f) { return f[0] + ' choketrace=' + f[1] + ' vetcount=' + f[2]; }).join('; ')); }
  }
  console.log('trajectory match vs vetcount after-leg: ' + match + '/' + seeds.length + (mismatch ? ' — ' + mismatch + ' MISMATCH(ES), recorder is NOT neutral' : ' — recorder is neutral on this band.'));
}
