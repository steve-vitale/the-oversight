#!/usr/bin/env node
// probe-spandraw-design-b.js — designed day-boundary span probe
// (sim-spandraw-design-b; prereg:
// evidence/2026-10-27/sim-spandraw-design-b-prereg.md).
//
// DIAG/measurement ONLY: zero src/js changes. Each probe instance is
// a FRESH game (loadGame + setupGame via scripts/sim-harness.js), the
// captures install in CENSUS ORDER (stockdoors, then mealdraw, then
// the census nest logger OUTERMOST), and ONE action is invoked
// through the game's own Game.useAbility. No draw record is ever
// fabricated: draws are real endDay pantryDraw calls, recorded by
// the mealdraw capture and the nest logger.
//
// POSITION FIXTURE (disclosed correction to the prereg's wording):
// the prereg says dayTicks is set and dayPart is "whatever setup
// leaves". Setting dayTicks to ~500 while leaving dayPart at its
// setup value would fire a burst of advancePart calls inside the
// span that real play at that hour would never produce (real play
// at dayTicks 500 is already in dayPart 3). So the probe sets the
// CONSISTENT pair (dayTicks, dayPart = floor(dayTicks / 128)) —
// the position real play would actually be in at that hour. The
// pair is recorded per instance. This makes the probe MORE
// faithful, not less; the GO thresholds and classification rules
// are untouched.
//
// Grant fixture (disclosed): the probed ability is granted by
// pushing {id, level: 1} onto scholar.abilities (and, for
// skill-lane abilities whose hasAbility reads a codex skill, the
// matching skill fixture — recorded as grantMethod). Granting is
// SETUP: the invocation is always useAbility, the draws are always
// real endDay draws.
//
// Env:
//   SEEDS="9981,...,9988" (default pilot band)
//   ACTIONS="ability.action,..." (default: all 24 non-combat data
//     actions; used for calibration runs)
//   OUTDIR (default evidence/2026-10-27/sim-spandraw-design-b-corpus)
//   DRYRUN=1 (print per-instance summaries, write no files)
//   POSITIONS="A" or "B" or "AB" (default AB)
// Output per instance: spandraw-design-b-s<seed>-<ability>.<action>-<pos>[-t<target>].json
//   {seed, ability, action, position, dayTicksBefore, dayPartBefore,
//    grantOk, grantMethod, openingKcal, result, sayLines, nestEvents,
//    directRecords, mealDrawRecords, dayAfter}
// Write transport mirrors the census sweep: failed writes are kept
// in memory and flushed at the end (EPERM flap waited out, never
// forced); deadline exhaustion stages inside this worktree
// (.spandraw-design-staging, never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const { installStockdoorsCapture } = require('./stockdoors-capture-raidcallers');
const { installMealDrawCapture } = require('./mealdraw-capture');
const { installSpoilvolCapture } = require('./spoilvol-capture');

const SEEDS = (process.env.SEEDS || '9981,9982,9983,9984,9985,9986,9987,9988')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const POSITIONS = (process.env.POSITIONS || 'AB').toUpperCase();
const DRYRUN = process.env.DRYRUN === '1';
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-spandraw-design-b-corpus');
const STAGING_DIR = path.join(__dirname, '..', '.spandraw-design-staging');

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

// Non-combat data actions, from src/data/abilities.json (fixed list;
// the analyzer re-derives it from data and cross-checks).
function nonCombatActions() {
  const abs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'abilities.json'), 'utf8'));
  const out = [];
  for (const a of abs) {
    for (const act of (a.actions || [])) {
      if (act.context === 'combat' || act.automatic) continue;
      out.push({ ability: a.id, action: act.id, context: act.context || 'explore',
        cost: act.cost || {}, skillId: a.skillId || null, lane: a.lane || null,
        gardenOnly: !!act.gardenOnly });
    }
  }
  return out;
}

function ticksFor(cost) {
  if (cost.time_min) return Math.max(1, Math.round(cost.time_min / 2));
  return 0;
}

async function oneProbe(seed, spec, position, target) {
  const { Game } = await loadGame({ seed, mode: 'spandraw-design-b', fullTelemetry: false });  const stockdoors = installStockdoorsCapture(Game);
  const spoilvol = installSpoilvolCapture(Game);
  const mealdraw = installMealDrawCapture(Game, { mealdrawCap: 50000 });
  // Census nest logger, verbatim logic, OUTERMOST (installed last).
  const nestEvents = [];
  let nestEvt = 0, nestDepth = 0;
  function nestDay() { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
  function nestFrames() {
    try {
      const lines = String(new Error().stack || '').split('\n').slice(1);
      const out = [];
      for (const ln of lines) {
        if (/nestFrames|wrappedProbeUse|wrappedProbeDraw/.test(ln)) continue;
        const m = ln.match(/at\s+(?:async\s+)?([^\s(]+)/);
        out.push(m ? m[1] : ln.trim().slice(0, 80));
        if (out.length >= 8) break;
      }
      return out;
    } catch (e) { return []; }
  }
  {
    const origUse = Game.useAbility;
    if (typeof origUse === 'function' && !origUse.__probeInstalled) {
      const wrappedProbeUse = function (...args) {
        const depth = nestDepth++;
        const directBefore = (() => { try { return stockdoors.directRecords.length; } catch (e) { return -1; } })();
        nestEvents.push({ evt: ++nestEvt, kind: 'spanEnter', ability: String(args[0]), action: String(args[1]), day: nestDay(), depth, directBefore });
        let ret;
        try { ret = origUse.apply(this, args); } finally {
          const directAfter = (() => { try { return stockdoors.directRecords.length; } catch (e) { return -1; } })();
          nestEvents.push({ evt: ++nestEvt, kind: 'spanExit', ability: String(args[0]), action: String(args[1]), day: nestDay(), depth, directBefore, directAfter, result: ret });
          nestDepth--;
        }
        return ret;
      };
      wrappedProbeUse.__probeInstalled = true;
      Game.useAbility = wrappedProbeUse;
    }
    const origDraw = Game.pantryDraw;
    if (typeof origDraw === 'function' && !origDraw.__probeInstalled) {
      const wrappedProbeDraw = function (...args) {
        const frames = nestFrames();
        const want = args[1];
        nestEvents.push({ evt: ++nestEvt, kind: 'drawEnter', day: nestDay(), want: (want == null ? null : Math.round(want)), frames });
        const ret = origDraw.apply(this, args);
        try {
          const items = [];
          for (const d of (ret.items || [])) {
            const it = d.item || {};
            items.push({ name: (it.name == null ? null : String(it.name)), kcalEach: (it.kcalEach || 0), units: (d.units || 0), spoilDay: (it.spoilDay == null ? null : it.spoilDay) });
          }
          nestEvents.push({ evt: ++nestEvt, kind: 'drawExit', day: nestDay(), want: (want == null ? null : Math.round(want)), taken: Math.round(ret.taken || 0), items });
        } catch (e) {}
        return ret;
      };
      wrappedProbeDraw.__probeInstalled = true;
      Game.pantryDraw = wrappedProbeDraw;
    }
  }
  await setupGame(Game);
  const s = Game.state.scholar;
  // Villager-target resolution (social second attempt): first living
  // roster villager, resolved inside this instance after setupGame.
  if (target === '__firstVillager__') {
    target = null;
    try {
      const roster = (Game.state.village || {}).roster || [];
      for (const vid of roster) {
        const person = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
        if (person && !person.dead) { target = vid; break; }
        if (!person && vid) { target = vid; break; }
      }
    } catch (e) {}
  }
  // Grant fixture (setup, recorded).
  let grantMethod = null;
  try {
    const abs = (s.abilities || []);
    if (!abs.some((a) => (a.id || a) === spec.ability)) abs.push({ id: spec.ability, level: 1 });
    s.abilities = abs;
    if (Game.hasAbility(spec.ability)) grantMethod = 'abilities-push';
    else if (spec.skillId) {
      // Skill-lane fallback: codex skill fixture (recorded, not hidden).
      try {
        s.skills = s.skills || {};
        s.skills[spec.skillId] = Math.max(s.skills[spec.skillId] || 0, 1);
      } catch (e) {}
      try {
        const cx = Game.state.codex || {};
        cx.skills = cx.skills || {};
        cx.skills[spec.skillId] = Math.max(cx.skills[spec.skillId] || 0, 1);
      } catch (e) {}
      if (Game.hasAbility(spec.ability)) grantMethod = 'skill-fixture:' + spec.skillId;
    }
  } catch (e) { grantMethod = 'grant-error:' + String(e && e.message); }
  const grantOk = grantMethod != null && !String(grantMethod).startsWith('grant-error');
  // Top-up so cost refusals are never fixture artifacts.
  try { s.kcal = Math.max(s.kcal || 0, 5000); s.health = Math.max(s.health || 0, 100); } catch (e) {}
  let openingKcal = null;
  try { const snap = spoilvol.snapshotPantry(); openingKcal = snap.freshKcal; } catch (e) {}
  // Boundary / control position: consistent (dayTicks, dayPart) pair.
  const ticks = ticksFor(spec.cost);
  let pos;
  if (position === 'A') pos = ticks > 0 ? 512 - ticks : 511;
  else pos = 100;
  // Cultivate's impl ticks 16 after payment (kcal-only cost).
  if (position === 'A' && spec.action === 'cultivate') pos = 496;
  try {
    s.dayTicks = pos;
    s.actionClock = 0;
    Game.dayPart = Math.floor(pos / 128);
  } catch (e) {}
  const dayBefore = nestDay();
  // Say-line capture (read-only, restored after the tap).
  const sayLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try { if (sayLines.length < 200) sayLines.push(String(args[0] || '').slice(0, 400)); } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  let result = null, resultError = null;
  try { result = Game.useAbility(spec.ability, spec.action, target == null ? undefined : target); }
  catch (e) { resultError = String(e && (e.stack || e.message)); }
  try { if (typeof origSay === 'function') Game.say = origSay; } catch (e) {}
  const dayAfter = nestDay();
  // Span summary for the console line (analysis lives in the analyzer).
  let spanEnter = null, spanExit = null;
  for (const e of nestEvents) {
    if (e.kind === 'spanEnter' && e.ability === spec.ability && e.action === spec.action) spanEnter = e;
    if (e.kind === 'spanExit' && e.ability === spec.ability && e.action === spec.action) spanExit = e;
  }
  const internalDraws = nestEvents.filter((e) => e.kind === 'drawEnter' &&
    spanEnter && spanExit && e.evt > spanEnter.evt && e.evt < spanExit.evt).length;
  return {
    seed, ability: spec.ability, action: spec.action, context: spec.context,
    position, target: target == null ? null : String(target),
    dayTicksBefore: pos, dayPartBefore: Math.floor(pos / 128),
    grantOk, grantMethod, openingKcal,
    result: result === undefined ? null : result, resultError,
    sayLines, dayBefore, dayAfter,
    spanLogged: !!(spanEnter && spanExit),
    spanCrossed: !!(spanEnter && spanExit && spanEnter.day !== spanExit.day),
    spanInternalDraws: internalDraws,
    nestEvents,
    directRecords: stockdoors.directRecords,
    mealDrawRecords: mealdraw.mealDrawRecords,
  };
}

(async () => {
  let actions = nonCombatActions();
  if (process.env.ACTIONS) {
    const want = new Set(process.env.ACTIONS.split(',').map((x) => x.trim()));
    actions = actions.filter((a) => want.has(a.ability + '.' + a.action));
    if (!actions.length) { console.error('FATAL: ACTIONS filter matched nothing'); process.exit(2); }
  }
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    for (const spec of actions) {
      const positions = [];
      if (POSITIONS.includes('A')) positions.push('A');
      if (POSITIONS.includes('B')) positions.push('B');
      for (const position of positions) {
        // Social actions get a second attempt with a villager target.
        const targets = [null];
        if (spec.context === 'social') targets.push('__firstVillager__');
        for (const t of targets) {
          const perSeed = await oneProbe(seed, spec, position, t);
          done++;
          const name = `spandraw-design-b-s${seed}-${spec.ability}.${spec.action}-${position}${perSeed.target ? '-t' + perSeed.target : ''}.json`;
          const summary = `probe seed=${seed} ${spec.ability}.${spec.action} pos=${position} target=${perSeed.target || '-'} grant=${perSeed.grantOk ? perSeed.grantMethod : 'FAIL'} openKcal=${perSeed.openingKcal} result=${perSeed.result} span=${perSeed.spanLogged ? (perSeed.spanCrossed ? 'CROSSED' : 'same-day') : 'NO-SPAN'} internalDraws=${perSeed.spanInternalDraws} direct=${perSeed.directRecords.length} meals=${perSeed.mealDrawRecords.length} day=${perSeed.dayBefore}->${perSeed.dayAfter}`;
          if (DRYRUN) { console.log('[DRYRUN] ' + summary); continue; }
          const data = JSON.stringify(perSeed);
          if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
          else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
        }
      }
    }
  }
  if (DRYRUN) { console.log('dryrun done: ' + done + ' probes, no files written'); return; }
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
  console.log('wrote ' + done + ' probe files to ' + OUTDIR);
})().catch((e) => { console.error('PROBE CRASH', e && (e.stack || e)); process.exit(2); });

