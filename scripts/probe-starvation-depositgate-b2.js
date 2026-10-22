#!/usr/bin/env node
// probe-starvation-depositgate-b2.js — #798 starvation-mechanism probe.
//
// WHO eats the eased share vs who starves; timing of starvation deaths vs
// engagement timing. Instruments the armed side (DEPOSITGATE=1) on the 8
// pilot seeds x {leadfeast, belongfeast} (identical seeds to the b-run armed
// side) and records, per run:
//   - per-villager per-day intake kcal by route (depositgate-eased, npc-pantry,
//     personal-work, desperation) via a recordHarvestIntake monkey-patch
//   - starvation deaths (day, who) via a registerDeath wrap
//   - daily: pantry kcal, plentiful flag, eased kcal that day, per-villager hunger
//
// Pre-registered decision rule lives in evidence/2026-10-22/sim-depositgate-b2.md.
// Env: FEASTSCALE_R13=1, SEATDRIVE=0, DEPOSITGATE=1 (all asserted).
// SEEDS="9201,...,9208" POLICY=leadfeast|belongfeast DAYS=180 OUT=<path>
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: need FEASTSCALE_R13=1 SEATDRIVE=0 DEPOSITGATE=1');
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'belongfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.belongfeast;
const SEEDS = (process.env.SEEDS || '9201,9202,9203,9204,9205,9206,9207,9208')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('evidence/2026-10-22/sweeps/probe-starvation-b2-' + POLICY_ID + '.json');
const ROUTES = new Set(['depositgate-eased', 'npc-pantry', 'personal-work', 'desperation', 'refused-surplus']);

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'probe-starve-b2-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const P = {
    intake: [],      // {day, who, route, kcal}
    starveDeaths: [],// {day, who}
    allDeaths: [],   // {day, who, cause}
    daily: [],       // {day, pantryKcal, plentiful, easedToday, hunger:{id:h}}
  };

  // --- per-villager per-route intake ---
  const oIntake = Game.recordHarvestIntake;
  if (typeof oIntake === 'function') Game.recordHarvestIntake = function (eater, portions, route) {
    const r = oIntake.apply(this, arguments);
    try {
      if (ROUTES.has(String(route))) {
        const who = typeof eater === 'string' ? eater : (eater && eater.who);
        const kcal = (portions || []).reduce((n, p) => n + (Number(p.kcal) || 0), 0);
        if (kcal > 0) P.intake.push({ day: (Game.state.scholar || {}).day || 0, who: String(who || '?').slice(0, 24), route: String(route), kcal: Math.round(kcal) });
      }
    } catch (e) {}
    return r;
  };

  // --- deaths ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?').slice(0, 24);
        const day = (Game.state.scholar || {}).day || 0;
        const cause = String((opts && opts.cause) || '?').toLowerCase().slice(0, 32);
        P.allDeaths.push({ day, who, cause });
        if (/starv/.test(cause)) P.starveDeaths.push({ day, who });
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  // --- daily sampler via policy.daily wrap ---
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try {
      const v = (G.state || {}).village || {};
      const day = (G.state.scholar || {}).day || 0;
      let pk = 0;
      try { pk = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) {}
      let plentiful = false;
      try { plentiful = G.pantryFreshDays() > 4; } catch (e) {}
      let easedToday = 0;
      try {
        const rec = ((v._depositGate || {}).days || {})[day] || {};
        easedToday = (rec.shareEased || 0) + (rec.returnEased || 0) + (rec.bigHaulEased || 0) + (rec.tributeWaived || 0);
      } catch (e) {}
      const hunger = {};
      for (const id of (v.roster || [])) {
        try { hunger[String(id).slice(0, 24)] = Math.round(G.npcNeeds(id).hunger || 0); } catch (e) {}
      }
      P.daily.push({ day, pantryKcal: Math.round(pk), plentiful, easedToday: Math.round(easedToday), hunger });
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const result = await runDays(Game, policy, { days, manifest: null });

  // per-villager eased lifetime + per-capita mean
  const easedByWho = {};
  let easedTotal = 0;
  for (const it of P.intake) {
    if (it.route === 'depositgate-eased') {
      easedByWho[it.who] = (easedByWho[it.who] || 0) + it.kcal;
      easedTotal += it.kcal;
    }
  }
  const eaters = Object.keys(easedByWho).length;
  const perCapita = eaters ? easedTotal / eaters : 0;

  // transition analysis per starvation death
  const easedDays = new Set(P.daily.filter(d => d.easedToday > 0).map(d => d.day));
  const starveAnalysis = P.starveDeaths.map(sd => {
    const drow = P.daily.find(d => d.day === sd.day) || {};
    const priorEased = [...easedDays].filter(d => d < sd.day).length;
    const victimEased = easedByWho[sd.who] || 0;
    return {
      day: sd.day, who: sd.who,
      pantryPlentifulAtDeath: !!drow.plentiful,
      pantryKcalAtDeath: drow.pantryKcal || 0,
      priorEasedDays: priorEased,
      transitionDeath: !drow.plentiful && priorEased >= 10,
      victimEasedKcal: Math.round(victimEased),
      victimEasedVsPerCapita: perCapita > 0 ? +(victimEased / perCapita).toFixed(3) : null,
    };
  });

  // eater hunger profile: on days a villager received eased kcal, what was
  // their hunger vs the hungriest villager that day?
  const eaterHunger = [];
  const intakeByDayWho = {};
  for (const it of P.intake) {
    if (it.route !== 'depositgate-eased') continue;
    const k = it.day + '|' + it.who;
    intakeByDayWho[k] = (intakeByDayWho[k] || 0) + it.kcal;
  }
  for (const k of Object.keys(intakeByDayWho)) {
    const [day, who] = k.split('|');
    const drow = P.daily.find(d => d.day === Number(day));
    if (!drow) continue;
    const hs = Object.values(drow.hunger || {});
    const eaterH = drow.hunger[who];
    if (eaterH == null || !hs.length) continue;
    eaterHunger.push({
      day: Number(day), who, eaterHunger: eaterH,
      maxHunger: Math.max(...hs),
      needyCoexists: hs.some(h => h > 50),
      eaterFed: eaterH <= 30,
    });
  }

  return {
    seed,
    days: result.days, endReason: result.endReason,
    starveDeaths: starveAnalysis,
    easedTotal: Math.round(easedTotal), easedDays: easedDays.size, perCapitaEased: Math.round(perCapita),
    eaterHunger,
    nStarve: P.starveDeaths.length, nDeaths: P.allDeaths.length,
  };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const r = await oneRun(seed, DAYS);
    rows.push(r);
    console.log(`done seed=${seed} days=${r.days} end=${r.endReason} starveDeaths=${r.nStarve} easedTotal=${r.easedTotal} easedDays=${r.easedDays}`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: 'armed', policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', DEPOSITGATE: '1' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('PROBE CRASH', e); process.exit(2); });
