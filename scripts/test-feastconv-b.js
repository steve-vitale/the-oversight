#!/usr/bin/env node
// test-feastconv-b.js — proof gates for sim-feastconv-b (loop B, run
// fleshout-loop-b-20261023T2230Z, food-economy axis), per the 2030Z metric
// review: FEASTDISC=1 under the PER-ENGAGEMENT conversion bar.
//
//   C1 seed-freshness + block selection: first fully-clean 16-block among
//      68511-68526, 68611-68626, 68711-68726 (filename criterion,
//      digit-boundary, over evidence/ (excl. this run's own perseed dir,
//      written after the gates) + scripts/; zero script-content hits;
//      skip-set: this test itself). Known-excluded: 68501/68508 (partially
//      touched), 66501-66516 (paired-b), 66301-66316 (reconfirm),
//      66111-66122 (confirm), 66021-66028 (pilot), 66201-66216 / 66401-66416
//      (huntfix-adopt-b).
//   C2 sweep determinism: selected block's first seed x {leadfeast} x
//      {control, feastdisc}, 60d, same config twice -> byte-identical
//      sweep JSONs (spawns the REUSED confirm sweep to a /tmp evidence dir).
//   C3 per-engagement counting units: kill-row dedup, engagement<->kill
//      (day,mid) matching, feasted-null and non-feasted exclusion,
//      bearer/player kills non-converting — RED->GREEN on the real
//      analyzer exports.
//   C4 conversion-verdict arithmetic: GO/NO-GO edges of the pre-registered
//      bar (armed >= control+15pp AND armed >= 30%) — RED->GREEN on the
//      real exported function.
//   C5 analyzer pins the committed paired-b corpus: the NEW analyzer run
//      on evidence/2026-10-23/perseed-feastdisc-paired-b must reproduce
//      mechanically-derived headline quantities (control 3/24=12.5%,
//      armed 7/50=14.0%; the hand-verified feastdisc-lead-s66512 config
//      conversion 2/4=0.50). No sims — pure determinism of the new
//      instrument.
//
// Substrate: the non-seat long substrate
// (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
// KILLDISC=1 ARMORYDRIVE=1; VETREL/REPOSITION/VGEAR unset).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const CANDIDATE_BLOCKS = [68511, 68611, 68711];
const BLOCK_FILE = '/tmp/feastconv-b-block.txt';
const ANALYZER = require('./analyze-feastconv-b.js');
const THIS_FILE = path.basename(__filename);

let pass = 0, fail = 0;
function gate(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}

function fileNames(dir, out) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, f.name);
    if (fp.includes('perseed-feastconv-b')) continue; // this run's own corpus, written after the gates
    if (f.isDirectory()) fileNames(fp, out);
    else out.push(f.name);
  }
}
function seedFilenameHit(names, s) {
  const re = new RegExp('(^|[^0-9])' + s + '([^0-9]|$)');
  return names.filter(n => re.test(n));
}
function listJs(dir, out) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, f.name);
    if (f.isDirectory()) { if (f.name !== 'node_modules') listJs(fp, out); }
    else if (/\.js$/.test(f.name)) out.push(fp);
  }
}
function seedContentHit(jsFiles, s, skip) {
  const re = new RegExp('(^|[^0-9])' + s + '([^0-9]|$)');
  const hits = [];
  for (const f of jsFiles) {
    if (path.basename(f) === skip) continue;
    let txt = '';
    try { txt = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
    const lines = txt.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) { hits.push(path.basename(f) + ':' + (i + 1)); break; }
    }
  }
  return hits;
}

// ---------- C1: freshness gate + first-clean-block selection ----------
console.log('C1 seed-freshness + block selection');
let BLOCK = null;
{
  const names = [];
  fileNames(path.join(REPO, 'evidence'), names);
  fileNames(path.join(REPO, 'scripts'), names);
  const js = [];
  listJs(path.join(REPO, 'scripts'), js);
  for (const start of CANDIDATE_BLOCKS) {
    let clean = true;
    for (let i = 0; i < 16; i++) {
      const s = start + i;
      const fHits = seedFilenameHit(names, s);
      if (fHits.length) { clean = false; console.log(`    block ${start}: seed ${s} filename hit: ${fHits.slice(0, 3).join(', ')}`); break; }
      const cHits = seedContentHit(js, s, THIS_FILE);
      if (cHits.length) { clean = false; console.log(`    block ${start}: seed ${s} content hit: ${cHits.slice(0, 3).join(', ')}`); break; }
    }
    if (clean) { BLOCK = start; break; }
  }
  gate(BLOCK !== null, `first clean block among ${CANDIDATE_BLOCKS.join('/')} selected: ${BLOCK}`);
  gate(BLOCK === CANDIDATE_BLOCKS[0], `first candidate (68511-68526) was clean — selected as expected`);
  if (BLOCK === null) { console.error('FATAL: no clean block'); process.exit(1); }
  fs.writeFileSync(BLOCK_FILE, String(BLOCK), 'utf8');
  console.log(`    block ${BLOCK} -> ${BLOCK + 15}; written to ${BLOCK_FILE}`);
}

// ---------- C2: determinism of the reused confirm sweep ----------
console.log('C2 confirm-sweep determinism (60d x2, selected block first seed)');
{
  const seed = BLOCK;
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
    SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1',
    REPO,
  });
  delete env.VETREL; delete env.REPOSITION; delete env.VGEAR;
  const out1 = '/tmp/feastconv-b-det/a';
  const out2 = '/tmp/feastconv-b-det/b';
  const sweep = path.join(REPO, 'scripts', 'sweep-feastdisc-confirm-20261022.js');
  const run = (arm, dir) => {
    execFileSync('rm', ['-rf', dir]);
    const e = Object.assign({}, env, { ARM: arm, SEEDS: String(seed), POLICIES: 'leadfeast', DAYS: '60', EVID: dir });
    if (arm === 'feastdisc') e.FEASTDISC = '1'; else delete e.FEASTDISC;
    execFileSync(process.execPath, [sweep], { env: e, stdio: 'pipe', cwd: REPO });
  };
  run('control', out1); run('control', out2);
  const a = fs.readFileSync(path.join(out1, `control-lead-s${seed}.json`), 'utf8');
  const b = fs.readFileSync(path.join(out2, `control-lead-s${seed}.json`), 'utf8');
  gate(a === b, 'control 60d re-run byte-identical');
  run('feastdisc', out1); run('feastdisc', out2);
  const a2 = fs.readFileSync(path.join(out1, `feastdisc-lead-s${seed}.json`), 'utf8');
  const b2 = fs.readFileSync(path.join(out2, `feastdisc-lead-s${seed}.json`), 'utf8');
  gate(a2 === b2, 'feastdisc 60d re-run byte-identical');
  const j = JSON.parse(a2);
  gate(Array.isArray(j.w4killRows) && Array.isArray(j.w4EngageDetail) && j.hasOwnProperty('fdTele'),
    'sweep JSON carries w4killRows + w4EngageDetail + fdTele (engagement scope)');
  gate(String(j.policy).includes('feastdisc') && j.substrate.includes('FEASTDISC=1'),
    'armed JSON carries the FEASTDISC=1 substrate');
  execFileSync('rm', ['-rf', '/tmp/feastconv-b-det']);
}

// ---------- C3: per-engagement counting units (real analyzer, RED->GREEN) ----------
console.log('C3 per-engagement counting units (synthetic, RED->GREEN)');
{
  const { killKeys, configConversion, armConversion } = ANALYZER;
  // synthetic config shaped like the hand-verified feastdisc-lead-s66512:
  // 4 feasted engagements, kills: 2 dmgMaj villager (one duplicated row),
  // 1 non-dmgMaj villager, 1 player dmgMaj.
  const cfg = {
    w4EngageDetail: [
      { day: 77, mid: 'suburb', fightId: 'f1', feasted: true },
      { day: 80, mid: 'reunion', fightId: 'f2', feasted: true },
      { day: 101, mid: 'influencer', fightId: 'f3', feasted: true },
      { day: 107, mid: 'strike', fightId: 'f4', feasted: true },
      { day: 107, mid: 'suburb', fightId: 'f5', feasted: false }, // not feasted -> excluded
      { day: 120, mid: 'choir', fightId: 'f6', feasted: null },    // census-miss -> excluded, counted
    ],
    w4killRows: [
      { day: 77, mid: 'suburb', by: 'v_adil', killTimeVillager: true, dmgMaj: true },
      { day: 107, mid: 'strike', by: 'v_ruth', killTimeVillager: true, dmgMaj: true },
      { day: 107, mid: 'strike', by: 'v_ruth', killTimeVillager: true, dmgMaj: true }, // KILLDISC double-fire dup
      { day: 80, mid: 'reunion', by: 'v_sam', killTimeVillager: true, dmgMaj: false }, // not dmgMaj
      { day: 101, mid: 'influencer', by: 'player', killTimeVillager: false, dmgMaj: true }, // player kill
    ],
  };
  gate(killKeys(cfg).size === 2, 'killKeys dedups the double-fired kill row (2 unique kills)');
  const r = configConversion(cfg);
  gate(r.feasted === 4 && r.total === 6, 'denominator = 4 feasted engagements (of 6 rows)');
  gate(r.converted === 2, '2 feasted engagements convert (d77 suburb, d107 strike)');
  gate(r.nullFeast === 1, '1 feasted-null row counted separately');
  gate(r.rate === 0.5, 'conversion rate 2/4 = 0.50');
  // kill on a non-feasted engagement must NOT convert
  const cfg2 = {
    w4EngageDetail: [{ day: 9, mid: 'suburb', fightId: 'g1', feasted: false }],
    w4killRows: [{ day: 9, mid: 'suburb', by: 'v_x', killTimeVillager: true, dmgMaj: true }],
  };
  const r2 = configConversion(cfg2);
  gate(r2.feasted === 0 && r2.converted === 0 && r2.rate === null, 'non-feasted engagements excluded (empty denominator -> null rate)');
  const c = armConversion([cfg, cfg2]);
  gate(c.feasted === 4 && c.converted === 2 && c.rate === 0.5, 'armConversion pools across configs');
}

// ---------- C4: conversion-verdict arithmetic (real analyzer, RED->GREEN) ----------
console.log('C4 conversion-verdict arithmetic (real analyzer, RED->GREEN)');
{
  const { conversionVerdict } = ANALYZER;
  gate(conversionVerdict(0.40, 0.20).go === true, 'GO: armed 0.40 vs control 0.20 (+20pp, abs>=30%)');
  gate(conversionVerdict(0.30, 0.15).go === true, 'GO: exact edges (0.30 >= 0.15+0.15 AND 0.30 >= 0.30)');
  gate(conversionVerdict(0.34, 0.20).go === false, 'NO-GO: +14pp < +15pp');
  gate(conversionVerdict(0.29, 0.05).go === false, 'NO-GO: abs 0.29 < 0.30');
  gate(conversionVerdict(0.20, 0.40).go === false, 'NO-GO: control wins');
  gate(conversionVerdict(null, 0.2).go === false && conversionVerdict(0.5, null).go === false,
    'NO-GO: empty denominator on either arm');
  const v = conversionVerdict(0.45, 0.25);
  gate(Math.abs(v.diff - 0.20) < 1e-9, 'verdict reports the exact diff (0.20)');
}

// ---------- C5: analyzer pins the committed paired-b corpus ----------
console.log('C5 analyzer pins the committed paired-b corpus (no sims)');
{
  const { loadCorpus } = ANALYZER;
  const DIR = path.join(REPO, 'evidence', '2026-10-23', 'perseed-feastdisc-paired-b');
  const { A, C, seeds } = loadCorpus(DIR);
  gate(seeds.length === 16, `paired corpus has 16 seeds (${seeds.length})`);
  const { armConversion, configConversion } = ANALYZER;
  const aC = armConversion(A), cC = armConversion(C);
  gate(aC.feasted === 50 && aC.converted === 7, `armed per-engagement 7/50 = ${(aC.converted / aC.feasted).toFixed(4)}`);
  gate(cC.feasted === 24 && cC.converted === 3, `control per-engagement 3/24 = ${(cC.converted / cC.feasted).toFixed(4)}`);
  gate(Math.abs(aC.rate - 0.14) < 1e-9 && Math.abs(cC.rate - 0.125) < 1e-9,
    'rates match the mechanically-derived reference (armed 0.1400, control 0.1250)');
  const one = JSON.parse(fs.readFileSync(path.join(DIR, 'feastdisc-lead-s66512.json'), 'utf8'));
  const r = configConversion(one);
  gate(r.feasted === 4 && r.converted === 2 && r.rate === 0.5,
    'hand-verified config feastdisc-lead-s66512 converts 2/4 = 0.50');
  const { conversionVerdict } = ANALYZER;
  const v = conversionVerdict(aC.rate, cC.rate);
  gate(v.go === false && Math.abs(v.diff - 0.015) < 1e-9,
    'old-corpus reference verdict is NO-GO (+1.5pp < +15pp; informational, not re-scored)');
}

console.log(`\nRESULT: ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
