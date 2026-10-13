// PROOF TEST: PARTY BOND (Steve 2026-10-12)
// "Yes to all": (1) party bond mechanic for everyone, (2) tank role
// abilities, (3) the village-scale bond as a SEPARATE ability path
// (shieldbearer — Steve's correction: godhoods stay out of it).
// Plus the depth-probe gaps: fitness gate for the wounded,
// newcomer/veteran pairing.
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
const MDEF = { id: 'hushwolf', hp: [10, 10], attack: { damage: [6, 10], name: 'bite' }, speed: 3, wave: 1 };
function firstName(Game, vid) {
  try { return String(Game.displayName(vid)).split(' ')[0]; } catch (e) { return vid; }
}

(async () => {
  // ---------- 1. bond grows on shared survival ----------
  {
    const Game = await freshGame(SEED);
    const [a, b] = vids(Game, 2);
    ok('bond starts at 0', Game.combatBondGet(a, b) === 0);
    Game.noteSharedFight([a, b]);
    ok('bond +4 per shared fight', Game.combatBondGet(a, b) === 4);
    ok('bond is symmetric', Game.combatBondGet(b, a) === 4);
    for (let i = 0; i < 40; i++) Game.noteSharedFight([a, b]);
    ok('bond caps at 100', Game.combatBondGet(a, b) === 100);
  }

  // ---------- 2. combat bonus scales with bond ----------
  {
    const Game = await freshGame(SEED + 1);
    const [a, b] = vids(Game, 2);
    ok('no bond -> no bonus', Game.bondCombatBonus(a, [b]) === 0);
    for (let i = 0; i < 25; i++) Game.noteSharedFight([a, b]); // 100
    const bonus = Game.bondCombatBonus(a, [b]);
    ok('bond 100 -> +0.08 holdBonus', Math.abs(bonus - 0.08) < 1e-9, 'got ' + bonus);
    ok('no allies -> no bonus', Game.bondCombatBonus(a, []) === 0);
  }

  // ---------- 3. death grieves proportionally ----------
  {
    const Game = await freshGame(SEED + 2);
    const [a, b, c] = vids(Game, 3);
    Game.combatBondAdd(a, b, 80); Game.combatBondAdd(a, c, 80); Game.combatBondAdd(b, c, 80);
    Game.noteBondGrief(c, [a, b, c]);
    ok("dead pair's bond is gone", Game.combatBondGet(a, c) === 0 && Game.combatBondGet(b, c) === 0);
    const ab = Game.combatBondGet(a, b);
    ok('survivors scale by 2/3 (grief, not amnesia)', ab === Math.round(80 * 2 / 3), 'got ' + ab);
    ok('grief does not zero the living', ab > 0);
  }

  // ---------- 4. shared fight through the real engine ----------
  {
    const Game = await freshGame(SEED + 3);
    const [a, b] = vids(Game, 2);
    Game.state.village.health = Game.state.village.health || {};
    Game.state.village.health[a] = 100; Game.state.village.health[b] = 100;
    const rec = Game.fieldFight(a, MDEF, null, {
      allies: 1, allyVids: [b], allyFromStart: true, rng: () => 0.2,
    });
    ok('fight resolves', !!rec.outcome, rec.outcome);
    if (rec.outcome === 'vKill' || rec.outcome === 'mFlee' || rec.outcome === 'vFlee') {
      ok('surviving together grows bond', Game.combatBondGet(a, b) > 0, 'bond=' + Game.combatBondGet(a, b));
    } else {
      ok('surviving together grows bond (skipped, outcome ' + rec.outcome + ')', true);
    }
  }

  // ---------- 5. TANK: draw_fire ----------
  {
    const Game = await freshGame(SEED + 4);
    const [a, b] = vids(Game, 2);
    const v = Game.state.village;
    // first names all read "A" (descriptor-led names) — disambiguate by HP:
    // fighter 100, ally 60. A "hits A for X (N left)" line with N<=80 is the ally.
    v.health = v.health || {}; v.health[a] = 100; v.health[b] = 60;
    v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[a] = ['draw_fire'];
    
    const rec = Game.fieldFight(a, MDEF, null, {
      allies: 1, allyVids: [b], allyFromStart: true, rng: () => 0.2,
    });
    const drew = rec.log.some(l => /draws its eye/.test(l));
    ok('draw_fire engages (log line)', drew);
    // with rng()=0.2: no taunt -> ally hit every attack (0.2<0.4);
    // taunt -> share 0.1, 0.2 !< 0.1 -> ally never hit by share roll.
    // Ally HP 60, fighter 100: an ally-hit line shows N<=80 left.
    const allyHits = rec.log.filter(l => {
      const m = /hits A for \d+ \((\d+) left\)/.exec(l);
      return m && parseInt(m[1], 10) <= 80;
    }).length;
    ok('taunt keeps hits off the ally', allyHits === 0, allyHits + ' ally hits');
  }

  // ---------- 6. TANK: bodyguard ----------
  {
    const Game = await freshGame(SEED + 5);
    const [a, b] = vids(Game, 2);
    const v = Game.state.village;
    v.health = v.health || {}; v.health[a] = 100; v.health[b] = 100;
    v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[a] = ['bodyguard'];
    const rec = Game.fieldFight(a, MDEF, null, {
      allies: 1, allyVids: [b], allyFromStart: true, rng: () => 0.2,
    });
    const steps = rec.log.filter(l => /steps into the blow/.test(l)).length;
    ok('bodyguard intercepts once per fight', steps === 1, steps + ' intercepts');
  }

  // ---------- 7. TANK: shield_wall ----------
  {
    const mk = async (seed, abs) => {
      const Game = await freshGame(seed);
      const [a, b] = vids(Game, 2);
      const v = Game.state.village;
      v.health = v.health || {}; v.health[a] = 100; v.health[b] = 100;
      v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[a] = abs;
      return Game.fieldFight(a, { id: 'hushwolf', hp: [60, 60], attack: { damage: [8, 12], name: 'bite' }, speed: 3, wave: 1 }, null, {
        allies: 1, allyVids: [b], allyFromStart: true, rng: () => 0.5,
      });
    };
    const plain = await mk(SEED + 6, []);
    const walled = await mk(SEED + 6, ['shield_wall']);
    const walledLog = walled.log.some(l => /Shield Wall/.test(l));
    ok('shield_wall engages (log line)', walledLog);
    ok('shield_wall reduces damage taken', walled.vTaken < plain.vTaken,
      'plain=' + plain.vTaken + ' walled=' + walled.vTaken);
  }

  // ---------- 8. shieldbearer path anchors the village-scale bond ----------
  // Steve 2026-10-12 rework: TWO separate features — godhoods stay out of it.
  {
    const Game = await freshGame(SEED + 7);
    const [a] = vids(Game, 1);
    ok('no path -> no anchor', Game.pathAnchor() === 0);
    ok('no path -> no village bonus', Game.villageBondBonus() === 0);
    Game.state.scholar.godhood = { active: ['undying_ward'] };
    ok('ward ascension no longer anchors anything', Game.pathAnchor() === 0);
    ok('ward ascension -> no village bonus', Game.villageBondBonus() === 0);
    Game.state.scholar.godhood = { active: [] };
    Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
    Game.state.village.npcAbilities[a] = ['draw_fire', 'bodyguard'];
    ok('villager walks the path (2/4) -> anchor 0.5', Game.pathAnchor() === 0.5);
    Game.state.village.npcAbilities[a] = ['draw_fire', 'bodyguard', 'shield_wall', 'rally'];
    ok('villager completes the path (4/4) -> anchor 1.0', Game.pathAnchor() === 1);
    Game.state.village.villageBond = 100;
    const vb = Game.villageBondBonus();
    ok('village bond 100 -> +0.08', Math.abs(vb - 0.08) < 1e-9, 'got ' + vb);
  }

  // ---------- 9. fitness gate ----------
  {
    const Game = await freshGame(SEED + 8);
    const [a] = vids(Game, 1);
    const v = Game.state.village;
    v.trust = v.trust || {}; v.trust[a] = 80;
    v.health = v.health || {}; v.health[a] = 30;
    Game.playerAtHaven = function () { return true; };
    let r = null;
    try { r = Game.assignTask(a, 'hunt', { via: 'in-person' }); } catch (e) { r = { threw: e.message }; }
    ok('wounded villager refused outdoor work', r && r.refused === true && r.reason === 'wounded', JSON.stringify(r));
    ok('no assignment written', !((v.assignments || {})[a] || {}).task);
    v.health[a] = 100;
    let r2 = null;
    try { r2 = Game.assignTask(a, 'hunt', { via: 'in-person' }); } catch (e) { r2 = { threw: e.message }; }
    ok('healthy villager can be assigned', r2 && ((v.assignments || {})[a] || {}).task === 'hunt', JSON.stringify(r2 && r2.reason));
  }

  // ---------- 10. newcomer pairing ----------
  {
    const Game = await freshGame(SEED + 9);
    const [a, vet] = vids(Game, 2);
    const v = Game.state.village;
    v.trust = v.trust || {}; v.trust[a] = 80; v.trust[vet] = 80;
    v.health = v.health || {}; v.health[a] = 100; v.health[vet] = 100;
    Game.playerAtHaven = function () { return true; };
    const day = Game.state.scholar.day || 0;
    v.arrivedDay = v.arrivedDay || {}; v.arrivedDay[a] = day; // newcomer
    try { Game.agencyOf(vet).xp[vet].bravery = 15; } catch (e) {}
    let r = null;
    try { r = Game.assignTask(vet, 'patrol', { via: 'in-person' }); } catch (e) { r = { threw: e.message }; }
    let r2 = null;
    try { r2 = Game.assignTask(a, 'patrol', { via: 'in-person' }); } catch (e) { r2 = { threw: e.message }; }
    const buddy = ((v.assignments || {})[a] || {}).buddy;
    ok('newcomer paired with veteran buddy', buddy === vet, 'buddy=' + buddy);
    ok('isNewcomer true within 14d', Game.isNewcomer(a) === true);
  }

  // ---------- 11. ability data honesty ----------
  {
    const abs = Game0abilities();
    function Game0abilities() {
      const fs = require('fs'), path = require('path');
      const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'abilities.json'), 'utf8'));
      const l = d.abilities || d; return Array.isArray(l) ? l : Object.values(l);
    }
    for (const id of ['draw_fire', 'bodyguard', 'shield_wall', 'rally']) {
      const a = abs.find(x => x.id === id);
      ok(id + ' exists as a combat-lane System ability', !!a && a.pool === 'combat', 'pool=' + (a && a.pool));
      ok(id + ' description names the wild/party context', !!a && /wilds|beside|ally|people/.test(a.description));
      ok(id + ' has undying_ward resonance', !!a && (a.resonance || []).indexOf('undying_ward') >= 0);
      ok(id + ' carries the shieldbearer path', !!a && (a.paths || []).indexOf('shieldbearer') >= 0);
    }
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
