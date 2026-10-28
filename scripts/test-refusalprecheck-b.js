#!/usr/bin/env node
// test-refusalprecheck-b.js — proof for sim-refusalprecheck-b.
//
// Fixture proof (not a policy sim): fresh day-1 setups via the shared
// sim-harness, one useAbility tap per fixture at the spandraw boundary
// position (dayTicks = 512 - ticks(cost), dayPart = floor(dayTicks/128)).
// Modes:
//   node scripts/test-refusalprecheck-b.js dump <outfile.json>
//     Record every fixture (setup assertions only, no timing verdict).
//     Run BEFORE the game change for the leg (b) baseline, and AFTER
//     for the comparison snapshot.
//   node scripts/test-refusalprecheck-b.js
//     Assert AFTER-change behaviour: refusals pre-payment (no tick, no
//     day crossing, no kcal), successes unchanged in effect/narration.
//     Exit 0 on pass, 1 on any failure.
// Fixtures (per seed): R1 challenge no-audience refusal; R2 end_it
// no-audience refusal; R3 trophy no-kills refusal; R4 challenge
// explicit-target success; R5 end_it explicit-target success;
// R6 challenge conversation-partner success; R7 end_it
// conversation-partner success; R8 trophy kills success (most-killed);
// R9 challenge once-a-day AT THE BOUNDARY: the tap lands on the NEXT day
// (payment rolls the day before the impl checks the flag), so the impl
// ACCEPTS it and stamps the new day — this is success-path, not a
// refusal, and a pre-payment day-equality check would wrongly refuse
// it (see DECISION below). R10 same for end_it. R11 challenge
// self-target refusal; R12 trophy kills + explicit passed type
// success; R13/R14 once-a-day at a NON-boundary position: the impl
// refuses post-payment (the flag matches the still-current day) —
// the documented residual: once-a-day is NOT prechecked by this arm.
//
// DECISION (from pilot data, not from the prereg's assumption): the
// once-a-day condition is evaluated against the POST-payment day, so
// it is not faithfully knowable pre-payment. A naive precheck
// (flag === current day) would refuse boundary taps the impl accepts
// (baseline R9/R10: result true, flag 1 -> 2) — a success-path
// regression under leg (b). So this arm prechecks ONLY the
// world-state conditions (audience, kills). Once-a-day stays
// post-payment, pinned by R13/R14 so it cannot silently change.
// NOTE (spandraw probe flaw this script corrects): the spandraw
// probe's "villager-targeted" attempt picks roster[0], which IS the
// scholar on fresh setup — so its targeted attempts for these two
// social keys are self-target refusals, not successes. Here the
// partner is always the first roster id that is NOT the scholar.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '9981,9982,9983,9984,9985,9986,9987,9988')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);

const COST_TICKS = { 'war_cry.challenge': 3, 'intimidating_presence.end_it_before': 3, 'trophy_room.mark': 5 };

function ticksFor(key) { return COST_TICKS[key] || 0; }

async function oneFixture(seed, fx) {
  const { Game } = await loadGame({ seed, mode: 'refusalprecheck-b', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  const v = Game.state.village || {};
  // Grant fixture (setup, recorded).
  const abs = (s.abilities || []);
  if (!abs.some((a) => (a.id || a) === fx.ability)) abs.push({ id: fx.ability, level: 1 });
  s.abilities = abs;
  if (!Game.hasAbility(fx.ability)) throw new Error('grant failed ' + fx.ability);
  try { s.kcal = Math.max(s.kcal || 0, 5000); s.health = Math.max(s.health || 0, 100); } catch (e) {}
  // Roster partner: first roster id that is NOT the scholar.
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
  // Audience / kills / flag fixtures.
  v.conv = {};
  if (fx.partner === 'explicit') { /* target passed to useAbility */ }
  else if (fx.partner === 'convo') { v.conv[partner] = { active: true }; }
  else if (fx.partner === 'self') { /* target = scholar id */ }
  if (fx.kills) Game.state.villageSlain = { deer: 2, boar: 1 };
  else Game.state.villageSlain = {};
  if (fx.flag === 'challengeDay') s.challengeDay = s.day;
  if (fx.flag === 'postureDay') s.postureDay = s.day;
  const challengeDayBefore = s.challengeDay;
  const postureDayBefore = s.postureDay;
  // Position: boundary (spandraw consistent pair) unless the fixture
  // names a literal dayTicks (R13/R14 non-boundary once-a-day).
  const pos = (fx.posTicks != null) ? fx.posTicks : 512 - ticksFor(fx.ability + '.' + fx.action);
  try { s.dayTicks = pos; s.actionClock = 0; Game.dayPart = Math.floor(pos / 128); } catch (e) {}
  const dayBefore = s.day, ticksBefore = s.dayTicks, kcalBefore = s.kcal;
  // Button-disabled-state read (precheck via _actionAvailable, target null).
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
  else if (fx.partner === 'self') target = Game.villagerId;
  let result = null, resultError = null;
  try { result = Game.useAbility(fx.ability, fx.action, target); }
  catch (e) { resultError = String(e && (e.stack || e.message)); }
  try { if (typeof origSay === 'function') Game.say = origSay; } catch (e) {}
  return {
    seed, fixture: fx.id, ability: fx.ability, action: fx.action,
    partnerKind: fx.partner, target: target == null ? null : String(target),
    dayBefore, dayAfter: s.day, dayTicksBefore: ticksBefore, dayTicksAfter: s.dayTicks,
    kcalBefore, kcalAfter: s.kcal, result, resultError,
    challengeDayBefore, challengeDayAfter: s.challengeDay,
    postureDayBefore, postureDayAfter: s.postureDay,
    availOk: avail ? !!avail.ok : null, availWhy: avail ? String(avail.why || '') : null,
    sayLines,
  };
}

const FIXTURES = [
  { id: 'R1', ability: 'war_cry', action: 'challenge', partner: 'none', expect: 'refuse-audience' },
  { id: 'R2', ability: 'intimidating_presence', action: 'end_it_before', partner: 'none', expect: 'refuse-audience' },
  { id: 'R3', ability: 'trophy_room', action: 'mark', partner: 'none', expect: 'refuse-nokills' },
  { id: 'R4', ability: 'war_cry', action: 'challenge', partner: 'explicit', expect: 'success' },
  { id: 'R5', ability: 'intimidating_presence', action: 'end_it_before', partner: 'explicit', expect: 'success' },
  { id: 'R6', ability: 'war_cry', action: 'challenge', partner: 'convo', expect: 'success' },
  { id: 'R7', ability: 'intimidating_presence', action: 'end_it_before', partner: 'convo', expect: 'success' },
  { id: 'R8', ability: 'trophy_room', action: 'mark', partner: 'none', kills: true, expect: 'success' },
  { id: 'R9', ability: 'war_cry', action: 'challenge', partner: 'explicit', flag: 'challengeDay', expect: 'success-boundary-onceaday' },
  { id: 'R10', ability: 'intimidating_presence', action: 'end_it_before', partner: 'explicit', flag: 'postureDay', expect: 'success-boundary-onceaday' },
  { id: 'R11', ability: 'war_cry', action: 'challenge', partner: 'self', expect: 'refuse-audience' },
  { id: 'R12', ability: 'trophy_room', action: 'mark', partner: 'explicit', kills: true, expect: 'success' },
  { id: 'R13', ability: 'war_cry', action: 'challenge', partner: 'explicit', flag: 'challengeDay', posTicks: 100, expect: 'refuse-postpay-onceaday' },
  { id: 'R14', ability: 'intimidating_presence', action: 'end_it_before', partner: 'explicit', flag: 'postureDay', posTicks: 100, expect: 'refuse-postpay-onceaday' },
];

const REFUSAL_SENTENCE = {
  'refuse-audience-war_cry': 'A challenge needs someone to challenge',
  'refuse-audience-intimidating_presence': 'Posturing needs an audience',
  'refuse-nokills': 'no kills recorded yet',
  'refuse-onceaday-war_cry': 'You already threw down a challenge today',
  'refuse-onceaday-intimidating_presence': 'You already threw your weight around today',
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
      console.log(`${r.fixture} seed=${seed} ${r.ability}.${r.action} partner=${r.partnerKind} result=${r.result} day=${r.dayBefore}->${r.dayAfter} ticks=${r.dayTicksBefore}->${r.dayTicksAfter} kcal=${r.kcalBefore}->${r.kcalAfter} availOk=${r.availOk}`);
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
  // Assert mode (post-change behaviour).
  const failures = [];
  for (const r of rows) {
    const say = r.sayLines.join('\n');
    if (r.expect === 'refuse-postpay-onceaday') {
      // Residual, pinned: non-boundary once-a-day still refuses AFTER
      // payment (ticks consumed, day unchanged, sentence present, flag kept).
      if (r.result !== false) failures.push(`${r.fixture} seed=${r.seed}: non-boundary once-a-day should refuse, got ${r.result}`);
      if (r.dayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: non-boundary once-a-day crossed day`);
      if (r.dayTicksAfter === r.dayTicksBefore) failures.push(`${r.fixture} seed=${r.seed}: non-boundary once-a-day should still pay ticks (residual), ticks unchanged`);
      // Residual cost, pinned: the post-payment refusal ALSO burns the
      // foodPower tier injection (40 kcal at level 1) silently — the
      // payActionCost wrapper deducts before dispatch, and the
      // useAbility wrapper only suppresses the burn NARRATION on
      // result===false. (The "refused tap never burns" comment in
      // foodPower.js holds only for precheck refusals, which return
      // before payActionCost.) Pre-payment refusals pay none of this.
      if (r.kcalAfter !== r.kcalBefore - 40) failures.push(`${r.fixture} seed=${r.seed}: non-boundary once-a-day should still burn the silent 40 kcal tier cost, got ${r.kcalBefore}->${r.kcalAfter}`);
      const sentence = REFUSAL_SENTENCE['refuse-onceaday-' + r.ability];
      if (!say.includes(sentence)) failures.push(`${r.fixture} seed=${r.seed}: once-a-day sentence missing (${sentence})`);
    } else if (r.expect === 'success-boundary-onceaday') {
      // Boundary once-a-day: the tap lands on the next day, so it is
      // that day's challenge/posture — success, flag stamped to the NEW day.
      if (r.result !== true) failures.push(`${r.fixture} seed=${r.seed}: boundary once-a-day should succeed (new day), got ${r.result}`);
      if (r.dayAfter !== r.dayBefore + 1) failures.push(`${r.fixture} seed=${r.seed}: boundary once-a-day did not cross day`);
      if (!say.includes(SUCCESS_MARK[r.ability])) failures.push(`${r.fixture} seed=${r.seed}: boundary once-a-day success narration missing`);
      if (r.ability === 'war_cry' && r.challengeDayAfter !== r.dayAfter) failures.push(`${r.fixture} seed=${r.seed}: boundary challenge flag should stamp new day ${r.dayAfter}, got ${r.challengeDayAfter}`);
      if (r.ability === 'intimidating_presence' && r.postureDayAfter !== r.dayAfter) failures.push(`${r.fixture} seed=${r.seed}: boundary posture flag should stamp new day ${r.dayAfter}, got ${r.postureDayAfter}`);
    } else if (r.expect.startsWith('refuse')) {
      if (r.result !== false) failures.push(`${r.fixture} seed=${r.seed}: refusal fixture returned ${r.result}`);
      if (r.dayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: refusal crossed day ${r.dayBefore}->${r.dayAfter}`);
      if (r.dayTicksAfter !== r.dayTicksBefore) failures.push(`${r.fixture} seed=${r.seed}: refusal consumed ticks ${r.dayTicksBefore}->${r.dayTicksAfter}`);
      if (r.kcalAfter !== r.kcalBefore) failures.push(`${r.fixture} seed=${r.seed}: refusal changed kcal ${r.kcalBefore}->${r.kcalAfter}`);
      const key = r.expect === 'refuse-nokills' ? 'refuse-nokills'
        : r.expect + '-' + r.ability;
      const sentence = REFUSAL_SENTENCE[key];
      if (!say.includes(sentence)) failures.push(`${r.fixture} seed=${r.seed}: refusal sentence missing (${sentence}); say tail: ${r.sayLines.slice(-3).join(' | ').slice(0, 300)}`);
      if (r.fixture === 'R1' || r.fixture === 'R3') {
        if (r.availOk !== false) failures.push(`${r.fixture} seed=${r.seed}: button should be disabled (availOk=${r.availOk})`);
      }
    } else {
      if (r.result !== true) failures.push(`${r.fixture} seed=${r.seed}: success fixture returned ${r.result}`);
      if (r.dayAfter !== r.dayBefore + 1) failures.push(`${r.fixture} seed=${r.seed}: success did not cross day ${r.dayBefore}->${r.dayAfter}`);
      if (!say.includes(SUCCESS_MARK[r.ability])) failures.push(`${r.fixture} seed=${r.seed}: success narration missing (${SUCCESS_MARK[r.ability]}); say tail: ${r.sayLines.slice(-3).join(' | ').slice(0, 300)}`);
      if (r.ability === 'war_cry' && r.challengeDayAfter !== r.dayAfter) failures.push(`${r.fixture} seed=${r.seed}: challenge success did not set challengeDay`);
      if (r.ability === 'intimidating_presence' && r.postureDayAfter !== r.dayAfter) failures.push(`${r.fixture} seed=${r.seed}: posture success did not set postureDay`);
    }
  }
  if (failures.length) {
    console.log('FAILURES (' + failures.length + '):');
    for (const f of failures) console.log('  - ' + f);
    process.exit(1);
  }
  console.log('PASS: all ' + rows.length + ' fixtures behave as pre-registered (with the documented once-a-day decision)');
})().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
