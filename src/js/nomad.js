// @ontology
// system: nomad
// description: The Long Way Home — the nomad road state machine
//   (docs/WORLD-REGIONS.md §6, Steve 2026-10-14: "Expedition is leaving your
//   village as a nomad to find remaining family. That should be another bonus
//   ending."). state.road = {active, partyIds, bearerId, fallen:[], supplies:
//   {food}, legs:[{regionId, kinName, status}], legIndex, daysOnRoad,
//   villageLeft:{leaderId, leftDay, strength, abandoned, fate, fateLine},
//   foundKin:[], log:[], endReason, tableGivenUp}.
// provides:
//   - Game.nomad = { canLeave(), start(), addLeg(regionId, kinName, ownerId),
//     enterLeg(i), departLeg(), daily(), endRoad(reason), party(),
//     endingData(), onRoad(), markKinFound(name, relation, fate, ownerId), addFood(kcal) }
//   - canLeave() -> {ok} | {ok:false, reason:'rank'|'no_known_kin'|'on_road'|'no_state'}
//   - addLeg(regionId, kinName, ownerId?) -> leg: one leg per region; legs
//     carry kinNames[] and kinOwners{} (kin name -> seeking villager id, null
//     for the bearer's own kin) so the road driver can plan party members'
//     kin too (nomad-drive.js)
//   - start() -> state.road | null (leaves the village, musters the party)
//   - daily() -> {day, ate, left, deaths[]} | null (party upkeep; starvation kills)
//   - endRoad('settled'|'all-found'|'wiped') -> endingData()
//   - endingData() -> {reason, daysOnRoad, foundKin, partySurvivors, fallen,
//     village:{leaderId,fate,fateLine,abandoned}, dark, log}
// rules:
//   - leave_gated: the Haven leave option exists only at global rank when the
//     player knows >=1 living scattered kin's region (state.world). Before
//     that it does not exist in the UI (canLeave().ok === false).
//   - table_given_up: leaving calls tableFail('left'); the Table cannot be
//     entered while on the road (onRoad(); road.tableGivenUp).
//   - volunteers_first: villagers with scattered kin of their own volunteer
//     first (parity); party is the bearer + up to 3.
//   - mantle_inside_party: a dead bearer's mantle passes to the next living
//     party member (mantleBecome); an empty party ends the road ('wiped').
//   - companions: joined kin travel on 'kin:' ids (road.companions), eat and
//     die like anyone, but the Codex never passes to them; if no villagers
//     remain the kin settle where they stand (endRoad 'settled').
//   - village_fate: the village left behind resolves thrived|survived|fell
//     with a fate line for the epilogue; leaving it starving is abandonment.
//   - daily_food: the party burns 2000 kcal per living member per day from
//     supplies.food; a starving day takes one life (bearer starves last).
// consumes:
//   - scaleRank(), tableFail(), mantleBecome(), npcIds(), worldKin(),
//     pantryKcalLive(), ledgerAdd(), regionDef(), genMap(), say()
//   - state.world, state.road, state.region, state.village, state.scholar,
//     state.globalLive, villagerId, data.villagers
(function () {
  'use strict';
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  const KCAL_PER_PERSON_DAY = 2000; // docs/BALANCING.md: the 2,000 kcal/day target
  const MAX_PARTY = 4; // the bearer + up to 3 (small party, finale-march rules)
  const CARRY_SHARE = 0.3; // the party carries 30% of the village stores

  function say(msg) {
    try { if (typeof Game.say === 'function') Game.say(msg); } catch (e) { /* narration is best-effort */ }
  }
  function day() {
    return ((Game.state && Game.state.scholar) || {}).day || 1;
  }
  function road() {
    return (Game.state && Game.state.road) || null;
  }
  function vname(id) {
    const rc = ((Game.state && Game.state.village) || {}).rosterChars || {};
    const r = road();
    const comp = r && r.companions && r.companions[id];
    if (comp && comp.name) return comp.name;
    const d = (Game.data && Game.data.villagers || []).find(x => x.id === id) || {};
    return (rc[id] && rc[id].name) || d.name || String(id || 'someone');
  }
  // isCompanion(id): joined kin travel on a 'kin:' id, not a villager id.
  // They eat, starve, and die like anyone — but the Codex can't pass to them.
  function isCompanion(id) { return String(id || '').indexOf('kin:') === 0; }
  function log(line) {
    const r = road();
    if (r) { r.log = r.log || []; r.log.push({ day: day(), line }); if (r.log.length > 200) r.log.splice(0, r.log.length - 200); }
  }

  // nomadKnownKin(): living scattered kin whose region the village knows.
  // Taken kin are off-world (region null); the dead were never placed.
  function nomadKnownKin() {
    try {
      const st = Game.state;
      if (!st || !st.world) return [];
      const me = Game.villagerId;
      const kin = typeof Game.worldKin === 'function' ? Game.worldKin(me) : [];
      return kin.filter(k =>
        k.fate === 'scattered' && !k.found && k.region &&
        st.world.regions[k.region] && st.world.regions[k.region].known
      );
    } catch (e) { return []; }
  }

  function villageStrength(v) {
    const pop = ((v || {}).roster || []).length;
    let stores = 0;
    try { stores = typeof Game.pantryKcalLive === 'function' ? Game.pantryKcalLive(v) : 0; } catch (e) {}
    const need30 = Math.max(1, pop) * KCAL_PER_PERSON_DAY * 30;
    return Math.min(1, stores / need30) * 0.7 + Math.min(1, pop / 12) * 0.3;
  }

  // takeSupplies(v, kcal): the party carries whole pantry items up to kcal.
  function takeSupplies(v, kcal) {
    let taken = 0;
    try {
      const pantry = v.pantry || [];
      for (let i = pantry.length - 1; i >= 0 && taken < kcal; i--) {
        const it = pantry[i] || {};
        const itemKcal = (it.kcalEach || 0) * (it.units || 1);
        if (itemKcal <= 0) continue;
        taken += itemKcal;
        pantry.splice(i, 1);
      }
    } catch (e) { /* best-effort: the party leaves with what it could carry */ }
    return Math.round(taken);
  }

  // nomadMuster(): the bearer + volunteers. Villagers with scattered kin of
  // their own volunteer first (parity — they want their families too).
  function nomadMuster() {
    const me = Game.villagerId;
    const withKin = [], others = [];
    let ids = [];
    try { ids = typeof Game.npcIds === 'function' ? Game.npcIds() : []; } catch (e) {}
    for (const vid of ids) {
      if (vid === me) continue;
      let kin = [];
      try { kin = typeof Game.worldKin === 'function' ? Game.worldKin(vid) : []; } catch (e) {}
      const seeking = kin.some(k => k.fate === 'scattered' && !k.found);
      (seeking ? withKin : others).push(vid);
    }
    const party = [me];
    for (const vid of withKin.concat(others)) {
      if (party.length >= MAX_PARTY) break;
      party.push(vid);
    }
    return party;
  }

  // nomadVillageFate(): resolve the left-behind village for the epilogue.
  // Deterministic from departure strength and time on the road.
  function nomadVillageFate(r) {
    const vl = r.villageLeft;
    if (vl.fate) return vl;
    const eff = Math.max(0, vl.strength - r.daysOnRoad / 300);
    const leader = vname(vl.leaderId);
    if (eff > 0.65) {
      vl.fate = 'thrived';
      vl.fateLine = `Word comes back on the trader's circuit: Haven stands, and then some. ${leader} held it together. They're eating.`;
    } else if (eff > 0.3) {
      vl.fate = 'survived';
      vl.fateLine = `Haven endures. Barely, some seasons. ${leader} kept the fire lit.`;
    } else {
      vl.fate = 'fell';
      vl.fateLine = `No one comes from Haven any more. The last trader found cold hearths.`;
    }
    return vl;
  }

  // legSeedForRegion(regionId): the leg board's seed, derived from the RUN
  // seed mixed with the region id — never from the previous leg's board
  // seed, so two entries to the same region in one run generate the same
  // ground. (fixall-map slice 1b, design §D: a leg is a PLACE on the
  // shared map, not a fresh random board; the seedless genMap() teleport
  // goes away.) Seed priority: the run's worldSeed when the save carries
  // one; else the road's stashed runSeed (captured at the first leg entry
  // BEFORE genMap overwrites the board seed — without the stash, the
  // fallback would read the previous leg's board seed and drift per leg,
  // which is exactly the bug this function exists to kill); else the
  // current board's worldSeed (thin rigs, single entry).
  function legSeedForRegion(regionId) {
    let base = 1;
    try {
      const r = road();
      base = ((Game.state && Game.state.worldSeed) || (r && r.runSeed) || (Game.map && Game.map.worldSeed) || 1) >>> 0 || 1;
    } catch (e) { base = 1; }
    let h = (base ^ 0x9e3779b9) >>> 0;
    const s = String(regionId || '');
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 0x85ebca6b); h ^= h >>> 13;
    }
    h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) || 1;
  }

  const nomad = {
    // Exposed for the leg-determinism proof (and any later leg work):
    // the seed enterLeg() will generate this region's board from.
    legSeedForRegion,

    onRoad() {
      const r = road();
      return !!(r && r.active);
    },

    canLeave() {
      const st = Game.state;
      if (!st || !st.village) return { ok: false, reason: 'no_state' };
      const r = road();
      if (r && r.active) return { ok: false, reason: 'on_road' };
      let rank = 'village';
      try { rank = typeof Game.scaleRank === 'function' ? Game.scaleRank() : (st.globalLive ? 'global' : 'village'); } catch (e) {}
      if (rank !== 'global') return { ok: false, reason: 'rank' };
      const kin = nomadKnownKin();
      if (!kin.length) return { ok: false, reason: 'no_known_kin' };
      return { ok: true, kin };
    },

    start() {
      const gate = this.canLeave();
      if (!gate.ok) {
        say(`The road isn't open yet. (${gate.reason})`);
        return null;
      }
      const st = Game.state;
      const v = st.village;
      const d = day();
      // The Table is given up: tableFail('left')-style. The road is its own
      // ending, not an add-on to a Table path.
      try { if (typeof Game.tableFail === 'function') Game.tableFail('left'); } catch (e) { /* the table was never approached */ }
      const strength = villageStrength(v);
      let stores = 0;
      try { stores = typeof Game.pantryKcalLive === 'function' ? Game.pantryKcalLive(v) : 0; } catch (e) {}
      // Abandonment is about food: leaving with less than a week's stores
      // for the village is leaving them hungry, whatever the headcount.
      const pop = Math.max(1, (v.roster || []).length);
      const runwayDays = stores / pop / KCAL_PER_PERSON_DAY;
      const abandoned = runwayDays < 7;
      // The party musters first: the village's new leader must be a stayer,
      // never someone walking the road (nomad-reachability 2026-10-15: the
      // old order appointed the leader from all non-bearer villagers then
      // mustered the party from the same pool, so the leader could be
      // drafted — the epilogue praised them for holding the village while
      // they starved on the road).
      const party = nomadMuster();
      const partySet = new Set(party);
      // The village appoints a new leader by the mantle's rule: trust decides.
      const trust = v.trust || {};
      const stayers = (v.roster || []).filter(id => !partySet.has(id));
      stayers.sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
      const leaderId = stayers[0] || null;
      // The party takes its share of the stores.
      const carried = takeSupplies(v, Math.round(stores * CARRY_SHARE));
      st.road = {
        active: true,
        partyIds: party.slice(),
        bearerId: party[0],
        fallen: [],
        companions: {},
        supplies: { food: carried },
        legs: [],
        legIndex: -1,
        daysOnRoad: 0,
        villageLeft: { leaderId, leftDay: d, strength, abandoned, fate: null, fateLine: null },
        foundKin: [],
        log: [],
        endReason: null,
        tableGivenUp: true,
      };
      try {
        if (typeof Game.ledgerAdd === 'function') Game.ledgerAdd('nomad', abandoned ? 'left:abandoned' : 'left:quiet');
      } catch (e) { /* the ledger is best-effort */ }
      log(`left Haven on day ${d} with ${party.map(vname).join(', ')}; ${leaderId ? vname(leaderId) : 'no one'} holds the village.`);
      say(`You walk away from Haven at dawn. No ceremony — the road doesn't do ceremonies.`);
      if (leaderId) say(`${vname(leaderId)} picks up the weight. That's the deal.`);
      if (abandoned) say(`You leave them hungry. That will follow you.`);
      else say(`The stores will hold. Probably.`);
      return st.road;
    },

    addLeg(regionId, kinName, ownerId) {
      const r = road();
      if (!r || !r.active) return null;
      let def = null;
      try { def = typeof Game.regionDef === 'function' ? Game.regionDef(regionId) : null; } catch (e) {}
      if (!def) return null;
      // One leg per region: kin who share a region share the leg.
      // kinOwners maps each kin name to the villager seeking them (null =
      // the bearer's own kin) — the road driver plans party members' kin
      // alongside the bearer's (nomad-drive.js, party_kin_legs).
      const owner = ownerId || null;
      const existing = r.legs.find(l => l.regionId === regionId && l.status !== 'done');
      if (existing) {
        existing.kinNames = existing.kinNames || [];
        existing.kinOwners = existing.kinOwners || {};
        if (kinName && existing.kinNames.indexOf(kinName) < 0) {
          // First push wins on a name: kin names are unique per run (the
          // unique-person law), so a repeat is the same person's trail.
          existing.kinNames.push(kinName);
          existing.kinOwners[kinName] = owner;
          log(`leg ${def.name || regionId}: also looking for ${kinName}.`);
        }
        return existing;
      }
      const leg = { regionId, kinName: kinName || null, kinNames: kinName ? [kinName] : [],
        kinOwners: kinName ? { [kinName]: owner } : {}, status: 'pending' };
      r.legs.push(leg);
      log(`leg added: ${def.name || regionId}${kinName ? ` — looking for ${kinName}` : ''}.`);
      return leg;
    },

    enterLeg(i) {
      const r = road();
      if (!r || !r.active) return false;
      const leg = r.legs[i];
      if (!leg || leg.status !== 'pending') return false;
      for (const l of r.legs) if (l.status === 'active') l.status = 'done';
      leg.status = 'active';
      r.legIndex = i;
      let rname = leg.regionId;
      try {
        const def = Game.regionDef(leg.regionId);
        rname = (def && def.name) || leg.regionId;
        Game.state.region = leg.regionId;
        // LEG-MAP UNIFICATION (fixall-map slice 1b): the leg board is
        // generated from the region's seed, not a fresh random roll — the
        // same region in the same run is the same ground on re-entry.
        // Stash the run seed BEFORE genMap replaces the board seed, so
        // the next leg derives from the run, not from this leg's board.
        // Nothing else about the road changes here: gate, party, forfeit,
        // and the 3-day living/search wait are untouched (design §D).
        if (typeof Game.genMap === 'function') {
          try {
            if (!(Game.state && Game.state.worldSeed) && r && !r.runSeed && Game.map) r.runSeed = Game.map.worldSeed;
          } catch (e2) { /* stash is best-effort; the fallback chain covers it */ }
          Game.genMap(legSeedForRegion(leg.regionId));
        }
      } catch (e) { /* the map is best-effort in thin rigs */ }
      log(`entered ${rname}.`);
      const disp = String(rname).replace(/^(the|a|an)\s+/i, '');
      say(`The ${disp} spreads out ahead. Nobody here knows your name. That's the point — and the problem.`);
      return true;
    },

    departLeg() {
      const r = road();
      if (!r || !r.active || r.legIndex < 0) return false;
      const leg = r.legs[r.legIndex];
      if (leg) leg.status = 'done';
      r.legIndex = -1;
      log('moved on.');
      return true;
    },

    // nomadKill(id, cause): death on the road. The mantle passes inside the
    // party; an empty party ends the road.
    nomadKill(id, cause) {
      const r = road();
      if (!r || !r.active) return false;
      const ix = r.partyIds.indexOf(id);
      if (ix < 0) return false;
      r.partyIds.splice(ix, 1);
      r.fallen = r.fallen || [];
      r.fallen.push({ id, cause: cause || 'the road', day: day() });
      log(`${vname(id)} died on the road (${cause || 'the road'}).`);
      say(`${vname(id)} doesn't wake up. The road keeps what it takes.`);
      if (id === r.bearerId) {
        const next = r.partyIds.find(pid => !isCompanion(pid)) || null;
        if (next) {
          const old = r.bearerId;
          r.bearerId = next;
          try { if (typeof Game.mantleBecome === 'function') Game.mantleBecome(old, next); } catch (e) { /* mantle is best-effort */ }
          Game.villagerId = next;
          say(`The Codex doesn't pause for grief. ${vname(next)} picks it up. The road goes on.`);
          log(`mantle passed to ${vname(next)}.`);
        } else if (r.partyIds.length) {
          // No villagers left to bear the Codex — but the found kin endure.
          // They bury the last bearer and stop walking. This is still home.
          say(`No one is left who can carry the Codex. The kin the road gave back bury ${vname(id)} properly, and stop walking. This place will do.`);
          log('the last bearer fell; the kin settle where they stand.');
          this.endRoad('settled');
          return true;
        }
        // (empty party falls through to the 'wiped' close below)
      }
      if (!r.partyIds.length) this.endRoad('wiped');
      return true;
    },

    daily() {
      const r = road();
      if (!r || !r.active) return null;
      r.daysOnRoad++;
      const report0 = { day: r.daysOnRoad, deaths: [] };
      // The party forages the strange ground first (nomad-wild.js, guarded).
      try {
        if (Game.nomadWild && typeof Game.nomadWild.partyForage === 'function') {
          const f = Game.nomadWild.partyForage();
          report0.foraged = f.kcal;
        }
      } catch (e) {}
      const need = r.partyIds.length * KCAL_PER_PERSON_DAY;
      r.supplies.food -= need;
      const report = Object.assign(report0, { ate: need, left: Math.max(0, Math.round(r.supplies.food)) });
      if (r.supplies.food < 0) {
        r.supplies.food = 0;
        // Starvation takes one life. The bearer starves last.
        const others = r.partyIds.filter(id => id !== r.bearerId);
        const pool = others.length ? others : r.partyIds.slice();
        const victim = pool[Math.floor(Math.random() * pool.length)];
        if (victim && this.nomadKill(victim, 'starvation')) report.deaths.push(victim);
      }
      // Joined-village welcome and wave check (nomad-wild.js, guarded).
      try {
        if (Game.nomadWild && typeof Game.nomadWild.legTick === 'function') {
          Object.assign(report, Game.nomadWild.legTick());
        }
      } catch (e) {}
      return report;
    },

    endRoad(reason) {
      const r = road();
      if (!r || !r.active) return null;
      const okReasons = ['settled', 'all-found', 'wiped'];
      r.endReason = okReasons.includes(reason) ? reason : 'settled';
      r.active = false;
      nomadVillageFate(r);
      log(`the road ends: ${r.endReason}.`);
      if (r.endReason === 'wiped') say(`The road ends here, unnamed and unmarked.`);
      else if (r.endReason === 'all-found') say(`Everyone's found. The long way home ends at a door, not a grave.`);
      else say(`You stop walking. This place will do.`);
      const data = this.endingData();
      // The ending is its own scene (nomad-scenes.js, guarded): light or dark,
      // with the village's fate and the party's found kin in the epilogue.
      try {
        if (Game.nomadScenes && typeof Game.nomadScenes.playEnding === 'function') {
          Game.nomadScenes.playEnding(data);
        }
      } catch (e) {}
      // Closing the run: the road ending is an ending. Wiped is a loss;
      // settling or finding everyone is the Long Way Home, won.
      try {
        Game.over = true;
        Game.won = r.endReason !== 'wiped';
        if (typeof Game.recordLegend === 'function') {
          Game.recordLegend({ outcome: 'nomad', reason: r.endReason, dark: !!data.dark,
            found: (data.foundKin || []).length, days: data.daysOnRoad });
        }
      } catch (e) {}
      return data;
    },

    party() {
      const r = road();
      if (!r) return [];
      return r.partyIds.map(id => ({ id, name: vname(id), bearer: id === r.bearerId }));
    },

    // markKinFound: the reunion scene records what happened. ownerId narrows
    // the world entry to the seeking villager's kin (party members' kin);
    // null/omitted keeps the historical name+relation match (the bearer's).
    markKinFound(name, relation, fate, ownerId) {
      const r = road();
      if (!r) return null;
      const entry = { name, relation: relation || null, fate: fate || 'alive', day: day() };
      r.foundKin.push(entry);
      try {
        const st = Game.state;
        const k = (st.world && st.world.kin || []).find(x => x.name === name && x.relation === relation &&
          (!ownerId || x.owner === ownerId));
        if (k) k.found = true;
      } catch (e) { /* world bookkeeping is best-effort */ }
      log(`found ${name}${fate && fate !== 'alive' ? ` (${fate})` : ''}.`);
      return entry;
    },

    // addFood(kcal): foraged or traded food joins the party's supplies.
    addFood(kcal) {
      const r = road();
      if (!r || !r.active || !(kcal > 0)) return 0;
      r.supplies.food += Math.round(kcal);
      return Math.round(r.supplies.food);
    },

    endingData() {
      const r = road();
      if (!r) return null;
      const vl = nomadVillageFate(r);
      return {
        reason: r.endReason || (r.active ? 'ongoing' : 'wiped'),
        daysOnRoad: r.daysOnRoad,
        foundKin: r.foundKin.slice(),
        partySurvivors: this.party(),
        fallen: (r.fallen || []).slice(),
        village: { leaderId: vl.leaderId, leaderName: vname(vl.leaderId), fate: vl.fate, fateLine: vl.fateLine, abandoned: !!vl.abandoned },
        dark: vl.fate === 'fell' || !!vl.abandoned,
        log: (r.log || []).slice(-20),
      };
    },
  };

  Game.nomad = nomad;
})();
