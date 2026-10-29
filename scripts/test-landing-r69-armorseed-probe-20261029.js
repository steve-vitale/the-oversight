// R69 ARMOR-SEED PROBE (adjudication only): at village creation, for one
// seed, dump every roster villager's kit (items), stashed, equipped, goal,
// plus village.armorSeedVid — replicating seedArmorWearer's own
// precondition (staying + carries bark/hide armor in items OR stashed).
// Usage: node scripts/test-landing-r69-armorseed-probe-20261029.js <seed>
// Exit 0 prints the table; exit 2 on load failure. Driver-only, zero src/js.
const { loadGame, setupGame } = require('./sim-harness.js');
(async () => {
  const seed = parseInt(process.argv[2] || '700', 10);
  const lg = await loadGame({ seed });
  const Game = lg.Game;
  if (lg.loadFails && lg.loadFails.length) { console.log('LOAD FAILS: ' + JSON.stringify(lg.loadFails)); process.exit(2); }
  await setupGame(Game);
  const v = Game.state.village || {};
  const rc = v.rosterChars || {};
  const idOf = (it) => (it && (it.itemId || it.id)) || it;
  console.log(`seed=${seed} armorSeedVid=${v.armorSeedVid || 'null'} scholarId=${Game.villagerId}`);
  let durableSeed = false;
  for (const id of (v.roster || [])) {
    const p = rc[id] || {};
    const kit = (p.items || []).map(idOf);
    const stashed = (p.stashed || []).map(idOf);
    const eq = Object.values(p.equipped || {}).map(e => (e && e.itemId) || '');
    const carries = kit.concat(stashed).some(x => x === 'bark_armor' || x === 'hide_armor');
    let goal = '?';
    try { goal = Game.npcGoal ? Game.npcGoal(id) : '?'; } catch (e) {}
    if (id !== Game.villagerId && !p.dead && carries && goal !== 'escape') durableSeed = true;
    console.log(`${id} dead=${!!p.dead} goal=${goal} carriesArmor=${carries} kit=[${kit.join(',')}] stashed=[${stashed.join(',')}] equipped=[${eq.join(',')}]`);
  }
  // PROOF: grant fired OR a staying carrier already existed (valid skip).
  // A null seedVid with no staying carrier is a seed-path failure.
  const ok = !!(v.armorSeedVid || durableSeed);
  console.log(ok ? `SEED-OK seed=${seed} (grant=${!!v.armorSeedVid} durableSeed=${durableSeed})`
                 : `SEED-FAIL seed=${seed} (no grant, no staying carrier)`);
  process.exit(ok ? 0 : 1);
})().catch(e => { console.log('PROBE FATAL: ' + (e && e.stack || e)); process.exit(2); });
