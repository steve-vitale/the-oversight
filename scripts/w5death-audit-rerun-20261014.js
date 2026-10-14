#!/usr/bin/env node
// scripts/w5death-audit-rerun-20261014.js — STEP 1 re-verification driver
// (sim-siegedef3 arm, 2026-10-14).
//
// Re-runs the w5death attribution instrument (scripts/w5death-audit-20261014.js)
// on the CURRENT tip to re-verify the motivating numbers before any lever is
// built: 84% of post-unlock scholar deaths AT HAVEN, 50% killed by wave-5
// monsters. Writes a NEW json (never clobbers the committed audit).
//
// Substrate: leadfeast policy + FEASTSCALE_R13=1, 180d death-aware, the
// audit's seed set (11/22/33/44/55/66/77/88/303).
'use strict';
const fs = require('fs');
const path = require('path');
const { runInstrumentedSeed, SEEDS, DAYS } = require('./w5death-audit-20261014');

const OUT = path.join(__dirname, '..', 'evidence', '2026-10-14', 'w5death-audit-rerun-20261014.json');

function monsterWaveFromRow(row) {
  return row;
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    console.log(`[w5death-rerun] seed ${seed} ...`);
    const row = await runInstrumentedSeed(seed);
    rows.push(row);
    const u = row.unlockDay5 != null ? `unlocked d${row.unlockDay5}` : 'never unlocked';
    console.log(`  -> ${row.days}d ${row.endReason} wave≤${row.maxUnlocked} ${u} table=${row.tableEver ? 'd' + row.tableDay : 'no'} deaths=${row.playerDeaths.length}`);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString(), seeds: SEEDS, days: DAYS, policy: 'leadfeast+FEASTSCALE_R13=1', note: 'STEP-1 re-verification on current tip', rows }, null, 1));
  console.log(`wrote ${OUT}`);

  // --- motivating-number re-verification ---
  let postUnlock = 0, atHaven = 0, w5 = 0, combat = 0, starv = 0;
  const unlockers = [];
  for (const r of rows) {
    if (r.unlockDay5 == null) continue;
    unlockers.push(r.seed);
    for (const d of r.playerDeaths) {
      if (d.day < r.unlockDay5) continue;
      postUnlock++;
      const epithet = (d.loc && d.loc.epithet) || '?';
      const atH = epithet.toLowerCase().includes('haven');
      if (atH) atHaven++;
      if (d.cause === 'combat') combat++;
      if (/starv/i.test(d.cause)) starv++;
      let w5kill = false;
      if (d.fight && d.fight.monsters) {
        for (const m of d.fight.monsters) if (m.wave === 5) { w5kill = true; break; }
      }
      if (w5kill) w5++;
    }
  }
  console.log('---');
  console.log(`unlockers: [${unlockers.join(',')}]`);
  console.log(`post-unlock scholar deaths: ${postUnlock}`);
  console.log(`at-Haven share: ${(atHaven / Math.max(1, postUnlock) * 100).toFixed(1)}% (motivating: 84%)`);
  console.log(`w5-killer share: ${(w5 / Math.max(1, postUnlock) * 100).toFixed(1)}% (motivating: 50%)`);
  console.log(`combat share: ${(combat / Math.max(1, postUnlock) * 100).toFixed(1)}% (motivating: 30/32=93.8%)`);
  console.log(`starvation deaths: ${starv} (motivating: 0)`);

  // wall numbers
  const nat = rows.filter(r => r.nationalDays > 0).length;
  const tab = rows.filter(r => r.tableEver).length;
  const won = rows.filter(r => r.won).length;
  const w4 = rows.filter(r => r.maxUnlocked >= 4).length;
  const w5u = rows.filter(r => r.maxUnlocked >= 5).length;
  const med = rows.map(r => r.days).sort((a, b) => a - b)[Math.floor(rows.length / 2)];
  console.log(`WALL: national ${nat}/${rows.length} table ${tab}/${rows.length} won ${won}/${rows.length} wave4 ${w4}/${rows.length} wave5 ${w5u}/${rows.length} medianDays ${med}`);

  // hard gate for STEP 1
  const atHavenOk = (atHaven / Math.max(1, postUnlock)) >= 0.70;
  const w5Ok = (w5 / Math.max(1, postUnlock)) >= 0.35;
  console.log(`STEP1 GATE: atHaven>=70% ${atHavenOk ? 'PASS' : 'FAIL'}; w5killers>=35% ${w5Ok ? 'PASS' : 'FAIL'}`);
  if (!atHavenOk || !w5Ok) { console.log('STEP1 GATE FAILED — do not build on a stale finding'); process.exit(2); }
  console.log('STEP1 GATE PASSED — motivating numbers reproduce');
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
