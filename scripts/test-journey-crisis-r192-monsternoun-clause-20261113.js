#!/usr/bin/env node
'use strict';
// Proof: monsterNoun clause-verb gap (journey-crisis r192, F4 — found
// on the r192 pilot panel: seed 14432 d8/d9, Cole Nguyen).
// RED: monsterNoun('living_wire') returns 'creek went still' — the head
// of the monster's unknown descriptor ("the creek went still, and your
// arm-hairs stood up, ..."). The raid-memory planter (game.js) composes
// it as a name, so villagers say "I put down creek went still at the
// treeline" — a sentence fragment where a name belongs. Compare the same
// panel's honest line: "I put down Big-Bane at the treeline."
// ROOT CAUSE: monsterNoun's prose-clause guard (game.js ~23160) falls
// back to 'something' when the head contains a finite verb — but its
// verb list only covers be/have/do/modal forms (am/is/are/was/were/has/
// have/had/do/does/did/will/would/shall/should/can/could/may/might/
// must). Past-tense action verbs — went, came, stood, moved, ran, fell
// — slip through, so clause heads like "creek went still" survive as
// nouns. The comma rule already truncates the tail; the verb check is
// the only guard left, and it misses this class.
// GREEN (post-fix): living_wire's noun is 'something' (dread, not
// grammar — the established fallback), and NO monster's pre-naming noun
// contains a clause verb. Proper/village names are exempt by design
// (they keep casing; the check only applies to lowercase descriptors).
// The audit loop pins the whole class, not just this one monster.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

// Clause verbs: the finite forms monsterNoun's guard must catch. The
// first three are the be/have/do forms it already catches (regression
// guard); the rest are the past-tense action verbs this fix adds.
const CLAUSE_VERBS = [
  'am', 'is', 'are', 'was', 'were', 'has', 'have', 'had',
  'do', 'does', 'did', 'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must',
  'went', 'came', 'stood', 'moved', 'ran', 'fell', 'rose', 'sank',
  'crept', 'crawled', 'walked', 'stopped', 'started', 'turned',
  'looked', 'sounded', 'smelled', 'felt', 'hung', 'lay', 'sat',
];
const VERB_RE = new RegExp('\\b(' + CLAUSE_VERBS.join('|') + ')\\b', 'i');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  // Pre-naming state: no village name, System has not arrived — the
  // descriptor path is live.
  Game.state.systemArrived = false;
  if (Game.state.codex) Game.state.codex.monsters = {};

  const noun = Game.monsterNoun('living_wire');
  console.log(`monsterNoun('living_wire') = ${JSON.stringify(noun)}`);
  check('living_wire is not a clause fragment', noun === 'something', 'got ' + JSON.stringify(noun));

  // Class audit: every monster's pre-naming noun must be a noun phrase,
  // never a clause. Proper-cased results are names (exempt by design).
  // The check reads only the HEAD before the first relative marker
  // (where/when/that/who/which/whose) — exactly monsterNoun's own
  // scoping: a verb inside a relative clause is a genuine noun phrase
  // ("church where the hymns are static"), not a clause.
  const defs = Game.data.monsters || [];
  check('monster defs load', defs.length > 10, 'got ' + defs.length);
  const bad = [];
  for (const m of defs) {
    const n = Game.monsterNoun(m.id);
    if (!n || typeof n !== 'string') continue;
    if (n.charAt(0) === n.charAt(0).toUpperCase()) continue; // proper name
    const head = n.split(/\b(where|when|that|who|which|whose)\b/i)[0];
    if (VERB_RE.test(head)) bad.push(m.id + ' => ' + JSON.stringify(n));
  }
  console.log('clause-verb nouns found: ' + (bad.length ? '\n  ' + bad.join('\n  ') : 'none'));
  check('no pre-naming noun contains a clause verb', bad.length === 0, bad.slice(0, 5).join('; '));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
