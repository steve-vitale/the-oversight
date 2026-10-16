#!/usr/bin/env node
// test-sigportfix-20261016.js — proof record for the sim-sigportfix arm
// (run fleshout-20261016T1715Z, axis scale-onramp).
//
// CONTEXT: this arm was briefed to fix the audit+editor field-port inversions
// (finding #409). Verification FIRST showed the inversions were ALREADY FIXED
// in this tree by the sibling sim-apexhook arm (run fleshout-20261016T0915Z,
// commit a3f9e124, "honest sigW4/sigW5 ports", proof 42/42 RED->GREEN, findings
// #413 records it fixed). So this script is an INDEPENDENT re-verification,
// not a fresh fix:
//   RED   — the pre-fix implementations are extracted VERBATIM from
//           `git show a3f9e124^` and EXECUTED: they must show the inversion
//           (audit halves the MONSTER's damage while narrating the villager's
//           trick taxed; editor zeroes the MONSTER's damage while narrating
//           the villager's swing cut).
//   GREEN — the current tree's Game.sigW4FieldMonster/sigW5FieldMonster are
//           executed in the harness: audit arms rec.auditTaxRounds=2 (the
//           VILLAGER's strike is halved for 2 rounds, consumed in the
//           villager-strike section of fieldFights.js); editor arms
//           rec.editorCuts=1 (the VILLAGER's swing is cut, vd=0). In both,
//           the monster-side `total` passes through UNCHANGED.
//   DET   — same inputs -> byte-identical outputs when neither port fires.
//   SENSE — captured narrations are printed for the coherence read.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub.
// AGENTS.md: new tests use the shared kit — this uses scripts/sim-harness.js.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

// ---------- extract the pre-fix implementations verbatim from git ----------
function extractOld(fname, key) {
  const txt = execSync(`git show a3f9e124^:src/js/${fname}`, { cwd: ROOT }).toString();
  const ki = txt.indexOf(key);
  if (ki < 0) throw new Error('extractOld: key not found: ' + JSON.stringify(key) + ' in ' + fname);
  if (ki < 0) throw new Error('key not found in old file: ' + key);
  const pi = txt.indexOf('(', ki);
  // match the parameter list parens
  let pd = 0, pj = pi;
  for (;; pj++) {
    const c = txt[pj];
    if (c === '(') pd++;
    else if (c === ')') { pd--; if (!pd) break; }
  }
  const params = txt.slice(pi, pj + 1);
  const bi = txt.indexOf('{', pj);
  let depth = 0, k = bi;
  for (;; k++) {
    const c = txt[k];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (!depth) break; }
  }
  const body = txt.slice(bi, k + 1);
  return 'function ' + params + ' ' + body;
}
const OLD_W4_SRC = extractOld('sigW4.js', 'sigW4FieldMonster: function');
const OLD_W5_SRC = extractOld('sigW5.js', '\n    sigW5FieldMonster(');
const sayShimSrc = `(function(game, s){ try { game.say(s); } catch (e) {} })`;
function oldFn(src) {
  // eslint-disable-next-line no-new-func
  return new Function('say', 'return (' + src + ');')(eval(sayShimSrc));
}
const OLD_W4 = oldFn(OLD_W4_SRC);
const OLD_W5 = oldFn(OLD_W5_SRC);

function fakeGame(captured) {
  return { say(s) { captured.push(s); } };
}
function fixedCtx(round, total, vName) {
  return {
    round, total, vName: vName || 'TestVillager',
    rr: () => 0.5,
    lroll: (r) => r[0],
  };
}

// ================= RED: the inversion, executed from git =================
console.log('== RED (pre-fix, verbatim from a3f9e124^) ==');
{
  // --- audit, old: narrates the villager's trick taxed, halves MONSTER dmg
  const cap = [];
  const rec = {};
  const out = OLD_W4.call(fakeGame(cap), { id: 'audit' }, rec, fixedCtx(3, 80));
  const narr = cap.join(' ');
  ok(narr.includes('best trick') && narr.includes('Half strength'),
    'RED audit: narrates "best trick is taxed. Half strength."');
  ok(out === 40, 'RED audit: INVERSION — monster-side total halved 80->40 (got ' + out + ')');
  ok(rec.auditTaxRounds === undefined,
    'RED audit: no villager-side flag armed (rec.auditTaxRounds unset)');
  // --- editor, old: narrates the villager's swing cut, zeroes MONSTER dmg
  const cap5 = [];
  const rec5 = { log: [] };
  let out5;
  for (let r = 1; r <= 3; r++) {
    out5 = OLD_W5.call(fakeGame(cap5), { id: 'editor' }, rec5, fixedCtx(r, 90));
  }
  const log5 = rec5.log.join(' ');
  ok(log5.includes('cutting-room floor') && log5.includes('never happened'),
    'RED editor: narrates "swing hits the cutting-room floor. It never happened."');
  ok(out5 === 0, 'RED editor: INVERSION — monster-side total zeroed (return 0, got ' + out5 + ')');
  ok(rec5.editorCuts === undefined,
    'RED editor: no villager-side flag armed (rec.editorCuts unset)');
}

// ================= harness helper =================
function gameEval(seed, js, env) {
  const tmpFile = '/tmp/sigportfix-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\n');
  const code = `
${envLines}
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 800); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    const lines = r.trim().split('\n');
    return JSON.parse(lines[lines.length - 1] || '{}');
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// ================= GREEN: the honest ports, executed =================
console.log('== GREEN (current tree, executed in harness) ==');
{
  const o = gameEval(911, `
    const says = [];
    const G2 = { say(s) { says.push(s); } };
    // audit, round 3 (audit day)
    const rec = {};
    const r = Game.sigW4FieldMonster.call(G2, { id: 'audit' }, rec, {
      round: 3, total: 80, vName: 'TestVillager', rr: () => 0.5, lroll: (x) => x[0],
    });
    out.auditTotal = r; out.auditFlag = rec.auditTaxRounds; out.auditNarr = says.join(' ');
    // editor: 3 calls to reach the cut round
    const says5 = [];
    const G5 = { say(s) { says5.push(s); } };
    const rec5 = { log: [] };
    let r5;
    for (let q = 1; q <= 3; q++) {
      r5 = Game.sigW5FieldMonster.call(G5, { id: 'editor' }, rec5, {
        round: q, total: 90, vName: 'TestVillager', rr: () => 0.5, lroll: (x) => x[0],
      });
    }
    out.editorTotal = r5; out.editorFlag = rec5.editorCuts; out.editorLog = rec5.log.join(' ');
    // non-firing rounds: nothing armed, total untouched
    const recN = {};
    const rN = Game.sigW4FieldMonster.call(G2, { id: 'audit' }, recN, {
      round: 1, total: 80, vName: 'TestVillager', rr: () => 0.5, lroll: (x) => x[0],
    });
    out.nonfireTotal = rN; out.nonfireFlag = recN.auditTaxRounds;
  `);
  if (o.__err) console.log('  harness err: ' + o.__err);
  ok(o.auditFlag === 2, 'GREEN audit: arms rec.auditTaxRounds=2 (villager-side tax)');
  ok(o.auditTotal === 80, 'GREEN audit: monster-side total passes through UNCHANGED (80)');
  ok((o.auditNarr || '').includes('best trick') && (o.auditNarr || '').includes('Half strength'),
    'GREEN audit: narration still "best trick taxed, half strength" — now mechanically true');
  ok(o.editorFlag === 1, 'GREEN editor: arms rec.editorCuts=1 (villager-side cut)');
  ok(o.editorTotal === 90, 'GREEN editor: monster-side total passes through UNCHANGED (90, was return 0)');
  ok((o.editorLog || '').includes('swing is measured for the cut'),
    'GREEN editor: cut telegraphed in the log');
  ok(o.nonfireTotal === 80 && o.nonfireFlag === undefined,
    'GREEN audit non-fire round: total untouched, no tax flag armed');
}

// ================= DET-GATE =================
console.log('== DET-GATE (byte-identical trajectories, ports not firing) ==');
{
  // unit level: identical inputs -> identical outputs, twice
  const o = gameEval(912, `
    function runOnce() {
      const says = [];
      const G2 = { say(s) { says.push(s); } };
      const rec = {};
      const r = Game.sigW4FieldMonster.call(G2, { id: 'audit' }, rec, {
        round: 2, total: 77, vName: 'Det', rr: () => 0.25, lroll: (x) => x[0],
      });
      const rec5 = { log: [] };
      const r5 = Game.sigW5FieldMonster.call(G2, { id: 'editor' }, rec5, {
        round: 1, total: 66, vName: 'Det', rr: () => 0.25, lroll: (x) => x[0],
      });
      return JSON.stringify({ r, rec, r5, log5: rec5.log, says });
    }
    out.t1 = runOnce();
    out.t2 = runOnce();
  `);
  if (o.__err) console.log('  harness err: ' + o.__err);
  ok(o.t1 === o.t2 && !!o.t1, 'DET unit: identical inputs -> byte-identical outputs');
}

// ================= SENSE: narrations for the coherence read =================
console.log('== SENSE (captured beats) ==');
{
  const o = gameEval(914, `
    const says = [];
    const G2 = { say(s) { says.push(s); } };
    const rec = {};
    Game.sigW4FieldMonster.call(G2, { id: 'audit' }, rec, {
      round: 3, total: 80, vName: 'Mara', rr: () => 0.5, lroll: (x) => x[0],
    });
    out.auditBeat = says.join(' | ');
    // inefficient trick defeats it
    const saysI = [];
    const G3 = { say(s) { saysI.push(s); } };
    const recI = { trickInefficient: 1 };
    Game.sigW4FieldMonster.call(G3, { id: 'audit' }, recI, {
      round: 3, total: 80, vName: 'Mara', rr: () => 0.5, lroll: (x) => x[0],
    });
    out.ineffBeat = saysI.join(' | ');
    out.ineffFlag = recI.auditTaxRounds;
  `);
  if (o.__err) console.log('  harness err: ' + o.__err);
  console.log('  audit beat: ' + (o.auditBeat || '(none)'));
  console.log('  inefficient beat: ' + (o.ineffBeat || '(none)'));
  ok(o.ineffFlag === undefined, 'SENSE: inefficient trick leaves no tax armed ("nothing to tax")');
}

// ================= UNIT DELTA TABLE (100% attribution, no RNG) =================
console.log('== UNIT DELTA (old vs new port, rounds 1-9, total=100, lroll=min) ==');
{
  const o = gameEval(915, `
    const OLD_W4_SRC = ${JSON.stringify(OLD_W4_SRC)};
    const OLD_W5_SRC = ${JSON.stringify(OLD_W5_SRC)};
    const sayShim = (game, s) => { try { game.say(s); } catch (e) {} };
    const mkOld = (src) => new Function('say', 'return (' + src + ');')(sayShim);
    const G0 = { say(s) {} };
    const ctxFor = (round) => ({ round, total: 100, vName: 'Unit', rr: () => 0.5, lroll: (x) => x[0] });
    // audit: one rec per variant, 9 sequential rounds (matches engine use)
    function auditRun(fn) {
      const rec = {}; const rows = [];
      for (let r = 1; r <= 9; r++) {
        const ret = fn.call(G0, { id: 'audit' }, rec, ctxFor(r));
        rows.push({ round: r, ret, tax: rec.auditTaxRounds | 0 });
        // emulate the engine's villager-strike consumption: one strike/round
        if ((rec.auditTaxRounds | 0) > 0) rec.auditTaxRounds--;
      }
      return rows;
    }
    // editor: one rec per variant, 9 sequential calls
    function editorRun(fn) {
      const rec = { log: [] }; const rows = [];
      for (let r = 1; r <= 9; r++) {
        const ret = fn.call(G0, { id: 'editor' }, rec, ctxFor(r));
        rows.push({ round: r, ret, cut: rec.editorCuts | 0 });
        rec.editorCuts = 0; // engine consumes the flag in the strike block
      }
      return rows;
    }
    out.auditOld = auditRun(mkOld(OLD_W4_SRC));
    out.auditNew = auditRun(Game.sigW4FieldMonster);
    out.editorOld = editorRun(mkOld(OLD_W5_SRC));
    out.editorNew = editorRun(Game.sigW5FieldMonster);
  `);
  if (o.__err) console.log('  harness err: ' + o.__err);
  const tab = (name, oldR, newR, flag) => {
    console.log('  ' + name + ': round | old ret | new ret | new flag');
    oldR.forEach((or, i) => {
      const nr = newR[i];
      const mark = (or.ret !== nr.ret || or[flag] !== nr[flag]) ? '  <-- DIFFERS' : '';
      console.log(`    r${or.round} | ${or.ret} | ${nr.ret} | ${nr[flag]}${mark}`);
    });
  };
  if (o.auditOld) {
    tab('AUDIT (flag=auditTaxRounds)', o.auditOld.map(r => ({...r, auditTaxRounds: 0})), o.auditNew, 'tax');
    console.log('  (old audit has no flag column; old ret=50 on audit rounds = the inversion)');
    tab('EDITOR (flag=editorCuts)', o.editorOld.map(r => ({...r, editorCuts: 0})), o.editorNew, 'cut');
    console.log('  (old editor ret=0 on cut rounds = the inversion)');
    const aDiff = o.auditOld.filter((r, i) => r.ret !== o.auditNew[i].ret);
    const aTaxed = o.auditNew.filter(r => r.tax !== 0).map(r => r.round);
    ok(aDiff.length === 3 && aDiff.every(r => r.round % 3 === 0),
      'UNIT audit: old halves monster total exactly on rounds 3,6,9 (the inversion)');
    ok(JSON.stringify(aTaxed) === JSON.stringify([3, 4, 6, 7, 9]),
      'UNIT audit: new arms the VILLAGER tax for 2 rounds after each audit day (3,4 / 6,7 / 9) — TB-faithful');
    const eDiff = o.editorOld.filter((r, i) => r.ret !== o.editorNew[i].ret || o.editorNew[i].cut !== 0);
    ok(eDiff.length === 3 && eDiff.every(r => r.round % 3 === 0),
      'UNIT editor: exactly rounds 3,6,9 differ (old zeroes monster total; new arms villager cut)');
    ok(o.auditNew.every((r, i) => r.ret === 100),
      'UNIT audit new: monster-side total untouched on ALL rounds');
    ok(o.editorNew.every((r, i) => r.ret === 100),
      'UNIT editor new: monster-side total untouched on ALL rounds');
  } else { ok(false, 'unit delta table produced'); }
}

console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
if (fails.length) { console.log('failures: ' + fails.join('; ')); process.exit(1); }
