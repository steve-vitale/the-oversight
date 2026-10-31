#!/usr/bin/env node
// test-partyvolley-20261031.js — proof for sim-partyvolley-b.
// Independently re-derives the pilot-gate numbers from the committed
// corpus (never trusting the fixture script's own summary), checks the
// engine-cap claims (ghost second ally, shout-never, dual equip), and
// re-runs the fixture twice to /tmp for the determinism gate.
// Writes nothing into the repo (temp outputs go to /tmp).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name + (detail !== undefined ? ' (' + detail + ')' : '')); }
  else { fail++; console.log('FAIL ' + name + (detail !== undefined ? ' (' + detail + ')' : '')); }
}
function median(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

const corpusPath = path.join(REPO, 'evidence', '2026-10-31', 'perseed-partyvolley-b', 'fixture-band.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const fights = corpus.fights;
check('corpus has 32 pilot fights, 0 confirm fights',
  fights.length === 32 && fights.every(f => f.stage === 'pilot'),
  'n=' + fights.length);
const p3 = fights.filter(f => f.party === 3);
check('pilot P3 subset is 20 fights', p3.length === 20, 'n=' + p3.length);
const medRounds = median(p3.map(f => f.rounds));
const medTotal = median(p3.map(f => f.totalDmg));
const fromStartRate = p3.filter(f => f.fromStartJoined).length / p3.length;
check('G1 from-start join >= 0.9', fromStartRate >= 0.9, 'rate=' + fromStartRate);
check('G2 gate miss confirmed: median rounds 2 < 3 (the kill reason)', medRounds === 2 && medRounds < 3, 'median=' + medRounds);
check('G3 median total >= 71', medTotal >= 71, 'median=' + medTotal);
check('pilot gate verdict is killed-at-pilot (no confirm)',
  corpus.pilotPass === false && corpus.confirmVerdict === 'DIAG-NO-GO (pilot gate)' && !corpus.confirm,
  'pilotPass=' + corpus.pilotPass + ' verdict=' + corpus.confirmVerdict);
// Independent gate verdict: G1 pass, G2 fail, G3 pass -> gate fails.
check('independent gate math: G1 pass, G2 fail, G3 pass',
  fromStartRate >= 0.9 && medRounds < 3 && medTotal >= 71, '');
// Ghost second ally: P2-DUAL and P3-DUAL congregation identical per stream.
let ghostOk = true;
for (const s of [101, 102, 103, 104]) {
  const a = fights.find(f => f.variant === 'P2-DUALxcongregation' && f.stream === s);
  const b = fights.find(f => f.variant === 'P3-DUALxcongregation' && f.stream === s);
  if (!a || !b) { ghostOk = false; break; }
  for (const k of ['rounds', 'outcome', 'totalDmg', 'volleyDmg', 'allyDealt', 'vTaken', 'vHpLeft']) {
    if (a[k] !== b[k]) { ghostOk = false; console.log('  ghost diff s' + s + ' ' + k + ': ' + a[k] + ' vs ' + b[k]); }
  }
}
check('ghost ally: P2-DUAL == P3-DUAL congregation on all 4 streams', ghostOk);
// Shout never fires on any from-start fight.
const fromStartFights = fights.filter(f => f.fromStartJoined);
check('shout never fires on from-start fights',
  fromStartFights.length > 0 && fromStartFights.every(f => !f.shoutJoined),
  'fromStart=' + fromStartFights.length + ' shout=' + fromStartFights.filter(f => f.shoutJoined).length);
// Dual equip proof.
const dual = fights.filter(f => f.tier === 'DUAL' || f.tier === 'HIDE');
check('dual equip: machete + crude_bow on every DUAL/HIDE fight',
  dual.length > 0 && dual.every(f => f.equippedMelee === 'machete' && f.equippedRanged === 'crude_bow'),
  'n=' + dual.length);
check('HIDE torso is hide_armor',
  fights.filter(f => f.tier === 'HIDE').every(f => f.equippedTorso === 'hide_armor'));
// Damage arithmetic per fight.
let arithOk = true;
for (const f of fights) {
  const v = f.volleyDmg || 0, a = f.allyDealt || 0;
  if (f.totalDmg !== f.leaderDealt + v + a) { arithOk = false; console.log('  arith diff ' + f.variant + ' s' + f.stream); }
}
check('damage arithmetic: total == leader + volley + ally on all fights', arithOk);
// Kill/drive-off zero on pilot.
check('kills/drive-offs 0 on all 32 pilot fights',
  fights.every(f => f.outcome !== 'vKill' && f.outcome !== 'mFlee'),
  'outs=' + JSON.stringify(fights.reduce((o, f) => { o[f.outcome] = (o[f.outcome] || 0) + 1; return o; }, {})));
// DPR median vs yardstick (secondary, reported not judged).
const dprs = p3.filter(f => f.rounds > 0).map(f => f.dpr);
console.log('INFO P3 median sustained DPR=' + median(dprs) + ' (yardstick 57.25)');
// Determinism gate: two fresh runs to /tmp, byte-identical to each other and corpus.
const t1 = '/tmp/pv-proof1.json', t2 = '/tmp/pv-proof2.json';
execSync('node ' + path.join(REPO, 'scripts', 'partyvolley-fixture-20261031.js') + ' ' + t1, { cwd: REPO, stdio: 'pipe' });
execSync('node ' + path.join(REPO, 'scripts', 'partyvolley-fixture-20261031.js') + ' ' + t2, { cwd: REPO, stdio: 'pipe' });
const b1 = fs.readFileSync(t1), b2 = fs.readFileSync(t2), bc = fs.readFileSync(corpusPath);
check('det-gate: two fresh runs byte-identical', b1.equals(b2));
check('det-gate: fresh run byte-identical to committed corpus', b1.equals(bc));
try { fs.unlinkSync(t1); fs.unlinkSync(t2); } catch (e) {}

console.log('RESULT: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
