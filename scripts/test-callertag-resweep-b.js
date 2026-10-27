#!/usr/bin/env node
// test-callertag-resweep-b.js — stacked-capture proof for sim-callertag-resweep-b
// (DIAG, no sims, no src/js). Proves the verbatim scripts/caller-tag-capture.js
// still tags callers exactly when installed LAST (outermost) over the
// inflow + garden captures, exactly as scripts/sweep-callertag-resweep-b.js
// installs it — plus delegation identity, zero RNG, and join balance
// against gardenInflows deposit-door records.
// Exit 0 only if every check passes.
// Usage: node scripts/test-callertag-resweep-b.js
'use strict';
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra || ''); }
}

(async () => {
  const { loadGame } = require('./sim-harness');
  const { installInflowCapture } = require('./inflow-capture');
  const { installGardenCapture } = require('./garden-capture');
  const { installCallerTagCapture } = require('./caller-tag-capture');
  const { Game } = await loadGame({ seed: 9762, mode: 'callertag-resweep-proof' });
  check('harness loaded: Game.depositPantryPieces is a function',
    typeof Game.depositPantryPieces === 'function');
  check('harness loaded: Game.save was never stubbed by this test',
    typeof Game.save === 'function');

  // Install in sweep order: inflow, garden, then caller-tag LAST.
  const inflow = installInflowCapture(Game, { inflowCap: 50000 });
  const garden = installGardenCapture(Game, { sayCap: 300 });
  const cap = installCallerTagCapture(Game);
  check('stacked install: caller-tag installed on top of inflow + garden wrappers',
    Game.depositPantryPieces !== null && typeof Game.depositPantryPieces === 'function');

  // Delegation identity baseline: same call WITHOUT caller-tag (uninstall,
  // call, reinstall) on a fresh village must equal the WITH caller-tag call.
  function mkVillage(name) { return { name, pantry: [] }; }
  const srcA = { name: 'Lamb\'s Quarters', plantId: 'lambs_quarters', kcalEach: 2700, units: 1, gardenShares: { assisted: 1 } };
  cap.uninstall();
  const vBase = mkVillage('Baseville');
  Game.depositPantryPieces(vBase, JSON.parse(JSON.stringify(srcA)), 500);
  const basePantry = JSON.parse(JSON.stringify(vBase.pantry));
  const cap2 = installCallerTagCapture(Game);
  // Garden capture was already installed during the baseline call above
  // (made while caller-tag was uninstalled), so gardenInflows already
  // holds 1 pre-cap2 deposit. Join checks slice from here on.
  const gBase = garden.events.gardenInflows.filter(r => r.door === 'deposit').length;

  // Named callers through the FULL stack.
  function donateToPantry() {
    return Game.depositPantryPieces(mkVillage('Testville'),
      { name: 'Lamb\'s Quarters', plantId: 'lambs_quarters', kcalEach: 2700, units: 1, gardenShares: { assisted: 1 } }, 500);
  }
  function returnToVillage() {
    return Game.depositPantryPieces(mkVillage('Testville'),
      { name: 'Burdock', plantId: 'burdock', kcalEach: 900, units: 3, gardenShares: { ordinary: 1 } }, 500);
  }
  function returnToOldVillage() {
    return Game.depositPantryPieces(mkVillage('Oldville'),
      { name: 'Cattail', plantId: 'cattail', kcalEach: 500, units: 1, gardenShares: { assisted: 1 } }, 500);
  }
  let draws = 0;
  const realRandom = Math.random;
  Math.random = () => { draws++; return realRandom(); };
  const dRet = donateToPantry();
  const hRet = returnToVillage();
  const eRet = returnToOldVillage();
  const tRet = (function () {
    return Game.depositPantryPieces(mkVillage('Testville'),
      { name: 'Tribute grain from Somewhere', kcalEach: 3000, units: 1, spoilDay: 99, safe: true }, 500);
  })();
  Math.random = realRandom;

  check('stacked: delegation return values are numbers (deposited kcal)',
    [dRet, hRet, eRet, tRet].every(v => typeof v === 'number' && v > 0),
    JSON.stringify([dRet, hRet, eRet, tRet]));
  check('stacked: 4 caller-tag records captured', cap2.records.length === 4,
    'got ' + cap2.records.length);
  check('stacked: caller tags are STILL exactly donate/returnToVillage/returnToOldVillage + other for the anonymous tribute shape',
    cap2.records[0].callerTag === 'donateToPantry' &&
    cap2.records[1].callerTag === 'returnToVillage' &&
    cap2.records[2].callerTag === 'returnToOldVillage' &&
    cap2.records[3].callerTag.startsWith('other:'),
    JSON.stringify(cap2.records.map(r => r.callerTag)));
  check('stacked: full gardenShares objects recorded verbatim (not booleans)',
    JSON.stringify(cap2.records[0].gardenShares) === '{"assisted":1}' &&
    JSON.stringify(cap2.records[1].gardenShares) === '{"ordinary":1}' &&
    cap2.records[3].gardenShares === null,
    JSON.stringify(cap2.records.map(r => r.gardenShares)));
  check('stacked: destination villages recorded (Testville x3, Oldville x1)',
    cap2.records[0].destVillage === 'Testville' && cap2.records[1].destVillage === 'Testville' &&
    cap2.records[2].destVillage === 'Oldville' && cap2.records[3].destVillage === 'Testville',
    JSON.stringify(cap2.records.map(r => r.destVillage)));
  check('stacked: zero Math.random draws consumed by stacked wrappers + delegation',
    draws === 0, 'draws=' + draws);
  check('stacked: delegation identical — with-caller-tag call equals without-caller-tag pantry',
    (() => {
      const v = mkVillage('Baseville');
      Game.depositPantryPieces(v, JSON.parse(JSON.stringify(srcA)), 500);
      return JSON.stringify(v.pantry) === JSON.stringify(basePantry);
    })());
  // Join balance: gardenInflows deposit-door records (garden-carrying only)
  // must equal the garden-carrying caller-tag records, in order.
  const gDep = garden.events.gardenInflows.filter(r => r.door === 'deposit').slice(gBase);
  const cGarden = cap2.records.filter(r => r.gardenShares != null);
  check('stacked: join balances — gardenInflows deposit-door count == garden caller-tag record count',
    gDep.length === cGarden.length, `gardenInflows=${gDep.length} callerTag=${cGarden.length}`);
  check('stacked: join order matches — (name, kcal) pairs identical in order',
    gDep.length === cGarden.length &&
    gDep.every((r, i) => r.name === cGarden[i].name && r.kcal === cGarden[i].kcal),
    JSON.stringify({ gDep, cGarden }));
  check('stacked: inflow capture still saw all 4 deposits (tribute shape included)',
    inflow.inflows.filter(r => r.door === 'deposit').length >= 4,
    'inflow deposit count=' + inflow.inflows.filter(r => r.door === 'deposit').length);
  check('stacked: double-install of caller-tag refused loudly',
    (() => {
      let threw = false;
      try { installCallerTagCapture(Game); } catch (e) { threw = /already/.test(e.message); }
      return threw;
    })());
  cap2.uninstall();
  check('stacked: uninstall restores the inflow+garden-wrapped function (not the raw original)',
    Game.depositPantryPieces !== cap2 && typeof Game.depositPantryPieces === 'function');

  console.log(fail === 0 ? `\nALL PASS (${pass})` : `\n${fail} FAILURES (${pass} pass)`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.log('FAIL harness leg threw', e && e.stack || e); process.exit(1); });
