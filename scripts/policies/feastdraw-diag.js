// feastdraw-diag — feast-draw yield recorder for the scale-onramp
// axis (sim-feastdraw-a, 2026-10-26, flesh-out loop, DIAG ONLY:
// zero src/js changes, policy-side only).
//
// QUESTION (carried blank, the 2315Z run's next blank (1), measured
// by sim-nonworldkill-a): the shared band's ONLY wave-4 kill
// (seed 73678, day 115, strike, by elif_demir, via feast-draw)
// came through the feast draw — but nonworldkill-a proved draws
// are 4/5 lethal yet rare (5 draws on 113 fights). Is the draw a
// real veteran funnel or a lottery ticket? This recorder censuses
// the draw itself: every grant, every draw spawned (or not, with
// its why), every face / drive-off decision, and every buff end
// that strands a draw — joined to the nonworldkill TB-fight census
// for fight outcomes.
//
// MECHANISM, READ FROM CODE (never invented):
//   - grantFeastBuff (feastBuff.js): gates on the devotion arming
//     (prog.feastSurge or the feast-carried surge) and on the
//     fusion reactor (online => honest refusal). An EXISTING buff
//     takes the REFRESH branch (better quality wins, window
//     extends, returns refreshed:true) and NEVER draws. Only the
//     fresh branch calls drawFeastScavenger, once per buff.
//   - drawFeastScavenger: refuses when a pending encounter already
//     exists ('already pending' — never stacks into a phantom),
//     when the smoke chance fails ('smoke carried clear'; the
//     data chance is 1.0, so this should not fire on this band),
//     when castMonster returns nothing ('no cast'), or when the
//     cast id has no def ('unknown id'). On success it sets
//     s.feastDraw = {monsterId, veteran, day} and pendingEncounter
//     + pendingMonsterId, and returns {drawn:true, monsterId,
//     veteran}.
//   - faceFeastDraw: reads the draw via feastDrawPending, calls
//     startCombat(mid), THEN deletes s.feastDraw in a finally —
//     so during startCombat the nonworldkill pre-record still
//     sees s.feastDraw (door feast-draw, initiator faceFeastDraw).
//   - driveOffFeastDraw: reads the draw via feastDrawPending,
//     deletes s.feastDraw, clears pendingEncounter, and returns
//     {ok:true, drivenOff:true}. No fight, no devotion spent.
//   - clearFeastBuff(expired): deletes s.feastBuff and, when the
//     pending encounter matches the draw, clears it and deletes
//     s.feastDraw — a still-circling draw dies with the buff.
//   - The harness fallback (sim-harness driveContestsImpl) faces
//     any still-pending encounter by clearing pending state and
//     calling startCombat(mid) directly — no faceFeastDraw call.
//     Such a fight still carries s.feastDraw at startCombat time
//     (the harness clears pendingEncounter, not s.feastDraw), so
//     nonworldkill classifies it feast-draw with initiator
//     'harness-fallback'. The analyzer's faced-harness class is
//     exactly this: a feast-draw start row with no face row.
//
// OBSERVATIONAL ONLY. FEASTDRAW=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps record AFTER delegating where it matters,
// write nothing to game state (store arrays only, plus the same
// installed-flag class the other recorders use), draw no RNG,
// never throw into the engine (recording errors are counted; an
// engine throw from the wrapped function itself is recorded and
// RETHROWN unchanged), and return the original value untouched.
//
// PURE READS ONLY: the recorder NEVER calls feastedActive() or
// feastDrawPending() — both can clear state (feastedActive clears
// an expired buff; feastDrawPending deletes a stale draw). Every
// pre/post snapshot reads s.feastBuff / s.feastDraw directly.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.FEASTDRAW === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    grants: [], draws: [], faces: [], driveoffs: [], clears: [],
    errs: 0, errors: [], overflow: { grants: 0, draws: 0, faces: 0, driveoffs: 0, clears: 0 },
    installed: false, _activeGrant: null,
  };
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

function snapDraw(Game) {
  try {
    const d = ((Game.state || {}).scholar || {}).feastDraw || null;
    if (!d || !d.monsterId) return null;
    return { monsterId: String(d.monsterId), veteran: !!d.veteran, day: d.day || 0 };
  } catch (e) { return null; }
}

function snapBuff(Game) {
  try {
    const b = ((Game.state || {}).scholar || {}).feastBuff || null;
    if (!b || typeof b !== 'object') return null;
    return { quality: b.quality != null ? b.quality : null, mult: b.mult != null ? b.mult : null, untilDay: b.untilDay || 0, used: !!b.used };
  } catch (e) { return null; }
}

function waveOf(Game, mid) {
  try {
    const def = ((Game.data && Game.data.monsters) || []).find(d => d && d.id === mid);
    return def ? (def.wave | 0) : null;
  } catch (e) { return null; }
}

function installFeastdrawDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._feastdrawDiagStore === store && Game._feastdrawDiagInstalled) return Game._feastdrawDiagUninstall || function () {};
  const uninstalls = [];
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  }

  wrap('grantFeastBuff', (orig) => function (feast) {
    let preDraw = null, preBuff = null, grantIdx = null;
    try {
      preDraw = snapDraw(Game);
      preBuff = snapBuff(Game);
      grantIdx = store.grants.length;
      store._activeGrant = grantIdx;
    } catch (e) { noteErr(store, 'grant.pre', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const postDraw = snapDraw(Game);
      const r = (result && typeof result === 'object') ? result : {};
      pushCapped(store, 'grants', {
        day: dayOf(Game), granted: !!r.granted, refreshed: !!r.refreshed,
        mult: (r.mult != null ? r.mult : null), quality: (r.quality != null ? r.quality : null),
        why: (r.why != null ? String(r.why).slice(0, 160) : null),
        drawMonsterId: (r.draw != null ? String(r.draw) : (postDraw ? postDraw.monsterId : null)),
        preDraw: preDraw, preBuff: preBuff, postDraw: postDraw,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
      });
    } catch (e) { noteErr(store, 'grant.rec', e); }
    try { store._activeGrant = null; } catch (e) {}
    if (threw) throw threw;
    return result;
  });

  wrap('drawFeastScavenger', (orig) => function () {
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const r = (result && typeof result === 'object') ? result : {};
      const mid = (r.monsterId != null ? String(r.monsterId) : null);
      pushCapped(store, 'draws', {
        day: dayOf(Game), drawn: !!r.drawn, monsterId: mid,
        veteran: !!r.veteran, wave: mid ? waveOf(Game, mid) : null,
        why: (r.why != null ? String(r.why).slice(0, 160) : null),
        grantIdx: (store._activeGrant != null ? store._activeGrant : null),
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
      });
    } catch (e) { noteErr(store, 'draw.rec', e); }
    if (threw) throw threw;
    return result;
  });

  wrap('faceFeastDraw', (orig) => function () {
    let preDraw = null;
    try { preDraw = snapDraw(Game); } catch (e) { noteErr(store, 'face.pre', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const r = (result && typeof result === 'object') ? result : {};
      pushCapped(store, 'faces', {
        day: dayOf(Game), ok: !!r.ok,
        monsterId: (r.monsterId != null ? String(r.monsterId) : (preDraw ? preDraw.monsterId : null)),
        preDraw: preDraw, why: (r.why != null ? String(r.why).slice(0, 160) : null),
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
      });
    } catch (e) { noteErr(store, 'face.rec', e); }
    if (threw) throw threw;
    return result;
  });

  wrap('driveOffFeastDraw', (orig) => function () {
    let preDraw = null;
    try { preDraw = snapDraw(Game); } catch (e) { noteErr(store, 'drive.pre', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const r = (result && typeof result === 'object') ? result : {};
      pushCapped(store, 'driveoffs', {
        day: dayOf(Game), ok: !!r.ok, drivenOff: !!r.drivenOff,
        monsterId: preDraw ? preDraw.monsterId : null, preDraw: preDraw,
        why: (r.why != null ? String(r.why).slice(0, 160) : null),
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
      });
    } catch (e) { noteErr(store, 'drive.rec', e); }
    if (threw) throw threw;
    return result;
  });

  wrap('clearFeastBuff', (orig) => function () {
    let preDraw = null, preBuff = null;
    try { preDraw = snapDraw(Game); preBuff = snapBuff(Game); } catch (e) { noteErr(store, 'clear.pre', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      pushCapped(store, 'clears', {
        day: dayOf(Game), expired: (arguments.length > 0 ? !!arguments[0] : null),
        preDraw: preDraw, preBuff: preBuff,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
      });
    } catch (e) { noteErr(store, 'clear.rec', e); }
    if (threw) throw threw;
    return result;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._feastdrawDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._feastdrawDiagStore = store;
    Game._feastdrawDiagInstalled = true;
    Game._feastdrawDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withFeastdrawDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installFeastdrawDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._feastdraw = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

// analyzeFeastdraw(feastStore, nwkStore): pure over one seed's
// stores. nwkStore may be null (then fight joins are empty, never
// guessed). Returns grants/draws/decisions classified, draw
// outcomes, fight outcomes per faced draw, and the residuals:
// unmatched faces / driveoffs / feast-draw starts, and draws
// with a null wave. Classification precedence for a spawned
// draw's outcome (fixed in the evidence pre-registration):
// driven-off > faced-face > faced-harness > unmet-expired >
// unmet-other. A face/driveoff row matches a draw on
// (monsterId, grant day = draw.day) with ok true; a
// nonworldkill feast-draw start matches on (mid, feastDraw.day
// = draw.day). Grant-day matching (not fight-day matching) is
// what joins a draw to its fight: a dusk feast's draw can be
// faced the next day, but its feastDraw.day is the grant day.
function analyzeFeastdraw(feastStore, nwkStore) {
  const fs = feastStore || {};
  const grants = fs.grants || [];
  const draws = fs.draws || [];
  const faces = fs.faces || [];
  const driveoffs = fs.driveoffs || [];
  const clears = fs.clears || [];
  let nwk = null;
  try {
    const mod = require('./nonworldkill-diag');
    if (nwkStore) nwk = mod.analyzeNonworldkill(nwkStore);
  } catch (e) { nwk = null; }
  const fresh = grants.filter(g => g.granted && !g.refreshed);
  const refreshed = grants.filter(g => g.granted && g.refreshed);
  const refused = grants.filter(g => !g.granted);
  const spawned = draws.filter(d => d.drawn);
  const notSpawned = draws.filter(d => !d.drawn);
  const notSpawnedByWhy = {};
  for (const d of notSpawned) {
    const k = d.why || 'unknown';
    notSpawnedByWhy[k] = (notSpawnedByWhy[k] || 0) + 1;
  }
  const nullWaveDraws = spawned.filter(d => d.wave == null);
  // Index decisions and starts by monsterId + grant day.
  const faceByKey = {}, driveByKey = {};
  for (const f of faces) {
    if (!f.ok || !f.preDraw) continue;
    const k = f.preDraw.monsterId + '|' + f.preDraw.day;
    (faceByKey[k] = faceByKey[k] || []).push(f);
  }
  for (const o of driveoffs) {
    if (!o.ok || !o.preDraw) continue;
    const k = o.preDraw.monsterId + '|' + o.preDraw.day;
    (driveByKey[k] = driveByKey[k] || []).push(o);
  }
  const feastStarts = [];
  var endByFightId = {};
  if (nwkStore) {
    // Rebuild feast-draw starts from the raw store (analyzer output
    // does not carry start rows): classify each start directly.
    const mod = require('./nonworldkill-diag');
    const starts = (nwkStore && nwkStore.starts) || [];
    const ends = (nwkStore && nwkStore.ends) || [];
    for (const s of starts) {
      const cls = mod.classifyStart(s);
      if (!cls.excluded && cls.door === 'feast-draw') feastStarts.push({ start: s, cls: cls });
    }
    for (const e of ends) { if (e.fightId) endByFightId[e.fightId] = e; }
  }
  const startByKey = {};
  for (const fsr of feastStarts) {
    const s = fsr.start;
    if (s.feastDraw && s.feastDraw.monsterId) {
      const k = s.feastDraw.monsterId + '|' + s.feastDraw.day;
      (startByKey[k] = startByKey[k] || []).push(fsr);
    }
  }
  const drawOutcomes = [];
  for (const d of spawned) {
    const k = d.monsterId + '|' + d.day;
    let outcome = null, faceRow = null, driveRow = null, startRow = null;
    if (driveByKey[k] && driveByKey[k].length) { outcome = 'driven-off'; driveRow = driveByKey[k][0]; }
    else if (faceByKey[k] && faceByKey[k].length) { outcome = 'faced-face'; faceRow = faceByKey[k][0]; }
    else if (startByKey[k] && startByKey[k].length) { outcome = 'faced-harness'; startRow = startByKey[k][0]; }
    else {
      const cl = clears.find(c => c.preDraw && c.preDraw.monsterId === d.monsterId && c.preDraw.day === d.day);
      if (cl) outcome = 'unmet-expired';
      else outcome = 'unmet-other';
    }
    // Fight join: the start row for this draw (face path: the
    // start's feastDraw matches; harness path: same row).
    let fight = null;
    const cands = startByKey[k] || [];
    if (faceRow && cands.length) {
      // Prefer the start whose day is >= the face day and closest
      // after it; fall back to the first candidate.
      const after = cands.filter(c => c.start.day >= faceRow.day).sort((a, b) => a.start.day - b.start.day);
      fight = (after[0] || cands[0]);
    } else if (cands.length) fight = cands[0];
    let endRow = null, kills = [], wave4Kills = [];
    if (fight && fight.start.fightId && typeof endByFightId !== 'undefined' && endByFightId) {
      endRow = endByFightId[fight.start.fightId] || null;
      if (endRow) {
        kills = endRow.newLog || [];
        wave4Kills = kills.filter(x => (x.w | 0) === 4);
      }
    }
    drawOutcomes.push({
      day: d.day, monsterId: d.monsterId, wave: d.wave, veteran: d.veteran,
      grantIdx: d.grantIdx, outcome: outcome,
      faceDay: faceRow ? faceRow.day : null, driveDay: driveRow ? driveRow.day : null,
      startDay: fight ? fight.start.day : null,
      startArg: fight ? fight.start.arg : null, startMid: fight ? fight.start.mid : null,
      fightId: fight ? fight.start.fightId : null,
      endResult: endRow ? endRow.result : null,
      kills: kills, wave4Kills: wave4Kills,
      killCount: kills.length, hasKill: kills.length > 0,
    });
  }
  const faced = drawOutcomes.filter(o => o.outcome === 'faced-face' || o.outcome === 'faced-harness');
  const facedWithFight = faced.filter(o => o.fightId);
  const facedWithKill = faced.filter(o => o.hasKill);
  const waveDist = {}, wave4Draws = [];
  for (const d of spawned) {
    const wk = 'w' + (d.wave == null ? 'null' : d.wave);
    waveDist[wk] = (waveDist[wk] || 0) + 1;
    if ((d.wave | 0) === 4) wave4Draws.push(d);
  }
  const wave4KillsAll = [];
  for (const o of drawOutcomes) for (const k of o.wave4Kills) wave4KillsAll.push(Object.assign({ drawDay: o.day, drawMonster: o.monsterId, outcome: o.outcome }, k));
  // Residuals: faces / driveoffs / feast-draw starts matching NO
  // spawned draw, and draws with null wave. Any of these > 0
  // breaks leg (a) — they are counted, never hidden.
  const spawnedKeys = new Set(spawned.map(d => d.monsterId + '|' + d.day));
  const unmatchedFaces = faces.filter(f => f.ok && f.preDraw && !spawnedKeys.has(f.preDraw.monsterId + '|' + f.preDraw.day));
  const unmatchedDriveoffs = driveoffs.filter(o => o.ok && o.preDraw && !spawnedKeys.has(o.preDraw.monsterId + '|' + o.preDraw.day));
  const unmatchedStarts = feastStarts.filter(fsr => {
    const s = fsr.start;
    if (!s.feastDraw || !s.feastDraw.monsterId) return true;
    return !spawnedKeys.has(s.feastDraw.monsterId + '|' + s.feastDraw.day);
  });
  const unclassified = unmatchedFaces.length + unmatchedDriveoffs.length + unmatchedStarts.length + nullWaveDraws.length;
  return {
    grants: grants.length, fresh: fresh.length, refreshed: refreshed.length, refused: refused.length,
    draws: draws.length, spawned: spawned.length, notSpawned: notSpawned.length, notSpawnedByWhy: notSpawnedByWhy,
    drawsPerFreshGrant: fresh.length ? spawned.length / fresh.length : null,
    nullWaveDraws: nullWaveDraws.map(d => ({ day: d.day, monsterId: d.monsterId })),
    drawOutcomes: drawOutcomes,
    outcomes: drawOutcomes.reduce((m, o) => { m[o.outcome] = (m[o.outcome] || 0) + 1; return m; }, {}),
    faced: faced.length, facedFace: drawOutcomes.filter(o => o.outcome === 'faced-face').length,
    facedHarness: drawOutcomes.filter(o => o.outcome === 'faced-harness').length,
    drivenOff: drawOutcomes.filter(o => o.outcome === 'driven-off').length,
    unmet: drawOutcomes.filter(o => o.outcome.indexOf('unmet') === 0).length,
    facedRate: spawned.length ? faced.length / spawned.length : null,
    facedWithFight: facedWithFight.length, facedWithKill: facedWithKill.length,
    killRate: faced.length ? facedWithKill.length / faced.length : null,
    totalKills: drawOutcomes.reduce((t, o) => t + o.killCount, 0),
    wave4Draws: wave4Draws.length, wave4Kills: wave4KillsAll.length, wave4KillsAll: wave4KillsAll,
    veteransPerDraw: spawned.length ? wave4KillsAll.length / spawned.length : null,
    castVeteranDraws: spawned.filter(d => d.veteran).length,
    waveDist: waveDist,
    unmatchedFaces: unmatchedFaces.map(f => ({ day: f.day, monsterId: f.monsterId, preDraw: f.preDraw })),
    unmatchedDriveoffs: unmatchedDriveoffs.map(o => ({ day: o.day, monsterId: o.monsterId, preDraw: o.preDraw })),
    unmatchedStarts: unmatchedStarts.map(fsr => ({ day: fsr.start.day, arg: fsr.start.arg, mid: fsr.start.mid, feastDraw: fsr.start.feastDraw })),
    unclassified: unclassified,
    feastStarts: feastStarts.length,
  };
}

module.exports = { layerOn, newStore, installFeastdrawDiag, withFeastdrawDiag, analyzeFeastdraw, MAX_EVENTS };
