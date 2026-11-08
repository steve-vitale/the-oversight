// @ontology
// system: metaProgression
// description: Persistent cross-run achievement codex ("Records"). A per-device record of knowledge and content encountered across ALL runs — the meta incentive to replay until everything has been seen. New games start completely fresh; achievements NEVER grant power, knowledge, or items.
// provides:
//   - metaGet()
//   - metaSave()
//   - metaReset()
//   - metaUnlock(id)
//   - metaList()
//   - metaSummary()
//   - metaNotePlant(pid)
//   - metaNoteAnimal(aid)
//   - metaNoteMonster(mid)
//   - metaNoteMonsterNamed(mid)
//   - metaNoteWaveKill(monsterId)
//   - metaNoteWaveUnlocked(wave)
//   - metaNoteArc(n)
//   - metaNoteCrisis(kind)
//   - metaNoteContest(contestId, outcome)
//   - metaNotePlayerContest(outcome, watched)
//   - metaNoteTable(frame)
//   - metaNoteTableChoice(frame, choiceId)
//   - metaNoteLegend(outcome)
//   - metaNoteSystemArrival()
//   - metaNoteDisease(effectId)
//   - metaNoteCure(effectId)
//   - ladderBankedHeadStart()
//   - ladderBankPoints(kind)
//   - ladderGrantStageReward(stage)
//   - ladderCashOut()
//   - _ladderBankApply(L)
//   - _ladderCashOutEnding(L)
//   - _ladderRewardTrader()
//   - _ladderRewardShelter()
//   - _ladderRewardLink()
//   - _es()
//   - _esRead()
//   - _esKills()
// rules:
//   - read_only_power: achievements write ONLY to localStorage key oversight.meta.v1. They never touch game state, save slots, knowledge, or items. A fresh game is provably unaffected (code: every metaNote* writes store-only; test-meta-progression-20261010.js)
//   - ladder_banked_points: the ONE approved exception to read_only_power (Steve 2026-11-07, brief §b.11, Q1 kept capped): a lost or cashed-out village's counted ladder points bank into the store (ladderBank, REPLACE), and at most 6 count toward the NEXT village's Village stage only — never Regional/National, never wave Standing. The bank is spent (cleared) once the new village reaches Village peak. (code: ladderBankPoints, _ladderBankApply, ladderBankedHeadStart)
//   - ladder_stage_rewards: each ladder stage grants one concrete benefit from existing systems — Village a river trader, Regional a free shelter, National a link (or a shelter when no known unlinked village exists) — once per stage, recorded on progState().ladderRewards. (code: ladderGrantStageReward)
//   - ladder_cash_out: a village holding at least Regional peak stage may end the run as a Respected Village: the ending is recorded as a table_won frame (legend + Records table frame, never the mt-table achievement), the climb is banked, and the run ends won. (code: ladderCashOut)
//   - corrupt_safe: corrupt stored JSON resets that key; nothing ever throws out of the meta layer (code: metaGet/metaSave try/catch)
//   - defensive_wrap: hooks wrap existing Game methods at load; an absent method is skipped silently; every hook is exception-guarded so a meta failure can never break gameplay (code: wrapHook)
//   - no_leak_hints: unmet achievements render as ??? with a vague hint, never content — "if you don't know, it doesn't show" (code: metaList, app.js recordsScreen)
//   - data_driven_thresholds: "encounter them all" tiers count against Game.data at check time, never hardcoded totals (code: metaNotePlant/metaNoteAnimal/metaNoteMonster)
// consumes:
//   - (none persistently — reads game state only transiently at event time; owns localStorage key oversight.meta.v1)
// ============ META PROGRESSION — THE CROSS-RUN RECORDS ============
// Steve's directive (2026-10-10): "We should have a meta progression outside
// the game of a completed codex. New games don't start with it but it's part
// of an achievement system. That way gives more incentive along with other
// meta progression to keep playing games until you've encountered all the
// knowledge in the game."
//
// So: a permanent per-device record of knowledge/content encountered across
// ALL runs. New games start completely fresh (no power/knowledge inheritance
// — the roguelite boundary holds); the achievement record is the incentive
// to replay until everything has been seen.
//
// Self-attaching module: Object.assign(Game, methods) + defensive wraps.
// Load after progression.js (placed after statusEffects.js so every hooked
// method — including applyStatus/cureStatus — exists at wrap time).
//
// Disease roster canon: docs/DISEASES.md — two pools, never mixed.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  const STORE_KEY = 'oversight.meta.v1';

  // Disease canon (docs/DISEASES.md, 2026-10-09): two pools, never mixed.
  const MUNDANE_DISEASES = { gutrot: 1, trichinosis: 1, disease: 1, lockjaw: 1, wound_fever: 1, trembles: 1 };
  const ALIEN_DISEASES = { howlbelly: 1, gristlefit: 1, croakbelly: 1, shellgut: 1, witness_maw: 1, flockmind: 1, eurika: 1, east_nile: 1, lemons: 1 };

  // ---- achievement data: {id, cat, name, desc, hint} ----
  // Unmet achievements show as ??? with the hint only — never content.
  const CATS = [
    ['flora', '🌿 Flora'],
    ['fauna', '🐾 Fauna'],
    ['monsters', '👹 Monsters'],
    ['escalation', '📈 The Escalation'],
    ['show', '📺 The Show'],
    ['arcs', '◈ The Long Haul'],
    ['table', '🌌 The Table'],
    ['sickness', '🤒 Sickness'],
    ['milestones', '⭐ Milestones'],
    ['style', '🎭 The Way You Played'],
  ];
  const ACH = [
    // flora
    { id: 'mp-first', cat: 'flora', name: 'First Word', desc: 'Identify your first plant.', hint: 'Learn a green thing\u2019s true name.' },
    { id: 'mp-10', cat: 'flora', name: 'Field Botanist', desc: 'Identify 10 different plants.', hint: 'Keep asking the green things who they are.' },
    { id: 'mp-25', cat: 'flora', name: 'Walking Herbarium', desc: 'Identify 25 different plants.', hint: 'More than half the green kingdom, named.' },
    { id: 'mp-all', cat: 'flora', name: 'The Whole Green', desc: 'Identify every plant species in the game.', hint: 'All of them. Every last leaf.' },
    // fauna
    { id: 'ma-first', cat: 'fauna', name: 'Meat, With a Name', desc: 'Learn your first animal.', hint: 'Learn what runs, and how it runs.' },
    { id: 'ma-12', cat: 'fauna', name: 'Tracker', desc: 'Learn 12 different animals.', hint: 'The herd is bigger than you think.' },
    { id: 'ma-30', cat: 'fauna', name: 'The Whole Herd', desc: 'Learn 30 different animals.', hint: 'Most of what walks, named.' },
    { id: 'ma-all', cat: 'fauna', name: 'Every Footprint', desc: 'Learn every animal in the game.', hint: 'All of them. Every last track.' },
    // monsters
    { id: 'mm-first', cat: 'monsters', name: 'First Contact', desc: 'Encounter your first monster and live to log it.', hint: 'Something is out there. Go find out. (Survive.)' },
    { id: 'mm-8', cat: 'monsters', name: 'Monster Watch', desc: 'Encounter 8 different monsters.', hint: 'The treeline has more surprises.' },
    { id: 'mm-20', cat: 'monsters', name: 'The Menagerie', desc: 'Encounter 20 different monsters.', hint: 'Most of what hunts, catalogued.' },
    { id: 'mm-all', cat: 'monsters', name: 'Complete Bestiary', desc: 'Encounter every monster in the game.', hint: 'All of them. Even the funny ones.' },
    { id: 'mm-named', cat: 'monsters', name: 'Name It to Tame It', desc: 'The village agrees on a monster\u2019s name through talk.', hint: 'Debate a beast\u2019s name until everyone agrees.' },
    { id: 'mm-named5', cat: 'monsters', name: 'The Naming Committee', desc: 'The village names 5 different monsters.', hint: 'Keep holding the moots. Keep voting.' },
    // escalation
    { id: 'mw-2', cat: 'escalation', name: 'It Notices You', desc: 'Face wave 2.', hint: 'Survive long enough and the show escalates.' },
    { id: 'mw-3', cat: 'escalation', name: 'It Gets Worse', desc: 'Face wave 3.', hint: 'The escalation has an escalation.' },
    { id: 'mw-4', cat: 'escalation', name: 'Apex Hour', desc: 'Face wave 4.', hint: 'The final form of the show\u2019s attention.' },
    { id: 'mw-k4', cat: 'escalation', name: 'Apex Slayer', desc: 'Kill a wave-4 creature.', hint: 'Kill the worst thing the show can send.' },
    { id: 'mw-25k', cat: 'escalation', name: 'Exterminator', desc: '25 monster kills across all runs.', hint: 'Keep killing. It keeps counting.' },
    // show
    { id: 'mc-first', cat: 'show', name: 'Taken', desc: 'Survive your first contest.', hint: 'The show will take you. Come back.' },
    { id: 'mc-win', cat: 'show', name: 'Champion', desc: 'Win a contest.', hint: 'Win one. The lights are warm.' },
    { id: 'mc-win5', cat: 'show', name: 'Fan Favorite', desc: 'Win 5 contests.', hint: 'The audience starts chanting your name.' },
    { id: 'mc-watch', cat: 'show', name: 'Student of the Game', desc: 'Study a contest from the stands.', hint: 'Watch someone else bleed. Learn.' },
    { id: 'mc-died', cat: 'show', name: 'Feed the Reels', desc: 'Die in the arena.', hint: 'The Death Reel needs content too.' },
    // arcs
    { id: 'ma2', cat: 'arcs', name: 'The Show Must Go On', desc: 'Reach Arc II — The Show.', hint: 'Keep the village alive. The sky will notice.' },
    { id: 'ma3', cat: 'arcs', name: 'Engines', desc: 'Reach Arc III — Engines.', hint: 'Become something worth compounding.' },
    { id: 'ma4', cat: 'arcs', name: 'The Inefficiency', desc: 'Reach Arc IV — The Inefficiency.', hint: 'The last arc. The point of all of it.' },
    // table
    { id: 'mt-table', cat: 'table', name: 'The Table', desc: 'Reach the galactic table and present humanity\u2019s case.', hint: 'Survive everything. Get a seat.' },
    { id: 'mt-f-indispensable', cat: 'table', name: 'The Indispensable', desc: 'Reach the table as the Indispensable.', hint: 'Become the one the galaxy needs.' },
    { id: 'mt-f-feared', cat: 'table', name: 'The Feared', desc: 'Reach the table as the Feared.', hint: 'Become the one the table fears.' },
    { id: 'mt-f-beloved', cat: 'table', name: 'The Beloved', desc: 'Reach the table as the Beloved.', hint: 'Become the audience\u2019s favorite.' },
    { id: 'mt-f-witness', cat: 'table', name: 'The Witness', desc: 'Reach the table as the Witness.', hint: 'Become the one who kept the list.' },
    { id: 'mt-f-defiant', cat: 'table', name: 'The Defiant', desc: 'Reach the table as the Defiant.', hint: 'Become the one who said no.' },
    { id: 'mt-f-assimilated', cat: 'table', name: 'The Assimilated', desc: 'Reach the table as the Assimilated.', hint: 'Become the comfortable one.' },
    { id: 'mt-f-relay', cat: 'table', name: 'The Relay', desc: 'Reach the table as the Relay — enter the matrix.', hint: 'Integrate deeply. Hold the wires.' },
    { id: 'mt-choice', cat: 'table', name: 'The Last Word', desc: 'Make the final live choice.', hint: 'Choose, at the end of everything.' },
    // sickness
    { id: 'md-m1', cat: 'sickness', name: 'Shouldn\u2019t Have Drunk That', desc: 'Contract a mundane disease.', hint: 'Risk the creek. See what happens.' },
    { id: 'md-m3', cat: 'sickness', name: 'Frequent Patient', desc: 'Contract 3 different mundane diseases.', hint: 'Collect the earthly afflictions.' },
    { id: 'md-cure', cat: 'sickness', name: 'Walked It Off', desc: 'Cure or survive a mundane disease.', hint: 'Get sick. Get better. Tell the story.' },
    { id: 'md-a1', cat: 'sickness', name: 'Warped', desc: 'Contract an alien affliction.', hint: 'Eat the wrong meat. Get bitten. Change.' },
    { id: 'md-a3', cat: 'sickness', name: 'The Collection', desc: 'Contract 3 different alien afflictions.', hint: 'Let the alien biology in. Thrice.' },
    // milestones
    { id: 'mx-s7', cat: 'milestones', name: 'Day Seven', desc: 'The System arrives.', hint: 'Survive a week. Something arrives.' },
    { id: 'mx-crisis', cat: 'milestones', name: 'It Got Real', desc: 'Live through your first crisis.', hint: 'The worst day. Survive it.' },
    { id: 'mx-grave', cat: 'milestones', name: 'The First Grave', desc: 'Bury the village\u2019s first dead.', hint: 'Someone won\u2019t make it. Honor them.' },
    { id: 'mx-win', cat: 'milestones', name: 'A Story Worth Telling', desc: 'End a run with Haven standing.', hint: 'Finish a run. Leave a legend.' },
    { id: 'mx-death', cat: 'milestones', name: 'The Village Remembers', desc: 'End a run in death.', hint: 'Not every story ends standing.' },
    // style — ESOTERIC (rogue P1, V6-3): story-shaped feats. HOW you played,
    // not what you saw. Each fires from a real game event reading real
    // state — never RNG-gated outcome tables. Recognition only: the
    // read-only-power rule holds (store-only unlocks, zero game effects).
    { id: 'es-quiet-week', cat: 'style', name: 'A Quiet Week', desc: 'Reach day 8 without a single kill — not by you, not by the village.', hint: 'Eight days. Nothing bled.' },
    { id: 'es-clean-show', cat: 'style', name: 'The Clean Show', desc: 'Win a blood contest without killing a single beast.', hint: 'The arena can end with everyone walking out.' },
    { id: 'es-clean-table', cat: 'style', name: 'The Clean Table', desc: 'Reach the galactic table with zero kills across the whole run.', hint: 'Arrive at the ring of light with clean hands.' },
    { id: 'es-peacekeeper', cat: 'style', name: 'Three Fires Settled', desc: 'Settle three disputes with words, never with fists.', hint: 'Sit people down. Make it stick. Thrice.' },
    { id: 'es-teacher', cat: 'style', name: 'The School of You', desc: 'Personally teach six different villagers.', hint: 'Show them. Yourself. One by one.' },
    { id: 'es-open-pack', cat: 'style', name: 'The Open Hand', desc: 'Give until generosity is who you are.', hint: 'The pack opens more than it closes.' },
    { id: 'es-feast', cat: 'style', name: 'The Long Table', desc: 'Host a feast for the whole village.', hint: 'Feed everyone. All at once.' },
    { id: 'es-far-gift', cat: 'style', name: 'Bread for Strangers', desc: 'Feed another village whose pot was empty.', hint: 'Their fire was cold. You brought dinner.' },
    { id: 'es-room-listens', cat: 'style', name: 'The Room Listens', desc: 'Lead until following you is a habit.', hint: 'Ten times you stepped up. They noticed.' },
    { id: 'es-hearth', cat: 'style', name: 'The Hearth', desc: 'Be the person everyone talks to.', hint: 'Fifteen conversations that mattered.' },
    { id: 'es-one-life', cat: 'style', name: 'One Life', desc: 'Carry the mantle from the first day to the legend without ever passing it on.', hint: 'No successor. Just you.' },
    { id: 'es-clean-bowls', cat: 'style', name: 'Clean Bowls', desc: 'Reach day 30 having never eaten monster meat.', hint: 'Thirty days. Nothing with too many teeth on your plate.' },
  ];
  const ACH_BY_ID = {};
  for (const a of ACH) ACH_BY_ID[a.id] = a;

  // ---- storage: localStorage with in-memory fallback (node harness) ----
  const _mem = {};
  function storage() {
    try {
      if (typeof localStorage !== 'undefined') return localStorage;
    } catch (e) {}
    return {
      getItem: k => (k in _mem ? _mem[k] : null),
      setItem: (k, v) => { _mem[k] = String(v); },
      removeItem: k => { delete _mem[k]; },
    };
  }

  function freshStore() {
    return {
      v: 1,
      unlocked: {},           // achId -> {at}
      seen: { plant: {}, animal: {}, monster: {}, monsterNamed: {}, contest: {}, crisis: {} },
      count: { monsterKills: 0, waveKills: {}, contestRuns: 0, contestWins: 0, contestSurvived: 0, contestWatched: 0, contestDeaths: 0 },
      disease: { contracted: {}, cured: {} },
      table: { frames: {}, choices: {} },
      arcs: {},
      waves: {},
      legend: { wins: 0, deaths: 0 },
      systemArrival: false,
      // LADDER BANK (leg 3, brief §b.11): {points, at, kind} — the most
      // recent fallen/cashed-out village's counted ladder points. REPLACE,
      // never accumulate; null when the last village left nothing. Read via
      // ladderBankedHeadStart() (at most 6, Village stage only).
      ladderBank: null,
    };
  }

  const methods = {
    // metaGet: load the store; corrupt data resets the key, never crashes.
    metaGet() {
      try {
        const raw = storage().getItem(STORE_KEY);
        if (!raw) return freshStore();
        const s = JSON.parse(raw);
        if (!s || typeof s !== 'object' || s.v !== 1) { this.metaReset(); return freshStore(); }
        // tolerate missing sub-objects from older writes
        const f = freshStore();
        for (const k of Object.keys(f)) if (s[k] !== undefined) f[k] = s[k];
        return f;
      } catch (e) {
        try { this.metaReset(); } catch (e2) {}
        return freshStore();
      }
    },
    // metaSave: write-through; failure (quota/private mode) is silent.
    metaSave(store) {
      try { storage().setItem(STORE_KEY, JSON.stringify(store || this._metaCache || freshStore())); }
      catch (e) {}
    },
    metaReset() {
      try { storage().removeItem(STORE_KEY); } catch (e) {}
      this._metaCache = freshStore();
    },
    _meta() {
      if (!this._metaCache) this._metaCache = this.metaGet();
      return this._metaCache;
    },
    _metaCommit() {
      // write-through so progress survives even if the tab dies mid-run
      this.metaSave(this._metaCache);
    },
    // _es(): the esoteric style tracker (rogue P1, V6-3). In-run only,
    // isolated in its own state object — NO game system reads it, so it
    // can never affect gameplay (the records.js pattern). Fresh every
    // newGame; nothing carries across runs (no cross-run inheritance).
    // _esRead() is the non-creating reader: read-only hook paths must use
    // it so a mere observation never mutates state (the meta layer's
    // byte-identical-state guarantee).
    _es() {
      const st = this.state || {};
      if (!st.esStyle) st.esStyle = { mediated: 0, taught: {}, ateMonsterMeat: false, contestMark: null };
      return st.esStyle;
    },
    _esRead() {
      try { return (this.state || {}).esStyle || null; }
      catch (e) { return null; }
    },
    // _esKills(): the run's real kill count, from the village's own
    // per-wave counters (recordWaveKill is the choke point — player TB,
    // villager field fights, and contests all score here).
    _esKills() {
      let n = 0;
      try {
        const wk = (this.state || {}).waveKills || {};
        for (const k of Object.keys(wk)) n += (wk[k] || 0);
      } catch (e) {}
      return n;
    },
    // metaUnlock(id): returns the def on first unlock, null otherwise.
    // NEVER touches game state — store-only by construction.
    metaUnlock(id) {
      const def = ACH_BY_ID[id];
      if (!def) return null;
      const s = this._meta();
      if (s.unlocked[id]) return null;
      s.unlocked[id] = { at: Date.now() };
      this._metaCommit();
      try { if (typeof Game.toast === 'function') Game.toast('\u{1F3C6} ' + def.name + ' \u2014 ' + def.desc); } catch (e) {}
      return def;
    },
    metaList() {
      const s = this._meta();
      return ACH.map(a => ({
        id: a.id, cat: a.cat, name: a.name, desc: a.desc, hint: a.hint,
        unlocked: !!s.unlocked[a.id],
        at: s.unlocked[a.id] ? s.unlocked[a.id].at : null,
      }));
    },
    metaSummary() {
      const s = this._meta();
      const byCat = {};
      for (const [cid, clabel] of CATS) byCat[cid] = { label: clabel, total: 0, unlocked: 0 };
      for (const a of ACH) {
        byCat[a.cat].total++;
        if (s.unlocked[a.id]) byCat[a.cat].unlocked++;
      }
      return { total: ACH.length, unlocked: Object.keys(s.unlocked).length, byCat };
    },

    // ---- event notes: each is store-only, exception-guarded by the wraps ----
    metaNotePlant(pid) {
      if (!pid) return;
      const s = this._meta();
      if (s.seen.plant[pid]) return;
      s.seen.plant[pid] = 1;
      const n = Object.keys(s.seen.plant).length;
      const total = ((this.data || {}).plants || []).length;
      if (n >= 1) this.metaUnlock('mp-first');
      if (n >= 10) this.metaUnlock('mp-10');
      if (n >= 25) this.metaUnlock('mp-25');
      if (total > 0 && n >= total) this.metaUnlock('mp-all');
      else this._metaCommit();
    },
    metaNoteAnimal(aid) {
      if (!aid) return;
      const s = this._meta();
      if (s.seen.animal[aid]) return;
      s.seen.animal[aid] = 1;
      const n = Object.keys(s.seen.animal).length;
      const total = ((this.data || {}).animals || []).length;
      if (n >= 1) this.metaUnlock('ma-first');
      if (n >= 12) this.metaUnlock('ma-12');
      if (n >= 30) this.metaUnlock('ma-30');
      if (total > 0 && n >= total) this.metaUnlock('ma-all');
      else this._metaCommit();
    },
    metaNoteMonster(mid) {
      if (!mid) return;
      const s = this._meta();
      if (s.seen.monster[mid]) return;
      s.seen.monster[mid] = 1;
      const n = Object.keys(s.seen.monster).length;
      const total = ((this.data || {}).monsters || []).length;
      if (n >= 1) this.metaUnlock('mm-first');
      if (n >= 8) this.metaUnlock('mm-8');
      if (n >= 20) this.metaUnlock('mm-20');
      if (total > 0 && n >= total) this.metaUnlock('mm-all');
      else this._metaCommit();
    },
    metaNoteMonsterNamed(mid) {
      if (!mid) return;
      const s = this._meta();
      if (s.seen.monsterNamed[mid]) return;
      s.seen.monsterNamed[mid] = 1;
      const n = Object.keys(s.seen.monsterNamed).length;
      if (n >= 1) this.metaUnlock('mm-named');
      if (n >= 5) this.metaUnlock('mm-named5');
      else this._metaCommit();
    },
    metaNoteWaveKill(monsterId) {
      const s = this._meta();
      s.count.monsterKills++;
      let wave = 0;
      try {
        const mdef = ((this.data || {}).monsters || []).find(m => m.id === monsterId);
        wave = (mdef && mdef.wave) || 0;
      } catch (e) {}
      if (wave > 0) {
        s.count.waveKills[wave] = (s.count.waveKills[wave] || 0) + 1;
        if (wave >= 4) this.metaUnlock('mw-k4');
      }
      if (s.count.monsterKills >= 25) this.metaUnlock('mw-25k');
      else this._metaCommit();
    },
    metaNoteWaveUnlocked(wave) {
      wave = wave | 0;
      if (wave < 1) return;
      const s = this._meta();
      if (s.waves[wave]) return;
      s.waves[wave] = 1;
      if (wave >= 2) this.metaUnlock('mw-2');
      if (wave >= 3) this.metaUnlock('mw-3');
      if (wave >= 4) this.metaUnlock('mw-4');
      else this._metaCommit();
    },
    metaNoteArc(n) {
      n = n | 0;
      if (n < 2) return;
      const s = this._meta();
      if (s.arcs[n]) return;
      s.arcs[n] = 1;
      if (n === 2) this.metaUnlock('ma2');
      else if (n === 3) this.metaUnlock('ma3');
      else if (n === 4) this.metaUnlock('ma4');
      else this._metaCommit();
    },
    metaNoteCrisis(kind) {
      const s = this._meta();
      const k = kind || 'unknown';
      let dirty = false;
      if (!s.seen.crisis[k]) { s.seen.crisis[k] = 1; dirty = true; }
      const any = Object.keys(s.seen.crisis).length > 0;
      if (any) this.metaUnlock('mx-crisis');
      if (k === 'first-grave') this.metaUnlock('mx-grave');
      else if (dirty) this._metaCommit();
    },
    metaNoteContest(contestId, outcome) {
      if (!contestId) return;
      const s = this._meta();
      if (!s.seen.contest[contestId]) {
        s.seen.contest[contestId] = { outcome: outcome || 'seen' };
        this._metaCommit();
      }
      if (outcome === 'watched' || outcome === 'studied') {
        s.count.contestWatched++;
        this.metaUnlock('mc-watch');
      } else this._metaCommit();
    },
    // metaNotePlayerContest(outcome, watched): the PLAYER's own contest fate.
    metaNotePlayerContest(outcome, watched) {
      const s = this._meta();
      if (watched) {
        s.count.contestWatched++;
        this.metaUnlock('mc-watch');
        return;
      }
      if (outcome === 'won') {
        s.count.contestRuns++; s.count.contestWins++; s.count.contestSurvived++;
        this.metaUnlock('mc-first');
        this.metaUnlock('mc-win');
        if (s.count.contestWins >= 5) this.metaUnlock('mc-win5');
        else this._metaCommit();
      } else if (outcome === 'lost' || outcome === 'survived') {
        s.count.contestRuns++; s.count.contestSurvived++;
        this.metaUnlock('mc-first');
      } else if (outcome === 'died') {
        s.count.contestRuns++; s.count.contestDeaths++;
        this.metaUnlock('mc-died');
      } else this._metaCommit();
    },
    metaNoteTable(frame) {
      if (!frame) return;
      const s = this._meta();
      s.table.frames[frame] = 1;
      this.metaUnlock('mt-table');
      if (ACH_BY_ID['mt-f-' + frame]) this.metaUnlock('mt-f-' + frame);
      else this._metaCommit();
    },
    metaNoteTableChoice(frame, choiceId) {
      const s = this._meta();
      if (frame && choiceId) s.table.choices[frame + ':' + choiceId] = 1;
      this.metaUnlock('mt-choice');
    },
    metaNoteLegend(outcome) {
      const s = this._meta();
      if (outcome === 'haven-endures' || outcome === 'table') {
        s.legend.wins++;
        this.metaUnlock('mx-win');
      } else if (outcome === 'died' || outcome === 'village-lost') {
        s.legend.deaths++;
        this.metaUnlock('mx-death');
      } else this._metaCommit();
    },
    metaNoteSystemArrival() {
      const s = this._meta();
      if (s.systemArrival) return;
      s.systemArrival = true;
      this.metaUnlock('mx-s7');
    },

    // ============ LADDER — BANKED POINTS, STAGE REWARDS, CASH-OUT (leg 3) ============
    // Brief §b.8/§b.10/§b.11 + main-session calls Q1 (keep the capped
    // exception) / Q4 (one concrete grant per stage, NOT memberBenefits).
    // The Records rule itself is NOT rewritten: knowledge persists without
    // cap as today; the banked-points exception is the approved capped one
    // (at most 6 toward the next village's Village stage only, never
    // Regional/National, never wave Standing). The store rides
    // metaGet/metaSave (localStorage key oversight.meta.v1, in-memory
    // fallback in node) as `ladderBank: {points, at, kind}` — REPLACE, never
    // accumulate: the bank holds the most recent fallen/cashed-out
    // village's points only.
    //
    // READ SIDE (designed here): the bank is applied by a villageLadder
    // wrap installed in attach() below (ladder.js is restricted to the
    // tribute fix this leg, so the read lives here, not in villageLadder).
    // ladderBankedHeadStart() returns min(bank, 6); the wrapper adds it to
    // counted/total — named in detail.bankedHeadStart, outside the
    // per-track cap like the bundle bonus — ONLY while the current
    // village's peak stage is 0. Once the village's peak reaches 1 the
    // bank is SPENT (cleared from the store) and the wrapper passes the
    // ladder through untouched. Regional/National ignore the bank by
    // construction: it never applies past peak 0, and 6 points can never
    // reach the 26-point Regional rung from below 12. Wave Standing is
    // never banked (standing.js untouched, never read by the bank). If the
    // coordinator prefers the read inside ladder.js proper, it is a ~10
    // line change there (same flagged-amendment pattern as leg 2's bundle
    // bonus) and this wrapper is removed then.
    ladderBankedHeadStart() {
      try {
        const s = this._meta();
        const b = (s && s.ladderBank) || null;
        const pts = (b && (b.points | 0)) || 0;
        return Math.max(0, Math.min(6, pts));
      } catch (e) { return 0; }
    },
    // _ladderBankApply(L): the villageLadder read side (see the LADDER
    // section header). Returns L with the banked head start applied, or L
    // untouched. Never throws out (the wrapper falls back to L).
    _ladderBankApply(L) {
      try {
        if (!L || typeof L !== 'object') return L;
        const banked = this.ladderBankedHeadStart();
        if (banked <= 0) return L;
        const peak = (L.peakStage | 0) || 0;
        if (peak >= 1) {
          // SPENT: the village has reached Village standing; the head start
          // served its purpose. Clear the bank so no later village inherits
          // a stale head start, and pass the ladder through untouched.
          try { const s = this._meta(); if (s && s.ladderBank) { s.ladderBank = null; this._metaCommit(); } } catch (e) {}
          return L;
        }
        const next = (L.nextThreshold == null ? 12 : (L.nextThreshold | 0)) || 12;
        const counted = (L.counted | 0) + banked;
        const total = (L.total | 0) + banked;
        const stage = counted >= 12 ? 1 : 0;
        const detail = Object.assign({}, L.detail || {}, { bankedHeadStart: banked });
        return Object.assign({}, L, {
          counted, total, stage,
          stageName: stage === 1 ? 'Village Standing' : (L.stageName || 'Unranked'),
          nextThreshold: stage === 1 ? 26 : next,
          nextStageName: stage === 1 ? 'Regional Standing' : 'Village Standing',
          shortfall: stage === 1 ? Math.max(0, 26 - counted) : Math.max(0, next - counted),
          detail,
        });
      } catch (e) { return L; }
    },
    // ladderBankPoints(kind): bank the CURRENT village's counted ladder
    // points. kind 'lost' (game over) or 'cashout'. REPLACE: the bank holds
    // the most recent fallen/cashed-out village's points only. A fall with
    // 0 counted points leaves an empty bank. Idempotent per run
    // (pg._ladderBanked): a second call in the same run returns the record
    // without re-banking. Reads the UNWRAPPED villageLadder (kept on
    // __ladderBankOrig by the wrap) — the village banks its OWN counted
    // points, never the inherited head start, or the bank would ratchet up
    // across villages. Returns {ok, banked, points, kind} or {ok:false, why}.
    ladderBankPoints(kind) {
      try {
        const pg = (typeof this.progState === 'function') ? this.progState() : null;
        if (pg && pg._ladderBanked) {
          const s0 = this._meta();
          const b0 = (s0 && s0.ladderBank) || null;
          return { ok: true, banked: (b0 && (b0.points | 0)) || 0, points: (b0 && (b0.points | 0)) || 0, kind: (b0 && b0.kind) || kind, already: true };
        }
        let counted = 0;
        try {
          const vl = (typeof this.villageLadder === 'function') ? this.villageLadder : null;
          const orig = (vl && vl.__ladderBankOrig) ? vl.__ladderBankOrig : null;
          const L = orig ? orig.call(this) : (vl ? vl.call(this) : null);
          counted = (L && (L.counted | 0)) || 0;
        } catch (e) { counted = 0; }
        counted = Math.max(0, counted);
        const s = this._meta();
        s.ladderBank = counted > 0 ? { points: counted, at: Date.now(), kind: kind || 'lost' } : null;
        this._metaCommit();
        if (pg) pg._ladderBanked = true;
        return { ok: true, banked: counted, points: counted, kind: kind || 'lost' };
      } catch (e) { return { ok: false, why: 'read-error' }; }
    },
    // ladderGrantStageReward(stage): grant the per-stage reward for every
    // ungranted rung up to `stage` (brief §b.8 + Q4). Called from the
    // ladderStageBeat wrap in attach() — stage completion rides the
    // existing beat path, so a jump 0→2 grants both missed stages. Grant
    // once per stage, recorded on progState().ladderRewards; a grant that
    // cannot land is NOT recorded, so it can still land later. Returns
    // {granted:[{stage, kind, detail}], skipped:[{stage, why}]}.
    ladderGrantStageReward(stage) {
      const out = { granted: [], skipped: [] };
      try {
        const pg = (typeof this.progState === 'function') ? this.progState() : null;
        if (!pg) return out;
        pg.ladderRewards = pg.ladderRewards || {};
        let live = 0;
        try { const L = (typeof this.villageLadder === 'function') ? this.villageLadder() : null; live = (L && (L.stage | 0)) || 0; } catch (e) {}
        const upto = Math.max(0, Math.min((stage | 0) || 0, live));
        for (let s = 1; s <= upto; s++) {
          if (pg.ladderRewards[s]) { out.skipped.push({ stage: s, why: 'already-granted' }); continue; }
          let g = null;
          try {
            if (s === 1) g = this._ladderRewardTrader();
            else if (s === 2) g = this._ladderRewardShelter();
            else if (s === 3) g = this._ladderRewardLink();
          } catch (e) { g = { ok: false, why: 'read-error' }; }
          if (g && g.ok) {
            pg.ladderRewards[s] = { kind: g.kind, at: Date.now(), detail: g.detail || null };
            out.granted.push({ stage: s, kind: g.kind, detail: g.detail || null });
          } else out.skipped.push({ stage: s, why: (g && g.why) || 'grant-failed' });
        }
        return out;
      } catch (e) { return out; }
    },
    // _ladderRewardTrader: VILLAGE (stage 1) — a river trader arrives
    // today. The exact state evRiverTrader writes (game.js) — the Haven
    // panel's river-trader block reads scholar.riverTrader.day === today,
    // so the trader's feed/trade/snub verbs appear at once. Small,
    // immediately useful: the trader is the game's existing traveling
    // merchant system, and a Village-stage village most needs goods + news.
    _ladderRewardTrader() {
      try {
        const s = this.state && this.state.scholar;
        if (!s) return { ok: false, why: 'no-scholar' };
        const day = (s.day || 1);
        if (s.riverTrader && s.riverTrader.day === day) return { ok: true, kind: 'trader', detail: { alreadyHere: true }, already: true };
        s.riverTrader = { day, greeted: false };
        this.say('🐪 A river trader walks into Haven a day early — word of the village\'s standing travels faster than feet. "Heard Haven\'s name on the river," they say, pack heavy, smile practiced. "Thought I\'d see it for myself."');
        try { if (typeof this.audioEvent === 'function') this.audioEvent('traderArrive'); } catch (e) {}
        return { ok: true, kind: 'trader', detail: { day } };
      } catch (e) { return { ok: false, why: 'read-error' }; }
    },
    // _ladderRewardShelter: REGIONAL (stage 2) — a free shelter rises:
    // housing +2, no wood cost. The buildShelter() write (membership.js)
    // with its 10-wood price waived: the reward IS the waived cost.
    // Housing is the binding growth constraint at Regional scale, and a
    // building is the visible "the village grows" reward.
    _ladderRewardShelter() {
      try {
        const m = (typeof this.mshipState === 'function') ? this.mshipState() : null;
        if (!m) return { ok: false, why: 'no-mship' };
        m.housing = (m.housing || 12) + 2;
        this.say('🔨 The System raises a shelter overnight — posts, canvas, a fire ring, no wood asked and no hands owed. Two more sleep warm. Housing is now ' + m.housing + '.');
        try { if (typeof this.journalNote === 'function') this.journalNote('village', 'housing', 'The System raised a shelter. Housing ' + m.housing + '.'); } catch (e) {}
        return { ok: true, kind: 'shelter', detail: { housing: m.housing } };
      } catch (e) { return { ok: false, why: 'read-error' }; }
    },
    // _ladderRewardLink: NATIONAL (stage 3) — a village bows to Haven: a
    // link forms with the best-known unlinked village, Haven primary,
    // standard 4000 kcal/wk tribute, via the existing _formLink
    // (hierarchy.js). Perception-gated: only villages the scholar knows
    // (knowsVillage — rumor, visit, or generated) can be picked, never a
    // name never heard. At National the village most needs the scale the
    // full seat demands, and a link is the biggest grant short of the seat.
    // Fallback when no known unlinked village exists: a free shelter (the
    // village builds upward while it waits to be known).
    _ladderRewardLink() {
      try {
        const ovs = ((this.state && this.state.otherVillages) || []);
        let best = null;
        for (const v of ovs) {
          if (!v || !v.id || v.id === 'haven') continue;
          try { if (typeof this.linkWith === 'function' && this.linkWith(v.id)) continue; } catch (e) {}
          try { if (typeof this.knowsVillage === 'function' && !this.knowsVillage(v)) continue; } catch (e) {}
          if (!best || ((v.opinion || 0) > (best.opinion || 0))) best = v;
        }
        if (best && typeof this._formLink === 'function') {
          const link = this._formLink(best.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
          if (link) {
            this.say('⛓️ Word of Haven\'s standing reaches ' + (best.name || 'a neighboring fire') + ' before any speaker does — they send word back: they will bow to Haven. One organization, us primary.');
            return { ok: true, kind: 'link', detail: { village: best.id, link: link.id } };
          }
        }
        const sh = this._ladderRewardShelter();
        if (sh && sh.ok) return { ok: true, kind: 'shelter-fallback', detail: { housing: (sh.detail && sh.detail.housing) || null, reason: 'no-link-candidate' } };
        return { ok: false, why: 'no-link-candidate' };
      } catch (e) { return { ok: false, why: 'read-error' }; }
    },
    // ladderCashOut(): end the run as a Respected Village (brief §b.10).
    // Offered once the village holds at least Regional stage (PEAK stage
    // >= 2 — the same peak reading leg 2 chose for the seat gate: a dip
    // from deaths must not take away the dignified exit). Records the
    // ending as a table_won frame — recordLegend({outcome:'table',
    // frame:'respected-village'}) + the frame written to the Records
    // store's table.frames DIRECTLY (not via metaNoteTable, which would
    // grant the "Reach the galactic table" achievement for a run that never
    // reached the table) — banks the village's counted ladder points under
    // the b.11 capped rule, says the ending lines from
    // src/data/table-endings.json (paths.respected-village, picked by the
    // village's top counted track), then ends the run (over + won + wipe,
    // mirroring the table-win ending sequence in table.js). Returns
    // {ok, kind, title, banked, peak, day} or {ok:false, why}.
    ladderCashOut() { // wired-exempt: leg-3 Haven entry point (app.js panelHaven calls it; the cash-out button lives there)
      try {
        const pg = (typeof this.progState === 'function') ? this.progState() : null;
        if (!pg) return { ok: false, why: 'no-prog' };
        if (this.over || this.won) return { ok: false, why: 'already-over' };
        if (pg.ladderCashedOut) return { ok: false, why: 'already-cashed-out' };
        let peak = 0, L = null;
        try { L = (typeof this.villageLadder === 'function') ? this.villageLadder() : null; peak = (L && (L.peakStage | 0)) || 0; } catch (e) {}
        if (peak < 2) return { ok: false, why: 'stage-short', peak };
        // 1. Bank the climb (capped at the read side: at most 6 toward the
        // next village's Village stage).
        const banked = this.ladderBankPoints('cashout');
        // 2. The ending lines: the respected-village entry for the
        // village's top counted track.
        const entry = this._ladderCashOutEnding(L);
        for (const line of (entry.lines || [])) { try { this.say(line); } catch (e) {} }
        try { if (typeof this.recordMoment === 'function') this.recordMoment('Haven ends its run as a Respected Village — ' + (entry.title || 'the climb banked') + '.'); } catch (e) {}
        try { if (typeof this.recordLegend === 'function') this.recordLegend({ outcome: 'table', frame: 'respected-village', choice: entry.title || 'The Respected Village' }); } catch (e) {}
        // 3. Records frame (direct store write — see the header above).
        try {
          const s = this._meta();
          s.table = s.table || { frames: {}, choices: {} };
          s.table.frames = s.table.frames || {};
          s.table.frames['respected-village'] = 1;
          this._metaCommit();
        } catch (e) {}
        // 4. Mark + end the run like a table win.
        const day = ((this.state && this.state.scholar && this.state.scholar.day) || 0);
        pg.ladderCashedOut = { day, banked: (banked && banked.banked) || 0, peak };
        try { pg.tableWaiting = false; } catch (e) {}
        this.over = true; this.won = true;
        try { if (typeof this.wipe === 'function') this.wipe(); } catch (e) {}
        try { if (typeof this.save === 'function') this.save(); } catch (e) {}
        return { ok: true, kind: 'respected-village', title: entry.title || null, banked: (banked && banked.banked) || 0, peak, day };
      } catch (e) { return { ok: false, why: 'read-error' }; }
    },
    // _ladderCashOutEnding(L): the respected-village ending entry for the
    // village's top counted track. Reads Game.data.tableEndings (loaded by
    // game.js init); falls back to a generic two-line ending when the data
    // is absent so cash-out never fails for missing data. Ladder tracks
    // (fight/forage/craft/talk/explore) map to the file's track selectors
    // (combat/field/craft/social/strange).
    _ladderCashOutEnding(L) {
      const FALLBACK = { title: 'THE RESPECTED VILLAGE', lines: ['You do not take the seat. You take the long way home instead — and the village walks it standing taller than it ever stood.', 'The table remembers the villages that knew when to stop climbing. Haven is one of them now. The next fire starts higher for it.'] };
      try {
        const paths = (this.data && this.data.tableEndings && this.data.tableEndings.paths) || null;
        const entry = (paths && paths['respected-village']) || null;
        if (!entry) return FALLBACK;
        const MAP = { fight: 'combat', forage: 'field', craft: 'craft', talk: 'social', explore: 'strange' };
        const ORDER = ['fight', 'forage', 'craft', 'talk', 'explore'];
        const ct = (L && L.countedTracks) || {};
        let top = 'fight';
        for (const k of ORDER) if (((ct[k] | 0) || 0) > ((ct[top] | 0) || 0)) top = k;
        const sel = entry['track:' + (MAP[top] || 'field')] || entry['track:field'] || null;
        const e = (sel && sel.light) || null;
        if (!e || !Array.isArray(e.lines) || !e.lines.length) return FALLBACK;
        return { title: e.title || FALLBACK.title, lines: e.lines.slice() };
      } catch (e2) { return FALLBACK; }
    },
    metaNoteDisease(effectId) {
      if (!effectId) return;
      const s = this._meta();
      const pool = MUNDANE_DISEASES[effectId] ? 'mundane' : (ALIEN_DISEASES[effectId] ? 'alien' : null);
      if (!pool) return;
      if (s.disease.contracted[effectId]) return;
      s.disease.contracted[effectId] = 1;
      const nm = Object.keys(s.disease.contracted).filter(id => MUNDANE_DISEASES[id]).length;
      const na = Object.keys(s.disease.contracted).filter(id => ALIEN_DISEASES[id]).length;
      if (nm >= 1) this.metaUnlock('md-m1');
      if (nm >= 3) this.metaUnlock('md-m3');
      if (na >= 1) this.metaUnlock('md-a1');
      if (na >= 3) this.metaUnlock('md-a3');
      else this._metaCommit();
    },
    metaNoteCure(effectId) {
      if (!effectId || !MUNDANE_DISEASES[effectId]) return;
      const s = this._meta();
      s.disease.cured[effectId] = 1;
      this.metaUnlock('md-cure');
    },
  };

  Object.assign(Game, methods);

  // ============ WRAPS ============
  // Defensive: an absent method is skipped silently; every hook is
  // exception-guarded so a meta failure can never break gameplay.
  function wrapHook(name, after, before) {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function metaWrapped(...args) {
      let pre = null;
      if (before) { try { pre = before.call(this, args); } catch (e) {} }
      const r = orig.apply(this, args);
      if (after) { try { after.call(this, args, r, pre); } catch (e) {} }
      return r;
    };
  }

  (function attach() {
    // knowledge: plants
    wrapHook('identifyPlant', function (args) {
      const pid = args[0];
      try { if (this.state && this.state.codex && this.state.codex.plants && this.state.codex.plants[pid]) this.metaNotePlant(pid); } catch (e) {}
    });
    // knowledge: animals (_noteAnimalDepth returns false on no-op)
    wrapHook('_noteAnimalDepth', function (args, r) {
      if (r) this.metaNoteAnimal(args[0]);
    });
    // knowledge: monsters — every encounter, plus the wave it belongs to
    wrapHook('ensureMonsterEntry', function (args) {
      const mid = args[0];
      this.metaNoteMonster(mid);
      try {
        const mdef = ((this.data || {}).monsters || []).find(m => m.id === mid);
        if (mdef && mdef.wave) this.metaNoteWaveUnlocked(mdef.wave);
      } catch (e) {}
    });
    // the village agrees on a monster's name through talk
    wrapHook('monsterNamingCheck', function (args) {
      const mid = args[0];
      try {
        const e = ((this.state || {}).codex || {}).monsters || {};
        if (e[mid] && e[mid].villageName) this.metaNoteMonsterNamed(mid);
      } catch (e2) {}
    });
    // kills by wave (recordWaveKill already resolves the monster's wave)
    wrapHook('recordWaveKill', function (args) {
      this.metaNoteWaveKill(args[0]);
    });
    // escalation: unlockedWave is pure — record the max seen; a drop means a new run
    let _waveMax = 1;
    wrapHook('unlockedWave', function (args, r) {
      const w = r | 0;
      if (w < _waveMax) _waveMax = w; // new run starts at wave 1
      if (w > _waveMax) { _waveMax = w; this.metaNoteWaveUnlocked(w); }
    });
    // arcs
    wrapHook('arcBeat', function (args) {
      this.metaNoteArc(args[0]);
    });
    // crises
    wrapHook('noteCrisis', function (args) {
      this.metaNoteCrisis(args[0]);
    });
    // contest knowledge (watched/studied/learned)
    wrapHook('contestLearn', function (args) {
      this.metaNoteContest(args[0], args[1]);
    });
    // the player's own contest fate: won / lost / died
    wrapHook('_contestEnd', function (args) {
      const ac = args[0] || {};
      const watched = !!(ac.participant && ac.participant !== 'player');
      this.metaNotePlayerContest(args[1], watched);
    });
    wrapHook('_showEnd', function (args) {
      this.metaNotePlayerContest(args[1], true);
    });
    wrapHook('_contestDie', function () {
      this.metaNotePlayerContest('died', false);
    });
    // the table (2026-10-11): the real table (table.js) calls metaNoteTable /
    // metaNoteTableChoice directly at scene, path choice, and final — these
    // wraps are intentionally absent: they bind at this file's load time,
    // before table.js loads, so they'd attach to nothing.
    // legend: how the run ended
    wrapHook('recordLegend', function () {
      try {
        const lin = (this.lineage && this.lineage()) || [];
        const last = lin[lin.length - 1];
        if (last && last.outcome) this.metaNoteLegend(last.outcome);
      } catch (e) {}
    });
    // day-7 system arrival
    wrapHook('checkSystemArrival', function () {
      try { if (this.state && this.state.systemArrived) this.metaNoteSystemArrival(); } catch (e) {}
    });
    // diseases: the single application path (canon: two pools, never mixed).
    // applyStatus returns true only when the effect actually landed.
    wrapHook('applyStatus', function (args, r) {
      if (r && args[0] === 'scholar') this.metaNoteDisease(args[1]);
    });
    wrapHook('cureStatus', function (args, r) {
      if (r && args[0] === 'scholar') this.metaNoteCure(args[1]);
    });

    // ============ LADDER — BANKED POINTS, STAGE REWARDS, CASH-OUT (leg 3) ============
    // villageLadder wrap: the banked-points READ SIDE (see the LADDER
    // section in methods above). ladder.js loads before this file
    // (index.html order), so Game.villageLadder exists here; if it does
    // not, the wrap is skipped silently (defensive_wrap rule) and the bank
    // simply never applies. The original is kept on __ladderBankOrig so
    // ladderBankPoints() can read the village's OWN counted total (without
    // the inherited head start — otherwise the bank would ratchet up
    // across villages).
    if (typeof Game.villageLadder === 'function' && !Game.villageLadder.__ladderBankWrapped) {
      const _origVL = Game.villageLadder;
      const _wVL = function () {
        const L = _origVL.apply(this, arguments);
        try { return (typeof this._ladderBankApply === 'function') ? this._ladderBankApply(L) : L; }
        catch (e) { return L; }
      };
      _wVL.__ladderBankWrapped = true;
      _wVL.__ladderBankOrig = _origVL;
      Game.villageLadder = _wVL;
    }
    // ladderStageBeat wrap: per-stage rewards ride the existing beat path
    // (ladder.js ladderTick fires the beat on first reaching a rung). The
    // original says the beat first; the grant follows, once per stage.
    wrapHook('ladderStageBeat', function (args) {
      try { if (typeof this.ladderGrantStageReward === 'function') this.ladderGrantStageReward(args[0]); } catch (e) {}
    });
    // wipe wrap: a LOST village banks its climb (brief §b.11). Every
    // game-over path ends in wipe(); the wrap banks only when the run
    // actually ended lost (over + villageLost, not won) and only once per
    // run (ladderBankPoints is idempotent via pg._ladderBanked). Cash-out
    // banks explicitly inside ladderCashOut() before wipe, so this wrap
    // must not re-bank it (the idempotency marker covers that too).
    wrapHook('wipe', function () {
      try {
        if (this.over && this.villageLost && !this.won && typeof this.ladderBankPoints === 'function') this.ladderBankPoints('lost');
      } catch (e) {}
    });

    // ============ ESOTERIC STYLE ACHIEVEMENTS (rogue P1, V6-3) ============
    // Story-shaped feats: HOW the player played, detected from real game
    // state at real events — never RNG-gated outcome tables. Every hook is
    // exception-guarded (wrapHook) and store-only on unlock: recognition,
    // never power (read-only-power rule). In-run counters live in the
    // isolated state.esStyle tracker (_es) — no game system reads them.

    // playstyle axes: the game already notices who you are ("Not stats —
    // behavior"). The real behavioral counters, read after the increment.
    wrapHook('notePlaystyle', function (args) {
      const axis = args[0];
      const n = ((((this.state || {}).scholar || {}).playstyle || {})[axis]) || 0;
      if (axis === 'generous' && n >= 5) this.metaUnlock('es-open-pack');
      else if (axis === 'leader' && n >= 10) this.metaUnlock('es-room-listens');
      else if (axis === 'social' && n >= 15) this.metaUnlock('es-hearth');
    });

    // mediation: a conflict genuinely settled with words. The before-hook
    // captures the open conflict object; the after-hook counts only when
    // THIS call set it resolved (a failed mediation raises tension instead
    // and must not count).
    wrapHook('mediateConflict', function (args, r, pre) {
      if (!r || !r.ok || !pre || !pre.resolved) return;
      const t = this._es();
      t.mediated = (t.mediated || 0) + 1;
      if (t.mediated >= 3) this.metaUnlock('es-peacekeeper');
    }, function (args) {
      const vid = args[0];
      const v = (this.state || {}).village || {};
      return (v.conflicts || []).find(x => !x.resolved && x.known && (x.a === vid || x.b === vid)) || null;
    });

    // teaching: the player genuinely taught them. Only the conversation
    // teach path writes source 'player-taught' — villagers teaching each
    // other ('taught') and fieldwork ('fieldwork') don't count. This is
    // YOUR school.
    wrapHook('villagerLearnsPlant', function (args) {
      if (args[2] !== 'player-taught') return;
      const t = this._es();
      t.taught = t.taught || {};
      t.taught[args[0]] = 1;
      if (Object.keys(t.taught).length >= 6) this.metaUnlock('es-teacher');
    });

    // monster meat on YOUR plate: maybeMonsterWeirdness is called from both
    // player eat paths with the real inventory item. The village-cooked
    // exposure pass (game.js, village meals) passes a SYNTHETIC
    // {plantId, foodState, name} with no units — real items have units, so
    // the mark fires only when the scholar actually eats. monsterMeatGated
    // separates true monster flesh from ordinary animal meat.
    wrapHook('maybeMonsterWeirdness', function (args) {
      const it = args[0];
      if (!it || !('units' in it)) return;
      const pid = it.plantId || '';
      if (pid.indexOf('meat_') === 0 && this.monsterMeatGated(pid.slice(5))) {
        this._es().ateMonsterMeat = true;
      }
    });

    // day checks: endDay is the once-per-day choke point; scholar.day has
    // already incremented when the after-hook runs. Read-only paths use
    // _esRead() — a quiet week must not scribble on state to notice itself.
    wrapHook('endDay', function () {
      const day = ((this.state || {}).scholar || {}).day || 0;
      if (day === 8 && this._esKills() === 0) this.metaUnlock('es-quiet-week');
      else if (day === 30) {
        const t = this._esRead();
        if (!t || !t.ateMonsterMeat) this.metaUnlock('es-clean-bowls');
      }
    });

    // the clean show: a blood contest won with zero kills while the arena
    // was live. The mark is taken when the interruption begins; contest
    // kills score recordWaveKill like wild kills, so the per-wave village
    // counters are the honest measure. cat 'blood' routes to real fights
    // (_cxBlood); other cats can never produce a beast kill, so a win
    // there would be a hollow feat.
    wrapHook('contestInterruption', function (args) {
      this._es().contestMark = { id: ((args[0] || {}).id) || null, kills: this._esKills() };
    });
    wrapHook('_contestEnd', function (args) {
      const ac = args[0] || {};
      if (args[1] !== 'won') return;
      if (ac.participant && ac.participant !== 'player') return; // the player's own win
      const t = this._esRead();
      const mark = t && t.contestMark;
      if (t) t.contestMark = null;
      if (!mark) return;
      const contest = (typeof this._cxScaledContest === 'function') ? this._cxScaledContest(ac) : null;
      if (!contest || contest.cat !== 'blood') return;
      if (this._esKills() === mark.kills) this.metaUnlock('es-clean-show');
    });

    // the clean table: metaNoteTable fires at the real sitting (table.js) —
    // the after-hook reads the run's kill state. Zero kills, all run, at
    // the ring of light.
    wrapHook('metaNoteTable', function () {
      if (this._esKills() === 0) this.metaUnlock('es-clean-table');
    });

    // one life: recordLegend is the run's last write. lineage() holds every
    // PRIOR bearer <redacted> push time (playerDeath pushes the dead bearer) —
    // empty means this scholar is the first and only. Read in the
    // before-hook: the real recordLegend pushes before any after-hook runs.
    wrapHook('recordLegend', function (args, r, pre) {
      if (pre === 0) this.metaUnlock('es-one-life');
    }, function () {
      try { return (typeof this.lineage === 'function') ? (this.lineage() || []).length : -1; }
      catch (e) { return -1; }
    });

    // feasts and far gifts: real food moved, real state changed.
    wrapHook('hostFeast', function (args, r) {
      if (r && r.ok && (r.spent || 0) > 0) this.metaUnlock('es-feast');
    });
    wrapHook('villageShareFood', function (args, r, pre) {
      if (r === true && pre && pre.wasLean) this.metaUnlock('es-far-gift');
    }, function (args) {
      const ov = ((this.state || {}).otherVillages || []).find(x => x.id === (args[0] || null));
      return { wasLean: ov ? (ov.pantryKcal || 0) <= 0 : false };
    });
  })();
})();
