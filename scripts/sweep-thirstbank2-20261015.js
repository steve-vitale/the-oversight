#!/usr/bin/env node
// thirstbank2 arm (run fleshout-b-20261015T1229Z ARM 2): the v1 thirst-safe shape,
// re-measured with the regime-aware hunger bar (#299's named next).
// KILL-PROTOCOL GUARD: INFO-SKIPs (exit 0) if the layer was deleted per a §14 kill.
const fs = require('fs'), path = require('path');
if (!fs.existsSync(path.join(__dirname, 'policies/thirstbank2.js'))) {
  console.log('INFO-SKIP: thirstbank2 layer deleted (killed 2026-10-15); nothing to test.');
  process.exit(0);
}

// sweep-thirstbank2-20261015.js — pilot sweep for the thirstbank2 arm (loop B ARM 2).
// 8 seeds x {belongseek, leadcourt} x {control, armed}, 180d death-aware,
// identical seeds both sides. Own control in the SAME sweep (#247).
//
// Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding; see
// evidence/2026-10-15/sim-thirstbank2-b.md):
// - PRIMARY: villager thirst deaths armed <= 2/16.
// - CO-PRIMARY: h1200 (scholar hunger-days, bar<1200) armed <= 0.75x control.
// - GUARDRAILS: median survival >= control-10d; national >= control-2/16;
//   scholar starveDeaths <= control+2; no new death mode (n>=3 armed-only).
// - GO: primary + co-primary + all guardrails. A miss is NO-GO (§14).
// - Confirm 12-16 seeds ONLY on pilot GO.
//
// Usage:
//   SMOKE=1 node scripts/sweep-thirstbank2-20261015.js   # instrument-honesty gate
//   node scripts/sweep-thirstbank2-20261015.js            # full pilot
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let bl = null;
try { bl = require('./policies/thirstbank2'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: thirstbank2 layer absent; sweep vacuous — see evidence/2026-10-15/sim-thirstbank2-b.md');
    process.exit(0);
  }
  throw e;
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const POLICIES = ['belongseek', 'leadcourt'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-thirstbank2');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'thirstbank2-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarTrust(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const t = (v.trust || {})[s.villagerId];
    return t === undefined ? 10 : t;
  } catch (e) { return null; }
}
function stdSnapshot(Game) {
  const out = { won: false, rank: 'village', tableWaiting: false };
  try { out.won = !!Game.won; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.tableWaiting = !!(Game.progState ? Game.progState() : {}).tableWaiting; } catch (e) {}
  return out;
}
function freshRow(d) {
  return { day: d, eaten: 0, mealNight: null, cap: 2400, minBar: null, trust: null, scholarVid: null };
}
function installScholarCensus(Game, M) {
  const oEat = Game.eat.bind(Game);
  Game.eat = function () {
    const before = (Game.state.scholar || {}).kcal || 0;
    const r = oEat.apply(this, arguments);
    try {
      const after = (Game.state.scholar || {}).kcal || 0;
      const d = gday(Game);
      if (after > before) { const row = M.row(d); row.eaten += Math.round(after - before); }
    } catch (e) {}
    return r;
  };
  const oSleep = Game.sleep.bind(Game);
  Game.sleep = function () {
    let dusk = 0;
    try {
      dusk = gday(Game);
      const row = M.row(dusk);
      const s = Game.state.scholar || {};
      row.minBar = row.minBar == null ? Math.round(s.kcal || 0) : Math.min(row.minBar, Math.round(s.kcal || 0));
      try { row.cap = Math.round(Game.kcalCap()); } catch (e) {}
      row.scholarVid = s.villagerId || null;
      M.vids.add(s.villagerId);
    } catch (e) {}
    const r = oSleep.apply(this, arguments);
    try {
      const mealNight = Math.round((Game.state.village || {}).lastPlayerMeal || 0);
      M.row(dusk).mealNight = mealNight;
      M.mealKcal += mealNight;
      const s2 = Game.state.scholar || {};
      const row2 = M.row(dusk + 1);
      const b = Math.round(s2.kcal || 0);
      row2.minBar = row2.minBar == null ? b : Math.min(row2.minBar, b);
    } catch (e) {}
    return r;
  };
}
function installExposureCounter(Game, X) {
  const oTravel = Game.travelTo.bind(Game);
  Game.travelTo = function (x, y) {
    try {
      const t = Game.tileAt ? Game.tileAt(x, y) : null;
      X.travelCalls++;
      if (t && t.type !== 'haven') X.wildVisits++;
    } catch (e) {}
    return oTravel(x, y);
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const armed of [false, true]) {
    if (armed) process.env.THIRSTBANK2 = '1'; else delete process.env.THIRSTBANK2;
    process.env.POLICY = 'belongseek';
    const base = bl.policyForRun();
    const side = armed ? 'armed' : 'control';
    check(`[${side}] named-export unwrap: policy.daily is a function`, typeof base.daily === 'function');
    let liveFlag = null;
    const policy = Object.assign({}, base);
    const os = base.setup;
    policy.setup = (G, ctx) => { liveFlag = bl.layerOn(); if (os) return os(G, ctx); };
    let dailyCalls = 0;
    const od = base.daily;
    policy.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
    const { Game } = await loadGame({ seed: 11, mode: 'thirstbank2-smoke', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
    check(`[${side}] layer-live marker == ${armed}`, liveFlag === armed, 'live=' + liveFlag);
    check(`[${side}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0);
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    check(`[${side}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
  }
  delete process.env.THIRSTBANK2;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive, layer-live marker honest — safe to measure.');
}

async function oneRun(seed, policyId, side) {
  process.env.POLICY = policyId;
  if (side === 'armed') process.env.THIRSTBANK2 = '1'; else delete process.env.THIRSTBANK2;
  const armed = side === 'armed';
  const { Game } = await loadGame({ seed, mode: `thirstbank2-${side}`, fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/Village meal|Half ration|half rations|Hunger gnaws|STARVING|went to sleep hungry|trust|discipline|takes from the pantry|Caught red-handed|watches you take|garden|Harvest|Nothing biting|fish|Nothing ripe|thirst|thirsty|cistern|creek water|dry/i.test(s) && beats.length < 4000)
        beats.push({ day: gday(Game), text: s.slice(0, 300) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const M = {
    rows: {}, vids: new Set(), mealKcal: 0,
    row(d) { return (this.rows[d] = this.rows[d] || freshRow(d)); },
  };
  installScholarCensus(Game, M);
  const X = { travelCalls: 0, wildVisits: 0 };
  installExposureCounter(Game, X);
  const base = bl.policyForRun();
  let runCtx = null, layerLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; layerLive = bl.layerOn(); if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, everTable: false, exiled: false, maxTrust: 0 };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      if (s.tableWaiting) hist.everTable = true;
      const sc = G.state.scholar || {};
      if (sc.exiled) hist.exiled = true;
      const t = scholarTrust(G);
      const row = M.row(gday(G));
      row.trust = t;
      if (t != null) hist.maxTrust = Math.max(hist.maxTrust, t);
      const b = Math.round(sc.kcal || 0);
      row.minBar = row.minBar == null ? b : Math.min(row.minBar, b);
      M.vids.add(sc.villagerId);
    } catch (e) {}
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 10 }); });
  if (layerLive !== armed) throw new Error(`layer-live marker mismatch: side=${side} live=${layerLive}`);
  let scholarDays = 0, starvedDays = 0, trustGe30 = 0, halfRation = 0, hungry1200 = 0, trustSamples = 0;
  for (const d of Object.keys(M.rows).map(Number).sort((a, b) => a - b)) {
    const r = M.rows[d];
    if (r.minBar == null) continue;
    scholarDays++;
    const ate = (r.eaten || 0) + (r.mealNight || 0);
    if (ate < 0.6 * (r.cap || 2400)) starvedDays++;
    if (r.minBar < 1200) hungry1200++;
    if (r.trust != null) {
      trustSamples++;
      if (r.trust >= 30) trustGe30++; else halfRation++;
    }
  }
  let takesSum = 0, givesSum = 0;
  try {
    const v = Game.state.village || {};
    for (const vid of M.vids) {
      takesSum += Math.round((v.takes || {})[vid] || 0);
      givesSum += Math.round((v.gives || {})[vid] || 0);
    }
  } catch (e) {}
  const deaths = {};
  let starveDeaths = 0, scholarDeaths = 0, thirstDeathsAll = 0, scholarThirstDeaths = 0, villagerThirstDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starveDeaths++;
      if (d.player) scholarDeaths++;
      if (/thirst/i.test(k)) {
        thirstDeathsAll++;
        if (d.player) scholarThirstDeaths++; else villagerThirstDeaths++;
      }
    }
  } catch (e) {}
  const end = stdSnapshot(Game);
  const L = policy._thirstbank2 || {};
  const wildPerDay = result.days > 0 ? X.wildVisits / result.days : 0;
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    scholarDays, starvedDays, trustGe30, halfRation, hungry1200, trustSamples, maxTrust: hist.maxTrust,
    mealKcal: M.mealKcal, takesSum, givesSum,
    refused: L.refused || 0, bulkRefused: L.bulkRefused || 0, hatchTakes: L.hatchTakes || 0,
    guaranteeLegs: L.guaranteeLegs || 0, guaranteeSkipped: L.guaranteeSkipped || 0, legYielded: L.legYielded || 0,
    gardenLegs: L.gardenLegs || 0, fishLegs: L.fishLegs || 0, forageLegs: L.forageLegs || 0,
    travelCalls: X.travelCalls, wildVisits: X.wildVisits, wildPerDay: +wildPerDay.toFixed(3),
    starveDeaths, scholarDeaths, thirstDeathsAll, scholarThirstDeaths, villagerThirstDeaths, deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2, everTable: hist.everTable,
    won: end.won, maxWave: result.maxWaveUnlocked, exiled: hist.exiled,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  fs.mkdirSync(BEATS, { recursive: true });
  fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats, null, 1));
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} h1200=${hungry1200} t>=30=${trustGe30} refused=${out.refused} hatch=${out.hatchTakes} legs=${out.guaranteeLegs}/yield=${out.legYielded} wild/d=${out.wildPerDay} thirstV=${out.villagerThirstDeaths} nat=${out.national} wave=${out.maxWave}`);
  return out;
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const seedFilter = process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : SEEDS;
  const onlyFilter = process.env.ONLY ? process.env.ONLY.split(';').map(p => p.split(',')) : null;
  const all = [];
  for (const policyId of POLICIES) {
    for (const side of ['control', 'armed']) {
      if (onlyFilter && !onlyFilter.some(([p, s]) => p === policyId && s === side)) continue;
      for (const seed of seedFilter) {
        try {
          all.push(await oneRun(seed, policyId, side));
        } catch (e) {
          console.log(`  [${side} ${policyId} s${seed}] ERROR ${e.message}`);
          all.push({ seed, policyId, side, error: String(e.message) });
        }
      }
    }
  }
  delete process.env.THIRSTBANK2;
  try {
    const have = {};
    for (const f of fs.readdirSync(EVID)) {
      const m = f.match(/^([a-z]+)-(control|armed)-s(\d+)\.json$/);
      if (m && f !== 'summary.json') {
        const r = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
        if (!r.error) have[`${m[1]}|${m[2]}|${m[3]}`] = r;
      }
    }
    for (const r of all) {
      if (!r.error) have[`${r.policyId}|${r.side}|${r.seed}`] = r;
    }
    all.length = 0;
    for (const k of Object.keys(have)) all.push(have[k]);
  } catch (e) { console.log('merge note: ' + e.message); }
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(all, null, 1));
  // Verdict table (pre-registered bars)
  const sum = (rows, k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
  const med = (rows) => { const s = rows.map(r => r.days).sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  for (const policyId of POLICIES) {
    const ctl = all.filter(r => r.policyId === policyId && r.side === 'control' && !r.error);
    const arm = all.filter(r => r.policyId === policyId && r.side === 'armed' && !r.error);
    if (!ctl.length || !arm.length) continue;
    const h1200r = sum(arm, 'hungry1200') / Math.max(1, sum(ctl, 'hungry1200'));
    const trustr = sum(arm, 'trustGe30') / Math.max(1, sum(ctl, 'trustGe30'));
    const wildr = (sum(arm, 'wildVisits') / Math.max(1, sum(arm, 'days'))) / Math.max(1e-9, (sum(ctl, 'wildVisits') / Math.max(1, sum(ctl, 'days'))));
    console.log(`\n== ${policyId}: h1200 ${sum(arm, 'hungry1200')}/${sum(ctl, 'hungry1200')}=${h1200r.toFixed(3)} (bar <=0.750) | trust>=30 ${sum(arm, 'trustGe30')}/${sum(ctl, 'trustGe30')}=${trustr.toFixed(3)} | thirstV ${sum(arm, 'villagerThirstDeaths')} (bar <=2) | medSurv ${med(arm)} vs ${med(ctl)} (bar >=${med(ctl) - 10}) | national ${sum(arm, 'national')}/${arm.length} vs ${sum(ctl, 'national')}/${ctl.length} (bar >=${sum(ctl, 'national') - 2}) | starveDeaths ${sum(arm, 'starveDeaths')} vs ${sum(ctl, 'starveDeaths')} (bar <=ctl+2) | wild/d ratio ${wildr.toFixed(3)}`);
  }
  const ctlAll = all.filter(r => r.side === 'control' && !r.error);
  const armAll = all.filter(r => r.side === 'armed' && !r.error);
  if (ctlAll.length && armAll.length) {
    const h1200r = sum(armAll, 'hungry1200') / Math.max(1, sum(ctlAll, 'hungry1200'));
    const trustr = sum(armAll, 'trustGe30') / Math.max(1, sum(ctlAll, 'trustGe30'));
    console.log(`\n== POOLED: h1200 ${sum(armAll, 'hungry1200')}/${sum(ctlAll, 'hungry1200')}=${h1200r.toFixed(3)} (bar <=0.750) | trust>=30 ${sum(armAll, 'trustGe30')}/${sum(ctlAll, 'trustGe30')}=${trustr.toFixed(3)} | thirstV ${sum(armAll, 'villagerThirstDeaths')} (bar <=2) | medSurv ${med(armAll)} vs ${med(ctlAll)} | national ${sum(armAll, 'national')}/${armAll.length} vs ${sum(ctlAll, 'national')}/${ctlAll.length} | starveDeaths ${sum(armAll, 'starveDeaths')} vs ${sum(ctlAll, 'starveDeaths')} (bar <=ctl+2)`);
  }
  console.log('\nPilot complete. See evidence/2026-10-15/perseed-thirstbank2/summary.json');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
