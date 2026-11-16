// analyze-vetreengage-a.js — analyzer + judge, arm sim-vetreengage-a.
// Reads the two vetreengage driver corpora (control / on), computes the
// judged table from the T-class snapshots (via the vetattrition
// analyzer's analyzeTFile — same classifier as the DIAG) plus this
// arm's own reads (vet5@unlock-after, field/TB kill split,
// conversion, starvation, WILD scholar deaths), and the mechanism
// decomposition from the v4 recorder rows. Implements the frozen
// GO bars from evidence/2026-11-16/sim-vetreengage-a-prereg.md.
// Usage: node scripts/analyze-vetreengage-a.js <controlDir> <onDir>
// Exits 0 with a JSON report on stdout; the verdict is in the JSON,
// not the exit code (a NO-GO is a result, not a crash).
'use strict';
const path = require('path');
const fs = require('fs');
const VA = require(path.join(__dirname, 'vetattrition-analyze-20261115'));

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  return files.map(function (f) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    d._file = f;
    return d;
  });
}
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(a) {
  if (!a.length) return null;
  return a.reduce(function (t, x) { return t + x; }, 0) / a.length;
}
function round(x, n) {
  if (x == null || !isFinite(x)) return x;
  const p = Math.pow(10, n == null ? 3 : n);
  return Math.round(x * p) / p;
}

// vet5 at the first snapshot AFTER the unlock day (prereg: the
// unlock-day snapshot can predate a mid-day second veteran —
// vetattrition §12). Falls back to the unlock-day snapshot when no
// later snapshot exists.
function vet5AtUnlockAfter(daily, unlockDay) {
  if (!daily || !daily.length || unlockDay == null) return null;
  const sorted = daily.slice().sort(function (a, b) { return a.day - b.day; });
  for (const s of sorted) {
    if (s.day > unlockDay) return s.vetsW4 ? (s.vetsW4.count || 0) : null;
  }
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].day <= unlockDay) return sorted[i].vetsW4 ? (sorted[i].vetsW4.count || 0) : null;
  }
  return null;
}

function analyzeSeed(d, monsters) {
  const t = VA.analyzeTFile(d, monsters);
  const daily = Array.isArray(d.daily) ? d.daily.slice().sort(function (a, b) { return a.day - b.day; }) : [];
  const finalLog = daily.length ? (daily[daily.length - 1].waveKillLog || []) : [];
  const w4 = finalLog.filter(function (e) { return e && (e.w | 0) === 4 && !e.pyrrhic; });
  const w4Field = w4.filter(function (e) { return e.via !== 'player'; });
  const w4TB = w4.filter(function (e) { return e.via === 'player'; });
  const w3Killers = {};
  const w4Killers = {};
  finalLog.forEach(function (e) {
    if (!e || !e.by) return;
    if ((e.w | 0) === 3) w3Killers[e.by] = true;
    if ((e.w | 0) === 4) w4Killers[e.by] = true;
  });
  let conversions = 0;
  Object.keys(w3Killers).forEach(function (vid) { if (w4Killers[vid]) conversions += 1; });
  const w3Made = Object.keys(w3Killers).length;
  // Starvation: sweep deaths with a hunger cause (starvation / thirst /
  // dehydration), any kind. WILD scholar deaths: sweep deaths player +
  // cause 'the wild'.
  const sweepDeaths = Array.isArray(d.deaths) ? d.deaths : [];
  let starvation = 0, wildScholar = 0;
  sweepDeaths.forEach(function (x) {
    if (!x) return;
    if (x.cause === 'starvation' || x.cause === 'thirst' || x.cause === 'dehydration') starvation += 1;
    if (x.player && x.cause === 'the wild') wildScholar += 1;
  });
  const survived = !d.villageLost && (d.days >= 150 || d.endReason === 'survived' || (d.gameDays || 0) >= 150);
  const standing = (typeof d.standing === 'number') ? d.standing : null;
  // Recorder decomposition.
  const seeds = Array.isArray(d.v4seeds) ? d.v4seeds : [];
  const departs = Array.isArray(d.v4departs) ? d.v4departs : [];
  const gates = Array.isArray(d.v4gates) ? d.v4gates : [];
  const encs = Array.isArray(d.v4encounters) ? d.v4encounters : [];
  const w4Seeds = seeds.filter(function (s) { return s.wave === 4; });
  const launches = departs.filter(function (x) { return x.result === 'launch'; });
  const launchBySize = { 1: 0, 2: 0, 3: 0, other: 0 };
  launches.forEach(function (x) {
    const n = x.partySize | 0;
    if (n === 1) launchBySize[1] += 1;
    else if (n === 2) launchBySize[2] += 1;
    else if (n === 3) launchBySize[3] += 1;
    else launchBySize.other += 1;
  });
  const w4TargetLaunches = launches.filter(function (x) { return (x.targetWave === 4); });
  const w4TargetLaunchBySize = { 1: 0, 2: 0, 3: 0, other: 0 };
  w4TargetLaunches.forEach(function (x) {
    const n = x.partySize | 0;
    if (n === 1) w4TargetLaunchBySize[1] += 1;
    else if (n === 2) w4TargetLaunchBySize[2] += 1;
    else if (n === 3) w4TargetLaunchBySize[3] += 1;
    else w4TargetLaunchBySize.other += 1;
  });
  const gateByResult = {};
  gates.forEach(function (g) { gateByResult[g.result || 'null'] = (gateByResult[g.result || 'null'] || 0) + 1; });
  const gateByReason = {};
  gates.forEach(function (g) { if (g.reason) gateByReason[g.reason] = (gateByReason[g.reason] || 0) + 1; });
  const seeks = gates.filter(function (g) { return g.result === 'seek'; }).length;
  const avoidsOutmatched = gates.filter(function (g) { return g.result === 'avoid' && g.reason === 'outmatched'; }).length;
  const trickHolds = gates.filter(function (g) { return g.result === 'null' && g.trickKnown === false && g.planStage && (g.planStage === 'hunt' || g.planStage === 'standing'); }).length;
  const countedRows = gates.filter(function (g) { return (g.countedSize | 0) > 0; }).length;
  const encByOutcome = {};
  encs.forEach(function (e) { encByOutcome[e.outcome || 'null'] = (encByOutcome[e.outcome || 'null'] || 0) + 1; });
  const encKills = encs.filter(function (e) { return e.outcome === 'vKill'; }).length;
  const encFlees = encs.filter(function (e) { return e.outcome === 'vFlee'; }).length;
  const encDeaths = encs.filter(function (e) { return e.outcome === 'vDie'; }).length;
  const encWithGateSeek = encs.filter(function (e) { return e.gate && e.gate.result === 'seek'; }).length;
  const launchedWithKiller = launches.filter(function (x) { return (x.partyKillers | 0) > 0; }).length;
  return {
    seed: d.seed, file: d._file,
    errors: (t.errors || []).concat(Array.isArray(d.instrumentErrors) && d.instrumentErrors.length ? ['instrumentErrors:' + d.instrumentErrors.length] : []),
    days: d.days, gameDays: d.gameDays, endReason: d.endReason,
    survived: survived, villageLost: !!d.villageLost,
    maxWave: d.maxWave, standing: standing,
    unlocked: t.unlocked, unlockDay: t.unlockDay,
    derivedUnlockDay: t.derivedUnlockDay, unlockLag: t.unlockLag,
    vet5AtUnlock: t.vet5AtUnlock, vet5AtUnlockAfter: vet5AtUnlockAfter(daily, t.unlockDay),
    vet5AtEnd: t.vet5AtEnd, vet4AtEnd: t.vet4AtEnd,
    exitsTotal: t.exitsTotal, classified: t.classified, unclassified: t.unclassified,
    classCounts: t.classCounts, exits: t.exits, bornDead: t.bornDead,
    w4Kills: w4.length, w4KillsField: w4Field.length, w4KillsTB: w4TB.length,
    w5Kills: t.w5Kills,
    w3Made: w3Made, conversions: conversions,
    starvation: starvation, wildScholar: wildScholar,
    ready5End: d.ready5 || null,
    // Recorder.
    v4seeds: seeds.length, v4seedsW4: w4Seeds.length,
    v4departs: departs.length, launches: launches.length, launchBySize: launchBySize,
    w4TargetLaunches: w4TargetLaunches.length, w4TargetLaunchBySize: w4TargetLaunchBySize,
    launchedWithKiller: launchedWithKiller,
    v4gates: gates.length, gateByResult: gateByResult, gateByReason: gateByReason,
    seeks: seeks, avoidsOutmatched: avoidsOutmatched, trickHolds: trickHolds,
    countedRows: countedRows,
    v4encounters: encs.length, encByOutcome: encByOutcome,
    encKills: encKills, encFlees: encFlees, encDeaths: encDeaths,
    encWithGateSeek: encWithGateSeek,
    winPlanStats: d.winPlanStats || null,
  };
}

function poolLeg(seeds) {
  const unlocked = seeds.filter(function (s) { return s.unlocked; });
  const vet5EndU = unlocked.map(function (s) { return s.vet5AtEnd; }).filter(function (x) { return x != null; });
  const survivedN = seeds.filter(function (s) { return s.survived; }).length;
  const starvation = seeds.reduce(function (t, s) { return t + s.starvation; }, 0);
  const w4Field = seeds.reduce(function (t, s) { return t + s.w4KillsField; }, 0);
  const w4TB = seeds.reduce(function (t, s) { return t + s.w4KillsTB; }, 0);
  const w4 = seeds.reduce(function (t, s) { return t + s.w4Kills; }, 0);
  const conv = seeds.reduce(function (t, s) { return t + s.conversions; }, 0);
  const w3Made = seeds.reduce(function (t, s) { return t + s.w3Made; }, 0);
  const wildScholar = seeds.reduce(function (t, s) { return t + s.wildScholar; }, 0);
  const exits = seeds.reduce(function (t, s) { return t + s.exitsTotal; }, 0);
  const classCounts = {};
  seeds.forEach(function (s) {
    Object.keys(s.classCounts || {}).forEach(function (k) { classCounts[k] = (classCounts[k] || 0) + s.classCounts[k]; });
  });
  const stats = { planSeeds: 0, partyDepartures: 0, partyWaits: 0, partyInvites: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, trickHolds: 0, veteranGuardHolds: 0, partyFights: 0, gearHolds: 0, stageAdvances: 0 };
  seeds.forEach(function (s) {
    const w = s.winPlanStats || {};
    Object.keys(stats).forEach(function (k) { stats[k] += (w[k] | 0); });
  });
  return {
    n: seeds.length, unlocked: unlocked.length,
    survived: survivedN, starvation: starvation,
    meanVet5EndUnlocked: mean(vet5EndU), vet5EndUnlocked: vet5EndU,
    vet5EndDist: (function () { const d = {}; unlocked.forEach(function (s) { const v = s.vet5AtEnd; d[v] = (d[v] || 0) + 1; }); return d; })(),
    w4Kills: w4, w4KillsField: w4Field, w4KillsTB: w4TB,
    w4KillsPerSeed: round(w4 / Math.max(1, seeds.length), 3),
    w4FieldPerSeed: round(w4Field / Math.max(1, seeds.length), 3),
    conversions: conv, w3Made: w3Made,
    conversionRate: w3Made ? round(conv / w3Made, 3) : null,
    wildScholar: wildScholar, exits: exits, classCounts: classCounts,
    seedsW4: seeds.reduce(function (t, s) { return t + s.v4seedsW4; }, 0),
    departs: seeds.reduce(function (t, s) { return t + s.v4departs; }, 0),
    launches: seeds.reduce(function (t, s) { return t + s.launches; }, 0),
    launchBySize: (function () { const o = { 1: 0, 2: 0, 3: 0, other: 0 }; seeds.forEach(function (s) { Object.keys(o).forEach(function (k) { o[k] += (s.launchBySize[k] || 0); }); }); return o; })(),
    w4TargetLaunches: seeds.reduce(function (t, s) { return t + s.w4TargetLaunches; }, 0),
    w4TargetLaunchBySize: (function () { const o = { 1: 0, 2: 0, 3: 0, other: 0 }; seeds.forEach(function (s) { Object.keys(o).forEach(function (k) { o[k] += (s.w4TargetLaunchBySize[k] || 0); }); }); return o; })(),
    launchedWithKiller: seeds.reduce(function (t, s) { return t + s.launchedWithKiller; }, 0),
    gates: seeds.reduce(function (t, s) { return t + s.v4gates; }, 0),
    seeks: seeds.reduce(function (t, s) { return t + s.seeks; }, 0),
    avoidsOutmatched: seeds.reduce(function (t, s) { return t + s.avoidsOutmatched; }, 0),
    trickHolds: seeds.reduce(function (t, s) { return t + s.trickHolds; }, 0),
    countedRows: seeds.reduce(function (t, s) { return t + s.countedRows; }, 0),
    encounters: seeds.reduce(function (t, s) { return t + s.v4encounters; }, 0),
    encKills: seeds.reduce(function (t, s) { return t + s.encKills; }, 0),
    encFlees: seeds.reduce(function (t, s) { return t + s.encFlees; }, 0),
    encDeaths: seeds.reduce(function (t, s) { return t + s.encDeaths; }, 0),
    encWithGateSeek: seeds.reduce(function (t, s) { return t + s.encWithGateSeek; }, 0),
    winPlanStats: stats,
    medianSurvival: med(seeds.map(function (s) { return s.gameDays || s.days || 0; })),
    wall: {
      national: seeds.filter(function (s) { return (s.standing || 0) >= 200; }).length,
      table: 0, wins: seeds.filter(function (s) { return !!s.won; }).length,
      wave4: seeds.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
      wave5: seeds.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
    },
  };
}

function judge(control, armed) {
  const bars = [];
  const mA = armed.meanVet5EndUnlocked;
  const mC = control.meanVet5EndUnlocked;
  const ratio = (mA != null && mC != null && mC > 0) ? mA / mC : (mA != null && mC === 0 ? (mA > 0 ? Infinity : 0) : null);
  // Epsilon: 1.2/0.8 divides to 1.4999999999999998 in float; the bar is 1.5x.
  const b1 = (mA != null && mA >= 1.0 && ratio != null && ratio + 1e-9 >= 1.5);
  bars.push({ id: 1, name: 'mean vet5@end among unlocked, armed >= 1.0 AND >= 1.5x control',
    control: mC, armed: mA, ratio: ratio == null ? null : round(ratio, 3), pass: b1 });
  const b2 = armed.survived >= control.survived - 1;
  bars.push({ id: 2, name: 'survival guardrail: survived/8 armed >= survived/8 control - 1',
    control: control.survived, armed: armed.survived, pass: b2 });
  const b3 = armed.starvation <= control.starvation + 2;
  // VETREENGAGE prereg: bar 3 is REPORTED, not judged (the §9 frozen GO
  // is bars 1+2 only). A GO with a starvation breach is reported as a
  // caveat in the evidence, never re-scored.
  bars.push({ id: 3, name: 'cost watch (reported, not judged): starvation armed <= control + 2',
    control: control.starvation, armed: armed.starvation, pass: b3, judged: false });
  const go = b1 && b2;
  return { verdict: go ? 'GO' : 'NO-GO', bars: bars };
}

function analyze(controlDir, onDir) {
  const monsters = VA.loadMonsterWaves(path.join(__dirname, '..', 'src', 'data', 'monsters.json'));
  const controlSeeds = loadDir(controlDir).map(function (d) { return analyzeSeed(d, monsters); });
  const onSeeds = loadDir(onDir).map(function (d) { return analyzeSeed(d, monsters); });
  const control = poolLeg(controlSeeds);
  const armed = poolLeg(onSeeds);
  const j = judge(control, armed);
  return { controlDir: controlDir, onDir: onDir, controlSeeds: controlSeeds, onSeeds: onSeeds, control: control, armed: armed, judge: j };
}

if (require.main === module) {
  const controlDir = process.argv[2];
  const onDir = process.argv[3];
  if (!controlDir || !onDir) { console.error('usage: node scripts/analyze-vetreengage-a.js <controlDir> <onDir>'); process.exit(2); }
  const out = analyze(controlDir, onDir);
  console.log(JSON.stringify(out, null, 2));
}

module.exports = { analyze: analyze, analyzeSeed: analyzeSeed, poolLeg: poolLeg, judge: judge, vet5AtUnlockAfter: vet5AtUnlockAfter };
