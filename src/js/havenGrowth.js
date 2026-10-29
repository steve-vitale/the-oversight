// @ontology
// system: havenGrowth
// description: Haven growth milestones — the 12→24 population ladder (PROGRESSION.md §10, Steve 2026-10-10). Resource-based, System-announced, never deed-based, never calendar. Each tier visibly improves the Haven and grants real mechanics. The raid system gives the Palisade something to defend against.
// provides:
//   - havenTier()
//   - havenPopCap()
//   - havenStores()
//   - havenGrowthMeter()
//   - havenGrowthDaily()
//   - havenTierUp()
//   - announceHavenBar(tier)
//   - havenNeedGossip(next)
//   - havenRaidTick()
//   - lingeringRaiders()
//   - answerLingerer(how)
//   - lingererSortie()
//   - raidPillage(v, kcal)
//   - hearthStretch()
//   - granarySpoilBonus(foodState)
//   - famineGraceDays()
// rules:
//   - resource_based: tiers unlock on stockpile thresholds only (code: havenGrowth.js — havenGrowthDaily checks havenStores() vs HAVEN_TIERS req; no deed, calendar, or knowledge reads anywhere in the tier path)
//   - knowledge_never_gates: nothing here reads the codex (code: havenGrowth.js — havenTierUp/havenGrowthMeter reference stores only; announceHavenBar prints exact numbers)
//   - discoverable: System announces each tier bar post-arrival, Haven panel shows the live meter, villagers gossip the shortfall (code: havenGrowth.js — announceHavenBar, havenGrowthMeter + app.js havenGrowthHTML, havenNeedGossip)
//   - reactive_raids: raids fire on world state, never a schedule (code: havenGrowth.js — havenRaidTick requires 3+ world monsters, 3k+ pantry kcal, 7-day cooldown, 18% roll; wealth draws teeth: 3 raiders, +1 above 12k pantry kcal and +1 above 24k, cap 5)
//   - raid_raises_crisis: a raid raises an aid crisis reactively (the village looks to you; four call-for-help options said aloud). Raiders nobody meets LINGER at the treeline and gorge nightly (havenGrowthDaily) until driven off — the persistent threat the comms chain exists for. (code: havenRaidTick, 2026-10-10)
//   - lingerers_fought_not_rolled: wave-4/5 lingerers are answered by "Endure it" (the default — the 6-day 'moved-on' valve) or a real costly played sortie (mustered fighters, real rations, real fieldFights — villagers can die). Never a flat button/roll. (code: lingererSortie, answerLingerer; design call #8, 2026-10-16)
//   - cap_ceiling: havenPopCap is the ceiling; intake reads it via housingCap (code: havenGrowth.js — havenPopCap; membership.js — housingCap takes max(shelters, 12+4*havenTier()))
//   - no_consumption: reaching a tier does not eat the stockpile (code: havenGrowth.js — havenTierUp sets v.havenTier only; stores untouched)
// consumes:
//   - state.village.pantry, state.village.wood
//   - stashState().materials (wood, stone)
//   - pantryKcalLive(v)
//   - worldMonsters(), spawnWorldMonster(), removeWorldMonster()
//   - fieldFight(), resolveWildMonsterEncounter()
//   - progDaily() (wrapped: daily tier check + raid tick)
//   - pantryCapKcal() (wrapped: longhouse +25%)
// ============ HAVEN GROWTH — 12 → 24 ============
// Steve 2026-10-10 (PROGRESSION.md §10, settled law): the village grows
// through RESOURCE thresholds. Each tier visibly improves the Haven and
// grants new abilities; the System announces the next tier and the Haven
// shows a progress meter, so the path is unmissable. Deed-gating was
// rejected. Knowledge NEVER gates anything.
//
// Tiers (thresholds retuned 2026-10-10, survival-food pass — the 200-wood
// tier-1 bar assumed a "2 wood-duty" village banking +23/day that the
// competent policy never fields: measured peak wood p10=11/med=13/p75=15
// under maintenance staffing, so the tier-1 wood bar sits at the
// maintenance floor (12). The food bars mean "still thriving", not
// "hoarded": the starting pantry holds ~47k kcal of long-spoil staples, a
// 3-4 week buffer while strangers learn the land; 8,000 = the buffer is
// healthy. Tiers 2-3 keep stretch bars for villages that staff toward them.)
//   16 — The Longhouse: food 8,000 + wood 12. Hearth stretches meals 10%,
//        pantry capacity +25%.
//   20 — The Palisade: food 14,000 + wood 350 + stone 60. Raiders take wall
//        damage; the watch holds at night (sleep is never interrupted).
//   24 — The Granary: food 20,000 + wood 500 + preserved 2,000 kcal. Pantry
//        spoilage slows (+3d fresh, +14d preserved); famine buffer 3→5 days.
//
// Refugees/petitioners/splinter groups fill the cap through played beats —
// the villages-as-agents workstream owns that side. Its hooks: havenTier(),
// havenPopCap(), havenStores(), havenGrowthMeter(). Intake (membership.js)
// already reads growthStatus()/housingCap(), which this ladder raises.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const R = Math.random;

  // ---------- tier data ----------
  const HAVEN_TIERS = [
    null, // tier 0: Haven
    {
      tier: 1, name: 'The Longhouse', cap: 16,
      req: [
        { key: 'food', label: 'food stored', req: 8000 },
        // WOOD BAR (survival-food 2026-10-10): was 200, tuned for a phantom
        // "2 wood-duty" village that banks +23/day. Measured (40 seeds,
        // competent policy, villagerTurn-corrected): the village staffs wood
        // duty for hearth maintenance only (policy: pile < 8), so the pile
        // equilibrates at (8 + one duty yield) — peak wood p10=11, med=13,
        // p75=15 with the R(5,9) yield. No yield/burn number can reach 200
        // under that staffing; the bar must sit at the maintenance floor.
        // 12 = the pile is kept full (starts at 10, must be maintained up).
        // The MEANING of tier 1 is the food bar (8,000 = the buffer is
        // healthy); the wood bar is the "the pile isn't empty" check. Tiers
        // 2-3 (350/500 wood, stone, preserved) remain stretch goals for a
        // village that staffs toward them — out of scope for this pass.
        { key: 'wood', label: 'wood', req: 12 },
      ],
      effects: [
        'Population cap 16 — four more mouths under the roof.',
        'Longhouse hearth: village meals stretch 10% further (less food burned daily).',
        'Pantry capacity +25% — room for the bigger village.',
      ],
      sysDangle: '"The audience has SPOKEN. They want a LONGHOUSE. Stockpile 8,000 kcal of food and 12 wood and we raise it ON CAMERA. Sixteen mouths, one roof — the ratings write themselves. Try not to starve twice as fast."',
      upSys: '"LONGHOUSE: RAISED. Sixteen souls, one roof. The hearth is bigger, the meals stretch further, the pantry holds more. The audience wept. We did not. We do not weep. ...We logged it as weeping."',
      upBeat: 'Three days of raising beams, and the longhouse stands — a real roof, a real hearth, room to grow. Someone carves the date into the center post. The village feels bigger already.',
    },
    {
      tier: 2, name: 'The Palisade', cap: 20,
      req: [
        { key: 'food', label: 'food stored', req: 14000 },
        { key: 'wood', label: 'wood', req: 350 },
        { key: 'stone', label: 'stone', req: 60 },
      ],
      effects: [
        'Population cap 20 — the village is a small town now.',
        'Palisade: raiders take wall damage coming over; the watch holds at night.',
        'Safe sleep — nothing walks through the palisade to reach your bed.',
      ],
      sysDangle: '"RATINGS DIP. The audience wants STAKES — pointed ones. A PALISADE. Stockpile 14,000 kcal, 350 wood and 60 stone. Walls make such good television. You will thank us when the teeth come."',
      upSys: '"PALISADE: ONLINE. Pointy! The audience approves of pointy. Raiders will think twice — the ones that can think. Sleep easy, little ones. The walls are watching so you do not have to."',
      upBeat: 'A week of sharpened stakes and lashed crossbeams, and Haven has a wall — a real one, shoulder-high, with a walkway and a watch. The village sleeps differently tonight. Lighter.',
    },
    {
      tier: 3, name: 'The Granary', cap: 24,
      req: [
        { key: 'food', label: 'food stored', req: 20000 },
        { key: 'wood', label: 'wood', req: 500 },
        { key: 'preserved', label: 'preserved food', req: 2000 },
      ],
      effects: [
        'Population cap 24 — the full muster.',
        'Granary: cool dark bins slow spoilage (+3 days fresh, +14 days preserved).',
        'Famine buffer: sealed reserve bins hold the village 5 hungry days, not 3.',
      ],
      sysDangle: '"The long game, little hoarders. A GRANARY. Stockpile 20,000 kcal, 500 wood and 2,000 kcal of PRESERVED food — food that WAITS. Smoke it, dry it, render it. The audience finds delayed gratification EXOTIC. So do stomachs, we are told."',
      upSys: '"GRANARY: SEALED. Cool, dark, and full of waiting food. Twenty-four mouths. You are not a camp anymore. You are a going concern. The audience has already commissioned the famine episode. We told them there would not be one."',
      upBeat: 'Raised bins, sealed lids, clay and cool dark. The granary stands full of food that waits — smoked, dried, rendered, patient. Whatever comes, Haven eats a while longer.',
    },
  ];

  const methods = {
    // havenTier: 0..3. Stored on the village; exile forks reset it (hard reset).
    havenTier() {
      try { return (this.state.village || {}).havenTier || 0; } catch (e) { return 0; }
    },

    // havenPopCap: the ceiling. Intake paths read housingCap() (membership.js),
    // which takes the max of shelter-built housing and this ladder.
    havenPopCap() {
      return 12 + 4 * this.havenTier();
    },

    // havenStores: the CURRENT stockpile, honestly measured. Wood counts the
    // village pile (v.wood, what wood-duty hauls) plus stashed wood; stone
    // counts the communal stash (villager stone-duty + player stash).
    havenStores() {
      const v = this.state.village || {};
      let food = 0, preserved = 0;
      try { food = this.pantryKcalLive(v) || 0; } catch (e) {}
      try {
        for (const it of (v.pantry || [])) {
          if (it && it.foodState === 'preserved') preserved += (it.kcalEach || 0) * (it.units || 1);
        }
      } catch (e) {}
      let wood = (v.wood || 0), stone = 0;
      try {
        const st = this.stashState ? this.stashState() : null;
        const mats = st && st.materials ? st.materials : null;
        if (mats) { wood += (mats.wood || 0); stone += (mats.stone || 0); }
      } catch (e) {}
      return {
        food: Math.round(food), wood: Math.round(wood),
        stone: Math.round(stone), preserved: Math.round(preserved),
      };
    },

    // havenGrowthMeter: the visible progress meter (Haven panel renders this).
    havenGrowthMeter() {
      const tier = this.havenTier();
      const stores = this.havenStores();
      let next = null;
      if (tier < 3) {
        const T = HAVEN_TIERS[tier + 1];
        const bars = T.req.map(r => {
          const have = stores[r.key] || 0;
          return {
            key: r.key, label: r.label, have, req: r.req,
            pct: Math.min(100, Math.round((have / r.req) * 100)),
            done: have >= r.req,
          };
        });
        next = {
          tier: T.tier, name: T.name, cap: T.cap, bars,
          complete: bars.every(b => b.done), effects: T.effects,
        };
      }
      return {
        tier,
        tierName: tier === 0 ? 'Haven' : HAVEN_TIERS[tier].name,
        cap: this.havenPopCap(),
        effects: tier === 0
          ? ['A camp with a name. Twelve mouths, one fire.']
          : HAVEN_TIERS[tier].effects,
        next,
      };
    },

    // havenGrowthDaily: runs from the progDaily wrap (i.e. every endDay).
    havenGrowthDaily() {
      const v = this.state.village;
      if (!v || this.over) return;
      // LINGERING RAIDERS (util audit 2026-10-10): raiders nobody met hold
      // the treeline and gorge at each dawn until driven off (killed, or the
      // crisis goes quiet and they drift). Re-pinned to the Haven tile —
      // they're besieging, not wandering.
      try {
        const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
        const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
        const day = (this.state.scholar || {}).day || 0;
        const ms = this.worldMonsters ? this.worldMonsters() : [];
        for (const m of ms) {
          if (!m || !m.lingering || (m.hp || 0) <= 0) continue;
          m.tx = hx; m.ty = hy;
          // DRIFT (journey crisis r38 2026-10-21): the narration promises
          // lingerers drift off within ~6 nights. The crisis-based moved-on
          // valve (comms.js) only runs while a raid crisis is open — if the
          // crisis resolved early (or never raised), the promise needs its
          // own clock. Per-raider: ~6 nights of gorging, then it moves on.
          // (The clock is stamped when lingering starts and is NOT reset by
          // a fled fight — it didn't leave.)
          if (day - (m.lingerSince || day) > 6) {
            m.lingering = false;
            let mn0 = 'it';
            try { mn0 = (this.monsterDisplayName && this.monsterDisplayName(m.id)) || 'it'; } catch (e) {}
            this.say(`🌙 The lingering ${mn0} paces the treeline one last night, then melts back into the dark. The gorge is over — the village outlasted it.`);
            continue;
          }
          // TABLE SANCTITY (2026-10-12, Steve): while the table sits, the
          // raiders hold the treeline but do not gorge — the teeth can wait.
          // The crisis stays open; the player may still answer the call for
          // help themselves. Nothing automatic harms the village mid-finale.
          if (this.tableActive && this.tableActive()) continue;
          // OVERTIME (2026-10-14): a waiting table makes them hungrier.
          let _otG = 1;
          try { const _ok = this.overtimeRaidKnobs ? this.overtimeRaidKnobs() : null; if (_ok) _otG = _ok.gorge; } catch (e) { console.warn('overtime gorge', e); }
          const take = Math.round((500 + Math.floor(R() * 1000)) * _otG);
          let got = 0;
          try { got = this.raidPillage(v, take); } catch (e) {}
          let mn = 'it';
          try { mn = (this.monsterDisplayName && this.monsterDisplayName(m.id)) || 'it'; } catch (e) {}
          // LINGERER ANSWER (design call #8, 2026-10-16, Steve): "Endure it"
          // is the honest default — name it and its price. The sortie is the
          // other answer, on the beats panel while they linger.
          this.say(`🌙 Night. The lingering ${mn} gorges at the treeline — ${Math.round(got).toLocaleString()} kcal gone from the stores. Endure it (they drift off within ~6 nights — the gorge is the price), or send a sortie: fighters, rations, real risk.`);
        }
        try { if (this.syncMonsterAlias) this.syncMonsterAlias(); } catch (e) {}
      } catch (e) {}
      v.havenGrowth = v.havenGrowth || {};
      const hg = v.havenGrowth;
      // Villagers talk about the open invitation (sim-seatvoice 2026-10-16,
      // the #372 blank — filed 2026-10-15, confirmed on the winning
      // substrate: the village's mouths never mention the open invitation;
      // all seat pressure is top-down). Tier-independent: the table
      // outranks the building.
      try { this.tableWaitTalk(); } catch (e) {}
      const tier = this.havenTier();
      // The System dangles the next tier once it has arrived to do the dangling.
      if (this.state.systemArrived && tier < 3 && !hg['barAnnounced' + (tier + 1)]) {
        hg['barAnnounced' + (tier + 1)] = true;
        this.announceHavenBar(tier + 1);
      }
      if (tier >= 3) return;
      const meter = this.havenGrowthMeter();
      if (!meter || !meter.next) return;
      if (meter.next.complete) { this.havenTierUp(); return; }
      // Villagers gossip about what's needed — the path stays unmissable.
      // Cooldown: a village that nags every dawn is a village you mute.
      const day = (this.state.scholar || {}).day || 1;
      if (R() < 0.22 && day - (hg.lastNeedGossipDay || 0) >= 3) {
        hg.lastNeedGossipDay = day;
        this.havenNeedGossip(meter.next);
      }
    },

    // announceHavenBar: the System's gameshow dangle — exact numbers, on screen.
    announceHavenBar(tier) {
      const T = HAVEN_TIERS[tier];
      if (!T) return;
      this.say('◈ SYSTEM: ' + T.sysDangle);
      try { if (this.journalNote) this.journalNote('village', 'haven-tier', 'The System wants ' + T.name + ': ' + T.req.map(r => r.req.toLocaleString() + ' ' + r.label).join(' + ') + '.'); } catch (e) {}
    },

    // havenTierUp: the stockpile hit the bar. The building rises; the cap rises;
    // the next bar is dangled immediately. Effects are read live (hearthStretch,
    // pantryCapKcal wrap, granarySpoilBonus, famineGraceDays, raid wall damage).
    havenTierUp() {
      const v = this.state.village;
      if (!v) return false;
      const tier = this.havenTier();
      if (tier >= 3) return false;
      const T = HAVEN_TIERS[tier + 1];
      v.havenTier = tier + 1;
      if (this.state.systemArrived) this.say('◈ SYSTEM: ' + T.upSys);
      this.say('🛖 ' + T.upBeat);
      try { if (this.journalNote) this.journalNote('village', 'haven-tier', T.name + ' raised. Population cap now ' + T.cap + '.'); } catch (e) {}
      try { if (this.recordMoment) this.recordMoment(T.name + ' raised — Haven grows to ' + T.cap + ' souls.'); } catch (e) {}
      try {
        const hearers = this.npcIds ? this.npcIds().slice(0, 4) : [];
        this.seedGossip('haven_built', { which: T.name }, hearers);
      } catch (e) {}
      // Dangle the next bar immediately — and mark it announced so the daily
      // check doesn't repeat it (break-it 2026-10-10: the dangle fired twice).
      if (this.state.systemArrived && tier + 1 < 3) {
        v.havenGrowth['barAnnounced' + (tier + 2)] = true;
        this.announceHavenBar(tier + 2);
      }
      return true;
    },

    // havenNeedGossip: villagers talk about what's missing, by the fire. The
    // say-line is the overheard beat; the gossip entry lets it travel.
    havenNeedGossip(next) {
      try {
        const v = this.state.village || {};
        const roster = (v.roster || []).filter(id => id !== this.villagerId);
        if (roster.length < 2) return;
        const missing = (next.bars || []).filter(b => !b.done);
        if (!missing.length) return;
        // scarcest first — that's what people actually talk about.
        missing.sort((a, b) => (a.have / a.req) - (b.have / b.req));
        const m = missing[0];
        const speaker = roster[Math.floor(R() * roster.length)];
        let listener = roster[Math.floor(R() * roster.length)];
        if (listener === speaker) listener = roster[(roster.indexOf(speaker) + 1) % roster.length];
        // Person reference that never collapses an unknown villager to "A"
        // and never writes state. Name-known/post-System → first name.
        // Unknown → the FULL descriptor, unsplit (knowledge-gating: what the
        // player would actually perceive — "If you don't know, it doesn't
        // show"). 2026-10-16 sim-villagevoice finding: the old
        // split(' ')[0] turned "A woman, maybe 40s, with a shaved head"
        // into "A". (Game.firstRef was tried first — its whoTag path calls
        // journalPerson, which CREATES state.codex.people stubs: a render
        // writing state, caught by the det-gate. personDescriptor is
        // render-pure; its personLooks memo is shared with the old path.)
        const refOf = (vid) => {
          try {
            if (this.state.systemArrived || this.nameKnown(vid)) {
              return String(this.npcName(vid)).split(' ')[0];
            }
          } catch (e) {}
          try { return this.personDescriptor(vid); } catch (e) {}
          return 'someone';
        };
        const sName = refOf(speaker);
        let lName = refOf(listener);
        // Mid-sentence the descriptor's leading "A" reads wrong ("to A
        // woman") — lowercase it in the listener slot.
        if (/^A /.test(lName)) lName = 'a' + lName.slice(1);
        const fmt = (n) => Math.round(n).toLocaleString();
        let line = '';
        if (m.key === 'food') line = `"The pantry's the thing. We don't raise ${next.name} on empty shelves — ${fmt(m.have)} of ${fmt(m.req)} kcal."`;
        else if (m.key === 'wood') line = `"${fmt(m.have)} wood. We need ${fmt(m.req)}. The forest isn't going to cut itself."`;
        else if (m.key === 'stone') line = `"Stone. We need ${fmt(m.req - m.have)} more for the palisade footings. Creek beds, hillsides — pry it loose."`;
        else if (m.key === 'preserved') line = `"The granary wants food that WAITS — ${fmt(m.have)} of ${fmt(m.req)} kcal preserved. Smoke it, dry it, render it. The fresh stuff doesn't count."`;
        if (!line) return;
        this.say(`🗣️ ${sName} to ${lName}, by the fire: ${line}`);
        this.seedGossip('haven_need', { who: speaker, need: m.key }, [speaker, listener]);
      } catch (e) {}
    },

    // tableTalkRand: the narration stream for table-wait talk. A tiny
    // deterministic PRNG seeded per-day from a string hash — a pure
    // function of game state. Voice beats must NEVER draw from Math.random:
    // the shared stream feeds mechanics, and a narration draw would shift
    // every downstream draw and perturb trajectories. With this stream the
    // fix is provably trajectory-neutral (pair-sweep: byte-identical
    // day-hashes vs control).
    tableTalkRand(salt) {
      let h = 2166136261;
      const s = String(salt);
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      let a = h >>> 0;
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },

    // tableWaitTalk: villagers talk about the open invitation, by the fire.
    // The #372 blank (sim-seatpath 2026-10-15; confirmed on the winning
    // substrate by sim-seatvoice 2026-10-16): across 717 open-invite dawns
    // and 16 winning-substrate runs, ZERO villager-voiced beats mentioned
    // the open invitation — the village talked about everything around the
    // table (the audience, the fear, the coming thing) but never the
    // invitation itself. The pressure was all top-down (System OVERTIME,
    // Herald raids, realm-trust hits).
    //
    // Voice-only: this.say() narration + a rate-limit day marker. No
    // seedGossip (the gossip tick draws RNG and moves REP — not provably
    // neutral), no Math.random draws (tableTalkRand above), no state the
    // engine decides on. The lines rhyme with the convoTableOpener pools
    // (conversation.js) — the village's mouths and the conversation UI now
    // speak the same fiction. Knowledge-gated per canon: the invitation is
    // a public System announcement, so the gate is the engine's own
    // tableWaiting; speaker/listener render with the same name-known vs
    // full-descriptor rule as havenNeedGossip ("If you don't know, it
    // doesn't show").
    tableWaitTalk() {
      try {
        const pg = (typeof this.progState === 'function') ? this.progState() : null;
        if (!pg || !pg.tableWaiting || pg.tableDone) return; // no open invitation
        const v = this.state.village || {};
        const hg = v.havenGrowth || {};
        const day = (this.state.scholar || {}).day || 1;
        if (day - (hg.lastTableTalkDay || 0) < 4) return; // cooldown: no nagging
        // Salt mixes the run's own scholar id: the firing pattern varies
        // run to run (no cross-run "same line on the same day"), while
        // staying a pure function of game state (trajectory-neutral).
        const rnd = this.tableTalkRand('tabletalk:' + day + ':' + (this.villagerId || ''));
        if (rnd() >= 0.22) return;
        const roster = (v.roster || []).filter(id => id !== this.villagerId);
        if (roster.length < 2) return;
        const speaker = roster[Math.floor(rnd() * roster.length)];
        let listener = roster[Math.floor(rnd() * roster.length)];
        if (listener === speaker) listener = roster[(roster.indexOf(speaker) + 1) % roster.length];
        // Person reference: name-known/post-System → first name; unknown →
        // the FULL descriptor, unsplit (the sim-villagevoice "A" fix).
        const refOf = (vid) => {
          try {
            if (this.state.systemArrived || this.nameKnown(vid)) {
              return String(this.npcName(vid)).split(' ')[0];
            }
          } catch (e) {}
          try {
            let d = this.personDescriptor(vid);
            if (/^A /.test(d)) d = 'a' + d.slice(1);
            return d;
          } catch (e) {}
          return 'someone';
        };
        const pool = [
          '"The table\'s set. The ring of pale light — it\'s just sitting there. Waiting on them. What do you think they\'ll tell it?"',
          '"Nobody\'s sleeping. The sky is waiting and nobody knows what to do with their hands."',
          '"Did you see their faces? Too many angles. I keep wondering what they want from us."',
          '"It waits. We wait. Somebody should check the snares — the table doesn\'t fill the pantry."',
          '"It eats while we deliberate. The Herald feeds on our stores and we\'re supposed to just... wait?"',
          '"Why them? ...Sorry. It\'s just sitting there, and they\'re the one who has to sit in it."',
        ];
        const line = pool[Math.floor(rnd() * pool.length)];
        hg.lastTableTalkDay = day;
        this.say(`🗣️ ${refOf(speaker)} to ${refOf(listener)}, by the fire: ${line}`);
      } catch (e) {}
    },

    // ---------- tier mechanics (read live by the systems they touch) ----------

    // hearthStretch: longhouse hearth — village meals go 10% further.
    // Read by villagerMealDay (game.js) for villagers eating at haven.
    hearthStretch() {
      return this.havenTier() >= 1 ? 0.9 : 1;
    },

    // granarySpoilBonus: cool dark bins slow spoilage. Read at pantry-deposit
    // sites (stockPantry, donateToPantry, pantryAdd).
    granarySpoilBonus(foodState) {
      if (this.havenTier() < 3) return 0;
      return foodState === 'preserved' ? 14 : 3;
    },

    // famineGraceDays: the scattering fuse. Read by villageEats (game.js).
    famineGraceDays() {
      return this.havenTier() >= 3 ? 5 : 3;
    },

    // crisisWaveOf: the wave of a raider, for the aid-crisis tier. World-
    // monster entities NEVER carry .wave (spawnWorldMonster builds
    // id/hp/tiles only) — the wave lives in the data def, looked up by id
    // (the raidshieldWaveOf / apexpredators speciesOf recipe). Def is
    // authoritative; an entity-carried .wave is ignored. Unknown ids and
    // nulls default to 1 — the old behavior, never worse.
    crisisWaveOf(m) {
      try {
        const defs = (this.data && this.data.monsters) || [];
        const def = defs.find(d => d && d.id === (m || {}).id);
        if (def && (def.wave | 0)) return (def.wave | 0);
      } catch (e) {}
      return 1;
    },

    // ---------- raids: what the palisade defends against ----------
    // Reactive, never a schedule: the woods must be thick (3+ world monsters)
    // and the pantry must smell (3,000+ kcal). ~18%/day when ripe, ≥7 days
    // between raids. Raiders are real world-monster entities; defenders fight
    // them blow-by-blow via resolveWildMonsterEncounter. Raiders nobody meets
    // pillage the pantry. Without a palisade, one raider can reach the
    // sleeping player (pendingEncounter wakes them into the fight); with a
    // palisade the watch holds the wall — safe sleep is real.
    havenRaidTick() {
      const v = this.state.village;
      if (!v || this.over) return false;
      // TABLE SANCTITY (2026-10-12, Steve): while the table sits, no new
      // raids — the world holds its breath. Raiders already at the treeline
      // hold (see havenGrowthDaily); nothing new comes.
      if (this.tableActive && this.tableActive()) return false;
      const day = (this.state.scholar || {}).day || 1;
      // OVERTIME (2026-10-14, titans.json _overtime): each tier shortens the
      // cooldown and raises the roll. Tier 0 = exactly the old 7 days / 18%.
      let _ot = null;
      try { _ot = this.overtimeRaidKnobs ? this.overtimeRaidKnobs() : null; } catch (e) { console.warn('overtime raid', e); }
      if (day - (v.lastRaidDay || 0) < (_ot ? _ot.cooldown : 7)) return false;
      let monsters = [];
      try { monsters = this.worldMonsters ? this.worldMonsters() : []; } catch (e) { return false; }
      // DEAD RAIDERS DON'T GET DRAFTED (crisis leg r47 2026-10-24): r5
      // filtered the player-facing raider, but the draft itself still took
      // the nearest world monsters with no hp check — a 0-hp corpse was
      // announced as a raider, got the "Nobody met <name>" line, then never
      // gorged (the dawn loop skips hp<=0) while the crisis resolved
      // 'fought' for a threat that was never there (phantom lingerer,
      // observed seeds 9402 d18 / 9403 d26). The 3-monster minimum counts
      // living raiders only.
      try { monsters = monsters.filter(m => m && (m.hp || 0) > 0); } catch (e) {}
      if (!monsters.length || monsters.length < 3) return false;
      let pantry = 0;
      try { pantry = this.pantryKcalLive(v) || 0; } catch (e) {}
      if (pantry < 3000) return false;
      if (R() < (_ot ? _ot.skip : 0.82)) return false;
      // ---- RAID ----
      v.lastRaidDay = day;
      const palisade = this.havenTier() >= 2;
      const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
      const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
      const sorted = monsters.slice().sort((a, b) =>
        (Math.abs(a.tx - hx) + Math.abs(a.ty - hy)) - (Math.abs(b.tx - hx) + Math.abs(b.ty - hy)));
      // WEALTH DRAWS TEETH (util audit 2026-10-10): a rich pantry smells
      // farther. 3 raiders base, +1 above 12k kcal and +1 above 24k, cap 5.
      // Reactive (world state), never scheduled.
      const raidN = Math.min(5, 3 + (pantry > 12000 ? 1 : 0) + (pantry > 24000 ? 1 : 0));
      const raiders = sorted.slice(0, raidN);
      const mname = (m) => {
        try { return this.monsterDisplayName(m.id) || 'something'; } catch (e) { return 'something'; }
      };
      for (const m of raiders) {
        // RAID-NAMING (sim-raidname-b 2026-10-29): mark the drafted
        // entity as raid-born so a later fight against it can say
        // so at fight start (game.js startCombat). Fact about
        // origin, like veteran — no spawn/damage/crisis value here.
        m.raidBorn = true;
        m.tx = hx; m.ty = hy;
        if (palisade) {
          const wall = Math.round(((m.maxHp || m.hp || 20)) * 0.25);
          m.hp = Math.max(1, (m.hp || wall) - wall);
        }
      }
      try { if (this.syncMonsterAlias) this.syncMonsterAlias(); } catch (e) {}
      const names = raiders.map(mname).join(', ');
      this.say(`🐗 RAID — ${raiders.length === 1 ? 'a raider' : raiders.length + ' raiders'} (${names}) hit Haven in the night, drawn by the smell of the pantry!` +
        (palisade ? " The palisade's stakes take their toll as they come over the wall." : ' No walls. No warning but the noise.'));
      // PALISADE-ESCALATION BEAT (2026-10-25, sim-palisade-a): the
      // carried blank — a wave-3+ raider at the wall used to read
      // exactly like any other name in the raid list. NARRATION ONLY:
      // no spawn, draft, damage, crisis, or economy value is touched
      // here (the crisis tier below still computes its own wmax
      // exactly as before). Fires exactly when the raid's drafted
      // wmax >= 3 via crisisWaveOf (m.wave is never on the entity);
      // the named raider is the first drafted raider at that wmax,
      // named via mname (knowledge-gated display name, never the
      // true name). No wave number or wave title is named — the
      // village knows something bigger came, not what the System
      // calls it. Separate aloud line (not an appended sentence)
      // so the RAID sentence above stays byte-identical.
      try {
        let _raidWmax = 1; let _raidBig = null;
        for (const m of raiders) {
          try {
            const w = this.crisisWaveOf(m);
            if (w > _raidWmax) { _raidWmax = w; _raidBig = m; }
          } catch (e) {}
        }
        if (_raidWmax >= 3 && _raidBig) {
          this.say(`🐗⚠️ One of them is bigger than the usual teeth at the door — ${mname(_raidBig)} came with this raid, and the wall was not built for its kind.`);
        }
      } catch (e) { console.warn('raid escalation beat', e); }
      // CONTEST COLLISION (journey crisis r40 2026-10-21): the mirror of the
      // fireContest acknowledgment above — a raid firing on (or the day after)
      // a contest announcement gets a village-voice connective line instead
      // of landing as an unrelated beat. Shares the same once-per-day ack
      // flag so a two-direction collision day says it exactly once.
      try {
        const _rcV = this.state.village || {};
        const _lc = _rcV.lastContest || null;
        if (_lc && typeof _lc.day === 'number' && day - _lc.day >= 0 && day - _lc.day <= 1 && _rcV._raidContestAckDay !== day) {
          _rcV._raidContestAckDay = day;
          this.say(`🕯️ The treeline is still torn up from the raid when the System's light comes for them. Nobody is ready. The light doesn't wait.`);
        }
      } catch (e) { console.warn('raid-contest-ack', e); }
      // THE DOOR (util audit 2026-10-10): raiders at Haven are exactly the
      // "monster at your door" beat the call-for-help chain was built for —
      // but raiseAidCrisis had no organic caller, so all four tiers sat dead
      // (0/120 runs). Raids now raise the crisis reactively: the village
      // looks to you, the four options are said aloud, you decide. Raiders
      // nobody meets LINGER at the treeline (the crisis threat) instead of
      // one instant pillage nobody can answer — that's what help is FOR.
      // The crisis resolves 'fought' when the treeline is clear (commsTick),
      // or drifts 'moved-on' on the 6-day valve.
      try {
        if (this.raiseAidCrisis) {
          // CRISISTIER (2026-10-16, finding #420): read the raiders' waves
          // from the data defs via crisisWaveOf — m.wave is never on the
          // entity, so max(m.wave||1) raised every raid crisis as tier 1 and
          // the call-for-help chain's wave>=3 apex penalty (score -10,
          // comms.js aidAskVillage) never applied to apex raids.
          let wmax = 1;
          for (const m of raiders) { try { wmax = Math.max(wmax, this.crisisWaveOf(m)); } catch (e) {} }
          const crisis = this.raiseAidCrisis(names, wmax);
          if (crisis) crisis.raiders = true;
        }
      } catch (e) {}
      // defenders: healthy villagers at home. Real fights, not rolls.
      // SHELTER (2026-10-16): sheltered villagers do not come out to meet
      // raiders — the muster discipline is "outlast it," not "feed it."
      // The honest cost is the existing linger path below: unmet raiders
      // gorge nightly until driven off. Lives vs pantry, legible.
      const defenders = (v.roster || []).filter(id =>
        id !== this.villagerId &&
        !(v.away && v.away[id]) &&
        !(this.isSheltered && this.isSheltered(id)) &&
        ((v.health || {})[id] === undefined || (v.health || {})[id] > 40));
      // FACILITATION (journey-endgame r7 2026-10-13): tableFacilitate('shield')
      // promises "the village's fights will spend others first" — shielded
      // villagers stand at the BACK of the defender line: they still fight
      // when there is no one else, but everyone else is spent first.
      const _sh = (v.shielded || {});
      defenders.sort((a, b) => ((_sh[a] ? 1 : 0) - (_sh[b] ? 1 : 0)));
      let di = 0;
      // RAID DEFENSE BEAT (journey crisis r30 2026-10-19): the village's
      // fight used to resolve in silence — the RAID line named the raiders,
      // the defenders' names never appeared in narrative, only in private
      // 'defended' memories. Now the night gets one aloud beat: who met
      // them at the door, what it cost. Knowledge-gated (monsterNoun via
      // mname, never the true name), said aloud like the raid announcement.
      const defenseReport = [];
      const refName = (id) => { try { return this.firstRef ? this.firstRef(id) : this.displayName(id); } catch (e) { return 'Someone'; } };
      for (const m of raiders) {
        if (di < defenders.length) {
          const d = defenders[di++];
          // CRISIS MEMORY (journey crisis r6 2026-10-13): the {raid:true}
          // flag marks these fights as haven defense — resolveWildMonster-
          // Encounter plants a 'defended' memory the lately-topic reads.
          let rec = null;
          try { if (this.resolveWildMonsterEncounter) rec = this.resolveWildMonsterEncounter(d, m, { raid: true }); } catch (e) {}
          if (rec && rec.outcome) defenseReport.push({ vid: d, rec, m });
        } else {
          // nobody met this one — it doesn't gorge once and leave. It
          // LINGERS at the treeline and gorges at each dawn until driven
          // off (havenGrowthDaily). The crisis threat, made persistent —
          // this is the situation the call-for-help chain exists for.
          // DRIFT CLOCK (journey crisis r38 2026-10-21): stamp when the
          // lingering starts; the ~6-night drift valve reads it. Never
          // re-stamp an already-lingering raider.
          if (!m.lingering) { try { m.lingerSince = (this.state.scholar || {}).day || 0; } catch (e) {} }
          m.lingering = true;
          this.say(`Nobody met ${this.articlePhrase(mname(m))} — it's still out there at the treeline. It'll gorge every night until it's driven off.`);
        }
      }
      if (defenseReport.length) {
        try {
          const names = defenseReport.map(r => refName(r.vid));
          const nameList = names.length === 1 ? names[0]
            : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
          const o = defenseReport.map(r => (r.rec && r.rec.outcome) || '?');
          const kills = o.filter(x => x === 'vKill').length;
          const stood = o.filter(x => x === 'mFlee').length;
          const fled = o.filter(x => x === 'vFlee').length;
          const fallen = defenseReport.filter(r => (r.rec && r.rec.outcome) === 'vDie').map(r => refName(r.vid));
          const bits = [];
          if (kills) bits.push(`${kills} put down`);
          if (stood) bits.push(`${stood} driven off`);
          if (fled) bits.push(`${fled} barely walked away`);
          const hurt = defenseReport.filter(r => (r.rec && (r.rec.vTaken || 0)) > 0 && (r.rec.outcome !== 'vDie'))
            .map(r => refName(r.vid));
          let line = `🛡️ ${nameList} met them at the door — ${bits.join(', ') || 'met them and lived'}.`;
          if (fallen.length) line += ` ${fallen.join(', ')} didn't come back.`;
          if (hurt.length) line += ` ${hurt.join(', ')} ${hurt.length === 1 ? 'is' : 'are'} hurt.`;
          this.say(line);
        } catch (e) { console.warn('raid defense beat', e); }
      }
      // the player: without a palisade, one raider can reach a sleeper.
      let playerAtHaven = false;
      try { playerAtHaven = this.playerAtHaven ? this.playerAtHaven() : false; } catch (e) {}
      if (playerAtHaven && !palisade && raiders.length) {
        // DEAD RAIDERS DON'T WALK (crisis leg r5 2026-10-12): the defenders
        // above may have already dropped raiders[0] — the player faces the
        // first raider still standing, never a fresh copy of a corpse
        // (pendingEncounter spawns by id; a dead raider's id is a phantom).
        let live = [];
        try {
          const wms = this.worldMonsters ? this.worldMonsters() : [];
          live = raiders.filter(rm => rm && (rm.hp || 0) > 0 && wms.indexOf(rm) !== -1);
        } catch (e) {}
        // NO SILENT CLOBBER (crisis leg r5 2026-10-12): a live pending
        // encounter is someone else's beast (the feast draw's, the
        // wanderer's). Never overwrite it — the raiders hold at the
        // treeline with the rest instead.
        if (this.pendingEncounter) {
          for (const rm of live) {
            if (!rm.lingering) { try { rm.lingerSince = (this.state.scholar || {}).day || 0; } catch (e) {} }
            rm.lingering = true;
          }
          if (live.length) this.say(`Another shape at the treeline — but the way is already watched. It'll wait out there with the rest.`);
        } else if (live.length) {
          const m = live[0];
          this.say(`One of them is coming for YOU — ${mname(m)}, inside the haven, eyes on your bedroll.`);
          this.pendingEncounter = true;
          this.pendingMonsterId = m.id;
          // RAID-NAMING (sim-raidname-b 2026-10-29): shadow the
          // pending with its raid provenance. Pending-resolved
          // fights are instantiated by species id (startCombat
          // builds fighters from the def), NOT lifted from the
          // world entity — the drafted raiders wander off the
          // haven tile before morning, so the entity flag alone
          // cannot name the fight. This id survives the harness
          // pending-clear (which clears only the two pending
          // fields) so startCombat can match mid against it.
          // Cleared on consume (startCombat) and on any non-raid
          // pending overwrite (feast draw, wanderer, tent
          // breach); a lingering raider met later is still
          // named via its entity raidBorn flag.
          this.raidPendingMonsterId = m.id;
        } else {
          this.say(`The defenders met them at the treeline — nothing reached your bedroll.`);
        }
      } else if (playerAtHaven && palisade) {
        this.say('The watch holds the wall. You sleep through the worst of it — or would have, if the shouting had let you.');
      }
      if (!playerAtHaven) {
        try {
          const sch = this.state.scholar;
          sch.awayNews = sch.awayNews || [];
          if (sch.awayNews.length < 8) sch.awayNews.push(`🐗 RAID at Haven last night — ${raiders.length} raiders hit the pantry.${palisade ? ' The palisade held.' : ''}`);
        } catch (e) {}
      }
      try {
        const hearers = this.npcIds ? this.npcIds().slice(0, 4) : [];
        this.seedGossip('raid', { raiders: raiders.length }, hearers);
      } catch (e) {}
      return true;
    },

    // ---------- THE LINGERER ANSWER (design call #8, 2026-10-16, Steve) ----------
    // Wave-4/5 lingerers (monsters that won't leave the treeline) are answered
    // by "Endure it" (the default — the 6-day 'moved-on' valve) or a REAL
    // costly played sortie — never a flat button/roll. The sortie musters real
    // fighters, spends real rations, and plays real fieldFights blow-by-blow:
    // villagers can die. (Canon: "Monster encounters are fought, not rolled",
    // Steve 2026-10-08.) Not routed through aidFight: it would replace the
    // mustered party with foreign allies mid-sortie and resolve the crisis
    // after the first kill — the sortie is the village's own fight.
    lingeringRaiders() {
      try {
        const ms = this.worldMonsters ? this.worldMonsters() : [];
        return ms.filter(m => m && m.lingering && (m.hp || 0) > 0);
      } catch (e) { console.warn('lingeringRaiders', e); return []; }
    },

    // answerLingerer: the beats-panel choice. 'endure' is the explicit default
    // (doing nothing was always the same answer); 'sortie' pays the price.
    answerLingerer(how) {
      if (how === 'endure') {
        const day = (this.state.scholar || {}).day || 0;
        this.state.lingererBeatDay = day;
        this.say(`You endure it. The treeline holds its shape against the dark; the stores take the night's cut. (They'll drift off within ~6 nights — the gorge is the price of waiting.)`);
        return 'endured';
      }
      if (how === 'sortie') return this.lingererSortie();
      return null;
    },

    lingererSortie() {
      const raiders = this.lingeringRaiders();
      if (!raiders.length) {
        this.say('Nothing holds the treeline. (No lingerers to sortie against.)');
        return { ok: false, why: 'none' };
      }
      // MUSTER: real fighters, never the player. Two besides-you minimum —
      // a lone villager against a treeline monster is a funeral, not a sortie.
      let muster = [];
      try { muster = this._musterAway ? this._musterAway(3, 'defense') : []; } catch (e) { console.warn('lingererSortie muster', e); }
      if (muster.length < 2) {
        this.say(`Not enough fighters to send — a sortie needs at least two besides you, and the bench is bare. (Endure it, or call for help.)`);
        return { ok: false, why: 'no-fighters' };
      }
      const leader = muster[0], allyVids = muster.slice(1);
      const refName = (id) => { try { return this.firstRef ? this.firstRef(id) : this.displayName(id); } catch (e) { return 'Someone'; } };
      const partyNames = muster.map(refName).join(', ');
      // RESOURCES: a day's marching rations per fighter, real food, said aloud.
      const rationEach = 2000, cost = rationEach * muster.length;
      let paid = 0;
      try { paid = this._removePantryKcal ? (this._removePantryKcal(cost) || 0) : 0; } catch (e) { console.warn('lingererSortie rations', e); }
      this.say(`⚔️ SORTIE — ${partyNames} take up arms and a day's rations (${Math.round(paid).toLocaleString()} kcal from the stores) and walk out to the treeline. Nobody's coming back the same.`);
      // THE FIGHTS: one played fieldFight per lingerer, in turn — the same
      // blow-by-blow engine as every villager-vs-monster meeting. The party
      // leader fights wounded from the last one; a fallen leader breaks it.
      let broke = false, cleared = 0;
      for (const m of raiders.slice()) {
        if (!m.lingering || (m.hp || 0) <= 0) continue;
        const mdef = (this.data.monsters || []).find(x => x.id === m.id) || {};
        let mName = 'something';
        try { mName = this.monsterNoun ? this.monsterNoun(mdef.id) : (mdef.name || 'something'); } catch (e) { console.warn('lingererSortie noun', e); }
        // SENTENCE-SAFE (playtest deepening r18 2026-10-18, #542 class).
        const mPhrase = this.articlePhrase ? this.articlePhrase(mName) : mName;
        let rec = null;
        try { rec = this.fieldFight(leader, mdef, m, { allies: allyVids.length, allyVids: allyVids.slice(), cornered: true }); }
        catch (e) { console.warn('lingererSortie fight', e); }
        if (!rec || !rec.outcome) continue;
        let summary = `${refName(leader)} fought ${mPhrase}`;
        try { summary = this.fieldFightSummary ? this.fieldFightSummary(rec, refName(leader), mName) : summary; } catch (e) { console.warn('lingererSortie summary', e); }
        if (rec.outcome === 'vKill') {
          try { this.hurtVillager(leader, rec.vTaken, 'monster', rec); } catch (e) { console.warn('lingererSortie hurt', e); }
          try { this.recordWaveKill(m.id, leader, 'sortie', this.trickSummary ? this.trickSummary(rec) : null); } catch (e) { console.warn('lingererSortie ledger', e); }
          let lootNote = '';
          try {
            const dropId = this.villagerKillLoot ? this.villagerKillLoot(leader, mdef) : null;
            if (dropId) {
              const ldef = (this.data.items || []).find(d => d.id === dropId) || {};
              lootNote = ` Took ${ldef.name || 'something strange'} off the body.`;
              if (this.villagerGearUp) this.villagerGearUp(leader, false);
            }
          } catch (e) { console.warn('lingererSortie loot', e); }
          try {
            const corpse = this.registerDeath({
              kind: 'monster', monsterId: m.id, monsterName: mdef.name,
              name: this.monsterDisplayName ? this.monsterDisplayName(m.id) : (mdef.name || 'the beast'),
              descriptor: this.monsterDisplayName ? this.monsterDisplayName(m.id) : null,
              node: { x: m.tx, y: m.ty }, mx: m.mx, my: m.my,
              cause: 'sortie combat', killerId: leader, witnesses: muster.slice(),
            });
            const meat = this.monsterCarcassEntries ? this.monsterCarcassEntries(mdef) : [];
            if (corpse && meat.length) for (const me of meat) corpse.items.push(me);
            try { if (corpse && this.mapmemRemember) this.mapmemRemember(leader, corpse); } catch (e2) { console.warn('lingererSortie mapmem', e2); }
          } catch (e) { console.warn('lingererSortie corpse', e); }
          try { this.removeWorldMonster(m); } catch (e) { console.warn('lingererSortie remove', e); }
          cleared++;
          this.say(`⚔️ ${summary}${lootNote} The carcass is out there — haul it home before it rots.`);
          try { this.villageEvent('victory'); } catch (e) { console.warn('lingererSortie event', e); }
          try { this.bumpTrust(leader, 5); } catch (e) { console.warn('lingererSortie trust', e); }
          try { this.remember(leader, 'hero', 'drove the ' + mName + ' off the treeline in a sortie'); } catch (e) { console.warn('lingererSortie memory', e); }
        } else if (rec.outcome === 'mFlee') {
          try { this.hurtVillager(leader, rec.vTaken, 'monster', rec); } catch (e) { console.warn('lingererSortie hurt', e); }
          // DRIVEN OFF: it leaves the treeline — the gorge stops. It's still
          // out there in the world (the entity persists), just not besieging.
          m.lingering = false;
          cleared++;
          this.say(`⚔️ ${summary} It breaks and runs — the treeline is clear of it. It's still out there, somewhere.`);
          try { this.bumpTrust(leader, 3); } catch (e) { console.warn('lingererSortie trust', e); }
        } else if (rec.outcome === 'vFlee') {
          try { this.hurtVillager(leader, rec.vTaken, 'monster', rec); } catch (e) { console.warn('lingererSortie hurt', e); }
          this.say(`⚔️ ${summary} — the party falls back to the palisade, dragging their nerve with them. The treeline holds.`);
          try { this.bumpTrust(leader, -2); } catch (e) { console.warn('lingererSortie trust', e); }
          broke = true; break;
        } else if (rec.outcome === 'vDie') {
          // lethal through the real death pipeline (hurtVillager routes it)
          try { this.hurtVillager(leader, rec.vTaken, 'monster', rec); } catch (e) { console.warn('lingererSortie hurt', e); }
          this.say(`⚔️ ${refName(leader)} faced ${mPhrase} at the treeline... and didn't come back. The party carries the body home. The sortie is over.`);
          try { this.deathGriefBeat(leader); } catch (e) { console.warn('lingererSortie event', e); }
          try { this.bumpTrust(leader, -2); } catch (e) { console.warn('lingererSortie trust', e); }
          broke = true; break;
        }
      }
      // AFTERMATH: treeline clear of lingerers = the door answered.
      const still = this.lingeringRaiders();
      if (!still.length) {
        const crisis = this.aidCrisis ? this.aidCrisis() : null;
        if (crisis && !crisis.resolved && crisis.raiders) {
          this.say('The treeline is quiet. No shapes in the dark.');
          try { this.resolveAidCrisis('fought'); } catch (e) { console.warn('lingererSortie resolve', e); }
        } else {
          this.say('The treeline is quiet. No shapes in the dark.');
        }
      } else if (!broke) {
        this.say(`${still.length} still hold${still.length === 1 ? 's' : ''} the treeline — the gorge goes on. (Endure it, or send another sortie.)`);
      }
      return { ok: true, cleared, broke, remaining: still.length, paid };
    },

    // raidPillage: raiders eat from the real pantry (best-fit draw, discarded).
    raidPillage(v, kcal) {      v = v || this.state.village;
      if (!v || kcal <= 0) return 0;
      let taken = 0;
      try {
        const drawn = this.pantryDraw(v, Math.round(kcal), {});
        taken = (drawn && drawn.taken) || 0;
      } catch (e) {}
      return taken;
    },
  };

  Object.assign(Game, methods);

  // ---------- wraps (attach at load; all targets exist — food.js, progression.js loaded earlier) ----------

  // Daily: tier check + raid tick, via progDaily (which endDay calls).
  try {
    const _progDaily = Game.progDaily;
    Game.progDaily = function () {
      const r = _progDaily ? _progDaily.apply(this, arguments) : undefined;
      try { this.havenGrowthDaily(); } catch (e) {}
      try { this.havenRaidTick(); } catch (e) {}
      return r;
    };
  } catch (e) {}

  // Longhouse: +25% pantry capacity.
  try {
    const _pantryCapKcal = Game.pantryCapKcal;
    if (typeof _pantryCapKcal === 'function') {
      Game.pantryCapKcal = function () {
        let c = _pantryCapKcal.call(this);
        try { if (this.havenTier && this.havenTier() >= 1) c = Math.round(c * 1.25); } catch (e) {}
        return c;
      };
    }
  } catch (e) {}
})();
