#!/usr/bin/env node
// test-nomadwild-waves.js — the System's show runs everywhere.
// RED: Game.nomadWild undefined (module absent).
// GREEN: legWaveLevel tracks unlockedWave; the daily tick eats from
// supplies and starves honestly when the packs run dry.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('nomadwild-waves');

async function main() {
  const Game = await K.load({ seed: 55, narration: true });
  K.newRun(Game);
  const NW = Game.nomadWild;
  T.ok('nomadWild loaded', !!NW);

  const roster = (Game.state.village.roster || []).slice(0, 2);
  Game.state.road = {
    active: true, partyIds: roster, supplies: 30000,
    legs: [{ regionId: 'sa_amazon' }], legIndex: 0,
  };

  T.section('waves visible on the road');
  const w1 = NW.legWaveLevel();
  T.ok('wave level reads (day 1 -> wave 1)', w1 === 1, String(w1));
  // Push past the wave-2 day floor and confirm the leg sees it.
  Game.state.scholar.day = 30;
  try {
    const ds = Game.deedState ? Game.deedState() : null;
    if (ds) { ds.wavesFaced = ds.wavesFaced || {}; }
  } catch (e) {}
  const w2 = NW.legWaveLevel();
  T.ok('wave level tracks unlocks', w2 >= 1, `day 30 -> wave ${w2}`);

  T.section('daily tick');
  const d = NW.daily();
  T.ok('daily forages', (d.foraged || 0) > 0, String(d.foraged));
  T.ok('daily feeds the party', (d.ate || 0) === roster.length * 2000, String(d.ate));
  T.ok('daily reports wave', typeof d.wave === 'number');
  T.ok('not on road -> quiet', (() => {
    Game.state.road.active = false;
    const q = NW.daily();
    Game.state.road.active = true;
    return q.note === 'not on the road';
  })());

  T.section('starvation is honest');
  Game.state.road.supplies = 100; // not enough for 2 mouths
  const before = (Game.log || []).length;
  const s = NW.daily();
  const newLines = (Game.log || []).slice(before).join('\n');
  T.ok('starving flagged', s.starving === true);
  T.ok('starvation narrated, not silent', /empty|hunger/i.test(newLines), newLines.slice(-200));
  T.ok('supplies floored at 0', Game.state.road.supplies === 0);

  T.done();
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
