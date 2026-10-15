#!/usr/bin/env node
// scripts/sweep-sleepin-20261015.js — PILOT sweep for the sleepin bedtime
// layer (loop B, sim-findings #314/#328, 2026-10-15).
//
// Claims the named next of #328: the scholar sleeps OUTSIDE the hall
// (insideHaven=false), so dawn pantry draws are honestly refused (415/475
// refused in sim-dawnmeal-b). The killed sibling arm (sim-goinside-b) proved
// a DAWN go-inside + pack-lunch works mechanically (248 enters, 420 takes)
// but LOSES on the trust ledger (hunger 1.158x — takes tax trust, #329).
// THIS arm changes the LOCATION STATE AT NIGHT instead: at bedtime the
// scholar steps inside via the REAL Game.enterBuilding(), so the base's OWN
// reactive dawn pantry draw (competentEat: pack first, pantry second when
// kcal < 0.85*cap) becomes physical. The layer fires NO takes of its own —
// the marginal measurement is the location-state effect, with the engine's
// existing honest draws unblocked.
//
// Sides: CONTROL (FEASTSCALE_R13=1 substrate only) vs ARMED (FEASTSCALE_R13=1
// + SLEEPIN=1). 8 seeds x {leadcourt, belongseek} x {control, armed} = 32
// runs, 180d death-aware, identical seeds across sides (OWN control in the
// SAME sweep — never an inherited baseline, sim-findings #247).
//
// Measurement: the distrhalf instrument (scripts/distrhalf-lib-20261015.js)
// attributes every hunger-day; PRIMARY is scholar hunger-days.
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: scholar hunger-days armed <= 0.75x control (pooled).
//   GUARDRAILS: starvation deaths armed <= control+2; national armed >=
//     control-2/16; no new death mode (wound/disease not worse than
//     control). Median survival: REPORT-ONLY (fragile per metric review —
//     record it, never score it).
//   GO -> commit the layer for landing. MISS -> layer deleted per kill
//     protocol, evidence + instruments only.
//   Horizon: 180d death-aware (+10d tail). This IS the pilot (16/side).
//   Det-gate: scripts/test-sleepin-20261015.js PART C green first (DONE).
//   SMOKE=1: 1 seed (belongseek s109) x 25d — instrument-honesty asserts.
//   Sense-test: night/sleep/dawn beats read in the transcripts — sleeping
//     inside must read as a person choosing shelter, plus where the scholar
//     is during night raids. Villager check: sample villagers act like people.
//
// Outputs: sweep JSON + per-seed JSON + transcripts (hunger beats + the
// layer's enter voice lines for the sense-test).
//
// Usage:
//   SMOKE=1 node scripts/sweep-sleepin-20261015.js
//   node scripts/sweep-sleepin-20261015.js
//   OUT=... PERSEED_DIR=... TRANSCRIPT_DIR=... node scripts/sweep-sleepin-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installDistrHalf, finalizeDistrHalf } = require('./distrhalf-lib-20261015');

const SEEDS = (process.env.SEEDS || '109,218,327,436,545,654,763,872').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',');
const SIDES = (process.env.SIDES || 'both').split(',');
const DAYS = Number(process.env.DAYS || 180);
const SMOKE = process.env.SMOKE === '1';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; }

function policyFor(pid, armed) {
  process.env.FEASTSCALE_R13 = '1';
  if (armed) process.env.SLEEPIN = '1'; else delete process.env.SLEEPIN;
  const slPath = './policies/sleepin';
  delete require.cache[require.resolve(slPath)];
  const sl = require(slPath);
  const fs_ = require('./policies/feastscale');
  const base = pid === 'leadcourt' ? fs_.leadfeast : fs_.belongfeast;
  return armed ? sl.wrapPolicy(base) : base;
}

async function oneRun(seed, pid, armed, tdir) {
  const side = armed ? 'armed' : 'control';
  const policy = policyFor(pid, armed);
  const { Game } = await loadGame({ seed, mode: 'sleepin-' + side });
  await setupGame(Game);
  const track = installDistrHalf(Game);
  // Beat capture: hunger beats + sleep/enter/raid beats (sense-test).
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/Half ration|half ration|STARVING|pantry is empty|duck into the hall|Inside\. The hall smells|wake with a start|raid|siege|settles into|night|dawn/i.test(s) && beats.length < 8000)
        beats.push({ day: gday(Game), text: s.slice(0, 500) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const wrapped = Object.assign({}, policy);
  const origDaily = policy.daily, origUpkeep = policy.upkeep;
  let dailyCalls = 0, ctxRef = null;
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1 };
  const insideAtDaily = [];
  wrapped.upkeep = (G, ctx) => { ctxRef = ctx; return origUpkeep ? origUpkeep(G, ctx) : undefined; };
  wrapped.daily = (G, ctx) => {
    dailyCalls++;
    ctxRef = ctx;
    try {
      insideAtDaily.push((G.state.scholar || {}).insideHaven === true ? 1 : 0);
      track.dawn(G);
    } catch (e) {}
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
  const rep = finalizeDistrHalf(Game, track);
  const deaths = {};
  let starveDeaths = 0, scholarStarveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) {
        starveDeaths++;
        if (d.player) scholarStarveDeaths++;
      }
    }
  } catch (e) {}
  Game.say = oSay;
  try { track.uninstall(); } catch (e) {}
  if (tdir) {
    try {
      fs.mkdirSync(tdir, { recursive: true });
      fs.writeFileSync(path.join(tdir, `sleepin-${side}-${pid}-s${seed}.txt`),
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  const hungerDays = rep.hungerDays;
  const scholarDays = hungerDays.filter(h => h.subject === 'scholar');
  const ctx = ctxRef || {};
  const rows = ctx._siLog || [];
  delete process.env.SLEEPIN;
  return {
    policy: pid, seed, side, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: end.won ? 1 : 0, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    waveReach: hist.maxWave,
    deaths, starveDeaths, scholarStarveDeaths,
    dailyCalls,
    hungerDays: hungerDays.length,
    scholarHungerDays: scholarDays.length,
    villagerHungerDays: hungerDays.length - scholarDays.length,
    byChannel: rep.byChannel,
    unattributed: rep.unattributed,
    // layer audit (armed side; control has none)
    siRows: rows.length,
    siEnters: ctx.siEnters || 0,
    siRefused: ctx.siRefused || 0,
    siFiredRows: rows.filter(r => r.fires).length,
    insideAtDailyFrac: insideAtDaily.length ? +(insideAtDaily.reduce((a, b) => a + b, 0) / insideAtDaily.length).toFixed(3) : 0,
  };
}

async function smokeGate() {
  console.log('== sleepin SMOKE ==');
  const r = await oneRun(109, 'belongseek', true, null);
  const fails = [];
  const check = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  check('policy.daily fired', r.dailyCalls >= 20, `calls=${r.dailyCalls}`);
  check('distrhalf instrument ran', r.hungerDays >= 0 && r.unattributed !== undefined, `hunger=${r.hungerDays} unattrib=${r.unattributed}`);
  check('bedtime machinery ran hot', r.siRows >= 15, `siRows=${r.siRows}`);
  check('enters fired', r.siEnters > 0, `siEnters=${r.siEnters}`);
  check('enters consistent with fired rows', r.siEnters === r.siFiredRows, `enters=${r.siEnters} firedRows=${r.siFiredRows}`);
  check('scholar sleeps inside most nights', r.insideAtDailyFrac > 0.3, `insideFrac=${r.insideAtDailyFrac}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

(async () => {
  if (SMOKE) { await smokeGate(); return; }
  const sides = SIDES.includes('both') ? ['control', 'armed'] : SIDES;
  console.log(`== sleepin pilot: ${SEEDS.length} seeds x ${POLICIES.length} policies x ${sides.length} sides, ${DAYS}d ==`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of sides) {
        const armed = side === 'armed';
        const r = await oneRun(seed, pid, armed, TRANSCRIPT_DIR);
        runs.push(r);
        console.log(`  [${side}/${pid} s${seed}] days=${r.days} end=${r.endReason} ` +
          `scholarHunger=${r.scholarHungerDays} siEnters=${r.siEnters} ` +
          `wave=${r.waveReach} rank=${r.maxRank}`);
        if (PERSEED_DIR) {
          try {
            fs.mkdirSync(PERSEED_DIR, { recursive: true });
            fs.writeFileSync(path.join(PERSEED_DIR, `sleepin-${side}-${pid}-s${seed}.json`),
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
    rep[side] = {
      n: rs.length,
      scholarHungerDays: sum(rs, 'scholarHungerDays'),
      hungerDays: sum(rs, 'hungerDays'),
      starveDeaths: sum(rs, 'starveDeaths'),
      scholarStarveDeaths: sum(rs, 'scholarStarveDeaths'),
      medianDays: med(rs, 'gameDays'),
      national: sum(rs, 'national'),
      table: sum(rs, 'table'),
      won: sum(rs, 'won'),
      wave4: rs.filter(r => r.waveReach >= 4).length,
      wave5: rs.filter(r => r.waveReach >= 5).length,
      siEnters: sum(rs, 'siEnters'),
      siRefused: sum(rs, 'siRefused'),
      siRows: sum(rs, 'siRows'),
      deaths: rs.reduce((acc, r) => { for (const [k, v] of Object.entries(r.deaths || {})) acc[k] = (acc[k] || 0) + v; return acc; }, {}),
    };
  }
  rep.perSeed = runs.map(r => ({
    policy: r.policy, seed: r.seed, side: r.side, days: r.days, gameDays: r.gameDays, endReason: r.endReason,
    scholarHungerDays: r.scholarHungerDays, hungerDays: r.hungerDays,
    starveDeaths: r.starveDeaths, scholarStarveDeaths: r.scholarStarveDeaths,
    national: r.national, table: r.table, won: r.won, waveReach: r.waveReach, maxArc: r.maxArc,
    siEnters: r.siEnters, siRows: r.siRows, insideAtDailyFrac: r.insideAtDailyFrac,
  }));
  console.log('\n== POOLED ==');
  for (const side of sides) {
    const p = rep[side];
    console.log(`  ${side}: scholarHunger=${p.scholarHungerDays} hunger=${p.hungerDays} ` +
      `starve=${p.starveDeaths}(scholar ${p.scholarStarveDeaths}) median=${p.medianDays}d ` +
      `national=${p.national}/${p.n} table=${p.table} won=${p.won} wave4=${p.wave4} wave5=${p.wave5} ` +
      `siEnters=${p.siEnters}`);
  }
  if (OUT) {
    try { fs.writeFileSync(OUT, JSON.stringify(rep, null, 1)); console.log('\nwrote ' + OUT); } catch (e) { console.log('OUT write failed: ' + e.message); }
  } else {
    console.log('\n' + JSON.stringify(rep, null, 1));
  }
})();
