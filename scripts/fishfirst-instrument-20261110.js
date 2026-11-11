// fishfirst-instrument-20261110.js — fishing first-numbers recorder
// (arm sim-fishfirst-a, run fleshout-20261111T0215Z). Scripts only, zero src/js.
//
// Records, per seed:
//   (1) PANTRY DEPOSITS (stockPantry wrap — the duty-kcal backstop): every
//       deposit by name ('Fish catch' / 'Foraged food' / 'Game meat' /
//       'Garden harvest' + everything else), with caller frame. 'Fish
//       catch' comes only from the fish duty (game.js ~7215, the sole
//       stockPantry('Fish catch') call site) — so the duty yield is
//       counted exactly, not inferred from say lines.
//   (2) CARCASSES (foodCarcass wrap — the scholar-kcal backstop): every
//       carcass by origin ('fished' / 'netted' / 'trapped' / 'hunted' /
//       'charred') + species + kcal. Scholar line-fish and gill-net
//       catches land here; encounter/trap catches of fish species are
//       the opportunistic bucket.
//   (3) TELE('fish') (tele wrap): scholar line-fish attempts (known,
//       cost). tele('eat') totals for the eat reconciliation.
//   (4) STAFFING (assignTask wrap, fishstaff-b pattern): every
//       assignTask('fish') with return, reason, trust-before, haven,
//       caller. offerDeal / appealToGoal fish calls too (expected 0 —
//       fishstaff-b proved no second path, re-verified here).
//   (5) DEEDS (noteDeed + creditDeed wraps): 'fishing' deeds, who.
//   (6) NETS (setNet wrap): gill-net sets (expected 0 under competent).
//   (7) CLEANING (cleanCarcass wrap): fish carcasses cleaned, by name.
//   (8) MEAL DRAWS (pantryDraw wrap): draws by pantry item NAME
//       (fish kcal drawn) as well as by foodState.
//   (9) EATING (eatOne + eatStashOne + eat wraps, cookfirst-a pattern):
//       eaten kcal attributed by item name (fish names classified in
//       the analyzer); spoiled purge.
//   (10) DAILY SNAPSHOT: pantry roll by name, pack roll by name,
//       fish-duty holders (vid/occ/sheltered/assignedDay), home-board
//       fish wildlife total (read-only: existing ft.wildlife only,
//       never backfilled — backfilling would mutate state), spoiled-
//       present fish kcal, scholar fishWise flag, techniques, foodXp.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game method.
// The proof (scripts/test-fishfirst-a.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence. stockPantry + foodCarcass are
// the backstops: if the tele/deed wraps are dead, the kcal are still
// counted from the deposit/carcass records.
//
// Usage: const FI = require('./fishfirst-instrument-20261110');
//   const fi = FI.install(Game); fi.snapshot(); ... fi.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

// First engine frame in the stack (after the wrap + this helper).
function firstFrame(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    for (const ln of lines) {
      if (ln.indexOf('fishfirst-instrument') !== -1) continue;
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
    teleFish: [],   // {day, known, cost}
    teleEat: [],    // {day, ateKcal}
    fishCalls: [],  // {day, part, verb, vid, occ, ret, reason, trustBefore, havenBefore, caller}
    deeds: [],      // {day, deed, who}
    netSets: [],    // {day, ret}
    cleans: [],     // {day, name, postName}
    draws: [],      // {day, cook, want, taken, byName, byState, cookedKcal, caller}
    eats: [],       // {day, via, name, foodState, kcalEach, units, ateKcal, purgedKcal}
    daily: [],      // snapshots
    instrumentErrors: [],
    wrapLive: {},
    regionFish: null,
  };
  const wrapped = {};
  let _pendingEat = null;

  try {
    t.regionFish = (typeof Game.regionFish === 'function') ? Game.regionFish() : ['creek_chub', 'bluegill'];
  } catch (e) { t.regionFish = ['creek_chub', 'bluegill']; }

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
  function shelteredOf(vid) {
    try { return !!(Game.isSheltered && Game.isSheltered(vid)); } catch (e) { return null; }
  }
  function atHaven() {
    try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return null; }
  }
  function partNow() { try { return Game.dayPart; } catch (e) { return null; } }

  // (1) stockPantry — the duty-kcal backstop.
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

  // (2) foodCarcass — the scholar-kcal backstop.
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
    },
  });

  // (3) tele — fish attempts + eat totals.
  wrapMethod('tele', {
    pre: function (args) { return { type: args[0] }; },
    post: function (args, r, threw, pre) {
      try {
        if (args[0] === 'fish') {
          t.teleFish.push({ day: dayOf(Game), known: !!(args[1] && args[1].known), cost: (args[1] && args[1].cost) || null });
        } else if (args[0] === 'eat' && args[1] && typeof args[1].ateKcal === 'number') {
          if (_pendingEat) _pendingEat.teleAteKcal = args[1].ateKcal;
          t.teleEat.push({ day: dayOf(Game), ateKcal: args[1].ateKcal, spoiled: !!args[1].spoiled });
        }
      } catch (e) { err('tele-record', e); }
    },
  });

  // (4) Staffing — assignTask + the other two assignment writers.
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
      if (args[1] !== 'fish') return;
      const lr = ((Game.state || {}).village || {}).lastRefusal;
      t.fishCalls.push({
        day: (pre && pre.day) || dayOf(Game), part: (pre && pre.part) || null,
        verb: 'assignTask', vid: args[0] || null,
        occ: String((personFor(args[0]).formerOccupation || '')),
        ret: classifyRet(r), reason: (r && r.reason) || null,
        lastRefusalReason: (lr && lr.vid === args[0] && lr.task === 'fish') ? String(lr.reason || '').slice(0, 120) : null,
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
        if (args[1] !== 'fish') return;
        t.fishCalls.push({
          day: (pre && pre.day) || dayOf(Game), part: (pre && pre.part) || null,
          verb: verb, vid: args[0] || null,
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

  // (5) Deeds. noteDeed IS creditDeed('player', ...) internally
  // (tracks.js): a bare creditDeed wrap would record every player
  // deed TWICE (once at noteDeed, once at the internal creditDeed
  // call). The flag suppresses the inner record so one deed = one
  // record. Single-threaded, synchronous nesting — the flag is exact.
  let _inNoteDeed = false;
  wrapMethod('noteDeed', {
    pre: function (args) { _inNoteDeed = true; return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      try {
        if (args[0] === 'fishing') t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[0], who: 'player' });
      } finally { _inNoteDeed = false; }
    },
  });
  wrapMethod('creditDeed', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      if (_inNoteDeed) return; // internal delegation of noteDeed — already recorded
      if (args[1] === 'fishing') t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[1], who: args[0] || null });
    },
  });

  // (6) Net sets.
  wrapMethod('setNet', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.netSets.push({ day: (pre && pre.day) || dayOf(Game), retNull: (r === null || r === undefined), threw: !!threw });
    },
  });

  // (7) Cleaning.
  wrapMethod('cleanCarcass', {
    pre: function (args) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      return { day: dayOf(Game), pre: itemSnap(inv[args[0]]) };
    },
    post: function (args, r, threw, pre) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      t.cleans.push({
        day: (pre && pre.day) || dayOf(Game),
        pre: (pre && pre.pre) || null,
        post: itemSnap(inv[args[0]]),
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });

  // (8) Village meal draw — by pantry item name.
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

  // (9) Eating (cookfirst-a pattern, attributed by name).
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

  // (10) Daily snapshot.
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try {
      const v = (Game.state && Game.state.village) || {};
      snap.pantryByName = nameRoll(v.pantry || []);
      snap.pantryKcal = Object.keys(snap.pantryByName).reduce(function (a, k) { return a + (snap.pantryByName[k].kcal || 0); }, 0);
      snap.packByName = nameRoll((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []);
      snap.spoiledFishKcal = 0;
      snap.spoiledPresentKcal = 0;
      try {
        for (const it of (v.pantry || [])) {
          if (it && Game.isSpoiled && Game.isSpoiled(it)) {
            const k = (it.kcalEach || 0) * (it.units || 0);
            snap.spoiledPresentKcal += k;
            if (/fish/i.test(it.name || '')) snap.spoiledFishKcal += k;
          }
        }
      } catch (e) {}
    } catch (e) { snap.pantryByName = null; err('snap-pantry', e); }
    try {
      snap.fishWise = !!(((Game.state || {}).codex || {}).fishWise);
      snap.techniques = Object.assign({}, ((Game.state || {}).codex || {}).techniques || {});
    } catch (e) { snap.fishWise = null; err('snap-tech', e); }
    try {
      const asg = ((Game.state || {}).village || {}).assignments || {};
      snap.fishDuty = [];
      for (const vid of Object.keys(asg)) {
        if (asg[vid] && asg[vid].task === 'fish') {
          const person = personFor(vid);
          snap.fishDuty.push({
            vid: vid, occ: person.formerOccupation || null,
            sheltered: shelteredOf(vid), assignedDay: asg[vid].assignedDay || null,
            via: asg[vid].via || null,
          });
        }
      }
    } catch (e) { snap.fishDuty = null; err('snap-duty', e); }
    try {
      // Home-board fish wildlife: read-only. Only tiles that already
      // carry a wildlife map are counted; tiles without one are NOT
      // backfilled here (backfilling would mutate state and break
      // neutrality). The duty itself backfills the water tiles it
      // examines, so after day 1 the count covers the fished water.
      const fishIds = t.regionFish || [];
      let total = 0, waterTiles = 0, tilesWithWildlife = 0;
      for (let fy = 0; fy < 9; fy++) for (let fx = 0; fx < 9; fx++) {
        let ft = null;
        try { ft = (typeof Game.tileAt === 'function') ? Game.tileAt(fx, fy) : null; } catch (e) {}
        if (!ft || (ft.type !== 'creek' && ft.type !== 'pond' && ft.type !== 'wetland')) continue;
        waterTiles++;
        const wl = ft.wildlife;
        if (!wl) continue;
        tilesWithWildlife++;
        for (const id of fishIds) total += (wl[id] || 0);
      }
      snap.homeFish = { total: total, waterTiles: waterTiles, tilesWithWildlife: tilesWithWildlife };
    } catch (e) { snap.homeFish = null; err('snap-homefish', e); }
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
      // Prod-throttle ledger: how many duty food resolutions were
      // redirected to wood/water/stone because the pantry was full
      // (>4 fresh days) — the reason a staffed creek can yield 0.
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
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = {
  install: install,
};
