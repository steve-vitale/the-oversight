// @ontology
// system: practice-deeds
// description: Practice deed grants — unlock.type === 'practice' abilities
//   (stalk, blood_trail, ambush, war_cry, haymaker) and the unlock.type ===
//   'discovery' soft_step are the player's deed-earned System grants for
//   "earned through doing". The data names the ability; this module wires the
//   deed sites (longsim abilities r5 2026-10-12, Steve: figure it out
//   yourself). Mirrors trial-deeds.js: deeds accrue from day one, grants wait
//   for the System's arrival (day 7), idempotent, six-slot law holds, priced
//   gifts, synergies recomputed, human skills never granted (alien-only pool).
// provides:
//   - practiceGrantFor(practiceKey) -> ability def or null
//   - notePracticeDeed(practiceKey, n) -> counts the deed, fires the grant at threshold
//   - practiceDeedGrant(practiceKey) -> granted id or null (idempotent, slot-honest)
//   - checkPendingPracticeDeeds() -> fires grants for deeds done before arrival
//   - noteSoftStepTile(detected) -> undetected-tile streak toward soft_step
// consumes:
//   - game.data.abilities (unlock.type === 'practice' / 'discovery')
//   - scholar.practiceDeeds (deed counters), scholar.softStepStreak
//   - game.hasAbility, game.abilitySlots, game.abilityOnAcquire,
//     game.recomputeActiveSynergies, game.say, game.sysSay, game.tele
// rules:
//   - Six-slot law: full slots = honest refusal copy, never silent, never overflow.
//   - Human skills are never granted — the pool is practice/discovery-type
//     alien abilities (same lane as the trial deed grants and villager kits).
//   - Deterministic: same deeds -> same grants. The data picks the ability;
//     this code never picks randomly.
//   - Design calls (documented in evidence/2026-10-12/sim-abilities-r5.md):
//     stalk = 10 quiet stalk-steps that left the animal unalerted (aware <
//     0.5 after the step — the step itself is the practice; a twitchy rabbit
//     notices in 2 steps, a calm deer banks several, the tracker ability
//     stretches it) plus silent kills (aware < 0.5 at the kill — "close
//     distance without being noticed"); blood_trail = 3 kills of an animal
//     that had already bolted this encounter (boltedOnce / chase pstate / 3+
//     encounter beats — "it doesn't get away"); ambush = 2 fights that ended
//     in round 1 with a kill ("strike when it's too late for them"); war_cry
//     = 3 shouts that actually moved a monster (tbPlayerShout n>0 — "things
//     that hear it reconsider"); haymaker = 3 single blows dealing >=50% of
//     a real opponent's max HP (maxHp >= 30, so hummice don't count — "one
//     big swing"); soft_step = the data's literal "traverse 20 tiles
//     undetected" (consecutive tile entries with no monster spawn or
//     wanderer contact).
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  const methods = {

    // PRACTICE_DEED_THRESHOLDS: deed -> count needed before the System grants.
    PRACTICE_DEED_THRESHOLDS: {
      stalk: 10,       // quiet stalk-steps that left the animal unalerted (+ silent kills)
      blood_trail: 3,  // chased-down kills: it ran, it didn't get away
      ambush: 2,       // round-1 fight wins with a kill
      war_cry: 3,      // shouts that moved something
      haymaker: 3,     // single blows for >=50% of a real foe's HP
      soft_step: 20,   // consecutive tiles undetected (data-literal)
    },

    // PRACTICE_DEED_ID_MAP: practice key -> abilities.json id. All six live
    // in the data with unlock.type 'practice' except soft_step (unlock.type
    // 'discovery', detail "Traverse 20 tiles undetected"). The map is explicit
    // and deterministic — no search-by-name, no guessing.
    PRACTICE_DEED_ID_MAP: {
      stalk: 'stalk',
      blood_trail: 'blood_trail',
      ambush: 'ambush',
      war_cry: 'war_cry',
      haymaker: 'haymaker',
      soft_step: 'soft_step',
    },

    // practiceGrantFor: the ability the data promises for this practice key.
    practiceGrantFor(practiceKey) {
      try {
        const id = (this.PRACTICE_DEED_ID_MAP || {})[practiceKey];
        if (!id) return null;
        const all = this.data.abilities || [];
        const def = all.find(a => a.id === id);
        // LANE GUARD: practice/discovery grants are alien abilities only.
        if (def && def.unlock && (def.unlock.type === 'practice' || def.unlock.type === 'discovery')) return def;
        return null;
      } catch (e) { return null; }
    },

    // practiceDeedGrant: the deed happened enough — the System grants, if it
    // can. Same grant rules as trialDeedGrant: idempotent, slot-honest,
    // pre-arrival deeds stay pending.
    practiceDeedGrant(practiceKey) {
      try {
        const s = this.state.scholar;
        if (!s) return null;
        const def = this.practiceGrantFor(practiceKey);
        if (!def) return null;
        if (this.hasAbility && this.hasAbility(def.id)) return null; // already held
        if (!this.state.systemArrived) return 'pending';
        s.abilities = s.abilities || [];
        const maxSlots = this.abilitySlots ? this.abilitySlots() : 6;
        if (s.abilities.length >= maxSlots) {
          // FULL SLOTS: honest, not silent. The System saw the practice; the
          // gift waits on room (same honesty as the trial deed grants).
          try {
            this.sysSay(`"WE SAW that — ${def.name} was yours. But your slots are full (${s.abilities.length}/${maxSlots}). Make room, or grow the interface, and earn it again."`);
          } catch (e) {}
          return null;
        }
        s.abilities.push({ id: def.id, name: def.name, desc: def.description || '', level: 1, xp: 0 });
        try { this.tele('ability_granted', { id: def.id, who: 'player', via: 'practice_deed' }); } catch (e) {}
        // Priced gifts pay their costs, like every other grant path.
        try { this.abilityOnAcquire(def.id); } catch (e2) {}
        try { this.recomputeActiveSynergies(); } catch (e3) {}
        const deedLine = this.practiceDeedLine(practiceKey);
        this.say(`◈ PRACTICE RECOGNIZED — the System has been watching. ${deedLine}`);
        this.say(`✨ Ability gained: ${def.name} (L1). ${def.description || ''}`);
        try { if (def.flavor) this.say(`"${def.flavor}"`); } catch (e) {}
        return def.id;
      } catch (e) { return null; }
    },

    // practiceDeedLine: what the deed was, in the System's voice. The player
    // earned the what by doing; the System names the pattern it saw.
    practiceDeedLine(practiceKey) {
      const lines = {
        stalk: 'Ten quiet steps, and nothing knew you were there. You close distance like weather. We took notes.',
        blood_trail: 'Three times it ran. Three times it didn\'t get away. The land remembers — and so do you.',
        ambush: 'Two fights ended before they started. You pick the ground. You pick the moment. Noted.',
        war_cry: 'Three times your voice moved something with teeth. Older than language — and it works.',
        haymaker: 'Three single blows that ended arguments. Subtlety is for people with time. Noted.',
        soft_step: 'Twenty tiles, and the woods never noticed. You move like weather.',
      };
      return lines[practiceKey] || 'The practice was done. We saw.';
    },

    // notePracticeDeed: count the deed; fire the grant when the threshold is met.
    notePracticeDeed(practiceKey, n) {
      try {
        const s = this.state.scholar;
        if (!s) return;
        s.practiceDeeds = s.practiceDeeds || {};
        s.practiceDeeds[practiceKey] = (s.practiceDeeds[practiceKey] || 0) + (n || 1);
        const th = (this.PRACTICE_DEED_THRESHOLDS || {})[practiceKey] || 1;
        if (s.practiceDeeds[practiceKey] >= th) this.practiceDeedGrant(practiceKey);
      } catch (e) {}
    },

    // noteSoftStepTile: the tile-entry quiet ledger. detected=true resets the
    // streak (a monster spawned on entry, or the wanderer made contact);
    // detected=false extends it. At 20 consecutive undetected tiles the data's
    // literal "Traverse 20 tiles undetected" fires. Called from checkEncounter
    // and moveWanderer — never from combat or safe tiles.
    noteSoftStepTile(detected) {
      try {
        const s = this.state.scholar;
        if (!s) return;
        if (detected) { s.softStepStreak = 0; return; }
        s.softStepStreak = (s.softStepStreak || 0) + 1;
        const th = (this.PRACTICE_DEED_THRESHOLDS || {}).soft_step || 20;
        if (s.softStepStreak >= th) {
          if (this.state.systemArrived) {
            s.softStepStreak = 0; // ledger stays honest; the grant is idempotent
            // Fire the grant directly: the streak IS the deed ledger (the
            // generic counter in notePracticeDeed would re-demand 20).
            s.practiceDeeds = s.practiceDeeds || {};
            s.practiceDeeds['soft_step'] = (s.practiceDeeds['soft_step'] || 0) + 1;
            this.practiceDeedGrant('soft_step');
          } else {
            // Pre-arrival: the deed is banked, not lost (the villager-mirror
            // rule — XP accrues from day one, grants wait for the watcher).
            s.softStepPending = true;
          }
        }
      } catch (e) {}
    },

    // checkPendingPracticeDeeds: on System arrival, fire grants for practice
    // the scholar already crossed pre-arrival (the villager-mirror rule: XP
    // accrues from day one, grants wait for the watcher).
    checkPendingPracticeDeeds() {
      try {
        const s = this.state.scholar;
        if (!s || !this.state.systemArrived) return;
        const pd = s.practiceDeeds || {};
        for (const key of Object.keys(this.PRACTICE_DEED_THRESHOLDS || {})) {
          const th = (this.PRACTICE_DEED_THRESHOLDS || {})[key] || 1;
          if ((pd[key] || 0) >= th) this.practiceDeedGrant(key);
        }
        // soft_step: a pre-arrival 20-streak is banked in softStepPending
        // (noteSoftStepTile never drops it); the arrival pass grants it now.
        if (s.softStepPending) {
          s.softStepPending = false;
          s.softStepStreak = 0;
          s.practiceDeeds = s.practiceDeeds || {};
          s.practiceDeeds['soft_step'] = (s.practiceDeeds['soft_step'] || 0) + 1;
          this.practiceDeedGrant('soft_step');
        }
      } catch (e) {}
    },
  };

  Object.assign(Game, methods);
})();
