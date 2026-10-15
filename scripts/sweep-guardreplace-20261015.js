#!/usr/bin/env node
// scripts/sweep-guardreplace-20261015.js — PILOT sweep for the guardreplace
// layer (loop B ARM, sim-findings #338, 2026-10-15).
//
// Sides: CONTROL (base leadcourt/belongseek, GUARDREPLACE unset) vs ARMED
// (guardreplace-wrapped, GUARDREPLACE=1). 8 seeds x {leadcourt, belongseek} x
// {control, armed} = 32 runs, 180d death-aware, identical seeds across
// sides (OWN control in the SAME sweep — never an inherited baseline,
// sim-findings #247).
//
// Measurement: the distrhalf instrument (scripts/distrhalf-lib-20261015.js)
// attributes every hunger-day; PRIMARY is the binding pair (scholar
// hunger-days AND scholar starvation-deaths).
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY (pair, both must hold): scholar hunger-days armed <= 0.80x
//     control (pooled) AND scholar starvation-deaths armed <= control+2.
//   CO-PRIMARY: guard fires >= 8 blocks/run (mechanism honesty).
//   GUARDRAILS: median survival armed >= control-10d; national armed >=
//     control-2/16; no new death mode with n>=3 on the armed side absent on
//     control; takes/day <= 1 hard (in the layer).
//   GO -> commit the layer for landing. MISS -> layer deleted per kill
//     protocol, evidence + instruments only.
//   Horizon: 180d death-aware (+10d tail). This is the PILOT (8 seeds); a
//     confirm (12-16) only follows a GO.
//   Det-gate: scripts/test-guardreplace-20261015.js PART C green first.
//   SMOKE=1: 1 seed (belongseek s11) x 25d — instrument-honesty asserts.
//   Sense-test: 2-3 block+replacement episodes read in the transcripts.
//
// Outputs: sweep JSON + per-seed JSON + transcripts (hunger beats + the
// layer's block/trip/meal voice lines for the sense-test).
//
// Usage:
//   SMOKE=1 node scripts/sweep-guardreplace-20261015.js
//   node scripts/sweep-guardreplace-20261015.js
//   OUT=... PERSEED_DIR=... TRANSCRIPT_DIR=... node scripts/sweep-guardreplace-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installDistrHalf, finalizeDistrHalf } = require('./distrhalf-lib-20261015');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',');
const SIDES = (process.env.SIDES || 'both').split(',');
const DAYS = Number(process.env.DAYS || 180);
const SMOKE = process.env.SMOKE === '1';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; }
// trailing-7d net (engine sign: gives - takes) from the REAL histories.
function trailingNet7(Game) {
  try {
    const v = Game.state.village || {};
    const vid = Game.villagerId;
    const day = gday(Game);
    let takes = 0, gives = 0;
    for (const e of (((v.takeHist || {})[vid]) || [])) if (e && (e.day || 0) >= day - 6) takes += (e.kcal || 0);
    for (const e of (((v.giveHist || {})[vid]) || [])) if (e && (e.day || 0) >= day - 6) gives += (e.kcal || 0);
    return Math.round(gives - takes);
  } catch (e) { return 0; }
}
// lifetime net (engine sign) — the diagnostic for the real tax bar.
function lifetimeNet(Game) {
  try {
    const v = Game.state.village || {};
    const vid = Game.villagerId;
    return Math.round(((v.gives || {})[vid] || 0) - ((v.takes || {})[vid] || 0));
  } catch (e) { return 0; }
}

function policyFor(pid, armed) {
  if (armed) process.env.GUARDREPLACE = '1'; else delete process.env.GUARDREPLACE;
  const grPath = './policies/guardreplace';
  delete require.cache[require.resolve(grPath)];
  const gr = require(grPath);
  const base = require('./policies/' + pid)[pid];
  return armed ? gr.wrapPolicy(base) : base;
}

async function oneRun(seed, pid, armed, tdir) {
  const side = armed ? 'armed' : 'control';
  const policy = policyFor(pid, armed);
  const { Game } = await loadGame({ seed, mode: 'guardreplace-' + side });
  await setupGame(Game);
  const track = installDistrHalf(Game);
  // Beat capture: hunger beats + the layer's block/trip/meal voice lines (sense-test).
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/Half ration|half ration|STARVING|pantry is empty|packed lunch|packed this morning|duck into the hall|ledger's running red|for the road|gave nothing today|Trouble on the trail|eaten on the trail|pantry shelves are bare|went to sleep hungry|down to crumbs/i.test(s) && beats.length < 8000)
        beats.push({ day: gday(Game), text: s.slice(0, 500) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const wrapped = Object.assign({}, policy);
  const origDaily = policy.daily, origUpkeep = policy.upkeep;
  let dailyCalls = 0, ctxRef = null;
  let net7BelowDays = 0; // days ending with trailing-7d net < -5000 (diagnostic)
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1 };
  wrapped.upkeep = (G, ctx) => { ctxRef = ctx; return origUpkeep ? origUpkeep(G, ctx) : undefined; };
  wrapped.daily = (G, ctx) => {
    dailyCalls++;
    ctxRef = ctx;
    try { track.dawn(G); } catch (e) {}
    try {
      if (trailingNet7(G) < -5000) net7BelowDays++;
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (G.unlockedWave) hist.maxWave = Math.max(hist.maxWave, G.unlockedWave() || 1);
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };
  wrapped.setup = undefined;
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const rep = finalizeDistrHalf(Game, track);
  const deaths = {};
  let starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starveDeaths++;
    }
  } catch (e) {}
  Game.say = oSay;
  try { track.uninstall(); } catch (e) {}
  if (tdir) {
    try {
      fs.mkdirSync(tdir, { recursive: true });
      fs.writeFileSync(path.join(tdir, `guardreplace-${side}-${pid}-s${seed}.txt`),
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  const hungerDays = rep.hungerDays;
  const scholarDays = hungerDays.filter(h => h.subject === 'scholar');
  const ctx = ctxRef || {};
  const endNet7 = trailingNet7(Game);
  const endLifeNet = lifetimeNet(Game);
  delete process.env.GUARDREPLACE;
  return {
    policy: pid, seed, side, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: end.won ? 1 : 0, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    waveReach: hist.maxWave,
    deaths, starveDeaths,
    dailyCalls,
    hungerDays: hungerDays.length,
    scholarHungerDays: scholarDays.length,
    villagerHungerDays: hungerDays.length - scholarDays.length,
    byChannel: rep.byChannel,
    unattributed: rep.unattributed,
    // layer audit (armed side; control has none)
    grTriggers: ctx._grTriggers || 0,
    grEnters: ctx._grEnters || 0,
    grTakes: ctx._grTakes || 0,
    grBlocks: ctx._grBlocks || 0,
    grStandDowns: ctx._grStandDowns || 0,
    grWildTrips: ctx._grWildTrips || 0,
    grWildKcal: Math.round(ctx._grWildKcal || 0),
    grWhiffs: ctx._grWhiffs || 0,
    grReplMeals: ctx._grReplMeals || 0,
    grReplKcal: Math.round(ctx._grReplKcal || 0),
    grMeals: ctx._grMeals || 0,
    grKcalEaten: Math.round(ctx._grKcalEaten || 0),
    grSorted: ctx._grSorted || 0,
    grErrs: ctx._grErrs || 0,
    grDawnRows: (ctx._grLog || []).length,
    grMealRows: (ctx._grMealLog || []).length,
    // ledger state (both sides)
    endNet7, endLifeNet, net7BelowDays,
  };
}

async function smokeGate() {
  console.log('== guardreplace SMOKE ==');
  const r = await oneRun(11, 'belongseek', true, null);
  const fails = [];
  const check = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  check('policy.daily fired', r.dailyCalls >= 20, `calls=${r.dailyCalls}`);
  check('distrhalf instrument ran', r.hungerDays >= 0 && r.unattributed !== undefined, `hunger=${r.hungerDays} unattrib=${r.unattributed}`);
  check('dawn machinery ran hot', r.grDawnRows >= 15, `dawnRows=${r.grDawnRows}`);
  check('layer audit log consistent', r.grTriggers >= r.grTakes, `triggers=${r.grTriggers} takes=${r.grTakes}`);
  check('blocks consistent with trip outcomes', r.grBlocks === 0 || r.grWildTrips >= r.grBlocks,
    `blocks=${r.grBlocks} trips=${r.grWildTrips}`);
  check('takes/meals/kcal consistent', r.grTakes >= r.grMeals,
    `takes=${r.grTakes} meals=${r.grMeals} kcal=${r.grKcalEaten} (the base eats the packed lunch at dawn via competentEat; mid-day is the fallback)`);
  check('replacement calories hauled', r.grBlocks === 0 || r.grWildKcal > 0,
    `blocks=${r.grBlocks} wildKcal=${r.grWildKcal}`);
  check('replacement pairing: blocks <= trips (every block attempted a trip)', r.grWildTrips >= r.grBlocks,
    `blocks=${r.grBlocks} trips=${r.grWildTrips}`);
  check('ledger reads present', typeof r.endNet7 === 'number' && typeof r.endLifeNet === 'number',
    `endNet7=${r.endNet7} endLifeNet=${r.endLifeNet}`);
  check('no layer errors', r.grErrs === 0, `errs=${r.grErrs}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

(async () => {
  if (SMOKE) { await smokeGate(); return; }
  const sides = SIDES.includes('both') ? ['control', 'armed'] : SIDES;
  console.log(`== guardreplace pilot: ${SEEDS.length} seeds x ${POLICIES.length} policies x ${sides.length} sides, ${DAYS}d ==`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of sides) {
        const armed = side === 'armed';
        const r = await oneRun(seed, pid, armed, TRANSCRIPT_DIR);
        runs.push(r);
        console.log(`  [${side}/${pid} s${seed}] days=${r.days} end=${r.endReason} ` +
          `scholarHunger=${r.scholarHungerDays} starve=${r.starveDeaths} ` +
          `grTakes=${r.grTakes} grBlocks=${r.grBlocks} grStandDowns=${r.grStandDowns} ` +
          `grTrips=${r.grWildTrips} grReplMeals=${r.grReplMeals} grReplKcal=${r.grReplKcal} ` +
          `endNet7=${r.endNet7} endLifeNet=${r.endLifeNet} wave=${r.waveReach} rank=${r.maxRank}`);
        if (PERSEED_DIR) {
          try {
            fs.mkdirSync(PERSEED_DIR, { recursive: true });
            fs.writeFileSync(path.join(PERSEED_DIR, `guardreplace-${side}-${pid}-s${seed}.json`),
              JSON.stringify(r, null, 1));
          } catch (e) {}
        }
      }
    }
  }
  const pool = (side) => runs.filter(r => r.side === side);
  const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
  const med = (rs, k) => { const v = rs.map(r => r[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  const rep = {};
  for (const side of sides) {
    const rs = pool(side);
    rep[side] = {
      n: rs.length,
      scholarHungerDays: sum(rs, 'scholarHungerDays'),
      hungerDays: sum(rs, 'hungerDays'),
      starveDeaths: sum(rs, 'starveDeaths'),
      medianDays: med(rs, 'gameDays'),
      national: sum(rs, 'national'),
      table: sum(rs, 'table'),
      won: sum(rs, 'won'),
      wave4: rs.filter(r => r.waveReach >= 4).length,
      wave5: rs.filter(r => r.waveReach >= 5).length,
      grTakes: sum(rs, 'grTakes'),
      grBlocks: sum(rs, 'grBlocks'),
      grStandDowns: sum(rs, 'grStandDowns'),
      grWildTrips: sum(rs, 'grWildTrips'),
      grWildKcal: sum(rs, 'grWildKcal'),
      grWhiffs: sum(rs, 'grWhiffs'),
      grReplMeals: sum(rs, 'grReplMeals'),
      grReplKcal: sum(rs, 'grReplKcal'),
      grMeals: sum(rs, 'grMeals'),
      grKcalEaten: sum(rs, 'grKcalEaten'),
      grTriggers: sum(rs, 'grTriggers'),
      grErrs: sum(rs, 'grErrs'),
      endNet7Below: rs.filter(r => r.endNet7 < -5000).length,
      net7BelowDays: sum(rs, 'net7BelowDays'),
      medianEndNet7: med(rs, 'endNet7'),
      medianEndLifeNet: med(rs, 'endLifeNet'),
      deaths: {},
    };
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths)) rep[side].deaths[k] = (rep[side].deaths[k] || 0) + v;
  }
  let verdict = 'NO-GO', goDetail = '';
  if (sides.includes('control') && sides.includes('armed')) {
    const c = rep.control, a = rep.armed;
    // PRIMARY (binding pair): hunger-days ratio AND starvation deaths.
    const hungerRatio = c.scholarHungerDays > 0 ? (a.scholarHungerDays / c.scholarHungerDays) : (a.scholarHungerDays === 0 ? 0 : Infinity);
    const gHunger = hungerRatio <= 0.80;
    const gStarve = a.starveDeaths <= c.starveDeaths + 2;
    const gPrimary = gHunger && gStarve;
    // CO-PRIMARY: the guard actually engages (v2: blocks + stand-downs are
    // both red-day decisions; and every block is paired with a secured
    // replacement — a bare block is a mechanism failure).
    const decisionsPerRun = a.n > 0 ? (a.grBlocks + a.grStandDowns) / a.n : 0;
    const gEngages = decisionsPerRun >= 8;
    const gPaired = a.grBlocks === 0 || a.grReplKcal > 0;
    const gCoPrimary = gEngages && gPaired;
    // GUARDRAILS (all binding).
    const gSurv = a.medianDays >= c.medianDays - 10;
    const gNat = a.national >= c.national - 2;
    const newModes = Object.keys(a.deaths).filter(k => a.deaths[k] >= 3 && !(c.deaths[k] > 0));
    const gModes = newModes.length === 0;
    verdict = (gPrimary && gCoPrimary && gSurv && gNat && gModes) ? 'GO' : 'NO-GO';
    goDetail = `PRIMARY pair: hunger ratio=${hungerRatio.toFixed(3)} (GO<=0.80): ${gHunger}; ` +
      `starveDeaths ${a.starveDeaths} vs ${c.starveDeaths} (GO<=ctrl+2): ${gStarve}; ` +
      `CO-PRIMARY decisions/run=${decisionsPerRun.toFixed(1)} (GO>=8): ${gEngages} ` +
      `(blocks=${a.grBlocks} standDowns=${a.grStandDowns}); ` +
      `blocks paired with replacement: ${gPaired} (replKcal=${a.grReplKcal}); ` +
      `median ${a.medianDays}d vs ${c.medianDays}d (GO>=ctrl-10): ${gSurv}; ` +
      `national ${a.national} vs ${c.national} (GO>=ctrl-2): ${gNat}; ` +
      `new death modes: ${newModes.length ? newModes.join(',') : 'none'}: ${gModes}`;
  }
  const sweep = {
    label: 'guardreplace-pilot', seeds: SEEDS, policies: POLICIES, sides, days: DAYS,
    when: new Date().toISOString(), runs, pooled: rep,
    go: { verdict, detail: goDetail },
    prereg: 'PRIMARY pair: scholar hunger-days armed <= 0.80x control AND scholar starvation-deaths <= control+2; CO-PRIMARY (v2): red-day decisions/run (blocks+standDowns) >= 8 AND every block paired with a secured replacement; guardrails: median>=ctrl-10d, national>=ctrl-2, no new death mode n>=3, takes/day<=1 hard',
  };
  if (OUT) { try { fs.writeFileSync(OUT, JSON.stringify(sweep, null, 1)); } catch (e) {} }
  console.log('\n-- pooled --');
  for (const side of sides) {
    const p = rep[side];
    console.log(`  ${side}: scholarHunger=${p.scholarHungerDays} hunger=${p.hungerDays} ` +
      `starveDeaths=${p.starveDeaths} median=${p.medianDays}d national=${p.national}/16 table=${p.table} ` +
      `won=${p.won} wave4=${p.wave4} wave5=${p.wave5} grTakes=${p.grTakes} grBlocks=${p.grBlocks} ` +
      `grTrips=${p.grWildTrips} grWhiffs=${p.grWhiffs} grReplMeals=${p.grReplMeals} grReplKcal=${p.grReplKcal} ` +
      `endNet7below=${p.endNet7Below} medEndNet7=${p.medianEndNet7} medEndLifeNet=${p.medianEndLifeNet}`);
    console.log(`    deaths: ${JSON.stringify(p.deaths)}`);
  }
  console.log(`\nVERDICT: ${verdict} — ${goDetail}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
