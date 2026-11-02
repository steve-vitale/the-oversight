// policies/musterclose.js — trusted-link close prototype (Loop 1155Z,
// arm sim-musterclose-a, axis scale-onramp). POLICY ONLY: zero src/js
// changes. Wraps a titanroute-wrapped base policy and adds ONE leg:
// deepen ONE own linked village pre-call to trusted-and-current
// (trust >= 70, opinion >= 10, arrears 0), so it answers the titan call
// at quota 6 instead of 2 (or answers at all, where arrears silenced
// it). Follows sim-mustergap-b's named lever (evidence/2026-11-02/
// sim-mustergap-b.md) with a GENERIC closest-climb rule — never a
// seed->village hardcode.
//
// CHOICE RULE (weekly, min score; ties: lowest link id):
//   score = max(0, 70 - trust) + max(0, 10 - opinion)
//           + (arrears > 0 ? 5 + min(20, arrears / 1000) : 0)
// Links already trusted-and-current are excluded (they already send 6).
// VERBS (ordinary engine flows only, the ones the competent policy can
// drive): Haven-primary link -> Game.tendLink (1,500 kcal, +8 trust,
// once/week); Haven-subordinate link -> Game.payTribute (full weekly
// owed; a week paid in full clears arrears, +3 trust); peer link -> no
// verb exists, recorded as no-verb, never forced. The base stack already
// tends primary links weekly when pantry > 20,000 kcal, so this leg's
// marginal tending is the chosen link in weeks the base gate skips,
// down to a survival floor (pantry-days estimate >= 3, else no tend).
// It does NOT suppress the base's tending of other links: starving the
// other two links toward the refuse bar would trade one quota for two
// refusals. Deepening stops once the call sounds (a sounded muster is
// fixed — re-calls add nobody), once the herald is slain, or once the
// chosen link meets all three thresholds (it may resume if it falls
// back below, still the same one-link job).
//
// PERCEPTION LAW (load-bearing): the policy reads ONLY what the village
// itself knows — its OWN active links (hierarchyState filtered to
// Haven-involved links), each linked village's trust/opinion/arrears
// (its own relationships, named at the war council), and its own pantry.
// It NEVER reads Game.worldMonsters, any monster roster, any allied
// roster (free-adult counts), any village not linked, or
// Game.titanCallReadiness (that helper generates/counts rosters — a
// roster read through an engine helper is still a roster read). No RNG
// is consumed, so arm/baseline trajectories differ ONLY through the
// deepening actions and their consequences.
'use strict';

const TRUSTED_AT = 70;
const TRUSTED_OPINION = 10;

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function gweek(Game) {
  try {
    if (typeof Game._week === 'function') return Game._week();
    return Math.floor(gday(Game) / 7);
  } catch (e) { return Math.floor(gday(Game) / 7); }
}

function slain(Game) {
  try { return !!((((Game.state || {}).titans || {}).slain || {}).herald); } catch (e) { return false; }
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}

function pantryDays(Game) {
  try {
    if (typeof Game.pantryDaysEstimate === 'function') {
      var d = Game.pantryDaysEstimate();
      if (typeof d === 'number' && isFinite(d)) return d;
    }
  } catch (e) { /* fall through to kcal fallback */ }
  return null;
}

// Own links only: active links Haven is a party to (primary, subordinate,
// or peer a/b). Returns [{link, other}] with other = the far village id.
function ownLinks(Game) {
  var out = [];
  try {
    var links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      if (!l || l.status !== 'active') continue;
      var other = null;
      try {
        if (typeof Game._linkOther === 'function') other = Game._linkOther(l, 'haven');
      } catch (e) { other = null; }
      if (!other) {
        if (l.primary === 'haven') other = l.subordinate;
        else if (l.subordinate === 'haven') other = l.primary;
        else if (l.a === 'haven') other = l.b;
        else if (l.b === 'haven') other = l.a;
      }
      if (!other || other === 'haven') continue;
      out.push({ link: l, other: other });
    }
  } catch (e) { /* no links readable: idle, recorded by caller */ }
  return out;
}

function opinionOf(Game, other) {
  try {
    if (typeof Game._otherVillage === 'function') {
      var ov = Game._otherVillage(other);
      if (ov) return (ov.opinion || 0);
    }
  } catch (e) { /* unknown: treat as 0, never crash the run */ }
  return 0;
}

function nameOf(Game, other) {
  try {
    if (typeof Game._otherVillage === 'function') {
      var ov = Game._otherVillage(other);
      if (ov && ov.name) return ov.name;
    }
  } catch (e) { /* name stays the id */ }
  return other;
}

function linkView(Game, entry) {
  var l = entry.link;
  return {
    id: l.id, other: entry.other, name: nameOf(Game, entry.other),
    kind: l.kind || (l.primary === 'haven' ? 'lead' : (l.subordinate === 'haven' ? 'belong' : 'peer')),
    direction: l.primary === 'haven' ? 'primary' : (l.subordinate === 'haven' ? 'subordinate' : 'peer'),
    trust: l.trust || 0, opinion: opinionOf(Game, entry.other), arrears: l.arrears || 0,
  };
}

function meetsThresholds(v) {
  return v.trust >= TRUSTED_AT && v.opinion >= TRUSTED_OPINION && v.arrears === 0;
}

function climbScore(v) {
  var s = Math.max(0, TRUSTED_AT - v.trust) + Math.max(0, TRUSTED_OPINION - v.opinion);
  if (v.arrears > 0) s += 5 + Math.min(20, v.arrears / 1000);
  return s;
}

function withMusterClose(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'musterclose',
    desc: desc || 'musterclose: deepen one own link pre-call to trusted-and-current',
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.mustercloseBaseDailyErr = String(e.message).slice(0, 120); }
      }
      const mc = ctx.musterclose || (ctx.musterclose = { choices: [], actions: [], errors: [] });
      try {
        if (Game.over || Game.tbfight) return;
        if (slain(Game)) return;
        // A sounded muster is fixed: deepening after the call cannot add
        // blades (re-calls add nobody), so the leg ends at the call.
        if (ctx.titan && ctx.titan.called && typeof ctx.titan.called === 'object') return;
        var week = gweek(Game);
        if (mc.lastWeek === week) return; // one decision per week
        mc.lastWeek = week;
        var day = gday(Game);
        var views = ownLinks(Game).map(function (e) { return linkView(Game, e); });
        if (!views.length) { mc.choices.push({ day: day, week: week, choice: null, reason: 'no-own-links' }); return; }
        var cands = views.filter(function (v) { return !meetsThresholds(v); });
        if (!cands.length) {
          mc.choices.push({ day: day, week: week, choice: null, reason: 'all-trusted-and-current',
            views: views.map(function (v) { return { other: v.other, name: v.name, trust: v.trust, opinion: v.opinion, arrears: v.arrears }; }) });
          return;
        }
        cands.sort(function (a, b) {
          var sa = climbScore(a), sb = climbScore(b);
          if (sa !== sb) return sa - sb;
          return String(a.id) < String(b.id) ? -1 : (String(a.id) > String(b.id) ? 1 : 0);
        });
        var chosen = cands[0];
        var choice = { day: day, week: week, choice: chosen.other, name: chosen.name,
          direction: chosen.direction, score: climbScore(chosen),
          before: { trust: chosen.trust, opinion: chosen.opinion, arrears: chosen.arrears } };
        mc.choices.push(choice);
        // Deepen the chosen link through its ordinary verb.
        var entry = null;
        var links = ownLinks(Game);
        for (var i = 0; i < links.length; i++) if (links[i].other === chosen.other) { entry = links[i]; break; }
        if (!entry) { choice.action = 'link-vanished'; return; }
        var l = entry.link;
        if (chosen.direction === 'primary') {
          if (l.tendedWeek === week) { choice.action = 'already-tended'; }
          else {
            var days = pantryDays(Game);
            var floorOk = (days != null) ? (days >= 3) : (pantryKcal(Game) > 12000);
            if (!floorOk) { choice.action = 'floor-blocked'; choice.pantryKcal = pantryKcal(Game); choice.pantryDays = days; }
            else if (typeof Game.tendLink === 'function') {
              var paid = Game.tendLink(l.id);
              var after = linkView(Game, entry);
              choice.action = 'tend'; choice.paid = paid;
              choice.after = { trust: after.trust, opinion: after.opinion, arrears: after.arrears };
              mc.actions.push({ day: day, week: week, verb: 'tend', other: chosen.other, name: chosen.name, paid: paid,
                before: choice.before, after: choice.after });
              if (meetsThresholds(after) && !mc.firstMetDay) mc.firstMetDay = day;
            } else { choice.action = 'tendLink-missing'; }
          }
        } else if (chosen.direction === 'subordinate') {
          if (l.tributePaidWeek === week) { choice.action = 'already-current'; }
          else if (typeof Game.payTribute === 'function') {
            var paid2 = Game.payTribute(l.id);
            var after2 = linkView(Game, entry);
            choice.action = 'payTribute'; choice.paid = paid2;
            choice.after = { trust: after2.trust, opinion: after2.opinion, arrears: after2.arrears };
            mc.actions.push({ day: day, week: week, verb: 'payTribute', other: chosen.other, name: chosen.name, paid: paid2,
              before: choice.before, after: choice.after });
            if (meetsThresholds(after2) && !mc.firstMetDay) mc.firstMetDay = day;
          } else { choice.action = 'payTribute-missing'; }
        } else {
          choice.action = 'no-verb-peer';
        }
      } catch (e) {
        mc.errors.push('musterclose: ' + String((e && e.message) || e).slice(0, 120));
      }
    },
  });
  return wrapped;
}

module.exports = { withMusterClose, climbScore, meetsThresholds, TRUSTED_AT, TRUSTED_OPINION };
