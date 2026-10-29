// fullseat-pursuit — leanlinkrescue courtship + FULL-SEAT-ONLY seat legs +
// deed pursuit (sim-fullseat-a, axis scale-onramp, run fleshout-20261029T1715Z,
// backlog #920).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: FULLSEATPURSUIT unset or not
// '1' → daily delegates to tableseat-nowait.daily and upkeep delegates to
// tableseat-nowait.upkeep (the det-gate in scripts/test-fullseat-a-sweep.js
// pins that: off daily/upkeep is the substrate, byte-identical days on the
// det-gate seed).
//
// WHY THIS POLICY EXISTS: backlog #920 — all 6 seats taken across the
// 1955Z tableseat arms were LESSER seats, so the full seat's reachability
// is decoration-or-real unknown; the 2115Z diag arm then decomposed the
// blockers on the tableseat band (w5 8/8 unreachable — wave 5 never
// unlocked, standing never reached 200; w4 6/8; foodDeeds 6/8, always the
// surge half). The diag arm only RECORDED. This arm PURSUES, and it
// resolves the diag arm's truncation finding: a policy that takes the
// lesser seat at first ready preview ENDS the run at the win before the
// wave bars can fill. A genuine full-seat chase must therefore DECLINE
// the lesser seat and keep playing. That is this policy's first leg:
//
//   1. FULL-ONLY SEAT LEGS: seat legs copied verbatim from
//      scripts/policies/tableseat-nowait.js (tsAnswerTableChoices +
//      tsDriveSeat), with ONE gate added: a ready preview is acted on
//      ONLY when pv.seat === 'full'. A ready LESSER preview is counted
//      (fsLesserSkipped) and deliberately NOT taken — the village keeps
//      playing toward full. The cost of that refusal is measured by the
//      run's guards (starvation, median days), not assumed away.
//      Overtime accrues while unseated (table.js); the preview's
//      overtime tier is recorded (fsOvertimeMax).
//   2. COURTSHIP SHARED EXACTLY: leanlinkrescue.daily runs inside
//      tableseat-nowait's seat legs? NO — this policy wraps
//      tableseat-nowait for the OFF path, but when ON it runs the seat
//      legs itself and then leanlinkrescue.daily directly (NOT
//      tableseat-nowait.daily, which would take lesser seats). The
//      courtship is therefore shared exactly with the OFF arm; the
//      delta is ONLY (a) the full-only gate, (b) the pursuit verbs.
//   3. PURSUIT VERBS (proven APIs only, all copied from winseek.js /
//      deed-seeking.js patterns, never invented):
//      - upkeep patrol (winseek huntPatrol): far wild tiles ~3x/week
//        (day % 7 in [1,3,5]), every day while feasted; wave-targeted
//        (only while some unlocked wave's deed bar is unfilled);
//        kcal floor + net-drain gate so the village is not freeloaded.
//        More encounters = more wave deeds AND more kills feeding the
//        wave-ledger unlock chain AND war standing.
//      - sentiment road (winseek sentimentRoad): channel ready
//        keepsakes daily once sentiment is taught — arms the feast
//        surge; the surge deed (feastSurgeUsed) marks when the buff
//        burns in combat, which the patrol + harness fight driver do.
//      - feast road (winseek feastRoad): host a feast weekly-ish
//        when the pantry carries it and the bearer is not a net drain
//        — the buff that must burn for the surge deed.
//      - integration road (winseek integrationRoad, trimmed): system
//        quests, trials, teach one villager — moves integration
//        toward stage 2 (stage was 0/8 binding on the diag band, so
//        this is belt-and-braces, not the chase).
//   4. FIGHT BEHAVIOR UNCHANGED: this policy defines NO fight hook, so
//      competent.fight (inherited through leanlinkrescue) runs on both
//      arms identically. The patrol changes HOW OFTEN fights happen,
//      never how they are fought. Contests are harness-driven
//      (choice 0 = participate) on both arms identically.
//
// WHAT THIS POLICY CANNOT MOVE (declared up front, so a miss reads as
// a finding, not a surprise): the wave-5 UNLOCK itself — standing past
// 200 needs war + diplomacy + plenty components the policy can only
// nudge (kills, links, surplus); no policy verb directly buys
// standing. If the binding gate stays w5/unlockedWave, that IS the
// finding: report per-seed gate attribution, do not force the bar.
//
// A GO verdict means GO CANDIDATE as an instrument, default-OFF only —
// landing this as competent play is a coordinator/Steve call, NOT made
// by this arm. No default flips. A NO-GO deletes this file and lands
// only instruments + evidence (tableseat precedent).
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');
const { leanlinkrescue } = require('./leanlinkrescue');

function layerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.FULLSEATPURSUIT) || '0') === '1'; } catch (e) { return false; }
}

const FS_RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function fsGday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function fsRankOrder(Game) { try { return FS_RANK_ORDER[(Game.scaleRank ? Game.scaleRank() : 'village') || 'village'] || 0; } catch (e) { return 0; } }
function fsScholarAlive(Game) {
  try {
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') return true;
    const p = Game.getPerson(sid);
    if (!p) return true;
    return !p.dead;
  } catch (e) { return true; }
}
function fsCanPropose(Game) {
  try { const s = (Game.state || {}).scholar || {}; return !s.exiled && !s.joinedVillage; } catch (e) { return false; }
}
// Answer legs: verbatim from tableseat-nowait.js (tsAnswerTableChoices).
function fsAnswerTableChoices(Game, ctx) {
  try {
    let n = 0, lastSig = null, stall = 0;
    for (;;) {
      if (Game.over || n >= 30) break;
      if (Game.tbfight && !Game.tbfight.over) break;
      const tc = (Game.state.scholar || {}).tableChoices;
      if (!tc || !tc.options || !tc.options.length || !Game.chooseTableOption) break;
      const sig = tc.frame + '|' + tc.options.map(o => o.id).join(',');
      if (sig === lastSig && ++stall >= 2) break;
      lastSig = sig;
      try { Game.chooseTableOption(tc.options[0].id); } catch (e) { ctx.fsTableErr = String(e && e.message).slice(0, 80); break; }
      n++;
      ctx.fsTableAnswers = (ctx.fsTableAnswers || 0) + 1;
      if (String(tc.options[0].id).indexOf('path:') === 0) ctx.fsTablePath = tc.options[0].id.slice(5);
    }
  } catch (e) { ctx.fsTableErr = String(e && e.message).slice(0, 80); }
}
// Seat legs: tableseat-nowait's tsDriveSeat with the ONE added gate —
// act ONLY on a FULL seat. A ready lesser preview is counted and skipped.
function fsDriveSeatFullOnly(Game, ctx) {
  if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') return;
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { ctx.fsSeatErr = String(e && e.message).slice(0, 80); return; }
  if (!pv) return;
  ctx.fsPreviewSeen = (ctx.fsPreviewSeen || 0) + 1;
  if (pv.seat === 'full') ctx.fsFullPreviewSeen = (ctx.fsFullPreviewSeen || 0) + 1;
  if (pv.overtime != null) ctx.fsOvertimeMax = Math.max(ctx.fsOvertimeMax || 0, pv.overtime | 0);
  if (!pv.ready) { ctx.fsPreviewNotReady = (ctx.fsPreviewNotReady || 0) + 1; return; }
  if (pv.seat !== 'full') {
    // THE PURSUIT GATE: a ready lesser seat is deliberately declined so
    // the run keeps playing toward full. Counted, never silent.
    ctx.fsLesserSkipped = (ctx.fsLesserSkipped || 0) + 1;
    ctx.fsSkippedKind = pv.seat;
    return;
  }
  ctx.fsFullReadySeen = (ctx.fsFullReadySeen || 0) + 1;
  if (!fsScholarAlive(Game)) { ctx.fsNoScholar = (ctx.fsNoScholar || 0) + 1; return; }
  if (!fsCanPropose(Game)) { ctx.fsGuardRefused = (ctx.fsGuardRefused || 0) + 1; return; }
  ctx.fsSeatAttempts = (ctx.fsSeatAttempts || 0) + 1;
  let r = null;
  try { r = Game.tableTakeSeat(); } catch (e) { ctx.fsSeatErr = String(e && e.message).slice(0, 80); return; }
  if (r && r.ok) {
    ctx.fsSeatTaken = (ctx.fsSeatTaken || 0) + 1;
    ctx.fsSeatDay = fsGday(Game);
    ctx.fsSeatKind = pv.seat;
    fsAnswerTableChoices(Game, ctx);
  } else {
    ctx.fsSeatFailed = (ctx.fsSeatFailed || 0) + 1;
  }
}

// --- Pursuit verbs (proven APIs, winseek.js patterns) ---

function fsPatrol(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    const day = s.day || 1;
    let feasted = false;
    try { feasted = Game.feastedActive && Game.feastedActive() && !((s.feastBuff || {}).used); } catch (e) {}
    if (!feasted && ![1, 3, 5].includes(day % 7)) return;
    if (ctx._fsPatrolDay === day && !feasted) return;
    ctx._fsPatrolDay = day;
    if ((s.kcal || 0) < (Game.kcalCap ? Game.kcalCap() * 0.4 : 800)) return;
    try {
      const v = Game.state.village || {};
      const me = Game.villagerId;
      const drain = ((v.takes || {})[me] || 0) - ((v.gives || {})[me] || 0);
      if (drain > 3000) return;
    } catch (e) {}
    try {
      const g = Game.deedGateReady ? Game.deedGateReady() : null;
      if (g && !feasted) {
        const bars = [g.w1 >= 5, g.w2 >= 5, g.w3 >= 4, g.w4 >= 3, g.w5 >= 2];
        const uw = Game.unlockedWave ? Game.unlockedWave() : 1;
        let need = false;
        for (let w = 1; w <= uw; w++) if (!bars[w - 1]) { need = true; break; }
        if (!need) return;
      }
    } catch (e) {}
    const hx = Game.map.px, hy = Game.map.py;
    const cands = [];
    for (const tt of (Game.travelTargets() || [])) {
      let t = null;
      try { t = Game.tileAt(tt.x, tt.y); } catch (e) {}
      if (!t || t.type === 'haven') continue;
      let blocked = false;
      try { blocked = !!Game.travelBlockage(tt.x, tt.y); } catch (e) {}
      if (blocked) continue;
      cands.push({ x: tt.x, y: tt.y, d: tt.d });
    }
    cands.sort((a, b) => b.d - a.d);
    let visited = 0;
    for (const c of cands.slice(0, 4)) {
      if (Game.over) break;
      try { Game.travelTo(c.x, c.y); } catch (e) { break; }
      if (Game.over || Game.tbfight) break;
      if (Game.map.px !== c.x || Game.map.py !== c.y) continue;
      visited++;
      try { Game.doAction('forage', {}); } catch (e) {}
      if (Game.over || Game.tbfight) break;
    }
    if (visited) {
      ctx.fsPatrols = (ctx.fsPatrols || 0) + 1;
      try { Game.travelTo(hx, hy); } catch (e) {}
    }
  } catch (e) {}
}

function fsSentimentRoad(Game, ctx) {
  try {
    if (!(Game.sentimentTaught && Game.sentimentTaught())) return;
    const idxs = (Game.channelReadyKeepsakes && Game.channelReadyKeepsakes()) || [];
    let n = 0;
    for (const idx of idxs) {
      try { Game.channelSentiment(idx); n++; } catch (e) {}
      if (n >= 6) break;
    }
    if (n) ctx.fsChannels = (ctx.fsChannels || 0) + n;
  } catch (e) {}
}

function fsFeastRoad(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    const day = s.day || 1;
    const pg = s.prog || {};
    if (pg.feastSurgeUsed) return;
    if ((day - (ctx._fsLastFeastDay || 0)) < 7) return;
    if (Game.playerAtHaven && !Game.playerAtHaven()) return;
    try {
      const vv = Game.state.village || {};
      const me = Game.villagerId;
      const drain = ((vv.takes || {})[me] || 0) - ((vv.gives || {})[me] || 0);
      if (drain > 3000) return;
    } catch (e) {}
    const v = Game.state.village || {};
    let have = 0;
    try { have = Game.pantryKcalLive ? Game.pantryKcalLive(v) : 0; } catch (e) {}
    const present = ((v.roster || []).filter(id => id !== Game.villagerId)).length;
    const cost = Math.max(1500, 400 * (present + 1));
    if (have < cost * 1.5) return;
    try {
      const r = Game.hostFeast();
      if (r && r.ok) { ctx._fsLastFeastDay = day; ctx.fsFeasts = (ctx.fsFeasts || 0) + 1; }
    } catch (e) {}
  } catch (e) {}
}

function fsIntegrationRoad(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    if ((s.integration || 0) >= 80) return;
    try {
      const q = s.activeQuest;
      if (q && q.type === 'system_teach' && Game.checkQuest) { Game.checkQuest('teach'); ctx.fsSq = (ctx.fsSq || 0) + 1; }
    } catch (e) {}
    try {
      if (Game.offerSystemQuest && !s.activeQuest) { Game.offerSystemQuest('event'); ctx.fsSqOffered = (ctx.fsSqOffered || 0) + 1; }
    } catch (e) {}
    try {
      const pg = s.prog || {};
      if (pg.trial && Game.completeTrial) { Game.completeTrial(); ctx.fsTrials = (ctx.fsTrials || 0) + 1; }
    } catch (e) {}
    try {
      const roster = ((Game.state.village || {}).roster || []).slice(0, 2);
      for (const vid of roster) {
        if (Game.teachVillager) { Game.teachVillager(vid); ctx.fsTaught = (ctx.fsTaught || 0) + 1; break; }
      }
    } catch (e) {}
  } catch (e) {}
}

const fullseatPursuit = Object.assign({}, tableseatNowait, {
  id: 'fullseat-pursuit',
  desc: 'leanlinkrescue + FULL-SEAT-ONLY seat legs (ready lesser previews deliberately skipped) + deed pursuit (patrol/channel/feast/integration); default off = tableseat-nowait',
  upkeep(Game, ctx) {
    if (!layerOn()) {
      if (tableseatNowait.upkeep) return tableseatNowait.upkeep(Game, ctx);
      return undefined;
    }
    if (tableseatNowait.upkeep) tableseatNowait.upkeep(Game, ctx);
    fsPatrol(Game, ctx);
  },
  daily(Game, ctx) {
    if (!layerOn()) return tableseatNowait.daily(Game, ctx);
    try {
      const pg0 = Game.progState ? Game.progState() : {};
      if (!pg0.tableDone && fsRankOrder(Game) >= 2) {
        if (ctx.fsNationalDay == null) ctx.fsNationalDay = fsGday(Game);
        fsDriveSeatFullOnly(Game, ctx);
      }
    } catch (e) { ctx.fsSeatErr = String(e && e.message).slice(0, 80); }
    // Courtship shared EXACTLY with the OFF arm (leanlinkrescue.daily
    // directly — NOT tableseat-nowait.daily, which would take lesser
    // seats). The seat-leg delta above is the only seat difference.
    const r = leanlinkrescue.daily(Game, ctx);
    try {
      if (fsRankOrder(Game) >= 2 && ctx.fsNationalDay == null) ctx.fsNationalDay = fsGday(Game);
    } catch (e) {}
    // Pursuit verbs after courtship.
    fsSentimentRoad(Game, ctx);
    fsFeastRoad(Game, ctx);
    fsIntegrationRoad(Game, ctx);
    return r;
  },
});

module.exports = { fullseatPursuit, layerOn, fsDriveSeatFullOnly, fsAnswerTableChoices };
