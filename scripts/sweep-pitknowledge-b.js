#!/usr/bin/env node
// scripts/sweep-pitknowledge-b.js — the pit-knowledge channel sweep
// (arm sim-pitknowledge-b, loop B food-economy axis, run
// fleshout-loop-b-20261018T175233Z).
//
// 8 fresh seeds (6601-6605, 6607-6609; 6606 excluded — consumed by
// journey-deepening-r9 on 2026-10-13) x {leadfeast, belongfeast} x
// {control: PITKNOWLEDGE=0, armed: unset} = 32 runs, 180d death-aware,
// identical seeds both sides, own in-sweep paired control.
//
// Env contract (asserted up front, SWEEP STOPS on mismatch):
//   FEASTSCALE_R13=1, SEATDRIVE=0 (explicit, pre-seat).
//
// Per-run JSON -> evidence/2026-10-18/perseed-pitknowledge-b/<side>-<policy>-s<seed>.json
// Metrics: pit acquisition (level/via/first day), channel firings
// (pit_teach/pit_overhear/pit_lesson/npc_pit teles, pit species, boar),
// wall numbers (maxScale/national, table, wins, wave reach, arc), deaths
// bucketed by cause (guardrails), survival.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-pitknowledge-b.js [side] [policy]
//   side: both (default) | control | armed
//   policy: both (default) | leadfeast | belongfeast
'use strict';
const fs = require('fs');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('ENV MISMATCH: FEASTSCALE_R13 must be 1'); process.exit(1); }
if (process.env.SEATDRIVE !== '0') { console.error('ENV MISMATCH: SEATDRIVE must be 0 (explicit pre-seat)'); process.exit(1); }

const SEEDS = [6601, 6602, 6603, 6604, 6605, 6607, 6608, 6609];
const POLICIES = (process.argv[3] && process.argv[3] !== 'both') ? [process.argv[3]] : ['leadfeast', 'belongfeast'];
const SIDES = (process.argv[2] && process.argv[2] !== 'both') ? [process.argv[2]] : ['control', 'armed'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-pitknowledge-b');

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');

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

const scaleRankOrder = (r) => ({ village: 0, local: 1, regional: 2, national: 3, global: 4 }[r] ?? -1);

async function runOne(seed, policyId, side) {
  if (side === 'control') process.env.PITKNOWLEDGE = '0';
  else delete process.env.PITKNOWLEDGE;
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: true });
  await setupGame(Game);

  const pit = { teaches: 0, overhears: 0, lessons: 0, catches: 0, kcal: 0, species: {}, boar: 0 };
  const oTele = Game.tele;
  Game.tele = function (t, d) {
    try {
      if (t === 'pit_teach') pit.teaches++;
      else if (t === 'pit_overhear') pit.overhears++;
      else if (t === 'pit_lesson') pit.lessons++;
      else if (t === 'npc_pit') {
        pit.catches++; pit.kcal += (d && d.kcal) || 0;
        const sp = (d && d.species) || '?';
        pit.species[sp] = (pit.species[sp] || 0) + 1;
        if (sp === 'wild_boar') pit.boar++;
      }
    } catch (e) {}
    return oTele.apply(this, arguments);
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
  try {
    // scaleRank sampled at end; approximate max via hierarchy if available
    if (Game.scaleRank) maxScale = Game.scaleRank();
  } catch (e) {}
  let won = false, tableWaiting = false, maxArc = 1;
  try { won = !!Game.won; } catch (e) {}
  try { const ps = Game.progState() || {}; tableWaiting = !!ps.tableWaiting; maxArc = ps.arc || 1; } catch (e) {}

  const rec = {
    seed, side, policy: policyId, days: result.days, endReason: result.endReason,
    pit: { maxLevel: maxPit, via: pitVia, firstDay: firstPitDay, ...pit },
    wall: { maxScale, won, tableWaiting, maxWaveUnlocked: result.maxWaveUnlocked || 0, maxArc },
    deaths: { player: playerDeaths, villager: villagerDeaths, buckets: deathBuckets },
    env: { feastscale: process.env.FEASTSCALE_R13, seatdrive: process.env.SEATDRIVE, pitknowledge: process.env.PITKNOWLEDGE || 'unset' },
  };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const fn = path.join(OUTDIR, `${side}-${policyId}-s${seed}.json`);
  fs.writeFileSync(fn, JSON.stringify(rec, null, 1));
  console.log(`done: ${side} ${policyId} s${seed} days=${result.days} end=${result.endReason} pitL=${maxPit}${pitVia ? '(' + pitVia + ')' : ''} teaches=${pit.teaches} catches=${pit.catches} boar=${pit.boar} w=${result.maxWaveUnlocked || 0} won=${won}`);
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
  // aggregate summary to stdout (evidence file carries the analysis)
  for (const side of SIDES) {
    const rs = runs.filter(r => r.side === side);
    const acq = rs.filter(r => r.pit.maxLevel >= 1).length;
    const firings = rs.reduce((t, r) => t + r.pit.teaches + r.pit.overhears + r.pit.lessons + r.pit.catches, 0);
    const bg = rs.filter(r => r.pit.via === 'background').length;
    const boar = rs.reduce((t, r) => t + r.pit.boar, 0);
    const days = rs.map(r => r.days).sort((a, b) => a - b);
    const med = days[Math.floor(days.length / 2)];
    const starv = rs.reduce((t, r) => t + (r.deaths.buckets.starvation || 0), 0);
    console.log(`SUMMARY side=${side} n=${rs.length} acquired=${acq}/16 firings=${firings} background=${bg} boar=${boar} medDays=${med} starvDeaths=${starv} wins=${rs.filter(r => r.wall.won).length} national=${rs.filter(r => r.wall.maxScale === 'national' || r.wall.maxScale === 'global').length} table=${rs.filter(r => r.wall.tableWaiting).length}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
