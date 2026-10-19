#!/usr/bin/env node
// scripts/sweep-handbookloot-b.js — Trapper Handbook book-channel CENSUS
// (arm sim-handbookloot-b, loop B food-economy axis, run
// fleshout-loop-b-20261019T1230Z).
//
// PHASE 1 MEASUREMENT: 8 fresh seeds (9409-9416; freshness verified via
// git grep over scripts/ + evidence-filename scan 2026-10-16..19 before
// any sims) x {leadfeast, belongfeast} = 16 runs, 180d death-aware, on
// the CURRENT base, NO lever. The census policies do NOT tour ruins —
// they are the competent substrate as played; ruin-searching is measured
// by scripts/probe-handbookloot-b.js.
//
// Env contract (asserted up front, SWEEP STOPS on mismatch):
//   FEASTSCALE_R13=1, SEATDRIVE=0 (explicit, pre-seat), PITKNOWLEDGE unset
//   (landed channel ON — current master default), HUNTSTAFF unset,
//   PITSTAFF unset (layer killed).
//
// Per-run JSON -> evidence/2026-10-19/perseed-handbookloot-b/<policy>-s<seed>.json
// Metrics: handbook spawn events (say line), acquisition events (bookId in
// scholar inventory), readBook grants (pit_trap via='read'), wall numbers,
// deaths by cause (guardrails), survival.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-handbookloot-b.js [policy]
//   policy: both (default) | leadfeast | belongfeast
'use strict';
const fs = require('fs');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('ENV MISMATCH: FEASTSCALE_R13 must be 1'); process.exit(1); }
if (process.env.SEATDRIVE !== '0') { console.error('ENV MISMATCH: SEATDRIVE must be 0 (explicit pre-seat)'); process.exit(1); }
if (process.env.PITKNOWLEDGE === '0') { console.error('ENV MISMATCH: PITKNOWLEDGE must be unset (landed channel stays ON)'); process.exit(1); }
if (process.env.HUNTSTAFF) { console.error('ENV MISMATCH: HUNTSTAFF must be unset'); process.exit(1); }
if (process.env.PITSTAFF) { console.error('ENV MISMATCH: PITSTAFF must be unset (layer killed)'); process.exit(1); }

const SEEDS = [9409, 9410, 9411, 9412, 9413, 9414, 9415, 9416];
const POLICIES = (process.argv[2] && process.argv[2] !== 'both') ? [process.argv[2]] : ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-handbookloot-b');

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const POLICY_OF = { leadfeast, belongfeast };

function bucket(cause, monsterNames) {
  const c = String(cause || 'unknown').toLowerCase();
  if (monsterNames && monsterNames.has(c.replace(/_/g, ' '))) return 'monster:' + c;
  if (/starv|hunger|famine/.test(c)) return 'starvation';
  if (/dehydrat|thirst|water/.test(c)) return 'dehydration';
  if (/disease|sick|infection|fever|plague/.test(c)) return 'disease';
  if (/wound|bleed|maul|gore|bite|claw/.test(c)) return 'wounds';
  if (/cold|hypotherm|freeze|heat/.test(c)) return 'exposure';
  if (/combat|fight|kill|murder|executed/.test(c)) return 'violence';
  if (/poison|venom/.test(c)) return 'poison';
  if (/drown/.test(c)) return 'drowning';
  if (/age|old/.test(c)) return 'age';
  return 'other:' + c.slice(0, 24);
}

async function runOne(seed, policyId) {
  const base = POLICY_OF[policyId];
  if (!base) throw new Error('unknown policy ' + policyId);
  const { Game } = await loadGame({ seed, mode: 'handbookloot-b-census', fullTelemetry: true });
  await setupGame(Game);

  // book-channel instruments (say-wrap + read-wrap; honest counts)
  const books = { found: 0, handbooks: 0, reads: 0, handbookReads: 0 };
  const oSay = Game.say;
  Game.say = function (m) {
    try {
      const mm = String(m || '').match(/You find a book: "([^"]+)"/);
      if (mm) { books.found++; if (mm[1] === 'Trapper Handbook') books.handbooks++; }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const oRead = Game.readBook;
  Game.readBook = function (bid) {
    try { books.reads++; if (bid === 'trappers_handbook') books.handbookReads++; } catch (e) {}
    return oRead.apply(this, arguments);
  };

  let maxPit = 0, pitVia = null, firstPitDay = null;
  const policy = Object.assign({}, base);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    const r = oDaily ? oDaily(G, ctx) : undefined;
    try {
      const rk = ((G.state.codex || {}).recipes || {}).pit_trap || {};
      const lv = rk.level || 0;
      if (lv > maxPit) {
        maxPit = lv;
        if (firstPitDay === null) { firstPitDay = (G.state.scholar || {}).day || 0; pitVia = rk.via || null; }
      }
    } catch (e) {}
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS }); });
  const telemetry = result.telemetry || [];

  // end-of-run: did the handbook ever sit in the scholar's pack? (bookId — #579)
  let handbookAcquired = 0;
  try {
    for (const it of (Game.state.scholar.inventory || [])) {
      if (it && it.bookId === 'trappers_handbook') { handbookAcquired = 1; break; }
    }
  } catch (e) {}

  const monsterNames = new Set();
  try { for (const m of (Game.data.monsters || [])) { monsterNames.add(String(m.name || '').toLowerCase()); monsterNames.add(String(m.id || '').toLowerCase().replace(/_/g, ' ')); } } catch (e) {}
  const deathBuckets = {};
  let playerDeaths = 0, villagerDeaths = 0;
  const me = Game.villagerId;
  for (const ev of telemetry) {
    if (ev.type !== 'death' || (ev.kind || '') === 'monster') continue;
    const b = bucket(ev.cause, monsterNames);
    deathBuckets[b] = (deathBuckets[b] || 0) + 1;
    if (ev.who === me) playerDeaths++; else villagerDeaths++;
  }

  let maxScale = 'village';
  try { if (Game.scaleRank) maxScale = Game.scaleRank(); } catch (e) {}
  let won = false, tableWaiting = false, maxArc = 1;
  try { won = !!Game.won; } catch (e) {}
  try { const ps = Game.progState() || {}; tableWaiting = !!ps.tableWaiting; maxArc = ps.arc || 1; } catch (e) {}

  const rec = {
    seed, policy: policyId, days: result.days, endReason: result.endReason,
    pit: { maxLevel: maxPit, via: pitVia, firstDay: firstPitDay },
    books: Object.assign({ acquired: handbookAcquired }, books),
    wall: { maxScale, won, tableWaiting, maxWaveUnlocked: result.maxWaveUnlocked || 0, maxArc },
    deaths: { player: playerDeaths, villager: villagerDeaths, buckets: deathBuckets },
    env: { feastscale: process.env.FEASTSCALE_R13, seatdrive: process.env.SEATDRIVE, pitknowledge: process.env.PITKNOWLEDGE || 'unset' },
  };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const fn = path.join(OUTDIR, `${policyId}-s${seed}.json`);
  fs.writeFileSync(fn, JSON.stringify(rec, null, 1));
  console.log(`done: ${policyId} s${seed} days=${result.days} end=${result.endReason} pitL=${maxPit}${pitVia ? '(' + pitVia + ')' : ''} books=${books.found} hb=${books.handbooks} hbAcq=${handbookAcquired} hbReads=${books.handbookReads} w=${result.maxWaveUnlocked || 0} won=${won}`);
  return rec;
}

(async () => {
  const runs = [];
  for (const seed of SEEDS) {
    for (const pid of POLICIES) {
      try { runs.push(await runOne(seed, pid)); }
      catch (e) { console.error(`FATAL ${pid}/s${seed}`, e); process.exit(1); }
    }
  }
  const acq = runs.filter(r => r.pit.maxLevel >= 1).length;
  const spawns = runs.reduce((t, r) => t + r.books.handbooks, 0);
  const acqs = runs.reduce((t, r) => t + r.books.acquired, 0);
  const hbReads = runs.reduce((t, r) => t + r.books.handbookReads, 0);
  const readVia = runs.filter(r => r.pit.via === 'read').length;
  const days = runs.map(r => r.days).sort((a, b) => a - b);
  const med = days[Math.floor(days.length / 2)];
  const starv = runs.reduce((t, r) => t + (r.deaths.buckets.starvation || 0), 0);
  console.log(`SUMMARY n=${runs.length} spawns=${spawns} acquired=${acqs} hbReads=${hbReads} readVia=${readVia} pitAcquired=${acq}/16 medDays=${med} starvDeaths=${starv} wins=${runs.filter(r => r.wall.won).length} national=${runs.filter(r => r.wall.maxScale === 'national' || r.wall.maxScale === 'global').length} table=${runs.filter(r => r.wall.tableWaiting).length}`);
})();
