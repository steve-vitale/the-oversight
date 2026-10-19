#!/usr/bin/env node
// test-arenaact-wiring-20261019.js — PROOF for journey-endgame r23.
//
// BLANK: ledger.arenaAct (broadcast consequences: village trust, audience,
// other-village opinion, leadership-vector ledger) was designed as the
// televised-deed channel (hierarchy.js:310) but had ZERO callers repo-wide.
// Contest choices carry `notability` ('sacrifice', 'gallant', 'principled',
// 'defiant'...) and contests are fully televised (Steve 2026-10-04) —
// heroic/terrible acts on camera were never priced. The table's branch axis
// reads these ledger counts, so beloved-light ("genuine love") was
// unreachable by play: `protected` stayed 0 on every competent run.
//
// FIX: contests.js contestChoose now calls arenaAct for the four
// notabilities whose fiction matches a priced kind:
//   sacrifice -> sacrifice (protected+3) | gallant -> heroics (protected+2)
//   principled -> mercy (protected+1)    | defiant -> defiance (defiance+1)
// Unmapped notabilities ('showmanship', 'schemer', ...) keep old behavior.
//
// RED: on the old code the Volunteer choice records notability but fires no
// arenaAct (no arenaRecord act, protected unchanged).
// GREEN: the act is recorded, the vector moves, trust/audience/opinion move.
//
// Harness: shared kit (scripts/godpath/lib.js). No repo writes.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('test-arenaact-wiring-20261019');

async function main() {
  const Game = await K.load({ seed: 20261019 });
  K.newRun(Game);
  const vid = Game.villagerId;

  const ledgerN = (k) => { try { return (Game.ledger() || {})[k] | 0; } catch (e) { return 0; }; };
  const trustOf = () => { try { return (Game.state.village.trust || {})[vid] || 0; } catch (e) { return 0; }; };
  const acts = () => {
    try {
      const pg = Game.progState();
      const rec = (pg.arenaRecord || {})['the arena'] || { acts: [] };
      return rec.acts || [];
    } catch (e) { return []; }
  };
  const startPrice = () => {
    const phases = Game._contestPrice({ id: 'price', name: 'The Price', desc: 't', risk: 'extreme' });
    Game.state.activeContest = {
      kind: 'contest', contestId: 'price', showName: 'The Price',
      participant: 'player', phase: 'intro', phaseIdx: 0, phases, variant: null, wounds: 0,
    };
  };

  T.section('sacrifice notability -> arenaAct(sacrifice)');
  startPrice();
  const prot0 = ledgerN('protected'), trust0 = trustOf(), acts0 = acts().length;
  Game.contestChoose(0); // 'Volunteer' — notability 'sacrifice'
  const newActs = acts().slice(acts0);
  T.ok('arenaRecord gained exactly one act', newActs.length === 1, `acts=${newActs.length}`);
  T.ok('act kind is sacrifice', newActs.length === 1 && newActs[0].kind === 'sacrifice',
    newActs.length ? `kind=${newActs[0].kind}` : 'no act');
  T.ok('ledger protected +3', ledgerN('protected') === prot0 + 3,
    `protected ${prot0} -> ${ledgerN('protected')}`);
  T.ok('village trust +15', trustOf() === trust0 + 15, `trust ${trust0} -> ${trustOf()}`);

  T.section('defiant notability -> arenaAct(defiance)');
  startPrice();
  Game.state.activeContest.phaseIdx = 2; // dusk phase
  const def0 = ledgerN('defiance'), acts1 = acts().length;
  Game.contestChoose(1); // 'Refuse, if chosen' — notability 'defiant'
  const newActs2 = acts().slice(acts1);
  T.ok('arenaRecord gained exactly one act', newActs2.length === 1, `acts=${newActs2.length}`);
  T.ok('act kind is defiance', newActs2.length === 1 && newActs2[0].kind === 'defiance',
    newActs2.length ? `kind=${newActs2[0].kind}` : 'no act');
  T.ok('ledger defiance +1', ledgerN('defiance') === def0 + 1,
    `defiance ${def0} -> ${ledgerN('defiance')}`);

  T.section('unmapped notability -> no arenaAct (old behavior preserved)');
  startPrice();
  const acts2 = acts().length, prot2 = ledgerN('protected');
  Game.contestChoose(1); // 'Stay silent' — no notability
  T.ok('no act recorded', acts().length === acts2, `acts ${acts2} -> ${acts().length}`);
  T.ok('protected unchanged', ledgerN('protected') === prot2);

  T.done();
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
