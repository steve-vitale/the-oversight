#!/usr/bin/env node
// test-table-sanctity-gate-20261020.js — proof for the sanctity-gate arm
// (journey-scale r10, 2026-10-19; named next from sim-sanctityaudit DIAG-GO).
//
// Canon: docs/TABLE.md (sanctity of the table, Steve 2026-10-12): when the
// table sits, the world holds its breath — ambient monster pressure is
// suspended; ALL stakes during the finale are the table's own.
// Fix: (1) the ambient contact block in monsterTurn() (src/js/game.js) is
// gated on tableActive(); (2) both reengageWaitingMonsters callers
// (hall-door exit, treelineAmbush) hold the stash mid-finale instead of
// engaging. Untouched: the trial (table-feared.js startCombat('finale',
// {tableTrial:true})), contests, player-initiated paths (glasswing trap
// tick, tent "Face it", feast draw, UI), the lingerer treeline re-pinning.
//
// RED: on the unfixed engine the ambient construction fires startCombat
// with tableActive() true, and reengage fires mid-sanctity.
// GREEN: after the gate — no ambient fire, the lingerer stays pinned (the
// crisis stays open), the trial still fires, and the non-sanctity CONTROL
// proves normal play is untouched.
//
// Usage: node scripts/test-table-sanctity-gate-20261020.js
// RED check (patch-file round trip, never stash on the hot tree):
//   git diff src/js/game.js > /tmp/sanctity.patch && git checkout HEAD -- src/js/game.js
//   node scripts/test-table-sanctity-gate-20261020.js   # expect RED
//   git apply /tmp/sanctity.patch
//   node scripts/test-table-sanctity-gate-20261020.js   # expect GREEN
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const SEED = 64203;
let failures = 0;
function check(name, cond, detail) {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

async function freshSanctity() {
  const { Game } = await loadGame({ seed: SEED, mode: 'posttable', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy; // player at Haven
  const s = Game.state.scholar; s.mx = 4; s.my = 4;
  // the raid night-beat's product, pre-sitting (the corpus incident's mechanism):
  const m = Game.spawnWorldMonster({ id: 'suburb' }, hx, hy, { mx: 4, my: 6 });
  m.lingering = true;
  // sit the table:
  const pg = Game.progState(); pg.tableDone = true; pg.tableSittingId = 1;
  const T = Game.tableState(); T.phase = 'challenge'; T.path = 'feared';
  return { Game, m, hx, hy };
}

function wrapStartCombat(Game) {
  const fired = [];
  const oSC = Game.startCombat.bind(Game);
  Game.startCombat = function (monsterId, options) {
    try {
      fired.push({ mid: monsterId != null ? String(monsterId) : null,
        tableTrial: !!(options && options.tableTrial),
        active: !!(Game.tableActive && Game.tableActive()) });
    } catch (e) {}
    return oSC.apply(this, arguments);
  };
  return fired;
}

function pinnedAtHaven(Game, m, hx, hy) {
  try {
    const list = Game.worldMonsters ? Game.worldMonsters() : [];
    return list.some(x => x === m || (x.id === m.id && x.tx === hx && x.ty === hy && x.lingering));
  } catch (e) { return false; }
}

async function main() {
  console.log('=== test-table-sanctity-gate (journey-scale r10) ===');

  // A. monsterTurn ambient contact under sanctity
  {
    const { Game, m, hx, hy } = await freshSanctity();
    const active = !!(Game.tableActive && Game.tableActive());
    const fired = wrapStartCombat(Game);
    let ticks = 0;
    await quietLog(async () => { for (let i = 0; i < 200; i++) { ticks++; Game.monsterTurn(); } });
    const ambient = fired.filter(f => f.active && !f.tableTrial);
    console.log(`A. sanctity: tableActive=${active}, monsterTurn ticks=${ticks}, ambient fires=${ambient.length}`);
    check('A1 table sits in the construction', active === true);
    check('A2 no ambient startCombat while the table sits', ambient.length === 0,
      ambient.length ? JSON.stringify(ambient.slice(0, 3)) : '200 ticks, silent');
    check('A3 lingerer still pinned (crisis stays open)', pinnedAtHaven(Game, m, hx, hy) === true);
  }

  // B. the trial still fires mid-sanctity (the table's own stake — never gated)
  {
    const { Game } = await freshSanctity();
    const fired = wrapStartCombat(Game);
    let threw = null;
    await quietLog(async () => {
      try { Game.startCombat('finale', { tableTrial: true }); } catch (e) { threw = e; }
    });
    const trial = fired.filter(f => f.tableTrial);
    console.log(`B. trial: startCombat('finale',{tableTrial:true}) under sanctity, trial fires=${trial.length}`);
    check('B1 trial by combat still fires while the table sits', trial.length === 1,
      threw ? 'threw: ' + String(threw && threw.message).slice(0, 120) : '');
  }

  // C. reengageWaitingMonsters under sanctity — hall-door exit path
  {
    const { Game } = await freshSanctity();
    const fired = wrapStartCombat(Game);
    const me = Game.villagerId;
    Game.state.doorFledMonsters = [{ id: 'hushwolf', hp: 12, bearer: me }];
    const before = JSON.stringify(Game.state.doorFledMonsters);
    let ret = null, threw = null;
    await quietLog(async () => {
      try { ret = Game.exitBuilding(false); } catch (e) { threw = e; }
    });
    const after = JSON.stringify(Game.state.doorFledMonsters);
    console.log(`C. door-exit: ret=${ret}, fires=${fired.length}, stashKept=${before === after}`);
    check('C1 no re-engage fight out the hall door mid-sanctity', fired.length === 0);
    check('C2 the stash survives the finale (still waiting after)', before === after,
      threw ? 'threw: ' + String(threw && threw.message).slice(0, 120) : '');
  }

  // D. reengageWaitingMonsters under sanctity — treeline ambush path
  {
    const { Game, hx, hy } = await freshSanctity();
    const fired = wrapStartCombat(Game);
    const me = Game.villagerId;
    // a dead bearer's stash: tagged to another bearer so treelineAmbush claims it
    Game.state.doorFledMonsters = [{ id: 'hushwolf', hp: 20, bearer: 'someone-else' }];
    // departing Haven for the wild (from=safe, to=wild) — the real call shape
    // from travelTo (game.js:11539):
    Game.map.px = hx + 1; Game.map.py = hy + 1;
    let ret = null;
    await quietLog(async () => { ret = Game.treelineAmbush(hx, hy); });
    const stashLen = (Game.state.doorFledMonsters || []).length;
    console.log(`D. treeline: ret=${ret}, fires=${fired.length}, stashLen=${stashLen}`);
    check('D1 no treeline ambush mid-sanctity', fired.length === 0);
    check('D2 killer stash intact (crisis stays open)', stashLen === 1 && ret === false,
      `ret=${ret} stashLen=${stashLen}`);
  }

  // E. CONTROL — no sanctity: normal play is untouched
  {
    const { Game, m, hx, hy } = await freshSanctity();
    // lift the table: tableActive() = pg.tableDone && T.phase !== 'done'
    // (or T.winDeferred) — clear all three.
    try { const T = Game.tableState(); T.phase = 'done'; T.winDeferred = false; } catch (e) {}
    try { const pg = Game.progState(); pg.tableDone = false; pg.tableSittingId = null; } catch (e) {}
    const active = !!(Game.tableActive && Game.tableActive());
    const fired = wrapStartCombat(Game);
    let ticks = 0;
    await quietLog(async () => { for (let i = 0; i < 200 && !fired.length; i++) { ticks++; Game.monsterTurn(); } });
    console.log(`E. control (no sanctity): tableActive=${active}, ticks=${ticks}, fires=${fired.length}`);
    check('E1 table genuinely down in the control', active === false);
    check('E2 ambient contact still engages without sanctity', fired.length > 0,
      `first: ${fired.length ? fired[0].mid : 'none'}`);
  }
  {
    // reengage control on a FRESH game (no live fight from E's contact):
    const { Game } = await freshSanctity();
    try { const T = Game.tableState(); T.phase = 'done'; T.winDeferred = false; } catch (e) {}
    try { const pg = Game.progState(); pg.tableDone = false; pg.tableSittingId = null; } catch (e) {}
    const fired2 = wrapStartCombat(Game);
    const me = Game.villagerId;
    Game.state.doorFledMonsters = [{ id: 'hushwolf', hp: 12, bearer: me }];
    await quietLog(async () => { try { Game.exitBuilding(false); } catch (e) {} });
    console.log(`E3. reengage control fires=${fired2.length}`);
    check('E3 hall-door re-engage still fires without sanctity', fired2.length > 0);
  }

  console.log(failures ? `\nRESULT: RED — ${failures} check(s) failed` : '\nRESULT: GREEN — all checks pass');
  process.exit(failures ? 1 : 0);
}

if (require.main === module) main().catch(e => { console.error('FATAL:', e && e.message); process.exit(1); });
