// @ontology
// system: spawn-knack
// description: The spawn knack — the System's early touch. Granted before the System's formal arrival (sent ahead), unexplained at grant time but GIVEN — never innate, never "always had" (Steve 2026-10-14). Backstory-rooted via lifeseed memories.
// provides:
//   - knackChoicesFor(char)
//   - chooseKnack(id)
//   - grantVillagerKnacks()
//   - npcKnack(vid)
//   - knackGossipLine(tellerVid, targetVid)
//   - knackDef(id)
//   - liveKnackChoices()
// rules:
//   - knack_system_granted_early: true (code: spawn-knack.js — knacks are unlock.type latent_knack, never system_offer at grant; zero System chrome in copy or UI because the System hasn't formally arrived — but the fiction is GIVEN, not innate)
//   - latent_knack_not_skill: true (code: spawn-knack.js — knacks are not teachable earthly skills; they are unexplained and fill a System slot)
//   - knack_fills_slot_1: true (code: spawn-knack.js — chooseKnack pushes to s.abilities; the day-7 gift waits honestly for slot 2)
//   - knack_lifeseed_tied: true (code: spawn-knack.js — choices derive from char.lifeseed.skillOrigins; memories fill {kin}/{place} from the seed)
//   - villager_knack_like_player: true (code: spawn-knack.js grantVillagerKnacks — a villager's first ability comes from the same 3 lifeseed-tied choices, picked by buildScore, held in slot 1 of npcAbilities and counted in their build; the player learns of it through gossip, never UI; old-save skill ids are re-chosen from the magic pool)
// consumes:
//   - Game.data.abilities (latent_knack pool)
//   - village.rosterChars.lifeseed (skillOrigins, people, places)
// ============ SPAWN KNACK ============
// Steve 2026-10-11: "the player gets a mysterious first ability during the
// spawn sequence — pre-System, no System overlay, framed as 'you feel capable
// of something you can't quite explain — choose an ability'."
// Steve 2026-10-14 (overrule): the ability is GIVEN by the System, not innate.
// "It was always there" was wrong. New fiction: the System sent it ahead —
// an early touch, unexplained at the time. The day-7 beat has the System
// recognize its own early delivery (excited, slightly embarrassed).
//
// This is the level-up mechanic's first rung. It is a System ability granted
// BEFORE the System's formal arrival (the System hasn't arrived) and NOT a
// teachable earthly skill (nobody can teach it — it's unexplained). It fills
// slot 1. The System will recognize its own early delivery on day 7.
//
// Self-attaching module: Object.assign(Game, methods) + wraps newGame,
// systemArrivalBeats, npcGossipAbout, integrate. Load after lifeseed.js
// (needs char.lifeseed) and game.js. Data: src/data/abilities.json
// (unlock.type === 'latent_knack').

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const R = Math.random;
  const pick = (a) => a[Math.floor(R() * a.length)];

  const methods = {

    // knackDef: the data definition for a knack id.
    knackDef(id) {
      return this.knackPool().find(a => a.id === id) || null;
    },

    // knackPool: the latent-knack abilities. ABILITY LANES (2026-10-14):
    // knacks are magic — skill-lane entries (Waywise/Still Hands/Storm-ear
    // merged into human skills) are out; System abilities that merged a
    // knack (night_eyes, iron_stomach <- iron_gut) are in via alsoKnack.
    knackPool() {
      return (this.data.abilities || []).filter(a => a && a.lane !== 'skill'
        && ((a.unlock && a.unlock.type === 'latent_knack') || a.alsoKnack));
    },

    // knackChoicesFor: 3 early-touch choices tied to the character's lifeseed.
    // Two draw from knacks matching the seed's skill origins (the System
    // aimed its early gift at what you'd reach for); the third is wild
    // (a real choice, not a menu).
    // rng (optional): a local generator — villagers draw their choices from
    // a stream seeded by one shared draw, so the world's luck moves exactly
    // as it did when a villager's knack was a single pick.
    knackChoicesFor(char, rng) {
      const RR = rng || R;
      const all = this.knackPool();
      if (!all.length) return [];
      const ls = (char && char.lifeseed) || {};
      const origins = Object.keys(ls.skillOrigins || {});
      const matched = all.filter(k => (k.knackOrigins || []).some(o => origins.includes(o)));
      const rest = all.filter(k => !(k.knackOrigins || []).some(o => origins.includes(o)));
      const draw = (arr) => arr.length ? arr.splice(Math.floor(RR() * arr.length), 1)[0] : null;
      const choices = [];
      const m1 = draw(matched), m2 = draw(matched);
      if (m1) choices.push(m1);
      if (m2) choices.push(m2);
      // wild slot: one from outside the lifeseed's origins, so it's a choice.
      const wildPool = rest.length ? rest : matched;
      const w = draw(wildPool);
      if (w && choices.length < 3) choices.push(w);
      // backstop: fill to 3 from anything unpicked (tiny pools, missing seed).
      while (choices.length < 3) {
        const remaining = all.filter(k => !choices.includes(k));
        if (!remaining.length) break;
        choices.push(draw(remaining));
      }
      return choices.slice(0, 3).map(k => ({
        id: k.id,
        name: k.knackName || k.name,
        description: k.knackDescription || k.description,
        memory: this.fillKnackMemory(k, ls),
      }));
    },

    // fillKnackMemory: resolve {kin}/{place} from the lifeseed. Falls back
    // gracefully when the seed is thin — never a raw placeholder.
    fillKnackMemory(k, ls) {
      let t = k.memory || '';
      if (!t) return '';
      const kin = (((ls.people || [])[0] || {}).name || 'someone').split(' ')[0];
      const place = ((ls.places || [])[0] || {}).name || 'the old place';
      return t.replaceAll('{kin}', kin).replaceAll('{place}', place);
    },

    // liveKnackChoices: the pending first-ability sheet, honest to the lanes.
    // Saves from before the ability-lanes change (2026-10-14) can hold
    // choices that are now human skills (still_hands, storm_ear); drop them
    // and refill to 3 from the magic pool so the sheet never offers a skill.
    liveKnackChoices() {
      const s = this.state.scholar;
      if (!s || s.knackChosen || !(s.knackChoices || []).length) return [];
      const kept = s.knackChoices.filter(c => c && this.knackDef(c.id));
      if (kept.length < s.knackChoices.length) {
        const me = this.vpOf ? this.vpOf(this.villagerId) : null;
        const fresh = this.knackChoicesFor(me).filter(c => !kept.some(k => k.id === c.id));
        while (kept.length < 3 && fresh.length) kept.push(fresh.shift());
        s.knackChoices = kept;
      }
      return s.knackChoices;
    },

    // chooseKnack: the player names their knack. Fills slot 1. Quiet —
    // no System chrome: no 🎁, no "PICK A TRICK", no flavor quote. The System
    // hasn't formally arrived — this was sent ahead, unexplained.
    chooseKnack(id) {
      const s = this.state.scholar;
      if (!s) return null;
      const choice = this.liveKnackChoices().find(c => c.id === id);
      if (!choice) return null;
      s.abilities = s.abilities || [];
      if (s.abilities.length >= this.abilitySlots()) {
        this.say('No free ability slots. (It waits. It will come back when a slot opens.)');
        return null;
      }
      s.abilities.push({ id: choice.id, name: choice.name, desc: choice.description, level: 1, xp: 0, latent: true });
      try { this.tele('ability_granted', { id: choice.id, who: 'player', latent: true }); } catch (e) {}
      try { this.abilityOnAcquire(choice.id); } catch (e) {}
      try { this.recomputeActiveSynergies(); } catch (e) {}
      s.knackChoices = null;
      s.knackChosen = true;
      this.say(`💭 ${choice.name}. It wasn't there last week. Something gave it to you — something that's still on its way. Naming it makes it yours on purpose. (Your first ability — a gift from whatever's coming. It deepens with use.)`);
      return null;
    },

    // grantVillagerKnacks: villagers are all other players too — they get
    // the player's first ability the player's way (PARITY 2026-10-14, Steve:
    // "treat villagers and players as similarly as possible"): the same 3
    // lifeseed-tied choices (knackChoicesFor), the pick made by the build
    // brain (buildScore), and it lands in slot 1 of their abilities, counting
    // toward their build. v.npcKnacks keeps the record gossip reads — the
    // player learns of it through what the village has seen, never UI.
    grantVillagerKnacks() {
      try {
        const v = this.state.village;
        if (!v) return;
        v.npcKnacks = v.npcKnacks || {};
        v.npcAbilities = v.npcAbilities || {};
        const roster = (v.roster || []).filter(id => id !== this.villagerId);
        for (const vid of roster) {
          const vp = this.vpOf ? this.vpOf(vid) : null;
          if (vp && vp.dead) continue;
          let id = v.npcKnacks[vid];
          // OLD SAVES: knacks stored before the lanes change can be human
          // skills now (still_hands, storm_ear, pathfinder) — re-choose from
          // the live magic pool, like liveKnackChoices does for the player.
          if (id && !this.knackDef(id)) id = null;
          if (!id) {
            // one shared draw seeds the villager's own stream (the old single
            // pick's footprint on the world RNG)
            let seed = Math.floor(R() * 4294967296) >>> 0;
            const rng = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), 1 | t); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
            const choices = this.knackChoicesFor(vp, rng);
            if (!choices.length) continue;
            id = (this.pickVillagerKnack && this.pickVillagerKnack(vid, choices)) || choices[0].id;
            v.npcKnacks[vid] = id;
          }
          // slot 1: their first ability, held like any other (one per
          // villager; never re-granted once it has been swapped away)
          const held = v.npcAbilities[vid] = v.npcAbilities[vid] || [];
          v.npcKnackSlotted = v.npcKnackSlotted || {};
          if (!v.npcKnackSlotted[vid] && held.indexOf(id) < 0 && held.length < 6) {
            held.unshift(id);
            try { this.tele('ability_granted', { id, who: 'villager:' + vid, latent: true }); } catch (e) { console.warn('[spawn-knack] tele', e); }
            try { if (this.npcLearnAbility) this.npcLearnAbility(vid, id, 3, 'held'); } catch (e) { console.warn('[spawn-knack] know', e); }
          }
          v.npcKnackSlotted[vid] = true;
        }
      } catch (e) { console.warn('[spawn-knack] grantVillagerKnacks', e); }
    },

    // npcKnack: a villager's first-ability id (or null). Only a live magic
    // knack counts — an old save's skill id reads as none.
    npcKnack(vid) {
      try {
        const id = ((this.state.village || {}).npcKnacks || {})[vid] || null;
        return id && this.knackDef(id) ? id : null;
      }
      catch (e) { console.warn('[spawn-knack] npcKnack', e); return null; }
    },

    // knackGossipLine: gossip-visible, not UI. The teller describes what
    // they've SEEN — the effect, never the mechanic name. Falls back to null
    // when there's nothing to say (the wrapper only calls us when the real
    // gossip came back empty).
    knackGossipLine(tellerVid, targetVid) {
      const knackId = this.npcKnack(targetVid);
      if (!knackId) return null;
      if (Math.random() > 0.35) return null; // quiet — not everyone mentions it
      const first = this.firstRef ? this.firstRef(targetVid) : targetVid;
      const seen = {
        bloodhound: `${first} found a lost knife by smell last week. By SMELL.`,
        the_touch: `cuts close faster when ${first} wraps them. Don't ask me how.`,
        green_whisper: `${first} talks to the garden. The garden listens. I've seen it.`,
        beast_calm: `that stray dog — the one that bit two people — lets ${first} touch it.`,
        iron_stomach: `${first} ate something last month that should've killed them. They're fine.`,
        night_eyes: `${first} sees in the dark. Not well — but better than you. Better than me.`,
      };
      const line = seen[knackId];
      if (!line) return null;
      // VILLAGER KNOWLEDGE (parity 2026-10-14): the teller has seen it work —
      // they know what it does (L2), the same way the player hears of it.
      try { if (this.npcLearnAbility) this.npcLearnAbility(tellerVid, knackId, 2, 'gossip:' + targetVid); } catch (e) { console.warn('[spawn-knack] gossip know', e); }
      return { line: `"${line}"`, target: targetVid, field: 'knack', truth: knackId, contradictsLie: false };
    },
  };

  Object.assign(Game, methods);

  // ---- wraps ----

  // newGame: after the scholar exists, offer the knack and grant villager knacks.
  const _newGame = Game.newGame;
  Game.newGame = function (homeRegionText, locationId, villagerId, pickedItems, runName) {
    const r = _newGame.apply(this, arguments);
    try {
      const s = this.state.scholar;
      if (s && !s.knackChosen && !(s.knackChoices || []).length && !(s.abilities || []).length) {
        const me = this.vpOf ? this.vpOf(this.villagerId) : null;
        const choices = this.knackChoicesFor(me);
        if (choices.length) s.knackChoices = choices;
      }
      this.grantVillagerKnacks();
    } catch (e) {}
    return r;
  };

  // systemArrivalBeats: the System RECOGNIZES its early delivery — one beat,
  // System voice. It sent the knack ahead, got excited, jumped the schedule.
  // Fires once, only if the player holds the early-touch knack.
  const _beats = Game.systemArrivalBeats;
  Game.systemArrivalBeats = function () {
    const beats = _beats.apply(this, arguments);
    try {
      const s = this.state.scholar || {};
      const hasLatent = (s.abilities || []).some(a => a && a.latent);
      if (hasLatent && !beats.some(b => b.id === 'knack')) {
        const knackBeat = {
          id: 'knack', kicker: 'early delivery?', button: '…me?',
          lines: [
            { who: 'sys', text: 'WAIT. Hold on. [shuffling noises] There\'s a reading on YOU. A little glow, person-shaped, doing... whatever it is you DO.' },
            { who: 'sys', text: 'Oh. OH. That\'s... that\'s OURS. We sent that ahead! Early delivery! We got EXCITED. First impressions matter!' },
            { who: 'sys', text: 'Don\'t tell the others we jumped the schedule. They get WEIRD about the schedule.' },
            { who: 'narr', text: 'It goes quiet for a moment. When it comes back, it\'s brighter. Too bright.' },
            { who: 'sys', text: 'Anyway! You\'re WELCOME! Enjoy the glow! 🎉' },
          ],
        };
        const idx = beats.findIndex(b => b.id === 'food');
        if (idx >= 0) beats.splice(idx + 1, 0, knackBeat);
        else beats.push(knackBeat);
      }
    } catch (e) {}
    return beats;
  };

  // npcGossipAbout: knack gossip is the quiet fallback — only when the real
  // gossip came back empty. The village mentions what it's seen.
  const _gossip = Game.npcGossipAbout;
  if (typeof _gossip === 'function') {
    Game.npcGossipAbout = function (tellerVid, targetVid) {
      const r = _gossip.apply(this, arguments);
      if (r && r.line) return r;
      try { return this.knackGossipLine(tellerVid, targetVid); } catch (e) { return null; }
    };
  }

  // load: old saves held villager knacks outside their slots (and some are
  // skills now). Re-run the grant: it re-chooses dead skill ids and slots
  // the knack once (idempotent).
  const _loadK = Game.load;
  if (typeof _loadK === 'function') {
    Game.load = function () {
      const r = _loadK.apply(this, arguments);
      try { if (r !== false && this.state && this.state.village) this.grantVillagerKnacks(); } catch (e) { console.warn('[spawn-knack] load migrate', e); }
      return r;
    };
  }

  // integrate: when a new slot opens and the System's gift is still pending,
  // say so out loud. The gift was never eaten — it was waiting.
  const _integrate = Game.integrate;
  Game.integrate = function (amount, reason) {
    const s = this.state.scholar || {};
    let before = 1;
    try { before = this.abilitySlots(); } catch (e) {}
    const r = _integrate.apply(this, arguments);
    try {
      const after = this.abilitySlots();
      if (after > before && (s.abilityChoices || []).length && this.state.systemArrived) {
        this.say('🎁 "OH! You can hold more now! We\'ve been HOLDING this — take it, take it, take it!" (The System\'s gift awaits — choose an ability.)');
      }
    } catch (e) {}
    return r;
  };
})();
