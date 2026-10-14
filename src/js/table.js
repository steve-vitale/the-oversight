// @ontology
// system: table
// description: The galactic table — integrated endgame. Prices the run (never gates on godhood), offers the seven earned paths (feared, indispensable, beloved, witness, defiant, assimilated, relay), each a played failable challenge with light/dark branches earned from real behavior. Failure resolves the story (lesser frames, tribute, people) — never deletes the run. Grounding (humanity) is the two-way cost of integration. NPC ascension + facilitation credited honestly.
// provides:
//   - tableSeat()
//   - tableEarnedPaths()
//   - tableBranch(pathId)
//   - tableRegisterPath(def)
//   - tableScene()
//   - tableAnnounce(), tablePreview(), tableTakeSeat() — the seat is taken from Haven; relative until then (Steve 2026-10-14)
//   - tableActive()
//   - chooseTableOption(id)
//   - tableStartPath(pathId)
//   - tableChoose(choiceId)
//   - tableFail(reason)
//   - tableDowngradePick(pathId)
//   - tableResolveFinal(choiceId)
//   - tablePrompt(html, options, frame)
//   - grounding()
//   - groundingTier()
//   - groundingMult()
//   - addGrounding(n, why)
//   - groundingReactionBeats(oldTier, newTier)
//   - sysBond()
//   - addSysBond(n, why)
//   - villagerAscensionScore(vid)
//   - tableFacilitate(kind, vid)
//   - tableTheme()
//   - tableEpilogue(frame, branch, choiceId)
//   - tableLiveWrap(text)
// consumes:
//   - state.scholar, state.village, progState()
//   - ledger(), deedGateReady(), deedState(), scaleRank(), integrationStage(), havenViewership()
//   - say, sysSay, recordMoment, recordLegend, wipe, save
//   - metaNoteTable(), metaNoteTableChoice() (called directly — metaProgression's wraps bound at ITS load time to ledger.js's versions, so the wraps don't see these overrides)
//   - switchboard() (comms.js) for the light/dark axis
// Self-attaching module: Object.assign(Game, methods). Load AFTER comms.js
// (needs switchboard) and AFTER ledger.js (overrides tableScene /
// chooseTableOption via later assignment — dynamic dispatch picks these up).
// Path content lives in table-<path>.js, registered via tableRegisterPath.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const R = Math.random;

  // Path registry — filled by table-<path>.js modules.
  const PATHS = {};
  function pathDef(id) { return PATHS[id] || null; }

  const methods = {
    // tableRegisterPath: path content modules call this at load.
    tableRegisterPath(def) {
      if (!def || !def.id) return;
      PATHS[def.id] = def;
    },

    // ============ THE SEAT: full / lesser / none ============
    // Steve 2026-10-11: the table PRICES the run, never gates on godhood.
    // deedGateReady() is the FULL seat (all wave bars 5/5/4/3/2, 3 contests,
    // 3 crises, stage>=2, food-thesis deeds; no scale bar since the
    // 2026-10-13 Standing change — the lesser seat still needs regional+,
    // an open asymmetry flagged 2026-10-14). The LESSER
    // seat is the reachable bar for competent non-god play — priced
    // honestly, fewer paths open, weaker terms. Below it the table does
    // not come (ledger.js's withdrawal beat handles that case).
    tableSeat() {
      try {
        const full = (typeof this.deedGateReady === 'function') ? this.deedGateReady() : { ok: false };
        if (full && full.ok) return { seat: 'full', detail: full };
        const d = (typeof this.deedState === 'function') ? this.deedState() : {};
        const faced = (d && d.wavesFaced) || {};
        let w1 = 0, w2 = 0, w3 = 0;
        for (const mid of Object.keys(faced)) {
          const w = faced[mid] | 0;
          if (w === 1) w1++; else if (w === 2) w2++; else if (w === 3) w3++;
        }
        const contestsN = (d && d.contestsSurvived) | 0;
        const pg = this.progState();
        const crisesN = Object.keys((pg && pg.crises) || {}).length;
        let rank = 'village';
        try { rank = (typeof this.scaleRank === 'function') ? this.scaleRank() : 'village'; } catch (e) {}
        const scaleOk = rank === 'regional' || rank === 'national' || rank === 'global';
        let stage = 0;
        try { stage = (typeof this.integrationStage === 'function') ? this.integrationStage() : 0; } catch (e) {}
        const s = this.state.scholar || {};
        const foodDeeds = !!(pg.sentimentTaught && s.prog && s.prog.feastSurgeUsed);
        const lesser = w1 >= 4 && w2 >= 4 && w3 >= 3 && contestsN >= 2 && crisesN >= 2 && scaleOk && stage >= 2 && foodDeeds;
        const detail = { w1, w2, w3, contestsN, crisesN, rank, stage, foodDeeds };
        if (lesser) return { seat: 'lesser', detail };
        return { seat: 'none', detail };
      } catch (e) { return { seat: 'none', detail: {} }; }
    },

    // ============ EARNED PATHS ============
    // Each path def provides prereq() -> {earned, strength 0-100, why}.
    // Unearned paths are named and priced, never silently hidden.
    tableEarnedPaths() {
      const out = [];
      try {
        const seat = this.tableSeat();
        // NPC ASCENSION PRICING (journey-endgame r7 2026-10-13): TABLE.md
        // canon — "each ascended villager adds bargaining power (+path
        // strength)". The epilogue used to only say it aloud; now the
        // audit's standing numbers move too (+10 per ascension, cap 100),
        // and the audit voices it (see tableScene).
        let ascBonus = 0;
        try { ascBonus = (this.tableAscended ? this.tableAscended().length : 0) * 10; } catch (e) {}
        for (const id of Object.keys(PATHS)) {
          const def = PATHS[id];
          let pr = { earned: false, strength: 0, why: 'The table has not priced this seat yet.' };
          try { pr = def.prereq.call(this, seat) || pr; } catch (e) {}
          // Seat floor: paths declare minSeat; the audit is honest about it.
          const order = { none: 0, lesser: 1, full: 2 };
          if ((order[seat.seat] || 0) < (order[def.minSeat || 'lesser'] || 0)) {
            pr = { earned: false, strength: 0, why: def.seatWhy || 'This seat needs a stronger table.' };
          }
          out.push({ id, name: def.name, earned: !!pr.earned, strength: Math.min(100, (pr.strength | 0) + ascBonus), why: pr.why, showGenre: def.showGenre });
        }
      } catch (e) {}
      return out;
    },

    // ============ LIGHT/DARK AXIS ============
    // Earned through play — never a menu choice. Reads: moral ledger,
    // switchboard routed/delayed/edited/skimmed, food truth shared/hoarded,
    // promises kept/broken. Each path weights the signals its own way.
    tablePromiseTally() {
      let kept = 0, broken = 0;
      try {
        const v = this.state.village || {};
        const pr = v.promises || {};
        for (const k of Object.keys(pr)) {
          const p = pr[k];
          if (!p) continue;
          if (p.kept === true) kept++;
          else if (p.kept === 'broken') broken++;
        }
        const fl = v.favorLedger || {};
        for (const k of Object.keys(fl)) {
          const f = fl[k];
          if (!f || !f.state) continue;
          if (f.state === 'fulfilled' || f.state === 'thanked') kept++;
          else if (f.state === 'broken') broken++;
        }
      } catch (e) {}
      return { kept, broken };
    },
    tableSwitchTally() {
      try {
        const sw = (typeof this.switchboard === 'function') ? this.switchboard() : null;
        if (!sw) return { routed: 0, delayed: 0, edited: 0, skimmed: 0 };
        return { routed: sw.routed | 0, delayed: sw.delayed | 0, edited: sw.edited | 0, skimmed: sw.skimmed | 0 };
      } catch (e) { return { routed: 0, delayed: 0, edited: 0, skimmed: 0 }; }
    },
    tableBranch(pathId) {
      const signals = { branch: 'light', light: 0, dark: 0, notes: [] };
      try {
        const L = (typeof this.ledger === 'function') ? this.ledger() : {};
        const pt = this.tablePromiseTally();
        const sw = this.tableSwitchTally();
        const g = (v) => (L && L[v]) | 0;
        // Shared dark signals.
        if (g('killed') > g('protected')) { signals.dark += 2; signals.notes.push('the ledger counts more killed than protected'); }
        if (g('betrayed') > 0) { signals.dark += 2; signals.notes.push('betrayals on the record'); }
        if (g('foodHoarded') > g('foodShared')) { signals.dark += 1; signals.notes.push('the food truth was hoarded'); }
        if (pt.broken > pt.kept) { signals.dark += 2; signals.notes.push('more promises broken than kept'); }
        if (sw.edited + sw.skimmed > sw.routed) { signals.dark += 2; signals.notes.push('the relay edited more than it carried'); }
        // Shared light signals.
        if (g('protected') >= g('killed') && g('protected') > 0) { signals.light += 2; signals.notes.push('the protected outnumber the killed'); }
        if (g('foodShared') > g('foodHoarded')) { signals.light += 1; signals.notes.push('the food truth was shared'); }
        if (pt.kept > pt.broken) { signals.light += 2; signals.notes.push('promises kept'); }
        if (sw.routed > sw.edited + sw.skimmed + sw.delayed) { signals.light += 1; signals.notes.push('the relay carried faithfully'); }
        // Path-specific weights.
        const W = {
          feared: (s) => { if (g('might') > 0 && g('protected') >= g('killed')) s.light += 1; if (g('killed') > g('protected') * 2) s.dark += 2; },
          indispensable: (s) => { if (g('foodShared') > g('foodHoarded') * 2) s.light += 2; if (g('foodHoarded') >= g('foodShared')) s.dark += 2; },
          beloved: (s) => { if (g('showmanship') > g('protected') * 2) s.dark += 2; if (g('betrayed') > 0) s.dark += 1; },
          witness: (s) => { if (g('exposed') >= 3 && g('protected') >= g('killed')) s.light += 2; if (g('killed') > g('protected')) s.dark += 2; },
          assimilated: (s) => { if (g('embrace') > g('defiance') * 3) s.dark += 2; if (g('foodShared') > 0 && g('protected') > 0) s.light += 1; },
          defiant: (s) => { if (g('killed') > 3 && g('defiance') > g('might') + g('brokerage')) s.dark += 2; if (pt.kept >= pt.broken) s.light += 1; },
          relay: (s) => {
            const ra = ((this.state.scholar || {}).relayAbils) || {};
            // 2026-10-11: uses live at ra.<id>.uses (the relayGrant shape) —
            // the old read (ra.rewriteUses etc.) was always 0, so ability
            // use never counted. Fixed.
            const darkUses = ((ra.rewrite || {}).uses | 0) + ((ra.skim || {}).uses | 0) + ((ra.omnipresence || {}).uses | 0);
            const lightUses = ((ra.translate || {}).uses | 0) + ((ra.sanctuary || {}).uses | 0) + ((ra.advocate || {}).uses | 0);
            if (darkUses > lightUses) s.dark += 3;
            if (lightUses > darkUses) s.light += 3;
            if (this.grounding() < 50) s.dark += 2; else s.light += 1;
            // GRADIENT (2026-10-11, Steve): the relay path resolves on the
            // leaning meter, not a binary branch. band 'light' (>=40,
            // tender) / 'dark' (<=-40, total) / 'grey' (the pragmatist
            // middle). The middle is honest, not a coin flip: grey takes
            // neither side's +3. No single choice can set the band — lean
            // moves in nudges of <=10 against the 40 threshold (see
            // relay-dialogue.js GRADIENT LAW).
            let lean = 0;
            try { lean = (typeof this.relayLean === 'function') ? this.relayLean() : 0; } catch (e) {}
            s.lean = lean;
            s.band = lean >= 40 ? 'light' : lean <= -40 ? 'dark' : 'grey';
            if (s.band === 'light') s.light += 3; else if (s.band === 'dark') s.dark += 3;
          },
        };
        if (W[pathId]) W[pathId](signals);
        signals.branch = signals.dark > signals.light ? 'dark' : 'light';
      } catch (e) {}
      return signals;
    },

    // ============ GROUNDING (humanity) — the two-way cost ============
    // scholar.grounding 0-100, starts 100. Deepening integration + dark
    // relay ability use erodes it; human verbs restore it: shared meals,
    // comforted grief, KEPT favor obligations (the favor system is the
    // humanity anchor), teaching. Tiered mechanical effects — not flavor:
    // food conversions weaken as you become what forgot food.
    grounding() {
      try {
        const s = this.state.scholar || {};
        if (s.grounding == null) s.grounding = 100;
        return Math.max(0, Math.min(100, s.grounding | 0));
      } catch (e) { return 100; }
    },
    groundingTier() {
      const g = this.grounding();
      if (g >= 75) return 'grounded';
      if (g >= 50) return 'fraying';
      if (g >= 25) return 'estranged';
      return 'hollow';
    },
    // groundingMult: the food-conversion factor. The dark relay becomes
    // what forgot food — conversions weaken. Read by feastedMult() and any
    // food→power conversion. Always telegraphed where it's applied.
    groundingMult() {
      const t = this.groundingTier();
      return t === 'grounded' ? 1 : t === 'fraying' ? 0.9 : t === 'estranged' ? 0.75 : 0.6;
    },
    addGrounding(n, why) {
      try {
        const s = this.state.scholar || {};
        const before = this.groundingTier();
        s.grounding = Math.max(0, Math.min(100, this.grounding() + (n | 0)));
        const after = this.groundingTier();
        if (before !== after) this.groundingReactionBeats(before, after, why);
        try { this.save(); } catch (e) {}
      } catch (e) {}
    },
    // groundingReactionBeats: the village's view of your humanity is a
    // LIVE readout — dialogue, gossip, fear, grief — never a hidden stat
    // revealed at the end. Villagers do not always approve.
    groundingReactionBeats(from, to, why) {
      try {
        const order = { grounded: 0, fraying: 1, estranged: 2, hollow: 3 };
        const falling = (order[to] | 0) > (order[from] | 0);
        const v = this.state.village || {};
        const names = (this.data.villagers || []).filter(x => x.id !== this.villagerId).slice(0, 3).map(x => (x.name || 'someone').split(' ')[0]);
        const n1 = names[0] || 'Mara', n2 = names[1] || 'the old ones';
        if (falling && to === 'fraying') {
          this.say(`${n1} keeps a half-step of distance at the fire now. Not fear — not yet. Just... distance. "You've been up at the relay late," they say, and don't ask what you found.`);
          this.bumpTrust && this.bumpTrust(null, -2, 'grounding fraying');
        } else if (falling && to === 'estranged') {
          this.say(`The gossip has changed its grammar around you. ${n2} talk about you the way they talk about weather — something that happens, not someone who chooses. A child asked what your laugh sounds like. Nobody could quite remember.`);
          this.say(`Your small-talk comes out in the System's register now — clean, total, wrong. You hear yourself do it. You don't stop.`);
          try { this.recordMoment('The village started talking about the Bearer like weather.'); } catch (e) {}
        } else if (falling && to === 'hollow') {
          this.say(`They grieve you while you're alive. That's the thing nobody warned you about. ${n1} set a place for you at the feast and then quietly took it away — "for whoever you were," they said, and the fire was very kind about it, which was worse.`);
          try { this.recordMoment('The village grieved the Bearer while they lived.'); } catch (e) {}
        } else if (!falling) {
          this.say(`${n1} sat close at the fire again, shoulder to shoulder, like before. Human verbs. They work. The climb back is the story.`);
        }
        try { this.save(); } catch (e) {}
      } catch (e) {}
    },

    // ============ SYSBOND — the System relationship arc ============
    // pg.sysBond 0-5: static, curious, listening, comprehending, champion, kin.
    // The System wants something: to understand caretaking (food, grief,
    // joy). Endings resolve, plant threads, or create obligations — some
    // the System owes YOU.
    sysBond() {
      try { const pg = this.progState(); pg.sysBond = pg.sysBond | 0; return pg.sysBond; } catch (e) { return 0; }
    },
    addSysBond(n, why) {
      try {
        const pg = this.progState();
        const before = this.sysBond();
        pg.sysBond = Math.max(0, Math.min(5, before + (n | 0)));
        if (pg.sysBond !== before) {
          // Six levels, six names (2026-10-11): the old list had five, so the
          // capped level 5 read "here" — flat after "champion". The arc ends
          // where TABLE.md says it does: the machine recognizing humans as
          // fellow strugglers — kin.
          const names = ['static', 'curious', 'listening', 'comprehending', 'champion', 'kin'];
          this.say(`◈ THE SYSTEM — something shifts in the overlay's weather. It is ${names[pg.sysBond] || 'here'} now.${why ? ' ' + why : ''}`);
        }
        try { this.save(); } catch (e) {}
      } catch (e) {}
    },

    // ============ TABLE STATE ============
    tableState() {
      try {
        const pg = this.progState();
        pg.table = pg.table || {};
        return pg.table;
      } catch (e) { return {}; }
    },

    // WIN DAY FLOOR (2026-10-13, Steve): no win before day 90 — hard floor,
    // engine-enforced in the win check (never in the seat logic). A table
    // path that resolves early is DEFERRED, not denied: the table waits,
    // the game continues, the win can land on/after day 90. Every wave must
    // have had its impact before the win — the floor plus the full seat's
    // distinct-fought bars enforce it.
    winDayFloorOk() {
      try { return ((this.state.scholar || {}).day || 0) >= 90; } catch (e) { return false; }
    },
    winDayFloorDefer(T) {
      this.say('◈ THE TABLE WAITS — "Ninety days. We do not price a life half-lived. Come back when the village has seen ninety dawns — the table will still be here."');
      T.phase = 'paths';
      try { this.save(); } catch (e) {}
    },

    // TABLE SANCTITY (2026-10-12, Steve): while the table sits, the world
    // holds its breath. Ambient monster pressure against villagers is
    // suspended — no random field fights, no wild encounters, no patrol
    // contact, no new raids (lingering raiders hold the treeline without
    // gorging). ALL stakes during the finale come from the table itself
    // (pricing, light/dark branches, trial by combat — the one opt-in
    // existential risk). Ambient routers gate on this flag; the table's
    // own stakes never check it. Derived from run state (no new persisted
    // fields): active from tableScene until any resolve sets phase 'done'.
    tableActive() {
      try {
        const pg = this.progState ? this.progState() : null;
        if (!pg || !pg.tableDone) return false;
        const T = this.tableState();
        return !!(T && T.phase && T.phase !== 'done');
      } catch (e) { return false; }
    },

    // tableLiveWrap: every path's finale is televised in its genre — but
    // only when the show is actually watching (viewership >= 12, the
    // ledger's own threshold-beat rule). Otherwise the beat plays
    // untelevised, honestly.
    tableLiveWrap(genreLine) {
      try {
        // The Assimilated is never televised — the footage leaks anyway.
        // Contraband is its own genre.
        if (this.tableState && this.tableState().path === 'assimilated') {
          this.say('◈ CONTRABAND — the assimilation isn\'t televised. It doesn\'t matter. Somewhere, a camera that shouldn\'t exist is rolling, and the footage will leak. It always leaks.');
          return;
        }
        const vw = (typeof this.havenViewership === 'function') ? this.havenViewership() : 0;
        if (vw >= 12 && genreLine) this.sysSay('🔴 LIVE! ' + genreLine);
      } catch (e) {}
    },

    // tablePrompt: the modal driver. Extends the tableChoices pattern with
    // an optional prompt (multi-beat challenges need their own text).
    // app.js tableSheet honors tc.prompt.
    tablePrompt(promptHtml, options, frame) {
      try {
        const s = this.state.scholar || {};
        s.tableChoices = { frame: frame || 'the Table', prompt: promptHtml, options: options || [] };
        try { this.save(); } catch (e) {}
      } catch (e) {}
    },

    // ============ THE TABLE SCENE (overrides ledger.js) ============
    // Arc IV sets tableWaiting. The scene fires the next dawn. The audit:
    // the table reads your run aloud, prices the seat, names the earned
    // paths AND the unearned ones (priced, never hidden). Then you choose
    // — the choice is which risk you take, not which ending you get.
    tableScene() {
      const s = this.state.scholar, pg = this.progState();
      const T = this.tableState();
      if (pg.tableDone || T.phase === 'done') return;
      // No seat: withdraw aloud, never silently (ledger.js's law).
      const seat = this.tableSeat();
      if (seat.seat === 'none') {
        pg.tableWaiting = false;
        this.say('◈ THE TABLE — the ring of pale light flickers... and does not come. The System is embarrassed. "YOUR CASE IS NOT COMPLETE. THE DEEDS ARE NOT ALL DONE. WE WILL... RESCHEDULE." The table is withdrawn — for now. It will be set again when the deeds are done.');
        try { this.save(); } catch (e) {}
        return;
      }
      pg.tableDone = true;
      T.seat = seat.seat; T.phase = 'paths'; T.path = null;
      const d = seat.detail || {};
      // MUSIC (Steve 2026-10-12): the table gets its ceremonial bed.
      try { this.music('scenario', 'table'); } catch (e) {}
      this.say('◈ THE TABLE — it is not a table. It\'s a ring of pale light, and around it, things with too many angles to be faces. Above it all — the audience. Trillions of eyes, and every one of them knows your name. The System speaks, and for once it isn\'t performing: "HUMANITY PRESENTS ITS CASE."');
      // THE AUDIT — the table prices the run aloud.
      const seatLine = seat.seat === 'full'
        ? `A full seat. ${d.rank || 'National'} standing, every wave faced, the deeds complete. The table rises when you enter.`
        : `A lesser seat — ${d.rank || 'regional'} standing, waves 1–3 faced (${d.w1 || 0}/${d.w2 || 0}/${d.w3 || 0}), ${d.contestsN || 0} contests survived, ${d.crisesN || 0} crises weathered. The table does not rise. It prices.`;
      this.say(`◈ THE AUDIT — the System reads your run back to you, and the galaxy listens. ${seatLine}`);
      // NPC ASCENSION PRICING (journey-endgame r7 2026-10-13): the audit
      // voices the ascension bonus that tableEarnedPaths prices into each
      // path's standing — TABLE.md canon, "said aloud, priced in".
      try {
        const _ascN = this.tableAscended ? this.tableAscended().length : 0;
        if (_ascN) this.say(`The table notes ${_ascN} ascension${_ascN > 1 ? 's' : ''} from one village — its terms improve accordingly. Nobody has ever seen that before.`);
      } catch (e) {}
      // TABLE SANCTITY (2026-10-12, Steve): the System clears the stage.
      // One line, producer-unhinged — the world holds its breath while the
      // table sits. Ambient monster pressure is suspended for the sequence
      // (see the tableActive predicate); every stake from here is the table's own.
      this.sysSay('EVERYONE. SIT. WATCH. The teeth and the weather can WAIT — nothing out there matters until this is done. ...Did I stutter? SIT.');
      try { this.recordMoment(`Haven reached the table (${seat.seat} seat).`); } catch (e) {}
      try { this.metaNoteTable && this.metaNoteTable('table'); } catch (e) {}
      this.tableOfferPaths('The ring waits. Seven doors — some open, some priced beyond you. The choice is which risk you take.');
    },

    // TABLE SEAT AT HAVEN (Steve 2026-10-14): the table stays RELATIVE until
    // the player sits ("relative until actually entering it when it locks"),
    // and is NOT asked every morning ("It will get annoying if we ask them
    // about the table every morning after it's available. Make it an option
    // in haven once unlocked."). Qualifying announces it once; the Haven
    // panel shows tablePreview() and calls tableTakeSeat().
    tableAnnounce() {
      try {
        const pg = this.progState();
        if (pg.tableDone) return;
        const seat = this.tableSeat();
        // lost the seat: the existing withdrawal beat, and a fresh
        // announcement if the run qualifies again later
        if (seat.seat === 'none') { pg.tableAnnounced = false; this.tableScene(); return; }
        if (pg.tableAnnounced) return;
        // NO SPOILERS (Steve 2026-10-14: "Not just greyed out before 90,
        // nonexistent. Don't spoil the game for them."): before the seat can
        // be taken, the table does not exist for the player.
        if (!this.winDayFloorOk()) return;
        pg.tableAnnounced = true;
        this.say('◈ THE TABLE IS SET. A ring of pale light waits — take your seat from Haven when you are ready. Nothing is final until you sit.');
        try { this.save(); } catch (e) {}
      } catch (e) { console.warn('tableAnnounce', e); }
    },
    // tablePreview(): the run as priced TODAY (recomputed live). null when
    // the table isn't available. ready = the seat can be taken now.
    tablePreview() {
      try {
        const pg = this.progState();
        if (!pg.tableWaiting || pg.tableDone) return null;
        const seat = this.tableSeat();
        if (seat.seat === 'none') return null;
        const doors = this.tableEarnedPaths().filter(p => p.earned).map(p => p.name);
        const day = ((this.state || {}).scholar || {}).day || 0;
        // nonexistent before day 90 — no preview, no button (no spoilers)
        if (!this.winDayFloorOk()) return null;
        return { seat: seat.seat, doors, day, ready: true };
      } catch (e) { console.warn('tablePreview', e); return null; }
    },
    // tableTakeSeat(): the player sits — this locks the seat (tableScene);
    // tableStartPath locks the branch.
    tableTakeSeat() {
      const pv = this.tablePreview();
      if (!pv) return { ok: false, msg: '' };
      this.tableScene();
      return { ok: true };
    },

    // tableOfferPaths: path selection modal. Earned paths are choices;
    // unearned paths are shown priced (never hidden).
    tableOfferPaths(promptLine) {
      const T = this.tableState();
      T.phase = 'paths';
      const paths = this.tableEarnedPaths();
      const earned = paths.filter(p => p.earned);
      const lines = paths.map(p => `<p><b>${p.earned ? '◈' : '◇'} ${this.escHtml(p.name)}</b> — ${this.escHtml(p.why)}${p.earned && p.strength ? ` <i>(standing: ${p.strength})</i>` : ''}</p>`).join('');
      const prompt = `<p>The ring of pale light. The too-many-angled faces. The trillions of eyes.</p>` +
        `<p>${this.escHtml(promptLine || 'Choose your door.')}</p>` + lines;
      const options = earned.map(p => ({ id: 'path:' + p.id, label: `Walk the path of ${p.name}` }));
      this.tablePrompt(prompt, options, 'the Table');
      try { this.save(); } catch (e) {}
    },
    escHtml(t) {
      return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    // ============ CHALLENGE RUNNER ============
    // chooseTableOption stays the single UI entry point (app.js calls it).
    // It routes by table phase: paths → start path; challenge → beat
    // choice; finals → resolve; downgrade → pick a lesser path.
    chooseTableOption(id) {
      const T = this.tableState();
      try {
        if (!id) return null;
        if (id.indexOf('path:') === 0 && T.phase === 'paths') { this.tableStartPath(id.slice(5)); return null; }
        if (id.indexOf('downgrade:') === 0 && T.phase === 'downgrade') { this.tableDowngradePick(id.slice(10)); return null; }
        if (T.phase === 'challenge') { this.tableChoose(id); return null; }
        if (T.phase === 'finals') { this.tableResolveFinal(id); return null; }
        // PODS WEIGHT: the demand's price choice.
        if (T.phase === 'demand-price' && id.indexOf('demandprice:') === 0) { this.tableResolveDemandPrice(id.slice(12)); return null; }
        // PODS WEIGHT: dark conscript answer — then the challenge resumes.
        if (T.phase === 'conscript' && id.indexOf('conscript:') === 0) {
          try { if (typeof this.podConscriptAnswer === 'function') this.podConscriptAnswer(id === 'conscript:yes'); } catch (e) {}
          T.phase = 'challenge'; T.beat = 0;
          const def2 = pathDef(T.path);
          if (def2) this.tableRunBeat(0);
          try { this.save(); } catch (e) {}
          return null;
        }
      } catch (e) {}
      return null;
    },

    tableStartPath(pathId) {
      const def = pathDef(pathId);
      if (!def) return;
      const T = this.tableState();
      const branch = this.tableBranch(pathId);
      T.path = pathId; T.phase = 'challenge'; T.beat = 0;
      T.meters = {}; T.branch = branch.branch; T.branchNotes = branch.notes;
      T.weakened = T.weakened | 0;
      T.abils = []; T.abilMods = {};
      // GRADIENT (2026-10-11): the relay path runs on its leaning band —
      // light / grey / dark — instead of the binary signals.branch. The
      // grey middle is an honest ending color, not a coin flip.
      if (pathId === 'relay' && branch.band) { T.branch = branch.band; T.band = branch.band; }
      // Path abilities: mostly shared + several branch-unique. Granted
      // aloud at the door; grant effects are immediate and honest.
      const ab = def.abilities || {};
      const grantList = (list) => (list || []).forEach(a => {
        T.abils.push(a.id);
        // Don't re-announce what the bearer's hands already hold (2026-10-11):
        // a relay-path walker claimed the office to qualify, so the door
        // grants echo. Check BEFORE granting (the grant itself sets unlocked).
        // Still registered in T.abils — just said once.
        let already = false;
        try { already = !!(a.id && typeof this.relayHas === 'function' && this.relayHas(a.id)); } catch (e3) {}
        try {
          const e = (typeof a.grant === 'function') ? a.grant.call(this, T) : a.grant;
          for (const k of Object.keys(e || {})) {
            if (k === 'abilMods') Object.assign(T.abilMods, e.abilMods);
            else if (k !== 'grounding' && k !== 'sysBond') T.meters[k] = (T.meters[k] | 0) + (e[k] | 0);
          }
        } catch (e2) {}
        this.say(already ? `◈ ABILITY — ${a.name}: already in your hands.` : `◈ ABILITY — ${a.name}: ${a.desc}`);
      });
      // The pragmatist's door gift (2026-10-11): a grey-band relay walker
      // gets whichever hand is forward — a gradient read at the door, not
      // a lock. Acts can still open the other track through the gradient
      // gates in relayUnlockCheck.
      let branchAbils = ab[T.branch] || ab.light;
      if (T.path === 'relay' && T.branch === 'grey') {
        const rl = (typeof this.relayLean === 'function') ? this.relayLean() : 0;
        branchAbils = rl > 0 ? ab.light : rl < 0 ? ab.dark : [];
      }
      grantList(ab.shared); grantList(branchAbils);
      const seat = this.tableSeat();
      // The show component: televised in the path's genre.
      this.tableLiveWrap(def.showLive);
      this.say(`◈ ${def.name.toUpperCase()} — ${def.openLine}`);
      if (branch.notes.length) {
        const noteStr = branch.notes.join('; ');
        // GREY (journey-endgame r5 2026-10-12): the relay path resolves on
        // the leaning band, not the binary ledger branch — a grey-band walker
        // hearing "the light road is open" / "the dark road is open" is
        // misvoiced. The middle gets its own road.
        let road = branch.branch;
        try { if (pathId === 'relay' && T.band === 'grey') road = 'middle'; } catch (e) {}
        this.say(`The table has read your ledger. ${noteStr.charAt(0).toUpperCase() + noteStr.slice(1)}. The ${road} road is open.`);
      }
      try { this.metaNoteTable && this.metaNoteTable(pathId); } catch (e) {}
      // PODS WEIGHT — DARK CONSCRIPT (2026-10-11, KIN canon): feared-dark
      // (domination) and relay-dark (the instrument) get the offer before
      // the challenge beats. A standalone beat; the challenge waits.
      try {
        const darkConscriptPaths = { feared: 1, relay: 1 };
        const isDark = (T.branch === 'dark') || (pathId === 'relay' && (T.band === 'dark' || (typeof this.relayLean === 'function' && this.relayLean() < 0)));
        if (darkConscriptPaths[pathId] && isDark && typeof this.podConscriptOffer === 'function') {
          const already = (typeof this.podHistory === 'function') ? this.podHistory().some(h => h.kind === 'conscript-offered' || h.kind === 'conscript-accepted') : false;
          const kidsHome = (typeof this.podKidsReturned === 'function') ? this.podKidsReturned() : false;
          if (!already && !kidsHome && (Game.state.scholar || {}).day > 7) {
            T.phase = 'conscript';
            this.podConscriptOffer(pathId);
            this.tablePrompt(
              `<p>The System waits. The pods wait. The mourners — somewhere below the light — have gone very still.</p>`,
              [
                { id: 'conscript:yes', label: 'Take them. (An army. Instruments. Say it plainly.)' },
                { id: 'conscript:no', label: 'Refuse. (Even here. Even now.)' },
              ],
              'the Table'
            );
            try { this.save(); } catch (e) {}
            return;
          }
        }
      } catch (e) {}
      this.tableRunBeat();
      try { this.save(); } catch (e) {}
    },

    // tableRunBeat: render the current beat as a modal choice.
    tableRunBeat() {
      const T = this.tableState();
      const def = pathDef(T.path);
      if (!def || !def.beats || !def.beats[T.beat]) { this.tableFail('the challenge lost its thread'); return; }
      const beat = def.beats[T.beat];
      let lines = [];
      try { lines = (typeof beat.say === 'function' ? beat.say.call(this, T) : beat.say) || []; } catch (e) {}
      const prompt = lines.map(l => `<p>${this.escHtml(l)}</p>`).join('') +
        (beat.meterLine ? `<p><i>${this.escHtml(typeof beat.meterLine === 'function' ? beat.meterLine.call(this, T) : beat.meterLine)}</i></p>` : '');
      const chList = (typeof beat.choices === 'function') ? beat.choices.call(this, T) : (beat.choices || []);
      const options = chList.map(c => ({ id: 'beat:' + c.id, label: c.label }));
      this.tablePrompt(prompt, options, def.name);
    },

    tableChoose(id) {
      const T = this.tableState();
      const def = pathDef(T.path);
      if (!def) return;
      const beatId = (id.indexOf('beat:') === 0) ? id.slice(5) : id;
      const beat = (def.beats || [])[T.beat];
      if (!beat) return;
      const chList = (typeof beat.choices === 'function') ? beat.choices.call(this, T) : (beat.choices || []);
      const choice = chList.find(c => c.id === beatId);
      if (!choice) return;
      // Apply meter/effect deltas. Ability mods (e.g. oathbound halves
      // horror gains) apply to positive gains only. Copy first: choice
      // effects may be the path def's SHARED objects (plain literals, or
      // wrappers like curdleCheck/turnCheck that return their `extra`) —
      // mutating them corrupts the def for every later walk in the session
      // (2026-10-11: oathbound permanently rewrote kill's horror 2->1).
      T.meters = T.meters || {};
      let eff = (typeof choice.effects === 'function' ? choice.effects.call(this, T) : choice.effects) || {};
      eff = Object.assign({}, eff);
      if (T.abilMods) {
        for (const k of Object.keys(eff)) {
          if (eff[k] > 0 && T.abilMods[k + 'Mult']) eff[k] = Math.max(0, Math.floor(eff[k] * T.abilMods[k + 'Mult']));
        }
      }
      for (const k of Object.keys(eff)) {
        if (k === 'grounding') { this.addGrounding(eff[k], 'the table'); continue; }
        if (k === 'sysBond') { this.addSysBond(eff[k]); continue; }
        T.meters[k] = (T.meters[k] | 0) + (eff[k] | 0);
      }
      // Meter floors (e.g. standing-o: genuine love can't crater).
      if (T.meterFloors) for (const k of Object.keys(T.meterFloors)) {
        if ((T.meters[k] | 0) < T.meterFloors[k]) T.meters[k] = T.meterFloors[k];
      }
      // A failed choice narrates its failure, not its success (2026-10-11):
      // the fail check runs BEFORE the choice's say, so a stalled price
      // never claims "you name someone" and then "there is no one to name".
      if (eff.fail) { this.tableFail(eff.fail); return; }
      if (choice.say) {
        const ls = typeof choice.say === 'function' ? choice.say.call(this, T) : choice.say;
        (Array.isArray(ls) ? ls : [ls]).forEach(l => this.say(l));
      }
      // Trial by combat (feared path): the challenge pauses — the fight is
      // real, on the grid, right now. tbEnd resumes the table.
      if (eff.trial && typeof this.tableTrialByCombat === 'function') { this.tableTrialByCombat(); return; }
      if (eff.goto != null) { T.beat = eff.goto; }
      else T.beat = (T.beat | 0) + 1;
      if (T.beat >= (def.beats || []).length) { this.tableFinals(); return; }
      this.tableRunBeat();
      try { this.save(); } catch (e) {}
    },

    // ============ FAILURE: downgrade, never wipe ============
    // A failed challenge resolves the story — a lesser frame, tribute
    // paid, people lost — never a run deletion. The table offers the
    // remaining earned paths, weakened. The player picks.
    tableFail(reason) {
      const T = this.tableState();
      const def = pathDef(T.path);
      const failDef = (def && def.failure) || {};
      T.phase = 'downgrade';
      T.weakened = (T.weakened | 0) + 1;
      this.say(`◈ THE TABLE FALTERS — ${reason}. ${(failDef.beat) || 'The ring dims. The faces confer. The offer changes.'}`);
      const remaining = this.tableEarnedPaths().filter(p => p.earned && p.id !== T.path);
      if (!remaining.length) {
        // No path left: the honest rock-bottom — Assimilated on the
        // table's terms, or the walk with nothing. The story still ends.
        // (Guarded: in production all seven paths register, so a missing
        // assimilated def means the test rig is thin — end plainly rather
        // than stranding the challenge.)
        this.say('No doors remain open. The table makes its final offer: comfort, on its terms — or the long walk with empty hands.');
        const ad = pathDef('assimilated');
        if (ad) {
          T.path = 'assimilated'; T.phase = 'challenge'; T.beat = 0; T.meters = {};
          this.say(`◈ ${ad.name.toUpperCase()} — ${ad.openLine}`);
          this.tableRunBeat();
        } else {
          this.say('You take the comfort. It is gentle. It is a trap. It is an ending — the story resolves, which is more than the void offered.');
          if (!this.winDayFloorOk()) { this.winDayFloorDefer(T); return; }
          T.phase = 'done';
          this.over = true; this.won = true;
          try { this.wipe(); } catch (e) {}
        }
        try { this.save(); } catch (e) {}
        return;
      }
      const lines = remaining.map(p => `<p><b>◇ ${this.escHtml(p.name)}</b> — weakened terms (standing ${Math.max(5, (p.strength | 0) - 25 * T.weakened)})</p>`).join('');
      this.tablePrompt(
        `<p>The ring dims. The faces confer. The offer changes.</p><p>${this.escHtml(failDef.offerLine || 'The table does not punish failure with death. It punishes it with smaller doors.')}</p>` + lines,
        remaining.map(p => ({ id: 'downgrade:' + p.id, label: `Take the weakened path of ${p.name}` })),
        'the Table'
      );
      try { this.save(); } catch (e) {}
    },
    tableDowngradePick(pathId) {
      const def = pathDef(pathId);
      if (!def) return;
      const T = this.tableState();
      this.say(`You take the smaller door. It is still a door.`);
      this.tableStartPath(pathId);
      try { this.save(); } catch (e) {}
    },

    // ============ FINALS ============
    tableFinals() {
      const T = this.tableState();
      const def = pathDef(T.path);
      if (!def) return;
      T.phase = 'finals';
      const branch = T.branch || 'light';
      const finals = (def.finals && (def.finals[branch] || def.finals.light)) || [];
      this.say(`◈ ${def.name.toUpperCase()} — the last choice is yours, and it's live.`);
      const finalOpts = finals.map(f => ({ id: 'final:' + f.id, label: f.label }));
      // PODS WEIGHT (2026-10-11, KIN canon "a weight, not a meter"): the prize
      // of the good path is replaced by a DEMAND — history determines what
      // is possible. A championed run can demand the pods opened, but the
      // table always charges. Never on dark branches.
      try {
        if (branch === 'light' && typeof this.podDemandAvailable === 'function' && this.podDemandAvailable()) {
          finalOpts.push({ id: 'final:poddemand', label: 'Demand the pods opened. (The table will charge.)' });
        }
      } catch (e) {}
      this.tablePrompt(
        `<p>The ring holds its light. Trillions of eyes. Now — the last choice is yours, and it's live:</p>`,
        finalOpts,
        def.name
      );
      try { this.save(); } catch (e) {}
    },
    tableResolveFinal(id) {
      const T = this.tableState();
      const def = pathDef(T.path);
      if (!def) return;
      const fid = (id.indexOf('final:') === 0) ? id.slice(6) : id;
      const branch = T.branch || 'light';
      const finals = (def.finals && (def.finals[branch] || def.finals.light)) || [];
      let fin = finals.find(f => f.id === fid);
      // PODS WEIGHT: the demand is a synthetic final with a price choice —
      // the table always charges. Route to the price prompt, not the outcome.
      if (!fin && fid === 'poddemand' && typeof this.podDemandAvailable === 'function' && this.podDemandAvailable()) {
        T.phase = 'demand-price';
        this.say('◈ THE DEMAND — you name it aloud: the pods. Opened. Every one. The ring goes very still. Then the System, almost respectful: "Ooh. The BIG ask. ...Alright. Everything costs. PICK your price."');
        this.tablePrompt(
          `<p>The table will open the pods. But the table always charges. Pick your price:</p>`,
          [
            { id: 'demandprice:tribute', label: 'Pay in food — 12,000 kcal off the village\'s plate.' },
            { id: 'demandprice:favor', label: 'Pay in debt — two favors owed to the System, terms unspecified.' },
            { id: 'demandprice:standing', label: 'Pay in leverage — your bargaining strength, spent openly.' },
          ],
          'the Table'
        );
        try { this.save(); } catch (e) {}
        return;
      }
      fin = fin || finals[0];
      if (!fin) return;
      const s = this.state.scholar, pg = this.progState();
      this.say(`◈ ${def.name.toUpperCase()} — "${fin.label}"`);
      const outcome = typeof fin.outcome === 'function' ? fin.outcome.call(this, T) : fin.outcome;
      (Array.isArray(outcome) ? outcome : [outcome]).forEach(l => this.say(l));
      // MUSIC (Steve 2026-10-12): endings get their bed — warm or cold.
      try { this.music('scenario', branch === 'dark' ? 'ending-dark' : 'ending-light'); } catch (e) {}
      // Epilogue: hero, facilitator, or outshone — credited honestly.
      this.tableEpilogue(def, branch, fin);
      try { this.recordMoment(`Haven's table path: ${def.name} (${branch}), choice: ${fin.label}.`); } catch (e) {}
      try { this.recordLegend({ outcome: 'table', frame: T.path, choice: fin.label }); } catch (e) {}
      try { this.metaNoteTableChoice && this.metaNoteTableChoice(T.path, fin.id); } catch (e) {}
      s.tableChoices = null;
      if (!this.winDayFloorOk()) { this.winDayFloorDefer(T); return; }
      T.phase = 'done';
      this.over = true; this.won = true;
      try { this.wipe(); } catch (e) {}
      try { this.save(); } catch (e) {}
    },

    // tableResolveDemandPrice: the table charges, the pods open, then the
    // normal epilogue (which will NOT sting — you paid).
    tableResolveDemandPrice(price) {
      const T = this.tableState();
      const def = pathDef(T.path);
      this.say(`◈ THE PRICE — "${price}." The table nods. The System rubs its hands.`);
      const lines = (typeof this.podDemandCost === 'function') ? this.podDemandCost(price) : [];
      (Array.isArray(lines) ? lines : [lines]).forEach(l => this.say(l));
      if (def) this.tableEpilogue(def, T.branch || 'light', { id: 'poddemand', label: 'Demanded the pods opened.' });
      try { this.recordMoment(`Haven's table path: ${(def || {}).name} (${T.branch}), choice: demanded the pods opened (paid ${price}).`); } catch (e) {}
      try { this.recordLegend({ outcome: 'table', frame: T.path, choice: 'demanded the pods opened' }); } catch (e) {}
      const s = this.state.scholar;
      s.tableChoices = null;
      if (!this.winDayFloorOk()) { this.winDayFloorDefer(T); return; }
      T.phase = 'done';
      this.over = true; this.won = true;
      try { this.wipe(); } catch (e) {}
      try { this.save(); } catch (e) {}
    },

    // ============ KIDS IN STASIS (2026-10-11, KIN canon) ============
    // The Taking took half the adults at the Scattering, day zero, plus
    // their children into stasis pods. The pods are a WEIGHT, not a prize
    // ("a weight, not a meter", Steve 2026-10-11): history determines what
    // is possible at the table. kidsBackEligible (ledger gate) is RETIRED —
    // see pods.js podDemandAvailable() / podOversightEpilogue().
    // castTakingMourners(n): real villagers with Taking-marked kin, aunts
    // and uncles of pod kids first. Never phantoms.
    castTakingMourners(n) {
      try {
        const mourners = (typeof this.villagersMourningTaken === 'function') ? this.villagersMourningTaken() : [];
        const isPodKin = (k) => /niece|nephew/i.test((k && k.relation) || '');
        const scored = mourners.map(id => {
          const kin = (typeof this.takenKinOf === 'function') ? (this.takenKinOf(id) || []) : [];
          return { id, kin: kin.find(isPodKin) || kin[0] || null };
        }).filter(s => s.kin);
        scored.sort((a, b) => (isPodKin(b.kin) ? 1 : 0) - (isPodKin(a.kin) ? 1 : 0));
        return scored.slice(0, n || 2);
      } catch (e) { return []; }
    },
    kidsBackOutcome(T) {
      const lines = [];
      const full = (T.path === 'beloved'); // centerpiece on Beloved-light; lesser elsewhere
      const cast = this.castTakingMourners(full ? 3 : 1);
      const first = (id) => { try { return this.displayName(id).split(' ')[0]; } catch (e) { return 'someone'; } };
      const promises = ((this.state.village || {}).takenPromises) || {};
      lines.push('The ring goes quiet. Even the System stops smiling — for exactly one second. Then: "OH! Oh oh oh! The REUNION episode! LIVE! PODS OPENING! CAMERAS ON THE LITTLE ONES!"');
      lines.push('Somewhere below, light spills out of rows of pods. Small figures sit up, blinking. The galaxy holds its breath — trillions of beings who never had childhoods watch children remember how.');
      for (const m of cast) {
        const name = first(m.id);
        const kinFirst = (m.kin.name || 'the little one').split(' ')[0];
        const kept = promises[m.id];
        lines.push(`${name} pushes through the crowd — and stops. "${kinFirst}?" Then the running. The crying. The kind of crying that has no sound at first.${kept ? ` You asked the System, all those weeks ago. You kept your word. ${name} looks at you over ${kinFirst}'s head, and doesn't need to say it.` : ''}`);
      }
      if (!cast.length) {
        lines.push('The village surges forward as one — every child claimed by shouting, laughing relatives. Nobody is left standing alone by an empty pod.');
      }
      lines.push('The System, bright as ever: "The grown-ups? Oh! Them! They\'re... elsewhere! Still! Don\'t worry! NEXT SEGMENT!" Nobody believes it. Everybody lets it pass. Today is not for that question.');
      if (full) {
        lines.push('The pods are empty. The village is loud. Somewhere in the control room, a producer is weeping into nutrient paste, and the ratings don\'t matter, and that\'s how you know it worked. You got all the kids back. All of them.');
      } else {
        lines.push('The pods are empty. It happened fast — a segment, not a saga. But the kids are home, and the village will tell the long version for years.');
      }
      try { this.state.village.kidsReturned = true; } catch (e) {}
      try { this.recordMoment('The stasis pods opened. All the kids came home.'); } catch (e) {}
      return lines;
    },

    // ============ NPC ASCENSION + FACILITATION ============
    // Competent villagers can ascend — even several in one village;
    // ascensions stack bargaining power. Facilitation is a chosen play
    // (teach, hand them the relay, shield them) with an architect's
    // payoff. Passive players get honestly outshone in the epilogue.
    villagerAscensionScore(vid) {
      try {
        const v = (this.data.villagers || []).find(x => x.id === vid);
        if (!v) return { score: 0, notes: [] };
        let score = 0; const notes = [];
        // System abilities held (count of the 6-slot kits).
        const abils = (v.abilities || []).length;
        if (abils > 0) { score += abils * 8; notes.push(`${abils} System abilities`); }
        // Knowledge breadth: the REAL villager knowledge model (convo rebuild
        // 2026-10-11): in-run learning (v.taught — fireside, fieldwork,
        // player-taught) + background familiarity. (journey-endgame r7
        // 2026-10-13: this used to read v.knowledgeBreadth/v.taughtPlants,
        // which no game system ever writes — the component was unreachable
        // in real play. Legacy fields kept as fallback.)
        const _vv = this.state.village || {};
        const _taught = ((_vv.taught || {})[vid] || []).length;
        const _fam = ((_vv.familiar || {})[vid] || []).length;
        let kb = _taught + _fam;
        if (!kb) kb = (v.knowledgeBreadth | 0) || (((v.taughtPlants || []).length) || 0);
        if (kb > 0) { score += Math.min(20, kb); notes.push('taught and teaching'); }
        // Fights survived / contests: notability as the honest proxy.
        const not = (typeof this.notabilityWeight === 'function') ? this.notabilityWeight(vid) : 0;
        if (not > 0) { score += Math.min(20, not | 0); notes.push('the cameras know their name'); }
        // Boldness: personality traits on the person record.
        const traits = v.traits || v.personality || {};
        const bold = /bold|daring|reckless|ambitious/i.test(JSON.stringify(traits));
        if (bold) { score += 10; notes.push('bold'); }
        // Trust standing: the village would follow them.
        const trust = ((this.state.village || {}).trust || {})[vid] | 0;
        if (trust >= 30) { score += 10; notes.push('the village trusts them'); }
        // Relay held: the instrument's current hands.
        try {
          const sw = (typeof this.switchboard === 'function') ? this.switchboard() : null;
          if (sw && sw.holderId === vid) { score += 15; notes.push('holds the relay'); }
        } catch (e) {}
        return { score, notes, name: v.name || 'someone' };
      } catch (e) { return { score: 0, notes: [] }; }
    },
    // tableFacilitate(kind, vid): the chosen facilitation play.
    // kinds: 'teach' (knowledge transfer — real, via existing teaching),
    // 'relay' (hand them the relay office), 'shield' (the village
    // prioritizes their safety). Tracked for the architect's credit.
    tableFacilitate(kind, vid) {
      try {
        const T = this.tableState();
        T.facilitated = T.facilitated || {};
        const f = T.facilitated[vid] || (T.facilitated[vid] = { acts: [] });
        if (f.acts.indexOf(kind) < 0) f.acts.push(kind);
        const sc = this.villagerAscensionScore(vid);
        if (kind === 'relay' && typeof this.appointSwitchboard === 'function') {
          this.appointSwitchboard(vid);
        }
        if (kind === 'shield') {
          const v = this.state.village || {};
          v.shielded = v.shielded || {};
          v.shielded[vid] = true;
          this.say(`${sc.name} is shielded now — the village's fights will spend others first. Protection is a kind of authorship.`);
        }
        if (kind === 'teach') {
          // REAL knowledge transfer (journey-endgame r7 2026-10-13): the
          // villager learns the plants the Bearer actually knows — the same
          // stores the conversation teach path writes (taught + taughtByPlayer),
          // so the lesson feeds their ascension score honestly.
          let _taughtN = 0;
          try {
            const _vv = this.state.village || {};
            for (const p of (this.data.plants || [])) {
              if (_taughtN >= 12) break;
              const pid = p.id;
              if (!this.plantKnown || !this.plantKnown(pid)) continue;
              if (this.plantKnownBy && this.plantKnownBy(vid, pid, _vv)) continue;
              if (this.villagerLearnsPlant) this.villagerLearnsPlant(vid, pid, 'player-taught');
              _vv.taughtByPlayer = _vv.taughtByPlayer || {};
              const lst = _vv.taughtByPlayer[vid] = _vv.taughtByPlayer[vid] || [];
              if (lst.indexOf(pid) === -1) lst.push(pid);
              _taughtN++;
            }
          } catch (e) {}
          this.say(`You teach ${sc.name} everything the relay taught you${_taughtN ? ` — ${_taughtN} green thing${_taughtN > 1 ? 's' : ''}, name by name` : ''}. Knowledge is the one gift that multiplies in the giving.`);
          this.addGrounding(2, 'teaching');
        }
        try { this.save(); } catch (e) {}
      } catch (e) {}
    },
    // tableAscended: villagers whose ascension score clears the bar at the
    // table. Each ascension stacks bargaining power (+path strength) and
    // gets one beat of pantheon politics.
    tableAscended(bar) {
      const out = [];
      try {
        const b = bar == null ? 45 : bar;
        for (const v of (this.data.villagers || [])) {
          if (!v || v.id === this.villagerId) continue;
          const sc = this.villagerAscensionScore(v.id);
          if (sc.score >= b) out.push({ vid: v.id, name: sc.name, score: sc.score, notes: sc.notes });
        }
      } catch (e) {}
      return out;
    },

    // ============ EPILOGUE ============
    // The ending follows the village's story; the player authors it as
    // hero, facilitator, or footnote — credited honestly.
    tableEpilogue(def, branch, fin) {
      try {
        const T = this.tableState();
        const asc = this.tableAscended();
        const fac = T.facilitated || {};
        const facIds = Object.keys(fac);
        const facAscended = asc.filter(a => fac[a.vid]);
        const unbacked = asc.filter(a => !fac[a.vid]);
        const me = ((this.data.villagers || []).find(v => v.id === this.villagerId) || {}).name || 'the Bearer';
        if (facAscended.length) {
          const names = facAscended.map(a => a.name).join(' and ');
          this.say(`◈ THE ARCHITECT — ${names} ascended through doors you built: ${facAscended.map(a => (fac[a.vid].acts || []).join(', ')).join('; ')}. The galaxy will remember the god's name. The village will remember who built the door. Both are true. Neither is small.`);
        } else if (unbacked.length) {
          const names = unbacked.map(a => a.name).join(' and ');
          this.say(`◈ OUTSHONE — ${names} did what you would not: acted, boldly, while there was still time. The village thrives. The god is someone else. The record notes, kindly and accurately, that you watched. It stings exactly as much as it should.`);
        }
        // THE PANTHEON (win-path lever 2026-10-11): was dead code — the old
        // else-if chain made "asc.length > 1" unreachable here (asc partitions
        // exactly into facAscended + unbacked, so reaching the third branch
        // meant asc was empty). docs/TABLE.md: "the pantheon's politics get
        // one beat" whenever multiple villagers ascend — it fires alongside
        // the architect/outshone beat, not instead of it.
        if (asc.length > 1) {
          const names = asc.map(a => a.name).join(' and ');
          this.say(`◈ THE PANTHEON — ${names} ascended together, and gods, it turns out, have politics. They argue about you the way the living argue about weather. Mostly, they agree: the village comes first. Mostly.`);
        }
        if (!asc.length && !facIds.length) {
          // PRONOUN HONESTY (journey-endgame r5 2026-10-12): the coda names
          // the Bearer, so it should use their pronouns — not default
          // they/them. Villagers carry gender from nameGender ('m'/'f'/null;
          // null = unfamiliar, strangers' pronouns aren't assumed).
          let pro = 'they';
          try {
            const mv = (this.data.villagers || []).find(v => v.id === this.villagerId) || {};
            pro = mv.gender === 'm' ? 'he' : mv.gender === 'f' ? 'she' : 'they';
          } catch (e) {}
          this.say(`◈ ${me} walks out of the light alone, which is how ${pro} walked in. The village endures. That was always the story.`);
        }
        // Ascensions stack bargaining power — said aloud in the audit, priced
        // into every path's standing (tableEarnedPaths); the epilogue
        // confirms the terms held through the challenge.
        if (asc.length) this.say(`The terms held — the table had priced the village, ascension${asc.length > 1 ? 's' : ''} and all, and the village paid in full.`);
        // PODS WEIGHT (2026-10-11, KIN canon): the history is read here.
        // Shrugged runs curdle (the oversight); jackpot losses are carried.
        try {
          if (typeof this.podJackpotLossEpilogue === 'function') this.podJackpotLossEpilogue();
          if (typeof this.podOversightEpilogue === 'function') this.podOversightEpilogue();
        } catch (e) {}
      } catch (e) {}
    },

    // ============ UI THEME HOOK ============
    // tableTheme: the System UI reskins per path as integration deepens.
    // Same verbs, different games. Stored on pg.table.theme for app.js;
    // the full app.js reskin is follow-up UI work — this is the contract.
    tableTheme() {
      try {
        const T = this.tableState();
        const themes = {
          feared: 'threat-display', beloved: 'broadcast-studio', witness: 'case-file',
          indispensable: 'treaty-desk', assimilated: 'clearance', defiant: 'static', relay: 'dialogue',
        };
        const theme = {
          key: themes[T.path] || 'none',
          path: T.path || null, branch: T.branch || null,
          stage: (typeof this.integrationStage === 'function') ? this.integrationStage() : 0,
          groundingTier: this.groundingTier(),
        };
        T.theme = theme;
        return theme;
      } catch (e) { return { key: 'none' }; }
    },
  };

  Object.assign(Game, methods);
})();
