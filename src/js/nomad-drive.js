// @ontology
// system: nomad-drive
// description: The Long Way Home — the road driver (docs/WORLD-REGIONS.md §6). Plans the departure itinerary, fires reunions after days on a leg, determines fates deterministically, applies outcomes, relocates moved-on kin, closes the road when every scattered kin resolves, stages foreign-village encounters on leg entry, and owns the leave / move-on / settle / village-encounter UI taps.
// provides:
//   - Game.nomadDrive (hooks wrap nomad.start/enterLeg/departLeg/daily and Game.playerDeath, guarded wrap-once)
//   - planLegs()
//   - syncItinerary()
//   - scatteredKinOf(vid)
//   - partySeekers()
//   - releaseGoneSeekers()
//   - fateFor()
//   - maybeReunion()
//   - resolveReunion()
//   - joinCompanion()
//   - closeLegIfDone()
//   - pendingChoice()
//   - changedTap()
//   - chooseReunion()
//   - fightKin()
//   - duelKin()
//   - moveKinOn()
//   - checkAllFound()
//   - leaveTap()
//   - moveOnTap()
//   - settleTap()
//   - stageVillageEncounter(leg) -> encounter|null
//   - pendingVillageEncounter() -> {villageName, moodLabel, actions[]}|null
//   - villageTap(action)
// rules:
//   - itinerary: departure plans one leg per living scattered kin whose region is known; newly sharpened trails join by daily sync (code: planLegs, syncItinerary)
//   - party_kin_legs: the itinerary plans legs for every party villager's known-region scattered kin, not just the bearer's; legs carry kinOwners (kin name -> seeking villager id, null for the bearer's own) (code: planLegs, syncItinerary, scatteredKinOf, partySeekers)
//   - reunion_timing: one reunion per leg per day after 3+ days living there; never a prompt (code: maybeReunion)
//   - deterministic_fate: fate = hash(kinName + worldSeed + moves), alive .5 / changed .2 / dead .15 / moved .15; moved excluded after 2 moves; party members' kin salt the hash with the seeker's id, the bearer's formula unchanged (code: fateFor)
//   - member_perspective: a party member's reunion is their scene (third person, their voice); they decide changed-choices by seeded hash (code: reunionScene, memberDecide; nomad-drive.js applies the outcomes)
//   - hostile_fight: a hostile party-kin reunion the member won't walk away from is a real blow-by-blow fieldFight, seeker vs kin — never an outcome table (code: fightKin)
//   - seeker_gone: a dead or departed seeker's pending kin release; released kin close their legs but never block all-found (code: releaseGoneSeekers)
//   - real_choice: a 'changed' reunion of the BEARER's own kin holds road.pendingChoice open with exactly ask/leave/fight; ask/leave are spoken scenes (nomad-scenes.choiceLines), fight is a real blow-by-blow DUEL (the bearer <redacted> the kin through fieldFight) — vKill changes the road outcome to 'grave', mFlee brings the kin home FORCED ('alive'), vDie/vFlee leave it 'changed' (code: chooseReunion, duelKin, fightKin)
//   - road_default: an unanswered choice auto-resolves to leave at the next tick — never a prompt, deterministic for sims (code: maybeReunion)
//   - moved_on: the kin relocates to a new deterministic region (never the leg's, never the landing); the trail resets to vague (code: moveKinOn)
//   - joined_kin: alive joins the party as a companion (kin: id, road.companions); companions never bear the Codex (code: resolveReunion, nomad.js isCompanion)
//   - all_found: every scattered kin of every living party villager resolved alive/changed/dead closes the road all-found; kin whose region was never learned don't block it (code: checkAllFound)
//   - two_tap: leaving and settling are irrevocable: first tap says the cost, second commits; tap-state only, never saved (code: leaveTap, settleTap)
//   - road_people: entering a leg stages the foreign village on its map; the mood-gated actions stay open as a beat until answered or the party departs (code: stageVillageEncounter, villageTap; hostile -> fight/leave only, nomad-wild.js villageEncounter)
// consumes:
//   - Game.nomad start/addLeg/enterLeg/departLeg/daily/endRoad/markKinFound/party/onRoad/canLeave, state.road (nomad.js)
//   - Game.nomadScenes reunionScene/sharpenTrail (nomad-scenes.js, guarded)
//   - Game.nomadWild travelEvent (nomad-wild.js, guarded)
//   - Game.fieldFight (game.js, guarded; hostile party-kin reunions)
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
  // scatteredKinOf(vid): living scattered kin for any villager — the bearer
  // or a party member. Party members volunteered because they have
  // scattered kin of their own (nomad.js nomadMuster); their trails become
  // legs too (party_kin_legs).
  function scatteredKinOf(vid) {
    try {
      const kin = typeof Game.worldKin === 'function' ? Game.worldKin(vid) : [];
      return kin.filter(k => k.fate === 'scattered' && !k.found);
    } catch (e) { return []; }
  }
  // partySeekers(): villager ids on the road (bearer and volunteers),
  // minus joined-kin companions ('kin:' ids have no kin entries of their own).
  function partySeekerIds() {
    const r = road();
    if (!r) return [];
    return (r.partyIds || []).filter(id => String(id || '').indexOf('kin:') !== 0);
  }
  // legOwner(leg, name): the villager seeking this kin, or null for the
  // bearer's own (legs planned before kinOwners existed read as the bearer's).
  function legOwner(leg, name) {
    const o = leg && leg.kinOwners ? leg.kinOwners[name] : null;
    return o || null;
  }
  // seekerName(id): third-person name for member-perspective narration.
  function seekerName(id) {
    try {
      const rc = ((Game.state.village || {}).rosterChars || {})[id];
      if (rc && rc.name) return rc.name;
    } catch (e) {}
    try {
      const d = (Game.data.villagers || []).find(x => x.id === id);
      if (d && d.name) return d.name;
    } catch (e) {}
    return 'a companion';
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
    // scatteredKinOf(vid): living scattered kin for any villager.
    scatteredKinOf(vid) { return scatteredKinOf(vid); },
    // partySeekers(): villager ids on the road who can have kin legs.
    partySeekers() { return partySeekerIds(); },

    // planLegs(): the departure itinerary — one leg per living scattered kin
    // whose region is known, for the bearer AND every party villager.
    // Called once, wrapped around nomad.start().
    planLegs() {
      const N = Game.nomad;
      if (!N || !N.onRoad()) return 0;
      let n = 0;
      for (const vid of partySeekerIds()) {
        const owner = vid === Game.villagerId ? null : vid;
        for (const k of scatteredKinOf(vid)) {
          if (k.region && regionKnown(k.region) && N.addLeg(k.region, k.name, owner)) n++;
        }
      }
      return n;
    },

    // syncItinerary(): newly sharpened trails join the itinerary. Runs inside
    // the daily tick — knowledge earned mid-road becomes a destination.
    syncItinerary() {
      const N = Game.nomad, r = road();
      if (!N || !r || !r.active) return 0;
      let n = 0;
      for (const vid of partySeekerIds()) {
        const owner = vid === Game.villagerId ? null : vid;
        for (const k of scatteredKinOf(vid)) {
          if (!k.region || !regionKnown(k.region)) continue;
          if (r.legs.some(l => l.status !== 'done' &&
              ((l.kinNames || []).indexOf(k.name) >= 0 || l.kinName === k.name) &&
              legOwner(l, k.name) === owner)) continue;
          if (N.addLeg(k.region, k.name, owner)) {
            n++;
            let rname = k.region;
            try { const d = Game.regionDef(k.region); rname = (d && d.name) || k.region; } catch (e) {}
            if (owner) say(`${seekerName(owner)}'s trail points to ${rname}. It goes on the itinerary.`);
            else say(`The trail points to ${rname}. You mark it on the itinerary.`);
          }
        }
      }
      return n;
    },

    // releaseGoneSeekers(): a seeker who died or walked away (stayed with a
    // found kin's village) can't be reunited with their other kin. Their
    // pending kin release — the trail goes with them — so legs can close and
    // the road never waits on the dead. Runs inside the daily tick.
    releaseGoneSeekers() {
      const r = road();
      if (!r || !r.active) return 0;
      const seekers = {};
      for (const id of partySeekerIds()) seekers[id] = true;
      let n = 0;
      for (const l of r.legs) {
        const names = l.kinNames && l.kinNames.length ? l.kinNames
          : (l.kinName ? [l.kinName] : []);
        l.resolvedKin = l.resolvedKin || {};
        for (const nm of names) {
          if (l.resolvedKin[nm]) continue;
          const owner = legOwner(l, nm);
          if (owner && !seekers[owner]) {
            l.resolvedKin[nm] = 'released';
            n++;
            say(`No one walks ${seekerName(owner)}'s trail now. It goes quiet with them.`);
          }
        }
        if (names.length && names.every(x => l.resolvedKin[x]) && l.status !== 'done') {
          l.status = 'done';
          l.resolved = l.resolvedKin[names[names.length - 1]] || 'released';
        }
      }
      return n;
    },

    // fateFor(name, moves, ownerId): deterministic reunion fate. Weighted
    // alive .5 / changed .2 / dead .15 / moved .15; 'moved' excluded after
    // MAX_MOVES. A party member's kin salts the hash with the seeker's id so
    // two seekers' kin never shadow each other on the same seed; the
    // bearer's formula is byte-identical to before.
    fateFor(name, moves, ownerId) {
      const mv = moves || 0;
      const salt = (ownerId ? 'reunion|' + worldSeed() + '|' + ownerId + '|' + name + '|' + mv
                           : 'reunion|' + worldSeed() + '|' + name + '|' + mv);
      const roll = (hashStr(salt) % 1000) / 1000;
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
      if (r.pendingChoice) {
        // The road default: an unanswered changed-choice walks on at the
        // next tick — honest, deterministic, never a prompt. Headless sims
        // behave exactly like the old road default.
        return this.chooseReunion(r.pendingChoice.kinName, 'leave', { auto: true });
      }
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
    // Whose reunion this is comes from the leg's kinOwners: a party
    // villager's id means THEIR reunion (third person, their voice, their
    // decisions — member_perspective); null — or a seeker who became the
    // bearer mid-road — means the bearer's own.
    resolveReunion(leg, name) {
      const N = Game.nomad, r = road();
      if (!N || !r || !leg || !name) return null;
      leg.resolvedKin = leg.resolvedKin || {};
      const storedOwner = legOwner(leg, name);
      const seeker = (storedOwner && storedOwner !== Game.villagerId) ? storedOwner : null;
      const sname = seeker ? seekerName(seeker) : null;
      const moves = (leg.moves && leg.moves[name]) || 0;
      const fate = this.fateFor(name, moves, seeker);
      let scene = null;
      try {
        if (Game.nomadScenes && typeof Game.nomadScenes.reunionScene === 'function') {
          scene = Game.nomadScenes.reunionScene(name, fate, seeker);
        }
      } catch (e) {}
      let outcome = (scene && scene.outcome) ||
        (fate === 'alive' ? 'joined' : fate === 'dead' ? 'grave' : fate === 'moved' ? 'trail-continues' : 'choice');
      const kin = scatteredKinOf(seeker || Game.villagerId).find(k => k.name === name) || {};
      const relation = kin.relation || null;

      if (outcome === 'joined') {
        if (this.joinCompanion(name, relation)) {
          if (seeker) say(`${name} shoulders a pack, and falls in beside ${sname}.`);
          else say(`${name} shoulders a pack. Four mouths, four pairs of eyes.`);
        }
        N.markKinFound(name, relation, 'alive', seeker);
        leg.resolvedKin[name] = 'alive';
      } else if (outcome === 'grave') {
        N.markKinFound(name, relation, 'dead', seeker);
        leg.resolvedKin[name] = 'dead';
      } else if (outcome === 'choice') {
        if (seeker) {
          // Changed: the scene said the situation honestly. The member already
          // made their call inside the scene (memberDecide); 'choice' here is
          // their trade-and-rest — the party walks on.
          N.markKinFound(name, relation, 'changed', seeker);
          leg.resolvedKin[name] = 'changed';
        } else {
          // Changed: the choice is REAL — three taps (ask/leave/fight),
          // rendered as an open beat in the beats row. The driver holds it
          // open; an unanswered choice auto-resolves to the road default
          // (leave) at the next tick (code: chooseReunion, maybeReunion).
          r.pendingChoice = {
            kinName: name,
            kind: (scene && scene.kind) || 'hostile',
            relation,
            choices: (scene && scene.choices) || [],
            legIndex: r.legIndex,
          };
          outcome = 'choice-pending';
        }
      } else if (outcome === 'stayed') {
        // The seeker stays with their kin's village. They leave the party;
        // their other pending kin release on the next daily reconcile.
        N.markKinFound(name, relation, 'changed', seeker);
        leg.resolvedKin[name] = 'changed';
        if (seeker) {
          const ix = r.partyIds.indexOf(seeker);
          if (ix >= 0) r.partyIds.splice(ix, 1);
          log(`${sname} stayed with ${name}'s village; the party walks on without them.`);
          say(`The party is one smaller. The road doesn't comment; it just keeps going.`);
        }
      } else if (outcome === 'fight') {
        // The member wouldn't walk away: a real fight, seeker vs kin —
        // one blow-by-blow bout, the bout's real outcome tag, never a table.
        const tag = this.fightKin(seeker, name);
        const fn = String(name).split(' ')[0];
        if (tag === 'vKill') {
          say(`It ends the way these things end. ${fn} is on the ground. ${sname} doesn't celebrate — stands there a long time, then helps dig. The road gave them back, but not the way anyone wanted.`);
          try { const ml = Game.state && Game.state.moralLedger; if (ml) ml.kinKills = (ml.kinKills || 0) + 1; } catch (e) {}
          N.markKinFound(name, relation, 'dead', seeker);
          leg.resolvedKin[name] = 'dead';
        } else if (tag === 'mFlee') {
          say(`${fn} yields — beaten, breathing, done fighting. ${sname} doesn't celebrate. The road gave them back, but not the way anyone wanted.`);
          this.joinCompanion(name, relation);
          N.markKinFound(name, relation, 'changed', seeker);
          leg.resolvedKin[name] = 'changed';
        } else if (tag === 'vDie') {
          say(`${sname} goes down and doesn't get up. ${fn} stares at their hands like they belong to someone else — then runs, and keeps running.`);
          try { if (N.nomadKill) N.nomadKill(seeker, 'the fight for ' + name); } catch (e) {}
          N.markKinFound(name, relation, 'changed', seeker);
          leg.resolvedKin[name] = 'changed';
        } else if (tag === 'no-fight') {
          say(`${sname} thinks better of it — some fights aren't worth starting. The party walks on.`);
          N.markKinFound(name, relation, 'changed', seeker);
          leg.resolvedKin[name] = 'changed';
        } else {
          // vFlee / evade: the seeker yields. Bloodied, lighter.
          const lost = Math.round(((r.supplies && r.supplies.food) || 0) * 0.15);
          r.supplies.food = Math.max(0, ((r.supplies && r.supplies.food) || 0) - lost);
          say(`${sname} yields — steps back with hands open. ${fn} doesn't follow. The party walks on, slower now.`);
          N.markKinFound(name, relation, 'changed', seeker);
          leg.resolvedKin[name] = 'changed';
        }
      } else if (outcome === 'trail-continues') {
        this.moveKinOn(name, leg, seeker);
        leg.resolvedKin[name] = 'moved';
      } else {
        leg.resolvedKin[name] = fate;
      }
      // The leg closes when every kin on it has resolved.
      this.closeLegIfDone(leg, fate);
      this.checkAllFound();
      return { fate, outcome };
    },

    // joinCompanion(name, relation): the found kin walks with the party as a
    // companion ('kin:' id) — eats and dies like anyone, never bears the Codex.
    joinCompanion(name, relation) {
      const N = Game.nomad, r = road();
      if (!N || !r) return false;
      const party = N.party ? N.party() : [];
      if (party.length >= 4) {
        say(`There's no room in the party's packs for another mouth — ${name} walks alongside anyway, sharing fire but not stores.`);
        return false;
      }
      const cid = 'kin:' + String(name).replace(/[^a-zA-Z0-9]+/g, '_');
      r.companions = r.companions || {};
      if (!r.companions[cid]) r.companions[cid] = { name, relation };
      if (r.partyIds.indexOf(cid) < 0) r.partyIds.push(cid);
      return true;
    },

    // fightKin(fighterId, name, opts): a 'changed' reunion come to blows —
    // bearer <redacted> or seeker vs their kin. One real blow-by-blow bout through
    // fieldFight with the kin's real attack kit — never an outcome table.
    // Reads rec.outcome (the engine's real record), never phantom fields.
    // Returns the bout's outcome tag: 'vKill' | 'mFlee' | 'vDie' | 'vFlee' |
    // 'evade' | 'no-fight'. Callers map tags to road outcomes.
    // opts.rng seeds the fight (proofs); the live path passes none.
    fightKin(fighterId, name, opts) {
      opts = opts || {};
      if (typeof Game.fieldFight !== 'function') return 'no-fight';
      // The kin: a person, not a monster — dangerous and desperate, with a
      // real attack kit (fieldFights honors mdef.attacks verbatim). A duel
      // against a desperate person is a genuine fight, not a boss — and not
      // a formality either.
      const mdef = {
        id: 'kin_fighter', name: name, hp: [50, 50], maxHp: 50,
        speed: 3, wave: 1,
        attacks: [
          { name: 'wild swing', damage: [7, 12] },
          { name: 'knife slash', damage: [9, 14], weight: 2 },
          { name: 'desperate lunge', damage: [11, 17], weight: 1, condition: { hpBelow: 0.5 } },
        ],
      };
      const m = { id: 'kin_' + String(name).replace(/[^a-zA-Z0-9]+/g, '_'), hp: 50, maxHp: 50 };
      let rec = null;
      try { rec = Game.fieldFight(fighterId || 'p', mdef, m, { rng: opts.rng }); } catch (e) { return 'no-fight'; }
      if (!rec) return 'no-fight';
      const o = rec.outcome;
      if (o === 'vKill' || (typeof rec.mHpLeft === 'number' && rec.mHpLeft <= 0)) return 'vKill';
      if (o === 'vDie') return 'vDie';
      if (o === 'mFlee') return 'mFlee';
      if (o === 'vFlee') return 'vFlee';
      return 'evade';
    },

    // closeLegIfDone(leg, fallback): the leg closes when every kin on it
    // has resolved; the leg's resolution is the last kin's.
    closeLegIfDone(leg, fallback) {
      if (!leg) return false;
      const names = leg.kinNames && leg.kinNames.length ? leg.kinNames
        : (leg.kinName ? [leg.kinName] : []);
      if (names.length && names.every(n => leg.resolvedKin && leg.resolvedKin[n])) {
        leg.status = 'done';
        leg.resolved = leg.resolvedKin[names[names.length - 1]] || fallback || leg.resolved;
        return true;
      }
      return false;
    },

    // pendingChoice(): the open changed-reunion choice, if any — rendered
    // as an open beat (app.js beats row) with three taps.
    pendingChoice() {
      const r = road();
      if (!r || !r.active) return null;
      return r.pendingChoice || null;
    },

    // changedTap(choiceId): the UI tap — resolves the pending choice.
    changedTap(choiceId) {
      const pc = this.pendingChoice();
      if (!pc) return null;
      return this.chooseReunion(pc.kinName, choiceId);
    },

    // chooseReunion(name, choiceId, opts): resolve a 'changed' reunion's
    // three choices. ask/leave are spoken scenes (nomad-scenes.js owns the
    // words); fight is a REAL blow-by-blow fight (Game.fieldFight) whose
    // outcome changes the road outcome — never an outcome table.
    // opts.rng seeds the fight (proofs); the live path passes none.
    chooseReunion(name, choiceId, opts) {
      const N = Game.nomad, r = road();
      const pc = r && r.pendingChoice;
      if (!N || !r || !r.active || !pc || pc.kinName !== name) return null;
      const id = (choiceId === 'ask' || choiceId === 'fight') ? choiceId : 'leave';
      const kind = pc.kind || 'hostile';
      const relation = pc.relation || null;
      r.pendingChoice = null;
      const leg = (pc.legIndex != null && r.legs[pc.legIndex]) || r.legs[r.legIndex] || null;
      if (id === 'fight') return this.duelKin(name, kind, leg, relation, opts);
      // ask / leave: spoken scenes.
      let lines = [];
      try {
        if (Game.nomadScenes && typeof Game.nomadScenes.choiceLines === 'function')
          lines = Game.nomadScenes.choiceLines(kind, id, name) || [];
      } catch (e) {}
      if (!lines.length) lines = [id === 'ask'
        ? 'You ask. The answer is longer than the road has time for, and shorter than you feared.'
        : 'You walk on. The road doesn\'t hurry you; it knows what this costs.'];
      for (const l of lines) say(l);
      if (id === 'ask' && kind === 'leads') {
        // A village leader sends the party off with a pack — the trade
        // content folded into the asking, honest and unsolicited.
        N.addFood(1500);
        say('A pack of their stores comes with you — 1,500 kcal of somebody else\'s winter. You carry it gently.');
      }
      N.markKinFound(name, relation, 'changed');
      if (leg) {
        leg.resolvedKin = leg.resolvedKin || {};
        leg.resolvedKin[name] = 'changed';
        this.closeLegIfDone(leg, 'changed');
      }
      this.checkAllFound();
      return { fate: 'changed', outcome: 'changed', choice: id, auto: !!(opts && opts.auto) };
    },

    // duelKin(name, kind, leg, relation, opts): the FIGHT choice — a DUEL.
    // The bearer <redacted> up alone against their kin (it's personal); the rest
    // of the party is there to run the kin down if they break. One real
    // blow-by-blow bout through fightKin — never an outcome table. The result
    // changes the road outcome:
    //   - vKill: the kin dies -> 'grave' (dark; the ledger remembers).
    //   - mFlee: the kin breaks; the party runs them down and brings them
    //     home FORCED -> 'alive' as a companion (forced: true). A reunion,
    //     but not the one anyone walked all this way for.
    //   - vDie: the bearer <redacted> -> nomadKill (the mantle stays in the
    //     party); the kin flees in horror -> 'changed'.
    //   - vFlee/evade: the bearer <redacted> down -> 'changed', bloodied, and
    //     lighter in the packs.
    // opts.rng seeds the fight (proofs); the live path passes none.
    duelKin(name, kind, leg, relation, opts) {
      const N = Game.nomad, r = road();
      opts = opts || {};
      const resolve = (fate, tag, extra) => {
        N.markKinFound(name, relation, fate);
        if (leg) {
          leg.resolvedKin = leg.resolvedKin || {};
          leg.resolvedKin[name] = fate;
          this.closeLegIfDone(leg, fate);
        }
        this.checkAllFound();
        return Object.assign({ fate: 'changed', outcome: tag, choice: 'fight' }, extra || {});
      };
      const fn = String(name).split(' ')[0];
      if (typeof Game.fieldFight !== 'function') {
        say('There is a fight in this — but the road refuses to stage it. You walk on instead.');
        return resolve('changed', 'changed');
      }
      const party = (N.party ? N.party() : []) || [];
      const champ = party.find(p => p.id === r.bearerId) || party[0];
      if (!champ) {
        say('No one in the party can stand. You back away — the fight stays hypothetical.');
        return resolve('changed', 'changed');
      }
      const cn = String(champ.name || 'you').split(' ')[0];
      say(fn + ' sees ' + cn + ' step forward alone, and understands. No System theatrics — blow by blow, the way all real fights are.');
      // The kin: a person, not a monster — dangerous and desperate, with a
      // real attack kit (fieldFights honors mdef.attacks verbatim). A duel
      // against a desperate person is a genuine fight, not a boss — and not
      // a formality either.

      const tag = this.fightKin(champ.id || 'p', name, opts);
      if (!tag || tag === 'no-fight') return resolve('changed', 'changed');
      const o = tag;
      if (o === 'vKill') {
        say('It ends the way these things end. ' + fn + ' is on the ground, and the road is suddenly, obscenely quiet.');
        say('You bury them properly — stones piled, the name spelled right. The party doesn\'t speak for a long time. Some victories are just losses wearing better clothes.');
        try {
          const ml = Game.state && Game.state.moralLedger;
          if (ml) ml.kinKills = (ml.kinKills || 0) + 1;
        } catch (e) {}
        return resolve('dead', 'grave');
      }
      if (o === 'vDie') {
        // The bearer fell. The road keeps what it takes; the mantle stays
        // in the party. The kin looks at what they've done — and runs.
        const fname = champ.name || 'the bearer';
        try { if (N.nomadKill) N.nomadKill(champ.id, 'the fight for ' + name); } catch (e) {}
        say(fname + ' goes down and doesn\'t get up. ' + fn + ' stares at their hands like they belong to someone else — then runs, and keeps running.');
        if (!r.active) return { fate: 'changed', outcome: 'wiped', choice: 'fight' };
        return resolve('changed', 'changed');
      }
      if (o === 'mFlee') {
        // The kin breaks — and the party is four pairs of legs against one.
        // They run them down and bring them home. A reunion, forced: not the
        // one anyone walked all this way for. Desperate and traumatic — and
        // the road will have to live with it.
        const cid = 'kin:' + String(name).replace(/[^a-zA-Z0-9]+/g, '_');
        r.companions = r.companions || {};
        r.companions[cid] = { name, relation, forced: true };
        if (r.partyIds.indexOf(cid) < 0) r.partyIds.push(cid);
        say(fn + ' breaks and runs — and the party is four pairs of legs against one. They run ' + fn + ' down by the creek and bring them back, not gently.');
        say('\'' + fn + ',\' ' + cn + ' says, breathing hard, \'you\'re coming home.\' It isn\'t a question. The road just got heavier, and nobody pretends otherwise.');
        return resolve('alive', 'joined-forced');
      }
      // vFlee / evade / judges: the bearer backs down. Bloodied, lighter.
      const lost = Math.round(((r.supplies && r.supplies.food) || 0) * 0.25);
      r.supplies.food = Math.max(0, ((r.supplies && r.supplies.food) || 0) - lost);
      say(cn + ' yields — steps back with hands open. ' + fn + ' doesn\'t follow. Some fights you walk into; this one you walk out of.');
      say('You leave ' + lost.toLocaleString() + ' kcal of dropped packs in the dirt. The road keeps the secret, and you keep walking — slower now.');
      return resolve('changed', 'changed');
    },

    // moveKinOn(name, leg): the kin moved on. They relocate to a new
    // deterministic region (never this leg's, never the landing); the trail
    // resets to vague and must be re-sharpened; the itinerary syncs when it
    // is. A party member's kin salts the relocation with the seeker's id and
    // narrows the world entry to their kin; the bearer's formula is unchanged.
    moveKinOn(name, leg, ownerId) {
      const pool = regionPool().filter(id => id !== leg.regionId);
      if (!pool.length) return false;
      leg.moves = leg.moves || {};
      const moves = (leg.moves[name] || 0) + 1;
      const salt = ownerId ? 'moved|' + worldSeed() + '|' + ownerId + '|' + name + '|' + moves
                          : 'moved|' + worldSeed() + '|' + name + '|' + moves;
      const pick = pool[hashStr(salt) % pool.length];
      try {
        const st = Game.state;
        const entry = ((st.world || {}).kin || []).find(k => k.name === name && k.fate === 'scattered' &&
          (!ownerId || k.owner === ownerId));
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

    // checkAllFound(): every scattered kin of every living party villager —
    // bearer and volunteers alike — resolved alive/changed/dead closes the
    // road 'all-found' ("every scattered kin resolved" is the cleanest
    // rule). Moved-on kin resolve when a later leg catches them. Kin whose
    // region was never learned don't block it — the road can only walk
    // trails it has; settling is always available.
    checkAllFound() {
      const N = Game.nomad, r = road();
      if (!N || !r || !r.active) return false;
      const all = [];
      for (const vid of partySeekerIds()) {
        const owner = vid === Game.villagerId ? null : vid;
        for (const k of scatteredKinOf(vid)) all.push({ kin: k, owner });
      }
      if (!all.length) return false;
      const resolved = {};
      for (const l of r.legs) {
        const rk = l.resolvedKin || {};
        for (const n of Object.keys(rk)) {
          if (rk[n] !== 'moved') resolved[n + '|' + (legOwner(l, n) || '')] = true;
        }
        if (l.kinName && l.resolved && l.resolved !== 'moved') {
          resolved[l.kinName + '|' + (legOwner(l, l.kinName) || '')] = true;
        }
      }
      const pending = all.filter(({ kin, owner }) => {
        if (resolved[kin.name + '|' + (owner || '')]) return false;
        if (!kin.region || !regionKnown(kin.region)) return false;
        return true;
      });
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

    // ---- foreign-village encounters (the road's people, wired 2026-10-15) ----

    // stageVillageEncounter(leg): when the party reaches the village on the
    // leg map, the meeting is staged through nomad-wild's single call point
    // (villageEncounter) and held open on the leg until the player answers
    // it (trade / rest / fight / walk away) or departs the leg.
    stageVillageEncounter(leg) {
      const r = road();
      if (!r || !r.active || !leg || leg.encounterOpen) return null;
      const W = Game.nomadWild;
      if (!W || typeof W.villageEncounter !== 'function') return null;
      const v = (typeof W.genLegVillage === 'function') ? W.genLegVillage(leg.regionId) : null;
      const enc = W.villageEncounter(v || undefined);
      if (!enc || !Array.isArray(enc.actions)) return null;
      leg.encounterOpen = { village: enc.village || v, mood: enc.mood, actions: enc.actions.slice() };
      return leg.encounterOpen;
    },

    // pendingVillageEncounter(): the open encounter, in beat shape for the
    // road UI — village name, an honest mood label, the gated actions.
    pendingVillageEncounter() {
      const r = road();
      if (!r || !r.active) return null;
      const leg = r.legs[r.legIndex];
      const open = leg && leg.encounterOpen;
      if (!open || !open.actions || !open.actions.length) return null;
      const labels = { '-2': 'hostile', '-1': 'cold', '0': 'wary', '1': 'warming', '2': 'warm' };
      return {
        villageName: (open.village && open.village.name) || 'A village',
        moodLabel: labels[String(open.mood)] || 'wary',
        actions: open.actions.slice(),
      };
    },

    // villageTap(action): answer the open encounter. FIGHT routes into
    // fightVillage (real blow-by-blow combat); TRADE and JOIN reuse
    // nomad-wild's trade/rest beats honestly; LEAVE walks away for free.
    villageTap(action) {
      const N = Game.nomad, r = road();
      if (!N || !r || !r.active) return;
      const leg = r.legs[r.legIndex];
      const open = leg && leg.encounterOpen;
      if (!open) { say('The moment has passed — the road moves on.'); return; }
      const W = Game.nomadWild;
      if (!W) return;
      const v = open.village || {};
      const close = () => { leg.encounterOpen = null; };
      if (action === 'trade') {
        if (open.actions.indexOf('trade') < 0) {
          const sp = (v.speaker && v.speaker.name) || 'Someone';
          say(`${sp} doesn't answer. ${v.name || 'The village'} would rather bleed than barter with you.`);
          close();
          return;
        }
        // A standard offer: 1,000 kcal of pack food. tradeWith narrates
        // the bargain (or the empty hands) itself.
        W.tradeWith(v, 1000);
        close();
      } else if (action === 'join') {
        if (open.actions.indexOf('join') < 0) { close(); return; }
        W.joinVillage(v, 3);
        close();
      } else if (action === 'fight') {
        W.fightVillage(v);
        close();
      } else if (action === 'leave') {
        say(`You lift a hand to ${v.name || 'the village'} and walk on. Some doors stay closed; the road doesn't mind.`);
        close();
      }
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
            // The road has people: stage the foreign village on the leg map.
            try { drive.stageVillageEncounter(leg); } catch (e2) {}
          } catch (e) {}
        }
        return ok;
      };
      wrapped._driveWrapped = true;
      N.enterLeg = wrapped;
    } catch (e) {}
  }

  // Walking past a village forfeits the meeting: the open encounter is
  // cleared (with a quiet line) when the party departs the leg.
  function wrapDepartLeg() {
    try {
      const N = Game.nomad;
      if (!N || N.departLeg._driveWrapped) return;
      const _dep = N.departLeg.bind(N);
      const wrapped = function () {
        try {
          const r = road();
          const leg = r && r.legs[r.legIndex];
          if (leg && leg.encounterOpen) {
            const vn = (leg.encounterOpen.village && leg.encounterOpen.village.name) || 'the village';
            say(`You walk past ${vn} without stopping — the chance goes with the dust.`);
            leg.encounterOpen = null;
          }
        } catch (e) {}
        return _dep();
      };
      wrapped._driveWrapped = true;
      N.departLeg = wrapped;
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
            drive.releaseGoneSeekers();
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
  wrapDepartLeg();
  wrapDaily();
  wrapPlayerDeath();

  Game.nomadDrive = drive;
})();
