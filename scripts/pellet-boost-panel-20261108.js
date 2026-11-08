// scripts/pellet-boost-panel-20261108.js — pellet boost + RADS cost panel driver.
// Prereg amendment: evidence/2026-11-08/sim-pellet-rads-prereg.md, bars
// RB-1 (P1), RB-2 (P2 organic), RB-3 (P3). The cost is radiation on the
// bearer now, not pantry food: the starved panel (PB-3) is SUPERSEDED and
// removed — a starved bearer still boosts, so there is no starved panel to
// run. One case per process (never two games in one node process). Prints
// one JSON line to stdout; the shell loop collects lines into
// evidence/2026-11-08/sim-pellet-rads-panel.jsonl, and
// scripts/analyze-pellet-boost-panel-20261108.js judges the bars.
//
// Panel (capable policy, 150d, standard competent-panel env):
//   bearer — scholar is the reactor bearer, rich mixed pantry (P1/P2/P3).
//            Bars: >=1 boost on >=4/8 seeds; ledger.rads equals the sum of
//            observed boost rads on every seed (exact accounting); every
//            paid burn costs exactly radsPerBoost; no burn draws the pantry
//            (pre/post pantry equal at the burn); per-bearer burn rads match
//            per-bearer boost counts; P2 organic: at least one heavy-use
//            bearer-day (>=5 boosts in a day) somewhere in the panel, and
//            any bearer that reaches exposure >=10 is observed sick.
//   pass    — P4 is NOT this driver: re-run the pelletpass-alone driver
//             (scripts/panel-pellet-pass-20261107.js) on this branch and diff
//             its JSONL against evidence/2026-11-07/sim-pelletpass-panel.jsonl.
//
// Usage:
//   node scripts/pellet-boost-panel-20261108.js --panel bearer --seed 7
'use strict';
// Competent-panel env (prereg): set before the harness reads it.
process.env.COMPETENT_FEAST = process.env.COMPETENT_FEAST || '0';
process.env.SEATDRIVE = process.env.SEATDRIVE || '0';
process.env.PLENTYDEPRI = process.env.PLENTYDEPRI || '0';
process.env.DEPOSITGATE = process.env.DEPOSITGATE || '1';
process.env.POLICY = process.env.POLICY || 'nighttravel';
process.env.WOODCARRY = process.env.WOODCARRY || '1';
process.env.WOODWARM = process.env.WOODWARM || '0';
process.env.BANKFOOD = process.env.BANKFOOD || '1';
process.env.STRANDNARR = process.env.STRANDNARR || '1';

const K = require('./godpath/lib');
const { runDays, quietLog } = require('./sim-harness');
const { capable } = require('./policies/capable');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 && process.argv[i + 1] != null ? process.argv[i + 1] : def;
}

const RADS = 2;
// Rich mixed pantry (the fusion-reactor test's mix): 50-kcal units first,
// then 100s, then 500s.
function richPantry() {
  return [
    { name: 'Dried berries', kcalEach: 50, units: 60, foodKind: 'plant', foodState: 'dried' },
    { name: 'Smoked turkey leg', kcalEach: 100, units: 30, foodKind: 'meat', foodState: 'smoked' },
    { name: 'Smoked turkey leg', kcalEach: 500, units: 20, foodKind: 'meat', foodState: 'smoked' },
  ];
}

// Direct-state bearer rig (the pelletpass shape's form, not abilityOnAcquire:
// a panel rig pins state, it does not hunt for a slot). The scholar is the
// bearer; the reactor is online from day 0.
function rigBearer(G, pantry) {
  const s = G.state.scholar;
  G.state.systemArrived = true;
  s.fusionReactor = { installed: true, online: true };
  s.abilities = s.abilities || [];
  if (!s.abilities.some(a => ((a && a.id) || a) === 'fusion_reactor')) s.abilities.push({ id: 'fusion_reactor' });
  G.state.fusionReactorHolder = { who: 'player', vid: G.villagerId, day: G.state.day || 0 };
  G.state.village.pantry = pantry;
}

(async () => {
  const panel = arg('panel', 'bearer');
  const seed = Number(arg('seed', '7'));
  const days = Number(arg('days', '150'));
  const G = await K.load({ seed });
  K.newRun(G);
  const scholarVidStart = G.villagerId;
  const pantry = richPantry();
  const pantryKcalStart = pantry.reduce((a, p) => a + p.kcalEach * p.units, 0);
  // Observe every burn: the wrap logs what pelletBurn returns, so the
  // ledger can be checked against the observed rads (exact accounting).
  // Pantry is snapshotted BEFORE and AFTER the burn: a boost must not
  // move the pantry at all (the cost is rads, not food).
  const burns = [];
  const daily = [];
  let reactorOnlineAtStart = false;
  const rigged = Object.assign({}, capable, {
    setup(g, ctx) {
      if (capable.setup) capable.setup(g, ctx);
      rigBearer(g, richPantry());
      reactorOnlineAtStart = !!(g.fusionReactorOnline && g.fusionReactorOnline());
      const orig = g.pelletBurn.bind(g);
      g.pelletBurn = function (vid, opts) {
        let preKcal = null;
        try { preKcal = Math.round(g.pantryKcalLive(g.state.village)); } catch (e) {}
        const r = orig(vid, opts);
        let postKcal = null;
        try { postKcal = Math.round(g.pantryKcalLive(g.state.village)); } catch (e) {}
        try {
          burns.push({ day: (g.state.scholar || {}).day || 0, vid: vid == null ? 'p' : String(vid), boosted: !!r.boosted, rads: r.rads || 0, mult: r.mult || 1,
            pantryKcalAtBurn: preKcal, pantryKcalAfterBurn: postKcal });
        } catch (e) {}
        return r;
      };
    },
    daily(g, ctx) {
      const r = capable.daily && capable.daily(g, ctx);
      try {
        const L = g.state.pelletBoost || { rads: 0, boosts: 0, floors: 0 };
        const s = g.state.scholar || {};
        let hasAb = null;
        try { hasAb = !!(globalThis.Scattering.hasAbility && globalThis.Scattering.hasAbility(s, 'fusion_reactor')); } catch (e) {}
        const h = g.state.fusionReactorHolder || null;
        const hk = !h ? null : (h.who === 'player' ? 'p' : h.vid);
        let holderExposure = null, holderSick = null, holderHealth = null;
        try { holderExposure = (typeof g.pelletExposure === 'function' && hk != null) ? g.pelletExposure(hk) : null; } catch (e) {}
        try {
          const v = g.state.village || {};
          if (hk === 'p') {
            holderSick = (typeof g.seHas === 'function' && g.seHas(s, 'radiation_sickness')) ? 'radiation_sickness' : null;
            holderHealth = s.health;
          } else if (hk != null && v.sick && v.sick[hk]) {
            holderSick = v.sick[hk].name || null;
            holderHealth = (v.health && v.health[hk] !== undefined) ? v.health[hk] : null;
          }
        } catch (e) {}
        let scholarExposure = null;
        try { scholarExposure = (typeof g.pelletExposure === 'function') ? g.pelletExposure('p') : null; } catch (e) {}
        daily.push({ day: (g.state.scholar || {}).day || 0, pantryKcal: Math.round(g.pantryKcalLive(g.state.village)), boosts: L.boosts, floors: L.floors, rads: L.rads,
          online: !!((typeof g.fusionReactorOnline === 'function') && g.fusionReactorOnline()),
          hasAbility: hasAb, fusionReactor: !!s.fusionReactor,
          holder: h ? (h.who + ':' + h.vid) : null, holderExposure, holderSick, holderHealth, scholarExposure,
          abilities: (s.abilities || []).map(a => (a && a.id) || a) });
      } catch (e) {}
      return r;
    },
  });
  let result = null;
  await quietLog(async () => { result = await runDays(G, rigged, { days, sampleEvery: 30 }); });
  const L = G.state.pelletBoost || { rads: 0, boosts: 0, floors: 0, lastBoostDay: null };
  const burnsRadsSum = burns.reduce((a, b) => a + (b.boosted ? b.rads : 0), 0);
  // Exact: every paid burn costs exactly radsPerBoost.
  const everyBurnCostsRads = burns.every(b => !b.boosted || b.rads === RADS);
  // Exact: no burn moves the pantry (pre == post at the burn).
  const everyBoostPantryUntouched = burns.every(b => !b.boosted || b.pantryKcalAtBurn === b.pantryKcalAfterBurn);
  // Per-bearer: burn rads grouped by bearer key, each bearer's rads == 2 x their boosts.
  const perBearer = {};
  for (const b of burns) {
    if (!b.boosted) continue;
    perBearer[b.vid] = perBearer[b.vid] || { boosts: 0, rads: 0 };
    perBearer[b.vid].boosts += 1;
    perBearer[b.vid].rads += b.rads;
  }
  const perBearerMatches = Object.keys(perBearer).every(k => perBearer[k].rads === perBearer[k].boosts * RADS);
  // Heavy-use day: max boosts in any single day (from the daily ledger diffs).
  let maxBoostsPerDay = 0;
  for (let i = 1; i < daily.length; i++) maxBoostsPerDay = Math.max(maxBoostsPerDay, (daily[i].boosts || 0) - (daily[i - 1].boosts || 0));
  if (daily.length) maxBoostsPerDay = Math.max(maxBoostsPerDay, daily[0].boosts || 0);
  // Sickness observed: any daily snapshot where the holder is radiation-sick.
  const sicknessObserved = daily.some(d => d.holderSick && /radiation/i.test(String(d.holderSick)));
  const maxHolderExposure = daily.reduce((m, d) => Math.max(m, (d.holderExposure == null ? 0 : d.holderExposure)), 0);
  // Cure observed (recorded, not a bar): the holder's exposure drops by
  // more than the 1/day decay between consecutive daily snapshots.
  let cureObserved = false;
  for (let i = 1; i < daily.length; i++) {
    const a = daily[i - 1].holderExposure, b = daily[i].holderExposure;
    if (a != null && b != null && (a - b) > 1) { cureObserved = true; break; }
  }
  let need = null;
  try { need = globalThis.Scattering.calories.dailyNeed(G.state.scholar); } catch (e) {}
  const prog = (G.state.scholar || {}).prog || {};
  let deaths = 0, playerDeathDays = [];
  try {
    const tel = G.state.telemetry || [];
    deaths = tel.filter(t => t && t.type === 'death').length;
    playerDeathDays = tel.filter(t => t && t.type === 'death' && t.player).map(t => t.day);
  } catch (e) {}
  const holderEnd = G.state.fusionReactorHolder || null;
  const out = {
    panel, seed, days: result.days, endReason: result.endReason, over: !!G.over,
    villageLost: !!G.villageLost, won: !!G.won,
    scholarVidStart, scholarVidEnd: G.villagerId, scholarChanged: G.villagerId !== scholarVidStart,
    playerDeathDays, holderEnd: holderEnd ? (holderEnd.who + ':' + holderEnd.vid) : null,
    reactorOnlineAtStart, pantryKcalStart,
    reactorOnlineAtEnd: !!((typeof G.fusionReactorOnline === 'function') && G.fusionReactorOnline()),
    pantryKcalEnd: (() => { try { return Math.round(G.pantryKcalLive(G.state.village)); } catch (e) { return null; } })(),
    ledger: { rads: L.rads, boosts: L.boosts, floors: L.floors, lastBoostDay: L.lastBoostDay },
    burns, burnsRadsSum,
    ledgerMatchesBurns: L.rads === burnsRadsSum,
    everyBurnCostsRads, everyBoostPantryUntouched, perBearer, perBearerMatches,
    maxBoostsPerDay, heavyUseDay: maxBoostsPerDay >= 5,
    sicknessObserved, maxHolderExposure, cureObserved,
    feastSurgeUsed: !!prog.feastSurgeUsed, feastSurgeBy: prog.feastSurgeBy || null,
    bearerDailyNeed: need, deaths,
    daily,
  };
  console.log(JSON.stringify(out));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
