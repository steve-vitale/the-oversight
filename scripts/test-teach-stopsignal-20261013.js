#!/usr/bin/env node
// test-teach-stopsignal-20261013.js — proof for the redundant-teaching stop
// signal (longsim tedium lever C, 2026-10-13).
//
// Lever: teaching a plant the scholar already knows at L1 (the name — the only
// level Game.teachPlant ever teaches) becomes an explicit no-op with
// in-fiction feedback, instead of a counted teaching act that burns a
// deliberate verb, ticks, trust, and encounters for zero codex movement.
// Policy: competent.js teachRound checks Game.plantKnown(pid) BEFORE offering.
//
// Asserted:
//   1. REDUNDANT: scholar knows L1 + teacher knows -> teachPlant returns null,
//      says the stop-signal line (a person deflecting, relationship intact),
//      and changes NOTHING: encounters, trust, codex entry, day ticks.
//   2. UNKNOWN: scholar doesn't know -> teaches normally (good teacher lands
//      the identification, returns true).
//   3. PARTIAL: scholar has encounters but no name -> NOT redundant; the
//      lesson proceeds (encounters tick up).
//   4. WRONG-TEACHING preserved: scholar knows L1 + teacher is wrong about it
//      -> the lie-counterplay still fires ('taught-wrong'), not the stop
//      signal. A false lesson is not a redundant lesson (canon).
//   5. POLICY: the shipped teachRound (extracted from competent.js source)
//      makes ZERO teachPlant calls when the scholar already knows the plants,
//      and still offers when the scholar doesn't.
//   6. SENSE: the feedback line is printed for human reading.
//
// Usage: node scripts/test-teach-stopsignal-20261013.js   (exit 0 = green)
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const ROOT = path.join(__dirname, '..');

(async () => {
  const { Game } = await loadGame({ seed: 424242, mode: 'test', fullTelemetry: false });
  await setupGame(Game);

  const says = [];
  const origSay = Game.say;
  Game.say = function (t) { says.push(String(t)); try { return origSay.call(this, t); } catch (e) {} };

  const plants = Game.data.plants || [];
  assert(plants.length >= 4, 'need at least 4 plants in data');
  const P = plants[0], Q = plants[1], R = plants[2], W = plants[3];

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  assert(roster.length > 0, 'need villagers');
  const vid = roster[0];
  const person = Game.getPerson(vid);
  // deterministic teaching setup: shared fluent english, good-teacher occupation
  person.languages = ['english'];
  person.formerOccupation = 'cook';
  Game.state.scholar.languages = ['english'];
  Game.state.scholar.englishLevel = 2;
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 50;
  assert.strictEqual(Game.commLevel(vid).level, 'full', 'test setup: full comm');
  // teacher knows all four plants
  for (const p of [P, Q, R, W]) Game.villagerLearnsPlant(vid, p.id, 'taught');
  assert(Game.plantKnownBy(vid, P.id), 'test setup: teacher knows P');

  const encOf = (pid) => (Game.state.codex.encounters || {})[pid] || 0;
  const trustOf = () => (Game.state.village.trust || {})[vid] || 0;
  const entryOf = (pid) => JSON.stringify((Game.state.codex.plants || {})[pid] || null);

  // ---------- 1. REDUNDANT: scholar already knows L1 ----------
  Game.identifyPlant(P.id, 'discovery');
  assert(Game.plantKnown(P.id), 'test setup: scholar knows P');
  says.length = 0;
  const encBefore = encOf(P.id), trustBefore = trustOf(), entryBefore = entryOf(P.id);
  const ticksBefore = Game.state.scholar.dayTicks;
  const r1 = Game.teachPlant(vid, P.id);
  assert.strictEqual(r1, null, 'redundant teach returns null (no lesson)');
  const line1 = says.join('\n');
  assert(/already showed you this one/.test(line1), 'stop-signal line said: ' + line1);
  assert(!/TEACH_FAILED|redundant|no-op/i.test(line1), 'no system-error energy: ' + line1);
  assert.strictEqual(encOf(P.id), encBefore, 'encounters untouched');
  assert.strictEqual(trustOf(), trustBefore, 'trust untouched (no farm, no damage)');
  assert.strictEqual(entryOf(P.id), entryBefore, 'codex entry untouched');
  assert.strictEqual(Game.state.scholar.dayTicks, ticksBefore, 'no ticks consumed');
  console.log('1. redundant -> no-op + line:');
  console.log('   ' + says[says.length - 1]);

  // ---------- 2. UNKNOWN: teaches normally ----------
  assert(!Game.plantKnown(Q.id), 'test setup: scholar does not know Q');
  says.length = 0;
  const r2 = Game.teachPlant(vid, Q.id);
  assert.strictEqual(r2, true, 'real lesson returns true');
  assert(Game.plantKnown(Q.id), 'scholar now knows Q (L1 landed)');
  assert(/IDENTIFIED/.test(says.join('\n')), 'identification narrated');

  // ---------- 3. PARTIAL: encounters but no name -> not redundant ----------
  Game.state.codex.encounters = Game.state.codex.encounters || {};
  Game.state.codex.encounters[R.id] = 1;
  assert(!Game.plantKnown(R.id), 'test setup: R not yet named');
  // non-good teacher so we exercise the encounters path deterministically
  person.formerOccupation = 'accountant';
  Game.state.village.trust[vid] = 10;
  says.length = 0;
  const r3 = Game.teachPlant(vid, R.id);
  const line3 = says.join('\n');
  assert(!/already showed you this one/.test(line3), 'partial progress is NOT waved off: ' + line3);
  assert.strictEqual(r3, true, 'partial lesson proceeds');
  assert(encOf(R.id) > 1, 'encounters ticked up toward identification');
  // restore good-teacher setup
  person.formerOccupation = 'cook';
  Game.state.village.trust[vid] = 50;

  // ---------- 4. WRONG-TEACHING preserved (lie counterplay, not redundancy) --
  // scholar knows W at L1 (true name); teacher is wrong about it.
  Game.identifyPlant(W.id, 'discovery');
  assert(Game.plantKnown(W.id), 'test setup: scholar knows W');
  Game.state.village.wrongAbout = Game.state.village.wrongAbout || {};
  Game.state.village.wrongAbout[vid] = Game.state.village.wrongAbout[vid] || {};
  Game.state.village.wrongAbout[vid][W.id] = { wrongPid: P.id, deliberate: false };
  says.length = 0;
  const r4 = Game.teachPlant(vid, W.id);
  const line4 = says.join('\n');
  assert.strictEqual(r4, 'taught-wrong', 'L1 scholar can still be fooled (canon): got ' + r4);
  assert(!/already showed you this one/.test(line4), 'lie is not waved off as redundant');

  // ---------- 5. POLICY: shipped teachRound respects the stop signal --------
  const src = fs.readFileSync(path.join(ROOT, 'scripts/policies/competent.js'), 'utf8');
  const startMarker = 'function teachRound(Game, ctx) {';
  const start = src.indexOf(startMarker);
  assert(start !== -1, 'teachRound found in competent.js');
  let depth = 0, end = -1;
  for (let i = start + startMarker.length - 1; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  assert(end !== -1, 'teachRound body extracted');
  const body = src.slice(src.indexOf('{', start) + 1, end - 1);
  const teachRound = new Function('Game', 'ctx', body); // eslint-disable-line no-new-func

  const calls = [];
  const stubScholarKnows = {
    state: { codex: { plants: { p1: { level: 1 } } },
             village: { roster: ['v1', 'v2'], plantKnowledge: { v1: [], v2: [] } } },
    villagerId: 'scholar',
    plantKnown: () => true, // scholar already knows everything offered
    teachPlant: (v, p) => { calls.push([v, p]); return null; },
  };
  teachRound(stubScholarKnows, {});
  assert.strictEqual(calls.length, 0, 'policy offers ZERO teaches for scholar-known plants');

  const calls2 = [];
  const stubScholarNew = {
    state: { codex: { plants: { p1: { level: 1 } } },
             village: { roster: ['v1'], plantKnowledge: { v1: [] } } },
    villagerId: 'scholar',
    plantKnown: () => false, // scholar knows nothing -> guard passes through
    teachPlant: (v, p) => { calls2.push([v, p]); return null; },
  };
  teachRound(stubScholarNew, {});
  assert(calls2.length > 0, 'guard does not over-block: offers when scholar is ignorant');

  console.log('2. unknown -> taught normally (IDENTIFIED)');
  console.log('3. partial encounters -> lesson proceeds, encounters ' + encOf(R.id));
  console.log('4. wrong-teaching preserved: taught-wrong still fires at L1');
  console.log('5. policy: 0 calls when scholar knows; ' + calls2.length + ' call(s) when ignorant');
  console.log('\nALL GREEN');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
