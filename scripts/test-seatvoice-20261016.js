#!/usr/bin/env node
'use strict';
// scripts/test-seatvoice-20261016.js — proof for the sim-seatvoice
// diagnostic instrument (flesh-out loop, 2026-10-16). INSTRUMENT-ONLY proofs:
// the sweep itself is read-only, so the proof pins the classifier rule,
// the lib join, the composition honesty, SMOKE, and the det-gate.
//
//   1. TOPIC OVERLAY (RED→GREEN): TOPIC_FIXTURES are known answers. RED is
//      demonstrated against a stub classifier that always says "not
//      table-related" (assert at least one expected-true fixture fails —
//      the fixtures bite); GREEN is the real tableTopic() passing all.
//   2. LIB JOIN: a villager-voiced table line through the SHARED
//      villagevoice-lib classify() + tableTopic() → dialogue-with-stakes,
//      villagerBeat true, topic related. A top-down OVERTIME beat →
//      system-voice, topic related (it counts top-down, never villager).
//   3. COMPOSITION HONESTY (#389): SD.leadseat/SD.belongseat are the
//      withSeatDrive-wrapped tribfloor base (not the bare base), and
//      layerOn() is true with SEATDRIVE unset (default-ON inside the
//      wrapper). The sweep's own sanity gate (sittings>0) is the live proof.
//   4. SMOKE: sweep SMOKE mode both policies, exit 0, beats captured.
//   5. DET-GATE: sweep DET mode — instrument-on vs instrument-off
//      byte-identical trajectories (the instrument is read-only).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-seatvoice-20261016.js
const { execFileSync } = require('child_process');
const path = require('path');
const { tableTopic, TOPIC_FIXTURES } = require('./seatvoice-table-20261016');
const { classify } = require('./villagevoice-lib-20261016');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

console.log('== 1. topic overlay fixtures (RED then GREEN) ==');
// RED: stub that never fires — the fixtures must bite on it.
const stub = () => ({ related: false, reasons: [] });
const redFails = TOPIC_FIXTURES.filter((f) => stub(f.t).related !== f.rel).length;
check('RED: stub disagrees with known answers', redFails > 0, `${redFails}/${TOPIC_FIXTURES.length} stub-mismatches`);
for (const f of TOPIC_FIXTURES) {
  const got = tableTopic(f.t);
  check(`GREEN fixture: ${f.why.slice(0, 64)}`, got.related === f.rel, `want rel=${f.rel} got ${got.related} (${(got.reasons || []).join(',')}) :: ${f.t.slice(0, 90)}`);
}

console.log('== 2. lib join (speaker + topic) ==');
const names = ['Mira', 'Joren', 'Amara'];
{
  const t = 'Mira says, by the fire: "The table\'s here. Ninety dawns, they said. We just... live, until then?"';
  const c = classify(t, { names, seen: new Map(), deathDay: {}, beatDay: 95 });
  const tp = tableTopic(t);
  check('villager-voiced table line: lib cat dialogue-with-stakes', c.cat === 'dialogue-with-stakes', `got ${c.cat}`);
  check('villager-voiced table line: villagerBeat true', c.villagerBeat === true, '');
  check('villager-voiced table line: topic related', tp.related === true, '');
}
{
  const t = '◈ OVERTIME ×3 — wave 4–5 monsters return as RERUNS. Take your seat from Haven to stop the clock.';
  const c = classify(t, { names, seen: new Map(), deathDay: {}, beatDay: 95 });
  const tp = tableTopic(t);
  check('overtime beat: lib cat system-voice (top-down)', c.cat === 'system-voice', `got ${c.cat}`);
  check('overtime beat: topic related', tp.related === true, '');
  check('overtime beat: never counted villager-voiced', !(c.villagerBeat && c.cat !== 'system-voice'), '');
}
{
  const t = 'Someone saves you the good seat by the fire.';
  check('fireside furniture: topic NOT related', tableTopic(t).related === false, '');
}

console.log('== 3. composition honesty (#389) ==');
{
  const SD = require('./policies/seatdrive');
  const TF = require('./policies/tribfloor');
  check('SD.leadseat is the wrapped policy, not the bare base', SD.leadseat !== TF.leadfeast && typeof SD.leadseat.daily === 'function', '');
  check('SD.belongseat is the wrapped policy, not the bare base', SD.belongseat !== TF.belongfeast && typeof SD.belongseat.daily === 'function', '');
  check('layerOn() true with SEATDRIVE unset (default-ON inside wrapper)', SD.layerOn() === true, `SEATDRIVE=${process.env.SEATDRIVE}`);
}

console.log('== 4. SMOKE (sweep, both policies, 10d) ==');
{
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', SMOKE: '1',
  });
  delete env.DET;
  try {
    execFileSync('node', [path.join(__dirname, 'seatvoice-20261016.js')], { env, stdio: 'pipe', timeout: 600000 });
    check('sweep SMOKE exits 0', true, '');
  } catch (e) {
    check('sweep SMOKE exits 0', false, String((e.stderr || e.stdout || e.message)).slice(0, 300));
  }
}

console.log('== 5. DET-GATE (instrument-on vs off, byte-identical) ==');
{
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', DET: '1',
  });
  delete env.SMOKE;
  try {
    const out = execFileSync('node', [path.join(__dirname, 'seatvoice-20261016.js')], { env, stdio: 'pipe', timeout: 1200000 });
    check('det-gate all pairs byte-identical', /DET-GATE: all pairs byte-identical/.test(String(out)), String(out).slice(-300));
  } catch (e) {
    check('det-gate all pairs byte-identical', false, String((e.stderr || e.stdout || e.message)).slice(-400));
  }
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
