#!/usr/bin/env node
// analyze-feastdisc-paired-b.js — paired sign-test analysis for the
// FEASTDISC damage-majority kill bar (loop B, run fleshout-loop-b-20261023T2030Z,
// ARM 2 of 3). Seed-agnostic: discovers seeds from the perseed corpus
// filenames (keeps seed tokens out of script content for the C1 gate).
//
// Pre-registered primary (binding): per matched (seed x policy) pair,
// a_k = nW4VillagersDmgMaj (armed), c_k = nW4VillagersDmgMaj (control).
// Ties dropped. One-sided EXACT sign test H1 armed > control:
// p = P(Bin(n,1/2) >= k_pos). GO iff p < 0.10 AND net (k_pos-k_neg) >= +4.
//
// Exports pure functions for the proof test (C4/C5) so the gates pin the
// same code the verdict uses.
//
// Usage: node scripts/analyze-feastdisc-paired-b.js [EVID_DIR]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-23', 'perseed-feastdisc-paired-b');
const POLICIES = ['lead', 'belong'];

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let c = 1;
  for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1);
  return c;
}
// Exact one-sided sign-test p-value: P(Bin(n,1/2) >= kPos).
function signTestP(n, kPos) {
  if (n <= 0) return 1;
  let s = 0;
  for (let i = kPos; i <= n; i++) s += choose(n, i);
  return s / Math.pow(2, n);
}
// pairs: [{a: armed count, c: control count}]. Returns verdict object.
function pairedVerdict(pairs) {
  let kPos = 0, kNeg = 0, ties = 0;
  for (const p of pairs) {
    if (p.a > p.c) kPos++;
    else if (p.c > p.a) kNeg++;
    else ties++;
  }
  const n = kPos + kNeg;
  const net = kPos - kNeg;
  const p = signTestP(n, kPos);
  return { kPos, kNeg, ties, n, net, p, go: (p < 0.10 && net >= 4) };
}

function discoverSeeds(arm, dir) {
  const seeds = new Set();
  for (const p of POLICIES) {
    for (const f of fs.readdirSync(dir)) {
      const m = new RegExp('^' + arm + '-' + p + '-s(\\d+)\\.json$').exec(f);
      if (m) seeds.add(parseInt(m[1], 10));
    }
  }
  return [...seeds].sort((a, b) => a - b);
}
function loadCorpus(dir) {
  const seeds = discoverSeeds('control', dir);
  if (!seeds.length) { console.error('NO SEEDS in ' + dir); process.exit(2); }
  const load = (arm) => {
    const rows = [];
    for (const p of POLICIES) {
      for (const s of seeds) {
        const fp = path.join(dir, `${arm}-${p}-s${s}.json`);
        if (!fs.existsSync(fp)) { console.error('MISSING ' + fp); process.exit(2); }
        rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
      }
    }
    return rows;
  };
  return { A: load('feastdisc'), C: load('control'), seeds };
}
function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

if (require.main === module) {
  const { A, C, seeds: SEEDS } = loadCorpus(DIR);
  const NCFG = C.length;
  const key = (r) => String(r.policy).replace(/-feastdisc$/, '') + '|' + r.seed;
  const cMap = new Map(C.map(r => [key(r), r]));
  const pairs = A.map(a => ({ a, c: cMap.get(key(a)) }));
  if (pairs.some(p => !p.c)) { console.error('UNPAIRED ROWS'); process.exit(2); }
  console.log(`corpus: ${SEEDS.length} seeds [${SEEDS[0]}..${SEEDS[SEEDS.length - 1]}] x 2 policies x 2 arms = ${NCFG * 2} configs`);

  // ---- PRIMARY: paired sign test on damage-majority kill counts ----
  const counts = pairs.map(p => ({ a: p.a.nW4VillagersDmgMaj | 0, c: p.c.nW4VillagersDmgMaj | 0 }));
  const v = pairedVerdict(counts);
  console.log('\n== PRIMARY (paired sign test, binding) ==');
  console.log(`pairs: ${counts.length}, ties: ${v.ties}, n=${v.n}, k_pos=${v.kPos}, k_neg=${v.kNeg}, net=${v.net}, p=${v.p.toFixed(9)}`);
  console.log(`GO = p < 0.10 AND net >= +4 -> ${v.go ? 'GO' : 'NO-GO'}`);
  // reference totals (non-binding here, for comparison to confirm/reconfirm)
  const cDM = C.reduce((x, r) => x + (r.nW4VillagersDmgMaj | 0), 0);
  const aDM = A.reduce((x, r) => x + (r.nW4VillagersDmgMaj | 0), 0);
  console.log(`corpus totals: control ${cDM} vs armed ${aDM} damage-majority kills`);
  for (const r of A.filter(r => (r.nW4VillagersDmgMaj | 0) >= 1)) {
    const rows = (r.w4killRows || []).filter(k => k.dmgMaj && k.killTimeVillager);
    console.log(`  armed ${r.policy} s${r.seed}: ` + rows.map(k => `${k.byName} d${k.day} ${k.mid} share=${k.nonScholarShare}`).join('; '));
  }
  for (const r of C.filter(r => (r.nW4VillagersDmgMaj | 0) >= 1)) {
    const rows = (r.w4killRows || []).filter(k => k.dmgMaj && k.killTimeVillager);
    console.log(`  ctrl  ${r.policy} s${r.seed}: ` + rows.map(k => `${k.byName} d${k.day} ${k.mid} share=${k.nonScholarShare}`).join('; '));
  }
  // share distributions on kill-time villager wave-4 kills
  const shares = (rows) => rows.flatMap(r => (r.w4killRows || []).filter(k => k.killTimeVillager)).map(k => k.nonScholarShare).sort((x, y) => x - y);
  console.log(`armed kill-time dmgMaj share dist (n=${A.filter(r => (r.nW4VillagersDmgMaj | 0) >= 1).length} configs): ` +
    A.filter(r => (r.nW4VillagersDmgMaj | 0) >= 1).flatMap(r => (r.w4killRows || []).filter(k => k.dmgMaj && k.killTimeVillager).map(k => k.nonScholarShare)).sort((x, y) => x - y).join(', '));
  console.log(`ctrl  kill-time dmgMaj share dist (n=${C.filter(r => (r.nW4VillagersDmgMaj | 0) >= 1).length} configs): ` +
    C.filter(r => (r.nW4VillagersDmgMaj | 0) >= 1).flatMap(r => (r.w4killRows || []).filter(k => k.dmgMaj && k.killTimeVillager).map(k => k.nonScholarShare)).sort((x, y) => x - y).join(', '));

  // ---- SECONDARIES ----
  const cKT = C.reduce((x, r) => x + (r.nW4Villagers | 0), 0);
  const aKT = A.reduce((x, r) => x + (r.nW4Villagers | 0), 0);
  const cKTS = C.filter(r => (r.nW4Villagers | 0) >= 1).length;
  const aKTS = A.filter(r => (r.nW4Villagers | 0) >= 1).length;
  const cEng = C.reduce((x, r) => x + (r.w4EngageEvents | 0), 0);
  const aEng = A.reduce((x, r) => x + (r.w4EngageEvents | 0), 0);
  const cEngF = C.reduce((x, r) => x + (r.w4EngageFeasted | 0), 0);
  const aEngF = A.reduce((x, r) => x + (r.w4EngageFeasted | 0), 0);
  const cStg = C.reduce((x, r) => x + (((r.fdTele || {}).feastsStaged) | 0), 0);
  const aStg = A.reduce((x, r) => x + (((r.fdTele || {}).feastsStaged) | 0), 0);
  const cFst = C.reduce((x, r) => x + (r.nFeasts | 0), 0);
  const aFst = A.reduce((x, r) => x + (r.nFeasts | 0), 0);
  console.log('\n== SECONDARY ==');
  console.log(`kill-time villager w4 kills: control ${cKT} (${cKTS}/${NCFG} configs) vs armed ${aKT} (${aKTS}/${NCFG})`);
  console.log(`feasted-engagement rate: control ${cEngF}/${cEng} (${(100 * cEngF / Math.max(1, cEng)).toFixed(1)}%) vs armed ${aEngF}/${aEng} (${(100 * aEngF / Math.max(1, aEng)).toFixed(1)}%)`);
  console.log(`layer-staged feasts: control ${cStg} vs armed ${aStg} (tele.feastsStaged; control should be 0)`);
  console.log(`total feasts: control ${cFst} vs armed ${aFst}`);
  const aShares = shares(A), cSharesAll = shares(C);
  console.log(`mean non-scholar damage share on armed kill-time villager kills: ${aShares.length ? (aShares.reduce((x, y) => x + y, 0) / aShares.length).toFixed(2) + ` (n=${aShares.length})` : 'n/a'}`);
  console.log(`mean non-scholar damage share on control kill-time villager kills: ${cSharesAll.length ? (cSharesAll.reduce((x, y) => x + y, 0) / cSharesAll.length).toFixed(2) + ` (n=${cSharesAll.length})` : 'n/a'}`);

  // ---- GUARDRAILS ----
  const survDiffs = pairs.map(p => (p.a.days | 0) - (p.c.days | 0));
  const cStarv = C.reduce((x, r) => x + (r.starvationDeaths | 0), 0);
  const aStarv = A.reduce((x, r) => x + (r.starvationDeaths | 0), 0);
  const cCauses = {}, aCauses = {};
  for (const r of C) for (const [k, vv] of Object.entries(r.deathCauses || {})) cCauses[k] = (cCauses[k] | 0) + vv;
  for (const r of A) for (const [k, vv] of Object.entries(r.deathCauses || {})) aCauses[k] = (aCauses[k] | 0) + vv;
  const allCauses = new Set([...Object.keys(cCauses), ...Object.keys(aCauses)]);
  const newModes = [...allCauses].filter(k => (aCauses[k] | 0) >= 2 && !(cCauses[k] | 0));
  console.log('\n== GUARDRAILS ==');
  console.log(`median survival: control ${median(C.map(r => r.days | 0)).toFixed(1)}d vs armed ${median(A.map(r => r.days | 0)).toFixed(1)}d; paired median diff ${median(survDiffs).toFixed(1)}d (bar: >= -10)`);
  console.log(`survival paired diffs range: ${Math.min(...survDiffs)}..${Math.max(...survDiffs)}`);
  console.log(`starvation deaths: control ${cStarv} vs armed ${aStarv} (bar: <= control+3)`);
  console.log(`new death modes (>=2-event rule): ${newModes.length ? newModes.join(', ') : 'none'}`);
  for (const [lbl, m] of [['control', cCauses], ['armed', aCauses]]) {
    const top = Object.entries(m).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([k, vv]) => `${k}=${vv}`).join(', ');
    console.log(`  ${lbl}: ${top}`);
  }

  // ---- WALL ----
  console.log('\n== WALL (scale-onramp) ==');
  for (const [lbl, rows] of [['control', C], ['armed', A]]) {
    const sum = (k) => rows.reduce((x, r) => x + (r[k] | 0), 0);
    console.log(`${lbl}: national ${sum('national')}/${NCFG}, table ${sum('table')}/${NCFG}, won ${sum('won')}/${NCFG}, ` +
      `wave4 ${sum('wave4')}/${NCFG}, wave5 ${sum('wave5')}/${NCFG}, median ${median(rows.map(r => r.days | 0)).toFixed(1)}d, max ${Math.max(...rows.map(r => r.days | 0))}d`);
  }
  for (const [lbl, rows] of [['control', C], ['armed', A]]) {
    const dist = {};
    for (const r of rows) dist[r.maxWave | 0] = (dist[r.maxWave | 0] | 0) + 1;
    console.log(`${lbl} maxWave distribution: ` + Object.entries(dist).sort((x, y) => x[0] - y[0]).map(([k, vv]) => `w${k}=${vv}`).join(' '));
  }
}

module.exports = { signTestP, pairedVerdict, loadCorpus };
