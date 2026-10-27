#!/usr/bin/env node
// scripts/test-woundmill-gap-analyze.js — sim-woundmill-gap comparator
// (Triage A1, 2026-10-27). Pure corpus comparison: reads the fresh
// control corpus (pre-rule) and the armed corpus (post-rule) produced
// by scripts/test-defwound-diag-sweep.js --one armed <seed> with EVID
// pointed at each corpus dir, and judges the pre-registered legs in
// evidence/2026-10-27/sim-woundmill-gap.md §2. No Game reads, no sims.
//   node scripts/test-woundmill-gap-analyze.js [controlDir] [armedDir]
// Defaults: evidence/2026-10-27/perseed-woundmill-control and
// evidence/2026-10-27/perseed-woundmill-armed.
// Exit 1 on any corpus-gate or pre-registered-leg failure.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { analyzeDefwound } = require('./policies/defwound-diag');
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

function loadCorpus(dir) {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(dir, `s${seed}-armed.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return rows;
}
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function summarize(rows) {
  const perSeed = rows.map(r => {
    const defStore = { resolveFights: (r.defwound && r.defwound.resolveFights) || [] };
    const oldStore = r.oldcore || { removals: [] };
    const finalPresent = (r.oldcore && r.oldcore.finalPresent) || [];
    const a = analyzeDefwound(defStore, oldStore, finalPresent);
    const raidRows = defStore.resolveFights.filter(x => x.raid);
    const met = raidRows.filter(x => x.belowLineStart);
    const metFlee = met.filter(x => x.outcome === 'mFlee');
    const metFinish = met.filter(x => x.outcome === 'vKill');
    const metCripple = met.filter(x => x.mHpStartFrac != null && x.mHpStartFrac <= 0.10);
    const metCrippleFinish = metCripple.filter(x => x.outcome === 'vKill');
    return {
      seed: r.seed, won: r.won | 0, days: r.days, deathTotal: r.deathTotal | 0,
      nationalEver: r.nationalEver | 0, waveReach: r.waveReach || 1,
      defenderFights: a.defender.fights,
      defenderByOutcome: a.defender.byOutcome,
      defenderVDie: a.defender.byOutcome.vDie || 0,
      defenderVKills: a.defender.byOutcome.vKill || 0,
      met: met.length, metFlee: metFlee.length, metFinish: metFinish.length,
      metCripple: metCripple.length, metCrippleFinish: metCrippleFinish.length,
      metFinishRounds: metFinish.map(x => x.rounds),
      metFinishWaves: metFinish.map(x => x.wave),
      remeetPreWounded: a.remeet.preWounded,
      fates: a.fates,
      corpusOk: r.defwound && r.defwound.diag.errs === 0
        && Object.values(r.defwound.diag.overflow || {}).every(v => v === 0)
        && r.spawnsrc && r.spawnsrc.diag.errs === 0
        && r.raftdraft && r.raftdraft.diag.errs === 0
        && r.oldcore && r.oldcore.diag.errs === 0,
    };
  });
  const sum = f => perSeed.reduce((t, s) => t + f(s), 0);
  return {
    perSeed,
    n: perSeed.length,
    wins: sum(s => s.won),
    deaths: sum(s => s.deathTotal),
    medianDays: medianOf(perSeed.map(s => s.days)),
    nationalEver: sum(s => s.nationalEver),
    wave4: perSeed.filter(s => s.waveReach >= 4).length,
    wave5: perSeed.filter(s => s.waveReach >= 5).length,
    defenderFights: sum(s => s.defenderFights),
    defenderVDie: sum(s => s.defenderVDie),
    defenderVKills: sum(s => s.defenderVKills),
    met: sum(s => s.met),
    metFlee: sum(s => s.metFlee),
    metFinish: sum(s => s.metFinish),
    metCripple: sum(s => s.metCripple),
    metCrippleFinish: sum(s => s.metCrippleFinish),
    metFinishSeeds: perSeed.filter(s => s.metFinish > 0).length,
    corpusOk: perSeed.every(s => s.corpusOk),
  };
}
function main() {
  const controlDir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-27', 'perseed-woundmill-control');
  const armedDir = process.argv[3] || path.join(REPO, 'evidence', '2026-10-27', 'perseed-woundmill-armed');
  const c = summarize(loadCorpus(controlDir));
  const a = summarize(loadCorpus(armedDir));
  console.log('=== sim-woundmill-gap comparison (identical seeds 73671-73678) ===');
  console.log(`CONTROL: n=${c.n} wins=${c.wins} deaths=${c.deaths} medD=${c.medianDays} natEver=${c.nationalEver} w4=${c.wave4} w5=${c.wave5} defFights=${c.defenderFights} defVDie=${c.defenderVDie} defVKills=${c.defenderVKills}`);
  console.log(`  met=${c.met} metFlee=${c.metFlee} metFinish=${c.metFinish} metCripple(<=10%)=${c.metCripple} corpusOk=${c.corpusOk}`);
  console.log(`ARMED:   n=${a.n} wins=${a.wins} deaths=${a.deaths} medD=${a.medianDays} natEver=${a.nationalEver} w4=${a.wave4} w5=${a.wave5} defFights=${a.defenderFights} defVDie=${a.defenderVDie} defVKills=${a.defenderVKills}`);
  console.log(`  met=${a.met} metFlee=${a.metFlee} metFinish=${a.metFinish} metCripple(<=10%)=${a.metCripple} metCrippleFinish=${a.metCrippleFinish} finishSeeds=${a.metFinishSeeds} corpusOk=${a.corpusOk}`);
  for (const s of a.perSeed) {
    const cs = c.perSeed.find(x => x.seed === s.seed);
    console.log(`  seed ${s.seed}: won ${cs.won}->${s.won} deaths ${cs.deathTotal}->${s.deathTotal} met ${cs.met}->${s.met} metFlee ${cs.metFlee}->${s.metFlee} metFinish ${cs.metFinish}->${s.metFinish} (rounds ${JSON.stringify(s.metFinishRounds)} waves ${JSON.stringify(s.metFinishWaves)}) defVDie ${cs.defenderVDie}->${s.defenderVDie}`);
  }
  const legs = [
    ['CORPUS control 8/8 + armed 8/8, errs 0', c.corpusOk && a.corpusOk && c.n === 8 && a.n === 8],
    ['P1 meet-finishes >= 5 band-wide', a.metFinish >= 5],
    ['P1 meet-finishes on >= 2 seeds', a.metFinishSeeds >= 2],
    ['P2 met mFlee DOWN vs control', a.metFlee < c.metFlee],
    ['G1 deaths <= control + 10%', a.deaths <= Math.ceil(c.deaths * 1.10)],
    ['G2 wins >= control wins', a.wins >= c.wins],
    ['G3 defender vDie <= control + 3', a.defenderVDie <= c.defenderVDie + 3],
  ];
  let fail = 0;
  for (const [name, ok] of legs) { console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) fail++; }
  console.log(fail ? `\n${fail} leg(s) FAILED — NO-GO per pre-registration` : '\nALL LEGS PASS');
  process.exit(fail ? 1 : 0);
}
if (require.main === module) main();
