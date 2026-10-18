#!/usr/bin/env node
// test-rackscap-b.js — SMOKE-RACKS CAPACITY proof test (sim-rackscap-b).
//
// The arm: RACKSCAP_B=1 (env-gated, default OFF) doubles the duty-time cook
// drive's rackCap (125 -> 250 multiplier at game.js:6635) so freed fresh can
// move into smoked-and-eaten stock instead of rotting at the racks-full beat.
//
// Fixture: pinned pantry — preserved stock sits BETWEEN the gate-off cap
// (125*roster*13) and the gate-on cap (250*roster*13); a big fresh stack is
// about to rot (spoilDay = day+1).
//   RED (RACKSCAP_B unset, any code): the racks stay shut — no new preserved
//     kcal, narration reads "racks are already full".
//   GREEN (RACKSCAP_B=1, gated code): the cook smokes through the old cap —
//     preserved kcal rises by ~0.80x the 4000 budget, narration reads
//     "worked the smoke racks".
//   On PRISTINE game.js this script FAILS (RED: gate-on changes nothing).
// Invariants: gate-off is deterministic (two identical fixtures -> identical
// pantry digests); the fixture cook has preserver skill 0 (ownShelf=15,
// factor 13) so the cap math is pinned.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function preservedKcal(v) {
  return (v.pantry || []).reduce((t, it) =>
    t + ((it && (it.foodState === 'preserved' || it.foodState === 'rendered')) ? (it.kcalEach || 0) * (it.units || 1) : 0), 0);
}
function pantryDigest(v) {
  return JSON.stringify((v.pantry || []).map(it =>
    [it.name, it.kcalEach, it.units, it.foodState, it.spoilDay].join('|')).sort());
}

async function fixture() {
  const { Game } = await loadGame({ seed: 4242, mode: 'proof-rackscap', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  // A cook with preserver skill 0 -> ownShelf = 15 -> shelf factor 13.
  const roster = v.roster || [];
  let vid = null;
  for (const id of roster) {
    try {
      const p = Game.getPerson ? Game.getPerson(id) : null;
      if (p && Game.specialistSkill && Game.specialistSkill(p, 'preserver') === 0) { vid = id; break; }
    } catch (e) {}
  }
  if (!vid) vid = roster[0];
  const n = roster.length || 10;
  const capOff = 125 * n * 13;
  const capOn = 250 * n * 13;
  const P = Math.round(capOff + (capOn - capOff) * 0.5); // strictly between
  v.pantry = [
    { name: 'Smoked deer', foodKind: 'meat', foodState: 'preserved',
      kcalEach: 100, units: Math.round(P / 100), spoilDay: day + 30, safe: true },
    { name: 'Fresh venison', foodKind: 'meat', foodState: 'fresh',
      kcalEach: 200, units: 60, spoilDay: day + 1, safe: false },
  ];
  const lines = [];
  Game.say = (s) => { lines.push(String(s)); };
  const before = preservedKcal(v);
  Game.resolveOneAssignment(vid, { task: 'cook' });
  const after = preservedKcal(v);
  return { Game, v, day, n, vid, capOff, capOn, before, after, lines,
           digest: pantryDigest(v) };
}

(async () => {
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };

  // ---------- gate off: racks stay shut ----------
  delete process.env.RACKSCAP_B;
  const off = await fixture();
  check('off: preserved stock pinned between caps',
    off.before >= off.capOff && off.before < off.capOn);
  check('off: racks stay shut (no new preserved kcal)', off.after === off.before);
  check('off: narration says racks are already full',
    off.lines.some(l => /racks are already full/.test(l)));

  // ---------- gate on: doubled cap smokes ----------
  process.env.RACKSCAP_B = '1';
  const on = await fixture();
  check('on: preserved stock pinned between caps',
    on.before >= on.capOff && on.before < on.capOn);
  check('on: cook smokes through the old cap (preserved kcal rises)',
    on.after > on.before);
  check('on: preserved gain ~= 0.80x of the 4000 budget (+-25%)',
    (on.after - on.before) >= 2400 && (on.after - on.before) <= 4000);
  check('on: narration says worked the smoke racks',
    on.lines.some(l => /worked the smoke racks/.test(l)));
  delete process.env.RACKSCAP_B;

  // ---------- determinism: gate-off fixtures are identical ----------
  const d1 = (await fixture()).digest;
  const d2 = (await fixture()).digest;
  check('off: two identical fixtures -> identical pantry digests', d1 === d2);

  console.log(fail ? `PROOF FAIL (${fail})` : 'PROOF GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });
