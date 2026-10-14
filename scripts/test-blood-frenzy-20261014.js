#!/usr/bin/env node
// test-blood-frenzy-20261014.js — Blood Frenzy follows its documented
// pattern through the REAL strike path (tbPlayerStrike).
//
// abilities.json: "Land 2 consecutive hits and the next is a guaranteed
// crit". Bug: tbPlayerStrike calls BA.damageMult (frenzyMult) BEFORE
// BA.onStrikeHit, so multipliers ran [1,2,2,2,...] and the "THIS ONE HURTS"
// line (frenzy === 2) never fired.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('blood-frenzy');

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  K.openSlots(Game, 6);
  K.giveAbility(Game, 'blood_frenzy');
  const BA = globalThis.Scattering.buildarounds;
  const mf = K.fight(Game, 'hushwolf', { px: 2, py: 4, mx: 3, my: 4 });
  T.ok('fight started', !!mf);

  // Record, per strike, the frenzy multiplier and whether it landed.
  const log = [];
  let pendingMult = null;
  const realMult = BA.frenzyMult, realHit = BA.onStrikeHit, realMiss = BA.onStrikeMiss;
  BA.frenzyMult = function (g) { pendingMult = realMult.call(BA, g); return pendingMult; };
  BA.onStrikeHit = function (g, t) { log.push({ hit: true, m: pendingMult }); return realHit.call(BA, g, t); };
  BA.onStrikeMiss = function (g) { log.push({ hit: false, m: pendingMult }); return realMiss.call(BA, g); };
  const says = K.captureSays(Game);

  for (let i = 0; i < 40 && log.length < 12; i++) {
    mf.hp = mf.maxHp = 100000; mf.alive = true;
    const p = Game.tbFighter('p');
    p.hp = p.maxHp; p.alive = true; p.acted = false;
    if (Game.tbfight) { Game.tbfight.over = false; }
    try { Game.tbPlayerStrike(mf.key); } catch (e) { console.log('strike error', e.message); }
  }
  says.restore();
  BA.frenzyMult = realMult; BA.onStrikeHit = realHit; BA.onStrikeMiss = realMiss;

  // Expected: within a run of consecutive hits, multipliers go 1,1,2,1,1,2…
  let run = 0, bad = [];
  for (const e of log) {
    if (!e.hit) { run = 0; continue; }
    run++;
    const want = run % 3 === 0 ? 2 : 1;
    if (e.m !== want) bad.push(`hit#${run} got x${e.m} want x${want}`);
  }
  const hits = log.filter(e => e.hit).length;
  T.ok('enough strikes landed to test the pattern', hits >= 3, `hits=${hits} of ${log.length}`);
  T.ok('frenzy pattern is [1,1,2] per 3 consecutive hits', bad.length === 0, bad.slice(0, 4).join('; '));
  T.ok('at least one frenzy crit (x2) happened', log.some(e => e.hit && e.m === 2));
  T.ok('"THIS ONE HURTS" fires after two consecutive hits', says.some(l => /THIS ONE HURTS/.test(l)));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
