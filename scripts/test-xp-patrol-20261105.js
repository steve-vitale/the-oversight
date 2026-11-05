// PROOF: XP coverage — the patrol deed makes the first combat threshold
// reachable through everyday combat-adjacent work, not just fight wins.
// XP coverage + synergy + gear + healer road (Steve 2026-11-05).
// Datum (journey-establishment-r104, master 1de41ff6f): across 4 seeds / 42
// days, 29/29 living villagers hold a granted ability but ZERO combat-kit
// ids are held, and NO villager crosses the first combat threshold (18) —
// max observed 17. The combat track had only two deeds (fight_won,
// fight_survived), both needing a fight. The patrol duty — gear up, pocket
// ammo, walk the perimeter armed and ready — already happens daily and
// earned nothing. The new 'patrol' deed (combat, n=1, perDay=1) credits it
// in Game.resolvePatrol, both branches: uneventful (no threat found) and
// threat (after the fight resolves, when the patroller lived; the fight
// deeds credit separately; the dead earn nothing).
// Usage: node scripts/test-xp-patrol-20261105.js   (exit 1 on any FAIL)
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./sim-harness.js');
const L = require('./godpath/lib.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}
function xpOf(Game, who, track) {
  // npcXp(vid) initializes the record (occupation lean) on first touch — call
  // it before measuring, or the 'before' read misses the lean and the delta
  // includes it.
  if (who === 'player') return ((Game.state.scholar.tracks || {})[track] || {}).xp || 0;
  try { Game.npcXp && Game.npcXp(who); } catch (e) {}
  return (((Game.state.village.npcXp || {})[who] || {})[track]) || 0;
}

async function main() {
  // ---- table shape ----
  const T = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'tracks.json'), 'utf8'));
  console.log('patrol deed table');
  const d = (T.deeds || {}).patrol;
  check('patrol deed exists', !!d);
  if (d) {
    check('patrol is combat, n=1, perDay=1', d.track === 'combat' && d.n === 1 && d.perDay === 1, JSON.stringify(d));
  }
  const combatDeeds = Object.entries(T.deeds || {}).filter(([, v]) => v.track === 'combat').map(([k]) => k).sort();
  check('combat deeds are exactly fight_won, fight_survived, patrol', JSON.stringify(combatDeeds) === JSON.stringify(['fight_survived', 'fight_won', 'patrol']), JSON.stringify(combatDeeds));

  const Game = await L.load({ seed: 99101 });
  const scholar = L.newRun(Game, 'Columbus, Ohio');
  const village = Game.state.village;
  const vid = (village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) { console.log('FAIL no roster villager'); process.exit(1); }
  const vid2 = (village.roster || []).find(id => id !== Game.villagerId && id !== vid);
  village.npcXp = village.npcXp || {};
  village.health = village.health || {};
  village.health[vid] = 100;
  Game.state.scholar.day = 10;
  const first = Game.displayName ? Game.displayName(vid) : vid;
  const hx = (village.px ?? 4), hy = (village.py ?? 4);
  // Record every deed credit in this test (observer wrap, test-only).
  const calls = [];
  const origCD = Game.creditDeed.bind(Game);
  Game.creditDeed = function (who, deedId, trackOverride) {
    const r = origCD(who, deedId, trackOverride);
    calls.push({ who, deed: deedId, granted: r });
    return r;
  };

  // ---- 1. uneventful patrol credits patrol (+1 combat), capped per day ----
  console.log('patrol deed: uneventful patrol');
  {
    Game.state.worldMonsters = []; // no threat anywhere near Haven
    const before = xpOf(Game, vid, 'combat');
    Game.resolvePatrol(vid, first);
    const after = xpOf(Game, vid, 'combat');
    check('uneventful patrol credits patrol deed (+1 combat XP)', after - before === 1, 'before=' + before + ' after=' + after);
    check('patrol deed call recorded once for the patroller',
      calls.filter(c => c.deed === 'patrol' && c.who === vid).length === 1,
      JSON.stringify(calls));
    Game.resolvePatrol(vid, first); // second patrol, same day
    const after2 = xpOf(Game, vid, 'combat');
    check('second patrol same day grants nothing (per-day cap 1)', after2 === after, 'after=' + after + ' after2=' + after2);
  }

  // ---- 2. threat patrol: patrol deed + a fight deed ----
  console.log('patrol deed: threat patrol');
  {
    Game.state.scholar.day = 11;
    calls.length = 0;
    village.health[vid] = 100;
    Game.state.worldMonsters = [{ id: 'hummice', tx: hx, ty: hy, mx: 0, my: 0 }];
    const before = xpOf(Game, vid, 'combat');
    Game.resolvePatrol(vid, first);
    const after = xpOf(Game, vid, 'combat');
    const patrolCalls = calls.filter(c => c.deed === 'patrol' && c.who === vid && (c.granted || 0) > 0);
    const fightCalls = calls.filter(c => (c.deed === 'fight_won' || c.deed === 'fight_survived') && c.who === vid && (c.granted || 0) > 0);
    check('threat patrol credits patrol deed', patrolCalls.length === 1, JSON.stringify(calls));
    check('threat patrol also credits a fight deed (won or survived)', fightCalls.length === 1, JSON.stringify(calls));
    const expect = 1 + (fightCalls[0] ? (fightCalls[0].deed === 'fight_won' ? 2 : 1) : 0);
    check('threat patrol day grants patrol + fight XP', after - before === expect, 'before=' + before + ' after=' + after + ' expect=' + expect);
  }

  // ---- 3. repeated patrols cross the first combat threshold (18) ----
  // (creditDeed directly across days: 1/day cap, 25 patrol days.)
  console.log('patrol deed: threshold velocity');
  if (!vid2) { console.log('FAIL no second roster villager'); process.exit(1); }
  {
    const start = xpOf(Game, vid2, 'combat');
    for (let day = 20; day < 20 + 25; day++) {
      Game.state.scholar.day = day;
      Game.creditDeed(vid2, 'patrol');
    }
    const end = xpOf(Game, vid2, 'combat');
    check('25 patrol days grant 25 combat XP (1/day, capped)', end - start === 25, 'start=' + start + ' end=' + end);
    check('combat XP crosses the first threshold (18)', end >= 18, 'end=' + end);
  }

  // ---- 4. a dead patroller earns nothing (stubbed fatal fight) ----
  console.log('patrol deed: fatal patrol earns nothing');
  {
    Game.state.scholar.day = 50;
    calls.length = 0;
    village.health[vid] = 100;
    Game.state.worldMonsters = [{ id: 'hummice', tx: hx, ty: hy, mx: 0, my: 0 }];
    const origFF = Game.fieldFight.bind(Game);
    Game.fieldFight = () => ({ outcome: 'vDie', vTaken: 999, rounds: 1 });
    const before = xpOf(Game, vid, 'combat');
    try { Game.resolvePatrol(vid, first); } finally { Game.fieldFight = origFF; }
    const after = xpOf(Game, vid, 'combat');
    check('dead patroller earns no patrol XP', after === before, 'before=' + before + ' after=' + after);
    check('no patrol deed call on a fatal patrol', calls.filter(c => c.deed === 'patrol').length === 0, JSON.stringify(calls));
  }

  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
