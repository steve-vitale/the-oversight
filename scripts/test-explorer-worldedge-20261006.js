// Explorer border regression, updated for Muse's 2026-10-28 beyond-map travel.
// Preserve the undefined-destination crash protection. Adjacent beyond ground
// is offered now; an unoffered coordinate must still refuse without payment.
const assert = require('assert/strict');
const K = require('./godpath/lib');
(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 20261006), narration: true });
  const said = [], say = Game.say.bind(Game);
  Game.say = m => { said.push(String(m)); return say(m); };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart(); Game.exitBuilding();
  // Prepared west rim; open cells keep habitat outside this boundary probe.
  Game.map.px = 0; Game.map.py = 3; Game.reveal(0, 3);
  const det = Game.genDetail(0, 3);
  det[4][0] = 'grass'; det[4][1] = 'grass';
  Game.state.scholar.mx = 0; Game.state.scholar.my = 4;
  assert.deepEqual(Game.edgeExit(0, 4), { dx: -1, dy: 0, dir: 'west' });
  const beforeOffer = JSON.stringify(Game.map.beyond || {});
  const offered = Game.travelTargets();
  assert(offered.some(t => t.x === -1 && t.y === 3 && t.d === 1 && t.unknown));
  assert.equal(JSON.stringify(Game.map.beyond || {}), beforeOffer, 'reading targets generated ground');
  const beforeRefusal = JSON.stringify({ scholar: Game.state.scholar, map: Game.map });
  for (const [x, y] of [[100, 3], [7, 3], [NaN, 3]]) {
    assert.equal(Game.travelTo(x, y), null, 'unoffered travel must refuse without throwing');
  }
  assert.equal(JSON.stringify({ scholar: Game.state.scholar, map: Game.map }), beforeRefusal,
    'invalid destination changed resources, position or world');
  said.length = 0;
  const first = Game.tryNodeExit(-1, 0);
  assert(first && first.moved);
  assert.equal(Game.map.px, -1); assert.equal(Game.map.py, 3);
  const firstTile = Game.tileAt(-1, 3);
  assert(firstTile && firstTile.revealed, 'successful arrival needs real revealed ground');
  assert.equal(said.filter(t => /world keeps going past the old edge/.test(t)).length, 1);
  assert(said.some(t => /Travel 1 tile/.test(t)), 'crossing must narrate arrival');
  said.length = 0;
  const second = Game.tryNodeExit(-1, 0);
  assert(second && second.moved);
  assert.equal(Game.map.px, -2); assert.equal(Game.map.py, 3);
  assert(Game.tileAt(-2, 3));
  assert(!said.some(t => /world keeps going past the old edge/.test(t)), 'introduction repeated');
  assert(said.some(t => /Travel 1 tile/.test(t)), 'later crossing must still narrate arrival');
  // Return through the same generated object, then onto the home board.
  Game.travelTo(-1, 3);
  assert.equal(Game.map.px, -1);
  assert.equal(Game.tileAt(-1, 3), firstTile, 'return regenerated visited ground');
  for (const x of [0, 1]) {
    const tile = Game.tileAt(x, 3); delete tile.blockFrom; delete tile.needsBridge;
    assert(Game.travelTargets().some(t => t.x === x && t.y === 3));
    said.length = 0; Game.travelTo(x, 3);
    assert.equal(Game.map.px, x); assert.equal(Game.map.py, 3);
    assert(said.some(t => /Travel 1 tile/.test(t)));
  }
  assert.equal(Game.map.tiles.length, 9);
  assert(Game.map.tiles.every(row => row.length === 9), 'beyond travel expanded the home array');
  console.log('Explorer boundary: offered-only travel, free invalid refusal, real beyond crossings, one introduction and exact return passed.');
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
