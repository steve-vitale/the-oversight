#!/usr/bin/env node
// bankxp-pilot-20261017.js — pilot sweep for the BANKXP craft-XP drive.
// 8 fresh seeds x {leadfeast, belongfeast} x {control, armed}, 180d
// death-aware. FEASTSCALE_R13=1, SEATDRIVE=0 (set by caller).
// Emits evidence/2026-10-17/perseed-bankxp/<side>-<pid>-<seed>.json + summary.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const POLICIES = { leadfeast, belongfeast };
const SEEDS = [1701, 1702, 1703, 1704, 1705, 1706, 1707, 1708];
const DAYS = 180;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-bankxp');
fs.mkdirSync(OUTDIR, { recursive: true });

function wallSnap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village', vests: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try {
    const VEST_IDS = ['military_vest', 'swat_vest'];
    for (const it of ((Game.state.scholar || {}).inventory || [])) if (it && VEST_IDS.includes(it.id)) out.vests += (it.units || 1);
  } catch (e) {}
  return out;
}

async function oneRun(pid, seed, armed) {
  if (armed) process.env.BANKXP_B = '1'; else delete process.env.BANKXP_B;
  const { Game } = await loadGame({ seed, mode: 'bankxp-pilot', fullTelemetry: false });
  const rec = { craftCrossings: 0, craftSheets: 0, deepReservesOffered: 0, craftOffers: [] };
  const origTele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try { if (type === 'track_level' && data && data.who === 'player' && data.track === 'craft') rec.craftCrossings++; } catch (e) {}
    return origTele(type, data);
  };
  const origChoose = Game.chooseAbility.bind(Game);
  Game.chooseAbility = function (id) {
    try {
      const ch = ((Game.state.scholar || {}).abilityChoices || []);
      const ids = ch.map(c => c.id);
      const isCraft = ch.length && String(ch[0].src || '').indexOf('level_up:craft') === 0;
      if (isCraft) {
        rec.craftSheets++;
        rec.craftOffers.push(ids.join('|'));
        if (ids.indexOf('deep_reserves') >= 0) rec.deepReservesOffered = 1;
      }
    } catch (e) {}
    return origChoose(id);
  };
  await setupGame(Game);
  const base = POLICIES[pid];
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = wallSnap(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (s.tableEntered) hist.everEntered = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 });
  const end = wallSnap(Game);
  const national = Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0;
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  // craft-kit first-11 held by the final scholar (deep_reserves = index 11)
  let first11Held = 0;
  try {
    const kit = ((Game.trackData && Game.trackData().kits) || {}).craft || [];
    const first11 = new Set(kit.slice(0, 11));
    const owned = new Set(((Game.state.scholar || {}).abilities || []).map(a => a.id || a));
    for (const id of owned) if (first11.has(id)) first11Held++;
  } catch (e) {}
  const craftTrack = ((Game.state.scholar || {}).tracks || {}).craft || {};
  const row = {
    side: armed ? 'armed' : 'control', policy: pid, seed,
    days: result.days, endReason: result.endReason,
    won: end.won ? 1 : 0, waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc, maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national, table: (hist.everTable || end.tableWaiting) ? 1 : 0, entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    vests: end.vests, deaths,
    crossed: rec.craftCrossings > 0 ? 1 : 0, craftCrossings: rec.craftCrossings,
    craftSheets: rec.craftSheets, deepReservesOffered: rec.deepReservesOffered,
    craftOffers: rec.craftOffers.slice(0, 8),
    craftLevel: craftTrack.level || 0, craftXP: craftTrack.xp || 0, first11Held,
  };
  const fpath = path.join(OUTDIR, `${row.side}-${pid}-${seed}.json`);
  fs.writeFileSync(fpath, JSON.stringify(row, null, 1));
  return row;
}

const SKIP_EXISTING = process.env.PILOT_RESUME === '1';

(async () => {
  const rows = [];
  for (const armed of [false, true]) {
    for (const pid of Object.keys(POLICIES)) {
      for (const seed of SEEDS) {
        if (SKIP_EXISTING) {
          const side = armed ? 'armed' : 'control';
          const f = path.join(OUTDIR, `${side}-${pid}-${seed}.json`);
          if (fs.existsSync(f)) {
            const r = JSON.parse(fs.readFileSync(f, 'utf8'));
            rows.push(r);
            console.log(`  [${r.side} ${pid} seed ${seed}] RESUMED days=${r.days} crossed=${r.crossed} sheets=${r.craftSheets} dr=${r.deepReservesOffered}`);
            continue;
          }
        }
        const r = await oneRun(pid, seed, armed);
        rows.push(r);
        console.log(`  [${r.side} ${pid} seed ${seed}] days=${r.days} end=${r.endReason} crossed=${r.crossed} sheets=${r.craftSheets} dr=${r.deepReservesOffered} wave=${r.waveReach} nat=${r.national} table=${r.table} won=${r.won}`);
      }
    }
  }
  const agg = (rs) => {
    const n = rs.length;
    const starv = rs.reduce((t, r) => t + Object.entries(r.deaths).reduce((u, [k, v]) => u + (/starv/i.test(k) ? v : 0), 0), 0);
    return {
      n,
      crossed: rs.reduce((t, r) => t + r.crossed, 0),
      craftSheets: rs.reduce((t, r) => t + r.craftSheets, 0),
      deepReservesOffered: rs.reduce((t, r) => t + r.deepReservesOffered, 0),
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      entered: rs.reduce((t, r) => t + r.entered, 0),
      won: rs.reduce((t, r) => t + r.won, 0),
      wave45: rs.filter(r => r.waveReach >= 4).length,
      maxWave: Math.max.apply(null, rs.map(r => r.waveReach)),
      medianDays: rs.map(r => r.days).sort((a, b) => a - b)[Math.floor(n / 2)],
      starvDeaths: starv,
    };
  };
  const summary = {
    generated: new Date().toISOString(), seeds: SEEDS, days: DAYS,
    env: { FEASTSCALE_R13: process.env.FEASTSCALE_R13, SEATDRIVE: process.env.SEATDRIVE },
    control: agg(rows.filter(r => r.side === 'control')),
    armed: agg(rows.filter(r => r.side === 'armed')),
    controlByPolicy: { leadfeast: agg(rows.filter(r => r.side === 'control' && r.policy === 'leadfeast')), belongfeast: agg(rows.filter(r => r.side === 'control' && r.policy === 'belongfeast')) },
    armedByPolicy: { leadfeast: agg(rows.filter(r => r.side === 'armed' && r.policy === 'leadfeast')), belongfeast: agg(rows.filter(r => r.side === 'armed' && r.policy === 'belongfeast')) },
  };
  fs.writeFileSync(path.join(OUTDIR, 'bankxp-pilot-summary.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
})().catch(e => { console.error('PILOT FAIL:', e); process.exit(1); });
