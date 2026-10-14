// @ontology
// system: trial-deeds
// description: Trial deed grants — unlock.type === 'trial' abilities are the
//   player's deed-earned System grants. The data names the trial (win_a_fight,
//   intimidate_someone, hear_10_rumors, stop_a_fight, discover_5_locations,
//   catch_3_lies, take_50_damage_in_one_fight); two data-declared trials have
//   only detail strings, mapped here to honest deed sites (hunger_trial ->
//   iron_stomach = survive 3 unsafe meals; blood_trial -> adrenaline_surge =
//   end a fight at <=25% HP). This mirrors the villager deed-XP grant path
//   (villagerGainXP / NPC_ABILITY_KITS, Steve 2026-10-09): the System watches
//   real deeds and grants — never RNG, never a menu. Deeds accrue from day
//   one; grants wait for the System's arrival (day 7), like the villager kits.
// provides:
//   - trialGrantFor(trialKey) -> ability def or null
//   - noteTrialDeed(trialKey, n) -> counts the deed, fires the grant at threshold
//   - trialDeedGrant(trialKey) -> granted id or null (idempotent, slot-honest)
//   - checkPendingTrialDeeds() -> fires grants for deeds done before arrival
// consumes:
//   - game.data.abilities (unlock.type === 'trial')
//   - scholar.trialDeeds (deed counters)
//   - game.hasAbility, game.abilitySlots, game.abilityOnAcquire,
//     game.recomputeActiveSynergies, game.say, game.sysSay, game.tele
// rules:
//   - Six-slot law: full slots = honest refusal copy, never silent, never overflow.
//   - Human skills are never granted — the pool is unlock.type === 'trial',
//     which is alien-ability-only (same lane as the villager kit grants).
//   - Deterministic: same deeds -> same grants. The data picks the ability;
//     this code never picks randomly.
//   - Longsim abilities r4 2026-10-12 (Steve: figure it out yourself): these
//     9 trial-type abilities were data-declared but had NO player grant path —
//     dead rungs on the unlock ladder. practice-type (stalk, blood_trail,
//     ambush, war_cry, haymaker) and discovery-type (soft_step) grants are
//     wired separately in practice-deeds.js (notePracticeDeed).
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  const methods = {

    // TRIAL_DEED_THRESHOLDS: deed -> count needed before the System grants.
    // The unlock.trial strings are literal from abilities.json ("win_a_fight",
    // "hear_10_rumors" — the numbers are in the names); the two detail-only
    // trials get honest thresholds here, documented above.
    TRIAL_DEED_THRESHOLDS: {
      win_a_fight: 1,
      intimidate_someone: 1,
      hear_10_rumors: 10,
      stop_a_fight: 1,
      discover_5_locations: 5,
      catch_3_lies: 3,
      take_50_damage_in_one_fight: 1, // per-fight accumulator, not a counter
      hunger_trial: 3,  // unsafe meals eaten without poisoning
      blood_trial: 1,   // end a fight at <=25% max HP and alive
    },

    // DETAIL-MAPPED TRIALS (longsim abilities r4): iron_stomach and
    // adrenaline_surge carry unlock.type 'trial' but no unlock.trial key —
    // only the detail strings "Trial of Hunger survived" / "Trial of Blood
    // survived". The deed sites below are the honest reading of those names:
    // the System noticed your gut handling what it shouldn't, and your body
    // surviving a fight that should have killed you.
    TRIAL_DEED_DETAIL_MAP: { hunger_trial: 'iron_stomach', blood_trial: 'adrenaline_surge' },

    // trialGrantFor: the ability the data promises for this trial, or null.
    trialGrantFor(trialKey) {
      try {
        const all = this.data.abilities || [];
        let def = all.find(a => a.unlock && a.unlock.type === 'trial' && a.unlock.trial === trialKey);
        if (!def && this.TRIAL_DEED_DETAIL_MAP[trialKey]) {
          def = all.find(a => a.id === this.TRIAL_DEED_DETAIL_MAP[trialKey]);
        }
        return def || null;
      } catch (e) { return null; }
    },

    // trialDeedGrant: the deed happened enough — the System grants, if it
    // can. Idempotent; honest refusal when slots are full; pre-arrival deeds
    // stay pending (checkPendingTrialDeeds fires them on day 7).
    trialDeedGrant(trialKey) {
      try {
        const s = this.state.scholar;
        if (!s) return null;
        const def = this.trialGrantFor(trialKey);
        if (!def) return null;
        if (this.hasAbility && this.hasAbility(def.id)) return null; // already held
        if (!this.state.systemArrived) return 'pending';
        s.abilities = s.abilities || [];
        const maxSlots = this.abilitySlots ? this.abilitySlots() : 6;
        if (s.abilities.length >= maxSlots) {
          // FULL SLOTS: honest, not silent. The System saw the deed; the gift
          // waits on room (same honesty as the day-7 gift and the purify offer).
          try {
            this.sysSay(`"WE SAW that — ${def.name} was yours. But your slots are full (${s.abilities.length}/${maxSlots}). Make room, or grow the interface, and ask again by DOING it again."`);
          } catch (e) {}
          return null;
        }
        s.abilities.push({ id: def.id, name: def.name, desc: def.description || '', level: 1, xp: 0 });
        try { this.tele('ability_granted', { id: def.id, who: 'player', via: 'trial_deed' }); } catch (e) {}
        // Priced gifts pay their costs, like every other grant path
        // (break-it abilities r5: trial gifts, pact, chooseAbility).
        try { this.abilityOnAcquire(def.id); } catch (e2) {}
        try { this.recomputeActiveSynergies(); } catch (e3) {}
        const deedLine = this.trialDeedLine(trialKey);
        this.say(`◈ TRIAL RECOGNIZED — the System has been watching. ${deedLine}`);
        this.say(`✨ Ability gained: ${def.name} (L1). ${def.description || ''}`);
        try { if (def.flavor) this.say(`"${def.flavor}"`); } catch (e) {}
        return def.id;
      } catch (e) { return null; }
    },

    // trialDeedLine: what the deed was, in the System's voice. Never the
    // method — the player earned the what by doing; the System names the deed.
    trialDeedLine(trialKey) {
      const lines = {
        win_a_fight: 'You WON a fight. Not survived — won. The audience is still standing. So are you.',
        intimidate_someone: 'You stared someone down and they broke. Rude. Effective. We took notes.',
        hear_10_rumors: 'Ten rumors through the fire-smoke. You LISTEN. The village talks — you collect.',
        stop_a_fight: 'You stopped a fight with words. The hard way. The brave way.',
        discover_5_locations: 'Five places walked. The map in your head is getting sharp.',
        catch_3_lies: 'Three lies caught. People lie around you now with more effort.',
        take_50_damage_in_one_fight: 'You took a beating that should have ended you — and kept moving. Noted.',
        hunger_trial: 'Three suspect meals, and your gut handled all of them. Interesting gut. Noted.',
        blood_trial: 'You walked out of that fight on a quarter tank. The blood loss should have won. It didn\'t.',
      };
      return lines[trialKey] || 'The deed was done. We saw.';
    },

    // noteTrialDeed: count the deed; fire the grant when the threshold is met.
    // Per-fight deeds (take_50_damage_in_one_fight, blood_trial) are called
    // with n=1 at the deed moment — no persistent counter needed.
    noteTrialDeed(trialKey, n) {
      try {
        const s = this.state.scholar;
        if (!s) return;
        if (trialKey === 'take_50_damage_in_one_fight' || trialKey === 'blood_trial') {
          this.trialDeedGrant(trialKey);
          return;
        }
        s.trialDeeds = s.trialDeeds || {};
        s.trialDeeds[trialKey] = (s.trialDeeds[trialKey] || 0) + (n || 1);
        const th = (this.TRIAL_DEED_THRESHOLDS || {})[trialKey] || 1;
        if (s.trialDeeds[trialKey] >= th) this.trialDeedGrant(trialKey);
      } catch (e) {}
    },

    // checkPendingTrialDeeds: on System arrival, fire grants for deeds the
    // scholar already crossed pre-arrival (the villager-mirror rule: XP
    // accrues from day one, grants wait for the watcher).
    checkPendingTrialDeeds() {
      try {
        const s = this.state.scholar;
        if (!s || !this.state.systemArrived) return;
        const td = s.trialDeeds || {};
        for (const key of Object.keys(this.TRIAL_DEED_THRESHOLDS || {})) {
          if (key === 'take_50_damage_in_one_fight' || key === 'blood_trial') continue; // per-fight only
          const th = (this.TRIAL_DEED_THRESHOLDS || {})[key] || 1;
          if ((td[key] || 0) >= th) this.trialDeedGrant(key);
        }
      } catch (e) {}
    },
  };

  Object.assign(Game, methods);
})();
