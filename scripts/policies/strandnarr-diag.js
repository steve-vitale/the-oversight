// strandnarr-diag — full-transcript recorder + window classifiers
// (sim-strandnarr-a, 2026-11-04, flesh-out loop, axis food-economy).
//
// WHY THIS EXISTS: the prior bankfood arm (scripts/bankfood-trace-b.js)
// wrapped Game.say and sliced ONLY the lines spoken inside one
// policy.daily call. The harness order per loop-day is upkeep, wait,
// upkeep, wait, upkeep, wait, daily, sleep — so meal beats spoken in
// upkeep and bedding-down/wake lines spoken in sleep fell in the gaps
// between daily slices and were never attached to any row, and
// Game.log keeps only the last 40 lines (game.js emit), so a post-hoc
// log read cannot recover a full day either. This recorder keeps EVERY
// attempted say/sysSay line in memory during the run, tagged with the
// phase live at capture time (upkeep / daily / sleep / harness), the
// loop-day, and the upkeep part — so upkeep windows and sleep windows
// are first-class slices, not gaps.
//
// OBSERVATIONAL ONLY, zero src/js changes: the wraps record the text
// and call the original say/sysSay (no-ops under the sim harness's
// narration-off default) with identical arguments. They draw no RNG,
// edit no state, and return the original value. Trajectory identity
// vs recorder-OFF is proven by the det-gate in the prereg
// (evidence/2026-11-04/sim-strandnarr-a-prereg.md).
//
// Line-classification regexes are pure functions, unit-tested in
// scripts/test-strandnarr-a.js.
'use strict';

const BEDDING_RE = /You settle into|Sleeping rough means/;
const NIGHT_OUT_RE = /spent the night out here/;
const SLEEP_REFUSED_RE = /too late for real sleep/;
const WOKE_START_RE = /wake with a start/;
const MEAL_BEAT_RE = /You eat (.+?) \((\d+) kcal\)/;
const PANTRY_HALL_RE = /The pantry is in the hall\. Your hands are not/;
const HAVEN_GOSSIP_RE = /Word gets around the haven/;

function newStore() {
  return {
    lines: [], // {idx, day, phase, loopDay, part, via, text}
    markers: [], // {kind, loopDay, part, idx, scholarDay, kcal, tile, inside, access, pantryKcal}
    phase: 'harness', loopDay: 0, part: 0,
    errs: 0, errors: [],
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && (e.message || e)) || e).slice(0, 120));
  } catch (e2) { /* recording must never throw */ }
}

function scholarDayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}
function scholarKcalOf(Game) {
  try { return Math.round(((Game.state || {}).scholar || {}).kcal || 0); } catch (e) { return 0; }
}
function tileOf(Game) {
  try { const t = Game.playerTile(); return t ? (t.type || null) : null; } catch (e) { return null; }
}
function insideOf(Game) {
  try { const s = (Game.state || {}).scholar || {}; return (s.insideHaven === undefined ? null : !!s.insideHaven); } catch (e) { return null; }
}
function accessOf(Game) {
  try { return (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) { return null; }
}
function pantryKcalOf(Game) {
  try {
    const p = ((Game.state || {}).village || {}).pantry || [];
    let t = 0;
    for (const it of p) t += (it.kcalEach || 0) * (it.units || 0);
    return Math.round(t);
  } catch (e) { return null; }
}

function snapMarker(Game, store, kind) {
  try {
    store.markers.push({ kind, loopDay: store.loopDay || 0, part: store.part || 0,
      idx: store.lines.length, scholarDay: scholarDayOf(Game), kcal: scholarKcalOf(Game),
      tile: tileOf(Game), inside: insideOf(Game), access: accessOf(Game),
      pantryKcal: pantryKcalOf(Game) });
  } catch (e) { noteErr(store, 'marker.' + kind, e); }
}

// installTranscript(Game, store): wraps Game.say + Game.sysSay when
// STRANDNARR=1; when unset/0 returns a noop and touches nothing (the
// det-gate's "no wrap installed" check is therefore a real identity
// check, not a flag check). Lines are capped at 400 chars like the
// bankfood sayLines cap; the cap is a storage bound, not a filter.
function installTranscript(Game, store) {
  if (!Game || !store) return function () {};
  try { if (process.env.STRANDNARR !== '1') return function () {}; } catch (e) { return function () {}; }
  if (Game._strandnarrWrapped) return function () {};
  const uninstalls = [];
  for (const name of ['say', 'sysSay']) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); continue; }
      const orig = Game[name];
      Game[name] = function (...args) {
        try {
          if (store.lines.length < 200000) {
            store.lines.push({ idx: store.lines.length, day: scholarDayOf(this),
              phase: store.phase || 'harness', loopDay: store.loopDay || 0,
              part: store.part || 0, via: name,
              text: String(args[0] == null ? '' : args[0]).slice(0, 400) });
          }
        } catch (e) { noteErr(store, name + '.record', e); }
        return orig.apply(this, args);
      };
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, 'install.' + name, e); }
  }
  Game._strandnarrWrapped = true;
  store.installed = true;
  return function () { for (const u of uninstalls) u(); };
}

function isBeddingLine(text) { return BEDDING_RE.test(text || ''); }
function isNightOutLine(text) { return NIGHT_OUT_RE.test(text || ''); }
function isSleepRefusedLine(text) { return SLEEP_REFUSED_RE.test(text || ''); }
function isWokeStartLine(text) { return WOKE_START_RE.test(text || ''); }
function isPantryHallLine(text) { return PANTRY_HALL_RE.test(text || ''); }
function isHavenGossipLine(text) { return HAVEN_GOSSIP_RE.test(text || ''); }
// mealBeat(text): {what, kcal} for an engine meal beat, else null.
// The beat is "You eat <what> (<n> kcal)." possibly followed by bank /
// spoil notes in the same say call — the regex takes the first kcal.
function mealBeat(text) {
  if (!text) return null;
  const m = MEAL_BEAT_RE.exec(text);
  if (!m) return null;
  return { what: m[1], kcal: parseInt(m[2], 10) };
}

// windowLines(store, startMarker, endMarker): transcript lines with
// idx in [start.idx, end.idx). Markers are not lines, so the bounds
// are exact: a line spoken between the two marker calls is inside.
function windowLines(store, startMarker, endMarker) {
  if (!startMarker || !endMarker) return null;
  return store.lines.filter((l) => l.idx >= startMarker.idx && l.idx < endMarker.idx);
}

// classifySleepWindow(lines): the verdict inputs for one stranded night.
// sleptThrough is NOT decided here — it comes from the sleep markers'
// scholarDay change (a woke-with-a-start night keeps its day).
function classifySleepWindow(lines) {
  if (!lines) return null;
  const bedding = lines.filter((l) => isBeddingLine(l.text));
  const nightOut = lines.filter((l) => isNightOutLine(l.text));
  const refused = lines.filter((l) => isSleepRefusedLine(l.text));
  const wokeStart = lines.filter((l) => isWokeStartLine(l.text));
  return { n: lines.length,
    bedding: bedding.map((l) => l.text), nightOut: nightOut.map((l) => l.text),
    refused: refused.map((l) => l.text), wokeStart: wokeStart.map((l) => l.text) };
}

// classifyUpkeepWindow(lines): meal beats + pantry/gossip sense notes
// for one loop-day's upkeep phase (all three parts, by line.loopDay).
function classifyUpkeepWindow(lines) {
  if (!lines) return null;
  const meals = [];
  for (const l of lines) { const b = mealBeat(l.text); if (b) meals.push({ idx: l.idx, part: l.part, what: b.what, kcal: b.kcal, text: l.text }); }
  return { n: lines.length, meals,
    mealKcal: meals.reduce((t, m) => t + m.kcal, 0),
    pantryHall: lines.filter((l) => isPantryHallLine(l.text)).map((l) => l.text),
    gossip: lines.filter((l) => isHavenGossipLine(l.text)).map((l) => l.text) };
}

module.exports = { newStore, noteErr, installTranscript, snapMarker,
  scholarDayOf, scholarKcalOf, tileOf, insideOf, accessOf, pantryKcalOf,
  isBeddingLine, isNightOutLine, isSleepRefusedLine, isWokeStartLine,
  isPantryHallLine, isHavenGossipLine, mealBeat, windowLines,
  classifySleepWindow, classifyUpkeepWindow,
  BEDDING_RE, NIGHT_OUT_RE, SLEEP_REFUSED_RE, WOKE_START_RE, MEAL_BEAT_RE };
