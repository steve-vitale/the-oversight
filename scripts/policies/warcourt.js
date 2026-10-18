// warcourt — competent + CONQUEST-road force play (journey scale r4 2026-10-17).
//
// A competent player who walks the war road: raids from strength, always
// tries bloodless TERMS first (no casualties, trust 25, 5,000 kcal/week),
// pays the STRIKE price when terms are refused (casualties via registerDeath,
// 3 days gone, trust 15, opinion -40, 7,000 kcal/week duress), and rules what
// it takes. After the Iron Court: MERCY links get tended like courtship
// (the yoke eases — trust must climb to the 40 the realm stands on), YOKE
// links are left raw (the yoke is the yoke; revolt/sabotage risk is the
// price), RELEASE dissolves the realm aloud. Never courts peers, never bows,
// never proposes links — the only road is force. Answers counters, accords,
// national/global beats, demands.
//
// Iron Court answer via env IRONCOURT_ANSWER (mercy|yoke|release), default
// 'mercy'. The harness sets it per seed so all three beats get coverage.
//
// Env gate: WARCOURT_RAID=1 opts the raid layer in. Default OFF — gate-off
// warcourt is byte-identical to competent (the before/after harness gate
// pattern from competent's COMPETENT_* gates).
'use strict';
const { competent } = require('./competent');

function raidOn() { return process.env.WARCOURT_RAID === '1'; }
function ironAnswer() {
  const a = (process.env.IRONCOURT_ANSWER || 'mercy').toLowerCase();
  return (a === 'yoke' || a === 'release' || a === 'mercy') ? a : 'mercy';
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function popAlive(Game) {
  try { return ((Game.state.village || {}).roster || []).filter(id => { try { return !Game.getPerson(id).dead; } catch (e) { return true; } }).length; } catch (e) { return 0; }
}
function scholarHpPct(Game) {
  try {
    const s = Game.state.scholar || {};
    const hp = s.hp != null ? s.hp : 100;
    return hp / Math.max(1, s.maxHp || 100);
  } catch (e) { return 1; }
}
function exiled(Game) { try { return !!((Game.state.scholar || {}).exiled); } catch (e) { return false; } }

function courtship(Game, ctx) {
  try {
    if (!raidOn()) return;
    const day = gday(Game);
    const st = Game.state;
    // 1. Answer pending offers/beats — a competent player never leaves mail unread.
    if (st.pendingCounter && Game.answerCounter) {
      const rich = pantryKcal(Game) > 25000;
      try { Game.answerCounter(rich ? 'sweeten' : 'accept'); } catch (e) {}
      ctx.courtCounters = (ctx.courtCounters || 0) + 1;
    }
    if (st.pendingAccord && Game.answerAccord) {
      try { Game.answerAccord('gift'); } catch (e) {}
      ctx.courtAccords = (ctx.courtAccords || 0) + 1;
    }
    if (st.pendingNational && Game.answerNationalChoice) {
      const shape = st.pendingNational.shape;
      const pick = shape === 'conquest' ? ironAnswer()
        : ({ lead: 'feast', belong: 'swear', covenant: 'pact', trade: 'sign' }[shape] || 'feast');
      try { Game.answerNationalChoice(pick); } catch (e) {}
      ctx.courtNational = (ctx.courtNational || 0) + 1;
      ctx['courtNational_' + pick] = (ctx['courtNational_' + pick] || 0) + 1;
    }
    if (st.pendingGlobal && Game.answerGlobalChoice) {
      try { Game.answerGlobalChoice('feast'); } catch (e) {}
      ctx.courtGlobal = (ctx.courtGlobal || 0) + 1;
    }
    // 2. Answer a mustered raid first — the war party never waits.
    if (st.pendingRaid && Game.answerRaid) {
      answerMustered(Game, ctx);
    }
    // 3. Demands (Haven-as-subordinate shouldn't happen on this road, but answer anyway).
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    const week = (Game._week ? Game._week() : 0);
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      if (link.subordinate === 'haven' && link.pendingDemand && Game.answerDemand) {
        const rich = pantryKcal(Game) > 12000;
        try { Game.answerDemand(link.id, rich); } catch (e) {}
        ctx.demands = (ctx.demands || 0) + 1;
      }
    }
    // 4. Tend non-conquered Haven-primary links (post-MERCY courtship: the
    //    yoke eases — trust must climb to the 40 the realm stands on).
    //    Conquered links are deliberately left raw: the yoke is the yoke,
    //    and revolt/sabotage risk is its honest price.
    for (const link of links) {
      if (!link || link.status !== 'active' || link.primary !== 'haven' || link.conquered) continue;
      if ((link.trust || 0) >= 50) continue;
      if (link.tendedWeek === week) continue;
      if (pantryKcal(Game) < 12000) continue;
      try { Game.tendLink(link.id); ctx.tended = (ctx.tended || 0) + 1; } catch (e) {}
    }
    // 5. The war road: raid from strength toward the 3-conquest bar.
    // R4 pilot fix: never raid once the court has sat (nationalLive) or is
    // about to (pendingNational) — post-MERCY the links are courtship links
    // (conquered=false) and the old conquered-count guard went blind,
    // mustering a 4th raid into a held realm. After a DISSOLVE, rebuilding
    // by force is honest — the road stays open.
    if (day >= 35 && !st.pendingRaid && !exiled(Game) && !Game.tbfight && !Game.over) {
      if (st.nationalLive || st.pendingNational) return;
      const conquered = links.filter(l => l && l.status === 'active' && l.primary === 'haven' && l.conquered);
      if (conquered.length >= 3) return; // the bar is met; the court will come
      if ((ctx._lastRaidDay || -99) + 14 > day) return; // wounded recover; the road waits
      if ((ctx._raidFailDay || -99) + 7 > day) return; // muster failed recently; don't spam
      if (scholarHpPct(Game) < 0.7) return; // never raid hurt
      if (popAlive(Game) < 4) return; // the village can't spare the hands
      if (pantryKcal(Game) < 12000) return; // war is expensive
      const cands = (st.otherVillages || [])
        .filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
      if (!cands.length) return;
      // Raid the weakest known fire first — the competent conqueror picks
      // the fight it can win bloodlessly.
      let ranked = cands.map(v => {
        let theirs = 1e9;
        try { theirs = Game.villageStandingOf(v.id); } catch (e) {}
        return { v, theirs };
      }).sort((a, b) => a.theirs - b.theirs);
      let ours = 0;
      try { ours = Game.regionalStanding(); } catch (e) {}
      for (const { v, theirs } of ranked) {
        if (ours < theirs * 0.7) continue; // not a fight we can win — walk past
        let r = null;
        try { r = Game.raidVillage(v.id); } catch (e) { r = null; }
        if (r == null) {
          ctx._raidFailDay = day; // muster failed (not enough fighters) — back off a week
          ctx.raidMusterFails = (ctx.raidMusterFails || 0) + 1;
          return;
        }
        ctx._lastRaidDay = day;
        ctx.raidsMustered = (ctx.raidsMustered || 0) + 1;
        answerMustered(Game, ctx); // answer the muster the same pass
        break; // one raid at a time
      }
    }
  } catch (e) {}
}

// answerMustered: the war party is mustered — TERMS first (bloodless), then
// STRIKE if we're strong enough, else WITHDRAW with the face-cost said aloud.
function answerMustered(Game, ctx) {
  try {
    const pr = Game.state.pendingRaid;
    if (!pr || !Game.answerRaid) return;
    let ours = 0, theirs = 1e9;
    try { ours = Game.regionalStanding(); } catch (e) {}
    try { theirs = Game.villageStandingOf(pr.target); } catch (e) {}
    let r = null;
    try { r = Game.answerRaid('terms'); } catch (e) { r = null; }
    ctx.raidTermsTried = (ctx.raidTermsTried || 0) + 1;
    if (r && typeof r === 'object') { ctx.raidsYielded = (ctx.raidsYielded || 0) + 1; return; } // bloodless yield
    if (r === 'refused' || r == null) {
      // Terms refused (or the answer threw) — strike if we can win, else withdraw.
      const strong = ours >= theirs * 0.7 && ours > 0;
      const healthy = scholarHpPct(Game) >= 0.7;
      let r2 = null;
      try { r2 = Game.answerRaid(strong && healthy ? 'strike' : 'withdraw'); } catch (e) { r2 = null; }
      if (strong && healthy) ctx.raidsStruck = (ctx.raidsStruck || 0) + 1;
      else ctx.raidsWithdrawn = (ctx.raidsWithdrawn || 0) + 1;
      return r2;
    }
    return r;
  } catch (e) {}
}

const warcourt = Object.assign({}, competent, {
  id: 'warcourt',
  desc: 'competent + conquest-road force play (raid/terms/strike, Iron Court)',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    courtship(Game, ctx);
  },
});

module.exports = { warcourt, ironAnswer };
