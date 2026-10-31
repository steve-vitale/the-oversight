// vet2-diag — the veterans-trajectory recorder (sim-vet2-a, 2026-10-31,
// flesh-out loop, axis scale-onramp).
//
// THE QUESTION (backlog "WAVE-5 WALL, MEASURED" from sim-wavegate-a):
// wavegate found 0/19 wave-5 unlocks; end blockers on its 10 national
// wave-4 seeds were DEFER5 6/10 (veterans 0-1 vs demand 2) and W4-FACED
// 3/10. Is veterans-2 reachable at all on this stack, or is wave 5 a
// post-win curiosity? Endpoints cannot answer that — trajectories can:
// when a village holds 2 living wave-4+ killers, how long it lasts,
// what kills it (veteran deaths), and whether a replacement ever
// reaches veteran status before the win/table day censors the road.
//
// This layer wraps OUTSIDE wavegate-diag (compose upon: tribfloor,
// windefer, seatdrive, fullseat-diag, wavegate-diag — never edit those).
//
// PURE-READ instrument (VET2=1; unset delegates to the wrapped policy
// byte-identically): every daily, AFTER delegating inward, it snapshots
// (a) the scholar vid (Game.villagerId + state.scholar.villagerId),
// (b) the living vet4 set (distinct waveKillLog by with a wave-3+ kill
// so far AND living at this daily — scholar always living, others
// vpOf(vid) && !dead, exactly the standing.js isLiving rule), (c) the
// living vet5 set (wave-4+ kills, same living rule), (d) a vid->name map
// for current vets + scholar (getPerson reads in try/catch; vid slice
// on failure). It writes NOTHING to game state and draws NO RNG.
//
// Kill-time scholar/companion keying (sim-compchan correction,
// 2026-10-18) lives in the SWEEP, not here: the sweep wraps
// Game.recordWaveKill and records scholarVidAtCall per kill. This
// layer's daily scholar-vid series is the killtime-method cross-check
// for that exact capture (analyzer joins each log entry's day against
// the latest daily scholar vid <= that day).
'use strict';

function layerOn() { return process.env.VET2 === '1'; }

function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function scholarVidOf(Game) { try { return Game.villagerId || null; } catch (e) { return null; } }
function scholarStateVidOf(Game) { try { return ((Game.state || {}).scholar || {}).villagerId || null; } catch (e) { return null; } }

function isLiving(Game, vid, scholarVid) {
  if (vid === scholarVid) return true;
  try {
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
    return !!(vp && !vp.dead);
  } catch (e) { return false; }
}

function nameOf(Game, vid) {
  try {
    const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  try {
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
    if (vp && vp.name) return String(vp.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

// livingVetSets(Game, log): distinct killers by wave threshold, living now.
// log defaults to Game.state.waveKillLog. Returns { vet4: [vids], vet5: [vids] }
// sorted for stable output.
function livingVetSets(Game, log) {
  const scholarVid = scholarVidOf(Game);
  const entries = log || (((Game.state || {}).waveKillLog) || []);
  const v4 = new Set(), v5 = new Set();
  for (const e of entries) {
    if (!e || !e.by) continue;
    const w = (e.w | 0) || 0;
    if (w >= 3) v4.add(e.by);
    if (w >= 4) v5.add(e.by);
  }
  const living4 = [], living5 = [];
  for (const vid of v4) { if (isLiving(Game, vid, scholarVid)) living4.push(vid); }
  for (const vid of v5) { if (isLiving(Game, vid, scholarVid)) living5.push(vid); }
  living4.sort(); living5.sort();
  return { vet4: living4, vet5: living5 };
}

function snapVet2(Game) {
  const row = { day: dayOf(Game), errs: [] };
  try { row.scholarVid = scholarVidOf(Game); } catch (e) { row.scholarVid = null; row.errs.push('scholarVid'); }
  try { row.scholarStateVid = scholarStateVidOf(Game); } catch (e) { row.scholarStateVid = null; row.errs.push('scholarStateVid'); }
  if (row.scholarVid != null && row.scholarStateVid != null && row.scholarVid !== row.scholarStateVid) row.errs.push('scholarVidMismatch');
  try {
    const sets = livingVetSets(Game);
    row.vet4 = sets.vet4; row.vet5 = sets.vet5;
  } catch (e) { row.vet4 = []; row.vet5 = []; row.errs.push('vetSets'); }
  try {
    const names = {};
    const vids = new Set([row.scholarVid].concat(row.vet4 || [], row.vet5 || []).filter(Boolean));
    for (const vid of vids) names[vid] = nameOf(Game, vid);
    row.names = names;
  } catch (e) { row.names = {}; row.errs.push('names'); }
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    row.logLen = log.length;
  } catch (e) { row.logLen = -1; row.errs.push('logLen'); }
  return row;
}

function newStore() {
  return { rows: [], errs: 0, kills: [] };
}

function withVet2Diag(inner, id, desc) {
  const store = newStore();
  const wrapped = Object.assign({}, inner, {
    id, desc, vet2Store: store,
    daily(Game, ctx) {
      const r = inner.daily(Game, ctx);
      if (layerOn()) {
        try {
          const row = snapVet2(Game);
          store.rows.push(row);
          if (row.errs.length) store.errs += row.errs.length;
        } catch (e) { store.errs += 1; }
      }
      return r;
    },
  });
  return wrapped;
}

module.exports = {
  layerOn, withVet2Diag, snapVet2, livingVetSets, scholarVidOf,
  scholarStateVidOf, isLiving, nameOf, newStore,
};
