// test-wanderspawn-20261106.js — proof for the wanderer-spawn 20-HP fix
// (arm sim-wanderspawn-a, run fleshout-20261106T1515Z).
// The bug (sim-congtrace-a DIAG-GO): spawnWorldMonster (game.js:20271)
// only looks up the monster def when mdef is a string, so a bare {id}
// object falls back to baseHp 20 — a wave-4 Congregation wanderer-cast
// on seed 53006 spawned day 75 at 20/20 HP and died day 149 to one
// ordinary 56-damage strike. Same shape: trap spawn ({id}), finale
// campaign spawns ({id} + {titan:true}), debug button ({id}).
// The fix: resolve the def by id in spawnWorldMonster when full.hp is
// missing (caller fields win), and honor mdef.veteran, which the
// wanderer call passes but opts.veteran drops.
// RED pre-fix: the bare-{id} HP checks fail (20, not def HP) and the
// 53006 driver leg still holds the 1-round solo wave-4 win.
// GREEN post-fix: every spawn carries its def HP (hp[0]); the 53006
// leg holds no 1-round solo wave-4+ win.
// Usage: node scripts/test-wanderspawn-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 20261106, mode: 'wanderspawn', fullTelemetry: false });
  await setupGame(Game);
  const tx = Game.map.px, ty = Game.map.py;
  const defHp = (id) => {
    const d = (Game.data.monsters || []).find(m => m.id === id) || {};
    return d.hp ? d.hp[0] : null;
  };

  // 1. Wanderer shape: bare {id, veteran:false} — the d75 Congregation.
  let m = Game.spawnWorldMonster({ id: 'congregation', veteran: false }, tx, ty, { mx: 5, my: 1 });
  check('wanderer congregation hp is def hp[0] (900), not 20', m.hp === 900 && m.maxHp === 900, 'hp=' + m.hp + ' maxHp=' + m.maxHp);
  check('wanderer congregation wave 4', m.wave === 4, 'wave=' + m.wave);
  check('wanderer congregation size 2 (def size)', m.size === 2, 'size=' + m.size);
  check('wanderer congregation veteran false stays false', m.veteran === false, 'veteran=' + m.veteran);
  Game.removeWorldMonster(m);

  // 2. Veteran wanderer: the veteran flag the call passes must survive.
  m = Game.spawnWorldMonster({ id: 'congregation', veteran: true }, tx, ty, { mx: 5, my: 1 });
  check('veteran wanderer keeps veteran flag', m.veteran === true, 'veteran=' + m.veteran);
  check('veteran wanderer hp is def hp (900, +50% applies at fight build)', m.hp === 900 && m.maxHp === 900, 'hp=' + m.hp);
  Game.removeWorldMonster(m);

  // 3. Trap shape: bare {id} for the glasswing (def hp [18,26]).
  m = Game.spawnWorldMonster({ id: 'glasswing' }, tx, ty, { mx: 4, my: 4, beamPhase: 'grounded', gwGrounded: 3 });
  check('trap glasswing hp is def hp[0] (18), not 20', m.hp === 18 && m.maxHp === 18, 'hp=' + m.hp);
  check('trap glasswing keeps grounded opts', m.beamPhase === 'grounded' && m.gwGrounded === 3, 'beamPhase=' + m.beamPhase);
  Game.removeWorldMonster(m);

  // 4. Finale campaign nodes: bare {id} + {titan:true}.
  m = Game.spawnWorldMonster({ id: 'finale_crew' }, tx, ty, { titan: true });
  check('finale_crew hp is def hp[0] (700), not 20', m.hp === 700 && m.maxHp === 700, 'hp=' + m.hp);
  check('finale_crew wave 5 size 2', m.wave === 5 && m.size === 2, 'wave=' + m.wave + ' size=' + m.size);
  Game.removeWorldMonster(m);
  m = Game.spawnWorldMonster({ id: 'finale_opening' }, tx, ty, { titan: true });
  check('finale_opening hp is def hp[0] (900), not 20', m.hp === 900 && m.maxHp === 900, 'hp=' + m.hp);
  Game.removeWorldMonster(m);
  m = Game.spawnWorldMonster({ id: 'finale' }, tx, ty, { titan: true });
  check('finale heart hp is def hp[0] (1800), not 20', m.hp === 1800 && m.maxHp === 1800, 'hp=' + m.hp);
  check('finale heart size 3 (def size)', m.size === 3, 'size=' + m.size);
  Game.removeWorldMonster(m);

  // 5. Debug-button shape: bare {id}.
  m = Game.spawnWorldMonster({ id: 'hushwolf' }, tx, ty, { mx: 4, my: 4 });
  check('debug-button hushwolf hp is def hp[0] (50), not 20', m.hp === 50 && m.maxHp === 50, 'hp=' + m.hp);
  Game.removeWorldMonster(m);

  // 6. No-regression controls (must pass pre- AND post-fix).
  m = Game.spawnWorldMonster('hushwolf', tx, ty, { mx: 4, my: 4 });
  check('control: string id still spawns at def hp (50)', m.hp === 50 && m.maxHp === 50, 'hp=' + m.hp);
  Game.removeWorldMonster(m);
  const fullDef = (Game.data.monsters || []).find(x => x.id === 'congregation') || {};
  m = Game.spawnWorldMonster(fullDef, tx, ty, { mx: 5, my: 1 });
  check('control: full def still spawns at def hp (900)', m.hp === 900 && m.maxHp === 900, 'hp=' + m.hp);
  Game.removeWorldMonster(m);
  m = Game.spawnWorldMonster({ id: 'congregation' }, tx, ty, { mx: 5, my: 1, hp: 123, maxHp: 900 });
  check('control: fled-recovery explicit hp/maxHp preserved (123/900)', m.hp === 123 && m.maxHp === 900, 'hp=' + m.hp + ' maxHp=' + m.maxHp);
  Game.removeWorldMonster(m);
  m = Game.spawnWorldMonster({ id: 'congregation' }, tx, ty, { mx: 5, my: 1, hp: 500 });
  check('control: opts.hp override still respected (500)', m.hp === 500, 'hp=' + m.hp);
  Game.removeWorldMonster(m);
  m = Game.spawnWorldMonster({ id: 'does_not_exist' }, tx, ty, { mx: 4, my: 4 });
  check('control: unknown id still falls back to 20 (no crash)', m.hp === 20 && m.maxHp === 20, 'hp=' + m.hp);
  Game.removeWorldMonster(m);
  check('defHp helper sanity: congregation 900, glasswing 18', defHp('congregation') === 900 && defHp('glasswing') === 18, '');

  // 7. Sim-level shape leg: seed 53006 staged 150d — the d149 1-round
  // solo wave-4 win must be GONE after the fix (the beast no longer
  // spawns at 20 HP). Pre-fix this leg FAILS (the shape is present).
  // NOTE: trajectory shift alone could also remove the shape; the
  // in-process spawn checks above are the decisive proof, this leg is
  // the shape check.
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wanderspawn-proof-'));
  console.log('driver leg outDir: ' + outDir);
  execFileSync('node', [path.join(REPO, 'scripts', 'stageally-driver-20261106.js')], {
    cwd: REPO,
    env: Object.assign({}, process.env, {
      DAYS: '150', SEEDS: '53006', RUN: 'wanderspawn-proof', POLICY: 'staged', OUTDIR: outDir,
    }),
    stdio: 'inherit',
  });
  const leg = JSON.parse(fs.readFileSync(path.join(outDir, 'stageally-s53006-wanderspawn-proof.json'), 'utf8'));
  const shape = (leg.tbFights || []).filter(r => (r.wave || 1) >= 4 && r.rounds === 1 && r.alliesAtEntry === 0 && r.partyAtEntry === 0 && r.outcome === 'won');
  check('sim leg 53006: no 1-round solo wave-4+ win', shape.length === 0, shape.length ? JSON.stringify(shape) : '');
  console.log('sim leg: days=' + leg.days + ' endReason=' + leg.endReason + ' standing=' + leg.standing + ' wave4kills=' + ((leg.waveKillLog || []).filter(k => k.w >= 4).length));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF ERROR', e && e.stack || e); process.exit(2); });
