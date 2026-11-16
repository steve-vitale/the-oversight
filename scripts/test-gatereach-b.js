#!/usr/bin/env node
// scripts/test-gatereach-b.js — sim-gatereach-b proof: the
// gate-reachability instrument (scripts/gatereach-driver-20261115.js),
// the classification + judge arithmetic
// (scripts/analyze-gatereach-b.js), and the diagnostic-only rule
// (no game-code change in this arm).
//
// Cases (one fixture, one process per case — harness rule: never two
// harnesses in one node process at once). The 'all' runner spawns one
// child process per case and aggregates; exit 1 if any case fails.
// Each case prints one JSON line.
//   static        recorder wiring present in the driver (origin stamp,
//                 expedition membership, launch rows, wait pool census,
//                 extended depart rows); the frozen wave-5 id set
//                 matches src/data/monsters.json exactly; the driver
//                 and analyzer classifyStartMode agree on every
//                 fixture row; no src/ file is modified in the
//                 worktree (diagnostic only — no game-code change).
//   judge         judge() on synthetic pooled summaries: the GO shape
//                 (classified 1.00, 0 errors, 8/8 corpus, launch +
//                 episode shares 0.00) and one NO-GO fixture per bar
//                 (classified short, errors, corpus short, launch
//                 share over, episode share over), plus the boundary
//                 GO (0.90 / 0.10 / 0.10) and the zero-fights NO-GO.
//   recorder      analyzeLeg on synthetic per-seed fixtures in /tmp:
//                 classes, field vs TB split, field deaths from
//                 encounter rows vs the death log's killer field
//                 (the producergate §9.1 case: a vDie recorded the
//                 other way round counts in encounters, not in the
//                 log), start-mode classification + outcomes by mode,
//                 gate failing-condition decomposition, launch→gate→
//                 fight joins (arrival, days-to-gate, fights joined,
//                 failed departs), wait episodes with every end
//                 reason (launch / hold-expired / plan-changed /
//                 fighter-died / horizon), second-companion waits from
//                 the pool census, and the negative-TB instrument
//                 error on a second fixture dir.
//   determinism   gatereach driver oneRun twice on seed 100821,
//                 150 days (DAYS env): deaths, days, endReason, series
//                 length, and the recorder arrays (w5encounters,
//                 w5gates, w5seeds, w5departs, grLaunches) identical.
//                 The horizon is 150d (not 60d) so wave-4 fights
//                 exist and the origin stamp is proven live: every
//                 encounter row must carry a classified start mode
//                 (the progression.js deed wrap sits between the
//                 recorder and the real fieldFight — fightOrigin must
//                 walk past it to the real caller).
// Usage: node scripts/test-gatereach-b.js [seed] [case]
//   (DAYS env sets the determinism horizon; default 150.)
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync, execSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '100821');
const kase = process.argv[3] || 'all';

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
      const r = execFileSync(process.execPath, [path.join(__dirname, 'test-gatereach-b.js'), String(seed), c], { cwd: repo, encoding: 'utf8', timeout: 900000, env: env });
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
  const drv = fs.readFileSync(path.join(repo, 'scripts', 'gatereach-driver-20261115.js'), 'utf8');
  for (const needle of ['fightOrigin', 'classifyStartMode', 'grLaunches', 'companionPoolCensus', 'startExpedition', 'expedOf', 'launchCtx', 'poolCensus', 'allyExpedSharedN', 'fighterExped', 'w5encounters', 'w5gates', 'currentW5Fight']) {
    if (drv.indexOf(needle) < 0) fail('static', 'driver missing recorder piece: ' + needle);
  }
  if (drv.indexOf("arm: 'gatereach-b'") < 0) fail('static', 'driver arm tag missing');
  // 2. Frozen wave-5 id set matches the roster exactly.
  const w5k = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
  const live = w5k.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json'));
  const frozen = w5k.W5_IDS.slice().sort();
  if (JSON.stringify(live) !== JSON.stringify(frozen)) fail('static', 'wave-5 id set drifted: live ' + JSON.stringify(live) + ' vs frozen ' + JSON.stringify(frozen));
  // 3. Driver and analyzer classifyStartMode agree on every row shape.
  const driver = require(path.join(__dirname, 'gatereach-driver-20261115.js'));
  const analyzer = require(path.join(__dirname, 'analyze-gatereach-b.js'));
  const rows = [
    [{ origin: 'expedition', fighterExped: { tx: 5, ty: 5 }, allyExpedSharedN: 2, alliesN: 2 }, 'expedition-party'],
    [{ origin: 'expedition', fighterExped: { tx: 5, ty: 5 }, allyExpedSharedN: 0, alliesN: 0 }, 'expedition-solo'],
    [{ origin: 'expedition', fighterExped: null, allyExpedSharedN: 0, alliesN: 0 }, 'unclassified'],
    [{ origin: 'world-tick', fighterExped: null, allyExpedSharedN: 0, alliesN: 2 }, 'worldtick-party'],
    [{ origin: 'world-tick', fighterExped: null, allyExpedSharedN: 0, alliesN: 0 }, 'worldtick-solo'],
    [{ origin: 'patrol', fighterExped: null, allyExpedSharedN: 0, alliesN: 1 }, 'patrol-party'],
    [{ origin: 'patrol', fighterExped: null, allyExpedSharedN: 0, alliesN: 0 }, 'patrol-solo'],
    [{ origin: 'aid', fighterExped: null, allyExpedSharedN: 0, alliesN: 1 }, 'aid-party'],
    [{ origin: 'aid', fighterExped: null, allyExpedSharedN: 0, alliesN: 0 }, 'aid-solo'],
    [{ origin: 'other:aidFight', fighterExped: null, allyExpedSharedN: 0, alliesN: 1 }, 'other'],
    [{ origin: 'unclassified', fighterExped: null, allyExpedSharedN: 0, alliesN: 0 }, 'unclassified'],
    [{ origin: null, fighterExped: null, allyExpedSharedN: 0, alliesN: 0 }, 'unclassified'],
  ];
  for (const [row, want] of rows) {
    const a = driver.classifyStartMode(row);
    const b = analyzer.classifyStartMode(row);
    if (a !== want) fail('static', 'driver classifyStartMode(' + JSON.stringify(row) + ') = ' + a + ', want ' + want);
    if (b !== want) fail('static', 'analyzer classifyStartMode(' + JSON.stringify(row) + ') = ' + b + ', want ' + want);
  }
  // 4. Diagnostic only: no src/ file modified in the worktree.
  let dirty = '';
  try { dirty = execSync('git status --porcelain -- src/', { cwd: repo, encoding: 'utf8' }).trim(); } catch (e) { fail('static', 'git status failed: ' + e.message); }
  if (dirty) fail('static', 'diagnostic arm must not touch game code; src/ dirty: ' + dirty.slice(0, 300));
  pass('static', { recorderWraps: true, w5ids: live, classifierRows: rows.length, gameCodeTouched: false });
}

if (kase === 'judge') {
  const analyzer = require(path.join(__dirname, 'analyze-gatereach-b.js'));
  if (typeof analyzer.judge !== 'function') fail('judge', 'judge not exported');
  const sum = function (share, errors, seeds, files, parse, launchShare, launchN, epShare, epN) {
    return { pooled: { classifiedShare: share, w5classified: 0, w5fights: 0,
      instrumentErrors: errors, seeds: seeds, files: files, parseErrors: parse,
      launches: { launchUnknown: 0, launched: launchN, launchUnclassifiedShare: launchShare },
      waits: { episodeUnclassified: 0, episodes: epN, episodeUnclassifiedShare: epShare } } };
  };
  const go = analyzer.judge(sum(1.0, 0, 8, 8, 0, 0.0, 10, 0.0, 5));
  if (go.verdict !== 'GO') fail('judge', 'GO shape must GO, got ' + JSON.stringify(go));
  const clsShort = analyzer.judge(sum(0.85, 0, 8, 8, 0, 0.0, 10, 0.0, 5));
  if (clsShort.verdict !== 'NO-GO' || clsShort.classifiedShare.pass !== false) fail('judge', 'classified-short must fail the classified bar, got ' + JSON.stringify(clsShort));
  const errOver = analyzer.judge(sum(1.0, 1, 8, 8, 0, 0.0, 10, 0.0, 5));
  if (errOver.verdict !== 'NO-GO' || errOver.instrumentErrors.pass !== false) fail('judge', 'errors must fail the errors bar, got ' + JSON.stringify(errOver));
  const corpusShort = analyzer.judge(sum(1.0, 0, 7, 7, 0, 0.0, 10, 0.0, 5));
  if (corpusShort.verdict !== 'NO-GO' || corpusShort.corpusComplete.pass !== false) fail('judge', 'corpus-short must fail the corpus bar, got ' + JSON.stringify(corpusShort));
  const launchOver = analyzer.judge(sum(1.0, 0, 8, 8, 0, 0.2, 10, 0.0, 5));
  if (launchOver.verdict !== 'NO-GO' || launchOver.launchClassification.pass !== false) fail('judge', 'launch-share-over must fail the launch bar, got ' + JSON.stringify(launchOver));
  const epOver = analyzer.judge(sum(1.0, 0, 8, 8, 0, 0.0, 10, 0.15, 5));
  if (epOver.verdict !== 'NO-GO' || epOver.episodeClassification.pass !== false) fail('judge', 'episode-share-over must fail the episode bar, got ' + JSON.stringify(epOver));
  // Boundary: classified exactly 0.90, launch + episode exactly 0.10 -> GO.
  const edge = analyzer.judge(sum(0.90, 0, 8, 8, 0, 0.10, 10, 0.10, 10));
  if (edge.verdict !== 'GO') fail('judge', 'boundary shape must GO, got ' + JSON.stringify(edge));
  // Zero fights: classified share null -> NO-GO (nothing to validate).
  const zero = analyzer.judge(sum(null, 0, 8, 8, 0, null, 0, null, 0));
  if (zero.verdict !== 'NO-GO' || zero.classifiedShare.pass !== null) fail('judge', 'zero-fights must NO-GO on the classified bar, got ' + JSON.stringify(zero));
  pass('judge', { fixtures: 8 });
}

if (kase === 'recorder') {
  const analyzer = require(path.join(__dirname, 'analyze-gatereach-b.js'));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gatereach-test-'));
  let mainSummary = null;
  try {
    const seriesA = [];
    for (let d = 1; d <= 150; d++) {
      seriesA.push({ d: d, w5: d >= 90 ? 2 : 0, vet5: d >= 80 ? 2 : 0, rd5ready: d >= 80, rd5short: d >= 80 ? [] : ['veterans'] });
    }
    const seedA = {
      seed: 100821, days: 150, endReason: 'survived', maxWave: 5, scaleRank: 'national', won: false,
      waveKills: { '5': 2 }, instrumentErrors: [],
      events: [{ day: 80, kind: 'unlockedWave', wave: 5 }],
      series: seriesA,
      // The vDie field death is recorded the OTHER way round in the
      // death log (kind villager, who = victim) — the killer-field
      // count must miss it while the encounter-row count catches it.
      deaths: [
        { day: 110, kind: 'villager', who: 'v1', cause: 'monster', player: false },
        { day: 66, kind: 'starvation', who: 'v5', cause: 'starved', player: false },
        { day: 105, kind: 'villager', who: 'v5', cause: 'monster', player: false },
      ],
      seatTakes: [],
      w5encounters: [
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, origin: 'expedition', fighterExped: { tx: 5, ty: 5, sinceDay: 92, duration: 10 }, allyExpedSharedN: 2, partyAtStart: 3, startMode: 'expedition-party', alliesN: 2, allyVids: ['v2', 'v3'], allyFromStart: false, gate: { result: 'seek', reason: 'seek', partySize: 3, allArmed: true, allArmored: true, trickKnown: true, planStage: 'hunt', planTarget: 'spoiler' }, outcome: 'vKill', rounds: 6, vTaken: 40, mDealt: 1200, calledHelp: true, allyVid: 'v2', fleeHpFrac: null, trickBefore: true, trickAfter: true, lines: [], log: ['v1 struck the Spoiler.'] },
        { day: 110, vid: 'v1', mid: 'editor', wave: 5, origin: 'world-tick', fighterExped: null, allyExpedSharedN: 0, partyAtStart: 1, startMode: 'worldtick-solo', alliesN: 0, allyVids: [], allyFromStart: false, gate: null, outcome: 'vDie', rounds: 3, vTaken: 100, mDealt: 15, calledHelp: false, allyVid: null, fleeHpFrac: 0.4, trickBefore: false, trickAfter: false, lines: [], log: ['v1 died to the Editor.'] },
        { day: 120, vid: 'v1', mid: 'rerun', wave: 5, origin: 'world-tick', fighterExped: null, allyExpedSharedN: 0, partyAtStart: 2, startMode: 'worldtick-party', alliesN: 1, allyVids: ['v2'], allyFromStart: false, gate: null, outcome: 'vFlee', rounds: 4, vTaken: 60, mDealt: 100, calledHelp: true, allyVid: 'v2', fleeHpFrac: 0.3, trickBefore: false, trickAfter: true, lines: [], log: ['v1 fled the Rerun.'] },
        { day: 100, vid: 'v1', mid: 'cancellation', wave: 4, origin: 'patrol', fighterExped: null, allyExpedSharedN: 0, partyAtStart: 1, startMode: 'patrol-solo', alliesN: 0, allyVids: [], allyFromStart: false, gate: null, outcome: 'vFlee', rounds: 2, vTaken: 30, mDealt: 50, calledHelp: false, allyVid: null, fleeHpFrac: 0.5, trickBefore: false, trickAfter: false, lines: [], log: [] },
      ],
      w5gates: [
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, result: 'seek', reason: 'seek', partySize: 3, party: ['v1', 'v2', 'v3'], allArmed: true, allArmored: true, gear: {}, trickKnown: true, planStage: 'hunt', planTarget: 'spoiler', needWave: 4 },
        { day: 96, vid: 'v1', mid: 'spoiler', wave: 5, result: 'null', reason: null, partySize: 3, party: ['v1', 'v2', 'v3'], allArmed: true, allArmored: true, gear: {}, trickKnown: false, planStage: 'hunt', planTarget: 'spoiler', needWave: 4 },
        { day: 97, vid: 'v1', mid: 'editor', wave: 5, result: 'null', reason: null, partySize: 2, party: ['v1', 'v2'], allArmed: true, allArmored: true, gear: {}, trickKnown: true, planStage: 'party', planTarget: 'spoiler', needWave: null },
        { day: 98, vid: 'v1', mid: 'editor', wave: 5, result: 'avoid', reason: 'outmatched', partySize: 1, party: ['v1'], allArmed: true, allArmored: false, gear: {}, trickKnown: false, planStage: 'party', planTarget: 'editor', needWave: 4 },
      ],
      w5seeds: [
        { day: 110, vid: 'v1', mid: 'editor', wave: 5, outcome: 'fled', stageAfter: 'party', target: 'editor', node: { nx: 5, ny: 5 } },
      ],
      w5departs: [
        { day: 88, vid: 'v1', result: 'hold', source: 'brain', winPlanAction: 'party_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'party', target: 'spoiler', party: [], companions: null, targetWave: 5, holdSinceDay: 88, poolCensus: { eligible: 1, byReason: { dead: 0, away: 3, trust: 2, notAtHaven: 4, engaged: 0, profile: 1, exped: 0 }, rosterN: 12 } },
        { day: 89, vid: 'v1', result: 'hold', source: 'brain', winPlanAction: 'party_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'party', target: 'spoiler', party: [], companions: null, targetWave: 5, holdSinceDay: 88, poolCensus: { eligible: 1, byReason: { dead: 0, away: 3, trust: 2, notAtHaven: 4, engaged: 0, profile: 1, exped: 0 }, rosterN: 12 } },
        { day: 92, vid: 'v1', result: 'launch', source: 'brain', winPlanAction: 'party_launch', companion: 'v2', companion2: null, companionsAvailable: null, needsFull: true, stage: 'hunt', target: 'spoiler', party: ['v2'], companions: 2, targetWave: 5 },
        { day: 100, vid: 'v2', result: 'hold', source: 'brain', winPlanAction: 'party_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'party', target: 'editor', party: [], companions: null, targetWave: 5, holdSinceDay: 100, poolCensus: { eligible: 0, byReason: { dead: 0, away: 5, trust: 1, notAtHaven: 3, engaged: 0, profile: 2, exped: 0 }, rosterN: 12 } },
        { day: 101, vid: 'v2', result: 'hold', source: 'brain', winPlanAction: 'party_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'party', target: 'editor', party: [], companions: null, targetWave: 5, holdSinceDay: 100, poolCensus: { eligible: 0, byReason: { dead: 0, away: 5, trust: 1, notAtHaven: 3, engaged: 0, profile: 2, exped: 0 }, rosterN: 12 } },
        { day: 102, vid: 'v2', result: 'normal', source: 'brain', winPlanAction: 'party_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'party', target: 'editor', party: [], companions: null, targetWave: 5 },
        { day: 105, vid: 'v5', result: 'hold', source: 'brain', winPlanAction: 'party_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: false, stage: 'party', target: 'rerun', party: [], companions: null, targetWave: 4, holdSinceDay: 105, poolCensus: { eligible: 2, byReason: { dead: 0, away: 2, trust: 0, notAtHaven: 2, engaged: 0, profile: 1, exped: 0 }, rosterN: 9 } },
        { day: 110, vid: 'v6', result: 'hold', source: 'brain', winPlanAction: 'party_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'party', target: 'editor', party: [], companions: null, targetWave: 5, holdSinceDay: 110, poolCensus: { eligible: 1, byReason: { dead: 0, away: 1, trust: 1, notAtHaven: 1, engaged: 0, profile: 0, exped: 0 }, rosterN: 5 } },
        { day: 111, vid: 'v6', result: 'hold', source: 'brain', winPlanAction: 'party_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'party', target: 'editor', party: [], companions: null, targetWave: 5, holdSinceDay: 110, poolCensus: { eligible: 1, byReason: { dead: 0, away: 1, trust: 1, notAtHaven: 1, engaged: 0, profile: 0, exped: 0 }, rosterN: 5 } },
        { day: 112, vid: 'v6', result: 'normal', source: 'brain', winPlanAction: 'party_launch', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'standing', target: 'editor', party: [], companions: null, targetWave: 5 },
        { day: 140, vid: 'v3', result: 'hold', source: 'brain', winPlanAction: 'party_wait', companion: null, companion2: null, companionsAvailable: null, needsFull: true, stage: 'party', target: 'spoiler', party: [], companions: null, targetWave: 5, holdSinceDay: 140, poolCensus: { eligible: 0, byReason: { dead: 0, away: 4, trust: 2, notAtHaven: 2, engaged: 0, profile: 1, exped: 0 }, rosterN: 10 } },
      ],
      grLaunches: [
        { day: 92, vid: 'v1', role: 'holder', ctxVid: 'v1', source: 'brain', launched: true, tx: 5, ty: 5, duration: 10, planTarget: 'spoiler', needWave: 5, stage: 'hunt', partyAfter: ['v2'] },
        { day: 92, vid: 'v2', role: 'companion', ctxVid: 'v1', source: 'brain', launched: true, tx: 5, ty: 5, duration: 10, planTarget: 'spoiler', needWave: 5, stage: 'hunt', partyAfter: ['v1'] },
        { day: 93, vid: 'v4', role: 'holder', ctxVid: 'v4', source: 'ordinary', launched: true, tx: 2, ty: 7, duration: 8, planTarget: null, needWave: null, stage: null, partyAfter: [] },
        { day: 94, vid: 'v7', role: 'holder', ctxVid: 'v7', source: 'brain', launched: false, tx: null, ty: null, duration: null, planTarget: 'editor', needWave: 5, stage: 'party', partyAfter: [] },
      ],
      wpEnd: { planSeeds: 2, avoidances: 1, seekContacts: 1, standingContacts: 0, partyDepartures: 1, partyFights: 1, trickHolds: 1, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 1, byStage: { hunt: 1 }, w5Targets: 1 },
    };
    const seedB = {
      seed: 100822, days: 120, endReason: 'village-lost', maxWave: 4, scaleRank: 'regional', won: false,
      waveKills: {}, instrumentErrors: [],
      events: [{ day: 60, kind: 'unlockedWave', wave: 4 }],
      series: [{ d: 1, w5: 0, vet5: 0, rd5ready: false, rd5short: [] }],
      deaths: [], seatTakes: [],
      w5encounters: [], w5gates: [], w5seeds: [], w5departs: [], grLaunches: [],
      wpEnd: { planSeeds: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 0, byStage: {}, w5Targets: 0 },
    };
    fs.writeFileSync(path.join(dir, 'gatereach-b-s100821-test.json'), JSON.stringify(seedA));
    fs.writeFileSync(path.join(dir, 'gatereach-b-s100822-test.json'), JSON.stringify(seedB));
    const w5k = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
    const w5set = new Set(w5k.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json')));
    const legOut = analyzer.analyzeLeg(dir, w5set);
    const p = legOut.pooled;
    if (p.seeds !== 2) fail('recorder', 'seeds must be 2, got ' + p.seeds);
    if (p.unlocked !== 1) fail('recorder', 'unlocked must be 1, got ' + p.unlocked);
    if (p.classes.KILLED !== 1 || p.classes.LOCKED !== 1) fail('recorder', 'classes must be KILLED 1 + LOCKED 1, got ' + JSON.stringify(p.classes));
    if (p.totalKills !== 2 || p.fieldKills !== 1 || p.tbKills !== 1) fail('recorder', 'kills must be total 2 / field 1 / TB 1, got ' + p.totalKills + ' / ' + p.fieldKills + ' / ' + p.tbKills);
    // Field deaths: encounter rows say 1 (vDie), the death log's
    // killer field says 0 — the contrast the next bar needs.
    if (p.fieldDeathsW5 !== 1) fail('recorder', 'field deaths W5 must be 1, got ' + p.fieldDeathsW5);
    if (p.deathLogW5 !== 0) fail('recorder', 'death-log W5 must be 0, got ' + p.deathLogW5);
    if (p.killDeathField !== 1) fail('recorder', 'field kill:death must be 1, got ' + p.killDeathField);
    if (p.fieldDeathsW4 !== 0) fail('recorder', 'field deaths W4 must be 0, got ' + p.fieldDeathsW4);
    if (p.starvation !== 1) fail('recorder', 'starvation must be 1, got ' + p.starvation);
    if (p.wall.national !== 1 || p.wall.table !== 0 || p.wall.wins !== 0 || p.wall.wave5 !== 1) fail('recorder', 'wall numbers wrong: ' + JSON.stringify(p.wall));
    if (p.medianSurvivalAll !== 135) fail('recorder', 'median survival must be 135, got ' + p.medianSurvivalAll);
    // Start-mode classification.
    if (p.w5fights !== 3 || p.w5classified !== 3 || p.classifiedShare !== 1) fail('recorder', 'classified share must be 3/3 = 1, got ' + p.w5classified + '/' + p.w5fights + ' = ' + p.classifiedShare);
    const e5 = legOut.encounters.w5;
    if (e5.byStartMode['expedition-party'] !== 1 || e5.byStartMode['worldtick-solo'] !== 1 || e5.byStartMode['worldtick-party'] !== 1) fail('recorder', 'start modes must be 1/1/1, got ' + JSON.stringify(e5.byStartMode));
    if (e5.byPartyAtStart[3] !== 1 || e5.byPartyAtStart[1] !== 1 || e5.byPartyAtStart[2] !== 1) fail('recorder', 'party-at-start must be {3:1, 1:1, 2:1}, got ' + JSON.stringify(e5.byPartyAtStart));
    if (e5.seeks !== 1) fail('recorder', 'SEEK fights must be 1, got ' + e5.seeks);
    if (e5.allyJoinedMidFight !== 2) fail('recorder', 'allies joining mid-fight must be 2, got ' + e5.allyJoinedMidFight);
    if (e5.kills !== 1 || e5.deaths !== 1) fail('recorder', 'w5 kills/deaths must be 1/1, got ' + e5.kills + '/' + e5.deaths);
    const bm = legOut.encounters.w5byMode;
    if (!bm['expedition-party'] || bm['expedition-party'].vKill !== 1) fail('recorder', 'expedition-party must hold the kill, got ' + JSON.stringify(bm));
    if (!bm['worldtick-solo'] || bm['worldtick-solo'].vDie !== 1) fail('recorder', 'worldtick-solo must hold the death, got ' + JSON.stringify(bm));
    const e4 = legOut.encounters.w4;
    if (e4.n !== 1 || e4.byStartMode['patrol-solo'] !== 1) fail('recorder', 'w4 must be 1 patrol-solo, got ' + JSON.stringify(e4));
    // Gate failing-condition decomposition.
    const g = legOut.gates;
    if (g.w5n !== 4) fail('recorder', 'gate rows must be 4, got ' + g.w5n);
    if (g.byResult.seek !== 1 || g.byResult.null !== 2 || g.byResult.avoid !== 1) fail('recorder', 'gate results must be seek 1 / null 2 / avoid 1, got ' + JSON.stringify(g.byResult));
    if (g.byFail.seek !== 1 || g.byFail['null:trick-hold'] !== 1 || g.byFail['null:not-target'] !== 1 || g.byFail['avoid:outmatched'] !== 1) fail('recorder', 'gate fail conditions wrong: ' + JSON.stringify(g.byFail));
    if (g.trickKnown.known !== 2 || g.trickKnown.unknown !== 2) fail('recorder', 'trickKnown must be 2/2, got ' + JSON.stringify(g.trickKnown));
    // Launches: holder rows 3 (2 launched + 1 failed depart); gate
    // arrival 1 (v1, 3 days), not-arrived 1 (v4 ordinary); fight
    // joined 1 (v1's expedition-party fight).
    const L = p.launches;
    if (L.holderRows !== 3 || L.launched !== 2 || L.failedDeparts !== 1) fail('recorder', 'launches must be holders 3 / launched 2 / failed 1, got ' + JSON.stringify(L));
    if (L.bySource.brain !== 1 || L.bySource.ordinary !== 1) fail('recorder', 'launches by source must be brain 1 / ordinary 1, got ' + JSON.stringify(L.bySource));
    if (L.bySize[2] !== 1 || L.bySize[1] !== 1) fail('recorder', 'launches by size must be {2:1, 1:1}, got ' + JSON.stringify(L.bySize));
    if (L.gateArrived !== 1 || L.gateNotArrived !== 1) fail('recorder', 'gate arrivals must be 1/1, got ' + L.gateArrived + '/' + L.gateNotArrived);
    if (L.medianDaysToGate !== 3) fail('recorder', 'median days-to-gate must be 3, got ' + L.medianDaysToGate);
    if (L.fightsJoined !== 1) fail('recorder', 'fights joined must be 1, got ' + L.fightsJoined);
    if (L.launchUnknown !== 0 || L.launchUnclassifiedShare !== 0) fail('recorder', 'launch classification must be 0 unknown, got ' + JSON.stringify(L));
    if (L.arrivalBySource.brain.arrived !== 1 || L.arrivalBySource.ordinary.arrived !== 0) fail('recorder', 'arrival by source wrong: ' + JSON.stringify(L.arrivalBySource));
    // Waits + episodes: 8 wait rows, 4 second-companion waits,
    // 5 episodes ending launch / hold-expired / plan-changed /
    // fighter-died / horizon, median pool eligible 1.
    const W = p.waits;
    if (W.rows !== 8) fail('recorder', 'wait rows must be 8, got ' + W.rows);
    if (W.secondCompanionWaits !== 4) fail('recorder', 'second-companion waits must be 4, got ' + W.secondCompanionWaits);
    if (W.episodes !== 5) fail('recorder', 'episodes must be 5, got ' + W.episodes);
    if (W.byEnd.launch !== 1 || W.byEnd['hold-expired'] !== 1 || W.byEnd['plan-changed'] !== 1 || W.byEnd['fighter-died'] !== 1 || W.byEnd.horizon !== 1) fail('recorder', 'episode ends must be 1/1/1/1/1, got ' + JSON.stringify(W.byEnd));
    if (W.episodeUnclassified !== 0 || W.episodeUnclassifiedShare !== 0) fail('recorder', 'episode classification must be 0 unknown, got ' + JSON.stringify(W));
    if (W.medianPoolEligible !== 1) fail('recorder', 'median pool eligible must be 1, got ' + W.medianPoolEligible);
    if (W.poolByReason.away !== 24) fail('recorder', 'pool away count must be 24, got ' + JSON.stringify(W.poolByReason));
    // Judge on the 2-seed fixture: classification bars pass, corpus
    // bar fails (2 seeds, not 8) — expected for a fixture.
    const j = analyzer.judge(legOut);
    if (j.classifiedShare.pass !== true) fail('recorder', 'fixture classified bar must pass, got ' + JSON.stringify(j));
    if (j.instrumentErrors.pass !== true) fail('recorder', 'fixture errors bar must pass, got ' + JSON.stringify(j));
    if (j.launchClassification.pass !== true) fail('recorder', 'fixture launch bar must pass, got ' + JSON.stringify(j));
    if (j.episodeClassification.pass !== true) fail('recorder', 'fixture episode bar must pass, got ' + JSON.stringify(j));
    if (j.corpusComplete.pass !== false) fail('recorder', 'fixture corpus bar must fail (2 seeds), got ' + JSON.stringify(j));
    if (j.verdict !== 'NO-GO') fail('recorder', 'fixture verdict must be NO-GO (corpus), got ' + j.verdict);
    if (p.instrumentErrors !== 0) fail('recorder', 'instrument errors must be 0, got ' + p.instrumentErrors);
    mainSummary = { seeds: p.seeds, w5fights: p.w5fights, classifiedShare: p.classifiedShare, fieldDeathsW5: p.fieldDeathsW5, deathLogW5: p.deathLogW5, launches: L.launched, gateArrived: L.gateArrived, episodes: W.episodes };
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
  // Negative-TB instrument error: a recorded field kill with no
  // matching total kill means the residual goes negative and the
  // seed is flagged.
  const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'gatereach-test-neg-'));
  try {
    const bad = {
      seed: 100821, days: 150, endReason: 'survived', maxWave: 5, scaleRank: 'national', won: false,
      waveKills: { '5': 0 }, instrumentErrors: [],
      events: [{ day: 80, kind: 'unlockedWave', wave: 5 }],
      series: [{ d: 150, w5: 1, vet5: 0, rd5ready: false, rd5short: [] }],
      deaths: [], seatTakes: [],
      w5encounters: [
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, origin: 'world-tick', fighterExped: null, allyExpedSharedN: 0, partyAtStart: 2, startMode: 'worldtick-party', alliesN: 1, allyVids: ['v2'], gate: null, outcome: 'vKill', rounds: 6, vTaken: 40, mDealt: 1200, calledHelp: true, allyVid: 'v2', fleeHpFrac: null, trickBefore: true, trickAfter: true, lines: [], log: [] },
      ],
      w5gates: [], w5seeds: [], w5departs: [], grLaunches: [],
      wpEnd: { planSeeds: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 0, byStage: {}, w5Targets: 0 },
    };
    fs.writeFileSync(path.join(dir2, 'gatereach-b-s100821-neg.json'), JSON.stringify(bad));
    const w5k2 = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
    const w5set2 = new Set(w5k2.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json')));
    const neg = analyzer.analyzeLeg(dir2, w5set2);
    const rec = neg.perSeed[0];
    if (rec.tbKills !== -1) fail('recorder', 'negative-TB fixture must give tbKills -1, got ' + rec.tbKills);
    if (rec.errors.indexOf('negative-tb-kills') < 0) fail('recorder', 'negative-TB fixture must flag negative-tb-kills, got ' + JSON.stringify(rec.errors));
  } finally {
    try { fs.rmSync(dir2, { recursive: true, force: true }); } catch (e) {}
  }
  pass('recorder', Object.assign({}, mainSummary, { negativeTbFlagged: true }));
}

if (kase === 'determinism') (async function () {
  const driver = require(path.join(__dirname, 'gatereach-driver-20261115.js'));
  const a = await driver.oneRun(seed, 'competent-answercourt-b');
  const b = await driver.oneRun(seed, 'competent-answercourt-b');
  const key = function (r) {
    return JSON.stringify({
      deaths: r.deaths, days: r.days, endReason: r.endReason, seriesLen: r.series.length,
      w5encounters: r.w5encounters, w5gates: r.w5gates, w5seeds: r.w5seeds, w5departs: r.w5departs,
      grLaunches: r.grLaunches,
    });
  };
  if (key(a) !== key(b)) fail('determinism', 'two runs on seed ' + seed + ' diverged', { a: { deaths: a.deaths.length, days: a.days, endReason: a.endReason, w5enc: a.w5encounters.length, w5gates: a.w5gates.length, grLaunches: a.grLaunches.length }, b: { deaths: b.deaths.length, days: b.days, endReason: b.endReason, w5enc: b.w5encounters.length, w5gates: b.w5gates.length, grLaunches: b.grLaunches.length } });
  if ((a.instrumentErrors || []).length) fail('determinism', 'instrument errors on seed ' + seed + ': ' + JSON.stringify(a.instrumentErrors).slice(0, 400));
  // Origin stamp proven live: wave-4 fights exist by 150d and every
  // encounter row must carry a classified start mode (never 'other'
  // from the progression.js deed wrap, never 'unclassified').
  const classified = ['expedition-party', 'expedition-solo', 'worldtick-party', 'worldtick-solo', 'patrol-party', 'patrol-solo', 'aid-party', 'aid-solo'];
  if (!a.w5encounters.length) fail('determinism', 'seed ' + seed + ' at 150d must have wave-4+ encounters, got 0');
  for (const e of a.w5encounters) {
    if (classified.indexOf(e.startMode) === -1) fail('determinism', 'encounter row has unclassified startMode ' + e.startMode + ' (origin ' + e.origin + ', mid ' + e.mid + ', wave ' + e.wave + ')');
  }
  if (!a.w5encounters.some(function (e) { return e.origin === 'world-tick'; })) fail('determinism', 'seed ' + seed + ' must show at least one world-tick origin, got ' + JSON.stringify(a.w5encounters.map(function (e) { return e.origin; })));
  pass('determinism', { seed: seed, days: a.days, deaths: a.deaths.length, endReason: a.endReason, w5encounters: a.w5encounters.length, w5gates: a.w5gates.length, w5seeds: a.w5seeds.length, w5departs: a.w5departs.length, grLaunches: a.grLaunches.length, originsClassified: true });
})().catch(function (e) { fail('determinism', 'threw: ' + (e && e.stack || e)); });
