#!/usr/bin/env node
// test-winfielddmg-20261103.js — winnability push arm 2 proof test.
// Geared party (leader + ally) vs wave-4 beasts, identical seeds 9201-9205,
// before/after the WINFIELD-DMG fixes (sigW4 double damage, ally flat strike,
// unarmored ally, solo morale for a party, known-trick hold).
// Usage: node scripts/test-winfielddmg-20261103.js
// Exit 0 only if every bar below passes. Prints per-fight rows + summaries.
// No repo writes; stdout only.
'use strict';
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');
const SEEDS = [9201, 9202, 9203, 9204, 9205];
let fail = 0;
function check(name, cond, extra) {
  if (cond) console.log('PASS ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + extra : '')); }
}
const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
async function main() {
  const { Game } = await loadGame({ seed: 9201 });
  await setupGame(Game);
  try { Game.state.scholar.day = 120; } catch (e) {}
  try { if (Game.pantryAdd) Game.pantryAdd(200000, 'fixture'); } catch (e) {}
  function prep(vid, items, equipped, hp, abils) {
    const v = Game.state.village || (Game.state.village = {});
    v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[vid] = (abils || []).slice();
    const vp = (Game.data.villagers || []).find(x => x.id === vid) || {};
    vp.items = items.slice(); vp.equipped = Object.assign({}, equipped);
    v.needs = v.needs || {}; v.needs[vid] = Object.assign({}, v.needs[vid], { hunger: 0, fear: 0 });
    v.health = v.health || {}; v.health[vid] = hp || 100;
  }
  function run(mid, weapon, armor, noFlee, seed, tricks, lab) {
    const roster = ((Game.state.village || {}).roster || []).filter(id => id && id !== Game.villagerId);
    const leader = roster[0], ally = roster[1];
    const items = [weapon, armor];
    const eq = { melee: { itemId: weapon, name: weapon }, torso: { itemId: armor, name: armor } };
    prep(leader, items, eq, 100, lab || []); prep(ally, items, eq, 100, []);
    const def = (Game.data.monsters || []).find(m => m && m.id === mid);
    const rec = Game.fieldFight(leader, def, { id: def.id, hp: 1000, maxHp: 1000, tx: 2, ty: 2 },
      { allies: 1, allyVids: [ally], allyFromStart: true, rng: mulberry32(seed), noFlee });
    return { mid, weapon, noFlee, seed, outcome: rec.outcome, rounds: rec.rounds,
      mDealt: rec.mDealt, allyDealt: rec.allyDealt,
      pct: Math.round(100 * (1000 - Math.max(0, rec.mHpLeft)) / 1000) };
  }
  // Main battery: 2 beasts x 2 tiers x arena/wild x 5 seeds = 40 fights.
  const rows = [];
  for (const mid of ['congregation', 'strike'])
    for (const [w, a] of [['phase_blade', 'investigators_coat'], ['godslayer_spear', 'lifebound_vestments']])
      for (const noFlee of [true, false])
        for (const seed of SEEDS) rows.push(run(mid, w, a, noFlee, seed));
  for (const r of rows) console.log(JSON.stringify(r));
  const sub = (mid, w, noFlee) => rows.filter(r => r.mid === mid && r.weapon === w && r.noFlee === noFlee);
  const congT4arena = sub('congregation', 'godslayer_spear', true);
  const strikeT4arena = sub('strike', 'godslayer_spear', true);
  check('congregation T4 arena wins >= 2/5 (was 0/5, 20%)',
    congT4arena.filter(r => r.outcome === 'vKill').length >= 2,
    congT4arena.filter(r => r.outcome === 'vKill').length + '/5 medianPct=' + med(congT4arena.map(r => r.pct)));
  check('strike T4 arena median pct >= 50 (was 38)',
    med(strikeT4arena.map(r => r.pct)) >= 50, med(strikeT4arena.map(r => r.pct)));
  const t4arenaAlly = rows.filter(r => r.weapon === 'godslayer_spear' && r.noFlee);
  check('T4 arena median ally dealt >= 150 (was 9-15)',
    med(t4arenaAlly.map(r => r.allyDealt)) >= 150, med(t4arenaAlly.map(r => r.allyDealt)));
  check('main battery wins >= 2/40 (was 0/40)',
    rows.filter(r => r.outcome === 'vKill').length >= 2, rows.filter(r => r.outcome === 'vKill').length + '/40');
  // Prepared wild battery: trick knowledge + war_cry/rally/unbreakable, T4, wild.
  Game.state.villagerTricks = { congregation: true, strike: true };
  const prows = [];
  for (const mid of ['congregation', 'strike'])
    for (const seed of SEEDS)
      prows.push(run(mid, 'godslayer_spear', 'lifebound_vestments', false, seed, true, ['war_cry', 'rally', 'unbreakable']));
  for (const r of prows) console.log(JSON.stringify(Object.assign({ prepared: true }, r)));
  for (const mid of ['congregation', 'strike']) {
    const s = prows.filter(r => r.mid === mid);
    check('prepared wild ' + mid + ' wins >= 1/5 (was 0/5)',
      s.filter(r => r.outcome === 'vKill').length >= 1,
      s.filter(r => r.outcome === 'vKill').length + '/5 medianPct=' + med(s.map(r => r.pct)) + ' medianRounds=' + med(s.map(r => r.rounds)));
  }
  console.log(fail ? ('RESULT FAIL ' + fail + ' bar(s) missed') : 'RESULT PASS all bars');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FIXTURE FAIL', e && e.stack || e); process.exit(1); });
