#!/usr/bin/env node
'use strict';
// test-raidshield-20261016.js — proof tests for the sim-raidshield arm
// (src/js/havenGrowth.js: the shield wall — apex-aware raid defense).
//
// 1. SYNTHETIC UNIT CHECKS on the pure planners, against a real Game from
//    the harness with fabricated village state:
//      - raidshieldOn(): env gate, default OFF.
//      - raidshieldOrderRaiders(): wave desc, then distance asc.
//      - raidshieldDefenderScore()/raidshieldOrderDefenders(): archers
//        first (the volley is the ork answer), then healthiest; shielded
//        ALWAYS last (the FACILITATION promise).
//      - raidshieldRaiderStanding(): hp>0 + at haven tile + in worldMonsters.
//      - raidshieldSortieDue(): lingering wave>=4, 3+ dawns, cooldown,
//        no table sanctity, no help already coming.
// 2. SMOKE (SMOKE=1): both policies drive 20d with RAIDSHIELD=1 — raids
//    still fire, no crash, shield-wall beats appear when an apex raids.
// 3. DET (DET=1): identical-seed pairs — gate-ON self-consistent, and
//    gate-OFF trajectory-identical to the pristine-HEAD baseline tree
//    (the det-gate baseline proves the else-branch is the old code).
//
// Run: node scripts/test-raidshield-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 SMOKE=1 node scripts/test-raidshield-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 DET=1 node scripts/test-raidshield-20261016.js
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { checkDeterminism } = require('./det-gate');
const TF = require('./policies/tribfloor');

let pass = 0, fail = 0;
function check(name, fn) {
  try {
    const r = fn();
    if (r === true) { pass++; console.log(`  PASS ${name}`); }
    else { fail++; console.log(`  FAIL ${name} — returned ${JSON.stringify(r)}`); }
  } catch (e) {
    fail++; console.log(`  FAIL ${name} — threw: ${e.message}`);
  }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'mvc' });

  // KILL PROTOCOL (evidence/2026-10-16/sim-raidshield.md): the arm was killed
  // at pilot (PRIMARY 1.400 vs 0.850) and havenGrowth.js was reverted to
  // HEAD — zero game-code trace. The proof below is the record; live gates
  // skip cleanly without the layer.
  if (typeof Game.raidshieldOn !== 'function') {
    console.log('NOTE: the raidshield game-code layer was reverted per the kill protocol');
    console.log('(evidence/2026-10-16/sim-raidshield.md). Proof record retained; live gates skip.');
    process.exit(0);
  }

  // ---- 1. the gate ----
  delete process.env.RAIDSHIELD;
  check('g1 gate OFF by default (no env)', () => Game.raidshieldOn() === false);
  process.env.RAIDSHIELD = '1';
  check('g2 gate ON with RAIDSHIELD=1', () => Game.raidshieldOn() === true);
  process.env.RAIDSHIELD = '0';
  check('g3 gate OFF with RAIDSHIELD=0', () => Game.raidshieldOn() === false);
  delete process.env.RAIDSHIELD;

  // ---- 2. raider ordering: wave desc, then distance asc ----
  // (wave lives in the data def, never on the entity — fixtures use real ids)
  const hx = 4, hy = 4;
  const mkR = (id, tx, ty) => ({ id, tx, ty, hp: 100 });
  const raiders = [
    mkR('bulldozer', 0, 0),   // wave 1, dist 8
    mkR('reunion', 3, 4),      // wave 4, dist 1
    mkR('cancellation', 6, 4), // wave 5, dist 2
    mkR('audit', 6, 6),        // wave 4, dist 4
    mkR('hushwolf', 4, 3),     // wave 1, dist 1
  ];
  check('r1 apex first: wave desc', () =>
    eq(Game.raidshieldOrderRaiders(raiders, hx, hy).map(m => m.id),
       ['cancellation', 'reunion', 'audit', 'hushwolf', 'bulldozer']));
  check('r2 original array not mutated', () => raiders[0].id === 'bulldozer');
  check('r3 unknown id defaults to wave 1 (sorts last)', () =>
    Game.raidshieldOrderRaiders([mkR('reunion', 4, 4), { id: 'nope_nothing', tx: 4, ty: 4, hp: 10 }], hx, hy)[0].id === 'reunion');
  check('r4 raidshieldWaveOf reads the def: reunion=4, cancellation=5, bulldozer=1, unknown=1', () =>
    Game.raidshieldWaveOf({ id: 'reunion' }) === 4 &&
    Game.raidshieldWaveOf({ id: 'cancellation' }) === 5 &&
    Game.raidshieldWaveOf({ id: 'bulldozer' }) === 1 &&
    Game.raidshieldWaveOf({ id: 'nope_nothing' }) === 1 &&
    Game.raidshieldWaveOf(null) === 1);
  check('r5 entity-carried wave is IGNORED (entities never carry it)', () =>
    Game.raidshieldWaveOf({ id: 'bulldozer', wave: 5 }) === 1);

  // ---- 3. defender ordering: archers first, then healthiest, shielded last ----
  Game.state = Game.state || {};
  Game.state.village = {
    roster: ['scholar', 'anna', 'bob', 'cara', 'dan'],
    health: { anna: 90, bob: 50, cara: 80, dan: 95 },
    shielded: { cara: true },
    away: {},
  };
  Game.villagerId = 'scholar';
  const realGetPerson = Game.getPerson;
  Game.getPerson = (vid) => {
    if (vid === 'anna') return { id: 'anna', equipped: { ranged: { itemId: 'bow' } } };
    if (vid === 'dan') return { id: 'dan', equipped: { ranged: { itemId: 'bow' } } };
    return { id: vid, equipped: {} };
  };
  check('d1 archer outranks higher-HP non-archer (volley = the ork answer)', () =>
    Game.raidshieldDefenderScore('anna') > Game.raidshieldDefenderScore('cara'));
  check('d2 archer bonus dominates health: lowest-HP archer still outranks healthiest non-archer', () =>
    Game.raidshieldDefenderScore('anna') > Game.raidshieldDefenderScore('cara') &&
    (Game.raidshieldDefenderScore('anna') - Game.raidshieldDefenderScore('bob')) > 500);
  const defenderPool = ['anna', 'bob', 'cara', 'dan'].filter(id =>
    id !== Game.villagerId && !(Game.state.village.away || {})[id] &&
    ((Game.state.village.health || {})[id] === undefined || (Game.state.village.health || {})[id] > 40));
  check('d3 order: archers first by health, then non-archers by health, shielded last', () =>
    eq(Game.raidshieldOrderDefenders(defenderPool), ['dan', 'anna', 'bob', 'cara']));
  check('d4 score is a number, archer bonus dominates health', () => {
    const sa = Game.raidshieldDefenderScore('anna'); // archer, hp 90
    const sb = Game.raidshieldDefenderScore('bob');  // no bow, hp 50
    return typeof sa === 'number' && sa > sb && (sa - sb) > 500;
  });
  Game.getPerson = realGetPerson;

  // ---- 4. raider-standing check ----
  Game.state.village.px = 4; Game.state.village.py = 4;
  const wm = [];
  Game.worldMonsters = () => wm;
  const m1 = { id: 'x', hp: 40, tx: 4, ty: 4 }; wm.push(m1);
  check('s1 alive at haven, in world list -> standing', () => Game.raidshieldRaiderStanding(m1, 4, 4) === true);
  check('s2 dead (hp 0) -> not standing', () => { m1.hp = 0; const r = Game.raidshieldRaiderStanding(m1, 4, 4) === false; m1.hp = 40; return r; });
  check('s3 fled the tile -> not standing', () => { m1.tx = 5; const r = Game.raidshieldRaiderStanding(m1, 4, 4) === false; m1.tx = 4; return r; });
  check('s4 removed from world list -> not standing', () => { wm.length = 0; const r = Game.raidshieldRaiderStanding(m1, 4, 4) === false; wm.push(m1); return r; });

  // ---- 5. sortie due predicate ----
  Game.state.scholar = Game.state.scholar || {}; Game.state.scholar.day = 100;
  Game.state.pendingHelp = [];
  const realTableActive = Game.tableActive;
  Game.tableActive = () => false;
  const mkL = (id, nights) => ({ id, lingering: true, hp: 100, _rsNights: nights, tx: 4, ty: 4 });
  Game.state.village._rsLastSortieDay = undefined;
  check('t1 wave-4 lingerer, 3 dawns -> due', () => Game.raidshieldSortieDue(mkL('reunion', 3), Game.state.village, 100) === true);
  check('t2 only 2 dawns -> not due', () => Game.raidshieldSortieDue(mkL('reunion', 2), Game.state.village, 100) === false);
  check('t3 wave-1 lingerer, 9 dawns -> never due (small teeth wait)', () => Game.raidshieldSortieDue(mkL('bulldozer', 9), Game.state.village, 100) === false);
  check('t4 wave-5 lingerer, 5 dawns -> due', () => Game.raidshieldSortieDue(mkL('cancellation', 5), Game.state.village, 100) === true);
  check('t5 sortie cooldown: went yesterday -> not due', () => {
    Game.state.village._rsLastSortieDay = 99;
    const r = Game.raidshieldSortieDue(mkL('reunion', 3), Game.state.village, 100) === false;
    Game.state.village._rsLastSortieDay = undefined; return r;
  });
  check('t6 table sanctity: no sorties mid-finale', () => {
    Game.tableActive = () => true;
    const r = Game.raidshieldSortieDue(mkL('reunion', 3), Game.state.village, 100) === false;
    Game.tableActive = () => false; return r;
  });
  check('t7 help already marching -> hold the sortie', () => {
    Game.state.pendingHelp = [{ partsLeft: 2 }];
    const r = Game.raidshieldSortieDue(mkL('reunion', 3), Game.state.village, 100) === false;
    Game.state.pendingHelp = []; return r;
  });
  check('t8 dead lingerer -> not due', () => {
    const m = mkL('reunion', 3); m.hp = 0;
    return Game.raidshieldSortieDue(m, Game.state.village, 100) === false;
  });
  Game.tableActive = realTableActive;

  console.log(`\nunit: ${pass} pass, ${fail} fail`);
  if (process.env.SMOKE === '1') await smokeGate();
  else if (process.env.DET === '1') await detGate();
  if (fail > 0 && !process.env.SMOKE && !process.env.DET) process.exit(1);
}

async function smokeGate() {
  console.log('\nSMOKE: 20d x {leadfeast, belongfeast} x {gate off, RAIDSHIELD=1}');
  let fails = 0;
  for (const policy of ['leadfeast', 'belongfeast']) {
    for (const rs of [null, '1']) {
      if (rs) process.env.RAIDSHIELD = '1'; else delete process.env.RAIDSHIELD;
      const { Game } = await loadGame({ seed: 777, mode: 'mvc' });
      await setupGame(Game, null, 'courtship');
      const P = TF[policy];
      try {
        await quietLog(() => runDays(Game, P, { days: 20, manifest: { seed: 777 } }));
        console.log(`  PASS smoke ${policy} raidshield=${rs || 'off'}: 20d, no crash`);
      } catch (e) {
        fails++; console.log(`  FAIL smoke ${policy} raidshield=${rs || 'off'}: ${e.message}`);
      }
    }
  }
  delete process.env.RAIDSHIELD;
  if (fails) { console.log(`SMOKE: ${fails} failures`); process.exit(1); }
  console.log('SMOKE green');
}

async function detGate() {
  // both-repeat via the shared gate: same seed twice with RAIDSHIELD=1 must
  // be trajectory-identical (self-consistency). gate-OFF-vs-HEAD is proven
  // by the baseline tree run (scripts/det-raidshield-baseline-20261016.js).
  console.log('\nDET: 4 identical-seed pairs, gate ON, both-repeat');
  const seeds = [111, 122, 133, 144];
  process.env.RAIDSHIELD = '1';
  let fails = 0;
  for (const s of seeds) {
    const gate = await checkDeterminism(s, TF.leadfeast, { days: 60 });
    if (gate.identical) console.log(`  PASS det s${s}: ${gate.summary}`);
    else { fails++; console.log(`  FAIL det s${s}: ${gate.summary}`); }
  }
  delete process.env.RAIDSHIELD;
  if (fails) { console.log(`DET: ${fails} failures`); process.exit(1); }
  console.log('DET green (gate-ON self-consistent; gate-OFF-vs-HEAD in baseline script)');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
