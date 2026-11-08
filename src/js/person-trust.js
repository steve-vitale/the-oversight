// @ontology
// system: person-trust
// description: Per-villager trust map writers — each person holds a map of who THEY trust, written only from lived interaction (shared meals/visits/feasts via bondAdd, conversation consequences toward the scholar, lessons, surviving a fight together). Village-wide scholar trust (state.village.trust) stays a separate number. Closes the dead trustedAnyone bonds gate (villager-goals.js) without changing bond-initiation's warmth window.
// provides:
//   - bumpPersonTrust(fromVid, towardVid, n, reason) -> new value
//   - personTrustOf(fromVid, towardVid) -> number (unset reads as 0)
//   - personTrustCensus() -> {entries, maxTrust, trustedAnyoneN, pairs}
// rules:
//   - persontrust_lived_only: the map moves only from lived events (bondAdd warmth that actually applied, resolveConsequence trust deltas, successful teachSkill, noteSharedFight survivors) — never a roster seed, never a dawn sweep (code: bumpPersonTrust, wraps)
//   - persontrust_not_scholar_trust: state.village.trust keeps its scholar-facing meaning; this module never writes it (code: bumpPersonTrust)
//   - persontrust_directional: A trusting B is A's map entry for B; bondAdd writes both directions with the same applied warmth delta (code: wrapBondAdd)
//   - persontrust_unset_is_zero: an absent entry reads as 0 (matches trustedAnyone's (t[k]||0)), never the scholar-trust default of 10 (code: personTrustOf)
//   - persontrust_no_rng: writers consume no Math.random — panel determinism for unrelated rolls holds (code: bumpPersonTrust)
//   - persontrust_no_gate_changes: never writes a win price, deed gate, readiness bar, or table rule; bond proposals still use bondDriveLive's warmth window (code: person-trust.js)
// consumes:
//   - Game.getPerson, Game.bondAdd, Game.resolveConsequence, Game.teachSkill, Game.noteSharedFight, Game.villagerId, Game.tele
/* PERSON TRUST — src/js/person-trust.js
 *
 * The bonds goal gate (trustedAnyone in villager-goals.js) reads
 * getPerson(vid).trust — a per-person map of who THIS villager trusts.
 * Through 2026-11-05 that map was never written in wild play
 * (bond-initiation census: maxTrust 0 across 90 days on seed 84101
 * while bond warmth grew). Village-wide scholar trust
 * (state.village.trust) is a different number and was already moving.
 *
 * Steve 2026-11-06: address villager intelligence gaps. docs/VILLAGER-BRAIN.md
 * phase 2: write the map from lived interaction. This module is that
 * writer slice only — readers beyond trustedAnyone stay where they are;
 * bond-initiation keeps the warmth window for proposals.
 *
 * Load after betrayal.js (bondAdd), convo-scene.js (resolveConsequence),
 * party-bond.js (noteSharedFight) and skill-teaching.js (teachSkill).
 */
(function () {
  var _g = (typeof globalThis !== 'undefined') ? globalThis : (typeof global !== 'undefined' ? global : {});
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;

  function warn(where, e) {
    try {
      console.warn('[person-trust] ' + where + (e ? ': ' + String((e && e.message) || e).slice(0, 120) : ''));
    } catch (e2) {}
  }

  function personOf(vid) {
    try { if (G.getPerson) return G.getPerson(vid); } catch (e) { warn('getPerson', e); }
    return null;
  }

  function scholarId() {
    try { return G.villagerId || null; } catch (e) { return null; }
  }

  function isPlayerWho(who) {
    if (!who) return false;
    if (who === 'player') return true;
    try { return who === scholarId(); } catch (e) { return false; }
  }

  // personTrustOf(from, toward): what FROM believes about TOWARD.
  // Unset = 0 (never the scholar-trust default of 10).
  function personTrustOf(fromVid, towardVid) {
    if (!fromVid || !towardVid || fromVid === towardVid) return 0;
    try {
      var p = personOf(fromVid);
      var t = (p && p.trust) || {};
      if (t[towardVid] === undefined) return 0;
      return t[towardVid];
    } catch (e) { warn('personTrustOf', e); return 0; }
  }

  // bumpPersonTrust(from, toward, n, reason): the single writer.
  // Clamped 0..100. Gains and losses land whole — no progressive curve
  // here (scholar trust keeps its own). Returns the new value, or the
  // prior value when the bump is a no-op / invalid.
  function bumpPersonTrust(fromVid, towardVid, n, reason) {
    if (!fromVid || !towardVid || fromVid === towardVid) return personTrustOf(fromVid, towardVid);
    if (!n || !isFinite(n)) return personTrustOf(fromVid, towardVid);
    try {
      var p = personOf(fromVid);
      if (!p) return 0;
      if (!p.trust || typeof p.trust !== 'object') p.trust = {};
      var cur = (p.trust[towardVid] === undefined) ? 0 : p.trust[towardVid];
      var neu = Math.max(0, Math.min(100, cur + n));
      p.trust[towardVid] = neu;
      // Contact day: stamped for a later decay pass; unused this slice.
      try {
        var day = ((G.state || {}).scholar || {}).day || 0;
        if (!p.trustContact || typeof p.trustContact !== 'object') p.trustContact = {};
        p.trustContact[towardVid] = day;
      } catch (e) {}
      try {
        if (neu !== cur && G.tele) {
          G.tele('person_trust', {
            from: fromVid,
            toward: towardVid,
            delta: +(neu - cur).toFixed(2),
            reason: reason || '?',
          });
        }
      } catch (e) { warn('tele', e); }
      return neu;
    } catch (e) { warn('bumpPersonTrust', e); return personTrustOf(fromVid, towardVid); }
  }

  // personTrustCensus(): panel instrument. Never writes.
  function personTrustCensus() {
    var out = { entries: 0, maxTrust: 0, trustedAnyoneN: 0, pairs: 0 };
    try {
      var roster = (((G.state || {}).village || {}).roster) || [];
      var me = scholarId();
      for (var i = 0; i < roster.length; i++) {
        var vid = roster[i];
        if (!vid || vid === me) continue;
        var p = personOf(vid);
        var t = (p && p.trust) || {};
        var hit40 = false;
        for (var k in t) {
          if (!Object.prototype.hasOwnProperty.call(t, k)) continue;
          var v = t[k] || 0;
          out.entries++;
          out.pairs++;
          if (v > out.maxTrust) out.maxTrust = v;
          if (v >= 40) hit40 = true;
        }
        if (hit40) out.trustedAnyoneN++;
      }
    } catch (e) { warn('census', e); }
    return out;
  }

  // ---------- WRITER WRAPS (lived events only) ----------
  // bondAdd: meals, visits, feasts, talk, grievances — the same occasions
  // that already grow bond warmth. Write both directions with the warmth
  // delta that actually applied (after the +6/pair/day cap).
  function wrapBondAdd() {
    if (typeof G.bondAdd !== 'function' || G.bondAdd._personTrustWrapped) return;
    var orig = G.bondAdd;
    G.bondAdd = function (a, b, dv, reason) {
      var before = null;
      try { before = (this.bondGet && this.bondGet(a, b)) || null; } catch (e) { before = null; }
      var beforeV = before ? (before.v || 0) : 0;
      var ok = orig.apply(this, arguments);
      try {
        if (ok) {
          var after = null;
          try { after = (this.bondGet && this.bondGet(a, b)) || null; } catch (e2) { after = null; }
          var afterV = after ? (after.v || 0) : beforeV;
          var applied = afterV - beforeV;
          if (applied) {
            bumpPersonTrust(a, b, applied, reason || 'bond');
            bumpPersonTrust(b, a, applied, reason || 'bond');
          }
        }
      } catch (e) { warn('wrapBondAdd', e); }
      return ok;
    };
    G.bondAdd._personTrustWrapped = true;
  }

  // resolveConsequence: conversation / deed outcomes move a villager's
  // regard for the scholar. Mirror the APPLIED village-trust delta into
  // that villager's person map toward the scholar — never the reverse,
  // never a write to state.village.trust (the original still owns that).
  function wrapResolveConsequence() {
    if (typeof G.resolveConsequence !== 'function' || G.resolveConsequence._personTrustWrapped) return;
    var orig = G.resolveConsequence;
    G.resolveConsequence = function (vid, spec) {
      var applied = orig.apply(this, arguments);
      try {
        var sid = scholarId();
        if (vid && sid && vid !== sid && applied && applied.trust) {
          bumpPersonTrust(vid, sid, applied.trust, 'convo:' + ((applied && applied.name) || (spec && spec.name) || '?'));
        }
      } catch (e) { warn('wrapResolveConsequence', e); }
      return applied;
    };
    G.resolveConsequence._personTrustWrapped = true;
  }

  // teachSkill: a successful lesson is lived contact. +1 each way when
  // both sides are roster people (player lessons use the scholar id).
  function wrapTeachSkill() {
    if (typeof G.teachSkill !== 'function' || G.teachSkill._personTrustWrapped) return;
    var orig = G.teachSkill;
    G.teachSkill = function (teacher, learner, skillId, opts) {
      var ok = orig.apply(this, arguments);
      try {
        if (ok) {
          var t = isPlayerWho(teacher) ? scholarId() : teacher;
          var l = isPlayerWho(learner) ? scholarId() : learner;
          if (t && l && t !== l) {
            var why = 'lesson:' + (skillId || '?');
            bumpPersonTrust(l, t, 1, why);
            bumpPersonTrust(t, l, 1, why);
          }
        }
      } catch (e) { warn('wrapTeachSkill', e); }
      return ok;
    };
    G.teachSkill._personTrustWrapped = true;
  }

  // noteSharedFight: survivors of the same fight. +1 each pair direction
  // (matches the scholar-trust bump party-bond already fires).
  function wrapNoteSharedFight() {
    if (typeof G.noteSharedFight !== 'function' || G.noteSharedFight._personTrustWrapped) return;
    var orig = G.noteSharedFight;
    G.noteSharedFight = function (vids) {
      var r = orig.apply(this, arguments);
      try {
        var list = (vids || []).filter(Boolean);
        for (var i = 0; i < list.length; i++) {
          for (var j = i + 1; j < list.length; j++) {
            bumpPersonTrust(list[i], list[j], 1, 'bled together');
            bumpPersonTrust(list[j], list[i], 1, 'bled together');
          }
        }
      } catch (e) { warn('wrapNoteSharedFight', e); }
      return r;
    };
    G.noteSharedFight._personTrustWrapped = true;
  }

  G.bumpPersonTrust = bumpPersonTrust;
  G.personTrustOf = personTrustOf;
  G.personTrustCensus = personTrustCensus;

  wrapBondAdd();
  wrapResolveConsequence();
  wrapTeachSkill();
  wrapNoteSharedFight();
})();
