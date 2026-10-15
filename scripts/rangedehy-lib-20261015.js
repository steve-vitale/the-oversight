// rangedehy-lib-20261015.js — RANGING-DEHYDRATION diagnostic instrument
// (ARM 3, loop B 2026-10-15, sim-findings #290: "Needs a ranging-water
// instrument before any lever touches it").
//
// INSTRUMENT ONLY — zero src/js changes. Harness-side call-through wraps
// (the thirst-lib/trustdelta-lib pattern). Attribute target: the SCHOLAR's
// own overnight metabolic death, cause 'dehydration', via
// engine/calories.js resolveDay -> playerDeath(honestCause) ->
// registerDeath({kind:'villager', cause:'dehydration', player:true}).
// Canon (stated, not invented — no water/thirst canon doc exists; all
// mechanics read from src/js/game.js + engine/calories.js as-is):
//   - the scholar NEVER draws from the cistern directly ("you drink your
//     own bottles" — villageDrinks skips the player). Scholar water comes
//     ONLY through Game.fillWater() (haven well draws 1L clean from the
//     cistern per bottle; wild sources free but risky), Game.addWater
//     (storm/ability events, bypasses fill), Game.boilWater() (risky->clean
//     at a fire), and leaves through Game.drinkWater() (+50 hydration,
//     1 tick) or Game.pourWater().
//   - overnight hydration burn: resolveDay subtracts hydrationBurn
//     (night 30 + day 12 base; clear 1.5x, cold 0.75x; exertion ~1/32
//     ticks); hydration <= 0 -> -12 health, -30 energy, telegraph
//     'DEHYDRATED: find and treat water today.'; 0 health -> killedBy
//     'dehydration' (honest-cause change, player-survivability 2026-10-14).
//   - taxonomy (sim-thirstinst-b): 'thirst' = villager cistern death via
//     villageDrinks; 'dehydration' = the SCHOLAR's own overnight death.
//     This instrument attributes ONLY the latter (player:true).
//   - at-haven for a ranging scholar: playerAtHaven() = Manhattan distance
//     from (map.px,map.py) to the haven tile (v.px,v.py, default 4,4) <= 1.
//
// Covariate slots per dehydration death (all read at the registerDeath
// beat, BEFORE playerDeath finishes succession — s is still the dead
// scholar, s.water still holds the pack):
//   deathBeat: day, dayPart, location, atHaven, mapDist, tileDist,
//     hydration(=0), kcal, health(=0), energy, scholarId, scholarName
//   packWater: liters, clean, risky, sources[] (quality+source per bottle)
//   cistern: {clean, dirty} at death
//   pantryKcal, freshDays, wood, rosterN, waterDuty {n, ids}
//   trajectory3d: last 3 dawn-state snapshots (hydration, kcal, health,
//     atHaven, mapDist, cistern, packLiters, weather, day)
//   verbs3d: fillWater/drinkWater/boilWater/pourWater calls with day >=
//     deathDay-3 (counts + refusal phrases captured from say-beats)
//   departure: {departDay, cisternAtDepart{clean,dirty}, daysAway} or null
//     (never away) — from the snapshot sequence; ranging = !atHaven at beat
//   beats: last 10 say lines at the beat + aftermath (say lines from the
//     death beat through the next endDay) for the sense-test read.
//
// "Fully attributed" = every slot present (departure.slotComputed true
// even when null; trajectory needs >=3 snapshots; a run shorter than 3
// days cannot be fully attributed and says so).
//
// Usage:
//   const { installRangeDehy, finalizeRangeDehy } = require('./rangedehy-lib-20261015');
//   const track = installRangeDehy(Game);   // AFTER setupGame, before runDays
//   ... runDays(Game, policy, opts) ...
//   const rep = finalizeRangeDehy(Game, track);
//
// Byte-identicality (instrument honesty) is proven by
// scripts/test-rangedehy-20261015.js PART C (armed-vs-pristine det-gate).
'use strict';

const REFUSALS = {
  fillWater: ['The cistern is dry', 'No water here', 'Your pack is full'],
  drinkWater: ['No water. Fill at a creek or well.', "You're not thirsty"],
  boilWater: ['Need a fire to boil water', 'Not mid-fight'],
  pourWater: ['No water to pour out'],
};

function gday(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}

const DAY_PARTS = ['dawn', 'midday', 'dusk', 'night'];
function dayPartName(Game) {
  try {
    const i = Game.dayPart;
    // advancePart increments to 4 then calls endDay: the overnight
    // resolution IS the night for metabolic deaths (resolveDay).
    if (i === 4) return 'night';
    return DAY_PARTS[i] || null;
  } catch (e) { return null; }
}

function havenXY(Game) {
  try {
    const v = Game.state.village || {};
    return { hx: v.px ?? 4, hy: v.py ?? 4 };
  } catch (e) { return { hx: 4, hy: 4 }; }
}

function mapPos(Game) {
  try {
    const m = Game.map || {};
    return { px: m.px, py: m.py };
  } catch (e) { return { px: null, py: null }; }
}

function atHaven(Game) {
  try { return !!Game.playerAtHaven(); }
  catch (e) {
    try {
      const { hx, hy } = havenXY(Game);
      const { px, py } = mapPos(Game);
      if (px === null || px === undefined) return true;
      return Math.abs(px - hx) + Math.abs(py - hy) <= 1;
    } catch (e2) { return true; }
  }
}

function mapDist(Game) {
  try {
    const { hx, hy } = havenXY(Game);
    const { px, py } = mapPos(Game);
    if (px === null || px === undefined) return null;
    return Math.abs(px - hx) + Math.abs(py - hy);
  } catch (e) { return null; }
}

function cistern(Game) {
  try {
    const vw = (Game.state.village || {}).water || {};
    return { clean: Math.floor(vw.clean || 0), dirty: Math.floor(vw.dirty || 0) };
  } catch (e) { return { clean: null, dirty: null }; }
}

function packWater(Game) {
  try {
    const w = (Game.state.scholar || {}).water || [];
    return {
      liters: w.length,
      clean: w.filter(b => b.quality === 'clean').length,
      risky: w.filter(b => b.quality === 'risky').length,
      sources: w.map(b => ({ q: b.quality || '?', src: (b.source || '?').slice(0, 40) })),
    };
  } catch (e) { return { liters: null, clean: null, risky: null, sources: null }; }
}

function waterDuty(Game) {
  try {
    const asg = (Game.state.village || {}).assignments || {};
    const ids = Object.keys(asg).filter(id => (asg[id] || {}).task === 'water');
    return { n: ids.length, ids };
  } catch (e) { return { n: null, ids: null }; }
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return null; }
}

function snapshot(Game, track, deathToday) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const pw = packWater(Game), cs = cistern(Game), wd = waterDuty(Game);
  const day = gday(Game);
  const verbN = { fill: 0, drink: 0, boil: 0, pour: 0 };
  for (const e of track.verbs) {
    if (e.day === day) {
      if (e.verb === 'fillWater') verbN.fill++;
      else if (e.verb === 'drinkWater') verbN.drink++;
      else if (e.verb === 'boilWater') verbN.boil++;
      else if (e.verb === 'pourWater') verbN.pour++;
    }
  }
  let freshDays = null, wood = null, rosterN = null;
  try { freshDays = typeof Game.pantryDaysEstimate === 'function' ? Game.pantryDaysEstimate() : null; } catch (e) {}
  try { wood = v.wood || 0; } catch (e) {}
  try { rosterN = (v.roster || []).length; } catch (e) {}
  return {
    day, hydration: s.hydration, kcal: s.kcal, health: s.health, energy: s.energy,
    atHaven: atHaven(Game), mapDist: mapDist(Game),
    location: (() => { try { return Game.location; } catch (e) { return null; } })(),
    dayPart: dayPartName(Game),
    cistern: cs, packLiters: pw.liters, packClean: pw.clean, packRisky: pw.risky,
    waterDutyN: wd.n, pantryKcal: pantryKcal(Game), freshDays, wood, rosterN,
    weather: (() => { try { return Game.state.weather; } catch (e) { return null; } })(),
    verbN, deathToday: !!deathToday,
    scholarId: (() => { try { return Game.villagerId; } catch (e) { return null; } })(),
  };
}

// Departure analysis over the dawn-snapshot sequence + the death beat.
// departDay = the day the scholar was last at haven before ranging out.
// Definition: the last snapshot with atHaven=true such that every later
// snapshot (and/or the death beat) is away. Cistern at departure = that
// snapshot's cistern (dawn state of the day they left). daysAway =
// consecutive away snapshots after it + 1 if the beat is also away.
function departure(track, beatAway) {
  const snaps = track.daily;
  let departIdx = -1;
  for (let i = 0; i < snaps.length; i++) {
    if (!snaps[i].atHaven) continue;
    let laterAllAway = true;
    for (let j = i + 1; j < snaps.length; j++) {
      if (snaps[j].atHaven) { laterAllAway = false; break; }
    }
    if (laterAllAway && (i === snaps.length - 1 ? beatAway : true)) departIdx = i;
  }
  if (departIdx === -1) return { slotComputed: true, ranging: beatAway, departDay: null, cisternAtDepart: null, daysAway: null, neverAway: !beatAway && snaps.every(s => s.atHaven) };
  const ds = snaps[departIdx];
  let daysAway = beatAway ? 1 : 0;
  for (let j = departIdx + 1; j < snaps.length; j++) if (!snaps[j].atHaven) daysAway++;
  return {
    slotComputed: true, ranging: true,
    departDay: ds.day, cisternAtDepart: ds.cistern, daysAway,
    neverAway: false,
  };
}

function buildAttribution(Game, track, spec) {
  const s = Game.state.scholar || {};
  const day = gday(Game); // death day (endDay hasn't incremented yet)
  const beatAway = atHaven(Game) === false;
  const pw = packWater(Game), cs = cistern(Game), wd = waterDuty(Game);
  const traj = track.daily.slice(-3).map(x => ({
    day: x.day, hydration: x.hydration, kcal: x.kcal, health: x.health,
    atHaven: x.atHaven, mapDist: x.mapDist, cistern: x.cistern,
    packLiters: x.packLiters, weather: x.weather, verbN: x.verbN,
  }));
  const verbs3d = track.verbs.filter(e => e.day >= day - 3 && e.day <= day)
    .map(e => ({ day: e.day, verb: e.verb, refused: e.refused }));
  const verbsAll = { fill: 0, drink: 0, boil: 0, pour: 0 };
  for (const e of track.verbs) {
    if (e.verb === 'fillWater') verbsAll.fill++;
    else if (e.verb === 'drinkWater') verbsAll.drink++;
    else if (e.verb === 'boilWater') verbsAll.boil++;
    else if (e.verb === 'pourWater') verbsAll.pour++;
  }
  const refusedFills = track.verbs.filter(e => e.verb === 'fillWater' && e.refused)
    .map(e => ({ day: e.day, refused: e.refused }));
  const dep = departure(track, beatAway);
  let scholarName = null;
  try {
    const ch = (Game.data.villagers || []).find(x => x.id === Game.villagerId) || {};
    scholarName = ch.name || null;
  } catch (e) {}
  const rec = {
    day, deathDayPart: dayPartName(Game),
    deathDayPartIdx: (() => { try { return Game.dayPart; } catch (e) { return null; } })(),
    location: (() => { try { return Game.location; } catch (e) { return null; } })(),
    ranging: beatAway, atHaven: !beatAway, mapDist: mapDist(Game),
    scholarId: (() => { try { return Game.villagerId; } catch (e) { return null; } })(),
    scholarName,
    vitals: { hydration: s.hydration, kcal: s.kcal, health: s.health, energy: s.energy },
    packWater: pw, cistern: cs,
    pantryKcal: pantryKcal(Game),
    freshDays: (() => { try { return typeof Game.pantryDaysEstimate === 'function' ? Game.pantryDaysEstimate() : null; } catch (e) { return null; } })(),
    wood: (() => { try { return Game.state.village.wood || 0; } catch (e) { return null; } })(),
    rosterN: (() => { try { return (Game.state.village.roster || []).length; } catch (e) { return null; } })(),
    waterDuty: wd,
    trajectory3d: traj,
    verbs3d, verbsAll, refusedFills,
    departure: dep,
    beats: track.sayRing.slice(-10).map(x => x.text),
  };
  // full-attribution predicate: every slot present
  const slots = [
    rec.day !== null && rec.day !== undefined,
    rec.deathDayPart !== null, rec.location !== null,
    rec.mapDist !== null, rec.scholarId !== null,
    rec.vitals.hydration !== null && rec.vitals.hydration !== undefined,
    rec.packWater.liters !== null, rec.cistern.clean !== null,
    rec.pantryKcal !== null, rec.waterDuty.n !== null,
    rec.trajectory3d.length >= 3, rec.departure.slotComputed === true,
  ];
  rec.fullyAttributed = slots.every(Boolean);
  rec.missingSlots = slots.map((ok, i) => ok ? null : i).filter(x => x !== null);
  return rec;
}

function installRangeDehy(Game) {
  const track = {
    deaths: [],        // dehydration scholar attributions
    otherDeaths: [],   // every other death {day, cause, kind, player}
    verbs: [],         // {day, verb, refused}
    daily: [],         // dawn-state snapshots
    sayRing: [],       // last 40 say lines
    instrErrors: [],
    pendingAftermath: null, // {day} — capture say through next endDay
    aftermaths: [],    // {day, lines[]} — succession-aftermath beats
  };
  const note = (where, e) => { track.instrErrors.push(where + ': ' + (e && e.message)); };

  // ---- say ring + refusal capture + aftermath capture ----
  let verbCtx = null; // {entry} while a water verb is in flight
  try {
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        const text = String(msg || '');
        track.sayRing.push({ day: gday(this), text: text.slice(0, 300) });
        if (track.sayRing.length > 40) track.sayRing.shift();
        if (verbCtx) {
          const phrases = REFUSALS[verbCtx.entry.verb] || [];
          for (const p of phrases) {
            if (text.indexOf(p) >= 0) { verbCtx.entry.refused = p; break; }
          }
        }
        if (track.pendingAftermath) {
          track.pendingAftermath.lines.push(text.slice(0, 300));
        }
      } catch (e) {}
      return origSay(msg);
    };
  } catch (e) { note('wrapSay', e); }

  // ---- water verbs: called / not-called / refused ----
  for (const verb of ['fillWater', 'drinkWater', 'boilWater', 'pourWater']) {
    try {
      if (typeof Game[verb] !== 'function') { note('missingVerb', new Error(verb)); continue; }
      const orig = Game[verb].bind(Game);
      Game[verb] = function () {
        const entry = { day: gday(this), verb, refused: null };
        const prev = verbCtx;
        verbCtx = { entry };
        let ret;
        try { ret = orig.apply(this, arguments); }
        finally { verbCtx = prev; track.verbs.push(entry); }
        return ret;
      };
    } catch (e) { note('wrapVerb:' + verb, e); }
  }

  // ---- registerDeath: the attribution beat ----
  try {
    const origRD = Game.registerDeath.bind(Game);
    Game.registerDeath = function (spec) {
      let ret;
      try { ret = origRD.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        const sp = spec || {};
        const d = { day: gday(this), cause: sp.cause || null, kind: sp.kind || null, player: !!sp.player, name: sp.name || null };
        if (d.cause === 'dehydration' && d.player === true) {
          // THE SCHOLAR's own overnight death — build the full record at
          // the exact beat (s is still the dead scholar; s.water intact).
          const rec = buildAttribution(this, track, sp);
          track.deaths.push(rec);
          track.pendingAftermath = { day: rec.day, lines: [] };
        } else {
          track.otherDeaths.push(d);
        }
      } catch (e) { note('attrDeath', e); }
      return ret;
    };
  } catch (e) { note('wrapRegisterDeath', e); }

  // ---- endDay: dawn-state snapshot AFTER the original (day incremented) ----
  try {
    const origED = Game.endDay.bind(Game);
    Game.endDay = function () {
      const r = origED.apply(this, arguments);
      try {
        const diedToday = track.deaths.some(d => d.day === gday(this) - 1 || d.day === gday(this));
        track.daily.push(snapshot(this, track, diedToday));
        if (track.pendingAftermath) {
          track.aftermaths.push({ day: track.pendingAftermath.day, lines: track.pendingAftermath.lines.slice(0, 30) });
          track.pendingAftermath = null;
        }
      } catch (e) { note('snapDay', e); }
      return r;
    };
  } catch (e) { note('wrapEndDay', e); }

  track.finalize = function () { return finalizeRangeDehy(Game, track); };
  return track;
}

function finalizeRangeDehy(Game, track) {
  const full = track.deaths.filter(d => d.fullyAttributed).length;
  const verbsAll = { fill: 0, drink: 0, boil: 0, pour: 0 };
  for (const e of track.verbs) {
    if (e.verb === 'fillWater') verbsAll.fill++;
    else if (e.verb === 'drinkWater') verbsAll.drink++;
    else if (e.verb === 'boilWater') verbsAll.boil++;
    else if (e.verb === 'pourWater') verbsAll.pour++;
  }
  // ranging exposure: any dawn snapshot with the scholar away
  const rangedDays = track.daily.filter(s => s.atHaven === false).length;
  const maxMapDist = track.daily.reduce((m, s) => (s.mapDist !== null && s.mapDist > m) ? s.mapDist : m, 0);
  const awayNights = (() => { // longest trailing-away run in the sequence
    let best = 0, cur = 0;
    for (const s of track.daily) { cur = s.atHaven ? 0 : cur + 1; if (cur > best) best = cur; }
    return best;
  })();
  return {
    nDehydration: track.deaths.length,
    nFullyAttributed: full,
    coverage: track.deaths.length ? +(full / track.deaths.length).toFixed(4) : null,
    deaths: track.deaths,
    nOtherDeaths: track.otherDeaths.length,
    otherDeaths: track.otherDeaths.slice(0, 60),
    verbsAll, nVerbCalls: track.verbs.length,
    refusedFills: track.verbs.filter(e => e.verb === 'fillWater' && e.refused).length,
    rangedDays, maxMapDist, awayNights,
    nDaily: track.daily.length,
    daily: track.daily,
    aftermaths: track.aftermaths,
    instrErrors: track.instrErrors,
  };
}

module.exports = { installRangeDehy, finalizeRangeDehy };
