#!/usr/bin/env node
// scripts/sweep-nothingedible-20261017.js — PILOT sweep for the nothing-edible
// guard-loop spam fix (loop B, run fleshout-b-20261017T1235Z, axis
// food-economy; fixes finding #473).
//
// Sides: CONTROL (NOTHINGEDIBLE_GATE='0' — the pre-fix spam path) vs ARMED
// (gate on — one "nothing edible" hearing per day per pack). 8 seeds x
// {leadfeast,belongfeast} x {control,armed} = 32 runs, 180d death-aware,
// identical seeds across sides (OWN control in the SAME sweep),
// FEASTSCALE_R13=1 + SEATDRIVE=0 both sides (the census substrate where the
// spam was filed).
//
// PRE-REGISTERED (evidence/2026-10-17/sim-nothingedible-b.md, binding):
//   PRIMARY: max per-day "Nothing edible." beats ARMED <= 2 on the
//     previously-spamming seeds.
//   GUARDRAILS: national>=ctrl-2, table>=ctrl-2, starveDeaths<=ctrl+2,
//     no new death mode n>=3; median survival REPORT-ONLY.
//     (Det-gate byte-identical trajectories: scripts/test-nothingedible-20261017.js PART C.)
//   GO -> the layer lands PERMANENTLY (voice-only, default-on).
//   MISS -> revert the competent.js edit, commit evidence + instruments as
//     KILLED AT PILOT.
//   SMOKE=1: instrument-honesty asserts (short run, spam reproduced armed vs control).
//   Sense-test: starvation-episode transcripts read before/after.
//
// Outputs: sweep JSON + per-seed JSON + beat transcripts (sense-test).
//
// Usage:
//   SMOKE=1 node scripts/sweep-nothingedible-20261017.js
//   node scripts/sweep-nothingedible-20261017.js
//   OUT=... PERSEED_DIR=... TRANSCRIPT_DIR=... node scripts/sweep-nothingedible-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '6101,6102,6103,6104,6105,6106,6107,6108').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadfeast,belongfeast').split(',');
const SIDES = (process.env.SIDES || 'both').split(',');
const DAYS = Number(process.env.DAYS || 180);
const SMOKE = process.env.SMOKE === '1';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const NOTHING = /^Nothing edible\./;

// The census substrate: r13 feast layer BOTH sides, seat drive off (pre-seat).
const FEASTSCALE_WAS = process.env.FEASTSCALE_R13;
const SEATDRIVE_WAS = process.env.SEATDRIVE;
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; }

function policyFor(pid, armed) {
  if (armed) delete process.env.NOTHINGEDIBLE_GATE; else process.env.NOTHINGEDIBLE_GATE = '0';
  const fsPath = './policies/feastscale';
  delete require.cache[require.resolve(fsPath)];
  return require(fsPath)[pid];
}

async function oneRun(seed, pid, armed, tdir) {
  const side = armed ? 'armed' : 'control';
  const policy = policyFor(pid, armed);
  const { Game } = await loadGame({ seed, mode: 'nothingedible-' + side });
  await setupGame(Game);
  // Beat capture: "Nothing edible." beats with day tags + full text (sense-test).
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (NOTHING.test(s) && beats.length < 12000) beats.push({ day: gday(Game), text: s.slice(0, 500) });
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
  // Beats grouped by day -> per-day counts.
  const byDay = {};
  for (const b of beats) byDay[b.day] = (byDay[b.day] || 0) + 1;
  const perDay = Object.values(byDay);
  const maxPerDay = perDay.length ? Math.max(...perDay) : 0;
  const daysWith = perDay.length;
  if (tdir) {
    try {
      fs.mkdirSync(tdir, { recursive: true });
      fs.writeFileSync(path.join(tdir, `nothingedible-${side}-${pid}-s${seed}.txt`),
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  delete process.env.NOTHINGEDIBLE_GATE;
  return {
    policy: pid, seed, side, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: end.won ? 1 : 0, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    waveReach: hist.maxWave,
    deaths, starveDeaths,
    nothingBeats: perDay.reduce((t, n) => t + n, 0),
    nothingDays: daysWith,
    nothingMaxPerDay: maxPerDay,
    nothingSample: beats.slice(0, 5).map(b => `d${b.day}: ${b.text.slice(0, 220)}`),
  };
}

async function smokeGate() {
  console.log('== nothingedible SMOKE ==');
  const fails = [];
  const check = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  const r = await oneRun(6103, 'belongfeast', true, null); // census's 83/day seed
  check('smoke armed: nothing-edible max per day <= 2', r.nothingMaxPerDay <= 2, `max=${r.nothingMaxPerDay}`);
  check('smoke armed: trigger path ran (some beats)', r.nothingBeats > 0, `${r.nothingBeats} beats`);
  check('smoke armed: run completed', r.gameDays > 0, `${r.gameDays}d end=${r.endReason}`);
  const rc = await oneRun(6103, 'belongfeast', false, null);
  check('smoke control: old path noisy (max/day > 10)', rc.nothingMaxPerDay > 10, `max=${rc.nothingMaxPerDay}`);
  check('smoke control: trajectories match armed game-days', Math.abs(rc.gameDays - r.gameDays) <= 2, `${rc.gameDays} vs ${r.gameDays}d`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  if (fails.length) process.exit(2);
}

(async () => {
  if (SMOKE) { await smokeGate(); return; }
  const sides = SIDES.includes('both') ? ['control', 'armed'] : SIDES;
  console.log(`== nothingedible pilot: ${SEEDS.length} seeds x ${POLICIES.length} policies x ${sides.length} sides, ${DAYS}d, FEASTSCALE_R13=1 SEATDRIVE=0 both sides ==`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of sides) {
        const armed = side === 'armed';
        const r = await oneRun(seed, pid, armed, TRANSCRIPT_DIR);
        runs.push(r);
        console.log(`  [${side}/${pid} s${seed}] days=${r.gameDays} end=${r.endReason} ` +
          `neBeats=${r.nothingBeats} neDays=${r.nothingDays} neMaxDay=${r.nothingMaxPerDay} ` +
          `wave=${r.waveReach} rank=${r.maxRank} table=${r.table} won=${r.won}`);
        if (PERSEED_DIR) {
          try {
            fs.mkdirSync(PERSEED_DIR, { recursive: true });
            const { nothingSample, ...rest } = r;
            fs.writeFileSync(path.join(PERSEED_DIR, `nothingedible-${side}-${pid}-s${seed}.json`),
              JSON.stringify({ ...rest, nothingSample }, null, 1));
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
    rep[side] = {
      n: rs.length,
      nothingBeats: sum(rs, 'nothingBeats'),
      nothingDays: sum(rs, 'nothingDays'),
      nothingMaxPerDay: Math.max(...rs.map(r => r.nothingMaxPerDay)),
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
    const gPrimary = a.nothingMaxPerDay <= 2;
    const gStarve = a.starveDeaths <= c.starveDeaths + 2;
    const gNat = a.national >= c.national - 2;
    const gTable = a.table >= c.table - 2;
    const newModes = Object.keys(a.deaths).filter(k => a.deaths[k] >= 3 && !(c.deaths[k] > 0));
    const gModes = newModes.length === 0;
    verdict = (gPrimary && gStarve && gNat && gTable && gModes) ? 'GO' : 'NO-GO';
    goDetail = `PRIMARY nothingMaxPerDay armed=${a.nothingMaxPerDay} (GO<=2): ${gPrimary}; ` +
      `beats ${a.nothingBeats} vs ${c.nothingBeats} over ${a.nothingDays} vs ${c.nothingDays} starvation days; ` +
      `starveDeaths ${a.starveDeaths} vs ${c.starveDeaths} (<=ctrl+2): ${gStarve}; ` +
      `national ${a.national} vs ${c.national} (>=ctrl-2): ${gNat}; ` +
      `table ${a.table} vs ${c.table} (>=ctrl-2): ${gTable}; ` +
      `new death modes: ${newModes.length ? newModes.join(',') : 'none'}: ${gModes}; ` +
      `won ${a.won} vs ${c.won}; wave4 ${a.wave4} vs ${c.wave4}; wave5 ${a.wave5} vs ${c.wave5}; ` +
      `median ${a.medianDays}d vs ${c.medianDays}d (REPORT-ONLY)`;
  }
  const sweep = {
    label: 'nothingedible-pilot', seeds: SEEDS, policies: POLICIES, sides, days: DAYS,
    substrate: 'FEASTSCALE_R13=1 SEATDRIVE=0 both sides',
    when: new Date().toISOString(), runs, pooled: rep,
    go: { verdict, detail: goDetail },
    prereg: 'PRIMARY nothing-edible beats per day armed <= 2; guardrails: det-gate byte-identical (PART C), national>=ctrl-2, table>=ctrl-2, starveDeaths<=ctrl+2, no new death mode n>=3; median REPORT-ONLY',
  };
  if (OUT) { try { fs.writeFileSync(OUT, JSON.stringify(sweep, null, 1)); } catch (e) {} }
  console.log('\n-- pooled --');
  for (const side of sides) {
    const p = rep[side];
    console.log(`  ${side}: neBeats=${p.nothingBeats} neDays=${p.nothingDays} neMaxDay=${p.nothingMaxPerDay} ` +
      `starveDeaths=${p.starveDeaths} median=${p.medianDays}d national=${p.national}/${p.n} table=${p.table} ` +
      `won=${p.won} wave4=${p.wave4} wave5=${p.wave5}`);
    console.log(`    deaths: ${JSON.stringify(p.deaths)}`);
  }
  console.log(`\nVERDICT: ${verdict} — ${goDetail}`);
  if (FEASTSCALE_WAS === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = FEASTSCALE_WAS;
  if (SEATDRIVE_WAS === undefined) delete process.env.SEATDRIVE; else process.env.SEATDRIVE = SEATDRIVE_WAS;
})().catch(e => { console.error('FATAL', e); process.exit(1); });
