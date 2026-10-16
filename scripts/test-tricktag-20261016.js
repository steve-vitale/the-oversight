#!/usr/bin/env node
// test-tricktag-20261016.js — proof record for the sim-tricktag arm
// (axis scale-onramp): fix finding #405 — TB-path kills tag via='player'
// even when a villager COMPANION lands the killing blow.
//
// What changed (game code, src/js/game.js only):
//   1. tbDamage's death block stamps t._tbKilledBy with the killing blow's
//      source ('p' for the scholar — 'p'/'player'/null+'you' conventions —
//      else the raw sourceKey; monster-on-monster and 0-final finishers
//      leave it unset). Additive underscore field on the per-fight fighter
//      object; no behavior change. TRICKTAG_OFF=1 disables the stamp.
//   2. tbEnd's TB kill loop resolves m._tbKilledBy per dead monster: a
//      villager/ally fighter key -> by=<companion vid>, via='companion';
//      scholar ('p') or unresolvable -> legacy by=scholar, via='player'.
//      trickSummaryFor rides along either way (counterwire's wiring).
//      TRICKTAG_OFF=1 restores the exact pre-fix call (the RED control).
//   3. recordWaveKill's channel comment gains 'companion' (telemetry-only).
//
// Sections:
//   KILLATTR — companion lands the killing blow(s) in a REAL TB fight
//     (hummice pack; scholar performs the real shout trick first):
//     RED  (TRICKTAG_OFF=1): every entry by=scholar via='player' — the #405
//                            quirk reproduced on the real path.
//     GREEN (default):        every entry by=companion vid via='companion',
//                             trick='shout' (one part per performance).
//   SCHOLAR  — scholar lands the killing blow: via='player', by=scholar,
//              identical in both flag states (unchanged behavior).
//   MONSTER  — unresolvable killing source: legacy fallback, no crash.
//   NOTRICK  — companion kill, no trick performed: trick=null, by/via set.
//   DET-GATE — 40d leadfeast, TRICKTAG off vs on: trajectory hash identical
//              (waveKillLog excluded — it is SUPPOSED to differ).
//   SMOKE    — 40d run green.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub.
// Child probes print one JSON line; no test writes into the repo.
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const PROBE = path.join(ROOT, 'scripts', 'probe-tricktag-20261016.js');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const TRIBFLOOR = path.join(ROOT, 'scripts', 'policies', 'tribfloor.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function probe(seed, cas, tricktagOff) {
  const env = Object.assign({}, process.env, {
    SEED: String(seed), CASE: cas,
    TRICKTAG_OFF: tricktagOff ? '1' : '0',
  });
  const r = execFileSync('node', [PROBE], { env, cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
  return JSON.parse(r.split('\n').filter(l => l.trim()).pop());
}

const allShout = (t) => typeof t === 'string' && t.length > 0 && t.split(',').every(x => x === 'shout');
const entriesMatch = (o) => (o.entries || []).length > 0 &&
  o.entries.every(e => e.by === o.expected.by && e.via === o.expected.via);

// ---------- KILLATTR ----------
console.log('== KILLATTR ==');
{
  const red = probe(951, 'companion', true);   // pre-fix behavior
  if (red.__err) console.log('  red err: ' + red.__err);
  const grn = probe(951, 'companion', false);  // fixed behavior
  if (grn.__err) console.log('  grn err: ' + grn.__err);
  ok(!red.__err && !grn.__err, 'companion-kill probes complete without errors');
  ok((red.entries || []).length >= 1, `RED: pack produced kill entries (got ${(red.entries || []).length}, pack=${red.packSize})`);
  ok((red.entries || []).every(e => e.by === red.scholarVid && e.via === 'player'),
    `RED: pre-fix tags every companion kill by=scholar via='player' — the #405 quirk reproduced (${(red.entries || []).map(e => e.by + '/' + e.via).join(' ')})`);
  ok(red.stampedAfter == null, 'RED: no _tbKilledBy stamp with TRICKTAG_OFF=1');
  ok((grn.entries || []).length >= 1, `GREEN: pack produced kill entries (got ${(grn.entries || []).length}, pack=${grn.packSize})`);
  ok(entriesMatch(grn),
    `GREEN: every entry matches the stamped killer by=${grn.expected.by} via=${grn.expected.via} (${(grn.entries || []).map(e => e.by + '/' + e.via).join(' ')})`);
  ok(grn.expected.via === 'companion' && grn.expected.by === grn.companionVid && grn.expected.by !== grn.scholarVid,
    'GREEN: the stamped killer IS the companion (not the scholar)');
  ok((grn.entries || []).every(e => allShout(e.trick)),
    `GREEN: trick id rides every companion kill, one part per shout (${(grn.entries || []).map(e => e.trick).join(' | ')})`);
  ok(grn.stampedAfter === 'v_testcomp',
    `GREEN: tbDamage stamped the killing blow source (got ${grn.stampedAfter})`);
  ok((grn.channelKeys || []).some(k => k.indexOf('companion.') === 0),
    `GREEN: waveKillByChannel gains a companion.w* key (${(grn.channelKeys || []).join(',')})`);
  console.log(`  tales queued by the companion kill (armed): ${grn.talesQueued} (expect 0 — hummice already reported via the scholar's encounter)`);
  ok(grn.talesQueued === 0, 'no spurious killer-tale queued for the witnessed TB kill');
}

// ---------- SCHOLAR ----------
console.log('== SCHOLAR ==');
{
  const red = probe(952, 'scholar', true);
  const grn = probe(952, 'scholar', false);
  if (red.__err) console.log('  red err: ' + red.__err);
  if (grn.__err) console.log('  grn err: ' + grn.__err);
  ok(!red.__err && !grn.__err, 'scholar-kill probes complete without errors');
  ok((red.entries || []).every(e => e.by === red.scholarVid && e.via === 'player'),
    'scholar kill pre-fix: by=scholar via=player');
  ok((grn.entries || []).every(e => e.by === grn.scholarVid && e.via === 'player'),
    'scholar kill armed: UNCHANGED by=scholar via=player');
  ok(grn.stampedAfter === 'p', `scholar killing blow stamps 'p' (got ${grn.stampedAfter})`);
}

// ---------- MONSTER (defensive fallback) ----------
console.log('== MONSTER ==');
{
  const grn = probe(953, 'monster', false);
  if (grn.__err) console.log('  grn err: ' + grn.__err);
  ok(!grn.__err, 'unresolvable-source kill completes without errors');
  ok((grn.entries || []).every(e => e.by === grn.scholarVid && e.via === 'player'),
    'unresolvable killer keeps the legacy tag (no crash, no misattribution)');
}

// ---------- NOTRICK ----------
console.log('== NOTRICK ==');
{
  const grn = probe(954, 'notrick', false);
  if (grn.__err) console.log('  grn err: ' + grn.__err);
  ok(!grn.__err, 'no-trick companion-kill probe completes without errors');
  ok(entriesMatch(grn) && grn.expected.via === 'companion',
    'companion kill, no trick: by/via attributed to the companion');
  ok((grn.entries || []).every(e => e.trick == null),
    'companion kill, no trick: trick stays null (no fabrication)');
}

// ---------- DET-GATE ----------
console.log('== DET-GATE ==');
function detHash(seed, tricktagOff) {
  const code = `
const { loadGame, setupGame, runDays } = require('${HARNESS}');
const TF = require('${TRIBFLOOR}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'detgate', fullTelemetry: false });
  await setupGame(Game);
  const res = await runDays(Game, TF.leadfeast, { days: 40, manifest: undefined, sampleEvery: 30 });
  const st = Game.state;
  // NOTE: waveKillLog / waveKillByChannel EXCLUDED — they are supposed to differ.
  const h = JSON.stringify({
    day: st.scholar && st.scholar.day, won: !!Game.won,
    slain: st.villageSlain || {}, counters: st.monsterCounters || {}, vt: st.villagerTricks || {},
    obs: st.villageCounterObs || {}, kl: (st.waveKillLog || []).length,
    pop: (st.village && st.village.people ? Object.keys(st.village.people).length : null),
    tales: (st.killerTales || []).length,
    rank: (Game.scaleRank ? Game.scaleRank() : null),
  });
  let x = 0; for (let i = 0; i < h.length; i++) x = ((x << 5) - x + h.charCodeAt(i)) >>> 0;
  console.log(JSON.stringify({ hash: x.toString(16), days: res.days }));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
  const env = Object.assign({}, process.env, { TRICKTAG_OFF: tricktagOff ? '1' : '0' });
  const r = execFileSync('node', ['-e', code], { env, cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
  return JSON.parse(r.split('\n').filter(l => l.trim()).pop());
}
{
  const a = detHash(955, false), b = detHash(955, false), c = detHash(955, true);
  ok(!a.__crash && !b.__crash && !c.__crash, 'det-gate runs complete');
  ok(a.hash && a.hash === b.hash, `det-gate: armed runs identical on same seed (${a.hash})`);
  ok(a.hash === c.hash, `det-gate: TRICKTAG off vs on byte-identical trajectory (${a.hash} == ${c.hash}) — attribution-only`);
}

// ---------- SMOKE ----------
console.log('== SMOKE ==');
{
  const r = detHash(956, false);
  ok(!r.__crash && r.days > 0, `40d smoke run green (ran ${r.days}d)`);
}

console.log(`\n${pass} passed, ${fail} failed${fails.length ? ' — ' + fails.join(' | ') : ''}`);
process.exit(fail ? 1 : 0);
