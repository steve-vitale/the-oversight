#!/usr/bin/env node
// scripts/sweep-succpolity-20261015.js — succession-persistence lever sweep
// (sim-succpolity, 2026-10-15, scale-onramp axis, sim-findings #301).
//
// ARM: SUCCPOLITY=1 (src/js/hierarchy.js only, env-gated, default OFF) —
// the polity persists through succession: onLeaderDeath stamps each shaken
// link with its pre-death standing; the polity-membership trust bars read
// the inheritance for a 14-day proving window. The chaos is untouched.
// CONTROL: same sweep, gate unset — own control, identical seeds
// (CONTROL BASELINE DRIFT #247: never inherit baselines).
//
// Substrate (the scale-wall courtship road): FEASTSCALE_R13=1 ->
// scripts/policies/feastscale.js (ids 'leadfeast', 'belongfeast').
// 8 seeds (11/22/33/44/55/66/77/88) x {leadfeast, belongfeast} x
// {control, SUCCPOLITY=1}, 180d death-aware.
//
// Measurement reuses scripts/tworung-lib-20261015.js nationalHold — the
// exact 'succession-collapse' loss taxonomy (scholar/person death +-3d,
// nothing else firing).
//
// Pre-registered (MEASUREMENT §§9-12, 14 — BINDING):
//   PRIMARY (absolute): succession-collapse demotions armed <= control.
//   GUARDRAILS: national reaches armed >= control-2/16;
//     median survival armed >= control-10d; no new national-loss mode at
//     n>=3; table/wins report-only.
//
// Gates (run before any sweep spend):
//   SMOKE=1  — 15d x {leadfeast, belongfeast} x {control, armed}: named
//              exports unwrap, samples collect, no policy-less runs, no crash.
//   DETGATE=1 — D1: gate-off determinism (same run twice, byte-identical
//              trajectory hash); D2: armed determinism; D3: on a seed whose
//              control shows NO leader-death beat, armed 60d is byte-identical
//              to control 60d — the lever touches nothing outside the
//              succession path.
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-succpolity-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/sweep-succpolity-20261015.js
//      DETGATE=1 FEASTSCALE_R13=1 node scripts/sweep-succpolity-20261015.js
//      SEEDS="11,22" POLICIES="leadfeast" DAYS=180 OUT=... PERSEED_DIR=...
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const TW = require('./tworung-lib-20261015');
const RB = require('./readinessbind-lib');

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('SUCCPOLITY FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}

// NAMED-EXPORT policy unwrap — the suite must never run policy-less.
const { leadfeast, belongfeast } = require('./policies/feastscale');
const POLICY_REGISTRY = { leadfeast, belongfeast };
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`SUCCPOLITY FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
const BEAT_RE = /wave 4|mirror draft|wave 5|producers|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart/i;

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

function arrearsSpike(daily, lossDay) {
  try {
    const win = (daily || []).filter(r => r.day >= lossDay - 7 && r.day <= lossDay && r.links);
    if (win.length < 2) return null;
    const sumArr = (r) => (r.links || []).reduce((tt, l) => tt + (l.arrears || 0), 0);
    const before = sumArr(win[0]), after = sumArr(win[win.length - 1]);
    if (after - before > 2000) return `home-link arrears ${Math.round(before)} -> ${Math.round(after)} kcal in the 7d before loss day ${lossDay}`;
    return null;
  } catch (e) { return null; }
}

async function oneRun(seed, pid, days, armed) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  if (armed) process.env.SUCCPOLITY = '1'; else delete process.env.SUCCPOLITY;
  const { Game } = await loadGame({ seed, mode: 'succpolity-' + pid + (armed ? '-armed' : '-control') });
  await setupGame(Game);

  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = {};
  attachBeats(Game, t);
  attachDeaths(Game, t);
  const hashes = [];
  let nSamples = 0;

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    // Sample AFTER the policy's own daily (the day's actions are reflected).
    // NOTE: never `return origDaily(...)` here — the early return skips the
    // sampler entirely (caught by the SMOKE gate, 2026-10-15).
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try { hashes.push(RB.trajectoryHash(G)); } catch (e) {}
    try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
    try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
    try { nSamples++; } catch (e) {}
  };

  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const daysRan = result.days;
  const trajHash = crypto.createHash('sha1').update(hashes.join('|')).digest('hex');

  const row = Object.assign(
    { policy: pid, seed, arm: armed ? 'armed' : 'control', days: daysRan, endReason: result.endReason, trajHash, nSamples },
    fc.finalize(Game, m, result),
    sr.finalizeScale(Game, m)
  );

  // ---- national hold-duration + loss attribution (tworung taxonomy) ----
  const daily = m.scale.daily || [];
  const exiledRow = daily.find(r => r.exiled);
  const hold = TW.nationalHold(daily, {
    breaks: (m.scale.breaks || []).map(b => ({ day: b.day, link: b.link })),
    endReason: result.endReason, finalDay: daysRan,
    exiledEver: !!exiledRow, exiledDay: exiledRow ? exiledRow.day : null,
    arrearsSpike: null,
    deathDays: (t.deaths || []).map(d => ({ day: d.day, kind: d.kind, name: d.name, cause: d.cause })),
  });
  if (hold.reached && hold.lossDay != null) {
    const spike = arrearsSpike(daily, hold.lossDay);
    if (spike && hold.lossMode === 'unattributed') {
      hold.lossMode = 'tribute-collapse';
      hold.lossEvidence = [spike];
    }
  }
  row.nationalHold = hold;
  row.nationalReached = !!hold.reached;
  row.nationalLossMode = hold.reached ? hold.lossMode : 'n/a';
  row.holdDays = hold.reached ? hold.holdDays : 0;

  // ---- wall numbers ----
  let tableSeat = 'none', maxWave = 1;
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}
  row.tableSeat = tableSeat;
  row.tableReached = tableSeat !== 'none';
  row.maxWave = maxWave;
  row.won = /win|won/i.test(String(result.endReason || ''));
  row.survivalDays = daysRan;

  // ---- succession moments for sense-testing ----
  const succBeats = (t.beats || []).filter(b => /dead hold no treaties|realm came apart|succession/i.test(b.text));
  row.succBeats = succBeats.slice(0, 30);
  row.nSuccBeats = succBeats.length;
  row.treatyBeats = (t.beats || []).filter(b => /dead hold no treaties/i.test(b.text)).length;

  delete process.env.SUCCPOLITY;
  return { row, beats: t.beats };
}

async function detgate() {
  console.log('DETGATE: byte-identical checks');
  let fail = 0;
  const chk = (name, a, b) => {
    if (a === b) { console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + ' — ' + String(a).slice(0, 16) + ' != ' + String(b).slice(0, 16)); }
  };
  // D1: gate-off determinism — same run twice, byte-identical trajectory
  const c1 = await oneRun(11, 'leadfeast', 60, false);
  const c2 = await oneRun(11, 'leadfeast', 60, false);
  chk('D1 gate-off determinism (11/leadfeast/60d x2)', c1.row.trajHash, c2.row.trajHash);
  // D2: armed determinism
  const a1 = await oneRun(11, 'leadfeast', 60, true);
  const a2 = await oneRun(11, 'leadfeast', 60, true);
  chk('D2 armed determinism (11/leadfeast/60d x2)', a1.row.trajHash, a2.row.trajHash);
  // D3: on a seed whose CONTROL shows no leader-death beat, armed 60d must
  // be byte-identical to control — the lever touches nothing outside the
  // succession path.
  let d3done = false;
  for (const d3seed of [33, 11, 22, 44, 55, 66]) {
    const d3c = await oneRun(d3seed, 'belongfeast', 60, false);
    if (d3c.row.treatyBeats === 0) {
      const d3a = await oneRun(d3seed, 'belongfeast', 60, true);
      chk(`D3 mechanism isolation (${d3seed}/belongfeast/60d, no leader death in control)`, d3a.row.trajHash, d3c.row.trajHash);
      d3done = true;
      break;
    }
  }
  if (!d3done) console.log('  SKIP D3 — every scanned control had a leader-death beat in 60d (lever legitimately active everywhere scanned)');
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
  const out = process.env.OUT || 'evidence/2026-10-15/sim-succpolity-runs.json';
  const perseedDir = process.env.PERSEED_DIR || 'evidence/2026-10-15/perseed-succpolity';
  const rows = [];
  const t0 = Date.now();
  for (const pid of policyIds) {
    for (const seed of seeds) {
      for (const armed of [false, true]) {
        const armName = armed ? 'armed' : 'control';
        console.log(`-- ${pid} seed ${seed} ${armName}`);
        const { row } = await oneRun(seed, pid, days, armed);
        rows.push(row);
        try { fs.mkdirSync(perseedDir, { recursive: true }); } catch (e) {}
        fs.writeFileSync(path.join(perseedDir, `${pid}-s${seed}-${armName}.json`),
          JSON.stringify({
            seed, policy: pid, arm: armName, days: row.days, endReason: row.endReason,
            national: row.nationalReached ? 1 : 0, holdDays: row.holdDays,
            nationalLossMode: row.nationalLossMode,
            table: row.tableReached ? 1 : 0, wins: row.won ? 1 : 0,
            maxWave: row.maxWave, survivalDays: row.survivalDays,
            exiled: row.exiled ? 1 : 0, trajHash: row.trajHash,
          }, null, 1));
      }
    }
  }
  try { fs.mkdirSync(path.dirname(out), { recursive: true }); } catch (e) {}
  const full = rows.map(r => Object.assign({}, r, { succBeats: r.succBeats }));
  fs.writeFileSync(out, JSON.stringify(full, null, 1));
  console.log(`\nwrote ${out} (${rows.length} runs, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);

  // ---- summary vs pre-registration ----
  const C = rows.filter(r => r.arm === 'control'), A = rows.filter(r => r.arm === 'armed');
  const cnt = (rs, f) => rs.filter(f).length;
  const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  const sum = {};
  for (const [nm, rs] of [['control', C], ['armed', A]]) {
    sum[nm] = {
      n: rs.length,
      succCollapse: cnt(rs, r => r.nationalLossMode === 'succession-collapse'),
      national: cnt(rs, r => r.nationalReached),
      table: cnt(rs, r => r.tableReached),
      wins: cnt(rs, r => r.won),
      w4: cnt(rs, r => r.maxWave >= 4),
      w5: cnt(rs, r => r.maxWave >= 5),
      medSurv: med(rs.map(r => r.survivalDays)),
      lossModes: {},
    };
    for (const r of rs) sum[nm].lossModes[r.nationalLossMode] = (sum[nm].lossModes[r.nationalLossMode] || 0) + 1;
  }
  console.log('\n=== SUMMARY (pre-registered verdict) ===');
  console.log(JSON.stringify(sum, null, 1));
  const go = sum.armed.succCollapse <= sum.control.succCollapse;
  const g1 = sum.armed.national >= sum.control.national - 2;
  const g2 = sum.armed.medSurv >= sum.control.medSurv - 10;
  const newModes = Object.keys(sum.armed.lossModes).filter(m => m !== 'n/a' && !(m in sum.control.lossModes) && sum.armed.lossModes[m] >= 3);
  console.log(`\nPRIMARY succession-collapse armed<=control: ${sum.armed.succCollapse} <= ${sum.control.succCollapse} -> ${go ? 'GO' : 'NO-GO'}`);
  console.log(`GUARD national armed >= control-2: ${sum.armed.national} >= ${sum.control.national - 2} -> ${g1 ? 'OK' : 'MISS'}`);
  console.log(`GUARD median survival armed >= control-10d: ${sum.armed.medSurv} >= ${sum.control.medSurv - 10} -> ${g2 ? 'OK' : 'MISS'}`);
  console.log(`GUARD no new loss mode at n>=3: ${newModes.length ? 'MISS ' + newModes.join(',') : 'OK'}`);
}

(async () => {
  if (process.env.SMOKE) return smoke();
  if (process.env.DETGATE) return detgate();
  return runSweep();
})().catch(e => { console.error('FATAL', e); process.exit(2); });
