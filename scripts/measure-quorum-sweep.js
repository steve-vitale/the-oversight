#!/usr/bin/env node
// measure-quorum-sweep.js — before/after measurement for the MOOT QUORUM
// upgrade-path lever (sim-quorum 2026-10-13).
//
// Pre-registered (evidence header): primary metric = verdict-binding
// correctness on instrumented moots + exile-rate delta. GO iff (a) every
// instrumented moot is correctly marked binding/advisory per attendance,
// (b) background exile rate within ±5pp of the identical-seed baseline, and
// (c) >=3 sense-tested transcripts read as villagers.
// Horizon: 180d (WIN-PATH HORIZON 180, Steve 2026-10-13), death-aware.
// Seeds: 11/22/33/44 x competent/winseek = 8 runs per arm.
//
// Instrument: at day 30 each run forces a player theft case and rigs ONE
// moot to below-quorum attendance (identical treatment before/after). The
// rig is lifted after the advisory so the re-convened moot draws natural
// attendance. Natural (unforced) advisory moots are counted separately.
//
// Usage: OUT=/tmp/quorum-after.json node scripts/measure-quorum-sweep.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { winseek } = require('./policies/winseek');

const POLICY_REGISTRY = { competent, winseek };
const SEEDS = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const POLICY_IDS = (process.env.POLICIES || 'competent,winseek').split(',').map(s => s.trim()).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

async function oneRun(seed, pid) {
  const { Game } = await loadGame({ seed, mode: 'quorum-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const sayLog = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => { sayLog.push(`[d${Game.state.scholar.day}] ${String(t)}`); return origSay(t); };

  const ctx = { forced: 0, advSeen: 0, advDay: null, advConvicted: null, advCorrect: null,
    reopened: 0, reopenDay: null, boundAfter: 0, boundDay: null, boundPath: null,
    exilesAtForce: null, exilesAtAdvisory: null, exilesEnd: null, forcedAccused: null,
    naturalAdvisory: 0, transcripts: [] };
  // NOTE: Game.villagerId is DYNAMIC (succession changes the bearer) — every
  // read below uses the fresh value, never a setup-time capture.
  const origTally = Game.tallyVotes.bind(Game);
  let rigged = false;
  const rigLow = () => {
    rigged = true;
    Game.tallyVotes = (c, wildDay, rng) => {
      const t = origTally(c, wildDay, rng);
      t.present = t.present.slice(0, 1);
      t.playerVoter = false;
      return t;
    };
  };
  const unrig = () => { rigged = false; Game.tallyVotes = origTally; };
  const caseById = (id) => ((Game.betrayalState() || {}).cases || []).find(c => c.id === id);

  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const origDaily = base.daily;
  policy.daily = (G, c2) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) { try { console.error(`quorum-driver error d${G.state.scholar.day}: ${e.message}`); } catch (e2) {} }
    try {
      const day = G.state.scholar.day;
      const v = G.state.village || {};
      // count natural advisory moots (not our forced instrument)
      for (const c of ((G.betrayalState() || {}).cases || [])) {
        if (c.status === 'advisory' && c.id !== ctx.forcedId && !c._counted) {
          c._counted = true; ctx.naturalAdvisory++;
        }
      }
      if (!ctx.forced && !ctx.gaveUp && day >= 30 && !G.state.scholar.exiled && !G.over) {
        const meNow = G.villagerId;
        const npcs = (G.npcIds() || []).filter(id => id !== meNow);
        if (npcs.length >= 4) {
          G.recordCrime('theft', { witnessed: true, victim: npcs[0] });
          const c = G.forcePlayerAccusation();
          if (c && c.accused.includes(meNow)) {
            ctx.forced = 1; ctx.forcedId = c.id; ctx.forcedDay = day;
            ctx.forcedAccused = meNow;
            ctx.exilesAtForce = (v.exiles || []).length;
            c.day = day - 5; // convene soon via playerCaseTick
            rigLow();
          } else if (day > 60) { ctx.gaveUp = 1; }
        }
      }
      if (ctx.forced && !ctx.advSeen) {
        const c = caseById(ctx.forcedId);
        if (c && c.status === 'advisory') {
          ctx.advSeen = 1; ctx.advDay = day;
          ctx.advConvicted = /guilty/.test(c.resolution || '') ? 1 : 0;
          ctx.exilesAtAdvisory = ((G.state.village || {}).exiles || []).length;
          // correctness: no binding consequence fired at the advisory verdict
          const rosterIntact = ((G.state.village || {}).roster || []).includes(ctx.forcedAccused);
          const noExileFired = ctx.exilesAtAdvisory === ctx.exilesAtForce;
          ctx.advCorrect = (rosterIntact && noExileFired) ? 1 : 0;
          // snapshot the advisory transcript (last ~14 lines)
          ctx.transcripts.push({ kind: 'advisory', seed, policy: pid,
            text: sayLog.slice(-14).join('\n') });
          unrig(); // re-convened moot draws natural attendance
        }
      }
      if (ctx.advSeen && !ctx.reopened) {
        const c = caseById(ctx.forcedId);
        if (c && c.status === 'open') { ctx.reopened = 1; ctx.reopenDay = day; }
      }
      if (ctx.reopened && !ctx.boundAfter) {
        const c = caseById(ctx.forcedId);
        if (c && (c.status === 'resolved' || c.status === 'acquitted')) {
          ctx.boundAfter = 1; ctx.boundDay = day; ctx.boundPath = c.resolution;
          ctx.transcripts.push({ kind: 'reconvened', seed, policy: pid,
            text: sayLog.slice(-14).join('\n') });
        }
      }
      // the re-open -> re-convene -> bind can all happen inside one
      // betrayalDailyFull, so the transient 'open' is never observed by the
      // daily poll. Catch the terminal state directly.
      if (ctx.advSeen && !ctx.reopened && !ctx.boundAfter) {
        const c = caseById(ctx.forcedId);
        if (c && (c.status === 'resolved' || c.status === 'acquitted')) {
          ctx.reopened = 1; ctx.reopenDay = day;
          ctx.boundAfter = 1; ctx.boundDay = day; ctx.boundPath = c.resolution;
          ctx.transcripts.push({ kind: 'reconvened', seed, policy: pid,
            text: sayLog.slice(-14).join('\n') });
        }
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, c2); } catch (e) {} }
  };

  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 });
  const end = stdSnapshot(Game);
  const exilesEnd = ((Game.state.village || {}).exiles || []).length;
  ctx.exilesEnd = exilesEnd;
  // final fate of the forced case (for the evidence file)
  let finalStatus = null, finalResolution = null, accusedAliveEnd = null;
  try {
    const c = caseById(ctx.forcedId);
    if (c) { finalStatus = c.status; finalResolution = c.resolution || null; }
    accusedAliveEnd = ctx.forcedAccused ? ((Game.state.village || {}).roster || []).includes(ctx.forcedAccused) : null;
  } catch (e) {}
  return {
    seed, policy: pid,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    forced: ctx.forced, advSeen: ctx.advSeen, advDay: ctx.advDay,
    advConvicted: ctx.advConvicted, advCorrect: ctx.advCorrect,
    reopened: ctx.reopened, reopenDay: ctx.reopenDay,
    boundAfter: ctx.boundAfter, boundDay: ctx.boundDay, boundPath: ctx.boundPath,
    exilesAtForce: ctx.exilesAtForce, exilesAtAdvisory: ctx.exilesAtAdvisory,
    exilesEnd, naturalAdvisory: ctx.naturalAdvisory,
    finalStatus, finalResolution, accusedAliveEnd,
    transcripts: ctx.transcripts,
  };
}

(async () => {
  const rows = [];
  for (const pid of POLICY_IDS) {
    for (const seed of SEEDS) {
      console.log(`--- run seed=${seed} policy=${pid}`);
      const r = await oneRun(seed, pid);
      rows.push(r);
      console.log(`    forced=${r.forced} adv=${r.advSeen} reopened=${r.reopened} bound=${r.boundAfter}(${r.boundPath}) exiles=${r.exilesEnd} won=${r.won} waves=${r.waveReach} nat=${r.national} table=${r.table} days=${r.gameDays} end=${r.endReason}`);
    }
  }
  const out = process.env.OUT || '/tmp/quorum-sweep.json';
  fs.writeFileSync(out, JSON.stringify({ when: new Date().toISOString(), rows }, null, 1));
  console.log('wrote ' + out);
})().catch(e => { console.error('SWEEP ERROR:', e); process.exit(2); });
