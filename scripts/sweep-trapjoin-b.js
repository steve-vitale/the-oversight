#!/usr/bin/env node
// scripts/sweep-trapjoin-b.js — trapper-joiner first-class channel pilot
// (arm sim-trapjoin-b, loop B food-economy axis, run
// fleshout-loop-b-20261019T0317Z).
//
// The layer (scripts/policies/trapjoin.js, TRAPJOIN=1): joiner detection via
// vid-appearance events, welcome conversations for trapper-occupation
// joiners (trust < 20), trust-gated 'teach' duties (trust >= 20) that drive
// the pit apprenticeship (pit_lesson) — the line grows through joiners.
//
// 8 fresh seeds (6621-6628; verified zero genuine hits in evidence/ +
// scripts/ + hidden_files/ before sims) x {leadfeast, belongfeast} x
// {on: TRAPJOIN=1, off: unset} = 32 runs, 180d death-aware. Both sides run
// the SAME policy objects (trapjoinLead/trapjoinBelong) — the env gate is
// the only difference (RED-2: gate-off trajectory identical to base).
//
// Env contract (asserted up front, SWEEP STOPS on mismatch):
//   FEASTSCALE_R13=1, SEATDRIVE=0 (explicit, pre-seat).
//
// Per-run JSON -> evidence/2026-10-19/perseed-trapjoin-b/<side>-<policy>-s<seed>.json
//
// Census (per run):
//   joiners: vid-appearance events (day, occ, trapper?, knowsPit) — events,
//     not snapshots (the sim-npctrap-b caveat)
//   layer: welcome log + duty log (on-side; off-side must be empty)
//   pit tele: pit_teach / pit_overhear / pit_lesson (teacher, learner, need)
//     / npc_pit (vid, species, kcal, joiner-attribution) / npc_trap
//   wall: maxScale/national, table, wins, wave reach, arc, survival
//   deaths: bucketed
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-trapjoin-b.js [side] [policy]
//   side: both (default) | on | off
//   policy: both (default) | leadfeast | belongfeast
'use strict';
const fs = require('fs');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('ENV MISMATCH: FEASTSCALE_R13 must be 1'); process.exit(1); }
if (process.env.SEATDRIVE !== '0') { console.error('ENV MISMATCH: SEATDRIVE must be 0 (explicit pre-seat)'); process.exit(1); }

const SEEDS = process.env.TJ_SEEDS
  ? process.env.TJ_SEEDS.split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isSafeInteger)
  : [6621, 6622, 6623, 6624, 6625, 6626, 6627, 6628];
const POLICIES = (process.argv[3] && process.argv[3] !== 'both') ? [process.argv[3]] : ['leadfeast', 'belongfeast'];
const SIDES = (process.argv[2] && process.argv[2] !== 'both') ? [process.argv[2]] : ['on', 'off'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-trapjoin-b');

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const TJ = require('./policies/trapjoin');

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

function personInfo(Game, vid) {
  let person = null, vp = null;
  try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
  try { vp = Game.vpOf ? Game.vpOf(vid) : null; } catch (e) {}
  let name = String(vid).slice(0, 14);
  try { name = Game.displayName(vid) || name; } catch (e) {}
  const occ = String((person && (person.formerOccupation || person.occupationId)) || '?');
  return {
    vid: String(vid).slice(0, 14),
    name, occ,
    trapper: /hunting guide|trail crew|rancher/i.test(occ),
    knowsPit: !!(vp && vp.knowsPit),
    dead: !!(person && person.dead),
  };
}

async function runOne(seed, policyId, side) {
  if (side === 'on') process.env.TRAPJOIN = '1';
  else delete process.env.TRAPJOIN;
  const base = policyId === 'leadfeast' ? TJ.trapjoinLead : TJ.trapjoinBelong;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: true });
  await setupGame(Game);

  const cen = {
    teaches: [], overhears: [], lessons: [], catches: [],
    deaths: [], trapReturns: 0, trapReturnsByVid: {}, pitReturnsByVid: {},
    joiners: {}, // vid -> {day, occ, trapper, knowsPit} — vid-appearance events
  };
  const seen = {};
  let seeded = false;

  const oTele = Game.tele;
  Game.tele = function (t, d) {
    try {
      const day = ((this.state || {}).scholar || {}).day || 0;
      if (t === 'pit_teach') { const pi = personInfo(this, d && d.teacher); cen.teaches.push({ day, teacher: pi.name, tocc: pi.occ }); }
      else if (t === 'pit_overhear') { const pi = personInfo(this, d && d.teacher); cen.overhears.push({ day, teacher: pi.name, tocc: pi.occ }); }
      else if (t === 'pit_lesson') {
        const tp = personInfo(this, d && d.teacher), lp = personInfo(this, d && d.learner);
        cen.lessons.push({ day, teacher: tp.name, tocc: tp.occ, tJoiner: !!cen.joiners[String(d && d.teacher).slice(0, 14)], learner: lp.name, locc: lp.occ, lJoiner: !!cen.joiners[String(d && d.learner).slice(0, 14)], need: d && d.need });
      }
      else if (t === 'npc_pit') {
        const pi = personInfo(this, d && d.vid);
        const vk = String(d && d.vid).slice(0, 14);
        const j = cen.joiners[vk];
        cen.catches.push({ day, trapper: pi.name, tocc: pi.occ, joiner: !!j, joinDay: j ? j.day : null, species: (d && d.species) || '?', kcal: (d && d.kcal) || 0 });
        cen.pitReturnsByVid[vk] = (cen.pitReturnsByVid[vk] || 0) + 1;
      }
      else if (t === 'npc_trap') { cen.trapReturns++; if (d && d.vid) { const k = String(d.vid).slice(0, 14); cen.trapReturnsByVid[k] = (cen.trapReturnsByVid[k] || 0) + 1; } }
      else if (t === 'death') {
        cen.deaths.push({ day, who: String((d && d.who) || '').slice(0, 14), kind: (d && d.kind) || '?', cause: (d && d.cause) || '?', player: !!(d && d.player) });
      }
    } catch (e) {}
    return oTele.apply(this, arguments);
  };

  // sweep-side joiner tracking (independent of the layer — both sides):
  // vid-appearance events, not snapshots.
  const base_daily = base.daily;
  const policy = Object.assign({}, base);
  let layerCtx = null;
  policy.daily = (G, ctx) => {
    layerCtx = ctx;
    const r = base_daily ? base_daily(G, ctx) : undefined;
    try {
      const day = ((G.state.scholar || {}).day || 0);
      const roster = ((G.state.village || {}).roster || []);
      if (!seeded) { for (const vid of roster) seen[vid] = true; seeded = true; }
      else {
        for (const vid of roster) {
          if (seen[vid] || vid === G.villagerId) continue;
          seen[vid] = true;
          const pi = personInfo(G, vid);
          cen.joiners[pi.vid] = { day, occ: pi.occ, trapper: pi.trapper, knowsPit: pi.knowsPit };
        }
      }
    } catch (e) {}
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS }); });

  const monsterNames = new Set();
  try { for (const m of (Game.data.monsters || [])) { monsterNames.add(String(m.name || '').toLowerCase()); monsterNames.add(String(m.id || '').toLowerCase().replace(/_/g, ' ')); } } catch (e) {}
  const deathBuckets = {};
  let playerDeaths = 0, villagerDeaths = 0, starvationDeaths = 0;
  const me = Game.villagerId;
  for (const ev of cen.deaths) {
    if ((ev.kind || '') === 'monster') continue;
    const b = bucket(ev.cause, monsterNames);
    deathBuckets[b] = (deathBuckets[b] || 0) + 1;
    if (b === 'starvation') starvationDeaths++;
    if (ev.who === String(me).slice(0, 14)) playerDeaths++; else villagerDeaths++;
  }

  let maxScale = 'village';
  try { if (Game.scaleRank) maxScale = Game.scaleRank(); } catch (e) {}
  let won = false, tableWaiting = false, maxArc = 1;
  try { won = !!Game.won; } catch (e) {}
  try { const ps = Game.progState() || {}; tableWaiting = !!ps.tableWaiting; maxArc = ps.arc || 1; } catch (e) {}

  const catches = cen.catches;
  const pitKcal = catches.reduce((t, c) => t + (c.kcal || 0), 0);
  const joinerCatches = catches.filter(c => c.joiner);
  const joinerKcal = joinerCatches.reduce((t, c) => t + (c.kcal || 0), 0);
  const boarCatches = catches.filter(c => c.species === 'wild_boar');
  const boarKcal = boarCatches.reduce((t, c) => t + (c.kcal || 0), 0);

  const layer = { welcomes: 0, duties: 0, dutyOk: 0, dutyRefused: 0, joinersTracked: 0 };
  try {
    if (layerCtx) {
      layer.welcomes = ((layerCtx._tjWelcomeLog) || []).length;
      const dl = (layerCtx._tjDutyLog) || [];
      layer.duties = dl.length;
      layer.dutyOk = dl.filter(e => e && e.ok).length;
      layer.dutyRefused = dl.filter(e => e && e.refused).length;
      layer.joinersTracked = Object.keys(layerCtx._tjJoiners || {}).length;
    }
  } catch (e) {}

  const rec = {
    seed, side, policy: policyId, days: result.days, endReason: result.endReason,
    env: { feastscale: process.env.FEASTSCALE_R13, seatdrive: process.env.SEATDRIVE, trapjoin: process.env.TRAPJOIN || 'unset' },
    joiners: cen.joiners,
    firings: { teaches: cen.teaches.length, overhears: cen.overhears.length, lessons: cen.lessons.length, catches: catches.length, joinerCatches: joinerCatches.length, trapReturns: cen.trapReturns },
    pit: {
      catches: catches.length, kcal: pitKcal, kcalPer100d: result.days ? Math.round((pitKcal / result.days) * 1000) / 10 : 0,
      joinerKcal, joinerKcalPer100d: result.days ? Math.round((joinerKcal / result.days) * 1000) / 10 : 0,
      boar: boarCatches.length, boarKcal,
      avgBoarKcal: boarCatches.length ? Math.round(boarKcal / boarCatches.length) : 0,
      species: catches.reduce((o, c) => { o[c.species] = (o[c.species] || 0) + 1; return o; }, {}),
    },
    layer,
    lessons: cen.lessons,
    wall: { maxScale, won, tableWaiting, maxWaveUnlocked: result.maxWaveUnlocked || 0, maxArc },
    deaths: { player: playerDeaths, villager: villagerDeaths, starvation: starvationDeaths, buckets: deathBuckets },
  };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const fn = path.join(OUTDIR, `${side}-${policyId}-s${seed}.json`);
  fs.writeFileSync(fn, JSON.stringify(rec, null, 1));
  console.log(`done: ${side} ${policyId} s${seed} days=${result.days} joiners=${Object.keys(cen.joiners).length} welcomes=${layer.welcomes} duties=${layer.duties}(ok${layer.dutyOk}/ref${layer.dutyRefused}) lessons=${cen.lessons.length} catches=${catches.length}(j${joinerCatches.length}) kcal=${pitKcal} boar=${boarCatches.length} w=${result.maxWaveUnlocked || 0} won=${won}`);
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
    const catches = rs.reduce((t, r) => t + r.pit.catches, 0);
    const kcal = rs.reduce((t, r) => t + r.pit.kcal, 0);
    const jkcal = rs.reduce((t, r) => t + r.pit.joinerKcal, 0);
    const boar = rs.reduce((t, r) => t + r.pit.boar, 0);
    const days = rs.reduce((t, r) => t + r.days, 0);
    const lessons = rs.reduce((t, r) => t + r.firings.lessons, 0);
    const teaches = rs.reduce((t, r) => t + r.firings.teaches, 0);
    const welcomes = rs.reduce((t, r) => t + r.layer.welcomes, 0);
    const duties = rs.reduce((t, r) => t + r.layer.duties, 0);
    const surv = rs.map(r => r.days).sort((a, b) => a - b);
    const med = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
    const starv = rs.reduce((t, r) => t + r.deaths.starvation, 0);
    console.log(`SUMMARY side=${side} n=${rs.length} catches=${catches} kcal=${kcal} kcalPer100d=${days ? Math.round(kcal / days * 10000) / 100 : 0} joinerKcal=${jkcal} boar=${boar} lessons=${lessons} teaches=${teaches} welcomes=${welcomes} duties=${duties} medSurv=${med} starv=${starv} wins=${rs.filter(r => r.wall.won).length} national=${rs.filter(r => r.wall.maxScale === 'national' || r.wall.maxScale === 'global').length} table=${rs.filter(r => r.wall.tableWaiting).length} wave4=${rs.filter(r => r.wall.maxWaveUnlocked >= 4).length} wave5=${rs.filter(r => r.wall.maxWaveUnlocked >= 5).length}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
