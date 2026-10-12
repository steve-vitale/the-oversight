#!/usr/bin/env node
// test-exiled-beat-dies-20261011.js — travel lever r3 proof (hierarchy.js).
// A staged national/global beat whose answerer is exiled can never be
// answered (_blockIfNotHaven blocks every council verb from the road).
// Before the fix, a real sim sat a staged Binding pending 47 days, spamming
// the block line daily. Now the beat dies aloud at the next day boundary —
// like every other unanswerable beat — and the rung can re-stage later.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = [4242, 7, 99];

let pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + label + (detail ? ' — ' + detail : '')); }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'exilebeat', fullTelemetry: false });
  await setupGame(Game);
  const say = [];
  const osay = Game.say;
  Game.say = function (m) { if (typeof m === 'string') say.push(m); return osay.apply(this, arguments); };
  const ovs = Game.state.otherVillages || [];
  const ids = ovs.slice(0, 3).map(v => v.id);

  // 1. belong beat + exiled scholar -> dies aloud on the daily check
  Game.stageNationalBeat({ led: false, primary: ids[0], shape: 'belong', villages: ['haven'].concat(ids) });
  ok(!!Game.state.pendingNational, 'beat staged');
  Game.state.scholar.exiled = true;
  say.length = 0;
  Game._checkNational();
  ok(!Game.state.pendingNational, 'exiled: pendingNational cleared by _checkNational');
  const deathLine = say.find(m => /never happens|never sits|never convenes|never seals/.test(m));
  ok(!!deathLine, 'exiled: the death is said aloud', say.join(' | ').slice(0, 200));
  if (deathLine) console.log('  death line: ' + deathLine);
  ok(/exile/i.test(deathLine || ''), 'exiled: the line names the exile', deathLine);

  // 1b. no re-stage while exiled: the rung waits for a non-exiled answerer
  Game._checkNational();
  ok(!Game.state.pendingNational, 'exiled: no re-stage while exiled');
  const deathCount = say.filter(m => /never happens|never sits|never convenes|never seals/.test(m)).length;
  ok(deathCount === 1, 'exiled: exactly one death line, no stage/kill loop', `deathCount=${deathCount}`);

  // 2. pendingGlobal + exiled -> dies aloud too
  Game.state.pendingGlobal = { viewership: 45, day: 0 };
  say.length = 0;
  Game._checkNational();
  ok(!Game.state.pendingGlobal, 'exiled: pendingGlobal cleared by _checkNational');
  ok(say.some(m => /Watchers move on/.test(m)), 'exiled: the Watchers death is said aloud');

  // 3. no exile -> the beat survives the check (still answerable)
  Game.state.scholar.exiled = false;
  Game.stageNationalBeat({ led: false, primary: ids[0], shape: 'belong', villages: ['haven'].concat(ids) });
  say.length = 0;
  Game._checkNational();
  ok(!!Game.state.pendingNational, 'not exiled: pendingNational survives _checkNational');
  ok(!say.some(m => /never happens/.test(m)), 'not exiled: no death line');

  // 4. the blocked answer attempt still blocks (the security wrap stands)
  Game.state.scholar.exiled = true;
  const r = Game.answerNationalChoice('swear');
  ok(r == null, 'exiled: answerNationalChoice still blocked (returns null)');
  console.log(`seed ${seed}: done`);
}

async function main() {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.log(`seed ${s} ERROR: ${e.message}`); fail++; } }
  console.log(`\nRESULT: ${pass} pass, ${fail} fail (seeds ${SEEDS.join(',')})`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
