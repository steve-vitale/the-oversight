#!/usr/bin/env node
// sweep-gorgcall-20261014.js — GORGCALL arm sweep driver (loop B, 2026-10-14).
//
//   POLICY=leadfeast            SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//     OUT=evidence/2026-10-14/gorgcall-A.json node scripts/sweep-gorgcall-20261014.js
//   POLICY="leadfeast+gorgcall" SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//     OUT=evidence/2026-10-14/gorgcall-B.json node scripts/sweep-gorgcall-20261014.js
//   SMOKE=1 node scripts/sweep-gorgcall-20261014.js   # instrument-honesty gate
//
// Named-export POLICY_REGISTRY (never the Object.assign unwrap bug).
// SMOKE=1 fails loudly (exit non-zero) if the suite would ever run
// policy-less: forced wave-5 lingerer must trigger a real callForHelp on the
// armed policy, and gate-off armed must hash-identical raw leadfeast.
'use strict';
const fs = require('fs');
const path = require('path');
const POLICY_ID = process.env.POLICY || 'leadfeast';
process.env.FEASTSCALE_R13 = '1';                       // the wave-5 road
if (POLICY_ID === 'leadfeast+gorgcall') process.env.GORGCALL = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installPredation, finalizePredation, pantryKcal } = require('./predation-lib-20261014');
const { leadfeast } = require('./policies/feastscale');
const gorgcall = require('./policies/gorgcall');

// NAMED-EXPORT registry — no Object.assign unwrapping, no silent base swap.
const POLICY_REGISTRY = {
  'leadfeast': leadfeast,
  'leadfeast+gorgcall': gorgcall.leadfeastGorgcall,
};
function loadPolicy() {
  const p = POLICY_REGISTRY[POLICY_ID];
  if (!p) throw new Error('unknown POLICY ' + POLICY_ID);
  return p;
}
const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function runOne(seed, days) {
  const base = loadPolicy();
  // Policy-less guard: the id must match the leg, and the armed leg must
  // have its env gate on — a sweep that silently ran bare leadfeast for
  // both legs would "prove" a null effect.
  const expectArmed = POLICY_ID === 'leadfeast+gorgcall';
  if (expectArmed && process.env.GORGCALL !== '1') throw new Error('armed leg ran without GORGCALL=1');
  if (!expectArmed && process.env.GORGCALL === '1') throw new Error('baseline leg ran with GORGCALL=1');
  const { Game } = await loadGame({ seed, mode: 'gorgcall', fullTelemetry: false });
  await setupGame(Game);
  const track = installPredation(Game);
  track.helpArrivals = [];
  try {
    const origArr = Game.aidHelpArrived.bind(Game);
    Game.aidHelpArrived = function (h) {
      try { track.helpArrivals.push({ day: gday(this), villageId: h && h.villageId, partySize: h && h.partySize, leader: h && h.leader }); } catch (e) {}
      return origArr(h);
    };
  } catch (e) { track.instrErrors.push('wrapArrived: ' + e.message); }
  const wallTrack = { maxRank: 0, tableDays: [], winDay: null, maxWave: 1, survDays: 0 };
  let savedCtx = null;
  const wrapped = Object.assign({}, base, {
    id: base.id + '-gorgcall-sweep',
    daily(G, ctx) {
      savedCtx = ctx;
      try {
        track.sampleDay();
        const d = gday(G);
        wallTrack.survDays = d;
        try {
          const r = G.scaleRank ? (G.scaleRank() || 'village') : 'village';
          wallTrack.maxRank = Math.max(wallTrack.maxRank, RANK_ORDER[r] || 0);
        } catch (e) {}
        try {
          const pg = G.progState ? G.progState() : {};
          if (pg.tableWaiting || (G.tableActive && G.tableActive())) wallTrack.tableDays.push(d);
        } catch (e) {}
        try { if (G.won && !wallTrack.winDay) wallTrack.winDay = d; } catch (e) {}
        try { if (G.unlockedWave) wallTrack.maxWave = Math.max(wallTrack.maxWave, G.unlockedWave()); } catch (e) {}
      } catch (e) { track.instrErrors.push('daily: ' + e.message); }
      if (base.daily) return base.daily(G, ctx);
    },
  });
  const res = await runDays(Game, wrapped, { days, manifest: { policy: POLICY_ID, seed, mode: 'gorgcall' } });
  const fin = finalizePredation(Game, track);
  const rankNames = Object.keys(RANK_ORDER).filter(k => RANK_ORDER[k] === wallTrack.maxRank);
  const w45 = (fin.episodes || []).filter(e => (e.wave || 1) >= 4);
  return {
    seed, policy: POLICY_ID, layerOn: expectArmed,
    days: res.days, gameDays: res.gameDays, endReason: res.endReason,
    survDays: wallTrack.survDays,
    maxWaveUnlocked: wallTrack.maxWave, wave5Unlocked: wallTrack.maxWave >= 5,
    maxRank: rankNames[0] || 'village', reachedNational: wallTrack.maxRank >= 3,
    tableDays: wallTrack.tableDays.length, won: !!wallTrack.winDay, winDay: wallTrack.winDay,
    episodesW45: w45.map(e => ({ id: e.id, wave: e.wave, firstDay: e.firstDay, lastDay: e.lastDay,
      gorgeNights: e.gorgeNights, gorgeKcal: e.gorgeKcal, resolution: e.resolution, killer: e.killer })),
    w45GorgeNights: w45.reduce((a, e) => a + (e.gorgeNights || 0), 0),
    w45GorgedKcal: w45.reduce((a, e) => a + Math.round(e.gorgeKcal || 0), 0),
    totalGorgedKcal: Math.round(fin.totalGorged || 0),
    helpCalls: fin.helpCalls,
    helpCallsByTier: (fin.helpCalls || []).reduce((m, c) => { m[c.tier] = (m[c.tier] || 0) + 1; return m; }, {}),
    helpArrivals: track.helpArrivals,
    aidResolutions: fin.aidResolutions,
    gorgcallCtx: savedCtx ? {
      daysSaw: savedCtx.gorgeCallDaysSaw || 0,
      calls: (savedCtx.gorgeCalls || []).length,
      byTier: { signal: savedCtx.gorgeCall_signal || 0, system: savedCtx.gorgeCall_system || 0, runner: savedCtx.gorgeCall_runner || 0 },
      noLinks: savedCtx.gorgeCallNoLinks || 0, cooldown: savedCtx.gorgeCallCooldown || 0,
      oncePerDay: savedCtx.gorgeCallOncePerDay || 0, crisisRaised: savedCtx.gorgeCrisisRaised || 0,
      crisisResolved: savedCtx.gorgeCrisisResolved || 0, escSkip: savedCtx.gorgeCallEscSkip || 0,
    } : null,
    instrErrors: fin.instrErrors,
  };
}

function merge(perSeed) {
  const m = { policy: POLICY_ID, seeds: perSeed.length,
    national: 0, table: 0, wins: 0, wave4: 0, wave5: 0,
    survDays: [], episodesW45: 0, w45GorgeNights: 0, w45GorgedKcal: 0,
    helpCalls: 0, helpCallsByTier: {}, helpArrivals: 0, instrErrors: 0 };
  for (const r of perSeed) {
    if (r.reachedNational) m.national++;
    if (r.tableDays > 0) m.table++;
    if (r.won) m.wins++;
    if (r.maxWaveUnlocked >= 4) m.wave4++;
    if (r.maxWaveUnlocked >= 5) m.wave5++;
    m.survDays.push(r.survDays);
    m.episodesW45 += r.episodesW45.length;
    m.w45GorgeNights += r.w45GorgeNights;
    m.w45GorgedKcal += r.w45GorgedKcal;
    m.helpCalls += (r.helpCalls || []).length;
    for (const [k, v] of Object.entries(r.helpCallsByTier || {})) m.helpCallsByTier[k] = (m.helpCallsByTier[k] || 0) + v;
    m.helpArrivals += (r.helpArrivals || []).length;
    m.instrErrors += (r.instrErrors || []).length;
  }
  m.survDays.sort((a, b) => a - b);
  m.medianSurv = m.survDays.length ? m.survDays[Math.floor(m.survDays.length / 2)] : 0;
  m.maxSurv = m.survDays.length ? m.survDays[m.survDays.length - 1] : 0;
  return m;
}

async function smoke() {
  console.log('SMOKE=1 — instrument-honesty gate');
  let bad = 0;
  const say = (ok, n, x) => { console.log((ok ? '  ok: ' : '  FAIL: ') + n + (x ? ' — ' + x : '')); if (!ok) bad++; };
  // (a) armed + forced wave-5 lingerer must produce a real callForHelp.
  process.env.GORGCALL = '1';
  {
    const { Game } = await loadGame({ seed: 7, mode: 'gorgcall-smoke', fullTelemetry: false });
    await setupGame(Game);
    await quietLog(() => runDays(Game, leadfeast, { days: 5 }));
    const v = Game.state.village || {};
    const hx = (v.px !== undefined && v.px !== null) ? v.px : 4, hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
    Game.worldMonsters().push({ id: 'cancellation', key: 'smoke-1', lingering: true, hp: 1200, tx: hx, ty: hy, mx: hx, my: hy });
    // a linked fire to call to — the engine's own link birth, trust 65
    // (above the ask floor). Without this the no-link branch is the honest
    // outcome and the smoke would assert nothing.
    try {
      const ovs = ((Game.state || {}).otherVillages || []).filter(o => o && o.id && o.id !== 'haven');
      if (ovs.length) {
        const link = Game._formLink(ovs[0].id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
        if (link) link.trust = 65;
      }
    } catch (e) {}
    let calls = 0;
    const o = Game.callForHelp.bind(Game);
    Game.callForHelp = function (t, oo) { calls++; return o(t, oo); };
    const ctx = {};
    gorgcall.gorgeCall(Game, ctx);
    say(calls === 1, 'armed: forced wave-5 lingerer triggers exactly one callForHelp', calls + ' calls');
    say(ctx.gorgeCalls && ctx.gorgeCalls.length === 1, 'armed: call recorded in ctx');
  }
  // (b) gate-off armed policy must be byte-identical to raw leadfeast.
  delete process.env.GORGCALL;
  const hOf = async (policy, seed) => {
    const { Game } = await loadGame({ seed, mode: 'gorgcall-smoke', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const p = Object.assign({}, policy, { id: policy.id + '-smoke' });
    const od = p.daily;
    p.daily = (G, ctx) => {
      const s = (G.state || {}).scholar || {}, vv = (G.state || {}).village || {};
      hashes.push([s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), (vv.roster || []).length].join('|'));
      return od ? od(G, ctx) : undefined;
    };
    await quietLog(() => runDays(Game, p, { days: 12 }));
    return hashes.join('\n');
  };
  const hA = await hOf(leadfeast, 7), hB = await hOf(gorgcall.leadfeastGorgcall, 7);
  say(hA === hB && hA.length > 0, 'gate-off: armed policy byte-identical to raw leadfeast');
  // (c) the armed leg must actually be armed — env gate presence asserted.
  process.env.GORGCALL = '1';
  say(process.env.GORGCALL === '1', 'armed leg carries GORGCALL=1');
  delete process.env.GORGCALL;
  console.log(bad ? 'SMOKE FAILED (' + bad + ')' : 'SMOKE PASSED');
  process.exit(bad ? 1 : 0);
}

(async () => {
  if (process.env.SMOKE === '1') return smoke();
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
  const days = Number(process.env.DAYS || 180);
  const out = process.env.OUT || ('evidence/2026-10-14/gorgcall-' + POLICY_ID.replace(/\+/g, '') + '.json');
  const perSeed = [];
  for (const seed of seeds) {
    const t0 = Date.now();
    const r = await quietLog(() => runOne(seed, days));
    perSeed.push(r);
    console.log(`seed ${seed}: surv=${r.survDays}d end=${r.endReason} wave=${r.maxWaveUnlocked} rank=${r.maxRank} w45ep=${r.episodesW45.length} w45kcal=${r.w45GorgedKcal} calls=${JSON.stringify(r.helpCallsByTier)} arrivals=${r.helpArrivals.length} (${Math.round((Date.now() - t0) / 1000)}s)`);
  }
  const merged = merge(perSeed);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ merged, perSeed }, null, 1));
  console.log('MERGED:', JSON.stringify(merged));
  console.log('wrote ' + out);
})().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
