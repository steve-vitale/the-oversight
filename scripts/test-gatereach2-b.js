#!/usr/bin/env node
// scripts/test-gatereach2-b.js — sim-gatereach2-b proof: the
// gate-consultation instrument (scripts/gatereach2-driver-20261116.js),
// the path + arrival classification and judge arithmetic
// (scripts/analyze-gatereach2-b.js), the drift smoke
// (scripts/gatereach2-drift-check.js), and the seed-call shape rule
// (re-land ONLY the vetparty seed call, verbatim; revert after).
//
// Cases (one fixture, one process per case — harness rule: never two
// harnesses in one node process at once). The 'all' runner spawns one
// child process per case and aggregates; exit 1 if any case fails.
// Each case prints one JSON line.
//   static        recorder wiring present in the driver (gateCaller,
//                 classifyGatePath, coveringLaunch, fighterExped,
//                 GATEREACH2_RECORDER, competent verbatim +
//                 POLICY_SHA); the frozen wave-4 id set matches
//                 src/data/monsters.json exactly (10 ids); the driver
//                 and analyzer classifyGatePath agree on every
//                 fixture row (one per path + precedence); the seed
//                 call shape matches GATEREACH2_SEED_CALL (on =
//                 present, verbatim block, src diff only game.js;
//                 off = absent, src diff 0 lines).
//   judge         judge() on synthetic pooled summaries: the GO shape
//                 (consult 1.00, arrival 1.00, 8/8 corpus, 0 errors)
//                 and one NO-GO fixture per bar (consult short,
//                 consult unknown, arrival short, arrival unknown,
//                 corpus short, errors), plus the boundary GO
//                 (0.90 / 0.90) and the zero-consultations NO-GO.
//   recorder      analyzeLeg + buildArrivals on synthetic per-seed
//                 fixtures in /tmp: gate-consultation rows by path
//                 and answer (incl. the wave-3 secondary count),
//                 launched-arrival rows (consulted SEEK / avoid /
//                 null, not-consulted encounter-with-no-gate-row,
//                 distinct meetings), the launch→gate→fight joins,
//                 and the path-mismatch / path-missing instrument
//                 errors on a second fixture dir.
//   determinism   D1: gatereach2 driver oneRun twice on seed 102001,
//                 60 days, recorder ON — identical full corpus keys
//                 (deaths/days/endReason/standing/series + recorder
//                 arrays incl. gate paths). D2: the same seed, 60d,
//                 recorder ON vs OFF (GATEREACH2_RECORDER=off, via
//                 the determinism-d2 sub-case) — identical
//                 trajectories. Live check: every recorded gate row
//                 recomputes to its recorded path.
// Usage: node scripts/test-gatereach2-b.js [seed] [case]
//   (DAYS env sets the determinism horizon; default 60.
//    GATEREACH2_SEED_CALL=off checks the post-revert shape.)
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync, execSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '102001');
const kase = process.argv[3] || 'all';
const SEED_CALL = process.env.GATEREACH2_SEED_CALL || 'on';
const BASE = '3322fb0df';

function out(o) { console.log(JSON.stringify(o)); }
function fail(k, detail, extra) { out(Object.assign({ case: k, pass: false, detail: detail }, extra || {})); process.exit(1); }
function pass(k, extra) { out(Object.assign({ case: k, pass: true }, extra || {})); process.exit(0); }

if (kase === 'all') {
  const cases = ['static', 'judge', 'recorder', 'determinism'];
  let allOk = true;
  for (const c of cases) {
    try {
      const env = Object.assign({}, process.env);
      if (c === 'determinism') env.DAYS = '60';
      const r = execFileSync(process.execPath, [path.join(__dirname, 'test-gatereach2-b.js'), String(seed), c], { cwd: repo, encoding: 'utf8', timeout: 900000, env: env });
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
  const drv = fs.readFileSync(path.join(repo, 'scripts', 'gatereach2-driver-20261116.js'), 'utf8');
  for (const needle of ['gateCaller', 'classifyGatePath', 'coveringLaunch', 'fighterExped', 'GATEREACH2_RECORDER', 'RECORDER_ON', 'POLICY_SHA', 'competent', 'grLaunches', 'launchCtx', 'w5gates']) {
    if (drv.indexOf(needle) < 0) fail('static', 'driver missing recorder piece: ' + needle);
  }
  if (drv.indexOf("arm: 'gatereach2-b'") < 0) fail('static', 'driver arm tag missing');
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
  const driver = require(path.join(__dirname, 'gatereach2-driver-20261116.js'));
  const analyzer = require(path.join(__dirname, 'analyze-gatereach2-b.js'));
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
    const b = analyzer.classifyGatePath(caller, hasLaunch);
    if (a !== want) fail('static', 'driver classifyGatePath(' + caller + ',' + hasLaunch + ') = ' + a + ', want ' + want);
    if (b !== want) fail('static', 'analyzer classifyGatePath(' + caller + ',' + hasLaunch + ') = ' + b + ', want ' + want);
  }
  // 4. Seed-call shape (GATEREACH2_SEED_CALL=on: present, verbatim,
  // src diff only game.js; =off: absent, src diff 0 lines).
  const gameJs = fs.readFileSync(path.join(repo, 'src', 'js', 'game.js'), 'utf8');
  const blockPresent = gameJs.indexOf('// VETPARTY (sim-vetparty-a): a villager who FACED a wave-4+ beast') !== -1 &&
    gameJs.indexOf("this.winPlanSeedFromFight(vid, mdef, 'fled');") !== -1;
  let srcFiles = [];
  try { srcFiles = execSync('git diff --name-only ' + BASE + ' HEAD -- src/', { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch (e) { fail('static', 'git diff failed: ' + e.message); }
  if (SEED_CALL === 'on') {
    if (!blockPresent) fail('static', 'seed call must be PRESENT on the instrument tip (GATEREACH2_SEED_CALL=on)');
    if (srcFiles.length !== 1 || srcFiles[0] !== 'src/js/game.js') fail('static', 'src diff vs base must be exactly src/js/game.js, got ' + JSON.stringify(srcFiles));
  } else if (SEED_CALL === 'off') {
    if (blockPresent) fail('static', 'seed call must be ABSENT post-revert (GATEREACH2_SEED_CALL=off)');
    if (srcFiles.length !== 0) fail('static', 'src diff vs base must be 0 lines post-revert, got ' + JSON.stringify(srcFiles));
  } else fail('static', 'unknown GATEREACH2_SEED_CALL value: ' + SEED_CALL);
  pass('static', { recorderWraps: true, w4ids: live4, w5ids: live5, classifierRows: rows.length, seedCall: SEED_CALL, srcFiles: srcFiles });
}

if (kase === 'judge') {
  const analyzer = require(path.join(__dirname, 'analyze-gatereach2-b.js'));
  if (typeof analyzer.judge !== 'function') fail('judge', 'judge not exported');
  const sum = function (cShare, cClass, cTotal, cUnk, aShare, aClass, aTotal, aUnk, errors, seeds, files, parse) {
    return { pooled: { instrumentErrors: errors, seeds: seeds, files: files, parseErrors: parse },
      gateConsultations: { share: cShare, classified: cClass, total: cTotal, unknown: cUnk },
      arrivals: { share: aShare, classified: aClass, total: aTotal, unknown: aUnk } };
  };
  const go = analyzer.judge(sum(1.0, 10, 10, 0, 1.0, 5, 5, 0, 0, 8, 8, 0), 8);
  if (go.verdict !== 'GO') fail('judge', 'GO shape must GO, got ' + JSON.stringify(go));
  const cShort = analyzer.judge(sum(0.85, 17, 20, 0, 1.0, 5, 5, 0, 0, 8, 8, 0), 8);
  if (cShort.verdict !== 'NO-GO' || cShort.consultationClassification.pass !== false) fail('judge', 'consult-short must fail the consultation bar, got ' + JSON.stringify(cShort));
  const cUnk = analyzer.judge(sum(1.0, 10, 10, 1, 1.0, 5, 5, 0, 0, 8, 8, 0), 8);
  if (cUnk.verdict !== 'NO-GO' || cUnk.consultationClassification.pass !== false) fail('judge', 'consult-unknown must fail the consultation bar, got ' + JSON.stringify(cUnk));
  const aShort = analyzer.judge(sum(1.0, 10, 10, 0, 0.8, 4, 5, 0, 0, 8, 8, 0), 8);
  if (aShort.verdict !== 'NO-GO' || aShort.arrivalClassification.pass !== false) fail('judge', 'arrival-short must fail the arrival bar, got ' + JSON.stringify(aShort));
  const aUnk = analyzer.judge(sum(1.0, 10, 10, 0, 1.0, 5, 5, 1, 0, 8, 8, 0), 8);
  if (aUnk.verdict !== 'NO-GO' || aUnk.arrivalClassification.pass !== false) fail('judge', 'arrival-unknown must fail the arrival bar, got ' + JSON.stringify(aUnk));
  const corpusShort = analyzer.judge(sum(1.0, 10, 10, 0, 1.0, 5, 5, 0, 0, 7, 7, 0), 8);
  if (corpusShort.verdict !== 'NO-GO' || corpusShort.corpusComplete.pass !== false) fail('judge', 'corpus-short must fail the corpus bar, got ' + JSON.stringify(corpusShort));
  const errOver = analyzer.judge(sum(1.0, 10, 10, 0, 1.0, 5, 5, 0, 1, 8, 8, 0), 8);
  if (errOver.verdict !== 'NO-GO' || errOver.instrumentErrors.pass !== false) fail('judge', 'errors must fail the errors bar, got ' + JSON.stringify(errOver));
  // Boundary: both shares exactly 0.90 -> GO.
  const edge = analyzer.judge(sum(0.90, 9, 10, 0, 0.90, 9, 10, 0, 0, 8, 8, 0), 8);
  if (edge.verdict !== 'GO') fail('judge', 'boundary shape must GO, got ' + JSON.stringify(edge));
  // Zero consultations: shares null -> NO-GO (nothing to validate).
  const zero = analyzer.judge(sum(null, 0, 0, 0, null, 0, 0, 0, 0, 8, 8, 0), 8);
  if (zero.verdict !== 'NO-GO' || zero.consultationClassification.pass !== null) fail('judge', 'zero-consultations must NO-GO on the consultation bar, got ' + JSON.stringify(zero));
  // Combined corpus bar: 16/16 passes, 15/16 fails.
  const combGo = analyzer.judge(sum(1.0, 10, 10, 0, 1.0, 5, 5, 0, 0, 16, 16, 0), 16);
  if (combGo.verdict !== 'GO') fail('judge', 'combined 16/16 shape must GO, got ' + JSON.stringify(combGo));
  const combShort = analyzer.judge(sum(1.0, 10, 10, 0, 1.0, 5, 5, 0, 0, 15, 15, 0), 16);
  if (combShort.verdict !== 'NO-GO' || combShort.corpusComplete.pass !== false) fail('judge', 'combined 15/16 must fail the corpus bar, got ' + JSON.stringify(combShort));
  pass('judge', { fixtures: 11 });
}

if (kase === 'recorder') {
  const analyzer = require(path.join(__dirname, 'analyze-gatereach2-b.js'));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gatereach2-test-'));
  try {
    const seriesA = [];
    for (let d = 1; d <= 150; d++) {
      seriesA.push({ d: d, w5: d >= 90 ? 2 : 0, vet5: d >= 80 ? 2 : 0, rd5ready: d >= 80, rd5short: d >= 80 ? [] : ['veterans'] });
    }
    const launch92 = { day: 92, source: 'brain', tx: 5, ty: 5, duration: 10 };
    const seedA = {
      seed: 102001, days: 150, endReason: 'survived', maxWave: 5, scaleRank: 'national', won: false,
      waveKills: { '5': 2 }, instrumentErrors: [],
      events: [{ day: 80, kind: 'unlockedWave', wave: 5 }],
      series: seriesA,
      deaths: [
        { day: 110, kind: 'villager', who: 'v1', cause: 'monster', player: false },
        { day: 66, kind: 'starvation', who: 'v5', cause: 'starved', player: false },
        { day: 105, kind: 'villager', who: 'v5', cause: 'monster', player: false },
      ],
      seatTakes: [],
      w5encounters: [
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, origin: 'expedition', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, allyExpedSharedN: 2, partyAtStart: 3, startMode: 'expedition-party', alliesN: 2, allyVids: ['v2', 'v3'], allyFromStart: false, gate: { result: 'seek', reason: 'seek', partySize: 3, allArmed: true, allArmored: true, trickKnown: true, planStage: 'hunt', planTarget: 'spoiler' }, outcome: 'vKill', rounds: 6, vTaken: 40, mDealt: 1200, calledHelp: true, allyVid: 'v2', fleeHpFrac: null, trickBefore: true, trickAfter: true, lines: [], log: ['v1 struck the Spoiler.'] },
        { day: 96, vid: 'v1', mid: 'spoiler', wave: 5, origin: 'expedition', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, allyExpedSharedN: 0, partyAtStart: 1, startMode: 'expedition-solo', alliesN: 0, allyVids: [], allyFromStart: false, gate: { result: 'null', reason: null, partySize: 1, allArmed: true, allArmored: true, trickKnown: false, planStage: 'hunt', planTarget: 'spoiler' }, outcome: 'vFlee', rounds: 4, vTaken: 60, mDealt: 100, calledHelp: false, allyVid: null, fleeHpFrac: 0.3, trickBefore: false, trickAfter: true, lines: [], log: ['v1 fled the Spoiler.'] },
        { day: 110, vid: 'v1', mid: 'editor', wave: 5, origin: 'world-tick', fighterExped: null, allyExpedSharedN: 0, partyAtStart: 1, startMode: 'worldtick-solo', alliesN: 0, allyVids: [], allyFromStart: false, gate: null, outcome: 'vDie', rounds: 3, vTaken: 100, mDealt: 15, calledHelp: false, allyVid: null, fleeHpFrac: 0.4, trickBefore: false, trickAfter: false, lines: [], log: ['v1 died to the Editor.'] },
      ],
      w5gates: [
        { day: 90, vid: 'v1', mid: 'spool', wave: 3, result: 'null', reason: null, partySize: 2, party: ['v1', 'v2'], sensedSize: 2, gateParty: null, allArmed: true, allArmored: true, gear: {}, trickKnown: false, planStage: 'hunt', planTarget: 'spoiler', planParty: [], needWave: 4, caller: 'expeditionMonster', path: 'expedition-ordinary', fighterExped: { tx: 5, ty: 5, sinceDay: 88, duration: 10 }, launch: null },
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, result: 'seek', reason: 'seek', partySize: 3, party: ['v1', 'v2', 'v3'], sensedSize: 3, gateParty: ['v1', 'v2', 'v3'], allArmed: true, allArmored: true, gear: {}, trickKnown: true, planStage: 'hunt', planTarget: 'spoiler', planParty: ['v2'], needWave: 5, caller: 'expeditionMonster', path: 'expedition-launched', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, launch: launch92 },
        { day: 96, vid: 'v1', mid: 'spoiler', wave: 5, result: 'null', reason: null, partySize: 1, party: ['v1'], sensedSize: 1, gateParty: null, allArmed: true, allArmored: true, gear: {}, trickKnown: false, planStage: 'hunt', planTarget: 'spoiler', planParty: ['v2'], needWave: 5, caller: 'expeditionMonster', path: 'expedition-launched', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, launch: launch92 },
        { day: 97, vid: 'v1', mid: 'editor', wave: 5, result: 'avoid', reason: 'outmatched', partySize: 2, party: ['v1', 'v2'], sensedSize: 2, gateParty: ['v1', 'v2'], allArmed: true, allArmored: true, gear: {}, trickKnown: false, planStage: 'party', planTarget: 'editor', planParty: [], needWave: 5, caller: 'expeditionMonster', path: 'expedition-launched', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, launch: launch92 },
        { day: 98, vid: 'v1', mid: 'strike', wave: 4, result: 'null', reason: null, partySize: 2, party: ['v1', 'v2'], sensedSize: 2, gateParty: null, allArmed: true, allArmored: false, gear: {}, trickKnown: false, planStage: 'party', planTarget: 'editor', planParty: [], needWave: null, caller: 'expeditionMonster', path: 'expedition-ordinary', fighterExped: { tx: 2, ty: 7, sinceDay: 96, duration: 8 }, launch: null },
        { day: 99, vid: 'v1', mid: 'audit', wave: 4, result: 'avoid', reason: 'veteran-guard', partySize: 2, party: ['v1', 'v2'], sensedSize: 2, gateParty: ['v1', 'v2'], allArmed: true, allArmored: true, gear: {}, trickKnown: true, planStage: 'table', planTarget: 'editor', planParty: [], needWave: 5, caller: 'expeditionMonster', path: 'expedition-launched', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, launch: launch92 },
      ],
      w5seeds: [
        { day: 110, vid: 'v1', mid: 'editor', wave: 5, outcome: 'fled', stageAfter: 'party', target: 'editor', node: { nx: 5, ny: 5 } },
      ],
      w5departs: [
        { day: 88, vid: 'v1', result: 'hold', source: 'brain', winPlanAction: 'party_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'party', target: 'spoiler', party: [], companions: null, targetWave: 5, holdSinceDay: 88, poolCensus: { eligible: 1, byReason: { dead: 0, away: 3, trust: 2, notAtHaven: 4, engaged: 0, profile: 1, exped: 0 }, rosterN: 12 } },
        { day: 92, vid: 'v1', result: 'launch', source: 'brain', winPlanAction: 'party_launch', companion: 'v2', companion2: null, companionsAvailable: null, needsFull: true, stage: 'hunt', target: 'spoiler', party: ['v2'], companions: 2, targetWave: 5 },
      ],
      grLaunches: [
        { day: 92, vid: 'v1', role: 'holder', ctxVid: 'v1', source: 'brain', launched: true, tx: 5, ty: 5, duration: 10, planTarget: 'spoiler', needWave: 5, stage: 'hunt', partyAfter: ['v2'] },
        { day: 92, vid: 'v2', role: 'companion', ctxVid: 'v1', source: 'brain', launched: true, tx: 5, ty: 5, duration: 10, planTarget: 'spoiler', needWave: 5, stage: 'hunt', partyAfter: ['v1'] },
        { day: 93, vid: 'v4', role: 'holder', ctxVid: 'v4', source: 'ordinary', launched: true, tx: 2, ty: 7, duration: 8, planTarget: null, needWave: null, stage: null, partyAfter: [] },
      ],
      wpEnd: { planSeeds: 2, avoidances: 2, seekContacts: 1, standingContacts: 0, partyDepartures: 1, partyFights: 1, trickHolds: 2, veteranGuardHolds: 1, partyWaits: 0, gearHolds: 0, plansN: 1, byStage: { hunt: 1 }, w5Targets: 1 },
    };
    const seedB = {
      seed: 102002, days: 120, endReason: 'village-lost', maxWave: 4, scaleRank: 'regional', won: false,
      waveKills: {}, instrumentErrors: [],
      events: [{ day: 60, kind: 'unlockedWave', wave: 4 }],
      series: [{ d: 1, w5: 0, vet5: 0, rd5ready: false, rd5short: [] }],
      deaths: [], seatTakes: [],
      w5encounters: [], w5gates: [], w5seeds: [], w5departs: [], grLaunches: [],
      wpEnd: { planSeeds: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 0, byStage: {}, w5Targets: 0 },
    };
    fs.writeFileSync(path.join(dir, 'gatereach2-b-s102001-test.json'), JSON.stringify(seedA));
    fs.writeFileSync(path.join(dir, 'gatereach2-b-s102002-test.json'), JSON.stringify(seedB));
    const w5k = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
    const w5set = new Set(w5k.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json')));
    const legOut = analyzer.analyzeLeg(dir, w5set);
    // Gate consultations: 5 wave-4+ rows (4 launched / 1 ordinary),
    // share 1.0, unknown 0; wave-3 row counted separately (1).
    const gc = legOut.gateConsultations;
    if (gc.total !== 5) fail('recorder', 'consultations must be 5, got ' + gc.total);
    if (gc.byPath['expedition-launched'] !== 4 || gc.byPath['expedition-ordinary'] !== 1) fail('recorder', 'consultations by path must be launched 4 / ordinary 1, got ' + JSON.stringify(gc.byPath));
    if (gc.share !== 1 || gc.unknown !== 0) fail('recorder', 'consultation share must be 1 / unknown 0, got ' + gc.share + ' / ' + gc.unknown);
    if (gc.wave3n !== 1) fail('recorder', 'wave-3 consultations must be 1, got ' + gc.wave3n);
    if (gc.byPathAnswer['expedition-launched|seek'] !== 1 || gc.byPathAnswer['expedition-launched|avoid:outmatched'] !== 1 || gc.byPathAnswer['expedition-launched|avoid:veteran-guard'] !== 1 || gc.byPathAnswer['expedition-launched|null'] !== 1) fail('recorder', 'consultations by path+answer wrong: ' + JSON.stringify(gc.byPathAnswer));
    if (gc.byWave[5] !== 3 || gc.byWave[4] !== 2) fail('recorder', 'consultations by wave must be {5:3, 4:2}, got ' + JSON.stringify(gc.byWave));
    // Launched arrivals: 5 gate rows in the v1 launch window
    // (92–102), all consulted; the v4 ordinary launch never
    // arrives. Distinct meetings 5, unknown 0.
    const ar = legOut.arrivals;
    if (ar.total !== 5) fail('recorder', 'arrivals must be 5, got ' + ar.total);
    if (ar.byConsult.consulted !== 5 || (ar.byConsult['not-consulted'] || 0) !== 0) fail('recorder', 'arrivals by consult must be consulted 5, got ' + JSON.stringify(ar.byConsult));
    if (ar.byAnswer.seek !== 1 || ar.byAnswer.null !== 2 || ar.byAnswer['avoid:outmatched'] !== 1 || ar.byAnswer['avoid:veteran-guard'] !== 1) fail('recorder', 'arrivals by answer wrong: ' + JSON.stringify(ar.byAnswer));
    if (ar.distinctMeetings !== 5) fail('recorder', 'distinct meetings must be 5, got ' + ar.distinctMeetings);
    if (ar.share !== 1 || ar.unknown !== 0) fail('recorder', 'arrival share must be 1 / unknown 0, got ' + ar.share + ' / ' + ar.unknown);
    const seekRow = ar.rows.find(function (r) { return r.answer === 'seek'; });
    if (!seekRow || seekRow.fightOutcome !== 'vKill' || seekRow.partySize !== 3 || seekRow.trickKnown !== true) fail('recorder', 'SEEK arrival row wrong: ' + JSON.stringify(seekRow));
    const avoidRow = ar.rows.find(function (r) { return r.answer === 'avoid:outmatched'; });
    if (!avoidRow || avoidRow.fightOutcome !== 'avoided-no-fight') fail('recorder', 'avoid arrival row must be avoided-no-fight, got ' + JSON.stringify(avoidRow));
    // Judge on the 2-seed fixture: consultation + arrival bars
    // pass, corpus bar fails (2 seeds, not 8) — expected.
    const j = analyzer.judge(legOut, 8);
    if (j.consultationClassification.pass !== true) fail('recorder', 'fixture consultation bar must pass, got ' + JSON.stringify(j));
    if (j.arrivalClassification.pass !== true) fail('recorder', 'fixture arrival bar must pass, got ' + JSON.stringify(j));
    if (j.instrumentErrors.pass !== true) fail('recorder', 'fixture errors bar must pass, got ' + JSON.stringify(j));
    if (j.corpusComplete.pass !== false) fail('recorder', 'fixture corpus bar must fail (2 seeds), got ' + JSON.stringify(j));
    if (j.verdict !== 'NO-GO') fail('recorder', 'fixture verdict must be NO-GO (corpus), got ' + j.verdict);
    if (legOut.pooled.instrumentErrors !== 0) fail('recorder', 'instrument errors must be 0, got ' + legOut.pooled.instrumentErrors);
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
  // Direct buildArrivals fixtures: the not-consulted case (an
  // expedition encounter for a launched holder with NO gate row for
  // the same vid/day/mid) and the launched-beats-ordinary precedence
  // (a gate row with no covering launch is ordinary, not launched).
  const direct = analyzer.buildArrivals(
    [{ seed: 1, vid: 'v1', role: 'holder', launched: true, day: 10, duration: 5, source: 'brain' }],
    [{ seed: 1, vid: 'v1', day: 12, mid: 'strike', wave: 4, result: 'null', reason: null, partySize: 2, trickKnown: false, planStage: 'party' }],
    [{ seed: 1, vid: 'v1', day: 13, mid: 'audit', wave: 4, origin: 'expedition', partyAtStart: 3, allyVids: ['v2', 'v3'], trickBefore: true, outcome: 'vFlee' }]);
  if (direct.rows.length !== 2) fail('recorder', 'direct arrivals must be 2, got ' + direct.rows.length);
  const nc = direct.rows.find(function (r) { return r.mid === 'audit'; });
  if (!nc || nc.classification !== 'not-consulted' || nc.gateConsulted !== false || nc.answer !== 'unknown' || nc.partySize !== 3 || nc.trickKnown !== true) fail('recorder', 'not-consulted arrival row wrong: ' + JSON.stringify(nc));
  const cc = direct.rows.find(function (r) { return r.mid === 'strike'; });
  if (!cc || cc.classification !== 'consulted' || cc.gateConsulted !== true || cc.answer !== 'null') fail('recorder', 'consulted arrival row wrong: ' + JSON.stringify(cc));
  if (direct.unknown !== 0 || direct.distinctMeetings !== 2) fail('recorder', 'direct arrivals must be unknown 0 / distinct 2, got ' + direct.unknown + ' / ' + direct.distinctMeetings);
  // Path-mismatch + path-missing instrument errors on a second dir.
  const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'gatereach2-test-mismatch-'));
  try {
    const bad = {
      seed: 102001, days: 150, endReason: 'survived', maxWave: 5, scaleRank: 'national', won: false,
      waveKills: { '5': 0 }, instrumentErrors: [],
      events: [{ day: 80, kind: 'unlockedWave', wave: 5 }],
      series: [{ d: 150, w5: 1, vet5: 0, rd5ready: false, rd5short: [] }],
      deaths: [], seatTakes: [],
      w5encounters: [], w5seeds: [], w5departs: [], grLaunches: [],
      w5gates: [
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, result: 'null', reason: null, partySize: 2, trickKnown: false, planStage: 'party', caller: 'expeditionMonster', path: 'expedition-launched', launch: null },
        { day: 96, vid: 'v1', mid: 'editor', wave: 5, result: 'null', reason: null, partySize: 2, trickKnown: false, planStage: 'party', caller: 'expeditionMonster', launch: null },
      ],
      wpEnd: { planSeeds: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 0, byStage: {}, w5Targets: 0 },
    };
    fs.writeFileSync(path.join(dir2, 'gatereach2-b-s102001-mismatch.json'), JSON.stringify(bad));
    const w5k2 = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
    const w5set2 = new Set(w5k2.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json')));
    const badOut = analyzer.analyzeLeg(dir2, w5set2);
    const rec = badOut.perSeed[0];
    if (rec.errors.filter(function (e) { return e.indexOf('gate-path-mismatch:') === 0; }).length !== 1) fail('recorder', 'mismatch fixture must flag exactly 1 gate-path-mismatch, got ' + JSON.stringify(rec.errors));
    if (rec.errors.filter(function (e) { return e.indexOf('gate-path-missing:') === 0; }).length !== 1) fail('recorder', 'mismatch fixture must flag exactly 1 gate-path-missing, got ' + JSON.stringify(rec.errors));
    if (badOut.pooled.instrumentErrors !== 2) fail('recorder', 'mismatch fixture must give instrumentErrors 2, got ' + badOut.pooled.instrumentErrors);
  } finally {
    try { fs.rmSync(dir2, { recursive: true, force: true }); } catch (e) {}
  }
  pass('recorder', { consultations: 5, arrivals: 5, directArrivals: 2, mismatchFlagged: true });
}

if (kase === 'determinism-d2') {
  // Sub-case: ONE oneRun at DAYS, printing only the trajectory key
  // (deaths/days/endReason/standing/series + wave kills). The parent
  // determinism case spawns this twice (recorder ON vs OFF) and
  // compares the keys. Exits 0 after printing the key line.
  (async function () {
    const driver = require(path.join(__dirname, 'gatereach2-driver-20261116.js'));
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
  const driver = require(path.join(__dirname, 'gatereach2-driver-20261116.js'));
  const days = parseInt(process.env.DAYS || '60', 10) || 60;
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
  // path (the wrap's classification is live, not fixture-only).
  const analyzer = require(path.join(__dirname, 'analyze-gatereach2-b.js'));
  for (const g of (a.w5gates || [])) {
    if (!g.path) fail('determinism', 'live gate row missing path: ' + JSON.stringify(g).slice(0, 200));
    const recomputed = analyzer.classifyGatePath(g.caller || null, !!g.launch);
    if (g.path !== recomputed) fail('determinism', 'live gate row path ' + g.path + ' != recomputed ' + recomputed + ': ' + JSON.stringify(g).slice(0, 200));
  }
  // D2: wrap neutrality — recorder ON vs OFF, identical trajectories.
  // Spawned as sub-processes: RECORDER_ON is read at module load.
  function runD2(recorder) {
    const env = Object.assign({}, process.env);
    env.DAYS = String(days);
    if (recorder === 'off') env.GATEREACH2_RECORDER = 'off';
    else delete env.GATEREACH2_RECORDER;
    const r = execFileSync(process.execPath, [path.join(__dirname, 'test-gatereach2-b.js'), String(seed), 'determinism-d2'], { cwd: repo, encoding: 'utf8', timeout: 900000, env: env });
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
