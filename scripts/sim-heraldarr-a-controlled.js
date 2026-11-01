#!/usr/bin/env node
// sim-heraldarr-a-controlled.js — CONTROLLED follow-path driver (DIAG ONLY).
// Synthetic game, not a seed sim. Drives the travelTo follow branch for
// the Herald directly: follow-enter onto a non-safe tile, follow-hold
// onto the safe Haven tile, and a follows:false control that stays.
//
// Setup placement (direct map assignment) is test scaffolding ONLY —
// only the travelTo calls are judged. Prints one JSON object to stdout
// and exits 0 iff all three steps behave as expected (a BLOCKED step
// exits 1: the leg is incomplete, not green).
//
//   node scripts/sim-heraldarr-a-controlled.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

async function main() {
  const { Game } = await loadGame({ seed: 1, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const sayLines = [];
  const origSay = Game.say;
  Game.say = function () {
    try { sayLines.push(arguments.length ? String(arguments[0]) : ''); } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const out = { followsValue: null, controlId: null, steps: [], sayFollowLines: [] };
  const tileOf = (id) => {
    try { const m = (Game.worldMonsters() || []).find(x => x && x.id === id) || null; return m ? { x: m.tx, y: m.ty } : null; }
    catch (e) { return null; }
  };
  const scholarTile = () => ({ x: Game.map.px, y: Game.map.py });
  const hasFollowLine = (fromIdx, needle) => sayLines.slice(fromIdx).some(l => needle.test(l));
  let ok = true;
  const step = (name, expected, actual, detail) => {
    const pass = expected === actual;
    if (!pass) ok = false;
    out.steps.push({ name: name, expected: expected, actual: actual, pass: pass, detail: detail || null });
    return pass;
  };

  // 0. Read the herald def verbatim.
  const heraldDef = (Game.data.monsters || []).find(m => m.id === 'herald') || {};
  out.followsValue = heraldDef.hasOwnProperty('follows') ? heraldDef.follows : null;
  out.followsType = typeof heraldDef.follows;
  out.followsTruthy = !!heraldDef.follows;

  // 1. Setup: scholar on (5,5), herald spawned on the scholar's tile.
  Game.map.px = 5; Game.map.py = 5;
  try { Game.state.scholar.mx = 4; Game.state.scholar.my = 4; } catch (e) {}
  const spawned = Game.spawnWorldMonster({ id: 'herald' }, 5, 5, {});
  step('setup-herald-on-scholar-tile', '5,5', spawned ? (spawned.tx + ',' + spawned.ty) : 'null');

  // 2. Follow-enter: travel to an adjacent non-safe, unoccupied tile.
  const enterCands = [{ x: 5, y: 4 }, { x: 6, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 5 }];
  let enterDest = null, enterSayIdx = sayLines.length;
  for (const c of enterCands) {
    try { if (Game.monsterAt(c.x, c.y)) continue; } catch (e) {}
    try { if (Game.isSafeTile(c.x, c.y)) continue; } catch (e) {}
    enterSayIdx = sayLines.length;
    const before = scholarTile();
    await quietLog(async () => { Game.travelTo(c.x, c.y); });
    if (scholarTile().x === c.x && scholarTile().y === c.y) { enterDest = c; break; }
    // Blocked/refused: scholar stayed; try the next candidate.
    void before;
  }
  if (!enterDest) {
    ok = false;
    out.steps.push({ name: 'follow-enter', expected: 'herald-on-dest', actual: 'BLOCKED', pass: false, detail: 'no adjacent candidate travel succeeded' });
  } else {
    const ht = tileOf('herald');
    step('follow-enter', enterDest.x + ',' + enterDest.y, ht ? (ht.x + ',' + ht.y) : 'null', { dest: enterDest });
    step('follow-enter-line', true, hasFollowLine(enterSayIdx, /It followed you/), { dest: enterDest });
  }

  // 3. Follow-hold: travel from the enter destination to the Haven tile.
  const haven = { x: (Game.state.village && Game.state.village.px != null ? Game.state.village.px : 4), y: (Game.state.village && Game.state.village.py != null ? Game.state.village.py : 4) };
  out.havenTile = haven;
  const heraldBeforeHold = tileOf('herald');
  const holdSayIdx = sayLines.length;
  let holdMoved = false;
  if (enterDest) {
    await quietLog(async () => { Game.travelTo(haven.x, haven.y); });
    const st = scholarTile();
    if (st.x !== haven.x || st.y !== haven.y) {
      // Blocked travel to Haven: retry with force (bypasses blockage only).
      await quietLog(async () => { Game.travelTo(haven.x, haven.y, true); });
    }
    const st2 = scholarTile();
    holdMoved = !(st2.x === haven.x && st2.y === haven.y);
    const ht = tileOf('herald');
    if (holdMoved) {
      ok = false;
      out.steps.push({ name: 'follow-hold', expected: 'herald-unchanged', actual: 'BLOCKED', pass: false, detail: 'travel to Haven did not move the scholar' });
    } else {
      step('follow-hold', heraldBeforeHold ? (heraldBeforeHold.x + ',' + heraldBeforeHold.y) : 'null', ht ? (ht.x + ',' + ht.y) : 'null', { haven: haven });
      step('follow-hold-line', true, hasFollowLine(holdSayIdx, /stops at the treeline/), { haven: haven });
    }
  } else {
    ok = false;
    out.steps.push({ name: 'follow-hold', expected: 'herald-unchanged', actual: 'SKIPPED', pass: false, detail: 'follow-enter did not succeed' });
  }

  // 4. Control: a follows:false monster stays on the old tile.
  const controlDef = (Game.data.monsters || []).find(m => m.follows === false) || null;
  out.controlId = controlDef ? controlDef.id : null;
  if (!controlDef) {
    ok = false;
    out.steps.push({ name: 'control-stays', expected: 'control-unchanged', actual: 'NO-CONTROL-DEF', pass: false });
  } else {
    Game.map.px = 3; Game.map.py = 3;
    try { Game.state.scholar.mx = 4; Game.state.scholar.my = 4; } catch (e) {}
    const cm = Game.spawnWorldMonster({ id: controlDef.id }, 3, 3, {});
    step('setup-control-on-scholar-tile', '3,3', cm ? (cm.tx + ',' + cm.ty) : 'null');
    const ctrlCands = [{ x: 3, y: 4 }, { x: 4, y: 3 }, { x: 3, y: 2 }, { x: 2, y: 3 }];
    let ctrlDest = null;
    for (const c of ctrlCands) {
      try { if (Game.monsterAt(c.x, c.y)) continue; } catch (e) {}
      try { if (Game.isSafeTile(c.x, c.y)) continue; } catch (e) {}
      await quietLog(async () => { Game.travelTo(c.x, c.y); });
      if (scholarTile().x === c.x && scholarTile().y === c.y) { ctrlDest = c; break; }
    }
    if (!ctrlDest) {
      ok = false;
      out.steps.push({ name: 'control-stays', expected: 'control-unchanged', actual: 'BLOCKED', pass: false, detail: 'no adjacent candidate travel succeeded' });
    } else {
      const ct = tileOf(controlDef.id);
      step('control-stays', '3,3', ct ? (ct.x + ',' + ct.y) : 'null', { dest: ctrlDest, controlId: controlDef.id });
    }
  }

  out.sayFollowLines = sayLines.filter(l => /It followed you|stops at the treeline|stops at the boundary/.test(l));
  out.ok = ok;
  try { Game.say = origSay; } catch (e) {}
  process.stdout.write(JSON.stringify(out, null, 1) + '\n');
  if (!ok) process.exitCode = 1;
}

main().catch(e => { console.error('CONTROLLED ERROR: ' + (e && e.stack || e)); process.exitCode = 1; });
