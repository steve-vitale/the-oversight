#!/usr/bin/env node
// scripts/measure-roster-20261015.js — SIEGEROSTER (r38) pilot measurement.
//
// Pre-registered (evidence/2026-10-15/sim-siegeroster.md header):
//   SUBSTRATE: leadfeast, FEASTSCALE_R13=1 (the siegedef2r road).
//   CONTROL: SIEGEROSTER unset (pure leadfeast delegation).
//   ARMED: SIEGEROSTER=1 (go-to-ground: hold Haven + shelter danger duties
//     + narrated muster, threat-gated on wave>=4 within 2 of Haven).
//   Same code tree, identical seeds, env-var only. Policy-side only.
//   PRIMARY: post-unlock villager (non-scholar, kind villager/person, never
//     monsters) combat deaths per wave-5 unlocker <= control x 0.70.
//   CO-PRIMARY: post-unlock scholar combat deaths per unlocker <= control
//     (must not trade scholar for roster).
//   GUARDRAILS: median >= control-10d; national >= control-2; no new death
//     mode (family level); table/wins not regressed.
//   HORIZON: 180d death-aware. SEEDS: 11/22/33/44/55/66/77/88 (pilot 8).
//   A miss is NO-GO — never re-scored against a friendlier metric mid-run.
//   Confirm (12-16 seeds) ONLY if GO at pilot.
//
// Usage:
//   SIDE=control OUT=evidence/2026-10-15/siegeroster-control.json \
//     node scripts/measure-roster-20261015.js
//   SIDE=armed OUT=evidence/2026-10-15/siegeroster-armed.json SIEGEROSTER=1 \
//     node scripts/measure-roster-20261015.js
//   SMOKE=1 node scripts/measure-roster-20261015.js   # instrument gate
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { siegerosterleadfeast } = require('./policies/siegeroster');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;

async function runSeed(seed, basePolicy) {
  const armed = process.env.SIEGEROSTER === '1';
  const { Game } = await loadGame({
    seed, mode: 'siegeroster-' + (armed ? 'armed' : 'control'),
    fullTelemetry: true,
  });
  await setupGame(Game);
  const audit = {
    unlockDay5: null, maxUnlocked: 1, nationalDays: 0,
    tableEver: false, won: false,
  };
  let runCtx = null;

  const policy = Object.assign({}, basePolicy);
  const origDaily = basePolicy.daily ? basePolicy.daily.bind(basePolicy) : null;
  policy.daily = (G, ctx) => {
    runCtx = ctx;
    try {
      const day = (G.state.scholar || {}).day || 0;
      const uw = G.unlockedWave ? G.unlockedWave() : 1;
      if (uw > audit.maxUnlocked) audit.maxUnlocked = uw;
      if (uw >= 5 && audit.unlockDay5 == null) audit.unlockDay5 = day;
      const r = G.scaleRank ? G.scaleRank() : 'village';
      if (r === 'national' || r === 'global') audit.nationalDays++;
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) audit.tableEver = true;
      if (G.won) audit.won = true;
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });

  // Villager (non-scholar) combat deaths, post-unlock.
  const deaths = result.samples.deaths || [];
  const isVillagerCombat = (d) =>
    (d.kind === 'villager' || d.kind === 'person') && !d.player &&
    (d.cause === 'monster' || d.cause === 'combat');
  const postVDeaths = audit.unlockDay5 != null
    ? deaths.filter(d => isVillagerCombat(d) && d.day >= audit.unlockDay5) : [];
  // Scholar combat deaths, post-unlock (co-primary).
  const postSDeaths = audit.unlockDay5 != null
    ? deaths.filter(d => d.player && d.cause === 'combat' && d.day >= audit.unlockDay5) : [];
  // Death modes (family level) for the no-new-mode guardrail.
  const modes = {};
  for (const d of deaths) {
    const fam = d.player ? 'scholar:' + d.cause :
      (d.kind === 'monster' ? 'monster' : 'villager:' + d.cause);
    modes[fam] = (modes[fam] || 0) + 1;
  }

  const sr = {};
  if (runCtx) {
    for (const k of ['srBeats', 'srGrounded', 'srHoldTravels', '_srUnlockDay']) {
      if (runCtx[k] !== undefined) sr[k] = runCtx[k];
    }
  }
  return {
    seed, days: result.days, endReason: result.endReason,
    maxUnlocked: audit.maxUnlocked, unlockDay5: audit.unlockDay5,
    nationalDays: audit.nationalDays, tableEver: audit.tableEver, won: audit.won,
    postVillagerCombatDeaths: postVDeaths.length,
    postScholarCombatDeaths: postSDeaths.length,
    deathModes: modes, sr,
  };
}

function aggregate(rows) {
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const unlockers = rows.filter(r => r.unlockDay5 != null);
  const pv = unlockers.reduce((t, r) => t + r.postVillagerCombatDeaths, 0);
  const ps = unlockers.reduce((t, r) => t + r.postScholarCombatDeaths, 0);
  const modes = {};
  for (const r of rows) for (const k of Object.keys(r.deathModes || {})) {
    if (k.indexOf('villager:') === 0 || k.indexOf('scholar:') === 0)
      modes[k] = (modes[k] || 0) + r.deathModes[k];
  }
  const srT = {};
  for (const r of rows) for (const k of Object.keys(r.sr || {})) srT[k] = (srT[k] || 0) + (r.sr[k] || 0);
  return {
    n: rows.length,
    unlockers: unlockers.length,
    postVillagerCombatDeaths: pv,
    villagerPerUnlocker: unlockers.length ? +(pv / unlockers.length).toFixed(2) : null,
    postScholarCombatDeaths: ps,
    scholarPerUnlocker: unlockers.length ? +(ps / unlockers.length).toFixed(2) : null,
    medianDays: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    days: daysArr,
    national: rows.filter(r => r.nationalDays > 0).length,
    table: rows.filter(r => r.tableEver).length,
    wins: rows.filter(r => r.won).length,
    wave5: rows.filter(r => r.maxUnlocked >= 5).length,
    deathModes: modes,
    roster: srT,
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  check('unwrapped policy.daily is a function', typeof siegerosterleadfeast.daily === 'function');
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure.'); process.exit(1); }
  const policy = Object.assign({}, siegerosterleadfeast);
  const { Game } = await loadGame({ seed: 11, mode: 'siegeroster-smoke', fullTelemetry: false });
  await setupGame(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  check('harness invokes policy.daily (meanCalls/day>0)', meanCalls > 0, 'mean=' + meanCalls);

  process.env.SIEGEROSTER = '1';
  // The layer fires: scripted post-unlock + threat at Haven -> muster beat.
  {
    const { Game: G2 } = await loadGame({ seed: 12, mode: 'siegeroster-smoke2' });
    await setupGame(G2);
    const v = G2.state.village || {};
    G2.map.px = v.px != null ? v.px : 4; G2.map.py = v.py != null ? v.py : 4;
    G2.unlockedWave = () => 5;
    // plant a wave-4 monster at Haven
    try {
      const wms = G2.worldMonsters ? G2.worldMonsters() : [];
      wms.push({ id: 'eater', tx: G2.map.px, ty: G2.map.py, hp: 100, maxHp: 100 });
    } catch (e) {}
    // one villager on a danger duty
    try {
      const roster = (v.roster || []).filter(id => id !== G2.villagerId);
      if (roster.length) {
        v.assignments = v.assignments || {};
        v.assignments[roster[0]] = { task: 'hunt' };
      }
    } catch (e) {}
    const said = [];
    const ogSay = G2.say.bind(G2);
    G2.say = (t) => { said.push(String(t)); return ogSay(t); };
    const ctx = { _srUnlockDay: (G2.state.scholar || {}).day || 0 };
    const p2 = Object.assign({}, siegerosterleadfeast);
    try { p2.daily(G2, ctx); } catch (e) { console.log('daily threw: ' + e.message); }
    check('SIEGEROSTER=1: muster beat fires (srBeats>0)',
      (ctx.srBeats || 0) > 0, 'beats=' + (ctx.srBeats || 0));
    check('muster beat is player-visible (📯 line)',
      said.some(t => /📯 MUSTER/.test(t)), 'said=' + said.filter(t => /📯/.test(t)).length);
    // goToGround is opportunistic: the base policy never assigns hunt/patrol/
    // scout, so it is usually 0. The mechanism is holdHaven + the beat.
    // (If the base ever does assign a danger duty, the layer pulls it.)
    console.log(`  INFO go-to-ground reassigns (srGrounded, opportunistic) — grounded=` + (ctx.srGrounded || 0));
  }
  delete process.env.SIEGEROSTER;
  console.log(fails.length ? `\nSMOKE STOP: ${fails.length} failure(s)` : '\nSMOKE GREEN — policy genuinely drives, siegeroster layer fires');
  process.exit(fails.length ? 1 : 0);
}

async function main() {
  const side = process.env.SIDE || 'control';
  const out = process.env.OUT;
  if (!out) { console.error('OUT required'); process.exit(2); }
  const armed = process.env.SIEGEROSTER === '1';
  const base = armed ? siegerosterleadfeast : leadfeast;
  console.log(`siegeroster pilot: side=${side} SIEGEROSTER=${armed ? '1' : '(unset)'} FEASTSCALE_R13=1`);
  const rows = [];
  for (const seed of SEEDS) {
    const r = await runSeed(seed, base);
    rows.push(r);
    console.log(`  seed ${seed}: days=${r.days} end=${r.endReason} wave<=${r.maxUnlocked} unlock=${r.unlockDay5 == null ? 'no' : 'd' + r.unlockDay5} postV=${r.postVillagerCombatDeaths} postS=${r.postScholarCombatDeaths} sr=${JSON.stringify(r.sr)}`);
  }
  const agg = aggregate(rows);
  const payload = {
    side, siegeroster: armed ? '1' : null, feastscale_r13: '1',
    generated: new Date().toISOString(), seeds: SEEDS, days: DAYS, agg, rows,
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 1));
  console.log('wrote ' + out);
  console.log(JSON.stringify(agg, null, 2));
}

if (process.env.SMOKE === '1') { smokeGate(); return; }
main().catch(e => { console.error('FATAL', e); process.exit(1); });
