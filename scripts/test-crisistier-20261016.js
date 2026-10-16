#!/usr/bin/env node
'use strict';
// test-crisistier-20261016.js — proof tests for the sim-crisistier arm
// (finding #420: raid crisis tier always wave 1).
//
// The bug: havenRaidTick raised the aid crisis with
//   wmax = max(m.wave || 1) over raiders
// but world-monster entities NEVER carry .wave (spawnWorldMonster builds
// id/hp/tiles only; the wave lives in the data def, src/data/monsters.json,
// looked up by id everywhere else). So every raid crisis was raised tier 1
// regardless of the actual raiders — and the call-for-help chain's wave>=3
// apex penalty (score -10, src/js/comms.js aidAskVillage) never applied to
// apex raids.
//
// The fix (src/js/havenGrowth.js, havenRaidTick region ONLY):
// Game.crisisWaveOf(m) looks the wave up in the data def by id (the
// raidshieldWaveOf / apexpredators speciesOf recipe). Def is authoritative;
// an entity-carried .wave is ignored (never present in practice).
//
// 1. UNIT on the lookup: reunion=4, cancellation=5, bulldozer=1, unknown=1,
//    null=1, entity-carried wave ignored.
// 2. WIRING PROBE: forced raids with fabricated wave-4/5 entities (exactly
//    what spawnWorldMonster builds — id/hp/tiles, NO .wave), raiseAidCrisis
//    stubbed to capture the wave. Pre-fix the capture is 1 (the bug);
//    post-fix it is the true wmax (5 mixed-apex, 4 wave-4-only, 1 wave-1 —
//    unchanged for wave 1).
// 3. SMOKE (SMOKE=1): 20d x {leadfeast, belongfeast} — raids still fire, no
//    crash.
// 4. DET (DET=1): identical-seed pairs, fixed tree self-consistent.
//
// Run: node scripts/test-crisistier-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 SMOKE=1 node scripts/test-crisistier-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 DET=1 node scripts/test-crisistier-20261016.js
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
    fail++; console.log(`  FAIL ${name} — threw: ${e.message}`); }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Forced raid: fabricate exactly the entities spawnWorldMonster builds
// (id/hp/tiles — never .wave), clear the wild board so the fabricated set
// are the closest to Haven, then walk havenRaidTick day-by-day until the
// 18% roll fires. raiseAidCrisis is stubbed to capture (names, wave).
async function forcedRaidCapture(ids, seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc' });
  await setupGame(Game, null, 'courtship');
  const v = Game.state.village;
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  Game.worldMonsters().length = 0;
  for (const id of ids) Game.worldMonsters().push({ id, tx: hx, ty: hy, hp: 300, maxHp: 300 });
  v.lastRaidDay = 0;
  Game.state.scholar = Game.state.scholar || {};
  const realRaise = Game.raiseAidCrisis;
  const realTableActive = Game.tableActive;
  const captured = [];
  Game.raiseAidCrisis = (names, wave) => { captured.push({ names, wave }); return null; };
  Game.tableActive = () => false;
  let days = 0;
  for (let d = 30; d <= 400 && !captured.length; d++) {
    Game.state.scholar.day = d;
    try { Game.havenRaidTick(); } catch (e) {}
    days++;
  }
  Game.raiseAidCrisis = realRaise;
  Game.tableActive = realTableActive;
  return { captured, days, ids };
}

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'mvc' });

  // ---- 1. the def lookup ----
  check('u1 reunion -> 4 (def, not entity)', () => Game.crisisWaveOf({ id: 'reunion' }) === 4);
  check('u2 cancellation -> 5 (def, not entity)', () => Game.crisisWaveOf({ id: 'cancellation' }) === 5);
  check('u3 bulldozer -> 1', () => Game.crisisWaveOf({ id: 'bulldozer' }) === 1);
  check('u4 unknown id -> 1 (safe default)', () => Game.crisisWaveOf({ id: 'nope_nothing' }) === 1);
  check('u5 null entity -> 1 (safe default)', () => Game.crisisWaveOf(null) === 1);
  check('u6 entity-carried .wave ignored — def authoritative', () =>
    Game.crisisWaveOf({ id: 'bulldozer', wave: 5 }) === 1);

  // ---- 2. the wiring probe: forced raids, captured crisis tier ----
  // Pre-fix all three capture 1 (the bug). Post-fix: 5 / 4 / 1.
  const p1 = await forcedRaidCapture(['reunion', 'cancellation', 'audit', 'eater', 'eulogy'], 5151);
  check('w1 mixed wave-4/5 raid: crisis raised tier 5', () => {
    if (!p1.captured.length) throw new Error(`raid never fired in ${p1.days}d`);
    return p1.captured[0].wave === 5;
  });
  const p2 = await forcedRaidCapture(['reunion', 'audit', 'eater', 'eulogy'], 5152);
  check('w2 wave-4-only raid: crisis raised tier 4', () => {
    if (!p2.captured.length) throw new Error(`raid never fired in ${p2.days}d`);
    return p2.captured[0].wave === 4;
  });
  const p3 = await forcedRaidCapture(['bulldozer', 'hushwolf', 'speedbump'], 5153);
  check('w3 wave-1 raid: crisis still tier 1 (unchanged)', () => {
    if (!p3.captured.length) throw new Error(`raid never fired in ${p3.days}d`);
    return p3.captured[0].wave === 1;
  });

  console.log(`\nunit+probe: ${pass} pass, ${fail} fail`);
  if (process.env.SMOKE === '1') await smokeGate();
  else if (process.env.DET === '1') await detGate();
  if (fail > 0 && !process.env.SMOKE && !process.env.DET) process.exit(1);
}

async function smokeGate() {
  console.log('\nSMOKE: 20d x {leadfeast, belongfeast}, fix live');
  let fails = 0;
  for (const policy of ['leadfeast', 'belongfeast']) {
    const { Game } = await loadGame({ seed: 777, mode: 'mvc' });
    await setupGame(Game, null, 'courtship');
    try {
      await quietLog(() => runDays(Game, TF[policy], { days: 20, manifest: { seed: 777 } }));
      console.log(`  PASS smoke ${policy}: 20d, no crash`);
    } catch (e) {
      fails++; console.log(`  FAIL smoke ${policy}: ${e.message}`);
    }
  }
  if (fails) { console.log(`SMOKE: ${fails} failures`); process.exit(1); }
  console.log('SMOKE green');
}

async function detGate() {
  // Fixed-tree self-consistency: identical seeds must be trajectory-identical
  // (the fix is deterministic — def lookup has no RNG).
  console.log('\nDET: 2 identical-seed pairs, fixed tree');
  let fails = 0;
  for (const s of [941, 942]) {
    const gate = await checkDeterminism(s, TF.leadfeast, { days: 60 });
    if (gate.identical) console.log(`  PASS det s${s}: ${gate.summary}`);
    else { fails++; console.log(`  FAIL det s${s}: ${gate.summary}`); }
  }
  if (fails) { console.log(`DET: ${fails} failures`); process.exit(1); }
  console.log('DET green');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
