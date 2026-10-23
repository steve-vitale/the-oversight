#!/usr/bin/env node
// scripts/test-trigger-registry-20261022.js — ZERO-BEHAVIOR-CHANGE proof for
// rogue P0-5 (declarative npcTrigger registry).
//
// The refactor moves trigger-site code into registry rows verbatim; the sims
// must therefore be byte-identical before/after. This script:
//
//   PARENT mode (default): for each (harness, seed) spawns one CHILD process
//     (one harness per process — the harness forbids two in one process),
//     collects each child's deterministic trajectory JSON, and compares
//     harness A vs harness B byte-for-byte.
//   CHILD mode (--child): loads ONE harness, runs N days under a fixed
//     policy, snapshots per-day villager-AI state at every Game.sleep, and
//     writes the canonical trajectory JSON to --out.
//
// Usage:
//   # A/A determinism baseline (same tree twice — must be identical):
//   node scripts/test-trigger-registry-20261022.js \
//     --harness-a /path/to/A/scripts/sim-harness.js \
//     --harness-b /path/to/A/scripts/sim-harness.js \
//     --seeds 7,42,1337,9001 --days 40 --policy competent --outdir /tmp/trig-aa
//   # A/B refactor proof (base vs branch — must be identical):
//   node scripts/test-trigger-registry-20261022.js \
//     --harness-a ~/workspace/scratch/trigger-base/scripts/sim-harness.js \
//     --harness-b ./scripts/sim-harness.js \
//     --seeds 7,42,1337,9001 --days 40 --policy competent --outdir /tmp/trig-ab
//
// Exit 0: all seeds byte-identical. Exit 1: any difference (diff printed).
// Output files are written to --outdir (default: a fresh dir under /tmp),
// NEVER into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) o[a.slice(2)] = (argv[i + 1] && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
  }
  return o;
}

// canon(v): deterministic JSON — sorted object keys, no undefined/functions.
function canon(v) {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return v.map(canon);
  if (typeof v === 'object') {
    const out = {};
    Object.keys(v).sort().forEach(k => {
      const cv = canon(v[k]);
      if (cv !== undefined) out[k] = cv;
    });
    return out;
  }
  if (typeof v === 'number') {
    if (!isFinite(v)) return String(v);
    return Math.abs(v) < 1e-12 ? 0 : v;
  }
  return v;
}
const sha = s => crypto.createHash('sha256').update(s).digest('hex');

// Per-day villager-AI snapshot: everything the rerouted trigger sites touch.
function snapAI(Game) {
  const v = Game.state.village || {};
  const sch = Game.state.scholar || {};
  const objs = {};
  const o = v.objectives || {};
  Object.keys(o).sort().forEach(vid => {
    const x = o[vid] || {};
    objs[vid] = [x.kind || '', x.state || '', x.purpose || '', x.indoor ? 1 : 0,
      x.tx == null ? -1 : x.tx, x.ty == null ? -1 : x.ty,
      x.tightness == null ? -1 : x.tightness, x.partsLeft == null ? -1 : x.partsLeft,
      x.targetVid || '', x.companion || '', x.chore || ''];
  });
  const away = {};
  Object.keys(v.away || {}).sort().forEach(vid => {
    const a = v.away[vid] || {};
    away[vid] = [a.nx, a.ny, a.purpose || ''];
  });
  const roster = (v.roster || []).slice().sort();
  const dead = [];
  try { (Game.data.villagers || []).forEach(p => { if (p && p.dead) dead.push(p.id); }); } catch (e) {}
  dead.sort();
  const gossip = (v.gossip || []).map(g => canon({
    action: g.action, day: g.day || 0,
    who: (g.dims && g.dims.who) || '', purpose: (g.dims && g.dims.purpose) || '',
    heard: (g.heard || []).length,
  }));
  const deeds = ((Game.state.codex || {}).deeds || []).map(d => [d.vid, d.type, d.mag, d.day]);
  let exped = {};
  try {
    const st = Game.agencyState();
    Object.keys(st.exped || {}).sort().forEach(k => { exped[k] = 1; });
  } catch (e) {}
  let npcView = {};
  try {
    const nv = v.npcViewership || {};
    Object.keys(nv).sort().forEach(k => { npcView[k] = nv[k]; });
  } catch (e) {}
  return { day: sch.day || 0, objs, away, roster, dead, gossip, deeds, exped, npcView };
}

async function childMain(o) {
  if (o.unit) return unitMain(o);
  const harnessPath = path.resolve(o.harness);
  const harnessDir = path.dirname(harnessPath);
  const seed = parseInt(o.seed, 10);
  const days = parseInt(o.days || '40', 10);
  const policyId = o.policy || 'competent';
  const outPath = path.resolve(o.out);
  const H = require(harnessPath);
  const policy = require(path.join(harnessDir, 'policies', policyId + '.js'));
  const { Game } = await H.loadGame({ seed });
  await H.setupGame(Game);

  const snaps = [];
  const origSleep = Game.sleep;
  Game.sleep = function () {
    let s = null;
    try { s = snapAI(Game); } catch (e) { s = { snapError: String(e && e.message || e) }; }
    snaps.push(s);
    return origSleep.apply(this, arguments);
  };

  let result;
  try {
    result = await H.runDays(Game, policy, { days });
  } finally {
    Game.sleep = origSleep;
  }

  const dayHashes = snaps.map(s => sha(JSON.stringify(canon(s))));
  const trajectoryHash = sha(dayHashes.join('|'));

  // Gate-equivalence checks: the rerouted hard gates must match the original
  // inline expressions under every tableActive/objVillageDanger shape.
  const gateChecks = [];
  const g = Game;
  const checkGate = (name, inlineFn, triggerFn) => {
    let inlineVal, trigVal, inlineThrew = false, trigThrew = false;
    try { inlineVal = !!inlineFn(); } catch (e) { inlineThrew = true; }
    try { trigVal = !!triggerFn(); } catch (e) { trigThrew = true; }
    gateChecks.push({ name, inlineThrew, trigThrew, match: (inlineThrew === trigThrew) && (inlineVal === trigVal) });
  };
  const hasTrigger = typeof g.npcTrigger === 'function';
  gateChecks.push({ name: 'npcTrigger-present', present: hasTrigger });
  if (hasTrigger) {
    const realTableActive = g.tableActive;
    const realDanger = g.objVillageDanger;
    const tryShapes = [
      ['fn-true', () => true], ['fn-false', () => false],
    ];
    for (const [label, fn] of tryShapes) {
      g.tableActive = fn;
      checkGate('table_sits/' + label,
        () => (g.tableActive && g.tableActive()),
        () => g.npcTrigger(null, 'table_sits'));
      g.objVillageDanger = () => (label === 'fn-true' ? 4 : 3);
      checkGate('expedition_launch/' + label,
        () => (g.objVillageDanger && g.objVillageDanger() >= 4),
        () => g.npcTrigger('vX', 'expedition_launch'));
    }
    g.tableActive = undefined;
    checkGate('table_sits/missing',
      () => (g.tableActive && g.tableActive()),
      () => g.npcTrigger(null, 'table_sits'));
    g.objVillageDanger = undefined;
    checkGate('expedition_launch/missing',
      () => (g.objVillageDanger && g.objVillageDanger() >= 4),
      () => g.npcTrigger('vX', 'expedition_launch'));
    let unknownThrew = false, unknownVal = null;
    try { unknownVal = g.npcTrigger('vX', 'no_such_event'); } catch (e) { unknownThrew = true; }
    gateChecks.push({ name: 'unknown-event-noop', threw: unknownThrew, value: unknownVal, match: !unknownThrew && unknownVal === false });
    g.tableActive = realTableActive;
    g.objVillageDanger = realDanger;
  }

  const payload = {
    proof: 'trigger-registry-20261022',
    harness: harnessPath,
    seed, days, policy: policyId,
    endReason: result.endReason, gameDays: result.gameDays,
    snapCount: snaps.length,
    dayHashes,
    trajectoryHash,
    gateChecks,
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 1) + '\n');
  console.log(`child done seed=${seed} days=${result.gameDays} snaps=${snaps.length} traj=${trajectoryHash.slice(0, 12)} gates=${gateChecks.filter(c => c.match !== false).length}/${gateChecks.length}`);
}

// Unit mode: directly exercise the 'death' row end-to-end through the real
// expedDeath call site (the trajectory sims never kill a villager in 40
// days, so this row needs a focused check). Identical setup on both trees,
// then compare the resulting state delta hash.
async function unitMain(o) {
  const harnessPath = path.resolve(o.harness);
  const harnessDir = path.dirname(harnessPath);
  const seed = parseInt(o.seed, 10);
  const outPath = path.resolve(o.out);
  const H = require(harnessPath);
  const { Game } = await H.loadGame({ seed });
  await H.setupGame(Game);
  const v = Game.state.village;
  const vid = (v.roster || []).find(id => {
    if (id === Game.villagerId) return false;
    try { return !(Game.vpOf(id) || {}).dead; } catch (e) { return true; }
  });
  if (!vid) throw new Error('unit: no living villager found');
  const nm = Game.displayName(vid);
  const snap = () => canon({
    roster: (v.roster || []).slice().sort(),
    away: Object.keys(v.away || {}).sort(),
    gossip: (v.gossip || []).map(g => [g.action, (g.dims && g.dims.who) || '', g.day || 0, (g.heard || []).length]),
    moments: (Game.state.telemetry || []).filter(t => t.type === 'moment').length,
    fallen: ((v.fallen || [])).length,
  });
  const before = snap();
  Game.expedDeath(vid, 'The Unit Beast', nm, false);
  const after = snap();
  const payload = {
    proof: 'trigger-registry-20261022-unit',
    harness: harnessPath, seed,
    vidDied: !(v.roster || []).includes(vid),
    beforeHash: sha(JSON.stringify(before)),
    afterHash: sha(JSON.stringify(after)),
    gossipDelta: after.gossip.length - before.gossip.length,
    rosterDelta: before.roster.length - after.roster.length,
  };

  // Second unit: 'deed' row end-to-end through the real recordDeed call
  // site, with mag 10 (exercises broadcast + moment + overheard-say
  // branches) and the player parked at haven.
  const H2 = H;
  const { Game: G2 } = await H2.loadGame({ seed: seed + 7919 });
  await H2.setupGame(G2);
  const v2 = G2.state.village;
  const hx = v2.px ?? 4, hy = v2.py ?? 4;
  const vid2 = (v2.roster || []).find(id => {
    if (id === G2.villagerId) return false;
    try { return !(G2.vpOf(id) || {}).dead; } catch (e) { return true; }
  });
  if (!vid2) throw new Error('unit: no living villager found (deed)');
  try { G2.map.px = hx; G2.map.py = hy; } catch (e) {}
  const snap2 = () => canon({
    ach: ((v2.agency || {}).ach || []).map(a => [a.vid, a.type, a.mag]),
    codexDeeds: ((G2.state.codex || {}).deeds || []).map(d => [d.vid, d.type, d.mag]),
    npcView: v2.npcViewership || {},
    gossip: (v2.gossip || []).map(g => [g.action, (g.dims && g.dims.who) || '', (g.heard || []).length]),
    moments: (G2.state.telemetry || []).filter(t => t.type === 'moment').length,
  });
  const dBefore = snap2();
  G2.recordDeed(vid2, 'monster_kill', 'Unit test deed — slew the unit beast', 10);
  const dAfter = snap2();
  payload.deed = {
    vid: vid2,
    beforeHash: sha(JSON.stringify(dBefore)),
    afterHash: sha(JSON.stringify(dAfter)),
    achDelta: dAfter.ach.length - dBefore.ach.length,
    codexDelta: dAfter.codexDeeds.length - dBefore.codexDeeds.length,
    gossipDelta: dAfter.gossip.length - dBefore.gossip.length,
    momentsDelta: dAfter.moments - dBefore.moments,
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 1) + '\n');
  console.log(`unit done seed=${seed} died=${payload.vidDied} gossip+${payload.gossipDelta} after=${payload.afterHash.slice(0, 12)} deedAfter=${payload.deed.afterHash.slice(0, 12)}`);
}

function parentMain(o) {
  const seeds = String(o.seeds || '7,42,1337,9001').split(',').map(s => parseInt(s.trim(), 10));
  const days = o.days || '40';
  const policy = o.policy || 'competent';
  const outdir = path.resolve(o.outdir || fs.mkdtempSync(path.join('/tmp', 'trig-proof-')));
  fs.mkdirSync(outdir, { recursive: true });
  const harnesses = { A: path.resolve(o['harness-a']), B: path.resolve(o['harness-b']) };
  const self = path.resolve(__filename);
  const outs = {};
  for (const tag of ['A', 'B']) {
    outs[tag] = {};
    for (const seed of seeds) {
      const out = path.join(outdir, `traj-${tag}-seed${seed}.json`);
      const r = spawnSync(process.execPath, [self, '--child',
        '--harness', harnesses[tag], '--seed', String(seed),
        '--days', String(days), '--policy', policy, '--out', out],
        { stdio: 'inherit', maxBuffer: 64 * 1024 * 1024 });
      if (r.status !== 0) {
        console.error(`FATAL: child failed (harness ${tag} seed ${seed}, exit ${r.status})`);
        process.exit(2);
      }
      outs[tag][seed] = out;
    }
  }
  let failures = 0;
  // Trajectory fields compared byte-for-byte. gateChecks are branch-only
  // self-checks (the base tree has no npcTrigger) — asserted separately.
  const trajOf = p => ({ endReason: p.endReason, gameDays: p.gameDays, snapCount: p.snapCount, dayHashes: p.dayHashes, trajectoryHash: p.trajectoryHash });
  for (const seed of seeds) {
    const pa = JSON.parse(fs.readFileSync(outs.A[seed], 'utf8'));
    const pb = JSON.parse(fs.readFileSync(outs.B[seed], 'utf8'));
    const a = JSON.stringify(trajOf(pa));
    const b = JSON.stringify(trajOf(pb));
    if (a === b) {
      console.log(`seed ${seed}: IDENTICAL (${pa.trajectoryHash.slice(0, 12)})`);
    } else {
      failures++;
      console.log(`seed ${seed}: DIFFER`);
      const ta = trajOf(pa), tb = trajOf(pb);
      for (const k of Object.keys(ta)) {
        if (JSON.stringify(ta[k]) !== JSON.stringify(tb[k])) {
          if (k === 'dayHashes') {
            const n = Math.min(ta.dayHashes.length, tb.dayHashes.length);
            let first = -1;
            for (let i = 0; i < n; i++) if (ta.dayHashes[i] !== tb.dayHashes[i]) { first = i; break; }
            console.log(`  dayHashes: first differing snapshot index ${first} (A n=${ta.dayHashes.length}, B n=${tb.dayHashes.length})`);
          } else console.log(`  ${k}: A=${JSON.stringify(ta[k])} B=${JSON.stringify(tb[k])}`);
        }
      }
      const fa = path.join(outdir, `diff-seed${seed}-A.json`), fb = path.join(outdir, `diff-seed${seed}-B.json`);
      fs.writeFileSync(fa, JSON.stringify(pa, null, 1)); fs.writeFileSync(fb, JSON.stringify(pb, null, 1));
      console.log(`  full trajectories kept at ${fa} / ${fb}`);
    }
    // Branch-only gate self-checks: every gate must match its original
    // inline expression under every tableActive/objVillageDanger shape.
    // Only asserted when --expect-b-trigger is set (the A/B proof); in A/A
    // mode harness B is also the base tree and must NOT have npcTrigger.
    const expectTrig = !!o['expect-b-trigger'];
    for (const gc of (pb.gateChecks || [])) {
      if (gc.name === 'npcTrigger-present') {
        if (expectTrig && !gc.present) { failures++; console.log(`seed ${seed}: npcTrigger MISSING on harness B`); }
        if (!expectTrig && gc.present) { failures++; console.log(`seed ${seed}: npcTrigger unexpectedly PRESENT on harness B`); }
      } else if (expectTrig && gc.match === false) {
        failures++; console.log(`seed ${seed}: gate check FAILED on harness B: ${JSON.stringify(gc)}`);
      }
    }
  }
  console.log(failures === 0 ? `\nPROOF PASS: ${seeds.length} seeds byte-identical` : `\nPROOF FAIL: ${failures}/${seeds.length} seeds differ`);
  console.log(`artifacts: ${outdir}`);

  // Unit mode: 'death' row end-to-end via the real expedDeath call site.
  console.log('\n--- unit: expedDeath (death row) ---');
  for (const seed of seeds) {
    const ua = path.join(outdir, `unit-A-seed${seed}.json`);
    const ub = path.join(outdir, `unit-B-seed${seed}.json`);
    for (const [tag, hp, out] of [['A', harnesses.A, ua], ['B', harnesses.B, ub]]) {
      const r = spawnSync(process.execPath, [self, '--child', '--unit',
        '--harness', hp, '--seed', String(seed), '--out', out],
        { stdio: 'inherit', maxBuffer: 64 * 1024 * 1024 });
      if (r.status !== 0) { console.error(`FATAL: unit child failed (harness ${tag} seed ${seed})`); process.exit(2); }
    }
    const pa = JSON.parse(fs.readFileSync(ua, 'utf8'));
    const pb = JSON.parse(fs.readFileSync(ub, 'utf8'));
    const ka = JSON.stringify({ d: pa.vidDied, b: pa.beforeHash, a: pa.afterHash, g: pa.gossipDelta, r: pa.rosterDelta, deed: pa.deed });
    const kb = JSON.stringify({ d: pb.vidDied, b: pb.beforeHash, a: pb.afterHash, g: pb.gossipDelta, r: pb.rosterDelta, deed: pb.deed });
    if (ka === kb) console.log(`unit seed ${seed}: IDENTICAL (died=${pa.vidDied} gossip+${pa.gossipDelta} after=${pa.afterHash.slice(0, 12)} deedAfter=${pa.deed.afterHash.slice(0, 12)})`);
    else { failures++; console.log(`unit seed ${seed}: DIFFER\n  A=${ka}\n  B=${kb}`); }
  }
  console.log(failures === 0 ? '\nUNIT PASS: death row identical' : '\nUNIT FAIL');
  process.exit(failures === 0 ? 0 : 1);
}

const o = parseArgs(process.argv.slice(2));
if (o.child) childMain(o).catch(e => { console.error('child fatal:', e); process.exit(2); });
else parentMain(o);
