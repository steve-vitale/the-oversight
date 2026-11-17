// test-packhunt-rec-b.js — proof test, arm sim-packhunt-rec-b.
// Proves the recorder fix for finding #2497: a Beastmaster's Pack Hunt
// harries the monster for 2–4 per round as a side effect on the lead
// body (src/js/godpath.js fieldStrike, log line "the pack harries it
// for N."), counted in NO dealt total — so the old recovery
// (rec.mHpLeft + rec.mDealt) understated spawn HP on Beastmaster
// fights. The fix folds the parsed pack-harry total into the recovery:
//   mHpStart = mHpLeft + mDealt + packHarryTotal(rec.log)
// and returns mPackDealt so the row carries the pack channel.
//   1. packHarryTotal + recoverMHpStart on synthetic records: the
//      pack sum, the no-pack regression (old #2488 cases unchanged),
//      evade / alreadyDead / vKill / null-record / field-less /
//      negative-clamp rules, and the Bird Strike scope boundary
//      ("the birds tear at it for N." is a second side-effect channel
//      with zero lines on the frozen band — NOT folded in here; the
//      parser must not count it).
//   2. Frozen-row legs: the 6 known mismatch rows from band
//      103601–103608 (sim-partysize-allycap-b), embedded verbatim
//      (stored log lines, mDealt, mHpStart, mHpStartRec). For each:
//      stored mHpStart + parsed pack total == mHpStartRec exactly,
//      and recoverMHpStart on the reconstructed record (mHpLeft =
//      mHpStartRec - mDealt - pack, CONTACTREC's own arithmetic)
//      returns mHpStartRec exactly.
//   3. Live harness legs (full sim-harness, seed 103601): a staged
//      Pack Hunt holder fighting a wave-4 editor through the real
//      fieldFight — the pack harries, and the fixed recovery equals
//      CONTACTREC's rec.mHpStart exactly; plus a no-pack control on a
//      fresh load where pack is 0 and the recovery equals the old sum.
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Usage: node scripts/test-packhunt-rec-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const driver = require(path.join(REPO, 'scripts', 'fightallycap-driver-20261117'));

let failures = 0;
function fail(msg) { failures++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- §1 recoverMHpStart + packHarryTotal, synthetic records ----
(function section1() {
  const R = driver.recoverMHpStart;
  const P = driver.packHarryTotal;
  assert(typeof R === 'function', '§1 driver exports recoverMHpStart');
  assert(typeof P === 'function', '§1 driver exports packHarryTotal');
  // Pack total sums every harry line; the "[Name — Beastmaster ...]"
  // suffix on real log lines does not disturb the match.
  assert(P({ log: ['  the pack harries it for 4. [Mia — Beastmaster of the Apex Predator]',
    '  the pack harries it for 2. [Mia — Beastmaster of the Apex Predator]',
    'R1: Mia strikes for 30 (900 left)'] }) === 6,
    '§1 pack total sums harry lines only (4+2=6, strike line ignored)');
  assert(P({ log: [] }) === 0, '§1 empty log parses to 0');
  assert(P({}) === 0, '§1 missing log parses to 0');
  assert(P(null) === 0, '§1 null record parses to 0');
  // Bird Strike is the same SIDE-EFFECT shape but a different channel
  // (8–12/round, "the birds tear at it for N."): zero bird lines exist
  // on the frozen band, so this fix does NOT fold birds in — the
  // parser must not count them (follow-up finding, not silent scope).
  assert(P({ log: ['  the birds tear at it for 9.', '  the birds tear at it for 11.'] }) === 0,
    '§1 bird-tear lines are NOT counted as pack damage (out of scope)');
  assert(P({ log: ['  the pack harries it for 3.', '  the birds tear at it for 9.'] }) === 3,
    '§1 mixed log counts pack only (3, bird 9 ignored)');
  // Fought, non-kill, WITH harry: remaining + dealt + pack = spawned.
  assert(eq(R({ outcome: 'vFlee', rounds: 4, mDealt: 136, mHpLeft: 787,
    log: ['  the pack harries it for 4.', '  the pack harries it for 2.', '  the pack harries it for 3.'] }, null),
    { mHpStart: 932, vKill: false, noContact: false, mPackDealt: 9 }),
    '§1 fought non-kill with harry recovers mHpLeft + mDealt + pack (787+136+9=932)');
  // Fought, non-kill, WITHOUT harry: the old #2488 rule, unchanged.
  assert(eq(R({ outcome: 'vFlee', rounds: 6, mDealt: 210, mHpLeft: 790 }, null),
    { mHpStart: 1000, vKill: false, noContact: false, mPackDealt: 0 }),
    '§1 fought non-kill without harry recovers mHpLeft + mDealt (1000, pack 0)');
  // Evade: null, correctly (no monster spawned) — even though the
  // record itself carries a rolled members[0].hp.
  assert(eq(R({ outcome: 'evade', rounds: 0, mDealt: 0, mHpLeft: 1010, mHpStart: 1010 }, null),
    { mHpStart: null, vKill: false, noContact: true, mPackDealt: 0 }),
    '§1 evade recovers null even though the record carries a rolled HP');
  // alreadyDead: null, like an evade (rounds 0, dealt 0).
  assert(eq(R({ outcome: 'alreadyDead', rounds: 0, mDealt: 0, mHpLeft: 0 }, null),
    { mHpStart: null, vKill: false, noContact: true, mPackDealt: 0 }),
    '§1 alreadyDead recovers null');
  // Rounds 0 + dealt 0 with any outcome label is no-contact.
  assert(R({ outcome: 'mFlee', rounds: 0, mDealt: 0, mHpLeft: 950 }, null).noContact === true,
    '§1 rounds-0/dealt-0 is no-contact whatever the label');
  // vKill: share by definition; exact HP unrecoverable — but the pack
  // total is still reported (mirrors frozen row 103605 arm d101 vs
  // audit, a vKill whose log carries 10 pack damage).
  assert(eq(R({ outcome: 'vKill', rounds: 10, mDealt: 400, mHpLeft: 0,
    log: ['  the pack harries it for 4.', '  the pack harries it for 3.', '  the pack harries it for 3.'] }, null),
    { mHpStart: null, vKill: true, noContact: false, mPackDealt: 10 }),
    '§1 vKill recovers null HP + vKill flag, pack total still reported (10)');
  // Null record: falls back to the pre-call live-instance read.
  assert(R(null, 850).mHpStart === 850 && R(null, 850).mPackDealt === 0,
    '§1 null record falls back to pre-call HP (pack 0)');
  assert(R(null, null).mHpStart === null, '§1 null record + null pre-call stays null');
  // Record without the fields: pre-call fallback.
  assert(R({ outcome: 'vFlee', rounds: 2 }, 720).mHpStart === 720,
    '§1 field-less record falls back to pre-call HP');
  // Overkill guard: negative parts clamp, never a negative HP.
  assert(R({ outcome: 'vFlee', rounds: 3, mDealt: 50, mHpLeft: -5,
    log: ['  the pack harries it for 2.'] }, null).mHpStart === 52,
    '§1 negative mHpLeft clamps to 0 in the recovery (0+50+2=52)');
})();

// ---- §2 frozen-row legs: the 6 known mismatch rows, verbatim ----
// Stored rows from perseed-partysize-allycap-b-{ctl,arm} (band
// 103601–103608). mHpLeft is NOT stored on the row; it is derived by
// CONTACTREC's own arithmetic (mHpStartRec - mDealt - pack), so the
// recoverMHpStart call checks the fixed rule against CONTACTREC's
// number, not against itself. The direct row check (stored mHpStart
// + parsed pack == mHpStartRec) needs no derivation at all.
const FROZEN6 = [
  { leg: 'ctl', seed: 103604, day: 95, mid: 'congregation', outcome: 'vFlee', rounds: 4, mDealt: 136,
    mHpStart: 923, mHpStartRec: 932,
    harry: [4, 2, 3],
    log: ['  the pack harries it for 4. [Mia — Beastmaster of the Apex Predator]',
      '  the pack harries it for 2. [Mia — Beastmaster of the Apex Predator]',
      '  the pack harries it for 3. [Mia — Beastmaster of the Apex Predator]'] },
  { leg: 'arm', seed: 103606, day: 133, mid: 'editor', outcome: 'vFlee', rounds: 8, mDealt: 571,
    mHpStart: 1848, mHpStartRec: 1855,
    harry: [2, 3, 2],
    log: ['  the pack harries it for 2. [Afanasy — Beastmaster of the Apex Predator]',
      '  the pack harries it for 3. [Afanasy — Beastmaster of the Apex Predator]',
      '  the pack harries it for 2. [Afanasy — Beastmaster of the Apex Predator]'] },
  { leg: 'arm', seed: 103606, day: 135, mid: 'editor', outcome: 'vFlee', rounds: 6, mDealt: 356,
    mHpStart: 1488, mHpStartRec: 1500,
    harry: [4, 4, 4],
    log: ['  the pack harries it for 4. [Afanasy — Beastmaster of the Apex Predator]',
      '  the pack harries it for 4. [Afanasy — Beastmaster of the Apex Predator]',
      '  the pack harries it for 4. [Afanasy — Beastmaster of the Apex Predator]'] },
  { leg: 'arm', seed: 103606, day: 136, mid: 'editor', outcome: 'vFlee', rounds: 4, mDealt: 151,
    mHpStart: 1122, mHpStartRec: 1132,
    harry: [2, 4, 4],
    log: ['  the pack harries it for 2. [Afanasy — Beastmaster of the Apex Predator]',
      '  the pack harries it for 4. [Afanasy — Beastmaster of the Apex Predator]',
      '  the pack harries it for 4. [Afanasy — Beastmaster of the Apex Predator]'] },
  { leg: 'arm', seed: 103606, day: 137, mid: 'editor', outcome: 'vFlee', rounds: 6, mDealt: 177,
    mHpStart: 964, mHpStartRec: 971,
    harry: [3, 2, 2],
    log: ['  the pack harries it for 3. [Afanasy — Beastmaster of the Apex Predator]',
      '  the pack harries it for 2. [Afanasy — Beastmaster of the Apex Predator]',
      '  the pack harries it for 2. [Afanasy — Beastmaster of the Apex Predator]'] },
  { leg: 'arm', seed: 103606, day: 141, mid: 'editor', outcome: 'vDie', rounds: 4, mDealt: 162,
    mHpStart: 331, mHpStartRec: 340,
    harry: [3, 4, 2],
    log: ['  the pack harries it for 3. [Afanasy — Beastmaster of the Apex Predator]',
      '  the pack harries it for 4. [Afanasy — Beastmaster of the Apex Predator]',
      '  the pack harries it for 2. [Afanasy — Beastmaster of the Apex Predator]'] },
];
(function section2() {
  for (const row of FROZEN6) {
    const tag = '§2 s' + row.seed + ' ' + row.leg + ' d' + row.day + ' ' + row.mid;
    const pack = driver.packHarryTotal({ log: row.log });
    const expect = row.harry.reduce(function (t, x) { return t + x; }, 0);
    assert(pack === expect, tag + ': parsed pack total is ' + expect + ' (got ' + pack + ')');
    assert(row.mHpStart + pack === row.mHpStartRec,
      tag + ': stored mHpStart + pack == CONTACTREC (' + row.mHpStart + '+' + pack + '=' + row.mHpStartRec + ')');
    const mHpLeft = row.mHpStartRec - row.mDealt - pack;
    const got = driver.recoverMHpStart(
      { outcome: row.outcome, rounds: row.rounds, mDealt: row.mDealt, mHpLeft: mHpLeft, log: row.log }, null);
    assert(got.mHpStart === row.mHpStartRec && got.mPackDealt === expect && got.vKill === false && got.noContact === false,
      tag + ': fixed recovery returns CONTACTREC exactly (' + got.mHpStart + ', pack ' + got.mPackDealt + ')');
  }
  // The 7th harry row on the band (103605 arm d101 vs audit) is a
  // vKill: the recovery must NOT resurrect a spawn HP for it, and the
  // pack total is still reported on the record.
  const kill = driver.recoverMHpStart(
    { outcome: 'vKill', rounds: 10, mDealt: 400, mHpLeft: 0,
      log: ['  the pack harries it for 4.', '  the pack harries it for 3.', '  the pack harries it for 3.'] }, null);
  assert(kill.mHpStart === null && kill.vKill === true && kill.mPackDealt === 10,
    '§2 vKill harry row: HP stays null (share 1.0 by definition), pack 10 reported');
})();

// ---- §3 live harness legs ----
async function section3() {
  const { Game, loadFails } = await loadGame({ seed: 103601, mode: 'test' });
  if (loadFails && loadFails.length) { fail('§3 module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const R = driver.recoverMHpStart;
  const mdef = function (id) { return (Game.data.monsters || []).find(function (m) { return m.id === id; }); };
  const roster = (Game.state.village.roster || []).filter(function (id) { return id !== Game.villagerId; });
  if (roster.length < 2) { fail('§3 need 2+ NPCs, have ' + roster.length); return; }
  const setHealth = function (vid, hp) { ((Game.state.village.health = Game.state.village.health || {}))[vid] = hp; };
  const editor = mdef('editor');
  assert(!!editor && Array.isArray(editor.hp), '§3 editor def exists with an hp range');
  assert(typeof Game.fieldFight === 'function', '§3 Game.fieldFight exists');

  // 3a. Pack Hunt staged: loop the roster (deterministic order, fixed
  // seed) until a fought non-kill editor fight harries. The pack must
  // fire, and the fixed recovery must equal CONTACTREC exactly.
  let fought = null;
  for (let i = 0; i < roster.length && !fought; i++) {
    const vid = roster[i];
    Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
    Game.state.village.npcAbilities[vid] = ['pack_hunt'];
    setHealth(vid, 100);
    const rec = Game.fieldFight(vid, editor, null, { awareness: false });
    Game.state.village.npcAbilities[vid] = [];
    if (rec && (rec.rounds | 0) > 0 && (rec.mDealt | 0) > 0 && rec.outcome !== 'vKill' &&
        driver.packHarryTotal(rec) > 0) fought = { vid: vid, rec: rec };
  }
  assert(!!fought, '§3a found a live fought Pack Hunt editor fight with harry damage (pack>0)');
  if (fought) {
    const rec = fought.rec;
    const got = R(rec, null);
    assert(got.mPackDealt > 0, '§3a live fight harried (mPackDealt=' + got.mPackDealt + ')');
    assert(got.mHpStart === rec.mHpStart,
      '§3a fixed recovery equals CONTACTREC rec.mHpStart (' + got.mHpStart + ' vs ' + rec.mHpStart + ')');
    assert(got.mHpStart === rec.mHpLeft + rec.mDealt + got.mPackDealt,
      '§3a recovery is mHpLeft + mDealt + pack (' + rec.mHpLeft + '+' + rec.mDealt + '+' + got.mPackDealt + ')');
    assert(got.mHpStart >= editor.hp[0] && got.mHpStart <= editor.hp[1],
      '§3a recovered HP ' + got.mHpStart + ' lies inside the def range [' + editor.hp[0] + ',' + editor.hp[1] + ']');
    assert(got.vKill === false && got.noContact === false, '§3a fought row is neither kill nor no-contact');
  }

  // 3b. No-pack control on a FRESH load: same seed, same loop, no
  // staging — the first fought non-kill editor fight must carry pack
  // 0 and recover by the old sum, exactly.
  const { Game: Game2, loadFails: lf2 } = await loadGame({ seed: 103601, mode: 'test' });
  if (lf2 && lf2.length) { fail('§3b module load failures: ' + lf2.join('; ')); return; }
  await setupGame(Game2);
  const roster2 = (Game2.state.village.roster || []).filter(function (id) { return id !== Game2.villagerId; });
  const setHealth2 = function (vid, hp) { ((Game2.state.village.health = Game2.state.village.health || {}))[vid] = hp; };
  const editor2 = (Game2.data.monsters || []).find(function (m) { return m.id === 'editor'; });
  let ctl = null;
  for (let i = 0; i < roster2.length && !ctl; i++) {
    const vid = roster2[i];
    setHealth2(vid, 100);
    const rec = Game2.fieldFight(vid, editor2, null, { awareness: false });
    if (rec && (rec.rounds | 0) > 0 && (rec.mDealt | 0) > 0 && rec.outcome !== 'vKill') ctl = { vid: vid, rec: rec };
  }
  assert(!!ctl, '§3b found a live fought no-pack editor fight on the fresh load');
  if (ctl) {
    const rec = ctl.rec;
    const got = R(rec, null);
    assert(got.mPackDealt === 0, '§3b control fight harried nothing (mPackDealt=0)');
    assert(got.mHpStart === rec.mHpLeft + rec.mDealt,
      '§3b control recovery is the old sum (' + got.mHpStart + ' = ' + rec.mHpLeft + ' + ' + rec.mDealt + ')');
    assert(got.mHpStart === rec.mHpStart,
      '§3b control recovery equals CONTACTREC (' + got.mHpStart + ' vs ' + rec.mHpStart + ')');
  }
}

async function main() {
  await section3();
  console.log('test-packhunt-rec-b: ' + (failures === 0 ? 'PASS' : 'FAIL') + ' (' + failures + ' failures)');
  if (failures) process.exitCode = 1;
}

main().catch(function (e) { console.error('FAIL: test-packhunt-rec-b crashed: ' + (e && e.stack || e)); process.exitCode = 1; });
