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
// rules:
//   - kin_never_local: kin are never placed in the landing region (code: placeKinFor)
//   - kin_deterministic: placement is a pure function of map.worldSeed + owner + person, drawing no Math.random (code: kinRand)
//   - taken_matches_lifeseed: fate 'taken' uses the same test as lifeseed.js takenKinOf (code: KIN_TAKEN)
//   - hidden_until_known: nothing here is shown; keepsake clues name a kin's region only once world.regions[id].known (code: keepsakes.js keepsakeClues)
// consumes:
//   - regionDef, activeRegion, originRegionsForTags, mulberry32 (game.js)
//   - vpOf (conversation.js)
//   - state.world, state.region, state.village.roster, state.village.rosterChars
(function () {
  'use strict';
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // Same definition of "Taken" as lifeseed.js takenKinOf.
  const KIN_TAKEN = /tak(en|ing)|pod/i;
  // Kin who died before the sky changed are not out there to be found.
  const KIN_DEAD = /\bburied\b|\bdied\b/i;

  function warn(msg) { console.warn('[world] ' + msg); }
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }

  const methods = {
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
    hearOfRegion(id, why, opts) {
      const st = this.state;
      if (!st || !this.regionDef(id)) return false;
      if (!st.world) this.migrateWorld();
      const e = st.world.regions[id] || (st.world.regions[id] = { known: false, contact: false, visited: false });
      if (e.known) return false;
      e.known = true;
      e.heardDay = (st.scholar && st.scholar.day) || 0;
      e.heardWhy = why || null;
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
