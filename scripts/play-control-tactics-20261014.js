// play-control-tactics-20261014.js — CONTROL-TACTICS PLAYTEST (Steve 2026-10-14).
// "Stunlocking should be a viable strategy for some fights."
// Pre-registered per ANTI-DRIFT: "stunlock flips ≥1 fight that damage-race
// loses" — GO/NO-GO, no re-scoring.
//
// The fight: a Crusher (90 HP) with a devastating telegraphed Seismic Slam
// (90 dmg — lethal; telegraphs turn 2, fires turn 3). Player: 100 HP, bow
// 20/round, pocket_sand (blind 2, 1/fight), rope x1.
//
// ARM A (damage race): bow every turn. The Slam fires on turn 3 → player dies.
// ARM B (stunlock): blind (T1) → bind (T2, bound 3, no telegraphs) → bow
// down. The Slam never fires → flawless win.
//
// Player verbs (tbPlayerBind) and status mechanics (bind blocks move +
// suppresses telegraphs) are REAL. The monster's turn is scripted to the
// documented mechanics.
'use strict';
const fs = require('fs');
const path = require('path');
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(parseInt(process.env.SEED || '7', 10));
const ROOT = '/home/hatch/workspace/worktrees/sim-controltact';

const order = [];
{
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<script[^>]+src="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) order.push(m[1].split('?')[0]);
}
const skip = /app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/;
global.window = global;
for (const f of order.filter(s => s.startsWith('src/js/') && !skip.test(s))) {
  try { eval.call(global, fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.log(`LOAD FAIL ${f}: ${e.message}`); }
}
delete global.window;
const Game = global.Scattering && global.Scattering.Game;
if (!Game) { console.error('no Game'); process.exit(2); }

const says = [];
Game.say = (t) => { says.push(String(t)); };
const flush = () => { const t = says.splice(0); for (const s of t) console.log(`   | ${String(s).slice(0, 140)}`); };

function makeFight() {
  const p = { key: 'p', kind: 'player', alive: true, fled: false, mx: 4, my: 7, acted: false, moveLeft: 3, hp: 100, maxHp: 100, name: 'You' };
  const m = { key: 'm1', kind: 'monster', alive: true, fled: false, mx: 4, my: 4, hp: 90, maxHp: 90, stunned: 0, _bound: 0, _frozen: 0, blind: 0, hesitate: 0, telegraph: null, mdef: { id: 'crusher' }, monsterId: 'crusher', name: 'Crusher' };
  Game.tbfight = { fighters: [p, m], over: false, id: 'test' };
  Game.state = Game.state || {};
  Game.state.scholar = { day: 1, inventory: [{ itemId: 'rope_50ft', units: 1 }] };
  Game._t = { p, m1: m };
  Game.tbFighter = (k) => Game._t[k];
  Game.tbIsPlayerTurn = () => true;
  Game.tbCanOccupy = (f, x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8;
  Game.fighterTiles = (o) => [[o.mx, o.my]];
  Game.fighterSize = () => 1;
  Game.encSubject = (o) => o.name || 'it';
  Game.tbEndCheck = () => false;
  Game.tbAfterPlayerAction = () => {};
  Game.tbRefreshTelegraphUI = () => {};
  return { p, m };
}

// Crusher: basics (10) when it can reach; telegraphs Seismic Slam (90) on
// turn 2, fires turn 3 if the telegraph survives. Bound/stunned follow the
// REAL mechanics (no move, no telegraph while bound; no turn while stunned).
function monsterTurn(m, p, turn) {
  if (!m.alive || p.hp <= 0) return;
  if ((m.stunned || 0) > 0) { m.stunned -= 1; console.log('   | MON  Crusher is stunned — loses its turn.'); if (m.telegraph) { m.telegraph = null; console.log('   | MON  Telegraph fizzles.'); } return; }
  if ((m._bound || 0) > 0) {
    m._bound -= 1;
    if (m.telegraph) { m.telegraph = null; console.log('   | MON  Tries to wind up — the rope bites! The attack fizzles. (Bind: no telegraphs while hogtied.)'); }
    if (m._bound <= 0) console.log('   | MON  Crusher snaps the rope! Free.');
    else console.log(`   | MON  Crusher strains against the rope — hogtied! (${m._bound} left)`);
  }
  if ((m._bound || 0) > 0 || (m._frozen || 0) > 0) { console.log('   | MON  Crusher cannot move (bound/rooted).'); return; }
  if (turn === 2 && !m.telegraph) { m.telegraph = { name: 'Seismic Slam' }; console.log('   | MON  Crusher rears up — the ground cracks! (TELEGRAPH: Seismic Slam, 90 dmg)'); return; }
  if (m.telegraph) {
    m.telegraph = null;
    const d = Math.max(Math.abs(m.mx - p.mx), Math.abs(m.my - p.my));
    if (d <= 3) { p.hp -= 90; console.log(`   | MON  SEISMIC SLAM hits you for 90! (you: ${Math.max(0, p.hp)} HP)`); }
    else console.log('   | MON  Seismic Slam — nobody in reach!');
    return;
  }
  // basic: close and hit
  const d = Math.max(Math.abs(m.mx - p.mx), Math.abs(m.my - p.my));
  if (d > 1) { m.mx += Math.sign(p.mx - m.mx); m.my += Math.sign(p.my - m.my); }
  if (Math.max(Math.abs(m.mx - p.mx), Math.abs(m.my - p.my)) <= 1) { p.hp -= 10; console.log(`   | MON  Crusher basics you for 10. (you: ${Math.max(0, p.hp)} HP)`); }
}

function bow(p, m) { m.hp -= 20; console.log(`   | YOU  Bow: 20. (Crusher: ${Math.max(0, m.hp)} HP)`); p.acted = true; }

// ================= ARM A: DAMAGE RACE =================
console.log('\n=== ARM A: DAMAGE RACE (no control) ===');
let resA;
{
  const { p, m } = makeFight();
  for (let turn = 1; turn <= 8; turn++) {
    console.log(`-- turn ${turn} --`);
    p.acted = false;
    if (p.hp <= 0 || m.hp <= 0) break;
    bow(p, m); flush();
    if (m.hp <= 0) break;
    monsterTurn(m, p, turn);
    if (p.hp <= 0) break;
  }
  resA = m.hp <= 0 ? 'WIN' : 'LOSE';
  console.log(`ARM A RESULT: ${resA} (you: ${Math.max(0, p.hp)} HP, Crusher: ${Math.max(0, m.hp)} HP)`);
}

// ================= ARM B: STUNLOCK =================
console.log('\n=== ARM B: STUNLOCK (blind → bind → focus) ===');
let resB, ropeLeft;
{
  const { p, m } = makeFight();
  for (let turn = 1; turn <= 8; turn++) {
    console.log(`-- turn ${turn} --`);
    p.acted = false; p.moveLeft = 3;
    if (p.hp <= 0 || m.hp <= 0) break;
    if (turn === 1) {
      // pocket_sand: blind 2 rounds (real mechanic)
      m.blind = 2; p.acted = true;
      console.log('   | YOU  Pocket sand! Crusher reels, blinded for 2 rounds.');
    } else if (turn === 2) {
      // move adjacent, BIND via the real verb
      p.mx = 4; p.my = 5;
      const ok = Game.tbPlayerBind('m1');
      console.log(`   | YOU  (tbPlayerBind → ${ok})`);
      flush();
    } else {
      p.mx = 4; p.my = 7; // kite to range 3
      bow(p, m); flush();
    }
    if (m.hp <= 0) break;
    // blind ticks
    if ((m.blind || 0) > 0) m.blind -= 1;
    monsterTurn(m, p, turn);
    if (p.hp <= 0) break;
  }
  resB = m.hp <= 0 ? 'WIN' : 'LOSE';
  ropeLeft = (Game.state.scholar.inventory.find(i => i.itemId === 'rope_50ft') || {}).units || 0;
  console.log(`ARM B RESULT: ${resB} (you: ${Math.max(0, p.hp)} HP, Crusher: ${Math.max(0, m.hp)} HP, rope left: ${ropeLeft})`);
}

console.log('\n=== VERDICT ===');
console.log(`Damage race: ${resA} | Stunlock: ${resB}`);
if (resA === 'LOSE' && resB === 'WIN') console.log('GO: stunlock flips a fight that damage-race loses.');
else console.log('NO-GO: metric not met.');
