#!/usr/bin/env node
// test-guarde-entry-b.js — PROOF TEST (sim-guarde-entry-b).
// Prereg: evidence/2026-11-02/sim-guarde-entry-b-prereg.md
// (committed BEFORE any judged sim).
//
// Runs NO new sims (fixture + synthetic stub Game only):
// (a) variant allow' definition on synthetic hops, incl.
//     the 69502 creek shape and a pocket-entry shape
//     (E fail + entry clear => allow' FALSE);
// (b) veto invariance on the predecessor pilot corpus
//     as a fixture (every E-fail hop => allow' FALSE;
//     allow' subset of E-pass);
// (c) reused-files-unmodified git check;
// (d) analyzer reproduces creekhop pilot fidelity
//     (24/28 E-pass) and computes allow' fidelity 24/24
//     on the pilot fixture (fixture, NOT judged evidence);
// (e) prereg fixes the judged band seeds/routes.
// Exit non-zero on any failure.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { allowPrime, allowPrimeFromRecord } = require('./policies/competent-guarde-entry-b');

const ROOT = path.join(__dirname, '..');
let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// --- Synthetic stub Game: 9x9 revealed board, blockFn decides ---
function stubGame(blockFn) {
  const tiles = [];
  for (let y = 0; y < 9; y++) { const row = []; for (let x = 0; x < 9; x++) row.push({}); tiles.push(row); }
  return {
    map: { tiles, px: 4, py: 4 },
    state: { village: { px: 4, py: 4 } },
    tileAt(x, y) {
      if (y < 0 || y >= 9 || x < 0 || x >= 9) return null;
      return { revealed: true, type: 'meadow', stock: 0 };
    },
    travelBlockage(x, y, fx, fy) { return blockFn(x, y, fx, fy); },
  };
}
const none = () => null;

// (a1) 69502 creek shape: E pass (escape from (7,1) home is
// open) + creek entry block => allow' FALSE.
{
  const G = stubGame((x, y, fx, fy) => ((x === 7 && y === 1 && fx === 7 && fy === 2) ? { blockType: 'creek' } : null));
  const r = allowPrime(G, 7, 2, 7, 1, 4, 4);
  check('synthetic-69502-creek: E pass', r.eOk === true, r);
  check('synthetic-69502-creek: entry blocked creek', r.entryBlocked === true && r.entryBlockers.length === 1 && r.entryBlockers[0].blockType === 'creek', r);
  check("synthetic-69502-creek: allow' FALSE", r.allow === false, r);
}
// (a2) Pocket-entry shape: E fail (no route home from dest)
// + entry CLEAR => allow' FALSE (veto invariance, unit level).
{
  const G = stubGame((x, y, fx, fy) => ((x === 7 && y === 3 && fx === 7 && fy === 4) ? null : { blockType: 'creek' }));
  const r = allowPrime(G, 7, 4, 7, 3, 4, 4);
  check('synthetic-pocket: E fail', r.eOk === false, r);
  check('synthetic-pocket: entry clear', r.entryBlocked === false, r);
  check("synthetic-pocket: allow' FALSE despite clear entry", r.allow === false, r);
}
// (a3) Clean allow: E pass + entry clear => allow' TRUE.
{
  const G = stubGame(none);
  const r = allowPrime(G, 4, 4, 5, 4, 4, 4);
  check('synthetic-clean: E pass', r.eOk === true, r);
  check("synthetic-clean: allow' TRUE", r.allow === true, r);
}
// (a4) Pure-record form agrees with the live form on the
// 69502 shape: record {E pass, entry [creek]} => FALSE.
{
  const r = allowPrimeFromRecord({ E: { ok: true }, entry: { blockers: [{ x: 7, y: 1, blockType: 'creek' }] } });
  check("record-69502: allow' FALSE", r.allow === false && r.vetoOld === false && r.vetoNew === true, r);
  const p = allowPrimeFromRecord({ E: { ok: false }, entry: { blockers: [] } });
  check('record-pocket: veto under both rules', p.vetoOld === true && p.vetoNew === true && p.allow === false, p);
}

// (b) Predecessor pilot corpus as fixture.
const pilotPath = path.join(ROOT, 'evidence/2026-11-02/sim-guarde-creekhop-b-pilot.jsonl');
const pilot = fs.readFileSync(pilotPath, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
check('fixture: pilot seeds exactly 69501-69508', JSON.stringify(pilot.map((r) => r.seed).sort((a, b) => a - b)) === JSON.stringify([69501, 69502, 69503, 69504, 69505, 69506, 69507, 69508]));
let hops = [];
for (const leg of pilot) for (const h of (leg.hops || []).filter((x) => x.attempted)) hops.push({ seed: leg.seed, hop: h });
check('fixture: 34 attempted hops', hops.length === 34, hops.length);
let ePass = 0, ePassMoved = 0, allowPass = 0, allowPassMoved = 0, eFail = 0, eFailAllowFalse = 0, entryAgree = 0;
let hop69502 = null;
for (const { seed, hop } of hops) {
  const ap = allowPrimeFromRecord(hop);
  if (ap.eOk) { ePass++; if (hop.moved) ePassMoved++; }
  else { eFail++; if (!ap.allow) eFailAllowFalse++; }
  if (ap.allow) { allowPass++; if (hop.moved) allowPassMoved++; }
  if ((!ap.entryBlocked) === !!hop.moved) entryAgree++;
  if (seed === 69502 && hop.from.x === 7 && hop.from.y === 2 && hop.to.x === 7 && hop.to.y === 1) hop69502 = { ap, hop };
}
check('fixture: E-pass fidelity 24/28', ePass === 28 && ePassMoved === 24, { ePass, ePassMoved });
check("fixture: allow' fidelity 24/24", allowPass === 24 && allowPassMoved === 24, { allowPass, allowPassMoved });
check('fixture: veto invariance (all E-fail => allow false)', eFail === 6 && eFailAllowFalse === 6, { eFail, eFailAllowFalse });
check("fixture: allow' subset of E-pass", allowPass <= ePass);
check('fixture: entry agreement 34/34', entryAgree === 34, entryAgree);
check('fixture: 69502 hop E pass + creek entry + refused',
  !!hop69502 && hop69502.ap.eOk === true && hop69502.ap.entryBlocked === true
  && hop69502.ap.entryBlockers[0].blockType === 'creek' && hop69502.hop.moved === false && hop69502.ap.allow === false, hop69502);

// (c) Reused files unmodified.
// RULE-4 NOTE (gap-guardedeploy 2026-11-02): scripts/policies/
// competent-homewardstep-b.js is EXEMPT from this check — this deploy
// INTENTIONALLY edits the guard file (entry-checked allow deploy:
// allow' = E ok AND entry clear, plus entry veto wording and the
// roadwork credit-pool carve-out). The exemption covers exactly that
// deploy change, not drift: the recorder, competent.js, and src/js
// must still be unmodified.
{
  const guarded = ['scripts/creekhop-b-recorder.js', 'scripts/policies/competent.js'];
  let clean = true, detail = {};
  for (const f of guarded) {
    try {
      const out = execSync('git status --porcelain -- ' + f, { cwd: ROOT, encoding: 'utf8' }).trim();
      const diff = execSync('git diff HEAD -- ' + f, { cwd: ROOT, encoding: 'utf8' }).trim();
      detail[f] = { status: out, diff: diff.slice(0, 100) };
      if (out || diff) clean = false;
    } catch (e) { clean = false; detail[f] = { error: String(e.message).slice(0, 200) }; }
  }
  try {
    const srcDiff = execSync('git status --porcelain -- src/js', { cwd: ROOT, encoding: 'utf8' }).trim();
    detail['src/js'] = { status: srcDiff };
    if (srcDiff) clean = false;
  } catch (e) { clean = false; detail['src/js'] = { error: String(e.message).slice(0, 200) }; }
  check('reused-files-unmodified (recorder, competent.js, src/js; guard policy exempt: intentionally modified by this deploy)', clean, detail);
}

// (d) Analyzer on the fixture reproduces both fidelities.
{
  let out = '';
  try {
    out = execSync('node scripts/analyze-guarde-entry-b.js evidence/2026-11-02/sim-guarde-creekhop-b-pilot.jsonl', { cwd: ROOT, encoding: 'utf8' });
  } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  check("analyzer-fixture: EPASS fidelity=24/28", out.includes('EPASS fidelity=24/28'), out.slice(-400));
  check("analyzer-fixture: ALLOWPRIME fidelity=24/24", out.includes('ALLOWPRIME fidelity=24/24'), out.slice(-400));
  check('analyzer-fixture: ENTRY agreement=34/34', out.includes('ENTRY agreement=34/34'), out.slice(-400));
  check('analyzer-fixture: vetoChangesOnEfail=0', out.includes('vetoChangesOnEfail=0'), out.slice(-400));
}

// (e) Prereg fixes the judged band.
{
  const pre = fs.readFileSync(path.join(ROOT, 'evidence/2026-11-02/sim-guarde-entry-b-prereg.md'), 'utf8');
  check('prereg: A seeds 69501-69508', pre.includes('69501-69508'));
  check('prereg: C seeds 69606, 69607', pre.includes('69606') && pre.includes('69607'));
  check('prereg: A route', pre.includes('5,4;6,4;7,4;7,3;7,2;7,1'));
  check('prereg: C route', pre.includes('4,5;4,6;4,7;4,8;3,8;2,8'));
  check("prereg: allow' definition E + checkHop", pre.includes("allow'(origin -> dest) = escapeCheck(dest).ok"));
  check('prereg: GO bar >= 95%', pre.includes('>= 95%'));
  check('prereg: no live default change stated', pre.includes('zero live default change') || pre.includes('JUDGED INSTRUMENT ONLY'));
}

console.log('test-guarde-entry-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
