#!/usr/bin/env node
// lateralclose-b-analyze.js — LATERAL-CLOSE ANALYZER
// (sim-lateralclose-b, Loop B food-economy arm, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-lateralclose-b-prereg.md.
//
// Modes:
//   --flips <probe files...>  : find primary flips (P0 A-LAT
//     tiles, ok true -> false between consecutive probes),
//     secondary transitions, and per-candidate occurrence
//     counts across the corpus. Prints FLIP lines, SECONDARY
//     lines, and a SUMMARY JSON line.
//   --diff <probe file> <k>   : classified diff between probe
//     k and k+1 (classes: stock, revealed, terrain, beyond,
//     haven) as JSON.
//   --counterfactual <probe file> <tile> <k> : for the flip
//     at probe pair (k, k+1) on <tile>, replay the seed to
//     probe k once per diff class (+ all classes), apply that
//     class alone, and report which classes reproduce the
//     flip. Verifies replay determinism (replayed pre-flip
//     snapshot must equal the judged probe-k snapshot).
//   --check-sense <judged> <sense> : verify a say-tee replay's
//     probe snapshots equal the judged leg's (trajectory
//     unchanged by the tee).
//
// The analyzer never writes into the repo: all output goes to
// stdout; callers redirect. Counterfactual replays spawn the
// probe driver as a subprocess (one node process per replay,
// per harness rules: never two harnesses in one process).
'use strict';
const fs = require('fs');
const { execFileSync } = require('child_process');
const path = require('path');

const PROBE_SCRIPT = path.join(__dirname, 'lateralclose-b-probe.js');

function readProbes(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('REPLAY_') && !l.startsWith('COUNTERFACTUAL'));
  return lines.map((l) => JSON.parse(l));
}

function p0Index(probes) {
  for (let i = 0; i < probes.length; i++) if (probes[i].gameDay >= 5) return i;
  return -1;
}

function primarySet(probes, p0) {
  const out = [];
  if (p0 < 0) return out;
  for (const [k, e] of Object.entries(probes[p0].emap)) {
    if (e && !e.error && e.ok === true && e.directOk === false) out.push(k);
  }
  return out.sort();
}

function terrainEqual(a, b) {
  return a && b && a.type === b.type &&
    JSON.stringify(a.blockFrom || null) === JSON.stringify(b.blockFrom || null) &&
    JSON.stringify(a.bridgeFrom || null) === JSON.stringify(b.bridgeFrom || null) &&
    a.bridged === b.bridged && a.needsBridge === b.needsBridge;
}

// Classified diff between two probe records. Returns
// {stock, revealed, terrain, beyond, haven, swimmerChanged}
// where each board class maps "x,y" -> post-flip value (for
// terrain, the full post tile-normalized terrain fields), and
// beyond maps "x,y" -> post tile snapshot or null (deleted).
function classifyDiff(pre, post) {
  const stock = {}, revealed = {}, terrain = {};
  const preB = (pre.map && pre.map.board) || {}, postB = (post.map && post.map.board) || {};
  for (const k of new Set([...Object.keys(preB), ...Object.keys(postB)])) {
    const a = preB[k], b = postB[k];
    if (!a || !b) continue;
    if (a.stock !== b.stock) stock[k] = b.stock;
    if (a.revealed !== b.revealed) revealed[k] = b.revealed;
    if (!terrainEqual(a, b)) terrain[k] = { type: b.type, blockFrom: b.blockFrom, bridgeFrom: b.bridgeFrom, bridged: b.bridged, needsBridge: b.needsBridge };
  }
  const beyond = {};
  const preY = (pre.map && pre.map.beyond) || {}, postY = (post.map && post.map.beyond) || {};
  for (const k of new Set([...Object.keys(preY), ...Object.keys(postY)])) {
    if (JSON.stringify(preY[k] || null) !== JSON.stringify(postY[k] || null)) beyond[k] = postY[k] || null;
  }
  const haven = (pre.haven.x !== post.haven.x || pre.haven.y !== post.haven.y) ? post.haven : null;
  return { stock, revealed, terrain, beyond, haven, swimmerChanged: pre.swimmer !== post.swimmer };
}

function snapshotEqual(a, b) {
  // E-determinism comparison: everything escapeCheck can read.
  return a.gameDay === b.gameDay &&
    JSON.stringify(a.scholarPos) === JSON.stringify(b.scholarPos) &&
    JSON.stringify(a.haven) === JSON.stringify(b.haven) &&
    a.swimmer === b.swimmer &&
    JSON.stringify(a.map) === JSON.stringify(b.map) &&
    JSON.stringify(a.emap) === JSON.stringify(b.emap);
}

function flipsMode(files) {
  let totalPrimaryProbes = 0, totalFlips = 0;
  const counts = { stockZeroOnLateralPath: 0, stockZeroAny: 0, revealEvents: 0,
    terrainChanges: 0, bridgesBuilt: 0, beyondGenerated: 0, havenMoves: 0,
    swimmerChanges: 0, typeChanges: 0, lateralPathChanges: 0 };
  const secondary = [];
  for (const file of files) {
    const probes = readProbes(file);
    const p0 = p0Index(probes);
    const prim = new Set(primarySet(probes, p0));
    const seed = probes.length ? probes[0].seed : '?';
    if (p0 < 0) { console.log('FILE ' + file + ' NO-P0'); continue; }
    for (let k = p0; k + 1 < probes.length; k++) {
      const pre = probes[k], post = probes[k + 1];
      const diff = classifyDiff(pre, post);
      // Occurrence counts (corpus-level, for the DIAG table).
      // Stock-0 events on lateral-path tiles (per pre-probe path
      // tile occurrence; a tile on several paths counts several
      // times — this is an event count, not a tile count).
      for (const [tk, e] of Object.entries(pre.emap)) {
        if (!e || e.error) continue;
        for (const pk of (e.lateralPath || [])) {
          const a = (pre.map.board || {})[pk], b = (post.map.board || {})[pk];
          if (a && b && a.stock > 0 && b.stock === 0) counts.stockZeroOnLateralPath++;
        }
      }
      const zeroTiles = new Set();
      for (const [tk, b] of Object.entries(post.map.board || {})) {
        const a = (pre.map.board || {})[tk];
        if (a && b && a.stock > 0 && b.stock === 0) zeroTiles.add(tk);
      }
      counts.stockZeroAny += zeroTiles.size;
      counts.revealEvents += Object.keys(diff.revealed).length;
      counts.terrainChanges += Object.keys(diff.terrain).length;
      for (const [tk, v] of Object.entries(diff.terrain)) {
        const a = (pre.map.board || {})[tk];
        if (a && !a.bridged && v.bridged) counts.bridgesBuilt++;
        if (a && a.type !== v.type) counts.typeChanges++;
      }
      counts.beyondGenerated += Object.keys(diff.beyond).filter((k) => !(pre.map.beyond || {})[k] && (post.map.beyond || {})[k]).length;
      if (diff.haven) counts.havenMoves++;
      if (diff.swimmerChanged) counts.swimmerChanges++;
      for (const tk of Object.keys(post.emap)) {
        const a = pre.emap[tk], b = post.emap[tk];
        if (!a || !b || a.error || b.error) continue;
        if (JSON.stringify(a.lateralPath || []) !== JSON.stringify(b.lateralPath || [])) counts.lateralPathChanges++;
        if (prim.has(tk)) totalPrimaryProbes++;
        if (prim.has(tk) && a.ok === true && b.ok === false) {
          totalFlips++;
          const scholarAt = pre.scholarPos.x + ',' + pre.scholarPos.y === tk;
          console.log('FLIP seed=' + seed + ' tile=' + tk +
            ' probes=' + pre.probeIndex + '->' + post.probeIndex +
            ' days=' + pre.gameDay + '->' + post.gameDay +
            ' pre=' + (a.via || '?') + '/legs' + a.legs +
            ' post=' + (b.via || 'null') + '/' + (b.reason || '?') +
            ' scholarAtTile=' + scholarAt +
            ' diffClasses=' + ['stock:' + Object.keys(diff.stock).length,
              'revealed:' + Object.keys(diff.revealed).length,
              'terrain:' + Object.keys(diff.terrain).length,
              'beyond:' + Object.keys(diff.beyond).length,
              'haven:' + (diff.haven ? 1 : 0),
              'swimmerChanged:' + diff.swimmerChanged].join(','));
        } else if (a.ok !== b.ok || a.directOk !== b.directOk) {
          secondary.push('SECONDARY seed=' + seed + ' tile=' + tk +
            ' probes=' + pre.probeIndex + '->' + post.probeIndex +
            ' ' + (a.ok ? (a.directOk ? 'direct' : 'lateral') : 'pocket') +
            '->' + (b.ok ? (b.directOk ? 'direct' : 'lateral') : 'pocket'));
        }
      }
    }
  }
  for (const s of secondary) console.log(s);
  console.log('SUMMARY ' + JSON.stringify({ totalPrimaryProbes, totalFlips, counts }));
}

function diffMode(file, k) {
  const probes = readProbes(file);
  const pre = probes[k], post = probes[k + 1];
  if (!pre || !post) { console.error('FATAL: probe pair out of range'); process.exit(2); }
  console.log(JSON.stringify({ seed: pre.seed, pair: [pre.probeIndex, post.probeIndex],
    days: [pre.gameDay, post.gameDay], diff: classifyDiff(pre, post) }, null, 2));
}

function runReplay(seed, stopProbe, applyDiff, evalTile) {
  const env = Object.assign({}, process.env, {
    SEED: String(seed), STOP_PROBE: String(stopProbe),
    APPLY_DIFF: JSON.stringify(applyDiff), EVAL_TILE: evalTile,
  });
  const out = execFileSync('node', [PROBE_SCRIPT], { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let replaySnap = null, counter = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('REPLAY_SNAPSHOT ')) replaySnap = JSON.parse(line.slice('REPLAY_SNAPSHOT '.length));
    if (line.startsWith('COUNTERFACTUAL ')) counter = JSON.parse(line.slice('COUNTERFACTUAL '.length));
  }
  return { replaySnap, counter };
}

function counterfactualMode(file, tile, k) {
  const probes = readProbes(file);
  const pre = probes[k], post = probes[k + 1];
  if (!pre || !post) { console.error('FATAL: probe pair out of range'); process.exit(2); }
  const preE = pre.emap[tile], postE = post.emap[tile];
  if (!preE || preE.ok !== true || !postE || postE.ok !== false) {
    console.error('FATAL: not a flip pair for this tile'); process.exit(2);
  }
  const diff = classifyDiff(pre, post);
  const classes = {};
  if (Object.keys(diff.stock).length) classes.stock = { stock: diff.stock };
  if (Object.keys(diff.revealed).length) classes.revealed = { revealed: diff.revealed };
  if (Object.keys(diff.terrain).length) classes.terrain = { terrain: diff.terrain };
  if (Object.keys(diff.beyond).length) classes.beyond = { beyond: diff.beyond };
  if (diff.haven) classes.haven = { haven: diff.haven };
  const all = {};
  if (classes.stock) all.stock = diff.stock;
  if (classes.revealed) all.revealed = diff.revealed;
  if (classes.terrain) all.terrain = diff.terrain;
  if (classes.beyond) all.beyond = diff.beyond;
  if (classes.haven) all.haven = diff.haven;
  const results = {};
  let determinism = null;
  for (const [name, d] of Object.entries(classes)) {
    const r = runReplay(pre.seed, pre.probeIndex, d, tile);
    if (determinism === null) determinism = r.replaySnap && snapshotEqual(r.replaySnap, pre);
    results[name] = r.counter ? r.counter.ok : null;
  }
  const allR = runReplay(pre.seed, pre.probeIndex, all, tile);
  if (determinism === null) determinism = allR.replaySnap && snapshotEqual(allR.replaySnap, pre);
  const reproducers = Object.entries(results).filter(([, ok]) => ok === false).map(([n]) => n);
  console.log(JSON.stringify({ seed: pre.seed, tile, pair: [pre.probeIndex, post.probeIndex],
    days: [pre.gameDay, post.gameDay], determinism, swimmerChanged: diff.swimmerChanged,
    singleClass: results, allClassesOk: allR.counter ? allR.counter.ok : null,
    reproducers }, null, 2));
}

function checkSenseMode(judgedFile, senseFile) {
  const a = readProbes(judgedFile), b = readProbes(senseFile);
  if (a.length !== b.length) { console.log('SENSE-CHECK FAIL probe-count ' + a.length + ' vs ' + b.length); process.exit(0); }
  for (let i = 0; i < a.length; i++) {
    if (!snapshotEqual(a[i], b[i])) { console.log('SENSE-CHECK FAIL probe ' + i + ' gameDay ' + a[i].gameDay + ' vs ' + b[i].gameDay); process.exit(0); }
  }
  console.log('SENSE-CHECK PASS probes=' + a.length);
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0];
  if (mode === '--flips') { if (args.length < 2) { console.error('FATAL: --flips needs files'); process.exit(2); } flipsMode(args.slice(1)); }
  else if (mode === '--diff') { if (args.length < 3) { console.error('FATAL: --diff needs file + k'); process.exit(2); } diffMode(args[1], parseInt(args[2], 10)); }
  else if (mode === '--counterfactual') { if (args.length < 4) { console.error('FATAL: --counterfactual needs file + tile + k'); process.exit(2); } counterfactualMode(args[1], args[2], parseInt(args[3], 10)); }
  else if (mode === '--check-sense') { if (args.length < 3) { console.error('FATAL: --check-sense needs judged + sense'); process.exit(2); } checkSenseMode(args[1], args[2]); }
  else { console.error('FATAL: unknown mode ' + mode); process.exit(2); }
}

if (require.main === module) main();

module.exports = { readProbes, p0Index, primarySet, classifyDiff, snapshotEqual };
