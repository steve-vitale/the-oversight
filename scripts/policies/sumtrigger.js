'use strict';
// sumtrigger — sum-trigger muster-call policy variant (sim-sumtrigger-a,
// Loop A 20261102T0250Z, axis scale-onramp). POLICY-SIDE ONLY: zero
// src/js changes. Decides WHEN to sound the titan call, never how the
// call behaves.
//
// Rule (prereg evidence/2026-11-02/sim-sumtrigger-a-prereg.md):
// sound when ProjectedTotal >= need (herald minAllies 10), where
// ProjectedTotal = sum over active links of min(quota, freeAdults)
// for NON-REFUSING links + HavenProj, and:
//   - quota is 6 iff trust >= trustedAt (70) AND opinion >=
//     trustedOpinion (10), else 2 (titans.json _coalition; values
//     read from Game.data, never hardcoded as game rules — the
//     fallbacks only cover a missing data table in stub tests);
//   - a REFUSING link (trust < 25, opinion < -10, or arrears > 0 —
//     exactly soundTitanCall's refusal rule) contributes 0;
//   - freeAdults counts the link's roster AFTER the call's own
//     roster generation: if the village carries no roster,
//     Game.genVillageRoster is called — the same generator
//     titanAlliedFaces uses — and the generated roster is counted.
//     Snapshot facesFree alone undercounts sounded yield by 5-11
//     on every quotatrigger seed and must never be the projection;
//   - already-committed faces are excluded (same committed set as
//     muster-diag: unique-alive allies of unslain musters);
//   - HavenProj = havenValid + min(3 - havenValid, volunteers),
//     the pool the two titanCommitOwn taps draw from, capped at
//     Haven's 3-blade cap.
//
// Also reported, NEVER the trigger: naiveTotal — the same sum with
// refusals ignored — so the faithful/naive divergence is visible
// (95423: naive 10 vs faithful 6 before Haven, because Emberhold's
// arrears 3000 refuses it).
//
// SIDE EFFECT, pre-registered: generation consumes seeded RNG and
// the roster persists. The replay records generatedNow per
// projection so the divergence cost is measurable. This module
// never calls a mutator other than genVillageRoster (the call's
// own generator): no titanMusterReady, no titanSelfActions, no
// soundTitanCall, no titanCommitOwn.

function uniqueAlliesOf(Game, muster) {
  const seen = {};
  const out = [];
  try {
    const allies = (muster && muster.allies) || [];
    for (const a of allies) {
      if (!a || !a.vid) continue;
      const key = a.villageId + ':' + a.vid;
      if (seen[key]) continue;
      let person = null;
      try {
        const ov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(a.villageId) : null;
        person = ov && (ov.roster || []).find(function (r) { return r.id === a.vid; });
      } catch (e) { person = null; }
      if ((a.hp !== undefined && a.hp <= 0) ||
          (person && (!person.alive || (person.health !== undefined && person.health <= 0)))) continue;
      seen[key] = true;
      out.push(a);
    }
  } catch (e) { void e; }
  return out;
}

function havenBladesOf(Game, muster) {
  try {
    if (typeof Game.titanHavenBlades === 'function') return Game.titanHavenBlades(muster) || [];
  } catch (e) { void e; }
  const out = [];
  try {
    const roster = ((Game.state || {}).village || {}).roster || [];
    const seen = {};
    const list = (muster && muster.haven) || [];
    for (const h of list) {
      const vid = (typeof h === 'string') ? h : (h && h.vid);
      if (!vid || vid === Game.villagerId || seen[vid] || roster.indexOf(vid) < 0) continue;
      seen[vid] = true;
      out.push({ vid: vid });
    }
  } catch (e) { void e; }
  return out;
}

function isFreeAdult(r, vid, committed) {
  return !!r && r.alive && (r.age == null || r.age >= 18) &&
    (r.health === undefined || r.health > 0) && !committed[vid + ':' + r.id];
}

// Project the herald muster at this moment. Game is the live game
// object (or a stub with the same accessors, for unit tests).
// Returns {links, alliesProj, havenProj, total, naiveTotal, ready,
// need, generatedNow, errors}. Never throws into the caller for a
// single bad link — the bad link contributes 0 and is recorded.
function projectMusterCall(Game, opts) {
  opts = opts || {};
  const out = { links: [], alliesProj: 0, havenProj: null, total: null,
    naiveTotal: 0, ready: false, need: 10, generatedNow: [], errors: [] };
  try {
    const cfg = ((Game.data || {}).titans || {})._coalition || {};
    const trustedAt = (cfg.trustedAt == null ? 70 : cfg.trustedAt);
    const trustedOpinion = (cfg.trustedOpinion == null ? 10 : cfg.trustedOpinion);
    const trustedBlades = (cfg.trustedBlades || 6);
    const baseBlades = (cfg.baseBlades || 2);
    const defs = (Game.data || {}).titans || {};
    const heraldDef = defs.herald || {};
    out.need = (opts.need != null ? opts.need : (heraldDef.minAllies || 10));

    const titans = (Game.state || {}).titans || {};
    const muster = titans.musters ? titans.musters.herald : null;
    const committed = {};
    try {
      const allMusters = titans.musters || {};
      Object.keys(allMusters).forEach(function (tid) {
        if (titans.slain && titans.slain[tid]) return;
        uniqueAlliesOf(Game, allMusters[tid]).forEach(function (a) { committed[a.villageId + ':' + a.vid] = true; });
      });
    } catch (e) { out.errors.push('committed: ' + String((e && e.message) || e).slice(0, 120)); }

    let links = [];
    try { links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : []; } catch (e) {
      out.errors.push('hierarchyState: ' + String((e && e.message) || e).slice(0, 120));
    }
    (links || []).filter(function (l) { return l && l.status === 'active'; }).forEach(function (link) {
      try {
        let vid = null;
        try { vid = (typeof Game._linkOther === 'function') ? Game._linkOther(link, 'haven') : (link.primary === 'haven' ? link.subordinate : link.primary); } catch (e) { vid = null; }
        let ov = null;
        try { ov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(vid) : null; } catch (e) { ov = null; }
        const trust = link.trust || 0;
        const opinion = (ov && ov.opinion) || 0;
        const arrears = link.arrears || 0;
        const wouldRefuse = (trust < 25 || opinion < -10 || arrears > 0);
        const quota = (trust >= trustedAt && opinion >= trustedOpinion) ? trustedBlades : baseBlades;
        const already = muster ? (muster.allies || []).filter(function (a) { return a.villageId === vid; }).length : 0;
        // Pre-generation snapshot count (the undercounting number).
        let snapFree = 0;
        try {
          const pre = (ov && ov.roster) || [];
          snapFree = pre.filter(function (r) { return isFreeAdult(r, vid, committed); }).length;
        } catch (e) { snapFree = 0; }
        // The call's own roster generation, counted in the projection.
        let generatedHere = false;
        if (ov && (!ov.roster || !ov.roster.length) && typeof Game.genVillageRoster === 'function') {
          try {
            Game.genVillageRoster(ov);
            generatedHere = true;
            out.generatedNow.push({ villageId: vid, name: (ov && ov.name) || null,
              rosterLen: (ov.roster || []).length });
          } catch (e) { out.errors.push('genVillageRoster ' + vid + ': ' + String((e && e.message) || e).slice(0, 120)); }
        }
        let freeAdults = 0;
        try {
          const roster = (ov && ov.roster) || [];
          freeAdults = roster.filter(function (r) { return isFreeAdult(r, vid, committed); }).length;
        } catch (e) { freeAdults = 0; }
        const capped = Math.max(0, Math.min(quota - already, freeAdults));
        const contribution = wouldRefuse ? 0 : capped;
        out.links.push({ villageId: vid, name: (ov && ov.name) || null, trust: trust, opinion: opinion,
          arrears: arrears, quota: quota, already: already, snapFree: snapFree,
          generatedHere: generatedHere, freeAdults: freeAdults,
          wouldRefuse: wouldRefuse, contribution: contribution, naiveContribution: capped });
        out.alliesProj += contribution;
        out.naiveTotal += capped;
      } catch (e) { out.errors.push('link: ' + String((e && e.message) || e).slice(0, 120)); }
    });

    // Haven projection: the two-tap commit pool, capped at 3.
    try {
      const havenValid = muster ? havenBladesOf(Game, muster).length : 0;
      const vols = (typeof Game.titanVolunteers === 'function') ? Game.titanVolunteers() : null;
      const volN = vols ? vols.length : 0;
      out.havenProj = havenValid + Math.max(0, Math.min(3 - havenValid, volN));
      out.volunteers = volN;
      out.havenValid = havenValid;
    } catch (e) {
      out.errors.push('volunteers: ' + String((e && e.message) || e).slice(0, 120));
      out.havenProj = null;
    }
    out.naiveTotal += (out.havenProj == null ? 0 : out.havenProj);
    out.total = (out.havenProj == null ? null : (out.alliesProj + out.havenProj));
    // Readiness is purely numeric; errors are reported separately
    // (a failed generation means 0 faces from that village, exactly
    // as the call itself would see it — not a veto on the rest).
    out.ready = (out.total != null && out.total >= out.need);
  } catch (e) { out.errors.push('project: ' + String((e && e.message) || e).slice(0, 120)); }
  return out;
}

module.exports = { projectMusterCall: projectMusterCall };
