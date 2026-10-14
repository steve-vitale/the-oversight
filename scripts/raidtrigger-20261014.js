// raidtrigger-20261014.js — RAID-TRIGGER INSTRUMENT (longsim r31 ARM 1,
// scale-onramp axis, sim-findings #176).
//
// DIAGNOSTIC instrument — measures whether pantry fullness mechanically
// attracts raids at a LIVED RATE, not just as a static rule. Zero
// game-code changes; every wrap is call-through with before/after
// observation. Reuses scripts/predation-lib-20261014.js (gorge/lingerer
// telemetry) and scripts/preddisc-20261014.js (collapse classification) —
// never duplicates them; it wraps or extends.
//
// What it records, per night, from the engine's own raid gate
// (src/js/havenGrowth.js: havenRaidTick):
//   - pantryBefore at tick time (via this.pantryKcalLive — the EXACT value
//     the static rule reads), banded relative to the 3k smell-line:
//     '<3k' | '3-12k' | '12-24k' | '>24k' (the 12k/24k edges are the
//     engine's WEALTH-DRAWS-TEETH thresholds: 3 raiders base, +1 > 12k,
//     +1 > 24k, cap 5)
//   - the gate's preconditions (monsters >= 3, >=7d since last raid, pantry
//     >= 3k, table not sitting) so ripe-but-blocked nights can be told
//     apart from thin-pantry nights
//   - on fire: raiders count (parsed from the engine's own say beat),
//     raider waves, and the static rule's prediction for that pantry
// What it records for the pantry PATH: every pantryDraw issued inside a
// raidPillage call (the gorge path — havenGrowthDaily -> raidPillage), with
// the actual items drawn (name, kcalEach, units, foodState) from the
// engine's own return value. This traces which store the raiders hit.
//
// Rate curve: for each band B, raid nights / 100 nights spent in B
// (nights = havenRaidTick invocations while the village lives).
//
// Usage:
//   const { attachRaidtrigger, finalizeRaidtrigger } = require('./raidtrigger-20261014');
//   const ptrack = attachPreddisc(Game);            // preddisc (gorge + collapse class)
//   const track = attachRaidtrigger(Game, ptrack.ptrack);  // wraps EXTEND, never duplicates
//   ... policy.daily calls ptrack.sampleDay() ...
//   const A = finalizeRaidtrigger(Game, track);     // rate curve + size distribution + pantry path
//
// TEST-ONLY sabotage hook: process.env.RT_SABOTAGE_BANDS=1 makes bandOf()
// return 'sabotaged' for every input. scripts/test-raidtrigger-20261014.js
// uses it for the REAL RED phase (the verdict must FAIL on sabotaged bands).
'use strict';
const { installPredation, gday } = require('./predation-lib-20261014');

const SMELL_LINE = 3000;

function bandOf(kcal) {
  // NOTE: the edges mirror the engine's static rule exactly:
  //   raid if pantry >= 3000; raiders = 3 + (pantry > 12000) + (pantry > 24000)
  if (process.env.RT_SABOTAGE_BANDS === '1') return 'sabotaged'; // TEST-ONLY defect hook
  if (kcal < 3000) return '<3k';
  if (kcal <= 12000) return '3-12k';
  if (kcal <= 24000) return '12-24k';
  return '>24k';
}
function expectedRaiders(kcal) {
  return kcal > 24000 ? 5 : kcal > 12000 ? 4 : 3;
}

function itemName(it) {
  try { return String((it && (it.name || it.id || it.kind)) || '?').slice(0, 48); }
  catch (e) { return '?'; }
}

function attachRaidtrigger(Game, ptrack) {
  if (!ptrack) ptrack = installPredation(Game);
  const track = {
    ptrack,
    raidTicks: [],       // {day, fired, pantryBefore, band, monsters, sinceLast, table, over,
                         //  ripe, rngBlocked, raiders, raiderWaves, expected, matchesRule}
    raidFireBeats: [],   // {day, count, text} — the engine's own raid-fire say line
    raidPantryDraws: [], // {day, asked, taken, items:[{name,kcalEach,units,effectiveKcal,foodState}]}
    instrErrors: [],
  };
  const note = (where, e) => { track.instrErrors.push(where + ': ' + (e && e.message)); };
  let raidCtx = null; // set while inside a raidPillage call (pantry-path tracing)

  // --- say (chained AFTER predation-lib's wrap): capture the raid-fire beat ---
  try {
    const chainedSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        const s = String(msg || '');
        const m = s.match(/RAID\s+—\s+(?:a raider|(\d+)\s+raiders)/);
        if (m) {
          track.raidFireBeats.push({ day: gday(Game),
            count: m[1] ? parseInt(m[1], 10) : 1, text: s.slice(0, 320) });
        }
      } catch (e) {}
      return chainedSay(msg);
    };
  } catch (e) { note('wrapSay', e); }

  // --- raidPillage (chained AFTER predation-lib's wrap): pantry-path flag ---
  try {
    const origRP = Game.raidPillage.bind(Game);
    Game.raidPillage = function (v, kcal) {
      raidCtx = { day: gday(this), asked: Math.round(kcal || 0) };
      let ret;
      try { ret = origRP(v, kcal); } finally { raidCtx = null; }
      return ret;
    };
  } catch (e) { note('wrapRaidPillage', e); }

  // --- pantryDraw: record draws issued inside a raidPillage call ---
  // pantryDraw returns {taken, items:[{item, units, effectiveKcal, cooked}]}
  // — the engine's own draw record is exactly "which store the raiders hit".
  try {
    const origPD = Game.pantryDraw.bind(Game);
    Game.pantryDraw = function (v, want, opts) {
      const ctx = raidCtx;
      const ret = origPD(v, want, opts);
      if (ctx) {
        try {
          track.raidPantryDraws.push({
            day: ctx.day,
            asked: Math.round(want || 0),
            taken: Math.round((ret && ret.taken) || 0),
            items: ((ret && ret.items) || []).map(r => ({
              name: itemName(r.item),
              kcalEach: Math.round((r.item && r.item.kcalEach) || 0),
              units: r.units || 0,
              effectiveKcal: Math.round(r.effectiveKcal || 0),
              foodState: (r.item && r.item.foodState) || null,
            })),
          });
        } catch (e) { note('pantryDraw', e); }
      }
      return ret;
    };
  } catch (e) { note('wrapPantryDraw', e); }

  // --- havenRaidTick: the gate, observed nightly ---
  try {
    const origTick = Game.havenRaidTick.bind(Game);
    Game.havenRaidTick = function () {
      const pre = {};
      try {
        const v = this.state.village;
        let monsters = 0;
        try { monsters = (this.worldMonsters ? this.worldMonsters() : []).length; } catch (e) {}
        let pantry = 0;
        try { pantry = (this.pantryKcalLive ? (this.pantryKcalLive(v) || 0) : 0); } catch (e) {}
        let table = false;
        try { table = !!(this.tableActive && this.tableActive()); } catch (e) {}
        const day = gday(this);
        Object.assign(pre, {
          day, pantryBefore: Math.round(pantry), monsters,
          sinceLast: day - ((v && v.lastRaidDay) || 0),
          table, over: !!this.over,
        });
      } catch (e) { note('tickPre', e); }
      const beatsBefore = track.raidFireBeats.length;
      const ret = origTick();
      try {
        const fired = !!ret;
        const band = bandOf(pre.pantryBefore || 0);
        const ripe = !pre.over && !pre.table &&
          (pre.sinceLast || 0) >= 7 && (pre.monsters || 0) >= 3 &&
          (pre.pantryBefore || 0) >= SMELL_LINE;
        let raiders = null, raiderWaves = [];
        if (fired) {
          const beats = track.raidFireBeats.slice(beatsBefore)
            .filter(b => b.day === pre.day);
          if (beats.length) raiders = beats[beats.length - 1].count;
          // raider waves: raiders pinned at haven this tick are the freshest
          // lingering set — best-effort, recorded as unknown when unclear
          try {
            const wms = (this.worldMonsters ? this.worldMonsters() : []) || [];
            raiderWaves = wms.filter(m => m && m.lingering)
              .slice(-Math.max(raiders || 0, 0))
              .map(m => { try { return (this.data.monsters.find(x => x.id === m.id) || {}).wave || 1; } catch (e2) { return 1; } });
          } catch (e) {}
        }
        const expected = (pre.pantryBefore || 0) >= SMELL_LINE
          ? expectedRaiders(pre.pantryBefore || 0) : null;
        track.raidTicks.push(Object.assign({}, pre, {
          band, fired, raiders, raiderWaves,
          ripe, rngBlocked: ripe && !fired,
          expected,
          matchesRule: fired && raiders != null && expected != null
            ? (raiders === expected) : null,
        }));
      } catch (e) { note('tickPost', e); }
      return ret;
    };
  } catch (e) { note('wrapRaidTick', e); }

  return track;
}

function finalizeRaidtrigger(Game, track) {
  const errors = (track.instrErrors || []).slice();
  const ticks = (track.raidTicks || []).slice();
  const bands = ['<3k', '3-12k', '12-24k', '>24k'];
  const curve = {};
  for (const b of bands) {
    const rows = ticks.filter(t => t.band === b);
    const fired = rows.filter(t => t.fired);
    const ripe = rows.filter(t => t.ripe);
    curve[b] = {
      nights: rows.length,
      raidNights: fired.length,
      ratePer100: rows.length ? +((fired.length / rows.length) * 100).toFixed(1) : null,
      ripeNights: ripe.length,
      rngBlocked: rows.filter(t => t.rngBlocked).length,
      // precondition-blocked nights (not ripe): why the gate said no
      blockedThin: rows.filter(t => !t.ripe && (t.pantryBefore || 0) < SMELL_LINE).length,
      blockedGap: rows.filter(t => !t.ripe && (t.pantryBefore || 0) >= SMELL_LINE &&
        (t.sinceLast || 0) < 7).length,
      blockedMonsters: rows.filter(t => !t.ripe && (t.pantryBefore || 0) >= SMELL_LINE &&
        (t.monsters || 0) < 3).length,
      blockedTable: rows.filter(t => !t.ripe && t.table).length,
    };
  }
  // raid-size distribution on fired nights vs the static rule
  const sized = ticks.filter(t => t.fired && t.raiders != null);
  const sizeDist = {};
  for (const t of sized) {
    const k = t.band + ':' + t.raiders;
    sizeDist[k] = (sizeDist[k] || 0) + 1;
  }
  const matched = sized.filter(t => t.matchesRule === true).length;
  const mismatched = sized.filter(t => t.matchesRule === false).length;
  // pantry path: which store the raiders hit
  const draws = track.raidPantryDraws || [];
  const asked = draws.reduce((t, d) => t + (d.asked || 0), 0);
  const taken = draws.reduce((t, d) => t + (d.taken || 0), 0);
  const byItem = {};
  for (const d of draws) {
    for (const it of (d.items || [])) {
      const kcal = (it.effectiveKcal || 0) * 0 + (it.units || 0) * (it.kcalEach || 0);
      const k = it.name + '|' + (it.foodState || '?');
      byItem[k] = (byItem[k] || 0) + kcal;
    }
  }
  const topItems = Object.entries(byItem)
    .map(([k, v]) => ({ item: k, kcal: Math.round(v) }))
    .sort((a, b) => b.kcal - a.kcal).slice(0, 8);
  const days = ticks.length ? ticks[ticks.length - 1].day - ticks[0].day + 1 : 0;
  return {
    ticks: ticks.length,
    days,
    curve,
    firedTotal: ticks.filter(t => t.fired).length,
    sizeDist,
    sizedNights: sized.length,
    matchedRule: matched,
    mismatchedRule: mismatched,
    raidFireBeats: track.raidFireBeats,
    pantryPath: {
      draws: draws.length,
      askedKcal: Math.round(asked),
      takenKcal: Math.round(taken),
      topItems,
    },
    rawTicks: ticks,
    rawDraws: draws,
    instrErrors: errors,
  };
}

module.exports = { attachRaidtrigger, finalizeRaidtrigger, bandOf, expectedRaiders, SMELL_LINE };
