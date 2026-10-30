#!/usr/bin/env node
// scripts/test-stalkertick-a.js — sim-stalkertick-a fixture + determinism proof.
// DIAG ONLY: pure functions + one scratch re-run; never game state.
// Usage:
//   node scripts/test-stalkertick-a.js
//     (fixtures; prints FIXTURES-PASS / FIXTURES-FAIL, exit code)
//   node scripts/test-stalkertick-a.js --determinism <seed>
//     (re-runs that seed into a scratch EVID dir via sweep-stalkertick-a.js
//      --one, diffs the row JSON AND the tick census JSON byte-for-byte
//      against the corpus files, prints the verdict, and removes the
//      scratch dir afterwards in a finally block — process.exit is
//      called only AFTER the finally block runs, never inside try.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { buildTraces, classifyRemoval, tickPath, matchJudged, isWildW4, stripRow } =
  require('./analyze-stalkertick-a');

let checks = 0, fails = 0;
function check(name, cond) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL: ${name}`); }
}
function eq(name, a, b) { check(`${name} (got ${JSON.stringify(a)} want ${JSON.stringify(b)})`, a === b); }

// Synthetic census: one wild wave-4 eulogy that ticks 0→7 on the scholar
// tile and vanishes, plus one wild suburb that never ticks and survives.
function synth() {
  const snapshots = [
    { day: 60, scholarTile: { px: 4, py: 4 }, monsters: [
      { inst: 'i1', id: 'eulogy', wave: 4, tx: 4, ty: 4, mx: 4, my: 4, hp: 853, maxHp: 900, lostSight: 0, titan: false, lingering: false, veteran: false },
      { inst: 'i2', id: 'suburb', wave: 4, tx: 5, ty: 3, mx: 2, my: 2, hp: 1285, maxHp: 1300, lostSight: 0, titan: false, lingering: false, veteran: false },
    ] },
    { day: 61, scholarTile: { px: 4, py: 4 }, monsters: [
      { inst: 'i1', id: 'eulogy', wave: 4, tx: 4, ty: 4, mx: 4, my: 4, hp: 853, maxHp: 900, lostSight: 2, titan: false, lingering: false, veteran: false },
      { inst: 'i2', id: 'suburb', wave: 4, tx: 5, ty: 4, mx: 3, my: 3, hp: 1285, maxHp: 1300, lostSight: 0, titan: false, lingering: false, veteran: false },
    ] },
    { day: 62, scholarTile: { px: 4, py: 4 }, monsters: [
      { inst: 'i2', id: 'suburb', wave: 4, tx: 6, ty: 4, mx: 1, my: 1, hp: 1285, maxHp: 1300, lostSight: 0, titan: false, lingering: false, veteran: false },
    ] },
  ];
  const turns = [
    { day: 61, dayPart: 1, inst: 'i1', id: 'eulogy', wave: 4, lostSightBefore: 2, lostSightAfter: 3, hpBefore: 853, hpAfter: 853, removed: false, titan: false, lingering: false },
    { day: 62, dayPart: 1, inst: 'i1', id: 'eulogy', wave: 4, lostSightBefore: 6, lostSightAfter: 7, hpBefore: 853, hpAfter: 853, removed: true, titan: false, lingering: false },
  ];
  const removals = [
    { day: 62, dayPart: 1, inst: 'i1', id: 'eulogy', wave: 4, tx: 4, ty: 4, hp: 853, lostSight: 7, titan: false, lingering: false, veteran: false, wasInWorld: true, gone: true, inMonsterTurn: true, tbfightLive: false },
  ];
  return { snapshots, turns, removals };
}
{
  const { snapshots, turns, removals } = synth();
  const traces = buildTraces(75102, snapshots, turns, removals);
  eq('trace count', traces.length, 2);
  const eul = traces.find(t => t.inst === 'i1');
  const sub = traces.find(t => t.inst === 'i2');
  eq('eulogy firstSeen', eul.firstSeenDay, 60);
  eq('eulogy lastSeen', eul.lastSeenDay, 61);
  eq('eulogy firstAbsent', eul.firstAbsentDay, 62);
  eq('eulogy fate', eul.fate, 'LOSTSIGHT-REMOVE');
  eq('eulogy maxLS', eul.maxLostSight, 7);
  eq('eulogy everTicked', eul.everTicked, true);
  eq('eulogy wildW4', isWildW4(eul), true);
  eq('suburb fate survived', sub.fate, 'SURVIVED-TO-END');
  eq('suburb maxLS', sub.maxLostSight, 0);
  eq('suburb everTicked', sub.everTicked, false);
  const tp = tickPath(eul, 61);
  eq('tick path complete', tp.complete, true);
  eq('tick series days', tp.series.map(s => s.day).join(','), '60,61');
  eq('tick turn events', tp.turns.length, 1);
  // Removal classification.
  eq('classify lostsight 7 in turn', classifyRemoval(removals[0]), 'LOSTSIGHT-REMOVE');
  eq('classify lift (not in turn)', classifyRemoval(Object.assign({}, removals[0], { inMonsterTurn: false })), 'OTHER-REMOVE');
  eq('classify turn but LS 3', classifyRemoval(Object.assign({}, removals[0], { lostSight: 3 })), 'OTHER-REMOVE');
  eq('classify turn LS null', classifyRemoval(Object.assign({}, removals[0], { lostSight: null })), 'OTHER-REMOVE');
  // Judged matching by (id, hp) trajectory.
  const m = matchJudged(traces, { seed: 75102, id: 'eulogy', hp: 853, lastSeenDay: 61, firstAbsentDay: 62 });
  eq('judged match EXACT', m.status, 'EXACT');
  eq('judged matched inst', m.trace.inst, 'i1');
  const m2 = matchJudged(traces, { seed: 75102, id: 'eulogy', hp: 999, lastSeenDay: 61, firstAbsentDay: 62 });
  eq('judged no-hp match', m2.status, 'NO-HP-MATCH');
  const m3 = matchJudged(traces, { seed: 75102, id: 'audit', hp: 785, lastSeenDay: 61, firstAbsentDay: 62 });
  eq('judged none', m3.status, 'NONE');
  // HP-only: absent day differs.
  const m4 = matchJudged(traces, { seed: 75102, id: 'eulogy', hp: 853, lastSeenDay: 61, firstAbsentDay: 63 });
  eq('judged hp-only', m4.status, 'HP-ONLY');
}
// NO-REMOVAL-EVENT: present then absent, no removal event.
{
  const traces = buildTraces(75116, [
    { day: 158, scholarTile: null, monsters: [{ inst: 'i9', id: 'suburb', wave: 4, tx: 7, ty: 4, mx: 1, my: 1, hp: 1285, maxHp: 1300, lostSight: 0, titan: false, lingering: false, veteran: false }] },
    { day: 159, scholarTile: null, monsters: [] },
  ], [], []);
  eq('gap fate', traces[0].fate, 'NO-REMOVAL-EVENT');
  eq('gap firstAbsent', traces[0].firstAbsentDay, 159);
  const tp = tickPath(traces[0], 158);
  eq('gap tick path complete (no removal fate)', tp.complete, true);
}
// PARTIAL: null lostSight on a census day.
{
  const traces = buildTraces(75102, [
    { day: 60, scholarTile: null, monsters: [{ inst: 'i3', id: 'eulogy', wave: 4, tx: 4, ty: 4, mx: 4, my: 4, hp: 853, maxHp: 900, lostSight: null, titan: false, lingering: false, veteran: false }] },
    { day: 61, scholarTile: null, monsters: [{ inst: 'i3', id: 'eulogy', wave: 4, tx: 4, ty: 4, mx: 4, my: 4, hp: 853, maxHp: 900, lostSight: 1, titan: false, lingering: false, veteran: false }] },
  ], [], []);
  const tp = tickPath(traces[0], 61);
  eq('null lostSight -> partial', tp.complete, false);
  check('partial reason names day', tp.reasons.some(r => r.indexOf('60') >= 0));
}
// Titan/lingering excluded from wild universe (fate-observation flags).
{
  const traces = buildTraces(75102, [
    { day: 60, scholarTile: null, monsters: [
      { inst: 'i4', id: 'herald', wave: 4, tx: 4, ty: 4, mx: 4, my: 4, hp: 700, maxHp: 700, lostSight: 0, titan: true, lingering: true, veteran: false },
    ] },
  ], [], []);
  eq('titan not wild', isWildW4(traces[0]), false);
}
// Prereg correction #1: lingering flips mid-life; wild reads the fate
// observation (removal event), not the ever-flag. A beast lingering
// on census but not at removal IS wild.
{
  const traces = buildTraces(75102, [
    { day: 60, scholarTile: null, monsters: [{ inst: 'i5', id: 'eulogy', wave: 4, tx: 4, ty: 4, mx: 4, my: 4, hp: 853, maxHp: 900, lostSight: 0, titan: false, lingering: true, veteran: false }] },
    { day: 61, scholarTile: null, monsters: [{ inst: 'i5', id: 'eulogy', wave: 4, tx: 4, ty: 4, mx: 4, my: 4, hp: 853, maxHp: 900, lostSight: 0, titan: false, lingering: true, veteran: false }] },
    { day: 62, scholarTile: null, monsters: [] },
  ], [], [
    { day: 62, dayPart: 1, inst: 'i5', id: 'eulogy', wave: 4, tx: 4, ty: 4, hp: 853, lostSight: 7, titan: false, lingering: false, veteran: false, wasInWorld: true, gone: true, inMonsterTurn: true, tbfightLive: false },
  ]);
  eq('lingering-at-removal false -> wild', isWildW4(traces[0]), true);
  eq('flip fate', traces[0].fate, 'LOSTSIGHT-REMOVE');
  // Still lingering at run end (survived, last census lingering) -> NOT wild.
  const traces2 = buildTraces(75102, [
    { day: 60, scholarTile: null, monsters: [{ inst: 'i6', id: 'influencer', wave: 4, tx: 4, ty: 4, mx: 4, my: 4, hp: 900, maxHp: 900, lostSight: 0, titan: false, lingering: true, veteran: false }] },
  ], [], []);
  eq('lingering-at-end -> not wild', isWildW4(traces2[0]), false);
}
// stripRow: removing stalkertick must not touch other keys/order.
{
  const row = { seed: 1, days: 86, joinendlines: { meetings: [] }, stalkertick: { turns: [], removals: [] } };
  const stripped = stripRow(row);
  check('strip removes stalkertick', !('stalkertick' in stripped));
  eq('strip keeps keys', Object.keys(stripped).join(','), 'seed,days,joinendlines');
}
// Turn-only instance (spawned and ticked same day, never censused).
{
  const traces = buildTraces(75102, [], [
    { day: 62, dayPart: 1, inst: 'i7', id: 'eulogy', wave: 4, lostSightBefore: 6, lostSightAfter: 7, hpBefore: 853, hpAfter: 853, removed: true, titan: false, lingering: false },
  ], [
    { day: 62, dayPart: 1, inst: 'i7', id: 'eulogy', wave: 4, tx: 4, ty: 4, hp: 853, lostSight: 7, titan: false, lingering: false, veteran: false, wasInWorld: true, gone: true, inMonsterTurn: true, tbfightLive: false },
  ]);
  eq('turn-only fate', traces[0].fate, 'LOSTSIGHT-REMOVE');
  eq('turn-only firstSeen from turn', traces[0].firstSeenDay, 62);
}

function determinism(seed) {
  const corpusDir = path.join(REPO, 'evidence', '2026-10-30', 'perseed-stalkertick-a');
  const scratch = path.join(REPO, 'evidence', '2026-10-30', `perseed-stalkertick-a-det-${seed}`);
  let ok = false;
  let ran = false;
  try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  console.log(`DETERMINISM: re-running seed ${seed} into scratch dir...`);
  try {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'sweep-stalkertick-a.js'), '--one', String(seed)],
      { cwd: REPO, env: Object.assign({}, process.env, { EVID: scratch }), stdio: 'inherit', timeout: 600000 });
    ran = true;
  } catch (e) {
    console.log('DETERMINISM-FAIL: scratch re-run errored');
  }
  if (ran) {
    try {
      const a = fs.readFileSync(path.join(corpusDir, `s${seed}-fresh.json`), 'utf8');
      const b = fs.readFileSync(path.join(scratch, `s${seed}-fresh.json`), 'utf8');
      const rowOk = (a === b);
      console.log(rowOk ? 'DETERMINISM-PASS: row JSON byte-identical' : 'DETERMINISM-FAIL: row JSON differs');
      const c = fs.readFileSync(path.join(corpusDir, `tick-s${seed}.json`), 'utf8');
      const d = fs.readFileSync(path.join(scratch, `tick-s${seed}.json`), 'utf8');
      const tickOk = (c === d);
      console.log(tickOk ? 'DETERMINISM-PASS: tick census JSON byte-identical' : 'DETERMINISM-FAIL: tick census JSON differs');
      ok = rowOk && tickOk;
    } catch (e) {
      console.log(`DETERMINISM-FAIL: read error ${e && e.message}`);
    }
  }
  try { fs.rmSync(scratch, { recursive: true, force: true }); console.log('DETERMINISM: scratch dir removed'); } catch (e) {}
  return ok;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--determinism') >= 0) {
    const seed = parseInt(args[args.indexOf('--determinism') + 1], 10);
    if (!Number.isFinite(seed)) { console.log('DETERMINISM-FAIL: bad seed'); process.exit(1); }
    const ok = determinism(seed);
    console.log(ok ? 'DETERMINISM-PASS' : 'DETERMINISM-FAIL');
    process.exit(ok ? 0 : 1);
  }
  console.log(`FIXTURES: ${checks} checks, ${fails} fails`);
  console.log(fails === 0 ? 'FIXTURES-PASS' : 'FIXTURES-FAIL');
  process.exit(fails === 0 ? 0 : 1);
}
if (require.main === module) main();
module.exports = { determinism };
