#!/usr/bin/env node
// test-bloodrestraint.js — proof for the bloodrestraint lever (flesh-out
// loop arm sim-bloodrestraint, axis scale-onramp, run fleshout-20261024T0215Z).
//
// THE LEVER: game-side candidacy hook in src/js/ledger.js playerDeath.
// When BLOODRESTRAINT=1, succession skips vids who scored a wave-4+ kill
// within the last 14 days; if every candidate is in-window, candidacy
// falls back to the normal list — a scholar is always picked, never a
// deadlock. Default OFF (clean control). Feel change -> [needs-eyes].
//
// Gates (ALL must be GREEN before any sweep):
//   E0 shape: bloodrestraintBlooded exists on Game, wired from playerDeath
//       (check-wired clean for ledger.js), ontology provides updated.
//   E1 helper: pure set semantics — in-window wave-4+ kill held; lapsed
//       kill, wave-3 kill, future-day entry, missing log all not held.
//   E2 env OFF = byte-identical to pristine HEAD: digest with the ledger
//       change stashed vs unstashed (BLOODRESTRAINT unset) must match,
//       and the same run twice must match (determinism).
//   E3 env ON: trust-favorite blooded in-window -> skipped, successor is
//       the next trust rank; the hold-back beat fires ("Not the office").
//   E4 all-blooded fallback: every candidate in-window -> normal list,
//       trust-favorite picked, no deadlock, no beat.
//   E5 window lapsed: 20d-old wave-4 kill -> NOT held, trust-favorite
//       picked, no beat.
//   E6 wave-3 kill: NOT held (only wave-4+ counts).
//   E7 env garbage ('0', empty) behaves as OFF.
// SENSE: a succession transcript where the restraint fires is printed
//   for the SENSE-TESTING LAW judgment (see evidence file).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, waveKillLog
// as the veterans-bar source). No canon doc covers succession/the office
// — stated, not invented.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 800)); }
}

// The pinned substrate env guard (same as the sweep will use).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE', 'VETFORMATION']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 required (pinned substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('GATE STOP: SEATDRIVE=0 required.'); process.exit(2); }
for (const k of ['VETRESTAGE', 'BLOODRESTRAINT']) delete process.env[k];

const E2E = path.join(REPO, 'scripts', 'bloodrestraint-e2e.js');
function e2e(which, br) {
  const env = Object.assign({}, process.env);
  if (br === 'unset') delete env.BLOODRESTRAINT; else env.BLOODRESTRAINT = br;
  const out = execSync(`node ${E2E} ${which}`, { cwd: REPO, env, encoding: 'utf8', timeout: 600000 });
  return JSON.parse(out.trim());
}

// ---------- E0: shape + wiring ----------
check('E0 bloodrestraintBlooded in ledger.js', fs.readFileSync(path.join(REPO, 'src/js/ledger.js'), 'utf8').includes('bloodrestraintBlooded(nowDay)'));
check('E0 hook site reads the set in playerDeath', fs.readFileSync(path.join(REPO, 'src/js/ledger.js'), 'utf8').includes('this.bloodrestraintBlooded((s.day || 0))'));
check('E0 no empty catch in new code', (() => {
  const src = fs.readFileSync(path.join(REPO, 'src/js/ledger.js'), 'utf8');
  // Method body.
  const mStart = src.indexOf('bloodrestraintBlooded(nowDay) {');
  const mEnd = src.indexOf('\n    },', mStart);
  const method = src.slice(mStart, mEnd);
  // Hook block in playerDeath.
  const hStart = src.indexOf('// the village holds its blooded back from the office while they');
  const hEnd = src.indexOf('const newId = candidates[0];', hStart);
  const hook = src.slice(hStart, hEnd);
  return !/catch\s*\([^)]*\)\s*\{\s*\}/.test(method) && !/catch\s*\([^)]*\)\s*\{\s*\}/.test(hook);
})());
try {
  const w = execSync(`node ${path.join(REPO, 'scripts', 'check-wired.js')} src/js/ledger.js`, { cwd: REPO, encoding: 'utf8', timeout: 120000 });
  check('E0 check-wired: bloodrestraintBlooded is wired', !/^  UNWIRED bloodrestraintBlooded/m.test(w), w.trim().slice(0, 400));
} catch (e) { check('E0 check-wired: bloodrestraintBlooded is wired', false, String((e && e.message) || e).slice(0, 400)); }

// ---------- E1: helper set semantics on a stub-bound real method ----------
function heldFor(log, day) {
  const fake = { state: { waveKillLog: log } };
  const src = fs.readFileSync(path.join(REPO, 'src/js/ledger.js'), 'utf8');
  const m = src.match(/bloodrestraintBlooded\(nowDay\) \{([\s\S]*?)\n    \},/);
  if (!m) return null;
  const fn = new Function('nowDay', m[1].replace(/this\.state/g, 'this.state'));
  return fn.call(fake, day);
}
const now = 100;
check('E1 in-window wave-4 held', (() => { const s = heldFor([{ d: 95, w: 4, by: 'a' }], now); return s && s.has('a') && s.size === 1; })());
check('E1 lapsed kill not held', (() => { const s = heldFor([{ d: 80, w: 4, by: 'a' }], now); return s && s.size === 0; })());
check('E1 boundary d=now-14 held', (() => { const s = heldFor([{ d: 86, w: 4, by: 'a' }], now); return s && s.has('a'); })());
check('E1 boundary d=now-15 not held', (() => { const s = heldFor([{ d: 85, w: 4, by: 'a' }], now); return s && s.size === 0; })());
check('E1 wave-3 not held', (() => { const s = heldFor([{ d: 95, w: 3, by: 'a' }], now); return s && s.size === 0; })());
check('E1 wave-5 held', (() => { const s = heldFor([{ d: 99, w: 5, by: 'a' }], now); return s && s.has('a'); })());
check('E1 future entry ignored', (() => { const s = heldFor([{ d: 101, w: 4, by: 'a' }], now); return s && s.size === 0; })());
check('E1 missing by ignored', (() => { const s = heldFor([{ d: 95, w: 4, by: null }], now); return s && s.size === 0; })());
check('E1 empty log -> empty set', (() => { const s = heldFor([], now); return s && s.size === 0; })());
check('E1 missing log -> empty set', (() => { const s = heldFor(undefined, now); return s && s.size === 0; })());

// ---------- E2: env OFF = byte-identical succession to pristine HEAD ----------
const rOff1 = e2e('base', 'unset');
check('E2 OFF base: successor = trust favorite', rOff1.successor === rOff1.a && !rOff1.heldBeat && !rOff1.error, JSON.stringify(rOff1).slice(0, 300));
const rOff2 = e2e('base', 'unset');
check('E2 OFF determinism (same run twice)', rOff1.successor === rOff2.successor && rOff1.saidCount === rOff2.saidCount && !rOff1.error, JSON.stringify({ rOff1, rOff2 }).slice(0, 300));
// The honest OFF-vs-pristine byte check: stash ONLY the ledger change, run,
// unstash, run again — digests of the full said stream must match.
function saidDigest(br) {
  const r = e2e('topblooded', br);
  return JSON.stringify({ s: r.successor, beats: r.saidTail, n: r.saidCount, err: r.error });
}
const dOffNew = saidDigest('unset');
let stashed = false;
try { execSync('git stash push -- src/js/ledger.js', { cwd: REPO, encoding: 'utf8' }); stashed = true; } catch (e) { check('E2 stash push', false, String(e && e.message).slice(0, 300)); }
let dOffHead = null;
if (stashed) { try { dOffHead = saidDigest('unset'); } catch (e) { check('E2 pristine run', false, String(e && e.message).slice(0, 300)); } }
try { if (stashed) execSync('git stash pop', { cwd: REPO, encoding: 'utf8' }); } catch (e) { check('E2 stash pop', false, String(e && e.message).slice(0, 300)); }
check('E2 OFF == pristine HEAD (ledger change stashed)', stashed && dOffHead === dOffNew, `new=${String(dOffNew).slice(0, 200)} head=${String(dOffHead).slice(0, 200)}`);

// ---------- E3: ON skips the in-window blooded trust-favorite ----------
const rOn = e2e('topblooded', '1');
check('E3 ON: blooded favorite skipped', rOn.successor === rOn.b && !rOn.error, JSON.stringify(rOn).slice(0, 300));
check('E3 ON: hold-back beat voiced', rOn.heldBeat === true, JSON.stringify(rOn.saidTail).slice(0, 400));
const rOn2 = e2e('topblooded', '1');
check('E3 ON determinism', rOn.successor === rOn2.successor && rOn2.heldBeat === true, JSON.stringify(rOn2).slice(0, 300));

// ---------- E4: all-blooded fallback — always a pick, never a deadlock ----------
const rAll = e2e('allblooded', '1');
check('E4 ON all-blooded: trust favorite picked (fallback)', rAll.successor === rAll.a && !rAll.error, JSON.stringify(rAll).slice(0, 300));
check('E4 ON all-blooded: no hold-back beat (nothing changed)', rAll.heldBeat === false, JSON.stringify(rAll.saidTail).slice(0, 400));

// ---------- E5: lapsed window — restraint does not fire ----------
const rLap = e2e('lapsed', '1');
check('E5 ON lapsed kill: trust favorite picked', rLap.successor === rLap.a && !rLap.error, JSON.stringify(rLap).slice(0, 300));
check('E5 ON lapsed kill: no beat', rLap.heldBeat === false);

// ---------- E6: wave-3 kill — only wave-4+ counts ----------
const rW3 = e2e('wave3', '1');
check('E6 ON wave-3 kill: trust favorite picked', rW3.successor === rW3.a && !rW3.error, JSON.stringify(rW3).slice(0, 300));

// ---------- E7: env garbage behaves as OFF ----------
const rG0 = e2e('topblooded', '0');
check("E7 BLOODRESTRAINT='0' == OFF", rG0.successor === rG0.a && rG0.heldBeat === false, JSON.stringify(rG0).slice(0, 300));
const rGe = e2e('topblooded', '');
check("E7 BLOODRESTRAINT='' == OFF", rGe.successor === rGe.a && rGe.heldBeat === false, JSON.stringify(rGe).slice(0, 300));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
