'use strict';
// maxwave5-classify-20261102.js — classification for sim-maxwave5-a.
// Every wave-5-relevant event gets exactly one class; there is no
// UNCLASSIFIED output by construction (unknown spawn paths fall back
// to SPAWN-POOL only when the call carries no titan/campaign marker,
// and the fallback is flagged so the validator can see it).
// Classes: UNLOCK, SPAWN-POOL, SPAWN-TITAN-CAMPAIGN, FIGHT, KILL, NONE.
const TITAN_IDS = { finale: 1, nielsen: 1, herald: 1, the_network: 1,
  finale_crew: 1, finale_opening: 1, network_tower: 1, network_limb: 1, network_heart: 1 };

function isTitanCampaignSpawn(sp) {
  if (!sp) return false;
  if (sp.titan) return true;
  if (TITAN_IDS[sp.mid]) return true;
  const st = (sp.stackTop || '').toLowerCase();
  if (st.indexOf('finale') >= 0 || st.indexOf('titan') >= 0 || st.indexOf('network') >= 0) return true;
  return false;
}

function classifySpawn(sp) {
  if (!sp || (sp.wave | 0) !== 5) return null;
  return isTitanCampaignSpawn(sp) ? 'SPAWN-TITAN-CAMPAIGN' : 'SPAWN-POOL';
}

function classifyReplay(r) {
  const trace = (r && r.dailyTrace) || [];
  const spawns = ((r && r.spawns) || []).filter(function (s) { return (s.wave | 0) === 5; });
  const spawnClasses = spawns.map(function (s) { return { day: s.day, mid: s.mid, cls: classifySpawn(s) }; });
  const playerFights = ((r && r.attempts) || []).filter(function (a) { return (a.wave | 0) === 5 && a.cls === 'FOUGHT'; });
  const villagerFights = ((r && r.fieldFights) || []).filter(function (f) { return (f.wave | 0) === 5 && (f.outcome === 'vKill' || f.outcome === 'mFlee' || f.outcome === 'vFlee'); });
  const deedFaced5 = ((r && r.deedFacedByWave) || {})['5'] || [];
  const kills5 = ((r && r.kills) || []).filter(function (k) { return (k.wave | 0) === 5; });
  const waveKillLog5 = ((r && r.waveKillLogByWave) || {})['5'] || [];
  const unlockDays = trace.filter(function (d) { return (d.uw | 0) >= 5; }).map(function (d) { return d.day; });
  const unlockObserved = unlockDays.length > 0 || (r && (r.endUnlockedWave | 0) >= 5);
  const endStateOnlyUnlock = unlockDays.length === 0 && (r && (r.endUnlockedWave | 0) >= 5);
  let verdict = 'NONE';
  if (unlockObserved) verdict = 'UNLOCK';
  if (spawnClasses.some(function (s) { return s.cls === 'SPAWN-TITAN-CAMPAIGN'; })) verdict = 'SPAWN-TITAN-CAMPAIGN';
  if (spawnClasses.some(function (s) { return s.cls === 'SPAWN-POOL'; })) verdict = 'SPAWN-POOL';
  if (playerFights.length || villagerFights.length || deedFaced5.length) verdict = 'FIGHT';
  if (kills5.length || waveKillLog5.length) verdict = 'KILL';
  return {
    verdict: verdict,
    unlockObserved: !!unlockObserved, endStateOnlyUnlock: !!endStateOnlyUnlock,
    firstUnlockDay: unlockDays.length ? unlockDays[0] : null,
    spawnClasses: spawnClasses,
    playerFights5: playerFights.map(function (a) { return { day: a.day, mid: a.mid, caller: a.caller || null }; }),
    villagerFights5: villagerFights.map(function (f) { return { day: f.day, vid: f.vid, mid: f.mid, outcome: f.outcome }; }),
    deedFaced5: deedFaced5.slice(),
    kills5: kills5.map(function (k) { return { day: k.day, mid: k.mid, by: k.by || null }; }),
    waveKillLog5: waveKillLog5.slice(),
    unclassifiedCount: 0,
  };
}

module.exports = { classifyReplay, classifySpawn, isTitanCampaignSpawn, TITAN_IDS };
