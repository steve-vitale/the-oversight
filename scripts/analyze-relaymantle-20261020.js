#!/usr/bin/env node
// analyze-relaymantle-20261020.js — per-arm attribution + the floor verdict
// for sim-relaymantle (flesh-out loop, 2026-10-20).
//
// Reads evidence/2026-10-20/perseed-relaymantle/<arm>/{leadfeast,belongfeast}/
// s64201–s64208.json (4 arms × 16 runs, identical seeds) and judges the
// pre-registered PRIMARY: the floor verdict — is the ≤32 grounding
// floor-stop too permissive?
//
// Walks come from the probe's SOURCE-CAPTURED `walks` (the #5 fix —
// chooseTableOption wrapper), not the drain's `walked` array (the pilot's
// too-narrow condition); the analyzer consistency-checks the two.
//
// Usage: node scripts/analyze-relaymantle-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];
const ARMS = ['control', 'floor32', 'floor44', 'floor56'];
const EVIDBASE = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-relaymantle');

function loadArm(arm) {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(EVIDBASE, arm, policyId, `s${seed}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push({ policyId, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
    }
  }
  return rows;
}

function analyzeRun(x) {
  const r = x.r;
  if (!r) return { missing: true };
  const tpd = r.tpdSummary || {};
  const rm = r.rmSummary || {};
  const mantle = r.mantle || { scholarDeaths: [], midRoadDeaths: [] };
  // SOURCE-CAPTURED walks (the #5 fix). The drain's own `walked` array
  // keeps the pilot's too-narrow condition — consistency-checked, never
  // the verdict.
  const walks = (r.walks || []).map(w => ({
    day: w.day, path: w.path, branch: w.branch, viaPhase: w.viaPhase || null,
    branchSignals: w.branchSignals || null,
  }));
  const walkedRaw = (tpd.walked || []).map(w => ({ path: w.path, branch: w.branch, day: w.day }));
  const doorEvents = (tpd.doorEvents || []).map(d => ({ day: d.day, picked: d.picked, fellBack: !!d.fellBack, why: d.why, missWhy: d.missWhy || null }));
  const terminal = r.tableDoneDay != null && (r.phaseTrace || []).indexOf('done') >= 0;
  const darkWalks = walks.filter(w => w.branch === 'dark');
  const darkWalksTerminal = darkWalks.filter(w => {
    // terminal at the run level + the walk was the last walk (no downgrade after)
    return terminal;
  });
  const relayAtSit = r.relayAtSit || {};
  const darkSit = !!r.satEver && relayAtSit.band === 'dark';
  // REFINED road-phase deaths (metric-review operationalization fix — the
  // probe's raw midRoadDeaths counts ANY bearer death while the layer was
  // gated on, including day-12 dehydration deaths before the relay was
  // even claimed; with RELAYMANTLE_ALL=1 the gate is on from day 1, so the
  // raw count is background mortality, not road burn). A ROAD-PHASE death:
  // the relay was claimed (day ≥ claimDay), the road wasn't done yet, and
  // the table wasn't invited. Same definition on all arms; the pre-reg bar
  // is relative (A2 vs A1), so the comparison stands.
  const claimDay = rm.claimDay;
  const scholarDeaths = (mantle.scholarDeaths || []).map(d => ({
    who: d.name || d.who, day: d.day | 0, cause: d.cause, channel: d.channel || null,
    groundingAtDeath: d.groundingAtDeath, leanAtDeath: d.leanAtDeath,
  }));
  const roadPhaseDeaths = scholarDeaths.filter(d =>
    claimDay != null && d.day >= claimDay &&
    (!((rm.done | 0)) || rm.doneDay == null || d.day <= rm.doneDay) &&
    (r.sittingDay == null || d.day < r.sittingDay) &&
    (r.tableDay == null || d.day < r.tableDay));
  const midRoadDeaths = roadPhaseDeaths;
  const mantlePass = darkSit && midRoadDeaths.some(d => r.sittingDay != null && d.day < r.sittingDay);
  const engineErrors = (tpd.drainError | 0) + (rm.verbError | 0) + (rm.rmError | 0) +
    ((r.walkError | 0)) + (r.instrumentErrors | 0);
  return {
    seed: x.seed, policyId: x.policyId, arm: r.arm || null,
    endReason: r.endReason, won: !!r.won, national: !!r.national,
    table: !!r.table, exiled: !!r.exiled,
    invited: r.tableDay != null, sat: !!r.satEver, sittingDay: r.sittingDay,
    assigned: r.tpAssigned || null,
    walks, walkedRaw, doorEvents,
    walkConsistency: walks.length === doorEvents.length ? 'ok'
      : `MISMATCH walks=${walks.length} doorEvents=${doorEvents.length}`,
    terminal, darkWalks: darkWalks.length,
    darkWalksTerminal: darkWalksTerminal.length,
    darkSit, mantlePass,
    rmActive: !!rm.active, rmDone: !!(rm.done | 0), rmDoneDay: rm.doneDay || null,
    rmFloorStop: !!(rm.floorStop | 0), rmFloorStopDay: rm.floorStopDay || null,
    rmStoppedTable: !!(rm.stoppedTable | 0), rmMinGrounding: rm.minGrounding,
    rmFloor: rm.floor,
    rmVerbs: { deepens: rm.deepens | 0, efficients: rm.efficients | 0, rewrites: rm.rewrites | 0, skims: rm.skims | 0 },
    rmLean: rm.lean, rmGrounding: rm.grounding, rmDarkUses: rm.darkUses | 0, rmBond: rm.bond | 0,
    relayAtSit: { held: !!relayAtSit.held, lean: relayAtSit.lean, band: relayAtSit.band, grounding: relayAtSit.grounding, darkUses: relayAtSit.darkUses | 0, bond: relayAtSit.bond | 0 },
    midRoadDeaths, scholarDeaths: (mantle.scholarDeaths || []).length,
    maxWave: r.maxWave, gameDays: r.gameDays,
    engineErrors,
    complete: true,
  };
}

function wall(rows) {
  const A = rows.map(analyzeRun);
  const n = A.length, c = (f) => A.filter(f).length;
  return {
    n,
    national: c(a => a.national), table: c(a => a.table), wins: c(a => a.won),
    wave4: c(a => a.maxWave >= 4), wave5: c(a => a.maxWave >= 5),
    sat: c(a => a.sat), invited: c(a => a.invited), exiled: c(a => a.exiled),
    medianSurvival: (() => { const s = A.map(a => a.gameDays || 0).sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; })(),
    maxSurvival: Math.max(...A.map(a => a.gameDays || 0)),
  };
}

function armMeasures(arm) {
  const rows = loadArm(arm);
  const A = rows.map(analyzeRun);
  const missing = A.filter(a => a.missing);
  if (missing.length) throw new Error(`MISSING files in arm ${arm}: ${missing.length}`);
  const n = A.length, c = (f) => A.filter(f).length;
  const deaths = [];
  for (const a of A) for (const d of a.midRoadDeaths) deaths.push({ seed: a.seed, policyId: a.policyId, ...d });
  return {
    arm, n,
    done: c(a => a.rmDone),
    doneDays: A.filter(a => a.rmDone).map(a => a.rmDoneDay),
    floorStops: c(a => a.rmFloorStop),
    stoppedTable: c(a => a.rmStoppedTable),
    minGroundings: A.filter(a => a.rmMinGrounding != null).map(a => a.rmMinGrounding),
    bearerDeaths: deaths.length, midRoadDeathList: deaths,
    darkSit: c(a => a.darkSit),
    mantlePasses: c(a => a.mantlePass),
    walks: A.reduce((s, a) => s + a.walks.length, 0),
    darkWalks: c(a => a.darkWalks > 0),
    darkWalksTerminal: A.filter(a => a.darkWalks > 0 && a.darkWalksTerminal > 0).length,
    terminal: c(a => a.terminal),
    walkMismatch: A.filter(a => a.walkConsistency !== 'ok').length,
    engineErrors: A.reduce((s, a) => s + a.engineErrors, 0),
    wins: c(a => a.won), national: c(a => a.national), table: c(a => a.table),
    sat: c(a => a.sat), invited: c(a => a.invited),
    conversion: c(a => a.invited) ? (c(a => a.sat) / c(a => a.invited)) : null,
    wall: wall(rows),
    runs: A,
  };
}

function deathChannels(arm) {
  const set = new Set();
  for (const { r } of loadArm(arm)) {
    for (const d of (((r.deathsAttributed || {}).attributed) || [])) set.add(d.channel || '?');
  }
  return [...set].sort();
}

function main() {
  const M = {};
  for (const arm of ARMS) M[arm] = armMeasures(arm);
  const ctrl = M.control, f32 = M.floor32, f44 = M.floor44, f56 = M.floor56;

  for (const arm of ARMS) {
    const m = M[arm];
    console.log(`\nARM ${arm} (n=${m.n}):`);
    console.log(`  road: done=${m.done}/16 doneDays=[${m.doneDays.join(',')}] floorStops=${m.floorStops} stoppedTable=${m.stoppedTable} minG=[${m.minGroundings.join(',')}]`);
    console.log(`  burn: mid-road bearer deaths=${m.bearerDeaths}/16 darkSit=${m.darkSit}/16 mantlePasses=${m.mantlePasses}`);
    for (const d of m.midRoadDeathList) {
      console.log(`    - ${d.policyId} s${d.seed}: ${d.who} d${d.day} ${d.cause}/${d.channel} grounding@${d.groundingAtDeath} lean@${d.leanAtDeath}`);
    }
    console.log(`  walks: total=${m.walks} dark-walk runs=${m.darkWalks} dark-terminal=${m.darkWalksTerminal} walkMismatch=${m.walkMismatch} engineErrors=${m.engineErrors}`);
    console.log(`  wall: national=${m.wall.national} table=${m.wall.table} wins=${m.wall.wins} wave4=${m.wall.wave4} wave5=${m.wall.wave5} sat=${m.wall.sat}/${m.wall.invited} median=${m.wall.medianSurvival}d max=${m.wall.maxSurvival}d`);
  }

  console.log('\nGUARDRAILS (per arm vs A0 control):');
  let guardOk = true;
  for (const arm of ['floor32', 'floor44', 'floor56']) {
    const m = M[arm];
    const errs = [];
    if (m.engineErrors !== 0) errs.push(`engineErrors=${m.engineErrors}`);
    const chA = deathChannels(arm), chC = deathChannels('control');
    const newModes = chA.filter(x => !chC.includes(x));
    if (newModes.length) errs.push(`new death modes=[${newModes.join(',')}]`);
    if (m.conversion != null && m.conversion < 0.70) errs.push(`conversion=${(m.conversion * 100).toFixed(1)}% <70%`);
    if (Math.abs(m.national - ctrl.national) > 2) errs.push(`national ${m.national}v${ctrl.national}`);
    if (Math.abs(m.table - ctrl.table) > 2) errs.push(`table ${m.table}v${ctrl.table}`);
    const ok = errs.length === 0;
    if (!ok) guardOk = false;
    console.log(`  ${arm}: ${ok ? 'GREEN' : 'RED — ' + errs.join('; ')}`);
  }

  console.log('\nPRIMARY — REPLICATION (A1 floor32 must meet, else KILLED-AT-PILOT):');
  const replDone = f32.done >= 3, replDark = f32.darkSit >= 3;
  console.log(`  done=${f32.done}/16 ≥3: ${replDone ? 'PASS' : 'FAIL'}`);
  console.log(`  darkSit=${f32.darkSit}/16 ≥3: ${replDark ? 'PASS' : 'FAIL'}`);
  const replicated = replDone && replDark;

  console.log('\nPRIMARY — FLOOR VERDICT (A2 floor44 vs A1 floor32):');
  console.log(`  A1: done=${f32.done} darkSit=${f32.darkSit} bearerDeaths=${f32.bearerDeaths}`);
  console.log(`  A2: done=${f44.done} darkSit=${f44.darkSit} bearerDeaths=${f44.bearerDeaths}`);
  console.log(`  A3: done=${f56.done} darkSit=${f56.darkSit} bearerDeaths=${f56.bearerDeaths}`);
  const tooPermissive = f44.done >= f32.done - 1 && f44.darkSit >= f32.darkSit - 1 && f44.bearerDeaths <= f32.bearerDeaths - 2;
  const burnIsPrice = f44.done <= 1 && f32.done >= 3;
  let verdict;
  if (!replicated) verdict = 'KILLED-AT-PILOT (replication bar missed)';
  else if (tooPermissive) verdict = '≤32 TOO PERMISSIVE — floor44 completes with less burn → GO (commit floor44 road)';
  else if (burnIsPrice) verdict = 'BURN IS THE PRICE OF THE ROAD — ≤32 stands → DIAG-GO (instruments + evidence only)';
  else verdict = 'INCONCLUSIVE — documented, never re-scored (§14)';
  console.log(`  VERDICT: ${verdict}`);

  console.log(`\nOVERALL: replication=${replicated ? 'GO' : 'NO-GO'} guardrails=${guardOk ? 'GREEN' : 'RED'}`);
  return { M, verdict, replicated, guardOk };
}

if (require.main === module) {
  try { main(); }
  catch (e) { console.error('ANALYZE FATAL:', e && e.message); process.exit(2); }
}
module.exports = { SEEDS, POLICIES, ARMS, EVIDBASE, loadArm, analyzeRun, armMeasures, wall, deathChannels };
