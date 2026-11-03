// natwindow.js — ARM 4 prototype leg (POLICY ONLY, zero src/js changes).
// "Protect the national window": a competent human can, with existing
// verbs, (a) tend a marginal subordinate bond weekly even when the
// pantry is lean, and (b) stand down a hungry muster that is bleeding
// the realm instead of fighting. The measured stack does neither:
// leadcourt tends only when pantry > 20,000 kcal, musterclose tends
// one chosen link toward trusted-70, and NO policy ever stands a
// muster down, so a sounded muster bleeds -2/link/day indefinitely.
//
// PERCEPTION LAW: reads ONLY the village's own relationships
// (hierarchyState filtered to Haven-involved links), its own pantry
// (pantryDaysEstimate), its own muster (titanMusterState), and its own
// scale flags (networkLive/networkLiveDay/nationalLive/pendingNational).
// Never reads rosters, world monsters, allied faces, or titan-call readiness.
// No RNG consumed.
//
// RULES (all through existing engine verbs, real costs):
//  TEND: while national is not yet live and Haven holds >=2 primary
//    subordinate links, tend every primary link with trust < 50 once
//    per week, but only when pantry-days >= 3 (survival floor, same
//    convention as musterclose). 50 = the seasoned bar (40) + 10 margin:
//    the leg stops once the bond is comfortably seasoned.
//  STAND DOWN (v2 — pilot lesson from 97342): while a herald muster
//    stands HUNGRY (own pack cannot cover today's need), national is
//    not yet live, the regional-season gate has not yet passed, at
//    least 2 subs are seasoned or the polity currently qualifies, the
//    muster is >= 3 days old, and the WEAKEST primary link's trust is
//    below 55, stand the muster down (one -5/link cost, upkeep stops)
//    instead of bleeding -2/link/day forever. The 55 bar is load-
//    bearing: standing down costs -5, so it must fire while the weakest
//    link can absorb it and stay >= 40 (55 gives margin for the same
//    day's other drains); waiting until a link is already below 45
//    (v1) stood the muster down AFTER the polity had died — the -5
//    itself then pushed the marginal link under. titanroute sounds
//    only once per run, so standing down abandons the titan road for
//    this run — a real tradeoff, chosen only when the pre-national
//    window is at stake. After national is live the leg is idle: a
//    post-national muster may still fight for the Herald.
'use strict';

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryDays(Game) {
  try {
    if (typeof Game.pantryDaysEstimate === 'function') {
      const d = Game.pantryDaysEstimate();
      if (typeof d === 'number' && isFinite(d)) return d;
    }
  } catch (e) {}
  return null;
}
function ownPrimaryLinks(Game) {
  const out = [];
  try {
    const links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
    for (const l of links) {
      if (l && l.status === 'active' && l.primary === 'haven') out.push(l);
    }
  } catch (e) {}
  return out;
}
function seasoned(Game, link) {
  try { return !!(Game._linkSeasoned && Game._linkSeasoned(link, !!link.conquered, true)); } catch (e) { return false; }
}

function withNatWindow(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'natwindow',
    desc: desc || 'natwindow: tend marginal bonds + stand down window-threatening hungry musters',
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.natwindowBaseErr = String((e && e.message) || e).slice(0, 80); }
      }
      try {
        if (Game.over || Game.tbfight) return;
        const st = Game.state || {};
        const day = gday(Game);
        const nationalLive = !!st.nationalLive;
        const pendingNational = !!st.pendingNational;
        const networkLive = !!st.networkLive;
        const netDay = st.networkLiveDay || 0;
        const gatePassed = networkLive && (day - netDay) >= 30;
        const prims = ownPrimaryLinks(Game);
        const seasonedPrims = prims.filter(l => seasoned(Game, l));
        let polity = null;
        try { polity = Game._havenPolity ? Game._havenPolity() : null; } catch (e) {}
        // TEND: LEAD road in progress, national not yet won.
        if (!nationalLive && !pendingNational && prims.length >= 2) {
          const pd = pantryDays(Game);
          if (pd != null && pd >= 3 && typeof Game.tendLink === 'function') {
            let week = null;
            try { week = (typeof Game._week === 'function') ? Game._week() : Math.floor(day / 7); } catch (e) { week = Math.floor(day / 7); }
            for (const l of prims) {
              if ((l.trust || 0) >= 50) continue;
              if (l.tendedWeek === week) continue;
              if (l.mourningUntil && day < l.mourningUntil) continue;
              try { Game.tendLink(l.id); ctx.natwindowTends = (ctx.natwindowTends || 0) + 1; } catch (e) {}
            }
          }
        }
        // STAND DOWN: hungry muster threatening the pre-national window.
        if (!pendingNational && !nationalLive && !gatePassed && typeof Game.titanStandDown === 'function' && typeof Game.titanMusterState === 'function') {
          const muster = Game.titanMusterState('herald');
          const slain = !!((((Game.state || {}).titans || {}).slain || {}).herald);
          if (muster && !slain) {
            const musterAge = day - (muster.day || day);
            const windowAtStake = (seasonedPrims.length >= 2 || !!polity);
            if (windowAtStake && musterAge >= 3 && prims.length) {
              const weakest = Math.min.apply(null, prims.map(l => l.trust || 0));
              // Hungry today? Own pack vs today's need (blades x 1000).
              let packKcal = 0;
              try { for (const it of ((Game.state.scholar || {}).inventory || [])) packKcal += (it.kcalEach || 0) * (it.units || 1); } catch (e) {}
              const blades = (muster.allies || []).length + ((muster.haven || []).length);
              const hungry = packKcal < blades * 1000;
              if (hungry && weakest < 55) {
                try { Game.titanStandDown('herald'); ctx.natwindowStanddowns = (ctx.natwindowStanddowns || 0) + 1; } catch (e) {}
              }
            }
          }
        }
      } catch (e) { ctx.natwindowErr = String((e && e.message) || e).slice(0, 80); }
    },
  });
  return wrapped;
}

module.exports = { withNatWindow };
