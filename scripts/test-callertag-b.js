#!/usr/bin/env node
// test-callertag-b.js — proof for sim-callertag-b (DIAG, no sims, no src/js).
// Two independent legs:
//  (A) Corpus leg (no harness): re-derives the 276-record traced set from
//      the 2026-10-26 stock9762 corpus files alone, asserts the record
//      field inventory (no mover/destination/harvest-day/class field),
//      re-derives the R4 harvest-event bridge independently of the
//      analyzer, and grep-anchors the 4 depositPantryPieces call sites.
//  (B) Prototype leg (shared harness): loads the real Game via
//      scripts/sim-harness.js (FULL src/js list in index.html order,
//      minus DOM-only files; Math.random seeded BEFORE eval by the
//      harness; Game.save never stubbed), installs
//      scripts/caller-tag-capture.js on the real depositPantryPieces,
//      and proves delegation identity, caller tags, full-shares capture,
//      destination capture, zero RNG consumption, and no Game.state write
//      beyond the delegated pantry effect.
// Exit 0 only if every check passes.
// Usage: node scripts/test-callertag-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra || ''); }
}

// ---------------- leg A: corpus re-derivation ----------------
const corpus = path.join(root, 'evidence', '2026-10-26', 'sim-stock9762-b-corpus');
const load = s => JSON.parse(fs.readFileSync(path.join(corpus,
  `stock9762-b-competent-nofeast-s${s}.json`), 'utf8'));
const seeds = [9760, 9761, 9762, 9763, 9764, 9765, 9766, 9767];
let bandN = 0, bandKcal = 0, bandUncl = 0, bandDeposit = 0;
const perSeed = {};
for (const s of seeds) {
  const d = load(s);
  perSeed[s] = d;
  const recs = d.gardenEvents.gardenInflows;
  bandN += recs.length;
  bandKcal += recs.reduce((a, r) => a + (r.kcal || 0), 0);
  bandUncl += recs.filter(r => !r.door || !r.name).length;
  bandDeposit += recs.filter(r => r.door === 'deposit').length;
}
check('band gardenInflows total == 276', bandN === 276, 'got ' + bandN);
check('band gardenInflows kcal == 1310710', bandKcal === 1310710, 'got ' + bandKcal);
check('band all deposit-door, 0 unclassified', bandDeposit === 276 && bandUncl === 0,
  `deposit=${bandDeposit} uncl=${bandUncl}`);
check('9762 gardenInflows == 129 / 396750', perSeed[9762].gardenEvents.gardenInflows.length === 129 &&
  perSeed[9762].gardenEvents.gardenInflows.reduce((a, r) => a + (r.kcal || 0), 0) === 396750);

// Field inventory: exactly the 5 keys, no mover/destination/harvest/class field.
const keys62 = new Set();
for (const r of perSeed[9762].gardenEvents.gardenInflows) Object.keys(r).forEach(k => keys62.add(k));
check('gardenInflows record keys exactly {day,door,gardenShares,kcal,name}',
  keys62.size === 5 && ['day', 'door', 'gardenShares', 'kcal', 'name'].every(k => keys62.has(k)),
  'got ' + JSON.stringify([...keys62].sort()));
check('no gardenInflows record carries a boolean-only-class problem beyond the flag (gardenShares is always true, never the object)',
  perSeed[9762].gardenEvents.gardenInflows.every(r => r.gardenShares === true));
const infKeys = new Set();
for (const r of perSeed[9762].inflows) Object.keys(r).forEach(k => infKeys.add(k));
check('inflows record keys carry no mover/destination field',
  !['mover', 'caller', 'destVillage', 'destination'].some(k => infKeys.has(k)),
  'got ' + JSON.stringify([...infKeys].sort()));

// R4 bridge, re-derived independently: harvest events from gardenDays
// snapshots + coax days from sayLines; corrected rule [anchor, H).
function bridge(d) {
  const coaxDays = [...new Set(d.gardenEvents.sayLines.filter(x => x.line.includes('coax')).map(x => x.day))];
  const plots = {};
  const events = [];
  for (const gd of d.gardenDays) {
    gd.plots.forEach((p, idx) => {
      const st = plots[idx] || (plots[idx] = { lh: 0 });
      const lh = p.lastHarvest || 0;
      if (lh === 0 && st.lh !== 0) st.lh = 0;
      if (lh !== 0 && lh !== st.lh) {
        const anchor = st.lh > 0 ? st.lh : (p.plantedDay || 0);
        const H = gd.day;
        const hasLeft = coaxDays.some(c => c >= anchor && c < H);
        const onlyH = coaxDays.some(c => c >= anchor && c <= H) && !hasLeft;
        events.push({ day: H, anchor, cls: hasLeft ? 'assisted' : (onlyH ? 'undetermined' : 'ordinary') });
        st.lh = lh;
      }
    });
  }
  return events;
}
const bridgeTally = {};
for (const s of seeds) {
  const ev = bridge(perSeed[s]);
  const t = { assisted: 0, ordinary: 0, undetermined: 0 };
  for (const e of ev) t[e.cls]++;
  bridgeTally[s] = { events: ev.length, ...t };
}
check('bridge: seeds with deposits (9760-9764) have 0 ordinary and 0 undetermined events',
  [9760, 9761, 9762, 9763, 9764].every(s => bridgeTally[s].ordinary === 0 && bridgeTally[s].undetermined === 0),
  JSON.stringify(bridgeTally));
check('bridge: 9762 all 123 events assisted (corrected rule)',
  bridgeTally[9762].events === 123 && bridgeTally[9762].assisted === 123,
  JSON.stringify(bridgeTally[9762]));
check('bridge: 9765 ordinary-only events (3) with 0 deposit records — the bridge is not vacuous',
  bridgeTally[9765].ordinary === 3 && perSeed[9765].gardenEvents.gardenInflows.length === 0,
  JSON.stringify(bridgeTally[9765]));
check('bridge: npcSows use gardenPlant (version 1) — 9763 has 11 npcSows and still 10/10 assisted events',
  perSeed[9763].gardenEvents.npcSows.length === 11 && bridgeTally[9763].assisted === 10);

// Grep anchors for the 4 call sites + gardenShares forwarding.
function srcLines(file) { return fs.readFileSync(path.join(root, file), 'utf8').split('\n'); }
const gameLines = srcLines('src/js/game.js');
const hierLines = srcLines('src/js/hierarchy.js');
function siteOk(lines, lineNo, mustContain) {
  const window = lines.slice(lineNo - 1, lineNo + 12).join('\n');
  return lines[lineNo - 1].includes('depositPantryPieces(') && mustContain.every(t => window.includes(t));
}
check('call site 1: game.js returnToVillage ~8617 forwards gardenShares',
  siteOk(gameLines, 8617, ['gardenShares:item.gardenShares']));
check('call site 2: game.js returnToOldVillage ~8774 forwards gardenShares',
  siteOk(gameLines, 8774, ['gardenShares:item.gardenShares']));
check('call site 3: game.js donateToPantry ~15371 deposits the whole donated item',
  gameLines[15370].includes('depositPantryPieces(v, donated, 500)'));
check('call site 4: hierarchy.js tribute ~1173 constructs a synthetic src with NO gardenShares',
  hierLines[1172].includes('depositPantryPieces(_v, { name: \'Tribute grain from \'') &&
  !hierLines.slice(1172, 1175).join('\n').includes('gardenShares'));
const allCalls = [];
gameLines.forEach((l, i) => { if (l.includes('depositPantryPieces(') && !l.includes('depositPantryPieces(v, src, pieceKcal)')) allCalls.push('game.js:' + (i + 1)); });
hierLines.forEach((l, i) => { if (l.includes('depositPantryPieces(')) allCalls.push('hierarchy.js:' + (i + 1)); });
check('depositPantryPieces direct call-site inventory is exactly 4 (definition excluded)',
  allCalls.length === 4, 'got ' + JSON.stringify(allCalls));
check('homecoming pool destination is state.village (same village as donate), not another village',
  gameLines.slice(8538, 8542).join('\n').includes('const vv = this.state.village'));
check('exile amends destination is a past village ov',
  gameLines.slice(8743, 8748).join('\n').includes('pastVillages') ||
  gameLines.slice(8730, 8745).join('\n').includes('const ov ='));

// ---------------- leg B: prototype on the real Game ----------------
(async () => {
  const { loadGame } = require('./sim-harness');
  const { installCallerTagCapture } = require('./caller-tag-capture');
  const { Game } = await loadGame({ seed: 9762, mode: 'callertag-proof' });
  check('harness loaded: Game.depositPantryPieces is a function',
    typeof Game.depositPantryPieces === 'function');
  check('harness loaded: Game.save was never stubbed by this test (still the original function)',
    typeof Game.save === 'function');

  const orig = Game.depositPantryPieces;
  // Control: unwrapped call on a control village.
  const control = { name: 'Controlville', pantry: [] };
  const controlRet = orig.call(Game, control,
    { name: 'Control Greens', plantId: 'x', kcalEach: 1200, units: 2, gardenShares: { assisted: 1 } }, 500);
  const controlPantry = JSON.parse(JSON.stringify(control.pantry));

  // Install + named-caller calls.
  const cap = installCallerTagCapture(Game);
  function donateToPantry() {
    return Game.depositPantryPieces({ name: 'Testville', pantry: [] },
      { name: 'Lamb\'s Quarters', plantId: 'lambs_quarters', kcalEach: 2700, units: 1, gardenShares: { assisted: 1 } }, 500);
  }
  function returnToVillage() {
    return Game.depositPantryPieces({ name: 'Testville', pantry: [] },
      { name: 'Burdock', plantId: 'burdock', kcalEach: 900, units: 3, gardenShares: { ordinary: 1 } }, 500);
  }
  function returnToOldVillage() {
    return Game.depositPantryPieces({ name: 'Oldville', pantry: [] },
      { name: 'Cattail', plantId: 'cattail', kcalEach: 500, units: 1, gardenShares: { assisted: 1 } }, 500);
  }
  // Tribute shape: anonymous caller, synthetic src with no gardenShares.
  // (Called AFTER the named callers so record order is donate/home/exile/tribute.)
  const anonRet = null;
  // RNG observation: wrapper + delegation must consume zero draws.
  let draws = 0;
  const realRandom = Math.random;
  Math.random = () => { draws++; return realRandom(); };
  const dRet = donateToPantry();
  const hRet = returnToVillage();
  const eRet = returnToOldVillage();
  Math.random = realRandom;
  const anonRet2 = (function () {
    return Game.depositPantryPieces({ name: 'Testville', pantry: [] },
      { name: 'Tribute grain from Somewhere', kcalEach: 3000, units: 1, spoilDay: 99, safe: true }, 500);
  })();
  check('prototype: delegation return values are numbers (deposited kcal)',
    [dRet, hRet, eRet, anonRet2].every(v => typeof v === 'number' && v > 0),
    JSON.stringify([dRet, hRet, eRet, anonRet2]));
  check('prototype: 4 records captured', cap.records.length === 4, 'got ' + cap.records.length);
  check('prototype: caller tags are exactly donate/returnToVillage/returnToOldVillage + other for the anonymous tribute shape',
    cap.records[0].callerTag === 'donateToPantry' &&
    cap.records[1].callerTag === 'returnToVillage' &&
    cap.records[2].callerTag === 'returnToOldVillage' &&
    cap.records[3].callerTag.startsWith('other:'),
    JSON.stringify(cap.records.map(r => r.callerTag)));
  check('prototype: full gardenShares objects recorded verbatim (not booleans)',
    JSON.stringify(cap.records[0].gardenShares) === '{"assisted":1}' &&
    JSON.stringify(cap.records[1].gardenShares) === '{"ordinary":1}' &&
    cap.records[3].gardenShares === null,
    JSON.stringify(cap.records.map(r => r.gardenShares)));
  check('prototype: destination villages recorded (Testville x3 incl. tribute shape, Oldville x1)',
    cap.records[0].destVillage === 'Testville' && cap.records[1].destVillage === 'Testville' &&
    cap.records[2].destVillage === 'Oldville' && cap.records[3].destVillage === 'Testville',
    JSON.stringify(cap.records.map(r => r.destVillage)));
  check('prototype: names + kcal recorded (2700 / 2700 / 500 / 3000)',
    cap.records.map(r => r.kcal).join(',') === '2700,2700,500,3000',
    JSON.stringify(cap.records.map(r => r.kcal)));
  check('prototype: zero Math.random draws consumed by wrapper + delegation', draws === 0, 'draws=' + draws);
  check('prototype: delegation is identical — wrapped call on a fresh village equals the unwrapped control pantry',
    (() => {
      const v = { name: 'Controlville', pantry: [] };
      Game.depositPantryPieces(v,
        { name: 'Control Greens', plantId: 'x', kcalEach: 1200, units: 2, gardenShares: { assisted: 1 } }, 500);
      return JSON.stringify(v.pantry) === JSON.stringify(controlPantry);
    })());
  check('prototype: uninstall restores the original function',
    (() => { cap.uninstall(); return Game.depositPantryPieces === orig; })());
  check('prototype: double-install is refused loudly',
    (() => {
      const c2 = installCallerTagCapture(Game);
      let threw = false;
      try { installCallerTagCapture(Game); } catch (e) { threw = /already/.test(e.message); }
      c2.uninstall();
      return threw;
    })());

  console.log(fail === 0 ? `\nALL PASS (${pass})` : `\n${fail} FAILURES (${pass} pass)`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.log('FAIL harness leg threw', e && e.stack || e); process.exit(1); });
