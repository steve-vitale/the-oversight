#!/usr/bin/env node
// axefirst-r1430-trace-b.js — AXEFIRST lever legs (sim-axefirst-b 1430Z;
// prereg: evidence/2026-10-31/sim-axefirst-b-r1430-prereg.md, committed
// BEFORE any judged leg). Copy of scripts/axefirst-trace-b.js (same
// warmed stack, same evening/morning record shape) with the lever
// added: the warmed stack is wrapped by policies/axefirst-diag.js
// (AXEFIRST=1 lever / 0 control), and each evening row gains the
// day's axefirst record (ctx._axLast).
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" (required)
//   WOODCARRY="1" (required), WOODWARM="1" (required: the ON stack)
//   AXEFIRST="1"|"0" (required: 1 = lever, 0 = control)
//   STRANDFIX must NOT be 1; PRESSB must NOT be 1
//   SEEDS (default 15215), DAYS=30
// TRANSPORT (mandatory infra pattern): a game-loaded process NEVER
// writes files. This driver prints one JSON line per seed to stdout
// (summaries to stderr); the caller redirects stdout to a .jsonl file
// in evidence/ in a FOREGROUND exec (stderr to a .log file), and an
// idle splitter (scripts/axefirst-r1430-split-b.js) splits it into
// per-seed corpus files. Never a backgrounded pipe. Never /tmp.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { withAxefirst, newStore: newAxStore } = require('./policies/axefirst-diag');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1'); process.exit(2); }
if (process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be 1 for axefirst-r1430 legs (the ON stack)'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
if (process.env.AXEFIRST !== '0' && process.env.AXEFIRST !== '1') { console.error('FATAL: AXEFIRST must be set explicitly to 0 (control) or 1 (lever)'); process.exit(2); }
if (process.env.STRANDFIX === '1') { console.error('FATAL: STRANDFIX must NOT be 1 in an axefirst-r1430 leg'); process.exit(2); }
if (process.env.PRESSB === '1') { console.error('FATAL: PRESSB must NOT be 1 in an axefirst-r1430 leg'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '15215')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for axefirst-r1430 legs'); process.exit(2); }

const { fellTarget, jointEval } = require('./jointgate-pure-b');

function blocksCellFor(Game) {
  return (cell) => {
    try {
      if (Game && typeof Game.cellProps === 'function') return !!Game.cellProps(cell).blocks;
    } catch (e) {}
    return cell === 'wall' || cell === 'water' || cell === 'tree' || cell === 'bigtree' || cell === 'tent' || cell === 'fire';
  };
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
    dayTicks: (sch.dayTicks === undefined ? null : sch.dayTicks),
    vesselId: (Game.villagerId !== undefined ? Game.villagerId : (sch.villagerId !== undefined ? sch.villagerId : null)),
  };
}

function invSnap(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const inv = (sch.inventory || []).map((it) => {
      if (!it || typeof it !== 'object') return it;
      return { itemId: it.itemId || it.id || null, name: it.name || null, units: (it.units === undefined ? null : it.units) };
    });
    const eq = {};
    for (const [slot, e] of Object.entries(sch.equipped || {})) {
      eq[slot] = e ? { itemId: e.itemId || e.id || null, name: e.name || null } : null;
    }
    return { inv, eq, stashFetchDay: (sch._stashFetchDay === undefined ? null : sch._stashFetchDay), armorFetchDay: (sch._armorFetchDay === undefined ? null : sch._armorFetchDay) };
  } catch (e) { return null; }
}

function stashSnap(Game, errs) {
  try {
    const vid = (Game.villagerId !== undefined ? Game.villagerId : ((Game.state || {}).scholar || {}).villagerId);
    if (!vid || typeof Game.getPerson !== 'function') return null;
    const person = Game.getPerson(vid);
    if (!person) return null;
    return (person.stashed || []).map((it) => {
      if (!it || typeof it !== 'object') return it;
      return it.itemId || it.id || null;
    });
  } catch (e) { if (errs) errs.push('stash: ' + String(e && e.message).slice(0, 120)); return null; }
}

function toolSnap(Game, errs) {
  // Returns {tier, name, itemId, target, cutInfo, ticksLeft, walkSteps}
  // or null fields on read failure (counted in errs by the caller).
  let tier = null;
  try {
    const t = (typeof Game.woodcutTier === 'function') ? Game.woodcutTier() : null;
    if (t) tier = { tier: t.tier || null, name: t.name || null, itemId: t.itemId || null };
  } catch (e) { if (errs) errs.push('tier: ' + String(e && e.message).slice(0, 120)); }
  let target = null, cutInfo = null, ticksLeft = null, walkSteps = null;
  try {
    const sch = (Game.state || {}).scholar || {};
    const tpd = (Game.TIME && Game.TIME.TICKS_PER_DAY) || 512;
    ticksLeft = (sch.dayTicks === undefined || sch.dayTicks === null) ? null : (tpd - sch.dayTicks);
    const mx = (sch.mx === undefined || sch.mx === null) ? 4 : sch.mx;
    const my = (sch.my === undefined || sch.my === null) ? 4 : sch.my;
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    const ft = fellTarget(detail, [mx, my], blocksCellFor(Game));
    if (ft) {
      target = ft.target; walkSteps = ft.pathLen;
      try {
        const ci = (typeof Game.cutInfo === 'function') ? Game.cutInfo(ft.target.cell) : null;
        if (ci) cutInfo = { canFell: ci.canFell, canPrune: ci.canPrune, big: ci.big, toolName: ci.toolName || null, tier: ci.tier || null };
      } catch (e) { if (errs) errs.push('cutInfo: ' + String(e && e.message).slice(0, 120)); }
    }
  } catch (e) { if (errs) errs.push('target: ' + String(e && e.message).slice(0, 120)); }
  return { tier, target, cutInfo, ticksLeft, walkSteps };
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
  const errs = [];
  const spawn = {
    pos: snapPos(Game),
    inv: invSnap(Game),
    stash: stashSnap(Game, errs),
  };
  const evenings = [], mornings = [];
  let callIdx = 0;
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const axStore = newAxStore();
  const dayPolicy = withAxefirst(warmed, axStore);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      if (callIdx > 1) {
        const mPos = snapPos(Game2);
        const mTool = toolSnap(Game2, errs);
        const mInv = invSnap(Game2);
        const mStash = stashSnap(Game2, errs);
        let mWood = null;
        try { mWood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null; } catch (e) { errs.push('wood: ' + String(e && e.message).slice(0, 120)); }
        const ev = jointEval({ wood: mWood, kcal: mPos.kcal, tier: mTool.tier ? mTool.tier.tier : null, canFell: mTool.cutInfo ? mTool.cutInfo.canFell : null, ticksLeft: mTool.ticksLeft, walkSteps: mTool.walkSteps });
        mornings.push({ loopDay: callIdx, ...mPos, morningWood: mWood, tool: mTool, inv: mInv, stash: mStash, joint: ev, inCombat: !!(Game2.inCombat && Game2.inCombat()) });
      }
      const sayBefore = sayLines.length;
      dayPolicy.daily(Game2, ctx);
      const sayAfter = sayLines.length;
      const dayLines = sayLines.slice(sayBefore, sayAfter).map((x) => x.line);
      const dayWoodLines = dayLines.filter((l) => WOOD_LINE_RE.test(l));
      const hatchetLines = dayLines.filter((l) => /hatchet/i.test(l));
      const takeLines = dayLines.filter((l) => /take .* from|fetch it/i.test(l));
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
        row.haven = nt.haven || null;
        row.havenDistance = (nt.havenDistance === undefined ? null : nt.havenDistance);
        row.travelOffered = (nt.travelOffered === undefined ? null : nt.travelOffered);
        row.travel = nt.travel || null;
        row.travelledHome = !!nt.travelledHome;
      }
      row.hatchetLines = hatchetLines;
      row.takeLines = takeLines;
      row.axefirst = ctx._axLast || null;
      row.woodcarry = ctx._wcLast || null;
      row.warmth = ctx._wwLast || null;
      try { row.eveningWood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null; } catch (e) {}
      row.eveningTool = toolSnap(Game2, errs);
      row.eveningInv = invSnap(Game2);
      row.eveningStash = stashSnap(Game2, errs);
      if (row.woodcarry && row.woodcarry.bucket === 'creek' && !row.woodcarry.rescued) row.fullDaySay = dayLines;
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  const fetchLines = sayLines.filter((x) => /fetch it/i.test(x.line));
  return {
    seed, policy: process.env.POLICY, woodwarm: process.env.WOODWARM, woodcarry: process.env.WOODCARRY,
    axefirst: process.env.AXEFIRST, arm: process.env.AXEFIRST === '1' ? 'lever' : 'control',
    spawn,
    axefirstStore: { records: axStore.records, errs: axStore.errs, errors: axStore.errors, runs: axStore.runs, finds: axStore.finds, unreached: axStore.unreached },
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors, classified: wcStore.classified, unclassified: wcStore.unclassified, otherRefused: wcStore.otherRefused },
    warmthStore: { records: wwStore.records, errs: wwStore.errs, errors: wwStore.errors, acted: wwStore.acted, missed: wwStore.missed },
    errs, errCount: errs.length,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings, mornings, fetchLines,
  };
}

async function main() {
  // Stdout transport: one JSON line per seed. Summaries go to stderr
  // only (stdout must stay pure JSONL for the splitter).
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    process.stdout.write(JSON.stringify(inst) + '\n');
    console.error(`axefirst-r1430 arm=${inst.arm} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} mornings=${inst.mornings.length} axRuns=${inst.axefirstStore.runs} axFinds=${inst.axefirstStore.finds} axUnreached=${inst.axefirstStore.unreached} errs=${inst.errCount} stdout`);
  }
  console.error('wrote ' + SEEDS.length + ' axefirst-r1430 JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('AXEFIRST-R1430 CRASH', e && (e.stack || e)); process.exit(2); });
}

