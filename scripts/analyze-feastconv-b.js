#!/usr/bin/env node
// analyze-feastconv-b.js — per-engagement conversion analysis for
// sim-feastconv-b (loop B, run fleshout-loop-b-20261023T2230Z, food-economy
// axis). The 2030Z metric review's named bar for the FEASTDISC=1 layer.
//
// PRIMARY (pre-registered, binding, §14): per-engagement conversion rate —
// of feasted wave-4 ENGAGEMENTS, the fraction yielding a companion-majority
// (kill-time villager damage-majority) kill.
//   denominator = rows of w4EngageDetail with feasted === true (one row per
//     fight; fightId-unique per the sweep's startCombat census).
//   numerator   = denominator rows whose (day, mid) matches a kill-time
//     villager dmgMaj kill row (kill rows deduped by (day, mid) — the
//     known KILLDISC double-fire duplicate counts once).
// Pooled across the arm (all seeds x policies), not per-config mean.
// GO iff armed_rate >= control_rate + 15pp AND armed_rate >= 30% absolute.
// A miss is NO-GO — never re-scored mid-run (§14).
//
// Exports pure functions for the proof test (C3/C4/C5) so the gates pin
// the same code the verdict uses.
//
// Usage: node scripts/analyze-feastconv-b.js [EVID_DIR]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-23', 'perseed-feastconv-b');
const POLICIES = ['lead', 'belong'];

// Kill rows matched by (day, mid), deduped — the KILLDISC double-fire
// duplicate (two identical kill rows for one fight) must count once.
function killKeys(config) {
  const s = new Set();
  for (const k of (config.w4killRows || [])) {
    if (k && k.killTimeVillager && k.dmgMaj) s.add(k.day + '|' + k.mid);
  }
  return s;
}
// Per-config per-engagement conversion. Rows with feasted==null (no
// matching startCombat census) are excluded from the denominator and
// counted separately — they cannot be attributed either way.
function configConversion(config) {
  const kills = killKeys(config);
  let total = 0, feasted = 0, converted = 0, nullFeast = 0;
  for (const e of (config.w4EngageDetail || [])) {
    total++;
    if (e.feasted === true) {
      feasted++;
      if (kills.has(e.day + '|' + e.mid)) converted++;
    } else if (e.feasted == null) {
      nullFeast++;
    }
  }
  return { total, feasted, converted, nullFeast, rate: feasted ? converted / feasted : null };
}
// Pooled arm conversion.
function armConversion(configs) {
  let total = 0, feasted = 0, converted = 0, nullFeast = 0;
  for (const g of configs) {
    const r = configConversion(g);
    total += r.total; feasted += r.feasted; converted += r.converted; nullFeast += r.nullFeast;
  }
  return { total, feasted, converted, nullFeast, rate: feasted ? converted / feasted : null };
}
// Binding GO arithmetic: armed >= control + 15pp AND armed >= 30% absolute.
function conversionVerdict(aRate, cRate) {
  if (aRate == null || cRate == null) return { go: false, why: 'empty-denominator' };
  const diff = aRate - cRate;
  const go = (diff >= 0.15 - 1e-9) && (aRate >= 0.30 - 1e-9);
  return { go, diff, aRate, cRate };
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
  console.log(`corpus: ${SEEDS.length} seeds [${SEEDS[0]}..${SEEDS[SEEDS.length - 1]}] x 2 policies x 2 arms = ${NCFG * 2} configs`);

  // ---- PRIMARY: per-engagement conversion, pooled per arm ----
  const aC = armConversion(A), cC = armConversion(C);
  const v = conversionVerdict(aC.rate, cC.rate);
  console.log('\n== PRIMARY (per-engagement conversion, binding) ==');
  console.log(`control: ${cC.converted}/${cC.feasted} = ${cC.rate == null ? 'n/a' : (100 * cC.rate).toFixed(1) + '%'}` +
    `  (unfeasted excluded: ${cC.total - cC.feasted - cC.nullFeast}, feasted-null: ${cC.nullFeast})`);
  console.log(`armed:   ${aC.converted}/${aC.feasted} = ${aC.rate == null ? 'n/a' : (100 * aC.rate).toFixed(1) + '%'}` +
    `  (unfeasted excluded: ${aC.total - aC.feasted - aC.nullFeast}, feasted-null: ${aC.nullFeast})`);
  console.log(`diff (armed - control): ${v.diff == null ? 'n/a' : (100 * v.diff).toFixed(1) + 'pp'}; ` +
    `GO = armed >= control + 15pp AND armed >= 30% -> ${v.go ? 'GO' : 'NO-GO'}`);
  // per-policy breakdown (descriptive, not the bar)
  const byPol = (rows) => {
    const out = {};
    for (const p of POLICIES) {
      const cc = armConversion(rows.filter(r => String(r.policy).replace(/-feastdisc$/, '').startsWith(p)));
      out[p] = cc;
    }
    return out;
  };
  for (const [lbl, bp] of [['control', byPol(C)], ['armed', byPol(A)]]) {
    console.log(`  ${lbl} per-policy: ` + POLICIES.map(p => `${p} ${bp[p].converted}/${bp[p].feasted}` +
      (bp[p].rate == null ? '' : ` (${(100 * bp[p].rate).toFixed(1)}%)`)).join('  '));
  }
  // configs contributing conversions
  const convList = (rows, lbl) => {
    const hit = rows.filter(r => configConversion(r).converted >= 1);
    console.log(`  ${lbl} configs with >=1 converted feasted engagement: ${hit.length}/${rows.length}`);
    for (const r of hit) {
      const kills = killKeys(r);
      const det = (r.w4EngageDetail || []).filter(e => e.feasted === true && kills.has(e.day + '|' + e.mid));
      console.log(`    ${r.policy} s${r.seed}: ` + det.map(e => `${e.mid} d${e.day}`).join('; '));
    }
  };
  convList(A, 'armed');
  convList(C, 'ctrl');

  // ---- SECONDARIES ----
  const cKT = C.reduce((x, r) => x + (r.nW4Villagers | 0), 0);
  const aKT = A.reduce((x, r) => x + (r.nW4Villagers | 0), 0);
  const cEng = C.reduce((x, r) => x + (r.w4EngageEvents | 0), 0);
  const aEng = A.reduce((x, r) => x + (r.w4EngageEvents | 0), 0);
  const cStg = C.reduce((x, r) => x + (((r.fdTele || {}).feastsStaged) | 0), 0);
  const aStg = A.reduce((x, r) => x + (((r.fdTele || {}).feastsStaged) | 0), 0);
  const cFst = C.reduce((x, r) => x + (r.nFeasts | 0), 0);
  const aFst = A.reduce((x, r) => x + (r.nFeasts | 0), 0);
  console.log('\n== SECONDARY ==');
  console.log(`kill-time villager w4 kills: control ${cKT} vs armed ${aKT}`);
  console.log(`feasted-engagement rate: control ${cC.feasted}/${cEng} (${(100 * cC.feasted / Math.max(1, cEng)).toFixed(1)}%) vs armed ${aC.feasted}/${aEng} (${(100 * aC.feasted / Math.max(1, aEng)).toFixed(1)}%)`);
  console.log(`layer-staged feasts: control ${cStg} vs armed ${aStg} (tele.feastsStaged; control should be 0)`);
  console.log(`total feasts: control ${cFst} vs armed ${aFst}`);
  const shares = (rows) => rows.flatMap(r => (r.w4killRows || []).filter(k => k.killTimeVillager).map(k => k.nonScholarShare)).sort((x, y) => x - y);
  const dmgMajShares = (rows) => rows.flatMap(r => (r.w4killRows || []).filter(k => k.killTimeVillager && k.dmgMaj).map(k => k.nonScholarShare)).sort((x, y) => x - y);
  const aS = shares(A), cS = shares(C);
  const aDM = dmgMajShares(A), cDM = dmgMajShares(C);
  console.log(`kill-time villager wave-4 kills with dmgMaj shares: armed n=${aDM.length} [${aDM.join(', ')}] vs control n=${cDM.length} [${cDM.join(', ')}]`);
  console.log(`mean non-scholar damage share (all kill-time villager w4 kills): armed ${aS.length ? (aS.reduce((x, y) => x + y, 0) / aS.length).toFixed(2) + ` (n=${aS.length})` : 'n/a'} vs control ${cS.length ? (cS.reduce((x, y) => x + y, 0) / cS.length).toFixed(2) + ` (n=${cS.length})` : 'n/a'}`);

  // ---- GUARDRAILS ----
  const key = (r) => String(r.policy).replace(/-feastdisc$/, '') + '|' + r.seed;
  const cMap = new Map(C.map(r => [key(r), r]));
  const pairs = A.map(a => ({ a, c: cMap.get(key(a)) }));
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

module.exports = { killKeys, configConversion, armConversion, conversionVerdict, loadCorpus };
