#!/usr/bin/env node
// probe-tricktag-20261016.js — child probe for the sim-tricktag arm.
// Drives ONE real TB fight in the harness and reports the waveKillLog
// attribution for the killing blow(s). Env: SEED, CASE =
//   companion — scholar performs the real shout trick (tbPlayerShout ->
//               checkMonsterCounter -> f.trickLogByMid), then a companion
//               villager fighter lands the killing blow(s) via tbDamage.
//   scholar   — the scholar lands the killing blow(s) ('you'/null convention).
//   monster   — killing blow(s) from an unresolvable sourceKey (defensive).
//   notrick   — companion kill(s), no trick performed (trick must stay null).
// TRICKTAG_OFF=1 selects the pre-fix behavior (the RED control).
//
// Determinism: the village roster is emptied before startCombat (mirrors
// scripts/godpath/lib.js fight({party:false})) so no auto-join companion
// steals the kill; the single injected companion is kept inert
// (stunned:99 — loses its turn cleanly) so the probe's tbDamage calls are
// the killing blows. Prints one JSON line to stdout. Never writes into
// the repo.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '951', 10) || 951;
const CASE = process.env.CASE || 'companion';

(async () => {
  const out = { seed: SEED, cas: CASE, tricktagOff: process.env.TRICKTAG_OFF === '1' ? 1 : 0 };
  try {
    const { Game } = await loadGame({ seed: SEED, mode: 'tricktag', fullTelemetry: false });
    await setupGame(Game);
    Game.state.waveKillLog = [];
    Game.state.waveKillByChannel = {};
    Game._attrKills = true;

    const scholarVid = Game.villagerId;
    out.scholarVid = scholarVid;
    // Real roster vid for the injected companion (resolved BEFORE emptying).
    const roster = ((Game.state.village || {}).roster) || [];
    const cvid = roster.find(id => id && id !== scholarVid) || 'v_testcomp';
    out.companionVid = cvid;

    // No auto-join: empty roster + move positions far (godpath lib pattern).
    Game.state.village.roster = [];
    const vpos = Game.state.village.positions || {};
    for (const k of Object.keys(vpos)) vpos[k] = { mx: 8, my: 8 };

    // Start a real TB fight vs hummice (pack species — exercises the
    // per-species trick log with multiple performances).
    const s = Game.state.scholar;
    s.mx = 2; s.my = 4;
    if (Game.ensureVillagerPositions) Game.ensureVillagerPositions();
    s.monster = { id: 'hummice', mx: 6, my: 4 };
    Game.startCombat('hummice');
    const f = Game.tbfight;
    if (!f) { out.__err = 'no tbfight after startCombat'; console.log(JSON.stringify(out)); return; }
    const pf = Game.tbFighter && Game.tbFighter('p');
    if (pf) { pf.mx = 2; pf.my = 4; }

    // Inject the companion fighter (inert: stunned loses the turn cleanly).
    const ckey = 'v_testcomp';
    f.fighters.push({
      key: ckey, kind: 'villager', villagerId: cvid, ai: 'brave',
      name: 'Test Companion', emoji: '🧍',
      hp: 100, maxHp: 100, speed: 5, mx: 6, my: 4,
      alive: true, fled: false, wbonus: 0, varmor: 0, stunned: 99,
    });

    const liveHummice = () => f.fighters.filter(x => x && x.kind === 'monster' &&
      x.alive && !x.fled && x.mdef && x.mdef.id === 'hummice');
    out.packSize = liveHummice().length;

    const talesBefore = ((Game.state.killerTales || []).filter(t => !t.told)).length;

    if (CASE === 'companion') {
      // The REAL shout verb — performs the hummice counter trick, which
      // checkMonsterCounter logs per species into f.trickLogByMid.
      out.shouted = !!Game.tbPlayerShout();
    }

    // The killing blow(s): companion / scholar / unresolvable source.
    const label = CASE === 'companion' || CASE === 'notrick' ? 'Test Companion'
      : CASE === 'scholar' ? 'you' : 'packmate';
    const skey = CASE === 'companion' || CASE === 'notrick' ? ckey
      : CASE === 'scholar' ? null : 'm_ghost';
    for (const m of liveHummice()) {
      Game.tbDamage(m.key, 9999, label, skey);
    }
    out.allDead = liveHummice().length === 0;

    // Resolve the expected attribution from the actual stamp on the first
    // dead hummice — mirrors the record-site logic exactly.
    const dead0 = f.fighters.find(x => x && x.kind === 'monster' && !x.alive && x.mdef && x.mdef.id === 'hummice');
    out.stampedAfter = (dead0 && dead0._tbKilledBy) || null;
    let expBy = scholarVid, expVia = 'player';
    if (out.stampedAfter && out.stampedAfter !== 'p') {
      const kf = (f.fighters || []).find(x => x && x.key === out.stampedAfter);
      if (kf && (kf.kind === 'villager' || kf.kind === 'ally') && kf.villagerId) {
        expBy = kf.villagerId; expVia = 'companion';
      }
    }
    out.expected = { by: expBy, via: expVia };
    out.trickLogByMid = f.trickLogByMid || null;
    try { Game.tbEnd('won'); } catch (e) { out.tbEndErr = String((e && e.message) || e).slice(0, 200); }

    const log = (Game.state.waveKillLog || []).filter(e => e && e.mid === 'hummice');
    out.entries = log.map(e => ({ by: e.by, via: e.via, trick: e.trick }));
    out.nLog = log.length;
    const talesAfter = ((Game.state.killerTales || []).filter(t => !t.told)).length;
    out.talesQueued = talesAfter - talesBefore;
    out.channelKeys = Object.keys(Game.state.waveKillByChannel || {}).sort();
  } catch (e) {
    out.__err = String((e && e.stack) || e).slice(0, 800);
  }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
