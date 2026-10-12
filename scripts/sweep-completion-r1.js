#!/usr/bin/env node
// sweep-completion-r1.js — COMPLETION-ATTEMPT sims (sim-completion r1, 2026-10-12).
// Steve: "do more testing sims that try to finish the game."
// Sims that genuinely try to FINISH: winseek policy + pointer-heeding
// (hears the new scale discoverability beats 4+5 and acts on them).
// Measures the full funnel per run: arcs, waves unlocked/faced, scale ranks,
// lesser/full seats, table, win — plus pointer fire/heed and where each run dies.
//
// Usage: SEEDS="1-8" DAYS=200 OUT=/tmp/comp.json node scripts/sweep-completion-r1.js
// Shard-friendly like sweep-winpath.js.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek, fedseek } = require('./policies/winseek');
const POLICY_IDS = { winseek, fedseek };

function parseSeeds(s) {
  const out = [];
  for (const part of String(s || '1-8').split(',')) {
    const m = part.trim().match(/^(\d+)-(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else if (part.trim() !== '') out.push(+part.trim());
  }
  return out;
}

function facedByWave(Game) {
  const out = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  try {
    const faced = (Game.deedState ? Game.deedState().wavesFaced : {}) || {};
    for (const mid of Object.keys(faced)) { const w = faced[mid] | 0; if (out[w] != null) out[w]++; }
  } catch (e) {}
  return out;
}

function wrapPolicy(policy) {
  const p = Object.assign({}, policy);
  const first = { arc: {}, wave: {}, rank: {}, lesserDay: 0, fullDay: 0, tableDay: 0 };
  let savedCtx = null;
  const origDaily = policy.daily;
  p.daily = (G, ctx) => {
    savedCtx = ctx;
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      const day = ((G.state || {}).scholar || {}).day || 0;
      if (day % 5 !== 0 && day !== 1) return;
      const arc = (G.progState ? (G.progState().arc || 1) : 1);
      for (let a = 2; a <= 4; a++) if (arc >= a && !(a in first.arc)) first.arc[a] = day;
      const uw = (G.unlockedWave ? G.unlockedWave() : 1) || 1;
      for (let w = 2; w <= 5; w++) if (uw >= w && !(w in first.wave)) first.wave[w] = day;
      const rank = (G.scaleRank ? G.scaleRank() : 'village');
      if (['regional', 'national', 'global'].includes(rank) && !first.rank[rank]) first.rank[rank] = day;
      let seat = 'none';
      try { if (typeof G.tableSeat === 'function') seat = G.tableSeat().seat || 'none'; } catch (e) {}
      if ((seat === 'lesser' || seat === 'full') && !first.lesserDay) first.lesserDay = day;
      if (seat === 'full' && !first.fullDay) first.fullDay = day;
      const pg = G.progState ? G.progState() : null;
      if (pg && (pg.tableWaiting || pg.tableDone) && !first.tableDay) first.tableDay = day;
    } catch (e) {}
  };
  return { p, first, getCtx: () => savedCtx };
}

(async () => {
  const seeds = parseSeeds(process.env.SEEDS || '1-8');
  const policyId = String(process.env.POLICY || 'winseek').trim();
  const policy = POLICY_IDS[policyId];
  if (!policy) { console.error('unknown policy: ' + policyId); process.exit(1); }
  const days = parseInt(process.env.DAYS || '200', 10);
  const OUT = process.env.OUT || path.join(ROOT, 'sweep-out', 'completion-r1.json');
  const rows = [];
  const t0 = Date.now();
  let n = 0;
  for (const seed of seeds) {
    const { Game, loadFails } = await loadGame({ seed, mode: policyId });
    if (loadFails && loadFails.length) console.log(`seed ${seed}: LOAD FAILS: ${loadFails.join('; ')}`);
    await setupGame(Game);
    const wrapped = wrapPolicy(policy);
    const p = wrapped.p, first = wrapped.first;
    let result;
    try {
      result = await runDays(Game, p, { days });
    } catch (e) {
      console.log(`seed ${seed}: HARNESS ERROR: ${e.message}`);
      continue;
    }
    const pc = wrapped.getCtx() || {};
    const day = ((Game.state || {}).scholar || {}).day || 0;
    const pg = (Game.progState ? Game.progState() : {}) || {};
    let seat = 'none', seatDetail = {};
    try { if (typeof Game.tableSeat === 'function') { const s = Game.tableSeat(); seat = s.seat || 'none'; seatDetail = s.detail || {}; } } catch (e) {}
    const faced = facedByWave(Game);
    const deaths = ((result.samples && result.samples.deaths) || []).map(d => d.cause || d.kind || '?');
    const deathShare = {};
    for (const d of deaths) deathShare[d] = (deathShare[d] || 0) + 1;
    let mantle = 0;
    try { mantle = ((Game.state || {}).mantlePasses | 0) || (((Game.state || {}).mantleLog || []).length) || 0; } catch (e) {}
    let arc = 1;
    try { arc = pg.arc || 1; } catch (e) {}
    let rank = 'village';
    try { rank = Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) {}
    const row = {
      seed, policy: policyId, days: day, endReason: result.endReason,
      maxArc: arc, arcDay: first.arc,
      waveDay: first.wave, maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1),
      faced, rankEnd: rank, rankDay: first.rank,
      lesserDay: first.lesserDay, fullDay: first.fullDay, tableDay: first.tableDay,
      seatEnd: seat, tableFired: !!(pg.tableWaiting || pg.tableDone),
      won: !!Game.won, winDay: Game.won ? day : null,
      // pointer instrumentation (from the policy ctx captured by wrapPolicy)
      ptrW4Day: (pc.pointerHeard && pc.pointerHeard.w4) || null,
      ptrW5Day: (pc.pointerHeard && pc.pointerHeard.w5) || null,
      pointerCourtDays: pc.pointerCourtDays || 0,
      pointerClimb: pc.pointerClimb || 0,
      primacyBids: pc.primacyBids || 0,
      proposed: pc.proposed || 0, proposedPeer: pc.proposedPeer || 0,
      tributePaid: pc.tributePaid || 0,
      nationalAnswered: pc.nationalAnswered || 0, globalAnswered: pc.globalAnswered || 0,
      crisesN: Object.keys(pg.crises || {}).length,
      deathN: deaths.length, deathShare, mantlePasses: mantle,
      contestsSurvived: (Game.deedState ? (Game.deedState().contestsSurvived | 0) : 0),
      feastUsed: !!((((Game.state || {}).scholar || {}).prog || {}).feastSurgeUsed),
    };
    // pointer + diplomacy counters live on the ctx the policy used — runDays
    // passes its own ctx; recover via the wrapped policy's captured ctx.
    rows.push(row);
    n++;
    console.log(`[${n} ${((Date.now() - t0) / 1000).toFixed(0)}s] seed=${seed} d${row.days} ${row.endReason} arc${row.maxArc} uw${row.maxWave} rank:${row.rankEnd} lesser:${row.lesserDay || '-'} won:${row.won} ptr4:${row.ptrW4Day || '-'} ptr5:${row.ptrW5Day || '-'} prop:${row.proposed} deaths:${row.deathN}`);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
  const F = (f) => rows.filter(f).length;
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const med = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
  console.log('== FUNNEL (n=' + rows.length + ') ==');
  console.log('arc>=2 ' + F(r => r.maxArc >= 2) + ' | arc>=3 ' + F(r => r.maxArc >= 3) + ' | arc>=4 ' + F(r => r.maxArc >= 4));
  console.log('wave>=3 ' + F(r => r.maxWave >= 3) + ' | wave>=4 ' + F(r => r.maxWave >= 4) + ' | wave>=5 ' + F(r => r.maxWave >= 5));
  console.log('regional ' + F(r => r.rankDay.regional) + ' | national ' + F(r => r.rankDay.national) + ' | global ' + F(r => r.rankDay.global));
  console.log('lesser ' + F(r => r.lesserDay > 0) + ' | full ' + F(r => r.fullDay > 0) + ' | table ' + F(r => r.tableFired) + ' | won ' + F(r => r.won));
  console.log('pointer W4 fired ' + F(r => r.ptrW4Day > 0) + ' | pointer W5 fired ' + F(r => r.ptrW5Day > 0));
  console.log('proposals ' + rows.reduce((a, r) => a + r.proposed, 0) + ' | peer proposals ' + rows.reduce((a, r) => a + r.proposedPeer, 0) + ' | tribute paid ' + rows.reduce((a, r) => a + r.tributePaid, 0) + ' | primacy bids ' + rows.reduce((a, r) => a + r.primacyBids, 0) + ' | national answered ' + rows.reduce((a, r) => a + r.nationalAnswered, 0));
  console.log('medianDays ' + med + ' maxDays ' + (daysArr[daysArr.length - 1] || 0));
  console.log('wrote ' + OUT);
})();
