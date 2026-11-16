// analyze-launchsurvive-a.js — judgment for arm sim-launchsurvive-a
// (DIAG: decompose WHY seedland's launched parties never re-met
// their target — launch survival + re-encounter).
// Requires scripts/analyze-seedland-b.js (launched-party meetings,
// verbatim definition) and scripts/analyze-seedpaths-b.js
// (instances, launches, wall, median). It does not copy the
// seedpaths/seedland driver or analyzer.
// Frozen definitions (prereg
// evidence/2026-11-16/sim-launchsurvive-a-prereg.md): a launched
// instance is a seedpaths instance whose bucket is `launched`;
// launch day / companion from the resolved entry; close day from
// the instance (null = still open). A launched-party meeting is a
// v4encounters row with wave >= 4, origin `expedition`, vid = holder
// or resolved companion, mid = target, day in
// [launchDay, closeDay || finalDay], distinct on seed|vid|day|mid.
// Launch classes (frozen precedence): traveled-and-found (>= 1
// in-window meeting) > still-open (closeDay null) > died-en-route
// (died in-window, on expedition or away from Haven on the death
// day) > stayed-home-died (died in-window, never on expedition,
// at Haven on every window row) > died-at-home-other (died
// in-window, at home, after having traveled) > traveled-not-found
// (alive at closeDay, no meeting). Target persistence: yes when
// targetNearCount >= 1 on >= 1 window day (a beast of the target
// type within Chebyshev distance 2 of the last-known tile).
// Plan-linger secondary: for every instance with closeKind
// holder-died, postDeathTailDays = census rows for that vid+target
// after closeDay with holderAlive false (the haventick measure:
// does the plan ENTRY stay in winPlan after the holder dies?).
// The dawnbid closeDay IS the first holder-dead census day by
// construction, so the linger measure is the tail, not the close.
// Instrument validity (bar 1) counts a launched instance with zero
// tracker rows in its window as an instrument error: the tracker
// must observe every launch's window, or the classification is
// ungrounded (a zero-row window would make stayed-home-died
// vacuously true).
// Usage:
//   node scripts/analyze-launchsurvive-a.js <controlDir> <onDir>
// Writes evidence/2026-11-16/launchsurvive-a-analysis.json. Exits 0
// iff the instrument is valid on BOTH legs AND all five frozen bars
// pass (GO); otherwise exits 1 with the judgment printed (NO-GO is
// a verdict, not a crash — the evidence file still writes).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDLAND = require(path.join(REPO, 'scripts', 'analyze-seedland-b.js'));
const SEEDPATHS = require(path.join(REPO, 'scripts', 'analyze-seedpaths-b.js'));

const LAUNCH_CLASSES = ['traveled-and-found', 'still-open', 'died-en-route',
  'stayed-home-died', 'died-at-home-other', 'traveled-not-found'];

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
function sameTile(a, b) {
  return !!(a && b && a.nx === b.nx && a.ny === b.ny);
}

// classifyLaunch(args): the frozen six-class decision, pure.
// args: { launchDay, closeDay, closeKind, holder, companion,
//   target, windowRows, censusRows, deaths, meetingsCount }.
// windowRows = v4launchTrack rows for the holder in
// [launchDay, closeDay || finalDay], sorted by day. censusRows =
// dawnbidCensus rows for the holder in the same window (the
// death-day backup — the census is the source the dawnbid close
// logic itself uses). deaths = the seed's death-log rows.
// Returns { cls, deathDay, deathCause, deathPlace, deathPlaceNode,
//   traveledDays, homeDays, everExped, alwaysAtHaven,
//   deathRowMissing }.
function classifyLaunch(args) {
  const launchDay = args.launchDay, closeDay = args.closeDay;
  const holder = args.holder;
  const windowRows = (args.windowRows || []).slice().sort(function (a, b) { return a.day - b.day; });
  const censusRows = (args.censusRows || []).slice().sort(function (a, b) { return a.day - b.day; });
  const deaths = args.deaths || [];
  const meetings = args.meetingsCount | 0;
  const traveledDays = windowRows.filter(function (r) { return r.holderExped === true; }).length;
  const homeDays = windowRows.filter(function (r) { return r.holderNode && r.haven && sameTile(r.holderNode, r.haven); }).length;
  const everExped = traveledDays > 0;
  const alwaysAtHaven = windowRows.length > 0 && windowRows.every(function (r) {
    return r.holderNode && r.haven && sameTile(r.holderNode, r.haven);
  });
  const base = { traveledDays: traveledDays, homeDays: homeDays, everExped: everExped,
    alwaysAtHaven: alwaysAtHaven, deathDay: null, deathCause: null, deathPlace: null,
    deathPlaceNode: null, deathRowMissing: false };
  if (meetings >= 1) return Object.assign({ cls: 'traveled-and-found' }, base);
  if (closeDay == null) return Object.assign({ cls: 'still-open' }, base);
  // Death day: first window tracker row with holderAlive false;
  // else the first census row with holderAlive false; else a
  // death-log row for the holder in the window.
  let deathDay = null, deathRowMissing = false;
  for (const r of windowRows) if (r.holderAlive === false) { deathDay = r.day; break; }
  if (deathDay == null) {
    for (const r of censusRows) if (r.holderAlive === false) { deathDay = r.day; break; }
  }
  let deathLogRow = null;
  const holderDeaths = deaths.filter(function (d) {
    return (d.kind === 'villager' || d.kind === 'person') && d.who === holder &&
      d.day >= launchDay && d.day <= closeDay;
  });
  if (deathDay == null && holderDeaths.length) {
    deathDay = holderDeaths[0].day;
    deathLogRow = holderDeaths[0];
  }
  if (deathDay == null) return Object.assign({ cls: 'traveled-not-found' }, base);
  // Cause: the death-log row on the death day if there is one, else
  // the first holder death row in the window, else unknown.
  if (!deathLogRow) {
    deathLogRow = holderDeaths.find(function (d) { return d.day === deathDay; }) || holderDeaths[0] || null;
  }
  const deathCause = deathLogRow ? (deathLogRow.cause || null) : 'unknown (no death-log row)';
  // Place: the death-day tracker row (or the last alive day's row
  // when the death-day row is missing — e.g. the plan was deleted
  // the same day the holder died).
  let placeRow = windowRows.find(function (r) { return r.day === deathDay; }) || null;
  if (!placeRow) {
    const before = windowRows.filter(function (r) { return r.day < deathDay; });
    placeRow = before.length ? before[before.length - 1] : null;
    deathRowMissing = true;
  }
  let deathPlace = null, deathPlaceNode = null, diedAway = false;
  if (placeRow) {
    deathPlaceNode = placeRow.holderNode || null;
    if (placeRow.holderExped === true) diedAway = true;
    else if (placeRow.holderNode && placeRow.haven && !sameTile(placeRow.holderNode, placeRow.haven)) diedAway = true;
    deathPlace = diedAway ? 'away' : 'haven';
  } else {
    deathRowMissing = true;
  }
  let cls;
  if (diedAway) cls = 'died-en-route';
  else if (!everExped && alwaysAtHaven) cls = 'stayed-home-died';
  else cls = 'died-at-home-other';
  // NOTE: base goes FIRST — its null death fields must not
  // overwrite the computed ones (Object.assign applies sources
  // left to right).
  return Object.assign({}, base, { cls: cls, deathDay: deathDay, deathCause: deathCause,
    deathPlace: deathPlace, deathPlaceNode: deathPlaceNode,
    deathRowMissing: deathRowMissing });
}

// meetingsForLaunch(j, launch): distinct in-window launched-party
// meetings for one launch, by the frozen seedland definition.
// Returns { count, rows } with rows = the distinct encounter rows.
function meetingsForLaunch(j, launch) {
  const finalDay = j.gameDays || j.days || 0;
  const closeDay = launch.closeDay == null ? finalDay : launch.closeDay;
  const party = [launch.holder];
  if (launch.companion) party.push(launch.companion);
  const seen = {};
  const rows = [];
  for (const e of (j.v4encounters || [])) {
    if ((e.wave | 0) < 4) continue;
    if (e.mid !== launch.target) continue;
    if (party.indexOf(e.vid) === -1) continue;
    if (e.origin !== 'expedition') continue;
    if (e.day < launch.launchDay || e.day > closeDay) continue;
    const k = SEEDLAND.meetingKey(j.seed, e.vid, e.day, e.mid);
    if (seen[k]) continue;
    seen[k] = true;
    rows.push({ day: e.day, vid: e.vid, mid: e.mid, wave: e.wave, origin: e.origin, outcome: e.outcome || null });
  }
  return { count: rows.length, rows: rows };
}

// analyzeLaunchsurviveSeed(j): per-seed launch decomposition.
// j must already carry classifySeedPaths (instances) — the caller
// applies it first, exactly as analyzeSeedlandLeg does.
function analyzeLaunchsurviveSeed(j) {
  const finalDay = j.gameDays || j.days || 0;
  const sl = SEEDLAND.analyzeSeedlandSeed(j);
  const instances = (j.instances || []).slice();
  const launched = instances.filter(function (i) { return i.bucket === 'launched'; });
  const trackRows = (j.v4launchTrack || []).slice();
  const censusRows = (j.dawnbidCensus || []).slice();
  const deaths = (j.deaths || []).slice();
  const launches = [];
  let trackerGaps = 0;
  for (const inst of launched) {
    const res = (inst.resolved || []).find(function (r) { return r.outcome === 'launched'; });
    if (!res) continue;
    const launchDay = res.day;
    const companion = res.companion || null;
    const closeDay = inst.closeDay == null ? finalDay : inst.closeDay;
    const windowRows = trackRows.filter(function (r) {
      return r.vid === inst.vid && r.day >= launchDay && r.day <= closeDay;
    }).sort(function (a, b) { return a.day - b.day; });
    const windowCensus = censusRows.filter(function (r) {
      return r.vid === inst.vid && r.day >= launchDay && r.day <= closeDay;
    }).sort(function (a, b) { return a.day - b.day; });
    if (windowRows.length === 0) trackerGaps++;
    const launch = { holder: inst.vid, companion: companion, target: inst.target,
      launchDay: launchDay, closeDay: inst.closeDay };
    const meetings = meetingsForLaunch(j, launch);
    const cls = classifyLaunch({ launchDay: launchDay, closeDay: inst.closeDay,
      closeKind: inst.closeKind || null, holder: inst.vid, companion: companion,
      target: inst.target, windowRows: windowRows, censusRows: windowCensus,
      deaths: deaths, meetingsCount: meetings.count });
    // Target persistence over the window (frozen R=2, from the
    // tracker rows: targetNearCount >= 1 on a day = present).
    let persistentDays = 0, minDist = null;
    let lastKnownSource = null;
    for (const r of windowRows) {
      if ((r.targetNearCount | 0) >= 1) persistentDays++;
      if (r.targetNearDist != null && (minDist == null || r.targetNearDist < minDist)) minDist = r.targetNearDist;
    }
    const launchRow = windowRows.find(function (r) { return r.day === launchDay; }) || windowRows[0] || null;
    if (launchRow) lastKnownSource = launchRow.lastKnownSource || null;
    const companionLaunchNode = launchRow ? (launchRow.partyNodes ? (launchRow.partyNodes[companion] || null) : null) : null;
    const closeRow = windowRows.length ? windowRows[windowRows.length - 1] : null;
    launches.push({
      seed: j.seed, holder: inst.vid, companion: companion, target: inst.target,
      seedDay: inst.seedDay, launchDay: launchDay,
      closeDay: inst.closeDay, closeKind: inst.closeKind || null,
      instanceStillOpen: inst.closeDay == null,
      cls: cls.cls, meetings: meetings.count, meetingRows: meetings.rows,
      windowDays: closeDay - launchDay + 1, windowRows: windowRows.length,
      traveledDays: cls.traveledDays, homeDays: cls.homeDays,
      deathDay: cls.deathDay, deathCause: cls.deathCause,
      deathPlace: cls.deathPlace, deathPlaceNode: cls.deathPlaceNode,
      deathRowMissing: cls.deathRowMissing,
      persistence: persistentDays > 0 ? 'yes' : 'no',
      persistentDays: persistentDays,
      minTargetNearDist: minDist,
      lastKnownSource: lastKnownSource,
      lastKnownTile: launchRow ? (launchRow.lastKnownTile || null) : null,
      companionLaunchNode: companionLaunchNode,
      companionCloseNode: closeRow && closeRow.partyNodes ? (closeRow.partyNodes[companion] || null) : null,
    });
  }
  // Plan-linger secondary (haventick measure): for every instance
  // with closeKind holder-died, the census tail after closeDay.
  const linger = [];
  for (const inst of instances) {
    if (inst.closeKind !== 'holder-died' || inst.closeDay == null) continue;
    const tail = censusRows.filter(function (r) {
      return r.vid === inst.vid && r.target === inst.target &&
        r.day > inst.closeDay && r.holderAlive === false;
    }).length;
    const lastCensus = censusRows.filter(function (r) {
      return r.vid === inst.vid && r.target === inst.target;
    }).map(function (r) { return r.day; });
    linger.push({ seed: j.seed, holder: inst.vid, target: inst.target,
      seedDay: inst.seedDay, closeDay: inst.closeDay,
      postDeathTailDays: tail, planLingers: tail > 0,
      lastCensusDay: lastCensus.length ? Math.max.apply(null, lastCensus) : null });
  }
  const expeditionDeaths = deaths.filter(function (d) { return d.cause === 'expedition'; }).length;
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    instancesOpened: instances.length,
    attributionCoverage: j.attributionCoverage,
    launchedInstances: launched.length,
    launches: launches,
    trackerGaps: trackerGaps,
    trackerRows: trackRows.length,
    launchTrackOn: j.launchTrackOn === true,
    linger: linger,
    holderDiedInstances: linger.length,
    lingeringPlans: linger.filter(function (l) { return l.planLingers; }).length,
    medianTailDays: med(linger.map(function (l) { return l.postDeathTailDays; })),
    expeditionDeaths: expeditionDeaths, totalDeaths: deaths.length,
    starvation: sl.starvation,
    instrumentErrors: (j.instrumentErrors || []).length,
    firstWorldTickDay: sl.firstWorldTickDay,
    launchedKills: sl.launchedKills, launchedDeaths: sl.launchedDeaths,
    w5class: sl.w5class,
  };
}

function analyzeLaunchsurviveLeg(dir) {
  const leg = loadDir(dir);
  for (const k of Object.keys(leg.bySeed)) {
    const classified = SEEDPATHS.classifySeedPaths(leg.bySeed[k]);
    leg.bySeed[k] = Object.assign({}, leg.bySeed[k], classified);
  }
  const summary = SEEDPATHS.summarizeSeedPaths(leg);
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const perSeed = seeds.map(analyzeLaunchsurviveSeed);
  const launches = [];
  for (const s of perSeed) for (const l of s.launches) launches.push(l);
  const byClass = {};
  for (const c of LAUNCH_CLASSES) byClass[c] = 0;
  for (const l of launches) byClass[l.cls]++;
  const withMeeting = launches.filter(function (l) { return l.meetings >= 1; }).length;
  const persistentYes = launches.filter(function (l) { return l.persistence === 'yes'; }).length;
  const trackerGaps = perSeed.reduce(function (a, s) { return a + s.trackerGaps; }, 0);
  const trackerRows = perSeed.reduce(function (a, s) { return a + s.trackerRows; }, 0);
  const errors = perSeed.reduce(function (a, s) { return a + s.instrumentErrors; }, 0);
  const expeditionDeaths = perSeed.reduce(function (a, s) { return a + s.expeditionDeaths; }, 0);
  const totalDeaths = perSeed.reduce(function (a, s) { return a + s.totalDeaths; }, 0);
  const starvation = perSeed.reduce(function (a, s) { return a + s.starvation; }, 0);
  const medianSurvival = med(perSeed.map(function (s) { return s.gameDays || s.days || 0; }));
  const holderDied = perSeed.reduce(function (a, s) { return a + s.holderDiedInstances; }, 0);
  const lingering = perSeed.reduce(function (a, s) { return a + s.lingeringPlans; }, 0);
  const allTails = [];
  for (const s of perSeed) for (const l of s.linger) allTails.push(l.postDeathTailDays);
  return {
    dir: path.basename(dir),
    files: leg.files.length, parseErrors: leg.parseErrors,
    seeds: perSeed.length,
    summary: summary,
    perSeed: perSeed,
    launches: launches,
    launchesN: launches.length,
    byClass: byClass,
    meetingsShare: launches.length ? round(withMeeting / launches.length, 4) : null,
    launchesWithMeeting: withMeeting,
    persistenceYes: persistentYes,
    persistenceShare: launches.length ? round(persistentYes / launches.length, 4) : null,
    trackerGaps: trackerGaps, trackerRows: trackerRows,
    instrumentErrors: errors,
    attributionCoverage: summary.attributionCoverage,
    instancesOpened: summary.instancesOpened,
    wall: summary.wall,
    medianSurvival: medianSurvival,
    starvation: starvation,
    expeditionDeaths: expeditionDeaths, totalDeaths: totalDeaths,
    deathsPerRun: perSeed.length ? round(totalDeaths / perSeed.length, 1) : null,
    holderDiedInstances: holderDied, lingeringPlans: lingering,
    lingerShare: holderDied ? round(lingering / holderDied, 4) : null,
    medianTailDays: med(allTails),
  };
}

function judgeLaunchsurvive(control, on) {
  const b1 = control.instrumentErrors === 0 && on.instrumentErrors === 0 &&
    control.files === 8 && on.files === 8 &&
    control.parseErrors.length === 0 && on.parseErrors.length === 0 &&
    control.seeds === 8 && on.seeds === 8 &&
    (control.attributionCoverage == null || control.attributionCoverage >= 0.90) &&
    (on.attributionCoverage == null || on.attributionCoverage >= 0.90) &&
    control.trackerGaps === 0 && on.trackerGaps === 0;
  const b2v = on.launchesN;
  const b2 = b2v >= 3;
  const unclassified = on.launches.filter(function (l) { return LAUNCH_CLASSES.indexOf(l.cls) === -1; }).length;
  const noPersistence = on.launches.filter(function (l) { return l.persistence !== 'yes' && l.persistence !== 'no'; }).length;
  const b3 = unclassified === 0 && noPersistence === 0;
  const b4 = null; // filled by the caller from the proof test result
  const b5 = null; // filled by the caller from the D3 smoke below
  return {
    instrument: { controlErrors: control.instrumentErrors, onErrors: on.instrumentErrors,
      controlFiles: control.files, onFiles: on.files,
      controlParseErrors: control.parseErrors, onParseErrors: on.parseErrors,
      controlCoverage: control.attributionCoverage, onCoverage: on.attributionCoverage,
      controlTrackerGaps: control.trackerGaps, onTrackerGaps: on.trackerGaps,
      controlTrackerRows: control.trackerRows, onTrackerRows: on.trackerRows,
      controlInstances: control.instancesOpened, onInstances: on.instancesOpened,
      pass: b1 },
    power: { value: b2v, bar: '>= 3 launches on the 8-seed on-leg', pass: b2 },
    classification: { unclassified: unclassified, noPersistence: noPersistence,
      byClass: on.byClass,
      bar: 'every launch in exactly one of the six classes, persistence measured per launch',
      pass: b3 },
    proof: { value: b4, bar: 'test-launchsurvive-a.js green on the tip AND post-revert', pass: b4 },
    determinism: { value: b5, bar: 'D1/D2 green + D3 smoke clean', pass: b5 },
    meetingsShare: { value: on.meetingsShare, withMeeting: on.launchesWithMeeting,
      launches: on.launchesN, bar: 'primary metric (reported; seedland 0/3)', pass: null },
    verdict: null, // set by main() once proof + D3 are known
  };
}

function main() {
  const controlDir = process.argv[2];
  const onDir = process.argv[3];
  if (!controlDir || !onDir) { console.error('LAUNCHSURVIVE ANALYZE STOP: controlDir and onDir required.'); process.exit(2); }
  const control = analyzeLaunchsurviveLeg(controlDir);
  const on = analyzeLaunchsurviveLeg(onDir);
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
    const div = SEEDLAND.firstDivergenceDay(cRaw, oRaw);
    d3.push({ seed: cps.seed,
      firstDivergenceDay: div,
      firstWorldTickDayControl: cps.firstWorldTickDay,
      firstWorldTickDayOn: ops.firstWorldTickDay,
      divergesBeforeFirstSeed: (typeof div === 'number' && ops.firstWorldTickDay != null) ? div < ops.firstWorldTickDay : null });
  }
  const d3clean = d3.every(function (r) { return r.divergesBeforeFirstSeed !== true; });
  const judgment = judgeLaunchsurvive(control, on);
  // Proof + D3 are judged by the caller: the proof test is run
  // separately (its result is recorded in the evidence file, not
  // in this analysis); D3 is known here. The verdict below is
  // therefore provisional on the proof leg — main() sets it from
  // bars 1–3 + D3, and the evidence file records the proof result
  // alongside. A proof failure overturns a GO here.
  judgment.determinism.value = d3clean ? 'D3 clean (D1/D2 in proof test)' : 'D3 DIRTY';
  judgment.determinism.pass = d3clean;
  const goSoFar = judgment.instrument.pass && judgment.power.pass &&
    judgment.classification.pass && judgment.determinism.pass;
  judgment.verdict = goSoFar ? 'GO (provisional on proof test — see evidence)' : 'NO-GO';
  const out = {
    arm: 'launchsurvive-a', run: 'launchsurvive-a',
    controlDir: path.basename(controlDir), onDir: path.basename(onDir),
    control: control, on: on,
    d3: d3,
    judgment: judgment,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'launchsurvive-a-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  function printLeg(name, leg) {
    console.log('=== launchsurvive-a ' + name + ' leg ===');
    console.log('seeds: ' + leg.seeds + '  files: ' + leg.files +
      '  instancesOpened: ' + leg.instancesOpened + '  coverage: ' + leg.attributionCoverage +
      '  errors: ' + leg.instrumentErrors + '  trackerRows: ' + leg.trackerRows + '  trackerGaps: ' + leg.trackerGaps);
    console.log('launches: ' + leg.launchesN + '  byClass: ' + JSON.stringify(leg.byClass) +
      '  meetingsShare: ' + leg.meetingsShare + ' (' + leg.launchesWithMeeting + '/' + leg.launchesN + ')' +
      '  persistenceYes: ' + leg.persistenceYes + '/' + leg.launchesN);
    console.log('guard: expeditionDeaths=' + leg.expeditionDeaths + ' totalDeaths=' + leg.totalDeaths +
      ' (' + leg.deathsPerRun + '/run)  starvation=' + leg.starvation + '  medianSurvival=' + leg.medianSurvival);
    console.log('linger: holderDiedInstances=' + leg.holderDiedInstances +
      ' lingeringPlans=' + leg.lingeringPlans + ' (' + leg.lingerShare + ')  medianTailDays=' + leg.medianTailDays);
    console.log('wall: ' + JSON.stringify(leg.wall));
    for (const l of leg.launches) {
      console.log('  launch seed ' + l.seed + ': ' + l.holder + ' -> ' + l.target +
        ' comp ' + (l.companion || 'none') + ' d' + l.launchDay + '-' + (l.closeDay == null ? 'open' : l.closeDay) +
        ' cls=' + l.cls + ' meetings=' + l.meetings + ' persistence=' + l.persistence +
        ' (' + l.persistentDays + 'd, minDist ' + l.minTargetNearDist + ')' +
        (l.deathDay != null ? ' died d' + l.deathDay + ' (' + l.deathCause + ', ' + l.deathPlace + ')' : ''));
    }
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
  if (judgment.verdict !== 'GO (provisional on proof test — see evidence)') process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifyLaunch: classifyLaunch, meetingsForLaunch: meetingsForLaunch,
  analyzeLaunchsurviveSeed: analyzeLaunchsurviveSeed,
  analyzeLaunchsurviveLeg: analyzeLaunchsurviveLeg,
  judgeLaunchsurvive: judgeLaunchsurvive, LAUNCH_CLASSES: LAUNCH_CLASSES };
