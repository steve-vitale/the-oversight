// @ontology
// system: world
// description: The world registry (docs/WORLD-REGIONS.md §6, Steve 2026-10-14: "people got randomized and split up across the world. The family arc has to be late game content at the global stage."). state.world = {regions:{id:{known,contact,visited,heardDay,heardWhy}}, kin:[{owner,name,relation,region,fate,found}]}. At run start every region of regions.json gets an entry (the landing region known+visited, every roster member's origin region known), and each roster member's lifeseed kin is placed in a seeded random region that is never the landing region (fate 'scattered'), or off-world with region null when the lifeseed says Taken (fate 'taken', docs/KIN.md) (kin who died before the sky changed are not placed). Hidden: no UI until the global-stage content reads it.
// provides:
//   - initWorld() -> builds state.world for a new run (called from newGame)
//   - migrateWorld() -> old saves get a world; new regions get entries (called from load)
//   - worldRegions() -> [{id, name, continent, status, known, contact, visited}]
//   - worldKin(owner) -> that owner's kin entries (default: the player); places them lazily for late joiners
//   - worldKinEntry(owner, person) -> the kin entry for one lifeseed person, or null
//   - hearOfRegion(id, why) -> true when the region was newly heard of
//   - worldRegionName(id) -> the region's display name
//   - runsStarted() / noteRunStart() / isFirstRun() -> the cross-run run counter (localStorage oversight.runs.v1); first run = none counted and no save on the device
//   - firstRunLanding(originId, pool) -> {region, via}: the origin region when playable, else the nearest playable (climateFamily, continent, default)
//   - regionCalendar(region) -> {id, seasons, months}: the region's climate calendar (src/data/climates.json template + region overrides)
//   - calendarStartFor(region, ms) -> {doy, region, calendar, season, date}: day 1's world day-of-year for a run started at real time ms
// rules:
//   - kin_never_local: kin are never placed in the landing region (code: placeKinFor)
//   - kin_deterministic: placement is a pure function of map.worldSeed + owner + person, drawing no Math.random (code: kinRand)
//   - taken_matches_lifeseed: fate 'taken' uses the same test as lifeseed.js takenKinOf (code: KIN_TAKEN)
//   - first_run_origin: a device's first run lands in the player's origin region (or the nearest playable); later runs are random; Game.debugRegion wins (code: game.js pickLandingRegion, firstRunLanding; Steve 2026-10-14 "first run let them land in the origin they choose a character from. Random after.")
//   - real_date_season: day 1's season is the real-world season at run start for the landing region's calendar and hemisphere, stored as state.calendarStart (code: calendarStartFor, game.js season; Steve 2026-10-14 "Whenever the player starts, should be the season the game starts in.")
//   - runs_not_meta: the run counter is its own key; newGame never touches oversight.meta.v1 (code: RUNS_KEY)
//   - hidden_until_known: nothing here is shown; keepsake clues name a kin's region only once world.regions[id].known (code: keepsakes.js keepsakeClues)
// consumes:
//   - regionDef, activeRegion, originRegionsForTags, mulberry32 (game.js)
//   - vpOf (conversation.js)
//   - state.world, state.region, state.village.roster, state.village.rosterChars
//   - playableRegions (game.js), data.climates (src/data/climates.json)
(function () {
  'use strict';
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // Same definition of "Taken" as lifeseed.js takenKinOf.
  const KIN_TAKEN = /tak(en|ing)|pod/i;
  // Kin who died before the sky changed are not out there to be found.
  const KIN_DEAD = /\bburied\b|\bdied\b/i;

  function warn(msg) { console.warn('[world] ' + msg); }

  // ---- cross-run run counter (first-run landing, Steve 2026-10-14) ----
  // Its own localStorage key: the meta store (oversight.meta.v1) promises
  // newGame never reads it (metaProgression.js read_only_power), so the run
  // count lives beside it, not in it. Node harnesses get an in-memory store.
  const RUNS_KEY = 'oversight.runs.v1';
  const SAVE_PREFIX = 'scattering-save-';
  const _mem = {};
  const memStore = {
    getItem: k => (k in _mem ? _mem[k] : null),
    setItem: (k, v) => { _mem[k] = String(v); },
  };
  function store() {
    try { if (typeof localStorage !== 'undefined' && localStorage) return localStorage; } catch (e) { warn('localStorage unavailable: ' + e.message); }
    return memStore;
  }
  const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }

  const methods = {
    // ============ FIRST-RUN LANDING ============
    // Steve 2026-10-14: "Maybe first run let them land in the origin they
    // choose a character from. Random after."
    runsStarted() {
      let n = 0;
      try {
        const raw = store().getItem(RUNS_KEY);
        const s = raw ? JSON.parse(raw) : null;
        n = (s && typeof s.started === 'number') ? s.started : 0;
      } catch (e) { warn('runs store unreadable: ' + e.message); }
      return n;
    },
    // isFirstRun(): no run counted on this device AND no save or tombstone
    // from before the counter existed (players who already played are not
    // new). Key names are scanned; no save blob is read.
    isFirstRun() {
      if (this.runsStarted() > 0) return false;
      try {
        const ls = store();
        if (typeof ls.key === 'function' && typeof ls.length === 'number') {
          for (let i = 0; i < ls.length; i++) {
            const k = ls.key(i);
            if (k && k.indexOf(SAVE_PREFIX) === 0) return false;
          }
        }
      } catch (e) { warn('save scan: ' + e.message); }
      return true;
    },
    noteRunStart() {
      const n = this.runsStarted() + 1;
      try { store().setItem(RUNS_KEY, JSON.stringify({ v: 1, started: n })); } catch (e) { warn('runs store write: ' + e.message); }
      return n;
    },
    // firstRunLanding(originId, pool): the origin's region when playable,
    // else the nearest playable: same climateFamily, then same continent
    // (origin's neighbors first, then regions.json order), then the default
    // region. -> {region, via: 'origin'|'climate'|'continent'|'default'}
    firstRunLanding(originId, pool) {
      pool = pool || this.playableRegions();
      if (!pool.length) return null;
      const o = this.regionDef(originId);
      if (o) {
        if (pool.some(r => r.id === o.id)) return { region: o, via: 'origin' };
        const near = (list) => {
          if (!list.length) return null;
          return list.find(r => (o.neighbors || []).includes(r.id)) || list[0];
        };
        const byClimate = near(pool.filter(r => o.climateFamily && r.climateFamily === o.climateFamily));
        if (byClimate) return { region: byClimate, via: 'climate' };
        const byContinent = near(pool.filter(r => o.continent && r.continent === o.continent));
        if (byContinent) return { region: byContinent, via: 'continent' };
      }
      const def = pool.find(r => r.id === 'na_eastern_woodlands') || pool[0];
      return { region: def, via: o ? 'default' : 'no_origin' };
    },

    // ============ CLIMATE CALENDARS (src/data/climates.json) ============
    // regionCalendar(region): {id, seasons, months} where months[0..11] is
    // the season id for each real month (Jan..Dec) in THIS region's local
    // frame, or null when the region has no month map.
    regionCalendar(region) {
      const r = region || this.activeRegion() || {};
      const C = (this.data && this.data.climates) || {};
      const c = r.climate || {};
      const calId = c.calendar || (C.familyCalendar || {})[r.climateFamily] || null;
      const tpl = calId ? (C.calendars || {})[calId] : null;
      const own = Array.isArray(c.seasons) && c.seasons.length ? c.seasons : null;
      const seasons = own || (tpl && tpl.seasons) || [];
      let months = null;
      if (Array.isArray(c.months) && c.months.length === 12) months = c.months.slice();
      else if (tpl && Array.isArray(tpl.months) && tpl.months.length === 12 && (!own || c.calendar)) {
        // template months are the northern frame; the south reads them six months on
        months = r.hemisphere === 'south' ? tpl.months.map((_, m) => tpl.months[(m + 6) % 12]) : tpl.months.slice();
      }
      if (months && !months.every(id => seasons.some(s => s.id === id))) {
        warn('region ' + r.id + ' calendar ' + calId + ': month map names a season the region lacks; no real-date start');
        months = null;
      }
      return { id: calId, seasons, months };
    },
    // calendarStartFor(region, ms): the world day-of-year of day 1 when a run
    // starts at real time ms (UTC date). Steve 2026-10-14: "Whenever the
    // player starts, should be the season the game starts in." The real
    // date's month picks the season; how far through that season's months
    // the date is places day 1 that far through the season's days.
    // -> {doy, region, calendar, season, date} or null (no month map).
    calendarStartFor(region, ms) {
      const r = region || this.activeRegion();
      if (!r) return null;
      const cal = this.regionCalendar(r);
      if (!cal.months || !cal.seasons.length) return null;
      const dt = new Date(ms);
      if (isNaN(dt.getTime())) { warn('calendarStartFor: bad time ' + ms); return null; }
      const m = dt.getUTCMonth();
      const dom = Math.min(dt.getUTCDate(), MONTH_DAYS[m]);
      const sid = cal.months[m];
      let a = m;
      for (let g = 0; g < 11 && cal.months[(a + 11) % 12] === sid; g++) a = (a + 11) % 12;
      // walk the unbroken run of months holding this season, from its first
      let into = 0, total = 0;
      for (let g = 0, j = a; g < 12 && cal.months[j] === sid; g++, j = (j + 1) % 12) {
        if (j === m) into = total + dom - 1;
        total += MONTH_DAYS[j];
      }
      let start = 0, s = null;
      for (const x of cal.seasons) { if (x.id === sid) { s = x; break; } start += x.days || 0; }
      if (!s) return null;
      const frac = total > 0 ? Math.min(0.999999, into / total) : 0;
      const doy = start + Math.min((s.days || 1) - 1, Math.floor(frac * (s.days || 1)));
      return { doy, region: r.id, calendar: cal.id, season: sid, date: dt.toISOString().slice(0, 10) };
    },

    // kinRand(owner, person): a seeded stream per kin, independent of order.
    kinRand(owner, person) {
      const ws = ((this.map && this.map.worldSeed) || (this.state && this.state.run && this.state.run.map && this.state.run.map.worldSeed) || 1) >>> 0;
      const key = String(owner) + '|' + String(person.relation || '') + '|' + String(person.name || '');
      return this.mulberry32(((ws ^ hashStr(key)) >>> 0) || 1);
    },
    worldRegionName(id) {
      const r = this.regionDef(id);
      return (r && r.name) || String(id || 'somewhere');
    },
    // initWorld(): a fresh registry for a new run.
    initWorld() {
      const st = this.state;
      st.world = { regions: {}, kin: [], placedOwners: {} };
      this.migrateWorld();
      this.hearOfRegion(st.region, 'landing', { silent: true });
      st.world.regions[st.region].visited = true;
      for (const vid of ((st.village || {}).roster || [])) {
        const ch = (st.village.rosterChars || {})[vid];
        const home = ch ? this.originRegionsForTags(ch.originTags || [])[0] : null;
        if (home) this.hearOfRegion(home, 'origin', { silent: true });
        this.placeKinFor(vid);
      }
      return st.world;
    },
    // migrateWorld(): old saves (no world) get one; every region in the data
    // gets an entry. Idempotent.
    migrateWorld() {
      const st = this.state;
      if (!st) return null;
      if (!st.world) {
        st.world = { regions: {}, kin: [], placedOwners: {} };
        const rs0 = Array.isArray(this.data.regions) ? this.data.regions : [];
        for (const r of rs0) st.world.regions[r.id] = { known: false, contact: false, visited: false };
        const land = st.region || 'na_eastern_woodlands';
        if (st.world.regions[land]) { st.world.regions[land].known = true; st.world.regions[land].visited = true; }
        for (const vid of ((st.village || {}).roster || [])) this.placeKinFor(vid);
      }
      st.world.regions = st.world.regions || {};
      st.world.kin = st.world.kin || [];
      st.world.placedOwners = st.world.placedOwners || {};
      for (const r of (Array.isArray(this.data.regions) ? this.data.regions : [])) {
        if (!st.world.regions[r.id]) st.world.regions[r.id] = { known: false, contact: false, visited: false };
      }
      return st.world;
    },
    // placeKinFor(vid): put this person's lifeseed kin somewhere in the world.
    placeKinFor(vid) {
      const st = this.state;
      const w = st && st.world;
      if (!w || !vid || w.placedOwners[vid]) return [];
      let vp = null;
      try { vp = this.vpOf ? this.vpOf(vid) : null; } catch (e) { warn('vpOf: ' + e.message); }
      if (!vp) vp = ((st.village || {}).rosterChars || {})[vid] || null;
      const people = (vp && vp.lifeseed && vp.lifeseed.people) || [];
      if (!people.length) return [];
      const land = st.region || 'na_eastern_woodlands';
      const pool = (Array.isArray(this.data.regions) ? this.data.regions : []).map(r => r.id).filter(id => id !== land);
      if (!pool.length) return [];
      const out = [];
      for (const p of people) {
        if (KIN_DEAD.test(p.fate || '')) continue;
        const R = this.kinRand(vid, p);
        const drawn = pool[Math.floor(R() * pool.length)];
        const taken = KIN_TAKEN.test(p.fate || '');
        const entry = {
          owner: vid, name: p.name, relation: p.relation,
          // The Taken are off-world (docs/KIN.md: their fate is never
          // confirmed); region null until THE HOSTS brings them home.
          region: taken ? null : drawn,
          fate: taken ? 'taken' : 'scattered',
          found: false,
        };
        w.kin.push(entry);
        out.push(entry);
      }
      w.placedOwners[vid] = true;
      return out;
    },
    worldKin(owner) {
      const st = this.state;
      if (!st) return [];
      if (!st.world) this.migrateWorld();
      const who = owner || this.villagerId;
      if (!st.world.placedOwners[who]) this.placeKinFor(who);
      return st.world.kin.filter(k => k.owner === who);
    },
    worldKinEntry(owner, person) {
      if (!person) return null;
      return this.worldKin(owner).find(k => k.name === person.name && k.relation === person.relation) || null;
    },
    // hearOfRegion(id, why): the village hears of a region (a rumor, a
    // broadcast, a keepsake clue, a traveller). Returns true when new.
    // KNOWER LEDGER (2026-10-29): learned grants carry their knower —
    // opts.knowerId (who heard it) and opts.toldBy (who told them, when
    // secondhand). System facts ('landing'/'origin') stay knower-less by
    // design: they are not learned knowledge. The registry's `known`
    // flag itself stays village-level (the index); the provenance is
    // what was missing, and it is now recorded.
    hearOfRegion(id, why, opts) {
      const st = this.state;
      if (!st || !this.regionDef(id)) return false;
      if (!st.world) this.migrateWorld();
      const e = st.world.regions[id] || (st.world.regions[id] = { known: false, contact: false, visited: false });
      if (e.known) return false;
      e.known = true;
      e.heardDay = (st.scholar && st.scholar.day) || 0;
      e.heardWhy = why || null;
      if (opts && opts.knowerId) e.knowerId = opts.knowerId;
      if (opts && opts.toldBy) e.toldBy = opts.toldBy;
      if (!(opts && opts.silent)) {
        try { this.tele('region_heard', { region: id, why: why || null }); } catch (err) { warn('tele region_heard: ' + err.message); }
      }
      return true;
    },
    // worldRegions(): the registry joined with the region data, for the
    // global-stage content (WORLD-REGIONS §6). No UI reads it yet.
    worldRegions() { // wired-exempt: global-stage API (WORLD-REGIONS §6), no UI yet by design ("If you don't know, it doesn't show")
      const st = this.state;
      if (!st) return [];
      if (!st.world) this.migrateWorld();
      return (Array.isArray(this.data.regions) ? this.data.regions : []).map(r => {
        const e = st.world.regions[r.id] || {};
        return { id: r.id, name: r.name, continent: r.continent, status: r.status,
          known: !!e.known, contact: !!e.contact, visited: !!e.visited };
      });
    },
  };

  Object.assign(Game, methods);
})();
