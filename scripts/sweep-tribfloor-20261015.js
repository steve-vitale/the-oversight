#!/usr/bin/env node
// scripts/sweep-tribfloor-20261015.js — tribute-gate floor lever sweep
// (sim-tribfloor, 2026-10-15, scale-onramp axis).
//
// ARM: TRIBFLOOR=1 (scripts/policies/tribfloor.js only, env-gated, default
// OFF, zero src/js) — tribute payments never leave the pantry below the
// 2-day floor (engine pantry-days convention): payTribute is capped at
// max(0, pantry - floor), thin-pantry tribute demands are refused via the
// engine's honest path. The engine's linkTick posts the shortfall as
// arrears (posted, never forgiven — #293).
// CONTROL: same sweep, gate unset — own control, identical seeds
// (CONTROL BASELINE DRIFT #247: never inherit baselines).
//
// Substrate (the scale-wall courtship road): FEASTSCALE_R13=1 ->
// scripts/policies/tribfloor.js (ids 'leadfeast', 'belongfeast').
// 8 seeds (11/22/33/44/55/66/77/88) x {leadfeast, belongfeast} x
// {control, TRIBFLOOR=1}, 180d death-aware.
//
// Pre-registered (MEASUREMENT §§9-12, 14 — BINDING):
//   PRIMARY (intermediate, absolute counts): pantry-emptying tribute
//     payments — any tribute payment (payTribute or honored tribute
//     demand) that leaves the pantry below the floor (tfEmptied: the
//     payment pushed a healthy pantry under the line) — armed <= 0.5x
//     control, identical seeds, own control same sweep. The layer's
//     guarantee is armed tfEmptied == 0; tfWouldEmpty (the counterfactual
//     intent, both arms) shows how often the failure mode arises.
//   GUARDRAILS: national formations armed >= control-2/16;
//     median survival armed >= control-10d;
//     starvation deaths armed <= control+2 (noise-aware: single-digit
//     starvation counts across 16 runs; a zero-tolerance bound would be
//     tighter than the instrument);
//     no new death mode at n>=3; table/wins report-only.
//   SECONDARIES (report-only): arrears levels on young-national links,
//     tribute paid totals, x1.5 leverage landings, wave reach, table/wins.
//   RATCHET CHECK (#199/#200): the capped payment must not arm another
//     verb that drains back to the floor — fsFeasts and starvation deaths
//     armed vs control; capped payments feed the r13 feast contribution
//     gate LESS than full payments, so the tribute->feast ratchet should
//     weaken, never strengthen.
//
// Gates (run before any sweep spend):
//   SMOKE=1  — 15d x {leadfeast, belongfeast} x {control, armed}: named
//              exports unwrap, samples collect, no policy-less runs, no crash.
//   DETGATE=1 — D1: gate-off determinism (same run twice, byte-identical
//              trajectory hash); D2: armed determinism; D3: mechanism
//              isolation — on seeds where the armed run's floor never bound
//              (tfCapped + tfDemandRefused == 0), armed 60d is
//              byte-identical to control 60d.
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-tribfloor-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/sweep-tribfloor-20261015.js
//      DETGATE=1 FEASTSCALE_R13=1 node scripts/sweep-tribfloor-20261015.js
//      SEEDS="11,22" POLICIES="leadfeast" DAYS=180 OUT=... TELEMETRY_DIR=...
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const HL = require('./holdloss-lib-20261015');
const RB = require('./readinessbind-lib');
const TW = require('./tworung-lib-20261015');
const TF = require('./policies/tribfloor');

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('TRIBFLOOR FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}

// NAMED-EXPORT policy unwrap — the suite must never run policy-less.
const { leadfeast, belongfeast } = TF;
const POLICY_REGISTRY = { leadfeast, belongfeast };
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`TRIBFLOOR FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const BEAT_RE = /wave 4|mirror draft|wave 5|producers|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|renegotiat|leverage|arrears|refus/i;

function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 260);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 4000) t.beats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys ? origSys(msg) : msg; };
}

function attachDeaths(Game, t) {
  t.deaths = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 400) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 60),
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

// Counterfactual tribute instrumentation, OUTSIDE the layer: sees the raw
// payment intent before the floor caps it. Identical on both arms, so it
// cannot break byte-identity.
function attachTributeCounters(Game, m) {
  const op = Game.payTribute ? Game.payTribute.bind(Game) : null;
  const oa = Game.answerDemand ? Game.answerDemand.bind(Game) : null;
  // tfEmptied (both arms): the payment pushed a healthy pantry below the
  // floor. On control this is the failure mode; on armed the layer's
  // guarantee is zero — it doubles as the integrity check.
  const emptiedAfter = (pkBefore, floorBefore, burnOk) => {
    try {
      if (burnOk && pkBefore >= floorBefore && TF.pantryKcal(Game) < floorBefore) m.tfEmptied++;
    } catch (e) {}
  };
  if (op) {
    Game.payTribute = function (linkId, kcal) {
      try {
        const bill = (kcal == null) ? TF.billFor(Game, linkId) : kcal;
        const pkBefore = TF.pantryKcal(Game);
        const floorBefore = TF.floorKcal(Game);
        const burnOk = TF.dailyBurn(Game) > 0;
        if (TF.wouldBreach(Game, bill)) m.tfWouldEmpty++;
        const r = op(linkId, kcal);
        emptiedAfter(pkBefore, floorBefore, burnOk);
        return r;
      } catch (e) { return op(linkId, kcal); }
    };
  }
  if (oa) {
    Game.answerDemand = function (linkId, accept) {
      let want = 0, pkBefore = 0, floorBefore = 0, burnOk = false;
      try {
        if (accept) {
          try {
            const ls = Game.hierarchyState() || [];
            for (const l of ls) {
              if (l && l.id === linkId && l.pendingDemand && l.pendingDemand.kind === 'tribute') {
                want = l.pendingDemand.costKcal || 0; break;
              }
            }
          } catch (e) {}
          pkBefore = TF.pantryKcal(Game);
          floorBefore = TF.floorKcal(Game);
          burnOk = TF.dailyBurn(Game) > 0;
          if (TF.wouldBreach(Game, want)) m.tfWouldEmpty++;
        }
      } catch (e) {}
      const r = oa(linkId, accept);
      try { if (accept) emptiedAfter(pkBefore, floorBefore, burnOk); } catch (e) {}
      return r;
    };
  }
}

async function oneRun(seed, pid, days, armed) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  if (armed) process.env.TRIBFLOOR = '1'; else delete process.env.TRIBFLOOR;
  const { Game } = await loadGame({ seed, mode: 'tribfloor-' + pid + (armed ? '-armed' : '-control') });
  await setupGame(Game);

  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = {};
  attachBeats(Game, t);
  attachDeaths(Game, t);
  const tm = { tfWouldEmpty: 0, tfEmptied: 0 };
  attachTributeCounters(Game, tm);
  const hashes = [];
  const scaleRows = [], foodRows = [], standingRows = [];
  const waveUnlockDays = {};
  let lastWave = 1, nSamples = 0;
  let tfCapped = 0, tfCappedKcal = 0, tfDemandRefused = 0, fsFeasts = 0, tributePaidTotal = 0;
  let lastCtx = null;

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    // Sample AFTER the policy's own daily (the day's actions are reflected).
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      tfCapped += (ctx.tfCapped || 0); ctx.tfCapped = 0;
      tfCappedKcal += (ctx.tfCappedKcal || 0); ctx.tfCappedKcal = 0;
      tfDemandRefused += (ctx.tfDemandRefused || 0); ctx.tfDemandRefused = 0;
      fsFeasts += (ctx.fsFeasts || 0); ctx.fsFeasts = 0;
      lastCtx = ctx;
    } catch (e) {}
    try { hashes.push(RB.trajectoryHash(G)); } catch (e) {}
    try { foodRows.push(fc.dailyRow(G)); } catch (e) {}
    try { scaleRows.push(sr.scaleRow(G)); } catch (e) {}
    try {
      const st = TW.standingSample(G);
      standingRows.push({ day: st.day, unlockedWave: st.unlockedWave, rank: st.rank, gated: st.gated, tableSeat: st.tableSeat });
      if (st.unlockedWave > lastWave) {
        for (let w = lastWave + 1; w <= st.unlockedWave; w++) {
          if (w === 4 || w === 5) waveUnlockDays[w] = st.day;
        }
        lastWave = st.unlockedWave;
      }
    } catch (e) {}
    try { nSamples++; } catch (e) {}
  };

  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const daysRan = result.days;
  const trajHash = crypto.createHash('sha1').update(hashes.join('|')).digest('hex');

  try {
    const hist = (lastCtx && lastCtx._tribHist) || [];
    tributePaidTotal = hist.reduce((s, e) => s + (e.kcal || 0), 0);
  } catch (e) {}

  const exiledRow = scaleRows.find(r => r.exiled);
  let tableSeat = 'none', maxWave = 1;
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}
  let arrearsFinal = 0, youngNatArrears = null;
  try {
    const ls = Game.hierarchyState() || [];
    for (const l of ls) if (l && l.status === 'active') arrearsFinal += (l.arrears || 0);
  } catch (e) {}

  const rec = {
    seed, policy: pid, days: daysRan, endReason: result.endReason,
    won: /win|won/i.test(String(result.endReason || '')),
    scaleRows, foodRows, standingRows, waveUnlockDays,
    deaths: t.deaths || [], beats: t.beats || [],
    breaks: (m.scale.breaks || []).map(b => ({ day: b.day, link: b.link })),
    exiledEver: !!exiledRow, exiledDay: exiledRow ? exiledRow.day : null,
  };
  const loss = HL.nationalLoss(rec);
  loss.waveUnlockDays = waveUnlockDays;
  if (loss.reached && loss.holdDays <= 60) youngNatArrears = arrearsFinal;

  const starveDeaths = (t.deaths || []).filter(d => /starv/i.test(d.cause || '')).length;
  const leverageLandings = (t.beats || []).filter(b => /leverage/i.test(b.text || '')).length;
  const deathModes = {};
  for (const d of (t.deaths || [])) {
    const k = String(d.cause || '?').split(' ')[0].slice(0, 24);
    deathModes[k] = (deathModes[k] || 0) + 1;
  }

  const row = Object.assign(
    { policy: pid, seed, arm: armed ? 'armed' : 'control', days: daysRan, endReason: result.endReason, trajHash, nSamples },
    fc.finalize(Game, m, result),
    sr.finalizeScale(Game, m),
    {
      nationalReached: !!loss.reached,
      nationalLossMode: loss.reached ? loss.lossMode : 'n/a',
      lossDay: loss.reached ? loss.lossDay : null,
      firstNatDay: loss.reached ? loss.firstDay : null,
      holdDays: loss.reached ? loss.holdDays : 0,
      lossEvidence: loss.reached ? (loss.lossEvidence || []) : [],
      tableSeat, tableReached: tableSeat !== 'none', maxWave,
      won: rec.won, survivalDays: daysRan,
      exiled: !!exiledRow,
      tfWouldEmpty: tm.tfWouldEmpty, tfEmptied: tm.tfEmptied,
      tfCapped, tfCappedKcal: Math.round(tfCappedKcal), tfDemandRefused,
      fsFeasts, starveDeaths, tributePaidTotal: Math.round(tributePaidTotal),
      leverageLandings, arrearsFinal: Math.round(arrearsFinal), youngNatArrears,
      nDeaths: (t.deaths || []).length,
      deathModes,
    }
  );

  delete process.env.TRIBFLOOR;
  return { row, rec, loss, beats: t.beats };
}

async function detgate() {
  console.log('DETGATE: byte-identical checks');
  let fail = 0;
  const chk = (name, a, b) => {
    if (a === b) { console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + ' — ' + String(a).slice(0, 16) + ' != ' + String(b).slice(0, 16)); }
  };
  const c1 = await oneRun(11, 'leadfeast', 60, false);
  const c2 = await oneRun(11, 'leadfeast', 60, false);
  chk('D1 gate-off determinism (11/leadfeast/60d x2)', c1.row.trajHash, c2.row.trajHash);
  const a1 = await oneRun(11, 'leadfeast', 60, true);
  const a2 = await oneRun(11, 'leadfeast', 60, true);
  chk('D2 armed determinism (11/leadfeast/60d x2)', a1.row.trajHash, a2.row.trajHash);
  // D3: mechanism isolation — where the armed run's floor never bound,
  // armed must be byte-identical to control.
  let d3done = 0;
  for (const d3seed of [11, 33, 22, 44]) {
    const d3a = await oneRun(d3seed, 'leadfeast', 60, true);
    const bound = (d3a.row.tfCapped || 0) + (d3a.row.tfDemandRefused || 0);
    if (bound === 0) {
      const d3c = await oneRun(d3seed, 'leadfeast', 60, false);
      chk(`D3 mechanism isolation (${d3seed}/leadfeast/60d, floor inert)`, d3a.row.trajHash, d3c.row.trajHash);
      d3done++;
      if (d3done >= 2) break;
    } else {
      console.log(`  INFO D3 seed ${d3seed}: floor bound ${bound}x — not an isolation case`);
    }
  }
  if (!d3done) console.log('  SKIP D3 — the floor bound on every scanned seed (no inert case in 60d)');
  if (fail) { console.error('DETGATE FAILED'); process.exit(1); }
  console.log('DETGATE GREEN');
}

async function smoke() {
  console.log('SMOKE: 15d x {leadfeast,belongfeast} x {control,armed}');
  let fail = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    for (const armed of [false, true]) {
      const { row } = await oneRun(11, pid, 15, armed);
      if (row.nSamples >= 10 && row.days === 15) {
        console.log(`  PASS ${pid}/${armed ? 'armed' : 'control'} — ${row.nSamples} samples, 15d, no crash`);
      } else { fail++; console.log(`  FAIL ${pid}/${armed ? 'armed' : 'control'} — nSamples=${row.nSamples} days=${row.days}`); }
    }
  }
  if (fail) { console.error('SMOKE FAILED'); process.exit(1); }
  console.log('SMOKE GREEN');
}

async function runSweep(opts) {
  opts = opts || {};
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-15/sim-tribfloor-runs.json';
  const telemetryDir = process.env.TELEMETRY_DIR || 'evidence/2026-10-15/telemetry-tribfloor';
  const rows = [];
  const t0 = Date.now();
  for (const pid of policyIds) {
    for (const seed of seeds) {
      for (const armed of [false, true]) {
        const armName = armed ? 'armed' : 'control';
        console.log(`-- ${pid} seed ${seed} ${armName}`);
        const { row } = await oneRun(seed, pid, days, armed);
        rows.push(row);
        try { fs.mkdirSync(telemetryDir, { recursive: true }); } catch (e) {}
        fs.writeFileSync(path.join(telemetryDir, `${pid}-s${seed}-${armName}.json`),
          JSON.stringify({
            run: 'tribfloor', seed, policy: pid, arm: armName,
            national: row.nationalReached ? 1 : 0, table: row.tableReached ? 1 : 0,
            wins: row.won ? 1 : 0, exiled: row.exiled ? 1 : 0,
            holdDays: row.holdDays, lossMode: row.nationalLossMode,
            maxWave: row.maxWave, survivalDays: row.survivalDays,
            tfWouldEmpty: row.tfWouldEmpty, tfEmptied: row.tfEmptied,
            tfCapped: row.tfCapped, tfCappedKcal: row.tfCappedKcal,
            tfDemandRefused: row.tfDemandRefused,
            fsFeasts: row.fsFeasts, starveDeaths: row.starveDeaths,
            tributePaidTotal: row.tributePaidTotal,
            leverageLandings: row.leverageLandings,
            arrearsFinal: row.arrearsFinal, youngNatArrears: row.youngNatArrears,
            trajHash: row.trajHash,
          }, null, 1));
      }
    }
  }
  try { fs.mkdirSync(path.dirname(out), { recursive: true }); } catch (e) {}
  fs.writeFileSync(out, JSON.stringify(rows, null, 1));
  console.log(`\nwrote ${out} (${rows.length} runs, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);

  // ---- summary vs pre-registration ----
  const C = rows.filter(r => r.arm === 'control'), A = rows.filter(r => r.arm === 'armed');
  const cnt = (rs, f) => rs.filter(f).length;
  const sumK = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
  const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  const sum = {};
  for (const [nm, rs] of [['control', C], ['armed', A]]) {
    sum[nm] = {
      n: rs.length,
      tfWouldEmpty: sumK(rs, 'tfWouldEmpty'),
      tfCapped: sumK(rs, 'tfCapped'),
      tfCappedKcal: sumK(rs, 'tfCappedKcal'),
      tfDemandRefused: sumK(rs, 'tfDemandRefused'),
      tfEmptied: sumK(rs, 'tfEmptied'),
      fsFeasts: sumK(rs, 'fsFeasts'),
      starveDeaths: sumK(rs, 'starveDeaths'),
      tributePaidTotal: sumK(rs, 'tributePaidTotal'),
      leverageLandings: sumK(rs, 'leverageLandings'),
      national: cnt(rs, r => r.nationalReached),
      table: cnt(rs, r => r.tableReached),
      wins: cnt(rs, r => r.won),
      w4: cnt(rs, r => r.maxWave >= 4),
      w5: cnt(rs, r => r.maxWave >= 5),
      medSurv: med(rs.map(r => r.survivalDays)),
      exiled: cnt(rs, r => r.exiled),
      deathModes: {},
    };
    for (const r of rs) for (const [k, v] of Object.entries(r.deathModes || {})) {
      sum[nm].deathModes[k] = (sum[nm].deathModes[k] || 0) + v;
    }
  }
  console.log('\n=== SUMMARY (pre-registered verdict) ===');
  console.log(JSON.stringify(sum, null, 1));
  // PRIMARY: armed pantry-emptying <= 0.5x control pantry-emptying.
  // tfEmptied doubles as the integrity counter: the layer's guarantee is
  // armed == 0 (a tribute payment never pushes a healthy pantry under the
  // floor when the gate is on).
  // NOTE on tfWouldEmpty (wrapper-order caveat): the sweep's counter sits
  // INSIDE the layer's wrapper (the layer wraps after the sweep), so on the
  // armed side it sees the CAPPED bill, not the raw intent — armed
  // tfWouldEmpty undercounts. The layer's own ctx counters (tfCapped,
  // tfDemandRefused) record every raw-bill breach, so the armed intent is
  // tfCapped + tfDemandRefused. Control's tfWouldEmpty is valid (no layer).
  const armedIntent = sum.armed.tfCapped + sum.armed.tfDemandRefused;
  const go = sum.armed.tfEmptied <= 0.5 * sum.control.tfEmptied;
  const g1 = sum.armed.national >= sum.control.national - 2;
  const g2 = sum.armed.medSurv >= sum.control.medSurv - 10;
  const g3 = sum.armed.starveDeaths <= sum.control.starveDeaths + 2;
  const newModes = Object.keys(sum.armed.deathModes).filter(m => !(m in sum.control.deathModes) && sum.armed.deathModes[m] >= 3);
  console.log(`\nINTENT control would-empty=${sum.control.tfWouldEmpty} | armed raw-bill breaches=${armedIntent} (capped ${sum.armed.tfCapped} + refused ${sum.armed.tfDemandRefused}), kcal held back=${sum.armed.tfCappedKcal}`);
  console.log(`PRIMARY pantry-emptying armed<=0.5x control: ${sum.armed.tfEmptied} <= 0.5*${sum.control.tfEmptied} -> ${go ? 'GO' : 'NO-GO'}`);
  console.log(`GUARD national armed >= control-2: ${sum.armed.national} >= ${sum.control.national - 2} -> ${g1 ? 'OK' : 'MISS'}`);
  console.log(`GUARD median survival armed >= control-10d: ${sum.armed.medSurv} >= ${sum.control.medSurv - 10} -> ${g2 ? 'OK' : 'MISS'}`);
  console.log(`GUARD starvation deaths armed <= control+2: ${sum.armed.starveDeaths} <= ${sum.control.starveDeaths + 2} -> ${g3 ? 'OK' : 'MISS'}`);
  console.log(`GUARD no new death mode at n>=3: ${newModes.length ? 'MISS ' + newModes.join(',') : 'OK'}`);
}

(async () => {
  if (process.env.SMOKE) return smoke();
  if (process.env.DETGATE) return detgate();
  return runSweep();
})().catch(e => { console.error('FATAL', e); process.exit(2); });
