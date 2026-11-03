#!/usr/bin/env node
// analyze-pocketpersist-b.js — pocket-persistence trace reporter
// (sim-pocketpersist-b, 2026-11-02). Prereg:
// evidence/2026-11-02/sim-pocketpersist-b-prereg.md.
// Reporter, never a judge; the caller applies the prereg's
// G1/G2 gates and M1-M6 mapping.
// Usage: node scripts/analyze-pocketpersist-b.js
//   --probe <probe-jsonl> --control <homeconstruct-jsonl> [--seed 69501]
// Reads one JSON object per seed from each file (stdout of
// scripts/pocketpersist-b-driver.js and
// scripts/homeconstruct-b-driver.js). Prints: G1 (control
// gate on the homeconstruct leg), G2 (probe identity vs
// control, loopDays 1-12 start/end pos+kcal), the day-by-
// day trace table (days 5-12, start+end probes), and the
// per-candidate signature table. Exit 0 always.
'use strict';
const fs = require('fs');
const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
};
function load(file) {
  return fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}
function samePos(a, b) { return a && b && a.x === b.x && a.y === b.y; }
function key(x, y) { return x + ',' + y; }
function dayMap(inst) { return new Map((inst.days || []).map((d) => [d.loopDay, d])); }

// --- G1: homewardac reported shape on the fresh homeconstruct shadow leg.
function gateG1(inst) {
  const days = dayMap(inst);
  const out = { pass: true, failures: [] };
  const fail = (clause, expected, observed) => { out.pass = false; out.failures.push({ clause, expected, observed }); };
  const d5 = days.get(5);
  if (!d5 || !samePos(d5.start && d5.start.pos, { x: 4, y: 4 })) fail('day5-start-haven', '(4,4)', d5 && d5.start && d5.start.pos);
  if (!d5 || !d5.construct || !samePos(d5.construct.posAfterForced, { x: 7, y: 1 })) fail('day5-walkout-to-(7,1)', '(7,1)', d5 && d5.construct && d5.construct.posAfterForced);
  if (!d5 || !samePos(d5.end && d5.end.pos, { x: 7, y: 1 }) || !d5.dayEndReturnSim || d5.dayEndReturnSim.ok !== false) {
    fail('day5-end-stranded', 'pos (7,1) + dayEnd ok false', d5 && { pos: d5.end && d5.end.pos, ok: d5.dayEndReturnSim && d5.dayEndReturnSim.ok });
  }
  for (let d = 6; d <= 11; d++) {
    const rec = days.get(d);
    if (!rec || !samePos(rec.end && rec.end.pos, { x: 7, y: 1 }) || !rec.dayEndReturnSim || rec.dayEndReturnSim.ok !== false) {
      fail('day' + d + '-end-stranded', 'pos (7,1) + dayEnd ok false', rec && { pos: rec.end && rec.end.pos, ok: rec.dayEndReturnSim && rec.dayEndReturnSim.ok });
    }
  }
  const d12 = days.get(12);
  if (!d12 || !samePos(d12.end && d12.end.pos, { x: 4, y: 4 })) fail('day12-end-haven', '(4,4)', d12 && d12.end && d12.end.pos);
  return out;
}

// --- G2: probe leg matches control leg on days 1-12 start/end pos+kcal.
function gateG2(probeInst, controlInst) {
  const p = dayMap(probeInst), c = dayMap(controlInst);
  const out = { pass: true, failures: [] };
  for (let d = 1; d <= 12; d++) {
    const pr = p.get(d), cr = c.get(d);
    if (!pr || !cr) { out.pass = false; out.failures.push({ day: d, field: 'missing-day' }); continue; }
    for (const phase of ['start', 'end']) {
      if (!samePos(pr[phase] && pr[phase].pos, cr[phase] && cr[phase].pos) || (pr[phase] && pr[phase].kcal) !== (cr[phase] && cr[phase].kcal)) {
        out.pass = false;
        out.failures.push({ day: d, field: phase, probe: pr[phase] && { pos: pr[phase].pos, kcal: pr[phase].kcal }, control: cr[phase] && { pos: cr[phase].pos, kcal: cr[phase].kcal } });
      }
    }
  }
  return out;
}

// Blocker signature map for one probe: tile -> sorted blocker string,
// from direct-path hops (checkHop blockers + engine block) and
// orthogonal neighbour hops (same). Empty string = no blocker seen.
function blockerMap(pr) {
  const m = new Map();
  const add = (tile, str) => {
    if (!tile) return;
    const k = key(tile.x, tile.y);
    const cur = m.get(k) || new Set();
    if (str) cur.add(str);
    m.set(k, cur);
  };
  try {
    for (const h of ((pr.direct && pr.direct.pathHops) || [])) {
      for (const b of ((h.checkHop && h.checkHop.blockers) || [])) add(h.to, 'checkHop:' + (b.blockType || 'unknown'));
      if (h.engineBlock) add(h.to, 'engine:' + (h.engineBlock.blockType || 'unknown'));
    }
  } catch (e) {}
  try {
    for (const n of (pr.neighbours || [])) {
      for (const b of ((n.checkHop && n.checkHop.blockers) || [])) add(n.to, 'checkHop:' + (b.blockType || 'unknown'));
      if (n.engineBlock) add(n.to, 'engine:' + (n.engineBlock.blockType || 'unknown'));
    }
  } catch (e) {}
  const out = {};
  for (const [k, set] of m) out[k] = [...set].sort().join('|');
  return out;
}
function boxMap(pr, field) {
  const out = {};
  for (const t of (pr.box || [])) {
    if (!t || t.x == null) continue;
    out[key(t.x, t.y)] = field === 'revealed' ? !!t.revealed : (field === 'stock' ? (t.stock ?? null) : null);
  }
  return out;
}
function diffMaps(a, b) {
  const out = [];
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) {
    if (JSON.stringify((a || {})[k]) !== JSON.stringify((b || {})[k])) out.push({ tile: k, from: (a || {})[k] ?? null, to: (b || {})[k] ?? null });
  }
  return out;
}

// Compact per-day trace rows + candidate inputs, pure over the probe inst.
function buildSummary(inst) {
  const days = dayMap(inst);
  const rows = [];
  for (let d = 5; d <= 12; d++) {
    const rec = days.get(d);
    if (!rec) { rows.push({ loopDay: d, missing: true }); continue; }
    const row = { loopDay: d,
      startPos: rec.start && rec.start.pos, startId: rec.start && rec.start.villagerId,
      startKcal: rec.start && rec.start.kcal, startHealth: rec.start && rec.start.health,
      startE: rec.startProbe && rec.startProbe.E, startRevealed: rec.startProbe && rec.startProbe.revealedCount,
      endPos: rec.end && rec.end.pos, endId: rec.end && rec.end.villagerId,
      endKcal: rec.end && rec.end.kcal, endHealth: rec.end && rec.end.health,
      endE: rec.endProbe && rec.endProbe.E, endRevealed: rec.endProbe && rec.endProbe.revealedCount,
      dayEndSim: rec.dayEndReturnSim, forages: (rec.forages || []).length,
      startSwimmer: rec.startProbe && rec.startProbe.swimmer, endSwimmer: rec.endProbe && rec.endProbe.swimmer,
      startInv: rec.startProbe && rec.startProbe.inventory, endInv: rec.endProbe && rec.endProbe.inventory,
    };
    rows.push(row);
  }
  const probes = [];
  for (let d = 5; d <= 12; d++) {
    const rec = days.get(d);
    if (!rec) continue;
    if (rec.startProbe) probes.push({ loopDay: d, phase: 'start', probe: rec.startProbe });
    if (rec.endProbe) probes.push({ loopDay: d, phase: 'end', probe: rec.endProbe });
  }
  const idChanges = [];
  let prevId = null, prevLabel = null;
  for (const p of probes) {
    const id = p.probe.snap && p.probe.snap.villagerId;
    if (prevId !== null && id !== prevId) idChanges.push({ from: prevLabel, to: 'day' + p.loopDay + '-' + p.phase, fromId: prevId, toId: id });
    if (id !== null) { prevId = id; prevLabel = 'day' + p.loopDay + '-' + p.phase; }
  }
  const ePassFromPocket = probes.filter((p) => {
    const s = p.probe.snap;
    return s && s.pos && s.pos.x === 7 && s.pos.y === 1 && p.probe.E && p.probe.E.ok === true;
  }).map((p) => 'day' + p.loopDay + '-' + p.phase + ' via=' + (p.probe.E.via || null));
  const firstLateral = probes.find((p) => p.probe.E && p.probe.E.via === 'lateral');
  const playerDeaths = (inst.deaths || []).filter((d) => d.player === true);
  const base = probes.find((p) => p.loopDay === 5 && p.phase === 'end');
  const baseBlock = base ? blockerMap(base.probe) : {};
  const baseRev = base ? boxMap(base.probe, 'revealed') : {};
  const baseStock = base ? boxMap(base.probe, 'stock') : {};
  const blockerChanges = [], revealedFlips = [], stockChanges = [];
  for (const p of probes) {
    if (p.loopDay === 5 && p.phase === 'end') continue;
    const label = 'day' + p.loopDay + '-' + p.phase;
    for (const d of diffMaps(baseBlock, blockerMap(p.probe))) blockerChanges.push(Object.assign({ at: label }, d));
    for (const d of diffMaps(baseRev, boxMap(p.probe, 'revealed'))) revealedFlips.push(Object.assign({ at: label }, d));
    for (const d of diffMaps(baseStock, boxMap(p.probe, 'stock'))) stockChanges.push(Object.assign({ at: label }, d));
  }
  const swimmerFlips = [];
  let prevSwim = null;
  for (const p of probes) {
    const s = p.probe.swimmer;
    if (prevSwim !== null && s !== prevSwim) swimmerFlips.push({ at: 'day' + p.loopDay + '-' + p.phase, from: prevSwim, to: s });
    if (s !== null) prevSwim = s;
  }
  const invKeys = (pr) => new Set(((pr && pr.inventory) || []).map((it) => it.key + '|' + (it.foodState || '')));
  const invChanges = [];
  let prevInv = null;
  for (const p of probes) {
    const cur = invKeys(p.probe);
    if (prevInv) {
      const gained = [...cur].filter((k) => !prevInv.has(k));
      const lost = [...prevInv].filter((k) => !cur.has(k));
      if (gained.length || lost.length) invChanges.push({ at: 'day' + p.loopDay + '-' + p.phase, gained, lost });
    }
    prevInv = cur;
  }
  return { rows, probes: probes.map((p) => 'day' + p.loopDay + '-' + p.phase),
    idChanges, ePassFromPocket, firstLateral: firstLateral ? 'day' + firstLateral.loopDay + '-' + firstLateral.phase + ' legs=' + firstLateral.probe.E.legs : null,
    playerDeaths, blockerChanges, revealedFlips, stockChanges, swimmerFlips, invChanges };
}

function main() {
  const probeFile = arg('probe', null), controlFile = arg('control', null);
  const seed = parseInt(arg('seed', '69501'), 10);
  if (!probeFile || !controlFile) { console.error('usage: analyze-pocketpersist-b.js --probe <file> --control <file> [--seed 69501]'); process.exit(2); }
  const probes = load(probeFile), controls = load(controlFile);
  const pInst = probes.find((i) => i.seed === seed) || probes[0];
  const cInst = controls.find((i) => i.seed === seed) || controls[0];
  if (!pInst || !cInst) { console.error('seed ' + seed + ' not found in probe/control files'); process.exit(2); }
  const g1 = gateG1(cInst);
  console.log('G1 control-gate seed=' + seed + ' ' + (g1.pass ? 'PASS' : 'FAIL'));
  for (const f of g1.failures) console.log('  G1-FAIL ' + f.clause + ' expected=' + JSON.stringify(f.expected) + ' observed=' + JSON.stringify(f.observed));
  const g2 = gateG2(pInst, cInst);
  console.log('G2 probe-identity seed=' + seed + ' ' + (g2.pass ? 'PASS' : 'FAIL'));
  for (const f of g2.failures) console.log('  G2-FAIL day=' + f.day + ' field=' + f.field + ' probe=' + JSON.stringify(f.probe) + ' control=' + JSON.stringify(f.control));
  const s = buildSummary(pInst);
  console.log('TRACE days=5-12 (start/end probes)');
  for (const r of s.rows) {
    if (r.missing) { console.log('  day' + r.loopDay + ' MISSING'); continue; }
    const eS = r.startE ? ('ok=' + r.startE.ok + ' via=' + r.startE.via + ' reason=' + r.startE.reason) : 'absent';
    const eE = r.endE ? ('ok=' + r.endE.ok + ' via=' + r.endE.via + ' reason=' + r.endE.reason) : 'absent';
    console.log('  day' + r.loopDay +
      ' start pos=' + JSON.stringify(r.startPos) + ' id=' + r.startId + ' kcal=' + r.startKcal + ' hp=' + r.startHealth + ' E[' + eS + '] rev=' + r.startRevealed +
      ' | end pos=' + JSON.stringify(r.endPos) + ' id=' + r.endId + ' kcal=' + r.endKcal + ' hp=' + r.endHealth + ' E[' + eE + '] rev=' + r.endRevealed +
      ' dayEndOk=' + (r.dayEndSim && r.dayEndSim.ok) + ' forages=' + r.forages);
  }
  console.log('CANDIDATES');
  console.log('  identityChanges=' + JSON.stringify(s.idChanges));
  console.log('  playerDeaths=' + JSON.stringify(s.playerDeaths));
  console.log('  ePassFromPocket(7,1)=' + JSON.stringify(s.ePassFromPocket));
  console.log('  firstLateralE=' + JSON.stringify(s.firstLateral));
  console.log('  blockerChanges-vs-day5end=' + JSON.stringify(s.blockerChanges));
  console.log('  revealedFlips-vs-day5end=' + JSON.stringify(s.revealedFlips));
  console.log('  stockChanges-vs-day5end=' + JSON.stringify(s.stockChanges));
  console.log('  swimmerFlips=' + JSON.stringify(s.swimmerFlips));
  console.log('  invChanges=' + JSON.stringify(s.invChanges));
  console.log('SUMMARY seed=' + seed + ' g1=' + (g1.pass ? 'PASS' : 'FAIL') + ' g2=' + (g2.pass ? 'PASS' : 'FAIL'));
}

if (require.main === module) main();
module.exports = { gateG1, gateG2, buildSummary, blockerMap, boxMap, diffMaps };
