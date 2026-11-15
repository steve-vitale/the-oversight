#!/usr/bin/env node
// scripts/test-producergate-b.js — sim-producergate-b proof: the
// per-encounter recorder (scripts/producergate-driver-20261115.js),
// the judge arithmetic (scripts/analyze-producergate-b.js), and the
// Producer gate/expedition-meeting link lever:
//   half A — the wild-fight win-plan seed, re-landed
//     (src/js/game.js resolveWildMonsterEncounter —
//     vFlee -> winPlanSeedFromFight);
//   half B — the two-companion launch for wave-4+ plans
//     (src/js/villager-brain.js winPlanCands + vbrainExecuteDepart,
//     src/js/win-plan.js winPlanDepart.launchParty + findCompanion).
//
// Cases (one fixture, one process per case — harness rule: never two
// harnesses in one node process at once). The 'all' runner spawns one
// child process per case and aggregates; exit 1 if any case fails.
// Each case prints one JSON line.
//   static        recorder wiring present in the driver (five wraps +
//                 w5 output fields + depart companions fields); the
//                 frozen wave-5 id set matches src/data/monsters.json
//                 exactly; the lever static check (game-code diff is
//                 the lever hunks only, exactly src/js/game.js +
//                 src/js/win-plan.js + src/js/villager-brain.js, no
//                 standing/gate/table touch — runs once the lever
//                 commit exists; skipped with a note before then).
//   judge         judge() on synthetic pooled summaries: the GO shape
//                 (field >= 1.00, TB >= 0.5x control, ratio >= 0.92,
//                 fnk <= 0.20, starvation tripwire, survival >= 0.8x)
//                 and one NO-GO fixture per bar (field short, TB
//                 collapse, ratio short, fnk over, starvation over,
//                 survival short), plus the zero-deaths ratio pass and
//                 the boundary GO.
//   recorder      analyzeLeg on synthetic per-seed fixtures in /tmp:
//                 classes (KILLED + LOCKED), field vs TB kill split
//                 (field 1 / TB 1 of 2 total), kills per unlocked,
//                 kill:death, fnk share, starvation count, wall
//                 numbers, encounter summary (party sizes, outcomes),
//                 gate decomposition (seek vs avoid/outmatched, trick
//                 state), plan-seed and depart counts incl. launched
//                 party size + second-companion waits, win-plan sums,
//                 and the negative-TB instrument error on a second
//                 fixture dir.
//   determinism   producergate driver oneRun twice on seed 100781,
//                 60 days (DAYS env): deaths, days, endReason, series
//                 length, and the recorder arrays (w5encounters,
//                 w5gates, w5seeds, w5departs) identical.
// Usage: node scripts/test-producergate-b.js [seed] [case]
//   (DAYS env sets the determinism horizon; default 60.)
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync, execSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '100781');
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
      if (c === 'determinism') env.DAYS = '60';
      const r = execFileSync(process.execPath, [path.join(__dirname, 'test-producergate-b.js'), String(seed), c], { cwd: repo, encoding: 'utf8', timeout: 900000, env: env });
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
  const drv = fs.readFileSync(path.join(repo, 'scripts', 'producergate-driver-20261115.js'), 'utf8');
  for (const needle of ['winPlanFightGate', 'winPlanSeedFromFight', 'winPlanDepart', 'vbrainExecuteDepart', 'origFF', 'w5encounters', 'w5gates', 'currentW5Fight', 'companions', 'needsFullOf', 'companion2', 'companionsAvailable']) {
    if (drv.indexOf(needle) < 0) fail('static', 'driver missing recorder piece: ' + needle);
  }
  if (drv.indexOf("arm: 'producergate-b'") < 0) fail('static', 'driver arm tag missing');
  // 2. Frozen wave-5 id set matches the roster exactly.
  const w5k = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
  const live = w5k.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json'));
  const frozen = w5k.W5_IDS.slice().sort();
  if (JSON.stringify(live) !== JSON.stringify(frozen)) fail('static', 'wave-5 id set drifted: live ' + JSON.stringify(live) + ' vs frozen ' + JSON.stringify(frozen));
  // 3. Lever static check — runs once the lever commit exists. Before
  // then, the recorder-only tree has no lever to check; record that
  // explicitly instead of failing vacuously. The lever is the
  // gate/expedition-meeting link: half A re-lands the wild-fight seed
  // in resolveWildMonsterEncounter (src/js/game.js, PRODUCERGATE
  // marker), half B launches two companions for wave-4+ plans
  // (win-plan.js + villager-brain.js, companion2). NOTE: the
  // producerparty seed commit a02156ca carries the PRODUCERPARTY
  // marker, not PRODUCERGATE — the -S search below finds only this
  // arm's re-land, never the reverted pilot commit.
  let lever = '';
  try { lever = execSync("git log --format=%H -S 'PRODUCERGATE' -- src/js/game.js | tail -1", { cwd: repo, encoding: 'utf8' }).trim(); } catch (e) { lever = ''; }
  if (!lever) {
    pass('static', { recorderWraps: true, w5ids: live, lever: 'not-built-yet' });
  }
  const base = lever + '^';
  let changed = [];
  try { changed = execSync('git diff ' + base + ' ' + lever + ' --name-only', { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch (e) { fail('static', 'git diff failed: ' + e.message); }
  const srcChanged = changed.filter(function (f) { return f.indexOf('src/') === 0; }).sort();
  const wantSrc = ['src/js/game.js', 'src/js/villager-brain.js', 'src/js/win-plan.js'].sort();
  if (JSON.stringify(srcChanged) !== JSON.stringify(wantSrc)) fail('static', 'lever src change must be exactly ' + wantSrc.join(', ') + ', got: ' + srcChanged.join(','));
  let diff = '';
  try { diff = execSync('git diff ' + base + ' ' + lever, { cwd: repo, encoding: 'utf8' }); } catch (e) { fail('static', 'git diff failed: ' + e.message); }
  if (/villageStandingTotal|deedGateReady|waveCombatReadiness|standingCfg/.test(diff)) fail('static', 'lever diff touches standing/gate numbers');
  if (/tableTakeSeat|chooseTableOption/.test(diff)) fail('static', 'lever diff touches the table');
  if (diff.indexOf('winPlanSeedFromFight') < 0) fail('static', 'lever diff must call winPlanSeedFromFight (half A)');
  if (diff.indexOf('vFlee') < 0) fail('static', 'lever diff must gate the seed on the vFlee outcome (half A)');
  if (diff.indexOf('companion2') < 0) fail('static', 'lever diff must launch a second companion (half B)');
  if (diff.indexOf('planNeedsFullParty') < 0 && diff.indexOf('needsFull') < 0) fail('static', 'lever diff must gate the two-companion launch on wave-4+ targets (half B)');
  pass('static', { recorderWraps: true, w5ids: live, lever: lever.slice(0, 12), srcChanged: srcChanged });
}

if (kase === 'judge') {
  const analyzer = require(path.join(__dirname, 'analyze-producergate-b.js'));
  if (typeof analyzer.judge !== 'function') fail('judge', 'judge not exported');
  const leg = function (field, tb, ratio, fnk, starv, surv, totKills, totDeaths) {
    return { pooled: { fieldKillsPerUnlocked: field, tbKillsPerUnlocked: tb, killDeathRatio: ratio, fnkShare: fnk, starvation: starv, medianSurvivalAll: surv, totalKills: totKills, totalDeathsW5: totDeaths } };
  };
  // GO shape: field 1.50 vs bar 1.00, TB 0.50 vs control 0.50 (1.0x),
  // ratio 1.20, fnk 0.00, starvation 1 vs 0 (<= 2), survival 150 vs 150.
  const go = analyzer.judge(leg(0.33, 0.50, 1.00, 0.33, 0, 150, 1, 1), leg(1.50, 0.50, 1.20, 0.00, 1, 150, 3, 2));
  if (go.verdict !== 'GO') fail('judge', 'GO shape must GO, got ' + JSON.stringify(go));
  // Each bar fails alone.
  const fieldShort = analyzer.judge(leg(0.33, 0.50, 1.00, 0.33, 0, 150, 1, 1), leg(0.50, 0.50, 1.20, 0.00, 1, 150, 2, 1));
  if (fieldShort.verdict !== 'NO-GO' || fieldShort.fieldKillsPerUnlocked.pass !== false) fail('judge', 'field-short must fail the field bar, got ' + JSON.stringify(fieldShort));
  const tbCollapse = analyzer.judge(leg(0.33, 0.50, 1.00, 0.33, 0, 150, 1, 1), leg(1.50, 0.20, 1.20, 0.00, 1, 150, 3, 2));
  if (tbCollapse.verdict !== 'NO-GO' || tbCollapse.tbKillsPerUnlocked.pass !== false) fail('judge', 'TB-collapse must fail the TB bar, got ' + JSON.stringify(tbCollapse));
  const ratioShort = analyzer.judge(leg(0.33, 0.50, 1.00, 0.33, 0, 150, 1, 1), leg(1.50, 0.50, 0.80, 0.00, 1, 150, 3, 4));
  if (ratioShort.verdict !== 'NO-GO' || ratioShort.killDeathRatio.pass !== false) fail('judge', 'ratio-short must fail the ratio bar, got ' + JSON.stringify(ratioShort));
  const fnkOver = analyzer.judge(leg(0.33, 0.50, 1.00, 0.33, 0, 150, 1, 1), leg(1.50, 0.50, 1.20, 0.33, 1, 150, 3, 2));
  if (fnkOver.verdict !== 'NO-GO' || fnkOver.fnkShare.pass !== false) fail('judge', 'fnk-over must fail the fnk bar, got ' + JSON.stringify(fnkOver));
  const starvOver = analyzer.judge(leg(0.33, 0.50, 1.00, 0.33, 0, 150, 1, 1), leg(1.50, 0.50, 1.20, 0.00, 3, 150, 3, 2));
  if (starvOver.verdict !== 'NO-GO' || starvOver.starvation.pass !== false) fail('judge', 'starvation-over must fail the tripwire, got ' + JSON.stringify(starvOver));
  const survShort = analyzer.judge(leg(0.33, 0.50, 1.00, 0.33, 0, 150, 1, 1), leg(1.50, 0.50, 1.20, 0.00, 1, 100, 3, 2));
  if (survShort.verdict !== 'NO-GO' || survShort.medianSurvival.pass !== false) fail('judge', 'survival-short must fail the survival bar, got ' + JSON.stringify(survShort));
  // Zero deaths with kills: the ratio bar passes (nothing died).
  const zeroDeaths = analyzer.judge(leg(0.33, 0.50, 1.00, 0.33, 0, 150, 1, 1), leg(1.50, 0.50, null, 0.00, 1, 150, 3, 0));
  if (zeroDeaths.verdict !== 'GO' || zeroDeaths.killDeathRatio.pass !== true) fail('judge', 'kills with zero deaths must pass the ratio bar, got ' + JSON.stringify(zeroDeaths));
  // TB bar vacuous when the control leg unlocked nothing (tb null).
  const noControlUnlock = analyzer.judge(leg(0.33, null, null, null, 0, 150, 0, 0), leg(1.50, 0.50, 1.20, 0.00, 1, 150, 3, 2));
  if (noControlUnlock.verdict !== 'GO' || noControlUnlock.tbKillsPerUnlocked.pass !== true) fail('judge', 'null control TB must pass the TB bar vacuously, got ' + JSON.stringify(noControlUnlock));
  // Boundary: field exactly 1.00, TB exactly 0.5x, ratio exactly 0.92,
  // fnk exactly 0.20, starvation exactly control+2, survival exactly
  // 0.8x -> GO.
  const edge = analyzer.judge(leg(0.33, 0.50, 1.00, 0.33, 3, 125, 1, 1), leg(1.00, 0.25, 0.92, 0.20, 5, 100, 2, 2));
  if (edge.verdict !== 'GO') fail('judge', 'boundary shape must GO, got ' + JSON.stringify(edge));
  pass('judge', { fixtures: 10 });
}

if (kase === 'recorder') {
  const analyzer = require(path.join(__dirname, 'analyze-producergate-b.js'));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'producergate-test-'));
  try {
    const seriesA = [];
    for (let d = 1; d <= 150; d++) {
      seriesA.push({ d: d, w5: d >= 90 ? 2 : 0, vet5: d >= 80 ? 2 : 0, rd5ready: d >= 80, rd5short: d >= 80 ? [] : ['veterans'] });
    }
    const seedA = {
      seed: 100781, days: 150, endReason: 'survived', maxWave: 5, scaleRank: 'national', won: false,
      waveKills: { '5': 2 }, instrumentErrors: [],
      events: [{ day: 80, kind: 'unlockedWave', wave: 5 }],
      series: seriesA,
      deaths: [
        { day: 100, kind: 'combat', who: 'spoiler', cause: 'monster', player: false },
        { day: 66, kind: 'starvation', who: 'villager', cause: 'starved', player: false },
      ],
      seatTakes: [],
      w5encounters: [
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, alliesN: 2, allyVids: ['v2', 'v3'], allyFromStart: false, gate: { result: 'seek', reason: 'seek', partySize: 3, allArmed: true, allArmored: true, trickKnown: true, planStage: 'hunt', planTarget: 'spoiler' }, outcome: 'vKill', rounds: 6, vTaken: 40, mDealt: 1200, calledHelp: true, allyVid: 'v2', fleeHpFrac: null, trickBefore: true, trickAfter: true, lines: [], log: ['v1 struck the Spoiler.'] },
        { day: 110, vid: 'v1', mid: 'editor', wave: 5, alliesN: 0, allyVids: [], allyFromStart: false, gate: { result: 'avoid', reason: 'outmatched', partySize: 1, allArmed: true, allArmored: false, trickKnown: false, planStage: 'party', planTarget: 'editor' }, outcome: 'vFlee', rounds: 3, vTaken: 60, mDealt: 100, calledHelp: false, allyVid: null, fleeHpFrac: 0.4, trickBefore: false, trickAfter: false, lines: [], log: ['v1 fled the Editor.'] },
      ],
      w5gates: [
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, result: 'seek', reason: 'seek', partySize: 3, party: ['v1', 'v2', 'v3'], allArmed: true, allArmored: true, gear: {}, trickKnown: true, planStage: 'hunt', planTarget: 'spoiler', needWave: 4 },
        { day: 110, vid: 'v1', mid: 'editor', wave: 5, result: 'avoid', reason: 'outmatched', partySize: 1, party: ['v1'], allArmed: true, allArmored: false, gear: {}, trickKnown: false, planStage: 'party', planTarget: 'editor', needWave: 4 },
      ],
      w5seeds: [
        { day: 110, vid: 'v1', mid: 'editor', wave: 5, outcome: 'fled', stageAfter: 'party', target: 'editor', node: { nx: 5, ny: 5 } },
      ],
      w5departs: [
        { day: 92, vid: 'v1', result: 'launch', source: 'brain', winPlanAction: 'party_launch', companion: 'v2', companion2: 'v3', companionsAvailable: 2, needsFull: true, stage: 'hunt', target: 'spoiler', party: ['v2', 'v3'], companions: 3, targetWave: 5 },
        { day: 88, vid: 'v1', result: 'hold', source: 'brain', winPlanAction: 'party_wait', companion: 'v2', companion2: null, companionsAvailable: 1, needsFull: true, stage: 'party', target: 'spoiler', party: [], companions: null, targetWave: 5 },
      ],
      wpEnd: { planSeeds: 2, avoidances: 1, seekContacts: 1, standingContacts: 0, partyDepartures: 1, partyFights: 1, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 1, byStage: { hunt: 1 }, w5Targets: 1 },
    };
    const seedB = {
      seed: 100782, days: 120, endReason: 'village-lost', maxWave: 4, scaleRank: 'regional', won: false,
      waveKills: {}, instrumentErrors: [],
      events: [{ day: 60, kind: 'unlockedWave', wave: 4 }],
      series: [{ d: 1, w5: 0, vet5: 0, rd5ready: false, rd5short: [] }],
      deaths: [], seatTakes: [],
      w5encounters: [], w5gates: [], w5seeds: [], w5departs: [],
      wpEnd: { planSeeds: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 0, byStage: {}, w5Targets: 0 },
    };
    fs.writeFileSync(path.join(dir, 'producergate-b-s100781-test.json'), JSON.stringify(seedA));
    fs.writeFileSync(path.join(dir, 'producergate-b-s100782-test.json'), JSON.stringify(seedB));
    const w5k = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
    const w5set = new Set(w5k.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json')));
    const legOut = analyzer.analyzeLeg(dir, w5set);
    const p = legOut.pooled;
    if (p.seeds !== 2) fail('recorder', 'seeds must be 2, got ' + p.seeds);
    if (p.unlocked !== 1) fail('recorder', 'unlocked must be 1, got ' + p.unlocked);
    if (p.classes.KILLED !== 1 || p.classes.LOCKED !== 1) fail('recorder', 'classes must be KILLED 1 + LOCKED 1, got ' + JSON.stringify(p.classes));
    if (p.totalKills !== 2 || p.killsPerUnlocked !== 2) fail('recorder', 'kills must be 2 / 2 per unlocked, got ' + p.totalKills + ' / ' + p.killsPerUnlocked);
    if (p.fieldKills !== 1 || p.fieldKillsPerUnlocked !== 1) fail('recorder', 'field kills must be 1 / 1 per unlocked, got ' + p.fieldKills + ' / ' + p.fieldKillsPerUnlocked);
    if (p.tbKills !== 1 || p.tbKillsPerUnlocked !== 1) fail('recorder', 'TB kills must be 1 / 1 per unlocked, got ' + p.tbKills + ' / ' + p.tbKillsPerUnlocked);
    if (p.totalDeathsW5 !== 1 || p.killDeathRatio !== 2) fail('recorder', 'kill:death must be 2/1 = 2, got ' + p.totalDeathsW5 + ' / ' + p.killDeathRatio);
    if (p.fnkShare !== 0) fail('recorder', 'fnk share must be 0, got ' + p.fnkShare);
    if (p.starvation !== 1) fail('recorder', 'starvation must be 1, got ' + p.starvation);
    if (p.wall.national !== 1 || p.wall.table !== 0 || p.wall.wins !== 0 || p.wall.wave5 !== 1) fail('recorder', 'wall numbers wrong: ' + JSON.stringify(p.wall));
    if (p.medianSurvivalAll !== 135) fail('recorder', 'median survival must be 135, got ' + p.medianSurvivalAll);
    const e5 = legOut.encounters.w5;
    if (e5.n !== 2) fail('recorder', 'w5 encounters must be 2, got ' + e5.n);
    if (e5.byPartySize[3] !== 1 || e5.byPartySize[1] !== 1) fail('recorder', 'party sizes must be {3:1, 1:1}, got ' + JSON.stringify(e5.byPartySize));
    if (e5.byOutcome.vKill !== 1 || e5.byOutcome.vFlee !== 1) fail('recorder', 'outcomes must be vKill 1 + vFlee 1, got ' + JSON.stringify(e5.byOutcome));
    if (e5.byGate.seek !== 1 || e5.byGate.avoid !== 1) fail('recorder', 'gate results must be seek 1 + avoid 1, got ' + JSON.stringify(e5.byGate));
    const bp = legOut.encounters.w5byParty;
    if (!bp[3] || bp[3].vKill !== 1) fail('recorder', 'party-of-3 must hold the kill, got ' + JSON.stringify(bp));
    if (!bp[1] || bp[1].vFlee !== 1) fail('recorder', 'solo must hold the flee, got ' + JSON.stringify(bp));
    const g = legOut.gates;
    if (g.w5n !== 2 || g.byResult.seek !== 1 || g.byResult.avoid !== 1) fail('recorder', 'gate rows wrong: ' + JSON.stringify(g));
    if (g.byReason['avoid:outmatched'] !== 1) fail('recorder', 'avoid:outmatched must be 1, got ' + JSON.stringify(g.byReason));
    if (g.trickKnown.known !== 1 || g.trickKnown.unknown !== 1) fail('recorder', 'trickKnown must be 1/1, got ' + JSON.stringify(g.trickKnown));
    if (g.planStages.hunt !== 1 || g.planStages.party !== 1) fail('recorder', 'gate plan stages wrong: ' + JSON.stringify(g.planStages));
    if (legOut.seeds.w5n !== 1 || legOut.seeds.byOutcome.fled !== 1) fail('recorder', 'plan seeds wrong: ' + JSON.stringify(legOut.seeds));
    const dp = legOut.departs;
    if (dp.n !== 2 || dp.byResult.launch !== 1 || dp.byResult.hold !== 1) fail('recorder', 'departs wrong: ' + JSON.stringify(dp));
    if (dp.launchByPartySize[3] !== 1) fail('recorder', 'launches as 3 must be 1, got ' + JSON.stringify(dp.launchByPartySize));
    if (dp.launchByPartySizeFull[3] !== 1) fail('recorder', 'wave-4+ launches as 3 must be 1, got ' + JSON.stringify(dp.launchByPartySizeFull));
    if (dp.launchBySource.brain !== 1) fail('recorder', 'brain launches must be 1, got ' + JSON.stringify(dp.launchBySource));
    if (dp.secondCompanionWaits.n !== 1 || dp.secondCompanionWaits.bySource.brain !== 1) fail('recorder', 'second-companion waits must be 1 (brain), got ' + JSON.stringify(dp.secondCompanionWaits));
    if (legOut.winplan.sum.planSeeds !== 2 || legOut.winplan.sum.seekContacts !== 1 || legOut.winplan.sum.w5Targets !== 1) fail('recorder', 'win-plan sums wrong: ' + JSON.stringify(legOut.winplan.sum));
    if (p.instrumentErrors !== 0 || p.unclassified !== 0) fail('recorder', 'instrument errors must be 0, got ' + p.instrumentErrors + ' / ' + p.unclassified);
    var mainSummary = { seeds: p.seeds, w5encounters: e5.n, w5gates: g.w5n, fieldKills: p.fieldKills, tbKills: p.tbKills };
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
  // Negative-TB instrument error: a recorded field kill with no
  // matching total kill means the residual goes negative and the
  // seed is flagged.
  const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'producergate-test-neg-'));
  try {
    const bad = {
      seed: 100781, days: 150, endReason: 'survived', maxWave: 5, scaleRank: 'national', won: false,
      waveKills: { '5': 0 }, instrumentErrors: [],
      events: [{ day: 80, kind: 'unlockedWave', wave: 5 }],
      series: [{ d: 150, w5: 1, vet5: 0, rd5ready: false, rd5short: [] }],
      deaths: [], seatTakes: [],
      w5encounters: [
        { day: 95, vid: 'v1', mid: 'spoiler', wave: 5, alliesN: 2, allyVids: ['v2', 'v3'], gate: null, outcome: 'vKill', rounds: 6, vTaken: 40, mDealt: 1200, calledHelp: true, allyVid: 'v2', fleeHpFrac: null, trickBefore: true, trickAfter: true, lines: [], log: [] },
      ],
      w5gates: [], w5seeds: [], w5departs: [],
      wpEnd: { planSeeds: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 0, byStage: {}, w5Targets: 0 },
    };
    fs.writeFileSync(path.join(dir2, 'producergate-b-s100781-neg.json'), JSON.stringify(bad));
    const w5k2 = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
    const w5set2 = new Set(w5k2.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json')));
    const neg = analyzer.analyzeLeg(dir2, w5set2);
    const rec = neg.perSeed[0];
    if (rec.tbKills !== -1) fail('recorder', 'negative-TB fixture must give tbKills -1, got ' + rec.tbKills);
    if (rec.errors.indexOf('negative-tb-kills') < 0) fail('recorder', 'negative-TB fixture must flag negative-tb-kills, got ' + JSON.stringify(rec.errors));
    if (neg.pooled.unclassified !== 1) fail('recorder', 'negative-TB fixture must count 1 unclassified, got ' + neg.pooled.unclassified);
  } finally {
    try { fs.rmSync(dir2, { recursive: true, force: true }); } catch (e) {}
  }
  pass('recorder', Object.assign({}, mainSummary, { negativeTbFlagged: true }));
}

if (kase === 'determinism') (async function () {
  const driver = require(path.join(__dirname, 'producergate-driver-20261115.js'));
  const a = await driver.oneRun(seed, 'competent-answercourt-b');
  const b = await driver.oneRun(seed, 'competent-answercourt-b');
  const key = function (r) {
    return JSON.stringify({
      deaths: r.deaths, days: r.days, endReason: r.endReason, seriesLen: r.series.length,
      w5encounters: r.w5encounters, w5gates: r.w5gates, w5seeds: r.w5seeds, w5departs: r.w5departs,
    });
  };
  if (key(a) !== key(b)) fail('determinism', 'two runs on seed ' + seed + ' diverged', { a: { deaths: a.deaths.length, days: a.days, endReason: a.endReason, w5enc: a.w5encounters.length, w5gates: a.w5gates.length }, b: { deaths: b.deaths.length, days: b.days, endReason: b.endReason, w5enc: b.w5encounters.length, w5gates: b.w5gates.length } });
  if ((a.instrumentErrors || []).length) fail('determinism', 'instrument errors on seed ' + seed + ': ' + JSON.stringify(a.instrumentErrors).slice(0, 400));
  pass('determinism', { seed: seed, days: a.days, deaths: a.deaths.length, endReason: a.endReason, w5encounters: a.w5encounters.length, w5gates: a.w5gates.length, w5seeds: a.w5seeds.length, w5departs: a.w5departs.length });
})().catch(function (e) { fail('determinism', 'threw: ' + (e && e.stack || e)); });
