#!/usr/bin/env node
// scripts/test-fieldfinish-resume.js — recovery driver for
// sim-fieldfinish-a. The full sweep process vanished mid-run (armed
// 73675 unfinished, no node process left, no summary written) with
// 12/16 rows already on disk via incremental writes. Re-running the
// whole sweep would waste ~30 min and risk the same disappearance,
// so this driver finishes the missing rows ONE SEED PER INVOCATION
// (short-lived processes) and then rebuilds summary.json from the
// rows on disk with the SAME gate logic as the sweep.
//   node scripts/test-fieldfinish-resume.js --run-seed 73675 --pid armed
//   node scripts/test-fieldfinish-resume.js --summarize
// --run-seed uses the sweep's runOne (identical seeds, identical
// policy, identical writer) — resumed rows are byte-equivalent to
// full-sweep rows. --summarize exits 1 on G2/G3 failure, exactly
// like the sweep.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { runOne, aggregate, writeRowViaWriter } = require('./test-fieldfinish-diag-sweep');

const FOCUS_SEEDS = [73675, 73677, 73678];
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];

async function runSeedMode(seed, pid) {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-fieldfinish-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, parseInt(process.env.DAYS || '180', 10) || 180, evidDir);
  const a = row.fieldfinish.analysis;
  console.log(`RESUME-ROW [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} wave=${row.waveReach} ${a ? `ffW3=${a.w3.fights} woundedStrictW3=${a.w3.woundedRepeatsStrict}` : 'snapshot-only'}`);
}

async function summarizeMode() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-fieldfinish-a');
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of ['baseline', 'armed']) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
  }
  const byPolicy = { baseline: aggregate(rows, 'baseline'), armed: aggregate(rows, 'armed') };
  const g2 = [];
  for (const seed of SEEDS) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
    const facedOk = !!c && !!a && JSON.stringify(c.fieldfinish.faced) === JSON.stringify(a.fieldfinish.faced);
    const killsOk = !!c && !!a && JSON.stringify((c.fieldfinish.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.fieldfinish.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
    g2.push({ seed, ok, facedOk, killsOk, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const armedRows = rows.filter(r => r.policy === 'armed');
  const baselineRows = rows.filter(r => r.policy === 'baseline');
  const g3Pass = rows.length === SEEDS.length * 2 && rows.every(r => r.days > 0 && r.fieldfinish && r.fieldfinish.faced && r.fieldfinish.logEntries)
    && armedRows.length === SEEDS.length && armedRows.every(r => Array.isArray(r.fieldfinish.fieldFights) && r.fieldfinish.analysis && r.fieldfinish.analysis.w3)
    && baselineRows.length === SEEDS.length && baselineRows.every(r => r.fieldfinish.analysis === null && !r.fieldfinish.fieldFights);
  const focusDetail = armedRows.filter(r => FOCUS_SEEDS.indexOf(r.seed) >= 0).map(r => ({
    seed: r.seed,
    woundedStrictW3: r.fieldfinish.analysis.w3.woundedRepeatsStrict,
    woundedRepeatsW3: r.fieldfinish.analysis.woundedRepeatsW3.map(w => ({ mid: w.fight.mid, day: w.fight.day, vid: w.fight.vid, startHp: w.fight.startHp, startFrac: w.fight.startFrac, endHp: w.fight.endHp, prevEndHp: w.prevEndHp, prevOutcome: w.prevOutcome, volleyDmg: w.fight.volleyDmg })),
    perTypeW3: Object.keys(r.fieldfinish.analysis.w3.perType || {}).map(mid => ({ mid, fights: r.fieldfinish.analysis.w3.perType[mid].fights, outcomes: r.fieldfinish.analysis.w3.perType[mid].outcomes, woundedRepeats: r.fieldfinish.analysis.w3.perType[mid].woundedRepeats })),
  }));
  const focusPassCount = focusDetail.filter(f => f.woundedStrictW3 >= 1).length;
  const bandStrict = byPolicy.armed.field.woundedStrictW3;
  const hypothesisIn = focusPassCount >= 2 && bandStrict >= 5;
  const report = {
    label: 'sim-fieldfinish-a pilot', seeds: SEEDS, days: 180, rows, byPolicy,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass, focusDetail, focusPassCount, bandStrictW3: bandStrict },
    verdictInputs: { g2Pass, g3Pass, focusPassCount, bandStrictW3: bandStrict, focusBar: 2, bandBar: 5 },
    verdict: hypothesisIn ? 'HYPOTHESIS-IN' : 'HYPOTHESIS-OUT',
    verdictRule: 'IN iff >= 2 of focus seeds 73675/73677/73678 each carry >= 1 STRICT wave-3+ wounded-repeat AND band-wide >= 5 wave-3+ STRICT wounded-repeats. OUT otherwise.',
    recoveryNote: 'Full sweep process vanished mid-run at armed 73675 (no node process, no summary); 12/16 rows survived via incremental writes; missing armed rows 73675/73676/73677/73678 completed one seed per invocation through this driver using the sweep runOne; summary rebuilt from rows on disk with identical gate logic.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-fieldfinish-a pilot (resumed) ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} deathTotal=${b.deathTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} field=${JSON.stringify(b.field)} mHpAtMFlee=${JSON.stringify(b.mHpAtMFlee)} mHpAtVKill=${JSON.stringify(b.mHpAtVKill)}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical; faced-agree ${g2.filter(x => x.facedOk).length}/${g2.length}, kills-agree ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  Focus (strict wounded-repeats): ${JSON.stringify(focusDetail.map(f => ({ seed: f.seed, n: f.woundedStrictW3 })))} -> ${focusPassCount}/3 seeds`);
  console.log(`  Band strict wounded-repeats W3: ${bandStrict} (bar 5)`);
  console.log(`  HYPOTHESIS: ${report.verdict} -> ${summaryPath}`);
  if (!g2Pass || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--run-seed')) {
    const seed = parseInt(args[args.indexOf('--run-seed') + 1], 10);
    const pid = args.includes('--pid') ? args[args.indexOf('--pid') + 1] : 'armed';
    return runSeedMode(seed, pid);
  }
  if (args.includes('--summarize')) return summarizeMode();
  throw new Error('usage: --run-seed SEED [--pid armed] | --summarize');
}
if (require.main === module) main().catch(e => { console.error('FIELDFINISH RESUME FAILED:', (e && e.stack) || e); process.exit(1); });
