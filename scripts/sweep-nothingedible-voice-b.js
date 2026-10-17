#!/usr/bin/env node
// scripts/sweep-nothingedible-voice-b.js — pilot sweep for the ENGINE-side
// nothing-edible voice gate (loop B, run fleshout-b-20261017T1940Z, axis
// food-economy; fills finding #473).
//
// Sides: CONTROL (NOTHINGEDIBLE_GATE='0' + NOTHINGEDIBLE_VOICEGATE='0' — the
// exact pre-fix world where the census observed the spam) vs ARMED
// (NOTHINGEDIBLE_GATE='0', engine voice gate ON — isolates the engine
// gate's effect). 8 seeds x {leadfeast,belongfeast} x {control,armed} =
// 32 runs, 180d death-aware, identical seeds across sides,
// FEASTSCALE_R13=1 + SEATDRIVE=0 both sides (the census substrate).
//
// PRE-REGISTERED (evidence/2026-10-17/sim-nothingedible-voice-b.md, binding):
//   PRIMARY: duplicate "Nothing edible." beats (beyond the first per day
//     per pair) drop >=90% armed vs control.
//   SPEC: armed max/day <= 1 on every pair; armed first beat on each
//     nothing-day byte-identical to control's first beat that day.
//   GUARDRAILS: det-gate byte-identical per-day state trajectories 16/16
//     (narration stream may differ); national>=ctrl-2; table>=ctrl-2;
//     starveDeaths<=ctrl+2; won diff<=2; no new death mode n>=3;
//     wave-4/5 + median survival REPORT-ONLY.
//   GO -> the engine gate lands PERMANENTLY (voice-only, [needs-eyes]).
//   MISS -> revert the game.js edit zero-trace; evidence + instruments as
//     KILLED AT PILOT.
//   SMOKE=1: instrument-honesty asserts on the census's worst seed pair.
//
// Outputs: sweep JSON + per-seed JSON + beat transcripts (sense-test).
//
// Usage:
//   SMOKE=1 node scripts/sweep-nothingedible-voice-b.js
//   node scripts/sweep-nothingedible-voice-b.js
//   OUT=... PERSEED_DIR=... TRANSCRIPT_DIR=... node scripts/sweep-nothingedible-voice-b.js
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
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', exiled: false };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.exiled = !!((Game.state.scholar || {}).exiled); } catch (e) {}
  return out;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; }
// Same state fingerprint the det-gate proof uses (narration stream excluded).
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round((((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))) / 100)];
  return parts.join('|');
}

async function oneRun(seed, pid, armed, tdir) {
  const side = armed ? 'armed' : 'control';
  // Policy-side gate OFF both sides (isolate the engine gate); engine gate
  // off only on control.
  process.env.NOTHINGEDIBLE_GATE = '0';
  if (armed) delete process.env.NOTHINGEDIBLE_VOICEGATE; else process.env.NOTHINGEDIBLE_VOICEGATE = '0';
  const fsPath = './policies/feastscale';
  delete require.cache[require.resolve(fsPath)];
  const policy = require(fsPath)[pid];
  const { Game } = await loadGame({ seed, mode: 'nevoice-' + side });
  await setupGame(Game);
  // Beat capture: "Nothing edible." beats with day tags + full text (sense-test,
  // first-voice byte-identical check). Also per-day state hashes (det-gate).
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (NOTHING.test(s) && beats.length < 20000) beats.push({ day: gday(Game), text: s.slice(0, 1200) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const wrapped = Object.assign({}, policy);
  const origDaily = policy.daily, origUpkeep = policy.upkeep;
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1, exiled: false };
  const dayHashes = [];
  wrapped.upkeep = (G, ctx) => origUpkeep ? origUpkeep(G, ctx) : undefined;
  wrapped.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (s.exiled) hist.exiled = true;
      if (G.unlockedWave) hist.maxWave = Math.max(hist.maxWave, G.unlockedWave() || 1);
      dayHashes.push(G.state.scholar.day + ':' + dayHash(G));
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
  const byDay = {};
  const firstByDay = {};
  for (const b of beats) { byDay[b.day] = (byDay[b.day] || 0) + 1; if (!(b.day in firstByDay)) firstByDay[b.day] = b.text; }
  const perDay = Object.values(byDay);
  const maxPerDay = perDay.length ? Math.max(...perDay) : 0;
  const daysWith = perDay.length;
  if (tdir) {
    try {
      fs.mkdirSync(tdir, { recursive: true });
      fs.writeFileSync(path.join(tdir, `nevoice-${side}-${pid}-s${seed}.txt`),
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  delete process.env.NOTHINGEDIBLE_GATE;
  delete process.env.NOTHINGEDIBLE_VOICEGATE;
  return {
    policy: pid, seed, side, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: end.won ? 1 : 0, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    waveReach: hist.maxWave,
    deaths, starveDeaths,
    nothingBeats: perDay.reduce((t, n) => t + n, 0),
    nothingDays: daysWith,
    nothingMaxPerDay: maxPerDay,
    firstByDay,
    dayHashes: dayHashes.join('\n'),
    nothingSample: beats.slice(0, 3).map(b => `d${b.day}: ${b.text.slice(0, 220)}`),
  };
}

async function smokeGate() {
  console.log('== nevoice SMOKE ==');
  const fails = [];
  const check = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  const r = await oneRun(6101, 'belongfeast', true, null); // census's 105/day seed
  check('smoke armed: engine gate holds max/day <= 1', r.nothingMaxPerDay <= 1, `max=${r.nothingMaxPerDay}`);
  check('smoke armed: trigger path ran (some beats)', r.nothingBeats > 0, `${r.nothingBeats} beats over ${r.nothingDays} days`);
  check('smoke armed: run completed', r.gameDays > 0, `${r.gameDays}d end=${r.endReason}`);
  const rc = await oneRun(6101, 'belongfeast', false, null);
  check('smoke control: pre-fix world noisy (max/day > 10)', rc.nothingMaxPerDay > 10, `max=${rc.nothingMaxPerDay}`);
  check('smoke control: det-gate holds (per-day state hashes identical)', rc.dayHashes === r.dayHashes,
    rc.dayHashes === r.dayHashes ? 'identical' : 'DIVERGED');
  const days = Object.keys(r.firstByDay);
  const firstSame = days.every(d => rc.firstByDay[d] === r.firstByDay[d]);
  check('smoke: first-voice content byte-identical on shared nothing-days', firstSame, `${days.length} days`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  if (fails.length) process.exit(2);
}

(async () => {
  if (SMOKE) { await smokeGate(); return; }
  const sides = SIDES.includes('both') ? ['control', 'armed'] : SIDES;
  console.log(`== nevoice pilot: ${SEEDS.length} seeds x ${POLICIES.length} policies x ${sides.length} sides, ${DAYS}d, FEASTSCALE_R13=1 SEATDRIVE=0, policy-side gate OFF both sides ==`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const pair = {};
      for (const side of sides) {
        const armed = side === 'armed';
        const r = await oneRun(seed, pid, armed, TRANSCRIPT_DIR);
        pair[side] = r;
        runs.push(r);
        console.log(`  [${side}/${pid} s${seed}] days=${r.gameDays} end=${r.endReason} ` +
          `neBeats=${r.nothingBeats} neDays=${r.nothingDays} neMaxDay=${r.nothingMaxPerDay} ` +
          `wave=${r.waveReach} rank=${r.maxRank} table=${r.table} won=${r.won}`);
        if (PERSEED_DIR) {
          try {
            fs.mkdirSync(PERSEED_DIR, { recursive: true });
            const { firstByDay, dayHashes, nothingSample, ...rest } = r;
            fs.writeFileSync(path.join(PERSEED_DIR, `nevoice-${side}-${pid}-s${seed}.json`),
              JSON.stringify({ ...rest, nothingSample, firstByDay }, null, 1));
          } catch (e) {}
        }
      }
      // Per-pair det-gate + first-voice check, reported inline.
      if (pair.control && pair.armed) {
        const detSame = pair.control.dayHashes === pair.armed.dayHashes;
        const days = Object.keys(pair.armed.firstByDay);
        const mism = days.filter(d => pair.control.firstByDay[d] !== pair.armed.firstByDay[d]);
        const dupsC = pair.control.nothingBeats - pair.control.nothingDays;
        const dupsA = pair.armed.nothingBeats - pair.armed.nothingDays;
        console.log(`    pair ${pid} s${seed}: detGate=${detSame ? 'SAME' : 'DIVERGED'} ` +
          `dups ${dupsC}->${dupsA} maxDay ${pair.control.nothingMaxPerDay}->${pair.armed.nothingMaxPerDay} ` +
          `firstVoice ${mism.length ? 'MISMATCH d' + mism.join(',d') : `byte-identical (${days.length}d)`}`);
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
      exiled: sum(rs, 'exiled'),
      wave4: rs.filter(r => r.waveReach >= 4).length,
      wave5: rs.filter(r => r.waveReach >= 5).length,
      deaths: {},
    };
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths)) rep[side].deaths[k] = (rep[side].deaths[k] || 0) + v;
  }
  let verdict = 'NO-GO', goDetail = '';
  if (sides.includes('control') && sides.includes('armed')) {
    const c = rep.control, a = rep.armed;
    const dupsC = c.nothingBeats - c.nothingDays, dupsA = a.nothingBeats - a.nothingDays;
    const red = dupsC > 0 ? (dupsC - dupsA) / dupsC : 1;
    const gPrimary = red >= 0.90;
    const gSpec = a.nothingMaxPerDay <= 1;
    const gStarve = a.starveDeaths <= c.starveDeaths + 2;
    const gNat = a.national >= c.national - 2;
    const gTable = a.table >= c.table - 2;
    const gWon = Math.abs(a.won - c.won) <= 2;
    const newModes = Object.keys(a.deaths).filter(k => a.deaths[k] >= 3 && !(c.deaths[k] > 0));
    const gModes = newModes.length === 0;
    // det-gate across all pairs (recomputed from runs)
    let detFail = 0;
    for (const pid of POLICIES) for (const seed of SEEDS) {
      const rc = runs.find(r => r.side === 'control' && r.policy === pid && r.seed === seed);
      const ra = runs.find(r => r.side === 'armed' && r.policy === pid && r.seed === seed);
      if (rc && ra && rc.dayHashes !== ra.dayHashes) detFail++;
    }
    const gDet = detFail === 0;
    verdict = (gPrimary && gSpec && gStarve && gNat && gTable && gWon && gModes && gDet) ? 'GO' : 'NO-GO';
    goDetail = `PRIMARY dup-beats ${dupsC}->${dupsA} (${(red * 100).toFixed(1)}% reduction, GO>=90%): ${gPrimary}; ` +
      `SPEC armed max/day=${a.nothingMaxPerDay} (<=1): ${gSpec}; ` +
      `det-gate 16/16 byte-identical: ${gDet}${detFail ? ` (${detFail} diverged)` : ''}; ` +
      `beats ${a.nothingBeats} vs ${c.nothingBeats} over ${a.nothingDays} vs ${c.nothingDays} starvation days; ` +
      `starveDeaths ${a.starveDeaths} vs ${c.starveDeaths} (<=ctrl+2): ${gStarve}; ` +
      `national ${a.national} vs ${c.national} (>=ctrl-2): ${gNat}; ` +
      `table ${a.table} vs ${c.table} (>=ctrl-2): ${gTable}; ` +
      `won ${a.won} vs ${c.won} (<=2 diff): ${gWon}; ` +
      `new death modes: ${newModes.length ? newModes.join(',') : 'none'}: ${gModes}; ` +
      `wave4 ${a.wave4} vs ${c.wave4}; wave5 ${a.wave5} vs ${c.wave5} (REPORT-ONLY); ` +
      `median ${a.medianDays}d vs ${c.medianDays}d (REPORT-ONLY)`;
  }
  const sweep = {
    label: 'nevoice-pilot', seeds: SEEDS, policies: POLICIES, sides, days: DAYS,
    substrate: 'FEASTSCALE_R13=1 SEATDRIVE=0 both sides; NOTHINGEDIBLE_GATE=0 both sides (policy-side gate off); engine voice gate OFF on control, ON on armed',
    when: new Date().toISOString(),
    pooled: rep,
    go: { verdict, detail: goDetail },
    prereg: 'PRIMARY duplicate nothing-edible beats (beyond first/day/pair) drop >=90%; SPEC armed max/day<=1 + first-voice byte-identical; guardrails: det-gate 16/16 byte-identical, national>=ctrl-2, table>=ctrl-2, starveDeaths<=ctrl+2, won diff<=2, no new death mode n>=3; wave4/5 + median REPORT-ONLY',
  };
  if (OUT) { try { fs.writeFileSync(OUT, JSON.stringify(sweep, null, 1)); } catch (e) {} }
  console.log('\n-- pooled --');
  for (const side of sides) {
    const p = rep[side];
    console.log(`  ${side}: neBeats=${p.nothingBeats} neDays=${p.nothingDays} neMaxDay=${p.nothingMaxPerDay} ` +
      `starveDeaths=${p.starveDeaths} median=${p.medianDays}d national=${p.national}/${p.n} table=${p.table} ` +
      `won=${p.won} exiled=${p.exiled} wave4=${p.wave4} wave5=${p.wave5}`);
    console.log(`    deaths: ${JSON.stringify(p.deaths)}`);
  }
  console.log(`\nVERDICT: ${verdict} — ${goDetail}`);
  if (FEASTSCALE_WAS === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = FEASTSCALE_WAS;
  if (SEATDRIVE_WAS === undefined) delete process.env.SEATDRIVE; else process.env.SEATDRIVE = SEATDRIVE_WAS;
})().catch(e => { console.error('FATAL', e); process.exit(1); });
