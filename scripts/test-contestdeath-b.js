#!/usr/bin/env node
// scripts/test-contestdeath-b.js — proof for sim-contestdeath-b.
// Reads the committed drive JSONs (pilot 10401-10408 + confirm
// 10411-10426, before/after, paths W/M/U) and asserts the prereg bars:
// coverage 0 before / >=0.80 after on W+M, zero duplicate-grief cases,
// roster-exit + ledger equality per pair, zero field corpses by design,
// and the sense lines (grief line + "is gone", each exactly once).
// Also asserts the fix markers exist in src/js/contests.js.
// Usage: node scripts/test-contestdeath-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const EV = path.join(ROOT, 'evidence', '2026-10-30');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra != null ? ' :: ' + extra : '')); }
}
function load(leg, seed, p) {
  return JSON.parse(fs.readFileSync(path.join(EV, `sim-contestdeath-b-${leg}-${seed}-${p}.json`), 'utf8'));
}
function legSet(leg, seeds) {
  const out = {};
  for (const s of seeds) for (const p of ['W', 'M', 'U']) out[s + '-' + p] = load(leg, s, p);
  return out;
}
function checkLeg(leg, seeds, wantCovered) {
  const set = legSet(leg, seeds);
  const n = Object.keys(set).length;
  check(`${leg}: ${n} drive files`, n === seeds.length * 3, String(n));
  const wm = Object.values(set).filter(d => d.path === 'W' || d.path === 'M');
  const cov = wm.filter(d => d.covered).length;
  check(`${leg}: W+M coverage ${wantCovered ? 'all' : 'zero'} (${cov}/${wm.length})`,
    wantCovered ? cov === wm.length : cov === 0, `${cov}/${wm.length}`);
  check(`${leg}: no drive errors`, Object.values(set).every(d => !d.error));
  if (wantCovered) {
    check(`${leg}: zero dupGrief`, Object.values(set).every(d => !d.dupGrief));
    check(`${leg}: every death teles=1 fallen=1`, Object.values(set).every(d =>
      d.after.teles === 1 && d.after.fallen === 1));
    check(`${leg}: every death grief=1 gossipDied=1 deathSeeds=0`, Object.values(set).every(d =>
      d.wrapper.villageDeathEvents === 1 && d.after.gossipDied === 1 && d.wrapper.deathSeeds === 0));
    check(`${leg}: zero field corpses by design`, Object.values(set).every(d => d.after.corpses === 0));
    check(`${leg}: every death deathSeen set`, Object.values(set).every(d => d.deathSeen === true));
    check(`${leg}: single contest register per death`, Object.values(set).every(d =>
      d.wrapper.registers.length === 1 && d.wrapper.registers[0].cause === 'contest' && d.wrapper.registers[0].kind === 'villager'));
  } else {
    check(`${leg}: every death teles=0 fallen=0 grief=0`, Object.values(set).every(d =>
      d.after.teles === 0 && d.after.fallen === 0 && d.wrapper.villageDeathEvents === 0));
    check(`${leg}: gossip still seeded (news existed pre-fix)`, Object.values(set).every(d => d.after.gossipDied === 1));
  }
  check(`${leg}: every death exits the roster`, Object.values(set).every(d => d.before.onRoster && !d.after.onRoster));
  return set;
}
const PILOT = [10401, 10402, 10403, 10404, 10405, 10406, 10407, 10408];
const CONFIRM = [];
for (let s = 10411; s <= 10426; s++) CONFIRM.push(s);
const pb = checkLeg('pilot-before', PILOT, false);
const pa = checkLeg('pilot-after', PILOT, true);
const cb = checkLeg('confirm-before', CONFIRM, false);
const ca = checkLeg('confirm-after', CONFIRM, true);
for (const [name, before, after] of [['pilot', pb, pa], ['confirm', cb, ca]]) {
  let eq = true;
  for (const k of Object.keys(before)) {
    const b = before[k], a = after[k];
    if ((b.ledgerAfter - b.ledgerBefore) !== (a.ledgerAfter - a.ledgerBefore)) eq = false;
    if (b.pid !== a.pid) eq = false;
  }
  check(`${name}: ledger deltas + victim identical before/after`, eq);
}
// Sense: pilot-after W transcript, seed 10401 — grief line once, "is
// gone" once, no repeated death line, blood-on-air present.
const w = pa['10401-W'];
const joined = (w.sayLines || []).join('\n');
const count = (re) => (joined.match(re) || []).length;
check('sense W: grief line exactly once', count(/fire feels smaller tonight/g) === 1, String(count(/fire feels smaller tonight/g)));
check('sense W: "is gone" exactly once', count(/is gone\. The village will say the name/g) === 1);
check('sense W: blood-on-air present', /BLOOD ON AIR/.test(joined));
check('sense W: first-grave present (first death of fresh game)', /FIRST GRAVE/.test(joined));
check('sense W: codex close-the-book line present', /entry for .* is finished\. No more pages/.test(joined));
const src = fs.readFileSync(path.join(ROOT, 'src/js/contests.js'), 'utf8');
check('fix marker: DEATH RECORD block present', /DEATH RECORD \(sim-contestdeath-b/.test(src));
check('fix marker: cause contest registerDeath', /cause: 'contest', killerId: null/.test(src));
check('fix marker: fallen push on first registration only', /if \(_corpse\)/.test(src) && /cause: 'contest', name: this\.fallenName/.test(src));
const diff = execSync('git diff --name-only HEAD -- src/js', { cwd: ROOT }).toString().trim();
check('fix committed (zero src/js diff vs HEAD)', diff === '', diff);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
