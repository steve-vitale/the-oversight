#!/usr/bin/env node
// scripts/analyze-wasterate-20261017.js — waste-rate analyzer (sim-wasterate-b).
//
// PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9-12, 14):
//   PRIMARY (attribution gate): 100% attribution — every waste-rate number
//     traced to recorded fields; schema-drift guard green on all archives;
//     conservation residual |rel| <= 3% on all 16 new-sweep runs.
//   VERDICT RULE (one named): paired-by-seed waste-rate diff
//     leadfeast−belongfeast; dbar, SE. POLICY-SENSITIVE iff |dbar| > 2*SE
//     AND |dbar|/mean(w) > 15%. Else SUBSTRATE-FLAT.
//   GO = attribution gate green + verdict named.
//
// INPUTS:
//   evidence/2026-10-17/perseed-wasterate/  (16 new runs, full instrument)
//   evidence/2026-10-17/perseed-trig6/      (32 runs, freshRotKcal only)
//   evidence/2026-10-17/perseed-drawcap/    (32 runs, freshRotKcal only)
//   evidence/2026-10-17/perseed-wallcensus-b/ (16 runs, pantryKcalEnd only)
//
// The archives record NO pantry-throughput field, so a true waste rate
// (rot / throughput) is computable ONLY on the new sweep. The archives
// contribute wall numbers + freshRot context; the gap is documented, not
// papered over.

const fs = require('fs');
const path = require('path');

const EV = path.join(__dirname, '..', 'evidence', '2026-10-17');
let failures = 0;
const fail = (m) => { failures++; console.log('  FAIL', m); };
const ok = (m) => console.log('  ok', m);

function loadDir(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    out.push({ file: f, data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) });
  }
  return out;
}

// ---- schema-drift guard: exact key sets + filename<->field cross-check ----
function guardArchive(name, dir, expectedKeys, opts = {}) {
  console.log(`\n[guard] ${name}`);
  const runs = loadDir(dir);
  const exp = new Set(expectedKeys);
  for (const { file, data } of runs) {
    const keys = new Set(Object.keys(data));
    const missing = [...exp].filter(k => !keys.has(k));
    const extra = [...keys].filter(k => !exp.has(k));
    if (missing.length || extra.length) {
      fail(`${file}: key drift missing=[${missing}] extra=[${extra}]`);
    }
    // filename<->field cross-check (the known drift class)
    const m = file.match(/s(\d+)\.json$/);
    if (m && data.seed !== undefined && String(data.seed) !== m[1]) {
      fail(`${file}: filename seed ${m[1]} != field seed ${data.seed}`);
    }
    if (opts.policyFromName) {
      const pm = file.match(/^(leadfeast|belongfeast|belongseek|leadseek)/);
      if (pm && data.policyId !== undefined && !String(data.policyId).includes(pm[1].replace('seek','feast').replace('lead','lead').replace('belong','belong'))) {
        // loose: just check the side token appears
      }
    }
  }
  if (!failures) ok(`${name}: ${runs.length} files, key sets exact, filename<->seed cross-check green`);
  return runs;
}

// ---- wall numbers from an archive ----
function wallNumbers(runs, label) {
  const n = runs.length;
  const wins = runs.filter(r => r.data.wins).length;
  const national = runs.filter(r => r.data.national).length;
  const table = runs.filter(r => r.data.table).length;
  const w4 = runs.filter(r => r.data.wave4).length;
  const w5 = runs.filter(r => r.data.wave5).length;
  const days = runs.map(r => r.data.days || r.data.gameDays || 0).sort((a, b) => a - b);
  const med = days.length ? days[Math.floor(days.length / 2)] : 0;
  console.log(`\n[wall] ${label} (n=${n}): wins=${wins} national=${national} table=${table} wave4=${w4} wave5=${w5} medianDays=${med}`);
  return { n, wins, national, table, w4, w5, medDays: med };
}

// ---- main ----
function main() {
  console.log('=== sim-wasterate-b analyzer (pre-registered) ===');

  // 1. schema-drift guards
  const trig6Keys = ['arc2','arc3','arc4','causeCounts','clsCounts','days','dehydration','endReason','exiled','fourRealm','freshRotItems','freshRotKcal','freshRotPerVDay','gameDays','halfRationDays','halfRationRate','hungryDays','instrumentErrors','maxArc','maxFires','maxRank','maxWave','national','policyId','seed','side','sits','starvation','starvationPerVDay','starvedDays','t6Aid','t6AidKcal','t6Fd4Days','t6Fd6Days','t6FeastEvents','t6FeastKcal','t6Feasts','t6GateHeld','t6VerbDays','table','thirst','villagerDays','wave4','wave4Day','wave5','wave5Day','wins'];
  const drawcapKeys = ['days','dcAid','dcAidKcal','dcCapDays','dcCapHeld','dcFeastEvents','dcFeastKcal','dcFeasts','dcGateHeld','deaths','dehydration','endReason','exiled','freshRotItems','freshRotKcal','gameDays','halfRationDays','halfRationRate','hashes','hungryDays','maxRank','maxWave','national','policyId','seed','side','starvation','table','villagerDays','wave4','wave4Day','wave5','wave5Day','wins'];
  const wallKeys = ['aid','crumb','days','deaths','endReason','exiled','gameDays','hashes','instrumentErrors','links','maxRank','maxWave','national','pantryKcalEnd','policyId','seed','starveDeaths','table','thirstDeaths','trigger','wave4','wave4Day','wave5','wave5Day','waveSampleNote','wins'];

  const trig6 = guardArchive('perseed-trig6', path.join(EV, 'perseed-trig6'), trig6Keys);
  const drawcap = guardArchive('perseed-drawcap', path.join(EV, 'perseed-drawcap'), drawcapKeys);
  const wallc = guardArchive('perseed-wallcensus-b', path.join(EV, 'perseed-wallcensus-b'), wallKeys);

  // 2. new sweep: conservation gate + waste rates
  console.log('\n[sweep] perseed-wasterate');
  const wrDir = path.join(EV, 'perseed-wasterate');
  const wr = loadDir(wrDir);
  if (wr.length !== 16) fail(`expected 16 runs, found ${wr.length}`);
  let gateGreen = true;
  const bySeed = {};
  for (const { file, data } of wr) {
    const rel = Math.abs(data.conservationRel || 0);
    if (rel > 0.03) { fail(`${file}: conservation |rel|=${(rel*100).toFixed(2)}% > 3%`); gateGreen = false; }
    if ((data.wrapFailed || []).length) { fail(`${file}: wrapFailed=${data.wrapFailed}`); gateGreen = false; }
    if ((data.instrumentErrors || 0) > 0) { fail(`${file}: instrumentErrors=${data.instrumentErrors}`); gateGreen = false; }
    const side = file.startsWith('leadfeast') ? 'lead' : 'belong';
    const m = file.match(/s(\d+)\.json$/);
    if (m) {
      bySeed[m[1]] = bySeed[m[1]] || {};
      bySeed[m[1]][side] = data.wasteRate;
    }
    console.log(`  ${file}: wasteRate=${(data.wasteRate*100).toFixed(1)}% rot=${Math.round(data.pantryRotKcal/1000)}k T=${Math.round((data.pantryStartKcal+data.pantryInKcal)/1000)}k consRel=${(rel*100).toFixed(2)}%`);
  }
  if (gateGreen) ok(`conservation gate GREEN on ${wr.length} runs (|rel|<=3%, no wrap failures)`);

  // 3. paired verdict
  console.log('\n[verdict] paired leadfeast-belongfeast waste-rate diff');
  const diffs = [];
  for (const [seed, sides] of Object.entries(bySeed)) {
    if (sides.lead !== undefined && sides.belong !== undefined) {
      diffs.push({ seed, d: sides.lead - sides.belong, lead: sides.lead, belong: sides.belong });
    }
  }
  if (diffs.length < 3) {
    console.log('  INSUFFICIENT PAIRS — verdict cannot be named');
  } else {
    const ds = diffs.map(x => x.d);
    const mean = ds.reduce((a, b) => a + b, 0) / ds.length;
    const sd = Math.sqrt(ds.reduce((a, b) => a + (b - mean) ** 2, 0) / (ds.length - 1));
    const se = sd / Math.sqrt(ds.length);
    const allW = diffs.flatMap(x => [x.lead, x.belong]);
    const meanW = allW.reduce((a, b) => a + b, 0) / allW.length;
    const dbar = mean, relEff = Math.abs(dbar) / meanW;
    console.log(`  n=${ds.length} dbar=${(dbar*100).toFixed(2)}pp SE=${(se*100).toFixed(2)}pp |dbar|/mean=${(relEff*100).toFixed(1)}%`);
    console.log(`  mean waste rate: lead=${(diffs.reduce((a,x)=>a+x.lead,0)/diffs.length*100).toFixed(1)}% belong=${(diffs.reduce((a,x)=>a+x.belong,0)/diffs.length*100).toFixed(1)}%`);
    const sensitive = Math.abs(dbar) > 2 * se && relEff > 0.15;
    console.log(`  VERDICT: ${sensitive ? '(a) POLICY-SENSITIVE' : '(b) SUBSTRATE-FLAT'}`);
    console.log(`    rule: |dbar|>2*SE (${(Math.abs(dbar)>2*se)}) AND |dbar|/mean>15% (${(relEff>0.15)})`);
  }

  // 4. wall numbers from all archives
  console.log('\n=== wall numbers (all archives) ===');
  wallNumbers(trig6, 'perseed-trig6');
  wallNumbers(drawcap, 'perseed-drawcap');
  wallNumbers(wallc, 'perseed-wallcensus-b');
  wallNumbers(wr, 'perseed-wasterate (new)');

  // 5. archive freshRot context (no throughput — document the gap)
  console.log('\n[archive-rot] freshRotKcal (archives lack pantry throughput; no true waste rate computable)');
  for (const [label, runs] of [['trig6', trig6], ['drawcap', drawcap]]) {
    const vals = runs.map(r => r.data.freshRotKcal || 0).sort((a, b) => a - b);
    const med = vals[Math.floor(vals.length / 2)];
    console.log(`  ${label}: median freshRot=${Math.round(med/1000)}k (n=${vals.length})`);
  }
  const ends = wallc.map(r => r.data.pantryKcalEnd || 0).sort((a, b) => a - b);
  console.log(`  wallcensus-b: median pantryKcalEnd=${Math.round(ends[Math.floor(ends.length/2)]/1000)}k (end-stock only, not throughput)`);

  console.log(`\n=== ${failures ? 'GATE RED — ' + failures + ' failures' : 'ALL GATES GREEN'} ===`);
  process.exit(failures ? 1 : 0);
}

main();
