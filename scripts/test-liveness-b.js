#!/usr/bin/env node
// test-liveness-b.js — proof for sim-liveness-b (challenge/posture liveness gap).
//
// Fixture proof (not a policy sim): fresh day-1 setups via the shared
// sim-harness, one useAbility tap per fixture at dayTicks 100
// (non-boundary, so successes stamp the current day and do not cross).
// Modes:
//   node scripts/test-liveness-b.js dump <outfile.json>
//     Record every fixture (setup assertions only, no verdict).
//     Run BEFORE the game change for the baseline corpus, and AFTER
//     for the comparison snapshot.
//   node scripts/test-liveness-b.js
//     Assert POST-fix behaviour: dead-target taps refuse pre-payment
//     (nothing spent, flag unstamped, audience sentence present, bar
//     disabled for the convo-scan path); living-target taps succeed
//     exactly as before. Exit 0 on pass, 1 on any failure.
//     Run on UNMODIFIED code this mode FAILS on the dead rows (RED);
//     that failure IS the gap proof, not a script bug.
// Fixtures (per seed): D1 challenge explicit dead; D2 posture explicit
// dead; D3 challenge convo-scan dead (dead partner is the only active
// conversation); D4 posture convo-scan dead; L1 challenge explicit
// living; L2 posture explicit living; L3 challenge convo living;
// L4 posture convo living. Dead = Game.getPerson(partner).dead = true
// after setup, partner STILL on the roster (that roster+dead state is
// the gap state). Trophy mark has no target and is out of scope.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '9981,9982,9983,9984,9985,9986,9987,9988')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);

async function oneFixture(seed, fx) {
  const { Game } = await loadGame({ seed, mode: 'liveness-b', fullTelemetry: false });
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
  // Dead-flag fixture state (read back to prove the fixture, not assumed).
  let deadFlagReadBack = null;
  if (fx.dead) {
    const person = Game.getPerson(partner);
    if (!person) throw new Error('no person for partner seed=' + seed);
    person.dead = true;
    try { deadFlagReadBack = !!(Game.getPerson(partner) || {}).dead; } catch (e) { deadFlagReadBack = null; }
  }
  v.conv = {};
  if (fx.partner === 'convo') { v.conv[partner] = { active: true }; }
  const challengeDayBefore = s.challengeDay;
  const postureDayBefore = s.postureDay;
  try { s.dayTicks = 100; s.actionClock = 0; Game.dayPart = 0; } catch (e) {}
  const dayBefore = s.day, ticksBefore = s.dayTicks, kcalBefore = s.kcal;
  let avail = null;
  try {
    const def = Game.abilityActionDef(fx.ability, fx.action);
    avail = Game._actionAvailable(fx.ability, def.action);
  } catch (e) { avail = { ok: null, why: 'avail-error:' + e.message }; }
  const sayLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try { if (sayLines.length < 200) sayLines.push(String(args[0] || '').slice(0, 500)); } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  let target = undefined;
  if (fx.partner === 'explicit') target = partner;
  let result = null, resultError = null;
  try { result = Game.useAbility(fx.ability, fx.action, target); }
  catch (e) { resultError = String(e && (e.stack || e.message)); }
  try { if (typeof origSay === 'function') Game.say = origSay; } catch (e) {}
  return {
    seed, fixture: fx.id, ability: fx.ability, action: fx.action,
    partnerKind: fx.partner, deadTarget: !!fx.dead, deadFlagReadBack,
    target: target == null ? null : String(target),
    dayBefore, dayAfter: s.day, dayTicksBefore: ticksBefore, dayTicksAfter: s.dayTicks,
    kcalBefore, kcalAfter: s.kcal, result, resultError,
    challengeDayBefore, challengeDayAfter: s.challengeDay,
    postureDayBefore, postureDayAfter: s.postureDay,
    availOk: avail ? !!avail.ok : null, availWhy: avail ? String(avail.why || '') : null,
    sayLines,
  };
}

const FIXTURES = [
  { id: 'D1', ability: 'war_cry', action: 'challenge', partner: 'explicit', dead: true, expect: 'refuse-dead' },
  { id: 'D2', ability: 'intimidating_presence', action: 'end_it_before', partner: 'explicit', dead: true, expect: 'refuse-dead' },
  { id: 'D3', ability: 'war_cry', action: 'challenge', partner: 'convo', dead: true, expect: 'refuse-dead' },
  { id: 'D4', ability: 'intimidating_presence', action: 'end_it_before', partner: 'convo', dead: true, expect: 'refuse-dead' },
  { id: 'L1', ability: 'war_cry', action: 'challenge', partner: 'explicit', dead: false, expect: 'success' },
  { id: 'L2', ability: 'intimidating_presence', action: 'end_it_before', partner: 'explicit', dead: false, expect: 'success' },
  { id: 'L3', ability: 'war_cry', action: 'challenge', partner: 'convo', dead: false, expect: 'success' },
  { id: 'L4', ability: 'intimidating_presence', action: 'end_it_before', partner: 'convo', dead: false, expect: 'success' },
];

const REFUSAL_SENTENCE = {
  war_cry: 'A challenge needs someone to challenge',
  intimidating_presence: 'Posturing needs an audience',
};
const SUCCESS_MARK = {
  war_cry: 'You point at ',
  intimidating_presence: 'yields the point',
};

(async () => {
  const mode = process.argv[2];
  const rows = [];
  for (const seed of SEEDS) {
    for (const fx of FIXTURES) {
      const r = await oneFixture(seed, fx);
      r.expect = fx.expect;
      rows.push(r);
      console.log(`${r.fixture} seed=${seed} ${r.ability}.${r.action} partner=${r.partnerKind} dead=${r.deadTarget} deadReadBack=${r.deadFlagReadBack} result=${r.result} day=${r.dayBefore}->${r.dayAfter} ticks=${r.dayTicksBefore}->${r.dayTicksAfter} kcal=${r.kcalBefore}->${r.kcalAfter} availOk=${r.availOk}`);
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
    if (r.deadTarget && r.deadFlagReadBack !== true) failures.push(`${r.fixture} seed=${r.seed}: dead fixture did not read back dead`);
    if (r.expect === 'refuse-dead') {
      if (r.result !== false) failures.push(`${r.fixture} seed=${r.seed}: dead target should refuse, got ${r.result}`);
      if (r.dayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: dead refusal crossed day`);
      if (r.dayTicksAfter !== r.dayTicksBefore) failures.push(`${r.fixture} seed=${r.seed}: dead refusal consumed ticks ${r.dayTicksBefore}->${r.dayTicksAfter}`);
      if (r.kcalAfter !== r.kcalBefore) failures.push(`${r.fixture} seed=${r.seed}: dead refusal changed kcal ${r.kcalBefore}->${r.kcalAfter}`);
      if (!say.includes(REFUSAL_SENTENCE[r.ability])) failures.push(`${r.fixture} seed=${r.seed}: dead refusal sentence missing; tail: ${r.sayLines.slice(-2).join(' | ').slice(0, 300)}`);
      if (r.ability === 'war_cry' && r.challengeDayAfter !== r.challengeDayBefore) failures.push(`${r.fixture} seed=${r.seed}: dead challenge stamped challengeDay`);
      if (r.ability === 'intimidating_presence' && r.postureDayAfter !== r.postureDayBefore) failures.push(`${r.fixture} seed=${r.seed}: dead posture stamped postureDay`);
      if (r.partnerKind === 'convo' && r.availOk !== false) failures.push(`${r.fixture} seed=${r.seed}: dead convo partner button should be disabled (availOk=${r.availOk})`);
    } else {
      if (r.result !== true) failures.push(`${r.fixture} seed=${r.seed}: living success returned ${r.result}`);
      if (r.dayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: living success crossed day ${r.dayBefore}->${r.dayAfter}`);
      if (!say.includes(SUCCESS_MARK[r.ability])) failures.push(`${r.fixture} seed=${r.seed}: living success narration missing (${SUCCESS_MARK[r.ability]}); tail: ${r.sayLines.slice(-2).join(' | ').slice(0, 300)}`);
      if (r.ability === 'war_cry' && r.challengeDayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: living challenge did not stamp challengeDay=${r.dayBefore}, got ${r.challengeDayAfter}`);
      if (r.ability === 'intimidating_presence' && r.postureDayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: living posture did not stamp postureDay=${r.dayBefore}, got ${r.postureDayAfter}`);
    }
  }
  if (failures.length) {
    console.log('FAILURES (' + failures.length + '):');
    for (const f of failures) console.log(' - ' + f);
    process.exit(1);
  }
  console.log('PASS: all ' + rows.length + ' fixtures as expected (dead refuse pre-payment, living succeed)');
})().catch((e) => { console.error(e && e.stack || e); process.exit(2); });
