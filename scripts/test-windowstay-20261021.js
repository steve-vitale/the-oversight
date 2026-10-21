#!/usr/bin/env node
// test-windowstay-20261021.js — proof gates for sim-windowstay-r2
// (flesh-out loop arm, run fleshout-20261021T1215Z, axis scale-onramp).
//
// E0 shape + unlock-reproduction gate: the 3 known-unlocking seeds
// {64406, 64703, 64858} x {leadfeast, belongfeast} reproduce a wave-5
// unlock on current master (full instrument, no postwin, light JSON).
// Writes evidence/2026-10-21/e0-repro-windowstay.json — the sweep reads it.
// E1 det-gate: instrument-on vs instrument-off byte-identical on the armed
// substrate (2 seeds x 60d), with a noinstr stability pre-check.
// E2 RED->GREEN on synthetic fixtures: unlock-day detection, window-death
// attribution (incl. the RED unexplained classes), engagement/kill join.
// E3 read-only static scan of the instrument source: zero RNG draws, zero
// game-state writes — RED on any `Math.random(`, any `Date.now(`, or any
// `Game.<x> =` write that is not one of the documented wrap-install lines.
// (The post-win continuation's single `Game.over = false` flip lives in the
// SWEEP, not the instrument — the instrument must be write-free.)
// E4 armed+instrument determinism: 180d x 2, byte-identical per-seed JSON.
// D2 180d armed run with the window layer installed + POST-WIN
// CONTINUATION: completes, winResumed with winDay/winPath, the window
// trace extends past the win, deterministic re-run byte-identical.
//
// Any gate failure = FAIL LOUDLY, no sweep. E0 insufficient-data (<2
// unlocking pairs) is a GATE RESULT (report-only, per the pre-registration),
// not a crash — the sweep refuses to run the census on it.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   node scripts/test-windowstay-20261021.js [GATES=E0,E1,E2,E3,E4,D2]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const VCE = require('./policies/vgearconfirm');
const WS = require('./instr-windowstay-20261021');
const WR = require('./windowreach-instrument-20261021');
const KD = require('./killdisc-instrument-20261021');
const WA = require('./windowstay-analyze-20261021');
const WRA = require('./windowreach-analyze-20261021');

const _gatesArg = (process.argv.slice(2).find(a => /^GATES=/i.test(a)) || '').replace(/^GATES=/i, '');
const GATES = ((_gatesArg || process.env.GATES || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean).length
  ? (_gatesArg || process.env.GATES).split(',').map(s => s.trim().toUpperCase())
  : ['E0', 'E1', 'E2', 'E3', 'E4', 'D2']);
const SUBSTRATE_VARS = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC'];
const UNSET_VARS = ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT'];
function needSubstrate() {
  for (const k of SUBSTRATE_VARS) if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 required.`); process.exit(2); }
  for (const k of UNSET_VARS) if (process.env[k] != null) { console.error(`PROOF STOP: ${k} must be UNSET.`); process.exit(2); }
  if (!VCE.vgearOn()) { console.error('PROOF STOP: VGEAR layer off.'); process.exit(2); }
}

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log(`  ok   ${name}`); }
  else { failed++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
  return !!cond;
}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

function blankT() {
  return {
    kills: [], engagements: [], fieldFights: [], spawns: [],
    tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [],
    deathRecs: [], fightStarts: [],
  };
}

async function runArmed(seed, policyId, days, withInstrument, hashOut) {
  const policy = VCE.armedFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'windowstay-proof', fullTelemetry: false });
  const t = blankT();
  let uninstall = null;
  if (withInstrument) uninstall = WS.install(Game, t);
  await setupGame(Game);
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      if (hashOut) hashOut.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  const result = await quietLog(async () => { return await runDays(Game, wrapped, { days, manifest: undefined, sampleEvery: 30 }); });
  if (uninstall) { try { uninstall(); } catch (e) {} }
  return { Game, t, result };
}

// ---- E0: shape + unlock-reproduction ---------------------------------------
async function gateE0() {
  console.log('E0 shape + unlock-reproduction');
  let allOk = true;
  allOk = ok('exports instrumentOn/install/installDeathCapture/classifyDeath',
    typeof WS.instrumentOn === 'function' && typeof WS.install === 'function' &&
    typeof WS.installDeathCapture === 'function' && typeof WS.classifyDeath === 'function') && allOk;
  allOk = ok('install returns uninstall function', (() => {
    try {
      const fake = { sleep() {}, tele() {}, recordWaveKill() {}, recordPyrrhicKill() {}, startCombat() {}, tbEnd() {}, tbBarrierExit() {}, fieldFight() {}, castMonster() {}, spawnWorldMonster() {}, tbDamage() {}, aidFight() {}, resolvePatrol() {}, resolveWildMonsterEncounter() {} };
      const u = WS.install(fake, blankT());
      const isFn = typeof u === 'function';
      try { u(); } catch (e) {}
      return isFn;
    } catch (e) { return false; }
  })()) && allOk;
  allOk = ok('analyzer exports analyzeRun/attributeDeath', typeof WA.analyzeRun === 'function' && typeof WA.attributeDeath === 'function') && allOk;

  needSubstrate();
  const SEEDS = [64406, 64703, 64858];
  const POLICIES = ['leadfeast', 'belongfeast'];
  const runs = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const t0 = Date.now();
      const { Game, t, result } = await runArmed(seed, policyId, 180, true, null);
      let w4Day = null, w5Day = null;
      for (const w of t.window) {
        if (w4Day == null && (w.uw | 0) >= 4) w4Day = w.day;
        if (w5Day == null && (w.uw | 0) >= 5) w5Day = w.day;
      }
      let national = 0, table = 0, won = 0;
      try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
      try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
      try { won = !!Game.won ? 1 : 0; } catch (e) {}
      const rec = {
        seed, policyId, w4Day, w5Day, won, national, table,
        endReason: result.endReason, gameDays: gday(Game),
        instrumentErrors: t.instrumentErrors.length,
        nDeaths: t.deathRecs.length, secs: +((Date.now() - t0) / 1000).toFixed(1),
      };
      runs.push(rec);
      console.log(`  repro ${policyId}/s${seed}: w5Day=${w5Day} won=${won} end=${result.endReason} days=${rec.gameDays} errs=${rec.instrumentErrors}`);
    }
  }
  const unlocking = runs.filter(r => r.w5Day != null).map(r => ({ seed: r.seed, policyId: r.policyId, w5Day: r.w5Day }));
  const perSeed = SEEDS.map(s => ({ seed: s, unlocking: unlocking.filter(u => u.seed === s).map(u => u.policyId) }));
  const status = unlocking.length >= 2 ? 'GO' : 'insufficient-data';
  const e0out = { gate: 'E0', anchorNote: 'current master', seeds: SEEDS, policies: POLICIES, runs, unlocking, perSeed, status };
  fs.writeFileSync(path.join(REPO, 'evidence', '2026-10-21', 'e0-repro-windowstay.json'), JSON.stringify(e0out, null, 1) + '\n');
  allOk = ok('reproduction gate ran 6/6 without instrument errors',
    runs.length === 6 && runs.every(r => r.instrumentErrors === 0)) && allOk;
  allOk = ok(`unlock reproduction: ${unlocking.length} unlocking pairs (minimum 2)`, unlocking.length >= 2,
    unlocking.length < 2 ? 'INSUFFICIENT-DATA — report-only, no sweep' : '') && allOk;
  for (const ps of perSeed) {
    console.log(`  seed s${ps.seed}: ${ps.unlocking.length ? 'unlocks on ' + ps.unlocking.join(',') : 'NO UNLOCK on either policy'}`);
  }
  return allOk;
}

// ---- E1: det-gate ------------------------------------------------------------
async function gateE1() {
  console.log('E1 det-gate (armed substrate, 2 seeds x 60d)');
  needSubstrate();
  let allOk = true;
  for (const [seed, policyId] of [[64406, 'leadfeast'], [64703, 'belongfeast']]) {
    const h1 = [], h2 = [], h3 = [];
    await runArmed(seed, policyId, 60, false, h1);
    await runArmed(seed, policyId, 60, false, h2);
    allOk = ok(`noinstr stability s${seed}/${policyId} (${h1.length} day-hashes)`,
      h1.length > 0 && JSON.stringify(h1) === JSON.stringify(h2)) && allOk;
    await runArmed(seed, policyId, 60, true, h3);
    allOk = ok(`instrument-on vs instrument-off byte-identical s${seed}/${policyId}`,
      JSON.stringify(h1) === JSON.stringify(h3),
      JSON.stringify(h1) === JSON.stringify(h3) ? '' : `bare=${h1.length} instr=${h3.length}`) && allOk;
  }
  return allOk;
}

// ---- E2: RED->GREEN fixtures -------------------------------------------------
function gateE2() {
  console.log('E2 synthetic fixtures (RED classes pinned)');
  let allOk = true;
  // (a) unlock-day detection via the real window layer on a scripted Game.
  {
    const t = { window: [], instrumentErrors: [] };
    let uw = 3;
    const fake = {
      unlockedWave: () => uw,
      villageStanding: () => ({ total: 150 }),
      standingPlentyCappedTotal: () => 150,
      waveCombatReadiness: () => ({ armored: 1, armed: 2, tricks: 3, veterans: 0, short: [], ready: false }),
      waveEngaged: () => 0,
      state: { scholar: { day: 0 }, village: { roster: [] } },
      sleep() { this.state.scholar.day++; },
    };
    const uninstall = WR.installWindowLayer(fake, t);
    for (let i = 0; i < 5; i++) fake.sleep(); // d1-5 at uw 3
    uw = 4; fake.sleep(); fake.sleep();       // d6-7 at uw 4
    uw = 5; fake.sleep();                      // d8 at uw 5
    uninstall();
    const unlocks = t.window.filter(w => w.unlocked != null);
    const u5 = unlocks.filter(w => w.unlocked === 5);
    const u4 = unlocks.filter(w => w.unlocked === 4);
    // installWindowLayer captures BEFORE the inner sleep, so days read
    // pre-increment: the uw=4 transition is seen on the 6th sleep call
    // (day 5), the uw=5 transition on the 8th call (day 7).
    allOk = ok('unlock-day detection: one wave-4 event (d5) + one wave-5 event (d7)',
      u4.length === 1 && u4[0].day === 5 && u5.length === 1 && u5[0].day === 7,
      JSON.stringify(unlocks.map(u => [u.day, u.unlocked]))) && allOk;
    allOk = ok('window layer error sink empty on fixture', t.instrumentErrors.length === 0) && allOk;
  }
  // (b) death attribution fixtures (the RED unexplained classes).
  {
    const j = {
      fieldFightsAll: [{ d: 90, vid: 'v_mira', mid: 'grief_counselor', wave: 2, outcome: 'vDie' }],
      fightStarts: [{ day: 89, mid: 'static', wave: 2, via: 'combat_start' }],
    };
    const A = (rec) => WA.attributeDeath(rec, j);
    // raid cause -> attributed, channel raid
    let a = A({ day: 91, who: 'v_mira', cause: 'raid', kind: 'villager', player: false, wave: null, ctx: {}, real: true, playerRepaired: false });
    allOk = ok('death raid cause -> attributed raid', a.attributed && a.channel === 'raid') && allOk;
    // combat at haven, inTb -> raid, killer wave joined from fightStarts
    a = A({ day: 91, who: 'v_mira', cause: 'combat', kind: 'villager', player: false, wave: null, ctx: { atHaven: true, inTb: true }, real: true, playerRepaired: false });
    allOk = ok('death combat@haven -> raid + fightstart wave join', a.attributed && a.channel === 'raid' && a.killerWave === 2 && a.joinVia === 'fightstart:combat_start', JSON.stringify(a)) && allOk;
    // vDie field-fight join (killer wave from the field fight, not fightstarts).
    // cause 'monster' needs a router ctx to classify to a combat channel —
    // in the real engine a fieldFight vDie fires hurtVillager('monster') from
    // inside resolveWildMonsterEncounter/resolvePatrol, with the router flag set.
    a = A({ day: 90, who: 'v_mira', cause: 'monster', kind: 'villager', player: false, wave: null, ctx: { router: 'wild' }, real: true, playerRepaired: false });
    allOk = ok('death monster cause -> fieldfight-vDie join wave=2', a.attributed && a.killerWave === 2 && a.joinVia === 'fieldfight-vDie', JSON.stringify(a)) && allOk;
    // RED: unknown cause -> unexplained
    a = A({ day: 91, who: 'v_mira', cause: 'unknown', kind: 'villager', player: false, wave: null, ctx: {}, real: true, playerRepaired: false });
    allOk = ok('RED death unknown cause -> unexplained no-cause', !a.attributed && a.reason === 'no-cause') && allOk;
    // RED: cause-unmapped -> unexplained
    a = A({ day: 91, who: 'v_mira', cause: 'dehydration', kind: 'villager', player: false, wave: null, ctx: {}, real: true, playerRepaired: false });
    allOk = ok('RED death dehydration -> unexplained cause-unmapped', !a.attributed && a.reason === 'cause-unmapped') && allOk;
    // RED: null who -> unexplained
    a = A({ day: 91, who: null, cause: 'raid', kind: 'villager', player: false, wave: null, ctx: {}, real: null, playerRepaired: false });
    allOk = ok('RED death null who -> unexplained no-who', !a.attributed && a.reason === 'no-who') && allOk;
    // RED: combat death with no joinable killer wave -> unexplained unjoined.
    // NOTE: this fixture needs an EMPTY fightStarts — the shared `j` has a
    // day-89 fightstart that would honestly join.
    const jEmpty = { fieldFightsAll: [], fightStarts: [] };
    a = WA.attributeDeath({ day: 95, who: 'v_mira', cause: 'combat', kind: 'villager', player: false, wave: null, ctx: {}, real: true, playerRepaired: false }, jEmpty);
    allOk = ok('RED death combat w/o any join -> unexplained unjoined-no-killer-wave', !a.attributed && a.reason === 'unjoined-no-killer-wave', JSON.stringify(a)) && allOk;
    // phantom -> excluded (attributed, not unexplained)
    a = A({ day: 91, who: 'v_mira', cause: 'raid', kind: 'villager', player: false, wave: null, ctx: {}, real: false, playerRepaired: false });
    allOk = ok('death phantom -> phantom-excluded', a.attributed && a.reason === 'phantom-excluded') && allOk;
    // scholar death (playerRepaired) -> scholar flag
    a = A({ day: 91, who: 'v_bearer', cause: 'raid', kind: 'person', player: false, wave: null, ctx: {}, real: true, playerRepaired: true });
    allOk = ok('death playerRepaired=true -> scholar', a.attributed && a.scholar === true) && allOk;
  }
  // (c) engagement/kill join fixtures (re-pin the windowreach join contract).
  {
    let a = WRA.attributeEng({ mid: 'cancellation', wave: 5, started: true, fightIdPresent: true, outcome: 'won', killJoin: true });
    allOk = ok('engagement kill-join -> attributed', a.attributed && a.reason === 'kill-join') && allOk;
    a = WRA.attributeEng({ mid: 'cancellation', wave: 5, started: true, fightIdPresent: true, outcome: 'fled', killJoin: false });
    allOk = ok('engagement outcome-join -> attributed', a.attributed && a.reason === 'outcome-join') && allOk;
    a = WRA.attributeEng({ mid: 'cancellation', wave: 5, started: true, fightIdPresent: false, killJoin: false });
    allOk = ok('RED engagement no-fight-id-no-kill -> unexplained', !a.attributed && a.reason === 'no-fight-id-and-no-kill-match') && allOk;
    a = WRA.attributeFF({ mid: 'timeslot', wave: 5, outcome: 'evade' });
    allOk = ok('fieldfight evade -> attributed', a.attributed && a.reason === 'outcome:evade') && allOk;
    a = WRA.attributeFF({ mid: 'timeslot', wave: 5, outcome: 'unresolved' });
    allOk = ok('RED fieldfight unresolved -> unexplained', !a.attributed && a.reason === 'unresolved-outcome') && allOk;
  }
  return allOk;
}

// ---- E3: read-only static scan ------------------------------------------------
function gateE3() {
  console.log('E3 read-only static scan of the instrument source');
  let allOk = true;
  const raw = fs.readFileSync(path.join(REPO, 'scripts', 'instr-windowstay-20261021.js'), 'utf8');
  // Strip line comments and string-continuation noise before scanning — a
  // comment mentioning "Game.over = false" is documentation, not a write.
  const src = raw.split('\n').map(ln => {
    const idx = ln.indexOf('//');
    return idx >= 0 ? ln.slice(0, idx) : ln;
  }).join('\n');
  allOk = ok('zero Math.random( draws', !/Math\.random\s*\(/.test(src)) && allOk;
  allOk = ok('zero Date.now( uses', !/Date\.now\s*\(/.test(src)) && allOk;
  allOk = ok('zero Game.state writes', !/Game\.state\s*\.\s*[\w$]+(\s*\.\s*[\w$]+)*\s*=(?![=>])/.test(src)) && allOk;
  // Game.<x> = writes: allowed ONLY on wrap-install lines (the install /
  // uninstall idiom: Game[name] =, Game.sleep =, Game.tele =, Game.aidFight =,
  // Game.resolvePatrol etc. via the wrapRouter assignment). Anything else is RED.
  const lines = src.split('\n');
  const bad = [];
  lines.forEach((ln, i) => {
    const m = ln.match(/Game\.([\w$]+)\s*=(?![=>])/) || ln.match(/Game\[['"]([\w$]+)['"]\]\s*=(?![=>])/);
    if (!m) return;
    const isWrapInstall = /=\s*function/.test(ln) || /orig/.test(ln) || /innerSleep/.test(ln) || /oTele/.test(ln) || /oAid/.test(ln);
    if (!isWrapInstall) bad.push(`L${i + 1}: ${ln.trim().slice(0, 80)}`);
  });
  allOk = ok('Game.<x> writes only on wrap-install lines', bad.length === 0, bad.join(' | ')) && allOk;
  allOk = ok('no postwin flip in the instrument (lives in the sweep)', !/Game\.over\s*=\s*false/.test(src)) && allOk;
  return allOk;
}

// ---- E4: armed+instrument determinism ----------------------------------------
async function gateE4() {
  console.log('E4 armed+instrument determinism (180d x 2, no postwin)');
  needSubstrate();
  const canon = (obj) => JSON.stringify(obj);
  const runs = [];
  for (let i = 0; i < 2; i++) {
    const { Game, t, result } = await runArmed(64858, 'belongfeast', 180, true, null);
    const doc = {
      seed: 64858, policyId: 'belongfeast',
      gameDays: gday(Game), endReason: result.endReason, maxWave: result.maxWaveUnlocked || 1,
      won: (() => { try { return !!Game.won; } catch (e) { return false; } })(),
      nWindow: t.window.length, nDeaths: t.deathRecs.length,
      nEng: t.engagements.length, nFF: t.fieldFights.length, nKills: t.kills.length,
      deaths: t.deathRecs.map(d => [d.day, d.who, d.cause, d.player, d.real].join('|')),
      window: t.window.map(w => [w.day, w.uw, w.raw, w.capped, w.w4faced, w.w5faced, w.living, w.dead].join('|')),
      errs: t.instrumentErrors,
    };
    runs.push(canon(doc));
  }
  return ok('two 180d instrument runs byte-identical', runs[0] === runs[1],
    runs[0] === runs[1] ? '' : 'run docs differ');
}

// ---- D2: post-win continuation ------------------------------------------------
// NOTE (2026-10-21, test bug fixed): runArmed() uninstalls the instrument
// before returning — the continuation must run BEFORE uninstall, so D2
// inlines the run instead of using runArmed (the sweep's oneRun already
// orders it correctly: continuation, then uninstall).
async function gateD2() {
  console.log('D2 post-win continuation (s64858 belongfeast, the d95 win)');
  needSubstrate();
  const docs = [];
  for (let i = 0; i < 2; i++) {
    const policy = VCE.armedFor('belongfeast');
    const { Game } = await loadGame({ seed: 64858, mode: 'windowstay-proof', fullTelemetry: false });
    const t = blankT();
    const uninstall = WS.install(Game, t);
    await setupGame(Game);
    await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
    let winDay = null, winPath = null, winResumed = false;
    if (Game.over && Game.won) {
      winDay = gday(Game);
      try { const T = (typeof Game.tableState === 'function') ? Game.tableState() : null; winPath = T ? (T.path || null) : null; } catch (e) {}
      const remaining = Math.max(0, 180 - winDay);
      if (remaining > 0) {
        Game.over = false; // POSTWIN hook under test (proof's own run, not the sweep)
        winResumed = true;
        await quietLog(async () => { await runDays(Game, VCE.armedFor('belongfeast'), { days: remaining, manifest: undefined, sampleEvery: 30 }); });
      }
    }
    try { uninstall(); } catch (e) {}
    docs.push(JSON.stringify({
      winDay, winPath, winResumed,
      gameDays: gday(Game), endReason: (() => { try { return Game.over ? (Game.villageLost ? 'village-lost' : 'over-other') : 'survived'; } catch (e) { return '?'; } })(),
      won: (() => { try { return !!Game.won; } catch (e) { return false; } })(),
      traceDays: t.window.length, lastTraceDay: t.window.length ? t.window[t.window.length - 1].day : null,
      nDeaths: t.deathRecs.length, errs: t.instrumentErrors,
      deaths: t.deathRecs.map(d => [d.day, d.who, d.cause].join('|')),
    }));
  }
  const d0 = JSON.parse(docs[0]);
  let allOk = true;
  allOk = ok('win observed and resumed', d0.winResumed === true && d0.winDay != null, JSON.stringify({ winDay: d0.winDay, winPath: d0.winPath })) && allOk;
  allOk = ok('winPath captured from tableState()', typeof d0.winPath === 'string' && d0.winPath.length > 0, String(d0.winPath)) && allOk;
  allOk = ok('window trace extends past the win day', d0.lastTraceDay > d0.winDay, `trace=${d0.traceDays} last=${d0.lastTraceDay} win=${d0.winDay}`) && allOk;
  allOk = ok('zero instrumentErrors across continuation', d0.errs.length === 0, JSON.stringify(d0.errs)) && allOk;
  allOk = ok('post-win continuation deterministic (re-run byte-identical)', docs[0] === docs[1],
    docs[0] === docs[1] ? '' : 'continuation docs differ') && allOk;
  return allOk;
}

(async () => {
  const results = {};
  for (const g of ['E0', 'E1', 'E2', 'E3', 'E4', 'D2']) {
    if (!GATES.includes(g)) continue;
    try {
      if (g === 'E0') results[g] = await gateE0();
      else if (g === 'E1') results[g] = await gateE1();
      else if (g === 'E2') results[g] = gateE2();
      else if (g === 'E3') results[g] = gateE3();
      else if (g === 'E4') results[g] = await gateE4();
      else if (g === 'D2') results[g] = await gateD2();
    } catch (e) {
      failed++;
      results[g] = false;
      console.log(`  FAIL ${g} threw: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
    }
  }
  console.log(`\nwindowstay proof: ${passed} passed, ${failed} failed; gates: ` +
    Object.keys(results).map(g => `${g}=${results[g] ? 'GREEN' : 'RED'}`).join(' '));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
