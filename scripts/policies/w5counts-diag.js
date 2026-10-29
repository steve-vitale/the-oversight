// w5counts-diag — the wave-5 exact-counts recorder (sim-w5counts-a,
// 2026-10-29, flesh-out loop, axis scale-onramp, backlog #1453).
//
// THE GAP (sim-w5ready-a, 2026-10-29): the fullseat corpus records
// rd5short NAMES only, so readiness distances were bounded intervals
// (veterans [1,2], armor [1,4], weapons [1,6], tricks [1,3]) — exact
// counts were UNMEASURED. The next arm must design a stack pursuit
// variant from counts, not intervals. THIS layer records the exact
// counts per snapshot, plus standing peak splits and killer
// identities, so living-vs-dead is checkable from the row alone.
//
// POLICY-SIDE ONLY — zero src/js changes. PURE-READ instrument
// (W5COUNTS=1; unset delegates to the wrapped policy
// byte-identically): every daily, AFTER delegating inward, it
// snapshots the engine's OWN gate state (Game.waveUnlockReady(5)
// for the four counts — the gate is authoritative, this layer never
// re-implements the bars) and records it into ctx (the probe's own
// surface). It writes NOTHING to game state and draws NO RNG.
// One caveat, declared honestly: the snapshot calls
// Game.villageStandingTotal(), whose release/hold beats are
// engine-own bookkeeping the engine also triggers through
// unlockedWave() during play (castMonster wave-pool checks). The
// --detgate proof in scripts/test-w5counts-a.js empirically pins
// that the extra daily call moves nothing on the substrate seed.
//
// TWO VETERAN CONCEPTS, KEPT SEPARATE (see prereg):
//   - MONSTER veterans: hardened older-wave monsters. Their kills
//     log the monster's BASE wave in state.waveKillLog, so they
//     never count toward the villagers bar below.
//   - LIVING-VILLAGER veterans bar (this layer): distinct killers
//     with waveKillLog entries at wave >= 4, counted LIVING only.
//     Living mirrors standing.js isLiving EXACTLY: the scholar id
//     (Game.villagerId) counts living; otherwise vpOf(vid) and not
//     vp.dead (vp null -> not living). Dead killers are recorded
//     too, with living=false, so the check is doable from the row.
//     VETSHAPE=1 (living-or-dead instrument) is OFF by default and
//     is NOT the game; this layer never enables it and reports the
//     default living-only count as the gate does.
//
// COMPOSE UPON (never edit): fullseat-diag — this layer wraps
// OUTSIDE it (its daily runs after fullseat-diag's record, same
// game state, both pure reads).
'use strict';

// W5COUNTS=1 is the only on-switch. Unset delegates to the wrapped
// policy byte-identically (the proof's guard pins that).
function layerOn() { return process.env.W5COUNTS === '1'; }

function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// holdKind(Game, vs, capped, gated, peakWave, rd5ready, rd4ready):
// the binding hold under standing.js villageStandingTotal layering.
// Priority: tightest binding hold wins (defer4 bound 99 beats
// defer5/cap bound 199); else the ratchet floor; else released /
// plain shortfall. See prereg for the full classification.
function classifyHold(vs, capped, gated, peakWave, rd5ready, rd4ready, t4, t5) {
  const raw = vs ? (vs.total | 0) : 0;
  const holds = [];
  if (raw >= t5 && capped < t5 && peakWave < 5) holds.push({ bound: t5 - 1, kind: 'cap' });
  if (raw >= t4 && rd4ready === false && peakWave < 4) holds.push({ bound: t4 - 1, kind: 'defer4' });
  if (capped >= t5 && rd5ready === false && peakWave < 5) holds.push({ bound: t5 - 1, kind: 'defer5' });
  let minBound = Infinity, minKind = null;
  for (const h of holds) if (h.bound < minBound) { minBound = h.bound; minKind = h.kind; }
  if (minKind && minBound < raw) return minKind;
  if (gated > raw) return 'peak-ratchet floor';
  if (gated >= t5) return 'released';
  return 'below-bar';
}

// snapW5counts(Game): one pure-read snapshot of the wave-5 unlock
// chain at exact-count precision. Returns null only if the engine
// exposes none of the readers (fail-loud upstream, never a fake row).
function snapW5counts(Game) {
  const s = { day: dayOf(Game) };
  try {
    const rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
    if (rd5) {
      s.armored = rd5.armored | 0; s.armed = rd5.armed | 0;
      s.tricks = rd5.tricks | 0; s.veterans = rd5.veterans | 0;
      s.ready = !!rd5.ready; s.short = (rd5.short || []).slice();
      s.demand = rd5.demand ? {
        armored: rd5.demand.armored | 0, armorP: rd5.demand.armorP | 0,
        armed: rd5.demand.armed | 0, tricks: rd5.demand.tricks | 0,
        veterans: rd5.demand.veterans | 0,
      } : null;
    }
  } catch (e) {}
  try {
    const rd4 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(4) : null;
    if (rd4) s.rd4ready = !!rd4.ready;
  } catch (e) {}
  // Tricks identities: distinct monster ids passing the gate's own
  // monsterCounterKnown convention, read from state.monsterCounters.
  try {
    const mc = ((Game.state || {}).monsterCounters) || {};
    const ids = [];
    for (const mid of Object.keys(mc)) {
      try { if (typeof Game.monsterCounterKnown === 'function' && Game.monsterCounterKnown(mid)) ids.push(mid); } catch (e) {}
    }
    s.tricksIds = ids.sort();
  } catch (e) { s.tricksIds = []; }
  // Killer identities: every distinct waveKillLog killer with a
  // wave-4+ kill (BASE wave — a hardened wave-3 monster's kill logs
  // w=3 and never appears here). Living mirrors standing.js
  // isLiving exactly; dead killers are kept with living=false.
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    const scholarId = Game.villagerId;
    const byKiller = {};
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 4)) continue;
      const k = byKiller[e.by] || (byKiller[e.by] = {
        by: e.by, name: null, living: false,
        kills: 0, waves: [], mids: [], firstDay: null, lastDay: null,
      });
      k.kills++;
      if (!k.waves.includes(e.w | 0)) k.waves.push(e.w | 0);
      if (e.mid && !k.mids.includes(e.mid)) k.mids.push(e.mid);
      const d = e.d | 0;
      if (k.firstDay == null || d < k.firstDay) k.firstDay = d;
      if (k.lastDay == null || d > k.lastDay) k.lastDay = d;
    }
    for (const vid of Object.keys(byKiller)) {
      const k = byKiller[vid];
      k.waves.sort((a, b) => a - b); k.mids.sort();
      try {
        if (vid === scholarId) { k.living = true; }
        else if (typeof Game.vpOf === 'function') {
          const vp = Game.vpOf(vid);
          k.living = !!(vp && !vp.dead);
          if (vp) k.name = vp.name || vp.displayName || null;
        }
      } catch (e) { k.living = false; }
      try {
        if (k.name == null && typeof Game.displayName === 'function') k.name = Game.displayName(vid) || null;
      } catch (e) {}
    }
    s.killers = Object.values(byKiller).sort((a, b) => String(a.by).localeCompare(String(b.by)));
    s.livingKillers = s.killers.filter(k => k.living).length;
    s.deadKillers = s.killers.filter(k => !k.living).length;
  } catch (e) { s.killers = []; s.livingKillers = 0; s.deadKillers = 0; }
  // Standing: raw split, capped total, gated total, peak wave.
  try {
    const vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
    if (vs) {
      s.raw = vs.total | 0; s.war = vs.war | 0;
      s.diplomacy = vs.diplomacy | 0; s.plenty = vs.plenty | 0;
    }
  } catch (e) {}
  try {
    const sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null;
    s.t4 = sc ? ((sc.t4 | 0) || 100) : 100;
    s.t5 = sc ? ((sc.t5 | 0) || 200) : 200;
    s.plentyCapT5 = sc ? ((sc.plentyCapT5 | 0) || 100) : 100;
  } catch (e) { s.t4 = 100; s.t5 = 200; s.plentyCapT5 = 100; }
  if (s.raw != null) s.capped = (s.war + s.diplomacy + Math.min(s.plenty, s.plentyCapT5)) | 0;
  try {
    s.gated = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null;
  } catch (e) { s.gated = null; }
  try { s.peakWave = (((Game.state || {})._standingPeakWave) | 0) || 0; } catch (e) { s.peakWave = 0; }
  if (s.raw != null && s.capped != null && s.gated != null) {
    s.holdKind = classifyHold(
      { total: s.raw }, s.capped, s.gated, s.peakWave,
      s.ready, s.rd4ready, s.t4, s.t5);
  }
  // Unlock-chain context (same readers unlockedWave() uses).
  try { s.unlockedWave = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) { s.unlockedWave = null; }
  try { s.w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) > 0) : false; } catch (e) { s.w4faced = false; }
  try { s.w2points = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(2) | 0) : null; } catch (e) { s.w2points = null; }
  try {
    const wl = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : null;
    s.w2bar = (wl && wl.barsPerWave && wl.barsPerWave[2] != null) ? (wl.barsPerWave[2] | 0) : null;
  } catch (e) { s.w2bar = null; }
  s.w3rung = (s.day >= 25) && (s.w2points == null || s.w2bar == null || s.w2points >= s.w2bar);
  return s;
}

function ensureWC(ctx) {
  let D = ctx._w5counts;
  if (!D) {
    D = ctx._w5counts = {
      days: 0, errs: 0, trace: [],
      max: { armored: 0, armed: 0, tricks: 0, veterans: 0,
             armoredDay: null, armedDay: null, tricksDay: null, veteransDay: null },
      peakStanding: null, // {gated, day, war, diplomacy, plenty, raw, capped, holdKind}
      firstMet: { armor: null, weapons: null, tricks: null, veterans: null, ready: null },
    };
  }
  return D;
}

function recordDaily(Game, ctx) {
  const D = ensureWC(ctx);
  try {
    const s = snapW5counts(Game);
    D.days++;
    D.trace.push(s);
    for (const [bar, key] of [['armored', 'armored'], ['armed', 'armed'], ['tricks', 'tricks'], ['veterans', 'veterans']]) {
      if ((s[bar] | 0) > (D.max[key] | 0)) { D.max[key] = s[bar] | 0; D.max[key + 'Day'] = s.day; }
    }
    if (s.gated != null && (D.peakStanding == null || s.gated > D.peakStanding.gated)) {
      D.peakStanding = {
        gated: s.gated, day: s.day, war: s.war, diplomacy: s.diplomacy,
        plenty: s.plenty, raw: s.raw, capped: s.capped, holdKind: s.holdKind,
      };
    }
    if (!s.short.includes('armor') && D.firstMet.armor == null) D.firstMet.armor = s.day;
    if (!s.short.includes('weapons') && D.firstMet.weapons == null) D.firstMet.weapons = s.day;
    if (!s.short.includes('tricks') && D.firstMet.tricks == null) D.firstMet.tricks = s.day;
    if (!s.short.includes('veterans') && D.firstMet.veterans == null) D.firstMet.veterans = s.day;
    if (s.ready && D.firstMet.ready == null) D.firstMet.ready = s.day;
  } catch (e) { D.errs = (D.errs | 0) + 1; }
  return D;
}

function withW5countsDiag(inner, id, desc) {
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // PURE-READ discipline: record AFTER the inner daily runs, and
      // the record path itself performs no writes to game state and
      // draws no RNG — only reads + logging into ctx (the probe's
      // own surface). (villageStandingTotal's engine-own beat
      // bookkeeping is the declared exception, pinned by --detgate.)
      const r = inner.daily(Game, ctx);
      if (layerOn()) recordDaily(Game, ctx);
      return r;
    },
  });
}

module.exports = { layerOn, withW5countsDiag, snapW5counts, recordDaily, ensureWC, classifyHold };
