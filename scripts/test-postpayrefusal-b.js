#!/usr/bin/env node
// test-postpayrefusal-b.js — independent re-proof for sim-postpayrefusal-b.
//
// The assigned blank (spandraw-design-b: end_it_before, war_cry.challenge,
// trophy_room.mark had no precheck, so a day-end failed tap paid the time
// tick, fired endDay, and swallowed the night's meals in a naive tally)
// was already fixed on master by sim-refusalprecheck-b (world-state
// prechecks) and sim-onceaday-b (day-roll-aware once-a-day prechecks).
// This script re-proves the property on CURRENT HEAD; it asserts no
// new behaviour of its own. Fixture proof, not a policy sim: fresh
// day-1 setups via the shared sim-harness, one useAbility tap each.
//
//   node scripts/test-postpayrefusal-b.js [dump <outfile.json>]
//     Assert mode (default): exit 0 on pass, 1 on any failure.
//     Dump mode records every fixture row without verdicts.
//
// Fixtures per seed (boundary = dayTicks 512 - ticks(cost)):
//   F1 challenge, no audience -> refuse pre-payment
//   F2 end_it_before, no audience -> refuse pre-payment
//   F3 trophy mark, no kills -> refuse pre-payment
//   F4 challenge, once-a-day flag preset, NON-boundary (dayTicks 100),
//       explicit partner -> refuse pre-payment (onceaday closure)
//   F5 end_it_before, same as F4 -> refuse pre-payment
//   F6 challenge, explicit partner, no flag, boundary -> success, crosses day
//   F7 end_it_before, explicit partner, no flag, boundary -> success, crosses
//   F8 trophy mark, kills present, boundary -> success, crosses day
//   F9 challenge, flag preset, BOUNDARY, explicit partner -> success:
//       the tap lands on the new day, so it is that day's challenge
//       (must succeed and stamp the new day, NOT refuse).
//
// Refusal assertion (the whole point of the arm): result false, day
// unchanged, dayTicks unchanged, scholar kcal unchanged, AND village
// pantry kcal unchanged — pantry unchanged is the meal proof, because
// endDay draws the night's meals from the pantry; a tap that fired
// endDay could not leave the pantry untouched. Refusal sentence present.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '9981,9982,9983,9984,9985,9986,9987,9988')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);

const COST_TICKS = { 'war_cry.challenge': 3, 'intimidating_presence.end_it_before': 3, 'trophy_room.mark': 5 };
function ticksFor(key) { return COST_TICKS[key] || 0; }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

async function oneFixture(seed, fx) {
  const { Game } = await loadGame({ seed, mode: 'postpayrefusal-b', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  const v = Game.state.village || {};
  const abs = (s.abilities || []);
  if (!abs.some((a) => (a.id || a) === fx.ability)) abs.push({ id: fx.ability, level: 1 });
  s.abilities = abs;
  if (!Game.hasAbility(fx.ability)) throw new Error('grant failed ' + fx.ability);
  try { s.kcal = Math.max(s.kcal || 0, 5000); s.health = Math.max(s.health || 0, 100); } catch (e) {}
  const roster = v.roster || [];
  let partner = null;
  for (const vid of roster) {
    if (vid === Game.villagerId) continue;
    let person = null;
    try { person = Game.getPerson(vid); } catch (e) {}
    if (person && person.dead) continue;
    partner = vid; break;
  }
  if (!partner) throw new Error('no partner on roster seed=' + seed);
  v.conv = {};
  if (fx.kills) Game.state.villageSlain = { deer: 2, boar: 1 };
  else Game.state.villageSlain = {};
  if (fx.flag === 'challengeDay') s.challengeDay = s.day;
  if (fx.flag === 'postureDay') s.postureDay = s.day;
  const pos = (fx.posTicks != null) ? fx.posTicks : 512 - ticksFor(fx.ability + '.' + fx.action);
  try { s.dayTicks = pos; s.actionClock = 0; Game.dayPart = Math.floor(pos / 128); } catch (e) {}
  const dayBefore = s.day, ticksBefore = s.dayTicks, kcalBefore = s.kcal;
  const pantryBefore = pantryKcal(Game);
  const sayLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try { if (sayLines.length < 200) sayLines.push(String(args[0] || '').slice(0, 500)); } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  let result = null, resultError = null;
  try { result = Game.useAbility(fx.ability, fx.action, fx.target === 'explicit' ? partner : undefined); }
  catch (e) { resultError = String(e && (e.stack || e.message)); }
  try { if (typeof origSay === 'function') Game.say = origSay; } catch (e) {}
  return {
    seed, fixture: fx.id, ability: fx.ability, action: fx.action,
    dayBefore, dayAfter: s.day, dayTicksBefore: ticksBefore, dayTicksAfter: s.dayTicks,
    kcalBefore, kcalAfter: s.kcal, pantryBefore, pantryAfter: pantryKcal(Game),
    challengeDayBefore: fx.flag === 'challengeDay' ? dayBefore : s.challengeDay,
    challengeDayAfter: s.challengeDay, postureDayAfter: s.postureDay,
    result, resultError, sayLines,
  };
}

const FIXTURES = [
  { id: 'F1', ability: 'war_cry', action: 'challenge', expect: 'refuse' },
  { id: 'F2', ability: 'intimidating_presence', action: 'end_it_before', expect: 'refuse' },
  { id: 'F3', ability: 'trophy_room', action: 'mark', expect: 'refuse' },
  { id: 'F4', ability: 'war_cry', action: 'challenge', target: 'explicit', flag: 'challengeDay', posTicks: 100, expect: 'refuse-onceaday' },
  { id: 'F5', ability: 'intimidating_presence', action: 'end_it_before', target: 'explicit', flag: 'postureDay', posTicks: 100, expect: 'refuse-onceaday' },
  { id: 'F6', ability: 'war_cry', action: 'challenge', target: 'explicit', expect: 'success' },
  { id: 'F7', ability: 'intimidating_presence', action: 'end_it_before', target: 'explicit', expect: 'success' },
  { id: 'F8', ability: 'trophy_room', action: 'mark', kills: true, expect: 'success' },
  { id: 'F9', ability: 'war_cry', action: 'challenge', target: 'explicit', flag: 'challengeDay', expect: 'success-boundary' },
];

const REFUSAL_SENTENCE = {
  war_cry: 'A challenge needs someone to challenge',
  intimidating_presence: 'Posturing needs an audience',
  trophy_room: 'no kills recorded yet',
};
const ONCEADAY_SENTENCE = {
  war_cry: 'You already threw down a challenge today',
  intimidating_presence: 'You already threw your weight around today',
};
const SUCCESS_MARK = {
  war_cry: 'You point at ',
  intimidating_presence: 'yields the point',
  trophy_room: 'marked.',
};

(async () => {
  const mode = process.argv[2];
  const rows = [];
  for (const seed of SEEDS) {
    for (const fx of FIXTURES) {
      const r = await oneFixture(seed, fx);
      r.expect = fx.expect;
      rows.push(r);
      console.log(`${r.fixture} seed=${seed} ${r.ability}.${r.action} result=${r.result} day=${r.dayBefore}->${r.dayAfter} ticks=${r.dayTicksBefore}->${r.dayTicksAfter} kcal=${r.kcalBefore}->${r.kcalAfter} pantry=${r.pantryBefore}->${r.pantryAfter}`);
    }
  }
  if (mode === 'dump') {
    const out = process.argv[3];
    if (!out) { console.error('dump requires an outfile'); process.exit(2); }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(rows, null, 2) + '\n');
    console.log('dumped ' + rows.length + ' fixtures to ' + out);
    return;
  }
  const failures = [];
  for (const r of rows) {
    const say = r.sayLines.join('\n');
    if (r.expect === 'refuse' || r.expect === 'refuse-onceaday') {
      if (r.result !== false) failures.push(`${r.fixture} seed=${r.seed}: refusal returned ${r.result}`);
      if (r.dayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: refusal crossed day ${r.dayBefore}->${r.dayAfter}`);
      if (r.dayTicksAfter !== r.dayTicksBefore) failures.push(`${r.fixture} seed=${r.seed}: refusal consumed ticks ${r.dayTicksBefore}->${r.dayTicksAfter}`);
      if (r.kcalAfter !== r.kcalBefore) failures.push(`${r.fixture} seed=${r.seed}: refusal changed kcal ${r.kcalBefore}->${r.kcalAfter}`);
      if (r.pantryAfter !== r.pantryBefore) failures.push(`${r.fixture} seed=${r.seed}: refusal drew pantry meals ${r.pantryBefore}->${r.pantryAfter}`);
      const sentence = r.expect === 'refuse-onceaday' ? ONCEADAY_SENTENCE[r.ability] : REFUSAL_SENTENCE[r.ability];
      if (!say.includes(sentence)) failures.push(`${r.fixture} seed=${r.seed}: refusal sentence missing (${sentence}); tail: ${r.sayLines.slice(-3).join(' | ').slice(0, 300)}`);
    } else if (r.expect === 'success') {
      if (r.result !== true) failures.push(`${r.fixture} seed=${r.seed}: success returned ${r.result}`);
      if (r.dayAfter !== r.dayBefore + 1) failures.push(`${r.fixture} seed=${r.seed}: success did not cross day ${r.dayBefore}->${r.dayAfter}`);
      if (!say.includes(SUCCESS_MARK[r.ability])) failures.push(`${r.fixture} seed=${r.seed}: success narration missing (${SUCCESS_MARK[r.ability]})`);
    } else if (r.expect === 'success-boundary') {
      if (r.result !== true) failures.push(`${r.fixture} seed=${r.seed}: boundary once-a-day should succeed (new day), got ${r.result}`);
      if (r.dayAfter !== r.dayBefore + 1) failures.push(`${r.fixture} seed=${r.seed}: boundary once-a-day did not cross day`);
      if (r.challengeDayAfter !== r.dayAfter) failures.push(`${r.fixture} seed=${r.seed}: boundary challenge flag should stamp new day ${r.dayAfter}, got ${r.challengeDayAfter}`);
      if (!say.includes(SUCCESS_MARK[r.ability])) failures.push(`${r.fixture} seed=${r.seed}: boundary success narration missing`);
    }
  }
  if (failures.length) {
    console.log('FAILURES (' + failures.length + '):');
    for (const f of failures) console.log('  - ' + f);
    process.exit(1);
  }
  console.log('PASS: all ' + rows.length + ' fixtures refuse pre-payment / succeed as pre-registered');
})().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
