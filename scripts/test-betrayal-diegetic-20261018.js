#!/usr/bin/env node
// test-betrayal-diegetic-20261018.js -- journey-social r25 proof.
// Betrayal-menu outcomes are DIEGETIC ACTS, not flavor: the fixed outcome
// labels ('Said. Now it's theirs to carry.') fire once per case, so the
// run-ledger anti-parrot block false-positived them as parroting whenever
// two cases resolved inside the 48-entry window — transcript-caught in every
// pilot as tellside/askheard/bribe dry streaks ("...Sorry, lost my train of
// thought." as the answer to telling your side).
// Fix: betrayal.js finish() passes { diegeticAct: true } (same exemption the
// r24 inviteBeat gave the accept outcome); sayLine honors it via the
// diegeticAct alias. Game logic already guards true repeats (toldSide).
// RED verified pre-fix via patch round-trip (no stash).
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra ? '-- ' + extra : ''); }
}
const isDefl = (Game, t) => { try { return !!Game.convoIsDeflectionLine(t); } catch (e) { return false; } };
const lastNpc = (Game, vid) => {
  const tr = (Game.convoGet(vid).transcript || []).filter(e => e.who !== 'you');
  return tr.length ? String(tr[tr.length - 1].text || '') : '';
};

(async () => {
  const { Game } = await loadGame({ seed: 7771, mode: 'test-betrayal-diegetic' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const me = Game.villagerId;
  const vids = (Game.state.village.roster || []).filter(id => id !== me);
  const [v1, v2, v3] = vids;
  const bs = Game.betrayalState();
  bs.cases.push({ id: 'tcase1', playerRole: 'accused', status: 'open', target: me, belief: {} });
  bs.cases.push({ id: 'tcase2', playerRole: 'accused', status: 'open', target: me, belief: {} });

  // T1: first tellside outcome speaks honestly.
  Game.startConvo(v1);
  Game.betrayalTurn(v1, 'betrayal:tellside:tcase1');
  const L1 = lastNpc(Game, v1);
  ok('T1 first tellside outcome honest', /Said\. Now it.s theirs to carry/.test(L1) && !isDefl(Game, L1), 'got: ' + L1.slice(0, 60));
  Game.endConvo(v1, 'left');

  // T2: second tellside (different case, different villager) is NOT
  // run-ledger-blocked into a deflection — the diegetic-act exemption.
  Game.startConvo(v2);
  Game.betrayalTurn(v2, 'betrayal:tellside:tcase2');
  const L2 = lastNpc(Game, v2);
  ok('T2 second tellside outcome honest, not deflection', /Said\. Now it.s theirs to carry/.test(L2) && !isDefl(Game, L2), 'got: ' + L2.slice(0, 60));
  Game.endConvo(v2, 'left');

  // T3 control: a non-diegetic fixed line in the run ledger still blocks.
  Game.startConvo(v3);
  const fixed = '"The river took the south bridge in the night."';
  Game.sayLine(v3, fixed, {});
  Game.endConvo(v3, 'left');
  Game.startConvo(v1);
  const out = Game.sayLine(v1, fixed, {});
  ok('T3 control: ordinary fixed line still run-blocks', !!out && isDefl(Game, out), 'got: ' + String(out).slice(0, 60));
  Game.endConvo(v1, 'left');

  console.log(`\n${pass}/${pass + fail} ${fail ? 'RED' : 'GREEN'}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
