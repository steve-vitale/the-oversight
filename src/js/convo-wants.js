// @ontology
// system: convo-wants
// description: Want-driven conversation architecture. Every conversation selects one NPC want in the CORE flow (startConvo); the want shapes the opening beats, the menu answers it, and the ending resolves it. No wrapper layers — the core flow calls this module.
// provides:
//   - convoSelectWant(vid) -> want object
//   - convoWantOpener(vid, want) -> provisional {line, thread, question}
//   - convoAcceptWantQuestion(vid, opener) -> accept only the spoken question
//   - convoWantStaleOpener(vid, want) -> reframe line when all fresh variants are ledger-blocked
//   - convoWantEngage(vid, kind) -> state transition ('engage'|'deflect'|'commit')
//   - convoWantMenu(vid) -> menu options for the live want
//   - convoFavorAction(vid, favor) -> read-only physical action readiness
//   - convoFavorActionMenu(vid, favor, canPromise) -> action and requirements
//   - convoPerformFavor(vid, favor) -> execute a checked canonical care or food deed
//   - convoWantCloseLine(vid) -> goodbye beat for the resolution
//   - convoFavorHash(vid, ctx) -> uint (per-instance variation key: stable person key + day + seq — never the ID string, which embeds Date.now())
//   - convoResolveWant(vid, how) -> plants seeds for unfinished business
//   - convoPlantSeed(vid, seed) / convoCheckSeeds(vid)
//   - convoQuestionTopic(qid) -> noun phrase for a bespoke question ("About <phrase> — <question>")
//   - convoQuestionDef(qid) -> the bespoke question def by id (characterGen convo questions)
//   - convoWantNews(vid) / convoWantWarning(vid) -> real content beats
// rules:
//   - want_driven: every conversation selects one NPC want at start; the want shapes the opening and provides beats (code: convoSelectWant, Steve 2026-10-06)
//   - no_polite_queue: the want surfaces in the opening beats, never queued behind a continuer (code: startConvo, Steve 2026-10-11)
//   - strangers_want: trust tier never gates want depth — a stranger opens with something they want (code: convoSelectWant, Steve 2026-10-11, overrides Principle 12)
//   - beat_acknowledgment: NPC beats must acknowledge the player's last utterance before delivering new content — no non-sequiturs (code: convoComposeBeat, Steve 2026-10-06)
//   - seeds: unresolved wants plant seeds; next conversation opens with the seed (code: convoPlantSeed/convoCheckSeeds, Steve 2026-10-06)
//   - arc: want stages 0 (selected) -> 1 (surfaced) -> 2 (engaged) -> 3 (resolved); endings record the resolution (code: convoWantEngage/convoResolveWant, Steve 2026-10-06)
//   - stale_opener: a long-lived want's opener variants all end up ledger-blocked eventually (convoPickCycle resets on exhaustion — never null). When they do, the want reframes via def.staleOpener(vid) (or the generic convoWantStaleOpener) instead of going mute — thread 'want'. Engagement stays thread-coherent: only the want's own thread ('want'/'small') engages it (code: convoOpening, convo-dialogue dlg:more/askwhy/comfort, gap-closure 2026-10-17)
// consumes:
//   - village.villagers
//   - state.convos
//   - npcNeeds (hunger/fear/social/energy)
// ============ CONVERSATION WANTS ============
// Structural rebuild (Steve 2026-10-11): conversations were button-tapping
// with nothing getting done — no meaning, just confusing options. The old
// want system existed but was layered politely on the side (a heldBeats
// queue behind the 'goon' continuer, wrapper hooks around the core flow),
// so wants never surfaced and never drove.
//
// Now the want IS the spine, integrated into the core flow:
//   - startConvo (conversation.js) selects the want and opens WITH it.
//     The opening beats ARE the want — favor, question, news, comfort.
//   - The menu (convoWantMenu, consulted by the beat matrix) always offers
//     a way to engage or deflect the live want, plus honest exits.
//   - endConvo (conversation.js) resolves the want: resolved, planted as a
//     seed for next time, or owed (a debt that resurfaces).
// No wrappers, no queues, no polite afterthoughts.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // ============ FAVOR OBLIGATION SYSTEM (2026-10-11, Steve: "Fix structurally.
  // Design a system that's robust.") ============
  // The old ask_favor drew from 4-entry string pools via convoPickCycle —
  // which RESETS when exhausted, so verbatim repetition was built into the
  // mechanism. A favor was a line, not an object: no identity, no grounding,
  // no lifecycle. And 'engaged' (heard the ask) was recorded as if it were
  // commitment (said "I'll do it") — the false-engagement lie.
  //
  // Now a favor is an OBLIGATION with a lifecycle:
  //   need (real, from live state) -> asked (stated once) -> promised
  //     (tracked, deadline, journal) -> fulfilled | broken
  //   asked -> declined (social cost, memory) | stated (heard, no commit —
  //     plants a thread, the NPC remembers)
  // Favors are generated per-instance from live village state. If no real
  // need exists, ask_favor.pick returns 0 and the want is never selected —
  // a contentless favor is structurally impossible, not just unlikely.
  const FAVOR_KINDS = {
    // kind: { keepKind (for checkPromises), goal (promiseKeepKind vocab),
    //         deadlineDays, build(vid, need, ctx) -> parts }
    //
    // PER-INSTANCE LINES: build() composes from live values (severity,
    // quantities, day-anchors) with phrasing variants keyed by the instance
    // sequence — the same need on a different day, or for a different
    // villager, does not produce the same text. No pools, no cycles.
    food_share: {
      keepKind: 'food', goal: 'feed', deadlineDays: 1,
      build(vid, need, ctx) {
        const sev = (need.hunger || 75) > 85 ? 2 : (need.hunger || 75) > 77 ? 1 : 0;
        const hungerWord = ['going hungry', 'running on empty', 'past hungry'][sev];
        // Slot composition: opener x detail x anchor, keyed by instance hash.
        // 3x3x2 = 18 combinations — the same NPC doesn't repeat.
        const hh = this.convoFavorHash(vid, ctx);
        const openers = [
          `I hate to ask, but`, `I'm ${hungerWord} \u2014`, `Please \u2014`,
        ];
        const details = [
          `do you have anything to eat? Anything at all?`,
          `have you got anything to spare? Anything?`,
          `tell me you've got food to spare. I'm ${hungerWord} here.`,
        ];
        const anchors = [`My hands shake when I try to work.`, `I can't keep going like this.`];
        const previous = this.convoGetFavor(vid);
        let openerIndex = hh % openers.length;
        let detailIndex = (hh >>> 2) % 3;
        // STUTTER GUARD (journey-scale r21 2026-10-22): opener[1] and
        // detail[2] both carry the hunger word — "I'm going hungry — tell me
        // you've got food to spare. I'm going hungry here." Rotate the
        // detail when both fire; no new RNG, favor identity unchanged.
        if (openerIndex === 1 && detailIndex === 2) detailIndex = (detailIndex + 1) % 3;
        let line = `"` + openers[openerIndex] + ' ' + details[detailIndex] + ' ' + anchors[(hh >>> 4) % 2] + `"`;
        // Hashing different instances can still choose identical wording.
        // Rotate an existing segment only on an actual prior-food-ask match;
        // no new RNG, favor identity, task, or need is introduced.
        if (previous && previous.kind === 'food_share' && previous.line === line) {
          openerIndex = (openerIndex + 1) % openers.length;
          // the rotation can land the opener on 1 with detail still 2 — re-guard
          if (openerIndex === 1 && detailIndex === 2) detailIndex = (detailIndex + 1) % 3;
          line = `"` + openers[openerIndex] + ' ' + details[detailIndex] + ' ' + anchors[(hh >>> 4) % 2] + `"`;
        }
        const whyBits = [
          `I haven't eaten right in days.`,
          `It's been ${sev >= 2 ? 'too long' : 'days'} since a real meal.`,
          `My stomach's been empty so long I've stopped feeling it, and that's worse.`,
        ];
        const whyTails = [
          `I can't pull my weight like this. Anything you can spare, I'll make it stretch.`,
          `I'm slowing down — stupid, clumsy. Help me get back on my feet.`,
          `I need food before I can't work at all.`,
        ];
        let whyIndex = (hh >>> 1) % whyBits.length;
        let whyLine = '"' + whyBits[whyIndex] + ' ' + whyTails[(hh >>> 5) % 3] + '"';
        if (previous && previous.kind === 'food_share' && previous.whyLine === whyLine) {
          whyIndex = (whyIndex + 1) % whyBits.length;
          whyLine = '"' + whyBits[whyIndex] + ' ' + whyTails[(hh >>> 5) % 3] + '"';
        }
        return {
          task: `share food with ${ctx.name} \u2014 they're ${hungerWord}`,
          // FIRST-PERSON REGISTER (journey establishment r4 2026-10-12):
          // favor.short is spoken by the asker themselves in every follow-up
          // ("About {short} — ...", "Never mind {short} — ...", the repay
          // opener). 'the food they needed' is third person for their own
          // hunger. The journal-facing `task` stays third-person (narrator).
          short: 'the food I needed',
          line, whyLine,
          commitLine: `"Thank you. I won't forget who fed me when it mattered."`,
          goodbye: `"I'll be alright now. Thanks to you."`,
          stakes: `${ctx.name} is ${hungerWord} and can't work at full strength.`,
        };
      },
    },
    water_haul: {
      keepKind: 'task', goal: 'prove', deadlineDays: 2,
      build(vid, need, ctx) {
        const liters = Math.max(0, Math.round(need.water || 0));
        const hh = this.convoFavorHash(vid, ctx);
        const openers = [
          `The cistern's nearly dry \u2014 ${liters} liters left.`,
          `We're down to ${liters} liters of clean water.`,
          `Water's almost gone \u2014 ${liters} liters.`,
        ];
        const asks = [
          `I need someone to haul water with me at first light. Two of us, half the trips. Will you come?`,
          `Haul the creek with me at dawn? Two buckets each, there and back.`,
          `I can't carry enough alone. First light, the creek, you and me?`,
        ];
        // SPOKEN AS ONE (journey establishment r6 2026-10-12): the ask used
        // to be glued on OUTSIDE the quotes ("..." I can't carry enough
        // alone...) — the player couldn't tell what was spoken vs. narrated.
        // The ask IS the favor; it's spoken, so it lives inside the quotes
        // like every sibling favor's line.
        const line = '"' + openers[hh % 3] + ' ' + asks[(hh >>> 2) % 3] + '"';
        const whyBits = [
          `${liters} liters. That's today's drinking water, and then we're boiling creek water and hoping.`,
          `Do the math with me: ${liters} liters, ${ctx.rosterN} people. That's not tomorrow's water.`,
          `I checked the cistern three times hoping I misread it. ${liters} liters.`,
        ];
        const whyLine = '"' + whyBits[(hh >>> 1) % 3] + ` We walk together and each carry two liters back. Creek water still needs boiling.` + '"';
        return {
          task: `bring four liters home from the creek with ${ctx.name}; set out at dawn`,
          short: 'the creek water run',
          line, whyLine,
          commitLine: `"Dawn, then. Bring something to carry \u2014 and thank you."`,
          goodbye: `"First light. Don't sleep through it."`,
          stakes: `The village needs water; creek water must be boiled before it is safe.`,
        };
      },
    },
    snare_mend: {
      keepKind: 'task', goal: 'prove', deadlineDays: 2,
      build(vid, need, ctx) {
        const hh = this.convoFavorHash(vid, ctx);
        const problems = [
          `My snare line needs mending and my hands are shaking \u2014`,
          `Three snares came loose in the wind.`,
          `The snare line's a mess \u2014 wind took half of it.`,
        ];
        const asks = [
          `could you help me re-tie them tomorrow?`,
          `Help me re-tie the line tomorrow? I know the knots, I need steady hands.`,
          `Tomorrow, you and me, re-tying? An hour's work for two.`,
        ];
        const line = '"' + problems[hh % 3] + ' ' + asks[(hh >>> 2) % 3] + '"';
        return {
          task: `help ${ctx.name} re-tie the snare line tomorrow`,
          short: 'the snare line',
          line,
          whyLine: `"No snares, no rabbits \u2014 and the protein's what keeps us going. I know every knot blindfolded; I just need a second pair of hands to hold the line taut."`,
          commitLine: `"Good. The rabbits won't know what hit them."`,
          goodbye: `"Tomorrow, then. Bring patience."`,
          stakes: `No snares means no rabbits \u2014 the village's protein thins.`,
        };
      },
    },
    watch_shift: {
      keepKind: 'task', goal: 'prove', deadlineDays: 1,
      build(vid, need, ctx) {
        const hh = this.convoFavorHash(vid, ctx);
        const states = [
          `I'm running on empty.`, `I can barely keep my eyes open.`, `Please \u2014 I'm no good like this.`,
        ];
        const asks = [
          `Could you take my watch for a bit? An hour \u2014 that's all I need.`,
          `Take my watch? Just an hour, then I'm back on.`,
          `My watch. An hour's sleep and I'll take it back.`,
        ];
        const line = '"' + states[hh % 3] + ' ' + asks[(hh >>> 2) % 3] + '"';
        return {
          task: `take ${ctx.name}'s watch for a bit so they can rest`,
          short: 'the watch shift',
          line,
          whyLine: `"If I fall asleep on watch and something comes through the treeline... I don't want that on me. An hour's sleep and I'll take it back. Please."`,
          commitLine: `"An hour. I'll take it back after \u2014 I swear."`,
          goodbye: `"An hour. Then I'm back on."`,
          stakes: `An exhausted watcher is no watcher at all.`,
        };
      },
    },
    stay_close: {
      keepKind: 'social', goal: 'belong', deadlineDays: 0,
      build(vid, need, ctx) {
        const sev = (need.fear || 75) > 85 ? 2 : 0;
        const hh = this.convoFavorHash(vid, ctx) + sev;
        const opens = [
          `Can you \u2014 would you stay close tonight?`,
          `Stay near tonight? Please.`,
          `I need company tonight \u2014 not talking, just... near.`,
        ];
        const reasons = [
          `I don't want to be alone when it gets dark.`,
          `I don't want to be alone when the light goes.`,
          `Would you stay close?`,
        ];
        const line = '"' + opens[hh % 3] + ' ' + reasons[(hh >>> 2) % 3] + '"';
        return {
          task: `stay close to ${ctx.name} tonight`,
          short: 'staying close tonight',
          line,
          whyLine: `"I keep hearing things past the treeline. I know it's probably nothing. I just \u2014 don't want to be alone with it tonight."`,
          commitLine: `"Thank you. Just knowing you're there \u2014 it helps."`,
          goodbye: `"Tonight, then. I'll be by the fire."`,
          stakes: `${ctx.name} is scared and fraying.`,
        };
      },
    },
    heal_help: {
      keepKind: 'heal', goal: 'heal', deadlineDays: 1,
      build(vid, need, ctx) {
        const hh = this.convoFavorHash(vid, ctx);
        const wound = (need.health || 50) < 40 ? 'wound' : 'cut';
        const problems = [
          `This ${wound} \u2014 I can't clean it properly one-handed.`,
          `My ${wound} needs a second pair of hands.`,
          `I can't reach this properly.`,
        ];
        const asks = [
          `Could you take a look?`,
          `Will you help me clean it?`,
          `Could you clean it out for me? Please.`,
        ];
        const line = '"' + problems[hh % 3] + ' ' + asks[(hh >>> 2) % 3] + '"';
        return {
          task: `help ${ctx.name} with their injury`,
          // FIRST-PERSON REGISTER (journey establishment r4 2026-10-12):
          // the injured villager asks "About their injury — ..." about
          // their own wound. The `task` (scholar's journal framing) keeps
          // third-person; the spoken short must be first-person.
          short: 'this wound',
          line,
          whyLine: `"It's getting worse, not better. If it festers I'm no good to anyone \u2014 can't haul, can't hunt, can't watch. Just clean it out and wrap it tight."`,
          commitLine: `"Careful with it. And \u2014 thank you."`,
          goodbye: `"Come find me when you have a moment."`,
          stakes: `An untreated wound festers \u2014 ${ctx.name} could go from hurt to helpless.`,
        };
      },
    },
    sick_help: {
      // THE SICKNESS ASK (crisis leg 2026-10-11): the want system had favor
      // needs for hunger, wounds, water, and work — but none for disease, so
      // sick villagers never asked for help and never mentioned being sick
      // in conversation at all (sense-tested). A villager with a mundane
      // v.sick record now surfaces it as their want, with the favor
      // machinery (ask -> commit -> tend/treat -> keep; or rot honestly).
      // SYMPTOM-ONLY (docs/DISEASES.md): diseases never announce their
      // names — the NPC describes what their body is doing. The true name
      // comes only from diagnosis.
      keepKind: 'heal', goal: 'heal', deadlineDays: 2,
      build(vid, need, ctx) {
        const hh = this.convoFavorHash(vid, ctx);
        const sickName = need.sickName || 'sick';
        const sym = sickName === 'gut rot' ? 'doubled up with gut cramps'
          : sickName === 'wound fever' ? 'feverish, a cut gone hot and angry'
          : 'achy and wrung out, barely keeping food down';
        const openers = [`I'm sorry \u2014`, `Please \u2014`, `I hate to ask this, but`];
        const states = [
          `I'm ${sym}.`,
          `whatever this is, it's getting worse \u2014 I'm ${sym}.`,
          `I can't shake it. I'm ${sym}.`,
        ];
        const asks = [
          `Will you help me?`,
          `Can you do anything?`,
          `I need help. Please.`,
        ];
        const line = '"' + openers[hh % 3] + ' ' + states[(hh >>> 2) % 3] + ' ' + asks[(hh >>> 4) % 3] + '"';
        // OUTBREAK VOICES (crisis leg 2026-10-12): one fixed whyLine meant
        // the run ledger dry-lined every sick villager after the first
        // ("...Sorry, lost my train of thought" \u2014 for their own fever).
        // Per-symptom pools + per-speaker cycling keep each voice its own.
        const whyPools = {
          'gut rot': [
            `"Rest and clean water aren't cutting it. If this turns, I'm no good to anyone \u2014 can't haul, can't hunt, can't watch. I need someone who knows what they're doing."`,
            `"I can't keep anything down and the cramps keep getting worse. Someone who knows guts, someone who knows fevers \u2014 before I'm no good to anyone."`,
            `"Whatever this is, it's winning. I can barely stand up straight. Please \u2014 someone who knows what they're doing."`,
          ],
          'wound fever': [
            `"The cut's gone hot and it's spreading \u2014 I can feel it moving. Clean it out, wrap it tight, please. Before it turns."`,
            `"It's not just the cut anymore, it's in the blood, I can feel it climbing. I need someone who knows wounds."`,
            `"Rest won't touch this. The heat's climbing and my head's full of cotton. Someone who knows what they're doing \u2014 please."`,
          ],
          _else: [
            `"Rest and clean water aren't cutting it. If this turns, I'm no good to anyone \u2014 can't haul, can't hunt, can't watch. I need someone who knows what they're doing."`,
            `"The fever's not breaking and I'm barely keeping food down. I need help \u2014 real help, not just water."`,
            `"I'm burning up and there's nothing left in me. Someone who knows sickness \u2014 please."`,
          ],
        };
        const whyLines = whyPools[sickName] || whyPools._else;
        const commitLines = [
          `"Thank you. Whatever you can do \u2014 thank you."`,
          `"Thank you. Just \u2014 thank you. I'll be here, resting."`,
          `"You don't know what that means to me. Thank you."`,
        ];
        return {
          task: `help ${ctx.name} with their sickness \u2014 they're ${sym}`,
          // FIRST-PERSON REGISTER (journey establishment r4 2026-10-12):
          // the sick villager says "About the sickness they're fighting —
          // ..." about their own fever. Same fix as heal_help/food_share.
          short: 'the sickness I\'m fighting',
          line, whyLine: whyLines[0], whyLines,
          commitLine: commitLines[0], commitLines,
          goodbye: `"I'll be resting. Come find me."`,
          stakes: `${ctx.name} is ${sym} and worsening \u2014 an untreated sickness can kill.`,
        };
      },
    },
    forage_help: {
      keepKind: 'food', goal: 'feed', deadlineDays: 2,
      build(vid, need, ctx) {
        const n = ctx.rosterN || 1;
        const hh = this.convoFavorHash(vid, ctx) + n;
        // JOURNEY DEEPENING R6 (2026-10-12): the meeting direction was the
        // fixed "Good. East treeline, first light. Bring a pack." — every
        // villager's pantry run met at the same spot at the same hour. Now
        // the spot is grounded in THIS villager's foraging knowledge and
        // when/gear vary per instance (3x3x3x3x4 combos, instance-hashed).
        const spot = this.convoForageSpot(vid, hh);
        const capSpot = spot.charAt(0).toUpperCase() + spot.slice(1);
        // Lead x spot x when x gear: 4x10x6x6 = 1440 combinations per
        // instance hash — same-spot collisions across villagers are rare,
        // not systematic (journey deepening r6: 128 combos still produced a
        // byte-identical pair in the wild).
        const leads = ['Good.', 'Good \u2014', 'Then it\u2019s set.', 'Done.'];
        const whens = ['first light', 'dawn', 'before the heat sets in', 'morning, early', 'at sunup', 'before the dew dries'];
        const gears = ['Bring a pack.', 'Bring your pack and your knife.', 'Two packs between us.', 'Pack light \u2014 we move fast.', 'Bring the big pack if you have it.', 'Pack and knife. We travel light.'];
        const states = [
          `The pantry's nearly bare.`,
          `We're eating through stores faster than we replace them.`,
          `Pantry's thin and getting thinner.`,
        ];
        const asks = [
          `Will you forage with me tomorrow? Two pairs of eyes, twice the ground.`,
          `Forage with me tomorrow? I know ${spot}.`,
          `Come forage with me tomorrow \u2014 two of us can fill packs.`,
        ];
        const line = '"' + states[hh % 3] + ' ' + asks[(hh >>> 2) % 3] + '"';
        const whyBits = [
          `Another day like today and we're choosing who eats.`,
          `The stores won't stretch past tomorrow, and I'm not choosing who eats.`,
          `I did the count twice. The count doesn't change.`,
        ];
        const whyTails = [
          `I know ${spot} \u2014 come with me and we'll fill packs before dark.`,
          `Meet me at ${spot} and we'll fill packs before dark.`,
          `Nobody's worked ${spot} in days. We'll fill packs before dark.`,
        ];
        const whyLine = '"' + whyBits[hh % 3] + ' ' + whyTails[(hh >>> 3) % 3] + '"';
        const commitLine = `"${leads[hh % 4]} ${capSpot}, ${whens[(hh >>> 4) % 6]}. ${gears[(hh >>> 7) % 6]}"`;
        return {
          task: `forage with ${ctx.name} tomorrow to rebuild the pantry`,
          short: 'the pantry run',
          line, whyLine, commitLine,
          goodbye: `"First light. The pantry's counting on us."`,
          stakes: `The village is ${n} hungry mouths from an empty pantry.`,
        };
      },
    },
  };


  // ============ WANT DEFINITIONS ============
  // gossipLine: the occupation/origin gossip sentence, grammatically sound.
  // (journey establishment 2026-10-11: "weren't a what they said" was
  // ungrammatical when no lie was known; "a ER nurse" broke a/an;
  // occupations leaked mid-sentence capitals.)
  function gossipLine(g) {
    if (g.field === 'occupation') {
      const liePart = g.lie ? `weren't a ${g.lie}` : `weren't what they said`;
      let truth = String(g.truth || '');
      if (truth.length > 1 && /[a-z]/.test(truth[1])) truth = truth[0].toLowerCase() + truth.slice(1);
      // TEXT MODULE (rogue P0-2 2026-10-22): shared article.
      const art = Text.article(truth);
      return `Turns out they ${liePart} — they're ${art} ${truth}.`;
    }
    return `They're not from ${g.lie || 'where they said'} — they're from ${g.truth}.`;
  }
  // Each want: what the NPC wants from this conversation.
  // - pick(vid): weight for selection (higher = more likely)
  // - opener(vid): the opening line — the want, surfaced immediately
  // - engageBeat(vid): what they say when the player engages ("how can I help?" -> the concrete ask)
  // - deflectBeat(vid): what they say when the player deflects
  // - menuOptions(vid, stage): [{id, labels[], temper}] — engage/deflect/follow-through
  // - closeLine(vid, resolution): the goodbye beat for how it ended
  // - resolve(vid, resolution): seed or null
  // QUESTION_TOPIC: the noun phrase an NPC uses to refer back to a bespoke
  // question they asked (curious-seed resume: "About <phrase> — <question>").
  // Plain voice, never the menu-question text — same register as the t2speech
  // map (journey social r13 2026-10-14). Falls back to 'that question' for
  // unknown ids (convoQuestionTopic). (journey social r14 2026-10-14: the
  // curious seed stored only the generic note 'that question', and the resume
  // hung a DIFFERENT question — the original evaporated. The seed now records
  // the question id and names it like a person.)
  const QUESTION_TOPIC = {
    q_origin: 'where you\'re from',
    q_plan: 'your plan here',
    q_scared: 'whether you\'re scared',
    q_miss: 'what you miss most',
    q_trust: 'whether they can trust you',
    q_think: 'what you make of all this',
    q_hands: 'what you did with your hands',
    q_read: 'your read on people here',
    q_theory: 'what you think happened to us',
    q_night: 'how you slept',
    q_laugh: 'the funniest thing you\'ve seen',
    q_quiet: 'the talking-to-strangers part',
    q_first_memory: 'your first memory',
    q_regret: 'your regrets',
    q_skill: 'what you\'re good at',
    q_believe: 'what you believe in',
    q_someone: 'who you don\'t trust',
    q_change: 'how this changed you',
    q_guilty: 'the worst thing you\'ve done',
    q_hope: 'what you\'re hoping for',
    q_alone_time: 'needing to be alone',
    q_laugh_memory: 'the last time you laughed',
    q_teach_me: 'teaching them something',
    q_stay: 'whether you\'re staying',
    q_system_fear: 'what scares you most',
    q_kindness: 'the kindest thing someone\'s done for you',
    q_before_skill: 'your useful old-life skills',
    q_fight: 'whether you\'ve hurt someone',
    q_song: 'whether you still sing',
    q_first_week: 'what got you through the first week',
    q_angry: 'whether you\'re angry',
    q_dream: 'what you dream about',
    q_left_behind: 'who you left behind',
    q_name_day: 'what day it is',
    q_useful: 'the most useful thing you\'ve learned',
    q_fun: 'what you did for fun',
  };
  // favorSettleOnSurfaced (journey-succession r28 2026-10-19): applies a
  // pending favor settle recorded by an opener/followup. The fulfilled->
  // 'thanked' and broken->'acknowledged' transitions used to fire INSIDE the
  // opener as a side effect of COMPUTING the line — before the no-repeat
  // ledger check. A ledger-blocked gratitude then fell through to another
  // opener with the state already flipped: the ledger said 'thanked' while
  // the NPC never spoke the line (r28/8303 Henriette — an identical heal_help
  // gratitude from earlier sat in the 48-line run window). Openers must stay
  // pure (seek_taken onSurfaced precedent); the settle fires here, only when
  // the opener's line actually speaks. The opener records the pending settle
  // on c.want._favorSettle instead of flipping.
  function favorSettleOnSurfaced(vid) {
    try {
      const c = Game.convoGet(vid);
      const settle = c && c.want && c.want._favorSettle;
      if (!settle) return;
      const favor = (c.want && c.want.favor) || Game.convoGetFavor(vid);
      if (favor && settle === 'thanked' && favor.state === 'fulfilled') favor.state = 'thanked';
      else if (favor && settle === 'acknowledged' && favor.state === 'broken') favor.state = 'acknowledged';
      delete c.want._favorSettle;
    } catch (e) {}
  }
  // favorSettleReplant (journey-succession r28 2026-10-19): the resolve-time
  // half of settle-on-speak. If the opener computed the gratitude but the
  // no-repeat ledger blocked it, the favor is still 'fulfilled'/'broken' at
  // endConvo and the seed would be consumed with the thanks never spoken —
  // a silent settle. Replant a repay seed so the NPC thanks the player next
  // conversation instead.
  function favorSettleReplant(vid) {
    try {
      const c = Game.convoGet(vid);
      if (c && c.want && c.want._favorSettle) {
        const favor = (c.want && c.want.favor) || Game.convoGetFavor(vid);
        if (favor) return { wantId: 'repay', note: (favor.short || 'the promise') + ' you kept', favorId: favor.id };
      }
    } catch (e) {}
    return null;
  }
  // TAKEN POD-DREAM TAIL (journey establishment r25, 2026-10-22): the pods
  // dream/broadcast ambiguity is the taken story's emotional core, but a
  // single byte-identical tail across every villager reads as one voice
  // (Ursula/James/Lillian/Erin all said it verbatim in r25). Three variants,
  // deterministic per villager (vid hash, no RNG — a person tells their own
  // story the same way every time). Called from seek_taken engageBeat, which
  // runs with `this` = Game, so this lives at module scope, not on the def.
  // The repeat-ack said-facts ledger still governs re-tellings.
  function takenPodTailFor(vid) {
    try {
      let hk = 0; const s = String(vid == null ? '' : vid);
      for (let i = 0; i < s.length; i++) hk = (hk * 31 + s.charCodeAt(i)) | 0;
      const tails = [
        'Some nights I dream about the pods -- rows of them, humming. I wake up and I can\'t tell if it was a dream or a broadcast.',
        'The pods get into my sleep some nights. Row on row of them, humming like a held note -- and I wake up reaching for something that isn\'t there.',
        'Some nights I swear I hear them before I sleep -- the pods, rows deep, humming. Then morning comes and I can\'t say whether it was real.',
      ];
      return tails[Math.abs(hk) % tails.length];
    } catch (e) { return 'Some nights I dream about the pods -- rows of them, humming. I wake up and I can\'t tell if it was a dream or a broadcast.'; }
  }
  const WANTS = {
    share_news: {
      // A reaction ("huh", "no kidding") engages news — that's the point.
      // Answering an unrelated question does not.
      reactEngages: true,
      pick(vid) {
        // They've seen something, heard something — bursting to tell.
        // More likely if they haven't talked in a while.
        const c = Game.convoGet(vid);
        const daysSince = (Game.state.scholar.day || 0) - (c.lastDay || 0);
        return daysSince > 2 ? 3 : 1;
      },
      opener(vid) {
        // The hook is a promise — convoWantNews delivers the matching
        // content first, so "what I saw by the treeline" is followed by
        // the sighting, not random gossip. (journey establishment
        // 2026-10-11: the treeline hook fizzled into occupation gossip.)
        const hooks = [
          { id: 'treeline', line: '"You\'ll never guess what I saw by the treeline."' },
          { id: 'morning', line: '"Okay, so — something happened this morning."' },
          { id: 'first', line: '"Have you heard? No? Good, I get to tell you first."' },
        ];
        const line = Game.convoPickCycle(vid, 'want:news:open', hooks.map(h => h.line)) || hooks[0].line;
        const hook = (hooks.find(h => h.line === line) || hooks[0]).id;
        try { const w = (Game.convoGet(vid) || {}).want; if (w) w.hook = hook; } catch (e) {}
        return line;
      },
      engageBeat(vid) {
        // "Tell me more." -> the actual news. REAL content, never a shrug.
        return Game.convoWantNews(vid);
      },
      deflectBeat(vid) {
        // DEFLECT POOL (journey landing 2026-10-12): was a single hardcoded
        // line — verbatim identical every time a share_news want was
        // deflected, across villagers and runs. Same pool treatment as the
        // favor commit/close lines: cycles, per-conversation, and the
        // no-repeat ledger still applies at sayLine.
        return this.convoPickCycle(vid, 'deflect:share_news', [
          '"Oh. Right. Never mind — it\'s probably nothing." They look a little deflated.',
          '"...Okay. Forget I said anything." They clearly wish they hadn\'t started.',
          '"Right. Probably wasn\'t important." It was, a little. You can tell.',
        ]) || '"Oh. Right. Never mind — it\'s probably nothing." They look a little deflated.';
      },
      menuOptions(vid, stage) {
        return [
          { id: 'dlg:more', labels: ['"Tell me more."', '"What happened?"', '"Go on."'], temper: 'neutral' },
          { id: 'dlg:react', labels: ['"Huh."', '"No kidding."', '"I see."'], temper: 'neutral' },
        ];
      },
      // MORE-EXHAUSTION (journey deepening r4 2026-10-12): "tell me more" stays
      // available while news types remain undelivered; retires when spent.
      moreAvailable(vid) {
        const w = (this.convoGet(vid) || {}).want || {};
        return !w.newsExhausted;
      },
      closeLine(vid, resolution) { return null; },
      resolve(vid, resolution) {
        if (resolution === 'engaged') return null; // fully shared, no seed
        // They didn't get to tell you — they'll try again.
        return { wantId: 'share_news', note: 'that news I was bursting to share' };
      },
    },
    // ask_favor: THE FAVOR OBLIGATION WANT (rebuilt 2026-10-11, Steve: "Fix
    // structurally. Design a system that's robust.").
    //
    // A favor is an obligation instance, not a line. The lifecycle:
    //   need (real, from live state) -> asked (stated once, opener) ->
    //   promised (tracked obligation w/ deadline, via dlg:commit) ->
    //     fulfilled | broken
    //   asked -> stated (heard, no commit: plants a thread) |
    //     deflected (refused: social cost, memory, no re-ask for 3 days)
    //
    // Structural guarantees:
    // - pick returns 0 when no real need exists: a contentless favor can
    //   never be selected (the old 4-entry template pools are gone).
    // - The favor's lines are generated ONCE per instance and stored — never
    //   re-rendered from a pool, so verbatim repetition is impossible.
    // - The opener ASKS; engageBeat ("how can I help?") DEEPENS with the
    //   why/stakes — new content, never the ask repeated.
    // - 'engaged' is UNREACHABLE for favors: heard-but-not-committed resolves
    //   as 'stated' (defaultResolution). Only dlg:commit sets 'promised',
    //   and only when a real obligation was created.
    ask_favor: {
      pick(vid) {
        // No real need -> weight 0 -> the want is never selected. The picker
        // falls through to other wants. This is the structural kill of
        // contentless favors (the old baseline weight of 1 is gone).
        try {
          const need = this.convoFindFavorNeed(vid);
          return need ? need.urgency : 0;
        } catch (e) { return 0; }
      },
      opener(vid) {
        const c = this.convoGet(vid);
        const want = (c && c.want) || {};
        // FOLLOW-UP: a seed for this favor — they asked before. The NPC
        // remembers: the follow-up names the prior ask, never resets it.
        if (want.fromSeed && want.seedFavorId) {
          const favor = this.convoGetFavor(vid);
          if (favor && favor.id === want.seedFavorId) {
            const line = this.convoFavorFollowup(vid, favor);
            if (line) {
              if (c.want) {
                c.want.favor = favor;
                // The ask is already established — the menu goes straight
                // to commit/deflect (stage 2), unless this is just an
                // acknowledgment (fulfilled/broken/moot: settled states).
                const settled = favor.state === 'thanked' || favor.state === 'acknowledged' || favor.state === 'moot';
                if (!settled) c.want.stage = 2;
              }
              return line;
            }
          }
          return null; // favor gone — honest fallback; seed consumed as unestablished
        }
        const need = this.convoFindFavorNeed(vid);
        if (!need) return null; // no real need — the want can't open
        // INHERITED ASK (journey-succession 2026-10-11): the predecessor's
        // released favor is still the live ask — the NPC re-asks the new
        // Bearer about it, naming the predecessor, never pretending the
        // ask is new. Same need kind required; a changed need is a new ask
        // (the old favor goes moot, the follow-up says so honestly).
        let mootPrefix = '';
        try {
          const oldF = this.convoGetFavor(vid);
          const predO = oldF && oldF.state === 'asked' && typeof this.inheritedName === 'function'
            ? this.inheritedName(oldF) : null;
          if (predO && oldF.kind === need.kind && this.convoFavorNeedLive(oldF)) {
            if (c.want) c.want.favor = oldF;
            return this.convoFavorFollowup(vid, oldF);
          }
          if (predO && oldF && oldF.kind !== need.kind) {
            // HONEST MOOT (journey-succession r34 2026-10-21): the open book
            // named this need to the successor — it must not evaporate. The
            // old favor goes moot AND the NPC says so, in the same breath as
            // the new ask. (Before: marked moot on the detached object, then
            // the ledger overwrite buried it silently — the book's entry
            // vanished with no honest line.)
            try { oldF.state = 'moot'; } catch (e2) {}
            try {
              const sh = oldF.short || 'that';
              mootPrefix = `Never mind ${sh} — we got it handled. Thanks anyway. `;
            } catch (e3) { mootPrefix = ''; }
          }
        } catch (e) {}
        const favor = this.convoBuildFavor(vid, need);
        if (!favor) return null;
        if (c.want) c.want.favor = favor;
        this.convoStoreFavor(favor);
        if (mootPrefix && favor.line) {
          const inner = String(favor.line).replace(/^"/, '').replace(/"$/, '');
          return `"${mootPrefix}${inner}"`;
        }
        return favor.line;
      },
      engageBeat(vid) {
        // "How can I help?" — the ask was stated in the opener. This DEEPENS
        // with the why and stakes: new content, never the ask repeated.
        // (The old pool re-stated the ask — the verbatim-repeat vector.)
        const c = this.convoGet(vid);
        const favor = (c.want && c.want.favor) || this.convoGetFavor(vid);
        // SETTLED FAVOR (journey establishment r7 2026-10-12): the opener can
        // declare the favor settled mid-conversation — "Never mind the wound,
        // we got it handled" fires when the need died between the seed and
        // the sitting (caught live, seed 777 d30). The favor's whyLine is the
        // DEAD ask's stakes — speaking it after the settlement is a lie
        // ("It's getting worse, not better" moments after "we got it
        // handled"). A settled favor engaged gets an honest it's-handled
        // acknowledgment, never the dead ask's why.
        if (favor && (favor.state === 'moot' || favor.state === 'thanked' ||
                      favor.state === 'acknowledged' || favor.state === 'fulfilled')) {
          return this.convoPickCycle(vid, 'favor:handled:' + (favor.kind || 'favor'), [
            '"It\'s handled. Really — it is. I appreciate you asking, though."',
            '"No, really, it\'s fine. Forget I even asked."',
            '"All sorted. Some things just work out."',
          ]) || '"It\'s handled. Really — it is."';
        }
        // OUTBREAK VOICES (crisis leg 2026-10-12): favor defs may carry a
        // whyLines pool. Per-speaker cycling (convoPickCycle is run-ledger
        // aware) so the second villager stating the same need in an outbreak
        // gets their own words — never the dry line for their own suffering.
        if (favor && favor.whyLines && favor.whyLines.length)
          return this.convoPickCycle(vid, 'favor:why:' + (favor.kind || 'favor'), favor.whyLines);
        if (favor) return favor.whyLine;
        // DEFERRED OPENER (journey establishment 2026-10-12): the resume
        // opener can preempt the want's opener in startConvo — the want was
        // selected on a real need but its ask was never stated. Engaging the
        // want now states the deferred ask (the opener builds the favor once;
        // fromSeed/inherited paths are handled there) instead of the hollow
        // "I'm alright right now." If no favor can be stated, the NO HOLLOW
        // FALLBACK below answers honestly.
        try {
          const w = c && c.want;
          if (w && w.def && typeof w.def.opener === 'function') {
            const line = w.def.opener.call(this, vid);
            if (line) return line;
          }
        } catch (e) {}
        return null; // no favor statable — the NO HOLLOW FALLBACK answers honestly
      },
      staleOpener(vid) {
        // STALE-OPENER HONESTY (journey deepening r16 2026-10-23): when every
        // fresh opener variant is ledger-blocked, the generic fallback names
        // the want id as dialogue — "About ask favor — I keep turning it
        // over." (transcript-caught, seed 8905 d45). A favor has a real
        // short; name the ask, never the id. No favor -> null (the generic
        // fallback is still better than a dry line, and the ask gets
        // re-stated honestly on the next sitting).
        try {
          const c = this.convoGet(vid);
          const favor = (c.want && c.want.favor) || (typeof this.convoGetFavor === 'function' && this.convoGetFavor(vid)) || null;
          const sh = favor && (favor.short || favor.kind);
          if (!sh) return null;
          return this.convoPickCycle(vid, 'favor:stale:' + (favor.kind || 'favor'), [
            `"About ${sh} — still on my mind. I keep coming back to it."`,
            `"${sh[0].toUpperCase() + sh.slice(1)} — I haven't stopped thinking about it."`,
          ]);
        } catch (e) { return null; }
      },
      deflectBeat(vid) {
        // DEFLECT POOL (journey landing 2026-10-12): was a single hardcoded
        // line — observed verbatim-identical 3x in one run (Sofia, Emma,
        // seed 444/666). Same pool treatment as this def's commitBeat and
        // closeLine: cycles per conversation, keyed by favor kind; the
        // no-repeat ledger still applies at sayLine. The plant survives —
        // every variant keeps "they won't forget / won't ask twice".
        const c = this.convoGet(vid);
        const favor = (c.want && c.want.favor) || (typeof this.convoGetFavor === 'function' && this.convoGetFavor(vid));
        const kind = (favor && favor.kind) || 'favor';
        // SETTLED FAVOR (journey establishment r7 2026-10-12): declining a
        // handled favor isn't a refusal — the guilt-framed beats ("They won't
        // forget") lie about an ask that never existed in this sitting. A
        // light acknowledgment instead.
        if (favor && (favor.state === 'moot' || favor.state === 'thanked' ||
                      favor.state === 'acknowledged' || favor.state === 'fulfilled')) {
          return '"Oh — no, it\'s fine. Already handled. But thanks."';
        }
        return this.convoPickCycle(vid, 'deflect:favor:' + kind, [
          '"No, yeah, of course. Forget I asked." They won\'t forget. They\'ll just stop asking.',
          '"Right. I get it." A beat — and then the subject is closed. They won\'t raise it again.',
          '"...Okay. I\'ll figure it out." They won\'t ask twice. That much is clear.',
        ]) || '"No, yeah, of course. Forget I asked." They won\'t forget. They\'ll just stop asking.';
      },
      commitBeat(vid) {
        const c = this.convoGet(vid);
        const favor = (c.want && c.want.favor) || this.convoGetFavor(vid);
        // OUTBREAK VOICES (crisis leg 2026-10-12): same pool treatment as the
        // why — the commit thank-you was ledger-blocked for the second
        // villager in the same window.
        if (favor && favor.commitLines && favor.commitLines.length)
          return this.convoPickCycle(vid, 'favor:commit:' + (favor.kind || 'favor'), favor.commitLines);
        if (favor) return favor.commitLine;
        return '"Thank you. Seriously — thank you."';
      },
      menuOptions(vid, stage) {
        const c = this.convoGet(vid);
        const favor = (c.want && c.want.favor) || this.convoGetFavor(vid);
        // Settled favors (fulfilled/broken/moot) — this conversation is just
        // the acknowledgment. No commit menu for a closed favor.
        if (favor && (favor.state === 'fulfilled' || favor.state === 'thanked' ||
                      favor.state === 'broken' || favor.state === 'acknowledged' ||
                      favor.state === 'moot' || favor.state === 'declined')) {
          return [];
        }
        if (favor) {
          return this.convoFavorActionMenu(vid, favor, favor.state === 'asked').concat([
            ...(!c.want?.favorExplained ? [{ id: 'dlg:details', labels: ['"Tell me why you need this."'], temper: 'neutral' }] : []),
            { id: 'dlg:cant', labels: ['"I can’t right now."'], temper: 'neutral' },
          ]);
        }
        if ((stage || 0) >= 2 && !favor) {
          // DEFERRED OPENER (journey establishment 2026-10-12): the want was
          // engaged but its ask was never stated (resume preempted the
          // opener and the need evaporated, or the opener couldn't build).
          // Nothing committable exists — offer engagement, not commitment.
          // Committing to an unstated ask is the phantom-promise bug.
          return [
            { id: 'dlg:help', labels: ['"How can I help?"', '"What do you need?"', '"I\'m listening."'], temper: 'kind' },
            { id: 'dlg:details', labels: ['"Tell me what\'s going on."', '"What\'s the situation?"'], temper: 'neutral' },
            { id: 'dlg:cant', labels: ['"I can\'t right now."', '"Not right now, sorry."'], temper: 'neutral' },
          ];
        }
        if ((stage || 0) >= 2) {
          // Favor stated — commit or back out. Honest, both ways.
          return [
            { id: 'dlg:commit', labels: ['"I\'ll do it."', '"Count me in."'], temper: 'kind' },
            { id: 'dlg:cant', labels: ['"Actually — I can\'t."', '"I\'m sorry, I can\'t."'], temper: 'neutral' },
          ];
        }
        return [
          { id: 'dlg:help', labels: ['"How can I help?"', '"What do you need?"', '"I\'m listening."'], temper: 'kind' },
          { id: 'dlg:details', labels: ['"Tell me what\'s going on."', '"What\'s the situation?"'], temper: 'neutral' },
          { id: 'dlg:cant', labels: ['"I can\'t right now."', '"Not right now, sorry."'], temper: 'neutral' },
        ];
      },
      closeLine(vid, resolution) {
        const c = this.convoGet(vid);
        const favor = (c.want && c.want.favor) || this.convoGetFavor(vid);
        if (resolution === 'promised') return (favor && favor.goodbye) || '"Thank you. Really."';
        // 'stated' — the ask hangs, honestly. Not a fizzle: they name that
        // it's open.
        if (resolution === 'stated') return '"...Think about it? I\'ll be around."';
        // SETTLED FAVOR (journey establishment r7 2026-10-12): a 'deflected'
        // close after a handled favor must not speak the refusal beats
        // ("Forget I asked. I'll figure it out") — nothing was asked, nothing
        // needs figuring out. The close stays with the settlement.
        if (resolution === 'deflected' && favor &&
            (favor.state === 'moot' || favor.state === 'thanked' ||
             favor.state === 'acknowledged' || favor.state === 'fulfilled')) {
          return '"...It\'s fine, really. Already handled."';
        }
        if (resolution === 'deflected') return this.convoPickCycle(vid, 'want:favor:close:deflected', [
          '"Forget I asked. I\'ll figure it out."',
          '"No — you\'re right, it\'s a lot. Forget it."',
          '"Okay. I\'ll manage on my own."',
        ]) || '"Forget I asked."';
        return null;
      },
      // defaultResolution: heard-but-not-committed is STATED, never
      // 'engaged'. 'engaged' reads as commitment — the false-engagement lie
      // (a favor resolved 'engaged' with the player never choosing "I'll do
      // it"). Only dlg:commit sets 'promised', and only when a real
      // obligation was created.
      defaultResolution(vid, want, how) {
        if ((want.stage || 0) >= 2) return 'stated';
        return null;
      },
      // SETTLE-ON-SPEAK (journey-succession r28 2026-10-19): the follow-up's
      // fulfilled->'thanked' / broken->'acknowledged' transitions fire here,
      // only when the opener's line actually speaks — never while computing
      // a line the no-repeat ledger may skip.
      onSurfaced(vid) { favorSettleOnSurfaced(vid); },
      resolve(vid, resolution) {
        const c = this.convoGet(vid);
        const favor = (c.want && c.want.favor) || this.convoGetFavor(vid);
        // SETTLE-ON-SPEAK (journey-succession r28 2026-10-19): the follow-up
        // computed the gratitude but the no-repeat ledger blocked it — the
        // favor is still 'fulfilled'/'broken'. Plant a repay seed (not
        // ask_favor — the debt is kept, not open) so the thanks fires next
        // conversation instead of settling silently.
        const replant = favorSettleReplant(vid);
        if (replant) return replant;
        // Settled acknowledgments (fulfilled/broken/moot follow-ups) plant
        // nothing — the business is closed.
        if (favor && (favor.state === 'thanked' || favor.state === 'acknowledged' || favor.state === 'moot')) {
          return null;
        }
        if (resolution === 'promised') {
          // The obligation was created at commit time and is tracked. The
          // follow-up references it — a reminder, not a new ask.
          if (favor) return { wantId: 'repay', note: favor.short + ' you promised', favorId: favor.id };
          // DEFERRED OPENER (journey establishment 2026-10-12): 'promised'
          // with no favor is the phantom-obligation bug — nothing was asked,
          // nothing is owed. Plant no contentless repay seed.
          return null;
        }
        if (resolution === 'stated' || resolution === 'abandoned') {
          // Heard, no commitment — still needs help. THE SAME favor, not a
          // reset: the follow-up names the prior ask.
          if (favor && favor.state === 'asked') {
            return { wantId: 'ask_favor', note: 'the help I asked you for', favorId: favor.id };
          }
          if (favor) return { wantId: 'ask_favor', note: 'the help I asked you for', favorId: favor.id };
          return { wantId: 'ask_favor', note: 'the help I asked you for' };
        }
        if (resolution === 'deflected') {
          // Refused outright — the deflected memory carries it (written by
          // the dlg:cant handler). No seed: they'll ask again only for a
          // genuinely new need, and not for 3 days.
          try {
            const v = this.state.village || {};
            v.favorDeclined = v.favorDeclined || {};
            v.favorDeclined[vid] = (this.state.scholar || {}).day || 0;
          } catch (e) {}
          if (favor) favor.state = 'declined';
          return null;
        }
        return null;
      },
    },
    // repay: they remember what you promised. Seed-driven only — pick()
    // returns 0 so it never surfaces spontaneously. Favor-aware (2026-10-11):
    // the opener branches on the actual obligation state — a reminder while
    // it's open, gratitude when kept, cool distance when broken. Debts unpaid
    // just sit there, but the fiction always names the real state.
    repay: {
      pick(vid) { return 0; },
      opener(vid) {
        const c = this.convoGet(vid);
        const want = (c && c.want) || {};
        let favor = null;
        if (want.fromSeed && want.seedFavorId) favor = this.convoGetFavor(vid);
        if (!favor || favor.id !== want.seedFavorId) favor = this.convoGetFavor(vid);
        const open = this.openFavorObligation(vid);
        if (favor?.kind === 'water_haul' && favor.waterRun && !favor.waterRun.returned) {
          if (c.want) c.want.favor = favor;
          return this.waterFavorOpening(vid)?.line || '"We still have a creek trip to finish."';
        }
        // Obligation still open — a reminder naming the task, not a new ask.
        if (open && open.favorTask && favor && favor.id === open.favorId) {
          if (c.want) c.want.favor = favor;
          return `"About ${favor.short} — have you had a chance? ${this.convoFavorDeadlineNote(favor)}"`;
        }
        if (favor && favor.state === 'fulfilled') {
          if (c.want) { c.want.favor = favor; c.want._favorSettle = 'thanked'; }
          return `"You came through on ${favor.short}. I won't forget it."`;
        }
        if (favor && favor.state === 'broken') {
          if (c.want) { c.want.favor = favor; c.want._favorSettle = 'acknowledged'; }
          return `"You said you'd help with ${favor.short}. ...It's done now. Forget it."`;
        }
        // Legacy / no favor state — the old generic lines (defensive).
        // The debt is a PROMISE, not a deed — the fiction must not claim the
        // player already did the favor (socialite 2026-10-11: the old lines
        // said "what you did for me" when the player had only said "I'll do
        // it" — fabricated shared history, Steve's conversation quality bar).
        return this.convoPickCycle(vid, 'want:repay:open', [
          '"I\'ve been thinking about what you promised. I don\'t like owing kindness."',
          '"About last time — I haven\'t forgotten what you said you\'d do. I want to return it."',
        ]);
      },
      engageBeat(vid) {
        return '"Good. Then we\'re square." They look lighter for it.';
      },
      deflectBeat(vid) {
        // DEFLECT POOL (journey landing 2026-10-12): same single-line class
        // as the other want deflectBeats — pooled like the favor commit/
        // close lines so the reaction isn't verbatim-identical every time.
        return this.convoPickCycle(vid, 'deflect:repay', [
          '"Right. Forget it." They won\'t forget. Debts unpaid just sit there.',
          '"...Fine. But I don\'t like owing." The debt stays on their face.',
          '"Okay. Your call." They file it away — unpaid, and counted.',
        ]) || '"Right. Forget it." They won\'t forget. Debts unpaid just sit there.';
      },
      menuOptions(vid, stage) {
        const open = this.openFavorObligation(vid);
        if (open && open.favorTask) {
          // The promise is OPEN — "we're square" would be a lie. Honest
          // options: reaffirm it, or back out (which breaks it now, with
          // the cost — dlg:renounce).
          return [
            ...this.convoFavorActionMenu(vid, this.convoGetFavor(vid), false),
            { id: 'dlg:react', labels: ['"I haven\'t forgotten."', '"It\'s on my mind, I swear."'], temper: 'kind' },
            { id: 'dlg:renounce', labels: ['"I can\'t do it. I\'m sorry."'], temper: 'neutral' },
          ];
        }
        return [
          { id: 'dlg:react', labels: ['"We\'re square."', '"Don\'t mention it."'], temper: 'kind' },
          { id: 'dlg:cant', labels: ['"Don\'t worry about it."'], temper: 'neutral' },
        ];
      },
      closeLine(vid, resolution) { return null; },
      onSurfaced(vid) { favorSettleOnSurfaced(vid); },
      resolve(vid, resolution) {
        // Still open — they still remember. Otherwise the business is
        // closed: fulfilled, broken, or renounced all consume the seed.
        const open = this.openFavorObligation(vid);
        if (open && open.favorTask) {
          const favor = this.convoGetFavor(vid);
          return { wantId: 'repay', note: ((favor && favor.short) || 'the promise') + ' you made', favorId: favor && favor.id };
        }
        // SETTLE-ON-SPEAK: the opener computed the gratitude but the
        // no-repeat ledger blocked it — replant so the thanks fires next
        // conversation instead of settling silently.
        const replant = favorSettleReplant(vid);
        if (replant) return replant;
        return null;
      },
    },
    seek_comfort: {
      // Only the comfort menu (dlg:comfort/dlg:empathize) engages — a
      // generic answer or reaction is not comfort.
      pick(vid) {
        try {
          const n = Game.npcNeeds(vid);
          if (n.fear > 60) return 3;
        } catch (e) {}
        try {
          const m = Game.npcMood(vid);
          if (m === 'grieving' || m === 'scared') return 3;
        } catch (e) {}
        return 0.5;
      },
      opener(vid) {
        // COMFORT POOL DEPTH (journey landing r29 2026-10-19): the pool was
        // 2 openers / 2 engage beats — a multi-turn comfort exchange cycled
        // verbatim (r27 observation). 4 openers now; the engage pool is 6.
        return Game.convoPickCycle(vid, 'want:comfort:open', [
          '"Do you ever — no. Never mind." They don\'t look away, though. They want you to ask.',
          '"I\'m not okay. I\'m saying it out loud so it\'s real: I\'m not okay."',
          '"I don\'t want to be alone with my head right now. That\'s all. That\'s the whole thing."',
          '"It\'s stupid. I\'m alive, everyone\'s alive, and I can\'t stop shaking."',
        ]);
      },
      engageBeat(vid) {
        return Game.convoPickCycle(vid, 'want:comfort:engage', [
          '"It helps. Just — saying it out loud to someone who\'s actually listening. It helps."',
          '"I keep going over it. Having someone here... it slows the spiral."',
          '"My hands stopped shaking. That\'s — that\'s something. Thank you for sitting here."',
          '"I can breathe all the way down again. I couldn\'t, before you sat down."',
          '"Saying it out loud makes it smaller. Still there. Smaller."',
          '"I keep waiting for it to get worse again. It hasn\'t. Not while you\'re here."',
        ]) || '"It helps. Just — saying it out loud. It helps."';
      },
      deflectBeat(vid) {
        // DEFLECT POOL (journey landing 2026-10-12): same single-line class
        // as the other want deflectBeats — pooled like the favor commit/
        // close lines so the reaction isn't verbatim-identical every time.
        return this.convoPickCycle(vid, 'deflect:seek_comfort', [
          '"Right. Sorry. I\'m fine." They are very obviously not fine.',
          '"...Yeah. Forget it." They turn back to the fire a little too fast.',
          '"It\'s nothing. Really." It isn\'t nothing. You both know it.',
        ]) || '"Right. Sorry. I\'m fine." They are very obviously not fine.';
      },
      menuOptions(vid, stage) {
        if ((stage || 0) >= 2) {
          return [
            { id: 'dlg:stay', labels: ['"I\'ll stay a while."', '"I\'m not going anywhere."'], temper: 'kind' },
            { id: 'dlg:empathize', labels: ['"I\'m here."'], temper: 'kind' },
          ];
        }
        return [
          { id: 'dlg:comfort', labels: ['"Hey — are you alright?"', '"Are you okay?"'], temper: 'kind' },
          { id: 'dlg:empathize', labels: ['"That sounds really hard."', '"Yeah. I hear you."'], temper: 'kind' },
          { id: 'dlg:cant', labels: ['"I can\'t — I\'m sorry."'], temper: 'neutral' },
        ];
      },
      closeLine(vid, resolution) {
        if (resolution === 'engaged' || resolution === 'comforted') return '"Thanks for... you know. Just listening."';
        return null;
      },
      resolve(vid, resolution) {
        if (resolution === 'engaged' || resolution === 'comforted') return null;
        return { wantId: 'seek_comfort', note: 'whatever\'s been weighing on me' };
      },
    },
    warn_you: {
      // Only the warning menu (dlg:details/dlg:heed) engages.
      pick(vid) {
        // They know something dangerous. More likely after monster activity.
        try {
          const v = Game.state.village;
          if ((v.recentAttacks || 0) > 0) return 3;
        } catch (e) {}
        return 0.5;
      },
      opener(vid) {
        return '"Listen. I need you to hear this before you go back out there."';
      },
      engageBeat(vid) {
        // "What's going on?" -> the actual warning. Real content.
        return Game.convoWantWarning(vid);
      },
      deflectBeat(vid) {
        // DEFLECT POOL (journey landing 2026-10-12): same single-line class
        // as the other want deflectBeats — pooled like the favor commit/
        // close lines so the reaction isn't verbatim-identical every time.
        return this.convoPickCycle(vid, 'deflect:warn_you', [
          '"...Suit yourself. Don\'t say I didn\'t try."',
          '"Suit yourself — but I warned you. Don\'t say I didn\'t."',
          '"Fine. But watch yourself." They mean it more than the shrug says.',
        ]) || '"...Suit yourself. Don\'t say I didn\'t try."';
      },
      menuOptions(vid, stage) {
        if ((stage || 0) >= 2) {
          return [
            { id: 'dlg:heed', labels: ['"I\'ll be careful."', '"I hear you. I\'ll watch myself."'], temper: 'kind' },
            { id: 'dlg:react', labels: ['"Noted."'], temper: 'neutral' },
          ];
        }
        return [
          { id: 'dlg:details', labels: ['"What is it? What happened?"', '"Tell me."'], temper: 'neutral' },
          { id: 'dlg:heed', labels: ['"I\'ll be careful."'], temper: 'kind' },
          { id: 'dlg:react', labels: ['"I\'ll risk it."'], temper: 'neutral' },
        ];
      },
      closeLine(vid, resolution) {
        if (resolution === 'heeded') return '"Good. Just — be careful. I mean it."';
        return null;
      },
      resolve(vid, resolution) { return null; }, // warning delivered or not, no seed
    },
    curious: {
      // Answering IS the engagement for a question want.
      answerEngages: true,
      pick(vid) {
        // They want to know about YOU. More likely at higher trust —
        // but strangers get curious too (Principle 12 override).
        try {
          const t = (Game.state.village.trust || {})[vid] || 10;
          if (t >= 40) return 2;
        } catch (e) {}
        return 1;
      },
      opener(vid) {
        // The question IS the beat: hang the real bespoke question and
        // speak it in the same breath. One pick, one hang — the menu
        // answers the same question they just asked. (convo rebuild
        // 2026-10-11: the old flow hung a different question than the
        // opener spoke.)
        // SEED RESUME (journey social r14 2026-10-14): a seed for an
        // unanswered question re-hangs THE SAME question. convoResolveWant
        // runs before endConvo clears pendingQ, so resolve() recorded the
        // hanging question's id in the seed (seedQid). Pre-fix the opener
        // hung a fresh pick here (the seed claimed "About that question"
        // while asking a different question) and the original evaporated —
        // the seed is a promise to resume, not a fresh ask.
        const c0 = (typeof Game.convoGet === 'function') ? Game.convoGet(vid) : null;
        const resumeQid = (c0 && c0.want && c0.want.fromSeed) ? (c0.want.seedQid || null) : null;
        if (resumeQid) {
          const qd = (typeof Game.convoQuestionDef === 'function') ? Game.convoQuestionDef(resumeQid) : null;
          if (qd && qd.q) {
            // A resume, not a new ask: askedQs/askedAny already record it
            // (it was hung before the walkaway) — don't double-count, don't
            // re-gate on trust/mood. The NPC is picking the thread back up.
            c0.pendingQ = { id: qd.id, answers: qd.answers || [] };
            c0.pendingQDodges = 0;
            // WANT-QUESTION IDENTITY (journey social r14): the want's
            // question, for thread labels even after it's answered (the
            // open-thread ledger names the question, not 'that question').
            if (c0.want) c0.want.qid = qd.id;
            return qd.q;
          }
          // Question def gone (data changed since the seed) — fall through
          // to a fresh ask rather than stranding the want.
        }
        const q = (typeof Game.convoHangWantQuestion === 'function') ? Game.convoHangWantQuestion(vid) : null;
        if (q && q.q) return q.q;
        return null; // no unasked question left — the want can't open
      },
      engageBeat(vid) {
        return '"Huh. I wouldn\'t have guessed that about you."';
      },
      deflectBeat(vid) {
        // DEFLECT POOL (journey landing 2026-10-12): same single-line class
        // as the other want deflectBeats — pooled like the favor commit/
        // close lines so the reaction isn't verbatim-identical every time.
        return this.convoPickCycle(vid, 'deflect:curious', [
          '"Fair enough. Some things aren\'t for sharing."',
          '"Okay. I won\'t pry." The curiosity doesn\'t leave their eyes, though.',
          '"...Right. Your business." They let it drop — visibly, effortfully.',
        ]) || '"Fair enough. Some things aren\'t for sharing."';
      },
      menuOptions(vid, stage) { return []; }, // the question's answers ARE the menu
      canOpen(vid) {
        // STRANDED-WANT GUARD (journey scale r10 2026-10-19): the opener can
        // only fire when an unasked question exists to hang. Pure by
        // contract — convoPickUnaskedQuestion reads, never consumes.
        try { return !!this.convoPickUnaskedQuestion(vid); } catch (e) { return true; }
      },
      closeLine(vid, resolution) {
        if (resolution === 'engaged') return '"Good talk. I feel like I know you a little better now."';
        return null;
      },
      // A walked-away-from question hangs: the curiosity plants a seed so
      // the next conversation resumes it instead of evaporating. A natural
      // close after answering plants nothing — the question was answered.
      // (convo rebuild 2026-10-11: trust proof caught curious never seeding.)
      // SEED NAMES THE QUESTION (journey social r14 2026-10-14): the seed
      // records the hanging question's id — convoResolveWant runs BEFORE
      // endConvo clears pendingQ, so the unanswered question is still live
      // here. Pre-fix the seed stored only the generic note 'that question'
      // and the resume hung a different question, so the original evaporated
      // and "About that question" referenced a question never asked.
      resolve(vid, resolution, how) {
        if (how === 'left' && resolution !== 'deflected' && resolution !== 'unestablished') {
          let qid = null;
          try { const c = this.convoGet(vid); qid = (c && c.pendingQ && c.pendingQ.id) || null; } catch (e) {}
          return { wantId: 'curious', note: this.convoQuestionTopic(qid), qid: qid };
        }
        return null;
      },
    },
    just_company: {
      // A reaction ("yeah, hey") engages company — presence, not content.
      reactEngages: true,
      pick(vid) {
        try {
          const n = Game.npcNeeds(vid);
          if (n.social > 70) return 3;
        } catch (e) {}
        return 1;
      },
      opener(vid) {
        return Game.convoPickCycle(vid, 'want:company:open', [
          '"Hey. Got a minute? No reason. Just — hey."',
          '"Mind if I just sit with you for a bit?"',
        ]);
      },
      engageBeat(vid) {
        return '"This is nice. Just — being around people. I forget how much I need it."';
      },
      deflectBeat(vid) {
        return '"Oh. Yeah, of course. I\'ll — I\'ll go."';
      },
      menuOptions(vid, stage) {
        return [
          { id: 'dlg:react', labels: ['"Yeah. Hey."', '"Sure. Sit."'], temper: 'kind' },
          { id: 'dlg:more', labels: ['"What\'s on your mind?"'], temper: 'neutral' },
        ];
      },
      closeLine(vid, resolution) {
        if (resolution === 'engaged') return '"Thanks for the company. Really."';
        return null;
      },
      resolve(vid, resolution) { return null; },
    },
    seek_taken: {
      // THE TAKING WANT (2026-10-11, KIN canon): the NPC lost kin in the
      // Taking -- half the adults at the Scattering, day zero, plus their
      // children into stasis -- and wants something from the player: news,
      // a promise to ask the System, a witness. Mourning, not melodrama.
      // Only villagers with Taking-marked lifeseed kin can draw it, and
      // never twice in three days.
      pick(vid) {
        try {
          const day = (Game.state.scholar || {}).day || 0;
          const c = this.convoGet(vid);
          // SENTINEL FIX (journey landing r15 2026-10-14): takenWantDay is
          // unset (0) until the want first fires — and 0 >= day-3 is TRUE on
          // days 1-3, so the "never twice in three days" gate hard-blocked
          // the want for the entire opening window. Only gate when a draw
          // actually happened.
          const lastDraw = c.takenWantDay || 0;
          if (lastDraw > 0 && lastDraw >= day - 3) return 0;
          if (!this.takenKinOf || !this.takenKinOf(vid).length) return 0;
          return 2;
        } catch (e) { return 0; }
      },
      opener(vid) {
        // NOTE (gap-closure 2026-10-17): opener() is pure — it must not
        // consume the takenWantDay gate. It runs even when the opener is
        // ledger-skipped, which used to burn the 3-day gate on a
        // conversation where the want never surfaced. The gate is set in
        // onSurfaced, below — only when the opener actually speaks.
        const kin = (this.takenKinOf(vid) || [])[0] || {};
        const first = (kin.name || 'them').split(' ')[0];
        return Game.convoPickCycle(vid, 'want:taken:open', [
          '"Have you heard anything? About the taken. The pods. Anything at all."',
          `"You talk to it -- the System. Have you ever asked? About the taken -- about ${first}?"`,
          '"I keep dreaming about rows of pods. Humming. Tell me I\'m not the only one."',
        ]);
      },
      staleOpener(vid) {
        // STATE-AWARE REFRAME (gap-closure 2026-10-17): when every fresh
        // opener variant is ledger-blocked, the want reframes instead of
        // going permanently mute. Promised vs unpromised changes what they
        // say — the promise is the live thread.
        try {
          const kin = (this.takenKinOf(vid) || [])[0] || {};
          const first = (kin.name || 'them').split(' ')[0];
          const v = this.state.village || {};
          const promised = v.takenPromises && v.takenPromises[vid];
          const key = 'want:taken:stale';
          if (promised) return Game.convoPickCycle(vid, key, [
            `"You said you'd ask about the pods. Have you? About ${first} — I need to know if you heard anything."`,
            `"About ${first} — did the System answer? I keep thinking about the humming."`,
          ]);
          return Game.convoPickCycle(vid, key, [
            `"${first} — I keep coming back to it. The pods, humming. Do you think they're still in there?"`,
            `"I dreamed about the pods again. ${first}'s face. Tell me I'm not the only one who hears the humming."`,
            `"About the taken — about ${first}. I can't stop turning it over. Have you heard anything new?"`,
          ]);
        } catch (e) { console.warn('[convo] seek_taken staleOpener', e); return null; }
      },
      onSurfaced(vid) {
        // The never-twice-in-three-days gate starts when the want actually
        // surfaces (fresh opener or stale reframe) — never on a skipped
        // opener. SENTINEL FIX (journey landing r15 2026-10-14) preserved.
        try { this.convoGet(vid).takenWantDay = (Game.state.scholar || {}).day || 0; }
        catch (e) { console.warn('[convo] takenWantDay', e); }
      },
      engageBeat(vid) {
        const kin = (this.takenKinOf(vid) || [])[0] || {};
        const first = (kin.name || 'they').split(' ')[0];
        const rel = kin.relation || 'kin';
        const fate = String(kin.fate || 'went up in the Taking');
        const cap = fate.charAt(0).toUpperCase() + fate.slice(1);
        // REPEAT-ACK (journey-scale r8 2026-10-18): the taken story is
        // deterministic from kin data — without a memory check the NPC
        // re-tells it byte-identical 40 days later (Paola/Willow r7
        // transcripts: day80 = day120, no "still no news"). A real person
        // doesn't re-tell a story they've already told you as if it were
        // new. The said-facts ledger (Steve 2026-10-07) is the honest
        // mechanism: first telling records the fact; repeats acknowledge it.
        try {
          if (this.convoFactRecalled && this.convoFactRecalled(vid, 'taken-story')) {
            return `"Still nothing on ${first}. I told you about the pods -- I keep thinking about them. The humming. Some nights I'm sure it's a dream. Other nights I'm sure it's not."`;
          }
          if (this.convoSaidFact) this.convoSaidFact(vid, 'taken-story', first);
        } catch (e) {}
        return `"It's my ${rel}, ${first}. ${cap}. ${takenPodTailFor(vid)}"`;
      },
      // def-level passthrough for tests; engageBeat calls the module fn
      // directly (inside def methods, `this` is the Game, not the def).
      takenPodDreamTail(vid) { return takenPodTailFor(vid); },
      deflectBeat(vid) {
        return '"Yeah. Sorry. It\'s -- never mind. Forget I said anything." They look away, embarrassed at having wanted something.';
      },
      commitBeat(vid) {
        // The player promised to ask the System about the pods. Record it --
        // the table reunion remembers who asked (kidsBackOutcome).
        try {
          const v = Game.state.village || {};
          v.takenPromises = v.takenPromises || {};
          v.takenPromises[vid] = (Game.state.scholar || {}).day || 0;
          // PODS WEIGHT (2026-10-11, KIN canon): the promise enters the
          // village's social memory — kept or broken, it will surface.
          try { if (typeof Game.podRemember === 'function') Game.podRemember('promise', { vid, note: 'promised ' + vid + ' to ask about the pods' }); } catch (e) {}
        } catch (e) {}
        return '"You\'d do that? Ask it? ...Thank you. Really. Even asking is more than the silence."';
      },
      menuOptions(vid, stage) {
        return [
          { id: 'dlg:more', labels: ['"Tell me about them."', '"What do you remember?"'], temper: 'kind' },
          { id: 'dlg:commit', labels: ['"I\'ll ask the System about the pods."', '"I\'ll ask it. I promise."'], temper: 'kind' },
          { id: 'dlg:cant', labels: ['"I don\'t know anything. I\'m sorry."'], temper: 'neutral' },
        ];
      },
      closeLine(vid, resolution) {
        if (resolution === 'promised') return '"If it answers -- you\'ll tell me? Whatever it says. I can take it."';
        if (resolution === 'engaged') return '"Thanks for listening. Most people change the subject."';
        return null;
      },
      resolve(vid, resolution) {
        // Promised: the promise is recorded; no nagging seed. Heard but not
        // promised, or deflected: they'll try again another day.
        if (resolution === 'promised') return null;
        return { wantId: 'seek_taken', note: 'what happened to my taken kin' };
      },
    },
  };

  const methods = {
    // convoFindFavorNeed: PURE scan for a real, current need — no phrasing,
    // no side effects. Returns {kind, urgency, ...ctx} or null. A null means
    // no favor can be honestly built: the want picker must skip ask_favor.
    convoFindFavorNeed(vid) {
      const v = this.state.village || {};
      const day = (this.state.scholar || {}).day || 0;
      // ONE OPEN COMMITMENT per villager — a new favor while one is open
      // (or a formal vow is open) lies about capacity.
      try {
        const open = (v.promises || {})[vid];
        if (open && !open.kept) return null;
      } catch (e) {}
      // Recently declined — they're not asking again yet.
      try {
        const lastDeclined = (v.favorDeclined || {})[vid];
        if (lastDeclined != null && day - lastDeclined < 3) return null;
      } catch (e) {}
      let need = null;
      try {
        const n = this.npcNeeds(vid) || {};
        const health = (v.health || {})[vid];
        const sickRec = ((v.sick || {})[vid] || {});
        const sickActive = (sickRec.daysLeft || 0) > 0;
        const sickSev = sickRec.severity || 0;
        // Acute personal needs first — the body doesn't wait.
        // SICKNESS OUTRANKS HUNGER (journey crisis r8 2026-10-14): sev2+
        // sickness is the emergency — sense-tested, hungry+sick villagers
        // asked for food and never mentioned the gut rot doubling them over
        // (the sick rest by the fire, so hunger climbs past 70 and the old
        // order buried sick_help every time). Mild (sev1) sickness still
        // waits behind real hunger — that's human too.
        // Mundane v.sick records only — alien quirks are never cured by
        // earthly help, so no promise the engine can't keep (canon:
        // docs/DISEASES.md, two pools never mix).
        if (sickActive && sickSev >= 2) need = { kind: 'sick_help', urgency: 4, sickName: sickRec.name || 'sick' };
        else if ((n.hunger || 0) > 70) need = { kind: 'food_share', urgency: 4, hunger: n.hunger };
        else if (health != null && health < 60) need = { kind: 'heal_help', urgency: 4, health };
        // SICKNESS (crisis leg 2026-10-11): a sick villager's body is the
        // emergency — the want system had no disease need, so the sick
        // talked about anything BUT being sick (sense-tested: a gutrot
        // sufferer opened with small talk and never mentioned it).
        else if (sickActive) need = { kind: 'sick_help', urgency: 4, sickName: sickRec.name || 'sick' };
        else if ((n.energy || 0) < 30) need = { kind: 'watch_shift', urgency: 3, energy: n.energy };
        else if ((n.fear || 0) > 70) need = { kind: 'stay_close', urgency: 3, fear: n.fear };
      } catch (e) {}
      if (!need) {
        try {
          const water = (v.water || {}).clean || 0;
          if (water < 10) {
            need = { kind: 'water_haul', urgency: 3, water };
          } else {
            const kcal = typeof this.pantryKcalLive === 'function' ? this.pantryKcalLive(v) : (v.pantryKcal || 0);
            const rosterN = (v.roster || []).length || 1;
            if (kcal < rosterN * 4000) need = { kind: 'forage_help', urgency: 2, kcal };
          }
        } catch (e) {}
      }
      if (!need) {
        // Occupation-grounded work — day-gated so it doesn't spam.
        try {
          const chars = this.data.villagers || [];
          const ch = chars.find(x => x.id === vid);
          const occ = ch && ch.occupationId;
          if (occ === 'hunting_guide' && (day % 3 === 0)) need = { kind: 'snare_mend', urgency: 2 };
        } catch (e) {}
      }
      return need;
    },

    // convoFavorHash: per-instance variation key. Hashes (stablePersonKey,
    // day, seq) so the same NPC on different days — or different NPCs —
    // don't get the same slot combination. The key is the STABLE person key,
    // not the villager ID string (IDs embed Date.now(); the old vid hash
    // broke run-to-run determinism, 2026-10-14). Not cryptographic, just
    // well-distributed.
    convoFavorHash(vid, ctx) {
      const _pk = (typeof this.stablePersonKey === 'function') ? this.stablePersonKey(vid) : String(vid);
      const s = _pk + '|' + (ctx.day || 0) + '|' + (ctx.seq || 0);
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      }
      return h >>> 0;
    },

    // convoForageSpot: the meeting place for a pantry-run favor, grounded in
    // the ASKING villager's own foraging knowledge (journey deepening r6,
    // 2026-10-12: the commit line was verbatim "East treeline, first light.
    // Bring a pack." across every NPC — the same spot, the same hour, the
    // same pack). If the villager knows an edible plant, they point at its
    // patch by name; otherwise they fall back to treeline-relative spots.
    // Selection is deterministic per instance hash — two NPCs the same day
    // point different directions, and one NPC can move the meeting day to day.
    convoForageSpot(vid, hh) {
      const generics = [
        'the east treeline',
        'the north treeline by the fallen oak',
        'the creek bend, past the treeline',
        'the south slope below the meadow',
        'the old burn east of camp',
        'the meadow edge, west of the creek',
        'the ridge above the creek',
        'the far treeline, past the rocks',
      ];
      const spots = generics.slice();
      try {
        const known = (Game.plantsKnownBy ? Game.plantsKnownBy(vid) : []) || [];
        const foodPlants = [];
        const seen = {};
        for (const pid of known) {
          if (seen[pid]) continue; seen[pid] = 1;
          const p = (Game.data.plants || []).find(x => x.id === pid);
          if (p && (p.caloriesPerUnit || 0) > 0 && p.name) foodPlants.push(p);
        }
        foodPlants.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
        const fp = foodPlants.length ? foodPlants[hh % foodPlants.length] : null;
        if (fp) {
          const nm = String(fp.name).toLowerCase();
          spots.push('where the ' + nm + ' grows thick');
          spots.push('the ' + nm + ' patch past the treeline');
        }
      } catch (e) {}
      return spots[hh % spots.length];
    },

    // convoBuildFavor: turn a need into a favor INSTANCE — WHO, concrete
    // task (verb+object+time+place), WHY (grounded), stakes, deadline.
    // The lines are generated ONCE per instance and stored — never
    // re-rendered from a pool, so verbatim repetition is impossible.
    convoBuildFavor(vid, need) {
      if (!need || !FAVOR_KINDS[need.kind]) return null;
      const def = FAVOR_KINDS[need.kind];
      const v = this.state.village || {};
      const day = (this.state.scholar || {}).day || 0;
      let name = 'them';
      try { name = this.displayName(vid) || 'them'; } catch (e) {}
      // Instance identity — unique per villager per day, sequenced. The seq
      // also keys phrasing variants, so the same need on different days
      // doesn't produce the same text.
      v.favorSeq = (v.favorSeq || 0) + 1;
      const ctx = { name, rosterN: (v.roster || []).length || 1, day, seq: v.favorSeq };
      let parts = null;
      try { parts = def.build.call(this, vid, need, ctx); } catch (e) { parts = null; }
      if (!parts || !parts.task || !parts.line) return null;
      return {
        id: 'favor-' + vid + '-' + day + '-' + v.favorSeq,
        vid, kind: need.kind,
        keepKind: def.keepKind, goal: def.goal,
        task: parts.task, short: parts.short || parts.task,
        why: parts.stakes || '', stakes: parts.stakes || '',
        line: parts.line, whyLine: parts.whyLine || parts.line,
        whyLines: parts.whyLines || null, commitLines: parts.commitLines || null,
        commitLine: parts.commitLine || '"Thank you. Seriously — thank you."',
        goodbye: parts.goodbye || '"Thank you."',
        deadline: day + (def.deadlineDays ?? 2),
        ...(need.kind === 'stay_close' ? {companyVersion:1,companyNight:day} : {}),
        state: 'asked', askedDay: day,
      };
    },

    // convoGetFavor / convoStoreFavor: the favor ledger — one current favor
    // per villager. The instance survives across conversations so follow-ups
    // reference the same ask (the NPC remembers).
    convoGetFavor(vid) {
      try { return (((this.state.village || {}).favorLedger || {})[vid]) || null; }
      catch (e) { return null; }
    },
    convoStoreFavor(favor) {
      if (!favor || !favor.vid) return;
      try {
        const v = this.state.village || {};
        v.favorLedger = v.favorLedger || {};
        v.favorLedger[favor.vid] = favor;
      } catch (e) {}
    },

    // openFavorObligation: the tracked promise for a favor, if open.
    openFavorObligation(vid) {
      try {
        const p = (((this.state.village || {}).promises || {})[vid]);
        return (p && !p.kept && p.favorId) ? p : null;
      } catch (e) { return null; }
    },

    // convoFavorCommit: "I'll do it" creates a TRACKED OBLIGATION — the same
    // v.promises structure as formal vows, so checkPromises fulfillment,
    // deadlines, and the journal all work. One open commitment per villager.
    convoFavorCommit(vid, favor) {
      if (!favor) return { ok: false };
      if (favor.kind === 'stay_close' && this.companyFavorCommitGate) {
        const gate=this.companyFavorCommitGate(vid,favor);if(!gate.ok)return{ok:false,line:gate.reason};
      }
      if (this.convoFavorAction(vid, favor).unsupported) return { ok: false, unsupported: true };
      if (favor.vid !== vid || !['asked', 'promised'].includes(favor.state)) return { ok: false, closed: true };
      const v = this.state.village || {};
      v.promises = v.promises || {};
      const day = (this.state.scholar || {}).day || 0;
      const oldP = v.promises[vid];
      if (oldP && !oldP.kept) return { ok: false, blocked: true };
      if (oldP) { this.journalFavorPromise?.(vid, oldP); delete v.promises[vid]; }
      v.promises[vid] = {
        goal: favor.goal, day: day, kept: false, maker: this.villagerId,
        favorId: favor.id, favorTask: favor.task, favorDeadline: favor.deadline,
      };
      favor.state = 'promised';
      favor.promisedDay = day;
      if (favor.kind === 'water_haul') {
        v.promises[vid].waterHaulVersion = 1;
        favor.meetDay = day + 1;
      }
      if (favor.kind === 'stay_close') {
        v.promises[vid].companyVersion=1;v.promises[vid].companyNight=favor.companyNight;
        favor.company=null;
      }
      try { this.remember(vid, 'promise', 'promised: ' + favor.task); } catch (e) {}
      this.journalFavorPromise?.(vid, v.promises[vid], {});
      try { this.notePlaystyle('social'); } catch (e) {}
      return { ok: true };
    },

    // One read-only contract for menus, explanations and dispatch. A promise
    // describes future intent; only the canonical physical action keeps it.
    convoFavorAction(vid, favor) {
      favor = favor || this.convoGetFavor(vid);
      const blocked = reason => ({ ready: false, reason });
      if (!favor || favor.vid !== vid) return blocked('There is no current request to act on.');
      if (favor.kind === 'water_haul' && this.waterFavorAction) return this.waterFavorAction(vid, favor);
      if (favor.kind === 'stay_close' && this.companyFavorAction) return this.companyFavorAction(vid, favor);
      if (!['asked', 'promised'].includes(favor.state)) return blocked('This request is already closed.');
      const unavailable = {
        water_haul: 'The joint creek trip has no playable action yet. Assigning someone a water task does not perform this trip.',
        snare_mend: 'There is no playable shared snare-repair job yet. An unrelated village task cannot complete this request.',
        watch_shift: 'There is no playable watch handover yet. Waiting or assigning a patrol does not take their shift.',
        stay_close: 'There is no playable overnight company action yet. A quick conversation does not keep an overnight promise.',
        forage_help: 'There is no playable joint foraging outing yet. Giving food does not perform the promised outing.',
      };
      if (unavailable[favor.kind]) return { ...blocked(unavailable[favor.kind]), unsupported: true };
      if (!['food_share', 'heal_help', 'sick_help'].includes(favor.kind)) return { ...blocked('This request has no playable action yet.'), unsupported: true };
      const v = this.state.village, s = this.state.scholar;
      if (this.over || s.dead) return blocked('This life has ended.');
      if (this.inCombat && this.inCombat()) return blocked('Finish the fight before helping.');
      const person = this.getPerson(vid);
      if (!(v.roster || []).includes(vid) || vid === this.villagerId || !person || person.dead) return blocked('They are no longer available to receive help.');
      const node = v.nodePos?.[vid] || { nx: v.px ?? 4, ny: v.py ?? 4 }, pos = v.positions?.[vid];
      const haven = this.map.px === (v.px ?? 4) && this.map.py === (v.py ?? 4);
      if (v.away?.[vid] || node.nx !== this.map.px || node.ny !== this.map.py ||
          (haven && !!v.npcInside?.[vid] !== (s.insideHaven !== false)) || !pos ||
          ![pos.mx, pos.my, s.mx, s.my].every(Number.isFinite) ||
          Math.max(Math.abs(pos.mx - s.mx), Math.abs(pos.my - s.my)) > 1) return blocked('Move next to them, on the same side of the Haven door, to help.');
      if (favor.kind === 'food_share') {
        const meal = this.giveFoodOptions().find(o => o.id === 'meal' || o.amount === 'meal');
        if (!meal) return blocked('You need edible, unspoiled food in your pack. Food in the pantry must be collected first.');
        return { ready: true, action: 'food', label: 'Share food now (up to 3 portions)', reason: 'Give up to three edible portions from your pack. The handoff takes a short action; they may still be hungry afterward.' };
      }
      if (favor.kind === 'heal_help' && (v.sick?.[vid] || (v.health?.[vid] ?? 100) >= 70)) return blocked('Wound care requires an untreated wound below 70 health and no current illness.');
      if (favor.kind === 'sick_help' && !v.sick?.[vid]) return blocked('They are no longer sick. There is no illness to tend.');
      return { ready: true, action: 'care', label: 'Tend them now (about half an hour)', reason: 'Spend about half an hour providing basic care. No magic or medical ability is required; this is not an instant cure.' };
    },

    convoFavorActionMenu(vid, favor, canPromise) {
      const status = this.convoFavorAction(vid, favor), out = [];
      if (status.ready) out.push({ id: 'dlg:favor_action', labels: [status.label], temper: 'kind' });
      out.push({ id: 'dlg:favor_requirements', labels: [status.ready ? 'What will helping involve?' : 'Why can’t I do this now?'], temper: 'neutral' });
      if (canPromise && !status.unsupported && status.canPromise !== false) out.push({ id: 'dlg:commit', labels: [favor?.kind==='stay_close'?(favor.companyNight===this.state.scholar.day?'"I’ll meet you by the fire tonight."':'"I’ll meet you by the fire on night '+favor.companyNight+'."'):'"I’ll come back to help."'], temper: 'kind' });
      const promise = this.state.village.promises?.[vid];
      if (status.unsupported && promise?.favorId === favor?.id && !promise.kept) out.push({ id: 'dlg:favor_cancel', labels: ['Close this unavailable job (no penalty)'], temper: 'neutral' });
      if (favor?.kind === 'water_haul' && favor.waterRun && !favor.waterRun.returned && this.waterFavorAction(vid,favor,true).ready) out.push({ id: 'dlg:favor_cancel', labels: ['End trip and unload what we have (break unfinished promise)'], temper: 'neutral' });
      if (favor?.kind === 'stay_close' && promise?.favorId === favor.id && !promise.kept && !status.unsupported) out.push({ id:'dlg:favor_cancel',labels:['Break tonight’s company promise'],temper:'neutral' });
      return out;
    },

    convoPerformFavor(vid, favor) {
      if (favor?.kind === 'water_haul' && this.performWaterFavor) return this.performWaterFavor(vid, favor);
      if (favor?.kind === 'stay_close' && this.performCompanyFavor) return this.performCompanyFavor(vid, favor);
      const status = this.convoFavorAction(vid, favor);
      if (!status.ready) return { ok: false, line: status.reason };
      const v = this.state.village;
      const recordHelp = () => {
        const p = v.promises?.[vid];
        if (p?.favorId === favor.id && p.kept === 'broken') {
          favor.state = 'broken'; favor.helpedAfterBreakDay = this.state.scholar.day;
          return p.closedReason === 'deadline' ? ' The deadline passed, so this does not fulfill your promise.' : ' The earlier promise remains broken.';
        }
        favor.state = 'fulfilled'; favor.fulfilledDay = this.state.scholar.day;
        return '';
      };
      if (status.action === 'food') {
        const result = this.giveFood(vid, 'meal');
        if (!result?.ok || !(result.units > 0)) return { ok: false, line: 'No food changed hands. The request is still open.' };
        const missed = recordHelp();
        return { ok: true, promiseMissed: !!missed, line: `You give them ${result.units} portion${result.units === 1 ? '' : 's'} from your pack. They may still need more food.` + missed };
      }
      // tendVillager deliberately returns null on success. Its real care
      // operation, not return truthiness, is the receipt. Readiness was just
      // checked against the very same illness/wound thresholds.
      this.tendVillager(vid);
      if (this.over || !(v.roster || []).includes(vid)) return { ok: false, line: 'The time spent helping has ended. Check the current situation before doing anything else.' };
      const missed = recordHelp();
      return { ok: true, promiseMissed: !!missed, line: 'You spend time tending them. This was care, not a promise of a cure.' + missed };
    },

    // convoFavorRenounce: backing out of an open favor obligation — it breaks
    // NOW, with the cost, honestly. Not a silent rot.
    convoFavorRenounce(vid) {
      const v = this.state.village || {};
      const p = (v.promises || {})[vid];
      if (!p || p.kept || !p.favorId) return false;
      p.kept = 'broken';
      p.closedReason = 'renounced'; p.closedDay = this.state.scholar.day;
      const favor = this.convoGetFavor(vid);
      if (favor && favor.id === p.favorId) favor.state = 'broken';
      const t = v.trust || {};
      // RENOUNCE MAKER (journey-succession r11 2026-10-14): the broken word is
      // the renouncer's — stamp maker like the rot path does (game.js), so a
      // successor isn't refused amends for a promise they never made (canon:
      // "it's not yours to carry"). trustAtBreak is the pre-penalty standing,
      // matching the rot path — the decay refusal reads it later.
      const trustAtBreakRen = (t[vid] == null ? 10 : t[vid]);
      // Through the one consequence path (convo-scene.js) like every other
      // conversation trust move; talk:false — breaking your word is an act.
      if (typeof this.resolveConsequence === 'function') {
        this.resolveConsequence(vid, { trust: -15, mood: 0, temper: 'neutral', talk: false, name: 'favor_renounce' });
      } else {
        // convo-scene.js not loaded (some unit harnesses): same delta, direct
        const tw = v.trust || (v.trust = {});
        tw[vid] = Math.max(0, trustAtBreakRen - 15);
      }
      try { this.remember(vid, 'promise_broken', p.favorTask || p.goal, { trustAtBreak: trustAtBreakRen, maker: p.maker || this.villagerId }); } catch (e) {}
      this.journalFavorPromise?.(vid, p);
      try { this.say(`${this.displayName(vid)} goes quiet. "...Okay." The air between you cools a degree.`); } catch (e) {}
      return true;
    },

    // convoFavorNeedLive: is this favor's underlying need still real?
    // A follow-up must not re-ask for water after the cistern got filled.
    convoFavorNeedLive(favor) {
      if (!favor) return false;
      try {
        const v = this.state.village || {};
        switch (favor.kind) {
          case 'food_share': return (this.npcNeeds(favor.vid).hunger || 0) > 50;
          case 'heal_help': return ((v.health || {})[favor.vid] ?? 100) < 80;
          case 'sick_help': return ((((v.sick || {})[favor.vid] || {}).daysLeft || 0) > 0);
          case 'watch_shift': return (this.npcNeeds(favor.vid).energy || 100) < 50;
          case 'stay_close': return (this.npcNeeds(favor.vid).fear || 0) > 50;
          case 'water_haul': return (favor.waterRun && !favor.waterRun.returned) || ((v.water || {}).clean || 0) < 15;
          case 'forage_help': {
            const kcal = typeof this.pantryKcalLive === 'function' ? this.pantryKcalLive(v) : 0;
            return kcal < (((v.roster || []).length || 1) * 6000);
          }
          default: return true;
        }
      } catch (e) { return true; }
    },

    // convoFavorFollowup: the NPC remembers the prior ask. The follow-up
    // names it — never resets it, never re-asks verbatim.
    convoFavorFollowup(vid, favor) {
      if (favor?.kind === 'stay_close' && this.companyFavorOpening) {const line=this.companyFavorOpening(vid,favor);if(line)return line;}
      const day = (this.state.scholar || {}).day || 0;
      const open = this.openFavorObligation(vid);
      if (favor.state === 'promised' && open) {
        const daysLeft = favor.deadline - day;
        const when = daysLeft <= 0 ? "Today's the day." : daysLeft === 1 ? 'Tomorrow, then.' : "We've got a couple days.";
        return `"About ${favor.short} — have you had a chance? ${when}"`;
      }
      if (favor.state === 'fulfilled') {
        const c = this.convoGet(vid);
        if (c && c.want) { c.want.favor = favor; c.want._favorSettle = 'thanked'; }
        return `"You came through on ${favor.short}. I won't forget it."`;
      }
      if (favor.state === 'broken') {
        const c = this.convoGet(vid);
        if (c && c.want) { c.want.favor = favor; c.want._favorSettle = 'acknowledged'; }
        return `"You said you'd help with ${favor.short}. ...It's done now. Forget it."`;
      }
      if (favor.state === 'asked') {
        if (!this.convoFavorNeedLive(favor)) {
          favor.state = 'moot';
          return `"Never mind ${favor.short} — we got it handled. Thanks anyway."`;
        }
        // INHERITED ASK (journey-succession 2026-10-11): the ask was the
        // predecessor's — the first re-ask after the handoff names them.
        // The deadline refreshes: it's a new ask of a new bearer. (Death
        // reverts 'promised' favors to 'asked' — see playerDeath.)
        const predA = (typeof this.inheritedName === 'function') ? this.inheritedName(favor) : null;
        if (predA && !favor.inheritedAcked) {
          favor.inheritedAcked = true;
          try {
            const kdef = (typeof FAVOR_KINDS !== 'undefined' && FAVOR_KINDS[favor.kind]) || {};
            favor.deadline = day + (kdef.deadlineDays || 2);
          } catch (e) {}
          return `"I asked ${predA} about ${favor.short} — ${predA}'s gone. Still need hands. Are you in?"`;
        }
        // RE-ASK VARIETY (journey sociallife 2026-10-11): the uncommitted ask
        // recurs for as long as the need is live (days, from several
        // villagers). One template made it verbatim-identical across 60+
        // days — robotic. Cycle variants; the ask stays the same ask.
        const reasks = [
          `"About ${favor.short} — still need hands. Are you in?"`,
          `"About ${favor.short} — I still haven't found anyone. Any chance?"`,
          `"About ${favor.short} — I hate to ask twice, but it's still open. Will you?"`,
          `"About ${favor.short} — the need hasn't gone anywhere. I'm still asking."`,
        ];
        return (typeof this.convoPickCycle === 'function')
          ? (this.convoPickCycle(vid, 'favor:asked:' + (favor.id || favor.kind || ''), reasks) || reasks[0])
          : reasks[Math.floor(Math.random() * reasks.length)];
      }
      return null;
    },

    // convoFavorDeadlineNote: for the repay reminder.
    convoFavorDeadlineNote(favor) {
      if (favor?.kind === 'stay_close' && this.companyFavorDeadline) return this.companyFavorDeadline(favor);
      const day = (this.state.scholar || {}).day || 0;
      const p = this.state.village.promises?.[favor.vid];
      const due = p?.favorId === favor.id ? this.promiseDueDay(p) : favor.deadline;
      if (!Number.isFinite(due)) return 'We need to agree on a deadline.';
      const daysLeft = due - day;
      if (daysLeft < 0) return 'The deadline has passed.';
      if (daysLeft === 0) return 'By the end of today.';
      if (daysLeft === 1) return 'By the end of tomorrow.';
      return 'By the end of day ' + due + '.';
    },

    // convoSelectWant: pick the NPC's want for this conversation.
    // Priority: unresolved seeds > high needs > personality > random.
    // PRINCIPLE 12 OVERRIDE (convo rebuild 2026-10-11, Steve): trust tier
    // NEVER gates want depth. A stranger opens with something they want —
    // a question, a favor, news with a point. Small talk is the greeting,
    // never the whole conversation.
    // FIRST-MEETING CURIOSITY (convo gaps 2026-10-11, Steve: "Address any
    // gaps!"): the want economy had one winner — ask_favor's urgency 2-4
    // beat every other want's 0.5-1.5 whenever ANY real need existed, so
    // across 66 first meetings zero NPC questions fired and CONVERSATIONS.md's
    // "strangers are curious" guarantee died. Design call: first meetings
    // lead with curiosity about the stranger, not errands. ACUTE needs
    // (urgency 4: hunger>70, health<60, sick) still lead — that's human.
    // Chronic needs (urgency <= 3) are dampened on first meetings only.
    convoSelectWant(vid) {
      const water = this.waterFavorOpening?.(vid);
      if (water) return { id: 'repay', def: WANTS.repay, fromSeed: false, seedFavorId: this.convoGetFavor(vid).id };
      const seed = this.convoCheckSeeds(vid);
      if (seed && WANTS[seed.wantId]) {
        return { id: seed.wantId, def: WANTS[seed.wantId], fromSeed: true, seedNote: seed.note, seedFavorId: seed.favorId || null, seedQid: seed.qid || null };
      }
      const c0 = this.convoGet(vid);
      const firstMeeting = (c0.count || 0) <= 1;
      let best = null, bestW = -1;
      for (const id of Object.keys(WANTS)) {
        const def = WANTS[id];
        let w = 0;
        try { w = def.pick.call(this, vid); } catch (e) { w = 0; }
        if (firstMeeting) {
          if (id === 'curious') w = Math.max(w, 3);
          else if (id === 'ask_favor' && w > 0 && w < 4) w = w * 0.4;
        }
        // GRIEF FLOOR (journey landing r15 2026-10-14): the Taking is the
        // run's central grief (KIN.md) and seek_taken is the villagers' only
        // voice for it — but ask_favor's urgency (2-4) starved it on every
        // repeat sitting whenever any real need existed (0/48 conversations
        // + 0/4 forced repeat sittings across 4 seeds). First meetings stay
        // curiosity-led (2026-10-11 gaps call). On repeat meetings an
        // eligible seek_taken gets a floor of 3.1: it beats chronic needs
        // (urgency <= 3) but still yields to acute ones (urgency 4:
        // starving, sick, wounded — that's human). The want's own
        // never-twice-in-three-days gate keeps it from dominating.
        if (!firstMeeting && id === 'seek_taken' && w > 0) w = Math.max(w, 3.1);
        // STRANDED-WANT GUARD (journey scale r10 2026-10-19): a want whose
        // opener cannot fire must not be selected — observed: curious drawn
        // with no unasked question left, stranded at stage 0 with a fallback
        // opener and no ans:* menu (Marcus d80, resolution 'unestablished').
        // Applied AFTER the floors (the first-meeting floor used to force
        // curious to 3 even when it couldn't open). canOpen is pure by
        // contract — it reads, never consumes.
        try { if (def.canOpen && !def.canOpen.call(this, vid)) w = 0; } catch (e) {}
        w += Math.random() * 0.5;
        if (w > bestW) { bestW = w; best = id; }
      }
      if (!best) best = 'just_company';
      return { id: best, def: WANTS[best], fromSeed: false };
    },

    // convoWantOpener: the opening line when a want drives the conversation.
    // Returns {line, thread}. The want surfaces in the opening beats — never
    // queued, never polite-afterthought.
    convoWantOpener(vid, want) {
      if (!want || !want.def) return null;
      const c = this.convoGet(vid), v = this.state.village;
      const prior = { pending: c.pendingQ, count: c.qCount, dodges: c.pendingQDodges,
        asked: (c.askedQs || []).slice(), any: (v.askedQsAny || []).slice(), qid: c.want?.qid };
      let line = null;
      try { line = want.def.opener.call(this, vid); } catch (e) { line = null; }
      const question = c.pendingQ !== prior.pending ? c.pendingQ : null;
      if (question) {
        c.pendingQ = prior.pending; c.qCount = prior.count; c.pendingQDodges = prior.dodges;
        c.askedQs = prior.asked; v.askedQsAny = prior.any;
        if (c.want) c.want.qid = prior.qid;
      }
      if (!line) return null;
      return { line, thread: 'want', wantId: want.id, question };
    },

    // Generation is provisional. Only the accepted opener may hang an ask;
    // a ledger-blocked candidate cannot leave answers over a later recall.
    convoAcceptWantQuestion(vid, opener) {
      if (!opener?.question) return;
      const c = this.convoGet(vid), q = opener.question;
      c.pendingQ = { ...q, q: this.convoQuestionDef(q.id)?.q };
      c.pendingQDodges = 0; c.qCount = (c.qCount || 0) + 1;
      if (!c.askedQs.includes(q.id)) c.askedQs.push(q.id);
      this.noteAskedQ(q.id);
      if (c.want) c.want.qid = q.id;
    },

    // convoWantStaleOpener(vid, want): last-resort reframe when every fresh
    // opener variant is ledger-blocked (convoPickCycle resets on exhaustion
    // — it never returns null — so a long-lived want's variants all end up
    // in the no-repeat ledgers eventually). Names the want plainly; defs
    // with real content define staleOpener(vid) instead (see seek_taken).
    // Still ledger-checked by the caller — a blocked stale line falls
    // through honestly. (gap-closure 2026-10-17)
    convoWantStaleOpener(vid, want) {
      try {
        const words = String((want && want.id) || "what's on my mind").replace(/_/g, ' ');
        return `"About ${words} — I keep turning it over."`;
      } catch (e) { console.warn('[convo] staleOpener generic', e); return null; }
    },

    // convoWantEngage: PURE state transition for the want arc — no speech.
    // The turn handler speaks the beat (from the def); this moves the stage.
    // kind: 'engage' -> stage 2 | 'deflect' -> stage 3 'deflected' |
    //        'commit' -> stage 3 with the def's resolution ('promised' etc.)
    convoWantEngage(vid, kind) {
      const c = this.convoGet(vid);
      if (!c || !c.want) return;
      const want = c.want;
      if ((want.stage || 0) >= 3) return;
      if (kind === 'engage') {
        if ((want.stage || 0) < 2) want.stage = 2;
      } else if (kind === 'deflect') {
        want.stage = 3;
        want.resolution = 'deflected';
      } else if (kind === 'commit') {
        want.stage = 3;
        // The resolution names what the commitment MEANS per want.
        want.resolution = want.id === 'ask_favor' ? 'promised'
          : want.id === 'seek_taken' ? 'promised'
          : want.id === 'seek_comfort' ? 'comforted'
          : want.id === 'warn_you' ? 'heeded'
          : want.id === 'repay' ? 'repaid' : 'engaged';
      }
    },

    // convoWantMenu: the live want's options — engage or deflect it, plus
    // honest follow-through once engaged. Consulted by the menu builder;
    // the want's options lead whenever the conversation is on the want.
    // Returns [] when no want is live, the want is resolved, a question
    // hangs (answers come first), or the player moved to another thread.
    convoWantMenu(vid) {
      const c = this.convoGet(vid);
      const w = c && c.want;
      if (!w || !w.def || (w.stage || 0) === 0 || (w.stage || 0) >= 3) return [];
      if (c.pendingQ || c.reactiveQ || c.genericQ) return [];
      // Thread coherence: mid another topic thread, the want waits — it
      // doesn't hijack the subject you chose. It'll resurface as a seed.
      if (c.thread && c.thread !== 'want' && c.thread !== 'small') return [];
      let opts = [];
      try { opts = w.def.menuOptions.call(this, vid, w.stage || 1) || []; } catch (e) { opts = []; }
      const out = [];
      const seen = {};
      for (const o of opts) {
        if (!o || !o.id || seen[o.id]) continue;
        seen[o.id] = true;
        const labels = o.labels && o.labels.length ? o.labels : [o.id];
        const label = (typeof this.convoPickCycle === 'function')
          ? (this.convoPickCycle(vid, 'wantmenu:' + w.id + ':' + (w.stage || 1) + ':' + o.id, labels) || labels[0])
          : labels[Math.floor(Math.random() * labels.length)];
        out.push({ id: o.id, label, temper: o.temper || 'neutral' });
      }
      // MORE-EXHAUSTION (journey deepening r4 2026-10-12): "tell me more" is
      // offered only while the want has more to say. Multi-beat wants (like
      // share_news) define moreAvailable; single-beat wants default to
      // "not yet engaged" — the fixed beat must not repeat verbatim. Without
      // this, the menu loops the dry admission and the 3-line dry pool cycles.
      let moreOpen = (w.stage || 0) < 2;
      try {
        if (w.def && typeof w.def.moreAvailable === 'function') {
          moreOpen = !!w.def.moreAvailable.call(this, vid);
        }
      } catch (e) {}
      return moreOpen ? out : out.filter(o => o && o.id !== 'dlg:more');
    },

    // convoWantCloseLine: the goodbye beat for how the want ended — the
    // ending names the resolution, so conversations resolve/plant/owe
    // instead of evaporating.
    convoWantCloseLine(vid) {
      const c = this.convoGet(vid);
      const w = c && c.want;
      if (!w || !w.def) return null;
      try {
        let res = w.resolution;
        if (!res && typeof w.def.defaultResolution === 'function') {
          try { res = w.def.defaultResolution.call(this, vid, w, 'closed'); } catch (e) {}
        }
        const l = w.def.closeLine.call(this, vid, res || (w.stage >= 2 ? 'engaged' : 'unresolved'));
        return l || null;
      } catch (e) { return null; }
    },

    // convoWantNews: the actual news behind a share_news want. REAL content —
    // a fresh memory, real gossip, a live village event, or an honest
    // observation. Never a shrug.
    // (journey establishment 2026-10-11, three structural fixes:
    //  1. NEWS-TYPE FRESHNESS: every "tell me more" used to re-roll the
    //     same gossip template (three "Turns out they weren't a what they
    //     said" beats in one conversation). Delivered types are recorded
    //     on the want; a type never repeats inside one conversation, and
    //     when every type is spent the thread exhausts honestly instead of
    //     looping (canon: CONVERSATIONS.md).
    //  2. HOOK PROMISE: the opener's hook ("what I saw by the treeline") is
    //     kept on the want, and the first delivery answers it — the hook
    //     no longer fizzles into unrelated gossip. The "something happened
    //     this morning" hook prefers fresh memories and live events.
    //  3. GOSSIP GRAMMAR: "weren't a what they said" -> "weren't what they
    //     said" when no lie is known; a/an agreement ("an ER nurse");
    //     occupations lowercased mid-sentence ("a veterinarian").)
    convoWantNews(vid) {
      const c = this.convoGet(vid) || {};
      const w = c.want || {};
      w.newsGiven = w.newsGiven || [];
      const given = (t) => w.newsGiven.indexOf(t) >= 0;
      const mark = (t) => { if (!given(t)) w.newsGiven.push(t); };
      const hook = w.hook || null;

      const memNews = () => {
        try {
          const mem = (((this.state.village || {}).memory || {})[vid]) || [];
          const day = (this.state.scholar || {}).day || 0;
          for (let i = mem.length - 1; i >= 0; i--) {
            const m = mem[i];
            if (!m || day - (m.day || 0) > 7) continue;
            const about = this.convoMemoryAbout ? this.convoMemoryAbout(m.t) : null;
            if (about) {
              const line = this.convoPickCycle(vid, 'want:news:mem', [
                `"So — ${about}. Did you hear? I can't stop thinking about it."`,
                `"Have you been thinking about ${about}? Because I have. A lot."`,
              ]);
              if (line) { mark('memory'); return line; }
            }
          }
        } catch (e) {}
        return null;
      };
      const eventNews = () => {
        try {
          const ev = this.t2LatelyEvent ? this.t2LatelyEvent(vid) : null;
          if (ev && ev.kind) {
            // MANTLE MEMORY (journey crisis r4 2026-10-12): name the dead —
            // "everyone's thinking about them" with no name read as filler
            // next to the lately-topic lines that do name them.
            if (ev.kind === 'mourning' && ev.name) {
              mark('event');
              return `"Nobody's saying it out loud, but everyone's thinking about ${ev.name}. The quiet ones worst."`;
            }
            // OUTBREAK (journey crisis r8 2026-10-14): the sick row is news —
            // symptom-gated (ev.desc), never the disease name.
            if (ev.kind === 'outbreak' && ev.desc) {
              mark('event');
              return `"${ev.n || 'Several'} of us are down with ${ev.desc}. Boil the water twice — I'm telling everyone."`;
            }
            // TABLE (journey endgame r11 2026-10-14; ported 2026-10-15): the
            // table is the village's news while it waits, sits, or has just
            // been answered — phase-aware, knowledge-gated (what they see,
            // never the path mechanics).
            if (ev.kind === 'table') {
              mark('event');
              const ph = ev.phase || 'sitting';
              if (ph === 'waiting') return '"Word is the table\'s coming. For us. Nobody wants to say it first, so I will."';
              if (ph === 'deferred') return '"Ninety dawns, it said. It\'ll keep its word. The table will still be here."';
              if (ph === 'done') return '"You answered it. Whatever happened up there — the whole village saw. We\'re still turning it over."';
              return '"It\'s here. The table. Seven doors. Nobody\'s talking about anything else at the fire."';
            }
            const EV_NEWS = {
              naming: '"There\'s a real argument going about what to call that thing. People are heated."',
              mourning: '"Nobody\'s saying it out loud, but everyone\'s thinking about them. The quiet ones worst."',
              threat: '"Something\'s been moving out past the treeline. I\'m not the only one who\'s seen it."',
              betrayal: '"Something happened between people. I don\'t have the whole of it yet."',
              tension: '"You feel it too, right? The air around the fire. Something\'s building."',
              hunger: '"People are going hungry and nobody wants to say it first. So I\'m saying it."',
            };
            if (EV_NEWS[ev.kind]) { mark('event'); return EV_NEWS[ev.kind]; }
          }
        } catch (e) {}
        return null;
      };
      const gossipNews = () => {
        try {
          const roster = ((this.state.village || {}).roster || []).filter(id => id !== vid && id !== this.villagerId);
          for (let i = 0; i < 3 && roster.length; i++) {
            const target = roster[Math.floor(Math.random() * roster.length)];
            const g = this.npcGossipAbout ? this.npcGossipAbout(vid, target) : null;
            if (g && g.truth) {
              const nm = this.displayName ? this.displayName(target) : 'someone';
              mark('gossip');
              // r9: prefer the gossip's own rendered line. truth.js and the
              // knack fallback both build complete fiction in g.line;
              // gossipLine only knows 'occupation' and renders every other
              // field — e.g. 'knack' — through the origin template, leaking
              // raw ids ("they're from beast_calm"). Strip one outer quote
              // pair so the quoted fiction reads as spoken gossip.
              let body = g.line;
              if (typeof body === 'string' && body.length > 1 && body[0] === '"' && body[body.length - 1] === '"') body = body.slice(1, -1);
              if (!body) {
                // r33: the occupation/origin fallback never names the
                // subject ("Turns out they weren't a surgeon...") — the
                // ${nm} prefix carries the who. But truth.js and knack
                // gossip lines already name them ({first} interpolations),
                // so the prefix doubles the subject ("A man, maybe 40s...
                // the man in his 40s... ate something"). Prefix only the
                // fallback; serve complete lines as-is.
                body = gossipLine(g);
                return `"Okay, so — ${nm}. ${body} Don't say I told you."`;
              }
              return `"Okay, so — ${body} Don't say I told you."`;
            }
          }
        } catch (e) {}
        return null;
      };
      const observeNews = () => {
        try {
          const vg = this.state.village || {};
          const hungry = (vg.roster || []).filter(id => { try { return this.npcNeeds(id).hunger > 70; } catch (e) { return false; } }).length;
          if (hungry >= 2) { mark('observation'); return `"${hungry} people are going hungry and acting like it's fine. It's not fine."`; }
          if ((vg.grief || 0) > 0) { mark('observation'); return '"It\'s too quiet. That\'s the news — it\'s too quiet and everyone knows why."'; }
          if ((vg.cheer || 0) > 0) { mark('observation'); return '"People are smiling today. I wanted someone to notice it with me."'; }
        } catch (e) {}
        return null;
      };
      const sightingNews = () => {
        mark('sighting');
        return '"The treeline, this morning — something moved out there, big. By the time I looked properly it was gone. But I saw it."';
      };

      // 0. The hook's promise comes first — answer what the opener offered.
      if (hook === 'treeline' && !given('sighting')) return sightingNews();

      // The "something happened this morning" hook wants fresh happenings,
      // not gossip: memories and live events answer it.
      const morningFirst = (hook === 'morning');
      const order = morningFirst
        ? ['memory', 'event', 'gossip', 'observation', 'sighting']
        : ['memory', 'gossip', 'event', 'observation', 'sighting'];
      const fns = { memory: memNews, event: eventNews, gossip: gossipNews, observation: observeNews, sighting: sightingNews };
      for (const t of order) {
        if (given(t)) continue;
        const line = fns[t]();
        if (line) return line;
        // Source dry but type unmarked (e.g. gossip found no target):
        // don't mark — another type may still deliver, and this one can
        // be retried only if nothing else works... no: mark it spent so a
        // dry source can't wedge the loop into repeating the same dry roll.
        mark(t);
      }
      // Every type spent or dry: exhaust honestly instead of looping.
      // MORE-EXHAUSTION (journey deepening r4 2026-10-12): mark it — the menu
      // retires "tell me more" once the news is spent (convoWantMenu reads
      // this via the want's moreAvailable). Without the mark, the menu keeps
      // offering "more" and the dry pool cycles verbatim.
      w.newsExhausted = true;
      return '"That\'s everything I\'ve got. You know as much as I do now."';
    },

    // convoWantWarning: the actual warning behind a warn_you want. Real
    // content — recent attacks, monster knowledge, or an honest caution.
    convoWantWarning(vid) {
      try {
        const vg = this.state.village || {};
        if ((vg.recentAttacks || 0) > 0) {
          return '"Whatever came through here last night — it\'ll come back. They always come back. Don\'t go out alone."';
        }
        const codex = this.state.codex || {};
        const mids = Object.keys(codex.monsters || {});
        if (mids.length) {
          return '"You\'ve seen what\'s out there. I\'m just saying — the treeline at dusk. Don\'t."';
        }
      } catch (e) {}
      return '"I don\'t know what\'s moving out there, but something is. Keep your eyes up past the treeline."';
    },

    // convoPickUnaskedQuestion: a bespoke question they can genuinely ask
    // you — unanswered, time/trust/mood-gated. For the curious want.
    convoPickUnaskedQuestion(vid) {
      const cg = (this.data.characterGen || {}).convo || {};
      const c = this.convoGet(vid);
      const trust = ((this.state.village || {}).trust || {})[vid] || 10;
      let moodNow = null;
      try { moodNow = this.npcMood ? this.npcMood(vid) : null; } catch (e) {}
      const qok = (q) => {
        try { return this.convoQuestionOk ? this.convoQuestionOk(q, trust, moodNow, vid) : true; }
        catch (e) { return true; }
      };
      let askedAny = [];
      try { askedAny = this.villageAskedQs ? this.villageAskedQs() : []; } catch (e) {}
      const pool = (cg.questions || []).filter(q =>
        (c.askedQs || []).indexOf(q.id) === -1 && askedAny.indexOf(q.id) === -1 && qok(q));
      if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
      // VILLAGE-WIDE POOL EXHAUSTED (convo gaps 2026-10-11): with 36
      // questions and village-wide dedup, a busy village drains the shared
      // pool — then no low-trust stranger can ever ask anything. Fall back
      // to per-villager-unasked: a small camp circles back to the same
      // worries, and hearing a repeat from a different villager beats a
      // stranger with no questions at all. (Mirrors the fallback the
      // mid-conversation question path already had.)
      const perVillager = (cg.questions || []).filter(q =>
        (c.askedQs || []).indexOf(q.id) === -1 && qok(q));
      if (!perVillager.length) return null;
      return perVillager[Math.floor(Math.random() * perVillager.length)];
    },

    // convoHangWantQuestion: the curious want hangs its bespoke question as
    // pendingQ — the menu answers it; answers come first, pivots wait.
    convoHangWantQuestion(vid) {
      const c = this.convoGet(vid);
      if (c.pendingQ || c.reactiveQ || c.genericQ) return null;
      const qd = this.convoPickUnaskedQuestion(vid);
      if (!qd) return null;
      c.pendingQ = { id: qd.id, answers: qd.answers || [] };
      c.pendingQDodges = 0;
      c.qCount = (c.qCount || 0) + 1;
      if ((c.askedQs || []).indexOf(qd.id) === -1) c.askedQs.push(qd.id);
      try { if (this.noteAskedQ) this.noteAskedQ(qd.id); } catch (e) {}
      // WANT-QUESTION IDENTITY (journey social r14): the want's question id,
      // so thread labels can name the actual question even after it's
      // answered (open-thread ledger, recap lines) — never 'that question'.
      try { if (c.want) c.want.qid = qd.id; } catch (e) {}
      return qd;
    },

    // convoComposeBeat: THE NON-SEQUITUR FIX.
    // Every NPC beat goes through here BEFORE emission. It takes the raw
    // beat and the player's last utterance, and ensures the beat
    // acknowledges what the player said before delivering new content.
    // (Now called at beat-selection time, not as a post-turn patch — the
    // transcript holds the composed line and the no-repeat ledger sees it.)
    convoComposeBeat(vid, rawBeat, playerSaid) {
      if (!rawBeat) return rawBeat;
      if (!playerSaid || !playerSaid.label) return rawBeat;
      if (playerSaid.isAnswer) return rawBeat;
      const label = String(playerSaid.label).toLowerCase();
      let ack = null;
      if (/tell me more|go on|more/i.test(playerSaid.label)) {
        return rawBeat;
      }
      if (playerSaid.topic) {
        const topicAcks = [
          '"Good question." ',
          '"Huh. Let me think about that." ',
          '"You want to know about that? Okay." ',
        ];
        ack = topicAcks[Math.floor(Math.random() * topicAcks.length)];
      } else if (/you|your/i.test(label) && label.length < 60) {
        ack = '"Me? Okay." ';
      }
      if (!ack) return rawBeat;
      try {
        return String(this.voiceLine ? this.voiceLine(vid, ack) : ack).replace(/\s+$/, '') + ' ' + rawBeat;
      } catch (e) {
        return String(ack).replace(/\s+$/, '') + ' ' + rawBeat;
      }
    },

    // convoPlantSeed: record unfinished business for next conversation.
    convoPlantSeed(vid, seed) {
      if (!seed || !seed.wantId) return;
      const v = this.state.village;
      v.convoSeeds = v.convoSeeds || {};
      v.convoSeeds[vid] = {
        wantId: seed.wantId,
        note: seed.note || '',
        day: this.state.scholar.day || 0,
        favorId: seed.favorId || null,
        // CURIOUS QUESTION RESUME (journey social r14 2026-10-14): the
        // hanging bespoke question's id, so the next conversation re-hangs
        // THE SAME question instead of a fresh pick.
        qid: seed.qid || null,
      };
    },

    // convoCheckSeeds: is there unfinished business with this NPC?
    // Returns the seed or null. Seeds expire after 7 days.
    convoCheckSeeds(vid) {
      const v = this.state.village;
      const seed = (v.convoSeeds || {})[vid];
      if (!seed) return null;
      const now = this.state.scholar.day || 0;
      if (now - (seed.day || 0) > 7) {
        delete v.convoSeeds[vid];
        return null;
      }
      return seed;
    },

    // convoQuestionTopic(qid): the noun phrase an NPC uses to refer back to
    // a bespoke question they asked ("About <phrase> — <question>"). Plain
    // voice, never the menu-question text — same register as the t2speech
    // map (journey social r13). Unknown/null ids fall back to the old
    // generic 'that question' rather than inventing a label.
    // (journey social r14 2026-10-14)
    convoQuestionTopic(qid) {
      return (qid && QUESTION_TOPIC[qid]) || 'that question';
    },

    // convoQuestionDef(qid): the bespoke question def by id (characterGen
    // convo questions), for re-hanging a seed-resumed question.
    // (journey social r14 2026-10-14)
    convoQuestionDef(qid) {
      try {
        const cg = (this.data.characterGen || {}).convo || {};
        return (cg.questions || []).find(q => q && q.id === qid) || null;
      } catch (e) { return null; }
    },

    // convoResolveWant: called from base endConvo BEFORE state clears.
    // The ending is resolved, planted, or owed — never evaporated.
    convoResolveWant(vid, how) {
      const c = this.convoGet(vid);
      if (!c.want || !c.want.def) return;
      const want = c.want;
      // PHANTOM SEEDS (dialogue rethink, Steve 2026-10-07): a want that never
      // surfaced (stage 0) was never established — planting a seed for it
      // makes the next conversation reference unfinished business the player
      // never heard. Unfinished business must be established to be unfinished.
      if ((want.stage || 0) < 1) {
        want.stage = 3;
        want.resolution = 'unestablished';
        if (want.fromSeed) {
          try { delete this.state.village.convoSeeds[vid]; } catch (e) {}
        }
        // SETTLE-ON-SPEAK (journey-succession r28 2026-10-19): the want's
        // opener computed a favor settle (fulfilled->'thanked') but the
        // no-repeat ledger blocked the line, so the want never surfaced.
        // The thanks is still owed — replant the repay seed rather than
        // dropping it silently. (The phantom-seed rule stands: only a
        // recorded pending settle replants, never an unestablished want.)
        try {
          const rs = favorSettleReplant(vid);
          if (rs) this.convoPlantSeed(vid, rs);
        } catch (e) {}
        return;
      }
      // RESOLUTION HONESTY (convo favor system 2026-10-11): a want def may
      // supply defaultResolution(vid, want, how) to name what "heard but not
      // committed" means for it. ask_favor returns 'stated' — the old blind
      // default ('engaged' for any stage>=2) recorded commitment that never
      // happened (the false-engagement lie).
      let resolution = want.resolution;
      if (!resolution && want.def && typeof want.def.defaultResolution === 'function') {
        try { resolution = want.def.defaultResolution.call(this, vid, want, how); } catch (e) {}
      }
      if (!resolution) {
        resolution = want.stage >= 2 ? 'engaged' : (how === 'left' ? 'abandoned' : 'unresolved');
      }
      want.stage = 3;
      want.resolution = resolution;
      // CONSUME BEFORE PLANT (socialite 2026-10-11): the old seed was this
      // conversation's unfinished business — now resolved. It must be
      // deleted BEFORE the def plants its follow-up seed: the old order
      // (plant, then delete-if-fromSeed) destroyed the new seed unconditionally,
      // so promised favors never got their 'repay' follow-up. No def's
      // resolve() reads the live seed, so the reorder is safe.
      if (want.fromSeed) {
        try { delete this.state.village.convoSeeds[vid]; } catch (e) {}
      }
      let seed = null;
      try {
        // 'how' is passed so defs can distinguish a walked-away-from
        // conversation ('left') from a natural close — unfinished business
        // is planted, finished business isn't. (convo rebuild 2026-10-11)
        seed = want.def.resolve.call(this, vid, resolution, how);
      } catch (e) {}
      if (seed) this.convoPlantSeed(vid, seed);
    },

    // convoWant: the dialogue layer's read of the current want (id string).
    convoWant(vid) {
      try { const c = this.convoGet(vid); return (c.want && c.want.id) || null; }
      catch (e) { return null; }
    },
  };

  Object.assign(Game, methods);

  // convoPlayerSaid: reconstruct what the player just said from the choiceId.
  Game.convoPlayerSaid = function (vid, choiceId) {
    try {
      if (choiceId.indexOf('ask:') === 0) {
        const topic = choiceId.slice(4);
        return { label: 'ask:' + topic, topic, isAnswer: false };
      }
      if (choiceId.indexOf('ans:') === 0 || choiceId.indexOf('react:') === 0 ||
          choiceId.indexOf('gq:') === 0) {
        return { label: choiceId, isAnswer: true };
      }
      if (choiceId.indexOf('follow:') === 0) {
        const parts = choiceId.split(':');
        return { label: 'follow:' + parts[1], topic: parts[1], isAnswer: false };
      }
      return { label: choiceId, isAnswer: false };
    } catch (e) { return null; }
  };

})();
