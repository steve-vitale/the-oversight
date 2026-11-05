#!/usr/bin/env node
// test-spoilname-a.js — per-form spoil-sweep naming instrument
// (sim-spoilname-a, oversight-flesh-out-loop, axis food-economy).
//
// Anchor: berries lump 12 units @ spoilDay 10; a dawn sweep removes
// that one lump form while other forms persist; the morning record
// shows fewer lump units without naming the form.
//
// Lesson applied (upkeepbreakfast 2026-11-04): a corpus blind to the
// window where lines actually speak reads silence where there is
// none. So this instrument captures the FULL transcript with a global
// Game.say wrap — direct sweep call (Stage A) AND the real endDay()
// dawn path (Stage B, with a sweepSpoiled wrap pinning the exact
// pre-sweep pack) — plus the morning record in bankfood-diag
// packSnap shape (lumpUnits headline + lumpSpoilDays + stacks[]).
// It makes NO game-code change and NO judgment; the prereg judges.
//
// Env: SEED (required), STAGE=A|B (required), OUTDIR (default
// evidence/2026-11-04/sim-spoilname-a-corpus). One seed, one stage,
// one process (no cross-seed harness sharing). Prints the verdict
// fields to stdout as they land; writes one JSON file with
// read-back verification; a failed write exits 2 LOUDLY.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '', 10);
if (!SEED) { console.error('FATAL: SEED must be set explicitly'); process.exit(2); }
const STAGE = process.env.STAGE || '';
if (STAGE !== 'A' && STAGE !== 'B') { console.error('FATAL: STAGE must be A or B'); process.exit(2); }
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-11-04', 'sim-spoilname-a-corpus');

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
  // Fixture at day 8 via the real addUnknownToLump path.
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

  const out = { seed: SEED, stage: STAGE, fixture, anchorOk, spoilBonusDays: bonus,
    packBefore: packSnap(Game), lumpBefore: lumpSummary(packSnap(Game)) };
  if (STAGE === 'A') {
    // SPOILDAY override (follow-up diagnostic only, not prereg-scored):
    // re-run the direct sweep on the bonus-extended spoilage day.
    sch.day = parseInt(process.env.SPOILDAY || '10', 10);
    const mark = sayLines.length;
    let removed = null;
    try { removed = Game.sweepSpoiled(); } catch (e) { out.sweepError = String(e && (e.stack || e.message)); }
    out.sweepReturn = removed;
    out.sweepLines = sayLines.slice(mark).map((x) => x.line);
    out.packAfter = packSnap(Game);
    out.lumpAfter = lumpSummary(out.packAfter);
  } else {
    // Stage B: real dawn path. Pin the sweep call itself.
    sch.day = 9;
    const origSweep = Game.sweepSpoiled;
    let sweepCall = null;
    if (typeof origSweep === 'function') {
      Game.sweepSpoiled = function (...args) {
        const mark = sayLines.length;
        const pre = packSnap(Game);
        let ret = null, err = null;
        try { ret = origSweep.apply(this, args); } catch (e) { err = String(e && e.message); }
        sweepCall = { prePack: pre, preLumps: lumpSummary(pre),
          lines: sayLines.slice(mark).map((x) => x.line), ret, err };
        if (err) throw new Error(err);
        return ret;
      };
    }
    try { Game.endDay(); out.endDayOk = true; } catch (e) { out.endDayOk = false; out.endDayError = String(e && (e.stack || e.message)); }
    out.dayAfter = sch.day;
    out.playerAlive = !(sch.dead);
    out.sweepCall = sweepCall;
    out.dawnWindow = sayLines.filter((x) => x.line.includes('DAWN') || (sweepCall && sweepCall.lines.includes(x.line))).map((x) => x.line);
    // Full dawn-window transcript: from the DAY 10 DAWN header onward.
    const hdr = sayLines.findIndex((x) => /DAY 10 DAWN/.test(x.line));
    out.dawnTranscript = hdr >= 0 ? sayLines.slice(hdr).map((x) => x.line) : [];
    out.packAfter = packSnap(Game);
    out.lumpAfter = lumpSummary(out.packAfter);
    if (typeof origSweep === 'function') Game.sweepSpoiled = origSweep;
  }
  // Judged fields (prereg primary metric: Stage A spoil line names the form).
  const spoilLines = STAGE === 'A' ? out.sweepLines : (out.sweepCall ? out.sweepCall.lines : []);
  out.formNamedInSweep = spoilLines.some((l) => l.includes('unknown berries'));
  out.unitsNamedInSweep = spoilLines.some((l) => /12/.test(l));
  out.headlineNamesForm = false; // lumpUnits/lumpSpoilDays carry no names by construction; verified below
  out.stacksDiffNamesForm = (() => {
    const before = new Set((out.packBefore.stacks || []).filter((s) => s && s.lump).map((s) => s.name + '|' + s.units));
    const after = new Set((out.packAfter.stacks || []).filter((s) => s && s.lump).map((s) => s.name + '|' + s.units));
    const gone = [...before].filter((x) => !after.has(x));
    return { gone, namesBerries: gone.some((x) => x.startsWith('unknown berries|')) };
  })();
  const data = JSON.stringify(out, null, 1);
  const file = path.join(OUTDIR, `spoilname-a-s${SEED}-stage${STAGE}.json`);
  const ok = writeRobust(file, data);
  console.log(`spoilname seed=${SEED} stage=${STAGE} anchorOk=${anchorOk} bonus=${bonus} ` +
    `lumpBefore=[${out.lumpBefore}] lumpAfter=[${out.lumpAfter}] ` +
    `formNamed=${out.formNamedInSweep} unitsNamed=${out.unitsNamedInSweep} ` +
    `spoilLines=${JSON.stringify(spoilLines)} ` +
    `stacksGone=${JSON.stringify(out.stacksDiffNamesForm.gone)} ` +
    (ok ? 'written=' + file : 'WRITE FAIL LOUDLY'));
  if (!ok) { console.error('FATAL: write failed after retries: ' + file); process.exit(2); }
})().catch((e) => { console.error('SPOILNAME CRASH', e && (e.stack || e)); process.exit(2); });
