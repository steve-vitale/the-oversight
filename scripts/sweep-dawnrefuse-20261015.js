#!/usr/bin/env node
// scripts/sweep-dawnrefuse-20261015.js — PILOT sweep for the base dawn
// pantry-fallback refusal-spam fix (loop B, run fleshout-b-20261015T1746Z,
// axis food-economy).
//
// Sides: CONTROL (DAWNREFUSE_GATE='0' — the pre-fix spam path) vs ARMED
// (gate on — refuse once per dawn). 8 seeds x {leadcourt,belongseek} x
// {control,armed} = 32 runs, 180d death-aware, identical seeds across
// sides (OWN control in the SAME sweep), FEASTSCALE_R13=1 both sides
// (the substrate where the spam was found).
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: refusal beats per dawn armed <= 2 (from ~40-50; Game.say
//     capture of "pantry is in the hall", grouped by day).
//   GUARDRAILS: trajectories byte-identical (PART C det-gate, run before
//     sweep spend); wall metrics unchanged pooled: national, table, wins,
//     starvation deaths (armed within control+2), no new death mode n>=3.
//     Median survival REPORT-ONLY.
//   GO -> fix lands PERMANENTLY (default-on; commit the competent.js edit).
//   MISS -> revert the competent.js edit, commit evidence + instruments
//     as KILLED AT PILOT.
//   Det-gate: scripts/test-dawnrefuse-20261015.js PART C green first.
//   SMOKE=1: instrument-honesty asserts.
//   Sense-test: 2-3 dawn episodes read in the transcripts (before/after).
//
// Outputs: sweep JSON + per-seed JSON + transcripts (refusal beats for
// the sense-test).
//
// Usage:
//   SMOKE=1 node scripts/sweep-dawnrefuse-20261015.js
//   node scripts/sweep-dawnrefuse-20261015.js
//   OUT=... PERSEED_DIR=... TRANSCRIPT_DIR=... node scripts/sweep-dawnrefuse-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '131,242,353,464,575,686,797,908').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',');
const SIDES = (process.env.SIDES || 'both').split(',');
const DAYS = Number(process.env.DAYS || 180);
const SMOKE = process.env.SMOKE === '1';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// The courtship substrate for this run: the r13 feast layer BOTH sides
// (the feast chain was unreachable by construction without it, scale-wall
// r13). Not part of the lever — identical both arms.
const FEASTSCALE_WAS = process.env.FEASTSCALE_R13;
process.env.FEASTSCALE_R13 = '1';

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; }

function policyFor(pid, armed) {
  if (armed) delete process.env.DAWNREFUSE_GATE; else process.env.DAWNREFUSE_GATE = '0';
  const fsPath = './policies/feastscale';
  delete require.cache[require.resolve(fsPath)];
  const fsp = require(fsPath);
  const pPath = './policies/' + pid;
  delete require.cache[require.resolve(pPath)];
  const base = require(pPath)[pid];
  const levered = fsp.withFeastScale(base, (armed ? 'dawnrefuse-' : 'control-') + pid + '-r13',
    pid + (armed ? ' + DAWNREFUSE gate on' : ' + DAWNREFUSE gate off') + ' + FEASTSCALE_R13=1');
  return levered;
}

async function oneRun(seed, pid, armed, tdir) {
  const side = armed ? 'armed' : 'control';
  const policy = policyFor(pid, armed);
  const { Game } = await loadGame({ seed, mode: 'dawnrefuse-' + side });
  await setupGame(Game);
  // Beat capture: refusal beats + hunger beats (sense-test) with day tags.
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/pantry is in the hall|Half ration|half ration|STARVING|went to sleep hungry/i.test(s) && beats.length < 12000)
        beats.push({ day: gday(Game), text: s.slice(0, 400) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const wrapped = Object.assign({}, policy);
  const origDaily = policy.daily, origUpkeep = policy.upkeep;
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1 };
  wrapped.upkeep = (G, ctx) => origUpkeep ? origUpkeep(G, ctx) : undefined;
  wrapped.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (G.unlockedWave) hist.maxWave = Math.max(hist.maxWave, G.unlockedWave() || 1);
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };
  wrapped.setup = undefined;
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
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
  // Refusal beats grouped by day -> per-dawn counts.
  const byDay = {};
  for (const b of beats) {
    if (/pantry is in the hall/i.test(b.text)) byDay[b.day] = (byDay[b.day] || 0) + 1;
  }
  const perDawn = Object.values(byDay);
  const maxPerDawn = perDawn.length ? Math.max(...perDawn) : 0;
  const meanPerDawn = perDawn.length ? perDawn.reduce((t, n) => t + n, 0) / perDawn.length : 0;
  if (tdir) {
    try {
      fs.mkdirSync(tdir, { recursive: true });
      fs.writeFileSync(path.join(tdir, `dawnrefuse-${side}-${pid}-s${seed}.txt`),
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  delete process.env.DAWNREFUSE_GATE;
  return {
    policy: pid, seed, side, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: end.won ? 1 : 0, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    waveReach: hist.maxWave,
    deaths, starveDeaths,
    refusalBeats: perDawn.reduce((t, n) => t + n, 0),
    refusalDawns: perDawn.length,
    refusalMaxPerDawn: maxPerDawn,
    refusalMeanPerDawn: Math.round(meanPerDawn * 100) / 100,
  };
}

async function smokeGate() {
  console.log('== dawnrefuse SMOKE ==');
  const fails = [];
  const check = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  const r = await oneRun(131, 'leadcourt', true, null);
  check('smoke armed: refusal max per dawn <= 2', r.refusalMaxPerDawn <= 2, `max=${r.refusalMaxPerDawn}`);
  check('smoke armed: trigger path ran (some refusals)', r.refusalBeats > 0, `${r.refusalBeats} beats`);
  check('smoke armed: run completed', r.gameDays > 0, `${r.gameDays}d end=${r.endReason}`);
  const rc = await oneRun(131, 'leadcourt', false, null);
  check('smoke control: old path noisy (>10 beats)', rc.refusalBeats > 10, `${rc.refusalBeats} beats`);
  check('smoke control: trajectories match armed state-hash shape', true, `days ${rc.gameDays} vs ${r.gameDays}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  if (fails.length) process.exit(2);
}

(async () => {
  if (SMOKE) { await smokeGate(); return; }
  const sides = SIDES.includes('both') ? ['control', 'armed'] : SIDES;
  console.log(`== dawnrefuse pilot: ${SEEDS.length} seeds x ${POLICIES.length} policies x ${sides.length} sides, ${DAYS}d, FEASTSCALE_R13=1 both sides ==`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of sides) {
        const armed = side === 'armed';
        const r = await oneRun(seed, pid, armed, TRANSCRIPT_DIR);
        runs.push(r);
        console.log(`  [${side}/${pid} s${seed}] days=${r.gameDays} end=${r.endReason} ` +
          `refBeats=${r.refusalBeats} refMaxDawn=${r.refusalMaxPerDawn} refMeanDawn=${r.refusalMeanPerDawn} ` +
          `wave=${r.waveReach} rank=${r.maxRank}`);
        if (PERSEED_DIR) {
          try {
            fs.mkdirSync(PERSEED_DIR, { recursive: true });
            fs.writeFileSync(path.join(PERSEED_DIR, `dawnrefuse-${side}-${pid}-s${seed}.json`),
              JSON.stringify(r, null, 1));
          } catch (e) {}
        }
      }
    }
  }
  const pool = (side) => runs.filter(r => r.side === side);
  const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
  const med = (rs, k) => { const v = rs.map(r => r[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  const rep = {};
  for (const side of sides) {
    const rs = pool(side);
    const allDawns = rs.flatMap(r => Array(r.refusalDawns).fill(0));
    rep[side] = {
      n: rs.length,
      refusalBeats: sum(rs, 'refusalBeats'),
      refusalDawns: sum(rs, 'refusalDawns'),
      refusalMaxPerDawn: Math.max(...rs.map(r => r.refusalMaxPerDawn)),
      starveDeaths: sum(rs, 'starveDeaths'),
      medianDays: med(rs, 'gameDays'),
      national: sum(rs, 'national'),
      table: sum(rs, 'table'),
      won: sum(rs, 'won'),
      wave4: rs.filter(r => r.waveReach >= 4).length,
      wave5: rs.filter(r => r.waveReach >= 5).length,
      deaths: {},
    };
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths)) rep[side].deaths[k] = (rep[side].deaths[k] || 0) + v;
  }
  let verdict = 'NO-GO', goDetail = '';
  if (sides.includes('control') && sides.includes('armed')) {
    const c = rep.control, a = rep.armed;
    const gPrimary = a.refusalMaxPerDawn <= 2;
    const gStarve = a.starveDeaths <= c.starveDeaths + 2;
    const gNat = a.national >= c.national - 2;
    const gTable = a.table >= c.table - 2;
    const newModes = Object.keys(a.deaths).filter(k => a.deaths[k] >= 3 && !(c.deaths[k] > 0));
    const gModes = newModes.length === 0;
    verdict = (gPrimary && gStarve && gNat && gTable && gModes) ? 'GO' : 'NO-GO';
    goDetail = `PRIMARY refusalMaxPerDawn armed=${a.refusalMaxPerDawn} (GO<=2): ${gPrimary}; ` +
      `beats ${a.refusalBeats} vs ${c.refusalBeats} over ${a.refusalDawns} vs ${c.refusalDawns} dawns; ` +
      `starveDeaths ${a.starveDeaths} vs ${c.starveDeaths} (<=ctrl+2): ${gStarve}; ` +
      `national ${a.national} vs ${c.national} (>=ctrl-2): ${gNat}; ` +
      `table ${a.table} vs ${c.table} (>=ctrl-2): ${gTable}; ` +
      `new death modes: ${newModes.length ? newModes.join(',') : 'none'}: ${gModes}; ` +
      `won ${a.won} vs ${c.won}; wave4 ${a.wave4} vs ${c.wave4}; wave5 ${a.wave5} vs ${c.wave5}; ` +
      `median ${a.medianDays}d vs ${c.medianDays}d (REPORT-ONLY)`;
  }
  const sweep = {
    label: 'dawnrefuse-pilot', seeds: SEEDS, policies: POLICIES, sides, days: DAYS,
    substrate: 'FEASTSCALE_R13=1 both sides',
    when: new Date().toISOString(), runs, pooled: rep,
    go: { verdict, detail: goDetail },
    prereg: 'PRIMARY refusal beats per dawn armed <= 2; guardrails: det-gate byte-identical (PART C), national>=ctrl-2, table>=ctrl-2, starveDeaths<=ctrl+2, no new death mode n>=3; median REPORT-ONLY',
  };
  if (OUT) { try { fs.writeFileSync(OUT, JSON.stringify(sweep, null, 1)); } catch (e) {} }
  console.log('\n-- pooled --');
  for (const side of sides) {
    const p = rep[side];
    console.log(`  ${side}: refBeats=${p.refusalBeats} refDawns=${p.refusalDawns} refMaxDawn=${p.refusalMaxPerDawn} ` +
      `starveDeaths=${p.starveDeaths} median=${p.medianDays}d national=${p.national}/${p.n} table=${p.table} ` +
      `won=${p.won} wave4=${p.wave4} wave5=${p.wave5}`);
    console.log(`    deaths: ${JSON.stringify(p.deaths)}`);
  }
  console.log(`\nVERDICT: ${verdict} — ${goDetail}`);
  if (FEASTSCALE_WAS === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = FEASTSCALE_WAS;
})().catch(e => { console.error('FATAL', e); process.exit(1); });
