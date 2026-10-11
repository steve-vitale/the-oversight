// @ontology
// system: convo-dialogue
// description: Dialogue-driven conversation turn handling. Phase 1 (2026-10-08): the dead menu layers are gone — dialogueBeatKind/dialogueResponses and the convoChoices override were removed; the single menu builder is Game.buildMenu (conversation.js). This module now wraps Game.convoTurn with dlg: handlers. REBUILD (2026-10-11, Steve): the handlers speak through the want defs (engage/deflect/commit beats), pool every hardcoded line via convoPickCycle (the verbatim "Anyway." loop is dead), compose beats before emission via convoComposeDlg, advance the want arc directly (convoWantEngage), and emit ONLY through sayLine — the single emission choke point. New handlers: dlg:commit (formal commitment), dlg:heed (heeding a warning), dlg:stay (keeping company).
// provides:
//   - convoTurn(vid, choiceId) -> dlg: beat handlers (menu building delegated to Game.buildMenu)
//   - convoComposeDlg(vid, line, choiceId) -> beat composition at selection time
//   - convoMarkSubstantive(vid, choiceId) -> substance gate for early-return wrappers
// rules:
//   - beat_drives_menu: responses derive from the NPC's last utterance, not from state flags (code: buildMenu, Steve 2026-10-06; Phase 1 unified 2026-10-08)
//   - no_feature_cut: every existing conversation feature remains reachable — mapped, not removed (code: DIALOGUE_FEATURE_MAP, Steve 2026-10-06)
//   - subject_change_explicit: the topic grab-bag lives behind "talk about something else", never as the default (code: buildMenu, Steve 2026-10-06)
//   - thread_dry_collapse: "tell me more" is offered only while the thread has beats — once dry, the option disappears and the menu winds down instead of looping the admission line (code: buildMenu + dlg:more/dlg:react, 2026-10-06)
//   - substantive_light_set: bare acknowledgments (goon/leave/recap/dlg:react/dlg:more/agree/joke/silence/nv:nod/nv:smile/nv:pointself) never flip c.substantive — only real engagement earns endConvo's mood residue, talk-capped at 40 (code: convoTurn wrapper + convoMarkSubstantive, break-it 2026-10-09 r8)
//   - want_arc_in_handlers: every dlg: handler advances the want via convoWantEngage (engage/deflect/commit) and speaks the want def's beats — the want is the spine, not a post-turn afterthought (code: dlg:help/dlg:commit/dlg:heed/dlg:stay/dlg:cant/dlg:comfort, rebuild 2026-10-11)
//   - emission_choke_point: no dlg: handler pushes NPC transcript entries directly — all NPC lines pass through sayLine (no-repeat ledger, transcript, feed) (code: every handler, rebuild 2026-10-11)
//   - soft_probe_mounts_evidence: "That doesn't add up" is a real verb, not flavor — it mounts 'prodded' evidence on the first open doubt and the NPC visibly rattles with repeated prods (code: dlg:doubt handler, Steve 2026-10-06)
// consumes:
//   - village.villagers
//   - state.convos
//   - convoGet(vid)
//   - buildMenu(vid) / convoChoices(vid) (conversation.js — the single menu pipeline)
//   - playerVoice()
// ============ DIALOGUE-DRIVEN CONVERSATION ============
// Steve 2026-10-06: "Conversations need to feel real. Every NPC beat generates
// its own response options — what would a person actually say back to THIS."
//
// The old system built a topic-selection menu from ~15 independent systems.
// The NPC said something, and your options weren't responses to it — they were
// a grab-bag. This module inverts it: the beat drives the menu.
//
// Every existing feature survives — mapped into the dialogue model, not cut.
// See DIALOGUE_FEATURE_MAP below for the complete inventory.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // ============ FEATURE INVENTORY (Steve 2026-10-06) ============
  // Every one of these must remain reachable. Mapped, not removed.
  const DIALOGUE_FEATURE_MAP = {
    // INFORMATION
    gossip: 'share beat → "tell me more" / "who else knows?" / ask via subject menu',
    news: 'share beat → engage responses',
    rumors: 'share beat (I heard...) → "tell me more" / "is that true?"',
    rumor_spread: 'subject menu → spread_rumor (two-step: target, type)',
    teaching: 'share beat (lesson) → "show me" / "I see" / "explain that part"',
    learning: 'ask via subject menu → they teach',
    // RELATIONSHIPS
    trust: 'built into responses — engage builds, deflect costs',
    comfort: 'feel beat → "are you alright?" / "that sounds hard"',
    companionship: 'want:just_company → "I\'m here" / stay a while',
    personal: 'subject menu → ask:personal (their own words)',
    // TRANSACTIONS
    trade: 'offer beat → "deal" / "show me" / "not now"',
    hawking: 'offer beat (hawker) → same',
    favors: 'want:ask_favor → "how can I help?" / "I can\'t right now"',
    promises: 'want beat deep → "I promise" / "I\'ll try" / "I can\'t"',
    // PARTY
    invite: 'positive beat + trust → "want to come with us?" (contextual)',
    // CONFLICT
    confrontation: 'doubts → "I need to ask you something" (contextual)',
    lies: 'their story → "that doesn\'t add up" (soft probe: rattles them, mounts evidence that makes the hard confrontation more likely to crack them)',
    observation: 'contextual — "I\'ve been watching you" (2nd convo+ or doubts)',
    // PERSONAL (via subject menu — explicitly changing the subject)
    past: 'subject menu → ask:past',
    goals: 'subject menu → ask:goal',
    village: 'subject menu → ask:village',
    plans: 'subject menu → ask:plans',
    theorize: 'subject menu → theorize (or contextual on mystery beats)',
    // WANTS (drive the beats themselves)
    want_share_news: 'NPC shares → share beat responses',
    want_ask_favor: 'NPC asks → want beat responses',
    want_seek_comfort: 'NPC vulnerable → feel beat responses',
    want_warn_you: 'NPC warns → share beat ("tell me more" / "are you sure?")',
    want_curious: 'NPC asks about you → question beat (answer it)',
    want_just_company: 'NPC hangs out → small beat ("this is nice" / stay)',
    // SYSTEM
    secrets: 'high trust → share beat (secret) with weight',
    grief: 'grief beat → feel responses',
    cheer: 'cheer beat → share responses',
    reactive_q: 'question beat → answers first (unchanged machinery)',
    nonverbal: 'gesture responses (unchanged)',
    language: 'speak_back contextual (unchanged)',
    leave: 'always available — "I should go."',
  };

  // NOTE (dialog rethink Phase 1, Steve 2026-10-08): beat classification
  // and response generation now live in exactly one place —
  // Game.beatMenuResponses in convo-beats.js, called by Game.buildMenu
  // in conversation.js. The dead dialogueBeatKind/dialogueResponses
  // that lived here (overridden by load order) were deleted.

  // ============ DIALOGUE TURN HANDLERS ============
  // These process the dialogue responses. They hook into existing systems —
  // we're changing what's OFFERED, not how it's processed.

  // SUBSTANCE — the light set, hoisted so every wrapper can share it.
  // Bare acknowledgments never mark a conversation substantive; everything
  // else does. (r2 2026-10-09: 'agree'/'joke'/'silence'/nv gesture acks were
  // missing from the first version and farmed the residue.)
  function convoIsLightChoice(choiceId) {
    return choiceId === 'goon' || choiceId === 'leave' || choiceId === 'recap' ||
      choiceId === 'dlg:react' || choiceId === 'dlg:more' ||
      choiceId === 'agree' || choiceId === 'joke' || choiceId === 'silence' ||
      choiceId === 'nv:nod' || choiceId === 'nv:smile' || choiceId === 'nv:pointself';
  }

  // convoMarkSubstantive: the choke point's other half (socialite break-it
  // r8 2026-10-09). The :94 wrapper below only sees choice ids that reach
  // it — four outer wrappers intercept non-light ids with early returns
  // (convo-beats dlg:subject, party-formal party picks, truth confront:,
  // betrayal betrayal:) and never delegated, so real engagement (a subject
  // change, a confrontation, naming the party) silently failed the
  // substantive gate. Any wrapper that short-circuits a turn must call this.
  Game.convoMarkSubstantive = function (vid, choiceId) {
    try {
      const c = this.convoGet(vid);
      if (c && c.active && typeof choiceId === 'string' && !convoIsLightChoice(choiceId)) {
        c.substantive = true;
      }
    } catch (e) {}
  };

  // convoComposeDlg: beat composition for the dlg: handlers. The beat
  // acknowledges what the player just said BEFORE emission — the
  // transcript holds the composed line and the no-repeat ledger sees the
  // final string. (convo rebuild 2026-10-11: composition moved to
  // beat-selection time, in every path, not just the base turn.)
  Game.convoComposeDlg = function (vid, line, choiceId) {
    try {
      if (line && typeof this.convoComposeBeat === 'function' && typeof this.convoPlayerSaid === 'function') {
        const composed = this.convoComposeBeat(vid, line, this.convoPlayerSaid(vid, choiceId));
        if (composed) return composed;
      }
    } catch (e) {}
    return line;
  };

  const origTurn = Game.convoTurn;
  Game.convoTurn = function (vid, choiceId) {
    const c = this.convoGet(vid);

    // SUBSTANCE (socialite break-it 2026-10-08): endConvo's mood residue
    // must only linger on a REAL conversation — agree-spam ("yeah",
    // "tell me more", continuer taps) must not smuggle trust past the 40
    // talk cap. This wrapper is the choke point: every choice id that
    // reaches it is checked (dlg: handled below, the rest delegated).
    // Anything but the light acknowledgments marks the conversation
    // substantive. Wrappers that intercept EARLY (never delegating here)
    // call convoMarkSubstantive instead — see above.
    if (c && c.active && typeof choiceId === 'string' && !convoIsLightChoice(choiceId)) {
      c.substantive = true;
    }

    // Dialogue responses — handle here, then delegate.
    // UNSPOOKEN BEATS (socialite 2026-10-10): every dlg: branch below
    // early-returns without reaching the base turn handler — run the shared
    // choke point first, or queued beats (ask, winddown) never die on
    // dialogue choices and a stuck heldAsk defeats the winddown gate.
    try { if (typeof this.convoDropUnspoken === 'function') this.convoDropUnspoken(vid, choiceId); } catch (e) {}
    if (choiceId && choiceId.indexOf('dlg:') === 0) {
      const dlg = choiceId.slice(4);

      if (dlg === 'subject') {
        // Explicit subject change — open the topic menu.
        c.choosingSubject = true;
        c.transcript.push({ who: 'you', text: '"Can I ask you something else?"' });
        // sayLine is the single emission choke point: it pushes the
        // transcript entry, feeds, and records the beat. No manual pushes.
        const line = this.convoPickCycle(vid, 'dlg:subject:ack', [
          '"Sure — what\'s on your mind?"',
          '"Yeah? What\'s up?"',
          '"Of course. Ask."',
        ]) || '"Sure — what\'s on your mind?"';
        this.sayLine(vid, line);
        return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'more') {
        // "Tell me more" — continue the thread.
        c.transcript.push({ who: 'you', text: '"Tell me more."' });
        const beat = this.convoThreadBeat(vid);
        if (beat) {
          c.threadDryFor = null; // thread is alive — clear any stale dry marker
          // Beat composition: the beat acknowledges what was just said.
          const composed = this.convoComposeDlg(vid, beat, choiceId);
          this.sayLine(vid, composed);
          // Engaging with the thread engages the want behind it.
          this.convoWantEngage(vid, 'engage');
          // Trust: engaging builds it. SCENE (Phase 2): through the resolver.
          try { this.resolveConsequence(vid, { trust: 1, temper: 'neutral', name: 'dlg:more' }); } catch (e) {}
          return { line: composed, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
        }
        // Thread's dry — honest admission, once. Mark the thread dry so the
        // menu stops offering "tell me more" and winds down instead.
        c.threadDryFor = c.thread;
        const line = this.convoPickCycle(vid, 'dlg:more:dry', [
          '"That\'s... pretty much all of it, honestly."',
          '"I wish there was more to tell. That\'s it."',
          '"That\'s the whole of it. Sorry."',
        ]) || '"That\'s... pretty much all of it, honestly."';
        this.sayLine(vid, line);
        return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'react') {
        // Generic acknowledgment — small trust, thread continues loosely.
        const reacts = ['"Huh."', '"I see."', '"Yeah."'];
        const youSaid = reacts[Math.floor(Math.random() * reacts.length)];
        c.transcript.push({ who: 'you', text: youSaid });
        // SCENE (Phase 2): through the resolver.
        try { this.resolveConsequence(vid, { trust: 0.5, temper: 'neutral', name: 'dlg:react' }); } catch (e) {}
        // They continue or wind down naturally. On a dry thread, don't fish
        // for beats — go straight to the wind-down.
        const dry = c.thread && c.threadDryFor && c.thread === c.threadDryFor;
        // WIND-DOWN (dialogue rethink, Steve 2026-10-07; farm fix 2026-10-08):
        // every react that lands on no beat is a dead "Anyway." — count it
        // whether or not the thread was formally marked dry. A thread that
        // merely ran out of beats (never dried via dlg:more) used to offer
        // react forever, each tap printing +0.5 trust: an infinite trust
        // farm on a dead button. After two dead reacts in a row the menu
        // stops offering it (convo-beats.js reads c.reactDryCount); a landed
        // beat resets the count (see convoThreadBeat).
        const beat = (!dry && Math.random() < 0.6) ? this.convoThreadBeat(vid) : null;
        if (beat) {
          c.threadDryFor = null;
          const composed = this.convoComposeDlg(vid, beat, choiceId);
          this.sayLine(vid, composed);
          return { line: composed, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
        }
        c.reactDryCount = (c.reactDryCount || 0) + 1;
        // REBUILD 2026-10-11: the hardcoded "Anyway." looped VERBATIM —
        // the exact filler Steve called out. Pooled, cycled, never repeated.
        const line = this.convoPickCycle(vid, 'dlg:react:dead', [
          '"Anyway." A small smile.',
          '"So." They look at the fire for a moment.',
          '"Well." A breath. "That\'s where things stand."',
          'They nod slowly, not quite done, not quite continuing.',
        ]) || '"Anyway." A small smile.';
        this.sayLine(vid, line);
        return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'comfort' || dlg === 'empathize') {
        // Emotional engagement — real trust, mood shift.
        const youSaid = dlg === 'comfort' ? '"Are you okay?"' : '"That sounds really hard."';
        c.transcript.push({ who: 'you', text: youSaid });
        // SCENE (Phase 2): through the resolver.
        try { this.resolveConsequence(vid, { trust: 2, mood: 1, temper: 'kind', name: 'dlg:' + dlg }); } catch (e) {}
        // They open up a little more, or accept the comfort.
        const raw = this.convoPickCycle(vid, 'dlg:comfort:lines', [
          '"Thanks. ...Thanks for saying that."',
          '"I — yeah. It helps, hearing that."',
          '"You\'re kind. Don\'t let this place change that."',
        ]) || '"Thanks. ...Thanks for saying that."';
        const line = this.voiceLine ? this.voiceLine(vid, raw) : raw;
        this.sayLine(vid, line, { tag: 'comfort' });
        // Comforting them engages their want (seek_comfort -> comforted).
        this.convoWantEngage(vid, 'engage');
        return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'askwhy') {
        // "What happened?" — they tell the story.
        c.transcript.push({ who: 'you', text: '"What happened?"' });
        const beat = this.convoThreadBeat(vid);
        const raw = beat || this.convoPickCycle(vid, 'dlg:askwhy:dry', [
          '"Long story. ...Maybe another time."',
          '"Someday I\'ll tell it right. Not tonight."',
        ]) || '"Long story. ...Maybe another time."';
        const composed = this.convoComposeDlg(vid, raw, choiceId);
        this.sayLine(vid, composed);
        // SCENE (Phase 2): through the resolver.
        try { this.resolveConsequence(vid, { trust: 1, temper: 'kind', name: 'dlg:askwhy' }); } catch (e) {}
        this.convoWantEngage(vid, 'engage');
        return { line: composed, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'help') {
        // "How can I help?" — engage with their want (Steve 2026-10-06).
        // REBUILD 2026-10-11: the NPC states the favor from the WANT DEF —
        // the def owns the concrete ask (never "Here's the thing —" loops).
        c.transcript.push({ who: 'you', text: '"How can I help?"' });
        // SCENE (Phase 2): through the resolver.
        try { this.resolveConsequence(vid, { trust: 2, temper: 'kind', name: 'dlg:help' }); } catch (e) {}
        let favorLine = null;
        try {
          const w = c.want;
          if (w && w.def && typeof w.def.engageBeat === 'function') {
            // The def speaks: the concrete favor (ask_favor), the real news
            // (share_news), the deepened feeling (seek_comfort).
            favorLine = w.def.engageBeat.call(this, vid);
          }
        } catch (e) { favorLine = null; }
        if (!favorLine) favorLine = '"Really? ...Thank you. I\'ll let you know what I need."';
        const composed = this.convoComposeDlg(vid, favorLine, choiceId);
        this.sayLine(vid, composed, { tag: (c.want && c.want.id === 'ask_favor') ? 'favor' : undefined });
        // NOTE (socialite r11 2026-10-10): this does NOT set c.offeredHelp.
        // That's the FORMAL vow's flag (offer_help -> promiseHelp, tracked,
        // can rot). A casual "how can I help" must not lock the formal
        // promise out of the menu — asking, then committing (dlg:commit), is
        // the honest escalation.
        this.convoWantEngage(vid, 'engage');
        return { line: composed, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'commit') {
        // "I'll do it." — the formal commitment. REBUILD 2026-10-11: new
        // handler. The want def speaks the commit beat; the state moves to
        // resolved with the def's resolution (promised/heeded/repaid).
        c.transcript.push({ who: 'you', text: '"I\'ll do it."' });
        try { this.resolveConsequence(vid, { trust: 3, mood: 1, temper: 'kind', name: 'dlg:commit' }); } catch (e) {}
        let beat = null;
        try {
          const w = c.want;
          if (w && w.def && typeof w.def.commitBeat === 'function') {
            beat = w.def.commitBeat.call(this, vid);
          }
        } catch (e) { beat = null; }
        if (!beat) beat = '"Thank you. Seriously — thank you."';
        this.sayLine(vid, beat);
        this.convoWantEngage(vid, 'commit');
        return { line: beat, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'heed') {
        // "I'll be careful." — heeding a warning. REBUILD 2026-10-11: new
        // handler. Engagement, not deflection — they wanted you warned.
        c.transcript.push({ who: 'you', text: '"I\'ll be careful."' });
        try { this.resolveConsequence(vid, { trust: 1, mood: 1, temper: 'kind', name: 'dlg:heed' }); } catch (e) {}
        const line = this.convoPickCycle(vid, 'dlg:heed:lines', [
          '"Good. I mean it — watch yourself out there."',
          '"Promise me that. Please."',
          '"Thank you. I needed to hear you say it."',
        ]) || '"Good. I mean it — watch yourself out there."';
        this.sayLine(vid, line, { tag: 'warning' });
        this.convoWantEngage(vid, 'engage');
        return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'stay') {
        // "I'll stay a while." — company kept. REBUILD 2026-10-11: new
        // handler for the just_company want's honest engagement.
        c.transcript.push({ who: 'you', text: '"I\'ll stay a while."' });
        try { this.resolveConsequence(vid, { trust: 1, mood: 1, temper: 'kind', name: 'dlg:stay' }); } catch (e) {}
        const line = this.convoPickCycle(vid, 'dlg:stay:lines', [
          '"Nice. Sit. The fire\'s warm."',
          '"Good. Company\'s company."',
          'They shift over, making room. "Stay as long as you like."',
        ]) || '"Nice. Sit. The fire\'s warm."';
        this.sayLine(vid, line, { tag: 'small' });
        this.convoWantEngage(vid, 'engage');
        return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'details') {
        // "Tell me more about it" — want details.
        c.transcript.push({ who: 'you', text: '"Tell me more about it."' });
        const beat = this.convoThreadBeat(vid);
        let raw = beat;
        if (!raw) {
          try {
            const w = c.want;
            if (w && w.def && typeof w.def.engageBeat === 'function') raw = w.def.engageBeat.call(this, vid);
          } catch (e) { raw = null; }
        }
        raw = raw || this.convoPickCycle(vid, 'dlg:details:dry', [
          '"It\'s... complicated. But thank you for asking."',
          '"I don\'t have the words for all of it. But thank you for asking."',
        ]) || '"It\'s... complicated. But thank you for asking."';
        const composed = this.convoComposeDlg(vid, raw, choiceId);
        this.sayLine(vid, composed);
        // SCENE (Phase 2): through the resolver.
        try { this.resolveConsequence(vid, { trust: 1, temper: 'kind', name: 'dlg:details' }); } catch (e) {}
        this.convoWantEngage(vid, 'engage');
        return { line: composed, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'cant') {
        // Refusing a favor (dialog rethink Phase 1, Steve 2026-10-08):
        // kind in the moment, but it COOLS the mood and WRITES a
        // 'deflected' memory — they remember you turned them down
        // (HURT_KINDS:'deflected' in convo-mood.js). Honest, and honest
        // things leave marks.
        c.transcript.push({ who: 'you', text: '"I can\'t right now."' });
        // SCENE (Phase 2): through the resolver — cools mood AND writes
        // the 'deflected' memory (HURT_KINDS slot, wired Phase 1).
        try {
          this.resolveConsequence(vid, {
            trust: -1, mood: -1, temper: 'neutral',
            memory: { type: 'deflected', note: 'you turned down their ask' },
            name: 'dlg:cant',
          });
        } catch (e) {}
        // REBUILD 2026-10-11: the deflection speaks the WANT DEF's
        // deflectBeat (their actual reaction), and advances the want arc —
        // deflected, not evaporated. The ending will name it.
        let raw = null;
        try {
          const w = c.want;
          if (w && w.def && typeof w.def.deflectBeat === 'function') raw = w.def.deflectBeat.call(this, vid);
        } catch (e) { raw = null; }
        const line = raw || this.convoPickCycle(vid, 'dlg:cant:lines', [
          '"Oh. ...No, I get it. Thanks for being straight with me."',
          '"No — it\'s fine. I shouldn\'t have asked."',
        ]) || '"Oh. ...No, I get it. Thanks for being straight with me."';
        this.sayLine(vid, line);
        this.convoWantEngage(vid, 'deflect');
        return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'doubt') {
        // "That doesn't add up" — a SOFT PROBE, distinct from the hard
        // confrontation (the confront: choice, added by truth.js).
        // DETECTIVE (Steve 2026-10-06): this used to be a dead verb — a
        // flavor line with no mechanics sitting next to the real
        // confrontation, so players could pick it and never find the verb
        // that actually works. Now it's real: the probe rattles them and
        // mounts 'prodded' evidence on the first open doubt, which raises
        // the odds that a later hard confrontation cracks them (truth.js).
        // Distinct verb, real effect, honest fiction.
        c.transcript.push({ who: 'you', text: '"That doesn\'t quite add up."' });
        // SCENE (Phase 2): through the resolver.
        try { this.resolveConsequence(vid, { mood: -1, temper: 'honest-hard', name: 'dlg:doubt' }); } catch (e) {}
        let prods = 0;
        try {
          const doubts = (typeof this.getDoubts === 'function' && this.getDoubts(vid)) || [];
          const d = doubts[0];
          if (d) {
            d.evidence = d.evidence || [];
            const dayN = (this.state.scholar || {}).day || 0;
            d.evidence.push('prodded (day ' + dayN + ') — got careful');
            prods = d.evidence.filter(e => String(e).indexOf('prodded') === 0).length;
          }
        } catch (e) {}
        // The fiction tracks the pressure: repeated prods visibly rattle them.
        const line = prods <= 1
          ? '"...What\'s that supposed to mean?" Their voice goes careful.'
          : prods === 2
          ? '"What are you getting at?" A glance away, then back. They\'re choosing their words now.'
          : 'They\'re rattled — hands busy, eyes everywhere but on you. "I\'ve told you what I\'ve told you."';
        this.sayLine(vid, line);
        return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }

      if (dlg === 'theorize') {
        // "What do you think it means?" — route to theorize.
        c.transcript.push({ who: 'you', text: '"What do you think it means?"' });
        // Delegate to the existing theorize handler.
        return origTurn.call(this, vid, 'theorize');
      }

      if (dlg === 'invite') {
        // "Want to come with us?" — route to party invite.
        c.transcript.push({ who: 'you', text: '"Want to come with us?"' });
        return origTurn.call(this, vid, 'invite_party');
      }
    }

    // Not a dialogue choice — delegate to the original handler.
    return origTurn.call(this, vid, choiceId);
  };

  // NOTE (dialog rethink Phase 1, Steve 2026-10-08): the menu-dispatch
  // override that lived here is deleted. Game.buildMenu in conversation.js
  // is now the single menu builder; it calls Game.beatMenuResponses
  // (convo-beats.js) for the beat matrix. This file keeps the dlg: turn
  // handlers only.

  // Expose the feature map for tests and documentation.
  Game.DIALOGUE_FEATURE_MAP = DIALOGUE_FEATURE_MAP;

  // WANT POST-TURN (dialogue rethink, Steve 2026-10-07): the dlg: branch of
  // the convoTurn wrapper above returns early, which bypassed convo-wants'
  // turn wrapper entirely — wants never surfaced, beats never composed, and
  // the want arc never advanced on the live dialogue path. Run the shared
  // post-turn for dlg: choices here. Non-dlg: choices are covered by the
  // wants wrapper inside; this only fires for 'dlg:' ids, so it never
  // double-processes. convo-beats.js wraps outside this and only intercepts
  // 'dlg:subject', which skips this hook once — acceptable.
  const _dlgTurnInner = Game.convoTurn;
  Game.convoTurn = function (vid, choiceId) {
    const r = _dlgTurnInner.call(this, vid, choiceId);
    if (r && !r.ended && typeof choiceId === 'string' && choiceId.indexOf('dlg:') === 0 &&
        typeof this.convoWantPostTurn === 'function') {
      try { return this.convoWantPostTurn(vid, choiceId, r) || r; } catch (e) { return r; }
    }
    return r;
  };
  // EXCHANGE COUNTING (socialite r10 2026-10-10): the dlg: handlers above
  // return early without reaching the base turn handler, so c.exchanges
  // never counted dialogue turns — a 6-turn "tell me more" conversation
  // read as exchanges=0 (zero stipend, residue unreachable, and the
  // promise-keep gate had nothing to stand on). A spoken turn that gets an
  // answer IS an exchange. Count them here, once, for every dlg: choice
  // that the inner wrapper handled itself. theorize/invite delegate to the
  // base handler, which counts its own — exclude them to avoid double
  // counting. (agree/joke/silence are not dlg: choices; the base counts
  // those already.)
  const _dlgTurnCounted = Game.convoTurn;
  Game.convoTurn = function (vid, choiceId) {
    const r = _dlgTurnCounted.call(this, vid, choiceId);
    try {
      if (r && !r.ended && typeof choiceId === 'string' && choiceId.indexOf('dlg:') === 0) {
        const dlg = choiceId.slice(4);
        if (dlg !== 'theorize' && dlg !== 'invite') {
          const c = this.convoGet(vid);
          if (c && c.active) c.exchanges = (c.exchanges || 0) + 1;
        }
      }
    } catch (e) {}
    return r;
  };
})();
