// scripts/pellet-boost-panel-20261108.js — pellet boost + cost panel driver.
// Prereg: evidence/2026-11-08/sim-pellet-boost-prereg.md (+ amendment A1).
//
// One case per process (never two games in one node process). Prints one
// JSON line to stdout; the shell loop collects lines into
// evidence/2026-11-08/sim-pellet-boost-panel.jsonl, and
// scripts/analyze-pellet-boost-panel-20261108.js judges the bars.
//
// Panels (all capable policy, 150d, standard competent-panel env):
//   bearer  — scholar is the reactor bearer, rich mixed pantry (PB-2/PB-4).
//             Bar: >=1 boost on >=4/8 seeds; ledger.spent equals the sum of
//             observed boost draws on every seed (exact accounting).
//   starved — scholar is the bearer, 30-kcal pantry (PB-3). Bar: 0 boosts
//             while starved, bearer never hungers, floors > 0. The panel
//             also records daily pantry + boosts, so a village that forages
//             its way back above COST is visible instead of silently
//             breaking the "0 boosts" bar.
//   pass    — P4 is NOT this driver: re-run the pelletpass-alone driver
//             (scripts/panel-pellet-pass-20261107.js) on this branch and diff
//             its JSONL against evidence/2026-11-07/sim-pelletpass-panel.jsonl.
//
// Usage:
//   node scripts/pellet-boost-panel-20261108.js --panel bearer --seed 7
//   node scripts/pellet-boost-panel-20261108.js --panel starved --seed 7
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

const COST = 50;
// Rich mixed pantry (the fusion-reactor test's mix): 50-kcal units first,
// then 100s, then 500s — so boosts draw whole units of each size across a run.
function richPantry() {
  return [
    { name: 'Dried berries', kcalEach: 50, units: 60, foodKind: 'plant', foodState: 'dried' },
    { name: 'Smoked turkey leg', kcalEach: 100, units: 30, foodKind: 'meat', foodState: 'smoked' },
    { name: 'Smoked turkey leg', kcalEach: 500, units: 20, foodKind: 'meat', foodState: 'smoked' },
  ];
}
function starvedPantry() {
  return [{ name: 'Dried berries', kcalEach: 30, units: 1, foodKind: 'plant', foodState: 'dried' }];
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
  const pantry = panel === 'starved' ? starvedPantry() : richPantry();
  const pantryKcalStart = pantry.reduce((a, p) => a + p.kcalEach * p.units, 0);
  // Observe every burn: the wrap logs what pelletBurn returns, so the
  // ledger can be checked against the observed draws (exact accounting).
  const burns = [];
  const daily = [];
  let reactorOnlineAtStart = false;
  const rigged = Object.assign({}, capable, {
    setup(g, ctx) {
      if (capable.setup) capable.setup(g, ctx);
      rigBearer(g, panel === 'starved' ? starvedPantry() : richPantry());
      reactorOnlineAtStart = !!(g.fusionReactorOnline && g.fusionReactorOnline());
      const orig = g.pelletBurn.bind(g);
      g.pelletBurn = function (vid, opts) {
        // Snapshot the pantry BEFORE the draw: the draw itself consumes
        // the unit, so a post-draw snapshot would miss the size just spent
        // (and understate the pantry for the starved check).
        let preKcal = null, preSizes = null;
        try {
          preKcal = Math.round(g.pantryKcalLive(g.state.village));
          preSizes = [...new Set(((g.state.village || {}).pantry || []).map(p => p.kcalEach))];
        } catch (e) {}
        const r = orig(vid, opts);
        try {
          burns.push({ day: (g.state.scholar || {}).day || 0, vid: vid == null ? 'p' : String(vid), boosted: !!r.boosted, spent: r.spent || 0, mult: r.mult || 1,
            pantryKcalAtBurn: preKcal, unitSizesAtBurn: preSizes });
        } catch (e) {}
        return r;
      };
    },
    daily(g, ctx) {
      const r = capable.daily && capable.daily(g, ctx);
      try {
        const L = g.state.pelletBoost || { spent: 0, boosts: 0, floors: 0 };
        const s = g.state.scholar || {};
        let hasAb = null;
        try { hasAb = !!(globalThis.Scattering.hasAbility && globalThis.Scattering.hasAbility(s, 'fusion_reactor')); } catch (e) {}
        const h = g.state.fusionReactorHolder || null;
        daily.push({ day: (g.state.scholar || {}).day || 0, pantryKcal: Math.round(g.pantryKcalLive(g.state.village)), boosts: L.boosts, floors: L.floors,
          online: !!((typeof g.fusionReactorOnline === 'function') && g.fusionReactorOnline()),
          hasAbility: hasAb, fusionReactor: !!s.fusionReactor,
          holder: h ? (h.who + ':' + h.vid) : null, abilities: (s.abilities || []).map(a => (a && a.id) || a) });
      } catch (e) {}
      return r;
    },
  });
  let result = null;
  await quietLog(async () => { result = await runDays(G, rigged, { days, sampleEvery: 30 }); });
  const L = G.state.pelletBoost || { spent: 0, boosts: 0, floors: 0, lastBoostDay: null };
  const burnsSpentSum = burns.reduce((a, b) => a + (b.boosted ? b.spent : 0), 0);
  // Exact: a boost never fires while the pantry is below COST at the
  // moment of the burn (foraging may lift the pantry above COST mid-run;
  // that is the mechanism working, not a starved boost).
  const boostsWhileStarved = burns.filter(b => b.boosted && (b.pantryKcalAtBurn || 0) < COST).length;
  // Exact: every boosted draw took exactly one whole unit of a size
  // present in the pantry at that moment.
  const everySpentWholeUnit = burns.every(b => !b.boosted || (b.unitSizesAtBurn || []).includes(b.spent));
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
    ledger: { spent: L.spent, boosts: L.boosts, floors: L.floors, lastBoostDay: L.lastBoostDay },
    burns, burnsSpentSum,
    ledgerMatchesBurns: L.spent === burnsSpentSum,
    everySpentWholeUnit,
    boostsWhileStarved,
    feastSurgeUsed: !!prog.feastSurgeUsed, feastSurgeBy: prog.feastSurgeBy || null,
    bearerDailyNeed: need, deaths,
    daily,
  };
  console.log(JSON.stringify(out));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
