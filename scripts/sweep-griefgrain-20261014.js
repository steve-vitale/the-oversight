#!/usr/bin/env node
// scripts/sweep-griefgrain-20261014.js — before/after sweep for the GRIEF-GRAIN arm.
//
// Policy stack (both sides): FOURTHLINK=1 + FIFTHLINK=1 (fifthlink-r26,
// named export with SMOKE honesty gate). This is the stack where
// answerRenegotiation 'gift' fires; leadcourt/belongseek never answer
// renegotiation, so comparisons on those stacks would be vacuous (documented
// in evidence/2026-10-14/sim-griefgrain.md).
//
// Standard table per seed: won, days, wave reach 1-5, arc, national reach,
// table, death-cause shares + the sixth-link conversion block (formed day,
// seasoned day, t30 trust, tend weeks) + renegotiation gift-answer counts +
// guardrails (starvation deaths, hungryDays, exiled).
//
// Usage:
//   FOURTHLINK=1 FIFTHLINK=1 OUT=~/workspace/griefgrain-baseline.json \
//   SEEDS="11,22,33,44,55,66,77,88" node scripts/sweep-griefgrain-20261014.js
'use strict';
process.env.FOURTHLINK = process.env.FOURTHLINK || '1';
process.env.FIFTHLINK = process.env.FIFTHLINK || '1';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fifthlink } = require('./policies/fifthlink-r26');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', standing: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting;
    out.standing = pg.standing || 0;
  } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

function linkBlock(Game) {
  // The 6th lead link: 6th by formation day among Haven-primary links.
  let sixth = null, formedDay = null, seasonedDay = null, t30 = null, tendWeeks = 0;
  try {
    const links = (Game.mshipState ? Game.mshipState().links : []) || [];
    const lead = links.filter(l => l && l.primary === 'haven' && l.status === 'active' || (l && l.primary === 'haven')).filter(l => l && l.primary === 'haven');
    lead.sort((a, b) => (a.day || 0) - (b.day || 0) || String(a.id).localeCompare(String(b.id)));
    if (lead.length >= 6) {
      sixth = lead[5];
      formedDay = sixth.day;
      const age = (Game.state.scholar || {}).day - sixth.day;
      tendWeeks = ((sixth.history || []).filter(h => h && h.kind === 'tended')).length;
      // t30: trust on the day it hit 30 days of age — approximate from
      // history: trust values in link.history 'tend'/'tick' notes are not
      // structured, so sample now only if age>=30.
      if (age >= 30 && (sixth.trust || 0) >= 40) t30 = sixth.trust;
    }
  } catch (e) {}
  return { sixthId: sixth ? sixth.id : null, formedDay, seasonedDay, t30, tendWeeks,
           leadCount: (() => { try { return ((Game.mshipState().links || []).filter(l => l && l.primary === 'haven')).length; } catch (e) { return 0; } })() };
}

async function main() {
  if (fifthlink.id !== 'fifthlink-r26') {
    console.error('SMOKE FAIL: expected policy id fifthlink-r26, got ' + fifthlink.id);
    process.exit(1);
  }
  const seeds = String(process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
  const days = Number(process.env.DAYS || 180);
  const outPath = process.env.OUT || null;
  const rows = [];
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'griefgrain-sweep' });
    await setupGame(Game);
    const base = fifthlink;
    const hist = { maxRank: 0, maxArc: 1, everTable: false, maxVests: 0, maxStanding: 0 };
    const sixthHist = { seasonedDay: null, sixthId: null, formedDay: null };
    const origDaily = base.daily;
    const wrapped = Object.assign({}, base);
    let runCtx = null;
    wrapped.daily = (G, ctx) => {
      runCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        hist.maxStanding = Math.max(hist.maxStanding, s.standing || 0);
        if (s.tableWaiting) hist.everTable = true;
        // sixth-link seasoning: first day age>=30 && trust>=40
        if (!sixthHist.seasonedDay) {
          const links = (G.mshipState ? G.mshipState().links : []) || [];
          const lead = links.filter(l => l && l.primary === 'haven');
          lead.sort((a, b) => (a.day || 0) - (b.day || 0) || String(a.id).localeCompare(String(b.id)));
          if (lead.length >= 6) {
            const s6 = lead[5];
            const day = (G.state.scholar || {}).day || 0;
            sixthHist.sixthId = s6.id;
            sixthHist.formedDay = s6.day;
            if (day - (s6.day || 0) >= 30 && (s6.trust || 0) >= 40) sixthHist.seasonedDay = day;
          }
        }
      } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
    const result = await runDays(Game, wrapped, { days, sampleEvery: 10 });
    const end = snap(Game);
    const lb = linkBlock(Game);
    if (!lb.seasonedDay) lb.seasonedDay = sixthHist.seasonedDay;
    if (!lb.sixthId) lb.sixthId = sixthHist.sixthId;
    if (lb.formedDay == null) lb.formedDay = sixthHist.formedDay;
    const deaths = {};
    try {
      for (const d of (result.samples.deaths || [])) {
        const k = String(d.cause || d.kind || 'unknown');
        deaths[k] = (deaths[k] || 0) + 1;
      }
    } catch (e) {}
    let hungryDays = 0, exiled = 0;
    try { hungryDays = ((Game.state.village || {}).hungryDays) || 0; } catch (e) {}
    try { exiled = !!((Game.state.scholar || {}).exiled) ? 1 : 0; } catch (e) {}
    const ctx = runCtx || {};
    const row = {
      seed, days: result.days, endReason: result.endReason,
      won: end.won ? 1 : 0,
      waveReach: result.maxWaveUnlocked || 1,
      maxArc: hist.maxArc,
      maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
      national: hist.maxRank >= 2 ? 1 : 0,
      table: hist.everTable || end.tableWaiting ? 1 : 0,
      maxStanding: hist.maxStanding,
      deaths, hungryDays, exiled,
      sixthFormed: lb.formedDay, sixthSeasoned: lb.seasonedDay,
      sixthT30: lb.t30, sixthTendWeeks: lb.tendWeeks,
      leadLinks: lb.leadCount,
      renegGift: ctx['renegAnswered_gift'] || 0,
      renegVisit: ctx['renegAnswered_visit'] || 0,
    };
    rows.push(row);
    console.log(`  [seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} rank=${row.maxRank} 6th=${row.sixthFormed}->${row.sixthSeasoned} gift=${row.renegGift} visit=${row.renegVisit}`);
  }
  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify({ policy: 'fifthlink-r26', days, rows }, null, 2));
    console.log('wrote ' + outPath);
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
