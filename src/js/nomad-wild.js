// @ontology
// system: nomad-wild
// description: Leg content for The Long Way Home (docs/WORLD-REGIONS.md §6).
//   While the party walks a leg (one region, days/weeks as nomads), this
//   module runs the wild: party foraging as strangers, foreign-village
//   encounters (trade / fight / join briefly), wave continuity on the road,
//   travel events between legs, and the daily supplies tick. Road state
//   itself (state.road, Game.nomad) belongs to the sibling's nomad.js —
//   every access here is guarded so this module loads and tests alone.
// provides:
//   - Game.nomadWild.strangerForageMult() -> 0.75 on a leg, else 1.0
//   - Game.nomadWild.partyForage() -> {kcal, notes[]} : the party's daily forage
//   - Game.nomadWild.genLegVillage(regionId) -> village : one foreign village on the leg map
//   - Game.nomadWild.villageMood(village) -> -2..2
//   - Game.nomadWild.tradeWith(village, offerKcal) -> {kcal, note}
//   - Game.nomadWild.fightVillage(village) -> {won, note, kcal, duels[]}
//   - Game.nomadWild.villageEncounter(village) -> {village, mood, actions[]}
//     : stage the meeting; actions gated by mood (hostile -> fight/leave)
//   - Game.nomadWild.joinVillage(village, days) -> {note}
//   - Game.nomadWild.travelEvent() -> {kind, note} : 1 beat on departure
//   - Game.nomadWild.legWaveLevel() -> current unlocked wave (waves run everywhere)
//   - Game.nomadWild.partyForage() / .legTick() : called from nomad.daily()
//     (the canonical daily, hooked into endDay); .daily() is the standalone
//     composition for tests (sibling present: delegates to nomad.daily())
// rules:
//   - stranger_penalty: on a leg the party forages blind — unknown-region
//     plants yield at 0.65x and the party cannot target good patches (code:
//     partyForage; WORLD-REGIONS.md §6 "forage what you don't know").
//   - knowledge_grows: each leg forage day can teach one leg-region plant
//     per member (code: partyForage; same learning curve as home).
//   - village_people: leg villages are people with names, moods and pantry,
//     never spreadsheets (code: genLegVillage; CANON.md villager parity).
//   - fights_real: village fights resolve through fieldFight blow-by-blow,
//     never an outcome table (code: fightVillage; CANON.md). Duel outcomes
//     are read from the fight record's own outcome (vKill/mFlee = the
//     fighter beat their defender); defenders carry real attack data
//     (named weapons, damage ranges — the village learns the move via
//     villagePatterns); wounds persist onto each fighter's real health; a
//     fallen fighter dies on the road honestly via nomadKill (mantle
//     passes, the road can end). Fighters fight as themselves, never as 'p'.
//   - hostile_gating: a hostile village (-2, e.g. after a raid) attacks on
//     sight — villageEncounter offers only fight/leave, and trade refuses.
//     (code: villageEncounter, tradeWith).
//   - waves_everywhere: the System's show runs on legs — wave unlocks key
//     off day floors + the kill ledger, which the road does not bypass
//     (code: legWaveLevel; WORLD-REGIONS.md §6 "waves still come").
//   - sibling_guarded: every Game.nomad / Game.nomadScenes access is
//     guarded; this module works (degraded) before nomad.js lands.
// consumes:
//   - state.road {active, partyIds, supplies:{food}, legs, legIndex} (nomad.js; stubbed in tests)
//   - Game.nomad.party(), Game.nomad.daily() (nomad.js; guarded)
//   - Game.nomadScenes.sharpenTrail(name) (nomad-scenes; guarded)
//   - Game.say, Game.plantKnownBy, Game.bumpPlantFamiliarity, Game.fieldFight,
//     Game.regionDef, Game.regionVillageNames, Game.unlockedWave (game.js)
(function () {
  'use strict';
  const G = (globalThis.Scattering || {}).Game;
  if (!G) return;

  function warn(msg) { console.warn('[nomad-wild] ' + msg); }

  // ---- sibling guards ----
  function road() {
    const st = G.state || {};
    if (!st.road) st.road = { active: false, partyIds: [], supplies: { food: 0 }, legs: [], legIndex: 0 };
    const r = st.road;
    if (!Array.isArray(r.partyIds)) r.partyIds = [];
    if (!Array.isArray(r.legs)) r.legs = [];
    if (!r.supplies || typeof r.supplies.food !== 'number') r.supplies = { food: 0 };
    if (typeof r.legIndex !== 'number') r.legIndex = 0;
    return r;
  }
  function onRoad() { return !!(road().active); }
  function leg() {
    const r = road();
    return r.legs[r.legIndex] || null;
  }
  function legRegionId() {
    const l = leg();
    return (l && l.regionId) || G.state.region || 'na_eastern_woodlands';
  }
  function partyMembers() {
    // Prefer the sibling's party() (full person objects); fall back to ids.
    try {
      if (G.nomad && typeof G.nomad.party === 'function') {
        const p = G.nomad.party();
        if (Array.isArray(p) && p.length) return p;
      }
    } catch (e) { warn('nomad.party: ' + e.message); }
    const r = road();
    const out = [];
    for (const id of r.partyIds) {
      let vp = null;
      try { vp = G.vpOf ? G.vpOf(id) : null; } catch (e) { warn('vpOf: ' + e.message); }
      if (!vp) {
        const rc = ((G.state.village || {}).rosterChars || {})[id];
        if (rc) vp = rc;
      }
      if (vp) out.push(Object.assign({ vid: id }, vp));
      else out.push({ vid: id, name: 'a companion' });
    }
    return out;
  }
  function say(t) { try { G.say(t); } catch (e) { warn('say: ' + e.message); } }

  // regionPlants(regionId): edible plant ids for the region (data-first).
  function regionPlants(regionId) {
    const all = (G.data && G.data.plants) || [];
    const r = (G.regionDef && G.regionDef(regionId)) || {};
    const tags = new Set([regionId, r.climateFamily, r.continent].filter(Boolean));
    return all.filter(p => {
      const pr = p.regions || [];
      return pr.some(x => tags.has(x));
    }).map(p => p.id);
  }

  const api = {
    // Stranger penalty: on the road the party works blind ground.
    strangerForageMult() { return onRoad() ? 0.75 : 1.0; },

    // partyForage(): the party's daily forage on the leg. Each member's
    // yield scales with what THEY know of THIS region's plants; strangers
    // (know <3) forage at the blind rate and can't target good patches, so
    // the haul is smaller and sometimes inedible. Knowledge grows: a member
    // can learn one leg-region plant per day of handling.
    partyForage() {
      const r = road();
      const members = partyMembers();
      if (!members.length) return { kcal: 0, notes: ['No party walks the road.'] };
      const regionId = legRegionId();
      const rPlants = regionPlants(regionId);
      const notes = [];
      let totalKcal = 0;
      const learned = [];
      for (const m of members) {
        const vid = m.vid;
        let known = 0;
        for (const pid of rPlants) {
          try { if (G.plantKnownBy && G.plantKnownBy(vid, pid)) known++; } catch (e) { warn('plantKnownBy: ' + e.message); }
        }
        const stranger = known < 3;
        // Base: a working forager pulls ~1200 kcal/day in familiar country.
        // Knowledge factor: strangers at 0.5, rising to 1.0 as they learn.
        const knowFrac = rPlants.length ? Math.min(1, known / Math.min(12, rPlants.length)) : 0;
        const kf = stranger ? 0.5 : 0.5 + 0.5 * knowFrac;
        const dayKcal = Math.round(1200 * kf * this.strangerForageMult() * (0.85 + Math.random() * 0.3));
        totalKcal += dayKcal;
        // Handling teaches: one new leg-region plant per member per day.
        if (rPlants.length) {
          const unknown = rPlants.filter(pid => {
            try { return !(G.plantKnownBy && G.plantKnownBy(vid, pid)); } catch (e) { warn('plantKnownBy: ' + e.message); return false; }
          });
          if (unknown.length && Math.random() < 0.6) {
            const pid = unknown[Math.floor(Math.random() * unknown.length)];
            try {
              const plant = (G.data.plants || []).find(p => p.id === pid);
              if (G.bumpPlantFamiliarity) G.bumpPlantFamiliarity(pid, plant);
            } catch (e) { warn('bumpPlantFamiliarity: ' + e.message); }
            learned.push({ who: m.name || vid, pid });
          }
        }
        if (stranger && !m._strangerNoted) {
          m._strangerNoted = true;
          notes.push(`${m.name || 'A companion'} doesn't know this land yet — every green thing is a guess.`);
        }
      }
      r.supplies.food = (r.supplies.food || 0) + totalKcal;
      const n = members.length;
      say(`The party works the strange ground — ${n} foraging, nothing familiar. (+${totalKcal.toLocaleString()} kcal to the packs.)`);
      for (const l of learned.slice(0, 2)) {
        const pname = (G.plantCalledName && G.plantKnown(l.pid)) ? G.plantCalledName(l.pid) : 'a new green thing';
        say(`${l.who} turns a leaf over twice. "This one, I think — ${pname}." (handling teaches)`);
      }
      return { kcal: totalKcal, notes };
    },

    // genLegVillage(regionId): one foreign village on the leg map. People
    // with names, a mood, a pantry, and knowledge of THEIR land — a living
    // place the party can trade with, fight, or rest at briefly.
    genLegVillage(regionId) {
      regionId = regionId || legRegionId();
      let names = ['Emberhold', 'Stonebridge', 'Thornfield', 'Ashford'];
      try {
        const rn = G.regionVillageNames && G.regionVillageNames();
        if (rn && rn.length) names = rn;
      } catch (e) { warn('regionVillageNames: ' + e.message); }
      const l = leg() || {};
      if (l.village) return l.village;
      const v = {
        id: 'leg_village_' + (road().legIndex || 0),
        name: names[Math.floor(Math.random() * names.length)],
        regionId,
        population: 6 + Math.floor(Math.random() * 5), // 6-10
        pantryKcal: 12000 + Math.floor(Math.random() * 8000),
        mood: 0, // -2 hostile .. 2 warm; starts wary
        met: false,
        joinedDays: 0,
        // A face for the village: the first person the party meets.
        speaker: null,
      };
      try {
        const firsts = ['Ash', 'Bramble', 'Cinder', 'Dove', 'Flint', 'Hazel', 'Ivy', 'Juniper', 'Kestrel', 'Lark'];
        v.speaker = {
          name: firsts[Math.floor(Math.random() * firsts.length)],
          role: ['hunter', 'forager', 'elder', 'cook'][Math.floor(Math.random() * 4)],
        };
      } catch (e) { warn('speaker: ' + e.message); v.speaker = { name: 'Ash', role: 'elder' }; }
      l.village = v;
      return v;
    },

    villageMood(v) {
      if (!v) return 0;
      return Math.max(-2, Math.min(2, v.mood || 0));
    },

    // Trade: the party offers pack food; the village answers in kind.
    // Rate moves with mood: wary villages drive a hard bargain, warm ones
    // are generous — and sometimes share knowledge, which is worth more
    // than calories. No silent trades: every exchange narrates.
    tradeWith(village, offerKcal) {
      const r = road();
      if (!village) return { kcal: 0, note: 'No one to trade with.' };
      if (this.villageMood(village) <= -2) {
        const sp0 = village.speaker || { name: 'Someone' };
        say(`${sp0.name} doesn't answer. ${village.name} would rather bleed than barter with you.`);
        return { kcal: 0, note: 'hostile' };
      }
      offerKcal = Math.max(0, Math.floor(offerKcal || 0));
      if (offerKcal <= 0) return { kcal: 0, note: 'You hold out empty hands. Nothing to trade.' };
      if (((r.supplies && r.supplies.food) || 0) < offerKcal) {
        say(`You haven't got ${offerKcal.toLocaleString()} kcal to trade — the packs hold ${((r.supplies && r.supplies.food) || 0).toLocaleString()}.`);
        return { kcal: 0, note: 'insufficient supplies' };
      }
      const mood = this.villageMood(village);
      // Rate: wary 0.8, neutral 1.0, warm 1.2 — plus their pantry must hold it.
      const rate = [0.6, 0.8, 1.0, 1.2, 1.4][mood + 2];
      let give = Math.round(offerKcal * rate);
      give = Math.min(give, village.pantryKcal || 0);
      if (give <= 0) {
        say(`${village.speaker.name} spreads empty hands. "${village.name} has nothing to spare, traveler. The land's been lean."`);
        return { kcal: 0, note: 'village pantry empty' };
      }
      r.supplies.food -= offerKcal;
      village.pantryKcal -= give;
      r.supplies.food += give;
      village.mood = Math.max(-2, Math.min(2, (village.mood || 0) + (offerKcal >= 2000 ? 1 : 0)));
      village.met = true;
      const sp = village.speaker;
      const lines = {
        '-2': `"Take it and go." ${sp.name} doesn't meet your eyes.`,
        '-1': `"Fair's fair." ${sp.name} counts twice.`,
        '0': `"Done." ${sp.name} nods, once.`,
        '1': `"Good eating to you." ${sp.name} almost smiles.`,
        '2': `"For the road — take extra." ${sp.name} presses a little more into your hands.`,
      };
      say(`You trade ${offerKcal.toLocaleString()} kcal of pack food for ${give.toLocaleString()} kcal of ${village.name} stores. ${lines[String(mood)] || ''}`);
      // Warm villages sometimes share what they know — knowledge is the
      // real trade good on the road.
      if (mood >= 1 && Math.random() < 0.5) {
        const rPlants = regionPlants(village.regionId || legRegionId());
        const members = partyMembers();
        const taught = [];
        for (const pid of rPlants) {
          let someone = null;
          for (const m of members) {
            try { if (G.plantKnownBy && !G.plantKnownBy(m.vid, pid)) { someone = m; break; } } catch (e) { warn('plantKnownBy: ' + e.message); }
          }
          if (someone) { taught.push({ who: someone, pid }); break; }
        }
        if (taught.length) {
          const t0 = taught[0];
          try {
            const plant = (G.data.plants || []).find(p => p.id === t0.pid);
            if (G.bumpPlantFamiliarity) { for (let i = 0; i < 5; i++) G.bumpPlantFamiliarity(t0.pid, plant); }
          } catch (e) { warn('bumpPlantFamiliarity: ' + e.message); }
          const pname = (G.plantCalledName && G.plantKnown(t0.pid)) ? G.plantCalledName(t0.pid) : 'a local plant';
          say(`${sp.name} the ${sp.role} walks ${t0.who.name || 'your companion'} to a patch. "This one. Eat the root, not the leaf — the leaf'll sit wrong." (${pname} taught)`);
          return { kcal: give - offerKcal, note: 'trade + knowledge', taught: t0.pid };
        }
      }
      return { kcal: give - offerKcal, note: 'trade' };
    },

    // Fight: a real blow-by-blow fight through fieldFight — the party's
    // fighters against the village's defenders, one duel at a time. Duel
    // outcomes come from the fight record itself (vKill/mFlee = the fighter
    // beat their defender; vFlee = driven off; vDie = the fighter falls) —
    // never a property the record doesn't carry, never an outcome table.
    // Wounds persist onto each fighter's real health; a fallen fighter dies
    // on the road honestly (nomadKill — the mantle passes, the road can
    // end). Defenders are people with real tools, and fieldFight resolves
    // the duel with that attack data.
    fightVillage(village) {
      const r = road();
      if (!village) return { won: false, note: 'No one to fight.' };
      const members = partyMembers();
      if (!members.length) return { won: false, note: 'No party to fight with.' };
      if (typeof G.fieldFight !== 'function') {
        warn('fieldFight missing — cannot fight honestly');
        return { won: false, note: 'fight unavailable' };
      }
      // The village fields defenders: fewer than population, and they know
      // their ground. The party fields whoever can stand.
      const defenders = Math.max(2, Math.min(6, Math.floor((village.population || 8) / 2)));
      const fighters = members.slice(0, Math.max(1, Math.min(4, members.length)));
      say(`${village.name} doesn't run. ${defenders} of them pick up what they have — and neither do you.`);
      // Defender loadout: real people, real tools. fieldFight acts with
      // this attack data (name, damage) — and the village learns the move
      // (villagePatterns), the way it learns any monster's.
      const arms = [
        { name: 'hunting spear', damage: [6, 12] },
        { name: 'heavy club', damage: [8, 14] },
        { name: 'skinning knife', damage: [4, 9] },
      ];
      let won = 0, fought = 0;
      const duels = [];
      for (const f of fighters) {
        fought++;
        const vid = f.id || f.vid; // fighters fight as themselves, never as 'p'
        const arm = arms[Math.floor(Math.random() * arms.length)];
        const mdef = {
          id: 'leg_defender', name: village.name + ' defender',
          hp: [50, 70], maxHp: 70, wave: 1, speed: 3, behavior: 'territorial',
          attack: { name: arm.name, damage: arm.damage },
        };
        const m = { id: 'leg_defender_' + fought };
        let rec = null;
        try { rec = G.fieldFight(vid || 'p', mdef, m, {}); } catch (e) { warn('fieldFight: ' + e.message); }
        const out = rec && rec.outcome;
        // Wounds persist: the fighter's real health carries exactly what
        // the rounds did — fieldFight returns the record, it never writes.
        try {
          const vv = (G.state && G.state.village) || {};
          vv.health = vv.health || {};
          if (vid && rec && typeof rec.vHpLeft === 'number') vv.health[vid] = Math.max(0, Math.round(rec.vHpLeft));
        } catch (e) { warn('persist wounds: ' + e.message); }
        duels.push({ who: f.name || vid, outcome: out, rounds: rec ? rec.rounds : 0, taken: rec ? rec.vTaken : 0 });
        if (out === 'vKill' || out === 'mFlee') { won++; continue; }
        if (out === 'vDie' && vid) {
          // The fighter falls: an honest road death. The mantle passes in
          // the party; an empty party ends the road.
          try {
            if (G.nomad && typeof G.nomad.nomadKill === 'function') G.nomad.nomadKill(vid, 'fell raiding ' + village.name);
          } catch (e) { warn('nomadKill: ' + e.message); }
        }
        break; // the line breaks when a fighter falls or is driven off
      }
      const partyWon = won === fought && fought > 0;
      if (partyWon) {
        const take = Math.min(village.pantryKcal || 0, 4000 + Math.floor(Math.random() * 4000));
        village.pantryKcal = Math.max(0, (village.pantryKcal || 0) - take);
        r.supplies.food = ((r.supplies && r.supplies.food) || 0) + take;
        village.mood = -2;
        village.met = true;
        try {
          if (G.state && G.state.moralLedger) { G.state.moralLedger.raids = (G.state.moralLedger.raids || 0) + 1; }
        } catch (e) { warn('moralLedger: ' + e.message); }
        say(`It's over. ${village.name} yields — you take ${take.toLocaleString()} kcal and leave them staring. Somewhere, someone will hear how you came to ${village.name}.`);
        return { won: true, note: 'raid', kcal: take, duels };
      }
      const lost = Math.round(((r.supplies && r.supplies.food) || 0) * 0.25);
      r.supplies.food = Math.max(0, ((r.supplies && r.supplies.food) || 0) - lost);
      village.mood = -2;
      village.met = true;
      say(`They drive you off. You leave ${lost.toLocaleString()} kcal of dropped packs in the dirt behind you — and ${village.name} will remember your faces.`);
      return { won: false, note: 'driven off', kcal: -lost, duels };
    },

    // villageEncounter(village): stage the meeting with a foreign village —
    // the single call point for the encounter. Returns {village, mood,
    // actions}: the honest menu of what the party can do here, gated by
    // mood. Wary villages will trade, host, or can be fought; a hostile
    // village (-2, e.g. after a raid) attacks on sight — the party's
    // choices are fight or leave. The road UI calls this when the party
    // reaches the village on the leg map.
    villageEncounter(village) {
      const v = village || this.genLegVillage();
      const mood = this.villageMood(v);
      const sp = v.speaker || { name: 'Ash', role: 'elder' };
      if (!v.met) {
        say(`A palisade, smoke, voices — ${v.name}, ${v.population} souls who know this land the way you know yours. ${sp.name} the ${sp.role} comes out to meet you, reading your packs the way you'd read theirs.`);
        v.met = true;
      }
      if (mood <= -2) {
        say(`${sp.name} sees your faces and shouts. They remember what happened at ${v.name} — weapons come up. There's no trade here, no fire. Fight, or walk away.`);
        return { village: v, mood, actions: ['fight', 'leave'] };
      }
      const warmth = mood >= 1 ? 'wary, but willing' : 'wary';
      say(`${v.name} is ${warmth}. You could trade pack food for theirs, ask to rest at their fire a few days — or take what you want, if you're willing to be the people who did that.`);
      return { village: v, mood, actions: ['trade', 'join', 'fight', 'leave'] };
    },
    // Join briefly: rest at their fire for up to a few days. Wounds close,
    // packs refill a little — but strangers wear out welcome, and the days
    // still pass (waves still come). Trust is the currency.
    joinVillage(village, days) {
      const r = road();
      if (!village) return { note: 'No village to join.' };
      days = Math.max(1, Math.min(7, Math.floor(days || 3)));
      const mood = this.villageMood(village);
      if (mood < 0) {
        say(`${village.name} wants nothing to do with you. The fire is closed to you.`);
        return { note: 'refused' };
      }
      const perDay = 1500;
      const need = perDay * days * partyMembers().length;
      const give = Math.min(need, village.pantryKcal || 0);
      village.pantryKcal = Math.max(0, (village.pantryKcal || 0) - give);
      r.supplies.food = ((r.supplies && r.supplies.food) || 0) + give;
      village.joinedDays = (village.joinedDays || 0) + days;
      village.mood = Math.max(-2, Math.min(2, mood - (days > 3 ? 1 : 0)));
      village.met = true;
      say(`You rest ${days} ${days === 1 ? 'day' : 'days'} at ${village.name}'s fire. Wounds close; the packs fill a little (+${give.toLocaleString()} kcal). Strangers wear out welcome — best not linger.`);
      return { note: 'rested', days, kcal: give };
    },

    // travelEvent(): one beat on departure — weather, a stranger on the
    // road, or an alien broadcast. Strangers and broadcasts can sharpen a
    // trail (guarded call into the sibling's nomad-scenes).
    travelEvent() {
      const r = road();
      const roll = Math.random();
      const sharpen = (who) => {
        try {
          if (G.nomadScenes && typeof G.nomadScenes.sharpenTrail === 'function') {
            G.nomadScenes.sharpenTrail(who, 'survivor'); // a stranger on the road
            return true;
          }
        } catch (e) { warn('sharpenTrail: ' + e.message); }
        return false;
      };
      if (roll < 0.35) {
        // Weather.
        const kinds = [
          ['Rain hammers the trail to mud. The party moves slower, hungrier.', -500],
          ['A clear cold dawn. Good walking; the packs feel lighter.', 0],
          ['Heat shimmers off the road. Water discipline, mouths dry.', -800],
          ['Wind carries woodsmoke from somewhere ahead — people, maybe.', 0],
        ];
        const [text, kcal] = kinds[Math.floor(Math.random() * kinds.length)];
        r.supplies.food = Math.max(0, ((r.supplies && r.supplies.food) || 0) + kcal);
        say(text + (kcal ? ` (${kcal.toLocaleString()} kcal)` : ''));
        return { kind: 'weather', note: text };
      } else if (roll < 0.7) {
        // A stranger on the road.
        const kin = ((G.state.world || {}).kin || []).filter(k => !k.found && k.fate === 'scattered');
        const target = kin.length ? kin[Math.floor(Math.random() * kin.length)] : null;
        const line = target
          ? `A traveler shares your fire one night. Talk turns to the lost — "${target.name}, ${target.relation}. Last I heard, ${G.worldRegionName ? G.worldRegionName(target.region) : 'somewhere east'}." The trail sharpens a little.`
          : 'A traveler shares your fire one night. Stories, nothing useful — but the night is less long.';
        say(line);
        if (target) sharpen(target.name);
        return { kind: 'stranger', note: line };
      }
      // An alien broadcast.
      const line = 'The sky talks at dusk — the System, counting. "...NINTH HOUSEHOLD, YOUR TITHE OF ATTENTION IS DUE..." You walk on. Somewhere, the show goes on without you.';
      say(line);
      return { kind: 'broadcast', note: line };
    },

    // Waves run everywhere: unlocks key off day floors + the kill ledger,
    // which the road never bypasses. This returns the current threat so
    // legs (and tests) can see it.
    legWaveLevel() {
      try { return (G.unlockedWave && G.unlockedWave()) || 1; } catch (e) { warn('unlockedWave: ' + e.message); return 1; }
    },

    // legTick(): the non-eating half of a lived day — the joined
    // village's welcome ticks down, and the wave level is reported.
    // Called from nomad.daily() (the canonical daily, hooked into endDay).
    legTick() {
      const out = {};
      const l = leg();
      if (l && l.village && l.village.joinedDays > 0) {
        l.village.joinedDays--;
        if (l.village.joinedDays === 0) say(`Time to move on from ${l.village.name} — welcome's wearing thin.`);
      }
      out.wave = this.legWaveLevel();
      return out;
    },

    // daily(): one lived day on the leg, standalone (tests, debug).
    // Composes the same pieces as the canonical path: forage, then the
    // sibling's nomad.daily() (eating, starvation, mantle), then legTick.
    // Never called from nomad.daily() — that would eat twice.
    daily() {
      const r = road();
      if (!r.active) return { note: 'not on the road' };
      const out = { day: (G.state.scholar && G.state.scholar.day) || 0 };
      let core = null;
      try { core = (G.nomad && G.nomad.daily) ? G.nomad.daily() : null; } catch (e) { warn('nomad.daily: ' + e.message); }
      if (core) {
        Object.assign(out, core); // sibling foraged, ate, starved, passed the mantle
      } else {
        const f = this.partyForage(); // sibling absent: forage only, no upkeep
        out.foraged = f.kcal;
      }
      Object.assign(out, this.legTick());
      return out;
    },
  };

  G.nomadWild = api;
})();
