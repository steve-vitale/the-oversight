#!/usr/bin/env node
// scripts/sweep-siegedef3-20261014.js — 8-seed pilot sweep for the siegedef3
// Haven siege-defense doctrine (sim-findings #96 w5death blank).
//
// Control: leadfeast + FEASTSCALE_R13=1 (the plentycost road substrate).
// Armed:   siegedef3 + FEASTSCALE_R13=1 + SIEGEDEF3=1.
// Seeds: 11/22/33/44/55/66/77/88 (the plentycost road). Horizon: 180d
// death-aware (runDays stops on Game.over / village-dead tail).
//
// Pre-registered (evidence header):
//   PRIMARY: post-unlock scholar combat deaths per unlocker <= control x 0.70
//   GUARDRAILS: median survival >= control-5d; national >= control-4;
//     table >= control-1; wave-5 unlocks >= control-1; no new death mode.
// Attribution instrument: playerDeath wrap (cause/day/location/killer wave)
// + daily unlock/table/national tracking — the w5death-audit pattern.
//
// Usage:
//   node scripts/sweep-siegedef3-20261014.js
//   SMOKE=1 node scripts/sweep-siegedef3-20261014.js   # instrument-honesty gate
//   OUT=evidence/2026-10-14/siegedef3-pilot.json node scripts/sweep-siegedef3-20261014.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
// LAYER-DELETED GRACE (kill protocol 2026-10-14): the siegedef3 policy was
// deleted after the pilot NO-GO (see evidence/2026-10-14/sim-siegedef3.md).
// Without the layer the armed side cannot run — exit cleanly, not with a
// MODULE_NOT_FOUND crash. (Sweep was run before deletion; see
// evidence/2026-10-14/siegedef3-pilot.json.)
let siegedef3mod = null;
try { siegedef3mod = require('./policies/siegedef3'); }
catch (e) {
  if (process.env.SMOKE !== '1') {
    console.log('LAYER DELETED per kill protocol — sweep not runnable without scripts/policies/siegedef3.js.');
    console.log('(Was run before deletion; see evidence/2026-10-14/siegedef3-pilot.json.)');
    process.exit(0);
  }
  console.log('SMOKE with deleted layer: unwrap check skipped (layer deleted per kill protocol).');
  process.exit(0);
}
const { siegedef3 } = siegedef3mod; // NAMED export (r20b)
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-14', 'siegedef3-pilot.json');

function monsterWave(Game, monsterId) {
  try {
    const md = (Game.data.monsters || []).find(m => m.id === monsterId);
    return md ? (md.wave || null) : null;
  } catch (e) { return null; }
}

async function runSeed(seed, policyId) {
  const armed = policyId === 'siegedef3';
  if (armed) process.env.SIEGEDEF3 = '1'; else delete process.env.SIEGEDEF3;
  const base = armed ? siegedef3 : leadfeast;
  const { Game } = await loadGame({ seed, mode: 'siegedef3-' + policyId });
  await setupGame(Game);
  const audit = { playerDeaths: [], unlockDay5: null, tableDay: null, tableEver: false, nationalDays: 0, maxUnlocked: 1 };

  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    const rec = { day: null, cause: cause || '?', loc: null, monsters: [] };
    try {
      const s = Game.state.scholar || {};
      rec.day = s.day || 0;
      try {
        const f = Game.tbfight;
        if (f && f.fighters) {
          for (const x of f.fighters) {
            if (x && x.kind === 'monster') rec.monsters.push({ id: x.monsterId || '?', wave: monsterWave(Game, x.monsterId) });
          }
        }
      } catch (e) {}
      try { rec.loc = (Game.nodeEpithet ? Game.nodeEpithet(Game.map.px, Game.map.py) : '?'); } catch (e) { rec.loc = '?'; }
    } catch (e) {}
    audit.playerDeaths.push(rec);
    return origPD(cause);
  };

  const policy = Object.assign({}, base);
  const origDaily = base.daily ? base.daily.bind(base) : null;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const uw = G.unlockedWave ? G.unlockedWave() : 1;
      if (uw > audit.maxUnlocked) audit.maxUnlocked = uw;
      if (uw >= 5 && audit.unlockDay5 == null) audit.unlockDay5 = day;
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

  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });

  let arc = 1, won = false;
  try { arc = (Game.progState ? Game.progState() : {}).arc || 1; } catch (e) {}
  try { won = !!Game.won; } catch (e) {}
  // doctrine telemetry (armed side): ctx stashed on Game by siegedef3.setup
  let sd = null;
  try {
    const c = Game._sdCtx || {};
    if (armed) sd = {
      triaged: c.sdTriaged || 0, faced: c.sdFaced || 0, driven: c.sdDriven || 0,
      drivenByWave: c.sdDrivenByWave || {}, firstDrive: c.sdFirstDrive || null,
      firstFace: c.sdFirstFace || null,
    };
  } catch (e) {}
  return {
    seed, policyId, days: result.days, endReason: result.endReason,
    maxUnlocked: audit.maxUnlocked, unlockDay5: audit.unlockDay5,
    tableEver: audit.tableEver, tableDay: audit.tableDay,
    nationalDays: audit.nationalDays, arc, won,
    deaths: audit.playerDeaths, sd,
  };
}

// NOTE: runDays does not return ctx; the doctrine counters live on the ctx
// object the policy closed over. Capture them via a second wrapper: the
// policy object we pass is fresh per seed, so stash a ref.
async function runSeedWithCtx(seed, policyId) {
  const row = await runSeed(seed, policyId);
  return row;
}

function summarize(rows) {
  const unlockers = rows.filter(r => r.unlockDay5 != null);
  let postCombat = 0;
  const deathModes = {};
  for (const r of unlockers) {
    for (const d of r.deaths) {
      if (d.day < r.unlockDay5) continue;
      const k = d.cause + (d.monsters.some(m => m.wave === 5) ? ':w5' : '');
      deathModes[k] = (deathModes[k] || 0) + 1;
      if (d.cause === 'combat') postCombat++;
    }
  }
  const days = rows.map(r => r.days).sort((a, b) => a - b);
  const doctrine = { triaged: 0, faced: 0, driven: 0, drivenByWave: {} };
  for (const r of rows) {
    if (!r.sd) continue;
    doctrine.triaged += r.sd.triaged || 0;
    doctrine.faced += r.sd.faced || 0;
    doctrine.driven += r.sd.driven || 0;
    for (const [w, n] of Object.entries(r.sd.drivenByWave || {})) doctrine.drivenByWave[w] = (doctrine.drivenByWave[w] || 0) + n;
  }
  return {
    n: rows.length,
    unlockers: unlockers.length,
    postUnlockCombatDeaths: postCombat,
    postUnlockCombatPerUnlocker: unlockers.length ? postCombat / unlockers.length : 0,
    medianDays: days[Math.floor(days.length / 2)],
    national: rows.filter(r => r.nationalDays > 0).length,
    table: rows.filter(r => r.tableEver).length,
    wave5: rows.filter(r => r.maxUnlocked >= 5).length,
    won: rows.filter(r => r.won).length,
    deathModes,
    doctrine,
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  check('named export unwraps (r20b)', !!(siegedef3 && siegedef3.id === 'siegedef3'), 'id=' + (siegedef3 && siegedef3.id));
  check('unwrapped daily is a function', typeof siegedef3.daily === 'function', '');
  check('control unwraps', !!(leadfeast && leadfeast.id === 'leadfeast'), '');
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  // harness drives the armed policy; the wrap installs.
  process.env.SIEGEDEF3 = '1';
  const { Game } = await loadGame({ seed: 11, mode: 'siegedef3-smoke' });
  await setupGame(Game);
  const before = Game.drawFeastScavenger;
  const policy = Object.assign({}, siegedef3);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 10, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  check('harness drives armed policy.daily', meanCalls > 0, 'mean=' + meanCalls);
  check('SIEGEDEF3=1: triage wrap installed by setup', Game.drawFeastScavenger !== before, '');
  delete process.env.SIEGEDEF3;
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: unwrap honest, harness drives the armed policy, wrap installs.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of ['leadfeast', 'siegedef3']) {
      console.log(`[siegedef3] seed ${seed} policy ${pid} ...`);
      const row = await runSeedWithCtx(seed, pid);
      rows.push(row);
      console.log(`  -> ${row.days}d ${row.endReason} wave≤${row.maxUnlocked} unlock=${row.unlockDay5 == null ? 'no' : 'd' + row.unlockDay5} table=${row.tableEver ? 'd' + row.tableDay : 'no'} deaths=${row.deaths.length}`);
    }
  }
  const control = summarize(rows.filter(r => r.policyId === 'leadfeast'));
  const armed = summarize(rows.filter(r => r.policyId === 'siegedef3'));
  console.log('--- CONTROL (leadfeast) ---');
  console.log(JSON.stringify(control, null, 1));
  console.log('--- ARMED (siegedef3) ---');
  console.log(JSON.stringify(armed, null, 1));

  // pre-registered verdict
  const primaryGO = armed.postUnlockCombatPerUnlocker <= control.postUnlockCombatPerUnlocker * 0.70;
  const gMedian = armed.medianDays >= control.medianDays - 5;
  const gNational = armed.national >= control.national - 4;
  const gTable = armed.table >= control.table - 1;
  const gWave5 = armed.wave5 >= control.wave5 - 1;
  const controlModes = new Set(Object.keys(control.deathModes));
  const newModes = Object.keys(armed.deathModes).filter(k => !controlModes.has(k));
  const gModes = newModes.length === 0;
  console.log('--- PRE-REGISTERED VERDICT ---');
  console.log(`PRIMARY postUnlockCombatPerUnlocker ${armed.postUnlockCombatPerUnlocker.toFixed(2)} <= ${control.postUnlockCombatPerUnlocker.toFixed(2)} x 0.70 = ${(control.postUnlockCombatPerUnlocker * 0.70).toFixed(2)}: ${primaryGO ? 'GO' : 'NO-GO'}`);
  console.log(`guardrail median ${armed.medianDays} >= ${control.medianDays - 5}: ${gMedian ? 'PASS' : 'FAIL'}`);
  console.log(`guardrail national ${armed.national} >= ${control.national - 4}: ${gNational ? 'PASS' : 'FAIL'}`);
  console.log(`guardrail table ${armed.table} >= ${control.table - 1}: ${gTable ? 'PASS' : 'FAIL'}`);
  console.log(`guardrail wave5 ${armed.wave5} >= ${control.wave5 - 1}: ${gWave5 ? 'PASS' : 'FAIL'}`);
  console.log(`guardrail no-new-death-mode: ${gModes ? 'PASS' : 'FAIL — ' + newModes.join(',')}`);
  const verdict = (primaryGO && gMedian && gNational && gTable && gWave5 && gModes) ? 'GO' : 'NO-GO';
  console.log(`VERDICT: ${verdict}`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    generated: new Date().toISOString(), seeds: SEEDS, days: DAYS,
    control: 'leadfeast+FEASTSCALE_R13=1', armed: 'siegedef3+FEASTSCALE_R13=1+SIEGEDEF3=1',
    summary: { control, armed },
    verdict: { primaryGO, gMedian, gNational, gTable, gWave5, gModes, newModes, verdict },
    rows,
  }, null, 1));
  console.log(`wrote ${OUT}`);
  if (verdict !== 'GO') process.exit(2);
}

if (require.main === module) { main().catch(e => { console.error('FATAL', e); process.exit(1); }); }
module.exports = { runSeed: runSeedWithCtx, SEEDS, DAYS, summarize };
