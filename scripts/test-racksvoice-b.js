#!/usr/bin/env node
// test-racksvoice-b.js — proof for the racks-full voice census
// (sim-racksvoice-b, 2026-10-26, oversight-flesh-out-loop-b).
//
// T1 (run BEFORE the sweep): cook/kcal parsers on the known
// saystub-b lines, plus the gate read from src/js/game.js.
// T2 (run AFTER the sweep): corpus validity + verdict checks:
// 16 files, batches >= resolutions, worked == resolutions on
// every cap1 cell, neutrality cap0 vs cap1, and the DIAG-GO
// conditions (9757 reproduced-or-explained; gate+shape named
// on >= 6/8 seeds, deviating seeds listed).
// Usage: node scripts/test-racksvoice-b.js [--corpus-only]
// Zero game changes; reads files only (plus a game.js grep).
'use strict';
const fs = require('fs');
const path = require('path');
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function cookOf(text) {
  const m = String(text || '').match(/^🍲 (\S+) cooked for the haven/);
  if (m) return m[1];
  const m2 = String(text || '').match(/so (\S+) left the fresh pile/);
  return m2 ? m2[1] : '?';
}
function keptKcalOf(text) {
  const m = String(text || '').match(/\(([\d,]+) kcal kept/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
}

// ---- T1: parsers on known saystub-b lines (verbatim from its evidence)
const RF9753 = '🍲 Owen cooked for the haven — meals stretched. The racks are already full (53,848 kcal kept — more than the haven can eat before it turns), so Owen left the fresh pile for tonight\'s dinner instead of smoking it onto the rot pile.';
const W9753 = '🍲 Owen cooked for the haven — meals stretched. Owen worked the smoke racks too — 2 batches preserved (~3762 kcal, keeps for weeks).';
check('T1 cookOf racks-full = Owen', cookOf(RF9753) === 'Owen', cookOf(RF9753));
check('T1 keptKcalOf racks-full = 53848', keptKcalOf(RF9753) === 53848, String(keptKcalOf(RF9753)));
check('T1 cookOf worked = Owen', cookOf(W9753) === 'Owen');
check('T1 keptKcalOf worked = null (different template)', keptKcalOf(W9753) === null);
check('T1 cookOf plain frame = cook', cookOf('🍲 Wei cooked for the haven — meals stretched.') === 'Wei');

// ---- T1: gate read from game.js (not asserted from memory)
const gameJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
check('T1 game.js has per-cook-day voice gate', /_rfv\[vid\] !== day/.test(gameJs) && /_racksFullVoice/.test(gameJs));
check('T1 game.js racks-full condition uses rackCap', /preservedKcal >= rackCap/.test(gameJs));
check('T1 game.js racks-full voice needs eligible surplus', /racksFull && eligible\.length/.test(gameJs));
check('T1 game.js rackCap formula 125*roster', /125 \* \(\(v\.roster/.test(gameJs));

const corpusOnly = process.argv.includes('--corpus-only');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-racksvoice-b-corpus');
const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
if (!corpusOnly && !fs.existsSync(dir)) {
  console.log('NOTE: corpus dir absent — T2 skipped (run after the sweep). T1 only.');
  console.log(`\n${pass} PASS / ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}
// ---- T2: corpus
const fields = ['daysAlive', 'preserveVillagerBatches', 'preserveVillagerKcal', 'preserveVillagerResolutions', 'deaths', 'national', 'waveReach', 'rank'];
let namedSeeds = 0, deviating = [];
for (const seed of seeds) {
  const c0p = path.join(dir, `racksvoice-b-cap0-pd0-dg1-leadfeast-s${seed}.json`);
  const c1p = path.join(dir, `racksvoice-b-cap1-pd0-dg1-leadfeast-s${seed}.json`);
  check(`T2 seed ${seed} cap0+cap1 files present`, fs.existsSync(c0p) && fs.existsSync(c1p));
  if (!fs.existsSync(c0p) || !fs.existsSync(c1p)) { deviating.push(seed); continue; }
  const c0 = JSON.parse(fs.readFileSync(c0p, 'utf8'));
  const c1 = JSON.parse(fs.readFileSync(c1p, 'utf8'));
  check(`T2 seed ${seed} batches>=resolutions`, c1.preserveVillagerBatches >= c1.preserveVillagerResolutions, `${c1.preserveVillagerBatches} vs ${c1.preserveVillagerResolutions}`);
  check(`T2 seed ${seed} worked==resolutions`, c1.workedLines === c1.preserveVillagerResolutions, `worked=${c1.workedLines} res=${c1.preserveVillagerResolutions}`);
  const neutral = fields.every(f => JSON.stringify(c0[f]) === JSON.stringify(c1[f]));
  check(`T2 seed ${seed} neutrality cap0==cap1`, neutral, fields.filter(f => JSON.stringify(c0[f]) !== JSON.stringify(c1[f])).join(','));
  if (c1.census && c1.racksFullLines != null) {
    const sumByCook = Object.values(c1.census.racksFullByCook || {}).reduce((a, b) => a + b, 0);
    check(`T2 seed ${seed} by-cook sums to racksFull total`, sumByCook === c1.racksFullLines, `${sumByCook} vs ${c1.racksFullLines}`);
    // per-cook daily ceiling: no cook exceeds distinct days counted... actually
    // per-cook count must equal its distinct-day count if the gate holds
    // (one voice per cook-day); a mismatch is a gate-reset signal, named not hidden.
    let gateHolds = true;
    for (const c of Object.keys(c1.census.racksFullByCook || {})) {
      if (c1.census.racksFullByCook[c] !== (c1.census.racksFullDaysByCook[c] || []).length) gateHolds = false;
    }
    check(`T2 seed ${seed} per-cook count == per-cook distinct days (gate holds)`, gateHolds);
    namedSeeds++;
  } else { deviating.push(seed); }
}
const s9757 = path.join(dir, 'racksvoice-b-cap1-pd0-dg1-leadfeast-s9757.json');
if (fs.existsSync(s9757)) {
  const c = JSON.parse(fs.readFileSync(s9757, 'utf8'));
  console.log(`INFO 9757 racksFull=${c.racksFullLines} (saystub: 106) byCook=${JSON.stringify(c.census ? c.census.racksFullByCook : null)} distinctDays=${c.census ? c.census.racksFullDistinctDays : null} kcalRange=${c.census ? c.census.racksFullKcalMin + '..' + c.census.racksFullKcalMax : null} distinctKcal=${c.census ? c.census.racksFullKcalDistinct : null}`);
}
console.log(`INFO named seeds with census: ${namedSeeds}/8; deviating/missing: ${deviating.join(',') || 'none'}`);
console.log(`\n${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
