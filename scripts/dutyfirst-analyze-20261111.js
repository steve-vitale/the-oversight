// dutyfirst-analyze-20261111.js — duties first-numbers analyzer
// (arm sim-dutyfirst-b). Reads evidence/2026-11-11/perseed-dutyfirst-b/
// control-leg JSON and prints per-seed + pooled tables as JSON.
// Neutrality: pass --neutral-dir <dir> to compare control vs neutral
// legs (days + end pantry kcal + deaths, exact match per seed).
// Usage: node scripts/dutyfirst-analyze-20261111.js [--out <summary.json>]
//   [--dir <perseed-dir>] [--run <run-tag>] [--mode control]
//   [--neutral-dir <perseed-dir>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const args = process.argv.slice(2);
function argVal(flag, def) {
  const i = args.indexOf(flag);
  return (i >= 0 && args[i + 1]) ? args[i + 1] : def;
}
const DIR = argVal('--dir', path.join(REPO, 'evidence', '2026-11-11', 'perseed-dutyfirst-b'));
const RUN = argVal('--run', 'dutyfirst-pilot');
const MODE = argVal('--mode', 'control');
const NEUTRAL_DIR = argVal('--neutral-dir', null);
const OUT = argVal('--out', null);

const TASKS = ['forage', 'garden', 'fish', 'hunt', 'wood', 'stone',
  'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend', 'rest'];
const OUTDOOR = ['patrol', 'scout', 'hunt', 'forage'];
const HAVEN = ['cook', 'tend', 'teach', 'mend', 'garden'];
// Deposit name -> duty task attribution (the duty-yield map).
function dutyTaskForDeposit(name) {
  if (!name) return null;
  if (name === 'Foraged food') return 'forage-or-scout';
  if (name === 'Fish catch') return 'fish';
  if (name === 'Game meat') return 'hunt';
  if (name === 'Garden harvest') return 'garden';
  return null;
}
function isDutyDepositName(n) { return dutyTaskForDeposit(n) !== null; }

if (require.main !== module) { module.exports = { dutyTaskForDeposit: dutyTaskForDeposit, isDutyDepositName: isDutyDepositName }; return; }

function loadLeg(dir, run, mode) {
  const files = fs.readdirSync(dir)
    .filter(function (f) { return f.indexOf('dutyfirst-s') === 0 && f.indexOf('-' + run + '-' + mode + '.json') !== -1; })
    .sort();
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

const control = loadLeg(DIR, RUN, MODE);
if (!control.length) { console.error('DUTYFIRST-ANALYZE STOP: no control files in ' + DIR); process.exit(2); }

const perSeed = [];
const pooled = {
  seeds: control.length,
  assignByTask: {}, assignTotal: 0, assignOk: 0, assignRefused: 0, assignNull: 0,
  refusedReasons: {}, refusedByVid: {},
  offerDealCalls: 0, appealToGoalCalls: 0,
  neverAsked: {},
  taskLeadsHeld: {}, taskLeadDays: 0,
  walkdownSeqs: 0, walkdownFallbackAccepts: 0, walkdownTopAccepts: 0,
  resolutionsByTask: {}, resolutionsByPath: {}, resolutionsByOutcome: {},
  resolveCallOutcomes: {},
  resolutionsPerVillager: {}, practiceRepsByTask: {},
  practiceStepsMoved: {},
  depositsByName: {}, dutyDepositKcal: 0, totalDepositKcal: 0,
  unclassifiedDeposits: 0, unclassifiedAssign: 0, unclassifiedResolves: 0,
  huntsTotal: 0, huntsKills: 0, huntsKcal: 0, huntsBySpecies: {},
  hurtsTotal: 0, hurtsOnDuty: 0, hurtsByCause: {}, hurtsOnDutyByCause: {},
  hurtsDied: 0, hurtsDiedOnDuty: 0,
  patrolsTotal: 0, patrolKills: 0, patrolHurts: 0, patrolDeaths: 0,
  medicHolderDays: 0, medicHolders: {}, medicTurnovers: 0,
  medicEligibleAvg: [], medicCuresAbility: 0, medicCuresMedicine: 0,
  cureAttempts: 0, cureAttemptsCured: 0, curePatients: {},
  medicVacantDays: 0, noMedicSickDays: 0, careTicks: 0,
  teleTrapByType: {},
  deedsByDeed: {}, deedsByWho: {},
  objectivesByKind: {},
  dutyVsObjectiveWater: { duty: 0, objective: 0 },
  woodSayTotal: 0, stoneSayTotal: 0, sticksSayTotal: 0, fiberSayTotal: 0,
  waterSayLiters: 0, scoutTilesSay: 0,
  deadfallHauls: 0, deadfallSticks: 0, deadfallFiber: 0,
  waterHauls: 0, cisternRedirects: 0, cisternOverflowL: 0,
  throttleRedirects: 0, throttleExemptDepth: 0,
  preserveBatches: 0, preserveKcal: 0,
  sickAssignedOutdoorDays: 0, hpUnder40AssignedDays: 0,
  instrumentErrors: 0,
  wall: { wins: 0, national: 0, table: 0, wave4: 0, wave5: 0, regional: 0, survivals: [], deaths: 0 },
};

function stepsOf(reps) {
  let steps = 0, need = 8, cum = 0;
  while (steps < 3) { cum += need; if (reps >= cum) steps++; else break; need += 4; }
  return steps;
}

for (const o of control) {
  const s = { seed: o.seed, days: o.days, endReason: o.endReason, won: o.won, villageLost: o.villageLost, scaleRank: o.scaleRank, maxWave: o.maxWave, standing: o.standing, deaths: o.deaths.length, endPantryKcal: o.endPantryKcal, errors: o.instrumentErrors.length };
  pooled.instrumentErrors += o.instrumentErrors.length;

  // --- Metric 1: staffing ---
  const byTask = {};
  const askedVids = {};
  let walkSeqs = 0, walkFallback = 0, walkTop = 0;
  // Walk-down grouping: consecutive assignTask calls for the same task
  // in the same day-part with an assignAnother caller frame.
  let curSeq = null;
  for (const c of (o.assignCalls || [])) {
    if (c.verb !== 'assignTask') continue;
    if (c.task) {
      byTask[c.task] = byTask[c.task] || { asked: 0, ok: 0, refused: 0, null: 0, reasons: {} };
      byTask[c.task].asked++;
      pooled.assignByTask[c.task] = pooled.assignByTask[c.task] || { asked: 0, ok: 0, refused: 0, null: 0, reasons: {} };
      pooled.assignByTask[c.task].asked++;
      pooled.assignTotal++;
      if (c.ret === 'ok') { byTask[c.task].ok++; pooled.assignByTask[c.task].ok++; pooled.assignOk++; }
      else if (c.ret === 'refused') {
        byTask[c.task].refused++; pooled.assignByTask[c.task].refused++; pooled.assignRefused++;
        const rc = c.reasonClass || 'other';
        byTask[c.task].reasons[rc] = (byTask[c.task].reasons[rc] || 0) + 1;
        pooled.assignByTask[c.task].reasons[rc] = (pooled.assignByTask[c.task].reasons[rc] || 0) + 1;
        pooled.refusedReasons[rc] = (pooled.refusedReasons[rc] || 0) + 1;
        pooled.refusedByVid[c.vid] = (pooled.refusedByVid[c.vid] || 0) + 1;
      } else if (c.ret === 'null') { byTask[c.task].null++; pooled.assignByTask[c.task].null++; pooled.assignNull++; }
      if (c.reasonClass === 'other' || c.reasonClass === 'null-other' || c.reasonClass === 'refused-unclassified') pooled.unclassifiedAssign++;
      if (c.vid) askedVids[c.vid] = true;
    }
    // walk-down sequence tracking (assignAnother frame only)
    const key = (c.caller || '').indexOf('assignAnother') !== -1 ? (c.day + '|' + c.part + '|' + c.task) : null;
    if (key) {
      if (!curSeq || curSeq.key !== key) {
        if (curSeq && curSeq.acceptedAt !== null) { walkSeqs++; if (curSeq.acceptedAt > 0) walkFallback++; else walkTop++; }
        curSeq = { key: key, idx: 0, acceptedAt: null };
      }
      if (c.ret === 'ok' && curSeq.acceptedAt === null) curSeq.acceptedAt = curSeq.idx;
      curSeq.idx++;
    } else if (curSeq) {
      if (curSeq.acceptedAt !== null) { walkSeqs++; if (curSeq.acceptedAt > 0) walkFallback++; else walkTop++; }
      curSeq = null;
    }
  }
  if (curSeq && curSeq.acceptedAt !== null) { walkSeqs++; if (curSeq.acceptedAt > 0) walkFallback++; else walkTop++; }
  s.assignByTask = byTask;
  s.walkdownSeqs = walkSeqs; s.walkdownFallbackAccepts = walkFallback; s.walkdownTopAccepts = walkTop;
  pooled.walkdownSeqs += walkSeqs; pooled.walkdownFallbackAccepts += walkFallback; pooled.walkdownTopAccepts += walkTop;
  s.offerDealCalls = (o.assignCalls || []).filter(function (c) { return c.verb === 'offerDeal'; }).length;
  s.appealToGoalCalls = (o.assignCalls || []).filter(function (c) { return c.verb === 'appealToGoal'; }).length;
  pooled.offerDealCalls += s.offerDealCalls; pooled.appealToGoalCalls += s.appealToGoalCalls;
  // never asked: roster vids in any snapshot never appearing in assignCalls
  const rosterSeen = {};
  for (const d of (o.daily || [])) for (const vid of (d.roster || [])) rosterSeen[vid] = true;
  s.neverAsked = Object.keys(rosterSeen).filter(function (vid) { return !askedVids[vid]; });
  for (const vid of s.neverAsked) pooled.neverAsked[vid] = (pooled.neverAsked[vid] || 0) + 1;
  // task leads held per day
  let leadDays = 0; const leadsHeld = {};
  for (const d of (o.daily || [])) {
    for (const tk of Object.keys(d.taskLeads || {})) {
      leadDays++; leadsHeld[tk] = (leadsHeld[tk] || 0) + 1;
      pooled.taskLeadsHeld[tk] = (pooled.taskLeadsHeld[tk] || 0) + 1;
    }
  }
  s.taskLeadDays = leadDays; s.taskLeadsHeld = leadsHeld;
  pooled.taskLeadDays += leadDays;

  // --- Metric 2: resolutions ---
  const resByTask = {}, resByPath = {}, resByOutcome = {};
  const resPerVillager = {};
  for (const r of (o.resolutions || [])) {
    const tk = r.taskPost || r.taskPre || 'unknown';
    resByTask[tk] = resByTask[tk] || { completed: 0, redirected: 0, 'skipped-early': 0, 'exception-thrown': 0, total: 0 };
    resByTask[tk][r.outcome] = (resByTask[tk][r.outcome] || 0) + 1;
    resByTask[tk].total++;
    pooled.resolutionsByTask[tk] = pooled.resolutionsByTask[tk] || { completed: 0, redirected: 0, 'skipped-early': 0, 'exception-thrown': 0, total: 0 };
    pooled.resolutionsByTask[tk][r.outcome] = (pooled.resolutionsByTask[tk][r.outcome] || 0) + 1;
    pooled.resolutionsByTask[tk].total++;
    resByPath[r.callerPath] = (resByPath[r.callerPath] || 0) + 1;
    pooled.resolutionsByPath[r.callerPath] = (pooled.resolutionsByPath[r.callerPath] || 0) + 1;
    resByOutcome[r.outcome] = (resByOutcome[r.outcome] || 0) + 1;
    pooled.resolutionsByOutcome[r.outcome] = (pooled.resolutionsByOutcome[r.outcome] || 0) + 1;
    if (r.vid) {
      resPerVillager[r.vid] = (resPerVillager[r.vid] || 0) + 1;
      pooled.resolutionsPerVillager[r.vid] = (pooled.resolutionsPerVillager[r.vid] || 0) + 1;
    }
  }
  s.resolutionsByTask = resByTask; s.resolutionsByPath = resByPath; s.resolutionsByOutcome = resByOutcome;
  s.resolutionsPerVillager = resPerVillager;
  const rcOutcomes = {};
  for (const rc of (o.resolveCalls || [])) {
    rcOutcomes[rc.outcome] = (rcOutcomes[rc.outcome] || 0) + 1;
    pooled.resolveCallOutcomes[rc.outcome] = (pooled.resolveCallOutcomes[rc.outcome] || 0) + 1;
    if (rc.outcome === 'unclassified') pooled.unclassifiedResolves++;
  }
  s.resolveCallOutcomes = rcOutcomes;
  // practice reps + competence movement (first vs last snapshot)
  const prByTask = {};
  for (const pr of (o.practiceReps || [])) {
    prByTask[pr.task] = (prByTask[pr.task] || 0) + 1;
    pooled.practiceRepsByTask[pr.task] = (pooled.practiceRepsByTask[pr.task] || 0) + 1;
  }
  s.practiceRepsByTask = prByTask;
  const daily = o.daily || [];
  const firstSnap = daily[0] || {}, lastSnap = daily[daily.length - 1] || {};
  let moved = 0; const movedByTask = {};
  if (firstSnap.competence && lastSnap.competence) {
    for (const vid of Object.keys(lastSnap.competence)) {
      for (const tk of Object.keys(lastSnap.competence[vid] || {})) {
        const a = (firstSnap.competence[vid] || {})[tk];
        const b = lastSnap.competence[vid][tk];
        if (typeof a === 'number' && typeof b === 'number' && b > a) {
          moved++; movedByTask[tk] = (movedByTask[tk] || 0) + 1;
          pooled.practiceStepsMoved[tk] = (pooled.practiceStepsMoved[tk] || 0) + 1;
        }
      }
    }
  }
  s.competenceMovedCells = moved; s.competenceMovedByTask = movedByTask;
  // duty time share: resolutions per villager-day
  const villagerDays = daily.reduce(function (a, d) { return a + (d.rosterLen || 0); }, 0);
  s.villagerDays = villagerDays;
  s.resolutionsTotal = (o.resolutions || []).length;
  s.dutyTimeShare = villagerDays ? +(s.resolutionsTotal / villagerDays).toFixed(3) : null;

  // --- Metric 3: yield ---
  const depByName = {};
  for (const d of (o.deposits || [])) {
    depByName[d.name] = (depByName[d.name] || 0) + (d.kcal || 0);
    pooled.depositsByName[d.name] = (pooled.depositsByName[d.name] || 0) + (d.kcal || 0);
    pooled.totalDepositKcal += (d.kcal || 0);
    if (!d.name) pooled.unclassifiedDeposits++;
    if (isDutyDepositName(d.name)) pooled.dutyDepositKcal += (d.kcal || 0);
  }
  s.deposits = depByName;
  s.dutyDepositKcal = Object.keys(depByName).filter(isDutyDepositName).reduce(function (a, n) { return a + depByName[n]; }, 0);
  s.totalDepositKcal = Object.keys(depByName).reduce(function (a, n) { return a + depByName[n]; }, 0);
  // hunts
  let hKills = 0, hKcal = 0; const hBySpecies = {};
  for (const h of (o.hunts || [])) {
    pooled.huntsTotal++;
    if (h.killed) {
      hKills++; pooled.huntsKills++; hKcal += (h.kcal || 0); pooled.huntsKcal += (h.kcal || 0);
      hBySpecies[h.aid] = (hBySpecies[h.aid] || 0) + 1;
      pooled.huntsBySpecies[h.aid] = (pooled.huntsBySpecies[h.aid] || 0) + 1;
    }
  }
  s.huntsTotal = (o.hunts || []).length; s.huntKills = hKills; s.huntKcal = hKcal; s.huntsBySpecies = hBySpecies;
  // say-parsed non-kcal yields (the same lines the player sees)
  let wood = 0, stone = 0, sticks = 0, fiber = 0, liters = 0, tiles = 0;
  for (const say of (o.dutySays || [])) {
    let m;
    if ((m = /hauls back (\d+) wood/.exec(say.line))) wood += parseInt(m[1], 10);
    if ((m = /pries (\d+) stone/.exec(say.line))) stone += parseInt(m[1], 10);
    if ((m = /gathers deadfall — (\d+) sticks?/.exec(say.line))) sticks += parseInt(m[1], 10);
    if ((m = /\+ (\d+) fiber/.exec(say.line))) fiber += parseInt(m[1], 10);
    if ((m = /returns with (\d+)L/.exec(say.line))) liters += parseInt(m[1], 10);
    if ((m = /mapped (\d+) new areas?/.exec(say.line))) tiles += parseInt(m[1], 10);
  }
  s.sayWood = wood; s.sayStone = stone; s.saySticks = sticks; s.sayFiber = fiber; s.sayWaterLiters = liters; s.sayScoutTiles = tiles;
  pooled.woodSayTotal += wood; pooled.stoneSayTotal += stone; pooled.sticksSayTotal += sticks;
  pooled.fiberSayTotal += fiber; pooled.waterSayLiters += liters; pooled.scoutTilesSay += tiles;
  // ledgers (end-of-run cumulative snapshots)
  const last = daily[daily.length - 1] || {};
  s.deadfallHauls = (last.deadfall || {}).hauls || 0;
  s.deadfallSticks = (last.deadfall || {}).sticks || 0;
  s.deadfallFiber = (last.deadfall || {}).fiber || 0;
  s.waterHauls = (last.cistern || {}).waterHauls || 0;
  s.cisternRedirects = (last.cistern || {}).cisternRedirects || 0;
  s.cisternOverflowL = (last.cistern || {}).cisternOverflowL || 0;
  s.throttleRedirects = (last.throttle || {}).throttleRedirects || 0;
  s.throttleExemptDepth = (last.throttle || {}).throttleExemptDepth || 0;
  s.preserveBatches = (last.haulcount || {}).villagerPreserveBatches || 0;
  s.preserveKcal = (last.haulcount || {}).villagerPreserveKcal || 0;
  pooled.deadfallHauls += s.deadfallHauls; pooled.deadfallSticks += s.deadfallSticks; pooled.deadfallFiber += s.deadfallFiber;
  pooled.waterHauls += s.waterHauls; pooled.cisternRedirects += s.cisternRedirects; pooled.cisternOverflowL += s.cisternOverflowL;
  pooled.throttleRedirects += s.throttleRedirects; pooled.throttleExemptDepth += s.throttleExemptDepth;
  pooled.preserveBatches += s.preserveBatches; pooled.preserveKcal += s.preserveKcal;

  // --- Metric 4: harm / excusal ---
  let hOnDuty = 0, hDied = 0, hDiedOnDuty = 0; const hByCause = {}, hOnDutyByCause = {};
  for (const h of (o.hurts || [])) {
    pooled.hurtsTotal++;
    hByCause[h.cause || 'unknown'] = (hByCause[h.cause || 'unknown'] || 0) + 1;
    pooled.hurtsByCause[h.cause || 'unknown'] = (pooled.hurtsByCause[h.cause || 'unknown'] || 0) + 1;
    if (h.dutyTask || h.leadTask) {
      hOnDuty++; pooled.hurtsOnDuty++;
      hOnDutyByCause[h.cause || 'unknown'] = (hOnDutyByCause[h.cause || 'unknown'] || 0) + 1;
      pooled.hurtsOnDutyByCause[h.cause || 'unknown'] = (pooled.hurtsOnDutyByCause[h.cause || 'unknown'] || 0) + 1;
    }
    if (h.died) { hDied++; pooled.hurtsDied++; if (h.dutyTask || h.leadTask) { hDiedOnDuty++; pooled.hurtsDiedOnDuty++; } }
  }
  s.hurtsTotal = (o.hurts || []).length; s.hurtsOnDuty = hOnDuty; s.hurtsByCause = hByCause;
  s.hurtsOnDutyByCause = hOnDutyByCause; s.hurtsDied = hDied; s.hurtsDiedOnDuty = hDiedOnDuty;
  s.fitnessRefusals = (o.assignCalls || []).filter(function (c) { return c.ret === 'refused' && c.reasonClass === 'wounded'; }).length;
  s.fitnessRests = (o.resolveCalls || []).filter(function (c) { return c.outcome === 'fitness-rest'; }).length;
  s.shelteredKept = (o.resolveCalls || []).filter(function (c) { return c.outcome === 'sheltered-kept'; }).length;
  // sick assigned outdoor + HP<40 holding assignments at dawn (daily snapshots)
  let sickOut = 0, hp40 = 0;
  for (const d of daily) {
    const sick = d.sick || {};
    for (const vid of Object.keys(d.assignments || {})) {
      const tk = (d.assignments[vid] || {}).task;
      if (sick[vid] && OUTDOOR.indexOf(tk) >= 0) sickOut++;
      if ((d.rosterHP || {})[vid] !== undefined && d.rosterHP[vid] < 40) hp40++;
    }
  }
  s.sickAssignedOutdoorDays = sickOut; s.hpUnder40AssignedDays = hp40;
  pooled.sickAssignedOutdoorDays += sickOut; pooled.hpUnder40AssignedDays += hp40;

  // --- Metric 5: medic duty ---
  let holderDays = 0; const holders = {}; let turnovers = 0, vacant = 0, noMedicSick = 0;
  let prevHolder = null, firstDay = true;
  let eligSum = 0, eligDays = 0;
  for (const d of daily) {
    if (d.medicDutyHolder) {
      holderDays++;
      holders[d.medicDutyHolder] = (holders[d.medicDutyHolder] || 0) + 1;
      if (!firstDay && prevHolder !== d.medicDutyHolder) turnovers++;
      prevHolder = d.medicDutyHolder;
    } else {
      if (d.medicDutyRaw) vacant++;
      if ((d.sickCount || 0) > 0 && (d.medicEligible === 0)) noMedicSick++;
      if (!firstDay && prevHolder !== null) turnovers++;
      prevHolder = null;
    }
    firstDay = false;
    if (typeof d.medicEligible === 'number') { eligSum += d.medicEligible; eligDays++; }
  }
  s.medicHolderDays = holderDays; s.medicHolders = holders; s.medicTurnovers = turnovers;
  s.medicVacantDays = vacant; s.noMedicSickDays = noMedicSick;
  s.medicEligibleAvg = eligDays ? +(eligSum / eligDays).toFixed(2) : null;
  pooled.medicHolderDays += holderDays; pooled.medicTurnovers += turnovers;
  pooled.medicVacantDays += vacant; pooled.noMedicSickDays += noMedicSick;
  for (const h of Object.keys(holders)) pooled.medicHolders[h] = (pooled.medicHolders[h] || 0) + holders[h];
  pooled.medicEligibleAvg.push(s.medicEligibleAvg);
  const lastCures = (last.medicCures || { ability: 0, medicine: 0 });
  s.medicCuresAbility = lastCures.ability || 0; s.medicCuresMedicine = lastCures.medicine || 0;
  pooled.medicCuresAbility += s.medicCuresAbility; pooled.medicCuresMedicine += s.medicCuresMedicine;
  s.cureAttempts = (o.cureAttempts || []).length;
  s.cureAttemptsCured = (o.cureAttempts || []).filter(function (c) { return c.result === 'cured'; }).length;
  pooled.cureAttempts += s.cureAttempts; pooled.cureAttemptsCured += s.cureAttemptsCured;
  const patients = {};
  for (const c of (o.cureAttempts || [])) if (c.pid) { patients[c.pid] = (patients[c.pid] || 0) + 1; pooled.curePatients[c.pid] = (pooled.curePatients[c.pid] || 0) + 1; }
  s.curePatients = patients;
  s.careTicks = (o.careTicks || []).length;
  pooled.careTicks += s.careTicks;
  s.medicTicks = (o.medicTicks || []).length;

  // --- Metric 6: villager-initiative parallel ---
  const objKinds = {};
  let waterObj = 0;
  for (const d of daily) {
    for (const vid of Object.keys(d.objectives || {})) {
      const k = d.objectives[vid] || 'none';
      objKinds[k] = (objKinds[k] || 0) + 1;
      pooled.objectivesByKind[k] = (pooled.objectivesByKind[k] || 0) + 1;
      if (k === 'WATER') waterObj++;
    }
  }
  s.objectivesByKind = objKinds;
  s.waterDutyResolutions = (o.resolutions || []).filter(function (r) { return r.taskPost === 'water' && r.outcome === 'completed'; }).length;
  pooled.dutyVsObjectiveWater.duty += s.waterDutyResolutions;
  pooled.dutyVsObjectiveWater.objective += waterObj;
  const teleByType = {};
  for (const tt of (o.teleTrap || [])) {
    teleByType[tt.type] = teleByType[tt.type] || { n: 0, caught: 0, kcal: 0 };
    teleByType[tt.type].n++;
    pooled.teleTrapByType[tt.type] = pooled.teleTrapByType[tt.type] || { n: 0, caught: 0, kcal: 0 };
    pooled.teleTrapByType[tt.type].n++;
    if (tt.caught) { teleByType[tt.type].caught++; teleByType[tt.type].kcal += (tt.kcal || 0); pooled.teleTrapByType[tt.type].caught++; pooled.teleTrapByType[tt.type].kcal += (tt.kcal || 0); }
  }
  s.teleTrapByType = teleByType;

  // --- Metric 7: fairness ---
  s.patrolsTotal = (o.patrols || []).length;
  pooled.patrolsTotal += s.patrolsTotal;
  s.patrolKills = (o.waveKills || []).filter(function (w) { return w.channel === 'patrol'; }).length;
  pooled.patrolKills += s.patrolKills;
  s.patrolHurts = (o.hurts || []).filter(function (h) { return h.cause === 'monster' && (h.dutyTask === 'patrol' || h.leadTask === 'patrol'); }).length;
  pooled.patrolHurts += s.patrolHurts;
  s.patrolDeaths = (o.hurts || []).filter(function (h) { return h.cause === 'monster' && h.died && (h.dutyTask === 'patrol' || h.leadTask === 'patrol'); }).length;
  pooled.patrolDeaths += s.patrolDeaths;
  // deeds
  const deedsByDeed = {}, deedsByWho = {};
  for (const d of (o.deeds || [])) {
    deedsByDeed[d.deed] = (deedsByDeed[d.deed] || 0) + 1;
    pooled.deedsByDeed[d.deed] = (pooled.deedsByDeed[d.deed] || 0) + 1;
    deedsByWho[d.who || 'unknown'] = (deedsByWho[d.who || 'unknown'] || 0) + 1;
    pooled.deedsByWho[d.who || 'unknown'] = (pooled.deedsByWho[d.who || 'unknown'] || 0) + 1;
  }
  s.deedsByDeed = deedsByDeed;
  s.deedsTotal = (o.deeds || []).length;
  // concentration: top-3 share of resolutions
  const ranked = Object.keys(resPerVillager).map(function (vid) { return { vid: vid, n: resPerVillager[vid] }; }).sort(function (a, b) { return b.n - a.n; });
  s.top3Resolutions = ranked.slice(0, 3);
  s.top3Share = s.resolutionsTotal ? +((ranked.slice(0, 3).reduce(function (a, x) { return a + x.n; }, 0)) / s.resolutionsTotal).toFixed(3) : null;
  s.neverResolved = Object.keys(rosterSeen).filter(function (vid) { return !resPerVillager[vid]; }).length;
  s.snapshots = daily.length;
  s.sayCapped = !!o.sayCapped;
  s.dutySays = (o.dutySays || []).length;

  // wall
  pooled.wall.survivals.push(o.days);
  pooled.wall.deaths += o.deaths.length;
  if (o.won) pooled.wall.wins++;
  if (o.scaleRank === 'national' || o.scaleRank === 'galactic') pooled.wall.national++;
  if (o.scaleRank === 'table' || o.scaleRank === 'galactic') pooled.wall.table++;
  if ((o.maxWave || 1) >= 4) pooled.wall.wave4++;
  if ((o.maxWave || 1) >= 5) pooled.wall.wave5++;
  if (o.scaleRank === 'regional' || o.scaleRank === 'national' || o.scaleRank === 'table' || o.scaleRank === 'galactic') pooled.wall.regional++;
  s.wall = { won: !!o.won, scaleRank: o.scaleRank, maxWave: o.maxWave, standing: o.standing };

  perSeed.push(s);
}

pooled.wall.survivals.sort(function (a, b) { return a - b; });
const sv = pooled.wall.survivals;
pooled.wall.medianSurvival = sv.length ? (sv.length % 2 ? sv[(sv.length - 1) / 2] : (sv[sv.length / 2 - 1] + sv[sv.length / 2]) / 2) : null;
pooled.wall.villageLost = perSeed.filter(function (s) { return s.villageLost; }).length;
pooled.medicEligibleAvg = pooled.medicEligibleAvg.filter(function (x) { return x !== null; });
pooled.dutyDepositShare = pooled.totalDepositKcal ? +(pooled.dutyDepositKcal / pooled.totalDepositKcal).toFixed(3) : null;

// Neutrality comparison (control vs neutral legs).
let neutrality = null;
if (NEUTRAL_DIR) {
  const neutral = loadLeg(NEUTRAL_DIR, RUN, 'neutral');
  const bySeed = {};
  for (const o of neutral) bySeed[o.seed] = o;
  neutrality = { seeds: [], match: 0, total: 0 };
  for (const c of control) {
    const n = bySeed[c.seed];
    if (!n) { neutrality.seeds.push({ seed: c.seed, error: 'no neutral file' }); continue; }
    const match = c.days === n.days && c.endPantryKcal === n.endPantryKcal && c.deaths.length === n.deaths.length;
    neutrality.total++;
    if (match) neutrality.match++;
    neutrality.seeds.push({
      seed: c.seed, match: match,
      control: { days: c.days, endPantryKcal: c.endPantryKcal, deaths: c.deaths.length },
      neutral: { days: n.days, endPantryKcal: n.endPantryKcal, deaths: n.deaths.length },
    });
  }
}

const out = { perSeed: perSeed, pooled: pooled, neutrality: neutrality };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
