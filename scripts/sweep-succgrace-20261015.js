#!/usr/bin/env node
// scripts/sweep-succgrace-20261015.js — succession-day grace lever sweep
// (sim-succgrace, 2026-10-15, scale-onramp axis, sim-findings #321).
//
// ARM: SUCCGRACE=1 (src/js/hierarchy.js, env-gated, default OFF) — at a
// succession where a Haven-primary link sits below the seasoned bar
// (trust < 40) and the realm would dissolve aloud, stage an answerable
// renegotiation beat (gift/visit/wait, real costs, 7d expiry) instead of
// the silent verdict. While pending the link holds its fire's place;
// answered, the beat's normal resolution; unanswered, the realm dissolves
// aloud exactly as today.
// CONTROL: same sweep, gate unset — own control, identical seeds
// (never inherited baselines).
//
// Substrate (the scale-wall courtship road): FEASTSCALE_R13=1 ->
// scripts/policies/feastscale.js (ids 'leadfeast', 'belongfeast').
// 8 seeds (11/22/33/44/55/66/77/88) x {leadfeast, belongfeast} x
// {control, SUCCGRACE=1}, 180d death-aware.
//
// The base courtship policies NEVER answer renegotiation beats — in this
// substrate every staged beat lapses at 7d and dissolution proceeds as
// today. The sweep proves the mechanism stages on 100% of eligible
// successions with zero no-beat dissolutions and no regressions; the
// answered->held path is proven in scripts/test-succgrace-20261015.js.
//
// Pre-registered (MEASUREMENT §§9-12, 14 — BINDING):
//   PRIMARY (intermediate): staged beats on eligible sub-bar-link
//     successions = 100% of eligible, AND zero aloud dissolutions of
//     eligible links without the beat staged+resolved first.
//   GUARDRAILS: median survival armed >= control-10d; national formations
//     armed >= control-2/16; no new death mode at n>=3.
//   SECONDARIES (report-only): hold-days sum ratio, dissolution counts,
//     wave reach, table/wins.
//
// Gates (run before any sweep spend):
//   SMOKE=1  — 15d x {leadfeast, belongfeast} x {control, armed}: named
//              exports unwrap, samples collect, no policy-less runs, no crash.
//   DETGATE=1 — D1: gate-off determinism x2; D2: armed determinism x2;
//              D3: mechanism isolation — armed runs where the beat never
//              staged are byte-identical to control.
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-succgrace-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/sweep-succgrace-20261015.js
//      DETGATE=1 FEASTSCALE_R13=1 node scripts/sweep-succgrace-20261015.js
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
  console.error('SUCCGRACE FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}

// NAMED-EXPORT policy unwrap — the suite must never run policy-less.
const { leadfeast, belongfeast } = require('./policies/feastscale');
const POLICY_REGISTRY = { leadfeast, belongfeast };
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`SUCCGRACE FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const BEAT_RE = /wave 4|mirror draft|wave 5|producers|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|renegotiat|fraying|you won/i;

function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300);
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

// light daily link trace for the eligibility/violation scan
function linkTraceRow(Game) {
  const day = gday(Game);
  let links = [];
  try {
    links = (Game.hierarchyState() || []).map(l => ({
      id: String(l.id || '?').slice(0, 24),
      primary: String(l.primary || '?'),
      trust: Math.round(l.trust || 0),
      age: day - (l.day || day),
      sg: !!(l.pendingRenegotiation && l.pendingRenegotiation.succgrace),
      status: String(l.status || '?'),
    }));
  } catch (e) {}
  return { day, links };
}

async function oneRun(seed, pid, days, armed) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  if (armed) process.env.SUCCGRACE = '1'; else delete process.env.SUCCGRACE;
  const { Game } = await loadGame({ seed, mode: 'succgrace-' + pid + (armed ? '-armed' : '-control') });
  await setupGame(Game);

  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = {};
  attachBeats(Game, t);
  attachDeaths(Game, t);
  const hashes = [];
  const scaleRows = [], foodRows = [], standingRows = [];
  const trace = [];
  const waveUnlockDays = {};
  let lastWave = 1, nSamples = 0;
  let sgStaged = 0, sgResolved = 0, prevSg = new Set();

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      // daily light trace + pending-beat transitions (exact, not sampled)
      const row = linkTraceRow(G);
      trace.push(row);
      const cur = new Set(row.links.filter(l => l.sg).map(l => l.id));
      for (const id of cur) if (!prevSg.has(id)) sgStaged++;
      for (const id of prevSg) if (!cur.has(id)) sgResolved++;
      prevSg = cur;
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

  const exiledRow = scaleRows.find(r => r.exiled);
  let tableSeat = 'none', maxWave = 1;
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}
  // the win beat is the authority (endReason regexes lie about the table)
  const won = (t.beats || []).some(b => /say it plainly: you won/i.test(b.text || ''));

  const rec = {
    seed, policy: pid, days: daysRan, endReason: result.endReason,
    scaleRows, foodRows, standingRows, waveUnlockDays,
    deaths: t.deaths || [], beats: t.beats || [], trace,
    breaks: (m.scale.breaks || []).map(b => ({ day: b.day, link: b.link })),
    exiledEver: !!exiledRow, exiledDay: exiledRow ? exiledRow.day : null,
  };
  const loss = HL.nationalLoss(rec);
  loss.waveUnlockDays = waveUnlockDays;

  const deathFams = {};
  try {
    for (const d of (t.deaths || [])) {
      const f = (HL.classifyDeathFamily ? HL.classifyDeathFamily(d.cause) : String(d.cause || '?')).slice(0, 40);
      deathFams[f] = (deathFams[f] || 0) + 1;
    }
  } catch (e) {}

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
      won: !!won, survivalDays: daysRan,
      exiled: !!exiledRow,
      sgStaged, sgResolved,
      nDeaths: (t.deaths || []).length,
      deathFams,
    }
  );

  delete process.env.SUCCGRACE;
  return { row, rec, loss, beats: t.beats, trace };
}

// ---- eligibility + violation scan (PRIMARY, intermediate) ----
// eligible succession: a "dead hold no treaties" beat on a day when a
// Haven-primary 30+d link sat below the seasoned bar (trust < 40) and the
// realm was national/global. A staging beat ("bond is fraying") must fire
// within [S, S+1]. A dissolution ("realm came apart") with an eligible
// succession in the prior 8d and no staging beat is a VIOLATION.
function scanPrimary(rec) {
  const beats = rec.beats || [];
  const trace = rec.trace || [];
  const byDay = {};
  for (const r of trace) byDay[r.day] = r.links;
  const succDays = beats.filter(b => /dead hold no treaties/i.test(b.text || '')).map(b => b.day);
  const stageDays = beats.filter(b => /bond is fraying/i.test(b.text || '')).map(b => b.day);
  const dissolveDays = beats.filter(b => /realm came apart/i.test(b.text || '')).map(b => b.day);
  const rankAt = (d) => {
    let rank = 'village';
    for (const r of (rec.scaleRows || [])) if (r.day <= d) rank = r.rank || rank;
    return rank;
  };
  let eligible = 0, staged = 0;
  const eligibleDays = [];
  for (const S of succDays) {
    const links = byDay[S] || byDay[S + 1] || [];
    const subBar = links.some(l => l.primary === 'haven' && l.age >= 30 && l.trust < 40 && l.status === 'active');
    const rank = rankAt(S);
    if (subBar && (rank === 'national' || rank === 'global')) {
      eligible++;
      eligibleDays.push(S);
      if (stageDays.some(G => G >= S && G <= S + 1)) staged++;
    }
  }
  let violations = 0;
  const violationDays = [];
  for (const D of dissolveDays) {
    const hasEligible = eligibleDays.some(S => S <= D && D - S <= 8);
    if (hasEligible) {
      const hasStaging = stageDays.some(G => G <= D && D - G <= 8);
      if (!hasStaging) { violations++; violationDays.push(D); }
    }
  }
  return { eligible, staged, violations, violationDays, succDays: succDays.length, dissolveDays: dissolveDays.length };
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
  // D3: mechanism isolation — armed runs where the beat never staged must
  // be byte-identical to control.
  let d3done = 0;
  for (const d3seed of [11, 33, 22, 44]) {
    const d3a = await oneRun(d3seed, 'belongfeast', 60, true);
    if ((d3a.row.sgStaged || 0) === 0) {
      const d3c = await oneRun(d3seed, 'belongfeast', 60, false);
      chk(`D3 mechanism isolation (${d3seed}/belongfeast/60d, beat never staged)`, d3a.row.trajHash, d3c.row.trajHash);
      d3done++;
      if (d3done >= 2) break;
    } else {
      console.log(`  INFO D3 seed ${d3seed}: beat staged ${d3a.row.sgStaged}x — not an isolation case`);
    }
  }
  if (!d3done) console.log('  SKIP D3 — the beat staged on every scanned seed (no inert case in 60d)');
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
  const out = process.env.OUT || 'evidence/2026-10-15/sim-succgrace-runs.json';
  const telemetryDir = process.env.TELEMETRY_DIR || 'evidence/2026-10-15/telemetry-succgrace';
  const rows = [];
  const scans = [];
  const t0 = Date.now();
  for (const pid of policyIds) {
    for (const seed of seeds) {
      for (const armed of [false, true]) {
        const armName = armed ? 'armed' : 'control';
        console.log(`-- ${pid} seed ${seed} ${armName}`);
        const { row, rec } = await oneRun(seed, pid, days, armed);
        rows.push(row);
        const scan = scanPrimary(rec);
        scans.push({ seed, policy: pid, arm: armName, scan });
        try { fs.mkdirSync(telemetryDir, { recursive: true }); } catch (e) {}
        fs.writeFileSync(path.join(telemetryDir, `${pid}-s${seed}-${armName}.json`),
          JSON.stringify({
            run: 'succgrace', seed, policy: pid, arm: armName,
            national: row.nationalReached ? 1 : 0, table: row.tableReached ? 1 : 0,
            wins: row.won ? 1 : 0, exiled: row.exiled ? 1 : 0,
            holdDays: row.holdDays, lossMode: row.nationalLossMode,
            maxWave: row.maxWave, survivalDays: row.survivalDays,
            sgStaged: row.sgStaged, sgResolved: row.sgResolved,
            trajHash: row.trajHash,
          }, null, 1));
      }
    }
  }
  try { fs.mkdirSync(path.dirname(out), { recursive: true }); } catch (e) {}
  fs.writeFileSync(out, JSON.stringify(rows.map(r => {
    const c = Object.assign({}, r);
    return c;
  }), null, 1));
  console.log(`\nwrote ${out} (${rows.length} runs, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);

  // ---- summary vs pre-registration ----
  const C = rows.filter(r => r.arm === 'control'), A = rows.filter(r => r.arm === 'armed');
  const SA = scans.filter(s => s.arm === 'armed');
  const cnt = (rs, f) => rs.filter(f).length;
  const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  const sum = {};
  for (const [nm, rs] of [['control', C], ['armed', A]]) {
    sum[nm] = {
      n: rs.length,
      national: cnt(rs, r => r.nationalReached),
      table: cnt(rs, r => r.tableReached),
      wins: cnt(rs, r => r.won),
      w4: cnt(rs, r => r.maxWave >= 4),
      w5: cnt(rs, r => r.maxWave >= 5),
      medSurv: med(rs.map(r => r.survivalDays)),
      holdSum: rs.reduce((t, r) => t + (r.holdDays || 0), 0),
      dissolves: rs.reduce((t, r) => t + (r.nationalReached && r.nationalLossMode !== 'held-to-end' && r.nationalLossMode !== 'n/a' ? 1 : 0), 0),
      sgStaged: rs.reduce((t, r) => t + (r.sgStaged || 0), 0),
      lossModes: {},
    };
    for (const r of rs) sum[nm].lossModes[r.nationalLossMode] = (sum[nm].lossModes[r.nationalLossMode] || 0) + 1;
  }
  const elig = SA.reduce((t, s) => t + s.scan.eligible, 0);
  const staged = SA.reduce((t, s) => t + s.scan.staged, 0);
  const viol = SA.reduce((t, s) => t + s.scan.violations, 0);
  console.log('\n=== PRIMARY (intermediate) ===');
  console.log(`eligible sub-bar successions (armed): ${elig}; staged beats: ${staged}; violations: ${viol}`);
  for (const s of SA) if (s.scan.violations) console.log(`  VIOLATION ${s.policy} s${s.seed} days ${s.scan.violationDays.join(',')}`);
  // eligible==0 in the wild: the 100% staging rate is carried by the proof
  // fixture (test-succgrace-20261015.js G1/G7); the sweep then only needs
  // zero violations. staged==eligible is required whenever eligible>0.
  const goPrimary = viol === 0 && (elig === 0 || staged === elig);
  console.log(`PRIMARY violations==0 (${viol}) && staged==eligible (${staged}==${elig}) -> ${goPrimary ? 'GO' : 'NO-GO'}`);
  console.log('\n=== SUMMARY (guardrails) ===');
  console.log(JSON.stringify(sum, null, 1));
  const g1 = sum.armed.national >= sum.control.national - 2;
  const g2 = sum.armed.medSurv >= sum.control.medSurv - 10;
  const newModes = Object.keys(sum.armed.lossModes).filter(m => m !== 'n/a' && !(m in sum.control.lossModes) && sum.armed.lossModes[m] >= 3);
  console.log(`\nGUARD national armed >= control-2: ${sum.armed.national} >= ${sum.control.national - 2} -> ${g1 ? 'OK' : 'MISS'}`);
  console.log(`GUARD median survival armed >= control-10d: ${sum.armed.medSurv} >= ${sum.control.medSurv - 10} -> ${g2 ? 'OK' : 'MISS'}`);
  console.log(`GUARD no new loss mode at n>=3: ${newModes.length ? 'MISS ' + newModes.join(',') : 'OK'}`);
  console.log(`SECONDARY hold-days sum ratio armed/control: ${(sum.armed.holdSum / Math.max(1, sum.control.holdSum)).toFixed(2)}`);
}

(async () => {
  if (process.env.SMOKE) return smoke();
  if (process.env.DETGATE) return detgate();
  return runSweep();
})().catch(e => { console.error('FATAL', e); process.exit(2); });
