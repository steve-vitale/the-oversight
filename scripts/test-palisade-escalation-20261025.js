#!/usr/bin/env node
// scripts/test-palisade-escalation-20261025.js — sim-palisade-a PROOF.
// Palisade-escalation narration beat (havenGrowth.js havenRaidTick):
// a wave-3+ drafted raider must add exactly one escalation beat as a
// SEPARATE aloud line immediately after the RAID line; a wave-1/2-only
// raid must add none; the RAID sentence itself must stay byte-unchanged
// in both palisade and no-palisade variants.
//
// Driven-game proof (no invented monsters): real setupGame, real world
// monsters spawned via spawnWorldMonster at the haven tile, real
// havenRaidTick looped past its nightly 18% roll (failed rolls change
// no state, so looping is the honest way to fire a reactive raid).
// Each variant runs in its own process (sim-harness rule: never two
// harnesses in one node process) — no-arg mode spawns the four
// variants as children and aggregates.
// Usage: node scripts/test-palisade-escalation-20261025.js
//        node scripts/test-palisade-escalation-20261025.js --variant w3-palisade
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');

const VARIANTS = {
  // id: [spawned monster ids in draft order, havenTier, beat expected]
  'w3-palisade': [['spool', 'bulldozer', 'bulldozer'], 2, true],
  'w3-nowall': [['redactor', 'moderator', 'bulldozer'], 0, true],
  'w12-palisade': [['moderator', 'bulldozer', 'bulldozer'], 2, false],
  'w12-nowall': [['bulldozer', 'bulldozer', 'bulldozer'], 0, false],
};

async function runVariant(id) {
  const [ids, tier, beatExpected] = VARIANTS[id];
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 4242, mode: 'palisade-proof-' + id, fullTelemetry: false });
  // Record-only say: the silent sim say is a no-op, so recording its
  // arguments cannot move trajectories or game state.
  const said = [];
  Game.say = function () { said.push(Array.prototype.slice.call(arguments).join(' ')); };
  Game.sysSay = function () {};
  await setupGame(Game);
  const v = Game.state.village;
  if (!v) throw new Error('no village after setupGame');
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  // Clear the world so the draft is exactly our three spawns at distance 0.
  Game.state.worldMonsters = [];
  v.havenTier = tier;
  v.lastRaidDay = -100; // cooldown satisfied whatever the day is
  v.pantry = (v.pantry || []).concat([{ id: 'proof-food', kcalEach: 5000, units: 1 }]);
  const spawned = ids.map(mid => Game.spawnWorldMonster({ id: mid }, hx, hy, {}));
  for (const m of spawned) {
    if (!m || (m.hp || 0) <= 0) throw new Error('spawn failed for ' + m);
  }
  // Display names BEFORE the raid (mname reads the same function).
  const disp = ids.map(mid => Game.monsterDisplayName(mid));
  const wmax = Math.max.apply(null, spawned.map(m => Game.crisisWaveOf(m)));
  const fired = (() => {
    for (let a = 0; a < 500; a++) {
      let r = false;
      try { r = Game.havenRaidTick(); } catch (e) { throw new Error('havenRaidTick threw: ' + e.message); }
      if (r) return true;
    }
    return false;
  })();
  const failures = [];
  const check = (cond, msg) => { if (!cond) failures.push(msg); };
  check(fired, 'raid never fired in 500 ticks');
  const raidIdx = said.findIndex(s => s.indexOf('🐗 RAID —') === 0);
  check(raidIdx >= 0, 'no RAID line said (said=' + JSON.stringify(said.slice(0, 6)) + ')');
  const raidLine = raidIdx >= 0 ? said[raidIdx] : '';
  const palSuffix = tier >= 2
    ? " The palisade's stakes take their toll as they come over the wall."
    : ' No walls. No warning but the noise.';
  const expectedRaid = '🐗 RAID — 3 raiders (' + disp.join(', ') + ') hit Haven in the night, drawn by the smell of the pantry!' + palSuffix;
  check(raidLine === expectedRaid, 'RAID line not byte-exact.\n  got:      ' + JSON.stringify(raidLine) + '\n  expected: ' + JSON.stringify(expectedRaid));
  check(raidLine.indexOf('⚠️') === -1 && raidLine.indexOf('usual teeth') === -1,
    'escalation leaked into the RAID sentence itself');
  // The beat, when present, names the FIRST drafted raider at wmax.
  const bigIdx = spawned.findIndex(m => Game.crisisWaveOf(m) === wmax);
  const bigDisp = disp[bigIdx];
  const expectedBeat = '🐗⚠️ One of them is bigger than the usual teeth at the door — ' + bigDisp + ' came with this raid, and the wall was not built for its kind.';
  const beatIdx = said.findIndex(s => s.indexOf('bigger than the usual teeth at the door') !== -1);
  if (beatExpected) {
    check(wmax >= 3, 'variant expects beat but drafted wmax=' + wmax + ' < 3');
    check(beatIdx >= 0, 'escalation beat missing (said lines: ' + JSON.stringify(said.slice(0, 8)) + ')');
    if (beatIdx >= 0) {
      check(said[beatIdx] === expectedBeat, 'beat not byte-exact.\n  got:      ' + JSON.stringify(said[beatIdx]) + '\n  expected: ' + JSON.stringify(expectedBeat));
      check(beatIdx === raidIdx + 1, 'beat is not the line immediately after the RAID line (raidIdx=' + raidIdx + ' beatIdx=' + beatIdx + ')');
    }
  } else {
    check(wmax < 3, 'variant expects no beat but drafted wmax=' + wmax + ' >= 3');
    check(beatIdx === -1, 'escalation beat present on a wave-1/2-only raid: ' + JSON.stringify(beatIdx >= 0 ? said[beatIdx] : ''));
  }
  // Knowledge gating: the beat must never carry a true monster name.
  if (beatIdx >= 0) {
    for (const mid of ids) {
      const def = (Game.data.monsters || []).find(m => m.id === mid);
      if (def && def.name) {
        check(said[beatIdx].indexOf(def.name) === -1,
          'beat leaks true name ' + JSON.stringify(def.name) + ' for ' + mid);
      }
    }
    check(said[beatIdx].indexOf('wave 3') === -1 && !/wave-\d/.test(said[beatIdx]),
      'beat names a wave number (fog-of-war breach)');
  }
  // No duplicate beat lines anywhere in the raid flow.
  const beatCount = said.filter(s => s.indexOf('bigger than the usual teeth at the door') !== -1).length;
  check(beatCount === (beatExpected ? 1 : 0), 'beat line count=' + beatCount + ', expected ' + (beatExpected ? 1 : 0));
  if (failures.length) {
    console.log('PALISADE-PROOF ' + id + ' FAIL\n  ' + failures.join('\n  '));
    console.log('  said[0..10]=' + JSON.stringify(said.slice(0, 10), null, 1));
    process.exit(1);
  }
  console.log('PALISADE-PROOF ' + id + ' PASS wmax=' + wmax + ' palisade=' + (tier >= 2) + ' beat=' + beatExpected + ' raid=' + JSON.stringify(raidLine));
}

async function main() {
  const args = process.argv.slice(2);
  const vi = args.indexOf('--variant');
  if (vi >= 0) return runVariant(args[vi + 1]);
  let failed = 0;
  for (const id of Object.keys(VARIANTS)) {
    try {
      const out = execFileSync(process.execPath, [path.join(__dirname, 'test-palisade-escalation-20261025.js'), '--variant', id], { encoding: 'utf8', timeout: 300000 });
      process.stdout.write(out);
    } catch (e) {
      failed++;
      process.stdout.write((e.stdout || '') + (e.stderr || '') + '\n');
      console.log('PALISADE-PROOF ' + id + ' CHILD FAILED');
    }
  }
  console.log(failed ? 'PALISADE-PROOF OVERALL FAIL (' + failed + ' variants)' : 'PALISADE-PROOF OVERALL PASS (4/4 variants)');
  if (failed) process.exit(1);
}
main().catch(e => { console.error('PALISADE-PROOF ERROR:', (e && e.stack) || e); process.exit(1); });
