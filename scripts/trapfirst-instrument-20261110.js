// trapfirst-instrument-20261110.js — trapping first-numbers recorder
// (arm sim-trapfirst-a, run fleshout-20261111T0315Z). Scripts only, zero src/js.
//
// Records, per seed:
//   (1) PANTRY DEPOSITS (stockPantry wrap — the trap-share backstop): every
//       deposit by name ('Snared meat' / 'Pit meat (...)' / 'Game meat' /
//       'Fish catch' / 'Foraged food' / 'Garden harvest' + everything else),
//       with caller frame. 'Snared meat' comes only from the villager
//       TRAPS-return snare roll (villager-objectives.js ~1685); 'Pit meat
//       (...)' only from the pit roll (~1720); 'Game meat' only from the
//       hunt duty (game.js ~7013) — so each villager trap yield is counted
//       exactly, not inferred from say lines.
//   (2) CARCASSES (foodCarcass wrap — the scholar-kill backstop): every
//       carcass by origin ('trapped' / 'fished' / 'netted' / 'hunted' /
//       'charred') + species + kcal. Scholar checkTraps catches land here
//       with origin 'trapped' and name suffix ' (trapped)'.
//   (3) SETS (setTrap wrap): every scholar trap set by recipeId + caller,
//       with the tile's wildlife at set time (eligible species present,
//       known in village.animals or not, shyness level) + wire-improvised
//       flag. The placement/knowledge question, measured at the moment of
//       the decision, not reconstructed later.
//   (4) CRAFTS (craft wrap): trap crafts by recipeId + blind flag
//       (recipe level < 2). Other crafts recorded as other, classified.
//   (5) DAWN CHECKS (checkTraps wrap + __luckSink): checkTraps calls per
//       dawn; luckRoll('trap') gives the per-trap roll (p, hit) whenever a
//       trap has eligible game; luckRoll('snare'/'pit') gives the villager
//       TRAPS-return rolls. Staged (scarecrow) catches skip luckRoll —
//       they are counted via the foodCarcass 'trapped' record + the say
//       corpus, and the gap is named in the analyzer.
//   (6) VILLAGER RETURNS (tele wrap): tele('npc_trap' / 'npc_pit') with
//       vid/caught/kcal/species; tele('snare_overhear' / 'pit_overhear');
//       tele('eat') totals for the eat reconciliation.
//   (7) STAFFING (assignTask wrap, fishstaff-b pattern): every
//       assignTask('hunt') and assignTask('deadfall') with return, reason,
//       trust-before, haven, caller. 'deadfall' is the STICK-GATHERING
//       duty (game.js ~7068), NOT the deadfall trap — counted separately
//       and never conflated. offerDeal / appealToGoal 'hunt' calls too
//       (expected 0 — re-verified here).
//   (8) DEEDS (noteDeed + creditDeed wraps): 'trapping' deeds, who. Same
//       dedup suppression flag as fishfirst-a (noteDeed IS
//       creditDeed('player', ...)).
//   (9) SPAWNS (spawnWorldMonster wrap): every spawn with id/hp/maxHp/
//       wave/veteran + caller frame — the #1826 verification. The trap
//       spawn (gwTrapTick caller, game.js:23844) must carry def hp, not 20.
//   (10) CLEANING (cleanCarcass wrap): trapped-origin carcasses cleaned,
//       by name (identity Set from the foodCarcass return value + the
//       ' (trapped)' name suffix — either marks the item).
//   (11) MEAL DRAWS (pantryDraw wrap): draws by pantry item name
//       (trap-meat kcal drawn).
//   (12) EATING (eatOne + eatStashOne + eat wraps, cookfirst-a pattern):
//       eaten kcal attributed by item name (trap-meat names classified in
//       the analyzer); spoiled purge.
//   (13) DAILY SNAPSHOT: pantry roll by name, pack roll by name, traps
//       on the current map (recipeId/uses/setDay/tile), scholar trap tools
//       held, trap recipe levels + snare_wire skill level,
//       knowsSnare/knowsPit villager counts, village.animals keys, foodXp,
//       current-map trap-species wildlife total (read-only, never
//       backfilled), spoiled-present trap-meat kcal, throttle counters.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game method.
// The proof (scripts/test-trapfirst-a.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence. stockPantry + foodCarcass are
// the backstops: if the tele/deed wraps are dead, the kcal are still
// counted from the deposit/carcass records.
//
// Usage: const TI = require('./trapfirst-instrument-20261110');
//   const ti = TI.install(Game); ti.snapshot(); ... ti.uninstall();
'use strict';

var TRAP_RECIPES = ['snare', 'deadfall', 'box_trap', 'spring_snare',
  'minnow_trap', 'pit_trap', 'fish_weir', 'fish_basket', 'trotline',
  'noose_pole', 'squirrel_pole'];

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

// First engine frame in the stack (after the wrap + this helper).
function firstFrame(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    for (const ln of lines) {
      if (ln.indexOf('trapfirst-instrument') !== -1) continue;
      const m = ln.match(/at (\S+)/);
      if (m && m[1] !== 'Object.<anonymous>') return m[1];
    }
    return null;
  } catch (e) { return null; }
}

function nameRoll(inv) {
  const roll = {};
  try {
    for (const it of (inv || [])) {
      if (!it) continue;
      const nm = it.name || '(unnamed)';
      const k = (it.kcalEach || 0) * (it.units || 0);
      const e = roll[nm] || (roll[nm] = { count: 0, units: 0, kcal: 0 });
      e.count++; e.units += (it.units || 0); e.kcal += k;
    }
  } catch (e) {}
  return roll;
}

function itemSnap(it) {
  if (!it) return null;
  return {
    name: it.name || null, foodKind: it.foodKind || null,
    foodState: it.foodState || null, plantId: it.plantId || null,
    kcalEach: (typeof it.kcalEach === 'number' ? it.kcalEach : null),
    units: (typeof it.units === 'number' ? it.units : null),
    hiddenKcal: (typeof it.hiddenKcal === 'number' ? it.hiddenKcal : null),
    spoilDay: (typeof it.spoilDay === 'number' ? it.spoilDay : null),
    how: it.how || null, safe: it.safe === true,
  };
}

function install(Game) {
  const t = {
    deposits: [],   // {day, name, kcal, caller}
    carcasses: [],  // {day, species, speciesName, kcal, origin}
    trapSets: [],   // {day, recipeId, wire, tileType, eligible, eligibleKnown, shyLevel, trapsOnTileBefore, caller, retNull}
    trapCrafts: [], // {day, recipeId, blind, retNull}
    trapChecks: [], // {day} — checkTraps calls
    luckRolls: [],  // {day, stream, p, hit} — trap/snare/pit only
    teleTrap: [],   // {day, type, vid, caught, kcal, species}
    teleEat: [],    // {day, ateKcal}
    huntCalls: [],  // {day, part, verb, task, vid, occ, ret, reason, trustBefore, havenBefore, caller}
    deeds: [],      // {day, deed, who}
    spawns: [],     // {day, id, hp, maxHp, wave, veteran, caller}
    cleans: [],     // {day, name, trapped, postName}
    draws: [],      // {day, cook, want, taken, byName, byState, cookedKcal, caller}
    eats: [],       // {day, via, name, foodState, kcalEach, units, ateKcal, purgedKcal}
    daily: [],      // snapshots
    instrumentErrors: [],
    wrapLive: {},
    trapSpecies: null,
  };
  const wrapped = {};
  const trappedItems = new Set();
  let _pendingEat = null;

  try {
    const catches = new Set();
    for (const r of (Game.data && Game.data.recipes) || []) {
      if (r && r.catches) for (const s of r.catches) catches.add(s);
    }
    t.trapSpecies = Array.from(catches);
  } catch (e) { t.trapSpecies = []; }

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

  function trustOf(vid) {
    try { const tr = ((Game.state || {}).village || {}).trust || {}; return tr[vid] === undefined ? 10 : tr[vid]; } catch (e) { return null; }
  }
  function personFor(vid) {
    try { if (typeof Game.getPerson === 'function') { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
    try { return ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; }) || {}; } catch (e) { return {}; }
  }
  function vpOf(vid) {
    try { if (typeof Game.vpOf === 'function') return Game.vpOf(vid) || {}; } catch (e) {}
    return {};
  }
  function atHaven() {
    try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return null; }
  }
  function partNow() { try { return Game.dayPart; } catch (e) { return null; } }

  // (1) stockPantry — the trap-share backstop.
  wrapMethod('stockPantry', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3) }; },
    post: function (args, r, threw, pre) {
      t.deposits.push({
        day: (pre && pre.day) || dayOf(Game),
        name: args[1] || null,
        kcal: (typeof args[0] === 'number' ? args[0] : null),
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (2) foodCarcass — the scholar-kill backstop. Track trapped items by
  // identity for the cleanCarcass attribution (name suffix is the second key).
  wrapMethod('foodCarcass', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      const adef = args[0] || {};
      t.carcasses.push({
        day: (pre && pre.day) || dayOf(Game),
        species: adef.id || null,
        speciesName: adef.name || null,
        kcal: (typeof args[1] === 'number' ? args[1] : null),
        origin: args[3] || null,
        threw: !!threw,
      });
      try { if (args[3] === 'trapped' && r && typeof r === 'object') trappedItems.add(r); } catch (e) { err('carcass-track', e); }
    },
  });

  // (3) setTrap — placement + knowledge at the moment of the decision.
  wrapMethod('setTrap', {
    pre: function (args) {
      const recipeId = args[0];
      let tileInfo = null;
      try {
        const tile = (typeof Game.playerTile === 'function') ? Game.playerTile() : null;
        const recipe = ((Game.data || {}).recipes || []).find(function (r) { return r && r.id === recipeId; }) || {};
        const wl = (tile && tile.wildlife) || null;
        const known = ((Game.state || {}).village || {}).animals || {};
        const eligible = ((recipe.catches || []).filter(function (sid) { return wl && (wl[sid] || 0) > 0; }));
        const eligibleKnown = eligible.filter(function (sid) { return !!known[sid]; });
        const shyMap = (tile && tile.trapShy) || {};
        const shy = shyMap[recipeId] || null;
        const tools = ((Game.state || {}).scholar || {}).tools || [];
        const heldTool = tools.some(function (x) { return x && x.recipeId === recipeId; });
        let wire = false;
        try { wire = !heldTool && recipeId === 'snare' && !!(Game.hasItem && Game.hasItem('snare_wire')); } catch (e) {}
        tileInfo = {
          tileType: tile ? (tile.type || null) : null,
          eligible: eligible, eligibleKnown: eligibleKnown,
          shyLevel: shy ? (shy.level || 0) : 0,
          trapsOnTileBefore: tile && tile.traps ? tile.traps.length : 0,
          heldTool: heldTool, wire: wire,
        };
      } catch (e) { err('setTrap-pre', e); }
      return { day: dayOf(Game), stack: stackText(3), tileInfo: tileInfo };
    },
    post: function (args, r, threw, pre) {
      const ti = (pre && pre.tileInfo) || {};
      t.trapSets.push({
        day: (pre && pre.day) || dayOf(Game),
        recipeId: args[0] || null,
        wire: !!ti.wire,
        tileType: ti.tileType || null,
        eligible: ti.eligible || null,
        eligibleKnown: ti.eligibleKnown || null,
        shyLevel: (typeof ti.shyLevel === 'number' ? ti.shyLevel : null),
        trapsOnTileBefore: (typeof ti.trapsOnTileBefore === 'number' ? ti.trapsOnTileBefore : null),
        caller: firstFrame((pre && pre.stack) || ''),
        retNull: (r === null || r === undefined),
        threw: !!threw,
      });
    },
  });

  // (4) craft — trap crafts + blind flag.
  wrapMethod('craft', {
    pre: function (args) {
      let blind = null;
      try {
        const rk = (((Game.state || {}).codex || {}).recipes || {})[args[0]] || {};
        blind = ((rk.level || 0) < 2);
      } catch (e) {}
      return { day: dayOf(Game), blind: blind };
    },
    post: function (args, r, threw, pre) {
      t.trapCrafts.push({
        day: (pre && pre.day) || dayOf(Game),
        recipeId: args[0] || null,
        isTrap: TRAP_RECIPES.indexOf(args[0]) !== -1,
        blind: (pre && pre.blind !== undefined ? pre.blind : null),
        retNull: (r === null || r === undefined),
        threw: !!threw,
      });
    },
  });

  // (5a) checkTraps — dawn-check calls.
  wrapMethod('checkTraps', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.trapChecks.push({ day: (pre && pre.day) || dayOf(Game), threw: !!threw });
    },
  });

  // (5b) __luckSink — trap/snare/pit rolls. The panel collector is not
  // running in this driver; chain to any previous sink if one exists.
  let _prevLuckSink = null;
  try {
    _prevLuckSink = Game.__luckSink || null;
    const selfT = t;
    Game.__luckSink = function (stream, p, hit) {
      try {
        if (stream === 'trap' || stream === 'snare' || stream === 'pit') {
          selfT.luckRolls.push({ day: dayOf(Game), stream: stream, p: (typeof p === 'number' ? p : null), hit: !!hit });
        }
      } catch (e) { err('luckSink-record', e); }
      try { if (typeof _prevLuckSink === 'function') _prevLuckSink(stream, p, hit); } catch (e) {}
    };
    t.wrapLive.__luckSink = true;
  } catch (e) { err('luckSink-install', e); }

  // (6) tele — villager trap returns + overhears + eat reconciliation.
  wrapMethod('tele', {
    pre: function (args) { return { type: args[0] }; },
    post: function (args, r, threw, pre) {
      try {
        const ty = args[0];
        if (ty === 'npc_trap' || ty === 'npc_pit' || ty === 'snare_overhear' || ty === 'pit_overhear') {
          const d = args[1] || {};
          t.teleTrap.push({
            day: dayOf(Game), type: ty, vid: d.vid || null,
            caught: !!d.caught, kcal: (typeof d.kcal === 'number' ? d.kcal : null),
            species: d.species || null, teacher: d.teacher || null,
          });
        } else if (ty === 'eat' && args[1] && typeof args[1].ateKcal === 'number') {
          if (_pendingEat) _pendingEat.teleAteKcal = args[1].ateKcal;
          t.teleEat.push({ day: dayOf(Game), ateKcal: args[1].ateKcal, spoiled: !!args[1].spoiled });
        }
      } catch (e) { err('tele-record', e); }
    },
  });

  // (7) Staffing — hunt + deadfall (stick duty). offerDeal/appealToGoal hunt.
  function classifyRet(ret) {
    if (ret === null || ret === undefined) return 'null';
    if (typeof ret === 'object') { if (ret.ok) return 'ok'; if (ret.refused) return 'refused'; return 'other-obj'; }
    return typeof ret;
  }
  wrapMethod('assignTask', {
    pre: function (args) {
      return { day: dayOf(Game), part: partNow(), trustBefore: trustOf(args[0]), havenBefore: atHaven(), stack: stackText(3) };
    },
    post: function (args, r, threw, pre) {
      if (args[1] !== 'hunt' && args[1] !== 'deadfall') return;
      const lr = ((Game.state || {}).village || {}).lastRefusal;
      t.huntCalls.push({
        day: (pre && pre.day) || dayOf(Game), part: (pre && pre.part) || null,
        verb: 'assignTask', task: args[1], vid: args[0] || null,
        occ: String((personFor(args[0]).formerOccupation || '')),
        ret: classifyRet(r), reason: (r && r.reason) || null,
        lastRefusalReason: (lr && lr.vid === args[0] && lr.task === args[1]) ? String(lr.reason || '').slice(0, 120) : null,
        trustBefore: (pre && pre.trustBefore !== undefined ? pre.trustBefore : null),
        havenBefore: (pre && pre.havenBefore !== undefined ? pre.havenBefore : null),
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });
  ['offerDeal', 'appealToGoal'].forEach(function (verb) {
    wrapMethod(verb, {
      pre: function (args) { return { day: dayOf(Game), part: partNow(), trustBefore: trustOf(args[0]), havenBefore: atHaven() }; },
      post: function (args, r, threw, pre) {
        if (args[1] !== 'hunt') return;
        t.huntCalls.push({
          day: (pre && pre.day) || dayOf(Game), part: (pre && pre.part) || null,
          verb: verb, task: args[1], vid: args[0] || null,
          occ: String((personFor(args[0]).formerOccupation || '')),
          ret: classifyRet(r), reason: (r && r.reason) || null,
          lastRefusalReason: null,
          trustBefore: (pre && pre.trustBefore !== undefined ? pre.trustBefore : null),
          havenBefore: (pre && pre.havenBefore !== undefined ? pre.havenBefore : null),
          caller: verb, threw: !!threw,
        });
      },
    });
  });

  // (8) Deeds. noteDeed IS creditDeed('player', ...) internally
  // (tracks.js): same suppression flag as fishfirst-a.
  let _inNoteDeed = false;
  wrapMethod('noteDeed', {
    pre: function (args) { _inNoteDeed = true; return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      try {
        if (args[0] === 'trapping') t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[0], who: 'player' });
      } finally { _inNoteDeed = false; }
    },
  });
  wrapMethod('creditDeed', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      if (_inNoteDeed) return; // internal delegation of noteDeed — already recorded
      if (args[1] === 'trapping') t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[1], who: args[0] || null });
    },
  });

  // (9) spawnWorldMonster — the #1826 verification.
  wrapMethod('spawnWorldMonster', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3) }; },
    post: function (args, r, threw, pre) {
      try {
        const mdef = args[0] || {};
        t.spawns.push({
          day: (pre && pre.day) || dayOf(Game),
          id: (typeof mdef === 'string' ? mdef : (mdef.id || null)),
          hp: (r && typeof r.hp === 'number' ? r.hp : null),
          maxHp: (r && typeof r.maxHp === 'number' ? r.maxHp : null),
          wave: (r && typeof r.wave === 'number' ? r.wave : null),
          veteran: !!(r && r.veteran),
          caller: firstFrame((pre && pre.stack) || ''),
          threw: !!threw,
        });
      } catch (e) { err('spawn-record', e); }
    },
  });

  // (10) Cleaning — trapped-origin attribution by identity or name suffix.
  function isTrappedItem(it) {
    try {
      if (!it) return false;
      if (trappedItems.has(it)) return true;
      return /\(trapped\)/.test(String(it.name || ''));
    } catch (e) { return false; }
  }
  wrapMethod('cleanCarcass', {
    pre: function (args) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      let cand = null;
      try {
        if (args[1] && Array.isArray(args[1])) {
          cand = args[1].find(function (i) { return i && i.foodState === 'carcass'; }) || null;
        } else if (typeof args[0] === 'number') {
          cand = inv[args[0]] || null;
        } else {
          cand = inv.find(function (i) { return i && i.foodState === 'carcass'; }) || null;
        }
      } catch (e) {}
      return { day: dayOf(Game), pre: itemSnap(cand), trapped: isTrappedItem(cand) };
    },
    post: function (args, r, threw, pre) {
      t.cleans.push({
        day: (pre && pre.day) || dayOf(Game),
        name: (pre && pre.pre && pre.pre.name) || null,
        trapped: !!(pre && pre.trapped),
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });

  // (11) Village meal draw — by pantry item name.
  wrapMethod('pantryDraw', {
    pre: function (args) {
      const v = args[0] || {};
      const byObj = new Map();
      try {
        for (const it of (v.pantry || [])) byObj.set(it, { name: it.name || null, foodState: it.foodState || null });
      } catch (e) { err('pantryDraw-pre', e); }
      return { day: dayOf(Game), stack: stackText(3), byObj: byObj, cook: !!(args[2] && args[2].cook), want: args[1] };
    },
    post: function (args, r, threw, pre) {
      const byName = {};
      const byState = {};
      let cookedKcal = 0;
      try {
        for (const entry of ((r && r.items) || [])) {
          let nm, st;
          if (pre && pre.byObj && pre.byObj.has(entry.item)) {
            const rec = pre.byObj.get(entry.item) || {};
            nm = rec.name || 'unknown'; st = rec.foodState || 'none';
          } else {
            nm = (entry.item && entry.item.name) || 'unknown';
            st = (entry.item && entry.item.foodState) || 'unknown';
          }
          const k = (entry.units || 0) * (entry.effectiveKcal || 0);
          byName[nm] = (byName[nm] || 0) + k;
          byState[st] = (byState[st] || 0) + k;
          if (entry.cooked) cookedKcal += k;
        }
      } catch (e) { err('pantryDraw-post', e); }
      t.draws.push({
        day: (pre && pre.day) || dayOf(Game),
        cook: !!(pre && pre.cook), want: (pre && typeof pre.want === 'number' ? pre.want : null),
        taken: (r && typeof r.taken === 'number' ? r.taken : null),
        byName: byName, byState: byState, cookedKcal: cookedKcal,
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (12) Eating (cookfirst-a pattern, attributed by name).
  function scholarKcal() { try { return ((Game.state || {}).scholar || {}).kcal || 0; } catch (e) { return 0; } }
  function spoiledOf(it) {
    try { return !!(it && Game.isSpoiled && Game.isSpoiled(it)); } catch (e) { return false; }
  }
  wrapMethod('eatOne', {
    pre: function (args) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      return { day: dayOf(Game), kcalBefore: scholarKcal(), item: itemSnap(inv[args[0]]) };
    },
    post: function (args, r, threw, pre) {
      const ate = Math.max(0, scholarKcal() - ((pre && pre.kcalBefore) || 0));
      const rec = {
        day: (pre && pre.day) || dayOf(Game), via: 'eatOne',
        name: (pre && pre.item && pre.item.name) || null,
        foodState: (pre && pre.item && pre.item.foodState) || null,
        kcalEach: (pre && pre.item && pre.item.kcalEach) || null,
        ateKcal: ate, threw: !!threw,
      };
      t.eats.push(rec);
      _pendingEat = rec;
    },
  });
  wrapMethod('eatStashOne', {
    pre: function (args) {
      let stash = [];
      try { stash = (typeof Game.prepStash === 'function') ? Game.prepStash() : []; } catch (e) {}
      return { day: dayOf(Game), kcalBefore: scholarKcal(), item: itemSnap(stash[args[0]]) };
    },
    post: function (args, r, threw, pre) {
      const ate = Math.max(0, scholarKcal() - ((pre && pre.kcalBefore) || 0));
      const rec = {
        day: (pre && pre.day) || dayOf(Game), via: 'eatStashOne',
        name: (pre && pre.item && pre.item.name) || null,
        foodState: (pre && pre.item && pre.item.foodState) || null,
        kcalEach: (pre && pre.item && pre.item.kcalEach) || null,
        ateKcal: ate, threw: !!threw,
      };
      t.eats.push(rec);
      _pendingEat = rec;
    },
  });
  wrapMethod('eat', {
    pre: function (args) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      const snap = inv.map(function (it) {
        return { it: it, key: (it.name || '') + '|' + (it.foodState || '') + '|' + (it.kcalEach || 0), units: it.units || 0, spoiled: spoiledOf(Game, it), foodState: it.foodState || null, kcalEach: it.kcalEach || 0, name: it.name || null };
      });
      return { day: dayOf(Game), kcalBefore: scholarKcal(), snap: snap };
    },
    post: function (args, r, threw, pre) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      const after = {};
      try {
        for (const it of inv) {
          const k = (it.name || '') + '|' + (it.foodState || '') + '|' + (it.kcalEach || 0);
          after[k] = (after[k] || 0) + (it.units || 0);
        }
      } catch (e) { err('eat-after', e); }
      let purgedKcal = 0;
      try {
        for (const s of ((pre && pre.snap) || [])) {
          const left = after[s.key] || 0;
          const gone = Math.max(0, (s.units || 0) - left);
          if (!gone) continue;
          if (s.spoiled) { purgedKcal += gone * (s.kcalEach || 0); continue; }
          t.eats.push({
            day: (pre && pre.day) || dayOf(Game), via: 'eat',
            name: s.name, foodState: s.foodState,
            kcalEach: s.kcalEach, units: gone,
            ateKcal: Math.round(gone * (s.kcalEach || 0)), threw: !!threw,
          });
        }
      } catch (e) { err('eat-diff', e); }
      if (purgedKcal > 0) {
        t.eats.push({ day: (pre && pre.day) || dayOf(Game), via: 'eat-purge', name: null, foodState: null, kcalEach: null, units: null, ateKcal: 0, purgedKcal: purgedKcal, threw: !!threw });
      }
    },
  });

  // (13) Daily snapshot.
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try {
      const v = (Game.state && Game.state.village) || {};
      snap.pantryByName = nameRoll(v.pantry || []);
      snap.pantryKcal = Object.keys(snap.pantryByName).reduce(function (a, k) { return a + (snap.pantryByName[k].kcal || 0); }, 0);
      snap.packByName = nameRoll((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []);
      snap.spoiledTrapMeatKcal = 0;
      snap.spoiledPresentKcal = 0;
      try {
        for (const it of (v.pantry || [])) {
          if (it && Game.isSpoiled && Game.isSpoiled(it)) {
            const k = (it.kcalEach || 0) * (it.units || 0);
            snap.spoiledPresentKcal += k;
            if (/snared meat|pit meat|game meat/i.test(it.name || '')) snap.spoiledTrapMeatKcal += k;
          }
        }
      } catch (e) {}
    } catch (e) { snap.pantryByName = null; err('snap-pantry', e); }
    try {
      const codex = ((Game.state || {}).codex || {});
      snap.snareWireLevel = ((((codex.skills || {}).snare_wire || {}).level) || 0);
      snap.recipeLevels = {};
      for (const rid of TRAP_RECIPES) snap.recipeLevels[rid] = (((codex.recipes || {})[rid] || {}).level || 0);
      snap.techniques = Object.assign({}, (codex.techniques || {}));
    } catch (e) { snap.snareWireLevel = null; err('snap-tech', e); }
    try {
      const v = (Game.state && Game.state.village) || {};
      snap.knowsSnare = 0; snap.knowsPit = 0; snap.roster = 0;
      const roster = v.roster || [];
      snap.roster = roster.length;
      for (const vid of roster) {
        try {
          const vp = vpOf(vid);
          if (vp.knowsSnare) snap.knowsSnare++;
          if (vp.knowsPit) snap.knowsPit++;
        } catch (e) {}
      }
      snap.animalsKnown = Object.keys(v.animals || {});
    } catch (e) { snap.knowsSnare = null; err('snap-knows', e); }
    try {
      // Traps on the current map (read-only): the scholar's working line.
      // map.tiles is the current macro tile's 9x9 detail grid (same loop
      // checkTraps uses). Tiles without a traps array are skipped, never
      // created — counting must not mutate state.
      snap.traps = [];
      snap.trapCount = 0;
      const tiles = (Game.map && Game.map.tiles) || [];
      for (let fy = 0; fy < tiles.length; fy++) for (let fx = 0; fx < (tiles[fy] || []).length; fx++) {
        let ft = null;
        try { ft = (typeof Game.tileAt === 'function') ? Game.tileAt(fx, fy) : null; } catch (e) {}
        if (!ft || !ft.traps || !ft.traps.length) continue;
        for (const tr of ft.traps) {
          snap.traps.push({ x: fx, y: fy, recipeId: tr.recipeId || null, uses: (typeof tr.uses === 'number' ? tr.uses : null), setDay: tr.setDay || null });
          snap.trapCount++;
        }
      }
      snap.mapPx = (Game.map && Game.map.px !== undefined) ? Game.map.px : null;
      snap.mapPy = (Game.map && Game.map.py !== undefined) ? Game.map.py : null;
      try {
        const vv = (Game.state && Game.state.village) || {};
        snap.atVillage = (snap.mapPx === (vv.px ?? 4) && snap.mapPy === (vv.py ?? 4));
      } catch (e) { snap.atVillage = null; }
    } catch (e) { snap.traps = null; err('snap-traps', e); }
    try {
      // Current-map trap-species wildlife total (read-only, never
      // backfilled): the ecology the line hunts. Only tiles that already
      // carry a wildlife map are counted.
      const species = t.trapSpecies || [];
      let total = 0, tilesWithWildlife = 0;
      const tiles = (Game.map && Game.map.tiles) || [];
      for (let fy = 0; fy < tiles.length; fy++) for (let fx = 0; fx < (tiles[fy] || []).length; fx++) {
        let ft = null;
        try { ft = (typeof Game.tileAt === 'function') ? Game.tileAt(fx, fy) : null; } catch (e) {}
        if (!ft) continue;
        const wl = ft.wildlife;
        if (!wl) continue;
        tilesWithWildlife++;
        for (const id of species) total += (wl[id] || 0);
      }
      snap.mapTrapWildlife = { total: total, tilesWithWildlife: tilesWithWildlife };
    } catch (e) { snap.mapTrapWildlife = null; err('snap-wildlife', e); }
    try {
      const tools = ((Game.state || {}).scholar || {}).tools || [];
      snap.trapToolsHeld = tools.filter(function (x) { return x && TRAP_RECIPES.indexOf(x.recipeId) !== -1; }).map(function (x) { return { recipeId: x.recipeId, uses: x.uses }; });
    } catch (e) { snap.trapToolsHeld = null; err('snap-tools', e); }
    try {
      snap.foodXp = {};
      const roster = (((Game.state || {}).village || {}).roster || []);
      for (const vid of roster) {
        try {
          const person = personFor(vid);
          const xp = person && person.foodXp;
          if (xp && Object.keys(xp).length) snap.foodXp[vid] = Object.assign({}, xp);
        } catch (e) {}
      }
    } catch (e) { snap.foodXp = null; err('snap-foodxp', e); }
    try {
      const v = (Game.state && Game.state.village) || {};
      snap.throttleRedirectsCum = v.throttleRedirects || 0;
      snap.throttleExemptDepthCum = v.throttleExemptDepth || 0;
    } catch (e) { snap.throttleRedirectsCum = null; err('snap-throttle', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
    });
    try { if (Game.__luckSink) Game.__luckSink = _prevLuckSink || undefined; } catch (e) { err('uninstall-luckSink', e); }
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = {
  install: install,
  TRAP_RECIPES: TRAP_RECIPES,
};
