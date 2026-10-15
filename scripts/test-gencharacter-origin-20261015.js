#!/usr/bin/env node
'use strict';
// test-gencharacter-origin-20261015.js — proof for the origin-default fix
// (journey deepening r12, 2026-10-15).
//
// SENSE-CAUGHT: seed 8503 day 80 — Ellis (visjoin_76, a visitor who joined)
// said: "I wonder if undefined looks like this now. Empty. Quiet."
// Root cause: visitor-invite arrival (betrayal.js) hydrates the newcomer via
// ensureRosterPerson -> genCharacter WITHOUT an origin. genCharacter's talk-
// line fill closure does replaceAll('{origin}', origin) and
// replaceAll('{city}', city) — with origin undefined, replaceAll coerces it
// to the literal string "undefined" and BAKES it into the stored talk lines
// (fillTalkLine at render can't fix it — the slot is already gone).
//
// FIX: genCharacter defaults a missing origin via npcOriginPick (every
// person is from somewhere), falling back to 'somewhere'.
//
// REAL-RED: fixture calls genCharacter with no origin (the arrival path)
// and asserts (A) person.homeRegion is a real string (not undefined), and
// (B) NO talk/backstory line contains the literal "undefined". Both fail
// pre-fix (origin undefined bakes "undefined" into talk lines).
// GREEN: both pass post-fix.
//
// Usage: node scripts/test-gencharacter-origin-20261015.js
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; fails.push(name); console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 5150, mode: 'test-gencharacter-origin-20261015' });
  if (loadFails && loadFails.length) { ok('module load', false, loadFails.join('; ')); return; }
  ok('module load', true);
  await setupGame(Game);

  // the arrival path: genCharacter WITHOUT opts.origin (several draws — the
  // {origin} templates are a subset of the talk pool, so sample broadly)
  const people = [];
  try {
    for (let i = 0; i < 8; i++) people.push(Game.genCharacter({ usedNames: new Set() }));
  } catch (e) { ok('genCharacter runs originless', false, e.message); return; }
  ok('genCharacter runs originless', people.every(Boolean));

  const badRegion = people.filter(p => !(typeof p.homeRegion === 'string' && p.homeRegion.length > 0 && p.homeRegion !== 'undefined'));
  ok('homeRegion is a real string', badRegion.length === 0,
    badRegion.length ? `homeRegion=${JSON.stringify(badRegion[0].homeRegion)}` : '');

  const lines = [];
  for (const p of people) {
    for (const k of ['talk', 'quests', 'backstory']) {
      const v = p[k];
      if (Array.isArray(v)) lines.push(...v.map(String));
      else if (typeof v === 'string') lines.push(v);
    }
  }
  const leaked = lines.filter(l => /undefined/.test(l));
  ok('no baked "undefined" in talk/quest/backstory lines', leaked.length === 0,
    leaked.length ? `leaked: ${leaked[0].slice(0, 120)}` : '');
  ok('generated talk lines exist', lines.length > 0);

  console.log(fail ? `\n${fail} FAIL(s): ${fails.join('; ')}` : '\nALL GREEN');
  if (fail) process.exitCode = 1;
}
main().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
