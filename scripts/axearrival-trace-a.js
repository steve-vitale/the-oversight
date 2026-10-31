#!/usr/bin/env node
// axearrival-trace-a.js — axe-arrival recorder legs (sim-axearrival-a;
// prereg: evidence/2026-10-30/sim-axearrival-a-prereg.md, committed
// BEFORE any judged leg). Backlog #1587: on seed 15215's
// strandfix-variant trajectory the woodcut tier rises from whittle
// (days 10-15 hint lines) to fell-capable (day 17 fell succeeds)
// with no recorded arrival mechanism. This driver records, per
// morning AND per evening, the vessel's inventory/equipped items
// and cutInfo/woodcut tier, plus an event trace of acquisition
// channels (corpse loot, succession, stash equip, grant, trade,
// gift) — so the arrival brackets to one loop-day or one
// overnight and names its mechanism.
//
// Adapted from scripts/strandfix-trace-b.js with the variant stack
// VERBATIM (strandfix(warmed(woodcarry(nighttravel)))) and these
// READ-ONLY additions: axeSnap per morning/evening (copied from
// scripts/axeacq-trace-b.js, vessel only), full day lines every
// loop-day, and defensive log-only wrappers around lootCorpse /
// equip / unequip / alienLootGrant where they exist (return values
// and exceptions preserved exactly; the wrappers never call a
// state-editing verb themselves). The recorder NEVER calls
// microMove, cutTree, clearBrush, forage, eat, travelTo, or any
// state-editing verb, and never calls getPerson on NPCs.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" (required)
//   WOODCARRY="1" (required: the staged line fires only ON)
//   WOODWARM="0"|"1" (required; this arm's legs all use 1 = ON)
//   STRANDFIX="0"|"1" (required; judged legs use 1 = variant)
//   SEEDS (default 15215; bank check overrides)
//   DAYS=30
//   OUTDIR (default evidence/2026-10-30/sim-axearrival-a-corpus-<guard|on>-<variant|off>)
// Write transport mirrors the strandfix arms: failed writes are
// kept in memory and flushed at the end (EPERM flap waited out,
// never forced); deadline exhaustion stages inside this worktree
// (.axearrival-staging, never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { withStrandfix, newStore: newSfStore } = require('./policies/strandfix-morning-diag');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
for (const g of ['COMPETENT_EVENING_DETOUR', 'COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND']) {
  if (process.env[g] === '1') { console.error('FATAL: ' + g + ' must NOT be 1 in a woodshort-ledger leg (detour never pooled)'); process.exit(2); }
}
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1 for woodwarm legs (the staged line fires only ON)'); process.exit(2); }
if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be set explicitly to 0 (guard) or 1 (ON)'); process.exit(2); }
const POLICY = process.env.POLICY;
if (POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel for woodwarm legs'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '15215')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (process.env.STRANDFIX !== '0' && process.env.STRANDFIX !== '1') { console.error('FATAL: STRANDFIX must be set explicitly to 0 (OFF) or 1 (variant)'); process.exit(2); }
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-axearrival-a-corpus-' + (process.env.WOODWARM === '1' ? 'on' : 'guard') + '-' + (process.env.STRANDFIX === '1' ? 'variant' : 'off'));
const STAGING_DIR = path.join(__dirname, '..', '.axearrival-staging');
if (process.env.WOODDAY === '1') { console.error('FATAL: axearrival recorder never wires the woodday probe'); process.exit(2); }

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}

function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null, access = null, stage = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  try { access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) {}
  try { stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    exiled: (sch.exiled === undefined ? null : !!sch.exiled),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile, access, stage,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0), gameDay: sch.day || 0,
  };
}

function morningWood(Game) {
  try { return (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) { return null; }
}

// axeSnap(Game, withPool): READ-ONLY vessel axe census snap, copied
// from scripts/axeacq-trace-b.js (vessel only; no getPerson on
// NPCs). Vessel identity is scholar.villagerId first, falling back
// to Game.villagerId. Pool lists (fullPool/stashed) come from
// getPerson(villagerId) for the already-materialized vessel only.
// Returns nulls + error string on failure, never throws.
function axeSnap(Game, withPool) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const invItems = sch.inventory || [];
    const inv = invItems.map((i) => (i.itemId || i.id || null)).filter(Boolean);
    const invNames = invItems.map((i) => (i.name || null)).filter(Boolean);
    const eq = sch.equipped || {};
    const eqIds = Object.values(eq).map((e) => e && (e.itemId || e.id || null)).filter(Boolean);
    const eqNames = Object.values(eq).map((e) => e && (e.name || null)).filter(Boolean);
    let tier = null, toolName = null, canFell = null, canPrune = null;
    try { const wt = (typeof Game.woodcutTier === 'function') ? Game.woodcutTier() : null; if (wt) { tier = wt.tier || null; toolName = wt.name || null; } } catch (e) {}
    try { const ci = (typeof Game.cutInfo === 'function') ? Game.cutInfo('bigtree') : null; if (ci) { canFell = !!ci.canFell; canPrune = !!ci.canPrune; } } catch (e) {}
    const villagerId = sch.villagerId || Game.villagerId || null;
    const vesselName = sch.name || null;
    let pool = null;
    if (withPool) {
      try {
        const pp = (typeof Game.getPerson === 'function' && villagerId) ? Game.getPerson(villagerId) : null;
        if (pp) {
          pool = { fullPool: Array.isArray(pp.fullPool) ? pp.fullPool.slice() : null, stashed: Array.isArray(pp.stashed) ? pp.stashed.slice() : null };
        }
      } catch (e) { pool = { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
    }
    const hasHatchet = inv.includes('hatchet') || eqIds.includes('hatchet') ||
      invNames.some((n) => String(n).toLowerCase() === 'hatchet') ||
      eqNames.some((n) => String(n).toLowerCase() === 'hatchet');
    return { gameDay: sch.day || 0, villagerId, vesselName, inv, invNames, eq: eqIds, eqNames, hasHatchet, tier, toolName, canFell, canPrune, pool };
  } catch (e) { return { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
}

function axeBrief(Game) {
  // Minimal before/after read for wrap entries (no pool read: wraps
  // fire mid-day, possibly many times; pool reads stay on snaps).
  try {
    const snap = axeSnap(Game, false);
    return { hasHatchet: snap.hasHatchet, tier: snap.tier, toolName: snap.toolName, canFell: snap.canFell, villagerId: snap.villagerId };
  } catch (e) { return { error: String((e && (e.message || e)) || e).slice(0, 120) }; }
}

const AXE_LINE_RE = /hatchet|axe\b|loot|stripped|corpse|body|gave|gift|trade|grant|equip|stash/i;

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 30000) sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);

  // Event-trace wrappers: log-only, behavior-preserving. curLoopDay
  // is updated by the policy daily() entry; wrappers installed here
  // close over it. If a wrapped method does not exist, no wrapper
  // is installed and the method is recorded as absent.
  const curLoopDay = { v: 0 };
  const axeEvents = [];
  const wrapErrs = [];
  const WRAP_METHODS = ['lootCorpse', 'equip', 'unequip', 'alienLootGrant'];
  const wrapInstalled = {};
  for (const m of WRAP_METHODS) {
    try {
      const orig = Game[m];
      if (typeof orig !== 'function') { wrapInstalled[m] = false; continue; }
      wrapInstalled[m] = true;
      Game[m] = function (...args) {
        const before = axeBrief(this);
        let result, threw = null;
        try { result = orig.apply(this, args); } catch (e) { threw = e; }
        const after = axeBrief(this);
        try {
          const argSummary = args.map((a) => {
            if (a === null || a === undefined) return String(a);
            if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') return String(a).slice(0, 120);
            if (typeof a === 'object') {
              const id = a.id || a.itemId || a.cid || a.name;
              return id !== undefined ? ('obj:' + String(id).slice(0, 120)) : 'obj';
            }
            return typeof a;
          });
          if (axeEvents.length < 5000) axeEvents.push({ loopDay: curLoopDay.v, gameDay: (Game.state.scholar || {}).day || 0, method: m, args: argSummary, before, after, threw: threw ? String((threw && (threw.message || threw)) || threw).slice(0, 120) : null });
        } catch (e) { wrapErrs.push(m + ': ' + String((e && (e.message || e)) || e).slice(0, 120)); }
        if (threw) throw threw;
        return result;
      };
    } catch (e) { wrapErrs.push(m + '-install: ' + String((e && (e.message || e)) || e).slice(0, 120)); wrapInstalled[m] = false; }
  }

  const spawnSnap = axeSnap(Game, true);

  const evenings = [], mornings = [];
  let callIdx = 0;
  let recorderErrs = 0;
  const recorderErrors = [];
  function noteRecErr(where, e) {
    recorderErrs++;
    if (recorderErrors.length < 20) recorderErrors.push(where + ': ' + String((e && (e.message || e)) || e).slice(0, 120));
  }
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const pbStore = newSfStore();
  const dayPolicy = withStrandfix(warmed, pbStore);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      curLoopDay.v = callIdx;
      if (callIdx > 1) {
        try {
          const m = snapPos(Game2);
          let axe = null;
          try { axe = axeSnap(Game2, true); } catch (e) { noteRecErr('morning-axe', e); }
          if (axe && axe.error) noteRecErr('morning-axe', axe.error);
          mornings.push({ loopDay: callIdx, ...m, morningWood: morningWood(Game2), axe });
        } catch (e) { noteRecErr('morning', e); }
      }
      const sayBefore = sayLines.length;
      const eventsBefore = axeEvents.length;
      dayPolicy.daily(Game2, ctx);
      const sayAfter = sayLines.length;
      const dayLines = sayLines.slice(sayBefore, sayAfter).map((x) => x.line);
      const dayEvents = axeEvents.slice(eventsBefore);
      const eveningSayTail = dayLines.slice(Math.max(0, dayLines.length - 30));
      const pos = snapPos(Game2);
      let eveningAxe = null;
      try { eveningAxe = axeSnap(Game2, false); } catch (e) { noteRecErr('evening-axe', e); }
      if (eveningAxe && eveningAxe.error) noteRecErr('evening-axe', eveningAxe.error);
      const row = { loopDay: callIdx, tapDay: false, ...pos, eveningSayTail };
      if (Game2.over) {
        row.eveningOutcome = 'game-over';
      } else {
        const nt = ctx._ntLast || {};
        row.eveningOutcome = nt.outcome || 'policy-no-record';
        row.eveningMethod = nt.method || null;
        row.policyBefore = nt.before || null;
        row.preStepTile = nt.before ? nt.before.tile : null;
        row.preStepMap = nt.before ? (nt.before.mapPx + ',' + nt.before.mapPy) : null;
        row.preStepKcal = nt.before ? nt.before.kcal : null;
        row.haven = nt.haven || null;
        row.havenDistance = (nt.havenDistance === undefined ? null : nt.havenDistance);
        row.travelOffered = (nt.travelOffered === undefined ? null : nt.travelOffered);
        row.travel = nt.travel || null;
        row.travelledHome = !!nt.travelledHome;
        row.policyWalkTarget = (nt.delegated || {}).walkTarget || null;
        row.policyEntryCellActions = (nt.delegated || {}).entryCellActions || null;
        row.policyEntryAdjacency = ((nt.delegated || {}).entryAdjacency === undefined ? null : (nt.delegated || {}).entryAdjacency);
        row.policyAfter = (nt.delegated || {}).after || null;
        row.positionAgreesWithPolicy = (row.eveningOutcome === 'completed' || row.eveningOutcome === 'already-inside')
          ? (pos.inside === true && pos.tile === 'haven') : null;
        row.travelLandedOnHaven = nt.travel
          ? (nt.travel.arrival.mapPx === (nt.haven && nt.haven.hx) && nt.travel.arrival.mapPy === (nt.haven && nt.haven.hy)) : null;
      }
      row.woodcarry = ctx._wcLast || null;
      row.woodcarryCarry = ctx._wcCarry || null;
      row.warmth = ctx._wwLast || null;
      row.woodday = null;
      row.strandfixAttempt = (pbStore.attempts || []).find((a) => a.loopDay === callIdx) || null;
      row.strandfixSkip = (pbStore.skips || []).find((s) => s.loopDay === callIdx) || null;
      const mRow = mornings.find((m) => m.loopDay === callIdx);
      row.morningWood = mRow ? mRow.morningWood : null;
      row.morningAxe = mRow ? mRow.axe : null;
      row.eveningAxe = eveningAxe;
      row.hatchetLines = dayLines.filter((l) => /hatchet/i.test(l));
      row.axeEventLines = dayLines.filter((l) => AXE_LINE_RE.test(l));
      row.dayEvents = dayEvents;
      // Full day lines EVERY loop-day (uniform; the arrival day's
      // lines must be readable in full, and uniform storage avoids
      // selection bias about which days matter).
      row.fullDaySay = dayLines;
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  let endState = null;
  try {
    endState = {
      won: !!((result.stop || {}).won), villageLost: !!Game.villageLost,
      scaleRank: (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null,
      stage: (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null,
      standing: (typeof Game.villageStanding === 'function') ? (((Game.villageStanding() || {}).total === undefined) ? null : (Game.villageStanding() || {}).total) : null,
    };
  } catch (e) { endState = { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
  return {
    seed, policy: POLICY, key: null, grantOk: null, grantMethod: 'none-stripped',
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors, classified: wcStore.classified, unclassified: wcStore.unclassified, otherRefused: wcStore.otherRefused },
    warmthStore: { records: wwStore.records, errs: wwStore.errs, errors: wwStore.errors, acted: wwStore.acted, missed: wwStore.missed },
    strandfixStore: { attempts: pbStore.attempts, skips: pbStore.skips, errs: pbStore.errs, errors: pbStore.errors },
    wooddayStore: null,
    recorder: { errs: recorderErrs + wrapErrs.length, errors: recorderErrors.concat(wrapErrs), wrapInstalled },
    axeEvents,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    spawnSnap, endState, evenings, mornings, taps: [],
  };
}

(async () => {
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    done++;
    const ins = inst.evenings.filter((e) => e.inside === true && e.tile === 'haven').length;
    const name = `axearrival-a-nighttravel-s${seed}.json`;
    const summary = `axearrival policy=${POLICY} woodcarry=${process.env.WOODCARRY} woodwarm=${process.env.WOODWARM} strandfix=${process.env.STRANDFIX} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} inside=${ins} wcRecords=${inst.woodcarryStore.records} errs=${inst.woodcarryStore.errs} wwActed=${inst.warmthStore.acted} wwErrs=${inst.warmthStore.errs} sfAttempts=${inst.strandfixStore.attempts.length} sfErrs=${inst.strandfixStore.errs} recErrs=${inst.recorder.errs} axeEvents=${inst.axeEvents.length}`;
    const data = JSON.stringify(inst);
    if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
    else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
  }
  if (pending.length) {
    const deadline = Date.now() + 45 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(OUTDIR, pending[i].name), pending[i].data, 5)) {
          console.log('flushed pending ' + pending[i].name);
          pending.splice(i, 1);
        }
      }
      if (pending.length && Date.now() < deadline) realSleepMs(30000);
    }
  }
  if (pending.length) {
    for (const p of pending) {
      if (tryWrite(path.join(STAGING_DIR, p.name), p.data, 30)) console.error('STAGED (not evidence) ' + p.name);
      else console.error('STAGE FAIL LOUDLY ' + p.name);
    }
    console.error('PENDING STAGED: ' + pending.length + ' files in ' + STAGING_DIR + ' — copy to ' + OUTDIR + ' before judging');
    process.exit(3);
  }
  console.log('wrote ' + done + ' axearrival files to ' + OUTDIR);
})().catch((e) => { console.error('AXEARRIVAL CRASH', e && (e.stack || e)); process.exit(2); });
