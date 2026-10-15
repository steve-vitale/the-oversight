// Proof: nomad-scenes trails — knowledge-gated clue levels, keepsake + road sharpening.
// RED->GREEN discipline: run before/after src/js/nomad-scenes.js changes.
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', msg); }
}

async function main() {
  const seed = parseInt(process.env.SEED || '1201', 10);
  const { Game } = await loadGame({ seed, narration: true });
  ok(!!Game.nomadScenes, 'Game.nomadScenes exposed');
  await setupGame(Game, 'Columbus, Ohio');

  const kin = (Game.state.world.kin || []).filter(k => k.fate === 'scattered' && k.owner === Game.villagerId);
  ok(kin.length > 0, 'player has scattered kin, got ' + kin.length);
  const target = kin[0];
  const regionName = Game.worldRegionName(target.region);

  // L0: vague — continent only, never the region name.
  const t0 = Game.nomadScenes.trailFor(target.name);
  ok(t0 && t0.level === 0, 'trailFor level 0');
  ok(t0.text.indexOf(regionName) === -1, 'L0 never names the region (got: ' + t0.text.slice(0, 80) + ')');
  ok(/Somewhere in/.test(t0.text), 'L0 is continent-vague');
  ok(t0.regionId === null, 'L0 exposes no regionId');
  // SENSE: second person.
  ok(/your|you/i.test(t0.text), 'L0 in second person');

  // Road sharpening, one step, no double-count.
  const s1 = Game.nomadScenes.sharpenTrail(target.name, 'villager');
  ok(s1.ok && s1.level === 1, 'villager sharpen -> level 1');
  const t1 = Game.nomadScenes.trailFor(target.name);
  ok(t1.text.indexOf(regionName) === -1, 'L1 still never names the region');
  ok(t1.text.length > t0.text.length, 'L1 adds narrowing');
  const dup = Game.nomadScenes.sharpenTrail(target.name, 'villager');
  ok(!dup.ok && dup.reason === 'already', 'same source cannot sharpen twice');

  // Second distinct source -> level 2, region named AND now known.
  const s2 = Game.nomadScenes.sharpenTrail(target.name, 'broadcast');
  ok(s2.ok && s2.level === 2, 'broadcast sharpen -> level 2');
  const t2 = Game.nomadScenes.trailFor(target.name);
  ok(t2.text.indexOf(regionName) !== -1, 'L2 names the region');
  ok(t2.regionId === target.region, 'L2 exposes regionId');
  ok(Game.state.world.regions[target.region].known === true, 'naming marks the region heard');

  // Bad inputs.
  ok(Game.nomadScenes.trailFor('Nobody Here') === null, 'unknown kin -> null');
  const bad = Game.nomadScenes.sharpenTrail(target.name, 'dreams');
  ok(!bad.ok && bad.reason === 'bad-source', 'bad source rejected');

  // Keepsake path: negative (no keepsake) ...
  const kin2 = kin[1] || kin[0];
  const nk = Game.nomadScenes.sharpenTrail(kin2.name, 'keepsake');
  ok(!nk.ok && nk.reason === 'no-keepsake', 'keepsake sharpen with none -> no-keepsake');

  // ... and positive: worn keepsake of that person at L2 names the region.
  // Find a kin whose relation matches a real keepsake def.
  const defs = { mother: 'mothers_ring', father: null, daughter: 'daughters_drawing', brother: 'dead_phone' };
  let setup = null;
  for (const k of kin) {
    if (defs[k.relation]) { setup = { kin: k, itemId: defs[k.relation] }; break; }
  }
  if (setup) {
    const it = { itemId: setup.itemId, sentimental: true, bond: 30, units: 1 };
    Game.state.scholar.inventory.push(it);
    Game.state.scholar.equipped = Game.state.scholar.equipped || {};
    Game.state.scholar.equipped.acc1 = it;
    const kp = Game.keepsakeKinPerson(it);
    ok(!!kp, 'keepsake resolves to a lifeseed person');
    if (kp && kp.name === setup.kin.name) {
      const ks = Game.nomadScenes.sharpenTrail(setup.kin.name, 'keepsake');
      ok(ks.ok && ks.level === 2, 'worn L2 keepsake names the region');
      const tk = Game.nomadScenes.trailFor(setup.kin.name);
      ok(tk.text.indexOf(Game.worldRegionName(setup.kin.region)) !== -1, 'keepsake trail names region');
    } else {
      console.log('SKIP: keepsake person ' + (kp && kp.name) + ' != kin ' + setup.kin.name + ' (seed mismatch, relation-matched def only)');
    }
  } else {
    console.log('SKIP: no kin relation matched a keepsake def this seed');
  }

  console.log(`nomadscenes-trails: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
