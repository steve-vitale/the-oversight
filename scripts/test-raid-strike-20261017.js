#!/usr/bin/env node
// scripts/test-raid-strike-20261017.js — engine proof for the STRIKE path
// (journey scale r6 2026-10-17): the warcourt policy always gets bloodless
// TERMS (competent standing outranks fresh villages), so STRIKE's casualty
// mechanics had zero journey coverage. This test drives the real verbs
// directly: raidVillage + answerRaid('strike') must exact blood — deaths via
// registerDeath, wounds marked 7 days, raiders gone 3 days, trust 15,
// opinion -40, 7,000 kcal/week duress, loot as real pantry food, and the
// cost said plainly (no silent actions).
//
// Usage: node scripts/test-raid-strike-20261017.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

async function main() {
  const { Game } = await loadGame({ seed: 8601, mode: 'test-raid-strike' });
  const said = [];
  const _say = Game.say;
  Game.say = function (...a) { said.push(String(a[0])); return _say.apply(this, a); };
  await setupGame(Game);
  // fast-forward to day 40 with the competent base (no raid layer)
  const policy = Object.create(competent);
  policy.id = 'test-strike-base';
  await runDays(Game, policy, { days: 40, manifest: { seed: 8601, mode: 'test-raid-strike' } });
  const day = (Game.state.scholar || {}).day || 0;
  assert.ok(day >= 35, 'reached raid age, day=' + day);

  const st = Game.state;
  const target = (st.otherVillages || []).find(v => v && v.id !== 'haven' && Game.knowsVillage(v) && !Game.linkWith(v.id));
  assert.ok(target, 'a known unlinked village exists to raid');
  const pop0 = (st.village.roster || []).length;

  // muster
  const r = Game.raidVillage(target.id);
  assert.ok(r === true, 'raidVillage musters, got ' + r);
  assert.ok(st.pendingRaid, 'pendingRaid staged');
  const fighters = st.pendingRaid.fighters.slice();
  assert.ok(fighters.length >= 2, 'war party of 2+, got ' + fighters.length);

  // STRIKE
  const link = Game.answerRaid('strike');
  assert.ok(link && link.id, 'strike returns the subjugation link');
  assert.strictEqual(link.conquered, true, 'link flagged conquered');
  assert.strictEqual(link.trust, 15, 'trust 15, got ' + link.trust);
  assert.strictEqual(link.tributeKcalPerWeek, 7000, 'duress tribute 7000, got ' + link.tributeKcalPerWeek);

  // casualties: dead via registerDeath, wounded marked 7 days
  const mm = Game.mshipState();
  const wounded = Object.keys(mm.woundedUntil || {}).filter(id => fighters.includes(id));
  const deadNames = [];
  for (const f of fighters) {
    try { if (Game.getPerson(f).dead) deadNames.push(f); } catch (e) {}
  }
  console.log(`war party of ${fighters.length}: dead=${deadNames.length} wounded=${wounded.length}`);
  for (const w of wounded) {
    assert.strictEqual(mm.woundedUntil[w], day + 7, 'wounded 7 days');
  }
  // raiders gone 3 days (away-party mechanism)
  const away = (mm.awayParties || []).find(p => (p.vids || []).some(v => fighters.includes(v)));
  assert.ok(away, 'raid party registered as away');
  assert.strictEqual(away.untilDay, day + 3, 'raiders gone 3 days');

  // loot as real pantry food
  const loot = (st.village.pantry || []).find(i => /Raid spoils/.test(i.name || ''));
  assert.ok(loot, 'raid spoils land in the pantry as real food');
  assert.ok(loot.kcalEach >= 3000 && loot.kcalEach <= 6000, 'spoils 3000-6000 kcal, got ' + loot.kcalEach);

  // the cost said plainly
  const costLine = said.find(s => /burns, and then it kneels/.test(s));
  assert.ok(costLine, 'the strike cost is narrated');
  console.log('cost line:', costLine.slice(0, 200));
  assert.ok(/dead|no dead/.test(costLine) && /wounded|none wounded/.test(costLine), 'cost names dead and wounded');

  // opinion -40
  const ov = (st.otherVillages || []).find(v => v.id === target.id);
  assert.ok((ov.opinion || 0) <= -30, 'hatred marked, opinion=' + ov.opinion);

  console.log(`GREEN: strike exacts blood — pop ${pop0}→${(st.village.roster||[]).length}, ` +
    `${deadNames.length} dead, ${wounded.length} wounded 7d, loot ${loot.kcalEach} kcal, trust 15, tribute 7000/wk.`);
}

main().catch(e => { console.error('RED:', e && e.message); process.exit(1); });
