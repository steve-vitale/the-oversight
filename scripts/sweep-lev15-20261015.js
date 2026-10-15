#!/usr/bin/env node
// scripts/sweep-lev15-20261015.js — succession ×1.5 tribute-leverage census
// sweep (sim-lev15census, 2026-10-15, scale-onramp axis — #323 informer).
//
// DIAGNOSTIC, not a lever: the instrument (scripts/lev15-lib-20261015.js)
// watches successionCrisis / theirLeaderDied / answerRenegotiation on the
// feast substrate (8 seeds × {leadfeast, belongfeast}, 180d death-aware,
// FEASTSCALE_R13=1 asserted up front) and records every Math.round
// (tribute × 1.5) leverage application with a full trail: link age, trust,
// arrears, compounding depth, young-national window, outcome.
//
// Pre-registered (MEASUREMENT §§9–12, 14 — BINDING): diagnostic arm.
// PRIMARY (instrument GO): attribution rate ≥ 90% (every aloud leverage
//   verdict paired with a wrapped event; link-history leverage notes
//   unpaired count as misses) AND the frequency/magnitude/compounding
//   distributions reported honestly. No lever GO/NO-GO — the deliverable
//   is numbers + a design-call brief for #323, not a balance change.
// Horizon: 180d death-aware (dead villages stop; +10d tail max per the
//   harness). Seeds: 11/22/33/44/55/66/77/88. Policies: leadfeast,
//   belongfeast (plain feastscale base — TRIBSHIELD is deleted, the base
//   courtship policies never answer beats).
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-lev15-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/sweep-lev15-20261015.js
//      SEEDS="11,22" POLICIES="leadfeast" DAYS=180 TELEMETRY_DIR=...
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const LEV = require('./lev15-lib-20261015');
const sr = require('./scale-repro-20261013');
const HL = require('./holdloss-lib-20261015');
const TW = require('./tworung-lib-20261015');
const RB = require('./readinessbind-lib');

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('LEV15 FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}
delete process.env.TRIBSHIELD; // the plain feastscale base — never answer beats

const { leadfeast, belongfeast } = require('./policies/tribshield');
const POLICY_REGISTRY = { leadfeast, belongfeast };
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`LEV15 FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Refuses to run policy-less.`);
    process.exit(2);
  }
}

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => Number(s.trim()));
const PIDS = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim());
const DAYS = Number(process.env.DAYS || 180);
const TELEMETRY_DIR = process.env.TELEMETRY_DIR ||
  path.join(__dirname, '..', 'evidence', '2026-10-15', 'telemetry-lev15census');

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
    } catch (e) { t.beats.push({ day: gday(Game), text: '[beat-capture-error]' }); }
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  // NOTE: attachCensus already wrapped Game.say. Chaining here keeps both
  // instruments; the census wrapper was installed first so it sees the
  // raw engine line too.
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
      } catch (e) { /* death record is telemetry; the death already landed */ }
      return r;
    };
  }
}

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'lev15-' + pid });
  await setupGame(Game);

  const census = LEV.attachCensus(Game);
  const m = {};
  sr.attachScale(Game, m);
  const t = {};
  attachBeats(Game, t);
  attachDeaths(Game, t);
  const hashes = [];
  const scaleRows = [], standingRows = [];
  const waveUnlockDays = {};
  let lastWave = 1, nSamples = 0;

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try { census.tick(); } catch (e) {}
    try { hashes.push(RB.trajectoryHash(G)); } catch (e) {}
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
    nSamples++;
  };

  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const daysRan = result.days;
  const trajHash = crypto.createHash('sha1').update(hashes.join('|')).digest('hex');
  census.rankAtEnd = (() => { try { return Game.scaleRank() || 'village'; } catch (e) { return 'village'; } })();

  const audit = LEV.attributionAudit(census, Game);
  const linkIds = [...new Set(census.events.map(e => e.linkId))];
  const outcomes = linkIds.map(id => LEV.linkOutcome(census, Game, id));

  let tableSeat = 'none', maxWave = 1;
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}
  const rec = { seed, policy: pid, days: daysRan, endReason: result.endReason };
  const loss = HL.nationalLoss(rec);

  const row = {
    seed, policy: pid, days: daysRan, endReason: result.endReason, trajHash, nSamples,
    nationalReached: !!loss.reached,
    lossMode: loss.reached ? loss.lossMode : 'n/a',
    lossDay: loss.reached ? loss.lossDay : null,
    firstNatDay: loss.reached ? loss.firstDay : null,
    holdDays: loss.reached ? loss.holdDays : 0,
    tableSeat, tableReached: tableSeat !== 'none', maxWave,
    won: /win|won/i.test(String(result.endReason || '')),
    nLeverageEvents: census.events.length,
    attributed: audit.attributed,
    attribMisses: audit.misses.length,
    attribRate: audit.rate,
    instrumentErrors: census.errors.length,
    nDeaths: (t.deaths || []).length,
  };
  return { row, census, outcomes, audit, beats: t.beats, deaths: t.deaths, waveUnlockDays, loss, rankAtEnd: census.rankAtEnd };
}

function writePerSeed(rec, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const f = path.join(outDir, `lev15-${rec.row.policy}-s${rec.row.seed}.json`);
  fs.writeFileSync(f, JSON.stringify({
    seed: rec.row.seed, policy: rec.row.policy, days: rec.row.days,
    endReason: rec.row.endReason, trajHash: rec.row.trajHash,
    national: { reached: rec.row.nationalReached, mode: rec.row.lossMode, firstDay: rec.row.firstNatDay, holdDays: rec.row.holdDays },
    tableSeat: rec.row.tableSeat, maxWave: rec.row.maxWave, won: rec.row.won,
    rankAtEnd: rec.rankAtEnd,
    attribution: { attributed: rec.audit.attributed, misses: rec.audit.misses, rate: rec.audit.rate },
    instrumentErrors: rec.census.errors,
    events: rec.census.events,
    depth: rec.census.depth,
    outcomes: rec.outcomes,
    leverageSayLines: rec.census.sayLeverage,
    deaths: rec.deaths,
    beats: rec.beats,
    waveUnlockDays: rec.waveUnlockDays,
  }, null, 1));
  return f;
}

function summarize(rows) {
  const S = {
    nRuns: rows.length, totalEvents: 0,
    byCallSite: {}, byRole: {}, byAge: { young: 0, old: 0 }, byYoungNat: { youngNat: 0, notYoungNat: 0 },
    depthDist: {}, outcomes: {}, attribRates: [],
    hikes: [], trustHike: [],
  };
  for (const r of rows) S.totalEvents += r.nLeverageEvents;
  // per-run rows don't carry events; the sweep aggregates from per-seed files
  return S;
}

async function main() {
  if (process.env.SMOKE === '1') {
    console.log('SMOKE: 15d x {leadfeast,belongfeast}');
    let fail = 0;
    for (const pid of PIDS) {
      const { row, census } = await oneRun(11, pid, 15);
      const okRun = row.nSamples >= 10 && row.days === 15 && census.errors.length === 0;
      if (okRun) console.log(`  PASS ${pid} — ${row.nSamples} samples, 15d, no instrument errors`);
      else { fail++; console.log(`  FAIL ${pid} — nSamples=${row.nSamples} days=${row.days} errors=${census.errors.length}`); }
    }
    if (fail) { console.error('SMOKE FAILED'); process.exit(1); }
    console.log('SMOKE GREEN');
    return;
  }

  const rows = [], allEvents = [], allOutcomes = [], auditAll = { attributed: 0, misses: 0 };
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      console.log(`run ${pid} seed ${seed} …`);
      const rec = await oneRun(seed, pid, DAYS);
      rows.push(rec.row);
      allEvents.push(...rec.census.events.map(e => Object.assign({ seed, policy: pid }, e)));
      allOutcomes.push(...rec.outcomes.map(o => Object.assign({ seed, policy: pid }, o)));
      auditAll.attributed += rec.audit.attributed;
      auditAll.misses += rec.audit.misses.length;
      const f = writePerSeed(rec, TELEMETRY_DIR);
      console.log(`  → ${f} (${rec.row.days}d, ${rec.row.endReason || 'done'}, events=${rec.row.nLeverageEvents}, attrib=${(rec.row.attribRate * 100).toFixed(1)}%)`);
    }
  }

  const attribRate = (auditAll.attributed + auditAll.misses) === 0 ? 1
    : auditAll.attributed / (auditAll.attributed + auditAll.misses);

  const byCallSite = {}, byRole = {}, byAge = { young: 0, old: 0 },
    byYoungNat = { inWindow: 0, outOfWindow: 0 }, depthDist = {},
    outcomes = {}, hikes = [];
  for (const e of allEvents) {
    byCallSite[e.callSite] = (byCallSite[e.callSite] || 0) + 1;
    byRole[e.role] = (byRole[e.role] || 0) + 1;
    if (e.oldLink) byAge.old++; else byAge.young++;
    if (e.youngNational) byYoungNat.inWindow++; else byYoungNat.outOfWindow++;
    depthDist[e.depthNew] = (depthDist[e.depthNew] || 0) + 1;
    hikes.push(e.weeklyHike);
  }
  for (const o of allOutcomes) outcomes[o.outcome] = (outcomes[o.outcome] || 0) + 1;
  hikes.sort((a, b) => a - b);
  const hikeStats = hikes.length ? {
    n: hikes.length, min: hikes[0], max: hikes[hikes.length - 1],
    p50: hikes[Math.floor(hikes.length / 2)],
    p90: hikes[Math.min(hikes.length - 1, Math.floor(hikes.length * 0.9))],
    mean: Math.round(hikes.reduce((t, x) => t + x, 0) / hikes.length),
  } : null;

  const natRuns = rows.filter(r => r.nationalReached).length;
  const tableRuns = rows.filter(r => r.tableReached).length;
  const wonRuns = rows.filter(r => r.won).length;
  const medianDays = rows.map(r => r.days).sort((a, b) => a - b)[Math.floor(rows.length / 2)];

  const summary = {
    substrate: 'FEASTSCALE_R13=1, leadfeast/belongfeast base (TRIBSHIELD unset)', seeds: SEEDS, policies: PIDS, days: DAYS,
    nRuns: rows.length, medianDays, nationalRuns: natRuns, tableRuns, wonRuns,
    totalLeverageEvents: allEvents.length,
    attribution: { attributed: auditAll.attributed, misses: auditAll.misses, rate: attribRate },
    byCallSite, byRole, byAge, byYoungNat, depthDist, outcomes,
    weeklyHikeKcal: hikeStats,
    rows: rows.map(r => ({ seed: r.seed, policy: r.policy, days: r.days, endReason: r.endReason, nationalReached: r.nationalReached, nEvents: r.nLeverageEvents, attribRate: r.attribRate })),
  };
  const sf = path.join(TELEMETRY_DIR, 'lev15-summary.json');
  fs.writeFileSync(sf, JSON.stringify(summary, null, 1));

  console.log('\n=== LEV15 CENSUS SUMMARY ===');
  console.log(`runs: ${summary.nRuns} (median ${medianDays}d)  national: ${natRuns}  table: ${tableRuns}  wins: ${wonRuns}`);
  console.log(`leverage events: ${allEvents.length}  attribution rate: ${(attribRate * 100).toFixed(1)}% (bar ≥90%)`);
  console.log('by call site: ' + JSON.stringify(byCallSite));
  console.log('by role: ' + JSON.stringify(byRole));
  console.log('by age: ' + JSON.stringify(byAge) + '  (old = ≥21d, the #323 path)');
  console.log('young-national window: ' + JSON.stringify(byYoungNat));
  console.log('compounding depth: ' + JSON.stringify(depthDist));
  console.log('outcomes: ' + JSON.stringify(outcomes));
  console.log('weekly hike kcal: ' + JSON.stringify(hikeStats));
  console.log('summary → ' + sf);
  if (attribRate < 0.9) { console.error('LEV15 ATTRIBUTION BAR MISSED (<90%)'); process.exit(1); }
  console.log('LEV15 CENSUS GO (diagnostic): attribution bar met');
}

main().catch((e) => { console.error('LEV15 FATAL', e); process.exit(2); });
