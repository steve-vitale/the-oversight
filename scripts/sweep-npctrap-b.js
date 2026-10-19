#!/usr/bin/env node
// scripts/sweep-npctrap-b.js — NPC trapper economy census
// (arm sim-npctrap-b, loop B food-economy axis, run
// fleshout-loop-b-20261019T0130Z).
//
// Answers the #581 named next (sim-pitstaff-b2): instrument the live NPC
// pit economy — pitstaff 0-for-2 (do NOT re-run staffing), book channel
// dead (traphandbook-b killed). INSTRUMENT-ONLY: zero game-code changes.
//
// 8 fresh seeds (9421-9428; 7701-7708 rejected — 7701 genuinely consumed by
// sim-huntroster-b 2026-10-17; 7801-7818 consumed by sim-huntstaff-b/b2;
// 9421-9428 zero genuine hits in evidence/ + scripts/ + hidden_files/
// before sims) x {leadfeast, belongfeast} x {on: unset,
// off: PITKNOWLEDGE=0} = 32 runs, 180d death-aware, own in-sweep paired
// control. The off side is a pure instrument contrast (never a lever).
//
// Env contract (asserted up front, SWEEP STOPS on mismatch):
//   FEASTSCALE_R13=1, SEATDRIVE=0 (explicit, pre-seat).
//
// Per-run JSON -> evidence/2026-10-19/perseed-npctrap-b/<side>-<policy>-s<seed>.json
//
// Census (per run):
//   day0: scholar occupation, scholar pit_trap level (background L3 grant),
//     every roster villager with knowsPit (vid, name, occ, source='background')
//   grants: every grantKnowledge('recipe','pit_trap') (via type, day, by)
//   pit tele: pit_teach / pit_overhear / pit_lesson (teacher, learner, need)
//     / npc_pit (vid, species, kcal) / npc_trap (returns denominator)
//   holders: 30d snapshots of knowsPit holders (alive/dead, source,
//     apprenticeship spread), trust of knowsPit teachers, scholar-at-haven
//   books (#579): readBook calls, trappers_handbook bookId in scholar
//     inventory (the pitstaff probe read itemId — a false negative)
//   own-pit: scholar-held/set pit_trap tools (expected ~0; observational)
//   wall: maxScale/national, table, wins, wave reach, arc, survival
//   deaths: bucketed + knowsPit-holder deaths (name, occ, day, cause)
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-npctrap-b.js [side] [policy]
//   side: both (default) | on | off
//   policy: both (default) | leadfeast | belongfeast
'use strict';
const fs = require('fs');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('ENV MISMATCH: FEASTSCALE_R13 must be 1'); process.exit(1); }
if (process.env.SEATDRIVE !== '0') { console.error('ENV MISMATCH: SEATDRIVE must be 0 (explicit pre-seat)'); process.exit(1); }

const SEEDS = [9421, 9422, 9423, 9424, 9425, 9426, 9427, 9428];
const POLICIES = (process.argv[3] && process.argv[3] !== 'both') ? [process.argv[3]] : ['leadfeast', 'belongfeast'];
const SIDES = (process.argv[2] && process.argv[2] !== 'both') ? [process.argv[2]] : ['on', 'off'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-npctrap-b');

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
  if (/own pit/.test(c)) return 'own-pit-trap';
  if (/age|old/.test(c)) return 'age';
  return 'other:' + c.slice(0, 24);
}

const scaleRankOrder = (r) => ({ village: 0, local: 1, regional: 2, national: 3, global: 4 }[r] ?? -1);

function personInfo(Game, vid) {
  let person = null, vp = null;
  try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
  try { vp = Game.vpOf ? Game.vpOf(vid) : null; } catch (e) {}
  let name = String(vid).slice(0, 14);
  try { name = Game.displayName(vid) || name; } catch (e) {}
  return {
    vid: String(vid).slice(0, 14),
    name: name,
    occ: (person && (person.occupationId || person.formerOccupation)) || '?',
    knowsPit: !!(vp && vp.knowsPit),
    dead: !!(person && person.dead),
  };
}

function day0Census(Game) {
  const c = { scholarOcc: '?', scholarPit: 0, scholarPitVia: null, holders: [] };
  try {
    const me = Game.villagerId;
    const myvp = Game.vpOf ? Game.vpOf(me) : null;
    c.scholarOcc = (myvp && myvp.occupationId) || '?';
    const rk = ((Game.state.codex || {}).recipes || {}).pit_trap || {};
    c.scholarPit = rk.level || 0;
    c.scholarPitVia = rk.via || null;
  } catch (e) {}
  try {
    const roster = ((Game.state.village || {}).roster || []);
    for (const vid of roster) {
      const pi = personInfo(Game, vid);
      if (pi.knowsPit && !pi.dead) c.holders.push({ vid: pi.vid, name: pi.name, occ: pi.occ, source: 'background' });
    }
  } catch (e) {}
  return c;
}

async function runOne(seed, policyId, side) {
  if (side === 'off') process.env.PITKNOWLEDGE = '0';
  else delete process.env.PITKNOWLEDGE;
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: true });
  await setupGame(Game);

  const cen = { day0: day0Census(Game), grants: [], teaches: [], overhears: [], lessons: [], catches: [], books: { readCalls: 0, handbookSurfaced: 0, handbookDays: [] }, deaths: [], trapReturns: 0, trapReturnsByVid: {}, pitReturnsByVid: {} };
  const holderSource = {};
  for (const h of cen.day0.holders) holderSource[h.vid] = 'background';

  const oTele = Game.tele;
  Game.tele = function (t, d) {
    try {
      const day = ((this.state || {}).scholar || {}).day || 0;
      if (t === 'pit_teach') { const pi = personInfo(this, d && d.teacher); cen.teaches.push({ day, teacher: pi.name, tocc: pi.occ, trust: ((this.state.village.trust || {})[(d || {}).teacher] ?? null) }); }
      else if (t === 'pit_overhear') { const pi = personInfo(this, d && d.teacher); cen.overhears.push({ day, teacher: pi.name, tocc: pi.occ }); }
      else if (t === 'pit_lesson') {
        const tp = personInfo(this, d && d.teacher), lp = personInfo(this, d && d.learner);
        cen.lessons.push({ day, teacher: tp.name, tocc: tp.occ, learner: lp.name, locc: lp.occ, need: d && d.need });
        if (d && d.learner) holderSource[String(d.learner).slice(0, 14)] = 'apprenticeship';
      }
      else if (t === 'npc_pit') {
        const pi = personInfo(this, d && d.vid);
        cen.catches.push({ day, trapper: pi.name, tocc: pi.occ, species: (d && d.species) || '?', kcal: (d && d.kcal) || 0 });
        if (d && d.vid) { const k = String(d.vid).slice(0, 14); cen.pitReturnsByVid[k] = (cen.pitReturnsByVid[k] || 0) + 1; }
      }
      else if (t === 'npc_trap') { cen.trapReturns++; if (d && d.vid) { const k = String(d.vid).slice(0, 14); cen.trapReturnsByVid[k] = (cen.trapReturnsByVid[k] || 0) + 1; } }
      else if (t === 'death') {
        cen.deaths.push({ day, who: String((d && d.who) || '').slice(0, 14), kind: (d && d.kind) || '?', cause: (d && d.cause) || '?', player: !!(d && d.player) });
      }
    } catch (e) {}
    return oTele.apply(this, arguments);
  };

  const oGrant = Game.grantKnowledge.bind(Game);
  Game.grantKnowledge = function (domain, id, level, source) {
    let r = false;
    try { r = oGrant(domain, id, level, source); } catch (e) { throw e; }
    try {
      if (r === true && domain === 'recipe' && id === 'pit_trap') {
        cen.grants.push({ day: ((Game.state.scholar || {}).day || 0), level, via: (source && source.type) || '?', by: (source && source.by) || null });
      }
    } catch (e) {}
    return r;
  };

  const oRead = Game.readBook ? Game.readBook.bind(Game) : null;
  if (oRead) {
    Game.readBook = function (bookId) {
      cen.books.readCalls++;
      try { if (bookId === 'trappers_handbook') cen.books.handbookSurfaced++; } catch (e) {}
      return oRead(bookId);
    };
  }

  // 30d holder snapshots + trust bookkeeping
  const snaps = [];
  const base_daily = base.daily;
  const policy = Object.assign({}, base);
  policy.daily = (G, ctx) => {
    const r = base_daily ? base_daily(G, ctx) : undefined;
    try {
      const day = ((G.state.scholar || {}).day || 0);
      if (day % 30 === 0) {
        const roster = ((G.state.village || {}).roster || []);
        const holders = [];
        for (const vid of roster) {
          const pi = personInfo(G, vid);
          if (pi.knowsPit) {
            let tr = null;
            try { tr = (G.state.village.trust || {})[vid]; } catch (e) {}
            holders.push({ vid: pi.vid, name: pi.name, occ: pi.occ, source: holderSource[pi.vid] || 'unknown', dead: pi.dead, trust: tr == null ? null : Math.round(tr * 10) / 10 });
          }
        }
        const inv = (G.state.scholar || {}).inventory || [];
        const handbook = inv.some(i => i && i.bookId === 'trappers_handbook') ? 1 : 0; // #579: bookId, not itemId
        if (handbook) cen.books.handbookDays.push(day);
        cen.books.handbookSurfaced = Math.max(cen.books.handbookSurfaced, cen.books.handbookDays.length > 0 ? 1 : cen.books.handbookSurfaced);
        let heldPit = 0, setPit = 0;
        try {
          for (const t2 of ((G.state.scholar || {}).tools || [])) if (t2 && t2.recipeId === 'pit_trap') heldPit++;
          const tiles = (G.map && G.map.tiles) || [];
          for (let y = 0; y < tiles.length; y++) for (let x = 0; x < (tiles[y] || []).length; x++) {
            for (const tr2 of ((tiles[y][x] || {}).traps || [])) if (tr2 && tr2.recipeId === 'pit_trap') setPit++;
          }
        } catch (e) {}
        snaps.push({ day, holders, pop: roster.length, handbook, heldPit, setPit, pitL: (((G.state.codex || {}).recipes || {}).pit_trap || {}).level || 0 });
      }
    } catch (e) {}
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS }); });

  const monsterNames = new Set();
  try { for (const m of (Game.data.monsters || [])) { monsterNames.add(String(m.name || '').toLowerCase()); monsterNames.add(String(m.id || '').toLowerCase().replace(/_/g, ' ')); } } catch (e) {}
  const deathBuckets = {};
  let playerDeaths = 0, villagerDeaths = 0;
  const me = Game.villagerId;
  const holderDeaths = [];
  const day0vids = new Set(cen.day0.holders.map(h => h.vid));
  for (const ev of cen.deaths) {
    if ((ev.kind || '') === 'monster') continue;
    const b = bucket(ev.cause, monsterNames);
    deathBuckets[b] = (deathBuckets[b] || 0) + 1;
    if (ev.who === String(me).slice(0, 14)) playerDeaths++; else villagerDeaths++;
    if (day0vids.has(ev.who)) {
      const h = cen.day0.holders.find(x => x.vid === ev.who);
      holderDeaths.push({ name: h ? h.name : ev.who, occ: h ? h.occ : '?', day: ev.day, cause: ev.cause, bucket: b });
    }
  }

  let maxScale = 'village';
  try { if (Game.scaleRank) maxScale = Game.scaleRank(); } catch (e) {}
  let won = false, tableWaiting = false, maxArc = 1;
  try { won = !!Game.won; } catch (e) {}
  try { const ps = Game.progState() || {}; tableWaiting = !!ps.tableWaiting; maxArc = ps.arc || 1; } catch (e) {}

  const catches = cen.catches;
  const pitKcal = catches.reduce((t, c) => t + (c.kcal || 0), 0);
  const boarCatches = catches.filter(c => c.species === 'wild_boar');
  const boarKcal = boarCatches.reduce((t, c) => t + (c.kcal || 0), 0);

  const rec = {
    seed, side, policy: policyId, days: result.days, endReason: result.endReason,
    env: { feastscale: process.env.FEASTSCALE_R13, seatdrive: process.env.SEATDRIVE, pitknowledge: process.env.PITKNOWLEDGE || 'unset' },
    day0: cen.day0,
    grants: cen.grants,
    scholarPitFirst: null,
    firings: { teaches: cen.teaches.length, overhears: cen.overhears.length, lessons: cen.lessons.length, catches: catches.length, trapReturns: cen.trapReturns },
    pit: {
      catches: catches.length, kcal: pitKcal, kcalPer100d: result.days ? Math.round((pitKcal / result.days) * 1000) / 10 : 0,
      boar: boarCatches.length, boarKcal, boarShare: catches.length ? Math.round(boarCatches.length / catches.length * 1000) / 10 : 0,
      avgBoarKcal: boarCatches.length ? Math.round(boarKcal / boarCatches.length) : 0,
      species: catches.reduce((o, c) => { o[c.species] = (o[c.species] || 0) + 1; return o; }, {}),
    },
    teachers: cen.teaches, overhears: cen.overhears, lessons: cen.lessons,
    books: cen.books,
    holderDeaths,
    snaps,
    wall: { maxScale, won, tableWaiting, maxWaveUnlocked: result.maxWaveUnlocked || 0, maxArc },
    deaths: { player: playerDeaths, villager: villagerDeaths, buckets: deathBuckets },
  };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const fn = path.join(OUTDIR, `${side}-${policyId}-s${seed}.json`);
  fs.writeFileSync(fn, JSON.stringify(rec, null, 1));
  console.log(`done: ${side} ${policyId} s${seed} days=${result.days} pitL0=${cen.day0.scholarPit} holders0=${cen.day0.holders.length} teaches=${cen.teaches.length} catches=${catches.length} boar=${boarCatches.length} kcal=${pitKcal} books=${cen.books.readCalls} w=${result.maxWaveUnlocked || 0} won=${won}`);
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
    const trapperRuns = rs.filter(r => r.day0.holders.length > 0);
    const catches = rs.reduce((t, r) => t + r.pit.catches, 0);
    const kcal = rs.reduce((t, r) => t + r.pit.kcal, 0);
    const boar = rs.reduce((t, r) => t + r.pit.boar, 0);
    const days = rs.reduce((t, r) => t + r.days, 0);
    const grants = {};
    for (const r of rs) for (const g of r.grants) grants[g.via] = (grants[g.via] || 0) + 1;
    const teachings = rs.reduce((t, r) => t + r.firings.teaches, 0);
    const lessons = rs.reduce((t, r) => t + r.firings.lessons, 0);
    const overhears = rs.reduce((t, r) => t + r.firings.overhears, 0);
    const bgr = rs.filter(r => r.day0.scholarPit >= 1).length;
    console.log(`SUMMARY side=${side} n=${rs.length} trapperRuns=${trapperRuns.length}/16 backgroundScholar=${bgr} catches=${catches} kcal=${kcal} kcalPer100d=${days ? Math.round(kcal / days * 10000) / 100 : 0} boar=${boar} grants=${JSON.stringify(grants)} teaches=${teachings} overhears=${overhears} lessons=${lessons} wins=${rs.filter(r => r.wall.won).length} national=${rs.filter(r => r.wall.maxScale === 'national' || r.wall.maxScale === 'global').length} table=${rs.filter(r => r.wall.tableWaiting).length} wave4=${rs.filter(r => r.wall.maxWaveUnlocked >= 4).length} wave5=${rs.filter(r => r.wall.maxWaveUnlocked >= 5).length}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
