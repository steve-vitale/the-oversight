#!/usr/bin/env node
// test-expedid-b.js — PROOF for loop-B arm sim-expedid-b (run
// fleshout-loop-b-20261025T2030Z, backlog #1047).
//
// The n2beast audit (evidence/2026-10-25/sim-n2beast-b.md) proved "The Big
// Beast" is a generated village-name alias for an expedition death, and the
// ledger cannot say which roster monster wore it: expedDeath passes
// killerId null and threads no monsterId anywhere. The hurtVillager path
// already threads monsterId into its registerDeath call AND its fallen
// push (game.js hurtVillager). This test proves expedDeath mirrors it.
//
// PRE-REGISTERED PRIMARY (judged only against this): on a synthetic
// expedition death with a known killer, the fallen entry carries
// monsterId non-null and equal to that killer's roster id.
// Before/after = the IDENTICAL synthetic scenario below: before the fix
// the same call yields no monsterId-carrying fallen entry; after the fix
// it yields monsterId === 'gallowdeer'.
//   Synthetic scenario (fixed): loadGame seed 42, setupGame, pick a
//   non-player roster villager, set a minimal expedition entry, call
//   Game.expedDeath(vid, 'The Big Beast', displayName, false,
//   'gallowdeer'). Killer 'gallowdeer' is a roster id (Highbeam Deer);
//   'The Big Beast' is the generated-alias display name from the n2beast
//   corpus — display stays the alias, plumbing carries the species.
// Secondary (reported, not GO-gating): corpse carries the same monsterId;
// tele 'death' wave matches the killer's roster wave; cause still displays
// as the alias; the old-signature call (no 5th arg) still works and lands
// monsterId null; the villager still leaves the roster.
// Exit 0 iff every leg passes; any failure prints FAIL and exits 1.
//
// Run: node scripts/test-expedid-b.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}

async function main() {
  const { Game } = await loadGame({ seed: 42, mode: 'test-expedid-b' });
  await setupGame(Game);
  const roster = Game.state.village.roster || [];
  const me = Game.villagerId;
  const candidates = roster.filter(id => id !== me);
  check('setup-has-villagers', candidates.length >= 2, `roster=${roster.length} candidates=${candidates.length}`);
  if (candidates.length < 2) { console.log(`${fails} FAIL`); process.exit(1); }
  const mdef = (Game.data.monsters || []).find(m => m.id === 'gallowdeer');
  check('killer-is-roster-id', !!mdef, mdef ? `gallowdeer wave=${mdef.wave}` : 'gallowdeer missing from roster');

  const fallenFor = vid => (Game.state.village.fallen || []).find(f => f.villagerId === vid);
  const corpseFor = vid => (Game.corpses() || []).find(c => c.villagerId === vid);
  const teleFor = vid => (Game.state.telemetry || []).filter(e => e && e.type === 'death' && String(e.who) === String(vid));

  // ---- Leg 1: threaded expedition death (the PRIMARY) ----
  const vid = candidates[0];
  const nm = (() => { try { return Game.displayName(vid); } catch (e) { return 'Someone'; } })();
  try { Game.agencyOf(vid); } catch (e) {}
  try { Game.agencyState().exped[vid] = { encounters: [], legs: 0 }; } catch (e) {}
  Game.expedDeath(vid, 'The Big Beast', nm, false, 'gallowdeer');
  const f = fallenFor(vid);
  check('primary-fallen-exists', !!f, f ? JSON.stringify(f) : 'no fallen entry for ' + vid);
  check('primary-monsterId', !!f && f.monsterId === 'gallowdeer', f ? `monsterId=${f.monsterId}` : 'no entry');
  check('primary-monsterName', !!f && f.monsterName === 'The Big Beast', f ? `monsterName=${f.monsterName}` : 'no entry');
  check('display-cause-unchanged', !!f && f.cause === 'The Big Beast', f ? `cause=${f.cause}` : 'no entry');
  check('fallen-name-present', !!f && typeof f.name === 'string' && f.name.length > 0, f ? `name=${f.name}` : 'no entry');
  const c = corpseFor(vid);
  check('corpse-monsterId', !!c && c.monsterId === 'gallowdeer', c ? `monsterId=${c.monsterId}` : 'no corpse');
  const t = teleFor(vid);
  const lastTele = t[t.length - 1];
  check('tele-death-cause', !!lastTele && lastTele.cause === 'The Big Beast', lastTele ? `cause=${lastTele.cause}` : 'no death tele');
  check('tele-wave-matches-killer', !!lastTele && mdef && lastTele.wave === mdef.wave, lastTele ? `wave=${lastTele.wave} killerWave=${mdef && mdef.wave}` : 'no death tele');
  check('roster-removal-preserved', !(Game.state.village.roster || []).includes(vid), 'victim still on roster');

  // ---- Leg 2: old-signature call still works, monsterId null ----
  const vid2 = candidates[1];
  const nm2 = (() => { try { return Game.displayName(vid2); } catch (e) { return 'Someone'; } })();
  try { Game.agencyOf(vid2); } catch (e) {}
  try { Game.agencyState().exped[vid2] = { encounters: [], legs: 0 }; } catch (e) {}
  let threw = null;
  try { Game.expedDeath(vid2, 'The Big Beast', nm2, false); } catch (e) { threw = e; }
  check('old-signature-no-throw', !threw, threw ? String(threw && threw.message) : 'ok');
  const f2 = fallenFor(vid2);
  check('old-signature-fallen-null', !!f2 && f2.monsterId === null, f2 ? `monsterId=${f2.monsterId}` : 'no entry');
  check('old-signature-cause-unchanged', !!f2 && f2.cause === 'The Big Beast', f2 ? `cause=${f2.cause}` : 'no entry');

  console.log(fails === 0 ? 'ALL PASS' : `${fails} FAIL`);
  process.exit(fails === 0 ? 0 : 1);
}

main().catch(e => { console.error('HARNESS ERROR', e && e.stack || e); process.exit(1); });
