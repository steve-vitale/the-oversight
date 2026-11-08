// @ontology
// system: ladder
// description: The Standing ladder — the victory-gating redesign (Steve 2026-11-07: "Yes build it and test it."). One ladder, four rungs (Village 12 / Regional 26 / National 40 counted points, cumulative), filled by five kinds of village work (Fight, Forage, Craft, Talk, Explore) with a per-track cap (60% of the current cumulative threshold) so no one kind of work can carry a rung alone. A second bar beside Standing (standing.js): Standing opens waves, the ladder opens seats (leg 2's surgery). Village-level computed bar, reads existing state only, never the scholar alone.
// provides:
//   - ladderCfg()
//   - ladderCapstones()
//   - villageLadder()
//   - ladderStage()
//   - ladderPeakStage()
//   - ladderLine()
//   - ladderStageBeat(stage)
//   - ladderCapBeat(track)
//   - ladderTick()
//   - ladderCapstoneReady(kind)
//   - ladderCapstoneDelivered()
//   - _ladderDiscoveryDeeds()
//   - _ladderLivingVeterans(minWave)
//   - _ladderPeakStage()
// rules:
//   - ladder_village_level: true (code: ladder.js — computed from village state: the wave ledger, the link roll, the feast log, summed track XP across the living roster + the scholar, codex breadth. Never the scholar alone; a new adventurer inherits the village's ladder, like the ledger.)
//   - ladder_no_new_tracking: true (code: ladder.js — reads waveLedgerPoints(), _linkSeasoned() + _linkRegionalPlus(), state.feastLog, npcXp() + playerTracks(), deedState(), codexBreadth(), hierarchyState(). No parallel counters. The only writes are the beat markers (state._ladderPeakStage, state._ladderCapBeat), mirroring standing.js's peak/hold markers. The two brief excepted records (feast-bundle flag, banked points) are NOT written here: the bundle flag is leg 2's write, the banked store is leg 3's.)
//   - ladder_cap_binds: true (code: ladder.js — counted[track] = min(total[track], floor(0.6 x threshold of the next rung)); the stage is the highest rung whose capped total meets its threshold, checked rung by rung. The rungs nest: a rung cannot pass while the one below it fails, so the loop breaks on the first failure.)
//   - ladder_cap_never_silent: true (code: ladder.js — ladderLine() names every capped track with its counted-vs-total ("Fight 9 -> 7 - capped"); ladderCapBeat() says it aloud the first time a track caps on a rung.)
//   - ladder_fail_closed: true (code: ladder.js — any missing module/data reads as 0; a missing capstone deed reads as not-ready. The ladder never opens a stage by accident.)
//   - ladder_explore_discovery_gap: true (code: ladder.js — prereg Amendment 1, 2026-11-08: discovery deeds have no lifetime per-deed store at this base (npcXp holds per-track totals only; the per-day books hold today's counts only), so Explore (i) reads 0 and the whole summed field total counts as Forage, once, never twice. The discovery deed carries the ladder:"explore" tag in tracks.json so the split is a one-line change the moment a per-deed lifetime store exists.)
//   - ladder_bundle_bonus: true (code: ladder.js — LEG 2 AMENDMENT 2026-11-08, brief §b.5: villageLadder() reads +4 per distinct bundleStage on feast-log bundle entries (bundle: true, written by hostFeast / feastBundleBuyOut in game.js), added to counted/total AFTER the per-track cap, once per stage. The record is the feast log itself; no new counter, no minting change, no threshold/cap change. FLAGGED in the leg-2 prereg + run note for coordinator review — leg 2's file scope is progression/table/game, and the bonus has to be read here for the seat to ever see it.)
// consumes:
//   - waveLedgerPoints() (waveLedger.js)
//   - hierarchyState(), _linkSeasoned(), _linkRegionalPlus(), scaleRank() (hierarchy.js, standing.js)
//   - npcXp(), playerTracks(), trackData() (tracks.js)
//   - deedState(), codexBreadth(), progState() (progression.js)
//   - sysSay() (game.js)
//   - endDay() (wrapped: the daily ladder tick)
//   - state.feastLog, state.village.npcXp, state.village.roster, state.waveKillLog
//   - Game.data.tracks, Game.data.ladderCapstones
// Load AFTER standing.js (it reuses _linkSeasoned/_linkRegionalPlus) and
// progression.js (deedState/codexBreadth/progState). Reads are all dynamic
// (this.*), so hierarchy.js loading later is fine.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  function warn(msg, e) {
    try { console.warn('[ladder] ' + msg + (e ? ': ' + (e && e.message || e) : '')); } catch (e2) {}
  }

  // LADDER_CAPSTONE_FALLBACK: mirrors src/data/ladder-capstones.json so a
  // tree without the file (or a harness that never loaded it — game.js's
  // init list gains the entry in leg 2's surgery) still reads the same
  // deed forms. The JSON is canonical; this mirror is the fallback
  // (presentation.js / waveLedgerCfg precedent). Keep the two in sync.
  const LADDER_CAPSTONE_FALLBACK = [
    {
      id: 'military_tribute', kind: 'tribute', label: 'Military tribute',
      requires: { livingVeteransWave4: 2 },
      payment: 'Two living wave-4 veterans leave Haven in the table\u2019s service (recorded on progState().ladderCapstone; the roster removal is the seat surgery, leg 2).',
      source: 'NEW — no existing military-tribute deed exists at base a04a6c0fc (no deed in src/data or src/js pays fighters in blood to the table; the nearest tribute, table.js demandprice:tribute, is a 12,000 kcal failure price, not a military deed). Defined here in data, per brief (f) Q6.',
    },
    {
      id: 'trade_charter', kind: 'charter', label: 'Trade charter',
      requires: { charteredTradeLink: 1, scaleRank: 'national' },
      payment: 'A sealed charter with a national-scale polity (a trade link with chartered=true).',
      source: 'EXISTING — hierarchy.js Charter national beat (stageNationalBeat/resolve: trade league of >=3 bonds, sign/bargain sets link.chartered=true, tariffRate 1000/1500).',
    },
    {
      id: 'feast_embassy', kind: 'feast', label: 'Feast embassy',
      requires: { feastBundle: true, ladderStage: 3 },
      payment: 'The feast bundle completed while at National stage.',
      source: 'GROUNDED — feast-log bundle flag + National stage; the bundle flag itself is leg 2\u2019s write (game.js feastPlan/hostFeast).',
    },
  ];

  const TRACKS = ['fight', 'forage', 'craft', 'talk', 'explore'];
  const LABELS = { fight: 'Fight', forage: 'Forage', craft: 'Craft', talk: 'Talk', explore: 'Explore' };

  const methods = {
    // ladderCfg: the levers. Sim starting values (brief §(c)), not canon —
    // the leg-4 calibration panel may move thresholds ±30% via prereg
    // amendment, never a mid-run retune.
    ladderCfg() {
      return {
        thresholds: [12, 26, 40], // cumulative: Village, Regional, National
        stageNames: ['Unranked', 'Village Standing', 'Regional Standing', 'National Standing', 'Galactic Seat'],
        capFrac: 0.6, // one track counts at most 60% of the next rung's threshold (7 @ 12; 15 @ 26; 24 @ 40)
        fightPerLedger: 2, // 1 Fight point per 2 wave-ledger points, waves 3-5 only
        fightWaves: [3, 4, 5],
        foragePerXp: 12, // 1 Forage point per 12 summed field XP (whole field total — see the explore-discovery-gap rule)
        craftPerXp: 12, // 1 Craft point per 12 summed craft XP
        talkPerLink: 2, // 2 Talk points per seasoned regional+ link
        talkPerContest: 1, // 1 Talk point per contest survived
        explorePerDiscovery: 4, // 1 Explore point per 4 discovery deeds (reads 0 until a per-deed lifetime store exists — prereg Amendment 1)
        explorePerBreadth: 4, // 1 Explore point per 4 breadth above the base
        exploreBreadthBase: 8, // the starting endowment of learned things
        explorePerLink: 1, // 1 Explore point per active link (formation, not seasoning — Q2 shared link, accepted)
      };
    },

    // ladderCapstones: the three capstone deed definitions (brief §(b.9),
    // Q6). Reads src/data/ladder-capstones.json when loaded, else the
    // in-code mirror above. Leg 2 adds the file to game.js's init list.
    ladderCapstones() {
      try {
        const d = (this.data && this.data.ladderCapstones) || null;
        if (d && Array.isArray(d.capstones) && d.capstones.length) return d.capstones.slice();
      } catch (e) { warn('ladderCapstones read', e); }
      return LADDER_CAPSTONE_FALLBACK.slice();
    },

    // _ladderDiscoveryDeeds: lifetime discovery deeds summed across the
    // roster — the Explore (i) source. Returns 0 at this base: no lifetime
    // per-deed store exists (npcXp holds per-track totals only; the
    // per-day books hold today's counts only). The discovery deed carries
    // ladder:"explore" in tracks.json, so when a per-deed lifetime store
    // lands, this function reads it and the split moves discovery XP out
    // of Forage into Explore (i) — one change, in this function only.
    // Until then Explore mints from breadth + links only, and discovery XP
    // stays inside the summed field total (Forage), counted once.
    _ladderDiscoveryDeeds() {
      return 0;
    },

    // _ladderLivingVeterans(minWave): living roster members with a
    // wave-minWave+ kill in state.waveKillLog — the same read standing.js
    // uses for its readiness veterans bar (living only; the scholar is
    // always living). Distinct killers, not kills.
    _ladderLivingVeterans(minWave) {
      try {
        const log = (this.state && this.state.waveKillLog) || [];
        const seen = {};
        const isLiving = (vid) => {
          if (vid === this.villagerId) return true;
          try { const vp = (typeof this.vpOf === 'function') ? this.vpOf(vid) : null; return !!(vp && !vp.dead); }
          catch (e) { return true; }
        };
        for (const e of log) {
          if (!e || !e.by || ((e.w | 0) < (minWave | 0))) continue;
          if (!isLiving(e.by)) continue;
          seen[e.by] = true;
        }
        return Object.keys(seen).length;
      } catch (e) { warn('_ladderLivingVeterans', e); return 0; }
    },

    // _ladderPeakStage: the highest ladder stage the village has ever
    // reached (the beat marker — a monotonic memory, like standing.js's
    // _standingPeakWave). Pure read; only ladderTick() writes it.
    _ladderPeakStage() {
      try { return ((this.state && this.state._ladderPeakStage) | 0) || 0; } catch (e) { return 0; }
    },

    // _ladderSummedXp(track): summed track XP across the living roster +
    // the scholar (Q3: npcXp + playerTracks, the confirmed source). The
    // scholar's vid is skipped in the roster loop and counted once via
    // playerTracks(); the dead are skipped (their XP leaves with them —
    // the ladder is the LIVING village's strength, so totals can fall
    // when villagers die; the peak stage marker remembers the climb).
    // NOTE (flagged for the leg-4 panel): npcXp seeds a villager's record
    // with their occupation lean on first touch, so the sum includes
    // starting lean (up to 12/track/person) as well as earned XP. The
    // brief's formula is literal here; whether lean should count as
    // earned work is a calibration call, not a leg-1 re-decision.
    _ladderSummedXp(track) {
      try {
        let total = 0;
        try {
          const pt = (typeof this.playerTracks === 'function') ? this.playerTracks() : null;
          if (pt && pt[track]) total += ((pt[track].xp | 0) || 0);
        } catch (e) { warn('_ladderSummedXp scholar', e); }
        const roster = ((this.state && this.state.village && this.state.village.roster) || []);
        const scholarId = this.villagerId;
        for (const vid of roster) {
          if (!vid || vid === scholarId) continue;
          let living = true;
          try {
            const vp = (typeof this.vpOf === 'function') ? this.vpOf(vid) : null;
            if (vp && vp.dead) living = false;
          } catch (e) { living = true; }
          if (!living) continue;
          try {
            const x = (typeof this.npcXp === 'function') ? this.npcXp(vid) : null;
            if (x) total += ((x[track] | 0) || 0);
          } catch (e) { warn('_ladderSummedXp npc', e); }
        }
        return total;
      } catch (e) { warn('_ladderSummedXp', e); return 0; }
    },

    // _ladderSeasonedRegionalLinks: the exact source Standing's diplomacy
    // already reads (standing.js villageStanding's link roll): seasoned
    // (_linkSeasoned) AND regional+ (_linkRegionalPlus). Reused, not
    // reimplemented.
    _ladderSeasonedRegionalLinks() {
      try {
        const ls = (typeof this.hierarchyState === 'function') ? this.hierarchyState() : [];
        let n = 0;
        for (const l of ls) {
          const seasoned = (typeof this._linkSeasoned === 'function')
            ? this._linkSeasoned(l, !!l.conquered)
            : false;
          if (seasoned && typeof this._linkRegionalPlus === 'function' && this._linkRegionalPlus(l)) n++;
        }
        return n;
      } catch (e) { warn('_ladderSeasonedRegionalLinks', e); return 0; }
    },

    // _ladderActiveLinks: active links of any kind (formation, not
    // seasoning — the Explore (iii) source; Q2 shared link, accepted).
    _ladderActiveLinks() {
      try {
        const ls = (typeof this.hierarchyState === 'function') ? this.hierarchyState() : [];
        let n = 0;
        for (const l of ls) if (l && l.status === 'active') n++;
        return n;
      } catch (e) { warn('_ladderActiveLinks', e); return 0; }
    },

    // _ladderFeastBundleDone: a feast-log entry with the bundle flag
    // (leg 2's write). False until leg 2 lands it.
    _ladderFeastBundleDone() {
      try {
        const log = (this.state && this.state.feastLog) || [];
        for (const f of log) if (f && f.bundle === true) return true;
        return false;
      } catch (e) { return false; }
    },

    // _ladderCharteredTradeLinks: active trade links sealed by the Charter
    // national beat (link.chartered = true on sign/bargain).
    _ladderCharteredTradeLinks() {
      try {
        const ls = (typeof this.hierarchyState === 'function') ? this.hierarchyState() : [];
        let n = 0;
        for (const l of ls) if (l && l.status === 'active' && l.kind === 'trade' && l.chartered === true) n++;
        return n;
      } catch (e) { warn('_ladderCharteredTradeLinks', e); return 0; }
    },

    // villageLadder: the full breakdown, honestly. PURE READ — it writes
    // nothing (the peak marker is read here, written only by ladderTick).
    // tracks are lifetime village totals; counted is what counts toward
    // the NEXT rung after the cap (the number the bar is filling);
    // capped names the tracks the cap is holding back at that rung.
    // Stage nesting: rung s passes only if the capped total at s's cap
    // meets s's threshold; a failed rung ends the check, because the
    // rungs nest (a higher rung cannot pass while a lower one fails —
    // at most one track can sit above the lower cap without counting
    // toward it, so the higher capped total stays below its threshold).
    villageLadder() {
      const zero = () => ({
        total: 0, counted: 0, cap: 0,
        tracks: { fight: 0, forage: 0, craft: 0, talk: 0, explore: 0 },
        countedTracks: { fight: 0, forage: 0, craft: 0, talk: 0, explore: 0 },
        capped: [], stage: 0, stageName: 'Unranked', peakStage: 0,
        nextThreshold: 12, nextStageName: 'Village Standing', shortfall: 12,
        detail: { fightLedger: 0, fieldXp: 0, craftXp: 0, links: 0, contests: 0, discovery: 0, breadth: 0, activeLinks: 0, bundleBonus: 0, bundleStages: [] },
      });
      try {
        const cfg = this.ladderCfg();
        const T = cfg.thresholds;
        const names = cfg.stageNames;
        // --- lifetime totals, per track ---
        let fightLedger = 0;
        try {
          for (const w of (cfg.fightWaves || [3, 4, 5])) {
            fightLedger += (typeof this.waveLedgerPoints === 'function') ? (this.waveLedgerPoints(w) | 0) : 0;
          }
        } catch (e) { warn('villageLadder fight', e); }
        const fight = Math.floor(fightLedger / (cfg.fightPerLedger || 2));
        const fieldXp = this._ladderSummedXp('field');
        const craftXp = this._ladderSummedXp('craft');
        const forage = Math.floor(fieldXp / (cfg.foragePerXp || 12));
        const craft = Math.floor(craftXp / (cfg.craftPerXp || 12));
        const links = this._ladderSeasonedRegionalLinks();
        let contests = 0;
        try { contests = ((typeof this.deedState === 'function') ? this.deedState().contestsSurvived : 0) | 0; }
        catch (e) { warn('villageLadder contests', e); }
        const talk = links * (cfg.talkPerLink || 2) + contests * (cfg.talkPerContest || 1);
        const discovery = this._ladderDiscoveryDeeds();
        let breadth = 0;
        try { breadth = (typeof this.codexBreadth === 'function') ? (this.codexBreadth() | 0) : 0; }
        catch (e) { warn('villageLadder breadth', e); }
        const activeLinks = this._ladderActiveLinks();
        const explore = Math.floor(discovery / (cfg.explorePerDiscovery || 4))
          + Math.floor(Math.max(0, breadth - (cfg.exploreBreadthBase || 8)) / (cfg.explorePerBreadth || 4))
          + activeLinks * (cfg.explorePerLink || 1);
        const tracks = { fight, forage, craft, talk, explore };
        // --- BUNDLE BONUS (leg 2, brief §b.5): +4 ladder points per stage
        // with a completed bundle, OUTSIDE the per-track cap, once per
        // stage. The record lives on the feast-log entries themselves
        // (bundle: true + bundleStage, written by hostFeast /
        // feastBundleBuyOut in game.js) — no new counter, no new store.
        // The bonus is already-earned points: it counts toward every rung
        // (added after the cap), and a second bundle at the same stage
        // adds nothing (distinct bundleStage values only).
        let bundleBonus = 0;
        const bundleStages = [];
        try {
          const log = (this.state && this.state.feastLog) || [];
          const seenStages = {};
          for (const f of log) {
            if (!f || f.bundle !== true) continue;
            const st = (f.bundleStage | 0) || 0;
            if (seenStages[st]) continue;
            seenStages[st] = true;
            bundleStages.push(st);
          }
          bundleBonus = bundleStages.length * 4;
        } catch (e) { warn('villageLadder bundle bonus', e); }
        // --- stage: highest rung whose capped total meets its threshold ---
        const capAt = (s) => Math.floor((cfg.capFrac || 0.6) * T[s - 1]);
        const countedAt = (s) => {
          const cap = capAt(s);
          let c = bundleBonus;
          for (const k of TRACKS) c += Math.min(tracks[k], cap);
          return c;
        };
        let stage = 0;
        for (let s = 1; s <= 3; s++) {
          if (countedAt(s) >= T[s - 1]) stage = s;
          else break;
        }
        // --- counted toward the NEXT rung (the number the bar fills) ---
        const nextThreshold = stage < 3 ? T[stage] : null;
        const cap = stage < 3 ? capAt(stage + 1) : capAt(3);
        const countedTracks = {};
        const capped = [];
        let counted = bundleBonus;
        for (const k of TRACKS) {
          countedTracks[k] = Math.min(tracks[k], cap);
          counted += countedTracks[k];
          if (tracks[k] > cap) capped.push(k);
        }
        const peak = Math.max(this._ladderPeakStage(), stage);
        return {
          total: tracks.fight + tracks.forage + tracks.craft + tracks.talk + tracks.explore + bundleBonus,
          counted, cap,
          tracks, countedTracks, capped,
          stage, stageName: names[stage] || 'Unranked', peakStage: peak,
          nextThreshold,
          nextStageName: stage < 3 ? (names[stage + 1] || '') : '',
          shortfall: nextThreshold == null ? 0 : Math.max(0, nextThreshold - counted),
          detail: { fightLedger, fieldXp, craftXp, links, contests, discovery, breadth, activeLinks, bundleBonus, bundleStages: bundleStages.slice() },
        };
      } catch (e) {
        warn('villageLadder', e);
        return zero();
      }
    },

    // ladderStage: 0 (unranked) / 1 (Village) / 2 (Regional) / 3 (National).
    // Stage 4 (Galactic Seat) is the capstone delivery, recorded on
    // progState by leg 2's surgery — ladderStage() never returns 4.
    ladderStage() {
      try { return (this.villageLadder().stage | 0) || 0; }
      catch (e) { warn('ladderStage', e); return 0; }
    },

    // ladderPeakStage: the highest stage ever reached (monotonic memory).
    ladderPeakStage() {
      try { return Math.max(this._ladderPeakStage(), this.ladderStage()); }
      catch (e) { warn('ladderPeakStage', e); return 0; }
    },

    // ladderLine: the honest one-line readout, in the style of
    // standingLine(): stage, counted points per track with the cap
    // marked, the threshold, and which tracks are capped. No silent
    // gates: a capped track is named, with its counted-vs-total.
    ladderLine() {
      try {
        const L = this.villageLadder();
        const bits = [];
        for (const k of TRACKS) {
          const t = L.tracks[k], c = L.countedTracks[k];
          bits.push(t > c ? `${LABELS[k]} ${t} \u2192 ${c} \u00B7 capped` : `${LABELS[k]} ${c}`);
        }
        const target = L.nextThreshold == null
          ? 'reached'
          : `${L.counted}/${L.nextThreshold} to ${L.nextStageName}`;
        let line = `Ladder \u2014 ${L.stageName} ${target} (${bits.join(' \u00B7 ')})`;
        // LEG 2: name the bundle bonus when one is banked — the bar is
        // honest about where its points came from.
        if (L.detail && (L.detail.bundleBonus | 0) > 0) line += ` (+${L.detail.bundleBonus | 0} feast-bundle bonus)`;
        if (L.nextThreshold != null && L.shortfall > 0) {
          const caps = L.capped.map(k => LABELS[k]).join(', ');
          line += ` \u2014 short ${L.shortfall}${caps ? `; capped: ${caps}` : ''}`;
        }
        return line;
      } catch (e) { return 'Ladder \u2014'; }
    },

    // ladderStageBeat(stage): the System says the rung aloud, mirroring
    // _standingReleaseBeat(). Called by ladderTick() on first reaching.
    ladderStageBeat(stage) {
      try {
        const say = (t) => { try { if (typeof this.sysSay === 'function') this.sysSay(t); } catch (e) { warn('ladderStageBeat say', e); } };
        if (stage === 1) say('\uD83D\uDCE1 VILLAGE STANDING \u2014 the System has noticed Haven. A village that fights, feeds, builds, befriends and explores is a village worth watching. The lesser seat is priced on what you did, not on one dinner.');
        else if (stage === 2) say('\uD83D\uDCE1 REGIONAL STANDING \u2014 Haven\u2019s name travels. The fires around you repeat it. Keep climbing: no one kind of work carries the next rung alone.');
        else if (stage === 3) say('\uD83D\uDCE1 NATIONAL STANDING \u2014 the galaxy has to reckon with Haven now. One last deed stands between the village and the Galactic Seat: tribute, charter, or embassy.');
      } catch (e) { warn('ladderStageBeat', e); }
    },

    // ladderCapBeat(track): the System names the cap aloud the first time
    // a track caps on a rung, mirroring _standingHoldBeat()'s cap line.
    // The cap is never silent: the village hears what is holding it back.
    ladderCapBeat(track) {
      try {
        const label = LABELS[track] || track;
        const say = (t) => { try { if (typeof this.sysSay === 'function') this.sysSay(t); } catch (e) { warn('ladderCapBeat say', e); } };
        say(`\uD83D\uDCE1 ${label} has carried this rung as far as it can \u2014 the System counts only so much of one kind of work. Breadth is the way up now: fight, forage, build, talk, explore.`);
      } catch (e) { warn('ladderCapBeat', e); }
    },

    // ladderTick: the daily ladder check, run from the Game.endDay wrap.
    // Fires stage beats on first reaching a rung and cap beats the first
    // time a track caps on the rung being attempted; records the peak
    // stage (monotonic) and per-track cap-beat marks in state. Pure
    // bookkeeping around villageLadder() — the totals themselves are
    // never written here.
    ladderTick() {
      try {
        if (!this.state || !this.state.scholar || this.over) return;
        const L = this.villageLadder();
        const st = this.state;
        if (L.stage > (st._ladderPeakStage | 0)) {
          st._ladderPeakStage = L.stage;
          this.ladderStageBeat(L.stage);
        }
        if (L.stage < 3) {
          const rung = L.stage + 1; // the rung being attempted
          st._ladderCapBeat = st._ladderCapBeat || {};
          for (const k of L.capped) {
            if (st._ladderCapBeat[k] !== rung) {
              st._ladderCapBeat[k] = rung;
              this.ladderCapBeat(k);
            }
          }
        }
      } catch (e) { warn('ladderTick', e); }
    },

    // ladderCapstoneReady(kind): is this capstone deed ready to be
    // delivered? A READ, not the delivery: the delivery itself (recording
    // on progState, paying the price) is leg 2's surgery.
    //   military_tribute — living wave-4 veterans on hand >= the data
    //     form's count (2). The veterans are the price; leg 2 records
    //     the payment.
    //   trade_charter — a sealed charter exists (an active trade link
    //     with chartered=true) and the scale is national+ (when
    //     scaleRank() is available; the chartered flag alone counts if
    //     it is not — the Charter beat only resolves at national scale).
    //   feast_embassy — the feast bundle is done (feast-log bundle flag)
    //     while at National stage. False until leg 2 writes the flag.
    // Fail-closed: any read error, or an already-delivered capstone,
    // reads as not-ready.
    ladderCapstoneReady(kind) {
      try {
        const defs = this.ladderCapstones();
        const def = defs.find(d => d && d.id === kind);
        if (!def) return { kind, ready: false, reason: 'unknown-capstone' };
        const delivered = this.ladderCapstoneDelivered();
        if (delivered) return { kind, ready: false, reason: 'delivered', delivered };
        if (kind === 'feast_embassy') {
          const stage = this.ladderStage();
          const bundle = this._ladderFeastBundleDone();
          const needStage = (def.requires && def.requires.ladderStage) || 3;
          return { kind, ready: stage >= needStage && bundle, stage, needStage, bundle, reason: !bundle ? 'no-bundle-feast' : (stage < needStage ? 'stage-short' : 'ready') };
        }
        if (kind === 'trade_charter') {
          const sealed = this._ladderCharteredTradeLinks();
          let scale = null;
          try { scale = (typeof this.scaleRank === 'function') ? this.scaleRank() : null; } catch (e) { scale = null; }
          const scaleOk = !scale ? true : (scale === 'national' || scale === 'global');
          return { kind, ready: sealed > 0 && scaleOk, charteredLinks: sealed, scale, reason: sealed <= 0 ? 'no-sealed-charter' : (!scaleOk ? 'scale-short' : 'ready') };
        }
        if (kind === 'military_tribute') {
          const need = (def.requires && def.requires.livingVeteransWave4) || 2;
          const veterans = this._ladderLivingVeterans(4);
          return { kind, ready: veterans >= need, veterans, need, reason: veterans < need ? 'veterans-short' : 'ready' };
        }
        return { kind, ready: false, reason: 'unknown-kind' };
      } catch (e) {
        warn('ladderCapstoneReady', e);
        return { kind, ready: false, reason: 'read-error' };
      }
    },

    // ladderCapstoneDelivered: which capstone (if any) the village has
    // delivered, from progState().ladderCapstone (leg 2's delivery
    // record, like pg.tableDone records the seat). Null until leg 2
    // lands the delivery.
    ladderCapstoneDelivered() {
      try {
        const pg = (typeof this.progState === 'function') ? this.progState() : null;
        return (pg && pg.ladderCapstone) || null;
      } catch (e) { return null; }
    },
  };
  Object.assign(Game, methods);

  // ---------- wraps (originals always called) ----------
  // The daily ladder tick rides the established Game.endDay wrap chain
  // (overtime.js, ledger.js, progression.js precedent): the original
  // runs first, then ladderTick() reads the ladder and fires any new
  // stage/cap beats. This is the ladder's live read site — the module
  // is called from game code every dawn, not only by tests.
  if (Game.endDay && !Game.endDay.__ladderWrapped) {
    const orig = Game.endDay;
    const w = function () {
      const r = orig.apply(this, arguments);
      try { this.ladderTick(); } catch (e) { warn('ladder endDay', e); }
      return r;
    };
    w.__ladderWrapped = true;
    Game.endDay = w;
    // Install marker (finishLog.js precedent): later modules wrap endDay
    // again, so the outermost endDay is no longer this function and the
    // flag above is not readable from Game.endDay — the marker on Game is.
    Game._ladderEndDayWrapped = true;
  }
})();
