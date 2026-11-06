// test-journey-deepening-r107-pocketed-20261106.js -- proof test for the
// R107 D-THING fix (the pocketed thing comes back). D-THING (r95, open
// through r106): a declined invitation sometimes ends with '"Another
// time, then." A small thing, pocketed.' and the thing is never mentioned
// again (r106: 3 pocketed / 0 revisited / 0 mentioned). The fix, mirroring
// the r104 repay pattern (record outlives the seed; select from the record):
//   - betrayal.js declineInvite records hist.pocketed = { day, mentioned }
//     exactly when the returned decline line IS the pocketed line.
//   - convo-wants.js adds a record-driven `pocketed` want (pick() 0): the
//     opener names the small thing, staleOpener reframes it, onSurfaced
//     marks it mentioned so it is named exactly once.
//   - convoSelectWant selects it AFTER live seeds and AFTER the unsettled
//     promise (below repay), above the weighted pick.
// This test proves the mechanism on a live loaded game (no panel files):
//   1. A fresh-ledger decline records pocketed (day + mentioned:false).
//   2. A ledger-blocked pocketed line fires an alternate and records nothing.
//   3. The next sitting selects the pocketed want and the opener names the thing.
//   4. Mentioned-once: after onSurfaced, the want is never selected again.
//   5. Repay still outranks pocketed when a fulfilled favor is pending.
//   6. A live seed still outranks pocketed.
//   7-11. Analyzer: classifyPocketedThreads on synthetic transcripts
//     (testable denominator, mention detection, no self-match).
// Seeds 92651/92652 are harness fixtures only, not a panel band.
// Run: node scripts/test-journey-deepening-r107-pocketed-20261106.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const { classifyPocketedThreads } = require('./analyze-journey-deepening-r107-20261106.js');

const POCKETED = '"Another time, then." A small thing, pocketed.';
const POOL = [
  POCKETED,
  '"Right — another time."',
  '"Fair enough. Rain check."',
  '"Suit yourself."',
];

let pass = 0;
function check(name, fn) { fn(); pass++; console.log('ok - ' + name); }

function livingVillagers(Game) {
  const roster = ((Game.state.village || {}).roster || []);
  return roster.filter(id => id && id !== Game.villagerId && !(Game.getPerson(id) || {}).dead);
}

(async () => {
  // 7-11. Analyzer checks (synthetic transcripts, no game load).
  function pockSitting(seed, day, vid, wantLine, themLines) {
    return { seed: String(seed), day, vid, text: [wantLine].concat(themLines.map(t => 'THEM: ' + t)).join('\n') + '\n' };
  }
  check('analyzer: mentioned thread is testable + mentioned', () => {
    const t1 = pockSitting(1, 45, 'v', 'want: ask_favor (stage 1)', ['"Another time, then." A small thing, pocketed.']);
    const t2 = pockSitting(1, 60, 'v', 'want: pocketed (stage 1)', ['"Still carrying that small thing from last time." They pat a pocket.']);
    const th = classifyPocketedThreads([t1, t2]);
    assert.strictEqual(th.length, 1);
    assert.strictEqual(th[0].testable, true);
    assert.strictEqual(th[0].mentioned, true);
  });
  check('analyzer: unmentioned thread is testable but not mentioned', () => {
    const t1 = pockSitting(1, 45, 'v', 'want: ask_favor (stage 1)', ['"Another time, then." A small thing, pocketed.']);
    const t2 = pockSitting(1, 60, 'v', 'want: curious (stage 1)', ['"What is the most useful thing you have learned?"']);
    const th = classifyPocketedThreads([t1, t2]);
    assert.strictEqual(th.length, 1);
    assert.strictEqual(th[0].testable, true);
    assert.strictEqual(th[0].mentioned, false);
  });
  check('analyzer: last-sitting thread is not testable (unmeasurable, not zero)', () => {
    const t1 = pockSitting(1, 60, 'v', 'want: ask_favor (stage 1)', ['"Another time, then." A small thing, pocketed.']);
    const th = classifyPocketedThreads([t1]);
    assert.strictEqual(th.length, 1);
    assert.strictEqual(th[0].testable, false);
    assert.strictEqual(th[0].mentioned, false);
  });
  check('analyzer: pocketed want line counts as mentioned (structural)', () => {
    const t1 = pockSitting(1, 45, 'v', 'want: ask_favor (stage 1)', ['"Another time, then." A small thing, pocketed.']);
    const t2 = pockSitting(1, 60, 'v', 'want: pocketed (stage 1)', ['"Something else entirely."']);
    const th = classifyPocketedThreads([t1, t2]);
    assert.strictEqual(th[0].mentioned, true);
  });
  check('analyzer: a second pocketed decline does not count as a mention', () => {
    const t1 = pockSitting(1, 45, 'v', 'want: ask_favor (stage 1)', ['"Another time, then." A small thing, pocketed.']);
    const t2 = pockSitting(1, 60, 'v', 'want: ask_favor (stage 1)', ['"Another time, then." A small thing, pocketed.']);
    const th = classifyPocketedThreads([t1, t2]);
    assert.strictEqual(th.length, 2);
    assert.strictEqual(th[0].testable, true);
    assert.strictEqual(th[0].mentioned, false);
  });

  for (const seed of [92651, 92652]) {
    const { Game } = await loadGame({ seed });
    await setupGame(Game);
    const vids = livingVillagers(Game);
    assert.ok(vids.length >= 3, `seed ${seed}: need >=3 living villagers, got ${vids.length}`);
    const day = (Game.state.scholar || {}).day || 0;
    const [a, b, c] = vids;

    // 1. Fresh-ledger decline records pocketed.
    check(`seed ${seed}: fresh-ledger decline records pocketed`, () => {
      const line = Game.declineInvite(a);
      assert.strictEqual(line, POCKETED);
      const h = Game.inviteHistory(a);
      assert.ok(h.pocketed, 'pocketed recorded');
      assert.strictEqual(h.pocketed.day, day);
      assert.strictEqual(h.pocketed.mentioned, false);
    });

    // 2. Ledger-blocked pocketed line fires an alternate and records nothing.
    check(`seed ${seed}: blocked pocketed line records nothing`, () => {
      const key0 = String((Game.convoSplitBeats(POOL[0]) || [POOL[0]])[0]).trim();
      Game.convoRunLedger().push(key0);
      const line = Game.declineInvite(b);
      assert.notStrictEqual(line, POCKETED);
      assert.ok(POOL.includes(line), 'alternate decline line fired: ' + line);
      assert.ok(!Game.inviteHistory(b).pocketed, 'no pocketed record on an alternate decline');
      Game.convoRunLedger().length = 0;
    });

    // 3. Next sitting selects pocketed; opener names the thing.
    let sel = null;
    check(`seed ${seed}: next sitting selects the pocketed want`, () => {
      sel = Game.convoSelectWant(a);
      assert.ok(sel && sel.id === 'pocketed', 'selected want is pocketed, got ' + (sel && sel.id));
      const line = sel.def.opener.call(Game, a);
      assert.ok(typeof line === 'string' && /small thing/i.test(line),
        'opener names the small thing: ' + line);
    });

    // 4. Mentioned-once: after onSurfaced, never selected again.
    check(`seed ${seed}: pocketed is named exactly once`, () => {
      sel.def.onSurfaced.call(Game, a);
      assert.strictEqual(Game.inviteHistory(a).pocketed.mentioned, true);
      const sel2 = Game.convoSelectWant(a);
      assert.ok(!sel2 || sel2.id !== 'pocketed', 'second sitting does not re-select pocketed');
    });

    // 5. Repay outranks pocketed when a fulfilled favor is pending.
    check(`seed ${seed}: repay outranks pocketed`, () => {
      Game.inviteHistory(c).pocketed = { day, mentioned: false };
      Game.convoStoreFavor({ vid: c, id: 'fav-r107', state: 'fulfilled', short: 'the food run', kind: 'food' });
      const s = Game.convoSelectWant(c);
      assert.ok(s && s.id === 'repay', 'repay selected over pocketed, got ' + (s && s.id));
    });

    // 6. A live seed outranks pocketed.
    check(`seed ${seed}: live seed outranks pocketed`, () => {
      const d = vids[3] || vids[0];
      Game.inviteHistory(d).pocketed = { day, mentioned: false };
      Game.convoPlantSeed(d, { wantId: 'curious', note: 'the stranger question' });
      const s = Game.convoSelectWant(d);
      assert.ok(s && s.id === 'curious', 'seed want selected over pocketed, got ' + (s && s.id));
    });
  }
  console.log(`RESULT: ${pass} PASS, 0 FAIL`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
