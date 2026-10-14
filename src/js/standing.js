// @ontology
// system: standing
// description: The village's Standing with the System — one bar, three sources (war, diplomacy, plenty). Waves 4-5 unlock on Standing, not on the old two-rung kill+scale gate: the System escalates its attention as the village proves itself. Steve 2026-10-13: the flexible route — several paths or hybrid paths to victory; no win before day 90; every wave must have an impact.
// provides:
//   - standingCfg()
//   - villageStanding()
//   - villageStandingTotal()
//   - standingLine()
//   - _linkRegionalPlus()
// rules:
//   - standing_village_level: true (code: standing.js — computed from village state: the ledger, the link roll, the feast log. Never the scholar alone; a new adventurer inherits the village's standing, like the ledger.)
//   - standing_no_new_tracking: true (code: standing.js — reads waveLedgerPoints(), _linkSeasoned(), _linkRegionalPlus() (which itself reads only polityOf/_covenantPolity/_tradePolity), state.feastLog (written by hostFeast). No parallel counters.)
//   - standing_sim_tuning: true (code: standing.js — point values and thresholds are sim starting points per the 2026-10-13 spec, not canon; tune on measured evidence.)
//   - standing_villager_kills_count: true (code: standing.js — the war source reads waveLedgerPoints, which scores player AND villager kills (recordWaveKill). A mayor whose villagers do the killing earns war standing.)
//   - standing_regional_plus: true (code: standing.js — the diplomacy source counts only SEASONED REGIONAL+ links: a link participates in a regional-scale polity (LEAD realm via polityOf('haven'), BELONG realm via polityOf(primary), seasoned covenant/trade league). A lone seasoned bond with a splinter village is courtship, not regional power — it scores 0. 2026-10-14 design call, Steve can overrule.)
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
    // villageStandingTotal: the defensive number the unlock gate reads.
    // Missing module/data reads as 0 — never unlocks by accident.
    villageStandingTotal() {
      try { return (this.villageStanding().total | 0) || 0; } catch (e) { return 0; }
    },
    // standingLine: the honest one-line readout for beats/debug.
    standingLine() {
      try {
        const s = this.villageStanding(), cfg = this.standingCfg();
        return `Standing ${s.total} (war ${s.war} · bonds ${s.diplomacy} · bread ${s.plenty}) — wave 4 at ${cfg.t4}, wave 5 at ${cfg.t5}`;
      } catch (e) { return 'Standing —'; }
    },
  };
  Object.assign(Game, methods);
})();
