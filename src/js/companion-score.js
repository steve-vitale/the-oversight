// @ontology
// system: companion-score
// description: One shared companionScore for who to spend time with — door ask, party launch pick, and favor-company partner preference. Eligibility filters stay at call sites; ranking is this formula only (VILLAGER-BRAIN Phase 4 residual / OVE-54).
// provides:
//   - companionScore(askerVid, candidateVid, opts) -> number
//   - companionRank(askerVid, candidateVids, opts) -> [{id, s}, ...] sorted best-first
// rules:
//   - companion_one_score: door (objAskCompanion), party path (findCompanion), and favor-company partner scoring all rank through companionScore — no parallel private formulas for the same decision (code: companionScore, VILLAGER-BRAIN Phase 4)
//   - companion_eligibility_elsewhere: trip distance, sick, alone, rally-only, ranger profile, engaged/away gates stay at the caller; this helper only scores (code: companionScore)
//   - companion_relationship_reads: ranking prefers personTrustOf and pairAffinity when present; scholar-trust (state.village.trust) remains a transitional signal so early panels stay readable (code: companionScore)
//   - companion_no_rng: score is a pure read — no Math.random, no writes (code: companionScore, companionRank)
// consumes:
//   - objOf (villager-objectives.js)
//   - npcTemper, npcNeeds (game.js)
//   - personTrustOf (person-trust.js) — optional
//   - pairAffinity (betrayal.js) — optional
//   - state.village.trust
/* COMPANION SCORE — src/js/companion-score.js
 *
 * Phase 4 residual (OVE-54): three sites used to decide "who walks / sits
 * with whom" with private formulas — objAskCompanion's additive rank, the
 * party path's first-match findCompanion, and favor-company partner
 * preference with no shared number. One companionScore closes that seam.
 *
 * Load after person-trust.js (personTrustOf) and betrayal.js (pairAffinity).
 * Callers attach at runtime; eligibility stays local to each path.
 */
(function () {
  'use strict';
  var _g = (typeof globalThis !== 'undefined') ? globalThis : (typeof global !== 'undefined' ? global : {});
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;

  // companionScore(asker, candidate, opts) -> number >= 0
  // opts.context: 'door' | 'party' | 'company' (informational; same arithmetic)
  // The door formula is the shared base (errand / temper / relationship /
  // social). Callers may pass opts without changing the number.
  function companionScore(askerVid, candidateVid, opts) {
    opts = opts || {};
    if (!askerVid || !candidateVid || askerVid === candidateVid) return 0;
    var s = 0;
    // Their own outdoor errand — natural pair (door's +4).
    try {
      var co = this.objOf ? this.objOf(candidateVid) : null;
      if (co && !co.indoor && co.state === 'ready' && co.kind !== 'LEAVE') s += 4;
    } catch (e) {}
    // Temperament — bold/warm walk with you.
    var t = 'steady';
    try { t = (this.npcTemper && this.npcTemper(candidateVid)) || 'steady'; } catch (e) {}
    if (t === 'bold' || t === 'warm') s += 2;
    // Relationship — person trust / pair affinity preferred; scholar-trust
    // of the candidate stays as a transitional floor (pre-Phase-2 readers
    // used only that number).
    var rel = 0;
    try {
      if (this.personTrustOf) {
        var pt = this.personTrustOf(askerVid, candidateVid) || 0;
        if (pt > rel) rel = pt;
      }
    } catch (e) {}
    try {
      if (this.pairAffinity) {
        var aff = this.pairAffinity(askerVid, candidateVid) || 0;
        if (aff > rel) rel = aff;
      }
    } catch (e) {}
    try {
      var vtr = ((this.state && this.state.village && this.state.village.trust) || {})[candidateVid];
      if (vtr == null) vtr = 0;
      if (vtr > rel) rel = vtr;
    } catch (e) {}
    if (rel > 40) s += 1;
    // Social need — lonely candidates lean into company.
    try {
      var nn = this.npcNeeds ? this.npcNeeds(candidateVid) : null;
      if (nn && (nn.social || 0) > 65) s += 1;
    } catch (e) {}
    return s;
  }

  // companionRank(asker, ids, opts) -> [{id, s}, ...] best-first.
  // Stable tie-break by id so three call sites agree byte-for-byte.
  function companionRank(askerVid, candidateVids, opts) {
    opts = opts || {};
    var out = [];
    var list = candidateVids || [];
    for (var i = 0; i < list.length; i++) {
      var id = list[i];
      if (!id || id === askerVid) continue;
      var s = 0;
      try { s = this.companionScore(askerVid, id, opts) || 0; } catch (e) { s = 0; }
      out.push({ id: id, s: s });
    }
    out.sort(function (a, b) {
      if (b.s !== a.s) return b.s - a.s;
      return String(a.id).localeCompare(String(b.id));
    });
    return out;
  }

  G.companionScore = companionScore;
  G.companionRank = companionRank;
})();
