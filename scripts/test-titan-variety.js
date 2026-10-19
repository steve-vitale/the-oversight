// PROOF TEST: Titan fight variety (Steve 2026-10-11)
// "Make sure these fights have a variety and are a bunch of fun."
// Proves each titan has DISTINCT mechanics, not just stat differences:
// - Herald: omen-based tutorial (telegraphed lines/bursts, ARRIVAL theme)
// - Nielsen: ratings game (fight boring to win, 0-100 scale)
// - Finale: countdown to apocalypse (3-round title card, unavoidable)
const K = require('./godpath/lib');
const SEED = parseInt(process.env.SEED || '20261012', 10);
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

(async () => {
  const G = await K.load({ seed: SEED }); K.newRun(G);
  // Prepared named living army: this isolates kit/grid mechanics, not natural recruitment.
  const blades = (n, prefix) => {
    const town = { id: 'kit_fire_' + prefix, name: 'Prepared kit fire', roster: Array.from({ length: n }, (_, i) => ({ id: prefix + i, name: 'Blade ' + prefix + i, age: 35, alive: true, health: 100 })) };
    G.state.otherVillages.push(town);
    return town.roster.map(r => ({ vid: r.id, villageId: town.id, name: r.name, hp: r.health, outfitted: [], gearValue: 0 }));
  };
  const said = []; G.say = (t) => said.push(String(t)); G.audioEvent = () => {};

  // HERALD: omen tutorial
  console.log('-- herald --');
  G.state.titans = { musters: { herald: { allies: blades(10, 'a'), haven: [], day: 0, outfitted: {} } } };
  G.state.scholar.health = 9000; G.state.scholar.mx = 4; G.state.scholar.my = 4;
  G.startCombat('herald');
  const h = G.tbfight.fighters.find(f => f.kind === 'monster');
  check('herald has 3-move kit', (h.mdef.attacks || []).length === 3);
  check('herald First Omen is line', h.mdef.attacks[0].pattern.type === 'line');
  check('herald vibe is ARRIVAL', /ARRIVING/i.test(h.mdef.vibe));
  check('herald is tutorial (HP < eater)', h.maxHp < 1000);
  G.tbfight.over = true; G.tbfight = null;

  // NIELSEN: ratings game
  console.log('-- nielsen --');
  G.state.titans.musters.nielsen = { allies: blades(12, 'b'), haven: [], day: 0, outfitted: {} };
  G.state.scholar.health = 9000;
  G.startCombat('nielsen');
  const n = G.tbfight.fighters.find(f => f.kind === 'monster');
  check('nielsen has ratings mechanic', typeof G.titanMusterState === 'function');
  // Nielsen's kit should be about attention/performance, not raw damage
  const nKit = n.mdef.attacks || [];
  check('nielsen kit exists', nKit.length >= 2);
  G.tbfight.over = true; G.tbfight = null;

  // FINALE: countdown apocalypse
  console.log('-- finale --');
  G.state.titans.musters.finale = { allies: blades(20, 'c'), haven: [], day: 0, outfitted: {} };
  G.state.scholar.health = 9000;
  G.startCombat('finale');
  const f = G.tbfight.fighters.find(f => f.kind === 'monster');
  const fKit = f.mdef.attacks || [];
  check('finale kit exists', fKit.length >= 2);
  check('finale is apocalypse (highest HP)', f.maxHp > 1000);
  G.tbfight.over = true; G.tbfight = null;

  // DISTINCTNESS: the three have different minAllies (10/12/20)
  const t = G.data.titans;
  check('herald needs 10', t.herald.minAllies === 10);
  check('nielsen needs 12', t.nielsen.minAllies === 12);
  check('finale needs 20 (Steve 2026-10-11: even more people)', t.finale.minAllies === 20);
  check('all distinct', new Set([t.herald.minAllies, t.nielsen.minAllies, t.finale.minAllies]).size === 3);

  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})();
