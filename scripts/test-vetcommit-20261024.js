// test-vetcommit-20261024.js — proof for the r46 vetcommit policy wrapper.
// No game load: the wrapper's flag logic is tested against a stub Game and
// a stub base policy, so the test is fast and hermetic. The DET/FID gates
// in probe-endgame-r46-20261024.js prove the wrapper end-to-end in sims
// (DET byte-identical, FID wrapped == pure base with the gate off).
'use strict';
const VC = require('./policies/vetcommit');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function stubGame(opts) {
  return {
    unlockedWave: () => opts.uw,
    waveUnlockReady: () => ({ ready: false, short: opts.short || ['veterans'] }),
    maxHealth: () => 100,
    state: { scholar: { hp: opts.hp == null ? 100 : opts.hp, day: 120 } },
    data: { monsters: [{ id: 'eater', wave: 4 }, { id: 'deer', wave: 1 }] },
    tbfight: opts.fight === false ? null : {
      over: false,
      fighters: [
        { kind: 'monster', hp: 900, monsterId: opts.mid || 'eater' },
        { kind: 'player', hp: 100 },
      ],
    },
  };
}
const stubBase = { fight(G, c) { c.baseCalled = true; return 'stub'; } };

// 1. Gate OFF: wrapper must not touch ctx at all (pure delegation).
delete process.env.VETCOMMIT;
{
  const p = VC.withVetCommit(stubBase, 't', 't');
  const ctx = { _w5Commit: 'keep', _huntCommit: 'keep' };
  const r = p.fight(stubGame({ uw: 4 }), ctx);
  check('gate-off delegates and leaves flags untouched',
    r === 'stub' && ctx.baseCalled && ctx._w5Commit === 'keep' && ctx._huntCommit === 'keep');
}

// 2. Gate ON, live conditions: both commit flags set on a wave-4 fight.
process.env.VETCOMMIT = '1';
{
  const p = VC.withVetCommit(stubBase, 't', 't');
  const ctx = {};
  p.fight(stubGame({ uw: 4 }), ctx);
  check('gate-on wave-4 fight sets both commit flags',
    ctx._w5Commit === true && ctx._huntCommit === true, JSON.stringify(ctx));
  check('gate-on counts the committed fight', ctx.vetFights === 1);
}

// 3. Gate ON, wave-1 monster: no commit (the wrapper is wave-4+ only).
{
  const p = VC.withVetCommit(stubBase, 't', 't');
  const ctx = {};
  p.fight(stubGame({ uw: 4, mid: 'deer' }), ctx);
  check('wave-1 fight does not commit', ctx._w5Commit === false && ctx._huntCommit === false);
}

// 4. Gate ON, veterans bar met: stand-down (no commit even on wave-4).
{
  const p = VC.withVetCommit(stubBase, 't', 't');
  const ctx = {};
  p.fight(stubGame({ uw: 4, short: [] }), ctx);
  check('veterans-met stands down', ctx._w5Commit === false && ctx._huntCommit === false);
}

// 5. Gate ON, wave-5 already unlocked: stand-down.
{
  const p = VC.withVetCommit(stubBase, 't', 't');
  const ctx = {};
  p.fight(stubGame({ uw: 5 }), ctx);
  check('wave-5-unlocked stands down', ctx._w5Commit === false && ctx._huntCommit === false);
}

// 6. Gate ON, scholar badly hurt (<50% HP): no commit (suicide guard).
{
  const p = VC.withVetCommit(stubBase, 't', 't');
  const ctx = {};
  p.fight(stubGame({ uw: 4, hp: 40 }), ctx);
  check('hurt scholar does not commit', ctx._w5Commit === false && ctx._huntCommit === false);
}

// 7. Gate ON, no fight: no commit, no crash.
{
  const p = VC.withVetCommit(stubBase, 't', 't');
  const ctx = {};
  p.fight(stubGame({ uw: 4, fight: false }), ctx);
  check('no fight, no commit', ctx._w5Commit === false && ctx._huntCommit === false);
}

delete process.env.VETCOMMIT;
console.log(`\nvetcommit proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
