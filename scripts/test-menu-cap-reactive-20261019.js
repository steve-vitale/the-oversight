// test-menu-cap-reactive-20261019.js — ESTABLISHMENT r16: THE REACTIVE HOLE.
//
// r22 (crisis) capped conversation menus at the outermost convoChoices
// wrapper — but exempted reactive menus (ans:/gq:) entirely. A hanging
// question plus a live betrayal case blew to 15 (r16 seed 124-d13: 3
// gq:open + 9 betrayal + agency + invite_party + silence — the one-screen
// rule broken on an opening menu). Two more 9-item hybrids (61-d19,
// 82-d13) show the same hole, milder.
//
// The fix (villager-agency.js): the reactive exemption is no longer
// all-or-nothing. The question's answers stay structural (protected
// first), but the total caps at reactiveCount + 2 (the answers+2
// contract from buildMenu) — prepends compete for the remaining room.
//
// RED: on pre-fix code, the staged hybrid (4 gq:yn + 9 betrayal prepends)
//   passes through at 14.
// GREEN: capped at <= reactiveCount+2 content + leave + silence; all gq
//   answers survive; a pure reactive menu is untouched; the r22
//   non-reactive cap still holds.
// Run: node scripts/test-menu-cap-reactive-20261019.js (seeds 61/82/103)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '61', 10);
let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-menu-cap-reactive' });
  await setupGame(Game);
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert(roster.length >= 1, 'need 1+ non-scholar villagers');
  const vid = roster[0];

  // ---- STAGE: hanging generic question (reactive) + 9 betrayal prepends ----
  const c = Game.convoGet(vid);
  c.genericQ = { kind: 'yn', text: 'test question?' };
  const fakeBetrayal = [];
  for (let i = 0; i < 9; i++) fakeBetrayal.push({ id: 'betrayal:fake' + i, label: 'fake ' + i });
  const _bc = Game.betrayalChoices;
  const _ac = Game.agencyChoices;
  Game.betrayalChoices = () => fakeBetrayal;
  Game.agencyChoices = () => [];

  const menu = Game.convoChoices(vid) || [];
  const ids = menu.map(x => x && x.id);
  const gqIds = ids.filter(id => /^gq:/.test(id || ''));
  console.log(`  hybrid menu: ${menu.length} items [${ids.join(', ')}]`);

  // THE CAP: 4 gq answers + 2 budget = 6 content max, + silence (no leave staged)
  const content = menu.filter(x => x && x.id !== 'silence' && x.id !== 'leave');
  ok('hybrid menu capped (<=6 content + silence)', content.length <= 6 && menu.length <= 8,
    `got ${content.length} content / ${menu.length} total`);
  ok('all 4 gq answers survive', gqIds.length === 4, `got ${gqIds.length}`);
  ok('silence pinned last', menu[menu.length - 1] && menu[menu.length - 1].id === 'silence');
  ok('no duplicate ids', new Set(ids).size === ids.length);

  // ---- pure reactive menu: untouched (the r22 exemption's legitimate case) --
  Game.betrayalChoices = () => [];
  const pure = Game.convoChoices(vid) || [];
  const pureIds = pure.map(x => x && x.id);
  console.log(`  pure reactive menu: ${pure.length} items [${pureIds.join(', ')}]`);
  ok('pure reactive menu not cut', pureIds.filter(id => /^gq:/.test(id || '')).length === 4,
    `gq kept ${pureIds.filter(id => /^gq:/.test(id || '')).length}`);

  // ---- non-reactive over-budget menu: r22 cap still holds -------------------
  c.genericQ = null;
  Game.betrayalChoices = () => fakeBetrayal;
  const nr = Game.convoChoices(vid) || [];
  console.log(`  non-reactive menu: ${nr.length} items`);
  ok('non-reactive cap still holds (<=8 total)', nr.length <= 8, `got ${nr.length}`);

  Game.betrayalChoices = _bc;
  Game.agencyChoices = _ac;

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
