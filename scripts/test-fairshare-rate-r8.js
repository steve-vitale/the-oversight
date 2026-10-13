#!/usr/bin/env node
// scripts/test-fairshare-rate-r8.js — longsim scale-wall r8 PROOF (2026-10-13, lever 5).
//
// Fair-share RATE accounting in theftConfrontation. RED tests (must all pass):
//   (a) genuine one-take theft (>=4000 kcal in a SINGLE take) STILL triggers
//       confrontation — the moot keeps its teeth.
//   (b) rate-hoarding (3000 kcal/day in small takes, sustained 7d) STILL
//       triggers via the trailing-7d rate check.
//   (c) normal communal eating (1000-2000 kcal/day, every single take <4000)
//       trips NEITHER bar — the r6/r7 false positive is dead.
//   (d) REGRESSION: a huge CUMULATIVE lifetime ledger with a small current
//       take does NOT trigger (the old bug: cumulative passed as the take).
//   (e) takeFromPantry integration: passes the single-take kcal (not the
//       cumulative total) and records takeHist.
//   (f) succession: the new bearer starts a fresh takes/gives/takeHist book
//       (no more "mystery takes").
//
// Usage: node scripts/test-fairshare-rate-r8.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'fairshare-r8' });
  await setupGame(Game);
  const v = Game.state.village;
  const vid = Game.villagerId;
  v.takes = v.takes || {}; v.gives = v.gives || {}; v.takeHist = v.takeHist || {};

  // ---- deterministic confrontation machinery ----
  const rosterNPCs = (v.roster || []).filter(id => id !== vid).slice(0, 3);
  if (rosterNPCs.length < 2) { console.log('FAIL setup: need 2+ NPCs'); process.exit(1); }
  const realWitnesses = Game.witnesses;
  Game.witnesses = () => rosterNPCs.slice(0, 2);
  const realRandom = Math.random;
  Math.random = () => 0.99; // never slides (0.99 < 0.35 false); deterministic confronter pick
  let said = [];
  Game.say = (m) => { said.push(String((m && (m.text || m)) || m)); return null; };
  let hoards = 0;
  const realObserve = Game.observe;
  Game.observe = function (k, arg) { if (k === 'hoard') hoards++; return realObserve.call(this, k, arg); };
  const fired = () => hoards > 0 || said.some(s => /taking|hoarding|count bites|second pantry/i.test(s));
  function resetFire() { said = []; hoards = 0; }
  function setDay(d) {
    Game.state.scholar.day = d;
    delete v['theftConf' + d];
  }

  console.log('== (a) one-take theft still confronts ==');
  setDay(10); resetFire();
  v.takeHist = {}; v.takes[vid] = 0;
  Game.theftConfrontation(4500);
  ok('a: 4500 single take fires', fired(), `said=${said.length} hoards=${hoards}`);
  ok('a: confrontation line is grab-flavored', said.some(s => /That's a lot you're taking|that's hoarding|taking double/i.test(s)),
    said[0] || '(nothing said)');

  console.log('== (a2) small take, no history: silent ==');
  setDay(11); resetFire();
  v.takeHist = {}; v.takes[vid] = 0;
  Game.theftConfrontation(1500);
  ok('a2: 1500 single take, clean history, silent', !fired(), `said=${said.length} hoards=${hoards}`);

  console.log('== (b) rate-hoarding trips the rate bar ==');
  setDay(20); resetFire();
  v.takeHist = {}; v.takes[vid] = 0;
  // 3000/day in 500-kcal takes, 7 days straight (days 14..20)
  for (let d = 14; d <= 20; d++) {
    Game.state.scholar.day = d;
    for (let i = 0; i < 6; i++) Game.recordTakeHist(vid, 500);
  }
  setDay(20); // re-arm the day gate for the confrontation itself
  const rate = Game.takeRate7(vid);
  ok('b: measured 7d rate is 3000/day', Math.abs(rate - 3000) < 1, `rate=${rate}`);
  Game.theftConfrontation(500); // the 7th day's small take
  ok('b: 500 take at 3000/day rate fires', fired(), `said=${said.length} hoards=${hoards}`);
  ok('b: confrontation line is pattern-flavored', said.some(s => /Every day|every take|eaten for two/i.test(s)),
    said[0] || '(nothing said)');

  console.log('== (c) normal communal eating trips neither ==');
  setDay(30); resetFire();
  v.takeHist = {}; v.takes[vid] = 0;
  // 1500/day in small takes, 7 days (days 24..30) — ordinary eating
  for (let d = 24; d <= 30; d++) {
    Game.state.scholar.day = d;
    for (let i = 0; i < 3; i++) Game.recordTakeHist(vid, 500);
  }
  setDay(30);
  const rateC = Game.takeRate7(vid);
  ok('c: measured 7d rate is 1500/day', Math.abs(rateC - 1500) < 1, `rate=${rateC}`);
  Game.theftConfrontation(1500);
  ok('c: 1500/day sustained, 1500 take: silent', !fired(), `said=${said.length} hoards=${hoards}`);
  // and at the top of the norm: 2000/day
  setDay(31); resetFire();
  v.takeHist = {};
  for (let d = 25; d <= 31; d++) {
    Game.state.scholar.day = d;
    for (let i = 0; i < 4; i++) Game.recordTakeHist(vid, 500);
  }
  setDay(31);
  Game.theftConfrontation(2000);
  ok('c: 2000/day sustained, 2000 take: silent', !fired(), `said=${said.length} hoards=${hoards}`);

  console.log('== (d) cumulative ledger no longer trips the bar ==');
  setDay(40); resetFire();
  v.takeHist = {};
  v.takes[vid] = 100000; // two months of communal eating on the old gross ledger
  Game.theftConfrontation(500);
  ok('d: 100k cumulative + 500 take: silent', !fired(), `said=${said.length} hoards=${hoards}`);

  console.log('== (e) takeFromPantry passes the single take ==');
  setDay(50); resetFire();
  v.takeHist = {}; v.takes[vid] = 50000; // hostile cumulative ledger
  v.pantry = v.pantry || [];
  v.pantry.push({ name: 'test biscuit', kcalEach: 500, units: 5, kg: 0.1, unit: 'item' });
  const idx = v.pantry.length - 1;
  const beforeHist = ((v.takeHist || {})[vid] || []).length;
  try { Game.takeFromPantry(idx); } catch (e) { console.log('  (takeFromPantry threw: ' + e.message + ')'); }
  const afterHist = ((v.takeHist || {})[vid] || []).length;
  ok('e: 500-kcal take on 50k cumulative ledger: silent', !fired(), `said=${said.length} hoards=${hoards}`);
  ok('e: takeHist recorded the 500 take', afterHist === beforeHist + 1 &&
    ((v.takeHist[vid] || []).slice(-1)[0] || {}).kcal === 500,
    `hist ${beforeHist} -> ${afterHist}`);
  // and a genuinely blatant single take through the real path
  setDay(51); resetFire();
  v.takeHist = {}; v.takes[vid] = 0;
  v.pantry.push({ name: 'test slab', kcalEach: 4500, units: 2, kg: 1, unit: 'item' });
  try { Game.takeFromPantry(v.pantry.length - 1); } catch (e) { console.log('  (takeFromPantry threw: ' + e.message + ')'); }
  ok('e: 4500-kcal single take via takeFromPantry fires', fired(), `said=${said.length} hoards=${hoards}`);

  console.log('== (f) succession resets the social ledger ==');
  // crown a known NPC as successor: max trust, pre-loaded "mystery takes"
  const nid = rosterNPCs[0];
  v.trust = v.trust || {};
  for (const id of (v.roster || [])) v.trust[id] = 1;
  v.trust[nid] = 100;
  v.takes[nid] = 12345; v.gives[nid] = 678;
  v.takeHist = v.takeHist || {}; v.takeHist[nid] = [{ day: 40, kcal: 100 }];
  Game.state.scholar.day = 60;
  Game.state.scholar.health = 1; Game.state.scholar.kcal = 0;
  try { Game.playerDeath('test-succession'); } catch (e) { console.log('  (playerDeath threw: ' + e.message + ')'); }
  const newVid = Game.villagerId;
  ok('f: successor is the crowned NPC', newVid === nid, `newVid=${newVid} want=${nid}`);
  if (newVid === nid) {
    ok('f: takes reset', (v.takes[nid] || 0) === 0, `takes=${v.takes[nid]}`);
    ok('f: gives reset', (v.gives[nid] || 0) === 0, `gives=${v.gives[nid]}`);
    ok('f: takeHist reset', ((v.takeHist || {})[nid] || []).length === 0,
      `len=${((v.takeHist || {})[nid] || []).length}`);
  }

  Math.random = realRandom;
  Game.witnesses = realWitnesses;
  Game.observe = realObserve;
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
