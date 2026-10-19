#!/usr/bin/env node
// scripts/test-trustdeltas-20261014.js — TRUST-DELTAS-BY-SOURCE PROOF (2026-10-14).
//
// The sim-trustdeltas arm is DIAGNOSTIC (zero game-code changes), so the
// proof is an INSTRUMENT proof with a real RED phase, plus synthetic
// fixtures for the new delta-layer math (succession decomposition, tenure
// attribution, sting ablation), then GREEN on an honest run.
//
// RED (fail if the instrument hallucinates or mis-attributes):
//   R1  fresh census, no acts            -> zero writes (silence)
//   R2  classifyDelta mixed-channel sign split: applyRep -3 -> drain side,
//       applyRep +3 -> gain side; pure channels keep r31 names
//   R3  succession decomposition fixture: office 60 / own 20 / vouch 8 ->
//       neu 40 recovered exactly, check 'ok'
//   R4  tenure below-class fixture: born-below / drained-below-mixed /
//       held-above / born-below-mixed all classified correctly
//   R5  sting ablation fixture: replay math exact, gained days = 1,
//       stingRemoved -2, replayError 0
//   R6  junk write: groundingReactionBeats -2 -> drain:relay-fray-junk
// GREEN (honest run): seed 11 leadcourt 20d ->
//   G1 every engine write classifies (zero other: survivors)
//   G2 tenures built, below-classes assigned
//   G3 sting ablation replays to replayError 0 on every tenure
//   G4 periodic-drain hunt + progressive-at-threshold run without crashing
//
// Usage: node scripts/test-trustdeltas-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installTrustCensus } = require('./trustgain-20261014');
const td = require('./trustdeltas-20261014');
const { leadcourt } = require('./policies/leadcourt');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function fakeCensus(writes, daySamples, progressive) {
  return { writes, daySamples, progressive: progressive || [], linkGains: [], bumpReasons: [] };
}

async function main() {
  let G2, c2;
  ok('actual haul-arrival delta retains the physical-work channel', td.classifyDelta({caller:'mapmemHaulAt',delta:1}) === 'gain:haul-deed');
  console.log('== R1 (RED): fresh census silence ==');
  {
    const { Game } = await loadGame({ seed: 11, mode: 'trustdeltas-proof' });
    await setupGame(Game);
    const v = Game.state.village;
    v.trust = v.trust || {};
    // Preserve the ordinary starting trust for the later honest run.
    const census = installTrustCensus(Game);
    G2 = Game; c2 = census;
    ok('R1: zero writes before any act', census.writes.length === 0, `writes=${census.writes.length}`);
  }

  console.log('== R2 (RED): classifyDelta sign split ==');
  ok('R2: applyRep -3 -> drain side', td.classifyDelta({ delta: -3, caller: 'applyRep' }) === 'gain:rep-drift-');
  ok('R2: applyRep +3 -> gain side', td.classifyDelta({ delta: 3, caller: 'applyRep' }) === 'gain:rep-drift+');
  ok('R2: takeFromPantry -2 keeps r31 name', td.classifyDelta({ delta: -2, caller: 'takeFromPantry' }) === 'drain:pantry-take-sting');
  ok('R2: playerDeath +20 keeps r31 name', td.classifyDelta({ delta: 20, caller: 'playerDeath' }) === 'set:succession-inherit');
  ok('R2: comfort +8 keeps r31 name', td.classifyDelta({ delta: 8, caller: 'comfort' }) === 'gain:grief-comfort');
  ok('R2: unknown caller still surfaces', td.classifyDelta({ delta: -1, caller: 'mysteryFn' }) === 'drain:other-mysteryFn');

  console.log('== R3 (RED): succession decomposition fixture ==');
  {
    // office entry 60 (dead bearer), successor's own entry 20, vouch +8 -> 40
    const c = fakeCensus(
      [
        { day: 1, vid: 'A', old: 50, neu: 60, delta: 10, caller: 'resolveWildMonsterEncounter' },
        { day: 2, vid: 'B', old: 20, neu: 40, delta: 20, caller: 'playerDeath' },
      ],
      [
        { day: 1, vid: 'A', scholarTrust: 60, roster: 12 },
        { day: 2, vid: 'B', scholarTrust: 40, roster: 12 },
      ]);
    const su = td.decomposeSuccessions(c);
    ok('R3: one succession found', su.length === 1, JSON.stringify(su));
    const s = su[0] || {};
    ok('R3: office recovered 60', s.office === 60, JSON.stringify(s));
    ok('R3: own recovered 20', s.own === 20, JSON.stringify(s));
    ok('R3: vouch recovered 8', s.vouch === 8, JSON.stringify(s));
    ok('R3: check ok', s.check === 'ok', JSON.stringify(s));
    ok('R3: not clamped', s.clamped === false, JSON.stringify(s));
  }

  console.log('== R4 (RED): tenure below-class fixture ==');
  {
    const samples = [
      { day: 1, vid: 'A', scholarTrust: 20, roster: 12 }, { day: 2, vid: 'A', scholarTrust: 25, roster: 12 }, { day: 3, vid: 'A', scholarTrust: 28, roster: 12 },
      { day: 4, vid: 'B', scholarTrust: 35, roster: 12 }, { day: 5, vid: 'B', scholarTrust: 32, roster: 12 }, { day: 6, vid: 'B', scholarTrust: 28, roster: 12 },
      { day: 7, vid: 'C', scholarTrust: 45, roster: 12 }, { day: 8, vid: 'C', scholarTrust: 42, roster: 12 },
      { day: 9, vid: 'D', scholarTrust: 25, roster: 12 }, { day: 10, vid: 'D', scholarTrust: 31, roster: 12 }, { day: 11, vid: 'D', scholarTrust: 20, roster: 12 },
    ];
    const c = fakeCensus(
      [
        { day: 2, vid: 'A', old: 25, neu: 23, delta: -2, caller: 'takeFromPantry' },
        { day: 5, vid: 'B', old: 32, neu: 30, delta: -2, caller: 'takeFromPantry' },
        { day: 10, vid: 'D', old: 25, neu: 31, delta: 6, caller: 'comfort' },
      ], samples);
    const ten = td.buildTenures(c, []);
    ok('R4: four tenures', ten.length === 4, `n=${ten.length}`);
    const byVid = {}; for (const t of ten) byVid[t.vid] = t;
    ok('R4: A born-below', byVid.A && byVid.A.belowClass === 'born-below', byVid.A && byVid.A.belowClass);
    ok('R4: B drained-below-mixed', byVid.B && byVid.B.belowClass === 'drained-below-mixed', byVid.B && byVid.B.belowClass);
    ok('R4: C held-above', byVid.C && byVid.C.belowClass === 'held-above', byVid.C && byVid.C.belowClass);
    ok('R4: D born-below-mixed', byVid.D && byVid.D.belowClass === 'born-below-mixed', byVid.D && byVid.D.belowClass);
    ok('R4: A sting drain attributed', byVid.A.drainByChannel['drain:pantry-take-sting'] === -2, JSON.stringify(byVid.A.drainByChannel));
    ok('R4: D comfort gain attributed', byVid.D.gainByChannel['gain:grief-comfort'] === 6, JSON.stringify(byVid.D.gainByChannel));
  }

  console.log('== R5 (RED): sting ablation fixture ==');
  {
    // Start-of-day samples (sampleDay runs before the day's writes).
    // d1 start 29, +2 -> 31; d2 start 31, sting -2 -> 29; d3 start 29, no writes.
    // Without the sting: 31, 31, 31 -> d2 and d3 recovered. gained = 2.
    const samples = [
      { day: 1, vid: 'A', scholarTrust: 29, roster: 12 }, { day: 2, vid: 'A', scholarTrust: 31, roster: 12 }, { day: 3, vid: 'A', scholarTrust: 29, roster: 12 },
    ];
    const c = fakeCensus(
      [
        { day: 1, vid: 'A', old: 29, neu: 31, delta: 2, caller: 'resolveWildMonsterEncounter' },
        { day: 2, vid: 'A', old: 31, neu: 29, delta: -2, caller: 'takeFromPantry' },
      ], samples);
    const ten = td.buildTenures(c, []);
    const ab = td.ablateSting(ten[0]);
    ok('R5: gained exactly 2 days>=30', ab.gained === 2, JSON.stringify(ab));
    ok('R5: stingRemoved -2', ab.stingRemoved === -2, JSON.stringify(ab));
    ok('R5: replayError 0 (replay matches samples)', ab.replayError === 0, JSON.stringify(ab));
    ok('R5: actualDaysAbove 1', ab.actualDaysAbove === 1, JSON.stringify(ab));
    ok('R5: ablatedDaysAbove 3', ab.ablatedDaysAbove === 3, JSON.stringify(ab));
  }

  console.log('== R5b (RED): ablation skips set: writes (no double-count) ==');
  {
    // A succession SET (+25) inside the tenure's writes must NOT replay:
    // startTrust is already post-SET. Replaying it would inflate both
    // streams; net-negative SETs deflated the ablated stream (the -458 bug).
    const samples = [
      { day: 1, vid: 'A', scholarTrust: 40, roster: 12 }, { day: 2, vid: 'A', scholarTrust: 38, roster: 12 },
    ];
    const c = fakeCensus(
      [
        { day: 1, vid: 'A', old: 15, neu: 40, delta: 25, caller: 'playerDeath' }, // SET, must not replay
        { day: 2, vid: 'A', old: 40, neu: 38, delta: -2, caller: 'takeFromPantry' },
      ], samples);
    const ten = td.buildTenures(c, []);
    const ab = td.ablateSting(ten[0]);
    // actual: d1 40>=30, d2 38>=30 -> 2. ablated (no sting, no SET replay): 40, 40 -> 2. gained 0.
    ok('R5b: SET not double-counted (gained 0)', ab.gained === 0 && ab.ablatedDaysAbove === 2, JSON.stringify(ab));
    ok('R5b: replayError 0', ab.replayError === 0, JSON.stringify(ab));
  }

  console.log('== R3b (RED): decomposition picks the largest-|delta| SET ==');
  {
    // The death flow emits small playerDeath-caller writes (+1 noise); the
    // SET is the big jump. First-match would take the +1.
    const c = fakeCensus(
      [
        { day: 4, vid: 'B', old: 36, neu: 37, delta: 1, caller: 'playerDeath' },
        { day: 5, vid: 'B', old: 90, neu: 37, delta: -53, caller: 'playerDeath' },
        { day: 5, vid: 'B', old: 37, neu: 38, delta: 1, caller: 'playerDeath' },
      ],
      [
        { day: 4, vid: 'A', scholarTrust: 60, roster: 12 },
        { day: 5, vid: 'B', scholarTrust: 37, roster: 12 },
      ]);
    const su = td.decomposeSuccessions(c);
    ok('R3b: one succession', su.length === 1, JSON.stringify(su));
    ok('R3b: picked the -53 SET, not the +1', su[0] && su[0].neu === 37 && su[0].own === 90, JSON.stringify(su[0]));
  }
  ok('R6: groundingReactionBeats -2 -> drain:relay-fray-junk',
    td.classifyDelta({ delta: -2, caller: 'groundingReactionBeats' }) === 'drain:relay-fray-junk');
  ok('R6: crowdingTick -1 -> drain:overcrowding',
    td.classifyDelta({ delta: -1, caller: 'crowdingTick' }) === 'drain:overcrowding');
  ok('R6: tickNeeds -2 -> drain:ignored-ask',
    td.classifyDelta({ delta: -2, caller: 'tickNeeds' }) === 'drain:ignored-ask');

  // Exact boundaries exclude pre-bearer gains, not just the SET itself.
  {
    const c=fakeCensus([{day:1,vid:'B',old:10,neu:24,delta:14,caller:'applyRep'},{day:1,vid:'B',old:24,neu:30,delta:6,caller:'playerDeath'},{day:1,vid:'B',old:30,neu:28,delta:-2,caller:'takeFromPantry'}],[{day:1,vid:'B',scholarTrust:30,writeIndex:2},{day:1,vid:'B',scholarTrust:28,writeIndex:3},{day:2,vid:'B',scholarTrust:28,writeIndex:3}]);
    const t=td.buildTenures(c,[])[0],a=td.ablateSting(t);
    ok('exact snapshots exclude NPC-era gain and already-priced inheritance',t.writes.length===1&&t.writes[0].delta===-2);
    ok('same-day snapshots replay the sting only once',a.replayError===0&&a.continuityErrors===0&&a.sampleBoundariesKnown);
    ok('multiple observations count each calendar day once',a.actualDaysAbove===0&&a.ablatedDaysAbove===2&&a.gained===2);
  }
  {
    const c=fakeCensus([{day:1,vid:'A',old:29,neu:31,delta:2,caller:'comfort'},{day:2,vid:'A',old:31,neu:29,delta:-2,caller:'takeFromPantry'}],[{day:1,vid:'A',scholarTrust:29,writeIndex:0},{day:2,vid:'A',scholarTrust:31,writeIndex:1},{day:3,vid:'A',scholarTrust:29,writeIndex:2}]);
    const a=td.ablateSting(td.buildTenures(c,[])[0]);
    ok('counterfactual and actual thresholds use matching observed moments',a.replayError===0&&a.actualDaysAbove===1&&a.ablatedDaysAbove===2&&a.gained===1);
  }
  {
    const c=fakeCensus([{day:1,vid:'A',old:29,neu:31,delta:2,caller:'comfort'}],[{day:1,vid:'A',scholarTrust:31,writeIndex:1},{day:2,vid:'A',scholarTrust:29,writeIndex:0}]);
    const t=td.buildTenures(c,[])[0],a=td.ablateSting(t);
    ok('backward write boundaries cannot produce a counterfactual',!t.sampleBoundariesKnown&&a.invalidSampleBoundaries&&a.gained===null&&a.replayError===null);
    t.invalidSampleBoundaries=false;t.sampleBoundariesKnown=false;t.startTrust=null;
    const unknown=td.ablateSting(t);
    ok('unknown legacy starting trust remains unknown',unknown.unknownStart&&unknown.gained===null&&unknown.replayError===null);
  }
  console.log('== GREEN on honest run: seed 11 leadcourt 20d ==');
  // One shared harness in this process; synthetic fixtures above do not
  // alter the real world used for this honest run.
  const policy = Object.assign({}, leadcourt);
  const origDaily = leadcourt.daily;
  policy.daily = (G, ctx) => {
    try { c2.reproxy(); c2.sampleDay(); } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  if (leadcourt.setup) { const s = leadcourt.setup; policy.setup = (G, ctx) => { try { c2.reproxy(); } catch (e) {} return s(G, ctx); }; }
  else policy.setup = () => { try { c2.reproxy(); } catch (e) {} };
  let r;
  await quietLog(async () => { r = await runDays(G2, policy, { days: 20 }); });
  c2.sampleDay();
  ok('G0: run completed', !!r && r.days > 0, `days=${r && r.days}`);
  ok('G0: writes captured', c2.writes.length > 0, `writes=${c2.writes.length}`);
  const scholarDayMap = new Map(c2.daySamples.map(s => [s.day, String(s.vid)]));
  const vd = c2.daySamples.reduce((t, s) => t + s.roster, 0);
  const rows = td.rankDeltas(c2, scholarDayMap, vd);
  const othersH = rows.filter(x => x.channel.indexOf('other:') === 0 && x.channel !== 'other:delete');
  ok('G1: honest run fully classified (zero other: survivors)', othersH.length === 0,
    othersH.map(x => x.channel + ' x' + x.fires).join(', '));
  const su = td.decomposeSuccessions(c2);
  const ten = td.buildTenures(c2, su);
  ok('G2: tenures built with below-classes', ten.length > 0 && ten.every(t => !!t.belowClass),
    `tenures=${ten.length} classes=${ten.map(t => t.belowClass).join(',')}`);
  let maxReplayErr = 0;
  let boundariesValid = true;
  for (const t of ten) {
    const ab = td.ablateSting(t);
    boundariesValid = boundariesValid && ab.sampleBoundariesKnown && ab.replayError !== null && ab.continuityErrors === 0;
    if (ab.replayError > maxReplayErr) maxReplayErr = ab.replayError;
    if (ab.replayError) console.log("Replay diagnostic", JSON.stringify({vid:t.vid,start:t.startTrust,end:t.endTrust,days:t.days,writes:t.writes}));
  }
  ok('G3: sting ablation replay faithful on every tenure', maxReplayErr === 0 && boundariesValid, `maxReplayErr=${maxReplayErr}; exact continuous boundaries=${boundariesValid}`);
  let huntOk = false, progOk = false;
  try { const h = td.huntPeriodicDrains(c2, scholarDayMap); huntOk = Array.isArray(h); } catch (e) { console.log('  hunt threw: ' + e.message); }
  try { const p = td.progressiveAtThreshold(c2, scholarDayMap); progOk = !!p['<30']; } catch (e) { console.log('  prog threw: ' + e.message); }
  ok('G4: periodic-drain hunt runs', huntOk);
  ok('G4: progressive-at-threshold runs', progOk);
  console.log('  honest channels: ' + rows.slice(0, 8).map(x => `${x.channel} +${x.pos.toFixed(0)}/${x.neg.toFixed(0)} x${x.fires}`).join(' | '));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(1); });
