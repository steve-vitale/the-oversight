#!/usr/bin/env node
// sim-singletier-b-analyze.js — aggregate the sim-singletier-b slim corpus
// (evidence/2026-10-24/perseed-singletier-b/s<seed>-<lead|belong>-<runner|signal>.json)
// against the foreignhelp-b full corpora (baseline + callall in
// evidence/2026-10-24/perseed-foreignhelp/) on IDENTICAL aggregate
// definitions, and judge the pre-registered GO legs per tier.
// READ-ONLY (stdout only): this process reads worktree files, so under the
// 2026-10-24 read-taint it must never write files — it doesn't.
// Usage: node scripts/sim-singletier-b-analyze.js
// Output: JSON aggregate + human summary + GO table.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const FHDIR = path.join(REPO, 'evidence', '2026-10-24', 'perseed-foreignhelp');
const STDIR = path.join(REPO, 'evidence', '2026-10-24', 'perseed-singletier-b');
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

// Slim-equivalent aggregates from a FULL foreignhelp-b corpus file.
function slimFromFull(d) {
  const fh = d.fh || {};
  const calls = fh.calls || [], asks = fh.asks || [], arrivals = fh.arrivals || [];
  const rs = fh.resolveSnaps || [];
  const byTier = {}, byVV = {}, byRes = {}, byCause = {};
  for (const c of calls) byTier[c.tier || '?'] = (byTier[c.tier || '?'] || 0) + 1;
  for (const a of asks) { const k = (a.via || '?') + ':' + (a.verdict || '?'); byVV[k] = (byVV[k] || 0) + 1; }
  for (const a of arrivals) byRes[a.result || '?'] = (byRes[a.result || '?'] || 0) + 1;
  for (const x of (d.deaths || [])) byCause[x.cause || '?'] = (byCause[x.cause || '?'] || 0) + 1;
  let help = 0, multi = 0;
  for (const r of rs) {
    if ((r.helpAtDoor || 0) > 0) help++;
    const tiers = new Set((r.calls || []).map(c => c.tier));
    if (tiers.size > 1) multi++;
  }
  return { seed: d.seed, base: d.base, mode: d.mode, gameDays: d.gameDays || 0,
    maxWave: d.maxWave || 1, national: d.national || 0, table: d.table || 0, won: d.won || 0,
    calls: { total: calls.length, byTier }, asks: { total: asks.length, byViaVerdict: byVV },
    arrivals: { total: arrivals.length, byResult: byRes },
    helpCrises: help, multiTierCrises: multi,
    deaths: { total: (d.deaths || []).length, byCause,
      runnerDeaths: (d.deaths || []).filter(x => x.cause === 'aid-runner').length },
    arrivedSeeds: null, // filled by caller (needs per-seed grouping)
  };
}

function aggRows(rows) {
  // rows: slim-equivalent objects (one per config).
  const sum = (f) => rows.reduce((a, r) => a + (f(r) || 0), 0);
  const merge = (f) => { const o = {}; for (const r of rows) for (const [k, v] of Object.entries(f(r) || {})) o[k] = (o[k] || 0) + v; return o; };
  const arrivedSeeds = new Set(rows.filter(r => (r.arrivals.byResult.arrived || 0) > 0).map(r => r.seed)).size;
  // helpCrises lives nested (slim: crises.helpCrises) or top-level
  // (slimFromFull); multiTierCrises likewise (slim: tiers.*).
  const helpOf = r => (r.crises ? r.crises.helpCrises : r.helpCrises) || 0;
  const multiOf = r => (r.tiers ? r.tiers.multiTierCrises : r.multiTierCrises) || 0;
  const helpSeeds = new Set(rows.filter(r => helpOf(r) > 0).map(r => r.seed)).size;
  const deaths = sum(r => r.deaths.total);
  const byCause = merge(r => r.deaths.byCause);
  const combat = (byCause.combat || 0) + (byCause['villager combat'] || 0);
  return { configs: rows.length,
    medianSurvival: med(rows.map(r => r.gameDays)),
    survivalBySeed: rows.map(r => ({ seed: r.seed, gameDays: r.gameDays })).sort((a, b) => a.seed - b.seed),
    seedsWithArrivedEvent: arrivedSeeds, seedsWithHelpCrisis: helpSeeds,
    callsTotal: sum(r => r.calls.total), callsByTier: merge(r => r.calls.byTier),
    asksTotal: sum(r => r.asks.total), asksByViaVerdict: merge(r => r.asks.byViaVerdict),
    arrivalsTotal: sum(r => r.arrivals.total), arrivalsByResult: merge(r => r.arrivals.byResult),
    helpCrises: sum(helpOf), multiTierCrises: sum(multiOf),
    wall: { national: sum(r => r.national), table: sum(r => r.table), won: sum(r => r.won),
      wave4: rows.filter(r => r.maxWave >= 4).length, wave5: rows.filter(r => r.maxWave >= 5).length },
    deaths, deathsByCause: byCause,
    shares: { starvation: deaths ? (byCause.starvation || 0) / deaths : 0,
      combatStrict: deaths ? (byCause.combat || 0) / deaths : 0,
      combatPlusVillager: deaths ? combat / deaths : 0,
      aidRunner: deaths ? (byCause['aid-runner'] || 0) / deaths : 0 },
    runnerDeaths: sum(r => r.deaths.runnerDeaths) };
}

const groups = {};
function addGroup(name, rows) { groups[name] = aggRows(rows); }
// Baseline + callall (full corpora, recomputed into slim shape).
for (const mode of ['baseline', 'callall']) {
  for (const pol of ['lead', 'belong']) {
    const files = fs.readdirSync(FHDIR).filter(x => new RegExp(`^s703\\d+-${pol}-${mode}\\.json$`).test(x)).sort();
    const rows = files.map(f => slimFromFull(load(path.join(FHDIR, f))));
    addGroup(`${mode}-${pol}`, rows);
  }
  const files = fs.readdirSync(FHDIR).filter(x => new RegExp(`^s703\\d+-(lead|belong)-${mode}\\.json$`).test(x)).sort();
  addGroup(`${mode}-all`, files.map(f => slimFromFull(load(path.join(FHDIR, f)))));
}
// Armed slim corpora (runner pilot = lead only; signal = lead + belong).
for (const mode of ['runner', 'signal']) {
  for (const pol of ['lead', 'belong']) {
    const files = fs.readdirSync(STDIR).filter(x => new RegExp(`^s703\\d+-${pol}-${mode}\\.json$`).test(x)).sort();
    if (!files.length) continue;
    const rows = files.map(f => load(path.join(STDIR, f)));
    addGroup(`${mode}-${pol}`, rows);
  }
  const files = fs.readdirSync(STDIR).filter(x => new RegExp(`^s703\\d+-(lead|belong)-${mode}\\.json$`).test(x)).sort();
  if (files.length) addGroup(`${mode}-all`, files.map(f => load(path.join(STDIR, f))));
}

console.log(JSON.stringify(groups, null, 1));
console.log('\n--- HUMAN SUMMARY (median = gameDays) ---');
for (const [name, g] of Object.entries(groups)) {
  console.log(`${name}: configs=${g.configs} median=${g.medianSurvival} arrivedSeeds=${g.seedsWithArrivedEvent} helpSeeds=${g.seedsWithHelpCrisis} calls=${g.callsTotal} ${JSON.stringify(g.callsByTier)} asks=${g.asksTotal} arrivals=${g.arrivalsTotal} ${JSON.stringify(g.arrivalsByResult)} helpCrises=${g.helpCrises} multiTier=${g.multiTierCrises} wall nat=${g.wall.national} tab=${g.wall.table} won=${g.wall.won} w4=${g.wall.wave4} w5=${g.wall.wave5} deaths=${g.deaths} starv=${(g.shares.starvation * 100).toFixed(1)}% combat=${(g.shares.combatStrict * 100).toFixed(1)}% combat+vill=${(g.shares.combatPlusVillager * 100).toFixed(1)}% aidRunner=${(g.shares.aidRunner * 100).toFixed(1)}% runnerDeaths=${g.runnerDeaths}`);
}
// GO legs (pilot scope = lead, 8 seeds; confirm scope = all 16).
// Arrivals leg uses arrived-event seeds (result 'arrived'); helpCrisis
// seeds are reported alongside (resolve-time measure, misses live-crisis
// arrivals). Death-mode leg: starvation + combat-strict shares within
// 15pp of the matching baseline scope.
function goLegs(armed, base, nSeeds) {
  const dStarv = (armed.shares.starvation - base.shares.starvation) * 100;
  const dCombat = (armed.shares.combatStrict - base.shares.combatStrict) * 100;
  return { arrivalsSeeds: armed.seedsWithArrivedEvent,
    // Arrivals leg is a pilot-scope bar (8 seeds); confirm scope reports
    // the count without re-judging it against 6.
    arrivalsPass: nSeeds === 8 ? armed.seedsWithArrivedEvent >= 6 : null,
    medianPass: armed.medianSurvival >= 117.5, doubleAskPass: armed.multiTierCrises === 0,
    deathModePass: Math.abs(dStarv) <= 15 && Math.abs(dCombat) <= 15,
    dStarvationPp: +dStarv.toFixed(1), dCombatPp: +dCombat.toFixed(1) };
}
console.log('\n--- GO LEGS ---');
console.log('runner-lead (pilot, 8 seeds):', JSON.stringify(goLegs(groups['runner-lead'], groups['baseline-lead'], 8)));
console.log('signal-lead (pilot, 8 seeds):', JSON.stringify(goLegs(groups['signal-lead'], groups['baseline-lead'], 8)));
if (groups['signal-all'] && groups['signal-all'].configs === 16) console.log('signal-all (confirm, 16 configs):', JSON.stringify(goLegs(groups['signal-all'], groups['baseline-all'], 16)));
