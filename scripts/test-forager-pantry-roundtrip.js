// FORAGER BREAK-IT 2026-10-11: pantry granary round-trip spoilage bypass.
// EXPLOIT: at haven tier 3+, donateToPantry bakes +3d (fresh) / +14d
// (preserved) into the pantry entry's spoilDay. takeFromPantry /
// takeFromPantryBulk copy that inflated clock back into the pack with NO
// unwind. Each donate->take-back cycle permanently extends the clock:
// shuttle food a few times and it never spoils. Rot becomes optional.
// AFTER FIX: the deposit records granaryDays; the take subtracts it back.
// One deposit still enjoys the cool-bin bonus while shelved; the clock
// leaves the pantry exactly as it entered.
'use strict';
const h = require('./break-monsters-harness.js');
// havenGrowth.js is missing from the shared harness ORDER (it defines
// granarySpoilBonus); load it in index.html position before freshGame.
h.ORDER.splice(h.ORDER.indexOf('src/js/hierarchy.js'), 0, 'src/js/havenGrowth.js');

async function main() {
  const G = await h.freshGame(4242);
  const s = G.state.scholar;
  const v = G.state.village;
  G.say = () => {};
  let fails = 0;
  const check = (n, c, d) => { console.log((c ? 'PASS' : 'FAIL') + ' | ' + n + (d ? ' | ' + d : '')); if (!c) fails++; };

  v.havenTier = 3; // granary bins: +3d fresh, +14d preserved
  check('T0 bonus active', G.granarySpoilBonus('ready') === 3 && G.granarySpoilBonus('preserved') === 14,
    `fresh=${G.granarySpoilBonus('ready')} preserved=${G.granarySpoilBonus('preserved')}`);

  const DAY = 20;
  s.day = DAY;
  const mkFood = (spoilDay, state) => ({
    name: 'Berries', kcalEach: 50, units: 4, spoilDay, safe: true, kg: 0.1,
    unit: 'handful', foodKind: 'plant', foodState: state || 'ready', edible: true,
  });

  // S1: one honest deposit — the shelved entry keeps the cool-bin bonus.
  s.inventory = [mkFood(DAY + 2, 'ready')];
  v.pantry = [];
  G.donateToPantry(0);
  const shelved = v.pantry[0] && v.pantry[0].spoilDay;
  check('S1 deposit gains granary bonus while shelved', shelved === DAY + 5, `pantry spoilDay=${shelved} (want ${DAY + 5})`);

  // S2: single take-back — the clock must leave as it entered.
  G.takeFromPantry(0);
  const back = s.inventory.find(i => i.name === 'Berries');
  check('S2 take-back unwinds bonus (single)', back && back.spoilDay === DAY + 2,
    `pack spoilDay=${back && back.spoilDay} (want ${DAY + 2})`);

  // S3: the hostile loop — 5 donate/take-back cycles on one item.
  let item = mkFood(DAY + 2, 'ready');
  for (let c = 0; c < 5; c++) {
    s.inventory = [item]; v.pantry = [];
    G.donateToPantry(0);
    G.takeFromPantry(0);
    item = s.inventory.find(i => i.name === 'Berries');
  }
  check('S3 no clock growth over 5 cycles', item.spoilDay === DAY + 2,
    `after 5 cycles spoilDay=${item.spoilDay} (want ${DAY + 2})`);

  // S4: preserved food — +14/cycle is the bigger hole.
  let pitem = mkFood(DAY + 30, 'preserved');
  for (let c = 0; c < 5; c++) {
    s.inventory = [pitem]; v.pantry = [];
    G.donateToPantry(0);
    G.takeFromPantry(0);
    pitem = s.inventory.find(i => i.name === 'Berries');
  }
  check('S4 preserved: no clock growth over 5 cycles', pitem.spoilDay === DAY + 30,
    `after 5 cycles spoilDay=${pitem.spoilDay} (want ${DAY + 30})`);

  // S5: bulk take path unwinds too.
  s.inventory = []; v.pantry = [];
  s.inventory = [mkFood(DAY + 2, 'ready')];
  G.donateToPantry(0);
  G.takeFromPantryBulk({ 0: 4 });
  const bulkBack = s.inventory.find(i => i.name === 'Berries');
  check('S5 bulk take unwinds bonus', bulkBack && bulkBack.spoilDay === DAY + 2,
    `pack spoilDay=${bulkBack && bulkBack.spoilDay} (want ${DAY + 2})`);

  // S6: immortal-clock items (spoilDay 9999) come back immortal, not inflated.
  s.inventory = [{ name: 'Pemmican bar', kcalEach: 600, units: 1, spoilDay: 9999, safe: true,
    kg: 0.3, unit: 'bar', foodKind: 'meat', foodState: 'preserved', edible: true }];
  v.pantry = [];
  G.donateToPantry(0);
  G.takeFromPantry(0);
  const imm = s.inventory.find(i => i.name === 'Pemmican bar');
  check('S6 immortal clock survives round trip', imm && imm.spoilDay === 9999,
    `pack spoilDay=${imm && imm.spoilDay} (want 9999)`);

  // S7: regression — food left shelved still enjoys the bonus (isSpoiled
  // reads the baked clock; the pantry UI's SPOILED flag agrees).
  s.inventory = [mkFood(DAY + 2, 'ready')];
  v.pantry = [];
  G.donateToPantry(0);
  const shelvedItem = v.pantry[0];
  check('S7 shelved food not spoiled inside bonus window',
    G.isSpoiled(shelvedItem) === false, `spoilDay=${shelvedItem.spoilDay} day=${DAY}`);

  console.log(fails ? `\n${fails} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
