// vetkill-diag — the waveKillLog recorder (sim-vetkill-a, 2026-10-24,
// flesh-out loop, axis scale-onramp, step 1 of the 2215Z run's named next
// blank: decompose the standing-99 veterans lock).
//
// THE QUESTION: sim-standing99-diag-a (seeds 73671-73678, tableseat-nowait
// substrate) proved standing 99 is a defer4 VETERANS lock (living wave-3
// killer 0/1), but its daily trajectory CANNOT distinguish:
//   (a) stuck seeds never kill a wave-3+ monster, vs
//   (b) they kill one but the killer dies — including same-day intraday
//       cases like seed 73676, where a kill + link collapse happened
//       between daily samples and only the peak ratchet remembers.
// The waveKillLog is append-only (recordWaveKill/recordPyrrhicKill in
// game.js push {d, mid, w, by, via, trick}; dedupe on exact repeats;
// 1000-entry cap), so it survives the killer's death. Recording it
// directly settles (a) vs (b): an entry in the log proves a kill
// happened even if no daily veteran sample ever showed a living killer.
//
// PURE-READ DISCIPLINE (the standing99 discipline, kept): this recorder
// NEVER calls villageStandingTotal() during a run (that function releases
// peaks and emits hold beats — side effects). It copies
// state.waveKillLog (a copy, never the live array) and reads
// waveUnlockReady(4/5) veteran counts — pure reads of live state. It
// writes nothing to game state, draws no RNG, and every read failure is
// counted (no silent empty catches) rather than hidden.
//
// COMPOSE UPON (never edit): tableseat-nowait (which wraps
// leanlinkrescue). VETKILL=1 is the only on-switch. Unset delegates
// byte-identically.
//
// DEATH-DAY OBSERVABILITY (investigated from code, not invented):
// state.village.fallen entries carry {villagerId, day, cause, name} —
// pushed by hurtVillager/removeVillager/ledger paths. A killer found in
// fallen has an observed death day; a killer whose person record reads
// dead but who has NO fallen entry has an UNOBSERVED death day (reported
// as null + deathDayObservable=false, never inferred). The scholar is
// special: waveCombatReadiness treats the current scholar vid as living
// by definition (the current adventurer), so a killer equal to the
// current Game.villagerId classifies LIVING even without a person record.
//
// POLICY-SIDE ONLY — zero src/js changes, no default flips.
'use strict';

function layerOn() { return process.env.VETKILL === '1'; }

function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// copyKillLog(Game): a defensive COPY of the live log (entries are plain
// objects; copy each field so later engine appends cannot rewrite a
// recorded snapshot, and so the recorder never holds a live reference).
// Returns {entries, errs, error}. errs counts read failures; a missing
// log is NOT an error (a village that never killed has no log — that is
// the NEVER-KILLED finding, not a recorder failure).
function copyKillLog(Game) {
  const out = { entries: [], errs: 0, error: null };
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    if (!Array.isArray(log)) { out.errs++; out.error = 'waveKillLog-not-array'; return out; }
    for (const e of log) {
      if (!e || typeof e !== 'object') { out.errs++; continue; }
      out.entries.push({
        d: n0(e.d), mid: e.mid || null, w: n0(e.w),
        by: e.by || null, via: e.via || 'unknown', trick: e.trick || null,
      });
    }
  } catch (e) { out.errs++; out.error = 'waveKillLog: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

// snapVeterans(Game): the daily living-veteran counts, via the same pure
// reads the gate itself uses. Returns {rd4vets, rd5vets, errs, error}.
function snapVeterans(Game) {
  const out = { rd4vets: null, rd5vets: null, errs: 0, error: null };
  try {
    const rd4 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(4) : null;
    const rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
    if (!rd4 || !rd5) { out.errs++; out.error = 'no-waveUnlockReady'; return out; }
    out.rd4vets = n0(rd4.veterans); out.rd5vets = n0(rd5.veterans);
  } catch (e) { out.errs++; out.error = 'veterans: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

function ensureVK(ctx) {
  let D = ctx._vetkilldiag;
  if (!D) D = ctx._vetkilldiag = { days: 0, errs: 0, traj: [], lastLogLen: 0 };
  return D;
}

// recordDaily(Game, ctx): one end-of-day point. Stores ONLY the entries
// that appeared since the last daily sample (the log is append-only, so
// the full log is the concatenation of daily deltas plus the post-run
// snapshot); if the log ever shrinks (it should not), the point records
// a resync flag and re-baselines instead of silently dropping kills.
function recordDaily(Game, ctx) {
  const D = ensureVK(ctx);
  const p = { day: dayOf(Game), errs: 0 };
  const log = copyKillLog(Game);
  p.logLen = log.entries.length;
  p.errs += log.errs; if (log.error) p.error = log.error;
  if (log.entries.length < D.lastLogLen) {
    p.resync = true;
    p.newEntries = log.entries.slice();
  } else {
    p.newEntries = log.entries.slice(D.lastLogLen);
  }
  D.lastLogLen = log.entries.length;
  const v = snapVeterans(Game);
  p.rd4vets = v.rd4vets; p.rd5vets = v.rd5vets;
  p.errs += v.errs; if (v.error) p.error = (p.error ? p.error + '; ' : '') + v.error;
  D.days++;
  D.errs += p.errs;
  D.traj.push(p);
  return D;
}

function withVetkillDiag(inner, id, desc) {
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // PURE-READ discipline: record AFTER the inner daily runs, and the
      // record path performs no writes to game state and draws no RNG.
      const r = inner.daily(Game, ctx);
      if (layerOn()) recordDaily(Game, ctx);
      return r;
    },
  });
}

// classifyKillLog(entries, statusOf): the (a)/(b) verdict for one run.
// entries: copied waveKillLog entries. statusOf(by) -> {alive: bool|null,
//   deathDay: number|null, deathDayObservable: bool, cause: string|null,
//   source: string} where alive===null means UNOBSERVABLE (no person
//   record, no fallen entry, not the current scholar).
// Returns a classification object; NEVER guesses an unobservable killer.
// Rules (fixed before sweeping):
// - No wave-3+ entry at all -> NEVER-KILLED (wave-3+ kill count 0).
// - At least one wave-3+ killer alive at run end -> KILLED-LIVING-KILLER.
// - All wave-3+ killers known dead, none unknown -> KILLED-DEAD-KILLER.
// - No living killer and at least one unknown killer -> UNCLASSIFIED
//   (reason names the unknown vids).
// The wave-4+ subset (the rd5 veterans bar) is classified the same way
// in parallel; a wave-3 kill does not count toward wave-4 veterans.
function classifyKillLog(entries, statusOf) {
  const log = (entries || []).filter(e => e && typeof e === 'object');
  const w3 = log.filter(e => (e.w | 0) >= 3);
  const w4 = log.filter(e => (e.w | 0) >= 4);
  const w5 = log.filter(e => (e.w | 0) >= 5);
  const firstW3 = w3.length ? Math.min.apply(null, w3.map(e => e.d | 0)) : null;
  const firstW4 = w4.length ? Math.min.apply(null, w4.map(e => e.d | 0)) : null;
  const classifySubset = (subset) => {
    const byVid = {};
    for (const e of subset) {
      const vid = e.by || null;
      if (!byVid[vid]) byVid[vid] = [];
      byVid[vid].push(e);
    }
    const killers = [];
    for (const vid of Object.keys(byVid)) {
      let st = null;
      try { st = (typeof statusOf === 'function') ? statusOf(vid === 'null' ? null : vid) : null; } catch (e) { st = null; }
      // statusOf returning null/undefined is treated as unobservable,
      // never as dead: a missing read must not manufacture a death.
      const s = st || { alive: null, deathDay: null, deathDayObservable: false, cause: null, source: 'unreadable' };
      killers.push({
        by: vid === 'null' ? null : vid,
        kills: byVid[vid].length,
        firstDay: Math.min.apply(null, byVid[vid].map(e => e.d | 0)),
        alive: s.alive === true,
        dead: s.alive === false,
        unknown: s.alive !== true && s.alive !== false,
        deathDay: s.deathDay != null ? (s.deathDay | 0) : null,
        deathDayObservable: !!s.deathDayObservable,
        cause: s.cause || null,
        source: s.source || 'unknown',
      });
    }
    const living = killers.filter(k => k.alive);
    const unknown = killers.filter(k => k.unknown);
    let verdict, reason;
    if (!subset.length) { verdict = 'NEVER-KILLED'; reason = 'no waveKillLog entry at this wave threshold'; }
    else if (living.length) { verdict = 'KILLED-LIVING-KILLER'; reason = living.length + ' killer(s) alive at run end'; }
    else if (unknown.length) { verdict = 'UNCLASSIFIED'; reason = 'no living killer and ' + unknown.length + ' killer(s) with unobservable status: ' + unknown.map(k => String(k.by)).join(','); }
    else { verdict = 'KILLED-DEAD-KILLER'; reason = 'all ' + killers.length + ' killer(s) dead at run end'; }
    return { verdict, reason, killers, livingKillers: living.map(k => k.by), unknownKillers: unknown.map(k => String(k.by)) };
  };
  const c3 = classifySubset(w3);
  const c4 = classifySubset(w4);
  return {
    verdict: c3.verdict,
    verdictW4: c4.verdict,
    reason: c3.reason,
    reasonW4: c4.reason,
    totalEntries: log.length,
    w3plusKills: w3.length,
    w4plusKills: w4.length,
    w5plusKills: w5.length,
    firstW3Day: firstW3,
    firstW4Day: firstW4,
    killersW3: c3.killers,
    killersW4: c4.killers,
    livingKillersW3: c3.livingKillers,
    unknownKillersW3: c3.unknownKillers,
    entriesW3: w3,
    entriesW4: w4,
  };
}

// resolveKillerStatus(Game, vid, fallenByVid): post-run pure-read status
// for one killer vid. Returns the statusOf shape classifyKillLog expects.
// fallenByVid: map vid -> fallen entry (or null). Scholar check first:
// the current adventurer is living by the gate's own definition.
function resolveKillerStatus(Game, vid, fallenByVid) {
  if (vid == null) return { alive: null, deathDay: null, deathDayObservable: false, cause: null, source: 'null-killer' };
  try {
    if (Game.villagerId && vid === Game.villagerId) {
      return { alive: true, deathDay: null, deathDayObservable: false, cause: null, source: 'current-scholar' };
    }
  } catch (e) { /* scholar check best-effort */ }
  const fallen = fallenByVid ? fallenByVid[vid] : null;
  let person = null, personRead = false;
  try {
    if (typeof Game.getPerson === 'function') { person = Game.getPerson(vid); personRead = true; }
  } catch (e) { person = null; }
  if (!person) {
    try {
      if (typeof Game.vpOf === 'function') { person = Game.vpOf(vid); personRead = true; }
    } catch (e) { person = null; }
  }
  if (person) {
    if (!person.dead) return { alive: true, deathDay: null, deathDayObservable: false, cause: null, source: 'person-alive' };
    // Dead in the person record: death day only if a fallen entry says so.
    if (fallen) return { alive: false, deathDay: (fallen.day | 0), deathDayObservable: true, cause: fallen.cause || null, source: 'person-dead+fallen' };
    return { alive: false, deathDay: null, deathDayObservable: false, cause: null, source: 'person-dead-no-fallen' };
  }
  if (fallen) return { alive: false, deathDay: (fallen.day | 0), deathDayObservable: true, cause: fallen.cause || null, source: 'fallen-only' };
  return { alive: null, deathDay: null, deathDayObservable: false, cause: null, source: personRead ? 'no-person-no-fallen' : 'unreadable' };
}

module.exports = { layerOn, withVetkillDiag, copyKillLog, snapVeterans, recordDaily, ensureVK, classifyKillLog, resolveKillerStatus };
