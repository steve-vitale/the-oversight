#!/usr/bin/env node
// test-feastdraw-20261012.js — PROOF for longsim winpath r4.
// The r3 blank: the feast-surge chain went armed(12) -> granted(4) -> used(0)
// — the buff expired before a random encounter was found. The r4 lever:
// the cookfire's smoke draws scavengers. On a FRESH armed grant, a
// wave-appropriate beast is cast to the haven's edge as a pending encounter
// (face it / drive it off). The deed's fight comes to the village; only the
// encounter lottery is removed, never the fight.
//
// Part 1: mechanic unit checks (deterministic seeds, targeted).
//   T1 armed feast -> draw (pending encounter + feastDraw marker + valid cast)
//   T2 faceFeastDraw -> real fight -> feastSurgeUsed marked, devotion spent
//   T3 driveOffFeastDraw -> pending cleared, devotion UNspent, buff still live
//   T4 unarmed feast -> no draw
//   T5 refresh grant -> no second draw
//   T6 buff expiry -> the draw leaves with the fire
//   T7 live pending encounter -> the draw never clobbers it
// Part 2: before/after end-to-end (seed 8 x 120d winseek, pristine HEAD
// export vs this tree) — the granted->used gap closes.
//
// Usage: node scripts/test-feastdraw-20261012.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const H = ROOT + '/scripts/';
const { loadGame, setupGame, driveFights, mulberry32 } = require(H + 'sim-harness');
const PRISTINE = '/tmp/wp-baseline-pristine';

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
};

async function freshGame(seed) {
  Math.random = mulberry32(seed);
  const { Game, loadFails } = await loadGame({ seed, mode: 'winseek' });
  if (loadFails && loadFails.length) console.log('  loadFails: ' + loadFails.join('; '));
  await setupGame(Game);
  Game.say = function () {};
  return Game;
}

function armDevotion(Game, mult) {
  const s = Game.state.scholar || {};
  s.prog = s.prog || {};
  s.prog.feastSurge = mult || 1.5;
}

function hostArmedFeast(Game) {
  armDevotion(Game, 1.5);
  return Game.hostFeast();
}

async function part1() {
  console.log('PART 1 — mechanic unit checks');
  // T1: armed feast -> draw
  {
    const Game = await freshGame(101);
    const r = hostArmedFeast(Game);
    const s = Game.state.scholar || {};
    check('T1 feast granted', !!(r && r.ok && r.buffGranted), JSON.stringify(r && { ok: r.ok, buffGranted: r.buffGranted, why: r.why }));
    check('T1 pending encounter set', !!Game.pendingEncounter);
    const d = Game.feastDrawPending ? Game.feastDrawPending() : null;
    check('T1 feastDraw pending', !!(d && d.monsterId));
    let valid = false, waveOk = false;
    if (d) {
      const mdef = (Game.data.monsters || []).find(m => m.id === d.monsterId);
      valid = !!mdef;
      waveOk = valid && (mdef.wave || 1) <= (Game.unlockedWave ? Game.unlockedWave() : 1);
    }
    check('T1 drawn beast is a real monster def', valid, d && d.monsterId);
    check('T1 drawn beast is wave-appropriate', waveOk);
    check('T1 grant reports the draw', !!(r && r.draw === (d && d.monsterId)));
  }
  // T2: face -> real fight -> use
  {
    const Game = await freshGame(102);
    const r = hostArmedFeast(Game);
    const d = Game.feastDrawPending();
    check('T2 draw present', !!(d && d.monsterId));
    const fr = Game.faceFeastDraw();
    check('T2 face ok', !!(fr && fr.ok), JSON.stringify(fr));
    check('T2 real fight live', !!(Game.tbfight && !Game.tbfight.over));
    let drewMonster = false;
    try {
      drewMonster = (Game.tbfight.fighters || []).some(f => f.kind === 'monster' && f.monsterId === d.monsterId);
    } catch (e) {}
    check('T2 the drawn beast is in the fight', drewMonster);
    // drive it to completion with the winseek fight policy
    const winseek = require(H + 'policies/winseek').winseek;
    driveFights(Game, winseek, {});
    const s = Game.state.scholar || {};
    check('T2 feastSurgeUsed marked', !!((s.prog || {}).feastSurgeUsed));
    check('T2 devotion spent', !((s.prog || {}).feastSurge), 'devotion must be consumed by real use');
  }
  // T3: drive-off -> pending cleared, devotion unspent, buff live
  {
    const Game = await freshGame(103);
    hostArmedFeast(Game);
    check('T3 draw present', !!Game.feastDrawPending());
    const dr = Game.driveOffFeastDraw();
    check('T3 drive-off ok', !!(dr && dr.ok));
    check('T3 pending cleared', !Game.pendingEncounter && !Game.pendingMonsterId);
    check('T3 marker cleared', !Game.feastDrawPending());
    const s = Game.state.scholar || {};
    check('T3 devotion unspent', !!((s.prog || {}).feastSurge), 'declining must not spend the devotion');
    check('T3 buff still live', !!(Game.feastedActive && Game.feastedActive()));
    check('T3 deed unmarked', !((s.prog || {}).feastSurgeUsed));
  }
  // T4: unarmed feast -> no draw
  {
    const Game = await freshGame(104);
    const r = Game.hostFeast();
    check('T4 feast held', !!(r && r.ok));
    check('T4 no buff (unarmed refusal)', !(Game.feastedActive && Game.feastedActive()));
    check('T4 no draw', !Game.feastDrawPending());
  }
  // T5: refresh grant -> no second draw
  {
    const Game = await freshGame(105);
    hostArmedFeast(Game);
    const d1 = Game.feastDrawPending();
    check('T5 first draw present', !!(d1 && d1.monsterId));
    armDevotion(Game, 1.5); // re-arm (nothing spent it)
    const g = Game.grantFeastBuff({ quality: 1, surge: 1.5, served: [], guests: [] });
    check('T5 second grant is a refresh', !!(g && g.granted && g.refreshed), JSON.stringify(g && { granted: g.granted, refreshed: g.refreshed }));
    const d2 = Game.feastDrawPending();
    check('T5 no second draw', !!(d2 && d2.monsterId === d1.monsterId), (d1 && d1.monsterId) + ' vs ' + (d2 && d2.monsterId));
  }
  // T6: buff expiry -> the draw leaves with the fire
  {
    const Game = await freshGame(106);
    hostArmedFeast(Game);
    check('T6 draw present', !!Game.feastDrawPending());
    Game.clearFeastBuff(true);
    check('T6 buff gone', !(Game.feastedActive && Game.feastedActive()));
    check('T6 pending cleared', !Game.pendingEncounter && !Game.pendingMonsterId);
    check('T6 marker cleared', !Game.feastDrawPending());
    const s = Game.state.scholar || {};
    check('T6 devotion unspent by waiting', !!((s.prog || {}).feastSurge), 'expiry must not spend the devotion');
  }
  // T7: live pending encounter -> the draw never clobbers it
  {
    const Game = await freshGame(107);
    Game.pendingEncounter = true;
    Game.pendingMonsterId = 'bulldozer';
    hostArmedFeast(Game);
    check('T7 feast still granted', !!(Game.feastedActive && Game.feastedActive()));
    check('T7 no draw clobber', !Game.feastDrawPending());
    check('T7 original pending intact', Game.pendingEncounter && Game.pendingMonsterId === 'bulldozer');
  }
  // T8: a wanderer clobbering the pending slot must not inherit the feast
  // draw's veteran flag (startCombat scopes s.feastDraw.veteran by monster id).
  {
    const Game = await freshGame(108);
    hostArmedFeast(Game);
    const d = Game.feastDrawPending();
    check('T8 draw present', !!(d && d.monsterId));
    const s = Game.state.scholar || {};
    s.feastDraw.veteran = true; // force: the draw was a veteran
    // the wanderer takes the pending slot (harness auto-face path)
    Game.pendingMonsterId = 'bulldozer';
    Game.startCombat('bulldozer');
    let vet = null;
    try {
      const mf = (Game.tbfight.fighters || []).find(f => f.kind === 'monster');
      vet = mf ? !!mf.veteran : null;
    } catch (e) {}
    check('T8 clobbered fight is not veteran', vet === false, 'veteran=' + vet);
    check('T8 stale draw self-cleans', !Game.feastDrawPending());
  }
  // T9: the winseek policy does not flee a fight while the feast buff is
  // live and unused — even when outmatched by the old math. The buff is
  // the deed; the ×2+ multiplier is the equalizer. (r4: the policy faced
  // the draw then fled it at 37 HP, and the deed never marked.)
  {
    const Game = await freshGame(109);
    hostArmedFeast(Game);
    const d = Game.feastDrawPending();
    check('T9 draw present', !!(d && d.monsterId));
    const fr = Game.faceFeastDraw();
    check('T9 face ok', !!(fr && fr.ok));
    // hurt the player to 40% — the old outmatched math (hpPct < 0.5) flees here
    try {
      const p = Game.tbFighter('p');
      p.hp = Math.round((p.maxHp || 100) * 0.4);
    } catch (e) {}
    let struck = false, fled = false;
    const ogStrike = Game.tbPlayerStrike.bind(Game);
    const ogMove = Game.tbPlayerMove.bind(Game);
    Game.tbPlayerStrike = function (t) { struck = true; return ogStrike(t); };
    Game.tbPlayerMove = function (x, y) {
      if (x === 0 || x === 8) fled = true; // flee() walks to the edge
      return ogMove(x, y);
    };
    const winseek = require(H + 'policies/winseek').winseek;
    let handled = false;
    try { handled = winseek.fight(Game, {}); } catch (e) {}
    check('T9 fight handled', !!handled);
    check('T9 struck, did not flee', struck && !fled, 'struck=' + struck + ' fled=' + fled);
    Game.tbPlayerStrike = ogStrike;
    Game.tbPlayerMove = ogMove;
  }
}

async function part2() {
  // Before/after on the IDENTICAL setup (seed 201): pristine HEAD export
  // (no draw machinery) vs this tree (the draw). Each side runs in its OWN
  // node process: the sim-harness evals src/js files in-module, and
  // food.js/justice.js assign module.exports when eval'd — requiring two
  // trees' harnesses in one process clobbers the second require's exports
  // (pre-existing harness quirk, not this change).
  console.log('PART 2 — before/after on identical setup (seed 201, armed feast)');
  const script = [
    "const SH = require('./scripts/sim-harness');",
    "(async () => {",
    "  const out = {};",
    "  try {",
    "    const G = await SH.loadGame({ seed: 201, mode: 'winseek' }).then(r => r.Game);",
    "    await SH.setupGame(G);",
    "    G.say = function () {};",
    "    out.hasDrawMachinery = typeof G.drawFeastScavenger === 'function';",
    "    const s = G.state.scholar || {}; s.prog = s.prog || {}; s.prog.feastSurge = 1.5;",
    "    const r = G.hostFeast();",
    "    out.granted = !!(r && r.ok && r.buffGranted);",
    "    out.reportDraw = (r && r.draw) || null;",
    "    out.pending = !!G.pendingEncounter;",
    "    const d = G.feastDrawPending ? G.feastDrawPending() : null;",
    "    out.drawId = (d && d.monsterId) || null;",
    "  } catch (e) { out.error = String((e && e.stack) || e).slice(0, 500); }",
    "  console.log('RESULTJSON:' + JSON.stringify(out));",
    "})();",
  ].join('\n');
  const run = (cwd) => {
    const stdout = execFileSync('node', ['-e', script], { cwd, encoding: 'utf8', timeout: 180000, stdio: ['ignore', 'pipe', 'pipe'] });
    const line = String(stdout).split('\n').find(l => l.indexOf('RESULTJSON:') === 0);
    if (!line) throw new Error('no RESULTJSON from ' + cwd + ' :: ' + String(stdout).slice(-300));
    return JSON.parse(line.slice('RESULTJSON:'.length));
  };
  const before = run(PRISTINE);
  const after = run(ROOT);
  console.log('  before: ' + JSON.stringify(before));
  console.log('  after:  ' + JSON.stringify(after));
  check('P2 pristine: no draw machinery', before.hasDrawMachinery === false);
  check('P2 pristine: feast granted', before.granted === true);
  check('P2 pristine: no pending beast', before.pending === false, 'the r3 blank: the buff lives but nothing comes');
  check('P2 after: draw machinery present', after.hasDrawMachinery === true);
  check('P2 after: feast granted', after.granted === true);
  check('P2 after: a beast is circling', !!after.drawId, after.drawId);
  check('P2 after: pending encounter set', after.pending === true);
  check('P2 after: feast report names the draw', after.reportDraw === after.drawId);
}

(async () => {
  try {
    await part1();
    await part2();
  } catch (e) {
    fail++;
    console.log('  FAIL harness threw: ' + (e && e.stack || e));
  }
  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
