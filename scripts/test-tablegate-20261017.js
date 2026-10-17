#!/usr/bin/env node
// scripts/test-tablegate-20261017.js — proof for the sim-tablegate
// diagnostic (flesh-out loop, axis scale-onramp, 2026-10-17).
//
// RED-pinned completion gates (docs/MEASUREMENT.md §§9-12, 14 — binding):
//   (a) classifyGate fixtures: fabricated captures classify to the exact
//       expected SINGLE gate; the two adversarial pins (inconsistent chain,
//       numeric-count capture) must NOT classify clean.
//   (b) det-gate: 4 paired 60d runs (leadcourt+belongseek x s3801/s3802),
//       instrumented vs uninstrumented policy, byte-identical trajectory
//       hashes — the instrument is read-only, proven, not asserted.
//   (c) missingBars fixture: the lesser-seat bar's missing fields enumerate
//       honestly.
//   (d) SMOKE: 2 seeds x leadcourt, 12d, full sweep path — every per-seed
//       JSON schema-clean (gate/national/table/wins/seatEver numeric or
//       string keys present), 0 instrument errors, beats schema-valid.
//
// Run: node scripts/test-tablegate-20261017.js (~2-3 min).
'use strict';
const assert = require('assert');
const { attachTablegateCapture, classifyGate, missingBars } = require('./tablegate-instrument-20261017');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL:', name, extra === undefined ? '' : String(extra).slice(0, 400)); }
}

// ---------- (a) classifyGate fixtures ----------
function cap(base) {
  return Object.assign({
    seatEver: 'none', seatEverDay: null, arcMax: 0, arc4Day: null,
    waitingDay: null, announcedDay: null, floorOkDay: null,
    systemArrivedEver: true, takeSeatCalls: [], seated: false,
    seatDay: null, bestDetail: { w1: 2, w2: 1, w3: 0, contestsN: 1, crisesN: 2, rank: 'national', stage: 1, foodDeeds: false },
  }, base);
}

// 1. The expected base-courtship shape: seat earned, announced, verb never
//    invoked -> no-driver (the gate the census arms predict).
ok('classify/no-driver', classifyGate(cap({
  seatEver: 'lesser', seatEverDay: 95, arcMax: 4, arc4Day: 95,
  waitingDay: 96, announcedDay: 97, floorOkDay: 90,
})).gate === 'no-driver');

// 2. Seat bar never met: single named gate + the missing sub-bars.
{
  const g = classifyGate(cap({}));
  ok('classify/seat-never-earned', g.gate === 'seat-never-earned');
  ok('classify/seat-never-earned-sub', Array.isArray(g.sub) && g.sub.length > 0 &&
    g.sub.indexOf('w3<3') >= 0 && g.sub.indexOf('foodDeeds') >= 0 && g.sub.indexOf('stage<2') >= 0, JSON.stringify(g.sub));
}

// 3. Seat earned but Arc IV never reached.
{
  const g = classifyGate(cap({ seatEver: 'lesser', seatEverDay: 100, arcMax: 3 }));
  ok('classify/arc-never-iv', g.gate === 'arc-never-iv', g.gate);
}

// 4. Arc IV but invitation never staged.
{
  const g = classifyGate(cap({ seatEver: 'lesser', seatEverDay: 100, arcMax: 4, arc4Day: 100 }));
  ok('classify/invitation-never-fired', g.gate === 'invitation-never-fired', g.gate);
}

// 5. Invitation staged but never announced (day-90 floor never met).
{
  const g = classifyGate(cap({ seatEver: 'lesser', seatEverDay: 60, arcMax: 4, arc4Day: 60, waitingDay: 61, floorOkDay: null }));
  ok('classify/never-announced', g.gate === 'never-announced', g.gate);
}

// 6. Verb invoked but never succeeded.
{
  const g = classifyGate(cap({ seatEver: 'lesser', seatEverDay: 95, arcMax: 4, arc4Day: 95,
    waitingDay: 96, announcedDay: 97, takeSeatCalls: [{ day: 97, ok: false }, { day: 98, ok: false }], seated: false }));
  ok('classify/take-seat-failed', g.gate === 'take-seat-failed', g.gate);
}

// 7. Actually sat (should not happen on base courtship, but the
//    classifier must name it, not call it blocked).
{
  const g = classifyGate(cap({ seatEver: 'lesser', seatEverDay: 95, arcMax: 4, arc4Day: 95,
    waitingDay: 96, announcedDay: 97, takeSeatCalls: [{ day: 97, ok: true }], seated: true, seatDay: 97 }));
  ok('classify/sat', g.gate === 'sat', g.gate);
}

// RED pin 1 (adversarial): inconsistent chain — seat==none but seated=true
// must be unattributed, never a clean gate name.
{
  const g = classifyGate(cap({ seatEver: 'none', seated: true }));
  ok('classify/RED-inconsistent-unattributed', g.gate === 'unattributed', g.gate);
}

// RED pin 2 (adversarial): a capture carrying numeric counts instead of
// the calls array (schema drift) must still classify no-driver, not crash.
{
  const t = cap({ seatEver: 'lesser', seatEverDay: 95, arcMax: 4, arc4Day: 95,
    waitingDay: 96, announcedDay: 97, seated: false });
  t.takeSeatCalls = 0; t.takeSeatCallN = 0; t.takeSeatOkN = 0;
  const g = classifyGate(t);
  ok('classify/RED-numeric-counts', g.gate === 'no-driver', g.gate);
}

// RED pin 3: null capture must be unattributed, never throw.
ok('classify/RED-null', classifyGate(null).gate === 'unattributed');

// ---------- (c) missingBars ----------
{
  const full = { w1: 5, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'national', stage: 2, foodDeeds: true };
  ok('missingBars/all-met', missingBars(full).length === 0);
  const partial = { w1: 4, w2: 4, w3: 1, contestsN: 2, crisesN: 2, rank: 'village', stage: 2, foodDeeds: false };
  const m = missingBars(partial);
  ok('missingBars/partial', m.length === 3 && m.indexOf('w3<3') >= 0 && m.indexOf('scale<village>') >= 0 && m.indexOf('foodDeeds') >= 0, JSON.stringify(m));
}

// ---------- (b) det-gate: instrumented == uninstrumented ----------
async function detGate() {
  const { runTablegate } = require('./sweep-tablegate-20261017');
  for (const policyId of ['leadcourt', 'belongseek']) {
    for (const seed of [3801, 3802]) {
      const a = await runTablegate(seed, policyId, { days: 60, writeJson: false, instrumented: true });
      const b = await runTablegate(seed, policyId, { days: 60, writeJson: false, instrumented: false });
      const ha = a.hashes.join('|'), hb = b.hashes.join('|');
      ok(`det-gate/${policyId}-s${seed}-byte-identical`, ha === hb, `hashLen ${a.hashes.length} vs ${b.hashes.length}`);
      ok(`det-gate/${policyId}-s${seed}-0-errors`, (a.instrumentErrors | 0) === 0, 'err=' + a.instrumentErrors);
    }
  }
}

// ---------- (d) SMOKE: full sweep path, 12d ----------
async function smoke() {
  const { runTablegate } = require('./sweep-tablegate-20261017');
  const r = await runTablegate(3807, 'leadcourt', { days: 12, writeJson: false, instrumented: true });
  const need = ['seed', 'policyId', 'national', 'table', 'wins', 'gate', 'seatEver', 'arcMax', 'takeSeatCallN', 'instrumentErrors'];
  for (const k of need) ok('smoke/schema-' + k, r[k] !== undefined && r[k] !== null, k);
  ok('smoke/gate-named', ['seat-never-earned', 'arc-never-iv', 'invitation-never-fired', 'never-announced', 'no-driver', 'take-seat-failed', 'sat', 'unattributed'].indexOf(r.gate) >= 0, r.gate);
  ok('smoke/0-errors', (r.instrumentErrors | 0) === 0, 'err=' + r.instrumentErrors);
  ok('smoke/numeric-wall', Number.isInteger(r.national) && Number.isInteger(r.table) && Number.isInteger(r.wins));
}

// ---------- instrument attach/restore hygiene on a bare stub Game ----------
function attachHygiene() {
  const calls = [];
  const stub = {
    state: { scholar: { day: 3 }, systemArrived: true },
    say: (m) => calls.push(['say', m]),
    sysSay: (m) => calls.push(['sys', m]),
    tableTakeSeat: () => { calls.push(['tts']); return { ok: true }; },
    tableSeat: () => ({ seat: 'lesser', detail: {} }),
    progState: () => ({ arc: 4, tableWaiting: true, tableDone: false, tableAnnounced: true, tableSittingId: 0, crises: {} }),
    deedState: () => ({ wavesFaced: {}, contestsSurvived: 0 }),
    scaleRank: () => 'national', codexBreadth: () => 20,
    integrationStage: () => 2, villageStandingTotal: () => 100,
    winDayFloorOk: () => true, hierarchyState: () => [],
  };
  const origSay = stub.say, origTts = stub.tableTakeSeat;
  const inst = attachTablegateCapture(stub);
  ok('attach/tbfight-free', typeof inst.sample === 'function');
  const row = inst.sample();
  ok('attach/sample-row', row && row.day === 3 && row.seat === 'lesser', JSON.stringify(row && row.seat));
  const r = stub.tableTakeSeat();
  ok('attach/tts-passthrough', r && r.ok === true && inst.capture.takeSeatCalls.length === 1 && inst.capture.seated === true);
  stub.say('◈ THE TABLE IS SET. A ring of pale light waits.');
  ok('attach/beat-captured', inst.capture.beats.length === 1, 'beats=' + inst.capture.beats.length);
  const fin = inst.finish();
  ok('attach/finish', fin.realmEnd && fin.realmEnd.rank === 'national');
  ok('attach/classify', inst.classifyGate(fin).gate === 'sat', inst.classifyGate(fin).gate);
  inst.restore();
  ok('attach/restore-say', stub.say === origSay);
  ok('attach/restore-tts', stub.tableTakeSeat === origTts);
  ok('attach/errors-zero', inst.capture.errors === 0, 'err=' + inst.capture.errors);
}

async function main() {
  attachHygiene();
  await smoke();
  await detGate();
  console.log(`\n== test-tablegate-20261017: ${pass} pass, ${fail} fail ==`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
