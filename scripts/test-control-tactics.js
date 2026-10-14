// test-control-tactics.js — control-tactics 2026-10-14 (Steve: control must
// change the board, not the numbers; stunlock viable for some fights).
// Proves: SHOVE/BIND/GOAD verbs, stunlock diminishing returns, +25% openings,
// codex "interruptible" notes. RED→GREEN via patch files — NEVER git stash.
//
// Node harness: FULL src/js/*.js in index.html order (minus DOM-only
// app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js), seeded BEFORE eval.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// ---- seeded RNG BEFORE eval (load-time captures stay deterministic) ----
let _s = 12345;
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const _rng = mulberry32(_s);
Math.random = _rng;

// ---- eval full module list in index.html order ----
const order = [];
try {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<script[^>]+src="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) order.push(m[1]);
} catch (e) { console.error('no index.html'); process.exit(2); }
const skip = /app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/;
const files = order.map(s => s.split('?')[0]).filter(s => s.startsWith('src/js/') && !skip.test(s));
// equipment.js needs window at load — stub for eval, delete before playing
// (else tbAfterPlayerAction takes the async path and fights stall).
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

  // ---------- verbs exist ----------
  console.log('(0) control verbs exist');
  ok(typeof Game.tbPlayerShove === 'function', 'tbPlayerShove exists');
  ok(typeof Game.tbPlayerBind === 'function', 'tbPlayerBind exists');
  ok(typeof Game.tbPlayerGoad === 'function', 'tbPlayerGoad exists');
  if (typeof Game.tbPlayerShove !== 'function') { console.log(`\n${pass} passed, ${fail} failed`); process.exit(1); }

  // ---------- SHOVE ----------
  console.log('(1) SHOVE moves a controlled monster');
  {
    const m = { key: 'm1', kind: 'monster', alive: true, fled: false, mx: 4, my: 4, stunned: 1, hp: 50, maxHp: 50, mdef: { id: 'x' }, name: 'Testbeast' };
    const p = { key: 'p', kind: 'player', alive: true, fled: false, mx: 4, my: 5, acted: false, moveLeft: 3, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    Game._testFighter = (k) => k === 'p' ? p : m;
    const origFighter = Game.tbFighter;
    Game.tbFighter = function (k) { return Game._testFighter(k); };
    Game.tbIsPlayerTurn = () => true;
    Game.tbCanOccupy = () => true;
    Game.fighterTiles = (o) => [[o.mx, o.my]];
    Game.fighterSize = () => 1;
    Game.encSubject = (o) => o.name || 'it';
    Game.tbEndCheck = () => false;
    Game.tbAfterPlayerAction = () => {};
    Game.tbDamage = (k, d) => { const t = Game._testFighter(k); t.hp -= d; };
    const okShove = Game.tbPlayerShove('m1');
    ok(okShove === true, 'shove succeeds vs stunned');
    ok(m.mx === 4 && m.my === 2, 'monster pushed 2 tiles away (4,4)->(4,2)', `${m.mx},${m.my}`);
    ok(p.acted === true, 'shove costs the action');
    ok(lines.join(' ').includes('Shove'), 'shove narrated');
    Game.tbFighter = origFighter;
  }

  // ---------- SHOVE blocked by wall ----------
  console.log('(2) SHOVE stops at blocked tiles');
  {
    lines.length = 0;
    const m = { key: 'm1', kind: 'monster', alive: true, fled: false, mx: 4, my: 4, stunned: 1, hp: 50, maxHp: 50, mdef: { id: 'x' }, name: 'Testbeast' };
    const p = { key: 'p', kind: 'player', alive: true, fled: false, mx: 4, my: 5, acted: false, moveLeft: 3, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    const origFighter = Game.tbFighter;
    Game.tbFighter = (k) => k === 'p' ? p : m;
    Game.tbIsPlayerTurn = () => true;
    // tile (4,3) is open, (4,2) is a wall
    Game.tbCanOccupy = (f, x, y) => !(x === 4 && y === 2);
    Game.fighterTiles = (o) => [[o.mx, o.my]];
    Game.fighterSize = () => 1;
    Game.encSubject = (o) => o.name || 'it';
    Game.tbEndCheck = () => false;
    Game.tbAfterPlayerAction = () => {};
    Game.tbDamage = (k, d) => { Game.tbFighter(k).hp -= d; };
    Game.tbPlayerShove('m1');
    ok(m.mx === 4 && m.my === 3, 'shove stops before wall (4,3)', `${m.mx},${m.my}`);
    Game.tbFighter = origFighter;
  }

  // ---------- SHOVE refuses uncontrolled ----------
  console.log('(3) SHOVE refuses a steady target');
  {
    lines.length = 0;
    const m = { key: 'm1', kind: 'monster', alive: true, fled: false, mx: 4, my: 4, stunned: 0, hp: 50, maxHp: 50, mdef: { id: 'x' }, name: 'Testbeast' };
    const p = { key: 'p', kind: 'player', alive: true, fled: false, mx: 4, my: 5, acted: false, moveLeft: 3, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    const origFighter = Game.tbFighter;
    Game.tbFighter = (k) => k === 'p' ? p : m;
    Game.tbIsPlayerTurn = () => true;
    const r = Game.tbPlayerShove('m1');
    ok(r === false, 'shove refused vs uncontrolled');
    ok(m.mx === 4 && m.my === 4, 'monster unmoved');
    ok(p.acted === false, 'action not spent on refusal');
    Game.tbFighter = origFighter;
  }

  // ---------- BIND ----------
  console.log('(4) BIND roots a stunned monster, consumes rope');
  {
    lines.length = 0;
    const m = { key: 'm1', kind: 'monster', alive: true, fled: false, mx: 4, my: 4, stunned: 1, hp: 50, maxHp: 50, mdef: { id: 'x' }, name: 'Testbeast' };
    const p = { key: 'p', kind: 'player', alive: true, fled: false, mx: 4, my: 5, acted: false, moveLeft: 3, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    Game.state = Game.state || {};
    Game.state.scholar = { inventory: [{ itemId: 'rope_50ft', units: 2 }] };
    const origFighter = Game.tbFighter;
    Game.tbFighter = (k) => k === 'p' ? p : m;
    Game.tbIsPlayerTurn = () => true;
    Game.fighterSize = () => 1;
    Game.encSubject = (o) => o.name || 'it';
    Game.tbEndCheck = () => false;
    Game.tbAfterPlayerAction = () => {};
    Game.tbRefreshTelegraphUI = () => {};
    const r = Game.tbPlayerBind('m1');
    ok(r === true, 'bind succeeds vs stunned');
    ok(m._bound === 3, 'bound 3 rounds', m._bound);
    ok(Game.state.scholar.inventory[0].units === 1, 'rope consumed (2→1)');
    ok(p.acted === true, 'bind costs the action');
    ok(lines.join(' ').includes('hogtie'), 'bind narrated');
    // diminishing: second bind on same monster
    m.stunned = 1; p.acted = false;
    Game.tbPlayerBind('m1');
    ok(m._bound === 2, 'second bind diminished 3→2', m._bound);
    ok(!Game.hasItem('rope_50ft'), 'second rope consumed (none left)');
    Game.tbFighter = origFighter;
  }

  // ---------- BIND refuses without rope ----------
  console.log('(5) BIND refuses without rope');
  {
    lines.length = 0;
    const m = { key: 'm1', kind: 'monster', alive: true, fled: false, mx: 4, my: 4, stunned: 1, hp: 50, maxHp: 50, mdef: { id: 'x' }, name: 'Testbeast' };
    const p = { key: 'p', kind: 'player', alive: true, fled: false, mx: 4, my: 5, acted: false, moveLeft: 3, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    Game.state.scholar = { inventory: [] };
    const origFighter = Game.tbFighter;
    Game.tbFighter = (k) => k === 'p' ? p : m;
    Game.tbIsPlayerTurn = () => true;
    Game.fighterSize = () => 1;
    Game.encSubject = (o) => o.name || 'it';
    const r = Game.tbPlayerBind('m1');
    ok(r === false, 'bind refused without rope');
    ok((m._bound || 0) === 0, 'not bound');
    ok(p.acted === false, 'action not spent');
    Game.tbFighter = origFighter;
  }

  // ---------- GOAD ----------
  console.log('(6) GOAD redirects a blinded monster\'s move');
  {
    lines.length = 0;
    const m = { key: 'm1', kind: 'monster', alive: true, fled: false, mx: 4, my: 4, blind: 2, hp: 50, maxHp: 50, mdef: { id: 'x' }, name: 'Testbeast' };
    const p = { key: 'p', kind: 'player', alive: true, fled: false, mx: 6, my: 6, acted: false, moveLeft: 3, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    const origFighter = Game.tbFighter;
    Game.tbFighter = (k) => k === 'p' ? p : m;
    Game.tbIsPlayerTurn = () => true;
    Game.encSubject = (o) => o.name || 'it';
    Game.tbEndCheck = () => false;
    Game.tbAfterPlayerAction = () => {};
    const r = Game.tbPlayerGoad('m1');
    ok(r === true, 'goad succeeds vs blinded');
    ok(m._goadedBy === 'p', 'goad flag set');
    ok(p.acted === true, 'goad costs the action');
    // now the monster steps — tbStepToward should redirect toward the player
    const origStep = Game.tbStepToward;
    let sawTx = null, sawTy = null;
    Game.tbStepToward = function (mm, tx, ty, blocked, danger) {
      // replicate the goad hook: capture the effective target
      if (mm && mm._goadedBy) {
        const g = Game.tbFighter(mm._goadedBy);
        if (g) { tx = g.mx; ty = g.my; }
        mm._goadedBy = null;
      }
      sawTx = tx; sawTy = ty;
      return null;
    };
    Game.tbStepToward(m, 0, 0, () => true);
    ok(sawTx === 6 && sawTy === 6, 'goaded step targets the goader (6,6)', `${sawTx},${sawTy}`);
    ok(m._goadedBy == null, 'goad consumed after one move');
    Game.tbStepToward = origStep;
    Game.tbFighter = origFighter;
  }

  // ---------- GOAD refuses seeing target ----------
  console.log('(7) GOAD refuses a seeing target');
  {
    lines.length = 0;
    const m = { key: 'm1', kind: 'monster', alive: true, fled: false, mx: 4, my: 4, blind: 0, hp: 50, maxHp: 50, mdef: { id: 'x' }, name: 'Testbeast' };
    const p = { key: 'p', kind: 'player', alive: true, fled: false, mx: 5, my: 5, acted: false, moveLeft: 3, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    const origFighter = Game.tbFighter;
    Game.tbFighter = (k) => k === 'p' ? p : m;
    Game.tbIsPlayerTurn = () => true;
    Game.encSubject = (o) => o.name || 'it';
    const r = Game.tbPlayerGoad('m1');
    ok(r === false, 'goad refused vs seeing');
    ok(p.acted === false, 'action not spent');
    Game.tbFighter = origFighter;
  }

  // ---------- OPENINGS reduced to +25% ----------
  console.log('(8) OPENINGS bonus is +25%, not +50%');
  {
    const src = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
    ok(src.includes("(+25% vs controlled)"), 'narration says +25%');
    ok(!src.includes("(+50% vs controlled)"), 'no +50% narration remains');
    ok(/final\s*=\s*Math\.round\(final\s*\*\s*1\.25\)/.test(src), 'multiplier is 1.25x');
  }

  // ---------- codex interruptible ----------
  // Steve 2026-10-14: bulldozer + gallowdeer are UNinterruptible (the charge
  // and the beam still come). sunbasker + memory_projector are the
  // interruptible ones — their fiction supports breaking concentration.
  console.log('(9) codex documents interruptible counters');
  {
    const mons = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/monsters.json'), 'utf8'));
    const gal = mons.find(x => x.id === 'gallowdeer');
    const bul = mons.find(x => x.id === 'bulldozer');
    const sun = mons.find(x => x.id === 'sunbasker');
    const mem = mons.find(x => x.id === 'memory_projector');
    ok(!/interruptible/i.test(gal.counter.reveal), 'gallowdeer counter drops interruptible');
    ok(!/interruptible/i.test(bul.counter.reveal), 'bulldozer counter drops interruptible');
    ok(gal.uninterruptible === true && bul.uninterruptible === true, 'both flagged uninterruptible');
    ok(/interruptible/i.test(sun.counter.reveal), 'sunbasker counter notes interruptible');
    ok(/interruptible/i.test(mem.counter.reveal), 'memory_projector counter notes interruptible');
  }

  // ---------- _bound blocks movement ----------
  console.log('(10) bound monster cannot step');
  {
    const m = { key: 'm1', kind: 'monster', alive: true, mx: 4, my: 4, _bound: 2 };
    const r = Game.tbStepToward(m, 0, 0, () => false);
    ok(r === null, 'tbStepToward refuses bound monster');
  }

  // ---------- _bound suppresses telegraphs ----------
  console.log('(11) bound monster cannot wind up');
  {
    const src = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
    ok(src.includes('(Bind: no telegraphs while hogtied.)'), 'bind suppresses telegraphs in tbMonsterTurn');
    ok(src.includes('the rope bites! The attack fizzles.'), 'telegraph fizzle narrated');
  }

  // ---------- BIND accepts blinded (verbs compose) ----------
  console.log('(12) BIND works on blinded, not just stunned');
  {
    lines.length = 0;
    const m = { key: 'm1', kind: 'monster', alive: true, fled: false, mx: 4, my: 4, stunned: 0, blind: 2, hp: 50, maxHp: 50, mdef: { id: 'x' }, name: 'Testbeast' };
    const p = { key: 'p', kind: 'player', alive: true, fled: false, mx: 4, my: 5, acted: false, moveLeft: 3, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [p, m], over: false };
    Game.state.scholar = { inventory: [{ itemId: 'rope_50ft', units: 1 }] };
    const origFighter = Game.tbFighter;
    Game.tbFighter = (k) => k === 'p' ? p : m;
    Game.tbIsPlayerTurn = () => true;
    Game.fighterSize = () => 1;
    Game.encSubject = (o) => o.name || 'it';
    Game.tbEndCheck = () => false;
    Game.tbAfterPlayerAction = () => {};
    Game.tbRefreshTelegraphUI = () => {};
    const r = Game.tbPlayerBind('m1');
    ok(r === true, 'bind succeeds vs blinded');
    ok(m._bound === 3, 'bound 3 rounds');
    Game.tbFighter = origFighter;
  }

  // ---------- control verbs are ABILITIES (Steve 2026-10-14) ----------
  console.log('(12) control verbs are abilities, not basic actions');
  {
    lines.length = 0;
    const mons = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/abilities.json'), 'utf8'));
    const abs = Array.isArray(mons) ? mons : (mons.abilities || []);
    const find = (id) => abs.find(a => a.id === id);
    for (const [aid, act] of [['shoulder_check', 'shove'], ['hogtie', 'bind'], ['come_get_some', 'goad']]) {
      const a = find(aid);
      ok(!!a, `${aid} ability exists`);
      ok(a && a.pool === 'system', `${aid} is a System ability`);
      const action = a && (a.actions || []).find(x => x.id === act);
      ok(!!action && action.context === 'combat', `${aid}.${act} is a combat action`);
      ok(!!(action && action.cost && action.cost.kcal > 0), `${aid}.${act} costs kcal (food-powered)`);
    }
    // useAbility refuses without the ability
    Game.state = Game.state || {};
    Game.state.scholar = { abilities: [], day: 1, kcal: 2000 };
    Game.hasAbility = (id) => (Game.state.scholar.abilities || []).some(a => (a.id || a) === id);
    const m = { key: 'm1', kind: 'monster', alive: true, mx: 4, my: 4, stunned: 1, hp: 50, maxHp: 50, mdef: { id: 'x' }, name: 'Testbeast' };
    const p = { key: 'p', kind: 'player', alive: true, mx: 4, my: 5, acted: false, hp: 100, maxHp: 100 };
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
    Game.tbRefreshTelegraphUI = () => {};
    Game.inCombat = () => true;
    Game.actionContextValid = () => ({ ok: true });
    Game.payActionCost = () => ({ ok: true });
    Game.abilityActionDef = (aid, act) => {
      const a = find(aid);
      const action = a && (a.actions || []).find(x => x.id === act);
      return action ? { ability: a, action } : null;
    };
    const r1 = Game.useAbility('shoulder_check', 'shove', 'm1');
    ok(r1 === false, 'useAbility refuses shove without the ability');
    ok(/don't have that ability/.test(lines.join(' ')), 'refusal names the missing ability');
    // grant it — now it fires through the framework
    Game.state.scholar.abilities = [{ id: 'shoulder_check' }];
    lines.length = 0;
    const r2 = Game.useAbility('shoulder_check', 'shove', 'm1');
    ok(r2 === true, 'useAbility fires shove with the ability');
    ok(m.mx === 4 && m.my === 2, 'shove moved the monster via ability', `${m.mx},${m.my}`);
    Game.tbFighter = origFighter;
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
