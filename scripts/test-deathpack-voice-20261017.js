#!/usr/bin/env node
// test-deathpack-voice-20261017.js — PROOF for journey-succession r22.
//
// UNTESTED (r22 pilot, 2026-10-17): the death-pack economy worked
// mechanically but silently. The batch-loot path (corpseLootAll — the app's
// TAKE-ALL button and the competent policy's strip verb) fired the trauma
// number via _corpseFirstTouch but never NAMED the dead or the weight; only
// the lootCorpse search verb said "You take X from Marco. Your hands know
// what they did." In seed 4102 the policy stripped the dead bearer's corpse
// (7 items incl. a fan care package) with zero fiction. And buryCorpse buried
// the unlooted death pack with the body without naming the 3–7 items going
// into the ground ("You bury Pongsak. A marker, of sorts." — crowbar, shirt,
// fan care package unnamed).
//
// AFTER: both take verbs (corpseTakeItem, corpseLootAll) name the dead and
// the weight once, on first touch ("You take stone knife from Marco. Your
// hands know what they did. (+N trauma)"); buryCorpse names the grave goods
// ("What they carried goes into the ground with them: ..."). Monster corpses
// stay field-dressing (no voice); ash keeps its own voice; no double-voice
// when per-item and batch mix; trauma still fires exactly once.
//
// Seeded PRNG, deterministic. Usage: node scripts/test-deathpack-voice-20261017.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261017', 10);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED); // seeded BEFORE eval (load-time capture)

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
});
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
const first = (n) => String(n || '').split(' ')[0];
function charName(id) {
  return (((Game.data.villagers || []).find(x => x.id === id)) || {}).name || id;
}
function withCapturedSay(fn) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (t) { lines.push(String(t || '')); return orig ? orig.call(this, t) : undefined; };
  try { fn(); } finally { Game.say = orig; }
  return lines;
}
const handsKnow = (lines) => lines.filter(l => /hands know what they did/.test(l));

async function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  Game.sysSay = () => {};
  Game.state.scholar.kcal = 50000;
  Game.state.scholar.trauma = 0;
  const v = Game.state.village;
  return (v.roster || []).filter(id => id !== Game.villagerId);
}

// a fresh person-corpse with a 3-item death pack, adjacent to the scholar
function mkPersonCorpse(vid, items) {
  const s = Game.state.scholar;
  // the village knows its own dead by name (real play, not a stranger-corpse)
  try { Game.revealName(vid); } catch (e) {}
  const c = Game.registerDeath({
    kind: 'villager', villagerId: vid, name: charName(vid),
    mx: s.mx || 4, my: s.my || 4, cause: 'the wild', killerId: null,
    items: items || [
      { name: 'Stone knife', units: 1, kg: 0.15, kcalEach: 0, spoilDay: 9999 },
      { name: 'Vine', units: 1, kg: 0.1, kcalEach: 0, spoilDay: 9999 },
      { name: 'Fan care package (unopened)', units: 1, kg: 1.2, kcalEach: 0, spoilDay: 9999 },
    ],
  });
  const corpse = (Game.state.corpses || []).find(x => x && x.id === (c && c.id)) || c;
  corpse.node = { x: Game.map.px, y: Game.map.py };
  corpse.mx = s.mx || 4; corpse.my = s.my || 4;
  return corpse;
}

(async () => {
  await Game.init();
  console.log(`seed=${SEED}`);

  // ---------- T1. batch loot names the dead and the weight ----------
  console.log('\n-- T1. corpseLootAll names the dead (first touch) --');
  {
    const ids = await freshGame();
    const deadId = ids[0], deadFirst = first(charName(deadId));
    const c = mkPersonCorpse(deadId);
    const traumaBefore = Game.state.scholar.trauma || 0;
    const lines = withCapturedSay(() => Game.corpseLootAll(c.id, () => false));
    const hk = handsKnow(lines);
    ok('exactly one "hands know" line', hk.length === 1, `got ${hk.length}`);
    if (hk.length) {
      ok('line names the dead', hk[0].includes(`from ${deadFirst}`), hk[0].slice(0, 140));
      ok('line names the taken gear', /stone knife/i.test(hk[0]), hk[0].slice(0, 140));
      const m = hk[0].match(/\(\+(\d+) trauma\)/);
      ok('line carries the trauma number', !!m, hk[0].slice(0, 140));
      const delta = (Game.state.scholar.trauma || 0) - traumaBefore;
      ok('trauma fired exactly once (matches the line)', m && delta === parseInt(m[1], 10), `delta=${delta} line=${m && m[1]}`);
    }
  }

  // ---------- T2. per-item take button names the dead too ----------
  console.log('\n-- T2. corpseTakeItem names the dead (first touch) --');
  {
    const ids = await freshGame();
    const deadId = ids[0], deadFirst = first(charName(deadId));
    const c = mkPersonCorpse(deadId);
    const lines = withCapturedSay(() => Game.corpseTakeItem(c.id, 0));
    const hk = handsKnow(lines);
    ok('exactly one "hands know" line', hk.length === 1, `got ${hk.length}`);
    if (hk.length) ok('line names the dead', hk[0].includes(`from ${deadFirst}`), hk[0].slice(0, 140));
  }

  // ---------- T3. no double voice when paths mix ----------
  console.log('\n-- T3. per-item then batch: no repeated voice --');
  {
    const ids = await freshGame();
    const deadId = ids[0];
    const c = mkPersonCorpse(deadId);
    const lines = withCapturedSay(() => {
      Game.corpseTakeItem(c.id, 0);
      Game.corpseLootAll(c.id, () => false);
    });
    ok('"hands know" fires exactly once across both verbs', handsKnow(lines).length === 1, `got ${handsKnow(lines).length}`);
  }

  // ---------- T4. monster corpse: no voice (field-dressing) ----------
  console.log('\n-- T4. monster corpse batch: no "hands know" voice --');
  {
    await freshGame();
    const s = Game.state.scholar;
    const mc = Game.registerDeath({
      kind: 'monster', monsterId: 'proof_beast', monsterName: 'Proof Beast',
      name: 'Proof Beast', mx: s.mx || 4, my: s.my || 4, cause: 'combat',
      killerId: Game.villagerId, descriptor: 'something proof-sized',
      items: [{ name: 'Stripped hide', units: 1, kg: 1.5, kcalEach: 0, spoilDay: 9999 }],
    });
    const corpse = (Game.state.corpses || []).find(x => x && x.id === (mc && mc.id)) || mc;
    corpse.node = { x: Game.map.px, y: Game.map.py };
    corpse.mx = s.mx || 4; corpse.my = s.my || 4;
    const lines = withCapturedSay(() => Game.corpseLootAll(corpse.id, () => false));
    ok('no "hands know" for a monster', handsKnow(lines).length === 0, handsKnow(lines).join(' | ').slice(0, 120));
    ok('batch still takes the hide', lines.some(l => /^Taken:/.test(l)), lines.join(' | ').slice(0, 120));
  }

  // ---------- T5. burial names the grave goods ----------
  console.log('\n-- T5. buryCorpse names what goes into the ground --');
  {
    const ids = await freshGame();
    const deadId = ids[0];
    const c = mkPersonCorpse(deadId);
    const lines = withCapturedSay(() => Game.buryCorpse(c.id));
    const grave = lines.find(l => /goes into the ground with them/.test(l));
    ok('grave-goods line fires', !!grave, lines.join(' | ').slice(0, 160));
    if (grave) {
      ok('line names the gear', /stone knife/i.test(grave) && /fan care package/i.test(grave), grave.slice(0, 200));
      ok('line keeps the village norm', /leaves the dead their things/.test(grave), grave.slice(0, 200));
    }
    ok('burial marker line still fires', lines.some(l => /A marker, of sorts/.test(l)), 'marker missing');
  }

  // ---------- T6. burial with empty pack: no grave-goods noise ----------
  console.log('\n-- T6. buryCorpse with empty pack: no grave-goods line --');
  {
    const ids = await freshGame();
    const deadId = ids[0];
    const c = mkPersonCorpse(deadId, []);
    const lines = withCapturedSay(() => Game.buryCorpse(c.id));
    ok('no grave-goods line when nothing is buried', !lines.some(l => /goes into the ground with them/.test(l)), lines.join(' | ').slice(0, 160));
    ok('burial still completes', !!c.buried, 'not buried');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
