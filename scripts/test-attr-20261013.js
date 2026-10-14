#!/usr/bin/env node
// test-attr-20261013.js — KILL ATTRIBUTION proof (2026-10-13).
//
// Instrumentation only: recordWaveKill gains an optional `via` channel tag
// ('patrol'|'wild'|'aid-crisis'|'contest'|'agency'|'player'|'unknown') and
// trick executions inside fieldFight() are tallied per run
// (Game._trickTally). Zero behavior change.
//
// (a) EFFECT: scripted field fights with known tricks -> the rec carries
//     trick flags + intent fields, and Game._trickTally records the
//     execution (shout cap respected, food actually spent, spool waits).
// (b) EFFECT: recordWaveKill(..., via) records the channel on the per-kill
//     log; omitted via -> 'unknown' (default preserves behavior exactly).
// (c) HONESTY CONTROL: seeded 10-day sim with Game._attrKills=false vs true
//     -> byte-identical Game.state (minus the attr keys) and identical
//     fight outcomes. Instrumentation touches no RNG, no logic, no saves.
//
// RED on master-without-this-change: (a) no _trickTally after a trick fight,
// (b) no waveKillLog after recordWaveKill. GREEN here.
// Run: node scripts/test-attr-20261013.js   (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '20261013', 10);
Math.random = mulberry32(SEED);

// ---------- boot the full engine (index.html order, DOM-only excluded) ----------
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"]*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window;
const Game = globalThis.Scattering.Game;
function freshRng(seed) { return mulberry32(seed); }

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};

  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  const vid = 'test_attr_fighter';
  Game.data.villagers = Game.data.villagers || [];
  if (!Game.data.villagers.find(v => v.id === vid)) {
    Game.data.villagers.push({ id: vid, name: 'Attr Fighter', items: [{ itemId: 'protein_bar', units: 3, kcalEach: 250, name: 'protein bar' }] });
  }
  Game.state.village = Game.state.village || {};
  Game.state.village.health = Game.state.village.health || {};
  const foodUnits = () => {
    const vp = Game.data.villagers.find(v => v.id === vid);
    const it = (vp.items || []).find(i => (i.itemId || i.id) === 'protein_bar');
    return it ? (it.units || 0) : 0;
  };

  // ============ (a) trick execution is observable ============
  console.log('\n[a] trick execution observable on rec + tally');
  {
    Game._attrKills = true;
    Game._trickTally = {};
    // teach belltoad (shout) via the non-lethal path
    Game.state.monsterCounters = Game.state.monsterCounters || {};
    delete Game.state.monsterCounters['belltoad'];
    Game.state.villageCounterObs = {};
    Game.noteVillagerTrickObservation(vid, 'belltoad');
    Game.noteVillagerTrickObservation(vid, 'belltoad');
    ok(Game.villageKnowsTrick('belltoad'), 'setup: belltoad trick known');

    Game.state.village.health[vid] = 200;
    const rec = Game.fieldFight(vid, mdef('belltoad'), null, { rng: freshRng(SEED + 1) });
    ok(rec && rec.outcome, 'fight resolved, outcome=' + (rec && rec.outcome));
    ok((rec.trickShouts || 0) >= 1, 'rec.trickShouts records the shout execution');
    ok((rec.trickShouts || 0) <= 2, 'shout cap respected (<=2/fight)');
    ok((Game._trickTally.shout || 0) >= 1, 'Game._trickTally.shout counted');
    ok(typeof rec.intent === 'string' && rec.intent.length > 0, 'rec.intent present (' + rec.intent + ')');
    ok(typeof rec.intentWhy === 'string' && rec.intentWhy.length > 0, 'rec.intentWhy present (' + rec.intentWhy + ')');

    // offer_food: raccoon, fighter holds food
    Game.state.monsterCounters['lockpick_raccoon'] = true;
    const before = foodUnits();
    Game.state.village.health[vid] = 200;
    Game.fieldFight(vid, mdef('lockpick_raccoon'), null, { rng: freshRng(SEED + 2) });
    ok((Game._trickTally['offer_food'] || 0) >= 1, 'offer_food tallied');
    ok(foodUnits() === before - 1, 'exactly 1 food unit spent (' + before + ' -> ' + foodUnits() + ')');

    // spool feed-waits (wave-3 signature)
    Game.state.villagerTricks = Game.state.villagerTricks || {};
    Game.state.villagerTricks['spool'] = true;
    Game.state.village.health[vid] = 200;
    Game.fieldFight(vid, mdef('spool'), null, { rng: freshRng(SEED + 3) });
    ok((Game._trickTally['wait:spool-record'] || 0) >= 1, 'spool feed-waits tallied');
  }

  // ============ (b) via-tagging ============
  console.log('\n[b] recordWaveKill via channel tag');
  {
    Game._attrKills = true;
    Game.state.waveKillLog = [];
    Game.state.waveKillByChannel = {};
    const n0 = (Game.state.waveKills || {})[1] || 0;
    Game.recordWaveKill('belltoad', 'vid1', 'patrol');
    const log = Game.state.waveKillLog;
    const last = log[log.length - 1];
    ok(last && last.via === 'patrol' && last.by === 'vid1' && last.mid === 'belltoad' && last.w === 1,
      'tagged kill logged with channel/killer/id/wave');
    ok(typeof last.d === 'number', 'kill log carries the day');
    ok(Game.state.waveKillByChannel['patrol.w1'] === 1, 'per-channel aggregate patrol.w1 = 1');
    // default: omitted via -> 'unknown', existing behavior preserved
    Game.recordWaveKill('belltoad', 'vid2');
    const last2 = Game.state.waveKillLog[Game.state.waveKillLog.length - 1];
    ok(last2.via === 'unknown', "omitted via defaults to 'unknown'");
    ok(((Game.state.waveKills || {})[1] || 0) === n0 + 2, 'ledger counting unchanged (2 kills added)');
    ok(Game.state.waveKillByChannel['unknown.w1'] === 1, 'unknown channel aggregated');
    // trick detail: a kill from a fight that executed tricks links them
    ok(typeof Game.trickSummary === 'function', 'Game.trickSummary exists');
    ok(Game.trickSummary(null) === null, 'trickSummary(null) -> null');
    ok(Game.trickSummary({}) === null, 'trickSummary of a trickless rec -> null');
    ok(Game.trickSummary({ trickShouts: 2 }) === 'shoutx2', "trickSummary({trickShouts:2}) -> 'shoutx2'");
    ok(Game.trickSummary({ trickLog: ['wait:spool-record', 'shout'] }) === 'wait:spool-record,shout',
      'trickSummary prefers rec.trickLog (covers wait/food tricks the flags miss)');
  }

  // ============ (c) honesty control: seeded 10-day sim, logging off vs on ============
  // Follows the telemetry worker's CONTROL D pattern: compare game-meaningful
  // outcomes (not raw state — wall-clock timestamps/session IDs are
  // nondeterministic by design across ANY two runs). Identical outcomes =>
  // the instrumentation touches no RNG, no logic, no saves.
  // NOTE: the fight seed is self-calibrating — a throwaway run finds the
  // first seed that fires the shout in this process's RNG context, then both
  // measured runs use it for exactly one fight each.
  console.log('\n[c] honesty control (logging off vs on)');
  {
    const { loadGame, setupGame, runDays } = require('./sim-harness');
    async function bootSim() {
      const g = await loadGame({ seed: 4242 });
      const Gm = g.Game;
      await setupGame(Gm);
      Gm.say = () => {};
      await runDays(Gm, {}, { days: 10 });
      Gm.state.villageCounterObs = {};
      Gm.state.monsterCounters = Gm.state.monsterCounters || {};
      const tv = 'honesty_fighter';
      Gm.data.villagers = Gm.data.villagers || [];
      if (!Gm.data.villagers.find(v => v.id === tv)) Gm.data.villagers.push({ id: tv, name: 'H', items: [] });
      Gm.state.village = Gm.state.village || {}; Gm.state.village.health = Gm.state.village.health || {};
      const bd = (Gm.data.monsters || []).find(m => m.id === 'belltoad');
      Gm.noteVillagerTrickObservation(tv, 'belltoad');
      Gm.noteVillagerTrickObservation(tv, 'belltoad');
      return { Gm, tv, bd };
    }
    // calibrate: first seed in 780..810 that fires the shout (throwaway Game)
    let fightSeed = null;
    {
      const { Gm, tv, bd } = await bootSim();
      for (let s = 780; s < 812; s++) {
        Gm.state.village.health[tv] = 200;
        const r = Gm.fieldFight(tv, bd, null, { rng: mulberry32(s) });
        if ((r.trickShouts || 0) >= 1) { fightSeed = s; break; }
      }
      ok(fightSeed != null, 'calibration: a seed fires the shout (seed ' + fightSeed + ')');
    }
    async function runOnce(attrOn) {
      const { Gm, tv, bd } = await bootSim();
      Gm._attrKills = attrOn;
      Gm.state.village.health[tv] = 200;
      const rec = Gm.fieldFight(tv, bd, null, { rng: mulberry32(fightSeed) });
      Gm.recordWaveKill('belltoad', tv, 'patrol');
      let pantry = 0;
      try {
        pantry = ((Gm.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
      } catch (e) {}
      return {
        fightOutcome: rec.outcome, trickShouts: rec.trickShouts || 0,
        pantry: Math.round(pantry),
        pop: ((Gm.state.village || {}).roster || []).length,
        waveKills: JSON.stringify((Gm.state.waveKills || {})),
        villageSlain: JSON.stringify((Gm.state.villageSlain || {})),
        Gm,
      };
    }
    const off = await runOnce(false);
    const on = await runOnce(true);
    const { Gm: _g1, ...snapOff } = off;
    const { Gm: _g2, ...snapOn } = on;
    ok(JSON.stringify(snapOff) === JSON.stringify(snapOn),
      'game-meaningful outcomes identical with logging off vs on');
    ok(!('waveKillLog' in off.Gm.state) && !('waveKillByChannel' in off.Gm.state),
      'logging off: zero footprint (no attr keys in state)');
    ok(off.Gm._trickTally === undefined, 'logging off: no trick tally');
    ok(Array.isArray(on.Gm.state.waveKillLog) && on.Gm.state.waveKillLog.length >= 1,
      'logging on: kill log recorded');
    ok(((on.Gm._trickTally || {}).shout || 0) >= 1, 'logging on: tally recorded the shout');
    const lastKill = on.Gm.state.waveKillLog[on.Gm.state.waveKillLog.length - 1];
    ok(lastKill.via === 'patrol' && lastKill.by === 'honesty_fighter',
      'logging on: channel + killer on the kill entry');
    const vias = new Set(on.Gm.state.waveKillLog.map(e => e.via));
    ok([...vias].every(v => ['patrol', 'wild', 'aid-crisis', 'contest', 'agency', 'player', 'unknown'].includes(v)),
      'all logged channels from the known set');
  }

  console.log(`\n==== FINAL: ${pass} passed, ${fail} failed ====`);
  if (failures.length) console.log('failures: ' + failures.join(' | '));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
