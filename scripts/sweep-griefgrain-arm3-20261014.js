#!/usr/bin/env node
// scripts/sweep-griefgrain-arm3-20261014.js — before/after sweep for the
// RE-ARMED GRIEF-GRAIN arm (flesh-out loop A r33).
//
// Mechanism-matched metric: the renegotiation 'gift' verb answers a staged
// succession beat on a YOUNG link (engine-gated: link <21d old at the
// succession death). This sweep tracks every 'gift' answer per LINK and
// whether that link subsequently seasons (age>=30d && trust>=40, SCALE.md).
// Primary: post-gift seasoned count (armed vs control, identical seeds).
//
// Policy stack (both sides): FOURTHLINK=1 + FIFTHLINK=1 (fifthlink-r26,
// named export with SMOKE honesty gate). Code-verified substrate: only
// fifthlink-r26 and winseek call answerRenegotiation; leadcourt/belongseek
// never do, so comparisons on those stacks would be vacuous.
//
// Standard table per seed: won, days, wave reach 1-5, arc, national reach,
// table, death-cause shares + the gift/seasoning block + guardrails
// (median survival, national, death-cause-family set, exiled).
//
// Usage:
//   FOURTHLINK=1 FIFTHLINK=1 OUT=~/workspace/griefgrain-arm3-armed8.json \
//   SEEDS="11,22,33,44,55,66,77,88" DAYS=150 \
//   node scripts/sweep-griefgrain-arm3-20261014.js
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

function findLink(Game, id) {
  try {
    const links = (Game.mshipState ? Game.mshipState().links : []) || [];
    for (const l of links) if (l && l.id === id) return l;
  } catch (e) {}
  return null;
}

async function main() {
  if (fifthlink.id !== 'fifthlink-r26') {
    console.error('SMOKE FAIL: expected policy id fifthlink-r26, got ' + fifthlink.id);
    process.exit(1);
  }
  const seeds = String(process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
  const days = Number(process.env.DAYS || 150);
  const outPath = process.env.OUT || null;
  const leverPresent = fs.readFileSync(__dirname + '/../src/js/hierarchy.js', 'utf8').indexOf('GRIEFGRAIN-AID-CREDIT') >= 0;
  console.log(`sweep-griefgrain-arm3: days=${days} lever=${leverPresent ? 'ARMED' : 'CONTROL'} seeds=[${seeds.join(',')}]`);
  const rows = [];
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'griefgrain-arm3' });
    await setupGame(Game);
    const giftEvents = []; // {linkId, day, ageAtGift, trustAtGift, paid}
    const giftIds = new Set();
    const seasonedDay = {}; // linkId -> first day (age>=30 && trust>=40)
    const hist = { maxRank: 0, maxArc: 1, everTable: false, maxStanding: 0 };

    // Wrap the engine verb so EVERY gift answer is logged per-link,
    // whoever answers the beat (policy daily runs through this too).
    const origAnswer = Game.answerRenegotiation ? Game.answerRenegotiation.bind(Game) : null;
    if (origAnswer) {
      Game.answerRenegotiation = function (linkId, how) {
        const before = findLink(Game, linkId);
        const dayBefore = (Game.state.scholar || {}).day || 0;
        const trustBefore = before ? (before.trust || 0) : null;
        const ageBefore = before ? dayBefore - (before.day || 0) : null;
        const r = origAnswer(linkId, how);
        if (r === 'gift' && !giftIds.has(linkId)) {
          giftIds.add(linkId);
          const after = findLink(Game, linkId);
          let paid = null;
          try {
            const h = (after && after.history ? after.history : []);
            for (let i = h.length - 1; i >= 0; i--) {
              const n = h[i];
              if (n && n.kind === 'renegotiation' && /grief with grain/.test(n.note || '')) {
                const m = String(n.note).match(/([\d,]+)\s*kcal/);
                if (m) paid = Number(m[1].replace(/,/g, ''));
                break;
              }
            }
          } catch (e) {}
          giftEvents.push({ linkId, day: dayBefore, ageAtGift: ageBefore, trustAtGift: trustBefore, paid });
        }
        return r;
      };
    }

    const base = fifthlink;
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
        const day = (G.state.scholar || {}).day || 0;
        // post-gift seasoning: first day the gifted link hits (age>=30 && trust>=40)
        for (const ge of giftEvents) {
          if (seasonedDay[ge.linkId] != null) continue;
          const l = findLink(G, ge.linkId);
          if (!l || l.status !== 'active') continue;
          const age = day - (l.day || 0);
          if (age >= 30 && (l.trust || 0) >= 40) seasonedDay[ge.linkId] = day;
        }
      } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
    const result = await runDays(Game, wrapped, { days, sampleEvery: 10 });
    const end = snap(Game);
    // final check: gifted links that seasoned at/after run end
    const endDay = (Game.state.scholar || {}).day || result.days;
    for (const ge of giftEvents) {
      if (seasonedDay[ge.linkId] != null) continue;
      const l = findLink(Game, ge.linkId);
      if (l && l.status === 'active' && endDay - (l.day || 0) >= 30 && (l.trust || 0) >= 40) {
        seasonedDay[ge.linkId] = endDay;
      }
    }
    const seasonedCount = giftEvents.filter(ge => seasonedDay[ge.linkId] != null).length;
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
      gifts: giftEvents.length,
      giftPaidTotal: giftEvents.reduce((t, g) => t + (g.paid || 0), 0),
      giftEvents,
      seasonedPostGift: seasonedCount,
      seasonedDays: Object.assign({}, seasonedDay),
      ctxGift: ctx['renegAnswered_gift'] || 0,
      ctxVisit: ctx['renegAnswered_visit'] || 0,
      lever: leverPresent ? 'armed' : 'control',
    };
    rows.push(row);
    console.log(`  [seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} rank=${row.maxRank} gifts=${row.gifts} seasonedPostGift=${row.seasonedPostGift} ctxGift=${row.ctxGift}`);
  }
  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify({ policy: 'fifthlink-r26', days, lever: leverPresent ? 'armed' : 'control', rows }, null, 2));
    console.log('wrote ' + outPath);
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
