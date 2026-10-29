#!/usr/bin/env node
// test-blockedpath-diag-b.js — proof for sim-blockedpath-diag-b.
//
// T1-T8: data proofs over the committed corpora (nighttravel pooled-36
// verdict corpus + this arm's truncated replay + the 10752 replays).
// T9: live engine spot-checks through the shared harness (full
// src/js eval in index.html order, Math.random seeded before eval):
// the clearBlockage branches cited in the evidence are exercised on
// synthetic tiles in a throwaway game — branch behavior, not a sim.
// Exit non-zero on any failure; print PROOF-GREEN only when all pass.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const ROOT = path.join(__dirname, '..');
const CORPUS_DIR = path.join(ROOT, 'evidence', '2026-10-29', 'sim-nighttravel-verdict-adopt-b-pooled36-nighttravel');
const REPLAY = path.join(ROOT, 'evidence', '2026-10-29', 'sim-blockedpath-diag-b-replay.json');
const R10752_BEFORE = path.join(ROOT, 'evidence', '2026-10-29', 'sim-blockedpath-diag-b-10752-before.json');

let failures = [];
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail !== undefined ? ' — ' + detail : ''}`);
  if (!cond) failures.push(name);
}

function corpusRefused() {
  const out = [];
  for (const f of fs.readdirSync(CORPUS_DIR).sort()) {
    if (!f.endsWith('.json')) continue;
    const d = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, f), 'utf8'));
    for (const e of (d.evenings || [])) {
      if (e.eveningOutcome === 'travel-refused' && e.travelOffered) out.push({ seed: d.seed, ...e });
    }
  }
  return out;
}

async function main() {
  const corpus = corpusRefused();
  const byKind = {};
  for (const e of corpus) {
    const k = (e.travel || {}).hopReturnKind;
    byKind[k] = (byKind[k] || 0) + 1;
  }
  check('T1 corpus refused total 115', corpus.length === 115, `n=${corpus.length}`);
  check('T1 partition 41/33/24/17, no other', byKind['block:washed_out'] === 41 && byKind['block:fallen_tree'] === 33 &&
    byKind['block:rubble'] === 24 && byKind['block:creek'] === 17 && Object.keys(byKind).length === 4,
    JSON.stringify(byKind));

  let integBad = 0;
  for (const e of corpus) {
    const t = e.travel || {}, arr = t.arrival || {};
    const [px, py] = (e.preStepMap || '').split(',').map(Number);
    if (arr.mapPx !== px || arr.mapPy !== py) integBad++;
    if (t.kcalDeltaHop !== 0 || t.ticksBefore !== t.ticksAfterHop) integBad++;
  }
  check('T2 refusal integrity: arrival==departure, 0 hop cost, all 115', integBad === 0, `violations=${integBad}`);

  const rep = JSON.parse(fs.readFileSync(REPLAY, 'utf8'));
  const repMap = new Map(rep.refused.map((r) => [`${r.seed}/${r.loopDay}`, r]));
  const corMap = new Map(corpus.map((e) => [`${e.seed}/${e.loopDay}`, e]));
  let kindMismatch = 0;
  for (const [k, e] of corMap) {
    const r = repMap.get(k);
    if (!r || r.hopReturnKind !== (e.travel || {}).hopReturnKind) kindMismatch++;
  }
  check('T3 replay reproduces corpus refused set + kinds', repMap.size === 115 && corMap.size === 115 &&
    [...corMap.keys()].every((k) => repMap.has(k)) && kindMismatch === 0,
    `replay=${repMap.size} corpus=${corMap.size} kindMismatch=${kindMismatch}`);

  let dest = 0, inter = 0, destAdj = 0, depSide = 0, routeOk = 0, fixNonCreek = 0, fixNonCreekN = 0, fixCreek = 0, fixCreekN = 0;
  let wrapperAgree = 0;
  const sites = new Set();
  for (const r of rep.refused) {
    const b = (r.probe || {}).block || {};
    if (b.leg === 'destination') dest++;
    if (b.leg === 'intermediate') inter++;
    const dT = Math.abs(b.x - 4) + Math.abs(b.y - 4);
    if (b.leg === 'intermediate' && dT === 1) destAdj++;
    if (b.leg === 'intermediate' && dT > 1) depSide++;
    if (r.probe.route && r.probe.route.path) routeOk++;
    if (b.blockType === 'creek') { fixCreekN++; if (r.probe.fix && r.probe.fix.feasible) fixCreek++; }
    else { fixNonCreekN++; if (r.probe.fix && r.probe.fix.feasible) fixNonCreek++; }
    sites.add(`${r.seed}|${r.preStepMap}|${b.blockType}|${b.x},${b.y}`);
    const calls = (rep.travelCallsBySeed[String(r.seed)] || []).filter((c) => c.loopDay === r.loopDay && c.to[0] === 4 && c.to[1] === 4 && c.ret.kind === 'block');
    const h = calls[calls.length - 1];
    if (h && h.ret.x === b.x && h.ret.y === b.y && h.ret.blockType === b.blockType) wrapperAgree++;
  }
  check('T4 geometry: 0 destination-leg, 115 intermediate-leg', dest === 0 && inter === 115, `dest=${dest} inter=${inter}`);
  check('T4 geometry split: 99 destination-adjacent, 16 departure-side', destAdj === 99 && depSide === 16, `adj=${destAdj} depSide=${depSide}`);
  check('T5 route-around exists on all 115 evening states', routeOk === 115, `routeOk=${routeOk}`);
  check('T6 crossing-fix: non-creek feasible 98/98, creek feasible 0/17', fixNonCreek === 98 && fixNonCreekN === 98 && fixCreek === 0 && fixCreekN === 17,
    `nonCreek=${fixNonCreek}/${fixNonCreekN} creek=${fixCreek}/${fixCreekN}`);
  check('T7 engine-return block tile == probe block tile, 115/115', wrapperAgree === 115, `agree=${wrapperAgree}`);
  check('T7 distinct blocked sites == 22', sites.size === 22, `sites=${sites.size}`);

  const b10752 = JSON.parse(fs.readFileSync(R10752_BEFORE, 'utf8'));
  const day12 = b10752.days.find((d) => d.loopDay === 12);
  const day12Clears = b10752.clears.filter((c) => c.loopDay === 12);
  const bf24AllDays = b10752.days.every((d) => d.blockFrom24 && d.blockFrom24.type === 'rubble');
  check('T8 10752: day-12 clear is (1,3), not the hop tile (2,4)', day12Clears.length === 1 && day12Clears[0].x === 1 && day12Clears[0].y === 3,
    JSON.stringify(day12Clears));
  check('T8 10752: (2,4) rubble present every day 1-14 (no stale flag, no clearing)', bf24AllDays,
    `days=${b10752.days.length}`);
  check('T8 10752: day-12 evening probe is rubble@(2,4) intermediate', day12 && day12.hopProbe &&
    day12.hopProbe.blockType === 'rubble' && day12.hopProbe.x === 2 && day12.hopProbe.y === 4 && day12.hopProbe.leg === 'intermediate',
    JSON.stringify(day12 && day12.hopProbe));
  check('T8 10752: day-12 clear line names no tile (omission, verbatim)', b10752.clearLines.length === 1 &&
    b10752.clearLines[0].line === 'You clear the rubble, stone by stone. The path is clear.',
    JSON.stringify(b10752.clearLines.map((l) => l.line)));

  // T9 — live engine spot-checks on synthetic tiles (throwaway game).
  const { Game } = await loadGame({ seed: 1, mode: 'blockedpath-diag-t9', fullTelemetry: false });
  await setupGame(Game);
  const sch = Game.state.scholar;
  function setTile(x, y, patch) {
    const t = Game.tileAt(x, y);
    Object.assign(t, patch);
    return t;
  }
  // Rubble: 40 kcal, blockFrom deleted.
  sch.kcal = 1000;
  setTile(3, 4, { blockFrom: { dx: -1, dy: 0, type: 'rubble' } });
  const kBefore = sch.kcal;
  Game.clearBlockage(3, 4);
  const rub = Game.tileAt(3, 4);
  check('T9 rubble clears: blockFrom deleted, -40 kcal', !rub.blockFrom && sch.kcal === kBefore - 40,
    `kcal ${kBefore}->${sch.kcal} blockFrom=${JSON.stringify(rub.blockFrom)}`);
  // Fallen tree: 60 kcal, blockFrom deleted.
  sch.kcal = 1000;
  setTile(3, 4, { blockFrom: { dx: -1, dy: 0, type: 'fallen_tree' } });
  const kBefore2 = sch.kcal;
  Game.clearBlockage(3, 4);
  const ft = Game.tileAt(3, 4);
  check('T9 fallen_tree clears: blockFrom deleted, -60 kcal', !ft.blockFrom && sch.kcal === kBefore2 - 60,
    `kcal ${kBefore2}->${sch.kcal}`);
  // Washed out, no wood: scramble, 80 kcal, blockFrom deleted.
  sch.kcal = 1000;
  setTile(3, 4, { blockFrom: { dx: -1, dy: 0, type: 'washed_out' } });
  const kBefore3 = sch.kcal;
  const wRet = Game.clearBlockage(3, 4);
  const wo = Game.tileAt(3, 4);
  check('T9 washed_out scrambles without wood: blockFrom deleted, -80 kcal', wRet !== false && !wo.blockFrom && sch.kcal === kBefore3 - 80,
    `kcal ${kBefore3}->${sch.kcal} ret=${wRet !== false}`);
  // Creek: hand-clearing refused, blockage intact.
  sch.kcal = 1000;
  setTile(3, 4, { type: 'creek', needsBridge: true, bridged: false, blockFrom: null });
  const cRet = Game.clearBlockage(3, 4);
  const ck = Game.tileAt(3, 4);
  check('T9 creek refuses hand-clearing: returns false, needsBridge intact', cRet === false && ck.needsBridge === true && !ck.bridged,
    `ret=${cRet}`);
  // travelBlockage side-guard: (2,4) rubble dx=-1 guards entry from (1,4) only.
  setTile(2, 4, { blockFrom: { dx: -1, dy: 0, type: 'rubble' } });
  const fromWest = Game.travelBlockage(2, 4, 1, 4);
  const fromNorth = Game.travelBlockage(2, 4, 2, 3);
  check('T9 side-guard: blocked from guarded side, open from other side', !!fromWest && fromWest.blockType === 'rubble' && !fromNorth,
    `fromWest=${JSON.stringify(fromWest)} fromNorth=${JSON.stringify(fromNorth)}`);

  if (failures.length) { console.log(`PROOF-RED: ${failures.length} failures: ${failures.join(', ')}`); process.exit(1); }
  console.log('PROOF-GREEN: all blockedpath-diag checks pass');
}

main().catch((e) => { console.error('PROOF-RED crash', e && (e.stack || e.message)); process.exit(2); });
