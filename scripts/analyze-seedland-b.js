// analyze-seedland-b.js — judgment for arm sim-seedland-b (BUILD:
// land the vetparty seed call on top of the gate fix, judged on the
// frozen bars in evidence/2026-11-16/sim-seedland-b-prereg.md).
// Requires scripts/analyze-seedpaths-b.js (instances, launches,
// wall, median) and isStarvation from
// scripts/analyze-gatereach2-b.js. It does not copy the seedpaths
// driver or analyzer.
// Frozen definitions (prereg): a launched-party wave-4+ meeting is
// a v4encounters row with wave >= 4, origin `expedition`, whose vid
// is the launched instance's holder or its resolved companion,
// whose mid equals the instance's target, and whose day falls in
// [launchDay, closeDay || finalDay]. Distinct meetings keyed
// seed|vid|day|mid. Bar 1 kills = distinct meetings with outcome
// vKill. Bar 2 kill:death = kills / distinct vDie meetings (zero
// denominator with kills >= 1 passes, value null). Bar 3 wave-5
// classes per seed (unlocked = maxWave >= 5; faced = >= 1 wave-5
// encounter row; killed = >= 1 wave-5 kill in killCalls);
// FACED-NOT-KILLED / unlocked <= 0.20, null (0 unlocked) FAILS.
// Bar 4 cost: starvation <= control + 2 AND median survival >=
// 0.8x control. Death-log 'villager combat' rows are the killed
// beasts' own records: reported as a secondary only, never in a bar.
// Usage:
//   node scripts/analyze-seedland-b.js <controlDir> <onDir>
// Writes evidence/2026-11-16/seedland-b-analysis.json. Exits 0 iff
// the instrument is valid on BOTH legs (8/8 files parse, 0
// instrument errors, attribution coverage >= 0.90 per leg) AND all
// four frozen bars pass on the on-leg (GO); otherwise exits 1 with
// the judgment printed (NO-GO is a verdict, not a crash — the
// evidence file still writes).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDPATHS = require(path.join(REPO, 'scripts', 'analyze-seedpaths-b.js'));
const GATEREACH2 = require(path.join(REPO, 'scripts', 'analyze-gatereach2-b.js'));
const isStarvation = GATEREACH2.isStarvation;

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const W4_SET = new Set(W4_IDS_FROZEN);
const W5_IDS_FROZEN = ['cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'nielsen', 'finale', 'network_note'];
function loadWave5Ids() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return (m.wave | 0) === 5; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W5_IDS_FROZEN.slice().sort(); }
}
const W5_SET = new Set(loadWave5Ids());

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  const parseErrors = [];
  for (const f of files) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      out[j.seed] = j;
    } catch (e) { parseErrors.push(f + ': ' + String(e.message).slice(0, 120)); }
  }
  return { bySeed: out, files: files, parseErrors: parseErrors };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function meetingKey(seed, vid, day, mid) { return seed + '|' + vid + '|' + day + '|' + mid; }

// analyzeSeedlandSeed(j): the four bars' per-seed inputs from one
// classified per-seed corpus (classifySeedPaths output). Launched
// instances come from the seedpaths classification (bucket
// 'launched'); launch day / companion from the resolved entry;
// close day from the instance (null = still open at final day).
function analyzeSeedlandSeed(j) {
  const finalDay = j.gameDays || j.days || 0;
  const instances = (j.instances || []).slice();
  const launched = instances.filter(function (i) { return i.bucket === 'launched'; });
  const encounters = (j.v4encounters || []).slice();
  const killCalls = (j.killCalls || []).slice();
  const killKeys = {};
  const deathKeys = {};
  const killRows = [];
  const deathRows = [];
  const vcDeaths = [];
  const windowExcluded = [];
  const originCounts = {};
  const originUnclassifiedRows = [];
  for (const e of encounters) {
    const o = e.origin || 'missing-origin';
    originCounts[o] = (originCounts[o] || 0) + 1;
    if (o === 'unclassified' || (typeof o === 'string' && o.indexOf('other:') === 0)) {
      originUnclassifiedRows.push({ day: e.day, vid: e.vid, mid: e.mid, wave: e.wave, origin: o, outcome: e.outcome || null });
    }
  }
  const launchWindows = [];
  for (const inst of launched) {
    const res = (inst.resolved || []).find(function (r) { return r.outcome === 'launched'; });
    if (!res) continue;
    const launchDay = res.day;
    const companion = res.companion || null;
    const closeDay = inst.closeDay == null ? finalDay : inst.closeDay;
    launchWindows.push({ vid: inst.vid, target: inst.target, seedDay: inst.seedDay,
      launchDay: launchDay, companion: companion, closeDay: closeDay,
      closeKind: inst.closeKind || null, instanceStillOpen: inst.closeDay == null });
    const party = [inst.vid];
    if (companion) party.push(companion);
    for (const e of encounters) {
      if ((e.wave | 0) < 4) continue;
      if (e.mid !== inst.target) continue;
      if (party.indexOf(e.vid) === -1) continue;
      if (e.origin !== 'expedition') continue;
      if (e.day < launchDay || e.day > closeDay) {
        windowExcluded.push({ day: e.day, vid: e.vid, mid: e.mid, wave: e.wave, origin: e.origin || null,
          outcome: e.outcome || null, launchDay: launchDay, closeDay: closeDay, holder: inst.vid });
        continue;
      }
      const k = meetingKey(j.seed, e.vid, e.day, e.mid);
      if (e.outcome === 'vKill') {
        if (!killKeys[k]) {
          killKeys[k] = true;
          killRows.push({ seed: j.seed, day: e.day, vid: e.vid, mid: e.mid, wave: e.wave,
            holder: inst.vid, companion: companion, launchDay: launchDay });
        }
      } else if (e.outcome === 'vDie') {
        if (!deathKeys[k]) {
          deathKeys[k] = true;
          deathRows.push({ seed: j.seed, day: e.day, vid: e.vid, mid: e.mid, wave: e.wave,
            holder: inst.vid, companion: companion, launchDay: launchDay });
        }
      }
    }
  }
  // vcDeaths secondary (Correction C1): death-log rows kind
  // 'monster', cause 'villager combat', naming a wave-4+ beast, on
  // the same day as one of this seed's launched-party kills.
  for (const dd of (j.deaths || [])) {
    if (dd.kind !== 'monster' || dd.cause !== 'villager combat') continue;
    if (!W4_SET.has(dd.who) && !W5_SET.has(dd.who)) continue;
    if (killRows.some(function (kb) { return kb.day === dd.day && kb.mid === dd.who; })) {
      vcDeaths.push({ day: dd.day, who: dd.who });
    }
  }
  // Wave-5 classes (frozen adaptation: unlock = maxWave >= 5; the
  // corpora carry no deed series or unlock events).
  const unlocked = (j.maxWave || 0) >= 5;
  const facedW5 = encounters.some(function (e) { return (e.wave | 0) === 5; });
  const killedW5 = killCalls.some(function (k) { return (k.wave | 0) === 5; });
  const w5class = !unlocked ? 'LOCKED' : (!facedW5 ? 'NEVER-FACED' : (!killedW5 ? 'FACED-NOT-KILLED' : 'KILLED'));
  const starvation = (j.deaths || []).filter(isStarvation).length;
  // First world-tick seed day (from the seedpaths classification).
  let firstWorldTickDay = null;
  for (const s of (j.v4seeds || [])) {
    if (s.path === 'world-tick' && (firstWorldTickDay == null || s.day < firstWorldTickDay)) firstWorldTickDay = s.day;
  }
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    instancesOpened: (j.instances || []).length,
    attributionCoverage: j.attributionCoverage,
    launchedInstances: launched.length,
    launchWindows: launchWindows,
    launchedKills: killRows.length, launchedKillsRows: killRows,
    launchedDeaths: deathRows.length, launchedDeathsRows: deathRows,
    vcDeathsSecondary: vcDeaths.length, vcDeathsRows: vcDeaths,
    windowExcludedMeetings: windowExcluded,
    originCounts: originCounts,
    originUnclassifiedRows: originUnclassifiedRows,
    w5class: w5class, w5unlocked: unlocked, w5faced: facedW5, w5killed: killedW5,
    starvation: starvation,
    instrumentErrors: (j.instrumentErrors || []).length,
    firstWorldTickDay: firstWorldTickDay,
  };
}

// firstDivergenceDay(controlJ, onJ): first day whose daily snapshot
// differs between the two legs (same seed, identical seeds/policy/
// horizon/driver — the ONLY difference is the 13-line seed call, so
// the legs must agree until the first world-tick seed fires). Null
// when the legs never diverge in the recorded horizon.
function firstDivergenceDay(controlJ, onJ) {
  try {
    const cDaily = (controlJ.daily || []).slice();
    const oDaily = (onJ.daily || []).slice();
    const n = Math.max(cDaily.length, oDaily.length);
    for (let i = 0; i < n; i++) {
      const c = cDaily[i] || null;
      const o = oDaily[i] || null;
      if (JSON.stringify(c) !== JSON.stringify(o)) {
        const day = (c && c.day != null) ? c.day : ((o && o.day != null) ? o.day : i);
        return day;
      }
    }
    return null;
  } catch (e) { return 'error:' + String(e.message).slice(0, 80); }
}

function analyzeSeedlandLeg(dir) {
  const leg = loadDir(dir);
  for (const k of Object.keys(leg.bySeed)) {
    const classified = SEEDPATHS.classifySeedPaths(leg.bySeed[k]);
    leg.bySeed[k] = Object.assign({}, leg.bySeed[k], classified);
  }
  const summary = SEEDPATHS.summarizeSeedPaths(leg);
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const perSeed = seeds.map(analyzeSeedlandSeed);
  const kills = perSeed.reduce(function (a, s) { return a + s.launchedKills; }, 0);
  const deaths = perSeed.reduce(function (a, s) { return a + s.launchedDeaths; }, 0);
  const vcDeaths = perSeed.reduce(function (a, s) { return a + s.vcDeathsSecondary; }, 0);
  const starvation = perSeed.reduce(function (a, s) { return a + s.starvation; }, 0);
  const medianSurvival = med(perSeed.map(function (s) { return s.gameDays || s.days || 0; }));
  const unlockedSeeds = perSeed.filter(function (s) { return s.w5unlocked; });
  const fnk = unlockedSeeds.filter(function (s) { return s.w5class === 'FACED-NOT-KILLED'; }).length;
  const facedNotKilledShare = unlockedSeeds.length ? +(fnk / unlockedSeeds.length).toFixed(2) : null;
  const killDeath = deaths === 0 ? null : +(kills / deaths).toFixed(2);
  const errors = perSeed.reduce(function (a, s) { return a + s.instrumentErrors; }, 0);
  const originCounts = {};
  let originUnclassified = 0;
  for (const s of perSeed) {
    for (const k of Object.keys(s.originCounts)) originCounts[k] = (originCounts[k] || 0) + s.originCounts[k];
    originUnclassified += s.originUnclassifiedRows.length;
  }
  return {
    dir: path.basename(dir),
    files: leg.files.length, parseErrors: leg.parseErrors,
    seeds: perSeed.length,
    summary: summary,
    perSeed: perSeed,
    launchedKills: kills, launchedDeaths: deaths, killDeath: killDeath,
    vcDeathsSecondary: vcDeaths,
    facedNotKilledShare: facedNotKilledShare,
    facedNotKilled: fnk, w5unlocked: unlockedSeeds.length,
    w5classes: perSeed.map(function (s) { return { seed: s.seed, cls: s.w5class }; }),
    starvation: starvation, medianSurvival: medianSurvival,
    instrumentErrors: errors,
    attributionCoverage: summary.attributionCoverage,
    instancesOpened: summary.instancesOpened,
    wall: summary.wall,
    originCounts: originCounts,
    originUnclassifiedRows: originUnclassified,
    windowExcludedMeetings: perSeed.reduce(function (a, s) { return a + s.windowExcludedMeetings.length; }, 0),
  };
}

function judgeSeedland(control, on) {
  const b1v = on.launchedKills;
  const b1 = b1v >= 1;
  let b2v = on.killDeath;
  let b2;
  if (b1v >= 1 && on.launchedDeaths === 0) { b2 = true; b2v = null; }
  else b2 = b2v !== null && b2v >= 0.92;
  const b3v = on.facedNotKilledShare;
  const b3 = b3v !== null && b3v <= 0.20;
  const b4starv = on.starvation <= control.starvation + 2;
  const b4surv = on.medianSurvival != null && control.medianSurvival != null &&
    on.medianSurvival >= 0.8 * control.medianSurvival;
  const b4 = b4starv && b4surv;
  const inst = control.instrumentErrors === 0 && on.instrumentErrors === 0 &&
    control.files === 8 && on.files === 8 &&
    control.parseErrors.length === 0 && on.parseErrors.length === 0 &&
    control.seeds === 8 && on.seeds === 8 &&
    (control.attributionCoverage == null || control.attributionCoverage >= 0.90) &&
    (on.attributionCoverage == null || on.attributionCoverage >= 0.90);
  const go = b1 && b2 && b3 && b4 && inst;
  return {
    launchedPartyKills: { value: b1v, bar: '>= 1 on the 8-seed on-leg', pass: b1 },
    killDeath: { value: b2v, kills: b1v, deaths: on.launchedDeaths, vcDeathsSecondary: on.vcDeathsSecondary,
      bar: '>= 0.92 (zero denominator with kills >= 1 passes)', pass: b2 },
    facedNotKilledShare: { value: b3v, facedNotKilled: on.facedNotKilled, unlocked: on.w5unlocked,
      classes: on.w5classes, bar: '<= 0.20 (null = 0 unlocked, FAILS)', pass: b3 },
    costs: { starvation: { value: on.starvation, control: control.starvation, bar: '<= control + 2', pass: b4starv },
      medianSurvival: { value: on.medianSurvival, control: control.medianSurvival, bar: '>= 0.8x control', pass: b4surv },
      pass: b4 },
    instrument: { controlErrors: control.instrumentErrors, onErrors: on.instrumentErrors,
      controlFiles: control.files, onFiles: on.files,
      controlParseErrors: control.parseErrors, onParseErrors: on.parseErrors,
      controlCoverage: control.attributionCoverage, onCoverage: on.attributionCoverage,
      controlInstances: control.instancesOpened, onInstances: on.instancesOpened,
      pass: inst },
    verdict: go ? 'GO' : 'NO-GO',
  };
}

function main() {
  const controlDir = process.argv[2];
  const onDir = process.argv[3];
  if (!controlDir || !onDir) { console.error('SEEDLAND ANALYZE STOP: controlDir and onDir required.'); process.exit(2); }
  const control = analyzeSeedlandLeg(controlDir);
  const on = analyzeSeedlandLeg(onDir);
  // D3 drift smoke: first divergence day vs first world-tick seed
  // day per seed (control vs on corpora, same seed).
  const d3 = [];
  const controlRaw = loadDir(controlDir).bySeed;
  const onRaw = loadDir(onDir).bySeed;
  for (const cps of control.perSeed) {
    const ops = on.perSeed.find(function (s) { return s.seed === cps.seed; });
    if (!ops) continue;
    const cRaw = controlRaw[cps.seed];
    const oRaw = onRaw[ops.seed];
    const div = firstDivergenceDay(cRaw, oRaw);
    d3.push({ seed: cps.seed,
      firstDivergenceDay: div,
      firstWorldTickDayControl: cps.firstWorldTickDay,
      firstWorldTickDayOn: ops.firstWorldTickDay,
      // Smoke flag: the legs must not diverge BEFORE the first
      // world-tick seed fires on the on-leg (the seed call is the
      // only difference between legs).
      divergesBeforeFirstSeed: (typeof div === 'number' && ops.firstWorldTickDay != null) ? div < ops.firstWorldTickDay : null });
  }
  const judgment = judgeSeedland(control, on);
  const out = {
    arm: 'seedland-b', run: 'seedland-b',
    controlDir: path.basename(controlDir), onDir: path.basename(onDir),
    control: control, on: on,
    d3: d3,
    judgment: judgment,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'seedland-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  function printLeg(name, leg) {
    console.log('=== seedland-b ' + name + ' leg ===');
    console.log('seeds: ' + leg.seeds + '  files: ' + leg.files +
      '  instancesOpened: ' + leg.instancesOpened + '  coverage: ' + leg.attributionCoverage +
      '  errors: ' + leg.instrumentErrors);
    console.log('launchedKills: ' + leg.launchedKills + '  launchedDeaths: ' + leg.launchedDeaths +
      '  killDeath: ' + leg.killDeath + '  vcDeathsSecondary: ' + leg.vcDeathsSecondary);
    console.log('facedNotKilledShare: ' + leg.facedNotKilledShare +
      ' (' + leg.facedNotKilled + '/' + leg.w5unlocked + ' unlocked)  classes: ' + JSON.stringify(leg.w5classes));
    console.log('starvation: ' + leg.starvation + '  medianSurvival: ' + leg.medianSurvival);
    console.log('wall: ' + JSON.stringify(leg.wall));
    console.log('originCounts: ' + JSON.stringify(leg.originCounts) +
      '  unclassified/other rows: ' + leg.originUnclassifiedRows +
      '  window-excluded meetings: ' + leg.windowExcludedMeetings);
  }
  printLeg('control', control);
  printLeg('on', on);
  console.log('=== D3 drift smoke (first divergence day vs first world-tick seed day) ===');
  for (const r of d3) {
    console.log('seed ' + r.seed + ': divergence day ' + r.firstDivergenceDay +
      '  first world-tick seed (control/on) ' + r.firstWorldTickDayControl + '/' + r.firstWorldTickDayOn +
      '  divergesBeforeFirstSeed: ' + r.divergesBeforeFirstSeed);
  }
  console.log('judgment: ' + JSON.stringify(judgment, null, 2));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (judgment.verdict !== 'GO') process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { analyzeSeedlandSeed: analyzeSeedlandSeed, analyzeSeedlandLeg: analyzeSeedlandLeg,
  judgeSeedland: judgeSeedland, firstDivergenceDay: firstDivergenceDay, meetingKey: meetingKey };
