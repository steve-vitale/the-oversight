#!/usr/bin/env node
// scripts/census-foodvoice2-b.js — voice-beat census for sim-foodvoice2-b.
//
// Re-runs the sim-foragelead-b corpus pairs (seeds 7621-7628 + 7631-7638 x
// {leadfeast,belongfeast}, FEASTSCALE_R13=1, SEATDRIVE=0, 180d death-aware)
// and captures the ambient food-voice beats (departure lines + pantry-check
// beats) with the SAME say-wrapper beat regex as scripts/instrument-foragelead-b.js
// (/forag|🌿|pantry breathes|armful of something edible/i), plus wall
// metrics for the guardrail. Output goes to $OUT (default /tmp — NEVER the
// evidence dir; the corpus there is landed pre-fix evidence).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/census-foodvoice2-b.js          # armed (gate on)
//   FEASTSCALE_R13=1 SEATDRIVE=0 FOODVOICE2_GATE=0 node scripts/census-foodvoice2-b.js  # control
//   SEEDS="7621,7622" POLICIES="leadfeast" DAYS=180 OUT=/tmp/x node scripts/census-foodvoice2-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [7621, 7622, 7623, 7624, 7625, 7626, 7627, 7628, 7631, 7632, 7633, 7634, 7635, 7636, 7637, 7638]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || '/tmp/foodvoice2-census';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const BEAT_RE = /forag|🌿|pantry breathes|armful of something edible/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'foodvoice2-census', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const beats = [];
  const deaths = [];
  const oSay = Game.say ? Game.say.bind(Game) : null;
  if (oSay) {
    Game.say = function (m) {
      try { const s = strip(m); if (BEAT_RE.test(s)) { beats.push({ day: gday(Game), text: s }); if (beats.length > 12000) beats.splice(0, 2400); } } catch (e) {}
      return oSay.apply(this, arguments);
    };
  }
  const oTele = Game.tele ? Game.tele.bind(Game) : null;
  if (oTele) {
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try { if (type === 'death') deaths.push({ day: gday(Game), who: data && data.who, cause: data && data.cause == null ? null : String(data && data.cause), player: !!(data && data.player) }); } catch (e) {}
      return r;
    };
  }
  const hist = { maxRank: 0, table: false, exiled: false, starvedDays: 0, maxArc: 1, maxWave: 1, wins: false };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting || pg.tableDone) hist.table = true;
      if (G.won) hist.wins = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = (((G.state || {}).scholar || {}).prog || {}).arc || 1; if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
    } catch (e) {}
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const deathCauses = {};
  for (const d of deaths) { const c = d.cause || 'unknown'; deathCauses[c] = (deathCauses[c] || 0) + 1; }
  return {
    seed, policy: policyId,
    days: result && result.days, endReason: result && result.endReason,
    beats, beatsOverflow: beats.length >= 9600,
    deaths: deaths.length, deathCauses,
    starvationDeaths: deaths.filter(d => /starv/i.test(String(d.cause || ''))).length,
    wall: {
      national: hist.maxRank >= 2 ? 1 : 0, table: hist.table ? 1 : 0,
      wins: hist.wins ? 1 : 0, maxRank: hist.maxRank, maxArc: hist.maxArc,
      maxWave: hist.maxWave, exiled: hist.exiled ? 1 : 0,
      starvedDays: hist.starvedDays,
    },
  };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let done = 0;
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, pid);
      fs.writeFileSync(path.join(OUT, `${pid}-${seed}.json`), JSON.stringify(r));
      done++;
      console.log(`[${done}/${SEEDS.length * POLICIES.length}] ${pid}-${seed} days=${r.days} end=${r.endReason} beats=${r.beats.length} national=${r.wall.national} table=${r.wall.table ? 1 : 0} wins=${r.wall.wins ? 1 : 0}`);
    }
  }
  console.log('wrote', OUT);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
