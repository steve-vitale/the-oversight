#!/usr/bin/env node
// stashfetch-trace-a.js — stash-fetch trigger recorder (sim-stashfetch-a;
// prereg: evidence/2026-10-31/sim-stashfetch-a-prereg.md, committed
// BEFORE any judged leg). Backlog #1597: on seed 15337's variant
// trajectory a stashed hatchet is fetched on day 1 via a haven
// routine, not via equip(). This driver ablates the variant-stack
// components (STRANDFIX x WOODWARM, plus a plain-competent cell)
// on the same seed and probes the fetch routines' code gates.
//
// DIAG ONLY, zero src/js changes, zero policy-default flips, zero
// edits to existing policy files. Wrappers below are log-only:
// they call the original function with the original arguments and
// return its return value unchanged; they append to in-memory logs
// only. The recorder NEVER calls microMove, cutTree, clearBrush,
// forage, eat, travelTo, or any state-editing verb, and never calls
// getPerson on NPCs (vessel only).
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel"|"competent"
//   WOODCARRY="0"|"1"  WOODWARM="0"|"1"  STRANDFIX="0"|"1"
//   (STRANDFIX=1 with POLICY=competent is FATAL: untested composition)
//   SEEDS (default 15337)  DAYS (default 5)
//   OUTDIR (default evidence/2026-10-31/sim-stashfetch-a-corpus-<cell>)
// Write transport mirrors the axearrival arms: failed writes are
// kept in memory and flushed at the end (EPERM flap waited out,
// never forced); deadline exhaustion stages inside this worktree
// (.stashfetch-staging, never /tmp) and exits loudly.
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
const POLICY = process.env.POLICY;
if (POLICY !== 'nighttravel' && POLICY !== 'competent') { console.error('FATAL: POLICY must be nighttravel or competent'); process.exit(2); }
for (const g of ['WOODCARRY', 'WOODWARM', 'STRANDFIX']) {
  if (process.env[g] !== '0' && process.env[g] !== '1') { console.error('FATAL: ' + g + ' must be set explicitly to 0 or 1'); process.exit(2); }
}
if (POLICY === 'competent' && process.env.STRANDFIX === '1') { console.error('FATAL: STRANDFIX=1 with POLICY=competent is an untested composition'); process.exit(2); }
if (process.env.WOODDAY === '1') { console.error('FATAL: stashfetch recorder never wires the woodday probe'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '15337')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '5', 10);
const CELL = POLICY + '-wc' + process.env.WOODCARRY + '-ww' + process.env.WOODWARM + '-sf' + process.env.STRANDFIX;
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-31', 'sim-stashfetch-a-corpus-' + CELL);
const STAGING_DIR = path.join(__dirname, '..', '.stashfetch-staging');

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

const idOf = (e) => (e && (e.itemId || e.id)) || (typeof e === 'string' ? e : null);
const idsOf = (arr) => (arr || []).map(idOf).filter(Boolean);

// snapPos: minimal position read (haven-ness is a fetch gate).
function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    tile, gameDay: sch.day || 0,
  };
}

// axeSnap(Game, withPool): READ-ONLY vessel census snap, same shape as
// the axearrival recorder (vessel only; no getPerson on NPCs).
function axeSnap(Game, withPool) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const invItems = sch.inventory || [];
    const inv = invItems.map((i) => (i.itemId || i.id || null)).filter(Boolean);
    const eq = sch.equipped || {};
    const eqIds = Object.values(eq).map((e) => e && (e.itemId || e.id || null)).filter(Boolean);
    let tier = null, toolName = null, canFell = null;
    try { const wt = (typeof Game.woodcutTier === 'function') ? Game.woodcutTier() : null; if (wt) { tier = wt.tier || null; toolName = wt.name || null; } } catch (e) {}
    try { const ci = (typeof Game.cutInfo === 'function') ? Game.cutInfo('bigtree') : null; if (ci) { canFell = !!ci.canFell; } } catch (e) {}
    const villagerId = sch.villagerId || Game.villagerId || null;
    let pool = null;
    if (withPool) {
      try {
        const pp = (typeof Game.getPerson === 'function' && villagerId) ? Game.getPerson(villagerId) : null;
        if (pp) {
          pool = { fullPool: Array.isArray(pp.fullPool) ? pp.fullPool.slice() : null, stashed: Array.isArray(pp.stashed) ? pp.stashed.slice() : null };
        }
      } catch (e) { pool = { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
    }
    return { gameDay: sch.day || 0, villagerId, inv, eq: eqIds, tier, toolName, canFell, pool };
  } catch (e) { return { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
}

// fetchGateState(Game, method): the pre-call gate state of one fetch
// routine, mirroring its code reads exactly (see prereg code gates).
// Returns nulls + error string on failure, never throws.
function fetchGateState(Game, method) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const defs = Game.data ? (Game.data.items || []) : [];
    const defOf = (id) => defs.find((d) => d.id === id) || null;
    const vid = sch.villagerId || Game.villagerId || null;
    let atHaven = null;
    try { atHaven = (typeof Game.playerAtHaven === 'function') ? !!Game.playerAtHaven() : true; } catch (e) { atHaven = null; }
    let personAlive = null, stash = null;
    try {
      const pp = (typeof Game.getPerson === 'function' && vid) ? Game.getPerson(vid) : null;
      if (pp) { personAlive = !pp.dead; stash = idsOf(pp.stashed); }
    } catch (e) { personAlive = null; }
    const eq = sch.equipped || {};
    const slotBonus = (slot) => {
      const cur = eq[slot];
      if (!cur || !cur.itemId) return 0;
      const d = defOf(cur.itemId);
      if (method === 'vesselStashFetch') return ((d && d.weapon) || {}).bonus || 0;
      return ((d && d.armor) || {}).protection || 0;
    };
    return {
      over: !!Game.over,
      scholarDay: sch.day || 0,
      dayFlag: method === 'vesselStashFetch' ? (sch._stashFetchDay === undefined ? null : sch._stashFetchDay) : (sch._armorFetchDay === undefined ? null : sch._armorFetchDay),
      villagerId: vid,
      atHaven, personAlive, stash,
      inv: idsOf(sch.inventory),
      eqMelee: eq.melee ? (eq.melee.itemId || null) : null,
      eqMeleeBonus: slotBonus('melee'),
      eqRanged: eq.ranged ? (eq.ranged.itemId || null) : null,
      eqRangedBonus: slotBonus('ranged'),
      eqIds: idsOf(Object.values(eq)),
    };
  } catch (e) { return { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
}

async function oneInstance(seed) {
  const mode = POLICY === 'competent' ? 'competent' : 'nighttravel-b';
  const { Game } = await loadGame({ seed, mode, fullTelemetry: false });
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

  const curLoopDay = { v: 0 };
  const fetchEvents = [];
  const teleEvents = [];
  const wrapErrs = [];
  const wrapInstalled = {};
  // Fetch-probe wrappers: log-only, behavior-preserving.
  for (const m of ['vesselStashFetch', 'vesselArmorFetch']) {
    try {
      const orig = Game[m];
      if (typeof orig !== 'function') { wrapInstalled[m] = false; continue; }
      wrapInstalled[m] = true;
      Game[m] = function (...args) {
        const before = fetchGateState(this, m);
        let result = null, threw = null;
        try { result = orig.apply(this, args); } catch (e) { threw = e; }
        const after = fetchGateState(this, m);
        try {
          if (fetchEvents.length < 5000) fetchEvents.push({ loopDay: curLoopDay.v, gameDay: (Game.state.scholar || {}).day || 0, method: m, before, result: result === null || result === undefined ? null : { item: result.item || null, slot: result.slot || null }, after, threw: threw ? String((threw && (threw.message || threw)) || threw).slice(0, 120) : null });
        } catch (e) { wrapErrs.push(m + ': ' + String((e && (e.message || e)) || e).slice(0, 120)); }
        if (threw) throw threw;
        return result;
      };
    } catch (e) { wrapErrs.push(m + '-install: ' + String((e && (e.message || e)) || e).slice(0, 120)); wrapInstalled[m] = false; }
  }
  // Tele wrapper: log-only capture of fetch tele events.
  try {
    const origTele = Game.tele;
    if (typeof origTele === 'function') {
      wrapInstalled.tele = true;
      Game.tele = function (...args) {
        try {
          const ev = args[0];
          if ((ev === 'vessel_stash_fetch' || ev === 'vessel_armor_fetch') && teleEvents.length < 5000) {
            teleEvents.push({ loopDay: curLoopDay.v, gameDay: (Game.state.scholar || {}).day || 0, event: ev, data: args[1] ? { item: args[1].item || null, via: args[1].via || null, slot: args[1].slot || null } : null });
          }
        } catch (e) { wrapErrs.push('tele: ' + String((e && (e.message || e)) || e).slice(0, 120)); }
        return origTele.apply(this, args);
      };
    } else { wrapInstalled.tele = false; }
  } catch (e) { wrapErrs.push('tele-install: ' + String((e && (e.message || e)) || e).slice(0, 120)); wrapInstalled.tele = false; }

  const spawnSnap = axeSnap(Game, true);

  const evenings = [], mornings = [];
  let callIdx = 0;
  let recorderErrs = 0;
  const recorderErrors = [];
  function noteRecErr(where, e) {
    recorderErrs++;
    if (recorderErrors.length < 20) recorderErrors.push(where + ': ' + String((e && (e.message || e)) || e).slice(0, 120));
  }
  let chain = POLICY === 'competent' ? competent : nighttravel;
  const wcStore = newStore();
  const wwStore = newWwStore();
  const sfStore = newSfStore();
  if (process.env.WOODCARRY === '1') chain = withWoodcarry(chain, wcStore);
  if (process.env.WOODWARM === '1') chain = withWoodwarm(chain, wwStore);
  if (process.env.STRANDFIX === '1') chain = withStrandfix(chain, sfStore);
  const policy = Object.assign({}, chain, {
    daily(Game2, ctx) {
      callIdx++;
      curLoopDay.v = callIdx;
      if (callIdx > 1) {
        try {
          const m = snapPos(Game2);
          let axe = null;
          try { axe = axeSnap(Game2, true); } catch (e) { noteRecErr('morning-axe', e); }
          if (axe && axe.error) noteRecErr('morning-axe', axe.error);
          mornings.push({ loopDay: callIdx, ...m, axe });
        } catch (e) { noteRecErr('morning', e); }
      }
      const sayBefore = sayLines.length;
      const fetchBefore = fetchEvents.length;
      const teleBefore = teleEvents.length;
      chain.daily(Game2, ctx);
      const sayAfter = sayLines.length;
      const dayLines = sayLines.slice(sayBefore, sayAfter).map((x) => x.line);
      const pos = snapPos(Game2);
      let eveningAxe = null;
      try { eveningAxe = axeSnap(Game2, false); } catch (e) { noteRecErr('evening-axe', e); }
      if (eveningAxe && eveningAxe.error) noteRecErr('evening-axe', eveningAxe.error);
      const mRow = mornings.find((m) => m.loopDay === callIdx);
      evenings.push({
        loopDay: callIdx, ...pos,
        morningAxe: mRow ? mRow.axe : null,
        eveningAxe,
        fetchLines: dayLines.filter((l) => /fetch it/i.test(l)),
        hatchetLines: dayLines.filter((l) => /hatchet/i.test(l)),
        dayFetchEvents: fetchEvents.slice(fetchBefore),
        dayTeleEvents: teleEvents.slice(teleBefore),
        fullDaySay: dayLines,
        gameOver: !!Game2.over,
      });
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  let endState = null;
  try {
    endState = {
      villageLost: !!Game.villageLost,
      scaleRank: (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null,
      stage: (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null,
    };
  } catch (e) { endState = { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
  return {
    seed, policy: POLICY, cell: CELL, mode,
    woodcarry: process.env.WOODCARRY, woodwarm: process.env.WOODWARM, strandfix: process.env.STRANDFIX,
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs },
    warmthStore: { acted: wwStore.acted, errs: wwStore.errs },
    strandfixStore: { attempts: (sfStore.attempts || []).length, errs: sfStore.errs },
    recorder: { errs: recorderErrs + wrapErrs.length, errors: recorderErrors.concat(wrapErrs), wrapInstalled },
    fetchEvents, teleEvents,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    deaths: (result.samples && result.samples.deaths) || [],
    spawnSnap, endState, evenings, mornings,
  };
}

(async () => {
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    done++;
    const ins = inst.evenings.filter((e) => e.inside === true && e.tile === 'haven').length;
    const name = `stashfetch-a-s${seed}.json`;
    const summary = `stashfetch cell=${CELL} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} inside=${ins} fetchEvents=${inst.fetchEvents.length} teleEvents=${inst.teleEvents.length} recErrs=${inst.recorder.errs}`;
    const data = JSON.stringify(inst);
    if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
    else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
  }
  if (pending.length) {
    const deadline = Date.now() + 45 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(OUTDIR, pending[i].name), pending[i].data, 3)) { console.log('flushed ' + pending[i].name); pending.splice(i, 1); }
      }
      if (pending.length) realSleepMs(10000);
    }
  }
  if (pending.length) {
    try {
      fs.mkdirSync(STAGING_DIR, { recursive: true });
      for (const p of pending) fs.writeFileSync(path.join(STAGING_DIR, p.name), p.data);
      console.error('STAGED ' + pending.length + ' files in ' + STAGING_DIR + ' — DEADLINE EXHAUSTED, EXIT LOUDLY');
    } catch (e) { console.error('STAGING FAILED: ' + String((e && (e.message || e)) || e)); }
    process.exit(3);
  }
  console.log('wrote ' + done + ' stashfetch files to ' + OUTDIR);
})().catch((e) => { console.error('FATAL: ' + ((e && e.stack) || e)); process.exit(1); });
