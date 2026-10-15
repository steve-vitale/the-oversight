#!/usr/bin/env node
// scripts/sweep-tribshield-20261015.js — tribute-shield lever sweep
// (sim-tribshield, 2026-10-15, scale-onramp axis).
//
// ARM: TRIBSHIELD=1 (scripts/policies/tribshield.js only, env-gated,
// default OFF, zero src/js) — inside the shield window (young national's
// first 60 hold-days, or succession grief live on a link) the village
// answers staged renegotiation beats (gift/visit, never silence) and
// triages weak bonds first on tends. The base courtship policies never
// answer these beats.
// CONTROL: same sweep, gate unset — own control, identical seeds
// (CONTROL BASELINE DRIFT #247: never inherit baselines).
//
// Substrate (the scale-wall courtship road): FEASTSCALE_R13=1 ->
// scripts/policies/tribshield.js (ids 'leadfeast', 'belongfeast').
// 8 seeds (11/22/33/44/55/66/77/88) x {leadfeast, belongfeast} x
// {control, TRIBSHIELD=1}, 180d death-aware.
//
// Measurement reuses scripts/holdloss-lib-20261015.js nationalLoss — the
// exact 'tribute-collapse' loss taxonomy (home-link arrears surge +2000
// kcal in the 7d before loss). PRIMARY counts tribute-collapse losses on
// YOUNG nationals (lossDay - firstDay <= 60).
//
// Pre-registered (MEASUREMENT §§9-12, 14 — BINDING):
//   PRIMARY (absolute): tribute-snap losses on young nationals armed <=
//     0.7x control.
//   GUARDRAILS: national reaches armed >= control-2/16;
//     median survival armed >= control-10d; no new national-loss mode at
//     n>=3; table/wins report-only.
//   SECONDARIES (mechanism-firing): shield verb counts per run
//     (tsReneg_gift/tsReneg_visit/tsTends); arrears trajectories on young
//     nationals; beatsAnswered.
//
// Gates (run before any sweep spend):
//   SMOKE=1  — 15d x {leadfeast, belongfeast} x {control, armed}: named
//              exports unwrap, samples collect, no policy-less runs, no crash.
//   DETGATE=1 — D1: gate-off determinism (same run twice, byte-identical
//              trajectory hash); D2: armed determinism; D3: mechanism
//              isolation — on seeds where the armed run's shield counters
//              are all zero (the layer was inert), armed 60d is
//              byte-identical to control 60d.
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-tribshield-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/sweep-tribshield-20261015.js
//      DETGATE=1 FEASTSCALE_R13=1 node scripts/sweep-tribshield-20261015.js
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

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('TRIBSHIELD FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}

// NAMED-EXPORT policy unwrap — the suite must never run policy-less.
const { leadfeast, belongfeast } = require('./policies/tribshield');
const POLICY_REGISTRY = { leadfeast, belongfeast };
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`TRIBSHIELD FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const BEAT_RE = /wave 4|mirror draft|wave 5|producers|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|renegotiat/i;

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

async function oneRun(seed, pid, days, armed) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  if (armed) process.env.TRIBSHIELD = '1'; else delete process.env.TRIBSHIELD;
  const { Game } = await loadGame({ seed, mode: 'tribshield-' + pid + (armed ? '-armed' : '-control') });
  await setupGame(Game);

  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = {};
  attachBeats(Game, t);
  attachDeaths(Game, t);
  const hashes = [];
  const scaleRows = [], foodRows = [], standingRows = [];
  const waveUnlockDays = {};
  let lastWave = 1, nSamples = 0;
  const shield = { gift: 0, visit: 0, tends: 0 };

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    // Sample AFTER the policy's own daily (the day's actions are reflected).
    // NOTE: never `return origDaily(...)` here — the early return skips the
    // sampler entirely (caught by the SMOKE gate, 2026-10-15).
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      shield.gift += (ctx.tsReneg_gift || 0); ctx.tsReneg_gift = 0;
      shield.visit += (ctx.tsReneg_visit || 0); ctx.tsReneg_visit = 0;
      shield.tends += (ctx.tsTends || 0); ctx.tsTends = 0;
    } catch (e) {}
    try { hashes.push(RB.trajectoryHash(G)); } catch (e) {}
    try { foodRows.push(fc.dailyRow(G)); } catch (e) {}
    try {
      const srw = sr.scaleRow(G); scaleRows.push(srw);
    } catch (e) {}
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

  const exiledRow = scaleRows.find(r => r.exiled);
  let tableSeat = 'none', maxWave = 1;
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}

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

  // PRIMARY: tribute-snap on a YOUNG national.
  const youngSnap = !!loss.reached && loss.lossMode === 'tribute-collapse' &&
    loss.lossDay != null && (loss.lossDay - loss.firstDay) <= 60;

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
      youngTributeSnap: youngSnap,
      lossEvidence: loss.reached ? (loss.lossEvidence || []) : [],
      tableSeat, tableReached: tableSeat !== 'none', maxWave,
      won: rec.won, survivalDays: daysRan,
      exiled: !!exiledRow,
      shieldGift: shield.gift, shieldVisit: shield.visit, shieldTends: shield.tends,
      nDeaths: (t.deaths || []).length,
      deathCauses: (t.deaths || []).map(d => d.cause),
    }
  );

  delete process.env.TRIBSHIELD;
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
  // D3: mechanism isolation — where the armed run's shield never fired
  // (all counters zero), armed must be byte-identical to control.
  let d3done = 0;
  for (const d3seed of [11, 33, 22, 44]) {
    const d3a = await oneRun(d3seed, 'belongfeast', 60, true);
    const fired = (d3a.row.shieldGift || 0) + (d3a.row.shieldVisit || 0) + (d3a.row.shieldTends || 0);
    if (fired === 0) {
      const d3c = await oneRun(d3seed, 'belongfeast', 60, false);
      chk(`D3 mechanism isolation (${d3seed}/belongfeast/60d, shield inert)`, d3a.row.trajHash, d3c.row.trajHash);
      d3done++;
      if (d3done >= 2) break;
    } else {
      console.log(`  INFO D3 seed ${d3seed}: shield fired ${fired}x — not an isolation case`);
    }
  }
  if (!d3done) console.log('  SKIP D3 — the shield fired on every scanned seed (no inert case in 60d)');
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
  const out = process.env.OUT || 'evidence/2026-10-15/sim-tribshield-runs.json';
  const telemetryDir = process.env.TELEMETRY_DIR || 'evidence/2026-10-15/telemetry-tribshield';
  const rows = [];
  const t0 = Date.now();
  for (const pid of policyIds) {
    for (const seed of seeds) {
      for (const armed of [false, true]) {
        const armName = armed ? 'armed' : 'control';
        console.log(`-- ${pid} seed ${seed} ${armName}`);
        const { row } = await oneRun(seed, pid, days, armed);
        rows.push(row);
        // Per-seed telemetry record for the coordinator's telemetry check.
        try { fs.mkdirSync(telemetryDir, { recursive: true }); } catch (e) {}
        fs.writeFileSync(path.join(telemetryDir, `${pid}-s${seed}-${armName}.json`),
          JSON.stringify({
            run: 'tribshield', seed, policy: pid, arm: armName,
            national: row.nationalReached ? 1 : 0, table: row.tableReached ? 1 : 0,
            wins: row.won ? 1 : 0, exiled: row.exiled ? 1 : 0,
            holdDays: row.holdDays, lossMode: row.nationalLossMode,
            youngTributeSnap: row.youngTributeSnap ? 1 : 0,
            maxWave: row.maxWave, survivalDays: row.survivalDays,
            shieldGift: row.shieldGift, shieldVisit: row.shieldVisit, shieldTends: row.shieldTends,
            trajHash: row.trajHash,
          }, null, 1));
      }
    }
  }
  try { fs.mkdirSync(path.dirname(out), { recursive: true }); } catch (e) {}
  fs.writeFileSync(out, JSON.stringify(rows.map(r => {
    const c = Object.assign({}, r);
    delete c.deathCauses;
    return c;
  }), null, 1));
  console.log(`\nwrote ${out} (${rows.length} runs, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);

  // ---- summary vs pre-registration ----
  const C = rows.filter(r => r.arm === 'control'), A = rows.filter(r => r.arm === 'armed');
  const cnt = (rs, f) => rs.filter(f).length;
  const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  const sum = {};
  for (const [nm, rs] of [['control', C], ['armed', A]]) {
    sum[nm] = {
      n: rs.length,
      youngTributeSnap: cnt(rs, r => r.youngTributeSnap),
      tributeCollapseAny: cnt(rs, r => r.nationalLossMode === 'tribute-collapse'),
      national: cnt(rs, r => r.nationalReached),
      table: cnt(rs, r => r.tableReached),
      wins: cnt(rs, r => r.won),
      w4: cnt(rs, r => r.maxWave >= 4),
      w5: cnt(rs, r => r.maxWave >= 5),
      medSurv: med(rs.map(r => r.survivalDays)),
      shieldVerbs: rs.reduce((t, r) => t + (r.shieldGift || 0) + (r.shieldVisit || 0) + (r.shieldTends || 0), 0),
      lossModes: {},
    };
    for (const r of rs) sum[nm].lossModes[r.nationalLossMode] = (sum[nm].lossModes[r.nationalLossMode] || 0) + 1;
  }
  console.log('\n=== SUMMARY (pre-registered verdict) ===');
  console.log(JSON.stringify(sum, null, 1));
  const go = sum.armed.youngTributeSnap <= 0.7 * sum.control.youngTributeSnap;
  const g1 = sum.armed.national >= sum.control.national - 2;
  const g2 = sum.armed.medSurv >= sum.control.medSurv - 10;
  const newModes = Object.keys(sum.armed.lossModes).filter(m => m !== 'n/a' && !(m in sum.control.lossModes) && sum.armed.lossModes[m] >= 3);
  console.log(`\nPRIMARY young-tribute-snap armed<=0.7x control: ${sum.armed.youngTributeSnap} <= 0.7*${sum.control.youngTributeSnap} -> ${go ? 'GO' : 'NO-GO'}`);
  console.log(`GUARD national armed >= control-2: ${sum.armed.national} >= ${sum.control.national - 2} -> ${g1 ? 'OK' : 'MISS'}`);
  console.log(`GUARD median survival armed >= control-10d: ${sum.armed.medSurv} >= ${sum.control.medSurv - 10} -> ${g2 ? 'OK' : 'MISS'}`);
  console.log(`GUARD no new loss mode at n>=3: ${newModes.length ? 'MISS ' + newModes.join(',') : 'OK'}`);
}

(async () => {
  if (process.env.SMOKE) return smoke();
  if (process.env.DETGATE) return detgate();
  return runSweep();
})().catch(e => { console.error('FATAL', e); process.exit(2); });
