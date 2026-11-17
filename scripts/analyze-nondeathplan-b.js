// analyze-nondeathplan-b.js — analyzer for arm sim-nondeathplan-b (BUILD).
// Compares the CONTROL leg (pre-fix) and ARMED leg (post-fix) on identical
// seeds. It reuses the deathcleanup analyzer's frozen counts (NOT
// modified) for the death leg / wall numbers / cost inputs, and adds ONLY
// the non-death analysis: a removal map per seed (from the `removals`
// wrap — exact day + how — AND a roster-disappearance derivation from
// `daily[].roster`, which also catches bypass removals the wrap never
// sees), lingering plan entries / party refs 7+ days after each removal
// (mirroring the deathcleanup slot definition: one count per census
// row), the no-ignition check, and the D3 drift smoke with
// firstLeverDay = the first non-death removal day (the death cleanup is
// in BOTH legs, so only a non-death removal can first separate them).
// Frozen GO bars (see the prereg):
//   bar 1: armed lingering entry rows 0 AND party-ref rows 0, with
//          winPlanStats.removalCleanups > 0 band-wide;
//   bar 2: (a) control reproduces the defect (entry rows > 0 OR
//          party-ref rows > 0); (b) no ignition regression — no-plan
//          seeds armed within ±1 of control AND no armed seed whose
//          first plan creation follows a removal in a previously
//          plan-less village;
//   bar 3: cost bars — total deaths armed <= control + 10%; median
//          survival armed >= 0.8x control; wave-4 kills within ±20%.
// Bar 4 (proof green) and bar 5 (panel) are judged outside this script.
// Usage:
//   node scripts/analyze-nondeathplan-b.js --control evidence/2026-11-17/perseed-nondeathplan-b-control --armed evidence/2026-11-17/perseed-nondeathplan-b-armed [--out evidence/2026-11-17/nondeathplan-b-analysis.json]
// Exits 0 iff bars 1, 2, 3 pass AND no pre-lever drift; prints the verdict.
'use strict';
const fs = require('fs');
const path = require('path');
const DC = require(path.join(__dirname, 'analyze-deathcleanup-b.js'));
const DEADPLAN = require(path.join(__dirname, 'analyze-deadplan-b.js'));

function median(xs) {
  const s = (xs || []).slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function removalCleanups(j) {
  try { return ((j.winPlanStats || {}).removalCleanups) | 0; } catch (e) { return 0; }
}
function totalDeaths(j) { return (j.deaths || []).length; }

// removalMap(j): every non-death removal of a villager in this run.
// Sources: (1) the `removals` wrap rows {day, vid, how} — exact day +
// how, but the wrap also records DEATH removals (removeVillager
// ('killed') flows through it), so a wrap row is a death, not a
// removal, when a deaths-array row OR a first dead-census row dates
// at/before the removal day (+1 day of census lag). (2) The
// roster-disappearance derivation from daily[].roster: a vid present
// on some snapshot day and absent from the last snapshot's roster
// (permanent disappearance) left on lastSeenDay + 1. A derivation
// removal with no wrap row is a BYPASS removal (how
// 'unknown-bypass') — the party.js direct-roster path on the control
// leg is the known one; any other bypass is a finding. A death row
// dated AFTER the removal is a post-removal death: the removal was
// still non-death, and it is noted, not reclassified.
function removalMap(j) {
  const wrap = {};
  for (const r of (j.removals || [])) {
    if (!r || !r.vid) continue;
    if (wrap[r.vid] == null || r.day < wrap[r.vid].day) {
      wrap[r.vid] = { vid: r.vid, day: (r.day | 0), how: r.how || 'unknown', source: 'wrap' };
    }
  }
  const daily = j.daily || [];
  const lastDay = daily.length ? daily[daily.length - 1].day : null;
  const seen = {};
  for (const d of daily) {
    for (const r of (d.roster || [])) {
      if (!r || !r.vid) continue;
      if (!seen[r.vid]) seen[r.vid] = { first: d.day, last: d.day, name: r.name || null };
      else { seen[r.vid].last = d.day; if (!seen[r.vid].name && r.name) seen[r.vid].name = r.name; }
    }
  }
  const deathsByVid = {};
  for (const d of (j.deaths || [])) {
    if (!d || (d.kind !== 'villager' && d.kind !== 'person') || !d.who) continue;
    if (deathsByVid[d.who] == null || d.day < deathsByVid[d.who]) deathsByVid[d.who] = (d.day | 0);
  }
  const firstDeadCensus = {};
  for (const r of (j.planCensus || [])) {
    if (r.holderAlive === false && firstDeadCensus[r.vid] == null) firstDeadCensus[r.vid] = (r.day | 0);
  }
  function isDeathAtRemoval(vid, day) {
    const dd = deathsByVid[vid];
    if (dd != null && dd <= day + 1) return true;
    const fd = firstDeadCensus[vid];
    if (fd != null && fd <= day + 1) return true;
    return false;
  }
  const map = {};
  const notes = [];
  for (const vid of Object.keys(wrap)) {
    const w = wrap[vid];
    if (isDeathAtRemoval(vid, w.day)) continue;
    const dd = deathsByVid[vid];
    if (dd != null && dd > w.day + 1) notes.push({ vid: vid, note: 'post-removal-death', removalDay: w.day, deathDay: dd });
    if (!seen[vid]) notes.push({ vid: vid, note: 'wrap-no-roster-history', removalDay: w.day, how: w.how });
    map[vid] = { vid: vid, day: w.day, how: w.how, source: 'wrap',
      name: (seen[vid] || {}).name || null, deathDay: dd != null ? dd : null };
  }
  for (const vid of Object.keys(seen)) {
    if (map[vid]) continue;
    const s = seen[vid];
    if (lastDay == null || s.last >= lastDay) continue;
    const rDay = s.last + 1;
    if (isDeathAtRemoval(vid, rDay)) continue;
    const dd = deathsByVid[vid];
    if (dd != null && dd > rDay + 1) notes.push({ vid: vid, note: 'post-removal-death', removalDay: rDay, deathDay: dd });
    map[vid] = { vid: vid, day: rDay, how: 'unknown-bypass', source: 'bypass',
      name: s.name || null, deathDay: dd != null ? dd : null };
  }
  for (const vid of Object.keys(map)) {
    if (map[vid].source !== 'wrap') continue;
    const s = seen[vid];
    if (s && s.last != null) {
      const derivedDay = s.last + 1;
      if (Math.abs(derivedDay - map[vid].day) > 1) {
        notes.push({ vid: vid, note: 'wrap-derivation-day-mismatch', wrapDay: map[vid].day, derivedDay: derivedDay });
      }
    }
  }
  return { map: map, notes: notes };
}

// lingerForSeed(j): lingering plan entries / party refs 7+ days after
// each non-death removal. Entry rows: planCensus rows for the removed
// vid on days >= removalDay + 7 (the plan should have died at
// removal; the holder is alive-but-gone, so holderAlive reads true
// until a post-removal death). Party rows: planCensus rows for a
// LIVING holder whose party still names the removed vid on days >=
// removalDay + 7 — the deathcleanup slot definition, one count per
// census row.
function lingerForSeed(j) {
  const rm = removalMap(j);
  const census = j.planCensus || [];
  const perRemoval = [];
  let entryRows = 0, partyRows = 0;
  for (const vid of Object.keys(rm.map).sort()) {
    const r = rm.map[vid];
    const threshold = r.day + 7;
    const entries = census.filter(function (row) { return row.vid === vid && row.day >= threshold; });
    const party = census.filter(function (row) {
      return row.holderAlive === true && row.vid !== vid &&
        (row.party || []).indexOf(vid) !== -1 && row.day >= threshold;
    });
    entryRows += entries.length;
    partyRows += party.length;
    const lastEntry = entries.length ? entries[entries.length - 1] : null;
    perRemoval.push({ vid: vid, name: r.name, how: r.how, source: r.source, day: r.day,
      entryRows: entries.length, partyRows: party.length,
      firstEntryDay: entries.length ? entries[0].day : null,
      lastEntryDay: lastEntry ? lastEntry.day : null,
      lastStage: lastEntry ? lastEntry.stage : null,
      lastTarget: lastEntry ? lastEntry.target : null,
      lastParty: lastEntry ? lastEntry.party : null,
      deathDay: r.deathDay });
  }
  return { removals: perRemoval, entryRows: entryRows, partyRows: partyRows,
    notes: rm.notes, removalCount: perRemoval.length };
}

function firstRemovalDay(j) {
  const rm = removalMap(j);
  let first = null;
  for (const vid of Object.keys(rm.map)) {
    if (first == null || rm.map[vid].day < first) first = rm.map[vid].day;
  }
  return first;
}

// ignitionCheck: (a) no-plan seeds per leg (0 planCensus rows — the
// village's plan system never woke); (b) suspects — an armed seed
// whose control twin had no plan, where the armed leg's FIRST plan
// creation follows a removal in a village that had no plan before
// that removal (a cleanup that materialized the store would ignite
// exactly this way).
function ignitionCheck(controlFiles, armedFiles) {
  function perSeed(j) {
    const creates = j.v4creates || [];
    const firstCreate = creates.length ? Math.min.apply(null, creates.map(function (c) { return c.day; })) : null;
    return { seed: j.seed, everPlan: (j.planCensus || []).length > 0,
      firstCreate: firstCreate, creates: creates.length, censusRows: (j.planCensus || []).length };
  }
  const c = controlFiles.map(perSeed);
  const a = armedFiles.map(perSeed);
  const noPlanControl = c.filter(function (s) { return !s.everPlan; }).length;
  const noPlanArmed = a.filter(function (s) { return !s.everPlan; }).length;
  const suspects = [];
  for (const aj of armedFiles) {
    const cj = controlFiles.find(function (x) { return x.seed === aj.seed; });
    if (!cj) continue;
    const aInfo = perSeed(aj);
    const cInfo = perSeed(cj);
    if (!aInfo.everPlan || cInfo.everPlan) continue;
    const rm = removalMap(aj);
    for (const vid of Object.keys(rm.map)) {
      const rDay = rm.map[vid].day;
      if (aInfo.firstCreate == null || rDay >= aInfo.firstCreate) continue;
      const planlessBefore = !(aj.planCensus || []).some(function (row) { return row.day < rDay; }) &&
        !(aj.v4creates || []).some(function (row) { return row.day < rDay; });
      if (planlessBefore) {
        suspects.push({ seed: aj.seed, removalVid: vid, how: rm.map[vid].how,
          removalDay: rDay, firstCreateDay: aInfo.firstCreate });
      }
    }
  }
  return { noPlanControl: noPlanControl, noPlanArmed: noPlanArmed,
    dNoPlan: noPlanArmed - noPlanControl, suspects: suspects };
}

// Daily fingerprint (vetparty-drift-check, copied from the deathcleanup
// analyzer — its fp is module-internal there): waveKillLog, vets,
// roster dead flags, wave4Slain, ready4/ready5 readiness flags.
function fp(day) {
  const roster = (day.roster || []).map(function (r) { return r.vid + ':' + (r.dead ? 1 : 0); }).join(',');
  const wkl = (day.waveKillLog || []).map(function (e) { return (e.vid || e.killer || e.by || '?') + '@' + (e.w | 0) + ':' + (e.mid || e.id || '?'); }).join(',');
  return JSON.stringify({
    wkl: wkl,
    w4slain: day.wave4Slain,
    v3: (day.vetsW3 || {}).count, v4: (day.vetsW4 || {}).count,
    r4: day.ready4 && day.ready4.ready, r5: day.ready5 && day.ready5.ready,
    roster: roster,
  });
}
function driftSmoke(controlFiles, armedFiles) {
  const bySeed = {};
  for (const j of controlFiles) { bySeed[j.seed] = bySeed[j.seed] || {}; bySeed[j.seed].control = j; }
  for (const j of armedFiles) { bySeed[j.seed] = bySeed[j.seed] || {}; bySeed[j.seed].armed = j; }
  const perSeed = [];
  let drift = 0;
  for (const seed of Object.keys(bySeed).sort()) {
    const c = bySeed[seed].control, a = bySeed[seed].armed;
    if (!c || !a) { perSeed.push({ seed: Number(seed), firstLeverDay: null, firstDivDay: null, note: 'missing leg file' }); drift++; continue; }
    const fc = firstRemovalDay(c), fa = firstRemovalDay(a);
    const firstLeverDay = (fc != null && fa != null) ? Math.min(fc, fa) : (fc != null ? fc : fa);
    const cDays = (c.daily || []);
    const aDays = (a.daily || []);
    const aByDay = {};
    for (const d of aDays) aByDay[d.day] = d;
    let firstDivDay = null;
    for (const d of cDays) {
      const ad = aByDay[d.day];
      if (!ad) { firstDivDay = d.day; break; }
      if (fp(d) !== fp(ad)) { firstDivDay = d.day; break; }
    }
    const isDrift = firstDivDay != null && firstLeverDay != null && firstDivDay < firstLeverDay;
    if (isDrift) drift++;
    perSeed.push({ seed: Number(seed), firstLeverDay: firstLeverDay, firstDivDay: firstDivDay,
      drift: isDrift, note: firstDivDay == null ? 'IDENTICAL' : (isDrift ? 'DRIFT before lever day' : 'diverges on/after lever day') });
  }
  return { perSeed: perSeed, driftSeeds: drift };
}

function summarizeNondeath(files) {
  const perSeed = files.map(function (j) {
    const lg = lingerForSeed(j);
    const one = DEADPLAN.analyzeOne(j);
    return {
      seed: j.seed, gameDays: j.gameDays, endReason: j.endReason,
      standing: j.standing, scaleRank: j.scaleRank, won: !!j.won,
      maxWave: j.maxWave, deaths: (j.deaths || []).length,
      removals: (j.removals || []).length,
      removalCount: lg.removalCount,
      removalCleanups: removalCleanups(j),
      entryRows: lg.entryRows, partyRows: lg.partyRows,
      everPlan: (j.planCensus || []).length > 0,
      censusTotal: (j.planCensus || []).length,
      wave4Kills: one.wave4Kills, wave5Kills: one.wave5Kills,
      perRemoval: lg.perRemoval, notes: lg.notes,
    };
  });
  const totals = {
    removals: perSeed.reduce(function (a, s) { return a + s.removals; }, 0),
    removalCount: perSeed.reduce(function (a, s) { return a + s.removalCount; }, 0),
    removalCleanups: perSeed.reduce(function (a, s) { return a + s.removalCleanups; }, 0),
    entryRows: perSeed.reduce(function (a, s) { return a + s.entryRows; }, 0),
    partyRows: perSeed.reduce(function (a, s) { return a + s.partyRows; }, 0),
    deaths: perSeed.reduce(function (a, s) { return a + s.deaths; }, 0),
    wave4Kills: perSeed.reduce(function (a, s) { return a + s.wave4Kills; }, 0),
    wave5Kills: perSeed.reduce(function (a, s) { return a + s.wave5Kills; }, 0),
    medianSurvival: median(perSeed.map(function (s) { return s.gameDays; })),
    noPlanSeeds: perSeed.filter(function (s) { return !s.everPlan; }).length,
  };
  return { perSeed: perSeed, totals: totals };
}

if (require.main === module) (function () {
  const args = process.argv.slice(2);
  function arg(name) {
    const i = args.indexOf(name);
    return (i !== -1 && args[i + 1]) ? args[i + 1] : null;
  }
  const controlDir = arg('--control'), armedDir = arg('--armed'), outPath = arg('--out');
  if (!controlDir || !armedDir) {
    console.error('NONDEATHPLAN STOP: --control and --armed dirs required.');
    process.exit(2);
  }
  const controlFiles = DC.loadDir(controlDir);
  const armedFiles = DC.loadDir(armedDir);
  if (controlFiles.length !== 8 || armedFiles.length !== 8) {
    console.error('NONDEATHPLAN STOP: expected 8+8 files, got control=' + controlFiles.length + ' armed=' + armedFiles.length + '.');
    process.exit(2);
  }
  const controlDC = DC.summarize(controlFiles);
  const armedDC = DC.summarize(armedFiles);
  const control = summarizeNondeath(controlFiles);
  const armed = summarizeNondeath(armedFiles);
  const ign = ignitionCheck(controlFiles, armedFiles);
  const drift = driftSmoke(controlFiles, armedFiles);

  const bar1 = armed.totals.entryRows === 0 && armed.totals.partyRows === 0 && armed.totals.removalCleanups > 0;
  const bar2a = control.totals.entryRows > 0 || control.totals.partyRows > 0;
  const bar2b = Math.abs(ign.dNoPlan) <= 1 && ign.suspects.length === 0;
  const dDeaths = armed.totals.deaths - control.totals.deaths;
  const deathsCap = control.totals.deaths * 1.10;
  const dSurv = armed.totals.medianSurvival - control.totals.medianSurvival;
  const survFloor = control.totals.medianSurvival * 0.8;
  const dW4 = armed.totals.wave4Kills - control.totals.wave4Kills;
  const w4Ok = control.totals.wave4Kills === 0
    ? armed.totals.wave4Kills === 0
    : Math.abs(dW4) <= 0.20 * control.totals.wave4Kills;
  const bar3 = armed.totals.deaths <= deathsCap &&
    armed.totals.medianSurvival >= survFloor && w4Ok;
  const driftClean = drift.driftSeeds === 0;
  const report = {
    arm: 'nondeathplan-b',
    bars: {
      bar1_armedClean: bar1,
      bar1_detail: { entryRows: armed.totals.entryRows, partyRows: armed.totals.partyRows,
        removalCleanups: armed.totals.removalCleanups, removalCount: armed.totals.removalCount,
        wrapRemovals: armed.totals.removals },
      bar2a_controlReproduces: bar2a,
      bar2a_detail: { entryRows: control.totals.entryRows, partyRows: control.totals.partyRows,
        removalCount: control.totals.removalCount, wrapRemovals: control.totals.removals },
      bar2b_noIgnitionRegression: bar2b,
      bar2b_detail: ign,
      bar3_noRegression: bar3,
      bar3_detail: { dDeaths: dDeaths, deathsCap: deathsCap,
        controlDeaths: control.totals.deaths, armedDeaths: armed.totals.deaths,
        dMedianSurvival: dSurv, survFloor: survFloor,
        controlMedian: control.totals.medianSurvival, armedMedian: armed.totals.medianSurvival,
        dWave4Kills: dW4, controlWave4Kills: control.totals.wave4Kills,
        armedWave4Kills: armed.totals.wave4Kills, w4Ok: w4Ok },
      driftClean: driftClean,
    },
    control: { wall: controlDC.wall, totals: control.totals, perSeed: control.perSeed,
      deathLeg: { totals: controlDC.totals, classify: controlDC.classify } },
    armed: { wall: armedDC.wall, totals: armed.totals, perSeed: armed.perSeed,
      deathLeg: { totals: armedDC.totals, classify: armedDC.classify } },
    drift: drift,
  };
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  console.log('bar1 armed clean (entry 0, party 0, removalCleanups > 0): ' + bar1 +
    ' (entryRows=' + armed.totals.entryRows + ' partyRows=' + armed.totals.partyRows +
    ' removalCleanups=' + armed.totals.removalCleanups + ' removals=' + armed.totals.removalCount + ')');
  console.log('bar2a control reproduces defect: ' + bar2a +
    ' (entryRows=' + control.totals.entryRows + ' partyRows=' + control.totals.partyRows +
    ' removals=' + control.totals.removalCount + ')');
  console.log('bar2b no ignition regression: ' + bar2b +
    ' (noPlan control=' + ign.noPlanControl + ' armed=' + ign.noPlanArmed +
    ' suspects=' + ign.suspects.length + ')');
  console.log('bar3 no regression: ' + bar3 +
    ' (deaths ' + control.totals.deaths + ' -> ' + armed.totals.deaths + ' cap ' + deathsCap.toFixed(1) +
    '; median ' + control.totals.medianSurvival + ' -> ' + armed.totals.medianSurvival + ' floor ' + survFloor.toFixed(1) +
    '; w4 ' + control.totals.wave4Kills + ' -> ' + armed.totals.wave4Kills + ')');
  console.log('drift clean (no divergence before first non-death removal day): ' + driftClean);
  for (const s of drift.perSeed) {
    console.log('  seed ' + s.seed + ': firstLeverDay=' + s.firstLeverDay + ' firstDivDay=' + s.firstDivDay + ' -> ' + s.note);
  }
  console.log('wall CONTROL: ' + JSON.stringify(controlDC.wall));
  console.log('wall ARMED  : ' + JSON.stringify(armedDC.wall));
  const fail = !bar1 || !bar2a || !bar2b || !bar3 || !driftClean;
  if (fail) {
    console.log('ANALYZER FAIL: bar1=' + bar1 + ' bar2a=' + bar2a + ' bar2b=' + bar2b + ' bar3=' + bar3 + ' driftClean=' + driftClean);
    process.exitCode = 1;
  }
})();

module.exports = { loadDir: DC.loadDir, removalMap: removalMap, lingerForSeed: lingerForSeed,
  firstRemovalDay: firstRemovalDay, ignitionCheck: ignitionCheck, driftSmoke: driftSmoke,
  summarizeNondeath: summarizeNondeath, removalCleanups: removalCleanups };
