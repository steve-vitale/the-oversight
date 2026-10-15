// REPO=<worktree> SEED=1 BUILD=default|strong DRIVER=capable|strike node netprobe.js
// Plays THE NETWORK debug scenario node by node with a real blow-by-blow
// fight driver (teleporting between node tiles; march upkeep ignored).
const path = require('path');
const REPO = process.env.REPO;
const H = require(path.join(REPO, 'scripts/sim-harness'));
const { capable } = require(path.join(REPO, 'scripts/policies/capable'));
(async () => {
  const seed = +process.env.SEED || 1;
  const { Game } = await H.quietLog(() => H.loadGame({ seed, mode: 'netprobe' }));
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.debugScenario(process.env.SCEN || 'network');
  let s = Game.state.scholar;
  const out = { seed, build: process.env.BUILD || 'default', driver: process.env.DRIVER || 'capable', nodes: [] };
  if (process.env.BUILD === 'strong') {
    // A strong late build: best tier weapon + armor in hand, full kcal, six
    // combat abilities, high integration.
    s.integration = 90;
    const items = Game.data.items || [];
    const best = (pred) => items.filter(pred).sort((a, b) => ((b.damage || b.dmg || 0) - (a.damage || a.dmg || 0)))[0];
    const w = best(i => i.slot === 'melee' || i.type === 'weapon' && !i.ranged);
    out.weapon = w && w.id;
    if (w) { s.inventory = s.inventory || []; s.inventory.push({ itemId: w.id, units: 1 }); try { Game.equipItem ? Game.equipItem(w.id) : null; } catch (e) { out.equipErr = e.message; } }
    s.kcal = 20000; s.maxHealth = Math.max(s.maxHealth || 100, 200); s.health = s.maxHealth;
    for (const id of (process.env.ABIL || 'rage,war_cry,battlefield_grace,pyrokinesis,haymaker,scream_cheese').split(',')) {
      const def = (Game.data.abilities || []).find(a => a.id === id);
      if (def) s.abilities.push({ id, name: def.name || id, level: 3, xp: 0 });
    }
  }
  const ends = [];
  const _te = Game.tbEnd;
  Game.tbEnd = function (res) { ends.push({ res, fight: JSON.stringify((Game.state.titans || {})._fight || null) }); return _te.apply(this, arguments); };
  out.ends = ends;
  const nodes = Game.networkNodes();
  const ctx = {};
  const pol = process.env.DRIVER === 'strike' ? {} : capable;
  for (let attempt = 0; attempt < 30; attempt++) {
    const c = Game.networkCampaign();
    if (c.lost || c.done) break;
    const node = nodes[c.idx];
    if (!node) break;
    const t = c.tiles[node.id];
    const s = Game.state.scholar;
    Game.map.px = t.x; Game.map.py = t.y; s.insideHaven = false; s.mx = 1; s.my = 4;
    s.health = s.maxHealth || 100; // camp heals fully for the probe (upper bound)
    const before = Game._networkTest.survivors();
    const r = Game.startCombat(node.monster);
    if (r == null || !Game.tbfight) { out.nodes.push({ node: node.id, refused: true, before }); break; }
    const f = Game.tbfight;
    const mon = f.fighters.filter(x => x.kind === 'monster').map(x => x.name + ':' + Math.round(x.hp));
    const pos0 = f.fighters.map(x => x.kind[0] + ':' + x.mx + ',' + x.my + (x.mdef && x.mdef.follows === false ? '(nf)' : '')).join(' ');
    let rounds = 0;
    for (let i = 0; i < 40 && Game.tbfight && !Game.tbfight.over && !Game.over; i++) {
      H.driveFights(Game, pol, ctx);
      rounds = Game.tbfight ? Game.tbfight.round : rounds;
      if (Game.tbfight && !Game.tbfight.over && !Game.tbIsPlayerTurn()) { try { Game.tbAdvance(); } catch (e) { out.advErr = e.message; break; } }
    }
    const live = Game.tbfight && !Game.tbfight.over;
    const pf = f.fighters.find(x => x.key === 'p');
    const monLeft = f.fighters.filter(x => x.kind === 'monster' && x.alive).map(x => x.name + ':' + Math.round(x.hp) + (x.fled ? ':FLED' : ''));
    const alliesAlive = f.fighters.filter(x => x.kind === 'ally' && x.alive).length;
    if (live) { try { Game.tbEnd('fled'); } catch (e) { out.endErr = e.message; } }
    out.nodes.push({ node: node.id, before, after: Game._networkTest.survivors(), rounds: f.round, grid: f.gridSize, pos0, posEnd: f.fighters.filter(x=>x.alive).map(x => x.kind[0] + ':' + x.mx + ',' + x.my).join(' '), monsters: mon, monLeft, alliesAlive, worldPiece: (Game.worldMonsters().find(w => w.networkNode === node.id) || {}).hp, playerHp: pf ? Math.round(pf.hp) : null, cleared: Game.networkCampaign().cleared.length, stuck: live, over: !!Game.over });
    if (Game.over) { out.gameOver = true; break; }
  }
  const pg = Game.progState();
  out.fallen = !!pg.networkFallen; out.lost = !!pg.networkLost;
  console.log(JSON.stringify(out));
})();
