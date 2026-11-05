#!/usr/bin/env node
// test-pantryspoil-a.js — pantry spoil line unit-count instrument
// (sim-pantryspoil-a, oversight-flesh-out-loop, axis food-economy).
//
// Same fixture family as sim-sweepcount-a / sim-spoilname-a: pack lumps
// (berries x12 @ spoilDay 10; shoots x5 / roots x4 persist past dawn
// day 10) PLUS a pantry fixture planted at scholar day 8: Foraged food
// x5 @ 10, Muscadine Grapes x3 @ 10, Smoked fish x1 @ 10 (singular
// control), Dried beans x4 @ 30 (survivor control). Captures the FULL
// transcript with a global Game.say wrap — direct sweep call (Stage A)
// AND the real endDay() dawn path (Stage B). It makes NO judgment;
// the prereg judges. It measures BOTH the baseline (before the count
// change) and the candidate (after), on identical seeds;
// TAG=before|after selects which corpus file a run writes.
//
// Env: SEED (required), STAGE=A|B (required), TAG=before|after
// (default before), SPOILDAY (Stage A delayed-day override),
// OUTDIR (default evidence/2026-11-05/perseed-pantryspoil-a).
// One seed, one stage, one process. Prints verdict fields to stdout
// as they land; writes one JSON file with read-back verification;
// a failed write exits 2 LOUDLY.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '', 10);
if (!SEED) { console.error('FATAL: SEED must be set explicitly'); process.exit(2); }
const STAGE = process.env.STAGE || '';
if (STAGE !== 'A' && STAGE !== 'B') { console.error('FATAL: STAGE must be A or B'); process.exit(2); }
const TAG = process.env.TAG || 'before';
if (TAG !== 'before' && TAG !== 'after') { console.error('FATAL: TAG must be before or after'); process.exit(2); }
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-11-05', 'perseed-pantryspoil-a');
const SPOILDAY = parseInt(process.env.SPOILDAY || '10', 10);

function packSnap(Game) {
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    let lumpUnits = 0;
    const lumpSpoilDays = [];
    const stacks = inv.map((it) => {
      if (!it || typeof it !== 'object') return it;
      const units = (it.units === undefined || it.units === null) ? 1 : it.units;
      if (it.foodState === 'unknown' && it.lump) { lumpUnits += units; lumpSpoilDays.push(it.spoilDay === undefined ? null : it.spoilDay); }
      return { name: it.name || null, units, foodState: it.foodState || null,
        spoilDay: (it.spoilDay === undefined ? null : it.spoilDay), lump: !!it.lump,
        lumpForm: it.lumpForm || null };
    });
    return { lumpUnits, lumpSpoilDays, stacks };
  } catch (e) { return { lumpUnits: null, lumpSpoilDays: [], stacks: [], error: String(e && e.message) }; }
}
function lumpSummary(snap) {
  return (snap.stacks || []).filter((s) => s && s.lump).map((s) => `${s.name} x${s.units} @${s.spoilDay}`).join(' | ');
}
function pantrySnap(Game) {
  try {
    const pan = ((Game.state || {}).village || {}).pantry || [];
    const stacks = pan.map((it) => {
      if (!it || typeof it !== 'object') return it;
      return { name: it.name || null, units: (it.units === undefined || it.units === null) ? 1 : it.units,
        spoilDay: (it.spoilDay === undefined ? null : it.spoilDay), foodState: it.foodState || null };
    });
    return { stacks };
  } catch (e) { return { stacks: [], error: String(e && e.message) }; }
}
function pantrySummary(snap) {
  return (snap.stacks || []).filter((s) => s && s.name).map((s) => `${s.name} x${s.units} @${s.spoilDay}`).join(' | ');
}
// Pantry fixture: two multi-unit stacks (the judged counts), one
// singular stack (wording control), one survivor (must stay put).
// Names are distinct, so the sweep's `new Set` dedup cannot collapse
// them (see prereg known limitation).
function plantPantry(Game) {
  const v = Game.state.village;
  v.pantry = v.pantry || [];
  const rows = [
    { name: 'Foraged food', units: 5, kcalEach: 100, spoilDay: 10, foodState: 'fresh', foodKind: 'plant', edible: true, safe: true },
    { name: 'Muscadine Grapes', units: 3, kcalEach: 50, spoilDay: 10, foodState: 'fresh', foodKind: 'plant', edible: true, safe: true },
    { name: 'Smoked fish', units: 1, kcalEach: 200, spoilDay: 10, foodState: 'smoked', foodKind: 'meat', edible: true, safe: true },
    { name: 'Dried beans', units: 4, kcalEach: 80, spoilDay: 30, foodState: 'dried', foodKind: 'plant', edible: true, safe: true },
  ];
  for (const r of rows) v.pantry.push(Object.assign({}, r));
  v.pantryKcal = v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  return rows.map((r) => `${r.name} x${r.units} @${r.spoilDay}`).join(' | ');
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 120; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      fs.renameSync(tmp, filePath);
      return true;
    } catch (e) { /* flap: retry */ }
  }
  return false;
}
// Count Math.random draws during fn (det-gate: the count insertion must
// add or move NO draws — spoilVoiceLine keeps its one-_beatCast-draw
// discipline). The seeded RNG is global Math.random; wrapping it
// delegates in order, so the stream is undisturbed.
function countDraws(fn) {
  const orig = Math.random;
  let draws = 0;
  Math.random = function (...a) { draws++; return orig.apply(this, a); };
  let ret = null, err = null;
  try { ret = fn(); } catch (e) { err = String(e && (e.stack || e.message)); }
  finally { Math.random = orig; }
  return { ret, err, draws };
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, narration: true });
  const sayLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try {
        if (sayLines.length < 40000) {
          sayLines.push({ day: ((Game.state || {}).scholar || {}).day ?? null,
            line: String(args[0] || '').slice(0, 500) });
        }
      } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  await setupGame(Game);
  const sch = Game.state.scholar;
  // Pack fixture at day 8 via the real addUnknownToLump path
  // (sweepcount regression guard: the Overnight line must keep "12
  // unknown berries" after this change).
  sch.day = 8;
  const plants = Game.data.plants || [];
  const berryPlant = plants.find((p) => p.id === 'blackberry');
  const shootsPlant = plants.find((p) => p.form === 'shoots' && (p.spoilageDays || 0) >= 5);
  const rootsPlant = plants.find((p) => p.form === 'roots' && (p.spoilageDays || 0) >= 5);
  if (!berryPlant || !shootsPlant || !rootsPlant) throw new Error('fixture plants not found');
  const berries = Game.addUnknownToLump(berryPlant, 12, 8);
  const shoots = Game.addUnknownToLump(shootsPlant, 5, 8);
  const roots = Game.addUnknownToLump(rootsPlant, 4, 8);
  const fixture = {
    berries: { plantId: berryPlant.id, name: berries.name, lumpForm: berries.lumpForm, units: berries.units, spoilDay: berries.spoilDay },
    shoots: { plantId: shootsPlant.id, name: shoots.name, lumpForm: shoots.lumpForm, units: shoots.units, spoilDay: shoots.spoilDay },
    roots: { plantId: rootsPlant.id, name: roots.name, lumpForm: roots.lumpForm, units: roots.units, spoilDay: roots.spoilDay },
  };
  const anchorOk = fixture.berries.units === 12 && fixture.berries.spoilDay === 10
    && fixture.shoots.spoilDay > 10 && fixture.roots.spoilDay > 10;
  let bonus = null;
  try { bonus = Game.spoilBonusDays(); } catch (e) { bonus = 'ERR:' + (e && e.message); }
  let knowsPreserve = null;
  try { knowsPreserve = Game.knowsTechnique('preserve'); } catch (e) { knowsPreserve = 'ERR:' + (e && e.message); }

  const out = { seed: SEED, stage: STAGE, tag: TAG, fixture, anchorOk, spoilBonusDays: bonus,
    knowsPreserve, packBefore: packSnap(Game), lumpBefore: lumpSummary(packSnap(Game)) };
  if (STAGE === 'A') {
    // Plant the pantry fixture now (day 8); the direct sweep at the
    // SPOILDAY runs with no meals in between, so nothing can eat it.
    out.pantryPlanted = plantPantry(Game);
    out.pantryBefore = pantrySnap(Game);
    out.pantryBeforeSummary = pantrySummary(out.pantryBefore);
    // SPOILDAY override (delayed-day follow-up for bonus seeds, not a
    // re-score): re-run the direct sweep on the bonus-extended day.
    sch.day = SPOILDAY;
    out.spoilDayUsed = sch.day;
    const mark = sayLines.length;
    const counted = countDraws(() => Game.sweepSpoiled());
    out.sweepReturn = counted.ret;
    out.sweepError = counted.err;
    out.rngDrawsDuringSweep = counted.draws;
    // Next-3 stream values after the sweep: identical before/after on
    // identical seeds iff no draw was added or moved.
    out.rngAfterSweep = [Math.random(), Math.random(), Math.random()];
    out.sweepLines = sayLines.slice(mark).map((x) => x.line);
    out.packAfter = packSnap(Game);
    out.lumpAfter = lumpSummary(out.packAfter);
    out.pantryAfter = pantrySnap(Game);
    out.pantryAfterSummary = pantrySummary(out.pantryAfter);
  } else {
    // Stage B: real dawn path. The pantry fixture is planted INSIDE
    // the sweep wrapper, just before the real sweep fires at dawn —
    // day-9 meals during endDay() cannot eat it first. Plant once
    // (guarded); record every sweep call.
    sch.day = 9;
    const origSweep = Game.sweepSpoiled;
    const sweepCalls = [];
    let planted = false;
    if (typeof origSweep === 'function') {
      Game.sweepSpoiled = function (...args) {
        const mark = sayLines.length;
        const prePack = packSnap(Game);
        if (!planted) { sweepCalls.planted = plantPantry(Game); planted = true; }
        const prePantry = pantrySnap(Game);
        const counted = countDraws(() => origSweep.apply(this, args));
        sweepCalls.push({ prePack, preLumps: lumpSummary(prePack),
          prePantry, prePantrySummary: pantrySummary(prePantry),
          lines: sayLines.slice(mark).map((x) => x.line), ret: counted.ret,
          err: counted.err, rngDrawsDuringSweep: counted.draws });
        if (counted.err) throw new Error(counted.err);
        return counted.ret;
      };
    }
    try { Game.endDay(); out.endDayOk = true; } catch (e) { out.endDayOk = false; out.endDayError = String(e && (e.stack || e.message)); }
    out.dayAfter = sch.day;
    out.playerAlive = !(sch.dead);
    out.sweepCalls = sweepCalls;
    out.sweepCallCount = sweepCalls.length;
    const allSweepLines = sweepCalls.flatMap((c) => c.lines || []);
    out.dawnWindow = sayLines.filter((x) => x.line.includes('DAWN') || allSweepLines.includes(x.line)).map((x) => x.line);
    const hdr = sayLines.findIndex((x) => /DAY 10 DAWN/.test(x.line));
    out.dawnTranscript = hdr >= 0 ? sayLines.slice(hdr).map((x) => x.line) : [];
    out.packAfter = packSnap(Game);
    out.lumpAfter = lumpSummary(out.packAfter);
    out.pantryAfter = pantrySnap(Game);
    out.pantryAfterSummary = pantrySummary(out.pantryAfter);
    if (typeof origSweep === 'function') Game.sweepSpoiled = origSweep;
  }
  // Judged fields (prereg primary metric: Stage-A pantry line states
  // the unit count of EACH removed multi-unit stack, "5 Foraged food"
  // and "3 Muscadine Grapes").
  const spoilLines = STAGE === 'A' ? out.sweepLines : (out.sweepCalls || []).flatMap((c) => c.lines || []);
  out.pantryLines = spoilLines.filter((l) => l.startsWith('The village threw out spoiled stores:'));
  out.overnightLines = spoilLines.filter((l) => l.startsWith('Overnight,'));
  out.formNamedInPantry = out.pantryLines.some((l) => l.includes('Foraged food'))
    && out.pantryLines.some((l) => l.includes('Muscadine Grapes'))
    && out.pantryLines.some((l) => l.includes('Smoked fish'));
  out.countNamedInPantry = out.pantryLines.some((l) => /5 Foraged food/.test(l) && /3 Muscadine Grapes/.test(l));
  out.singularIntact = out.pantryLines.some((l) => l.includes('Smoked fish'))
    && !out.pantryLines.some((l) => /1 Smoked fish/.test(l));
  out.countNamedInSweep = spoilLines.some((l) => /12 unknown berries/.test(l));
  out.formNamedInSweep = spoilLines.some((l) => l.includes('unknown berries'));
  const beforeNames = new Set(((STAGE === 'A' ? out.pantryBefore : (out.sweepCalls[0] || {}).prePantry) || { stacks: [] }).stacks.map((s) => s && (s.name + '|' + s.units)));
  const afterNames = new Set((out.pantryAfter.stacks || []).map((s) => s && (s.name + '|' + s.units)));
  out.pantryRemovalHappened = [...beforeNames].filter((x) => !afterNames.has(x));
  out.survivorIntact = afterNames.has('Dried beans|4');
  out.removalHappened = out.pantryRemovalHappened.filter((x) => x.startsWith('Foraged food|') || x.startsWith('Muscadine Grapes|') || x.startsWith('Smoked fish|'));
  const data = JSON.stringify(out, null, 1);
  const file = path.join(OUTDIR, `pantryspoil-a-s${SEED}-stage${STAGE}-${TAG}-d${STAGE === 'A' ? SPOILDAY : 10}.json`);
  const ok = writeRobust(file, data);
  console.log(`pantryspoil seed=${SEED} stage=${STAGE} tag=${TAG} spoilDay=${STAGE === 'A' ? SPOILDAY : 10} anchorOk=${anchorOk} bonus=${bonus} ` +
    `knowsPreserve=${knowsPreserve} pantryBefore=[${STAGE === 'A' ? out.pantryBeforeSummary : (out.sweepCalls[0] ? out.sweepCalls[0].prePantrySummary : '?')}] pantryAfter=[${out.pantryAfterSummary}] ` +
    `removal=${JSON.stringify(out.removalHappened)} formNamed=${out.formNamedInPantry} countNamed=${out.countNamedInPantry} ` +
    `singularIntact=${out.singularIntact} survivorIntact=${out.survivorIntact} sweepCountNamed=${out.countNamedInSweep} ` +
    `rngDraws=${STAGE === 'A' ? out.rngDrawsDuringSweep : JSON.stringify((out.sweepCalls || []).map((c) => c.rngDrawsDuringSweep))} ` +
    `pantryLine=${JSON.stringify(out.pantryLines)} ` +
    (ok ? 'written=' + file : 'WRITE FAIL LOUDLY'));
  if (!ok) { console.error('FATAL: write failed after retries: ' + file); process.exit(2); }
})().catch((e) => { console.error('PANTRYSPOIL CRASH', e && (e.stack || e)); process.exit(2); });
