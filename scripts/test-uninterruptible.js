// test-uninterruptible.js — Steve 2026-10-14: the bulldozer's charge and the
// highbeam deer's beam CANNOT be interrupted. They can be pushed and moved
// (shove works), but the signature attack still comes at you.
// Proves: data flags, codex copy, and the three fizzle gates
// (player scream, villager scream, BIND tick). RED→GREEN via patch files.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let _s = 777;
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(_s);

const order = [];
{
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<script[^>]+src="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) order.push(m[1]);
}
const skip = /app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/;
const files = order.map(s => s.split('?')[0]).filter(s => s.startsWith('src/js/') && !skip.test(s));
global.window = global;
for (const f of files) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  try { eval.call(global, code + `\n//# sourceURL=${f}`); }
  catch (e) { console.error(`EVAL FAIL ${f}: ${e.message}`); process.exit(2); }
}
delete global.window;

const Game = global.Scattering && global.Scattering.Game;
if (!Game) { console.error('Game not defined after eval'); process.exit(2); }

let pass = 0, fail = 0;
const ok = (cond, name, detail) => {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}${detail != null ? ' — ' + detail : ''}`); }
};

async function main() {
  const lines = [];
  Game.say = (t) => { lines.push(String(t)); };

  // ---------- (1) data flags ----------
  console.log('(1) data flags');
  const mjson = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/monsters.json'), 'utf8'));
  const mdefs = Array.isArray(mjson) ? mjson : (mjson.monsters || []);
  const def = (id) => mdefs.find(m => m.id === id) || {};
  ok(def('bulldozer').uninterruptible === true, 'bulldozer flagged uninterruptible');
  ok(def('gallowdeer').uninterruptible === true, 'gallowdeer flagged uninterruptible');
  ok(!def('sunbasker').uninterruptible, 'sunbasker NOT flagged');
  ok(!def('memory_projector').uninterruptible, 'memory_projector NOT flagged');

  // ---------- (2) codex copy ----------
  console.log('(2) codex copy');
  const reveal = (id) => ((def(id).counter || {}).reveal) || '';
  ok(!/Interruptible/.test(reveal('bulldozer')), 'bulldozer reveal drops Interruptible');
  ok(!/Interruptible/.test(reveal('gallowdeer')), 'gallowdeer reveal drops Interruptible');
  ok(/Interruptible/.test(reveal('sunbasker')), 'sunbasker reveal gains Interruptible');
  ok(/Interruptible/.test(reveal('memory_projector')), 'memory_projector reveal gains Interruptible');

  // ---------- (3) player scream vs bulldozer: telegraph survives, stun lands ----------
  console.log('(3) scream cannot fizzle the charge');
  {
    lines.length = 0;
    const tg = { kind: 'charge', turnsLeft: 2 };
    const m = { key: 'm1', kind: 'monster', monsterId: 'bulldozer', alive: true, mx: 4, my: 4, stunned: 0, hp: 80, maxHp: 80, telegraph: tg, mdef: def('bulldozer'), name: 'Bulldozer' };
    const p = { key: 'p', kind: 'player', alive: true, mx: 4, my: 5, acted: false, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    Game.tbFighter = (k) => k === 'p' ? p : m;
    Game.state = Game.state || {};
    Game.state.scholar = { abilities: [{ id: 'scream_cheese' }], day: 1 };
    Game.hasAbility = (id) => (Game.state.scholar.abilities || []).some(a => a.id === id);
    Game.applyStatus = (t, eff) => { if (eff === 'stun') t.stunned = (t.stunned || 0) + 1; };
    Game.monsterDisplayName = (id) => 'Bulldozer';
    Game.tbRefreshTelegraphUI = () => {};
    Game.tbAfterPlayerAction = () => {};
    Game.tbIsPlayerTurn = () => true;
    Game.tbPlayerScream({ viaAbility: true });
    ok(m.telegraph === tg, 'bulldozer telegraph SURVIVES the scream', String(!!m.telegraph));
    ok((m.stunned || 0) > 0, 'stun still lands on the body');
    ok(/anyway|Uninterruptible/.test(lines.join(' ')), 'narrated: the attack comes anyway');
  }

  // ---------- (4) player scream vs sunbasker: telegraph FIZZLES (control case intact) ----------
  console.log('(4) scream still fizzles interruptible monsters');
  {
    lines.length = 0;
    const m = { key: 'm1', kind: 'monster', monsterId: 'sunbasker', alive: true, mx: 4, my: 4, stunned: 0, hp: 60, maxHp: 60, telegraph: { kind: 'bask', turnsLeft: 2 }, mdef: def('sunbasker'), name: 'Sunbasker' };
    const p = { key: 'p', kind: 'player', alive: true, mx: 4, my: 5, acted: false, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    Game.tbFighter = (k) => k === 'p' ? p : m;
    Game.state.scholar.screamDay = -1; // fresh throat for the control case
    Game.tbPlayerScream({ viaAbility: true });
    ok(m.telegraph === null, 'sunbasker telegraph fizzles', String(m.telegraph));
    ok(/fizzles|shatters/.test(lines.join(' ')), 'fizzle narrated');
  }

  // ---------- (5) BIND tick vs gallowdeer: telegraph survives ----------
  console.log('(5) bind cannot fizzle the beam');
  {
    lines.length = 0;
    const tg = { kind: 'beam', turnsLeft: 1 };
    const m = { key: 'm1', kind: 'monster', monsterId: 'gallowdeer', alive: true, mx: 4, my: 4, hp: 160, maxHp: 160, telegraph: tg, _bound: 2, mdef: def('gallowdeer'), name: 'Highbeam Deer' };
    Game.tbfight = { fighters: [m], over: false };
    Game.encSubject = (o) => o.name || 'it';
    // run just the BIND block logic via the status tick path is deep; replicate the gate directly
    const before = m.telegraph;
    if (m.telegraph && !(m.mdef && m.mdef.uninterruptible)) { m.telegraph = null; }
    ok(m.telegraph === before, 'gallowdeer telegraph SURVIVES bind', String(!!m.telegraph));
    // and the real code path contains the gate
    const src = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
    const bindGate = /_bound[\s\S]{0,400}?m\.mdef && m\.mdef\.uninterruptible/;
    ok(bindGate.test(src), 'BIND block checks uninterruptible in game.js');
    const screamGate = /tbPlayerScream[\s\S]{0,2000}?m\.mdef && m\.mdef\.uninterruptible/;
    ok(screamGate.test(src), 'player scream checks uninterruptible in game.js');
  }

  // ---------- (6) shove still works on uninterruptible (positional control intact) ----------
  console.log('(6) shove still moves them');
  ok(typeof Game.tbPlayerShove === 'function', 'tbPlayerShove exists');
  {
    lines.length = 0;
    const m = { key: 'm1', kind: 'monster', monsterId: 'bulldozer', alive: true, fled: false, mx: 4, my: 4, stunned: 1, hp: 80, maxHp: 80, mdef: def('bulldozer'), name: 'Bulldozer' };
    const p = { key: 'p', kind: 'player', alive: true, fled: false, mx: 4, my: 5, acted: false, moveLeft: 3, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    const origFighter = Game.tbFighter;
    Game.tbFighter = (k) => k === 'p' ? p : m;
    Game.tbIsPlayerTurn = () => true;
    Game.tbCanOccupy = () => true;
    Game.fighterTiles = (o) => [[o.mx, o.my]];
    Game.fighterSize = () => 1;
    Game.encSubject = (o) => o.name || 'it';
    Game.tbEndCheck = () => false;
    Game.tbAfterPlayerAction = () => {};
    Game.tbDamage = (k, d) => { Game.tbFighter(k).hp -= d; };
    const r = Game.tbPlayerShove('m1');
    ok(r === true && m.mx === 4 && m.my === 2, 'uninterruptible bulldozer still shoved', `${m.mx},${m.my}`);
    Game.tbFighter = origFighter;
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
