#!/usr/bin/env node
// sweep-fleedirectwild-20261014.js — pilot sweep for the r36 wilderness-
// refusal arm (finding #203).
//
// CONTROL: WILDRANGE=1 COMPETENT_DIRECTIONAL_FLEE=1 (ranging substrate +
// the r2 directional judgment; the r26 at-haven hold is symmetric here).
// ARMED:   + FLEEDIRECTWILD=1 (the wilderness refusal — the only delta).
// Same tree, identical seeds, env-var only. 150d death-aware horizon.
//
// Usage:
//   SMOKE=1 node scripts/sweep-fleedirectwild-20261014.js     (gate first)
//   SIDE=control OUT=evidence/2026-10-14/fdwild-control.json node scripts/sweep-fleedirectwild-20261014.js
//   SIDE=armed   OUT=evidence/2026-10-14/fdwild-armed.json   node scripts/sweep-fleedirectwild-20261014.js
//   COMPARE=1 node scripts/sweep-fleedirectwild-20261014.js  (prints the verdict table)
'use strict';
const fs = require('fs');
// KILLED-ARM GRACE: if the substrate/layer files are absent (killed per
// kill protocol), INFO-SKIP — the pre-kill pilot stands; there is nothing
// to run on the landed tree. (COMPARE=1 still works: it reads the kept
// per-seed JSONs.)
if (process.env.COMPARE !== '1') {
  for (const f of ['./policies/wildrange.js', './policies/fleedirectwild.js']) {
    try {
      if (!fs.existsSync(require('path').join(__dirname, f))) {
        console.log('INFO-SKIP: ' + f + ' absent (killed arm, layer deleted per kill protocol). Pre-kill pilot stands; nothing to run on the landed tree.');
        process.exit(0);
      }
    } catch (e) {}
  }
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// wildrange is required lazily: COMPARE=1 must work post-kill (it only reads
// the kept per-seed JSONs) when the substrate file is deleted.
function getWildrange() { return require('./policies/wildrange').wildrange; }

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// cause-family mapper (warroad metric-review convention): strip the
// player:/villager: prefix; named monsters -> the `monster` family.
function familyOf(cause) {
  let c = String(cause || 'unknown');
  c = c.replace(/^(player|villager):/i, '');
  const monsters = /eater|highbeam|hushwolf|bulldozer|toad|moth|deer|boar|nevermore|night court|audit|reunion|cancellation|editor|suburb|ducks|flashbulb|choir|lockpick|hummice|speedbump|nightlight|grief|static|paparazzo|heckler|landlord|understudy|moderator|warranty|nostalgia|inspiration|review|kite|union|spool|chorus|gavel|terms|callback|buffering|redactor|mosquito|tick/i;
  if (monsters.test(c)) return 'monster';
  return c.toLowerCase();
}

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'fdwild-' + seed, fullTelemetry: false });
  await setupGame(Game);
  const wr = getWildrange();
  const policy = Object.assign({}, wr);
  const baseDaily = wr.daily;
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const acc = {
    checks: 0, refusals: 0, refuseByReason: {}, fledHeld: 0, dirPushes: 0, fled: 0,
    rangeRuns: 0, rangeLegs: 0, rangeEngaged: 0,
  };
  let runCtx = null;
  policy.daily = (G, c) => {
    runCtx = c;
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) {}
    return baseDaily(G, c);
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const c = runCtx || {};
  acc.checks = c.fdWildChecks || 0; acc.refusals = c.fdWildRefusals || 0;
  acc.refuseByReason = c.fdWildRefuseByReason || {};
  acc.fledHeld = c.fledHeld || 0; acc.dirPushes = c.dirPushes || 0; acc.fled = c.fled || 0;
  acc.rangeRuns = c.rangeRuns || 0; acc.rangeLegs = c.rangeLegs || 0; acc.rangeEngaged = c.rangeEngaged || 0;
  const end = stdSnapshot(Game);
  const deaths = (result.samples.deaths || []).map(d => ({
    day: d.day, kind: d.kind, who: d.who, cause: d.cause, player: !!d.player,
    family: familyOf(d.cause),
  }));
  const scholarCombat = deaths.filter(d => d.player && /combat|fight|monster|kill/i.test(d.cause || '')).length;
  const scholarAny = deaths.filter(d => d.player).length;
  let villagerDays = 0;
  try { for (const row of (result.samples.pop || [])) villagerDays += (row[1] || 0); } catch (e) {}
  return {
    policy: 'wildrange', seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, villagerDays,
    scholarCombatDeaths: scholarCombat, scholarDeaths: scholarAny,
    fd: acc,
  };
}

function aggregate(runs) {
  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
  const n = runs.length;
  const mid = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
  const famCount = {};
  const causeKeys = {};
  let starve = 0, scholarCombat = 0;
  for (const r of runs) {
    for (const d of r.deaths) {
      famCount[d.family] = (famCount[d.family] || 0) + 1;
      causeKeys[d.cause] = (causeKeys[d.cause] || 0) + 1;
      if (/starvation/i.test(d.cause || '')) starve++;
    }
    scholarCombat += r.scholarCombatDeaths;
  }
  const fdT = { checks: 0, refusals: 0, byReason: {}, fledHeld: 0, dirPushes: 0, fled: 0 };
  const rgT = { runs: 0, legs: 0, engaged: 0 };
  for (const r of runs) {
    fdT.checks += r.fd.checks; fdT.refusals += r.fd.refusals; fdT.fledHeld += r.fd.fledHeld;
    fdT.dirPushes += r.fd.dirPushes; fdT.fled += r.fd.fled;
    rgT.runs += r.fd.rangeRuns; rgT.legs += r.fd.rangeLegs; rgT.engaged += r.fd.rangeEngaged;
    for (const k of Object.keys(r.fd.refuseByReason || {})) {
      fdT.byReason[k] = (fdT.byReason[k] || 0) + r.fd.refuseByReason[k];
    }
  }
  return {
    n, medianDays: mid, days: daysArr,
    maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
    national: runs.reduce((t, r) => t + r.national, 0),
    table: runs.reduce((t, r) => t + r.table, 0),
    wins: runs.reduce((t, r) => t + r.won, 0),
    wave4: runs.filter(r => r.waveReach >= 4).length,
    wave5: runs.filter(r => r.waveReach >= 5).length,
    maxArc: Math.max.apply(null, runs.map(r => r.maxArc).concat([1])),
    starveDeaths: starve, scholarCombatDeaths: scholarCombat,
    deathFamilies: famCount, deathCauses: causeKeys,
    refusal: fdT, range: rgT,
  };
}

// INSTRUMENT-HONESTY GATE: SMOKE=1 runs BEFORE any sweep spend and FAILS
// LOUDLY unless (a) the policy is genuinely driving (unwrapped daily is a
// function; the harness invokes it; the range leg fires legs in 15 days)
// and (b) with WILDRANGE=1 + COMPETENT_DIRECTIONAL_FLEE=1 + FLEEDIRECTWILD=1
// the refusal fires through the real fight path on a scripted hurt/hungry
// wilderness disengage (fdWildRefusals > 0).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  process.env.WILDRANGE = '1';
  process.env.COMPETENT_DIRECTIONAL_FLEE = '1';
  const wr0 = getWildrange();
  check('unwrapped policy.daily is a function', wr0 && typeof wr0.daily === 'function');
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure.'); process.exit(1); }
  let rangeLegs = 0;
  {
    const wr1 = getWildrange();
    const policy = Object.assign({}, wr1);
    const baseDaily = wr1.daily;
    let runCtx = null;
    policy.daily = function (G, c) { runCtx = c; return baseDaily(G, c); };
    const { Game } = await loadGame({ seed: 11, mode: 'fdwild-smoke', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    check('policy drives (mean calls/day > 0)', meanCalls > 0, 'mean=' + meanCalls.toFixed(2));
    rangeLegs = (runCtx && runCtx.rangeLegs) || 0;
    check('the substrate ranges (rangeLegs > 0 in 15d)', rangeLegs > 0, 'legs=' + rangeLegs);
  }
  {
    // (b) the refusal fires through the real fight path on a scripted
    // hurt/hungry wilderness disengage.
    process.env.FLEEDIRECTWILD = '1';
    const { competent, chooseFleeDir } = require('./policies/competent');
    const { Game } = await loadGame({ seed: 66, mode: 'fdwild-smoke-b', fullTelemetry: false });
    await setupGame(Game);
    Game.map.px = 4; Game.map.py = 6;
    Game.state.scholar.seenTiles = {};
    try {
      const wm = Game.worldMonsters();
      wm.length = 0;
      wm.push({ id: 'test_mon', tx: 4, ty: 5, hp: 50, maxHp: 50 });
    } catch (e) {}
    const s = Game.state.scholar;
    s.health = 100;
    try { s.kcal = Math.floor(Game.kcalCap() * 0.2); } catch (e) { s.kcal = 400; }
    s.hydration = 80; s.energy = 100; s.trauma = 0;
    Game.startCombat('hushwolf');
    const f = Game.tbfight;
    check('scripted fight started', !!f);
    let refusals = 0, pushes = 0;
    if (f) {
      const mo = f.fighters.find(x => x.kind === 'monster');
      mo.hp = 300; mo.maxHp = 300;
      const p0 = Game.tbFighter('p');
      p0.hp = 20; p0.maxHp = Math.max(p0.maxHp || 100, 100); p0.alive = true;
      const ctx = {};
      let calls = 0;
      while (Game.tbfight && !Game.tbfight.over && calls < 3 && !Game.over) {
        if (!Game.tbIsPlayerTurn()) break;
        let handled = false;
        try { handled = competent.fight(Game, ctx); } catch (e) { break; }
        if (!handled) break;
        calls++;
      }
      refusals = ctx.fdWildRefusals || 0;
      pushes = ctx.dirPushes || 0;
    }
    check('FLEEDIRECTWILD=1: the refusal fires (fdWildRefusals>0)', refusals > 0, 'refusals=' + refusals);
    check('no push into the unknown (dirPushes==0)', pushes === 0, 'pushes=' + pushes);
    delete process.env.FLEEDIRECTWILD;
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} gate(s) failed — the suite would measure nothing.`); process.exit(1); }
  console.log('\nSMOKE GREEN — instruments are honest.');
}

function printVerdict() {
  const dir = 'evidence/2026-10-14';
  const ctrl = JSON.parse(fs.readFileSync(`${dir}/fdwild-control.json`, 'utf8'));
  const arm = JSON.parse(fs.readFileSync(`${dir}/fdwild-armed.json`, 'utf8'));
  const A = ctrl.agg, B = arm.agg;
  console.log('== fleedirectwild pilot verdict (8 seeds x 150d death-aware, identical seeds) ==');
  console.log(`PRIMARY bar 1: armed wilderness-disengage refusals >= 5 on 8 seeds — armed fired ${B.refusal.refusals}`);
  console.log(`PRIMARY bar 2: armed scholar combat deaths <= control-2 — armed ${B.scholarCombatDeaths} vs control ${A.scholarCombatDeaths} (need <= ${A.scholarCombatDeaths - 2})`);
  console.log(`median days: armed ${B.medianDays} vs control ${A.medianDays} (guardrail >= ${A.medianDays - 10})`);
  console.log(`national: armed ${B.national}/8 vs control ${A.national}/8 (guardrail >= ${A.national - 2})`);
  console.log(`starvation: armed ${B.starveDeaths} vs control ${A.starveDeaths} (guardrail <= ${A.starveDeaths + 9})`);
  console.log(`refusal reasons armed: ${JSON.stringify(B.refusal.byReason)}`);
  console.log(`range: control ${A.range.legs} legs / armed ${B.range.legs} legs`);
  console.log(`armed-only death families: ${Object.keys(B.deathFamilies).filter(k => !A.deathFamilies[k]).join(', ') || '(none)'}`);
}

(async () => {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  if (process.env.COMPARE === '1') { printVerdict(); return; }
  const side = process.env.SIDE || 'control';
  const out = process.env.OUT;
  console.log(`fdwild pilot: side=${side} WILDRANGE=${process.env.WILDRANGE || '(unset)'} DIRFLEE=${process.env.COMPETENT_DIRECTIONAL_FLEE || '(unset)'} FDWILD=${process.env.FLEEDIRECTWILD || '(unset)'}`);
  const runs = [];
  for (const seed of SEEDS) {
    const r = await oneRun(seed, DAYS);
    runs.push(r);
    console.log(`  seed ${seed}: days=${r.days} end=${r.endReason} nat=${r.national} w4=${r.waveReach >= 4} scholarCombat=${r.scholarCombatDeaths} refusals=${r.fd.refusals} checks=${r.fd.checks} rangeLegs=${r.fd.rangeLegs} engaged=${r.fd.rangeEngaged}`);
  }
  const agg = aggregate(runs);
  console.log(`aggregate: median=${agg.medianDays} national=${agg.national}/8 table=${agg.table}/8 wins=${agg.wins}/8 w4=${agg.wave4}/8 w5=${agg.wave5}/8 starve=${agg.starveDeaths} scholarCombat=${agg.scholarCombatDeaths} refusals=${agg.refusal.refusals}`);
  if (out) {
    fs.writeFileSync(out, JSON.stringify({ side, seeds: SEEDS, agg, runs }, null, 2));
    console.log('wrote ' + out);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
