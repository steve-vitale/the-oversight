#!/usr/bin/env node
// sweep-storageshed-b6.js — STORAGESHED 5th unpark sweep (2026-10-23).
//
// Steve's 2026-10-21 ruling, STORAGE half: during plenty, the cook still
// cooks the haven meal but the smoke racks run at half pace (each cook sheds
// once per cook-day — half of each about-to-rot surplus batch stays fresh;
// whole shed day's rack budget 4000→2000; dinner reserve untouched).
//
// PRE-REGISTRATION (see evidence/2026-10-23/sim-storageshed-b6.md): PRIMARY
// per-plenty-day rack rate (rackKcalPlenty/rackDaysPlenty), armed/control
// <= 0.70, overall AND per-policy — the STABLE behavioral measure across
// three runs (b: mechanism unspecified; b2: ~0.59x on 16 seeds; b3: 0.556
// overall, 0.568/0.567 per policy). Totals and preserved-rot/100d are
// confounded by the lever's own plenty-extending equilibrium (b2: +74%
// plenty-days; b3: +57%, seed 63003 flipping the belongfeast leg).
//
// Villager-days exposure is accumulated in policy.daily for the
// exposure-normalized guardrail (b) (the named b4 fix).
// Rack kcal are read off the cook's honest day-stream line ("worked the smoke
// racks too — N batches preserved (~X kcal, ...)") — the same number the
// player sees — classified plenty/non-plenty by prodThrottleEngaged() at the
// moment the line is spoken (synchronous, same resolution as the rack loop).
// Identical measurement both sides; no game-code instrumentation.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); STORAGESHED=0
// control | =1 armed (default-ON when unset — asserted explicitly).
// SIDE=control|armed SEEDS="..." POLICY=leadfeast|belongfeast
//   DAYS=100 OUT=<path> node scripts/sweep-storageshed-b4.js
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
if ((process.env.STORAGESHED || '1') !== WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires STORAGESHED=${WANT} (explicit)`);
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '92801,92802,92803,92804,92805,92806,92807,92808')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || ('evidence/2026-10-23/sweep-b6/sweep-' + SIDE + '-' + POLICY_ID + '.json');
const APPEND = process.env.APPEND === '1'; // merge new seeds into an existing OUT file (for pilot→confirm extension)

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  // #827 fix (b4): player expedition deaths are pre-existing content
  // (game.js:8672 — death on expedition); the diff adds zero registerDeath
  // calls. Its own mode class, not "other", not a lever effect.
  if (/expedition/.test(c)) return 'expedition';
  // per-run monster names are not death modes — canonicalize (metric review
  // 2026-10-22: the old pilot's naive string-set comparison false-flagged
  // wave-4 monster names as new modes)
  if (/eater|bulldozer|congregation|big |warranty|ugly|horror|mauler|render/i.test(c)) return 'monster/combat';
  return c.slice(0, 32);
}

function channelOf() {
  const st = new Error().stack || '';
  if (/checkTraps/.test(st)) return 'traps';
  if (/catchUpSim|tribute/i.test(st)) return 'tribute';
  if (/donat/i.test(st)) return 'scholar_home';
  if (/resolveOneAssignment/.test(st)) return 'duty';
  if (/packMeal|homecoming|awayReturn|npcNodeTravel|objReturnEffect/i.test(st)) return 'away_wild';
  if (/hostFeast|Trial|replicated|System/i.test(st)) return 'system';
  if (/villageLives|ambientSocial|mealLeftover/i.test(st)) return 'ambient:villagelives';
  return 'ambient:other';
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'storageshed-b6-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), chan: {}, shareKcal: 0, starveDays: 0,
    rackKcalPlenty: 0, rackKcalOther: 0, rackDaysPlenty: 0, rackDaysOther: 0, villagerDays: 0 };

  // --- rack kcal smoked, classified by plenty at speak time ---
  const oSay = Game.say;
  Game.say = function (s) {
    try {
      const t = String(s);
      const m = /worked the smoke racks too — (\d+) batch[^~]*~([\d,]+) kcal/.exec(t);
      if (m) {
        const kcal = parseInt(m[2].replace(/,/g, ''), 10) || 0;
        let plenty = false;
        try { plenty = !!Game.prodThrottleEngaged(); } catch (e) {}
        if (plenty) { W.rackKcalPlenty += kcal; W.rackDaysPlenty++; }
        else { W.rackKcalOther += kcal; W.rackDaysOther++; }
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };

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
        }
      }
    } catch (e) {}
  };

  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      const roster = (((G.state || {}).village || {}).roster || []);
      W.villagerDays += roster.length; // exposure denominator for guardrail (b)
      for (const id of roster) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;
  Game.say = oSay;
  let shedDays = 0, shedDec = 0, shedKcal = 0;
  try {
    const lg = (Game.state.village || {})._storageShed;
    if (lg) for (const d of Object.values(lg.days || {})) {
      shedDays++; shedDec += (d.shedDec || 0); shedKcal += (d.shedKcal || 0);
    }
  } catch (e) {}
  let exiled = 0, rosterEnd = 0, pantryKcal = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    pantryKcal = Math.round((v.pantry || []).reduce((t, i) => t + ((i.kcalEach || 0) * (i.units || 1)), 0));
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}
  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive),
    nationalEnd: (() => { try { const r = Game.scaleRank(); return /national|global/i.test(String(r)); } catch (e) { return false; } })(),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, exiled, pantryKcal,
    rotFresh: Math.round(W.rot_fresh || 0), rotPreserved: Math.round(W.rot_preserved || 0),
    starveDays: W.starveDays, villagerDays: W.villagerDays,
    shedDays, shedDec, shedKcal: Math.round(shedKcal),
    endFreshDays: (() => { try { return Math.round(Game.pantryFreshDays()); } catch (e) { return -1; } })(),
    rackKcalPlenty: Math.round(W.rackKcalPlenty), rackKcalOther: Math.round(W.rackKcalOther),
    rackDaysPlenty: W.rackDaysPlenty, rackDaysOther: W.rackDaysOther,
    chan: Object.fromEntries(Object.entries(W.chan).map(([k, x]) => [k, Math.round(x)])),
    shareKcal: Math.round(W.shareKcal),
    deaths: W.deaths, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  const have = new Set();
  if (APPEND && fs.existsSync(OUT)) {
    try {
      for (const r of JSON.parse(fs.readFileSync(OUT, 'utf8')).rows || []) {
        if (!have.has(r.seed)) { have.add(r.seed); rows.push(r); }
      }
      console.log(`APPEND: loaded ${rows.length} existing rows from ${OUT}`);
    } catch (e) { console.error('APPEND load failed', e); process.exit(2); }
  }
  for (const seed of SEEDS) {
    if (have.has(seed)) { console.log(`skip seed=${seed} (already present)`); continue; }
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rackPlenty=${Math.round(end.rackKcalPlenty / 1000)}k shed=${end.shedDec} rot=${Math.round((end.rotFresh + end.rotPreserved) / 1000)}k won=${end.won} (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: rows.map(r => r.seed), env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', STORAGESHED: WANT } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
