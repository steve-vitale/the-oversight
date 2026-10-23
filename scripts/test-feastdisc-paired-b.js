#!/usr/bin/env node
// test-feastdisc-paired-b.js — proof gates for the paired fresh-seed
// confirm of FEASTDISC's damage-majority kill bar (loop B, run
// fleshout-loop-b-20261023T2030Z, ARM 2 of 3, axis food-economy).
//
// The reconfirm (58b6f79e2) NO-GO'd on the corpus-total bar (armed 4 vs
// control 4) because the control base rate moved 1/12 -> 4/16 — the
// pre-registered +2 margin is base-rate-limited at 16 seeds. Per kill
// discipline the lever is NOT killed; this run replaces the corpus-total
// bar with a PAIRED one-sided sign test per matched config (chaos-aware)
// on fresh seeds. The analyzer (scripts/analyze-feastdisc-paired-b.js)
// is the judging instrument — this test pins it BEFORE the sweep.
//
// Gates:
//   C1 seed-freshness + block selection: first fully-clean 16-block among
//      66501-66516, 66601-66616, 66701-66716 (filename criterion,
//      digit-boundary, over evidence/ + scripts/; zero script-content
//      hits; skip-set: this test itself). Excludes also the known-used
//      blocks (pilot 66021-66028, confirm 66111-66122, reconfirm-b
//      66301-66316, huntfix-adopt-b-pilot 66201-66216, huntfix-adopt-b
//      66401-66416).
//   C2 sweep determinism: selected block's first seed x {leadfeast} x
//      {control, feastdisc}, 60d, same config twice -> byte-identical
//      sweep JSONs (spawns the REUSED confirm sweep to a /tmp EVID dir).
//   C3 attribution units: kill-time + damage-majority attribution on
//      synthetic waveKillLog/KILLDISC rows — RED->GREEN.
//   C4 sign-test metric sanity: the ANALYZER's exact one-sided sign-test
//      p-value on synthetic pair sets + the (p<0.10, net>=4) GO arithmetic
//      — RED->GREEN. Uses the real exported functions, not a copy.
//   C5 analyzer pins the reconfirm corpus: the analyzer run on the
//      committed reconfirm corpus must reproduce its headline numbers
//      exactly (armed 4 vs control 4 dmgMaj kills; k_pos=4, k_neg=4,
//      net=0, p=0.63671875, verdict NO-GO). No sims — instrument check.
//
// Substrate: the non-seat long substrate
// (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
// KILLDISC=1 ARMORYDRIVE=1; VETREL/REPOSITION/VGEAR unset).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const CANDIDATE_BLOCKS = [66501, 66601, 66701];
const BLOCK_FILE = '/tmp/feastdisc-paired-b-block.txt';
const ANALYZER = require('./analyze-feastdisc-paired-b.js');

let pass = 0, fail = 0;
function gate(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}

function fileNames() {
  const names = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== '.git' && e.name !== 'node_modules') walk(p); }
      else names.push(path.relative(REPO, p));
    }
  };
  walk(path.join(REPO, 'evidence'));
  walk(path.join(REPO, 'scripts'));
  return names;
}
function seedFilenameHit(names, s) {
  const rx = new RegExp('(^|[/\\\\-])s?' + s + '(\\.|-|$)');
  return names.filter(n => rx.test(n));
}
function seedContentHit(scriptsJs, s, skip) {
  const rx = new RegExp('(?<![0-9])' + s + '(?![0-9])');
  const hits = [];
  for (const f of scriptsJs) {
    if (skip.has(path.basename(f))) continue;
    if (rx.test(fs.readFileSync(f, 'utf8'))) hits.push(f);
  }
  return hits;
}
function listJs(d) {
  const out = [];
  const walk = (x) => {
    for (const e of fs.readdirSync(x, { withFileTypes: true })) {
      const p = path.join(x, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith('.js')) out.push(p);
    }
  };
  walk(d);
  return out;
}

// ---------- C1: freshness gate + first-clean-block selection ----------
console.log('C1 seed-freshness + block selection');
let BLOCK = null;
{
  const names = fileNames();
  const js = listJs(path.join(REPO, 'scripts'));
  const skip = new Set(['test-feastdisc-paired-b.js']);
  for (const start of CANDIDATE_BLOCKS) {
    let clean = true;
    const seeds = [];
    for (let i = 0; i < 16; i++) {
      const s = start + i;
      seeds.push(s);
      const fHits = seedFilenameHit(names, s);
      if (fHits.length) { clean = false; console.log(`    block ${start}: seed ${s} filename hit: ${fHits.slice(0, 3).join(', ')}`); break; }
      const cHits = seedContentHit(js, s, skip);
      if (cHits.length) { clean = false; console.log(`    block ${start}: seed ${s} content hit: ${cHits.slice(0, 3).map(f => path.basename(f)).join(', ')}`); break; }
    }
    if (clean) { BLOCK = start; break; }
  }
  gate(BLOCK !== null, `first clean block among ${CANDIDATE_BLOCKS.join('/')} selected: ${BLOCK}`);
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
  const out1 = '/tmp/feastdisc-paired-b-det/a';
  const out2 = '/tmp/feastdisc-paired-b-det/b';
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
  gate(Array.isArray(j.w4killRows) && j.hasOwnProperty('nW4VillagersDmgMaj') && j.hasOwnProperty('fdTele'), 'sweep JSON carries w4killRows + nW4VillagersDmgMaj + fdTele');
  execFileSync('rm', ['-rf', '/tmp/feastdisc-paired-b-det']);
}

// ---------- C3: attribution units (mirror of the sweep's logic) ----------
console.log('C3 attribution units (synthetic, RED->GREEN)');
{
  function attribute(w4log, killdiscRows, bearerByDay, scholarVid) {
    const w4villagers = new Set(), w4villagersDmgMaj = new Set();
    for (const e of w4log) {
      const bearerAtKill = bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid;
      const isScholar = (e.by === bearerAtKill || e.by === 'player');
      if (!isScholar && e.by) w4villagers.add(e.by);
    }
    for (const k of killdiscRows) {
      const d = k.dmg || {};
      const sD = d.scholar || 0, cD = d.companion || 0, oD = d.other || 0;
      const tot = sD + cD + oD;
      const nonScholarShare = tot > 0 ? (cD + oD) / tot : 0;
      const dmgMaj = nonScholarShare >= 0.5;
      const bearerAtKill = bearerByDay[k.day] != null ? bearerByDay[k.day] : scholarVid;
      const killTimeVillager = k.by && k.by !== bearerAtKill && k.by !== 'player';
      if (killTimeVillager && dmgMaj && k.by) w4villagersDmgMaj.add(k.by);
    }
    return { w4villagers, w4villagersDmgMaj };
  }
  const bearerByDay = { 81: 'v_scholar', 52: 'v_scholar' };
  const scholarVid = 'v_scholar';
  const w4log = [
    { w: 4, d: 81, by: 'v_fatima' },   // villager, kill-time
    { w: 4, d: 52, by: 'v_scholar' },  // scholar bearerAtKill -> not villager
    { w: 4, d: 90, by: 'player' },     // player kill -> not villager
  ];
  const rows = [
    { day: 81, by: 'v_fatima', dmg: { scholar: 300, companion: 500, other: 0 } }, // share .625 -> dmgMaj villager
    { day: 52, by: 'v_fatima', dmg: { scholar: 0, companion: 800, other: 0 } },
    { day: 90, by: 'player', dmg: { scholar: 0, companion: 800, other: 0 } },     // by=player -> excluded
    { day: 91, by: 'v_rosa', dmg: { scholar: 600, companion: 300, other: 0 } },   // share .333 -> villager, not dmgMaj
  ];
  const { w4villagers, w4villagersDmgMaj } = attribute(w4log, rows, bearerByDay, scholarVid);
  gate(w4villagers.has('v_fatima') && !w4villagers.has('player') && !w4villagers.has('v_scholar'), 'kill-time villager set (log)');
  gate(w4villagersDmgMaj.has('v_fatima') && !w4villagersDmgMaj.has('v_rosa') && !w4villagersDmgMaj.has('player'), 'dmgMaj villager set (>=0.5 non-scholar share, bearer-aware)');
}

// ---------- C4: sign-test + GO arithmetic via the real analyzer ----------
console.log('C4 sign-test metric sanity (real analyzer, RED->GREEN)');
{
  const { signTestP, pairedVerdict } = ANALYZER;
  const approx = (a, b) => Math.abs(a - b) < 1e-9;
  // hand-checked exact values
  gate(approx(signTestP(5, 5), 1 / 32), 'signTestP(5,5)=0.03125');
  gate(approx(signTestP(4, 4), 1 / 16), 'signTestP(4,4)=0.0625');
  gate(approx(signTestP(10, 9), 11 / 1024), 'signTestP(10,9)=11/1024');
  gate(approx(signTestP(8, 4), 163 / 256), 'signTestP(8,4)=163/256');
  gate(approx(signTestP(7, 0), 1), 'signTestP(7,0)=1.0');
  const mkPairs = (pos, neg, ties) => {
    const p = [];
    for (let i = 0; i < pos; i++) p.push({ a: 1, c: 0 });
    for (let i = 0; i < neg; i++) p.push({ a: 0, c: 1 });
    for (let i = 0; i < ties; i++) p.push({ a: 0, c: 0 });
    return p;
  };
  const v1 = pairedVerdict(mkPairs(6, 1, 25));   // p=8/128=0.0625<0.10, net=5 -> GO
  gate(v1.go === true && approx(v1.p, 8 / 128) && v1.net === 5, 'GO case: k_pos=6 k_neg=1 net=5 p=0.0625');
  const v2 = pairedVerdict(mkPairs(4, 1, 27));   // p=6/32=0.1875>=0.10 -> NO-GO
  gate(v2.go === false && approx(v2.p, 6 / 32) && v2.net === 3, 'NO-GO case: net passes but p=0.1875 fails');
  const v3 = pairedVerdict(mkPairs(8, 3, 21));   // p=232/2048=0.113>=0.10, net=5 -> NO-GO
  gate(v3.go === false && approx(v3.p, 232 / 2048) && v3.net === 5, 'NO-GO case: p=0.113 fails despite net=5');
  const v4 = pairedVerdict(mkPairs(4, 0, 28));   // p=1/16=0.0625<0.10, net=4 -> GO (exact edge)
  gate(v4.go === true && v4.net === 4, 'GO edge case: net exactly +4');
  const v5 = pairedVerdict(mkPairs(0, 0, 32));   // no non-tied pairs
  gate(v5.go === false && v5.n === 0, 'NO-GO: all ties (n=0)');
  const v6 = pairedVerdict(mkPairs(3, 0, 29));   // p=1/8=0.125>=0.10, net=3 -> NO-GO
  gate(v6.go === false, 'NO-GO case: k_pos=3 net=3 p=0.125');
}

// ---------- C5: analyzer pins the reconfirm corpus ----------
console.log('C5 analyzer reproduces reconfirm corpus headline numbers');
{
  const { loadCorpus, pairedVerdict } = ANALYZER;
  const { A, C } = loadCorpus(path.join(REPO, 'evidence', '2026-10-23', 'perseed-feastdisc-reconfirm-b'));
  const cDM = C.reduce((x, r) => x + (r.nW4VillagersDmgMaj | 0), 0);
  const aDM = A.reduce((x, r) => x + (r.nW4VillagersDmgMaj | 0), 0);
  gate(cDM === 4 && aDM === 4, `corpus kill totals: control ${cDM} / armed ${aDM} (expected 4/4)`);
  const v = pairedVerdict(A.map(a => {
    const key = a.policy.replace(/-feastdisc$/, '') + '|' + a.seed;
    const c = C.find(x => x.policy + '|' + x.seed === key);
    return { a: a.nW4VillagersDmgMaj | 0, c: c.nW4VillagersDmgMaj | 0 };
  }));
  gate(v.kPos === 4 && v.kNeg === 4, `corpus pairs: k_pos=${v.kPos} k_neg=${v.kNeg} (expected 4/4, disjoint seeds)`);
  gate(v.net === 0 && Math.abs(v.p - 163 / 256) < 1e-9 && v.go === false, `corpus verdict: net=${v.net} p=${v.p.toFixed(9)} NO-GO (expected net=0, p=0.63671875)`);
}

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
