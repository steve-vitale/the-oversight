// vetbar-census-instrument-20261103.js — supplementary descriptive census
// for the veterans-bar autopsy (arm sim-vetbar-a). Answers the follow-up
// the kill instrument cannot: when wave-4 kills are ~zero, is it no
// spawns, no fights, or lost fights? Wraps spawnWorldMonster, startCombat
// (pre-call identity, w5faced lesson), tbEnd (pre-call fighter snapshot),
// fieldFight (post-call outcome), plus recordWaveKill for trajectory
// identity against the run-1 pilot files (same seeds/policy/horizon must
// reproduce the same kill rows, or the census is flagged divergent).
// All wraps are RNG-neutral (no Math.random use); the identity check is
// the proof of that claim, not an assumption.
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}

function install(Game) {
  const t = { spawns: [], starts: [], tbEnds: [], fields: [], killRows: [], daily: [], instrumentErrors: [], wrapCounts: {} };
  const orig = {};
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function wrap(name, fn) {
    if (typeof Game[name] !== 'function') { t.instrumentErrors.push(name + ': not a function, skipped'); return; }
    orig[name] = Game[name];
    Game[name] = fn;
  }
  wrap('spawnWorldMonster', function (mdef, tx, ty, opts) {
    count('spawnWorldMonster');
    const mon = orig.spawnWorldMonster.apply(this, arguments);
    try {
      const mid = mon ? mon.id : (typeof mdef === 'string' ? mdef : (mdef && mdef.id));
      const w = mon ? (mon.wave || waveOf(Game, mid)) : waveOf(Game, mid);
      if (w === 4) t.spawns.push({ day: dayOf(Game), id: mid, tx: tx, ty: ty });
    } catch (e) { t.instrumentErrors.push('spawn: ' + String(e.message).slice(0, 80)); }
    return mon;
  });
  wrap('startCombat', function (mid) {
    count('startCombat');
    try {
      let worldId = null, pendingId = null;
      try { const s = Game.state.scholar || {}; if (s.monster) worldId = s.monster.id || null; } catch (e) {}
      try { pendingId = Game.pendingMonsterId || null; } catch (e) {}
      const effId = mid || pendingId || worldId || null;
      if (effId && waveOf(Game, effId) === 4) t.starts.push({ day: dayOf(Game), id: effId, pending: !!Game.pendingEncounter, world: worldId });
    } catch (e) { t.instrumentErrors.push('start: ' + String(e.message).slice(0, 80)); }
    return orig.startCombat.apply(this, arguments);
  });
  wrap('tbEnd', function (result) {
    count('tbEnd');
    try {
      const f = Game.tbfight || {};
      const mons = [];
      for (const x of (f.fighters || [])) {
        if (!x || x.kind !== 'monster') continue;
        const fid = ((x.mdef || {}).id || x.monsterId || x.id) || null;
        if (fid && waveOf(Game, fid) === 4) mons.push({ id: fid, alive: !!x.alive, hp: (x.hp != null ? x.hp : null) });
      }
      if (mons.length) t.tbEnds.push({ day: dayOf(Game), result: result, monsters: mons });
    } catch (e) { t.instrumentErrors.push('tbEnd: ' + String(e.message).slice(0, 80)); }
    return orig.tbEnd.apply(this, arguments);
  });
  wrap('fieldFight', function (vid, mdef, m, opts) {
    count('fieldFight');
    const rec = orig.fieldFight.apply(this, arguments);
    try {
      const mid = (mdef && mdef.id) || (typeof mdef === 'string' ? mdef : null) || (m && m.id) || null;
      if (mid && waveOf(Game, mid) === 4) t.fields.push({ day: dayOf(Game), id: mid, vid: vid, outcome: rec ? rec.outcome : null });
    } catch (e) { t.instrumentErrors.push('field: ' + String(e.message).slice(0, 80)); }
    return rec;
  });
  wrap('recordWaveKill', function (monsterId, killerVid, via, detail) {
    count('recordWaveKill');
    const r = orig.recordWaveKill.apply(this, arguments);
    try {
      if (waveOf(Game, monsterId) === 4) t.killRows.push({ day: dayOf(Game), mid: monsterId, by: killerVid == null ? null : killerVid, via: via || 'unknown' });
    } catch (e) { t.instrumentErrors.push('kill: ' + String(e.message).slice(0, 80)); }
    return r;
  });
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.unlocked = null; }
    try {
      const ds = Game.deedState ? Game.deedState() : null;
      const faced = (ds && ds.wavesFaced) || {};
      snap.facedW4 = Object.keys(faced).filter(function (mid) { return (faced[mid] | 0) === 4; });
    } catch (e) { snap.facedW4 = null; }
    t.daily.push(snap);
    return snap;
  }
  function uninstall() { Object.keys(orig).forEach(function (n) { Game[n] = orig[n]; }); }
  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf };
