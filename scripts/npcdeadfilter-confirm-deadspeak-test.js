#!/usr/bin/env node
// npcdeadfilter-confirm-deadspeak-test.js — proof for the
// DEAD-NEVER-SPEAK-CLOSED fix in src/js/ledger.js playerDeath
// (sim-npcdeadfilter-confirm follow-up hole, found by the
// corrupt-roster band: a dead id pushed onto the roster spoke
// the succession lines, because closeId and the grave vouchers
// read trust keys ∩ roster membership, not npcIds()).
//
// Must be RED pre-fix, GREEN post-fix. Live harness only (seed 42):
//   D1. Dead top-trust victim X on the roster + driven playerDeath:
//       pre-fix, X delivers the "you're not her" close line AND
//       vouches at the grave; post-fix, no line names X.
//   D2. Living guardrail: a LIVING high-trust id L still delivers
//       both lines on the next driven playerDeath (the fix must not
//       silence living speakers).
// Victims/speakers are picked with unique first names on the roster
// so a line naming X can only mean X spoke.
// Usage: node scripts/npcdeadfilter-confirm-deadspeak-test.js
// Exit 0 on all green, 1 on any failure.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0, skipped = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('PASS: ' + label); }
  else { fail++; console.log('FAIL: ' + label); }
}
function skip(label) { skipped++; console.log('SKIP: ' + label); }

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  v.trust = v.trust || {};

  const sayLines = [];
  const origSay = Game.say;
  Game.say = function () {
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string') sayLines.push(String(arg));
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  // TRUE names come from the villagers record, NOT displayName: the
  // harness starts knowledge-gated, so displayName returns descriptors
  // ("A person, maybe 40s...") while the succession lines use the
  // record's real name. Same source the lines themselves use.
  function firstName(id) {
    try {
      const rec = (Game.data.villagers || []).find(function (r) { return r.id === id; });
      if (rec && rec.name) return String(rec.name).split(' ')[0];
      const n = Game.displayName ? Game.displayName(id) : id;
      return String(n).split(' ')[0];
    } catch (e) { return id; }
  }
  function isDead(id) {
    try { if (Game.deadMarked && Game.deadMarked(id)) return true; } catch (e) {}
    try {
      const vr = (Game.data.villagers || []).find(function (r) { return r.id === id; });
      if (vr && vr.dead) return true;
      const br = (Game.data.background_survivors || []).find(function (r) { return r.id === id; });
      if (br && br.dead) return true;
      const vp = Game.vpOf ? Game.vpOf(id) : null;
      if (vp && vp.dead) return true;
    } catch (e) {}
    return false;
  }
  function hasPhoenix(id) {
    try { return !!(Game.npcHasAbility && Game.npcHasAbility(id, 'phoenix_clause')); } catch (e) { return false; }
  }
  // Only the SUBJECT's first name must be unique on the roster: the
  // succession lines name the speaker by first name only, so a line
  // naming X's first name means X spoke iff no other roster id shares
  // that first name. (Whole-roster uniqueness does NOT hold on seed 42.)
  function firstNameIsUnique(id) {
    const fn = firstName(id);
    return (v.roster || []).filter(function (r) { return firstName(r) === fn; }).length === 1;
  }
  function zeroTrusts() { for (const id of (v.roster || [])) v.trust[id] = 0; }

  const roster = (v.roster || []).slice();
  const living = roster.filter(function (id) { return id !== Game.villagerId && !isDead(id) && !hasPhoenix(id); });
  ok(living.length >= 3, 'setup: at least 3 living non-bearer, non-phoenix roster ids (got ' + living.length + ')');
  const uniqueLiving = living.filter(function (id) { return firstNameIsUnique(id); });
  ok(uniqueLiving.length >= 1, 'setup: at least 1 living candidate with a unique first name (got ' + uniqueLiving.length + ')');
  if (living.length < 3 || !uniqueLiving.length) {
    console.log(`\nnpcdeadfilter-confirm-deadspeak-test: ${pass} passed, ${fail} failed, ${skipped} skipped`);
    process.exit(1);
  }

  // D1: dead victim with top trust.
  const X = uniqueLiving[0];
  const xFirst = firstName(X);
  zeroTrusts();
  Game.removeVillager(X, 'killed');
  ok(isDead(X), 'D1: victim is deadMarked after kill (victim=' + X + ' / ' + xFirst + ')');
  if ((v.roster || []).indexOf(X) < 0) v.roster.push(X);
  v.trust[X] = 100;
  sayLines.length = 0;
  Game.playerDeath('test-deadspeak-d1');
  const closeSpokenByX = sayLines.some(function (l) { return /looks at you for a long moment/.test(l) && l.indexOf(xFirst) >= 0; });
  const graveSpokenByX = sayLines.some(function (l) { return /^At the grave,/.test(l) && l.indexOf(xFirst) >= 0; });
  ok(!closeSpokenByX, 'D1: dead victim does NOT deliver the "you\'re not her" line (spoke=' + closeSpokenByX + ')');
  ok(!graveSpokenByX, 'D1: dead victim does NOT vouch at the grave (spoke=' + graveSpokenByX + ')');
  ok(!isDead(Game.villagerId), 'D1: successor is living (bearer=' + Game.villagerId + ')');

  // D2: living guardrail — a living high-trust id still speaks both lines.
  // The speaker must NOT be the successor (close/voucher filters exclude
  // newId), so set TWO living ids high: S at 100 inherits, L at 90 speaks.
  const livingNow = (v.roster || []).filter(function (id) { return id !== Game.villagerId && !isDead(id); });
  const L = livingNow.filter(function (id) { return firstNameIsUnique(id); })[0];
  const S = livingNow.filter(function (id) { return id !== L; })[0];
  if (!L || !S) { console.log('FAIL: D2 setup: need a speaker L and a successor S'); process.exit(1); }
  const lFirst = firstName(L);
  zeroTrusts();
  v.trust[S] = 100;
  v.trust[L] = 90;
  sayLines.length = 0;
  Game.playerDeath('test-deadspeak-d2');
  ok(Game.villagerId === S, 'D2: the 100-trust living id inherits (successor=' + firstName(Game.villagerId) + ')');
  const closeSpokenByL = sayLines.some(function (l) { return /looks at you for a long moment/.test(l) && l.indexOf(lFirst) >= 0; });
  const graveSpokenByL = sayLines.some(function (l) { return /^At the grave,/.test(l) && l.indexOf(lFirst) >= 0; });
  ok(closeSpokenByL, 'D2: living high-trust id DOES deliver the close line (speaker=' + lFirst + ', spoke=' + closeSpokenByL + ')');
  ok(graveSpokenByL, 'D2: living high-trust id DOES vouch at the grave (speaker=' + lFirst + ', spoke=' + graveSpokenByL + ')');

  console.log(`\nnpcdeadfilter-confirm-deadspeak-test: ${pass} passed, ${fail} failed, ${skipped} skipped`);
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
