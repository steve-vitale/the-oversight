// fieldpos-diag — field-fight position recorder
// (sim-fieldpos-a, 2026-10-25, flesh-out loop, axis scale-onramp,
// DIAG ONLY: zero src/js changes, policy-side recorder only).
//
// QUESTION (next blank from sim-echodraft-a): the wound-echo gap
// (defender-wounded entities 10.3 re-meets each vs field-wounded
// 4.1) is NOT explained by nearest-first raid drafting
// (sim-echodraft-a REFUTED it: defender-wounded entities sit no
// nearer Haven at draft time). The two remaining candidates are
// LINGERING (defender-wounded entities stay near Haven / near the
// fight site between fights, so villagers keep meeting them there)
// and COUNTING-STRUCTURE (wounds never heal, so below-line events
// accumulate by arithmetic, not position). Resolve rows before this
// arm carry no tile, so FIELD fights could never be placed —
// whether the field re-meets of a wounded entity happen on the
// Haven tile or out in the woods was UNRESOLVED. This recorder
// places them.
//
// MECHANISM, READ FROM CODE (never invented):
//   - Field fights route through Game.resolveWildMonsterEncounter
//     (game.js) with no opts.raid: villagerMonsterTick iterates
//     world monsters and, for each monster with a villager on its
//     tile (npcsOnNode(m.tx, m.ty)), calls resolve(vid, m). The
//     monster's tx/ty at call time IS the meeting tile, by
//     construction — the villager stands there. Defender fights
//     call the same function with opts.raid (havenRaidTick) and are
//     recorded here too, as the contrast population.
//   - Haven coords: the village px/py (v.px ?? 4, v.py ?? 4) —
//     the same Haven the draft sorts by and the lingering re-pin
//     (havenGrowth.js havenGrowthDaily: lingering raiders are
//     re-pinned to the Haven tile each dawn) writes to.
//   - The fight itself does not move the monster: fieldFight sets
//     m.hp = rec.mHpLeft and nothing in the resolve path rewrites
//     tx/ty. The recorder captures tx/ty BEFORE delegating (the
//     fight-site position) and again AFTER (fidelity check); any
//     pre/post move is reported, never smoothed over.
//   - A null return is the post-flee-rest guard (resolve returns
//     null before any fight) — counted as a no-fight call, never
//     as a fight row. Player fights (startCombat/tbEnd) do NOT
//     route through resolve and are NOT rows here.
//   - Wound fields mirror defwound-diag exactly (start/end HP
//     fractions, break line, manufactured/pre-wounded split) so
//     this corpus is self-contained: first-wound source and
//     re-meet linkage need no join to another recorder. The
//     defwound corpus in the same sweep is a cross-check (fight
//     counts must match), not a dependency.
//   - Instance identity: the spawnsrc recorder (installed BEFORE
//     this one, same composition as sim-defwound-a /
//     sim-echodraft-a) tags each object with _spawnSeq; rows with
//     seq null are counted untagged, never merged into a species
//     bucket.
//
// OBSERVATIONAL ONLY. FIELDPOS=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no daily record. The wrap records AFTER delegating, writes
// nothing to game state, draws no RNG, never throws into the
// engine (recording errors are counted), and returns the
// original's value untouched.
//
// ANALYSIS (analyzeFieldpos, one seed's rows — pure, no Game
// reads, so the unit test can drive every branch on synthetic
// rows):
//   - fight rows (rec non-null) split raid / field; no-fight
//     calls counted separately.
//   - first wound event per seq (first row ending below the
//     line): first-wound source = manufactured ? context of that
//     fight : 'arrived-wounded'. (A below-line end that started
//     below the line with no prior manufactured fight for that
//     seq is arrived-wounded by the defwound convention.)
//   - field re-meet rows: field fight rows with row index
//     strictly greater than the entity's first wound event index.
//     Position distribution (at-Haven share, median/mean
//     distance, distance histogram) per first-wound source.
//   - exposure: per wounded entity, days-alive = last fight-row
//     day (or run end day, passed in) minus first-wound day,
//     floor 1; re-meets per day-alive averaged per class.
//   - sanity: raid rows at-Haven share (teleport construction);
//     pre/post tx/ty move count; untagged row count.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.FIELDPOS === '1'; } catch (e) { return false; } }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }
function breakLineOf(wave) { return (wave | 0) >= 2 ? 0.15 : 0.25; }

function newStore() {
  return { resolveFights: [], noFightCalls: 0, errs: 0, errors: [], overflow: { resolveFights: 0 }, installed: false };
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

function havenXY(Game) {
  let hx = 4, hy = 4;
  try {
    const v = (Game.state || {}).village || {};
    if (v.px !== undefined && v.px !== null) hx = v.px;
    if (v.py !== undefined && v.py !== null) hy = v.py;
  } catch (e) { /* defaults */ }
  return { hx: hx, hy: hy };
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

function installFieldposDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._fieldposDiagStore === store && Game._fieldposDiagInstalled) return Game._fieldposDiagUninstall || function () {};
  const uninstalls = [];
  try {
    if (typeof Game.resolveWildMonsterEncounter === 'function') {
      const orig = Game.resolveWildMonsterEncounter;
      Game.resolveWildMonsterEncounter = function (vid, m, opts) {
        const raid = !!(opts && opts.raid);
        let startM = null, wv = null, seq = null, preTx = null, preTy = null, hx = 4, hy = 4, lingering = null;
        try {
          if (m && m.hp != null) startM = { hp: roundHp(m.hp), max: roundHp(m.maxHp) };
          if (m && m.maxHp == null && m.hp != null) startM = null;
          wv = waveOf(Game, m);
          seq = (m && m._spawnSeq != null) ? m._spawnSeq : null;
          preTx = (m && m.tx != null) ? m.tx : null;
          preTy = (m && m.ty != null) ? m.ty : null;
          const xy = havenXY(Game);
          hx = xy.hx; hy = xy.hy;
          lingering = (m && m.lingering != null) ? !!m.lingering : null;
        } catch (e) { noteErr(store, 'resolve.start', e); }
        const rec = orig.apply(this, arguments);
        try {
          if (!rec) {
            store.noFightCalls++;
          } else {
            const wave = wv ? wv.wave : 1;
            const bl = breakLineOf(wave);
            const endHp = roundHp(rec.mHpLeft);
            const endMax = (startM && startM.max) || null;
            const endFrac = (endHp != null && endMax) ? (endHp / endMax) : null;
            const startFrac = (startM && startM.hp != null && startM.max) ? (startM.hp / startM.max) : null;
            const postTx = (m && m.tx != null) ? m.tx : null;
            const postTy = (m && m.ty != null) ? m.ty : null;
            const dist = (preTx != null && preTy != null) ? (Math.abs(preTx - hx) + Math.abs(preTy - hy)) : null;
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
              tx: preTx, ty: preTy, txPost: postTx, tyPost: postTy,
              moved: (preTx != null && postTx != null && (preTx !== postTx || preTy !== postTy)),
              hx: hx, hy: hy, dist: dist, atHaven: dist === 0,
              lingering: lingering,
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
    try { Game._fieldposDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._fieldposDiagStore = store;
    Game._fieldposDiagInstalled = true;
    Game._fieldposDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withFieldposDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installFieldposDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._fieldpos = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

// ---- pure analysis helpers ----

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function meanOf(arr) {
  if (!arr.length) return null;
  return arr.reduce((t, x) => t + x, 0) / arr.length;
}
function distSumm(dists) {
  const ds = dists.filter(d => d != null);
  const hist = {};
  for (const d of ds) hist[String(d)] = (hist[String(d)] || 0) + 1;
  return {
    n: ds.length, nNull: dists.length - ds.length,
    median: medianOf(ds), mean: meanOf(ds),
    atHaven: ds.filter(d => d === 0).length,
    atHavenShare: ds.length ? ds.filter(d => d === 0).length / ds.length : null,
    dist1Share: ds.length ? ds.filter(d => d <= 1).length / ds.length : null,
    dist2Share: ds.length ? ds.filter(d => d <= 2).length / ds.length : null,
    hist: hist,
  };
}

// analyzeFieldpos(rows, runEndDay):
// rows: fieldpos resolveFights (fight rows only; no-fight calls are
// a separate counter, not rows). runEndDay: the seed run's end day
// (for exposure of still-present entities with no later fight).
function analyzeFieldpos(rows, runEndDay) {
  const rs = (rows || []).slice();
  rs.forEach((r, i) => { r._idx = i; });
  const fights = rs;
  const raid = fights.filter(r => r.raid);
  const field = fights.filter(r => !r.raid);
  const untagged = fights.filter(r => r.seq == null);
  const moved = fights.filter(r => r.moved);
  const withPos = fights.filter(r => r.tx != null && r.ty != null);

  // First wound event per seq: first below-line end that leaves a
  // LIVING entity — outcome mFlee or vFlee (or vDie: the villager
  // died, the monster keeps its wound). A vKill leaves no entity,
  // so it is never a wound event — the defwound convention, which
  // counts below-line ends that persist onto a living entity
  // (fieldFight sets m.hp = mHpLeft for every outcome except
  // vKill). This reproduces defwound's published 56/72/4 exactly;
  // an mFlee-only variant gives 56/69/6 and is reported in the
  // evidence as a sensitivity check, not hidden.
  const firstWoundBySeq = {};
  for (const r of fights) {
    if (r.seq == null || r.outcome === 'vKill' || !r.belowLineEnd) continue;
    if (!firstWoundBySeq[r.seq]) firstWoundBySeq[r.seq] = r;
  }
  function firstWoundSource(ev) {
    if (!ev) return null;
    return ev.manufactured ? ev.context : 'arrived-wounded';
  }
  const sourceBySeq = {};
  for (const seq of Object.keys(firstWoundBySeq)) sourceBySeq[seq] = firstWoundSource(firstWoundBySeq[seq]);
  const sourceCounts = {};
  for (const seq of Object.keys(sourceBySeq)) sourceCounts[sourceBySeq[seq]] = (sourceCounts[sourceBySeq[seq]] || 0) + 1;

  // Field re-meet rows: field fight rows after the entity's first wound.
  const remeetRows = [];
  for (const r of field) {
    if (r.seq == null) continue;
    const ev = firstWoundBySeq[r.seq];
    if (ev && r._idx > ev._idx) remeetRows.push(Object.assign({}, r, { firstWoundSource: sourceBySeq[r.seq], firstWoundDay: ev.day }));
  }
  const remeetBySource = {};
  for (const r of remeetRows) (remeetBySource[r.firstWoundSource] = remeetBySource[r.firstWoundSource] || []).push(r);
  const posBySource = {};
  for (const k of Object.keys(remeetBySource)) posBySource[k] = distSumm(remeetBySource[k].map(r => r.dist));
  // Per-entity view: each entity's median field re-meet distance.
  const entityMedianBySource = {};
  {
    const bySeq = {};
    for (const r of remeetRows) (bySeq[r.seq] = bySeq[r.seq] || []).push(r);
    for (const seq of Object.keys(bySeq)) {
      const src = sourceBySeq[seq];
      const med = medianOf(bySeq[seq].map(r => r.dist).filter(d => d != null));
      if (med != null) (entityMedianBySource[src] = entityMedianBySource[src] || []).push(med);
    }
  }
  const entityPosBySource = {};
  for (const k of Object.keys(entityMedianBySource)) entityPosBySource[k] = distSumm(entityMedianBySource[k]);

  // Exposure: per wounded entity, days-alive and field re-meets.
  const exposureBySource = {};
  {
    const lastDayBySeq = {};
    for (const r of fights) {
      if (r.seq == null) continue;
      lastDayBySeq[r.seq] = Math.max(lastDayBySeq[r.seq] || 0, r.day);
    }
    for (const seq of Object.keys(firstWoundBySeq)) {
      const src = sourceBySeq[seq];
      const ev = firstWoundBySeq[seq];
      const lastDay = Math.max(lastDayBySeq[seq] || ev.day, ev.day);
      const endDay = (runEndDay != null && runEndDay > lastDay) ? runEndDay : lastDay;
      const daysAlive = Math.max(1, endDay - ev.day);
      const nFieldRe = (remeetBySource[src] || []).filter(r => String(r.seq) === String(seq)).length;
      // NOTE: per-entity count via the remeet list filtered by seq —
      // O(n^2) worst case but n is small (hundreds); kept simple and
      // auditable rather than fast.
      if (!exposureBySource[src]) exposureBySource[src] = { entities: 0, totalDaysAlive: 0, totalFieldReMeets: 0, rates: [] };
      const e = exposureBySource[src];
      e.entities++;
      e.totalDaysAlive += daysAlive;
      e.totalFieldReMeets += nFieldRe;
      e.rates.push(nFieldRe / daysAlive);
    }
  }
  const exposureSumm = {};
  for (const k of Object.keys(exposureBySource)) {
    const e = exposureBySource[k];
    exposureSumm[k] = {
      entities: e.entities, totalDaysAlive: e.totalDaysAlive,
      totalFieldReMeets: e.totalFieldReMeets,
      meanReMeetsPerDayAlive: meanOf(e.rates),
      pooledReMeetsPerDayAlive: e.totalDaysAlive ? e.totalFieldReMeets / e.totalDaysAlive : null,
      meanDaysAlive: e.entities ? e.totalDaysAlive / e.entities : null,
    };
  }

  // Lingering-flag view: field re-meet rows where the entity was
  // flagged lingering at fight time, per source.
  const lingeringBySource = {};
  for (const r of remeetRows) {
    const k = r.firstWoundSource;
    if (!lingeringBySource[k]) lingeringBySource[k] = { n: 0, lingering: 0 };
    lingeringBySource[k].n++;
    if (r.lingering) lingeringBySource[k].lingering++;
  }
  for (const k of Object.keys(lingeringBySource)) {
    lingeringBySource[k].lingeringShare = lingeringBySource[k].n ? lingeringBySource[k].lingering / lingeringBySource[k].n : null;
  }

  return {
    fights: fights.length, raidFights: raid.length, fieldFights: field.length,
    untaggedFights: untagged.length, movedRows: moved.length,
    fightsWithPos: withPos.length, fightsMissingPos: fights.length - withPos.length,
    raidPos: distSumm(raid.map(r => r.dist)),
    fieldPos: distSumm(field.map(r => r.dist)),
    woundedEntities: Object.keys(firstWoundBySeq).length,
    firstWoundSourceCounts: sourceCounts,
    fieldReMeets: remeetRows.length,
    fieldReMeetsBySource: Object.fromEntries(Object.keys(remeetBySource).map(k => [k, remeetBySource[k].length])),
    posBySource: posBySource,
    entityPosBySource: entityPosBySource,
    exposureBySource: exposureSumm,
    lingeringBySource: lingeringBySource,
    // Raw lists, so a multi-seed sweep can pool distributions without
    // mixing per-seed instance namespaces (seq repeats across seeds).
    remeetDistsBySource: Object.fromEntries(Object.keys(remeetBySource).map(k => [k, remeetBySource[k].map(r => r.dist)])),
    entityMediansBySource: entityMedianBySource,
    // Re-meet rows themselves, for sense timelines (kept out of the
    // per-seed JSON summary by the sweep, which selects one entity).
    remeetRows: remeetRows.map(r => ({ day: r.day, seq: r.seq, mid: r.mid, wave: r.wave, vid: r.vid, outcome: r.outcome, rounds: r.rounds, mHpStartFrac: r.mHpStartFrac, mHpEndFrac: r.mHpEndFrac, tx: r.tx, ty: r.ty, dist: r.dist, atHaven: r.atHaven, lingering: r.lingering, firstWoundSource: r.firstWoundSource, firstWoundDay: r.firstWoundDay })),
    firstWounds: Object.fromEntries(Object.keys(firstWoundBySeq).map(seq => [seq, { day: firstWoundBySeq[seq].day, mid: firstWoundBySeq[seq].mid, wave: firstWoundBySeq[seq].wave, context: firstWoundBySeq[seq].context, manufactured: !!firstWoundBySeq[seq].manufactured, source: sourceBySeq[seq], tx: firstWoundBySeq[seq].tx, ty: firstWoundBySeq[seq].ty, dist: firstWoundBySeq[seq].dist, atHaven: firstWoundBySeq[seq].atHaven }])),
  };
}

// verdictOf — the pre-registered verdict rule, pure, in one place
// (the sweep summary calls this on pooled numbers; the unit test
// drives all three branches on synthetic inputs).
// posD/posF: {atHavenShare, median}; expD/expF: mean re-meets per
// day-alive (or null when unmeasurable).
function verdictOf(posD, posF, expD, expF) {
  const dShare = (posD && posD.atHavenShare != null) ? posD.atHavenShare : null;
  const fShare = (posF && posF.atHavenShare != null) ? posF.atHavenShare : null;
  const dMed = (posD && posD.median != null) ? posD.median : null;
  const fMed = (posF && posF.median != null) ? posF.median : null;
  if (dShare != null && fShare != null && dMed != null && fMed != null
    && (dShare - fShare) >= 0.10 && dMed < fMed) {
    return { verdict: 'lingering-confirmed', dShare: dShare, fShare: fShare, dMedian: dMed, fMedian: fMed };
  }
  const ratio = (expD != null && expF != null && expF !== 0) ? (expD / expF) : null;
  if (ratio != null && ratio >= 0.8 && ratio <= 1.25 && dShare != null && fShare != null
    && Math.abs(dShare - fShare) <= 0.05) {
    return { verdict: 'counting-structure-confirmed', dShare: dShare, fShare: fShare, dMedian: dMed, fMedian: fMed, exposureRatio: ratio };
  }
  return { verdict: 'lingering-refuted', dShare: dShare, fShare: fShare, dMedian: dMed, fMedian: fMed, exposureRatio: ratio };
}

module.exports = { layerOn, newStore, installFieldposDiag, withFieldposDiag, analyzeFieldpos, verdictOf, breakLineOf, havenXY, medianOf, meanOf, distSumm, MAX_EVENTS };
