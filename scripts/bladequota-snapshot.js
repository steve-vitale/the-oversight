// bladequota-snapshot.js — pure-read sounded-call yield replica (sim-bladequota-a).
// Replicates soundTitanCall (src/js/titans.js) + titanAlliedFaces +
// titanCommitOwn's haven pool WITHOUT writing state or drawing RNG:
//   quota = 6 if trust >= 70 && opinion >= 10 else 2
//   refusal if trust < 25 || opinion < -10 || arrears > 0  (yields 0)
//   per-link yield = min(quota - alreadyCommitted, freeFaces); already = 0
//     in the wild (no button is ever pressed), but live musters are honored
//     by counting their allies as committed, exactly as the call does.
//   havenPool replicates titanVolunteers' availability bar (guarded reads).
// snapshotBladeQuota(Game, titanId) -> { links: [...], alliedYield, havenPool,
//   totalYield, refusals, trustedLinks, cappedLinks, omen }.
// Omen stage is read, never advanced. titanId defaults to 'herald'.
'use strict';

function bladeQuotaSnapshot(Game, titanId) {
  titanId = titanId || 'herald';
  const out = {
    links: [], alliedYield: 0, havenPool: 0, totalYield: 0,
    refusals: 0, trustedLinks: 0, cappedLinks: 0, omen: null, omenStage: null,
    errors: [],
  };
  try {
    const cfg = ((Game.data || {}).titans || {})._coalition || {};
    const baseBlades = cfg.baseBlades != null ? cfg.baseBlades : 2;
    const trustedBlades = cfg.trustedBlades != null ? cfg.trustedBlades : 6;
    const trustedAt = cfg.trustedAt != null ? cfg.trustedAt : 70;
    const trustedOpinion = cfg.trustedOpinion != null ? cfg.trustedOpinion : 10;
    const defs = (Game.data || {}).titans || {};
    const need = (defs[titanId] && defs[titanId].minAllies != null)
      ? defs[titanId].minAllies : 10;
    out.need = need;
    // Omen (pure read).
    try {
      const st = (Game.state || {}).titans || {};
      const o = (st.omens || {})[titanId] || null;
      out.omen = o ? { stage: o.stage | 0, day: o.day | 0 } : null;
      out.omenStage = o ? (o.stage | 0) : null;
    } catch (e) { out.errors.push('omen: ' + e.message); }
    // Committed faces across live (non-slain) musters, as the call counts them.
    const committed = {};
    try {
      const st = (Game.state || {}).titans || {};
      const musters = st.musters || {};
      const slain = st.slain || {};
      Object.keys(musters).forEach(function (tid) {
        if (slain[tid]) return;
        const allies = (musters[tid] || {}).allies || [];
        allies.forEach(function (a) {
          if (!a || !a.vid) return;
          if (a.hp !== undefined && a.hp <= 0) return;
          committed[a.villageId + ':' + a.vid] = true;
        });
      });
    } catch (e) { out.errors.push('committed: ' + e.message); }
    // Active links.
    let links = [];
    try {
      links = (typeof Game.hierarchyState === 'function')
        ? Game.hierarchyState().filter(function (l) { return l && l.status === 'active'; })
        : [];
    } catch (e) { out.errors.push('links: ' + e.message); }
    links.forEach(function (link) {
      let vid = null, ov = null;
      try { vid = (typeof Game._linkOther === 'function') ? Game._linkOther(link, 'haven') : null; } catch (e) {}
      try { ov = (vid && typeof Game._otherVillage === 'function') ? Game._otherVillage(vid) : null; } catch (e) {}
      const trust = link.trust || 0;
      const opinion = (ov && ov.opinion) || 0;
      const arrears = link.arrears || 0;
      const refused = trust < 25 || opinion < -10 || arrears > 0;
      const refuseReason = trust < 25 ? 'trust<25' : opinion < -10 ? 'opinion<-10' : arrears > 0 ? 'arrears>0' : null;
      // Quota is a property of trust/opinion, independent of refusal: a
      // trusted link refused only on arrears still has quota 6 if it answers.
      const quota = (trust >= trustedAt && opinion >= trustedOpinion) ? trustedBlades : baseBlades;
      // Free faces: living adults on the allied roster, not already committed.
      let freeFaces = 0;
      try {
        const roster = (ov && ov.roster) || [];
        const speakerId = link.theirSpeaker ? link.theirSpeaker.id : null;
        void speakerId; // count only; speaker-first order does not change the count
        roster.forEach(function (r) {
          if (!r || !r.alive) return;
          if (r.age != null && r.age < 18) return;
          if (r.health !== undefined && r.health <= 0) return;
          if (committed[vid + ':' + r.id]) return;
          freeFaces++;
        });
      } catch (e) { out.errors.push('faces:' + vid + ': ' + e.message); }
      // Already marching for THIS titan (the call's quota-already). Wild
      // runs have no muster, so this is 0 there; live musters are honored.
      let already = 0;
      try {
        const mm = ((Game.state || {}).titans || {}).musters || {};
        const mine = (mm[titanId] || {}).allies || [];
        const seen = {};
        mine.forEach(function (a) {
          if (a && a.villageId === vid && !seen[a.vid]) { seen[a.vid] = 1; already++; }
        });
      } catch (e) {}
      let yielded = 0;
      if (!refused) yielded = Math.max(0, Math.min(quota - already, freeFaces));
      const cappedLoss = !refused ? Math.max(0, (quota - already) - yielded) : 0;
      if (refused) out.refusals++;
      if (!refused && quota === trustedBlades) out.trustedLinks++;
      if (cappedLoss > 0) out.cappedLinks++;
      out.alliedYield += yielded;
      out.links.push({
        villageId: vid, name: (ov && ov.name) || null, trust: trust, opinion: opinion,
        arrears: arrears, refused: refused, refuseReason: refuseReason,
        quota: quota, freeFaces: freeFaces, yielded: yielded, cappedLoss: cappedLoss,
      });
    });
    // Haven pool: replicate titanVolunteers' availability bar (guarded).
    try {
      const v = (Game.state || {}).village || {};
      const me = Game.villagerId;
      let withYou = {};
      try { (typeof Game.travelingWith === 'function' ? Game.travelingWith() : []).forEach(function (id) { withYou[id] = 1; }); } catch (e) {}
      const nodeAway = {};
      try { const va = v.away || {}; Object.keys(va).forEach(function (k) { nodeAway[k] = 1; }); } catch (e) {}
      let pool = 0;
      (v.roster || []).forEach(function (id) {
        if (!id || id === me) return;
        try { if (Game.isMember && !Game.isMember(id)) return; } catch (e) { return; }
        try { if (Game._isAwayVid && Game._isAwayVid(id)) return; } catch (e) {}
        if (nodeAway[id] || withYou[id]) return;
        try { if (Game.isEngaged && Game.isEngaged(id)) return; } catch (e) {}
        pool++;
      });
      out.havenPool = pool;
    } catch (e) { out.errors.push('haven: ' + e.message); }
    out.totalYield = out.alliedYield + Math.min(3, out.havenPool);
    // Counterfactuals at this snapshot (allied-only).
    // Counterfactual semantics (one factor changed at a time):
    //   allTrusted: non-refusing links answer at quota 6, caps kept, refusals stay refused.
    //   noRefusals: every link answers at its own quota, caps kept.
    //   noCap: non-refusing links answer at quota with unlimited faces, refusals stay refused.
    //   allFixed: every link answers at quota 6 with unlimited faces.
    const cf = { allTrusted: 0, noRefusals: 0, noCap: 0, allFixed: 0 };
    out.links.forEach(function (l) {
      cf.allTrusted += l.refused ? 0 : Math.min(trustedBlades, l.freeFaces);
      cf.noRefusals += Math.min(l.quota, l.freeFaces);
      cf.noCap += l.refused ? 0 : l.quota;
    });
    cf.allFixed = out.links.length * trustedBlades;
    out.counterfactual = cf;
  } catch (e) {
    out.errors.push('top: ' + e.message);
  }
  return out;
}

function classifyShortfall(snap) {
  if (!snap) return 'ERROR';
  if (snap.alliedYield >= (snap.need || 10)) return 'REACHED';
  if (!snap.links.length) return 'LINK-COUNT';
  const cf = snap.counterfactual || {};
  if (cf.noCap >= (snap.need || 10)) return 'FREE-FACES';
  if (cf.allTrusted >= (snap.need || 10)) return 'TRUST-BELOW-70';
  if (cf.noRefusals >= (snap.need || 10)) return 'REFUSALS';
  return 'LINK-COUNT';
}

module.exports = { bladeQuotaSnapshot, classifyShortfall };
