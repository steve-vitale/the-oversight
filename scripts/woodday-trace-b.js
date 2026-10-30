#!/usr/bin/env node
// woodday-trace-b.js — daytime wood-recovery census legs
// (sim-woodday-b; prereg: evidence/2026-10-30/
// sim-woodday-b-prereg.md, committed BEFORE any judged leg).
// Adapted from scripts/woodwarm-trace-b.js with READ-ONLY
// additions and NO behavior change when WOODDAY is unset/0:
// (a) morning snap gains Game.woodCount(); (b) per-day wood-line
// scan over the say lines the master driver already captures;
// (c) stranded-morning adjacent tree/bigtree/bush counts via
// genDetail reads (warmth scan order), PLUS supplementary
// whole-tile counts (NOT the pre-registered window — reported
// separately so the evidence can say whether wood exists
// anywhere on the wake tile within walking distance); (d) for still-refused
// creek evenings, the FULL day's say lines are stored on the
// row (stranded days are few; this is what the sense-read reads);
// (e) optional WOODDAY=1 wiring of scripts/policies/woodday.js
// (probe legs only; default off = master-driver behavior).
// Same honesty guards as the master driver: no thief grant, no
// taps, no state edits, no clock-setting, no top-ups, no driver
// travelTo. POLICY-SIDE ARM ONLY: zero src/js changes.
//
// BANKING: this driver grants NO thief ability and performs
// NO thief taps (the 1530Z design flaw, fixed in the
// woodcarry3 driver this adapts). The judged legs are
// banked under exactly the driver that judges them.
//
// No clock-setting, no waits, no kcal/health top-ups, no
// travelTo in the driver, no direct position writes, no
// steering of competent.daily. POLICY-SIDE ARM ONLY: zero
// src/js changes.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" (required)
//   WOODCARRY="1" (required: the staged line fires only ON)
//   WOODWARM="0"|"1" (required: 0 = guard leg, 1 = ON leg)
//   SEEDS (banked band default: the 10 woodshort qualifiers)
//   DAYS=30
//   OUTDIR (default evidence/2026-10-30/sim-woodwarm-b-corpus-<guard|on>)
// Write transport mirrors the creekremedy arms: failed writes
// are kept in memory and flushed at the end (EPERM flap waited
// out, never forced); deadline exhaustion stages inside this
// worktree (.woodwarm-staging, never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');

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

const SEEDS = (process.env.SEEDS || '15003,15009,15091,15211,15215,15220,15221,15337,15376,15439')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-woodday-b-corpus-' + (process.env.WOODDAY === '1' ? 'probe' : (process.env.WOODWARM === '1' ? 'instr-on' : 'instr-guard')));
const STAGING_DIR = path.join(__dirname, '..', '.woodday-staging');
const WOODDAY = process.env.WOODDAY || '0';
if (WOODDAY !== '0' && WOODDAY !== '1') { console.error('FATAL: WOODDAY must be unset, 0, or 1'); process.exit(2); }

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

function adjWoodSources(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const mx = (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx;
    const my = (sch.my === undefined || sch.my === null) ? 4 : sch.my;
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    const cands = [[mx, my], [mx, my + 1], [mx, my - 1], [mx + 1, my], [mx - 1, my],
      [mx + 1, my + 1], [mx + 1, my - 1], [mx - 1, my + 1], [mx - 1, my - 1]];
    let tree = 0, bigtree = 0, bush = 0;
    for (const [cx, cy] of cands) {
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      const cell = detail[cy] && detail[cy][cx];
      if (cell === 'tree') tree++;
      else if (cell === 'bigtree') bigtree++;
      else if (cell === 'bush') bush++;
    }
    // Supplementary (NOT the pre-registered window): whole-tile counts,
    // so the evidence can say whether wood exists anywhere on the wake
    // tile within walking distance, not just adjacent to the wake cell.
    let ftree = 0, fbigtree = 0, fbush = 0;
    for (let cy = 0; cy < 9; cy++) for (let cx = 0; cx < 9; cx++) {
      const cell = detail[cy] && detail[cy][cx];
      if (cell === 'tree') ftree++;
      else if (cell === 'bigtree') fbigtree++;
      else if (cell === 'bush') fbush++;
    }
    return { tree, bigtree, bush, fullTree: ftree, fullBigtree: fbigtree, fullBush: fbush };
  } catch (e) { return null; }
}

function morningWood(Game) {
  try { return (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) { return null; }
}

const WOOD_LINE_RE = /wood|cut|clear|lash|bridge|tree|brush/i;

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 20000) sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);

  const evenings = [], mornings = [];
  let callIdx = 0;
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  // Probe wiring (WOODDAY=1 only): wraps OUTSIDE the warmed stack so
  // it runs BEFORE woodcarry's morning carry each loop-day. The two
  // never co-act (probe requires away-from-haven, carry requires
  // at-haven). Default off = master-driver behavior, byte-identical
  // policy stack.
  let dayPolicy = warmed;
  let wdStore = null;
  if (WOODDAY === '1') {
    const { withWoodday, newStore: newWdStore } = require('./policies/woodday');
    wdStore = newWdStore();
    dayPolicy = withWoodday(warmed, wdStore);
  }
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      // MORNING position + wood + adjacent sources: post-sleep,
      // pre-daily (loop-days 2+).
      if (callIdx > 1) {
        const m = snapPos(Game2);
        mornings.push({ loopDay: callIdx, ...m, morningWood: morningWood(Game2), adjSources: adjWoodSources(Game2) });
      }
      const sayBefore = sayLines.length;
      dayPolicy.daily(Game2, ctx);
      const sayAfter = sayLines.length;
      const dayLines = sayLines.slice(sayBefore, sayAfter).map((x) => x.line);
      const dayWoodLines = dayLines.filter((l) => WOOD_LINE_RE.test(l));
      const eveningSayTail = dayLines.slice(Math.max(0, dayLines.length - 30));
      const pos = snapPos(Game2);
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
      row.woodday = ctx._wdLast || null;
      const mRow = mornings.find((m) => m.loopDay === callIdx);
      row.morningWood = mRow ? mRow.morningWood : null;
      row.dayWoodLines = dayWoodLines;
      // Full day lines only on still-refused creek evenings (stranded
      // days are few; the sense-read reads these, not the tail alone).
      if (row.woodcarry && row.woodcarry.bucket === 'creek' && !row.woodcarry.rescued) row.fullDaySay = dayLines;
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: POLICY, key: null, grantOk: null, grantMethod: 'none-stripped',
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors, classified: wcStore.classified, unclassified: wcStore.unclassified, otherRefused: wcStore.otherRefused },
    warmthStore: { records: wwStore.records, errs: wwStore.errs, errors: wwStore.errors, acted: wwStore.acted, missed: wwStore.missed },
    wooddayStore: wdStore ? { records: wdStore.records, errs: wdStore.errs, errors: wdStore.errors, acted: wdStore.acted, missed: wdStore.missed } : null,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings, mornings, taps: [],
  };
}

(async () => {
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    done++;
    const ins = inst.evenings.filter((e) => e.inside === true && e.tile === 'haven').length;
    const name = `woodday-b-nighttravel-s${seed}.json`;
    const summary = `woodday policy=${POLICY} woodcarry=${process.env.WOODCARRY} woodwarm=${process.env.WOODWARM} woodday=${WOODDAY} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} inside=${ins} wcRecords=${inst.woodcarryStore.records} errs=${inst.woodcarryStore.errs} wwActed=${inst.warmthStore.acted} wwErrs=${inst.warmthStore.errs}`;
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
  console.log('wrote ' + done + ' woodday files to ' + OUTDIR);
})().catch((e) => { console.error('WOODDAY CRASH', e && (e.stack || e)); process.exit(2); });
