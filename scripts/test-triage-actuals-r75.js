#!/usr/bin/env node
// TRIAGE-ACTUALS PROOF (journey-establishment r75, 2026-11-01).
// r75's tents arm measured a narration honesty gap: answering rel:triage
// asks 800 kcal, but _removePantryKcal takes WHOLE pantry units, so on a
// 500-kcal-piece pantry the actual spend is 1,000 kcal — while the tents
// narration says "(-800 kcal, said aloud and spent.)". The whole-units
// doctrine (hierarchy.js _removePantryKcal, break-it food r3) says
// "over-removal is honest, callers report actuals" — the tents caller
// reports the nominal cost, not the actual paid amount.
// This test FAILS pre-fix (narration says 800 / 1,200 while the pantry
// drops 1,000 / 1,500) and PASSES post-fix (narration names the actual).
// Usage: node scripts/test-triage-actuals-r75.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return -1; }
}
function setPantry(Game, pieceKcal, units) {
  const v = Game.state.village || {};
  v.pantry = [{ kcalEach: pieceKcal, units, spoilDay: 99999, id: 'test-bins' }];
}
function rosterOthers(Game, n) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => String(id) !== String(Game.villagerId)).slice(0, n);
}
function raiseRelief(Game) {
  if (typeof Game.raiseRelief === 'function') { Game.raiseRelief('sickness', {}); return; }
  const st = Game.state || {};
  st.relief = { kind: 'sickness', sinceDay: (Game.state.scholar || {}).day || 0, partsLeft: 12, used: {}, speaker: 'Test Speaker' };
}

let failures = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail !== undefined ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

async function main() {
  const { Game } = await loadGame({ seed: 369, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  // Capture say lines (same wrap shape as test-survival-nets.js).
  const said = [];
  const realSay = Game.say;
  Game.say = function (t) { said.push(String(t)); try { return realSay && realSay.call(this, t); } catch (e) {} };

  // Case 1: plain triage, 500-kcal pieces, 800 asked -> 1,000 actual.
  {
    const [a, b] = rosterOthers(Game, 2);
    const v = Game.state.village || {};
    v.sick = {};
    v.sick[a] = { name: 'gut rot', daysLeft: 4, severity: 1 };
    v.sick[b] = { name: 'fever', daysLeft: 5, severity: 1 };
    setPantry(Game, 500, 10);
    raiseRelief(Game);
    said.length = 0;
    const before = pantryKcal(Game);
    const res = Game.answerRelief('triage');
    const after = pantryKcal(Game);
    const spent = before - after;
    const line = said.find(s => s.includes('Triage tents go up'));
    check('plain triage fires', res === 'triage', 'res=' + res);
    check('plain triage spends whole units (1000)', spent === 1000, before + '->' + after);
    check('plain narration names actual spent (1,000)', !!line && line.includes('1,000'), line ? line.slice(0, 160) : 'NO TENTS LINE');
    check('plain narration does NOT claim nominal 800', !!line && !line.includes('800'), line ? line.slice(0, 160) : 'NO TENTS LINE');
  }

  // Case 2: triage-worst, 500-kcal pieces, 1200 asked -> 1,500 actual.
  {
    const [a, b] = rosterOthers(Game, 2);
    const v = Game.state.village || {};
    v.sick = {};
    v.sick[a] = { name: 'gut rot', daysLeft: 6, severity: 1 };
    v.sick[b] = { name: 'wound fever', daysLeft: 6, severity: 2 };
    setPantry(Game, 500, 10);
    try { Game.state.relief = null; } catch (e) {}
    raiseRelief(Game);
    said.length = 0;
    const before = pantryKcal(Game);
    const res = Game.answerRelief('triage-worst');
    const after = pantryKcal(Game);
    const spent = before - after;
    const line = said.find(s => s.includes('Triage tents go up'));
    check('worst triage fires', res === 'triage-worst', 'res=' + res);
    check('worst triage spends whole units (1500)', spent === 1500, before + '->' + after);
    check('worst narration names actual spent (1,500)', !!line && line.includes('1,500'), line ? line.slice(0, 160) : 'NO TENTS LINE');
    check('worst narration does NOT claim nominal 1,200', !!line && !line.includes('1,200'), line ? line.slice(0, 160) : 'NO TENTS LINE');
  }

  Game.say = realSay;
  console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
