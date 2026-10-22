#!/usr/bin/env node
// diag-warloot-window-20261022.js — targeted diagnostic: does war-loot ever
// fire? Replays the DIAG's blocked-window seed (s65477/leadfeast) on the
// drive tree and logs gate-live state at every wave-4+ kill.
// Usage: <substrate env> node scripts/diag-warloot-window-20261022.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

(async function main() {
  const policy = AD.armedFor(AD.normBase('lead'));
  const { Game } = await loadGame({ seed: 65477, mode: 'warloot-diag', fullTelemetry: false });

  const kills = [];
  const oVkl = Game.villagerKillLoot.bind(Game);
  Game.villagerKillLoot = function (vid, mdef) {
    const gate = Game.armorDriveLive ? Game.armorDriveLive() : 'NOFN';
    const r = oVkl(vid, mdef);
    if (((mdef || {}).wave | 0) >= 4) {
      kills.push({ day: (Game.state.scholar || {}).day, wave: mdef.wave, gate, ret: r });
    }
    return r;
  };
  const tbk = Game.tbKillRewards.bind(Game);
  Game.tbKillRewards = function (_kills) {
    const gate = Game.armorDriveLive ? Game.armorDriveLive() : 'NOFN';
    for (const k of (_kills || [])) {
      if ((((k || {}).mdef || {}).wave | 0) >= 4) {
        kills.push({ day: (Game.state.scholar || {}).day, wave: k.mdef.wave, gate, via: 'tb', ret: null });
      }
    }
    return tbk(_kills);
  };

  const census = [];
  const oSleep = Game.sleep.bind(Game);
  Game.sleep = function (...a) {
    try {
      const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
      census.push({ day: (Game.state.scholar || {}).day || 0,
        vets: r ? r.veterans : null, arm: r ? r.armored : null,
        ready: r ? r.ready : null, short: r ? (r.short || []).join(',') : null,
        gate: Game.armorDriveLive ? Game.armorDriveLive() : null });
    } catch (e) {}
    return oSleep(...a);
  };

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });

  console.log('days=' + ((Game.state.scholar || {}).day || 0), 'end=' + result.endReason, 'maxWave=' + (result.maxWaveUnlocked || 1));
  const gateDays = census.filter(c => c.gate);
  console.log('gate-live days: ' + gateDays.length + (gateDays.length ? ' (' + gateDays[0].day + '-' + gateDays[gateDays.length - 1].day + ')' : ''));
  const winDays = census.filter(c => (c.vets | 0) >= 2);
  console.log('vets>=2 days: ' + winDays.length);
  const blocked = census.filter(c => (c.vets | 0) >= 2 && !c.ready);
  console.log('blocked-window days (vets>=2, !ready): ' + blocked.length);
  if (blocked.length) {
    console.log('  first: day ' + blocked[0].day + ' short=[' + blocked[0].short + '] arm=' + blocked[0].arm);
    console.log('  last:  day ' + blocked[blocked.length - 1].day + ' short=[' + blocked[blocked.length - 1].short + '] arm=' + blocked[blocked.length - 1].arm);
  }
  const kGate = kills.filter(k => k.gate === true);
  console.log('wave-4+ kills: ' + kills.length + ', with gate live: ' + kGate.length);
  for (const k of kGate.slice(0, 10)) console.log('  kill d' + k.day + ' wave' + k.wave + ' ret=' + k.ret);
  const warRet = kills.filter(k => k.ret && /stormcloak|shelter_cloak|wardens|witness|skull_helm|leather_jacket|commanders|bloodplate|conquerors|lifebound|second_skin|adaptive|swat_vest|riot_gear|military_vest/.test(k.ret));
  console.log('kills returning war-armor: ' + warRet.length);
})().catch(e => { console.error('DIAG CRASH:', e); process.exit(2); });
