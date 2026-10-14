// PROOF TEST: Day 7 cinematic soft-lock + 2 sibling debug-panel bugs (2026-10-12)
// Bug 1 (app.js systemArrivalAnimation, DOM-only): static-analysis proof that
//   (a) a re-entry guard prevents stacked overlays,
//   (b) the advance button is looked up inside its own overlay (no document-wide id),
//   (c) finish() removes ALL arrival overlays.
// Bug 2 (debug "Kill foes"): cheat-killed monsters spawn corpses via registerDeath.
// Bug 3 (debug loadout): applying a loadout mid-combat preserves tbfight + map position.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL ' + name + (detail ? ' -- ' + detail : '')); }
}

// ---------- Bug 1: static analysis of systemArrivalAnimation ----------
const appSrc = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
const animStart = appSrc.indexOf('function systemArrivalAnimation(callback)');
ok('bug1: systemArrivalAnimation exists', animStart >= 0);
const animEnd = appSrc.indexOf('\n  }', animStart + 100);
const animRaw = appSrc.slice(animStart, animEnd + 4);
// strip // comments: the fix's own explanatory comments name the old call shape
const anim = animRaw.replace(/\/\/[^\n]*/g, '');
ok('bug1: re-entry guard (querySelector .system-arrival-overlay before append)',
  anim.includes("if (document.querySelector('.system-arrival-overlay')) return;"),
  'guard missing — refreshes would stack overlays');
ok('bug1: no document.getElementById call wiring the advance button',
  !/document\.getElementById\(\s*['"]b-arrival-next['"]\s*\)/.test(anim),
  'document-wide id lookup present — duplicate overlays would leave dead buttons');
ok('bug1: button looked up inside its own overlay',
  anim.includes("overlay.querySelector('.arrival-next')"),
  'scoped lookup missing');
ok('bug1: finish() removes ALL arrival overlays',
  anim.includes("querySelectorAll('.system-arrival-overlay')"),
  'stray overlays could still trap the player');
ok('bug1: no duplicate-prone id="b-arrival-next" emitted',
  !anim.includes('id="b-arrival-next"') && !anim.includes("id='b-arrival-next'"),
  'duplicate id still rendered');

// ---------- Bugs 2+3: node harness (game.js logic, no DOM) ----------
const SEED = parseInt(process.env.SEED || '20261012', 10);
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ a >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(SEED); // seeded BEFORE eval

global.SCATTER_DATA = {};
for (const f of fs.readdirSync(path.join(ROOT, 'src/data'))) {
  if (!f.endsWith('.json')) continue;
  try { global.SCATTER_DATA[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); } catch (e) {}
}
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;
global.Scattering = {};
global.document = { createElement: () => ({ style: {}, appendChild() {}, }), body: { appendChild() {} }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SKIP_DOM = /app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/;
const files = [];
for (const m of html.matchAll(/src="([^"?]+)\?v=/g)) {
  const f = m[1];
  if (f.endsWith('.js') && !SKIP_DOM.test(f)) files.push(f);
}
const gameIdx = files.indexOf('src/js/game.js');
eval(fs.readFileSync(path.join(ROOT, files[gameIdx]), 'utf8'));
global.Game = globalThis.Scattering.Game;
files.forEach((f, i) => { if (i !== gameIdx) eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window;
Game.data = global.SCATTER_DATA;

function freshWorld() {
  Game.state = {
    scholar: { day: 10, mx: 4, my: 4, hp: 100, maxHp: 100, health: 100, kcal: 2000, inventory: [], abilities: [], equipped: {} },
    village: { roster: [], trust: {}, px: 3, py: 3 },
    codex: { monsters: {} },
    corpses: [],
    log: [],
  };
  Game.map = { px: 7, py: 7, tiles: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ({}))) };
  Game.tbfight = null;
}
Game.say = () => {};
Game.sysSay = () => {};

// ---------- Bug 2: kill-foes cheat spawns a corpse ----------
// Replicates the FIXED cheat handler in app.js (registerDeath per kill).
freshWorld();
Game.startCombat('hushwolf');
ok('bug2: combat started', !!Game.tbfight);
let tfDone = null;
{
  const tf = Game.tbfight;
  tfDone = tf; // tbEnd nulls Game.tbfight at cleanup; capture the object first
  for (const m of tf.fighters) {
    if ((m.kind === 'monster' || m.kind === 'hostile') && m.alive) {
      m.hp = 0; m.alive = false;
      if (m.kind === 'monster' && m.mdef) {
        try {
          m._deathCorpse = Game.registerDeath({
            kind: 'monster', monsterId: m.mdef.id, monsterName: m.name, name: m.name,
            mx: m.mx, my: m.my, cause: 'combat', killerId: Game.villagerId,
            witnesses: Game.fightWitnesses ? Game.fightWitnesses() : [],
          });
        } catch (e) {}
      }
    }
  }
  Game.tbEndCheck();
}
ok('bug2: fight ended', tfDone && tfDone.over === true, 'over=' + (tfDone && tfDone.over));
{
  const corpses = (Game.state.corpses || []).filter(c => c.kind === 'monster' && c.monsterId === 'hushwolf');
  ok('bug2: corpse spawned for cheat-killed monster', corpses.length >= 1, 'monster corpses=' + corpses.length);
  const m = corpses[0];
  ok('bug2: corpse has grid position', m && m.mx != null && m.my != null, JSON.stringify(m && { mx: m.mx, my: m.my }));
  const cx = (Game.state.codex.monsters || {}).hushwolf || {};
  ok('bug2: codex slain marked', cx.stage === 'slain', 'stage=' + cx.stage);
}

// ---------- Bug 3: loadout preserves combat + position ----------
freshWorld();
Game.startCombat('hushwolf');
ok('bug3: combat started', !!Game.tbfight);
const tfBefore = Game.tbfight;
const px0 = Game.map.px, py0 = Game.map.py;
Game.debugApplyLoadout('w1_fighter');
ok('bug3: tbfight object preserved', Game.tbfight === tfBefore, 'fight dropped or replaced');
ok('bug3: map position unchanged', Game.map.px === px0 && Game.map.py === py0,
  'was (' + px0 + ',' + py0 + ') now (' + Game.map.px + ',' + Game.map.py + ')');
ok('bug3: scholar grid pos unchanged', Game.state.scholar.mx === 4 && Game.state.scholar.my === 4);
{
  const s = Game.state.scholar;
  const w = (s.equipped && (s.equipped.melee || s.equipped.ranged)) || {};
  ok('bug3: loadout still applied (spear)', /spear/i.test(w.name || w.itemId || ''), JSON.stringify(w));
}
// all loadouts, mid-combat, none may move or drop the fight
for (const [id] of Game.debugLoadoutList()) {
  freshWorld();
  Game.startCombat('bulldozer');
  const tf = Game.tbfight, qx = Game.map.px, qy = Game.map.py;
  Game.debugApplyLoadout(id);
  ok('bug3: loadout ' + id + ' preserves fight+position',
    Game.tbfight === tf && Game.map.px === qx && Game.map.py === qy);
}

console.log('\n' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
