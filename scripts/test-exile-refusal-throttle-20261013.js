#!/usr/bin/env node
// test-exile-refusal-throttle-20261013.js — proof test for the exile-refusal
// throttle (journey-endgame r9, 2026-10-13).
//
// FOUND: a leadcourt run exiled ~d52 kept the scholar trying the pantry
// ~81x/day for 20 days; every attempt printed the full dramatic exile line
// (~1,600 identical story beats). FIX (src/js/membership.js _blockIfExiled):
// the full line reads ONCE per exile episode per place; repeats get the
// short refusal ("The pantry is closed to you."). Every refusal still
// narrates (no silent actions). The flag re-arms on rejoin and on fresh
// exile.
//
// Proves on a REAL Game instance (sim-harness, seeded):
//   (1) 3x takeFromPantry while exiled -> [full, short, short], all null.
//   (2) per-place: first stash refusal is still the FULL line even after
//       pantry refusals; second stash refusal is short.
//   (3) re-arm: rejoin clears the episode; a new exile re-arms the full line.
//   (4) fresh exilePlayer() re-arms the full line mid-episode.
//   (5) not exiled -> no refusal lines at all.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

const FULL_PANTRY = 'The pantry is not yours anymore. Exile means exile';
const SHORT_PANTRY = 'The pantry is closed to you.';
const FULL_STASH = 'The stash is not yours anymore. Exile means exile';
const SHORT_STASH = 'The stash is closed to you.';

(async () => {
  const { Game } = await loadGame({ seed: 20261013, mode: 'proof' });
  await setupGame(Game, 'Columbus, Ohio');

  const said = [];
  const _say = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return _say.apply(this, arguments); };
  const newLines = () => { const l = said.splice(0, said.length); return l; };
  const exile = () => { Game.state.scholar.exiled = true; };

  // ---------- (1) throttle: full once, then short ----------
  exile(); newLines();
  const r1 = Game.takeFromPantry(0);
  const r2 = Game.takeFromPantry(0);
  const r3 = Game.takeFromPantry(0);
  const l123 = newLines();
  ok('refusals return null (action refused, not silent)', r1 === null && r2 === null && r3 === null,
    JSON.stringify([r1, r2, r3]));
  ok('first pantry refusal is the full dramatic line', l123.length >= 1 && l123[0].indexOf(FULL_PANTRY) === 0,
    JSON.stringify(l123[0]).slice(0, 120));
  ok('second pantry refusal is the short line', l123.length >= 2 && l123[1] === SHORT_PANTRY,
    JSON.stringify(l123[1]).slice(0, 120));
  ok('third pantry refusal is the short line', l123.length >= 3 && l123[2] === SHORT_PANTRY,
    JSON.stringify(l123[2]).slice(0, 120));
  ok('no extra narration on repeats', l123.length === 3, 'got ' + l123.length + ' lines');

  // ---------- (2) per-place: stash gets its own full line ----------
  newLines();
  const s1 = Game.takeMaterial('wood');
  const s2 = Game.takeMaterial('wood');
  const ls = newLines();
  ok('first stash refusal is the FULL stash line (per-place, not global)',
    ls.length >= 1 && ls[0].indexOf(FULL_STASH) === 0, JSON.stringify(ls[0]).slice(0, 120));
  ok('second stash refusal is short', ls.length >= 2 && ls[1] === SHORT_STASH,
    JSON.stringify(ls[1]).slice(0, 120));
  ok('stash refusals return null', s1 === null && s2 === null);

  // ---------- (3) rejoin re-arms ----------
  newLines();
  Game.rejoinMembership();
  ok('rejoin clears exile', Game.state.scholar.exiled === false);
  exile(); // new episode, direct set (rejoin already cleared the flag)
  Game.takeFromPantry(0);
  const lr = newLines().filter(t => t.indexOf('not yours anymore') >= 0 || t.indexOf('closed to you') >= 0);
  ok('new exile episode re-arms the full line',
    lr.length >= 1 && lr[0].indexOf(FULL_PANTRY) === 0, JSON.stringify(lr[0]).slice(0, 120));

  // ---------- (4) fresh exilePlayer() re-arms mid-episode ----------
  Game.takeFromPantry(0); // short now (flag set)
  newLines();
  try { Game.exilePlayer('test'); } catch (e) { console.log('  (exilePlayer threw: ' + (e && e.message) + ')'); }
  Game.state.scholar.exiled = true; // ensure exiled regardless of exilePlayer internals
  Game.takeFromPantry(0);
  const le = newLines();
  const lastRefusal = le.filter(t => t.indexOf('pantry') >= 0 && (t.indexOf('not yours anymore') >= 0 || t.indexOf('closed to you') >= 0)).pop();
  ok('fresh exilePlayer re-arms the full line', !!lastRefusal && lastRefusal.indexOf(FULL_PANTRY) === 0,
    JSON.stringify(lastRefusal).slice(0, 120));

  // ---------- (5) not exiled: no refusal ----------
  Game.rejoinMembership();
  newLines();
  try { Game.takeFromPantry(0); } catch (e) {}
  const ln = newLines().join('\n');
  ok('no refusal lines when not exiled',
    ln.indexOf('not yours anymore') < 0 && ln.indexOf('closed to you') < 0, ln.slice(0, 200));

  console.log(`\n${pass} pass / ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
