#!/usr/bin/env node
// winloss-sweep-20261018.js — RUN-LOSS CENSUS on the recalibrated bar
// (flesh-out loop arm sim-winloss-a, 2026-10-18, axis scale-onramp,
// run fleshout-20261018T1615Z, loop A).
//
// LINEAGE: evidence/2026-10-18/sim-vetwindow.md attributed veteran deaths
// but NOT run losses. This arm attributes the NON-WINNING runs.
//
// INSTRUMENT-ONLY ARM: zero src/js changes, zero scripts/policies changes.
// Instruments + evidence only. The instrument wraps Game.tele and two field
// router methods per-run (pure recording, no state writes, no RNG draws)
// and samples daily state (roster, standing, readiness, waves, scale, arc,
// pantry, seat, scholar successions). The DET gate proves the trajectories
// are byte-identical with the instrument attached vs bare.
//
// SUBSTRATE (winseat — copied EXACTLY from evidence/2026-10-18/
// sim-vetwindow.md):
//   withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
//   VETREL=1 REPOSITION=1 NODEWITNESS=1 SEATDRIVE=1 explicit.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//   (+ WINPURSUIT=1 WINDEFER=1 set in-process; the windefer wrapper is
//   composed, so the env is live, exactly as the defercensus2b corpus).
//
// DEATH-CHANNEL TAXONOMY: vetwindow's classifyDeath, with the documented
// correction applied (sim-vetwindow metric review #6): 'dehydration' is
// thirst-death and maps to haven per taxonomy intent (the cause string is
// normalized to 'thirst' BEFORE classification). Every observed cause maps
// to exactly one channel; 'other' is a legitimate channel, never a void.
//
// RUN-LOSS TAXONOMY (classifyRunLoss — pure, unit-tested):
//   won                 -> terminal 'won' (no channel; counted for reachability)
//   villageLost         -> 'village-lost:<sub>' by final-30d death channels +
//                          pantry: starvation-cascade | combat-grind | disease | mixed
//   nomadWiped          -> 'nomad-wiped' (over, !won, !villageLost, legend 'nomad')
//   over-other          -> 'over-other:<legend-outcome>' (named, never void)
//   survived (180d)     -> 'stall-seat:<bar>' (largest-gap lesser-seat bar) |
//                          'stall-invite' (seat earned, tableWaiting never fired) |
//                          'stall-table' (tableWaiting fired, never won)
//
// Usage:
//   SEATDRIVE=1 VETREL=1 REPOSITION=1 NODEWITNESS=1 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/winloss-sweep-20261018.js
//   SMOKE=1 ...       # short smoke: both policies drive, census live, instrument clean
//   DET=1 ...         # det-gate: instrument-on vs instrument-off byte-identical trajectories (2 seeds x 60d), both-repeat stable
//   FIDELITY=1 ...    # fidelity: re-run 2 completed sweep seeds, byte-identical per-seed JSON
// Targeted: SEEDS="59101,59102" ONLY="leadfeast"
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const VR = require('./policies/vetrel');
const RP = require('./policies/reposition');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { sampleReadiness, attributeRun } = require('./wave4census-lib-20261017');
// Reuse the proven death-taxonomy machinery from the sibling diagnostic.
// LAZY require: vetwindow-sweep asserts the winseat env at module load, so
// requiring it eagerly would make this module un-requireable without the env.
// The pure classifiers must stay require-safe.
let _VW = null;
function VW() { if (!_VW) _VW = require('./vetwindow-sweep-20261018'); return _VW; }

const SUBSTRATE = 'winseat';
// Substrate assertions run only when this module is the entry point —
// requiring it (for the pure classifiers) must never exit.
function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (winseat substrate).`); process.exit(2); }
  }
  if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [59101, 59102, 59103, 59104, 59105, 59106, 59107, 59108]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const T4 = 100;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-winloss-a');
const isBare = () => process.env.WINLOSS_BARE === '1';

// Policy composition — winseat, EXACTLY as evidence/2026-10-18/sim-vetwindow.md.
function policyFor(policyId) { return VW().policyFor(policyId); }

// ---------------------------------------------------------------------------
// Death cause normalization (the sim-vetwindow metric-review #6 correction):
// 'dehydration' IS thirst-death; map to haven per taxonomy intent.
function normalizeCause(causeRaw) {
  const cause = String(causeRaw == null ? 'unknown' : causeRaw);
  if (cause.toLowerCase() === 'dehydration') return 'thirst';
  return cause;
}

function classifyDeathWL(causeRaw, ctx, monsterNames) {
  return VW().classifyDeath(normalizeCause(causeRaw), ctx, monsterNames);
}

// ---------------------------------------------------------------------------
const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function monsterNameSet(Game) {
  const set = new Set();
  try {
    for (const m of (Game.data && Game.data.monsters) || []) {
      if (m && m.name) set.add(String(m.name).toLowerCase());
      if (m && m.id) set.add(String(m.id).toLowerCase().replace(/_/g, ' '));
      if (m && m.id) set.add(String(m.id).toLowerCase());
    }
  } catch (e) {}
  return set;
}

function livingPop(Game) {
  try {
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    let n = 0;
    for (const id of (v.roster || [])) {
      if (id === sid) { n++; continue; }
      try { if ((Game.getPerson(id) || {}).dead) continue; } catch (e) {}
      n++;
    }
    return n;
  } catch (e) { return -1; }
}

function pantryKcal(Game) {
  try {
    if (typeof Game.pantryKcalLive === 'function') {
      const k = Game.pantryKcalLive(Game.state.village) || 0;
      if (k) return k;
    }
  } catch (e) {}
  try {
    return (((Game.state.village || {}).pantry) || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return -1; }
}

function seatNow(Game) {
  try {
    const s = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
    if (!s) return { seat: 'none', detail: {} };
    return { seat: s.seat || 'none', detail: s.detail || {} };
  } catch (e) { return { seat: 'none', detail: {}, err: String(e.message || e).slice(0, 80) }; }
}

function arcNow(Game) {
  try { return (Game.progState() || {}).arc | 0; } catch (e) { return -1; }
}

// Per-run death capture: same proven pattern as vetwindow (wraps Game.tele
// + the two field routers). Pure recording — no state writes, no RNG draws.
function installWinlossCapture(Game, C) {
  C._router = null;
  const wrapRouter = (name, flag) => {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { C.instrumentErrors++; return; }
      Game[name] = function (...args) {
        const prev = C._router;
        C._router = flag;
        try { return orig.apply(this, args); }
        finally { C._router = prev; }
      };
    } catch (e) { C.instrumentErrors++; }
  };
  wrapRouter('resolvePatrol', 'patrol');
  wrapRouter('resolveWildMonsterEncounter', 'wild');
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          C.deathRecs.push({
            day: scholarDay(Game),
            who: data && data.who != null ? String(data.who) : null,
            cause: data && data.cause != null ? String(data.cause) : 'unknown',
            kind: data && data.kind != null ? String(data.kind) : null,
            player: !!(data && data.player),
            ctx: {
              aid: (() => { try { return !!(Game.aidCrisis && Game.aidCrisis()); } catch (e) { return false; } })(),
              atHaven: (() => { try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; } })(),
              inTb: !!Game.tbfight,
              router: C._router || null,
              onExped: (() => {
                try {
                  const st = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
                  const who = data && data.who != null ? String(data.who) : null;
                  return !!(st && st.exped && who && st.exped[who]);
                } catch (e) { return false; }
              })(),
            },
          });
        }
      } catch (e) { C.instrumentErrors++; }
      return r;
    };
  } catch (e) { C.instrumentErrors++; }
}

function withWinloss(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      ctx._wl = {
        snaps: [], hashes: [], deathRecs: [],
        traj: [],            // daily {day, pop, pantry, raw, peak, wave, arc, seat, scholar}
        successionDays: [],  // days the scholar vid changed
        _lastScholar: null,
        maxWave: 1, wave4Day: null, wave5Day: null,
        nationalDay: null, maxArc: 1,
        invites: 0, _wasWaiting: false,
        instrumentErrors: 0,
      };
      const oSetup = base.setup;
      if (oSetup) return oSetup(Game, ctx);
    },
    daily(Game, ctx) {
      const C = ctx._wl;
      const oDaily = base.daily;
      let r;
      try { r = oDaily ? oDaily(Game, ctx) : undefined; } catch (e) { r = undefined; }
      if (C) {
        // Trajectory hash ALWAYS recorded (bare and census alike).
        try { C.hashes.push(scholarDay(Game) + ':' + dayHash(Game)); } catch (e) {}
      }
      if (C && !isBare()) {
        try {
          const day = scholarDay(Game);
          const sv = String(Game.villagerId || '?');
          if (C._lastScholar != null && C._lastScholar !== sv) C.successionDays.push(day);
          C._lastScholar = sv;
          let sr = null;
          try { sr = sampleReadiness(Game); C.instrumentErrors += (sr.err | 0); }
          catch (e) { C.instrumentErrors++; }
          const seat = seatNow(Game);
          if (seat.err) C.instrumentErrors++;
          const w = Game.unlockedWave ? Game.unlockedWave() : 1;
          if (w > C.maxWave) C.maxWave = w;
          if (w >= 4 && C.wave4Day == null) C.wave4Day = day;
          if (w >= 5 && C.wave5Day == null) C.wave5Day = day;
          const rank = Game.scaleRank ? Game.scaleRank() : 'village';
          if ((rank === 'national' || rank === 'global') && C.nationalDay == null) C.nationalDay = day;
          const arc = arcNow(Game);
          if (arc > C.maxArc) C.maxArc = arc;
          const pg = Game.progState ? Game.progState() : null;
          if (pg) {
            if (pg.tableWaiting && !C._wasWaiting) { C.invites++; }
            C._wasWaiting = !!pg.tableWaiting;
          }
          C.traj.push({
            day, pop: livingPop(Game), pantry: pantryKcal(Game),
            raw: sr ? (sr.raw | 0) : -1, peak: sr ? (sr.peak | 0) : -1,
            wave: w, arc, seat: seat.seat, scholar: sv.slice(0, 16),
          });
          if (sr) C.snaps.push(sr);
        } catch (e) { C.instrumentErrors++; }
      }
      return r;
    },
  });
}

// Classify ALL real person deaths (dedup + kind-filter + phantom-check,
// same proven machinery as vetwindow). Returns per-death rows + counts.
function attributeAllDeaths(Game, C, monsterNames) {
  const seen = new Set();
  const rows = [];
  let phantoms = 0, unverifiable = 0, rawCount = (C.deathRecs || []).length;
  const causeSpace = {};
  for (const t of (C.deathRecs || [])) {
    if (!VW().isPersonDeath(t)) continue;
    const key = [t.who, t.day, t.cause].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    causeSpace[t.cause] = (causeSpace[t.cause] || 0) + 1;
    const real = VW().diedForReal(Game, t.who);
    if (real === false) { phantoms++; continue; }
    if (real === null) { unverifiable++; continue; }
    const [channel, rule] = classifyDeathWL(t.cause, t.ctx, monsterNames);
    let name = t.who;
    try { name = String(Game.displayName ? Game.displayName(t.who) : t.who).split(' ')[0]; } catch (e) {}
    rows.push({ who: String(t.who), name, day: t.day | 0, cause: t.cause,
      causeNorm: normalizeCause(t.cause), channel, rule, player: !!t.player });
  }
  return { rows, rawCount, dedupedCount: seen.size, phantoms, unverifiable,
    causeSpace, unattributed: 0 };
}

// ---------------------------------------------------------------------------
// classifyRunLoss(input) -> {terminal, channel, evidence}. PURE. input:
//   {won, villageLost, legendOutcome, gameDays, finalSeat, seatDetail,
//    tableInvites, rosterTraj:[{day,pop}], pantryEnd, finalWindowDeaths:[{channel}],
//    lastScholarDeath:{cause,channel,day}|null, successionCount}
// Terminal precedence: won > villageLost > nomadWiped > over-other > survived.
function classifyRunLoss(inp) {
  const ev = {};
  if (inp.won) return { terminal: 'won', channel: null, evidence: ev };
  if (inp.villageLost) {
    ev.lastScholarDeath = inp.lastScholarDeath || null;
    ev.successionCount = inp.successionCount | 0;
    ev.pantryEnd = inp.pantryEnd;
    const fw = inp.finalWindowDeaths || [];
    const n = fw.length;
    const cnt = {};
    for (const d of fw) cnt[d.channel] = (cnt[d.channel] || 0) + 1;
    ev.finalWindowDeaths = n;
    ev.finalWindowChannels = cnt;
    const frac = (c) => n ? (cnt[c] || 0) / n : 0;
    const logistics = frac('haven'); // starvation/thirst/dehydration/wounds
    const combat = frac('raid') + frac('expedition') + frac('wild') + frac('patrol');
    const disease = frac('disease');
    let sub;
    if ((inp.pantryEnd | 0) <= 0 && logistics >= 0.4) sub = 'starvation-cascade';
    else if (logistics >= 0.4) sub = 'starvation-cascade';
    else if (combat >= 0.5) sub = 'combat-grind';
    else if (disease >= 0.5) sub = 'disease';
    else sub = 'mixed';
    ev.cascadeRule = `pantryEnd=${inp.pantryEnd} logistics=${logistics.toFixed(2)} combat=${combat.toFixed(2)} disease=${disease.toFixed(2)} n=${n}`;
    return { terminal: 'village-lost', channel: 'village-lost:' + sub, evidence: ev };
  }
  const legend = String(inp.legendOutcome || '');
  if (legend === 'nomad') return { terminal: 'nomad-wiped', channel: 'nomad-wiped', evidence: ev };
  if (inp.gameOver) {
    return { terminal: 'over-other:' + (legend || 'unknown'),
      channel: 'over-other:' + (legend || 'unknown'), evidence: ev };
  }
  // Survived the horizon without winning — diagnose the win-path block.
  const seat = String(inp.finalSeat || 'none');
  ev.finalSeat = seat;
  if (seat === 'full' || seat === 'lesser') {
    if ((inp.tableInvites | 0) === 0) {
      ev.inviteRule = 'seat earned but tableWaiting never fired';
      return { terminal: 'survived', channel: 'stall-invite', evidence: ev };
    }
    ev.inviteRule = `tableWaiting fired ${inp.tableInvites}x but run never won`;
    return { terminal: 'survived', channel: 'stall-table', evidence: ev };
  }
  const d = inp.seatDetail || {};
  const bars = [
    ['w1-faced', (d.w1 | 0) / 4], ['w2-faced', (d.w2 | 0) / 4], ['w3-faced', (d.w3 | 0) / 3],
    ['contests', (d.contestsN | 0) / 2], ['crises', (d.crisesN | 0) / 2],
    ['scale', (d.rank === 'regional' || d.rank === 'national' || d.rank === 'global') ? 1 : 0],
    ['stage', (d.stage | 0) / 2], ['food-thesis', d.foodDeeds ? 1 : 0],
  ];
  let worst = bars[0], worstFrac = 2;
  for (const b of bars) if (b[1] < worstFrac) { worst = b; worstFrac = b[1]; }
  ev.seatDetail = d;
  ev.worstBar = { bar: worst[0], frac: +worstFrac.toFixed(3) };
  return { terminal: 'survived', channel: 'stall-seat:' + worst[0], evidence: ev };
}

function lastLegendOutcome(Game) {
  try {
    const lin = (typeof Game.lineage === 'function') ? Game.lineage() : [];
    if (lin && lin.length) return String(lin[lin.length - 1].outcome || '');
  } catch (e) {}
  return '';
}

async function oneRun(seed, policyId, opts) {
  opts = opts || {};
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const base = policyFor(policyId);
  const policy = withWinloss(base, base.id + '-winloss', base.desc + ' [WINLOSS]');
  const { Game } = await loadGame({ seed, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);
  const monsterNames = monsterNameSet(Game);
  const C_holder = {};
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup(G, ctx);
    try { if (!isBare()) installWinlossCapture(G, ctx._wl); } catch (e) {}
    C_holder.C = ctx._wl;
    return r;
  };
  let result;
  const days = opts.days || DAYS;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  const C = C_holder.C || { snaps: [], hashes: [], deathRecs: [], traj: [], successionDays: [],
    maxWave: 1, wave4Day: null, wave5Day: null, nationalDay: null, maxArc: 1, invites: 0, instrumentErrors: 0 };
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= days ? 'survived' : (result.endReason || 'ended'));
  const won = !!Game.won;
  const lastDay = result.gameDays | 0;
  let runLoss = null, attr = null;
  if (!isBare()) {
    attr = attributeAllDeaths(Game, C, monsterNames);
    const finalWindowDeaths = attr.rows.filter(d => d.day >= lastDay - 30);
    const playerDeaths = attr.rows.filter(d => d.player);
    const lastScholarDeath = playerDeaths.length ? playerDeaths[playerDeaths.length - 1] : null;
    const seat = seatNow(Game);
    const traj = C.traj || [];
    const pantryEnd = traj.length ? traj[traj.length - 1].pantry : -1;
    runLoss = classifyRunLoss({
      won, villageLost: !!Game.villageLost, gameOver: !!Game.over,
      legendOutcome: lastLegendOutcome(Game), gameDays: lastDay,
      finalSeat: seat.seat, seatDetail: seat.detail, tableInvites: C.invites | 0,
      rosterTraj: traj.map(t => ({ day: t.day, pop: t.pop })),
      pantryEnd, finalWindowDeaths, lastScholarDeath,
      successionCount: (C.successionDays || []).length,
    });
  }
  let binding = null;
  try { binding = attributeRun(C.snaps, { t4: T4 }); } catch (e) { binding = { binding: 'ERR:' + e.message }; }
  const out = {
    seed, policyId, substrate: SUBSTRATE, mode: 'winloss',
    days: result.days, gameDays: result.gameDays, endReason,
    won: won ? 1 : 0, villageLost: Game.villageLost ? 1 : 0,
    legendOutcome: lastLegendOutcome(Game),
    maxWave: C.maxWave | 0, wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    nationalDay: C.nationalDay, national: C.nationalDay != null ? 1 : 0,
    table: (C.invites | 0) > 0 ? 1 : 0, tableInvites: C.invites | 0,
    maxArc: C.maxArc | 0,
    instrumentErrors: C.instrumentErrors | 0,
    successionCount: (C.successionDays || []).length,
    successionDays: C.successionDays || [],
    deaths: attr ? attr.rows : [],
    deathCount: attr ? attr.rows.length : 0,
    rawDeathTeles: attr ? attr.rawCount : 0,
    phantomDeaths: attr ? attr.phantoms : 0,
    unverifiableDeaths: attr ? attr.unverifiable : 0,
    causeSpace: attr ? attr.causeSpace : {},
    runLoss,
    traj: C.traj || [],
    binding: binding ? binding.binding : null,
    hashes: C.hashes, snaps: C.snaps,
  };
  if (!opts.noWrite) {
    fs.mkdirSync(EVID, { recursive: true });
    fs.writeFileSync(path.join(EVID, `${SUBSTRATE}-${policyId}-s${seed}.json`), JSON.stringify(out));
  }
  return out;
}

function bindingOf(out) {
  return attributeRun(out.snaps, { t4: T4 }).binding;
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    const out = await oneRun(59101, policyId, { days: 15, noWrite: true });
    check(`[${policyId}] run completes`, out.days >= 15, `days=${out.days}`);
    check(`[${policyId}] trajectory live`, (out.traj || []).length >= 10, `traj=${(out.traj || []).length}`);
    check(`[${policyId}] 0 instrument errors`, out.instrumentErrors === 0, `err=${out.instrumentErrors}`);
    check(`[${policyId}] death capture live`, out.rawDeathTeles >= 0, `raw=${out.rawDeathTeles} classified=${out.deathCount}`);
    check(`[${policyId}] pantry/standing sampled`, (out.traj[0] || {}).pantry >= 0 && (out.traj[0] || {}).raw >= 0,
      `pantry0=${(out.traj[0] || {}).pantry} raw0=${(out.traj[0] || {}).raw}`);
    check(`[${policyId}] run-loss classifier returns a verdict`, !!out.runLoss && !!out.runLoss.terminal,
      `terminal=${out.runLoss ? out.runLoss.terminal : '?'}`);
  }
  delete process.env.WINDEFER;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE [winseat]: both policies drive, run-loss census live.');
}

async function detGate() {
  const seeds = [59101, 59102];
  const days = 60;
  let green = 0, total = 0;
  for (const seed of seeds) {
    process.env.WINLOSS_BARE = '1';
    const hB1 = (await oneRun(seed, 'leadfeast', { days, noWrite: true })).hashes.join('\n');
    const hB2 = (await oneRun(seed, 'leadfeast', { days, noWrite: true })).hashes.join('\n');
    delete process.env.WINLOSS_BARE;
    const hC1 = (await oneRun(seed, 'leadfeast', { days, noWrite: true })).hashes.join('\n');
    const hC2 = (await oneRun(seed, 'leadfeast', { days, noWrite: true })).hashes.join('\n');
    const bareStable = hB1 === hB2;
    const censusStable = hC1 === hC2;
    const identical = bareStable && censusStable && hB1 === hC1;
    total++;
    if (identical) green++;
    console.log(`  seed ${seed}: bare-stable=${bareStable} census-stable=${censusStable} instrument-identical=${hB1 === hC1} ${identical ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`DET-GATE [winseat]: ${green}/${total} identical.`);
  if (green < total) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

async function fidelityGate() {
  const pairs = [['leadfeast', 59101], ['belongfeast', 59102]];
  let green = 0;
  for (const [policyId, seed] of pairs) {
    const fp = path.join(EVID, `${SUBSTRATE}-${policyId}-s${seed}.json`);
    if (!fs.existsSync(fp)) { console.error(`FIDELITY STOP: ${fp} missing — run the sweep first.`); process.exit(5); }
    const orig = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const rerun = await oneRun(seed, policyId, { noWrite: true });
    const ok = JSON.stringify(orig) === JSON.stringify(rerun);
    if (ok) green++;
    console.log(`  [${policyId} s${seed}] byte-identical=${ok} runLoss=${JSON.stringify(orig.runLoss && orig.runLoss.channel)} -> ${JSON.stringify(rerun.runLoss && rerun.runLoss.channel)} ${ok ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`FIDELITY [winseat]: ${green}/${pairs.length} reproduced byte-identical.`);
  if (green < pairs.length) { console.error('FIDELITY FAILED — seeded determinism broken.'); process.exit(6); }
  console.log('FIDELITY gate green.');
}

(async () => {
  if (require.main !== module) return;
  assertSubstrate();
  let only = null;
  if (process.env.ONLY) {
    only = {};
    for (const part of process.env.ONLY.split(';')) { const p = part.trim(); if (p) only[p] = true; }
  }
  if (process.env.SMOKE === '1') await smokeGate();
  else if (process.env.DET === '1') await detGate();
  else if (process.env.FIDELITY === '1') await fidelityGate();
  else {
    for (const policyId of POLICIES) {
      if (only && !only[policyId]) continue;
      for (const seed of SEEDS) {
        const out = await oneRun(seed, policyId);
        const rl = out.runLoss || {};
        console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} w=${out.maxWave} arc=${out.maxArc} nat=${out.national} table=${out.table} loss=${rl.terminal || '?'}:${rl.channel || '?'} deaths=${out.deathCount} succ=${out.successionCount} binding=${out.binding} ierr=${out.instrumentErrors}`);
      }
    }
  }
  delete process.env.WINDEFER;
  console.log(`\nSWEEP DONE [${SUBSTRATE}] — per-seed JSONs in evidence/2026-10-18/perseed-winloss-a/.`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { withWinloss, classifyDeathWL, normalizeCause, classifyRunLoss, attributeAllDeaths,
  installWinlossCapture, policyFor, oneRun, bindingOf, assertSubstrate, SEEDS, POLICIES, T4, SUBSTRATE };
