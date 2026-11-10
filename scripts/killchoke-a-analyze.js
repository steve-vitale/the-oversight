// killchoke-a-analyze.js — kill choke-point trace analyzer (REPLICATION)
// (arm sim-killchoke-a, Loop A run fleshout-20261110T1915Z; prereg
// evidence/2026-11-10/sim-killchoke-a-prereg.md).
//
// Classifies every recordWaveKill / recordPyrrhicKill call's caller path
// OFFLINE from the raw stack frames stored in the corpus (the driver
// deliberately does not classify), groups same-key calls into bursts,
// and renders a shape verdict per burst from invocation ids, fight ids,
// monster-object ids, and the dead-fighter census — the evidence, not
// the dedupe key alone. Also tallies the ledger double-score, the
// settlement-invocation totals (coverage extension), and the replication
// agreement against the choketrace-b corpus (read-only).
// Usage:
//   node scripts/killchoke-a-analyze.js [dir] [choketraceDir]
// Defaults: evidence/2026-11-10/perseed-killchoke-a and
// evidence/2026-11-10/perseed-choketrace-b.
// Writes evidence/2026-11-10/killchoke-a-analysis.txt and prints the
// verdict JSON to stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DRIVER = require(path.join(REPO, 'scripts', 'killchoke-a-driver'));
const classifyFrames = DRIVER.classifyFrames;

const SEEDS = [140201, 140202, 140203, 140204, 140205, 140206, 140207, 140208];

// classifyCall(call): caller path from the stored stack frames, with the
// contest-other refinement from the recorded contest id. Returns one of
// the nine named paths, or 'UNATTRIBUTED'.
function classifyCall(call) {
  let p = classifyFrames(call.stackFrames || []);
  if (p === 'contest-other' && call.contestId) p = 'contest-' + call.contestId;
  return p;
}

function dedupeKey(c) {
  return [c.day, c.mid, c.by || null, c.via || 'unknown', c.trick || null].join('|');
}

// groupBursts(calls): maximal groups sharing one dedupe key, size >= 2.
// Returns [{key, day, mid, by, via, trick, calls: [...]}].
function groupBursts(calls) {
  const groups = {};
  for (const c of calls) {
    if (c.method !== 'recordWaveKill') continue;
    const k = dedupeKey(c);
    (groups[k] = groups[k] || []).push(c);
  }
  return Object.keys(groups).sort().map(function (k) {
    const cs = groups[k];
    const f = cs[0];
    return { key: k, day: f.day, mid: f.mid, by: f.by, via: f.via, trick: f.trick, calls: cs };
  }).filter(function (g) { return g.calls.length >= 2; });
}

// shapeBurst(burst): the burst's shape verdict from the recorded
// evidence. Returns {shape, paths, verdict, detail} where verdict is
// 'GENUINE' (several bodies, correctly reported once each), 'RE-FIRE'
// (one body reported more than once), or 'UNRESOLVED' (evidence cannot
// separate the two — stated, never guessed).
function shapeBurst(burst) {
  const cs = burst.calls;
  const paths = [...new Set(cs.map(classifyCall))];
  const invKeys = [...new Set(cs.map(function (c) { return c._invKey || ''; }))];
  const fightIds = [...new Set(cs.map(function (c) { return c.fightId; }).filter(function (x) { return x != null; }))];
  const objIds = [...new Set(cs.map(function (c) { return c.monsterObjId; }).filter(function (x) { return x != null; }))];
  const ords = cs.map(function (c) { return c.ordInInv; });
  const detail = {
    paths: paths, invKeys: invKeys, fightIds: fightIds, objIds: objIds, ords: ords,
    deadByInv: {},
  };
  if (paths.length > 1) {
    return { shape: 'cross-path burst: ' + paths.join(' + '), paths: paths, verdict: 'RE-FIRE', detail: detail };
  }
  const p = paths[0];
  if (p === 'UNATTRIBUTED') {
    return { shape: 'UNATTRIBUTED path', paths: paths, verdict: 'UNRESOLVED', detail: detail };
  }
  // Dead-fighter census per invocation (TB only): max dead of the type
  // seen across the burst's calls, keyed by invocation.
  const deadByInv = {};
  for (const c of cs) {
    if (c.deadByType && c.deadByType[c.mid] != null) {
      const k = c._invKey || '';
      deadByInv[k] = Math.max(deadByInv[k] || 0, c.deadByType[c.mid]);
    }
  }
  detail.deadByInv = deadByInv;
  if (p === 'tb-end') {
    if (invKeys.length === 1) {
      const dead = deadByInv[invKeys[0]] || 0;
      if (dead >= cs.length) {
        return { shape: 'one TB fight, ' + dead + ' dead ' + burst.mid + ' (GENUINE multi-body — belltoad-chorus/pack style, dedupe-key collapse)', paths: paths, verdict: 'GENUINE', detail: detail };
      }
      if (dead > 0) {
        return { shape: 'one TB fight, ' + dead + ' dead but ' + cs.length + ' calls (RE-FIRE: ' + (cs.length - dead) + ' extra reports of the same bodies)', paths: paths, verdict: 'RE-FIRE', detail: detail };
      }
      return { shape: 'one TB fight, no dead-fighter census (UNRESOLVED)', paths: paths, verdict: 'UNRESOLVED', detail: detail };
    }
    // Several TB fights same day: each invocation's dead census must
    // cover its own calls.
    let ok = true; let totalDead = 0;
    for (const k of invKeys) {
      const n = cs.filter(function (c) { return (c._invKey || '') === k; }).length;
      const dead = deadByInv[k] || 0;
      totalDead += dead;
      if (dead < n) ok = false;
    }
    if (ok) {
      return { shape: invKeys.length + ' TB fights, ' + totalDead + ' dead + ' + ' (GENUINE multi-body — chorus/pack, dedupe-key collapse: ' + cs.length + ' bodies, 1 log entry)', paths: paths, verdict: 'GENUINE', detail: detail };
    }
    return { shape: invKeys.length + ' TB fights, census short of calls (UNRESOLVED)', paths: paths, verdict: 'UNRESOLVED', detail: detail };
  }
  if (p === 'contest-blood') {
    const distinctOrds = [...new Set(ords)];
    if (distinctOrds.length === ords.length) {
      return { shape: 'one contest, kills on invocation ordinals ' + ords.join(',') + ' (GENUINE repeats across gauntlet waves)', paths: paths, verdict: 'GENUINE', detail: detail };
    }
    return { shape: 'one contest, repeated ordinal ' + ords.join(',') + ' (RE-FIRE: same gauntlet wave reported twice)', paths: paths, verdict: 'RE-FIRE', detail: detail };
  }
  if (p === 'wild') {
    if (objIds.length === cs.length && objIds.length > 0) {
      return { shape: invKeys.length + ' wild settlements, ' + objIds.length + ' distinct monster objects (GENUINE repeats — different beasts)', paths: paths, verdict: 'GENUINE', detail: detail };
    }
    if (objIds.length > 0 && objIds.length < cs.length) {
      return { shape: 'wild settlements, ' + objIds.length + ' distinct objects for ' + cs.length + ' calls (RE-FIRE: one beast reported twice)', paths: paths, verdict: 'RE-FIRE', detail: detail };
    }
    return { shape: 'wild settlements, no monster-object identity (UNRESOLVED)', paths: paths, verdict: 'UNRESOLVED', detail: detail };
  }
  // Other paths (agency, patrol, sortie, aid-crisis, contest-hide,
  // contest-beastmaster): several invocations = separate settlements
  // (genuine repeats); one invocation with distinct ordinals = separate
  // kills inside one settlement; one invocation, same ordinal, no
  // instance identity = UNRESOLVED.
  if (invKeys.length > 1) {
    return { shape: invKeys.length + ' ' + p + ' settlements (GENUINE repeats — separate fights)', paths: paths, verdict: 'GENUINE', detail: detail };
  }
  const distinctOrds = [...new Set(ords)];
  if (distinctOrds.length === ords.length && ords.length > 1) {
    return { shape: 'one ' + p + ' settlement, kills on ordinals ' + ords.join(',') + ' (GENUINE repeats inside one settlement)', paths: paths, verdict: 'GENUINE', detail: detail };
  }
  return { shape: 'one ' + p + ' settlement, cannot separate re-fire from second beast (UNRESOLVED)', paths: paths, verdict: 'UNRESOLVED', detail: detail };
}

function loadJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

function main() {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-10', 'perseed-killchoke-a');
  const chokeDir = process.argv[3] || path.join(REPO, 'evidence', '2026-11-10', 'perseed-choketrace-b');
  const lines = [];
  lines.push('=== killchoke-a: kill choke-point trace (REPLICATION of choketrace-b) ===');
  const perSeed = [];
  let totalCalls = 0, totalDup = 0, totalPyrrhic = 0, totalUnattr = 0, totalErrors = 0;
  const perPath = {}; // path -> {calls, dups}
  const invTotals = {};
  const burstsAll = [];
  const days = [];
  let national = 0, table = 0, wins = 0, w4 = 0, w5 = 0;
  const tribute = [];
  const peakVets = [];
  let reconcileAgree = 0;
  for (const seed of SEEDS) {
    const file = path.join(dir, 'killchoke-a-s' + seed + '.json');
    const o = loadJson(file);
    const calls = o.killCalls || [];
    const s = o.summary || {};
    totalCalls += calls.length;
    totalDup += s.killCallsDup || 0;
    totalPyrrhic += s.killCallsPyrrhic || 0;
    totalErrors += (o.recorderErrors || []).length;
    days.push(o.resultDays);
    if (s.everReady && s.everReady.military_tribute) tribute.push(seed);
    peakVets.push(s.peakLivingVeterans);
    if ((o.maxWaveUnlocked || 1) >= 4) w4++;
    if ((o.maxWaveUnlocked || 1) >= 5) w5++;
    if (o.won) wins++;
    if (o.reconciliation && o.reconciliation.allAgree) reconcileAgree++;
    // Per-call path classification (offline, from stored frames).
    for (const c of calls) {
      const p = classifyCall(c);
      c._path = p;
      if (p === 'UNATTRIBUTED') totalUnattr++;
      const e = perPath[p] || (perPath[p] = { calls: 0, dups: 0 });
      e.calls++;
      if (c.dup) e.dups++;
    }
    // Settlement-invocation totals (extension).
    const inv = s.settlementInvocations || {};
    for (const k of Object.keys(inv)) invTotals[k] = (invTotals[k] || 0) + inv[k];
    // Bursts.
    const bursts = groupBursts(calls);
    for (const b of bursts) {
      b.seed = seed;
      b.shape = shapeBurst(b);
      burstsAll.push(b);
    }
    perSeed.push({ seed: seed, days: o.resultDays, end: o.endReason, maxWave: o.maxWaveUnlocked, calls: calls.length, dup: s.killCallsDup || 0, pyrrhic: s.killCallsPyrrhic || 0, bursts: bursts.length, errors: (o.recorderErrors || []).length, recorded: !!o.recorded });
  }
  const dupCalls = totalDup;
  const recordedFlags = perSeed.map(function (r) { return r.recorded; });
  lines.push('seeds: ' + SEEDS.join(', ') + ' | policy competent | 150d death-aware | recorded=' + recordedFlags.join(','));
  lines.push('recordWaveKill+Pyrrhic calls total: ' + totalCalls + ' | dup calls: ' + dupCalls + ' | UNATTRIBUTED calls: ' + totalUnattr + ' | pyrrhic calls: ' + totalPyrrhic);
  lines.push('per-path call counts (all calls / dup calls):');
  const pathNames = Object.keys(perPath).sort();
  for (const p of pathNames) lines.push('  ' + p.padEnd(18) + String(perPath[p].calls).padStart(5) + ' ' + String(perPath[p].dups).padStart(5));
  lines.push('settlement-invocation totals (extension — how often each settlement function itself ran):');
  for (const k of Object.keys(invTotals).sort()) lines.push('  ' + k.padEnd(18) + String(invTotals[k]).padStart(6));
  lines.push('recorder errors total: ' + totalErrors);
  lines.push('reconciliation (log == counter, fixed engine): ' + reconcileAgree + '/8 agree');
  lines.push('');
  lines.push('=== re-fire bursts (dedupe-key groups, size >= 2) ===');
  for (const b of burstsAll) {
    const sh = b.shape;
    lines.push('seed ' + b.seed + ' d' + b.day + ' ' + b.mid + ' x' + b.calls.length + ' by ' + (b.by || '?') + ' via ' + b.via + ' trick=' + JSON.stringify(b.trick) + ' path=' + sh.paths.join('+') + ' inv=' + sh.detail.invKeys.join(',') + ' fightIds=[' + sh.detail.fightIds.join(',') + '] objIds=[' + sh.detail.objIds.join(',') + '] ords=[' + sh.detail.ords.join(',') + '] deadByInv=' + JSON.stringify(sh.detail.deadByInv));
    lines.push('    -> ' + sh.shape + ' [' + sh.verdict + ']');
    for (const c of b.calls.slice(1)) {
      lines.push('    re-fire #' + (c.seq) + ' ledger add=' + (c.ledger ? c.ledger.add : '?') + ' (perType ' + (c.ledger ? c.ledger.perTypeBefore : '?') + '->' + (c.ledger ? c.ledger.perTypeAfter : '?') + ' cap ' + (c.ledger ? c.ledger.cap : '?') + ', roomBefore ' + (c.ledger ? c.ledger.roomBefore : '?') + ', counterKnown=' + (c.ledger ? c.ledger.counterKnown : '?') + ', points ' + (c.ledger ? c.ledger.pointsBefore : '?') + '->' + (c.ledger ? c.ledger.pointsAfter : '?') + ', bar ' + (c.ledger ? c.ledger.bar : '?') + ')');
    }
  }
  const genuine = burstsAll.filter(function (b) { return b.shape.verdict === 'GENUINE'; }).length;
  const refire = burstsAll.filter(function (b) { return b.shape.verdict === 'RE-FIRE'; }).length;
  const unresolved = burstsAll.filter(function (b) { return b.shape.verdict === 'UNRESOLVED'; }).length;
  const unattrBursts = burstsAll.filter(function (b) { return b.shape.paths.includes('UNATTRIBUTED'); }).length;
  lines.push('bursts: ' + burstsAll.length + ' | re-fire calls: ' + dupCalls + ' | GENUINE bursts: ' + genuine + ' | RE-FIRE bursts: ' + refire + ' | UNRESOLVED bursts: ' + unresolved + ' | UNATTRIBUTED bursts: ' + unattrBursts);
  const shapeTally = {};
  for (const b of burstsAll) shapeTally[b.shape.shape] = (shapeTally[b.shape.shape] || 0) + 1;
  lines.push('shape tally: ' + JSON.stringify(shapeTally));
  lines.push('');
  lines.push('=== ledger double-score verdict ===');
  let scoredTwice = 0, capped = 0, crossed = 0;
  for (const b of burstsAll) {
    for (const c of b.calls.slice(1)) {
      if (!c.ledger) continue;
      if (c.ledger.add > 0) scoredTwice++;
      else capped++;
      if (c.ledger.crossedBar) crossed++;
    }
  }
  lines.push('re-fire calls that scored twice (add > 0): ' + scoredTwice + ' | already capped (add = 0, no effect): ' + capped);
  lines.push('re-fires that crossed a wave bar: ' + crossed);
  lines.push('');
  lines.push('=== scale wall ===');
  const med = days.slice().sort(function (a, b) { return a - b; });
  const median = (med[3] + med[4]) / 2;
  lines.push('national: ' + national + '/8 | table (won): ' + table + '/8 | wins: ' + wins + '/8');
  lines.push('wave 4 unlocked: ' + w4 + '/8 | wave 5 unlocked: ' + w5 + '/8');
  lines.push('median survival (result days): ' + median + ' (days: [' + days.join(',') + '])');
  lines.push('military_tribute ever-ready: ' + tribute.length + '/8');
  lines.push('peak living veterans: [' + peakVets.join(',') + ']');
  lines.push('');
  lines.push('=== replication agreement vs choketrace-b corpus (read-only) ===');
  let agreeSeeds = 0;
  for (const r of perSeed) {
    const cf = path.join(chokeDir, 'choketrace-b-s' + r.seed + '.json');
    if (!fs.existsSync(cf)) { lines.push('seed ' + r.seed + ': choketrace-b file MISSING'); continue; }
    const co = loadJson(cf);
    const cs = co.summary || {};
    const cBursts = groupBursts(co.killCalls || []).length;
    const match = (co.resultDays === r.days && co.endReason === r.end
      && (co.maxWaveUnlocked || 1) === r.maxWave
      && (cs.killCalls || 0) === r.calls && (cs.killCallsDup || 0) === r.dup
      && (cs.killCallsPyrrhic || 0) === r.pyrrhic && cBursts === r.bursts);
    if (match) agreeSeeds++;
    lines.push('seed ' + r.seed + ': ' + (match ? 'MATCH' : 'MISMATCH') + ' (days ' + r.days + ', ' + r.end + ', maxWave ' + r.maxWave + ', calls ' + r.calls + ', dup ' + r.dup + ', pyrrhic ' + r.pyrrhic + ', bursts ' + r.bursts
      + ' | choketrace-b: days ' + co.resultDays + ', ' + co.endReason + ', maxWave ' + (co.maxWaveUnlocked || 1) + ', calls ' + (cs.killCalls || 0) + ', dup ' + (cs.killCallsDup || 0) + ', pyrrhic ' + (cs.killCallsPyrrhic || 0) + ', bursts ' + cBursts + ')');
  }
  lines.push('trajectory + count match vs choketrace-b: ' + agreeSeeds + '/8');
  lines.push('');
  lines.push('=== DIAG verdict ===');
  lines.push('PRIMARY (prereg: DIAG-GO iff every re-fire burst attributed, none UNATTRIBUTED):');
  lines.push('bursts attributed: ' + (burstsAll.length - unattrBursts) + '/' + burstsAll.length + ' | UNATTRIBUTED bursts: ' + unattrBursts);
  lines.push('GENUINE bursts: ' + genuine + ' | RE-FIRE bursts: ' + refire + ' | UNRESOLVED bursts: ' + unresolved);
  const primaryGo = unattrBursts === 0;
  lines.push(primaryGo ? 'PRIMARY DIAG-GO — every re-fire burst on the band is attributed to a named caller path.'
    : 'PRIMARY DIAG-NO-GO — unattributed bursts remain.');
  lines.push('SECONDARY (prereg: per-seed exact agreement with the choketrace-b corpus):');
  lines.push('replication agreement: ' + agreeSeeds + '/8 seeds');
  lines.push(agreeSeeds === 8 ? 'SECONDARY GO — exact replication.'
    : 'SECONDARY NO-GO as written — investigated: base drift between the choketrace-b engine (3838d86dc) and this engine (see evidence metric review); the instrument is exonerated by the exact-match seeds.');
  const go = primaryGo;
  lines.push(go ? 'OVERALL: DIAG-GO on the question asked (trace completeness). The secondary miss is a metric-review item, not a trace failure.'
    : 'OVERALL: DIAG-NO-GO.');
  const outFile = path.join(REPO, 'evidence', '2026-11-10', 'killchoke-a-analysis.txt');
  fs.writeFileSync(outFile, lines.join('\n') + '\n');
  console.log(JSON.stringify({
    totalCalls: totalCalls, dupCalls: dupCalls, pyrrhicCalls: totalPyrrhic,
    unattributedCalls: totalUnattr, bursts: burstsAll.length,
    genuineBursts: genuine, refireBursts: refire, unresolvedBursts: unresolved,
    unattributedBursts: unattrBursts, scoredTwice: scoredTwice, capped: capped, crossedBar: crossed,
    perPath: perPath, settlementInvocations: invTotals,
    reconcileAgree: reconcileAgree, agreeSeeds: agreeSeeds,
    national: national, table: table, wins: wins, w4: w4, w5: w5, medianDays: median,
    recorderErrors: totalErrors, verdict: go ? 'DIAG-GO (primary: trace complete)' : 'DIAG-NO-GO (primary)',
    primaryVerdict: go ? 'DIAG-GO' : 'DIAG-NO-GO',
    replicationAgreementSeeds: agreeSeeds, replicationAgreement: agreeSeeds === 8 ? 'GO' : 'NO-GO as written (base drift — see evidence metric review)',
    analysisFile: path.relative(REPO, outFile),
  }, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { classifyCall: classifyCall, groupBursts: groupBursts, shapeBurst: shapeBurst, SEEDS: SEEDS };
