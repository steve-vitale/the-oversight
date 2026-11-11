// travelfirst-instrument-20261110.js — travel/roads first-numbers recorder
// (arm sim-travelfirst-a, run fleshout-20261111T0315Z, adoption of
// fleshout-20261111T0315Z). Scripts only, zero src/js.
//
// Records, per seed:
//   (1) SCHOLAR TRAVEL (travelTo wrap — the party.js wrapper stays
//       underneath: this wrap installs after loadGame and wraps the
//       party-wrapped travelTo): every call — from/to, force, combatExit,
//       return class (moved / refused-null / blocked:{blockType,
//       intermediate?} / combat-refused / over), position change, day,
//       part, caller (outermost named policy/engine frame — see
//       classifyCaller) + via (innermost named frame, e.g. routeAround
//       inside a thirstWalkHome leg).
//   (2) ENGINE walkHome (walkHome wrap): every call — from, reached,
//       steps, blocked type, interrupted, path length. Expected 0 under
//       competent (the policy has its own walkHome; the engine one is the
//       app.js compass button) — proven live in the proof fixture.
//   (3) BEYOND-EDGE (tryNodeExit wrap): every crossing attempt —
//       direction, result, position change. Expected 0 under competent
//       (only app.js calls it; node has no UI) — proven live in fixture.
//   (4) ROAD LEGS (nomad.enterLeg / departLeg / start wraps): every
//       road-leg entry/exit + road start. Expected 0 under competent
//       (competent never calls Game.nomad.start()) — proven live in
//       fixture (refused calls still fire the wrap).
//   (5) DEATHS BY POSITION (tele wrap): tele('death') — kind/who/cause/
//       wave/player + scholar pos + haven + Chebyshev distance + dayPart
//       at the fire; villager deaths carry npcNode + away-ledger purpose
//       at death. Also tele('combat_start'/'combat_end') day counts for
//       the away-evening combat bucket. (The harness wraps tele inside
//       runDays AFTER this instrument installs, so the chain is harness
//       -> instrument -> engine; the record fires inside.)
//   (6) VILLAGER TRAVEL (npcNodeTravel wrap): away-ledger diff per
//       day-part — departures/returns by purpose, days-away in parts,
//       hurt-returns (returned before duration elapsed). Plus a
//       per-part scholar position record (parts spent away).
//   (7) DAILY SNAPSHOT: scholar pos + Chebyshev distance from haven +
//       atHaven, dayPart, scholar.dayTicks, travelOffered (haven in
//       travelTargets — the nighttravel within-reach test), havenKnown,
//       insideTent, inCombat, away-ledger entries (vid/purpose/sinceDay/
//       sincePart/duration), villager nodes (raw nodePos, read-only —
//       never npcNode(), which would create entries) + objectives (raw
//       village.objectives, read-only — never objOf(), which would
//       create entries), state.road (active/legIndex/legs/partyIds/
//       daysOnRoad), roster size, pantry kcal.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game method.
// The proof (scripts/test-travelfirst-a.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence.
//
// CALLER INVENTORY NOTE (pre-pilot, code-grounded): the prereg lists
// eight travelTo callers. The code shows two more real ones under
// competent in node: feastFightRoad (competent.js:499, the feasted
// patrol — feastOn() defaults ON) and tryNodeExit (game.js:12569,
// engine-side, only reachable via the engine in node). Both are named
// callers in classifyCaller; the residual 'other' bucket must still be
// 0 in the pilot. See the evidence metric review.
//
// Usage: const TI = require('./travelfirst-instrument-20261110');
//   const ti = TI.install(Game); ti.snapshot(); ... ti.uninstall();
'use strict';

var NAMED_CALLERS = [
  'tbBarrierExit',
  'forageTripSeedFirst',
  'feastFightRoad',
  'thirstWalkHome',
  'goHomeStanding',
  'stoneRun',
  'walkHome', // disambiguated by file below (game.js vs competent.js)
  'walkTo',
  'tryNodeExit',
];

// Parse one V8 stack line into {fn, file} or null.
function parseFrame(line) {
  try {
    const m = String(line || '').match(/at (\S+?)(?: \(([^)]+)\))?$/);
    if (!m) return null;
    let fn = m[1] || '';
    let file = m[2] || '';
    // "at Game.travelTo (/path/party.js:1155:3)" -> fn "Game.travelTo"
    // "at walkTo (/path/competent.js:1199:10)" -> fn "walkTo"
    // "at Object.walkHome (/path/game.js:11801:5)" -> fn "Object.walkHome"
    if (fn.indexOf('.') !== -1) fn = fn.split('.').pop();
    return { fn: fn, file: file };
  } catch (e) { return null; }
}

// Caller = the OUTERMOST named policy/engine frame in the stack (the
// trip-level function that decided the travel), so a
// forageTripSeedFirst -> walkHome -> walkTo chain attributes to
// forageTripSeedFirst, not walkTo. walkHome is disambiguated by file:
// game.js = engine-walkHome, competent.js = policy-walkHome.
// Returns {caller, via} where via is the INNERMOST named frame (e.g.
// routeAround inside a thirstWalkHome leg is visible as via, while the
// caller stays thirstWalkHome). Unmatched -> caller 'other'.
function classifyCaller(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    const frames = [];
    for (const ln of lines) {
      if (ln.indexOf('travelfirst-instrument') !== -1) continue;
      const f = parseFrame(ln);
      if (!f) continue;
      if (f.fn === 'Game' || f.fn === 'travelTo') continue;
      frames.push(f);
    }
    function namedOf(f) {
      if (NAMED_CALLERS.indexOf(f.fn) === -1) return null;
      if (f.fn === 'walkHome') {
        if (/game\.js/.test(f.file)) return 'engine-walkHome';
        if (/competent\.js/.test(f.file)) return 'policy-walkHome';
        return null;
      }
      return f.fn;
    }
    let caller = 'other';
    let via = null;
    // Outermost first: stack lines are innermost-first, so scan reversed.
    for (let i = frames.length - 1; i >= 0; i--) {
      const n = namedOf(frames[i]);
      if (n) { caller = n; break; }
    }
    // Innermost named frame (the direct caller of travelTo).
    for (let i = 0; i < frames.length; i++) {
      const n = namedOf(frames[i]);
      if (n) { via = n; break; }
      // routeAround is a real direct caller even though it is never the
      // trip-level caller; record it as via when present.
      if (frames[i].fn === 'routeAround') { via = 'routeAround'; break; }
      if (frames[i].fn === 'clearRubbleForStone') { via = 'clearRubbleForStone'; break; }
    }
    return { caller: caller, via: via };
  } catch (e) { return { caller: 'other', via: null }; }
}

// Outcome classification, pure (unit-tested in the proof):
//   ret null + over -> 'over'
//   ret null + was in combat without combatExit -> 'combat-refused'
//   ret null otherwise -> 'refused-null'
//   ret {kind:'blockage'} -> 'blocked'
//   ret undefined + position reached (x,y) -> 'moved'
//   ret undefined + over now -> 'over' (pit-trap death en route)
//   anything else -> 'other'
function classifyOutcome(ret, x, y, px, py, preInCombat, combatExit, overBefore, overNow) {
  if (ret === null || ret === undefined) {
    if (ret === null) {
      if (overBefore || overNow) return 'over';
      if (preInCombat && !combatExit) return 'combat-refused';
      return 'refused-null';
    }
    // ret undefined: success (or pit death, which also returns undefined).
    if (px === x && py === y) return 'moved';
    if (overNow) return 'over';
    return 'other';
  }
  if (ret && ret.kind === 'blockage') return 'blocked';
  if (px === x && py === y) return 'moved';
  if (overNow) return 'over';
  return 'other';
}

// Away-evening partition (nighttravel-bank-b prereg, applied in order;
// every away evening lands in exactly one bucket). Inputs are the
// snapshot-day facts; blockedToday = >=1 blocked travelTo that day.
function classifyEvening(ev) {
  if (ev.inCombat || ev.inTent) return ev.inCombat ? 'combat' : 'tent';
  if (!ev.havenKnown) return 'haven-unknown';
  if (!ev.travelOffered) return 'too-far';
  if (ev.blockedToday) return 'blocked-path';
  if (ev.travelOffered) return 'within-reach';
  return 'unclassified';
}

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

function havenOf(Game) {
  try { const v = (Game.state || {}).village || {}; return { x: (v.px === undefined ? 4 : v.px), y: (v.py === undefined ? 4 : v.py) }; } catch (e) { return { x: 4, y: 4 }; }
}
function scholarPos(Game) {
  try { return { x: Game.map.px, y: Game.map.py }; } catch (e) { return { x: null, y: null }; }
}
function cheb(a, b) { return Math.max(Math.abs((a.x || 0) - (b.x || 0)), Math.abs((a.y || 0) - (b.y || 0))); }
function partNow(Game) { try { return Game.dayPart; } catch (e) { return null; } }
function inCombatNow(Game) {
  try { return !!(Game.tbfight || (Game.inCombat && Game.inCombat())); } catch (e) { return false; }
}
function displayNameOf(Game, vid) {
  try { if (typeof Game.displayName === 'function') return Game.displayName(vid); } catch (e) {}
  return null;
}
function awayCopy(Game) {
  const out = {};
  try {
    const aw = ((Game.state || {}).village || {}).away || {};
    for (const vid of Object.keys(aw)) {
      const a = aw[vid] || {};
      out[vid] = { purpose: a.purpose || null, sinceDay: (a.sinceDay === undefined ? null : a.sinceDay), sincePart: (a.sincePart === undefined ? null : a.sincePart), duration: (a.duration === undefined ? null : a.duration), nx: (a.nx === undefined ? null : a.nx), ny: (a.ny === undefined ? null : a.ny) };
    }
  } catch (e) {}
  return out;
}

function install(Game) {
  const t = {
    travelTo: [],    // {day, part, from{x,y}, to{x,y}, force, combatExit, outcome, blockType, intermediate, caller, via, movedTo{x,y}, threw}
    walkHomes: [],   // {day, from{x,y}, reached, steps, blockedType, interrupted, pathLen}
    nodeExits: [],   // {day, dir, result, blockedType, from{x,y}, to{x,y}}
    roadLegs: [],    // {day, verb, arg, ret}
    deaths: [],      // {day, part, kind, who, cause, wave, playerArg, whoIsBearer, scholarPos, haven, cheb, inCombat, villagerNode, awayPurpose}
    combats: [],     // {day, type} — combat_start/combat_end counts
    villagerTrips: { departures: [], returns: [] }, // {day, part, vid, name, purpose, ...}
    partPositions: [], // {day, part, scholarPos{x,y}, atHaven, cheb}
    daily: [],       // snapshots
    instrumentErrors: [],
    wrapLive: {},
  };
  const wrapped = {};
  const nomadWrapped = {};

  function err(site, e) {
    try { t.instrumentErrors.push(site + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }

  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        let pre = null;
        try { pre = record.pre ? record.pre(Array.prototype.slice.call(arguments)) : null; } catch (e) { err(name + '-pre', e); }
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try {
          t.wrapLive[name] = true;
          if (record.post) record.post(Array.prototype.slice.call(arguments), r, threw, pre);
        } catch (e) { err(name + '-record', e); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { err(name + '-wrap', e); }
  }

  // (1) travelTo — the scholar node-move.
  wrapMethod('travelTo', {
    pre: function (args) {
      const from = scholarPos(Game);
      return {
        day: dayOf(Game), part: partNow(Game),
        from: from, inCombat: inCombatNow(Game), over: !!Game.over,
        force: !!args[2], combatExit: !!args[3],
        stack: stackText(3),
      };
    },
    post: function (args, r, threw, pre) {
      const to = { x: args[0], y: args[1] };
      const now = scholarPos(Game);
      const overNow = !!Game.over;
      const outcome = classifyOutcome(r, to.x, to.y, now.x, now.y,
        !!(pre && pre.inCombat), !!(pre && pre.combatExit),
        !!(pre && pre.over), overNow);
      let blockType = null, intermediate = null;
      if (outcome === 'blocked' && r) {
        blockType = r.blockType || null;
        intermediate = (r.x !== to.x || r.y !== to.y);
      }
      const cc = classifyCaller((pre && pre.stack) || '');
      t.travelTo.push({
        day: (pre && pre.day) || dayOf(Game),
        part: (pre && pre.part !== undefined ? pre.part : null),
        from: (pre && pre.from) || null, to: to,
        force: !!(pre && pre.force), combatExit: !!(pre && pre.combatExit),
        outcome: outcome, blockType: blockType, intermediate: intermediate,
        caller: cc.caller, via: cc.via,
        movedTo: now, threw: !!threw,
      });
    },
  });

  // (2) Engine walkHome — the compass action.
  wrapMethod('walkHome', {
    pre: function (args) {
      return { day: dayOf(Game), part: partNow(Game), from: scholarPos(Game), stack: stackText(3) };
    },
    post: function (args, r, threw, pre) {
      t.walkHomes.push({
        day: (pre && pre.day) || dayOf(Game),
        part: (pre && pre.part !== undefined ? pre.part : null),
        from: (pre && pre.from) || null,
        reached: !!(r && r.reached),
        steps: (r && typeof r.steps === 'number' ? r.steps : null),
        blockedType: (r && r.blocked && r.blocked.blockType) || null,
        interrupted: (r && r.interrupted) || null,
        pathLen: (r && r.path && r.path.length) || null,
        threw: !!threw,
      });
    },
  });

  // (3) tryNodeExit — beyond-edge crossing attempts.
  wrapMethod('tryNodeExit', {
    pre: function (args) {
      return { day: dayOf(Game), part: partNow(Game), from: scholarPos(Game) };
    },
    post: function (args, r, threw, pre) {
      const now = scholarPos(Game);
      let result = 'other';
      if (r === null || r === undefined) result = 'null';
      else if (r.blocked) result = 'blocked';
      else if (r.moved) result = 'moved';
      else if (r.moved === false) result = 'refused';
      t.nodeExits.push({
        day: (pre && pre.day) || dayOf(Game),
        part: (pre && pre.part !== undefined ? pre.part : null),
        dx: args[0], dy: args[1],
        result: result,
        blockedType: (r && r.blocked && r.blocked.blockType) || null,
        from: (pre && pre.from) || null, to: now,
        threw: !!threw,
      });
    },
  });

  // (4) Road legs — nomad.enterLeg / departLeg / start.
  try {
    const nomad = Game.nomad;
    if (!nomad || typeof nomad !== 'object') {
      t.instrumentErrors.push('nomad-missing: Game.nomad is not an object');
    } else {
      ['enterLeg', 'departLeg', 'start'].forEach(function (verb) {
        try {
          const orig = nomad[verb];
          if (typeof orig !== 'function') { t.instrumentErrors.push('nomad-' + verb + '-missing: not a function'); return; }
          nomadWrapped[verb] = orig;
          nomad[verb] = function () {
            let r, threw = null;
            const d = dayOf(Game);
            try { r = orig.apply(nomad, arguments); } catch (e) { threw = e; }
            try {
              t.wrapLive['nomad.' + verb] = true;
              t.roadLegs.push({ day: d, verb: verb, arg: (arguments.length ? arguments[0] : null), ret: (typeof r === 'boolean' || r === null ? r : (r ? 'truthy' : 'falsy')), threw: !!threw });
            } catch (e) { err('nomad-' + verb + '-record', e); }
            if (threw) throw threw;
            return r;
          };
        } catch (e) { err('nomad-' + verb + '-wrap', e); }
      });
    }
  } catch (e) { err('nomad-wrap', e); }

  // (5) tele — deaths by position + combat day counts.
  wrapMethod('tele', {
    pre: function (args) { return { type: args[0] }; },
    post: function (args, r, threw, pre) {
      try {
        const ty = args[0];
        if (ty === 'combat_start' || ty === 'combat_end') {
          t.combats.push({ day: dayOf(Game), type: ty });
          return;
        }
        if (ty !== 'death') return;
        const d = args[1] || {};
        const sp = scholarPos(Game);
        const hv = havenOf(Game);
        const who = d.who || null;
        let villagerNode = null, awayPurpose = null;
        try {
          const v = (Game.state || {}).village || {};
          const np = (v.nodePos || {})[who];
          if (np) villagerNode = { nx: np.nx, ny: np.ny };
          const aw = (v.away || {})[who];
          if (aw) awayPurpose = aw.purpose || null;
        } catch (e) {}
        t.deaths.push({
          day: dayOf(Game), part: partNow(Game),
          kind: d.kind || null, who: who, cause: d.cause || null,
          wave: (typeof d.wave === 'number' ? d.wave : null),
          playerArg: !!d.player, whoIsBearer: (who !== null && who === Game.villagerId),
          scholarPos: sp, haven: hv, cheb: cheb(sp, hv),
          inCombat: inCombatNow(Game),
          villagerNode: villagerNode, awayPurpose: awayPurpose,
          threw: !!threw,
        });
      } catch (e) { err('tele-record', e); }
    },
  });

  // (6) npcNodeTravel — away-ledger diff per day-part + per-part scholar pos.
  wrapMethod('npcNodeTravel', {
    pre: function (args) {
      return { day: dayOf(Game), part: partNow(Game), away: awayCopy(Game), scholarPos: scholarPos(Game) };
    },
    post: function (args, r, threw, pre) {
      try {
        const before = (pre && pre.away) || {};
        const after = awayCopy(Game);
        const day = dayOf(Game);
        const part = partNow(Game);
        const sday = (pre && pre.day !== undefined ? pre.day : day);
        for (const vid of Object.keys(after)) {
          if (!before[vid]) {
            t.villagerTrips.departures.push({
              day: sday, part: (pre && pre.part !== undefined ? pre.part : part),
              vid: vid, name: displayNameOf(Game, vid),
              purpose: after[vid].purpose || null,
              toNx: after[vid].nx, toNy: after[vid].ny,
            });
          }
        }
        for (const vid of Object.keys(before)) {
          if (!after[vid]) {
            const b = before[vid];
            const partsAway = (day - (b.sinceDay || day)) * 4 + ((part === null ? 0 : part) - (b.sincePart || 0));
            const dur = (b.duration === null || b.duration === undefined) ? 4 : b.duration;
            t.villagerTrips.returns.push({
              day: day, part: part,
              vid: vid, name: displayNameOf(Game, vid),
              purpose: b.purpose || null,
              partsAway: partsAway, duration: dur,
              hurtReturn: partsAway < dur,
            });
          }
        }
        // Per-part scholar position (parts spent away, Metric 8).
        const sp = scholarPos(Game);
        const hv = havenOf(Game);
        t.partPositions.push({
          day: day, part: part, scholarPos: sp,
          atHaven: (sp.x === hv.x && sp.y === hv.y), cheb: cheb(sp, hv),
        });
      } catch (e) { err('npcNodeTravel-record', e); }
    },
  });

  // (7) Daily snapshot.
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try {
      const hv = havenOf(Game);
      const sp = scholarPos(Game);
      snap.part = partNow(Game);
      snap.scholarPos = sp;
      snap.haven = hv;
      snap.cheb = cheb(sp, hv);
      snap.atHaven = (sp.x === hv.x && sp.y === hv.y);
      try { snap.insideTent = !!(((Game.state || {}).scholar || {}).insideTent); } catch (e) { snap.insideTent = null; }
      snap.inCombat = inCombatNow(Game);
      try { snap.dayTicks = ((Game.state || {}).scholar || {}).dayTicks || 0; } catch (e) { snap.dayTicks = null; }
      try { snap.scholarHealth = ((Game.state || {}).scholar || {}).health || null; } catch (e) { snap.scholarHealth = null; }
    } catch (e) { err('snap-pos', e); }
    try {
      // travelOffered (nighttravel within-reach test): haven offered in
      // travelTargets. travelTargets() is pure (no generation, no RNG —
      // game.js:12135) so calling it here cannot move the game.
      const hv = havenOf(Game);
      let offered = false;
      try {
        const targets = Game.travelTargets ? Game.travelTargets() : [];
        offered = targets.some(function (tt) { return tt.x === hv.x && tt.y === hv.y; });
      } catch (e) { offered = false; err('snap-offered', e); }
      snap.travelOffered = offered;
      try {
        const seen = ((Game.state || {}).scholar || {}).seenTiles || {};
        snap.havenKnown = !!seen[hv.x + ',' + hv.y];
      } catch (e) { snap.havenKnown = null; }
    } catch (e) { snap.travelOffered = null; err('snap-offered', e); }
    try {
      snap.away = awayCopy(Game);
      snap.awayCount = Object.keys(snap.away).length;
    } catch (e) { snap.away = null; err('snap-away', e); }
    try {
      // Villager nodes + objectives, READ-ONLY: raw stores, never
      // npcNode() / objOf() (both create entries for missing vids).
      const v = (Game.state || {}).village || {};
      const roster = v.roster || [];
      snap.roster = roster.length;
      snap.nodes = {};
      const np = v.nodePos || {};
      for (const vid of roster) {
        const n = np[vid];
        snap.nodes[vid] = n ? [n.nx, n.ny] : null;
      }
      snap.objectives = {};
      const os = v.objectives || {};
      for (const vid of roster) {
        const o = os[vid];
        snap.objectives[vid] = o ? [o.kind || null, o.state || null, o.purpose || null] : null;
      }
    } catch (e) { snap.nodes = null; err('snap-nodes', e); }
    try {
      const road = (Game.state || {}).road || null;
      if (!road) snap.road = null;
      else {
        snap.road = {
          active: !!road.active,
          legIndex: (road.legIndex === undefined ? null : road.legIndex),
          legs: (road.legs || []).map(function (l) { return { regionId: l.regionId || null, status: l.status || null }; }),
          partyIds: (road.partyIds || []).length,
          daysOnRoad: (road.daysOnRoad === undefined ? null : road.daysOnRoad),
          endReason: road.endReason || null,
        };
      }
    } catch (e) { snap.road = null; err('snap-road', e); }
    try {
      const v = (Game.state || {}).village || {};
      snap.pantryKcal = (v.pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
    } catch (e) { snap.pantryKcal = null; err('snap-pantry', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
    });
    try {
      const nomad = Game.nomad;
      if (nomad) {
        Object.keys(nomadWrapped).forEach(function (verb) {
          try { nomad[verb] = nomadWrapped[verb]; } catch (e) { err('uninstall-nomad-' + verb, e); }
        });
      }
    } catch (e) { err('uninstall-nomad', e); }
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = {
  install: install,
  classifyCaller: classifyCaller,
  classifyOutcome: classifyOutcome,
  classifyEvening: classifyEvening,
};
