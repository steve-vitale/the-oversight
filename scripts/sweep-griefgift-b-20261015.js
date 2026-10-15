#!/usr/bin/env node
// scripts/sweep-griefgift-b-20261015.js — before/after sweep for sim-griefgift-b
// (flesh-out loop B, food-economy axis).
//
// CONTEXT: the GRIEFGRAIN aid credit (hierarchy.js answerRenegotiation 'gift'
// credits the subordinate's pantryKcal at the actual paid amount) LANDED on
// 2026-10-14 (loop A r33, commit dbb71251, GO on post-gift young-link
// seasoning 32 vs 29). This run re-measures the SAME landed credit against
// the kill-notes' OTHER named-next primary, never measured until now:
// TRIBUTE ARREARS on gift-receiving bonds. Mechanism: the credit lands real
// kcal in the subordinate's pantry; tribute is debited from THEIR pantry
// (their_fields_pay canon), so gifted bonds should accrue less arrears.
//
// Armed side = this worktree (credit in-tree). Control side = a byte-copy of
// this tree at ~/workspace/griefgift-control-tree with ONLY the credit block
// neutralized (GRIEFGRAIN-AID-CREDIT-DISABLED; single diff hunk, verified by
// scripts/test-griefgift-arrears-20261015.js 5/5 GREEN). Both sides run the
// identical policy stack (fifthlink-r26, FOURTHLINK=1 FIFTHLINK=1) on
// identical seeds; the ONLY engine difference is the credit block.
//
// Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE any sims:
// - Question: does the landed grief-grain credit reduce tribute arrears
//   accrued AFTER a gift answer on the receiving bond (identical seeds,
//   180d death-aware, fifthlink-r26 both sides)?
// - PRIMARY: total tribute arrears kcal accrued post-gift across
//   gift-receiving bonds (keyed by subordinate village; pay-downs never
//   subtract). GO: armed <= control x 0.7.
// - GUARDRAILS (harm-specific): starvation deaths <= control+2; national >=
//   control-2/16 (scaled to pilot: >= control-1/8); no new death mode
//   (cause-key present on armed side absent on control side = LOUD, n>=3).
//   Median survival report-only.
// - MEASURABILITY: if gift-receiving bonds < 3 per side across the pilot,
//   the metric is unmeasurable -> KILL (unmeasurable = NO-GO), exit 3.
// - Pilot: 8 seeds/side (11/22/33/44/55/66/77/88, spares 101/202/303/404 if a
//   seed fails the det-gate). Confirm 12-16 only on GO.
// - Horizon 180d death-aware: arrears accrue on the weekly tribute tick; a
//   gift at day ~100-140 needs 5-10 weeks to show divergence.
// Metric binding (§14): a miss is NO-GO, never re-scored mid-run.
//
// Usage:
//   FOURTHLINK=1 FIFTHLINK=1 OUT=~/workspace/griefgift-b-pilot.json \
//   SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//   node scripts/sweep-griefgift-b-20261015.js
'use strict';
process.env.FOURTHLINK = process.env.FOURTHLINK || '1';
process.env.FIFTHLINK = process.env.FIFTHLINK || '1';
const fs = require('fs');
const path = require('path');
const WORKTREE = path.join(__dirname, '..');
const CONTROL_TREE = '/home/hatch/workspace/griefgift-control-tree';

const armedHarness = require(path.join(WORKTREE, 'scripts', 'sim-harness'));
const controlHarness = require(path.join(CONTROL_TREE, 'scripts', 'sim-harness'));
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
function allLinks(Game) {
  try { return (Game.mshipState ? Game.mshipState().links : []) || []; } catch (e) { return []; }
}

async function runSeed(seed, days, side) {
  const harness = side === 'armed' ? armedHarness : controlHarness;
  const { loadGame, setupGame, runDays } = harness;
  const { Game } = await loadGame({ seed, mode: 'griefgift-b-' + side });
  await setupGame(Game);

  // say-capture for sense-testing (silenced in sims otherwise)
  const sayLines = [];
  const origSay = Game.say;
  Game.say = function (msg) {
    // Ring buffer: keep the LAST 2000 lines. A head-fill cap keeps only
    // days 1-5 chatter and misses every gift/arrears beat (day 40+).
    sayLines.push(String(msg));
    if (sayLines.length > 2000) sayLines.shift();
  };

  const giftEvents = []; // {linkId, day, subId, arrearsAtGift, trustAtGift, paid}
  const giftIds = new Set();
  const arrears = {}; // subId -> { giftDay, lastSeen, accrued }
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxStanding: 0 };

  const origAnswer = Game.answerRenegotiation ? Game.answerRenegotiation.bind(Game) : null;
  if (origAnswer) {
    Game.answerRenegotiation = function (linkId, how) {
      const before = findLink(Game, linkId);
      const dayBefore = (Game.state.scholar || {}).day || 0;
      const r = origAnswer(linkId, how);
      if (r === 'gift' && before && !giftIds.has(linkId)) {
        giftIds.add(linkId);
        const subId = before.subordinate;
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
        const arrearsAtGift = after ? (after.arrears || 0) : 0;
        giftEvents.push({ linkId, day: dayBefore, subId, arrearsAtGift,
          trustAtGift: before.trust || 0, paid });
        if (subId && !arrears[subId]) {
          arrears[subId] = { giftDay: dayBefore, lastSeen: arrearsAtGift, accrued: 0 };
        }
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
      // arrears accrual on gift-receiving bonds: positive deltas only,
      // pay-downs (arrears -> 0 on a full week) never subtract.
      const links = allLinks(G);
      for (const subId of Object.keys(arrears)) {
        const rec = arrears[subId];
        if (day < rec.giftDay) continue;
        let cur = 0;
        for (const l of links) {
          if (l && l.subordinate === subId) cur = Math.max(cur, l.arrears || 0);
        }
        if (cur > rec.lastSeen) rec.accrued += (cur - rec.lastSeen);
        rec.lastSeen = cur;
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, wrapped, { days, sampleEvery: 10 });
  Game.say = origSay;
  const end = snap(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const starvDeaths = Object.keys(deaths)
    .filter(k => k === 'starvation')
    .reduce((t, k) => t + deaths[k], 0);
  let hungryDays = 0, exiled = 0;
  try { hungryDays = ((Game.state.village || {}).hungryDays) || 0; } catch (e) {}
  try { exiled = !!((Game.state.scholar || {}).exiled) ? 1 : 0; } catch (e) {}
  const ctx = runCtx || {};
  const bonds = Object.keys(arrears);
  const accruedTotal = bonds.reduce((t, k) => t + arrears[k].accrued, 0);
  const giftSay = sayLines.filter(l => /🕊️|grief met with grain/i.test(l));
  const arrearsSay = sayLines.filter(l => /arrears/i.test(l)).slice(0, 8);
  return {
    seed, days: result.days, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable || end.tableWaiting ? 1 : 0,
    maxStanding: hist.maxStanding,
    deaths, starvDeaths, hungryDays, exiled,
    giftBonds: giftEvents.length,
    giftPaidTotal: giftEvents.reduce((t, g) => t + (g.paid || 0), 0),
    giftEvents,
    arrearsAccruedPostGift: accruedTotal,
    arrearsPerBond: bonds.map(k => ({ sub: k, accrued: arrears[k].accrued, giftDay: arrears[k].giftDay })),
    ctxGift: ctx['renegAnswered_gift'] || 0,
    ctxVisit: ctx['renegAnswered_visit'] || 0,
    giftSay: giftSay.slice(0, 12),
    arrearsSay,
    lever: side,
  };
}

async function main() {
  // SMOKE=1 instrument-honesty gates
  if (fifthlink.id !== 'fifthlink-r26') {
    console.error('SMOKE FAIL: expected policy id fifthlink-r26, got ' + fifthlink.id);
    process.exit(1);
  }
  const armedSrc = fs.readFileSync(path.join(WORKTREE, 'src', 'js', 'hierarchy.js'), 'utf8');
  const controlSrc = fs.readFileSync(path.join(CONTROL_TREE, 'src', 'js', 'hierarchy.js'), 'utf8');
  if (armedSrc.indexOf('if (_gsov && paid > 0)') < 0) {
    console.error('SMOKE FAIL: armed side missing the credit line'); process.exit(1);
  }
  if (controlSrc.indexOf('GRIEFGRAIN-AID-CREDIT-DISABLED') < 0 ||
      controlSrc.indexOf('if (_gsov && paid > 0)') >= 0) {
    console.error('SMOKE FAIL: control side malformed'); process.exit(1);
  }
  console.log('SMOKE pass: policy fifthlink-r26, armed credit present, control neutralized (credit block only).');

  const seeds = String(process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
  const days = Number(process.env.DAYS || 180);
  const outPath = process.env.OUT || null;
  const rows = [];
  for (const seed of seeds) {
    for (const side of ['armed', 'control']) {
      const row = await runSeed(seed, days, side);
      rows.push(row);
      console.log(`  [${side} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} rank=${row.maxRank} gifts=${row.giftBonds} arrearsPostGift=${row.arrearsAccruedPostGift} starv=${row.starvDeaths}`);
    }
  }
  const perSide = (side) => rows.filter(r => r.lever === side);
  const tot = (side, f) => perSide(side).reduce((t, r) => t + f(r), 0);
  const arrearsA = tot('armed', r => r.arrearsAccruedPostGift);
  const arrearsC = tot('control', r => r.arrearsAccruedPostGift);
  const bondsA = tot('armed', r => r.giftBonds);
  const bondsC = tot('control', r => r.giftBonds);
  console.log(`\nPRIMARY: arrears accrued post-gift — armed=${arrearsA} control=${arrearsC} ` +
    `(gift bonds armed=${bondsA} control=${bondsC}) GO needs armed <= ${(arrearsC * 0.7).toFixed(0)}`);
  if (bondsA < 3 || bondsC < 3) {
    console.error('UNMEASURABLE: gift-receiving bonds < 3 on a side — metric cannot bind. KILL.');
    process.exit(3);
  }
  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify(
      { policy: 'fifthlink-r26', days, seeds, rows }, null, 2));
    console.log('wrote ' + outPath);
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
