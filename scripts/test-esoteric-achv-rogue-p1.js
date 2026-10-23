#!/usr/bin/env node
// ESOTERIC ACHIEVEMENTS (rogue P1, V6-3, 2026-10-22): proof tests for the 12
// story-shaped feats in src/js/metaProgression.js ("The Way You Played").
//
// Each achievement is driven through its REAL wrapped game method and
// asserted to fire exactly when the story-shaped condition holds — and to
// NOT fire for near-misses (wrong threshold, wrong teaching source, failed
// mediation, a kill during the contest window, a non-blood contest, a lost
// contest, monster meat eaten, a prior bearer, kills on the ledger).
//
// Detection reads real game state/events, never RNG-gated outcome tables:
// playstyle counters, mediateConflict's real resolution, the conversation
// teach path's 'player-taught' source, hostFeast's real report,
// villageShareFood's real gift, endDay's day counter, waveKills counters,
// contestInterruption/_contestEnd's real window, lineage() at recordLegend.
//
// Usage: node scripts/test-esoteric-achv-rogue-p1.js
//        SEED=7 node scripts/test-esoteric-achv-rogue-p1.js
// No ENV required. In-memory only: localStorage is stubbed, nothing is
// written to the repo or the real save slots.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261022', 10);

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 1; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(SEED); // seeded BEFORE eval: modules capture Math.random at load

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const FILES = [...html.matchAll(/<script src="(src\/js\/[^"]+)\?/g)].map(m => m[1])
  .filter(f => !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(f));
if (!FILES.includes('src/js/metaProgression.js')) { console.error('FAIL metaProgression.js not in index.html load order'); process.exit(2); }
for (const f of FILES) {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
}
delete global.window;
const Game = globalThis.Scattering.Game;

// ---- localStorage stub: records every key touched ----
const lsData = {};
const lsLog = [];
global.localStorage = {
  getItem: k => { lsLog.push(['get', k]); return (k in lsData) ? lsData[k] : null; },
  setItem: (k, v) => { lsLog.push(['set', k]); lsData[k] = String(v); },
  removeItem: k => { lsLog.push(['del', k]); delete lsData[k]; },
};

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function freshGame() {
  delete Game._metaCache; // force store reload, like a fresh tab
  Game.metaReset();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.tbfight = null;
}
function unlocked(id) { return !!Game._meta().unlocked[id]; }

(async () => {
  await Game.init();
  Game.say = () => {}; Game.sysSay = () => {}; Game.drama = () => {}; Game.audioEvent = () => {};
  console.log(`seed=${SEED}`);

  // ============ 0. data integrity ============
  console.log('\n-- 0. esoteric achievement data --');
  {
    freshGame();
    const list = Game.metaList().filter(a => a.id.indexOf('es-') === 0);
    ok('12 esoteric achievements', list.length === 12, 'got ' + list.length);
    ok('unique ids', new Set(list.map(a => a.id)).size === list.length);
    ok('all in style cat', list.every(a => a.cat === 'style'));
    ok('all fields present', list.every(a => a.id && a.name && a.desc && a.hint));
    ok('style cat summarized', (Game.metaSummary().byCat.style || {}).total === 12);
    ok('none unlocked on fresh store', list.every(a => !a.unlocked));
  }

  // ============ 1. playstyle thresholds ============
  console.log('\n-- 1. playstyle feats (real behavioral counters) --');
  {
    freshGame();
    for (let i = 0; i < 4; i++) Game.notePlaystyle('generous');
    ok('es-open-pack silent at 4', !unlocked('es-open-pack'));
    Game.notePlaystyle('generous');
    ok('es-open-pack fires at 5', unlocked('es-open-pack'));
    for (let i = 0; i < 9; i++) Game.notePlaystyle('leader');
    ok('es-room-listens silent at 9', !unlocked('es-room-listens'));
    Game.notePlaystyle('leader');
    ok('es-room-listens fires at 10', unlocked('es-room-listens'));
    for (let i = 0; i < 14; i++) Game.notePlaystyle('social');
    ok('es-hearth silent at 14', !unlocked('es-hearth'));
    Game.notePlaystyle('social');
    ok('es-hearth fires at 15', unlocked('es-hearth'));
    // unrelated axes never cross-fire into these three
    for (let i = 0; i < 20; i++) { Game.notePlaystyle('cautious'); Game.notePlaystyle('bold'); }
    const fired = ['es-open-pack', 'es-room-listens', 'es-hearth'].filter(unlocked);
    ok('only the three earned playstyle feats fired', fired.length === 3, JSON.stringify(fired));
  }

  // ============ 2. peacekeeper: 3 real mediations ============
  console.log('\n-- 2. es-peacekeeper (real conflict resolution) --');
  {
    freshGame();
    const roster = Game.state.village.roster.filter(id => id !== Game.villagerId).slice(0, 6);
    const pairs = [[roster[0], roster[1]], [roster[2], roster[3]], [roster[4], roster[5]]];
    Game.state.village.conflicts = pairs.map(([a, b]) => (
      { a, b, kind: 'old_wound', stage: 1, tension: 30, known: true, resolved: false }));
    for (const [a, b] of pairs) { Game.state.village.trust[a] = 100; Game.state.village.trust[b] = 100; }
    let resolved = 0;
    for (const [a] of pairs) {
      for (let tries = 0; tries < 12; tries++) {
        const c = Game.state.village.conflicts.find(x => !x.resolved && (x.a === a || x.b === a));
        if (!c) break;
        Game.mediateConflict(a);
        if (c.resolved) { resolved++; break; }
      }
      if (resolved === 2) ok('es-peacekeeper silent at 2 settled', !unlocked('es-peacekeeper'));
    }
    ok('3 conflicts genuinely resolved', resolved === 3, 'got ' + resolved);
    ok('es-style mediated counter is 3', (Game.state.esStyle || {}).mediated === 3);
    ok('es-peacekeeper fires at 3 settled', unlocked('es-peacekeeper'));
    // near-miss: mediating with nobody open changes nothing
    const before = (Game.state.esStyle || {}).mediated;
    Game.mediateConflict('nobody-here');
    ok('null mediation does not count', ((Game.state.esStyle || {}).mediated || 0) === before);
  }

  // ============ 3. teacher: 6 distinct villagers, player-taught ============
  console.log('\n-- 3. es-teacher (conversation teach path) --');
  {
    freshGame();
    const vids = Game.state.village.roster.filter(id => id !== Game.villagerId).slice(0, 6);
    const pid = Game.data.plants[0].id;
    for (let i = 0; i < 5; i++) Game.villagerLearnsPlant(vids[i], pid, 'player-taught');
    ok('es-teacher silent at 5 villagers', !unlocked('es-teacher'));
    Game.villagerLearnsPlant(vids[5], pid, 'player-taught');
    ok('es-teacher fires at 6 distinct villagers', unlocked('es-teacher'));
  }
  {
    freshGame();
    const vids = Game.state.village.roster.filter(id => id !== Game.villagerId).slice(0, 6);
    const pid = Game.data.plants[0].id;
    for (let i = 0; i < 6; i++) Game.villagerLearnsPlant(vids[i], pid, 'taught'); // villagers teaching each other
    ok('villager-taught lessons do not count', !unlocked('es-teacher'));
    for (let i = 0; i < 6; i++) Game.villagerLearnsPlant(vids[i], pid, 'fieldwork');
    ok('fieldwork lessons do not count', !unlocked('es-teacher'));
  }

  // ============ 4. feast: real hostFeast ============
  console.log('\n-- 4. es-feast (real feast, real pantry cost) --');
  {
    freshGame();
    Game.state.village.pantry = []; // drain the starting stores
    const r0 = Game.hostFeast({});
    ok('empty pantry: feast refused', r0 && r0.ok === false, JSON.stringify((r0 || {}).why));
    ok('refused feast does not unlock', !unlocked('es-feast'));
  }
  {
    freshGame();
    let added = 0;
    for (let i = 0; i < 12 && Game.pantryKcal() < 9000; i++) {
      if (Game.pantryAdd({ name: 'Test roots', kcalEach: 1000, units: 4, foodKind: 'plant', foodState: 'cooked', edible: true, safe: true }) !== false) added++;
    }
    ok('pantry stocked', Game.pantryKcal() >= 1500, 'kcal=' + Game.pantryKcal());
    const r = Game.hostFeast({});
    ok('feast held', r && r.ok === true, JSON.stringify((r || {}).why));
    ok('feast spent real food', r && (r.spent || 0) > 0, 'spent=' + ((r || {}).spent));
    ok('es-feast fires on a held feast', unlocked('es-feast'));
  }

  // ============ 5. far-gift: real gift to a lean village ============
  console.log('\n-- 5. es-far-gift (real gift, empty pot) --');
  function setupGift(pantryKcal) {
    freshGame();
    // the gift travels in your hands: the other village must be adjacent
    const px = (Game.map && Game.map.px) || 0, py = (Game.map && Game.map.py) || 0;
    Game.state.otherVillages = [{ id: 'ov-test', name: 'Testville', x: px, y: py, pantryKcal, trust: 10 }];
    Game.state.scholar.exiled = false;
    Game.state.scholar.inventory = [
      { name: 'Travel bread', kcalEach: 350, units: 4, foodKind: 'plant', foodState: 'cooked', edible: true, safe: true },
    ];
    return Game.villageShareFood('ov-test', { giftKcal: 800 });
  }
  {
    const r = setupGift(5000);
    ok('gift to a full pot succeeds', r === true);
    ok('full-pot gift does not unlock', !unlocked('es-far-gift'));
  }
  {
    const r = setupGift(0);
    ok('gift to an empty pot succeeds', r === true);
    ok('es-far-gift fires on the empty pot', unlocked('es-far-gift'));
  }

  // ============ 6. quiet-week: day 8, zero kills ============
  console.log('\n-- 6. es-quiet-week (day 8, no kills) --');
  {
    freshGame();
    Game.state.scholar.day = 7;
    Game.state.waveKills = {};
    Game.endDay();
    ok('day advanced to 8', Game.state.scholar.day === 8, 'day=' + Game.state.scholar.day);
    ok('es-quiet-week fires with zero kills', unlocked('es-quiet-week'));
  }
  {
    freshGame();
    Game.state.scholar.day = 7;
    Game.state.waveKills = { 1: 2 }; // the village drew blood
    Game.endDay();
    ok('es-quiet-week silent with kills on the ledger', !unlocked('es-quiet-week'));
  }

  // ============ 7. clean-bowls: day 30, no monster meat ============
  console.log('\n-- 7. es-clean-bowls (day 30, monster-meat-free) --');
  {
    freshGame();
    Game.state.scholar.day = 29;
    Game.endDay();
    ok('es-clean-bowls fires with clean bowls', unlocked('es-clean-bowls'));
  }
  {
    freshGame();
    const mid = Game.data.monsters[0].id;
    // the scholar really eats monster meat (real inventory item shape)
    Game.maybeMonsterWeirdness({ plantId: 'meat_' + mid, foodState: 'raw', name: 'strange flesh', units: 2, kcalEach: 100 });
    ok('monster-meat mark set', !!(Game.state.esStyle || {}).ateMonsterMeat, 'mid=' + mid);
    Game.state.scholar.day = 29;
    Game.endDay();
    ok('es-clean-bowls silent after monster meat', !unlocked('es-clean-bowls'));
  }
  {
    freshGame();
    // ordinary animal meat is not monster meat: must NOT mark
    const animalMeat = { plantId: 'meat_deer', foodState: 'cooked', name: 'venison', units: 2, kcalEach: 200 };
    if (!Game.monsterMeatGated('deer')) {
      Game.maybeMonsterWeirdness(animalMeat);
      ok('animal meat does not mark', !(Game.state.esStyle || {}).ateMonsterMeat);
    } else {
      ok('animal meat does not mark', true, 'skipped: deer is a monster id in data');
    }
    // the village-cooked exposure pass uses a synthetic item (no units): must NOT mark the player
    const mid = Game.data.monsters[0].id;
    Game.maybeMonsterWeirdness({ plantId: 'meat_' + mid, foodState: 'cooked', name: 'strange flesh' });
    ok('synthetic villager-exposure call does not mark', !(Game.state.esStyle || {}).ateMonsterMeat);
    Game.state.scholar.day = 29;
    Game.endDay();
    ok('es-clean-bowls still fires', unlocked('es-clean-bowls'));
  }

  // ============ 8. clean-show: blood contest, zero kills in the window ============
  console.log('\n-- 8. es-clean-show (blood contest, no kills) --');
  function bloodWin() {
    Game.contestInterruption({ id: 'pit', cat: 'blood', name: 'The Pit', desc: 'test' }, ['player']);
    return Game._contestEnd({ contestId: 'pit', participant: 'player' }, 'won', false);
  }
  {
    freshGame();
    Game.state.waveKills = {};
    bloodWin();
    ok('es-clean-show fires on a kill-free blood win', unlocked('es-clean-show'));
  }
  {
    freshGame();
    Game.state.waveKills = {};
    Game.contestInterruption({ id: 'pit', cat: 'blood', name: 'The Pit', desc: 'test' }, ['player']);
    // a real kill lands mid-contest through the real choke point
    Game.recordWaveKill(Game.data.monsters[0].id, 'player', 'contest');
    Game._contestEnd({ contestId: 'pit', participant: 'player' }, 'won', false);
    ok('es-clean-show silent when a beast died', !unlocked('es-clean-show'));
  }
  {
    freshGame();
    Game.state.waveKills = {};
    Game.contestInterruption({ id: 'moot', cat: 'moot', name: 'The Moot', desc: 'test' }, ['player']);
    Game._contestEnd({ contestId: 'moot', participant: 'player' }, 'won', false);
    ok('es-clean-show silent for a non-blood contest', !unlocked('es-clean-show'));
  }
  {
    freshGame();
    Game.state.waveKills = {};
    Game.contestInterruption({ id: 'pit', cat: 'blood', name: 'The Pit', desc: 'test' }, ['player']);
    Game._contestEnd({ contestId: 'pit', participant: 'player' }, 'lost', false);
    ok('es-clean-show silent on a loss', !unlocked('es-clean-show'));
  }

  // ============ 9. clean-table: zero kills at the sitting ============
  console.log('\n-- 9. es-clean-table (zero kills, whole run) --');
  {
    freshGame();
    Game.state.waveKills = {};
    Game.metaNoteTable('indispensable');
    ok('es-clean-table fires with zero kills', unlocked('es-clean-table'));
    ok('table achievement still fires alongside', unlocked('mt-f-indispensable'));
  }
  {
    freshGame();
    Game.state.waveKills = { 2: 5 };
    Game.metaNoteTable('feared');
    ok('es-clean-table silent with kills on the ledger', !unlocked('es-clean-table'));
    ok('table achievement still fires alongside', unlocked('mt-f-feared'));
  }

  // ============ 10. one-life: no succession ============
  console.log('\n-- 10. es-one-life (mantle never passed) --');
  {
    freshGame();
    Game.recordLegend({ outcome: 'haven-endures', frame: 'test' });
    ok('es-one-life fires for a single bearer', unlocked('es-one-life'));
  }
  {
    freshGame();
    Game.lineage().push({ name: 'Old Bearer', villagerId: 'x', epithet: 'the first', day: 40, cause: 'the wild' });
    Game.recordLegend({ outcome: 'haven-endures', frame: 'test' });
    ok('es-one-life silent after a succession', !unlocked('es-one-life'));
  }

  // ============ 11. store-only: no power, no leakage ============
  console.log('\n-- 11. recognition only — store-only, state-clean --');
  {
    freshGame();
    for (const k of Object.keys(lsData)) delete lsData[k];
    lsLog.length = 0;
    const before = JSON.stringify(Game.state);
    for (const a of Game.metaList()) if (a.id.indexOf('es-') === 0) Game.metaUnlock(a.id);
    ok('all 12 esoteric unlocked', Game.metaList().filter(a => a.id.indexOf('es-') === 0 && a.unlocked).length === 12);
    const touched = new Set(lsLog.map(([op, k]) => k));
    ok('meta writes touch only the meta key', touched.size === 1 && touched.has('oversight.meta.v1'), JSON.stringify([...touched]));
    ok('unlock battery leaves Game.state byte-identical', JSON.stringify(Game.state) === before);
    ok('no abilities granted', (Game.state.scholar.abilities || []).length === 0);
    const invBefore = JSON.parse(before).scholar.inventory.length;
    ok('no items granted', (Game.state.scholar.inventory || []).length === invBefore);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
