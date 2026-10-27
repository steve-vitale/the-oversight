// fullseat-diag — the full-seat component recorder (sim-fullseat,
// 2026-10-21, flesh-out loop, axis scale-onramp, backlog #710).
//
// THE QUESTION (backlog #710): the INDISPENSABLE door is the only
// never-earned table door (0/16 in the wintrack audit). The sibling DIAG
// (sim-indispensable, 2026-10-20) measured the binding component as the
// wave-4/5 deed bars. THIS layer decomposes the FULL SEAT into its EXACT
// components (src/js/progression.js:613 deedGateReady — the code is
// authoritative, not docs/TABLE.md) and records, per run, each
// component's reach plus distance-to-full — at run end AND at the win
// (wins truncate the measurement window).
//
// FULL SEAT (deedGateReady().ok): w1>=5, w2>=5, w3>=4, w4>=3, w5>=2
// distinct fought blow-by-blow; contests>=3; crises>=3; stage>=2;
// foodDeeds (sentimentTaught && feastSurgeUsed); AND scale national/global
// (Steve ruling 2026-10-27, sim-scalegate-a — scale IS enforced in `ok`,
// not merely reported; the 2026-10-13 "reported but not gating" reading
// is superseded). This instrument reads `ok` and the seat from the real
// gate, so it reports the new truth with no logic change here.
// INDISPENSABLE (table-indispensable.js prereq): (a) full seat,
// (b) foodShared>0, (c) brokerage+might+foodShared>=10.
//
// This layer is a PURE-READ instrument (FULLSEAT=1; unset delegates to
// the wrapped policy byte-identically): every daily, AFTER delegating
// inward, it snapshots the engine's OWN gate state and records max reach
// per component, the first full-seat / first-indispensable moments, and
// the win-day snapshot. It writes NOTHING to game state and draws NO RNG
// — the proof's DET gate pins byte-identity.
//
// COMPOSE UPON (never edit): tribfloor, windefer, seatdrive — this layer
// wraps OUTSIDE them.
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';

// FULLSEAT=1 is the only on-switch. Unset delegates to the wrapped
// policy byte-identically (the proof's guard pins that).
function layerOn() { return process.env.FULLSEAT === '1'; }

// The full-seat bars, exactly as coded in progression.js:613. Scale
// (national/global, enforced in `ok` since the 2026-10-27 ruling) is
// NOT a distance bar here: snapFullSeat reads `ok`, the seat, and the
// rank straight from the real gate, so a sub-national village meeting
// every bar below still reports seat 'lesser' with ok false — the
// binding list below names deed components only, never scale.
const BARS = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2 };
const ORDER = ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage', 'foodDeeds'];

function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// distToFull(reach): per-component distance from the bars given a reach
// object {w1..w5, contests, crises, stage, foodDeeds(bool), foodShared, score}.
function distToFull(r) {
  const d = {
    w1: Math.max(0, BARS.w1 - n0(r.w1)), w2: Math.max(0, BARS.w2 - n0(r.w2)),
    w3: Math.max(0, BARS.w3 - n0(r.w3)), w4: Math.max(0, BARS.w4 - n0(r.w4)),
    w5: Math.max(0, BARS.w5 - n0(r.w5)),
    contests: Math.max(0, BARS.contests - n0(r.contests)),
    crises: Math.max(0, BARS.crises - n0(r.crises)),
    stage: Math.max(0, BARS.stage - n0(r.stage)),
    indispShared: (r.foodShared | 0) > 0 ? 0 : 1,
    indispScore: Math.max(0, 10 - (((r.brokerage | 0) + (r.might | 0) + (r.foodShared | 0)))),
  };
  return d;
}

// snapFullSeat(Game): the engine's own full-seat/indispensable gate state
// in one pure-read object. Returns the component vector, per-component
// distances, the binding blockers, the indispensable sub-gates, and the
// wave-4/5 unlock-chain context (the deeper distance behind the w4/w5 bars).
function snapFullSeat(Game) {
  const s = { day: dayOf(Game), ok: false };
  try {
    const g = (typeof Game.deedGateReady === 'function') ? Game.deedGateReady() : null;
    if (g) {
      s.w1 = g.w1 | 0; s.w2 = g.w2 | 0; s.w3 = g.w3 | 0; s.w4 = g.w4 | 0; s.w5 = g.w5 | 0;
      s.contests = g.contestsN | 0; s.crises = g.crisesN | 0;
      s.stage = g.stage | 0; s.rank = String(g.rank || 'village');
      s.wavesOk = !!g.waves; s.contestsOk = !!g.contests; s.crisesOk = !!g.crises;
      s.stageOk = !!g.stageOk;
      // foodDeeds split: WHICH of the two is missing is the diagnostic.
      let sent = null, surge = null;
      try { const pg = Game.progState ? Game.progState() : null; sent = !!(pg && pg.sentimentTaught); } catch (e) {}
      try { const sc = (Game.state || {}).scholar || {}; surge = !!((sc.prog || {}).feastSurgeUsed); } catch (e) {}
      const missing = [];
      if (sent === false) missing.push('sentimentTaught');
      if (surge === false) missing.push('feastSurgeUsed');
      s.foodDeeds = { sentiment: sent, surge: surge, missing: missing, dist: missing.length ? 1 : 0, ok: missing.length === 0 };
      s.ok = !!g.ok;
    }
  } catch (e) {}
  try {
    const t = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
    s.seat = (t && t.seat) || 'none';
  } catch (e) { s.seat = 'none'; }
  // Indispensable door sub-gates (table-indispensable.js prereq order).
  try {
    const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
    s.brokerage = n0(L.brokerage); s.might = n0(L.might);
    s.foodShared = n0(L.foodShared); s.foodHoarded = n0(L.foodHoarded);
    s.indispScore = s.brokerage + s.might + s.foodShared;
  } catch (e) {}
  try {
    const paths = (typeof Game.tableEarnedPaths === 'function') ? Game.tableEarnedPaths() : [];
    const ie = (paths || []).find(p => String((p && p.id) || '') === 'indispensable');
    if (ie) s.indisp = { earned: !!ie.earned, strength: ie.strength | 0, why: String(ie.why || '') };
  } catch (e) {}
  if (!s.indisp) s.indisp = { earned: false, strength: 0, why: '' };
  // Wave-4/5 unlock chain (game.js:30670 unlockedWave): why the w4/w5
  // bars can't fill even when the village fights.
  try {
    s.unlock = {};
    s.unlock.standing = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null;
    let t4 = 100, t5 = 200;
    try { const sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null; if (sc) { t4 = (sc.t4 | 0) || 100; t5 = (sc.t5 | 0) || 200; } } catch (e) {}
    s.unlock.t4 = t4; s.unlock.t5 = t5;
    if (s.unlock.standing != null) {
      s.unlock.distT4 = Math.max(0, t4 - s.unlock.standing);
      s.unlock.distT5 = Math.max(0, t5 - s.unlock.standing);
    }
    s.unlock.unlockedWave = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : 1;
    s.unlock.w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) > 0) : false;
    try { s.unlock.w2points = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(2) | 0) : null; } catch (e) { s.unlock.w2points = null; }
    s.unlock.w3rung = s.day >= 25 && (s.unlock.w2points == null || s.unlock.w2points >= 5);
    // HOLD-KIND INFERENCE (standing.js villageStandingTotal): when the
    // gated total pins at t5-1 (199), name WHICH hold binds — the plenty
    // cap (bread alone can't buy the fifth draft) or the readiness
    // deferral (the village isn't armed/ready for wave 5). Pure reads.
    try {
      const vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
      if (vs) {
        s.unlock.raw = vs.total | 0;
        s.unlock.war = vs.war | 0; s.unlock.diplomacy = vs.diplomacy | 0; s.unlock.plenty = vs.plenty | 0;
        let cap = 100;
        try { const sc2 = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null; if (sc2) cap = (sc2.plentyCapT5 | 0) || 100; } catch (e2) {}
        s.unlock.capped = (s.unlock.war + s.unlock.diplomacy + Math.min(s.unlock.plenty, cap)) | 0;
        let rd5ready = null, rd5short = null;
        try {
          const rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
          if (rd5) { rd5ready = !!rd5.ready; rd5short = rd5.short || null; }
        } catch (e2) {}
        s.unlock.rd5ready = rd5ready; s.unlock.rd5short = rd5short;
        const holds = [];
        if (s.unlock.raw >= t5 && s.unlock.capped < t5) holds.push('cap');
        if (s.unlock.capped >= t5 && rd5ready === false) holds.push('defer5');
        s.unlock.holdKind = holds.length ? holds.join('+')
          : (s.unlock.standing >= t5 ? 'released' : 'below-bar');
      }
    } catch (e) {}
  } catch (e) {}
  // Distances + binding blockers.
  s.dist = distToFull({
    w1: s.w1, w2: s.w2, w3: s.w3, w4: s.w4, w5: s.w5,
    contests: s.contests, crises: s.crises, stage: s.stage,
    foodShared: s.foodShared, brokerage: s.brokerage, might: s.might,
  });
  if (s.foodDeeds) s.dist.foodDeeds = s.foodDeeds.dist; else s.dist.foodDeeds = 1;
  // Binding = the unmet full-seat blockers (canonical order); if the seat
  // is full, the indispensable sub-gates are the blockers instead.
  const bind = [];
  for (const k of ORDER) {
    const d = k === 'foodDeeds' ? s.dist.foodDeeds : s.dist[k];
    if ((d | 0) > 0) bind.push(k);
  }
  s.binding = bind;
  if (s.seat === 'full' && !s.indisp.earned) {
    const ib = [];
    if (s.dist.indispShared > 0) ib.push('indispShared');
    if (s.dist.indispScore > 0) ib.push('indispScore');
    s.indispBinding = ib;
  } else { s.indispBinding = []; }
  // Worst = the unmet component with the largest distance (ties -> later
  // in ORDER = the harder bars first).
  let worst = null, wd = 0;
  for (const k of ORDER) {
    const d = k === 'foodDeeds' ? s.dist.foodDeeds : s.dist[k];
    if ((d | 0) >= wd && (d | 0) > 0) { wd = d | 0; worst = k; }
  }
  s.worst = worst;
  return s;
}

function ensureFD(ctx) {
  let D = ctx._fullseatdiag;
  if (!D) {
    D = ctx._fullseatdiag = {
      days: 0, errs: 0,
      max: { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, contests: 0, crises: 0, stage: 0,
             foodShared: 0, score: 0, standing: 0 },
      bestSeat: 'none', firstFullSeatDay: null, firstFullSeatSnap: null,
      indispEver: false, firstIndispDay: null, firstIndispSnap: null,
      winSnap: null, winDay: null,
      seats: { none: 0, lesser: 0, full: 0 },
    };
  }
  return D;
}

function recordDaily(Game, ctx) {
  const D = ensureFD(ctx);
  try {
    const s = snapFullSeat(Game);
    D.days++;
    D.seats[s.seat] = (D.seats[s.seat] | 0) + 1;
    // Max reach per component (the closest approach).
    for (const k of ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage']) {
      if ((s[k] | 0) > (D.max[k] | 0)) D.max[k] = s[k] | 0;
    }
    if ((s.foodShared | 0) > (D.max.foodShared | 0)) D.max.foodShared = s.foodShared | 0;
    if ((s.indispScore | 0) > (D.max.score | 0)) D.max.score = s.indispScore | 0;
    if (s.unlock && s.unlock.standing != null && s.unlock.standing > (D.max.standing | 0)) D.max.standing = s.unlock.standing;
    // foodDeeds is boolean-pair: record the first day each half lands.
    if (s.foodDeeds) {
      if (s.foodDeeds.sentiment && D.sentDay == null) D.sentDay = s.day;
      if (s.foodDeeds.surge && D.surgeDay == null) D.surgeDay = s.day;
    }
    if (s.seat === 'full') {
      if (D.firstFullSeatDay == null) { D.firstFullSeatDay = s.day; D.firstFullSeatSnap = s; }
    } else if (s.seat === 'lesser') {
      if (D.firstLesserDay == null) D.firstLesserDay = s.day;
    }
    if (s.indisp.earned && !D.indispEver) {
      D.indispEver = true; D.firstIndispDay = s.day; D.firstIndispSnap = s;
    }
    // The win ends the measurement window — snapshot the gates AT THE WIN.
    let won = false;
    try { won = !!Game.won; } catch (e) {}
    if (won && !D.winSnap) { D.winSnap = s; D.winDay = s.day; }
    D.bestSeat = s.seat;
  } catch (e) { D.errs = (D.errs | 0) + 1; }
  return D;
}

function withFullseatDiag(inner, id, desc) {
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // PURE-READ discipline: record AFTER the inner daily runs, and the
      // record path itself performs no writes to game state and draws no
      // RNG — only reads + logging into ctx (the probe's own surface).
      const r = inner.daily(Game, ctx);
      if (layerOn()) recordDaily(Game, ctx);
      return r;
    },
  });
}

module.exports = { layerOn, withFullseatDiag, snapFullSeat, distToFull, recordDaily, ensureFD, BARS, ORDER };
