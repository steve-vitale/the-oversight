// @ontology
// system: leadership
// description: The Leadership Vector. No single ending — ending is sum of leadership choices.
// provides:
//   - ledger()
//   - ledgerAdd(entry)
//   - recordLegend(text)
//   - recordMoment(text)
//   - contestStandings()
//   - viewershipBoard()
//   - unityState()            (felt unified/fractured state machine)
//   - foodStance()            (sharer/even/hoarder from foodShared vs foodHoarded)
//   - legendSurface()         (the story so far, as the world tells it)
//   - shareFood(kcal, toName)  (WIRED 2026-10-11: deliberate gifts call it; homecoming pool stays unwired by design)
//   - hoardFood(kcal)         (wired 2026-10-14: takeFromPantryBulk hoard detector, game.js)
//   - hearGossipAboutSelf(source) (UNWIRED 2026-10-08: no callers)
//   - exposeFallout(caseId, voterId) (named consequences when a truth goes public)
//   - flushLedgerBeats()      (fires queued beats whose knowledge gates now pass)
//   - hearsAboutSelf()        (knowledge gate: has the player heard their own legend?)
// rules:
//   - threshold beats fire once per run per dimension, knowledge-gated (gossip always, show needs viewership, system needs the overlay, lived/witness always); ungated beats queue and fire when the world catches up (code: _checkDimBeats, flushLedgerBeats)
//   - unified/fractured is a felt state machine, not a number; transitions are narrated, direction-aware, always visible — you live it (code: unityState, _checkUnityTransition)
//   - foodShared vs foodHoarded resolve to a felt stance; stance transitions are narrated with social consequences (code: foodStance, _checkFoodStance)
//   - viewership is deed-reactive, never pantry-reactive (code: havenViewership): inits from arc*5 + showmanship + codex breadth capped at 15, floored at 12 (the drift's resting state); a fat pantry is prosperity, not fame; ledger showmanship feeds live via _viewShoMark; spikes (recordMoment/arena/stunts) and spends (OBJECT/declines) ride the sticky pool, nothing refills it
//   - the player's own epithet is never shown until hearsAboutSelf() (code: ledgerBeat)
//   - table_deed_recheck: true (code: ledger.js endDay wrap calls tableScene at dawn; table.js tableScene re-verifies tableSeat() — full via deedGateReady(), or lesser — and a seat of 'none' withdraws a stale tableWaiting aloud, never fired silently)
// consumes:
//   - state.leadership
// ============ THE LEADERSHIP VECTOR ============
// Steve's decision (2026-10-04): NO single ending. The ending is the sum of
// how you led humanity to the table. This module tracks that sum as a
// first-class thing across the whole game — not numbers the player sees,
// but a shape the world reacts to. Villages talk about you. The show's
// narration talks about you. You feel your ending being written before
// you arrive.
//
// Dimensions:
//   might / brokerage      — force vs diplomacy: did your network grow
//                             through feastburn strength or deal-making?
//   showmanship            — how much you played to the audience
//   embrace / defiance     — integration stance toward the System
//   exposed                — truths dragged into the light (bribes, plots)
//   unified / fractured    — humanity's shape under you (felt state machine)
//   foodShared / foodHoarded — the food truth: shared outward, or hoarded?
//   protected / killed     — the moral ledger
//
// Ending frames: the Indispensable, the Feared, the Beloved, the Witness,
// the Defiant, the Assimilated. Within the earned frame, the player gets
// one final live choice — that's the drama. Endings feed the next
// roguelite run: the Codex remembers, and the next adventurer inherits
// the last one's legend (or warning).
//
// Self-attaching module: Object.assign(Game, methods) + wraps. Load after
// progression.js.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const R = Math.random;

  const FRAMES = {
    indispensable: {
      name: 'the Indispensable',
      narrate: 'The galaxy runs on energy, and only one species knows the trick: eating. They need what you know. You walk to the table knowing they cannot afford for you to leave it.',
      epithet: 'the one the galaxy needs',
    },
    feared: {
      name: 'the Feared',
      narrate: '"Look what eating built." The footage plays unasked — the deer, the fire, the ones who came for you and didn\'t come back. Nobody at the table is comfortable. That is the point.',
      epithet: 'the one the table fears',
    },
    beloved: {
      name: 'the Beloved',
      narrate: 'The audience is chanting. You don\'t know the words — it isn\'t a language with words — but you know the feeling. The table can\'t move against the cast\'s favorite. That\'s leverage.',
      epithet: 'the audience\'s favorite',
    },
    witness: {
      name: 'the Witness',
      narrate: 'You didn\'t come to negotiate. You came with a list. Every bribe, every buried plot, every "rounding error" — including theirs. The judges are about to be judged.',
      epithet: 'the one who kept the list',
    },
    defiant: {
      name: 'the Defiant',
      narrate: 'You came to the table to tell it no. The System keeps recalculating, the way it does when it\'s afraid. Humanity walks. Let the galaxy watch that.',
      epithet: 'the one who said no',
    },
    assimilated: {
      name: 'the Assimilated',
      narrate: 'Comfort, on their terms. Warm light, no hunger, no fear. All it costs is everything that made you worth watching. It\'s such a gentle trap. That\'s what makes it a trap.',
      epithet: 'the comfortable one',
    },
  };

  // ============ THRESHOLD BEATS — the ending written in real time ============
  // Steve's decision (2026-10-04): "You feel your ending being written
  // before you arrive." Counters are silent; beats are not. When a dimension
  // crosses a threshold, the world REACTS — village gossip, show narration,
  // System commentary, or the lived feel of the thing itself.
  //
  // Knowledge gating ("if you don't know, it doesn't show"):
  //   gossip  — overhearing IS the channel. Always fireable; the first
  //             gossip beat marks you talked-about (hearsAboutSelf).
  //   show    — the show must actually be watching: viewership >= 12 or a
  //             broadcast you've seen. Otherwise the beat waits in the queue.
  //   system  — needs the overlay: integrationStage() >= 1.
  //   lived   — you live it. Always visible.
  //   witness — the exposure was public at the moot. Always visible.
  // Each beat fires once per run. Queued beats fire when the world catches up.
  function beatVillage(g) {
    try { return g.distantVillageName() || 'the outer villages'; }
    catch (e) { return 'the outer villages'; }
  }

  const LEDGER_BEATS = {
    might: [
      { at: 5, kind: 'gossip', text: g => `Riders from ${beatVillage(g)} are telling the deer story again — with your name attached this time.` },
      { at: 12, kind: 'show', text: () => `📺 The show has started calling you "the strong one of Haven." They play the deer footage underneath, whether you want them to or not.` },
      { at: 20, kind: 'lived', text: () => `You notice the village gives you room on the path now. Not fear, exactly. Room.` },
    ],
    brokerage: [
      { at: 5, kind: 'gossip', text: g => `A rider says in ${beatVillage(g)} you're "the one who makes deals hold." Nobody remembers when that started being true.` },
      { at: 12, kind: 'show', text: () => `📺 The broadcast calls you "Haven's tongue." The audience loves a deal; they love the person who closes it more.` },
      { at: 20, kind: 'system', text: () => `🌟 "MEDIATION REQUESTS ROUTED TO YOU: SEVEN." The System pauses. "You are... efficient at this. We have noticed. (We notice everything. But this, we noticed twice.)"` },
    ],
    showmanship: [
      { at: 6, kind: 'show', text: () => `📺 The audience has a favorite, and it's you. The chant doesn't have words. It doesn't need them.` },
      { at: 15, kind: 'show', text: () => `📺 Strangers paint your face on their walls. In other villages. Villages you've never been to.` },
      { at: 25, kind: 'show', text: () => `📺 The show has stopped introducing you. Everybody knows.` },
    ],
    embrace: [
      { at: 3, kind: 'system', text: () => `The overlay's tone has changed around you. Warmer. It notices you noticing.` },
      { at: 8, kind: 'system', text: () => `🌟 "We ask your opinion before we act now." The System says it like a confession. "That is not normal. That is not nothing."` },
      { at: 14, kind: 'system', text: () => `The System has started finishing your sentences. It's trying to be helpful. It's succeeding, which is the unsettling part.` },
    ],
    defiance: [
      { at: 3, kind: 'system', text: () => `The System's messages have gotten careful around you. It chooses its words the way you choose footing on ice.` },
      { at: 8, kind: 'system', text: () => `🌟 "We have stopped arguing with you." A pause. "Do not mistake this for agreement."` },
      { at: 14, kind: 'system', text: () => `Somewhere in the light, a subroutine files you under UNRESOLVED. You can feel the label.` },
    ],
    exposed: [
      { at: 2, kind: 'witness', text: () => `People bring you their suspicions, written down. You keep every one.` },
      { at: 6, kind: 'witness', text: () => `Three more names. The list is getting heavy. Strangers send you their truths now — sealed, hopeful, terrified.` },
      { at: 12, kind: 'show', text: () => `📺 The broadcast calls you "the one who kept the list." The judges are watching. Good.` },
    ],
    protected: [
      { at: 5, kind: 'lived', text: () => `A child drew you on the haven wall. You're very tall, and there are a lot of teeth on the other side.` },
      { at: 12, kind: 'gossip', text: g => `In ${beatVillage(g)}, mothers tell the story of the night you stood between. The children ask for it by name.` },
    ],
    killed: [
      { at: 3, kind: 'lived', text: () => `The village doesn't talk about what you did. That is its own kind of talking.` },
      { at: 8, kind: 'lived', text: () => `Someone moved their sleeping roll farther from yours. Nobody mentions it. Everybody knows.` },
    ],
    betrayed: [
      { at: 2, kind: 'lived', text: () => `Someone trusted you once. The village remembers the shape of it, the way a mouth remembers a missing tooth.` },
    ],
    foodShared: [
      { at: 5, kind: 'lived', text: g => `A mother from ${beatVillage(g)} pressed a carved token into your hand: "for the winter you fed us." You didn't know there was a winter you'd fed.` },
      { at: 12, kind: 'gossip', text: () => `Riders say your name the way people say "harvest."` },
      { at: 20, kind: 'show', text: () => `📺 The broadcast ran the numbers: how much of Haven's food left Haven in your hands. The audience went quiet — the good kind of quiet.` },
    ],
    foodHoarded: [
      { at: 4, kind: 'lived', text: () => `You've started counting the pantry twice. People notice who's watching the stores.` },
      { at: 10, kind: 'lived', text: () => `Someone asked why the stores stay full while bellies don't. Nobody answered. Everybody heard.` },
    ],
  };

  // Unified/fractured is not a number the player watches — it's a state the
  // player LIVES IN. Tiers keyed by (unified − fractured); transitions are
  // narrated, direction-aware, and always visible. You don't need knowledge
  // to feel your village coming apart.
  const UNITY_TIERS = [
    { key: 'as-one', min: 8, label: 'As one',
      worse: `The village has started finishing each other's sentences. A dispute about fence lines ended in laughter yesterday. Nobody can say when it changed.` },
    { key: 'close-knit', min: 3, label: 'Close-knit',
      worse: `The effortless closeness takes effort now. People notice the effort, and love each other for it.`,
      better: `You've noticed: people cover for each other without being asked. The gaps close themselves.` },
    { key: 'holding', min: -2, label: 'Holding together',
      worse: `The easy closeness has thinned a little. Nobody's fault. Weather changes.`,
      better: `Dinner is loud again. Not the good loud yet — the trying loud. It's a start.` },
    { key: 'fraying', min: -7, label: 'Fraying',
      worse: `Two tables at dinner now. Nobody planned it; it just happened. The fence dispute turned into something else.`,
      better: `One table again. Not the old easy one — a deliberately shared one. It counts.` },
    { key: 'fractured', min: -Infinity, label: 'Fractured',
      worse: `Two hearths. Two councils, almost. Dinner is quiet in the way a held breath is quiet. Haven is two villages wearing one name.` },
  ];

  // The food truth has two sides. The stance is felt, not counted — but the
  // village keeps its own accounts, and the transition beats are the social
  // consequences.
  const FOOD_STANCES = {
    sharer: { label: 'Sharer', enter: `The pantry is everyone's and everyone knows it. That is worth more than the food.` },
    even: { label: 'Even', enter: `Give and take, take and give. The village keeps its own accounts — and yours are balanced. For now.` },
    hoarder: { label: 'Hoarder', enter: `Your stores are yours. The village has stopped asking about them. That silence has a price.` },
  };

  const methods = {

    // ---------- THE LEDGER ----------
    ledger() {
      const pg = this.progState();
      if (pg.ledger && pg.ledger.betrayed === undefined) pg.ledger.betrayed = 0;
      pg.ledger = pg.ledger || {
        might: 0, brokerage: 0, showmanship: 0, embrace: 0, defiance: 0,
        exposed: 0, unified: 0, fractured: 0, foodShared: 0, foodHoarded: 0,
        protected: 0, killed: 0, betrayed: 0,
      };
      // backfill for runs saved before foodHoarded existed
      if (pg.ledger.foodHoarded === undefined) pg.ledger.foodHoarded = 0;
      return pg.ledger;
    },
    // LEDGER EVENTS (coherence audit 2026-10-14; Steve: "Yes, all of them"
    // count toward the ending). Hierarchy, titans, comms, village agency,
    // membership and pods call ledgerAdd(system, 'kind:detail') with a STRING
    // payload — 51 such writes were silently dropped because `system` isn't a
    // dimension. Now each event is logged (pg.ledgerEvents, capped) and its
    // kind is translated into the real dimensions below. Kinds with no clear
    // meaning stay log-only ({}), never guessed.
    LEDGER_EVENT_DIMS: {
      hierarchy: {
        'counter': { brokerage: 1 }, 'linked': { brokerage: 1, unified: 1 },
        'regional-dawn': { unified: 1 }, 'tended': { protected: 1 },
        'revolt': { fractured: 1 }, 'broke': { fractured: 1 },
        'primacy': { brokerage: 1 }, 'succession-grace': { unified: 1 },
        'renegotiated-gift': { brokerage: 1 }, 'renegotiated-visit': { brokerage: 1 },
        'renegotiation-lapsed': { fractured: 1 }, 'national-lost': { fractured: 1 },
        'national-beat-died': { fractured: 1 }, 'national-live': { unified: 1 },
        'global-declined': { defiance: 1 }, 'scale-refused': { defiance: 1 },
        'peer-counter': { brokerage: 1 }, 'peer': { brokerage: 1 },
        'trade-call': { brokerage: 1 }, 'favor-sent': { brokerage: 1 },
        'defense-sent': { protected: 2 }, 'defense-refused': { fractured: 1 },
        'crisis-conceded': { fractured: 1 }, 'raid-mustered': { might: 1 },
        'yielded': { might: 1 }, 'conquered': { might: 2 },
      },
      titan: { 'commit-own': { might: 1 }, 'turned': { fractured: 1 }, 'slew': { might: 3, protected: 2 } },
      comms: { 'aid-arrived': { brokerage: 1 } },
      villageAgency: {
        'petition-accepted': { protected: 1, unified: 1 }, 'aid': { foodShared: 1, brokerage: 1 },
        'beg-gave': { foodShared: 1 }, 'beg-refused': { foodHoarded: 1 },
        'raid-fought': { might: 1, protected: 1 },
      },
    },
    ledgerAdd(dim, n) {
      try {
        const L = this.ledger();
        if (typeof n === 'string') {
          const pg = this.progState();
          pg.ledgerEvents = pg.ledgerEvents || [];
          const day = ((this.state && this.state.scholar) || {}).day || 0;
          pg.ledgerEvents.push({ sys: dim, ev: n, day });
          if (pg.ledgerEvents.length > 400) pg.ledgerEvents.splice(0, pg.ledgerEvents.length - 400);
          const kind = n.split(':')[0];
          const map = (this.LEDGER_EVENT_DIMS[dim] || {})[kind];
          if (map) for (const d of Object.keys(map)) this.ledgerAdd(d, map[d]);
          return;
        }
        if (dim in L) {
          const before = L[dim] || 0;
          L[dim] = before + n;
          // the world reacts: threshold beats, knowledge-gated
          try { this._checkDimBeats(dim, before, L[dim]); } catch (e) {}
        }
      } catch (e) {}
    },

    // ---------- THE FRAME ----------
    // Computed from the sum of play. Ties break toward the more distinctive
    // frames; a quiet game returns 'unwritten'.
    endingFrame() {
      const L = this.ledger();
      const total = Object.values(L).reduce((a, b) => a + b, 0);
      if (total < 6) return 'unwritten';
      const scores = {
        indispensable: L.might + L.brokerage + L.foodShared * 2 + L.unified,
        feared: L.might * 2 + L.killed * 2 + (L.betrayed || 0),
        beloved: L.showmanship * 2 + L.protected * 2 + L.brokerage + L.unified,
        witness: L.exposed * 3 + L.defiance,
        defiant: L.defiance * 3 + L.might * 0.5,
        assimilated: Math.max(0, L.embrace * 3 - L.defiance * 2),
      };
      const order = ['witness', 'beloved', 'indispensable', 'defiant', 'feared', 'assimilated'];
      let best = 'assimilated', bs = -1;
      for (const k of order) { if (scores[k] > bs) { bs = scores[k]; best = k; } }
      return best;
    },
    leadershipEpithet() {
      const f = this.endingFrame();
      if (f === 'unwritten') return 'the Unknown';
      return (FRAMES[f] || {}).name || 'the Unknown';
    },

    // ---------- VISIBILITY (not numbers — the world reacting) ----------
    // Every ~12 days, the world tells you who you're becoming.
    ledgerBeat() {
      const s = this.state.scholar, pg = this.progState();
      if ((s.day || 0) < 12) return;
      if ((pg.lastLedgerBeat || 0) + 12 > (s.day || 0)) return;
      pg.lastLedgerBeat = s.day || 0;
      const ep = this.leadershipEpithet();
      if (ep === 'the Unknown') return;
      const f = this.endingFrame();
      const flavor = {
        feared: 'The show\'s narration lingers on your hands.',
        beloved: 'Strangers ask for your blessing. You don\'t know what to do with that.',
        indispensable: 'Other villages send envoys now. They need what you know.',
        witness: 'People bring you their suspicions, written down. You keep every one.',
        defiant: 'The System\'s messages have gotten... careful around you.',
        assimilated: 'The overlay feels like home. That should probably worry you.',
      }[f] || '';
      const vname = this.distantVillageName ? this.distantVillageName() : 'the outer villages';
      // "if you don't know, it doesn't show": you hear the SHAPE of your
      // legend before you hear the name. The name arrives when others have
      // talked about you (gossip beats, viewership, broadcasts).
      const heard = this.hearsAboutSelf();
      this.say(`◈ WORD TRAVELS — riders from ${vname} bring talk of Haven. ${heard ? `Out there they call you ${ep}. ` : `They describe someone who sounds like you — but the name hasn't reached you yet. `}${flavor}`);
      // the contest: standings every so often. Notability is ratings.
      try {
        if (this.state.systemArrived && (s.day || 0) % 24 < 12) {
          const rows = this.contestStandings();
          const place = rows.findIndex(r => r.us) + 1;
          const leader = rows[0];
          this.say(`📊 THE STANDINGS — Haven sits ${place}${place === 1 ? 'st' : place === 2 ? 'nd' : place === 3 ? 'rd' : 'th'} of ${rows.length}. ${leader.us ? 'Haven leads. The audience has a favorite, and it\'s you.' : `${leader.name} leads — the audience loves them today. One season. Every village is playing.`}`);
        }
      } catch (e) {}
      try { this.save(); } catch (e) {}
    },
    distantVillageName() {
      try {
        const ovs = this.state.otherVillages || [];
        if (ovs.length) return ovs[Math.floor(R() * ovs.length)].name || 'the outer villages';
      } catch (e) {}
      return 'the outer villages';
    },

    // ---------- THRESHOLD BEATS — the ending written in real time ----------
    // The queue + firing machinery for LEDGER_BEATS. Beats fire from
    // ledgerAdd (immediate when the gate passes) or wait in pg.ledgerQueue
    // until flushLedgerBeats (endDay) when the world catches up.
    _beatsFired() {
      try { const pg = this.progState(); pg.ledgerBeatsFired = pg.ledgerBeatsFired || {}; return pg.ledgerBeatsFired; }
      catch (e) { return {}; }
    },
    _beatQueue() {
      try { const pg = this.progState(); pg.ledgerQueue = pg.ledgerQueue || []; return pg.ledgerQueue; }
      catch (e) { return []; }
    },
    _beatGate(kind) {
      // "if you don't know, it doesn't show" — per-kind visibility.
      try {
        if (kind === 'gossip' || kind === 'lived' || kind === 'witness') return true;
        if (kind === 'system') return this.integrationStage ? this.integrationStage() >= 1 : false;
        if (kind === 'show') {
          const v = this.state.village || {};
          const vw = v.viewership == null ? this.havenViewership() : v.viewership;
          if (vw >= 12) return true;
          const b = this.progState().broadcast;
          if (b && b.length) return true;
          return false;
        }
      } catch (e) {}
      return kind !== 'system' && kind !== 'show';
    },
    _fireBeat(dim, idx) {
      try {
        const beat = (LEDGER_BEATS[dim] || [])[idx];
        if (!beat) return;
        const fired = this._beatsFired();
        const key = dim + ':' + idx;
        if (fired[key]) return;
        fired[key] = true;
        const pg = this.progState();
        let text = beat.text(this);
        if (beat.kind === 'gossip' && !pg.selfTalkedAbout) {
          // the first time you overhear yourself as a story: that's the
          // moment you learn you have a legend. It gets framing.
          pg.selfTalkedAbout = true;
          text = 'You overhear it at the fire, and stop pretending not to listen. ' + text;
        }
        this.say(text);
        pg.legendBeats = pg.legendBeats || [];
        pg.legendBeats.push({ day: (this.state.scholar || {}).day || 0, kind: beat.kind, dim, text });
        pg.legendBeats = pg.legendBeats.slice(-40);
      } catch (e) {}
    },
    _checkDimBeats(dim, before, after) {
      try {
        const beats = LEDGER_BEATS[dim] || [];
        if (!beats.length) return;
        const fired = this._beatsFired();
        const q = this._beatQueue();
        for (let i = 0; i < beats.length; i++) {
          const key = dim + ':' + i;
          if (fired[key]) continue;
          if (before < beats[i].at && after >= beats[i].at) {
            // COMBAT DEFERRAL (journey establishment r26 2026-10-22): a legend
            // beat crossing mid-fight would narrate the haven fire ("You overhear
            // it at the fire...") while the player fights for their life. Queue
            // it for the endDay flush instead — the fire is where the fiction
            // says it happens. The queue + flushLedgerBeats machinery already
            // exists for gated beats; combat just borrows it.
            const inCombat = !!(this.tbfight && !this.tbfight.over);
            if (this._beatGate(beats[i].kind) && !inCombat) this._fireBeat(dim, i);
            else if (!q.some(e => e.k === key)) {
              q.push({ k: key, dim, idx: i });
              if (q.length > 12) q.shift();
            }
          }
        }
      } catch (e) {}
    },
    flushLedgerBeats() {
      // beats whose gates failed wait here. The world catches up and the
      // beat lands late, not never. Called every endDay.
      try {
        const q = this._beatQueue();
        for (let i = q.length - 1; i >= 0; i--) {
          const e = q[i];
          const beat = (LEDGER_BEATS[e.dim] || [])[e.idx];
          if (!beat || this._beatsFired()[e.k]) { q.splice(i, 1); continue; }
          if (this._beatGate(beat.kind)) { q.splice(i, 1); this._fireBeat(e.dim, e.idx); }
        }
      } catch (e) {}
      return null;
    },
    // You don't see your own legend until others talk about you. Gossip
    // beats set it; high viewership or a seen broadcast counts too.
    hearsAboutSelf() {
      try {
        const pg = this.progState();
        if (pg.selfTalkedAbout) return true;
        const v = this.state.village || {};
        const vw = v.viewership == null ? this.havenViewership() : v.viewership;
        if (vw >= 12) return true;
        if (pg.broadcast && pg.broadcast.length) return true;
      } catch (e) {}
      return false;
    },
    hearGossipAboutSelf(source) {
      // UNWIRED (sibling-sweep 2026-10-08): nothing calls this — the moment
      // the player learns they have a legend never fires. hearsAboutSelf()
      // gate below stays closed.
      try {
        const pg = this.progState();
        if (!pg.selfTalkedAbout) {
          pg.selfTalkedAbout = true;
          this.say(`You overhear ${source || 'riders at the fire'} talking about you — and stop pretending not to listen. Out there, you are becoming a story.`);
        }
      } catch (e) {}
      return null;
    },
    legendSurface() {
      // The story so far, AS THE WORLD TELLS IT — only beats whose
      // knowledge gates already passed. UNWIRED (sibling-sweep 2026-10-08):
      // nothing renders this yet — no Codex legend page calls it.
      // Never show raw ledger numbers; the numbers are not the story.
      try { return (this.progState().legendBeats || []).slice(); }
      catch (e) { return []; }
    },

    // ---------- UNITY — a felt state, not a number ----------
    // unified/fractured resolve to a tier the player lives inside.
    // Transitions narrate themselves, direction-aware, always visible.
    unityState() {
      try {
        const L = this.ledger();
        const diff = (L.unified || 0) - (L.fractured || 0);
        for (const t of UNITY_TIERS) if (diff >= t.min) return { key: t.key, label: t.label, diff };
      } catch (e) {}
      return { key: 'holding', label: 'Holding together', diff: 0 };
    },
    _checkUnityTransition() {
      // big swings walk every tier they cross, direction-aware — no
      // teleporting from "two hearths" to "as one" without the road between.
      try {
        const pg = this.progState();
        const cur = this.unityState().key;
        const prev = pg.unityTier;
        if (!prev) { pg.unityTier = cur; return; } // first read: silent baseline
        if (prev === cur) return;
        const order = UNITY_TIERS.map(t => t.key);
        const from = order.indexOf(prev), to = order.indexOf(cur);
        if (from < 0 || to < 0) { pg.unityTier = cur; return; }
        const improving = to < from;
        const step = improving ? -1 : 1;
        pg.unityTier = cur;
        for (let i = from + step; improving ? i >= to : i <= to; i += step) {
          const tier = UNITY_TIERS[i] || {};
          const text = improving ? tier.better : tier.worse;
          if (text) this.say('◈ HAVEN — ' + text);
        }
        const dest = UNITY_TIERS[to] || {};
        try { this.recordMoment('Haven feels ' + String(dest.label || cur).toLowerCase() + '.'); } catch (e) {}
      } catch (e) {}
    },

    // ---------- THE FOOD TRUTH — sharer, even, hoarder ----------
    // foodShared vs foodHoarded resolve to a stance with social
    // consequences. The stance transition IS the consequence.
    foodStance() {
      try {
        const L = this.ledger();
        const s = L.foodShared || 0, h = L.foodHoarded || 0;
        const key = s >= h + 6 ? 'sharer' : (h >= s + 6 ? 'hoarder' : 'even');
        return { key, shared: s, hoarded: h };
      } catch (e) { return { key: 'even', shared: 0, hoarded: 0 }; }
    },
    _checkFoodStance() {
      try {
        const pg = this.progState();
        const cur = this.foodStance().key;
        const prev = pg.foodStanceKey;
        if (!prev) { pg.foodStanceKey = cur; return; }
        if (prev === cur) return;
        pg.foodStanceKey = cur;
        const st = FOOD_STANCES[cur];
        if (st && st.enter) {
          this.say('◈ FOOD TRUTH — ' + st.enter);
          try { this.recordMoment('The village has decided what kind of keeper you are.'); } catch (e) {}
        }
      } catch (e) {}
    },
    shareFood(kcal, toName) {
      // WIRED 2026-10-11 (journey-endgame r3): deliberate gifts call this —
      // donateToPantry (game.js), giveFood (game.js base + carexplore.js
      // override). The automatic homecoming pool split is NOT wired: "We
      // pool food here" is the standing custom, and norms don't move the
      // moral ledger — otherwise 'sharer' would be automatic and the
      // channel meaningless. The inward half works: teaching writes
      // foodShared via ledgerAdd (progression.js).
      try {
        kcal = kcal || 0;
        if (kcal < 200) return null; // not a real gift (matches the generous-XP bar)
        const n = Math.max(1, Math.round(kcal / 1000));
        this.ledgerAdd('foodShared', n);
        // the village remembers feasts, not crumbs: moments cap at 30 and
        // each one nudges viewership +1 — a moment per gift would flood the
        // feed and inflate fame. Threshold beats (5/12/20) and the stance
        // transitions carry the felt weight of smaller gifts.
        if (kcal >= 1000) {
          try { this.recordMoment(`Shared food outward${toName ? ' — ' + toName : ''}.`); } catch (e) {}
        }
      } catch (e) {}
      return null;
    },
    hoardFood(kcal) {
      // WIRED 2026-10-14: takeFromPantryBulk's net-taker hoard detector
      // (game.js) calls this. The one-unit takeFromPantry path does not. Deliberately quiet —
      // no broadcast, no moment.
      try {
        const n = Math.max(1, Math.round((kcal || 500) / 1000));
        this.ledgerAdd('foodHoarded', n);
      } catch (e) {}
      return null;
    },

    // ---------- EXPOSED — truths have consequences ----------
    // Called from the exposeBribery wrap on success. The bribe is already
    // public at the moot; this is the part people LIVE with: names named,
    // eyes avoided, the village remembering the way it remembers winters.
    exposeFallout(caseId, voterId) {
      try {
        // named when the case data is at hand; the generic nouns are
        // deliberate when it isn't — "someone" would read as a bug.
        let briberLine = `The one who paid doesn't meet your eye anymore.`;
        let boughtLine = `The one who was bought has gone quiet around the fire.`;
        let crimeLine = `someone tried to buy a voice`;
        let momentLine = null;
        try {
          const c = this.getCase ? this.getCase(caseId) : null;
          const b = c && (c.bribes || []).find(x => x.voter === voterId);
          if (b) {
            const bn = this.displayName(b.by).split(' ')[0];
            const vn = this.displayName(b.voter).split(' ')[0];
            briberLine = `${bn} doesn't meet your eye anymore.`;
            boughtLine = `${vn}'s friends have gone quiet around the fire.`;
            crimeLine = `${bn} tried to buy a voice${b.amount ? ` — ${b.amount} kcal changed hands` : ''}`;
            momentLine = `Exposed: ${bn} bought ${vn}.`;
          }
        } catch (e) {}
        this.say(`⚖️ ${briberLine} ${boughtLine}`);
        this.say(`The village will remember this the way it remembers winters: ${crimeLine}. It didn't stay secret.`);
        try { this.recordMoment(momentLine || 'Exposed a bought voice at the moot.'); } catch (e) {}
      } catch (e) {}
      return null;
    },


    // ---------- THE TABLE (2026-10-11: the scene moved to table.js) ----------
    // The old single-choice stub lived here; the integrated endgame (7 paths
    // × light/dark, pricing, deed-gate re-check at dawn) is now tableScene()
    // in src/js/table.js, which this file's endDay wrap calls at dawn.
    // The deed-gate re-check (stale tableWaiting withdrawn aloud) lives there.


    // ---------- LINEAGE (the village's own remembered dead) ----------
    // Steve's correction: NO cross-run inheritance. The Codex spans one
    // contest — one village, one season. But the village remembers its own
    // mantle-bearers. That's the scholar-mantle fiction: each death, another
    // adventurer assumes the mantle. Same village. Same book.
    lineage() {
      try { const pg = this.progState(); pg.lineage = pg.lineage || []; return pg.lineage; }
      catch (e) { return []; }
    },
    recordLegend(info) {
      try {
        const pg = this.progState();
        if (pg.legendRecorded) return;
        pg.legendRecorded = true;
        const s = this.state.scholar;
        const char = (this.data.villagers || []).find(v => v.id === this.villagerId) || {};
        this.lineage().push({
          name: char.name || 'Someone',
          villagerId: this.villagerId,
          epithet: this.leadershipEpithet(),
          frame: (info && info.frame) || this.endingFrame(),
          choice: (info && info.choice) || null,
          outcome: (info && info.outcome) || (this.won ? 'haven-endures' : 'died'),
          day: s.day || 0,
          at: Date.now(),
        });
      } catch (e) {}
    },

    // ---------- THE MANTLE PASSES ----------
    // The village is the protagonist. When the bearer dies, the story does
    // NOT reset: the village mourns, someone steps up, the Codex notes the
    // changing of the mantle. Same village, same arc, same Codex, same
    // leadership vector — a new face. The only game overs: the village
    // achieves its ending (the table), or the village dies out.
    playerDeath(cause) {
      // WALK PURGE (break-it travel r10 2026-10-10): a death mid-walk left
      // MoveAnim's in-memory step queue draining — the mantle passes (over
      // stays false), so the queued path steps kept executing and walked the
      // NEW bearer on the dead player's intent, charging the new body. Death
      // ends the walk, full stop. Guarded: the animator is UI-side and absent
      // in node harnesses.
      try { if (typeof Scattering !== 'undefined' && Scattering.MoveAnim) Scattering.MoveAnim.stopAll(); } catch (e) {}
      // AUDIO (Steve 2026-10-12): the story pauses — your heartbeat, slowing,
      // stopping. The choke point for every player death (combat, contest,
      // expedition, pit trap, hunt), so non-combat deaths are no longer silent.
      try { this.audioEvent('playerDeathSting'); } catch (e) {}
      const s = this.state.scholar, v = this.state.village;
      // The animal belongs to the place, not the office. Use the same parking
      // rule as ordinary travel before the successor is moved into the hall.
      // Legacy indoor aliases are invalid, so never park those inside Haven.
      const animalTile = s.animal && this.map ? this.playerTile() : null;
      if (s.animal && !s.insideHaven && animalTile) animalTile.animal = s.animal;
      s.animal = null;
      const oldId = this.villagerId;
      const oldChar = (this.data.villagers || []).find(x => x.id === oldId) || {};
      const oldName = oldChar.name || 'the scholar';
      const oldFirst = oldName.split(' ')[0];
      // DEATH PACK (Steve 2026-10-09): the body keeps what it carried.
      // Non-sentimental inventory + equipped gear goes on the corpse as the
      // lootable death pack (take, leave, or use per item — nothing
      // auto-transfers). SENTIMENTALS DIE WITH THE OWNER: keepsakes are
      // buried with the body — never placed on the corpse, never lootable.
      let gearPack = [];
      try {
        const defs = {}; (this.data.items || []).forEach(i => { defs[i.id] = i; });
        const carried = (s.inventory || []).slice();
        const worn = [];
        try {
          const eq = s.equipped || {};
          for (const slot of Object.keys(eq)) {
            const e = eq[slot];
            if (e && (e.itemId || e.id)) worn.push(e);
          }
        } catch (e2) {}
        const seen = new Set();
        for (const it of carried.concat(worn)) {
          if (!it) continue;
          // DEATH-PACK DUPE (journey-succession r10 2026-10-12): the old
          // dedupe keyed on itemId, so carrying TWO of the same thing (a
          // stone knife in hand, a stone knife in the pack) silently
          // DESTROYED the second — the body didn't keep what it carried
          // (Steve 2026-10-09 loot-as-action law). Dedupe by object
          // identity instead: the same object listed twice (worn AND
          // carried) still packs once; two distinct copies both ride home.
          if (seen.has(it)) continue;
          seen.add(it);
          const gid = it.itemId || it.id;
          const def = (gid && defs[gid]) || {};
          // Only SENTIMENTALS die with them (corpses.js rule). A bonded tool is
          // still stuff: the bond doesn't transfer (this entry carries none),
          // the object does (audit 2026-10-14).
          if (it.sentimental || def.class === 'sentimental') continue; // dies with them
          gearPack.push({
            itemId: gid || it.name, name: it.name || def.name || gid || 'something',
            units: it.units || 1,
            kg: it.kg != null ? it.kg : (def.kg != null ? def.kg : 0.3),
            kcalEach: 0, spoilDay: 9999,
            prep: 'Theirs. Take it, leave it, or use it — the village watches.',
          });
        }
        s.inventory = [];
        s.equipped = {};
      } catch (e) {}
      // THE VILLAGE BRINGS ITS BEARER HOME (journey-succession r9
      // 2026-10-12): "Somebody else starts digging" was a fiction lie —
      // nobody ever dug: buried=true was reachable ONLY through the
      // player's own Bury button, so the bearer's corpse rotted where it
      // fell while eleven grieving villagers never lifted a spade. Now the
      // village recovers the body overnight (see recoverBearer, fired from
      // endDay): the grave is dug by the fire, the burial itself stays the
      // successor's act. Loot-as-action is untouched — the death pack rides
      // home ON the corpse, take/leave/use per item, nothing auto-transfers.
      // PLAYER-DEATH ATTRIBUTION (scale-wall r17 2026-10-13): this IS the
      // scholar's death — mark it player:true so the death telemetry carries
      // a player-kind record (the sampler keys 'player:<cause>'). Gameplay-
      // identical by construction: kind stays 'villager', so every corpse /
      // grief / gossip / funeral / audio gate in registerDeath behaves
      // exactly as before — the flag rides ONLY into the tele() record.
      try {
        const rc = this.registerDeath({ kind: 'villager', villagerId: oldId, name: oldName, mx: s.mx, my: s.my, cause: cause || 'the wild', killerId: null, items: gearPack, player: true });
        if (rc && rc.id) {
          v.pendingBurials = v.pendingBurials || [];
          v.pendingBurials.push({ corpseId: rc.id, villagerId: oldId, name: oldName, day: s.day || 0 });
        }
      } catch (e) {}
      // MEMORIALIZED (Steve 2026-10-05): the death is narrated AND recorded.
      // registerDeath makes the corpse; village.fallen is the memorial roll —
      // without this push the mantle transfer left no record the scholar died.
      try {
        v.fallen = v.fallen || [];
        v.fallen.push({ villagerId: oldId, day: s.day || 0, cause: cause || 'the wild', name: this.fallenName(oldId) });
      } catch (e) {}
      try { this.removeVillager(oldId, 'killed'); } catch (e) {}
      // (rogue P1 2026-10-22: the dead bearer's dominant playstyle axis is
      // filed here — the village remembers who led how. The new bearer's own
      // record starts empty; see NEW BODY, NEW RECORD below.)
      this.lineage().push({ name: oldName, villagerId: oldId, epithet: this.leadershipEpithet(), day: s.day || 0, cause: cause || 'the wild', playstyle: (typeof this.dominantPlaystyle === 'function' ? this.dominantPlaystyle() : null) });
      this.say(`🕯️ ${oldName} is dead — ${cause || 'the wild'}. The village stops. Somebody screams. Somebody else starts digging.`);
      // DEATH ENDS THE CAMP (break-it camps-3 2026-10-08): the mantle passes
      // the office, not the claimed patch. A camp is its keeper's claim — the
      // keeper is dead, so the claim lapses: the camp's fires die with it
      // (same honesty as the wreck paths), the new bearer is NOT inside the
      // old tent (no phantom room: tentRoomScreen keys off insideTent alone),
      // and no pending breach follows them to Haven. The pitched tent itself
      // STANDS — the expedition's canvas, still sec.yours; walk back and
      // reclaim it. Placed here, before the successor is chosen, so even a
      // later throw can't leave the stale room behind.
      try {
        if (s.insideTent) { s.insideTent = null; s.tentSmoke = 0; }
        this.pendingEncounter = false; this.pendingMonsterId = null; this.pendingInTent = false;
        // RAID-PROVENANCE (sim-raidname-fix-b): succession ends
        // the pending — its shadow dies with it, never
        // stale-matches a later same-species fight.
        this.raidPendingMonsterId = null;
        // SANCTUARY (design call 3, Steve 2026-10-16): the door-flee stash is
        // the DEAD bearer's — it must not re-engage the successor through the
        // fire. Backfill legacy untagged entries with the dead bearer, and
        // name the treeline wait honestly: the killer doesn't vanish
        // (monsters wait — Steve 2026-10-05), it falls back outside the walls
        // and holds there. It meets the new bearer when they leave Haven
        // (treelineAmbush in travelTo), never at the hall door.
        try {
          const dw = this.state.doorFledMonsters;
          if (Array.isArray(dw) && dw.length) {
            for (const m of dw) { if (m && m.bearer == null) m.bearer = oldId; }
            const claimed = dw.filter(m => m && m.bearer === oldId && m.id);
            if (claimed.length) {
              const names = [...new Set(claimed.map(m => {
                try { return this.monsterDisplayName(m.id) || 'something'; } catch (e2) { return 'something'; }
              }))];
              this.say(`🌲 Something still paces the treeline beyond the walls — ${names.join(', ')} — waiting for a dead ${oldFirst}. It doesn't come in. The walls end the argument. (Haven is sanctuary. It'll still be out there when the new bearer leaves.)`);
            }
          }
        } catch (e2) {}
        const c = this.state.camp;
        if (c) {
          // COLD-PIT HONESTY (break-it camps R10 2026-10-10): same class as
          // breakCamp's destroyed path — the fire may already have burned
          // down while the tents stood. Name it gone cold only when the
          // camp's end actually killed a live flame.
          const firesKilled = this.killCampFires(c.px, c.py);
          let place = 'the wild';
          try { place = this.nodeEpithet(c.px, c.py) || place; } catch (e) {}
          delete this.state.camp;
          this.say(`The camp at ${place} has no keeper now — ${firesKilled > 0 ? "the fire's gone cold" : "the fire was already cold"}. The tent still stands, if anyone walks back for it.`);
        }
      } catch (e) {}
      // DEATH ENDS THE JOIN (drifter break-it r3 2026-10-08): the join was the
      // dead bearer's probation, not the office. The successor is chosen from
      // the home village's roster and wakes in its hall — not as another
      // fire's probationer. Release the joined village's seat (otherwise it
      // feeds a phantom mouth in every simVillageDay forever) and clear the
      // join state. (Exile-mantle semantics — whether s.exiled passes to the
      // successor — belong to the exile flow, not the join; untouched here.)
      try {
        const jvId = s.joinedVillage;
        if (jvId) {
          const jv = (this.state.otherVillages || []).find(x => x.id === jvId);
          if (jv) jv.population = Math.max(0, (jv.population || 1) - 1);
          s.joinedVillage = null;
        }
        s.probation = null;
      } catch (e) {}
      // the new bearer wakes INSIDE the hall, like a new game — insideHaven
      // left undefined would read as grounds (havenStoresAccess: 'none'),
      // stranding the successor with no pantry until they find the door.
      s.insideHaven = true;
      // DRAMA (Steve 2026-10-07, Round C2): the death is a moment — fade to black,
      // soul rises. The Oversight's tone: the story continues. (Gated by systemArrived inside Game.drama.)
      try { this.drama('playerDeath', s.mx, s.my, oldName, cause || 'the wild'); } catch (e) {}
      // successor: the village chooses. Trust decides.
      let candidates = [];
      try { candidates = this.npcIds(); } catch (e) {}
      if (!candidates.length) {
        this.over = true; this.villageLost = true; this.won = false;
        this.say('No one is left to pick up the Codex. The village dies out — quietly, the way villages do. The season ends here.');
        this.recordLegend({ outcome: 'village-lost' });
        // DEAD RUNS ARE WIPED (break-it persistence 2026-10-08): without this,
        // the last autosave survived a village-lost death — Continue resurrected
        // a dead run (load() resets over=false). Every other death path wipes.
        try { this.wipe(); } catch (e) {}
        return;
      }
      const trust = (v.trust || {});
      candidates.sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
      const newId = candidates[0];
      const newChar = (this.data.villagers || []).find(x => x.id === newId) || {};
      const newName = newChar.name || 'someone';
      const newFirst = newName.split(' ')[0];
      // "you're not her." — the village reacts to the change.
      // DEAD NEVER SPEAK (weirdness hunt 2026-10-10): the old pick read the
      // unpruned trust map, so a corpse could deliver the "you're not her"
      // line. Only the living roster can look at you.
      const liveRoster = new Set(v.roster || []);
      const closeId = Object.keys(trust).filter(id => id !== newId && liveRoster.has(id) && (trust[id] || 0) > 55)
        .sort((a, b) => (trust[b] || 0) - (trust[a] || 0))[0];
      if (closeId) {
        const cn = ((this.data.villagers || []).find(x => x.id === closeId) || {}).name || 'Someone';
        this.say(`"${oldFirst}'s gone." ${cn.split(' ')[0]} looks at you for a long moment. "You're not ${oldFirst}." No heat in it. Just fact. You'll have to earn this face.`);
      }
      // THE MANTLE'S METAPHOR IS GATED BY INTEGRATION (Steve): pre-System
      // the Codex is a physical journal — pen and paper, "keep writing" is
      // honest. Post-System it's digital — no pen, no paper. The Codex
      // doesn't get picked up anymore; it syncs, all at once, to the new
      // bearer. The moment deserves the beat, not a UI blip.
      try {
        const stage = this.integrationStage ? this.integrationStage() : 0;
        if (stage >= 1) {
          this.say(`The Codex doesn't pause for grief. ${newFirst} blinks — and it's already there, overlaying everything, syncing. No pen. No paper. The mantle just... transfers.`);
        } else {
          this.say(`${newFirst} picks up the journal. Their hands shake. Then they open it, and keep writing.`);
        }
      } catch (e) {
        this.say(`${newFirst} picks up the Codex. Their hands shake. Then they open it, and keep writing.`);
      }
      this.villagerId = newId;
      // SUCCESSOR'S OWN KIT (Steve 2026-10-09): the dead bearer's gear stays
      // on the corpse — the new bearer starts from their own belongings, not
      // an auto-transfer of the old inventory.
      // YOU BECOME THAT VILLAGER (Steve 2026-10-14: "No I don't think you
      // should take your XP or the abilities. You become that villager."):
      // their own abilities, tracks, XP, skills, knowledge and gear; what
      // they wore stays worn (villager-build.js mantleBecome lists each field).
      try {
        if (typeof this.mantleBecome === 'function') this.mantleBecome(oldId, newId);
        // KEEPSAKE GROWTH (Steve 2026-10-14): the successor's keepsakes start
        // worn in free accessory slots, like a new run's (keepsakes.js).
        delete s.ksGrowthV;
        if (typeof this.migrateKeepsakes === 'function') this.migrateKeepsakes();
      } catch (e) { console.warn('[mantle] successor kit', e); }
      // NEW BODY, NEW RECORD (rogue P1 2026-10-22): the playstyle axes, the
      // practiced stats and the earned passives are the OLD body's personal
      // record — "the game notices who you are" was THEIR behavior, "the work
      // is changing you" was THEIR work (Steve 2026-10-14: "You become that
      // villager"). The successor wakes as their own person: no borrowed
      // habits, and a body that remembers ITS trade (occupationStatBonuses),
      // not the dead bearer's practiced body. The dead bearer's dominant axis
      // is filed in the lineage entry above — the village remembers who led
      // how; the new bearer <redacted> how THEY do. Office-layer playstyle readers
      // (relic-enhancement affinity, the leadership notice) now re-segment on
      // the new bearer <redacted> they act.
      try {
        s.playstyle = {};
        s.practice = {};
        s.passives = {};
        s.stats = { str: 5, end: 5, per: 5, agi: 5, pre: 5 };
        const occCat = (typeof this.occCategory === 'function')
          ? this.occCategory(newChar.formerOccupation) : 'service';
        const sb = (typeof this.occupationStatBonuses === 'function')
          ? this.occupationStatBonuses(occCat) : {};
        for (const [k, v] of Object.entries(sb)) s.stats[k] = 5 + v;
      } catch (e) { console.warn('[mantle] new-body record', e); }
      // MANTLE IDENTITY SYNC (break-it persistence 2026-10-08): the scholar
      // record kept the DEAD bearer's id — the save index then listed the dead
      // villager as the expedition's scholar, saveKey drifted, and Light
      // Fingers' caught-stealing trust hit landed on a corpse. The save KEY
      // stays stable via state.runKey; this only fixes identity.
      s.villagerId = newId;
      // FRESH SOCIAL LEDGER (longsim scale-wall r8 2026-10-13, lever 5): the
      // takes/gives book is per-PERSON, and the successor's NPC-era communal
      // meals sat in v.takes[newId] as "mystery takes" under the new bearer's id
      // (r7) — the old cumulative bar read them as hoarding on day one. The
      // new face starts their own book: takes, gives, and the dated takeHist
      // all reset. (The office's trust transfers discounted just below — the
      // village remembers the office, not the meals. The freeload clock
      // v.freeload[newId] is intentionally untouched here: a known drain
      // becoming bearer is a design question for a future run, not this one.)
      try {
        if (v.takes) v.takes[newId] = 0;
        if (v.gives) v.gives[newId] = 0;
        if (v.takeHist) v.takeHist[newId] = [];
        if (v.giveHist) v.giveHist[newId] = []; // r9: the dated gives reset with the rest of the book
      } catch (e) {}
      // the mantle passes: the OFFICE is the village's (slots, arc,
      // integration, ledger, Codex). The body is new.
      // BLOOD-PRICE WOUND (break-it food r3 2026-10-08): the wound is the old
      // body's missing mass — a new body has no Price cuts. Without this the
      // successor inherited the dead bearer's open wound (reduced maxHealth
      // and an immediate "more scar than skin" refusal on a body that never
      // bled), contradicting "new body, no old afflictions" just below.
      s.bloodPriceWound = 0; s.bloodPriceDayPart = null; s.bloodPriceUses = 0;
      // NEW BODY, NEW BUDGETS (break-it abilities r5): body budgets are the
      // old body's, like the blood-price wound above -- the successor steps
      // up fresh (molt's shed cycle, second_wind's day, the day-part heals).
      // The office's progression (slots, arc, integration, ledger, Codex)
      // passes; the body's counters don't.
      s.moltWeek = null; s.moltUses = 0;
      s.secondWindDay = null; s.secondWindUses = 0;
      s.fieldMedDayPart = null; s.herbalDay = null; s.purifyDay = null;
      s.echoDay = null; s.timeSkipDay = null; s.screamDay = null;
      // SIBLING SWEEP: the feast buff is a metabolic state (the old body ate
      // the feast), and a mid-rage death must not hand the successor a live
      // rage (undying_fury reads rageActive.rounds). Both die with the body.
      try { delete s.feastBuff; } catch (e) {}
      // LONGSIM WINPATH R4: the feast's fire was the old body's — a beast
      // drawn by its smoke gives up and moves on with the mantle. Never
      // strand a pending feast-draw panel on the successor.
      try {
        const fd = s.feastDraw;
        if (fd && fd.monsterId && this.pendingEncounter && this.pendingMonsterId === fd.monsterId) {
          this.pendingEncounter = false;
          this.pendingMonsterId = null;
        }
        delete s.feastDraw;
      } catch (e) {}
      try { delete s.rageActive; } catch (e2) {}
      s.kcal = 1500;
      try { s.health = this.maxHealth(); } catch (e) { s.health = 100; }
      s.trauma = 10; // the shock of stepping up
      // STATUS EFFECTS (Steve 2026-10-07): new body, no old afflictions.
      s.statuses = []; s.diseases = []; s.poisons = [];
      // THE SENTENCE DIES WITH THE BEARER (journey-succession r24 2026-10-18):
      // the village's formal docket (justice stage, exile, crimes) was the
      // case against the DEAD bearer in the uprising-'lost' path already resets it
      // ("the crimes died with the criminal" — justice.js, brawler loop
      // 2026-10-08), but the exile-then-die-in-the-wild path never did: the
      // innocent successor woke with s.exiled still true and a live docket,
      // so the next justiceTick fired startVillageUprising('defied exile')
      // against someone who was never sentenced — while justiceExiled()
      // misfired the cold shoulders, the pantry denial, and the contest
      // gates on the new body. The village remembers socially (gossip, the
      // fallen roll, the lineage recorded above); the machinery stands down.
      // The exile-family flags (drifting, founding, exileStartDay) are the
      // old body's solo life — they end with it too.
      let _docketLive = false;
      try {
        const _j = this.justiceState ? this.justiceState() : null;
        if (_j) {
          _docketLive = !!(_j.exiled || (_j.stage || 0) >= 1 || ((_j.crimes || []).length > 0));
          // field list mirrors the uprising-'lost' reset (justice.js)
          _j.stage = 0; _j.exiled = false; _j.exileDay = null; _j.crimes = [];
          _j.confrontedBy = null; _j.confrontRefused = false; _j.pendingConfront = false;
          _j.mootDemanded = false; _j.silenceRefused = false; _j.amendsCredit = 0; _j.warned = false;
        }
        s.exiled = false; s.drifting = false; s.founding = null; s.exileStartDay = null;
      } catch (e) { console.warn('[mantle] docket reset', e); }
      s.mx = 4; s.my = 4;
      try {
        if (this.map) { this.map.px = this.state.village.px ?? 4; this.map.py = this.state.village.py ?? 4; }
      } catch (e) {}
      // background abilities are THEIRS — their past, their hands.
      // BREAK-IT abilities r6 2026-10-11: this read TWO wrong things --
      // this.data.occupations (the key is characterGen.occupations; the
      // stale path made occ {} forever) and newChar.occupation (runtime
      // villagers carry occupationId). Every successor since the bug was
      // born stepped up with ZERO background abilities -- "their past,
      // their hands" was a lie for every body after the first.
      try {
        const occ = (((this.data.characterGen || {}).occupations) || []).find(o => o.id === newChar.occupationId) || {};
        // ABILITY LANES (2026-10-14): occupations grant SKILLS only — the
        // new body's past is taught into the codex, never a slot.
        s.backgroundAbilities = [];
        if (typeof this.grantOccupationSkills === 'function') this.grantOccupationSkills(occ);
        // BREAK-IT abilities r6: a new body's background legs change --
        // activeSynergies was computed for the OLD body's legs. Recompute
        // or the successor keeps firing synergies for legs they never held
        // (and misses newly-completed ones).
        try { this.recomputeActiveSynergies(); } catch (e2) {}
      } catch (e) {}
      // The office passes (slots, integration, Codex); the build does not —
      // the new face brings their own abilities and tracks (mantleBecome).
      this.say('🌟 "MANTLE TRANSFER DETECTED. ...Oh! New face! Same job! Whole new set of tricks. We hardly noticed. (That is a lie. We noticed. The audience CRIED.)"');
      // UNIFIED TRACKS (2026-10-14): the mantle passing is System contact —
      // the strange track, on the successor's own record.
      try { if (this.noteDeed) this.noteDeed('mantle'); } catch (eT) { console.warn('[tracks] mantle deed', eT); }
      // DRAMA (Steve 2026-10-07, Round C2): bright emergence — a new scholar awakens.
      try { this.drama('newLife', newName); } catch (e) {}
      // MUSIC (Steve 2026-10-12): the mantle passes — a somber bell.
      try { this.audioEvent('stingSuccession'); } catch (e) {}
      this.say(`📖 The Codex turns a page: ${oldName}, ${this.pluralize(s.day || 0, 'day')}. The mantle passes to ${newName}.`);
      // ORIENTATION (journey-succession r12 2026-10-14): the handoff told the
      // player who they're NOT ("you're not Miriam") but never who they ARE —
      // a silent identity swap with a silent kit change (the background legs
      // are rebuilt above with no announcement). One beat names the new face:
      // age, former occupation, and the hands they inherit. The full backstory
      // lives on the char record; this is the waking-up line, not the bio.
      try {
        const pro = newChar.pro || 'they';
        // TEXT MODULE (rogue P0-2 2026-10-22): shared article + pronoun bundle.
        const poss = Text.proBundle(pro).Poss;
        const occName = newChar.formerOccupation ||
          ((((this.data.characterGen || {}).occupations) || []).find(o => o.id === newChar.occupationId) || {}).name ||
          'survivor';
        const art = Text.article(occName);
        // ORIENTATION-KIT (journey-succession r36 2026-10-21): backgroundAbilities
        // has been [] since the 2026-10-14 ability lanes (occupations grant
        // skills only, never slots), so this kit clause NEVER fired — the
        // handoff named the new face but never their hands, and the build
        // change (the fall) stayed silent in the fiction. Read the heir's
        // real kit: s.abilities was replaced by mantleBecome above with the
        // successor's own abilities (Steve 2026-10-14: "You become that
        // villager").
        const kit = (s.abilities || []).map(a => a.name || a.id).filter(Boolean);
        const kitClause = kit.length ? ` ${poss} hands know different work now: ${kit.join(', ')}.` : '';
        const ageClause = newChar.age ? `, ${newChar.age}` : '';
        this.say(`🪞 You wake up somebody else. ${newName}${ageClause} — ${art} ${occName}.${kitClause}`);
      } catch (e) { console.warn('[mantle] orientation', e); }
      // PATH SEGMENTATION (rogue P1 2026-10-22): the handoff names the new
      // face's hands (kit, above) — name their path too. recognizeClass
      // classifies from the kit mantleBecome just installed and narrates in
      // the System's own voice when the class CHANGES. When the class was
      // already recognized (carried from their villager record via npcGodpath
      // — no change, no narration), name it once here: the System had a word
      // for this one before the Codex came. Null until recognized
      // (knowledge-gated by godpath's classLine).
      try {
        const before = (typeof this.godpathClass === 'function') ? this.godpathClass('player') : null;
        const rec = (typeof this.recognizeClass === 'function') ? this.recognizeClass('player') : null;
        // A lapsed carried class counts as changed: recognizeClass narrates
        // its own "revises its notes" line, so the file-update line stays silent.
        const changed = !!(rec && (!before || before.lapsed || before.path !== rec.path || before.subclass !== rec.subclass));
        if (rec && !changed && typeof this.classLine === 'function') {
          const line = this.classLine('player');
          if (line) this.say(`◈ The System updates its file: the new bearer <redacted> "${line}." It had a word for this one before the Codex came.`);
        }
      } catch (e) { console.warn('[mantle] path line', e); }
      // THE SENTENCE DOESN'T CROSS THE GRAVE (journey-succession r24
      // 2026-10-18): when the docket was live at the death, name that the
      // sentence ended with the old body — otherwise the reset above is
      // silent and the successor never learns why the fire's wary hearing
      // is all that's left. Clean-docket deaths: silence, as before.
      try {
        if (_docketLive) {
          this.say(`The village's quarrel was with ${oldFirst} — and ${oldFirst} is dead. The sentence doesn't cross the grave. You're someone else now; the docket is empty, but the village remembers.`);
        }
      } catch (e) {}
      try { this.recordMoment(`${oldName} died. ${newFirst} picked up the Codex.`); } catch (e) {}
      // SUCCESSOR'S OWN GRIEF (journey-succession r23 2026-10-18): the
      // handoff never read the successor's personal bond with the dead
      // bearer (v.bonds, -100..100) — every successor woke up with the
      // same flat shock, whether they'd just lost their closest friend or
      // someone they couldn't stand. The bond is real measured history
      // (shared meals, deep talks, tended wounds). Close (v>=20 or depth>=1):
      // the grief gets named and weighs (+5 trauma — the shock plus the hole
      // where they were; the number is named, r22 precedent). Hostile
      // (v<=-20 or depth<=-1): the complexity gets named, the number doesn't
      // move — relief is honest, and so is the guilt about it. Neutral:
      // silence, as before — nothing to say.
      try {
        const _gb = this.bondGet ? this.bondGet(newId, oldId) : null;
        const _bv = (_gb && _gb.v) || 0, _bd = (_gb && _gb.depth) || 0;
        const _opro = (oldChar && oldChar.pro) || 'they';
        const _othem = _opro === 'she' ? 'her' : _opro === 'he' ? 'him' : 'them';
        const _otheir = _opro === 'she' ? 'her' : _opro === 'he' ? 'his' : 'their';
        if (_bv >= 20 || _bd >= 1) {
          s.trauma = (s.trauma || 0) + 5;
          this.say(`You knew ${oldFirst} — not the office, the person. The fire keeps expecting ${_othem}, and so do you. That's a heavier kind of stepping up. (+5 trauma)`);
        } else if (_bv <= -20 || _bd <= -1) {
          this.say(`You and ${oldFirst} never found easy ground. Now their office sits on your shoulders, and the fire will watch what you do with ${_otheir} name. Relief is honest. The guilt about the relief is honest too.`);
        }
      } catch (e) {}
      // MANTLE TRUST INHERITANCE (blitz-succession 2026-10-13): the old rule
      // (0.6x of the predecessor's single trust entry) compounded every
      // death — late-chain bearers inherited ~zero and started socially
      // bankrupt after a long line of successful successions. The village
      // remembers the OFFICE now, through three channels — none of them free:
      //   1. OFFICE RESIDUE (inherited trust fraction): 40% of the dead
      //      bearer's trust entry — the office's standing, discounted.
      //   2. ELDERS' VOUCHING: living villagers with trust >= 60 in the
      //      office vouch for the successor at the funeral (+4 each, capped
      //      +16). Vouching is EARNED — it exists only because the
      //      predecessor built real trust with real people through deeds
      //      (food, kept promises, fights). No allies, no vouching.
      //   3. THE SUCCESSOR'S OWN RECORD (deeds-carry): the successor's own
      //      trust entry as a villager — how they stood by the office —
      //      carries 40%. A loyal villager steps up with a head start; a
      //      hostile one starts behind.
      // The office gets a floor of 10 (a hearing); the person earns the rest.
      // (journey-succession 2026-10-11 fix preserved: only a MISSING entry
      // gets the 20 default — an explicit 0 stays 0, no free trust.)
      try {
        v.trust = v.trust || {};
        const office = (trust[oldId] == null ? 20 : trust[oldId]);
        const own = (trust[newId] == null ? 0 : trust[newId]);
        const vouchers = (v.roster || []).filter(id => id !== newId && liveRoster.has(id) && (trust[id] || 0) >= 60);
        const vouchBonus = Math.min(16, vouchers.length * 4);
        const inherit = Math.max(10, Math.min(100, Math.round(office * 0.4 + own * 0.4 + vouchBonus)));
        v.trust[newId] = inherit;
        if (vouchers.length) {
          const vnames = vouchers.slice(0, 3).map(id => {
            const ch = (this.data.villagers || []).find(x => x.id === id) || {};
            return (ch.name || 'Someone').split(' ')[0];
          });
          const extra = vouchers.length > 3 ? ` and ${vouchers.length - 3} more` : '';
          const verb = vouchers.length === 1 ? 'speaks' : 'speak';
          this.say(`At the grave, ${vnames.join(', ')}${extra} ${verb} for ${newFirst} — "${oldFirst} trusted them. We saw it. Give them the fire's hearing." The village listens.`);
        }
        // SUCCESSOR'S OWN RECORD (journey-succession r15 2026-10-16): the
        // inheritance formula's own-record term (own*0.4) was invisible in
        // the fiction — the handoff named only the dead bearer's trust in
        // them ("Cameron trusted them"), or nothing at all when nobody
        // vouched. When the successor stood real with the village as a
        // villager, say so: the fire knew these hands before the Codex came.
        if (own >= 40) {
          const spro = newChar.pro || 'they';
          const poss = spro === 'she' ? 'Her' : spro === 'he' ? 'His' : 'Their';
          const line = own >= 70
            ? `The fire knew ${newFirst} before the Codex did — ${poss.toLowerCase()} name already carried weight here.`
            : `The fire knew ${newFirst} — solid ground, earned at this fire.`;
          this.say(line);
        }
      } catch (e) {}
      // MANTLE HANDOFF RECORD (journey-succession 2026-10-11): the village is
      // the protagonist — conversational continuity must survive the bearer,
      // but HONESTLY. Threads, want-seeds, favors and memories planted with
      // the dead bearer are filed under the predecessor's name from here on (see
      // inheritedName() in conversation.js) — the new face never pretends
      // they were in the room. Obligations the dead bearer owed do not
      // transfer silently: an open promise is released (neither kept nor
      // broken — the promiser is dead; mirrors PROMISE RELEASE for dead NPCs
      // in betrayal.js) and its favor reverts to a live ask, so the NPC
      // re-asks the new bearer, naming the predecessor. The repay
      // seed references a promise that no longer exists — stale, deleted;
      // the need-flow re-asks honestly via the favor record.
      try {
        v.mantleOf = v.mantleOf || [];
        v.mantleOf.push({ from: oldId, fromName: oldName, to: newId, toName: newName, day: s.day || 0 });
        if (v.mantleOf.length > 12) v.mantleOf.shift();
        const pr = v.promises || {};
        const _releasedNow = [];
        for (const pid of Object.keys(pr)) {
          const p = pr[pid];
          if (!p || p.kept) continue;
          p.kept = 'released';
          p.inherited = true;
          _releasedNow.push(pid);
          try {
            const fav = (v.favorLedger || {})[pid];
            if (fav && fav.id === p.favorId && fav.state === 'promised') {
              if (pid === newId) {
                // PROMISEE-BEARER EDGE (journey-succession r27 2026-10-19):
                // the promisee inherited the mantle — the creditor cannot
                // re-ask themselves. The debt died with the debtor; the
                // favor goes moot (stamped, honest), not 'asked'. The need
                // itself persists in the world and other villagers will ask
                // fresh if it's still live. (Pre-fix this left an 'asked'
                // favor the new bearer holds against themselves — a zombie
                // ledger entry no NPC can ever re-ask.)
                fav.state = 'moot';
              } else {
                fav.state = 'asked';
              }
            }
          } catch (e2) {}
          try {
            const sd = (v.convoSeeds || {})[pid];
            if (sd && (sd.wantId === 'repay' || (sd.favorId && sd.favorId === p.favorId))) delete v.convoSeeds[pid];
          } catch (e3) {}
        }
        // THE OPEN BOOK (journey-succession r25 2026-10-18): the release
        // above is silent — the successor never learns what the dead bearer
        // owed. The ledger's designed beat (the NPC re-ask naming the
        // predecessor, convo-wants.js INHERITED ASK) proved nearly
        // unreachable in the r25 pilot (1/4 seeds: needs churn within days,
        // the want economy rarely selects ask_favor first). The office
        // inherits the KNOWLEDGE even though the obligation is released:
        // name the unkept promises once — asker and task — the promises died
        // with their maker (released, never broken: no dishonor), the needs
        // didn't. What the successor does about them is theirs. Clean books:
        // silence, as before.
        try {
          if (_releasedNow.length) {
            const bits = [];
            for (const pid of _releasedNow.slice(0, 3)) {
              const p = pr[pid] || {};
              // firstRef: knowledge-gated (true first name when known, else
              // the descriptor) — never split a descriptor on spaces.
              let who = 'someone';
              try { who = typeof this.firstRef === 'function' ? this.firstRef(pid) : (this.displayName(pid) || 'someone'); } catch (e4) {}
              const task = p.favorTask || p.goal || 'a promise';
              // NO-DOUBLE (journey-succession r32 2026-10-20): favor tasks
              // name their asker (ctx.name = displayName at build) — so
              // `${who} — ${task}` doubles the descriptor for unnamed
              // villagers ("the woman in her 40s — help A woman, maybe
              // 40s..."). When the task already carries the asker's name,
              // the task alone is the bit.
              let tName = '';
              try { tName = this.displayName(pid) || ''; } catch (e5) {}
              const namesAsker = tName && task.toLowerCase().includes(String(tName).toLowerCase());
              bits.push(namesAsker ? task : `${who} — ${task}`);
            }
            const extra = _releasedNow.length > 3 ? ` (+${_releasedNow.length - 3} more)` : '';
            const oPro = (oldChar && oldChar.pro) || 'they';
            const oTheir = oPro === 'she' ? 'her' : oPro === 'he' ? 'his' : 'their';
            const nWord = _releasedNow.length === 1 ? 'one promise unkept' : `${_releasedNow.length} promises unkept`;
            this.say(`📜 ${oldFirst}'s book stays open on the table: ${nWord} — ${bits.join('; ')}${extra}. The promises died with ${oTheir} maker; the needs didn't. What you do about them is yours to decide.`);
          }
        } catch (e) {}
        // STAMP (journey-succession 2026-10-11): every open thread, seed,
        // favor and memory that exists RIGHT NOW was the dead bearer's —
        // stamp it with their name. Day-granularity cannot separate a
        // morning thread from an afternoon death; the stamp can. Records
        // planted after this keep no stamp, so same-day-after-death plants
        // read as the new bearer's. Already-stamped records keep their
        // stamp — the chain of faces stays honest across many deaths.
        try {
          for (const tid of Object.keys(v.topicLog || {})) {
            const L = v.topicLog[tid] || {};
            for (const o of (L.open || []).concat(L.lapsed || [])) { if (o && !o.inh) o.inh = oldName; }
          }
          for (const sid of Object.keys(v.convoSeeds || {})) {
            const sd = v.convoSeeds[sid];
            if (sd && !sd.inh) sd.inh = oldName;
          }
          for (const fid of Object.keys(v.favorLedger || {})) {
            const fb = v.favorLedger[fid];
            if (fb && !fb.inhFrom) fb.inhFrom = oldName;
          }
          for (const mid of Object.keys(v.memory || {})) {
            for (const mm of v.memory[mid] || []) { if (mm && !mm.inh) mm.inh = oldName; }
          }
        } catch (e4) {}
      } catch (e) {}
      try { this.ledgerAdd('unified', 1); } catch (e) {}
      try { this.save(); } catch (e) {}
    },

    // ---------- ONE CONTEST ----------
    // Many villages, one season. Rival contestants — trade and cooperation,
    // but also competition for the audience's favor. Notability is ratings.
    //
    // FUTURE HOOK (Steve 2026-10-04): the show will run periodic spectacle
    // challenges in distinct arenas, gated by the viewership leaderboard —
    // roughly the top 20% of contestants per challenge. Ratings = access.
    // viewershipBoard() is the API those challenges will read: per-village
    // viewership scores, trends, and the moments that moved them. Don't
    // paint over it: every notable event should recordMoment().
    havenViewership() {
      // VIEWERSHIP, deed-reactive (longsim travel 2026-10-11): the old init
      // read the pantry as fame ((v.pantryKcal||0)/2000 + codexBreadth*1.5,
      // frozen at first read) — a fat pantry froze viewership near the 40
      // global bar by day 2-7, so "roughly a season+ of being worth watching"
      // (docs/SCALE.md, provisional v1) was nearly free. Fame is now earned:
      // arc*5 (the journey so far) + showmanship (playing to the audience —
      // tracked live via _viewShoMark, so ledger showmanship keeps feeding
      // the number instead of only the init) + codex breadth capped at 15
      // (knowing things is interesting; hoarding food is not fame).
      // The sticky pool still carries spikes (recordMoment +1, arena acts,
      // show stunts +2) and real spends (OBJECT -3, declines) — those are the
      // fame economy, and nothing here refills them. The init floors at 12:
      // the audience-drift's resting state (contests.js: drift decays toward
      // 12, never below) and the show-beat gate's "the show is watching"
      // threshold — a quiet fire rests at 12, and 40 still takes a season.
      try {
        const v = this.state.village, pg = this.progState();
        const sho = (this.ledger().showmanship || 0);
        const base = Math.max(12, (pg.arc || 1) * 5 + Math.min(20, sho) + Math.min(15, this.codexBreadth() * 0.5));
        if (v.viewership == null) { v.viewership = base; v._viewShoMark = sho; }
        else {
          const mark = v._viewShoMark || 0;
          if (sho > mark) { v.viewership += (sho - mark); v._viewShoMark = sho; }
        }
        return v.viewership;
      } catch (e) { return 0; }
    },
    // trending moments: the log the future leaderboard reads. Cap 30.
    recordMoment(text) {
      try {
        const pg = this.progState();
        pg.moments = pg.moments || [];
        pg.moments.unshift({ day: (this.state.scholar || {}).day || 0, text: String(text).slice(0, 140) });
        pg.moments = pg.moments.slice(0, 30);
        // moments move viewership: big plays get watched
        const v = this.state.village;
        v.viewership = (v.viewership == null ? this.havenViewership() : v.viewership) + 1;
      } catch (e) {}
    },
    viewershipBoard() {
      // THE leaderboard. Future challenge-gating reads this. Rows:
      // { name, viewership, trend, us }. Sorted high→low.
      try {
        const rows = [{ name: 'Haven', viewership: this.havenViewership(), trend: 0, us: true }];
        for (const ov of (this.state.otherVillages || [])) {
          const prev = ov.viewership == null ? 8 + R() * 8 : ov.viewership;
          const drift = (R() - 0.45) * 3;
          ov.viewership = Math.max(2, Math.min(60, prev + drift));
          ov.trend = Math.round((drift) * 10) / 10;
          rows.push({ name: ov.name || 'a far village', viewership: ov.viewership + (ov.generated ? 4 : 0), trend: ov.trend || 0, us: false });
        }
        rows.sort((a, b) => b.viewership - a.viewership);
        return rows;
      } catch (e) { return [{ name: 'Haven', viewership: 0, trend: 0, us: true }]; }
    },
    contestStandings() {
      // legacy name — the standings ARE the viewership board now.
      return this.viewershipBoard().map(r => ({ name: r.name, score: r.viewership, trend: r.trend, us: r.us }));
    },

    // ---------- CHALLENGE ABDUCTION (future hooks) ----------
    // Steve's design (2026-10-04): challenges come with a System warning +
    // countdown — dread is the point; the village watches the sky count
    // down. When it fires, teleportation is MANDATORY: ripped out of
    // whatever you were doing (mid-conversation, mid-hunt, mid-trial — the
    // show doesn't care). Sometimes a decline is offered, sometimes not.
    // Unhinged games vs monsters or other humans. High risk, high reward,
    // OFTEN DEADLY.
    //
    // Participation is INDIVIDUAL: the leaderboard picks PEOPLE, not
    // villages. Sometimes the chosen can bring companions — the "who do you
    // bring" beat: choosing for a deadly televised game, and the ones left
    // behind, is social dynamite. The invitation list is a mechanic.
    //
    // The future challenge scheduler drives these. Nothing here runs a
    // challenge — these are the hooks it will call.
    warnChallenge(spec) {
      const s = this.state.scholar;
      spec = spec || {};
      const picked = (spec.picked && spec.picked.length ? spec.picked : [this.villagerId]);
      const days = spec.firesDay != null ? spec.firesDay : (s.day || 0) + 3;
      s.challengeWarning = {
        id: spec.id || 'ch_' + Date.now(),
        name: spec.name || 'A New Game',
        arena: spec.arena || 'a place that is not a place',
        firesDay: days,
        canDecline: !!spec.canDecline,
        picked: [...picked],
        canBring: spec.canBring || 0,
        vs: spec.vs || 'unknown',
      };
      s.challengeInvites = {
        challengeId: s.challengeWarning.id,
        picked: [...picked],
        canBring: s.challengeWarning.canBring,
        brought: [],
      };
      const names = picked.map(id => { try { return this.displayName(id).split(' ')[0]; } catch (e) { return 'someone'; } }).join(', ');
      const n = Math.max(1, days - (s.day || 0));
      this.say(`🌟 "ATTENTION, CONTESTANTS." The sky ripples. "${String(s.challengeWarning.name).toUpperCase()} begins in ${n} day${n === 1 ? '' : 's'}. The arena: ${s.challengeWarning.arena}. The chosen: ${names}."`);
      this.say('The village watches the sky count down. Dread is the point.');
      if (s.challengeWarning.canDecline) this.say('This one comes with a way out. The System almost never offers. (You can decline — but the audience will remember.)');
      else this.say('No decline is offered. There never is, for this kind.');
      try { this.recordMoment(`The show chose ${names} for ${s.challengeWarning.name}.`); } catch (e) {}
      try { this.save(); } catch (e) {}
      return s.challengeWarning;
    },
    challengeCountdownText() {
      // HUD surface: the countdown chip. The future scheduler ticks firesDay.
      try {
        const w = this.state.scholar.challengeWarning;
        if (!w) return '';
        const n = Math.max(0, w.firesDay - (this.state.scholar.day || 0));
        return `⏳ ${w.name}: ${n === 0 ? 'TODAY' : n + 'd'}`;
      } catch (e) { return ''; }
    },
    // ---------- THE INVITATION LIST ----------
    // declineChallenge / abduct / bringCompanion (DEAD since 2026-10-08,
    // superseded by contests.js, zero callers) were deleted 2026-10-14.
    expectedButLeft() {
      // who expected to be brought and wasn't. Future drama reads this.
      try {
        const inv = this.state.scholar.challengeInvites;
        if (!inv) return [];
        const trust = this.state.village.trust || {};
        return (this.state.village.roster || []).filter(id =>
          !inv.picked.includes(id) && !inv.brought.includes(id) && (trust[id] || 0) > 60);
      } catch (e) { return []; }
    },
    // ---------- SPECTATORSHIP ----------
    broadcastLine(text) {
      // the village watches its own go. The show is a SHOW — lean broadcast.
      try {
        const pg = this.progState();
        pg.broadcast = pg.broadcast || [];
        pg.broadcast.unshift({ day: (this.state.scholar || {}).day || 0, text: String(text).slice(0, 160) });
        pg.broadcast = pg.broadcast.slice(0, 40);
      } catch (e) {}
      this.say(`📺 ${text} (The village watches the broadcast. Nobody blinks.)`);
      return null;
    },
    // ---------- DEATH IN THE ARENA ----------
    arenaDeath(cause) {
      // village-as-protagonist continuity: the mantle passes, the village
      // mourns — and the show keeps the footage. And replays it. The
      // audience loves a death reel; the village has to live inside one.
      const char = (this.data.villagers || []).find(v => v.id === this.villagerId) || {};
      const nm = char.name || 'the contestant';
      try {
        const pg = this.progState();
        pg.deathReel = pg.deathReel || [];
        pg.deathReel.unshift({
          name: nm,
          day: (this.state.scholar || {}).day || 0,
          challenge: (this.state.scholar.abducted || {}).challengeId || 'the arena',
        });
      } catch (e) {}
      this.say(`📺 ${nm} dies in the arena. The show keeps the footage. They always keep the footage.`);
      try { this.recordMoment(`${nm} died in the arena. The footage plays on.`); } catch (e) {}
      // BREAK-IT abilities r5: even this legacy path is a real death -- the
      // cheats get their say first (violent cause). (No live callers; the
      // invariant is that no playerDeath site bypasses the gate.)
      try { if (!this.maybeCheatDeath()) this.playerDeath('the arena'); } catch (e) { this.over = true; try { this.wipe(); } catch (e2) {} }
      return null;
    },
    replayFootage() {
      // the future scheduler calls this. The village has to live with the reel.
      try {
        const reel = this.progState().deathReel || [];
        if (!reel.length) return null;
        const r = reel[Math.floor(Math.random() * reel.length)];
        this.say(`📺 Before dinner, the show replays ${r.name}'s death. Nobody eats much. The audience loves a death reel; the village has to live inside one.`);
        try { this.recordTrauma('footage'); } catch (e) {}
        return null;
      } catch (e) { return null; }
    },

    // ---------- BROADCAST CONSEQUENCES (future hooks) ----------
    // Steve's rule (2026-10-04): challenges are FULLY televised. No private
    // arena. When you come back, everyone in your village saw everything —
    // just like the rest of the world and the galaxy. Heroics, cowardice,
    // betraying your brought-friend on camera: all content, all public,
    // all priced immediately. The broadcast is persistent social state,
    // not a one-time event.
    arenaAct(vid, kind, detail) {
      // priced immediately, at every scale: village trust, audience
      // viewership, other villages' opinion, the leadership vector.
      const PRICING = {
        heroics:   { trust: 12,  view: 4,  opinion: 6,   ledger: ['protected', 2] },
        mercy:     { trust: 8,   view: 3,  opinion: 5,   ledger: ['protected', 1] },
        sacrifice: { trust: 15,  view: 5,  opinion: 8,   ledger: ['protected', 3] },
        defiance:  { trust: 5,   view: 4,  opinion: 2,   ledger: ['defiance', 1] },
        cowardice: { trust: -12, view: -2, opinion: -6,  ledger: null },
        cruelty:   { trust: -10, view: 2,  opinion: -8,  ledger: null },
        betrayal:  { trust: -20, view: 3,  opinion: -10, ledger: ['betrayed', 2] },
      };
      const p = PRICING[kind];
      if (!p) return null;
      let nm = 'someone';
      try { nm = this.displayName(vid).split(' ')[0]; } catch (e) {}
      const s = this.state.scholar, pg = this.progState();
      const chId = (s.abducted || {}).challengeId || (s.challengeInvites || {}).challengeId || 'the arena';
      // the record: persistent, replayable
      pg.arenaRecord = pg.arenaRecord || {};
      const rec = pg.arenaRecord[chId] = pg.arenaRecord[chId] || { challengeId: chId, acts: [] };
      rec.acts.push({ vid, name: nm, kind, detail: String(detail || '').slice(0, 120), day: s.day || 0 });
      // village scale
      try { const t = this.state.village.trust || {}; t[vid] = Math.max(-100, Math.min(100, (t[vid] || 10) + p.trust)); } catch (e) {}
      // the audience (it loves drama, even the ugly kind)
      try { const v = this.state.village; v.viewership = Math.max(0, (v.viewership == null ? this.havenViewership() : v.viewership) + p.view); } catch (e) {}
      // other villages saw it too — their opinion of Haven moves
      try {
        for (const ov of (this.state.otherVillages || [])) {
          ov.opinion = Math.max(-100, Math.min(100, (ov.opinion || 0) + p.opinion));
        }
      } catch (e) {}
      // the vector: the arena writes your ending
      try { if (p.ledger && this.ledgerAdd) this.ledgerAdd(p.ledger[0], p.ledger[1]); } catch (e) {}
      this.broadcastLine(`${nm}: ${kind}${detail ? ' — ' + detail : ''}.`);
      return p;
    },
    returnFromArena() {
      // the return is a SOCIAL EVENT, not a silent teleport-back. The
      // village saw everything. Cheers, cold shoulders, or "we need to
      // talk about what you did in there."
      const s = this.state.scholar, pg = this.progState();
      const abd = s.abducted;
      if (!abd) return null;
      const rec = ((pg.arenaRecord || {})[abd.challengeId]) || { acts: [] };
      const scores = {};
      for (const a of (rec.acts || [])) {
        const w = { heroics: 12, mercy: 8, sacrifice: 15, defiance: 5, cowardice: -12, cruelty: -10, betrayal: -20 }[a.kind] || 0;
        scores[a.vid] = (scores[a.vid] || 0) + w;
      }
      this.say('⚡ The sky gives you back — all at once, the way it took you. The whole village is already gathered. They watched. All of it.');
      for (const vid of (abd.contestants || [])) {
        let nm = 'someone';
        try { nm = this.displayName(vid).split(' ')[0]; } catch (e) {}
        const sc = scores[vid] || 0;
        if (sc >= 10) this.say(`Cheers for ${nm} — real cheers, the kind that hurt your throat. Whatever happened in there, it was glorious.`);
        else if (sc >= 0) this.say(`${nm} gets nods, and space. Nobody's sure what to say yet. It'll come.`);
        else if (sc > -10) this.say(`Cold shoulders for ${nm}. People find reasons to be elsewhere. The footage doesn't lie, and everyone saw it.`);
        else this.say(`Somebody takes ${nm} aside before the crowd thins. "We need to talk about what you did in there."`);
      }
      // cross-village gossip: they saw the broadcast too
      try {
        const ovs = (this.state.otherVillages || []).filter(ov => (ov.opinion || 0) !== 0);
        if (ovs.length) {
          const ov = ovs[Math.floor(Math.random() * ovs.length)];
          this.say(`Word comes by rider: in ${ov.name}, they're ${ov.opinion > 0 ? 'still talking about the arena — with admiration' : 'still talking about the arena. Not kindly'}. Your footage is their opinion of you now.`);
        }
      } catch (e) {}
      // put them back where they were ripped from
      try { if (s.rippedFrom) { s.mx = s.rippedFrom.mx; s.my = s.rippedFrom.my; } } catch (e) {}
      s.abducted = null;
      try { this.recordMoment('Returned from the arena. The village saw everything.'); } catch (e) {}
      try { this.save(); } catch (e) {}
      return null;
    },
    replayHighlights() {
      // the show replays highlights: the village lives under the footage.
      try {
        const recs = this.progState().arenaRecord || {};
        const all = [];
        for (const id of Object.keys(recs)) for (const a of (recs[id].acts || [])) all.push(a);
        if (!all.length) return null;
        const a = all[Math.floor(Math.random() * all.length)];
        this.say(`📺 The show replays ${a.name}'s ${a.kind}${a.detail ? ' — "' + a.detail + '"' : ''}. It'll replay it again tomorrow. Highlights don't expire; that's what makes them highlights.`);
        return null;
      } catch (e) { return null; }
    },
  };

  Object.assign(Game, methods);

  // ============ WRAPS ============
  (function attach() {
    // deaths write the moral ledger
    const _registerDeath = Game.registerDeath;
    Game.registerDeath = function (opts) {
      const r = _registerDeath ? _registerDeath.call(this, opts) : undefined;
      try {
        const o = opts || {};
        if (o.killerId && o.killerId === this.villagerId) {
          if (o.kind === 'monster' || o.kind === 'hostile') {
            this.ledgerAdd('might', 3);
            // r24 blank: was reading this.state.party (never written outside
            // debug-scenarios) — the real party is state.village.party.
            const party = (this.state && this.state.village && this.state.village.party) || [];
            if (party.length) this.ledgerAdd('protected', 1);
          } else if (o.kind === 'villager') {
            this.ledgerAdd('killed', 3);
          }
        }
      } catch (e) {}
      return r;
    };

    // intimidation is force, whatever its excuse
    const _intimidate = Game.intimidate;
    Game.intimidate = function (vid) {
      const r = _intimidate ? _intimidate.call(this, vid) : undefined;
      try { this.ledgerAdd('might', 1); } catch (e) {}
      return r;
    };

    // exposing corruption is witness-work — and truths dragged into the
    // light have consequences: names named, eyes avoided. The exposure
    // goes on the kept list (exposure.js) with attribution — who exposed
    // whose bribery, when — so the Witness path's charges read real.
    const _expose = Game.exposeBribery;
    Game.exposeBribery = function (caseId, voterId) {
      const r = _expose ? _expose.call(this, caseId, voterId) : undefined;
      try {
        if (r) {
          let briber = null, voterName = null;
          try {
            const c = this.getCase ? this.getCase(caseId) : null;
            const b = c && (c.bribes || []).find(x => x.voter === voterId);
            briber = b ? b.by : null;
            voterName = this.displayName ? String(this.displayName(voterId) || '').split(' ')[0] : voterId;
          } catch (e) {}
          if (this.recordExposure) {
            this.recordExposure({
              kind: 'bribe',
              accuser: this.villagerId,
              accused: briber || voterId,
              charge: briber ? `bought ${voterName}'s vote` : 'bribery at the moot',
              detail: 'exposed at the moot, in public',
              amount: 2,
            });
          } else { this.ledgerAdd('exposed', 2); }
          this.exposeFallout(caseId, voterId);
        }
      } catch (e) {}
      return r;
    };

    // how cases resolve shapes humanity
    const _resolveCase = Game.resolveCase;
    Game.resolveCase = function (caseId, path) {
      const r = _resolveCase ? _resolveCase.call(this, caseId, path) : undefined;
      try {
        // The player's OWN conviction isn't brokerage or exposure work they
        // did: no exposed/unified/brokerage credit when they're the accused.
        const c = this.getCase ? this.getCase(caseId) : null;
        const accused = !!c && (c.playerRole === 'accused' || (c.accused || []).includes(this.villagerId));
        if (path === 'weregild') { if (!accused) { this.ledgerAdd('brokerage', 2); this.ledgerAdd('unified', 1); } }
        else if (path === 'schism') { this.ledgerAdd('fractured', 2); }
        else if (path === 'exile') {
          if (!accused) {
            // the moot heard the charge and acted — a real accusation,
            // upheld in public. Goes on the kept list (exposure.js).
            if (this.recordExposure) {
              const acc = (c.accused || [])[0];
              this.recordExposure({
                kind: 'plot',
                accuser: 'the moot',
                accused: acc,
                charge: `the moot heard the charge (${c.charge || c.kind || 'plot'}) and exiled them`,
                detail: 'convicted at the moot',
                amount: 1,
              });
            } else { this.ledgerAdd('exposed', 1); }
            this.ledgerAdd('unified', 1);
          }
        }
        else if (path === 'cold_war') { this.ledgerAdd('fractured', 1); }
      } catch (e) {}
      return r;
    };

    // teaching is sharing the food truth outward
    const _convoTurn = Game.convoTurn;
    Game.convoTurn = function (vid, choiceId) {
      let before = -1;
      try {
        if (choiceId === 'teach') before = (((this.state.village || {}).taught || {})[vid] || []).length;
      } catch (e) {}
      const r = _convoTurn ? _convoTurn.call(this, vid, choiceId) : undefined;
      try {
        if (choiceId === 'teach' && before >= 0) {
          const after = (((this.state.village || {}).taught || {})[vid] || []).length;
          if (after > before) {
            const roster = ((this.state.village || {}).roster || []);
            this.ledgerAdd('foodShared', roster.includes(vid) ? 1 : 2);
          }
        }
      } catch (e) {}
      return r;
    };

    // run ends: the legend is recorded (guarded against double-record)
    const _wipe = Game.wipe;
    Game.wipe = function () {
      try {
        if (this.over && this.progState && !this.progState().legendRecorded) {
          this.recordLegend({ outcome: this.won ? (this.villageLost ? 'village-lost' : 'haven-endures') : 'died' });
        }
      } catch (e) {}
      return _wipe ? _wipe.call(this) : undefined;
    };

    // daily: the world reacts + the table waits
    const _endDay = Game.endDay;
    Game.endDay = function () {
      const r = _endDay ? _endDay.call(this) : undefined;
      try {
        this.ledgerBeat();
        // threshold beats whose gates failed wait for the world to catch up
        this.flushLedgerBeats();
        // unity and the food truth are felt states — transitions narrate
        this._checkUnityTransition();
        this._checkFoodStance();
        const pg = this.progState();
        // RELATIVE UNTIL ENTERED (Steve 2026-10-14: "The table should all be
        // relative until actually entering it when it locks. Even if they
        // qualify early, there's room for them to change or influence path
        // until they get to the very end."). Qualifying sends an invitation;
        // announced once; the seat is taken from Haven (table.js tableTakeSeat).
        if (pg.tableWaiting && !pg.tableDone && this.state.systemArrived) this.tableAnnounce();
      } catch (e) {}
      return r;
    };
  })();
})();
