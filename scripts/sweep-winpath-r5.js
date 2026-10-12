#!/usr/bin/env node
// sweep-winpath-r5.js — WIN-PATH funnel r5 (longsim win-path lever, 2026-10-12).
// The full chain: arcs -> national -> table -> win. Per run measures:
//   - days survived, endReason
//   - max arc reached + first day per arc (1..4)
//   - waves UNLOCKED 2..5 + first day; waves FACED distinct per wave 1..5
//   - regional/national/global reach days; vest events; four-realm formation; havenTier
//   - LESSER/FULL seat first days + end detail
//   - tableWaiting/table fired + first day; table path/phase at end; won + first winDay
//   - traps set by player vs villager + catches (by source)
//   - counters discovered, counter-kills, successions (young-link)
//   - deaths by cause (shares), crises
// Policies: competent + winseek + fedseek (fed = SIM INSTRUMENT: pantry floor,
// starvation removed — isolates the food binding constraint).
// Shard-friendly: SEEDS="1-8" POLICIES="competent,winseek,fedseek" DAYS=200 OUT=...json
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { winseek, fedseek } = require('./policies/winseek');

const POLICIES = { competent, winseek, fedseek };

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
  try {
    if (typeof Game.tableSeat === 'function') return Game.tableSeat();
  } catch (e) {}
  return { seat: 'none', detail: {} };
}

// daily sampler: first-day tracking for arcs/waves/ranks/seats/table/win
function wrapPolicy(policy) {
  const p = Object.assign({}, policy);
  const first = { arc: {}, wave: {}, rank: {}, lesserDay: 0, fullDay: 0, tableDay: 0, winDay: 0, tableAnswers: 0 };
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
      if (G.won && !first.winDay) first.winDay = day;
    } catch (e) {}
    try { first.tableAnswers = (ctx.tableAnswers | 0); } catch (e) {}
  };
  return { p, first };
}

// traps by source + counter-kills + successions (from sweep-completion-r7)
function instrumentUtil(Game, ctx) {
  const U = ctx.util = { trapsSetPlayer: 0, trapsSetVillager: 0, trapCatches: 0, kills: 0, counterKills: 0 };
  const wrap = (name, fn) => {
    const o = Game[name];
    if (typeof o !== 'function') return false;
    Game[name] = function () { return fn.call(this, o, Array.prototype.slice.call(arguments)); };
    return true;
  };
  const vt = Game.villagerTurn;
  if (typeof vt === 'function') {
    Game.villagerTurn = function () {
      Game._utilVillagerPhase = true;
      try { return vt.apply(this, arguments); } finally { Game._utilVillagerPhase = false; }
    };
  }
  wrap('setTrap', function (orig, a) {
    if (Game._utilVillagerPhase) U.trapsSetVillager++; else U.trapsSetPlayer++;
    return orig.apply(this, a);
  });
  wrap('foodCarcass', function (orig, a) {
    if (a[3] === 'trapped') U.trapCatches++;
    return orig.apply(this, a);
  });
  wrap('recordWaveKill', function (orig, a) {
    const mid = a[0];
    let known = false;
    try { known = !!Game.monsterCounterKnown(mid); } catch (e) {}
    const r = orig.apply(this, a);
    U.kills++;
    if (known) U.counterKills++;
    return r;
  });
  const pd = Game.playerDeath;
  if (typeof pd === 'function') {
    Game.playerDeath = function () {
      const beforeId = this.villagerId;
      const r = pd.apply(this, arguments);
      try {
        if (!this.over && this.villagerId && this.villagerId !== beforeId) {
          ctx.successions = (ctx.successions || 0) + 1;
          const nc = ((this.data || {}).villagers || []).find(x => x.id === this.villagerId) || {};
          const age = (nc.age != null ? nc.age : null);
          if (age != null && age < 25) ctx.youngSuccessions = (ctx.youngSuccessions || 0) + 1;
          (ctx.successionDays = ctx.successionDays || []).push(((this.state || {}).scholar || {}).day || 0);
        }
      } catch (e) {}
      return r;
    };
  }
  // vest events -> four-realm formation
  ctx.vests = [];
  const seen = {};
  const orig = Game.polityOf;
  if (typeof orig === 'function') {
    Game.polityOf = function (villageId) {
      let r = null;
      try { r = orig.apply(this, arguments); } catch (e) { return null; }
      try {
        if (r && r.shape && !seen[r.shape]) {
          seen[r.shape] = true;
          const day = ((this.state || {}).scholar || {}).day || 0;
          ctx.vests.push({ day, shape: r.shape, size: r.size || 0, primary: r.primary || null });
        }
      } catch (e) {}
      return r;
    };
  }
  return U;
}

(async () => {
  const seeds = parseSeeds(process.env.SEEDS || '1-8');
  const policyIds = String(process.env.POLICIES || 'competent,winseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '200', 10);
  const OUT = process.env.OUT || path.join(ROOT, 'scripts', 'sweep-winpath-r5-results.json');
  const rows = [];
  const t0 = Date.now();
  let n = 0;
  for (const pid of policyIds) {
    const base = POLICIES[pid];
    if (!base) { console.error('unknown policy: ' + pid); process.exit(1); }
    for (const seed of seeds) {
      const ctx = { successions: 0, youngSuccessions: 0, successionDays: [], tableAnswers: 0 };
      const { Game, loadFails } = await loadGame({ seed, mode: pid });
      if (loadFails && loadFails.length) console.log(`seed ${seed}: LOAD FAILS: ${loadFails.join('; ')}`);
      await setupGame(Game);
      const { p, first } = wrapPolicy(base);
      instrumentUtil(Game, ctx);
      // hand ctx to the policy so tableRoad can record drain answers
      const p2 = Object.assign({}, p);
      const od = p.daily;
      p2.daily = (G, c2) => { od(G, ctx); };
      const result = await runDays(Game, p2, { days });
      const day = ((Game.state || {}).scholar || {}).day || 0;
      const pg = (Game.progState ? Game.progState() : {}) || {};
      const seat = seatDetail(Game);
      const faced = facedByWave(Game);
      const deaths = ((result.samples && result.samples.deaths) || []).map(d => d.cause || d.kind || '?');
      const deathShare = {};
      for (const d of deaths) deathShare[d] = (deathShare[d] || 0) + 1;
      let T = {};
      try { T = (typeof Game.tableState === 'function' ? Game.tableState() : {}) || {}; } catch (e) {}
      let tier = 0;
      try { tier = Game.havenTier ? Game.havenTier() : 0; } catch (e) {}
      let stage = 0, breadth = 0;
      try { stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
      try { breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
      const vests = (ctx.vests || []);
      const row = {
        seed, policy: pid, days: day, endReason: result.endReason,
        maxArc: pg.arc || 1, arcDay: first.arc,
        waveDay: first.wave, maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1),
        faced, rankDay: first.rank,
        lesserDay: first.lesserDay, fullDay: first.fullDay, tableDay: first.tableDay,
        seatEnd: seat.seat, lesserDetailEnd: seat.detail,
        tableFired: !!(pg.tableWaiting || pg.tableDone),
        tablePath: T.path || null, tablePhase: T.phase || null, tableBranch: T.branch || null,
        tableAnswers: ctx.tableAnswers || 0,
        won: !!Game.won, winDay: first.winDay || null,
        vests: vests.map(v => v.shape), fourRealm: vests.length > 0, havenTier: tier,
        crises: Object.keys(pg.crises || {}), crisesN: Object.keys(pg.crises || {}).length,
        countersDiscovered: Object.keys((Game.state || {}).monsterCounters || {}).length,
        counterKills: (ctx.util || {}).counterKills || 0, waveKills: (ctx.util || {}).kills || 0,
        trapsSetPlayer: (ctx.util || {}).trapsSetPlayer || 0,
        trapsSetVillager: (ctx.util || {}).trapsSetVillager || 0,
        trapCatches: (ctx.util || {}).trapCatches || 0,
        successions: ctx.successions || 0, youngSuccessions: ctx.youngSuccessions || 0,
        successionDays: ctx.successionDays || [],
        deathN: deaths.length, deathShare,
        stage, breadth,
        sentiment: !!pg.sentimentTaught,
        feastUsed: !!((((Game.state || {}).scholar || {}).prog || {}).feastSurgeUsed),
        contestsSurvived: (Game.deedState ? (Game.deedState().contestsSurvived | 0) : 0),
      };
      rows.push(row);
      n++;
      console.log(`[${n} ${((Date.now() - t0) / 1000).toFixed(0)}s] ${pid} seed=${seed} d${row.days} ${row.endReason} arc${row.maxArc} uw${row.maxWave} faced[w1:${faced[1]} w2:${faced[2]} w3:${faced[3]}] rank:${JSON.stringify(first.rank)} lesser:${row.lesserDay || '-'} table:${row.tableFired}${row.tablePath ? '(' + row.tablePath + '/' + row.tablePhase + ')' : ''} won:${row.won}${row.winDay ? '@d' + row.winDay : ''} cr:${row.crisesN} deaths:${row.deathN}`);
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
  const F = (f) => rows.filter(f).length;
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const med = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
  console.log('== FUNNEL (n=' + rows.length + ') ==');
  console.log('arc>=2 ' + F(r => r.maxArc >= 2) + ' | arc>=3 ' + F(r => r.maxArc >= 3) + ' | arc>=4 ' + F(r => r.maxArc >= 4));
  console.log('wave>=3 ' + F(r => r.maxWave >= 3) + ' | wave>=4 ' + F(r => r.maxWave >= 4) + ' | wave>=5 ' + F(r => r.maxWave >= 5));
  console.log('wave3-faced>=3 ' + F(r => (r.faced[3] || 0) >= 3) + ' | tier2 ' + F(r => r.havenTier >= 2));
  console.log('regional ' + F(r => r.rankDay.regional) + ' | national ' + F(r => r.rankDay.national) + ' | global ' + F(r => r.rankDay.global));
  console.log('vested ' + F(r => r.vests.length > 0) + ' | fourRealm ' + F(r => r.fourRealm));
  console.log('lesser seat ' + F(r => r.lesserDay > 0) + ' | full seat ' + F(r => r.fullDay > 0) + ' | table fired ' + F(r => r.tableFired) + ' | won ' + F(r => r.won));
  console.log('medianDays ' + med + ' maxDays ' + daysArr[daysArr.length - 1]);
  const dc = {};
  for (const r of rows) for (const k of Object.keys(r.deathShare)) dc[k] = (dc[k] || 0) + r.deathShare[k];
  console.log('death causes: ' + JSON.stringify(dc));
  console.log('traps: player ' + rows.reduce((a, r) => a + r.trapsSetPlayer, 0) + ' villager ' + rows.reduce((a, r) => a + r.trapsSetVillager, 0) + ' catches ' + rows.reduce((a, r) => a + r.trapCatches, 0));
  console.log('counter-kills ' + rows.reduce((a, r) => a + r.counterKills, 0) + ' | successions ' + rows.reduce((a, r) => a + r.successions, 0) + ' (young ' + rows.reduce((a, r) => a + r.youngSuccessions, 0) + ')');
  console.log('wrote ' + OUT);
})();
