// @ontology
// system: convo-beats
// description: Beat-tagged conversation. Every NPC line is tagged at generation time with its beat (offer, question, news, feeling, small). Replies are generated from beat + topic, never a generic grab-bag. Topic changes carry explicit bridge lines.
// provides:
//   - threadBeatTag(thread) -> beat tag for a conversation thread
//   - Game.beatOf(vid) -> current beat {tag, topic, line}
//   - Game.bridgeLine(vid, fromTopic) -> contextual bridge when leaving a topic
//   - Game.beatMenuResponses(vid) -> beat+topic aware replies with variation
// rules:
//   - tag_at_source: every NPC line is tagged when generated, not classified after the fact (code: convo-beats.js wrapOpening/wrapThreadBeat, Steve 2026-10-06)
//   - beat_drives_replies: reply options derive from (beat, topic), never from state flags alone (code: beatMenuResponses, Steve 2026-10-06)
//   - bridge_on_shift: topic changes speak a bridge line tied to the old topic (code: bridgeLine, Steve 2026-10-06)
//   - no_repeat_replies: reply pools rotate via convoPickCycle — two conversations never show identical menus (code: beatMenuResponses, Steve 2026-10-06)
//   - four_rules_kept: transcript_cap, one_beat_turns, tap_advance, history_view untouched (code: conversation.js ontology)
//   - probe_on_news_and_small: the "That doesn't add up" soft probe is offered on news and small beats (wherever the hard confrontation is reachable); withheld on feeling/offer beats (code: beatMenuResponses, Steve 2026-10-06)
// consumes:
//   - village.villagers
//   - state.convos
//   - convoGet(vid)
//   - convoPickCycle(vid, key, pool)
// ============ BEAT-TAGGED CONVERSATION ============
// Steve 2026-10-06 (Idea: "Make every reply answer what's actually said"):
// Every NPC line IS an offer, a question, a news item, or a feeling — tagged
// at generation, not guessed afterward. Every reply option answers THAT beat
// on THAT topic. Topic changes speak a bridge, never a hard pivot.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // ============ BEAT TAXONOMY ============
  // offer: they want something from you (trade, favor, request)
  // question: they're asking you directly (answered via existing machinery)
  // news: they're telling you something (goal, past, gossip, secret, village)
  // feeling: they're feeling something (grief, cheer, comfort-seeking)
  // small: chit-chat, companionship, nothing heavy
  const BEAT_TAGS = ['offer', 'question', 'news', 'feeling', 'small'];

  function threadBeatTag(thread, c) {
    if (!thread) return 'small';
    // Direct questions and offers — checked first, they own the menu.
    if (c && (c.pendingQ || (c.reactiveQ && c.reactiveQ.id) || c.genericQ)) return 'question';
    if (c && ((c.thread === 'trade' && c.pendingTrade) || c.pendingHawk)) return 'offer';
    switch (thread) {
      case 'request': return 'news'; // an actual question above owns answers
      case 'secret': return 'news';
      case 'want': {
        // Distinguish by want ID (Steve 2026-10-06).
        // Only ask_favor is truly an 'offer' (they need something FROM you).
        // The DIALOGUE_FEATURE_MAP specifies the correct beat per want type.
        const wid = c && c.want && c.want.id;
        if (wid === 'ask_favor') return 'offer';
        if (wid === 'seek_comfort') return 'feeling';
        if (wid === 'share_news') return 'news';
        if (wid === 'warn_you') return 'news';
        if (wid === 'curious') return 'news'; // live question state owns asks
        if (wid === 'just_company') return 'small';
        return 'offer'; // fallback for unknown wants
      }
      case 'taughtref': return 'news';
      case 'recall': return 'news';
      case 'grief': return 'feeling';
      case 'cheer': return 'feeling';
      case 'goal': return 'news';
      case 'past': return 'news';
      case 'village': return 'news';
      case 'plans': return 'news';
      case 'personal': return 'news';
      case 'theorize': return 'news';
      case 'gossip': return 'news';
      case 'small': return 'small';
      case 'trade': return 'offer';
      case 'nonverbal': return 'small';
      default: return 'news';
    }
  }
  Game.threadBeatTag = threadBeatTag;

  // ============ TAG AT THE SOURCE ============
  // Wrap the two line generators. Every NPC line leaves here carrying
  // its beat tag. No regex classification needed downstream.

  function tagResult(vid, result) {
    ensureTranscriptTagged(Game, vid);
    if (!result || !result.line) return result;
    const c = Game.convoGet(vid);
    const tag = threadBeatTag(result.thread, c);
    result.beat = tag;
    // Record the beat — this is what replies answer.
    c.lastBeat = { tag, topic: result.thread || c.thread || 'small', line: result.line };
    return result;
  }

  if (Game.convoOpening) {
    const origOpening = Game.convoOpening;
    Game.convoOpening = function (vid, want) {
      return tagResult(vid, origOpening.call(this, vid, want));
    };
  }

  if (Game.convoThreadBeat) {
    const origBeat = Game.convoThreadBeat;
    Game.convoThreadBeat = function (vid) {
      const c = this.convoGet(vid);
      ensureTranscriptTagged(Game, vid);
      const line = origBeat.call(this, vid);
      if (!line) return null;
      // Tag the beat. The line itself stays a primitive string — callers
      // use it as one. The tag lives in c.lastBeat; beatOf() reads it.
      const tag = threadBeatTag(c.thread, c);
      c.lastBeat = { tag, topic: c.thread || 'small', line: String(line) };
      return line;
    };
  }

  // beatOf: the current beat. Reads the tag — never guesses from text.
  // Re-classifies 'want' threads by want ID (Steve 2026-10-06): the lastBeat
  // is cached from the opening, before c.want is set, so it may have the
  // wrong tag for the actual want type.
  Game.beatOf = function (vid) {
    const c = this.convoGet(vid);
    if (c.spokenBeat) return c.spokenBeat;
    if (c.lastBeat && c.lastBeat.tag) {
      // Re-classify want threads by want ID — the cached tag may be wrong.
      if (c.lastBeat.tag === 'offer' && c.thread === 'want' && c.want && c.want.id) {
        const wid = c.want.id;
        let newTag = 'offer';
        if (wid === 'seek_comfort') newTag = 'feeling';
        else if (wid === 'share_news') newTag = 'news';
        else if (wid === 'warn_you') newTag = 'news';
        else if (wid === 'curious') newTag = 'question';
        else if (wid === 'just_company') newTag = 'small';
        // ask_favor stays 'offer'
        if (newTag !== 'offer') {
          return { tag: newTag, topic: c.lastBeat.topic, line: c.lastBeat.line };
        }
      }
      return c.lastBeat;
    }
    // Fallback for conversations started before tagging (or nonstandard flows).
    const tag = threadBeatTag(c.thread, c);
    return { tag, topic: c.thread || 'small', line: null };
  };

  // Only actual emission establishes reply context. Generated or queued
  // lines and player-move bookkeeping cannot replace the displayed beat.
  Game.convoRecordSpokenBeat = function (vid, line, opts) {
    const c = this.convoGet(vid);
    const topic = opts?.topic || c.thread || 'small';
    const tag = opts?.tag || (c.choosingSubject ? 'prompt' : threadBeatTag(c.thread, c));
    c.spokenBeat = { tag, topic, line: String(line) };
  };

  // Tag transcript entries: every 'them' line carries its beat tag.
  // Wrapped once per convo — the push stamps the entry from c.lastBeat.
  function ensureTranscriptTagged(Game, vid) {
    const c = Game.convoGet(vid);
    if (!c.transcript || c.transcript._beatTagged) return;
    const origPush = c.transcript.push.bind(c.transcript);
    c.transcript.push = function (entry) {
      if (entry && entry.who === 'them' && !entry.beat && c.spokenBeat) {
        entry.beat = c.spokenBeat.tag;
        entry.topic = c.spokenBeat.topic;
      }
      return origPush(entry);
    };
    c.transcript._beatTagged = true;
  }

  // ============ BRIDGE LINES ============
  // When the topic shifts, the NPC speaks a bridge tied to the OLD topic.
  // Never a hard pivot. Voiced per person (voiceLine), never hardcoded flat.
  const BRIDGES = {
    grief: ['"Sorry — I got lost in it for a second. What did you want to ask?"', '"...Anyway. Sorry. What\'s on your mind?"'],
    cheer: ['"Ha — sorry, I\'m rambling. What\'s up?"', '"Good times. What did you want to talk about?"'],
    goal: ['"Anyway — that\'s my cross to carry. What\'s on your mind?"', '"Right. Sorry, I go on about it. What did you want?"'],
    past: ['"Ancient history. What\'s on your mind?"', '"...That was a lifetime ago. What did you want to ask?"'],
    village: ['"That\'s the state of things. What\'s up?"', '"Anyway — people stuff. What did you want?"'],
    plans: ['"That\'s the plan, anyway. What\'s on your mind?"', '"We\'ll see how it goes. What did you want?"'],
    gossip: ['"That\'s what I heard, anyway. What\'s up?"', '"Take it with salt. What did you want to ask?"'],
    personal: ['"That\'s me, I guess. What\'s on your mind?"', '"Anyway. What did you want?"'],
    want: ['"Sorry — I shouldn\'t load that on you. What\'s up?"', '"Forget I said anything. What did you want?"'],
    secret: ['"Don\'t tell anyone I told you. What\'s on your mind?"', '"...Anyway. What did you want to ask?"'],
    small: ['"Sure — what\'s on your mind?"', '"Yeah? What\'s up?"'],
  };

  Game.bridgeLine = function (vid, fromTopic) {
    const c = this.convoGet(vid);
    const pool = BRIDGES[fromTopic] || BRIDGES.small;
    const pick = (typeof this.convoPickCycle === 'function')
      ? this.convoPickCycle(vid, 'bridge:' + (fromTopic || 'small'), pool)
      : pool[Math.floor(Math.random() * pool.length)];
    const line = pick || pool[0];
    const voiced = (typeof this.voiceLine === 'function') ? this.voiceLine(vid, line) : line;
    // Tag the bridge itself — it's a small beat, an invitation.
    c.lastBeat = { tag: 'small', topic: fromTopic || 'small', line: voiced };
    return voiced;
  };

  // ============ TOPIC-AWARE REPLIES ============
  // Every reply answers (beat, topic). Pools rotate — no two conversations
  // show the same menu. (Player voice does NOT shape these labels: the
  // phrasing is picked by convoPickCycle rotation alone.)

  // Reply pools: [beat][topic] -> array of {id, v: [label variants]}
  // beatMenuResponses rotates one variant per id via convoPickCycle.
  const REPLY_POOLS = {
    news: {
      past: [
        { id: 'dlg:more', v: ['"Tell me more."', '"Go on."', '"I’m listening."'] },
        { id: 'dlg:react', v: ['"Huh."', '"I can picture it."', '"That\'s a whole life."'] },
      ],
      goal: [
        { id: 'dlg:more', v: ['"Tell me more."', '"Go on."', '"I’m listening."'] },
        { id: 'dlg:react', v: ['"I hope you get there."', '"That matters."', '"Yeah."'] },
      ],
      village: [
        { id: 'dlg:more', v: ['"Tell me more."', '"Go on."', '"I’m listening."'] },
        { id: 'dlg:react', v: ['"I\'ve noticed."', '"We\'ll figure it out."', '"Hm."'] },
      ],
      plans: [
        { id: 'dlg:more', v: ['"Tell me more."', '"Go on."', '"I’m listening."'] },
        { id: 'dlg:react', v: ['"Good plan."', '"Be careful out there."', '"Sounds right."'] },
      ],
      gossip: [
        { id: 'dlg:more', v: ['"Tell me more."', '"Go on."', '"I’m listening."'] },
        { id: 'dlg:react', v: ['"No kidding."', '"Huh. People talk."', '"I\'ll keep that in mind."'] },
      ],
      personal: [
        { id: 'dlg:more', v: ['"Tell me more."', '"Go on."', '"I’m listening."'] },
        { id: 'dlg:react', v: ['"That tracks."', '"I get that."', '"Huh."'] },
      ],
      secret: [
        { id: 'dlg:more', v: ['"Tell me more."', '"Go on."', '"I’m listening."'] },
        { id: 'dlg:react', v: ['"I won\'t tell."', '"...Wow."', '"Okay."'] },
      ],
      _default: [
        { id: 'dlg:more', v: ['"Tell me more."', '"Go on."', '"I’m listening."'] },
        { id: 'dlg:react', v: ['"Huh."', '"I see."', '"Yeah."'] },
      ],
    },
    feeling: {
      grief: [
        { id: 'dlg:comfort', v: ['"You alright?"', '"Are you okay?"', '"Hey — you alright?"'] },
        { id: 'dlg:empathize', v: ['"Yeah. I get it."', '"That sounds really hard."', '"I hear you."'] },
        { id: 'dlg:askwhy', v: ['"What happened?"', '"Want to talk about it?"', '"Do you want to tell me?"'] },
      ],
      cheer: [
        { id: 'dlg:more', v: ['"Tell me more."', '"Go on."', '"I’m listening."'] },
        { id: 'dlg:react', v: ['"Nice."', '"Ha — good."', '"That\'s the spirit."'] },
      ],
      _default: [
        { id: 'dlg:comfort', v: ['"You alright?"', '"Are you okay?"', '"Hey — you alright?"'] },
        { id: 'dlg:empathize', v: ['"Yeah. I get it."', '"That sounds hard."', '"I hear you."'] },
      ],
    },
    offer: {
      _default: [
        { id: 'dlg:help', v: ['"How can I help?"', '"What do you need?"'] },
        { id: 'dlg:cant', v: ['"Can\'t right now."', '"Not right now, sorry."'] },
      ],
    },
    small: {
      _default: [
        { id: 'dlg:more', v: ['"Tell me more."', '"Go on."', '"I’m listening."'] },
        { id: 'dlg:react', v: ['"Huh."', '"Oh nice."', '"I see."'] },
      ],
    },
  };

  // beatMenuResponses: the beat+topic matrix menu builder. Called by
  // Game.buildMenu (conversation.js) — no longer an override of anything.
  // Questions and offers-with-machinery still defer (existing handlers).
  Game.beatMenuResponses = function (vid) {
    const c = this.convoGet(vid);
    const beat = this.beatOf(vid);
    const tag = beat.tag;
    const topic = beat.topic || 'small';

    // Questions and trade offers use their focused machinery — already dialogue-driven.
    if (tag === 'question') return null;
    if (tag === 'offer' && (c.pendingTrade || c.pendingHawk || c.thread === 'trade')) return null;
    if (c.thread === 'nonverbal' || c.thread === 'spread_rumor') return null;

    const out = [];
    const seen = new Set();
    const wantOwnsMenu = c.want?.def && c.want.stage > 0 && (!c.thread || c.thread === 'want' || c.thread === 'small');

    // THE WANT LEADS (convo rebuild 2026-10-11, Steve): the live want's
    // options come first — engage or deflect THAT want, not a grab-bag.
    // convoWantMenu is the authority for want options (the old
    // REPLY_POOLS.offer.want is deleted); dedupe by id so the pools below
    // never double-offer the same verb.
    try {
      if (typeof this.convoWantMenu === 'function') {
        const wantOpts = this.convoWantMenu(vid) || [];
        for (const o of wantOpts) {
          if (!o || !o.id || seen.has(o.id)) continue;
          seen.add(o.id);
          out.push(o);
        }
      }
    } catch (e) {}

    const pools = REPLY_POOLS[tag] || REPLY_POOLS.small;
    const topicPool = pools[topic] || pools._default || REPLY_POOLS.small._default;

    // THREAD DRY (Steve 2026-10-06): "tell me more" is honest only while the
    // thread has beats. Once dry, drop it and let the thread wind down.
    // (This was in convo-dialogue.js but lost in the beats override.)
    const threadDry = !!(c.thread && c.threadDryFor && c.thread === c.threadDryFor);
    // WANT-MORE-EXHAUSTION (journey deepening r4 2026-10-12): on the want
    // thread, the want's moreAvailable governs — a spent want (share_news out
    // of news, single-beat want engaged) is dry even without threadDryFor.
    // Without this, the topic pool re-offers "tell me more" after the want
    // menu retired it, and the dry pool cycles verbatim.
    let wantMoreDry = false;
    try {
      if (c.thread === 'want' && c.want && c.want.def) {
        const w = c.want;
        if (typeof w.def.moreAvailable === 'function') {
          wantMoreDry = !w.def.moreAvailable.call(this, vid);
        } else {
          wantMoreDry = (w.stage || 0) >= 2;
        }
      }
    } catch (e) {}
    // FOLLOWUP-LESS THREADS (journey-landing r42 2026-10-23): the reply-pool
    // "tell me more" is honest only while the thread has beats to give
    // (thread_dry_collapse, Steve 2026-10-06). convoThreadBeat serves
    // goal/past/plans/village/personal/want/gossip/topic2/request;
    // grief/cheer/recall/secret/table/spooked/small/nonverbal have no
    // follow-up machinery — offering "I'm listening" on them always
    // fizzles to the dry admission (seed 505 Lounes, grief thread:
    // "That's... pretty much all of it, honestly."). Treat them as dry
    // for the offer gate; the thread winds down instead of looping the
    // admission. Null/small-talk threads keep current behavior (no
    // observed fizzle; highest-traffic menu path, not redesigned here).
    // GRIEF EXCEPTION (r42 fix 2026-10-23): the grief thread's winddown
    // runs through the comfort handler (convo-dialogue.js sets
    // choosingSubject after the comfort exchange, routing to the subject
    // menu where alive:event:mourning lives) — the gate alone stranded it
    // looping the comfort pool and broke test-mourning-name-r8.
    let threadNoFollowups = false;
    try {
      const t = c.thread;
      if (t && t !== 'goal' && t !== 'past' && t !== 'plans' && t !== 'village' &&
          t !== 'personal' && t !== 'want' && t !== 'gossip' && t !== 'request' &&
          !(this.topic2Has && this.topic2Has(t))) threadNoFollowups = true;
    } catch (e) {}
    const isDry = threadDry || wantMoreDry || threadNoFollowups;

    // Doubts unlock confrontation — contextual, not menued.
    let hasDoubts = false;
    try { hasDoubts = this.getDoubts && this.getDoubts(vid).length > 0; } catch (e) {}

    // Pick one label per reply id, rotating via convoPickCycle.
    // (seen already holds the want menu's ids — the pools dedupe against them.)
    // NO-REPEAT OFFER (dialog-ui-fix 2026-10-11, defect 6): once the want is
    // engaged (stage 2+), the favor is STATED — the beat pool must not offer
    // "How can I help?" again. Re-asking re-states the same beat, sayLine's
    // ledger blocks the repeat, and the player gets options with no NPC
    // reply. The want menu (commit/cant) owns the engaged offer flow.
    const wantEngaged = !!(c.want && (c.want.stage || 0) >= 2);
    // DECIDED WANT (journey sociallife 2026-10-11): once the want is decided
    // (stage 3 — promised/deflected/comforted), the generic "Can't right
    // now" must retire too. The want menu is already empty at stage 3; the
    // generic pool re-offering the deflect verb let "Can't right now" be
    // picked 7x in one conversation, cycling 2 lines ("No — it's fine. I
    // shouldn't have asked." x4) after the refusal was already spoken.
    // Backing out of an open promise has its own honest verb (dlg:renounce
    // on the repay want); the generic cant after a decision is a filler
    // loop, not a choice.
    const wantDecided = !!(c.want && c.want.def && (c.want.stage || 0) >= 3);
    const comfortThread = c.want?.id === 'seek_comfort' && (!c.thread || c.thread === 'want' || c.thread === 'small');
    for (const entry of topicPool) {
      // Authored wants own the complete decision, even a settled empty menu.
      if (wantOwnsMenu) continue;
      if (seen.has(entry.id)) continue;
      if (wantEngaged && entry.id === 'dlg:help') continue;
      if (wantDecided && entry.id === 'dlg:cant') continue;
      // The want owns its follow-through. Generic feeling replies must not
      // re-ask the opening or pay more comfort after its actual resolution.
      if (comfortThread && (((c.want.stage || 0) >= 2 && entry.id === 'dlg:comfort') ||
          ((c.want.stage || 0) >= 3 && entry.id === 'dlg:empathize'))) continue;
      // Skip "tell me more" if the thread is dry. Skip the bare react once
      // it has produced two dead "Anyway."s in a row — the loop winds down
      // instead of offering the same dead acknowledgment forever (rethink
      // 2026-10-07; 2026-10-08: threadless wind-downs count too — a thread
      // that merely ran out of beats is the same dead button).
      if ((isDry && entry.id === 'dlg:more') ||
          (entry.id === 'dlg:react' && (c.reactDryCount || 0) >= 2)) continue;
      seen.add(entry.id);
      const label = (typeof this.convoPickCycle === 'function')
        ? (this.convoPickCycle(vid, 'reply:' + tag + ':' + topic + ':' + entry.id, entry.v) || (entry.v && entry.v[0]) || entry.id)
        : entry.v[Math.floor(Math.random() * entry.v.length)];
      // NULL-LABEL GUARD (journey deepening r12 2026-10-15): convoPickCycle
      // returns null when every variant in entry.v was said this conversation
      // (the no-repeat ledger). A null label renders as a literal "null"
      // button in the UI (esc(String(null))). A repeated player-voice label
      // is honest — the want menu's || labels[0] fallback already does this.
      // Voice-shape the label: blunt/soft/plain variants are baked into
      // the pools above as alternates; the cycle keeps them fresh.
      // A topic alone cannot assert agreement, shared experience or danger.
      out.push({ id: entry.id, label: entry.id === 'dlg:react' ? '(listen)' : label });
    }

    // Doubt surfaces on news AND small beats when you have doubts.
    // DETECTIVE (Steve 2026-10-06): the hard confrontation (confront:,
    // truth.js) is offered on every beat, so the soft probe must be
    // reachable wherever the player can confront — otherwise the
    // soften-then-confront tactic is unplayable. Withheld on feeling/offer
    // beats: pressing a suspicion while they're grieving or asking for help
    // reads cruel.
    if ((tag === 'news' || tag === 'small') && hasDoubts && !seen.has('dlg:doubt')) {
      out.push({ id: 'dlg:doubt', label: '"That doesn\'t quite add up."' });
    }
    // Theorize surfaces contextually on mystery beats.
    if (tag === 'news') {
      const text = beat.line ? String(beat.line).toLowerCase() : '';
      if (/system|monster|strange|weird|don't understand|why/.test(text) && !seen.has('dlg:theorize')) {
        out.push({ id: 'dlg:theorize', label: '"What do you think it means?"' });
      }
    }

    // CONTINUER + RECAP (dialogue rethink, Steve 2026-10-07): the base menu
    // offers the voiced continuer when beats are held and the recap verb on
    // long threads — the dialogue path dropped both, so mood-shift beats and
    // want surfaces died unspoken in c.heldBeats and the recap was
    // unreachable. Restored here, mirroring the base menu's rules.
    if ((c.heldBeats || []).length && !seen.has('goon')) {
      seen.add('goon');
      out.unshift({
        id: 'goon',
        label: (typeof this.convoGoonLabel === 'function') ? this.convoGoonLabel(vid) : '"Go on."',
      });
    }
    try {
      if ((c.threadLog || []).length >= 2 && !seen.has('recap') &&
          typeof this.convoRecapChoice === 'function') {
        seen.add('recap');
        out.push(this.convoRecapChoice(vid));
      }
    } catch (e) {}

    // Party invite — contextual on warm beats with trust.
    try {
      const trust = (this.state.village.trust || {})[vid] || 10;
      if (this.state.systemArrived && this.partyUnlocked && this.partyUnlocked() &&
          !this.inParty(vid) && !this.partyFull() && this.hasDiscovered('party') &&
          trust >= 20 && (tag === 'news' || tag === 'small' || tag === 'feeling')) {
        out.push({ id: 'dlg:invite', label: '"Want to come with us?"' });
      }
    } catch (e) {}

    // TEACH (socialite fix 2026-10-08): the player showing a villager a plant
    // they know. The base menu gates this off-thread, but the live dialogue
    // menu never offered it at all — villagers on the dialogue path (the
    // common case after an opener) could never be taught by the player, even
    // though the teach handler and its topical-coherence rule exist. Same
    // gate as the base menu: not mid-topic-thread, not mid-grief/cheer,
    // and actually something teachable.
    try {
      const TOPIC_THREADS = ['village', 'past', 'goal', 'plans', 'gossip', 'personal'];
      const onThread = TOPIC_THREADS.indexOf(c.thread) !== -1;
      if (!wantOwnsMenu && !onThread && c.thread !== 'grief' && c.thread !== 'cheer') {
        const youKnow = Object.keys(this.state.codex.plants || {})
            .filter(k => this.plantKnown(k)); // L1+ only: a blind taste isn't teachable knowledge
        // REBUILD 2026-10-11: the union — background familiarity counts as
        // known (nothing to teach), player-taught counts as known too.
        const theyKnow = (typeof this.plantsKnownBy === 'function') ? this.plantsKnownBy(vid) : ((this.state.village.taught && this.state.village.taught[vid]) || []);
        if (youKnow.some(pid => theyKnow.indexOf(pid) === -1)) {
          out.push({ id: 'teach', label: this.convoActionLabel(vid, 'teach') });
        }
      }
    } catch (e) {}

    // Subject change — explicit, with a bridge on the way out.
    out.push({ id: 'dlg:subject', label: '"Can I ask you something else?"' });
    out.push({ id: 'leave', label: c.exchanges === 0 ? '"Actually — never mind."' : '"I should go."' }); // BREAK-IT (socialite 2026-10-08): the zero-exchange label must not claim a conversation happened.

    return out;
  };

  // Override the dlg:subject handler to speak a bridge line.
  // (convo-dialogue.js's convoTurn wrapper handles the rest; we patch
  // the subject branch by wrapping convoTurn once more.)
  if (Game.convoTurn) {
    const prevTurn = Game.convoTurn;
    Game.convoTurn = function (vid, choiceId) {
      const c = this.convoGet(vid);
      if (choiceId === 'dlg:subject') {
        // SUBSTANCE (socialite r8 2026-10-09): this early return never
        // reaches convo-dialogue.js's choke-point wrapper — changing the
        // subject is real engagement, so mark it here.
        try { this.convoMarkSubstantive(vid, choiceId); } catch (e) {}
        // UNSPOOKEN BEATS (socialite 2026-10-10): this early return also
        // skips the base turn handler's held-beat filter — run the shared
        // choke point or queued beats (ask, winddown) never die on a subject
        // change, and a stuck heldAsk defeats the winddown gate.
        try { if (typeof this.convoDropUnspoken === 'function') this.convoDropUnspoken(vid, choiceId); } catch (e) {}
        const fromTopic = c.thread || (c.lastBeat && c.lastBeat.topic) || 'small';
        c.transcript.push({ who: 'you', text: '"Can I ask you something else?"' });
        const bridge = this.bridgeLine(vid, fromTopic);
        // REBUILD 2026-10-11: sayLine is the single emission choke point —
        // it pushes the transcript entry. The manual push above is gone.
        // BRIDGES ARE GRAMMAR (dryfall-gap 2026-10-27, B7 layer 2): a
        // topic-shift connector from a 2-line shared pool ("Sure — what's
        // on your mind?" blocked 61 times in one instrumented panel) is
        // not content — exempt from the run ledger like the other
        // grammar beats, or every subject change after the first stalls.
        c.choosingSubject = true;
        if (typeof this.sayLine === 'function') this.sayLine(vid, bridge, { tag: 'prompt', structural: true });
        return { line: bridge, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }
      return prevTurn.call(this, vid, choiceId);
    };
  }

  // NOTE (dialog rethink Phase 1, Steve 2026-10-08): the dead
  // dialogueBeatKind override that lived here is deleted — no callers
  // remained after convo-dialogue.js's dead dialogueResponses was cut.

  Game.BEAT_TAGS = BEAT_TAGS;
})();
