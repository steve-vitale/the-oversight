// @ontology
// system: convo-wants
// description: Want-driven conversation architecture. Every conversation selects one NPC want in the CORE flow (startConvo); the want shapes the opening beats, the menu answers it, and the ending resolves it. No wrapper layers — the core flow calls this module.
// provides:
//   - convoSelectWant(vid) -> want object
//   - convoWantOpener(vid, want) -> {line, thread}
//   - convoWantEngage(vid, kind) -> state transition ('engage'|'deflect'|'commit')
//   - convoWantMenu(vid) -> menu options for the live want
//   - convoWantCloseLine(vid) -> goodbye beat for the resolution
//   - convoResolveWant(vid, how) -> plants seeds for unfinished business
//   - convoPlantSeed(vid, seed) / convoCheckSeeds(vid)
//   - convoWantNews(vid) / convoWantWarning(vid) -> real content beats
// rules:
//   - want_driven: every conversation selects one NPC want at start; the want shapes the opening and provides beats (code: convoSelectWant, Steve 2026-10-06)
//   - no_polite_queue: the want surfaces in the opening beats, never queued behind a continuer (code: startConvo, Steve 2026-10-11)
//   - strangers_want: trust tier never gates want depth — a stranger opens with something they want (code: convoSelectWant, Steve 2026-10-11, overrides Principle 12)
//   - beat_acknowledgment: NPC beats must acknowledge the player's last utterance before delivering new content — no non-sequiturs (code: convoComposeBeat, Steve 2026-10-06)
//   - seeds: unresolved wants plant seeds; next conversation opens with the seed (code: convoPlantSeed/convoCheckSeeds, Steve 2026-10-06)
//   - arc: want stages 0 (selected) -> 1 (surfaced) -> 2 (engaged) -> 3 (resolved); endings record the resolution (code: convoWantEngage/convoResolveWant, Steve 2026-10-06)
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
        const line = `"` + openers[hh % 3] + ' ' + details[(hh >>> 2) % 3] + ' ' + anchors[(hh >>> 4) % 2] + `"`;
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
        const whyLine = whyBits[(hh >>> 1) % 3] + ' ' + whyTails[(hh >>> 5) % 3];
        return {
          task: `share food with ${ctx.name} \u2014 they're ${hungerWord}`,
          short: 'the food they needed',
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
          `"The cistern's nearly dry \u2014 ${liters} liters left."`,
          `"We're down to ${liters} liters of clean water."`,
          `"Water's almost gone \u2014 ${liters} liters."`,
        ];
        const asks = [
          `I need someone to haul water with me at first light. Two of us, half the trips. Will you come?`,
          `Haul the creek with me at dawn? Two buckets each, there and back.`,
          `I can't carry enough alone. First light, the creek, you and me?`,
        ];
        const line = openers[hh % 3] + ' ' + asks[(hh >>> 2) % 3];
        const whyBits = [
          `"${liters} liters. That's today's drinking water, and then we're boiling creek water and hoping."`,
          `"Do the math with me: ${liters} liters, ${ctx.rosterN} people. That's not tomorrow's water."`,
          `"I checked the cistern three times hoping I misread it. ${liters} liters."`,
        ];
        const whyLine = whyBits[(hh >>> 1) % 3] + ` The creek's a twenty-minute walk \u2014 with two of us it's one trip, not three.`;
        return {
          task: `haul water from the creek at first light with ${ctx.name}`,
          short: 'the creek water run',
          line, whyLine,
          commitLine: `"Dawn, then. Bring something to carry \u2014 and thank you."`,
          goodbye: `"First light. Don't sleep through it."`,
          stakes: `The village runs out of clean water tomorrow.`,
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
      keepKind: 'social', goal: 'belong', deadlineDays: 1,
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
          short: 'their injury',
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
          `can you do anything?`,
          `I need help. Please.`,
        ];
        const line = '"' + openers[hh % 3] + ' ' + states[(hh >>> 2) % 3] + ' ' + asks[(hh >>> 4) % 3] + '"';
        const whyLine = `"Rest and clean water aren't cutting it. If this turns, I'm no good to anyone \u2014 can't haul, can't hunt, can't watch. I need someone who knows what they're doing."`;
        return {
          task: `help ${ctx.name} with their sickness \u2014 they're ${sym}`,
          short: 'the sickness they\'re fighting',
          line, whyLine,
          commitLine: `"Thank you. Whatever you can do \u2014 thank you."`,
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
        const states = [
          `The pantry's nearly bare.`,
          `We're eating through stores faster than we replace them.`,
          `Pantry's thin and getting thinner.`,
        ];
        const asks = [
          `Will you forage with me tomorrow? Two pairs of eyes, twice the ground.`,
          `Forage with me tomorrow? I know the east treeline.`,
          `Come forage with me tomorrow \u2014 two of us can fill packs.`,
        ];
        const line = '"' + states[hh % 3] + ' ' + asks[(hh >>> 2) % 3] + '"';
        return {
          task: `forage with ${ctx.name} tomorrow to rebuild the pantry`,
          short: 'the pantry run',
          line,
          whyLine: `"Another day like today and we're choosing who eats. I know the east treeline \u2014 come with me and we'll fill packs before dark."`,
          commitLine: `"Good. East treeline, first light. Bring a pack."`,
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
      const art = /^[aeiouAEIOU]/.test(truth) ? 'an' : 'a';
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
        return '"Oh. Right. Never mind — it\'s probably nothing." They look a little deflated.';
      },
      menuOptions(vid, stage) {
        return [
          { id: 'dlg:more', labels: ['"Tell me more."', '"What happened?"', '"Go on."'], temper: 'neutral' },
          { id: 'dlg:react', labels: ['"Huh."', '"No kidding."', '"I see."'], temper: 'neutral' },
        ];
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
        // Bearer <redacted> it, naming the predecessor, never pretending the
        // ask is new. Same need kind required; a changed need is a new ask
        // (the old favor goes moot, the follow-up says so honestly).
        try {
          const oldF = this.convoGetFavor(vid);
          const predO = oldF && oldF.state === 'asked' && typeof this.inheritedName === 'function'
            ? this.inheritedName(oldF) : null;
          if (predO && oldF.kind === need.kind && this.convoFavorNeedLive(oldF)) {
            if (c.want) c.want.favor = oldF;
            return this.convoFavorFollowup(vid, oldF);
          }
          if (predO && oldF && oldF.kind !== need.kind) { try { oldF.state = 'moot'; } catch (e2) {} }
        } catch (e) {}
        const favor = this.convoBuildFavor(vid, need);
        if (!favor) return null;
        if (c.want) c.want.favor = favor;
        this.convoStoreFavor(favor);
        return favor.line;
      },
      engageBeat(vid) {
        // "How can I help?" — the ask was stated in the opener. This DEEPENS
        // with the why and stakes: new content, never the ask repeated.
        // (The old pool re-stated the ask — the verbatim-repeat vector.)
        const c = this.convoGet(vid);
        const favor = (c.want && c.want.favor) || this.convoGetFavor(vid);
        if (favor) return favor.whyLine;
        return null; // no favor stated — the NO HOLLOW FALLBACK answers honestly
      },
      deflectBeat(vid) {
        return '"No, yeah, of course. Forget I asked." They won\'t forget. They\'ll just stop asking.';
      },
      commitBeat(vid) {
        const c = this.convoGet(vid);
        const favor = (c.want && c.want.favor) || this.convoGetFavor(vid);
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
      resolve(vid, resolution) {
        const c = this.convoGet(vid);
        const favor = (c.want && c.want.favor) || this.convoGetFavor(vid);
        // Settled acknowledgments (fulfilled/broken/moot follow-ups) plant
        // nothing — the business is closed.
        if (favor && (favor.state === 'thanked' || favor.state === 'acknowledged' || favor.state === 'moot')) {
          return null;
        }
        if (resolution === 'promised') {
          // The obligation was created at commit time and is tracked. The
          // follow-up references it — a reminder, not a new ask.
          if (favor) return { wantId: 'repay', note: favor.short + ' you promised', favorId: favor.id };
          return { wantId: 'repay', note: 'what you promised' };
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
        // Obligation still open — a reminder naming the task, not a new ask.
        if (open && open.favorTask && favor && favor.id === open.favorId) {
          if (c.want) c.want.favor = favor;
          return `"About ${favor.short} — have you had a chance? ${this.convoFavorDeadlineNote(favor)}"`;
        }
        if (favor && favor.state === 'fulfilled') {
          if (c.want) c.want.favor = favor;
          favor.state = 'thanked';
          return `"You came through on ${favor.short}. I won't forget it."`;
        }
        if (favor && favor.state === 'broken') {
          if (c.want) c.want.favor = favor;
          favor.state = 'acknowledged';
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
        return '"Right. Forget it." They won\'t forget. Debts unpaid just sit there.';
      },
      menuOptions(vid, stage) {
        const open = this.openFavorObligation(vid);
        if (open && open.favorTask) {
          // The promise is OPEN — "we're square" would be a lie. Honest
          // options: reaffirm it, or back out (which breaks it now, with
          // the cost — dlg:renounce).
          return [
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
      resolve(vid, resolution) {
        // Still open — they still remember. Otherwise the business is
        // closed: fulfilled, broken, or renounced all consume the seed.
        const open = this.openFavorObligation(vid);
        if (open && open.favorTask) {
          const favor = this.convoGetFavor(vid);
          return { wantId: 'repay', note: ((favor && favor.short) || 'the promise') + ' you made', favorId: favor && favor.id };
        }
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
        return Game.convoPickCycle(vid, 'want:comfort:open', [
          '"Do you ever — no. Never mind." They don\'t look away, though. They want you to ask.',
          '"I\'m not okay. I\'m saying it out loud so it\'s real: I\'m not okay."',
        ]);
      },
      engageBeat(vid) {
        return Game.convoPickCycle(vid, 'want:comfort:engage', [
          '"It helps. Just — saying it out loud to someone who\'s actually listening. It helps."',
          '"I keep going over it. Having someone here... it slows the spiral."',
        ]) || '"It helps. Just — saying it out loud. It helps."';
      },
      deflectBeat(vid) {
        return '"Right. Sorry. I\'m fine." They are very obviously not fine.';
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
        return '"...Suit yourself. Don\'t say I didn\'t try."';
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
        const q = (typeof Game.convoHangWantQuestion === 'function') ? Game.convoHangWantQuestion(vid) : null;
        if (q && q.q) return q.q;
        return null; // no unasked question left — the want can't open
      },
      engageBeat(vid) {
        return '"Huh. I wouldn\'t have guessed that about you."';
      },
      deflectBeat(vid) {
        return '"Fair enough. Some things aren\'t for sharing."';
      },
      menuOptions(vid, stage) { return []; }, // the question's answers ARE the menu
      closeLine(vid, resolution) {
        if (resolution === 'engaged') return '"Good talk. I feel like I know you a little better now."';
        return null;
      },
      // A walked-away-from question hangs: the curiosity plants a seed so
      // the next conversation resumes it instead of evaporating. A natural
      // close after answering plants nothing — the question was answered.
      // (convo rebuild 2026-10-11: trust proof caught curious never seeding.)
      resolve(vid, resolution, how) {
        if (how === 'left' && resolution !== 'deflected' && resolution !== 'unestablished')
          return { wantId: 'curious', note: 'that question' };
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
          if ((c.takenWantDay || 0) >= day - 3) return 0;
          if (!this.takenKinOf || !this.takenKinOf(vid).length) return 0;
          return 2;
        } catch (e) { return 0; }
      },
      opener(vid) {
        try { this.convoGet(vid).takenWantDay = (Game.state.scholar || {}).day || 0; } catch (e) {}
        const kin = (this.takenKinOf(vid) || [])[0] || {};
        const first = (kin.name || 'them').split(' ')[0];
        return Game.convoPickCycle(vid, 'want:taken:open', [
          '"Have you heard anything? About the taken. The pods. Anything at all."',
          `"You talk to it -- the System. Have you ever asked? About ${first}?"`,
          '"I keep dreaming about rows of pods. Humming. Tell me I\'m not the only one."',
        ]);
      },
      engageBeat(vid) {
        const kin = (this.takenKinOf(vid) || [])[0] || {};
        const first = (kin.name || 'they').split(' ')[0];
        const rel = kin.relation || 'kin';
        const fate = String(kin.fate || 'went up in the Taking');
        const cap = fate.charAt(0).toUpperCase() + fate.slice(1);
        return `"It's my ${rel}, ${first}. ${cap}. Some nights I dream about the pods -- rows of them, humming. I wake up and I can't tell if it was a dream or a broadcast."`;
      },
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
        // Acute personal needs first — the body doesn't wait.
        if ((n.hunger || 0) > 70) need = { kind: 'food_share', urgency: 4, hunger: n.hunger };
        else if (health != null && health < 60) need = { kind: 'heal_help', urgency: 4, health };
        // SICKNESS (crisis leg 2026-10-11): a sick villager's body is the
        // emergency — the want system had no disease need, so the sick
        // talked about anything BUT being sick (sense-tested: a gutrot
        // sufferer opened with small talk and never mentioned it).
        // Mundane v.sick records only — alien quirks are never cured by
        // earthly help, so no promise the engine can't keep (canon:
        // docs/DISEASES.md, two pools never mix).
        else if ((((v.sick || {})[vid] || {}).daysLeft || 0) > 0) need = { kind: 'sick_help', urgency: 4, sickName: ((v.sick || {})[vid] || {}).name || 'sick' };
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

    // convoFavorHash: per-instance variation key. Hashes (vid, day, seq) so
    // the same NPC on different days — or different NPCs — don't get the
    // same slot combination. Not cryptographic, just well-distributed.
    convoFavorHash(vid, ctx) {
      const s = String(vid) + '|' + (ctx.day || 0) + '|' + (ctx.seq || 0);
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      }
      return h >>> 0;
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
        commitLine: parts.commitLine || '"Thank you. Seriously — thank you."',
        goodbye: parts.goodbye || '"Thank you."',
        deadline: day + (def.deadlineDays || 2),
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
      const v = this.state.village || {};
      v.promises = v.promises || {};
      const day = (this.state.scholar || {}).day || 0;
      const oldP = v.promises[vid];
      if (oldP && !oldP.kept) return { ok: false, blocked: true };
      if (oldP) delete v.promises[vid];
      v.promises[vid] = {
        goal: favor.goal, day: day, kept: false,
        favorId: favor.id, favorTask: favor.task, favorDeadline: favor.deadline,
      };
      favor.state = 'promised';
      favor.promisedDay = day;
      try { this.remember(vid, 'promise', 'promised: ' + favor.task); } catch (e) {}
      try { this.journalLearn(vid, 'promise', { text: favor.task }, {}); } catch (e) {}
      try { this.notePlaystyle('social'); } catch (e) {}
      return { ok: true };
    },

    // convoFavorRenounce: backing out of an open favor obligation — it breaks
    // NOW, with the cost, honestly. Not a silent rot.
    convoFavorRenounce(vid) {
      const v = this.state.village || {};
      const p = (v.promises || {})[vid];
      if (!p || p.kept || !p.favorId) return false;
      p.kept = 'broken';
      const favor = this.convoGetFavor(vid);
      if (favor && favor.id === p.favorId) favor.state = 'broken';
      const t = v.trust || (v.trust = {});
      t[vid] = Math.max(0, (t[vid] || 10) - 15);
      try { this.remember(vid, 'promise_broken', p.favorTask || p.goal); } catch (e) {}
      try { this.journalLearn(vid, 'promise', { text: p.favorTask || 'a promise', status: 'broken' }, {}); } catch (e) {}
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
          case 'heal_help': return ((v.health || {})[favor.vid] || 100) < 80;
          case 'sick_help': return ((((v.sick || {})[favor.vid] || {}).daysLeft || 0) > 0);
          case 'watch_shift': return (this.npcNeeds(favor.vid).energy || 100) < 50;
          case 'stay_close': return (this.npcNeeds(favor.vid).fear || 0) > 50;
          case 'water_haul': return ((v.water || {}).clean || 0) < 15;
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
      const day = (this.state.scholar || {}).day || 0;
      const open = this.openFavorObligation(vid);
      if (favor.state === 'promised' && open) {
        const daysLeft = favor.deadline - day;
        const when = daysLeft <= 0 ? "Today's the day." : daysLeft === 1 ? 'Tomorrow, then.' : "We've got a couple days.";
        return `"About ${favor.short} — have you had a chance? ${when}"`;
      }
      if (favor.state === 'fulfilled') {
        favor.state = 'thanked';
        return `"You came through on ${favor.short}. I won't forget it."`;
      }
      if (favor.state === 'broken') {
        favor.state = 'acknowledged';
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
      const day = (this.state.scholar || {}).day || 0;
      const daysLeft = (favor.deadline || day) - day;
      if (daysLeft <= 0) return "Today's the day.";
      if (daysLeft === 1) return 'Tomorrow, then.';
      return "We've got a couple days.";
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
      const seed = this.convoCheckSeeds(vid);
      if (seed && WANTS[seed.wantId]) {
        return { id: seed.wantId, def: WANTS[seed.wantId], fromSeed: true, seedNote: seed.note, seedFavorId: seed.favorId || null };
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
      let line = null;
      try { line = want.def.opener.call(this, vid); } catch (e) { line = null; }
      if (!line) return null;
      return { line, thread: 'want', wantId: want.id };
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
      return out;
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
              return `"Okay, so — ${nm}. ${gossipLine(g)} Don't say I told you."`;
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
        try { return this.convoQuestionOk ? this.convoQuestionOk(q, trust, moodNow) : true; }
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
