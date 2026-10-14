#!/usr/bin/env node
// scripts/test-intraviol-20261014.js — proof test for the intraviol census instrument.
//
// Proves THREE things (MEASUREMENT.md §5: what "green" means):
//   A. CAPTURE FIDELITY — the harness-side wrapper records every real death
//      registration with killerId/cause/player flag intact, and skips the
//      double-death guard's nulls. Synthetic registerDeath calls.
//   B. BYTE-IDENTICAL GAMEPLAY — same seed, instrument on vs off, 40 days:
//      JSON.stringify(Game.state) hashes are identical. 2 seeds (11, 33).
//      A sabotage control (INTRAVIOL_SABOTAGE=1: tbDamage wrapper consumes one
//      RNG draw per hit) proves the equality check is SENSITIVE — it must
//      report DIFFERENT.
//   C. CLASSIFICATION — synthetic records classify to exact
//      (victimKind, killerKind, context) tuples.
//
// RED PHASES (real, not skipped):
//   node scripts/test-intraviol-20261014.js --red
//     - sets INTRAVIOL_NOATTACH=1 -> Part A must FAIL (no instrument, no log)
//     - sets INTRAVIOL_BROKEN_CLASSIFIER=1 -> Part C must FAIL (all 'unknown')
//     - spawns the sabotage child -> must report DIFFERENT (sensitivity)
//     Exits 0 only if every RED fails exactly as designed (proving the GREEN
//     assertions can actually catch breakage).
// GREEN:
//   node scripts/test-intraviol-20261014.js  (exit 0 iff all pass)
'use strict';
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const SCRIPT = __filename;

let PASS = 0, FAIL = 0;
const failures = [];
function ok(cond, label) {
  if (cond) { PASS++; }
  else { FAIL++; failures.push(label); console.log('  FAIL: ' + label); }
  return !!cond;
}
function section(name) { console.log('\n-- ' + name + ' --'); }

function stateHash(Game) {
  return crypto.createHash('sha1').update(JSON.stringify(Game.state)).digest('hex');
}

// ---------- Part A: capture fidelity (synthetic deaths on a real Game) ----------
async function partA() {
  section('A. capture fidelity (synthetic registerDeath)');
  const { attachIntraviol } = require('./intraviol-census-20261014');
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 4242, mode: 'intraviol-test-a' });
  await setupGame(Game);
  const api = attachIntraviol(Game);
  if (!ok(api && Array.isArray(api.log), 'attachIntraviol returns api with log array')) return;
  ok(api.log.length === 0, 'log starts empty');
  const roster = (((Game.state || {}).village || {}).roster || []).slice();
  ok(roster.length >= 3, 'roster has >=3 villagers (got ' + roster.length + ')');
  const [r0, r1, r2] = roster;

  // 1. villager-on-villager ambush
  Game.registerDeath({ kind: 'villager', villagerId: r0, name: 'Test Victim', cause: 'ambush', killerId: r1 });
  ok(api.log.length === 1, 'ambush death recorded (log=1)');
  ok(api.log[0].killerId === r1, 'killerId preserved on ambush record');
  ok(api.log[0].cause === 'ambush', 'cause preserved');
  ok(api.log[0].villagerId === r0, 'villagerId preserved');
  ok(api.log[0].player === false, 'player flag false for NPC death');
  ok(typeof api.log[0].day === 'number', 'day snapshot is a number');

  // 2. double-death guard: same villager again -> registerDeath returns null -> not logged
  Game.registerDeath({ kind: 'villager', villagerId: r0, name: 'Test Victim', cause: 'ambush', killerId: r1 });
  ok(api.log.length === 1, 'double-death guard null not logged (log still 1)');

  // 3. deprivation death, no killer
  Game.registerDeath({ kind: 'villager', villagerId: r2, name: 'Test Two', cause: 'starvation' });
  ok(api.log.length === 2, 'starvation death recorded (log=2)');
  ok(api.log[1].killerId === null, 'killerId null recorded as null');

  // 4. player-vessel death carries player:true
  Game.registerDeath({ kind: 'villager', villagerId: r1, name: 'Test Vessel', cause: 'the wild', player: true });
  ok(api.log.length === 3, 'player death recorded (log=3)');
  ok(api.log[2].player === true, 'player:true flag captured');
}

// ---------- Part B: byte-identical gameplay ----------
// Wall-clock is baked into the game state by design (state.startedAt, runKey,
// tele t-stamps, Date.now().toString(36) id segments, state.pacing dayMinutes).
// None of that is gameplay. The determinism proof freezes the clock so both
// runs see identical time — any remaining hash difference must come from the
// instrument (or genuine RNG non-determinism, which the off-vs-off control
// below rules out).
const FROZEN_NOW = 1792000000000;
async function withFrozenClock(fn) {
  const _dn = Date.now;
  const _pn = (typeof performance !== 'undefined' && performance.now) ? performance.now : null;
  Date.now = () => FROZEN_NOW;
  if (_pn) performance.now = () => 0;
  try { return await fn(); } finally { Date.now = _dn; if (_pn) performance.now = _pn; }
}
async function run40(seed, withInstrument) {
  return withFrozenClock(async () => {
    const { attachIntraviol } = require('./intraviol-census-20261014');
    const { loadGame, setupGame, runDays } = require('./sim-harness');
    const { competent } = require('./policies/competent');
    const { Game } = await loadGame({ seed, mode: 'intraviol-test-b-' + (withInstrument ? 'on' : 'off') });
    await setupGame(Game);
    let iv = null;
    if (withInstrument) iv = attachIntraviol(Game);
    const result = await runDays(Game, competent, { days: 40, sampleEvery: 40 });
    return { hash: stateHash(Game), days: result.days, iv };
  });
}

async function partB() {
  section('B. byte-identical gameplay (2 seeds x 40d, competent, clock frozen)');
  for (const seed of [11, 33]) {
    const off1 = await run40(seed, false);
    const off2 = await run40(seed, false);
    ok(off1.hash === off2.hash, `seed ${seed}: off-vs-off control identical (rules out RNG flakiness)`);
    const on = await run40(seed, true);
    ok(off1.hash === on.hash, `seed ${seed}: state hash identical on/off (${off1.hash.slice(0, 12)}…, d=${off1.days}/${on.days})`);
    ok(on.iv && Array.isArray(on.iv.log), `seed ${seed}: instrument actually ran (log captured ${on.iv ? on.iv.log.length : '?'} deaths)`);
  }
}

// sabotage child: with INTRAVIOL_SABOTAGE=1 the instrument perturbs RNG ->
// hashes MUST differ, proving the equality check is sensitive.
async function sabotageChild() {
  const off = await run40(11, false);
  const on = await run40(11, true); // sabotage env inherited
  const differ = off.hash !== on.hash;
  console.log('sabotage check: hashes ' + (differ ? 'DIFFER (sensitive, as designed)' : 'IDENTICAL (BAD — check is blind)') +
    ' off=' + off.hash.slice(0, 12) + ' on=' + on.hash.slice(0, 12));
  process.exit(differ ? 0 : 3);
}

// ---------- Part C: classification on synthetic records ----------
function partC() {
  section('C. classification (synthetic records)');
  const { classifyRecord } = require('./intraviol-census-20261014');
  const refs = {
    villagerIds: new Set(['v_anna', 'v_bob', 'v_carl', 'v_you']),
    monsterNames: new Map([['highbeam deer', 1], ['hushwolf', 1], ['loud-eyes', 1]]),
    playerVessel: 'v_you',
  };
  const cases = [
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'ambush', killerId: 'v_bob', player: false },
      ['villager', 'villager', 'betrayal-ambush']],
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'Highbeam Deer', killerId: null, player: false },
      ['villager', 'monster', 'monster']],
    [{ villagerId: 'v_you', kind: 'villager', cause: 'the wild', killerId: null, player: true },
      ['player-vessel', 'none', 'injuries']],
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'combat', killerId: null, player: false,
       uprising: true, lastHit: { sourceKind: 'hostile', sourceVid: 'v_bob', sourceKey: 'h_v_bob', label: 'axe' } },
      ['villager', 'villager(hostile)', 'uprising']],
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'combat', killerId: null, player: false,
       uprising: false, betrayal: false, fight: { uprising: false, betrayal: false, counts: {} },
       lastHit: { sourceKind: 'monster', sourceKey: 'm1', sourceVid: null, label: 'bite' } },
      ['villager', 'monster', 'tb-combat']],
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'raid-defense', killerId: null, player: false },
      ['villager', 'rival-village', 'raid-defense']],
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'starvation', killerId: null, player: false },
      ['villager', 'none', 'deprivation']],
    [{ villagerId: 'v_anna', kind: 'person', cause: 'combat', killerId: 'v_you', player: false, fight: null },
      ['villager', 'player-vessel', 'combat-unattributed']],
    [{ villagerId: null, kind: 'monster', who: 'm_x', cause: 'combat', killerId: 'v_bob', player: false, fight: null },
      ['nonperson', 'villager', 'combat-unattributed']],
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'alien', killerId: 'ap_zed', player: false },
      ['villager', 'alien', 'alien-attack']],
    [{ villagerId: 'v_carl', kind: 'villager', cause: 'the phoenix link (broken)', killerId: null, player: false },
      ['villager', 'none', 'phoenix-link']],
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'combat', killerId: null, player: false, fight: null, lastHit: null },
      ['villager', 'unknown', 'combat-unattributed']],
    // classifier v2: disease, hurtVillager 'monster' label, descriptor names, fight-composition inference
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'sickness', killerId: null, player: false },
      ['villager', 'none', 'disease']],
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'monster', killerId: null, player: false },
      ['villager', 'monster', 'monster']],
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'Loud-Eyes', killerId: null, player: false },
      ['villager', 'monster', 'monster']],
    [{ villagerId: 'v_anna', kind: 'villager', cause: 'combat', killerId: null, player: false,
       uprising: false, betrayal: false,
       fight: { uprising: false, betrayal: false, counts: { player: 1, villager: 1, 'monster:dead': 2, monster: 2 } },
       lastHit: null },
      ['villager', 'monster', 'tb-combat'], true], // wantInferred
  ];
  cases.forEach(([rec, want, wantInferred], i) => {
    const got = classifyRecord(rec, refs);
    const triple = [got.victimKind, got.killerKind, got.context];
    ok(triple[0] === want[0] && triple[1] === want[1] && triple[2] === want[2] &&
       (!!got.inferredKiller === !!wantInferred),
      `case ${i + 1} (${rec.cause}/${rec.killerId || 'no-killer'}): want [${want}]${wantInferred ? '+inferred' : ''} got [${triple}]${got.inferredKiller ? '+inferred' : ''}`);
  });
}

function spawnSelf(args, env) {
  return spawnSync(process.execPath, [SCRIPT].concat(args), {
    env: Object.assign({}, process.env, env || {}),
    cwd: process.cwd(), stdio: 'inherit', timeout: 600000,
  });
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--sabotage-child')) return sabotageChild();

  if (argv.includes('--red')) {
    // RED PHASE: every assertion below must FAIL by design.
    console.log('=== RED PHASE (all of the following must fail by design) ===');
    process.env.INTRAVIOL_NOATTACH = '1';
    process.env.INTRAVIOL_BROKEN_CLASSIFIER = '1';
    const a0 = { p: PASS, f: FAIL }; await partA(); const aF = FAIL - a0.f;
    const c0 = { p: PASS, f: FAIL }; partC(); const cF = FAIL - c0.f;
    console.log('\n-- sabotage sensitivity (child, must report DIFFERENT) --');
    // NOTE: the child must NOT inherit INTRAVIOL_NOATTACH=1 from this red
    // parent, or attachIntraviol returns null and the sabotage never installs
    // (that exact leak made the first --red run report a blind check).
    const ch = spawnSelf(['--sabotage-child'], { INTRAVIOL_SABOTAGE: '1', INTRAVIOL_NOATTACH: '' });
    const sensOk = ch.status === 0;
    console.log(`RED-A failures=${aF} (need >0) | RED-C failures=${cF} (need >0) | sabotage-sensitive=${sensOk}`);
    const redOk = aF > 0 && cF > 0 && sensOk;
    console.log(redOk ? 'RED PHASE OK: every check fails exactly as designed' : 'RED PHASE BROKEN');
    process.exit(redOk ? 0 : 1);
  }

  // GREEN
  console.log('=== GREEN: intraviol instrument proof ===');
  await partA();
  await partB();
  partC();
  console.log('\n-- sabotage sensitivity (child, must report DIFFERENT) --');
  const ch = spawnSelf(['--sabotage-child'], { INTRAVIOL_SABOTAGE: '1' });
  ok(ch.status === 0, 'sabotage control: RNG-consuming instrument IS detected (hashes differ)');
  console.log(`\n=== ${PASS} passed, ${FAIL} failed ===`);
  if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }
  process.exit(FAIL ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
