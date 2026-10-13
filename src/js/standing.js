// @ontology
// system: standing
// description: The village's Standing with the System — one bar, three sources (war, diplomacy, plenty). Waves 4-5 unlock on Standing, not on the old two-rung kill+scale gate: the System escalates its attention as the village proves itself. Steve 2026-10-13: the flexible route — several paths or hybrid paths to victory; no win before day 90; every wave must have an impact.
// provides:
//   - standingCfg()
//   - villageStanding()
//   - villageStandingTotal()
//   - standingLine()
// rules:
//   - standing_village_level: true (code: standing.js — computed from village state: the ledger, the link roll, the feast log. Never the scholar alone; a new adventurer inherits the village's standing, like the ledger.)
//   - standing_no_new_tracking: true (code: standing.js — reads waveLedgerPoints(), _linkSeasoned(), state.feastLog (written by hostFeast). No parallel counters.)
//   - standing_sim_tuning: true (code: standing.js — point values and thresholds are sim starting points per the 2026-10-13 spec, not canon; tune on measured evidence.)
//   - standing_villager_kills_count: true (code: standing.js — the war source reads waveLedgerPoints, which scores player AND villager kills (recordWaveKill). A mayor whose villagers do the killing earns war standing.)
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
    // villageStanding: the full breakdown, honestly. Reads only existing
    // state — the ledger (waveLedgerPoints), the link roll (_linkSeasoned),
    // the feast log (hostFeast writes state.feastLog).
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
          if (seasoned) links++;
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
