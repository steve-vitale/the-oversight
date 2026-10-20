'use strict';
// DET-GATE for #697: the fix must be text-only. 16 paired seeds, armed vs
// control. tin_cup (no placeholders in its memory) -> the full digest
// INCLUDING the rendered message must be byte-identical. dog_tags -> state
// digest must be byte-identical (message differs by design: the fix).
// Writes digests to scripts/det-kinresolve-<label>.json.
const crypto = require('crypto');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const SEEDS = [5601, 5602, 5603, 5604, 5605, 5606, 5607, 5608,
               5609, 5610, 5611, 5612, 5613, 5614, 5615, 5616];

async function driveBeat(seed, itemId, itemName) {
  const { Game } = await quietLog(async () => loadGame({ seed }));
  await quietLog(async () => setupGame(Game));
  const s = Game.state.scholar, pg = Game.progState();
  pg.sentimentTaught = true;
  s.trauma = 0;
  pg.surgeResonance = 35;
  s.abilities = [
    { id: 'a1', name: 'Gift One', level: 1, xp: 0 },
    { id: 'a2', name: 'Gift Two', level: 2, xp: 0 },
  ];
  s.backgroundAbilities = [];
  s.inventory = [{ itemId, name: itemName, sentimental: true }];
  pg.chanDay = {};
  let msg;
  try { msg = Game.channelSentiment(0); } catch (e) { msg = 'THREW:' + e.message; }
  return {
    msg: String(msg || ''),
    state: {
      trauma: s.trauma,
      day: s.day,
      kcal: s.kcal, hydration: s.hydration, energy: s.energy, health: s.health,
      abilities: s.abilities.map(a => [a.id, a.level, a.xp]),
      backgroundAbilities: (s.backgroundAbilities || []).map(a => [a.id, a.level, a.xp]),
      feastSurge: s.prog.feastSurge,
      chanDay: pg.chanDay,
      inventoryNames: (s.inventory || []).map(i => i.itemId || i.id),
      over: !!Game.over,
    },
  };
}

async function main() {
  const label = process.env.DET_LABEL || 'run';
  const out = [];
  for (const seed of SEEDS) {
    const tin = await driveBeat(seed, 'tin_cup', "Grandma's Tin Cup");
    const dog = await driveBeat(seed, 'dog_tags', 'Dog Tags');
    out.push({ seed,
      tinFull: crypto.createHash('sha256').update(JSON.stringify(tin)).digest('hex'),
      tinMsg: tin.msg.slice(0, 120),
      dogState: crypto.createHash('sha256').update(JSON.stringify(dog.state)).digest('hex'),
    });
  }
  require('fs').writeFileSync(
    __dirname + '/det-kinresolve-' + label + '.json', JSON.stringify(out, null, 1));
  console.log('wrote det-kinresolve-' + label + '.json (' + out.length + ' seeds)');
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
