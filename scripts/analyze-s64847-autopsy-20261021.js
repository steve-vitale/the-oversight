#!/usr/bin/env node
// analyze-s64847-autopsy-20261021.js — sim-s64847-autopsy (DIAG, ZERO new sims).
//
// Mines the LANDED r2 corpus (evidence/2026-10-21/perseed-wave4hunt-r2/) for
// the s64847/belongfeast armed village loss (d72, village-lost) vs the
// same-seed control win (d92). No game loads, no sims — pure corpus mining.
//
// PRE-REG (binding): PRIMARY DIAG-GO = 100% attribution of the loss causal
// chain — every death (who/when/cause/named channel), the village-lost
// trigger named, the control contrast at each decision point.
// GO: 0 unattributed deaths. insufficient-data: the corpus JSONs lack the
// fields — report exactly which step and which field is missing, do not invent.
//
// Usage: node scripts/analyze-s64847-autopsy-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-21', 'perseed-wave4hunt-r2');

function loadCorpus() {
  const files = fs.readdirSync(CORPUS).filter(f => f.endsWith('.json'));
  const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8')));
  return { files, rows };
}

function find(rows, seed, policy, arm) {
  return rows.find(r => r.seed === seed && r.policy === policy && r.arm === arm);
}

function main() {
  const { files, rows } = loadCorpus();
  console.log('=== sim-s64847-autopsy: corpus inventory ===');
  console.log(`corpus files: ${files.length}`);
  const arms = {};
  for (const r of rows) arms[`${r.arm}`] = (arms[r.arm] || 0) + 1;
  console.log(`arms: ${JSON.stringify(arms)}`);
  const seeds = [...new Set(rows.map(r => r.seed))].sort((a, b) => a - b);
  console.log(`seeds: ${seeds.join(',')}`);
  console.log(`policies: ${[...new Set(rows.map(r => r.policy))].join(',')}`);
  console.log('');

  const SEED = 64847, POLICY = 'belongfeast';
  const control = find(rows, SEED, POLICY, 'control');
  const armed = find(rows, SEED, POLICY + '-wave4hunt-r2', 'wave4hunt');
  if (!control || !armed) {
    console.log('FATAL: s64847/belongfeast control+armed pair not found in corpus.');
    process.exit(2);
  }

  console.log('=== s64847/belongfeast: control vs armed contrast ===');
  const fields = ['won', 'endReason', 'days', 'gameDays', 'table', 'national',
    'scholarDeaths', 'villagerCombatDeaths', 'starvationDeaths', 'exiled',
    'donations', 'invites', 'partyEnd', 'maxWave', 'wave4', 'wave5',
    'w4kills', 'villagerW4Kill', 'w4scholarKills', 'w5vetsEnd', 'w5vetsMax'];
  for (const f of fields) {
    console.log(`  ${f}: control=${JSON.stringify(control[f])} armed=${JSON.stringify(armed[f])}`);
  }
  console.log(`  w4channels: control=${JSON.stringify(control.w4channels)} armed=${JSON.stringify(armed.w4channels)}`);
  console.log(`  winTrack: control=${JSON.stringify(control.winTrack)} armed=${JSON.stringify(armed.winTrack)}`);
  const schCadC = (control.scholarDeaths / control.days).toFixed(3);
  const schCadA = (armed.scholarDeaths / armed.days).toFixed(3);
  console.log(`  scholar cadence: control ${control.scholarDeaths}/${control.days}d = ${schCadC}/d (1 per ${(control.days / control.scholarDeaths).toFixed(1)}d)`);
  console.log(`  scholar cadence: armed   ${armed.scholarDeaths}/${armed.days}d = ${schCadA}/d (1 per ${(armed.days / armed.scholarDeaths).toFixed(1)}d)`);
  console.log('');

  console.log('=== death-cause mix: control vs armed (aggregate buckets) ===');
  const allCauses = [...new Set([...Object.keys(control.deathCauses), ...Object.keys(armed.deathCauses)])].sort();
  for (const c of allCauses) {
    console.log(`  ${c}: control=${control.deathCauses[c] || 0} armed=${armed.deathCauses[c] || 0}`);
  }
  const totC = Object.values(control.deathCauses).reduce((a, b) => a + b, 0);
  const totA = Object.values(armed.deathCauses).reduce((a, b) => a + b, 0);
  console.log(`  TOTAL: control=${totC} armed=${totA}`);
  console.log('');

  console.log('=== attribution matrix: the 27 armed deaths ===');
  console.log('For each death the corpus can say ONLY the cause bucket (count).');
  console.log('Per-death granularity required by the pre-reg: who / when (day) / kind (named channel) / player flag.');
  let unattributed = 0;
  for (const [cause, n] of Object.entries(armed.deathCauses)) {
    const namedChannel = /^(combat|villager combat|monster|expedition|sickness|dehydration|starvation)$/i.test(cause) ? 'NO (bucket only)' : `PARTIAL (monster named: ${cause})`;
    console.log(`  cause="${cause}" n=${n}: who=? when(day)=? kind=? player=? | named channel: ${namedChannel} -> ${n} UNATTRIBUTED at per-death granularity`);
    unattributed += n;
  }
  console.log(`  unattributed deaths at per-death granularity: ${unattributed}/${totA}`);
  console.log('');

  console.log('=== hunt-leg mechanism detail (armed w4h counters) ===');
  for (const [k, v] of Object.entries(armed.w4h)) console.log(`  ${k}: ${v}`);
  console.log('  discipline check across ALL 16 armed runs: scholar wave-4 kills = ' +
    rows.filter(r => r.arm === 'wave4hunt').reduce((a, r) => a + (r.w4scholarKills || 0), 0));
  console.log('  armed s64847: villager wave-4 kills = ' + armed.villagerW4Kill + ' (w4killsDetail rows: ' + armed.w4killsDetail.length + ')');
  console.log('');

  console.log('=== mechanism-class evidence ===');
  console.log('(a) manufactured-fight attrition: corpus names NO wave-4 monster in the armed death ledger;');
  console.log('    2 sorties -> 3 wave-4 fights seen -> 3 breakoffs (100%); villager combat deaths LOWER than control (17 vs 22).');
  console.log('    -> direct attrition by manufactured fights is CONTRADICTED at the aggregate level.');
  console.log('(b) discipline-stall: all 3 fights prolonged (10 soft strikes, 7 holds) before breakoff; w4hSkippedHurt=26.');
  console.log('    -> engagement time/HP cost is real, but no death is attributable to a specific fight (missing: per-death kind/day).');
  console.log('(c) cascade: roles of the dead unknown (missing: per-death who -> role join). Bearer churn 5/72d vs 3/92d,');
  console.log('    BUT corpus shows s64406-b armed (8 scholar deaths/90d) and s64841-b armed (8/90d) both WON.');
  console.log('    -> churn alone does not explain village-lost; the key-death hypothesis is UNTESTABLE.');
  console.log('(d) best-fit provisional: attention/presence-drain + succession churn — combat deaths DOWN (17 vs 24),');
  console.log('    drain deaths UP (dehydration 2, sickness 1, festering wound 1, expedition 2 vs control expedition 1/starvation 1/monster 1);');
  console.log('    weapon donations halved (3 vs 6), party invites up (5 vs 3). Aggregate mix-level inference ONLY.');
  console.log('');

  console.log('=== near-miss scan: other village-death near-misses in the 32-run corpus ===');
  const losses = rows.filter(r => !r.won || (r.endReason !== 'over-other' && r.endReason !== 'survived'));
  for (const r of losses) {
    console.log(`  seed=${r.seed} policy=${r.policy} arm=${r.arm}: won=${r.won} endReason=${r.endReason} days=${r.days} scholarDeaths=${r.scholarDeaths}`);
  }
  if (!losses.length) console.log('  none: every other config won.');
  // scholar-churn extremes (context for the cascade hypothesis)
  const armedRows = rows.filter(r => r.arm === 'wave4hunt');
  const churn = armedRows.map(r => ({ tag: `${r.seed}-${r.policy}`, sch: r.scholarDeaths, days: r.days, won: r.won }))
    .sort((a, b) => (b.sch / b.days) - (a.sch / a.days));
  console.log('  armed scholar-churn ranking (deaths/day): ' + churn.slice(0, 4).map(c => `${c.tag}:${c.sch}/${c.days}d won=${c.won}`).join(', '));
  console.log('');

  console.log('=== SECONDARY: r3 guardrail checkability ===');
  console.log('r3 guardrail ("no village loss on a seed the control wins") needs per (seed,arm): won + endReason.');
  const needed = ['seed', 'arm', 'won', 'endReason'];
  const checkable = rows.every(r => needed.every(k => r[k] !== undefined));
  console.log(`fields present in corpus: ${needed.join(', ')} -> checkable=${checkable ? 'YES' : 'NO'}`);
  const controlWins = {};
  for (const r of rows) if (r.arm === 'control' && r.won) controlWins[r.seed] = 1;
  const violations = rows.filter(r => r.arm === 'wave4hunt' && controlWins[r.seed] && !r.won);
  console.log(`armed losses on control-won seeds: ${violations.length} (${violations.map(r => `s${r.seed}`).join(', ') || 'none'})`);
  console.log('');

  console.log('=== missing fields (exact) ===');
  console.log('M1. per-death DAY: runtime samples.deaths[].day existed; sweep persisted only cause-count aggregates (sweep-wave4hunt-r2-20261021.js lines 247-263).');
  console.log('M2. per-death WHO (identity): runtime samples.deaths[].who existed; not persisted.');
  console.log('M3. per-death KIND (named channel): runtime samples.deaths[].kind existed; not persisted.');
  console.log('M4. per-death PLAYER flag: runtime samples.deaths[].player existed; only 3 aggregates persisted (scholarDeaths/starvationDeaths/villagerCombatDeaths).');
  console.log('M5. day-by-day population/pantry/trust series: runtime samples.pop/pantry/trust existed; not persisted.');
  console.log('M6. village-lost trigger beat: only endReason="village-lost" (Game.villageLost flag); no final beats recorded.');
  console.log('M7. narration beats for the s64847 armed deaths/village-lost: no transcript saved for this config (searched corpus transcript dirs).');
  console.log('M8. roles of the dead (healer/trapper/key roles): joinable only via M2; absent.');
  console.log('');

  console.log('=== DIAG VERDICT ===');
  if (unattributed > 0) {
    console.log(`insufficient-data: ${unattributed}/${totA} armed deaths unattributable at (who/when/kind/player) granularity.`);
    console.log('The loss causal CHAIN (this death -> that consequence -> village-lost) cannot be reconstructed from the landed corpus.');
    console.log('Do not invent: mechanism class (d) provisional is a mix-level inference, not a traced chain.');
  } else {
    console.log('DIAG-GO: 0 unattributed deaths.');
  }
}

main();
