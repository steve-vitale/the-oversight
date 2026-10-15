#!/usr/bin/env node
// sweep-recoverthrottle-20261015.js — RECOVERTHROTTLE PILOT (scale-onramp, ARM 1, 2026-10-15).
//
// Rebuilt layer under a SURVIVAL primary (sim-findings #215): the succbrake
// kill's recovery lever re-tested with its own pre-registered test.
//
// Modes (--mode control|armed|detgate):
//   control — fourthlink road, RECOVERTHROTTLE unset (gate off): the own
//     control in the same sweep (baseline drift #247 — never inherit).
//   armed   — fourthlink + recoverthrottle layer, RECOVERTHROTTLE=1.
//   detgate — the wrapper with the env gate OFF vs raw fourthlink: rows must
//     be byte-identical.
// Substrate: leadcourt + FOURTHLINK=1 (the courtship road), seeds
// 11/22/33/44/55/66/77/88, 180d death-aware. Identical seeds both sides.
//
// Kill protocol: if scripts/policies/recoverthrottle.js is absent,
// armed/detgate refuse LOUD (exit 2); control still runs (exit 0).
//
// PRE-REGISTRATION (evidence/2026-10-15/sim-recoverthrottle.md — written
// BEFORE any measurement):
//   PRIMARY: median survival armed >= control + 10d.
//   CO-PRIMARY: national armed >= control.
//   GUARDRAILS: feeds/mantleSuccessions armed <= control x 1.3 (must not
//     worsen the siege feed); no new death mode at the n>=3 family floor
//     (#216); exiled 0 armed; starvation deaths armed <= control + 2.
//   Horizon 180d death-aware; 8-seed pilot; confirm 12-16 only on GO.
// Metric binding (§14): a miss is NO-GO, never re-scored mid-run.
//
// Usage:
//   node scripts/sweep-recoverthrottle-20261015.js --mode control --out evidence/2026-10-15/sim-recoverthrottle-control.json
//   RECOVERTHROTTLE=1 node scripts/sweep-recoverthrottle-20261015.js --mode armed --out evidence/2026-10-15/sim-recoverthrottle-armed.json
'use strict';
const fs = require('fs');
const path = require('path');

const LAYER_PATH = path.join(__dirname, 'policies', 'recoverthrottle.js');
const layerGone = !fs.existsSync(LAYER_PATH);

function usage(msg) {
  if (msg) console.error('FATAL: ' + msg);
  console.error('usage: node scripts/sweep-recoverthrottle-20261015.js --mode control|armed|detgate [--out PATH]');
  process.exit(msg ? 1 : 0);
}
const argv = process.argv.slice(2);
function arg(name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
}
const mode = arg('--mode');
if (!['control', 'armed', 'detgate'].includes(mode)) usage('bad --mode');
if (layerGone && (mode === 'armed' || mode === 'detgate')) {
  console.error('REFUSE: scripts/policies/recoverthrottle.js absent (killed arm) — ' + mode + ' mode cannot run.');
  process.exit(2);
}
const out = arg('--out');

// FOURTHLINK=1 for the courtship road (fourthlink reads env at require time;
// recoverthrottle requires fourthlink at its own load — set before both).
process.env.FOURTHLINK = '1';
if (mode === 'armed') process.env.RECOVERTHROTTLE = '1';
else delete process.env.RECOVERTHROTTLE;

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// NAMED exports (2026-10-14 unwrap lesson).
const { fourthlink } = require('./policies/fourthlink');
const { recoverthrottle } = layerGone ? {} : require(LAYER_PATH);
const basePolicy = mode === 'detgate' ? recoverthrottle : (mode === 'armed' ? recoverthrottle : fourthlink);
const rawBase = fourthlink;

// Unwrap guard (the 2026-10-14 lesson).
for (const [nm, p] of [['base', basePolicy], ['raw', rawBase]]) {
  if (typeof p.daily !== 'function') {
    console.error(`FATAL: unwrap — ${nm} policy.daily is not a function`);
    process.exit(1);
  }
}

const { stdSnapshot } = require('./sweep-compare');
const { pairFights, categorizeCause } = require('./w5census-lib');
const MONSTERS = require('../src/data/monsters.json');
const MONSTER_NAMES = new Set();
for (const m of (MONSTERS || [])) { MONSTER_NAMES.add(m.name || m.id); MONSTER_NAMES.add(m.id); }
const nameOf = (mid) => { const m = (MONSTERS || []).find(x => x.id === mid); return (m && (m.name || m.id)) || mid || '?'; };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',')
  .map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = 180;

async function runOne(seed) {
  const instrErrors = [];
  const { Game } = await loadGame({ seed, mode: 'recoverthrottle-' + mode, fullTelemetry: true });
  await setupGame(Game);

  const track = { tenures: [], unlockDay: {}, maxRank: 0, maxArc: 1, everTable: false, exiledEver: false };
  const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;
  const bearerOf = (G) => (G.villagerId != null ? G.villagerId : (((G.state || {}).scholar || {}).villagerId));
  let lastVid = null;
  const noteBearerOf = (G, vid, day) => {
    if (vid != null && vid !== lastVid) { track.tenures.push({ vid, startDay: day }); lastVid = vid; }
  };
  // read-only instrument wraps (proven byte-identical by the succbrake diagnostic SMOKE)
  try {
    if (typeof Game.playerDeath === 'function') {
      const origPD = Game.playerDeath.bind(Game);
      Game.playerDeath = function () {
        const r = origPD.apply(this, arguments);
        try { noteBearerOf(this, bearerOf(this), gday(this)); } catch (e) { instrErrors.push('playerDeath: ' + e.message); }
        return r;
      };
    }
  } catch (e) { instrErrors.push('playerDeathWrap: ' + e.message); }
  try {
    if (typeof Game.tele === 'function') {
      const origTele = Game.tele.bind(Game);
      Game.tele = function (type, data) {
        try { if (type === 'death' && data && data.player && data.who && data.who !== '?') noteBearerOf(this, data.who, gday(this)); }
        catch (e) { instrErrors.push('deathTele: ' + e.message); }
        return origTele.apply(this, arguments);
      };
    }
  } catch (e) { instrErrors.push('teleWrap: ' + e.message); }

  // Layer observability: grab ctx (not returned by runDays) + per-day scale snapshot.
  const holder = { ctx: null };
  const policy = Object.assign({}, basePolicy, {
    id: (basePolicy.id || 'base') + '+recoverthrottle-pilot',
    desc: 'pilot instrument wrapper',
  });
  const od = basePolicy.daily, ou = basePolicy.upkeep, os = basePolicy.setup;
  policy.daily = (G, ctx) => {
    holder.ctx = ctx;
    try {
      noteBearerOf(G, bearerOf(G), gday(G));
      const wv = (G.unlockedWave && G.unlockedWave()) || 1;
      for (let w = 1; w <= wv; w++) if (track.unlockDay[w] == null) track.unlockDay[w] = gday(G);
      const r = (G.scaleRank ? G.scaleRank() : (stdSnapshot(G) || {}).rank) || 'village';
      track.maxRank = Math.max(track.maxRank, RANK_ORDER[r] || 0);
      try { const pg = G.progState ? G.progState() : {}; track.maxArc = Math.max(track.maxArc, pg.arc || 1); if (pg.tableWaiting) track.everTable = true; } catch (e) {}
      if (G.state && G.state.exiled) track.exiledEver = true;
    } catch (e) { instrErrors.push('daily: ' + e.message); }
    return od(G, ctx);
  };
  if (ou) policy.upkeep = (G, ctx) => { holder.ctx = ctx; return ou(G, ctx); };
  if (os) policy.setup = (G, ctx) => { holder.ctx = ctx; return os(G, ctx); };

  const result = await quietLog(() => runDays(Game, policy, { days: DAYS, sampleEvery: 10 }));
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting) track.everTable = true; } catch (e) {}
  const ctx = holder.ctx || {};

  const tele = (Game.state || {}).telemetry || [];
  const playerDeaths = (result.samples.deaths || [])
    .filter(d => d.player)
    .map(d => ({ day: d.day, who: d.who, cause: d.cause }));
  const combatStarts = tele
    .filter(e => e.type === 'combat_start')
    .map(e => ({ day: e.day, mid: e.vs, wave: e.wave || null, pack: e.pack || 1 }));
  const combatEnds = tele
    .filter(e => e.type === 'combat_end')
    .map(e => ({ day: e.day, result: e.result || null }));
  const pairs = pairFights(combatStarts, combatEnds);
  function pairedMonster(deathDay) {
    let best = null, bestScore = 1e9;
    for (const p of pairs) {
      if (!p.end) continue;
      const diff = Math.abs(p.end.day - deathDay);
      if (diff > 1) continue;
      const score = diff * 10 + (p.end.day > deathDay ? 1 : 0);
      if (score < bestScore) { bestScore = score; best = p; }
    }
    if (!best) return null;
    return best.start ? nameOf(best.start.mid) : '(person-fight)';
  }

  const successions = [];
  for (let i = 1; i < track.tenures.length; i++) {
    const prev = track.tenures[i - 1], cur = track.tenures[i];
    const prevDeaths = playerDeaths.filter(d => d.who === prev.vid && d.day <= cur.startDay);
    const prevDeath = prevDeaths.length ? prevDeaths[prevDeaths.length - 1] : null;
    const curDeaths = playerDeaths.filter(d => d.who === cur.vid && d.day >= cur.startDay);
    const curDeath = curDeaths.length ? curDeaths[0] : null;
    const gap = curDeath ? curDeath.day - cur.startDay : null;
    const cat = curDeath ? categorizeCause(curDeath.cause, MONSTER_NAMES) : null;
    const feed = !!(curDeath && cat === 'combat' && gap <= 1);
    const prevMonster = prevDeath ? pairedMonster(prevDeath.day) : null;
    const curMonster = curDeath ? pairedMonster(curDeath.day) : null;
    successions.push({
      prevVid: String(prev.vid).slice(0, 14), curVid: String(cur.vid).slice(0, 14),
      startDay: cur.startDay, mantlePass: !!prevDeath,
      curDeathDay: curDeath ? curDeath.day : null, gap, category: cat, feed,
      prevMonster, curMonster,
      sameMonster: !!(feed && prevMonster && curMonster && prevMonster !== '(person-fight)' && prevMonster === curMonster),
    });
  }
  const mantleSuccessions = successions.filter(s => s.mantlePass);
  const feeds = successions.filter(s => s.feed);

  const deathCauses = {};
  for (const d of (result.samples.deaths || [])) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    deathCauses[k] = (deathCauses[k] || 0) + 1;
  }
  let won = 0;
  try { won = Game.won ? 1 : 0; } catch (e) {}

  // Layer observability (armed side only).
  const extra = {};
  if (mode === 'armed') {
    for (const k of ['_rtWindows', '_rtFortifyDays', '_rtDeclined', '_rtWalkHops']) {
      if (typeof ctx[k] === 'number') extra[k.replace(/^_rt/, 'rt')] = ctx[k];
    }
  }

  const row = {
    seed, mode, days: result.days, endReason: result.endReason,
    won, waveReach: result.maxWaveUnlocked || 1, maxArc: track.maxArc,
    national: track.maxRank >= 2 ? 1 : 0,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === track.maxRank) || 'village',
    table: track.everTable ? 1 : 0,
    wave5: track.unlockDay[5] != null ? 1 : 0, wave5Day: track.unlockDay[5] || null,
    wave4: track.unlockDay[4] != null ? 1 : 0,
    exiled: track.exiledEver ? 1 : 0,
    tenures: track.tenures.length,
    mantleSuccessions: mantleSuccessions.length,
    feeds: feeds.length,
    sameMonsterFeeds: feeds.filter(s => s.sameMonster).length,
    feedDetail: feeds.map(f => ({ seed, prevVid: f.prevVid, curVid: f.curVid, startDay: f.startDay, curDeathDay: f.curDeathDay, gap: f.gap, prevMonster: f.prevMonster, curMonster: f.curMonster, sameMonster: f.sameMonster })),
    deathCauses, playerDeaths: playerDeaths.length,
    instrErrors: instrErrors.length,
    extra,
  };
  console.log(`  [${mode} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} ` +
    `nat=${row.national} tab=${row.table} won=${row.won} mantleSucc=${row.mantleSuccessions} feeds=${row.feeds} w5=${row.wave5 ? 'd' + row.wave5Day : 'no'} instrErr=${instrErrors.length}`);
  return row;
}

function aggregate(modeName, rows) {
  const days = rows.map(r => r.days).sort((a, b) => a - b);
  const median = days.length ? (days[Math.floor((days.length - 1) / 2)] + days[Math.floor(days.length / 2)]) / 2 : null;
  const sum = k => rows.reduce((t, r) => t + (r[k] || 0), 0);
  const extraSums = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.extra || {})) {
    if (typeof v === 'number') extraSums[k] = (extraSums[k] || 0) + v;
  }
  const deaths = {};
  for (const r of rows) for (const k of Object.keys(r.deathCauses || {}).sort()) deaths[k] = (deaths[k] || 0) + r.deathCauses[k];
  const starvation = Object.keys(deaths).filter(k => /starvation/i.test(k)).reduce((t, k) => t + deaths[k], 0);
  const mantleSucc = rows.reduce((t, r) => t + r.mantleSuccessions, 0);
  const feeds = rows.reduce((t, r) => t + r.feeds, 0);
  return {
    mode: modeName, n: rows.length, seeds: SEEDS,
    medianDays: median, maxDays: days.length ? days[days.length - 1] : 0,
    national: sum('national'), table: sum('table'), wins: sum('won'),
    wave4: sum('wave4'), wave5: sum('wave5'), exiled: sum('exiled'),
    mantleSuccessions: mantleSucc, feeds,
    feedPerMantleSuccession: mantleSucc ? +(feeds / mantleSucc).toFixed(4) : null,
    sameMonsterFeeds: rows.reduce((t, r) => t + r.sameMonsterFeeds, 0),
    starvationDeaths: starvation,
    deathCauses: deaths,
    extra: extraSums,
  };
}

async function main() {
  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const rows = [];
  for (const seed of SEEDS) rows.push(await runOne(seed));
  const suite = aggregate(mode, rows);
  const report = {
    label: 'recoverthrottle-' + mode,
    policy: mode === 'detgate' ? 'recoverthrottle-wrapper-gate-OFF' : (mode === 'armed' ? 'fourthlink+RECOVERTHROTTLE=1' : 'fourthlink'),
    seeds: SEEDS, days: DAYS, commit,
    generated: new Date().toISOString(),
    rows,
    suite,
  };
  if (out) {
    fs.writeFileSync(path.resolve(__dirname, '..', out), JSON.stringify(report, null, 1));
    console.log(`wrote ${out}`);
  }
  const s = suite;
  console.log(`SUITE [${report.label}]: median ${s.medianDays}d, national ${s.national}/${s.n}, table ${s.table}, wins ${s.wins}, ` +
    `w4 ${s.wave4} w5 ${s.wave5}, exiled ${s.exiled}, feeds ${s.feeds}/${s.mantleSuccessions} = ${s.feedPerMantleSuccession}/succ, starv ${s.starvationDeaths}`);
  return report;
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runOne };
