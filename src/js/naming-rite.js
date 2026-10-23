// @ontology
// system: naming-rite
// description: The player naming rite (rogue P0-8, Vermilion/Nuzlocke talk):
//   the genre's cheapest attachment multiplier. Name newborns — distant
//   villages hold a baby's name for the bearer — and bestow use-names at high
//   trust. A bestowed name ADDS identity: calledName is preferred by
//   displayName/firstRef, the generated true name stays on the record
//   (unique-person law: never overwrite who someone is).
// provides:
//   - useNameThreshold()
//   - useNameAvailable(vid)
//   - bestowUseName(vid, name)
//   - babyNamingPending(villageId)
//   - nameBaby(villageId, babyId, name)
//   - nameUnnamedBabies(village)
//   - distantShortName(p)
//   - sanitizeGivenName(name)
// rules:
//   - player_initiated: beats narrate the ASK; a name is only ever set by an
//     explicit player action (nameBaby/bestowUseName), never automatically.
//   - identity_adds_never_replaces: calledName is preferred, the true name
//     is kept on the record and stays reachable.
//   - knowledge_gated: names the player gives are known by definition; no
//     surface leaks a name the player hasn't earned.
//   - parents_hold_the_right: an unnamed baby is the parents' honor to offer;
//     if the bearer never comes, the village names the child at 30 days.
// consumes:
//   - Game (say, displayName, npcName, firstRef, npcAge, npcTemper, getPerson,
//     trustBand, remember, journalNote, genNameForOrigin, socialTick)
//   - state.village.trust
//   - state.otherVillages[].roster
// ============ PLAYER NAMING RITE ============
// Steve 2026-10-22 (roguelike-celebration audit P0-8): permadeath + naming is
// the genre's attachment engine. The monster-naming verb exists (namebeast);
// this extends it to people — newborns get true names, trusted villagers get
// use-names. Minimal by design: the talk's point is the attachment
// multiplier, not a naming sim.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  const methods = {
    // useNameThreshold: 75 — the 'loyal' trust band. A use-name is intimate:
    // 'friendly' (50) is too easy, 'devoted' (90) is nearly unreachable in
    // one run (90-100 moves one point per extraordinary act). Loyal is
    // earned-but-reachable, so the beat actually fires in real play.
    useNameThreshold() { return 75; },

    // useNameAvailable: the beat's gate. Trust at/above threshold, an adult,
    // alive, not the player, no use-name bestowed yet — and you know their
    // name (knowledge-gating: the beat speaks their true first name).
    useNameAvailable(vid) {
      try {
        if (!vid || vid === this.villagerId) return false;
        const v = (typeof this.getPerson === 'function' ? this.getPerson(vid) : null)
          || (this.data.villagers || []).find(x => x.id === vid);
        if (!v || v.dead) return false;
        if (v.calledName) return false;
        if (this.npcAge(vid) < 15) return false;
        if (!(this.state.systemArrived || (typeof this.nameKnown === 'function' && this.nameKnown(vid)))) return false;
        const trust = (this.state.village.trust || {})[vid];
        return (trust === undefined ? 10 : trust) >= this.useNameThreshold();
      } catch (e) { return false; }
    },

    // sanitizeGivenName: what the player typed, cleaned. Null when there's
    // nothing to bestow — the caller narrates the refusal honestly.
    sanitizeGivenName(name) {
      let s = String(name == null ? '' : name).replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!s) return null;
      if (s.length > 24) s = s.slice(0, 24).trim();
      return s || null;
    },

    // bestowUseName: the player gives a use-name. Voiced as a moment, not a
    // menu: they try it on, the village's tongue learns it. The true name
    // stays on the record — displayName/firstRef prefer calledName.
    bestowUseName(vid, name) {
      const v = (typeof this.getPerson === 'function' ? this.getPerson(vid) : null)
        || (this.data.villagers || []).find(x => x.id === vid);
      if (!v || v.dead) { this.say('There is nobody here by that name anymore.'); return { ok: false }; }
      if (vid === this.villagerId) { this.say('Your own name is yours already.'); return { ok: false }; }
      const clean = this.sanitizeGivenName(name);
      if (!clean) { this.say('You open your mouth — and no name comes. Some other time.'); return { ok: false, empty: true }; }
      const trueFirst = String(v.name || 'Someone').split(' ')[0];
      const temp = (typeof this.npcTemper === 'function') ? this.npcTemper(vid) : 'steady';
      const replacing = !!v.calledName;
      v.calledName = clean;
      v.calledNameDay = (this.state.scholar || {}).day || 0;
      v.calledNameBy = 'bearer';
      // The reaction is generated from who they are — unique-person law, no
      // fixed cast. Temperament shapes the receiving, not the honor.
      let react;
      if (/prickly|suspicious|cynical/.test(temp)) {
        react = `"${clean}," you say. A long look — then the corner of their mouth gives. "${clean}." They say it like testing ice. "Fine. From you, I'll wear it."`;
      } else if (/withdrawn|cautious|guarded/.test(temp)) {
        react = `"${clean}," you say, quiet. A nod — small, quick, the yes ${trueFirst} gives when words cost too much. Later you hear them try it under their breath, getting used to being called something chosen.`;
      } else if (/bold|intense|passionate/.test(temp)) {
        react = `"${clean}!" you say, and ${trueFirst} laughs out loud. "${clean}!" Louder, to the whole fire. "Hear that? The bearer named me ${clean}." They wear it like a banner.`;
      } else {
        react = `"${clean}," you say. ${trueFirst} goes still — then smiles, slow and real. "${clean}." Said back like a promise. "Nobody's named me anything since I was small. I'll keep it."`;
      }
      this.say(react);
      if (!replacing) {
        this.say(`(It's a use-name, not a replacement — ${trueFirst} is still ${trueFirst}. But around your fire, they're ${clean} now.)`);
      }
      try { this.remember(vid, 'usename', `gave them the use-name "${clean}"`, { sticky: true }); } catch (e) {}
      try {
        this.journalNote('people', 'usename_' + vid,
          `You gave ${trueFirst} a use-name: "${clean}". Their true name stays theirs — this one's from you.`);
      } catch (e) {}
      try { this.socialTick(vid); } catch (e) {}
      return { ok: true, vid, name: clean, replaced: replacing };
    },

    // babyNamingPending: the village card's gate — an unnamed baby whose
    // parents asked the bearer, still waiting on the player's word.
    babyNamingPending(villageId) {
      try {
        const ov = (this.state.otherVillages || []).find(x => x.id === villageId);
        if (!ov) return null;
        const bid = ov.pendingBabyNaming;
        if (!bid) return null;
        const baby = (ov.roster || []).find(p => p.id === bid);
        if (!baby || !baby.alive || !baby.unnamed) { ov.pendingBabyNaming = null; return null; }
        const parent = (ov.roster || []).find(p => p.id === ((baby.parents || [])[0]));
        return {
          villageId, babyId: baby.id,
          parentName: parent && parent.name ? parent.name.split(' ')[0] : 'a parent',
          villageName: ov.name || 'the village',
        };
      } catch (e) { return null; }
    },

    // nameBaby: the player names the newborn. The parents repeat it, the fire
    // learns it. The village's trust warms a little — the honor is real.
    nameBaby(villageId, babyId, name) {
      const ov = (this.state.otherVillages || []).find(x => x.id === villageId);
      if (!ov) { this.say('That village is beyond your reach now.'); return { ok: false }; }
      const baby = (ov.roster || []).find(p => p.id === babyId);
      if (!baby || !baby.alive) { this.say('The child is gone — named or not, there is no one to name.'); return { ok: false }; }
      if (!baby.unnamed) { this.say('Already named — the village gave them their name.'); return { ok: false, already: true }; }
      const clean = this.sanitizeGivenName(name);
      if (!clean) { this.say('You look at the small face — and no name comes. The parents wait. Some other time.'); return { ok: false, empty: true }; }
      const parent = (ov.roster || []).find(p => p.id === ((baby.parents || [])[0]));
      const parentFirst = parent && parent.name ? parent.name.split(' ')[0] : 'The parent';
      baby.name = clean;
      baby.unnamed = false;
      baby.namedBy = 'bearer';
      baby.namedDay = (this.state.scholar || {}).day || 0;
      if (ov.pendingBabyNaming === babyId) ov.pendingBabyNaming = null;
      this.say(`"${clean}," you say. ${parentFirst} repeats it softly to the sleeping bundle — "${clean}" — and something in their shoulders lets go. Around the fire it travels, said like it's always been true: ${clean}.`);
      ov.trust = Math.min(100, (ov.trust || 0) + 2);
      ov.news = ov.news || [];
      if (ov.news.length < 20) ov.news.push(`👶 ${clean} was named by the bearer on day ${(this.state.scholar || {}).day || 0}.`);
      try {
        this.journalNote('village', 'named_baby_' + babyId,
          `You named ${ov.name}'s newborn: ${clean}. The parents asked; you answered.`);
      } catch (e) {}
      return { ok: true, villageId, babyId, name: clean };
    },

    // nameUnnamedBabies: the parents' right. If the bearer never comes, the
    // village names the child at 30 days — no immortal unnamed clutter.
    // Called from simVillageDay.
    nameUnnamedBabies(village) {
      try {
        if (!village || !village.roster) return;
        for (const p of village.roster) {
          if (!p || !p.alive || !p.unnamed) continue;
          const born = (typeof p.birthDay === 'number') ? p.birthDay : village.day;
          if ((village.day || 0) - born < 30) continue;
          let nm = null;
          try { nm = this.genNameForOrigin('village', true); } catch (e) {}
          const full = (nm && nm.name) || 'Ash River';
          p.name = full;
          p.unnamed = false;
          p.namedBy = 'parents';
          if (village.pendingBabyNaming === p.id) village.pendingBabyNaming = null;
          const parent = village.roster.find(q => q.id === ((p.parents || [])[0]));
          const parentFirst = parent && parent.name ? parent.name.split(' ')[0] : 'their parent';
          village.news = village.news || [];
          if (village.news.length < 20) {
            village.news.push(`👶 The baby born to ${parentFirst} was named ${full.split(' ')[0]} on day ${village.day}.`);
          }
        }
      } catch (e) {}
    },

    // distantShortName: a distant-roster person may be an unnamed newborn
    // (name null). News and drama must never print "null"/"undefined".
    distantShortName(p) {
      try {
        if (p && p.name) return String(p.name).split(' ')[0];
        return 'the baby';
      } catch (e) { return 'the baby'; }
    },
  };

  Object.assign(Game, methods);
})();
