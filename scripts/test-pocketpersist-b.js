#!/usr/bin/env node
// test-pocketpersist-b.js — proof for sim-pocketpersist-b
// (prereg evidence/2026-11-02/sim-pocketpersist-b-prereg.md).
// Synthetic + fixture legs ONLY, NO judged legs. The one
// live instrument-validation leg pair uses throwaway seed
// 69599 (the homewardac smoke seed, never judged, never
// screened): it proves probe reads do not move a
// trajectory (Gate G2 on a non-judged seed), it is not
// evidence about the pocket. Judged seed 69501 is NEVER
// run here.
// Checks: (a) gateG1 pass/fail fixtures; (b) gateG2
// pass/fail fixtures; (c) buildSummary candidate
// signatures on fixtures (succession, ground-clearing,
// revealed-route, stock/lateral, no-change); (d) probe()
// on a fake Game (no RNG, no game load); (e) route
// parsing for the shape-A walk-out; (f) reused files
// unmodified in this worktree; (g) probe-driver env
// FATAL on a wrong flag; (h) live probe-vs-homeconstruct
// identity on seed 69599.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const { gateG1, gateG2, buildSummary } = require('./analyze-pocketpersist-b');
const { probe } = require('./pocketpersist-b-driver');
const { parseRoute } = require('./policies/competent-homewardconstruct-b');

let checks = 0, passed = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) { passed++; console.log('PASS ' + name); }
  else console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''));
}
const P = (x, y) => ({ x, y });
function cDay(loopDay, startPos, startKcal, endPos, endKcal, endOk, afterForced) {
  return { loopDay, start: { pos: startPos, kcal: startKcal }, end: { pos: endPos, kcal: endKcal },
    construct: loopDay === 5 ? { posAfterForced: afterForced } : null,
    dayEndReturnSim: { ok: endOk } };
}
function controlInst() {
  const days = [cDay(1, P(4, 4), 1500, P(4, 4), 1400, true, null)];
  // Fixture fix (before prereg commit, no judged leg run yet): gateG2
  // requires days 1-12 in BOTH legs; the original fixture omitted 2-4,
  // so the pass-fixture failed on missing-day, not on divergence.
  days.push(cDay(2, P(4, 4), 1400, P(4, 4), 1350, true, null));
  days.push(cDay(3, P(4, 4), 1350, P(4, 4), 1300, true, null));
  days.push(cDay(4, P(4, 4), 1300, P(4, 4), 1059, true, null));
  days.push(cDay(5, P(4, 4), 1059, P(7, 1), 989, false, P(7, 1)));
  for (let d = 6; d <= 11; d++) days.push(cDay(d, P(7, 1), d === 6 ? 287 : 0, P(7, 1), d === 6 ? 207 : 0, false, null));
  days.push(cDay(12, P(4, 4), 2355, P(4, 4), 2085, true, null));
  return { seed: 69501, days };
}
function probeDay(loopDay, sPos, sId, sKcal, sHp, ePos, eId, eKcal, eHp, sE, eE, boxS, boxE) {
  const mkProbe = (pos, id, kcal, hp, E, box) => ({ snap: { pos, villagerId: id, kcal, health: hp },
    E, revealedCount: 0, box: box || [], direct: { path: [], pathHops: [] }, neighbours: [],
    lateralCandidates: [], swimmer: false, inventory: [] });
  return { loopDay,
    start: { pos: sPos, kcal: sKcal }, end: { pos: ePos, kcal: eKcal },
    forages: [], dayEndReturnSim: { ok: true },
    startProbe: mkProbe(sPos, sId, sKcal, sHp, sE, boxS),
    endProbe: mkProbe(ePos, eId, eKcal, eHp, eE, boxE) };
}
const EFAIL = { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' };
const EPASS = { ok: true, via: 'direct', directOk: true, legs: 0, reason: null };
const ELAT = { ok: true, via: 'lateral', directOk: false, legs: 1, reason: null };
function tileRow(x, y, revealed, stock, type) {
  return { x, y, type: type || 'meadow', needsBridge: false, bridged: false, blockFrom: null, stock: stock ?? 0, maxStock: 3, revealed: !!revealed };
}

// (a) gateG1 fixtures.
{
  const ok = gateG1(controlInst());
  check('g1-pass-on-reported-shape', ok.pass === true, ok);
  const bad = controlInst();
  bad.days.find((d) => d.loopDay === 8).end.pos = P(7, 2);
  const g = gateG1(bad);
  check('g1-fail-on-day8-divergence', g.pass === false && g.failures.some((f) => f.clause === 'day8-end-stranded'), g.failures);
  const bad12 = controlInst();
  bad12.days.find((d) => d.loopDay === 12).end.pos = P(7, 1);
  check('g1-fail-on-day12-not-home', gateG1(bad12).pass === false);
}
// (b) gateG2 fixtures: probe leg identical to control on days 1-12.
function probeInstMatching() {
  const days = [{ loopDay: 1, start: { pos: P(4, 4), kcal: 1500 }, end: { pos: P(4, 4), kcal: 1400 } }];
  // Same fixture fix as controlInst: days 2-4 must exist, values identical.
  days.push({ loopDay: 2, start: { pos: P(4, 4), kcal: 1400 }, end: { pos: P(4, 4), kcal: 1350 } });
  days.push({ loopDay: 3, start: { pos: P(4, 4), kcal: 1350 }, end: { pos: P(4, 4), kcal: 1300 } });
  days.push({ loopDay: 4, start: { pos: P(4, 4), kcal: 1300 }, end: { pos: P(4, 4), kcal: 1059 } });
  days.push(probeDay(5, P(4, 4), 'gen_a', 1059, 100, P(7, 1), 'gen_a', 989, 90, EFAIL, EFAIL));
  for (let d = 6; d <= 11; d++) days.push(probeDay(d, P(7, 1), 'gen_a', d === 6 ? 287 : 0, 80, P(7, 1), 'gen_a', d === 6 ? 207 : 0, 75, EFAIL, EFAIL));
  days.push(probeDay(12, P(4, 4), 'gen_a', 2355, 100, P(4, 4), 'gen_a', 2085, 100, EPASS, EPASS));
  return { seed: 69501, days, deaths: [] };
}
{
  const g = gateG2(probeInstMatching(), controlInst());
  check('g2-pass-on-identical-days', g.pass === true, g.failures);
  const bad = probeInstMatching();
  bad.days.find((d) => d.loopDay === 7).end.kcal = 999;
  check('g2-fail-on-kcal-divergence', gateG2(bad, controlInst()).pass === false);
}
// (c) buildSummary candidate signatures.
{
  // Succession: identity gen_a -> gen_b between day-11 end and day-12 start,
  // player death day 11, E from (7,1) never passes.
  const s = probeInstMatching();
  s.days.find((d) => d.loopDay === 12).startProbe.snap.villagerId = 'gen_b';
  s.days.find((d) => d.loopDay === 12).endProbe.snap.villagerId = 'gen_b';
  s.days.find((d) => d.loopDay === 12).start.pos = P(4, 4);
  s.days.find((d) => d.loopDay === 12).end.pos = P(4, 4);
  s.deaths = [{ day: 11, kind: 'villager', who: 'gen_a', cause: 'the wild', player: true }];
  const sum = buildSummary(s);
  check('summary-succession-id-change', sum.idChanges.length === 1 && sum.idChanges[0].to === 'day12-start', sum.idChanges);
  check('summary-succession-player-death', sum.playerDeaths.length === 1 && sum.playerDeaths[0].day === 11, sum.playerDeaths);
  check('summary-succession-no-epass', sum.ePassFromPocket.length === 0, sum.ePassFromPocket);
  // Ground-clearing: blocker on a neighbour hop at day-5 end, gone by day-12 start.
  const g = probeInstMatching();
  const d5e = g.days.find((d) => d.loopDay === 5).endProbe;
  d5e.neighbours = [{ to: P(7, 2), checkHop: { blockers: [{ blockType: 'creek' }], beyondUngenerated: 0 }, engineBlock: { blockType: 'creek' }, tile: tileRow(7, 2, true, 0) }];
  d5e.box = [tileRow(7, 2, true, 0, 'creek')];
  const d12s = g.days.find((d) => d.loopDay === 12).startProbe;
  d12s.neighbours = [{ to: P(7, 2), checkHop: { blockers: [], beyondUngenerated: 0 }, engineBlock: null, tile: tileRow(7, 2, true, 0) }];
  d12s.box = [tileRow(7, 2, true, 0, 'meadow')];
  const gsum = buildSummary(g);
  check('summary-ground-blocker-change', gsum.blockerChanges.some((c) => c.tile === '7,2' && c.at === 'day12-start'), gsum.blockerChanges);
  // Revealed route: a box tile flips revealed false -> true by day-12.
  const r = probeInstMatching();
  r.days.find((d) => d.loopDay === 5).endProbe.box = [tileRow(6, 1, false, 0)];
  r.days.find((d) => d.loopDay === 12).startProbe.box = [tileRow(6, 1, true, 0)];
  check('summary-revealed-flip', buildSummary(r).revealedFlips.some((c) => c.tile === '6,1' && c.from === false && c.to === true), buildSummary(r).revealedFlips);
  // Stock / lateral: E via lateral at day-12 start + a box tile stock 0 -> 2.
  const l = probeInstMatching();
  l.days.find((d) => d.loopDay === 12).startProbe.E = ELAT;
  l.days.find((d) => d.loopDay === 5).endProbe.box = [tileRow(6, 2, true, 0)];
  l.days.find((d) => d.loopDay === 12).startProbe.box = [tileRow(6, 2, true, 2)];
  const lsum = buildSummary(l);
  check('summary-first-lateral', lsum.firstLateral === 'day12-start legs=1', lsum.firstLateral);
  check('summary-stock-rise', lsum.stockChanges.some((c) => c.tile === '6,2' && c.from === 0 && c.to === 2), lsum.stockChanges);
  // No-change: nothing moves on any candidate axis.
  const n = buildSummary(probeInstMatching());
  check('summary-nochange-empty', n.idChanges.length === 0 && n.blockerChanges.length === 0 &&
    n.revealedFlips.length === 0 && n.stockChanges.length === 0 && n.swimmerFlips.length === 0 &&
    n.playerDeaths.length === 0 && n.firstLateral === null, n);
}
// (d) probe() on a fake Game at haven (E passes in 0 hops, box 25 tiles).
{
  const tiles = [];
  for (let y = 0; y < 9; y++) {
    const row = [];
    for (let x = 0; x < 9; x++) row.push({ type: 'meadow', stock: 2, maxStock: 3, revealed: true });
    tiles.push(row);
  }
  const fake = {
    map: { px: 4, py: 4, tiles },
    state: { village: { px: 4, py: 4 }, scholar: { villagerId: 'fake_a', day: 5, kcal: 1000, health: 100, hydration: 50, inventory: [] } },
    villagerId: 'fake_a', over: false,
    tileAt(x, y) { return (this.map.tiles[y] || [])[x] || null; },
    travelBlockage() { return null; },
    travelTargets() { return []; },
    hasAbility() { return false; },
  };
  const pr = probe(fake, 5, 'start');
  check('probe-fake-haven-e-pass', pr.E && pr.E.ok === true, pr.E);
  check('probe-fake-box-25', Array.isArray(pr.box) && pr.box.length === 25, pr.box && pr.box.length);
  check('probe-fake-snap', pr.snap.pos.x === 4 && pr.snap.pos.y === 4 && pr.snap.villagerId === 'fake_a', pr.snap);
  check('probe-fake-no-error', !pr.error, pr.error);
}
// (e) shape-A route parsing.
{
  const route = parseRoute('5,4;6,4;7,4;7,3;7,2;7,1');
  check('route-a-6-waypoints-last-7-1', route.length === 6 && route[5].x === 7 && route[5].y === 1, route);
}
// (f) reused files unmodified.
{
  const reused = ['scripts/homeconstruct-b-driver.js', 'scripts/policies/competent-homewardconstruct-b.js',
    'scripts/policies/competent-homewardstep-b.js', 'scripts/policies/competent.js',
    'scripts/creekhop-b-recorder.js', 'scripts/analyze-homeconstruct-b.js',
    'scripts/analyze-homeward-shapes-b.js'];
  let out = '';
  try { out = execSync('git status --porcelain -- ' + reused.join(' '), { encoding: 'utf8' }); } catch (e) { out = 'ERROR ' + e.message; }
  check('reused-files-unmodified', out.trim() === '', out);
  check('no-src-changes', (() => { try { return execSync('git status --porcelain -- src/', { encoding: 'utf8' }).trim() === ''; } catch (e) { return false; } })());
}
// (g) probe-driver env FATAL on a wrong flag (exits before any game load).
{
  const r = spawnSync(process.execPath, ['scripts/pocketpersist-b-driver.js'], {
    env: Object.assign({}, process.env, { COMPETENT_FEAST: '1', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '0', SEEDS: '69599', DAYS: '30' }),
    encoding: 'utf8', timeout: 60000 });
  check('driver-fatal-on-bad-flag', r.status === 2 && /FATAL/.test(r.stderr || ''), { status: r.status, stderr: (r.stderr || '').slice(0, 200) });
}
// (h) live instrument validation on throwaway seed 69599: probe leg vs
// homeconstruct shadow leg must match on days 1-12 start/end pos+kcal.
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pocketpersist-proof-'));
  const baseEnv = { COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '0', SEEDS: '69599', DAYS: '30', CONSTRUCT_SHAPE: 'A' };
  const probeFile = path.join(tmp, 'probe.jsonl'), controlFile = path.join(tmp, 'control.jsonl');
  const run = (script, extraEnv, outFile) => {
    const r = spawnSync(process.execPath, [script], {
      env: Object.assign({}, process.env, baseEnv, extraEnv), encoding: 'utf8', timeout: 900000, maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) throw new Error(script + ' exit ' + r.status + ' stderr=' + (r.stderr || '').slice(-500));
    fs.writeFileSync(outFile, r.stdout);
  };
  try {
    run('scripts/pocketpersist-b-driver.js', {}, probeFile);
    run('scripts/homeconstruct-b-driver.js', { POLICY: 'construct-shadow' }, controlFile);
    const pInst = JSON.parse(fs.readFileSync(probeFile, 'utf8').trim().split('\n')[0]);
    const cInst = JSON.parse(fs.readFileSync(controlFile, 'utf8').trim().split('\n')[0]);
    const g2 = gateG2(pInst, cInst);
    check('live-69599-probe-identity-g2', g2.pass === true, g2.failures);
    const days = new Map(pInst.days.map((d) => [d.loopDay, d]));
    check('live-69599-probes-present-days5-12', [5, 6, 7, 8, 9, 10, 11, 12].every((d) => days.get(d) && days.get(d).startProbe && days.get(d).endProbe));
    check('live-69599-day5-walkout', (() => { const d5 = days.get(5); return d5 && d5.construct && d5.construct.posAfterForced && d5.construct.posAfterForced.x === 7 && d5.construct.posAfterForced.y === 1; })(),
      days.get(5) && days.get(5).construct);
  } catch (e) {
    check('live-69599-probe-identity-g2', false, e.message);
  }
}

console.log('PROOF ' + passed + '/' + checks + ' checks');
if (passed !== checks) process.exit(1);
