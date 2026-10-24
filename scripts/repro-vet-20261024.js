// repro-vet-20261024.js — r46 follow-up: WHY did committed wave-4 fights
// not produce living veterans? Re-runs ONE seed (env SEED, default 88012)
// with the exact r46 waves composition (capable+deedhunt+vetcommit) and
// records per-committed-fight outcomes + the raw waveKillLog + killer fates.
// Deterministic (DET-proven): the re-run reproduces the sweep trajectory.
// Usage: SEED=88012 VETCOMMIT=1 node scripts/repro-vet-20261024.js
'use strict';
process.env.VETCOMMIT = '1';
delete process.env.CAPABLE_RELAYROAD;
const fs = require('fs');
const DS = require('./policies/deed-seeking');
const CAP = require('./policies/capable');
const VC = require('./policies/vetcommit');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const seed = parseInt(process.env.SEED || '88012', 10);
const days = parseInt(process.env.DAYS || '180', 10);

function capableDeedHunt() {
  const p = Object.assign({}, CAP.capable);
  const oDaily = p.daily.bind(p);
  p.id = 'capable-deedhunt';
  p.daily = (G, c) => { oDaily(G, c); DS.deedPatrol(G, c); DS.surgeUpkeep(G, c); };
  return p;
}
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }

(async () => {
  const { Game } = await loadGame({ seed, mode: 'endgame-r40', fullTelemetry: true });
  await setupGame(Game);
  const base = VC.withVetCommit(capableDeedHunt(), 'capabledeedhunt+vetcommit', 'repro');
  let ctxRef = null;
  const oDaily = base.daily.bind(base);
  base.daily = (G, c) => { ctxRef = c; return oDaily(G, c); };
  // Fight-outcome recorder: wraps OUTSIDE vetcommit (sees the flags it set).
  const oFight = base.fight.bind(base);
  const fights = [];
  let cur = null;
  const killLogLen = () => (((Game.state || {}).waveKillLog || []).length);
  const scholarAlive = () => { try { const s = (Game.state || {}).scholar || {}; return !s.dead && !Game.over; } catch (e) { return false; } };
  base.fight = (G, c) => {
    const f = G.tbfight;
    const committed = !!(c._w5Commit || c._huntCommit);
    if (f && !f.over && committed && !cur) {
      const mons = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0);
      cur = {
        day: ((G.state || {}).scholar || {}).day || 0,
        waves: mons.map(m => beastWaveOf(G, beastMidOf(m))),
        mids: mons.map(m => beastMidOf(m)),
        killsBefore: killLogLen(),
        turns: 0,
      };
    }
    if (cur) cur.turns++;
    const r = oFight(G, c);
    const f2 = G.tbfight;
    if (cur && (!f2 || f2.over)) {
      const killsAfter = killLogLen();
      const newKills = ((Game.state || {}).waveKillLog || []).slice(cur.killsBefore);
      cur.killsAfter = killsAfter;
      cur.newKills = newKills;
      cur.endedScholarAlive = scholarAlive();
      cur.endedGameOver = !!Game.over;
      fights.push(cur);
      cur = null;
    }
    return r;
  };
  await quietLog(async () => { await runDays(Game, base, { days, manifest: undefined, sampleEvery: 1 }); });
  // Raw waveKillLog + killer fates.
  const log = (Game.state || {}).waveKillLog || [];
  const roster = ((Game.state || {}).village || {}).roster || [];
  const fates = {};
  for (const id of roster) {
    try { const p = Game.getPerson ? Game.getPerson(id) : null; fates[id] = p ? { name: p.name || p.displayName, dead: !!p.dead } : null; } catch (e) { fates[id] = 'err'; }
  }
  let rd5 = null;
  try { rd5 = Game.waveUnlockReady ? Game.waveUnlockReady(5) : null; } catch (e) {}
  // Killer-fate forensics: where is gen_5gttbp5 (88012's eater killer) now?
  let killerForensics = null;
  try {
    const sch = (Game.state || {}).scholar || {};
    const vil = (Game.state || {}).village || {};
    const fallen = vil.fallen || vil.dead || null;
    let fallenHas = null;
    try { fallenHas = fallen ? JSON.stringify(fallen).indexOf('gen_5gttbp5') >= 0 : null; } catch (e) {}
    killerForensics = {
      scholarVillagerId: sch.villagerId || null,
      scholarDead: !!sch.dead,
      fallenHasKiller: fallenHas,
      fallen: fallen || null,
    };
  } catch (e) { killerForensics = { error: String(e && e.message) }; }
  const out = {
    seed, gameDays: ((Game.state || {}).scholar || {}).day || 0,
    killerForensics,
    won: !!Game.won, over: !!Game.over,
    unlockedWave: (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null,
    rd5, vetFights: (ctxRef || {}).vetFights | 0,
    committedFights: fights.map(f => ({
      day: f.day, waves: f.waves, mids: f.mids, turns: f.turns,
      newKills: f.newKills, scholarAlive: f.endedScholarAlive, gameOver: f.endedGameOver,
    })),
    waveKillLog: log,
    rosterFates: fates,
  };
  console.log(JSON.stringify(out, null, 1));
})();
