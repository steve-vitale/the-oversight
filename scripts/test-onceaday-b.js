#!/usr/bin/env node
// test-onceaday-b.js — proof for sim-onceaday-b.
//
// Fixture proof (not a policy sim): fresh day-1 setups via the shared
// sim-harness, one useAbility tap per fixture. Modes:
//   node scripts/test-onceaday-b.js dump <outfile.json>
//     Record every fixture (no timing verdict). Run BEFORE the game
//     change for the baseline, and AFTER for the comparison snapshot.
//   node scripts/test-onceaday-b.js
//     Assert AFTER-change behaviour: non-boundary once-a-day taps
//     refuse PRE-payment (no tick, no day crossing, no kcal); boundary
//     taps succeed unchanged; prior-arm fixtures invariant.
//     Exit 0 on pass, 1 on any failure.
// Fixtures (per seed): R1-R14 as in test-refusalprecheck-b.js, plus:
// R15/R16 once-a-day at dayTicks 508 (one tick short of the roll:
// 508+3 = 511, payment cannot roll the day) with a conversation
// partner — must refuse PRE-payment, and the button read (which
// resolves the audience via the conversation partner) must read
// disabled with the once-a-day reason. R17/R18 no flag set at 508 —
// must succeed WITHOUT crossing the day (flag stamps the current
// day), proving the precheck does not refuse when the flag is unset.
// R19/R20 once-a-day at the 509 boundary with a conversation
// partner — must succeed (payment rolls the day) AND the button
// read must be enabled (the day-roll-aware leg, not a naive
// flag===day check, which would disable these buttons).
//
// DAY-ROLL PREDICTOR (see the prereg): both actions cost
// {time_min: 5} -> 3 ticks; the day rolls iff dayTicks+3 >= 512
// (and no tbfight/_ticking/over). So 509 rolls, 508 does not.
// NOTE on the button probe: _actionAvailable always calls the
// precheck with target=null, so for explicit-target fixtures the
// probe reads disabled for AUDIENCE reasons (cleared conversation),
// not once-a-day reasons — the prior arm's known artifact. The
// once-a-day button state is therefore asserted only on
// conversation-partner fixtures (R15/R16/R19/R20), where the probe
// resolves the audience and the once-a-day leg decides.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '9981,9982,9983,9984,9985,9986,9987,9988')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);

const COST_TICKS = { 'war_cry.challenge': 3, 'intimidating_presence.end_it_before': 3, 'trophy_room.mark': 5 };

function ticksFor(key) { return COST_TICKS[key] || 0; }

async function oneFixture(seed, fx) {
  const { Game } = await loadGame({ seed, mode: 'onceaday-b', fullTelemetry: false });
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
  { id: 'R13', ability: 'war_cry', action: 'challenge', partner: 'explicit', flag: 'challengeDay', posTicks: 100, expect: 'refuse-prepay-onceaday' },
  { id: 'R14', ability: 'intimidating_presence', action: 'end_it_before', partner: 'explicit', flag: 'postureDay', posTicks: 100, expect: 'refuse-prepay-onceaday' },
  { id: 'R15', ability: 'war_cry', action: 'challenge', partner: 'convo', flag: 'challengeDay', posTicks: 508, expect: 'refuse-prepay-onceaday' },
  { id: 'R16', ability: 'intimidating_presence', action: 'end_it_before', partner: 'convo', flag: 'postureDay', posTicks: 508, expect: 'refuse-prepay-onceaday' },
  { id: 'R17', ability: 'war_cry', action: 'challenge', partner: 'explicit', posTicks: 508, expect: 'success-nocross' },
  { id: 'R18', ability: 'intimidating_presence', action: 'end_it_before', partner: 'explicit', posTicks: 508, expect: 'success-nocross' },
  { id: 'R19', ability: 'war_cry', action: 'challenge', partner: 'convo', flag: 'challengeDay', posTicks: 509, expect: 'success-boundary-onceaday' },
  { id: 'R20', ability: 'intimidating_presence', action: 'end_it_before', partner: 'convo', flag: 'postureDay', posTicks: 509, expect: 'success-boundary-onceaday' },
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
    if (r.expect === 'refuse-prepay-onceaday') {
      // THE ARM: non-boundary once-a-day refuses BEFORE payment —
      // day, ticks, and kcal all unchanged, sentence present, flag kept.
      if (r.result !== false) failures.push(`${r.fixture} seed=${r.seed}: non-boundary once-a-day should refuse, got ${r.result}`);
      if (r.dayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: non-boundary once-a-day crossed day`);
      if (r.dayTicksAfter !== r.dayTicksBefore) failures.push(`${r.fixture} seed=${r.seed}: non-boundary once-a-day paid ticks ${r.dayTicksBefore}->${r.dayTicksAfter}`);
      if (r.kcalAfter !== r.kcalBefore) failures.push(`${r.fixture} seed=${r.seed}: non-boundary once-a-day burned kcal ${r.kcalBefore}->${r.kcalAfter}`);
      const sentence = REFUSAL_SENTENCE['refuse-onceaday-' + r.ability];
      if (!say.includes(sentence)) failures.push(`${r.fixture} seed=${r.seed}: once-a-day sentence missing (${sentence})`);
      // Button state, conversation-partner fixtures only (explicit
      // fixtures read disabled for audience reasons — see header).
      if (r.partnerKind === 'convo') {
        if (r.availOk !== false) failures.push(`${r.fixture} seed=${r.seed}: button should be disabled for once-a-day (availOk=${r.availOk})`);
        if (!(r.availWhy || '').includes(sentence)) failures.push(`${r.fixture} seed=${r.seed}: button reason should be the once-a-day sentence, got: ${(r.availWhy || '').slice(0, 120)}`);
      }
    } else if (r.expect === 'success-boundary-onceaday') {
      // Boundary once-a-day: the tap lands on the next day, so it is
      // that day's challenge/posture — success, flag stamped to the NEW day.
      if (r.result !== true) failures.push(`${r.fixture} seed=${r.seed}: boundary once-a-day should succeed (new day), got ${r.result}`);
      if (r.dayAfter !== r.dayBefore + 1) failures.push(`${r.fixture} seed=${r.seed}: boundary once-a-day did not cross day`);
      if (!say.includes(SUCCESS_MARK[r.ability])) failures.push(`${r.fixture} seed=${r.seed}: boundary once-a-day success narration missing`);
      if (r.ability === 'war_cry' && r.challengeDayAfter !== r.dayAfter) failures.push(`${r.fixture} seed=${r.seed}: boundary challenge flag should stamp new day ${r.dayAfter}, got ${r.challengeDayAfter}`);
      if (r.ability === 'intimidating_presence' && r.postureDayAfter !== r.dayAfter) failures.push(`${r.fixture} seed=${r.seed}: boundary posture flag should stamp new day ${r.dayAfter}, got ${r.postureDayAfter}`);
      // Button state, conversation-partner fixtures only: the
      // day-roll-aware precheck must NOT disable a boundary tap.
      if (r.partnerKind === 'convo' && r.availOk !== true) failures.push(`${r.fixture} seed=${r.seed}: boundary button should be enabled (availOk=${r.availOk}, why=${(r.availWhy || '').slice(0, 120)})`);
    } else if (r.expect === 'success-nocross') {
      // No flag set, one tick short of the roll: success on the SAME
      // day, flag stamped to the current day, 3 ticks + 40 kcal tier burn.
      if (r.result !== true) failures.push(`${r.fixture} seed=${r.seed}: no-flag 508 tap should succeed, got ${r.result}`);
      if (r.dayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: no-flag 508 tap crossed day ${r.dayBefore}->${r.dayAfter}`);
      if (r.dayTicksAfter !== r.dayTicksBefore + 3) failures.push(`${r.fixture} seed=${r.seed}: no-flag 508 tap ticks ${r.dayTicksBefore}->${r.dayTicksAfter}, expected +3`);
      if (r.kcalAfter !== r.kcalBefore - 40) failures.push(`${r.fixture} seed=${r.seed}: no-flag 508 tap kcal ${r.kcalBefore}->${r.kcalAfter}, expected -40 tier burn`);
      if (!say.includes(SUCCESS_MARK[r.ability])) failures.push(`${r.fixture} seed=${r.seed}: no-flag 508 success narration missing`);
      if (r.ability === 'war_cry' && r.challengeDayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: no-flag 508 challenge flag should stamp current day ${r.dayBefore}, got ${r.challengeDayAfter}`);
      if (r.ability === 'intimidating_presence' && r.postureDayAfter !== r.dayBefore) failures.push(`${r.fixture} seed=${r.seed}: no-flag 508 posture flag should stamp current day ${r.dayBefore}, got ${r.postureDayAfter}`);
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
  console.log('PASS: all ' + rows.length + ' fixtures behave as pre-registered (day-roll-aware once-a-day precheck)');
})().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
