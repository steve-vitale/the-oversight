// analyze-producergate-b.js — wave-5 killing lever judge for
// sim-producergate-b. Reads the producergate-driver corpora
// (per-seed JSONs with w5encounters / w5gates / w5seeds / w5departs /
// wpEnd) and judges the frozen prereg bars:
//   PRIMARY: wave-5 FIELD kills per wave-5-unlocked village
//   (armed >= 1.00, absolute).
//   TB kills per unlocked (armed) >= 0.5x control (no-collapse).
//   Kill:death (total, armed) >= 0.92. FACED-NOT-KILLED share among
//   unlocked armed <= 2/10. COST: starvation armed <= control + 2
//   AND median survival armed >= 0.8x control.
//   GO iff ALL hold. NO-GO otherwise.
// FIELD vs TB (the 1810Z correction, binding here): a FIELD kill is
// a w5encounters row with wave 5 and outcome vKill; a TB kill is
// waveKills['5'] minus field kills (the scholar's turn-based
// combat). A negative TB count is an instrument error (a field
// kill the recorder missed).
// Per-seed classes (LOCKED / NEVER-FACED / FACED-NOT-KILLED / KILLED)
// reuse analyze-wave5kill-b.js classifySeed — same definitions, same
// wave-5 id set. The encounter decomposition is new here: gate
// results, party sizes, trick state, plan stages, and outcomes for
// every wave-5 fieldFight, so the next diag never repeats the blind
// spot. Read-only; prints JSON to stdout when run as a script.
// Usage: node scripts/analyze-producergate-b.js <control-dir> <armed-dir>
'use strict';
const fs = require('fs');
const path = require('path');
const w5k = require('./analyze-wave5kill-b');

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function isStarvation(d) {
  return /starv|hunger/i.test(String((d && d.cause) || '') + ' ' + String((d && d.kind) || ''));
}

// analyzeLeg(dir, w5set) — one corpus dir. Returns { perSeed, pooled,
// encounters, gates, seeds, departs, wp }.
function analyzeLeg(dir, w5set) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const perSeed = [];
  const encounters = [];
  const gates = [];
  const seeds = [];
  const departs = [];
  const wpEnds = [];
  const brainEnds = [];
  let parseErrors = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { parseErrors += 1; continue; }
    perSeed.push(w5k.classifySeed(d, w5set));
    // FIELD vs TB SPLIT (producergate prereg): field kills are the
    // recorded wave-5 fieldFight vKills for this seed; TB kills are
    // the residual of total wave-5 kills. A negative residual is an
    // instrument error — a field kill the recorder missed.
    const rec0 = perSeed[perSeed.length - 1];
    rec0.fieldKills = (d.w5encounters || []).filter(function (e) { return e.wave === 5 && e.outcome === 'vKill'; }).length;
    rec0.tbKills = (rec0.kills || 0) - rec0.fieldKills;
    if (rec0.tbKills < 0) rec0.errors.push('negative-tb-kills');
    for (const e of (d.w5encounters || [])) encounters.push(Object.assign({ seed: d.seed }, e));
    for (const g of (d.w5gates || [])) gates.push(Object.assign({ seed: d.seed }, g));
    for (const s of (d.w5seeds || [])) seeds.push(Object.assign({ seed: d.seed }, s));
    for (const p of (d.w5departs || [])) departs.push(Object.assign({ seed: d.seed }, p));
    if (d.wpEnd) wpEnds.push(Object.assign({ seed: d.seed }, d.wpEnd));
    if (d.brainEnd) brainEnds.push(Object.assign({ seed: d.seed }, d.brainEnd));
    // Attach the raw per-seed fields the wall/cost reads need.
    const rec = perSeed[perSeed.length - 1];
    rec.scaleRank = d.scaleRank || null;
    rec.won = !!d.won;
    rec.tableTaken = (d.seatTakes || []).some(function (t) { return t && t.ok; });
    rec.starvation = (d.deaths || []).filter(isStarvation).length;
    rec.wpEnd = d.wpEnd || null;
  }
  const unlocked = perSeed.filter(function (s) { return s.unlocked; });
  const classes = { LOCKED: 0, 'NEVER-FACED': 0, 'FACED-NOT-KILLED': 0, KILLED: 0 };
  perSeed.forEach(function (s) { classes[s.cls] += 1; });
  const totKills = unlocked.reduce(function (a, s) { return a + s.kills; }, 0);
  // FIELD vs TB split (producergate prereg): field kills are the
  // recorded wave-5 fieldFight vKills; TB kills are the residual.
  const totFieldKills = unlocked.reduce(function (a, s) { return a + (s.fieldKills || 0); }, 0);
  const totTbKills = unlocked.reduce(function (a, s) { return a + (s.tbKills || 0); }, 0);
  const totDeathsW5 = unlocked.reduce(function (a, s) { return a + s.deathsW5; }, 0);
  const totDeathsW5Scholar = unlocked.reduce(function (a, s) { return a + s.deathsW5Scholar; }, 0);
  const facedVillages = unlocked.filter(function (s) { return s.facedDistinct > 0; }).length;
  const fnkShare = unlocked.length ? +(unlocked.filter(function (s) { return s.cls === 'FACED-NOT-KILLED'; }).length / unlocked.length).toFixed(2) : null;

  // --- encounter decomposition (wave-5 fieldFights only) ---
  const w5enc = encounters.filter(function (e) { return e.wave === 5; });
  const w4enc = encounters.filter(function (e) { return e.wave === 4; });
  function encSummary(list) {
    const byOutcome = {};
    const byPartySize = {};
    const byGate = {};
    let kills = 0, deaths = 0;
    for (const e of list) {
      byOutcome[e.outcome || '?'] = (byOutcome[e.outcome || '?'] || 0) + 1;
      const ps = (e.allyVids || []).length + 1;
      byPartySize[ps] = (byPartySize[ps] || 0) + 1;
      const g = (e.gate && e.gate.result) || 'no-gate';
      byGate[g] = (byGate[g] || 0) + 1;
      if (e.outcome === 'vKill') kills += 1;
      if (e.outcome === 'vDie') deaths += 1;
    }
    return { n: list.length, byOutcome: byOutcome, byPartySize: byPartySize, byGate: byGate, kills: kills, deaths: deaths };
  }
  // Outcome by party size (wave 5): does a party change the trade?
  const w5byParty = {};
  for (const e of w5enc) {
    const ps = (e.allyVids || []).length + 1;
    const b = w5byParty[ps] || (w5byParty[ps] = { n: 0, vKill: 0, vFlee: 0, mFlee: 0, vDie: 0, evade: 0, other: 0 });
    b.n += 1;
    if (e.outcome === 'vKill') b.vKill += 1;
    else if (e.outcome === 'vFlee') b.vFlee += 1;
    else if (e.outcome === 'mFlee') b.mFlee += 1;
    else if (e.outcome === 'vDie') b.vDie += 1;
    else if (e.outcome === 'evade') b.evade += 1;
    else b.other += 1;
  }
  // Gate decomposition (wave 5): what the fight gate decided, and why.
  const w5gates = gates.filter(function (g) { return g.wave === 5; });
  const gateByResult = {};
  const gateByReason = {};
  for (const g of w5gates) {
    gateByResult[g.result || '?'] = (gateByResult[g.result || '?'] || 0) + 1;
    gateByReason[(g.result || '?') + ':' + (g.reason || '-')] = (gateByReason[(g.result || '?') + ':' + (g.reason || '-')] || 0) + 1;
  }
  const gatePartySizes = {};
  for (const g of w5gates) gatePartySizes[g.partySize] = (gatePartySizes[g.partySize] || 0) + 1;
  const trickKnownAtGate = { known: 0, unknown: 0 };
  for (const g of w5gates) { if (g.trickKnown) trickKnownAtGate.known += 1; else trickKnownAtGate.unknown += 1; }
  const gatePlanStages = {};
  for (const g of w5gates) gatePlanStages[g.planStage || 'no-plan'] = (gatePlanStages[g.planStage || 'no-plan'] || 0) + 1;
  // Plan seeds (wave 5): how often a survived facing seeds a plan.
  const w5seedRows = seeds.filter(function (s) { return s.wave === 5; });
  const seedByOutcome = {};
  for (const s of w5seedRows) seedByOutcome[s.outcome || '?'] = (seedByOutcome[s.outcome || '?'] || 0) + 1;
  // Departures: hunt parties launched vs held — split by launched
  // party size (companions) and by whether the plan targeted wave 4+.
  const departByResult = {};
  const departByStage = {};
  const launchByPartySize = {};
  const launchByPartySizeFull = {};
  const secondCompanionWaits = { n: 0, bySource: {} };
  const launchBySource = {};
  for (const p of departs) {
    departByResult[p.result || '?'] = (departByResult[p.result || '?'] || 0) + 1;
    departByStage[p.stage || '?'] = (departByStage[p.stage || '?'] || 0) + 1;
    if (p.result === 'launch') {
      launchBySource[p.source || 'winPlanDepart'] = (launchBySource[p.source || 'winPlanDepart'] || 0) + 1;
      const cs = (p.companions != null ? p.companions : '?');
      launchByPartySize[cs] = (launchByPartySize[cs] || 0) + 1;
      if (p.needsFull) launchByPartySizeFull[cs] = (launchByPartySizeFull[cs] || 0) + 1;
    }
    // Second-companion wait: a wave-4+ plan held at party_wait with
    // exactly one companion available — the launch is waiting on its
    // second ranger, not on any companion.
    if (p.result === 'hold' && p.needsFull && p.winPlanAction === 'party_wait' && p.companionsAvailable === 1) {
      secondCompanionWaits.n += 1;
      const src = p.source || 'winPlanDepart';
      secondCompanionWaits.bySource[src] = (secondCompanionWaits.bySource[src] || 0) + 1;
    }
  }
  // Win-plan end state (pooled).
  const wpSum = { planSeeds: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 0, w5Targets: 0 };
  const wpByStage = {};
  for (const w of wpEnds) {
    for (const k of Object.keys(wpSum)) wpSum[k] += (w[k] | 0);
    const bs = w.byStage || {};
    for (const st of Object.keys(bs)) wpByStage[st] = (wpByStage[st] || 0) + bs[st];
  }
  // Brain-commit tally (pooled): did the dawn scorer ever commit a
  // win-plan action (party_launch / party_wait / gear_hold)?
  const brainSum = { totalCommits: 0, winPlanCommits: 0, byAction: {}, byOverride: {} };
  for (const b of brainEnds) {
    brainSum.totalCommits += (b.totalCommits | 0);
    brainSum.winPlanCommits += (b.winPlanCommits | 0);
    for (const k of Object.keys(b.byAction || {})) brainSum.byAction[k] = (brainSum.byAction[k] || 0) + b.byAction[k];
    for (const k of Object.keys(b.byOverride || {})) brainSum.byOverride[k] = (brainSum.byOverride[k] || 0) + b.byOverride[k];
  }
  // Wall numbers.
  const national = perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length;
  const table = perSeed.filter(function (s) { return s.tableTaken; }).length;
  const wins = perSeed.filter(function (s) { return s.won; }).length;
  const w4unlock = perSeed.filter(function (s) { return (s.maxWave || 0) >= 4; }).length;
  const w5unlock = unlocked.length;
  const starvation = perSeed.reduce(function (a, s) { return a + (s.starvation | 0); }, 0);

  const pooled = {
    seeds: perSeed.length, files: files.length, parseErrors: parseErrors,
    unlocked: unlocked.length, classes: classes,
    totalKills: totKills,
    fieldKills: totFieldKills,
    tbKills: totTbKills,
    fieldKillsPerUnlocked: unlocked.length ? +(totFieldKills / unlocked.length).toFixed(2) : null,
    tbKillsPerUnlocked: unlocked.length ? +(totTbKills / unlocked.length).toFixed(2) : null,
    killsPerUnlocked: unlocked.length ? +(totKills / unlocked.length).toFixed(2) : null,
    killsPerFaced: facedVillages ? +(totKills / facedVillages).toFixed(2) : null,
    totalDeathsW5: totDeathsW5,
    deathsW5Scholar: totDeathsW5Scholar,
    deathsW5Villager: totDeathsW5 - totDeathsW5Scholar,
    killDeathRatio: totDeathsW5 ? +(totKills / totDeathsW5).toFixed(2) : null,
    fnkShare: fnkShare,
    medianSurvivalUnlocked: med(unlocked.map(function (s) { return s.days; })),
    medianSurvivalAll: med(perSeed.map(function (s) { return s.days; })),
    instrumentErrors: perSeed.reduce(function (a, s) { return a + s.errors.length; }, 0),
    unclassified: perSeed.filter(function (s) { return s.errors.length > 0; }).length,
    starvation: starvation,
    wall: { national: national, table: table, wins: wins, wave4: w4unlock, wave5: w5unlock },
  };
  return {
    perSeed: perSeed, pooled: pooled,
    encounters: { w5: encSummary(w5enc), w4: encSummary(w4enc), w5byParty: w5byParty },
    gates: { w5n: w5gates.length, byResult: gateByResult, byReason: gateByReason, partySizes: gatePartySizes, trickKnown: trickKnownAtGate, planStages: gatePlanStages },
    seeds: { w5n: w5seedRows.length, byOutcome: seedByOutcome },
    departs: { n: departs.length, byResult: departByResult, byStage: departByStage, launchByPartySize: launchByPartySize, launchByPartySizeFull: launchByPartySizeFull, launchBySource: launchBySource, secondCompanionWaits: secondCompanionWaits },
    winplan: { sum: wpSum, byStage: wpByStage },
    brain: brainSum,
  };
}

// judge(control, armed) — the frozen prereg bars. Returns the verdict
// object; the evidence file is the judge, this is the arithmetic.
//   1. field kills per unlocked (armed) >= 1.00 (absolute, primary).
//   2. TB kills per unlocked (armed) >= 0.5x control (no-collapse;
//      vacuous pass when the control leg has no unlocked villages).
//   3. kill:death (total, armed) >= 0.92 — kills with zero deaths pass.
//   4. FNK share (armed) <= 0.20.
//   5. Cost: starvation armed <= control + 2 AND median survival
//      armed >= 0.8x control.
function judge(control, armed) {
  const c = control.pooled, a = armed.pooled;
  const fieldBar = a.fieldKillsPerUnlocked != null ? a.fieldKillsPerUnlocked >= 1.00 : null;
  const tbBar = (c.tbKillsPerUnlocked == null) ? true
    : (a.tbKillsPerUnlocked != null ? a.tbKillsPerUnlocked >= 0.5 * c.tbKillsPerUnlocked : null);
  const ratioBar = (a.totalDeathsW5 === 0 && a.totalKills > 0) ? true
    : (a.killDeathRatio != null ? a.killDeathRatio >= 0.92 : null);
  const fnkBar = a.fnkShare != null ? a.fnkShare <= 0.2 : null;
  const starvBar = a.starvation <= c.starvation + 2;
  const survBar = (a.medianSurvivalAll != null && c.medianSurvivalAll != null)
    ? a.medianSurvivalAll >= 0.8 * c.medianSurvivalAll : null;
  const go = fieldBar === true && tbBar === true && ratioBar === true && fnkBar === true && starvBar && survBar;
  return {
    fieldKillsPerUnlocked: { control: c.fieldKillsPerUnlocked, armed: a.fieldKillsPerUnlocked, bar: 'armed >= 1.00', pass: fieldBar },
    tbKillsPerUnlocked: { control: c.tbKillsPerUnlocked, armed: a.tbKillsPerUnlocked, bar: 'armed >= 0.5x control', pass: tbBar },
    killsPerUnlocked: { control: c.killsPerUnlocked, armed: a.killsPerUnlocked, bar: 'reported (field + TB)', pass: null },
    killDeathRatio: { control: c.killDeathRatio, armed: a.killDeathRatio, bar: 'armed >= 0.92', pass: ratioBar },
    fnkShare: { control: c.fnkShare, armed: a.fnkShare, bar: 'armed <= 0.20', pass: fnkBar },
    starvation: { control: c.starvation, armed: a.starvation, bar: 'armed <= control + 2', pass: starvBar },
    medianSurvival: { control: c.medianSurvivalAll, armed: a.medianSurvivalAll, bar: 'armed >= 0.8x control', pass: survBar },
    verdict: go ? 'GO' : 'NO-GO',
  };
}

const isMain = require.main === module;
if (isMain) {
  const controlDir = process.argv[2];
  const armedDir = process.argv[3];
  if (!controlDir || !armedDir) {
    console.error('usage: node scripts/analyze-producergate-b.js <control-dir> <armed-dir>');
    process.exit(2);
  }
  const monstersPath = path.join(__dirname, '..', 'src', 'data', 'monsters.json');
  const w5set = new Set(w5k.loadWave5Ids(monstersPath));
  const out = {
    control: analyzeLeg(controlDir, w5set),
    armed: analyzeLeg(armedDir, w5set),
  };
  out.judgment = judge(out.control, out.armed);
  console.log(JSON.stringify(out, null, 2));
}

module.exports = { analyzeLeg: analyzeLeg, judge: judge, med: med, isStarvation: isStarvation };
