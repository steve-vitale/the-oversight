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

  // ============ WANT DEFINITIONS ============
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
      pick(vid) {
        // They've seen something, heard something — bursting to tell.
        // More likely if they haven't talked in a while.
        const c = Game.convoGet(vid);
        const daysSince = (Game.state.scholar.day || 0) - (c.lastDay || 0);
        return daysSince > 2 ? 3 : 1;
      },
      opener(vid) {
        return Game.convoPickCycle(vid, 'want:news:open', [
          '"You\'ll never guess what I saw by the treeline."',
          '"Okay, so — something happened this morning."',
          '"Have you heard? No? Good, I get to tell you first."',
        ]);
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
        return { wantId: 'share_news', note: 'that news they were bursting to share' };
      },
    },
    ask_favor: {
      pick(vid) {
        // High need drives favors: hungry, scared, tired.
        try {
          const n = Game.npcNeeds(vid);
          if (n.hunger > 70 || n.fear > 70 || n.energy < 30) return 4;
        } catch (e) {}
        return 1;
      },
      opener(vid) {
        // The opener NAMES the need — the want is visible from beat one.
        try {
          const n = Game.npcNeeds(vid);
          if (n.hunger > 70) return '"I hate to ask, but — do you have anything to eat? Anything at all?"';
          if (n.fear > 70) return '"Can you — would you stay close tonight? I don\'t want to be alone when it gets dark."';
          if (n.energy < 30) return '"I\'m running on empty. Could you take my watch for a bit?"';
        } catch (e) {}
        return Game.convoPickCycle(vid, 'want:favor:open', [
          '"There\'s something I\'ve been meaning to ask you."',
          '"Could you do something for me? It\'s not big. Probably."',
        ]);
      },
      engageBeat(vid) {
        // "How can I help?" -> the concrete ask. Never "Here's the thing —"
        // looping: the favor is stated once, plainly.
        try {
          const n = Game.npcNeeds(vid);
          if (n.hunger > 70) return '"Food. Anything you can spare — I\'m running on empty."';
          if (n.fear > 70) return '"Just — stay close tonight? When it gets dark, I don\'t want to be alone."';
          if (n.energy < 30) return '"Could you take my watch for a bit? An hour. That\'s all I need."';
        } catch (e) {}
        return '"I need an extra pair of hands tomorrow. Nothing dangerous — just an extra pair of hands. Can you help?"';
      },
      deflectBeat(vid) {
        return '"No, yeah, of course. Forget I asked." They won\'t forget. They\'ll just stop asking.';
      },
      commitBeat(vid) {
        return Game.convoPickCycle(vid, 'want:favor:commit', [
          '"Thank you. Seriously — thank you. I wouldn\'t ask if it wasn\'t important."',
          '"You don\'t know what that means right now." They look away for a second. "Thank you."',
        ]) || '"Thank you. Seriously."';
      },
      menuOptions(vid, stage) {
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
        if (resolution === 'promised') return '"Thank you. Really — I won\'t forget this."';
        if (resolution === 'deflected') return '"Forget I asked. I\'ll figure it out."';
        return null;
      },
      resolve(vid, resolution) {
        if (resolution === 'promised') {
          // They owe you now — that's a seed (the dead 'repay' seed's real wantId).
          return { wantId: 'repay', note: 'the kindness they feel they owe you for' };
        }
        if (resolution === 'engaged') {
          // Favor stated, no commitment — still hanging.
          return { wantId: 'ask_favor', note: 'the help they asked you for' };
        }
        return { wantId: 'ask_favor', note: 'the help they asked you for' };
      },
    },
    // repay: they owe you one. Seed-driven only — pick() returns 0 so it
    // never surfaces spontaneously. Debts unpaid just sit there.
    repay: {
      pick(vid) { return 0; },
      opener(vid) {
        // The debt is a PROMISE, not a deed — the fiction must not claim the
        // player already did the favor (socialite 2026-10-11: the old lines
        // said "what you did for me" when the player had only said "I'll do
        // it" — fabricated shared history, Steve's conversation quality bar).
        return Game.convoPickCycle(vid, 'want:repay:open', [
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
        return [
          { id: 'dlg:react', labels: ['"We\'re square."', '"Don\'t mention it."'], temper: 'kind' },
          { id: 'dlg:cant', labels: ['"Don\'t worry about it."'], temper: 'neutral' },
        ];
      },
      closeLine(vid, resolution) { return null; },
      resolve(vid, resolution) {
        if (resolution === 'engaged') return null; // repaid, debt clear
        return { wantId: 'repay', note: 'the kindness they feel they owe you for' };
      },
    },
    seek_comfort: {
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
        return { wantId: 'seek_comfort', note: 'whatever\'s been weighing on them' };
      },
    },
    warn_you: {
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
  };

  const methods = {
    // convoSelectWant: pick the NPC's want for this conversation.
    // Priority: unresolved seeds > high needs > personality > random.
    // PRINCIPLE 12 OVERRIDE (convo rebuild 2026-10-11, Steve): trust tier
    // NEVER gates want depth. A stranger opens with something they want —
    // a question, a favor, news with a point. Small talk is the greeting,
    // never the whole conversation.
    convoSelectWant(vid) {
      const seed = this.convoCheckSeeds(vid);
      if (seed && WANTS[seed.wantId]) {
        return { id: seed.wantId, def: WANTS[seed.wantId], fromSeed: true, seedNote: seed.note };
      }
      let best = null, bestW = -1;
      for (const id of Object.keys(WANTS)) {
        const def = WANTS[id];
        let w = 0;
        try { w = def.pick.call(this, vid); } catch (e) { w = 0; }
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
        const l = w.def.closeLine.call(this, vid, w.resolution || (w.stage >= 2 ? 'engaged' : 'unresolved'));
        return l || null;
      } catch (e) { return null; }
    },

    // convoWantNews: the actual news behind a share_news want. REAL content —
    // a fresh memory, real gossip, a live village event, or an honest
    // observation. Never a shrug.
    convoWantNews(vid) {
      // 1. Fresh memories — things that happened between you.
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
            if (line) return line;
          }
        }
      } catch (e) {}
      // 2. Real gossip — something they actually know about someone.
      try {
        const roster = ((this.state.village || {}).roster || []).filter(id => id !== vid && id !== this.villagerId);
        for (let i = 0; i < 3 && roster.length; i++) {
          const target = roster[Math.floor(Math.random() * roster.length)];
          const g = this.npcGossipAbout ? this.npcGossipAbout(vid, target) : null;
          if (g && g.truth) {
            const nm = this.displayName ? this.displayName(target) : 'someone';
            return `"Okay, so — ${nm}. ${g.field === 'occupation' ? `Turns out they weren't a ${g.lie || 'what they said'} — they're a ${g.truth}.` : `They're not from ${g.lie || 'where they said'} — they're from ${g.truth}.`} Don't say I told you."`;
          }
        }
      } catch (e) {}
      // 3. Live village events.
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
          if (EV_NEWS[ev.kind]) return EV_NEWS[ev.kind];
        }
      } catch (e) {}
      // 4. Honest observation — the village as it stands right now.
      try {
        const vg = this.state.village || {};
        const hungry = (vg.roster || []).filter(id => { try { return this.npcNeeds(id).hunger > 70; } catch (e) { return false; } }).length;
        if (hungry >= 2) return `"${hungry} people are going hungry and acting like it's fine. It's not fine."`;
        if ((vg.grief || 0) > 0) return '"It\'s too quiet. That\'s the news — it\'s too quiet and everyone knows why."';
        if ((vg.cheer || 0) > 0) return '"People are smiling today. I wanted someone to notice it with me."';
      } catch (e) {}
      return '"The treeline, this morning — something moved out there, big. By the time I looked properly it was gone. But I saw it."';
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
      if (!pool.length) return null;
      return pool[Math.floor(Math.random() * pool.length)];
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
      const resolution = want.resolution ||
        (want.stage >= 2 ? 'engaged' : (how === 'left' ? 'abandoned' : 'unresolved'));
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
