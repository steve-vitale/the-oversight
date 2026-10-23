// test-graves-20261022.js — proof for rogue P1 "Persistent grave markers at
// the Haven fire" (Talk 7 N7-3).
//
// GREEN (post-fix):
//   1. buryCorpse raises a grave at the Haven fire: name (knowledge-gated at
//      burial), cause, day, node = the Haven node, a free cell by the fire.
//   2. Burial and grave-raising both narrate (no silent actions).
//   3. examineGrave narrates; payGraveRespects mirrors the corpse rite
//      (-3 trauma, once per grave; inherits the corpse's respectsPaid so a
//      body already honored doesn't pay out twice; later visits narrate).
//   4. Names are knowledge-gated: unknown → descriptor (never the true
//      name), known → first name, dead bearer → the village's true first name.
//   5. The Taken gate: createGrave refuses anything without a villagerId —
//      the Taken are never villager records and never produce corpses, so no
//      grave can ever exist for unknown fate.
//   6. One grave per villager; distinct cells for multiple graves; graves
//      live on state.village (in-run only, die with the village).
//   7. graveSpot trusts the GROUNDS detail only — never the hall alias
//      (t.detail inside the hall), and the static fallback avoids the mapgen
//      constants (fire, lodge, doorstep).
// UI rendering itself can't be proven in node — the 🪦 cell glyph and the
// tap actions need Steve's phone eyes. ([needs-eyes])
//
// Run: node scripts/test-graves-20261022.js   (SEED=... override)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '20261022', 10);

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-graves', narration: true });
  await setupGame(Game);
  let fails = 0;
  const ok = (cond, msg, extra) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' — ' + msg + (cond || !extra ? '' : ' :: ' + extra));
    if (!cond) fails++;
  };
  const logText = () => Game.log.map(e => (e && e.text != null) ? e.text : String(e));
  // NOTE: Game.log caps at 40 entries, so narration assertions read the
  // TAIL of the log, not an absolute mark.
  const recent = (n) => logText().slice(-(n || 8)).join('\n');
  const trueFirst = vid => String(((Game.data.villagers || []).find(p => p.id === vid) || {}).name || '').split(' ')[0];
  const fallenFor = vid => (Game.state.village.fallen || []).find(f => f.villagerId === vid);
  const fresh = () => Game.state.village.roster.filter(id => id !== Game.villagerId && !fallenFor(id));
  const kill = vid => {
    Game.hurtVillager(vid, 99999, 'monster');
    return Game.corpses().find(c => c.villagerId === vid && !c.buried) || null;
  };
  const havenNode = () => {
    const v = Game.state.village || {};
    return { x: v.px != null ? v.px : 4, y: v.py != null ? v.py : 4 };
  };
  const havenTile = () => { const n = havenNode(); return Game.tileAt(n.x, n.y); };

  ok(typeof Game.createGrave === 'function', 'createGrave is wired (harness loaded graves.js)');
  ok(Array.isArray(Game.graves()) && Game.graves().length === 0, 'no graves before any burial');
  ok(Game.buryCorpse('nope') === null, 'buryCorpse on a missing id returns null');

  // --- 1. Burial raises a grave at the Haven fire, knowledge-gated name.
  const vid1 = fresh().find(id => !Game.nameKnown(id));
  ok(!!vid1, 'found a villager whose name is unknown pre-System');
  const tf1 = trueFirst(vid1);
  const c1 = kill(vid1);
  ok(!!c1, 'hurtVillager produced a corpse for the victim');
  ok(Game.buryCorpse(c1.id) === true, 'buryCorpse succeeded');
  const g1 = Game.graveFor(vid1);
  ok(!!g1, 'burial raised a grave');
  ok(g1 && g1.villagerId === vid1, 'grave carries the villagerId');
  ok(g1 && g1.name && g1.name !== tf1, `grave name is knowledge-gated ("${g1 && g1.name}" hides true first name "${tf1}")`);
  ok(g1 && g1.name === Game.fallenName(vid1), 'grave name matches the fallen-memorial gated convention');
  ok(g1 && g1.cause === c1.cause, `grave carries the cause ("${g1 && g1.cause}")`);
  ok(g1 && g1.day === Game.state.scholar.day, 'grave carries the burial day');
  const hn = havenNode();
  ok(g1 && g1.node && g1.node.x === hn.x && g1.node.y === hn.y, 'grave node is the Haven node');
  ok(/marker by the fire/i.test(recent(6)), 'grave-raising narrates (no silent burial)');
  ok(g1 && recent(6).indexOf(g1.name) >= 0, 'the raising line names the dead');

  // --- 2. Grave cell: free walkable ground near the fire (static fallback:
  // the harness never generates the grounds detail — see section 7).
  ok(g1 && g1.mx >= 0 && g1.mx <= 8 && g1.my >= 0 && g1.my <= 8, `grave cell in-bounds (${g1 && g1.mx},${g1 && g1.my})`);
  const d1 = Math.abs(g1.mx - 2) + Math.abs(g1.my - 4);
  ok(d1 <= 4, `grave is by the fire (manhattan ${d1} from the mapgen pit at 2,4)`);
  const avoid = ['2,4', '3,3', '4,3', '5,3', '3,4', '4,4', '5,4', '4,5'];
  ok(!avoid.includes(g1.mx + ',' + g1.my), 'static fallback avoids the fire/lodge/doorstep constants');
  ok(Game.graveAt(g1.mx, g1.my).some(g => g.id === g1.id), 'graveAt finds the grave on its cell');
  ok(Array.isArray(Game.graveAt(0, 0)), 'graveAt returns an array (no throw on empty cell)');

  // --- 3. examineGrave narrates; visits counted.
  Game.examineGrave(g1.id);
  ok(recent(4).length > 0, 'examine narrates (no silent actions)');
  ok(recent(4).indexOf(g1.name) >= 0, 'examine text carries the gated name');
  ok(/day \d+/.test(recent(4)) && recent(4).indexOf(g1.cause) >= 0, 'examine text carries day and cause');
  ok(Game.graveFor(vid1).visits === 1, 'examine counts the visit');
  Game.examineGrave('nope');
  ok(/Nothing there/.test(recent(2)), 'examine on a missing grave says "Nothing there"');

  // --- 4. payGraveRespects mirrors the corpse rite: -3 trauma, once.
  Game.state.scholar.trauma = 10;
  ok(Game.payGraveRespects(g1.id) === true, 'payGraveRespects returns true');
  ok(Game.state.scholar.trauma === 7, 'first respects: -3 trauma');
  ok(Game.graveFor(vid1).respectsPaid === true, 'respectsPaid recorded on the grave');
  ok(/-3 trauma/.test(recent(4)), 'the rite narrates its effect');
  Game.payGraveRespects(g1.id);
  ok(Game.state.scholar.trauma === 7, 'second respects: no further trauma (once per grave)');
  ok(/already said your words/.test(recent(4)), 'second visit narrates, never silently');

  // --- 5. Inheritance: a body honored at the graveside doesn't pay twice.
  const vid2 = fresh().find(id => !Game.nameKnown(id));
  ok(!!vid2, 'found a second victim');
  const c2 = kill(vid2);
  ok(!!c2, 'second corpse produced');
  ok(Game.payRespects(c2.id) === true, 'payRespects on the corpse succeeded');
  Game.buryCorpse(c2.id);
  const g2 = Game.graveFor(vid2);
  ok(g2 && g2.respectsPaid === true, 'grave inherits the corpse respectsPaid (no double-dip)');
  const tBefore = Game.state.scholar.trauma;
  Game.payGraveRespects(g2.id);
  ok(Game.state.scholar.trauma === tBefore, 'no trauma change when the body was already honored');

  // --- 6. Known name at burial → first name on the marker.
  const vid3 = fresh().find(id => !Game.nameKnown(id));
  ok(!!vid3, 'found a third victim');
  Game.revealName(vid3, 'intro');
  ok(Game.nameKnown(vid3), 'name revealed before death');
  const tf3 = trueFirst(vid3);
  const c3 = kill(vid3);
  Game.buryCorpse(c3.id);
  const g3 = Game.graveFor(vid3);
  ok(g3 && g3.name === tf3, `known name stored as firstRef ("${g3 && g3.name}" === "${tf3}")`);

  // --- 7. Multiple graves get distinct cells; one per villager. Grounds
  // detail trusted, hall alias ignored: plant a fake grounds detail with
  // the fire at (6,6) and a hall-layout t.detail — new graves must anchor
  // on the GROUNDS fire, never the hall's.
  const t = havenTile();
  const grounds = [];
  for (let y = 0; y < 9; y++) { grounds.push([]); for (let x = 0; x < 9; x++) grounds[y].push('grass'); }
  grounds[4][3] = 'lodge'; grounds[6][6] = 'fire';
  const hall = [];
  for (let y = 0; y < 9; y++) { hall.push([]); for (let x = 0; x < 9; x++) hall[y].push('hall'); }
  hall[5][3] = 'fire';
  t.groundsDetail = grounds; t.detail = hall;
  const spot = Game.graveSpot();
  const dSpot = Math.abs(spot[0] - 6) + Math.abs(spot[1] - 6);
  const dHall = Math.abs(spot[0] - 3) + Math.abs(spot[1] - 5);
  ok(dSpot <= dHall && dSpot <= 4, `graveSpot anchors on the grounds fire (spot ${spot} near 6,6, not the hall fire at 3,5)`);
  ok(grounds[spot[1]][spot[0]] === 'grass', 'graveSpot picks walkable grounds (dirt/grass), not lodge/tent/fire');
  const cells = Game.graves().map(g => g.mx + ',' + g.my);
  ok(new Set(cells).size === cells.length && cells.length === 3, `3 graves on 3 distinct cells (${cells.join(' ')})`);
  const again = Game.createGrave(c1);
  ok(again === null && Game.graves().length === 3, 'duplicate createGrave is a no-op (one grave per villager)');

  // --- 8. KIN.md: the Taken are never memorialized — no villagerId, no grave.
  const n0 = Game.graves().length;
  ok(Game.createGrave(null) === null, 'createGrave(null) refuses');
  ok(Game.createGrave({ kind: 'villager', villagerId: null, buried: true, cause: 'unknown' }) === null,
    'createGrave refuses a corpse with no villagerId (unknown fate = no grave)');
  ok(Game.createGrave({ kind: 'monster', monsterId: 'm_x', buried: true, cause: 'combat' }) === null,
    'createGrave refuses non-person corpses');
  ok(Game.graves().length === n0, 'no grave was created by the refused calls');

  // --- 9. In-run only: graves live on state.village, plain data.
  ok(Game.state.village.graves === Game.graves(), 'graves() is state.village.graves — dies with the run');
  const gj = JSON.parse(JSON.stringify(Game.graves()));
  ok(gj.length === 3 && gj.every(g => g.id && g.name && g.cause != null && g.mx != null),
    'graves are plain serializable data (save/load safe)');

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
