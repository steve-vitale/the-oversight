#!/usr/bin/env node
// scripts/test-gatelever-b.js — sim-gatelever-b proof: the gate-lever
// instrument (scripts/gatelever-driver-20261116.js), the gatelever
// judgment (scripts/analyze-gatelever-b.js), the drift smoke
// (scripts/gatelever-drift-check.js), and the lever + seed-call shape
// rule (seed call verbatim + the three gate changes; revert after a
// NO-GO, or keep as the lever's base on a GO).
//
// Cases (one fixture, one process per case — harness rule: never two
// harnesses in one node process at once). The 'all' runner spawns one
// child process per case and aggregates; exit 1 if any case fails.
// Each case prints one JSON line.
//   static        recorder wiring present in the driver (gateCaller,
//                 classifyGatePath, coveringLaunch, fighterExped,
//                 GATELEVER_RECORDER, competent verbatim +
//                 POLICY_SHA, the gatelever row fields partyFromPlan
//                 / livedFought / repointed / trickWaitSinceDay /
//                 secondCompanion); the frozen wave-4 id set matches
//                 src/data/monsters.json exactly (10 ids); the driver
//                 and analyzer classifyGatePath agree on every
//                 fixture row; the seed-call + lever shape matches
//                 GATELEVER_MODE (lever = seed present + lever
//                 present, src diff exactly the 4 lever files;
//                 control = seed present, lever absent, src diff
//                 only game.js; off = both absent, src diff 0).
//   judge         judgeGatelever() on synthetic pooled summaries:
//                 the GO shape and one NO-GO fixture per bar (seeks
//                 0, kills 0, kill:death short, FNK over, starvation
//                 over, survival short, instrument dirty), plus the
//                 boundary GO (kill:death 0.92, FNK 0.20, survival
//                 exactly 0.8x) and the zero-deaths pass (kills 1,
//                 deaths 0 -> killDeath null, pass).
//   recorder      analyzeGateleverLeg on synthetic per-seed
//                 fixtures in /tmp: SEEKs (rows + distinct, by
//                 mechanism), launched-party wave-4+ field kills
//                 (distinct meetings), kill:death, the mechanism
//                 decomposition (second-companion launches,
//                 trick_wait rows/episodes, re-point rows, gate rows
//                 with partyFromPlan > 0), and the vcDeaths
//                 secondary; judgeGatelever on the fixture legs
//                 (corpus bar fails on 1 seed — expected).
//   determinism   D1: gatelever driver oneRun twice on seed 102101,
//                 150 days, recorder ON — identical full corpus keys
//                 (deaths/days/endReason/standing/series + recorder
//                 arrays incl. gate rows with the new fields). D2:
//                 the same seed, 150d, recorder ON vs OFF
//                 (GATELEVER_RECORDER=off, via the determinism-d2
//                 sub-case) — identical trajectories. Live check:
//                 every recorded gate row recomputes to its recorded
//                 path and carries the gatelever fields.
// Usage: node scripts/test-gatelever-b.js [seed] [case]
//   (DAYS env sets the determinism horizon; default 150.
//    GATELEVER_MODE=lever|control|off checks the shape.)
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync, execSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '102101');
const kase = process.argv[3] || 'all';
const MODE = process.env.GATELEVER_MODE || 'lever';
const BASE = '9b04ae9b7';

function out(o) { console.log(JSON.stringify(o)); }
function fail(k, detail, extra) { out(Object.assign({ case: k, pass: false, detail: detail }, extra || {})); process.exit(1); }
function pass(k, extra) { out(Object.assign({ case: k, pass: true }, extra || {})); process.exit(0); }

if (kase === 'all') {
  const cases = ['static', 'judge', 'recorder', 'determinism'];
  let allOk = true;
  for (const c of cases) {
    try {
      const env = Object.assign({}, process.env);
      if (c === 'determinism') env.DAYS = '150';
      const r = execFileSync(process.execPath, [path.join(__dirname, 'test-gatelever-b.js'), String(seed), c], { cwd: repo, encoding: 'utf8', timeout: 900000, env: env });
      const lines = r.trim().split('\n').filter(Boolean);
      for (const l of lines) { try { const j = JSON.parse(l); if (j.pass === false) allOk = false; console.log(l); } catch (e) { console.log(l); } }
    } catch (e) {
      allOk = false;
      console.log(JSON.stringify({ case: c, pass: false, detail: 'child failed: ' + String((e.stdout || '') + (e.stderr || '') + e.message).slice(0, 800) }));
    }
  }
  process.exit(allOk ? 0 : 1);
}

if (kase === 'static') {
  // 1. Recorder wiring present in the driver.
  const drv = fs.readFileSync(path.join(repo, 'scripts', 'gatelever-driver-20261116.js'), 'utf8');
  for (const needle of ['gateCaller', 'classifyGatePath', 'coveringLaunch', 'fighterExped', 'GATELEVER_RECORDER', 'RECORDER_ON', 'POLICY_SHA', 'competent', 'grLaunches', 'launchCtx', 'w5gates', 'partyFromPlan', 'livedFought', 'repointed', 'trickWaitSinceDay', 'secondCompanion', 'foughtOf']) {
    if (drv.indexOf(needle) < 0) fail('static', 'driver missing recorder piece: ' + needle);
  }
  if (drv.indexOf("arm: 'gatelever-b'") < 0) fail('static', 'driver arm tag missing');
  if (drv.indexOf("policy: 'competent'") < 0 && drv.indexOf("policy: policyName") < 0) fail('static', 'driver policy tag missing');
  // 2. Frozen wave-4 id set matches the roster exactly (10 ids).
  const monsters = JSON.parse(fs.readFileSync(path.join(repo, 'src', 'data', 'monsters.json'), 'utf8'));
  const mlist = monsters.monsters || monsters;
  const live4 = mlist.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  const frozen4 = ['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb'];
  if (JSON.stringify(live4) !== JSON.stringify(frozen4)) fail('static', 'wave-4 id set drifted: live ' + JSON.stringify(live4) + ' vs frozen ' + JSON.stringify(frozen4));
  const live5 = mlist.filter(function (m) { return m.wave === 5; }).map(function (m) { return m.id; }).sort();
  const frozen5 = ['cancellation', 'editor', 'finale', 'finale_crew', 'finale_opening', 'network_note', 'nielsen', 'rerun', 'spoiler', 'timeslot'];
  if (JSON.stringify(live5) !== JSON.stringify(frozen5)) fail('static', 'wave-5 id set drifted: live ' + JSON.stringify(live5) + ' vs frozen ' + JSON.stringify(frozen5));
  // 3. Driver and analyzer classifyGatePath agree on every path
  // fixture, including precedence (launched beats ordinary when a
  // covering launch exists).
  const driver = require(path.join(__dirname, 'gatelever-driver-20261116.js'));
  const analyzer = require(path.join(__dirname, 'analyze-gatelever-b.js'));
  const baseAnalyzer = require(path.join(__dirname, 'analyze-gatereach2-b.js'));
  const rows = [
    ['expeditionMonster', true, 'expedition-launched'],
    ['expeditionMonster', false, 'expedition-ordinary'],
    ['resolveWildMonsterEncounter', false, 'world-tick'],
    ['resolveWildMonsterEncounter', true, 'world-tick'],
    ['aidFight', false, 'aid'],
    ['aidFight', true, 'aid'],
    ['resolvePatrol', false, 'other:resolvePatrol'],
    ['someOtherFn', true, 'other:someOtherFn'],
    [null, false, 'unknown'],
    [null, true, 'unknown'],
    ['', false, 'unknown'],
  ];
  for (const [caller, hasLaunch, want] of rows) {
    const a = driver.classifyGatePath(caller, hasLaunch);
    const b = baseAnalyzer.classifyGatePath(caller, hasLaunch);
    if (a !== want) fail('static', 'driver classifyGatePath(' + caller + ',' + hasLaunch + ') = ' + a + ', want ' + want);
    if (b !== want) fail('static', 'analyzer classifyGatePath(' + caller + ',' + hasLaunch + ') = ' + b + ', want ' + want);
  }
  // 4. Seed-call + lever shape (GATELEVER_MODE).
  const gameJs = fs.readFileSync(path.join(repo, 'src', 'js', 'game.js'), 'utf8');
  const blockPresent = gameJs.indexOf('// VETPARTY (sim-vetparty-a): a villager who FACED a wave-4+ beast') !== -1 &&
    gameJs.indexOf("this.winPlanSeedFromFight(vid, mdef, 'fled');") !== -1;
  const leverMarkers = {
    'src/js/win-plan.js': ['GATELEVER (sim-gatelever-b)', 'TRICK_WAIT_DAYS', 'trickWaitSinceDay', 'trickWaitedFor', 'livedFought'],
    'src/js/villager-brain.js': ['GATELEVER (sim-gatelever-b)', 'trick_wait'],
    'src/js/villager-agency.js': ['GATELEVER (sim-gatelever-b)'],
  };
  let srcFiles = [];
  try { srcFiles = execSync('git diff --name-only ' + BASE + ' HEAD -- src/', { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean).sort(); } catch (e) { fail('static', 'git diff failed: ' + e.message); }
  function leverPresent() {
    for (const f of Object.keys(leverMarkers)) {
      const txt = fs.readFileSync(path.join(repo, f), 'utf8');
      for (const m of leverMarkers[f]) if (txt.indexOf(m) < 0) return f + ' missing marker ' + m;
    }
    return null;
  }
  if (MODE === 'lever') {
    if (!blockPresent) fail('static', 'seed call must be PRESENT on the lever tip (GATELEVER_MODE=lever)');
    const missing = leverPresent();
    if (missing) fail('static', 'lever must be PRESENT on the lever tip: ' + missing);
    const want = ['src/js/game.js', 'src/js/villager-agency.js', 'src/js/villager-brain.js', 'src/js/win-plan.js'];
    if (JSON.stringify(srcFiles) !== JSON.stringify(want)) fail('static', 'src diff vs base must be exactly the 4 lever files, got ' + JSON.stringify(srcFiles));
  } else if (MODE === 'control') {
    if (!blockPresent) fail('static', 'seed call must be PRESENT on the control tip (GATELEVER_MODE=control)');
    const missing = leverPresent();
    if (!missing) fail('static', 'lever must be ABSENT on the control tip (GATELEVER_MODE=control)');
    if (JSON.stringify(srcFiles) !== JSON.stringify(['src/js/game.js'])) fail('static', 'src diff vs base must be exactly src/js/game.js, got ' + JSON.stringify(srcFiles));
  } else if (MODE === 'off') {
    if (blockPresent) fail('static', 'seed call must be ABSENT post-revert (GATELEVER_MODE=off)');
    const missing = leverPresent();
    if (!missing) fail('static', 'lever must be ABSENT post-revert (GATELEVER_MODE=off)');
    if (srcFiles.length !== 0) fail('static', 'src diff vs base must be 0 lines post-revert, got ' + JSON.stringify(srcFiles));
  } else fail('static', 'unknown GATELEVER_MODE value: ' + MODE);
  pass('static', { recorderWraps: true, w4ids: live4, w5ids: live5, classifierRows: rows.length, seedCall: blockPresent, mode: MODE, srcFiles: srcFiles });
}

if (kase === 'judge') {
  const analyzer = require(path.join(__dirname, 'analyze-gatelever-b.js'));
  if (typeof analyzer.judgeGatelever !== 'function') fail('judge', 'judgeGatelever not exported');
  const leg = function (seeks, kills, deaths, fnk, starv, surv, errors, seeds, files, parse, consult, arrival) {
    return { pooled: { facedNotKilledShare: fnk, starvation: starv, medianSurvivalAll: surv,
        instrumentErrors: errors, seeds: seeds, files: files, parseErrors: parse },
      gateConsultations: { share: consult }, arrivals: { share: arrival },
      gatelever: { seeksRows: seeks, seeksDistinct: seeks, launchedKills: kills,
        launchedKillsRows: kills, launchedDeaths: deaths,
        killDeath: deaths === 0 ? null : +(kills / deaths).toFixed(2), vcDeathsW4plus: kills } };
  };
  const clean = function (c, l) { return analyzer.judgeGatelever(c, l); };
  const ctrl = leg(0, 0, 0, 0.5, 1, 150, 0, 8, 8, 0, 1.0, 1.0);
  const go = clean(ctrl, leg(2, 1, 0, 0.1, 2, 140, 0, 8, 8, 0, 1.0, 1.0));
  if (go.verdict !== 'GO') fail('judge', 'GO shape must GO, got ' + JSON.stringify(go));
  if (go.killDeath.pass !== true || go.killDeath.value !== null) fail('judge', 'zero-deaths kill:death must pass with null value, got ' + JSON.stringify(go.killDeath));
  const noSeek = clean(ctrl, leg(0, 1, 0, 0.1, 2, 140, 0, 8, 8, 0, 1.0, 1.0));
  if (noSeek.verdict !== 'NO-GO' || noSeek.gateSeeks.pass !== false) fail('judge', 'seeks-0 must fail the seeks bar, got ' + JSON.stringify(noSeek));
  const noKill = clean(ctrl, leg(1, 0, 0, 0.1, 2, 140, 0, 8, 8, 0, 1.0, 1.0));
  if (noKill.verdict !== 'NO-GO' || noKill.launchedPartyKills.pass !== false) fail('judge', 'kills-0 must fail the kills bar, got ' + JSON.stringify(noKill));
  const kdShort = clean(ctrl, leg(1, 1, 2, 0.1, 2, 140, 0, 8, 8, 0, 1.0, 1.0));
  if (kdShort.verdict !== 'NO-GO' || kdShort.killDeath.pass !== false || kdShort.killDeath.value !== 0.5) fail('judge', 'kill:death 0.50 must fail the kill:death bar, got ' + JSON.stringify(kdShort));
  const fnkOver = clean(ctrl, leg(1, 1, 0, 0.5, 2, 140, 0, 8, 8, 0, 1.0, 1.0));
  if (fnkOver.verdict !== 'NO-GO' || fnkOver.facedNotKilledShare.pass !== false) fail('judge', 'FNK 0.50 must fail the FNK bar, got ' + JSON.stringify(fnkOver));
  const starvOver = clean(ctrl, leg(1, 1, 0, 0.1, 4, 140, 0, 8, 8, 0, 1.0, 1.0));
  if (starvOver.verdict !== 'NO-GO' || starvOver.costs.starvation.pass !== false) fail('judge', 'starvation control+3 must fail the costs bar, got ' + JSON.stringify(starvOver));
  const survShort = clean(ctrl, leg(1, 1, 0, 0.1, 2, 100, 0, 8, 8, 0, 1.0, 1.0));
  if (survShort.verdict !== 'NO-GO' || survShort.costs.medianSurvival.pass !== false) fail('judge', 'survival 0.67x must fail the costs bar, got ' + JSON.stringify(survShort));
  const errOver = clean(ctrl, leg(1, 1, 0, 0.1, 2, 140, 1, 8, 8, 0, 1.0, 1.0));
  if (errOver.verdict !== 'NO-GO' || errOver.instrument.pass !== false) fail('judge', 'instrument errors must fail the instrument bar, got ' + JSON.stringify(errOver));
  // Boundary GO: kill:death exactly 0.92 (23/25), FNK exactly
  // 0.20, survival exactly 0.8x, starvation exactly control + 2.
  const edge = clean(ctrl, leg(1, 23, 25, 0.20, 3, 120, 0, 8, 8, 0, 1.0, 1.0));
  if (edge.verdict !== 'GO') fail('judge', 'boundary shape must GO, got ' + JSON.stringify(edge));
  if (edge.killDeath.value !== 0.92) fail('judge', 'boundary kill:death must be 0.92, got ' + edge.killDeath.value);
  // Zero kills with zero deaths: bar 2 fails (and bar 3 with it).
  const zeroKill = clean(ctrl, leg(1, 0, 0, 0.1, 2, 140, 0, 8, 8, 0, 1.0, 1.0));
  if (zeroKill.verdict !== 'NO-GO' || zeroKill.launchedPartyKills.pass !== false || zeroKill.killDeath.pass !== false) fail('judge', 'zero kills must fail bars 2 and 3, got ' + JSON.stringify(zeroKill));
  pass('judge', { fixtures: 11 });
}

if (kase === 'recorder') {
  const analyzer = require(path.join(__dirname, 'analyze-gatelever-b.js'));
  const w5k = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gatelever-test-'));
  const dirC = fs.mkdtempSync(path.join(os.tmpdir(), 'gatelever-test-control-'));
  try {
    const seriesA = [];
    for (let d = 1; d <= 150; d++) {
      seriesA.push({ d: d, w5: d >= 90 ? 2 : 0, vet5: d >= 80 ? 2 : 0, rd5ready: d >= 80, rd5short: d >= 80 ? [] : ['veterans'] });
    }
    const launch92 = { day: 92, source: 'brain', tx: 5, ty: 5, duration: 10 };
    const seedA = {
      seed: 102101, days: 150, endReason: 'survived', maxWave: 5, scaleRank: 'national', won: false,
      waveKills: { '5': 2 }, instrumentErrors: [],
      events: [{ day: 80, kind: 'unlockedWave', wave: 5 }],
      series: seriesA,
      deaths: [
        { day: 95, kind: 'monster', who: 'spoiler', cause: 'villager combat', player: false },
        { day: 66, kind: 'starvation', who: 'v5', cause: 'starved', player: false },
      ],
      seatTakes: [],
      w5encounters: [
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, origin: 'expedition', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, allyExpedSharedN: 2, partyAtStart: 3, startMode: 'expedition-party', alliesN: 2, allyVids: ['v2', 'v3'], allyFromStart: false, gate: { result: 'seek', reason: 'seek', partySize: 3, allArmed: true, allArmored: true, trickKnown: true, planStage: 'hunt', planTarget: 'editor' }, outcome: 'vKill', rounds: 6, vTaken: 40, mDealt: 1200, calledHelp: true, allyVid: 'v2', fleeHpFrac: null, trickBefore: true, trickAfter: true, lines: [], log: ['v1 struck the Spoiler.'] },
        { day: 96, vid: 'v1', mid: 'spoiler', wave: 5, origin: 'expedition', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, allyExpedSharedN: 0, partyAtStart: 1, startMode: 'expedition-solo', alliesN: 0, allyVids: [], allyFromStart: false, gate: { result: 'null', reason: null, partySize: 1, allArmed: true, allArmored: true, trickKnown: false, planStage: 'hunt', planTarget: 'spoiler' }, outcome: 'vFlee', rounds: 4, vTaken: 60, mDealt: 100, calledHelp: false, allyVid: null, fleeHpFrac: 0.3, trickBefore: false, trickAfter: true, lines: [], log: ['v1 fled the Spoiler.'] },
        { day: 98, vid: 'v1', mid: 'strike', wave: 4, origin: 'expedition', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, allyExpedSharedN: 2, partyAtStart: 3, startMode: 'expedition-party', alliesN: 2, allyVids: ['v2', 'v3'], allyFromStart: false, gate: { result: 'seek', reason: 'seek', partySize: 3, allArmed: true, allArmored: true, trickKnown: true, planStage: 'hunt', planTarget: 'strike' }, outcome: 'vKill', rounds: 5, vTaken: 20, mDealt: 900, calledHelp: true, allyVid: 'v3', fleeHpFrac: null, trickBefore: true, trickAfter: true, lines: [], log: ['v1 killed the Strike.'] },
        { day: 99, vid: 'v1', mid: 'audit', wave: 4, origin: 'expedition', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, allyExpedSharedN: 1, partyAtStart: 2, startMode: 'expedition-party', alliesN: 1, allyVids: ['v2'], allyFromStart: false, gate: null, outcome: 'vDie', rounds: 3, vTaken: 100, mDealt: 15, calledHelp: false, allyVid: null, fleeHpFrac: 0.4, trickBefore: false, trickAfter: false, lines: [], log: ['v1 died to the Audit.'] },
      ],
      w5gates: [
        { day: 90, vid: 'v1', mid: 'spool', wave: 3, result: 'null', reason: null, partySize: 2, party: ['v1', 'v2'], sensedSize: 2, gateParty: null, allArmed: true, allArmored: true, gear: {}, trickKnown: false, planStage: 'hunt', planTarget: 'spoiler', planParty: [], needWave: 4, caller: 'expeditionMonster', path: 'expedition-ordinary', fighterExped: { tx: 5, ty: 5, sinceDay: 88, duration: 10 }, launch: null, partyFromPlan: 0, livedFought: false, trickWaitedFor: null },
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, result: 'seek', reason: 'seek', partySize: 3, party: ['v1', 'v2', 'v3'], sensedSize: 2, gateParty: ['v1', 'v2', 'v3'], allArmed: true, allArmored: true, gear: {}, trickKnown: true, planStage: 'hunt', planTarget: 'editor', planParty: ['v2', 'v3'], needWave: null, caller: 'expeditionMonster', path: 'expedition-launched', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, launch: launch92, partyFromPlan: 1, livedFought: true, trickWaitedFor: null },
        { day: 96, vid: 'v1', mid: 'spoiler', wave: 5, result: 'null', reason: null, partySize: 3, party: ['v1', 'v2', 'v3'], sensedSize: 3, gateParty: null, allArmed: true, allArmored: true, gear: {}, trickKnown: false, planStage: 'hunt', planTarget: 'spoiler', planParty: ['v2', 'v3'], needWave: 5, caller: 'expeditionMonster', path: 'expedition-launched', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, launch: launch92, partyFromPlan: 0, livedFought: true, trickWaitedFor: null },
        { day: 97, vid: 'v1', mid: 'audit', wave: 4, result: 'avoid', reason: 'outmatched', partySize: 2, party: ['v1', 'v2'], sensedSize: 2, gateParty: ['v1', 'v2'], allArmed: true, allArmored: true, gear: {}, trickKnown: false, planStage: 'party', planTarget: 'editor', planParty: [], needWave: 5, caller: 'expeditionMonster', path: 'expedition-launched', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, launch: launch92, partyFromPlan: 0, livedFought: false, trickWaitedFor: null },
        { day: 98, vid: 'v1', mid: 'strike', wave: 4, result: 'seek', reason: 'seek', partySize: 3, party: ['v1', 'v2', 'v3'], sensedSize: 3, gateParty: ['v1', 'v2', 'v3'], allArmed: true, allArmored: true, gear: {}, trickKnown: true, planStage: 'hunt', planTarget: 'strike', planParty: ['v2', 'v3'], needWave: 4, caller: 'expeditionMonster', path: 'expedition-launched', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, launch: launch92, partyFromPlan: 0, livedFought: false, trickWaitedFor: null },
      ],
      w5seeds: [
        { day: 90, vid: 'v1', mid: 'spoiler', wave: 5, outcome: 'fled', stageAfter: 'hunt', target: 'spoiler', node: { nx: 5, ny: 5 }, repointed: true },
        { day: 110, vid: 'v1', mid: 'editor', wave: 5, outcome: 'fled', stageAfter: 'party', target: 'editor', node: { nx: 5, ny: 5 }, repointed: false },
      ],
      w5departs: [
        { day: 88, vid: 'v1', result: 'hold', source: 'brain', winPlanAction: 'trick_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'hunt', target: 'spoiler', party: [], companions: null, targetWave: 5, holdSinceDay: null, poolCensus: null, trickWaitSinceDay: 88, trickWaitedFor: null, secondCompanion: null },
        { day: 92, vid: 'v1', result: 'launch', source: 'brain', winPlanAction: 'party_launch', companion: 'v2', companion2: null, companionsAvailable: null, needsFull: true, stage: 'hunt', target: 'spoiler', party: ['v2', 'v3'], companions: 3, targetWave: 5, holdSinceDay: null, poolCensus: null, trickWaitSinceDay: null, trickWaitedFor: 'spoiler', secondCompanion: 'v3' },
      ],
      grLaunches: [
        { day: 92, vid: 'v1', role: 'holder', ctxVid: 'v1', source: 'brain', launched: true, tx: 5, ty: 5, duration: 10, planTarget: 'spoiler', needWave: 5, stage: 'hunt', partyAfter: ['v2', 'v3'] },
        { day: 92, vid: 'v2', role: 'companion', ctxVid: 'v1', source: 'brain', launched: true, tx: 5, ty: 5, duration: 10, planTarget: 'spoiler', needWave: 5, stage: 'hunt', partyAfter: ['v1'] },
        { day: 92, vid: 'v3', role: 'companion', ctxVid: 'v1', source: 'brain', launched: true, tx: 5, ty: 5, duration: 10, planTarget: 'spoiler', needWave: 5, stage: 'hunt', partyAfter: ['v1'] },
      ],
      wpEnd: { planSeeds: 2, avoidances: 1, seekContacts: 2, standingContacts: 0, partyDepartures: 1, partyFights: 1, trickHolds: 1, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 1, byStage: { hunt: 1 }, w5Targets: 1 },
    };
    const seedB = {
      seed: 102102, days: 120, endReason: 'village-lost', maxWave: 4, scaleRank: 'regional', won: false,
      waveKills: {}, instrumentErrors: [],
      events: [{ day: 60, kind: 'unlockedWave', wave: 4 }],
      series: [{ d: 1, w5: 0, vet5: 0, rd5ready: false, rd5short: [] }],
      deaths: [], seatTakes: [],
      w5encounters: [], w5gates: [], w5seeds: [], w5departs: [], grLaunches: [],
      wpEnd: { planSeeds: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 0, byStage: {}, w5Targets: 0 },
    };
    const seedC = {
      seed: 102101, days: 150, endReason: 'survived', maxWave: 5, scaleRank: 'national', won: false,
      waveKills: { '5': 0 }, instrumentErrors: [],
      events: [{ day: 80, kind: 'unlockedWave', wave: 5 }],
      series: seriesA,
      deaths: [], seatTakes: [],
      w5encounters: [], w5gates: [], w5seeds: [], w5departs: [], grLaunches: [],
      wpEnd: { planSeeds: 1, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 1, byStage: { hunt: 1 }, w5Targets: 0 },
    };
    fs.writeFileSync(path.join(dir, 'gatelever-b-s102101-test.json'), JSON.stringify(seedA));
    fs.writeFileSync(path.join(dir, 'gatelever-b-s102102-test.json'), JSON.stringify(seedB));
    fs.writeFileSync(path.join(dirC, 'gatelever-b-s102101-test.json'), JSON.stringify(seedC));
    const w5set = new Set(w5k.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json')));
    const w4plus = analyzer.loadWave4plusIds(path.join(repo, 'src', 'data', 'monsters.json'));
    if (w4plus.size !== 23) fail('recorder', 'wave-4+ id set must be 23 (10 w4 + 10 w5 + 3 w6), got ' + w4plus.size);
    const legOut = analyzer.analyzeGateleverLeg(dir, w5set, w4plus);
    const gl = legOut.gatelever;
    if (gl.seeksRows !== 2) fail('recorder', 'SEEK rows must be 2, got ' + gl.seeksRows);
    if (gl.seeksDistinct !== 2) fail('recorder', 'SEEK distinct must be 2, got ' + gl.seeksDistinct);
    if (gl.launchedKills !== 2) fail('recorder', 'launched kills must be 2, got ' + gl.launchedKills);
    if (gl.launchedDeaths !== 1) fail('recorder', 'launched deaths must be 1, got ' + gl.launchedDeaths);
    if (gl.killDeath !== 2) fail('recorder', 'kill:death must be 2, got ' + gl.killDeath);
    if (gl.vcDeathsW4plus !== 1) fail('recorder', 'vcDeaths secondary must be 1, got ' + gl.vcDeathsW4plus);
    if (gl.gateByResultW4.seek !== 2 || gl.gateByResultW4.null !== 1 || gl.gateByResultW4.avoid !== 1) fail('recorder', 'gate by result wrong: ' + JSON.stringify(gl.gateByResultW4));
    const m = gl.mechanisms;
    if (m.secondCompanionLaunches !== 1) fail('recorder', 'second-companion launches must be 1, got ' + m.secondCompanionLaunches);
    if (m.secondCompanionDeparts !== 1) fail('recorder', 'second-companion departs must be 1, got ' + m.secondCompanionDeparts);
    if (m.trickWaitRows !== 1) fail('recorder', 'trick-wait rows must be 1, got ' + m.trickWaitRows);
    if (m.trickWaitEpisodes !== 1 || m.trickWaitExpired !== 1) fail('recorder', 'trick-wait episodes must be 1/expired 1, got ' + m.trickWaitEpisodes + '/' + m.trickWaitExpired);
    if (m.repointRows !== 1) fail('recorder', 're-point rows must be 1, got ' + m.repointRows);
    if (m.gateRowsPlanCounted !== 1 || m.seeksPlanCounted !== 1) fail('recorder', 'plan-counted gate rows must be 1 / seeks 1, got ' + m.gateRowsPlanCounted + '/' + m.seeksPlanCounted);
    if (m.seeksLivedFought !== 1) fail('recorder', 'lived-fought SEEKs must be 1, got ' + m.seeksLivedFought);
    if (m.seeksTargetMatch !== 1) fail('recorder', 'target-match SEEKs must be 1, got ' + m.seeksTargetMatch);
    if (gl.perSeed['102101'].seeks !== 2 || gl.perSeed['102101'].launchedKills !== 2) fail('recorder', 'per-seed gatelever wrong: ' + JSON.stringify(gl.perSeed['102101']));
    if (legOut.pooled.instrumentErrors !== 0) fail('recorder', 'instrument errors must be 0, got ' + legOut.pooled.instrumentErrors);
    // Judge on the fixture legs: control (0 seeks/kills) vs lever
    // fixture — verdict NO-GO on the corpus bar (1 seed each).
    const ctrlOut = analyzer.analyzeGateleverLeg(dirC, w5set, w4plus);
    const j = analyzer.judgeGatelever(ctrlOut, legOut);
    if (j.gateSeeks.pass !== true) fail('recorder', 'fixture seeks bar must pass, got ' + JSON.stringify(j.gateSeeks));
    if (j.launchedPartyKills.pass !== true) fail('recorder', 'fixture kills bar must pass, got ' + JSON.stringify(j.launchedPartyKills));
    if (j.killDeath.pass !== true || j.killDeath.value !== 2) fail('recorder', 'fixture kill:death bar must pass at 2, got ' + JSON.stringify(j.killDeath));
    if (j.instrument.pass !== false) fail('recorder', 'fixture instrument bar must fail (1 seed), got ' + JSON.stringify(j.instrument));
    if (j.verdict !== 'NO-GO') fail('recorder', 'fixture verdict must be NO-GO (corpus), got ' + j.verdict);
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    try { fs.rmSync(dirC, { recursive: true, force: true }); } catch (e) {}
  }
  pass('recorder', { seeks: 2, launchedKills: 2, killDeath: 2, mechanisms: true });
}

if (kase === 'determinism-d2') {
  // Sub-case: ONE oneRun at DAYS, printing only the trajectory key
  // (deaths/days/endReason/standing/series + wave kills). The parent
  // determinism case spawns this twice (recorder ON vs OFF) and
  // compares the keys. Exits 0 after printing the key line.
  (async function () {
    const driver = require(path.join(__dirname, 'gatelever-driver-20261116.js'));
    const r = await driver.oneRun(seed, 'competent');
    const key = JSON.stringify({
      deaths: r.deaths, days: r.days, endReason: r.endReason,
      standing: r.standing, standingRaw: r.standingRaw,
      maxWave: r.maxWave, scaleRank: r.scaleRank, won: r.won,
      waveKills: r.waveKills, series: r.series,
    });
    out({ case: 'determinism-d2', pass: true, seed: seed, recorderOn: r.recorderOn, key: key, errors: (r.instrumentErrors || []).length });
    process.exit(0);
  })().catch(function (e) { fail('determinism-d2', 'threw: ' + (e && e.stack || e)); });
}

if (kase === 'determinism') (async function () {
  const driver = require(path.join(__dirname, 'gatelever-driver-20261116.js'));
  const days = parseInt(process.env.DAYS || '150', 10) || 150;
  // D1: repeatability — recorder ON, twice, identical full corpus.
  const a = await driver.oneRun(seed, 'competent');
  const b = await driver.oneRun(seed, 'competent');
  const key = function (r) {
    return JSON.stringify({
      deaths: r.deaths, days: r.days, endReason: r.endReason,
      standing: r.standing, standingRaw: r.standingRaw,
      maxWave: r.maxWave, scaleRank: r.scaleRank, won: r.won,
      waveKills: r.waveKills, series: r.series,
      w5encounters: r.w5encounters, w5gates: r.w5gates, w5seeds: r.w5seeds,
      w5departs: r.w5departs, grLaunches: r.grLaunches,
    });
  };
  if (key(a) !== key(b)) fail('determinism', 'D1: two runs on seed ' + seed + ' diverged', { a: { deaths: a.deaths.length, days: a.days, endReason: a.endReason, w5gates: a.w5gates.length }, b: { deaths: b.deaths.length, days: b.days, endReason: b.endReason, w5gates: b.w5gates.length } });
  if ((a.instrumentErrors || []).length) fail('determinism', 'D1 instrument errors on seed ' + seed + ': ' + JSON.stringify(a.instrumentErrors).slice(0, 400));
  if (a.recorderOn !== true) fail('determinism', 'D1 must run with the recorder ON, got ' + a.recorderOn);
  // Live check: every recorded gate row recomputes to its recorded
  // path and carries the gatelever fields.
  const analyzer = require(path.join(__dirname, 'analyze-gatereach2-b.js'));
  for (const g of (a.w5gates || [])) {
    if (!g.path) fail('determinism', 'live gate row missing path: ' + JSON.stringify(g).slice(0, 200));
    const recomputed = analyzer.classifyGatePath(g.caller || null, !!g.launch);
    if (g.path !== recomputed) fail('determinism', 'live gate row path ' + g.path + ' != recomputed ' + recomputed + ': ' + JSON.stringify(g).slice(0, 200));
    if (typeof g.partyFromPlan !== 'number' || typeof g.livedFought !== 'boolean') fail('determinism', 'live gate row missing gatelever fields: ' + JSON.stringify(g).slice(0, 200));
  }
  for (const s of (a.w5seeds || [])) {
    if (typeof s.repointed !== 'boolean') fail('determinism', 'live seed row missing repointed: ' + JSON.stringify(s).slice(0, 200));
  }
  // D2: wrap neutrality — recorder ON vs OFF, identical trajectories.
  // Spawned as sub-processes: RECORDER_ON is read at module load.
  function runD2(recorder) {
    const env = Object.assign({}, process.env);
    env.DAYS = String(days);
    if (recorder === 'off') env.GATELEVER_RECORDER = 'off';
    else delete env.GATELEVER_RECORDER;
    const r = execFileSync(process.execPath, [path.join(__dirname, 'test-gatelever-b.js'), String(seed), 'determinism-d2'], { cwd: repo, encoding: 'utf8', timeout: 900000, env: env });
    const lines = r.trim().split('\n').filter(Boolean);
    for (const l of lines) {
      try { const j = JSON.parse(l); if (j.case === 'determinism-d2') return j; } catch (e) {}
    }
    throw new Error('no determinism-d2 line in child output: ' + r.slice(0, 300));
  }
  const d2on = runD2('on');
  const d2off = runD2('off');
  if (d2on.key !== d2off.key) fail('determinism', 'D2: recorder ON vs OFF trajectories diverged on seed ' + seed);
  if (d2off.recorderOn !== false) fail('determinism', 'D2 OFF leg must run with the recorder OFF, got ' + d2off.recorderOn);
  if ((d2on.errors || 0) !== 0 || (d2off.errors || 0) !== 0) fail('determinism', 'D2 instrument errors: on=' + d2on.errors + ' off=' + d2off.errors);
  pass('determinism', { seed: seed, days: days, d1: 'identical', d2: 'identical', gateRows: (a.w5gates || []).length, w5encounters: a.w5encounters.length, w5seeds: a.w5seeds.length, grLaunches: a.grLaunches.length, deaths: a.deaths.length, endReason: a.endReason });
})().catch(function (e) { fail('determinism', 'threw: ' + (e && e.stack || e)); });
