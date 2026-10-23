#!/usr/bin/env node
// scripts/test-r41-meal-voice-20261023.js — proof test for the r41 blank:
// the village-meal beat's "(Half ration — they don't trust you yet.)"
// parenthetical keys on `trust < 30` ALONE, while the share now keys on
// (trust < 30 && bodyIsNew) per the c8d7c787d new-villager gate (Steve
// 2026-10-23). So a taken-over ESTABLISHED body at trust<30 banks 2000/2200
// while the beat says "Half ration" — the voice lies about the meal.
//
// GREEN means, for each of the fix's 5 scenarios, the beat reports
// "Half ration" IFF the share actually banked is 1000:
//   A. first life, trust 20: want 1000, voice HAS "Half ration"
//   B. first life, trust 35: want 2000, voice LACKS "Half ration"
//   C. taken-over established villager, trust 20: want 2000, voice LACKS
//      "Half ration"  (THE VOICE BUG: pre-fix beat keys on trust<30 -> says it)
//   D. taken-over NEWCOMER (arrived today), trust 20: want 1000, voice HAS it
//   E. taken-over established villager, trust 65: want 2200, voice LACKS it
// Usage: node scripts/test-r41-meal-voice-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const fails = [];
  const { Game } = await loadGame({ seed: 424202, mode: 'meal-voice-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  const v = Game.state.village;

  if (!Game.pantryInReach()) fails.push('construction invalid: player not at haven (pantryInReach false)');
  Game.stockPantry(30000, 'Test grain');
  const kcalCap = Game.kcalCap();
  if (kcalCap < 2200) fails.push(`construction invalid: kcalCap=${kcalCap} < 2200`);

  // capture the `want` villageMeal passes to pantryDraw (== share when room allows)
  let gotWant = null;
  const _pd = Game.pantryDraw;
  Game.pantryDraw = function (vv, want, opts) { gotWant = want; return _pd.call(this, vv, want, opts); };
  // capture narration lines
  let lines = [];
  const _say = Game.say;
  Game.say = function (...args) { lines.push(args.join(' ')); return _say ? _say.apply(this, args) : undefined; };
  function mealRound() {
    gotWant = null; lines = [];
    s.kcal = 0; // empty bank: want = min(share, room) = share
    Game.villageMeal();
    const voiceHalf = lines.some(l => l.includes('Half ration'));
    return { want: gotWant, voiceHalf };
  }
  function check(name, actual, expWant, expVoiceHalf) {
    const wantOk = actual.want === expWant;
    const voiceOk = actual.voiceHalf === expVoiceHalf;
    if (!wantOk || !voiceOk) {
      fails.push(`${name}: want=${actual.want} (expected ${expWant}), voiceHalf=${actual.voiceHalf} (expected ${expVoiceHalf})`);
    } else {
      console.log(`ok - ${name}: want=${actual.want}, voiceHalf=${actual.voiceHalf}`);
    }
  }

  const origId = Game.villagerId;
  v.trust = v.trust || {};

  // A. first life (lineage empty), trust 20 -> half ration, voiced
  v.trust[origId] = 20;
  check('A first-life trust-20 newcomer body', mealRound(), 1000, true);

  // B. first life, trust 35 -> full, not voiced
  v.trust[origId] = 35;
  check('B first-life trust-35', mealRound(), 2000, false);

  // C. succession: lineage gains the dead bearer; body becomes an established
  //    villager with trust 20 -> want FULL, voice must NOT say half ration
  Game.lineage().push({ name: 'Old Bearer', villagerId: origId, day: s.day || 40 });
  const otherId = (v.roster || []).find(id => id !== origId);
  if (!otherId) fails.push('construction invalid: no second roster villager');
  Game.villagerId = otherId;
  s.villagerId = otherId;
  v.trust[otherId] = 20;
  check('C taken-over established villager trust-20', mealRound(), 2000, false);

  // D. taken-over villager who arrived TODAY (newcomer) -> half, voiced
  v.arrivedDay = v.arrivedDay || {};
  v.arrivedDay[otherId] = s.day || 40;
  check('D taken-over newcomer trust-20', mealRound(), 1000, true);
  delete v.arrivedDay[otherId];

  // E. established successor, trust 65 -> bonus, not voiced
  v.trust[otherId] = 65;
  check('E taken-over established villager trust-65', mealRound(), 2200, false);

  Game.pantryDraw = _pd;
  Game.say = _say;
  if (fails.length) { console.error('FAIL:\n' + fails.join('\n')); process.exit(1); }
  console.log('ALL GREEN');
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
