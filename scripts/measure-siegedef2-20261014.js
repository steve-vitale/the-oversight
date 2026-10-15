#!/usr/bin/env node
// scripts/measure-siegedef2-20261014.js — SIEGEDEF2 (r33) pilot measurement.
//
// Pre-registered (evidence/2026-10-14/sim-siegedef2-r33.md header):
//   SUBSTRATE: leadfeast, FEASTSCALE_R13=1 (the plentycost road).
//   CONTROL: SIEGEDEF2 unset (pure leadfeast delegation).
//   ARMED: SIEGEDEF2=1 (the Haven watch + scholar engage judgment).
//   Same code tree, identical seeds, env-var only.
//   PRIMARY: post-unlock scholar combat deaths per unlocker
//     <= control x 0.70 (control re-measured on current tip: 5.17 -> GO <= 3.62).
//   GUARDRAILS: median >= control-5d; national >= control-4; table >=
//     control-1; wave-5 unlocks >= control-1; no new death mode.
//   HORIZON: 180d death-aware. SEEDS: 11/22/33/44/55/66/77/88 + 303.
//   A miss is NO-GO — never re-scored against a friendlier metric mid-run.
//   Confirm (12-16 seeds) ONLY if GO at pilot.
//
// Attribution instrument: the w5death-audit playerDeath wrap + daily audit
// wrapper (read-only; trajectory-identical by construction), with the policy
// parameterized. Per-seed JSON carries every death's day/cause/location/
// killer-wave/depth.
//
// Usage:
//   SIDE=control OUT=evidence/2026-10-14/siegedef2-control.json \
//     node scripts/measure-siegedef2-20261014.js
//   SIDE=armed OUT=evidence/2026-10-14/siegedef2-armed.json SIEGEDEF2=1 \
//     node scripts/measure-siegedef2-20261014.js
//   SMOKE=1 node scripts/measure-siegedef2-20261014.js   # instrument gate
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { siegeleadfeast } = require('./policies/siegedef2');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88, 303];
const DAYS = 180;

function monsterWave(Game, monsterId) {
  try {
    const md = (Game.data.monsters || []).find(m => m.id === monsterId);
    return md ? (md.wave || null) : null;
  } catch (e) { return null; }
}

function epithetOf(Game, px, py) {
  try { return Game.nodeEpithet ? Game.nodeEpithet(px, py) : '?'; }
  catch (e) { return '?'; }
}

async function runSeed(seed, basePolicy) {
  const { Game } = await loadGame({ seed, mode: 'siegedef2-' + (process.env.SIEGEDEF2 === '1' ? 'armed' : 'control') });
  await setupGame(Game);
  const audit = {
    playerDeaths: [], unlockDay5: null, standingAtUnlock: null,
    tableDay: null, tableEver: false, nationalDays: 0, maxUnlocked: 1,
  };
  let runCtx = null;

  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    const rec = { day: null, cause: cause || '?', who: '?', depth: null, loc: null, fight: null };
    try {
      const s = Game.state.scholar || {};
      rec.day = s.day || 0;
      try { rec.who = String(Game.villagerId || '?'); } catch (e) {}
      try {
        const f = Game.tbfight;
        if (f && f.fighters) {
          rec.fight = {
            over: !!f.over,
            monsters: f.fighters
              .filter(x => x && x.kind === 'monster')
              .map(x => ({
                name: x.monsterName || x.name || x.monsterId || '?',
                monsterId: x.monsterId || null,
                wave: monsterWave(Game, x.monsterId),
                alive: x.alive !== false,
                fled: !!x.fled,
              })),
          };
        }
      } catch (e) { rec.fightErr = String((e && e.message) || e).slice(0, 80); }
      try {
        const px = Game.map.px, py = Game.map.py;
        rec.loc = { node: [px, py], epithet: epithetOf(Game, px, py), insideHaven: !!s.insideHaven };
      } catch (e) { rec.loc = { epithet: '?' }; }
    } catch (e) { rec.capErr = String((e && e.message) || e).slice(0, 80); }
    audit.playerDeaths.push(rec);
    try { origPD(cause); }
    finally {
      try { rec.depth = Game.lineage().length; }
      catch (e) { rec.depth = audit.playerDeaths.length; }
    }
  };

  const policy = Object.assign({}, basePolicy);
  const origDaily = basePolicy.daily ? basePolicy.daily.bind(basePolicy) : null;
  policy.daily = (G, ctx) => {
    runCtx = ctx;
    try {
      const day = (G.state.scholar || {}).day || 0;
      const uw = G.unlockedWave ? G.unlockedWave() : 1;
      if (uw > audit.maxUnlocked) audit.maxUnlocked = uw;
      if (uw >= 5 && audit.unlockDay5 == null) {
        audit.unlockDay5 = day;
        try { audit.standingAtUnlock = (G.villageStanding() || {}).total | 0; } catch (e) {}
      }
      try {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting && !audit.tableEver) { audit.tableEver = true; audit.tableDay = day; }
      } catch (e) {}
      try {
        const r = G.scaleRank ? G.scaleRank() : 'village';
        if (r === 'national' || r === 'global') audit.nationalDays++;
      } catch (e) {}
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });

  let arc = 1, won = false;
  try { arc = (Game.progState ? Game.progState() : {}).arc || 1; } catch (e) {}
  try { won = !!Game.won; } catch (e) {}
  const sd = {};
  if (runCtx) {
    for (const k of ['sdMusters', 'sdRotations', 'sdShelters', 'sdTends',
      'sdJudgments', 'sdEngages', 'sdDisengages', 'sdWalks', 'sdBarrierPushes',
      'sdPushStalls', '_sdUnlockDay']) {
      if (runCtx[k] !== undefined) sd[k] = runCtx[k];
    }
  }
  return {
    seed, days: result.days, endReason: result.endReason,
    maxUnlocked: audit.maxUnlocked, unlockDay5: audit.unlockDay5,
    standingAtUnlock: audit.standingAtUnlock,
    tableEver: audit.tableEver, tableDay: audit.tableDay,
    nationalDays: audit.nationalDays, arc, won,
    playerDeaths: audit.playerDeaths, sd,
  };
}

function aggregate(rows) {
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const unlockers = rows.filter(r => r.unlockDay5 != null);
  let postCombat = 0;
  const modes = {};
  for (const r of rows) {
    for (const d of r.playerDeaths) {
      modes[d.cause] = (modes[d.cause] || 0) + 1;
      if (r.unlockDay5 != null && d.day >= r.unlockDay5 && d.cause === 'combat') postCombat++;
    }
  }
  const sdT = {};
  for (const r of rows) for (const k of Object.keys(r.sd || {})) sdT[k] = (sdT[k] || 0) + (r.sd[k] || 0);
  return {
    n: rows.length,
    unlockers: unlockers.length,
    postUnlockCombatDeaths: postCombat,
    perUnlocker: unlockers.length ? +(postCombat / unlockers.length).toFixed(2) : null,
    medianDays: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    days: daysArr,
    national: rows.filter(r => r.nationalDays > 0).length,
    table: rows.filter(r => r.tableEver).length,
    wins: rows.filter(r => r.won).length,
    wave4: rows.filter(r => r.maxUnlocked >= 4).length,
    wave5: rows.filter(r => r.maxUnlocked >= 5).length,
    deathModes: modes,
    siege: sdT,
  };
}

// INSTRUMENT-HONESTY GATE: SMOKE=1 runs short live smokes BEFORE any sweep
// spend and FAILS LOUDLY unless (a) the policy genuinely drives (unwrapped
// daily is a function; harness invokes it; >=1 policy-origin deliberate
// act), and (b) with SIEGEDEF2=1 the layer fires: a scripted post-unlock
// daily musters the watch (sdMusters>0) and a scripted siege fight is
// judged (sdJudgments>0).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  check('unwrapped policy.daily is a function', typeof siegeleadfeast.daily === 'function');
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure.'); process.exit(1); }
  const policy = Object.assign({}, siegeleadfeast);
  const { Game } = await loadGame({ seed: 11, mode: 'siegedef2-smoke', fullTelemetry: false });
  await setupGame(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  let policyActs = 0;
  try {
    for (const row of (result.pacing.perDay || [])) {
      for (const k of Object.keys(row.acts || {})) if (k.indexOf('policy:') === 0) policyActs += row.acts[k];
    }
  } catch (e) {}
  check('harness invokes policy.daily (meanCalls/day>0)', meanCalls > 0, 'mean=' + meanCalls);
  check('>=1 policy-origin deliberate act', policyActs > 0, 'policyActs=' + policyActs);

  process.env.SIEGEDEF2 = '1';
  // (b1) the watch musters on a scripted post-unlock day at haven
  {
    const { Game: G2 } = await loadGame({ seed: 12, mode: 'siegedef2-smoke2' });
    await setupGame(G2);
    const v = G2.state.village || {};
    G2.map.px = v.px != null ? v.px : 4; G2.map.py = v.py != null ? v.py : 4;
    v.trust = v.trust || {};
    for (const rid of (v.roster || [])) if (rid !== G2.villagerId) v.trust[rid] = 80;
    const ctx = { _sdUnlockDay: (G2.state.scholar || {}).day || 0 };
    const p2 = Object.assign({}, siegeleadfeast);
    try { p2.daily(G2, ctx); } catch (e) {}
    check('SIEGEDEF2=1: post-unlock daily musters the watch (sdMusters>0)',
      (ctx.sdMusters || 0) > 0, 'musters=' + (ctx.sdMusters || 0));
  }
  // (b2) the scholar judgment fires on a scripted siege fight
  {
    const { Game: G3 } = await loadGame({ seed: 13, mode: 'siegedef2-smoke3' });
    await setupGame(G3);
    const v3 = G3.state.village || {};
    G3.map.px = v3.px != null ? v3.px : 4; G3.map.py = v3.py != null ? v3.py : 4;
    try { G3.state.village.positions = {}; } catch (e) {}
    G3.unlockedWave = () => 5;
    G3.startCombat('cancellation');
    const ctx = {};
    if (G3.tbfight) {
      let n = 0;
      while (G3.tbfight && !G3.tbfight.over && n++ < 4 && !G3.over) {
        if (!G3.tbIsPlayerTurn()) break;
        try { siegeleadfeast.fight(G3, ctx); } catch (e) { break; }
        if ((ctx.sdJudgments || 0) >= 1) break;
      }
    }
    check('SIEGEDEF2=1: the layer judges the siege fight (sdJudgments>0)',
      (ctx.sdJudgments || 0) > 0, 'judgments=' + (ctx.sdJudgments || 0));
  }
  delete process.env.SIEGEDEF2;
  console.log(fails.length ? `\nSMOKE STOP: ${fails.length} failure(s)` : '\nSMOKE GREEN — policy genuinely drives, siegedef2 layer fires');
  process.exit(fails.length ? 1 : 0);
}

async function main() {
  const side = process.env.SIDE || 'control';
  const out = process.env.OUT;
  if (!out) { console.error('OUT required'); process.exit(2); }
  const armed = process.env.SIEGEDEF2 === '1';
  const base = armed ? siegeleadfeast : leadfeast;
  console.log(`siegedef2 pilot: side=${side} SIEGEDEF2=${armed ? '1' : '(unset)'} FEASTSCALE_R13=1`);
  const rows = [];
  for (const seed of SEEDS) {
    const r = await runSeed(seed, base);
    rows.push(r);
    const post = r.unlockDay5 != null
      ? r.playerDeaths.filter(d => d.day >= r.unlockDay5 && d.cause === 'combat').length : '-';
    console.log(`  seed ${seed}: days=${r.days} end=${r.endReason} wave<=${r.maxUnlocked} unlock=${r.unlockDay5 == null ? 'no' : 'd' + r.unlockDay5} postCombat=${post} sd=${JSON.stringify(r.sd)}`);
  }
  const agg = aggregate(rows);
  const payload = {
    side, siegedef2: armed ? '1' : null, feastscale_r13: '1',
    generated: new Date().toISOString(), seeds: SEEDS, days: DAYS, agg, rows,
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 1));
  console.log('wrote ' + out);
  console.log(JSON.stringify(agg, null, 2));
}

if (process.env.SMOKE === '1') { smokeGate(); return; }
main().catch(e => { console.error('FATAL', e); process.exit(1); });
