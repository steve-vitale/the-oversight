#!/usr/bin/env node
// COMBAT BREAK-IT round 2: mid-combat HP routing + consumable action costs
// (Steve 2026-10-08).
// Attacks:
//   R1. PHANTOM HEAL — useItem (first aid / healAmount) wrote scholar.health
//       directly. In a fight the live pool is the fighter's p.hp; tbEnd
//       overwrites s.health from p.hp, so the "+30 health" message was a lie
//       and the heal never landed. Also cost NO combat action.
//   R2. FREE DRINK — drinkWater() in combat cost tickAction(1), which is a
//       no-op mid-fight: unlimited free hydration. Risky-water -15 also wrote
//       the wrong pool (erased at fight end).
//   R3. FREE BAD-FOOD DAMAGE — eatOne's poison/disease/unsafe-food damage
//       wrote scholar.health directly: eat risky food mid-fight, take the
//       kcal, the damage vanished at tbEnd.
//   R4. PHANTOM FIELD MEDICINE — field_medicine (combat:true) healed
//       scholar.health: +20 HP promised, nothing delivered in a fight.
// Fix: Game.addHealth(n) routes to the fighter in combat (can end the fight);
// useItem/drinkWater spend the combat action mid-fight.
const K = require('./godpath/lib');
// Prepared two-fighter board; gameplay methods and enemy turns remain real.
function fight(Game, monId, opts) {
  Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
  Game.state.scholar.health = opts.php;
  Game.state.systemArrived = false; Game.resetPerFightFlags();
  const mdef = Game.data.monsters.find(m => m.id === monId);
  if (!mdef) throw new Error('missing monster ' + monId);
  const fighters = [
    { key: 'p', kind: 'player', name: 'You', hp: opts.php, maxHp: 100,
      speed: 6, mx: 4, my: 4, alive: true, fled: false, moveLeft: 0, acted: false },
    { key: 'm_test', kind: 'monster', monsterId: monId, mdef, hp: opts.mhp,
      maxHp: opts.mhp, speed: 3, mx: 6, my: 4, alive: true, fled: false,
      telegraph: null, hesitate: 0, blind: 0, stunned: 0 },
  ];
  Game.tbfight = { fighters, over: false, round: 1, order: ['p', 'm_test'], turnIdx: 0,
    fightersByKey: Object.fromEntries(fighters.map(f => [f.key, f])) };
}

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 20261008) });
  K.newRun(Game);
  const s = Game.state.scholar;

  console.log('--- R1. useItem heal lands on the fighter and costs the action ---');
  fight(Game, 'bulldozer', { mhp: 60, php: 50 });
  s.health = 50;
  const p = Game.tbFighter('p');
  let monsterTurns = 0;
  const _mt = Game.tbMonsterTurn;
  Game.tbMonsterTurn = function (m) { monsterTurns++; return _mt.call(this, m); };
  s.inventory.push({ itemId: 'bandana', id: 'bandana', name: 'Bandana', units: 1, kcalEach: 0 });
  const msgs1 = []; const _say1 = Game.say;
  Game.say = m => { msgs1.push(String(m)); return _say1.call(Game, m); };
  Game.useItem(s.inventory.length - 1);
  Game.say = _say1;
  Game.tbMonsterTurn = _mt;
  // the stated amount varies with roster healing modifiers — parse it
  const mAmt = (msgs1.join(' ').match(/\+(\d+) health/) || [])[1];
  const amt = mAmt ? parseInt(mAmt, 10) : 10;
  check('R1 fighter healed (stated amount)', p.hp === 50 + amt, `p.hp=${p.hp}, stated +${amt}`);
  check('R1 scholar synced', s.health === 50 + amt, `s.health=${s.health}`);
  check('R1 combat action spent (turn advanced to the monster)', monsterTurns > 0, `monsterTurns=${monsterTurns}`);
  if (Game.tbfight) Game.tbEnd('fled');

  console.log('--- R2. drinkWater costs the action; risky water hits the fighter ---');
  fight(Game, 'bulldozer', { mhp: 60, php: 50 });
  s.health = 50;
  const p2 = Game.tbFighter('p');
  s.water = [{ quality: 'clean', source: 'test' }];
  s.hydration = 0;
  let monsterTurns2 = 0;
  const _mt2 = Game.tbMonsterTurn;
  Game.tbMonsterTurn = function (m) { monsterTurns2++; return _mt2.call(this, m); };
  Game.drinkWater();
  Game.tbMonsterTurn = _mt2;
  check('R2 drink costs the combat action (turn advanced)', monsterTurns2 > 0, `monsterTurns=${monsterTurns2}`);
  check('R2 hydration applied', s.hydration === 50, `hydration=${s.hydration}`);
  // Exercise the actual 30% branch and its control, rather than requiring
  // luck within six tries. The real drink still spends a combat action.
  for (const [roll, damage] of [[0.1, 5], [0.9, 0]]) {
    if (Game.tbfight) Game.tbEnd('fled');
    fight(Game, 'bulldozer', { mhp: 60, php: 50 });
    const player = Game.tbFighter('p');
    s.water = [{ liters: 1, quality: 'risky', source: 'prepared creek' }]; s.hydration = 0;
    const random = Math.random;
    Math.random = () => roll;
    try { Game.drinkWater(); } finally { Math.random = random; }
    check('R2 risky-water roll ' + roll + ' routes damage ' + damage,
      player.hp === 50 - damage && s.health === player.hp);
    check('R2 risky-water bottle consumed and hydration applied', s.water.length === 0 && s.hydration === 50);
  }
  if (Game.tbfight) Game.tbEnd('fled');

  console.log('--- R3. bad-food damage hits the fighter mid-combat ---');
  fight(Game, 'bulldozer', { mhp: 60, php: 50 });
  s.health = 50;
  const p3 = Game.tbFighter('p');
  s.inventory.push({ name: 'Sketchy bits', units: 1, kcalEach: 100, diseaseRisk: { p: 1, dmg: 7, note: 'test' } });
  let monsterTurns3 = 0;
  const _mt3 = Game.tbMonsterTurn;
  Game.tbMonsterTurn = function (m) { monsterTurns3++; return _mt3.call(this, m); };
  Game.eatOne(s.inventory.length - 1);
  Game.tbMonsterTurn = _mt3;
  check('R3 disease damage hits the fighter', p3.hp === 43, `p.hp=${p3.hp}`);
  check('R3 scholar synced', s.health === 43, `s.health=${s.health}`);
  check('R3 eating still costs the action (turn advanced)', monsterTurns3 > 0, `monsterTurns=${monsterTurns3}`);
  if (Game.tbfight) Game.tbEnd('fled');

  console.log('--- R4. field_medicine heals the fighter ---');
  K.giveAbility(Game, 'field_medicine', { level: 1, force: true });
  fight(Game, 'bulldozer', { mhp: 60, php: 50 });
  s.health = 50;
  const p4 = Game.tbFighter('p');
  s.kcal = 500;
  Game._activateAbilityInner('field_medicine');
  check('R4 fighter healed +20', p4.hp === 70, `p.hp=${p4.hp}`);
  check('R4 scholar synced', s.health === 70, `s.health=${s.health}`);
  if (Game.tbfight) Game.tbEnd('fled');

  console.log('--- R5. out-of-combat behavior unchanged ---');
  s.health = 50;
  Game.addHealth(10);
  check('R5 heal clamps normally out of combat', s.health === 60, `s.health=${s.health}`);
  Game.addHealth(-200);
  check('R5 damage floors at 0 out of combat', s.health === 0, `s.health=${s.health}`);

  console.log('--- R6. trade_of_blows HP cost hits the fighter (sibling sweep) ---');
  K.giveAbility(Game, 'trade_of_blows', { level: 1, force: true });
  fight(Game, 'bulldozer', { mhp: 60, php: 50 });
  s.health = 50;
  const p6 = Game.tbFighter('p');
  const hungerLines = [], previousSay = Game.say;
  s.kcal = 400;
  Game.say = function (message) { hungerLines.push(String(message)); return previousSay.apply(this, arguments); };
  let hungryResult;
  try { hungryResult = Game.useAbility('trade_of_blows', 'open_trade'); } finally { Game.say = previousSay; }
  check('R6 underfed ability refuses without HP/food charge', hungryResult === false && p6.hp === 50 && s.health === 50 && s.kcal === 400 && hungerLines.some(line => /Eat first|eat first/.test(line)));
  s.kcal = 1000;
  const foodCost = Game.abilityKcalCost('trade_of_blows', 'open_trade');
  Game.useAbility('trade_of_blows', 'open_trade');
  check('R6 funded activation pays actual food cost', foodCost > 0 && s.kcal === 1000 - foodCost);
  check('R6 HP cost deducted from the fighter', p6.hp === 40, `p.hp=${p6.hp}`);
  check('R6 scholar synced', s.health === 40, `s.health=${s.health}`);
  // would-kill block still guards (fighter at 5 HP can't pay 10)
  if (Game.tbfight) Game.tbEnd('fled');
  fight(Game, 'bulldozer', { mhp: 60, php: 5 });
  s.health = 5;
  const foodBeforeRefusal = s.kcal;
  const msgs6 = []; const _say6 = Game.say;
  Game.say = m => { msgs6.push(String(m)); return _say6.call(Game, m); };
  Game.useAbility('trade_of_blows', 'open_trade');
  Game.say = _say6;
  check('R6 would-kill cost refused', Game.tbFighter('p').hp === 5 && msgs6.some(m => /Too weak/.test(m)),
    `hp=${Game.tbFighter('p').hp}`);
  check('R6 lethal HP refusal also preserves food', s.kcal === foodBeforeRefusal);
  s.abilities = s.abilities.filter(a => a.id !== 'trade_of_blows');
  if (Game.tbfight) Game.tbEnd('fled');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
