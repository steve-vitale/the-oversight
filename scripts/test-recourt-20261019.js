#!/usr/bin/env node
// test-recourt-20261019.js — proof for the sim-recourt instrument
// (flesh-out loop arm sim-recourt, run fleshout-20261019T2115Z, axis
// scale-onramp).
//
// Proves:
//   1. The analyzer's death-mode naming measures what it claims (fixtures):
//      nameReset maps breakLink's history note to the bond-death cause;
//      bondDeath finds the re-court (latest-fday upward link) and names its
//      end: neglect-snap (day-exact), walked, or active-at-village-death;
//      villageDeath names the village-lost path (scattering / extinction /
//      no-successor) from endFlags + engine-verbatim fiction; attribute()
//      fails closed to 'unexplained' when nothing is named.
//      RED=1 runs one fixture against a deliberately WRONG expectation to
//      show the test discriminates (RED-verified).
//   2. The village-snap extraction reads what it claims: a fixture fake
//      Game with known pantry/hungryDays/roster yields the expected series
//      row (pantry, hungryDays, scattered, extinct, living/roster,
//      scholarAlive, vid).
//   3. The say-log filter captures death-relevant fiction and ignores the
//      rest: a fixture fake Game.say log yields only keyword matches.
//   4. The DET gate: instrument-on vs instrument-off byte-identical
//      trajectories (mirrors the seasonblock det-gate pattern: bare x2 +
//      live x2 on 3 seeds x 1 policy x 60d via the probe's DET mode).
'use strict';
const { execSync } = require('child_process');
const path = require('path');
const A = require('./analyze-recourt-20261019');
const P = require('./probe-recourt-20261019');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; }
  else { fail++; console.log(`  FAIL ${name}: got ${g}, want ${w}`); }
}
function ok(name, cond) {
  if (cond) pass++; else { fail++; console.log(`  FAIL ${name}`); }
}

const RED = process.env.RED === '1';

// --- 1a. nameReset fixtures: breakLink's history note names the cause ---
eq('reset walked -> walk', A.nameReset('Link broken (walked).'), RED ? 'neglect-snap' : 'walk');
eq('reset succession -> neglect-snap', A.nameReset('Link broken (succession).'), 'neglect-snap');
eq('reset revolt -> other', A.nameReset('Link broken (revolt).').slice(0, 5), 'other');

// --- 1b. bondDeath fixtures: the re-court is the latest-fday upward link ---
function synthLinkDump(links) {
  return links.map(L => ({
    id: 'link_' + L.prim, st: L.st, prim: L.prim, sub: 'haven', kind: null,
    fday: L.fday, endTrust: L.endTrust,
    history: [{ day: L.fday, kind: 'formed', note: 'formed' }].concat(
      L.brokenNote ? [{ day: L.brokenDay, kind: 'broken', note: L.brokenNote }] : []),
  }));
}
// Fixture A: bond1 walked d55 (age 35), re-court f57 still active at village
// death d86, age 29, trust 15 -> active-at-village-death.
{
  const run = {
    gameDays: 86,
    linkDump: synthLinkDump([
      { prim: 'old', st: 'broken', fday: 20, endTrust: 70, brokenNote: 'Link broken (walked).', brokenDay: 55 },
      { prim: 'new', st: 'active', fday: 57, endTrust: 15 },
    ]),
  };
  const b = A.bondDeath(run);
  eq('bondDeath re-court selected (latest fday)', b.prim, 'new');
  eq('bondDeath active-at-village-death', b.mode, 'active-at-village-death');
  eq('bondDeath age 29', b.age, 29);
  eq('bondDeath day = village death day', b.day, 86);
}
// Fixture B: re-court f57 broken d149 by the succession neglect snap.
{
  const run = {
    gameDays: 150,
    linkDump: synthLinkDump([
      { prim: 'old', st: 'broken', fday: 20, endTrust: 100, brokenNote: 'Link broken (walked).', brokenDay: 57 },
      { prim: 'new', st: 'broken', fday: 57, endTrust: 0, brokenNote: 'Link broken (succession).', brokenDay: 149 },
    ]),
  };
  const b = A.bondDeath(run);
  eq('bondDeath neglect-snap', b.mode, 'neglect-snap');
  eq('bondDeath snap day-exact', b.day, 149);
  eq('bondDeath snap age', b.age, 92);
}
// Fixture C: no upward bond -> no-upward-bond (honest, not a death mode).
{
  const b = A.bondDeath({ gameDays: 180, linkDump: [] });
  eq('bondDeath no bond', b.mode, 'no-upward-bond');
}

// --- 1c. villageDeath fixtures: endFlags + engine-verbatim fiction ---
// Fixture D: scattered + the scattering line -> scattering.
{
  const run = {
    gameDays: 83, endReason: 'village-lost',
    endFlags: { scattered: true, extinct: false, scholarDead: false },
    sayLog: [{ day: 83, text: 'Haven couldn\'t hold. On the third hungry day, people started walking — in different directions. The scattering, again.' }],
  };
  const v = A.villageDeath(run);
  eq('villageDeath scattering', v.mode, 'scattering');
  eq('villageDeath day', v.day, 83);
  ok('villageDeath fiction captured', v.fiction && /scattering, again/.test(v.fiction.text));
}
// Fixture E: extinct + the extinction line -> extinction.
{
  const run = {
    gameDays: 86, endReason: 'village-lost',
    endFlags: { scattered: false, extinct: true, scholarDead: false },
    sayLog: [{ day: 86, text: 'Nobody is left. Not scattered, not gone looking for food — dead, every one, and the fire has nobody left to warm. The village ends here, the way villages end when the teeth find them first.' }],
  };
  const v = A.villageDeath(run);
  eq('villageDeath extinction', v.mode, 'extinction');
}
// Fixture F: scholar dead + no-successor line -> no-successor.
{
  const run = {
    gameDays: 90, endReason: 'village-lost',
    endFlags: { scattered: false, extinct: false, scholarDead: true },
    sayLog: [{ day: 90, text: 'No one is left to pick up the Codex. The village dies out — quietly, the way villages do. The season ends here.' }],
  };
  const v = A.villageDeath(run);
  eq('villageDeath no-successor', v.mode, 'no-successor');
}
// Fixture G: nothing fires -> unexplained (fails closed, not a friendly bar).
{
  const run = { gameDays: 90, endReason: 'village-lost', endFlags: {}, sayLog: [] };
  eq('villageDeath unexplained (fails closed)', A.villageDeath(run).mode, 'unexplained');
}
// Fixture H: attribute() on a full synthetic re-court run -> GO.
{
  const run = {
    seed: 64201, policyId: 'belongfeast', gameDays: 86, endReason: 'village-lost',
    endFlags: { scattered: false, extinct: true, scholarDead: false },
    sayLog: [{ day: 86, text: 'Nobody is left. Not scattered, not gone looking for food — dead, every one.' }],
    linkDump: synthLinkDump([
      { prim: 'old', st: 'broken', fday: 20, endTrust: 70, brokenNote: 'Link broken (walked).', brokenDay: 55 },
      { prim: 'new', st: 'active', fday: 57, endTrust: 15 },
    ]),
    vday: [], flows: [], deathsFull: [], successionDays: [],
  };
  const a = A.attribute(run);
  eq('attribute verdict bond', a.verdict.bond.mode, 'active-at-village-death');
  eq('attribute verdict village', a.verdict.village.mode, 'extinction');
  eq('attribute unexplained false', a.unexplained, false);
}

// --- 2. villageSnap extraction fixture: fake Game, known values ---
{
  const fake = {
    state: {
      scholar: { day: 83 },
      village: {
        roster: ['v1', 'v2', 'v3'],
        rosterChars: { v1: { alive: true }, v2: { alive: false }, v3: { alive: true } },
        hungryDays: 2, scattered: false, extinct: false,
      },
    },
    pantryKcalLive: () => 522,
    progState: () => ({ hungryStreak: 2 }),
    unlockedWave: () => 3,
    villagerId: 'v1',
  };
  const s = P.villageSnap(fake);
  eq('snap pantry', s.pantry, 522);
  eq('snap hungryDays', s.hungryDays, 2);
  eq('snap living/roster', [s.living, s.roster], [2, 3]);
  eq('snap scholarAlive', s.scholarAlive, true);
  eq('snap not scattered', s.scattered, false);
  eq('snap vid', s.vid, 'v1');
  eq('snap wave', s.uw, 3);
}

// --- 3. say-log filter fixture: captures death fiction, ignores the rest ---
{
  const said = [];
  const fake = {
    state: { scholar: { day: 83 } },
    say(x) { said.push(String(x)); return x; },
  };
  const C = { instrumentErrors: 0 };
  P.installSayCapture(fake, C);
  fake.say('The pantry is full and the sun is warm.');
  fake.say('Haven couldn\'t hold. On the third hungry day, people started walking — in different directions. The scattering, again.');
  fake.say('Yara Haddad is dead — combat. The village stops.');
  fake.say('A quiet day. Nothing much happened.');
  eq('saylog captures 2 of 4', C.sayLog.length, 2);
  ok('saylog captures the scattering', C.sayLog.some(s => /scattering/.test(s.text)));
  ok('saylog captures the death', C.sayLog.some(s => /dead — combat/.test(s.text)));
  ok('saylog carries day-exact stamps', C.sayLog.every(s => s.day === 83));
  eq('saylog instrument errors', C.instrumentErrors, 0);
  eq('say-through unchanged', said.length, 4);
}

// --- 4. DET gate: instrument-on vs instrument-off byte-identical ---
{
  console.log('  DET gate: running probe DET (3 seeds x 60d)...');
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
    WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1', KILLDISC: '1', DET: '1',
  });
  delete env.SMOKE; delete env.SEEDS; delete env.DAYS;
  try {
    const script = path.join(__dirname, 'probe-recourt-20261019.js');
    const out = execSync(`node "${script}"`, { cwd: path.join(__dirname, '..'), env, timeout: 600000, encoding: 'utf8' });
    const okAll = /DET: ALL PASS/.test(out);
    ok('DET gate ALL PASS', okAll);
    if (!okAll) console.log('  DET output:\n' + out.split('\n').slice(0, 12).join('\n'));
  } catch (e) {
    fail++; console.log('  FAIL DET gate: probe exited non-zero');
    console.log(String((e.stdout || '') + (e.stderr || '')).split('\n').slice(0, 12).join('\n'));
  }
}

console.log(`\ntest-recourt: ${pass} pass, ${fail} fail${RED ? ' (RED mode: the deliberately-wrong fixture above must FAIL)' : ''}`);
process.exit(fail ? 1 : 0);
