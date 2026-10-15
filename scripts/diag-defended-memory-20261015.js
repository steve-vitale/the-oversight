#!/usr/bin/env node
// diag-defended-memory-20261015.js — diagnostic: does the raid pathway plant
// the 'defended' memory, and does the lately scan surface it?
// Usage: node scripts/diag-defended-memory-20261015.js
'use strict';
const { load, newRun } = require('./godpath/lib');

async function main() {
  const Game = await load({ seed: 20261015 });
  newRun(Game);
  const v = Game.state.village;
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  console.log('defender:', Game.displayName(vid), 'tag:', Game.whoTag(vid));
  // a real world monster (spawn one if the world is quiet)
  let m = null;
  try {
    const wms = Game.worldMonsters ? Game.worldMonsters() : [];
    m = wms.find(x => x && (x.hp || 0) > 0) || null;
  } catch (e) { console.log('worldMonsters threw', e.message); }
  if (!m) {
    try { m = Game.spawnWorldMonster({ id: 'hushwolf' }, 4, 4, {}); } catch (e) { console.log('spawn threw', e.message); }
  }
  console.log('monster:', m ? m.id : 'NONE', 'hp:', m && m.hp);
  if (!m) { console.log('no live world monster — abort'); process.exit(2); }
  const memBefore = Game.t2mem(vid).length;
  Game.resolveWildMonsterEncounter(vid, m, { raid: true });
  const mems = Game.t2mem(vid);
  console.log('mems before/after:', memBefore, mems.length);
  const defended = mems.filter(x => x.t === 'defended');
  console.log('defended memories:', JSON.stringify(defended.map(d => ({ day: d.day, note: d.note })), null, 1));
  let ev = null;
  try { ev = Game.t2LatelyEvent(vid); } catch (e) { console.log('t2LatelyEvent threw', e.message); }
  console.log('lately kind:', ev && ev.kind);
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
