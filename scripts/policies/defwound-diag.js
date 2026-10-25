// defwound-diag — defender-fight wound-manufacture recorder
// (sim-defwound-a, 2026-10-25, flesh-out loop, axis scale-onramp,
// STAGE 1 DIAG ONLY: zero src/js changes, policy-side recorder only).
//
// QUESTION (carried blank, findings #990 + #977, measured by
// sim-deathcensus-a): defender fights write most below-line wounds —
// 297 below-line survivors / 342 defender fights (mFlee 299, vKill 20,
// vDie 1). But that count never separated wounds the defender fight
// ITSELF manufactured (entity entered at/above the break line and
// left below it) from wounds it merely inherited (entity entered
// already below the line — toll-dropped, or wounded by an earlier
// fight), and never followed the wounded entity to see whether it is
// ever met again or ever finished. This recorder answers both, on
// the shared scale-wall band, with instance identity — not species
// identity. World-monster entities carry NO stable instance id
// (m.id is the species id); the spawnsrc recorder (installed
// BEFORE this one, same composition as sim-oldcore-a) tags each
// object with _spawnSeq, and this recorder reads that tag. A row
// with seq null is counted untagged, never silently merged into a
// species bucket.
//
// MECHANISM, READ FROM CODE (never invented):
//   - Defender fights route through Game.resolveWildMonsterEncounter
//     (game.js) with opts.raid (havenGrowth.js havenRaidTick calls it
//     with {raid: true}); the wild path calls it with no opts.
//     resolve does NOT forward opts.raid to fieldFight, so the raid
//     context lives only at the resolve level — hence this recorder
//     wraps resolve only. Player fights (startCombat/tbEnd) do NOT
//     route through resolve and are NOT fight rows here; their
//     endings reach a wounded entity only through the oldcore
//     removal record (composed recorder), which the analyzer reads
//     for final fates.
//   - Break line (fieldFights.js: mBreak = wave >= 2 ? 0.15 : 0.25).
//     A fight "writes a below-line wound" when the world entity ends
//     below the line with the wound persisting onto it: fieldFight
//     sets m.hp = rec.mHpLeft for every outcome except vKill, so an
//     mFlee (or vFlee/evade) ending below the line leaves a
//     below-line entity in the world. A vKill leaves no entity.
//   - MANUFACTURED vs PRE-WOUNDED: a below-line end is
//     manufactured by THIS fight iff the entity STARTED at/above the
//     line (startFrac >= breakLine) and ended below it; it is
//     pre-wounded iff it started below the line already. The toll
//     (havenGrowth.js: hp = max(1, hp - wall)) can push an entity
//     below the line BEFORE the defender fight — those are
//     pre-wounded, not defender-manufactured, and the analyzer
//     reports them separately. This is the decomposition the 0535Z
//     tollfloor arm proved necessary (its net tick diff conflated
//     toll with defender fights).
//   - ROUNDS-0 mFlee: a fight that starts below the line ends
//     immediately (volley/break check before round 1) — the 0535Z
//     sense read (tanukis at 5/1 HP met on days 9–77, every meeting
//     rounds-0 mFlee). Rounds-0 rows are flagged, not hidden: a
//     re-meet that costs zero rounds is a phantom meeting, not a
//     fight.
//   - NO HEAL PATH (checked, not assumed): no world-monster HP
//     recovery was found in monsterTurn/havenGrowth (the only hp
//     writes on world entities are the toll, fieldFight's
//     m.hp = mHpLeft persistence, and spawn). The re-meet chains
//     below test this empirically: a wounded entity's start HP
//     should never rise between fights except by respawn (a NEW
//     seq), and any rise is reported as hpRise, not smoothed over.
//
// TRANSCRIPT TAP (env-gated, default OFF): when
// DEFWOUND_TRANSCRIPT=1, resolve rows also record the engine's own
// awayNews line for that fight — read-only (awayNews length before
// vs after delegating proves the line belongs to this fight; a full
// queue drops the line and nothing is recorded). Same pattern as
// deathcensus-diag's tap.
//
// OBSERVATIONAL ONLY. DEFWOUND=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no daily record. The wrap records AFTER delegating, writes
// nothing to game state, draws no RNG, never throws into the
// engine (recording errors are counted), and returns the
// original's value untouched.
//
// ANALYSIS (analyzeDefwound, one seed's stores):
//   - defender population: resolve rows with raid=true.
//   - wound events: defender mFlee rows ending below the line,
//     split manufactured / pre-wounded; same split for field
//     (non-raid) rows as contrast; by-wave tables for both.
//   - re-meet: for each wound event (seq, row index), later resolve
//     rows with the same seq (any context), in row order: count,
//     days to first re-meet, outcomes, rounds-0 share, vKill
//     finishes. Events with seq null are excluded from re-meet
//     linkage and counted untagged.
//   - final fate per DISTINCT below-line-survivor entity (first
//     wound event per seq): finished-by-fight (a later resolve row
//     with outcome vKill for that seq), removed (oldcore removal
//     after the wound day, by kind), still-present (seq in the
//     final present list), or vanished (no removal, not present).
//     A removal followed by still-present reads still-present
//     (re-entry cancels the exit, as in oldcore's analyzer).
//   - hpRise: a later row for the same seq starting ABOVE the
//     previous row's end fraction by more than rounding (0.02) —
//     evidence of a heal path, if one exists.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.DEFWOUND === '1'; } catch (e) { return false; } }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }
function breakLineOf(wave) { return (wave | 0) >= 2 ? 0.15 : 0.25; }

function newStore() {
  return { resolveFights: [], errs: 0, errors: [], overflow: { resolveFights: 0 }, installed: false };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

function waveOf(Game, m) {
  try {
    if (m && m.id && typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m) | 0;
      if (w) return { wave: w, source: 'crisisWaveOf' };
    }
  } catch (e) { /* fall through to def lookup */ }
  try {
    const id = (m && m.id) || null;
    if (id) {
      const defs = (Game.data && Game.data.monsters) || [];
      const def = defs.find(d => d && d.id === id);
      if (def && (def.wave | 0)) return { wave: def.wave | 0, source: 'def' };
    }
  } catch (e) { /* fall through */ }
  return { wave: 1, source: 'default' };
}

function awayNewsTap(Game, lenBefore) {
  try {
    if (process.env.DEFWOUND_TRANSCRIPT !== '1') return null;
    const aw = ((Game.state || {}).scholar || {}).awayNews;
    if (!aw || aw.length <= lenBefore) return null;
    return String(aw[aw.length - 1]).slice(0, 300);
  } catch (e) { return null; }
}
function awayNewsLen(Game) {
  try { const aw = ((Game.state || {}).scholar || {}).awayNews; return aw ? aw.length : 0; } catch (e) { return 0; }
}

function installDefwoundDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._defwoundDiagStore === store && Game._defwoundDiagInstalled) return Game._defwoundDiagUninstall || function () {};
  const uninstalls = [];
  try {
    if (typeof Game.resolveWildMonsterEncounter === 'function') {
      const orig = Game.resolveWildMonsterEncounter;
      Game.resolveWildMonsterEncounter = function (vid, m, opts) {
        const raid = !!(opts && opts.raid);
        const awLen0 = awayNewsLen(Game);
        let startM = null, wv = null, seq = null;
        try {
          if (m && m.hp != null) startM = { hp: roundHp(m.hp), max: roundHp(m.maxHp) };
          if (m && m.maxHp == null && m.hp != null) startM = null; // no max: fractions unusable, row still records counts
          wv = waveOf(Game, m);
          seq = (m && m._spawnSeq != null) ? m._spawnSeq : null;
        } catch (e) { noteErr(store, 'resolve.start', e); }
        const rec = orig.apply(this, arguments);
        try {
          if (rec) {
            const wave = wv ? wv.wave : 1;
            const bl = breakLineOf(wave);
            const endHp = roundHp(rec.mHpLeft);
            const endMax = (startM && startM.max) || null;
            const endFrac = (endHp != null && endMax) ? (endHp / endMax) : null;
            const startFrac = (startM && startM.hp != null && startM.max) ? (startM.hp / startM.max) : null;
            pushCapped(store, 'resolveFights', {
              day: dayOf(Game), vid: vid != null ? String(vid) : null,
              seq: seq, mid: (m && m.id) || null, wave: wave, waveSource: wv ? wv.source : 'default',
              raid: raid, context: raid ? 'raid' : 'field',
              mHpStart: startM ? startM.hp : null, mHpMax: startM ? startM.max : null,
              mHpStartFrac: startFrac,
              outcome: rec.outcome || null,
              rounds: rec.rounds | 0,
              mHpLeft: endHp, mHpEndFrac: endFrac,
              mDealt: rec.mDealt | 0, vTaken: rec.vTaken | 0,
              belowLineStart: (startFrac != null && startFrac < bl),
              belowLineEnd: (endFrac != null && endFrac < bl),
              manufactured: (startFrac != null && endFrac != null && startFrac >= bl && endFrac < bl),
              preWounded: (startFrac != null && endFrac != null && startFrac < bl && endFrac < bl),
              breakLine: bl,
              rounds0: (rec.rounds | 0) === 0,
              awayNewsLast: awayNewsTap(Game, awLen0),
            });
          }
        } catch (e) { noteErr(store, 'resolve.rec', e); }
        return rec;
      };
      uninstalls.push(() => { try { Game.resolveWildMonsterEncounter = orig; } catch (e) {} });
    } else { noteErr(store, 'resolve.missing', new Error('no resolveWildMonsterEncounter')); }
  } catch (e) { noteErr(store, 'resolve.wrap', e); }

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._defwoundDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._defwoundDiagStore = store;
    Game._defwoundDiagInstalled = true;
    Game._defwoundDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withDefwoundDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installDefwoundDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._defwound = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

// analyzeDefwound(defStore, oldStore, finalPresent):
// defStore: {resolveFights}; oldStore: {removals} or null;
// finalPresent: [{seq}] or null. Pure (no Game reads) so the unit
// test can drive every branch on synthetic rows.
function analyzeDefwound(defStore, oldStore, finalPresent) {
  const rows = (defStore && defStore.resolveFights) || [];
  rows.forEach((r, i) => { r._idx = i; });
  const byOutcome = (list) => {
    const m = {};
    for (const r of list) m[r.outcome || 'null'] = (m[r.outcome || 'null'] || 0) + 1;
    return m;
  };
  const byWave = (list) => {
    const m = {};
    for (const r of list) { const k = 'w' + (r.wave | 0); m[k] = (m[k] || 0) + 1; }
    return m;
  };
  const defender = rows.filter(r => r.raid);
  const field = rows.filter(r => !r.raid);
  const defBelowEnd = defender.filter(r => r.outcome === 'mFlee' && r.belowLineEnd);
  const defManufactured = defBelowEnd.filter(r => r.manufactured);
  const defPreWounded = defBelowEnd.filter(r => r.preWounded);
  const defBelowEndUntagged = defBelowEnd.filter(r => r.seq == null);
  const defStartBelow = defender.filter(r => r.belowLineStart);
  const fieldBelowEnd = field.filter(r => r.outcome === 'mFlee' && r.belowLineEnd);
  const fieldManufactured = fieldBelowEnd.filter(r => r.manufactured);
  const fieldPreWounded = fieldBelowEnd.filter(r => r.preWounded);
  // Non-mFlee below-line ends (vFlee/evade leave the wound too).
  const defOtherBelowEnd = defender.filter(r => r.outcome !== 'mFlee' && r.outcome !== 'vKill' && r.belowLineEnd);
  const fieldOtherBelowEnd = field.filter(r => r.outcome !== 'mFlee' && r.outcome !== 'vKill' && r.belowLineEnd);

  // Re-meet linkage: later rows (strictly greater index) same seq.
  const rowsBySeq = {};
  for (const r of rows) {
    if (r.seq == null) continue;
    (rowsBySeq[r.seq] = rowsBySeq[r.seq] || []).push(r);
  }
  function remeetFor(ev) {
    if (ev.seq == null) return null;
    const chain = (rowsBySeq[ev.seq] || []).filter(r => r._idx > ev._idx);
    const first = chain[0] || null;
    return {
      n: chain.length,
      daysToFirst: first ? (first.day - ev.day) : null,
      firstOutcome: first ? first.outcome : null,
      firstContext: first ? first.context : null,
      firstRounds0: first ? !!first.rounds0 : null,
      outcomes: byOutcome(chain),
      rounds0: chain.filter(r => r.rounds0).length,
      vKillFinishes: chain.filter(r => r.outcome === 'vKill').length,
      chainDays: chain.map(r => r.day),
      hpRises: chain.filter((r, i) => {
        const prev = i === 0 ? ev : chain[i - 1];
        return r.mHpStartFrac != null && prev.mHpEndFrac != null && (r.mHpStartFrac - prev.mHpEndFrac) > 0.02;
      }).length,
    };
  }
  // Wound events for re-meet: defender mFlee below-line ends with a seq.
  const woundEvents = defBelowEnd.filter(r => r.seq != null);
  const woundEventsManufactured = defManufactured.filter(r => r.seq != null);
  const woundEventsPreWounded = defPreWounded.filter(r => r.seq != null);
  const remeetOf = (events) => events.map(ev => ({ ev: { day: ev.day, seq: ev.seq, mid: ev.mid, wave: ev.wave, context: ev.context, outcome: ev.outcome, mHpStartFrac: ev.mHpStartFrac, mHpEndFrac: ev.mHpEndFrac, manufactured: !!ev.manufactured }, remeet: remeetFor(ev) }));
  const remeetAll = remeetOf(woundEvents);
  const remeetMan = remeetOf(woundEventsManufactured);
  const remeetPre = remeetOf(woundEventsPreWounded);
  function remeetSummary(list) {
    const n = list.length;
    if (!n) return { events: 0, reMetAtLeastOnce: 0, reMetRate: null, totalReMeets: 0, finishedEntities: 0, finishRate: null, rounds0ReMeets: 0, medianDaysToFirst: null, hpRiseEvents: 0 };
    const reMet = list.filter(x => x.remeet.n > 0);
    const finished = list.filter(x => x.remeet.vKillFinishes > 0);
    const days = reMet.map(x => x.remeet.daysToFirst).filter(d => d != null).sort((a, b) => a - b);
    return {
      events: n,
      reMetAtLeastOnce: reMet.length,
      reMetRate: reMet.length / n,
      totalReMeets: list.reduce((t, x) => t + x.remeet.n, 0),
      finishedEntities: finished.length,
      finishRate: finished.length / n,
      rounds0ReMeets: list.reduce((t, x) => t + x.remeet.rounds0, 0),
      medianDaysToFirst: days.length ? days[Math.floor(days.length / 2)] : null,
      hpRiseEvents: list.filter(x => x.remeet.hpRises > 0).length,
    };
  }
  // Final fate per DISTINCT survivor entity (first wound event per seq).
  const firstWoundBySeq = {};
  for (const ev of woundEvents) if (!firstWoundBySeq[ev.seq]) firstWoundBySeq[ev.seq] = ev;
  const removals = (oldStore && oldStore.removals) || [];
  const removalsBySeq = {};
  for (const rm of removals) {
    if (rm.seq == null) continue;
    (removalsBySeq[rm.seq] = removalsBySeq[rm.seq] || []).push(rm);
  }
  const presentSeqs = new Set(((finalPresent || []).map(p => p.seq)).filter(s => s != null));
  const fates = {};
  const fateDetail = [];
  for (const seq of Object.keys(firstWoundBySeq)) {
    const ev = firstWoundBySeq[seq];
    const laterRemovals = (removalsBySeq[seq] || []).filter(rm => rm.day >= ev.day);
    const laterVKill = (rowsBySeq[seq] || []).some(r => r._idx > ev._idx && r.outcome === 'vKill');
    let fate;
    if (presentSeqs.has(Number(seq)) || presentSeqs.has(seq)) fate = 'still-present';
    else if (laterVKill) fate = 'finished-by-fight';
    else if (laterRemovals.length) fate = 'removed:' + laterRemovals[laterRemovals.length - 1].kind;
    else fate = 'vanished';
    fates[fate] = (fates[fate] || 0) + 1;
    fateDetail.push({ seq: Number(seq), mid: ev.mid, wave: ev.wave, woundDay: ev.day, manufactured: !!ev.manufactured, mHpEndFrac: ev.mHpEndFrac, fate: fate, laterVKill: laterVKill, laterRemovals: laterRemovals.map(rm => rm.kind + '@d' + rm.day) });
  }
  // Longest re-meet chains (sense material): top 5 by re-meet count.
  const topChains = remeetAll.slice().sort((a, b) => b.remeet.n - a.remeet.n).slice(0, 5).map(x => ({
    seq: x.ev.seq, mid: x.ev.mid, wave: x.ev.wave, woundDay: x.ev.day, mHpEndFrac: x.ev.mHpEndFrac,
    reMeets: x.remeet.n, reMeetDays: x.remeet.chainDays, reMeetOutcomes: x.remeet.outcomes,
    finished: x.remeet.vKillFinishes > 0,
  }));
  return {
    rows: rows.length,
    defender: { fights: defender.length, byOutcome: byOutcome(defender), byWave: byWave(defender),
      startBelowLine: defStartBelow.length, startBelowLineByWave: byWave(defStartBelow),
      mFleeBelowLine: defBelowEnd.length, manufactured: defManufactured.length, preWounded: defPreWounded.length,
      untaggedBelowLine: defBelowEndUntagged.length,
      manufacturedByWave: byWave(defManufactured), preWoundedByWave: byWave(defPreWounded),
      otherBelowLineEnds: defOtherBelowEnd.length, otherBelowLineEndsByOutcome: byOutcome(defOtherBelowEnd) },
    field: { fights: field.length, byOutcome: byOutcome(field),
      mFleeBelowLine: fieldBelowEnd.length, manufactured: fieldManufactured.length, preWounded: fieldPreWounded.length,
      manufacturedByWave: byWave(fieldManufactured), preWoundedByWave: byWave(fieldPreWounded),
      otherBelowLineEnds: fieldOtherBelowEnd.length },
    remeet: { all: remeetSummary(remeetAll), manufactured: remeetSummary(remeetMan), preWounded: remeetSummary(remeetPre),
      events: remeetAll.length, distinctEntities: Object.keys(firstWoundBySeq).length },
    fates: fates, fateDetail: fateDetail, topChains: topChains,
  };
}

module.exports = { layerOn, newStore, installDefwoundDiag, withDefwoundDiag, analyzeDefwound, breakLineOf, MAX_EVENTS };
