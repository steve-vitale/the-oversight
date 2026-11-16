#!/usr/bin/env node
// scripts/test-aidgate-b.js — sim-aidgate-b proof, POST-REVERT form.
// The pilot NO-GO'd (gatereach §11 bar 1: field kills per unlocked
// 0.67 < 1.00), so the lever was reverted — no trace of it in game
// code — and this test now proves the reverted state plus the kept
// instrument (evidence/2026-11-15/sim-aidgate-b-prereg.md, §11).
//
// Cases (one fixture, one process per case — harness rule: never two
// harnesses in one node process at once). The 'all' runner spawns one
// child process per case and aggregates; exit 1 if any case fails.
// Each case prints one JSON line.
//   static        the lever is GONE from game code (no winPlanDoorGate
//                 in win-plan.js, no AIDGATE/trickOpen/aidGate consult
//                 in comms.js, no trickOpen threading in fieldFights.js)
//                 AND the instrument remains (driver door wrap +
//                 aidGate/trickOpen/trickLog fields; analyzer
//                 judgeAidgate + doors/aidGate summaries); the frozen
//                 wave-5 id set matches src/data/monsters.json exactly.
//   judge         judgeAidgate() on synthetic pooled summaries: the GO
//                 shape (field 1.00, TB 0.5x, kill:death 0.92,
//                 FACED-NOT-KILLED 0.20, starvation +2, survival 0.8x)
//                 and one NO-GO fixture per bar, plus the boundary GO
//                 (every bar exactly at its threshold), the null
//                 kill:death NO-GO, and the instrument-fail NO-GO.
//   recorder      analyzeLeg on synthetic per-seed fixtures in /tmp:
//                 door rows by result/reason, wave-5 aid fights split
//                 by aidGate with outcomes, opener firings, the
//                 same-day/same-beast 'villager combat' death count
//                 (vcDeathsW5) and killDeathAidgate, and judgeAidgate
//                 over a control + lever fixture pair (GO bars pass,
//                 instrument fails on the 2-seed fixture — NO-GO).
//   determinism   gatereach driver oneRun twice on seed 100825,
//                 150 days, flag UNSET (the reverted game): deaths,
//                 days, endReason, series length, and the recorder
//                 arrays (w5encounters, w5gates, w5doors, w5doorLines,
//                 w5seeds, w5departs, grLaunches) identical; 0 errors;
//                 no door-gate rows (winPlanDoorGate absent from Game)
//                 and every wave-5 aid encounter 'not-consulted' — the
//                 reverted game behaves as the control leg.
// Usage: node scripts/test-aidgate-b.js [seed] [case]
//   (DAYS env sets the determinism horizon; default 150.)
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '100825');
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
      const r = execFileSync(process.execPath, [path.join(__dirname, 'test-aidgate-b.js'), String(seed), c], { cwd: repo, encoding: 'utf8', timeout: 900000, env: env });
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
  // 1. The lever is GONE from game code — a killed arm leaves no trace.
  const wp = fs.readFileSync(path.join(repo, 'src', 'js', 'win-plan.js'), 'utf8');
  if (wp.indexOf('winPlanDoorGate') >= 0) fail('static', 'win-plan.js still contains winPlanDoorGate (lever not reverted)');
  const cm = fs.readFileSync(path.join(repo, 'src', 'js', 'comms.js'), 'utf8');
  for (const needle of ['winPlanDoorGate', 'AIDGATE', 'opts.trickOpen', "opts.aidGate", 'opens with the trick', 'cannot walk away from their own door']) {
    if (cm.indexOf(needle) >= 0) fail('static', 'comms.js still contains lever trace: ' + needle);
  }
  const ff = fs.readFileSync(path.join(repo, 'src', 'js', 'fieldFights.js'), 'utf8');
  if (ff.indexOf('trickOpen') >= 0) fail('static', 'fieldFights.js still contains trickOpen (lever not reverted)');
  // 2. The instrument REMAINS (driver wrap + analyzer extension).
  const drv = fs.readFileSync(path.join(repo, 'scripts', 'gatereach-driver-20261115.js'), 'utf8');
  for (const needle of ['winPlanDoorGate', 'w5doors', 'w5doorLines', 'aidGate', 'trickLog']) {
    if (drv.indexOf(needle) < 0) fail('static', 'driver missing instrument piece: ' + needle);
  }
  const an = fs.readFileSync(path.join(repo, 'scripts', 'analyze-gatereach-b.js'), 'utf8');
  for (const needle of ['judgeAidgate', 'vcDeathsW5', 'killDeathAidgate', 'facedNotKilledShare', 'openerFired']) {
    if (an.indexOf(needle) < 0) fail('static', 'analyzer missing instrument piece: ' + needle);
  }
  // 3. Frozen wave-5 id set matches the roster exactly.
  const w5k = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
  const live = w5k.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json'));
  const frozen = w5k.W5_IDS.slice().sort();
  if (JSON.stringify(live) !== JSON.stringify(frozen)) fail('static', 'wave-5 id set drifted: live ' + JSON.stringify(live) + ' vs frozen ' + JSON.stringify(frozen));
  pass('static', { w5ids: live, leverReverted: true, instrumentKept: true });
}

if (kase === 'judge') {
  const analyzer = require(path.join(__dirname, 'analyze-gatereach-b.js'));
  if (typeof analyzer.judgeAidgate !== 'function') fail('judge', 'judgeAidgate not exported');
  const pooled = function (o) {
    return Object.assign({
      fieldKillsPerUnlocked: 1.00, tbKillsPerUnlocked: 2.33, killDeathAidgate: 1.00,
      facedNotKilledShare: 0, starvation: 3, medianSurvivalAll: 150,
      instrumentErrors: 0, seeds: 8, files: 8, parseErrors: 0, classifiedShare: 1.00,
    }, o || {});
  };
  const control = pooled({});
  const go = analyzer.judgeAidgate(control, pooled({}));
  if (go.verdict !== 'GO') fail('judge', 'GO shape must GO, got ' + JSON.stringify(go));
  const cases = [
    ['field short', pooled({ fieldKillsPerUnlocked: 0.67 }), 'fieldKillsPerUnlocked'],
    ['TB short', pooled({ tbKillsPerUnlocked: 1.00 }), 'tbKillsPerUnlocked'],
    ['kill:death short', pooled({ killDeathAidgate: 0.67 }), 'killDeath'],
    ['faced-not-killed over', pooled({ facedNotKilledShare: 0.33 }), 'facedNotKilledShare'],
    ['starvation over', pooled({ starvation: 6 }), 'costs'],
    ['survival short', pooled({ medianSurvivalAll: 100 }), 'costs'],
  ];
  for (const [name, lever, key] of cases) {
    const j = analyzer.judgeAidgate(control, lever);
    if (j.verdict !== 'NO-GO' || j[key].pass !== false) fail('judge', name + ' must NO-GO on ' + key + ', got ' + JSON.stringify(j));
  }
  // Boundary GO: every bar exactly at its threshold.
  const edge = analyzer.judgeAidgate(
    pooled({ tbKillsPerUnlocked: 2.00, starvation: 3, medianSurvivalAll: 150 }),
    pooled({ fieldKillsPerUnlocked: 1.00, tbKillsPerUnlocked: 1.00, killDeathAidgate: 0.92,
      facedNotKilledShare: 0.20, starvation: 5, medianSurvivalAll: 120 }));
  if (edge.verdict !== 'GO') fail('judge', 'boundary shape must GO, got ' + JSON.stringify(edge));
  // Null kill:death (no kills, no deaths) -> NO-GO.
  const nullKd = analyzer.judgeAidgate(control, pooled({ fieldKillsPerUnlocked: 0, killDeathAidgate: null }));
  if (nullKd.verdict !== 'NO-GO' || nullKd.killDeath.pass !== false) fail('judge', 'null kill:death must NO-GO, got ' + JSON.stringify(nullKd));
  // Instrument failure on a leg -> NO-GO even when the bars pass.
  const instFail = analyzer.judgeAidgate(pooled({ instrumentErrors: 1 }), pooled({}));
  if (instFail.verdict !== 'NO-GO' || instFail.instrument.pass !== false) fail('judge', 'instrument errors must NO-GO, got ' + JSON.stringify(instFail));
  const clsFail = analyzer.judgeAidgate(control, pooled({ classifiedShare: 0.80 }));
  if (clsFail.verdict !== 'NO-GO' || clsFail.instrument.pass !== false) fail('judge', 'classified-share short must NO-GO, got ' + JSON.stringify(clsFail));
  pass('judge', { fixtures: 11 });
}

if (kase === 'recorder') {
  const analyzer = require(path.join(__dirname, 'analyze-gatereach-b.js'));
  const w5k = require(path.join(__dirname, 'analyze-wave5kill-b.js'));
  const w5set = new Set(w5k.loadWave5Ids(path.join(repo, 'src', 'data', 'monsters.json')));
  const seriesA = [];
  for (let d = 1; d <= 150; d++) {
    seriesA.push({ d: d, w5: d >= 90 ? 2 : 0, vet5: d >= 80 ? 2 : 0, rd5ready: d >= 80, rd5short: d >= 80 ? [] : ['veterans'] });
  }
  function seedFile(seed, days, opts) {
    const o = Object.assign({
      seed: seed, days: days, endReason: 'survived', maxWave: 5, scaleRank: 'national', won: false,
      waveKills: { '5': 2 }, instrumentErrors: [],
      events: [{ day: 80, kind: 'unlockedWave', wave: 5 }],
      series: seriesA,
      deaths: [
        { day: 106, kind: 'monster', who: 'cancellation', cause: 'villager combat', player: false },
        { day: 147, kind: 'monster', who: 'finale_crew', cause: 'villager combat', player: false },
        { day: 66, kind: 'starvation', who: 'v5', cause: 'starved', player: false },
      ],
      seatTakes: [],
      w5encounters: [
        { day: 106, vid: 'v1', mid: 'cancellation', wave: 5, origin: 'aid', fighterExped: null, allyExpedSharedN: 0, partyAtStart: 3, startMode: 'aid-party', alliesN: 2, allyVids: ['v2', 'v3'], allyFromStart: false, gate: null, outcome: 'vKill', rounds: 1, vTaken: 0, mDealt: 15, calledHelp: false, allyVid: null, fleeHpFrac: null, trickBefore: true, trickAfter: true, aidGate: 'seek', trickOpen: true, trickLog: ['offscript'], lines: [], log: ['v1 opens with the trick.'] },
        { day: 147, vid: 'v1', mid: 'finale_crew', wave: 5, origin: 'aid', fighterExped: null, allyExpedSharedN: 0, partyAtStart: 3, startMode: 'aid-party', alliesN: 2, allyVids: ['v2', 'v3'], allyFromStart: false, gate: null, outcome: 'vKill', rounds: 9, vTaken: 57, mDealt: 307, calledHelp: true, allyVid: 'v2', fleeHpFrac: null, trickBefore: true, trickAfter: true, aidGate: 'defense', trickOpen: false, trickLog: [], lines: [], log: ['v1 held the door.'] },
        { day: 120, vid: 'v1', mid: 'rerun', wave: 5, origin: 'world-tick', fighterExped: null, allyExpedSharedN: 0, partyAtStart: 2, startMode: 'worldtick-party', alliesN: 1, allyVids: ['v2'], allyFromStart: false, gate: null, outcome: 'vFlee', rounds: 4, vTaken: 60, mDealt: 100, calledHelp: true, allyVid: 'v2', fleeHpFrac: null, trickBefore: false, trickAfter: true, aidGate: 'not-consulted', trickOpen: false, trickLog: [], lines: [], log: [] },
      ],
      w5gates: [],
      w5doors: [
        { day: 106, vid: 'v1', mid: 'cancellation', wave: 5, result: 'seek', reason: 'seek', partySize: 3, party: ['v1', 'v2', 'v3'], allArmed: true, allArmored: true, gear: {}, trickKnown: true },
        { day: 147, vid: 'v1', mid: 'finale_crew', wave: 5, result: 'avoid', reason: 'outmatched', partySize: 2, party: ['v1', 'v2'], allArmed: true, allArmored: false, gear: {}, trickKnown: true },
      ],
      w5doorLines: [
        { day: 106, line: 'Ella holds the door and opens with the trick — the village knows where it bleeds.' },
        { day: 147, line: 'Therese cannot walk away from their own door — outmatched, they hold it anyway.' },
      ],
      w5seeds: [], w5departs: [], grLaunches: [],
      wpEnd: { planSeeds: 0, avoidances: 0, seekContacts: 0, standingContacts: 0, partyDepartures: 0, partyFights: 0, trickHolds: 0, veteranGuardHolds: 0, partyWaits: 0, gearHolds: 0, plansN: 0, byStage: {}, w5Targets: 0 },
    }, opts || {});
    return o;
  }
  const dirC = fs.mkdtempSync(path.join(os.tmpdir(), 'aidgate-test-control-'));
  const dirL = fs.mkdtempSync(path.join(os.tmpdir(), 'aidgate-test-lever-'));
  try {
    // Control leg: the same fights, never consulted (flag off).
    const c = seedFile(100821, 150);
    for (const e of c.w5encounters) { if (e.origin === 'aid') { e.aidGate = 'not-consulted'; e.trickOpen = false; e.trickLog = []; } }
    c.w5doors = []; c.w5doorLines = [];
    c.waveKills = { '5': 2 };
    fs.writeFileSync(path.join(dirC, 'gatereach-b-s100821-test.json'), JSON.stringify(c));
    const c2 = seedFile(100822, 150, { maxWave: 4, scaleRank: 'regional', waveKills: {}, events: [{ day: 60, kind: 'unlockedWave', wave: 4 }], series: [{ d: 150, w5: 0, vet5: 0, rd5ready: false, rd5short: [] }], deaths: [], w5encounters: [], w5doors: [], w5doorLines: [] });
    fs.writeFileSync(path.join(dirC, 'gatereach-b-s100822-test.json'), JSON.stringify(c2));
    // Lever leg: the fixture as staged (SEEK + defense, both kills).
    fs.writeFileSync(path.join(dirL, 'gatereach-b-s100821-test.json'), JSON.stringify(seedFile(100821, 150)));
    fs.writeFileSync(path.join(dirL, 'gatereach-b-s100822-test.json'), JSON.stringify(c2));
    const legC = analyzer.analyzeLeg(dirC, w5set);
    const legL = analyzer.analyzeLeg(dirL, w5set);
    const pL = legL.pooled;
    if (pL.vcDeathsW5 !== 2) fail('recorder', 'vcDeathsW5 must be 2, got ' + pL.vcDeathsW5);
    if (pL.killDeathAidgate !== 1) fail('recorder', 'killDeathAidgate must be 1, got ' + pL.killDeathAidgate);
    if (pL.fieldKillsPerUnlocked !== 2) fail('recorder', 'field kills per unlocked must be 2, got ' + pL.fieldKillsPerUnlocked);
    if (legL.doors.n !== 2) fail('recorder', 'door rows must be 2, got ' + legL.doors.n);
    if (legL.doors.byResult.seek !== 1 || legL.doors.byResult.avoid !== 1) fail('recorder', 'door results must be seek 1 / avoid 1, got ' + JSON.stringify(legL.doors.byResult));
    if (legL.doors.byReason.seek !== 1 || legL.doors.byReason.outmatched !== 1) fail('recorder', 'door reasons must be seek 1 / outmatched 1, got ' + JSON.stringify(legL.doors.byReason));
    if (legL.doors.lines !== 2) fail('recorder', 'door lines must be 2, got ' + legL.doors.lines);
    const sp = legL.aidGate.split;
    if (!sp.seek || sp.seek.n !== 1 || sp.seek.vKill !== 1 || sp.seek.trickOpen !== 1) fail('recorder', 'aid split seek must be n1/kill1/trickOpen1, got ' + JSON.stringify(sp.seek));
    if (!sp.defense || sp.defense.n !== 1 || sp.defense.vKill !== 1 || sp.defense.trickOpen !== 0) fail('recorder', 'aid split defense must be n1/kill1/trickOpen0, got ' + JSON.stringify(sp.defense));
    if (legL.aidGate.openerFired !== 1) fail('recorder', 'openerFired must be 1, got ' + legL.aidGate.openerFired);
    if (legC.doors.n !== 0 || legC.aidGate.openerFired !== 0) fail('recorder', 'control leg must have 0 doors / 0 openers, got ' + legC.doors.n + ' / ' + legC.aidGate.openerFired);
    if (!legC.aidGate.split['not-consulted'] || legC.aidGate.split['not-consulted'].n !== 2) fail('recorder', 'control aid fights must be not-consulted x2, got ' + JSON.stringify(legC.aidGate.split));
    // judgeAidgate over the fixture pair: 2 seeds, not 8 — the
    // instrument leg fails the corpus bar, so the verdict is NO-GO
    // on instrument, with all five GO bars passing.
    const j = analyzer.judgeAidgate(legC.pooled, legL.pooled);
    for (const k of ['fieldKillsPerUnlocked', 'tbKillsPerUnlocked', 'killDeath', 'facedNotKilledShare', 'costs']) {
      if (j[k].pass !== true) fail('recorder', 'fixture GO bar ' + k + ' must pass, got ' + JSON.stringify(j[k]));
    }
    if (j.instrument.pass !== false) fail('recorder', 'fixture instrument must fail (2 seeds), got ' + JSON.stringify(j.instrument));
    if (j.verdict !== 'NO-GO') fail('recorder', 'fixture verdict must be NO-GO (instrument), got ' + j.verdict);
    pass('recorder', { vcDeathsW5: pL.vcDeathsW5, killDeathAidgate: pL.killDeathAidgate, doors: legL.doors.n, openerFired: legL.aidGate.openerFired, goBarsPass: true });
  } finally {
    try { fs.rmSync(dirC, { recursive: true, force: true }); } catch (e) {}
    try { fs.rmSync(dirL, { recursive: true, force: true }); } catch (e) {}
  }
}

if (kase === 'determinism') (async function () {
  // Flag UNSET: the reverted game must behave as the control leg.
  // (winPlanDoorGate's absence from Game is proven by the static
  // source check; here the behavior proves it: no door rows at all.)
  delete process.env.AIDGATE;
  const driver = require(path.join(__dirname, 'gatereach-driver-20261115.js'));
  const a = await driver.oneRun(seed, 'competent-answercourt-b');
  const b = await driver.oneRun(seed, 'competent-answercourt-b');
  const key = function (r) {
    return JSON.stringify({
      deaths: r.deaths, days: r.days, endReason: r.endReason, seriesLen: r.series.length,
      w5encounters: r.w5encounters, w5gates: r.w5gates, w5doors: r.w5doors, w5doorLines: r.w5doorLines,
      w5seeds: r.w5seeds, w5departs: r.w5departs, grLaunches: r.grLaunches,
    });
  };
  if (key(a) !== key(b)) fail('determinism', 'two runs on seed ' + seed + ' diverged', { a: { deaths: a.deaths.length, days: a.days, endReason: a.endReason, w5enc: a.w5encounters.length, w5doors: (a.w5doors || []).length }, b: { deaths: b.deaths.length, days: b.days, endReason: b.endReason, w5enc: b.w5encounters.length, w5doors: (b.w5doors || []).length } });
  if ((a.instrumentErrors || []).length) fail('determinism', 'instrument errors on seed ' + seed + ': ' + JSON.stringify(a.instrumentErrors).slice(0, 400));
  const classified = ['expedition-party', 'expedition-solo', 'worldtick-party', 'worldtick-solo', 'patrol-party', 'patrol-solo', 'aid-party', 'aid-solo'];
  if (!a.w5encounters.length) fail('determinism', 'seed ' + seed + ' at 150d must have wave-4+ encounters, got 0');
  for (const e of a.w5encounters) {
    if (classified.indexOf(e.startMode) === -1) fail('determinism', 'encounter row has unclassified startMode ' + e.startMode + ' (origin ' + e.origin + ', mid ' + e.mid + ', wave ' + e.wave + ')');
  }
  // The reverted game consults nothing: no door rows, no door lines,
  // every wave-5 aid encounter 'not-consulted'.
  if ((a.w5doors || []).length) fail('determinism', 'reverted game must have 0 door rows on seed ' + seed + ', got ' + a.w5doors.length);
  if ((a.w5doorLines || []).length) fail('determinism', 'reverted game must have 0 door lines on seed ' + seed + ', got ' + a.w5doorLines.length);
  const aid5 = a.w5encounters.filter(function (e) { return e.wave === 5 && e.origin === 'aid'; });
  for (const e of aid5) {
    if (e.aidGate !== 'not-consulted') fail('determinism', 'reverted game must leave wave-5 aid fights not-consulted, got aidGate=' + e.aidGate + ' on ' + e.mid + ' d' + e.day);
  }
  pass('determinism', { seed: seed, days: a.days, deaths: a.deaths.length, endReason: a.endReason, w5encounters: a.w5encounters.length, w5doors: 0, aid5NotConsulted: aid5.length, originsClassified: true });
})().catch(function (e) { fail('determinism', 'threw: ' + (e && e.stack || e)); });
