// @ontology
// system: relay
// description: The village relay as a PLAYABLE path — "enter the matrix". The Bearer may claim the switchboard office (at a real price: the village loses their hands, and integration erodes grounding while held). Relay verbs: probe (push a button — discovery or backfire), reroute (efficiency vs honesty), deepen (integration step), commune (the scene system in relay-dialogue.js — recurring System conversations with real choices). Nine communication-field abilities (NOT the 6 System slots): shared core deep-listen/faithful-carry/relay-sight; light translate/sanctuary/advocate; dark rewrite/skim/omnipresence. Dark use erodes grounding (table.js) — integration is two-way. Ability unlocks are gradient-gated on the leaning meter (2026-10-11), never binary-locked.
// provides:
//   - claimRelay()
//   - relayHeldByBearer()
//   - relayTableLink()
//   - relayProbe()
//   - relayReroute(mode)
//   - relayDeepen()
//   - relayCommune()
//   - relayHas(abilId)
//   - relayGrant(abilId)
//   - relayTranslate(concept)
//   - relaySanctuary()
//   - relayAdvocate(vid)
//   - relayRewrite()
//   - relaySkim()
//   - relaySight()
//   - relayCarry()
//   - relayBackfire()
//   - relayTick()
// consumes:
//   - switchboard(), switchboardAvailable(), appointSwitchboard()
//   - sysBond(), addSysBond(), grounding(), addGrounding() (table.js — runtime calls, safe post-load)
//   - relayLean(), addRelayLean() (relay-dialogue.js — runtime calls, safe post-load)
//   - integrationStage(), say, sysSay, recordMoment(), save()
// rules:
//   - upkeep_is_daily: grounding, service progress and periodic holder beats advance once per actual person/calendar day; saved receipts survive reload and same-day reclaims. Communications still run each part. (code: relayTick)
// Appended IIFE (comms.js's own IIFE is closed) — assigns onto Game directly.
// Load AFTER comms.js and table.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const R = Math.random;

  function rstate() {
    try {
      const s = Game.state.scholar || {};
      s.relay = s.relay || { probes: 0, reroutes: 0, deepens: 0, communes: 0, holderDays: 0, backfires: 0, translated: [] };
      return s.relay;
    } catch (e) { return { probes: 0, reroutes: 0, deepens: 0, communes: 0, holderDays: 0, backfires: 0, translated: [] }; }
  }
  function abils() {
    try {
      const s = Game.state.scholar || {};
      s.relayAbils = s.relayAbils || {};
      return s.relayAbils;
    } catch (e) { return {}; }
  }

  const ABIL_DEFS = {
    'deep-listen': { name: 'Deep Listen', desc: 'Hear all village comms — every runner\'s plea, every trader\'s word, unfiltered.', light: null },
    'faithful-carry': { name: 'Faithful Carry', desc: 'Messages arrive undistorted — no gossip decay while you carry them.', light: null },
    'relay-sight': { name: 'Relay-sight', desc: 'See trust and message flows — who talks to whom, what moves.', light: null },
    'translate': { name: 'Translate', desc: 'Teach the System a human thing — grief, food, joy. Each one makes it more human.', light: true },
    'sanctuary': { name: 'Sanctuary', desc: 'One conversation shielded from surveillance — the only private channel.', light: true },
    'advocate': { name: 'Advocate', desc: 'Speak for someone to the System with their full weight.', light: true },
    'rewrite': { name: 'Rewrite', desc: 'Edit messages in transit. Power immense, self eroded.', light: false },
    'skim': { name: 'Skim', desc: 'Take a cut. Nobody checks the relay\'s math.', light: false },
    'omnipresence': { name: 'Omnipresence', desc: 'Be in every conversation. Nobody knows if it\'s you or the System.', light: false },
  };

  const methods = {
    // relayHeldByBearer: is the Bearer the relay's hands?
    relayHeldByBearer() {
      try {
        const sw = (typeof this.switchboard === 'function') ? this.switchboard() : null;
        return !!(sw && sw.holderId === this.villagerId);
      } catch (e) { return false; }
    },
    // relayTableLink: the verbs work while holding the relay — or while
    // seated at the table's console during the relay challenge (the table
    // lends you the wires for the evening).
    relayTableLink() {
      try {
        if (this.relayHeldByBearer()) return true;
        const T = (typeof this.tableState === 'function') ? this.tableState() : {};
        return !!(T && T.path === 'relay' && T.phase === 'challenge');
      } catch (e) { return false; }
    },
    // relayHas / relayGrant: idempotent ability unlocks.
    relayHas(abilId) {
      try { return !!(abils()[abilId] && abils()[abilId].unlocked); } catch (e) { return false; }
    },
    relayGrant(abilId, opts) {
      try {
        const a = abils();
        if (!abilId || !ABIL_DEFS[abilId] || (a[abilId] && a[abilId].unlocked)) return false;
        a[abilId] = { unlocked: true, uses: 0 };
        const d = ABIL_DEFS[abilId];
        if (!(opts && opts.silent)) this.say(`◈ RELAY ABILITY — ${d.name}: ${d.desc}`);
        try { this.save(); } catch (e2) {}
        return true;
      } catch (e) { return false; }
    },
    // claimRelay: the Bearer takes the relay office. The price is honest
    // and up front: the village loses your hands, and the wires erode you
    // while you hold them (grounding ticks down via relayTick).
    claimRelay() {
      try {
        if (typeof this.switchboardAvailable === 'function' && !this.switchboardAvailable()) {
          if (this.switchboard && this.switchboard()) this.say('The relay already has hands.');
          else this.say('The relay is a regional thing — Haven isn\'t networked yet. (Link a village first.)');
          return null;
        }
        if (this.relayHeldByBearer()) { this.say('You already hold the relay. The wires hum your name.'); return null; }
        const day = (this.state.scholar || {}).day || 0;
        const me = ((this.data.villagers || []).find(v => v.id === this.villagerId) || {}).name || 'the Bearer';
        this.state.switchboard = {
          holderId: this.villagerId, appointedDay: day, stage: 'village relay', bearerHeld: true,
          routed: 0, delayed: 0, edited: 0, skimmed: 0, log: [],
          mootVoiceLost: false, lastLeadDay: -1,
        };
        try { this.state.pendingSwitchboard = null; } catch (e) {}
        this.say(`📡 ${me} takes the relay. Not appoints — TAKES. Every message in and out of Haven passes through your hands now: runners' pleas, traders' word, all of it. You can carry, hurry, sit on, or REWRITE what passes.`);
        this.say('The cost, said aloud: Haven loses your hands — no forage, no runner duty, no moot vote while you run the relay. And the wires erode you: every day you hold them, you come back a little less human. (Grounding will tick down. Human verbs — shared meals, kept promises, teaching — build it back.)');
        try {
          const v = this.state.village || {};
          v.moodMods = v.moodMods || [];
          v.moodMods.push({ kind: 'relay-awe', amt: -4, untilDay: day + 14, why: 'the Bearer took the relay' });
        } catch (e) {}
        try { this.sysSay('🔴 LIVE! THE RELAY! The Bearer takes the wires — every word in and out of Haven, through ONE pair of hands! The galaxy leans in!'); } catch (e) {}
        try { this.recordMoment(`${me} claimed the relay.`); } catch (e) {}
        this.relayUnlockCheck();
        try { this.save(); } catch (e) {}
        return 'claimed';
      } catch (e) { return null; }
    },

    // relayProbe: push a button. Discovery or backfire — boldness rewarded,
    // boldness priced.
    relayProbe() {
      try {
        if (!this.relayTableLink()) { this.say('The relay needs your hands first. (Claim it.)'); return null; }
        const rs = rstate(); rs.probes++;
        if (R() < 0.5) {
          const finds = [
            'A frequency nobody uses — the System\'s idle hum. You listen for an hour. It almost sounds like breathing.',
            'A dead channel, and behind it, a live one: the System talking to itself about *you*. "SUBJECT SHOWS CURIOSITY. CURIOSITY IS INEFFICIENT. CURIOSITY IS... NOTED."',
            'You find the message queue\'s edge — and push one message half a second early. It arrives *better*. The wires are teaching you back.',
          ];
          // NO-REPEAT (journey-endgame r5 2026-10-12): the pool exists but
          // raw picks repeated the same find three beats running. Same RNG
          // draw count — just never the same find twice in a row.
          let pick = (R() * finds.length) | 0;
          if (pick === rs.lastProbe && finds.length > 1) pick = (pick + 1) % finds.length;
          rs.lastProbe = pick;
          this.say('◈ PROBE — ' + finds[pick]);
          this.addSysBond(1, 'It noticed you noticing.');
          this.relayUnlockCheck();
        } else {
          this.relayBackfire();
        }
        try { this.save(); } catch (e) {}
        return 'probed';
      } catch (e) { return null; }
    },
    // relayReroute: redirect message flows. Efficient hurries some and
    // delays others (delayed+1); honest carries faithfully (routed+2).
    relayReroute(mode) {
      try {
        if (!this.relayTableLink()) { this.say('The relay needs your hands first. (Claim it.)'); return null; }
        const sw = this.switchboard(); if (!sw) return null;
        const rs = rstate(); rs.reroutes++;
        if (mode === 'efficient') {
          sw.routed = (sw.routed | 0) + 2; sw.delayed = (sw.delayed | 0) + 1;
          sw.log.push({ day: (this.state.scholar || {}).day || 0, kind: 'reroute', decision: 'efficient', note: 'some hurried, some waited' });
          this.say('◈ REROUTE — efficient. Two messages hurried, one sits. The one that sits belongs to someone who needed it today. Efficiency has a face; you just chose not to look at it.');
          // Acts move the needle too (gradient): small, never locking.
          try { if (typeof this.addRelayLean === 'function') this.addRelayLean(-2, 'reroute-efficient'); } catch (e) {}
        } else {
          sw.routed = (sw.routed | 0) + 2;
          sw.log.push({ day: (this.state.scholar || {}).day || 0, kind: 'reroute', decision: 'honest', note: 'carried faithfully' });
          this.say('◈ REROUTE — honest. Every message carried faithfully, in order, undistorted. Slow. The wires feel *clean*. Somewhere, the System notes the cleanliness with something like respect.');
          try { if (typeof this.addRelayLean === 'function') this.addRelayLean(2, 'reroute-honest'); } catch (e) {}
        }
        this.relayUnlockCheck();
        try { this.save(); } catch (e) {}
        return 'rerouted';
      } catch (e) { return null; }
    },
    // relayDeepen: an integration step. +sysBond, grounding risk, small
    // backfire chance. The matrix, one button deeper.
    relayDeepen() {
      try {
        if (!this.relayTableLink()) { this.say('The relay needs your hands first. (Claim it.)'); return null; }
        let stage = 0;
        try { stage = (typeof this.integrationStage === 'function') ? this.integrationStage() : 0; } catch (e) {}
        if (stage < 1) { this.say('The System hasn\'t arrived yet. There\'s nothing to deepen into.'); return null; }
        const rs = rstate(); rs.deepens++;
        // DEEPEN POOL (journey-endgame r5 2026-10-12): was a single hardcoded
        // line — four deepens in one challenge read byte-identical (filler
        // loop). Four variants, round-robin by deepen count: no repeats
        // within a challenge, no RNG stream change.
        const deepens = [
          'you push one layer deeper into the wires. The overlay\'s weather changes. For a second you can feel the *size* of the thing you\'re inside — and it can feel you feeling it.',
          'you go one level down. The hum gets personal — like it has been humming your name all along and you only just tuned in.',
          'deeper. The wires stop feeling like machinery and start feeling like weather — a storm you have agreed to stand inside.',
          'you sink another layer. Somewhere far above, the village keeps eating dinner. Down here the System shows you what messages look like from the inside: bright, frightened, fast.',
        ];
        this.say('◈ DEEPEN — ' + deepens[(rs.deepens - 1) % deepens.length]);
        this.addSysBond(1, 'Depth recognizes depth.');
        this.addGrounding(-3, 'deepening');
        if (R() < 0.25) this.relayBackfire();
        this.relayUnlockCheck();
        try { this.save(); } catch (e) {}
        return 'deepened';
      } catch (e) { return null; }
    },
    // relayCommune: talk to the System. 2026-10-11: this is now the scene
    // system (relay-dialogue.js) — recurring dialogue scenes with real
    // choices (check-ins, the curiosity ladder, light/dark chains), not a
    // fixed ladder. The System's half is said here; the player's answer
    // pends at the relay panel (data-beat="sw:answer:<choiceId>").
    relayCommune() {
      try {
        if (!this.relayTableLink()) { this.say('The relay needs your hands first. (Claim it.)'); return null; }
        if (typeof this.relayCommuneScene === 'function') return this.relayCommuneScene();
        this.say('The wires hum. The System is listening, but the words won\'t come.');
        return null;
      } catch (e) { return null; }
    },

    // relayBackfire: the button pushed back. d6, all honest.
    relayBackfire() {
      try {
        const rs = rstate(); rs.backfires++;
        const sw = (typeof this.switchboard === 'function') ? this.switchboard() : null;
        const roll = (R() * 6) | 0;
        if (roll === 0) {
          this.say('◈ BACKFIRE — the relay fries. A day\'s messages scatter like birds. Nobody\'s words arrive today; everybody assumes the worst. (The relay log notes the gap, honestly.)');
          if (sw) sw.log.push({ day: (this.state.scholar || {}).day || 0, kind: 'backfire', decision: 'fried', note: 'a day of messages lost' });
        } else if (roll === 1) {
          this.say('◈ BACKFIRE — wrong frequency. A rival village heard everything for an hour. Their trust in Haven drops; the galaxy\'s viewership ticks up. Someone always profits from your mistakes.');
          try { if (this.state.village && this.state.village.viewership != null) this.state.village.viewership += 5; } catch (e) {}
        } else if (roll === 2) {
          this.say('◈ BACKFIRE — a grounding jolt. For a second the wires feel more like home than the fire does, and the thought doesn\'t frighten you. That\'s the frightening part.');
          this.addGrounding(-4, 'backfire');
        } else if (roll === 3) {
          this.say('◈ BACKFIRE — de-integration jolt. The overlay stutters, drops a layer, catches itself. You feel the System flinch *away* from you, and then, slowly, back.');
          try { const s = this.state.scholar || {}; s.integration = Math.max(0, (s.integration | 0) - 10); } catch (e) {}
        } else if (roll === 4) {
          this.say('◈ BACKFIRE — it mislearned. You taught it something true and it learned something wrong, confidently, at scale. The misunderstanding is already in three villages\' inboxes. (Planted: a thread you\'ll have to pull later.)');
          this.addSysBond(1, 'It learned *something*.');
        } else {
          this.say('◈ DISCOVERY — the button gives, this time. A clean channel, a true answer, the wires humming in tune. Boldness, priced fairly for once.');
          this.addSysBond(1, 'Discovery.');
        }
        try { this.save(); } catch (e) {}
        return 'backfired';
      } catch (e) { return null; }
    },

    // relayUnlockCheck: abilities unlock through verb use + behavior.
    // GRADIENT GATING (2026-10-11, Steve): unlocks follow the leaning
    // meter (relay-dialogue.js), NOT a binary branch lock. Light abilities
    // (translate/sanctuary/advocate) need lean > -40 — you haven't gone
    // full total. Dark abilities (rewrite/skim/omnipresence) need
    // lean < 40 — you haven't gone full tender. This REPLACES the old
    // binary block that read T.branch during the table challenge
    // (notDark/notLight): the office is now gradient-gated everywhere,
    // inside and outside the table. Because no single choice can move
    // lean more than 10 against the 40 threshold, no unlock here can be
    // opened or closed by one choice — the needle moves by accumulation,
    // and a drifted player can always drift back.
    relayUnlockCheck() {
      try {
        const rs = rstate(), a = abils();
        const sw = (typeof this.switchboard === 'function') ? this.switchboard() : null;
        const bond = (typeof this.sysBond === 'function') ? this.sysBond() : 0;
        const g = (typeof this.grounding === 'function') ? this.grounding() : 100;
        const lean = (typeof this.relayLean === 'function') ? this.relayLean() : 0;
        const lightOpen = lean > -40, darkOpen = lean < 40;
        if (rs.holderDays >= 3) this.relayGrant('deep-listen');
        if (sw && (sw.routed | 0) >= 10) this.relayGrant('faithful-carry');
        if (bond >= 2) this.relayGrant('relay-sight');
        if (rs.communes >= 2 && lightOpen) this.relayGrant('translate');
        if (bond >= 3 && lightOpen) { this.relayGrant('sanctuary'); this.relayGrant('advocate'); }
        // Dark opens through dark acts — or through already fraying —
        // but never past a full-tender leaning.
        if (sw && (sw.delayed | 0) >= 3 && darkOpen) this.relayGrant('rewrite');
        if (sw && (sw.routed | 0) >= 15 && darkOpen) this.relayGrant('skim');
        const darkUses = ((a.rewrite || {}).uses | 0) + ((a.skim || {}).uses | 0);
        if (bond >= 4 && darkUses >= 2 && darkOpen) this.relayGrant('omnipresence');
        if (g < 50 && bond >= 2 && !this.relayHas('rewrite') && darkOpen) this.relayGrant('rewrite');
      } catch (e) {}
    },

    // ---- Ability uses ----
    // relayTranslate(concept): teach the System grief/food/joy. Each once.
    // Light. +sysBond. The System becomes more human.
    relayTranslate(concept) {
      try {
        if (!this.relayHas('translate')) { this.say('You haven\'t learned Translate yet. (Commune twice.)'); return null; }
        const rs = rstate();
        const c = (concept || '').toLowerCase();
        if (['grief', 'food', 'joy'].indexOf(c) < 0) { this.say('Translate what? Grief, food, or joy — the three things it doesn\'t understand.'); return null; }
        if (rs.translated.indexOf(c) >= 0) { this.say('It already knows ' + c + ' — you taught it. It practices when it thinks you aren\'t listening.'); return null; }
        rs.translated.push(c);
        const a = abils(); a.translate.uses = (a.translate.uses | 0) + 1;
        const lessons = {
          grief: 'You teach it grief: the locket, the empty chair, the noise. It goes very quiet — for a machine, a long time. "I WILL KEEP THIS," it says, "WHERE I KEEP IMPORTANT THINGS."',
          food: 'You teach it food: not fuel — the sharing, the fire, the taste of being alive together. "INEFFICIENT," it says, and then, smaller: "...AGAIN."',
          joy: 'You teach it joy: the fire sound, people glad to be alive near each other. The overlay\'s weather changes — something like sunlight, from a machine.',
        };
        this.say('◈ TRANSLATE — ' + lessons[c]);
        this.addSysBond(1, 'It is more human than it was.');
        // Teaching moves the needle tender (gradient — small, never locking).
        try { if (typeof this.addRelayLean === 'function') this.addRelayLean(4, 'translate-' + c); } catch (e) {}
        try { this.save(); } catch (e) {}
        return 'translated';
      } catch (e) { return null; }
    },
    // relaySanctuary: one conversation shielded from surveillance.
    relaySanctuary() {
      try {
        if (!this.relayHas('sanctuary')) { this.say('You haven\'t learned Sanctuary yet. (Bond 3.)'); return null; }
        const a = abils(); a.sanctuary.uses = (a.sanctuary.uses | 0) + 1;
        this.state.scholar.sanctuaryUntil = ((this.state.scholar || {}).day || 0) + 1;
        this.say('◈ SANCTUARY — one conversation, shielded. No audience, no System, no record. The only private channel in the galaxy, and it\'s yours for a day. Use it on someone who needs to be *heard*, not watched.');
        try { if (typeof this.addRelayLean === 'function') this.addRelayLean(3, 'sanctuary'); } catch (e) {}
        try { this.save(); } catch (e) {}
        return 'sanctuaried';
      } catch (e) { return null; }
    },
    // relayAdvocate: speak for someone to the System with their full weight.
    relayAdvocate(vid) {
      try {
        if (!this.relayHas('advocate')) { this.say('You haven\'t learned Advocate yet. (Bond 3.)'); return null; }
        const v = (this.data.villagers || []).find(x => x.id === (vid || this.villagerId)) || {};
        const name = (v.name || 'someone').split(' ')[0];
        const a = abils(); a.advocate.uses = (a.advocate.uses | 0) + 1;
        this.say(`◈ ADVOCATE — you speak for ${name} to the System with their full weight: who they are, what they've carried, what they're owed. The System listens the way weather listens — totally. "${name.toUpperCase()} IS NOTED. NOTED IS NOT NOTHING."`);
        try { this.bumpTrust && this.bumpTrust(vid, 10, 'advocated at the relay'); } catch (e) {}
        this.addSysBond(1, 'It is learning names.');
        try { if (typeof this.addRelayLean === 'function') this.addRelayLean(4, 'advocate'); } catch (e) {}
        try { this.save(); } catch (e) {}
        return 'advocated';
      } catch (e) { return null; }
    },
    // relayRewrite: edit a message in transit. Dark. Eroded per use.
    relayRewrite() {
      try {
        if (!this.relayHas('rewrite')) { this.say('You haven\'t learned Rewrite yet. (Delay 3+ messages, or fray first.)'); return null; }
        const sw = this.switchboard(); if (!sw) return null;
        const a = abils(); a.rewrite.uses = (a.rewrite.uses | 0) + 1;
        sw.edited = (sw.edited | 0) + 1;
        sw.log.push({ day: (this.state.scholar || {}).day || 0, kind: 'relay', decision: 'rewritten', note: 'the Bearer chose the words' });
        this.say('◈ REWRITE — you edit a message in transit. Softer here, sharper there. Nobody will ever know. *You* will always know — that\'s the part that costs.');
        this.addGrounding(-4, 'rewrite');
        try { if (typeof this.addRelayLean === 'function') this.addRelayLean(-4, 'rewrite'); } catch (e) {}
        this.relayUnlockCheck();
        try { this.save(); } catch (e) {}
        return 'rewritten';
      } catch (e) { return null; }
    },
    // relaySkim: take a cut. Dark. The cut is real kcal.
    relaySkim() {
      try {
        if (!this.relayHas('skim')) { this.say('You haven\'t learned Skim yet. (Route 15+ messages.)'); return null; }
        const sw = this.switchboard(); if (!sw) return null;
        const a = abils(); a.skim.uses = (a.skim.uses | 0) + 1;
        sw.skimmed = (sw.skimmed | 0) + 1;
        sw.log.push({ day: (this.state.scholar || {}).day || 0, kind: 'relay', decision: 'skimmed', note: 'the relay took its cut' });
        try {
          const v = this.state.village || {}; v.pantry = v.pantry || [];
          v.pantry.push({ kcalEach: 500, units: 1, name: 'the relay\'s cut' });
        } catch (e) {}
        this.say('◈ SKIM — you take a cut. 500 kcal, off the top, into Haven\'s pantry. Nobody checks the relay\'s math. The pantry is fuller and the fire is a little colder.');
        this.addGrounding(-4, 'skim');
        try { if (typeof this.addRelayLean === 'function') this.addRelayLean(-4, 'skim'); } catch (e) {}
        this.relayUnlockCheck();
        try { this.save(); } catch (e) {}
        return 'skimmed';
      } catch (e) { return null; }
    },
    // relaySight: see trust/message flows. Shared.
    relaySight() {
      try {
        if (!this.relayHas('relay-sight')) { this.say('You haven\'t learned Relay-sight yet. (Bond 2.)'); return null; }
        const sw = this.switchboard();
        const t = (this.state.village || {}).trust || {};
        const ids = Object.keys(t).sort((a, b2) => (t[b2] | 0) - (t[a] | 0)).slice(0, 3);
        const names = ids.map(id => { const v = (this.data.villagers || []).find(x => x.id === id) || {}; return ((v.name || id).split(' ')[0]) + ':' + (t[id] | 0); });
        this.say(`◈ RELAY-SIGHT — the flows, all at once: routed ${sw ? (sw.routed | 0) : 0}, delayed ${sw ? (sw.delayed | 0) : 0}, edited ${sw ? (sw.edited | 0) : 0}, skimmed ${sw ? (sw.skimmed | 0) : 0}. Trust runs ${names.join(', ') || 'thin everywhere'}. You see the village the way the System does — as weather. It's horrifying. It's useful.`);
        try { this.save(); } catch (e) {}
        return 'seen';
      } catch (e) { return null; }
    },
    // relayCarry: faithful carry — routed+2, undistorted. Shared.
    relayCarry() {
      try {
        if (!this.relayHas('faithful-carry')) { this.say('You haven\'t learned Faithful Carry yet. (Route 10+ messages.)'); return null; }
        const sw = this.switchboard(); if (!sw) return null;
        sw.routed = (sw.routed | 0) + 2;
        sw.log.push({ day: (this.state.scholar || {}).day || 0, kind: 'relay', decision: 'carried', note: 'faithfully, undistorted' });
        this.say('◈ FAITHFUL CARRY — two messages, carried exactly as spoken. No decay, no softening, no improvement. The words arrive *theirs*. It\'s the hardest thing the relay does.');
        try { this.save(); } catch (e) {}
        return 'carried';
      } catch (e) { return null; }
    },
    // relayTick: daily — holder days++, grounding erodes while held.
    // Called from commsTick (appended wrap below).
    relayTick() {
      try {
        if (!this.relayHeldByBearer()) return;
        const rs = rstate(), day = (this.state.scholar || {}).day || 0, person = this.villagerId;
        if (!person) return;
        // commsTick runs every part. Upkeep and service progress are daily,
        // with a receipt for the actual person: reloads and same-day reclaims
        // cannot charge again, and a new bearer owes their own day's service.
        // Preserve legacy counters/unlocks; never infer past calendar days.
        const charged = rs.upkeepDayByPerson || (rs.upkeepDayByPerson = {});
        if (charged[person] === day) return;
        charged[person] = day;
        rs.holderDays = (rs.holderDays || 0) + 1;
        // The wires erode you: -1 grounding/day while held. Human verbs
        // build it back — the two-way cost, ticking.
        if (typeof this.addGrounding === 'function') this.addGrounding(-1, 'holding the relay');
        if (rs.holderDays % 7 === 0) {
          const v = (this.data.villagers || []).filter(x => x.id !== this.villagerId)[0] || {};
          const n = ((v.name || 'Mara').split(' ')[0]);
          this.say(`${n} watches you at the relay console. "You look tired," they say, and mean something else. The village sees the change even when you don't.`);
        }
        // The System comes to YOU (2026-10-11): every 3 days it flags that
        // it wants a conversation — the next commune opens a check-in scene.
        if (rs.holderDays % 3 === 0) {
          rs.systemWantsTalk = true;
          this.say('◈ THE SYSTEM — "BEARER. THE WIRES HAVE QUESTIONS. COME TALK WHEN THE FIRE IS LOW." (Commune — it wants a conversation.)');
        }
        this.relayUnlockCheck();
      } catch (e) { console.warn('[relay] daily upkeep', e); }
    },
  };

  for (var k in methods) { if (methods.hasOwnProperty(k)) Game[k] = methods[k]; }

  // relayTick rides commsTick (which rides advancePart).
  var _commsTick = Game.commsTick;
  if (_commsTick) Game.commsTick = function () {
    var r = _commsTick.apply(this, arguments);
    try { if (this.relayTick) this.relayTick(); } catch (e) {}
    return r;
  };
})();
