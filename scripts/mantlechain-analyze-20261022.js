#!/usr/bin/env node
// mantlechain-analyze-20261022.js — attribution for the mantlechain DIAG.
// Reads evidence/2026-10-22/perseed-mantlechain/mantlechain-s<seed>-<base>.json
// and answers: of veterans who die in wave-4 fights, how many died AS the
// mantle-holder leading the party within N=30 days of succession, vs dying
// as plain fighters?
//
// PRE-REGISTERED (§14, in evidence/2026-10-22/sim-mantlechain.md):
//   IN-SCOPE  = veteran (≥1 wave-4+ waveKillLog kill, kill day ≤ death day) +
//               died in a wave-4 fight (fightWave ≥ 4, live-tbfight or
//               combat-cause-gated same-day basis).
//   chain-accelerated = in-scope + died as the mantle-holder (player death) +
//               latest succession for that vid ≤ 30 days before death.
//   baseline-fighter  = in-scope + NOT chain-accelerated.
// DIAG-GO bar: ≥95% chain-accelerated AND 0 unattributed.
//
// SECONDARY (not binding): the accelerant factor — per wave-4-fight
// participation death hazard for fresh successors (≤30d) vs veteran
// non-successor participants.
//
// Usage: node scripts/mantlechain-analyze-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-mantlechain');
const N_DAYS = 30;

function veteranAt(log, vid, deathDay) {
  try {
    for (const e of log) {
      if (e && e.by === vid && (e.w | 0) >= 4 && (e.d | 0) <= deathDay) return true;
    }
  } catch (e) {}
  return false;
}
function latestSuccession(successions, vid, deathDay) {
  let best = null;
  for (const s of successions) {
    if (s && s.newId === vid && s.day <= deathDay && (!best || s.day > best.day)) best = s;
  }
  return best;
}

let combatCause = null;
try { combatCause = require('./mantlechain-instr-20261022').combatCause; } catch (e) {}
let MONSTERS = [];
try { MONSTERS = require(path.join(REPO, 'src', 'data', 'monsters.json')); } catch (e) {}
const MONSTER_GAME = { data: { monsters: MONSTERS } };
function inWave4Fight(d) {
  // The wave-4-fight predicate, enforced in the ANALYZER as well as the
  // instrument: a live-tbfight basis always counts; a same-day basis only
  // counts for combat causes (a same-day starvation death is never a
  // wave-4-fight death, even if the instrument row were hand-edited). The
  // real monster roster feeds the monster-name cause check.
  if ((d.fightWave | 0) < 4) return false;
  if (d.fightBasis === 'live-tbfight') return true;
  if (d.fightBasis === 'same-day' && combatCause) {
    try { return combatCause(d.cause, MONSTER_GAME); } catch (e) { return false; }
  }
  return false;
}

function attributeRow(row) {
  const { seed, base, successions, deaths, waveKillLog } = row;
  const attributed = []; // per in-scope death
  for (const d of deaths) {
    const who = d.who;
    if (!who || who === '?') continue;
    const vet = veteranAt(waveKillLog, who, d.day);
    const w4 = inWave4Fight(d);
    if (!(vet && w4)) continue; // out of scope — NOT a miss, the population is defined by vet∧w4
    const succ = latestSuccession(successions, who, d.day);
    const freshSucc = succ && (d.day - succ.day) <= N_DAYS;
    const chain = !!(d.player && freshSucc);
    attributed.push({
      seed, base, day: d.day, vid: who, name: d.whoName, cause: d.cause,
      fightMid: d.fightMid, fightBasis: d.fightBasis,
      succDay: succ ? succ.day : null, daysSinceSuccession: succ ? d.day - succ.day : null,
      scholarAtDeath: !!d.player, bucket: chain ? 'chain-accelerated' : 'baseline-fighter',
    });
  }
  return attributed;
}

function fightKey(f) { return `d${f.day}|${f.mid}`; }

function accelerantFactor(rows) {
  // Per wave-4 fight, participants = scholar + party vids. Fresh successors
  // (≤30d) vs veteran non-successor participants. Deaths link to fights by
  // (day, mid). Hazard = deaths / fight-participations.
  const parts = { fresh: 0, vetBase: 0, other: 0 };
  const deaths = { fresh: 0, vetBase: 0, other: 0 };
  for (const row of rows) {
    const fights = (row.fights || []);
    const deathsByKey = {};
    for (const d of (row.deaths || [])) {
      if ((d.fightWave | 0) < 4) continue;
      const k = `d${d.day}|${d.fightMid}`;
      (deathsByKey[k] = deathsByKey[k] || []).push(d);
    }
    const seenFight = new Set();
    for (const f of fights) {
      const k = fightKey(f);
      if (seenFight.has(k)) continue;
      seenFight.add(k);
      const participants = new Set();
      if (f.scholar) participants.add(f.scholar);
      for (const p of (f.party || [])) participants.add(p);
      const dlist = deathsByKey[k] || [];
      const deadVids = new Set(dlist.map(d => d.who));
      for (const vid of participants) {
        const vet = veteranAt(row.waveKillLog, vid, f.day);
        const succ = latestSuccession(row.successions, vid, f.day);
        const fresh = succ && (f.day - succ.day) <= N_DAYS;
        const bucket = fresh ? 'fresh' : (vet ? 'vetBase' : 'other');
        parts[bucket]++;
        if (deadVids.has(vid)) deaths[bucket]++;
      }
    }
  }
  const hz = b => parts[b] ? deaths[b] / parts[b] : null;
  const hzFresh = hz('fresh'), hzVet = hz('vetBase');
  return { parts, deaths, hzFresh, hzVet,
    factor: (hzFresh != null && hzVet != null && hzVet > 0) ? hzFresh / hzVet : null };
}

function wall(rows) {
  let national = 0, table = 0, wins = 0, w4 = 0, w5 = 0;
  const days = [];
  for (const r of rows) {
    if (r.scaleRank === 'national' || r.scaleRank === 'global') national++;
    if (r.standing != null && r.standing >= 200) table++;
    if (r.won) wins++;
    if ((r.maxWave | 0) >= 4) w4++;
    if ((r.maxWave | 0) >= 5) w5++;
    days.push(r.days);
  }
  days.sort((a, b) => a - b);
  return { n: rows.length, national, table, wins, w4, w5,
    medianDays: days.length ? days[Math.floor(days.length / 2)] : null };
}

function main() {
  const files = fs.readdirSync(DIR).filter(f => /^mantlechain-s\d+-(leadfeast|belongfeast)\.json$/.test(f));
  const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
  const all = [];
  for (const row of rows) all.push(...attributeRow(row));

  const chain = all.filter(a => a.bucket === 'chain-accelerated');
  const base = all.filter(a => a.bucket === 'baseline-fighter');
  const share = all.length ? chain.length / all.length : null;
  const unattributed = all.filter(a => a.bucket !== 'chain-accelerated' && a.bucket !== 'baseline-fighter');

  console.log(`CORPUS: ${rows.length} configs, ${all.length} in-scope veteran wave-4 deaths`);
  console.log(`  chain-accelerated: ${chain.length}  baseline-fighter: ${base.length}  unattributed: ${unattributed.length}`);
  console.log(`  SHARE chain = ${share == null ? 'n/a' : (share * 100).toFixed(1) + '%'}  (DIAG-GO bar ≥95%, 0 unattributed)`);
  const verdict = all.length > 0 && share >= 0.95 && unattributed.length === 0 ? 'DIAG-GO'
    : (all.length === 0 ? 'NO-GO (no-data)' : 'NO-GO');
  console.log(`  VERDICT: ${verdict}`);
  console.log('\nIn-scope deaths:');
  for (const a of all) {
    console.log(`  s${a.seed}/${a.base} d${a.day} ${a.name} ← ${a.fightMid} (${a.fightBasis}) ${a.scholarAtDeath ? 'AS SCHOLAR' : 'companion'} succ d${a.succDay} (+${a.daysSinceSuccession}d) → ${a.bucket}`);
  }
  const succs = rows.reduce((n, r) => n + (r.successions || []).length, 0);
  const vetSuccs = rows.reduce((n, r) => n + (r.successions || []).filter(s => s.veteran).length, 0);
  console.log(`\nSuccessions: ${succs} total, ${vetSuccs} to already-veterans (${succs ? (vetSuccs / succs * 100).toFixed(0) : 'n/a'}%)`);
  const acc = accelerantFactor(rows);
  console.log(`\nAccelerant factor (per wave-4 fight participation):`);
  console.log(`  participations: fresh=${acc.parts.fresh} vetBase=${acc.parts.vetBase} other=${acc.parts.other}`);
  console.log(`  deaths: fresh=${acc.deaths.fresh} vetBase=${acc.deaths.vetBase} other=${acc.deaths.other}`);
  console.log(`  hazard fresh=${acc.hzFresh == null ? 'n/a' : acc.hzFresh.toFixed(3)} vetBase=${acc.hzVet == null ? 'n/a' : acc.hzVet.toFixed(3)}`);
  console.log(`  FACTOR = ${acc.factor == null ? 'n/a (insufficient data)' : acc.factor.toFixed(2) + 'x'}`);
  const w = wall(rows);
  console.log(`\nWall (corpus): national ${w.national}/${w.n} table(standing≥200) ${w.table}/${w.n} won ${w.wins}/${w.n} wave4 ${w.w4}/${w.n} wave5 ${w.w5}/${w.n} medianDays ${w.medianDays}`);
  const errs = rows.reduce((n, r) => n + ((r.instrumentErrors || []).length), 0);
  console.log(`instrument errors: ${errs}`);
  return { verdict, share, chain: chain.length, base: base.length, unattributed: unattributed.length, succs, vetSuccs, acc, wall: w, instrumentErrors: errs };
}

if (require.main === module) {
  main();
}
module.exports = { attributeRow, latestSuccession, veteranAt, accelerantFactor, wall, N_DAYS };
