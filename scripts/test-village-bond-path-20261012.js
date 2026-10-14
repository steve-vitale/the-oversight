// PROOF TEST: VILLAGE BOND AS ABILITY PATH (Steve 2026-10-12 correction)
// Two SEPARATE features: (1) the party bond mechanic for everyone,
// (2) the village-scale bond as the SHIELDBEARER ability path.
// Godhoods stay out of it — ward ascension must grant nothing.
//
// Harness: sim-harness loadGame (seeded BEFORE eval). Game.save never stubbed.
const SEED = parseInt(process.env.SEED || '20261012', 10);
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'proof', fullTelemetry: false });
  await setupGame(Game);
  Game.say = function () {};
  Game.sysSay = function () {};
  return Game;
}
function vids(Game, n) {
  return Game.state.village.roster.filter(id => id !== Game.villagerId).slice(0, n);
}
// Big bruiser: hopeless trajectory by round 2, but fighter and ally live to see it.
const BRUISER = { id: 'bruiser', hp: [120, 120], attack: { damage: [14, 18], name: 'slam' }, speed: 3, wave: 1 };

(async () => {
  // ---------- 1. godhoods stay out of it ----------
  {
    const Game = await freshGame(SEED);
    Game.state.scholar.godhood = { active: ['undying_ward'] };
    ok('ward ascension -> pathAnchor 0', Game.pathAnchor() === 0);
    ok('ward ascension -> no village bonus', Game.villageBondBonus() === 0);
    Game.noteVillageBondFight();
    ok('no anchor -> pool does not grow', !(Game.state.village.villageBond > 0));
    ok('Game.wardAnchor is gone', typeof Game.wardAnchor === 'undefined');
  }

  // ---------- 2. completing the path grants the pool ----------
  {
    const Game = await freshGame(SEED + 1);
    const [a] = vids(Game, 1);
    Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
    Game.state.village.npcAbilities[a] = ['draw_fire', 'bodyguard', 'shield_wall', 'rally'];
    ok('path complete (4/4) -> anchor 1.0', Game.pathAnchor() === 1);
    Game.noteVillageBondFight();
    ok('pool grows on a survived fight', Game.state.village.villageBond === 2);
    Game.state.village.villageBond = 50;
    const b = Game.villageBondBonus();
    ok('pool 50 at anchor 1.0 -> +0.04', Math.abs(b - 0.04) < 1e-9, 'got ' + b);
    // walking the path (2/4) is half an anchor
    Game.state.village.npcAbilities[a] = ['draw_fire', 'bodyguard'];
    ok('path walked (2/4) -> anchor 0.5', Game.pathAnchor() === 0.5);
    // the player walking it counts too
    Game.state.village.npcAbilities[a] = [];
    Game.state.scholar.abilities = [{ id: 'draw_fire' }, { id: 'shield_wall' }, { id: 'rally' }];
    ok('player holds 3/4 -> anchor 0.5', Game.pathAnchor() === 0.5);
    Game.state.scholar.abilities = [{ id: 'draw_fire' }, { id: 'bodyguard' }, { id: 'shield_wall' }, { id: 'rally' }];
    ok('player holds 4/4 -> anchor 1.0', Game.pathAnchor() === 1);
  }

  // ---------- 3. the pool bonus flows into real combat ----------
  {
    const Game = await freshGame(SEED + 2);
    const [a, b] = vids(Game, 2);
    Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
    Game.state.village.npcAbilities[a] = ['draw_fire', 'bodyguard', 'shield_wall', 'rally'];
    Game.state.village.villageBond = 100;
    Game.state.village.health = Game.state.village.health || {};
    Game.state.village.health[a] = 100; Game.state.village.health[b] = 100;
    let calls = 0;
    const orig = Game.villageBondBonus;
    Game.villageBondBonus = function () { calls++; return orig.apply(this, arguments); };
    const MDEF = { id: 'hushwolf', hp: [10, 10], attack: { damage: [6, 10], name: 'bite' }, speed: 3, wave: 1 };
    Game.fieldFight(a, MDEF, null, { allies: 1, allyVids: [b], allyFromStart: true, rng: () => 0.2 });
    Game.villageBondBonus = orig;
    ok('villageBondBonus is read by the fight engine', calls > 0, 'calls=' + calls);
  }

  // ---------- 4. death dips the pool proportionally ----------
  {
    const Game = await freshGame(SEED + 3);
    Game.state.village.villageBond = 100;
    Game.noteVillageBondGrief();
    ok('death dips the pool x0.9 (grief, not amnesia)', Game.state.village.villageBond === 90);
    ok('the village endures (pool not zeroed)', Game.state.village.villageBond > 0);
  }

  // ---------- 5. the path is genuinely completable by villagers ----------
  {
    const Game = await freshGame(SEED + 4);
    const [a, b] = vids(Game, 2);
    Game.state.systemArrived = true;
    // no decorative unreachable entries: the tank abilities left the kit
    const kit = (Game.NPC_ABILITY_KITS || {}).combat || [];
    for (const id of ['draw_fire', 'bodyguard', 'shield_wall']) {
      ok(id + ' not a decorative kit entry', kit.indexOf(id) < 0);
    }
    // the real route: bleed beside someone, the System offers the path
    // UNIFIED TRACKS (2026-10-14, design change): the shieldbearer abilities
    // are skill-lane, so a villager LEARNS them as villager skills (no slot).
    // "Held" = npcHasAbility (slots + known skills), the villager twin of
    // the player's hasAbility.
    Game.combatBondAdd(a, b, 30);
    Game.noteShieldbearerOffer(a);
    const owned = () => (Game.npcOwnedIds ? Game.npcOwnedIds(a) : ((Game.state.village.npcAbilities || {})[a] || []));
    ok('bond 30 -> System offers draw_fire', Game.npcHasAbility(a, 'draw_fire'), 'held=' + owned().join(','));
    Game.combatBondAdd(a, b, 20); // 50 total
    Game.noteShieldbearerOffer(a);
    ok('bond 50 -> bodyguard follows', Game.npcHasAbility(a, 'bodyguard'), 'held=' + owned().join(','));
    ok('skill-lane shieldbearer abilities take no villager slot', ((Game.state.village.npcAbilities || {})[a] || []).indexOf('draw_fire') < 0);
    // nothing before the System's arrival
    const Game2 = await freshGame(SEED + 40);
    const [c, d] = vids(Game2, 2);
    Game2.state.systemArrived = false;
    Game2.combatBondAdd(c, d, 90);
    Game2.noteShieldbearerOffer(c);
    // PARITY (2026-10-14, design change): a villager's first ability (their
    // knack, like the player's) is held from day 1 — only the shieldbearer
    // offers wait for the System.
    const knack3 = ((Game2.state.village.npcKnacks || {})[c]);
    const held3 = ((Game2.state.village.npcAbilities || {})[c] || []).filter(id => id !== knack3);
    ok('no offers before day-7 arrival', held3.length === 0 && !Game2.npcHasAbility(c, 'draw_fire'), 'held=' + held3.join(','));
  }

  // ---------- 6. rally: hold for them, once per fight ----------
  {
    const Game = await freshGame(SEED + 5);
    const [a, b] = vids(Game, 2);
    Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
    Game.state.village.npcAbilities[a] = ['rally'];
    Game.state.village.health = Game.state.village.health || {};
    Game.state.village.health[a] = 100; Game.state.village.health[b] = 100;
    const rec = Game.fieldFight(a, BRUISER, null, {
      allies: 1, allyVids: [b], allyFromStart: true, rng: () => 0.5, // 0.5: the ally isn't hit every round, lives to the hopeless round
    });
    const rallies = rec.log.filter(l => /\(Rally\)/.test(l)).length;
    ok('rally fires on the hopeless round', rallies === 1, 'rallies=' + rallies + ' outcome=' + rec.outcome + ' rounds=' + rec.rounds);
    ok('held that round, decided honestly after (rounds>=3)', (rec.rounds || 0) >= 3, 'rounds=' + rec.rounds);
  }

  // ---------- 7. stand_together capstone: the pool grows twice as fast ----------
  {
    const Game = await freshGame(SEED + 6);
    const [a] = vids(Game, 1);
    Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
    Game.state.village.npcAbilities[a] = ['draw_fire', 'bodyguard', 'shield_wall', 'rally'];
    ok('base growth +2/fight', Game.villageBondGrowth() === 2);
    Game.state.scholar.synergies = ['stand_together'];
    ok('capstone synergy -> growth +4/fight', Game.villageBondGrowth() === 4);
    ok('capstone synergy anchors at 1.0 (player route)', Game.pathAnchor() === 1);
    const fs = require('fs'), path = require('path');
    const syns = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'synergies.json'), 'utf8'));
    const st = syns.find(s => s.id === 'stand_together');
    ok('stand_together requires draw_fire + shield_wall',
      !!st && (st.requires || []).indexOf('draw_fire') >= 0 && (st.requires || []).indexOf('shield_wall') >= 0);
  }

  // ---------- 8. RED: without the path, nothing flows ----------
  {
    const Game = await freshGame(SEED + 7);
    const [a] = vids(Game, 1);
    Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
    Game.state.village.npcAbilities[a] = ['draw_fire', 'bodyguard', 'shield_wall', 'rally'];
    Game.state.village.villageBond = 100;
    ok('control: bonus flows with the path', Game.villageBondBonus() > 0);
    Game.state.village.npcAbilities[a] = []; // RED: take the path away
    ok('RED: no path -> anchor 0', Game.pathAnchor() === 0);
    ok('RED: no path -> no bonus', Game.villageBondBonus() === 0);
    Game.state.village.villageBond = 0;
    Game.noteVillageBondFight();
    ok('RED: no path -> pool does not grow', !(Game.state.village.villageBond > 0));
    Game.state.village.npcAbilities[a] = ['draw_fire', 'bodyguard', 'shield_wall', 'rally']; // restore
    Game.state.village.villageBond = 100;
    ok('restored -> bonus flows again', Game.villageBondBonus() > 0);
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
