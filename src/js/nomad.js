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
//   - Game.nomad = { canLeave(), start(), addLeg(regionId, kinName),
//     enterLeg(i), departLeg(), daily(), endRoad(reason), party(),
//     endingData(), onRoad(), markKinFound(name, relation, fate), addFood(kcal) }
//   - canLeave() -> {ok} | {ok:false, reason:'rank'|'no_known_kin'|'on_road'|'no_state'}
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
    const d = (Game.data && Game.data.villagers || []).find(x => x.id === id) || {};
    return (rc[id] && rc[id].name) || d.name || String(id || 'someone');
  }
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

  const nomad = {
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
      // The village appoints a new leader by the mantle's rule: trust decides.
      const trust = v.trust || {};
      const stayers = (v.roster || []).filter(id => id !== Game.villagerId);
      stayers.sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
      const leaderId = stayers[0] || null;
      // The party musters and takes its share of the stores.
      const party = nomadMuster();
      const carried = takeSupplies(v, Math.round(stores * CARRY_SHARE));
      st.road = {
        active: true,
        partyIds: party.slice(),
        bearerId: party[0],
        fallen: [],
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

    addLeg(regionId, kinName) {
      const r = road();
      if (!r || !r.active) return null;
      let def = null;
      try { def = typeof Game.regionDef === 'function' ? Game.regionDef(regionId) : null; } catch (e) {}
      if (!def) return null;
      if (r.legs.some(l => l.regionId === regionId && l.status !== 'done')) return null;
      const leg = { regionId, kinName: kinName || null, status: 'pending' };
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
        if (typeof Game.genMap === 'function') Game.genMap();
      } catch (e) { /* the map is best-effort in thin rigs */ }
      log(`entered ${rname}.`);
      say(`The ${rname} spreads out ahead. Nobody here knows your name. That's the point — and the problem.`);
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
        const next = r.partyIds[0] || null;
        if (next) {
          const old = r.bearerId;
          r.bearerId = next;
          try { if (typeof Game.mantleBecome === 'function') Game.mantleBecome(old, next); } catch (e) { /* mantle is best-effort */ }
          Game.villagerId = next;
          say(`The Codex doesn't pause for grief. ${vname(next)} picks it up. The road goes on.`);
          log(`mantle passed to ${vname(next)}.`);
        }
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

    // markKinFound: the reunion scene (Worker C) records what happened.
    markKinFound(name, relation, fate) {
      const r = road();
      if (!r) return null;
      const entry = { name, relation: relation || null, fate: fate || 'alive', day: day() };
      r.foundKin.push(entry);
      try {
        const st = Game.state;
        const k = (st.world && st.world.kin || []).find(x => x.name === name && x.relation === relation);
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
