// scripts/test-w3wire-20261017.js — sim-w3wire LANE-BLOCK PROOF (diagnostic, not a feature test)
//
// Arm brief: extend the monster-counter ledger convention to wave-3+ by adding
// `counter` fields to src/data/monsters.json (+ waveLedger.js + fieldFights.js),
// W3WIRE=1 env-gated, default OFF. Lane: game.js is loop B's file — do not touch.
//
// VERDICT PROVEN HERE: STOP. The layer cannot be default-off-clean without
// game.js edits, AND the landed counterwire arm (evidence/2026-10-16/sim-counterwire.md)
// DELIBERATELY chose NOT to put `counter` fields on w3+ defs (scoring decision:
// reward = fight-lethality reduction, not ledger points; w3+ ledger points are
// dead currency). Adding def.counter would silently reverse that decision AND
// change control-run behavior through four game.js code paths that read
// mdef.counter unconditionally.
//
// What this script proves (deterministic, seeded, in-memory injection only —
// ZERO repo file changes):
//   A. Current state: 0/32 wave-3+ defs carry `counter`; villagerTrickDefs()
//      covers 27/27 spec-named w3+ ids (the landed representation).
//   B. With ONE def.counter injected in-memory (W3WIRE unset — the "control"
//      condition), four behavioral divergences appear with no env flag to stop
//      them. Each names the exact game.js block that would need a W3WIRE gate.
//
// Exit 0 = block proven (all assertions hold). Exit 1 = an assumption broke
// (re-examine before any STOP verdict is trusted).
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { loadGame, setupGame } = require(path.join(ROOT, 'scripts', 'sim-harness.js'));

const SPEC_IDS = ['redactor','gavel','focus_group','terms_of_service','callback','ad_break',
  'spool','chorus_line','buffering',
  'congregation','strike','influencer','audit','reunion','suburb','eulogy','algorithm','eater','herald',
  'cancellation','editor','rerun','spoiler','timeslot','nielsen','finale','finale_crew','finale_opening','network_note'];

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? '  PASS ' : '  FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
}

async function main() {
  const { Game } = await loadGame({ seed: 20261017, mode: 'w3wire-block', fullTelemetry: false });
  await setupGame(Game);
  Game.state.villageCounterObs = Game.state.villageCounterObs || {};
  Game.state.monsterCounters = Game.state.monsterCounters || {};
  Game.state.villagerTricks = Game.state.villagerTricks || {};
  Game.state.villageSlain = Game.state.villageSlain || {};

  const defs = Game.data.monsters || [];
  const w3p = defs.filter(d => (d.wave | 0) >= 3);

  console.log('== A. CURRENT STATE (control condition: W3WIRE unset) ==');
  check('A1: 0 w3+ defs carry a `counter` field', w3p.filter(d => d.counter).length === 0,
    `${w3p.length} w3+ defs, ${w3p.filter(d => d.counter).length} with counter`);
  const vtd = Game.villagerTrickDefs();
  const missing = SPEC_IDS.filter(id => !vtd[id]);
  check('A2: villagerTrickDefs covers 27/27 spec-named w3+ ids', missing.length === 0,
    missing.length ? 'missing: ' + missing.join(',') : 'landed representation intact');

  // Synthetic TB context so checkMonsterCounter reaches the def lookup.
  Game.tbfight = { over: false, fighters: [{ key: 'p', alive: true, kind: 'player' }] };
  check('A3: checkMonsterCounter(redactor, wait) is false today (no ctr)',
    Game.checkMonsterCounter('redactor', { type: 'wait' }) === false);
  Game.state.villageSlain.redactor = 1;
  check('A4: counterTeachable() does not admit w3+ species today',
    Game.counterTeachable() !== 'redactor', 'teachable=' + Game.counterTeachable());

  console.log('== B. IN-MEMORY INJECTION (one def.counter, W3WIRE still unset, zero repo change) ==');
  const rdef = defs.find(d => d.id === 'redactor');
  rdef.counter = { kind: 'wait', trick: 'Go quiet — starve the redaction', reveal: 'INJECTED-BY-TEST' };

  // B1: _trickObservation reroutes villagerTricks -> monsterCounters
  Game.state.villageCounterObs.redactor = 1; // one credit already; this call is #2
  const b1 = Game._trickObservation('v1', 'redactor', false);
  check('B1: _trickObservation routes to discoverMonsterCounter (not villagerTricks)',
    b1 === true && Game.state.monsterCounters.redactor === true && !Game.state.villagerTricks.redactor,
    'monsterCounters.redactor=' + Game.state.monsterCounters.redactor +
    ' villagerTricks.redactor=' + Game.state.villagerTricks.redactor);

  // B2: counterTeachable admits the w3+ species
  delete Game.state.monsterCounters.redactor;
  check('B2: counterTeachable() admits redactor once def.counter exists',
    Game.counterTeachable() === 'redactor', 'teachable=' + Game.counterTeachable());

  // B3: ledger convention + scoring now fire for wave 3
  Game.state.monsterCounters.redactor = true;
  check('B3a: monsterCounterKnown(redactor) true via def.counter',
    Game.monsterCounterKnown('redactor') === true);
  Game.ledgerState();
  const add = Game.scoreLedgerKill('redactor');
  check('B3b: scoreLedgerKill(redactor) scores the counter bonus (2 pts)',
    add === 2, 'add=' + add);

  // B4: perform channel opens for w3+
  delete Game.state.monsterCounters.redactor;
  const b4 = Game.checkMonsterCounter('redactor', { type: 'wait' });
  check('B4: checkMonsterCounter(redactor, wait) discovers via perform channel',
    b4 === true && Game.state.monsterCounters.redactor === true);

  console.log('== BLOCKS (game.js — loop B\'s file, do not touch) ==');
  console.log('  1. game.js discoverMonsterCounter (~l30534): `if (!mdef || !mdef.counter) return false` — the sole monsterCounters writer; no W3WIRE gate possible from waveLedger.js/fieldFights.js.');
  console.log('  2. game.js _trickObservation (~l30749): `if (mdef.counter) return this.discoverMonsterCounter(...)` — steals the w3+ villagerTricks channel the landed counterwire arm built.');
  console.log('  3. game.js counterTeachable (~l30646): `if (!mdef.counter || known[mdef.id]) continue` — w3+ becomes beasttricks-teachable at Haven.');
  console.log('  4. game.js checkMonsterCounter (~l30564) + 7 TB call sites (l31858, l31874, l32569, l32963, l33037, l36221, l36399) — perform-discovery opens; genuinely-new w3+ kinds need new switch cases here.');
  console.log('  5. (consequence) game.js noteNodeWitnessKill (~l30836): `if (mdef.counter) return this.discoverMonsterCounter(mid, \'node-witnessed\')` — witness path reroutes too.');

  // Restore the injected def so the process leaves no in-memory lie for later phases.
  delete rdef.counter;

  console.log(failures === 0 ? 'VERDICT: LANE-BLOCKED — STOP, layer deleted, zero src changes.' : 'VERDICT: ASSUMPTIONS BROKEN — do not trust the STOP; re-examine.');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('HARNESS FAILURE:', e && e.message); process.exit(2); });
