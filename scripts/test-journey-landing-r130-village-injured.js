#!/usr/bin/env node
'use strict';
// Proof: ask:village "How are the injured doing?" gets an injured answer
// (journey-landing r130, D3 — filed r129, reproduced r130 panel 1150 d6).
// The question is the medicinal-occupation label for ask:village, but
// convoVillageLine composed the answer from grief/cheer/hunger/fear/heat
// bits only — no injured bit existed. On 1150 d6 the only live bit was
// leadership heat, so the injured question was answered with
// "Honestly? there's tension about who's in charge."
// RED (unfixed): the returned line never names the injured, in either
// state — hurt villagers present, or nobody hurt.
// GREEN (post-fix): the injured status leads the line — a hurt count when
// anyone is sick (v.sick) or low-health (v.health < 100, the combat-wound
// pool), "nobody's injured right now" when nobody is hurt and other news
// exists; on a quiet day with no live bits the temperament idle pool still
// answers (no injured text). The scholar's own health never counts.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  const v = Game.state.village;
  const scholarId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== scholarId);
  assert(roster.length >= 3, 'need 3+ villagers besides the scholar, got ' + roster.length);
  const speaker = roster[0];
  const [sickOne, hurtOne, plainOne] = roster;
  console.log(`speaker=${Game.displayName(speaker)} roster=${roster.length}`);

  // Fresh village state per case; clear the per-sitting repeat ledger so
  // the dedupe fallback (idle lines on a repeated raw line) never fires.
  function lineFor(setup) {
    v.grief = 0; v.cheer = 0; v.heat = {}; v.sick = {}; v.health = {};
    setup();
    const c = Game.convoGet(speaker);
    c.said = c.said || {};
    c.said.villagelines = [];
    const line = Game.convoVillageLine(speaker);
    assert(typeof line === 'string' && line.length > 0, 'convoVillageLine returned nothing');
    return line;
  }

  // 1. Two hurt (one sick, one low-health) + tension: hurt count leads.
  let line = lineFor(() => {
    v.sick = { [sickOne]: { severity: 1, daysLeft: 3 } };
    v.health = { [hurtOne]: 60 };
    v.heat = { a: 1 };
  });
  check('hurt-2 leads before tension', /2 people are injured/.test(line) && line.indexOf('2 people are injured') < line.indexOf("tension about who's in charge"), line);
  // 2. Nobody hurt + tension: the zero state is named, before the tension.
  line = lineFor(() => { v.heat = { a: 1 }; });
  check('nobody-hurt named before tension', /nobody's injured right now/.test(line) && line.indexOf("nobody's injured right now") < line.indexOf("tension about who's in charge"), line);
  // 3. One sick only: singular.
  line = lineFor(() => { v.sick = { [sickOne]: { severity: 1, daysLeft: 3 } }; });
  check('hurt-1 sick singular', /1 person is injured/.test(line), line);
  // 4. One low-health only: singular.
  line = lineFor(() => { v.health = { [hurtOne]: 40 }; });
  check('hurt-1 low-health singular', /1 person is injured/.test(line), line);
  // 5. Quiet day, no live bits: idle pool answers, no injured text.
  line = lineFor(() => {});
  check('quiet day keeps idle pool (no injured text)', !/injured/i.test(line) && /Honestly\?/.test(line), line);
  // 6. Grief + one hurt: both bits present, injured first.
  line = lineFor(() => {
    v.grief = 1;
    v.health = { [hurtOne]: 80 };
  });
  check('grief + hurt keeps both, injured first', /1 person is injured/.test(line) && /quiet since the loss/.test(line) && line.indexOf('1 person is injured') < line.indexOf('quiet since the loss'), line);
  // 7. Scholar's own low health never counts.
  line = lineFor(() => {
    v.health = { [scholarId]: 50 };
    v.heat = { a: 1 };
  });
  check('scholar health excluded', /nobody's injured right now/.test(line) && !/1 person is injured/.test(line), line);

  console.log(`PASS ${pass}/7 test-journey-landing-r130-village-injured`);
}

main().catch(e => { console.error('FAIL', e.message); process.exit(1); });
