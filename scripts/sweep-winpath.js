#!/usr/bin/env node
// sweep-winpath.js — WIN-PATH funnel measurement (longsim win-path lever, 2026-10-11).
// The full chain: arcs -> national -> table -> win. Per run measures:
//   - days survived, endReason
//   - max arc reached + first day per arc (1..4)
//   - waves UNLOCKED 2..5 + first day; waves FACED distinct per wave 1..5
//   - regional/national reach days (first day each rank seen)
//   - LESSER seat (tableSeat): first day reached + near-miss detail at end
//   - FULL seat (deedGateReady().ok): first day reached
//   - tableWaiting/table fired, won + winDay
//   - crises kinds, counters discovered, counter-kills (mastery), deaths by
//     cause (shares), mantle passes (succession), contested shows seen
// Policies: competent (scripts/policies/competent.js) + winseek (deed-seeking).
// Shard-friendly: SEEDS="1-8" POLICIES="competent" DAYS=200 OUT=...json
//
// Usage: SEEDS="1,2,3" POLICIES="competent,winseek" DAYS=200 OUT=/tmp/wp.json \
//          node scripts/sweep-winpath.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { winseek } = require('./policies/winseek');

const POLICIES = { competent, winseek };

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

function seatDetail(Game) {
  // tableSeat() -> {seat:'full'|'lesser'|'none', detail}
  try {
    if (typeof Game.tableSeat === 'function') return Game.tableSeat();
  } catch (e) {}
  return { seat: 'none', detail: {} };
}

function fullGate(Game) {
  try {
    const g = Game.deedGateReady ? Game.deedGateReady() : null;
    return g && g.ok ? true : false;
  } catch (e) { return false; }
}

function counterStats(Game) {
  let discovered = 0, counterKills = 0;
  try {
    const mc = (Game.state && Game.state.monsterCounters) || {};
    discovered = Object.keys(mc).filter(k => mc[k] === true).length;
  } catch (e) {}
  try {
    // counter-kills: ledger perType entries where points came from the 2-pt bonus
    // is not directly visible; approximate via state.waveKills vs ledger points? —
    // instead count perType entries with odd... skip: report discovered only,
    // plus villageSlain distinct types as kill breadth.
    const vs = (Game.state && Game.state.villageSlain) || {};
    counterKills = Object.keys(vs).length; // distinct types slain (breadth)
  } catch (e) {}
  return { discovered, typesSlain: counterKills };
}

function wrapPolicy(policy) {
  const p = Object.assign({}, policy);
  const first = { arc: {}, wave: {}, rank: {}, lesserDay: 0, fullDay: 0, tableDay: 0 };
  const origDaily = policy.daily;
  p.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      const day = ((G.state || {}).scholar || {}).day || 0;
      if (day % 5 !== 0 && day !== 1) return; // sample cheaply
      const arc = (G.progState ? (G.progState().arc || 1) : 1);
      for (let a = 2; a <= 4; a++) if (arc >= a && !(a in first.arc)) first.arc[a] = day;
      const uw = (G.unlockedWave ? G.unlockedWave() : 1) || 1;
      for (let w = 2; w <= 5; w++) if (uw >= w && !(w in first.wave)) first.wave[w] = day;
      const rank = (G.scaleRank ? G.scaleRank() : 'village');
      if (['regional', 'national', 'global'].includes(rank) && !first.rank[rank]) first.rank[rank] = day;
      const seat = seatDetail(G).seat;
      if ((seat === 'lesser' || seat === 'full') && !first.lesserDay) first.lesserDay = day;
      if (seat === 'full' && !first.fullDay) first.fullDay = day;
      const pg = G.progState ? G.progState() : null;
      if (pg && (pg.tableWaiting || pg.tableDone) && !first.tableDay) first.tableDay = day;
    } catch (e) {}
  };
  return { p, first };
}

// feast-surge chain instrumentation (longsim winpath r3 2026-10-12): count
// arming -> grant -> combat-use transitions per run. Wraps Game methods after
// loadGame/setupGame; no game-code change.
function instrumentChain(Game, ctx) {
  const ch = { armed: 0, granted: 0, used: 0, prevArmed: false };
  try {
    if (typeof Game.channelSentiment === 'function') {
      const orig = Game.channelSentiment.bind(Game);
      Game.channelSentiment = function (idx) {
        const r = orig(idx);
        try {
          const nowArmed = !!(((Game.state || {}).scholar || {}).prog || {}).feastSurge;
          if (nowArmed && !ch.prevArmed) ch.armed++;
          ch.prevArmed = nowArmed;
        } catch (e) {}
        return r;
      };
    }
  } catch (e) {}
  try {
    if (typeof Game.grantFeastBuff === 'function') {
      const orig = Game.grantFeastBuff.bind(Game);
      Game.grantFeastBuff = function (feast) {
        const r = orig(feast);
        if (r && r.granted) ch.granted++;
        return r;
      };
    }
  } catch (e) {}
  try {
    if (typeof Game.noteFeastedCombatUse === 'function') {
      const orig = Game.noteFeastedCombatUse.bind(Game);
      Game.noteFeastedCombatUse = function () {
        let mark = false;
        try {
          const b = ((Game.state || {}).scholar || {}).feastBuff;
          mark = !!(b && !b.used && Game.inCombat && Game.inCombat());
        } catch (e) {}
        const r = orig();
        if (mark) ch.used++;
        return r;
      };
    }
  } catch (e) {}
  ctx._chain = ch;
  return ch;
}

(async () => {
  const seeds = parseSeeds(process.env.SEEDS || '1-8');
  const policyIds = String(process.env.POLICIES || 'competent,winseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '200', 10);
  const OUT = process.env.OUT || path.join(ROOT, 'scripts', 'sweep-winpath-results.json');
  const rows = [];
  const t0 = Date.now();
  let n = 0;
  for (const pid of policyIds) {
    const base = POLICIES[pid];
    if (!base) { console.error('unknown policy: ' + pid); process.exit(1); }
    for (const seed of seeds) {
      const { Game, loadFails } = await loadGame({ seed, mode: pid });
      if (loadFails && loadFails.length) console.log(`seed ${seed}: LOAD FAILS: ${loadFails.join('; ')}`);
      await setupGame(Game);
      const { p, first } = wrapPolicy(base);
      const chain = instrumentChain(Game, p);
      const result = await runDays(Game, p, { days });
      const day = ((Game.state || {}).scholar || {}).day || 0;
      const pg = (Game.progState ? Game.progState() : {}) || {};
      const seat = seatDetail(Game);
      const faced = facedByWave(Game);
      const deaths = ((result.samples && result.samples.deaths) || []).map(d => d.cause || d.kind || '?');
      const deathShare = {};
      for (const d of deaths) deathShare[d] = (deathShare[d] || 0) + 1;
      let mantle = 0;
      try { mantle = ((Game.state || {}).mantlePasses | 0) || (((Game.state || {}).mantleLog || []).length) || 0; } catch (e) {}
      let arc = 1;
      try { arc = pg.arc || 1; } catch (e) {}
      const cs = counterStats(Game);
      let stage = 0, breadth = 0, integ = 0;
      try { stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
      try { breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
      try { integ = ((Game.state || {}).scholar || {}).integration || 0; } catch (e) {}
      const row = {
        seed, policy: pid, days: day, endReason: result.endReason, ms: result.ms,
        maxArc: arc, arcDay: first.arc,
        waveDay: first.wave, maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1),
        faced, rankDay: first.rank,
        lesserDay: first.lesserDay, fullDay: first.fullDay, tableDay: first.tableDay,
        seatEnd: seat.seat, lesserDetailEnd: seat.detail,
        tableFired: !!(pg.tableWaiting || pg.tableDone), won: !!Game.won, winDay: Game.won ? day : null,
        crises: Object.keys(pg.crises || {}), crisesN: Object.keys(pg.crises || {}).length,
        countersDiscovered: cs.discovered, typesSlain: cs.typesSlain,
        deathN: deaths.length, deathShare, mantlePasses: mantle,
        stage, breadth, integ,
        sentiment: !!pg.sentimentTaught,
        feastUsed: !!((((Game.state || {}).scholar || {}).prog || {}).feastSurgeUsed),
        chainArmed: chain.armed, chainGranted: chain.granted, chainUsed: chain.used,
        contestsSurvived: (Game.deedState ? (Game.deedState().contestsSurvived | 0) : 0),
      };
      rows.push(row);
      n++;
      console.log(`[${n} ${((Date.now() - t0) / 1000).toFixed(0)}s] ${pid} seed=${seed} d${row.days} ${row.endReason} arc${row.maxArc} uw${row.maxWave} faced[w1:${faced[1]} w2:${faced[2]} w3:${faced[3]} w4:${faced[4]} w5:${faced[5]}] rank:${JSON.stringify(first.rank)} lesser:${row.lesserDay || '-'} full:${row.fullDay || '-'} table:${row.tableFired} won:${row.won} cr:${row.crisesN} deaths:${row.deathN}`);
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
  // Funnel summary
  const F = (f) => rows.filter(f).length;
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const med = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
  console.log('== FUNNEL (n=' + rows.length + ') ==');
  console.log('arc>=2 ' + F(r => r.maxArc >= 2) + ' | arc>=3 ' + F(r => r.maxArc >= 3) + ' | arc>=4 ' + F(r => r.maxArc >= 4));
  console.log('wave>=3 ' + F(r => r.maxWave >= 3) + ' | wave>=4 ' + F(r => r.maxWave >= 4) + ' | wave>=5 ' + F(r => r.maxWave >= 5));
  console.log('regional ' + F(r => r.rankDay.regional) + ' | national ' + F(r => r.rankDay.national) + ' | global ' + F(r => r.rankDay.global));
  console.log('lesser seat ' + F(r => r.lesserDay > 0) + ' | full seat ' + F(r => r.fullDay > 0) + ' | table fired ' + F(r => r.tableFired) + ' | won ' + F(r => r.won));
  const chA = rows.reduce((a, r) => a + (r.chainArmed || 0), 0);
  const chG = rows.reduce((a, r) => a + (r.chainGranted || 0), 0);
  const chU = rows.reduce((a, r) => a + (r.chainUsed || 0), 0);
  console.log('feast chain: armed ' + chA + ' -> granted ' + chG + ' -> used ' + chU + ' (feastSurgeUsed flags: ' + F(r => r.feastUsed) + ')');
  console.log('medianDays ' + med + ' maxDays ' + daysArr[daysArr.length - 1]);
  const dc = {};
  for (const r of rows) for (const k of Object.keys(r.deathShare)) dc[k] = (dc[k] || 0) + r.deathShare[k];
  console.log('death causes: ' + JSON.stringify(dc));
  console.log('wrote ' + OUT);
})();
