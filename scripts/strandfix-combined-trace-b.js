#!/usr/bin/env node
// strandfix-combined-trace-b.js — combined strand-fix prototype
// sweep legs (sim-strandfix-combined-b; prereg:
// evidence/2026-10-30/sim-strandfix-combined-b-prereg.md,
// committed BEFORE any judged leg).
// Adapted from scripts/tickbudget-trace-b.js with ONLY these
// changes (see prereg Implementation): (1) the stack is
// strandfix(probedW(woodwarm(probedC(woodcarry(probedN
// (nighttravel)))))) — the strandfix-combined-diag policy
// outside the warmed stack, with woodwarm's restraint option
// (R1 when STRANDFIX_PROTECT=1, null otherwise) as the live
// protected-logs instrument; pressb is NOT wired (FATAL if
// PRESSB=1); (2) evening rows carry eveningPantryKcal and
// eveningPackFoodKcal (kcalshort snapshots, read-only, taken
// after dayPolicy.daily returns); (3) strandfix attempt/skip
// records attach to the evening row of the same loop-day, and
// full day lines are recorded on strandfix-acted mornings as
// well as still creek evenings. Tick probes, morning/evening
// recording, seed order, and write transport are otherwise
// unchanged from tickbudget. The recorder itself NEVER calls
// microMove, cutTree, clearBrush, forage, or any
// state-editing verb — the only such verbs in a variant leg are
// the strandfix policy's own, recorded in its store. Same
// honesty guards as the master driver: no thief grant, no taps,
// no state edits, no clock-setting, no top-ups, no driver
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
//   OUTDIR (default evidence/2026-10-30/sim-strandfix-combined-b-corpus-<guard|on>-<control|variant>)
//   STRANDFIX="0"|"1" STRANDFIX_KCAL="0"|"1" STRANDFIX_WOOD="0"|"1"
//   STRANDFIX_PROTECT="0"|"1" (woodwarm restraint R1 on/off)
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
const { withStrandfix, newStore: newSfStore } = require('./policies/strandfix-combined-diag');

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
if (process.env.PRESSB === '1') { console.error('FATAL: strandfix driver never wires pressb (the strandfix policy replaces it)'); process.exit(2); }
if (process.env.STRANDFIX !== '0' && process.env.STRANDFIX !== '1') { console.error('FATAL: STRANDFIX must be set explicitly to 0 (OFF) or 1 (prototype)'); process.exit(2); }
if (process.env.STRANDFIX_KCAL !== '0' && process.env.STRANDFIX_KCAL !== '1') { console.error('FATAL: STRANDFIX_KCAL must be set explicitly to 0 or 1'); process.exit(2); }
if (process.env.STRANDFIX_WOOD !== '0' && process.env.STRANDFIX_WOOD !== '1') { console.error('FATAL: STRANDFIX_WOOD must be set explicitly to 0 or 1'); process.exit(2); }
if (process.env.STRANDFIX_PROTECT !== '0' && process.env.STRANDFIX_PROTECT !== '1') { console.error('FATAL: STRANDFIX_PROTECT must be set explicitly to 0 or 1'); process.exit(2); }
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-strandfix-combined-b-corpus-' + (process.env.WOODWARM === '1' ? 'on' : 'guard') + '-' + (process.env.STRANDFIX === '1' ? 'variant' : 'control'));
const STAGING_DIR = path.join(__dirname, '..', '.strandfix-staging');
if (process.env.WOODDAY === '1') { console.error('FATAL: strandfix recorder never wires the woodday probe'); process.exit(2); }

// dayTicksOf(Game): PURE READ of the scholar's day clock.
// probeWrap(inner, name, sink): pass-through daily wrapper that
// records dayTicks before/after inner.daily into sink. Draws no
// RNG, edits no state, passes ctx through untouched — so the
// wrapped stack's trajectory is identical to the unwrapped one
// (verified by the pilot-vs-fedexile census comparison and by
// press ticksSpent == 17 on fired mornings).
function dayTicksOf(Game) {
  try { return ((Game.state || {}).scholar || {}).dayTicks || 0; } catch (e) { return 0; }
}
function probeWrap(inner, name, sink) {
  return Object.assign({}, inner, {
    daily(Game2, ctx2) {
      const t0 = dayTicksOf(Game2);
      const r = inner.daily ? inner.daily(Game2, ctx2) : undefined;
      const t1 = dayTicksOf(Game2);
      try { sink.push({ layer: name, before: t0, after: t1, spent: t1 - t0 }); } catch (e) {}
      return r;
    },
  });
}

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

// sweepAnalysis(Game): READ-ONLY forage-sweep recorder for one
// morning snap. Copies the wake tile's detail grid (never
// edits it) and inventories the <=9 sweep cells (wake cell +
// 8 neighbours, clipped to the 9x9 grid) — exactly the 3x3 the
// engine's forage press works and perceptionHints scans.
// PURE READS ONLY: no Math.random draws, no state edits.
// Species is read ONLY from t.plantSpecies / t.bushSpecies
// where already assigned; unassigned cells report
// species:null + assigned:false (their species is revealed
// only by a replay press, which is the sense act, not a list
// read). Tree/bigtree nut species is NOT resolved here
// (regionTreeNut lookup is left to the replay press); the
// modifier species, if any, is recorded raw.
// Returns nulls + error string on any failure, never throws.
function sweepAnalysis(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const mx = (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx;
    const my = (sch.my === undefined || sch.my === null) ? 4 : sch.my;
    const live = Game.genDetail(Game.map.px, Game.map.py);
    const grid = live.map((row) => (row ? row.slice() : row));
    let t = null;
    try { t = Game.playerTile(); } catch (e) { t = null; }
    if (!t && typeof Game.tileAt === 'function') { try { t = Game.tileAt(Game.map.px, Game.map.py); } catch (e) {} }
    const inB = (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8;
    const cellAt = (x, y) => (grid[y] && grid[y][x]) || null;
    const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
    const cells = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const cx = mx + dx, cy = my + dy;
      if (!inB(cx, cy)) continue;
      const cell = cellAt(cx, cy);
      const key = cx + ',' + cy;
      let species = null, assigned = false, treeModSpecies = null;
      try {
        if (cell === 'plant' && t && t.plantSpecies && t.plantSpecies[key]) { species = t.plantSpecies[key]; assigned = true; }
        else if (cell === 'bush' && t && t.bushSpecies && t.bushSpecies[key]) { species = t.bushSpecies[key]; assigned = true; }
        else if ((cell === 'tree' || cell === 'bigtree') && t && t.modifiers && t.modifiers[key] && t.modifiers[key].species) { treeModSpecies = t.modifiers[key].species; }
      } catch (e) {}
      let known = null;
      try { if (species && typeof Game.plantKnown === 'function') known = !!Game.plantKnown(species); } catch (e) { known = null; }
      let regrow = false, scorched = null;
      try { regrow = !!(t && t.detailRegrow && t.detailRegrow[key]); } catch (e) {}
      try { scorched = (typeof Game.cellScorched === 'function') ? !!Game.cellScorched(cx, cy) : null; } catch (e) { scorched = null; }
      cells.push({ x: cx, y: cy, cell, species, assigned, treeModSpecies, known, regrow, scorched,
        forageable: !!FORAGEABLE[cell] && !regrow && scorched !== true });
    }
    let tileCanForage = null;
    try {
      const F = (globalThis.Scattering || {}).forage;
      if (F && typeof F.canForage === 'function' && t) tileCanForage = !!F.canForage(t);
    } catch (e) { tileCanForage = null; }
    let ticksLeft = null, walkKcal = null;
    try { const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512; ticksLeft = tpd - (sch.dayTicks || 0); } catch (e) {}
    try { walkKcal = (typeof Game.walkStepKcal === 'function') ? Game.walkStepKcal() : null; } catch (e) {}
    return { wake: [mx, my], wakeCell: cellAt(mx, my), grid, cells,
      forageableCells: cells.filter((c) => c.forageable).length,
      tileCanForage, ticksLeft, walkStepKcal: walkKcal };
  } catch (e) { return { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
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
  const probeAll = [];
  // Probe chain (strandfix): strandfix(probeW(woodwarm(
  // probeC(woodcarry(probeN(nighttravel)))))). Each probe is a
  // pure dayTicks read around inner.daily; the stack's behavior
  // is unchanged (see header + prereg Implementation).
  const probedN = probeWrap(nighttravel, 'nighttravel', probeAll);
  const base = withWoodcarry(probedN, wcStore);
  const wwStore = newWwStore();
  const probedC = probeWrap(base, 'woodcarry', probeAll);
  // Protection instrument: woodwarm restraint R1 (fire acts only
  // when the pack holds >= 5 logs) when STRANDFIX_PROTECT=1;
  // null (unrestrained warmth) otherwise. This is a stack
  // option of the landed woodwarm policy, not an edit to it.
  const warmed = withWoodwarm(probedC, wwStore, { restraint: process.env.STRANDFIX_PROTECT === '1' ? 'R1' : null });
  const probedW = probeWrap(warmed, 'woodwarm', probeAll);
  // The ONLY behavior delta vs the tickbudget recorder: the
  // strandfix wrapper outside the warmed stack. STRANDFIX=0 legs
  // run the warmed stack untouched (OFF); STRANDFIX=1 legs run
  // the combined prototype (see strandfix-combined-diag.js).
  const sfStore = newSfStore();
  const dayPolicy = withStrandfix(probedW, sfStore);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      // MORNING position + wood + adjacent sources: post-sleep,
      // pre-daily (loop-days 2+).
      if (callIdx > 1) {
        const m = snapPos(Game2);
        mornings.push({ loopDay: callIdx, ...m, morningWood: morningWood(Game2), morningDayTicks: dayTicksOf(Game2), adjSources: adjWoodSources(Game2), sweepAnalysis: sweepAnalysis(Game2) });
      }
      const sayBefore = sayLines.length;
      const probeBefore = probeAll.length;
      dayPolicy.daily(Game2, ctx);
      const tickProbe = probeAll.slice(probeBefore);
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
      row.woodday = null;
      // Kcalshort snapshots (read-only, after daily returns;
      // warmth spends a log and possibly kcal, never food items
      // or pantry stock, so these snapshots are unaffected by it).
      try { row.eveningPantryKcal = (typeof Game2.pantryKcal === 'function') ? Game2.pantryKcal() : null; } catch (e) { row.eveningPantryKcal = null; }
      try {
        row.eveningPackFoodKcal = (((Game2.state || {}).scholar || {}).inventory || [])
          .reduce((sum, it) => sum + ((it.kcalEach > 0) ? (it.kcalEach * (it.units || 0)) : 0), 0);
      } catch (e) { row.eveningPackFoodKcal = null; }
      // Strandfix records for THIS loop-day (the prototype acts
      // at daily entry, before inner.daily, so its loopDay ==
      // callIdx).
      row.strandfixAttempt = (sfStore.attempts || []).find((a) => a.loopDay === callIdx) || null;
      row.strandfixSkip = (sfStore.skips || []).find((s) => s.loopDay === callIdx) || null;
      const mRow = mornings.find((m) => m.loopDay === callIdx);
      row.morningWood = mRow ? mRow.morningWood : null;
      row.morningDayTicks = mRow ? mRow.morningDayTicks : null;
      row.eveningDayTicks = dayTicksOf(Game2);
      row.tickProbe = tickProbe;
      row.morningSweep = mRow ? mRow.sweepAnalysis : null;
      row.dayWoodLines = dayWoodLines;
      // Full day lines on still-refused creek evenings (as
      // wakeforage did) AND on strandfix-acted mornings (the
      // sense read needs the press + walk + fell narration in
      // its day's context).
      if ((row.woodcarry && row.woodcarry.bucket === 'creek' && !row.woodcarry.rescued) || row.strandfixAttempt) row.fullDaySay = dayLines;
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
    strandfixStore: { attempts: sfStore.attempts, skips: sfStore.skips, errs: sfStore.errs, errors: sfStore.errors },
    wooddayStore: null,
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
    const name = `strandfix-combined-b-nighttravel-s${seed}.json`;
    const summary = `strandfix policy=${POLICY} woodcarry=${process.env.WOODCARRY} woodwarm=${process.env.WOODWARM} strandfix=${process.env.STRANDFIX} kcal=${process.env.STRANDFIX_KCAL} wood=${process.env.STRANDFIX_WOOD} protect=${process.env.STRANDFIX_PROTECT} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} inside=${ins} wcRecords=${inst.woodcarryStore.records} errs=${inst.woodcarryStore.errs} wwActed=${inst.warmthStore.acted} wwErrs=${inst.warmthStore.errs} sfAttempts=${inst.strandfixStore.attempts.length} sfErrs=${inst.strandfixStore.errs}`;
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
  console.log('wrote ' + done + ' strandfix files to ' + OUTDIR);
})().catch((e) => { console.error('STRANDFIX CRASH', e && (e.stack || e)); process.exit(2); });
