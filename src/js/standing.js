// @ontology
// system: standing
// description: The village's Standing with the System — one bar, three sources (war, diplomacy, plenty). Waves 4-5 unlock on Standing, not on the old two-rung kill+scale gate: the System escalates its attention as the village proves itself. Steve 2026-10-13: the flexible route — several paths or hybrid paths to victory; no win before day 90; every wave must have an impact.
// provides:
//   - standingCfg()
//   - villageStanding()
//   - villageStandingTotal()
//   - standingLine()
//   - _linkRegionalPlus()
//   - waveUnlockReady()
//   - standingDeferral()
//   - standingPlentyCappedTotal()
//   - _standingPeakWave()
//   - _standingHoldBeat()
//   - _standingReleaseBeat()
// rules:
//   - standing_village_level: true (code: standing.js — computed from village state: the ledger, the link roll, the feast log. Never the scholar alone; a new adventurer inherits the village's standing, like the ledger.)
//   - standing_no_new_tracking: true (code: standing.js — reads waveLedgerPoints(), _linkSeasoned(), _linkRegionalPlus() (which itself reads only polityOf/_covenantPolity/_tradePolity), state.feastLog (written by hostFeast). No parallel counters.)
//   - standing_sim_tuning: true (code: standing.js — point values and thresholds are sim starting points per the 2026-10-13 spec, not canon; tune on measured evidence.)
//   - standing_villager_kills_count: true (code: standing.js — the war source reads waveLedgerPoints, which scores player AND villager kills (recordWaveKill). A mayor whose villagers do the killing earns war standing.)
//   - standing_regional_plus: true (code: standing.js — the diplomacy source counts only SEASONED REGIONAL+ links: a link participates in a regional-scale polity (LEAD realm via polityOf('haven'), BELONG realm via polityOf(primary), seasoned covenant/trade league). A lone seasoned bond with a splinter village is courtship, not regional power — it scores 0. 2026-10-14 design call, Steve can overrule.)
//   - standing_readiness_gate: true (code: standing.js — villageStandingTotal() gates the unlock number: (1) faced-experience deferral — wave 4 needs readyFacedW3 distinct wave-3 types faced blow-by-blow (waveEngaged; fleeing counts), wave 5 needs readyFacedW4 wave-4 types, else the total holds at t4-1/t5-1; (2) plenty cap — plenty counts at most plentyCapT5 toward the T5 bar, else held at t5-1; (3) monotonic peak ratchet — _standingPeakWave floors the total at the released wave's threshold forever. Thresholds are sim starting points (sim-readinessgate2 spec, 2026-10-15), not canon — Steve can overrule. Armor P and trust are OUT of the bar by diagnostic evidence.)
//   - standing_no_silent_gates: true (code: standing.js — every hold/cap is named: standingLine() appends HELD/capped notes, _standingHoldBeat() fires the System beat (initial + 7-day reminders for deferrals, one-time for the cap), _standingReleaseBeat() announces the opening.)
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const methods = {
    // standingCfg: the levers. Sim starting points (2026-10-13 spec), not
    // canon — tune on measured evidence (wave-4 organic unlocks on
    // ~30-50% of day-80+ runs; earliest T4 >= ~day 60).
    standingCfg() {
      return {
        warPerKill: 25,       // +25 per wave-3+ ledger kill point (per-type cap 2 lives in the ledger)
        diplomacyPerLink: 34, // +34 per seasoned link (30+ days, trust 40+)
        plentyPerFeast: 20,   // +20 per major feast (quality>=1: fine or legendary)
        t4: 100,              // wave 4 unlocks: 4 kills | 3 links | 5 feasts | hybrid
        t5: 200,              // wave 5 unlocks (+ wave-4 faced)
        feastQualityMin: 1,
        feastLogCap: 60,
        // READINESS GATE (sim-readinessgate2 spec, 2026-10-15 — sim starting
        // points, not canon; Steve can overrule):
        readyFacedW3: 3,      // distinct wave-3 types faced blow-by-blow to release wave 4
        readyFacedW4: 2,      // distinct wave-4 types faced blow-by-blow to release wave 5
        plentyCapT5: 100,     // plenty counts at most this toward the T5 bar
      };
    },
    // _linkRegionalPlus: a seasoned link counts toward diplomacy only when it
    // is a REGIONAL+ link — i.e. it participates in a regional-scale polity.
    // Steve's 2026-10-13 spec says "+34 per seasoned regional+ link"; a lone
    // bond with a splinter village (no polity behind it) is courtship, not
    // regional power, and doesn't move the System. Design call 2026-10-14
    // (Steve can overrule), determined from the link/scale code:
    //   LEAD   — one of Haven's seasoned subordinate links AND
    //            polityOf('haven') exists (>=3 seasoned subordinates: a
    //            realm — four fires under one head). Keeps the spec's
    //            "3 links = 102: the pure DIPLOMACY path" honest.
    //   BELONG — Haven is subordinate AND polityOf(primary) exists (the
    //            primary's realm holds >=4 villages).
    //   LEAGUE — a seasoned covenant/trade peer link inside its league
    //            polity (_covenantPolity()/_tradePolity() non-null, this
    //            link among its member links).
    // Reads only existing APIs — no new tracking. Fail-closed: missing
    // APIs or any error read as not-regional+ (never unlocks by accident).
    _linkRegionalPlus(l) {
      try {
        if (!l || l.status !== 'active') return false;
        const HOME = 'haven';
        const isSub = (l.primary === HOME && l.subordinate !== HOME);
        const isBelong = (l.subordinate === HOME && l.primary !== HOME);
        const isPeer = (l.kind === 'covenant' || l.kind === 'trade');
        if (isSub && typeof this.polityOf === 'function') {
          return !!this.polityOf(HOME);
        }
        if (isBelong && typeof this.polityOf === 'function') {
          return !!this.polityOf(l.primary);
        }
        if (isPeer) {
          if (typeof this._linkSeasoned !== 'function' || !this._linkSeasoned(l)) return false;
          if (l.kind === 'covenant' && typeof this._covenantPolity === 'function') {
            const cp = this._covenantPolity();
            if (cp && cp.links) for (let i = 0; i < cp.links.length; i++) if (cp.links[i] === l) return true;
          }
          if (l.kind === 'trade' && typeof this._tradePolity === 'function') {
            const tp = this._tradePolity();
            if (tp && tp.links) for (let i = 0; i < tp.links.length; i++) if (tp.links[i] === l) return true;
          }
          return false;
        }
        return false;
      } catch (e) { return false; }
    },
    // villageStanding: the full breakdown, honestly. Reads only existing
    // state — the ledger (waveLedgerPoints), the link roll (_linkSeasoned +
    // the regional+ filter), the feast log (hostFeast writes state.feastLog).
    villageStanding() {
      const cfg = this.standingCfg();
      let warPts = 0;
      try {
        for (const w of [3, 4, 5]) {
          warPts += (typeof this.waveLedgerPoints === 'function') ? (this.waveLedgerPoints(w) | 0) : 0;
        }
      } catch (e) {}
      let links = 0;
      try {
        const ls = (typeof this.hierarchyState === 'function') ? this.hierarchyState() : [];
        for (const l of ls) {
          const seasoned = (typeof this._linkSeasoned === 'function')
            ? this._linkSeasoned(l, !!l.conquered)
            : false;
          // REGIONAL+ FILTER (2026-10-14): seasoned alone is not enough —
          // the link must participate in a regional-scale polity.
          if (seasoned && this._linkRegionalPlus(l)) links++;
        }
      } catch (e) {}
      let feasts = 0;
      try {
        const log = (this.state && this.state.feastLog) || [];
        for (const f of log) if (((f && f.quality) | 0) >= cfg.feastQualityMin) feasts++;
      } catch (e) {}
      const war = warPts * cfg.warPerKill;
      const diplomacy = links * cfg.diplomacyPerLink;
      const plenty = feasts * cfg.plentyPerFeast;
      return { total: war + diplomacy + plenty, war, diplomacy, plenty, warPts, links, feasts };
    },
    // villageStandingTotal: the GATED number the unlock gate reads.
    // Missing module/data reads as 0 — never unlocks by accident.
    //
    // READINESS GATE (sim-readinessgate2 spec, 2026-10-15; rebuild v3):
    // three layers on the honest breakdown, all in this function so
    // unlockedWave() in game.js stays untouched (it is the only engine
    // reader):
    //   1. PLENTY CAP — plenty counts at most plentyCapT5 toward the T5
    //      bar: raw >= t5 but capped < t5 holds the total at t5-1
    //      (one-time System beat). Bread alone cannot buy the fifth draft.
    //   2. FACED-EXPERIENCE DEFERRAL — wave 4 releases only after
    //      readyFacedW3 distinct wave-3 types are faced blow-by-blow
    //      (waveEngaged: fleeing counts, you stood on the grid), wave 5
    //      after readyFacedW4 wave-4 types. While deferred the total holds
    //      at t4-1 / t5-1, with the hold beat + weekly reminders naming
    //      the bar. The war-road-native signal; reachable on diplomacy /
    //      plenty roads (unlike kills/counters). No silent gates.
    //   3. MONOTONIC PEAK RATCHET — once the gated total releases wave w,
    //      _standingPeakWave records it and the effective total never
    //      drops below that wave's threshold again: a broken link can't
    //      re-lock an opened draft (the deferral beat promises it "opens").
    // The tightest applicable hold is the binding one — that's the message
    // the player hears.
    villageStandingTotal() {
      try {
        const cfg = this.standingCfg();
        const t4 = (cfg.t4 | 0) || 100, t5 = (cfg.t5 | 0) || 200;
        const s = this.villageStanding();
        const raw = (s.total | 0) || 0;
        const cap = (cfg.plentyCapT5 | 0) || 100;
        const capped = ((s.war | 0) + (s.diplomacy | 0) + Math.min((s.plenty | 0), cap)) | 0;
        let peak = this._standingPeakWave();
        const rd4 = this.waveUnlockReady(4), rd5 = this.waveUnlockReady(5);
        const holds = [];
        if (raw >= t5 && capped < t5 && peak < 5) holds.push({ bound: t5 - 1, kind: 'cap' });
        if (raw >= t4 && !rd4.ready && peak < 4) holds.push({ bound: t4 - 1, kind: 'defer4', rd: rd4 });
        if (capped >= t5 && !rd5.ready && peak < 5) holds.push({ bound: t5 - 1, kind: 'defer5', rd: rd5 });
        let gated = raw;
        for (const h of holds) if (h.bound < gated) gated = h.bound;
        let minBound = Infinity;
        for (const h of holds) if (h.bound < minBound) minBound = h.bound;
        const binding = (minBound < raw) ? holds.filter(h => h.bound === minBound) : [];
        // release: the gated total opens a new wave — record the peak (one-way)
        if (gated >= t5 && peak < 5) {
          peak = 5; this.state._standingPeakWave = 5; this._standingReleaseBeat(5);
        } else if (gated >= t4 && peak < 4) {
          peak = 4; this.state._standingPeakWave = 4; this._standingReleaseBeat(4);
        }
        for (const h of binding) this._standingHoldBeat(h);
        const floor = peak >= 5 ? t5 : peak >= 4 ? t4 : 0;
        return Math.max(gated, floor);
      } catch (e) {
        try { return (this.villageStanding().total | 0) || 0; } catch (e2) { return 0; }
      }
    },
    // waveUnlockReady(w): the faced-experience bar — distinct wave-(w-1)
    // types faced blow-by-blow (waveEngaged: fleeing counts, you stood on
    // the grid). Waves 1-3 are unchanged (never gated); unknown waves fail
    // closed. Thresholds are sim starting points (2026-10-15 spec), not canon.
    waveUnlockReady(w) {
      try {
        const cfg = this.standingCfg();
        if (w === 4) {
          const need = (cfg.readyFacedW3 | 0) || 3;
          const faced = (typeof this.waveEngaged === 'function') ? (this.waveEngaged(3) | 0) : 0;
          return { wave: 4, ready: faced >= need, faced, need };
        }
        if (w === 5) {
          const need = (cfg.readyFacedW4 | 0) || 2;
          const faced = (typeof this.waveEngaged === 'function') ? (this.waveEngaged(4) | 0) : 0;
          return { wave: 5, ready: faced >= need, faced, need };
        }
        if (w === 1 || w === 2 || w === 3) return { wave: w, ready: true, faced: 0, need: 0 };
        return { wave: w, ready: false, faced: 0, need: 0 };
      } catch (e) { return { wave: w, ready: false, faced: 0, need: 0 }; }
    },
    // standingPlentyCappedTotal(): plenty counts at most plentyCapT5 toward
    // the T5 bar. The honest capped number — the gate's T5 trigger.
    standingPlentyCappedTotal() {
      try {
        const cfg = this.standingCfg(), s = this.villageStanding();
        const cap = (cfg.plentyCapT5 | 0) || 100;
        return (((s.war | 0) + (s.diplomacy | 0) + Math.min((s.plenty | 0), cap)) | 0) || 0;
      } catch (e) { return 0; }
    },
    // standingDeferral(w): is wave w's Standing unlock currently deferred?
    // grandfathered: the peak ratchet already released this wave — the
    // deferral no longer applies (monotonic unlocks).
    standingDeferral(w) {
      const none = { wave: w, deferred: false, grandfathered: false };
      try {
        const cfg = this.standingCfg();
        const t4 = (cfg.t4 | 0) || 100, t5 = (cfg.t5 | 0) || 200;
        if (w !== 4 && w !== 5) return none;
        const peak = this._standingPeakWave();
        if (peak >= w) return { wave: w, deferred: false, grandfathered: true, peak };
        const s = this.villageStanding(), raw = (s.total | 0) || 0;
        if (w === 4) {
          const rd = this.waveUnlockReady(4);
          return { wave: 4, deferred: raw >= t4 && !rd.ready, ready: rd.ready, faced: rd.faced, need: rd.need, raw, threshold: t4, grandfathered: false };
        }
        const capped = this.standingPlentyCappedTotal(), rd = this.waveUnlockReady(5);
        return { wave: 5, deferred: capped >= t5 && !rd.ready, ready: rd.ready, faced: rd.faced, need: rd.need, raw, capped, threshold: t5, grandfathered: false };
      } catch (e) { return none; }
    },
    // _standingPeakWave(): highest wave the gated total has released.
    // The monotonic ratchet's memory — village-level, survives in state.
    _standingPeakWave() {
      try { return ((this.state && this.state._standingPeakWave) | 0) || 0; } catch (e) { return 0; }
    },
    // _standingHoldBeat(h): the System names the hold aloud — never silent.
    // Deferral holds: initial beat + weekly reminders (the hold must stay
    // legible while it bites). Plenty-cap: one-time.
    _standingHoldBeat(h) {
      try {
        const day = (this.state && this.state.scholar && this.state.scholar.day) || 0;
        const say = (t) => { try { if (typeof this.sysSay === 'function') this.sysSay(t); } catch (e) {} };
        if (h.kind === 'cap') {
          if (this.state._standingPlentyCapBeat != null) return;
          this.state._standingPlentyCapBeat = day;
          say('📡 The fifth draft is not bought with bread alone. Bread counts a hundred toward it and not a crumb more — bring blood or bonds for the rest.');
          return;
        }
        const key = h.kind === 'defer4' ? 4 : 5;
        this.state._standingDeferBeat = this.state._standingDeferBeat || {};
        const last = this.state._standingDeferBeat[key];
        if (last != null && day - last < 7) return;
        this.state._standingDeferBeat[key] = day;
        const first = (last == null);
        const n = h.rd.need, f = h.rd.faced;
        if (h.kind === 'defer4') {
          say(first
            ? '📡 The Mirror Draft is not for strangers. Face what hunts you now — stand on the grid with the Final Draft, more than once, more than one kind.'
            : `📡 The Mirror Draft is still waiting. Stand on the grid with the Final Draft — ${f} of ${n} kinds faced.`);
        } else {
          say(first
            ? "📡 The fifth draft stays in the wings. Stand before the Mirror Draft's champions — more than once, more than one kind — and the Producers will take notice."
            : `📡 The fifth draft stays in the wings. Stand before the Mirror Draft's champions — ${f} of ${n} kinds faced.`);
        }
      } catch (e) {}
    },
    // _standingReleaseBeat(w): the draft opens — the world responds when
    // the village is ready, never before.
    _standingReleaseBeat(w) {
      try {
        const say = (t) => { try { if (typeof this.sysSay === 'function') this.sysSay(t); } catch (e) {} };
        if (w === 4) say('📡 RATINGS ARE UP... Wave 4 talent has been released. The Mirror Draft opens.');
        else if (w === 5) say('📡 RATINGS ARE UP... the Producers have greenlit the fifth draft. Wave 5 talent has been released.');
      } catch (e) {}
    },
    // standingLine: the honest one-line readout for beats/debug — names
    // every hold and cap, no silent gates.
    standingLine() {
      try {
        const s = this.villageStanding(), cfg = this.standingCfg();
        let line = `Standing ${s.total} (war ${s.war} · bonds ${s.diplomacy} · bread ${s.plenty}) — wave 4 at ${cfg.t4}, wave 5 at ${cfg.t5}`;
        const t4 = (cfg.t4 | 0) || 100, t5 = (cfg.t5 | 0) || 200;
        const raw = (s.total | 0) || 0;
        const capped = this.standingPlentyCappedTotal();
        const peak = this._standingPeakWave();
        const notes = [];
        if (raw >= t5 && capped < t5 && peak < 5) notes.push(`bread capped at ${(cfg.plentyCapT5 | 0) || 100} toward wave 5`);
        if (raw >= t4 && !this.waveUnlockReady(4).ready && peak < 4) {
          const rd = this.waveUnlockReady(4);
          notes.push(`HELD at wave 3: the Mirror Draft wants scars (${rd.faced}/${rd.need} wave-3 kinds faced)`);
        }
        if (capped >= t5 && !this.waveUnlockReady(5).ready && peak < 5) {
          const rd = this.waveUnlockReady(5);
          notes.push(`HELD at wave 4: the fifth draft waits (${rd.faced}/${rd.need} wave-4 kinds faced)`);
        }
        if (peak >= 4 && raw < (peak >= 5 ? t5 : t4)) notes.push(`wave ${peak} held open (standing floor)`);
        if (notes.length) line += ' — ' + notes.join('; ');
        return line;
      } catch (e) { return 'Standing —'; }
    },
  };
  Object.assign(Game, methods);
})();
