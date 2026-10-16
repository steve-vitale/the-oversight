#!/usr/bin/env node
// SCHOLAR TRICK OBSERVATION — proof test (2026-10-14, lever scholartrick).
//
// Proves the scholar's symmetric observation channel (Steve's VILLAGER
// COUNTER PARITY, sim-findings #67):
//   1. scholar survives a tb fight (fled / routed / calmed) vs a trick-bearing
//      (waves 1-2) or signature-bearing (wave-3) beast -> ONE observation into
//      the SAME state.villageCounterObs bar (2-encounter threshold)
//   2. second observation -> discovery via the scholar channel
//      (discoverMonsterCounter 'scholar-observed' / villagerTricks), first-person
//   3. 'won' records NO observation (kills teach via the slain path — parity
//      with the villager vKill exclusion)
//   4. 'lost' records NO observation (the dead tell no tales — vDie parity)
//   5. wave-3 signature path: spool observations -> villagerTricks.spool
//   6. villager path byte-identical: same strings, same tele via values,
//      'player' exclusion kept on the villager wrapper
//
// RED: --red-js <pristine-game.js> (generate with:
//        git show <pre-change-sha>:src/js/game.js > /tmp/scholartrick-gamejs-pristine.js)
//      On pristine code the channel does not exist and tbEnd('fled') records
//      no scholar observations.
// GREEN: default (worktree game.js).
//
// Run: node scripts/test-scholartrick-20261014.js [--red-js /path/to/pristine-game.js]
//   (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

const RED_JS = (() => {
  const i = process.argv.indexOf('--red-js');
  return i >= 0 ? process.argv[i + 1] : null;
})();
const RED = !!RED_JS;

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
const SEED = parseInt(process.env.SEED || '20261014', 10);
Math.random = mulberry32(SEED);

// ---------- boot the full engine (index.html order, DOM-only excluded) ----------
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"]*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => {
  const src = (f === 'src/js/game.js' && RED_JS)
    ? fs.readFileSync(RED_JS, 'utf8')
    : fs.readFileSync(path.join(ROOT, f), 'utf8');
  eval(src);
});
delete global.window;
const Game = globalThis.Scattering.Game;

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const sayLines = [];
  Game.say = (s) => { sayLines.push(String(s)); };
  Game.sysSay = (s) => { sayLines.push('[sys] ' + String(s)); };
  Game.audioEvent = () => {};
  const clearSay = () => { sayLines.length = 0; };

  // instrument: count scholar increments + scholar-observed discoveries
  // (wrappers call through — gameplay-identical, no RNG, no state mutation)
  let scholarIncrements = 0, scholarDiscoveries = 0, villagerDiscoveries = 0;
  const clearCounts = () => { scholarIncrements = 0; scholarDiscoveries = 0; villagerDiscoveries = 0; };
  if (typeof Game.noteScholarTrickObservation === 'function') {
    const orig = Game.noteScholarTrickObservation;
    Game.noteScholarTrickObservation = function (mid) { scholarIncrements++; return orig.call(this, mid); };
  }
  if (typeof Game.discoverMonsterCounter === 'function') {
    const origD = Game.discoverMonsterCounter;
    Game.discoverMonsterCounter = function (mid, via) {
      if (via === 'scholar-observed') scholarDiscoveries++;
      if (via === 'observed') villagerDiscoveries++;
      return origD.call(this, mid, via);
    };
  }

  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  const resetObs = (...mids) => {
    Game.state.villageCounterObs = {};
    Game.state.villagerTricks = {};
    Game.state.monsterCounters = Game.state.monsterCounters || {};
    Game.state.villageSlain = Game.state.villageSlain || {};
    for (const mid of mids) {
      delete Game.state.monsterCounters[mid];
      delete Game.state.villageSlain[mid];
    }
    clearSay(); clearCounts();
  };

  // minimal but honest tb fight: scholar + one beast
  function fakeFight(mid, pHp, mAlive) {
    const md = mdef(mid);
    Game.tbfight = {
      over: false, result: null, style: 0, round: 3, order: ['p', 'm_0'], turnIdx: 0,
      fighters: [
        { key: 'p', kind: 'player', alive: pHp > 0, fled: false, hp: pHp, maxHp: 100, mx: 4, my: 4, telegraph: null },
        { key: 'm_0', kind: 'monster', monsterId: mid, mdef: md, name: Game.monsterDisplayName(mid),
          emoji: (md && md.emoji) || '👹', alive: mAlive, fled: false,
          hp: mAlive ? 40 : 0, maxHp: 40, mx: 4, my: 6, telegraph: null },
      ],
    };
  }

  console.log((RED ? 'RED' : 'GREEN') + ' phase — scholartrick (seed ' + SEED + ')');

  // ============ RED: the channel does not exist on pristine code ============
  if (RED) {
    console.log('\n[RED-1] channel absent');
    ok(typeof Game.noteScholarTrickObservation === 'undefined', 'noteScholarTrickObservation does NOT exist (pristine)');
    ok(typeof Game.noteVillagerTrickObservation === 'function', 'noteVillagerTrickObservation exists (old code)');

    console.log('\n[RED-2] pristine tbEnd records no scholar observations');
    resetObs('belltoad');
    fakeFight('belltoad', 60, true);
    Game.tbEnd('fled');
    ok(!((Game.state.villageCounterObs || {})['belltoad'] > 0), 'no observation after tbEnd(fled) on pristine');
    ok(!sayLines.join('\n').includes('lived to tell it'), 'no scholar beat narrated on pristine');

    console.log('\n[RED-3] player exclusion on pristine');
    ok(Game.noteVillagerTrickObservation('player', 'belltoad') === false, "noteVillagerTrickObservation('player', ...) === false");

    console.log('\n==== RED: ' + pass + ' passed, ' + fail + ' failed ====');
    if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }
    process.exit(fail ? 1 : 0);
  }

  // ============ GREEN ============
  console.log('\n[G-1] channel exists');
  ok(typeof Game.noteScholarTrickObservation === 'function', 'noteScholarTrickObservation exists');
  ok(typeof Game._trickObservation === 'function', '_trickObservation core exists');
  ok(belltoadHasCounter(), 'belltoad has a waves 1-2 counter');
  function belltoadHasCounter() { const b = mdef('belltoad'); return !!(b && b.counter); }

  console.log('\n[G-2] fled -> one scholar observation, first-person beat');
  resetObs('belltoad');
  fakeFight('belltoad', 60, true);
  Game.tbEnd('fled');
  ok((Game.state.villageCounterObs['belltoad'] || 0) === 1, 'observation counter = 1 after fled');
  ok(scholarIncrements === 1, 'instrument: exactly 1 scholar increment');
  ok(sayLines.join('\n').includes('You lived to tell it'), 'first-person beat narrated ("You lived to tell it")');
  ok(!Game.monsterCounterKnown('belltoad'), 'not yet known after 1 (needs 2)');

  console.log('\n[G-3] routed (drove it off) -> second observation -> discovery');
  fakeFight('belltoad', 60, true);
  Game.tbEnd('routed');
  ok((Game.state.villageCounterObs['belltoad'] || 0) === 2, 'observation counter = 2 after routed');
  ok(Game.monsterCounterKnown('belltoad'), 'ledger convention: monsterCounterKnown true');
  ok(scholarDiscoveries === 1, 'instrument: 1 scholar-observed discovery');
  ok(sayLines.join('\n').includes('now you see the pattern'), 'discovery beat first-person ("now you see the pattern")');
  ok(!(Game.state.villageSlain['belltoad'] > 0), 'NO KILL required (villageSlain.belltoad = 0)');

  console.log('\n[G-4] won -> NO observation (kills teach via the slain path)');
  resetObs('lockpick_raccoon');
  fakeFight('lockpick_raccoon', 60, false); // beast dead: the scholar killed it
  Game.tbEnd('won');
  ok(!((Game.state.villageCounterObs || {})['lockpick_raccoon'] > 0), 'no observation after won');
  ok(scholarIncrements === 0, 'instrument: 0 scholar increments on won');
  ok((Game.state.villageSlain['lockpick_raccoon'] || 0) >= 1, 'slain path fired (villageSlain >= 1)');

  console.log('\n[G-5] lost -> NO observation (the dead tell no tales)');
  resetObs('hummice');
  Game.state.phoenixLink = { bearerIsPlayer: true }; // hold death at the threshold: no playerDeath machinery
  fakeFight('hummice', 0, true); // scholar down
  Game.tbEnd('lost');
  ok(!((Game.state.villageCounterObs || {})['hummice'] > 0), 'no observation after lost');
  ok(scholarIncrements === 0, 'instrument: 0 scholar increments on lost');
  delete Game.state.phoenixLink;

  console.log('\n[G-6] calmed -> observation (saw it in time)');
  resetObs('hummice');
  fakeFight('hummice', 60, true);
  Game.tbEnd('calmed');
  ok((Game.state.villageCounterObs['hummice'] || 0) === 1, 'observation counter = 1 after calmed');

  console.log('\n[G-7] wave-3 signature path: spool -> villagerTricks');
  resetObs('spool');
  const spool = mdef('spool');
  ok(spool && !spool.counter, 'spool has no counter field (wave-3 signature)');
  const s1 = Game.noteScholarTrickObservation('spool');
  ok(s1 === false, 'first spool observation: not yet (returns false)');
  ok((Game.state.villageCounterObs['spool'] || 0) === 1, 'spool observation counter = 1');
  const s2 = Game.noteScholarTrickObservation('spool');
  ok(s2 === true, 'second spool observation: knowledge recorded (returns true)');
  ok(Game.state.villagerTricks['spool'] === true, 'villagerTricks.spool set (signature convention)');
  ok(Game.villageKnowsTrick('spool'), 'villageKnowsTrick(spool) true');
  ok(sayLines.join('\n').includes('You lived to tell it, twice'), 'wave-3 discovery beat first-person');

  console.log('\n[G-8] villager path byte-identical');
  resetObs('bulldozer');
  const v1 = Game.noteVillagerTrickObservation('somevillager', 'bulldozer');
  ok(v1 === false, 'villager first observation: not yet');
  ok(!sayLines.join('\n').includes('lived to tell it'), 'villager first observation silent (as before)');
  const v2 = Game.noteVillagerTrickObservation('somevillager', 'bulldozer');
  ok(v2 === true, 'villager second observation: discovered');
  const vbeat = sayLines.join('\n');
  ok(vbeat.includes('Two survived encounters — the fire has a theory.'), 'villager viaLine (sim-wave3ledger 2026-10-16: was the scholar\'s "You did the thing" — misattributed the village\'s learning; now the fire\'s theory)');
  ok(villagerDiscoveries === 1 && scholarDiscoveries === 0, 'tele via=observed (not scholar-observed)');
  ok(Game.noteVillagerTrickObservation('player', 'hummice') === false, "villager wrapper still excludes 'player'");
  ok(Game.noteScholarTrickObservation('nonexistent_mid') === false, 'unknown mid -> false, no crash');
  ok(Game.noteScholarTrickObservation('bulldozer') === false, 'already-known mid -> false (no double count)');

  console.log('\n[G-9] mixed bar: villager tale + scholar note complete it');
  resetObs('nevermore');
  Game.noteVillagerTrickObservation('somevillager', 'nevermore'); // obs 1, silent
  clearSay(); clearCounts();
  const mx = Game.noteScholarTrickObservation('nevermore'); // obs 2
  ok(mx === true, 'scholar completes the bar -> discovery');
  ok(Game.monsterCounterKnown('nevermore'), 'monsterCounterKnown true');
  ok(sayLines.join('\n').includes('now you see the pattern'), 'mixed-bar discovery uses the scholar beat');

  console.log('\n==== GREEN: ' + pass + ' passed, ' + fail + ' failed ====');
  if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
