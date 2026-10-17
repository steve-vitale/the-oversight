#!/usr/bin/env node
// scripts/sweep-grieftrib-20261017.js — grief-tribute negotiation lever sweep
// (sim-grieftrib, 2026-10-17, scale-onramp axis, findings #459/#460 follow-up).
//
// ARM: GRIEFTRIB=1 (scripts/policies/grieftrib.js only, env-gated, default
// OFF, zero src/js) — mature subordinate-link grief grabs become played
// renegotiation beats (gift/visit), answered the same event; young-link
// beats the base leaves unanswered are answered too.
// CONTROL: same sweep, gate unset — own control, identical seeds
// (CONTROL BASELINE DRIFT #247: never inherit baselines).
//
// Substrate (the scale-wall courtship road): FEASTSCALE_R13=1 ->
// scripts/policies/grieftrib.js (ids 'leadfeast', 'belongfeast').
// 8 fresh seeds (9921-9928) x {leadfeast, belongfeast} x {control,
// GRIEFTRIB=1}, 180d death-aware.
//
// Pre-registered (MEASUREMENT §§9-12, 14 — BINDING):
//   PRIMARY (belongfeast runs only — the subordinate road): mean per-run
//     max weekly tribute terms on subordinate-road links (subTermsMax),
//     armed <= 0.75x control, identical seeds, own control same sweep.
//     The layer's intent is armed subTermsMax == base terms (no ratchet).
//   SUBSTRATE CHECK (not a kill): control belongfeast runs must show >= 1
//     grief grab total. If zero, the verdict is INCONCLUSIVE (no substrate),
//     not NO-GO — the taxonomy (§14a) calls this substrate-missing.
//   GUARDRAILS: national formations armed >= control-2/16;
//     broken subordinate-road links armed <= control (no link collapse);
//     mean end-run trust on active subordinate-road links armed >= control-5;
//     no new death mode at n>=3; table/wins report-only.
//     DETGATE D1/D2/D3 byte-identical (D3: armed runs where the layer never
//     staged a beat must match control exactly).
//   SECONDARIES (report-only): grief grabs landed, beats staged/answered,
//     leverage landings, tribute paid totals, wave reach, exiled.
//
// Gates (run before any sweep spend):
//   SMOKE=1  — 15d x {leadfeast, belongfeast} x {control, armed}: named
//              exports unwrap, samples collect, no policy-less runs, no crash.
//   DETGATE=1 — D1: gate-off determinism (same run twice, byte-identical
//              trajectory hash); D2: armed determinism; D3: mechanism
//              isolation — on seeds where the armed run never staged a beat
//              (gtStaged == 0), armed 60d is byte-identical to control 60d.
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-grieftrib-20261017.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/sweep-grieftrib-20261017.js
//      DETGATE=1 FEASTSCALE_R13=1 node scripts/sweep-grieftrib-20261017.js
//      SEEDS="9921,9922" POLICIES="belongfeast" DAYS=180 OUT=... TELEMETRY_DIR=...
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
const GT = require('./policies/grieftrib');

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('GRIEFTRIB FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}

// NAMED-EXPORT policy unwrap — the suite must never run policy-less.
const { leadfeast, belongfeast } = GT;
const POLICY_REGISTRY = { leadfeast, belongfeast };
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`GRIEFTRIB FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const BEAT_RE = /wave 4|mirror draft|wave 5|producers|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|renegotiat|leverage|arrears|refus|grief|installs their own|grief card/i;

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

// Grief instrumentation, OUTSIDE the layer: sees every landed grab via the
// engine's own _griefLeverage return value. Identical on both arms, so it
// cannot break byte-identity. Also samples the subordinate-road terms.
function attachGriefCounters(Game, m) {
  m.grabsLanded = 0;
  m.grabTerms = [];
  const og = Game._griefLeverage ? Game._griefLeverage.bind(Game) : null;
  if (og) {
    Game._griefLeverage = function (link) {
      const before = (link && link.tributeKcalPerWeek) || 0;
      const r = og(link);
      try {
        if (r === true) {
          m.grabsLanded++;
          m.grabTerms.push({ day: gday(Game), before, after: (link && link.tributeKcalPerWeek) || 0 });
        }
      } catch (e) {}
      return r;
    };
  }
}

function subordinateLinks(Game) {
  try {
    return (Game.hierarchyState() || []).filter(l => l && l.subordinate === 'haven' &&
      l.kind !== 'covenant' && l.kind !== 'trade');
  } catch (e) { return []; }
}

async function oneRun(seed, pid, days, armed) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  if (armed) process.env.GRIEFTRIB = '1'; else delete process.env.GRIEFTRIB;
  const { Game } = await loadGame({ seed, mode: 'grieftrib-' + pid + (armed ? '-armed' : '-control') });
  await setupGame(Game);

  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = {};
  attachBeats(Game, t);
  attachDeaths(Game, t);
  const gm = {};
  attachGriefCounters(Game, gm);
  const hashes = [];
  const scaleRows = [], foodRows = [], standingRows = [];
  const waveUnlockDays = {};
  let lastWave = 1, nSamples = 0;
  let gtStaged = 0, gtGift = 0, gtVisit = 0, tributePaidTotal = 0;
  let subTermsMax = 0, subGrabsMax = 0, brokenSub = 0;
  let lastCtx = null;

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      gtStaged += (ctx.gtStaged || 0); ctx.gtStaged = 0;
      gtGift += (ctx.gtAnswered_gift || 0); ctx.gtAnswered_gift = 0;
      gtVisit += (ctx.gtAnswered_visit || 0); ctx.gtAnswered_visit = 0;
      lastCtx = ctx;
    } catch (e) {}
    try {
      for (const l of subordinateLinks(G)) {
        if (l.status === 'active') {
          if ((l.tributeKcalPerWeek || 0) > subTermsMax) subTermsMax = l.tributeKcalPerWeek;
          if ((l.griefGrabs || 0) > subGrabsMax) subGrabsMax = l.griefGrabs;
        }
      }
      try {
        const all = (G.hierarchyState() || []);
        brokenSub = all.filter(l => l && l.subordinate === 'haven' && l.status === 'broken').length;
      } catch (e) {}
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
  let subTrustMean = null;
  try {
    const act = subordinateLinks(Game).filter(l => l.status === 'active');
    if (act.length) subTrustMean = act.reduce((t, l) => t + (l.trust || 0), 0) / act.length;
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

  const starveDeaths = (t.deaths || []).filter(d => /starv/i.test(d.cause || '')).length;
  const leverageLandings = (t.beats || []).filter(b => /leverage/i.test(b.text || '')).length;
  const griefBeats = (t.beats || []).filter(b => /grief|renegotiat|installs their own/i.test(b.text || ''));
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
      grabsLanded: gm.grabsLanded || 0,
      grabTerms: gm.grabTerms || [],
      subTermsMax: Math.round(subTermsMax), subGrabsMax,
      subTrustMean: subTrustMean == null ? null : Math.round(subTrustMean * 10) / 10,
      brokenSub,
      gtStaged, gtGift, gtVisit,
      tributePaidTotal: Math.round(tributePaidTotal),
      leverageLandings, griefBeats: griefBeats.length,
      nDeaths: (t.deaths || []).length, starveDeaths,
      deathModes,
    }
  );

  delete process.env.GRIEFTRIB;
  return { row, rec, loss, beats: t.beats };
}

async function detgate() {
  console.log('DETGATE: byte-identical checks');
  let fail = 0;
  const chk = (name, a, b) => {
    if (a === b) { console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + ' — ' + String(a).slice(0, 16) + ' != ' + String(b).slice(0, 16)); }
  };
  const c1 = await oneRun(9921, 'belongfeast', 60, false);
  const c2 = await oneRun(9921, 'belongfeast', 60, false);
  chk('D1 gate-off determinism (9921/belongfeast/60d x2)', c1.row.trajHash, c2.row.trajHash);
  const a1 = await oneRun(9921, 'belongfeast', 60, true);
  const a2 = await oneRun(9921, 'belongfeast', 60, true);
  chk('D2 armed determinism (9921/belongfeast/60d x2)', a1.row.trajHash, a2.row.trajHash);
  let d3done = 0;
  for (const d3seed of [9921, 9922, 9923, 9924]) {
    const d3a = await oneRun(d3seed, 'belongfeast', 60, true);
    const staged = d3a.row.gtStaged || 0;
    if (staged === 0) {
      const d3c = await oneRun(d3seed, 'belongfeast', 60, false);
      chk(`D3 mechanism isolation (${d3seed}/belongfeast/60d, layer inert)`, d3a.row.trajHash, d3c.row.trajHash);
      d3done++;
      if (d3done >= 2) break;
    } else {
      console.log(`  INFO D3 seed ${d3seed}: layer staged ${staged} beats — not an isolation case`);
    }
  }
  if (!d3done) console.log('  SKIP D3 — the layer staged on every scanned seed (no inert case in 60d)');
  if (fail) { console.error('DETGATE FAILED'); process.exit(1); }
  console.log('DETGATE GREEN');
}

async function smoke() {
  console.log('SMOKE: 15d x {leadfeast,belongfeast} x {control,armed}');
  let fail = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    for (const armed of [false, true]) {
      const { row } = await oneRun(9921, pid, 15, armed);
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
  const seeds = opts.seeds || (process.env.SEEDS || '9921,9922,9923,9924,9925,9926,9927,9928').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-17/sim-grieftrib-runs.json';
  const telemetryDir = process.env.TELEMETRY_DIR || 'evidence/2026-10-17/perseed-grieftrib';
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
        // Per-seed JSON with canonical wall keys (finding #482).
        fs.writeFileSync(path.join(telemetryDir, `grieftrib-${pid}-s${seed}-${armName}.json`),
          JSON.stringify({
            run: 'grieftrib', seed, policy: pid, arm: armName,
            national: row.nationalReached ? 1 : 0, table: row.tableReached ? 1 : 0,
            wins: row.won ? 1 : 0, exiled: row.exiled ? 1 : 0,
            holdDays: row.holdDays, lossMode: row.nationalLossMode,
            maxWave: row.maxWave, survivalDays: row.survivalDays,
            endReason: row.endReason,
            grabsLanded: row.grabsLanded, subTermsMax: row.subTermsMax,
            subGrabsMax: row.subGrabsMax, subTrustMean: row.subTrustMean,
            brokenSub: row.brokenSub, gtStaged: row.gtStaged,
            gtGift: row.gtGift, gtVisit: row.gtVisit,
            tributePaidTotal: row.tributePaidTotal,
            leverageLandings: row.leverageLandings,
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
  const Cb = C.filter(r => r.policy === 'belongfeast'), Ab = A.filter(r => r.policy === 'belongfeast');
  const cnt = (rs, f) => rs.filter(f).length;
  const sumK = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
  const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  const sum = {};
  for (const [nm, rs] of [['control', C], ['armed', A]]) {
    sum[nm] = {
      n: rs.length,
      grabsLanded: sumK(rs, 'grabsLanded'),
      subTermsMaxMean: Math.round(mean(rs.map(r => r.subTermsMax))),
      gtStaged: sumK(rs, 'gtStaged'), gtGift: sumK(rs, 'gtGift'), gtVisit: sumK(rs, 'gtVisit'),
      tributePaidTotal: sumK(rs, 'tributePaidTotal'),
      leverageLandings: sumK(rs, 'leverageLandings'),
      brokenSub: sumK(rs, 'brokenSub'),
      subTrustMean: Math.round(mean(rs.filter(r => r.subTrustMean != null).map(r => r.subTrustMean)) * 10) / 10,
      national: cnt(rs, r => r.nationalReached),
      table: cnt(rs, r => r.tableReached),
      wins: cnt(rs, r => r.won),
      w4: cnt(rs, r => r.maxWave >= 4),
      w5: cnt(rs, r => r.maxWave >= 5),
      medSurv: med(rs.map(r => r.survivalDays)),
      exiled: cnt(rs, r => r.exiled),
      starveDeaths: sumK(rs, 'starveDeaths'),
      deathModes: {},
    };
    for (const r of rs) for (const [k, v] of Object.entries(r.deathModes || {})) {
      sum[nm].deathModes[k] = (sum[nm].deathModes[k] || 0) + v;
    }
  }
  console.log('\n=== SUMMARY (pre-registered verdict) ===');
  console.log(JSON.stringify(sum, null, 1));
  // PRIMARY (belongfeast only): mean subTermsMax armed <= 0.75x control.
  const bMean = (rs) => mean(rs.map(r => r.subTermsMax));
  const controlGrabs = sumK(Cb, 'grabsLanded');
  const ratio = bMean(Ab) / Math.max(1, bMean(Cb));
  const substrateOk = controlGrabs >= 1;
  const go = substrateOk && ratio <= 0.75;
  const g1 = sum.armed.national >= sum.control.national - 2;
  const g2 = sum.armed.brokenSub <= sum.control.brokenSub;
  const g3 = (sum.armed.subTrustMean || 0) >= (sum.control.subTrustMean || 0) - 5;
  const newModes = Object.keys(sum.armed.deathModes).filter(m => !(m in sum.control.deathModes) && sum.armed.deathModes[m] >= 3);
  console.log(`\nSUBSTRATE control belongfeast grabs landed: ${controlGrabs} -> ${substrateOk ? 'OK (grief present)' : 'INCONCLUSIVE — no grief substrate on control seeds'}`);
  console.log(`PRIMARY belongfeast subTermsMax mean: control=${Math.round(bMean(Cb))} armed=${Math.round(bMean(Ab))} ratio=${ratio.toFixed(2)} <= 0.75 -> ${go ? 'GO' : (substrateOk ? 'NO-GO' : 'INCONCLUSIVE')}`);
  console.log(`GUARD national armed >= control-2: ${sum.armed.national} >= ${sum.control.national - 2} -> ${g1 ? 'OK' : 'MISS'}`);
  console.log(`GUARD broken subordinate links armed <= control: ${sum.armed.brokenSub} <= ${sum.control.brokenSub} -> ${g2 ? 'OK' : 'MISS'}`);
  console.log(`GUARD sub trust mean armed >= control-5: ${sum.armed.subTrustMean} >= ${(sum.control.subTrustMean || 0) - 5} -> ${g3 ? 'OK' : 'MISS'}`);
  console.log(`GUARD no new death mode at n>=3: ${newModes.length ? 'MISS ' + newModes.join(',') : 'OK'}`);
}

(async () => {
  if (process.env.SMOKE) return smoke();
  if (process.env.DETGATE) return detgate();
  return runSweep();
})().catch(e => { console.error('FATAL', e); process.exit(2); });
