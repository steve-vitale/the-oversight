// Stash ledger proof: actual shared runtime, known names and anonymous actors.
// Seeded setup prepares legal stash actions; refused takes must add no entry.
'use strict';
const K = require('./godpath/lib');
const SEED = Number(process.env.SEED || 20261017);
const T = K.reporter('stash-ledger-names');

(async () => {
  const Game = await K.load({ seed: SEED, narration: true });
  K.newRun(Game);
  const s = Game.state.scholar;
  const me = s.villagerId;
  const others = Game.state.village.roster.filter(id => id !== me);
  T.ok('roster has two other people', others.length >= 2);
  const [v1, v2] = others;
  T.ok('both names unknown initially', !Game.nameKnown(v1) && !Game.nameKnown(v2));
  Game.stashLog('give', 'Wood log', 5, v1);
  Game.stashLog('take', 'Branch', 2, v2);
  Game.stashLog('take', 'Stone', 1, null);
  const text = Game.stashLedgerText(5);
  const lines = text.split('\n');
  T.ok('three actor records', lines.length === 3, text);
  T.ok('unknown actors never collapse to bare A', !lines.some(l => /: A (took|left) /.test(l)), text);
  T.ok('first giver uses actual firstRef', lines.some(l => l.includes(Game.firstRef(v1)) && l.includes('left 5× Wood log')), text);
  T.ok('second taker uses actual firstRef', lines.some(l => l.includes(Game.firstRef(v2)) && l.includes('took 2× Branch')), text);
  T.ok('explicit null actor stays anonymous', lines.some(l => l.includes('someone took 1× Stone')), text);
  const who1 = lines.find(l => l.includes('Wood log')).split(': ')[1].split(' left')[0];
  const who2 = lines.find(l => l.includes('Branch')).split(': ')[1].split(' took')[0];
  T.ok('unknown people have distinct descriptions', who1 !== who2, who1 + ' / ' + who2);
  T.ok('unknown first giver has descriptive reference', /the /.test(who1), who1);
  const firstName = String(Game.data.villagers.find(v => v.id === v1).name).split(' ')[0];
  T.ok('unlearned first name is absent from giver reference', !who1.split(/\s+/).includes(firstName), who1);

  Game.revealName(v1, 'intro');
  Game.stashLog('give', 'Plant fiber', 3, v1);
  T.ok('introduction reveals the name', Game.nameKnown(v1));
  T.ok('known giver shows first name', Game.stashLedgerText(5).split('\n')[0].includes(firstName + ' left 3× Plant fiber'));
  T.ok('all roster references avoid bare A', others.every(id => Game.firstRef(id) !== 'A' && !/^A /.test(Game.firstRef(id))));

  // A prepared legal transaction, not a claim that every random starting pack
  // can withdraw two logs after a time-advancing donation.
  s.inventory = [];
  s.kcal = 2400;
  s.health = Game.maxHealth();
  Game.addMaterial('wood', 6);
  const stash = Game.stashState();
  const stock = stash.materials.wood;
  const total = stock + Game.materialCount('wood');
  const ledgerStart = stash.ledger.length;
  T.ok('prepared transaction is outside combat and ending', !Game.over && !Game.inCombat());
  const deposit = Game.donateMaterial('wood', 4);
  T.ok('donation succeeds with exact stock conservation', deposit != null && stash.materials.wood === stock + 4 && Game.materialCount('wood') === 2);
  T.ok('donation creates exactly one player receipt', stash.ledger.length === ledgerStart + 1 && Game.stashLedgerText(1).includes(Game.firstRef(me) + ' left 4× Wood log'));
  const wood = s.inventory.find(i => i.material === 'wood');
  const carry = s.inventory.reduce((n, i) => n + (i.kg || 0) * (i.units || 1), 0) + Game.waterWeight();
  T.ok('two logs fit before withdrawal', Game.carryCapacity() - carry >= 2 * wood.kg, JSON.stringify({ carry, capacity: Game.carryCapacity(), kg: wood.kg }));
  T.ok('withdrawal remains outside combat and ending', !Game.over && !Game.inCombat());
  const take = Game.takeMaterial('wood', 2);
  T.ok('withdrawal succeeds with exact stock conservation', take != null && stash.materials.wood === stock + 2 && Game.materialCount('wood') === 4);
  T.ok('withdrawal creates exactly one player receipt', stash.ledger.length === ledgerStart + 2 && Game.stashLedgerText(1).includes(Game.firstRef(me) + ' took 2× Wood log'));
  T.ok('round trip conserves total wood', stash.materials.wood + Game.materialCount('wood') === total);

  // Use real material weight to prove a refused action is not an event.
  Game.addMaterial('wood', 1000);
  const before = { stock: stash.materials.wood, held: Game.materialCount('wood'), ledger: stash.ledger.length };
  const weight = s.inventory.reduce((n, i) => n + (i.kg || 0) * (i.units || 1), 0) + Game.waterWeight();
  T.ok('refusal fixture exceeds actual carry capacity', weight > Game.carryCapacity());
  const said = [], originalSay = Game.say;
  Game.say = function(t, ...args) { said.push(String(t)); return originalSay.call(this, t, ...args); };
  let refused;
  try { refused = Game.takeMaterial('wood', 1); }
  finally { Game.say = originalSay; }
  T.ok('overweight withdrawal refuses with weight feedback', refused === null && said.some(t => /Too heavy/.test(t)), said.join(' | '));
  T.ok('refusal moves no wood', stash.materials.wood === before.stock && Game.materialCount('wood') === before.held);
  T.ok('refusal adds no player receipt', stash.ledger.length === before.ledger);
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
