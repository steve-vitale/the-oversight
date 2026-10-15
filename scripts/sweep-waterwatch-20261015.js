#!/usr/bin/env node
// sweep-waterwatch-20261015.js — SCHOLAR CISTERN-WATCH measurement sweep
// (loop B, food-economy ARM 2, 2026-10-15, sim-findings #291).
//
// POLICY LEVER — scripts/policies/waterwatch.js (WATERWATCH=1); zero src/js.
// 8 seeds x {leadcourt, belongseek} x {armed, control}, 180d death-aware,
// identical seeds both sides. BOTH sides install the rangedehy instrument
// (scripts/rangedehy-lib-20261015.js — proven trajectory-neutral, A/A
// byte-identical at full horizon) for verb/death/daily-snapshot telemetry;
// the armed side additionally wraps the policy with the waterwatch layer.
//
// PRE-REGISTERED (§§9-12, 14 — the pilot judges; a miss is NO-GO):
//   PRIMARY: cistern 0/0 days (armed) <= 0.5 x cistern 0/0 days (control)
//            AND villager thirst deaths (armed) <= control (expect <= 2).
//   CO-PRIMARY: scholar water-duty acts (creekFills + boilsOk, layer ledger)
//            >= 1/day on dry-cistern days the scholar was at haven
//            (dry = snapshot clean < 2*roster; join on scholar day).
//   GUARDRAILS: median survival >= control-10d; national >= control-2/16;
//            no new death mode (n>=3).
//   GO -> 12-16 seed confirm. MISS -> layer deleted per kill protocol,
//   evidence-only landing.
//
// KILL PROTOCOL: if scripts/policies/waterwatch.js is absent, INFO-SKIP
// (exit 0), never MODULE_NOT_FOUND.
//
// Usage:
//   SMOKE=1 node scripts/sweep-waterwatch-20261015.js   # 1 seed x 2 policies x 2 sides x 15d
//   node scripts/sweep-waterwatch-20261015.js           # full pilot (32 runs)
'use strict';
const fs = require('fs');
const path = require('path');

let WW;
try {
  WW = require('./policies/waterwatch.js');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/waterwatch.js absent (layer deleted per kill protocol).');
  process.exit(0);
}
// named-export unwrap (#69)
for (const n of ['waterwatch', 'layerOn', 'watchState', 'wwState']) {
  if (typeof WW[n] !== 'function') { console.error('FATAL: missing named export ' + n); process.exit(2); }
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installRangeDehy } = require('./rangedehy-lib-20261015');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');

const POLICIES = { belongseek, leadcourt };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-waterwatch');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdMetrics(Game, result) {
  const out = { won: false, rank: 'village', tableWaiting: false, maxWave: 1, gameDays: 0, deaths: {} };
  try { out.won = !!Game.won; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.tableWaiting = !!(Game.progState ? Game.progState() : {}).tableWaiting; } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { out.gameDays = Game.state.scholar.day || 0; } catch (e) {}
  try {
    for (const d of ((result && result.samples && result.samples.deaths) || [])) {
      const k = (d.kind || 'unknown') + ':' + (d.cause || 'unknown');
      out.deaths[k] = (out.deaths[k] || 0) + 1;
    }
  } catch (e) {}
  return out;
}

async function oneRun(seed, policyId, days, armed) {
  if (armed) process.env.WATERWATCH = '1'; else delete process.env.WATERWATCH;
  const base = POLICIES[policyId];
  const policy = WW.waterwatch(base);
  const { Game } = await loadGame({ seed, mode: 'waterwatch-' + policyId + (armed ? '-a' : '-c'), fullTelemetry: false });
  await setupGame(Game);
  const track = installRangeDehy(Game); // both sides: trajectory-neutral instrument
  // haven-well vs wild fill receipt (the mechanism: zero well draw on watch days)
  const fillLog = [];
  try {
    const ofw = Game.fillWater.bind(Game);
    const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
    Game.fillWater = function () {
      const b = ((Game.state.scholar || {}).water || []).length;
      const r = ofw.apply(this, arguments);
      const a = ((Game.state.scholar || {}).water || []).length;
      if (a > b) {
        let t = null;
        try { t = Game.playerTile ? Game.playerTile() : null; } catch (e) {}
        fillLog.push({ day: gday(), haven: !!(t && t.type === 'haven'), n: a - b });
      }
      return r;
    };
  } catch (e) {}
  let dailyCalls = 0, upkeepCalls = 0;
  const od = policy.daily, ou = policy.upkeep;
  const pwrap = Object.assign({}, policy);
  if (od) pwrap.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
  if (ou) pwrap.upkeep = (G, ctx) => { upkeepCalls++; return ou(G, ctx); };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, pwrap, { days, sampleEvery: 10 }); });
  const m = stdMetrics(Game, result);
  const fin = track.finalize();

  // ---- primary: cistern 0/0 days (from instrument daily snapshots) ----
  let zeroDays = 0;
  for (const s of (fin.daily || [])) {
    const c = s.cistern || {};
    if ((c.clean || 0) < 1 && (c.dirty || 0) < 1) zeroDays++;
  }

  // ---- co-primary: scholar water-duty acts on dry-cistern at-haven days ----
  // dry day: snapshot clean < 2*roster && snapshot atHaven. acts: layer
  // ledger creekFills + boilsOk joined on scholar day.
  const ledger = (Game._waterwatch && Game._waterwatch.days) || {};
  let dryDaysAtHaven = 0, acts = 0, havenFillsDry = 0, wildFillsDry = 0;
  const dryDayList = [];
  for (const s of (fin.daily || [])) {
    const rosterN = Math.max(1, s.rosterN || 12);
    const c = s.cistern || {};
    if ((c.clean || 0) < 2 * rosterN && s.atHaven) {
      dryDaysAtHaven++;
      const rec = ledger[s.day];
      const a = rec ? (rec.creekFills || 0) + (rec.boilsOk || 0) : 0;
      acts += a;
      let hf = 0, wf = 0;
      for (const f of fillLog) {
        if (f.day === s.day) { if (f.haven) hf += f.n; else wf += f.n; }
      }
      havenFillsDry += hf; wildFillsDry += wf;
      dryDayList.push({ day: s.day, acts: a, havenFills: hf, wildFills: wf, watch: !!(rec && rec.watch), reason: rec && rec.reason });
    }
  }

  // ---- layer ledger totals ----
  const led = { creekFills: 0, boilsOk: 0, boilsRefused: 0, beats: 0, beatKinds: {},
    watchDays: 0, skippedAway: 0, noWaterTile: 0, noFire: 0, walkFailed: 0, atHavenOnce: 0, legErrors: 0,
    dehyDeathSeen: false, deathName: null };
  try {
    const st = Game._waterwatch;
    if (st) {
      led.dehyDeathSeen = !!st.dehyDeathSeen; led.deathName = st.deathName || null;
      led.legErrors = st.legErrors || 0;
      for (const k of Object.keys(st.days || {})) {
        const r = st.days[k];
        if (r.watch) led.watchDays++;
        led.creekFills += r.creekFills || 0; led.boilsOk += r.boilsOk || 0;
        led.boilsRefused += r.boilsRefused || 0; led.beats += r.beats || 0;
        for (const bk of (r.beatKinds || [])) led.beatKinds[bk] = (led.beatKinds[bk] || 0) + 1;
        led.skippedAway += r.skippedAway || 0; led.noWaterTile += r.noWaterTile || 0;
        led.noFire += r.noFire || 0; led.walkFailed += r.walkFailed || 0;
        if (r.atHavenOnce) led.atHavenOnce++;
      }
    }
  } catch (e) {}

  const thirstDeaths = m.deaths['villager:thirst'] || 0;
  return {
    seed, policyId, armed, days: m.gameDays, dailyCalls, upkeepCalls,
    layerLive: !!policy._waterwatchLive,
    won: m.won, rank: m.rank, national: (RANK_ORDER[m.rank] || 0) >= 2 ? 1 : 0,
    tableWaiting: m.tableWaiting, maxWave: m.maxWave, deaths: m.deaths,
    thirstDeaths,
    dehyDeaths: fin.nDehydration,
    cisternZeroDays: zeroDays,
    dryDaysAtHaven, coActs: acts,
    coPrimary: dryDaysAtHaven ? +(acts / dryDaysAtHaven).toFixed(3) : null,
    havenFillsDry, wildFillsDry,
    havenFillsDryPerDay: dryDaysAtHaven ? +(havenFillsDry / dryDaysAtHaven).toFixed(3) : null,
    dryDayList: dryDayList.slice(0, 40),
    ledger: led,
    verbsAll: fin.verbsAll, refusedFills: fin.refusedFills,
    rangedDays: fin.rangedDays, maxMapDist: fin.maxMapDist,
    instrErrors: (fin.instrErrors || []).length,
  };
}

async function main() {
  const smoke = process.env.SMOKE === '1';
  const seeds = smoke ? [11] : SEEDS;
  const days = smoke ? 15 : DAYS;
  const policyIds = Object.keys(POLICIES);
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  const t0 = Number(process.hrtime.bigint()); // Date.now is frozen by the harness clock
  for (const policyId of policyIds) {
    for (const seed of seeds) {
      for (const armed of [false, true]) {
        const side = armed ? 'armed' : 'control';
        process.stderr.write(`waterwatch run policy=${policyId} seed=${seed} ${side} ...\n`);
        const row = await oneRun(seed, policyId, days, armed);
        rows.push(row);
        fs.writeFileSync(path.join(EVID, `run-${policyId}-s${seed}-${side}.json`), JSON.stringify(row, null, 1));
        process.stderr.write(`  done: days=${row.days} zero=${row.cisternZeroDays} thirst=${row.thirstDeaths} dehy=${row.dehyDeaths} co=${row.coPrimary} live=${row.layerLive}\n`);
        // SMOKE instrument-honesty gate
        if (smoke) {
          if (row.dailyCalls < 10) { console.error('SMOKE FAIL: policy.daily < 10x'); process.exit(2); }
          if (!!row.layerLive !== armed) { console.error('SMOKE FAIL: layer-live marker'); process.exit(2); }
          if (armed && !row.ledger) { console.error('SMOKE FAIL: no ledger'); process.exit(2); }
        }
      }
    }
  }
  const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const sum = (rs, f) => rs.reduce((t, r) => t + (f(r) || 0), 0);
  const bySide = (armed) => rows.filter(r => r.armed === armed);
  const summary = { seeds, days, policies: policyIds, smoke };
  for (const armed of [false, true]) {
    const rs = bySide(armed);
    const key = armed ? 'armed' : 'control';
    const deaths = {};
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths)) deaths[k] = (deaths[k] || 0) + v;
    summary[key] = {
      n: rs.length,
      cisternZeroDays: sum(rs, r => r.cisternZeroDays),
      thirstDeaths: sum(rs, r => r.thirstDeaths),
      dehyDeaths: sum(rs, r => r.dehyDeaths),
      dryDaysAtHaven: sum(rs, r => r.dryDaysAtHaven),
      coActs: sum(rs, r => r.coActs),
      coPrimary: sum(rs, r => r.dryDaysAtHaven) ? +(sum(rs, r => r.coActs) / sum(rs, r => r.dryDaysAtHaven)).toFixed(3) : null,
      havenFillsDry: sum(rs, r => r.havenFillsDry),
      wildFillsDry: sum(rs, r => r.wildFillsDry),
      havenFillsDryPerDay: sum(rs, r => r.dryDaysAtHaven) ? +(sum(rs, r => r.havenFillsDry) / sum(rs, r => r.dryDaysAtHaven)).toFixed(3) : null,
      creekFills: sum(rs, r => r.ledger.creekFills),
      boilsOk: sum(rs, r => r.ledger.boilsOk),
      beats: sum(rs, r => r.ledger.beats),
      beatKinds: rs.reduce((o, r) => { for (const [k, v] of Object.entries(r.ledger.beatKinds)) o[k] = (o[k] || 0) + v; return o; }, {}),
      noWaterTile: sum(rs, r => r.ledger.noWaterTile),
      noFire: sum(rs, r => r.ledger.noFire),
      walkFailed: sum(rs, r => r.ledger.walkFailed),
      skippedAway: sum(rs, r => r.ledger.skippedAway),
      legErrors: sum(rs, r => r.ledger.legErrors),
      instrErrors: sum(rs, r => r.instrErrors),
      wall: {
        national: sum(rs, r => r.national) + '/' + rs.length,
        table: sum(rs, r => r.tableWaiting ? 1 : 0) + '/' + rs.length,
        won: sum(rs, r => r.won ? 1 : 0) + '/' + rs.length,
        w4: rs.filter(r => r.maxWave >= 4).length + '/' + rs.length,
        w5: rs.filter(r => r.maxWave >= 5).length + '/' + rs.length,
        medianDays: med(rs.map(r => r.days)),
        maxDays: Math.max(...rs.map(r => r.days)),
      },
      deaths,
    };
  }
  const A = summary.armed, C = summary.control;
  summary.verdict = {
    primaryZeroRatio: C.cisternZeroDays ? +(A.cisternZeroDays / C.cisternZeroDays).toFixed(3) : null,
    primaryZeroBar: '<= 0.5',
    primaryZeroGO: C.cisternZeroDays ? (A.cisternZeroDays / C.cisternZeroDays) <= 0.5 : null,
    thirstGO: A.thirstDeaths <= C.thirstDeaths,
    coPrimaryBar: '>= 1.0',
    coPrimaryGO: A.coPrimary !== null ? A.coPrimary >= 1.0 : null,
    medianGuard: A.wall.medianDays >= C.wall.medianDays - 10,
    nationalGuard: sum(bySide(true), r => r.national) >= sum(bySide(false), r => r.national) - 2,
  };
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
  console.error(`sweep done in ${((Number(process.hrtime.bigint()) - t0) / 1e9).toFixed(0)}s`);
  delete process.env.WATERWATCH;
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
