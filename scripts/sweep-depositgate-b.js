#!/usr/bin/env node
// sweep-depositgate-b.js — DEPOSITGATE pilot sweep (sim-depositgate-b, 2026-10-22).
//
// Pre-registration lives in evidence/2026-10-22/sim-depositgate-b.md (binding,
// docs/MEASUREMENT.md §14). Summary:
//   PRIMARY: rot/100d kcal armed/control <= 0.85 AND depositor-inflow
//            (share+return+bighaul+tribute-receipt) armed/control <= 0.90.
//   ENGAGEMENT (kill-fast): eased kcal > 0 on >= 6/16 armed runs.
//   Guardrails: median survival >= control-10d; starvation deaths pair sums
//   <= control+2; national(end) >= control-2; tribute trust health (no link
//   dissolved attributable to waiver on any armed run; arrears pair sums
//   <= control); no new death modes (kind-filtered); no channel laundering
//   >2x (named channels armed/control <= 2.0).
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); DEPOSITGATE=0
// control | =1 armed.
// SIDE=control|armed SEEDS="9201,...,9208" POLICY=leadfeast|belongfeast
//   DAYS=180 OUT=<path> node scripts/sweep-depositgate-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'control';
const WANT = SIDE === 'armed' ? '1' : '0';
if ((process.env.DEPOSITGATE || '0') !== WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires DEPOSITGATE=${WANT}`);
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '9201,9202,9203,9204,9205,9206,9207,9208')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-depositgate-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// channel attribution for stockPantry callers. The four DEPOSITGATE deposit
// channels get dedicated names (stack-sniffed; the eased call sites are the
// only stockPantry callers inside villageLives' forage branch and
// npcNodeTravel's return branch — verified by code read 2026-10-22):
//   bighaul = ambient BIG DAY + routine haul (villageLives forage)
//   return  = away-party foraging return (npcNodeTravel)
// Everything else falls back to the prodrebound glutprobe taxonomy for the
// laundering guardrail.
function channelOf() {
  const st = new Error().stack || '';
  if (/villageLives/.test(st)) return 'bighaul';
  if (/npcNodeTravel/.test(st)) return 'return';
  if (/checkTraps/.test(st)) return 'traps';
  if (/catchUpSim|tribute/i.test(st)) return 'tribute';
  if (/donat/i.test(st)) return 'scholar_home';
  if (/resolveOneAssignment/.test(st)) return 'duty';
  if (/packMeal|homecoming|awayReturn|objReturnEffect/i.test(st)) return 'away_wild';
  if (/hostFeast|Trial|replicated|System/i.test(st)) return 'system';
  if (/ambientSocial|mealLeftover/i.test(st)) return 'ambient:villagelives';
  return 'ambient:other';
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'depositgate-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), chan: {}, shareKcal: 0, tributeKcal: 0, starveDays: 0, starveDeaths: 0 };

  // --- rot:fresh vs rot:preserved (dedupe by item identity) ---
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
          W['rot_' + fs] = (W['rot_' + fs] || 0) + (it.kcalEach || 0) * (it.units || 1);
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };

  // --- inflow channel attribution ---
  const oSP = Game.stockPantry;
  if (typeof oSP === 'function') Game.stockPantry = function (kcal, name, opts) {
    try { const c = channelOf(); W.chan[c] = (W.chan[c] || 0) + (kcal || 0); }
    catch (e) {}
    return oSP.apply(this, arguments);
  };
  const oSS = Game.stockSurplus;
  if (typeof oSS === 'function') Game.stockSurplus = function (v, give) {
    const r = oSS.apply(this, arguments);
    try { W.shareKcal += Math.max(0, r || 0); } catch (e) {}
    return r;
  };
  // tribute arrives via depositPantryPieces (not stockPantry) — named channel
  const oDPP = Game.depositPantryPieces;
  if (typeof oDPP === 'function') Game.depositPantryPieces = function (v, src, pieceKcal) {
    const r = oDPP.apply(this, arguments);
    try {
      if (src && /tribute grain/i.test(String(src.name || ''))) {
        W.tributeKcal += Math.max(0, r || 0);
      } else {
        const c = channelOf(); W.chan[c] = (W.chan[c] || 0) + Math.max(0, r || 0);
      }
    } catch (e) {}
    return r;
  };

  // --- deaths: kind-aware, dedup on (who,day,cause) ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          W.deaths.push({ day, who: who.slice(0, 24), kind, cause });
          if (/starv/.test(cause)) W.starveDeaths++;
        }
      }
    } catch (e) {}
  };

  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      for (const id of (((G.state || {}).village || {}).roster || [])) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  // --- depositgate ledger: exact eased kcal per channel ---
  let eased = { share: 0, ret: 0, big: 0, waived: 0, days: 0 };
  try {
    const lg = (Game.state.village || {})._depositGate;
    if (lg) for (const d of Object.values(lg.days || {})) {
      eased.days++;
      eased.share += (d.shareEased || 0);
      eased.ret += (d.returnEased || 0);
      eased.big += (d.bigHaulEased || 0);
      eased.waived += (d.tributeWaived || 0);
    }
  } catch (e) {}

  // --- tribute trust health: link status/trust/arrears at end ---
  let links = [];
  try {
    for (const l of (Game.hierarchyState() || [])) {
      links.push({ id: String(l.id || '').slice(0, 24), status: String(l.status || '?'),
        trust: Math.round(l.trust || 0), arrears: Math.round(l.arrears || 0),
        sub: String(l.subordinate || '?').slice(0, 16) });
    }
  } catch (e) {}

  let exiled = 0, rosterEnd = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}

  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalEnd: (() => { try { return /national/i.test(String(Game.scaleRank())); } catch (e) { return false; } })(),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, exiled,
    rotFresh: Math.round(W.rot_fresh || 0), rotPreserved: Math.round(W.rot_preserved || 0),
    starveDays: W.starveDays, starveDeaths: W.starveDeaths,
    shareKcal: Math.round(W.shareKcal), tributeKcal: Math.round(W.tributeKcal),
    chan: Object.fromEntries(Object.entries(W.chan).map(([k, x]) => [k, Math.round(x)])),
    eased: { share: Math.round(eased.share), ret: Math.round(eased.ret), big: Math.round(eased.big),
             waived: Math.round(eased.waived), days: eased.days,
             total: Math.round(eased.share + eased.ret + eased.big + eased.waived) },
    links, deaths: W.deaths, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round((end.rotFresh + end.rotPreserved) / 1000)}k starveD=${end.starveDays} won=${end.won} eased=${end.eased.total} links=${end.links.length} (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', DEPOSITGATE: WANT } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
