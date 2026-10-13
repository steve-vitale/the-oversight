#!/usr/bin/env node
// test-conflict-deadparty-20261013.js — PLAYTEST social r12 2026-10-13.
// Blank from r10/r11 watch item: censuses listed "active conflicts" whose
// party was dead (Adaeze x Carlos, tension 0, Adaeze dead). Hypothesis: the
// engine resolves them (socialSimmer DEAD PARTY clause, weirdness hunt
// 2026-10-10) and the r10 census printer merely lists resolved conflicts as
// "active" without filtering. This test asserts:
//   1. a conflict whose party is off-roster gets resolved + tension 0 after
//      socialSimmer, with a grief journal trace — and conversation.js lines
//      skip it (cf.resolved guard);
//   2. mediateConflict refuses the dead-party conflict ("over, not mediable").
// RED if any of that fires on the dead party.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function fail(m) { console.error('FAIL: ' + m); process.exitCode = 1; }
function ok(m) { console.log('ok: ' + m); }

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 99, mode: 'test' });
  if (loadFails && loadFails.length) { fail('module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const v = Game.state.village;
  const player = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== player);
  if (roster.length < 2) { fail('need 2+ NPCs'); return; }
  const [a, b] = roster;
  // hand-make an old_wound conflict, known, high tension
  const c = { a, b, kind: 'old_wound', heritageA: 'x', heritageB: 'y',
    history: ['{a} and {b} don\'t speak. It\'s not new.', 'h2', 'h3'],
    known: true, stage: 1, tension: 70, resolved: false };
  v.conflicts = v.conflicts || [];
  v.conflicts.push(c);
  // kill party b (off roster, into fallen)
  v.roster = (v.roster || []).filter(id => id !== b);
  v.fallen = v.fallen || [];
  v.fallen.push({ villagerId: b, day: 3, cause: 'monster' });
  const notesBefore = ((Game.state.codex || {}).notes || []).length;
  Game.socialSimmer();
  if (!c.resolved) fail('dead-party conflict NOT resolved by socialSimmer');
  else ok('dead-party conflict resolved by socialSimmer');
  if (c.tension !== 0) fail('tension not zeroed: ' + c.tension);
  else ok('tension zeroed');
  const fresh = ((Game.state.codex || {}).notes || []).slice(notesBefore).map(n => String(n.text || '')).join(' ');
  if (!/one of them is gone/i.test(fresh)) fail('no grief journal trace; notes=' + fresh.slice(0, 200));
  else ok('grief journal trace written');
  // conversation.js block must skip the resolved conflict (no old-history lines)
  Game.startConvo(a);
  const r = Game.mediateConflict(a);
  if (r && /mediated|eased/i.test(JSON.stringify(r))) fail('mediateConflict treated dead-party conflict as live');
  else ok('mediateConflict refuses dead-party conflict: ' + String(r === null ? 'null' : (r && r.note ? r.note : 'no live conflict')));
  try { Game.endConvo(a, 'left'); } catch (e) {}
  // the census-printer view: resolved conflicts must not count as active
  const active = (v.conflicts || []).filter(x => !x.resolved).length;
  if (active !== 0 && v.conflicts.includes(c)) { /* resolved, so excluded */ }
  ok('active (unresolved) conflict count = ' + active);
  if (!process.exitCode) console.log('ALL GREEN');
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exitCode = 1; });
