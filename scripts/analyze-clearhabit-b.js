#!/usr/bin/env node
// analyze-clearhabit-b.js — opportunity-evening rescue analysis for
// sim-clearhabit-b (prereg:
// evidence/2026-10-29/sim-clearhabit-b-prereg.md, committed
// BEFORE any judged after-leg).
//
// Usage:
//   node scripts/analyze-clearhabit-b.js --before <gate-off-dir>
//     --after <gate-on-dir> [--out <analysis.json>]
//   node scripts/analyze-clearhabit-b.js --scan <dir>
// --before = nighttravel gate-OFF corpus, --after = nighttravel
// gate-ON (COMPETENT_HOMEWARD_CLEAR=1) corpus. Same driver, same
// seeds, same substrate. Prints a human table and writes the JSON
// analysis when --out is given. Exits 0 when the analysis is
// complete (the verdict is data, not an exit code — the evidence
// file judges it). --scan prints refused-evening counts per seed
// for band selection (selection data only, never a judged leg).
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const beforeDir = arg('before', null), afterDir = arg('after', null);
const scanDir = arg('scan', null);
const outFile = arg('out', null);

function loadDir(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[Math.floor(s.length / 2)] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function isStarv(d) { return /starv|hunger|famine/i.test(String((d && d.cause) || '')); }
const OPPORTUNITY = new Set(['cleared', 'unaffordable', 'unclearable-creek', 'unclearable-other', 'walk-failed', 'clear-failed', 'moved-during-clear', 'died-walking', 'combat-walking', 'no-blockfrom']);
function endsInside(e) { return e.inside === true && e.tile === 'haven'; }
function isAway(e) { return e.preStepTile !== null && e.preStepTile !== undefined && e.preStepTile !== 'haven'; }
function streaksOf(evs, isUnrescued) {
  const sorted = evs.slice().sort((a, b) => a.loopDay - b.loopDay);
  const list = [];
  let cur = null;
  const finish = () => { if (cur) { list.push(cur); cur = null; } };
  for (const e of sorted) {
    if (isUnrescued(e) && cur && e.loopDay === cur.endDay + 1) { cur.endDay = e.loopDay; cur.evenings++; }
    else if (isUnrescued(e)) { finish(); cur = { startDay: e.loopDay, endDay: e.loopDay, evenings: 1 }; }
    else finish();
  }
  finish();
  return list;
}

if (scanDir) {
  const data = loadDir(scanDir);
  const rows = [];
  for (const seed of Object.keys(data).sort((a, b) => a - b)) {
    const j = data[seed];
    const refused = (j.evenings || []).filter((e) => e.eveningOutcome === 'travel-refused').length;
    const byType = {};
    for (const e of (j.evenings || [])) {
      if (e.eveningOutcome !== 'travel-refused') continue;
      const k = (e.travel && e.travel.hopReturnKind) || '?';
      byType[k] = (byType[k] || 0) + 1;
    }
    rows.push({ seed: Number(seed), refused, byType, daysAlive: j.daysAlive, endReason: j.endReason });
    console.log(`${seed} refused=${refused} days=${j.daysAlive} end=${j.endReason} types=${JSON.stringify(byType)}`);
  }
  const qual = rows.filter((r) => r.refused >= 1).sort((a, b) => b.refused - a.refused || a.seed - b.seed);
  console.log('QUALIFIERS(>=1 refused, by refused desc): ' + qual.map((r) => r.seed + ':' + r.refused).join(' '));
  process.exit(0);
}

if (!beforeDir || !afterDir) { console.error('usage: --before <dir> --after <dir> [--out <file>]  OR  --scan <dir>'); process.exit(2); }

function perSeedBefore(j) {
  const evs = (j.evenings || []).filter((e) => e.eveningOutcome !== 'game-over');
  const outcomes = {};
  let away = 0, refused = 0, blockedGuardAway = 0, havenUnknownAway = 0, outOfReachAway = 0, otherAway = 0;
  let clearhabitGateOffFired = 0;
  for (const e of evs) {
    outcomes[e.eveningOutcome] = (outcomes[e.eveningOutcome] || 0) + 1;
    if (e.clearhabit && e.clearhabit.attempted) clearhabitGateOffFired++;
    if (!isAway(e)) continue;
    away++;
    if (e.eveningOutcome === 'blocked-combat' || e.eveningOutcome === 'blocked-tent') { blockedGuardAway++; continue; }
    if (e.eveningOutcome === 'haven-unknown') { havenUnknownAway++; continue; }
    if (e.eveningOutcome === 'out-of-reach') { outOfReachAway++; continue; }
    if (e.eveningOutcome === 'travel-refused') { refused++; continue; }
    otherAway++;
  }
  const streakList = streaksOf(evs, (e) => isAway(e) && e.eveningOutcome === 'travel-refused');
  const streakLens = streakList.map((s) => s.evenings);
  const starv = (j.deaths || []).filter(isStarv).length;
  return {
    seed: j.seed, daysAlive: j.daysAlive, endReason: j.endReason, maxWaveUnlocked: j.maxWaveUnlocked,
    evenings: evs.length, outcomes, away, refused, blockedGuardAway, havenUnknownAway, outOfReachAway, otherAway,
    partitionOk: (away + (evs.length - away)) === evs.length,
    awayPartitionOk: (blockedGuardAway + havenUnknownAway + outOfReachAway + refused + otherAway) === away,
    clearhabitGateOffFired,
    streakMean: streakLens.length ? streakLens.reduce((a, b) => a + b, 0) / streakLens.length : null,
    streakMax: streakLens.length ? Math.max(...streakLens) : 0,
    deaths: (j.deaths || []).length, starvationDeaths: starv,
  };
}

function perSeedAfter(j) {
  const evs = (j.evenings || []).filter((e) => e.eveningOutcome !== 'game-over');
  const outcomes = {};
  let away = 0, opportunity = 0, rescued = 0, blockedGuardAway = 0, havenUnknownAway = 0, outOfReachAway = 0, otherAway = 0;
  const statusCounts = {};
  const remedyCounts = {};
  const kcalCleared = [], kcalUnaffordable = [];
  let woodSpent = 0;
  const g3 = { movedDuringClear: 0, rescuedInCombat: 0, rescuedClearUnverified: 0, creekCleared: 0, details: [] };
  const clearingLoopDays = [];
  for (const e of evs) {
    outcomes[e.eveningOutcome] = (outcomes[e.eveningOutcome] || 0) + 1;
    const ch = e.clearhabit || {};
    const isOpp = !!ch.opportunity && OPPORTUNITY.has(ch.status);
    if (isOpp) {
      opportunity++;
      statusCounts[ch.status] = (statusCounts[ch.status] || 0) + 1;
      if (ch.status === 'cleared') {
        remedyCounts[ch.remedy || '?'] = (remedyCounts[ch.remedy || '?'] || 0) + 1;
        if (Number.isFinite(ch.kcalBefore)) kcalCleared.push(ch.kcalBefore);
        if (Number.isFinite(ch.woodBefore) && Number.isFinite(ch.woodAfter)) woodSpent += Math.max(0, ch.woodBefore - ch.woodAfter);
        clearingLoopDays.push(e.loopDay);
      }
      if (ch.status === 'unaffordable' && Number.isFinite(ch.kcalBefore)) kcalUnaffordable.push({ loopDay: e.loopDay, kcalBefore: ch.kcalBefore, cost: (ch.cost && ch.cost.kcal) || null, blockType: (ch.block && ch.block.blockType) || null });
      const res = endsInside(e);
      if (res) rescued++;
      // G3 checks (all occurrences, not just rescued, where stated).
      if (ch.status === 'moved-during-clear') { g3.movedDuringClear++; g3.details.push({ seed: j.seed, loopDay: e.loopDay, kind: 'moved-during-clear' }); }
      if (ch.block && ch.block.blockType === 'creek' && ch.status === 'cleared') { g3.creekCleared++; g3.details.push({ seed: j.seed, loopDay: e.loopDay, kind: 'creek-cleared' }); }
      if (res && e.inCombat === true) { g3.rescuedInCombat++; g3.details.push({ seed: j.seed, loopDay: e.loopDay, kind: 'rescued-in-combat' }); }
      if (res && ch.status === 'cleared' && ch.blockFromGone !== true && ch.bridged !== true) { g3.rescuedClearUnverified++; g3.details.push({ seed: j.seed, loopDay: e.loopDay, kind: 'rescued-clear-unverified' }); }
    }
    if (!isAway(e)) continue;
    away++;
    if (e.eveningOutcome === 'blocked-combat' || e.eveningOutcome === 'blocked-tent') { blockedGuardAway++; continue; }
    if (e.eveningOutcome === 'haven-unknown') { havenUnknownAway++; continue; }
    if (e.eveningOutcome === 'out-of-reach') { outOfReachAway++; continue; }
    if (isOpp) continue;
    otherAway++;
  }
  const streakList = streaksOf(evs, (e) => {
    const ch = e.clearhabit || {};
    const isOpp = !!ch.opportunity && OPPORTUNITY.has(ch.status);
    return isAway(e) && isOpp && !endsInside(e);
  });
  const streakLens = streakList.map((s) => s.evenings);
  const starv = (j.deaths || []).filter(isStarv).length;
  // G2c: player starvation deaths within 7 loop-days after a clearing day.
  const dayMap = (j.evenings || []).slice().sort((a, b) => a.loopDay - b.loopDay)
    .map((e) => ({ gameDay: e.gameDay, loopDay: e.loopDay }));
  const loopDayOfGameDay = (gd) => {
    let found = null;
    for (const m of dayMap) { if (m.gameDay <= gd) found = m.loopDay; else break; }
    return found;
  };
  let causalStarv = 0, unmappedDeaths = 0;
  const causalDetails = [];
  for (const d of (j.deaths || [])) {
    if (!(d.player === true && isStarv(d))) continue;
    const ld = loopDayOfGameDay(d.day);
    if (ld === null) { unmappedDeaths++; continue; }
    if (clearingLoopDays.some((c) => ld - c >= 0 && ld - c <= 7)) { causalStarv++; causalDetails.push({ deathGameDay: d.day, deathLoopDay: ld, cause: d.cause }); }
  }
  return {
    seed: j.seed, daysAlive: j.daysAlive, endReason: j.endReason, maxWaveUnlocked: j.maxWaveUnlocked,
    evenings: evs.length, outcomes, away, opportunity, rescued,
    rescueRate: opportunity ? rescued / opportunity : null,
    blockedGuardAway, havenUnknownAway, outOfReachAway, otherAway,
    awayPartitionOk: (blockedGuardAway + havenUnknownAway + outOfReachAway + opportunity + otherAway) === away,
    statusCounts, remedyCounts, kcalCleared, kcalUnaffordable, woodSpent,
    g3, clearingLoopDays, causalStarv, causalDetails, unmappedDeaths,
    streakMean: streakLens.length ? streakLens.reduce((a, b) => a + b, 0) / streakLens.length : null,
    streakMax: streakLens.length ? Math.max(...streakLens) : 0,
    deaths: (j.deaths || []).length, starvationDeaths: starv,
  };
}

const before = loadDir(beforeDir), after = loadDir(afterDir);
const seeds = Object.keys(after).sort((a, b) => a - b);
const rows = [];
for (const s of seeds) {
  if (!before[s]) { console.error('MISSING BEFORE for seed ' + s); process.exit(2); }
  rows.push({ seed: Number(s), before: perSeedBefore(before[s]), after: perSeedAfter(after[s]) });
}
const sum = (rs, leg, k) => rs.reduce((t, r) => t + (r[leg][k] || 0), 0);
const med = (rs, leg) => median(rs.map((r) => r[leg].daysAlive));
const analysis = {
  seeds: seeds.map(Number),
  rows,
  pooled: {
    beforeRefused: sum(rows, 'before', 'refused'),
    afterOpportunity: sum(rows, 'after', 'opportunity'),
    afterRescued: sum(rows, 'after', 'rescued'),
    rescueRate: sum(rows, 'after', 'opportunity') ? sum(rows, 'after', 'rescued') / sum(rows, 'after', 'opportunity') : null,
    medianDaysBefore: med(rows, 'before'), medianDaysAfter: med(rows, 'after'),
    starvationBefore: sum(rows, 'before', 'starvationDeaths'),
    starvationAfter: sum(rows, 'after', 'starvationDeaths'),
    causalStarvAfter: sum(rows, 'after', 'causalStarv'),
    unmappedDeathsAfter: sum(rows, 'after', 'unmappedDeaths'),
    deathsBefore: sum(rows, 'before', 'deaths'), deathsAfter: sum(rows, 'after', 'deaths'),
    maxWaveBefore: Math.max(...rows.map((r) => r.before.maxWaveUnlocked || 0)),
    maxWaveAfter: Math.max(...rows.map((r) => r.after.maxWaveUnlocked || 0)),
    g3Totals: {
      movedDuringClear: sum(rows, 'after', 'g3') && rows.reduce((t, r) => t + r.after.g3.movedDuringClear, 0),
      rescuedInCombat: rows.reduce((t, r) => t + r.after.g3.rescuedInCombat, 0),
      rescuedClearUnverified: rows.reduce((t, r) => t + r.after.g3.rescuedClearUnverified, 0),
      creekCleared: rows.reduce((t, r) => t + r.after.g3.creekCleared, 0),
    },
    gateOffFiredBefore: sum(rows, 'before', 'clearhabitGateOffFired'),
    partitionOk: rows.every((r) => r.before.awayPartitionOk && r.after.awayPartitionOk),
  },
};
const P = analysis.pooled;
const g3Total = P.g3Totals.movedDuringClear + P.g3Totals.rescuedInCombat + P.g3Totals.rescuedClearUnverified + P.g3Totals.creekCleared;
const verdict = {
  primary: { opportunity: P.afterOpportunity, rescued: P.afterRescued, rate: P.rescueRate },
  minimumN: P.afterOpportunity >= 8,
  goBar: P.rescueRate !== null && P.rescueRate >= 0.50,
  g1: P.medianDaysAfter >= P.medianDaysBefore - 2,
  g2: P.starvationAfter <= P.starvationBefore + 2,
  g2c: P.causalStarvAfter <= 2,
  g3Pass: g3Total === 0,
  g3Total,
  verdict: P.afterOpportunity < 8 ? 'INSUFFICIENT-DATA'
    : (P.rescueRate >= 0.50 && P.medianDaysAfter >= P.medianDaysBefore - 2 && P.starvationAfter <= P.starvationBefore + 2 && P.causalStarvAfter <= 2 && g3Total === 0 ? 'GO' : 'NO-GO'),
};
analysis.verdict = verdict;
console.log('seed | daysB daysA | refusedB oppA rescA rate | statusCounts | starvB starvA causalA | streakB streakA | endA');
for (const r of rows) {
  console.log(`${r.seed} | ${r.before.daysAlive} ${r.after.daysAlive} | ${r.before.refused} ${r.after.opportunity} ${r.after.rescued} ${r.after.rescueRate === null ? 'null' : r.after.rescueRate.toFixed(2)} | ${JSON.stringify(r.after.statusCounts)} | ${r.before.starvationDeaths} ${r.after.starvationDeaths} ${r.after.causalStarv} | ${r.before.streakMean === null ? 'null' : r.before.streakMean.toFixed(2)}/${r.before.streakMax} ${r.after.streakMean === null ? 'null' : r.after.streakMean.toFixed(2)}/${r.after.streakMax} | ${r.after.endReason}`);
}
console.log('POOLED: opportunity=' + P.afterOpportunity + ' rescued=' + P.afterRescued + ' rate=' + (P.rescueRate === null ? 'null' : P.rescueRate.toFixed(3)));
console.log('G1 median ' + P.medianDaysBefore + ' -> ' + P.medianDaysAfter + ' pass=' + verdict.g1);
console.log('G2 starvation ' + P.starvationBefore + ' -> ' + P.starvationAfter + ' pass=' + verdict.g2);
console.log('G2c causal player-starvation ' + P.causalStarvAfter + ' (bound 2) pass=' + verdict.g2c + ' unmapped=' + P.unmappedDeathsAfter);
console.log('G3 total violations=' + g3Total + ' ' + JSON.stringify(P.g3Totals) + ' pass=' + verdict.g3Pass);
console.log('PARTITION-OK=' + P.partitionOk + ' GATE-OFF-FIRED-BEFORE=' + P.gateOffFiredBefore + ' VERDICT=' + verdict.verdict);
if (outFile) { fs.writeFileSync(outFile, JSON.stringify(analysis, null, 2) + '\n'); console.log('wrote ' + outFile); }
