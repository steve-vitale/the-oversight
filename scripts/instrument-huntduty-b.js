#!/usr/bin/env node
// scripts/instrument-huntduty-b.js — HUNT-DUTY ASSIGNMENT AUDIT (flesh-out
// loop B, 2026-10-17, arm sim-huntduty-b, finding #483's named next).
//
// The camp-task census (sim-camptasks-b) measured hunt duties NEVER ASSIGNED
// (0/672 duty resolutions across 16 runs) while Game.villagerHuntResolve
// exists and resolves through the player's own hunt chance machinery. This
// instrument classifies 100% of the duty stream on the courtship substrate:
//
//   assignTask:    every Game.assignTask call -> {task, caller-classified, outcome}
//   resolutions:   every resolveOneAssignment  -> {taskIn, taskOut, caller-classified}
//   huntResolves:  every villagerHuntResolve   -> {caller-classified, kcal}
//   butchers:      every cleanCarcass          -> {caller-classified}
//   beats:         hunt beats (sense reads)
//
// INSTRUMENT HONESTY: wraps are read-only (stack capture + counters only,
// zero RNG draws, zero state writes); attribution comes from the call
// stack classified against policy/engine frames. The det-gate in
// scripts/test-huntduty-b.js proves byte-identical trajectories
// (instrument on vs off).
//
// ZERO src/js, ZERO scripts/policies edits. Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/instrument-huntduty-b.js
// Targeted: SEEDS="7611" POLICIES="leadfeast" DAYS=60 SMOKE=1 ...
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [7611, 7612, 7613, 7614, 7615, 7616, 7617, 7618]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-huntduty');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

// ---- attribution ----
// Policy code is real files (not eval'd), so paths show in the stack.
function classifyActor() {
  let st = '';
  try { st = new Error().stack || ''; } catch (e) { st = ''; }
  const pm = st.match(/scripts\/policies\/([^\):\n]+)/);
  if (pm) return 'policy:' + pm[1].replace(/\.js$/, '');
  // duty-resolve before fixture: a firing reached THROUGH resolveOneAssignment
  // is on the duty path even when a test triggered the resolution call.
  if (/resolveOneAssignment/.test(st)) return 'duty-resolve';
  if (/test-huntduty-b\.js/.test(st)) return 'fixture';
  if (/scripts\/instrument-huntduty-b\.js/.test(st) && /daily/.test(st)) return 'instrument';
  if (/src\/js\/app\.js/.test(st)) return 'ui';
  if (/src\/js\/game\.js|src\/js\/food\.js|src\/js\/npc/.test(st)) return 'engine';
  return 'unknown';
}

const HUNT_WORDS = ['hunter', 'tracker', 'ranger', 'soldier', 'marine', 'poacher'];
const COMP_HIGH = HUNT_WORDS; // occupations with hunt competence 1.4
const COMP_MID = ['butcher', 'farmer', 'athlete']; // 1.2

// Eligibility snapshot: roster members who could hold a hunt duty.
// Pure reads (no RNG): occupation match, HP floor, alive. Mirrors the
// engine gates: checkObedience is trust-gated (can't read intent here),
// HP<40 is a hard refusal at assign and at resolution.
function eligibilitySnapshot(Game) {
  const out = { hunters14: 0, hunters12: 0, huntersHPok: 0, roster: 0, hp40fail: 0 };
  try {
    const v = Game.state.village || {};
    const roster = v.roster || [];
    out.roster = roster.length;
    for (const vid of roster) {
      let p = null;
      try { p = Game.getPerson(vid); } catch (e) {}
      if (!p || p.dead) continue;
      const occ = String((p.formerOccupation || p.occupation || '')).toLowerCase();
      const hi = COMP_HIGH.some(w => occ.includes(w));
      const mid = COMP_MID.some(w => occ.includes(w));
      let hp = 100;
      try { hp = ((v.health || {})[vid] !== undefined) ? v.health[vid] : 100; } catch (e) {}
      if (hi) { out.hunters14++; if (hp >= 40) out.huntersHPok++; else out.hp40fail++; }
      else if (mid) { out.hunters12++; if (hp >= 40) out.huntersHPok++; else out.hp40fail++; }
    }
  } catch (e) {}
  return out;
}

function attachHuntInstrument(Game, t) {
  t.assigns = [];   // assignTask attempts
  t.resolves = [];  // resolveOneAssignment calls
  t.huntResolves = []; // villagerHuntResolve calls
  t.butchers = [];  // cleanCarcass calls
  t.beats = [];
  t.errors = t.errors || 0;

  // 1. assignTask: who asks for which duty, and what the engine says.
  //    Read-only: call orig, record outcome from the returned object +
  //    the assignments map (no writes of our own).
  try {
    if (typeof Game.assignTask !== 'function') { t.errors++; }
    else {
      const orig = Game.assignTask.bind(Game);
      Game.assignTask = function (vid, task, opts) {
        const caller = classifyActor();
        let out = null, thrownErr = null;
        try { out = orig(vid, task, opts); } catch (e) { thrownErr = e; }
        try {
          let outcome = 'unknown';
          if (thrownErr) outcome = 'threw';
          else if (out && out.ok === true) {
            try {
              const a = (Game.state.village.assignments || {})[vid];
              outcome = (a && a.task === task) ? 'assigned' : 'assigned-unrecorded';
            } catch (e) { outcome = 'assigned'; }
          } else if (out && out.ok === false) outcome = out.refused ? 'refused' : 'failed';
          else if (out === null) outcome = 'gate-null';
          t.assigns.push({ day: gday(Game), task: String(task), vid: String(vid), caller, outcome });
        } catch (e) { t.errors++; }
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }

  // 2. resolveOneAssignment: the duty stream itself. The PRODTHROTTLE
  //    redirect can rewrite a.task inside the engine — record taskIn
  //    (what the caller asked) and taskOut (what resolved).
  try {
    if (typeof Game.resolveOneAssignment !== 'function') { t.errors++; }
    else {
      const orig = Game.resolveOneAssignment.bind(Game);
      Game.resolveOneAssignment = function (vid, a) {
        const caller = classifyActor();
        const taskIn = a && a.task ? String(a.task) : '?';
        let out = null, thrownErr = null;
        try { out = orig(vid, a); } catch (e) { thrownErr = e; }
        try {
          const taskOut = a && a.task ? String(a.task) : '?';
          t.resolves.push({ day: gday(Game), vid: String(vid), taskIn, taskOut, caller, threw: !!thrownErr });
        } catch (e) { t.errors++; }
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }

  // 3. villagerHuntResolve: the hunt machinery. Attribute its caller —
  //    duty-resolve (via resolveOneAssignment 'hunt') vs anything else.
  try {
    if (typeof Game.villagerHuntResolve !== 'function') { t.errors++; }
    else {
      const orig = Game.villagerHuntResolve.bind(Game);
      Game.villagerHuntResolve = function (vid, eff) {
        const caller = classifyActor();
        let out = null, thrownErr = null;
        try { out = orig(vid, eff); } catch (e) { thrownErr = e; }
        try {
          const kcal = num(out && out.kcal);
          t.huntResolves.push({ day: gday(Game), vid: String(vid), caller, kcal, threw: !!thrownErr });
        } catch (e) { t.errors++; }
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }

  // 4. cleanCarcass: resolve the census contradiction — who fires the
  //    butcher verb: policy trapper-loop vs hunt-duty machinery.
  try {
    if (typeof Game.cleanCarcass !== 'function') { t.errors++; }
    else {
      const orig = Game.cleanCarcass.bind(Game);
      Game.cleanCarcass = function (idx, container) {
        const caller = classifyActor();
        let out = null, thrownErr = null;
        try { out = orig(idx, container); } catch (e) { thrownErr = e; }
        try { t.butchers.push({ day: gday(Game), caller, threw: !!thrownErr }); } catch (e) { t.errors++; }
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }

  // 5. hunt beat ring (sense reads): capture any beat mentioning hunts.
  try {
    const base = Game.say && Game.say.bind(Game);
    if (!base) { t.errors++; }
    else {
      const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 500);
      Game.say = function (msg) {
        try {
          const s = strip(msg);
          if (/hunt|🏹|stalk|trapline|traps/i.test(s)) {
            t.beats.push({ day: gday(Game), text: s });
            if (t.beats.length > 2000) t.beats.splice(0, 400);
          }
        } catch (e) { t.errors++; }
        return base(msg);
      };
    }
  } catch (e) { t.errors++; }
}

// ---- death tele (wall metrics) ----
function attachDeathInstrument(Game, t) {
  t.deaths = [];
  try {
    const oTele = Game.tele ? Game.tele.bind(Game) : null;
    Game.tele = function (type, data) {
      const r = oTele ? oTele.apply(this, arguments) : undefined;
      try {
        if (type === 'death') {
          const cause = data && (data.cause == null ? null : String(data.cause));
          t.deaths.push({ day: gday(Game), who: data && data.who, cause, player: !!(data && data.player) });
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
}

// ---- hunt-beat ring (sense reads) ----
// (kept as a named export for the proof test's PART A parity check)
function attachBeatRing(Game, t) {
  t.beats = t.beats || [];
  try {
    const base = Game.say && Game.say.bind(Game);
    if (!base) { t.errors++; return; }
    const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
    Game.say = function (msg) {
      try {
        const s = strip(msg);
        if (/hunt|🏹|stalk|trapline|traps/i.test(s)) {
          t.beats.push({ day: gday(Game), text: s });
          if (t.beats.length > 2000) t.beats.splice(0, 400);
        }
      } catch (e) { t.errors++; }
      return base(msg);
    };
  } catch (e) { t.errors++; }
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'huntduty-audit', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const t = { errors: 0 };
  attachHuntInstrument(Game, t);
  attachDeathInstrument(Game, t);
  const elig0 = eligibilitySnapshot(Game);
  let elig90 = null;
  const hist = { maxRank: 0, table: false, exiled: false, starvedDays: 0, maxArc: 1, maxWave: 1, wins: false };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting || pg.tableDone) hist.table = true;
      if (G.won) hist.wins = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = (((G.state || {}).scholar || {}).prog || {}).arc || 1; if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
      if (day === 90 && !elig90) elig90 = eligibilitySnapshot(G);
    } catch (e) { t.errors++; }
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) { return undefined; } }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: EFF_DAYS, sampleEvery: 30 }); });
  const days = num(result && result.days);
  const out = {
    schema: 'huntduty-audit/1', seed, policy: policyId, days, errors: t.errors,
    eligibility: { day0: elig0, day90: elig90 },
    assigns: t.assigns,
    resolves: t.resolves,
    huntResolves: t.huntResolves,
    butchers: t.butchers,
    deaths: t.deaths,
    beats: t.beats,
    wall: {
      maxRank: hist.maxRank, table: hist.table, wins: hist.wins, exiled: hist.exiled,
      starvedDays: hist.starvedDays, maxArc: hist.maxArc, maxWave: hist.maxWave,
    },
  };
  // schema-clean gate: required keys present, every stream entry attributable
  // (caller non-null; resolutions all carry taskIn/taskOut).
  out.schemaClean = !!(out.assigns && out.resolves && out.huntResolves && out.butchers && out.deaths && out.wall)
    && out.assigns.every(e => e.task && e.caller && e.outcome)
    && out.resolves.every(e => e.taskIn && e.taskOut && e.caller)
    && out.huntResolves.every(e => e.caller)
    && out.butchers.every(e => e.caller);
  out.unattributed = out.resolves.filter(e => e.caller === 'unknown').length
    + out.assigns.filter(e => e.caller === 'unknown').length;
  return out;
}

// ---- per-seed panel-schema JSON (wall metrics) ----
// Minimal panel-schema rows for the wall metrics (balance-panel §15 is the
// instrument; this emits per-seed JSONs the panel can consume).
function panelRow(r) {
  const deathCauses = {};
  for (const d of (r.deaths || [])) {
    const c = (d.cause || 'unknown').replace(/^hunting$/, 'hunting');
    deathCauses[c] = (deathCauses[c] || 0) + 1;
  }
  return {
    schemaVersion: 1, schema: 'huntduty-wall/1', seed: r.seed, policy: r.policy,
    substrate: 'courtship FEASTSCALE_R13=1 SEATDRIVE=0', days: r.days,
    metrics: {
      national: r.wall.maxRank >= 2 ? 1 : 0,
      table: r.wall.table ? 1 : 0,
      wins: r.wall.wins ? 1 : 0,
      maxArc: r.wall.maxArc, maxWave: r.wall.maxWave,
      exiled: r.wall.exiled ? 1 : 0,
      starvedDays: r.wall.starvedDays,
      deaths: (r.deaths || []).length,
      deathCauses,
    },
    huntAudit: {
      huntResolutions: r.resolves.filter(e => e.taskOut === 'hunt').length,
      huntAssignAttempts: r.assigns.filter(e => e.task === 'hunt').length,
      huntMachineryFirings: r.huntResolves.length,
      butcherFirings: r.butchers.length,
      totalResolutions: r.resolves.length,
      eligibility: r.eligibility,
    },
  };
}

async function main() {
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, pid);
      fs.writeFileSync(path.join(EVID, `${pid}-${seed}.json`), JSON.stringify(r, null, 1));
      fs.writeFileSync(path.join(EVID, `wall-${pid}-${seed}.json`), JSON.stringify(panelRow(r), null, 1));
      rows.push(r);
      console.log(`${pid}-${seed}: days=${r.days} assigns=${r.assigns.length} resolves=${r.resolves.length} huntRes=${r.huntResolves.length} butchers=${r.butchers.length} errors=${r.errors} unattributed=${r.unattributed} schemaClean=${r.schemaClean}`);
    }
  }
  // attribution tables to stdout for the evidence file
  const byAssign = {};
  for (const r of rows) for (const e of r.assigns) {
    const k = `${e.task}|${e.caller}|${e.outcome}`;
    byAssign[k] = (byAssign[k] || 0) + 1;
  }
  console.log('\n=== assignTask task|caller|outcome (all runs) ===');
  for (const k of Object.keys(byAssign).sort()) console.log(`  ${k}: ${byAssign[k]}`);
  const byRes = {};
  for (const r of rows) for (const e of r.resolves) {
    const k = `${e.taskIn}${e.taskIn !== e.taskOut ? '->' + e.taskOut : ''}|${e.caller}`;
    byRes[k] = (byRes[k] || 0) + 1;
  }
  console.log('\n=== resolveOneAssignment taskIn[->taskOut]|caller (all runs) ===');
  for (const k of Object.keys(byRes).sort()) console.log(`  ${k}: ${byRes[k]}`);
  const byHunt = {};
  for (const r of rows) for (const e of r.huntResolves) byHunt[e.caller] = (byHunt[e.caller] || 0) + 1;
  console.log('\n=== villagerHuntResolve caller (all runs) ===');
  for (const k of Object.keys(byHunt).sort()) console.log(`  ${k}: ${byHunt[k]}`);
  const byBut = {};
  for (const r of rows) for (const e of r.butchers) byBut[e.caller] = (byBut[e.caller] || 0) + 1;
  console.log('\n=== cleanCarcass caller (all runs) ===');
  for (const k of Object.keys(byBut).sort()) console.log(`  ${k}: ${byBut[k]}`);
  const huntResTotal = rows.reduce((t, r) => t + r.resolves.filter(e => e.taskOut === 'hunt').length, 0);
  const resTotal = rows.reduce((t, r) => t + r.resolves.length, 0);
  const elig14 = rows.reduce((t, r) => t + (r.eligibility.day0.hunters14 || 0), 0);
  const eligOK = rows.reduce((t, r) => t + (r.eligibility.day0.huntersHPok || 0), 0);
  console.log(`\n=== hunt attribution === hunt resolutions ${huntResTotal}/${resTotal}; hunt-competent roster (day0): ${elig14} 1.4x across ${rows.length} seeds, ${eligOK} HP>=40`);
  const wall = { national: 0, table: 0, wins: 0, maxWave4: 0, maxWave5: 0 };
  for (const r of rows) {
    if (r.wall.maxRank >= 2) wall.national++;
    if (r.wall.table) wall.table++;
    if (r.wall.wins) wall.wins++;
    if (r.wall.maxWave >= 4) wall.maxWave4++;
    if (r.wall.maxWave >= 5) wall.maxWave5++;
  }
  console.log(`\n=== wall (${rows.length} runs) === national=${wall.national} table=${wall.table} wins=${wall.wins} wave4=${wall.maxWave4} wave5=${wall.maxWave5}`);
  const err = rows.filter(r => r.errors > 0 || !r.schemaClean);
  console.log(`\nerrors/schemaDirty: ${err.length}/${rows.length}`);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { attachHuntInstrument, attachBeatRing, attachDeathInstrument, classifyActor, eligibilitySnapshot, EVID, oneRun, panelRow };
