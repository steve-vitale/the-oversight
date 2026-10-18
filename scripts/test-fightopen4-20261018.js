#!/usr/bin/env node
// test-fightopen4-20261018.js — proof for sim-fightopen4 (2026-10-18).
//
// 1. SOURCE GROUNDING: the landed FIGHTOPEN branch (src/js/fieldFights.js)
//    still carries the five opener mappings (congregation→argue,
//    reunion→wait:reunion-novel, editor→continuity, cancellation→offscript,
//    audit→inefficient) — guards against a stale-tree revert between
//    landing and this run.
// 2. DET-GATE: two in-process control-side runs (same seed+policy, VETREL=1
//    REPOSITION=1 NODEWITNESS=1, FIGHTOPEN unset) produce byte-identical
//    per-seed JSONs; same for the armed side. (The task's det-gate.)
// 3. SMOKE: SMOKE=1 sweep (1 seed x 2 policies x 2 arms, 60d) completes;
//    both arms write well-formed JSONs with the execensus schema fields.
// 4. COMPOSITION: vetrel+reposition composition is live on both arms
//    (vetrelOn/reposition layerOn true; the per-seed JSON carries the
//    readiness substrate string).
//
// ZERO game-code changes by construction (composition + instruments only).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

// The proof process itself requires the sweep module (for policyFor), so
// its top-level STOP gates run here too — set the substrate env up front.
for (const [k, v] of [
  ['FEASTSCALE_R13', '1'], ['TRIBFLOOR', '1'], ['SUCCGRACE', '1'], ['RAIDDENSITY', '1'],
  ['WINPURSUIT', '1'], ['WINDEFER', '1'], ['SEATDRIVE', '0'],
  ['VETREL', '1'], ['REPOSITION', '1'], ['NODEWITNESS', '1'],
]) process.env[k] = v;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

(async () => {
  console.log('== 1. SOURCE GROUNDING (landed FIGHTOPEN branch) ==');
  const src = fs.readFileSync(path.join(REPO, 'src/js/fieldFights.js'), 'utf8');
  ok('FIGHTOPEN env gate present', src.includes("process.env.FIGHTOPEN === '1'"));
  const openerStart = src.indexOf('FIGHT-OPENING EXECUTION');
  ok('FIGHTOPEN block present', openerStart > 0);
  const block = openerStart > 0 ? src.slice(openerStart, openerStart + 6000) : '';
  ok('congregation→argue', block.includes("mid === 'congregation'") && block.includes("type: 'argue'"));
  ok('reunion→wait:reunion-novel', block.includes("mid === 'reunion'") && block.includes("why: 'reunion-novel'"));
  ok('editor→continuity', block.includes("mid === 'editor'") && block.includes("type: 'continuity'"));
  ok('cancellation→offscript', block.includes("mid === 'cancellation'") && block.includes("type: 'offscript'"));
  ok('audit→inefficient', block.includes("mid === 'audit'") && block.includes("type: 'inefficient'"));
  ok('round-1 + wave>=4 gate', block.includes('fctx.round === 1') && block.includes('>= 4'));

  console.log('== 2/3. DET-GATE + SMOKE (SMOKE=1, 1 seed x 2 policies x 2 arms, 60d) ==');
  const detDir = '/tmp/fightopen4-det';
  execSync(`rm -rf ${detDir} && mkdir -p ${detDir}`, { stdio: 'pipe' });
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
    WINPURSUIT: '1', WINDEFER: '1', // required by the execensus instrument's top-level gates (inert here)
    SEATDRIVE: '0', VETREL: '1', REPOSITION: '1', NODEWITNESS: '1',
    SMOKE: '1', FIGHTOPEN4_EVID: detDir, REPO,
  });
  const sweep = path.join(REPO, 'scripts', 'sweep-fightopen4.js');
  function runSweep(tag) {
    execSync(`node ${sweep}`, { env, cwd: REPO, stdio: 'pipe', timeout: 900000 });
    const files = fs.readdirSync(detDir).filter(f => f.endsWith('.json')).sort();
    return files.map(f => ({ f, bytes: fs.readFileSync(path.join(detDir, f), 'utf8') }));
  }
  const first = runSweep('first');
  ok('smoke wrote 4 JSONs (2 policies x 2 arms)', first.length === 4, `got ${first.length}`);
  for (const { f, bytes } of first) {
    let j = null;
    try { j = JSON.parse(bytes); } catch (e) {}
    ok(`well-formed ${f}`, !!j && j.arm === 'fightopen4' && Array.isArray(j.funnel) && typeof j.maxWave === 'number');
    ok(`readiness substrate on ${f}`, !!j && String(j.substrate).includes('VETREL=1 REPOSITION=1 NODEWITNESS=1'));
    ok(`fightopen flag matches arm on ${f}`, !!j && j.fightopen === (j.armId === 'armed' ? 1 : 0));
  }
  const second = runSweep('second');
  let detAll = first.length === second.length;
  if (detAll) for (let i = 0; i < first.length; i++) {
    if (first[i].f !== second[i].f || first[i].bytes !== second[i].bytes) { detAll = false; break; }
  }
  ok('DET-GATE: byte-identical re-runs (both arms)', detAll);
  // Control-side specifically (the task's det-gate).
  const c1 = first.filter(x => x.f.includes('-control.'));
  const c2 = second.filter(x => x.f.includes('-control.'));
  let detControl = c1.length === c2.length && c1.length > 0;
  if (detControl) for (let i = 0; i < c1.length; i++) {
    if (c1[i].f !== c2[i].f || c1[i].bytes !== c2[i].bytes) { detControl = false; break; }
  }
  ok('DET-GATE: byte-identical trajectories on the CONTROL side', detControl);

  console.log('== 4. COMPOSITION ==');
  process.env.VETREL = '1'; process.env.REPOSITION = '1';
  const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
  const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
  ok('vetrelOn() true', VR.vetrelOn());
  ok('reposition layerOn() true', RP.layerOn());
  const sweepMod = require(sweep);
  const p = sweepMod.policyFor('leadfeast');
  ok('policyFor composes vetrel+reposition', /vetrel/.test(p.id) && /rp/.test(p.id));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
