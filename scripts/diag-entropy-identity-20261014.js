'use strict';
// diag-entropy-identity-20261014.js — is Game (and its wrapped methods) fresh
// or reused across the two loadGame evals in one process? A reused Game
// keeps run-1 closures (seeded-RNG stream at run-1's position) alive in run 2.
process.env.FEASTSCALE_R13 = '1';
const harness = require('./sim-harness');

(async () => {
  const r1 = await harness.loadGame({ seed: 44, mode: 'entropy-ident' });
  const G1 = r1.Game;
  const S1 = globalThis.Scattering;
  const sc1 = G1.startCombat, te1 = G1.tbEnd;
  console.log('run1: startCombat.__titanWrapped =', !!(sc1 && sc1.__titanWrapped),
    '| __finaleWrapped =', !!(sc1 && sc1.__finaleWrapped),
    '| tbEnd.__finaleWrapped =', !!(te1 && te1.__finaleWrapped));
  await harness.setupGame(G1);

  const r2 = await harness.loadGame({ seed: 44, mode: 'entropy-ident' });
  const G2 = r2.Game;
  const S2 = globalThis.Scattering;
  const sc2 = G2.startCombat, te2 = G2.tbEnd;
  console.log('Scattering object identical across evals:', S1 === S2);
  console.log('Game object identical across evals:', G1 === G2);
  console.log('run2: startCombat identical to run1:', sc1 === sc2,
    '| __titanWrapped =', !!(sc2 && sc2.__titanWrapped),
    '| __finaleWrapped =', !!(sc2 && sc2.__finaleWrapped));
  console.log('run2: tbEnd identical to run1:', te1 === te2,
    '| __finaleWrapped =', !!(te2 && te2.__finaleWrapped));
  // Also check a few other methods for cross-eval identity (wraps anywhere?)
  for (const m of ['eat', 'sleep', 'doAction', 'tbPlayerStrike']) {
    console.log('method', m, 'identical across evals:', G1[m] === G2[m]);
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
