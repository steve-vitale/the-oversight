// @ontology
// system: convo-mood
// description: Per-conversation emotional state (rapport). Warmth and tension shift as you talk; mood is derived from who they are now, never stored per villager.
// provides:
//   - convoMoodInit(vid)
//   - convoMoodBand(vid)
//   - convoMoodShift(vid, delta)
//   - convoMoodFlush(vid)
//   - convoMoodBeat(from, to)
//   - convoMoodSilence(vid)
//   - convoMoodGoodbye(vid)
//   - convoMoodMod(vid)
//   - convoMoodReceptivity(vid)
// rules:
//   - mood_derived: c.mood is -3..3, re-initialized every startConvo from current trust + current npcMood; nothing is stored per villager (code: convo-mood.js, convoMoodInit; Steve 2026-10-06 unique-person law)
//   - mood_bands: warm >=2, friendly 1, neutral 0, cool -1, tense <=-2 (code: convo-mood.js, bandOf)
//   - warmth_from_trust: answer warmth derives from the sign of its trust delta — no separate data (code: conversation.js react: branches)
//   - band_beats: crossing a band boundary queues one stage-direction beat in c.heldBeats; the continuer reveals it after the turn's line (code: convo-mood.js, convoMoodShift/convoMoodFlush; Steve 2026-10-05 one-beat turns)
//   - receptivity: recent lived events (memory) decide guard/grace — guarded people absorb the first warming move, shown kindness absorbs the first cooling one (code: convo-mood.js, convoMoodReceptivity)
//   - mood_lingers: ending warm/tense nudges trust by the final mood value — but ONLY on a substantive conversation (c.substantive: at least one non-acknowledgment choice), and the nudge obeys the 40 words cap like the stipend (r8 2026-10-09: the uncapped residue was a words→trust farm, 40->69 measured); agree-spam ("yeah" x3 + warm goodbye) earns the capped stipend, never the residue (code: conversation.js, endConvo; flag: convo-dialogue.js convoTurn wrapper + convoMarkSubstantive; socialite break-it 2026-10-08)
// consumes:
//   - state.village.conv (c.mood, per-conversation only)
//   - village.trust, village.memory
//   - npcMood, npcTemper
// ============ CONVERSATION MOOD ============
// Every conversation has a temperature. It starts where the relationship
// and their current state put it — a grieving stranger starts cold, a
// grateful friend starts warm — and it moves as you talk. Agreeing warms.
// Dodging cools. Joking while they grieve lands badly. Silence means
// different things at different temperatures.
//
// Nothing here is stored per villager. The next conversation re-derives
// from who they are then: trust as it stands, needs as they are, memory
// of what's happened since. People change during a run; mood follows.
//
// Self-attaching module: loaded after conversation.js, adds Game methods.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // Bands, hottest first.
  function bandOf(m) {
    if (m >= 2) return 'warm';
    if (m === 1) return 'friendly';
    if (m === 0) return 'neutral';
    if (m === -1) return 'cool';
    return 'tense';
  }

  // convoMoodInit: where does this conversation START? Derived, never stored.
  // High trust starts warm; low trust starts cool. Their current npcMood
  // (grief, fear, cheer...) drags the start toward or away from you.
  Game.convoMoodInit = function (vid) {
    let m = 0;
    const trust = (this.state.village.trust || {})[vid] || 10;
    if (trust >= 75) m += 2;
    else if (trust >= 50) m += 1;
    else if (trust <= 5) m -= 1;
    let nm = 'steady';
    try { nm = this.npcMood(vid); } catch (e) {}
    if (nm === 'grieving' || nm === 'scared') m -= 1;
    else if (nm === 'cheerful' || nm === 'grateful') m += 1;
    return Math.max(-2, Math.min(2, m));
  };

  Game.convoMoodBand = function (vid) {
    const c = this.convoGet(vid);
    return bandOf((c && c.mood) || 0);
  };

  // convoMoodReceptivity: how open are they to warming RIGHT NOW, given
  // what's happened to them lately? Scored from lived memory (last 5 days),
  // not from personality — a warm person who's been hurt is guarded, and a
  // prickly person you were kind to softens. Returns -3..3.
  Game.convoMoodReceptivity = function (vid) {
    const WARM_KINDS = ['gift', 'private_gift', 'comforted', 'promise_kept',
      'shared_fear', 'shared_goal', 'hero', 'mediated', 'rally'];
    const HURT_KINDS = ['promise_broken', 'hostile', 'you_threatened',
      'confronted', 'ignored', 'rumor_about_them', 'suspects_you_stealing',
      'started_rumor', 'deal_refused', 'stingy_gift', 'deflected', 'slip',
      // WRONGLY_ACCUSED (detective playtest 2026-10-08): truth.js promises
      // "people remember being called a liar" and stores the memory — but it
      // was never read here, so a false accusation cost 2 trust and nothing
      // socially. Now it cools the relationship like any other hurt.
      'wrongly_accused'];
    let r = 0;
    try {
      const day = (this.state.scholar || {}).day || 0;
      const mem = ((this.state.village.memory || {})[vid]) || [];
      for (const m of mem) {
        if (day - (m.day || 0) > 5) continue;
        if (WARM_KINDS.indexOf(m.t) !== -1) r += 1;
        else if (HURT_KINDS.indexOf(m.t) !== -1) r -= 1;
      }
    } catch (e) {}
    return Math.max(-3, Math.min(3, r));
  };

  // convoMoodShift: move the temperature. Returns the new band.
  // Guard: a recently-hurt villager absorbs the first warming move per
  // conversation — they're not ready to let it in. Grace: recent kindness
  // absorbs the first cooling move — they give you the benefit of the doubt.
  // Band crossings queue a beat, flushed after the turn's line lands.
  Game.convoMoodShift = function (vid, delta) {
    if (!delta) return this.convoMoodBand(vid);
    const c = this.convoGet(vid);
    if (!c || !c.active) return this.convoMoodBand(vid);
    const rec = this.convoMoodReceptivity(vid);
    if (delta > 0 && rec < 0 && !c.moodGuardUsed) {
      c.moodGuardUsed = true;
      c.moodBeat = this.convoPickCycle(vid, 'moodguard', [
        'Something in them almost softens — then doesn\'t. Not yet.',
        'They hear the warmth in it. They\'re not ready to let it in.',
      ]) || 'They\'re not ready to let it in. Not yet.';
      return this.convoMoodBand(vid);
    }
    if (delta < 0 && rec > 0 && !c.moodGraceUsed) {
      c.moodGraceUsed = true;
      // BOND SURFACE (journey-social r22 2026-10-18): a sedimented
      // friendship (depth >= 2) absorbs the cooling move as the
      // relationship it is — not as 5-day recency. Same 'moodgrace' ledger
      // key, so the beat still fires once per conversation.
      let gracePool = [
        'That could have stung. They let it pass — you\'ve been kind before.',
        'They give you the benefit of the doubt. This time.',
      ];
      try {
        const bnd = (typeof this.bondGet === 'function') ? this.bondGet(this.villagerId, vid) : null;
        if (bnd && (bnd.depth || 0) >= 2) {
          gracePool = [
            'That could have stung. They\'ve known you long enough to let it pass.',
            'A friend doesn\'t flinch at one sharp word. They let it go.',
          ];
        }
      } catch (e) {}
      c.moodBeat = this.convoPickCycle(vid, 'moodgrace', gracePool)
        || 'They give you the benefit of the doubt. This time.';
      return this.convoMoodBand(vid);
    }
    const before = bandOf(c.mood || 0);
    c.mood = Math.max(-3, Math.min(3, (c.mood || 0) + delta));
    const after = bandOf(c.mood);
    if (before !== after) c.moodBeat = this.convoMoodBeat(vid, before, after);
    return after;
  };

  // convoMoodFlush: say the queued beat after the turn's own line, so it
  // reads as their reaction settling in — never before what caused it.
  // convoMoodFlush: queue the beat behind the turn's line, so it reads as
  // their reaction settling in — never before what caused it, never
  // mid-turn. ONE-BEAT TURNS (Steve 2026-10-05): the continuer reveals it;
  // the goon emitter says it aloud when shown.
  Game.convoMoodFlush = function (vid) {
    const c = this.convoGet(vid);
    if (!c || !c.moodBeat) return;
    const beat = c.moodBeat;
    c.moodBeat = null;
    c.heldBeats = c.heldBeats || [];
    // MOOD BEATS ARE GRAMMAR (dryfall-gap 2026-10-27, B7 layer 2):
    // stage directions from 2-line pools ("Something eases in their
    // shoulders.") — flagged here so the continuer exempts them from
    // the run ledger like the other grammar beats.
    c.heldBeats.push({ text: beat, moodBeat: true });
  };

  // convoMoodBeat: one stage direction when the temperature visibly changes.
  // Rank order for pick: warm=4 friendly=3 neutral=2 cool=1 tense=0.
  Game.convoMoodBeat = function (vid, from, to) {
    const rank = { warm: 4, friendly: 3, neutral: 2, cool: 1, tense: 0 };
    const dir = (rank[to] || 0) > (rank[from] || 0) ? 'up' : 'down';
    const pools = {
      'up:warm': [
        'Something eases in their shoulders. They\'re really talking to you now.',
        'A warmth settles over the conversation — they lean in a little.',
      ],
      'up:friendly': [
        'They relax, a fraction. This is going well.',
        'Their voice loosens. The guardedness thins.',
      ],
      'up:neutral': [
        'The tension eases back to something ordinary.',
        'They settle — not warm, not cold. Just two people talking.',
        'A neutral quiet returns, the kind where words land normally.',
      ],
      'down:cool': [
        'A small chill settles between you. They\'re choosing words more carefully.',
        'They pull back half a step — not leaving, just... further.',
      ],
      'down:tense': [
        'The air goes tight. Their eyes narrow, just slightly.',
        'Something shutters in their face. Tread carefully.',
      ],
      'down:friendly': [
        'The ease drains out of it, a little.',
        'Their friendliness thins — still there, just held at arm\'s length.',
        'The warmth pulls back a notch. They\'re weighing something.',
      ],
      'down:neutral': [
        'Whatever warmth was building cools to politeness.',
        'Their tone levels out — courteous, careful, further away.',
        'The conversation cools to something businesslike.',
      ],
    };
    const pool = pools[dir + ':' + to] || ['The mood shifts, subtly.'];
    return this.convoPickCycle(vid, 'moodbeat:' + dir + ':' + to, pool) || pool[0];
  };

  // convoMoodSilence: saying nothing is always an option — but it means
  // different things at different temperatures. Warm: comfortable. Cold:
  // awful. Neutral: they fill it, because someone has to.
  // SILENCE-EXHAUSTION (journey-social r31 2026-10-20): the pools are tiny
  // (2 lines warm/cool/tense) and convoPickCycle's reset alternates them —
  // 3+ consecutive silences in one sitting served verbatim repeats
  // (transcript: seed 2012 Dale d16, warm A,B,A,B,A — an L2' violation).
  // Count-aware now: the pool serves each line once per sitting per band,
  // then the NPC names the repeated silence honestly (said once), then the
  // moment is spent — the caller drains the energy budget so the EXISTING
  // convoMaybeWinddown machinery closes it naturally (r18 dry-streak
  // precedent). Silence stays available (canon); it just stops narrating
  // itself in circles. Past the escalation, the honest line is the bare
  // "..." — the absence of speech, not a content beat.
  Game.convoMoodSilence = function (vid) {
    const c = this.convoGet(vid);
    const band = this.convoMoodBand(vid);
    c._msil = c._msil || {};
    const n = (c._msil[band] || 0) + 1;
    c._msil[band] = n;
    const POOLS = {
      warm: {
        pool: [
          'A comfortable quiet settles. They smile a little, and let it be.',
          'You say nothing. Neither do they, for a while — and it\'s fine.',
        ],
        shift: 1,
        escalate: '"This is nice, but —" They tilt their head. "Did you come to tell me something?"',
      },
      cool: {
        pool: [
          'The silence stretches a beat too long. They study their hands.',
          'You don\'t answer. The quiet turns pointed.',
        ],
        shift: -1,
        escalate: '"The quiet\'s getting pointed." They don\'t look up. "Say it or don\'t."',
      },
      tense: {
        pool: [
          '"Did you need something?" Their voice is flat.',
          'Your silence lands wrong. They look away.',
        ],
        shift: 0,
        escalate: '"If you\'re not going to talk, I have things to do."',
      },
      fill: {
        pool: [
          'They fill the quiet. "Anyway — where was I?"',
          '"You\'re a good listener, you know that?" A tired smile.',
          'They glance at the fire, then back. The quiet doesn\'t seem to bother them.',
        ],
        shift: 0,
        escalate: '"Anyway —" They laugh a little. "The quiet\'s getting to me. What\'s on your mind?"',
      },
    };
    const key = (band === 'warm' || band === 'cool' || band === 'tense') ? band : 'fill';
    const def = POOLS[key];
    if (n <= def.pool.length) {
      return { shift: def.shift, line: this.convoPickCycle(vid, 'msil:' + key, def.pool) || def.pool[0] };
    }
    if (n === def.pool.length + 1) {
      // The prompt gets its turn to land — the budget spends only if the
      // player stays silent PAST it.
      return { shift: def.shift, line: def.escalate, spent: false };
    }
    return { shift: 0, line: '"..."', spent: true };
  };

  // convoMoodGoodbye: the parting beat carries the temperature out the door.
  Game.convoMoodGoodbye = function (vid) {
    const band = this.convoMoodBand(vid);
    if (band === 'warm') {
      return this.convoPickCycle(vid, 'mbye:warm', [
        'They\'re smiling as you go. "Come back anytime."',
        '"This was good." They mean it.',
      ]) || null;
    }
    if (band === 'tense' || band === 'cool') {
      return this.convoPickCycle(vid, 'mbye:cold', [
        'They nod, already turning away.',
        '"Right. Well." That\'s the whole goodbye.',
      ]) || null;
    }
    return null;
  };

  // convoMoodMod: for success rolls elsewhere — a warm conversation opens
  // doors, a tense one closes them. -15..+15.
  Game.convoMoodMod = function (vid) {
    const c = this.convoGet(vid);
    return ((c && c.mood) || 0) * 5;
  };
})();
