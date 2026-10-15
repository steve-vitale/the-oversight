// @ontology
// system: nomad-drive
// description: The Long Way Home — the road driver (docs/WORLD-REGIONS.md §6). Plans the departure itinerary, fires reunions after days on a leg, determines fates deterministically, applies outcomes, relocates moved-on kin, closes the road when every scattered kin resolves, and owns the leave / move-on / settle UI taps.
// provides:
//   - Game.nomadDrive (hooks wrap nomad.start/enterLeg/daily and Game.playerDeath, guarded wrap-once)
//   - planLegs()
//   - syncItinerary()
//   - fateFor()
//   - maybeReunion()
//   - resolveReunion()
//   - moveKinOn()
//   - checkAllFound()
//   - leaveTap()
//   - moveOnTap()
//   - settleTap()
// rules:
//   - itinerary: departure plans one leg per living scattered kin whose region is known; newly sharpened trails join by daily sync (code: planLegs, syncItinerary)
//   - reunion_timing: one reunion per leg per day after 3+ days living there; never a prompt (code: maybeReunion)
//   - deterministic_fate: fate = hash(kinName + worldSeed + moves), alive .5 / changed .2 / dead .15 / moved .15; moved excluded after 2 moves (code: fateFor)
//   - moved_on: the kin relocates to a new deterministic region (never the leg's, never the landing); the trail resets to vague (code: moveKinOn)
//   - joined_kin: alive joins the party as a companion (kin: id, road.companions); companions never bear the Codex (code: resolveReunion, nomad.js isCompanion)
//   - all_found: every scattered kin resolved alive/changed/dead closes the road all-found (code: checkAllFound)
//   - two_tap: leaving and settling are irrevocable: first tap says the cost, second commits; tap-state only, never saved (code: leaveTap, settleTap)
// consumes:
//   - Game.nomad start/addLeg/enterLeg/departLeg/daily/endRoad/markKinFound/party/onRoad/canLeave, state.road (nomad.js)
//   - Game.nomadScenes reunionScene/sharpenTrail (nomad-scenes.js, guarded)
//   - Game.nomadWild travelEvent (nomad-wild.js, guarded)
//   - Game.worldKin(), Game.state.world, Game.map.worldSeed, Game.data.regions
(function () {
  'use strict';
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  const REUNION_DAYS = 3; // days living on a leg before word gets around
  const MAX_MOVES = 2; // a kin can move on twice, then the road catches them

  function say(msg) {
    try { if (typeof Game.say === 'function') Game.say(msg); } catch (e) {}
  }
  function road() {
    return (Game.state && Game.state.road) || null;
  }
  function worldSeed() {
    try {
      return ((Game.map && Game.map.worldSeed) ||
        (Game.state && Game.state.run && Game.state.run.map && Game.state.run.map.worldSeed) || 1) >>> 0;
    } catch (e) { return 1; }
  }
  // FNV-1a, same as nomad-scenes' hashStr (kept local: scenes doesn't export it).
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    const str = String(s || '');
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function livingScatteredKin() {
    try {
      const kin = typeof Game.worldKin === 'function' ? Game.worldKin(Game.villagerId) : [];
      return kin.filter(k => k.fate === 'scattered' && !k.found);
    } catch (e) { return []; }
  }
  function regionKnown(id) {
    try { return !!(((Game.state || {}).world || {}).regions || {})[id].known; }
    catch (e) { return false; }
  }
  function regionPool() {
    const land = (Game.state && Game.state.region) || 'na_eastern_woodlands';
    const all = (Game.data && Array.isArray(Game.data.regions) ? Game.data.regions : []).map(r => r.id);
    return (all.length ? all : []).filter(id => id !== land);
  }

  const drive = {
    // planLegs(): the departure itinerary — one leg per living scattered kin
    // whose region is known. Called once, wrapped around nomad.start().
    planLegs() {
      const N = Game.nomad;
      if (!N || !N.onRoad()) return 0;
      let n = 0;
      for (const k of livingScatteredKin()) {
        if (k.region && regionKnown(k.region) && N.addLeg(k.region, k.name)) n++;
      }
      return n;
    },

    // syncItinerary(): newly sharpened trails join the itinerary. Runs inside
    // the daily tick — knowledge earned mid-road becomes a destination.
    syncItinerary() {
      const N = Game.nomad, r = road();
      if (!N || !r || !r.active) return 0;
      let n = 0;
      for (const k of livingScatteredKin()) {
        if (!k.region || !regionKnown(k.region)) continue;
        if (r.legs.some(l => l.status !== 'done' &&
            ((l.kinNames || []).indexOf(k.name) >= 0 || l.kinName === k.name))) continue;
        if (N.addLeg(k.region, k.name)) {
          n++;
          let rname = k.region;
          try { const d = Game.regionDef(k.region); rname = (d && d.name) || k.region; } catch (e) {}
          say(`The trail points to ${rname}. You mark it on the itinerary.`);
        }
      }
      return n;
    },

    // fateFor(name, moves): deterministic reunion fate. Weighted alive .5 /
    // changed .2 / dead .15 / moved .15; 'moved' excluded after MAX_MOVES.
    fateFor(name, moves) {
      const mv = moves || 0;
      const roll = (hashStr('reunion|' + worldSeed() + '|' + name + '|' + mv) % 1000) / 1000;
      if (mv >= MAX_MOVES) return roll < 0.625 ? 'alive' : roll < 0.825 ? 'changed' : 'dead';
      if (roll < 0.5) return 'alive';
      if (roll < 0.7) return 'changed';
      if (roll < 0.85) return 'dead';
      return 'moved';
    },

    // maybeReunion(): called after the daily tick. Fires one reunion per
    // leg per day, after REUNION_DAYS living there — kin who share a region
    // resolve across successive days.
    maybeReunion() {
      const r = road();
      if (!r || !r.active) return null;
      const leg = r.legs[r.legIndex];
      if (!leg || leg.status !== 'active') return null;
      const names = leg.kinNames && leg.kinNames.length ? leg.kinNames
        : (leg.kinName ? [leg.kinName] : []);
      leg.resolvedKin = leg.resolvedKin || {};
      const target = names.find(n => !leg.resolvedKin[n]);
      if (!target) return null;
      const daysHere = r.daysOnRoad - (leg.enterDay || 0);
      if (daysHere < REUNION_DAYS) return null;
      return this.resolveReunion(leg, target);
    },

    // resolveReunion(leg, name): play the scene, apply the outcome, record it.
    resolveReunion(leg, name) {
      const N = Game.nomad, r = road();
      if (!N || !r || !leg || !name) return null;
      leg.resolvedKin = leg.resolvedKin || {};
      const moves = (leg.moves && leg.moves[name]) || 0;
      const fate = this.fateFor(name, moves);
      let scene = null;
      try {
        if (Game.nomadScenes && typeof Game.nomadScenes.reunionScene === 'function') {
          scene = Game.nomadScenes.reunionScene(name, fate);
        }
      } catch (e) {}
      const outcome = (scene && scene.outcome) ||
        (fate === 'alive' ? 'joined' : fate === 'dead' ? 'grave' : fate === 'moved' ? 'trail-continues' : 'choice');
      const kin = livingScatteredKin().find(k => k.name === name) || {};
      const relation = kin.relation || null;

      if (outcome === 'joined') {
        // The kin walks with the party — as a companion, not a villager.
        const party = N.party ? N.party() : [];
        if (party.length < 4) {
          const cid = 'kin:' + String(name).replace(/[^a-zA-Z0-9]+/g, '_');
          r.companions = r.companions || {};
          if (!r.companions[cid]) r.companions[cid] = { name, relation };
          if (r.partyIds.indexOf(cid) < 0) r.partyIds.push(cid);
          say(`${name} shoulders a pack. Four mouths, four pairs of eyes.`);
        } else {
          say(`There's no room in the party's packs for another mouth — ${name} walks alongside anyway, sharing fire but not stores.`);
        }
        N.markKinFound(name, relation, 'alive');
        leg.resolvedKin[name] = 'alive';
      } else if (outcome === 'grave') {
        N.markKinFound(name, relation, 'dead');
        leg.resolvedKin[name] = 'dead';
      } else if (outcome === 'choice') {
        // Changed: the scene said the situation honestly. The choice UI is a
        // later pass; the road default is to let them be and walk on.
        N.markKinFound(name, relation, 'changed');
        leg.resolvedKin[name] = 'changed';
      } else if (outcome === 'trail-continues') {
        this.moveKinOn(name, leg);
        leg.resolvedKin[name] = 'moved';
      } else {
        leg.resolvedKin[name] = fate;
      }
      // The leg closes when every kin on it has resolved.
      const names = leg.kinNames && leg.kinNames.length ? leg.kinNames
        : (leg.kinName ? [leg.kinName] : []);
      if (names.every(n => leg.resolvedKin[n])) {
        leg.status = 'done';
        leg.resolved = leg.resolvedKin[names[names.length - 1]] || fate;
      }
      this.checkAllFound();
      return { fate, outcome };
    },

    // moveKinOn(name, leg): the kin moved on. They relocate to a new
    // deterministic region (never this leg's, never the landing); the trail
    // resets to vague and must be re-sharpened; the itinerary syncs when it is.
    moveKinOn(name, leg) {
      const pool = regionPool().filter(id => id !== leg.regionId);
      if (!pool.length) return false;
      leg.moves = leg.moves || {};
      const moves = (leg.moves[name] || 0) + 1;
      const pick = pool[hashStr('moved|' + worldSeed() + '|' + name + '|' + moves) % pool.length];
      try {
        const st = Game.state;
        const entry = ((st.world || {}).kin || []).find(k => k.name === name && k.fate === 'scattered');
        if (entry) entry.region = pick;
        // The trail goes vague again: what you knew was the old place.
        const ns = st.nomadScenes;
        if (ns && ns.trails) delete ns.trails[name];
      } catch (e) {}
      leg.moves[name] = moves;
      let rname = pick;
      try { const d = Game.regionDef(pick); rname = (d && d.name) || pick; } catch (e) {}
      say(`Word is ${name} moved on — somewhere new. The old trail goes cold. When you learn where, the itinerary will know.`);
      return true;
    },

    // checkAllFound(): every scattered kin resolved alive/changed/dead
    // (moved-on kin resolve when a later leg catches them) closes the road
    // 'all-found'. Kin whose region was never learned don't block it — the
    // player can always choose to settle.
    checkAllFound() {
      const N = Game.nomad, r = road();
      if (!N || !r || !r.active) return false;
      let all = [];
      try {
        const kin = typeof Game.worldKin === 'function' ? Game.worldKin(Game.villagerId) : [];
        all = kin.filter(k => k.fate === 'scattered');
      } catch (e) {}
      if (!all.length) return false;
      const resolved = {};
      for (const l of r.legs) {
        const rk = l.resolvedKin || {};
        for (const n of Object.keys(rk)) if (rk[n] !== 'moved') resolved[n] = true;
        if (l.kinName && l.resolved && l.resolved !== 'moved') resolved[l.kinName] = true;
      }
      const pending = all.filter(k => !resolved[k.name]);
      if (!pending.length) {
        N.endRoad('all-found');
        return true;
      }
      return false;
    },

    // ---- UI taps (wired from app.js) ----

    leaveTap() {
      const N = Game.nomad;
      let g = { ok: false };
      try { g = N && N.canLeave ? N.canLeave() : g; } catch (e) {}
      if (!g.ok) return; // knowledge-gated: the button never renders anyway
      const now = Date.now();
      if (!this._leaveArmed || now - this._leaveArmed > 120000) {
        this._leaveArmed = now;
        say(`Walk away from Haven? The village stays and chooses its own leader. Leaving gives up the Table — the road is its own ending, not an addition. Tap again to go.`);
        return;
      }
      this._leaveArmed = 0;
      N.start();
    },

    moveOnTap() {
      const N = Game.nomad, r = road();
      if (!N || !r || !r.active) return;
      const cur = r.legs[r.legIndex];
      const next = r.legs.find(l => l.status === 'pending');
      if (cur) N.departLeg();
      if (next) {
        const i = r.legs.indexOf(next);
        try {
          if (Game.nomadWild && typeof Game.nomadWild.travelEvent === 'function') Game.nomadWild.travelEvent();
        } catch (e) {}
        N.enterLeg(i);
      } else if (!cur) {
        say('No legs on the itinerary. Sharpen a trail — learn where your kin are — and the road will know where to go.');
      } else {
        say('That was the last planned leg. The road is yours now: settle here, or sharpen a trail and keep walking.');
      }
    },

    settleTap() {
      const N = Game.nomad, r = road();
      if (!N || !r || !r.active) return;
      const now = Date.now();
      if (!this._settleArmed || now - this._settleArmed > 120000) {
        this._settleArmed = now;
        say('Stop walking and settle here? The road ends — this is an ending, win or lose by what it cost. Tap again to stay.');
        return;
      }
      this._settleArmed = 0;
      N.endRoad('settled');
    },
  };

  // ---- hooks into the road state machine (all guarded, wrap-once) ----

  function wrapStart() {
    try {
      const N = Game.nomad;
      if (!N || N.start._driveWrapped) return;
      const _start = N.start.bind(N);
      const wrapped = function () {
        const r = _start();
        if (r) { try { drive.planLegs(); } catch (e) {} }
        return r;
      };
      wrapped._driveWrapped = true;
      N.start = wrapped;
    } catch (e) {}
  }

  function wrapEnterLeg() {
    try {
      const N = Game.nomad;
      if (!N || N.enterLeg._driveWrapped) return;
      const _enter = N.enterLeg.bind(N);
      const wrapped = function (i) {
        const ok = _enter(i);
        if (ok) {
          try {
            const r = road();
            const leg = r && r.legs[i];
            if (leg && leg.enterDay == null) leg.enterDay = r.daysOnRoad;
          } catch (e) {}
        }
        return ok;
      };
      wrapped._driveWrapped = true;
      N.enterLeg = wrapped;
    } catch (e) {}
  }

  function wrapDaily() {
    try {
      const N = Game.nomad;
      if (!N || N.daily._driveWrapped) return;
      const _daily = N.daily.bind(N);
      const wrapped = function () {
        const rep = _daily();
        try {
          if (rep) {
            drive.syncItinerary();
            drive.maybeReunion();
          }
        } catch (e) {}
        return rep;
      };
      wrapped._driveWrapped = true;
      N.daily = wrapped;
    } catch (e) {}
  }

  // Route bearer death on the road through the party (ledger.js untouched:
  // the wrap is the codebase's own pattern — see feel.js wrapping tableFail).
  function wrapPlayerDeath() {
    try {
      if (typeof Game.playerDeath !== 'function' || Game.playerDeath._driveWrapped) return;
      const _pd = Game.playerDeath.bind(Game);
      const wrapped = function (cause) {
        try {
          const N = Game.nomad;
          if (N && N.onRoad() && typeof N.nomadKill === 'function') {
            N.nomadKill(Game.villagerId, cause);
            return; // the road narrates its own dead; the mantle stays in the party
          }
        } catch (e) {}
        return _pd(cause);
      };
      wrapped._driveWrapped = true;
      Game.playerDeath = wrapped;
    } catch (e) {}
  }

  wrapStart();
  wrapEnterLeg();
  wrapDaily();
  wrapPlayerDeath();

  Game.nomadDrive = drive;
})();
