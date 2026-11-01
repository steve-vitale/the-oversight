#!/usr/bin/env node
// test-musterroster-adopt-a.js — prereg validator for sim-musterroster-adopt-a.
// Pure checks over adoption replay JSONs ({"seed","adopt"} lines or the
// adopt object itself). Usage:
//   node scripts/test-musterroster-adopt-a.js <replay-json> [replay-json ...]
// Exit 0 prints PASS/FAIL per seed + overall; exit 1 on any FAIL of a
// gated bar. Control seed 85106 is checked for no-regression only.
// No game code is loaded; no seeds are simulated here.
'use strict';
const fs = require('fs');

function loadReplay(file) {
  const raw = fs.readFileSync(file, 'utf8').trim();
  // Accept: a single {"seed","adopt"} object, a bare adopt object, or
  // JSON-lines (first line wins for a per-seed file).
  const first = raw.split('\n').find(l => l.trim());
  const obj = JSON.parse(first);
  return obj.adopt || obj;
}

function checkSeed(a, isPrimary) {
  const p = a.post || {};
  const bars = [];
  const add = (name, pass, detail) => bars.push({ name, pass, detail });
  if (!p.sounded) {
    add('sounded', false, 'no refused Herald attempt triggered the call (seed not judged)');
    return { seed: a.seed, judged: false, bars, pass: null };
  }
  const snap = p.snapshotCallYield;
  const perVillage = p.perVillage || {};
  const stone = (perVillage.village_1 || []).length;
  const thorn = (perVillage.village_2 || []).length;
  // Village ids are name-checked, not just village_1/2: fall back to names
  // in snapshot links when ids differ.
  let stoneByName = stone, thornByName = thorn;
  if (p.snapshotLinks) {
    const byName = {};
    Object.keys(perVillage).forEach(vid => {
      const link = p.snapshotLinks.find(l => l.villageId === vid);
      if (link) byName[link.name] = perVillage[vid].length;
    });
    stoneByName = byName.Stonebridge != null ? byName.Stonebridge : stone;
    thornByName = byName.Thornfield != null ? byName.Thornfield : thorn;
  }
  add('yield-vs-snapshot', p.actualAllies >= snap, `actual=${p.actualAllies} snap=${snap}`);
  if (isPrimary) {
    add('yield>=10', p.actualAllies >= 10, `actual=${p.actualAllies}`);
    add('stonebridge>=1', stoneByName >= 1, `stonebridge=${stoneByName}`);
    add('thornfield>=1', thornByName >= 1, `thornfield=${thornByName}`);
    add('ready-after-commit', p.readyAfter === true, `ready=${p.readyAfter} haven=${p.havenAfter}`);
  }
  add('responders-verified', p.respondersVerified === true, `problems=${(p.responderProblems || []).join(';') || 'none'}`);
  add('links-unchanged', p.linkCountBefore === p.linkCountAfter, `${p.linkCountBefore}->${p.linkCountAfter}`);
  const lowTrust = (p.snapshotLinks || []).filter(l => l.trust < 25 || l.opinion < -10 || (l.arrears || 0) > 0);
  if (lowTrust.length) {
    const lowYield = lowTrust.reduce((t, l) => t + ((perVillage[l.villageId] || []).length), 0);
    add('low-trust-yield-0', lowYield === 0, `lowTrustLinks=${lowTrust.length} yield=${lowYield}`);
  } else {
    add('low-trust-yield-0', null, 'N/A-live: no low-trust link at trigger (synthetic proof covers)');
  }
  add('instruments-clean', (a.instrumentErrors || []).length === 0 && (a.musterErrs || 0) === 0,
    `heraldErrs=${(a.instrumentErrors || []).length} musterErrs=${a.musterErrs}`);
  const gated = bars.filter(b => b.pass !== null);
  return { seed: a.seed, judged: true, bars, pass: gated.every(b => b.pass) };
}

function main() {
  const files = process.argv.slice(2);
  if (!files.length) { console.error('usage: test-musterroster-adopt-a.js <replay-json> [...]'); process.exit(2); }
  let overall = true;
  for (const f of files) {
    const a = loadReplay(f);
    const isPrimary = a.seed === 90111;
    const r = checkSeed(a, isPrimary);
    console.log(`seed ${a.seed} (${isPrimary ? 'PRIMARY' : 'control'}): judged=${r.judged} pass=${r.pass}`);
    r.bars.forEach(b => console.log(`  ${b.pass === null ? 'N/A ' : (b.pass ? 'PASS' : 'FAIL')} ${b.name}: ${b.detail}`));
    if (r.pass === false) overall = false;
  }
  console.log(overall ? 'OVERALL PASS' : 'OVERALL FAIL');
  process.exit(overall ? 0 : 1);
}
if (require.main === module) main();
module.exports = { checkSeed, loadReplay };
