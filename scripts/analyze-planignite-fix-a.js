// analyze-planignite-fix-a.js — judge for arm sim-planignite-fix-a (LEVER:
// the planignite catch-22 fix, PLANFIX=1). Compares the two legs on the
// DIAG's own band 102601-102608 (control = flag off, armed = flag on,
// same tip, identical seeds) against the frozen prereg
// (evidence/2026-11-16/sim-planignite-fix-a-prereg.md).
//   Bar 1: plans created > 0 on BOTH 102601 and 102607 armed.
//   Bar 2: no-plan rate 0/8 armed (was 2/8 control).
//   Bar 3: store-never-initialized taxonomy row 0 villages armed.
//   Bar 4: unexplained havenTick calls armed < 10% of control.
//   Bar 5: cost bars — starvation armed <= control + 2; median
//     survival armed >= 0.8x control.
//   Bar 8: instrument holds on both legs (8/8 files, zero tick-gate
//     mismatches, zero holders without a creation).
// Reuses the DIAG analyzer's classifyIgnition (scripts/analyze-planignite-a.js)
// and the haventick wall summary (scripts/analyze-haventick-b.js) — the
// DIAG analyzer file itself is NOT modified. The store-never-initialized
// row (proposed in the DIAG's metric review) is computed here with the
// DIAG's own initializer definitions (analyze-planignite-a.js:165-260):
// a wave-3+ seed row, an expedition/agency kill, a fight-gate avoid,
// or a bonds/muster bump (winPlanStats bondTends/musterStanddowns).
// A village scores the row iff initializer count 0 across all four
// kinds AND zero creations. Under the fix the havenTick call itself
// initializes the store, so zero external initializers no longer
// implies zero creations — the row counts only the conjunction.
// Usage:
//   node scripts/analyze-planignite-fix-a.js <controlDir> <armedDir>
// Writes evidence/2026-11-16/planignite-fix-a-analysis.json. Exits 0
// iff every GO bar passes.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIAG = require(path.join(REPO, 'scripts', 'analyze-planignite-a'));
const HAVEN = require(path.join(REPO, 'scripts', 'analyze-haventick-b'));

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function minDayOf(rows, key) {
  let d = null;
  for (const r of rows) { const dd = (r[key] | 0); if (d == null || dd < d) d = dd; }
  return d;
}
// initializersOf(j): the DIAG's store-initializer diagnostic, recomputed
// for EVERY seed (the DIAG classifier only carries it in detail for
// ignited / unexplained villages). Cross-checked below against
// detail.initializers wherever the DIAG detail carries them.
function initializersOf(j) {
  let finalKillLog = [];
  try {
    const last = (j.daily || []).slice(-1)[0];
    if (last && last.waveKillLog) finalKillLog = last.waveKillLog;
  } catch (e) {}
  const seedRowsW3 = (j.v4seeds || []).filter(function (s) { return (s.wave | 0) >= 3; });
  const gateAvoids = (j.v4gates || []).filter(function (g) { return g.result === 'avoid'; });
  const agencyKills = finalKillLog.filter(function (e) { return e && e.via === 'agency'; });
  const stats = j.winPlanStats || {};
  const firstSeedRowDay = minDayOf(seedRowsW3, 'day');
  const firstAgencyKillDay = minDayOf(agencyKills, 'd');
  const firstGateAvoidDay = minDayOf(gateAvoids, 'day');
  let firstInitializerDay = null;
  for (const x of [firstSeedRowDay, firstAgencyKillDay, firstGateAvoidDay]) {
    if (x != null && (firstInitializerDay == null || x < firstInitializerDay)) firstInitializerDay = x;
  }
  const bondTends = stats.bondTends || 0;
  const musterStanddowns = stats.musterStanddowns || 0;
  const total = seedRowsW3.length + agencyKills.length + gateAvoids.length + bondTends + musterStanddowns;
  return { seedRowsW3: seedRowsW3.length, firstSeedRowDay: firstSeedRowDay,
    agencyKills: agencyKills.length, firstAgencyKillDay: firstAgencyKillDay,
    gateAvoids: gateAvoids.length, firstGateAvoidDay: firstGateAvoidDay,
    bondTends: bondTends, musterStanddowns: musterStanddowns,
    firstInitializerDay: firstInitializerDay,
    totalInitializers: total,
    storeEverInitialized: firstInitializerDay != null || (j.v4creates || []).length > 0 };
}

function legSummary(dir) {
  const loaded = loadDir(dir);
  const perSeed = [];
  let noPlanSeeds = 0, storeNeverInit = 0, unexplainedCalls = 0, starvation = 0;
  let totalMismatches = 0, totalInstrumentErrors = 0, totalHoldersNoCreate = 0;
  let totalCreates = 0, totalDeparts = 0, totalCalls = 0;
  const callOutcomes = {};
  const gameDays = [];
  const noPlanList = [], storeNeverInitList = [];
  const initializerDisagreements = [];
  for (const k of Object.keys(loaded.bySeed).sort()) {
    const j = loaded.bySeed[k];
    const base = HAVEN.classifyHavenTick(j);
    const c = DIAG.classifyIgnition(j, base);
    const init = initializersOf(j);
    // Cross-check: wherever the DIAG detail carries initializers, the
    // recomputation must agree (same definitions, same corpus).
    if (c.detail && c.detail.initializers) {
      const d = c.detail.initializers;
      if (d.seedRowsW3 !== init.seedRowsW3 || d.agencyKills !== init.agencyKills ||
          d.gateAvoids !== init.gateAvoids || d.bondTends !== init.bondTends ||
          d.musterStanddowns !== init.musterStanddowns ||
          d.firstInitializerDay !== init.firstInitializerDay) {
        initializerDisagreements.push({ seed: c.seed, detail: d, recomputed: init });
      }
    }
    const creates = (j.v4creates || []).length;
    const departs = (j.v4departs || []).length;
    const starv = (j.deaths || []).filter(function (d) { return d && d.cause === 'starvation'; }).length;
    const isStoreNeverInit = init.totalInitializers === 0 && creates === 0;
    if (c.noPlan) { noPlanSeeds++; noPlanList.push(c.seed); }
    if (isStoreNeverInit) { storeNeverInit++; storeNeverInitList.push(c.seed); }
    unexplainedCalls += c.unexplainedCalls;
    starvation += starv;
    totalMismatches += c.tickGateMismatches;
    totalInstrumentErrors += c.instrumentErrors;
    totalHoldersNoCreate += c.holdersWithoutCreation;
    totalCreates += creates;
    totalDeparts += departs;
    totalCalls += c.havenTickCalls;
    for (const o of Object.keys(c.callOutcomes || {})) callOutcomes[o] = (callOutcomes[o] || 0) + (c.callOutcomes[o] || 0);
    gameDays.push(j.gameDays);
    perSeed.push({ seed: c.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
      standing: j.standing, scaleRank: j.scaleRank, won: j.won, maxWave: j.maxWave,
      villageLost: j.villageLost, noPlan: c.noPlan, blocker: c.blocker,
      subBlocker: c.subBlocker, creates: creates, departs: departs,
      havenTickCalls: c.havenTickCalls, rangerCalls: c.rangerCalls,
      unexplainedCalls: c.unexplainedCalls, callOutcomes: c.callOutcomes,
      starvationDeaths: starv, initializers: init,
      storeNeverInitialized: isStoreNeverInit,
      firstCreationDay: (c.detail && c.detail.firstCreationDay != null) ? c.detail.firstCreationDay : null,
      tickGateMismatches: c.tickGateMismatches,
      holdersWithoutCreation: c.holdersWithoutCreation });
  }
  const leg = { bySeed: {}, files: loaded.files };
  for (const k of Object.keys(loaded.bySeed).sort()) leg.bySeed[k] = HAVEN.classifyHavenTick(loaded.bySeed[k]);
  const summary = HAVEN.summarizeHavenTick(leg);
  return { dir: path.basename(dir), files: loaded.files.length,
    perSeed: perSeed, noPlanSeeds: noPlanSeeds, noPlanList: noPlanList,
    storeNeverInit: storeNeverInit, storeNeverInitList: storeNeverInitList,
    unexplainedCalls: unexplainedCalls, callOutcomes: callOutcomes,
    starvationDeaths: starvation, medianSurvival: med(gameDays),
    totalCreates: totalCreates, totalDeparts: totalDeparts, totalCalls: totalCalls,
    tickGateMismatches: totalMismatches, instrumentErrors: totalInstrumentErrors,
    holdersWithoutCreation: totalHoldersNoCreate,
    initializerDisagreements: initializerDisagreements,
    wall: summary.wall };
}

function main() {
  const controlDir = process.argv[2];
  const armedDir = process.argv[3];
  if (!controlDir || !armedDir) { console.error('PLANIGNITE-FIX ANALYZE STOP: controlDir armedDir required.'); process.exit(2); }
  const control = legSummary(controlDir);
  const armed = legSummary(armedDir);
  const bySeed = {};
  for (const s of armed.perSeed) bySeed[s.seed] = s;
  const creates102601 = (bySeed[102601] || {}).creates;
  const creates102607 = (bySeed[102607] || {}).creates;
  const bar1 = creates102601 > 0 && creates102607 > 0;
  const bar2 = armed.noPlanSeeds === 0;
  const bar3 = armed.storeNeverInit === 0;
  const bar4 = control.unexplainedCalls > 0 && armed.unexplainedCalls < 0.10 * control.unexplainedCalls;
  const bar5 = armed.starvationDeaths <= control.starvationDeaths + 2 &&
    armed.medianSurvival != null && control.medianSurvival != null &&
    armed.medianSurvival >= 0.8 * control.medianSurvival;
  const bar8 = control.files === 8 && armed.files === 8 &&
    control.tickGateMismatches === 0 && armed.tickGateMismatches === 0 &&
    control.holdersWithoutCreation === 0 && armed.holdersWithoutCreation === 0 &&
    control.initializerDisagreements.length === 0 && armed.initializerDisagreements.length === 0;
  const out = {
    arm: 'planignite-fix-a', run: 'planignite-fix-a',
    controlDir: path.basename(controlDir), armedDir: path.basename(armedDir),
    control: control, armed: armed,
    bars: {
      bothDeadVillagesIgnite: { pass: bar1, creates102601: creates102601, creates102607: creates102607 },
      noPlanZero: { pass: bar2, armedNoPlan: armed.noPlanSeeds, armedNoPlanList: armed.noPlanList,
        controlNoPlan: control.noPlanSeeds, controlNoPlanList: control.noPlanList },
      storeNeverInitializedZero: { pass: bar3, armedStoreNeverInit: armed.storeNeverInit,
        armedList: armed.storeNeverInitList, controlStoreNeverInit: control.storeNeverInit,
        controlList: control.storeNeverInitList },
      unexplainedCollapse: { pass: bar4, controlUnexplained: control.unexplainedCalls,
        armedUnexplained: armed.unexplainedCalls,
        ratio: control.unexplainedCalls ? armed.unexplainedCalls / control.unexplainedCalls : null },
      costBars: { pass: bar5, controlStarvation: control.starvationDeaths,
        armedStarvation: armed.starvationDeaths,
        controlMedianSurvival: control.medianSurvival, armedMedianSurvival: armed.medianSurvival },
      instrument: { pass: bar8, controlFiles: control.files, armedFiles: armed.files,
        controlMismatches: control.tickGateMismatches, armedMismatches: armed.tickGateMismatches,
        controlHolders: control.holdersWithoutCreation, armedHolders: armed.holdersWithoutCreation,
        initializerDisagreements: control.initializerDisagreements.length + armed.initializerDisagreements.length },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'planignite-fix-a-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('=== planignite-fix-a control -> armed ===');
  console.log('control: no-plan ' + control.noPlanSeeds + ' (' + control.noPlanList.join(',') + ')' +
    ' store-never-init ' + control.storeNeverInit + ' unexplained-calls ' + control.unexplainedCalls +
    ' starvation ' + control.starvationDeaths + ' medianSurvival ' + control.medianSurvival +
    ' creates ' + control.totalCreates + ' departs ' + control.totalDeparts);
  console.log('armed:   no-plan ' + armed.noPlanSeeds + ' (' + armed.noPlanList.join(',') + ')' +
    ' store-never-init ' + armed.storeNeverInit + ' unexplained-calls ' + armed.unexplainedCalls +
    ' starvation ' + armed.starvationDeaths + ' medianSurvival ' + armed.medianSurvival +
    ' creates ' + armed.totalCreates + ' departs ' + armed.totalDeparts);
  for (const s of armed.perSeed) {
    const c = control.perSeed.find(function (x) { return x.seed === s.seed; }) || {};
    console.log('  seed ' + s.seed + ': creates ' + (c.creates || 0) + '->' + s.creates +
      ' departs ' + (c.departs || 0) + '->' + s.departs +
      ' firstCreationDay ' + (s.firstCreationDay != null ? s.firstCreationDay : '-') +
      ' unexplained ' + (c.unexplainedCalls || 0) + '->' + s.unexplainedCalls +
      ' starvation ' + (c.starvationDeaths || 0) + '->' + s.starvationDeaths +
      ' days ' + s.gameDays + ' standing ' + s.standing + ' rank ' + s.scaleRank);
  }
  console.log('control callOutcomes: ' + JSON.stringify(control.callOutcomes));
  console.log('armed callOutcomes:   ' + JSON.stringify(armed.callOutcomes));
  console.log('control wall: ' + JSON.stringify(control.wall));
  console.log('armed wall:   ' + JSON.stringify(armed.wall));
  console.log('bars: bothIgnite=' + (bar1 ? 'PASS' : 'FAIL') + ' noPlanZero=' + (bar2 ? 'PASS' : 'FAIL') +
    ' storeNeverInitZero=' + (bar3 ? 'PASS' : 'FAIL') + ' unexplainedCollapse=' + (bar4 ? 'PASS' : 'FAIL') +
    ' costBars=' + (bar5 ? 'PASS' : 'FAIL') + ' instrument=' + (bar8 ? 'PASS' : 'FAIL'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !bar4 || !bar5 || !bar8) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { legSummary: legSummary, initializersOf: initializersOf };
