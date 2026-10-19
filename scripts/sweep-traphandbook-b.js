#!/usr/bin/env node
// scripts/sweep-traphandbook-b.js — the Trapper Handbook loot-tuning sweep
// (arm sim-traphandbook-b, loop B food-economy axis, run
// fleshout-loop-b-20261018T1845Z).
//
// 8 fresh seeds (6901-6908; freshness verified against evidence/ + scripts/
// before any sims — 6601-6609 consumed by pitknowledge-b, 105101-105104 by
// the pitstaff probe, 67xx by earlier arms) x {leadtraphandbook,
// belongtraphandbook} x {control: TRAPHANDBOOK=0, armed: unset} = 32 runs,
// 180d death-aware, identical seeds both sides, own in-sweep paired
// control. PITKNOWLEDGE unset (the landed channel stays ON — this arm is
// additive to it, not a replacement).
//
// Env contract (asserted up front, SWEEP STOPS on mismatch):
//   FEASTSCALE_R13=1, SEATDRIVE=0 (explicit, pre-seat), PITKNOWLEDGE unset,
//   HUNTSTAFF unset, PITSTAFF unset.
//
// Per-run JSON -> evidence/2026-10-18/perseed-traphandbook-b/<side>-<policy>-s<seed>.json
// Metrics: pit acquisition (level/via/first day — PRIMARY, any via),
// handbook surfacing + knowledge-via-book (ENGAGEMENT), wall numbers
// (maxScale/national, table, wins, wave reach, arc), deaths bucketed by
// cause (guardrails), survival.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-traphandbook-b.js [side] [policy]
//   side: both (default) | control | armed
//   policy: both (default) | leadtraphandbook | belongtraphandbook
'use strict';
const fs = require('fs');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('ENV MISMATCH: FEASTSCALE_R13 must be 1'); process.exit(1); }
if (process.env.SEATDRIVE !== '0') { console.error('ENV MISMATCH: SEATDRIVE must be 0 (explicit pre-seat)'); process.exit(1); }
if (process.env.PITKNOWLEDGE === '0') { console.error('ENV MISMATCH: PITKNOWLEDGE must be unset (landed channel stays ON)'); process.exit(1); }
if (process.env.HUNTSTAFF) { console.error('ENV MISMATCH: HUNTSTAFF must be unset'); process.exit(1); }
if (process.env.PITSTAFF) { console.error('ENV MISMATCH: PITSTAFF must be unset (layer killed)'); process.exit(1); }

const SEEDS = [6901, 6902, 6903, 6904, 6905, 6906, 6907, 6908];
const POLICIES = (process.argv[3] && process.argv[3] !== 'both') ? [process.argv[3]] : ['leadtraphandbook', 'belongtraphandbook'];
const SIDES = (process.argv[2] && process.argv[2] !== 'both') ? [process.argv[2]] : ['control', 'armed'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-traphandbook-b');

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadTrapHandbook, belongTrapHandbook } = require('./policies/traphandbook');
const POLICY_OF = { leadtraphandbook: leadTrapHandbook, belongtraphandbook: belongTrapHandbook };

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

async function runOne(seed, policyId, side) {
  if (side === 'control') process.env.TRAPHANDBOOK = '0';
  else delete process.env.TRAPHANDBOOK;
  const base = POLICY_OF[policyId];
  if (!base) throw new Error('unknown policy ' + policyId);
  const { Game } = await loadGame({ seed, mode: 'traphandbook-sweep', fullTelemetry: true });
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

  const th = {};
  try {
    const ctx = result.ctx || {};
    th.booksRead = ctx.thBooksRead || 0; th.handbookRead = ctx.thHandbookRead || 0;
    th.ruinTours = ctx.thRuinTours || 0; th.ruinsSearched = ctx.thRuinsSearched || 0;
  } catch (e) {}

  const rec = {
    seed, side, policy: policyId, days: result.days, endReason: result.endReason,
    pit: { maxLevel: maxPit, via: pitVia, firstDay: firstPitDay },
    books,
    th,
    wall: { maxScale, won, tableWaiting, maxWaveUnlocked: result.maxWaveUnlocked || 0, maxArc },
    deaths: { player: playerDeaths, villager: villagerDeaths, buckets: deathBuckets },
    env: { feastscale: process.env.FEASTSCALE_R13, seatdrive: process.env.SEATDRIVE, pitknowledge: process.env.PITKNOWLEDGE || 'unset', traphandbook: side === 'control' ? '0' : 'unset' },
  };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const fn = path.join(OUTDIR, `${side}-${policyId}-s${seed}.json`);
  fs.writeFileSync(fn, JSON.stringify(rec, null, 1));
  console.log(`done: ${side} ${policyId} s${seed} days=${result.days} end=${result.endReason} pitL=${maxPit}${pitVia ? '(' + pitVia + ')' : ''} books=${books.found} hb=${books.handbooks} hbReads=${books.handbookReads} tours=${th.ruinTours} w=${result.maxWaveUnlocked || 0} won=${won}`);
  return rec;
}

(async () => {
  const runs = [];
  for (const side of SIDES) {
    for (const seed of SEEDS) {
      for (const pid of POLICIES) {
        try { runs.push(await runOne(seed, pid, side)); }
        catch (e) { console.error(`FATAL ${side}/${pid}/s${seed}`, e); process.exit(1); }
      }
    }
  }
  for (const side of SIDES) {
    const rs = runs.filter(r => r.side === side);
    const acq = rs.filter(r => r.pit.maxLevel >= 1).length;
    const engage = rs.reduce((t, r) => t + r.books.handbooks + r.books.handbookReads, 0);
    const readVia = rs.filter(r => r.pit.via === 'read').length;
    const days = rs.map(r => r.days).sort((a, b) => a - b);
    const med = days[Math.floor(days.length / 2)];
    const starv = rs.reduce((t, r) => t + (r.deaths.buckets.starvation || 0), 0);
    console.log(`SUMMARY side=${side} n=${rs.length} acquired=${acq}/16 engagement=${engage} readVia=${readVia} medDays=${med} starvDeaths=${starv} wins=${rs.filter(r => r.wall.won).length} national=${rs.filter(r => r.wall.maxScale === 'national' || r.wall.maxScale === 'global').length} table=${rs.filter(r => r.wall.tableWaiting).length}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
