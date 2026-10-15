#!/usr/bin/env node
// scripts/sweep-capdraw2-20261015.js — measurement sweep for the CAPDRAW2
// honest-draw fix (loop B run fleshout-b-20261015T1130Z, sim-findings
// #313/#315).
//
// One side per invocation (SIDE=control|armed). Control runs on the pristine
// tree (patch-swap of src/js/game.js + src/js/betrayal.js between runs);
// armed runs on the fixed tree with CAPDRAW2=1. Identical seeds/policies —
// CONTROL BASELINE DRIFT #247: never inherit a baseline.
// Substrate: 12 seeds (11/22/33/44/55/66/77/88/99/110/121/132) x
// {leadcourt, belongseek}, 180d death-aware. Instruments: distrhalf-lib
// (hunger-day classification) + capdraw-lib (the bug's own footprint:
// excess = max(0, taken - room) per meal, silent iff no beat names it).
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: silent cap-waste kcal armed <= 0.10x control (the bug's own
//            footprint; prior pilot: 0 vs 34,756 kcal).
//   GUARDRAILS: scholar starvation-deaths armed <= control+1;
//               median survival armed >= control-10d;
//               national armed >= control-2;
//               no new death mode (n>=3 armed-only).
//   GO -> land as its own commit. MISS -> revert byte-clean per kill
//   protocol (evidence + instruments only).
//
// Usage:
//   SIDE=armed SEEDS="11,22,..." DAYS=180 \
//     OUT=evidence/2026-10-15/capdraw2-armed.json \
//     PERSEED_DIR=evidence/2026-10-15/perseed-capdraw2-armed \
//     TRANSCRIPT_DIR=evidence/2026-10-15/capdraw2-transcripts-armed \
//     CAPDRAW2=1 node scripts/sweep-capdraw2-20261015.js
//   COMPARE=1 BASE=evidence/2026-10-15/capdraw2-control.json \
//     ARMED=evidence/2026-10-15/capdraw2-armed.json \
//     node scripts/sweep-capdraw2-20261015.js   # GO/MISS verdict
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installDistrHalf, finalizeDistrHalf } = require('./distrhalf-lib-20261015');
const { installCapDraw, summarizeCapDraw } = require('./capdraw-lib-20261015');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88,99,110,121,132').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',');
const DAYS = Number(process.env.DAYS || 180);
const SIDE = process.env.SIDE || 'armed';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', breadth: 0, stage: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  return out;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed, policyId, days, tdir) {
  const { Game } = await loadGame({ seed, mode: 'capdraw2' });
  await setupGame(Game);
  const base = require('./policies/' + policyId)[policyId];
  const dh = installDistrHalf(Game);
  const cd = installCapDraw(Game);
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/Half ration|half ration|starv|hunger|STARVING|pantry is empty|bins are echoing|HUNGER WINTER|went to sleep hungry|leftovers|went back in the bins|Village meal|trust/i.test(s) && beats.length < 8000)
        beats.push({ day: gday(Game), text: s.slice(0, 500) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const policy = Object.assign({}, base);
  const origSetup = base.setup, origDaily = base.daily;
  let dailyCalls = 0;
  policy.setup = (G, ctx) => { if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1 };
  policy.daily = (G, ctx) => {
    dailyCalls++;
    try { dh.dawn(G); } catch (e) {}
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (G.unlockedWave) hist.maxWave = Math.max(hist.maxWave, G.unlockedWave() || 1);
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const rep = finalizeDistrHalf(Game, dh);
  const capsum = summarizeCapDraw(cd);
  const deaths = {};
  let starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starveDeaths++;
    }
  } catch (e) {}
  Game.say = oSay;
  try { cd.uninstall(); } catch (e) {}
  try { dh.uninstall(); } catch (e) {}
  if (tdir) {
    try {
      fs.mkdirSync(tdir, { recursive: true });
      fs.writeFileSync(path.join(tdir, `${policyId}-s${seed}-${SIDE}.txt`),
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  const hungerDays = rep.hungerDays;
  const scholarDays = hungerDays.filter(h => h.subject === 'scholar');
  const msss = scholarDays.filter(h => h.label === 'meal-served-still-starved').length;
  return {
    side: SIDE, policy: policyId, seed, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: end.won ? 1 : 0, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    waveReach: hist.maxWave, wave4: hist.maxWave >= 4 ? 1 : 0, wave5: hist.maxWave >= 5 ? 1 : 0,
    deaths, starveDeaths,
    dailyCalls,
    hungerDays: hungerDays.length,
    scholarHungerDays: scholarDays.length,
    villagerHungerDays: hungerDays.filter(h => h.subject === 'villager').length,
    mealServedStillStarved: msss,
    byChannel: rep.byChannel, byLabel: rep.byLabel,
    unattributed: rep.unattributed,
    beatGateMismatches: rep.beatGateMismatches,
    capWaste: capsum,
    capMeals: cd.meals.map(m => ({
      day: m.day, trust: m.trust, taken: m.taken, room: m.room, banked: m.banked,
      excess: m.excess, voiced: m.voiced, joined: m.joined, joinedWaste: m.joinedWaste,
    })),
  };
}

function pool(runs) {
  const p = { n: runs.length, hungerDays: 0, scholarHungerDays: 0, mealServedStillStarved: 0,
    silentKcal: 0, voicedKcal: 0, excessEvents: 0, excessTotal: 0, joinedWaste: 0,
    national: 0, table: 0, won: 0, wave4: 0, wave5: 0, starveDeaths: 0, days: [], deaths: {}, byLabel: {} };
  for (const r of runs) {
    p.hungerDays += r.hungerDays; p.scholarHungerDays += r.scholarHungerDays;
    p.mealServedStillStarved += r.mealServedStillStarved;
    p.silentKcal += r.capWaste.silentKcal; p.voicedKcal += r.capWaste.voicedKcal;
    p.excessEvents += r.capWaste.excessEvents; p.excessTotal += r.capWaste.excessTotal;
    p.joinedWaste += r.capWaste.joinedWasteTotal;
    p.national += r.national; p.table += r.table; p.won += r.won;
    p.wave4 += r.wave4; p.wave5 += r.wave5; p.days.push(r.days);
    p.starveDeaths += r.starveDeaths;
    for (const [k, v] of Object.entries(r.deaths)) p.deaths[k] = (p.deaths[k] || 0) + v;
    for (const [k, v] of Object.entries(r.byLabel)) p.byLabel[k] = (p.byLabel[k] || 0) + v;
  }
  p.days.sort((a, b) => a - b);
  p.medianDays = p.days.length ? p.days[Math.floor(p.days.length / 2)] : 0;
  p.maxDays = p.days.length ? p.days[p.days.length - 1] : 0;
  return p;
}

function compare(base, armed) {
  const b = pool(base.runs), a = pool(armed.runs);
  console.log('== capdraw2 GO/MISS (binding, §14) ==');
  console.log(`control: ${b.n} runs | armed: ${a.n} runs`);
  let go = true;
  const verdict = (name, ok, detail) => {
    console.log(`  ${ok ? 'GO  ' : 'MISS'} ${name}${detail ? ' — ' + detail : ''}`);
    return ok;
  };
  go = verdict('PRIMARY silent cap-waste kcal armed <= 0.10x control',
    a.silentKcal <= 0.10 * b.silentKcal,
    `armed=${a.silentKcal} control=${b.silentKcal} (voiced armed=${a.voicedKcal})`) && go;
  go = verdict('GUARDRAIL scholar starvation-deaths armed <= control+1',
    a.starveDeaths <= b.starveDeaths + 1,
    `armed=${a.starveDeaths} control=${b.starveDeaths}`) && go;
  go = verdict('GUARDRAIL median survival armed >= control-10d',
    a.medianDays >= b.medianDays - 10,
    `armed=${a.medianDays}d control=${b.medianDays}d`) && go;
  go = verdict('GUARDRAIL national armed >= control-2',
    a.national >= b.national - 2,
    `armed=${a.national}/${a.n} control=${b.national}/${b.n}`) && go;
  // new death mode: any cause with n>=3 on armed absent on control
  const newModes = Object.keys(a.deaths).filter(k => (a.deaths[k] || 0) >= 3 && !(b.deaths[k] || 0));
  go = verdict('GUARDRAIL no new death mode (n>=3)',
    newModes.length === 0, newModes.length ? `NEW: ${newModes.join(',')}` : 'none') && go;
  console.log('\n-- wall numbers --');
  console.log(`  national: control ${b.national}/${b.n} armed ${a.national}/${a.n} | table: ${b.table} vs ${a.table} | wins: ${b.won} vs ${a.won}`);
  console.log(`  wave4: ${b.wave4} vs ${a.wave4} | wave5: ${b.wave5} vs ${a.wave5} | median: ${b.medianDays}d vs ${a.medianDays}d (max ${b.maxDays}d vs ${a.maxDays}d)`);
  console.log(`  starveDeaths: ${b.starveDeaths} vs ${a.starveDeaths} | scholarHungerDays: ${b.scholarHungerDays} vs ${a.scholarHungerDays}`);
  console.log(`  cap-waste footprint: control excessEvents=${b.excessEvents} excessTotal=${b.excessTotal}kcal joinedWaste=${b.joinedWaste}kcal silent=${b.silentKcal}`);
  console.log(`                       armed   excessEvents=${a.excessEvents} excessTotal=${a.excessTotal}kcal joinedWaste=${a.joinedWaste}kcal silent=${a.silentKcal} voiced=${a.voicedKcal}`);
  console.log(`\nVERDICT: ${go ? 'GO' : 'MISS'}`);
  return go;
}

(async () => {
  if (process.env.COMPARE === '1') {
    const base = JSON.parse(fs.readFileSync(process.env.BASE, 'utf8'));
    const armed = JSON.parse(fs.readFileSync(process.env.ARMED, 'utf8'));
    const go = compare(base, armed);
    process.exit(go ? 0 : 2);
  }
  console.log(`== capdraw2 sweep (${SIDE}): ${SEEDS.length} seeds x ${POLICIES.length} policies, ${DAYS}d ==`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, pid, DAYS, TRANSCRIPT_DIR);
      runs.push(r);
      console.log(`  [${pid} s${seed}] days=${r.days} end=${r.endReason} ` +
        `scholarHunger=${r.scholarHungerDays} msss=${r.mealServedStillStarved} ` +
        `wasteEvents=${r.capWaste.excessEvents} silent=${r.capWaste.silentKcal}kcal ` +
        `wave=${r.waveReach} rank=${r.maxRank} unattrib=${r.unattributed}`);
      if (PERSEED_DIR) {
        try {
          fs.mkdirSync(PERSEED_DIR, { recursive: true });
          fs.writeFileSync(path.join(PERSEED_DIR, `capdraw2-${SIDE}-${pid}-s${seed}.json`),
            JSON.stringify(r, null, 1));
        } catch (e) {}
      }
    }
  }
  const out = { side: SIDE, seeds: SEEDS, policies: POLICIES, days: DAYS,
    generatedUtc: new Date().toISOString(), runs, pooled: pool(runs) };
  if (OUT) {
    try {
      fs.mkdirSync(path.dirname(OUT), { recursive: true });
      fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
      console.log(`wrote ${OUT}`);
    } catch (e) { console.error('write failed', e.message); }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
