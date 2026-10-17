#!/usr/bin/env node
// scripts/sweep-tricksurvive-20261017.js — sim-tricksurvive pilot sweep
// (flesh-out loop, axis scale-onramp, finding #433's named next: a
// performer-survival arm — can the trick-user live to land the kill?).
//
// QUESTION: does the performer-survival / companion-finisher discipline
// (trick-fight party assembly + post-performance yield, TRICKSURVIVE=1)
// convert more trick performances into trick-attributed kills than the base
// feast policies, on identical seeds?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: leadfeast, belongfeast (TRICKSURVIVE unset)
//   armed:   tricksurvive-lead, tricksurvive-belong (TRICKSURVIVE=1)
//
// Substrate: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1.
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9-12, 14 — BINDING, written
// before the pilot sweep):
//   PRIMARY: trick kill-attributed kills (attr) — waveKillLog entries with
//     a non-empty trick summary, INCLUDING companion-finished attributions
//     (by=<vid> via='companion' via the landed tricktag channel).
//     GO: (armed attr) - (control attr) >= 4 across the 16-run pilot.
//     KILL: miss -> delete scripts/policies/tricksurvive.js zero-trace per
//     kill protocol; keep instruments + evidence.
//   GUARDRAILS: scholar combat deaths <= control+2; national >= control-2
//     (per 8-seed set); median survival >= control-10d; no new death mode
//     (death-cause key sets compared).
//   Horizon: 180d death-aware (dead villages stop; the trick game plays
//     out across the whole run — wave-1/2 contacts happen all game).
//   Seeds: 8 FRESH [3701-3708] x {leadfeast, belongfeast} = 16 runs.
//     FRESH = 0 per-seed filename hits across evidence/ (verified before
//     the run).
//   Policies: leadfeast/belongfeast x control/armed.
//   Substrate: SEATDRIVE=0, FEASTSCALE_R13=1 (pre-seat by design).
//
// Usage:
//   SEEDS="3701,3702,3703,3704,3705,3706,3707,3708" DAYS=180 \
//   OUT=evidence/2026-10-17/sim-tricksurvive-pilot.json \
//   PERSEED=evidence/2026-10-17/perseed-tricksurvive \
//   node scripts/sweep-tricksurvive-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { tricksurviveLead, tricksurviveBelong } = require('./policies/tricksurvive');

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function nationalAt(Game) {
  try { const r = typeof Game.scaleRank === 'function' ? Game.scaleRank() : null; return (r === 'national' || r === 'global') ? 1 : 0; }
  catch (e) { return 0; }
}
function wonAt(Game) {
  try { return Game.won === true ? 1 : 0; } catch (e) { return 0; }
}
// Trick kill-attributed kills: waveKillLog entries with a non-empty trick
// summary — the trickSummary/tricktag channel, any killer, any via.
function trickAttr(Game) {
  const wkl = (Game.state || {}).waveKillLog || [];
  const all = wkl.filter(e => e && e.trick);
  const w12 = all.filter(e => ((e.w | 0) <= 2));
  const byVia = {};
  const byWave = {};
  for (const e of all) {
    byVia[e.via || '?'] = (byVia[e.via || '?'] || 0) + 1;
    byWave['w' + (e.w | 0)] = (byWave['w' + (e.w | 0)] || 0) + 1;
  }
  return { attr: all.length, attrW12: w12.length, byVia, byWave };
}
// Scholar deaths (successions) from the tele death stream; combat-caused
// ones counted separately for the guardrail.
function scholarDeaths(Game) {
  const tel = (Game.state || {}).telemetry || [];
  const ds = tel.filter(e => e && e.type === 'death' && e.player === true);
  const causes = {};
  let combat = 0;
  for (const e of ds) {
    const c = String(e.cause || 'unknown');
    causes[c] = (causes[c] || 0) + 1;
    if (/combat|fight|monster|maul|bite|claw|wound|slain|killed|strike/i.test(c)) combat++;
  }
  return { n: ds.length, combat, causes };
}
// Villager combat deaths (TB-path) from the fallen ledger.
function villagerCombatDeaths(Game) {
  try {
    const fallen = ((Game.state || {}).village || {}).fallen || [];
    return fallen.filter(f => f && f.cause === 'combat').length;
  } catch (e) { return 0; }
}

async function runOne(policy, gate, seed, days) {
  if (gate) process.env.TRICKSURVIVE = '1'; else delete process.env.TRICKSURVIVE;
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'tricksurvive-' + policy.id, fullTelemetry: true });
  await setupGame(Game);
  const snap = {};
  const base = policy;
  const origDaily = base.daily;
  const wrapped = Object.assign({}, base, {
    daily(G, ctx) {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        for (const k of ['tsInvitesOk', 'tsYields']) {
          if (ctx[k] != null) snap[k] = ctx[k];
        }
      } catch (e) {}
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days, sampleEvery: 15 }));
  const ta = trickAttr(Game);
  const sd = scholarDeaths(Game);
  return {
    policy: policy.id, gate: gate ? '1' : '0', seed,
    days: result.days, endReason: result.endReason || 'alive',
    national: nationalAt(Game), won: wonAt(Game),
    maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1) | 0,
    attr: ta.attr, attrW12: ta.attrW12, attrByVia: ta.byVia, attrByWave: ta.byWave,
    scholarDeaths: sd.n, scholarCombatDeaths: sd.combat, scholarDeathCauses: sd.causes,
    villagerCombatDeaths: villagerCombatDeaths(Game),
    tsInvitesOk: snap.tsInvitesOk || 0, tsYields: snap.tsYields || 0,
  };
}

async function main() {
  const seeds = (process.env.SEEDS || '3701,3702,3703,3704,3705,3706,3707,3708').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-17/sim-tricksurvive-pilot.json';
  const perSeedDir = process.env.PERSEED || null;
  const arms = [
    { policy: leadfeast, gate: false },
    { policy: belongfeast, gate: false },
    { policy: tricksurviveLead, gate: true },
    { policy: tricksurviveBelong, gate: true },
  ];
  const rows = [];
  for (const a of arms) {
    for (const seed of seeds) {
      const row = await runOne(a.policy, a.gate, seed, days);
      rows.push(row);
      if (perSeedDir) {
        try {
          fs.mkdirSync(perSeedDir, { recursive: true });
          fs.writeFileSync(path.join(perSeedDir, `${row.policy}-s${seed}.json`), JSON.stringify(row, null, 1));
        } catch (e) {}
      }
      console.log(`  [${row.policy} s${seed}] d=${row.days} ${row.endReason} attr=${row.attr}(w12:${row.attrW12}) via=${JSON.stringify(row.attrByVia)} ` +
        `nat=${row.national} sDeaths=${row.scholarDeaths}(${row.scholarCombatDeaths}c) vComb=${row.villagerCombatDeaths} ` +
        `inv=${row.tsInvitesOk} yields=${row.tsYields}`);
    }
  }
  // Summary.
  const sum = {};
  for (const r of rows) {
    const k = r.gate === '1' ? 'armed' : 'control';
    sum[k] = sum[k] || { n: 0, attr: 0, attrW12: 0, national: 0, won: 0, surv: [], sDeaths: 0, sCombat: 0, vCombat: 0, invites: 0, yields: 0, deathCauses: {} };
    const s = sum[k];
    s.n++; s.attr += r.attr; s.attrW12 += r.attrW12; s.national += r.national; s.won += r.won;
    s.surv.push(r.days); s.sDeaths += r.scholarDeaths; s.sCombat += r.scholarCombatDeaths;
    s.vCombat += r.villagerCombatDeaths; s.invites += r.tsInvitesOk; s.yields += r.tsYields;
    for (const [c, n] of Object.entries(r.scholarDeathCauses || {})) s.deathCauses[c] = (s.deathCauses[c] || 0) + n;
  }
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  for (const k of Object.keys(sum)) sum[k].medianSurv = med(sum[k].surv);
  const diff = sum.armed.attr - sum.control.attr;
  const go = diff >= 4;
  // Guardrails.
  const gSDeaths = (sum.armed.sCombat - sum.control.sCombat) <= 2;
  const gNational = (sum.armed.national - sum.control.national) >= -2;
  const gSurv = (sum.armed.medianSurv - sum.control.medianSurv) >= -10;
  const armedCauses = Object.keys(sum.armed.deathCauses || {});
  const controlCauses = new Set(Object.keys(sum.control.deathCauses || {}));
  const newModes = armedCauses.filter(c => !controlCauses.has(c));
  console.log('\nSUMMARY: ' + JSON.stringify(sum, null, 1));
  console.log(`PRIMARY: armed attr=${sum.armed.attr} control attr=${sum.control.attr} diff=${diff} bar>=4 -> ${go ? 'GO' : 'NO-GO (KILL)'}`);
  console.log(`GUARDRAILS: scholarCombatDeaths diff=${sum.armed.sCombat - sum.control.sCombat} (<=2: ${gSDeaths}); ` +
    `national diff=${sum.armed.national - sum.control.national} (>=-2: ${gNational}); ` +
    `medianSurv diff=${sum.armed.medianSurv - sum.control.medianSurv} (>=-10: ${gSurv}); ` +
    `new death modes: ${newModes.length ? JSON.stringify(newModes) : 'none'}`);
  try {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ preRegistration: 'see scripts/sweep-tricksurvive-20261017.js header', summary: sum, go, guardrails: { gSDeaths, gNational, gSurv, newModes }, rows }, null, 1));
    console.log('wrote ' + out);
  } catch (e) { console.error('write failed', e.message); }
}

main().catch(e => { console.error('SWEEP FAILED', e); process.exit(1); });
