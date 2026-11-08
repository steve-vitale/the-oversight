// binddiag-b — the national Binding / LEAD realm formation recorder
// (sim-binddiag-b, 2026-11-08, flesh-out loop B, axis scale-onramp).
//
// THE QUESTION (tracker blank 3 from the 0730Z winnability round): on
// current master, what blocks the Binding step that turns a
// national-reaching village into a full-seat village?
//
// NAMING (code authority): "The Binding" is the BELONG road's beat
// (swear/serve/walk) — hierarchy.js:2489, stageNationalBeat comment 2541.
// The LEAD road's beat is "The First Court" (feast/host/cold). This
// recorder covers the WHOLE national pipeline with SHAPE ATTRIBUTION at
// every stage, so the LEAD question is answered by shape instead of
// assuming which road fires.
//
// THE PIPELINE (hierarchy.js, all code citations in the prereg):
//   links form -> Haven-primary subs form -> subs season (30d + trust 40,
//   _linkSeasoned) -> polity qualifies (>=3 seasoned subs = LEAD realm,
//   polityOf(HOME)) -> beat stages (_checkNational: regional >=30d old,
//   not refused/exiled) -> beat answered (answerNationalChoice) ->
//   nationalLive -> national PERSISTS (live state: realm dissolution
//   clears it aloud).
//
// INTERACTION WITH THE VETERANS LOCK (code-level): the pipeline reads NO
// standing input anywhere — the Binding sits BESIDE the veterans lock, not
// behind it. The dependency runs the other way: standing's diplomacy
// counts a seasoned link ONLY inside a regional+ polity (_linkRegionalPlus
// in standing.js), so the Binding is UPSTREAM of the standing raw sum that
// the veterans lock then holds at 99 (defer4) / 199 (defer5). This recorder
// carries standing + rd4/rd5 alongside the pipeline so the two legs can be
// read together per seed, but it does NOT re-measure the veterans lock.
//
// This layer is a PURE-READ instrument (BINDIAG=1; unset delegates to the
// wrapped policy byte-identically): every daily, AFTER delegating inward,
// it snapshots pure-read pipeline state and records first-days, beat
// events, and national-loss events. It writes NOTHING to game state and
// draws NO RNG. It NEVER calls villageStandingTotal() during a run (that
// function releases peaks and emits hold beats — side effects); the gated
// total is computed from pure reads with the standing.js formula and
// validated against the engine's gated total only AFTER runDays.
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';

// BINDIAG=1 is the only on-switch. Unset delegates to the wrapped
// policy byte-identically (the proof's guard pins that).
function layerOn() { return process.env.BINDIAG === '1'; }

function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// computeGated(raw, capped, rd4ready, rd5ready, peak, t4, t5): the
// villageStandingTotal() formula as a pure function of plain data (no
// Game, no side effects) — the standing.js layers, reproduced exactly:
// cap (bread alone can't buy wave 5), defer4/defer5 (readiness holds),
// monotonic peak ratchet (floor). Returns {gated, holds[]}.
function computeGated(raw, capped, rd4ready, rd5ready, peak, t4, t5) {
  const holds = [];
  if (raw >= t5 && capped < t5 && peak < 5) holds.push({ bound: t5 - 1, kind: 'cap' });
  if (raw >= t4 && !rd4ready && peak < 4) holds.push({ bound: t4 - 1, kind: 'defer4' });
  if (capped >= t5 && !rd5ready && peak < 5) holds.push({ bound: t5 - 1, kind: 'defer5' });
  let gated = raw;
  for (const h of holds) if (h.bound < gated) gated = h.bound;
  const floor = peak >= 5 ? t5 : peak >= 4 ? t4 : 0;
  gated = Math.max(gated, floor);
  const binding = holds.filter(h => h.bound === Math.min.apply(null, holds.map(x => x.bound).concat([Infinity])));
  return { gated, holds: holds.map(h => h.kind), binding: binding.map(h => h.kind) };
}

// qualifyFromCounts(c): pipeline qualification from plain link counts.
// c = {seasonedSubs, allConquered, belongGood, foreignSize, seasonedCov, seasonedTrade}.
// Returns {lead, leadShape, belong, covenant, trade, any, shapes[]}.
function qualifyFromCounts(c) {
  const lead = (c.seasonedSubs | 0) >= 3;
  const belong = !!c.belongGood && ((c.foreignSize | 0) >= 4);
  const covenant = (c.seasonedCov | 0) >= 3;
  const trade = (c.seasonedTrade | 0) >= 3;
  const shapes = [];
  if (lead) shapes.push(c.allConquered ? 'conquest' : 'lead');
  if (belong) shapes.push('belong');
  if (covenant) shapes.push('covenant');
  if (trade) shapes.push('trade');
  return { lead, leadShape: lead ? (c.allConquered ? 'conquest' : 'lead') : null, belong, covenant, trade, any: shapes.length > 0, shapes };
}

// snapBinding(Game): the pipeline state in one pure-read object.
// Never calls villageStandingTotal() or polityOf() (see header).
function snapBinding(Game) {
  const s = { day: dayOf(Game), errs: [] };
  try { s.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { s.rank = 'village'; }
  const st = (Game.state || {});
  try { s.networkLive = !!st.networkLive; s.networkLiveDay = st.networkLiveDay | 0; s.regionalAge = s.networkLive ? (s.day - s.networkLiveDay) : null; } catch (e) {}
  try { s.nationalLive = !!st.nationalLive; s.nationalDay = st.nationalDay == null ? null : (st.nationalDay | 0); s.nationalShape = st.nationalShape || null; s.globalLive = !!st.globalLive; s.scaleRefused = !!st.scaleRefused; } catch (e) {}
  try {
    const pn = st.pendingNational;
    s.pendingNational = pn ? { shape: String(pn.shape || ''), day: pn.day | 0, villages: (pn.villages || []).slice() } : null;
  } catch (e) { s.pendingNational = null; }
  try {
    const d = st._natDefer || {};
    s.natDefer = { covenant: d.covenant == null ? null : (d.covenant | 0), trade: d.trade == null ? null : (d.trade | 0) };
  } catch (e) { s.natDefer = { covenant: null, trade: null }; }
  // Link roll, read straight from hierarchyState() (the substrate itself
  // calls this daily — trajectory-safe by construction).
  const links = [];
  try { const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : []; for (const l of (ls || [])) if (l) links.push(l); } catch (e) {}
  const day = s.day;
  let active = 0, subs = 0, conqueredSubs = 0, belongLinks = 0, peerCov = 0, peerTrade = 0;
  let seasonedSubs = 0, seasonedCov = 0, seasonedTrade = 0;
  const subsDetail = [];
  let belongGood = false, foreignSize = 0;
  // Foreign polities, read from state (never written by this recorder).
  let fps = [];
  try { fps = (st.foreignPolities || []).slice(); } catch (e) {}
  const seasoned = (l, forConquest) => {
    try { return (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!forConquest, true) : false; } catch (e) { return false; }
  };
  for (const l of links) {
    if (l.status !== 'active') continue;
    active++;
    if (l.primary === 'haven' && l.subordinate !== 'haven') {
      subs++;
      if (l.conquered) conqueredSubs++;
      const sea = seasoned(l, !!l.conquered);
      if (sea) seasonedSubs++;
      subsDetail.push({
        id: String(l.subordinate || l.id || '?'),
        trust: l.trust | 0, age: day - (l.day | 0),
        seasoned: sea, conquered: !!l.conquered,
        trustGap: sea ? 0 : Math.max(0, 40 - (l.trust | 0)),
        daysToSeason: sea ? 0 : Math.max(0, 30 - (day - (l.day | 0))),
      });
    }
    if (l.subordinate === 'haven' && l.primary !== 'haven') {
      belongLinks++;
      // BELONG good-standing bar (polityOf non-HOME branch, reproduced):
      // trust >= 50, arrears 0, link >= 14 days — SUCCPOLITY grace is
      // env-gated default OFF, so the plain trust is the authority here.
      const good = (l.trust | 0) >= 50 && ((l.arrears | 0) === 0) && (day - (l.day | 0)) >= 14;
      if (good) {
        belongGood = true;
        let size = 2; // primary + Haven
        for (const fp of fps) if (fp && fp.primary === l.primary) { size = 2 + ((fp.subs || []).length); break; }
        if (size > foreignSize) foreignSize = size;
      }
    }
    if (l.kind === 'covenant') {
      peerCov++;
      if (seasoned(l, false)) seasonedCov++;
    }
    if (l.kind === 'trade') {
      peerTrade++;
      if (seasoned(l, false)) seasonedTrade++;
    }
  }
  s.links = {
    active, subs, conqueredSubs, belongLinks, peerCov, peerTrade,
    seasonedSubs, seasonedCov, seasonedTrade,
    subsDetail,
  };
  s.qualify = qualifyFromCounts({
    seasonedSubs, allConquered: subs > 0 && conqueredSubs === subs,
    belongGood, foreignSize, seasonedCov, seasonedTrade,
  });
  // Standing + readiness alongside (pure reads, same set as standing99-diag).
  try {
    const vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
    if (vs) {
      let cap = 100, t4 = 100, t5 = 200;
      try { const sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null; if (sc) { cap = (sc.plentyCapT5 | 0) || 100; t4 = (sc.t4 | 0) || 100; t5 = (sc.t5 | 0) || 200; } } catch (e2) {}
      const capped = ((vs.war | 0) + (vs.diplomacy | 0) + Math.min((vs.plenty | 0), cap)) | 0;
      const rd4 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(4) : null;
      const rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
      const peak = (typeof Game._standingPeakWave === 'function') ? (Game._standingPeakWave() | 0) : 0;
      const g = computeGated(vs.total | 0, capped, !!(rd4 && rd4.ready), !!(rd5 && rd5.ready), peak, t4, t5);
      s.standing = {
        raw: vs.total | 0, war: vs.war | 0, diplomacy: vs.diplomacy | 0, plenty: vs.plenty | 0,
        links: vs.links | 0, feasts: vs.feasts | 0, capped, gated: g.gated, holds: g.holds, bindingHold: g.binding,
        peak, rd4: rd4 ? { ready: !!rd4.ready, veterans: rd4.veterans | 0, short: rd4.short || [] } : null,
        rd5: rd5 ? { ready: !!rd5.ready, veterans: rd5.veterans | 0, short: rd5.short || [] } : null,
      };
    }
  } catch (e) { s.errs.push('standing:' + String((e && e.message) || e).slice(0, 80)); }
  try { s.unlockedWave = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : 1; } catch (e) { s.unlockedWave = 1; }
  return s;
}

// snapBindingEnd(Game): post-run end snapshot — snapBinding PLUS the
// engine's own gated total for validation (post-run only; calling
// villageStandingTotal() mid-run would release peaks and emit beats).
function snapBindingEnd(Game) {
  const s = snapBinding(Game);
  try {
    s.engineGated = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null;
    s.gatedMatchesEngine = (s.standing && s.engineGated != null) ? (s.standing.gated === s.engineGated) : null;
  } catch (e) { s.engineGated = null; s.gatedMatchesEngine = null; }
  try {
    const t = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
    s.seat = (t && t.seat) || 'none';
  } catch (e) { s.seat = 'none'; }
  return s;
}

function ensureBD(ctx) {
  let D = ctx._binddiag;
  if (!D) {
    D = ctx._binddiag = {
      days: 0, errs: 0, traj: [],
      first: {
        linkDay: null, subDay: null, seasonedSubDay: null,
        leadQualifyDay: null, anyQualifyDay: null,
        pendingDay: null, pendingShape: null,
        nationalDay: null, nationalShape: null,
        globalDay: null,
      },
      maxSeasonedSubs: 0, maxSubs: 0,
      beats: [], // {stagedDay, shape, resolvedDay, outcome: answered|died|refused|deferred, nationalDay}
      nationalLost: [], // {day, rankAfter}
      refusedDay: null, refusedShape: null,
      winSnap: null, winDay: null,
      lastPending: null, lastRank: null, lastNationalLive: false,
    };
  }
  return D;
}

function recordDaily(Game, ctx) {
  const D = ensureBD(ctx);
  try {
    const s = snapBinding(Game);
    D.days++;
    // Compact trajectory point (one per day; full snapshot at end).
    D.traj.push({
      day: s.day, rank: s.rank, netAge: s.regionalAge,
      active: s.links.active, subs: s.links.subs, sSubs: s.links.seasonedSubs,
      belong: s.links.belongLinks, cov: s.links.seasonedCov, trade: s.links.seasonedTrade,
      leadQ: s.qualify.lead ? 1 : 0, anyQ: s.qualify.any ? 1 : 0,
      pend: s.pendingNational ? s.pendingNational.shape : null,
      nat: s.nationalLive ? 1 : 0, glob: s.globalLive ? 1 : 0,
      stRaw: s.standing ? s.standing.raw : null, stGated: s.standing ? s.standing.gated : null,
      stDipl: s.standing ? s.standing.diplomacy : null,
      rd4v: s.standing && s.standing.rd4 ? s.standing.rd4.veterans : null,
      rd5v: s.standing && s.standing.rd5 ? s.standing.rd5.veterans : null,
      rd4r: s.standing && s.standing.rd4 ? (s.standing.rd4.ready ? 1 : 0) : null,
      rd5r: s.standing && s.standing.rd5 ? (s.standing.rd5.ready ? 1 : 0) : null,
      uw: s.unlockedWave,
    });
    if (s.errs.length) D.errs += s.errs.length;
    const F = D.first;
    if (s.links.active > 0 && F.linkDay == null) F.linkDay = s.day;
    if (s.links.subs > 0 && F.subDay == null) F.subDay = s.day;
    if (s.links.seasonedSubs > 0 && F.seasonedSubDay == null) F.seasonedSubDay = s.day;
    if (s.qualify.lead && F.leadQualifyDay == null) F.leadQualifyDay = s.day;
    if (s.qualify.any && F.anyQualifyDay == null) F.anyQualifyDay = s.day;
    if (s.links.seasonedSubs > D.maxSeasonedSubs) D.maxSeasonedSubs = s.links.seasonedSubs;
    if (s.links.subs > D.maxSubs) D.maxSubs = s.links.subs;
    // Beat events: pending appears -> staged; pending disappears ->
    // resolved (answered if nationalLive, refused if scaleRefused,
    // deferred if the shape's _natDefer moved, else died).
    const prev = D.lastPending;
    const cur = s.pendingNational;
    if (cur && !prev) {
      D.beats.push({ stagedDay: s.day, shape: cur.shape, resolvedDay: null, outcome: null, nationalDay: null });
      if (F.pendingDay == null) { F.pendingDay = s.day; F.pendingShape = cur.shape; }
    } else if (!cur && prev) {
      const b = D.beats[D.beats.length - 1];
      if (b && b.resolvedDay == null) {
        b.resolvedDay = s.day;
        if (s.nationalLive) { b.outcome = 'answered'; b.nationalDay = s.day; }
        else if (s.scaleRefused) { b.outcome = 'refused'; if (D.refusedDay == null) { D.refusedDay = s.day; D.refusedShape = prev.shape; } }
        else if (prev.shape === 'covenant' && s.natDefer.covenant != null && s.natDefer.covenant >= s.day) b.outcome = 'deferred';
        else if (prev.shape === 'trade' && s.natDefer.trade != null && s.natDefer.trade >= s.day) b.outcome = 'deferred';
        else b.outcome = 'died';
      }
    }
    D.lastPending = cur ? { shape: cur.shape, day: cur.day } : null;
    // National transitions.
    if (s.nationalLive && !D.lastNationalLive) {
      if (F.nationalDay == null) { F.nationalDay = s.day; F.nationalShape = s.nationalShape || (cur ? cur.shape : null) || 'unknown'; }
      // SAME-DAY STAGE+ANSWER INFERENCE (instrument fix, run 1 finding):
      // the substrate answers a staged beat the same tick it stages, so
      // pendingNational never survives to an end-of-day sample (run 1:
      // pendDays=[] on all 8 seeds, yet national flipped on 4/8). A
      // nationalLive flip with no open beat means a beat staged and was
      // answered inside the day — record it inferred, with the shape the
      // engine stamped (state.nationalShape). Beats observed pending at a
      // sample take the resolution path above instead — never double-counted.
      const openBeat = (D.beats.length && D.beats[D.beats.length - 1].resolvedDay == null) ? D.beats[D.beats.length - 1] : null;
      if (!openBeat) {
        const shape = s.nationalShape || (cur ? cur.shape : null) || 'unknown';
        D.beats.push({ stagedDay: s.day, shape, resolvedDay: s.day, outcome: 'answered', nationalDay: s.day, inferred: 'same-day' });
        if (F.pendingDay == null) { F.pendingDay = s.day; F.pendingShape = shape; }
      }
    }
    if (!s.nationalLive && D.lastNationalLive) {
      D.nationalLost.push({ day: s.day, rankAfter: s.rank });
    }
    if (s.globalLive && F.globalDay == null) F.globalDay = s.day;
    D.lastNationalLive = s.nationalLive;
    D.lastRank = s.rank;
    // The win ends the measurement window — snapshot the pipeline AT THE WIN.
    let won = false;
    try { won = !!Game.won; } catch (e) {}
    if (won && !D.winSnap) { D.winSnap = s; D.winDay = s.day; }
  } catch (e) { D.errs = (D.errs | 0) + 1; }
  return D;
}

function withBindDiag(inner, id, desc) {
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

module.exports = { layerOn, withBindDiag, snapBinding, snapBindingEnd, recordDaily, ensureBD, computeGated, qualifyFromCounts };
